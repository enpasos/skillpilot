from pathlib import Path
import json,hashlib,datetime,subprocess,importlib.util,copy
HERE=Path(__file__).resolve().parent; ROOT=HERE.parents[6]
def digest(p):
 b=(ROOT/p).read_bytes()
 return {'path':p,'sha256':hashlib.sha256(b).hexdigest(),'wholeBytes':len(b)}
def canon(x): return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
inputs={}
for name in ['actual-before-four-assigned-GK-whole-intake.guard.json','actual-introduced-current-V13-P336-before-metadata-reconciliation.guard.json','actual-introduced-final-three-new-GK-materials-and-one-foreign-GK-tag-freeze.guard.json','actual-introduced-frozen-V5-bounded-price-and-two-core-scoring-deltas.guard.json']:
 g=json.loads((HERE/name).read_bytes())
 for r in g.get('inputs',g.get('originals',[])):
  current=digest(r['path']);assert current['sha256']==r['sha256']
  inputs[r['path']]={**current,'wholeGuardUnchanged':True,'actualIntroductionGuard':str((HERE/name).relative_to(ROOT))}
foreign_base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-five-additional-terminal-materials-independent-root-20261009-v1/'
foreign_receipt=foreign_base+'actual-independent-five-whole-terminal-material-source-rubric-and-machine-release.receipt.json'
foreign_whole=foreign_base+'whole-five-material-reviewed-machine-released.inert.candidate.json'
for p in [foreign_receipt,foreign_whole]:
 inputs[p]={**digest(p),'introducedAfterOriginalRead':True,'timing':'Foreign historical6a scientific closure and exact-object reuse read after current intake; not falsely guarded before initial science reading.'}
assert inputs[foreign_receipt]['sha256']=='bb5fc9f28fb38336070cc000fcd469cb54691126b3211baaf770f811d13a3128'
assert inputs[foreign_whole]['sha256']=='199cdadad18410bc32ed277b28b817518ec2224b9f6c284d8c404468e4069db5'
source='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/eight-current-national-GK-terminal-rests-material-author-v1/whole-seven-new-GK-DRAFTs-and-existing-account.two-core-scoring-and-exact-DE-inline-rubric-current-author-successor-v5.json'
x=json.loads((ROOT/source).read_bytes())
assert digest(source)['sha256']=='5f93216e7e2ba0d8e5c42e7910454a8084e1770994694ac0cf175022761747f5'
selected=x['materials'][4:7]
released=copy.deepcopy(selected)
for g in released: assert g['examData']['reviewStatus']=='draft';g['examData']['reviewStatus']='released'
for a,b in zip(selected,released):
 c=copy.deepcopy(b);c['examData']['reviewStatus']='draft';assert a==c
rel=HERE/'whole-three-GK-materials-independently-KEEP.only-machine-material-status-released.inert.json'
assert not rel.exists();rel.write_text(json.dumps(released,ensure_ascii=False,indent=2)+'\n')
six=x['materials'][7]
old=next(g for g in json.loads((ROOT/foreign_whole).read_bytes()) if g['id']==six['id'])
assert old==six
six_file=HERE/'whole-existing-sixA-foreign-GK-tag-only-independently-KEEP.inert.json'
assert not six_file.exists();six_file.write_text(json.dumps(six,ensure_ascii=False,indent=2)+'\n')
rows=[]
rationales={
 '5838c453-ab65-5338-bca4-16e588f98fba':'Ganzer fremder bilingualer digitaler Assessmentvertrag tatsächlich unabhängig gelesen. Vorgegebene grenzüberschreitende Funktionen/Länderfälle samt fallbezogenem Abhängigkeits-/Backuptransfer, benotete Aufgaben und24/15-Rubrik:practiceAssessment. V5-Preis-/Bewertungsbefunde gezielt geschlossen; keine neue gewöhnliche Kompetenz.',
 '8f603e75-a3da-5ec5-94ba-d3c51c7f1906':'Ganzer fremder bilingualer Nachfrage-/Qualifikationsmodellvertrag tatsächlich unabhängig gelesen. Vorgegebene Modelle, konditionale Anwendung/Annahmenkritik und bedingte Entscheidung mit24/15:practiceAssessment. ModelleV2/V5 ganz exakt, keine Source/P-Wissenschaft neugestartet.',
 'fa2d07bc-684d-5ee4-8878-20416fdb72d7':'Ganzer fremder bilingualer Kaufrechtsvertrag tatsächlich unabhängig gelesen. Gewöhnliche/digitale normgebundene Fälle, Gegenfälle und26/16-Rubrik:practiceAssessment. V5 schützt den aktuellen digitalen Kern vor vollständig falschem Durchkommen; kein neues curriculares Atom.'
}
for g in selected: rows.append({'goalId':g['id'],'wholeAuthorGoalSHA256':canon(g),'wholeReviewedReleasedGoalSHA256':canon(next(v for v in released if v['id']==g['id'])),'qualifiedSemanticKind':'practiceAssessment','decision':'KEEP_kind_only','reviewer':'/root/economics_independent_continuation_a','reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reason':rationales[g['id']],'kindDoesNotReplaceMaterialOrAtomicityReview':True})
k=HERE/'actual-three-whole-foreign-GK-assessment-practice-kind-only-independent-decisions.json';assert not k.exists();k.write_text(json.dumps({'role':'three actual independent whole practiceAssessment kind judgments; no new kind judgment of originally own6a','currentCandidate':digest(source),'rows':rows,'humanReview':'pending','noNewOrdinaryGoals':True},ensure_ascii=False,indent=2)+'\n')
index=HERE/'actual-final-portable-whole-inputs-and-reviewed-output-index.json'
payload={'role':'actual committable repo-relative input and whole output index for independent GK4 review','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'historicalScientificInputsRetained':True,'reviewedCurrentCandidate':digest(source),'wholeInputFiles':list(inputs.values()),'outputs':{ 'threeMachineReleased':digest(str(rel.relative_to(ROOT))),'existingSixAGKTagOnly':digest(str(six_file.relative_to(ROOT))),'threePracticeKinds':digest(str(k.relative_to(ROOT)))} ,'externalOfficialRawTextOrPDFInputCopiesCommitted':False,'primarySources':'actual-independent-primary-reads-and-fictional-model-source-boundaries.json','newMaterialScienceKEEP':3,'existingForeignMaterialScienceReusedExact':1,'actualGKReuseDeltaKEEP':1,'ordinaryPCaseScienceRestarted':0,'strictGain':0}
assert not index.exists();index.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'inputIndex':digest(str(index.relative_to(ROOT))),'outputs':payload['outputs'],'originalGuardedInputs':11,'foreignHistoricalInputsIntroducedAfterInitialRead':2,'newMaterialScienceKEEP':3,'existingForeignScienceReused':1,'GKTagKEEP':1,'strictGain':0},ensure_ascii=False,indent=2))

