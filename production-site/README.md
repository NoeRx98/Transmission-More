# Transmissions & More

Landing page for the Transmissions & More lead funnel. Plain static site — no build step.

## Deploy to Netlify

1. Push these files to this repository.
2. netlify.com -> Add new site -> Import an existing project -> pick this repo.
3. **Base directory: `production-site`** (this repo also holds an unrelated `animation-prototype/` folder at the root — Netlify needs to be pointed at this subfolder). Build command: empty. Publish directory: `.`
4. Deploy. You get a permanent URL like `transmissions-more.netlify.app`.

Every future push to this repo redeploys automatically. Nothing else to maintain.

## Embedding in GHL

Add a Code element to a blank GHL funnel step:

```html
<iframe src="https://YOUR-SITE.netlify.app" style="width:100%;height:100vh;border:0" title="Transmissions & More"></iframe>
```

## Where the leads go

The form posts to `/api/lead`, handled by `netlify/edge-functions/lead.mjs`. That function validates + rate-limits the submission, then relays it to a GoHighLevel inbound webhook URL kept server-side. **Set this in Netlify** — Site configuration > Environment variables:

- `GHL_WEBHOOK_URL` (required) — this client's GHL inbound webhook
- `ALERT_WEBHOOK_URL` (optional) — your own GHL workflow, notified if delivery to GHL fails after retries
- `CLIENT_NAME` (optional) — shows up in the alert payload

Nothing GHL-related lives in the browser bundle or in git — the webhook URL only exists as a Netlify env var.

### Lead payload sent to GHL

`index.html`'s `submit()` handler posts this shape to `/api/lead`, which forwards it as-is (plus `client_ip` and `relayed_at`) to the GHL webhook. **These field names are the contract your GHL workflow's custom-field mapping depends on — do not rename them** without updating the mapping on the GHL side too:

```
funnel, full_name, first_name, last_name, email, phone,
vehicle, vehicle_year, vehicle_make, vehicle_model, vehicle_engine,
symptoms, preferred_contact, best_time, submitted_at, source_url
```

## Files

- `index.html` — the page (dark theme, blue accent) — the only live variant
- `support.js` — rendering runtime, do not edit
- `netlify.toml` — host config, allows the page to load inside GHL's iframe
- `netlify/edge-functions/lead.mjs` — lead relay to GHL, do not remove the honeypot/rate-limit checks

## Known follow-ups

- Images load from an external Supabase storage bucket. Download them into an `images/` folder here and update the paths so the page never depends on storage you do not control.
- The hero background video (`HERO_VIDEO_URL` in `index.html`'s script) is hosted on Higgsfield's CDN, the AI tool used to generate it — same "storage you don't control" concern as the Supabase images above. Download the mp4 and self-host it (e.g. a `videos/` folder here) instead of hotlinking, then update `HERO_VIDEO_URL`.
- Vehicle dropdowns call fueleconomy.gov with a 6-second timeout and fall back to a built-in list. Do not remove that timeout.

## Hero background video

`index.html`'s hero section has a full-bleed, scroll-scrubbed background video: an AI-generated (Higgsfield) transmission dismantling as the visitor scrolls through the hero, driven by `initHeroVideo()` in the script section. It maps scroll position within the hero `<section>` to `video.currentTime` — scrolling back up naturally reverses the animation (no separate "reassembly" clip needed). The video is fetched and played from a `blob:` URL (same technique as `animation-prototype/Transmission Scroll Prototype - Video.dc.html`) to sidestep cross-origin `<video src>` restrictions; verify once deployed whether that's still necessary on Netlify.

## History

- `light.html` (a light/cream color variant) and `config.js` (an unused legacy webhook-URL file, superseded by the `GHL_WEBHOOK_URL` env var) have been removed — `index.html` was the maintained, currently-deployed variant and is now the only one.
- Added the scroll-scrubbed hero background video described above.
