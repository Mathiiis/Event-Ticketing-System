import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "@/server/db";
import { env } from "@/env";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    DiscordProvider({
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  secret: env.AUTH_SECRET,
};
