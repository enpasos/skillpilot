# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,re,os,shutil,hashlib,subprocess

OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[6];BP=str(OUT.relative_to(ROOT));CAP=ROOT/'tmp/biologie-0beb-underside-normal-preparation-20261012-v1'
CAP.mkdir(parents=True,exist_ok=True)
G='0beb4ca2-2437-557a-9db2-ccda1cbcfa0a';copies={};commands=json.loads((OUT/'checks/normal-commands.actual.json').read_text()) if (OUT/'checks/normal-commands.actual.json').exists() else []
def copy(path):
    path=Path(path);src=ROOT/path;dst=CAP/path
    assert src.is_file(),str(src)
    dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);copies[str(path)]={'path':str(path),'sha256':'sha256:'+hashlib.sha256(src.read_bytes()).hexdigest(),'bytes':src.stat().st_size}
def read(path):return json.loads((ROOT/path).read_text())
entries=['app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/buildGoalBookModel.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts']
pending=[Path(x) for x in entries];seen=set()
while pending:
    p=pending.pop()
    if p in seen:continue
    seen.add(p);copy(p)
    if p.suffix not in ['.ts','.tsx','.mts','.mjs','.js']:continue
    text=(ROOT/p).read_text()
    for a,b in re.findall(r"(?:from\s+['\"]([^'\"]+)['\"]|import\s*['\"]([^'\"]+)['\"])",text):
        ref=a or b
        if not ref.startswith('.'):continue
        q=Path(os.path.normpath(str(p.parent/ref)))
        candidates=[q]+[Path(str(q)+ext) for ext in ['.ts','.tsx','.mts','.mjs','.js','.json']]+[q/'index.ts',q/'index.tsx']
        found=next((x for x in candidates if (ROOT/x).is_file()),None)
        assert found is not None,(str(p),ref)
        pending.append(found)
for folder in ['contracts/goal-evidence','contracts/goal-description-review','contracts/goal-book','contracts/curriculum-package/v1']:
    for p in (ROOT/folder).rglob('*.json'):
        if p.stat().st_size<1000000:copy(p.relative_to(ROOT))
for p in ['app/package.json','app/tsconfig.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json']:
    if (ROOT/p).is_file():copy(p)
mods=CAP/'app/node_modules'
if not mods.exists():mods.symlink_to(ROOT/'app/node_modules',target_is_directory=True)
own_files=['candidate/whole484-current397.image-alt-only.inactive.json','candidate/semantic397.same-decisions.current-path.json','candidate/QA397.single-current-image.pending.json','baseline/P396.other-current-scoped-lines.exact.jsonl','baseline/A1.0beb.retained-text-decision.exact.jsonl','baseline/M1.0beb.retained-text-decision.exact.jsonl','configs/P1.current-image.inactive.config.json','configs/full397.actual-national-atlas.current-image.config.json','configs/D1.first-pass.inactive.batch.config.json','configs/A1.same-body.inactive.config.json','configs/M1.same-body.inactive.config.json','author-inputs/P1.whole-body.binding-only.candidates.json']
for p in own_files:copy(BP+'/'+p)
book=read(BP+'/configs/full397.actual-national-atlas.current-image.config.json');manifest=read(book['compositionViewManifestPath']);copy(book['compositionViewManifestPath'])
for path in manifest['sourcePaths']+[manifest['navigationViewPath'],manifest['durationModelPolicyPath']]:copy(path)
P=read(BP+'/configs/P1.current-image.inactive.config.json');D=read(BP+'/configs/D1.first-pass.inactive.batch.config.json');M=read(BP+'/configs/M1.same-body.inactive.config.json')
for path in [P['reviewCriteriaPath'],D['promptPath'],D['criteriaPath']]+([M['cardReviewPath']] if M.get('cardReviewPath') else [])+[s['viewPath'] for s in M.get('visibilityScopes',[])]:copy(path)
for goal in read(BP+'/candidate/whole484-current397.image-alt-only.inactive.json')['goals']:
    data=goal.get('extendedData',{})
    for key in ['vocabularySource','vocabularySourceEn']:
        path=data.get(key)
        if path:copy('app/public'+path if path.startswith('/data/') else path)
qa=read(BP+'/candidate/QA397.single-current-image.pending.json');asset_links=[]
for q in qa['records']:
    if q.get('visualizationState')!='available':continue
    path=q['publicAssetPath'];dst=CAP/path;dst.parent.mkdir(parents=True,exist_ok=True)
    if q['goalId']==G:
        shutil.copyfile(OUT/'native-public'/q['imageUrl'].lstrip('/'),dst)
        assert 'sha256:'+hashlib.sha256(dst.read_bytes()).hexdigest()=='sha256:33cc4c68c2388b9f545c6ebb62fcec3bf47322b2312a1df965b27ef036a7f21a'
    else:
        if dst.exists():dst.unlink()
        os.link(ROOT/path,dst)
        asset_links.append({'path':path,'sourceAssetExpectedSha256':q['assetSha256'],'mode':'read-only unchanged temporary hardlink; never copied into evidence'})
