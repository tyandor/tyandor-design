/** @type {import('next').NextConfig} */
// Both workspace packages ship raw TS/TSX rather than pre-built JS, so Next
// transpiles them here.
//   @tyandor/fonts: pre-building breaks next/font/local, which parses its
//     arguments straight out of the AST.
//   @tyandor/ui: shipping source keeps the package free of a bundler, and
//     lets consumers' own compilers decide the target.
const nextConfig = {
  transpilePackages: ["@tyandor/fonts", "@tyandor/ui"],
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
