import { processSubscriptionBody } from "../core/subscription";
import type { RuntimeFetcher, RuntimeResponse } from "./runtime";

export interface ProxyResponse {
  body: string;
  headers: Record<string, string>;
  status: number;
}

function textResponse(status: number, body: string): ProxyResponse {
  return {
    body,
    headers: {
      "content-type": "text/plain; charset=utf-8"
    },
    status
  };
}

function ensureHttpUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("订阅地址只支持 http 或 https");
  }
  return url;
}

function pickForwardHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {
    "content-type": headers["content-type"] ?? "text/plain; charset=utf-8"
  };

  const keys = [
    "cache-control",
    "content-disposition",
    "profile-update-interval",
    "profile-web-page-url",
    "subscription-userinfo"
  ];

  for (const key of keys) {
    if (headers[key]) {
      result[key] = headers[key];
    }
  }

  return result;
}

function buildSuccessResponse(upstream: RuntimeResponse): ProxyResponse {
  const processed = processSubscriptionBody(upstream.body);
  const headers = pickForwardHeaders(upstream.headers);
  headers["x-localflag64-processed"] = processed.processed ? "1" : "0";
  headers["x-localflag64-changed-lines"] = String(processed.changedLines);
  headers["x-localflag64-supported-lines"] = String(processed.supportedLines);

  return {
    body: processed.body,
    headers,
    status: upstream.status
  };
}

export async function handleSubscriptionProxyRequest(
  requestUrl: string,
  fetcher: RuntimeFetcher
): Promise<ProxyResponse> {
  let parsedRequest: URL;
  try {
    parsedRequest = new URL(requestUrl);
  } catch {
    return textResponse(400, "[LocalFlag64] 无法解析请求 URL");
  }

  const upstreamRaw = parsedRequest.searchParams.get("url");
  if (!upstreamRaw) {
    return textResponse(
      400,
      "[LocalFlag64] 缺少 url 参数。请使用 https://localflag64.loon/sub?url=<原订阅链接>"
    );
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = ensureHttpUrl(upstreamRaw);
  } catch (error) {
    return textResponse(
      400,
      `[LocalFlag64] 订阅地址无效：${error instanceof Error ? error.message : String(error)}`
    );
  }

  try {
    const upstream = await fetcher(upstreamUrl.toString(), {
      headers: {
        accept: "text/plain, */*"
      },
      method: "GET"
    });

    return buildSuccessResponse(upstream);
  } catch (error) {
    return textResponse(
      502,
      `[LocalFlag64] 拉取上游订阅失败：${error instanceof Error ? error.message : String(error)}`
    );
  }
}
