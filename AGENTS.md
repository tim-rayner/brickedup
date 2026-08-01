# BRICKED UP 🧱

A pnpm + Turborepo monorepo. The only product is `apps/mobile`, an Expo (SDK 57) / React Native app that also targets the web. `packages/*` are shared dev configs (`@repo/eslint-config`, `@repo/typescript-config`) plus a placeholder `theme` package.

> Note: `apps/mobile/AGENTS.md` reminds you that Expo SDK 57 changed APIs — read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing mobile code.

## Cursor Cloud specific instructions

### Services

The mobile Expo app is the entire product; there is no backend, database, or other service. In the cloud VM the app can only be exercised via the **web** target (no iOS/Android simulators are available).

- Install deps: `pnpm install` from the repo root (Node 22 / pnpm 9 are preinstalled; the update script handles this on startup).
- Run (web): from `apps/mobile`, `npx expo start --web --port 8081`, or from the root `pnpm --filter mobile web`. Metro serves the web app on port `8081`. `pnpm dev` runs Turbo's persistent `dev` task, but that launches the interactive Expo CLI, so for web verification prefer running `expo start --web` directly.
- Lint: `pnpm lint` (root) or `pnpm --filter mobile lint` (`expo lint`).
- Type-check: the root `pnpm check-types` is currently a no-op (no package defines a `check-types` script). To type-check the app directly, run `npx tsc --noEmit -p apps/mobile/tsconfig.json`.
- There are no automated test suites configured.

### Non-obvious caveats

- `expo lint` performs a one-time interactive-style setup on first run in a fresh checkout: it adds the `eslint-config-expo` devDependency and generates `apps/mobile/eslint.config.js`. These files are committed, so lint runs cleanly without that setup afterward.
- `pnpm lint` currently reports one pre-existing lint error in `apps/mobile/src/hooks/use-color-scheme.web.ts` (`react-hooks/set-state-in-effect`). This is existing application code, not an environment issue.
- `npx tsc --noEmit` reports errors for the `*.module.css` / `global.css` imports. These are resolved by the Expo/Metro bundler at runtime, not by `tsc`, so they are expected and do not affect the running app.
- The web bundle takes ~10s to build on first request; a `200` from `http://localhost:8081/` confirms the server is up.
