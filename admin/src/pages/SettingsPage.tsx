import * as React from 'react';
import { useIntl } from 'react-intl';
import {
  Main,
  Box,
  Typography,
  Flex,
  Button,
  Textarea,
  Field,
} from '@strapi/design-system';
import { getTranslation } from '../utils/getTranslation';

const STORAGE_KEY = 'conditional-dropdown:default-options';

/**
 * Plugin settings page.
 *
 * Lets the administrator preview/edit a default options JSON that
 * authors can later paste into the Content-Type Builder. The value is
 * persisted in localStorage to keep this self-contained; swap in a
 * backend route if cross-admin sharing is needed.
 */
const SettingsPage: React.FC = () => {
  const { formatMessage } = useIntl();

  const [json, setJson] = React.useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  });
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = () => {
    try {
      if (json.trim()) {
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) {
          setError('Must be a JSON array');
          return;
        }
      }
      window.localStorage.setItem(STORAGE_KEY, json);
      setError(null);
      setFeedback(
        formatMessage({
          id: getTranslation('settings.saved'),
          defaultMessage: 'Saved',
        })
      );
      window.setTimeout(() => setFeedback(null), 2000);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Main>
      <Box padding={8}>
        <Flex direction="column" alignItems="stretch" gap={4}>
          <Typography variant="alpha">
            {formatMessage({
              id: getTranslation('settings.title'),
              defaultMessage: 'Conditional Dropdown — Settings',
            })}
          </Typography>
          <Typography variant="omega" textColor="neutral600">
            {formatMessage({
              id: getTranslation('settings.intro'),
              defaultMessage:
                'Manage a default options template. Authors can paste this into any conditional-dropdown field in the Content-Type Builder.',
            })}
          </Typography>

          <Field.Root
            name="defaultOptions"
            id="defaultOptions"
            error={error ?? undefined}
          >
            <Flex direction="column" alignItems="stretch" gap={1}>
              <Field.Label>
                {formatMessage({
                  id: getTranslation('settings.default-options.label'),
                  defaultMessage: 'Default options template (JSON)',
                })}
              </Field.Label>
              <Textarea
                id="defaultOptions"
                name="defaultOptions"
                rows={16}
                value={json}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setJson(e.target.value)
                }
              />
              <Field.Error />
            </Flex>
          </Field.Root>

          <Flex gap={2}>
            <Button onClick={handleSave}>
              {formatMessage({
                id: getTranslation('settings.save'),
                defaultMessage: 'Save',
              })}
            </Button>
            {feedback && (
              <Typography textColor="success600">{feedback}</Typography>
            )}
          </Flex>
        </Flex>
      </Box>
    </Main>
  );
};

export default SettingsPage;
