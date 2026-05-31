set shell := ["bash", "-euo", "pipefail", "-c"]

format target:
    if [ "{{target}}" != "all" ]; then echo "unknown format target: {{target}}" >&2; exit 1; fi
    pnpm format

lint target:
    if [ "{{target}}" != "all" ]; then echo "unknown lint target: {{target}}" >&2; exit 1; fi
    pnpm format:check
    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm validate:action
