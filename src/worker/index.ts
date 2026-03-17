import { handleSubscriptionProxyRequest, type RuntimeFetcher } from "../service/proxy";

function normalizeHeaders(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries());
}

function createFetchApiFetcher(): RuntimeFetcher {
  return async (url, init) => {
    const response = await fetch(url, {
      headers: init?.headers,
      method: init?.method ?? "GET",
      redirect: "follow"
    });

    return {
      body: await response.text(),
      headers: normalizeHeaders(response.headers),
      status: response.status
    };
  };
}

function buildHomeResponse(requestUrl: string): Response {
  const exampleUpstream = "https://example.com/subscription/base64";
  const wrapped = `${requestUrl.replace(/\/+$/, "")}/sub?url=${encodeURIComponent(exampleUpstream)}`;

  return new Response(
    [
      "LocalFlag64 Worker is running.",
      "",
      "Usage:",
      wrapped,
      "",
      "Health check:",
      `${requestUrl.replace(/\/+$/, "")}/health`
    ].join("\n"),
    {
      headers: {
        "content-type": "text/plain; charset=utf-8"
      },
      status: 200
    }
  );
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({
        name: "LocalFlag64",
        ok: true,
        version: "1.1.0"
      });
    }

    if (url.pathname === "/") {
      return buildHomeResponse(url.origin);
    }

    const response = await handleSubscriptionProxyRequest(request.url, createFetchApiFetcher());
    return new Response(response.body, {
      headers: response.headers,
      status: response.status
    });
  }
};
