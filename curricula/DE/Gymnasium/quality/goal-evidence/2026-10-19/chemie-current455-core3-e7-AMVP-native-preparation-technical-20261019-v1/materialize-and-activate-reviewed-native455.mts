// Apache-2.0. ROOT-authorized technical transport, no new scientific vote.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createRequire} from 'node:module'
import {spawnSync} from 'node:child_process'
import {A,M,V,root,fingerprintSemanticKindSourceGoal,fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics} from './original-production-functions.mts'
import {replaceFileAtomically} from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'

const out=relative(root,dirname(fileURLToPath(import.meta.url)))
const E19='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-19'
const CORE=['70b34ae7-4481-590c-9a02-516464750832','62de1c6e-8581-5345-a0a6-773427cb6db7','33e845cc-1a7b-50d5-99b3-8079575c4e6a']
const E7='e7c3d20e-4b13-560b-b8ee-c5abca8cc624'
const CONTEXT=['0d59b62e-d3f9-5969-b961-0c5e26316c04','2f3cdec5-f845-5b0f-841e-8b1d47de0281']
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const ledgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const registryPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const qaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
const hash=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const pin=(path:string)=>{const b=readFileSync(resolve(root,path));return {path,sha256:hash(b),bytes:b.length}}
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const write=(p:string,o:any)=>{mkdirSync(dirname(resolve(root,p)),{recursive:true});writeFileSync(resolve(root,p),JSON.stringify(o,null,2)+'\n',{flag:'wx'})}
const text=(p:string,s:string)=>{mkdirSync(dirname(resolve(root,p)),{recursive:true});writeFileSync(resolve(root,p),s,{flag:'wx'})}
const clone=<T>(v:T):T=>structuredClone(v)
const checkPin=(p:any)=>{const a=pin(p.path);assert.equal(a.sha256,p.sha256.replace(/^sha256:/u,''));assert.equal(a.bytes,p.bytes)}
const deref=(p:any)=>{checkPin(p);let o=read(p.path);for(const s of (p.jsonPointer??'').split('/').filter(Boolean))o=o[s];return o}
const appendRaw=(p:string,updates:Map<string,any>,adds:any[]=[])=>{
 const b=readFileSync(resolve(root,p));assert.ok(!b.includes(13));const ls=b.toString('utf8').split('\n');assert.equal(ls.pop(),'')
 const retained:string[]=[],changed:string[]=[]
 const lines=ls.map(l=>{const r=JSON.parse(l);if(updates.has(r.goalId)){changed.push(r.goalId);return JSON.stringify(updates.get(r.goalId))}retained.push(l+'\n');return l})
 assert.deepEqual(new Set(changed),new Set(updates.keys()));for(const r of adds){assert.ok(!ls.some(l=>JSON.parse(l).goalId===r.goalId));lines.push(JSON.stringify(r))}
 return {bytes:lines.join('\n')+'\n',retained:retained.join(''),retainedRows:retained.length}
}

