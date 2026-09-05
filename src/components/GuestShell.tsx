import type { ReactNode } from "react";
import GuestFooter from "@/components/GuestFooter";
import GuestHeader from "@/components/GuestHeader";

export default function GuestShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F4EFE6] text-[#2B1C17]">
      <div className="mx-auto min-h-screen w-full max-w-[480px] bg-[#FFFDF8] shadow-[0_0_80px_-30px_rgba(35,20,12,0.28)]">
        <GuestHeader />
        {children}
        <GuestFooter />
      </div>
    </main>
  );
}
