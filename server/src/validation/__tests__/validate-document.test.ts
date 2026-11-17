// @vitest-environment node
import { errors } from '@strapi/utils';
import { describe, expect, it, vi } from 'vitest';

import {
  CUSTOM_FIELD_UID,
  collectErrors,
  registerDocumentValidation,
  usesCustomField,
  type GetModel,
} from '../validate-document';

const options = [
  {
    label: 'Text',
    value: 'text',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'email', type: 'email' },
    ],
  },
  {
    label: 'Range',
    value: 'range',
    fields: [{ name: 'count', type: 'number', min: 1, max: 10 }],
  },
];

const field = (extra: Record<string, unknown> = {}) => ({
  type: 'json',
  customField: CUSTOM_FIELD_UID,
  options: { optionsJson: JSON.stringify(options) },
  ...extra,
});

const models: Record<string, any> = {
  'api::item.item': {
    attributes: {
      name: { type: 'string' },
      config: field(),
      strict: field({ required: true }),
      block: { type: 'component', component: 'shared.block', repeatable: false },
      blocks: { type: 'component', component: 'shared.block', repeatable: true },
      zone: { type: 'dynamiczone', components: ['shared.block', 'shared.plain'] },
    },
  },
  'shared.block': { attributes: { inner: field() } },
  'shared.plain': { attributes: { text: { type: 'string' } } },
  'api::other.other': { attributes: { name: { type: 'string' } } },
  'api::nested.nested': {
    attributes: { zone: { type: 'dynamiczone', components: ['shared.block'] } },
  },
};

const getModel: GetModel = (uid) => models[uid];
const item = models['api::item.item'];
const run = (data: unknown) => collectErrors(getModel, item, data);

describe('collectErrors', () => {
  it('accepts a valid value (object or JSON string)', () => {
    const value = { selectedOption: 'text', data: { title: 'Hi' } };
    expect(run({ config: value })).toEqual([]);
    expect(run({ config: JSON.stringify(value) })).toEqual([]);
  });

  it('ignores fields absent from a partial update, and null values', () => {
    expect(run({ name: 'x' })).toEqual([]);
    expect(run({ config: null })).toEqual([]);
  });

  it('reports sub-field rule violations with a path', () => {
    expect(
      run({ config: { selectedOption: 'text', data: { title: '', email: 'nope' } } })
    ).toEqual([
      { path: ['config', 'title'], message: 'title is required' },
      { path: ['config', 'email'], message: 'Invalid email address' },
    ]);
    expect(run({ config: { selectedOption: 'range', data: { count: 50 } } })).toEqual([
      { path: ['config', 'count'], message: 'Must be <= 10' },
    ]);
  });

  it('rejects an option that is not configured', () => {
    expect(run({ config: { selectedOption: 'hacked', data: {} } })).toEqual([
      { path: ['config'], message: 'Selected option is no longer available' },
    ]);
  });

  it('requires a selection only when the attribute is required', () => {
    expect(run({ config: { selectedOption: null, data: {} } })).toEqual([]);
    expect(run({ strict: { selectedOption: null, data: {} } })).toEqual([
      { path: ['strict'], message: 'Please select an option' },
    ]);
  });

  it('rejects malformed values', () => {
    for (const bad of ['{not json', 42, ['a'], { selectedOption: 1 }, { data: 'x' }]) {
      expect(run({ config: bad })).toHaveLength(1);
    }
  });

  it('recurses into single and repeatable components', () => {
    const bad = { inner: { selectedOption: 'text', data: {} } };
    expect(run({ block: bad })).toEqual([
      { path: ['block', 'inner', 'title'], message: 'title is required' },
    ]);
    expect(run({ blocks: [{ inner: null }, bad] })).toEqual([
      { path: ['blocks', 1, 'inner', 'title'], message: 'title is required' },
    ]);
  });

  it('recurses into dynamic zones by __component', () => {
    expect(
      run({
        zone: [
          { __component: 'shared.plain', text: 'ok' },
          { __component: 'shared.block', inner: { selectedOption: 'text', data: {} } },
        ],
      })
    ).toEqual([{ path: ['zone', 1, 'inner', 'title'], message: 'title is required' }]);
  });
});

describe('usesCustomField', () => {
  it('detects direct, component and dynamic-zone usage', () => {
    expect(usesCustomField(getModel, item)).toBe(true);
    expect(usesCustomField(getModel, models['api::nested.nested'])).toBe(true);
    expect(usesCustomField(getModel, models['api::other.other'])).toBe(false);
  });
});

describe('registerDocumentValidation', () => {
  const setup = () => {
    let middleware: any;
    const strapi: any = {
      getModel: vi.fn(getModel),
      documents: { use: vi.fn((fn) => (middleware = fn)) },
    };
    registerDocumentValidation(strapi);
    return (ctx: any) => {
      const next = vi.fn(async () => 'next-result');
      return { result: middleware(ctx, next), next };
    };
  };

  it('passes valid writes and non-write actions through', async () => {
    const call = setup();
    const ok = call({
      uid: 'api::item.item',
      action: 'create',
      params: { data: { config: { selectedOption: 'text', data: { title: 'Hi' } } } },
    });
    await expect(ok.result).resolves.toBe('next-result');

    const read = call({ uid: 'api::item.item', action: 'findMany', params: {} });
    await expect(read.result).resolves.toBe('next-result');
  });

  it('skips content types that do not use the field', async () => {
    const call = setup();
    const { result } = call({
      uid: 'api::other.other',
      action: 'update',
      params: { data: { name: 'x' } },
    });
    await expect(result).resolves.toBe('next-result');
  });

  it('throws a ValidationError with details and does not call next', async () => {
    const call = setup();
    const { result, next } = call({
      uid: 'api::item.item',
      action: 'update',
      params: { data: { config: { selectedOption: 'text', data: {} } } },
    });
    await expect(result).rejects.toBeInstanceOf(errors.ValidationError);
    await expect(result).rejects.toMatchObject({
      message: 'config.title: title is required',
      details: {
        errors: [{ path: ['config', 'title'], message: 'title is required' }],
      },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
