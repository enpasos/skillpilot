// SPDX-License-Identifier: Apache-2.0
// Process-isolated test overlay. Production history constants and public APIs
// remain fixed; only the two fixed fixture history pins and repository input root
// are substituted in a isolated child. No report can select this reference.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'
import { spawnSync } from 'node:child_process'
import type { SkillLandscape, LearningGoal, ExamData } from '../src/landscapeTypes'
import type { ExactMeaningEvidence } from './lib/retainedAssessmentCoverage'
import { coverageSha256, resolveRetainedCoverage, protectedAssessmentMeaning, stableCoverageJson, RETAINED_INFO_OWNER as OWNER } from './lib/retainedAssessmentCoverage'
const repo=resolve(import.meta.dirname,'../..')
const scratch=resolve(repo,'tmp/retained-assessment-chain-fixture')
rmSync(scratch,{recursive:true,force:true});mkdirSync(scratch,{recursive:true});symlinkSync(resolve(repo,'app/node_modules'),resolve(scratch,'node_modules'),'dir')
const sourcePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
const contractPath='contracts/curriculum-assessment-coverage/v1/informatics'
const fixtures=JSON.parse(readFileSync(resolve(repo,contractPath,'history-inventory.json'),'utf8')) as {definitions: Array<{goalId:string}>}
const math=JSON.parse(readFileSync(resolve(repo,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'),'utf8')) as SkillLandscape
const material=math.goals.find(g=>g.id==='311ab2f2-3364-5166-ac22-3ef01419fee4')!.examData as ExamData
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',C='33333333-3333-4333-8333-333333333333'
const practice=['f05a9276-f27c-5d74-af65-588f12ab4de3','91c5be09-cc6b-5f57-bfe1-9f0038faf26a','6982b63a-c6c8-5a6f-b5cb-51568301ac1c','010651ba-ddd0-510b-8ed1-e3610031f6e1','70ef7a45-540a-5d8c-b970-19b9f740c40a','4d22b75a-c395-5785-9131-68a8a5e203c1','66630624-08b1-5d02-8544-877d0ffb12c9']
const atoms=[A,B].map(id=>({id,title:'Explicit synthetic competency '+id,description:'A fixed synthetic competency for the native gate fixture.',weight:1,contains:[],requires:[],type:'atomic'}))
const exams=fixtures.definitions.map((row,index:number)=>({id:row.goalId,title:'Synthetic retained exam '+index,description:'Synthetic test contract; no curricular material approval.',weight:1,contains:[],requires:[],type:'atomic',nodeKind:'exam',examData:{...structuredClone(material),reviewStatus:'released',...(index<14?{coveredGoalIds:[index===0?C:A]}:{})}}))
for(let index=14;index<24;index++)delete exams[index].examData.coveredGoalIds
const source={landscapeId:OWNER,title:'Synthetic source-bound native Info gate fixture',goals:[...atoms,{id:C,title:'Synthetic coverage cluster',weight:1,type:'cluster',contains:[A],requires:[]},...exams,...practice.map((id,index)=>({id,title:'Configured native fixture practice '+index,weight:1,contains:index===0?exams.map((e)=>e.id):[],requires:[]}))]}
const typedSource = source as unknown as SkillLandscape
const raw=Buffer.from(JSON.stringify(source,null,2)+'\n')
const inventory={kind:'Synthetic process-isolated test contract only',owner:OWNER,sourcePath,historicalRawSourceSha256:coverageSha256(raw),declaredCount:14,undeclaredCount:10,definitions:exams.map((g)=>({goalId:g.id,title:g.title,historicalGoalObjectSha256:coverageSha256(JSON.stringify(g)),historicalExamDataSha256:coverageSha256(JSON.stringify(g.examData)),coverage:Object.hasOwn(g.examData,'coveredGoalIds')?{state:'declared',references:g.examData.coveredGoalIds,resolvedAtomicGoalIds:resolveRetainedCoverage(typedSource,g.examData.coveredGoalIds).atoms.map(k=>k.slice(OWNER.length+1))}:{state:'undeclared',reason:'Field absent in exact historical source; historical competence coverage unknown.'}})).sort((a,b)=>a.goalId.localeCompare(b.goalId))}
const inventoryRaw=Buffer.from(JSON.stringify(inventory,null,2)+'\n')
const put=(path:string,bytes:string|Buffer)=>{const absolute=resolve(scratch,path);mkdirSync(resolve(absolute,'..'),{recursive:true});writeFileSync(absolute,bytes)}
put(sourcePath,raw);put(contractPath+'/historical-informatics-source.json.gz',gzipSync(raw));put(contractPath+'/history-inventory.json',inventoryRaw)
put('curricula/DE/Gymnasium/composition-views/informatik/fixture.view.json',JSON.stringify({viewId:'synthetic-retained-info-fixture',landscapeId:OWNER,scope:{schoolForm:'Gymnasium',stage:'CrossStage'},rootNodes:[{kind:'structure',id:'fixed-fixture',label:'Explicit native test targets',children:exams.map((e)=>({kind:'goalEntry',goalId:e.id}))}]}))
const sourceSha=coverageSha256(raw),inventorySha=coverageSha256(inventoryRaw)
assert.equal(sourceSha,'b942a2a0630a668fadfc342c5787ecdc964349da909078a0cb024eeeb87c5e42','Synthetic history is fixed, never regenerated as a new acceptance baseline.')
assert.equal(inventorySha,'f58ab88a6ba8b20cc00e5b28a57a65fb82eb7d9d381e54bcd4a4e2564ac46ff5')
let testBindings: readonly ExactMeaningEvidence[]=[]
const mutationLog: unknown[]=[]
const loader=resolve(scratch,'fixture-loader.mjs'),register=resolve(scratch,'register-fixture-loader.mjs')
writeFileSync(register,`import{register}from'node:module';register(${JSON.stringify(pathToFileURL(loader).href)},import.meta.url)`)
writeFileSync(loader,`import ts from ${JSON.stringify(pathToFileURL(resolve(repo,'app/node_modules/typescript/lib/typescript.js')).href)};
import{readFileSync,existsSync,appendFileSync}from'node:fs';import{createHash}from'node:crypto';import{fileURLToPath,pathToFileURL}from'node:url';import{createRequire}from'node:module';
const config=JSON.parse(readFileSync(${JSON.stringify(resolve(scratch,'overlay-current.json'))},'utf8')),require=createRequire(${JSON.stringify(resolve(repo,'app/package.json'))}),sha=x=>createHash('sha256').update(x).digest('hex');
export async function resolve(specifier,context,next){try{return await next(specifier,context)}catch(error){
 if(specifier.startsWith('.')||specifier.startsWith('/')||specifier.startsWith('file:')){const path=fileURLToPath(new URL(specifier,context.parentURL));for(const candidate of [path+'.ts',path+'.tsx',path+'.mjs',path+'/index.ts',path.replace(/\\.js$/u,'.ts')])if(candidate!==path&&existsSync(candidate))return{url:pathToFileURL(candidate).href,shortCircuit:true}}
 else if(!specifier.startsWith('node:')){try{return{url:pathToFileURL(require.resolve(specifier)).href,shortCircuit:true}}catch{}}
 throw error}}
export async function load(url,context,next){if(!url.startsWith('file:'))return next(url,context);const path=fileURLToPath(url);if(!/\\.tsx?$/u.test(path))return next(url,context);let source=readFileSync(path,'utf8'),before=source;
 if(path.endsWith('/retainedAssessmentCoverage.ts'))source=source.replaceAll('85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e',config.sourceSha).replaceAll('3a1bf33c5dff8e310cc2ebc593a8fe61017bb34d8819a965fea0ec73a9e2f891',config.inventorySha).replace('const CONCRETE_BINDINGS: readonly ExactMeaningEvidence[] = []','const CONCRETE_BINDINGS: readonly ExactMeaningEvidence[] = '+JSON.stringify(config.bindings));
 if(path.endsWith('/generateCurriculumQualityStatus.ts'))source=source.replace("const repoRoot = resolve(scriptDir, '../..')",'const repoRoot = '+JSON.stringify(config.root));
 if(path.endsWith('/checkCurriculumMaturityFloors.ts'))source=source.replace("new URL('../../docs/qa-ci/status/curriculum-quality-status.json', import.meta.url)",JSON.stringify(config.root+'/docs/qa-ci/status/curriculum-quality-status.json')).replace("new URL('./config/curriculum-maturity-floor-policy.json', import.meta.url)",JSON.stringify(config.root+'/policy.json'));
 if(source!==before)appendFileSync(config.log,JSON.stringify({path,beforeSha256:sha(before),afterSha256:sha(source),fixtureOnly:true})+'\\n');
 return{format:'module',shortCircuit:true,source:ts.transpileModule(source,{fileName:path,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText}}`)
function runFixture(entry:string,name:string){
 const log=resolve(scratch,name+'.overlay.jsonl');writeFileSync(log,'');put('overlay-current.json',JSON.stringify({fixtureOnly:true,root:scratch,sourceSha,inventorySha,bindings:testBindings,log}))
 const result=spawnSync(process.execPath,['--import',register,entry],{cwd:repo,encoding:'utf8',maxBuffer:16*1024*1024})
 mutationLog.push(...readFileSync(log,'utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line)))
 return result
}
const imports=pathToFileURL(resolve(repo,'app/scripts/generateCurriculumQualityStatus.ts')).href
const captureHelper=pathToFileURL(resolve(repo,'app/scripts/lib/retainedAssessmentCoverage.ts')).href
const helper=pathToFileURL(resolve(repo,'app/scripts/lib/curriculumAssessmentValidation.ts')).href
const floor=pathToFileURL(resolve(repo,'app/scripts/checkCurriculumMaturityFloors.ts')).href
const runner=`import{captureCurriculumSource}from${JSON.stringify(captureHelper)};import assert from 'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';import{readCurrentCurriculumAssessmentScopes,evaluateCurriculumExamReadiness,evaluateGraphIntegrity,deriveCurriculumMaturity}from${JSON.stringify(imports)};import{hasCompletePassingCurriculumExamReadiness}from${JSON.stringify(helper)};import{checkCurriculumMaturityFloors}from${JSON.stringify(floor)};
const O=${JSON.stringify(OWNER)},path=${JSON.stringify(resolve(scratch,sourcePath))},base=JSON.parse(readFileSync(path,'utf8'));
const routes=[{scopeId:'valid-native-fixture',label:'Other already-valid route requirements',maturity:'M4',selectedAtomicGoals:2,rules:[{id:'CQR-101',status:'pass',summary:'fixture route requirements satisfied'}]}];
const other=['CQR-000','CQR-002','CQR-003','CQR-301','CQR-401','CQR-501','CQR-302','CQR-303'].map(id=>({id,status:'pass',summary:'Other fixture prerequisite satisfied'}));
function current(){const scopes=readCurrentCurriculumAssessmentScopes([O]);const expected=scopes.get(O);const source=captureCurriculumSource(${JSON.stringify(sourcePath)},readFileSync(path));const rules=[...other,evaluateGraphIntegrity(source,[source]),...evaluateCurriculumExamReadiness(source,[],[source],expected)];return{scopes,expected,rules,maturity:deriveCurriculumMaturity(rules,routes,O,expected)}}
const policy={schemaVersion:1,policyId:'fixed-synthetic-info-M6-floor',baselineDate:'2026-08-20',exceptions:[],knownPreBaselineRegressions:[],floors:[{landscapeId:O,frameworkId:'synthetic',subject:'Synthetic native Info gate fixture',minimumMaturity:'M6',reason:'Isolate exact retained-coverage failure'}]};
const artifact=(c,m=c.maturity)=>({curricula:[{landscapeId:O,frameworkId:'synthetic',subject:'Synthetic native Info gate fixture',maturity:m,scopes:routes,rules:c.rules}]});
const good=current();assert.equal(good.expected.retainedCoverage.manifest.status,'pass');assert.equal(good.rules.find(r=>r.id==='CQR-204').status,'pass');assert.equal(good.rules.find(r=>r.id==='CQR-202').status,'pass');assert.equal(good.rules.find(r=>r.id==='CQR-001').status,'pass');assert.equal(good.maturity,'M6');assert.equal(hasCompletePassingCurriculumExamReadiness(good.rules,O,good.expected),true);checkCurriculumMaturityFloors(artifact(good),policy,good.scopes);
writeFileSync(${JSON.stringify(resolve(scratch,'positive-status.json'))},JSON.stringify(artifact(good)));writeFileSync(${JSON.stringify(resolve(scratch,'policy.json'))},JSON.stringify(policy));
for(const scope of [undefined,{...good.expected,retainedCoverage:undefined},JSON.parse(JSON.stringify(good.expected)),{...good.expected,definitionGoalIds:[]}])assert.equal(hasCompletePassingCurriculumExamReadiness(good.rules,O,scope),false);
for(const alter of [r=>r.filter(x=>x.id!=='CQR-204'),r=>[...r,r.find(x=>x.id==='CQR-204')],r=>r.map(x=>x.id==='CQR-204'?{...x,status:'not_configured'}:x),r=>r.map(x=>x.id==='CQR-204'?{...x,assessmentValidation:{...x.assessmentValidation,retainedCoverageManifest:{...x.assessmentValidation.retainedCoverageManifest,rows:[]}}}:x)])assert.equal(hasCompletePassingCurriculumExamReadiness(alter(structuredClone(good.rules)),O,good.expected),false);
base.goals.find(g=>g.id===${JSON.stringify(C)}).contains.push(${JSON.stringify(B)});writeFileSync(path,JSON.stringify(base));const bad=current();assert.equal(bad.rules.find(r=>r.id==='CQR-001').status,'pass');assert.equal(bad.rules.find(r=>r.id==='CQR-202').status,'pass');assert.deepEqual(bad.expected.retainedCoverage.manifest.failingGoalIds,[${JSON.stringify(exams[0].id)}]);assert.equal(bad.maturity,'M3');assert.throws(()=>checkCurriculumMaturityFloors(artifact(bad),policy,bad.scopes),/maturity regression/);
const forged=structuredClone(bad);for(const r of forged.rules){if(r.id!=='CQR-204')continue;r.status='pass';r.metrics.weakExamData=0;r.metrics.discoveryIssues=0;r.assessmentValidation.failingGoalIds=[];const m=r.assessmentValidation.retainedCoverageManifest;m.status='pass';m.failingGoalIds=[];m.discoveryIssues=[];for(const row of m.rows){row.issues=[];row.decision=row.historyKind==='declared'?'declared-preserved':'undeclared-preserved'}}
assert.equal(hasCompletePassingCurriculumExamReadiness(forged.rules,O,bad.expected),false);assert.equal(deriveCurriculumMaturity(forged.rules,routes,O,bad.expected),'M3');for(const min of ['M6','M7'])assert.throws(()=>checkCurriculumMaturityFloors(artifact(forged,'M7'),{...policy,floors:[{...policy.floors[0],minimumMaturity:min}]},bad.scopes),/assessment reports bound to current source discovery/);
writeFileSync(${JSON.stringify(resolve(scratch,'forged-status.json'))},JSON.stringify(artifact(forged,'M7')));console.log(JSON.stringify({group:'T21',owner:O,positiveMaturity:good.maturity,negativeMaturity:bad.maturity,singleCoverageFailingGoalIds:bad.expected.retainedCoverage.manifest.failingGoalIds,realNativeGraphAndReadinessPass:true,perfectHashForgedM7Rejected:true,noProductionTestFactory:true}));`
const entry=resolve(scratch,'chain.mjs');writeFileSync(entry,runner)
const child=runFixture(entry,'chain');writeFileSync(resolve(scratch,'chain.stdout'),child.stdout);writeFileSync(resolve(scratch,'chain.stderr'),child.stderr)
assert.equal(child.status,0,child.stderr);process.stdout.write(child.stdout)
// Invoke the actual existing CLI and unchanged entry guard in a fresh process.
const cliEntry=resolve(repo,'app/scripts/checkCurriculumMaturityFloors.ts')
// Source is currently mutated; an artifact forged with its exact frame hashes
// is rejected on a fresh independent standalone read.
put('docs/qa-ci/status/curriculum-quality-status.json',readFileSync(resolve(scratch,'forged-status.json')))
const cliBad=runFixture(cliEntry,'floor-negative');assert.notEqual(cliBad.status,0);assert.match(cliBad.stderr,/assessment reports bound to current source discovery/)
put(sourcePath,raw);put('docs/qa-ci/status/curriculum-quality-status.json',readFileSync(resolve(scratch,'positive-status.json')))
const cliGood=runFixture(cliEntry,'floor-positive');assert.equal(cliGood.status,0,cliGood.stderr)
writeFileSync(resolve(scratch,'overlay-evidence.json'),JSON.stringify({fixtureOnly:true,productionSourceChanged:false,sourceSha256:sourceSha,inventorySha256:inventorySha,transformations:mutationLog,positiveCli:{exit:cliGood.status,stdout:cliGood.stdout,stderr:cliGood.stderr},perfectHashForgedNegativeCli:{exit:cliBad.status,stdout:cliBad.stdout,stderr:cliBad.stderr}},null,2)+'\n')
console.log('retained coverage T21: native Info owner M6 control, sole coverage error M3, M6/M7 floor and standalone fresh-source CLI forgery rejection passed')

// Exact positive equivalence and first-introduction codepaths use only pinned,
// explicitly synthetic evidence in this isolated process; no production registry.
const pins=[{path:'fixture-independent-material-review.txt',sha256:coverageSha256('Independent synthetic task/rubric witness')},{path:'fixture-independent-source-review.txt',sha256:coverageSha256('Independent synthetic source integration witness')}]
put(pins[0].path,'Independent synthetic task/rubric witness');put(pins[1].path,'Independent synthetic source integration witness')
async function runBoundProof(name:string, candidate:SkillLandscape, bindings:ExactMeaningEvidence[], assertions:string) {
  testBindings=bindings;put(sourcePath,JSON.stringify(candidate))
  const code=`import{captureCurriculumSource}from${JSON.stringify(captureHelper)};import assert from 'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';import{readCurrentCurriculumAssessmentScopes,evaluateCurriculumExamReadiness}from${JSON.stringify(imports)};const O=${JSON.stringify(OWNER)},path=${JSON.stringify(resolve(scratch,sourcePath))};const get=()=>{const scope=readCurrentCurriculumAssessmentScopes([O]).get(O);const source=captureCurriculumSource(${JSON.stringify(sourcePath)},readFileSync(path));return{scope,source,rules:evaluateCurriculumExamReadiness(source,[],[source],scope),manifest:scope.retainedCoverage.manifest}};${assertions};console.log(${JSON.stringify(name+': native concrete binding positive and stale negatives passed')})`.replaceAll(/from"file:\/\/([^"\n]+)"/g,(_all,path)=>'from'+JSON.stringify(path))
  const entry=resolve(scratch,name+'.mjs');writeFileSync(entry,code)
  const result=runFixture(entry,name);assert.equal(result.status,0,result.stderr);process.stdout.write(result.stdout)
}
const repair=structuredClone(typedSource),repaired=repair.goals.find(g=>g.id===exams[0].id)!;repaired.title+=' (editorial)'
const repairBinding:ExactMeaningEvidence={kind:'exact-equivalence-binding',owner:OWNER,goalId:repaired.id,sourcePath,sourceSha256:coverageSha256(JSON.stringify(repair)),oldMeaningSha256:coverageSha256(stableCoverageJson(protectedAssessmentMeaning(exams[0],true))),newMeaningSha256:coverageSha256(stableCoverageJson(protectedAssessmentMeaning(repaired,true))),atomicGoalKeys:[`${OWNER}:${A}`],evidencePins:pins,rationale:'Isolated synthetic fixed editorial equivalence witness; no real material acceptance.'}
await runBoundProof('T09-exact-evidence',repair,[repairBinding],`const good=get();assert.equal(good.manifest.status,'pass');assert.match(good.manifest.rows.find(r=>r.goalId===${JSON.stringify(repaired.id)}).meaningEvidence,/exact-equivalence-binding/);const s=structuredClone(good.source);s.goals.find(g=>g.id===${JSON.stringify(repaired.id)}).title+=' stale';writeFileSync(path,JSON.stringify(s));assert.equal(get().manifest.rows.find(r=>r.goalId===${JSON.stringify(repaired.id)}).decision,'fail')`)
const first=structuredClone(typedSource),FIRST='6ebc2a67-ea20-5c4e-8a63-635f40438d6a'
const targets=Array.from({length:20},(_,index)=>({id:`44444444-4444-4444-8444-${String(index+1).padStart(12,'0')}`,title:'Synthetic first-binding target '+index,description:'Fixed synthetic protected competence '+index,weight:1,contains:[],requires:[],type:'atomic'}))
const firstCluster={id:'66666666-6666-4666-8666-666666666666',title:'Synthetic first coverage cluster',weight:20,contains:targets.map(g=>g.id),requires:[],type:'cluster'}
const firstExam={...structuredClone(exams[0]),id:FIRST,title:'Synthetic exact first twenty',examData:{...structuredClone(exams[0].examData),reviewStatus:'draft',coveredGoalIds:[firstCluster.id]}}
first.goals.push(...targets as unknown as LearningGoal[],firstCluster as unknown as LearningGoal,firstExam as unknown as LearningGoal);first.goals.find(g=>g.id===practice[0])!.contains.push(FIRST)
put('fixture-first-twenty-source.json',JSON.stringify(first))
const firstBinding:ExactMeaningEvidence={sourceReference:{path:'fixture-first-twenty-source.json',sha256:coverageSha256(JSON.stringify(first))},kind:'first-definition-binding',owner:OWNER,goalId:FIRST,sourcePath,sourceSha256:coverageSha256(JSON.stringify(first)),newMeaningSha256:coverageSha256(stableCoverageJson(protectedAssessmentMeaning(firstExam,true))),coverageState:'declared',atomicGoalKeys:targets.map(g=>`${OWNER}:${g.id}`).sort(),protectedGoalMeanings:resolveRetainedCoverage(first,firstExam.examData.coveredGoalIds).definitions.map(id=>({key:`${OWNER}:${id}`,sha256:coverageSha256(stableCoverageJson(protectedAssessmentMeaning(first.goals.find(g=>g.id===id)!)))})),evidencePins:pins,rationale:'Synthetic exact first-definition task and source witnesses; no production introduction or result transfer.'}
await runBoundProof('T19-first-twenty',first,[firstBinding],`const good=get(),r=good.manifest.rows.find(r=>r.goalId===${JSON.stringify(FIRST)});assert.equal(good.manifest.status,'pass');assert.equal(r.decision,'first-definition-bound');assert.equal(r.coverage.currentAtomicGoalKeys.length,20);assert.equal(good.rules.find(r=>r.id==='CQR-202').status,'fail');assert.equal(good.rules.find(r=>r.id==='CQR-204').status,'pass');const s=structuredClone(good.source);s.goals.find(g=>g.id===${JSON.stringify(FIRST)}).examData.coveredGoalIds=${JSON.stringify(targets.map(g=>g.id))};writeFileSync(path,JSON.stringify(s));assert.equal(get().manifest.rows.find(r=>r.goalId===${JSON.stringify(FIRST)}).decision,'first-definition-bound');s.goals.find(g=>g.id===${JSON.stringify(B)}).title+=' unrelated';writeFileSync(path,JSON.stringify(s));assert.equal(get().manifest.rows.find(r=>r.goalId===${JSON.stringify(FIRST)}).decision,'first-definition-bound');s.goals.find(g=>g.id===${JSON.stringify(FIRST)}).extendedData={aliasOf:${JSON.stringify(exams[0].id)}};writeFileSync(path,JSON.stringify(s));assert.ok(get().manifest.rows.find(r=>r.goalId===${JSON.stringify(FIRST)}).issues.includes('meaning-change-unproved'));delete s.goals.find(g=>g.id===${JSON.stringify(FIRST)}).extendedData;s.goals.find(g=>g.id===${JSON.stringify(FIRST)}).examData.coveredGoalIds.push(${JSON.stringify(B)});writeFileSync(path,JSON.stringify(s));assert.ok(get().manifest.rows.find(r=>r.goalId===${JSON.stringify(FIRST)}).issues.includes('coverage-added'));s.goals=s.goals.filter(g=>g.id!==${JSON.stringify(FIRST)});writeFileSync(path,JSON.stringify(s));assert.ok(get().manifest.rows.find(r=>r.goalId===${JSON.stringify(FIRST)}).issues.includes('missing-historical-definition'))`)
const standalone=structuredClone(typedSource),STANDALONE='55555555-5555-4555-8555-555555555555',own={...structuredClone(exams[23]),id:STANDALONE,title:'Synthetic independent own exam'};standalone.goals.push(own)
put('fixture-first-standalone-source.json',JSON.stringify(standalone))
const ownBinding:ExactMeaningEvidence={sourceReference:{path:'fixture-first-standalone-source.json',sha256:coverageSha256(JSON.stringify(standalone))},kind:'first-definition-binding',owner:OWNER,goalId:STANDALONE,sourcePath,sourceSha256:coverageSha256(JSON.stringify(standalone)),newMeaningSha256:coverageSha256(stableCoverageJson(protectedAssessmentMeaning(own,true))),coverageState:'undeclared',protectedGoalMeanings:[],evidencePins:pins,rationale:'Synthetic independent own task/scoring first contract with explicitly undeclared external recognition.'}
await runBoundProof('T19-first-standalone',standalone,[ownBinding],`const good=get(),r=good.manifest.rows.find(r=>r.goalId===${JSON.stringify(STANDALONE)});assert.equal(good.manifest.status,'pass');assert.equal(r.decision,'first-definition-bound');assert.equal(Object.hasOwn(r,'coverage'),false)`)
writeFileSync(resolve(scratch,'synthetic-binding-evidence.json'),JSON.stringify({fixtureOnly:true,productionBindingsRemainEmpty:true,equivalence:repairBinding,firstTwenty:firstBinding,firstStandalone:ownBinding},null,2)+'\n')

await runBoundProof('T13-duplicate-first-registry',first,[firstBinding,firstBinding],`assert.ok(get().manifest.discoveryIssues.includes('incomplete-inventory: duplicate first-definition binding'));assert.equal(get().manifest.status,'fail')`)

await runBoundProof('T09-same-declared-repair',repair,[{...repairBinding,kind:'same-declared-contract-repair'}],`const good=get();assert.equal(good.manifest.status,'pass');assert.match(good.manifest.rows.find(r=>r.goalId===${JSON.stringify(repaired.id)}).meaningEvidence,/same-declared-contract-repair/)`)
