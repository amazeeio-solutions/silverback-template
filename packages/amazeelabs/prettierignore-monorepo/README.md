# .prettierignore for monorepos

Usage: `pnpm run --filter @amazeelabs/prettierignore-monorepo generate $PWD`

What it does:

- Collects all `.gitignore` and `.prettierignore` files in the given path
- Glues them into a single root `.prettierignore`
- Appends rules from the root `.prettierignore-append`
