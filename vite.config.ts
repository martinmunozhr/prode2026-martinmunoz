// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// host: true → escucha en 0.0.0.0 (todas las interfaces) para que la familia
// pueda entrar al prode desde su teléfono o PC en la misma red WiFi.
// Acceso típico: http://<IP-de-la-PC>:8080 (ej: http://192.168.0.10:8080)
export default defineConfig({
  vite: {
    server: {
      host: true,
      port: 8080,
    },
    preview: {
      host: true,
      port: 8080,
    },
  },
});
