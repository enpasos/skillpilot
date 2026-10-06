import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs, type GoalBookSourceAtlasInputConfig } from '../app/scripts/goalBookSourceAtlasInputs'

const root = resolve('tmp/biologie-neuro-he-nw-two-components-v3-sparse-root')
const out = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-he-original-spelling-nw-two-source-components-author-v3')
const config = JSON.parse(readFileSync(resolve(root, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'), 'utf8')) as GoalBookSourceAtlasInputConfig
const write = (name: string, value: unknown) => writeFileSync(resolve(out, name), `${JSON.stringify(value, null, 2)}\n`)
let originalFailure: string | null = null
try {
  buildGoalBookSourceAtlasInputs(config, root)
} catch (error) {
  originalFailure = String(error)
}
if (!originalFailure?.includes('375 !== 383')) throw new Error(`Unexpected original-contract result: ${originalFailure}`)
const diagnostic = { ...config, expectedCurricularAtomicGoalCount: 375 }
const result = buildGoalBookSourceAtlasInputs(diagnostic, root)
const ids = ['5b2571d9-f079-52b2-b21b-8f389c7409f4', '49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd']
const scopes = result.receipt.scopes as Array<{key:string, goalIds:string[], witnesses:Array<Record<string, unknown>>}>
const nw = scopes.find(s => s.key === 'DE-NW/SekI/')!
if (!nw || !ids.every(id => nw.goalIds.includes(id))) throw new Error('Protected NRW bacterial target restoration failed')
const oldReceipt = JSON.parse(readFileSync(resolve('tmp/biologie-neuro21-v2-independent-a-primary/native-inputs/app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json'), 'utf8'))
write('native-source-component.author-v3.actual.receipt.json', {
  schemaVersion: 1,
  createdAtUTC: new Date().toISOString(),
  nativeCodePath: 'app/scripts/goalBookSourceAtlasInputs.ts',
  nativeCodeSha256: createHash('sha256').update(readFileSync(resolve('app/scripts/goalBookSourceAtlasInputs.ts'))).digest('hex'),
  original383SourceAtlasContract: { expected:383, status:'FAIL', actual:375, error:originalFailure },
  diagnosticOnlyCount:375,
  diagnosticCountIsNoGateOverrideOrApproval:true,
  nativeDiagnosticCounts:result.receipt.counts,
  NRWProtectedGoalsActuallyPresent:ids,
  NRWCurrentWitnesses:nw.witnesses.filter(w => ids.includes(String(w.goalId))),
  all20NativeSourceScopes:scopes.map(s=>({key:s.key,goalIds:s.goalIds})),
  effectiveInputBindings:result.receipt.inputBindings,
  proposedComponentSourceIds:['22637879-a1cf-5128-bd59-2a2e12d8c193','23c1ecdb-9a65-5e24-bb22-88852b178638'],
  sourceDecisionScope:'bacterial structure/reproduction components only; viral duties and whole IF7 remain held',
  oldReceiptSchemaVersion:oldReceipt.schemaVersion,
  activeWrites:false,
  strictCompletionsAdded:0,
  restoredActiveBindings:0,
  authorCandidateRestoredProtectedNRWTargets:2,
  independentReviewPending:true,
  wholeSourceClearance:false,
  humanApproval:false,
  humanTrial:false,
  integrable:false,
})
console.log(JSON.stringify({nativeDiagnosticCounts:result.receipt.counts,protectedNRWTargetsPresent:2,original383Contract:'FAIL375',activeWrites:false,strictGain:0}))
