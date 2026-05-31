import semver from 'semver'

import type { GitHubRelease } from '../../types/github.js'

export type NormalizedVersionInput =
  | {
      kind: 'exact'
      tag: string
      version: string
    }
  | {
      kind: 'latest'
    }
  | {
      kind: 'range'
      range: string
    }

export function normalizeVersionInput(input: string): NormalizedVersionInput {
  const value = input.trim()
  if (!value || value.toLowerCase() === 'latest') {
    return { kind: 'latest' }
  }

  const exact = semver.valid(value)
  if (exact) {
    return {
      kind: 'exact',
      tag: `v${exact}`,
      version: exact,
    }
  }

  const range = semver.validRange(value)
  if (range) {
    return {
      kind: 'range',
      range: value,
    }
  }

  throw new Error(`Invalid Arcane CLI version input: ${input}`)
}

export function releaseVersionFromTag(tagName: string): string {
  const version = semver.clean(tagName)
  if (!version) {
    throw new Error(`Release tag ${tagName} is not a semantic version tag`)
  }
  return version
}

export function resolveVersionFromReleases(releases: GitHubRelease[], range: string): GitHubRelease {
  const candidates = releases
    .filter((release) => !release.draft && !release.prerelease)
    .map((release) => {
      const version = semver.clean(release.tag_name)
      return version ? { release, version } : undefined
    })
    .filter((candidate): candidate is { release: GitHubRelease; version: string } => candidate !== undefined)
    .filter((candidate) => semver.satisfies(candidate.version, range, { includePrerelease: false }))
    .sort((left, right) => semver.rcompare(left.version, right.version))

  const match = candidates[0]
  if (!match) {
    throw new Error(`No Arcane CLI release found for version range ${range}`)
  }

  return match.release
}
