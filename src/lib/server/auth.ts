import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import prisma from "../prisma";

const getEnv = (key: string) => process.env[key]?.trim();
const defaultBaseURL = "http://localhost:3000";
const deployedBaseURL = "https://recipe-harbor-hassanatuahmeds-projects.vercel.app";
const isProduction = process.env.NODE_ENV === "production";
const authBaseURL = isProduction
  ? getEnv("BETTER_AUTH_URL") ?? getEnv("BASE_URL") ?? deployedBaseURL
  : getEnv("BASE_URL") ?? defaultBaseURL;
const authSecret = getEnv("BETTER_AUTH_SECRET");
const trustedOrigins = Array.from(
  new Set(
    [
      defaultBaseURL,
      deployedBaseURL,
      authBaseURL,
      ...(getEnv("BETTER_AUTH_TRUSTED_ORIGINS")
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean) ?? []),
    ].filter(Boolean),
  ),
);

if (process.env.NODE_ENV === "production" && !authSecret) {
  throw new Error("BETTER_AUTH_SECRET is required in production.");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: authSecret,
  baseURL: authBaseURL,
  trustedOrigins,
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
