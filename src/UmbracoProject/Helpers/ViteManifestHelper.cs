using System.Text.Json;
using System.Text.Json.Serialization;

namespace NordexFood.Helpers
{
    public static class ViteManifestHelper
    {
        private static readonly string ManifestPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/frontend/assets/manifest.json");
        private static readonly Lazy<Dictionary<string, ManifestEntry>> Manifest = new(LoadManifest);

        private static Dictionary<string, ManifestEntry> LoadManifest()
        {
            if (!File.Exists(ManifestPath))
            {
                throw new FileNotFoundException($"Vite manifest not found at {ManifestPath}");
            }

            var json = File.ReadAllText(ManifestPath);
            return JsonSerializer.Deserialize<Dictionary<string, ManifestEntry>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true 
            }) ?? new Dictionary<string, ManifestEntry>();
        }

        public static (string JsFile, List<string> CssFiles) GetAsset(string entry)
        {
            if (!Manifest.Value.TryGetValue(entry, out var asset))
            {
                throw new KeyNotFoundException($"Asset '{entry}' not found in Vite manifest.");
            }

            var jsFile = $"/frontend/{asset.File}";
            var cssFiles = asset.Css?.Select(c => $"/frontend/{c}").ToList() ?? new List<string>();

            return (jsFile, cssFiles);
        }

        private class ManifestEntry
        {
            [JsonPropertyName("file")]
            public string File { get; set; }

            [JsonPropertyName("css")]
            public List<string>? Css { get; set; }
        }
    }
}