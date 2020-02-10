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

## Creating an index

The plugin watches and processes markdown files in a similar manner to the official
[docusaurus-plugin-content-docs](https://github.com/facebook/docusaurus/tree/master/packages/docusaurus-plugin-content-docs) plugin. The content is stripped of HTML tags and Markdown formatting,
and the resulting plaintext is added to a [Lunr.js](https://lunrjs.com/) index which gets serialized to the standard Docusaurus v2 plugin [contentLoaded createData](https://v2.docusaurus.io/docs/lifecycle-apis#async-contentloadedcontent-actions) output location (by default, `<repo>/.docusaurus/docusaurus-plugin-lunr/search-index.json`).

The index contains the following fields for each document:

- **content**: plaintext content
- **route**: the permalink for the generated document route
- **title**: document title found in the front matter
- **version**: the associated documentation version, or `null` if no versions are present

## Using the index

The plugin does not include a SearchBar theme component which consumes the Lunr index, and the exercise
is left to the reader ;-). The plugin-generated index is available via import, as the Docusaurus v2 core Webpack
configuration configures an alias for `@generated`. At a high lrevel, you import the serialized data, initialize
a new Lunr Index with that data, and perform queries against it:

```javascript
import * as lunr from 'lunr';
import indexData from '@generated/docusaurus-plugin-lunr/search-index.json';

// Create index from serialized data
const { documents, index } = indexData;
const lunrIndex = lunr.Index.load(index);

// Get search terms from an input element or such
const terms = input
  .split(' ')
  .map(each => each.trim().toLowerCase())
  .filter(each => each.length > 0);

// Search the index (using version if known)
const results = lunrIndex
  .query(query => {
    if (currentVersion) {
      query.term(currentVersion, {
        fields: ['version'],
        presence: lunr.Query.presence.REQUIRED
      });
    }
    query.term(terms, { fields: ['title', 'content'] });
    query.term(terms, {
      fields: ['title', 'content'],
      wildcard: lunr.Query.wildcard.TRAILING
    });
  })
  .slice(0, 8);
```

## Determining current version

> **Note**: I plan to create a custom React Hook for determining the version using this technique,
> and a Docusaurus v2 theme plugin with a SearchBar that uses it.

If you swizzle the SearchBar component from the classic theme, you can use the Docusaurus context
and current location path to programmatically determing the documention version for the current page.

```javascript
import { concat, head } from 'lodash/fp';
import URI from 'urijs';

const context = useDocusaurusContext();
const { pathname } = useLocation();

const { siteConfig = {} } = context;
const { baseUrl, customFields = {}, url: origin } = siteConfig;
const { routeBasePath = 'docs' } = customFields;
const routeBase = routeBasePath.endsWith('/')
  ? routeBasePath
  : `${routeBasePath}/`;

const docsUri = URI(routeBase, URI(baseUrl, origin));
const locationUri = URI(pathname, origin);
const versionPath = locationUri.relativeTo(docsUri);
const maybeVersion = versionPath.segment(0);
const currentVersion = concat(knownVersions, 'next').includes(maybeVersion)
  ? maybeVersion
  : head(knownVersions);
```
