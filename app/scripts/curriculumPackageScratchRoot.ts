import { existsSync, lstatSync, realpathSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'

/** An explicit private scratch directory can live on another local filesystem. */
export const packageScratchRoot = (repositoryRoot: string, explicitRoot?: string): string => {
  if (explicitRoot === undefined) return resolve(repositoryRoot, 'tmp')
  if (!isAbsolute(explicitRoot)) throw new Error('Scratch root must be an absolute path')
  const root = resolve(explicitRoot)
  if (!existsSync(root) || realpathSync(root) !== root) throw new Error('Scratch root must exist without symlink components')
  const stat = lstatSync(root)
  if (!stat.isDirectory() || stat.isSymbolicLink() || process.getuid === undefined
      || stat.uid !== process.getuid() || (stat.mode & 0o777) !== 0o700) {
    throw new Error('Scratch root must be a private owner-controlled directory (mode 0700)')
  }
  return root
}

export const assertPackageScratchPath = (root: string, target: string): void => {
  const rel = relative(root, resolve(target))
  if (!rel || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`Package output must be a strict descendant of ${root}: ${target}`)
  }
  let cursor = root
  for (const component of rel.split(sep)) {
    cursor = resolve(cursor, component)
    let stat
    try { stat = lstatSync(cursor) } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
      throw error
    }
    if (stat.isSymbolicLink()) throw new Error(`Symlink path component is forbidden: ${cursor}`)
  }
}
