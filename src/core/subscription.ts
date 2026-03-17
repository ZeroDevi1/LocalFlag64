import { encodeBase64Utf8, isLikelyBase64Text, tryDecodeBase64Utf8 } from "./base64";
import { applyFlagToName } from "./flags";
import { looksLikeNodeLine, renameNodeLine } from "./protocols";

export interface SubscriptionProcessResult {
  body: string;
  changedLines: number;
  processed: boolean;
  supportedLines: number;
  totalLines: number;
  wasBase64: boolean;
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function decodeSubscriptionBody(body: string): string | null {
  if (!body || !isLikelyBase64Text(body)) {
    return null;
  }

  const decoded = tryDecodeBase64Utf8(body);
  if (!decoded || decoded.includes("\u0000")) {
    return null;
  }

  return decoded;
}

export function processSubscriptionBody(body: string): SubscriptionProcessResult {
  const decoded = decodeSubscriptionBody(body);
  if (!decoded) {
    return {
      body,
      changedLines: 0,
      processed: false,
      supportedLines: 0,
      totalLines: 0,
      wasBase64: false
    };
  }

  const lines = splitLines(decoded);
  if (lines.length === 0) {
    return {
      body,
      changedLines: 0,
      processed: false,
      supportedLines: 0,
      totalLines: 0,
      wasBase64: true
    };
  }

  const supportedLines = lines.filter(looksLikeNodeLine).length;
  if (supportedLines === 0) {
    return {
      body,
      changedLines: 0,
      processed: false,
      supportedLines: 0,
      totalLines: lines.length,
      wasBase64: true
    };
  }

  let changedLines = 0;
  const nextLines = lines.map((line) => {
    const updated = renameNodeLine(line, applyFlagToName);
    if (updated !== line) {
      changedLines += 1;
    }
    return updated;
  });

  if (changedLines === 0) {
    return {
      body,
      changedLines: 0,
      processed: true,
      supportedLines,
      totalLines: lines.length,
      wasBase64: true
    };
  }

  return {
    body: encodeBase64Utf8(nextLines.join("\n")),
    changedLines,
    processed: true,
    supportedLines,
    totalLines: lines.length,
    wasBase64: true
  };
}
