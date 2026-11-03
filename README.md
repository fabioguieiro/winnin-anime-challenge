# Winnin Anime Challenge

Project foundation for the [Winnin frontend challenge](https://github.com/winnin/desafio/blob/master/FRONTEND.md). Live AniList catalog with format filters, submitted text search, genre tags, score badges, load-more pagination, and dedicated anime details pages.

## Stack

Next.js App Router, React, strict TypeScript, Tailwind CSS, TanStack Query, GraphQL via native fetch, Jest, and React Testing Library. No end-to-end framework.

## Run

Use Node.js 22 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No API keys or environment variables are required. The Next.js server fetches the first catalog page for the current URL, and the browser requests later pages, retries, and details directly from the public AniList GraphQL API. Both environments need network access to graphql.anilist.co; image optimization also needs s4.anilist.co.

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

- Twelve results per page, ordered by popularity; the first page is server-rendered and hydrates React Query without a duplicate browser request. “Ver mais” appends the next page.
- Search applies through “Buscar” or Enter. Format changes apply immediately. Both are retained in the URL.
- Cards display AniList romaji titles with English/native fallbacks, cover images, all available genres, and average scores. Missing scores are shown as unavailable.
- Score colors follow the written requirement: below 50 red, 50–80 inclusive yellow, above 80 green.
- Initial failures offer retry; failed pagination preserves already loaded cards. HTTP 429 gets a specific wait-and-retry message.
- The desktop Figma composition is the visual reference. Smaller layouts use two columns on tablets and one on phones. Step 3 aligns measured desktop dimensions and refines card styling. Poppins is self-hosted as a visual font match; exact font metadata and source color tokens remain unverified in the anonymous Figma session.
- Adult titles are excluded from this general-audience catalog.

## Accessibility and responsive review

Step 4 adds persistent polite result announcements, focus-preserving search/history updates, a working keyboard skip link, focus guidance for pagination/retry/reset, stronger search/focus contrast, and larger small-screen/coarse-pointer controls. Cards can grow to display full titles and keep genre tags clear of scores. Responsive browser checks cover narrow phone through desktop widths. This is a targeted review, not a full screen-reader/device audit or a WCAG conformance certification.

## Anime details

Open any catalog card to visit `/anime/[id]`. The details view includes cover/banner images, synopsis, score, genres, release information, studios, episode count, and viewing-provider links when AniList supplies them. Search and format travel with the detail URL and its return link; direct detail URLs work too. Descriptions remain in the source language. There is no embedded episode player. Trailers, characters, and related titles are deferred.

Malformed IDs use the route's not-found page. Valid but unavailable IDs receive an unavailable state after the client-side API request. Detail data is cached by ID; metadata is generic rather than generated from a separate server request.

## Catalog rendering and performance

The home route reads search/format on the server, fetches only page one with a request-scoped QueryClient, and includes real cards/covers in its HTML. Hydration reuses the same infinite-query key and timestamp. Existing browser pages take precedence over incoming page-one snapshots so returning from details preserves pagination. Server requests have an eight-second timeout; a failed request is serialized safely into the existing error/retry UI without automatically repeating it in the browser. A retry runs on user action.

The catalog is rendered at request time; this introduces a server dependency on AniList and does not add a shared server data cache. Client freshness remains five minutes with fifteen-minute inactive retention. A new server navigation can request page one even if the browser already holds that filter; hydration preserves its cached pages, and normal client stale-data refresh still applies.

Measure performance against `npm run build` followed by `npm start`, using a clean browser profile and consistent mobile/desktop settings. Development builds and extensions distort the result. Lighthouse is a lab measurement; live API latency and image-cache warmth can change scores.

Local production Lighthouse 13.6.0 mobile checks after server rendering scored 89–90 (final build: 89), versus the earlier client-rendered run's 84. LCP was 3.6–3.7s versus 4.3s; the final run had 30ms blocking time and zero layout shift. All server-rendered runs found the first cover in the initial HTML and made no browser GraphQL request. These are local lab observations with the image-optimizer cache retained, not a guaranteed deployed score.
