// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */
const { env } = require("./src/server/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {
    NODE_ENV: env.NODE_ENV,
  },
};

module.exports = nextConfig;
