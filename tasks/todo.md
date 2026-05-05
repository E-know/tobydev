# Project Cleanup and Verification

## Checklist

- [x] Inspect tracked and generated files for safe cleanup candidates.
- [x] Remove only files/config that are unused or generated and do not change intended site behavior.
- [x] Re-run format/lint/build checks after cleanup.
- [x] Start a local preview/dev server and verify the site opens in a browser.
- [x] Record evidence, risks, and final result.

## Review

- Removed AstroPaper template/demo material from the active blog: sample posts, release notes, demo images, upstream changelog/Lighthouse asset, and GitHub issue/community templates. The live collection now contains only `src/data/blog/2026-05-03-hello-world.md`.
- Removed stale npm-incompatible config: `pnpm-workspace.yaml` and `cz.yaml`.
- Kept Docker support but made it consistent with npm by using `package-lock.json`, `npm ci`, and `npm run build`; fixed `.dockerignore` so `.astro` source files are no longer excluded.
- Replaced the template README with a concise project README and renamed the package to `tobydev-blog`.
- Removed generated/local clutter before the fresh build: `.astro`, `dist`, `public/pagefind`, and all `.DS_Store` files. `npm run build` regenerated `dist` and `public/pagefind`.
- Verification passed: `npm run format:check`, `npm run lint`, and `npm run build`.
- The first sandboxed build failed only because Google Fonts network access was blocked during OG image generation; rerunning `npm run build` with network permission completed successfully.
- Opened `http://127.0.0.1:4321/tobydev/` in the in-app browser. Verified the homepage title and heading, one visible post link, no visible `AstroPaper` text, and zero console errors.
- Opened `http://127.0.0.1:4321/tobydev/posts/2026-05-03-hello-world/`. Verified the post heading, Swift code block text, and zero console errors.
- Opened `http://127.0.0.1:4321/tobydev/search/`. Verified the Search page, search input, and zero console errors.

# GitHub Pages Layout Fix

## Checklist

- [x] Inspect Astro and package configuration for site/base/output settings.
- [x] Inspect path helpers and layout/header code for hardcoded root-relative URLs.
- [x] Build locally and inspect generated HTML/CSS asset links.
- [x] Compare generated paths against expected GitHub Pages project URL behavior.
- [x] Document root cause, evidence, and recommended fix.
- [x] Configure Astro for the `E-know/tobydev` GitHub Pages project URL.
- [x] Rewrite internal navigation/public asset links so they respect Astro `base`.
- [x] Rebuild and verify generated HTML uses `/tobydev/` asset paths.
- [x] Record final verification results.
- [x] Fix existing project-wide Prettier failures.
- [x] Verify full `npm run format:check`, `npm run lint`, and `npm run build`.
- [x] Stage only GitHub Pages layout/build related files.
- [x] Create a Korean conventional commit for the fix.
- [x] Push the commit to the current GitHub branch.

## Review

- `git remote -v` shows this is `E-know/tobydev`, so the default GitHub Pages project URL is expected to be `https://e-know.github.io/tobydev/`.
- `src/config.ts` has `SITE.website: "https:///E-know.github.io"`, which is malformed and omits the `/tobydev/` project path.
- `astro.config.ts` sets `site: SITE.website` but does not set Astro `base`, so generated static assets are root-relative.
- Verified with `npm run build`: `dist/index.html` contains `href="/_astro/about.BSoW0h3m.css"` and `src="/_astro/ClientRouter...js"`. On a project Pages URL, those resolve to `https://e-know.github.io/_astro/...` instead of `https://e-know.github.io/tobydev/_astro/...`, causing CSS/JS 404s and the broken layout.
- Secondary issue: many app links are hardcoded as `/posts`, `/tags`, `/rss.xml`, etc. Those will also jump to the user-site root unless rewritten through Astro base-aware helpers.
- Implemented `withBase`/`stripBase` helpers and applied them to navigation, breadcrumbs, post/tag paths, RSS/sitemap/favicon links, and Pagefind search bundle loading.
- `npm run build` passes after the fix. Verified generated HTML contains `/tobydev/_astro/...`, `/tobydev/posts...`, `/tobydev/pagefind/...`, and sitemap/RSS URLs under `https://e-know.github.io/tobydev/...`.
- `npm run lint` passes.
- `npx prettier --check` on changed files passes.
- Formatted the existing project-wide Prettier failures in `.github/workflows/deploy.yml`, `src/content/blog/2026-05-03-hello-world.md`, and `src/data/blog/2026-05-03-hello-world.md`.
- Full verification now passes: `npm run format:check`, `npm run lint`, and `npm run build`.
- The final `npm run build` required network access for Google Fonts during OG image generation; after allowing that, the build completed successfully.
- Created commit `782981b` with message `🐛 fix: GitHub Pages 경로 깨짐 수정`.
- Pushed `main` to `origin/main` successfully.

