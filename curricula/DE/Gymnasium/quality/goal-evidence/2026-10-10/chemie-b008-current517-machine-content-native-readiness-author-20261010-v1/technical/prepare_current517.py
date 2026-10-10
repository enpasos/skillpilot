# SPDX-License-Identifier: Apache-2.0
"""Additive original-author metadata candidate; no independent current review."""
from pathlib import Path
import copy, datetime, hashlib, json, shutil

R=Path(__file__).resolve().parents[8]
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
P=B/'chemie-b008-current517-machine-content-native-readiness-author-20261010-v1'
O=B/'chemie-b008-current-P25-protected12-source24-inactive-integration-technical-20261010-v1'
S=B/'chemie-b008-five-assessments-sc01-sum-gate-author-successor-20261010-v1'
C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule'
assert not (R/P/'author-current517.final.freeze.json').exists()
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def cp(src,dst):
 f=R/P/dst;f.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/src,f)
whole=S/'candidate/whole517.inactive.SC01-five-assessment-author-successor.json'
assert ref(whole)['sha256']=='sha256:d5e824d5c22765060cfd145f34bfe04fa1c092ed264a98d186ea692ecb1cb913'
before=read(whole);after=copy.deepcopy(before)
common='Dieser inaktive Endstand trägt `released` ausschließlich als maschinelle Inhaltsfreigabe nach unabhängiger fachlicher A-/B-Prüfung einschließlich A01/SC01. Menschliche Prüfung, reale Leistungsbeurteilung im Coach-Host und operative Aktivierung bleiben offen; Quellen- und Kurs-HOLDs werden dadurch nicht freigegeben.'
replacements={
 'Dieser Entwurf bleibt `needs_review` und ist nicht freigegeben.':common,
 'Dieser Autorenentwurf ist nicht freigegeben und behauptet keinerlei bereits beobachtete Schülerleistung.':'Die maschinelle Inhaltsfreigabe behauptet keinerlei bereits beobachtete Schülerleistung; menschliche Prüfung und echte Beurteilung im Coach-Host bleiben offen.',
 'Der Entwurf bleibt `needs_review`; die praktische Belegprüfung im späteren operativen Ablauf ist gesondert zu prüfen.':'Der Inhaltsstatus `released` bezeichnet nur die maschinelle fachliche Prüfung. Menschliche Prüfung und die praktische Belegprüfung im echten Coach-Host bleiben offen.',
 'Dieses Portfolio ist ein Autorenentwurf, keine bereits freigegebene Prüfung.':'Dieses inaktive Portfolio ist ausschließlich maschinell inhaltlich geprüft; menschliche Prüfung und echte Coach-Host-Beurteilung bleiben offen.',
 'Der spätere operative Umgang mit solchen Belegen ist noch zu prüfen; `needs_review` wird nicht zu `released` umgedeutet.':'Der operative Umgang mit solchen Belegen im echten Coach-Host und die menschliche Prüfung bleiben offen; `released` bezeichnet ausschließlich maschinelle Inhaltsfreigabe.',
 'Der Entwurf bleibt `needs_review`; Quellentreue, Platzierung und spätere Beurteilungsregeln sind gesondert zu prüfen.':'`released` bezeichnet ausschließlich maschinelle Inhaltsfreigabe. Menschliche Prüfung, konkrete operative Platzierung und echte Coach-Host-Beurteilung bleiben offen; Quellen- und Kursgrenzen bleiben getrennt.',
 'Der Entwurf ist deshalb nicht auswählbar oder freigegeben; er ist kein C12/13-Ersatz und kein nachträglicher Kursnachweis.':'Die Prüfung bleibt deshalb für eine kursbezogene P-Auswahl gesperrt; die ausschließlich maschinelle Inhaltsfreigabe ist kein C12/13-Ersatz und kein nachträglicher Quellen- oder Kursnachweis.',
 'Der Entwurf bleibt `needs_review` und `courseScope=HOLD_UNSPECIFIED_C11`.':'Die ausschließlich maschinelle Inhaltsfreigabe `released` lässt `courseScope=HOLD_UNSPECIFIED_C11` und P-Nichtauswahl unverändert; menschliche Prüfung und echte Coach-Host-Beurteilung bleiben offen.'
}
changed=[];replacementProof=[]
for old,g in zip(before['goals'],after['goals']):
 if str(S) not in g.get('examData',{}).get('sourceArtifactPath',''):continue
 e=g['examData'];artifact=Path(e['sourceArtifactPath']).name
 for field in ['taskContent','solutionContent']:
  text=e[field];hits=[]
  for source,target in replacements.items():
   count=text.count(source)
   if count:text=text.replace(source,target);hits.append({'before':source,'after':target,'count':count})
  assert hits and 'needs_review' not in text
  e[field]=text
  name=artifact if field=='taskContent' else artifact.replace('.task.','.solution.')
  # Only existing publication headers plus exact changed whole content.
  original=(R/S/'author/assessments'/name).read_text()
  oldbody=old['examData'][field];assert original.endswith(oldbody+'\n') or original.endswith(oldbody)
  header=original[:original.index(oldbody)]
  f=R/P/'author/assessments'/name;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(header+text+'\n')
  replacementProof.append({'goalId':g['id'],'field':field,'exactReplacements':hits,'allOtherBytesReversibleExact':text==oldbody if not hits else all(source not in text for source in [x['before'] for x in hits])})
 e['reviewStatus']='released'
 e['reviewNote']='Machine-content released candidate after genuine independent A/B scientific reviews of all five whole assessments, A01 and SC01. Current final metadata and current native D/P contexts require separate independent verification before activation. Human review, trial and actual coach-host assessment remain open. C11 source/course HOLD and P exclusion remain binding.'
 e['sourceArtifactPath']=str(P/'author/assessments'/artifact)
 g['extendedData']['assessmentEvidenceRequirements']['status']='Machine content reviewed A/B; rubric-faithful actual evidence grading required; human review and actual coach-host assessment open'
 g['extendedData']['localPlacementStatus']='Inactive AUTHOR final metadata and native context candidate; independent current context verification before activation pending'
 g['extendedData']['provenance']['authorRole']='Original AUTHOR final machine-content candidate; inactive; no independent approval'
 assert e['scoring']==old['examData']['scoring']
 assert g['extendedData'].get('courseScopeHold')==old['extendedData'].get('courseScopeHold')
 changed.append(g['id'])
