using System.ComponentModel.DataAnnotations;

namespace NordexFood.Models.Api;

public class PageSearchRequest
{
    /// <summary>
    /// Search query text to search in page content
    /// </summary>
    public string? Query { get; set; }

    /// <summary>
    /// Tags to filter by (comma-separated)
    /// </summary>
    public string? Tags { get; set; }

    /// <summary>
    /// Tag groups for complex filtering with Boolean logic (e.g., "(("tag1" or "tag2") and ("tag3"))")
    /// </summary>
    public string? TagGroups { get; set; }

    /// <summary>
    /// Language/culture code (e.g., "en-US", "da-DK", "sv")
    /// </summary>
    public string? Lang { get; set; }

    /// <summary>
    /// Start node ID for local search. If not provided, uses root.
    /// </summary>
    public int? StartNodeId { get; set; }

    /// <summary>
    /// Number of items to skip for pagination
    /// </summary>
    [Range(0, int.MaxValue)]
    public int Skip { get; set; } = 0;

    /// <summary>
    /// Number of items to take for pagination (max 100)
    /// </summary>
    [Range(1, 100)]
    public int Take { get; set; } = 10;

    /// <summary>
    /// Include child pages in search
    /// </summary>
    public bool IncludeChildren { get; set; } = true;

    /// <summary>
    /// Order by field (name, createDate, updateDate, level, pageTitle)
    /// </summary>
    public string? OrderBy { get; set; }

    /// <summary>
    /// Order direction (asc, desc)
    /// </summary>
    public string? OrderDirection { get; set; }
    
    public int? ExcludeNode { get; set; }
}

public class PageSearchResponse
{
    public int Total { get; set; }
    public int Skip { get; set; }
    public int Take { get; set; }
    public List<PageSearchItem> Items { get; set; } = new();
}

public class PageSearchItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string? PageTitle { get; set; }
    public string? SubTitle { get; set; }
    public string? Excerpt { get; set; }
    public string? PageImageUrl { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime UpdateDate { get; set; }
    public DateTime CreateDate { get; set; }
    public string Culture { get; set; } = string.Empty;
    public int Level { get; set; }
    public int? ParentId { get; set; }
}
