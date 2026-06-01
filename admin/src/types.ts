/**
 * Shared types for the Conditional Dropdown custom field.
 */

export type DynamicFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime'
  | 'boolean'
  | 'range';

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface ConditionalField {
  name: string;
  label?: string;
  type: DynamicFieldType;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  choices?: ChoiceOption[];
  defaultValue?: unknown;
}

export interface DropdownOption {
  label: string;
  value: string;
  /** Optional categorical type tag — surfaces alongside `fields` for UX hints. */
  type?: DynamicFieldType | string;
  fields?: ConditionalField[];
}

export interface ConditionalDropdownValue {
  selectedOption: string | null;
  data: Record<string, unknown>;
}

export interface ConditionalDropdownAttribute {
  type: string;
  customField?: string;
  options?: DropdownOption[];
  /** Raw JSON string fallback when options were entered via the textarea. */
  optionsJson?: string;
  required?: boolean;
}

export interface InputChangeEvent {
  target: { name: string; value: string; type: string };
}

export type InputOnChange = (event: InputChangeEvent) => void;
