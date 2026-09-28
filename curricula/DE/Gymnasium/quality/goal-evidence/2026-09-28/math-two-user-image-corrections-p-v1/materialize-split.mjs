import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-two-user-image-corrections-p-v1'
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

const sources = [
  {
    key: 'eb070',
    goalId: 'eb070ed2-7ef4-5afe-b203-190ebb0116af',
    source: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-bodies-volume-keep9-p-20260923-v1/image-bound-three',
    hashes: {
      config: '35f890cf4a67bfa433dff0c3ca812470459f145cdb1ff13f404b9afed5c29e93',
      candidates: '4678ca49db0ae95a4227a7f3e6c2daa689b74e17b8ecb772041632e2b621e082',
      review: 'd175fea2e426f88d1b19c4fd462c70f9583de3d46dab0c4abdfeba8aadae84cf',
    },
    retainedCount: 2,
    imageSha: '98bdd4f4fdda294198b01124f9f4dd8f1ff46c486e260e20f4e096ad80b69110',
    reviewId: 'canonical-math-eb070-correct-parallel-markings-p-20260928-v1',
    reason: 'DE: Das neue PNG wurde bei Originalauflösung inhaltlich geprüft: AB, DC, EF und HG tragen dieselben blauen Doppelmarkierungen; AD, BC, EH und FG dieselben grünen Dreifachmarkierungen; die vier Hochkanten sind rot. Die früher vertauschten Markierungen an EF und AD sind damit korrigiert. AB⊥AE, Seitenfläche ABFE⊥Grundfläche ABCD und die Gegenflächenbeziehung sind richtig. Das Profil wurde erneut auf zwei unabhängige Fälle geprüft: Quaderkanten und eine Seitenfläche werden über Richtungen begründet; am neuen Dreiecksprisma muss insbesondere AB⊥AC gegen AB nicht senkrecht BC unterschieden werden. Keine dieser Antworten lässt sich aus dem Bild ablesen. E1/G1-AI-Kandidat, keine Humanfreigabe. EN: The new PNG was inspected at native resolution: AB, DC, EF and HG have matching blue double markings; AD, BC, EH and FG matching green triple markings; all four vertical edges are red. The formerly swapped EF and AD markings are corrected. AB perpendicular to AE, side face ABFE perpendicular to base ABCD, and the opposite-face relation are correct. Two independent cases were rechecked: cuboid edges and a side face need direction-based reasoning, while the fresh triangular prism contrasts AB perpendicular to AC with AB not perpendicular to BC. The image supplies neither answer. E1/G1 AI candidate, not human-approved.',
  },
  {
    key: '5ba7',
    goalId: '5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d',
    source: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q4-lk-complex-number-theory-p-20260923-v1/image-bound-17',
    hashes: {
      config: 'ba97d5b711be4e277dfb82908fd0bc9016f7a57f36daa0a70edef7adfd82fbc9',
      candidates: '95e622ca39845bc562857fdfd2a34fe1a35dabf45f152ccb28cfa818242918db',
      review: '87fdfcf138c53236df86cafc15262a38fcc7d3469076f63e07d7d3073818b1d5',
    },
    retainedCount: 16,
    imageSha: 'd4a2a17797dc7c5623f35900b628d58bdbaeddd86023d1f051dacc949d824d2e',
    reviewId: 'canonical-math-5ba7-correct-division-equalities-p-20260928-v1',
    reason: 'DE: Das neue PNG wurde bei Originalauflösung inhaltlich geprüft. Es setzt den Quotienten (3+2i)/(1−i) nur dem mit (1+i) erweiterten Bruch gleich. Die beschrifteten Nebenrechnungen ergeben (3+2i)(1+i)=1+5i und (1−i)(1+i)=2; das Endergebnis (1+5i)/2=1/2+(5/2)i stimmt. Die alten isolierten Gleichheitszeichen, die einen ganzen Bruch fälschlich mit Zähler oder Nenner gleichsetzten, fehlen. Das P-Profil wurde mit zwei unabhängigen neuen Fällen erneut geprüft: (2+i)/(1−2i) und (3−i)/(2i), jeweils mit Rückmultiplikation; keiner ist aus dem Bild abzulesen. E1/G1-AI-Kandidat, keine Humanfreigabe. EN: The new PNG was inspected at native resolution. It equates (3+2i)/(1−i) only with the fraction extended by (1+i). The separately labeled calculations correctly give numerator 1+5i and denominator 2; (1+5i)/2=1/2+(5/2)i is correct. The old isolated equals signs falsely equating a whole fraction with its numerator or denominator are absent. The P profile was rechecked against two independent fresh cases, (2+i)/(1−2i) and (3−i)/(2i), each with reverse multiplication; neither answer can be read from the picture. E1/G1 AI candidate, not human-approved.',
  },
]

