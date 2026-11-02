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
