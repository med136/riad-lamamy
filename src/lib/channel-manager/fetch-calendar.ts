import { request } from "node:https";
import type { IncomingMessage } from "node:http";
import type { AddressResolver } from "./network-policy";
import { CalendarNetworkError, validateCalendarUrl } from "./network-policy";

export type CalendarFetchResult = {
  body: string;
  finalUrl: string;
  contentType: string | null;
  bytes: number;
};

export type CalendarFetchInput = {
  url: string;
  resolver?: AddressResolver;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
};

const readBody = (response: IncomingMessage, maxBytes: number) =>
  new Promise<{ body: string; bytes: number }>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    response.on("data", (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        response.destroy(new CalendarNetworkError("response_too_large"));
        return;
      }
      chunks.push(chunk);
    });
    response.on("end", () => resolve({ body: Buffer.concat(chunks).toString("utf8"), bytes }));
    response.on("error", reject);
  });

async function fetchStep(
  value: string,
  input: Required<Pick<CalendarFetchInput, "timeoutMs" | "maxBytes" | "maxRedirects">> &
    Pick<CalendarFetchInput, "resolver">,
  redirects: number,
): Promise<CalendarFetchResult> {
  const target = await validateCalendarUrl(value, input.resolver);
  const address = target.addresses[0];
  const family = address.includes(":") ? 6 : 4;

  return new Promise((resolve, reject) => {
    const req = request(
      target.url,
      {
        method: "GET",
        headers: { Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.1", "User-Agent": "DarLaMamy-CalendarSync/1.0" },
        lookup: (_hostname, _options, callback) => callback(null, address, family),
        servername: target.hostname,
      },
      async (response) => {
        try {
          const status = response.statusCode ?? 0;
          const location = response.headers.location;
          if (status >= 300 && status < 400 && location) {
            response.resume();
            if (redirects >= input.maxRedirects) throw new CalendarNetworkError("too_many_redirects");
            const next = new URL(location, target.url).toString();
            resolve(await fetchStep(next, input, redirects + 1));
            return;
          }
          if (status !== 200) {
            response.resume();
            throw new CalendarNetworkError(`upstream_status_${status}`);
          }
          const result = await readBody(response, input.maxBytes);
          resolve({
            ...result,
            finalUrl: target.url.toString(),
            contentType: typeof response.headers["content-type"] === "string" ? response.headers["content-type"] : null,
          });
        } catch (error) {
          reject(error);
        }
      },
    );
    req.setTimeout(input.timeoutMs, () => req.destroy(new CalendarNetworkError("timeout")));
    req.on("error", (error) => reject(error instanceof CalendarNetworkError ? error : new CalendarNetworkError("fetch_failed")));
    req.end();
  });
}

export function fetchCalendarSafely(input: CalendarFetchInput) {
  return fetchStep(
    input.url,
    {
      resolver: input.resolver,
      timeoutMs: input.timeoutMs ?? 10_000,
      maxBytes: input.maxBytes ?? 1_048_576,
      maxRedirects: input.maxRedirects ?? 3,
    },
    0,
  );
}
