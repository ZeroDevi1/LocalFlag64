import { describe, expect, it } from "vitest";
import { encodeBase64Utf8, tryDecodeBase64Utf8 } from "../src/core/base64";
import { processSubscriptionBody } from "../src/core/subscription";
import { handleSubscriptionProxyRequest } from "../src/loon/handler";

describe("subscription processing", () => {
  it("处理混合协议的 Base64 订阅", () => {
    const originalText = [
      "ss://YWVzLTI1Ni1nY206cGFzc0BleGFtcGxlLmNvbTo0NDM=#Singapore%2001",
      "vmess://eyJ2IjoiMiIsInBzIjoi5pel5pysIDAxIiwiYWRkIjoiZXhhbXBsZS5jb20iLCJwb3J0IjoiNDQzIiwiaWQiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJhaWQiOiIwIiwibmV0Ijoid3MiLCJ0eXBlIjoibm9uZSIsImhvc3QiOiIiLCJwYXRoIjoiLyIsInRscyI6InRscyJ9",
      "hysteria2://uuid@els1.xtunnel.club:7444?insecure=1&sni=cdn.example.com#一星hysteria2俄罗斯下载专用",
      "trojan://uuid@mnl.cyccyh.com:443?allowInsecure=1&tfo=1#一星trojan菲律宾-ChatGPT支持",
      "unknown://leave-me-alone"
    ].join("\n");
    const processed = processSubscriptionBody(encodeBase64Utf8(originalText));
    const decoded = tryDecodeBase64Utf8(processed.body);
    const lines = (decoded ?? "").split("\n");

    expect(processed.processed).toBe(true);
    expect(processed.changedLines).toBe(4);
    expect(decodeURIComponent(lines[0]?.split("#")[1] ?? "")).toBe("🇸🇬 Singapore 01");
    expect(JSON.parse(tryDecodeBase64Utf8(lines[1]?.slice("vmess://".length) ?? "") ?? "{}").ps).toBe(
      "🇯🇵 日本 01"
    );
    expect(decodeURIComponent(lines[2]?.split("#")[1] ?? "")).toBe("🇷🇺 一星hysteria2俄罗斯下载专用");
    expect(decodeURIComponent(lines[3]?.split("#")[1] ?? "")).toBe("🇵🇭 一星trojan菲律宾-ChatGPT支持");
    expect(decoded).toContain("unknown://leave-me-alone");
  });

  it("对无效 Base64 透传", () => {
    const processed = processSubscriptionBody("not-a-base64-subscription");
    expect(processed.processed).toBe(false);
    expect(processed.body).toBe("not-a-base64-subscription");
  });

  it("处理本地入口代理请求", async () => {
    const upstreamBody = encodeBase64Utf8("trojan://password@example.com:443#US%20Seattle");
    const response = await handleSubscriptionProxyRequest(
      "https://localflag64.loon/sub?url=https%3A%2F%2Fexample.com%2Fsub",
      async () => ({
        body: upstreamBody,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "subscription-userinfo": "upload=1; download=2; total=3"
        },
        status: 200
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers["subscription-userinfo"]).toBe("upload=1; download=2; total=3");
    const decoded = tryDecodeBase64Utf8(response.body) ?? "";
    expect(decodeURIComponent(decoded.split("#")[1] ?? "")).toBe("🇺🇸 US Seattle");
  });

  it("缺少 url 参数时返回 400", async () => {
    const response = await handleSubscriptionProxyRequest(
      "https://localflag64.loon/sub",
      async () => ({
        body: "",
        headers: {},
        status: 200
      })
    );

    expect(response.status).toBe(400);
    expect(response.body).toContain("缺少 url 参数");
  });
});
