# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,copy,shutil
OUT=Path(__file__).resolve().parent.parent;ROOT=OUT.parents[6];AP=str(OUT.relative_to(ROOT));E12=OUT.parent
TECH=E12/'biologie-basiskonzepte-0beb-stomata-underside-one-image-technical-preparation-20261012-v1';G='0beb4ca2-2437-557a-9db2-ccda1cbcfa0a'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(rel,data):
    p=OUT/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');return p
for row in read(TECH/'FINAL.technical-preparation.freeze.json')['ownFiles']:assert sha(ROOT/row['path'])==row['sha256'],row['path']
source=TECH/'native/D1';dest=OUT/'native-D1';assert not dest.exists(),'refuse to overwrite an existing adoption native package'
shutil.copytree(source,dest)
batch=read(TECH/'configs/D1.first-pass.inactive.batch.config.json');original_batch=copy.deepcopy(batch);batch['outputDirectory']=AP+'/native-D1';batch_path=write('configs/D1.relocated.batch.config.json',batch)
assert {k:v for k,v in batch.items() if k!='outputDirectory'}=={k:v for k,v in original_batch.items() if k!='outputDirectory'}
manifest=read(dest/'batch-manifest.json');original_manifest=copy.deepcopy(manifest);manifest['configPath']=str(batch_path.relative_to(ROOT));manifest['configDigest']=sha(batch_path);write('native-D1/batch-manifest.json',manifest)
assert {k:v for k,v in manifest.items() if k not in ['configPath','configDigest']}=={k:v for k,v in original_manifest.items() if k not in ['configPath','configDigest']}
native_files=[]
for src in sorted(source.rglob('*')):
    if not src.is_file():continue
    target=dest/src.relative_to(source)
    if src.name!='batch-manifest.json':assert src.read_bytes()==target.read_bytes(),str(src)
    native_files.append({'sourcePath':str(src.relative_to(ROOT)),'adoptionPath':str(target.relative_to(ROOT)),'sourceSha256':sha(src),'adoptionSha256':sha(target),'exactBytes':src.name!='batch-manifest.json'})
registry_path=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';registry=read(registry_path);before=copy.deepcopy(registry);bio=next(s for s in registry['subjects'] if s['subject']=='biologie')
live_canonical=bio['landscapePath'];live_semantic=bio['semanticKindLedgerPath']
for label,source_config,source_record in [('P1','configs/P1.current-image.inactive.config.json','positive/P1.current-image.pending.normal.jsonl'),('P10','configs/P10.retained-original.inactive.config.json','baseline/P10.other-retained-from-active-P11.exact.jsonl')]:
    cfg=read(TECH/source_config);assert 'reportPath' not in cfg;cfg['landscapePath']=live_canonical;cfg['semanticKindLedgerPath']=live_semantic;cfg['reviewPath']=AP+'/positive/'+label+'.current.exact.jsonl'
    write('active-configs/'+label+'.future-active.config.json',cfg);target=OUT/'positive'/f'{label}.current.exact.jsonl';target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(TECH/source_record,target);assert target.read_bytes()==(TECH/source_record).read_bytes()
    if label=='P1':
        r=read(target);assert r['reviewRunIds']==[] and r['reviewAuthority']=='ai_candidate' and r['status']=='needs_human_review'
