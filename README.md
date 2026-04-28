# Nev Research

Angular single-page site for Nev Research, a SaaS delivery service focused on frontend development, backend systems, data analysis, QA automation, reporting workflows, and maintenance.

## Local Development

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Production Build

```bash
npm run build
```

The production output is generated at:

```text
dist/portfolio/browser
```

## Vercel

Use these settings if Vercel does not auto-detect them:

- Framework preset: `Angular`
- Build command: `npm run build`
- Output directory: `dist/portfolio/browser`
- Install command: `npm install`

`vercel.json` includes an SPA rewrite so direct refreshes and deep links route back to `index.html`.
