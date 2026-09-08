// Exact reviewed source-component overlay. No writes, registry mutation or broad source inheritance.
import config from './config/physics-final-diode-mapping-overrides.json'
type Decision={sourceGoalId:string;canonicalGoalIds:string[];rationale:string;reviewedAt:string;reviewer:string}
type Mapping={legacyGoalId:string;canonicalGoalId:string;matchType:string;reviewDecisionId:string}
export function applyPhysicsFinalDiodeMappings(decisions:Decision[],mappings:Mapping[]){
 for(const row of config.overrides){const d=decisions.find(d=>d.sourceGoalId===row.sourceGoalId);if(!d)continue
  d.canonicalGoalIds=d.canonicalGoalIds.filter(id=>!row.removeGoalIds.includes(id))
  for(const id of row.addGoalIds)if(!d.canonicalGoalIds.includes(id))d.canonicalGoalIds.push(id)
  d.rationale=row.rationale;d.reviewedAt=config.reviewedAt;d.reviewer=config.reviewer
  for(let i=mappings.length-1;i>=0;i--)if(mappings[i].legacyGoalId===row.sourceGoalId&&row.removeGoalIds.includes(mappings[i].canonicalGoalId))mappings.splice(i,1)
  for(const id of row.addGoalIds)if(!mappings.some(m=>m.legacyGoalId===row.sourceGoalId&&m.canonicalGoalId===id))mappings.push({legacyGoalId:row.sourceGoalId,canonicalGoalId:id,matchType:'partial',reviewDecisionId:row.sourceGoalId})
 }
}
