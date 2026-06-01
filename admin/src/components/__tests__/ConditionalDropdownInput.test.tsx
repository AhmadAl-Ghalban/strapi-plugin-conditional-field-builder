import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConditionalDropdownInput from '../ConditionalDropdownInput';

const options = [
  {
    label: 'Text',
    value: 'text',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'desc', type: 'textarea' },
    ],
  },
  {
    label: 'Date',
    value: 'date',
    fields: [{ name: 'when', type: 'date' }],
  },
];

const attribute = { options: { optionsJson: JSON.stringify(options) } } as any;

describe('ConditionalDropdownInput', () => {
  it('shows a placeholder card when no options are configured', () => {
    const onChange = vi.fn();
    render(
      <ConditionalDropdownInput
        name="cdf"
        value={null}
        onChange={onChange}
        attribute={{ options: { optionsJson: '[]' } } as any}
      />
    );
    expect(
      screen.getByText(/no options configured/i)
    ).toBeInTheDocument();
  });

  it('emits a fresh value when the option changes', () => {
    const onChange = vi.fn();
    render(
      <ConditionalDropdownInput
        name="cdf"
        value={null}
        onChange={onChange}
        attribute={attribute}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'text' },
    });
    expect(onChange).toHaveBeenCalledWith({
      target: {
        name: 'cdf',
        value: JSON.stringify({ selectedOption: 'text', data: {} }),
        type: 'json',
      },
    });
  });

  it('renders conditional fields for the selected option', () => {
    const onChange = vi.fn();
    const value = JSON.stringify({ selectedOption: 'text', data: {} });
    render(
      <ConditionalDropdownInput
        name="cdf"
        value={value}
        onChange={onChange}
        attribute={attribute}
      />
    );
    // Two field labels rendered: title + desc
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('desc')).toBeInTheDocument();
  });

  it('merges sub-field edits into the JSON value', () => {
    const onChange = vi.fn();
    const value = JSON.stringify({
      selectedOption: 'text',
      data: { title: 'old' },
    });
    render(
      <ConditionalDropdownInput
        name="cdf"
        value={value}
        onChange={onChange}
        attribute={attribute}
      />
    );
    const titleInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(titleInput, { target: { value: 'new' } });

    expect(onChange).toHaveBeenCalledWith({
      target: {
        name: 'cdf',
        value: JSON.stringify({
          selectedOption: 'text',
          data: { title: 'new' },
        }),
        type: 'json',
      },
    });
  });
});
