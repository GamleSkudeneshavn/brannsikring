# Agent instructions

## What this is

A static website about fire safety in Gamle Skudeneshavn (Karmøy kommune),
based on the printed information booklet «Brannsikring Gamle Skudeneshavn».
It targets Cloudflare Pages. See [README.md](README.md) for full background and
deployment options.

**Version 1 (current):** plain static site, no CMS, no build step.
**Version 2 (planned):** content editable via Sanity, rendered with Astro.

## Project layout

Everything served lives in `public/` and runs directly from there — no
bundler, no dependencies, no build:

```
public/
  index.html      – the whole page (Norwegian bokmål, semantic HTML)
  styles.css      – mobile-first, WCAG-focused stylesheet
  app.js          – menu, checklist, inspection log, and the fire-hose map
  _headers        – security headers for Cloudflare Pages
  vendor/leaflet/ – Leaflet 1.9.4, vendored locally (no CDN, no build step)
```

## Fire-hose cabinet map (brannslangeskap)

The «Brannslangeskap» section renders an OpenStreetMap map via Leaflet,
digitised from the map on page 9 of the original booklet. Cabinet positions
live in the `BRANNSLANGESKAP` array at the top of [public/app.js](public/app.js)
as `{ navn, lat, lng }` — **the positions are approximate** and should be
corrected against real GPS coordinates. Clicking the map logs the clicked
coordinates to the browser console to make that easy. The section also renders
a plain text list of all cabinets, which is the accessible/no-JS/print
fallback — keep both in sync (both are driven by the same array).

## Conventions

- **Language:** all user-facing content is Norwegian bokmål. Keep it that way.
  Code, comments and commit messages may be English.
- **No build step:** do not introduce a bundler, framework, or `node_modules`
  dependency for version 1. Author plain HTML/CSS/JS that runs as-is from
  `public/`. (Astro/Sanity belong to the planned version 2 — see README.)
- **Accessibility is a hard requirement.** This site must stay WCAG AA or
  better. Preserve semantic landmarks, heading hierarchy, the skip link,
  `aria-*` attributes, visible `:focus-visible` styles, keyboard navigation,
  `prefers-reduced-motion` support, and rem-based sizing. SVG diagrams use
  `role="img"` with `<title>`/`<desc>`; decorative graphics use `aria-hidden`.
  Never convey information with colour alone.
- **Content accuracy:** the source booklet is from the 1990s. Facts are kept
  but the site points readers to current regulations (DSB, Karmøy kommune).
  Don't present dated rules as current without that caveat.

## Local development

No tooling needed. Open `public/index.html` in a browser, or serve the folder:

```bash
npx serve public      # or: python3 -m http.server -d public
```

## Before you finish

- Test accessibility with axe DevTools or Lighthouse, ideally a real screen
  reader (VoiceOver/NVDA), when touching markup or styles.
- Verify the page still works with JavaScript disabled (content must remain
  readable; `app.js` only enhances).

## Deployment

Cloudflare Pages with **build output directory `public`** and an empty build
command. See [README.md](README.md) for drag-and-drop, Git-integration, and
Wrangler instructions.
