import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-eb070-final-leaders-p-v3'
const prior = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-two-user-image-corrections-p-v2'
const goalId = 'eb070ed2-7ef4-5afe-b203-190ebb0116af'
const imageSha = 'f2466e2594b783ca21cd08c61b0e99bd8e1dc7603885946456ae0b7ca3af9a5d'
const priorFiles = {
  config: `${prior}/eb070-final.config.json`,
  candidates: `${prior}/eb070-final.candidates.json`,
}
const priorHashes = {
  config: 'e17a18111b17348f3570acd190a72e7f406f11915890e21ea59b6df13f7d0c8b',
  candidates: '0c81475168e15a641bf77d609a1907e5893f1e506e3a61c1a1d395d223964251',
}
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

const priorBytes = Object.fromEntries(await Promise.all(
  Object.entries(priorFiles).map(async ([key, path]) => {
    const bytes = await readFile(at(path))
    if (sha(bytes) !== priorHashes[key]) throw new Error(`Pinned previous P file changed: ${path}`)
    return [key, bytes]
  }),
))
const config = JSON.parse(priorBytes.config)
const candidates = JSON.parse(priorBytes.candidates)
if (config.scope.goalIds.length !== 1 || config.scope.goalIds[0] !== goalId ||
    candidates.goals.length !== 1 || candidates.goals[0].goalId !== goalId ||
    candidates.reviewId !== config.reviewId) {
  throw new Error('Previous P candidate does not cover exactly eb070')
}
const landscape = JSON.parse(await readFile(at(config.landscapePath), 'utf8'))
const goal = landscape.goals.find((row) => row.id === goalId)
const url = `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.png`
const links = goal?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
const imagePaths = [
  `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.png`,
  `app/public${url}`,
  `backend/src/main/resources/static${url}`,
]
const actualHashes = await Promise.all(imagePaths.map(async (path) => sha(await readFile(at(path)))))
if (links.length !== 1 || links[0].url !== url || links[0].license !== 'CC-BY-4.0' ||
    actualHashes.some((digest) => digest !== imageSha)) {
  throw new Error('Current PNG and canonical link are not the final inspected bytes')
}
const reviewId = 'canonical-math-eb070-final-parallel-face-and-leaders-p-20260928-v3'
const reason = 'DE: Das endgültige PNG (sha256:f2466e2594b783ca21cd08c61b0e99bd8e1dc7603885946456ae0b7ca3af9a5d) wurde direkt geprüft. AB, DC, EF und HG sind blau doppelt markiert; AD, BC, EH und FG grün dreifach; AE, BF, CG und DH rot. Die linke rosa Seitenfläche ist ADHE, die blaue Grundfläche ist ABCD. Zwei getrennte Führungslinien zeigen nun ausdrücklich in die jeweils zutreffende Fläche, sodass ADHE⊥ABCD nicht bloß an einem unklaren Pfeil hängt. AB⊥AE und ABCD∥EFGH stimmen. Das bestehende P-Profil wurde mit zwei eigenständigen Fällen erneut geprüft: Der neue Quader verlangt räumliche Richtungsargumente; das Dreiecksprisma unterscheidet AB⊥AC von AB nicht senkrecht BC. Diese Fälle sind nicht vom Bild ablesbar. E1/G1-AI-Kandidat ohne Humanfreigabe. EN: The final PNG was directly inspected. AB, DC, EF and HG carry matching blue double marks; AD, BC, EH and FG matching green triple marks; AE, BF, CG and DH red marks. The pink left side face is ADHE and the blue base is ABCD. Two separate leader lines now unambiguously point into their respective faces, so ADHE perpendicular to ABCD is clearly illustrated. AB perpendicular to AE and ABCD parallel to EFGH are correct. The retained P profile was rechecked against two independent cases: a fresh cuboid needs spatial direction arguments, and a triangular prism distinguishes AB perpendicular to AC from AB not perpendicular to BC. The image does not disclose these solutions. E1/G1 AI candidate, not human-approved.'
const reviewPath = `${here}/eb070-final.review.jsonl`
const configPath = `${here}/eb070-final.config.json`
const candidatesPath = `${here}/eb070-final.candidates.json`
await put(configPath, jsonBytes({
  ...config,
  reviewId,
  reviewPath,
  scope: {
    label: 'One final eb070 PNG with separate face leader lines and independent P-v2 transfer cases',
    goalIds: [goalId],
  },
}))
await put(candidatesPath, jsonBytes({
  ...candidates,
  reviewId,
  reviewedAt: '2026-09-28T08:46:29.000Z',
  reviewer: 'Codex independent final-leader-PNG P-v2 content reinspection; AI candidate only',
  goals: [{
    ...candidates.goals[0],
    reason,
    profile: structuredClone(candidates.goals[0].profile),
  }],
}))
await put(`${here}/eb070-provenance.json`, jsonBytes({
  schemaVersion: 1,
  purpose: 'Third independently inspected, final-byte P binding after separate face leader correction; previous drafts inactive',
  previousFiles: Object.entries(priorFiles).map(([key, path]) => ({ path, sha256: `sha256:${priorHashes[key]}` })),
  imageSha256: `sha256:${imageSha}`,
  imagePaths,
  imageUrl: url,
  reinspection: reason,
  outputConfigPath: configPath,
  outputCandidatesPath: candidatesPath,
  outputReviewPath: reviewPath,
  authority: 'needs_human_review; ai_candidate; E1/G1; no human approval',
}))
