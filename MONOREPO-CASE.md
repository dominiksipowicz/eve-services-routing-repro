# Monorepo case: services function packaging drops node_modules

Superseded by the minimal repro:
**https://github.com/dominiksipowicz/eve-babel-repro**

Summary of what this branch's deployed variants established:

- On the affected production project, every web function crashes at boot with
  `Cannot find module 'next/setup-node-env'` when the explicit Services
  topology is used — the function bundles ship without node_modules.
- A 28-round bisect reduced the trigger to the presence of `@babel/core` in
  the install (arriving transitively via `@svgr/core`), even as a
  devDependency of a workspace package nothing imports.
- The same content is green on a freshly created project on another team,
  with all three cache layers (Vercel build cache, Turborepo remote cache,
  turbopack on-disk cache) verified cold on both sides — so the trigger needs
  a per-project/team platform co-factor, most plausibly the services/next
  builder version cohort. Production deployment IDs are shared privately with
  the Vercel services team.
- Ruled out by the variants on this branch (all green here): bun
  isolated-linker symlinks, Root Directory rooting, tracing config, config
  wrappers, next/eve versions, build machine type, mixed build caches, bun
  catalogs, duplicate peer-variant store entries.
