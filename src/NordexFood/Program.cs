using NordexFood.Configuration;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration.Models;


WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
var environment = builder.Environment;

// Add controllers and API services
builder.Services.AddControllers();

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .Build();

WebApplication app = builder.Build();

var options = app.Services.GetRequiredService<IOptions<WebRoutingSettings>>();
app.ConfigureSystemRedirects(environment, options);

await app.BootUmbracoAsync();

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
        u.EndpointRouteBuilder.MapControllers(); // Add API controller routing
    });

await app.RunAsync();
