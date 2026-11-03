# Technical decisions

## Initial project foundation — 2026-11-02

- Next.js App Router with strict TypeScript: agreed with the candidate; thin route files and feature-oriented application code.
- Tailwind CSS: agreed preference; design tokens and component styling will follow Figma after inspection.
- TanStack Query: owns client-side remote data. A stable provider creates one QueryClient per mounted application. Initial defaults: 60-second stale time, no automatic retries or focus refetching to keep external API requests predictable. Revisit retry behavior when implementing API-specific errors.
- GraphQL through native fetch: a single request helper sends variables separately, supports cancellation, and rejects HTTP errors, GraphQL errors (including partial responses), and missing data. Type parameters do not provide runtime schema validation.
- Jest and React Testing Library: candidate familiarity takes priority over Vitest integration convenience. No end-to-end test framework, as agreed.
- npm and its lockfile: reproducible dependency installation.
- System font and placeholder page: temporary foundation, not the challenge design. No Google font download during builds. Final fonts and layout depend on Figma inspection.
- No API proxy, server prefetching, GraphQL code generation, or global client state store at this stage. Add only for demonstrated needs.

## Next work

Inspect Figma, confirm card fields and pagination, implement the anime feature, and verify live AniList behavior. Add focused tests for score boundaries, filters, and request states, and manually check responsiveness and accessibility. Deployment is optional. No catalog functionality or design-fidelity claim is included in this scaffold.

## Dependency audit

Production dependency audit passed with zero known findings during setup. The full audit flags development-only dependency chains in Jest/ESLint (glob, minimatch, deepmerge). Suggested automatic major-version downgrades were not applied. Review compatible upstream fixes before submission; do not treat the full audit as clean.

## First catalog implementation — 2026-11-02

- Followed the visible Figma desktop composition: purple brand bars, format controls, explicit search button, four-column image cards with genre tags and scores, and full-width amber load-more button. Exact font/spacing remain provisional; the anonymous Figma session shows a sign-up requirement for inspection. System sans-serif remains temporary.
- Search uses explicit form submission, replacing the initial debounce proposal to match the visible “Buscar” control. Search and format are stored in URL parameters through Next navigation. Each combination owns a separate React Query infinite-query cache, starting at page one.
- Twelve items per API page match the reference's first grid. “Ver mais” appends pages using hasNextPage, and duplicate IDs are removed during display to tolerate changing upstream rankings. Popularity descending with ID descending is the chosen default ordering; the reference's historical titles are not hardcoded. Adult entries are excluded.
- Cover images use next/image with a narrow AniList hostname/path allowlist, lazy loading, responsive sizes, and an image-error fallback. No detail route or unrelated card interaction is added.
- All available genres are displayed. Romaji titles are preferred to match the design, falling back to English/native and then an explicit unavailable label. Missing scores display a dash and accessible unavailable label rather than zero.
- Written score rules take priority over the sample's green 80% badge: 80 is yellow. Badge shades and dark text on amber favor readability over exact screenshot colors.
- Added skeletons, empty-state reset, keyboard focus indicators, status announcements, and retry controls. Failed pagination retains existing cards. No automatic retry loop; HTTP 429 receives specific guidance.
- Responsive one/two/four-column layouts are an inferred extension of the supplied desktop frame, subject to further visual review. No end-to-end framework or new dependency was introduced.

Live API finding: omit unused search/format variables instead of sending null. The actual AniList response differed for null variables during verification. A request-construction test now guards this behavior.

## Step 3 — Typography

Use self-hosted Poppins light/regular/medium via next/font/local as a visual match to the reference. Exact Figma font metadata was unavailable in the anonymous session; this choice remains explicitly provisional. Font files and their OFL license are included from https://github.com/google/fonts/tree/main/ofl/poppins.

## Step 3 — Measured layout

Selected Figma layers show a 1366×68 header, 834.05×32 format group, 1011.88×38 search group, 1316×852 card grid, and 317×270 cards. Use rounded whole-pixel dimensions for implementation. Desktop gutters are 25px, grid columns are separated by 16px, and rows by 21px. Preserve responsive control wrapping instead of enforcing the desktop frame on smaller screens.

## Step 3 — Card treatment and palette

Use the measured 317:270 ratio and an 8px score-badge inset. Regular Poppins titles at 24px/28px, lighter genre pills, and a less opaque image gradient are visual matches to the reference. Brand purple/amber remain visual approximations because source color properties could not be copied; do not describe them as exact Figma values. Retain readable semantic score colors and dark text on yellow rather than reproducing the reference's low-contrast white/yellow combination.
