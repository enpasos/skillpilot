import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import {
  buildHeMathSekiiK6ProcessExtraction,
  parseHeMathSekiiK6ProcessPages,
  verifyHeMathSekiiK6PdfDigest,
} from './generateHeMathSekiiK6ProcessSourceExtraction.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const pdfPath = path.join(repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf')
const existingExtractionPath = path.join(repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json')
const candidatePath = path.join(repoRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/aeae-k6-source-assessment-candidate-20260927-v1/DE_HE_MATHEMATIK_SEKII_KC2024_PROCESS_K6.candidate.source-extraction.json')

const readPage = (page) => execFileSync('pdftotext',
  ['-f', String(page), '-l', String(page), '-layout', pdfPath, '-'],
  { encoding: 'utf8' })
const pages = { page14: readPage(14), page15: readPage(15), page24: readPage(24) }

function mutatedPage(key, before, after) {
  assert.ok(pages[key].includes(before), 'mutation fixture must match the official PDF')
  return { ...pages, [key]: pages[key].replace(before, after) }
}

test('official K6 pages produce eight traceable standards and a separate pending collection', () => {
  const extraction = buildHeMathSekiiK6ProcessExtraction()
  assert.equal(extraction.passages.length, 2)
  assert.equal(extraction.passages[0].page, 14)
  assert.equal(extraction.passages[0].pageEnd, 15)
  assert.equal(extraction.passages[1].page, 24)
  assert.equal(extraction.sourceGoals.length, 8)
  assert.deepEqual(extraction.sourceGoals.map((goal) => goal.standardId),
    ['K6.1', 'K6.2', 'K6.3', 'K6.4', 'K6.5', 'K6.6', 'K6.7', 'K6.8'])
  assert.deepEqual(extraction.sourceGoals.map((goal) => goal.demandLevel),
    ['AB1', 'AB1', 'AB2', 'AB2', 'AB2', 'AB3', 'AB3', 'AB3'])
  assert.match(extraction.sourceGoals[0].sourceRef, /S\. 24, K6\.1, Anforderungsbereich I$/u)
  assert.match(extraction.sourceGoals[2].sourceRef, /S\. 24, K6\.3, Anforderungsbereich II$/u)
  assert.equal(extraction.sourceGoals[0].sourceSpan,
    'einfache mathematische Sachverhalte darlegen')
  for (const goal of extraction.sourceGoals) {
    assert.ok(extraction.passages[1].text.includes(goal.sourceText),
      'normalized source text must remain contiguous in its official passage')
    assert.equal(goal.sourcePage, 24)
    assert.equal(goal.passageId, extraction.passages[1].id)
  }
  assert.equal(extraction.pipelineStatus.currentStep, 'MAPPING-3')
  assert.equal(extraction.pipelineStatus.steps[2].status, 'incomplete')
  assert.equal(new Set(extraction.sourceGoals.map((goal) => goal.id)).size, 8)
  assert.equal('goals' in extraction, false, 'candidate is not a runtime landscape')
  assert.equal(extraction.sourceDocument.official, true)
  assert.equal(extraction.sourceDocument.key, 'KC_GOS_2024')
  assert.deepEqual(extraction.sourceDocuments, [extraction.sourceDocument])
  for (const goal of extraction.sourceGoals) {
    for (const field of ['id', 'passageId', 'topicCode', 'title', 'description',
      'sourceText', 'sourceSpan', 'sourceRef', 'sourceDocumentKey']) {
      assert.equal(typeof goal[field], 'string', 'missing compiler field ' + field)
      assert.ok(goal[field].trim(), 'blank compiler field ' + field)
    }
  }
  const original = JSON.parse(readFileSync(existingExtractionPath, 'utf8'))
  assert.equal(original.passages.length, 25)
  assert.equal(original.sourceGoals.length, 316)
  assert.notEqual(extraction.extractionId, original.extractionId)
  assert.deepEqual(JSON.parse(readFileSync(candidatePath, 'utf8')), extraction)
})

test('pinned official PDF digest rejects changed source bytes', () => {
  const original = readFileSync(pdfPath)
  assert.match(verifyHeMathSekiiK6PdfDigest(original), /^[a-f0-9]{64}$/u)
  const changed = Buffer.from(original)
  changed[changed.length - 1] ^= 1
  assert.throws(() => verifyHeMathSekiiK6PdfDigest(changed), /PDF digest changed/u)
})

test('K6 parser rejects missing or duplicate standards and changed wording', () => {
  const noK67 = mutatedPage('page24',
    'K6.7  mathematische Fachtexte sinnentnehmend erfassen,\n', '')
  assert.throws(() => parseHeMathSekiiK6ProcessPages(noK67), /eight K6 standards/u)

  const duplicateK64 = mutatedPage('page24',
    'K6.4  Äußerungen (auch fehlerhafte) anderer Personen zu mathematischen Aussagen\n',
    'K6.4  Äußerungen (auch fehlerhafte) anderer Personen zu mathematischen Aussagen\n'
      + '       interpretieren,\n'
      + 'K6.4  Äußerungen (auch fehlerhafte) anderer Personen zu mathematischen Aussagen\n')
  assert.throws(() => parseHeMathSekiiK6ProcessPages(duplicateK64),
    /eight K6 standards/u)

  const changedK61 = mutatedPage('page24',
    'einfache mathematische Sachverhalte darlegen',
    'komplexe mathematische Sachverhalte darlegen')
  assert.throws(() => parseHeMathSekiiK6ProcessPages(changedK61),
    /official wording changed for K6\.1/u)
})

test('K6 parser rejects shifted pages, AB drift, and a truncated definition', () => {
  const pageShift = mutatedPage('page24', '\n\n                                                                                     24\n',
    '\n\n                                                                                     23\n')
  assert.throws(() => parseHeMathSekiiK6ProcessPages(pageShift),
    /expected printed page 24/u)

  const wrongLevel = mutatedPage('page24', 'Anforderungsbereich II', 'Anforderungsbereich I')
  assert.throws(() => parseHeMathSekiiK6ProcessPages(wrongLevel),
    /expected AB I, II, III headings/u)

  const missingContinuation = mutatedPage('page15',
    'besondere Rolle.', 'untergeordnete Rolle.')
  assert.throws(() => parseHeMathSekiiK6ProcessPages(missingContinuation),
    /definition text on pages 14–15 changed/u)

  assert.throws(() => parseHeMathSekiiK6ProcessPages({
    ...pages, page14: pages.page15,
  }), /expected printed page 14/u)
})
