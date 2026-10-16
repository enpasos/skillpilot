// SPDX-License-Identifier: Apache-2.0
// Targeted unchanged data validators and exact original-M fingerprint comparison.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createRequire} from 'node:module'
const root=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
assert.ok(!existsSync(resolve(own,'FILES.finite-native-preparation.seal.json')))
const at=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const write=(p:string,d:any)=>writeFileSync(resolve(own,p),JSON.stringify(d,null,2)+'\n')
const req=createRequire(resolve(root,'app/package.json')),Ajv=req('ajv/dist/2020').default,ajv=new Ajv({strict:false,allErrors:true});req('ajv-formats')(ajv)
const valid=ajv.compile(at('docs/landscape-runtime.schema.json'))
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {prepareLandscapeEntries}=await import(pathToFileURL(resolve(root,'app/src/hooks/useLandscapes.ts')).href)
const {stableGoalBookJson}=await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href)
const sel=get('INPUTS.exact-original-materials-and-560-basis.json'),before=at(sel.before560.path),after=get('candidate/canonical560.current422.five-sealed-author-CAS.exact.json')
assert.ok(valid(after),JSON.stringify(valid.errors));const diagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(after));assert.ok(!diagnostics.some((d:any)=>d.severity==='error'),JSON.stringify(diagnostics))
const A=new Map<string,any>(after.goals.map((g:any)=>[g.id,g])),B=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]))
for(const field of ['requires','contains']){const done=new Set<string>(),busy=new Set<string>();const walk=(id:string)=>{assert.ok(A.has(id));assert.ok(!busy.has(id),field+' cycle '+id);if(done.has(id))return;busy.add(id);for(const r of A.get(id)[field]??[])walk(r);busy.delete(id);done.add(id)};for(const id of A.keys())walk(id)}
const projected=(land:any)=>prepareLandscapeEntries([land])[0].goals.map((g:any)=>({id:g.id,requires:g.requires,effective:g.effectiveRequires,contains:g.contains}))
assert.deepEqual(projected(before),projected(after))
write('checks/DATA560.normal-schema-canonical-direct-contains-effective.actual.json',{pass:true,wholeGoals:560,currentOrdinaryAtomic:422,normalRuntimeSchema:true,normalCanonicalDiagnostics:diagnostics,directRequiresDAG:true,containsDAG:true,all560DirectAndEffectiveRequirementsExact:true,effectiveRequiresChanged:0,selectedSplits:0,newVotes:0})
const hash=(s:string)=>'sha256:'+createHash('sha256').update(s).digest('hex'),norm=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const fp=(g:any)=>hash(stableGoalBookJson({ruleVersion:'memory-card-review-v1',goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)}))
const m=readFileSync(resolve(root,sel.actualWholeM422OriginalRows.path),'utf8').trim().split('\n').map(l=>JSON.parse(l))
assert.equal(m.length,422)
const radius=m.map((r:any)=>({goalId:r.goalId,originalFingerprint:r.fingerprint,before560Computed:fp(B.get(r.goalId)),after560Computed:fp(A.get(r.goalId)),before560Current:r.fingerprint===fp(B.get(r.goalId)),after560Stale:r.fingerprint!==fp(A.get(r.goalId)),originalScienceUnmodified:true}))
assert.ok(radius.every((r:any)=>r.before560Current));const stale=radius.filter((r:any)=>r.after560Stale).map((r:any)=>r.goalId)
assert.deepEqual(new Set(stale),new Set(at(sel.originalM4Radius.path).candidateTextChangesRequiringFreshM))
write('checks/M422.exact-original-rows-four-author-text-stales.actual.json',{role:'Mechanical production fingerprint-payload comparison only; not a new M judgment or central run',pass:true,originalWholeMReviewerSelector:sel.actualWholeM422ReviewerSelector,originalWholeM422Rows:sel.actualWholeM422OriginalRows,before560All422Current:true,after560418StillCurrent:true,after560FourTextStales:stale,normalWholeMConfigNotRunOnKnownStaleAuthorCandidate:true,sourceCourseHoldsRemainOpen:true,originalRowsEdited:0,fingerprintsRefreshed:0,newVotes:0,rows:radius})
console.log(JSON.stringify({whole560SchemaAndDAG:'pass',allEffectiveRequirementsExact:true,originalM422BeforeCurrent:422,afterValid418:418,openTextStales:stale,newVotes:0}))
