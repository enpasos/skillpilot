import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { emptyCounts, writeViewSemantics } from './memFwuRoundtrip'
import { readRdfModel, reconstructViews } from './semanticMemFwuRoundtrip'
const archiveRoot = 'voluntary-rdf-regression'
const directory = await mkdtemp(join(tmpdir(), 'skillpilot-voluntary-rdf-'))
const entry = (path: string, data: unknown) => { const text = JSON.stringify(data); return { path: `${archiveRoot}/${path}`, text, content: null, uncompressedBytes: Buffer.byteLength(text), sha256: null } }
try {
  const threeRoleView = {
    $schema: 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json',
    viewFormatVersion: '1.3', viewId: 'three-role-rdf', landscapeId: 'math', language: 'de', title: 'Drei Rollen',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE' },
    rootNodes: [{ kind: 'structure', id: 'unit', label: 'Einheit', childOrder: { after: [] }, children: [
      { kind: 'goalEntry', goalId: 'regular', projectionRole: 'target' },
      { kind: 'goalEntry', goalId: 'prep', projectionRole: 'prerequisiteOnly', acquisitionPlacement: true },
      { kind: 'structure', id: 'offers', label: 'Freiwillige Angebote', labelEn: 'Voluntary offers',
        placementEvidence: { rationale: 'Eigene didaktische Begründung.' }, children: [
          { kind: 'goalEntry', goalId: 'offer', projectionRole: 'voluntary' },
          { kind: 'goalEntry', goalId: 'optional-task', projectionRole: 'voluntary' },
        ] },
    ] }],
  }
  const view = entry('data/views/three-role.view.json', threeRoleView)
  const lines: string[] = []
  writeViewSemantics(line => lines.push(line), archiveRoot, [view], emptyCounts(), { semanticIris: true })
  const rdfPath = join(directory, 'view.nt')
  await writeFile(rdfPath, `${lines.join('\n')}\n`)
  const { model } = await readRdfModel(rdfPath)
  assert.deepEqual(reconstructViews(model)[view.path], threeRoleView)
  for (const [name, mutate] of [
    ['unknown-role', (rdf: string) => rdf.replaceAll('"voluntary"', '"unsupported"')],
    ['unknown-version', (rdf: string) => rdf.replaceAll('"1.3"', '"9.0"')],
    ['missing-version', (rdf: string) => rdf.split('\n').filter(line => !line.includes('compositionViewFormatVersion>')).join('\n')],
    ['wrong-schema', (rdf: string) => rdf.replaceAll('composition-view/v1.3/composition-view.schema.json', 'composition-view/v1.2/composition-view.schema.json')],
  ] as const) {
    const hostilePath = join(directory, `${name}.nt`)
    const rdf = `${lines.join('\n')}\n`
    const hostile = mutate(rdf)
    assert.notEqual(hostile, rdf)
    await writeFile(hostilePath, hostile)
    const hostileModel = (await readRdfModel(hostilePath)).model
    assert.throws(() => reconstructViews(hostileModel), /Invalid reconstructed composition view transport/u, name)
  }
  for (const version of ['1.0', '1.2', '9.0']) {
    const hostile = { ...threeRoleView, viewFormatVersion: version }
    assert.throws(() => writeViewSemantics(() => {}, archiveRoot,
      [entry('data/views/hostile.view.json', hostile)], emptyCounts()), /Invalid composition view transport/u)
  }
  console.log('Voluntary RDF transport passed: exact source 1.3, three roles, order, acquisition and rationale; seven hostile producer/consumer controls.')
} finally { await rm(directory, { recursive: true, force: true }) }
