# Technical decisions

This document describes the current implementation and its tradeoffs. [AI_LOG.md](./AI_LOG.md) preserves the chronological work and verification history.

## Scope and priorities

The brief asks for a Figma-based anime catalog using React/TypeScript, AniList data, format/text filters, and score colors. The candidate also requested details pages, focused tests, atomic commits, and a performance review. The implementation prioritizes a working catalog, predictable requests, usable recovery, and explainable code within the challenge's limited scope.

The details page, keyboard/focus improvements, and server-rendered first page are additions beyond the explicit brief. No embedded episode player, authentication, watchlist, characters/relations, or broad product expansion is included. Deployment supplies the optional hosting bonus.

## Technology choices

| Technology                     | Motivation and cost                                                                                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js App Router             | Candidate-selected React framework; thin routes, optimized images/fonts, and server rendering. Adds framework/runtime complexity compared with a small Vite SPA.                              |
| Strict TypeScript              | Makes domain contracts and nullable fields explicit. Handwritten types do not validate upstream JSON at runtime.                                                                              |
| Tailwind CSS                   | Candidate preference; responsive styling and shared theme values without a component-library visual style. Utilities can make JSX verbose.                                                    |
| TanStack Query                 | Owns remote-data cache, cancellation, infinite pagination, and hydration. Avoids duplicating that behavior in component state; introduces a cache policy to explain.                          |
| GraphQL through native fetch   | AniList's interface, with explicit operations/variables and a small transport. No Apollo client or code generation is needed for the small query set; manual types can drift from the schema. |
| Jest and React Testing Library | Candidate familiarity and observable behavior tests. No end-to-end framework was requested or required by the brief.                                                                          |
| npm and its lockfile           | Reproducible installation with a familiar toolchain.                                                                                                                                          |

## Architecture and state ownership

Routes in `src/app` compose the site shell and feature views. Anime-specific API mapping, server prefetch, hooks, UI, and pure rules stay in `src/features/anime`; the transport, QueryClient factory, and site shell are shared. Tests live beside the behavior they verify. No generic repository/service layer or global client-state store is added for this small application.

Search and format belong to the URL so direct links and browser history work. The input holds the user's unapplied draft until Enter/“Search”; applied values synchronize without replacing its DOM node. Format selection applies immediately. Both environments trim search, validate formats, and use the first repeated parameter value. Filter navigation uses a React transition, retains current cards while waiting, shows “Searching...”, and announces progress.

React Query owns server data. Infinite-query keys include the normalized filter pair; details keys include the ID. Image failures and temporary focus/navigation state remain local UI concerns.

## Data and pagination rules

- Request twelve items per page, ordered by popularity descending and then ID descending. Follow AniList's `hasNextPage`; append on explicit “Ver mais”. Deduplicate displayed IDs because live rankings can change.
- Omit inactive optional GraphQL variables rather than sending null. Live verification produced different default responses with null; a regression guards the chosen request shape.
- Prefer romaji title, then English/native, then an unavailable label. Preserve all available genres and null scores; zero is a real score, not missing data.
- Follow the written score thresholds, including yellow at 80, despite the sample's green badge. Adult entries are excluded consistently from catalog and details.
- Reject non-success HTTP responses, GraphQL errors even with HTTP 200/partial data, and missing response data. Forward AbortSignals; avoid automatic retry loops and window-focus refetch. A 429 receives specific guidance, and failed pagination keeps loaded cards.

## Server rendering and cache policy

The first implementation fetched catalog data in the browser. Lighthouse exposed the HTML → JavaScript → API → cover discovery sequence, justifying server prefetch after measurement rather than adding it during initial scaffolding.

The home route awaits URL parameters and fetches page one with a fresh request-scoped QueryClient. The same infinite-query options seed a HydrationBoundary before rendering the catalog; HTML contains real cards and cover URLs. The browser reuses that data/timestamp and requests later pages through the existing hook. No server action, API proxy, experimental streaming integration, or extra dependency is needed.

Preserve any existing browser query data when a new server page-one snapshot arrives: a newer snapshot must not erase appended pages after details navigation. Existing freshness rules remain responsible for refetching that browser data. Query data is fresh for five minutes and inactive browser entries survive fifteen minutes; no persistence across reloads is provided. Stale infinite queries can refetch all loaded pages sequentially. No page cap removes cards the user already loaded, so active long sessions can retain many pages.

Server requests have an eight-second combined cancellation/timeout signal. Failed states include only a generic serializable error and public status, reconstructed for the current recovery UI. Catalog `retryOnMount` is disabled so hydration does not immediately repeat a failed server request. Explicit Retry remains available. Server prefetch clients are cleared after dehydration; server GC timers are disabled within their isolated lifetime.

The tradeoff is a request-time dependency on AniList and more server-side upstream traffic. A server navigation may fetch page one even when the browser already has that filter. No shared server data cache is implemented; production traffic would warrant measuring cache requirements and the shared upstream rate-limit budget before expanding this design.

## Design and accessibility

