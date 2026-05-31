import { HttpClient } from '@actions/http-client'

import type { GitHubRelease } from '../../types/github.js'
import { normalizeVersionInput, resolveVersionFromReleases } from './version.js'

const githubApiBase = 'https://api.github.com/repos/getarcaneapp/arcane'

export class GitHubReleaseClient {
  private readonly client: HttpClient
  private readonly headers: Record<string, string>

  constructor(token: string, client = new HttpClient('getarcaneapp/setup-cli')) {
    this.client = client
    this.headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'getarcaneapp/setup-cli',
      'X-GitHub-Api-Version': '2022-11-28',
    }

    const trimmedToken = token.trim()
    if (trimmedToken) {
      this.headers.Authorization = `Bearer ${trimmedToken}`
    }
  }

  async resolveRelease(versionInput: string): Promise<GitHubRelease> {
    const normalized = normalizeVersionInput(versionInput)

    switch (normalized.kind) {
      case 'latest':
        return this.getRelease(`${githubApiBase}/releases/latest`)
      case 'exact':
        return this.getRelease(`${githubApiBase}/releases/tags/${encodeURIComponent(normalized.tag)}`)
      case 'range':
        return resolveVersionFromReleases(await this.listReleases(), normalized.range)
    }
  }

  async downloadText(url: string): Promise<string> {
    const response = await this.client.get(url, this.headers)
    if (response.message.statusCode !== 200) {
      throw new Error(`Failed to download ${url}: HTTP ${response.message.statusCode ?? 'unknown'}`)
    }
    return response.readBody()
  }

  private async getRelease(url: string): Promise<GitHubRelease> {
    const response = await this.client.getJson<GitHubRelease>(url, this.headers)
    if (!response.result) {
      throw new Error(`No Arcane release found at ${url}: HTTP ${response.statusCode}`)
    }
    return response.result
  }

  private async listReleases(): Promise<GitHubRelease[]> {
    const response = await this.client.getJson<GitHubRelease[]>(`${githubApiBase}/releases?per_page=100`, this.headers)
    if (!response.result) {
      throw new Error(`No Arcane releases returned by GitHub: HTTP ${response.statusCode}`)
    }
    return response.result
  }
}
