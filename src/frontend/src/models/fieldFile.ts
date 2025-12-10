import { FieldBase } from "./fieldBase";

export interface FieldFile extends FieldBase {
fileUploadOptions: FileUploadOptions;
}

interface FileUploadOptions {
    "allowAllUploadExtensions": boolean,
    "allowMultipleFileUploads": boolean,
    "allowedUploadExtensions": any[]
}