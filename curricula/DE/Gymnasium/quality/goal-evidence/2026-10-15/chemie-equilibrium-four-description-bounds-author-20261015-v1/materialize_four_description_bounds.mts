import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

const root=dirname(fileURLToPath(import.meta.url))
const repo=resolve(root,'../../../../../../..')
const day=dirname(root)
const hash=(x:string|Buffer)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const file=(p:string)=>readFileSync(p,'utf8')
const json=(p:string)=>JSON.parse(file(p))
const relativePath=(p:string)=>relative(repo,p)
const firstPath=resolve(root,'FIRST.author-bounds.before-edit.md')
const first=file(firstPath)
const firstSeal=json(resolve(root,'FIRST.author-bounds.before-edit.seal.json'))
if(hash(readFileSync(firstPath))!==firstSeal.sha256)throw Error('FIRST seal differs')
const canonicalPath=resolve(day,'chemie-pourbaix-one-missing-image-author-root-20261015-v1/candidate/canonical560.current422.one-pourbaix-image.author.json')
const semanticPath=resolve(day,'chemie-kinetic-mechanism-one-actual-GBS-image-correction-author-root-20261015-v1/candidate-v2/semantic560.one-mechanism-description-source-binding.author-v2.json')
const casesPath=resolve(day,'chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json')
const sourceInputs=[
 [canonicalPath,'sha256:52e199c13f1f0e13ffc148d9babd975e04dbee9b2ac3706fbe3e4b0ab06087d3'],
 [semanticPath,'sha256:597c71f9a9444e7bf8ffd266c3c4de6f826c34a87f438f36a2ce3f358eba76ee'],
 [casesPath,'sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e'],
]
for(const [p,expected] of sourceInputs)if(hash(readFileSync(p))!==expected)throw Error(`Input CAS: ${p}`)
const targetIds=[
 'e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd',
 '1a51362e-fd84-5964-89b5-b435772c2149',
 '0c9fe376-0fbd-5dc1-b8d4-d56d658a00e3',
 '16f0dc69-6da8-5751-a00e-abbc1c882dbc',
]
const descriptions=[...first.matchAll(/^DE: (.+)\n\nEN: (.+)$/gm)].map(m=>({description:m[1],descriptionEn:m[2]}))
if(descriptions.length!==4)throw Error('four sealed DE/EN pairs required')
const originalCanonical=file(canonicalPath), originalSemantic=file(semanticPath)
const before=json(canonicalPath), semanticBefore=json(semanticPath)
if(before.goals.length!==560)throw Error('expected actual complete560')
const after=structuredClone(before), semanticAfter=structuredClone(semanticBefore)
let newCanonical=originalCanonical,newSemantic=originalSemantic
const count=(s:string,p:string)=>s.split(p).length-1
const whole=[]
const sourceFingerprints=[]
for(const [i,id] of targetIds.entries()){
 const g=after.goals.find((g:any)=>g.id===id)
 const old=before.goals.find((g:any)=>g.id===id)
 if(!g||!old)throw Error('missing target')
 const s=semanticAfter.decisions.find((s:any)=>s.goalId===id)
 const oldS=semanticBefore.decisions.find((s:any)=>s.goalId===id)
 const oldFingerprint=fingerprintSemanticKindSourceGoal(old)
 if(!s||!oldS||oldS.sourceFingerprint!==oldFingerprint)throw Error('stale base semantic binding')
 for(const key of ['description','descriptionEn'] as const){
  const from=JSON.stringify(key)+': '+JSON.stringify(old[key])
  const to=JSON.stringify(key)+': '+JSON.stringify(descriptions[i][key])
  if(count(newCanonical,from)!==1)throw Error(`unique raw field occurrence required: ${id}/${key}`)
  newCanonical=newCanonical.replace(from,to)
  g[key]=descriptions[i][key]
 }
 const newFingerprint=fingerprintSemanticKindSourceGoal(g)
 if(newFingerprint===oldFingerprint)throw Error('semantic source fingerprint must change')
 if(count(newSemantic,oldFingerprint)!==1)throw Error('unique old semantic fingerprint required')
 newSemantic=newSemantic.replace(oldFingerprint,newFingerprint)
 s.sourceFingerprint=newFingerprint
 whole.push(g)
 sourceFingerprints.push({goalId:id,before:oldFingerprint,after:newFingerprint})
}
if(JSON.stringify(JSON.parse(newCanonical))!==JSON.stringify(after))throw Error('raw canonical edit mismatch')
if(JSON.stringify(JSON.parse(newSemantic))!==JSON.stringify(semanticAfter))throw Error('raw semantic edit mismatch')
const changedGoals=before.goals.filter((g:any,i:number)=>JSON.stringify(g)!==JSON.stringify(after.goals[i]))
const untouchedGoals=before.goals.filter((g:any,i:number)=>JSON.stringify(g)===JSON.stringify(after.goals[i]))
if(changedGoals.length!==4||untouchedGoals.length!==556)throw Error('whole-goal preservation count')
if(JSON.stringify(before.goals.map((g:any)=>g.id))!==JSON.stringify(after.goals.map((g:any)=>g.id)))throw Error('goal order/identity')
const changes=[]
for(const g of changedGoals){
 const n=after.goals.find((x:any)=>x.id===g.id)
 const keys=[...new Set([...Object.keys(g),...Object.keys(n)])].filter(k=>JSON.stringify(g[k])!==JSON.stringify(n[k]))
 if(JSON.stringify(keys)!==JSON.stringify(['description','descriptionEn']))throw Error('out-of-scope whole-goal mutation')
 changes.push({goalId:g.id,title:g.title,changedKeys:keys,before:{description:g.description,descriptionEn:g.descriptionEn},after:{description:n.description,descriptionEn:n.descriptionEn},otherWholeGoalFieldsExact:true})
}
const topKeys=Object.keys(before).filter(k=>JSON.stringify(before[k])!==JSON.stringify(after[k]))
if(JSON.stringify(topKeys)!==JSON.stringify(['goals']))throw Error('landscape metadata changed')
if(semanticBefore.decisions.length!==semanticAfter.decisions.length)throw Error('semantic decision count')
const semanticChanges=[]
for(let i=0;i<semanticBefore.decisions.length;i++){
 const a=semanticBefore.decisions[i],b=semanticAfter.decisions[i]
 if(JSON.stringify(a)!==JSON.stringify(b)){
  const keys=Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]))
  if(!targetIds.includes(a.goalId)||JSON.stringify(keys)!==JSON.stringify(['sourceFingerprint']))throw Error('semantic change outside four sourceFP')
  semanticChanges.push({goalId:a.goalId,changedKeys:keys,otherDecisionFieldsExact:true})
 }
}
if(semanticChanges.length!==4)throw Error('four sourceFP changes required')
const semTop=Object.keys(semanticBefore).filter(k=>JSON.stringify(semanticBefore[k])!==JSON.stringify(semanticAfter[k]))
if(JSON.stringify(semTop)!==JSON.stringify(['decisions']))throw Error('semantic metadata changed')
const protectedInputs=[
 resolve(day,'chemie-equilibrium16-final-native-fresh-independent-a-20261015-v1/D-FIRST.independent-science.md'),
 resolve(day,'chemie-equilibrium16-final-native-fresh-independent-a-20261015-v1/D-results/chemie-equilibrium16-current422-native560-20261015-v2-first-pass-a.batch-001.records.jsonl'),
 resolve(day,'chemie-equilibrium16-final-native-fresh-independent-b-20261015-v1/FIRST.d16.independent-b.json'),
 resolve(day,'chemie-equilibrium16-final-native-fresh-independent-b-20261015-v1/D-results/chemie-equilibrium16-current422-native560-20261015-v2-first-pass-b.batch-001.records.jsonl'),
]
const retained=protectedInputs.map(path=>({path:relativePath(path),sha256:hash(readFileSync(path))}))
const images=json(resolve(day,'chemie-equilibrium16-final-PNG-current422-native-preparation-technical-20261015-v2/blind-inputs/sixteen-current-exact-physical-image-bodies.json')).images
const physicalImageProof=images.map((im:any)=>{
 const actual=hash(readFileSync(resolve(repo,im.physicalRepositorySource.path)))
 if(actual!==im.physicalRepositorySource.sha256)throw Error('physical image CAS')
 return {goalId:im.goalId,path:im.physicalRepositorySource.path,sha256:actual,copied:false}
})
mkdirSync(resolve(root,'candidate'),{recursive:true});mkdirSync(resolve(root,'checks'),{recursive:true})
const outCanonical=resolve(root,'candidate/canonical560.current422.four-description-bounds.author-v1.json')
const outSemantic=resolve(root,'candidate/semantic560.four-description-source-bindings.author-v1.json')
writeFileSync(outCanonical,newCanonical)
writeFileSync(outSemantic,newSemantic)
writeFileSync(resolve(root,'candidate/four-whole-goals.description-bounds.author-v1.json'),JSON.stringify({role:'Four complete author-successor goal bodies; no review vote',landscapeId:before.landscapeId,goals:whole},null,2)+'\n')
for(const [p,expected] of sourceInputs)if(hash(readFileSync(p))!==expected)throw Error('original changed')
for(const p of retained)if(hash(readFileSync(resolve(repo,p.path)))!==p.sha256)throw Error('prior D evidence changed')
const check={role:'Bounded author mutation/CAS proof only; no D/P/A/M/V judgment or broad build',createdAtUTC:new Date().toISOString(),
 firstSeal:firstSeal.sha256,sourceInputs:sourceInputs.map(([path,sha256])=>({path:relativePath(path),sha256})),
 actualGoalCount:before.goals.length,changedWholeGoals:4,unchangedWholeGoals:556,goalIdentityAndOrderExact:true,unchangedLandscapeMetadata:true,
 onlyCanonicalChangedFields:['description','descriptionEn'],canonicalRawReplacementOperations:8,changes,
 semanticDecisionCount:semanticBefore.decisions.length,changedSemanticSourceFingerprints:4,semanticChanges,sourceFingerprints,
 unchangedSemanticMetadata:true,unchangedSemanticTypingAndDecisionFields:true,
 stockHelper:{path:'app/scripts/goalBookModel.ts',export:'fingerprintSemanticKindSourceGoal',fileSha256:hash(readFileSync(resolve(repo,'app/scripts/goalBookModel.ts'))),usesOriginalImplementation:true,goalsCalled:targetIds},
 preservedPriorDArtifacts:retained,preservedPhysicalImages:physicalImageProof,
 outputs:[outCanonical,outSemantic].map(path=>({path:relativePath(path),sha256:hash(readFileSync(path)),bytes:readFileSync(path).length})),
 scientificBoundaries:'All prior source/scope dissent remains open; author changes do not establish normative curricular coverage, review acceptance, semantic-atomicity approval, human performance, release readiness, or any Strict/M7 count.',
}
writeFileSync(resolve(root,'checks/CAS.four-descriptions-four-sourceFP.actual.json'),JSON.stringify(check,null,2)+'\n')
console.log(JSON.stringify({actual560:before.goals.length,changedWholeGoals:4,unchangedWholeGoals:556,changedDescriptionFields:8,sourceFingerprintsChanged:4,outputCanonicalSha256:hash(readFileSync(outCanonical)),outputSemanticSha256:hash(readFileSync(outSemantic)),physicalImageCopies:0,sourceScopeDissent:'retained'}))
