// @lovable.dev/vite-tanstack-config already includes tanstackStart, viteReact, tailwindcss,
// tsConfigPaths, nitro (build-only), VITE_* env injection and the @ alias — do NOT add them again.
// Never set ssr.external or resolve.external, and never compress responses here.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// On Vercel, build the server for Vercel's runtime so /api/chat and /api/speech work there too.
// Inside Lovable the hosting preset is enforced automatically.
const onVercel = !!process.env["VERCEL"];

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  ...(onVercel ? { nitro: { preset: "vercel" } } : {}),
});
