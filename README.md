# Safe Auth Service

An authentication backend built with NestJS, PostgreSQL (Drizzle ORM) and Redis.
This is a portfolio project. It has not been audited or deployed to production.

## Features

- Sign-up and login with bcrypt password hashing
- Short-lived JWT access tokens (15 minutes) and refresh tokens (7 days)
- Refresh token rotation: each token works once. Redis stores only its SHA-256 hash,
  and it is consumed atomically
- Logout revokes the current refresh token
- Password hashes are never returned by the API

## API

| Method | Path            | Input                                    |
| ------ | --------------- | ---------------------------------------- |
| POST   | `/auth/sign-up` | `{ email, password, confirmedPassword }` |
| POST   | `/auth/login`   | `{ email, password }`                    |
| GET    | `/auth`         | `Authorization: Bearer <access_token>`   |
| POST   | `/auth/refresh` | `{ refresh }`                            |
| POST   | `/auth/logout`  | `{ refresh }`                            |

## Run with Docker

```bash
cp .env.example .env   # set DB_PASSWORD and both JWT secrets
docker compose up --build
```

## Run locally

```bash
cp .env.example .env
docker compose up -d db redis
npm ci
set -a; . ./.env; set +a   # drizzle-kit reads the database settings from the shell
npm run db:migrate
npm run start:dev
```

## Tests

```bash
npm test           # unit tests
npm run test:e2e   # needs the migrated database, Redis and the env variables above
```

## Limitations

- One active refresh token per user: a new login ends the previous session
- Logout does not revoke an already issued access token (it expires within 15 minutes)
- No rate limiting, email verification, password reset or roles yet
