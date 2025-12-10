using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;
using NordexFood.Models.Api;
using System.Globalization;
using System.Text.RegularExpressions;
using Examine;
using Umbraco.Cms.Infrastructure.Examine;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services.Navigation;

namespace NordexFood.Controllers.Api;

/// <summary>
/// Content search API controller that provides comprehensive search functionality for content pages,
/// including text search across page properties and block content (BlockList and BlockGrid).
/// Supports multilingual content, tag filtering, and pagination.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ContentSearchController : ControllerBase
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IExamineManager _examineManager;
    private readonly ILogger<ContentSearchController> _logger;
    private readonly IDocumentNavigationQueryService _documentNavigationQueryService;

    public ContentSearchController(
        IUmbracoContextAccessor umbracoContextAccessor,
        IExamineManager examineManager,
        ILogger<ContentSearchController> logger,
        IDocumentNavigationQueryService documentNavigationQueryService)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _examineManager = examineManager;
        _logger = logger;
        _documentNavigationQueryService = documentNavigationQueryService;
    }

    /// <summary>
    /// Search content pages with comprehensive text search and filtering capabilities.
    /// 
    /// Text search is performed across:
    /// - Page title and subtitle
    /// - Body text content  
    /// - Block content (BlockList and BlockGrid items) - automatically includes all block types
    /// - Nested block structures and their properties
    /// 
    /// The search automatically discovers and searches all block types,
    /// ensuring new block types are included without code changes.
    /// </summary>
    /// <param name="request">Search parameters</param>
    /// <returns>Search results</returns>
    [HttpGet]
    [HttpPost]
    [ProducesResponseType(typeof(PageSearchResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public ActionResult<PageSearchResponse> Search([FromQuery] PageSearchRequest? request = null, [FromBody] PageSearchRequest? bodyRequest = null)
    {
        try
        {
            // Use body request if available (POST), otherwise query request (GET)
            var searchRequest = bodyRequest ?? request ?? new PageSearchRequest();

            if (!_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
            {
                return BadRequest("Umbraco context not available");
            }

            var contentCache = umbracoContext.Content;
            if (contentCache == null)
            {
                return BadRequest("Content cache not available");
            }

            // Determine start node
            IPublishedContent? startNode = null;
            if (searchRequest.StartNodeId.HasValue)
            {
                startNode = contentCache.GetById(searchRequest.StartNodeId.Value);
                if (startNode == null)
                {
                    return BadRequest($"Start node with ID {searchRequest.StartNodeId} not found");
                }
            }
            else
            {
                // Use navigation service to get root nodes
                var rootNodeKeys = _documentNavigationQueryService.TryGetRootKeys(out var rootKeys) ? rootKeys : new List<Guid>();
                if (rootNodeKeys.Any())
                {
                    startNode = contentCache.GetById(rootNodeKeys.First());
                }
                
                if (startNode == null)
                {
                    return BadRequest("No root content found");
                }
            }

            // Set culture if specified
            if (!string.IsNullOrEmpty(searchRequest.Lang))
            {
                try
                {
                    var culture = CultureInfo.GetCultureInfo(searchRequest.Lang);
                    Thread.CurrentThread.CurrentCulture = culture;
                    Thread.CurrentThread.CurrentUICulture = culture;
                }
                catch (CultureNotFoundException)
                {
                    _logger.LogWarning("Invalid culture specified: {Culture}", searchRequest.Lang);
                }
            }

            var results = new List<PageSearchItem>();

            // Get all content pages from start node
            var contentPages = GetContentPages(startNode, searchRequest);

            var excludeNodeId = searchRequest.ExcludeNode;

            if (excludeNodeId.HasValue)
            {
                contentPages = contentPages.Where(p => p.Id != excludeNodeId.Value);
            }

            // Apply filtering
            var filteredPages = ApplyFilters(contentPages, searchRequest);

            // Apply ordering
            var orderedPages = ApplyOrdering(filteredPages, searchRequest);

            // Convert to search items
            foreach (var page in orderedPages.Skip(searchRequest.Skip).Take(searchRequest.Take))
            {
                var item = ConvertToSearchItem(page, searchRequest.Lang);
                if (item != null)
                {
                    results.Add(item);
                }
            }

            return Ok(new PageSearchResponse
            {
                Total = orderedPages.Count(),
                Skip = searchRequest.Skip,
                Take = searchRequest.Take,
                Items = results
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during content search");
            return StatusCode(500, "An error occurred during search");
        }
    }

    private IEnumerable<IPublishedContent> GetContentPages(IPublishedContent startNode, PageSearchRequest request)
    {
        var pages = new List<IPublishedContent>();

        // Don't add start node - only search children/descendants
        // The start node should be excluded from search results

        // Add descendants if requested
        if (request.IncludeChildren)
        {
            // Use culture-aware recursive traversal to find ALL content pages at any depth
            // even when parent nodes are culture-specific or not contentPages
            var allDescendants = GetAllContentRecursive(startNode, request.Lang);
            var contentPages = allDescendants.Where(content => IsContentPage(content, request.Lang));
            pages.AddRange(contentPages);
        }

        return pages.Distinct();
    }

    private bool IsContentPage(IPublishedContent content, string? culture = null)
    {
        if (content.ContentType.Alias != "contentPage")
            return false;

        // If no specific culture is requested, use the general IsVisible check
        if (string.IsNullOrEmpty(culture))
            return content.IsVisible();

        // For specific culture, check if the content has that culture variant
        return content.Cultures.Any(c => c.Key.Equals(culture, StringComparison.OrdinalIgnoreCase)) && 
               content.IsVisible();
    }

    private IEnumerable<IPublishedContent> ApplyFilters(IEnumerable<IPublishedContent> pages, PageSearchRequest request)
    {
        var filteredPages = pages.AsEnumerable();

        // Filter by culture/language
        if (!string.IsNullOrEmpty(request.Lang))
        {
            filteredPages = filteredPages.Where(p => 
                p.Cultures.Any(c => c.Key.Equals(request.Lang, StringComparison.OrdinalIgnoreCase)));
        }

        // Filter by tags with group logic
        if (!string.IsNullOrEmpty(request.TagGroups))
        {
            _logger.LogInformation("Received TagGroups parameter: '{TagGroups}' (length: {Length})", request.TagGroups, request.TagGroups.Length);
            filteredPages = ApplyTagGroupFilter(filteredPages, request.TagGroups, request.Lang);
        }
        else if (!string.IsNullOrEmpty(request.Tags))
        {
            _logger.LogInformation("Received Tags parameter: '{Tags}' (length: {Length})", request.Tags, request.Tags.Length);
            filteredPages = ApplyTagGroupFilter(filteredPages, request.Tags, request.Lang);
        }

        // Apply text search
        if (!string.IsNullOrEmpty(request.Query))
        {
            var searchQuery = request.Query.ToLowerInvariant();
            
            filteredPages = filteredPages.Where(p =>
            {
                // Search in culture-specific page title and name
                var pageTitle = p.Value<string>("pageTitle", culture: request.Lang);
                var contentName = p.Name(request.Lang) ?? p.Name;
                
                // Search in page title
                if (pageTitle?.ToLowerInvariant().Contains(searchQuery) == true)
                {
                    return true;
                }
                
                // Search in content name
                if (contentName?.ToLowerInvariant().Contains(searchQuery) == true)
                {
                    return true;
                }

                // Search in culture-specific subtitle
                var subTitle = p.Value<string>("subTitle", culture: request.Lang);
                if (subTitle?.ToLowerInvariant().Contains(searchQuery) == true)
                {
                    return true;
                }

                // Search in culture-specific body text (strip HTML)
                var bodyText = p.Value<string>("bodyText", culture: request.Lang);
                if (!string.IsNullOrEmpty(bodyText))
                {
                    var plainText = StripHtml(bodyText).ToLowerInvariant();
                    if (plainText.Contains(searchQuery))
                    {
                        return true;
                    }
                }

                // Search in block content (BlockList and BlockGrid)
                if (SearchInBlockContent(p, searchQuery, request.Lang))
                {
                    return true;
                }

                return false;
            });
        }

        return filteredPages;
    }

    private IEnumerable<IPublishedContent> ApplyOrdering(IEnumerable<IPublishedContent> pages, PageSearchRequest request)
    {
        var orderBy = request.OrderBy?.ToLowerInvariant();
        var orderDirection = request.OrderDirection?.ToLowerInvariant();
        var isDescending = orderDirection == "desc";

        // Default to createDate desc if no ordering specified
        if (string.IsNullOrEmpty(orderBy))
        {
            orderBy = "createdate";
            isDescending = true;
        }

        return orderBy switch
        {
            "name" => isDescending 
                ? pages.OrderByDescending(p => p.Name) 
                : pages.OrderBy(p => p.Name),
            
            "createdate" => isDescending 
                ? pages.OrderByDescending(p => p.CreateDate) 
                : pages.OrderBy(p => p.CreateDate),
            
            "updatedate" => isDescending 
                ? pages.OrderByDescending(p => p.UpdateDate) 
                : pages.OrderBy(p => p.UpdateDate),
            
            "level" => isDescending 
                ? pages.OrderByDescending(p => p.Level) 
                : pages.OrderBy(p => p.Level),
            
            "pagetitle" => isDescending 
                ? pages.OrderByDescending(p => p.Value<string>("pageTitle") ?? p.Name) 
                : pages.OrderBy(p => p.Value<string>("pageTitle") ?? p.Name),
            
            // Default to createDate desc for unknown values
            _ => pages.OrderByDescending(p => p.CreateDate)
        };
    }

    private IEnumerable<IPublishedContent> ApplyTagGroupFilter(IEnumerable<IPublishedContent> pages, string tagExpression, string? culture)
    {
        try
        {
            _logger.LogInformation("Applying tag group filter with expression: {TagExpression}, culture: {Culture}", tagExpression, culture);
            
            // Parse tag groups from expression like (("378" or "373" or "43384") and ("32973" or "384") and ("737"))
            var tagGroups = ParseTagGroups(tagExpression);
            
            _logger.LogInformation("Parsed {GroupCount} tag groups: {Groups}", tagGroups.Count, string.Join("; ", tagGroups.Select(g => "(" + string.Join(" or ", g) + ")")));
            
            if (!tagGroups.Any())
            {
                _logger.LogWarning("No valid tag groups found, returning all pages");
                return pages; // No valid tag groups found, return all pages
            }

            var filteredPages = pages.Where(page =>
            {
                var pageTags = GetTagsFromContent(page, "tags", culture)
                    .Select(tag => tag.ToLowerInvariant())
                    .ToList();

                _logger.LogDebug("Page {PageId} ({PageName}) has tags: {PageTags}", page.Id, page.Name, string.Join(", ", pageTags));

                // ALL tag groups must match (AND logic between groups)
                var matches = tagGroups.All(group =>
                {
                    // ANY tag in the group must match (OR logic within group)
                    var groupMatch = group.Any(searchTag =>
                    {
                        var searchTagLower = searchTag.ToLowerInvariant();
                        // Use exact match for tag filtering (not partial match)
                        return pageTags.Any(pageTag => 
                            pageTag.Equals(searchTagLower, StringComparison.OrdinalIgnoreCase));
                    });
                    
                    _logger.LogDebug("Group ({GroupTags}) match for page {PageId}: {Match}", 
                        string.Join(" or ", group), page.Id, groupMatch);
                    
                    return groupMatch;
                });

                _logger.LogDebug("Page {PageId} overall match: {Match}", page.Id, matches);
                return matches;
            }).ToList();

            _logger.LogInformation("Tag filtering returned {ResultCount} pages out of {TotalPages}", filteredPages.Count, pages.Count());
            return filteredPages;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error parsing tag expression: {TagExpression}", tagExpression);
            // Fallback to simple comma-separated logic
            return ApplySimpleTagFilter(pages, tagExpression, culture);
        }
    }

    private List<List<string>> ParseTagGroups(string tagExpression)
    {
        var groups = new List<List<string>>();
        
        try
        {
            _logger.LogInformation("Starting to parse tag expression: '{TagExpression}'", tagExpression);
            
            // Remove outer parentheses if present
            var expression = tagExpression.Trim();
            _logger.LogDebug("Expression after trim: '{Expression}'", expression);
            
            if (expression.StartsWith("((") && expression.EndsWith("))"))
            {
                expression = expression.Substring(2, expression.Length - 4);
                _logger.LogDebug("Removed double outer parentheses: '{Expression}'", expression);
            }
            else if (expression.StartsWith("(") && expression.EndsWith(")"))
            {
                expression = expression.Substring(1, expression.Length - 2);
                _logger.LogDebug("Removed single outer parentheses: '{Expression}'", expression);
            }

            // Handle multiple groups separated by "and"
            if (expression.Contains(") and ("))
            {
                _logger.LogDebug("Found 'and' separator, splitting into multiple groups");
                
                // Split by ") and (" to get individual group contents
                var groupParts = expression.Split(new[] { ") and (" }, StringSplitOptions.RemoveEmptyEntries);
                
                for (int i = 0; i < groupParts.Length; i++)
                {
                    var groupPart = groupParts[i];
                    
                    // Clean up the group part - remove leading/trailing parentheses
                    if (i == 0 && groupPart.StartsWith("("))
                    {
                        groupPart = groupPart.Substring(1);
                    }
                    if (i == groupParts.Length - 1 && groupPart.EndsWith(")"))
                    {
                        groupPart = groupPart.Substring(0, groupPart.Length - 1);
                    }
                    
                    _logger.LogDebug("Processing group part {Index}: '{GroupPart}'", i, groupPart);
                    
                    // Parse tags within this group (split by "or")
                    var tags = groupPart
                        .Split(new[] { " or " }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(tag => tag.Trim().Trim('"', '\''))
                        .Where(tag => !string.IsNullOrEmpty(tag))
                        .ToList();
                    
                    _logger.LogDebug("Parsed tags from group {Index}: {Tags}", i, string.Join(", ", tags));
                    
                    if (tags.Any())
                    {
                        groups.Add(tags);
                    }
                }
            }
            else
            {
                // Single group or simple patterns
                var groupPattern = @"\(([^)]+)\)";
                var matches = Regex.Matches(expression, groupPattern);
                
                _logger.LogDebug("Found {MatchCount} regex matches", matches.Count);
                
                foreach (Match match in matches)
                {
                    var groupContent = match.Groups[1].Value;
                    _logger.LogDebug("Processing group content: '{GroupContent}'", groupContent);
                    
                    // Parse tags within the group (split by "or")
                    var tags = groupContent
                        .Split(new[] { " or " }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(tag => tag.Trim().Trim('"', '\'')) // Remove quotes
                        .Where(tag => !string.IsNullOrEmpty(tag))
                        .ToList();
                    
                    _logger.LogDebug("Parsed tags from group: {Tags}", string.Join(", ", tags));
                    
                    if (tags.Any())
                    {
                        groups.Add(tags);
                    }
                }

                // If no parenthesized groups found, check if we have a simple expression
                if (!groups.Any())
                {
                    _logger.LogDebug("No parenthesized groups found, trying simple parsing");
                    
                    // Check if the expression contains " or " - if so, treat as single group
                    if (expression.Contains(" or "))
                    {
                        var orTags = expression
                            .Split(new[] { " or " }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(tag => tag.Trim().Trim('"', '\''))
                            .Where(tag => !string.IsNullOrEmpty(tag))
                            .ToList();
                        
                        _logger.LogDebug("Parsed OR tags: {Tags}", string.Join(", ", orTags));
                        
                        if (orTags.Any())
                        {
                            groups.Add(orTags);
                        }
                    }
                    else
                    {
                        // Try simple comma-separated parsing
                        var simpleTags = tagExpression
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(tag => tag.Trim().Trim('"', '\''))
                            .Where(tag => !string.IsNullOrEmpty(tag))
                            .ToList();
                        
                        _logger.LogDebug("Parsed simple tags: {Tags}", string.Join(", ", simpleTags));
                        
                        if (simpleTags.Any())
                        {
                            groups.Add(simpleTags); // Treat as single group
                        }
                    }
                }
            }
            
            _logger.LogInformation("Parsing completed. Found {GroupCount} groups: {Groups}", 
                groups.Count, 
                string.Join("; ", groups.Select(g => "[" + string.Join(", ", g) + "]")));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error parsing tag groups from expression: {Expression}", tagExpression);
        }

        return groups;
    }

    private IEnumerable<IPublishedContent> ApplySimpleTagFilter(IEnumerable<IPublishedContent> pages, string tags, string? culture)
    {
        var searchTags = tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(t => t.Trim().ToLowerInvariant())
            .ToList();

        return pages.Where(p =>
        {
            var pageTags = GetTagsFromContent(p, "tags", culture);
            return searchTags.Any(searchTag => 
                pageTags.Any(pageTag => pageTag.ToLowerInvariant().Equals(searchTag, StringComparison.OrdinalIgnoreCase)));
        });
    }

    private List<string> GetTagsFromContent(IPublishedContent content, string propertyAlias, string? culture = null)
    {
        var tags = new List<string>();
        
        try
        {
            // Check if the property exists
            if (!content.HasProperty(propertyAlias))
            {
                _logger.LogInformation("Property {PropertyAlias} does not exist on content {ContentId}", 
                    propertyAlias, content.Id);
                return tags;
            }

            // Use the proper Umbraco way to get tags
            var tagValue = content.Value<string[]>(propertyAlias, culture: culture);
            if (tagValue != null && tagValue.Length > 0)
            {
                tags.AddRange(tagValue.Where(t => !string.IsNullOrEmpty(t)));
                return tags;
            }

            // If the direct approach doesn't work, try alternative methods
            var property = content.Properties.FirstOrDefault(p => p.Alias == propertyAlias);
            if (property?.HasValue() == true)
            {
                var rawValue = property.GetValue();

                // Handle different tag formats
                switch (rawValue)
                {
                    case string[] stringArray:
                        tags.AddRange(stringArray.Where(t => !string.IsNullOrEmpty(t)));
                        break;
                    case IEnumerable<string> enumerable:
                        var enumerableList = enumerable.ToList();
                        tags.AddRange(enumerableList.Where(t => !string.IsNullOrEmpty(t)));
                        break;
                    case string stringValue when !string.IsNullOrEmpty(stringValue):
                        // Try JSON parsing first
                        if (stringValue.StartsWith("[") && stringValue.EndsWith("]"))
                        {
                            try
                            {
                                var jsonTags = System.Text.Json.JsonSerializer.Deserialize<string[]>(stringValue);
                                if (jsonTags != null)
                                {
                                    tags.AddRange(jsonTags.Where(t => !string.IsNullOrEmpty(t)));
                                }
                            }
                            catch
                            {
                                // If JSON parsing fails, treat as comma-separated
                                tags.AddRange(stringValue.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                    .Select(t => t.Trim()));
                            }
                        }
                        else
                        {
                            // Treat as comma-separated
                            tags.AddRange(stringValue.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(t => t.Trim()));
                        }
                        break;
                    default:
                        _logger.LogWarning("Unexpected tag value type for content {ContentId}: {Type}", 
                            content.Id, rawValue?.GetType().FullName ?? "null");
                        break;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing tags from property {PropertyAlias} on content {ContentId}", 
                propertyAlias, content.Id);
        }

        return tags;
    }

    private PageSearchItem? ConvertToSearchItem(IPublishedContent content, string? culture = null)
    {
        try
        {
            // If no specific culture is requested, use the content's default culture
            var contentCulture = culture;
            if (string.IsNullOrEmpty(contentCulture))
            {
                // Get the first available culture for this content, or fallback to current thread culture
                contentCulture = content.Cultures.FirstOrDefault().Key ?? Thread.CurrentThread.CurrentCulture.Name;
            }

            var pageTitle = content.Value<string>("pageTitle", culture: contentCulture);
            
            // Get culture-specific name or fallback to invariant name
            var contentName = content.Name(contentCulture) ?? content.Name ?? string.Empty;
            
            var item = new PageSearchItem
            {
                Id = content.Id,
                Name = !string.IsNullOrWhiteSpace(pageTitle) ? pageTitle : contentName,
                Url = content.Url(contentCulture, UrlMode.Relative),
                ContentType = content.ContentType.Alias,
                PageTitle = pageTitle,
                SubTitle = content.Value<string>("subTitle", culture: contentCulture),
                UpdateDate = content.UpdateDate,
                CreateDate = content.CreateDate,
                Level = content.Level,
                ParentId = content.Parent<IPublishedContent>()?.Id,
                Culture = contentCulture,
                Tags = GetTagsFromContent(content, "tags",  culture: contentCulture)
            };

            // Get excerpt from body text
            var bodyText = content.Value<string>("bodyText", culture: contentCulture);
            if (!string.IsNullOrEmpty(bodyText))
            {
                var plainText = StripHtml(bodyText);
                item.Excerpt = TruncateText(plainText, 200);
            }

            // Get page image URL
            var pageImage = content.Value<IPublishedContent>("pageImage", culture: contentCulture);
            if (pageImage != null)
            {
                item.PageImageUrl = pageImage.Url(contentCulture, UrlMode.Relative);
            }

            return item;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error converting content {ContentId} to search item", content.Id);
            return null;
        }
    }

    private string StripHtml(string html)
    {
        if (string.IsNullOrEmpty(html))
            return string.Empty;

        // Remove HTML tags
        var stripped = Regex.Replace(html, "<.*?>", string.Empty);
        
        // Decode HTML entities
        stripped = System.Net.WebUtility.HtmlDecode(stripped);
        
        // Normalize whitespace
        stripped = Regex.Replace(stripped, @"\s+", " ").Trim();
        
        return stripped;
    }

    private string TruncateText(string text, int maxLength)
    {
        if (string.IsNullOrEmpty(text) || text.Length <= maxLength)
            return text;

        // Find the last space before the max length
        var truncated = text.Substring(0, maxLength);
        var lastSpace = truncated.LastIndexOf(' ');
        
        if (lastSpace > 0)
        {
            truncated = truncated.Substring(0, lastSpace);
        }
        
        return truncated + "...";
    }

    /// <summary>
    /// Search in block content (BlockList and BlockGrid) properties
    /// </summary>
    /// <param name="content">The content to search within</param>
    /// <param name="searchQuery">The search query (already lowercased)</param>
    /// <param name="culture">The culture to use for searching</param>
    /// <returns>True if the search query is found in any block content</returns>
    private bool SearchInBlockContent(IPublishedContent content, string searchQuery, string? culture = null)
    {
        try
        {
            // Get all properties from the content
            foreach (var property in content.Properties)
            {
                // Check if this property is a BlockList or BlockGrid
                if (IsBlockProperty(property))
                {
                    var blockValue = property.GetValue(culture);
                    if (blockValue != null && SearchInBlockValue(blockValue, searchQuery, culture))
                    {
                        return true;
                    }
                }
            }
            
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error searching in block content for content {ContentId}", content.Id);
            return false;
        }
    }

    /// <summary>
    /// Check if a property is a BlockList or BlockGrid property
    /// </summary>
    /// <param name="property">The property to check</param>
    /// <returns>True if the property is a block property</returns>
    private bool IsBlockProperty(IPublishedProperty property)
    {
        var propertyType = property.PropertyType;
        var editorAlias = propertyType.EditorAlias;
        
        return editorAlias == "Umbraco.BlockList" || 
               editorAlias == "Umbraco.BlockGrid" ||
               editorAlias == "Umbraco.RichText"; // RichText can contain blocks too
    }

    /// <summary>
    /// Search within a block value structure
    /// </summary>
    /// <param name="blockValue">The block value to search</param>
    /// <param name="searchQuery">The search query (already lowercased)</param>
    /// <param name="culture">The culture to use for searching</param>
    /// <returns>True if the search query is found</returns>
    private bool SearchInBlockValue(object blockValue, string searchQuery, string? culture = null)
    {
        try
        {
            // Handle different types of block values
            switch (blockValue)
            {
                case Umbraco.Cms.Core.Models.Blocks.BlockListModel blockList:
                    return SearchInBlockList(blockList, searchQuery, culture);
                    
                case Umbraco.Cms.Core.Models.Blocks.BlockGridModel blockGrid:
                    return SearchInBlockGrid(blockGrid, searchQuery, culture);
                    
                case Umbraco.Cms.Core.Strings.IHtmlEncodedString htmlString:
                    // Handle RichText with potential blocks
                    return SearchInRichTextWithBlocks(htmlString, searchQuery, culture);
                    
                case string stringValue:
                    // Simple string search
                    return stringValue.ToLowerInvariant().Contains(searchQuery);
                    
                default:
                    // For any other object, try to convert to string and search
                    var stringRepresentation = blockValue?.ToString();
                    return !string.IsNullOrEmpty(stringRepresentation) && 
                           stringRepresentation.ToLowerInvariant().Contains(searchQuery);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error searching in block value of type {ValueType}", blockValue?.GetType().FullName);
            return false;
        }
    }

    /// <summary>
    /// Search within a BlockList model
    /// </summary>
    private bool SearchInBlockList(Umbraco.Cms.Core.Models.Blocks.BlockListModel blockList, string searchQuery, string? culture = null)
    {
        foreach (var blockItem in blockList)
        {
            if (SearchInBlockItem(blockItem.Content, searchQuery, culture))
                return true;
                
            // Also search in settings if available
            if (blockItem.Settings != null && SearchInBlockItem(blockItem.Settings, searchQuery, culture))
                return true;
        }
        
        return false;
    }

    /// <summary>
    /// Search within a BlockGrid model
    /// </summary>
    private bool SearchInBlockGrid(Umbraco.Cms.Core.Models.Blocks.BlockGridModel blockGrid, string searchQuery, string? culture = null)
    {
        foreach (var blockItem in blockGrid)
        {
            if (SearchInBlockItem(blockItem.Content, searchQuery, culture))
                return true;
                
            // Also search in settings if available
            if (blockItem.Settings != null && SearchInBlockItem(blockItem.Settings, searchQuery, culture))
                return true;
                
            // Search in nested areas for BlockGrid
            if (blockItem.Areas != null)
            {
                foreach (var area in blockItem.Areas)
                {
                    foreach (var nestedItem in area)
                    {
                        if (SearchInBlockItem(nestedItem.Content, searchQuery, culture))
                            return true;
                            
                        if (nestedItem.Settings != null && SearchInBlockItem(nestedItem.Settings, searchQuery, culture))
                            return true;
                    }
                }
            }
        }
        
        return false;
    }

    /// <summary>
    /// Search within RichText content that may contain blocks
    /// </summary>
    private bool SearchInRichTextWithBlocks(Umbraco.Cms.Core.Strings.IHtmlEncodedString htmlString, string searchQuery, string? culture = null)
    {
        var htmlContent = htmlString?.ToString();
        if (string.IsNullOrEmpty(htmlContent))
            return false;
        
        // First, search in the plain text content
        var plainText = StripHtml(htmlContent).ToLowerInvariant();
        if (plainText.Contains(searchQuery))
            return true;
            
        // TODO: If RichText contains block structures, we could parse them here
        // For now, the plain text search should cover most cases
        
        return false;
    }

    /// <summary>
    /// Search within an individual block item (IPublishedElement)
    /// </summary>
    private bool SearchInBlockItem(IPublishedElement blockContent, string searchQuery, string? culture = null)
    {
        try
        {
            // Search through all properties of the block content
            foreach (var property in blockContent.Properties)
            {
                var value = property.GetValue(culture);
                if (value != null && SearchInPropertyValue(value, searchQuery, culture))
                {
                    return true;
                }
            }
            
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error searching in block item of type {ContentType}", blockContent.ContentType.Alias);
            return false;
        }
    }

    /// <summary>
    /// Search within a property value, handling different data types
    /// </summary>
    private bool SearchInPropertyValue(object propertyValue, string searchQuery, string? culture = null)
    {
        try
        {
            switch (propertyValue)
            {
                case string stringValue:
                    return stringValue.ToLowerInvariant().Contains(searchQuery);
                    
                case Umbraco.Cms.Core.Strings.IHtmlEncodedString htmlString:
                    var htmlContent = htmlString?.ToString();
                    if (!string.IsNullOrEmpty(htmlContent))
                    {
                        var plainText = StripHtml(htmlContent).ToLowerInvariant();
                        return plainText.Contains(searchQuery);
                    }
                    return false;
                    
                case IEnumerable<string> stringArray:
                    return stringArray.Any(s => s?.ToLowerInvariant().Contains(searchQuery) == true);
                    
                case Umbraco.Cms.Core.Models.Blocks.BlockListModel nestedBlockList:
                    return SearchInBlockList(nestedBlockList, searchQuery, culture);
                    
                case Umbraco.Cms.Core.Models.Blocks.BlockGridModel nestedBlockGrid:
                    return SearchInBlockGrid(nestedBlockGrid, searchQuery, culture);
                    
                // Handle Links (MultiUrlPicker)
                case IEnumerable<Umbraco.Cms.Core.Models.Link> links:
                    return links.Any(link => 
                        (link.Name?.ToLowerInvariant().Contains(searchQuery) == true) ||
                        (link.Url?.ToLowerInvariant().Contains(searchQuery) == true));
                        
                // Handle Media items
                case IPublishedContent mediaContent:
                    return mediaContent.Name?.ToLowerInvariant().Contains(searchQuery) == true;
                    
                default:
                    // For any other type, convert to string and search
                    var stringRepresentation = propertyValue?.ToString();
                    return !string.IsNullOrEmpty(stringRepresentation) && 
                           stringRepresentation.ToLowerInvariant().Contains(searchQuery);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error searching in property value of type {ValueType}", propertyValue?.GetType().FullName);
            return false;
        }
    }

    /// <summary>
    /// Get all unique tags from published content
    /// </summary>
    /// <returns>List of unique tags</returns>
    [HttpGet("tags")]
    [ProducesResponseType(200)]
    public ActionResult<object> GetTags()
    {
        if (!_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
        {
            return BadRequest("Umbraco context not available");
        }

        var contentCache = umbracoContext.Content;
        if (contentCache == null)
        {
            return BadRequest("Content cache not available");
        }

        var allTags = new List<string>();
        
        // Use navigation service to get root items and their descendants
        var rootItems = _documentNavigationQueryService.TryGetRootKeys(out var rootKeys) ? rootKeys : new List<Guid>();
        
        foreach (var rootKey in rootItems)
        {
            var rootNode = contentCache.GetById(rootKey);
            if (rootNode != null)
            {
                CollectTagsFromContentNode(rootNode, allTags);
            }
        }

        // Remove duplicates and sort
        var uniqueTags = allTags
            .Where(tag => !string.IsNullOrEmpty(tag))
            .Distinct()
            .OrderBy(tag => tag)
            .ToList();

        return Ok(new
        {
            total = uniqueTags.Count,
            tags = uniqueTags
        });
    }

    private void CollectTagsFromContentNode(IPublishedContent node, List<string> allTags, string? culture = null)
    {
        // Check if this node has tags
        if (node.HasProperty("tags"))
        {
            var tags = GetTagsFromContent(node, "tags", culture);
            if (tags != null && tags.Count > 0)
            {
                allTags.AddRange(tags);
            }
        }

        // Recursively process children
        foreach (var child in node.Children())
        {
            CollectTagsFromContentNode(child, allTags, culture);
        }
    }

    private List<IPublishedContent> GetAllContentRecursive(IPublishedContent node, string? culture = null)
    {
        var result = new List<IPublishedContent>();
        
        // Use culture-aware traversal to find ALL descendants including culture-specific ones
        try
        {
            if (!string.IsNullOrEmpty(culture))
            {
                // Use culture-specific descendants to include culture-variant content
                var cultureDescendants = node.Descendants(culture).ToList();
                result.AddRange(cultureDescendants);
            }
            else
            {
                // Fallback to all descendants without culture filter
                var allDescendants = node.Descendants().ToList();
                result.AddRange(allDescendants);
            }
        }
        catch
        {
            // Fallback to recursive Children() approach with culture awareness
            var children = !string.IsNullOrEmpty(culture) ? node.Children(culture) : node.Children();
            foreach (var child in children)
            {
                result.Add(child);
                result.AddRange(GetAllContentRecursive(child, culture));
            }
        }
        
        return result;
    }
}
