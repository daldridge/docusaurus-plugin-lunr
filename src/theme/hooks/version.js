import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { concat, head } from 'lodash/fp';
import URI from 'urijs';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function useDocusaurusDocsVersion() {
  const [version, setVersion] = useState(null);
  const context = useDocusaurusContext();
  const location = useLocation();

  // tslint:disable-next-line: no-expression-statement
  useEffect(() => {
    async function determineVersion() {
      const { siteConfig = {} } = context;
      const { baseUrl, customFields = {}, url: origin } = siteConfig;
      const { routeBasePath = 'docs' } = customFields;
      const routeBase = routeBasePath.endsWith('/') ? routeBasePath : `${routeBasePath}/`;

      const { pathname } = location;
      const docsUri = URI(routeBase, URI(baseUrl, origin));
      const locationUri = URI(pathname, origin);
      const versionPath = locationUri.relativeTo(docsUri);
      const maybeVersion = versionPath.segment(0);

      try {
        const { default: knownVersions } = await import('@site/versions.json');
        const currentVersion = concat(knownVersions, 'next').includes(maybeVersion) ? maybeVersion : head(knownVersions);
        // tslint:disable-next-line: no-expression-statement
        setVersion(currentVersion);
      } catch (err) {
        console.error(err);
      }
    }

    determineVersion();
  }, [context, location]);

  return version;
}