const args=process.argv.slice(2)
assert.equal(args[0],'--root-final-canonical-sha256');assert.match(args[1]??'',/^[a-f0-9]{64}$/u)
assert.equal(args[2],'--root-registry-free');assert.equal(args.length,3)
assert.ok(!existsSync(resolve(root,out,'RECEIPT.actual-final-native455-activation.json')),'Never overwrite an activation')
const prep=read(`${out}/PREPARATION.actual-source-pins-and-native-owner-plan.json`)
for(const p of Object.values(prep.sources))checkPin(p)
prep.originalImplementationPins.forEach(checkPin)
const coreA=read(prep.sources.coreA.path),coreB=read(prep.sources.coreB.path),profiles=read(prep.sources.authorProfiles.path)
const imageC=read(prep.sources.imageC.path),imageSelection=read(prep.sources.imageCSelection.path)
const graphDir=`${E19}/chemie-current454-70b-two-atom-and-33e-independent-graph-view-c-20261019-v1`
const graphAcceptPath=`${graphDir}/ACCEPTED-CAS.exact-eight-goal-cells-and-thirty-three-views.independent-c.json`
const graphSealPath=`${graphDir}/SEAL.independent-c-graph-view-component.json`
const graphAccept=read(graphAcceptPath),graphSeal=read(graphSealPath)
for(const p of graphSeal.artifacts??graphSeal.files??[])checkPin(p)
assert.equal(graphAccept.canonicalOperations.length,8)
for(const gid of CONTEXT)assert.ok(graphAccept.canonicalOperations.some((r:any)=>r.goalId===gid&&String(r.decision).startsWith('accept')))
const activationPath=`${E19}/chemie-current455-reviewed-core-graph-view-activation-technical-20261019-v1/RECEIPT.actual-core-graph-view-and-two-PNG-activation.json`
const activation=read(activationPath)
checkPin(activation.afterCanonical)
assert.equal(pin(canonicalPath).sha256,args[1]);assert.equal(pin(canonicalPath).sha256,activation.afterCanonical.sha256.replace(/^sha256:/u,''))
const canonical=read(canonicalPath),goals=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
assert.equal(goals.size,742)
const ordinary=canonical.goals.filter((g:any)=>A.isLeaf(g)&&A.isSemanticAtomicityRelevantGoal(g));assert.equal(ordinary.length,455)
for(const gid of CORE){
 const ar=coreA.rows.find((r:any)=>r.goalId===gid),br=coreB.rows.find((r:any)=>r.goalId===gid),pr=profiles.records.find((r:any)=>r.goalId===gid)
 assert.equal(ar.A.status,'atomic');assert.equal(ar.M.status,'no_memory_needed');assert.equal(br.coreJudgment.A,'curricularAtomic');assert.equal(br.coreJudgment.M,'no_memory_needed')
 for(const k of ['title','titleEn','description','descriptionEn'])assert.equal(goals.get(gid)[k],ar.reviewedCoreText[k])
 assert.deepEqual(pr.profile,ar.wholeReviewedProfile);assert.deepEqual(pr.profile,br.acceptedWholeProfileBody)
}
const graphAuthor=read(prep.sources.graphAuthor.path),graphCAS=deref(graphAuthor.graphCAS)
for(const op of graphCAS.operations)assert.deepEqual(goals.get(op.goalId),op.afterWholeGoal)
const registryBefore=readFileSync(resolve(root,registryPath)),reg=JSON.parse(registryBefore.toString('utf8')),subject=reg.subjects[2]
assert.equal(subject.subject,'chemie');assert.equal(subject.positiveEvidenceConfigPaths.length,158)
const beforeLedgerBytes=readFileSync(resolve(root,ledgerPath)),ledger=JSON.parse(beforeLedgerBytes.toString('utf8')),beforeQABytes=readFileSync(resolve(root,qaPath)),qa=JSON.parse(beforeQABytes.toString('utf8'))
const now=new Date().toISOString(),acceptance={coreA:prep.sources.coreA,coreASeal:prep.sources.coreASeal,coreB:prep.sources.coreB,coreBSeal:prep.sources.coreBSeal,imageC:prep.sources.imageC,imageCSeal:prep.sources.imageCSeal,graphC:pin(graphAcceptPath),graphCSeal:pin(graphSealPath)}
const orthographyPath=`${E19}/chemie-current454-D7-two-reviewed-P-material-activation-technical-20261019-v1/TECHNICAL.e7-orthography-only-component.for-later-AMV-rebinding.pending.json`
const orthography=read(orthographyPath);assert.equal(goals.get(E7).description,orthography.afterDescriptionDe)
const oldE7=clone(goals.get(E7));oldE7.description=orthography.beforeDescriptionDe
const freshBinding=(gid:string,component:string)=>({role:'Technical transport of actual independent component acceptance, no new scientific vote',component,coreA:{...prep.sources.coreA,jsonPointer:`/rows/${CORE.indexOf(gid)}/${component}`},coreASeal:prep.sources.coreASeal,coreB:{...prep.sources.coreB,jsonPointer:`/rows/${CORE.indexOf(gid)}/coreJudgment`},coreBSeal:prep.sources.coreBSeal,humanApproval:false,actualLearnerExecutionClaim:false})
const orthBinding=(record:any)=>({role:'Only already reviewed four-spelling input rebind; original scientific vote and time unchanged',proof:pin(orthographyPath),beforeFingerprint:record.fingerprint,originalWholeRecord:record,historicalPCommentsNotReassertedAsCurrentStatus:true,newScientificVote:false,humanApproval:false})
const normalGuards=[pin(canonicalPath),pin(ledgerPath),pin(qaPath)]
const keepInputs=new Map<string,any>()
const registryChanges:{field:string;index?:number;before:string;after:string}[]=[]
mkdirSync(resolve(root,out,'before'),{recursive:true})
copyFileSync(resolve(root,ledgerPath),resolve(root,out,'before/SEM.current-before.EXACT.json'))
copyFileSync(resolve(root,qaPath),resolve(root,out,'before/V.current-before.EXACT.json'))
copyFileSync(resolve(root,registryPath),resolve(root,out,'before/registry.after-ROOT-D-registration.EXACT.json'))
write(`${out}/before/exact-final-canonical-input-pin-and-eight-goal-cells.json`,{actualCanonical:pin(canonicalPath),activation:pin(activationPath),wholeEightCells:graphCAS.operations.map((o:any)=>({goalId:o.goalId,wholeCurrentGoal:goals.get(o.goalId)})),wholeE7:goals.get(E7),noWholeCanonicalDuplicate:true})

