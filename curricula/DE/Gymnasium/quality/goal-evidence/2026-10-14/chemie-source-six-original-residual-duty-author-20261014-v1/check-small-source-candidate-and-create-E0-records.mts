// Apache-2.0. Explicit small chemistry candidates only; no global runtime/status writes.
import{readFileSync,writeFileSync}from'node:fs';import{createHash}from'node:crypto';import{createRequire}from'node:module';import{resolve,relative}from'node:path';import{fileURLToPath}from'node:url'
import{fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics}from'/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
import{normalizeGoalEvidenceText,stableGoalEvidenceJson}from'/home/enpasos/projects/skillpilot/app/scripts/goalEvidenceProfileModel.ts'
import{reviewPositiveGoalEvidenceConfig}from'/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts'
import{normalizeCanonicalLandscape,validateCanonicalLandscape}from'/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
import{compileCompositionView,normalizeCompositionView}from'/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import{collectAuthoritativeTargetAtomicGoalIds}from'/home/enpasos/projects/skillpilot/app/scripts/compositionViewSourceCoverage.ts'
import{prepareLandscapeEntries}from'/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'
import{evaluateCourseLevelMappingConsistency}from'/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
const R='/home/enpasos/projects/skillpilot',O=resolve(fileURLToPath(new URL('.',import.meta.url))),read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),at=(p:string)=>read(resolve(R,p)),rel=(p:string)=>relative(R,p)
const write=(n:string,x:unknown)=>writeFileSync(resolve(O,n),JSON.stringify(x,null,2)+'\n'),sha=(x:string|Buffer)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const require=createRequire(R+'/app/package.json'),Ajv=require('ajv/dist/2020').default,ajv=new Ajv({strict:true,allErrors:true});require('ajv-formats')(ajv)
const cp=resolve(O,'candidate/canonical536.prospective409-six-residual-duties.author-only.json'),c=read(cp),b=read(resolve(O,'inputs/canonical533.actual280-reference.immutable-hardlink.json'))
const by=new Map(c.goals.map((g:any)=>[g.id,g])),beforeBy=new Map(b.goals.map((g:any)=>[g.id,g]))
const bc=validateCanonicalLandscape(normalizeCanonicalLandscape(b)),ac=validateCanonicalLandscape(normalizeCanonicalLandscape(c))
const newCanonicalErrors=ac.filter((e:any)=>e.severity==='error'&&!bc.some((x:any)=>JSON.stringify(e)===JSON.stringify(x)));if(newCanonicalErrors.length)throw new Error(JSON.stringify(newCanonicalErrors))
const em=new Map(prepareLandscapeEntries([c]).flatMap(x=>x.goals).map(g=>[g.id,g])),bem=new Map(prepareLandscapeEntries([b]).flatMap(x=>x.goals).map(g=>[g.id,g]))
const ledger=read(resolve(O,'inputs/semantic533.current407.immutable-hardlink.json')),ordinary=new Set(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic'&&d.decisionStatus==='authoritative').map((d:any)=>d.goalId))
function dependencies(id:string,m=em,gm=by){const q=[...(m.get(id)?.effectiveRequires??[])],seen=new Set<string>();while(q.length){const n=q.pop()!;if(seen.has(n))continue;seen.add(n);q.push(...(m.get(n)?.effectiveRequires??[]),...((gm.get(n)as any)?.contains??[]))}return[...seen]}
const vcs=read(resolve(O,'CAS.eight-existing-whole-view-successors-no-target-removals.author-only.json')).views
const views=vcs.map((v:any)=>{
 const before=at(v.before.path),after=at(v.afterUnactivatedCandidate.path),bt=collectAuthoritativeTargetAtomicGoalIds(b,before),ct=collectAuthoritativeTargetAtomicGoalIds(c,after)
 const compBefore=compileCompositionView(normalizeCompositionView(before),b),compAfter=compileCompositionView(normalizeCompositionView(after),c)
 const newErrors=compAfter.findings.filter((f:any)=>f.severity==='error'&&!compBefore.findings.some((x:any)=>JSON.stringify(x)===JSON.stringify(f)))
 const added=[...ct].filter(i=>!bt.has(i)),lost=[...bt].filter(i=>!ct.has(i));if(newErrors.length||lost.length)throw new Error(JSON.stringify({newErrors,lost}))
 const newDependenciesOfExistingTargets=[...bt].flatMap(i=>{const old=new Set(dependencies(i,bem,beforeBy));return dependencies(i).filter(d=>!old.has(d)).map(d=>({target:i,dependency:d}))})
 if(newDependenciesOfExistingTargets.length)throw new Error('Old targets acquired new global prerequisites')
 return{viewId:after.viewId,scope:after.scope,beforeTargets:bt.size,afterTargets:ct.size,added,lost,newCompileErrors:newErrors,
  newDependenciesOfExistingTargets,addedGoalAcquisition:added.map(i=>({goalId:i,wholeEffectivePrerequisites:dependencies(i),missingOrdinaryTargetPrerequisites:dependencies(i).filter(d=>ordinary.has(d)&&!ct.has(d))})),
  wholeCourseScopeNotApproved:true,actualClassroomChoiceNotClaimed:true}
})
const sc=read(resolve(O,'CAS.six-whole-source-cells-five-carriers-and-one-parent-literal-restoration.author-only.json'))
const sourceByPath=new Map<string,any>(),beforeMaps:any[]=[],afterMaps:any[]=[]
for(const m of sc.wholeMappingCarriers){const old=at(m.before.path),a=at(m.afterUnactivatedCandidate.path);beforeMaps.push({...old,file:m.before.path});afterMaps.push({...a,file:m.before.path});sourceByPath.set(old.sourceExtractionPath,at(old.sourceExtractionPath));sourceByPath.set(a.sourceExtractionPath,at(a.sourceExtractionPath));
 const source=sourceByPath.get(a.sourceExtractionPath),sourceIds=new Set(source.sourceGoals.map((g:any)=>g.id)),dec=new Map(a.decisions.map((d:any)=>[d.sourceGoalId,d]));
 for(const id of m.ownedSourceIds){if(!sourceIds.has(id))throw new Error('Unknown original sourceID');const rows=a.mappings.filter((x:any)=>x.legacyGoalId===id);if(!rows.every((x:any)=>by.has(x.canonicalGoalId)&&x.reviewDecisionId===id&&x.matchType==='partial'))throw new Error('Invalid target/decision/PARTIAL join');const d=dec.get(id)as any;if(!d||d.decision!=='mapped'||d.canonicalGoalIds.length!==rows.length)throw new Error('Decision/union mismatch')}
}
const courseBefore=evaluateCourseLevelMappingConsistency(b,beforeMaps,sourceByPath),courseAfter=evaluateCourseLevelMappingConsistency(c,afterMaps,sourceByPath)
write('checks/STOCK.bounded-whole-canonical-eight-views-six-source-joins-and-course.actual.json',{schemaVersion:1,checkedAt:new Date().toISOString(),unchangedStockFunctions:true,
 candidateRawNodes:536,prospectiveAtomicCount:409,newCanonicalErrors,views,wholeSourceCellsJoined:6,originalCarrierAlternatives:5,courseBefore,courseAfter,
 threePreparationSourceAuthorityHoldsNotResolvedByTechnicalTargets:true,BBBEWholeBroadScopeAndM311NotApproved:true,newIndependentScienceVotes:0,hostWrites:false,activeWrites:false})
// Profiles: full case bytes, not the brief alone, are bound by the criteria digest.
const casePath=resolve(O,'cases/two-pending-whole-goals-four-complete-DEEN-cases.author.json'),cases=read(casePath)
const critPath=resolve(O,'P/criteria.complete-residual-two-E0-G0.md')
writeFileSync(critPath,'# Residual original duties: two unapproved whole-goal author candidates\n\nCC-BY-4.0. Whole cases: '+rel(casePath)+'\nSHA: '+sha(readFileSync(casePath))+'\n\nRead complete DE/EN goal, original primary/course/operator, prerequisites, both cases with actual inline materials, model answers and every rubric. Require all aspects and genuine changed-case transfer. Two independent evidence pieces may occur within one rich case; no extra task quota. These are unexecuted theoretical author designs,E0/G0,empty reviewRunIds. Pupil indicator experiments are separately retained in unchanged d2 and not performed by these paper cases. Preserve SN mandatory parent and recommended contexts as distinct original authority. No whole-course, source, A/M/D/V or human grant.\n')
const crit=sha(readFileSync(critPath)),reviewId='chemie-residual-six-two-whole-atoms-author-20261014-v1',now=new Date().toISOString(),validate=ajv.compile(at('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const records=cases.goals.map((g:any)=>{
 const profile={archetype:'concept',expectations:g.cases[0].rubric.map((x:any,i:number)=>({id:x.expectationId,essentialUnderstandingDe:x.fullCreditDe,essentialUnderstandingEn:x.fullCreditEn,
 observablePerformanceDe:g.cases.map((c:any)=>c.rubric[i].fullCreditDe).join(' '),observablePerformanceEn:g.cases.map((c:any)=>c.rubric[i].fullCreditEn).join(' ')})),
 coverageExpectations:{requiredExpectationIds:['e1','e2','e3','e4'],alternativeExpectationGroups:[],minimumIndependentDemonstrations:2,freshVariationRequired:true,independentTransferRequired:true},
 variationAxes:[{id:'changed-substrate-or-information',textDe:g.cases[1].transferDemandDe,textEn:g.cases[1].transferDemandEn}],
 applicationCaseBriefs:g.cases.map((x:any)=>({id:x.id,taskDemandDe:x.taskDemandDe,taskDemandEn:x.taskDemandEn,expectedPerformanceDe:x.modelAnswerDe,expectedPerformanceEn:x.modelAnswerEn,understandingFocusDe:x.transferDemandDe,understandingFocusEn:x.transferDemandEn}))}
 const goal=by.get(g.goalId)as any,r={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId,
 goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:crit,landscapeId:c.landscapeId,goalId:g.goalId,
 goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,crit,{},'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(profile),
 status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:now,reviewer:'Codex residual-duty AUTHOR only; no independent vote',
 reason:'Complete unexecuted DE/EN task materials, models and rubrics are authored and bound. E0/G0, no learner work or review-run claim. Explicit prospective kind is not new authoritative classification. Original source conditions, partial partner unions and separate actual practical duties remain.',
 evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],dissent:[],profile}
 if(!validate(r))throw new Error(JSON.stringify(validate.errors));const errors=validatePositiveGoalEvidenceRecordSemantics(r as any,goal,{},'curricularAtomic');if(errors.length)throw new Error(errors.join('\n'));return r
})
writeFileSync(resolve(O,'P/two-whole-goal-author-E0-G0.profiles.jsonl'),records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const pconfig={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaPath:rel(critPath),reviewedResourceTypes:['goal-visualization'],requireApproved:false,landscapeId:c.landscapeId,landscapePath:rel(cp),semanticKindLedgerPath:rel(resolve(O,'inputs/semantic533.current407.immutable-hardlink.json')),reviewPath:rel(resolve(O,'P/two-whole-goal-author-E0-G0.profiles.jsonl')),scope:{label:'Two unapproved residual-duty author candidates; no authoritative classifications',goalIds:records.map((r:any)=>r.goalId)}}
const vc=ajv.compile(at('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'));if(!vc(pconfig))throw new Error(JSON.stringify(vc.errors));write('config/P2.author-NONOPERATIVE-pending-kind.config.json',pconfig)
const full=reviewPositiveGoalEvidenceConfig(rel(resolve(O,'config/P2.author-NONOPERATIVE-pending-kind.config.json'))),errors=(full as any).errors??[]
if(errors.filter((e:string)=>e.includes('no authoritative semantic-kind decision')).length!==2||errors.length!==6)throw new Error(JSON.stringify(errors))
write('checks/STOCK.P2-schema-current-prospective-FP-and-normal-six-expected-kind-HOLDs.actual.json',{schemaVersion:1,checkedAt:now,lowLevelCurrentSchemasAndProspectiveKindFingerprintsPass:2,normalFullConfiguration:full,missingAuthoritativeKinds:2,dependentKindlessFingerprintFailures:4,newGateClosures:0})
const advice=records.map((r:any)=>({goalId:r.goalId,atomicRecommendation:'atomic',memoryRecommendation:'no_memory_needed',
 atomicityReasonDe:r.goalId.startsWith('c307')?'Eine kohärente elementare Substitution erklärt die Herstellung eines zweifunktionellen Monomers; Gesamtgleichung und Donator/Akzeptor allein ersetzen den Elektronenpaarweg nicht.':'Eine enge materialgestützte Einordnung verbindet Bedeutung, Verwendung und Umgang derselben sauren Alltagslösungen; kein zusätzliches Labor- oder tieferes pH-Erörterungsziel.',
 memoryReasonDe:r.goalId.startsWith('c307')?'Pfeile und Funktionalität sind aus Bindung, Polarität und Struktur zu erklären; vorgegebene Reste sind kein neuer Pflicht-Faktenabruf.':'Alle Stoff-/Gefahrenkarten und Namen stehen im Material; die Leistung ist beschreibende Zuordnung und Übertragung, keine zusätzliche Namenskartei.',
 independentAMDecisionPending:true}))
write('AUTHOR.two-whole-goal-atomicity-memory-and-kind-pending-proposals.json',{schemaVersion:1,authorOnly:true,independentVotes:0,rows:advice,
 semanticKindProposals:records.map((r:any)=>({goalId:r.goalId,proposedKind:'curricularAtomic',status:'unreviewed_author_candidate'})),noAuthoritativeRowsCreated:true})
const fp=(g:any,ruleVersion:string)=>sha(stableGoalEvidenceJson({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalizeGoalEvidenceText(g.title),titleEn:normalizeGoalEvidenceText(g.titleEn),description:normalizeGoalEvidenceText(g.description),descriptionEn:normalizeGoalEvidenceText(g.descriptionEn),phase:normalizeGoalEvidenceText(g.dimensionTags?.phase),area:normalizeGoalEvidenceText(g.dimensionTags?.area),topicCode:normalizeGoalEvidenceText(g.dimensionTags?.topicCode),nodeKind:normalizeGoalEvidenceText(g.nodeKind)}))
for(const lane of['A','M']){const ruleVersion=lane==='A'?'semantic-atomicity-v1':'memory-card-review-v1',rs=advice.map(a=>({schemaVersion:1,reviewId,ruleVersion,landscapeId:c.landscapeId,goalId:a.goalId,fingerprint:fp(by.get(a.goalId),ruleVersion),status:'needs_developer_review',...(lane==='A'?{semanticAtomic:null}:{memoryUseful:null}),reviewedAt:now,reviewer:'Codex AUTHOR; not independent science',reason:(lane==='A'?a.atomicityReasonDe:a.memoryReasonDe)+' Author recommendation only; independent review pending.'}));
 writeFileSync(resolve(O,`${lane}/two-native-pending-author-records.jsonl`),rs.map(x=>JSON.stringify(x)).join('\n')+'\n')
 if(lane==='M')writeFileSync(resolve(O,'M/empty-new-card-review-stream.jsonl'),'')
 write(`config/${lane}2.author-pending.config.json`,{schemaVersion:1,reviewId,ruleVersion,landscapeId:c.landscapeId,landscapePath:rel(cp),reviewPath:rel(resolve(O,`${lane}/two-native-pending-author-records.jsonl`)),...(lane==='M'?{cardReviewPath:rel(resolve(O,'M/empty-new-card-review-stream.jsonl'))}:{}),scope:{label:'Two unreviewed author candidates',leafGoalIds:rs.map(x=>x.goalId)}})
}
console.log(JSON.stringify({newCanonicalErrors:newCanonicalErrors.length,existingViews:views.length,noOldTargetLoss:true,newPendingProfiles:records.length,lowLevelPCurrentSchemasAndFP:2,normalPKindHolds:2,dependentKindlessFPFailures:4,courseBefore:courseBefore.status,courseAfter:courseAfter.status,newScienceVotes:0}))
