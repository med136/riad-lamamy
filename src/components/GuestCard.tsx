import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function GuestCard({
  icon: Icon,
  title,
  subtitle,
  href,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[82px] items-center gap-3 rounded-[16px] border border-[#B28A47]/15 bg-white px-3.5 py-3 transition-all hover:-translate-y-0.5 hover:border-[#B28A47]/35 hover:shadow-[0_12px_25px_-22px_rgba(35,20,12,0.4)]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8F5EF] text-[#0F5A46]">
        <Icon size={17} strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-[15px] font-medium leading-tight text-[#2B1C17]">
          {title}
        </h3>
        <p className="mt-0.5 text-[9px] leading-4 text-[#6F625C]">{subtitle}</p>
      </div>

      <ChevronRight
        className="h-3.5 w-3.5 shrink-0 text-[#B28A47] transition-transform group-hover:translate-x-0.5"
        strokeWidth={1.5}
      />
    </Link>
  );
}
