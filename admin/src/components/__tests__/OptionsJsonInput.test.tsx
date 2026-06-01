import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OptionsJsonInput from '../OptionsJsonInput';

describe('OptionsJsonInput', () => {
  it('emits onChange with raw text and reports JSON parse errors locally', () => {
    const onChange = vi.fn();
    render(
      <OptionsJsonInput
        name="optionsJson"
        value=""
        onChange={onChange}
        intlLabel={{ id: 'l', defaultMessage: 'Options JSON' }}
      />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'not json' } });

    expect(onChange).toHaveBeenCalledWith({
      target: { name: 'optionsJson', value: 'not json', type: 'json' },
    });

    const root = textarea.closest('[data-field-root]') as HTMLElement;
    expect(root.getAttribute('data-error')).toBeTruthy();
  });

  it('rejects non-array JSON with a clear message', () => {
    const onChange = vi.fn();
    render(
      <OptionsJsonInput name="optionsJson" value="" onChange={onChange} />
    );
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"x":1}' } });

    const root = textarea.closest('[data-field-root]') as HTMLElement;
    expect(root.getAttribute('data-error')).toMatch(/array/i);
  });

  it('clears local error for valid array JSON', () => {
    const onChange = vi.fn();
    render(
      <OptionsJsonInput name="optionsJson" value="" onChange={onChange} />
    );
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '[{"label":"a","value":"a"}]' } });

    const root = textarea.closest('[data-field-root]') as HTMLElement;
    expect(root.getAttribute('data-error')).toBeFalsy();
  });
});
