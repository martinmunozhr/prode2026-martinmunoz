#!/usr/bin/env node
/**
 * Smoke tests para Prode Mundial 2026.
 *
 * Recorre las rutas principales de la app, captura screenshots y registra
 * errores/warnings de consola y fallos de red. Genera un reporte JSON +
 * Markdown con los hallazgos.
 *
 * Uso:
 *   BASE_URL=http://localhost:3000 node scripts/smoke-tests.mjs
 *   BASE_URL=https://id-preview--xxx.lovable.app node scripts/smoke-tests.mjs
 *
 * Requiere: playwright (npx playwright install chromium si no está instalado).
 */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = process.env.OUT_DIR || "./smoke-report";
const VIEWPORT_DESKTOP = { width: 1280, height: 800 };
const VIEWPORT_MOBILE = { width: 390, height: 844 };

// Rutas críticas + nombre amigable. equipoId usa "ger" como dato de prueba.
const ROUTES = [
  { name: "home", path: "/" },
  { name: "equipos", path: "/equipos" },
  { name: "equipo-detalle", path: "/equipos/ger" },
  { name: "fixture", path: "/fixture" },
  { name: "ranking", path: "/ranking" },
  { name: "insights", path: "/insights" },
  { name: "bola-de-cristal", path: "/bola-de-cristal" },
  { name: "login", path: "/login" },
  { name: "registro", path: "/registro" },
  { name: "404", path: "/ruta-inexistente-xyz" },
];

// Patrones de log que ignoramos (ruido conocido del entorno de preview).
const IGNORED_PATTERNS = [
  /\[vite\]/i,
  /Download the React DevTools/i,
  /Lovable\.js/i,
  /RESET_BLANK_CHECK/i,
];

function shouldIgnore(text) {
  return IGNORED_PATTERNS.some((re) => re.test(text));
}

async function visitRoute(browser, route, viewport, label) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (shouldIgnore(text)) return;
    if (msg.type() === "error") consoleErrors.push(text);
    if (msg.type() === "warning") consoleWarnings.push(text);
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("requestfailed", (req) => {
    failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
  });

  const url = `${BASE_URL}${route.path}`;
  let status = "ok";
  let httpStatus = null;
  const start = Date.now();

  try {
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    httpStatus = response?.status() ?? null;
    // Pequeña espera para hidratación + animaciones.
    await page.waitForTimeout(800);
  } catch (err) {
    status = "navigation-failed";
    pageErrors.push(`navigation: ${err.message}`);
  }

  const elapsedMs = Date.now() - start;
  const screenshotPath = join(OUT_DIR, `${route.name}-${label}.png`);

  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch (err) {
    pageErrors.push(`screenshot: ${err.message}`);
  }

  await context.close();

  const hasErrors =
    consoleErrors.length > 0 || pageErrors.length > 0 || failedRequests.length > 0;
  if (hasErrors) status = status === "ok" ? "errors" : status;
  else if (consoleWarnings.length > 0 && status === "ok") status = "warnings";

  return {
    route: route.name,
    path: route.path,
    viewport: label,
    url,
    httpStatus,
    elapsedMs,
    status,
    consoleErrors,
    consoleWarnings,
    pageErrors,
    failedRequests,
    screenshot: screenshotPath,
  };
}

function renderMarkdown(results) {
  const lines = [];
  lines.push(`# Smoke report — ${new Date().toISOString()}`);
  lines.push(`Base URL: \`${BASE_URL}\``);
  lines.push("");

  const summary = results.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {},
  );
  lines.push("## Resumen");
  for (const [k, v] of Object.entries(summary)) lines.push(`- **${k}**: ${v}`);
  lines.push("");

  lines.push("## Detalle por ruta");
  lines.push("");
  lines.push("| Ruta | Viewport | Status | HTTP | Tiempo (ms) | Errores | Warnings | Red |");
  lines.push("|------|----------|--------|------|-------------|---------|----------|-----|");
  for (const r of results) {
    const icon =
      r.status === "ok" ? "✅" : r.status === "warnings" ? "⚠️" : "❌";
    lines.push(
      `| \`${r.path}\` | ${r.viewport} | ${icon} ${r.status} | ${r.httpStatus ?? "—"} | ${r.elapsedMs} | ${r.consoleErrors.length + r.pageErrors.length} | ${r.consoleWarnings.length} | ${r.failedRequests.length} |`,
    );
  }
  lines.push("");

  const withIssues = results.filter(
    (r) =>
      r.consoleErrors.length ||
      r.pageErrors.length ||
      r.consoleWarnings.length ||
      r.failedRequests.length,
  );
  if (withIssues.length === 0) {
    lines.push("🎉 Sin errores ni warnings en ninguna ruta.");
  } else {
    lines.push("## Hallazgos");
    for (const r of withIssues) {
      lines.push(`### \`${r.path}\` — ${r.viewport}`);
      if (r.consoleErrors.length) {
        lines.push("**Console errors:**");
        r.consoleErrors.forEach((e) => lines.push(`- ${e}`));
      }
      if (r.pageErrors.length) {
        lines.push("**Page errors:**");
        r.pageErrors.forEach((e) => lines.push(`- ${e}`));
      }
      if (r.consoleWarnings.length) {
        lines.push("**Warnings:**");
        r.consoleWarnings.forEach((e) => lines.push(`- ${e}`));
      }
      if (r.failedRequests.length) {
        lines.push("**Failed requests:**");
        r.failedRequests.forEach((req) =>
          lines.push(`- ${req.url} → ${req.failure}`),
        );
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`▶ Smoke tests sobre ${BASE_URL}`);
  console.log(`▶ Reporte en ${OUT_DIR}/`);

  const browser = await chromium.launch();
  const results = [];

  try {
    for (const route of ROUTES) {
      for (const [label, viewport] of [
        ["desktop", VIEWPORT_DESKTOP],
        ["mobile", VIEWPORT_MOBILE],
      ]) {
        process.stdout.write(`  · ${route.path} (${label}) ... `);
        const result = await visitRoute(browser, route, viewport, label);
        results.push(result);
        const icon =
          result.status === "ok"
            ? "✅"
            : result.status === "warnings"
              ? "⚠️"
              : "❌";
        console.log(`${icon} ${result.status} (${result.elapsedMs}ms)`);
      }
    }
  } finally {
    await browser.close();
  }

  await writeFile(
    join(OUT_DIR, "report.json"),
    JSON.stringify({ baseUrl: BASE_URL, generatedAt: new Date().toISOString(), results }, null, 2),
  );
  await writeFile(join(OUT_DIR, "report.md"), renderMarkdown(results));

  const failed = results.filter((r) => r.status !== "ok" && r.status !== "warnings");
  console.log(`\n✓ Reporte generado en ${OUT_DIR}/report.md`);
  if (failed.length) {
    console.error(`✗ ${failed.length} ruta(s) con errores`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
