import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.resolve(__dirname, "../../templates/LocalFlag64.plugin.tpl");

function toDateString(input = new Date()) {
  const value = input instanceof Date ? input : new Date(input);
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseRepositorySlug(repositoryUrl) {
  if (!repositoryUrl) {
    return null;
  }

  const normalized = repositoryUrl.replace(/^git\+/, "").replace(/\.git$/, "");
  const match = normalized.match(/github\.com[:/](.+\/.+)$/i);
  return match ? match[1] : null;
}

export function resolveRepositorySlug(pkg) {
  if (typeof pkg.repository === "string") {
    return parseRepositorySlug(pkg.repository) ?? "<owner>/<repo>";
  }

  if (pkg.repository && typeof pkg.repository.url === "string") {
    return parseRepositorySlug(pkg.repository.url) ?? "<owner>/<repo>";
  }

  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }

  return "<owner>/<repo>";
}

export function resolveReleaseBaseUrl(pkg) {
  if (process.env.LOCALFLAG64_ASSET_BASE_URL) {
    return process.env.LOCALFLAG64_ASSET_BASE_URL.replace(/\/+$/, "");
  }

  const slug = resolveRepositorySlug(pkg);
  if (!slug.includes("<")) {
    return `https://cdn.jsdelivr.net/gh/${slug}@release`;
  }

  return `https://github.com/${slug}/releases/latest/download`;
}

export function renderPlugin(options) {
  const template = fs.readFileSync(templatePath, "utf8");
  return template
    .replace("__AUTHOR__", options.author)
    .replace("__HOMEPAGE__", options.homepage)
    .replace("__VERSION__", options.version)
    .replace("__DATE__", options.date)
    .replace("__SCRIPT_URL__", options.scriptUrl);
}

export function createPluginContext(pkg) {
  const repositorySlug = resolveRepositorySlug(pkg);
  const releaseBaseUrl = resolveReleaseBaseUrl(pkg);
  const homepage =
    repositorySlug.includes("<")
      ? pkg.homepage
      : `https://github.com/${repositorySlug}`;

  return {
    author: pkg.author ?? "LocalFlag64 contributors",
    date: toDateString(),
    homepage,
    pluginFilename: "LocalFlag64.plugin",
    releaseBaseUrl,
    repositorySlug,
    scriptFilename: "localflag64.min.js",
    scriptUrl: `${releaseBaseUrl}/localflag64.min.js`,
    version: pkg.version
  };
}
