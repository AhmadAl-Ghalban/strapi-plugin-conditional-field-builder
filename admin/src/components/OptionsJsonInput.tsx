import * as React from 'react';
import { useIntl } from 'react-intl';
import { Field, Flex, Textarea, Typography } from '@strapi/design-system';
import type { InputOnChange } from '../types';

type Props = {
  name: string;
  value?: string | null;
  onChange: InputOnChange;
  intlLabel?: { id: string; defaultMessage: string };
  description?: { id: string; defaultMessage: string };
  required?: boolean;
  disabled?: boolean;
  error?: string;
};

const DEFAULT_TEMPLATE = `[
  {
    "label": "Text",
    "value": "text",
    "fields": [
      { "name": "title", "type": "text", "required": true },
      { "name": "description", "type": "textarea" }
    ]
  },
  {
    "label": "Date",
    "value": "date",
    "fields": [
      { "name": "date", "type": "date" },
      { "name": "time", "type": "time" }
    ]
  },
  {
    "label": "Range",
    "value": "range",
    "fields": [
      { "name": "min", "type": "number" },
      { "name": "max", "type": "number" }
    ]
  }
]`;

/**
 * CTB configuration input: lets administrators paste the JSON definition
 * of dropdown options + conditional fields. The value is forwarded as a
 * string and parsed at runtime via `parseOptions`.
 */
const OptionsJsonInput: React.FC<Props> = ({
  name,
  value,
  onChange,
  intlLabel,
  description,
  required,
  disabled,
  error,
}) => {
  const { formatMessage } = useIntl();
  const current = (value as string) ?? DEFAULT_TEMPLATE;

  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleChange = (next: string) => {
    onChange({ target: { name, value: next, type: 'json' } });
    if (!next.trim()) {
      setLocalError(null);
      return;
    }
    try {
      const parsed = JSON.parse(next);
      if (!Array.isArray(parsed)) {
        setLocalError('Options must be a JSON array');
      } else {
        setLocalError(null);
      }
    } catch (e) {
      setLocalError((e as Error).message);
    }
  };

  return (
    <Field.Root
      name={name}
      id={name}
      error={error || localError || undefined}
      required={required}
    >
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Field.Label>
          {intlLabel ? formatMessage(intlLabel) : name}
        </Field.Label>
        <Textarea
          id={name}
          name={name}
          value={current}
          rows={14}
          disabled={disabled}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleChange(e.target.value)
          }
        />
        {description && (
          <Typography variant="pi" textColor="neutral600">
            {formatMessage(description)}
          </Typography>
        )}
        <Field.Error />
      </Flex>
    </Field.Root>
  );
};

export default OptionsJsonInput;
