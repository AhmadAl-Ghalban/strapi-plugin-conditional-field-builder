# Conditional Field Builder — Strapi v5 Plugin

> npm: [`strapi-plugin-conditional-field-builder`](https://www.npmjs.com/package/strapi-plugin-conditional-field-builder)

A production-ready custom field for **Strapi v5** that renders a dropdown
whose selected value drives a dynamic set of conditional sub-fields —
an embedded form-builder, stored as a single JSON value.

## How is this different from the built-in **Strapi v5.17 Conditional Fields**?

| Feature                                                | v5.17 native | **This plugin** |
| ------------------------------------------------------ | ------------ | --------------- |
| Toggle visibility of fields already declared in the schema | ✅           | ❌              |
| Declare **new fields per option** without touching the schema | ❌           | ✅              |
| Bundle the discriminator + dynamic data into **one JSON value** | ❌           | ✅              |
| 13 sub-field types in a single field                   | ❌           | ✅              |
| JSON-driven option/sub-field configuration in the CTB  | ❌           | ✅              |

In short: **v5.17 hides fields you already have. This plugin lets one field
morph into different shapes per option**, without growing the content-type
schema.

- Strapi v5 compatible
- Custom Field API (`type: 'json'`)
- TypeScript + React 18
- `@strapi/design-system` native UI
- Built-in validation
- i18n (en, fr, ar — easy to extend)
- Plugin Settings page
- Unit tests (validation utilities)

---

## Installation

From a Strapi v5 project root:

```bash
# Option A — install from npm (recommended once published)
npm i strapi-plugin-conditional-field-builder

# Option B — install from source
cp -R conditional-field-builder ./src/plugins/conditional-field-builder
cd ./src/plugins/conditional-field-builder
npm install
npm run build
```

Enable the plugin in `config/plugins.ts`:

```ts
export default ({ env }) => ({
  'conditional-field-builder': {
    enabled: true,
    // Only needed for Option B (local source); omit when installed from npm.
    // resolve: './src/plugins/conditional-field-builder',
  },
});
```

Rebuild the admin panel and start Strapi:

```bash
npm run build
npm run develop
```

---

## Usage

### 1. Add the field to a Content-Type

In the **Content-Type Builder**, choose **Add another field → Custom →
Conditional Dropdown**. In the *Options* section, paste a JSON
configuration:

```json
[
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
      { "name": "min", "type": "number", "min": 0 },
      { "name": "max", "type": "number", "max": 100 }
    ]
  }
]
```

### 2. Edit content

In the Content Manager, the editor sees:

```
┌─────────────────────────────────────────────────┐
│ My Field *                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ Select an option…                       ▾   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─ When "Date" is selected ─────────────────┐   │
│ │  Date  [ 2026-01-01 📅 ]                  │   │
│ │  Time  [ 10:00      🕑 ]                  │   │
│ └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 3. Stored value

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

## More examples

### Contact methods (select + email / text / textarea)

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

### Product variant (number range + checkbox + radio)

```json
[
  {
    "label": "Physical product",
    "value": "physical",
    "fields": [
      { "name": "price",   "type": "number", "min": 0, "step": 0.01, "required": true },
      { "name": "stock",   "type": "range",  "min": 0, "max": 1000, "step": 1 },
      { "name": "shipping","type": "radio",
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
      { "name": "price",      "type": "number", "min": 0, "step": 0.01, "required": true },
      { "name": "downloadUrl","type": "text",   "required": true, "placeholder": "https://…" },
      { "name": "drm",        "label": "DRM protected", "type": "boolean" }
    ]
  }
]
```

### Event scheduling (date + time + datetime)

```json
[
  {
    "label": "All-day event",
    "value": "allDay",
    "fields": [
      { "name": "day", "type": "date", "required": true },
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

### CTA block (link / form / video)

```json
[
  {
    "label": "Link button",
    "value": "link",
    "fields": [
      { "name": "label", "type": "text", "required": true },
      { "name": "href",  "type": "text", "required": true, "placeholder": "/about or https://…" },
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

### Querying the stored JSON

The value is stored under `type: 'json'`, so you can read it directly via the
Strapi REST / GraphQL API or filter by the discriminator in a custom service:

```ts
// server: only return entries whose "cta" block is a video
const entries = await strapi.documents('api::page.page').findMany({
  filters: { cta: { selectedOption: { $eq: 'video' } } },
});
```

```ts
// admin / frontend: render based on selectedOption
switch (page.cta.selectedOption) {
  case 'link':  return <Button href={page.cta.data.href}>{page.cta.data.label}</Button>;
  case 'form':  return <Newsletter {...page.cta.data} />;
  case 'video': return <Video src={page.cta.data.url} autoplay={page.cta.data.autoplay} />;
}
```

---

## Supported conditional field types

`text`, `textarea`, `number`, `email`, `password`, `select`, `checkbox`,
`radio`, `date`, `time`, `datetime`, `boolean`, `range`.

Each field accepts:

| Property       | Type              | Notes                                |
| -------------- | ----------------- | ------------------------------------ |
| `name`         | string            | Required — key inside `data`         |
| `label`        | string            | Defaults to `name`                   |
| `type`         | string            | See list above                       |
| `required`     | boolean           | Triggers required-field validation   |
| `placeholder`  | string            | For text-like inputs                 |
| `min` / `max`  | number            | For `number` / `range`               |
| `step`         | number            | For `number` / `range`               |
| `choices`      | `[{label,value}]` | For `select` / `radio`               |
| `defaultValue` | any               | Reserved for forms-style init        |

---

## Architecture

```
my-plugin/
├─ server/src/
│   ├─ register.ts            # registers the custom field on the server
│   ├─ bootstrap.ts
│   └─ ...
├─ admin/src/
│   ├─ index.ts               # registers field + settings link
│   ├─ types.ts               # shared TypeScript interfaces
│   ├─ components/
│   │   ├─ ConditionalDropdownInput.tsx   # main Content Manager input
│   │   ├─ DynamicFieldRenderer.tsx       # per-type field renderer
│   │   └─ OptionsJsonInput.tsx           # CTB JSON config helper
│   ├─ pages/
│   │   └─ SettingsPage.tsx               # plugin settings page
│   ├─ utils/
│   │   ├─ validation.ts                  # validation + parsing helpers
│   │   └─ __tests__/validation.test.ts   # unit tests
│   └─ translations/
│       ├─ en.json
│       ├─ fr.json
│       └─ ar.json
└─ package.json
```

### Why `type: 'json'`?

The persisted value bundles a discriminator (`selectedOption`) with a
heterogeneous `data` map. `json` is the natural Strapi backing for that
shape — and keeps the schema stable as authors change options.

---

## Validation

`utils/validation.ts` exposes pure functions used by the input and the
unit tests:

- `validateField(field, value)` — single-field validation
- `validateValue(value, options, required)` — full-shape validation
- `parseOptions(raw)` — accepts array or JSON string
- `parseValue(raw)` — accepts object or JSON string

---

## Tests

```bash
# from the plugin folder
npm test
```

If Jest isn't wired into the host project yet, the scaffold ships
TypeScript checks you can run today:

```bash
npm run test:ts:front
npm run test:ts:back
```

---

## Internationalisation

Translations live in `admin/src/translations/<locale>.json`. Add a new
locale by dropping a file there — it is picked up automatically by
`registerTrads`.

---

## Settings page

Settings → **Conditional Dropdown** lets administrators store a default
options template (JSON) that authors can copy into the Content-Type
Builder. The value is persisted in `localStorage`; swap in a backend
route if you need cross-admin sharing.

---

## License

MIT
