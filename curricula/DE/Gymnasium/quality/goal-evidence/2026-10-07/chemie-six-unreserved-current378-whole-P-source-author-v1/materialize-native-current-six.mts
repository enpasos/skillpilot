// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../..')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (bytes: any) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const bind = (path: string) => ({ path: relative(root, path), sha256: sha(readFileSync(path)), bytes: readFileSync(path).length })
const write = (name: string, value: unknown) => { const path = join(here,name); mkdirSync(dirname(path),{recursive:true}); writeFileSync(path,JSON.stringify(value,null,2)+'\n') }
const { loadGoalBookBuildInputs } = await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href)
const { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile } = await import(pathToFileURL(join(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const { normalizeGoalEvidenceText, stableGoalEvidenceJson } = await import(pathToFileURL(join(root,'app/scripts/goalEvidenceProfileModel.ts')).href)
const reg = read(join(root,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'))
const chem = reg.subjects.find((x: any) => x.subject === 'chemie')
const guard = read(join(here,'declared-current-input-bindings.actual.json'))
const landscapePath = join(root,chem.landscapePath)
const original = guard.inputBindings.find((x: any) => x.path === chem.landscapePath)
if (bind(landscapePath).sha256 !== 'sha256:'+original.sha256) throw new Error('Canonical drift before native materialization')
const landscape = read(landscapePath)
const byId = new Map(landscape.goals.map((x: any) => [x.id,x]))
const kinds = read(join(root,chem.semanticKindLedgerPath))
const kindById = new Map(kinds.decisions.map((x: any) => [x.goalId,x.semanticKind]))
const selected = guard.selectedGoalIds
const cases = read(join(here,'twelve-whole-cases.de-en.author-candidate.json')).cases
const sourceMap = read(join(here,'six-goal-original-source-duties-and-author-readiness.json'))
const vById = new Map(read(join(root,chem.visualizationQaPath)).records.map((x: any) => [x.goalId,x]))
const mc = read(join(root,chem.memoryReviewConfigPath))
const memoryById = new Map(readFileSync(join(root,mc.reviewPath),'utf8').split('\n').filter(Boolean).map((l: string) => { const x=JSON.parse(l);return[x.goalId,x] }))
const atomicRecords: any[] = []
for (const configPath of chem.semanticAtomicityConfigPaths) {
  const cfg = read(join(root,configPath))
  for (const [index,line] of readFileSync(join(root,cfg.reviewPath),'utf8').split('\n').entries()) {
    if (!line) continue
    const row=JSON.parse(line)
    if (selected.includes(row.goalId)) atomicRecords.push({configPath,reviewPath:cfg.reviewPath,line:index+1,row})
  }
}
const semanticFingerprint = (g: any, ruleVersion: string) => sha(stableGoalEvidenceJson({ ruleVersion, goalId:g.id,shortKey:g.shortKey??'',
  title:normalizeGoalEvidenceText(g.title),titleEn:normalizeGoalEvidenceText(g.titleEn),description:normalizeGoalEvidenceText(g.description),descriptionEn:normalizeGoalEvidenceText(g.descriptionEn),
  phase:normalizeGoalEvidenceText(g.dimensionTags?.phase),area:normalizeGoalEvidenceText(g.dimensionTags?.area),topicCode:normalizeGoalEvidenceText(g.dimensionTags?.topicCode),nodeKind:normalizeGoalEvidenceText(g.nodeKind) }))
const currentBindings = selected.map((goalId: string) => {
  const goal:any=byId.get(goalId), a=atomicRecords.filter((x: any) => x.row.goalId===goalId && x.row.status==='atomic' && x.row.semanticAtomic===true && x.row.fingerprint===semanticFingerprint(goal,x.row.ruleVersion))
  const m:any=memoryById.get(goalId),v:any=vById.get(goalId)
  if (!a.length || !m || m.fingerprint!==semanticFingerprint(goal,m.ruleVersion) || !['no_memory_needed','memory_required'].includes(m.status)) throw new Error('A/M not current: '+goalId)
  const canonicalDigest=sha(readFileSync(join(root,v.canonicalAssetPath))),publicDigest=sha(readFileSync(join(root,v.publicAssetPath)))
  const primary=goal.resourceLinks.find((x: any) => x.type==='goal-visualization' && x.role==='primary')
  if (v.aiApproved!=='yes' || canonicalDigest!==v.aiApprovedAssetSha256 || canonicalDigest!==v.assetSha256 || canonicalDigest!==publicDigest || primary.url!==v.imageUrl || v.title!==goal.title || v.description!==goal.description) throw new Error('V not current: '+goalId)
  return {goalId, title:goal.title, A:{validExistingRecords:a, repeatedScientificReview:false},M:{configBinding:bind(join(root,chem.memoryReviewConfigPath)),reviewBinding:bind(join(root,mc.reviewPath)),existingWholeRecord:m,
    repeatedDecisionOrCardReview:false, visibilityAndCardChange:false, currentFullMemoryGateCount:378}, V:{existingWholeRecord:v,actualCanonicalBinding:bind(join(root,v.canonicalAssetPath)),actualPublicBinding:bind(join(root,v.publicAssetPath)),sameCurrentPrimaryURL:true,repeatedVisualReview:false,newImage:false},
    descriptionAndPScienceStatus:'author_candidate_independent_review_pending',sourceStatus:sourceMap.entries.find((x:any)=>x.goalId===goalId).status}
})
write('actual-current-six-A-M-V-bindings.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'exact current unchanged evidence routing, not new scientific review',entries:currentBindings})

// Reuse a sealed existing pure review-universe config; it reads current canonical/kinds.
// This exports whole selected pages/context without publication, HTML/PDF or a full build.
const pureConfig='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-current480-atomic-prerequisite-remediation-author-v7/candidate/baseline-native-book.config.json'
const model = await loadGoalBookBuildInputs(pureConfig,root)
if (model.model.pages.length!==378) throw new Error('Unexpected current pure page count')
const pages=selected.map((id:string)=>model.model.pages.find((x:any)=>x.goalId===id))
if (pages.some((x:any)=>!x)) throw new Error('Selected page missing')
write('native/current-six-whole-pages-and-contexts.raw.json',{schemaVersion:1,role:'actual whole current native pure-model page inputs; no new D review',projectionRole:'sealed full378 review universe, not asserted identical active atlas navigation',configBinding:bind(join(root,pureConfig)),nativeWholePageCount:378,selectedWholePages:pages})

const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'
const criteriaFingerprint=sha(readFileSync(join(root,criteriaPath)))
const reviewId='chemie-six-current378-author-positive-candidates-20261007-v1'
const records=selected.map((goalId:string)=>{
  const goal:any=byId.get(goalId),own=cases.filter((x:any)=>x.candidateGoalId===goalId)
  const entry=sourceMap.entries.find((x:any)=>x.goalId===goalId)
  if (own.length!==2)throw new Error('Case count mismatch')
  const archetype=goalId.startsWith('416')?'experiment':goalId.startsWith('466')?'representation':['62b','8ed'].some(x=>goalId.startsWith(x))?'modeling':'concept'
  const expectationId=goalId.slice(0,8)+'-bounded-positive-understanding'
  const profile={archetype,expectations:[{id:expectationId,essentialUnderstandingDe:own[0].essentialUnderstanding.de,essentialUnderstandingEn:own[0].essentialUnderstanding.en,
    observablePerformanceDe:own.map((x:any)=>x.learnerTask.de).join(' Zweiter Fall: '),observablePerformanceEn:own.map((x:any)=>x.learnerTask.en).join(' Second case: ')}],
    coverageExpectations:{requiredExpectationIds:[expectationId],alternativeExpectationGroups:[],minimumIndependentDemonstrations:2,freshVariationRequired:true,independentTransferRequired:true},
    variationAxes:[{id:'new-material-whole-case-transfer',textDe:'Verändere die konkret bereitgestellten Daten oder das Material und begründe den neuen ganzen Fall; die Modellantwort und das vorherige Ergebnis allein sind kein Lernendennachweis.',textEn:'Change the supplied data or material and justify the new whole case; the model answer and previous result alone are not learner evidence.'}],
    applicationCaseBriefs:own.map((x:any)=>({id:x.caseLocalKey,taskDemandDe:x.material.de.join(' ')+' '+x.learnerTask.de+' Transfer: '+x.transferOrCountercase.de.task,
      taskDemandEn:x.material.en.join(' ')+' '+x.learnerTask.en+' Transfer: '+x.transferOrCountercase.en.task,
      expectedPerformanceDe:x.expectedResponseOrSolution.de+' Transfer: '+x.transferOrCountercase.de.expected,
      expectedPerformanceEn:x.expectedResponseOrSolution.en+' Transfer: '+x.transferOrCountercase.en.expected,
      understandingFocusDe:x.essentialUnderstanding.de,understandingFocusEn:x.essentialUnderstanding.en}))}
  const v:any=vById.get(goalId),resourceDigests={[v.imageUrl]:sha(readFileSync(join(root,v.canonicalAssetPath)))}
  return {$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteriaFingerprint,
    landscapeId:landscape.landscapeId,goalId,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,kindById.get(goalId)),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFingerprint,resourceDigests,kindById.get(goalId)),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(profile),
    status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'chemistry_open_packets author; no independent A/B scientific review yet',reason:'New twelve whole bilingual science cases, exactly bound to unchanged current goal/image. Source/description dissent retained. This is an inert authored candidate, not scientific approval or learner-performance evidence.',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:[entry.reason,...own.map((x:any)=>x.materialAndSourceLimitations.en)],profile}
})
writeFileSync(join(here,'native/positive-six.author-candidate.records.jsonl'),records.map((x:any)=>JSON.stringify(x)).join('\n')+'\n')
write('native/positive-six.inactive.config.json',{$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
  landscapeId:landscape.landscapeId,landscapePath:chem.landscapePath,semanticKindLedgerPath:chem.semanticKindLedgerPath,reviewCriteriaPath:criteriaPath,reviewPath:relative(root,join(here,'native/positive-six.author-candidate.records.jsonl')),reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'],requireApproved:false,
  scope:{label:'Six unchanged-current authored P candidates; unresolved source/description holds; not active and not scientific approval',goalIds:selected}})
if (bind(landscapePath).sha256 !== 'sha256:'+original.sha256)throw new Error('Canonical drift during native materialization')
console.log(JSON.stringify({currentAMVExact:6,newScientificApprovals:0,newImages:0,wholeNativePagesExported:6,wholePureUniverse:378,wholeNewCases:12,inertPositiveProfiles:6,strictGain:0,sourceWholeDutiesCleared:0,activeWrites:false}))
