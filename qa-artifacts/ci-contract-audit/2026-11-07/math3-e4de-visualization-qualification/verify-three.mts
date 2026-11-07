import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const packet = 'qa-artifacts/ci-contract-audit/2026-11-07/math3-e4de-visualization-qualification'
const core = await import(pathToFileURL(resolve(root,'app/scripts/goalVisualizationReviewedContext.ts')).href)
const hash = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const index = JSON.parse(readFileSync(resolve(root,packet,'candidate-index.json'),'utf8'))
assert.equal(index.acceptedRepositoryCommit,'25a6f2164a81a7e6ae50db3557d20521fecf5124')
const sourceRaw = readFileSync(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))
assert.equal(hash(sourceRaw),'e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06')
const source = JSON.parse(sourceRaw.toString('utf8'))
const selected = index.candidateReceipts.map((entry: {path:string;sha256:string}) => {
  const raw=readFileSync(resolve(root,entry.path));assert.equal(hash(raw),entry.sha256)
  return {ref:{path:entry.path,sha256:entry.sha256},receipt:JSON.parse(raw.toString('utf8'))}
})
assert.equal(selected.length,3)
const current = (receipt: { context: {goalId:string;subject:string} }) => {
  const goals=source.goals.filter((goal:{id:string})=>goal.id===receipt.context.goalId);assert.equal(goals.length,1)
  const goal=goals[0],primary=goal.resourceLinks.filter((link:{type:string;role:string})=>link.type==='goal-visualization'&&link.role==='primary')
  assert.equal(primary.length,1)
  const imageUrl=primary[0].url,publicAssetPath='app/public'+imageUrl
  return {landscapeId:source.landscapeId,goalId:goal.id,subject:receipt.context.subject,title:goal.title,description:goal.description,
    titleEn:goal.titleEn,descriptionEn:goal.descriptionEn,demandLevel:goal.dimensionTags?.demandLevel,
    imageUrl,publicAssetPath,canonicalAssetPath:'curricula/DE/Gymnasium/visualizations/'+imageUrl.slice('/assets/goal-visualizations/'.length),
    assetSha256:'sha256:'+hash(readFileSync(resolve(root,publicAssetPath)))}
}
let capture=false,activeGoal=''
const calls: Array<{goalId:string;path:string;gitCommit:string;sha256:string;currentCopyRequired:boolean}>=[]
const verify=core.createVisualizationContextVerifier({repositoryRoot:root,acceptedRepositoryCommit:index.acceptedRepositoryCommit,
  onAuthenticatedOriginalRead(binding:{path:string;gitCommit:string;sha256:string},currentCopyRequired:boolean){
    if(capture)calls.push({goalId:activeGoal,...binding,currentCopyRequired})
  }})
const assetArg=process.argv.find(arg=>arg.startsWith('--asset-negative='))
if(assetArg){
  const id=assetArg.slice('--asset-negative='.length),row=selected.find((row:{receipt:{context:{goalId:string}}})=>row.receipt.context.goalId===id)
  assert.ok(row)
  const context=current(row.receipt),actualCurrentAssetSha256=context.assetSha256
  context.assetSha256=row.receipt.context.assetSha256 // A forged old declaration cannot override the actual file bytes.
  const result=verify(row.ref,context)
  assert.equal(result.ok,false);if(!result.ok)assert.match(result.issues.join(' '),/Current actual image bytes differ/u)
  console.log(JSON.stringify({goalId:id,actualCurrentAssetSha256,declaredAssetSha256:context.assetSha256,result},null,2))
}else{
  const positives=[]
  for(const row of selected){
    capture=true;activeGoal=row.receipt.context.goalId
    const context=current(row.receipt),result=verify(row.ref,context)
    capture=false
    assert.equal(result.ok,true,JSON.stringify({goalId:context.goalId,result}))
    if(result.ok)assert.equal(core.hasVerifiedVisualizationContext(result.capability,context),true)
    positives.push({goalId:context.goalId,reviewProfile:row.receipt.reviewProfile,receipt:row.ref,context,
      originalReviewedAt:row.receipt.reviewedAt,originalReviewer:row.receipt.reviewer,qualificationAt:row.receipt.qualification.qualifiedAt})
  }
  const foreign=JSON.parse(readFileSync(resolve(root,packet,'foreign-evidence-controls.json'),'utf8'))
  const scratch=mkdtempSync(resolve(root,packet,'temporary-negative-'))
  const negatives: Array<{case:string;result:unknown}>=[]
  const deny=(name:string,reference:unknown,context:ReturnType<typeof current>,pattern:RegExp)=>{
    const result=verify(reference,context);assert.equal(result.ok,false,name)
    if(!result.ok)assert.match(result.issues.join(' '),pattern,name)
    negatives.push({case:name,result})
  }
  try{
    for(const row of selected){
      const context=current(row.receipt),id=context.goalId
      const edit=(change:(receipt:typeof row.receipt)=>void)=>{
        const receipt=structuredClone(row.receipt);change(receipt)
        const raw=Buffer.from(JSON.stringify(receipt)),path=resolve(scratch,'changed.json');writeFileSync(path,raw)
        return {path:relative(root,path),sha256:hash(raw)}
      }
      deny(id+': changed actual DE context',row.ref,{...context,description:context.description+' Zusätzliche Leistung.'},/Current goal\/image context differs/u)
      deny(id+': changed actual EN context',row.ref,{...context,descriptionEn:context.descriptionEn+' Additional skill.'},/Current goal\/image context differs/u)
      deny(id+': different current owner namespace',row.ref,{...context,landscapeId:context.landscapeId.toUpperCase()},/Current goal\/image context differs/u)
      deny(id+': genuine foreign owner evidence',edit(receipt=>{receipt.ownerSource=foreign[receipt.originalReview.gitCommit]}),context,/Original owner\/goal\/subject association differs/u)
      deny(id+': original reviewer cannot be reattributed',edit(receipt=>{receipt.reviewer+=' fabricated'}),context,/Original decision\/reviewer\/time\/reason differs/u)
      const other=selected.find((candidate:{receipt:{context:{goalId:string}}})=>candidate.receipt.context.goalId!==id)
      assert.ok(other)
      deny(id+': genuine input of another goal is unbound',edit(receipt=>{receipt.originalInput=other.receipt.originalInput}),context,
        /Matrix context must come from the original review itself|Original B review\/input identity differs|Original B review does not bind these exact candidate goal bytes/u)
    }
  }finally{rmSync(scratch,{recursive:true,force:true})}
  const references=new Map<string,{path:string;gitCommit:string;sha256:string;currentCopyRequired:boolean}>()
  for(const row of calls){
    const key=row.gitCommit+':'+row.path,prior=references.get(key)
    if(prior)assert.equal(prior.sha256,row.sha256)
    references.set(key,{path:row.path,gitCommit:row.gitCommit,sha256:row.sha256,currentCopyRequired:row.currentCopyRequired||prior?.currentCopyRequired||false})
  }
  console.log(JSON.stringify({sourceSha256:hash(sourceRaw),acceptedRepositoryCommit:index.acceptedRepositoryCommit,
    positives,negatives,roleReads:calls,originalReferences:[...references.values()],
    positiveCount:positives.length,targetedMetadataNegatives:negatives.length,
    activeSourceQaOrAuthorityChanged:false,newImageReviewClaimed:false},null,2))
}
