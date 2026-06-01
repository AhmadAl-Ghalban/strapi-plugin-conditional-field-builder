<div align="center">

# Conditional Field Builder

**A Strapi v5 custom field that turns one dropdown into a schema-less, per-option form — stored as a single JSON value.**

[![npm version](https://img.shields.io/npm/v/strapi-plugin-conditional-field-builder.svg?style=flat-square&color=4945ff)](https://www.npmjs.com/package/strapi-plugin-conditional-field-builder)
[![npm downloads](https://img.shields.io/npm/dm/strapi-plugin-conditional-field-builder.svg?style=flat-square&color=4945ff)](https://www.npmjs.com/package/strapi-plugin-conditional-field-builder)
[![license](https://img.shields.io/npm/l/strapi-plugin-conditional-field-builder.svg?style=flat-square)](./LICENSE)
[![Strapi v5](https://img.shields.io/badge/Strapi-v5-4945ff.svg?style=flat-square)](https://strapi.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?style=flat-square)](https://www.typescriptlang.org/)

[Install](#-install) · [Quick start](#-quick-start) · [Examples](#-examples) · [Field reference](#-field-reference) · [API usage](#-querying-the-stored-value)

</div>

---

## Why this plugin?

Strapi v5.17 introduced **Conditional Fields** — but they only toggle visibility of fields **already declared in your schema**. This plugin solves the other half of the problem: letting **one field morph into a different shape per option**, without ever touching the content-type schema.

| Capability                                                       | v5.17 native | **This plugin**   |
| ---------------------------------------------------------------- | :----------: | :---------------: |
| Hide/show fields that already exist in the schema                |      ✓       |        —          |
| Declare **new fields per option** without schema changes         |      —       |        ✓          |
| Bundle discriminator + dynamic data into **one JSON value**      |      —       |        ✓          |
| 13 sub-field types inside a single field                         |      —       |        ✓          |
| JSON-driven configuration in the Content-Type Builder            |      —       |        ✓          |

---

## Highlights

- **Strapi v5 native** — built on the official Custom Field API (`type: 'json'`)
- **13 field types** — `text`, `textarea`, `number`, `email`, `password`, `select`, `checkbox`, `radio`, `date`, `time`, `datetime`, `boolean`, `range`
- **Type-safe** — TypeScript end-to-end, React 18
- **`@strapi/design-system`** — looks and feels like the rest of the admin
- **Built-in validation** — required, min/max, step, choices
- **i18n** — English, French, Arabic out of the box (drop a JSON file to add more)
- **Plugin Settings page** — store a reusable default template for your team
- **Unit tested** — pure validation utilities covered with Vitest

---

## Install

```bash
npm  i  strapi-plugin-conditional-field-builder
# or
yarn add strapi-plugin-conditional-field-builder
# or
pnpm add strapi-plugin-conditional-field-builder
```

Enable it in `config/plugins.ts` (or `.js`):

```ts
export default ({ env }) => ({
  'conditional-field-builder': {
    enabled: true,
  },
});
```

Rebuild the admin and start Strapi:

```bash
npm run build && npm run develop
```

<details>
<summary><b>Install from source (local development / forks)</b></summary>

```bash
git clone https://github.com/AhmadAl-Ghalban/strapi-plugin-conditional-field-builder.git \
  ./src/plugins/conditional-field-builder
cd ./src/plugins/conditional-field-builder
npm install && npm run build
```

```ts
// config/plugins.ts
export default ({ env }) => ({
  'conditional-field-builder': {
    enabled: true,
    resolve: './src/plugins/conditional-field-builder',
  },
});
```

</details>

---

## Quick start

### 1. Add the field

In the **Content-Type Builder** → **Add another field** → **Custom** → **Conditional Dropdown**.

### 2. Configure options as JSON

In the field's *Options* panel, describe the options and the sub-fields each one should render:

```json
[
  {
    "label": "Text",
    "value": "text",
    "fields": [
      { "name": "title",       "type": "text",     "required": true },
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
      { "name": "min", "type": "number", "min": 0 },
      { "name": "max", "type": "number", "max": 100 }
    ]
  }
]
```

### 3. Author content

```text
┌─────────────────────────────────────────────────┐
│ My Field *                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │  Date                                    ▾  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│  Date   [ 2026-01-01      ]                     │
│  Time   [ 10:00           ]                     │
└─────────────────────────────────────────────────┘
```

### 4. Stored value

```json
{
  "selectedOption": "date",
  "data": {
    "date": "2026-01-01T00:00:00.000Z",
    "time": "2026-01-01T10:00:00.000Z"
  }
}
```

---

## Examples

<details open>
<summary><b>Contact methods</b> — select + email + phone + message</summary>

```json
[
  {
    "label": "Email",
    "value": "email",
    "fields": [
      { "name": "address", "label": "Email address", "type": "email", "required": true },
      { "name": "subject", "type": "text" }
    ]
  },
  {
    "label": "Phone",
    "value": "phone",
    "fields": [
      { "name": "country", "type": "select", "required": true,
        "choices": [
          { "label": "Saudi Arabia (+966)", "value": "+966" },
          { "label": "United States (+1)",  "value": "+1"   },
          { "label": "United Kingdom (+44)","value": "+44"  }
        ]
      },
      { "name": "number", "type": "text", "required": true, "placeholder": "5XXXXXXXX" }
    ]
  },
  {
    "label": "Message",
    "value": "message",
    "fields": [
      { "name": "body", "type": "textarea", "required": true, "placeholder": "Write your message…" }
    ]
  }
]
```

</details>

<details>
<summary><b>Product variants</b> — physical vs digital</summary>

```json
[
  {
    "label": "Physical product",
    "value": "physical",
    "fields": [
      { "name": "price",    "type": "number", "min": 0, "step": 0.01, "required": true },
      { "name": "stock",    "type": "range",  "min": 0, "max": 1000,  "step": 1 },
      { "name": "shipping", "type": "radio",
        "choices": [
          { "label": "Standard", "value": "standard" },
          { "label": "Express",  "value": "express"  }
        ]
      },
      { "name": "giftWrap", "label": "Gift wrap available", "type": "checkbox" }
    ]
  },
  {
    "label": "Digital product",
    "value": "digital",
    "fields": [
      { "name": "price",       "type": "number",  "min": 0, "step": 0.01, "required": true },
      { "name": "downloadUrl", "type": "text",    "required": true, "placeholder": "https://…" },
      { "name": "drm",         "label": "DRM protected", "type": "boolean" }
    ]
  }
]
```

</details>

<details>
<summary><b>Event scheduling</b> — all-day / timed / recurring</summary>

```json
[
  {
    "label": "All-day event",
    "value": "allDay",
    "fields": [
      { "name": "day",   "type": "date", "required": true },
      { "name": "notes", "type": "textarea" }
    ]
  },
  {
    "label": "Timed event",
    "value": "timed",
    "fields": [
      { "name": "startsAt", "type": "datetime", "required": true },
      { "name": "endsAt",   "type": "datetime", "required": true }
    ]
  },
  {
    "label": "Recurring slot",
    "value": "recurring",
    "fields": [
      { "name": "weekday", "type": "select", "required": true,
        "choices": [
          { "label": "Monday",    "value": "mon" },
          { "label": "Tuesday",   "value": "tue" },
          { "label": "Wednesday", "value": "wed" },
          { "label": "Thursday",  "value": "thu" },
          { "label": "Friday",    "value": "fri" }
        ]
      },
      { "name": "time", "type": "time", "required": true }
    ]
  }
]
```

</details>

<details>
<summary><b>CTA block</b> — link / newsletter form / embedded video</summary>

```json
[
  {
    "label": "Link button",
    "value": "link",
    "fields": [
      { "name": "label",        "type": "text", "required": true },
      { "name": "href",         "type": "text", "required": true, "placeholder": "/about or https://…" },
      { "name": "openInNewTab", "type": "boolean" }
    ]
  },
  {
    "label": "Newsletter form",
    "value": "form",
    "fields": [
      { "name": "headline",    "type": "text" },
      { "name": "placeholder", "type": "text", "placeholder": "you@example.com" },
      { "name": "submitLabel", "type": "text" }
    ]
  },
  {
    "label": "Embedded video",
    "value": "video",
    "fields": [
      { "name": "url",      "type": "text", "required": true },
      { "name": "autoplay", "type": "checkbox" }
    ]
  }
]
```

</details>

---

## Field reference

Each entry in `fields[]` accepts:

| Property        | Type                  | Applies to             | Notes                                  |
| --------------- | --------------------- | ---------------------- | -------------------------------------- |
| `name`          | `string`              | all                    | **Required.** Key inside `data`        |
| `label`         | `string`              | all                    | Defaults to `name`                     |
| `type`          | `string`              | all                    | See list below                         |
| `required`      | `boolean`             | all                    | Enforces required-field validation     |
| `placeholder`   | `string`              | text-like inputs       | —                                      |
| `min` / `max`   | `number`              | `number`, `range`      | Numeric bounds                         |
| `step`          | `number`              | `number`, `range`      | Numeric step                           |
| `choices`       | `[{label, value}]`    | `select`, `radio`      | Option list                            |
| `defaultValue`  | `any`                 | all                    | Reserved for form-style initialization |

**Supported types**
`text` · `textarea` · `number` · `email` · `password` · `select` · `checkbox` · `radio` · `date` · `time` · `datetime` · `boolean` · `range`

---

## Querying the stored value

The value is persisted as plain JSON, so you can use it directly from REST, GraphQL, or any service:

```ts
// Find pages whose "cta" block is a video
const entries = await strapi.documents('api::page.page').findMany({
  filters: { cta: { selectedOption: { $eq: 'video' } } },
});
```

```tsx
// Render based on the discriminator
switch (page.cta.selectedOption) {
  case 'link':  return <Button href={page.cta.data.href}>{page.cta.data.label}</Button>;
  case 'form':  return <Newsletter {...page.cta.data} />;
  case 'video': return <Video src={page.cta.data.url} autoplay={page.cta.data.autoplay} />;
}
```

---

## Architecture

```text
strapi-plugin-conditional-field-builder/
├─ server/src/
│   ├─ register.ts                       # registers the custom field on the server
│   └─ bootstrap.ts
├─ admin/src/
│   ├─ index.ts                          # registers field + settings link
│   ├─ types.ts                          # shared TypeScript types
│   ├─ components/
│   │   ├─ ConditionalDropdownInput.tsx  # main Content Manager input
│   │   ├─ DynamicFieldRenderer.tsx      # per-type field renderer
│   │   └─ OptionsJsonInput.tsx          # CTB JSON config helper
│   ├─ pages/
│   │   └─ SettingsPage.tsx              # plugin settings page
│   ├─ utils/
│   │   ├─ validation.ts                 # pure validation + parsing helpers
│   │   └─ __tests__/validation.test.ts
│   └─ translations/{en,fr,ar}.json
└─ package.json
```

> **Why `type: 'json'`?** The persisted value bundles a discriminator (`selectedOption`) with a heterogeneous `data` map. JSON is the natural backing for that shape — and it keeps the content-type schema stable as authors evolve their options over time.

---

## Validation API

`utils/validation.ts` exposes pure functions used by the input and the tests:

| Function                                       | Purpose                              |
| ---------------------------------------------- | ------------------------------------ |
| `validateField(field, value)`                  | Validate a single sub-field          |
| `validateValue(value, options, required)`      | Validate the full shape              |
| `parseOptions(raw)`                            | Accepts an array or a JSON string    |
| `parseValue(raw)`                              | Accepts an object or a JSON string   |

---

## Scripts

```bash
npm run build           # build the plugin
npm run watch           # watch & rebuild
npm run watch:link      # build + symlink into a host project
npm test                # run unit tests (Vitest)
npm run test:ts:front   # TypeScript check (admin)
npm run test:ts:back    # TypeScript check (server)
```

---

## Internationalisation

Translations live under `admin/src/translations/<locale>.json`. Add a new locale by dropping a file in that folder — it's picked up automatically by `registerTrads`.

---

## Settings page

**Settings → Conditional Dropdown** lets administrators store a default options template (JSON) that authors can copy into the Content-Type Builder. The value is persisted in `localStorage`; swap in a backend route if you need cross-admin sharing.

---

## Contributing

Issues and PRs are very welcome.

- **Bugs / feature requests:** [open an issue](https://github.com/AhmadAl-Ghalban/strapi-plugin-conditional-field-builder/issues)
- **Pull requests:** fork → branch → PR against `main`

### Maintainer

- **[Ahmad Al-Ghalban](https://github.com/AhmadAl-Ghalban)** — creator & maintainer

---

## License

[MIT](./LICENSE) © [Ahmad Al-Ghalban](https://github.com/AhmadAl-Ghalban)
