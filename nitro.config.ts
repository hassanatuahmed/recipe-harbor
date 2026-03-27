import { defineNitroConfig } from "nitro/config";

const isVercelBuild =
  process.env.NITRO_PRESET === "vercel" || Boolean(process.env.VERCEL);

export default defineNitroConfig({
  compatibilityDate: "2026-03-27",
  preset: isVercelBuild ? "vercel" : undefined,
  vercel: {
    functions: {
      runtime: "nodejs22.x",
    },
  },
});
