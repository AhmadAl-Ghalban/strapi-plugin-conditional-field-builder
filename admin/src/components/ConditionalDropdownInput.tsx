import * as React from 'react';
import { useIntl } from 'react-intl';
import {
  Field,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Box,
  Typography,
} from '@strapi/design-system';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import {
  parseOptions,
  parseValue,
  validateValue,
  type ValidationErrors,
} from '../utils/validation';
import { getTranslation } from '../utils/getTranslation';
import type {
  ConditionalDropdownAttribute,
  ConditionalDropdownValue,
  InputOnChange,
} from '../types';

type Props = {
  name: string;
  value?: string | null;
  onChange: InputOnChange;
  intlLabel?: { id: string; defaultMessage: string };
  description?: { id: string; defaultMessage: string };
  placeholder?: { id: string; defaultMessage: string };
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  labelAction?: React.ReactNode;
  attribute?: ConditionalDropdownAttribute;
};

/**
 * Input for the `conditional-dropdown` custom field.
 *
 * Reads option definitions from `attribute.options` (or the JSON
 * fallback `attribute.optionsJson`), renders a dropdown of choices,
 * and then mounts the conditional fields tied to the chosen option.
 *
 * The value is persisted as a JSON string in the shape:
 *   { selectedOption, data }
 */
const ConditionalDropdownInput = React.forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    const {
      name,
      value,
      onChange,
      intlLabel,
      description,
      placeholder,
      disabled,
      required,
      error,
      labelAction,
      attribute,
    } = props;

    const { formatMessage } = useIntl();

    const options = React.useMemo(() => {
      // CTB stores per-field config under `attribute.options.<name>`.
      // Accept either the raw JSON string (`optionsJson`) or a pre-parsed array.
      const raw =
        (attribute as any)?.options?.optionsJson ??
        (attribute as any)?.optionsJson ??
        (attribute as any)?.options;
      return parseOptions(raw);
    }, [attribute]);

    const parsed: ConditionalDropdownValue = React.useMemo(
      () => parseValue(value),
      [value]
    );

    const selected = React.useMemo(
      () => options.find((o) => o.value === parsed.selectedOption) ?? null,
      [options, parsed.selectedOption]
    );

    const [touched, setTouched] = React.useState<Record<string, boolean>>({});

    const localErrors: ValidationErrors = React.useMemo(
      () => validateValue(parsed, options, Boolean(required)),
      [parsed, options, required]
    );

    const emit = (next: ConditionalDropdownValue) => {
      onChange({
        target: { name, value: JSON.stringify(next), type: 'json' },
      });
    };

    const handleOptionChange = (nextValue: string) => {
      emit({ selectedOption: nextValue || null, data: {} });
      setTouched({});
    };

    const handleFieldChange = (fieldName: string, fieldValue: unknown) => {
      setTouched((t) => ({ ...t, [fieldName]: true }));
      emit({
        selectedOption: parsed.selectedOption,
        data: { ...parsed.data, [fieldName]: fieldValue },
      });
    };

    const hint = description ? formatMessage(description) : undefined;
    const label = intlLabel ? formatMessage(intlLabel) : name;
    const placeholderText = placeholder
      ? formatMessage(placeholder)
      : formatMessage({
          id: getTranslation('conditional-dropdown.placeholder'),
          defaultMessage: 'Select an option…',
        });

    return (
      <Field.Root
        ref={ref}
        name={name}
        id={name}
        error={error || localErrors._form}
        hint={hint}
        required={required}
      >
        <Flex direction="column" alignItems="stretch" gap={3}>
          <Field.Label action={labelAction}>{label}</Field.Label>

          {options.length === 0 ? (
            <Box
              padding={3}
              background="neutral100"
              hasRadius
              borderColor="neutral200"
              borderWidth="1px"
              borderStyle="solid"
            >
              <Typography variant="omega" textColor="neutral600">
                {formatMessage({
                  id: getTranslation('conditional-dropdown.no-options'),
                  defaultMessage:
                    'No options configured. Open the Content-Type Builder and add options to this field.',
                })}
              </Typography>
            </Box>
          ) : (
            <SingleSelect
              id={`${name}-select`}
              value={parsed.selectedOption ?? ''}
              disabled={disabled}
              placeholder={placeholderText}
              onChange={handleOptionChange}
              onClear={() => handleOptionChange('')}
            >
              {options.map((opt) => (
                <SingleSelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </SingleSelectOption>
              ))}
            </SingleSelect>
          )}

          {selected && (selected.fields?.length ?? 0) > 0 && (
            <Box
              padding={4}
              background="neutral0"
              hasRadius
              borderColor="neutral200"
              borderWidth="1px"
              borderStyle="solid"
            >
              <Flex direction="column" alignItems="stretch" gap={4}>
                {selected.fields!.map((f) => (
                  <DynamicFieldRenderer
                    key={f.name}
                    field={f}
                    value={parsed.data?.[f.name]}
                    disabled={disabled}
                    error={touched[f.name] ? localErrors[f.name] : undefined}
                    onChange={handleFieldChange}
                  />
                ))}
              </Flex>
            </Box>
          )}

          <Field.Hint />
          <Field.Error />
        </Flex>
      </Field.Root>
    );
  }
);

ConditionalDropdownInput.displayName = 'ConditionalDropdownInput';

export default ConditionalDropdownInput;
