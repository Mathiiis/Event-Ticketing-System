import { branding } from "@/config/branding";

type BrandFooterProps = {
  className?: string;
};

export default function BrandFooter({ className }: BrandFooterProps) {
  return (
    <footer className={className ?? ""}>
      <div className="mx-auto w-full max-w-6xl px-6 py-10 text-center text-sm text-slate-500">
        {branding.footerText}
      </div>
    </footer>
  );
}
