import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export class CalendarNetworkError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "CalendarNetworkError";
    this.code = code;
  }
}

export type AddressResolver = (hostname: string) => Promise<string[]>;
export type ValidatedTarget = { url: URL; hostname: string; addresses: string[] };

const defaultResolver: AddressResolver = async (hostname) =>
  (await lookup(hostname, { all: true, verbatim: true })).map((entry) => entry.address);

const unsafeIpv4 = (address: string) => {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
};

const unsafeAddress = (address: string) => {
  const family = isIP(address);
  if (family === 4) return unsafeIpv4(address);
  if (family !== 6) return true;
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) return unsafeIpv4(normalized.slice(7));
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("2001:db8:")
  );
};

export async function validateCalendarUrl(
  value: string,
  resolver: AddressResolver = defaultResolver,
): Promise<ValidatedTarget> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new CalendarNetworkError("invalid_url");
  }
  if (url.protocol !== "https:") throw new CalendarNetworkError("https_required");
  if (url.username || url.password) throw new CalendarNetworkError("credentials_forbidden");
  if (url.port && url.port !== "443") throw new CalendarNetworkError("unsafe_port");
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new CalendarNetworkError("unsafe_hostname");
  }
  const addresses = isIP(hostname) ? [hostname] : await resolver(hostname);
  if (addresses.length === 0) throw new CalendarNetworkError("dns_empty");
  if (addresses.some(unsafeAddress)) throw new CalendarNetworkError("unsafe_address");
  return { url, hostname, addresses };
}
