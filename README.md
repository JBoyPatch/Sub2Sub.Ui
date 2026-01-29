# sub2sub

Lightweight Vue 3 + Vite starter for a small LoL multiplayer lobby application.

## Overview

This repository contains a minimal Vue 3 + TypeScript app scaffolded with Vite. It includes a few pages, Pinia stores, and thin API wrappers intended to be hooked up to a backend service.

## Features

- Vue 3 single-file components
- TypeScript with `vue-tsc` for type checking
- Pinia for state management
- Vue Router for navigation

## Stack & Dependencies

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router

See exact versions in `package.json`.

## Quick Start

Install dependencies:

```bash
npm install
```

Run the development server (hot reload):

```bash
npm run dev
```

Build for production (includes type-check):

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run type checks only:

```bash
npm run type-check
```

## Scripts

- `dev` — start Vite development server
- `build` — run type-check then build the app
- `preview` — preview the production build
- `type-check` — run `vue-tsc --build`

## Project Structure (important parts)

- `src/` — application source code
	- `main.ts` — app bootstrap
	- `App.vue` — root component
	- `router/` — route definitions
	- `stores/` — Pinia stores (e.g. `userStore.ts`)
	- `pages/` — views (Home, Profile, MatchLobby, etc.)
	- `components/` — reusable UI components
	- `api/` — small wrappers for backend endpoints
- `public/` — static files copied to build output
- `vite.config.ts`, `tsconfig.json`, `package.json`

## Environment

Place local environment overrides in `.env.local` (this file is usually gitignored). Use it to set API base URLs, feature flags, or secret keys for local development.

## Notes & Tips

- For best TypeScript support in VS Code, install the Volar extension and disable Vetur.
- The `src/api/` files assume a backend; update endpoints and `.env.local` values to match your services.

## Contributing

Open an issue or PR. Keep changes focused and add notes when you change the API shape or store contracts.

## License

This repo currently has no explicit license. Add a `LICENSE` file if you want to publish under a specific license.