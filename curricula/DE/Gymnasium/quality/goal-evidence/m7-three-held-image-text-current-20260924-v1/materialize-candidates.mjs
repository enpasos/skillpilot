import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// This transposes three individually re-inspected profiles. The source records
// are pinned so the content cannot silently drift. The standard P-v2
// materializer computes all current fingerprints and validates the records.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const here = dirname(fileURLToPath(import.meta.url))
const sourceBase = 'curricula/DE/Gymnasium/quality/goal-evidence/'
const pins = [
  {
    goalId: '1b70498a-62a0-5a84-99dd-476b8af68da6',
    path: `${sourceBase}m7-functions-diagrams-next10-p-20260923-v1/text-only-three-after-c19-image-20260923-v1.review.jsonl`,
    fileSha: 'e990c4c03d588005f1a15197079f19c4a3e629f657164a65faea60bf63fee817',
    profileFingerprint: 'sha256:00b2b584f977634a51f1985901fcf3be13a790d597361cb0b7299b7775fc9352',
    reason: 'Current text-only AI candidate re-inspected against the E-phase modeling goal and its GoalBook context. In the two fresh cases, P(d)=4+2d correctly models constant fare per kilometre, while H(t)=-t²+4t+1 matches heights 1,4,5 m at t=0,1,2 s, gives H(3)=4 m and has a physically limited flight interval ending at 2+sqrt(5) s. The cases independently test model selection, parameter meaning and contextual limits without borrowing an unapproved image. The former ball-fall image contradicts its own height-time curve and is no longer linked; V remains HOLD.',
    dissent: [],
  },
  {
    goalId: '2231c29b-eb4e-51ae-9cb1-eb033bf16099',
    path: `${sourceBase}canonical-math-positive-understanding-evidence-batch-001-final-20-v2.review.jsonl`,
    fileSha: 'a7223554f9e32c70d34f6a984ca553da58087a212c63009e1d96672d27a75172',
    profileFingerprint: 'sha256:af7b87832bebeb0f68b9a6d90963080b96e46dfb84bd0309b3e5e84199a83ca8',
    reason: 'Current text-only AI candidate re-inspected against the J5 goal and page context. One case classifies rotated line and segment pairs by geometric conditions, not page orientation; the changed case distinguishes non-intersecting visible segments from parallel supporting lines and detects a right angle only after extension. This matches recognition, mathematical language and justification without requiring construction. The former image had falsely marked non-right angles and was unlinked; no visual evidence is claimed and V remains HOLD.',
    dissent: [],
  },
  {
    goalId: '944dd479-9f30-5acb-ab32-3ea0b6dc8e06',
    path: `${sourceBase}m7-q2-bodies-volume-keep9-p-20260923-v1/text-only-six.review.jsonl`,
    fileSha: '8b8cae94331974897367ef42e6e6aef9afdb7a5550da3fb6c7be433686ba4048',
    profileFingerprint: 'sha256:0da4a3b730f3e43bee345108591d649a29c22065fac4f091856e675029965ad8',
    reason: 'Current text-only AI candidate re-inspected against the Q2 scalar-triple-product goal and GoalBook page. In a fixed right-handed frame the axis-aligned case yields b×c=(12,0,0), [a,b,c]=24 cm³ and [a,c,b]=-24 cm³; the independent oblique case yields b×c=(-1,-2,1), [a,b,c]=-3 cm³ and volume 3 cm³. Sign follows orientation and absolute value gives the nonnegative volume. The former image had contradictory vector and axis directions and is unlinked; no visual evidence is claimed and V remains HOLD.',
    dissent: ['The former image depicted a=(2,0,0) to the right while its positive x-axis ran down-left. Its coordinate geometry is not usable as evidence.'],
  },
]

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const sourceRecord = async ({ goalId, path, fileSha, profileFingerprint }) => {
  const bytes = await readFile(resolve(root, path))
  if (sha(bytes) !== fileSha) throw new Error(`Pinned source changed: ${path}`)
  const matches = bytes.toString('utf8').trim().split('\n').map(JSON.parse).filter((record) => record.goalId === goalId)
  if (matches.length !== 1) throw new Error(`Expected one source record for ${goalId}`)
  const record = matches[0]
  if (record.profileFingerprint !== profileFingerprint || record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate') {
    throw new Error(`Source content or candidate authority changed for ${goalId}`)
  }
  return record
}

const landscape = JSON.parse(await readFile(resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')))
const goals = []
for (const pin of pins) {
  const current = landscape.goals.find((goal) => goal.id === pin.goalId)
  if (!current || current.type !== 'atomic' || (current.resourceLinks ?? []).length !== 0) {
    throw new Error(`${pin.goalId}: expected current atomic goal without an image link`)
  }
  const old = await sourceRecord(pin)
  goals.push({
    goalId: pin.goalId,
    reason: pin.reason,
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    dissent: pin.dissent,
    profile: old.profile,
  })
}
const candidateSet = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: 'canonical-math-positive-understanding-evidence-m7-three-held-image-text-current-20260924-v1',
  reviewedAt: '2026-09-24T17:20:00Z',
  reviewer: 'codex-math-m7-text-profile-current-reinspection-2026-09-24',
  goals,
}
const bytes = Buffer.from(`${JSON.stringify(candidateSet, null, 2)}\n`)
const target = resolve(here, 'positive-evidence.candidates.json')
if (process.argv.includes('--write')) {
  await writeFile(target, bytes)
} else if (!(await readFile(target)).equals(bytes)) {
  throw new Error('Generated candidates differ from the pinned, re-inspected sources')
}
console.log(`${target}: sha256:${sha(bytes)}`)
