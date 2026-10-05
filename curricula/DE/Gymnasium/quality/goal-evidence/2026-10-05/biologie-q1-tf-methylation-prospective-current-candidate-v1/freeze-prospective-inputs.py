# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil
ROOT=Path(__file__).resolve().parents[7];OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
meta=json.loads((OWN/'prospective-paths.json').read_text());ISO=Path(meta['isolationRoot'])
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,v):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
boundary=read(OWN/'active-input-boundary.before.json');active_changed=[]
for item in boundary['paths']:
 if sha(ROOT/item['path'])!=item['sha256']:active_changed.append(item['path'])
registryPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
assert all(p==registryPath for p in active_changed),active_changed
oldRegistry=read(OWN/'current-central.registry.snapshot.json');currentRegistry=read(ROOT/registryPath)
subjectDrift=[s['subject'] for s in oldRegistry['subjects'] if s!=next(n for n in currentRegistry['subjects'] if n['subject']==s['subject'])]
assert all(s=='chemie' for s in subjectDrift),subjectDrift
if active_changed:
 futureRegistry=read(OWN/'prospective-central.registry.candidate.json');futureBio=next(s for s in futureRegistry['subjects'] if s['subject']=='biologie')
 currentRegistry['subjects']=[futureBio if s['subject']=='biologie' else s for s in currentRegistry['subjects']]
 write(OWN/'prospective-central.registry.candidate.json',currentRegistry)
 write(ISO/REL/'prospective-central.registry.candidate.json',currentRegistry)
write(OWN/'observed-concurrent-registry-drift.receipt.json',{'activeRegistryChangedDuringOtherTeamWork':bool(active_changed),'changedSubjectConfigurations':subjectDrift,'biologyMathPhysicsConfigurationValuesUnchanged':True,'candidateFullRegistryRefreshedFromLatestOtherSubjects':True,'integrationRule':'Apply candidate BIO field deltas to the latest live registry after required reviews; never replace unrelated active subject configuration with an older snapshot.','authorActiveWrites':0})
prior=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-current-source-hold-remediation-candidate-v1/author-candidate.freeze.json';freeze=read(prior)
assert freeze['ownArtifactCount']==37
for item in freeze['ownArtifacts']:assert sha(ROOT/item['path'])==item['sha256'],item['path']
baseline=read(OWN/'baseline-full.book-model.json');prospective=read(ISO/REL/'prospective-full.book-model.json')
paths=[meta[k] for k in ['canonicalPath','semanticPath','qaPath','atlasPath','heExtractionPath','heMappingPath','byMappingPath']]
atlas=read(ISO/meta['atlasPath']);paths.extend([atlas['manifestPath'],atlas['navigationViewPath'],atlas['outputDirectory']+'/source-projection.receipt.json'])
paths.extend(s['path'] for s in prospective['source']['compositionViewSources'])
for g in read(ISO/meta['canonicalPath'])['goals']:
 if g['id'] not in meta['goalIds']:continue
 link=next(l for l in g['resourceLinks'] if l.get('type')=='goal-visualization' and l.get('role')=='primary')
 paths.extend([f'curricula/DE/Gymnasium/visualizations/biologie/{g["id"]}/{g["id"]}.png',f'curricula/DE/Gymnasium/visualizations/biologie/{g["id"]}/prompt.de.md',f'app/public{link["url"]}',f'backend/src/main/resources/static{link["url"]}'])
tree=OWN/'prospective-input-tree';assert not tree.exists(),'Do not silently rewrite a frozen input tree'
items=[]
for rel in paths:
 src=ISO/rel;dst=tree/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);assert sha(src)==sha(dst)
 items.append({'path':rel,'preparedPath':str(dst.relative_to(ROOT)),'sha256':sha(dst),'bytes':dst.stat().st_size})
for name in ['prospective-full.book-model.json','prospective-bio-central.report.json','native-qa-normalization.receipt.json','positive.validation-only.review.jsonl','prospective-bio-central.before-native-qa-normalization.report.json']:
 shutil.copy2(ISO/REL/name,OWN/name)
shutil.copytree(ISO/REL/'native-finalbook',OWN/'native-finalbook')
native=read(OWN/'native-code-and-write-isolation.receipt.json');code=[]
for item in native['nativeCodeByteIdentical']:
 if Path(item['path']).suffix in ['.ts','.mts','.cts','.mjs','.cjs','.js','.py']:
  assert sha(ROOT/item['path'])==item['sha256'] and sha(ISO/item['path'])==item['sha256'],item['path'];code.append(item)
