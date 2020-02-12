# docusaurus-plugin-lunr

Docusaurus v2 plugin to create a local search index for use with Lunr.js

> **Note**: This library was created with [typescript-starter](https://github.com/bitjson/typescript-starter).
> Currently, the `test` target fails with Prettier formatting compliance errors. The plugin does build and run,
> so I'm ignoring Prettier for now.

## Installation

Install the plugin with npm:

```bash
npm install --save @aldridged/docusaurus-plugin-lunr
```

Add the plugin do `docusaurus.config.js`:

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    '@aldridged/docusaurus-plugin-lunr'
  ]
};
```

## Generated index

The plugin watches and processes markdown files in a similar manner to the official
[docusaurus-plugin-content-docs](https://github.com/facebook/docusaurus/tree/master/packages/docusaurus-plugin-content-docs) plugin. The content is stripped of HTML tags and Markdown formatting,
and the resulting plaintext is added to a [Lunr.js](https://lunrjs.com/) index which gets serialized to the standard Docusaurus v2 plugin [contentLoaded createData](https://v2.docusaurus.io/docs/lifecycle-apis#async-contentloadedcontent-actions) output location (by default, `<repo>/.docusaurus/docusaurus-plugin-lunr/search-index.json`).

The index contains the following fields for each document:

- **content**: plaintext content
- **route**: the permalink for the generated document route
- **title**: document title found in the front matter
- **version**: the associated documentation version, or `null` if no versions are present

## SearchBar component

The plugin includes a theme SearchBar theme component which consumes the Lunr index. By including the plugin in the
Docusaurus config, the Navbar will include the SearchBar component which uses the generated search index. This works
because the plugin-generated index is available via import, as the Docusaurus v2 core Webpack configuration configures
an alias for `@generated`.

## Known limitations

The custom React hook used by the SearchBar component performs a dynamic import via `import(@site/versions.json)`. If
a versions.json file is not present at the root of your docs repo, this will throw, and you apparently not catch that
error and use a default empty array. The versions.json file is not created until you use the Docusaurus CLI to archive
a varsion. Note that this plugin does not actually require you to have versions -- it only needs version.json, so the
current suggestion is to manually create the file with emtpy array contents.
