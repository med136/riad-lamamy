import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="lux-panel rounded-3xl border border-amber-200/50 p-6 shadow-2xl sm:p-8">
            <div className="h-6 w-40 rounded-full bg-amber-200/30" />
            <div className="mt-6 h-10 w-64 rounded-2xl bg-amber-200/20" />
            <div className="mt-3 h-4 w-56 rounded-2xl bg-amber-200/20" />
            <div className="mt-10 h-11 w-full rounded-2xl bg-amber-200/20" />
            <div className="mt-4 h-11 w-full rounded-2xl bg-amber-200/20" />
            <div className="mt-6 h-12 w-full rounded-full bg-amber-200/30" />
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}

