import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const base='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-043-thermodynamics-and-entropy-foundations-20-v1/physics100-thermodynamics-image-repairs-v1/';
const accepted=fs.readFileSync(base+'root-counterreview.jsonl','utf8').trim().split('\n').map(JSON.parse).filter(r=>r.decision==='accept_candidate');
const native=JSON.parse(fs.readFileSync(base+'native-svg-exception-v1/import-receipt.json'));
const reasons={
 '91b20476-12cf-50d6-880a-ea509ffe8a9a':'Root fully viewed the exact PNG proof. Isolated total system and ideal constant-temperature reservoirs explicit. All actual attractions are absent here; this diagram concerns entropy: equal positive heat transfer gives signed energy/entropy changes, positive total entropy for hot-to-cold transfer, zero reversible limit, and permitted local decrease. No particle-count or boundary defect.',
 '616ac6cf-901b-509a-8cbb-bd422ddecf05':'Root fully viewed the exact PNG proof. Four mechanisms correctly separated: friction converts ordered motion to internal energy, mixing of different ideal gases preserves amounts and volume, heat flows hot-to-cold, and free expansion removes only the internal partition of an isolated closed vessel. No external flame, false particle counts or claim that external restoration is impossible.'
};
for(const t of native.targets) accepted.push({goalId:t.goalId,sha256:t.svgProofBinding.svgSha256,reason:reasons[t.goalId],fullRasterViewed:true,pngProofSha256:t.svgProofBinding.pngSha256});
assert.equal(accepted.length,8);
const path='curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json';
const before=fs.readFileSync(path,'utf8'),qa=JSON.parse(before);
const hash=s=>'sha256:'+crypto.createHash('sha256').update(s).digest('hex');
const changes=[];
for(const sight of accepted){
 const r=qa.records.find(r=>r.goalId===sight.goalId);assert.ok(r);assert.equal(r.assetSha256,sight.sha256);assert.equal(hash(fs.readFileSync(r.canonicalAssetPath)),sight.sha256);assert.equal(hash(fs.readFileSync(r.publicAssetPath)),sight.sha256);assert.equal(sight.fullRasterViewed,true);
 const previous=structuredClone(r);r.aiApproved='yes';r.aiApprovedAssetSha256=r.assetSha256;r.aiReviewedAt=new Date().toISOString();r.aiReviewer='codex-root-current-thermodynamics-eight-image-counterreview';r.aiNotes=sight.reason+' Informed AI counter-review; no blind, human or D/P approval claim.';
 changes.push({goalId:r.goalId,before:previous,after:r,pngProofSha256:sight.pngProofSha256??null});
}
const after=JSON.stringify(qa,null,2)+'\n';
const receipt={schemaVersion:1,reviewer:'/root',status:'eight_current_images_ai_reviewed',humanApproval:false,blindReview:false,beforeSha256:hash(before),afterSha256:hash(after),changes};
const diff=execFileSync('python3',['-B','-c','import json,sys,difflib; a,b=json.load(sys.stdin);sys.stdout.write("".join("@@\\n" if s.startswith("@@ ") else s for s in list(difflib.unified_diff(a.splitlines(True),b.splitlines(True),n=3))[2:]))'],{input:JSON.stringify([before,after]),encoding:'utf8',maxBuffer:1e6});
const receiptPath='curricula/DE/Gymnasium/quality/goal-visualization-review/physik-20260907-thermodynamics-eight-adoptions-v1.json';
assert.ok(!fs.existsSync(receiptPath));
console.log(JSON.stringify({patch:'*** Begin Patch\n*** Update File: '+path+'\n'+diff+'*** Add File: '+receiptPath+'\n'+JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s).join('\n')+'\n*** End Patch\n',count:changes.length}));
