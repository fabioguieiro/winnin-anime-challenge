# BUSCANIME — Winnin frontend challenge

Anime catalog built for the [Winnin frontend challenge](https://github.com/winnin/desafio/blob/master/FRONTEND.md), using live AniList data and the supplied [Figma reference](https://www.figma.com/design/PPvIPPITdlgZo9CeGDVezk/INSTITUCIONAL----DesafioWinnin?node-id=3396-64). Includes text search, format filters, genre tags, average-score badges, load-more pagination, and an additional anime details page.

**Live demo:** [winnin-anime-challenge.vercel.app](https://winnin-anime-challenge.vercel.app)

## Run locally

Use Node.js 22 LTS and npm. Development was verified with Node.js 22.23.4.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No API keys or environment variables are required. The Next.js server needs outbound access to `graphql.anilist.co` and `s4.anilist.co`. The browser also needs AniList GraphQL access for later pages, retries, and details. An upstream outage or rate limit can affect results.

For the production build:

```sh
npm run build
npm start
```

To keep an existing development server running on port 3000, use `npm start -- --port 3100` and open [localhost:3100](http://localhost:3100).

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

`npm run test:watch` runs Jest interactively; `npm run format` formats the project. Tests use mocked requests and do not depend on AniList availability. The latest interaction review passed 97 tests across 20 suites, type checking, lint, formatting, and the production build.

Jest covers score boundaries, nullable API fields, transport/GraphQL errors, URL filters, pagination, retry/focus behavior, details/provider links, server-rendered HTML, hydration, cancellation, and cache reuse. Live browser review is separate; there is no automated end-to-end suite, as agreed for this project.

## Review the application

1. Open `/` and use “Ver mais” to append another page.
2. Search for “Naruto” with Enter or “Search”, then select “Movie”. The URL retains both filters. A direct visit to `/?search=Naruto&format=MOVIE` also works; results can change with AniList data.
3. Open a card and use “Voltar para os animes”. Filters and previously loaded browser pages are retained while cached. Reloading starts at page one.
4. Try a search with no matches and use “Limpar filtros”. Network/rate-limit failures offer an explicit retry; pagination failures keep earlier cards.
5. Use Tab and the skip link, and inspect phone/tablet/desktop layouts. Titles can grow rather than overlap scores or truncate essential content.

## Requirements and scope

| Requirement                    | Implementation                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| React and TypeScript           | Next.js App Router with strict TypeScript                                                                    |
| AniList data                   | Typed GraphQL queries through native fetch                                                                   |
| Text search and format filters | Submitted search and immediate format selection, retained in the URL                                         |
| `averageScore` colors          | Below 50 red; 50–80 inclusive yellow; above 80 green; missing scores show a dash                             |
| Figma catalog                  | Measured desktop layout, purple/amber theme, covers, titles, genres, and score badges; responsive extensions |
| Execution/tests and decisions  | This README and [DECISIONS.md](./DECISIONS.md)                                                               |
| AI transparency and history    | [AI_LOG.md](./AI_LOG.md), [AGENTS.md](./AGENTS.md), and incremental commits                                  |

The written score rule takes precedence over the reference's green 80% example. Exact font metadata and source color tokens could not be verified in the read-only Figma session; Poppins and the palette are visual approximations. The project does not claim pixel-perfect or formal accessibility conformance.

The details route is additional scope: cover/banner, synopsis, alternate titles, score, genres, studios, dates, episode count/duration, and viewing-provider links when supplied. Provider links do not guarantee regional access; there is no embedded episode player. Details use the existing theme because no details-screen design was supplied.

## Stack and organization

Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, GraphQL through native fetch, Jest, and React Testing Library. Motivations and alternatives are in [DECISIONS.md](./DECISIONS.md).

- `src/app/`: thin routes, root layout, providers, fonts, and global styles.
- `src/features/anime/api/`: typed queries, response mapping, and shared query options.
- `src/features/anime/server/`: request-scoped first-page prefetch.
- `src/features/anime/hooks/`: browser query subscriptions.
- `src/features/anime/components/`: catalog, hydration, loading, filter, score, and provider UI.
- `src/features/anime/model/`: domain types, score/filter rules, safe text/URLs, and navigation helpers.
- `src/features/anime/AnimeCatalog.tsx` and `AnimeDetails.tsx`: feature views.
- `src/shared/`: reusable GraphQL transport, QueryClient factory, and site shell.

## Rendering and performance

The home route fetches page one for the current filters on the server and renders real cards/covers into HTML. React Query hydrates those results without a duplicate browser request. A request-scoped client prevents cross-request state sharing; an eight-second timeout bounds the upstream wait. Failed requests become safe error snapshots and require explicit retry.

Existing browser data takes precedence over a new page-one snapshot so a return from details does not erase appended pages. Data stays fresh for five minutes; inactive browser queries are retained for fifteen minutes. Stale remounts can refresh every loaded page in order. Server navigations can still request page one even if the browser has that filter cached; no shared server data cache is implemented.

Fonts are self-hosted full-glyph WOFF2 files with the Poppins OFL license in `src/app/fonts/OFL.txt`. Covers use Next image optimization, responsive sizes, and fallbacks; the first catalog cover and details banner load eagerly with high priority, while other images remain lazy.

Test Lighthouse against the production server with a clean browser profile. Local Lighthouse 13.6.0 mobile runs scored 89–90 (final run: 89), compared with an earlier client-rendered baseline of 84. LCP decreased from 4.3s to 3.6–3.7s; the final run had 30ms blocking time and zero layout shift. These were lab runs with the local image-optimizer cache retained and live upstream data, not guaranteed deployed scores or field Web Vitals. Detailed verification history is in [AI_LOG.md](./AI_LOG.md).

## Known limitations and remaining work

Details remain client-fetched with generic metadata. Malformed IDs receive HTTP 404; valid-but-missing AniList IDs show an unavailable state after fetching. Titles/genres/synopses retain source-language content. Full screen-reader and physical-device testing, verified Figma font/color tokens, shared server caching, and further mobile LCP work remain open.

At the 2026-11-03 submission review, `npm audit --omit=dev` reported zero advisories. The full audit reported 35 development-tool findings (32 moderate, 3 low), including transitive Jest/ESLint chains. Suggested forced major downgrades were not applied. See the dependency tradeoff in [DECISIONS.md](./DECISIONS.md).

### Deployment with Vercel

Deployment uses Vercel's Next.js preset, preserving server rendering and image optimization. Node is pinned to 22.x in package metadata and `.nvmrc` selects Node 22 locally. `vercel.json` declares `npm ci` / `npm run build`; `.vercelignore` excludes local output, dependencies, environment files, and checkout/account metadata. No API secret is required.

Authenticate and deploy from this repository (choose the existing challenge project when linking):

```sh
npx vercel@65.10.0 login
npx vercel@65.10.0 deploy
```

Choose the intended account/project when prompted. The checkout link lives in ignored `.vercel/` metadata; credentials/account state are not committed. A Git remote is not required for CLI deployment, but repository publication remains a separate challenge deliverable.

After verifying the preview, publish production:

```sh
npx vercel@65.10.0 deploy --prod
```

Verify default/filtered catalogs, images, load-more, details, return navigation, and malformed-ID 404. Confirm the production URL is accessible to the hiring reviewer without an account. Measure Lighthouse on the deployment; local results do not establish hosting performance. No static export or custom output-directory override is used.

Published on 2026-11-03 at [winnin-anime-challenge.vercel.app](https://winnin-anime-challenge.vercel.app). Anonymous access to the production alias was verified. Vercel published the first deployment directly to production; later `deploy` commands create previews unless `--prod` is used.

Deployed smoke checks passed for default/filtered server HTML, optimized covers, 12→24 pagination, details/provider links, cached return navigation, search/format controls, phone reflow, and malformed-ID HTTP 404. The browser warning/error log was empty. One clean mobile Lighthouse 13.6.0 production audit scored 96: 2.7s LCP, 30ms TBT, and zero CLS. It confirmed initial-document cover discovery and no browser GraphQL request during first load. This is one hosted lab run with live API/cache conditions; scores can vary.

## AI involvement

Codex assisted with planning, implementation, tests, visual inspection, corrections, and documentation. The candidate selected the stack, Jest preference, testing scope, details feature, atomic-commit workflow, and server-rendering follow-up. [AI_LOG.md](./AI_LOG.md) records generated work, checks, and corrections; it does not claim that candidate review has already happened. The candidate remains responsible for reviewing and explaining the delivered code.

## Episode browsing and trailers

Details follow banner/title/cover → synopsis → episodes → trailer → supporting information. Long synopses show three lines with an accessible expand/collapse control; the complete text stays available. Compact hero spacing leaves most of the first thumbnails visible at the checked 1366×768 desktop viewport, with title-length/device variation.

Episodes appear in one horizontal rail with swipe/trackpad scrolling, keyboard access, and boundary-aware previous/next buttons. All supplied links remain available; thumbnails load lazily. Episode cards open the provider in a labeled new tab. Missing images retain a usable link with a preview fallback. Counts/numbers reflect source data; no seasons, watch progress, or missing episodes are invented.

YouTube trailers use a click-to-load inline privacy-enhanced player. No iframe is present before user activation; closing removes it and restores focus. A prominent external provider button is always available because YouTube can restrict embedding or request sign-in. Help text explains that signing in through a separate window may not unlock the embed; the direct link opens the actual trailer. The player requests English controls with `hl=en`. The automated browser loaded the player but encountered YouTube's sign-in/bot check, so unrestricted video playback was not verified. Dailymotion remains an external-link fallback; its current player integration requires provider configuration beyond the supplied AniList metadata.

Episode/trailer data loads through a separate cancellable query after title metadata resolves. AniList returns the entire streamingEpisodes array without pagination. All links are rendered in the horizontal rail, so very large source lists can increase DOM work even though images remain lazy. Thumbnails use validated HTTPS URLs directly with no referrer; the catalog's narrow image-proxy allowlist is unchanged. The YouTube iframe uses strict-origin-when-cross-origin to provide the referring origin required by YouTube.

## Card focus and remote navigation

Added subtle 3.5% catalog-card enlargement on mouse hover and keyboard focus, with a visible focus ring, stacking/shadow, and no layout shift. Reduced-motion users keep the ring without scaling or animation. Shared navigation handles standard Arrow keys across application controls using current screen geometry, including responsive card rows and horizontal episode links. Left/Right stay within the current row; Up/Down prefer the same column. Focused controls scroll into view, disabled/hidden controls are skipped, and boundaries retain focus. Initial arrow input enters the main controls without stealing focus on page load. Enter uses native links/buttons; Tab and search caret editing remain available. Pagination now focuses the new card’s actionable link, so Enter opens it immediately.

Starting a trailer focuses Close rather than moving into YouTube’s cross-origin iframe, keeping the app’s arrow navigation available. The embedded player remains reachable by Tab; keys inside it are controlled by YouTube. This supports browser remotes emitting standard Arrow/Enter events, not a packaged TV-platform application. Physical TV hardware, platform-specific back keys, and on-screen keyboard integration still require device testing.
