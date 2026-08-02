import assert from 'node:assert/strict'

import type { CompiledCompositionPreviewNode } from '../src/utils/authoring/compositionViewAuthoring'
import { collectLearnerFacingCompositionLabelFindings } from './lib/learnerFacingCompositionLabels'

const node = (
  label: string,
  children: CompiledCompositionPreviewNode[] = [],
): CompiledCompositionPreviewNode => ({
  runtimeId: label,
  label,
  kind: 'structure',
  children,
})

assert.deepEqual(
  collectLearnerFacingCompositionLabelFindings([
    node('Q2: Skalarprodukt und Analytische Geometrie'),
  ]),
  [],
  'Fachliche Kapitelbezeichnungen müssen zulässig bleiben.',
)

const technicalLabelFindings = collectLearnerFacingCompositionLabelFindings([
  node('Mathematik', [node('Q2: Source-Extraction-Nachträge')]),
])
assert.equal(technicalLabelFindings.length, 1)
assert.equal(technicalLabelFindings[0]?.code, 'CPV-216')
assert.equal(technicalLabelFindings[0]?.severity, 'error')
assert.equal(technicalLabelFindings[0]?.nodePath, '0.0')

const spellingVariantFindings = collectLearnerFacingCompositionLabelFindings([
  node('Source Extraction Ergänzungen'),
])
assert.equal(
  spellingVariantFindings[0]?.code,
  'CPV-216',
  'Auch die Schreibweise ohne Bindestrich darf nicht learner-facing erscheinen.',
)

console.log('Learner-facing composition label regression tests passed.')
