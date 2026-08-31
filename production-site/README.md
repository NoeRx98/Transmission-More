# Transmissions & More

Landing page for the Transmissions & More lead funnel. Plain static site — no build step.

## Deploy to Netlify

1. Push these files to this repository.
2. netlify.com -> Add new site -> Import an existing project -> pick this repo.
3. Leave build command empty. Publish directory: `.`
4. Deploy. You get a permanent URL like `transmissions-more.netlify.app`.

Every future push to this repo redeploys automatically. Nothing else to maintain.

## Embedding in GHL

Add a Code element to a blank GHL funnel step:

```html
<iframe src="https://YOUR-SITE.netlify.app" style="width:100%;height:100vh;border:0" title="Transmissions & More"></iframe>
```

## Where the leads go

`config.js` holds the GHL webhook URL — the only line to change to point leads at a different workflow. **Not wired yet** — paste the webhook URL into config.js before going live.

## Files

- `index.html` — the page
- `support.js` — rendering runtime, do not edit
- `config.js` — webhook URL
- `netlify.toml` — host config, allows the page to load inside GHL's iframe

## Known follow-ups

- Images load from an external bucket. Download them into an `images/` folder here and update the paths so the page never depends on storage you do not control.
- Vehicle dropdowns call fueleconomy.gov with a 6-second timeout and fall back to a built-in list. Do not remove that timeout.

## Two color variants

- `index.html` — dark, blue accent
- `light.html` — light cream, amber-red accent

Both are live once deployed. Pick a winner, then delete the loser and rename.
