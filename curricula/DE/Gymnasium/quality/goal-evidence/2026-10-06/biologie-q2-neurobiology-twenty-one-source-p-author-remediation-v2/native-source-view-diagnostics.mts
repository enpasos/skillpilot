// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel'
const here=dirname(fileURLToPath(import.meta.url));const iso=resolve(here,'../../../../../../../tmp/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-20261006-v2-native-scope');const phase=process.argv[2];if(!['baseline','candidate'].includes(phase))throw Error('phase')
const out=resolve(here,'native-'+phase);mkdirSync(out,{recursive:true});const configPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json';const config=JSON.parse(readFileSync(resolve(iso,configPath),'utf8'))
const write=(p:string,x:any)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(x,null,2)+'\n')}
let result:any;const attempts:any[]=[]
try{result=buildGoalBookSourceAtlasInputs(config,iso);attempts.push({contract:'original383_union_and_original_scopes',status:'pass'})}
catch(e:any){attempts.push({contract:'original383_union_and_original_scopes',status:'fail',message:e.message,actual:e.actual,expected:e.expected});if(e.message.includes('Source-supported atlas goal count changed')&&Number.isInteger(e.actual)){const diagnostic={...config,expectedCurricularAtomicGoalCount:e.actual};write(resolve(out,'source-atlas.diagnostic-count.config.json'),diagnostic);result=buildGoalBookSourceAtlasInputs(diagnostic,iso);attempts.push({contract:'explicit_actual_footprint_diagnostic_only_no_source_approval',status:'pass',footprint:e.actual})}else{write(resolve(out,'source-atlas.actual.attempts.json'),attempts);throw e}}
for(const [p,bytes] of Object.entries(result.outputs)){mkdirSync(dirname(resolve(iso,p)),{recursive:true});writeFileSync(resolve(iso,p),bytes as string);mkdirSync(dirname(resolve(out,'generated',p)),{recursive:true});writeFileSync(resolve(out,'generated',p),bytes as string)}
write(resolve(out,'source-atlas.actual.receipt.json'),result.receipt);write(resolve(out,'source-atlas.actual.attempts.json'),attempts)
const model=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',iso);write(resolve(out,'source-atlas.actual.book-model.json'),model.model)
const fullConfig=JSON.parse(readFileSync(resolve(iso,'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'),'utf8'));delete fullConfig.compositionViewManifestPath;fullConfig.compositionViewPath='app/scripts/config/goal-books/neuro21-author-full383.view.json';fullConfig.outputPath='app/public/lernzielbuch/neuro21-author-full383.book-model.json';write(resolve(iso,'app/scripts/config/goal-books/neuro21-author-full383.json'),fullConfig)
const canonical=JSON.parse(readFileSync(resolve(iso,fullConfig.landscapePath),'utf8'));write(resolve(iso,fullConfig.compositionViewPath),{viewFormatVersion:'1.0',viewId:'neuro21-author-full383',landscapeId:canonical.landscapeId,language:'de-DE',title:'Biologie – vollständiger inaktiver Autorenbestand',scope:{schoolForm:'Gymnasium',stage:'CrossStage'},rootNodes:[{kind:'canonicalSubtree',goalId:canonical.goals.find((g:any)=>g.tags?.includes('root')).id}]})
const full=await loadGoalBookBuildInputs('app/scripts/config/goal-books/neuro21-author-full383.json',iso);write(resolve(out,'full383.actual.book-model.json'),full.model)
console.log(JSON.stringify({phase,sourceAtlasPages:model.model.pages.length,fullPages:full.model.pages.length,attempts,independentApproval:false}))
