# AGENTS.md

Single-page marketing site for **AGMS Ltd.**, a marine brokerage (vessel listings + enquiry form). Vite + React 19 + TypeScript + Tailwind v4, deployed to Vercel. There is no backend besides one Edge Function, and no test/lint/formatter setup.

## Commands

```bash
npm ci          # install
npm run dev     # Vite dev server
npm run build   # -> dist/index.html, single self-contained file (~318 kB)
npx tsc --noEmit  # the ONLY typecheck; `npm run build` does not typecheck
```

- No `lint`, `format`, or `test` script exists — don't invent one. Verification = `npx tsc --noEmit` then `npm run build`.
- `tsconfig.json` `include` is only `["src", "vite.config.ts"]`, so **`api/` is never typechecked**. Check it explicitly:
  `npx tsc --noEmit --target es2022 --lib es2022,dom --module esnext --moduleResolution bundler api/enquiry.ts`
- `npm audit` reports 3 high advisories, all one dev-only chain: `braces` → `micromatch` → `vite-plugin-singlefile`. They never reach `dist/`; `npm audit fix --force` will churn pinned versions — leave it alone unless asked.

## Dependency traps (both have bitten this repo)

- **`vite-plugin-singlefile` must stay on 2.x.** Releases before 2.0 register `transformIndexHtml` in the Vite-2 shape `{ enforce, transform }`. Vite 7 reads `{ order, handler }` instead, so it queues an `undefined` hook and every request dies in `applyHtmlTransforms` with `Cannot read properties of undefined (reading 'call')`. This breaks **`npm run dev` *and* `npm run build`**, and `npm install` refuses it outright with `ERESOLVE` (its peer is `vite ^2.9.5`). The stack trace points at Vite internals, so it reads like a Vite bug rather than a dependency bug.
- **`npm ci` trusts `package-lock.json` over `package.json`.** These two disagreed here (lock said `^0.9.0`, manifest said `2.3.0`) and `npm ci` installed the lockfile's versions *without failing*, producing a broken tree. After any dependency change, confirm what actually landed:
  `node -p "require('vite-plugin-singlefile/package.json').version"`

## Layout

- `index.html` → `src/main.tsx` → `src/App.tsx` holds **all** routes (`BrowserRouter`, `path="*"` → Home). Pages are in `src/pages`, chrome in `src/components`.
- `src/components/Layout.tsx` is the shell: top bar, header, desktop nav, mobile drawer, mobile bottom tab bar, footer, `<ChatBot/>`. It renders `<Outlet/>`.
- **Adding a page means touching `Layout.tsx` too** — the `nav` array (line 23) feeds both the desktop nav and the drawer, and the footer/dropdown links are hardcoded separately.
- `src/components/ChatBot.tsx` is a rule-based widget with no API: `KB` (line 15) is keyword→answer pairs matched by substring-length scoring in `reply()` (line 100). Adding a topic = adding a `KB` entry. It is opened externally via `window.dispatchEvent(new CustomEvent("agms:open-chat"))`.
- `src/utils/cn.ts` exists but is **unused** — components write literal `className` strings. Don't start using it in one place.

## Vessel data (`src/data/vessels.ts`)

Everything is generated at module load; there is no CMS or fetch.

- `rows` is keyed by category, each value a **positional tuple**: `[title, location, price, year, loa, beam, draft, power, class, sector]` (destructured at line 238). Inserting a column breaks every row silently — append at the end of a tuple instead.
- IDs are sequential: `v-${1000 + index}` / `WBS ${1000 + index}`. **Inserting a row mid-table renumbers every later vessel, invalidating existing `/vessels/:id` links.** Only append.
- `"—"` is the sentinel for a missing dimension; `description` falls back to `power` when `loa === "—"`.
- A new category must be added in three places: the `rows` key, the `blurbs` map (feeds `summary`), and `CATEGORY_LIST` (the search dropdown). `sectors`/`locations` derive from `vessels` automatically.
- Images are remote Pexels URLs in `img[]`, cycled by `index % img.length`. There is no `public/` dir and no local assets — keep it that way; the single-file build inlines everything, so large local binaries bloat `dist/index.html`.

## Styling conventions

- Tailwind v4 with **no config file** — `src/index.css` is just `@import "tailwindcss";`. There are no theme tokens.
- Brand colours are hardcoded arbitrary values throughout: navy `#092E6D`, blue `#3A64C2`, yellow `#FFCC00`, panel grey `#E5E5E5`. Match these literals rather than introducing a palette.
- Imports are **relative** (`../data/vessels`) even though a `@/*` alias exists in both `vite.config.ts` and `tsconfig.json`. Follow the existing relative style.
- Responsive split is `lg`: desktop nav and the chat launcher are `lg:flex`/`hidden lg:flex`, everything mobile-only lives in the drawer + fixed bottom bar (with `pb-[env(safe-area-inset-bottom)]`). New chrome usually needs both variants.
- Route scroll reset is handled by `src/components/ScrollToTop.tsx` — don't add manual `scrollTo`.

## Duplicated content — grep before claiming a copy edit is done

- Broker name, email, WhatsApp, mobile and address are copy-pasted across `Layout.tsx` (top bar + footer), `Contact.tsx`, `Static.tsx` and the `ChatBot.tsx` `KB` answers. One change = four edits.
- The tagline "Buy, sell & charter commercial workboats worldwide" exists in `index.html` (`<title>` + meta description), the `Layout.tsx` logo block, and `ChatBot.tsx`'s greeting.

## API & deploy

- The contact ("Get a Quote") form POSTs JSON to **Formspree** at `https://formspree.io/f/xppqlnor` (endpoint constant in `src/pages/Contact.tsx`). Formspree forwards it to the inbox; the `next`/`id` fields in its JSON response drive the success state.
- `api/enquiry.ts` is a Vercel Edge Function (`export const config = { runtime: "edge" }`). It validates `name`/`email`/`message` and returns a **fabricated** reference — the email-forwarding integration is an explicit TODO at line 20. It never sends mail. It is now orphaned (no frontend posts to `/api/enquiry`) but must stay deployable.
- `vercel.json` rewrites everything except `/api/*` to `/index.html` for SPA deep links. Keep that exclusion if you touch it.
