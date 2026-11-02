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
