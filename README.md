# cgroup portfolio

A one-page resume that runs "inside" a memory-limited cgroup v2. Not every section fits under `memory.max`, so some get reclaimed. Click one to refault it from disk, or raise the limit.

100% static: no backend, no API calls, no external fonts. Everything runs in the browser.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Edit your content

| File | What's in it |
|---|---|
| `content/resume.json` | The facts: roles, projects (with the real vector search benchmark numbers), writing, links. Every number on the page comes from here unless labelled "Illustrative". |
| `content/site.json` | Site settings and copy: section titles and lines, which projects back each section ("Real work"), experience highlights to show, the "Measured for real" note, and `agentsEnabled` (default `false`). |
| `content/agent-trace.json` | The replayed agent run. The current file is a placeholder (`"placeholder": true`). The build refuses to run if `agentsEnabled` is `true` while the trace is still a placeholder. |
| `public/og.png` | Link-preview image (1200×630). Source is `scripts/og.svg`. |

Links set to `null` in `resume.json` (GitHub, Resume PDF) are hidden automatically. Writing entries with a `null` url are skipped, and the `note` field is never shown.

Set `url` in `site.json` to your real domain so the Open Graph tags point at the right image.

## How the simulation works

- `memory.max` starts at 256M, with About and Vector search resident. Anon memory is a fixed 40M and is never reclaimed.
- Each section is about 96M of clean file cache, so `floor((256 − 40) / 96) = 2` sections fit.
- When a reclaimed section is clicked, it is read back from disk (about 700ms). If that pushes usage over the limit, the least recently used section is dropped. Scrolling a section into view or clicking it counts as using it.
- `workingset_refault_file` counts every refault. PSI `some avg10` only rises when a refault forces another section out (thrashing), and decays like the kernel's 10s average.
- Sections are dropped, never "swapped": they are clean file pages.

Code is split by feature: `src/sim` (the model), `src/components` (layout), `src/sections`, `src/demos`, `src/share` (URL state).

## Share links

`?max=256M&open=vector,kafka` restores the limit and which sections are resident. Unknown or disabled ids are ignored. Anything invalid falls back to the default starved state.

## Deploy (free)

- **GitHub Pages:** push to `main` on GitHub, then go to Settings → Pages → Source: "GitHub Actions". `.github/workflows/deploy.yml` builds and publishes.
- **Cloudflare Pages / Netlify / Vercel:** import the repo on their website. Build command `npm run build`, output folder `dist`.
