export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 mt-16 py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-display text-base tracking-wider">
          PRODE MUNDIAL <span className="text-primary">2026</span>
        </p>
        <p className="flex items-center gap-2">
          <span>Desarrollado por Martín Muñoz</span>
          <a
            href="https://www.linkedin.com/in/mart%C3%ADnmu%C3%B1oz/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn de Martín Muñoz"
            className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-border/60 bg-background/40 text-foreground hover:text-primary hover:border-primary/60 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
            </svg>
          </a>
        </p>
      </div>
    </footer>
  );
}
