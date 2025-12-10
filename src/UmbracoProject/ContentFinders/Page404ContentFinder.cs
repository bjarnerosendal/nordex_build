using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Core.Services.Navigation;
using Microsoft.Extensions.DependencyInjection;

namespace NordexFood.ContentFinders
{
    /// <summary>
    /// Content finder that handles 404 errors by finding a page404 content node
    /// </summary>
    public class Page404ContentFinder : IContentLastChanceFinder
    {
        private readonly IServiceProvider _serviceProvider;

        public Page404ContentFinder(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public Task<bool> TryFindContent(IPublishedRequestBuilder request)
        {
            using var scope = _serviceProvider.CreateScope();

            var umbracoContextAccessor = scope.ServiceProvider.GetRequiredService<IUmbracoContextAccessor>();
            var documentNavigationService = scope.ServiceProvider.GetRequiredService<IDocumentNavigationQueryService>();

            if (!umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
            {
                return Task.FromResult(false);
            }

            var contentCache = umbracoContext.Content;
            if (contentCache == null)
            {
                return Task.FromResult(false);
            }

            // Get root content using the modern navigation service
            if (!documentNavigationService.TryGetRootKeys(out var rootKeys))
            {
                return Task.FromResult(false);
            }

            // Search through all content for a page404 document type
            foreach (var rootKey in rootKeys)
            {
                var rootContent = contentCache.GetById(rootKey);
                if (rootContent != null)
                {
                    var notFoundPage = rootContent.DescendantsOrSelf()
                        .FirstOrDefault(c => c.ContentType.Alias == "page404");

                    if (notFoundPage != null)
                    {
                        // Set the found 404 page as the content for this request
                        request.SetPublishedContent(notFoundPage);
                        request.SetResponseStatus(404);
                        
                        return Task.FromResult(true);
                    }
                }
            }

            return Task.FromResult(false);
        }
    }
}
