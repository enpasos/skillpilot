import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRepositorySourceAvailability } from './repositorySourceAvailability'

const fixture = mkdtempSync(join(tmpdir(), 'skillpilot-source-availability-'))
try {
  const repository = join(fixture, 'repository')
  mkdirSync(repository)
  execFileSync('git', ['init', '--quiet', repository], { stdio: 'ignore' })
  mkdirSync(join(repository, 'sources'))
  mkdirSync(join(repository, 'cache'))
  writeFileSync(join(repository, '.gitignore'), 'cache/\n')
  writeFileSync(join(repository, 'sources/primary.pdf'), 'committed primary fixture')
  writeFileSync(join(repository, 'sources/primary [1].pdf'), 'literal source filename')
  writeFileSync(join(repository, 'sources/primary 1.pdf'), 'untracked lookalike')
  writeFileSync(join(repository, 'cache/primary.pdf'), 'ignored local cache')
  execFileSync('git', ['--literal-pathspecs', 'add', '--', '.gitignore', 'sources/primary.pdf', 'sources/primary [1].pdf'], {
    cwd: repository, stdio: 'ignore',
  })
  const available = createRepositorySourceAvailability(repository)
  assert.equal(available('sources/primary.pdf'), true)
  assert.equal(available('sources\\primary.pdf'), true)
  assert.equal(available('sources/primary [1].pdf'), true)
  assert.equal(available('sources/primary 1.pdf'), false)
  assert.equal(available('cache/primary.pdf'), false, 'ignored caches cannot change committed status')
  assert.equal(available('missing.pdf'), false)
  assert.equal(available('../primary.pdf'), false)
  assert.equal(available(join(repository, 'sources/primary.pdf')), false)

  writeFileSync(join(repository, '.git/index'), 'invalid Git index fixture')
  assert.throws(
    () => createRepositorySourceAvailability(repository)('cache/primary.pdf'),
    'a Git failure must not fall back to counting ignored caches',
  )

  const standalone = join(fixture, 'standalone')
  mkdirSync(standalone)
  writeFileSync(join(standalone, 'primary.pdf'), 'standalone source fixture')
  const standaloneAvailable = createRepositorySourceAvailability(standalone)
  assert.equal(standaloneAvailable('primary.pdf'), true)
  assert.equal(standaloneAvailable('missing.pdf'), false)

  // Exercise the real evidence tree, whose full tracked-path listing exceeded
  // 16 MiB. Unrelated repository growth must not affect an exact source lookup.
  const repoRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))
  assert.equal(createRepositorySourceAvailability(repoRoot)('app/package.json'), true)
  console.log('Repository source availability tests passed: tracked inputs, ignored caches, literal paths and standalone sources.')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