assert len(changed)==5
assert sum(a==b for a,b in zip(before['goals'],after['goals']))==512
put('candidate/whole517.inactive.machine-content-final-author.json',after)
put('author/five-exact-metadata-text-replacements-and-preservation.json',{'schemaVersion':1,'role':'Original author final machine-content metadata candidate; no independent final approval','changedWholeGoalIds':changed,'allOther512WholeGoalsExact':True,'allFiveWholeScoringRubricsExact':True,'materialDataExact':True,'replacementRows':replacementProof,'C11CourseHoldExact':True,'PSelected':False,'humanApproval':False,'activeGain':0})
subject=read(O/'registry/chemie-subject.future-active.inactive.json')
put('registry/chemie-subject.prior-reviewed-selection.inactive.json',subject)
put('registry/chemie-only-current517-normal-check.inactive.config.json',{**read(O/'registry/chemie-only-normal-check.config.json'),'reportId':'chemie-b008-current517-final-author-inactive-readiness-20261010-v1','subjects':[subject]})
cfg=read(O/'native/current398-whole-all205-P-normal-model.config.json');cfg['bookId']='chemie-b008-current517-final-author-native';cfg['outputPath']=str(P/'native/current398-whole-P205-normal-model.actual.json')
put('native/current398-whole-P205-normal-model.config.json',cfg)
atlas=read(O/'source-atlas/bounded378-normal-isolated.inputs.json');out=str(P/'source-atlas/generated-actual')
atlas.update(outputDirectory=out+'/source-views',manifestPath=out+'/source-manifest.json',navigationViewPath=out+'/navigation.view.json')
put('source-atlas/current517-bounded378-normal.inputs.json',atlas)
inputs=[whole,S/'SC01-author-successor.final.entry.json',S/'SC01-author-successor.final.freeze.json',O/'neutral-current-P25-protected12-source24-inactive-integration.entry.json',O/'FINAL.inactive-normal-P25-protected12-source24-route-HOLD.technical.freeze.json',O/'candidate/current511-semantic-kinds.future-active.json',O/'native/current398-whole-all205-P-normal-model.actual.json',O/'native/current398-whole-all205-P-normal-model.config.json',O/'checks/actual205-inactive-exact-protected180-and-new25-ID-sets.json',O/'source-atlas/bounded378-normal-isolated.inputs.json',O/'registry/chemie-subject.future-active.inactive.json',B/'chemie-b008-five-terminal-assessments-independent-a-20261010-v1/FIRST.independent-full-assessment-science-and-route-findings.actual.json',B/'chemie-b008-five-terminal-independent-b-substantive-review-20261010-v1/FIRST.five-whole-assessments-and-fourteen-kinds.actual-independent-b.json',B/'chemie-b008-five-terminal-a01-sc01-targeted-independent-a-20261010-v1/independent-a-targeted.final.entry.json',B/'chemie-b008-five-terminal-a01-sc01-targeted-independent-a-20261010-v1/checks/normal-current-fourteen-semantic-recommendation-bindings.actual.json',B/'chemie-b008-five-terminal-independent-b-substantive-review-20261010-v1/FIRST.current-A01-SC01.targeted-independent-B.json',Path('docs/qa-ci/math-antiderivative-exam-candidate-review-2026-09-28.md'),Path('docs/landscape-runtime.schema.json')]
inputs += [Path(p) for p in cfg['evidenceReviewPaths']]
inputs += [Path(p) for p in atlas['mappingPaths']+atlas['fallbackViewPaths']]
inputs += [Path(p) for p in subject['positiveEvidenceConfigPaths']+subject['semanticAtomicityConfigPaths']+subject['resolutionIndexPaths']]
inputs += [Path(subject['memoryReviewConfigPath'])]
inputs=list(dict.fromkeys(inputs));put('inputs/exact-original-input-bindings.json',{'schemaVersion':1,'role':'Portable repo-relative byte-exact inputs; external sealed history retained','inputs':[ref(p) for p in inputs]})
protected=['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json']
put('inputs/protected-live-paths.before.json',{'bindings':[ref(Path(p)) for p in protected]})
# Conventional active paths exist ONLY in this explicitly owned isolated capsule.
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
shutil.copyfile(R/P/'candidate/whole517.inactive.machine-content-final-author.json',C/protected[0])
shutil.copyfile(R/O/'candidate/current-QA.after-normal-generation.future-active.json',C/protected[2])
print(json.dumps({'newPackage':str(P),'wholeGoals':len(after['goals']),'changedMetadataGoals':changed,'other512Exact':True,'activeWrites':0},ensure_ascii=False))