audit=read(TECH/'baseline/sole-current-D-chain-and-active-AM-P.actual.json');old_index=audit['soleCurrentDescription']['indexPath'];old_P=audit['targetPConfigPath'];new_index=AP+'/native-D1/resolution-index.json'
assert not any(x['goalId']==G for x in bio.get('resolutionSupersessions',[]));assert new_index not in bio['resolutionIndexPaths']
bio['resolutionIndexPaths'].append(new_index);bio.setdefault('resolutionSupersessions',[]).append({'goalId':G,'supersededIndexPath':old_index,'replacementIndexPath':new_index})
i=bio['positiveEvidenceConfigPaths'].index(old_P);bio['positiveEvidenceConfigPaths'][i:i+1]=[AP+'/active-configs/P10.future-active.config.json',AP+'/active-configs/P1.future-active.config.json']
old_bio=next(s for s in before['subjects'] if s['subject']=='biologie');assert all(s==next(x for x in before['subjects'] if x['subject']==s['subject']) for s in registry['subjects'] if s['subject']!='biologie')
assert {k:v for k,v in bio.items() if k not in ['resolutionIndexPaths','resolutionSupersessions','positiveEvidenceConfigPaths']}=={k:v for k,v in old_bio.items() if k not in ['resolutionIndexPaths','resolutionSupersessions','positiveEvidenceConfigPaths']}
write('prepared-plan/registry.one-goal.future-active.json',registry)
shutil.copyfile(TECH/'candidate/whole484-current397.image-alt-only.inactive.json',OUT/'prepared-plan/canonical.alt-only.future-active.json')
shutil.copyfile(TECH/'candidate/QA397.single-current-image.pending.json',OUT/'prepared-plan/QA.single-image.future-active.json')
live=read(ROOT/live_canonical);prepared=read(OUT/'prepared-plan/canonical.alt-only.future-active.json');old_goals={g['id']:g for g in live['goals']};new_goals={g['id']:g for g in prepared['goals']};restored=copy.deepcopy(prepared);next(g for g in restored['goals'] if g['id']==G)['resourceLinks']=old_goals[G]['resourceLinks'];assert restored==live
assert all(old_goals[id]==new_goals[id] for id in old_goals if id!=G)
qa_before=read(ROOT/bio['visualizationQaPath']);qa_after=read(OUT/'prepared-plan/QA.single-image.future-active.json');before_q={r['goalId']:r for r in qa_before['records']};after_q={r['goalId']:r for r in qa_after['records']};assert set(before_q)==set(after_q);assert all(before_q[id]==after_q[id] for id in before_q if id!=G)
for k in ['humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer','umlautsCorrectChatGpt','contentApprovedChatGpt','chatGptReviewedAt','chatGptReviewer','chatGptNotes']:assert before_q[G][k]==after_q[G][k],k
preserved=[]
for path in [bio['memoryReviewConfigPath'],bio['semanticAtomicityConfigPath'],live_semantic]:preserved.append({'path':path,'sha256':sha(ROOT/path),'futureEdit':False})
plan={'artifactRole':'inactive one-goal adoption plan; root applies only after actual scientific proofs','goalId':G,'registryCASBefore':{'path':str(registry_path.relative_to(ROOT)),'sha256':sha(registry_path)},'futureRegistryPath':AP+'/prepared-plan/registry.one-goal.future-active.json','canonicalCASBefore':{'path':live_canonical,'sha256':sha(ROOT/live_canonical)},'futureCanonicalPath':AP+'/prepared-plan/canonical.alt-only.future-active.json','qaCASBefore':{'path':bio['visualizationQaPath'],'sha256':sha(ROOT/bio['visualizationQaPath'])},'futureQaPath':AP+'/prepared-plan/QA.single-image.future-active.json','assetCASBeforeSha256':'sha256:ca53cf86312d202ca404988f6f377304f8d447b1b747bc4931513a36a4909342','selectedNewAssetSha256':'sha256:33cc4c68c2388b9f545c6ebb62fcec3bf47322b2312a1df965b27ef036a7f21a','oldCurrentDIndex':old_index,'newDIndex':new_index,'oneFutureSupersession':bio['resolutionSupersessions'][-1],'oldP11Config':old_P,'newP10Config':AP+'/active-configs/P10.future-active.config.json','newP1Config':AP+'/active-configs/P1.future-active.config.json','preservedAMAndSemanticPaths':preserved,'otherBiology396GoalAndPScopesProtected':True,'allNonBiologyRegistryFieldsExact':True,'allOtherBiologyRegistryFieldsExact':True,'nativeCloneChangesOnlyManifestConfigLocatorAndDigest':True,'nativeFileBindings':native_files,'pendingConditions':['two actual separately sealed current native first_pass D KEEP records/runs validated','two actual separately sealed current whole P decisions retained as scientific provenance','normal summarize -> synthesis manifest -> resolutions -> finalize complete','P1 scientific attribution bound to actual new-image reviews; author status remains candidate','root CAS uses recorded before hashes and preserves source/public/backend image parity and old history'],'newDOrPVotes':0,'activeOrGitWrites':False}
write('prepared-plan/INACTIVE.single-goal-CAS-and-native-relocation.actual.json',plan)
for row in read(TECH/'FINAL.technical-preparation.freeze.json')['ownFiles']:assert sha(ROOT/row['path'])==row['sha256']
assert sha(registry_path)==plan['registryCASBefore']['sha256'];assert sha(ROOT/live_canonical)==plan['canonicalCASBefore']['sha256'];assert sha(ROOT/bio['visualizationQaPath'])==plan['qaCASBefore']['sha256']
print(json.dumps({'relocatedNativeFiles':len(native_files),'nativeByteDifferences':1,'batchConfigFieldChanges':1,'futurePConfigCount':2,'P1CandidateExact':True,'P10ExactLines':10,'oldD14Preserved':True,'futureD1NotYetSynthesized':True,'onePlannedSupersession':True,'AMAndSemanticUnchanged':True,'nonBioRegistryExact':True,'activeOrGitWrites':False}))