// SEM: preserve every existing decisionBasis; only8 actual graph cells and new62.
const sem=clone(ledger),semChanges:any[]=[]
for(const op of graphCAS.operations){
 const at=sem.decisions.findIndex((d:any)=>d.goalId===op.goalId),fp=fingerprintSemanticKindSourceGoal(goals.get(op.goalId))
 if(at<0){assert.equal(op.goalId,CORE[1]);sem.decisions.push({goalId:op.goalId,sourceFingerprint:fp,semanticKind:'curricularAtomic',decisionStatus:'authoritative',decisionBasis:'reviewed-current-post-split-curricular-atomic'})}
 else {assert.equal(sem.decisions[at].sourceFingerprint,fingerprintSemanticKindSourceGoal(op.beforeWholeGoal));sem.decisions[at].sourceFingerprint=fp}
 semChanges.push({goalId:op.goalId,sourceFingerprint:fp,newDecision:at<0,actualCoreClassificationEvidence:op.goalId===CORE[1]?freshBinding(op.goalId,'A'):null})
}
sem.counts.curricularAtomic+=1;sem.counts.total+=1
assert.equal(sem.decisions.length,canonical.goals.length);assert.equal(sem.counts.total,742);assert.equal(sem.counts.curricularAtomic,455)
for(const d of sem.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(goals.get(d.goalId)))
const require=createRequire(resolve(root,'app/package.json')),Ajv=require('ajv/dist/2020.js').default,addFormats=require('ajv-formats').default
const ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv)
assert.ok(ajv.validate(read('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'),sem),JSON.stringify(ajv.errors))
const semCandidate=`${out}/SEM/chemie.semantic-kinds.current455.candidate.json`;write(semCandidate,sem)

