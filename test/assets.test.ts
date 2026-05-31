import { describe, expect, test } from 'vitest'

import { findReleaseAsset, findChecksumAsset } from '../src/pkg/utils/assets.js'
import type { GitHubRelease } from '../src/types/github.js'

const release: GitHubRelease = {
  assets: [
    {
      browser_download_url: 'https://example.test/arcane-cli_linux_amd64.tar.gz',
      name: 'arcane-cli_linux_amd64.tar.gz',
    },
    {
      browser_download_url: 'https://example.test/arcane_1.19.5_checksums.txt',
      name: 'arcane_1.19.5_checksums.txt',
    },
  ],
  draft: false,
  prerelease: false,
  tag_name: 'v1.19.5',
}

describe('asset utilities', () => {
  test('selects the requested CLI archive asset', () => {
    expect(findReleaseAsset(release, 'arcane-cli_linux_amd64.tar.gz')?.browser_download_url).toBe(
      'https://example.test/arcane-cli_linux_amd64.tar.gz',
    )
  })

  test('selects the release checksum asset by resolved version', () => {
    expect(findChecksumAsset(release, '1.19.5')?.name).toBe('arcane_1.19.5_checksums.txt')
  })

  test('throws when the CLI archive is missing', () => {
    expect(() => findReleaseAsset(release, 'arcane-cli_darwin_arm64.tar.gz')).toThrow(
      'Release v1.19.5 does not include arcane-cli_darwin_arm64.tar.gz',
    )
  })
})
