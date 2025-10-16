import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/config";
import { db } from "@/server/db";

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerSession(authOptions);

  return {
    db,
    session,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURES
 */
export const createTRPCRouter = t.router;

/**
 * Middleware de timing (utile en dev)
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  console.log(`[tRPC] ${path} exécuté en ${Date.now() - start}ms`);
  return result;
});

/**
 * Procédure publique (pas besoin d'être connecté)
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Procédure protégée (utilisateur authentifié obligatoire)
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

/**
 * Factory pour créer des appels serveur-à-serveur
 */
export const createCallerFactory = t.createCallerFactory;
