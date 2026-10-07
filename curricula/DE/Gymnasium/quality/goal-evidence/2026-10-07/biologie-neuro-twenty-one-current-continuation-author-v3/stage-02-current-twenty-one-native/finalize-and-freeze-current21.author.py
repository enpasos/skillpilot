#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import json, hashlib
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path('/home/enpasos/projects/skillpilot');OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix();BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06';SRC=BASE/'biologie-neuro-eight-missing-primary-scope-remediation-author-v2';OLD=BASE/'biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2';OVER=BASE/'biologie-neuro-th-hh-forty-reviewed-components-native-overlay-preparation-v1';FIRST=OWN.parent/'stage-01-three-model-materials'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':p.relative_to(ROOT).as_posix(),'sha256':'sha256:'+sha(p),'bytes':p.stat().st_size}
def write(n,x):(OWN/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
inputs={}
def add(p):
 assert p.is_file(),p
 if not p.is_relative_to(OWN):inputs[p.relative_to(ROOT).as_posix()]=bind(p)
 return bind(p)
for r in read(OWN/'actual-native-current-inputs.author-guard.json')['inputBindings']:
 p=ROOT/r['path'];assert sha(p)==r['sha256'].removeprefix('sha256:'),p;add(p)
assert sha(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')=='244d2889ddeeb69cbf97d0a320f3e38cf5444674f3bb17f3e46c0112ac6fbff1'
assert sha(FIRST/'three-distinct-model-materials.stage-01.author-v3.final.freeze.json')=='7bde1e4ec2b53a2eec293616792746a77714038aab2b1dbc560faed71d1d2e2a'
ff=read(FIRST/'three-distinct-model-materials.stage-01.author-v3.final.freeze.json')
for r in ff['files']:
 p=FIRST/r['path'];assert sha(p)==r['sha256'][7:];add(p)
add(FIRST/'three-distinct-model-materials.stage-01.author-v3.final.freeze.json')
sf=SRC/'eight-missing-primary-scope-remediation-author-v2.final.freeze.json';assert sha(sf)=='f6524feee0001b213f4575ee45d8627f5bac0b7e6b0db10d993f7a885082045a';add(sf)
for r in read(sf)['files']:
 p=SRC/r['path'];assert sha(p)==r['sha256'][7:];add(p)
for p in [OLD/'positive-evidence.author-v2.candidates.json',OLD/'positive-evidence.author-v2.actual.candidate.jsonl',OLD/'author-profiles.data.json',OLD/'semantic-atomicity.author-v2.actual.review.jsonl',OLD/'semantic-atomicity.author-v2.config.json',OLD/'memory.author-v2.actual.review.jsonl',OLD/'memory.author-v2.config.json',OLD/'independent-review.actual.thirteen-and-eight-scope.json',OLD/'author-neurobiology21-source-p-v2.final.freeze.json',OLD/'author-neurobiology21-source-p-v2.with-exact-rp-raw-source.final.freeze.json',OVER/'effective-original-neuro21-source-overrides.json']:
 add(p)
overrides={r['originalPath']:r['effectiveCandidatePath'] for r in read(OVER/'effective-original-neuro21-source-overrides.json')}
routes=read(SRC/'native-input-candidate-routing.author-v2.json')
for r in routes['entries']:overrides[r['plannedExtractionPath']]=r['candidateExtractionPath']
receipt=read(SRC/'conditional-current390-restoration.source-atlas.actual.receipt.json');expected={r['path']:r for r in receipt['inputBindings']};scope=read(OWN/'current21-thirteen-plus-eight-reuse-and-real-boundaries.author.json');selected=set(scope['selected21Ids']);resolved=[]
for s in receipt['scopes']:
 for w in s['witnesses']:
  if w['goalId'] not in selected:continue
  row={'goalId':w['goalId'],'scopeKey':s['key'],'actualWitness':w,'exactEffectiveBindings':[],'wholeSourceApproval':False}
  for name in ['sourceExtractionPath','mappingPath']:
   planned=w[name];actual=overrides.get(planned,planned);p=ROOT/actual;bound=add(p)
   if planned in expected:assert bound['sha256']==expected[planned]['sha256'],(planned,actual,bound['sha256'],expected[planned]['sha256'])
   row['exactEffectiveBindings'].append({'field':name,'plannedPath':planned,'actualFrozenEffectivePath':actual,'binding':bound,'effectiveBytesMatchFrozenNativeReceipt':planned in expected})
   if name=='sourceExtractionPath':
    extraction=read(p);goalrows=extraction.get('sourceGoals',extraction.get('goals',[]));matches=[g for g in goalrows if g.get('id',g.get('sourceGoalId'))==w['sourceGoalId']]
    assert len(matches)==1,(actual,w['sourceGoalId']);row['wholeActualBoundSourceGoal']=matches[0]
    doc=extraction.get('sourceDocument',{});row['wholeActualSourceDocument']=doc
    dp=doc.get('path');
    if dp and (ROOT/dp).is_file():row['actualRetainedDocumentBinding']=add(ROOT/dp)
  resolved.append(row)
write('all21-selected-actual-frozen-source-witness-effective-file-bindings.author.json',{'role':'exact effective raw-source path resolution, not new source or national science review','records':resolved,'selectedGoalIds':scope['selected21Ids'],'allOriginalWholeSourceAndScopeHOLDsPreserved':True,'actualCurrentCandidateFieldSourceRefNamesBoundSeparately':True,'compilerSourceKindNotScienceProof':True})
for p in sorted((ROOT/'app/scripts').glob('*.ts')):add(p)
for folder in ['contracts/goal-description-review/v1','contracts/goal-description-review/v2','contracts/goal-description-review/v3','contracts/goal-evidence/v1','contracts/goal-evidence/v2','contracts/goal-book/v1','contracts/goal-book/v2']:
 d=ROOT/folder
 if d.exists():
  for p in sorted(d.glob('*.json')):add(p)
for rel in ['AGENTS.md','LICENSING.md','docs/concept/skill-graph/atomic-goal-visualizations.md','app/package.json','curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md','curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md','curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md']:
 add(ROOT/rel)
for p in sorted((ROOT/'curricula/DE/Gymnasium/memory-decks/biologie').glob('*.json')):add(p)
for p in sorted((ROOT/'app/public/data').glob('*biology*flashcards*.json')):add(p)
logs=['build-current21-native','bind-current21-final-native','native-prepare-twenty','native-check-twenty','native-prepare-one','native-check-one','native-positive-check-current21','native-atomicity-author-proposal','native-atomicity-author-proposal-check','native-memory-author-proposal','native-memory-author-proposal-check']
for name in logs:assert (OWN/(name+'.actual.stderr.txt')).read_text()=='',name
write('honest-preparation-discovery-and-layout-limitations.author.json',{'role':'author preparation history','failedFilenameDiscovery':[{'query':'createGoalBook.ts / goalBookBuild.ts / goalBookReviewBundle.ts','actualResult':'No such files; actual production loader is goalBookModel.ts, bundle builder exportGoalBookReviewBundle.ts'},{'query':'description-review-config.json under round-a','actualResult':'No such file; actual prepared campaign/input filenames used'},{'query':'Source8 *.ts','actualResult':'No such matching files; actual probe has .mts extension'}],'CLIValidatorFailuresInThisStage':[],'firstStageActualMissingLabelErrorsRemainInSealedFirstStage':True,'actualPDFRasterPersonallySeen':['qa-artifacts/a46-native-physical5.author-layout.png'],'actualRasterReadScope':'author layout of a46 physical5 only; not all-page independent D/V review','sourceRefPrintedByNativeRenderer':False,'missing21VisualizationsVisibleAsOrdinaryPlaceholders':True,'noFullAppOrHumanAcceptance':True})
raw=read(OWN/'final-current21-whole-native-source-context-material-review-inputs.author.raw.json');raw['exactActualSourceWitnessEffectiveFileBindings']=bind(OWN/'all21-selected-actual-frozen-source-witness-effective-file-bindings.author.json');write('final-current21-whole-native-source-context-material-review-inputs.author.raw.json',raw)
route=read(OWN/'final-current21-neutral-review-routing.author.json');route['exactSourceWitnessFileBindings']=REL+'/all21-selected-actual-frozen-source-witness-effective-file-bindings.author.json';route['sourceAReviewerMustNotReadNewSourceBRoleVerdicts']=True;write('final-current21-neutral-review-routing.author.json',route)
write('external-current-and-frozen-input-bindings.author.json',list(inputs.values()))
files=[]
for p in sorted(OWN.rglob('*')):
 assert not p.is_symlink(),p
 if p.is_file():files.append({'path':p.relative_to(OWN).as_posix(),'sha256':'sha256:'+sha(p),'bytes':p.stat().st_size})
freeze={'schemaVersion':1,'freezeKind':'inert actual current BioNeuro21 author whole native D20+D1/P21/materials and A-M-V routing; independent science pending','frozenAtUTC':datetime.now(timezone.utc).isoformat(),'role':'Codex direct author; not independent review','status':'CURRENT21_NATIVE_D20_D1_AND_P21_PREPARED_WITH_42_REFERENCE_CASES_AND_ALL_HOLDS','files':files,'fileCount':len(files),'inputBindings':list(inputs.values()),'externalInputCount':len(inputs),'wholeCanonicalBasisSHA256':'244d2889ddeeb69cbf97d0a320f3e38cf5444674f3bb17f3e46c0112ac6fbff1','whole472IdsAndEdgesExact':True,'other451WholeGoalsExact':True,'protected74WholeGoalPageDContextExact':True,'nativeDStages':[20,1],'positiveCandidates':21,'materials':42,'priorInnerPositiveProfilesExact':13,'priorWholeCaseBriefsExact':26,'firstStageThreeModelProfilesSixCasesExact':True,'realSourceFPChanges':21,'realWholePageChanges':18,'outsideScopeChangedContextGoalIds':['9499943f-89b7-54e3-9fe2-e90404beaa4a'],'general347WholeSourceMetadataDeltaExplicit':True,'all21VisualizationsMissing':True,'independentScienceApprovals':0,'wholeSourceAtlasApproval':False,'strictNetGain':0,'activeWrites':False,'humanApproval':False,'humanTrial':False,'actualLearnerEvidence':False}
for row in inputs.values():assert sha(ROOT/row['path'])==row['sha256'][7:],row['path']
f=OWN/'current21-whole-native-description-positive-materials-and-AMV-routing.author-v3.final.freeze.json';write(f.name,freeze)
for p in OWN.rglob('*'):
 if p.is_file():p.chmod(0o444)
for p in sorted([p for p in OWN.rglob('*') if p.is_dir()],key=lambda p:len(p.parts),reverse=True):p.chmod(0o555)
OWN.chmod(0o555)
print(json.dumps({'freeze':f.relative_to(ROOT).as_posix(),'sha256':sha(f),'files':len(files),'inputs':len(inputs),'sourceWitnessesResolved':len(resolved),'nativeD':[20,1],'nativeP':21,'cases':42,'sciencePending':True,'all21VStillMissing':True,'strictNetGain':0}))
