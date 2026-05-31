export interface GitHubReleaseAsset {
  browser_download_url: string
  name: string
}

export interface GitHubRelease {
  assets: GitHubReleaseAsset[]
  draft: boolean
  prerelease: boolean
  tag_name: string
}
