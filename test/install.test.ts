import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { afterEach, describe, expect, test } from 'vitest'

import { installArcaneCli } from '../src/pkg/utils/install.js'

const tempRoots: string[] = []

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((path) => rm(path, { force: true, recursive: true })))
})

async function makeTempRoot() {
  const root = await mkdtemp(join(tmpdir(), 'setup-arcane-cli-test-'))
  tempRoots.push(root)
  return root
}

describe('installArcaneCli', () => {
  test('returns cached tool paths without downloading', async () => {
    const result = await installArcaneCli({
      archiveName: 'arcane-cli_linux_amd64.tar.gz',
      cacheArch: 'linux-amd64',
      downloadArchive: () => Promise.resolve(Buffer.from('unused')),
      downloadChecksums: () => Promise.resolve('unused'),
      findCachedTool: () => '/tool/cache/arcane-cli',
      prepareTool: () => Promise.reject(new Error('prepareTool should not run on cache hit')),
      version: '1.19.5',
    })

    expect(result).toEqual({
      cacheHit: true,
      path: '/tool/cache/arcane-cli',
      version: '1.19.5',
    })
  })

  test('downloads, verifies, prepares, and caches the CLI on cache miss', async () => {
    const root = await makeTempRoot()
    const archiveBytes = Buffer.from('arcane')

    const result = await installArcaneCli({
      archiveName: 'arcane-cli_linux_amd64.tar.gz',
      cacheArch: 'linux-amd64',
      downloadArchive: () => Promise.resolve(archiveBytes),
      downloadChecksums: () =>
        Promise.resolve(
          '25b380d8dad7cb1672d367fac20393aa6e343c266e4b721c5db5fb8dbc0940f9  arcane-cli_linux_amd64.tar.gz',
        ),
      findCachedTool: () => '',
      prepareTool: async (archivePath) => {
        const binDir = join(root, 'bin')
        const bytes = await readFile(archivePath)
        await writeFile(join(root, 'archive-copy'), bytes)
        return binDir
      },
      version: '1.19.5',
    })

    expect(await readFile(join(root, 'archive-copy'), 'utf8')).toBe('arcane')
    expect(result).toEqual({
      cacheHit: false,
      path: join(root, 'bin'),
      version: '1.19.5',
    })
  })
})