The Figma layer inspection exposed a 1366px-wide frame, 68px header, 1316px grid, 317×270 cards, 16px column gaps, 21px row gaps, and 54px footer. Use those measured desktop dimensions, with one/two/four-column responsive layouts. Cards retain a 270px minimum and grow for long content; a strict fixed ratio caused genre/score overlap at narrower desktop widths.

Exact font metadata and source palette tokens were unavailable in the read-only session. Self-hosted Poppins 300/400/500 and the purple/amber palette are visual matches, not verified exact values. Full-glyph WOFF2 conversion reduced the three font assets from 480,828 to 153,796 bytes while preserving glyph order, Unicode maps, and horizontal metrics. The original OFL license is retained.

Use readable score labels, darker search borders/placeholders, visible separated focus outlines, a focusable skip-link target, full title reflow, and larger small-screen/coarse-pointer controls. Persistent polite announcements and focus recovery cover search, pagination, errors, and empty-result reset. These are targeted improvements rather than a formal WCAG or full assistive-technology certification.

## Details-page additions

Use a banner/cover composition extending the catalog theme because the supplied design has no details screen. Fetch by positive GraphQL Int ID, preserving nullable metadata and partial dates. The synopsis becomes escaped plain text with paragraph breaks; source markup is not injected as HTML.

Validate/deduplicate active STREAMING links from AniList external links. Accept HTTP(S) without embedded credentials; preserve upstream HTTP links rather than invent replacements. Provider availability, regional rights, subscription access, and video hosting are outside the application. No episode playback request is made. Episode-link browsing and external trailer cards are added below; provider availability is still determined externally.

Cards are full-card accessible Next links with visible focus, and speculative card-route prefetch is disabled. Only validated search/format values travel to details and back; no arbitrary return URL is followed. Malformed IDs use Next's HTTP 404. A syntactically valid missing ID is detected client-side and shows an unavailable view with HTTP 200; per-title SSR metadata and semantic server-side missing-title responses are deferred.

## Verification and performance evidence

Jest/Testing Library verifies business rules and observable request/UI behavior, including server HTML, safe error snapshots, request isolation, no duplicate hydration fetch, next-page requests, cancellation, filter separation, cached pagination, and focus/recovery. Live browser checks cover keyboard flows, direct/filtered routes, responsive reflow, images, and browser warnings. No automated end-to-end framework or external-service-dependent unit tests are added.

Production Lighthouse 13.6.0 mobile runs after SSR scored 89–90 (final run: 89), versus an earlier single baseline of 84. LCP was 3.6–3.7s versus 4.3s; final TBT was 30ms and CLS zero. Audits confirmed that the first image was discoverable in initial HTML and no browser GraphQL request occurred during first load. These are local lab observations with retained server image-optimizer cache and live API latency. They do not establish field Web Vitals or a guaranteed deployed score; mobile LCP remains an improvement opportunity.

## Dependency review — 2026-11-03

`npm audit --omit=dev` reports zero findings. The full audit reports 35 findings in development tooling: 32 moderate and 3 low, including transitive Jest/ESLint chains involving glob/minimatch/deepmerge. This is not an entirely clean audit. npm proposes major downgrades of Jest, ESLint, and eslint-config-next for several findings; forced downgrade fixes were not applied because they would replace the supported tooling contract. Review compatible upstream resolutions before release, and keep development tooling away from untrusted repositories/input. Audit results are a dated observation, not a permanent security guarantee.

## What I would do with more time

1. Verify exact Figma typography/color tokens and conduct physical-device and screen-reader testing.
2. Continue mobile LCP profiling with repeatable cold/warm runs, then evaluate font subsets, critical resource contention, and server cache needs using measured evidence.
3. Add per-title server rendering/metadata and an HTTP 404 for valid missing IDs while avoiding duplicate upstream requests.
4. Resolve development-tool advisories through compatible updates and add CI checks for the documented verification commands.
5. Add generated GraphQL types/runtime validation if query/schema scope grows; introduce shared server caching/rate-limit protection if deployment traffic justifies it.

## Deployment

Use native Vercel Next.js hosting for the optional deployment step, preserving request-time rendering and image optimization. Pin Node to the locally verified 22.x major rather than an open-ended >=22 range. Declare the Next.js preset and reproducible install/build commands; avoid static export or framework migration. CLI upload exclusions keep local output/environment/account metadata outside source uploads. Account/project links remain ignored; Git-based publication is separate from direct CLI hosting. After the candidate authenticated, Vercel CLI 65.10.0 created the isolated challenge project and published https://winnin-anime-challenge.vercel.app. The first deployment was assigned to production automatically; no separate preview was created. Verified the production alias anonymously without modifying protection settings on other deployment URLs or any existing projects. No temporary unclaimed deployment was used.

The Node 22 cloud install/build succeeded, and deployed catalog/image/filter/pagination/details/return/404 checks passed. A single clean-profile mobile Lighthouse 13.6.0 run scored 96, with 2.7s LCP, 30ms TBT, zero CLS, and no duplicate browser GraphQL fetch. Treat this as dated hosted lab evidence rather than a guaranteed score. Repository publication is still separate; CLI deployment did not create a Git remote.

