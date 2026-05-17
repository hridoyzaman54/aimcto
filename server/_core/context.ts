import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import * as auth from "../auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // First, check for JWT auth token (email/password login)
  const authToken = opts.req.cookies?.['auth_token'];
  if (authToken) {
    try {
      const jwtUser = await auth.getUserFromToken(authToken);
      if (jwtUser) {
        user = jwtUser as User;
      }
    } catch (error) {
      // JWT auth failed, will try OAuth below
      console.warn("[Auth] JWT auth failed:", error);
    }
  }

  // If no JWT user, try OAuth authentication
  if (!user) {
    // Legacy OAuth authentication removed as per user request to delete Manus AI database/auth
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
