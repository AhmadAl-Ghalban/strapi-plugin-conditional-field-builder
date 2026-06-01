# Shared components

Strapi content-type components shipped with this plugin.

Strapi loads components from the **host app's** `src/components/<category>/<name>.json`. To use these in a host project, copy this folder into the app:

```bash
mkdir -p <app>/src/components/shared
cp node_modules/my-plugin/src/components/shared/*.json <app>/src/components/shared/
```

Then reference the components in any content type:

```json
"seo": {
  "type": "component",
  "repeatable": false,
  "component": "shared.seo"
}
```
