/**
 * Server-side validation for `conditional-dropdown` values.
 *
 * The admin UI validates as the editor types, but REST / GraphQL /
 * Document Service writes never pass through it. This module re-applies the
 * same rules (shared with the admin via `admin/src/utils/validation`) to every
 * create / update / clone, including values nested in components and dynamic
 * zones.
 */
import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

import {
  parseOptions,
  parseValue,
  validateValue,
  type ValidationErrors,
} from '../../../admin/src/utils/validation';

export const CUSTOM_FIELD_UID = 'plugin::conditional-field-builder.conditional-dropdown';

/** Document Service actions that carry `params.data` to validate. */
export const VALIDATED_ACTIONS = new Set(['create', 'update', 'clone']);

export interface FieldError {
  /** Path to the offending value, e.g. `['blocks', 0, 'config', 'title']`. */
  path: (string | number)[];
  message: string;
}

type Attribute = {
  type: string;
  customField?: string;
  component?: string;
  repeatable?: boolean;
  required?: boolean;
  options?: Record<string, unknown>;
  optionsJson?: unknown;
};

type Model = { attributes: Record<string, Attribute> } | undefined;

/** Resolve a model (content type or component) schema by uid. */
export type GetModel = (uid: string) => Model;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Options can live under `options.optionsJson`, `optionsJson` or `options` — same lookup as the admin input. */
const readOptions = (attribute: Attribute) =>
  parseOptions(
    attribute.options?.optionsJson ?? attribute.optionsJson ?? attribute.options
  );

/**
 * Validate one stored value. A malformed value (not JSON / not an object, or
 * `data` not an object) is rejected outright rather than silently coerced.
 */
const validateFieldValue = (
  attribute: Attribute,
  raw: unknown,
  path: (string | number)[]
): FieldError[] => {
  if (raw === undefined || raw === null) {
    // Presence of the whole attribute is Strapi's own `required` check (which
    // also knows about drafts); we only validate values that were sent.
    return [];
  }

  let candidate: unknown = raw;
  if (typeof raw === 'string') {
    try {
      candidate = JSON.parse(raw);
    } catch {
      return [{ path, message: 'Must be a valid JSON value' }];
    }
  }
  if (candidate === null) return [];
  if (
    !isPlainObject(candidate) ||
    ('data' in candidate && candidate.data != null && !isPlainObject(candidate.data)) ||
    ('selectedOption' in candidate &&
      candidate.selectedOption != null &&
      typeof candidate.selectedOption !== 'string')
  ) {
    return [
      {
        path,
        message: 'Must be an object of the form { selectedOption: string | null, data: object }',
      },
    ];
  }

  const value = parseValue(candidate);
  const result: ValidationErrors = validateValue(
    value,
    readOptions(attribute),
    Boolean(attribute.required)
  );

  return Object.entries(result).map(([key, message]) => ({
    path: key === '_form' ? path : [...path, key],
    message,
  }));
};

/**
 * Walk `data` for the given model and collect errors for every
 * conditional-dropdown value, recursing into components and dynamic zones.
 */
export const collectErrors = (
  getModel: GetModel,
  model: Model,
  data: unknown,
  path: (string | number)[] = []
): FieldError[] => {
  if (!model || !isPlainObject(data)) return [];

  const found: FieldError[] = [];

  for (const [name, attribute] of Object.entries(model.attributes)) {
    if (!(name in data)) continue; // partial update: field not touched
    const value = data[name];
    const here = [...path, name];

    if (attribute.customField === CUSTOM_FIELD_UID) {
      found.push(...validateFieldValue(attribute, value, here));
    } else if (attribute.type === 'component' && attribute.component) {
      const component = getModel(attribute.component);
      if (Array.isArray(value)) {
        value.forEach((item, i) =>
          found.push(...collectErrors(getModel, component, item, [...here, i]))
        );
      } else {
        found.push(...collectErrors(getModel, component, value, here));
      }
    } else if (attribute.type === 'dynamiczone' && Array.isArray(value)) {
      value.forEach((item, i) => {
        if (isPlainObject(item) && typeof item.__component === 'string') {
          found.push(
            ...collectErrors(getModel, getModel(item.__component), item, [...here, i])
          );
        }
      });
    }
  }

  return found;
};

/** Does this model (or any component it can contain) use the custom field? */
export const usesCustomField = (
  getModel: GetModel,
  model: Model,
  seen = new Set<string>()
): boolean => {
  if (!model) return false;
  return Object.values(model.attributes).some((attribute: any) => {
    if (attribute.customField === CUSTOM_FIELD_UID) return true;
    const nested: string[] =
      attribute.type === 'component' && attribute.component
        ? [attribute.component]
        : attribute.type === 'dynamiczone'
          ? (attribute.components ?? [])
          : [];
    return nested.some((uid) => {
      if (seen.has(uid)) return false;
      seen.add(uid);
      return usesCustomField(getModel, getModel(uid), seen);
    });
  });
};

/**
 * Register a Document Service middleware that rejects invalid
 * conditional-dropdown values with a 400 `ValidationError`.
 */
export const registerDocumentValidation = (strapi: Core.Strapi) => {
  const getModel: GetModel = (uid) => strapi.getModel(uid as any) as Model;
  const cache = new Map<string, boolean>();

  strapi.documents.use(async (context, next) => {
    if (!VALIDATED_ACTIONS.has(context.action)) return next();

    const { uid } = context;
    if (!cache.has(uid)) cache.set(uid, usesCustomField(getModel, getModel(uid)));
    if (!cache.get(uid)) return next();

    const data = (context.params as { data?: unknown } | undefined)?.data;
    const found = collectErrors(getModel, getModel(uid), data);

    if (found.length > 0) {
      throw new errors.ValidationError(
        found.length === 1
          ? `${found[0].path.join('.')}: ${found[0].message}`
          : `${found.length} errors occurred`,
        {
          errors: found.map((e) => ({
            path: e.path,
            message: e.message,
            name: 'ValidationError',
          })),
        }
      );
    }

    return next();
  });
};