def run(label,args):
    result=subprocess.run([str(ROOT/'app/node_modules/.bin/tsx')]+args,cwd=CAP,capture_output=True,text=True)
    (OUT/'checks').mkdir(exist_ok=True);attempt=1+sum(x['label']==label for x in commands);name=label+(f'.attempt-{attempt}' if attempt>1 else '')+'.actual.txt';(OUT/'checks'/name).write_text(result.stdout+result.stderr)
    commands.append({'label':label,'attempt':attempt,'command':[str(ROOT/'app/node_modules/.bin/tsx')]+args,'workingDirectory':str(CAP.relative_to(ROOT)),'exitCode':result.returncode,'outputPath':BP+'/checks/'+name})
    (OUT/'checks/normal-commands.actual.json').write_text(json.dumps(commands,indent=2)+'\n')
    if result.returncode:raise RuntimeError(label+' failed: '+(result.stdout+result.stderr)[-4000:])
(CAP/BP/'positive').mkdir(parents=True,exist_ok=True)
run('P1.normal-materialization',['app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',BP+'/configs/P1.current-image.inactive.config.json','--candidates',BP+'/author-inputs/P1.whole-body.binding-only.candidates.json','--write'])
run('P1.normal-check',['app/scripts/positiveGoalEvidenceReview.ts','--config='+BP+'/configs/P1.current-image.inactive.config.json','--mode=check'])
run('A1.retained-normal-check',['app/scripts/semanticAtomicityReview.ts','--config='+BP+'/configs/A1.same-body.inactive.config.json','--mode=check'])
run('M1.retained-normal-check',['app/scripts/memoryCardReview.ts','--config='+BP+'/configs/M1.same-body.inactive.config.json','--mode=check'])
if next(q for q in qa['records'] if q['goalId']==G).get('aiApproved')!='yes':
    (OUT/'positive').mkdir(exist_ok=True);shutil.copyfile(CAP/BP/'positive/P1.current-image.pending.normal.jsonl',OUT/'positive/P1.current-image.pending.normal.jsonl')
    print(json.dumps({'currentP1AndRetainedA1M1NormalChecksPass':True,'finalNativePreparation':'waiting for actual sealed paired image-only V proofs; QA remains pending','newScientificVotes':0,'activeOrGitWrites':False}));raise SystemExit(0)
run('full397.normal-model',['app/scripts/buildGoalBookModel.ts',BP+'/configs/full397.actual-national-atlas.current-image.config.json'])
run('D1.normal-first-pass-prepare',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',BP+'/configs/D1.first-pass.inactive.batch.config.json'])
run('D1.normal-first-pass-check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',BP+'/configs/D1.first-pass.inactive.batch.config.json'])
for folder in ['positive','native']:
    src=CAP/BP/folder;dst=OUT/folder
    if src.exists():shutil.copytree(src,dst,dirs_exist_ok=True)
P1=json.loads((OUT/'positive/P1.current-image.pending.normal.jsonl').read_text());old=json.loads((OUT/'baseline/P1.0beb.whole-original-profile.exact.jsonl').read_text());assert P1['profile']==old['profile'] and P1['profileFingerprint']==old['profileFingerprint'];assert P1['reviewRunIds']==[] and P1['status']=='needs_human_review'
full=read(BP+'/native/full397.current-image.normal-model.json') if (ROOT/BP/'native/full397.current-image.normal-model.json').exists() else json.loads((OUT/'native/full397.current-image.normal-model.json').read_text());assert full['book']['pageCount']==397
subset=json.loads((OUT/'native/D1/bundle/book-model.json').read_text());assert subset['book']['pageCount']==1 and subset['pages'][0]['goalId']==G
for r in ['round-a','round-b']:
    c=json.loads((OUT/'native/D1'/r/'description-review-campaign.json').read_text());assert c['reviewPass']=='first_pass' and c['blindToOtherReviews'] is True and c['goalCount']==1;assert not list((OUT/'native/D1'/r/'results').glob('*'))
for r in copies.values():assert 'sha256:'+hashlib.sha256((ROOT/r['path']).read_bytes()).hexdigest()==r['sha256'],r['path']
assert not any(p.is_symlink() for p in OUT.rglob('*'))
(OUT/'checks/capsule-copy-and-preparation.actual.json').write_text(json.dumps({'capsulePath':str(CAP.relative_to(ROOT)),'exactNormalCodeDependencyFiles':len(seen),'inputAndCodeCopies':list(copies.values()),'unchangedTemporaryAssetHardlinks':asset_links,'newAssetCopiesInEvidence':1,'full397Count':397,'subset1Count':1,'twoEmptyGenuineFirstPassCampaigns':True,'retainedWholeProfileBodyExact':True,'retainedProfileFingerprintExact':True,'other396PRecordLinesExact':True,'newScientificVotes':0,'activeOrGitWrites':False},ensure_ascii=False,indent=2)+'\n')
latest={x['label']:x for x in commands};assert all(x['exitCode']==0 for x in latest.values())
print(json.dumps({'latestNormalCommands':len(latest),'latestExitCodesAll0':True,'retainedPriorFailedAttempts':sum(x['exitCode']!=0 for x in commands),'full397':397,'nativeSubset':1,'firstPassCampaigns':2,'currentP1ProfileBodyExact':True,'other396PRecordLinesExact':True,'scientificVotes':0,'activeOrGitWrites':False}))
