const TRANSIENT_CODES = new Set(["timeout", "fetch_failed", "upstream_status_429", "upstream_status_500", "upstream_status_502", "upstream_status_503", "upstream_status_504"]);

export const retryDelayMs = (attempt: number) =>
  Math.min(900_000, 60_000 * 2 ** Math.max(0, attempt - 1));

export const shouldRetrySync = (errorCode: string | undefined, attempt: number) =>
  attempt < 3 && Boolean(errorCode && TRANSIENT_CODES.has(errorCode));
