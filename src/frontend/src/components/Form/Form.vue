<template>
  <div class="contour umbraco-forms-form umbraco-forms-kruso" v-if="Model?.FormKey" id="form">
    <form @submit.prevent="submitForm" v-if="formData && formData.pages && !submitted">
      <div class="umbraco-forms-page">
        <div v-for="page in formData.pages" :id="page.id">
          <fieldset class="umbraco-forms-fieldset" :id="fieldset.id" v-for="fieldset in page.fieldsets  ">
            <legend v-if="fieldset.caption">{{ fieldset.caption }}</legend>
            <div class="row-fluid" v-for="column in fieldset.columns  ">
              <div class="form-container col-xs-12">
                <strong v-if="column.name">{{ column.name }}</strong>
                <template v-for="field in column.fields  ">
                  <div class="umbraco-forms-field"
                       :class="(field as FieldBase).type.name.toLowerCase() != 'title' ? (field as FieldBase).type.name.toLowerCase() : ''"
                       v-if="showField(field)">
                    <label for="3bdeacf7-eef0-4622-b34c-e79d2a1de1f6" class="umbraco-forms-label"
                           v-if="showFieldLabel(field as FieldBase)">
                      {{ field.caption }}: <span class="umbraco-forms-indicator"
                                                 v-if="field?.required">*</span>
                    </label>

                    <span v-if="field.helpText && fieldType((field as FieldBase).type.name.toLowerCase())
        != Hidden" class="umbraco-forms-tooltip help-block">
                                            {{ field.helpText }}
                                        </span>

                    <div class="umbraco-forms-field-wrapper">
                      <component @fieldChange="onChange"
                                 :is="fieldType((field as FieldBase).type.name.toLowerCase())"
                                 :Model="field as FieldBase" class="mt-2 mb-4">
                      </component>
                    </div>
                    {{ errors[field.alias] }}
                    <span class="field-validation-error"
                          v-if="errors?.find(x => x.key == field.alias)"
                          v-for="error in errors?.find(x => x.key == field.alias)?.value">{{ error
                      }}</span>
                  </div>
                </template>
              </div>
            </div>
          </fieldset>
        </div>
        <div class="umbraco-forms-fieldset">
          <div class="col-xs-12">
            <input type="submit" class="btn btn-brown" :value="formData.submitLabel" />
          </div>
        </div>
      </div>
    </form>
    <div v-else-if="formData && submitted">
      <div v-html="formData.messageOnSubmit" class="success-message">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FieldBase } from '@/models/fieldBase';
import Text from './Text.vue';
import FieldTextArea from './TextArea.vue';
import RadioButtonList from './RadioButtonList.vue';
import Dropdown from './Dropdown.vue';
import Date from './Date.vue';
import Hidden from './Hidden.vue';
import Checkbox from './Checkbox.vue';
import RichText from './RichText.vue';
import Password from './Password.vue';
import TitleAndDescription from './TitleAndDescription.vue';
import FileUpload from './FileUpload.vue'
import CheckboxList from './CheckboxList.vue';
import DataConsent from './DataConsent.vue';
import ValidationField from './ValidationField.vue';
import { Form } from '@/models/form';

// Props
interface Props {
  Model?: Form;
}
const props = defineProps<Props>();

// Reactive state
const formData = ref<any>({});
const culture = ref(document?.documentElement?.lang || 'dk-DK');
const submitted = ref(false);
const fieldData = ref<FieldBase[]>([]);
const errors = ref<any[]>([]);

// Methods
const createFieldArray = () => {
  const fieldArray: FieldBase[] = [];
  formData.value?.pages?.forEach((page: any) => {
    page?.fieldsets?.forEach((fieldset: any) => {
      fieldset?.columns?.forEach((column: any) => {
        column.fields.forEach((field: FieldBase) => {
          let newField = field;
          newField.value = field.settings?.defaultValue;
          fieldArray.push(newField);
        });
      })
    });
  });
  fieldData.value = fieldArray;
};

