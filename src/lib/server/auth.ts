import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import prisma from "../prisma";

const getEnv = (key: string) => process.env[key]?.trim();
const authSecret = getEnv("BETTER_AUTH_SECRET");

if (process.env.NODE_ENV === "production" && !authSecret) {
  throw new Error("BETTER_AUTH_SECRET is required in production.");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: authSecret,
  baseURL: getEnv("BETTER_AUTH_URL") ?? getEnv("BASE_URL") ?? "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: getEnv("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET") ?? "",
    },
  },
  plugins: [tanstackStartCookies()],
});

export default auth;
