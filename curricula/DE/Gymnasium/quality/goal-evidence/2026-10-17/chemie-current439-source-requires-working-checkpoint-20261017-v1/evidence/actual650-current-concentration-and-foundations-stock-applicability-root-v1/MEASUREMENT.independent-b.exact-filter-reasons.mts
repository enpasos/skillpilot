// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import { goalMatchesFilters } from '/home/enpasos/projects/skillpilot/app/src/utils/goalFilters.ts'
const O='/mnt/e/skillpilot-chemie-L7-20261017/actual650-current-concentration-and-foundations-stock-applicability-root-v1'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const c=read(O+'/capsule/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),m=read(O+'/MEASUREMENT.actual650-compiled-course-jurisdiction-duration-frontend-targets.not-backend-acceptance.json'),gs=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]))
const out=m.excludedTargetRows.map((r:any)=>{const g=gs.get(r.goalId),merged={...g,applicability:{...g.applicability,...r.compiledApplicability}};return {viewId:r.viewId,goalId:r.goalId,failedStockFilters:m.views[r.viewId].stockFilters.filter((f:string)=>!goalMatchesFilters(merged,[f]))}})
fs.writeFileSync(O+'/FILTER-REASONS.independent-b.current153.json',JSON.stringify(out,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({count:out.length,allOnlyViewJurisdictionFailed:out.every((r:any)=>r.failedStockFilters.length===1&&r.failedStockFilters[0]===m.views[r.viewId].scope.jurisdiction)}))
