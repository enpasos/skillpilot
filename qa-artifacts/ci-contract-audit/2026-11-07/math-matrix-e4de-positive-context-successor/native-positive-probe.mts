import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const root = process.cwd()
const { reviewPositiveGoalEvidenceConfig } = await import(pathToFileURL(resolve(root, 'app/scripts/positiveGoalEvidenceReview.ts')).href)
const mode = process.argv[2]
const old = 'qa-artifacts/ci-contract-audit/2026-11-06/math-three-current-positive-candidates-2026-11-06/'
const next = 'qa-artifacts/ci-contract-audit/2026-11-07/math-matrix-e4de-positive-context-successor/'
const configs = mode === 'old31' ? ['image-two','image-free-one','retained-0','retained-1','retained-2'].map(name => old+name+'.config.json')
  : mode === 'new31' ? [next+'diagram-retained.config.json',next+'matrix.config.json',old+'image-free-one.config.json',
    ...['retained-0','retained-1','retained-2'].map(name => old+name+'.config.json')]
  : [next+'matrix.config.json']
const output = configs.map(path => {
  const result = reviewPositiveGoalEvidenceConfig(path)
  return { configPath:path, reviewPath:result.config.reviewPath, goalIds:result.config.scope.goalIds,
    counts:result.counts, errors:result.errors, records:result.records.map(row => ({ goalId:row.goalId,
      reviewInputFingerprint:row.reviewInputFingerprint, goalFingerprint:row.goalFingerprint,
      profileFingerprint:row.profileFingerprint,status:row.status,reviewAuthority:row.reviewAuthority,
      reviewedAt:row.reviewedAt,reviewer:row.reviewer })) }
})
const sourceRaw = readFileSync(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))
console.log(JSON.stringify({ sourceSha256:createHash('sha256').update(sourceRaw).digest('hex'),mode,
  totalScope:output.reduce((n,r)=>n+r.goalIds.length,0), errors:output.flatMap(r=>r.errors),configs:output },null,2))
if(output.some(row=>row.errors.length))process.exitCode=1
