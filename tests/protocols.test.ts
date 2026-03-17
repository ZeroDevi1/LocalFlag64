import { describe, expect, it } from "vitest";
import {
  encodeBase64UrlUtf8,
  encodeBase64Utf8,
  tryDecodeBase64UrlUtf8,
  tryDecodeBase64Utf8
} from "../src/core/base64";
import { applyFlagToName } from "../src/core/flags";
import { renameNodeLine } from "../src/core/protocols";

describe("protocol renaming", () => {
  it("处理 fragment 型节点名称", () => {
    const line = "vless://uuid@example.com:443?security=tls#US%20Seattle%2001";
    const updated = renameNodeLine(line, applyFlagToName);
    expect(decodeURIComponent(updated.split("#")[1] ?? "")).toBe("🇺🇸 US Seattle 01");
  });

  it("处理 vmess 节点名称", () => {
    const payload = {
      add: "example.com",
      aid: "0",
      host: "",
      id: "11111111-1111-1111-1111-111111111111",
      net: "ws",
      path: "/",
      port: "443",
      ps: "日本 01",
      tls: "tls",
      type: "none",
      v: "2"
    };
    const line = `vmess://${encodeBase64Utf8(JSON.stringify(payload))}`;
    const updated = renameNodeLine(line, applyFlagToName);
    const decoded = tryDecodeBase64Utf8(updated.slice("vmess://".length));
    expect(decoded).not.toBeNull();
    expect(JSON.parse(decoded ?? "{}").ps).toBe("🇯🇵 日本 01");
  });

  it("处理 ssr remarks", () => {
    const remark = encodeBase64UrlUtf8("香港 01", { padding: false });
    const payload = `example.com:443:origin:aes-256-cfb:plain:password/?remarks=${remark}`;
    const line = `ssr://${encodeBase64UrlUtf8(payload, { padding: false })}`;
    const updated = renameNodeLine(line, applyFlagToName);
    const decodedPayload = tryDecodeBase64UrlUtf8(updated.slice("ssr://".length));
    const params = new URLSearchParams((decodedPayload ?? "").split("/?")[1] ?? "");
    expect(tryDecodeBase64UrlUtf8(params.get("remarks") ?? "")).toBe("🇭🇰 香港 01");
  });

  it("已带 emoji 时不重复添加", () => {
    const line = "trojan://password@example.com:443#%F0%9F%87%AD%F0%9F%87%B0%20HK%2001";
    expect(renameNodeLine(line, applyFlagToName)).toBe(line);
  });

  it("处理用户给定订阅中的迪拜和菲律宾节点", () => {
    const dubaiLine =
      "hysteria2://uuid@dibai1.xtunnel.club:5443?insecure=1&sni=cdn.example.com#一星hysteria2迪拜下载专用";
    const phLine =
      "trojan://uuid@mnl.cyccyh.com:443?allowInsecure=1&tfo=1#一星trojan菲律宾-ChatGPT支持";

    expect(decodeURIComponent(renameNodeLine(dubaiLine, applyFlagToName).split("#")[1] ?? "")).toBe(
      "🇦🇪 一星hysteria2迪拜下载专用"
    );
    expect(decodeURIComponent(renameNodeLine(phLine, applyFlagToName).split("#")[1] ?? "")).toBe(
      "🇵🇭 一星trojan菲律宾-ChatGPT支持"
    );
  });
});
