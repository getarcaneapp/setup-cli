import { readFile } from 'node:fs/promises'

import { parse } from 'yaml'

const action = parse(await readFile(new URL('../action.yml', import.meta.url), 'utf8'))

assert(action.name === 'Setup Arcane CLI', 'action.yml name must be Setup Arcane CLI')
assert(action.runs?.using === 'node24', 'action.yml must use node24')
assert(action.runs?.main === 'dist/index.js', 'action.yml must run dist/index.js')
assert(action.inputs?.version?.default === 'latest', 'version input must default to latest')
assert(action.inputs?.['github-token'], 'github-token input must be declared')
assert(action.outputs?.version, 'version output must be declared')
assert(action.outputs?.path, 'path output must be declared')
assert(action.outputs?.['cache-hit'], 'cache-hit output must be declared')

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}
