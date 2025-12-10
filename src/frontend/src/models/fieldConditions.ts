export interface FieldConditions {
    actionType: string;
    logicType: string,
    rules: Rule[];
}
export interface Rule {
    field: string;
    operator: string;
    value: string;
}