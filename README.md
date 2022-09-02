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
npm i
npm run dx
```

## Commands

```bash
npm run build      # runs `prisma generate` + `prisma migrate` + `next build`
npm run db-nuke    # resets local db
npm run dev        # starts next.js
npm run dx         # starts postgres db + runs migrations + seeds + starts next.js
npm test           # runs normal jest unit tests
npm run test-dev   # runs e2e tests on dev
npm run test-start # runs e2e tests on `next start` - build required before
npm run test:e2e   # runs e2e tests
```
