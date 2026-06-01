import type {
  ConditionalDropdownValue,
  ConditionalField,
  DropdownOption,
} from '../types';

/**
 * Validation errors keyed by conditional field name.
 *
 * The special `_form` key carries top-level errors (e.g. "no option selected").
 */
export type ValidationErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a single conditional field value.
 * Returns an error message or `null` when the value is acceptable.
 */
export const validateField = (
  field: ConditionalField,
  value: unknown
): string | null => {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '');

  if (field.required && isEmpty) {
    return `${field.label || field.name} is required`;
  }
  if (isEmpty) return null;

  switch (field.type) {
    case 'email':
      if (typeof value !== 'string' || !EMAIL_RE.test(value)) {
        return 'Invalid email address';
      }
      break;
    case 'number':
    case 'range': {
      const n = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(n)) return 'Must be a number';
      if (field.min !== undefined && n < field.min) return `Must be >= ${field.min}`;
      if (field.max !== undefined && n > field.max) return `Must be <= ${field.max}`;
      break;
    }
    case 'date':
    case 'datetime':
      if (Number.isNaN(Date.parse(String(value)))) {
        return 'Invalid date';
      }
      break;
  }
  return null;
};

/**
 * Validate the full conditional-dropdown value against the configured options.
 */
export const validateValue = (
  value: ConditionalDropdownValue | null,
  options: DropdownOption[],
  isRequired = false
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!value || !value.selectedOption) {
    if (isRequired) errors._form = 'Please select an option';
    return errors;
  }

  const selected = options.find((o) => o.value === value.selectedOption);
  if (!selected) {
    errors._form = 'Selected option is no longer available';
    return errors;
  }

  for (const field of selected.fields ?? []) {
    const err = validateField(field, value.data?.[field.name]);
    if (err) errors[field.name] = err;
  }

  return errors;
};

/**
 * Safely parse the `options` attribute, which may arrive as an array,
 * a JSON string, or be missing entirely.
 */
export const parseOptions = (raw: unknown): DropdownOption[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as DropdownOption[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

/**
 * Parse a stored value that may be a string (JSON) or an object.
 */
export const parseValue = (raw: unknown): ConditionalDropdownValue => {
  const empty: ConditionalDropdownValue = { selectedOption: null, data: {} };
  if (!raw) return empty;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return { ...empty, ...parsed };
    } catch {
      return empty;
    }
  }
  if (typeof raw === 'object') return { ...empty, ...(raw as object) };
  return empty;
};
