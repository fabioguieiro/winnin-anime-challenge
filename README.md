# Winnin Anime Challenge

Project foundation for the [Winnin frontend challenge](https://github.com/winnin/desafio/blob/master/FRONTEND.md). First working version: live AniList catalog with format filters, submitted text search, genre tags, score badges, and load-more pagination.

## Stack

Next.js App Router, React, strict TypeScript, Tailwind CSS, TanStack Query, GraphQL via native fetch, Jest, and React Testing Library. No end-to-end framework.

## Run

Use Node.js 22 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No API keys or environment variables are required. The browser requests the public AniList GraphQL API directly; network access to graphql.anilist.co and s4.anilist.co is required.

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
- `src/features/anime/`: catalog UI, typed GraphQL query, pagination hook, and score rules.

See [DECISIONS.md](./DECISIONS.md) for rationale and deferred work and [AI_LOG.md](./AI_LOG.md) for AI involvement. Jest verifies transport errors, response mapping, score boundaries, search/filter changes, pagination, empty results, and retry behavior using mocked requests. Browser checks against live AniList are separate from this deterministic suite.

## First-version behavior

- Twelve results per page, ordered by popularity; “Ver mais” appends the next page.
- Search applies through “Buscar” or Enter. Format changes apply immediately. Both are retained in the URL.
- Cards display AniList romaji titles with English/native fallbacks, cover images, all available genres, and average scores. Missing scores are shown as unavailable.
- Score colors follow the written requirement: below 50 red, 50–80 inclusive yellow, above 80 green.
- Initial failures offer retry; failed pagination preserves already loaded cards. HTTP 429 gets a specific wait-and-retry message.
- The desktop Figma composition is the visual reference. Smaller layouts use two columns on tablets and one on phones. Step 3 aligns measured desktop dimensions and refines card styling. Poppins is self-hosted as a visual font match; exact font metadata and source color tokens remain unverified in the anonymous Figma session.
- Adult titles are excluded from this general-audience catalog.

## Accessibility and responsive review

Step 4 adds persistent polite result announcements, focus-preserving search/history updates, a working keyboard skip link, focus guidance for pagination/retry/reset, stronger search/focus contrast, and larger small-screen/coarse-pointer controls. Cards can grow to display full titles and keep genre tags clear of scores. Responsive browser checks cover narrow phone through desktop widths. This is a targeted review, not a full screen-reader/device audit or a WCAG conformance certification.
