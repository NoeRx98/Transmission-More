# Handoff: Transmissions & More — Lead Funnel + AI Dismantle Animation

## Overview
Lead-generation landing page for Transmissions & More (DFW transmission/auto repair shop), plus an in-progress "scroll-scrub" hero animation of a transmission dismantling into its parts, meant to eventually sit inside this funnel.

This is **not a mockup** — everything in `production-site/` is the real, currently-deployed code (same stack as the shop's live Nexum and Auto Aesthetics funnels). `animation-prototype/` is an unmerged experiment being evaluated before it's dropped into the real page.

## Tech stack (what Claude Code needs to know)
- **No framework, no build step, no npm.** Everything is plain files served as-is.
- `index.html` (and `light.html`) are HTML documents that render through a small bundled runtime, `support.js`:
  - `support.js` is a generated, self-contained JS file (~1900 lines, comment says "GENERATED from dc-runtime — do not edit"). At page load it dynamically pulls **React 18 + ReactDOM + Babel from unpkg CDN**, then parses the page's `<x-dc>...</x-dc>` block as a template (`{{ }}` holes, `<sc-if>`/`<sc-for>` control-flow tags) and mounts an inline `<script data-dc-script>` logic class against it.
  - Practically: treat `index.html` as **HTML + inline CSS + one big client-side JS component** — there is nothing to compile, and it deploys to any static host as-is. Do not try to import it into a React/Vue build pipeline; it already IS the runtime.
  - Do not edit `support.js`. All real edits happen inside the `<x-dc>` template and the `<script data-dc-script>` class in `index.html`/`light.html`.
- **Hosting:** Netlify static site (`netlify.toml`: `publish = "."`, no build command).
- **Backend:** one Netlify Edge Function, `netlify/edge-functions/lead.mjs`, mapped to `/api/lead`. Plain JS (`.mjs`, Deno-based Netlify Edge runtime — no npm dependencies). It:
  - Validates + rate-limits submissions (honeypot field, email/phone/name checks, 5 req / 10 min / IP).
  - Relays the lead to a GoHighLevel (GHL) inbound webhook URL (kept server-side in the `GHL_WEBHOOK_URL` env var, never shipped to the browser).
  - Retries GHL twice on failure, and optionally posts a failure alert to `ALERT_WEBHOOK_URL`.
- **Env vars (set in Netlify, not in code):** `GHL_WEBHOOK_URL` (required), `ALERT_WEBHOOK_URL` (optional), `CLIENT_NAME` (optional).
- `config.js` is legacy/unused — the GHL webhook URL now lives only in the edge function's env var.
- The `Content-Security-Policy: frame-ancestors *` header in `netlify.toml` exists so the page can be iframed inside a GHL funnel step.

## Files
```
production-site/
  index.html                        — main funnel page (dark theme, blue accent) — THE live page
  light.html                        — alternate light-theme color variant, same content/logic
  support.js                        — bundled render runtime, DO NOT EDIT
  config.js                         — legacy/unused, safe to delete
  netlify.toml                      — host config (publish dir, CSP header)
  README.md                         — original deploy notes (Netlify setup, known follow-ups)
  netlify/edge-functions/lead.mjs   — serverless lead relay → GHL webhook

animation-prototype/
  Transmission Scroll Prototype - Video.dc.html   — CURRENT preferred direction: scroll position
    scrubs a pre-rendered, AI-generated (Higgsfield) photoreal video of a transmission dismantling
    part-by-part and reassembling. Video is fetched cross-origin and played from a blob: URL (this
    preview tool's CSP blocks direct cross-origin <video src>; a real deploy may not need that workaround
    — verify once live).
  Transmission Scroll Prototype - 3D.dc.html       — alternate direction: a live three.js model
    (primitive geometry, not photoreal) exploding into parts on scroll instead of a video.
  transmission-scroll.js                            — three.js scene/animation logic for the 3D version,
    loaded as an ES module via an import map (three.js from a pinned CDN URL — see the file's <head>).
```
Both prototype files are also DC-format (`support.js` + `<x-dc>`) — same runtime as the production site, just not yet wired into it.

## Current state / open decision
Two directions for the hero animation were prototyped and are still being compared:
1. **Video-scrub** (recommended so far) — photorealistic, but it's a fixed clip; scroll only scrubs its timeline.
2. **Live 3D** — fully interactive/scrubbable in any direction, but visually schematic, not photoreal.

The video clip currently used lives on Higgsfield's CDN (a CloudFront URL hardcoded in the prototype's JS) — it is **not yet downloaded into this project**. Before shipping, pull that mp4 down and reference it as a local/same-origin file instead of the remote URL.

## Not yet done
- The AI dismantle animation has not been merged into `production-site/index.html`. It currently only exists as a standalone prototype page. Merging it needs to happen without disturbing the existing hero copy, CTAs, vehicle-lookup dropdowns, or FAQ accordion already in `index.html`.
- `config.js` should be deleted once confirmed nothing references it.
- Per the production README's own "Known follow-ups": vehicle images currently load from an external bucket (should be moved into a local `images/` folder), and the FuelEconomy.gov API call in the vehicle dropdown has a 6-second timeout that must not be removed.
- Two color variants (`index.html`, `light.html`) both still exist — pick a winner and delete the other.

## Assets
- Fonts: Bebas Neue + DM Sans, loaded from Google Fonts (`<link>` tags in `index.html`'s `<head>`).
- The AI-generated transmission video/stills were produced via Higgsfield (image ref + Seedance 2.0 video model); URLs are in the prototype file's logic class.
