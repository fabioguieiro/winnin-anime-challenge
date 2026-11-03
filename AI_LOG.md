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
