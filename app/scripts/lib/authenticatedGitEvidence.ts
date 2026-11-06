// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { realpathSync } from 'node:fs'
import { devNull } from 'node:os'
import { spawnSync } from 'node:child_process'

export interface GitEvidenceArtifact { path: string; gitCommit: string; sha256: string }
const requireValue = (value: unknown, message: string): void => { if (!value) throw new Error(message) }
export const validateGitEvidencePath = (path: unknown): string => {
  requireValue(typeof path === 'string' && path && !path.startsWith('/') && !path.includes('\\') && !path.includes('\0')
    && path.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe visualization evidence path')
  return String(path)
}

/** Git transports bytes; raw framing/OIDs, parents and path inclusion establish authority. */
export const createAuthenticatedGitEvidenceReader = (options: { repositoryRoot: string; acceptedRepositoryCommit?: string }) => {
  const root = realpathSync(options.repositoryRoot)
  const env = { ...process.env, GIT_NO_REPLACE_OBJECTS: '1', GIT_GRAFT_FILE: devNull }
  for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES']) {
    delete env[key as keyof typeof env]
  }
  const git = (...args: string[]) => spawnSync('git', ['--no-replace-objects', '-C', root, '--literal-pathspecs', ...args],
    { env, maxBuffer: 96 * 1024 * 1024 })
  const anchorQuery = options.acceptedRepositoryCommit ? undefined : git('rev-parse', 'HEAD')
  const anchor = options.acceptedRepositoryCommit ?? anchorQuery?.stdout.toString().trim() ?? ''
  requireValue(/^[0-9a-f]{40}$/u.test(anchor), 'An exact external accepted repository commit is required')
  const graphObjects = new Map<string, Buffer>()
  const object = (id: string, kind: 'commit' | 'tree' | 'blob', optional = false): Buffer | null => {
    requireValue(/^[0-9a-f]{40}$/u.test(id), 'Invalid original Git object ID')
    const key = kind + ':' + id
    if (kind !== 'blob' && graphObjects.has(key)) return graphObjects.get(key)!
    const result = git('cat-file', kind, id)
    if (optional && result.status !== 0) return null
    requireValue(result.status === 0, 'Original Git ' + kind + ' object unavailable')
    const raw = Buffer.from(result.stdout)
    const actual = createHash('sha1').update(Buffer.concat([Buffer.from(`${kind} ${raw.length}\0`), raw])).digest('hex')
    requireValue(actual === id, 'Original Git ' + kind + ' object OID differs')
    // Only authenticated immutable graph bytes are retained. Image/blob buffers
    // remain local to each artifact read, avoiding an unbounded image cache.
    if (kind !== 'blob') graphObjects.set(key, raw)
    return raw
  }
  const commits = new Map<string, { tree: string; parents: readonly string[] }>()
  const commit = (id: string, optional = false) => {
    if (commits.has(id)) return commits.get(id)!
    const raw = object(id, 'commit', optional)
    if (!raw) return null
    const headers = raw.toString('utf8').split('\n\n', 1)[0].split('\n')
    const tree = /^tree ([0-9a-f]{40})$/u.exec(headers[0])?.[1]
    const parentLines = headers.filter(line => line.startsWith('parent '))
    requireValue(tree && parentLines.every(line => /^parent [0-9a-f]{40}$/u.test(line)), 'Malformed authenticated Git commit')
    const result = Object.freeze({ tree: tree!, parents: Object.freeze(parentLines.map(line => line.slice(7))) })
    commits.set(id, result)
    return result
  }
  commit(anchor)
  const ancestors = new Set<string>([anchor])
  const proveAncestor = (target: string): void => {
    if (ancestors.has(target)) return
    const pending = [anchor], seen = new Set<string>()
    while (pending.length) {
      const id = pending.pop()!
      if (seen.has(id)) continue
      seen.add(id)
      const node = commit(id, true)
      // A genuinely shallow/off-path missing object cannot invent a parent
      // edge. A target qualifies only through a complete authenticated path.
      if (!node) continue
      if (id === target) { ancestors.add(target); return }
      pending.push(...[...node.parents].reverse())
    }
    throw new Error('Original evidence commit is not in authenticated accepted history')
  }
  return {
    root, acceptedRepositoryCommit: anchor,
    readArtifact(binding: GitEvidenceArtifact): Buffer {
      const path = validateGitEvidencePath(binding.path)
      requireValue(/^[0-9a-f]{40}$/u.test(binding.gitCommit) && /^[0-9a-f]{64}$/u.test(binding.sha256), 'Invalid original Git artifact binding')
      proveAncestor(binding.gitCommit)
      let tree = commit(binding.gitCommit)!.tree
      const parts = path.split('/')
      for (let part = 0; part < parts.length; part++) {
        const raw = object(tree, 'tree')!
        let index = 0
        const matches: Array<{ mode: string; oid: string }> = []
        while (index < raw.length) {
          const space = raw.indexOf(0x20, index), zero = raw.indexOf(0, space + 1)
          requireValue(space > index && zero > space && zero + 21 <= raw.length, 'Malformed authenticated Git tree')
          if (raw.subarray(space + 1, zero).toString('utf8') === parts[part]) {
            matches.push({ mode: raw.subarray(index, space).toString(), oid: raw.subarray(zero + 1, zero + 21).toString('hex') })
          }
          index = zero + 21
        }
        requireValue(matches.length === 1, 'Original evidence path is absent or ambiguous')
        const selected = matches[0]
        if (part + 1 < parts.length) {
          requireValue(selected.mode === '40000', 'Original evidence parent is not an authenticated directory')
          tree = selected.oid
        } else {
          requireValue(selected.mode === '100644' || selected.mode === '100755', 'Original evidence is not the exact regular Git file')
          const blob = object(selected.oid, 'blob')!
          requireValue(createHash('sha256').update(blob).digest('hex') === binding.sha256, 'Original Git evidence hash differs')
          return blob
        }
      }
      throw new Error('Original evidence path is missing')
    },
  }
}