const landscape = JSON.parse(await readFile(at(landscapePath), 'utf8'))
for (const item of sources) {
  const sourcePaths = {
    config: `${item.source}.config.json`,
    candidates: `${item.source}.candidates.json`,
    review: `${item.source}.review.jsonl`,
  }
  const sourceBytes = Object.fromEntries(await Promise.all(
    Object.entries(sourcePaths).map(async ([key, path]) => {
      const bytes = await readFile(at(path))
      if (sha(bytes) !== item.hashes[key]) throw new Error(`Pinned source changed: ${path}`)
      return [key, bytes]
    }),
  ))
  const config = JSON.parse(sourceBytes.config)
  const oldCandidates = JSON.parse(sourceBytes.candidates)
  const sourceLines = sourceBytes.review.toString('utf8').trimEnd().split('\n')
  const records = sourceLines.map((line) => JSON.parse(line))
  if (records.length !== item.retainedCount + 1 ||
      records.some((row, index) => row.goalId !== config.scope.goalIds[index]) ||
      oldCandidates.reviewId !== config.reviewId || oldCandidates.goals.length !== records.length ||
      oldCandidates.goals.some((row, index) => row.goalId !== records[index].goalId ||
        JSON.stringify(row.profile) !== JSON.stringify(records[index].profile))) {
    throw new Error(`Pinned source scope/candidates/reviews disagree: ${item.key}`)
  }
  const old = records.find((row) => row.goalId === item.goalId)
  if (!old || old.status !== 'needs_human_review' || old.reviewAuthority !== 'ai_candidate' ||
      old.evidenceLevel !== 'E1' || old.maximumClaimScope !== 'G1' ||
      old.reviewRunIds.length !== 0 || old.dissent.length !== 0) {
    throw new Error(`Unexpected previous evidence authority: ${item.key}`)
  }
  const goal = landscape.goals.find((row) => row.id === item.goalId)
  const url = `/assets/goal-visualizations/mathematik/${item.goalId}/${item.goalId}.png`
  const links = goal?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  const paths = [
    `curricula/DE/Gymnasium/visualizations/mathematik/${item.goalId}/${item.goalId}.png`,
    `app/public${url}`,
    `backend/src/main/resources/static${url}`,
  ]
  const hashes = await Promise.all(paths.map(async (path) => sha(await readFile(at(path)))))
  if (links.length !== 1 || links[0].url !== url || links[0].license !== 'CC-BY-4.0' ||
      hashes.some((hash) => hash !== item.imageSha)) {
    throw new Error(`Current image/link is not the independently inspected version: ${item.key}`)
  }

  const retained = sourceLines.map((line) => ({ line, row: JSON.parse(line) }))
    .filter(({ row }) => row.goalId !== item.goalId)
  const retainedReviewPath = `${here}/${item.key}-retained-${item.retainedCount}.review.jsonl`
  const retainedConfigPath = `${here}/${item.key}-retained-${item.retainedCount}.config.json`
  await put(retainedConfigPath, jsonBytes({
    ...config,
    reviewPath: retainedReviewPath,
    scope: {
      label: `${item.retainedCount} unaffected image-bound AI P-v2 records retained verbatim after ${item.key} image correction`,
      goalIds: retained.map(({ row }) => row.goalId),
    },
  }))
  await put(retainedReviewPath, Buffer.from(`${retained.map(({ line }) => line).join('\n')}\n`))

  const currentReviewPath = `${here}/${item.key}-current.review.jsonl`
  const currentConfigPath = `${here}/${item.key}-current.config.json`
  const currentCandidatesPath = `${here}/${item.key}-current.candidates.json`
  await put(currentConfigPath, jsonBytes({
    ...config,
    reviewId: item.reviewId,
    reviewPath: currentReviewPath,
    reviewRunManifestPaths: [],
    reviewedResourceTypes: ['goal-visualization'],
    requireApproved: false,
    scope: {
      label: `One freshly inspected current PNG and independent P-v2 profile for ${item.key}`,
      goalIds: [item.goalId],
    },
  }))
  await put(currentCandidatesPath, jsonBytes({
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: item.reviewId,
    reviewedAt: '2026-09-28T08:30:17.000Z',
    reviewer: 'Codex independent current-image P-v2 content reinspection; AI candidate only',
    goals: [{
      goalId: item.goalId,
      reason: item.reason,
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [],
      profile: structuredClone(old.profile),
    }],
  }))
  await put(`${here}/${item.key}-provenance.json`, jsonBytes({
    schemaVersion: 1,
    purpose: `Split the active ${records.length}-goal P package into ${item.retainedCount} exact retained records and one genuinely re-reviewed current-image-bound record`,
    sourceFiles: Object.entries(sourcePaths).map(([key, path]) => ({ path, sha256: `sha256:${item.hashes[key]}` })),
    movedGoalId: item.goalId,
    retainedGoalIds: retained.map(({ row }) => row.goalId),
    retainedRawLineSha256ByGoalId: Object.fromEntries(retained.map(({ line, row }) => [row.goalId, `sha256:${sha(Buffer.from(`${line}\n`))}`])),
    sourceProfileFingerprint: old.profileFingerprint,
    profileDisposition: item.reason,
    imageComparison: { newPngSha256: `sha256:${item.imageSha}`, newUrl: url, newPaths: paths, newAltText: links[0].altText },
    outputConfigPath: currentConfigPath,
    outputCandidatesPath: currentCandidatesPath,
    outputReviewPath: currentReviewPath,
    retainedConfigPath,
    retainedReviewPath,
    authority: 'needs_human_review; ai_candidate; E1/G1; no human approval',
  }))
}