// A: exactly two additive owner files; preserve all unselected raw LF rows.
const aChecks:string[]=[],aTransitions:any[]=[]
for(let ci=0;ci<subject.semanticAtomicityConfigPaths.length;ci++){
 const path=subject.semanticAtomicityConfigPaths[ci],c=read(path),scope=A.collectConfiguredScopeGoalIds(c,goals)
 const selected=[CORE[0],CORE[2],E7].filter(g=>scope.has(g));if(!selected.length)continue
 keepInputs.set(path,pin(path));keepInputs.set(c.reviewPath,pin(c.reviewPath))
 const original=readFileSync(resolve(root,c.reviewPath),'utf8').trimEnd().split('\n').map(JSON.parse),updates=new Map<string,any>(),adds:any[]=[]
 for(const gid of selected){const old=original.find((r:any)=>r.goalId===gid);assert.ok(old);const row=clone(old)
  if(gid===E7){assert.equal(old.fingerprint,A.fingerprintGoal(oldE7,c.ruleVersion));row.fingerprint=A.fingerprintGoal(goals.get(gid),c.ruleVersion);row.technicalInputRebinding=orthBinding(old)}
  else {const judgment=coreA.rows.find((r:any)=>r.goalId===gid).A;row.fingerprint=A.fingerprintGoal(goals.get(gid),c.ruleVersion);row.status=judgment.status;row.semanticAtomic=judgment.semanticAtomic;row.reviewedAt=now;row.reviewer='Technical serialization of actual CoreA/B atomicity components; no new vote';row.reason=judgment.reason;row.technicalScientificBinding=freshBinding(gid,'A')}
  updates.set(gid,row)
 }
 const cfg=clone(c),key=selected.includes(E7)?'A050.e7-orthography':'A33.core-three-successor'
 if(!selected.includes(E7)){assert.ok(selected.includes(CORE[0])&&selected.includes(CORE[2]));cfg.scope.leafGoalIds.push(CORE[1]);const j=coreA.rows.find((r:any)=>r.goalId===CORE[1]).A;adds.push({schemaVersion:1,reviewId:c.reviewId,ruleVersion:c.ruleVersion,landscapeId:c.landscapeId,goalId:CORE[1],fingerprint:A.fingerprintGoal(goals.get(CORE[1]),c.ruleVersion),status:j.status,semanticAtomic:j.semanticAtomic,reviewedAt:now,reviewer:'Technical serialization of actual CoreA/B atomicity components; no new vote',reason:j.reason,technicalScientificBinding:freshBinding(CORE[1],'A')});cfg.scope.label='Original31 raw rows plus3 actually accepted current core atoms; original namespace retained'}
 const result=appendRaw(c.reviewPath,updates,adds),rp=`${out}/A/${key}.review.jsonl`,cp=`${out}/A/${key}.config.json`
 text(rp,result.bytes);cfg.reviewPath=rp;write(cp,cfg);copyFileSync(resolve(root,c.reviewPath),resolve(root,out,`before/${key}.original-rows.EXACT.jsonl`))
 registryChanges.push({field:'semanticAtomicityConfigPaths',index:ci,before:path,after:cp});aChecks.push(cp);aTransitions.push({beforeConfig:pin(path),afterConfig:pin(cp),retainedRawRows:result.retainedRows,retainedRawSHA256:hash(result.retained)})
}
assert.equal(aTransitions.length,2)

// M: all455 ordinary rows;80 original cards/41 visibility coordinates retained.
const mPath=subject.memoryReviewConfigPath,mc=read(mPath),mOriginal=readFileSync(resolve(root,mc.reviewPath),'utf8').trimEnd().split('\n').map(JSON.parse)
assert.equal(mOriginal.length,454);keepInputs.set(mPath,pin(mPath));keepInputs.set(mc.reviewPath,pin(mc.reviewPath));keepInputs.set(mc.cardReviewPath,pin(mc.cardReviewPath))
const mUpdates=new Map<string,any>()
for(const gid of [CORE[0],CORE[2],E7]){const old=mOriginal.find((r:any)=>r.goalId===gid),row=clone(old)
 if(gid===E7){assert.equal(old.fingerprint,M.fingerprintGoal(oldE7,mc.ruleVersion));row.fingerprint=M.fingerprintGoal(goals.get(gid),mc.ruleVersion);row.technicalInputRebinding=orthBinding(old)}
 else {const j=coreA.rows.find((r:any)=>r.goalId===gid).M;row.fingerprint=M.fingerprintGoal(goals.get(gid),mc.ruleVersion);row.status=j.status;row.memoryUseful=j.memoryUseful;row.memoryGoalIds=[];row.deckIds=[];row.reviewedAt=now;row.reviewer='Technical serialization of actual CoreA/B memory-need components; no new vote';row.reason=j.reason;row.technicalScientificBinding=freshBinding(gid,'M')}
 mUpdates.set(gid,row)
}
const mj=coreA.rows.find((r:any)=>r.goalId===CORE[1]).M,mNew={schemaVersion:1,reviewId:mc.reviewId,ruleVersion:mc.ruleVersion,landscapeId:mc.landscapeId,goalId:CORE[1],fingerprint:M.fingerprintGoal(goals.get(CORE[1]),mc.ruleVersion),status:mj.status,memoryUseful:mj.memoryUseful,memoryGoalIds:[],deckIds:[],reviewedAt:now,reviewer:'Technical serialization of actual CoreA/B memory-need components; no new vote',reason:mj.reason,technicalScientificBinding:freshBinding(CORE[1],'M')}
const mResult=appendRaw(mc.reviewPath,mUpdates,[mNew]),mRecordPath=`${out}/M/M455.exact-retention-and-four-components.review.jsonl`,mConfigPath=`${out}/M/M455.current-final.config.json`
assert.equal(mResult.retainedRows,451);text(mRecordPath,mResult.bytes)
const mCfg=clone(mc);mCfg.reviewPath=mRecordPath;mCfg.reportPath=`${out}/M/M455.report.md`;write(mConfigPath,mCfg)
assert.deepEqual(mCfg.visibilityScopes,mc.visibilityScopes);assert.equal(mCfg.visibilityScopes.length,41)
assert.equal(readFileSync(resolve(root,mc.cardReviewPath),'utf8').trimEnd().split('\n').length,80)
copyFileSync(resolve(root,mc.reviewPath),resolve(root,out,'before/M454.original-rows.EXACT.jsonl'))
registryChanges.push({field:'memoryReviewConfigPath',before:mPath,after:mConfigPath})

