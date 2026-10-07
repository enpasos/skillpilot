import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts';
const root='/home/enpasos/projects/skillpilot';
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro080b-v4-current-independent-positive-a-20261007-v1';
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-080b-exact-tiergroup-performance-positive-material-author-root-v4';
const parse=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const first=parse(out+'/080b.first-pass.independent-p-a.raw.json');
if(first.peerJudgmentsAccessed!==false||first.verdict!=='KEEP_AI_CANDIDATE')throw new Error('First pass unavailable or inconsistent');
const original=parse(author+'/positive1.actual-author-candidate.jsonl');
const supplied=parse(author+'/targeted-whole-two-cases.raw-author-review-input.json');
if(!isDeepStrictEqual(original.profile,supplied.completeProfile)||!isDeepStrictEqual(first.exactProfileBodyReviewed,supplied.completeProfile))throw new Error('Exact reviewed profile mismatch');
const config=parse(author+'/positive1.native-author.config.json');
const goal=parse(config.landscapePath).goals.find((g:any)=>g.id===first.goalId);
const ledger=parse(config.semanticKindLedgerPath);
const kind=ledger.decisions.find((d:any)=>d.goalId===first.goalId);
if(kind.semanticKind!=='curricularAtomic'||kind.decisionStatus!=='authoritative')throw new Error('Unexpected semantic binding');
const criteria='sha256:'+createHash('sha256').update(readFileSync(resolve(root,config.reviewCriteriaPath))).digest('hex');
const reviewId='biologie-neuro080b-v4-current-independent-positive-a-20261007-v1';
const record={...original,
 reviewId,reviewCriteriaFingerprint:criteria,
 goalFingerprint:fingerprintGoalForPositiveEvidence(goal,kind.semanticKind),
 reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,{},kind.semanticKind),
 profileFingerprint:fingerprintPositiveGoalEvidenceProfile(supplied.completeProfile),
 status:'needs_human_review',reviewAuthority:'ai_candidate',
 reviewedAt:new Date().toISOString(),
 reviewer:'Codex independent P-A /root/bio_ce19_v2_visual_b; exact serving model not exposed',
 reason:'Independent first-pass KEEP for the exact complete v4 bilingual 080b material: explicitly assigned animal models require mechanism, correct conduction and bounded performance reasoning; fresh changed diameter/myelination and missing processing times require justified transfer. No observed learner work or human approval.',
 evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],
 dissent:['Whole BY/HE source and course/country view claims remain unapproved; broad HE bullet does not alone establish the complete BY performance-comparison operator.','Synthetic model values are not empirical animal or learner evidence; human approval and trial remain absent.','Original stage02 view has no 080b primary image; the later native21 page/image-bound profile and D/A/M/V remain separate.'],
 profile:supplied.completeProfile
};
if(record.profileFingerprint!==original.profileFingerprint)throw new Error('Native exact profile fingerprint changed');
writeFileSync(resolve(root,out,'positive1.independent-p-a.actual.jsonl'),JSON.stringify(record)+'\n');
const ownConfig={...config,reviewId,reviewPath:out+'/positive1.independent-p-a.actual.jsonl',scope:{label:'Independent P-A targeted 080b v4 exact positive material, original stage02 goal/kind, retained source holds, no image or future21 binding',goalIds:[first.goalId]}};
writeFileSync(resolve(root,out,'positive1.independent-p-a.native.config.json'),JSON.stringify(ownConfig,null,2)+'\n');
console.log(JSON.stringify({goalId:record.goalId,status:record.status,reviewAuthority:record.reviewAuthority,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,exactV4ProfilePreserved:true},null,2));
