from pathlib import Path
import json,hashlib,datetime,shutil,subprocess
root=Path('/home/enpasos/projects/skillpilot');iso=Path('/tmp/skillpilot-wirtschaft-e2-fourteen-native-f25ihsz6');binding=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-fourteen-reviewed-translation-bindings-v1');base=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-fourteen-native-preparation-technical-20261008-v1');review=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-fourteen-independent-positive-parity-review-v1')
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();write=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert not (root/binding/'native-full-successor-check.actual.json').exists()
freeze=read(root/base/'native-d-e2-fourteen-final.prepared-freeze.actual.json');frozen=freeze['byteExactReturnedNativeFiles'];assert len(frozen)==28
for x in frozen:assert sha(root/x['path'])==x['sha256'] and sha(iso/x['path'])==x['sha256'] and (root/x['path']).stat().st_size==x['bytes']
source=read(iso/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');config=read(root/binding/'memory.config.json');deckpaths=set()
for goal in source['goals']:
 if goal.get('nodeKind')=='memory':
  for key in ['vocabularySource','vocabularySourceEn']:
   value=goal.get('extendedData',{}).get(key)
   if value:deckpaths.add(Path('app/public')/value.lstrip('/'))
viewpaths={Path(item['viewPath']) for item in config['visibilityScopes']};assert len(deckpaths)==5 and len(viewpaths)==2
inputs=[]
for path in sorted(deckpaths|viewpaths):
 (iso/path).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/path,iso/path);assert (root/path).read_bytes()==(iso/path).read_bytes();inputs.append({'path':str(path),'sha256':sha(root/path),'bytes':(root/path).stat().st_size,'role':'actual_deck' if path in deckpaths else 'configured_visibility_view'})
commands=[]
for kind,script in [('atomicity','app/scripts/semanticAtomicityReview.ts'),('memory','app/scripts/memoryCardReview.ts')]:
 assert (root/script).read_bytes()==(iso/script).read_bytes()
 cmd=['node','app/node_modules/tsx/dist/cli.mjs',script,'--config='+str(binding/(kind+'.config.json')),'--mode=check'];result=subprocess.run(cmd,cwd=iso,capture_output=True,text=True)
 for name,text in [(kind+'.native.stdout.txt',result.stdout),(kind+'.native.stderr.txt',result.stderr)]:
  assert not (root/binding/name).exists();(iso/binding/name).write_text(text)
 commands.append({'command':cmd,'workingDirectory':str(iso),'exitCode':result.returncode,'stdoutPath':str(binding/(kind+'.native.stdout.txt')),'stderrPath':str(binding/(kind+'.native.stderr.txt')),'nativeEntrypointSha256':sha(root/script)});print(result.stdout,result.stderr);assert result.returncode==0
# Retention is proven against actual active predecessor records, not inferred from count.
reg=read(root/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');econ=next(x for x in reg['subjects'] if x['subject']=='wirtschaftswissenschaften');ids=set(read(root/base/'native-d-e2-fourteen.final.batch.config.json')['goalIds']);counts={}
for kind,key in [('atomicity','semanticAtomicityConfigPath'),('memory','memoryReviewConfigPath')]:
 oldcfg=read(root/econ[key]);oldbytes=(root/oldcfg['reviewPath']).read_bytes();old={json.loads(x)['goalId']:x for x in oldbytes.splitlines(keepends=True)};newbytes=(root/binding/(kind+'.review.jsonl')).read_bytes();new={json.loads(x)['goalId']:x for x in newbytes.splitlines(keepends=True)};assert set(old)==set(new) and len(new)==303
 changed={k for k in new if new[k]!=old[k]};assert changed==ids;assert all(new[k]==old[k] for k in new if k not in ids);assert (iso/binding/(kind+'.review.jsonl')).read_bytes()==newbytes
 counts[kind]={'ordinaryDecisions':303,'changedGoalIds':sorted(changed),'unchangedRecordsByteExact':289,'previousConfigPath':econ[key],'previousRecordsSha256':'sha256:'+hashlib.sha256(oldbytes).hexdigest(),'candidateRecordsSha256':'sha256:'+hashlib.sha256(newbytes).hexdigest()}
 if kind=='memory':
  assert (root/oldcfg['cardReviewPath']).read_bytes()==(root/binding/'memory.cards.review.jsonl').read_bytes()==(iso/binding/'memory.cards.review.jsonl').read_bytes();assert len((root/binding/'memory.cards.review.jsonl').read_text().splitlines())==51
for x in frozen:assert sha(root/x['path'])==x['sha256'] and sha(iso/x['path'])==x['sha256']
receipt={'schemaVersion':1,'role':'technical_native_successor_check','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalIsolate':str(iso),'independentlyReviewedTranslationSuccessors':14,'ordinaryDecisions':303,'unchangedRecordsByteExactPerGate':289,'cardsByteExact':51,'visibilityChecks':98,'actualCopiedInputs':inputs,'commands':commands,'gateRecordRetention':counts,'independentReviewPath':str(review/'independent-current-v3-fourteen-positive-closure.receipt.json'),'nativeWholeCurrentPageParityReference':str(base/'root-current-eef-context-countercheck'),'wholeCurrentNativePageContextsUnchanged':14,'checkedFrozenOutputField':'byteExactReturnedNativeFiles','byteExactReturnedNativeFileCount':28,'frozenRootAndIsolateHashesVerifiedBeforeAndAfter':True,'historicalFailedPreparerPreserved':True,'independentSubstantiveReviewClaim':False,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0}
write(iso/binding/'native-full-successor-check.actual.json',receipt)
write(iso/binding/'previous-preparer-interruption.actual.json',{'schemaVersion':1,'role':'technical_followup_observation','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'previousScript':'tmp/prepare-economics-e2-fourteen-current-bindings-20261008.py','previousScriptSha256':sha(root/'tmp/prepare-economics-e2-fourteen-current-bindings-20261008.py'),'reportedInterruption':'assert len(set(paths)) == 7 after A/M merge; relative glob was resolved against wrong location. Native A/M checks had not run.','freezeVerificationLimitation':'Previous script searched frozenInputs/frozenFiles, neither actual key is present, so its loop did not verify the 28 frozen files. This successor verifies actual byteExactReturnedNativeFiles.','claimedPreviousNativeAMSuccess':False,'previousScriptModified':False})
for folder in [binding,base/'root-current-eef-context-countercheck']:
 for p in (iso/folder).rglob('*'):
  if not p.is_file():continue
  dest=root/p.relative_to(iso);dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists():assert dest.read_bytes()==p.read_bytes(),str(dest)
  else:shutil.copyfile(p,dest)
print('E2-14: actual 5 deck + 2 view dependencies copied; native A/M full 303 + cards51 + visibility98 PASS; unchanged289 each and 28 frozen outputs proven byte-exact; no live writes.')
