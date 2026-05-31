import { describe, expect, test } from 'vitest'

import { findExpectedChecksum, verifyChecksum } from '../src/pkg/utils/checksum.js'

describe('checksum utilities', () => {
  test('finds checksums when GoReleaser prefixes artifact paths', () => {
    const checksums = [
      '9999999999999999999999999999999999999999999999999999999999999999  dist/arcane-cli_linux_amd64_v1/arcane-cli',
      '4f3c2b1a00000000000000000000000000000000000000000000000000000000  arcane-cli_linux_amd64.tar.gz',
    ].join('\n')

    expect(findExpectedChecksum(checksums, 'arcane-cli_linux_amd64.tar.gz')).toBe(
      '4f3c2b1a00000000000000000000000000000000000000000000000000000000',
    )
  })

  test('throws when the requested artifact is absent from checksums', () => {
    expect(() =>
      findExpectedChecksum('abc123  arcane-cli_linux_arm64.tar.gz', 'arcane-cli_linux_amd64.tar.gz'),
    ).toThrow('No checksum found for arcane-cli_linux_amd64.tar.gz')
  })

  test('verifies a SHA-256 checksum from file bytes', () => {
    expect(() =>
      verifyChecksum(Buffer.from('arcane'), '25b380d8dad7cb1672d367fac20393aa6e343c266e4b721c5db5fb8dbc0940f9'),
    ).not.toThrow()
  })

  test('rejects a mismatched checksum', () => {
    expect(() =>
      verifyChecksum(Buffer.from('arcane'), '0000000000000000000000000000000000000000000000000000000000000000'),
    ).toThrow('Checksum verification failed')
  })
})
