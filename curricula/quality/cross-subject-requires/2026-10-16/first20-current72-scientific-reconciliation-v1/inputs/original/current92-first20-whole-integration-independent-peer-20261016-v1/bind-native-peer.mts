import {readFileSync,writeFileSync} from 'node:fs';
import {fingerprint,bytesFingerprint} from '/home/enpasos/projects/skillpilot/app/scripts/lib/crossSubjectRequiresInventory.ts';
const L='/home/enpasos/projects/skillpilot/tmp/cross-subject-requires/current92-first20-whole-integration-independent-peer-20261016-v1';
const read=(n:string)=>JSON.parse(readFileSync(L+'/'+n,'utf8'));
const packet=read('NATIVE-FIRST20-PREPARED-AUTHOR.actual.json');
const body=read('GENUINE-FIRST20-WHOLE-INTEGRATION-INFORMED-INDEPENDENT-PEER.actual.json');
const original=read('dependency-cache/current20-author-direct-runtime-addendum/GENUINE-FIRST20-DIRECT-RUNTIME-SCIENCE-ADDENDUM.AUTHOR.actual.json');
const decisions=packet.decisions.map((a:any,i:number)=>{
 const o=body.rows[i],s=original.rows[i];
 if(a.decisionId!==s.decisionId || fingerprint(a.originalJudgmentSnapshot)!==fingerprint(s) || a.rationale!==s.reason || a.author!==s.reviewer || a.reviewedAt!==s.reviewedAt)throw new Error('Author opinion changed '+i);
 if(o.goalId!==a.dependentGoalId)throw new Error('Peer order changed');
 if(s.proposedCompleteDirectForeignPrerequisiteIds===null && (a.decision!=='granularity_gap' || a.prerequisiteGoalIds.length))throw new Error('Gap converted into partial complete set');
 if(o.nativeDecisionOnAuthor==='approved' && fingerprint(o.acceptedAuthorCompleteSet)!==fingerprint(s.proposedCompleteDirectForeignPrerequisiteIds))throw new Error('Acceptance set changed');
 return {decisionId:a.decisionId,decision:o.nativeDecisionOnAuthor,reviewer:o.reviewer,rationale:o.reason,reviewedAt:o.reviewedAt,reviewInput:a.reviewInput,proposalBindingSha256:fingerprint(a.proposalBinding),ownScientificVerdict:o.ownScientificVerdict,ownProposedCompleteForeignPrerequisiteIds:o.ownProposedCompleteForeignPrerequisiteIds,wholePeerOpinionPath:L+'/GENUINE-FIRST20-WHOLE-INTEGRATION-INFORMED-INDEPENDENT-PEER.actual.json',wholePeerOpinionSha256:bytesFingerprint(readFileSync(L+'/GENUINE-FIRST20-WHOLE-INTEGRATION-INFORMED-INDEPENDENT-PEER.actual.json')),originalAuthorCompleteSet:s.proposedCompleteDirectForeignPrerequisiteIds};
});
const out={schemaVersion:1,authorLedgerSha256:bytesFingerprint(readFileSync(L+'/NATIVE-FIRST20-PREPARED-AUTHOR.actual.json')),inventorySha256:packet.baselineInventorySha256,decisions};
writeFileSync(L+'/NATIVE-FIRST20-INDEPENDENT-PEER.actual.json',JSON.stringify(out,null,2)+'\n',{flag:'wx'});
writeFileSync(L+'/NATIVE-TRANSPORT-EXACT-OPINION-COMPARISON.actual.json',JSON.stringify({checkedUTC:new Date().toISOString(),rows:20,authorIdentityReasonDateAndWholeSnapshotExact:true,gapsRemainNullInOriginalSnapshots:true,approvedCompleteSetsExact:true,normalOwningFingerprintImported:true,errors:[]},null,2)+'\n',{flag:'wx'});
console.log('Bound20 exact original author snapshots to genuine peer decisions, using unchanged owning fingerprint helper.');
