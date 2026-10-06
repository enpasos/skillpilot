// SPDX-License-Identifier: Apache-2.0
import {checkGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const h=dirname(fileURLToPath(import.meta.url)),m=JSON.parse(readFileSync(resolve(h,'prospective-paths.json'),'utf8'))
const check=checkGoalBookSourceAtlasInputs(m.atlasConfigPath,m.nativeInputRoot)
writeFileSync(resolve(h,'source-atlas-native-check.actual.receipt.json'),JSON.stringify({candidateOnly:true,humanApproval:false,counts:check.receipt.counts,outputsChecked:Object.keys(check.outputs).length,check:check.receipt},null,2)+'\n');console.log(JSON.stringify({outputsChecked:Object.keys(check.outputs).length,counts:check.receipt.counts}))
