import defaultBranding from "./branding.default";
import type { BrandingConfig } from "./branding.types";

const brandKey = process.env.NEXT_PUBLIC_BRAND?.trim().toLowerCase();

let branding: BrandingConfig = defaultBranding;

if (brandKey && brandKey !== "default") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(`./branding.${brandKey}`);
    const candidate = (module?.default ?? module) as BrandingConfig | undefined;
    if (candidate) branding = candidate;
  } catch {
    // Fallback silencieux vers le branding par défaut.
  }
}

export { branding };
export type { BrandingConfig };
