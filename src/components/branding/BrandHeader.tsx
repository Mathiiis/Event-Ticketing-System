import Link from "next/link";
import { branding } from "@/config/branding";

type BrandHeaderProps = {
  className?: string;
};

export default function BrandHeader({ className }: BrandHeaderProps) {
  return (
    <header className={className ?? ""}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/events" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={branding.logoUrl}
            alt={branding.logoAlt}
            className="h-10 w-10 rounded-lg object-contain border border-slate-200 bg-white p-1"
          />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: "var(--brand-primary)" }}
          >
            {branding.appShortName}
          </span>
        </Link>
      </div>
    </header>
  );
}
