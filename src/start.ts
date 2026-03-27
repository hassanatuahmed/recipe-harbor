import { createMiddleware, createStart } from "@tanstack/react-start";

import { auth } from "./lib/server/auth";

const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return next({
    context: {
      session,
      user: session?.user ?? null,
    },
  });
});

export const startInstance = createStart(() => ({
  requestMiddleware: [authMiddleware],
}));
