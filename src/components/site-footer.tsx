import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SiteFooter() {
  const linkClass =
    "inline-flex items-center justify-center h-8 w-8 rounded-md border border-border/60 bg-background/40 text-foreground transition-colors hover:text-primary hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <footer className="border-t border-border/50 mt-16 py-8" aria-labelledby="site-footer-heading">
      <h2 id="site-footer-heading" className="sr-only">
        Pie de página
      </h2>
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-display text-base tracking-wider">
          PRODE MUNDIAL <span className="text-primary">2026</span>
        </p>
        <div className="flex items-center gap-3">
          <span className="text-foreground/90 font-medium">
            Desarrollado por <span className="text-primary font-semibold">Martín Muñoz</span>
          </span>
          <TooltipProvider delayDuration={200}>
            <nav aria-label="Enlaces del autor" className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://www.linkedin.com/in/mart%C3%ADnmu%C3%B1oz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir el perfil de LinkedIn de Martín Muñoz en una pestaña nueva"
                    className={linkClass}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                      role="img"
                      aria-label="LinkedIn"
                    >
                      <title>LinkedIn</title>
                      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                    </svg>
                    <span className="sr-only">LinkedIn de Martín Muñoz</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top">LinkedIn — Martín Muñoz</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/martinmunozhr"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir el perfil de GitHub de Martín Muñoz en una pestaña nueva"
                    className={linkClass}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                      role="img"
                      aria-label="GitHub"
                    >
                      <title>GitHub</title>
                      <path d="M12 .5C5.73.5.66 5.57.66 11.84c0 5.02 3.25 9.27 7.76 10.77.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.95-3.16.69-3.83-1.52-3.83-1.52-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.44-2.25 1.17-3.05-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.81 1.17 3.05 0 4.37-2.67 5.33-5.21 5.61.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.66.79.55 4.51-1.5 7.75-5.75 7.75-10.77C23.34 5.57 18.27.5 12 .5z" />
                    </svg>
                    <span className="sr-only">GitHub de Martín Muñoz</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top">GitHub — Ver el proyecto</TooltipContent>
              </Tooltip>
            </nav>
          </TooltipProvider>
        </div>
      </div>
    </footer>
  );
}