const showField = (field: FieldBase) => {
  let conditions = field?.condition;
  let actionType = conditions?.actionType;
  let logicType = conditions?.logicType;
  let rules = conditions?.rules;
  let conditionsMetCount = 0;
  let result = false;

  if (rules && rules.length > 0) {
    rules.forEach((rule) => {
      let fieldItem = fieldData.value.find((x: FieldBase) => x.id == rule.field);
      switch (rule.operator) {
        case "Is":
          if (fieldItem?.value == rule.value) {
            conditionsMetCount++;
          }
          break;
        case "IsNot":
          if (fieldItem?.value != rule.value) {
            conditionsMetCount++;
          }
          break;
        case "Contains":
          if (fieldItem?.value?.includes(rule.value)) {
            conditionsMetCount++;
          }
          break;
        case "StartsWith":
          if (fieldItem?.value?.startsWith(rule.value)) {
            conditionsMetCount++;
          }
          break;
        case "EndsWith":
          if (fieldItem?.value?.endsWith(rule.value)) {
            conditionsMetCount++;
          }
          break;
        case "GreaterThen":
          if (parseInt(fieldItem?.value) > parseInt(rule.value)) {
            conditionsMetCount++;
          }
          break;
        case "LessThen":
          if (parseInt(fieldItem?.value) < parseInt(rule.value)) {
            conditionsMetCount++;
          }
          break;
      }
    });
  } else {
    return true;
  }

  if (actionType == "Hide") {
    result = !result;
  }

  if (logicType == 'all') {
    result = conditionsMetCount == rules.length;
  } else {
    result = conditionsMetCount > 0;
  }

  return result;
};

const showFieldLabel = (obj: FieldBase) => {
  return fieldType(obj.type.name.toLowerCase()) != Hidden
      && fieldType(obj.type.name.toLowerCase()) != RichText
      && fieldType(obj.type.name.toLowerCase()) != ValidationField
      && obj.type.name != 'GDPR: Mark\u00E9r formular som f\u00F8lsom'
      && fieldType(obj.type.name.toLowerCase()) != TitleAndDescription;
};

const onChange = (obj: FieldBase) => {
  fieldData.value = fieldData.value.map((element: FieldBase) => {
    if (obj.id == element.id) {
      return { ...element, value: obj.value };
    }
    return element;
  });
  console.log("function field change: ", fieldData.value);
};

const fieldType = (name: string) => {
  let fieldTypeResult;
  switch (name) {
    case 'short answer':
      fieldTypeResult = Text;
      break;
    case 'long answer':
      fieldTypeResult = FieldTextArea;
      break;
    case 'dropdown':
      fieldTypeResult = Dropdown;
      break;
    case 'data consent':
      fieldTypeResult = DataConsent;
      break;
    case 'file upload':
      fieldTypeResult = FileUpload;
      break;
    case 'single choice':
      fieldTypeResult = RadioButtonList;
      break;
    case 'date':
      fieldTypeResult = Date;
      break;
    case 'hidden':
      fieldTypeResult = Hidden;
      break;
    case 'checkbox':
      fieldTypeResult = Checkbox;
      break;
    case 'rich text':
      fieldTypeResult = RichText;
      break;
    case 'password':
      fieldTypeResult = Password;
      break;
    case 'title and description':
      fieldTypeResult = TitleAndDescription;
      break;
    case 'multiple choice':
      fieldTypeResult = CheckboxList;
      break;
    case 'data Consent':
      fieldTypeResult = DataConsent;
      break;
    case 'gdpr: e-mail felt':
      fieldTypeResult = Text;
      break;
    case 'formular bot-beskyttelse':
      fieldTypeResult = ValidationField;
      break;
  }
  return fieldTypeResult;
};

const getForm = async () => {
  if (!props.Model?.FormKey) {
    return;
  }
  const response = await fetch(`/umbraco/forms/delivery/api/v1/definitions/${props?.Model?.FormKey}?contentId=${props?.Model?.ContentKey}&culture=${culture.value}`);
 console.log("api call: ", `/umbraco/forms/delivery/api/v1/definitions/${props?.Model?.FormKey}?contentId=${props?.Model?.ContentKey}&culture=${culture.value}`);
  if (response.status === 200) {
    const data = await response.json();
    formData.value = data;
    createFieldArray();
  }
};