## Episode and trailer data

Fetch streamingEpisodes/trailer separately after details load. AniList supplies the entire episode array without pagination. Validate provider links, deduplicate URLs, sort only supplied episode numbers, and preserve gaps/unknown titles. Require HTTPS thumbnails. Validate trailer IDs on fixed YouTube/Dailymotion origins; trim upstream whitespace and build canonical YouTube thumbnails. No episode video is fetched.

## Streaming-style details presentation

The current hierarchy and rail behavior are described below. Episode cards retain provider labels, safe new-tab destinations, 16:9 images, supplied number badges, and image fallbacks. Keep separate loading/error/retry/empty media states so metadata and synopsis remain usable. Direct lazy HTTPS thumbnails avoid a broad server image proxy, at the cost of provider-controlled size/availability.

## Details hierarchy and horizontal episodes

Following the latest candidate review, place banner/title/cover first, title and compact three-line expandable synopsis beside Information on desktop (stacked on smaller screens), then trailer when supplied, episodes, and Where to watch. The information row and trailer now take priority over keeping episode imagery above the fold. Replace the grid/batch-expansion UI with a single native horizontal rail, lazy thumbnails, keyboard-focusable scrolling, and previous/next controls with boundary states and reduced-motion support. All supplied links remain in the rail; this trades a larger DOM for continuous browsing without extra API requests.

## Inline trailer playback

Use a click-to-load YouTube iframe on the fixed youtube-nocookie.com origin, constructed only from canonical validated YouTube watch links. Request autoplay only after the user's play action. Keep controls/fullscreen available, provide a meaningful frame title, focus it after activation, and unmount on Close to stop playback and restore focus. Do not preload a video SDK or iframe with the details page. The iframe's strict-origin-when-cross-origin policy preserves the Referer required by YouTube; thumbnail images still use no-referrer.

Keep an external fallback visible because video owners, region restrictions, or provider sign-in checks can block embedding. The test browser encountered a YouTube sign-in/bot check: iframe loading was verified, actual playback was not. Do not bypass that gate. Dailymotion retains external playback rather than inventing a Player ID/configuration that AniList does not provide. References: https://developers.google.com/youtube/player_parameters and https://support.google.com/youtube/answer/171780.

## Interface language

The candidate requested a consistently English interface. All application-owned text, including loading/error/empty states, accessibility labels, metadata, status and season labels, and footer copy, is English. The document declares `lang="en"`. Release dates use explicit English month names and UTC to avoid numeric-date ambiguity and timezone shifts, while preserving partial dates. Anime titles and source-provided names/content retain their original forms; no translation service or localization dependency was introduced.

## YouTube verification fallback

The candidate reproduced YouTube’s sign-in/bot check in a normal browser and reported that signing in through the popup did not unlock the embed. This is a provider-controlled verification screen; the exact browser/session cause is not diagnosed. Keep the supported privacy-enhanced embed and required referrer policy. Promote the direct trailer link to a visible button and explain that separate-window sign-in may not unlock embedded playback. Do not claim this resolves YouTube’s verification. Request the player interface in English with the documented `hl=en` parameter. No authentication workarounds, cookie changes, or account access were attempted. References: https://support.google.com/youtube/answer/171780?hl=en and https://developers.google.com/youtube/player_parameters#hl.

## Card focus and remote navigation

Added subtle 3.5% catalog-card enlargement on mouse hover and keyboard focus, with a visible focus ring, stacking/shadow, and no layout shift. Reduced-motion users keep the ring without scaling or animation. Shared navigation handles standard Arrow keys across application controls using current screen geometry, including responsive card rows and horizontal episode links. Left/Right stay within the current row; Up/Down prefer the same column. Focused controls scroll into view, disabled/hidden controls are skipped, and boundaries retain focus. Initial arrow input enters the main controls without stealing focus on page load. Enter uses native links/buttons; Tab and search caret editing remain available. Pagination now focuses the new card’s actionable link, so Enter opens it immediately.

Starting a trailer focuses Close rather than moving into YouTube’s cross-origin iframe, keeping the app’s arrow navigation available. The embedded player remains reachable by Tab; keys inside it are controlled by YouTube. This supports browser remotes emitting standard Arrow/Enter events, not a packaged TV-platform application. Physical TV hardware, platform-specific back keys, and on-screen keyboard integration still require device testing.

## Provider logo links

Use `externalLinks.icon` and `externalLinks.color` from AniList instead of maintaining hardcoded platform logos or adding a brand-icon dependency. Validate HTTPS URLs and six-digit hex colors. Display each logo in a fixed-size colored tile; keep the anchor’s service name/new-tab hint available to assistive technology and in its title. Fall back to the service name when an icon is absent or fails, so unknown providers remain usable. Keep safe external-link behavior, available-region guidance, and arrow/Enter navigation. Images load lazily without broadening the optimized-image proxy allowlist.

The Information panel starts at the title row, immediately below the banner on desktop, rather than starting at the synopsis. Its rows use compact spacing so the trailer can start appearing within a typical desktop viewport. On smaller screens, the title, synopsis, and Information remain stacked.
