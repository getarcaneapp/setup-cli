import { access, chmod, copyFile, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import * as toolCache from '@actions/tool-cache'

import type { InstallArcaneCliOptions, InstallResult } from '../../types/install.js'
import { findExpectedChecksum, verifyChecksum } from './checksum.js'

const toolName = 'arcane-cli'

export async function installArcaneCli(options: InstallArcaneCliOptions): Promise<InstallResult> {
  const cachedPath = options.findCachedTool(toolName, options.version, options.cacheArch)
  if (cachedPath) {
    return {
      cacheHit: true,
      path: cachedPath,
      version: options.version,
    }
  }

  const archiveBytes = await options.downloadArchive()
  const checksums = await options.downloadChecksums()
  const expectedChecksum = findExpectedChecksum(checksums, options.archiveName)
  verifyChecksum(archiveBytes, expectedChecksum)

  const tempRoot = await mkdtemp(join(tmpdir(), 'setup-arcane-cli-'))
  try {
    const archivePath = join(tempRoot, options.archiveName)
    await writeFile(archivePath, archiveBytes)
    const preparedPath = await options.prepareTool(archivePath, options.version, options.cacheArch)

    return {
      cacheHit: false,
      path: preparedPath,
      version: options.version,
    }
  } finally {
    await rm(tempRoot, { force: true, recursive: true })
  }
}

export async function downloadArchiveBytes(url: string): Promise<Buffer> {
  const archivePath = await toolCache.downloadTool(url)
  try {
    return await readFile(archivePath)
  } finally {
    await rm(archivePath, { force: true })
  }
}

export async function prepareArcaneCliTool(archivePath: string, version: string, cacheArch: string): Promise<string> {
  const extractDir = await toolCache.extractTar(archivePath)
  const binDir = await mkdtemp(join(tmpdir(), 'arcane-cli-bin-'))

  try {
    const executablePath = await findArcaneCliExecutable(extractDir)
    const targetPath = join(binDir, toolName)

    await copyFile(executablePath, targetPath)
    await chmod(targetPath, 0o755)

    return await toolCache.cacheDir(binDir, toolName, version, cacheArch)
  } finally {
    await rm(binDir, { force: true, recursive: true })
    await rm(extractDir, { force: true, recursive: true })
  }
}

async function findArcaneCliExecutable(root: string): Promise<string> {
  const entries = await readdir(root)
  for (const entry of entries) {
    const entryPath = join(root, entry)
    const entryStat = await stat(entryPath)
    if (entryStat.isDirectory()) {
      try {
        return await findArcaneCliExecutable(entryPath)
      } catch (error) {
        if (!(error instanceof Error) || !error.message.startsWith('Unable to locate arcane-cli')) {
          throw error
        }
      }
    }

    if (entry === toolName && entryStat.isFile()) {
      await access(entryPath, constants.R_OK)
      return entryPath
    }
  }

  throw new Error(`Unable to locate arcane-cli in extracted archive ${root}`)
}