// P: same actual owner namespaces; whole accepted core profiles and context-only2.
const pChecks:string[]=[],pTransitions:any[]=[],pKeep:any[]=[]
for(let pi=0;pi<subject.positiveEvidenceConfigPaths.length;pi++){
 const path=subject.positiveEvidenceConfigPaths[pi],c=read(path),targets=[CORE[0],CORE[2],...CONTEXT].filter(g=>c.scope.goalIds.includes(g))
 if(!targets.length)continue
 keepInputs.set(path,pin(path));keepInputs.set(c.reviewPath,pin(c.reviewPath))
 const originals=readFileSync(resolve(root,c.reviewPath),'utf8').trimEnd().split('\n').map(JSON.parse),updates=new Map<string,any>(),adds:any[]=[]
 const cfg=clone(c),coreOwner=targets.includes(CORE[0]),ids=coreOwner?[...targets,CORE[1]]:targets
 for(const gid of ids){const old=originals.find((r:any)=>r.goalId===gid),template=old??originals.find((r:any)=>r.goalId===CORE[0]),row=clone(template),goal=goals.get(gid)
  row.goalId=gid;if(CORE.includes(gid))row.profile=clone(profiles.records.find((r:any)=>r.goalId===gid).profile)
  const resources:Record<string,string>={};for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization'&&c.reviewedResourceTypes.includes('goal-visualization'))resources[link.url]='sha256:'+pin('app/public'+link.url).sha256
  const criteria='sha256:'+pin(c.reviewCriteriaPath).sha256;assert.equal(criteria,row.reviewCriteriaFingerprint)
  row.goalFingerprint=fingerprintGoalForPositiveEvidence(goal,'curricularAtomic');row.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(row.profile);row.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resources,'curricularAtomic')
  row.reviewedAt=now;row.reviewer='Technical native serialization of actual CoreA/B or GraphC components; no new scientific vote'
  row.reason=CORE.includes(gid)?`Exact whole core P accepted by actual CoreA/B. Both accepted whole bodies and material hashes retained. Scientific refs: ${prep.sources.coreA.path}; ${prep.sources.coreB.path}. Native fingerprints use the actual final canonical and ROOT-activated exact image bytes. Source117 and final D remain separate; no human or learner-performance claim.`:`Context-only successor: whole prior P, cases/data/coverage and original performance judgment retained. Only current requires input binding is regenerated following actual accepted GraphC selection ${graphAcceptPath}. The exact changed canonical cell is current and independently accepted; no new performance/atomicity/memory judgment, source completion or learner execution is claimed.`
  row.dissent=[...row.dissent,'Technical final input binding only; actual informed component decisions are pinned in the activation receipt; no new blind D, human or M7 vote.']
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row,goal,resources,'curricularAtomic'),[])
  if(CONTEXT.includes(gid))assert.deepEqual(row.profile,old.profile)
  if(old)updates.set(gid,row);else adds.push(row)
 }
 if(coreOwner)cfg.scope.goalIds.push(CORE[1])
 const key=coreOwner?'core3.owner03':targets.includes(CONTEXT[0])?'paraben-context':'fat-context',rp=`${out}/P/${key}.review.jsonl`,cp=`${out}/P/${key}.config.json`,result=appendRaw(c.reviewPath,updates,adds)
 text(rp,result.bytes);cfg.reviewPath=rp;write(cp,cfg);copyFileSync(resolve(root,c.reviewPath),resolve(root,out,`before/P.${key}.original-rows.EXACT.jsonl`))
 registryChanges.push({field:'positiveEvidenceConfigPaths',index:pi,before:path,after:cp});pChecks.push(cp);pTransitions.push({beforeConfig:pin(path),afterConfig:pin(cp),targets:ids,retainedRawRows:result.retainedRows,retainedRawSHA256:hash(result.retained),wholeContextProfilesUnchanged:!coreOwner})
}
assert.equal(pTransitions.length,3)
// e7 P was already actually activated with its corrected goal. Keep exact bytes.
for(const path of subject.positiveEvidenceConfigPaths){const c=read(path);if(!c.scope.goalIds.includes(E7))continue;const r=readFileSync(resolve(root,c.reviewPath),'utf8').trimEnd().split('\n').map(JSON.parse).find((r:any)=>r.goalId===E7);const resources:Record<string,string>={};for(const link of goals.get(E7).resourceLinks??[])if(link.type==='goal-visualization')resources[link.url]='sha256:'+pin('app/public'+link.url).sha256;assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goals.get(E7),resources,'curricularAtomic'),[]);pKeep.push({goalId:E7,config:pin(path),reviewFile:pin(c.reviewPath),decision:'KEEP exact current native P; already fresh after prior authorized activation'})}
assert.equal(pKeep.length,1)
// The original P input payload contains local requires IDs, not dependency titles.
// Check the six actual unchanged formation dependants instead of rewriting them.
const unchangedContextIds=graphCAS.tenReverseImpacts.filter((x:any)=>{
 const g=goals.get(x.goalId)
 return g&&A.isLeaf(g)&&A.isSemanticAtomicityRelevantGoal(g)
  &&JSON.stringify(x.proposedRequires)===JSON.stringify(x.wholeCurrentGoal.requires)
}).map((x:any)=>x.goalId)
assert.equal(unchangedContextIds.length,6)
const unchangedContextProof:any[]=[]
for(const path of subject.positiveEvidenceConfigPaths){const c=read(path),ids=unchangedContextIds.filter((id:string)=>c.scope.goalIds.includes(id));if(!ids.length)continue
 const rows=readFileSync(resolve(root,c.reviewPath),'utf8').trimEnd().split('\n').map(JSON.parse)
 for(const gid of ids){const row=rows.find((r:any)=>r.goalId===gid),resources:Record<string,string>={};for(const link of goals.get(gid).resourceLinks??[])if(link.type==='goal-visualization')resources[link.url]='sha256:'+pin('app/public'+link.url).sha256
  const expected=fingerprintPositiveGoalEvidenceReviewInput(goals.get(gid),row.reviewCriteriaFingerprint,resources,'curricularAtomic')
  assert.equal(expected,row.reviewInputFingerprint,`${gid}: actual unchanged requires context unexpectedly stale`)
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row,goals.get(gid),resources,'curricularAtomic'),[])
  unchangedContextProof.push({goalId:gid,ownerConfig:pin(path),wholeRecordFile:pin(c.reviewPath),actualOriginalInputFingerprint:expected,decision:'KEEP exact full P; unchanged local requires IDs and no dependency-title field in original payload'})
 }
}
assert.equal(unchangedContextProof.length,6)
write(`${out}/P/CHECK.six-unchanged-dependants.original-P-input-function.json`,{role:'TECHNICAL_NO_REVIEW_REWRITE',originalPayloadImplementation:pin('app/scripts/goalEvidenceProfileModel.ts'),exactPayloadFunction:'goalEvidenceReviewInputPayload',dependencyTitleFieldsIncluded:false,records:unchangedContextProof,newScientificJudgments:0})

