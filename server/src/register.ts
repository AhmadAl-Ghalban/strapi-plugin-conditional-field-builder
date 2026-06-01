import type { Core } from '@strapi/strapi';

/**
 * Register the `conditional-dropdown` custom field.
 *
 * The persisted value is a JSON object of the form:
 *   { selectedOption: string, data: Record<string, unknown> }
 *
 * The `options.fields` attribute (configured per-field in the
 * Content-Type Builder) drives which conditional inputs are rendered
 * on the Content Manager edit view.
 */
const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: 'conditional-dropdown',
    plugin: 'conditional-field-builder',
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: true,
    },
  });
};

export default register;
