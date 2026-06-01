# Conditional Field Builder — Plugin Overview & Roadmap

A Strapi v5 custom field that turns a single dropdown into a tiny form
builder: each option declares the inputs that should appear beneath it
when selected. This document explains how the plugin is put together
and where it's headed.

---

## 1. What the plugin does

| Capability                                  | Status |
| ------------------------------------------- | ------ |
| Custom field appears in CTB → *Custom* tab  | ✅     |
| JSON-driven dropdown options                | ✅     |
| Per-option conditional sub-fields           | ✅     |
| 13 built-in sub-field types                 | ✅     |
| Inline validation (required, email, range…) | ✅     |
| Strapi i18n (per-locale content)            | ✅     |
| Plugin UI translations (en / fr / ar)       | ✅     |
| Settings page (default options template)    | ✅     |
| Unit tests for validation helpers           | ✅     |
| TypeScript end-to-end                       | ✅     |

### Supported sub-field types

`text`, `textarea`, `number`, `email`, `password`, `select`, `checkbox`,
`radio`, `date`, `time`, `datetime`, `boolean`, `range`.

### Stored value shape

```json
{
  "selectedOption": "date",
  "data": {
    "date": "2026-01-01T00:00:00.000Z",
    "time": "2026-01-01T10:00:00.000Z"
  }
}
```

Persisted as Strapi `json`, so it round-trips through the REST and
GraphQL APIs unchanged.

---

## 2. How it's organized

```
my-plugin/
├─ server/src/
│   └─ register.ts                 # registers the custom field server-side
├─ admin/src/
│   ├─ index.ts                    # registers field + settings link
│   ├─ types.ts                    # shared TypeScript interfaces
│   ├─ components/
│   │   ├─ ConditionalDropdownInput.tsx   # Content Manager input
│   │   ├─ DynamicFieldRenderer.tsx       # per-type renderer
│   │   └─ OptionsJsonInput.tsx           # CTB JSON helper
│   ├─ pages/SettingsPage.tsx             # admin settings page
│   ├─ utils/
│   │   ├─ validation.ts                  # pure validation helpers
│   │   └─ __tests__/validation.test.ts   # Jest suite
│   └─ translations/                      # en / fr / ar
└─ README.md
```

### Data flow

```
CTB JSON  ──► attribute.options.optionsJson
                    │
                    ▼
        parseOptions() in ConditionalDropdownInput
                    │
                    ▼
        SingleSelect (label/value list)
                    │
        (user picks an option)
                    │
                    ▼
        DynamicFieldRenderer × N      ◄── option.fields[]
                    │
                    ▼
        { selectedOption, data }  ──► JSON.stringify
                    │
                    ▼
                onChange(...)  ──► Strapi entry
```

### Validation

`utils/validation.ts` is intentionally **pure** (no React, no Strapi
imports) so it's trivially testable:

- `validateField(field, value)` — single-field validation
- `validateValue(value, options, required)` — whole-shape validation
- `parseOptions(raw)` / `parseValue(raw)` — tolerate string-or-object inputs

The component re-runs validation on every change and shows errors only
after a field is touched (avoids "screaming red" on first render).

---

## 3. How to use it

1. **Content-Type Builder** → *Add another field* → **Custom** →
   **Conditional Dropdown**.
2. In *Base settings → Dropdown options (JSON)* paste an array of
   options. Each option may carry a `fields` array of sub-fields.
3. Save. Open an entry in the Content Manager — the dropdown drives
   which sub-fields appear.

A minimal config:

```json
[
  { "label": "Text", "value": "text",
    "fields": [
      { "name": "title", "type": "text", "required": true },
      { "name": "description", "type": "textarea" }
    ]
  },
  { "label": "Date", "value": "date",
    "fields": [
      { "name": "date", "type": "date" },
      { "name": "time", "type": "time" }
    ]
  }
]
```

See `README.md` for full installation steps and supported per-field
properties.

---

## 4. Design decisions

| Decision                          | Why                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| Storage type = `json`             | Variant + heterogeneous payload — `json` keeps the schema stable as authors edit options. |
| Options entered as JSON textarea  | Ships in a day; replaceable with a visual builder later (see roadmap).                    |
| Validation is pure functions      | Decouples logic from React → unit-testable without DOM.                                   |
| Settings stored in `localStorage` | Avoids creating a new DB table; easy to swap for a backend route later.                   |
| `@strapi/design-system` only      | Native look-and-feel; survives Strapi UI redesigns.                                       |

---

## 5. Roadmap — planned features

### Near-term (next minor releases)

- [ ] **Visual options builder** — replace the JSON textarea with a
      drag-and-drop UI: add/remove options, drag-reorder fields,
      type-aware property editor.
- [ ] **Field-level conditional logic** — show a sub-field only when
      another sub-field matches a predicate
      (e.g. `time` visible when `allDay === false`).
- [ ] **Default values per field** — honour `defaultValue` on first
      selection of an option.
- [ ] **Custom validators** — per-field regex, min/maxLength, custom
      error messages.
- [ ] **Backend validation** — mirror the admin validation in the
      server lifecycle (`beforeCreate`, `beforeUpdate`) so direct REST
      writes can't bypass it.
- [ ] **Settings page persistence** — move from `localStorage` to a
      plugin-owned content type so templates are shared across admins.

### Mid-term

- [ ] **Repeatable groups** — let an option's `fields` array repeat (think
      Strapi components/dynamic-zones, but inline).
- [ ] **Nested conditionals** — an option's sub-field can itself be a
      conditional dropdown.
- [ ] **Localized option labels** — accept
      `{ "label": { "en": "Text", "fr": "Texte" } }` and resolve at
      render time based on the active admin locale.
- [ ] **Import / export presets** — share option templates as JSON
      across projects or teams; one-click apply from the settings page.
- [ ] **Asset-aware fields** — `media`, `relation`, `enumeration`
      pulled from Strapi's media library and relation pickers.
- [ ] **GraphQL typing** — emit per-option GraphQL types so the
      payload isn't an opaque `JSON` scalar.

### Long-term

- [ ] **Visual flow view** — show the option → fields graph as a
      diagram inside the CTB.
- [ ] **Marketplace listing** — publish on the Strapi Marketplace with
      versioned releases.
- [ ] **Headless preview adapter** — first-class helpers for Next.js /
      Nuxt to render the saved value with type-safety
      (`@my-plugin/react`, `@my-plugin/vue`).
- [ ] **Audit trail** — log option changes per entry for compliance.

---

## 6. Contributing checklist

When adding a new sub-field type:

1. Extend `DynamicFieldType` in `admin/src/types.ts`.
2. Add a `case` to `DynamicFieldRenderer.tsx`.
3. Cover the new type in `validation.ts` if it needs special validation.
4. Add a Jest case in `utils/__tests__/validation.test.ts`.
5. Update the **Supported field types** section in `README.md`.

When adding a new translation:

1. Drop `admin/src/translations/<locale>.json` with the same keys as `en.json`.
2. No code change required — `registerTrads` auto-discovers it.

---

## 7. Known limitations

- The CTB options input is a raw JSON textarea — easy to mistype.
  Solved by the planned visual builder.
- Validation runs **only client-side** today. Don't rely on it for
  trust boundaries until the server-side validator (roadmap) lands.
- Settings-page defaults are per-admin (`localStorage`); not shared
  across users.
- Localized option *labels* aren't supported yet (content i18n is —
  see `README.md`).

---

## 8. License

MIT
