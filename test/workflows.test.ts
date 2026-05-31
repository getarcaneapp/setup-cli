import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { parse } from 'yaml'
import { describe, expect, test } from 'vitest'

async function readWorkflow(name: string) {
  const path = join(process.cwd(), '.github', 'workflows', name)
  const source = await readFile(path, 'utf8')

  return {
    source,
    workflow: parse(source) as Record<string, unknown>,
  }
}

describe('GitHub workflows', () => {
  test('CI runs actionlint from the downloaded binary instead of an action reference', async () => {
    const { source } = await readWorkflow('ci.yml')

    expect(source).not.toContain('uses: rhysd/actionlint@')
    expect(source).toContain('download-actionlint.bash')
    expect(source).toContain('./actionlint -color')
  })

  test('release workflow publishes immutable, major, and minor action tags', async () => {
    const { source, workflow } = await readWorkflow('release.yml')

    expect(workflow.name).toBe('Release')
    expect(source).toContain('args=(release create "$RELEASE_VERSION"')
    expect(source).toContain('gh "${args[@]}"')
    expect(source).toContain('git tag "$RELEASE_VERSION" "$GITHUB_SHA"')
    expect(source).toContain('git tag -f "$MAJOR_VERSION" "$GITHUB_SHA"')
    expect(source).toContain('git tag -f "$MINOR_VERSION" "$GITHUB_SHA"')
    expect(source).toContain('git push --force origin "refs/tags/$MAJOR_VERSION"')
    expect(source).toContain('git push --force origin "refs/tags/$MINOR_VERSION"')
  })
})
