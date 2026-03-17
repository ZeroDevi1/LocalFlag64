import { describe, expect, it, vi } from "vitest";
import worker from "../src/worker/index";
import { encodeBase64Utf8, tryDecodeBase64Utf8 } from "../src/core/base64";

describe("worker entry", () => {
  it("返回健康检查", async () => {
    const response = await worker.fetch(
      new Request("https://localflag64.example.workers.dev/health")
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      name: "LocalFlag64",
      ok: true,
      version: "1.1.0"
    });
  });

  it("代理订阅并返回加旗结果", async () => {
    const upstreamBody = encodeBase64Utf8(
      "trojan://password@example.com:443#Singapore%2001"
    );
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(upstreamBody, {
          headers: {
            "content-type": "text/plain; charset=utf-8"
          },
          status: 200
        })
      );

    const originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", fetchMock);

    try {
      const response = await worker.fetch(
        new Request(
          "https://localflag64.example.workers.dev/sub?url=https%3A%2F%2Fexample.com%2Fsub"
        )
      );
      const body = await response.text();
      const decoded = tryDecodeBase64Utf8(body) ?? "";

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.com/sub",
        expect.objectContaining({
          method: "GET",
          redirect: "follow"
        })
      );
      expect(decodeURIComponent(decoded.split("#")[1] ?? "")).toBe("🇸🇬 Singapore 01");
    } finally {
      vi.stubGlobal("fetch", originalFetch);
    }
  });
});
