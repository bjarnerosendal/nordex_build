using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace NordexFood.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class TranslationController : ControllerBase
    {
        private readonly ILocalizationService _localizationService;

        public TranslationController(ILocalizationService localizationService)
        {
            _localizationService = localizationService;
        }

        [HttpGet("translations")]
        public IActionResult GetTranslations(string? culture = null)
        {
            var currentCulture = culture ?? Thread.CurrentThread.CurrentCulture.Name;
            var translations = new Dictionary<string, string>();

            try
            {
                // Get all dictionary items
                var allDictionaryItems = _localizationService.GetDictionaryItemDescendants(null);
                
                foreach (var dictionaryItem in allDictionaryItems)
                {
                    var translationValue = GetDictionaryValue(dictionaryItem.ItemKey, currentCulture);
                    if (!string.IsNullOrEmpty(translationValue))
                    {
                        translations[dictionaryItem.ItemKey] = translationValue;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading dictionary items: {ex.Message}");
                return StatusCode(500, "Error loading translations");
            }

            return Ok(translations);
        }

        private string GetDictionaryValue(string key, string culture)
        {
            try
            {
                var dictionaryItem = _localizationService.GetDictionaryItemByKey(key);
                if (dictionaryItem != null)
                {
                    // Try to get translation for specific culture
                    var translation = dictionaryItem.Translations
                        .FirstOrDefault(t => t.LanguageIsoCode.Equals(culture, StringComparison.OrdinalIgnoreCase));
                    
                    if (translation != null && !string.IsNullOrEmpty(translation.Value))
                    {
                        return translation.Value;
                    }
                    
                    // Fallback to any available translation
                    var anyTranslation = dictionaryItem.Translations
                        .FirstOrDefault(t => !string.IsNullOrEmpty(t.Value));
                    
                    if (anyTranslation != null)
                    {
                        return anyTranslation.Value;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting dictionary value for {key}: {ex.Message}");
            }

            return string.Empty;
        }
    }
}
