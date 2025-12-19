using Microsoft.AspNetCore.Rewrite;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration.Models;

namespace NordexFood.Configuration;

public static class RedirectConfigurator
{
    public static void ConfigureSystemRedirects(this IApplicationBuilder app, IWebHostEnvironment env, IOptions<WebRoutingSettings> options)
    {
        var rewriteOptions = new RewriteOptions();

        if (env.IsProduction())
        {
            // redirect to https
            rewriteOptions.AddRedirectToHttps();
            // redirect to non-www
            rewriteOptions.AddRedirectToNonWww();
        }
        // add trailing slash except on umbraco routes
        var pattern = "^(?!.*/?umbraco)(((.*/)|(/?))[^/.]+(?!/$))$";
        rewriteOptions.AddRedirect(pattern, "$1/", 301);
        app.UseRewriter(rewriteOptions);
        // redirect to https
        app.UseHttpsRedirection();
    }
}