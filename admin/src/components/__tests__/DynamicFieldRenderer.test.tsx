import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DynamicFieldRenderer from '../DynamicFieldRenderer';
import type { ConditionalField } from '../../types';

const renderField = (field: ConditionalField, value: unknown = '') => {
  const onChange = vi.fn();
  const utils = render(
    <DynamicFieldRenderer field={field} value={value} onChange={onChange} />
  );
  return { ...utils, onChange };
};

describe('DynamicFieldRenderer', () => {
  it('renders a text input by default and forwards changes', () => {
    const { onChange } = renderField({ name: 'title', type: 'text' });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'hello' },
    });
    expect(onChange).toHaveBeenCalledWith('title', 'hello');
  });

  it('renders a number input and forwards numeric values', () => {
    const { onChange } = renderField({ name: 'n', type: 'number' });
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '42' },
    });
    expect(onChange).toHaveBeenCalledWith('n', 42);
  });

  it('renders a select with provided choices', () => {
    const { onChange } = renderField({
      name: 's',
      type: 'select',
      choices: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'b' },
    });
    expect(onChange).toHaveBeenCalledWith('s', 'b');
  });

  it('renders a checkbox and forwards boolean changes', () => {
    const { onChange } = renderField(
      { name: 'agree', type: 'checkbox' },
      false
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith('agree', true);
  });

  it('renders a textarea for type=textarea', () => {
    const { onChange } = renderField({ name: 'desc', type: 'textarea' });
    const el = screen.getByRole('textbox');
    expect(el.tagName).toBe('TEXTAREA');
    fireEvent.change(el, { target: { value: 'x' } });
    expect(onChange).toHaveBeenCalledWith('desc', 'x');
  });
});
