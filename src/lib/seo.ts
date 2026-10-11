import { useEffect } from "react";

/** Canonical public origin (no trailing slash). */
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string) || "https://www.agms.com.ng").replace(/\/+$/, "");

export const SITE_NAME = "AGMS Ltd.";
export const DEFAULT_OG_IMAGE = "https://i.ibb.co/chJBhF8s/AGMS.jpg";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Per-route document head management for the SPA: title, description, robots,
 * canonical and Open Graph/Twitter tags. Call once at the top of a page
 * component. Optionally injects a route-scoped JSON-LD block (e.g. FAQPage,
 * item lists) that is removed on unmount.
 */
export function useSeo(opts: {
  title: string;
  description: string;
  /** Route path beginning with "/", e.g. "/vessels" or `/vessels/${id}`. */
  path: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | null;
}) {
  const { title, description, path, image, type, noindex, jsonLd } = opts;

  useEffect(() => {
    const url = SITE_URL + path;
    const img = image || DEFAULT_OG_IMAGE;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", type || "website");
    upsertMeta("property", "og:image", img);
    upsertMeta("property", "og:image:alt", `${SITE_NAME} — marine brokerage, Port Harcourt, Nigeria`);

    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", img);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, path, image, type, noindex]);

  useEffect(() => {
    const id = "route-jsonld";
    document.getElementById(id)?.remove();
    if (!jsonLd) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [jsonLd]);
}
