# preview.astro.new

[![Netlify Status](https://api.netlify.com/api/v1/badges/75bd0e18-9ce7-4124-b794-98f8dabc01a5/deploy-status)](https://app.netlify.com/sites/preview-astro-new/deploys)

Build and preview Astro’s official starter templates

## Commands

- `pnpm build` — Download all official Astro examples and build them
- `pnpm preview` — Serve the build output on <http://localhost:3000> (run `pnpm build` first)

## How does this work?

1. When examples in the Astro monorepo change, we run the [build script](./src/build.mjs) in this repo (`pnpm build`).

2. It downloads examples from the `astro` and `starlight` repositories to `.templates/` and installs dependencies for them (see [`src/download.mjs`](./src/download.mjs)).

3. For each example, it adds a [build script](./src/build-example.mjs) and then runs it in a subprocess for that example. (This allows each example to use its own versions of dependencies etc.) Each example is built with a `base` property matching its name and a custom integration which prefixes `base` in other places.

4. The build output for each example is moved to a subdirectory in `dist/`.

5. The totality of `dist/` can then be hosted as a static site with each example available at a subpath, e.g. `/blog/` pointing to the blog example, `/starlight-basics/` to the Starlight starter example, etc.
