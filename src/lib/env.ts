import fs from 'fs-extra';
import path from 'path';

import { head, size } from 'lodash/fp';

import { VERSIONED_DOCS_DIR, VERSIONS_JSON_FILE } from './constants';
import { Env } from './types';

const VERSION_OPTIONS_DISABLED = {
  versioning: {
    docsDir: '',
    enabled: false,
    latestVersion: null,
    versions: [],
  }
};

function getVersionedDocsDir(siteDir: string): string {
  return path.join(siteDir, VERSIONED_DOCS_DIR);
}

function getVersionsJSONFile(siteDir: string): string {
  return path.join(siteDir, VERSIONS_JSON_FILE);
}

function getVersions(siteDir: string): ReadonlyArray<string> {
  const versionsJSONFile = getVersionsJSONFile(siteDir);
  return fs.existsSync(versionsJSONFile) ? JSON.parse(fs.readFileSync(versionsJSONFile, 'utf8')) : [];
}

function getOptions(siteDir: string, versions: ReadonlyArray<string>): Env {
  return {
    versioning: {
      docsDir: getVersionedDocsDir(siteDir),
      enabled: true,
      latestVersion: head(versions),
      versions,
    }
  };
}

export default function (siteDir: string): Env {
  const versions = getVersions(siteDir);
  return size(versions) ? getOptions(siteDir, versions) : VERSION_OPTIONS_DISABLED;
}
