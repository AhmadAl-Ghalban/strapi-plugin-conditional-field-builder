import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';

export default {
  register(app: any) {
    /**
     * Register the conditional-dropdown custom field.
     * The persisted value is a JSON object: { selectedOption, data }.
     */
    app.customFields.register({
      name: 'conditional-dropdown',
      pluginId: PLUGIN_ID,
      type: 'json',
      icon: PluginIcon,
      intlLabel: {
        id: getTranslation('conditional-dropdown.label'),
        defaultMessage: 'Conditional Dropdown',
      },
      intlDescription: {
        id: getTranslation('conditional-dropdown.description'),
        defaultMessage:
          'Dropdown whose selected option drives a set of conditional fields',
      },
      components: {
        Input: async () => import('./components/ConditionalDropdownInput'),
      },
      options: {
        base: [
          {
            sectionTitle: {
              id: getTranslation('conditional-dropdown.section.options'),
              defaultMessage: 'Options',
            },
            items: [
              {
                name: 'options.optionsJson',
                type: 'json',
                intlLabel: {
                  id: getTranslation('conditional-dropdown.optionsJson.label'),
                  defaultMessage: 'Dropdown options (JSON)',
                },
                description: {
                  id: getTranslation(
                    'conditional-dropdown.optionsJson.description'
                  ),
                  defaultMessage:
                    'Array of { label, value, type?, fields? }. Each field supports types: text, textarea, number, email, password, select, checkbox, radio, date, time, datetime, boolean, range.',
                },
              },
            ],
          },
        ],
        advanced: [
          {
            sectionTitle: {
              id: 'global.settings',
              defaultMessage: 'Settings',
            },
            items: [
              {
                name: 'required',
                type: 'checkbox',
                intlLabel: {
                  id: 'form.attribute.item.requiredField',
                  defaultMessage: 'Required field',
                },
                description: {
                  id: 'form.attribute.item.requiredField.description',
                  defaultMessage:
                    "You won't be able to create an entry if this field is empty",
                },
              },
            ],
          },
        ],
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    app.addSettingsLink('global', {
      id: `${PLUGIN_ID}-settings`,
      to: `/settings/${PLUGIN_ID}`,
      intlLabel: {
        id: getTranslation('settings.link.label'),
        defaultMessage: 'Conditional Dropdown',
      },
      Component: async () => {
        const mod = await import('./pages/SettingsPage');
        return mod;
      },
      permissions: [],
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(
            `./translations/${locale}.json`
          );
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
