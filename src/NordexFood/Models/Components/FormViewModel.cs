namespace Umbraco.Cms.Web.Common.PublishedModels
{
    public class FormViewModel
    {
        public string? FormKey { get; set; }
        public string? ContentKey { get; set; }
        public string? RequestToken { get; set; }
        public string? HeaderName { get; set; }

        public string? Headline { get; set; }
        public string? Text { get; set; }
    }
}