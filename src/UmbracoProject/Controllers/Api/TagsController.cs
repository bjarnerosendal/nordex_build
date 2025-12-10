using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;
using Umbraco.Cms.Core.Services.Navigation;

namespace NordexFood.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly ILogger<TagsController> _logger;
    private readonly IDocumentNavigationQueryService _documentNavigationQueryService;

    public TagsController(
        IUmbracoContextAccessor umbracoContextAccessor,
        ILogger<TagsController> logger,
        IDocumentNavigationQueryService documentNavigationQueryService)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _logger = logger;
        _documentNavigationQueryService = documentNavigationQueryService;
    }

    /// <summary>
    /// Get all available tags from published content
    /// </summary>
    /// <param name="culture">Culture code (e.g., "da-DK", "en-US")</param>
    /// <param name="nodeId">Starting node ID to filter tags from (optional - if not provided, searches from root)</param>
    /// <returns>List of unique tags</returns>
    [HttpGet]
    public IActionResult GetTags(string? culture = null, Guid? nodeId = null)
    {
        try
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
            {
                return StatusCode(500, new { error = "Umbraco context not available" });
            }

            var contentCache = umbracoContext.Content;
            if (contentCache == null)
            {
                return Ok(new { total = 0, culture = culture ?? "all", nodeId = nodeId?.ToString(), tags = new string[0] });
            }

            // Get all published content with tags
            var allTags = new List<string>();
            
            if (nodeId.HasValue)
            {
                // Filter tags from a specific starting node
                var startNode = contentCache.GetById(nodeId.Value);
                if (startNode != null)
                {
                    CollectTagsFromNode(startNode, allTags, culture);
                }
            }
            else
            {
                // Get tags from all root nodes and their descendants (existing behavior)
                var rootItems = _documentNavigationQueryService.TryGetRootKeys(out var rootKeys) ? rootKeys : new List<Guid>();
                
                foreach (var rootKey in rootItems)
                {
                    var rootNode = contentCache.GetById(rootKey);
                    if (rootNode != null)
                    {
                        CollectTagsFromNode(rootNode, allTags, culture);
                    }
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
                culture = culture ?? "all",
                nodeId = nodeId?.ToString(),
                tags = uniqueTags
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tags");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get tags with their usage count
    /// </summary>
    /// <param name="culture">Culture code (e.g., "da-DK", "en-US")</param>
    /// <param name="nodeId">Starting node ID to filter tags from (optional - if not provided, searches from root)</param>
    /// <returns>List of tags with usage statistics</returns>
    [HttpGet("stats")]
    public IActionResult GetTagStats(string? culture = null, Guid? nodeId = null)
    {
        try
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
            {
                return StatusCode(500, new { error = "Umbraco context not available" });
            }

            var contentCache = umbracoContext.Content;
            if (contentCache == null)
            {
                return Ok(new { total = 0, culture = culture ?? "all", nodeId = nodeId?.ToString(), stats = new object[0] });
            }

            // Get all published content with tags
            var allTags = new List<string>();
            
            if (nodeId.HasValue)
            {
                // Filter tags from a specific starting node
                var startNode = contentCache.GetById(nodeId.Value);
                if (startNode != null)
                {
                    CollectTagsFromNode(startNode, allTags, culture);
                }
            }
            else
            {
                // Get tags from all root nodes and their descendants (existing behavior)
                var rootItems = _documentNavigationQueryService.TryGetRootKeys(out var rootKeys) ? rootKeys : new List<Guid>();
                
                foreach (var rootKey in rootItems)
                {
                    var rootNode = contentCache.GetById(rootKey);
                    if (rootNode != null)
                    {
                        CollectTagsFromNode(rootNode, allTags, culture);
                    }
                }
            }

            // Get tag statistics
            var tagStats = allTags
                .Where(tag => !string.IsNullOrEmpty(tag))
                .GroupBy(tag => tag)
                .Select(group => new
                {
                    tag = group.Key,
                    count = group.Count()
                })
                .OrderByDescending(x => x.count)
                .ThenBy(x => x.tag)
                .ToList();

            return Ok(new
            {
                total = tagStats.Count,
                culture = culture ?? "all",
                nodeId = nodeId?.ToString(),
                stats = tagStats
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tag statistics");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private void CollectTagsFromNode(Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent node, List<string> allTags, string? culture = null)
    {
        // Check if this node has tags
        if (node.HasProperty("tags"))
        {
            var tags = node.Value<string[]>("tags", culture: culture);
            if (tags != null)
            {
                allTags.AddRange(tags);
            }
        }

        // Recursively process children
        foreach (var child in node.Children(culture))
        {
            CollectTagsFromNode(child, allTags, culture);
        }
    }
}
