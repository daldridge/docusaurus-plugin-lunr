export interface PluginOptions {
  readonly path: string;
  readonly include: ReadonlyArray<string>;
  readonly routeBasePath: string;
}

export interface MetadataRaw {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly source: string;
  readonly permalink: string;
  readonly version?: string;
  readonly plaintext: string;
}

export interface LoadedContent {
  readonly metadata: ReadonlyArray<MetadataRaw>;
}

export interface VersioningEnv {
  readonly enabled: boolean;
  readonly latestVersion: string | null;
  readonly versions: ReadonlyArray<string>;
  readonly docsDir: string;
};

export interface Env {
  readonly versioning: VersioningEnv;
}
