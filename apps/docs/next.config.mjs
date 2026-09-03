/** @type {import('next').NextConfig} */
// PLAN.md phase 2: @tyandor/fonts ships raw TS (src/next.ts) so Next has to
// transpile it here. The alternative -- pre-building to JS -- breaks
// next/font/local, which parses its arguments straight out of the AST.
const nextConfig = {
  transpilePackages: ["@tyandor/fonts"],
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
