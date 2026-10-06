// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {buildGoalBookOriginalSources,goalBookOriginalSourceMappingPaths,serializeGoalBookOriginalSources} from '../../../../../../../app/scripts/goalBookOriginalSources'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-seven-reviewed-integration-candidate-v3'
const auth='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-six-source-operator-remediation-current-candidate-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(p),'utf8'))
const cfg=read(auth+'/batch.config.json'),old=read(own+'/native-finalbook/bundle/book-model.json')
const base=await loadGoalBookBuildInputs(cfg.baseGoalBookConfigPath)
const current=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:cfg.goalIds,bookId:cfg.bookId,title:cfg.title})
const equal=(a:unknown,b:unknown)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const held='d3cd250f-5221-589d-aa1c-44a4692d1acb';const safe=cfg.goalIds.filter((g:string)=>g!==held)
const comparisons=safe.map((g:string)=>{const a=old.pages.find((x:any)=>x.goalId===g),b=current.pages.find((x:any)=>x.goalId===g);return {goalId:g,oldPageFingerprint:a?.pageFingerprint,currentPageFingerprint:b?.pageFingerprint,entireCurrentPageExact:equal(a,b),deltas:Object.keys(a??{}).filter(k=>!equal(a[k],b?.[k]))}})
writeFileSync(own+'/native-safe-seven-entire-current-page-comparison.actual.json',JSON.stringify({actualAtUTC:new Date().toISOString(),configPath:auth+'/batch.config.json',reviewedModelDigest:old.digest,currentModelDigest:current.digest,comparisons,heldQuantitativeGoalNotReapproved:true,activeWrites:0,humanApproval:false},null,2)+'\n')
if(comparisons.some((x:any)=>!x.entireCurrentPageExact))throw new Error('Actual safe page payload drift: '+JSON.stringify(comparisons.filter((x:any)=>!x.entireCurrentPageExact)))
const atlasConfig='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'
const atlas=await loadGoalBookBuildInputs(atlasConfig)
const mappings=goalBookOriginalSourceMappingPaths(atlas.model,process.cwd(),atlasConfig)
if(!mappings?.length)throw new Error('Registered current Chemistry atlas must provide explicit mapping selection')
const sources=buildGoalBookOriginalSources(atlas.model,process.cwd(),mappings)
writeFileSync(own+'/native-safe-current-source-atlas.original-sources.json',serializeGoalBookOriginalSources(sources))
writeFileSync(own+'/native-safe-current-full.book-model.json',JSON.stringify(base.model,null,2)+'\n')
writeFileSync(own+'/native-safe-current-full-source-selection.actual.json',JSON.stringify({actualAtUTC:new Date().toISOString(),selectedMappingPaths:mappings,selectedMappingCount:mappings?.length,currentFullModelDigest:base.model.digest,currentSourceAtlasModelDigest:atlas.model.digest,registeredAtlasConfigPath:atlasConfig,descriptionScopeCurrentWholePages:comparisons,sourceClosureClaimed:false,threeOwnTransfersNotNormative:true,activeWrites:0,humanApproval:false},null,2)+'\n')
console.log(JSON.stringify({entireSafeCurrentPagesExact:comparisons.length,currentFullModelDigest:base.model.digest,selectedMappingCount:mappings?.length,heldOldQuantitativePageNotReapproved:true,activeWrites:0}))
