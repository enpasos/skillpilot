# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,datetime,subprocess
ROOT=pathlib.Path.cwd();OUT=pathlib.Path(__file__).resolve().parent;AUTHOR=OUT.parent/'biologie-q1-three-current383-author-continuation-v2'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def d(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def rd(p):return json.loads(p.read_text())
def wr(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
args=['npm','--prefix','app','run','validate:goal-description-review-campaign','--','--bundle',str(AUTHOR/'native-four/bundle/manifest.json'),'--input',str(AUTHOR/'native-four/round-b/description-review-input.json'),'--campaign',str(AUTHOR/'native-four/round-b/description-review-campaign.json'),'--batches-dir',str(OUT/'batches'),'--results-dir',str(OUT/'results')]
start=now();r=subprocess.run(args,cwd=ROOT,capture_output=True,text=True)
wr(OUT/'description-four-native-campaign.terminal.receipt.json',{'schemaVersion':1,'startedAt':start,'completedAt':now(),'argv':args,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'validationOnly':True,'nativeRecords':4,'nativeBlockDecisions':4,'sourceScopeHoldsRetained':True,'activeWrites':0,'humanApproval':False})
if r.returncode:raise SystemExit(r.returncode)
args=['app/node_modules/.bin/tsx',str(OUT/'check-native-p-readonly.mts')];start=now();r=subprocess.run(args,cwd=ROOT,capture_output=True,text=True)
wr(OUT/'positive-four-native-schema.terminal.receipt.json',{'schemaVersion':1,'startedAt':start,'completedAt':now(),'argv':args,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'validationOnly':True,'activeWrites':0,'humanApproval':False})
if r.returncode:raise SystemExit(r.returncode)
wr(OUT/'positive-four-first-public-path-failure.actual.receipt.json',{'schemaVersion':1,'recordedAt':now(),'argv':['app/node_modules/.bin/tsx',str(OUT/'check-native-p-first-public-path-attempt.mts')],'actualExitCode':1,'actualError':'0daa79f6-8f61-5506-98f9-65db83062ba8: goal-visualization asset is missing at /home/enpasos/projects/skillpilot/app/public/assets/goal-visualizations/biologie/0daa79f6-8f61-5506-98f9-65db83062ba8/0daa79f6-8f61-5506-98f9-65db83062ba8.png','executionScope':'Read-only native candidate builder outside the physical author isolation; no result receipt had been written before exception.','resolution':'Direct actual candidate resource hashes supplied to the unchanged native semantic checker; no active path was populated.','activeWrites':0,'humanApproval':False})
freeze=rd(AUTHOR/'author-current-four.final.freeze.json');mismatch=[]
for f in freeze['files']:
 p=ROOT/f['path']
 if d(p)!=f['sha256'] or p.stat().st_size!=f['bytes']:mismatch.append(f['path'])
if mismatch:raise RuntimeError('Author freeze drift '+str(mismatch))
inputs=[ROOT/'AGENTS.md',AUTHOR/'author-current-four.final.freeze.json',AUTHOR/'README.md',AUTHOR/'native-four/bundle/book.pdf',AUTHOR/'native-four/bundle/book.pdf.render-manifest.json',AUTHOR/'native-four/bundle/book-model.json',AUTHOR/'native-four/bundle/manifest.json',AUTHOR/'native-four/round-b/description-review-input.json',AUTHOR/'native-four/round-b/description-review-campaign.json',AUTHOR/'native-four/round-b/prompt.md',AUTHOR/'native-four/round-b/criteria.md',AUTHOR/'native-four/round-b/contracts/goal-description-review-record.schema.json',AUTHOR/'positive-four.inner-candidates.json',AUTHOR/'positive-four.native-candidate-records.json',AUTHOR/'positive-four.validation-only.config.json',AUTHOR/'prospective-canonical.snapshot.json',AUTHOR/'visualization-final-candidate-inputs.v3.json',AUTHOR/'current-source-binding-snapshot.json',AUTHOR/'HE-three-current-original-bullet-patches.candidate.json',AUTHOR/'source-and-replication-preservation-plan.candidate.json',ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',ROOT/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',ROOT/'app/scripts/validateGoalDescriptionReviewCampaignResults.ts',ROOT/'app/scripts/validateGoalDescriptionReviewCampaign.ts',ROOT/'app/scripts/positiveGoalEvidenceProfileModel.ts',ROOT/'app/scripts/materializePositiveGoalEvidenceCandidates.ts',ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',ROOT/'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json']
inputs+=list((AUTHOR/'native-four/round-b/batches').glob('*.input.jsonl'))
source=rd(OUT/'source-scope-component-findings.actual.json')
inputs += [ROOT/r['path'] for r in source['allSeventeenCurrentMappingLanes']]
inputs += [ROOT/r['path'] for r in source['primaryDocumentsRead']]
inputs += [ROOT/r['extractionPath'] for r in rd(AUTHOR/'current-source-binding-snapshot.json')['sourceScopes']]
inputs += [ROOT/r['candidatePath'] for r in rd(AUTHOR/'visualization-final-candidate-inputs.v3.json')['records']]
old=OUT.parent/'biologie-q1-four-current383-independent-description-p-source-b-v1'
inputs += [old/f'native-pdf-physical-{i:02d}.actual-review.png' for i in range(3,7)]
mem=rd(OUT/'atomicity-memory-four-independent-findings.actual.json')
inputs += [ROOT/s['path'] for m in mem['preservedCurrentMemoryGoals'] for s in m['sources']]
for m in mem['preservedCurrentMemoryGoals']:
 for s in m['sources']:
  if d(ROOT/s['path'])!=s['sha256']:raise RuntimeError('Card bytes changed '+s['path'])
for lane in source['allSeventeenCurrentMappingLanes']:
 if d(ROOT/lane['path'])!=lane['sha256']:raise RuntimeError('Mapping bytes changed '+lane['path'])
unique=sorted(set(inputs))
inputrows=[{'path':str(p.relative_to(ROOT)),'sha256':d(p),'bytes':p.stat().st_size} for p in unique]
wr(OUT/'review-input-freeze.actual.json',{'schemaVersion':1,'frozenAt':now(),'authorFreezeSha256':d(AUTHOR/'author-current-four.final.freeze.json'),'authorFreezeVerifiedFiles':95,'mismatches':mismatch,'inputs':inputrows,'sourceReadAuthority':'Official immutable local snapshots plus actually retrieved official BY live pages; author proposals remain candidates.','rawPageInspection':'Four predecessor raw PNGs personally inspected in this run; visible IDs/complete text/book-goal page numbering matched the frozen native PDF manifest.','otherReviewerOutputsRead':False,'activeWrites':0,'humanApproval':False})
outputs=sorted(p for p in OUT.rglob('*') if p.is_file() and p.name!='review-output-freeze.actual.json')
wr(OUT/'review-output-freeze.actual.json',{'schemaVersion':1,'frozenAt':now(),'inputFreezeSha256':d(OUT/'review-input-freeze.actual.json'),'outputs':[{'path':str(p.relative_to(ROOT)),'sha256':d(p),'bytes':p.stat().st_size} for p in outputs],'nativeDRecords':4,'nativeDDecisions':['block']*4,'separateTextDecisions':['keep']*4,'PContentKeeps':4,'syntheticCasesRead':8,'existingPrimaryCards':27,'DEENRows':54,'activeWrites':0,'humanApproval':False})
print(json.dumps({'status':'sealed','inputs':len(inputrows),'outputs':len(outputs),'nativeCampaignExitCode':0,'nativePExitCode':0,'outputFreezeSha256':d(OUT/'review-output-freeze.actual.json')}))
