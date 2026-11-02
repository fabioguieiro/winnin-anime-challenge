# Winnin Anime Challenge

Project foundation for the [Winnin frontend challenge](https://github.com/winnin/desafio/blob/master/FRONTEND.md). The catalog and Figma implementation are not built yet.

## Stack

Next.js App Router, React, strict TypeScript, Tailwind CSS, TanStack Query, GraphQL via native fetch, Jest, and React Testing Library. No end-to-end framework.

## Run

Use Node.js 22 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No API keys or environment variables are required for the planned public AniList integration.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

`npm run test:watch` runs Jest interactively. `npm run format` formats the project. After building, `npm start` serves the production app.

## Organization

- `src/app/`: routes, layout, global styles, and providers.
- `src/shared/api/`: AniList GraphQL transport and its tests.
- `src/features/anime/`: reserved for catalog components, queries, and business rules when implementation starts.

See [DECISIONS.md](./DECISIONS.md) for rationale and deferred work and [AI_LOG.md](./AI_LOG.md) for AI involvement. The test suite currently verifies transport behavior using mocked requests; it does not verify the live AniList service.
