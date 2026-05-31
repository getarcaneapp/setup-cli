import { describe, expect, test } from 'vitest'

import { normalizeVersionInput, resolveVersionFromReleases } from '../src/pkg/utils/version.js'
import type { GitHubRelease } from '../src/types/github.js'

const releases: GitHubRelease[] = [
  {
    assets: [],
    draft: false,
    prerelease: false,
    tag_name: 'v2.1.0',
  },
  {
    assets: [],
    draft: false,
    prerelease: true,
    tag_name: 'v2.2.0-beta.1',
  },
  {
    assets: [],
    draft: false,
    prerelease: false,
    tag_name: 'v2.0.3',
  },
  {
    assets: [],
    draft: true,
    prerelease: false,
    tag_name: 'v2.3.0',
  },
  {
    assets: [],
    draft: false,
    prerelease: false,
    tag_name: 'cli/v1.19.5',
  },
]

describe('version utilities', () => {
  test('normalizes exact version inputs to GitHub release tags', () => {
    expect(normalizeVersionInput('1.19.5')).toEqual({ kind: 'exact', tag: 'v1.19.5', version: '1.19.5' })
    expect(normalizeVersionInput('v1.19.5')).toEqual({ kind: 'exact', tag: 'v1.19.5', version: '1.19.5' })
  })

  test('leaves latest as a release lookup sentinel', () => {
    expect(normalizeVersionInput('latest')).toEqual({ kind: 'latest' })
    expect(normalizeVersionInput('')).toEqual({ kind: 'latest' })
  })

  test('treats semver ranges as range selectors', () => {
    expect(normalizeVersionInput('2.x')).toEqual({ kind: 'range', range: '2.x' })
  })

  test('resolves the newest stable release for a semver range', () => {
    const resolved = resolveVersionFromReleases(releases, '2.x')

    expect(resolved.tag_name).toBe('v2.1.0')
  })

  test('rejects ranges that do not match a stable release', () => {
    expect(() => resolveVersionFromReleases(releases, '3.x')).toThrow(
      'No Arcane CLI release found for version range 3.x',
    )
  })
})
