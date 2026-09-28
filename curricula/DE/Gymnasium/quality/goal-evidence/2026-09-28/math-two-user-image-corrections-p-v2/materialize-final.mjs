import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-two-user-image-corrections-p-v2'
const previous = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-two-user-image-corrections-p-v1'
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const put = async (path, bytes) => {
  const absolute = at(path)
  await mkdir(dirname(absolute), { recursive: true })
  try {
    await writeFile(absolute, bytes, { flag: 'wx' })
  } catch (error) {
    if (error?.code !== 'EEXIST' || !(await readFile(absolute)).equals(bytes)) throw error
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}

const goals = [
  {
    key: 'eb070',
    id: 'eb070ed2-7ef4-5afe-b203-190ebb0116af',
    imageSha: '4d1927de8bdc1114302a3742fca7466ecf383acbcd5cf5c2aca1c788ff918371',
    previousConfigSha: '03d6e612721dae046c7e4d423016da0e4cc53f880aa68a376658403baa04e9e7',
    previousCandidatesSha: '24770268486e899b13d00456ab9161d6f6f7f0455c3a87b275a5fade7e18ba6c',
    reviewId: 'canonical-math-eb070-final-parallel-and-face-correction-p-20260928-v2',
    reason: 'DE: Das endgültige PNG wurde direkt in Originalauflösung geprüft. AB, DC, EF und HG sind blau doppelt markiert; AD, BC, EH und FG grün dreifach; AE, BF, CG und DH rot. Anders als die erste Korrekturfassung ist nun die rosa Seitenfläche ausdrücklich ADHE, passend zu der gezeigten Fläche links, und ihr rechter Winkel zur Grundfläche ABCD ist korrekt. AB⊥AE und Grundfläche ABCD∥Deckfläche EFGH stimmen. Das P-Profil wurde gegen zwei unabhängige Fälle erneut geprüft: Am neuen Quader sind Kanten- und Flächenbeziehungen aus Richtungen zu begründen; am Dreiecksprisma ist AB⊥AC, aber AB nicht senkrecht BC. Die Bildbeschriftungen liefern diese neuen Lösungen nicht. Das ist nur ein E1/G1-AI-Kandidat, keine Humanfreigabe. EN: The final PNG was inspected at native resolution. AB, DC, EF and HG have matching blue double marks; AD, BC, EH and FG green triple marks; AE, BF, CG and DH red marks. Unlike the first correction, the pink left side face is now explicitly labeled ADHE, and its perpendicular relation to base ABCD is correct. AB perpendicular to AE and base ABCD parallel to top EFGH are correct. The two independent P cases were rechecked: a new cuboid demands direction-based edge and face reasoning, and a triangular prism contrasts AB perpendicular to AC with AB not perpendicular to BC. The image does not supply those new answers. E1/G1 AI candidate only, not human-approved.',
  },
  {
    key: '5ba7',
    id: '5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d',
    imageSha: '94d1cc06ba4ac0492aa54dca1604a1b0254113ed665498fad7de317d8b204f7b',
    previousConfigSha: 'eab24abf9384b574c32f9fa83d97daf9e8153c8616e547bddacddf823ba1f9f1',
    previousCandidatesSha: '6cc56fe34baa1f3905c1abdaa7b74be85058e976d7fb74e4286d7e6c1bce61ce',
    reviewId: 'canonical-math-5ba7-final-division-equalities-p-20260928-v2',
    reason: 'DE: Das endgültige PNG wurde direkt in Originalauflösung geprüft. Der gesamte Bruch (3+2i)/(1−i) wird nur dem mit (1+i) erweiterten Bruch gleichgesetzt. Die separat beschrifteten Nebenrechnungen ergeben Zähler (3+2i)(1+i)=1+5i und Nenner (1−i)(1+i)=2; das Endergebnis (1+5i)/2=1/2+(5/2)i stimmt. Die alten isolierten Gleichheitszeichen mit falschem Bezug auf den ganzen Bruch fehlen; gegenüber der ersten Korrektur ist auch die einleitende Anweisung sprachlich präziser. Die beiden unabhängigen P-Fälle (2+i)/(1−2i) und (3−i)/(2i) erfordern eigene Konjugation, Vorzeichenkontrolle und Rückmultiplikation; keine ihrer Lösungen ist im Bild vorhanden. Nur E1/G1-AI-Kandidat, keine Humanfreigabe. EN: The final PNG was inspected at native resolution. The whole fraction (3+2i)/(1−i) is equated only to the fraction extended by (1+i). Separately labeled calculations give numerator (3+2i)(1+i)=1+5i and denominator (1−i)(1+i)=2; the final result (1+5i)/2=1/2+(5/2)i is correct. The old isolated equals signs with a false whole-fraction referent are gone; the introductory instruction is also clearer than in the first correction. The independent P cases (2+i)/(1−2i) and (3−i)/(2i) require fresh conjugation, sign checks and reverse multiplication; neither answer appears in the image. E1/G1 AI candidate only, not human-approved.',
  },
]

const landscape = JSON.parse(await readFile(at(landscapePath), 'utf8'))
for (const goal of goals) {
  const priorPaths = {
    config: `${previous}/${goal.key}-current.config.json`,
    candidates: `${previous}/${goal.key}-current.candidates.json`,
  }
  const priorBytes = {
    config: await readFile(at(priorPaths.config)),
    candidates: await readFile(at(priorPaths.candidates)),
  }
  if (sha(priorBytes.config) !== goal.previousConfigSha ||
      sha(priorBytes.candidates) !== goal.previousCandidatesSha) {
    throw new Error(`Previous immutable AI P candidate changed for ${goal.key}`)
  }
  const config = JSON.parse(priorBytes.config)
  const candidates = JSON.parse(priorBytes.candidates)
  if (config.scope.goalIds.length !== 1 || config.scope.goalIds[0] !== goal.id ||
      candidates.goals.length !== 1 || candidates.goals[0].goalId !== goal.id ||
      candidates.reviewId !== config.reviewId) {
    throw new Error(`Previous P candidate scope differs for ${goal.key}`)
  }
  const url = `/assets/goal-visualizations/mathematik/${goal.id}/${goal.id}.png`
  const canonical = landscape.goals.find((row) => row.id === goal.id)
  const links = canonical?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  const imagePaths = [
    `curricula/DE/Gymnasium/visualizations/mathematik/${goal.id}/${goal.id}.png`,
    `app/public${url}`,
    `backend/src/main/resources/static${url}`,
  ]
  const actual = await Promise.all(imagePaths.map(async (path) => sha(await readFile(at(path)))))
  if (links.length !== 1 || links[0].url !== url || links[0].license !== 'CC-BY-4.0' ||
      actual.some((digest) => digest !== goal.imageSha)) {
    throw new Error(`Current canonical image/link is not the final inspected version for ${goal.key}`)
  }
  const reviewPath = `${here}/${goal.key}-final.review.jsonl`
  const configPath = `${here}/${goal.key}-final.config.json`
  const candidatesPath = `${here}/${goal.key}-final.candidates.json`
  await put(configPath, jsonBytes({
    ...config,
    reviewId: goal.reviewId,
    reviewPath,
    scope: {
      label: `One final PNG, directly reinspected with independent P-v2 transfer cases for ${goal.key}`,
      goalIds: [goal.id],
    },
  }))
  await put(candidatesPath, jsonBytes({
    ...candidates,
    reviewId: goal.reviewId,
    reviewedAt: '2026-09-28T08:42:08.000Z',
    reviewer: 'Codex independent final-PNG P-v2 content reinspection; AI candidate only',
    goals: [{
      ...candidates.goals[0],
      reason: goal.reason,
      profile: structuredClone(candidates.goals[0].profile),
    }],
  }))
  await put(`${here}/${goal.key}-provenance.json`, jsonBytes({
    schemaVersion: 1,
    purpose: 'Second independently inspected, final-byte P binding; earlier image-bound draft remains historical and inactive',
    previousConfigPath: priorPaths.config,
    previousConfigSha256: `sha256:${goal.previousConfigSha}`,
    previousCandidatesPath: priorPaths.candidates,
    previousCandidatesSha256: `sha256:${goal.previousCandidatesSha}`,
    imageSha256: `sha256:${goal.imageSha}`,
    imagePaths,
    imageUrl: url,
    reinspection: goal.reason,
    outputConfigPath: configPath,
    outputCandidatesPath: candidatesPath,
    outputReviewPath: reviewPath,
    authority: 'needs_human_review; ai_candidate; E1/G1; no human approval',
  }))
}
