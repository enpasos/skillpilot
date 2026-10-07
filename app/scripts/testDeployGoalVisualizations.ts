import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { copyGoalVisualizationAsset } from '../../scripts/deploy_goal_visualizations'

const fixture = fs.mkdtempSync(path.join(tmpdir(), 'skillpilot-goal-visualization-output-test-'))
const source = path.join(fixture, 'source.png')
const protectedFile = path.join(fixture, 'historical.png')
const content = Buffer.from('Immutable image-copy regression fixture\n')
const mode = (file: string) => fs.statSync(file).mode & 0o777
const digest = (file: string) => createHash('sha256').update(fs.readFileSync(file)).digest('hex')

try {
  fs.writeFileSync(source, content)
  fs.chmodSync(source, 0o444)
  const sourceDigest = digest(source)
  const outputs = [path.join(fixture, 'frontend'), path.join(fixture, 'backend')]
  for (const output of outputs) {
    fs.mkdirSync(output)
    const target = path.join(output, 'goal.png')
    fs.writeFileSync(target, 'Previous output bytes\n')
    fs.chmodSync(target, 0o444)
    for (let iteration = 0; iteration < 3; iteration += 1) {
      copyGoalVisualizationAsset(source, output, 'goal.png')
      assert.equal(digest(target), sourceDigest, 'Every copy must preserve exact source bytes')
      assert.equal(mode(target), 0o644, 'Repeated deployment must retain owner-write on the output')
      assert.equal(mode(source), 0o444, 'Deployment must retain the protected source mode')
      assert.equal(digest(source), sourceDigest, 'Deployment must retain the protected source bytes')
    }
  }
  copyGoalVisualizationAsset(source, outputs[0], 'new/goal.png')
  assert.equal(digest(path.join(outputs[0], 'new/goal.png')), sourceDigest)
  assert.equal(mode(path.join(outputs[0], 'new/goal.png')), 0o644)

  fs.writeFileSync(protectedFile, 'Protected historical bytes\n')
  fs.chmodSync(protectedFile, 0o444)
  const protectedDigest = digest(protectedFile)
  const alias = path.join(outputs[0], 'alias.png')
  fs.symlinkSync(path.relative(outputs[0], protectedFile), alias)
  assert.throws(() => copyGoalVisualizationAsset(source, outputs[0], 'alias.png'), /output file alias/)
  assert.equal(digest(protectedFile), protectedDigest)
  assert.equal(mode(protectedFile), 0o444)

  fs.symlinkSync('missing-original.png', path.join(outputs[0], 'dangling.png'))
  assert.throws(() => copyGoalVisualizationAsset(source, outputs[0], 'dangling.png'), /output file alias/)
  assert.equal(fs.existsSync(path.join(outputs[0], 'missing-original.png')), false)

  const protectedDirectory = path.join(fixture, 'historical-directory')
  fs.mkdirSync(protectedDirectory)
  fs.symlinkSync(path.relative(outputs[0], protectedDirectory), path.join(outputs[0], 'aliased-directory'), 'dir')
  assert.throws(() => copyGoalVisualizationAsset(source, outputs[0], 'aliased-directory/new.png'), /output directory alias/)
  assert.deepEqual(fs.readdirSync(protectedDirectory), [])
  const aliasedRoot = path.join(fixture, 'aliased-output-root')
  fs.symlinkSync('historical-directory', aliasedRoot, 'dir')
  assert.throws(() => copyGoalVisualizationAsset(source, aliasedRoot, 'new.png'), /output directory alias/)
  assert.deepEqual(fs.readdirSync(protectedDirectory), [])

  fs.linkSync(protectedFile, path.join(outputs[0], 'hard-linked.png'))
  assert.throws(() => copyGoalVisualizationAsset(source, outputs[0], 'hard-linked.png'), /output file alias/)
  assert.equal(digest(protectedFile), protectedDigest)
  assert.equal(mode(protectedFile), 0o444)
  assert.throws(() => copyGoalVisualizationAsset(source, outputs[0], '../escaped.png'), /escapes its directory/)
  assert.equal(fs.existsSync(path.join(fixture, 'escaped.png')), false)
  assert.equal(mode(source), 0o444)
  assert.equal(digest(source), sourceDigest)
  console.log('Goal visualization deploy regression PASS: repeated readonly-source/output copies, exact bytes, writable frontend/backend copies, and protected file/directory aliases.')
} finally {
  fs.rmSync(fixture, { recursive: true, force: true })
}
