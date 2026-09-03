// Tailwind 4 wires through PostCSS; no per-project config beyond this.
// The theme is expressed as `@theme` blocks inside globals.css, not here.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
