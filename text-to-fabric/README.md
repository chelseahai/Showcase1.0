# Text to Fabric (Showcase integration)

This is the **Text-to-Fabric** experience from Tiny_TextToInputData_Prototype, integrated into Showcase1.0.

- **Text input** → OpenAI turns your description into 5 garment parameters (Fit, Mesh, Thickness, Airflow, Support).
- **3D fabric visualization** → Parameters drive an interactive, animated fabric-like grid (Three.js).

## Run locally

```bash
cd text-to-fabric
npm install
npm run dev
```

Opens at `http://localhost:5500`.

## API key

- **With server (e.g. Vercel):** Set `OPENAI_API_KEY` in the environment; the app uses `/api/analyze`.
- **Static / GitHub Pages:** Set `NEXT_PUBLIC_OPENAI_API_KEY` (e.g. in Vercel env or `.env.local` for local).  
  ⚠️ This exposes the key in the client; only use for demos or GitHub Pages.

## Build static export

```bash
npm run build
```

Output is in `out/`. For GitHub Pages, serve the contents of `out/` at the path `/Showcase1.0/text-to-fabric/` (or adjust `basePath` in `next.config.js` to match your site root).

## Link from the main site

The Showcase landing page (`/index.html`) links to this app at `text-to-fabric/`. For production, either:

1. Deploy the Next app (e.g. Vercel) and point the card link to that URL, or  
2. Build with `npm run build` and deploy the `out/` folder so it is served at `.../text-to-fabric/` (see `next.config.js` `basePath`).