// V: exact imageC acceptance, preserving actual historical human separation.
const q=clone(qa),qaChanged:any[]=[]
for(const gid of [...CORE,E7]){
 const goal=goals.get(gid),at=q.records.findIndex((r:any)=>r.goalId===gid),old=at>=0?q.records[at]:null
 if(gid===CORE[2]||gid===E7){assert.ok(old);const row=clone(old);row.title=V.normalizeText(goal.title);row.description=V.normalizeText(goal.description);if(at>=0)q.records[at]=row;qaChanged.push({goalId:gid,scope:'title/description metadata only',imageBytesAndReviewFlagsExact:true});continue}
 const selection=imageSelection.accepted.find((r:any)=>r.goalId===gid);assert.ok(selection);checkPin(selection.image)
 const link=goal.resourceLinks.find((r:any)=>r.type==='goal-visualization'&&(!r.role||r.role==='primary'));assert.ok(link)
 const publicPath='app/public'+link.url,canonicalAssetPath='curricula/DE/Gymnasium/visualizations'+link.url.replace('/assets/goal-visualizations','')
 assert.equal(pin(publicPath).sha256,selection.image.sha256.replace(/^sha256:/u,''));assert.equal(pin(canonicalAssetPath).sha256,selection.image.sha256.replace(/^sha256:/u,''))
 const row=V.createDefaultRecord({goalId:gid,title:V.normalizeText(goal.title),description:V.normalizeText(goal.description),subject:'chemie',landscapeId:canonical.landscapeId,landscapePath:canonicalPath,visualizationState:'available',missingReason:'',imageUrl:link.url,publicAssetPath:publicPath,canonicalAssetPath,assetSha256:'sha256:'+pin(publicPath).sha256})
 const notes=`Exact actual informed imageC component acceptance transported: ${prep.sources.imageC.path}; seal ${prep.sources.imageCSeal.path}. Scope: ${selection.scope}. Actual independent reviewer/time preserved; no new image review, runtime acceptance or human approval by this serializer.`
 Object.assign(row,{umlautsCorrectChatGpt:'yes',contentApprovedChatGpt:'yes',chatGptReviewedAt:imageC.completedAtUTC,chatGptReviewer:imageC.reviewer.agentTask,chatGptNotes:notes,aiApproved:'yes',aiApprovedAssetSha256:row.assetSha256,aiReviewedAt:imageC.completedAtUTC,aiReviewer:imageC.reviewer.agentTask,aiNotes:notes})
 assert.equal(row.humanApproved,'no');assert.equal(row.humanReviewedAt,null)
 if(at>=0)q.records[at]=row;else q.records.push(row)
 qaChanged.push({goalId:gid,actualImage:pin(publicPath),actualIndependentImageC:prep.sources.imageC,actualIndependentImageCSeal:prep.sources.imageCSeal})
}
q.records.sort((l:any,r:any)=>l.title.localeCompare(r.title,'de-DE',{numeric:true,sensitivity:'base'})||l.goalId.localeCompare(r.goalId))
for(const old of qa.records)if(![...CORE,E7].includes(old.goalId))assert.deepEqual(q.records.find((r:any)=>r.goalId===old.goalId),old)
const qaCandidate=`${out}/V/chemie.qa.current455.candidate.json`;write(qaCandidate,q)

