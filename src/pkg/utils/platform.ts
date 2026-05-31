import type { PlatformAsset } from '../../types/platform.js'

const supportedPlatforms = 'linux and darwin runners with x64, arm64, ia32, or arm architectures'

export function resolvePlatform(platform = process.platform, arch = process.arch): PlatformAsset {
  const os = normalizeOS(platform)
  const mappedArch = normalizeArch(arch)

  if (!os || !mappedArch || (os === 'darwin' && mappedArch !== 'amd64' && mappedArch !== 'arm64')) {
    throw new Error(
      `Unsupported runner platform ${platform}/${arch}. Arcane CLI setup currently supports ${supportedPlatforms}.`,
    )
  }

  return {
    archiveName: `arcane-cli_${os}_${mappedArch}.tar.gz`,
    cacheArch: `${os}-${mappedArch}`,
    os,
    arch: mappedArch,
  }
}

function normalizeOS(platform: string): 'linux' | 'darwin' | undefined {
  switch (platform) {
    case 'linux':
      return 'linux'
    case 'darwin':
      return 'darwin'
    default:
      return undefined
  }
}

function normalizeArch(arch: string): 'amd64' | 'arm64' | '386' | 'armv7' | undefined {
  switch (arch) {
    case 'x64':
      return 'amd64'
    case 'arm64':
      return 'arm64'
    case 'ia32':
      return '386'
    case 'arm':
      return 'armv7'
    default:
      return undefined
  }
}
