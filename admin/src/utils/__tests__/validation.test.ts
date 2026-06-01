import {
  validateField,
  validateValue,
  parseOptions,
  parseValue,
} from '../validation';
import type { ConditionalField, DropdownOption } from '../../types';

describe('validateField', () => {
  it('flags required empty values', () => {
    const f: ConditionalField = { name: 'a', type: 'text', required: true };
    expect(validateField(f, '')).toMatch(/required/);
    expect(validateField(f, null)).toMatch(/required/);
  });

  it('allows empty optional values', () => {
    const f: ConditionalField = { name: 'a', type: 'text' };
    expect(validateField(f, '')).toBeNull();
  });

  it('validates emails', () => {
    const f: ConditionalField = { name: 'e', type: 'email' };
    expect(validateField(f, 'not-an-email')).toMatch(/email/i);
    expect(validateField(f, 'a@b.co')).toBeNull();
  });

  it('validates numbers with min/max', () => {
    const f: ConditionalField = { name: 'n', type: 'number', min: 0, max: 10 };
    expect(validateField(f, -1)).toMatch(/>=/);
    expect(validateField(f, 11)).toMatch(/<=/);
    expect(validateField(f, 5)).toBeNull();
    expect(validateField(f, 'abc')).toMatch(/number/);
  });

  it('validates dates', () => {
    const f: ConditionalField = { name: 'd', type: 'date' };
    expect(validateField(f, 'nope')).toMatch(/date/i);
    expect(validateField(f, '2026-01-01')).toBeNull();
  });
});

describe('validateValue', () => {
  const options: DropdownOption[] = [
    {
      label: 'Text',
      value: 'text',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'desc', type: 'textarea' },
      ],
    },
  ];

  it('requires a selection when required', () => {
    const errs = validateValue(
      { selectedOption: null, data: {} },
      options,
      true
    );
    expect(errs._form).toBeDefined();
  });

  it('returns no errors when no selection and not required', () => {
    const errs = validateValue(
      { selectedOption: null, data: {} },
      options,
      false
    );
    expect(Object.keys(errs)).toHaveLength(0);
  });

  it('validates nested required fields', () => {
    const errs = validateValue(
      { selectedOption: 'text', data: {} },
      options,
      false
    );
    expect(errs.title).toMatch(/required/);
    expect(errs.desc).toBeUndefined();
  });

  it('flags unknown selected option', () => {
    const errs = validateValue(
      { selectedOption: 'missing', data: {} },
      options,
      false
    );
    expect(errs._form).toMatch(/no longer/);
  });
});

describe('parseOptions', () => {
  it('returns [] for falsy input', () => {
    expect(parseOptions(null)).toEqual([]);
    expect(parseOptions(undefined)).toEqual([]);
    expect(parseOptions('')).toEqual([]);
  });

  it('passes arrays through', () => {
    const arr = [{ label: 'a', value: 'a' }];
    expect(parseOptions(arr)).toEqual(arr);
  });

  it('parses JSON strings', () => {
    expect(parseOptions('[{"label":"a","value":"a"}]')).toEqual([
      { label: 'a', value: 'a' },
    ]);
  });

  it('returns [] for malformed JSON', () => {
    expect(parseOptions('not json')).toEqual([]);
  });
});

describe('parseValue', () => {
  it('returns an empty shape for falsy values', () => {
    expect(parseValue(null)).toEqual({ selectedOption: null, data: {} });
  });

  it('parses a JSON string value', () => {
    const raw = JSON.stringify({ selectedOption: 'x', data: { a: 1 } });
    expect(parseValue(raw)).toEqual({ selectedOption: 'x', data: { a: 1 } });
  });

  it('returns empty for malformed JSON', () => {
    expect(parseValue('}{')).toEqual({ selectedOption: null, data: {} });
  });
});
