import * as React from 'react';
import {
  Field,
  TextInput,
  Textarea,
  NumberInput,
  Checkbox,
  Radio,
  SingleSelect,
  SingleSelectOption,
  DateTimePicker,
  Toggle,
  Flex,
} from '@strapi/design-system';
import type { ConditionalField } from '../types';

type Props = {
  field: ConditionalField;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  error?: string;
  disabled?: boolean;
};

/**
 * Render a single conditional field. Supported types map onto the
 * Strapi design-system primitives so the input feels native to admins.
 */
const DynamicFieldRenderer: React.FC<Props> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const label = field.label || field.name;
  const id = `cdf-${field.name}`;

  const setVal = (next: unknown) => onChange(field.name, next);

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={id}
            name={field.name}
            value={(value as string) ?? ''}
            disabled={disabled}
            placeholder={field.placeholder}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setVal(e.target.value)
            }
          />
        );

      case 'number':
      case 'range':
        return (
          <NumberInput
            id={id}
            name={field.name}
            value={value as number | undefined}
            disabled={disabled}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            onValueChange={(v: number | undefined) => setVal(v)}
          />
        );

      case 'email':
        return (
          <TextInput
            id={id}
            name={field.name}
            type="email"
            value={(value as string) ?? ''}
            disabled={disabled}
            placeholder={field.placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setVal(e.target.value)
            }
          />
        );

      case 'password':
        return (
          <TextInput
            id={id}
            name={field.name}
            type="password"
            value={(value as string) ?? ''}
            disabled={disabled}
            placeholder={field.placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setVal(e.target.value)
            }
          />
        );

      case 'select':
        return (
          <SingleSelect
            id={id}
            value={(value as string) ?? ''}
            disabled={disabled}
            placeholder={field.placeholder}
            onChange={(v: string | number) => setVal(v == null ? '' : String(v))}
          >
            {(field.choices ?? []).map((c) => (
              <SingleSelectOption key={c.value} value={c.value}>
                {c.label}
              </SingleSelectOption>
            ))}
          </SingleSelect>
        );

      case 'checkbox':
        return (
          <Checkbox
            id={id}
            name={field.name}
            checked={Boolean(value)}
            disabled={disabled}
            onCheckedChange={(checked: boolean) => setVal(checked)}
          >
            {label}
          </Checkbox>
        );

      case 'boolean':
        return (
          <Toggle
            id={id}
            checked={Boolean(value)}
            disabled={disabled}
            onLabel="On"
            offLabel="Off"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setVal(e.target.checked)
            }
          />
        );

      case 'radio':
        return (
          <Radio.Group
            value={(value as string) ?? ''}
            disabled={disabled}
            onValueChange={(v: string) => setVal(v)}
          >
            <Flex direction="column" alignItems="stretch" gap={2}>
              {(field.choices ?? []).map((c) => (
                <Flex key={c.value} gap={2} alignItems="center">
                  <Radio.Item value={c.value} id={`${id}-${c.value}`} />
                  <label htmlFor={`${id}-${c.value}`}>{c.label}</label>
                </Flex>
              ))}
            </Flex>
          </Radio.Group>
        );

      case 'date':
      case 'datetime':
      case 'time': {
        const parsed = value ? new Date(value as string) : undefined;
        return (
          <DateTimePicker
            id={id}
            name={field.name}
            value={parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined}
            disabled={disabled}
            onChange={(d?: Date) => setVal(d ? d.toISOString() : '')}
          />
        );
      }

      case 'text':
      default:
        return (
          <TextInput
            id={id}
            name={field.name}
            value={(value as string) ?? ''}
            disabled={disabled}
            placeholder={field.placeholder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setVal(e.target.value)
            }
          />
        );
    }
  };

  return (
    <Field.Root
      name={field.name}
      id={id}
      error={error}
      required={field.required}
    >
      <Flex direction="column" alignItems="stretch" gap={1}>
        {field.type !== 'checkbox' && <Field.Label>{label}</Field.Label>}
        {renderInput()}
        <Field.Error />
      </Flex>
    </Field.Root>
  );
};

export default DynamicFieldRenderer;
