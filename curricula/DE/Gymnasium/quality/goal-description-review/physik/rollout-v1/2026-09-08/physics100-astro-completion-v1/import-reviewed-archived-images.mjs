// Explicit native importer, only after the canonical field plan has been applied.
import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {packagePath} from './assessment-drafts.mjs'
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const receipt=JSON.parse(fs.readFileSync(packagePath+'/image-adoption-receipt.json','utf8'))
const sha=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const landscape=JSON.parse(fs.readFileSync(canonical,'utf8'))
if(receipt.entries.length!==7||receipt.humanApproval!==false)throw Error('Exact seven AI-only receipt required')
for(const entry of receipt.entries){
 if(sha(entry.sourcePath)!==entry.assetSha256||entry.decision!=='accepted_ai_current_exact_raster')throw Error('Unreviewed/current image '+entry.goalId)
 const goal=landscape.goals.find(g=>g.id===entry.goalId)
 if(!goal||goal.contains?.length)throw Error('Current new ordinary atom missing '+entry.goalId)
 const actual=goal.resourceLinks.find(l=>l.role==='primary')
 if(JSON.stringify(actual)!==JSON.stringify(entry.archiveResourceLink))throw Error('Current resource link does not exactly match archive lease '+entry.goalId)
}
const before=sha(canonical),imports=[]
for(const entry of receipt.entries){
 const l=entry.archiveResourceLink
 const args=['scripts/import_goal_visualization.mjs',entry.goalId,entry.sourcePath,'--landscape',canonical,'--subject','physik','--lang',l.lang,'--provider',l.provider,'--license',l.license,'--review-status',l.reviewStatus,'--description',l.description,'--alt-text',l.altText,'--prompt',entry.reconstructionPromptPath,'--reconstruction-prompt',entry.reconstructionPromptPath]
 if(!process.argv.includes('--write'))args.push('--dry-run')
 const result=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:2e6})
 if(result.status!==0)throw Error(result.stdout+result.stderr)
 if(process.argv.includes('--write')){
  const filename=entry.sourcePath.split('/').at(-1),paths=[`curricula/DE/Gymnasium/visualizations/physik/${entry.goalId}/${filename}`,`app/public/assets/goal-visualizations/physik/${entry.goalId}/${filename}`,`backend/src/main/resources/static/assets/goal-visualizations/physik/${entry.goalId}/${filename}`]
  for(const path of paths)if(sha(path)!==entry.assetSha256)throw Error('Imported byte mismatch '+path)
  imports.push({goalId:entry.goalId,assetSha256:entry.assetSha256,paths,provider:l.provider,licenseNotePreserved:l.license,reconstructionPromptSource:entry.reconstructionPromptPath})
 }
}
console.log(JSON.stringify({status:process.argv.includes('--write')?'SEVEN_NATIVE_IMPORTS_BYTE_EXACT_PASS':'SEVEN_NATIVE_DRY_RUNS_PASS',recordedAt:new Date().toISOString(),canonicalBeforeSha256:before,canonicalAfterSha256:sha(canonical),humanApproval:false,imports},null,2))
