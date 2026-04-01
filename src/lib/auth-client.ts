import { createAuthClient } from "better-auth/react";

const localDevBaseURL = "http://localhost:3000";
const deployedBaseURL = import.meta.env.VITE_BETTER_AUTH_URL?.trim();
const browserOrigin = typeof window !== "undefined" ? window.location.origin : undefined;

export const authClient = createAuthClient({
  // Keep local development same-origin even when a production auth URL is configured.
  baseURL: import.meta.env.DEV ? localDevBaseURL : deployedBaseURL ?? browserOrigin ?? localDevBaseURL,
});

export default authClient;
