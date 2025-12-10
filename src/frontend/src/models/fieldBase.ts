import { FieldConditions } from "./fieldConditions";

export interface FieldBase {
    alias: string;
    caption: string;
    condition: FieldConditions;
    helpText: string;
    id: string;
    pattern: string;
    patternInvalidErrorMessage: string;
    placeholder: string;
    preValues: any[];
    required: boolean;
    requiredErrorMessage: string;
    settings: FieldSettings;
    type: FieldType;
    value: any;
}

export interface FieldSettings {
    acceptCopy: string;
    allowMultipleSelections: boolean;
    autocompleteAttribute: string;
    bodyText?: string;
    caption: string;
    captionTag?: string;
    defaultValue: string;
    displayLayout: "Horizontal" | "Vertical";
    fieldType: string;
    html: string;
    maximumLength?: number;
    minimumLength?: number;
    placeholder: string;
    showLabel: boolean;
}

interface FieldType {
    id: string;
    name: string;
    renderInputType: string;
    supportsPreValues: boolean;
    supportsUploadTypes: boolean;
}