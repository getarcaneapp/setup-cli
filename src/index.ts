import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'

import { findChecksumAsset, findReleaseAsset } from './pkg/utils/assets.js'
import { GitHubReleaseClient } from './pkg/utils/github.js'
import { downloadArchiveBytes, installArcaneCli, prepareArcaneCliTool } from './pkg/utils/install.js'
import { resolvePlatform } from './pkg/utils/platform.js'
import { releaseVersionFromTag } from './pkg/utils/version.js'

async function run(): Promise<void> {
  const requestedVersion = core.getInput('version') || 'latest'
  const githubToken = core.getInput('github-token')
  const platform = resolvePlatform()
  const releaseClient = new GitHubReleaseClient(githubToken)

  const release = await releaseClient.resolveRelease(requestedVersion)
  const version = releaseVersionFromTag(release.tag_name)
  const archiveAsset = findReleaseAsset(release, platform.archiveName)
  const checksumAsset = findChecksumAsset(release, version)

  const result = await installArcaneCli({
    archiveName: platform.archiveName,
    cacheArch: platform.cacheArch,
    downloadArchive: () => downloadArchiveBytes(archiveAsset.browser_download_url),
    downloadChecksums: () => releaseClient.downloadText(checksumAsset.browser_download_url),
    findCachedTool: toolCache.find,
    prepareTool: prepareArcaneCliTool,
    version,
  })

  core.addPath(result.path)
  core.setOutput('cache-hit', result.cacheHit ? 'true' : 'false')
  core.setOutput('path', result.path)
  core.setOutput('version', result.version)
  core.info(`arcane-cli ${result.version} is installed`)
}

void run().catch((error: unknown) => {
  if (error instanceof Error) {
    core.setFailed(error.message)
    return
  }

  core.setFailed(String(error))
})
