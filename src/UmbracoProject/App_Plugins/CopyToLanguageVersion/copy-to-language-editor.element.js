import {
  LitElement,
  css,
  html
  
} from "@umbraco-cms/backoffice/external/lit";

import { UmbElementMixin } from '@umbraco-cms/backoffice/element-api';
import { umbOpenModal, UMB_CONFIRM_MODAL } from '@umbraco-cms/backoffice/modal';
import { UMB_ENTITY_CONTEXT } from "@umbraco-cms/backoffice/entity";
import { UmbContextConsumerController } from '@umbraco-cms/backoffice/context-api';
import { UMB_VARIANT_CONTEXT } from '@umbraco-cms/backoffice/variant';

// Default fallback language options
let LanguageOptions = [
];

// Load available languages from API
async function loadAvailableLanguages() {
  try {
    const response = await fetch('/umbraco/api/ContentLocalizationApi/GetAvailableLanguages');
    if (response.ok) {
      const languages = await response.json();
      if (languages && languages.length > 0) {
        LanguageOptions = languages;
      }
    }
  } catch (error) {
    console.warn('Failed to load available languages from API, using fallback options:', error);
  }
}

// Load languages when the module loads
loadAvailableLanguages();

export class CopyToLanguageEditorElement extends UmbElementMixin(LitElement) {
  static properties = {
    value: { type: String },
    config: { type: Object },
    readonly: { type: Boolean },
    _loading: { state: true },
    _selectedLanguage: { state: true },
    _language: { state: true },
    _isTranslating: { state: true },
    _targetLanguage: { state: true },
    _languageOptions: { state: true }
  };

  constructor() {
    super();
    
     new UmbContextConsumerController(this, UMB_VARIANT_CONTEXT, async (variantCtx) => {
      const culture = await variantCtx.getCulture();
      this._currentCulture = culture;
    });
    this.value = '';
    this.config = {};
    this.readonly = false;
    this._loading = false;
    this._selectedLanguage = null; // Default to Swedish
    this._language = null;
    this._isTranslating = false;
    this._targetLanguage = '';
    this._languageOptions = LanguageOptions; // Initialize with current options
    
    // Consume the entity context
    this.consumeContext(UMB_ENTITY_CONTEXT, (context) => {
      this._entityContext = context;
    });
  }

  async connectedCallback() {
    super.connectedCallback();
    this._language = {
      twoLetterISO: 'sv',
      name: this._getLocalizedText('swedish')
    };
    
    // Reload languages when component connects
    await this._loadLanguages();
  }


  async _loadLanguages() {
    try {
      const response = await fetch('/umbraco/api/ContentLocalizationApi/GetAvailableLanguages');
      if (response.ok) {
        const languages = await response.json();
        if (languages && languages.length > 0) {
         // languages = languages.filter(lang => lang.value !== this._currentCulture);
          this._languageOptions = languages;
          LanguageOptions = languages; // Update global variable too
          this.requestUpdate();
        }
      }
    } catch (error) {
      console.warn('Failed to load available languages from API:', error);
    }
  }

