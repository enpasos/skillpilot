#!/usr/bin/env python3
import pathlib,tempfile,shutil,json,subprocess,datetime,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[7]
BASE=pathlib.Path(__file__).resolve().parent
AUTHOR=BASE.parent/'biologie-genetic-three-targeted-source-profile-remediation-author-20261011-v1'
def read(p):return json.loads(p.read_text())
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'sha256':digest(p)}
config_path=BASE/'positive/P3.independent-a.inactive.config.json'
candidate_path=BASE/'positive/P3.independent-a.candidates.json'
config=read(config_path);config['reviewRunManifestPaths']=[];write(config_path,config);manifest=read(AUTHOR/'FINAL.neutral-author-input-manifest.json')
capsule=pathlib.Path(tempfile.mkdtemp(prefix='skillpilot-bio-independent-a-normal-P-'))
copied=[];checks=[]
def copy(p,relative=None):
 dest=capsule/(relative or p.relative_to(ROOT));dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest);assert digest(dest)==digest(p);copied.append(ref(p));return dest
try:
 for p in ['app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/src/landscapeTypes.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:
  copy(ROOT/p)
 (capsule/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
 for p in [config_path,candidate_path,ROOT/config['landscapePath'],ROOT/config['semanticKindLedgerPath'],ROOT/config['reviewCriteriaPath']]:copy(p)
 join=read(AUTHOR/'inputs/neutral-whole-three-successor-source-P-case-image-author.join.json')
 for g in join['goals']:
  binding=g['imageKeepBinding'];original=ROOT/binding['frozenOriginalPath'];assert digest(original)==binding['sha256'];copy(original,pathlib.Path('app/public')/binding['url'].lstrip('/'))
 def run(args,label):
  at=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=capsule,text=True,capture_output=True);checks.append({'label':label,'argv':args,'executionRoot':str(capsule),'startedAtUTC':at,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr});print(r.stdout,r.stderr);assert r.returncode==0
 normal=['node',str(ROOT/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(config_path.relative_to(ROOT)),'--candidates',str(candidate_path.relative_to(ROOT))]
 run(normal+['--write'],'unchanged normal materialization against exact frozen original assets in isolated root')
 run(normal,'unchanged normal byte verification before separately documented run-reference metadata')
 record_path=ROOT/config['reviewPath'];record_path.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(capsule/config['reviewPath'],record_path)
 normal_unlinked_digest=digest(record_path)
 records=[json.loads(l) for l in record_path.read_text().splitlines()]
 run_id='biologie-genetic-three-targeted-remediation-independent-a-run-20261011'
 for r in records:r['reviewRunIds']=[run_id]
 record_path.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
 run_path=BASE/'positive/P3.independent-a.run.json'
 model=read(AUTHOR/'native/whole395.P3-only.normal-model.author.actual.json')
 run_manifest={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,'bundleFingerprint':digest(AUTHOR/'FINAL.neutral-author-input-manifest.json'),'bookDigest':model['digest'],'provider':'OpenAI / Codex','model':'GPT-6-based Codex session; exact model build not exposed','role':'subject_reviewer','promptFamilyId':'biologie-targeted-source-positive-understanding-evidence-v2','promptFingerprint':digest(BASE/'positive/prompt.independent-a.actual.md'),'criteriaFingerprint':digest(ROOT/config['reviewCriteriaPath']),'generationParametersFingerprint':digest(BASE/'positive/execution-context.actual.json'),'independenceGroupId':'biologie-targeted-remediation-genuine-independent-a-20261011','blindToOtherRuns':True,'goalIds':config['scope']['goalIds'],'inputArtifacts':[{'role':'book_model','digest':model['digest']},{'role':'review_input_json','digest':digest(AUTHOR/'inputs/neutral-whole-three-successor-source-P-case-image-author.join.json')},{'role':'review_prompt','digest':digest(BASE/'positive/prompt.independent-a.actual.md')},{'role':'review_criteria','digest':digest(ROOT/config['reviewCriteriaPath'])}],'startedAt':read(BASE/'FIRST.neutral-author-inputs.independent-a.actual.json')['frozenAtUTC'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':digest(record_path),'toolchainVersion':'skillpilot-positive-understanding-evidence-v2-current'}
 write(run_path,run_manifest)
 config['reviewRunManifestPaths']=[str(run_path.relative_to(ROOT))];write(config_path,config)
 for p in [record_path,run_path,config_path]:copy(p)
 run(['node',str(ROOT/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+str(config_path.relative_to(ROOT))],'unchanged normal config+run+record schema/fingerprint validation after own run-reference metadata')
 write(BASE/'checks.normal-P-capsule-commands.actual.json',{'role':'Actual normal checks in temporary independent exact-input root; no public/active image adoption','commands':checks,'unchangedCopiedCodeContractsAndInputs':copied,'normalUnlinkedRecordDigest':normal_unlinked_digest,'onlyPostMaterializationMetadataChanges':'reviewRunIds=[] to [own actual runId] on each record; normal profile content and computed fingerprints unchanged; own config adds own manifest path','currentActualPublicAssetsMissing':[g['imageKeepBinding']['url'] for g in join['goals'] if not (ROOT/'app/public'/g['imageKeepBinding']['url'].lstrip('/')).exists()],'directWorkspaceCLIInitialResult':'failed before writing: goal-visualization asset is missing at public path9540; isolated replay is not active/public asset adoption','records':ref(record_path),'run':ref(run_path),'candidateState':'ai_candidate/needs_human_review E1/G1','activeWrites':False})
except Exception:
 write(BASE/'checks.normal-P-capsule-failed-attempt.actual.json',{'commands':checks,'scratchRemoved':True,'activeWrites':False})
 raise
finally:
 shutil.rmtree(capsule)
print('PASS normal materialize+byte verify+final run-bound current P3 validation; external scratch removed.')
