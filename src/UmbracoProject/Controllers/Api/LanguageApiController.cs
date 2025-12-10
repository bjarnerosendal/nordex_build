using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common;
using Umbraco.Extensions;

namespace NordexFood.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class LanguageApiController : ControllerBase
    {
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;
        private readonly ILanguageService _languageService;
        private readonly IDomainService _domainService;

        public LanguageApiController(
            IUmbracoContextAccessor umbracoContextAccessor,
            ILanguageService languageService,
            IDomainService domainService)
        {
            _umbracoContextAccessor = umbracoContextAccessor;
            _languageService = languageService;
            _domainService = domainService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLanguages([FromQuery] string? url = null)
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
            {
                return BadRequest("Unable to access Umbraco context");
            }

            try
            {
                var languages = new List<LanguageInfo>();
                var allLanguages = await _languageService.GetAllAsync();
                var domains = await _domainService.GetAllAsync(false);
                
                // Detect current language from the request
                var currentLanguageIsoCode = GetCurrentLanguage(umbracoContext, url);

                foreach (var language in allLanguages)
                {
                    var languageInfo = new LanguageInfo
                    {
                        IsoCode = language.IsoCode,
                        Name = language.CultureName,
                        NativeName = language.CultureInfo?.NativeName ?? language.CultureName,
                        Url = GetLanguageUrl(umbracoContext, language.IsoCode, url, domains),
                        IsCurrent = string.Equals(language.IsoCode, currentLanguageIsoCode, StringComparison.OrdinalIgnoreCase)
                    };

                    languages.Add(languageInfo);
                }

                var response = new LanguageResponse
                {
                    Languages = languages,
                    CurrentLanguage = currentLanguageIsoCode
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving languages", details = ex.Message });
            }
        }

        private string GetCurrentLanguage(IUmbracoContext umbracoContext, string? inputUrl)
        {
            try
            {
                // If URL is provided, try to detect language from content
                if (!string.IsNullOrEmpty(inputUrl))
                {
                    // For now, we'll skip the URL-based language detection
                    // This would require a full content tree traversal which is expensive
                    // TODO: Implement more efficient URL-to-content mapping in Umbraco 17
                    IPublishedContent? content = null;
                    
                    if (content != null)
                    {
                        // Try to get the culture from available cultures on the content
                        foreach (var culture in content.Cultures.Keys)
                        {
                            // If this content is available in this culture and the URL matches
                            var cultureUrl = content.Url(culture);
                            if (!string.IsNullOrEmpty(cultureUrl) && inputUrl.StartsWith(cultureUrl, StringComparison.OrdinalIgnoreCase))
                            {
                                return culture;
                            }
                        }
                    }
                }

                // Try to detect from URL path segments
                if (!string.IsNullOrEmpty(inputUrl))
                {
                    var pathSegments = inputUrl.Split('/', StringSplitOptions.RemoveEmptyEntries);
                    if (pathSegments.Length > 0)
                    {
                        var firstSegment = pathSegments[0];
                        
                        // Check if first segment matches any language ISO code
                        if (firstSegment.Equals("da", StringComparison.OrdinalIgnoreCase))
                            return "da-DK";
                        if (firstSegment.Equals("sv", StringComparison.OrdinalIgnoreCase))
                            return "sv";
                        if (firstSegment.Equals("en", StringComparison.OrdinalIgnoreCase))
                            return "en-US";
                    }
                }

                // Final fallback to default language
                return "en-US";
            }
            catch
            {
                return "en-US";
            }
        }

        private string GetLanguageUrl(IUmbracoContext umbracoContext, string languageIsoCode, string? inputUrl, IEnumerable<IDomain> domains)
        {
            try
            {
                var baseUrl = GetBaseUrl();

                // If URL is provided, try to find the language variant
                if (!string.IsNullOrEmpty(inputUrl))
                {
                    // For now, we'll skip URL-based content lookup
                    // TODO: Implement efficient URL-to-content mapping in Umbraco 17
                    IPublishedContent? content = null;
                    
                    if (content != null)
                    {
                        // Try to get the language variant of this content
                        var cultureVariations = content.Cultures;
                        if (cultureVariations.ContainsKey(languageIsoCode))
                        {
                            var variantUrl = content.Url(languageIsoCode);
                            if (!string.IsNullOrEmpty(variantUrl))
                            {
                                // If already absolute, return as is, otherwise make it absolute
                                if (variantUrl.StartsWith("http://") || variantUrl.StartsWith("https://"))
                                    return variantUrl;
                                else
                                    return EnsureAbsoluteUrl(variantUrl, baseUrl);
                            }
                        }
                    }
                }

                // Fall back to domain root for the language
                var languageDomain = domains.FirstOrDefault(d => 
                    string.Equals(d.LanguageIsoCode, languageIsoCode, StringComparison.OrdinalIgnoreCase));
                
                if (languageDomain != null)
                {
                    // If domain already has protocol, return as is
                    if (languageDomain.DomainName.StartsWith("http://") || languageDomain.DomainName.StartsWith("https://"))
                    {
                        return languageDomain.DomainName;
                    }
                    
                    // Otherwise, add the protocol
                    var isHttps = HttpContext.Request.IsHttps;
                    var protocol = isHttps ? "https" : "http";
                    return $"{protocol}://{languageDomain.DomainName}";
                }

                // Final fallback - get root content for the language
                // TODO: Re-implement with Umbraco 17 content access pattern
                IPublishedContent? rootContent = null;
                
                if (rootContent != null)
                {
                    var rootUrl = rootContent.Url(languageIsoCode) ?? "/";
                    // If already absolute, return as is, otherwise make it absolute
                    if (rootUrl.StartsWith("http://") || rootUrl.StartsWith("https://"))
                        return rootUrl;
                    else
                        return EnsureAbsoluteUrl(rootUrl, baseUrl);
                }

                return baseUrl;
            }
            catch
            {
                // If anything fails, return base URL
                return GetBaseUrl();
            }
        }

        private string GetBaseUrl()
        {
            var request = HttpContext.Request;
            var scheme = request.Scheme;
            var host = request.Host;
            
            // Use the actual request host and scheme
            if (host.HasValue && !string.IsNullOrEmpty(host.Value))
            {
                return $"{scheme}://{host.Value}";
            }
            
            // If for some reason host is not available, fallback to first available domain from Umbraco
            try
            {
                var domains = _domainService.GetAllAsync(false).GetAwaiter().GetResult();
                var firstDomain = domains.FirstOrDefault();
                if (firstDomain != null)
                {
                    if (firstDomain.DomainName.StartsWith("http://") || firstDomain.DomainName.StartsWith("https://"))
                    {
                        return firstDomain.DomainName;
                    }
                    return $"{scheme}://{firstDomain.DomainName}";
                }
            }
            catch
            {
                // Ignore domain service errors
            }
            
            // No fallback - return empty if no domains configured
            return string.Empty;
        }

        private string EnsureAbsoluteUrl(string url, string baseUrl)
        {
            if (string.IsNullOrEmpty(url))
                return baseUrl;

            // If already absolute, return as is
            if (url.StartsWith("http://") || url.StartsWith("https://"))
                return url;

            // If relative, make it absolute
            if (url.StartsWith("/"))
                return baseUrl + url;

            // If it doesn't start with /, add both / and the URL
            return baseUrl + "/" + url;
        }

        private IPublishedContent? FindContentByUrl(IPublishedContent node, string url)
        {
            // Check all culture variations of this node
            foreach (var culture in node.Cultures.Keys)
            {
                var nodeUrl = node.Url(culture);
                if (!string.IsNullOrEmpty(nodeUrl) && url.StartsWith(nodeUrl, StringComparison.OrdinalIgnoreCase))
                {
                    return node;
                }
            }

            // Recursively check children
            foreach (var child in node.Children())
            {
                var found = FindContentByUrl(child, url);
                if (found != null) return found;
            }

            return null;
        }
    }

    public class LanguageInfo
    {
        public string IsoCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string NativeName { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public bool IsCurrent { get; set; } = false;
    }

    public class LanguageResponse
    {
        public List<LanguageInfo> Languages { get; set; } = new();
        public string CurrentLanguage { get; set; } = string.Empty;
    }
}
