// Post-build sitemap generator.
//
// Runs after `vite build` (see package.json). Vite copies public/sitemap.xml
// into dist/ as a valid core-routes fallback, then this script overwrites
// dist/sitemap.xml with the core routes PLUS a URL for every published vessel
// fetched from Firestore via the public REST API.
//
// If configuration is missing or the network call fails, it silently falls
// back to the core routes so a build never breaks because of this step.

import { writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");

// The Vite build does not export .env.local into process.env for this Node
// step, so read it (and .env) here as a fallback. Real environment variables
// (e.g. on Vercel) always win.
function loadEnvFile(file) {
  const path = resolve(root, file);
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const SITE_URL = (process.env.VITE_SITE_URL || "https://www.agms.com.ng").replace(/\/+$/, "");
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
const API_KEY = process.env.VITE_FIREBASE_API_KEY;

const CORE_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/vessels", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/legal", changefreq: "yearly", priority: "0.3" },
];

function urlEntry(path, changefreq, priority, lastmod) {
  const parts = [
    `  <url>`,
    `    <loc>${SITE_URL}${path}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    `  </url>`,
  ].filter(Boolean);
  return parts.join("\n");
}

function buildXml(vesselPaths) {
  const today = new Date().toISOString().slice(0, 10);
  const core = CORE_ROUTES.map((r) => urlEntry(r.path, r.changefreq, r.priority, r.path === "/" ? today : undefined));
  const vessels = vesselPaths.map((p) => urlEntry(p, "weekly", "0.7"));
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<!-- Generated at build time by scripts/generate-sitemap.mjs -->`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...core,
    ...vessels,
    `</urlset>`,
    ``,
  ].join("\n");
}

async function fetchPublishedVesselIds() {
  if (!PROJECT_ID || !API_KEY) return [];
  const endpoint =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "vessels" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "published" },
          op: "EQUAL",
          value: { booleanValue: true },
        },
      },
      select: { fields: [{ fieldPath: "published" }] },
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[sitemap] Firestore query returned ${res.status}; using core routes only.`);
      return [];
    }
    const rows = await res.json();
    const ids = [];
    for (const row of Array.isArray(rows) ? rows : []) {
      const name = row?.document?.name;
      if (typeof name === "string") ids.push(name.split("/").pop());
    }
    return ids.filter(Boolean);
  } catch (err) {
    console.warn(`[sitemap] Vessel fetch failed (${err?.message || err}); using core routes only.`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  if (!existsSync(distDir)) {
    console.warn("[sitemap] dist/ not found — run after `vite build`. Skipping.");
    return;
  }
  const ids = await fetchPublishedVesselIds();
  const vesselPaths = ids.map((id) => `/vessels/${id}`);
  const xml = buildXml(vesselPaths);
  await writeFile(resolve(distDir, "sitemap.xml"), xml, "utf8");
  console.log(`[sitemap] Wrote dist/sitemap.xml with ${CORE_ROUTES.length} core + ${vesselPaths.length} vessel URLs.`);
}

main();
