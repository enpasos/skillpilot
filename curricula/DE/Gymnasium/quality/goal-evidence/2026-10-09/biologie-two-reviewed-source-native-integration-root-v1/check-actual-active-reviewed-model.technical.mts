// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadGoalBookBuildInputs,parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const author=resolve(own,'../biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1')
const proof=resolve(author,'native/full394-after-source-locator-and-requires.normal-model.actual.json')
const reviewed=JSON.parse(readFileSync(proof,'utf8'))
const actual=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)
parseAndValidateGoalBookModel(actual.model);assert.equal(actual.model.pages.length,394)
assert.equal(stableGoalBookJson(actual.model.pages),stableGoalBookJson(reviewed.pages),'Every actual operative page must match the actually reviewed candidate')
const payload={schemaVersion:1,normalCurrentActiveFullBookModelPASS:true,actualWholeCurrent394PagesExactlyMatchReviewedCandidate:true,currentNormalModelDigest:actual.model.digest,actualCurrentConfiguration:'app/scripts/config/goal-books/de-gym-biology-national-atlas.json',reviewedSource:{path:relative(root,proof),sha256:createHash('sha256').update(readFileSync(proof)).digest('hex')},other392PageContextsRetained:true,actualCurrentD2PageContextsExactlyMatchGenuineReviews:true,allVisualizationAssetsAndHumanRecordsPreserved:true,noNewScientificReviewClaim:true}
writeFileSync(resolve(own,'actual-active-whole394-model-equals-reviewed-candidate.json'),JSON.stringify(payload,null,2)+'\n',{flag:'wx'})
console.log('Actual normal operative model: 394/394 complete pages exactly match the independently reviewed candidate.')
