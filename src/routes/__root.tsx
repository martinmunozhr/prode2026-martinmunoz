import { useEffect } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingModal } from "@/components/onboarding-modal";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <div className="font-display text-9xl text-gradient-pitch">404</div>
          <h2 className="mt-4 font-display text-3xl tracking-wider text-foreground">
            Página no encontrada
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            La página que buscás no existe o fue movida.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-pitch px-6 py-3 font-bold uppercase tracking-wider text-primary-foreground shadow-glow-pitch hover:scale-105 transition-transform"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function RootError({ error }: { error: unknown }) {
  // El detalle técnico va a la consola, no a la cara del usuario.
  useEffect(() => {
    console.error("Root render error:", error);
  }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 bg-background text-foreground text-center">
      <div className="text-5xl">⚠️</div>
      <h2 className="font-display text-3xl tracking-wider">Algo se rompió</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Tuvimos un problema cargando esta pantalla. Probá recargar; si sigue, avisanos.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-pitch px-6 py-3 font-bold uppercase tracking-wider text-primary-foreground shadow-glow-pitch hover:scale-105 transition-transform"
      >
        Recargar
      </button>
    </div>
  );
}

export const Route = createRootRoute({
  errorComponent: ({ error }) => <RootError error={error} />,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a0d2e" },
      { title: "Prode Mundial 2026" },
      {
        name: "description",
        content:
          "El prode del Mundial 2026. Pronosticá los 104 partidos y competí en el ranking global.",
      },
      { property: "og:title", content: "Prode Mundial 2026" },
      {
        property: "og:description",
        content: "Pronosticá cada partido del Mundial 2026 y competí con tus amigos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_AR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Prode Mundial 2026" },
      {
        name: "description",
        content:
          "World Cup Predictor: A football prediction app with real player images and a sticker collection system.",
      },
      {
        property: "og:description",
        content:
          "World Cup Predictor: A football prediction app with real player images and a sticker collection system.",
      },
      {
        name: "twitter:description",
        content:
          "World Cup Predictor: A football prediction app with real player images and a sticker collection system.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c877d0b-d52e-4c3c-9fa9-a97b2935da1d/id-preview-95b13599--e2158aea-e2c1-4c86-ba3f-5af952e45d56.lovable.app-1777274208139.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7c877d0b-d52e-4c3c-9fa9-a97b2935da1d/id-preview-95b13599--e2158aea-e2c1-4c86-ba3f-5af952e45d56.lovable.app-1777274208139.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/webp", href: "/icon.webp" },
      { rel: "apple-touch-icon", href: "/icon.webp" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700&family=Oswald:wght@700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

// Inline script that runs BEFORE first paint to set the theme class.
// Avoids the FOUC where light-mode users see a dark flash on every navigation.
const themeBootScript = `
(function(){try{
  var t = localStorage.getItem('prode-theme') || 'dark';
  var c = document.documentElement.classList;
  c.remove('light','dark');
  c.add(t);
}catch(e){}})();
`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={150}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
          <Toaster />
          <OnboardingModal />
        </div>
      </TooltipProvider>
    </AuthProvider>
  );
}
