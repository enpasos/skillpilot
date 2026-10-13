// Apache-2.0. Unmodified API calls, technical bindings only; no scientific vote.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const R=process.cwd(), E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const N=`${E}/chemie-f947-final-source-PNG-explicit-tasks-neutral-native-author-root-20261013-v11`
const O=`${E}/chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1`
const P=`${E}/chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9`
const X=resolve(R,'tmp/chemie-f947-final-neutral-native-execution-20261013-v11')
const G='f947cd04-952a-5a9d-9445-3ffc70e02c3c', canPath=`${N}/candidate/canonical523.current402.seven-images-source-boundary.author.json`
const read=(p:string,root=R):any=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const sha=(b:Buffer|string)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
const bytes=(p:string,root=R)=>readFileSync(resolve(root,p))
const write=(p:string,d:any,root=R)=>{
 const target=resolve(root,p);assert.ok(root===X || p.startsWith(`${N}/`));let parent=root
 for(const part of relative(root,dirname(target)).split('/')){
  parent=resolve(parent,part);assert.ok(parent.startsWith(`${root}/`));
  if(existsSync(parent))assert.ok(!lstatSync(parent).isSymbolicLink(),parent);else mkdirSync(parent)
 }
 assert.ok(!existsSync(target),target);writeFileSync(target,`${JSON.stringify(d,null,2)}\n`,{flag:'wx'})
}
const [modelApi,normalizeApi,ctxApi]=await Promise.all(['goalBookModel.ts','../src/utils/authoring/canonicalAuthoring.ts','validateGoalDescriptionReviewCampaign.ts'].map(p=>import(pathToFileURL(resolve(R,'app/scripts',p)).href)))
const can=read(canPath)
if(process.argv[2]==='bindings'){
 const normalized=JSON.parse(JSON.stringify(normalizeApi.normalizeCanonicalLandscape(structuredClone(can))))
 const bookSem=structuredClone(read(`${O}/candidate/semantic523.current-decisions.inactive.json`))
 bookSem.sourceLandscapePath=canPath
 const changedBookSem:string[]=[]
 for(const d of bookSem.decisions){const newFp=modelApi.fingerprintSemanticKindSourceGoal(normalized.goals.find((g:any)=>g.id===d.goalId));if(d.sourceFingerprint!==newFp)changedBookSem.push(d.goalId);d.sourceFingerprint=newFp}
 assert.ok(changedBookSem.every(id=>id===G),changedBookSem)
 const rawSem=read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json');rawSem.sourceLandscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
 const changedRawSem:string[]=[]
 for(const d of rawSem.decisions){const fp=modelApi.fingerprintSemanticKindSourceGoal(can.goals.find((g:any)=>g.id===d.goalId));if(d.sourceFingerprint!==fp)changedRawSem.push(d.goalId);d.sourceFingerprint=fp}
 assert.ok(changedRawSem.every(id=>id===G),changedRawSem)
 for(const [path,data] of [[`${N}/candidate/semantic523.normalized-book-and-P.same-classifications.json`,bookSem],[`${N}/candidate/semantic523.raw-source-atlas.same-classifications.json`,rawSem]] as const){write(path,data);write(path,data,X)}
 // Mutable output ledger is a regular private file; overwrite only that exact private file.
 const target=resolve(X,'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
 for(let p=dirname(target);p!==X;p=dirname(p))assert.ok(!lstatSync(p).isSymbolicLink(),p)
 assert.ok(!lstatSync(target).isSymbolicLink());writeFileSync(target,`${JSON.stringify(rawSem,null,2)}\n`)
 write(`${N}/checks/semantic-classification-preservation-and-two-normal-input-bindings.actual.json`,{schemaVersion:1,changedNormalizedBookSourceBindings:changedBookSem,changedRawSourceAtlasBindings:changedRawSem,allSemanticClassificationsAndStatusesExact:true,rawVersusNormalizedDistinctionExplicit:true,newSemanticOrScientificVotes:0,activeWrites:false})
 console.log(JSON.stringify({semanticBindingsPrepared:true,changedGoalIds:changedBookSem,rawChanged:changedRawSem,classificationsUnchanged:true}))
}else if(process.argv[2]==='model'){
 const loader=await import(pathToFileURL(resolve(X,'app/scripts/goalBookModel.ts')).href)
 const normal=await loader.loadGoalBookBuildInputs(`${N}/configs/whole402.final-neutral.inactive.config.json`)
 modelApi.parseAndValidateGoalBookModel(normal.model)
 const base=read(`${P}/models/whole402.current231-plus-original17.inactive.normal.json`)
 const changed=normal.model.pages.filter((p:any)=>modelApi.stableGoalBookJson(p)!==modelApi.stableGoalBookJson(base.pages.find((o:any)=>o.goalId===p.goalId))).map((p:any)=>p.goalId)
 assert.deepEqual(changed,[G]);assert.equal(normal.model.pages.length,402)
 const before=read(`${O}/candidate/canonical523.current402.six-resource-only.inactive.json`)
 const changedCan=can.goals.filter((g:any)=>modelApi.stableGoalBookJson(g)!==modelApi.stableGoalBookJson(before.goals.find((o:any)=>o.id===g.id))).map((g:any)=>g.id)
 assert.deepEqual(changedCan,[G])
 const changedCtx=can.goals.filter((g:any)=>modelApi.stableGoalBookJson(ctxApi.buildGoalDescriptionCanonicalContext(g))!==modelApi.stableGoalBookJson(ctxApi.buildGoalDescriptionCanonicalContext(before.goals.find((o:any)=>o.id===g.id)))).map((g:any)=>g.id)
 assert.deepEqual(changedCtx,[G])
 const protectedInput=read(`${O}/checks/protected231-full-current-tuple-and-registry-bindings.actual.json`)
 for(const b of protectedInput.currentActiveADPRegistryInputBindings)assert.equal(sha(bytes(b.path)),b.sha256)
 for(const {goalId} of protectedInput.protectedCurrentTuples)assert.equal(modelApi.stableGoalBookJson(normal.model.pages.find((p:any)=>p.goalId===goalId)),modelApi.stableGoalBookJson(base.pages.find((p:any)=>p.goalId===goalId)))
 write(`${N}/models/whole402.current231-original17-and-final-f947.author.json`,normal.model)
 write(`${N}/models/whole402.current231-original17-and-final-f947.author.json`,normal.model,X)
 write(`${N}/checks/normal-full402-original17-and-protected231-context.actual.json`,{schemaVersion:1,actualNormalApi:'loadGoalBookBuildInputs/buildGoalBookModel/parseAndValidateGoalBookModel',pages:402,changedWholePages:changed,allOther401WholePagesExact:true,allOther522CanonicalWholeGoalsExact:true,changedCanonicalDContextGoalIds:changedCtx,protected231WholePagesExact:true,protected214RegistryInputBindingsChecked:true,other17RawPFullPrintExact:true,selectedF947NeedsFreshBothIndependentJudgments:true,activeWrites:false,newScientificVotes:0})
 console.log(JSON.stringify({normalFull402Pass:true,other401FullPagesExact:true,protected231FullPagesExact:true,changedPageAndContextOnly:G}))
}else throw new Error('Expected bindings or model')
