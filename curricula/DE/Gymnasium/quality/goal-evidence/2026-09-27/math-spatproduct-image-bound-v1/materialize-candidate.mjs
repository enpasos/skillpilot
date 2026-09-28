#!/usr/bin/env node
// Reuse the independently rechecked text-only profile after substantive
// current-image and revised-text review; only this goal is rebound.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-spatproduct-image-bound-v1'
const sourcePath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-three-held-image-text-current-20260924-v1/positive-evidence.candidates.json'
const imagePath = 'curricula/DE/Gymnasium/visualizations/mathematik/944dd479-9f30-5acb-ab32-3ea0b6dc8e06/944dd479-9f30-5acb-ab32-3ea0b6dc8e06.png'
const goalId = '944dd479-9f30-5acb-ab32-3ea0b6dc8e06'
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const oldBytes = readFileSync(resolve(root, sourcePath))
if (sha(oldBytes) !== '5060fb532f046d2807a4e316b1d35352f99b3aca4cd36a988e53ee60eb70fa84') {
  throw new Error('Historical source candidate changed')
}
const source = JSON.parse(oldBytes.toString('utf8'))
const matches = source.goals.filter((entry) => entry.goalId === goalId)
if (matches.length !== 1) throw new Error('Expected one historical Spatprodukt profile')
const config = JSON.parse(readFileSync(resolve(root, `${base}/positive-evidence.config.json`), 'utf8'))
const landscape = JSON.parse(readFileSync(resolve(root, config.landscapePath), 'utf8'))
const current = landscape.goals.filter(({ id }) => id === goalId)
if (current.length !== 1 || current[0].description !== 'Die lernende Person kann das Spatprodukt als $[\\vec{a},\\vec{b},\\vec{c}] = \\vec{a} \\cdot (\\vec{b} \\times \\vec{c})$ angeben, sein Vorzeichen als Orientierung deuten und seinen Betrag als Volumen des aufgespannten Spats verwenden.' ||
    current[0].descriptionEn !== 'The learner can state the scalar triple product as $[\\vec{a},\\vec{b},\\vec{c}] = \\vec{a} \\cdot (\\vec{b} \\times \\vec{c})$, interpret its sign as orientation and use its absolute value as the volume of the spanned parallelepiped.') {
  throw new Error('Current canonical Spatprodukt text changed')
}
const links = current[0].resourceLinks?.filter(({ type, role }) => type === 'goal-visualization' && role === 'primary')
if (links?.length !== 1 || links[0].url !== `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.png` ||
    links[0].altText !== 'Ein Spat wird von a=(2,0,0), b=(0,3,0) und c=(0,0,4) entlang der positiven Koordinatenachsen aufgespannt. Das Spatprodukt beträgt +24; beim Vertauschen von a und b wird es −24. Der Betrag und damit das Volumen bleiben 24.') {
  throw new Error('Current PNG link or alt text changed')
}
const imageSha = 'bf1ffa4f1695107911cc4851a6d7d631a32435c7f85497376d290df25d240370'
if (sha(readFileSync(resolve(root, imagePath))) !== imageSha) throw new Error('Current PNG changed')

const candidate = structuredClone(matches[0])
candidate.reason = 'Das exakte PNG sha256:bf1ffa4f1695107911cc4851a6d7d631a32435c7f85497376d290df25d240370 wurde im Original und bei 360 px gegen die am 2026-09-27 präzisierte DE/EN-Beschreibung sowie beide P-Fälle erneut geprüft. Es zeigt ein konsistentes rechtshändiges Achsenbild: a=(2,0,0), b=(0,3,0), c=(0,0,4), [a,b,c]=+24, nach Vertauschung von a und b [b,a,c]=−24 und in beiden Fällen V=24. Der erste P-Fall verlangt dagegen [a,c,b] und eine eigene Berechnung samt Einheiten, nicht bloß Ablesen. Im schiefen Transferfall ergibt b×c=(−1,−2,1), [a,b,c]=−3 und V=3; dieser Fall steht nicht im Bild. Das unveränderte Profil fordert genau die nun explizite Vorzeichen- und Betragsdeutung eigenständig an zwei unterschiedlichen Fällen. E1/G1, AI-Kandidat ohne menschliche oder lernpraktische Freigabe.'
candidate.dissent = []
const set = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: config.reviewId,
  reviewedAt: '2026-09-27T12:05:34Z',
  reviewer: 'Codex revised Spatprodukt text, current PNG original/360px and two-case P-v2 reinspection; AI candidate only',
  goals: [candidate],
}
const bytes = `${JSON.stringify(set, null, 2)}\n`
const target = resolve(root, `${base}/positive-evidence.candidates.json`)
if (process.argv[2] === '--write') writeFileSync(target, bytes)
else if (process.argv.length === 2) {
  if (readFileSync(target, 'utf8') !== bytes) throw new Error('Candidate differs from current pinned sources')
} else throw new Error('Usage: node materialize-candidate.mjs [--write]')
console.log(`${process.argv[2] === '--write' ? 'Wrote' : 'Verified'} ${target}`)
