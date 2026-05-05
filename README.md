# Toby의 개발 블로그

Astro 기반 정적 블로그입니다. GitHub Pages 배포 경로는 `https://e-know.github.io/tobydev/`입니다.

## Scripts

```sh
npm ci
npm run dev
npm run build
npm run preview
npm run lint
npm run format:check
```

## Content

- 실제 게시글은 `src/data/blog/`에 둡니다.
- 공개 전 초안은 frontmatter에 `draft: true`를 지정합니다.
- 정적 검색 인덱스는 `npm run build` 중 `public/pagefind/`로 생성됩니다.

## Deploy

`.github/workflows/deploy.yml`이 `npm ci`와 `npm run build`를 실행한 뒤 `dist/`를 GitHub Pages에 배포합니다.
