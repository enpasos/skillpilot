import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const base="curricula/DE/Gymnasium/quality/goal-visualization-review/physics100-final-six-image-repairs-v1/",manifest=JSON.parse(fs.readFileSync(base+'root-six-image-review.json')),before=JSON.parse(fs.readFileSync(base+'root-six-import-before.json'));
const hash=b=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const raw=fs.readFileSync(before.canonicalPath,'utf8'),landscape=JSON.parse(raw),ids=new Set(before.ids),afterLinks={};
for(const g of landscape.goals)if(ids.has(g.id)){afterLinks[g.id]=g.resourceLinks;delete g.resourceLinks;}
assert.equal(hash(JSON.stringify(landscape)),before.unrelatedFieldsSha256,'Unrelated canonical fields changed during serial import.');
const qp='curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',qaBefore=fs.readFileSync(qp,'utf8'),qa=JSON.parse(qaBefore),changes=[];
for(const t of manifest.targets){const q=qa.records.find(r=>r.goalId===t.goalId);assert.ok(q);assert.equal(q.assetSha256,t.sha256);
 const canonical=hash(fs.readFileSync(q.canonicalAssetPath)),publicHash=hash(fs.readFileSync(q.publicAssetPath)),backend='backend/src/main/resources/static'+q.imageUrl;
 assert.equal(canonical,t.sha256);assert.equal(publicHash,t.sha256);assert.equal(hash(fs.readFileSync(backend)),t.sha256);
 const old=structuredClone(q);q.aiApproved='yes';q.aiApprovedAssetSha256=t.sha256;q.aiReviewedAt=new Date().toISOString();q.aiReviewer='codex-root-current-physics-six-image-review';q.aiNotes=t.reason+' Informed AI review, no human, blind or D/P approval claim.';
 changes.push({goalId:t.goalId,assetSha256:t.sha256,canonicalAssetPath:q.canonicalAssetPath,publicAssetPath:q.publicAssetPath,backendAssetPath:backend,before:old,after:q});
}
const qaAfter=JSON.stringify(qa,null,2)+'\n',receipt={schemaVersion:1,status:'six_exact_images_imported_and_ai_reviewed',beforeCanonicalSha256:before.beforeSha256,afterCanonicalSha256:hash(raw),unrelatedCanonicalFieldsSha256:before.unrelatedFieldsSha256,allOtherCanonicalFieldsUnchanged:true,beforeLinks:before.beforeLinks,afterLinks,beforeQaSha256:hash(qaBefore),afterQaSha256:hash(qaAfter),changes};
const diff=execFileSync('python3',['-B','-c','import json,sys,difflib; a,b=json.load(sys.stdin);sys.stdout.write("".join("@@\\n" if s.startswith("@@ ") else s for s in list(difflib.unified_diff(a.splitlines(True),b.splitlines(True),n=3))[2:]))'],{input:JSON.stringify([qaBefore,qaAfter]),encoding:'utf8',maxBuffer:1e6});
console.log(JSON.stringify({patch:'*** Begin Patch\n*** Update File: '+qp+'\n'+diff+'*** Add File: '+base+'root-six-import-qa.receipt.json\n'+JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s).join('\n')+'\n*** End Patch',receipt}));
