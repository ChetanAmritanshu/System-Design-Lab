# System Design Lab

An interactive visual learning experience for High-Level System Design.

**Don’t memorize architectures. Learn why they exist.**

System Design Lab turns system-design concepts into small visual experiments: start with the simplest architecture, apply pressure, observe what fails, and introduce the component that solves that specific problem.

> Build simple. Break it. Understand why it broke. Then scale it.

## Live website

[chetanamritanshu.github.io/System-Design-Lab](https://chetanamritanshu.github.io/System-Design-Lab/)

Version 1 includes:

- an animated System Lab homepage
- the complete 30-topic learning map
- the interactive Client–Server Architecture lesson
- request/response, traffic, failure, and routing labs
- responsive and reduced-motion experiences

## Source material

The educational source notes remain in the separate [ChetanAmritanshu/High-Level-Design](https://github.com/ChetanAmritanshu/High-Level-Design) repository. This repository contains only the website presentation layer and typed web content derived from those notes.

The first lesson maps:

```text
High-Level-Design/01_Client_Server_Architecture.docx
  → src/content/client-server.ts
  → src/app/learn/client-server/page.tsx
```

The original DOCX and PDF files are not parsed at runtime and are not copied into this repository.

## Local development

Requirements: Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Before contributing, run:

```bash
npm run lint
npm run typecheck
npm run build
npm run build:pages
```

## Project structure

```text
src/
  app/                 App Router pages and global visual system
  components/
    diagrams/          Architecture visuals
    labs/              Interactive teaching simulations
    lesson/            Reusable lesson presentation patterns
    ui/                Shared interface primitives
  content/             Typed lesson content derived from source notes
  data/                Learning map and case-study metadata
```

## Adding a lesson

1. Keep the original source note in `High-Level-Design`.
2. Extract and verify its useful technical structure.
3. Add a typed module under `src/content/`.
4. Compose the lesson from existing visual and lab primitives, adding abstractions only when they are reusable.
5. Add a static App Router page under `src/app/learn/`.
6. Mark the corresponding entry in `src/data/topics.ts` as available.
7. Run the complete validation commands above.

## GitHub Pages deployment

The application uses Next.js static export. When `GITHUB_PAGES=true`, [next.config.ts](./next.config.ts) applies the `/System-Design-Lab` base path and asset prefix. The export is written to `out/` with `.nojekyll` included.

Pushes to `main` run [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml), which installs dependencies, validates the project, builds the Pages export, uploads `out/`, and deploys through the official GitHub Pages actions.

No backend, database, authentication, or server runtime is required.
