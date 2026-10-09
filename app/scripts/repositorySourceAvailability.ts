import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

export function createRepositorySourceAvailability(repoRoot: string): (repoPath: string) => boolean {
  const availability = new Map<string, boolean>()
  let gitRepository: boolean | undefined

  return (repoPath) => {
    const normalizedPath = repoPath.replace(/\\/g, '/')
    if (isAbsolute(normalizedPath) || normalizedPath.split('/').includes('..')) return false
    const cached = availability.get(normalizedPath)
    if (cached !== undefined) return cached

    if (gitRepository === undefined) {
      try {
        execFileSync('git', ['rev-parse', '--show-toplevel'], {
          cwd: repoRoot, stdio: 'ignore',
        })
        gitRepository = true
      } catch (error) {
        const failure = error as { status?: number; code?: string }
        if (failure.status !== 128 && failure.code !== 'ENOENT') throw error
        gitRepository = false
      }
    }

    // Query the exact source path. Listing the entire growing evidence tree
    // overflowed the subprocess buffer and silently counted ignored caches.
    // Errors inside a Git repository must not change the availability policy.
    const available = gitRepository
      ? execFileSync('git', ['--literal-pathspecs', 'ls-files', '-z', '--', normalizedPath], {
        cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
      }).split('\0').includes(normalizedPath)
      : existsSync(resolve(repoRoot, normalizedPath))
    availability.set(normalizedPath, available)
    return available
  }
}
