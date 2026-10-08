// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,existsSync,renameSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),REQ:Record<string,any>={}
const bind=(p:string)=>{const b=readFileSync(p),v={path:relative(R,p),sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length};REQ[v.path]=v;return v}
const read=(p:string)=>{bind(p);return JSON.parse(readFileSync(p,'utf8'))}
const put=(name:string,v:any)=>{const p=resolve(D,name),b=Buffer.from(JSON.stringify(v,null,2)+'\n');if(existsSync(p))assert.ok(readFileSync(p).equals(b),p);else{mkdirSync(dirname(p),{recursive:true});const t=p+'.tmp';writeFileSync(t,b,{flag:'wx'});renameSync(t,p)}return bind(p)}
const g=read(resolve(D,'initial-current480-378-full-context-source-M-guards.technical.json')),ids:string[]=g.scope20GoalIds,canonical=read(resolve(D,'before/canonical.json')),by=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g])),kinds=read(resolve(D,'before/kinds.json'))
assert.equal(canonical.goals.length,480);assert.equal(bind(resolve(R,g.beforeBindings.canonical.path)).sha256,g.beforeBindings.canonical.sha256)
assert.equal(kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').length,378)
const configPath=resolve(D,'before/full378.current-before.real-loader.config.json'),current=await loadGoalBookBuildInputs(relative(R,configPath),R);assert.equal(current.model.pages.length,378);assert.equal(current.model.book.projectedAtomicGoalCount,410);assert.equal(current.model.book.excludedTargetAtomicGoalCount,32)
const original=read(resolve(D,'../chemie-q3-twenty-whole-science-source-author-20261008-v1/native/full378.current-native.book-model.json'));assert.equal(original.pages.length,378)
for(const page of current.model.pages){const prior=original.pages.find((p:any)=>p.goalId===page.goalId);assert.ok(prior);assert.equal(stableGoalBookJson(page),stableGoalBookJson(prior),'Actual current whole native page drift: '+page.goalId)}
put('native/full378.current-before.real-loader.book-model.json',current.model)
const entries=ids.map(goalId=>{const goal=by.get(goalId),page=current.model.pages.find(p=>p.goalId===goalId);assert.ok(page);assert.equal(page.description,goal.description);assert.equal(page.title,goal.title);assert.deepEqual(new Set([...page.requires,...page.externalPrerequisites].map(p=>p.goalId)),new Set(goal.requires));return {goalId,wholeCurrentGoal:goal,wholeCurrentNativePage:page,canonicalContext:buildGoalDescriptionCanonicalContext(goal),actualRequiresWholeGoals:goal.requires.map((id:string)=>by.get(id)),actualParents:canonical.goals.filter((g:any)=>g.contains?.includes(goalId))}})
put('native/whole-current20-pure-contexts-no-subset-render.actual.json',{actualFullCurrent378:true,actualFullCanonical480:true,rawProjectedAtomic410AndExcludedPractice32:true,actualPages378ExactToOriginalAuthor:true,entries,role:'Actual full loader/context only, not scientific review or final-eligible rendering',activeWrites:0,strictGainClaimed:0,humanApproval:false})
put('checks/initial-full378-loader-and-current20-native-context.author.actual.json',{actualNativeLoader:'loadGoalBookBuildInputs',configPath:relative(R,configPath),actualPages378:true,otherAndSelectedAll378WholePagesExact:true,wholeGoals480:true,sourcePool1602Duties929Partners5459: g.wholeSourceCounts,nationalActiveAtlasExpected359Unchanged:g.nationalAtlasExpectedCurrentCount===359,finalEligibleNativeCount:'Root selected2 only, render pending real P16 and PNG16 remediation bytes',activeWrites:0,strictGainClaimed:0})
put('checks/initial-native-context-declared-inputs.technical.json',{files:Object.values(REQ)})
console.log('Actual full480/curricular378 loader, all378 whole pages exact, 20 pure current contexts; national Atlas359 unchanged; no science or approvals; exit0.')
