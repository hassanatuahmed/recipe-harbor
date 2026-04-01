import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import prisma from "../prisma";

const getEnv = (key: string) => process.env[key]?.trim();

const isProduction = process.env.NODE_ENV === "production";

// Single source of truth for base URL
const authBaseURL = isProduction
  ? getEnv("BETTER_AUTH_URL")!
  : getEnv("VITE_BETTER_AUTH_URL") ?? "http://localhost:3000";

const authSecret = getEnv("BETTER_AUTH_SECRET");

if (isProduction && !authSecret) {
  throw new Error("BETTER_AUTH_SECRET is required in production.");
}

if (isProduction && !getEnv("BETTER_AUTH_URL")) {
  throw new Error("BETTER_AUTH_URL is required in production.");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: authSecret,
  baseURL: authBaseURL,
  trustedOrigins: [
    "http://localhost:3000",
    "https://recipe-harbor-hassanatuahmeds-projects.vercel.app",
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: getEnv("GOOGLE_CLIENT_ID")!,
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET")!,
    },
  },
  plugins: [tanstackStartCookies()],
});

export default auth;