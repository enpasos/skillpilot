import assert from 'node:assert/strict'

import type { CompiledCompositionPreviewNode } from '../src/utils/authoring/compositionViewAuthoring'
import {
  collectDuplicateDirectPhaseStructureFindings,
  collectLearnerFacingCompositionLabelFindings,
} from './lib/learnerFacingCompositionLabels'

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

const duplicatePhaseFindings = collectDuplicateDirectPhaseStructureFindings([
  node('Sekundarstufe II (LK)', [
    node('Q1: Integralrechnung und Differenzialgleichungen'),
    node('Q2: Analytische Geometrie, lineare Algebra und vertiefte Analysis'),
    node('Q2: Skalarprodukt und Analytische Geometrie'),
    node('Q3: Wahrscheinlichkeitsverteilungen, Hypothesentests und Statistik'),
  ]),
])
assert.equal(duplicatePhaseFindings.length, 1)
assert.equal(duplicatePhaseFindings[0]?.code, 'CPV-217')
assert.equal(duplicatePhaseFindings[0]?.severity, 'error')
assert.equal(duplicatePhaseFindings[0]?.nodePath, '0')

assert.deepEqual(
  collectDuplicateDirectPhaseStructureFindings([
    node('Sekundarstufe II (LK)', [
      node('E-Phase: Grundlagen'),
      node('Q1: Analysis'),
      node('Q2: Analytische Geometrie', [node('Q2.1 Skalarprodukt')]),
      node('Q3: Stochastik'),
      node('Q4: Funktionenscharen'),
    ]),
  ]),
  [],
  'Genau ein direkter Strukturknoten pro Phase muss zulässig bleiben; fachliche Unterknoten zählen nicht als zweiter Phasenknoten.',
)

assert.deepEqual(
  collectDuplicateDirectPhaseStructureFindings([
    node('Sekundarstufe II (GK)', [node('Q2: Analytische Geometrie')]),
    node('Sekundarstufe II (LK)', [node('Q2: Analytische Geometrie')]),
  ]),
  [],
  'Gleichnamige Phasen unter verschiedenen Elternknoten dürfen nicht als Duplikat gelten.',
)

console.log('Learner-facing composition label regression tests passed.')
