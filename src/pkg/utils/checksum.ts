import { createHash, timingSafeEqual } from 'node:crypto'
import { basename } from 'node:path'

const checksumPattern = /^([a-fA-F0-9]{64})\s+[* ]?(.+)$/

export function findExpectedChecksum(checksums: string, archiveName: string): string {
  for (const line of checksums.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) {
      continue
    }

    const match = checksumPattern.exec(trimmed)
    if (!match) {
      continue
    }

    const digest = match[1]
    const artifactPath = match[2]?.trim()
    if (!digest || !artifactPath) {
      continue
    }

    if (
      artifactPath === archiveName ||
      basename(artifactPath) === archiveName ||
      artifactPath.endsWith(`/${archiveName}`)
    ) {
      return digest.toLowerCase()
    }
  }

  throw new Error(`No checksum found for ${archiveName}`)
}

export function verifyChecksum(bytes: Buffer, expectedChecksum: string): void {
  const actual = createHash('sha256').update(bytes).digest('hex')
  const expected = expectedChecksum.toLowerCase()
  const actualBytes = Buffer.from(actual, 'hex')
  const expectedBytes = Buffer.from(expected, 'hex')

  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    throw new Error(`Checksum verification failed: expected ${expected}, got ${actual}`)
  }
}
