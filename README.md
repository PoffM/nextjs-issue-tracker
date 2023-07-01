# Nextjs Issue Tracker

Full-stack TypeScript Issue Tracker web application.

## Features

- Login with a Google account (or local dev accounts).
- View + Add + Edit + Delete Issues.
- Issues table with filter, sort and pagination controls.
- Add comments to Issues.
- View an Issue's comments and edit history in an infinite scrolling list.
- Light/Dark mode toggle.
- Type-safe API using [TRPC](https://trpc.io/).
- Type-safe database access using [Prisma](https://www.prisma.io/).
- Type-safe form state management using [react-hook-form](https://react-hook-form.com/).
- Automatic code linting and formatting on Git commit, using lint-staged, eslint and prettier

## Stack

- [TypeScript](https://www.typescriptlang.org/) (Language)
- [React](https://reactjs.org/) (UI framework)
- [Next.js](https://nextjs.org/) (React web application framework)
- [Postgres](https://www.postgresql.org/) (Database)
- [Prisma](https://www.prisma.io/) (Type-safe ORM / database client)
- [TRPC](https://trpc.io/) (End-to-end type-safe REST API)
- [react-hook-form](https://react-hook-form.com/) (React form state management)
- [Tailwind](https://tailwindcss.com/) (CSS utility framework)
- [DaisyUI](https://daisyui.com/) (Tailwind-based UI component library)
- [Playwright](https://playwright.dev/) (End-to-end testing framework)

## Requirements

- Node >= 20
- Docker (for running Postgres)

## Local Development Setup

```bash
npm i
npm run dev
```

## Commands

```bash
npm run build      # runs `prisma migrate` + `next build`
npm run db-nuke    # resets local db
npm run dev        # starts postgres db + runs migrations + seeds + starts next.js
npm run test-dev   # runs e2e tests on dev
npm run test-start # runs e2e tests on `next start` - build required before
npm run test:e2e   # runs e2e tests
```

## Local Developer Accounts

The seed data inserts example accounts for local development so you don't need to setup a Google OAuth client.

### Local Dev Account Credentials

| Username | Password | Roles                           |
| -------- | -------- | ------------------------------- |
| admin    | admin    | ADMIN (Which can delete Issues) |
| user     | user     |                                 |

## Environment variables for deployment

Needed for a production deployment, but working example values are provided in `.env` for local development.

Environment variables and their runtime validation are defined in the code at `src/server/env.js`.

### Database (Required)

```
DATABASE_URL=postgresql://my-username:my-password@example.com:5432/devdb
```

### Google account authentication (Optional)

Find out where to get these at https://next-auth.js.org/providers/google

```
GOOGLE_ID=example-id.apps.googleusercontent.com
GOOGLE_SECRET=example-secret
```

### Custom Admin account password

You can override the default Admin account password, e.g. for a public demo of the application where only an Admin with the password can log in.

You will need to make sure the Admin user from the seed data is already inserted into the database ( `npm run db-seed` )

```
ADMIN_PASSWORD=my-password
```
