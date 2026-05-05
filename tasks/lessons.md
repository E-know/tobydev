# Lessons

## 2026-05-05

- Before creating or updating a PR, inspect CI-sensitive files in the branch diff, especially package manager lockfiles. Do not assume the package manager from the failing CI message alone; verify `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, and workflow commands together before choosing the fix.
