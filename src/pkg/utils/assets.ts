import type { GitHubRelease, GitHubReleaseAsset } from '../../types/github.js'

export function findReleaseAsset(release: GitHubRelease, assetName: string): GitHubReleaseAsset {
  const asset = release.assets.find((candidate) => candidate.name === assetName)
  if (!asset) {
    throw new Error(`Release ${release.tag_name} does not include ${assetName}`)
  }
  return asset
}

export function findChecksumAsset(release: GitHubRelease, version: string): GitHubReleaseAsset {
  const exactName = `arcane_${version}_checksums.txt`
  const asset = release.assets.find((candidate) => candidate.name === exactName)
  if (asset) {
    return asset
  }

  const fallback = release.assets.find((candidate) => /^arcane_.+_checksums\.txt$/.test(candidate.name))
  if (fallback) {
    return fallback
  }

  throw new Error(`Release ${release.tag_name} does not include ${exactName}`)
}
