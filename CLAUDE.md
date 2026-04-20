# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

This repo is **not** a running application. It is the source for the `create-poseidonjs` npm CLI (a `create-*` scaffolder, analogous to `create-next-app`). The CLI copies one of three templates into the user's cwd. Everything ships through npm as a single package; there are no workspaces at the repo root.

```
poseidonJS/
├── README.md, FEATURES.md      # Describe the GENERATED platform, not this repo
└── create-poseidonjs/          # The actual npm package (publish root)
    ├── bin/cli.js              # Commander entry, declared in package.json "bin"
    ├── lib/
    │   ├── create-server.js    # server template -> target dir
    │   ├── create-admin.js     # admin template -> target dir
    │   ├── create-frontend.js  # frontend template -> target dir
    │   └── create-fullstack.js # all three + monorepo root package.json
    ├── templates/
    │   ├── server/             # Express + Mongoose, CommonJS .js (not TS)
    │   ├── admin/              # Next.js 14 App Router, TS, port 3001
    │   └── frontend/           # Next.js 14 App Router, TS, port 3000
    └── my-store/               # Locally-generated scratch output, ignore
```

Important: the top-level `README.md` / `FEATURES.md` document the **generated** e-commerce platform (backend + admin + storefront) that end-users get from `npx create-poseidonjs full-stack`. They do **not** describe how to develop this repo. Do not treat their install/run steps as commands for this repo.

## Commands

Work happens inside `create-poseidonjs/`:

```bash
cd create-poseidonjs
npm install                       # install CLI deps (commander, inquirer, chalk, ora, fs-extra, gradient-string)
node bin/cli.js --help            # smoke test CLI
node bin/cli.js server <name>     # scaffold server template locally
node bin/cli.js admin <name>
node bin/cli.js frontend <name>
node bin/cli.js full-stack <name>
node bin/cli.js                   # interactive mode
npm test                          # == `node bin/cli.js --help`
```

There is no lint, no test runner, no build step for the CLI itself. Templates have their own scripts:

- `templates/server`: `npm run dev` (nodemon `src/server.js`), `npm start` — port 5000
- `templates/admin`: `npm run dev|build|start|lint` — port 3001
- `templates/frontend`: `npm run dev|build|start|lint` — port 3000

Generated full-stack root adds `concurrently` + `npm run dev` that fans out to all three workspaces.

## Architecture notes that aren't obvious from one file

**CLI dispatch (`bin/cli.js`)**: Commander defines `server`, `admin`, `frontend`, `full-stack` subcommands. The default action re-enters `program.parse` with the chosen subcommand — so the interactive branch and the flag branch converge on the same `lib/create-*.js` module. Each `create-*.js` is self-contained (copy template → copy `.env.example` to `.env` / `.env.local` → optionally `execSync` install).

**Template envelope**: Templates are copied verbatim by `fs-extra.copy`. Nothing is templated/interpolated except: `create-server.js` rewrites `package.json.name` in the server target; `create-fullstack.js` generates a fresh root `package.json` (workspaces = backend/admin-dashboard/frontend) and a root `README.md`. Treat template files as shipped artifacts — edits to `templates/**` are what end-users get.

**Server template (`templates/server`)** is plain CommonJS JavaScript despite README claims of TypeScript. Entry `src/server.js` wires ~25 route modules under `/api/*`, connects Mongoose, and on listen calls `dailySummaryService.scheduleDailySummary()` (node-cron). Note: several paths are mounted twice (e.g. `/api/ai` appears on `aiRoutes`, `fraudDetectionRoutes`, `customerInsightsRoutes`; `/api/products` on `productRoutes` and `inventoryCleanupRoutes`) — route ordering matters, Express merges by prefix. AI features go through `@anthropic-ai/sdk` via `services/claude.service.js` (the README's mention of Gemini is stale).

**Admin & frontend templates** are independent Next.js 14 App Router projects. Admin pins port 3001 in its `dev`/`start` scripts; frontend pins 3000. Both talk to the backend via `NEXT_PUBLIC_API_URL` and share the Tanstack Query + Zustand + Tailwind stack. Frontend also pulls Radix UI primitives + Embla + Swiper; admin pulls Recharts + Tanstack Table.

**Environment file convention**: server uses `.env` (dotenv), next apps use `.env.local`. The scaffolders copy `.env.example` → the appropriate live filename; never rename or delete `.env.example` files inside templates.

## Working on templates

When editing files in `templates/**`, remember a user doing `npx create-poseidonjs` gets a byte-for-byte copy. That means:

- Do not leave absolute paths, local secrets, or developer-specific config in template files.
- `templates/server/src/**` is JS — don't introduce TS syntax without also adding a build pipeline.
- The server expects ~25 route files under `templates/server/src/routes/`. Renaming or deleting one breaks `server.js` at startup (it `require`s each explicitly). Update both sides together.
- `my-store/` and any other locally-generated output inside `create-poseidonjs/` is disposable — it's the result of running the CLI against itself.

## Publishing

`create-poseidonjs/package.json` declares `bin.create-poseidonjs → ./bin/cli.js` and `engines.node >=18`. `.npmignore` controls what ships. Version in `package.json` (currently 1.4.9) is the source of truth; the banner string `version('1.0.0')` inside `bin/cli.js` is stale and unrelated to published version.
