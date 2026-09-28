// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import {
  buildHeMathSekiiK3ProcessExtraction,
  parseHeMathSekiiK3ProcessPages,
  verifyHeMathSekiiK3PdfDigest,
} from './generateHeMathSekiiK3ProcessSourceExtraction.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const pdfPath = path.join(repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf')
const existingExtractionPath = path.join(repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json')
const candidatePath = path.join(repoRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/k3-process-source-candidate-20260927-v1/DE_HE_MATHEMATIK_SEKII_KC2024_PROCESS_K3.candidate.source-extraction.json')

const readPage = (page) => execFileSync('pdftotext',
  ['-f', String(page), '-l', String(page), '-layout', pdfPath, '-'],
  { encoding: 'utf8' })
const pages = { page14: readPage(14), page22: readPage(22) }

function mutatedPage(key, before, after) {
  assert.ok(pages[key].includes(before), 'mutation fixture must match the official PDF')
  return { ...pages, [key]: pages[key].replace(before, after) }
}

test('official K3 pages produce an unregistered eight-standard candidate', () => {
  const extraction = buildHeMathSekiiK3ProcessExtraction()
  assert.equal(extraction.passages.length, 2)
  assert.equal(extraction.passages[0].page, 14)
  assert.equal(extraction.passages[1].page, 22)
  assert.equal(extraction.sourceGoals.length, 8)
  assert.deepEqual(extraction.sourceGoals.map((goal) => goal.standardId),
    ['K3.1', 'K3.2', 'K3.3', 'K3.4', 'K3.5', 'K3.6', 'K3.7', 'K3.8'])
  assert.deepEqual(extraction.sourceGoals.map((goal) => goal.demandLevel),
    ['AB1', 'AB1', 'AB1', 'AB2', 'AB2', 'AB2', 'AB3', 'AB3'])
  assert.match(extraction.sourceGoals[1].sourceRef, /S\. 22, K3\.2, Anforderungsbereich I$/u)
  assert.match(extraction.sourceGoals[6].sourceRef, /S\. 22, K3\.7, Anforderungsbereich III$/u)
  assert.equal(extraction.sourceGoals[1].sourceSpan,
    'eine Realsituation direkt in ein mathematisches Modell überführen')
  assert.equal(extraction.pipelineStatus.currentStep, 'MAPPING-3')
  assert.equal(extraction.pipelineStatus.steps[2].status, 'incomplete')
  assert.equal(extraction.sourceDocument.official, true)
  assert.match(extraction.sourceDocument.rightsNote, /third-party rights/u)
  assert.deepEqual(extraction.sourceDocuments, [extraction.sourceDocument])
  assert.equal('goals' in extraction, false, 'candidate is not a runtime landscape')
  assert.equal(new Set(extraction.sourceGoals.map((goal) => goal.id)).size, 8)
  for (const goal of extraction.sourceGoals) {
    assert.equal(goal.sourcePage, 22)
    assert.equal(goal.passageId, extraction.passages[1].id)
    assert.ok(extraction.passages[1].text.includes(goal.sourceText),
      'normalized source text must remain contiguous in its official passage')
    assert.ok(extraction.passages[1].rawText.includes(goal.rawSourceText),
      'PDF line layout for each source goal must remain contiguous in its raw passage')
    for (const field of ['id', 'passageId', 'topicCode', 'title', 'description',
      'sourceText', 'sourceSpan', 'sourceRef', 'sourceDocumentKey']) {
      assert.equal(typeof goal[field], 'string', 'missing compiler field ' + field)
      assert.ok(goal[field].trim(), 'blank compiler field ' + field)
    }
    assert.doesNotMatch(goal.sourceText, /K2\.3/u)
  }
  const original = JSON.parse(readFileSync(existingExtractionPath, 'utf8'))
  assert.equal(original.passages.length, 25)
  assert.equal(original.sourceGoals.length, 316)
  assert.notEqual(extraction.extractionId, original.extractionId)
  assert.deepEqual(JSON.parse(readFileSync(candidatePath, 'utf8')), extraction)
})

test('pinned official PDF digest rejects changed source bytes', () => {
  const original = readFileSync(pdfPath)
  assert.match(verifyHeMathSekiiK3PdfDigest(original), /^[a-f0-9]{64}$/u)
  const changed = Buffer.from(original)
  changed[changed.length - 1] ^= 1
  assert.throws(() => verifyHeMathSekiiK3PdfDigest(changed), /PDF digest changed/u)
})

test('K3 parser rejects missing, duplicate, contaminated, or reworded standards', () => {
  const noK37 = mutatedPage('page22',
    'K3.7  eine komplexe Realsituation modellieren, wobei Variablen und Bedingungen fest-\n'
      + '       gelegt werden müssen,\n', '')
  assert.throws(() => parseHeMathSekiiK3ProcessPages(noK37), /eight K3 standards/u)

  const duplicateK34 = mutatedPage('page22',
    'K3.4  mehrschrittige Modellierungen mit wenigen und klar formulierten Einschränkungen\n',
    'K3.4  mehrschrittige Modellierungen mit wenigen und klar formulierten Einschränkungen\n'
      + '       vornehmen,\n'
      + 'K3.4  mehrschrittige Modellierungen mit wenigen und klar formulierten Einschränkungen\n')
  assert.throws(() => parseHeMathSekiiK3ProcessPages(duplicateK34),
    /eight K3 standards/u)

  const changedK32 = mutatedPage('page22',
    'eine Realsituation direkt in ein mathematisches Modell überführen',
    'eine Realsituation schrittweise in ein mathematisches Modell überführen')
  assert.throws(() => parseHeMathSekiiK3ProcessPages(changedK32),
    /official wording changed for K3\.2/u)

  const k2Contamination = mutatedPage('page22',
    'K3.1  vertraute und direkt erkennbare Modelle anwenden,',
    'K2.3  eine Strategie für ein komplexeres Problem entwickeln,\n'
      + 'K3.1  vertraute und direkt erkennbare Modelle anwenden,')
  assert.throws(() => parseHeMathSekiiK3ProcessPages(k2Contamination),
    /unrecognized content in K3 standards block/u)
})

test('K3 parser rejects shifted pages, AB drift, and definition drift', () => {
  const pageShift = mutatedPage('page22',
    '\n\n                                                                                      22\n',
    '\n\n                                                                                      21\n')
  assert.throws(() => parseHeMathSekiiK3ProcessPages(pageShift),
    /expected printed page 22/u)

  const wrongLevel = mutatedPage('page22', 'Anforderungsbereich II\nDie Lernenden können\nK3.4',
    'Anforderungsbereich I\nDie Lernenden können\nK3.4')
  assert.throws(() => parseHeMathSekiiK3ProcessPages(wrongLevel),
    /expected AB I, II, III headings/u)

  const changedDefinition = mutatedPage('page14',
    'Verstehen oder Bewerten vorgegebener Modelle',
    'Verstehen vorgegebener Modelle')
  assert.throws(() => parseHeMathSekiiK3ProcessPages(changedDefinition),
    /definition wording on page 14 changed/u)

  assert.throws(() => parseHeMathSekiiK3ProcessPages({
    ...pages, page14: pages.page22,
  }), /expected printed page 14/u)
})