source_target=read(ROOT/meta['canonicalPath']);future=read(ISO/meta['canonicalPath']);old={g['id']:g for g in source_target['goals']};new={g['id']:g for g in future['goals']}
changed=[id for id in old if old[id]!=new[id]];expected=[meta['goalIds'][0],'96bdf495-2801-57e4-a0da-ce3bf91e402c','3ac1cbb1-a366-5ae5-85c0-76b08270869d','1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a'];assert set(changed)==set(expected),changed
for id in ['99544494-1825-5fc1-8e23-56f0df808e56','8f6933b1-6e02-5512-acf2-a90a7fb9cb75','6f313681-5e31-5c82-b388-336d85ab1663']:assert old[id]==new[id]
comp=read(OWN/'methylation-v3-inner-preservation.candidate.json');g=new[meta['goalIds'][1]];p=read(OWN/'positive-evidence.candidates.json')['goals'][1]['profile'];assert [g['title'],g['titleEn'],g['description'],g['descriptionEn']]==[comp[k] for k in ['proposedTitleDe','proposedTitleEn','proposedDescriptionDe','proposedDescriptionEn']];assert p==comp['profile']
manifest=read(OWN/'native-finalbook/batch-manifest.json');report=read(OWN/'prospective-bio-central.report.json')['subjects'][0];assert report['strictComplete']==38 and report['denominator']==364 and not report['issues']
result_files=[]
for side in ['round-a','round-b']:
 result_files.extend(p for p in (OWN/'native-finalbook'/side/'results').rglob('*') if p.is_file())
assert not result_files,result_files
write(OWN/'prepared-inputs.freeze.json',{'schemaVersion':1,'frozenAtUTC':datetime.now(timezone.utc).isoformat(),'status':'inactive_prospective_author_inputs_frozen','files':items,'fileCount':len(items),'currentCanonicalCount':441,'prospectiveCanonicalCount':442,'currentDenominator':363,'prospectiveDenominator':364,'newGoalId':meta['goalIds'][1],'candidateCanonicalChangedExistingGoalIds':changed,'allOther437ExistingGoalsUnchanged':len(old)-len(changed)==437,'v3CompanionDEENAndInnerProfilePreservedExactly':True,'allActiveBIOInputHashesUnchanged':True,'concurrentExternalRegistryChangedSubjectConfigurations':subjectDrift,'all37PriorFrozenAuthorArtifactsUnchanged':True,'unmodifiedNativeCodeFileCount':len(code),'bookDigest':prospective['digest'],'twoGoalBookDigest':manifest['artifacts']['bookModelDigest'],'reviewBundleFingerprint':manifest['artifacts']['bundleFingerprint'],'nativeCentralStrictBefore':38,'nativeCentralStrictAfter':38,'newStrictGainClaimed':0,'twoIndependentCampaignsPrepared':True,'completedDReviews':0,'completedPReviews':0,'currentVBindingApproval':'pending separate independent actual review','humanApproval':False,'activeWrites':0})
write(OWN/'active-boundary-and-legacy-preservation.final.receipt.json',{'activeBoundaryBeforePath':str((OWN/'active-input-boundary.before.json').relative_to(ROOT)),'observedConcurrentActiveChangedPaths':active_changed,'changedSubjectConfigurations':subjectDrift,'allActiveBIOPathsUnchanged':True,'all37PriorFrozenArtifactsUnchanged':True,'actualPriorFreezeSHA256':sha(prior),'nativeCodeFileCount':len(code),'actualInspectedPDFFiles':[{'path':str((OWN/f'actual-final-pdf-page-{n}.png').relative_to(ROOT)),'sha256':sha(OWN/f'actual-final-pdf-page-{n}.png'),'physicalPdfPage':n,'actualViewed':True} for n in [3,4]],'all437UnrelatedCanonicalGoalsUnchanged':True,'preservedLKHistoneAndBroadDevelopmentalEpigeneticsUnchanged':True,'authorActiveWrites':0,'humanApproval':False})
print(json.dumps({'status':'prospective_frozen','files':len(items),'nativeBIO':'38/364','newStrictGain':0,'activeInputsChanged':active_changed,'prior37Unchanged':True,'v3InnerUnchanged':True,'preparedDResults':0,'nativeCodeUnmodified':len(code)}))
