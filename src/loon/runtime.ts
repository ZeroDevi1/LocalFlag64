export interface RuntimeResponse {
  body: string;
  headers: Record<string, string>;
  status: number;
}

export type RuntimeFetcher = (
  url: string,
  init?: { headers?: Record<string, string>; method?: string }
) => Promise<RuntimeResponse>;

function normalizeHeaders(headers: Headers | Record<string, string> | undefined): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), String(value)])
  );
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

function createHttpClientFetcher(): RuntimeFetcher {
  return (url, init) =>
    new Promise((resolve, reject) => {
      const client = (globalThis as typeof globalThis & {
        $httpClient?: {
          get?: (
            options: { headers?: Record<string, string>; timeout?: number; url: string },
            callback: (error: unknown, response: { headers?: Record<string, string>; status?: number }, data: string) => void
          ) => void;
        };
      }).$httpClient;

      if (!client?.get) {
        reject(new Error("当前环境不支持 $httpClient.get"));
        return;
      }

      client.get(
        {
          headers: init?.headers,
          timeout: 30000,
          url
        },
        (error, response, data) => {
          if (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
            return;
          }

          resolve({
            body: typeof data === "string" ? data : "",
            headers: normalizeHeaders(response?.headers),
            status: Number(response?.status ?? 200)
          });
        }
      );
    });
}

export function createRuntimeFetcher(): RuntimeFetcher {
  if (typeof fetch === "function") {
    return createFetchApiFetcher();
  }

  return createHttpClientFetcher();
}
