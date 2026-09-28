import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

import { ROOT_DIR } from './goal_visualization_common.mjs'

const SCRIPT = path.join(ROOT_DIR, 'scripts/generate_goal_visualization_nano_banana.mjs')
const GOAL_ID = 'synthetic-goal-visualization-test'

function createFixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'skillpilot-image-generator-test-'))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  const landscape = path.join(directory, 'landscape.json')
  const promptFile = path.join(directory, 'exact-prompt.txt')
  const exactPrompt = 'Ein freundlicher, klarer Comic im breiten Querformat.\nKein weiterer Text.\n'
  fs.writeFileSync(landscape, JSON.stringify({
    goals: [{ id: GOAL_ID, title: 'Synthetisches Lernziel', description: 'Die lernende Person kann testen.' }],
  }))
  fs.writeFileSync(promptFile, exactPrompt)

  const run = (extraArgs = []) => spawnSync(process.execPath, [
    SCRIPT, GOAL_ID, '--landscape', landscape, '--prompt-file', promptFile, '--dry-run', '--no-import',
    ...extraArgs,
  ], { cwd: ROOT_DIR, encoding: 'utf-8', timeout: 30_000 })

  return { directory, landscape, promptFile, exactPrompt, run }
}

test('exact prompt file and high thinking produce a Flash Image dry-run package', (t) => {
  const fixture = createFixture(t)
  const workDir = path.join(fixture.directory, 'attempt-1')
  const result = fixture.run([
    '--work-dir', workDir, '--model', 'gemini-3.1-flash-image', '--thinking-level', 'high',
    '--mime-type', 'image/png',
  ])
  assert.equal(result.status, 0, result.stderr)
  const request = JSON.parse(fs.readFileSync(path.join(workDir, 'nano-banana-request.json'), 'utf-8'))
  assert.equal(request.model, 'gemini-3.1-flash-image')
  assert.equal(request.input, fixture.exactPrompt)
  assert.deepEqual(request.generation_config, { thinking_level: 'high' })
  assert.deepEqual(request.response_format, {
    type: 'image', mime_type: 'image/png', aspect_ratio: '16:9', image_size: '2K',
  })
  const metadata = fs.readFileSync(path.join(workDir, 'nano-banana-prompt.de.md'), 'utf-8')
  assert.match(metadata, /Google Gemini \/ Nano Banana 2 \(gemini-3\.1-flash-image\)/u)
  assert.match(metadata, /Ein freundlicher, klarer Comic im breiten Querformat\./u)
  assert.doesNotMatch(metadata, /Bitte visualisiere das folgende Lernziel/u)
})

test('minimal thinking is supported, while the unconfigured default request stays unchanged', (t) => {
  const fixture = createFixture(t)
  const minimalDir = path.join(fixture.directory, 'minimal')
  const minimal = fixture.run([
    '--work-dir', minimalDir, '--model', 'gemini-3.1-flash-image', '--thinking-level=minimal',
  ])
  assert.equal(minimal.status, 0, minimal.stderr)
  const minimalRequest = JSON.parse(fs.readFileSync(path.join(minimalDir, 'nano-banana-request.json'), 'utf-8'))
  assert.deepEqual(minimalRequest.generation_config, { thinking_level: 'minimal' })

  const defaultDir = path.join(fixture.directory, 'default')
  const defaultResult = fixture.run(['--work-dir', defaultDir])
  assert.equal(defaultResult.status, 0, defaultResult.stderr)
  const defaultRequest = JSON.parse(fs.readFileSync(path.join(defaultDir, 'nano-banana-request.json'), 'utf-8'))
  assert.equal(defaultRequest.model, 'gemini-3-pro-image')
  assert.equal(defaultRequest.input, fixture.exactPrompt)
  assert.equal(Object.hasOwn(defaultRequest, 'generation_config'), false)
})

test('legacy generated prompt remains available and does not gain thinking config', (t) => {
  const fixture = createFixture(t)
  const workDir = path.join(fixture.directory, 'legacy')
  const result = spawnSync(process.execPath, [
    SCRIPT, GOAL_ID, '--landscape', fixture.landscape, '--dry-run', '--no-import',
    '--work-dir', workDir,
  ], { cwd: ROOT_DIR, encoding: 'utf-8', timeout: 30_000 })
  assert.equal(result.status, 0, result.stderr)
  const request = JSON.parse(fs.readFileSync(path.join(workDir, 'nano-banana-request.json'), 'utf-8'))
  assert.match(request.input, /Bitte visualisiere das folgende Lernziel/u)
  assert.equal(Object.hasOwn(request, 'generation_config'), false)
})

test('versioned work directory refuses to overwrite an earlier dry-run', (t) => {
  const fixture = createFixture(t)
  const workDir = path.join(fixture.directory, 'attempt-1')
  assert.equal(fixture.run(['--work-dir', workDir]).status, 0)
  const requestPath = path.join(workDir, 'nano-banana-request.json')
  const oldRequest = fs.readFileSync(requestPath)
  const repeat = fixture.run(['--work-dir', workDir])
  assert.equal(repeat.status, 1)
  assert.match(repeat.stderr, /must be new or empty/u)
  assert.deepEqual(fs.readFileSync(requestPath), oldRequest)
})

test('invalid or ambiguous prompt and thinking options fail before creating scratch', (t) => {
  const fixture = createFixture(t)
  const variants = [
    [['--prompt-append', 'Zusatz', '--work-dir', path.join(fixture.directory, 'append')], /cannot be combined/u],
    [['--model', 'gemini-3.1-flash-image', '--thinking-level', 'medium', '--work-dir', path.join(fixture.directory, 'medium')], /Unsupported thinking level/u],
    [['--thinking-level', 'high', '--work-dir', path.join(fixture.directory, 'wrong-model')], /only with --model gemini-3\.1-flash-image/u],
  ]
  for (const [args, error] of variants) {
    const result = fixture.run(args)
    assert.equal(result.status, 1)
    assert.match(result.stderr, error)
  }
  for (const folder of ['append', 'medium', 'wrong-model']) {
    assert.equal(fs.existsSync(path.join(fixture.directory, folder)), false)
  }
})
