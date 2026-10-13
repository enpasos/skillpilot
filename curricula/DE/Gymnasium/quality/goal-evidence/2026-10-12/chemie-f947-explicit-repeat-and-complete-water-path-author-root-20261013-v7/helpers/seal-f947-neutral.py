from pathlib import Path
import json,hashlib,datetime,shutil,importlib.util
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';O=E/'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1';F=E/'chemie-f947-explicit-repeat-and-complete-water-path-author-root-20261013-v7';G='f947cd04-952a-5a9d-9445-3ffc70e02c3c'
rd=lambda p:json.loads(p.read_text());rp=lambda p:str(p.relative_to(R));h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();bind=lambda p:dict(path=rp(p),sha256=h(p));now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def wr(p,x):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
oldSeal=rd(O/'FINAL.inactive18-author-neutral-native.freeze.json')
for b in oldSeal['files']:assert h(R/b['path'])==b['sha256'],b['path']
old=rd(O/'models/whole402.current231-plus-author18.final-inputs.normal.json');new=rd(F/'native/whole402.one-task-successor.normal-model.json');A={p['goalId']:p for p in old['pages']};B={p['goalId']:p for p in new['pages']};assert len(A)==len(B)==402 and list(A)==list(B)
changed=[i for i in A if A[i]!=B[i]];assert changed==[G]
oldP=[json.loads(l) for l in (O/'positive/P18.author.one-thermal-v4.raw17-exact.jsonl').read_text().splitlines()];newP=json.loads((F/'positive/P1.explicit-task.author.normal.jsonl').read_text());oldTarget=next(p for p in oldP if p['goalId']==G)
assert newP['goalFingerprint']==oldTarget['goalFingerprint'] and newP['reviewInputFingerprint']==oldTarget['reviewInputFingerprint'];assert newP['profileFingerprint']!=oldTarget['profileFingerprint']
pa=oldTarget['profile'];pb=newP['profile'];assert {k:v for k,v in pa.items() if k!='applicationCaseBriefs'}=={k:v for k,v in pb.items() if k!='applicationCaseBriefs'}
for a,b in zip(pa['applicationCaseBriefs'],pb['applicationCaseBriefs']):assert {k:v for k,v in a.items() if k not in ['taskDemandDe','taskDemandEn']}=={k:v for k,v in b.items() if k not in ['taskDemandDe','taskDemandEn']}
original=(O/'positive/P18.author.one-thermal-v4.raw17-exact.jsonl').read_text().splitlines();expected='\n'.join(l for l in original if json.loads(l)['goalId']!=G)+'\n';assert (F/'positive/P17.original-frozen-author.raw-exact.jsonl').read_text()==expected
batch=rd(F/'native-D1/batch-manifest.json');bundle=rd(F/'native-D1/bundle/manifest.json');native=rd(F/'native-D1/bundle/book-model.json');assert batch['goalIds']==[G] and len(native['pages'])==1
for a in bundle['artifacts']:assert h(F/'native-D1/bundle'/a['path'])==a['digest']
checks=[rd(F/'checks'/('normal-'+k+'.actual.json')) for k in ['prepare','check','P1']];assert all(c['exitCode']==0 and c['productionModuleSha256']==c['executedModuleSha256'] for c in checks)
for r in ['a','b']:assert not list((F/'native-D1'/('round-'+r)/'results').iterdir())
shutil.copyfile(R/'tmp/chemie-q4-current220-prep/prepare-f947-explicit-task.py',F/'helpers/prepare-f947-explicit-task.py') if (F/'helpers').exists() else None
(F/'helpers').mkdir(exist_ok=True);shutil.copyfile(R/'tmp/chemie-q4-current220-prep/prepare-f947-explicit-task.py',F/'helpers/prepare-f947-explicit-task.py');shutil.copyfile(R/'tmp/chemie-q4-current220-prep/run-f947-normal.py',F/'helpers/run-f947-normal.py');shutil.copyfile(Path(__file__),F/'helpers/seal-f947-neutral.py')
wr(F/'checks/normal402-exact-one-profile-impact-and-401-retention.actual.json',dict(schemaVersion=1,checkedAtUTC=now(),old402Digest=old['digest'],new402Digest=new['digest'],changedGoalIds=changed,unchanged401WholePagesExact=True,protected231WholePagesExact=True,other17ReviewedWholePagesExact=True,other17AuthorPOriginalRawBytesExact=True,sameGoalAndResourceReviewInputFingerprint=True,onlyMatchingFourBilingualTaskDemandsChanged=True,allDataModelAnswersRubricsAndPerformanceCriteriaPreserved=True,original98NeutralInputsStillExact=True,newScientificVotes=0,activeWrites=False,humanApproval=False))
o=rd(O/'REVIEW_INPUTS.final18.current231.neutral.json');external=[b for b in o['scientificMandatoryInputBindings'] if any(s in b['path'] for s in ['literal-source','source-rowwise','atomicity-memory','memory.current'])]
current=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';assert h(current)==oldSeal['currentCanonicalSha256']
selector=F/'REVIEW_INPUTS.one-final-scientific-neutral.json'
wr(selector,dict(schemaVersion=1,kind='Frozen one-goal scientific author/native selector',createdAtUTC=now(),goalIds=[G],currentCanonicalBinding=bind(current),candidateCanonicalBinding=o['candidateCanonicalBinding'],candidateSemanticBinding=o['candidateSemanticBinding'],wholeTwoCasesBinding=bind(F/'positive/whole-two-cases.explicit-demands.author.json'),wholeProfileRecordBinding=bind(F/'positive/P1.explicit-task.author.normal.jsonl'),sourceAndMemoryBackgroundBindings=external,normalNativeBindings=[bind(F/'native-D1'/p) for p in ['batch-manifest.json','bundle/manifest.json','bundle/book-model.json','bundle/book.pdf','bundle/review-input.json','round-a/description-review-campaign.json','round-a/description-review-input.json','round-b/description-review-campaign.json','round-b/description-review-input.json']],reviewerScope='Read the complete original two bilingual cases, data, model answers, rubrics, profile, actual native pages and unchanged source/image/memory context for this one goal. Independently judge task-demand alignment, chemistry and scope. Author candidate is not approval.',excludedInputs=['Other reviewers opinions, completed review reports and seals','Root-only feedback audit'],newIndependentVotesAtFreeze=0,strictGain=0,humanApproval=False,humanTrial=False,activeWrites=False))
spec=importlib.util.spec_from_file_location('normal_schema',R/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);errors=m.curriculum_symlink_errors(R);assert not errors,errors
for p in F.rglob('*'):
 assert not p.is_symlink(),p
 if p.is_file() and p.suffix=='.json':rd(p)
 if p.is_file() and p.suffix=='.jsonl':
  for l in p.read_text().splitlines():
   if l.strip():json.loads(l)
files=[dict(**bind(p),bytes=p.stat().st_size) for p in sorted(F.rglob('*')) if p.is_file()]
seal=F/'FINAL.one-author-neutral-native.freeze.json';wr(seal,dict(schemaVersion=1,kind='Frozen one authored explicit-task successor; fresh independent pair pending',sealedAtUTC=now(),files=files,fileCount=len(files),selectorBinding=bind(selector),normalPrepareCheckAndP1Pass=True,unchanged401WholePagesExact=True,originalOther17VotesRemainBoundToOriginalInputs=True,strictGain=0,humanApproval=False,humanTrial=False,activeWrites=False))
print(json.dumps(dict(seal=bind(seal),selector=bind(selector),fileCount=len(files),new402Digest=new['digest'],unchanged401WholePagesExact=True)))
