const BASE_URL = import.meta.env.BASE_URL;

function trimTrailingSlash(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function withBase(path: string) {
  if (
    /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(path) ||
    path.startsWith("#") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  ) {
    return path;
  }

  const base = trimTrailingSlash(BASE_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${normalizedPath}` || "/";
}

export function stripBase(path: string) {
  const base = trimTrailingSlash(BASE_URL);

  if (!base || base === "/") return path;
  if (path === base) return "/";
  if (path.startsWith(`${base}/`)) return path.slice(base.length) || "/";

  return path;
}