const getFileAsBase64 = (file: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const isFileUpload = (value: FormDataEntryValue) => value instanceof File;

const submitForm = async (event: SubmitEvent) => {
  const data = {
    contentKey: props?.Model?.ContentKey,
    culture: culture.value,
    values: {} as any,
  };
  const formDataEntry = new FormData(event.target as HTMLFormElement);
  for (const [key, value] of formDataEntry) {
    if (isFileUpload(value)) {
      const fileName = (value as File).name;
      const fileContents = await getFileAsBase64(value);
      // We could have multiple files on a field, so need to provide as an array.
      if (!data.values[key]) {
        data.values[key] = [];
      }
      data.values[key].push({
        fileName,
        fileContents,
      });
    } else {
      if (isMultiple(key)) {
        data.values[key] = value?.toString()?.split(',');
      } else {
        data.values[key] = value;
      }
    }
  }

  const h = {
    'Content-Type': 'application/json',
    RequestVerificationToken: `${props.Model?.RequestToken}`,
  };

  const response = await fetch(`/umbraco/forms/delivery/api/v1/entries/${props?.Model?.FormKey}`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(data),
  });
  if (response.status === 202) {
    submitted.value = true;
  } else if (response.status === 422) {
    const validationErrors = await response.json();
    errors.value = Object.entries(validationErrors?.errors).map(([key, value]) => ({ key, value }));
  } else {
    console.log(`Error (${response.status}): ${response.statusText}`);
  }
};

const isMultiple = (key: string) => {
  const field = fieldData.value.find((x: FieldBase) => x.alias === key);
  return field?.type.name.toLowerCase() === 'multiple choice';
};

// Lifecycle hooks
onMounted(() => {
  if (props?.Model?.FormKey != "" && props?.Model?.ContentKey != "" && props?.Model?.HeaderName != "" && props.Model?.RequestToken != "") {
    const event = new CustomEvent('formsMounted');
    document.dispatchEvent(event);
  }
});

// Initialize form - equivalent to created() lifecycle hook
(async () => {
  await getForm();
  
  const fields = Array.from(
      document.querySelectorAll(
          '.form-control, .umbraco-forms-field .text, .umbraco-forms-field textarea, .umbraco-forms-field .datepickerfield, .umbraco-forms-field select',
      ),
  );

  // set class on input if it has a value
  const toggleClasses = (el: HTMLInputElement) => {
    if (el.value) {
      el.classList.add('has-value');
    } else {
      el.classList.remove('has-value');
    }
  };
  
  fields.forEach((el) => {
    toggleClasses(el as HTMLInputElement);
    el.addEventListener('blur', () => {
      toggleClasses(el as HTMLInputElement);
    });

    if (el.classList.contains('datepickerfield')) {
      el.setAttribute('readonly', 'true');
    }
  });
})();
</script>

<style lang="scss" scoped>

.form-container {
  max-width: 600px;
  margin: 1rem;
}

.validation-summary {
  color: var(--danger);
}

.success-message {
  color: var(--success);
  font-weight: 700;
}
.umbraco-forms-page {
  margin: 2rem; 
}

.umbraco-forms-field {
  margin-bottom: var(--spacer-md);
}

.umbraco-forms-label {
  font-weight: bold;
  margin-bottom: var(--spacer-sm);
  display: block;
}

.umbraco-forms-field-wrapper {
  margin-bottom: var(--spacer-sm);
}

.field-validation-error {
  color: var(--danger);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.help-block {
  font-size: 0.875rem;
  color: var(--grey-700);
  margin-bottom: var(--spacer-sm);
}

//input[type="submit"].btn-primary {
//  background-color: var(--primary);
//  border-color: var(--primary);
//  color: var(--white);
//  padding: var(--spacer-sm) var(--spacer-md);
//  font-size: 1rem;
//  cursor: pointer;
//}

//input[type="submit"] {
//  white-space: break-spaces;
//}
//
//input[type="radio"], input[type="checkbox"] {
//  margin-right: var(--spacer-sm);
//}
//
//input[type="radio"] + label, input[type="checkbox"] + label {
//  display: inline-block;
//  margin-bottom: var(--spacer-sm);
//  font-size: 1rem;
//}
//
//select:focus, input[type="text"]:focus, input[type="email"]:focus, input[type="password"]:focus, textarea:focus {
//  border-color: var(--blue-200);
//  outline: 0;
//  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
//}

fieldset {
  border: none;
  border-radius: 0.25rem;
  padding: 0;
  margin-bottom: 0;
}

</style>