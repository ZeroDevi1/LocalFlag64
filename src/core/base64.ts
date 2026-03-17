const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function utf8ToBytes(value: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value);
  }

  const encoded = unescape(encodeURIComponent(value));
  const bytes = new Uint8Array(encoded.length);
  for (let index = 0; index < encoded.length; index += 1) {
    bytes[index] = encoded.charCodeAt(index);
  }
  return bytes;
}

function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes);
  }

  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return decodeURIComponent(escape(binary));
}

function encodeBase64Bytes(bytes: Uint8Array): string {
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const byte1 = bytes[index] ?? 0;
    const byte2 = bytes[index + 1] ?? 0;
    const byte3 = bytes[index + 2] ?? 0;
    const combined = (byte1 << 16) | (byte2 << 8) | byte3;

    output += BASE64_ALPHABET[(combined >> 18) & 63];
    output += BASE64_ALPHABET[(combined >> 12) & 63];
    output += index + 1 < bytes.length ? BASE64_ALPHABET[(combined >> 6) & 63] : "=";
    output += index + 2 < bytes.length ? BASE64_ALPHABET[combined & 63] : "=";
  }

  return output;
}

function decodeBase64ToBytes(input: string): Uint8Array {
  const normalized = normalizeBase64Input(input);

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error("Base64 字符串包含非法字符");
  }

  const padding = normalized.endsWith("==")
    ? 2
    : normalized.endsWith("=")
      ? 1
      : 0;

  const outputLength = (normalized.length / 4) * 3 - padding;
  const bytes = new Uint8Array(outputLength);
  let offset = 0;

  for (let index = 0; index < normalized.length; index += 4) {
    const chunk = normalized.slice(index, index + 4);
    const value1 = BASE64_ALPHABET.indexOf(chunk[0] ?? "A");
    const value2 = BASE64_ALPHABET.indexOf(chunk[1] ?? "A");
    const value3 = chunk[2] === "=" ? 0 : BASE64_ALPHABET.indexOf(chunk[2] ?? "A");
    const value4 = chunk[3] === "=" ? 0 : BASE64_ALPHABET.indexOf(chunk[3] ?? "A");

    if (value1 < 0 || value2 < 0 || value3 < 0 || value4 < 0) {
      throw new Error("Base64 字符串包含无法解码的分组");
    }

    const combined = (value1 << 18) | (value2 << 12) | (value3 << 6) | value4;
    bytes[offset] = (combined >> 16) & 255;
    offset += 1;

    if (chunk[2] !== "=" && offset <= bytes.length - 1) {
      bytes[offset] = (combined >> 8) & 255;
      offset += 1;
    }

    if (chunk[3] !== "=" && offset <= bytes.length - 1) {
      bytes[offset] = combined & 255;
      offset += 1;
    }
  }

  return bytes;
}

export function normalizeBase64Input(raw: string): string {
  const cleaned = raw.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const remainder = cleaned.length % 4;

  if (remainder === 0) {
    return cleaned;
  }

  return cleaned.padEnd(cleaned.length + (4 - remainder), "=");
}

export function encodeBase64Utf8(value: string): string {
  return encodeBase64Bytes(utf8ToBytes(value));
}

export function encodeBase64UrlUtf8(
  value: string,
  options: { padding?: boolean } = {}
): string {
  const encoded = encodeBase64Utf8(value).replace(/\+/g, "-").replace(/\//g, "_");
  return options.padding === false ? encoded.replace(/=+$/g, "") : encoded;
}

export function tryDecodeBase64Utf8(value: string): string | null {
  try {
    return bytesToUtf8(decodeBase64ToBytes(value));
  } catch {
    return null;
  }
}

export function tryDecodeBase64UrlUtf8(value: string): string | null {
  return tryDecodeBase64Utf8(value.replace(/-/g, "+").replace(/_/g, "/"));
}

export function isLikelyBase64Text(value: string): boolean {
  const cleaned = value.replace(/\s+/g, "");
  return cleaned.length > 0 && /^[A-Za-z0-9+/=_-]+$/.test(cleaned);
}
