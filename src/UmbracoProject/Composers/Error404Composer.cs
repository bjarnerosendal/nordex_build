using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using NordexFood.ContentFinders;

namespace NordexFood.Composers
{
    /// <summary>
    /// Composer to configure 404 error handling using content finder approach
    /// </summary>
    public class Error404Composer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            // Register our custom content finder as the last chance finder for 404s
            builder.SetContentLastChanceFinder<Page404ContentFinder>();
        }
    }
}
