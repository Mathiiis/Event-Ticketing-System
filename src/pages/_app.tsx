import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";
import "@fontsource/inter/index.css";
import { branding } from "@/config/branding";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>{branding.appName}</title>
        <link rel="icon" href={branding.faviconUrl} />
        <meta name="application-name" content={branding.appName} />
        <style>{`:root{--brand-primary:${branding.primaryColor};--brand-secondary:${branding.secondaryColor};}`}</style>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
