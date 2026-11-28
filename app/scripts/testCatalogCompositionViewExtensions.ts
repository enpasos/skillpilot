import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { validateCatalogCompositionViewExtensions } from './lib/catalogCompositionViewExtensions'

test('production catalog rejects version 1.3 and each extension marker independently', (context) => {
  const repo = mkdtempSync(join(tmpdir(), 'catalog-composition-views-'))
  context.after(() => rmSync(repo, { recursive: true, force: true }))

  const allowLegacy = { viewFormatVersion: '1.2', rootNodes: [] }
  const fixtures = {
    'version.view.json': { viewFormatVersion: '1.3' },
    'schema.view.json': {
      $schema: 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json',
    },
    'groups.view.json': { ...allowLegacy, electionGroups: [] },
    'nested.view.json': { ...allowLegacy, rootNodes: [{ children: [{ extension: null }] }] },
    'history.view.json': { ...allowLegacy, historicalAssessmentPlacements: null },
  }
  const curricula = join(repo, 'curricula')
  const nestedViews = join(curricula, 'DE', 'another-course', 'nested')
  const examples = join(repo, 'contracts', 'examples')
  mkdirSync(nestedViews, { recursive: true })
  mkdirSync(examples, { recursive: true })
  writeFileSync(join(nestedViews, 'legacy.view.json'), JSON.stringify(allowLegacy))
  for (const [name, fixture] of Object.entries(fixtures)) {
    writeFileSync(join(examples, name), JSON.stringify(fixture))
  }

  assert.doesNotThrow(() => validateCatalogCompositionViewExtensions(curricula))

  for (const [name, fixture] of Object.entries(fixtures)) {
    writeFileSync(join(nestedViews, name), JSON.stringify(fixture))
  }
  assert.throws(() => validateCatalogCompositionViewExtensions(curricula), (error: unknown) => {
    assert.ok(error instanceof Error)
    assert.match(error.message, /unfiltered view/)
    assert.match(error.message, /version\.view\.json \(viewFormatVersion 1\.3\)/)
    assert.match(error.message, /schema\.view\.json \(\$schema 1\.3\)/)
    assert.match(error.message, /groups\.view\.json \(electionGroups\)/)
    assert.match(error.message, /nested\.view\.json \(extension\)/)
    assert.match(error.message, /history\.view\.json \(historicalAssessmentPlacements\)/)
    return true
  })
})
