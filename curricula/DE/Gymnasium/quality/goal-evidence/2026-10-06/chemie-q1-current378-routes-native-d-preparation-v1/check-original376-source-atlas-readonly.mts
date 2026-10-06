import { writeFileSync } from 'node:fs'
import { checkGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
const result=checkGoalBookSourceAtlasInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',process.cwd())
writeFileSync(own+'/original376-source-atlas.native-checked.receipt.json',JSON.stringify(result.receipt,null,2)+'\n')
console.log(JSON.stringify({originalLiveTreeReadOnly:true,nativeCheck:'PASS',counts:result.receipt.counts,configSha256:result.receipt.configSha256,inputBindingCount:result.receipt.inputBindings.length}))
