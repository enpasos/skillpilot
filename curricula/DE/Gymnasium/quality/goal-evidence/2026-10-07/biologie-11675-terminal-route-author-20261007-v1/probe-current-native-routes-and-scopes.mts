// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildApplicabilityCompilation,intersectApplicabilityJurisdictions} from '../../../../../../../app/scripts/applicabilityCompiler'
import {evaluateRouteProfile,routeProfiles} from './native-quality-private-function-probe'
const own=dirname(fileURLToPath(import.meta.url))
const landscape=JSON.parse(readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','utf8'))
const target='11675f1a-5de2-5926-be78-1e8275f19f5b',terminal='1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a'
const profile=routeProfiles.find(p=>p.profileId==='canonical-biology-sek2')!
const actual=buildApplicabilityCompilation()
const report=actual.reports.find(r=>r.landscapeId===landscape.landscapeId)!
const by=new Map(report.goals.map(r=>[r.goalId,r]))
const endpoint=landscape.goals.find((g:any)=>g.id===terminal)
const current=evaluateRouteProfile(landscape,profile,actual)
const result={nativeFunctionSource:'app/scripts/generateCurriculumQualityStatus.ts#evaluateRouteProfile',fullStatusGeneratorExecuted:false,
currentScope:current,targetApplicability:by.get(target),terminalApplicability:by.get(terminal),
beforeRequiresCount:endpoint.requires.length,
afterRequiresAllOfJurisdiction:intersectApplicabilityJurisdictions([...endpoint.requires,target].map(id=>by.get(id)?.compiledApplicability??{})),
compositionViewStageConfigured:!!profile.compositionViewStage,CQR104:profile.compositionViewStage?'configured':'not_configured',
activeWrites:0,newApprovalsClaimed:0}
writeFileSync(resolve(own,'current-native-route-and-allof-scope.actual.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({currentCQR101:current.rules.find(r=>r.id==='CQR-101'),currentCQR102:current.rules.find(r=>r.id==='CQR-102'),currentTerminalScope:by.get(terminal)?.compiledApplicability,targetScope:by.get(target)?.compiledApplicability,afterScope:result.afterRequiresAllOfJurisdiction,CQR104:result.CQR104}))
