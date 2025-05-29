# git-broom

A tiny wrapper for `git clean -dxff` that:

- Prompts before removing untracked files
- Supports a `.gitbroomignore` file for custom exceptions
- Defaults to excluding `/_local` and `/.idea` directories

Use case: clean up your repository while preserving selected files/dirs.

## Usage

```bash
npx -y git-broom
```

## Development

```bash
# from the package folder
npx -y ."$(npm pack --silent)"

# or, pack then run from anywhere
npm pack && npx -y -p ./git-broom-1.0.0.tgz git-broom
```
