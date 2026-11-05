import assert from 'node:assert/strict'
import { linkSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { writeAtomicAuthoringFile } from './atomicAuthoringFile'

test('authoring changes detach current output and preserve the hardlinked frozen control', () => {
  const root = mkdtempSync(join(tmpdir(), 'authoring-hardlink-'))
  try {
    const current = join(root, 'current.json'), control = join(root, 'frozen-control.json')
    writeFileSync(current, 'old pinned bytes\n')
    linkSync(current, control)
    const originalInode = statSync(control).ino
    assert.equal(statSync(current).ino, originalInode)
    assert.equal(writeAtomicAuthoringFile(current, 'new authorized bytes\n'), true)
    assert.equal(readFileSync(control, 'utf8'), 'old pinned bytes\n')
    assert.equal(readFileSync(current, 'utf8'), 'new authorized bytes\n')
    assert.equal(statSync(control).ino, originalInode)
    assert.notEqual(statSync(current).ino, originalInode)
    assert.deepEqual(readdirSync(root).sort(), ['current.json', 'frozen-control.json'])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('identical authoring output preserves the shared inode and creates no scratch files', () => {
  const root = mkdtempSync(join(tmpdir(), 'authoring-unchanged-'))
  try {
    const current = join(root, 'current.json'), control = join(root, 'frozen-control.json')
    writeFileSync(current, 'same pinned bytes\n')
    linkSync(current, control)
    const before = statSync(current)
    assert.equal(writeAtomicAuthoringFile(current, 'same pinned bytes\n'), false)
    assert.equal(statSync(current).ino, before.ino)
    assert.equal(statSync(current).nlink, 2)
    assert.equal(readFileSync(control, 'utf8'), 'same pinned bytes\n')
    assert.deepEqual(readdirSync(root).sort(), ['current.json', 'frozen-control.json'])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('a symlink output cannot mutate or replace its target', () => {
  const root = mkdtempSync(join(tmpdir(), 'authoring-symlink-'))
  try {
    const victim = join(root, 'victim.json'), current = join(root, 'current.json')
    writeFileSync(victim, 'pinned\n')
    symlinkSync(victim, current)
    assert.throws(() => writeAtomicAuthoringFile(current, 'changed\n'), /regular file/)
    assert.equal(readFileSync(victim, 'utf8'), 'pinned\n')
    const dangling = join(root, 'dangling.json')
    symlinkSync(join(root, 'missing.json'), dangling)
    assert.throws(() => writeAtomicAuthoringFile(dangling, 'changed\n'), /regular file/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
