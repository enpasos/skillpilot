import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import { createServer } from 'vite'

const appRoot = resolve(import.meta.dirname, '..')
const repositoryRoot = resolve(appRoot, '..')
const viewRoot = resolve(repositoryRoot, 'curricula/DE/Gymnasium/composition-views')
const fixture = await mkdtemp(join(viewRoot, '.editor-write-test-'))
const file = join(fixture, 'test.view.json')
const path = relative(repositoryRoot, file).split(sep).join('/')
const legacyView = {
  $schema: 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json',
  viewFormatVersion: '1.2',
  viewId: 'editor-regression',
  landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
  language: 'de',
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII' },
  rootNodes: [{ kind: 'goalEntry', goalId: '5c44b9ba-9b05-4774-95d5-073230d3fc4f' }],
}
const upgraded = {
  ...legacyView,
  $schema: 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json',
  viewFormatVersion: '1.3',
  electionGroups: [],
}
const upgradedBytes = JSON.stringify(upgraded, null, 2) + '\n'
let vite: Awaited<ReturnType<typeof createServer>> | undefined

try {
  vite = await createServer({
    root: appRoot,
    configFile: join(appRoot, 'vite.config.ts'),
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { host: '127.0.0.1', port: 0, hmr: false, ws: false, watch: null },
  })
  await vite.listen()
  const address = vite.httpServer?.address()
  assert(address && typeof address === 'object')
  const endpoint = `http://127.0.0.1:${address.port}/__composition-view-editor`
  const save = (view: unknown) => fetch(`${endpoint}/save`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, view }),
  })

  const created = await save(legacyView)
  assert.equal(created.status, 200, await created.text())
  const opened = await fetch(`${endpoint}/load?path=${encodeURIComponent(path)}`)
  assert.equal(opened.status, 200)
  const staleView = (await opened.json()).view
  assert.deepEqual(staleView, legacyView)

  await writeFile(file, upgradedBytes)
  const rejected = await save(staleView)
  assert.equal(rejected.status, 422)
  assert.match((await rejected.json()).error, /composition view format 1\.3 is unsupported/)
  assert.equal(await readFile(file, 'utf8'), upgradedBytes)

  const newEditor = await fetch(`${endpoint}/load?path=${encodeURIComponent(path)}`)
  assert.equal(newEditor.status, 422)
  await newEditor.arrayBuffer()
  await writeFile(file, JSON.stringify(legacyView))
  const unsupportedPayload = await save(upgraded)
  assert.equal(unsupportedPayload.status, 422)
  await unsupportedPayload.arrayBuffer()
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), legacyView)
  const relabelled = {
    ...legacyView,
    historicalAssessmentPlacements: { migration: 'he-physik-e1-20261127' },
  }
  const relabelledPayload = await save(relabelled)
  assert.equal(relabelledPayload.status, 422)
  assert.match((await relabelledPayload.json()).error, /composition view format 1\.3 is unsupported/)
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), legacyView)

  const relabelledBytes = JSON.stringify(relabelled)
  await writeFile(file, relabelledBytes)
  const relabelledDestination = await save(staleView)
  assert.equal(relabelledDestination.status, 422)
  await relabelledDestination.arrayBuffer()
  assert.equal(await readFile(file, 'utf8'), relabelledBytes)

  console.log('Composition view editor rejects stale saves against upgraded views.')
} finally {
  try {
    await vite?.close()
  } finally {
    await rm(fixture, { recursive: true, force: true })
  }
}
