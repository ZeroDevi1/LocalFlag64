import { handleSubscriptionProxyRequest } from "./handler";
import { createRuntimeFetcher } from "./runtime";

declare const $done:
  | ((payload: { response: { body: string; headers: Record<string, string>; status: number } }) => void)
  | undefined;
declare const $request: { url: string } | undefined;

async function main() {
  if (!$done) {
    throw new Error("当前环境缺少 $done");
  }

  const requestUrl = $request?.url;
  if (!requestUrl) {
    $done({
      response: {
        body: "[LocalFlag64] 当前脚本仅支持 Loon 的 http-request 场景",
        headers: {
          "content-type": "text/plain; charset=utf-8"
        },
        status: 400
      }
    });
    return;
  }

  const response = await handleSubscriptionProxyRequest(requestUrl, createRuntimeFetcher());
  $done({ response });
}

void main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  if ($done) {
    $done({
      response: {
        body: `[LocalFlag64] 运行失败：${message}`,
        headers: {
          "content-type": "text/plain; charset=utf-8"
        },
        status: 500
      }
    });
  }
});
