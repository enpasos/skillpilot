// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {gunzipSync} from 'node:zlib'
import {resolve} from 'node:path'
import {createRouteProfiles,evaluateRouteProfile} from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts'
import {buildApplicabilityCompilation} from '../../../../../../../app/scripts/applicabilityCompiler.ts'
const root=resolve(import.meta.dirname,'../../../../../../..'),id='2b9e565f-d9b4-5e23-b5b7-b7977cecff06',retained='151edbf8-eb68-5ef7-8786-43e56a281b0b'
const current=JSON.parse(gunzipSync(readFileSync(resolve(import.meta.dirname,'canonical-physics.observed-before-new-id.json.gz'))).toString('utf8'))
const flagsOnly=structuredClone(current),flagged=flagsOnly.goals.find((g:any)=>g.id===id);flagged.extendedData={...flagged.extendedData,applicabilityProjection:'excluded',compatibilityOnly:true}
const retired=structuredClone(flagsOnly);for(const g of retired.goals)if(g.id!==retained)g.contains=(g.contains??[]).filter((x:string)=>x!==id);retired.goals.find((g:any)=>g.id===retained).contains.push(id)
const app=buildApplicabilityCompilation(),profile=createRouteProfiles(root).find(p=>p.profileId==='canonical-physics-sek2')!
const evaluate=(g:any)=>evaluateRouteProfile(g,profile,app).rules.find(r=>r.id==='CQR-203')
const result={schema:'mp-identity-retention-CQR203-read-only-structural-probe-v1',status:'NO_ACTIVATION_OR_APPROVAL',method:'Actual native evaluateRouteProfile; three in-memory structures only. No new task is installed or marked released, no quality rule or live input changes.',currentActiveOldIdentity:evaluate(current),excludedFlagOnly:evaluate(flagsOnly),movedOldIdentityToExistingRetainedCluster:evaluate(retired),limitation:'A future replacement still needs its own genuine current content/release/coverage acceptance. The last case isolates removal of the old task from active terminal obligations; it does not claim a new qualified endpoint.'}
const expected=JSON.parse(readFileSync(resolve(import.meta.dirname,'native-probe.actual.json'),'utf8'))
for(const key of ['currentActiveOldIdentity','excludedFlagOnly','movedOldIdentityToExistingRetainedCluster'])assert.deepEqual(result[key],expected[key])
console.log(JSON.stringify({...result,reproduction:'PASS: exact three observed native CQR203 rule records reproduced from the shipped frozen input. The111/111 case is an in-memory counterfactual; the old30/18 task remains active until genuine final acceptance.'},null,2))
