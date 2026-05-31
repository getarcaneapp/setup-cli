export interface InstallResult {
  cacheHit: boolean
  path: string
  version: string
}

export interface InstallArcaneCliOptions {
  archiveName: string
  cacheArch: string
  downloadArchive: () => Promise<Buffer>
  downloadChecksums: () => Promise<string>
  findCachedTool: (toolName: string, version: string, cacheArch: string) => string
  prepareTool: (archivePath: string, version: string, cacheArch: string) => Promise<string>
  version: string
}
