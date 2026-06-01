import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import { vi } from 'vitest';

// Mock @strapi/design-system with minimal HTML stand-ins so tests don't
// require the real ThemeProvider. We only care about props/handlers our
// components wire up, not DS internals.
vi.mock('@strapi/design-system', () => {
  const passthrough =
    (tag: keyof JSX.IntrinsicElements = 'div') =>
    ({ children, ...rest }: any) =>
      React.createElement(tag, rest, children);

  const Field: any = ({ children, error, ...rest }: any) =>
    React.createElement(
      'div',
      { 'data-field-root': true, 'data-error': error || undefined, ...rest },
      children
    );
  Field.Root = Field;
  Field.Label = ({ children }: any) =>
    React.createElement('label', null, children);
  Field.Hint = () => null;
  Field.Error = () => null;

  const TextInput = ({ value, onChange, ...rest }: any) =>
    React.createElement('input', { value: value ?? '', onChange, ...rest });

  const Textarea = ({ value, onChange, ...rest }: any) =>
    React.createElement('textarea', {
      value: value ?? '',
      onChange,
      ...rest,
    });

  const NumberInput = ({ value, onValueChange, ...rest }: any) =>
    React.createElement('input', {
      type: 'number',
      value: value ?? '',
      onChange: (e: any) => {
        const v = e.target.value;
        onValueChange?.(v === '' ? undefined : Number(v));
      },
      ...rest,
    });

  const Checkbox = ({ children, checked, onCheckedChange, ...rest }: any) =>
    React.createElement(
      'label',
      null,
      React.createElement('input', {
        type: 'checkbox',
        checked: Boolean(checked),
        onChange: (e: any) => onCheckedChange?.(e.target.checked),
        ...rest,
      }),
      children
    );

  const Toggle = ({ checked, onChange, ...rest }: any) =>
    React.createElement('input', {
      type: 'checkbox',
      role: 'switch',
      checked: Boolean(checked),
      onChange,
      ...rest,
    });

  const SingleSelect = ({ value, onChange, onClear, children, ...rest }: any) =>
    React.createElement(
      'select',
      {
        value: value ?? '',
        onChange: (e: any) => {
          const v = e.target.value;
          if (v === '' && onClear) onClear();
          else onChange?.(v);
        },
        ...rest,
      },
      React.createElement('option', { value: '' }, ''),
      children
    );

  const SingleSelectOption = ({ value, children }: any) =>
    React.createElement('option', { value }, children);

  const DateTimePicker = ({ value, onChange, ...rest }: any) =>
    React.createElement('input', {
      type: 'datetime-local',
      value:
        value instanceof Date && !Number.isNaN(value.getTime())
          ? value.toISOString().slice(0, 16)
          : '',
      onChange: (e: any) => {
        const raw = e.target.value;
        onChange?.(raw ? new Date(raw) : undefined);
      },
      ...rest,
    });

  const RadioGroup: any = ({ value, onValueChange, children, ...rest }: any) =>
    React.createElement(
      'div',
      {
        role: 'radiogroup',
        'data-value': value ?? '',
        onClick: (e: any) => {
          const v = (e.target as HTMLElement).getAttribute('data-radio-value');
          if (v) onValueChange?.(v);
        },
        ...rest,
      },
      children
    );
  const RadioItem = ({ value, id }: any) =>
    React.createElement('button', {
      type: 'button',
      id,
      'data-radio-value': value,
    });
  const Radio = { Group: RadioGroup, Item: RadioItem };

  return {
    Field,
    Flex: passthrough('div'),
    Box: passthrough('div'),
    Typography: passthrough('span'),
    TextInput,
    Textarea,
    NumberInput,
    Checkbox,
    Toggle,
    SingleSelect,
    SingleSelectOption,
    DateTimePicker,
    Radio,
  };
});

// react-intl: render messages as their defaultMessage; ignore providers.
vi.mock('react-intl', async () => {
  return {
    useIntl: () => ({
      formatMessage: (m: { defaultMessage?: string; id?: string }) =>
        m?.defaultMessage ?? m?.id ?? '',
    }),
    IntlProvider: ({ children }: any) => children,
    FormattedMessage: ({ defaultMessage, id }: any) =>
      React.createElement(React.Fragment, null, defaultMessage ?? id ?? ''),
  };
});
