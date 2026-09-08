// Read-only native post-apply checks. No frozen runtime or global reports mutated.
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {ids,paths,newGoals,originalSources} from './authoring-spec.mjs'
import {assessmentGoals,motivationAnchorId} from './assessment-spec.mjs'
import {additionalAssessmentGoals} from './additional-assessment-spec.mjs'
import {pathToFileURL} from 'node:url'
const repo=process.cwd(),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const mod=p=>import(pathToFileURL(repo+'/'+p))
const {fingerprintSemanticKindSourceGoal}=await mod('app/scripts/goalBookModel.ts')
const {validateHardDirectAtomicRoutes}=await mod('app/scripts/lib/hardLearningRouteValidation.ts')
const comp=await mod('app/src/utils/authoring/compositionViewAuthoring.ts'),canon=await mod('app/src/utils/authoring/canonicalAuthoring.ts')
const c=read(paths.canonical),k=read(paths.kinds),map=new Map(c.goals.map(g=>[g.id,g])),kinds=new Map(k.decisions.map(d=>[d.goalId,d.semanticKind]))
const scopedIds=[...newGoals.map(g=>g.id),ids.amplifier],tasks=[...assessmentGoals,...additionalAssessmentGoals],taskIds=[...tasks.map(g=>g.id),ids.switchAssessment]
const ownTasks=new Map(tasks.map(g=>[g.requires[0],g.id]));ownTasks.set(ids.switch,ids.switchAssessment)
const findings=[]
const sourceHashes=['6b49157703e7bad2685e09684d94248447da2f066a1c9cafc48bf11e758cbdfc','46f3e728b5d9fc6b5901f191247951a4a9d9c3df641afa60ca8b17a2e049813f','3fe017388dd69f6b08167ed83e5c6de10296ddc9da4510865cd5bd11cb9e22ca','3bf220e5e409fc4ae057b3327dfa3d445a8f27ad6961925aae5eb16f2d1c12cc','78933aa2f00d4e293ba62fe3e8a5c553565143b8adbae95bb1be40baaa12e450']
originalSources.forEach((s,i)=>{if(sha(s.path)!=='sha256:'+sourceHashes[i])findings.push('Original source changed since individual source inspection '+s.path)})
const packagePath=new URL('.',import.meta.url).pathname,bodyReview=read(packagePath+'informed-assessment-counterreview-b-20260908.json')
for(const record of bodyReview.records){const e=map.get(record.goalId).examData;const body=JSON.stringify({taskContent:e.taskContent,taskContentEn:e.taskContentEn,solutionContent:e.solutionContent,solutionContentEn:e.solutionContentEn,scoring:e.scoring});if('sha256:'+createHash('sha256').update(body).digest('hex')!==record.bodySha256)findings.push('Task body changed since B review '+record.goalId);if(e.reviewStatus!=='released')findings.push('Task not released after complete informed review '+record.goalId)}
for(const id of [...scopedIds,...taskIds,...[ids.optical,ids.nuclear,ids.stars,ids.transistor]])if(k.decisions.find(d=>d.goalId===id)?.sourceFingerprint!==fingerprintSemanticKindSourceGoal(map.get(id)))findings.push('Stale own K '+id)
for(const g of c.goals)if(k.decisions.find(d=>d.goalId===g.id)?.sourceFingerprint!==fingerprintSemanticKindSourceGoal(g))findings.push('Current canonical K missing/stale '+g.id)
const m=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'),mk=read('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'),routeKinds=new Map([...mk.decisions,...k.decisions].map(d=>[d.goalId,d.semanticKind]))
const hardRouteFindings=validateHardDirectAtomicRoutes([...m.goals,...c.goals],routeKinds,{scopeLabel:'B034 actual eight-competence route closure with real cross-landscape mathematics prerequisites',motivationAnchorGoalIds:[motivationAnchorId],terminalGoalClusterIds:taskIds,goalSelector:g=>scopedIds.includes(g.id)})
findings.push(...hardRouteFindings.map(x=>x.goalId+': '+x.message))
const decorated={...c,goals:c.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))},nc=canon.normalizeCanonicalLandscape(decorated),nm=canon.normalizeCanonicalLandscape(m),universe=canon.normalizeCanonicalLandscape({...decorated,goals:[...m.goals,...decorated.goals]})
const views=fs.readdirSync('curricula/DE/Gymnasium/composition-views/physik').filter(x=>x.endsWith('.json')).map(x=>'curricula/DE/Gymnasium/composition-views/physik/'+x);views.push('app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json')
const viewResults=[]
for(const p of views){const v=comp.normalizeCompositionView(read(p)),r=comp.compileCompositionView(v,nc,universe,new Map([[c.landscapeId,nc],[m.landscapeId,nm]])),count=new Map();function walk(n){if(n.sourceGoalId)count.set(n.sourceGoalId,(count.get(n.sourceGoalId)??0)+1);n.children?.forEach(walk)}r.compiledRootNodes.forEach(walk)
 const ownErrors=r.findings.filter(x=>x.severity==='error'),visible=scopedIds.filter(id=>count.has(id)),missing=visible.filter(id=>count.get(ownTasks.get(id))!==1)
 findings.push(...ownErrors.map(x=>p+': '+x.message),...missing.map(id=>p+': missing unique concrete task for '+id))
 viewResults.push({path:p,sha256:sha(p),sourceScope:v.scope,visibleOwnGoalIds:visible,visibleOwnTaskIds:taskIds.filter(id=>count.has(id)),nativeCompilerErrors:ownErrors.length,missingConcreteTaskGoalIds:missing})}
