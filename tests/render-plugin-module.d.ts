declare module "../scripts/lib/render-plugin.mjs" {
  export interface PluginContext {
    author: string;
    date: string;
    homepage: string;
    pluginFilename: string;
    releaseBaseUrl: string;
    repositorySlug: string;
    scriptFilename: string;
    scriptUrl: string;
    version: string;
  }

  export function resolveRepositorySlug(pkg: {
    homepage?: string;
    repository?: string | { url?: string };
  }): string;

  export function resolveReleaseBaseUrl(pkg: {
    homepage?: string;
    repository?: string | { url?: string };
  }): string;

  export function renderPlugin(options: {
    author: string;
    date: string;
    homepage: string;
    scriptUrl: string;
    version: string;
  }): string;

  export function createPluginContext(pkg: {
    author?: string;
    homepage?: string;
    repository?: string | { url?: string };
    version: string;
  }): PluginContext;
}
