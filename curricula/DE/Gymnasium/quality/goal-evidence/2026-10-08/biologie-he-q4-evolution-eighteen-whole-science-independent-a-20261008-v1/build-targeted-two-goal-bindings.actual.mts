import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

// Inactive review artifacts only. No source file, active ledger or registry is written.
const own = path.relative(process.cwd(), path.dirname(new URL(import.meta.url).pathname))
const read = async (p: string) => JSON.parse(await fs.readFile(p, 'utf8'))
const write = async (name: string, data: unknown) => fs.writeFile(`${own}/${name}`, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' })
const sha = (s: string | Buffer) => `sha256:${createHash('sha256').update(s).digest('hex')}`
const stable = (v: any): string => Array.isArray(v) ? '[' + v.map(stable).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}' : JSON.stringify(v)
const normalized = (s: unknown) => typeof s === 'string' ? s.normalize('NFKC').replace(/\s+/g, ' ').trim() : ''
const amFingerprint = (g: any, ruleVersion: string) => sha(stable({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalized(g.title),titleEn:normalized(g.titleEn),description:normalized(g.description),descriptionEn:normalized(g.descriptionEn),phase:normalized(g.dimensionTags?.phase),area:normalized(g.dimensionTags?.area),topicCode:normalized(g.dimensionTags?.topicCode),nodeKind:normalized(g.nodeKind)}))
const pCfg = await read(`${own}/P18.independent-a.config.json`)
const land = await read(pCfg.landscapePath)
const ledger = await read(pCfg.semanticKindLedgerPath)
const proposals = await read(`${own}/input-snapshots/proposed-eighteen-whole-DEEN-bodies.targeted-two-goal-wording-author.json`)
const changed = new Set(proposals.patches.map((p:any)=>p.goalId))
if (changed.size !== 2 || proposals.patches.length !== 3) throw Error('exactly two goal IDs and three text fields')
for (const p of proposals.patches) {
  const g=land.goals.find((x:any)=>x.id===p.goalId)
  if (g[p.field] !== p.before) throw Error('unexpected original goal field')
  g[p.field]=p.after
}
const by = new Map(land.goals.map((g:any)=>[g.id,g]))
const now = new Date().toISOString()
const reasons: Record<string,{a:string,m:string}> = {
  '302c6d6d-bf10-5dbc-adda-65e4b5c63e49': {
    a:'Independent A targeted judgment of the whole bilingual corrected goal: reconstructing human evolution combines fossil history, hypothetical phylogenetic branching and dispersal into one coherent evidence-based representation. These are complementary evidence dimensions, not unrelated routine bundles. The English phylogenetic-tree correction removes misleading individual family genealogy without broadening the competence.',
    m:'Independent A targeted judgment of the whole corrected goal: the cases supply dates, traits and geographical evidence; performance requires interpreting a branching and incomplete evolutionary history. A separate species/date recall deck is neither necessary nor sufficient for this competence. The translation repair introduces no memorization duty.'
  },
  '35b016d8-ed2c-570c-ab64-ac39f8f962b2': {
    a:'Independent A targeted judgment of the whole bilingual corrected goal: applying cladistics and molecular evidence serves one assessable output, a justified phylogenetic-tree hypothesis. Comparing those evidence channels is integral to construction rather than an unrelated second goal. Correcting Stammbauerkonstruktion and family-tree terminology clarifies the same competence.',
    m:'Independent A targeted judgment of the whole corrected goal: supplied polarized trait and aligned-sequence matrices are analyzed to construct and compare phylogenetic hypotheses. Method understanding, homoplasy caution and interpretation of supplied evidence are central; a separate terminology or organism-name recall deck is not required. The wording repair creates no new recall obligation.'
  }
}
await write('canonical.targeted-two-goal.inactive.candidate.json',land)
const originalDecisions=structuredClone(ledger.decisions)
for(const d of ledger.decisions) if(changed.has(d.goalId)) {
  d.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(d.goalId) as any)
  // Existing classification is retained for this explicitly inactive candidate.
  // This does not grant new authoritative or human classification acceptance.
}
ledger.sourceLandscapePath=`${own}/canonical.targeted-two-goal.inactive.candidate.json`
await write('semantic-kinds.targeted-two-goal.inactive.candidate.json',ledger)
const receipts:any[]=[]
for(const [kind,base,out,configName] of [
  ['A','A18.exact-retained-current.review.jsonl','A18.retained-sixteen-plus-two-targeted.review.jsonl','A18.targeted-two-goal.config.json'],
  ['M','M18.exact-retained-current.review.jsonl','M18.retained-sixteen-plus-two-targeted.review.jsonl','M18.targeted-two-goal.config.json']
] as const) {
  const lines=(await fs.readFile(`${own}/input-snapshots/${base}`,'utf8')).trimEnd().split('\n')
  let retained=0, targeted=0
  const output=lines.map(line=>{
    const r=JSON.parse(line)
    if(!changed.has(r.goalId)){retained++;return line}
    const prior=structuredClone(r)
    r.fingerprint=amFingerprint(by.get(r.goalId),r.ruleVersion)
    r.reviewedAt=now
    r.reviewer='codex-evolution18-independent-a-targeted-whole-goal-review'
    r.reason=reasons[r.goalId][kind==='A'?'a':'m']
    targeted++
    receipts.push({kind,goalId:r.goalId,priorDecision:prior,targetedDecision:r,judgment:'whole-goal-scientific-rationale-before-native-check',humanApproval:false})
    return JSON.stringify(r)
  })
  if(retained!==16||targeted!==2)throw Error('16 retained and 2 targeted required')
  await fs.writeFile(`${own}/${out}`,output.join('\n')+'\n',{flag:'wx'})
  const cfg=await read(`${own}/${kind}18.retained-independent-a.config.json`)
  cfg.landscapePath=`${own}/canonical.targeted-two-goal.inactive.candidate.json`
  cfg.reviewPath=`${own}/${out}`
  cfg.scope.label='Same eighteen whole evolution goals: sixteen exact retained decisions and two independently judged wording corrections; inactive candidate, no human approval'
  cfg.reportPath=`${own}/${kind}18.targeted-two-goal.native-report.actual.md`
  await write(configName,cfg)
}
const pLines=(await fs.readFile(pCfg.reviewPath,'utf8')).trimEnd().split('\n')
const criteria=sha(await fs.readFile(pCfg.reviewCriteriaPath))
let pRetained=0,pTargeted=0
const pOutput=pLines.map(line=>{
  const r=JSON.parse(line)
  if(!changed.has(r.goalId)){pRetained++;return line}
  const prior=structuredClone(r), g=by.get(r.goalId) as any
  const k=ledger.decisions.find((d:any)=>d.goalId===r.goalId)
  r.goalFingerprint=fingerprintGoalForPositiveEvidence(g,k.semanticKind)
  r.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(g,criteria,{},k.semanticKind)
  r.reviewedAt=now
  r.reviewer='codex-evolution18-independent-a-targeted-whole-goal-review'
  r.reason='Independent A read the whole corrected DE/EN goal, both full bilingual cases and whole profile. The wording corrections remove a literal translation ambiguity and typo while preserving the assessable scientific meaning. Exact profile body retained. Source interpretation is bounded; operative source replacement and final image D/P/V reviews remain pending. AI candidate only.'
  if(r.status!=='needs_human_review'||r.reviewAuthority!=='ai_candidate'||r.evidenceLevel!=='E1'||r.maximumClaimScope!=='G1')throw Error('candidate scope changed')
  pTargeted++;receipts.push({kind:'P',goalId:r.goalId,priorBinding:{goalFingerprint:prior.goalFingerprint,reviewInputFingerprint:prior.reviewInputFingerprint,profileFingerprint:prior.profileFingerprint},targetedBinding:{goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint},wholeProfileBodyExact:stable(r.profile)===stable(prior.profile),humanApproval:false})
  return JSON.stringify(r)
})
if(pRetained!==16||pTargeted!==2)throw Error('P16 retained and P2 rebound required')
await fs.writeFile(`${own}/P18.retained-sixteen-plus-two-targeted.review.jsonl`,pOutput.join('\n')+'\n',{flag:'wx'})
pCfg.landscapePath=`${own}/canonical.targeted-two-goal.inactive.candidate.json`
pCfg.semanticKindLedgerPath=`${own}/semantic-kinds.targeted-two-goal.inactive.candidate.json`
pCfg.reviewPath=`${own}/P18.retained-sixteen-plus-two-targeted.review.jsonl`
pCfg.scope.label='Eighteen same whole biology evolution profiles on two precisely corrected inactive whole goals; sixteen profile records byte-retained, two P binding corrections; no imagery or human approval'
await write('P18.targeted-two-goal.config.json',pCfg)
await write('A-M-P.targeted-two-goal-binding-review.actual.json',{schemaVersion:1,checkedAt:now,activeWrites:false,wholeScopeGoalCount:18,retainedARecords:16,targetedARecords:2,retainedMRecords:16,targetedMRecords:2,retainedPRecords:16,targetedPBindings:2,totalCurricularAtomicDenominator:391,sourceBindingIntegrationApproved:false,classification:'Existing curricularAtomic decisions retained on inactive candidate; exactly two source fingerprints rebound, no new authoritative classification claim',unchangedClassifierRecords:ledger.decisions.filter((d:any)=>!changed.has(d.goalId)).every((d:any)=>stable(d)===stable(originalDecisions.find((o:any)=>o.goalId===d.goalId))),receipts,patches:proposals.patches,humanApproval:false,learnerEvidence:false,imageReviewCount:0})
console.log(JSON.stringify({inactiveCandidate:true,activeWrites:false,A16ExactPlus2Judged:true,M16ExactPlus2Judged:true,P16ExactPlus2Rebound:true}))
