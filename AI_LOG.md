# AI usage log

## 2026-11-02 — Planning and project creation

Tool: Codex desktop (OpenAI), using documentation browsing and local development tools.

Context: the candidate supplied the Winnin frontend challenge and requested stack and architecture proposals before project creation. Codex read the brief. Figma could not be inspected through the browser tool and AniList documentation returned HTTP 403.

Candidate decisions: selected Next.js, TypeScript, Tailwind, React Query, GraphQL, and Jest. Replaced the initial Vite/CSS Modules/Vitest proposal and explicitly excluded Playwright/end-to-end testing. Authorized project creation in Documents/repos.

Generated work: official create-next-app scaffold, React Query provider, GraphQL request helper, Jest configuration and request tests, formatting configuration, and starter documentation. No final challenge UI has been implemented.

Review/corrections: removed the generated marketing page and network-dependent Google fonts; retained a clear placeholder pending Figma review. Added explicit handling for GraphQL errors in successful HTTP responses and tested partial-data rejection.

Verification results are recorded after running local checks. The candidate must review and understand the implementation before submission. This log does not claim candidate review has happened.

Repository instructions used for future work are included in `AGENTS.md`.

## Verification — initial foundation

- `npm test`: passed, 4 GraphQL transport tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run format:check`: passed.
- `npm run build`: passed; home page prerendered successfully.
- Production server smoke check: HTTP 200 and expected placeholder content.
- `npm audit --omit=dev`: zero known production dependency vulnerabilities at verification time. Full audit reports development-tool advisories (glob/minimatch/deepmerge dependency chains); retained current compatible tooling rather than accepting audit suggestions to downgrade Jest and ESLint to old major versions. Reassess before submission.
- No live AniList integration or visual Figma verification claimed.

## 2026-11-02 — First working catalog

The candidate authorized implementing the first version from the supplied Figma and AniList, leaving detailed refinement for a later pass. Codex used the Sites skill's local-only workflow in the existing Next.js repository; nothing was deployed.

Reference inspection: opened the actual Figma canvas in the browser, expanded the layer panel, and observed the desktop composition. The session remains anonymous and prompts for sign-up to inspect; exact font and dimension values were not claimed. Verified AniList's query documentation and sent a real GraphQL request to confirm pagination, cover images, titles, genres, and scores.

Generated: feature components, typed API response mapping, infinite-query hook, URL-driven filters, explicit search submission, responsive grid, next/image support, score badges, and loading/empty/error/retry behavior. Added Jest tests for boundaries, nullable data, filters, pagination, empty results, rate limiting, and pagination recovery.

Judgment/corrections: chose submitted search to follow Figma rather than the earlier debounce proposal. Used the written rule for the 80-point boundary despite the sample's green badge. Used live popularity-ranked data rather than hardcoded historical titles. Initial build exposed unsupported `exact` options in Testing Library test typings; removed those options and reran the build. First-run Jest passed all 20 tests; final validation is recorded below after browser review.

Live browser verification exposed an AniList distinction: explicit null optional filters returned upcoming/unrated entries, while omitted variables returned the expected popular entries. Corrected the request builder to omit inactive filters and updated the regression test. This was detected by comparing the actual default query with and without null variables, rather than relying only on mocked tests.

Final first-version verification:

- Jest: 20 tests passed across four suites after the filter-variable correction.
- Production build: passed, including TypeScript checks.
- Live browser: default popular catalog and images rendered; “Ver mais” increased the rendered card count from 12 to 24; submitted Naruto search returned matching entries; Movie combined with Naruto returned 11 film entries and no further-page control; browser Back restored the unfiltered search.
- Responsive browser checks: one column at a 390px viewport and two at 768px, with document scroll width equal to client width (no horizontal overflow). Four-column desktop visually compared with the Figma composition.
- Browser warning/error log was empty during the final live check. Exact typography and spacing still need detailed review; no pixel-perfect fidelity claim.
- No Playwright dependency or automated end-to-end suite added. Browser interaction was manual agent QA using the available computer-use tool.

Final standalone typecheck, lint, formatting check, and whitespace diff check all passed. A desktop screenshot of the live first version was saved for review.

## Step 3 — Typography refinement

The candidate requested focused, atomic commits and authorized catalog visual refinement only. Re-inspected the actual Figma layer tree and selected frames at 50% zoom. Observed measurements include header 1366×68, filters 834.05×32, search 1011.88×38, cards grid 1316×852, and individual cards 317×270. Copy-as-CSS returned an empty clipboard in the anonymous session, so exact font metadata is still unverified.

Replaced Arial with locally hosted Poppins (300/400/500), chosen as a closer visual match to the rounded reference lettering. Files and OFL license come from the official google/fonts repository. This is a visual approximation, not a verified Figma font identification. next/font/local avoids Google requests during builds and visits.

## Step 3 — Layout and controls

Aligned the desktop content gutters to the measured 1316px grid inside the 1366px frame (25px each), grid row gaps to 21px, filter row to 32px on desktop, search row to 38px, load-more control to 48px, and footer to 54px. Preserved wrapping controls on smaller screens. Updated skeleton grid gaps alongside loaded results. No request or filter behavior changed.

## Step 3 — Card and color refinement

Matched the measured 317×270 card ratio, reduced title weight to regular with 28px line height, tightened title-to-genre spacing, lightened genre pills and the image gradient, and inset score badges by 8px with rounded corners and light typography. Rebalanced the brand purple and amber by visual comparison; these are approximate rendered-color matches, not copied Figma tokens. Existing semantic score thresholds and readable score text colors are preserved. Skeletons use the same updated aspect ratio.

The candidate's existing development server on port 3000 was reused for browser comparison. An attempted separate dev server exited because Next detected the existing server; no user-owned process was stopped.

## Step 3 — Wordmark follow-up

Browser comparison showed the Poppins wordmark was narrower than the selected Figma text layer (237×28). Applied 0.045em tracking and block layout to match that measured width/line box more closely without stretching the font. This is recorded as a separate follow-up commit instead of rewriting the typography commit.

Validation before the wordmark follow-up: 20 Jest tests passed; lint, formatting, and the production build passed. At 1366px content width, browser measurements confirmed 317×270 cards, 21px row gaps, a 68px header, 38px search row, and 54px footer. Phone layout retained a single column without horizontal overflow. Final wordmark verification follows below.

Final wordmark dimensions were 236.73×28px against the reference's 237×28px. Production build, standalone typecheck, lint, formatting, and whitespace checks passed. The production preview loaded 12 live AniList cards, all 12 cover images, and the local fonts. Saved a full-page review screenshot. Step 3 is complete with font identity and source color values still explicitly unverified; step 4 and the details page remain pending.

## Step 4 — Keyboard focus and announcements

Reviewed the running catalog with keyboard input and DOM/accessibility-tree inspection. Verified that the skip link left focus on the body and that submitting a changed search replaced the input and lost focus after navigation. Replaced the keyed input with an uncontrolled input synchronized through a ref on URL changes; made the skip-link destination focusable. Added a persistent polite result-status region, avoiding a second loading announcement from the skeleton. Loading another page focuses the first new title, and failed pagination focuses the retry control. Added Jest regressions for retained search focus, persistent status, pagination focus, and recovery focus.

## Step 4 — Responsive reflow and touch controls

At a 1040px browser viewport (1025px content viewport), real AniList genre lists overlapped score badges in four cards. Replaced fixed-aspect card height with a 270px minimum and natural content growth, reserved bottom space for scores, and removed title clamping so full titles can reflow. Updated skeleton minimum height accordingly. Moved the missing-image caption into reserved bottom space. Mobile/coarse-pointer search and buttons now have at least 44px height; mobile/coarse-pointer search text uses 16px to avoid small-text zoom behavior. Desktop control sizes remain as measured in step 3. No new implementation-mirroring tests were added for CSS; browser geometry is used for validation.

## Step 4 — Contrast and visible focus

Calculated contrast using sRGB relative luminance and reviewed the W3C WCAG 2.2 definitions. The old neutral-400 placeholder was approximately 2.52:1 on white and the amber focus ring approximately 1.76:1. Changed placeholder and search border to neutral-500 (approximately 4.74:1 on white), and use a dark-purple focus outline with a white separating ring. Included programmatically focused main/title elements in the focus styling. Score labels remain unchanged: their 24px regular/light text is large text, and the existing red/green backgrounds exceed the applicable 3:1 threshold. No formal WCAG conformance or full assistive-technology audit is claimed.

## Step 4 — Recovery focus follow-up

Extended the focus review to repeated initial-request failures and empty-result reset. Restore focus to Retry after another failed attempt, and move focus to the existing search field when clearing filters removes the reset control. Added a repeated-failure regression and strengthened the existing reset test to assert focus. This is a separate follow-up commit rather than rewriting the original keyboard fix.

Final step-4 verification: 24 tests passed across five Jest suites; production build, standalone typecheck, lint, formatting, and whitespace checks passed. Live browser checks confirmed skip-link focus on main, search focus retained after results update, and keyboard pagination focusing the first newly loaded heading while announcing the 24-item count. Reflow checked at 320, 640, 1040, and 1381px browser widths with no horizontal overflow or genre/score overlap. The production build also passed the original failing default-catalog cases at 320 and 1040px widths, with no browser warnings/errors. Saved a production screenshot showing the new visible keyboard focus ring and full titles. No end-to-end framework or new dependencies were added; the user's existing development server was left running. Step 4 is complete as a targeted review; full assistive-technology and physical-device testing have not been performed.

## Step 5.1 — Details data contract

Verified live AniList title metadata and streaming-provider fields. Added a typed details query, nullable-data mapping, partial-date formatting, and plain-text synopsis conversion. Descriptions remain source-language text and are never injected as HTML. Active HTTP(S) streaming links are validated and deduplicated; credentials and non-web schemes are rejected. Preserve AniList's GraphQL error status so missing titles can be distinguished from rate limiting/network failures. Added focused mapping, ID/date, transport-status, synopsis, and URL tests. No details UI or catalog navigation yet.

## Step 5.2 — Shared site shell

Extracted the existing wordmark, header, skip link, and footer into SiteShell. The catalog retains its existing main landmark, styling, and heading. Other routes can use a home link in the header so the detail title remains the page's single h1. This refactor introduces no details route or catalog navigation yet.

## Step 5.3 — Details route and view

Added /anime/[id] with server-side ID validation and a client-side React Query details view. Includes cover/banner with fallbacks, full title and alternate names, synopsis, score, genres, studios, dates, season, episode count, duration, loading, rate-limit/retry, and unavailable-title states. The design extends the existing purple/amber theme; no Figma details screen was supplied. Metadata remains a generic route title; missing valid IDs are detected by the client API request and shown as an unavailable state, while syntactically invalid IDs use Next's route not-found response. Added tests for populated/missing metadata, safe text rendering, missing titles, retry, and distinct title queries. Viewing-provider UI and card links are still pending.

## Step 5.4 — Where to watch

Added a provider section using the validated active streaming links from the data layer. Links open in a labeled new tab with noopener/noreferrer, and a regional/subscription availability note. Missing providers receive an explicit message plus an AniList title reference. No player or episode-video request is made. Added tests for accessible external-link behavior and the no-provider state.

## Step 5.5 — Card navigation and return context

Made each card a keyboard-accessible internal link with a visible inset focus indicator, preserving existing heading focus after pagination. Search/format are encoded into detail links and rebuilt into the return link from known parameters only; arbitrary return URLs are not accepted. Added a Suspense boundary for client search-parameter reads. Added tests for encoded URLs, filter context in card and return links, and repeated details-request recovery focus. Details loading focuses the resolved title without scrolling the viewport. README describes the new route and its limits.

Final step-5 validation: 54 tests passed across ten Jest suites. Production build, standalone typecheck, lint, formatting, and whitespace checks passed. Live keyboard navigation opened a Naruto movie from its filtered catalog; the return link restored the Naruto search, Movie selection, and 11 results. Verified direct /anime/16498 loads with both images and provider links, a valid missing ID shows the unavailable state, and /anime/not-an-id receives HTTP 404 with the custom page. Inspected phone hero/metadata/provider layout and checked 320/768/1280px browser widths without horizontal overflow. The production browser warning/error log was empty. Saved the completed details-page screenshot. No provider playback or regional availability claim was made; no end-to-end framework or new dependency was added. The existing user development server remains running.

## Step 6 — Request behavior

Reproduced the one-minute freshness issue with a two-page catalog: returning after a simulated 90-second details visit started a background refetch. Extracted the production QueryClient factory for behavioral testing and extended freshness to five minutes with fifteen-minute inactive retention. The regression now expects two original page requests and zero additional return requests. A six-minute revisit still refreshes both pages in order; leaving a pending filter query aborts its signal. No polling, speculative details fetch, server proxy, or new dependency was added. This reduces requests during ordinary navigation; it does not eliminate refetching after expiry or provide reload persistence.

## Step 6 — Font compression

Converted all three existing Poppins TTF files to full-glyph WOFF2 using temporary fontTools/Brotli tooling outside the application. Total raw font assets decreased from 480,828 to 153,796 bytes (68.0%); these are file sizes, not a measured page-speed score. Verified equal glyph order, Unicode maps, and horizontal metrics after decoding each output. Updated next/font/local paths and retained the original OFL license.

## Step 6 — Images and final validation

Browser inspection confirmed the first visible cover used lazy loading and the declared responsive widths omitted grid gutters/gaps. Corrected the sizes expression and made only the first cover and details banner eager/high-priority. Other images remain lazy, with existing fallbacks. Kept the UI design unchanged. Reviewed initial production script references: ten chunks per route, roughly 199 KB gzip including framework code (local compression estimate, not measured transfer or a speed score).

Final step-6 verification: 57 Jest tests passed across eleven suites; production build, standalone typecheck, lint, formatting, and whitespace checks passed. The cache return regression failed before the policy change and passed afterward; expiry refresh and cancellation also passed. Production browser checks confirmed WOFF2 preloads, all initial covers loaded, first-image/banner priority hints, and 24 catalog cards retained after a details round trip. Checked the phone layout at a 390px viewport without horizontal overflow; fonts reported loaded and the console warning/error log was empty. Saved a production screenshot. No Lighthouse benchmark, field Web Vitals, or total transfer measurement was performed. Step 6 is complete; final submission documentation remains step 7.

## Server-rendered catalog — Preparation

Extracted a typed infinite-query options factory and shared URL-filter normalization before adding server prefetch. Added filter normalization cases for omitted, whitespace, repeated, and invalid values. This commit keeps existing request/render behavior and prepares the same query contract for both environments.

## Server-rendered catalog — Implementation and functional validation

Added request-scoped page-one prefetch, awaited URL filters in the async home route, and hydrated the existing infinite query before rendering cards. Added an eight-second server timeout and safe error serialization so server failures use the existing retry UI without an immediate client retry. The hydration wrapper preserves any browser pages already loaded. Kept details and later-page requests client-owned. Updated README and decisions to document server network requirements, latency/rate-limit tradeoffs, and the absence of a shared server cache.

All 69 tests passed across thirteen suites; production build, standalone typecheck, lint, formatting, and whitespace checks passed. New tests verify actual server-rendered card/title/image HTML, request isolation, safe 429 serialization, zero duplicate hydration fetch, next-page-only requests, filter separation, preserved browser pagination, and explicit error recovery. Raw production HTML contained 12 default cards and 11 Naruto/Movie cards before JavaScript execution. Live browser navigation loaded 24 cards, returned from details with all 24 preserved, submitted Naruto search, and applied Movie to show 11 results. A 390px viewport had no horizontal overflow and the warning/error log was empty.

A final navigation check found that server-driven filter changes retained old results while waiting, so added a React transition with a visible “Buscando...” button label and polite loading announcement. Added a focused regression ensuring the pending state preserves the editable, focused input. Rebuilt and reran all 69 tests plus type/lint/format checks. Live Enter submission showed the pending indicator, then four Bleach/Movie cards with input focus retained and no console warnings/errors. Saved the final browser screenshot.

## Server-rendered catalog — Lighthouse verification

Used Lighthouse 13.6.0 with fresh headless Chrome profiles, performance-only mobile audits, default simulated throttling (150ms RTT, approximately 1.6Mbps, 4× CPU), and the production server on port 3100. The earlier client-rendered production baseline scored 84 with 4.3s LCP and 40ms TBT. Three initial SSR runs scored 89/90/90 with 3.7/3.6/3.6s LCP and 20–30ms TBT. After the navigation-feedback refinement, the final build scored 89 with 3.7s LCP, 30ms TBT, 0.7s FCP, and zero CLS. Every SSR audit confirmed initial-document image discovery, zero browser GraphQL requests, no runtime error, and no run warning. Reports are saved in the chat outputs rather than committed as large generated artifacts.

These are local lab results with the image-optimizer cache retained and live AniList latency; the baseline was a single earlier run. They are not a guaranteed deployed score or field Web Vitals measurement. The initial request waterfall is removed, but mobile LCP still has room for improvement. No further image/font changes were bundled into this SSR change.
