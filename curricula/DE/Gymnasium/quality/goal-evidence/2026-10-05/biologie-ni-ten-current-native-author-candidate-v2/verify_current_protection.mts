// SPDX-License-Identifier: Apache-2.0
// Read-only current-input comparison, with inactive outputs confined to this dossier.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..'),rel=here.slice(root.length+1)
const on49=process.argv[2]==='49',protectedCount=on49?49:42
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const write=(p:string,v:any)=>writeFileSync(resolve(here,p),JSON.stringify(v,null,2)+'\n')
const stable=(x:any):string=>Array.isArray(x)?'['+x.map(stable).join(',')+']':x&&typeof x==='object'?'{'+Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stable(v)).join(',')+'}':JSON.stringify(x)
const canonPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const actual=read(canonPath),before=read(rel+'/baseline.canonical.actual.snapshot.json'),future=read(rel+'/canonical.biologie.current.inactive.snapshot.json')
assert.equal(stable(actual),stable(before),'Active canonical drift: rebase explicitly; never overwrite current canon')
const current=(await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)).model
assert.equal(current.pages.length,365)
const futureModel=read(rel+'/prospective-full.book-model.json'),sources=buildGoalBookOriginalSources(current,root),futureSources=read(rel+'/actual-original-sources.current-selected.snapshot.json')
write(on49?'baseline.actual-current49.book-model.snapshot.json':'baseline.actual-current365.book-model.snapshot.json',current)
write(on49?'baseline.actual-current49.original-sources.snapshot.json':'baseline.actual-current365.original-sources.snapshot.json',sources)
const report=read(on49?'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ephase-seven-current365-reviewed-integration-candidate-v3/future-biologie-central.report.json':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-bacterial-structure-fission-reviewed-integration-candidate-v2/future-biologie-central.report.json')
const strict=report.subjects[0].strictCompleteGoalIds;assert.equal(strict.length,protectedCount)
const maps=(x:any[])=>new Map(x.map(v=>[v.goalId??v.id,v])),bg=maps(actual.goals),fg=maps(future.goals),bp=maps(current.pages),fp=maps(futureModel.pages)
const keysChanged=(a:any,b:any)=>[...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>stable(a[k])!==stable(b[k]))
const stripGlobal=(x:any):any=>Array.isArray(x)?x.map(stripGlobal):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!['pageNumber','navigationOrder','treeOrder','pageFingerprint'].includes(k)).map(([k,v])=>[k,stripGlobal(v)])):x
const normalizedSources=(s:any,id:string)=>{
 const docs=new Map(s.documents.map((d:any)=>[d.id,d])),ev=new Map(s.evidence.map((e:any)=>[e.id,e]))
 return (s.goals[id]??[]).map((g:any)=>({...Object.fromEntries(Object.entries(g).filter(([k])=>k!=='evidenceIds')),evidence:(g.evidenceIds??[]).map((i:string)=>{const e:any=ev.get(i);assert(e,'missing source evidence '+i);const d:any=docs.get(e.documentId);assert(d,'missing source document '+e.documentId);return {...Object.fromEntries(Object.entries(e).filter(([k])=>!['id','documentId'].includes(k))),document:Object.fromEntries(Object.entries(d).filter(([k])=>k!=='id'))}}).sort((a:any,b:any)=>stable(a).localeCompare(stable(b)))})).sort((a:any,b:any)=>stable(a).localeCompare(stable(b)))
}
const rows=strict.map((id:string)=>{
 assert(bg.has(id)&&fg.has(id)&&bp.has(id)&&fp.has(id),'protected ID absent '+id)
 const a:any=bp.get(id),b:any=fp.get(id),goalFields=keysChanged(bg.get(id),fg.get(id)),pageFields=keysChanged(a,b),semanticPageFields=keysChanged(stripGlobal(a),stripGlobal(b)),as=normalizedSources(sources,id),bs=normalizedSources(futureSources,id),sourceChanged=stable(as)!==stable(bs)
 assert.equal(a.goalFingerprint,b.goalFingerprint,'protected scientific goal fingerprint changed '+id)
 assert.equal(stable(a.visualization),stable(b.visualization),'protected image changed '+id)
 return {goalId:id,canonicalFieldsChanged:goalFields,goalFingerprintUnchanged:true,visualizationExact:true,pageFieldsChanged:pageFields,semanticPageFieldsChanged:semanticPageFields,sourceWitnessChanged:sourceChanged,beforePageNumber:a.pageNumber,afterPageNumber:b.pageNumber,...(semanticPageFields.length?{actualSemanticPageDeltas:semanticPageFields.map(k=>({field:k,before:stripGlobal(a)[k],after:stripGlobal(b)[k]}))}:{}),...(sourceChanged?{actualSourceWitnessBefore:as,actualSourceWitnessAfter:bs}:{})}
})
write('protected-current'+protectedCount+'.actual-goal-page-source-deltas.json',{candidateOnly:true,humanApproval:false,activeWrites:0,baseline:{canonPath,canonSHA256:createHash('sha256').update(readFileSync(resolve(root,canonPath))).digest('hex'),curricularAtomic:365,strict:protectedCount,bookDigest:current.digest},prospective:{curricularAtomic:383,bookDigest:futureModel.digest},normalization:'Synthetic source/document IDs resolved to actual document payload; global pagination scrubbed recursively only for semantic comparison. Raw actual models and source sidecars retained.',counts:{scientificGoalFingerprintsUnchanged:protectedCount,visualizationsExact:protectedCount,canonicalObjectChanges:rows.filter((r:any)=>r.canonicalFieldsChanged.length).length,semanticPageChanges:rows.filter((r:any)=>r.semanticPageFieldsChanged.length).length,paginationOnlyChanges:rows.filter((r:any)=>r.pageFieldsChanged.length&&!r.semanticPageFieldsChanged.length).length,sourceWitnessChanges:rows.filter((r:any)=>r.sourceWitnessChanged).length},rows,currentStrictNetIncrease:0,restoredBindingClaims:0,adoptionHold:'Every substantive changed source/context/page binding needs fresh targeted independent review before adoption; global page-number movement alone is not a scientific re-review.'})
for(const cfg of ['batch.config.json','existing-five-bindings.batch.config.json']){
 const folder=read(rel+'/'+cfg).outputDirectory,mini=read(folder+'/bundle/book-model.json')
 write(folder.slice(rel.length+1)+'/bundle/original-sources.json',buildGoalBookOriginalSources(mini,read(rel+'/prospective-paths.json').nativeInputRoot,read(rel+'/atlas.inputs.json').mappingPaths))
}
console.log(JSON.stringify({checkedStrict:protectedCount,semanticPageDeltaIDs:rows.filter((r:any)=>r.semanticPageFieldsChanged.length).map((r:any)=>r.goalId),sourceDeltaIDs:rows.filter((r:any)=>r.sourceWitnessChanged).map((r:any)=>r.goalId),paginationOnly:rows.filter((r:any)=>r.pageFieldsChanged.length&&!r.semanticPageFieldsChanged.length).length,currentStrictNetIncrease:0}))