for(const t of tasks){const actual=map.get(t.id);if(JSON.stringify(actual.requires)!==JSON.stringify(actual.examData.coveredGoalIds))findings.push('Assessment target mismatch '+t.id);if(actual.examData.scoring.maxPoints!==actual.examData.scoring.steps.reduce((s,x)=>s+x.points,0))findings.push('Points mismatch '+t.id)}
for(const id of [ids.audio,ids.switch]){const task=map.get(ownTasks.get(id)),s=task.examData.scoring,essential=s.steps.find(x=>x.points===8);if(!essential||s.maxPoints-essential.points>=s.passingPoints)findings.push('Missing essential non-compensable unit '+id)}
const imageBindings=scopedIds.map(id=>{const g=map.get(id),link=g.resourceLinks.find(x=>x.type==='goal-visualization');const publicPath='app/public'+link.url,sourcePath='curricula/DE/Gymnasium/visualizations'+link.url.slice('/assets/goal-visualizations'.length),backendPath='backend/src/main/resources/static'+link.url;const hash=sha(publicPath);if(sha(sourcePath)!==hash||sha(backendPath)!==hash)findings.push('Image triplet mismatch '+id);return {goalId:id,url:link.url,sha256:hash}})
const receipt={schemaVersion:1,status:findings.length?'FAIL':'PASS',checkedAt:new Date().toISOString(),provider:'OpenAI / Codex session',model:'unknown',modelVersion:'unknown',reviewMode:'informed-author-verification-not-blind',humanApproval:false,canonicalSha256:sha(paths.canonical),sourceBindings:originalSources.map(s=>({path:s.path,sha256:sha(s.path)})),goals:scopedIds.map(id=>({goalId:id,goalSha256:'sha256:'+createHash('sha256').update(JSON.stringify(map.get(id))).digest('hex')})),taskBindings:taskIds.map(id=>({goalId:id,examDataSha256:'sha256:'+createHash('sha256').update(JSON.stringify(map.get(id).examData)).digest('hex'),reviewStatus:map.get(id).examData.reviewStatus})),imageBindings,nativeHardRouteFindings:hardRouteFindings,viewResults,findings,notClaimed:['Nationwide original-source completeness','NTG/ASTRO/optional-topic runtime selection','Human approval','Blind D review','P registration','Global M6 completion']}
console.log(JSON.stringify(receipt,null,2))
if(findings.length)process.exitCode=1
