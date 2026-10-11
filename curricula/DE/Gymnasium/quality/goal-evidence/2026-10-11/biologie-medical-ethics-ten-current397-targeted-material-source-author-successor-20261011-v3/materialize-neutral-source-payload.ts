// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
const main=async()=>{
const root=process.cwd()
const P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-medical-ethics-ten-current397-targeted-material-source-author-successor-20261011-v3'
const C=path.join(root,'tmp/medical10-current397-v3-normal-private-capsule')
const {buildGoalBookOriginalSources}=await import(pathToFileURL(path.join(C,'app/scripts/goalBookOriginalSources.ts')).href)
const {expandGoalBookSourceAtlasReceipt}=await import(pathToFileURL(path.join(C,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const read=(n:string)=>JSON.parse(fs.readFileSync(path.join(root,P,n),'utf8'))
const write=(n:string,x:unknown)=>fs.writeFileSync(path.join(root,P,n),JSON.stringify(x,null,2)+'\n')
const model=read('native/whole397-medical10.normal-model.actual.json')
const config=read('sources/normal397-medical10.author.inputs.json')
const sources=buildGoalBookOriginalSources(model,C,config.mappingPaths)
write('sources/whole397.normal-original-sources.actual.json',sources)
const receipt=expandGoalBookSourceAtlasReceipt(JSON.parse(fs.readFileSync(path.join(C,config.outputDirectory,'source-projection.receipt.json'),'utf8')))
write('sources/normal397-atlas.receipt.whole.actual.json',receipt)
console.log(JSON.stringify({normalSourcePages:Object.keys(sources.goals).length,sourceEvidence:sources.evidence.length,normalAtlasPages:receipt.counts.publishedCurricularAtomicGoals,sourceUnionApproval:false}))
}
main().catch(error=>{console.error(error);process.exitCode=1})
