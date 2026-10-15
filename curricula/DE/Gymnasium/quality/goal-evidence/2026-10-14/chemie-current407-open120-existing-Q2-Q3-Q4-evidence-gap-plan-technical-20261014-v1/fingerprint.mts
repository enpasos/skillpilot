import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts';
const r='/home/enpasos/projects/skillpilot'; const own=path.dirname(new URL(import.meta.url).pathname);const e=path.join(r,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');
const goals=JSON.parse(fs.readFileSync(path.join(own,'REQUEST.selected-current-goals-for-stock-fingerprint-API.json'),'utf8'));
const goalmap=new Map(goals.map((g:any)=>[g.id,g]));const result:any[]=[];const inputs:any[]=[];
const files=[
'chemie-q2-naturstoffe-current402-independent-b-20261012-v1/positive/P31.independent-b.review.jsonl',
'chemie-q2-naturstoffe-current407-fresh-independent-a-20261012-v2/positive/P36.fresh.review.jsonl',
'chemie-q2-naturstoffe-current407-independent-b-20261012-v2/positive/P29.independent-b.review.jsonl',
'chemie-q2-current407-remediation24-fresh-independent-a-20261012-v3/P23.schema-valid-candidates.original.jsonl',
'chemie-q3-thirteen-current402-targeted-independent-a-20261012-v3/positive/P13.independent-a.current.review.jsonl',
'chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3/positive/P13.independent-b.review.jsonl'];
for(const file of files){const full=path.join(e,file);const buf=fs.readFileSync(full);inputs.push({path:path.relative(r,full),sha256:'sha256:'+crypto.createHash('sha256').update(buf).digest('hex'),bytes:buf.length});
for(const line of buf.toString().split('\n').filter(Boolean)){const rec=JSON.parse(line);const g:any=goalmap.get(rec.goalId);if(!g)continue;const digests:any={};const assets:any[]=[];
for(const l of g.resourceLinks??[]){if(l.type!=='goal-visualization')continue;const candidates=[path.join(r,'app/public',l.url.slice(1)),path.join(r,'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host/app/public',l.url.slice(1))];const p=candidates.find(x=>fs.existsSync(x));if(p){const b=fs.readFileSync(p);digests[l.url]='sha256:'+crypto.createHash('sha256').update(b).digest('hex');assets.push({path:path.relative(r,p),sha256:digests[l.url],bytes:b.length});}}
const gf=fingerprintGoalForPositiveEvidence(g,'curricularAtomic');const inf=fingerprintPositiveGoalEvidenceReviewInput(g,rec.reviewCriteriaFingerprint,digests,'curricularAtomic');const pf=fingerprintPositiveGoalEvidenceProfile(rec.profile);
result.push({file:path.relative(r,full),goalId:g.id,currentGoalFingerprint:gf,originalGoalFingerprint:rec.goalFingerprint,goalFingerprintExact:gf===rec.goalFingerprint,currentReviewInputFingerprint:inf,originalReviewInputFingerprint:rec.reviewInputFingerprint,reviewInputFingerprintExact:inf===rec.reviewInputFingerprint,profileFingerprintSelfExact:pf===rec.profileFingerprint,profileFingerprint:pf,assets,recordStatus:rec.status,recordAuthority:rec.reviewAuthority,profile:rec.profile});}}
fs.writeFileSync(path.join(own,'CHECK.scoped-original-stock-P-fingerprint-API.actual.json'),JSON.stringify({role:'unchanged exported stock fingerprint functions only; no CLI or science rerun',inputs,records:result},null,2)+'\n');
for(const x of result)console.log(x.file.split('/').slice(-3).join('/'),x.goalId.slice(0,8),x.goalFingerprintExact,x.reviewInputFingerprintExact);
