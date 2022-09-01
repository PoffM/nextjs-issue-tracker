# Nextjs Issue Tracker

Full-stack TypeScript Issue Tracker web application.

## Stack

* [TypeScript](https://www.typescriptlang.org/) (Language)
* [React](https://reactjs.org/) (UI framework)
* [Next.js](https://nextjs.org/) (React web application framework)
* [Postgres](https://www.postgresql.org/) (Database)
* [Prisma](https://www.prisma.io/) (Type-safe ORM / database client)
* [TRPC](https://trpc.io/) (End-to-end type-safe REST API)
* [react-hook-form](https://react-hook-form.com/) (React form state management)
* [Tailwind](https://tailwindcss.com/) (CSS utility framework)
* [DaisyUI](https://daisyui.com/) (Tailwind-based UI component library)
* [Jest](https://jestjs.io/) (Testing framework)
* [Playwright](https://playwright.dev/) (End-to-end testing framework)

## Requirements

- Node >= 16
- Docker (for running Postgres)

## Local Development Setup

```bash
yarn
yarn dx
```

## Commands

```bash
yarn build      # runs `prisma generate` + `prisma migrate` + `next build`
yarn db-nuke    # resets local db
yarn dev        # starts next.js
yarn dx         # starts postgres db + runs migrations + seeds + starts next.js
yarn test       # runs normal jest unit tests
yarn test-dev   # runs e2e tests on dev
yarn test-start # runs e2e tests on `next start` - build required before
yarn test:e2e   # runs e2e tests
```
