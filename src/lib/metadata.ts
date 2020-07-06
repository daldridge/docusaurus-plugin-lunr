import { aliasedSitePath, normalizeUrl, parseMarkdownString } from '@docusaurus/utils';
import fs from 'fs-extra';
import path from 'path';
import removeMd from 'remove-markdown';
import striptags from 'striptags';

import { MetadataRaw } from './types';

function inferVersion(dirName: string, versions: ReadonlyArray<string>): string | null {
  const maybeVersion = dirName.split('/', 1).shift();
  const inferredVersion = maybeVersion ? maybeVersion.replace(/^version-/, '') : null;
  return inferredVersion && versions.includes(inferredVersion) ? inferredVersion : null;
}

function versionFromSource(dirName: string, versions: ReadonlyArray<string>): string | null {
  return /^version-/.test(dirName) ? inferVersion(dirName, versions) : 'next';
}

export default async function processMetadata({
  source,
  refDir,
  context,
  options,
  env,
}): Promise<MetadataRaw> {
  const { routeBasePath } = options;
  const { siteDir, baseUrl } = context;
  const { versioning } = env;

  const dirName = path.dirname(source);
  const filePath = path.join(refDir, source);
  const fileStringPromise = fs.readFile(filePath, 'utf-8');

  const version = (versioning.enabled) ? versionFromSource(dirName, versioning.versions) : null;

  // The version portion of the url path. Eg: 'next', '1.0.0', and ''
  const versionPath = version && version !== versioning.latestVersion ? version : '';

  const contents = await fileStringPromise;
  const plaintext = removeMd(striptags(contents));
  const { frontMatter = {}, excerpt } = parseMarkdownString(contents);

  const baseID = frontMatter.id || path.basename(source, path.extname(source));
  // tslint:disable-next-line: no-if-statement
  if (baseID.includes('/')) {
    throw new Error('Document id cannot include "/".');
  }
  // tslint:enable no-if-statement

  // Append subdirectory as part of id.
  const id = dirName !== '.' ? `${dirName}/${baseID}` : baseID;

  const title = frontMatter.title || baseID;
  const description = frontMatter.description || excerpt;

  // The last portion of the url path. Eg: 'foo/bar', 'bar'
  const routePath =
    version && version !== 'next'
      ? id.replace(new RegExp(`^version-${version}/`), '')
      : id;
  const permalink = normalizeUrl([
    baseUrl,
    routeBasePath,
    versionPath,
    routePath,
  ]);

  const metadata: MetadataRaw = {
    description,
    id,
    permalink,
    plaintext,
    source: aliasedSitePath(filePath, siteDir),
    title,
    version,
  };

  return metadata;
}