  _getBackofficeLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('cculture') || 'en';
  }

  _getLocalizedText(key) {
    const texts = {
      en: {
        success: "Success",
        error: "Error",
        confirmTitle: "Are you sure?",
        confirmContent: "This will copy the content to the language: ",
        confirmContent2: "All existing content in the target language will be overwritten.",
        cancel: "Cancel",
        copy: "Copy",
        copySuccess: "Content copied to ",
        copyError: "Failed to copy content to ",
        copyTo: "Copy to ",
        swedish: "Swedish",
        danish: "Danish",
        translating: "Translating",
        copyWithoutTranslate: "Copy without translating content"
      },
      da: {
        success: "Succes",
        error: "Fejl",
        confirmTitle: "Er du sikker?",
        confirmContent: "Dette vil kopiere indholdet til sproget: ",
        confirmContent2: "Alt eksisterende indhold på målsproget vil blive overskrevet.",
        cancel: "Annuller",
        copy: "Kopier",
        copySuccess: "Indhold kopieret til ",
        copyError: "Kunne ikke kopiere indhold til ",
        copyTo: "Kopier til ",
        swedish: "Svensk",
        danish: "Dansk",
        translating: "Oversætter",
        copyWithoutTranslate: "Kopier uden at oversætte indholdet"
      }
    };

    const lang = this._getBackofficeLanguage();
    return texts[lang]?.[key] || texts['en'][key] || key;
  }

  #onSelectLanguage = (e) => {
    this._selectedLanguage = e.target.value;
    this.requestUpdate();
  }

  _getSelectedLanguageName() {
    const selectedOption = this._languageOptions.find(option => option.value === this._selectedLanguage);
    return selectedOption ? selectedOption.name : this._selectedLanguage;
  }

  #onCopyToSwedish = () => {
    this._targetLanguage = 'sv';
    this.#openConfirmModal();
  }


  #openConfirmModal() {
    
    umbOpenModal(
      this, UMB_CONFIRM_MODAL,
      {
        data: {
          headline: this._getLocalizedText('confirmTitle'),
          content: html`
            <p>${this._getLocalizedText('confirmContent')}${this._getSelectedLanguageName()}</p>
            <p>${this._getLocalizedText('confirmContent2')}</p>
          `,
          color: "danger",
          confirmLabel: this._getLocalizedText('copy'),
        }
      }
    )
    .then(() => {
      this._copyToLanguage();
    })
    .catch(() => {
      // User cancelled - do nothing
    });
  }

  render() {
    // Find the selected language object to get its name
    const selectedLanguageObj = this._languageOptions.find(option => option.value === this._selectedLanguage);

    return html`
      <div class="copy-to-language-wrapper">
      <uui-select
        .options="${this._languageOptions}"
        .value="${this._selectedLanguage}"
        @change="${this.#onSelectLanguage}"
        look="placeholder">
        <uui-option slot="placeholder">Select language...</uui-option>
      </uui-select>
      
      ${this._selectedLanguage && this._selectedLanguage !== ''
        ? html`
        <uui-button
          color="positive"
          look="primary"
          @click="${this.#onCopyToSwedish}"
          label="${this._getLocalizedText('copyTo')} ${selectedLanguageObj ? selectedLanguageObj.name : ""}"
          .disabled="${!this._selectedLanguage || this._isTranslating}">
          ${this._isTranslating && this._targetLanguage === 'sv'
          ? this._getLocalizedText('translating')
          : this._getLocalizedText('copyTo') + ' ' + (selectedLanguageObj ? selectedLanguageObj.name : "")}
        </uui-button>

        `
        : null}
      </div>
    `;
  }

  async _copyToLanguage() {
   
    this._isTranslating = true;
    this.requestUpdate();

    try {
      const contentId = this._entityContext?.getUnique();
      const sourceCulture = this._currentCulture;
    
      // If selectedLanguage is more than 2 chars (e.g., da-DK), use only the part before '-'
      let targetCulture = this._selectedLanguage;
    /*  if (targetCulture && targetCulture.length > 2 && targetCulture.includes('-')) {
        targetCulture = targetCulture.split('-')[0];
      }*/

      const params = new URLSearchParams({
        id: contentId,
        sourceCulture: sourceCulture,
        targetCulture: targetCulture,
      });
      
      const response = await fetch(`/umbraco/api/ContentLocalizationApi/CreateLanguageCopy?${params}`);

      if (!response.ok) throw new Error();

      const targetLanguageName = this._targetLanguage === 'sv' ? this._getLocalizedText('swedish') : this._getLocalizedText('danish');
      this._showNotification('success', this._getLocalizedText('copySuccess') + targetLanguageName);

      setTimeout(() => {
        const culture = this._targetLanguage;
        const contentId = this._entityContext?.getUnique();
        window.location.href = `/umbraco#/content/content/edit/${contentId}?cculture=${culture}&mculture=${culture}`;
        window.location.reload();
      }, 1000);
    } catch (err) {
      const targetLanguageName = this._targetLanguage === 'sv' ? this._getLocalizedText('swedish') : this._getLocalizedText('danish');
      this._showNotification('error', this._getLocalizedText('copyError') + targetLanguageName);
    } finally {
      this._isTranslating = false;
      this.requestUpdate();
    }
  }

  _showNotification(type, message) {
    const el = document.createElement('div');
    el.className = `notify ${type}`;
    el.textContent = message;
    document.body.appendChild(el);

    setTimeout(() => {
      if (document.body.contains(el)) {
        document.body.removeChild(el);
      }
    }, 4000);
  }

  static styles = css`
    .copy-to-language-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .copy-to-language-wrapper > * {
      width: 100%;
    }

    .notify {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      border-radius: 4px;
      color: white;
      z-index: 9999;
    }

    .notify.success {
      background: #4caf50;
    }

    .notify.error {
      background: #f44336;
    }
  `;
}

customElements.define('copy-to-language-editor', CopyToLanguageEditorElement);

// Export the element class for Umbraco 16
export { CopyToLanguageEditorElement as element };
export default CopyToLanguageEditorElement;
