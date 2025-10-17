import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "@/server/db";
import { env } from "@/env";

// 🧩 Déclaration des types personnalisés pour NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

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
      // ✅ Injecte l'ID utilisateur dans la session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  secret: env.AUTH_SECRET,
};
