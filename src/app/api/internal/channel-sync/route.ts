import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSchedulerDependencies, runScheduledSync } from "@/lib/channel-manager/sync/scheduler";
import { createAdminClient } from "@/lib/supabase/adminClient";

const matchesSecret = (presented: string, expected: string) => {
  const left = createHash("sha256").update(presented).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
};

export async function POST(request: Request) {
  const expected = process.env.CHANNEL_SCHEDULER_SECRET;
  if (!expected) return NextResponse.json({ error: "scheduler_not_configured" }, { status: 503 });
  const authorization = request.headers.get("authorization") ?? "";
  const presented = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!presented || !matchesSecret(presented, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const summary = await runScheduledSync(new Date(), createSchedulerDependencies(createAdminClient()));
  return NextResponse.json(summary);
}
