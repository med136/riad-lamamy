import assert from "node:assert/strict";
import test from "node:test";
import { CalendarNetworkError, validateCalendarUrl } from "./network-policy.ts";

const resolver = (addresses: string[]) => async () => addresses;

test("accepts public HTTPS calendar targets", async () => {
  const target = await validateCalendarUrl(
    "https://calendar.example.com/export.ics",
    resolver(["93.184.216.34"]),
  );
  assert.equal(target.hostname, "calendar.example.com");
  assert.deepEqual(target.addresses, ["93.184.216.34"]);
});

test("rejects credentials, unsafe ports, localhost, private and metadata addresses", async () => {
  const cases: Array<[string, string[]]> = [
    ["http://calendar.example.com/feed", ["93.184.216.34"]],
    ["https://user:pass@calendar.example.com/feed", ["93.184.216.34"]],
    ["https://calendar.example.com:8443/feed", ["93.184.216.34"]],
    ["https://localhost/feed", ["127.0.0.1"]],
    ["https://calendar.example.com/feed", ["10.0.0.4"]],
    ["https://calendar.example.com/feed", ["169.254.169.254"]],
    ["https://calendar.example.com/feed", ["::1"]],
    ["https://calendar.example.com/feed", ["fc00::1"]],
  ];
  for (const [url, addresses] of cases) {
    await assert.rejects(
      validateCalendarUrl(url, resolver(addresses)),
      (error: unknown) => error instanceof CalendarNetworkError,
      url,
    );
  }
});

test("rejects mixed public/private DNS answers to prevent rebinding", async () => {
  await assert.rejects(
    validateCalendarUrl(
      "https://calendar.example.com/feed",
      resolver(["93.184.216.34", "192.168.1.8"]),
    ),
    /unsafe_address/,
  );
});
