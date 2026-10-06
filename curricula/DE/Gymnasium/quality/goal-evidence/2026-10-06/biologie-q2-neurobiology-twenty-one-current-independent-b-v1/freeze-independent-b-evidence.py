# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,datetime,collections
root=pathlib.Path(__file__).resolve().parents[7];b=pathlib.Path(__file__).resolve().parent;a=b.parent/'biologie-q2-neurobiology-twenty-one-current-author-candidate-v1'
read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();write=lambda n,j:(b/n).write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
afreeze=a/'neurobiology-twenty-one-author-candidate.final.freeze.json';assert sha(afreeze)=='7b94d5170b1a200ad38c674214f1f18c2b0f85122cdd8334db7909dd674fe835'
for f in read(afreeze)['files']:assert sha(root/f['path'])==f['sha256'],f['path']
inputs=set(root/f['path'] for f in read(afreeze)['files']);inputs.add(afreeze)
inputs.update(root/p for p in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json','curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','docs/landscape-runtime.schema.json','app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/src/landscapeTypes.ts','app/node_modules/ajv/package.json','app/node_modules/tsx/package.json'])
# All actually inspected lower source PDFs and current source binding pairs are preserved by path/hash.
regional=read(b/'lower-source-audit/regional-primary-component-audit.json')
for src in regional['sources']:
 for k in ['retainedPrimaryPath','sourceExtractionPath']:
  inputs.add(root/src[k])
for src in read(a/'retained-he-by-binding-inputs.snapshot.json')['lanes']:
 for k in ['mappingPath','extractionPath']:inputs.add(root/src[k])
def paths(x):
 if isinstance(x,str) and x.startswith('curricula/'):
  p=root/x
  if p.is_file():inputs.add(p)
 elif isinstance(x,dict):
  for v in x.values():paths(v)
 elif isinstance(x,list):
  for v in x:paths(v)
paths(regional)
# No review-A input is accepted; references in historical metadata are not broadly read.
assert not any('neurobiology' in str(p) and 'independent-a' in str(p) for p in inputs)
manifest=[{'path':str(p.relative_to(root)),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(inputs)]
write('actual-reviewed-input-manifest.json',{'schemaVersion':1,'capturedAt':now(),'fileCount':len(manifest),'files':manifest,'authorFreezeVerified':True,'independentNeuroAConclusionsRead':False,'sourceURLsAndFetches':'source-inspection/primary-live-fetch.actual.receipt.json and HE-live-vs-retained.actual.receipt.json','claim':'Actual frozen review inputs; hashes bind individually explained scientific/source decisions rather than replace them.'})
s=read(a/'current-twenty-one.snapshot.json');actual=read(root/s['canonicalPath']);byid={g['id']:g for g in actual['goals']};assert all(byid[g['id']]==g for g in s['goals']);proposed=read(a/'proposed-twenty-one.validation-snapshot.json');pg={g['id']:g for g in proposed['goals']};changed=[g['id'] for g in s['goals'] if pg[g['id']]!=g];assert len(changed)==4
r=read(b/'twenty-one.independent-b.substantive-review.json');pc=read(b/'forty-two.independent-b.case-judgments.json');main=read(b/'thirty-three.he-by-primary-binding-judgments.json');v=read(b/'current-twenty-one.visual-binding-status.actual.json');arith=read(b/'independent-model-arithmetic.actual.json');native=read(b/'native-candidate-structure.actual.receipt.json');assert native['schemaErrors']==[] and arith['allPass'] and v['missingCurrentPrimaryLinks']==21
assert [g['goalId'] for g in r['goals']]==s['goalIds'];assert len(pc['cases'])==42;assert len(main['relations'])+len(regional['relations'])==71
combined=collections.Counter(x['verdict'] for x in main['relations']);combined.update(x['boundedVerdict'] for x in regional['relations'])
write('final-meaningful-checks.actual.json',{'checkedAt':now(),'author27FileFreezeStillExact':True,'current21WholeGoalsStillExact':True,'proposedGoalIDSetPreserved':set(s['goalIds'])==set(pg)-set(g['id'] for g in s['contextGoals']),'candidateChangedGoals':changed,'reviewedGoals':21,'actuallyReadDEENCaseBriefs':42,'sourceRelations':71,'sourceComponentVerdictCounts':dict(combined),'nativeStructureErrors':native['schemaErrors'],'arithmeticAllPass':arith['allPass'],'missingCurrentPrimaryLinks':21,'nativeDRecordsCreated':0,'nativeAOrMLedgerRecordsCreated':0,'newImagesOrVApprovals':0,'activeM7Closures':0,'HumanApprovalClaims':0,'NeuroAResultRead':False,'authorPacketChanged':False,'centralChecksRun':False,'scope':'Independent B candidate science/source/P review; nativeD/currentbook/image checks remain open.'})
freezeName='independent-b.neurobiology-twenty-one.final.freeze.json';files=[p for p in sorted(b.rglob('*')) if p.is_file() and p.name!=freezeName]
entries=[{'path':str(p.relative_to(root)),'sha256':sha(p),'bytes':p.stat().st_size} for p in files]
write(freezeName,{'schemaVersion':1,'createdAt':now(),'role':'Independent B; not Neuro author; blind to Neuro A','status':'REVISE_BEFORE_SOURCE_SCOPE_ADOPTION','modelFamily':'GPT-6','exactModelIdentifier':None,'authorFreezeSha256':sha(afreeze),'inputManifestPath':str((b/'actual-reviewed-input-manifest.json').relative_to(root)),'inputManifestSha256':sha(b/'actual-reviewed-input-manifest.json'),'fileCount':len(entries),'totalBytes':sum(e['bytes'] for e in entries),'files':entries,'actualReviewedGoalCount':21,'actualBilingualPCaseCount':42,'sourceRelationCounts':dict(combined),'nativeDRecordsCreated':0,'VApprovals':0,'activeChanges':False,'HumanApproval':False,'M7NewClosures':0,'claim':'Finished bounded independent content review. Concrete source/text/P findings remain open for author remediation. No hashes replace per-goal rationale.'})
for f in entries:assert sha(root/f['path'])==f['sha256']
for f in manifest:assert sha(root/f['path'])==f['sha256']
print(json.dumps({'freezePath':str((b/freezeName).relative_to(root)),'freezeSha256':sha(b/freezeName),'ownFrozenFiles':len(entries),'actualFrozenInputs':len(manifest),'sourceVerdicts':dict(combined)}))
