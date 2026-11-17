# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-11-17

### Upgrade notes
- Writes are now validated on the server. Requests that previously succeeded with invalid values (missing required sub-fields, a `selectedOption` no longer in the configured options, malformed JSON) now fail with `400 ValidationError`. Entries saved before upgrading are not changed, but editing one whose stored option was removed requires picking a valid option before it can be saved.

### Added
- Server-side validation: a Document Service middleware applies the admin's validation rules to every `create` / `update` / `clone` (REST, GraphQL, programmatic), including fields nested in components and dynamic zones. Invalid values return `400 ValidationError` with per-field paths. Unknown options and malformed values are rejected.
- `@strapi/utils` peer dependency (`^5.47.0`), used to throw Strapi's own `ValidationError`.

### Removed
- Scaffold content-API route `GET /api/conditional-field-builder` (it returned a placeholder "Welcome to Strapi" message), along with its unused controller and service.

## [0.1.4] - 2026-11-17

### Security
- Bumped Strapi dev dependencies to pick up upstream security fixes: `@strapi/strapi` and `@strapi/typescript-utils` 5.47.0 → 5.62.0, `@strapi/design-system` and `@strapi/icons` 2.2.0 → 2.3.1, `@strapi/sdk-plugin` 6.1.0 → 6.1.1.
- Regenerated `package-lock.json` to pull patched transitive dependencies. `npm audit` drops from 83 findings (8 critical) to 36 (0 critical). The remaining highs come from the `zod` version that Strapi pins and need an upstream Strapi fix. None of these affect the published package, which ships only `dist`.
- CI now runs on Node 24 LTS instead of Node 20, which is end-of-life and below Strapi 5's minimum of Node 22.

### Changed
- Added `engines.node` (`>=22.0.0 <=26.x.x`) to match Strapi 5's supported Node range.
- GitHub Actions: `actions/checkout` and `actions/setup-node` v4 → v7.
- Minor/patch bumps: `styled-components` 6.6.0, `@vitejs/plugin-react` 6.3.0, `prettier` 3.10.1, `@testing-library/react` 16.3.3.
- Peer dependency ranges are unchanged.

### Fixed
- Build no longer warns `Cannot find module '../assets/logo.png'` while generating type declarations. `custom.d.ts` moved into `admin/src`.
- Test files are now excluded from the published type declarations (`dist/admin/src/__tests__`).
- `npm run test:ts:front` now type-checks test files that use vitest globals.
- `npm run test:ts:back` no longer writes compiled `.js` files into `server/src` (`noEmit`).

## [0.1.3] - 2026-06-21

### Added
- Plugin logo: shown in the README header and used as the custom field's icon in the Content-Type Builder.

## [0.1.2] - 2026-06-10

### Fixed
- Loosened the `react-intl` peer dependency range from `^6.8.9` to `^6.6.0` so the plugin installs cleanly into a fresh Strapi 5 project (Strapi 5.48 ships `react-intl@6.6.2`, which previously caused `ERESOLVE` peer conflicts).

## [0.1.1] - 2026-06-01

### Added
- GitHub Actions workflow for publishing to npm.
- Vitest configuration and initial test setup.
- Contributors section in the README.

### Changed
- Publish workflow updated to include an npm upgrade step and clarified the publish command.
- `package.json` metadata updates.

## [0.1.0] - 2026-06-01

### Added
- Initial release of `strapi-plugin-conditional-field-builder`: a Strapi v5 custom field that renders a dropdown whose selected option exposes a tailored set of sub-fields, stored as a single JSON value.
- README with usage documentation and examples for conditional field configurations.

[0.2.0]: https://github.com/AhmadAl-Ghalban/strapi-plugin-conditional-field-builder/releases/tag/v0.2.0
[0.1.4]: https://github.com/AhmadAl-Ghalban/strapi-plugin-conditional-field-builder/releases/tag/v0.1.4
[0.1.3]: https://github.com/AhmadAl-Ghalban/strapi-plugin-conditional-field-builder/releases/tag/v0.1.3
[0.1.2]: https://github.com/AhmadAl-Ghalban/strapi-plugin-conditional-field-builder/releases/tag/v0.1.2
[0.1.1]: https://github.com/AhmadAl-Ghalban/strapi-plugin-conditional-field-builder/releases/tag/v0.1.1
[0.1.0]: https://github.com/AhmadAl-Ghalban/strapi-plugin-conditional-field-builder/releases/tag/v0.1.0
