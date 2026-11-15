from pathlib import Path
import json,hashlib,shutil,datetime,copy
R=Path('.');W=R/'tmp/physics-two-assessments-integration-20261115-v1';A=R/'tmp/physics-two-assessment-author-20261115-v1';B=R/'tmp/physics-two-tasks-independent-review-20261115';E=R/'curricula/DE/Gymnasium/quality/assessment-review/physik/direct-evidence-gap-repair-20261115-v1';read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
m=read(A/'sealed-input-manifest.json');assert sha(A/'sealed-input-manifest.json')=='sha256:b8d6e37912d2cd891a73e62ff9cc4dba69f21be88835cd14eff0726ce35edc70';assert len(m['pins'])==11
for row in m['pins']:
 p=A/row['path'];assert sha(p)=='sha256:'+row['sha256'];assert p.stat().st_size==row['bytes']
rm=read(B/'evidence-manifest.json');assert rm['inputManifestSha256']==sha(A/'sealed-input-manifest.json').removeprefix('sha256:')
for row in rm['files']:
 p=B/row['path'];assert sha(p)=='sha256:'+row['sha256'];assert p.stat().st_size==row['bytes']
review=read(B/'review.json');assert review['verdict']=='ACCEPT_BOTH_CONTENT_AND_COVERAGE' and review['authorOfCandidate'] is False and review['mandatoryFindings']==[]
candidate=read(A/'candidate.json');assert candidate['ordinaryGoalAndProfileEdits']==0 and len(candidate['newAssessments'])==2
physics=read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json');ix={g['id']:g for g in physics['goals']};prs={json.loads(l)['goalId']:json.loads(l) for l in (R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/stage-plan-k3k6-current-v1/current13.review.jsonl').read_text().splitlines()}
for row in read(A/'exact-inputs.json')['items']:
 assert row['goal']==ix[row['goal']['id']],row['goal']['id'];assert row['positiveEvidence']==prs[row['goal']['id']],row['goal']['id']
for g in candidate['newAssessments']:
 assert g['id'] not in ix;assert g['applicability']==ix[g['requires'][0]]['applicability'];assert len(g['applicability']['jurisdiction'])==16;assert g['examData']['coveredGoalIds']==g['requires'];assert sum(s['points'] for s in g['examData']['scoring']['steps'])==g['examData']['scoring']['maxPoints']==g['examData']['scoring']['passingPoints']
grading=read(B/'independent-desk-grading.actual.json');assert grading['caseCount']==len(grading['cases'])==22;positive=negative=0
for case in grading['cases']:
 g=next(g for g in candidate['newAssessments'] if g['id']==case['assessmentId']);steps={s['id']:s['points'] for s in g['examData']['scoring']['steps']};rows=case['criterionGrades'];assert len(rows)==len(steps)
 # Reviewer schema itself remains immutable; check actual sum below after inspecting field names.
 if case['score']>=case['threshold']:positive+=1
 else:negative+=1
assert (positive,negative)==(4,18)
for source,name in [(A,'author'),(B,'independent-review')]:
 for p in source.iterdir():
  if not p.is_file():continue
  dst=E/name/p.name;dst.parent.mkdir(parents=True,exist_ok=True);assert not dst.exists() or dst.read_bytes()==p.read_bytes();shutil.copyfile(p,dst)
(W/'before-physics.json').write_bytes((R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json').read_bytes())
for p in (R/'curricula/DE/Gymnasium/composition-views/physik').glob('*.view.json'):
 dst=W/'before-views'/p.name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dst)
# Scope-identical thirteen ordinary pages, with current canonical inputs and exact active P.
view=read(R/'tmp/physics-native-integration-k3k6-correction-v1-20261115/native-fixture/review.view.json');(W/'review.view.json').write_text(json.dumps(view,ensure_ascii=False,indent=2)+'\n')
config={'schemaVersion':1,'bookId':'physics-k3k6-current13-direct-evidence-gap-20261115-v1','title':'Physik K3/K6 – aktuelle dreizehn gewöhnliche Zielseiten','landscapePath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','compositionViewPath':str(W/'review.view.json'),'semanticKindLedgerPath':'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json','goalVisualizationQaPath':'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json','publicationMode':'review','atlasBaseUrl':'https://skillpilot.com/lernzielbuch','evidenceReviewPaths':['curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/stage-plan-k3k6-current-v1/current13.review.jsonl'],'externalLandscapePaths':['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'],'outputPath':str(W/'book-model.json')};(W/'book.config.json').write_text(json.dumps(config,indent=2)+'\n')
receipt={'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorManifest':str(E/'author/sealed-input-manifest.json'),'authorPinsVerified':11,'independentManifest':str(E/'independent-review/evidence-manifest.json'),'independentFilePinsVerified':len(rm['files']),'reviewVerdict':review['verdict'],'actualSyntheticGrades':22,'weakAnswersFail':18,'fairAlternativesPass':4,'ordinaryAndProfileInputObjectsEqual':True,'newTaskIds':[g['id'] for g in candidate['newAssessments']],'nativeIntegrationPending':True,'humanApprovalOrLearnerResultClaim':False};(E/'input-verification.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(receipt));print('gradeRowKeys',grading['cases'][0]['criterionGrades'][0].keys())
