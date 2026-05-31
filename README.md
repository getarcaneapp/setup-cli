# Arcane `setup-cli` GitHub Action

Installs `arcane-cli` in a GitHub Actions job so later workflow steps can run the Arcane CLI.

## Usage

Install the latest Arcane CLI release:

```yaml
steps:
  - uses: getarcaneapp/setup-cli@v1
  - run: arcane-cli --version
```

Install Arcane CLI v1.19.5:

```yaml
steps:
  - uses: getarcaneapp/setup-cli@v1
    with:
      version: 1.19.5
  - run: arcane-cli --version
```

Configure the CLI with workflow secrets before calling an Arcane server:

```yaml
steps:
  - uses: getarcaneapp/setup-cli@v1
    with:
      version: 1.19.5
  - run: |
      arcane-cli config set server-url "$ARCANE_SERVER_URL"
      arcane-cli config set api-key "$ARCANE_API_KEY"
      arcane-cli projects list
    env:
      ARCANE_SERVER_URL: ${{ secrets.ARCANE_SERVER_URL }}
      ARCANE_API_KEY: ${{ secrets.ARCANE_API_KEY }}
```

## Inputs

- `version` - Optional. Arcane CLI version to install. Defaults to `latest`. Accepts `latest`, exact versions like `1.19.5` or `v1.19.5`, and semver ranges like `1.x`.
- `github-token` - Optional. GitHub token used for release API calls. Useful if your workflow hits unauthenticated GitHub API rate limits.

## Outputs

- `version` - Resolved Arcane CLI version that was installed.
- `path` - Directory added to `PATH`.
- `cache-hit` - `true` when the tool came from the runner tool cache, otherwise `false`.

## Authentication

This action only installs `arcane-cli`. It does not request GitHub OIDC tokens, exchange credentials, or write Arcane config automatically.
