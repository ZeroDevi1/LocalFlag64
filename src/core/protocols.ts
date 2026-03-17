import {
  encodeBase64UrlUtf8,
  encodeBase64Utf8,
  tryDecodeBase64UrlUtf8,
  tryDecodeBase64Utf8
} from "./base64";

export const SUPPORTED_PROTOCOLS = [
  "ss",
  "ssr",
  "trojan",
  "vmess",
  "vless",
  "hysteria",
  "hysteria2",
  "hy2",
  "tuic"
] as const;

function splitUrlParts(line: string) {
  const hashIndex = line.indexOf("#");
  const beforeHash = hashIndex >= 0 ? line.slice(0, hashIndex) : line;
  const fragment = hashIndex >= 0 ? line.slice(hashIndex + 1) : "";
  const queryIndex = beforeHash.indexOf("?");

  return {
    base: queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash,
    fragment,
    hasFragment: hashIndex >= 0,
    query: queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : ""
  };
}

function joinUrlParts(base: string, query: string, fragment: string, hasFragment: boolean): string {
  const withQuery = query ? `${base}?${query}` : base;
  if (!hasFragment) {
    return withQuery;
  }
  return `${withQuery}#${fragment}`;
}

function tryReadFragmentName(line: string): string | null {
  const parts = splitUrlParts(line);
  if (!parts.hasFragment) {
    return null;
  }

  try {
    return decodeURIComponent(parts.fragment);
  } catch {
    return parts.fragment;
  }
}

function updateEncodedFragment(line: string, newName: string): string {
  const parts = splitUrlParts(line);
  return joinUrlParts(parts.base, parts.query, encodeURIComponent(newName), true);
}

function updateKnownQueryName(line: string, newName: string): string | null {
  if (!newName) {
    return null;
  }

  const parts = splitUrlParts(line);
  if (!parts.query) {
    return null;
  }

  const params = new URLSearchParams(parts.query);
  const keys = ["remarks", "remark", "name", "ps"];
  let targetKey: string | null = null;

  for (const key of keys) {
    if (params.has(key)) {
      targetKey = key;
      break;
    }
  }

  if (!targetKey) {
    return null;
  }

  params.set(targetKey, newName);
  return joinUrlParts(parts.base, params.toString(), parts.fragment, parts.hasFragment);
}

function renameQueryName(line: string, rename: (name: string) => string): string {
  const parts = splitUrlParts(line);
  const params = new URLSearchParams(parts.query);
  const keys = ["remarks", "remark", "name", "ps"];

  for (const key of keys) {
    const value = params.get(key);
    if (value) {
      return rename(value);
    }
  }

  return "";
}

function renameStandardUrlLine(line: string, rename: (name: string) => string): string {
  const fragmentName = tryReadFragmentName(line);
  if (fragmentName) {
    const updated = rename(fragmentName);
    return updated === fragmentName ? line : updateEncodedFragment(line, updated);
  }

  const queryName = renameQueryName(line, rename);
  const updatedQueryLine = updateKnownQueryName(line, queryName);
  return updatedQueryLine ?? line;
}

function renameVmessLine(line: string, rename: (name: string) => string): string {
  const payload = line.slice("vmess://".length);
  const decoded = tryDecodeBase64Utf8(payload);
  if (!decoded) {
    return line;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return line;
  }

  const name = typeof parsed.ps === "string" ? parsed.ps : "";
  if (!name) {
    return line;
  }

  const updated = rename(name);
  if (updated === name) {
    return line;
  }

  parsed.ps = updated;
  return `vmess://${encodeBase64Utf8(JSON.stringify(parsed))}`;
}

function renameSsrLine(line: string, rename: (name: string) => string): string {
  const payload = line.slice("ssr://".length);
  const decoded = tryDecodeBase64UrlUtf8(payload);
  if (!decoded) {
    return line;
  }

  const separator = decoded.indexOf("/?");
  if (separator < 0) {
    return line;
  }

  const base = decoded.slice(0, separator);
  const query = decoded.slice(separator + 2);
  const params = new URLSearchParams(query);
  const remarks = params.get("remarks");
  if (!remarks) {
    return line;
  }

  const remarkText = tryDecodeBase64UrlUtf8(remarks);
  if (!remarkText) {
    return line;
  }

  const updated = rename(remarkText);
  if (updated === remarkText) {
    return line;
  }

  params.set("remarks", encodeBase64UrlUtf8(updated, { padding: false }));
  const rebuilt = `${base}/?${params.toString()}`;
  return `ssr://${encodeBase64UrlUtf8(rebuilt, { padding: false })}`;
}

export function extractProtocol(line: string): string | null {
  const match = line.match(/^([a-z0-9+.-]+):\/\//i);
  return match ? match[1].toLowerCase() : null;
}

export function looksLikeNodeLine(line: string): boolean {
  const protocol = extractProtocol(line);
  return protocol ? SUPPORTED_PROTOCOLS.includes(protocol as (typeof SUPPORTED_PROTOCOLS)[number]) : false;
}

export function renameNodeLine(line: string, rename: (name: string) => string): string {
  const protocol = extractProtocol(line);
  if (!protocol) {
    return line;
  }

  if (protocol === "vmess") {
    return renameVmessLine(line, rename);
  }

  if (protocol === "ssr") {
    return renameSsrLine(line, rename);
  }

  if (SUPPORTED_PROTOCOLS.includes(protocol as (typeof SUPPORTED_PROTOCOLS)[number])) {
    return renameStandardUrlLine(line, rename);
  }

  return line;
}
