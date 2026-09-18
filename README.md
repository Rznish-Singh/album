# rznish — photo gallery

A chronological photo gallery: every frame is filed by the moment it was taken, carries its own
camera data, and sits on a map at the spot the shutter fired.

It is a Next.js port of [ChronoFrame](https://github.com/HoshinoSuzumi/chronoframe) (MIT, Nuxt/Vue)
— same ideas, rebuilt on the App Router and stripped of the parts this gallery does not need.

## What it does

- **Timeline** — the whole archive newest-first, laid out as a masonry grid with a profile
  card as its first cell (avatar, date range, photo count, a script-font tagline, and a
  toolbar for map / albums / filter / sort / theme).
- **Filter** — a tabbed popover (Tags, Cameras, Lenses, Cities, Ratings) with a search box
  and a density toggle, wired to the real album/lens/city/rating data.
- **Sort** — Date Taken, File Size, or Title, each ascending or descending.
- **Theme toggle** — light/dark, with a circular reveal via the View Transitions API where
  the browser supports it, falling back to an instant swap otherwise. The choice persists
  in `localStorage` and applies before paint, so there's no flash on reload.
- **Albums** — each shoot is an animated folder that fans its first three photos out on
  hover; click to open the album's own timeline, lens breakdown and ISO range.
- **Emoji reactions** — a picker with a particle-burst animation, on every photo tile and
  every album folder.
- **Viewer** — arrow keys move through the set, `i` toggles the data panel, `Esc` closes, `Home`/`End`
  jump to the ends. Click to zoom to 2.25× at the point you clicked. A filmstrip runs along the bottom
  and neighbouring frames are preloaded.
- **Camera data** — exposure, body, lens, metering, position, plus a tone curve read live off the
  delivered image on a canvas.
- **Map** — MapLibre GL with clustering. Pins open a thumbnail popup that jumps straight into the viewer.
  A mini map sits inside the data panel for the single frame you are looking at.
- **Gear** — the one body and two lenses, with how the focal lengths and ISOs actually fell.
- **Share links** — `?frame=<id>` deep-links a single frame and the URL tracks as you move.
- **JSON feed** — `GET /api/photos?album=&lens=&year=&minRating=` for the portfolio site to pull from.

There's no persistent top nav — the toolbar on the profile card and the footer links carry that
weight instead. Everything prerenders. There is no database, no upload pipeline and no auth — the
photo records live in `src/data/gallery.ts` and Cloudinary does the resizing through URL transforms.

## Run it

```bash
npm install
cp .env.example .env.local   # both values are optional
npm run dev                  # http://localhost:3000
```

`NEXT_PUBLIC_MAPTILER_KEY` is optional. Without it the map falls back to keyless OpenStreetMap raster
tiles, desaturated so the pins stay the brightest thing on screen. With it you get the dark vector
basemap.

## Adding photos

Append to `photos` in `src/data/gallery.ts`. `albumSlug` has to match an entry in `albums`; everything
else is what the camera wrote. `takenAt` is what orders the gallery, so keep it as the capture time
rather than the upload time.

## Deploying

**Vercel** — import the repo, set the two env vars, done. `vercel.json` pins the Mumbai region and
opens CORS on the JSON feed.

**Docker** — `docker compose up --build`, or build the image directly. Multi-stage, non-root,
`output: 'standalone'`, health check on the JSON feed.

**AWS** — `deploy/apprunner.yaml` for App Runner straight off the repo. For ECS/Fargate, push the
Dockerfile image to ECR and run it behind an ALB on port 3000.

**Azure** — `deploy/azure-container-app.bicep` for Container Apps. Build to ACR with
`az acr build -r <registry> -t rznish-gallery:latest .`, then deploy the template.

## Stack

Next.js 15 (App Router, React 19) · TypeScript · Tailwind CSS v4 · MapLibre GL · Cloudinary delivery.

## Credit

Gallery concept, EXIF panel layout and map treatment adapted from ChronoFrame by Timothy Yin, MIT
licensed. Photography © rznish / 404 Pixels.
