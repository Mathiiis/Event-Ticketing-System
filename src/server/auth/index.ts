import NextAuth from "next-auth";
import { authOptions } from "./config";

export const handler = NextAuth(authOptions);

export { authOptions }; // utile pour getServerSession()

// Next.js a besoin de ces exports pour les routes API
export { handler as GET, handler as POST };
