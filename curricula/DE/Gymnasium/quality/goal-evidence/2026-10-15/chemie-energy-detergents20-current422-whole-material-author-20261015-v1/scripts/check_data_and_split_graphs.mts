// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createRequire} from 'node:module'
const root=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const at=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const req=createRequire(resolve(root,'app/package.json')),Ajv=req('ajv/dist/2020').default,ajv=new Ajv({strict:false,allErrors:true});req('ajv-formats')(ajv)
const valid=ajv.compile(at('docs/landscape-runtime.schema.json'))
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {prepareLandscapeEntries}=await import(pathToFileURL(resolve(root,'app/src/hooks/useLandscapes.ts')).href)
const input=get('INPUTS.exact-original20-and-current321.author.json'),before=at(input.wholeCanonical.path),after=get('candidate/canonical554.current422.five-whole-author-deltas.json')
const check=(land:any)=>{
 assert.ok(valid(land),JSON.stringify(valid.errors));const diagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(land));assert.ok(!diagnostics.some((d:any)=>d.severity==='error'),JSON.stringify(diagnostics))
 const G=new Map<string,any>(land.goals.map((g:any)=>[g.id,g]));assert.equal(G.size,land.goals.length)
 for(const field of ['requires','contains']){const done=new Set<string>(),busy=new Set<string>();const walk=(id:string)=>{assert.ok(G.has(id));assert.ok(!busy.has(id),field+' cycle '+id);if(done.has(id))return;busy.add(id);for(const r of G.get(id)[field]??[])walk(r);busy.delete(id);done.add(id)};for(const id of G.keys())walk(id)}
 return{wholeGoals:G.size,normalRuntimeSchema:true,normalCanonicalDiagnostics:diagnostics,directRequiresDAG:true,containsDAG:true}
}
const main=check(after),bg=prepareLandscapeEntries([before])[0].goals,ag=prepareLandscapeEntries([after])[0].goals
assert.equal(bg.length,ag.length);assert.deepEqual(bg.map((g:any)=>({id:g.id,requires:g.requires,effective:g.effectiveRequires,contains:g.contains})),ag.map((g:any)=>({id:g.id,requires:g.requires,effective:g.effectiveRequires,contains:g.contains})))
const proposals=get('proposals/c21-and-e64.complete-whole-parent-child-split-hypotheses.json').proposals,splitResults=[]
for(const p of proposals){const land=structuredClone(after);land.goals=land.goals.map((g:any)=>g.id===p.originGoalId?p.wholeProposedParent:g);land.goals.push(...p.wholeProposedChildren.map((r:any)=>r.wholeChild));splitResults.push({originGoalId:p.originGoalId,...check(land),onlyProposedNotSelected:true})}
const receipt={role:'Actual unchanged runtime schema/canonical authoring/projection helpers;no scientific votes',pass:true,selected554:main,all554DirectAndEffectiveRequirementsExact:true,effectiveRequiresChanged:0,separateUnselectedSplitHypotheses:splitResults,newD_P_A_M_VVotes:0,centralRuns:0}
writeFileSync(resolve(own,'checks/DATA.normal-runtime-canonical-direct-contains-effective-and-split-graphs.actual.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt))
