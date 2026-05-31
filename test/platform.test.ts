import { describe, expect, test } from 'vitest'

import { resolvePlatform } from '../src/pkg/utils/platform.js'

describe('resolvePlatform', () => {
  test('maps Linux x64 runners to the Arcane amd64 asset', () => {
    expect(resolvePlatform('linux', 'x64')).toEqual({
      archiveName: 'arcane-cli_linux_amd64.tar.gz',
      cacheArch: 'linux-amd64',
      os: 'linux',
      arch: 'amd64',
    })
  })

  test('maps macOS arm64 runners to the Arcane darwin arm64 asset', () => {
    expect(resolvePlatform('darwin', 'arm64')).toEqual({
      archiveName: 'arcane-cli_darwin_arm64.tar.gz',
      cacheArch: 'darwin-arm64',
      os: 'darwin',
      arch: 'arm64',
    })
  })

  test('rejects Windows until Arcane publishes a Windows CLI artifact', () => {
    expect(() => resolvePlatform('win32', 'x64')).toThrow('Unsupported runner platform win32/x64')
  })
})
