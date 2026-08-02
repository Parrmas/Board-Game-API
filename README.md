# Board Game API

![CI](https://github.com/Parrmas/Board-Game-API/actions/workflows/ci.yml/badge.svg)

A RESTful API for managing and exploring a board game collection — games, categories, mechanics, designers, publishers, and user accounts with saved-game lists. Built as a portfolio project to demonstrate a clean, modular Express + TypeScript + MongoDB architecture.

**Live demo:**
- Swagger UI: https://the-border-bg-api.onrender.com/docs/
- API root: https://the-border-bg-api.onrender.com/api/

## Tech stack

- **Runtime:** Node.js, TypeScript
- **Framework:** Express 5
- **Database:** MongoDB (Atlas) via Mongoose
- **Auth:** JWT (`jsonwebtoken`), password hashing via `bcryptjs`
- **Docs:** Swagger (`swagger-jsdoc` + `swagger-ui-express`)
- **Security:** Helmet, CORS, `express-rate-limit`
- **Tooling:** ESLint (flat config) + Prettier, GitHub Actions CI

## Architecture

The codebase follows a modular, feature-based structure. Each domain (game, category, mechanic, designer, publisher, auth, stats) lives under `src/module/<feature>/` with its own:

```
<feature>.model.ts       # Mongoose schema + TypeScript interface
<feature>.type.ts        # Shared types/constants for the feature
<feature>.service.ts     # Business logic + DB queries
<feature>.controller.ts  # Request/response handling
<feature>.route.ts       # Route wiring + Swagger JSDoc
```

Shared concerns live in `src/utils/` and `src/middleware/`:
- `response.util.ts` — standardized `{ success, data }` / `{ success, message }` response shapes
- `appError.util.ts` — typed application errors with HTTP status codes, thrown by services and caught by controllers
- `crudService.factory.ts` / `crudController.factory.ts` — generic `list`/`get` factories used by the simpler lookup entities (category, mechanic, designer, publisher) to avoid duplicating identical pagination/error-handling logic
- `populate.util.ts` — generic related-data population (e.g. attaching full category/mechanic/designer/publisher objects to a game from their id arrays)
- `auth.middleware.ts` — JWT verification, attaches `req.user`
- `validate.middleware.ts` — query/body validation (limit bounds, registration payload)

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local or Atlas)

### Installation

```bash
git clone https://github.com/<your-username>/Board-Game-API.git
cd Board-Game-API
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=your-secret-key
JWT_EXPIRE_IN=24h
API_URL=http://localhost:5000/api
CORS_WHITELIST=http://localhost:3000
PORT=5000
```

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign/verify JWTs |
| `JWT_EXPIRE_IN` | No (default `24h`) | Token expiry duration |
| `API_URL` | No | Base URL used in Swagger's server config |
| `CORS_WHITELIST` | No | Comma-separated allowed origins in production |
| `PORT` | No (default `5000`) | Server port |

`MONGO_URI` and `JWT_SECRET` are validated on startup (`src/config/validateEnv.ts`) — the server exits immediately if either is missing.

A `.local.env` file (gitignored) can be used to override `.env` values for local development without touching the committed file.

### Running the server

```bash
npm run dev     # ts-node-dev with auto-reload
npm run build    # compile to dist/
npm start        # run compiled/transpiled output
```

By default the API runs at `http://localhost:5000`, with interactive docs at `http://localhost:5000/docs`.

## API overview

Full request/response schemas are in Swagger (`/docs`). Endpoint groups:

| Base path | Description |
|---|---|
| `/api/auth` | Register, login/logout, current user, saved games |
| `/api/games` | List/filter/search games, filter option ranges |
| `/api/categories` | List, lookup by id, popularity ranking |
| `/api/mechanics` | List, lookup by id |
|