// Actual narrow activation. ROOT has explicitly released registry after its D36 registration.
normalGuards.forEach(checkPin);keepInputs.forEach(checkPin);assert.deepEqual(readFileSync(resolve(root,registryPath)),registryBefore)
await replaceFileAtomically(resolve(root,ledgerPath),Buffer.from(JSON.stringify(sem,null,2)+'\n'))
await replaceFileAtomically(resolve(root,qaPath),Buffer.from(JSON.stringify(q,null,2)+'\n'))
const logs:any[]=[]
function originalCheck(label:string,script:string,args:string[]){const run=spawnSync(resolve(root,'app/node_modules/.bin/tsx'),[resolve(root,script),...args],{cwd:root,encoding:'utf8'});text(`${out}/checks/${label}.stdout.txt`,run.stdout??'');text(`${out}/checks/${label}.stderr.txt`,run.stderr??'');const terminal={label,script,args,exitCode:run.status,signal:run.signal,error:run.error?.message??null};write(`${out}/checks/${label}.terminal.json`,terminal);logs.push(terminal);assert.equal(run.status,0,`${label}: ${run.stderr}`);console.log('PASS '+label)}
for(const [i,c]of aChecks.entries())originalCheck(`A0${i+1}.stock`,'app/scripts/semanticAtomicityReview.ts',[`--config=${c}`,'--mode=check'])
originalCheck('M455.stock','app/scripts/memoryCardReview.ts',[`--config=${mConfigPath}`,'--mode=check'])
for(const [i,c]of pChecks.entries())originalCheck(`P0${i+1}.stock`,'app/scripts/positiveGoalEvidenceReview.ts',[`--config=${c}`,'--mode=check'])
originalCheck('V.chemie-original-generator-check','app/scripts/generateGoalVisualizationQaLedgers.ts',['--subject=chemie','--check'])
assert.deepEqual(readFileSync(resolve(root,registryPath)),registryBefore)
const afterReg=clone(reg)
for(const c of registryChanges){if(c.index===undefined){assert.equal(afterReg.subjects[2][c.field],c.before);afterReg.subjects[2][c.field]=c.after}else{assert.equal(afterReg.subjects[2][c.field][c.index],c.before);afterReg.subjects[2][c.field][c.index]=c.after}}
assert.equal(afterReg.subjects[2].positiveEvidenceConfigPaths.length,158);assert.equal(afterReg.subjects[2].semanticAtomicityConfigPaths.length,80)
const withoutAMPP=(r:any)=>{const x=clone(r);for(const k of ['semanticAtomicityConfigPaths','memoryReviewConfigPath','positiveEvidenceConfigPaths'])delete x.subjects[2][k];return x}
assert.deepEqual(withoutAMPP(afterReg),withoutAMPP(reg))
let afterRegText=registryBefore.toString('utf8');for(const c of registryChanges){const old=JSON.stringify(c.before);assert.equal(afterRegText.split(old).length-1,1);afterRegText=afterRegText.replace(old,JSON.stringify(c.after))};assert.deepEqual(JSON.parse(afterRegText),afterReg)
const registryCASPath=`${out}/REGISTRY.fresh-six-A-M-P-path-cell-CAS.actual.json`
write(registryCASPath,{role:'ACTUAL_ROOT_AUTHORIZED_FRESH_CELL_CAS_ONLY',before:pin(registryPath),operations:registryChanges,afterSHA256:hash(afterRegText),allDFieldsAndAllOtherRegistryBytesPreserved:true,DResolutionIndexPathsBefore:subject.resolutionIndexPaths.length,DResolutionSupersessionsBefore:subject.resolutionSupersessions.length,sourceRootRegistrationReceipt:pin(`${E19}/chemie-current455-native-D36-history-registration-technical-20261019-v1/RECEIPT.actual-native-D36-partial-history-registration.json`)})
await replaceFileAtomically(resolve(root,registryPath),Buffer.from(afterRegText))
assert.equal(readFileSync(resolve(root,registryPath),'utf8'),afterRegText);keepInputs.forEach(checkPin);assert.equal(pin(canonicalPath).sha256,args[1])
const record={role:'ACTUAL_TECHNICAL_NATIVE455_ACTIVATION_OF_EXISTING_REVIEWS',completedAtUTC:new Date().toISOString(),agentTask:'/root/chemie454_current35_fresh_description_b',actualFinalCanonical:pin(canonicalPath),ordinaryCountDerivedByOriginalAFunctions:ordinary.length,actualCoreAndImageAndGraphAcceptances:acceptance,rootCanonicalImageActivation:pin(activationPath),normalAfter:[pin(ledgerPath),pin(qaPath),pin(registryPath)],registryCAS:pin(registryCASPath),A:aTransitions,M:{beforeConfig:pin(mPath),afterConfig:pin(mConfigPath),retained451RawRows:true,retainedRawSHA256:hash(mResult.retained),originalCards80:pin(mc.cardReviewPath),visibility41Exact:true},P:pTransitions,PKeep:pKeep,PUnchangedSixDependants:unchangedContextProof,V:qaChanged,SEM:semChanges,stockChecks:logs,allExistingDecisionBasisValuesExact:true,new62DecisionBasisOnly:'reviewed-current-post-split-curricular-atomic',allDRegistryFieldsPreserved:true,originalReviewFilesNotOverwritten:true,normalCanonicalImagesViewsSourcesNotWrittenByThisScript:true,newScientificVotes:0,humanApproval:false,humanTrial:false,actualLearnerPerformanceClaim:false,finalNativeDStillSeparate:true,M7Claim:false,strictCountClaim:false,fullBuildsRun:false,commitOrPush:false}
const receipt=`${out}/RECEIPT.actual-final-native455-activation.json`;write(receipt,record);console.log(JSON.stringify({receipt:pin(receipt),registry:pin(registryPath),SEM:pin(ledgerPath),V:pin(qaPath),stockChecks:logs.map(l=>({label:l.label,exitCode:l.exitCode}))},null,2))
