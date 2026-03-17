import { describe, expect, it } from "vitest";
import {
  encodeBase64UrlUtf8,
  encodeBase64Utf8,
  isLikelyBase64Text,
  tryDecodeBase64UrlUtf8,
  tryDecodeBase64Utf8
} from "../src/core/base64";

describe("base64 helpers", () => {
  it("支持标准 Base64 编解码", () => {
    const encoded = encodeBase64Utf8("vmess://example\nss://example#香港");
    expect(tryDecodeBase64Utf8(encoded)).toBe("vmess://example\nss://example#香港");
  });

  it("支持 URL Safe Base64", () => {
    const encoded = encodeBase64UrlUtf8("香港 01", { padding: false });
    expect(tryDecodeBase64UrlUtf8(encoded)).toBe("香港 01");
  });

  it("能识别候选 Base64 文本", () => {
    expect(isLikelyBase64Text("YWJjZA==")).toBe(true);
    expect(isLikelyBase64Text("not-base64?")).toBe(false);
  });
});
