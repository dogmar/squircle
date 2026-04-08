# CI Auto-Publish with semantic-release

## Overview

Automated package publishing for `@klinking/tw-squircle` using semantic-release, triggered on every push to `main`. Conventional Commits determine version bumps. PR titles are enforced to follow the convention. A separate CI workflow gates PRs with lint/test/build checks.

## Release Configuration

`.releaserc.json` at repo root. Branches: `["main"]`.

Plugins (in order):

1. `@semantic-release/commit-analyzer` — Angular preset, determines version bump
2. `@semantic-release/release-notes-generator` — generates changelog content
3. `@semantic-release/changelog` — writes `CHANGELOG.md` at repo root
4. `@semantic-release/npm` — `pkgRoot: "package"`, `provenance: true`; updates version in `package/package.json` and publishes
5. `@semantic-release/git` — commits `CHANGELOG.md` and `package/package.json` back to `main` with message `chore(release): ${nextRelease.version} [skip ci]`
6. `@semantic-release/github` — creates a GitHub Release with generated notes

The existing `prepublishOnly: "vp run build"` in `package/package.json` handles the build automatically during `npm publish`.

## Allowed Commit/PR Title Prefixes

| Prefix                                           | Version bump  |
| ------------------------------------------------ | ------------- |
| `feat`                                           | minor (0.x.0) |
| `feat!`, `fix!` (breaking)                       | major (x.0.0) |
| `fix`, `perf`                                    | patch (0.0.x) |
| `docs`, `chore`, `test`, `ci`, `style`, `revert` | no release    |

`refactor` and `build` prefixes are **not allowed**.

## GitHub Actions Workflows

### `ci.yml` — PR checks

- **Trigger:** `pull_request` targeting `main`
- **Steps:** checkout, `voidzero-dev/setup-vp@v1` (node 22, cache), `vp install`, `vp ready`
- Blocks merge if checks fail

### `pr-title.yml` — PR title convention enforcement

- **Trigger:** `pull_request` (types: `opened`, `edited`, `synchronize`)
- **Steps:** `thehanimo/pr-title-checker` with `.github/pr-title-checker.json` config
- Allowed prefixes: `feat`, `fix`, `perf`, `docs`, `chore`, `test`, `ci`, `style`, `revert`
- Rejects `refactor`, `build`, and anything else

### `release.yml` — auto-publish

- **Trigger:** `push` to `main`
- **Permissions:** `contents: write`, `issues: write`, `pull-requests: write`, `id-token: write`
- **Steps:** checkout (with `persist-credentials: false`), `voidzero-dev/setup-vp@v1` (node 22, cache), `vp install`, `npx semantic-release`
- **Auth:** npm trusted publishing via OIDC (no `NPM_TOKEN` secret). Env: `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`

## PR Template

`.github/pull_request_template.md` with an HTML comment block explaining how prefixes affect releases:

- `fix:`, `perf:` = patch
- `feat:` = minor
- `feat!:`, `fix!:` = major (breaking change)
- `docs:`, `chore:`, `test:`, `ci:`, `style:`, `revert:` = no release

## New Dependencies

Root `package.json` devDependencies:

- `semantic-release`
- `@semantic-release/changelog`
- `@semantic-release/git`

The `commit-analyzer`, `release-notes-generator`, `npm`, and `github` plugins ship with `semantic-release`.

## New/Modified Files

| File                               | Purpose                               |
| ---------------------------------- | ------------------------------------- |
| `.releaserc.json`                  | semantic-release config               |
| `.github/workflows/ci.yml`         | PR check workflow                     |
| `.github/workflows/pr-title.yml`   | PR title enforcement                  |
| `.github/workflows/release.yml`    | Auto-publish on push to main          |
| `.github/pr-title-checker.json`    | Config for thehanimo/pr-title-checker |
| `.github/pull_request_template.md` | PR template with prefix docs          |
| `package.json` (root)              | New devDependencies                   |

## One-Time Manual Setup

Configure npm trusted publishing on npmjs.com: link `@klinking/tw-squircle` to the `dogmar/tw-squircle` repo and `release.yml` workflow.
