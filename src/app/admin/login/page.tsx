import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f7f3eb]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#085040]/20 border-t-[#085040]" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