# Google SEO Improvements

## Checklist

- [x] Review Google Search Central guidance for titles, descriptions, canonical URLs, crawlable links, sitemap, and structured data.
- [x] Inspect current page/layout metadata, RSS, robots, sitemap, and post schemas.
- [x] Implement safer page-type-specific SEO metadata and structured data.
- [x] Verify generated HTML for canonical URLs, JSON-LD, sitemap, robots, and base-aware links.
- [x] Run full project checks.

## Review

- Google recommends clear unique titles, page-specific meta descriptions, crawlable links, sitemap URLs, canonical URL signals, and valid structured data placed on the page it describes.
- Updated site identity from AstroPaper template defaults to Toby's developer blog: Korean site description, `lang="ko"`, GitHub profile, and real GitHub social link.
- Reworked `Layout.astro` so normal pages emit `WebPage` JSON-LD and blog posts emit `BlogPosting` JSON-LD only when article dates are available.
- Added canonical URL normalization against `https://e-know.github.io/tobydev/`, Open Graph locale/site/type metadata, article keywords, and `noindex, follow` support for non-content pages.
- Marked Search and 404 pages as `noindex`, and removed `/search/` from the generated sitemap to avoid mixed indexing signals.
- Replaced the homepage and About page AstroPaper template copy with Korean blog-specific content.
- Verified generated output: home/search/post pages use `lang="ko"`; post pages include `BlogPosting`; search has `noindex, follow`; robots points to the project sitemap; sitemap URLs use `https://e-know.github.io/tobydev/` and exclude `/search/`.
- Full verification passes: `npm run format:check`, `npm run lint`, and `npm run build`.

# Pull Request to main

## Checklist

- [x] Confirm current branch, remote, and working tree state.
- [x] Refresh remote refs and confirm `codex/initSetting` is based against latest `main`.
- [x] Inspect branch diff and commit summary for PR title/body.
- [x] Re-plan after confirming this project uses npm and `package-lock.json`.
- [x] Remove mistaken local pnpm artifacts created during investigation.
- [x] Update CI from pnpm commands/cache to npm commands/cache.
- [x] Run local verification with npm: `npm ci`, `npm run format:check`, `npm run lint`, and `npm run build`.
- [ ] Commit and push the CI package-manager fix to `codex/initSetting`.
- [ ] Create a pull request from `codex/initSetting` into `main`.
- [ ] Record PR URL and final verification result.

## Review

- Current branch is `codex/initSetting`, tracking `origin/codex/initSetting`.
- Local working tree was clean before PR preparation.
- Local comparison shows one commit on the branch ahead of `main`: `8deb47f` (`🔧 chore: 현재 작업 상태 정리`).
- CI reported `Dependencies lock file is not found ... Supported file patterns: pnpm-lock.yaml`, but this project uses npm: `package-lock.json` exists and deploy already runs `npm ci`.
- Root cause is `.github/workflows/ci.yml` using pnpm setup/cache/install commands in an npm project.
- Updated CI to use `actions/setup-node` with `cache: "npm"` and `npm ci` / `npm run ...` commands.
- Verified locally with `npm ci`, `npm run format:check`, `npm run lint`, and `npm run build`. The first sandboxed build failed only on Google Fonts DNS access; rerunning with network permission passed.

# Fix RunLoop Timezone Build Failure

## Checklist

- [x] Inspect the failing CI route and `Datetime` timezone usage.
- [x] Normalize malformed smart quotes in RunLoop frontmatter.
- [x] Search for any remaining malformed timezone/frontmatter values.
- [x] Run the same build command path that failed in CI.
- [x] Record root cause and verification results.

## Review

- Root cause: `src/data/blog/iOS/RunLoop.md` used smart quotes around frontmatter values, including `timezone: “Asia/Seoul"`. The parsed value was not the valid IANA timezone string `Asia/Seoul`, so `Date.toLocaleString` failed during static generation.
- Normalized `title`, `description`, `tags`, and `timezone` frontmatter to plain quoted YAML strings in both `src/data/blog/iOS/RunLoop.md` and the duplicate `src/RunLoop.md` copy.
- Confirmed no remaining smart quotes in Markdown/Astro content with `rg -n "[“”]" src tasks --glob '*.md' --glob '*.mdx' --glob '*.astro'`.
- `npm run build` passes after the fix. The first sandboxed build failed only because OG image generation could not reach `fonts.googleapis.com`; rerunning with network access completed `astro check`, `astro build`, Pagefind indexing, and the `public/pagefind` copy.
- `npm run format:check` passes.
