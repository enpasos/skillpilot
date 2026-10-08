import json,hashlib
from pathlib import Path
from datetime import datetime,timezone
root=Path('/home/enpasos/projects/skillpilot')
q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
author=q/'biologie-he9-nineteen-targeted-alternatives-and-materials-author-root-v2'
firstauthor=q/'biologie-he9-nineteen-current391-science-author-root-v1'
first=q/'biologie-he9-nineteen-science-first-independent-b-20261008-v1'
own=q/'biologie-he9-targeted-four-profile-science-independent-b-20261008-v2'
changed=[1,2,4,7]
now=datetime.now(timezone.utc).isoformat()
def read(p):return json.loads((root/p).read_text())
def rows(p):return [json.loads(x) for x in (root/p).read_text().splitlines()]
def digest(p):
 b=(root/p).read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,obj):
 p=root/own/name;assert not p.exists(),str(p);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
f=author/'targeted-OR-materials-and-whole42-author-input.first.freeze.json';freeze=read(f)
assert digest(f)['sha256']=='acde2680025a779d3b1800f978c1430893ac92538d35233a8916d07d9d372d6d'
for x in freeze['frozenFiles']:assert digest(Path(x['path']))==x,x['path']
firstseal=first/'independent-b.completed-he9-nineteen-science-first.exact-input-output.first.freeze.json'
assert digest(firstseal)['sha256']=='6d2af8f0b191bd858f0bcaaf4a332077bc98df218415a68bbf960fc1c9114659'
# Check the immutable own first outputs before carrying their unchanged science.
for x in read(firstseal)['outputs']:assert digest(Path(x['path']))==x,x['path']
entry=read(author/'neutral-targeted-four-profile-and-materials-science-review.entry.json')
for k in ['current19GoalBodies','operativeCandidates','operativeConfig','operativeNativeP19','whole19cases42']:assert digest(Path(entry[k]['path']))==entry[k]
goals=read(Path(entry['current19GoalBodies']['path']))['goals']
live={g['id']:g for g in read(Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'))['goals']}
for g in goals:assert live[g['id']]==g
candidate=read(Path(entry['operativeCandidates']['path']))['goals'];oldcandidate=read(firstauthor/'P19.current-text-preimage.author.candidates.json')['goals']
newrows=rows(Path(entry['operativeNativeP19']['path']));oldrows=rows(first/'P19.current-text-independent-b.review.jsonl')
cases=read(Path(entry['whole19cases42']['path']))['goals'];oldcases=read(firstauthor/'nineteen-whole-goals-thirty-eight-complete-DEEN-cases.author.json')['goals']
assert len(candidate)==len(newrows)==len(cases)==len(goals)==19
oldcasebyid={c['id']:c for g in oldcases for c in g['cases']};newcasebyid={c['id']:c for g in cases for c in g['cases']}
assert len(oldcasebyid)==38 and len(newcasebyid)==42
changedcases=[k for k,c in oldcasebyid.items() if newcasebyid[k]!=c]
assert changedcases==['he9-19-04-case-2','he9-19-07-case-2'],changedcases
newcaseids=[k for k in newcasebyid if k not in oldcasebyid]
assert len(newcaseids)==4 and all('-ear-case-' in k for k in newcaseids)
assert oldcasebyid['he9-19-07-case-2']['modelAnswer']==newcasebyid['he9-19-07-case-2']['modelAnswer']
profilechanges=[];bindings=[]
for i,(g,p,a,c,r,oldr) in enumerate(zip(goals,candidate,oldcandidate,cases,newrows,oldrows),1):
 assert g['id']==p['goalId']==a['goalId']==c['goalId']==r['goalId']==oldr['goalId']
 assert p['profile']==r['profile']
 if p['profile']!=a['profile']:profilechanges.append(i)
 else:assert r['profile']==oldr['profile'] and r['profileFingerprint']==oldr['profileFingerprint']
 assert r['goalFingerprint']==oldr['goalFingerprint'] and r['reviewInputFingerprint']==oldr['reviewInputFingerprint']
 briefbyid={x['id']:x for x in p['profile']['applicationCaseBriefs']}
 assert set(briefbyid)=={x['id'] for x in c['cases']}
 for cc in c['cases']:
  brief=briefbyid[cc['id']]
  for lang,cap in [('de','De'),('en','En')]:
   assert brief['taskDemand'+cap]==cc['material'][lang]+' '+cc['task'][lang]
   assert brief['expectedPerformance'+cap]==cc['modelAnswer'][lang]
 bindings.append({'ordinal':i,'goalId':g['id'],'wholeGoalRetainedExact':True,'profileChanged':i in changed,'profileFingerprint':r['profileFingerprint'],'goalFingerprint':r['goalFingerprint'],'reviewInputFingerprint':r['reviewInputFingerprint'],'completeCurrentCaseIds':[cc['id'] for cc in c['cases']],'allMaterialTaskModelDuplicatesExact':True})
assert profilechanges==changed,profilechanges
for i in [0,1]:
 p=candidate[i]['profile'];coverage=p['coverageExpectations']
 ids=[x['id'] for x in p['expectations']]
 assert coverage['requiredExpectationIds']==[ids[0]]
 assert coverage['alternativeExpectationGroups']==[[ids[1],ids[2]]]
 assert coverage['minimumIndependentDemonstrations']==2 and coverage['freshVariationRequired'] and coverage['independentTransferRequired']
write('exact-current42-materials-four-profiles-and-retained15-bindings.actual.json',{'verifiedAt':now,'authorFreeze':digest(f),'exactAuthorInputs':freeze['frozenFiles'],'inputFiles25':25,'ownFirstSeal':digest(firstseal),'ownFirstOutputsVerified':len(read(firstseal)['outputs']),'whole19GoalBodiesExact':True,'changedProfileOrdinals':profilechanges,'unchanged15ProfileBodiesAndFingerprintsExact':True,'wholeCurrentCaseCount':42,'exactRetainedOldCases':36,'retainedEyeCases1and2':4,'newConditionalEarCases':newcaseids,'modifiedOldCases':changedcases,'leukocyteCaseModelAnswerExactUnchanged':True,'all42MaterialsTasksModelsExactNativeBriefDuplicates':True,'normativeOR':'one shared required expectation plus one alternative group [whole-eye-path,whole-ear-path]; no both-organ requirement','bindings':bindings,'newUnchanged15ScienceDecisions':0,'peerAV2OutputsRead':False,'finalDandV':'pending actual final raster/native input','rootReportedSeparateGoal12AtomicityHold':'retained open; not reviewed or resolved in this targeted4 review','activeWrites':0,'humanApproval':False})
notes={
1:('KEEP','Die gemeinsame Erwartung beschreibt räumliche Modellzuordnung; genau eine ganze Augen- oder Ohrweg-Erwartung erfüllt die alternative Gruppe. Die vier ursprünglichen Augenfälle über Ziele1/2 bleiben unverändert. Neue Ohrfälle1 benennen Außenohr, Grenze Trommelfell, Mittelohr-Knöchelchen und Innenohr-Schnecke/Nerv; Bogengänge sind dem Gleichgewicht zugeordnet. Gedrehte Fehlbeschriftung prüft dieselbe räumliche Kompetenz als Transfer.','Kein Zusatzwahltest oder gemeinsamer Pflichtweg Auge UND Ohr. Eine Augenabbildung beweist keine Ohrleistung. Quelle und Fälle bleiben vereinfachter Grundbau, nicht vollständige Anatomie aller Zellschichten.'),
2:('KEEP','Das gemeinsame Modellverständnis unterscheidet mechanischen/optischen Reizweg, Umwandlung und neuronale Weiterleitung. Der vollständige Ohrweg erklärt Trommelfell/Knöchelchen/Schneckenfluid/Haarzellumwandlung/Nerv/Gehirn. Im zweiten Ohrfall wird mangelhafte Übertragung von fehlender Umwandlung trotz ankommender Schwingung unterschieden; weder mechanische Schwingung allein noch Luftschall im Nerv wird als Wahrnehmung ausgegeben. Ganze Augen- und Ohrleistungen stehen als echte normative Alternativen nebeneinander.','Vier neue Ohrfälle über Ziele1/2 sind ausschließlich konditional. Beide vorhandenen Variationen sind Evidenzangebote des gewählten Wegs, keine Aufforderung zu zusätzlichen Aufgaben nach ausreichend nachgewiesener Meisterschaft. Kein klinischer Patientenbefund oder vollständige Pflichtdeckung aller Nachbarinhalte wie Knochenleitung behauptet.'),
4:('KEEP','Der25kHz-Vergleich legt ausdrücklich gleichen äußeren Schalldruckpegel am Ohr fest und verneint daraus gleiche subjektive Lautheit. Das beseitigt eine Vermischung von physikalischer Exposition und Wahrnehmung. Das Modell bleibt ein bestimmter Hund gegenüber modelliertem Menschen, ohne allgemein besseres Gehör oder subjektives Erleben aller Tiere zu behaupten. UV/Bienenfall unverändert und fachlich aus eigenem Erstseal retained.','Alter, Individuum und zusätzliche Sinnesbedingungen sind nicht vollständig repräsentiert; gleiche physikalische Exposition ist kein universeller Artvergleich. Keine echten Versuchsdaten.'),
7:('KEEP','In A sind fehlende Leukozyten jetzt in DE und EN ausdrücklich im Material gegeben. Die unveränderte Modellantwort folgert daraus korrekt eingeschränkte zelluläre Abwehr, zusätzlich zu fehlendem Thrombozytenpfropf/Fibrin. Plasma mit Erythrozyten ermöglicht modellierten Hämoglobintransport; B ohne Erythrozyten hat trotz Gerinnungs-/Abwehrbeiträgen keine normale Sauerstofftransportkapazität. Der eigene enge Material-HOLD des Erstseals ist für diese korrigierte Fassung aufgelöst.','Keine pauschale Abwesenheit jeder gelösten Immunfunktion des Plasmas behauptet, kein Transfusionsversuch oder Behandlungsrat. Das ursprüngliche erste HOLD-Urteil bleibt unverändert historisch versiegelt.')}
verdicts=[];targetrows=[];combined=[]
for i,(r,oldr) in enumerate(zip(newrows,oldrows),1):
 if i not in changed:combined.append(oldr);continue
 decision,obs,limit=notes[i]
 verdicts.append({'ordinal':i,'goalId':r['goalId'],'targetedWholeProfileVerdict':decision,'actualWholeChangedProfileRead':True,'newOrChangedCompleteDEENCasesRead':[x['id'] for x in cases[i-1]['cases']],'concreteScientificObservationDe':obs,'scopeAndLimitsDe':limit,'bilingualParity':True,'currentExactBinding':bindings[i-1],'evidenceAuthority':'Own synthetic E1/G1; no learner data','finalDOrVVerdict':'pending; no judgment manufactured','humanApproval':False})
 row=dict(r);row['reviewId']='biologie-he9-targeted-four-profile-science-independent-b-20261008-v2';row['reviewedAt']=now;row['reviewer']='OpenAI Codex independent B targeted whole4 science recheck; no peer A V2 outputs read'
 row['reason']='KEEP gezieltes unabhängiges Science-first-V2-Urteil: '+obs+' '+limit
 row['dissent']=r['dissent']+['Eigenes gezieltes B-V2-Ersturteil nur für Ord1/2/4/7;15 unveränderte Fachurteile aus eigenem Erstseal retained. Separater offener Atomicity/SPLIT_REVIEW-Befund Ziel12 bleibt unaufgelöst. Finale tatsächliche Raster/native D/V weiterhin pending; keine19 Gesamtfreigabe.']
 assert row['profile']==r['profile'];targetrows.append(row);combined.append(row)
write('four-whole-profile-science-first-verdicts.independent-b.v2.first.json',{'reviewedAt':now,'scopeOrdinals':changed,'verdicts':verdicts,'targetedKeep':4,'targetedHold':0,'ownOriginalMaterialHold7ResolvedForChangedVersion':True,'rootReportedGoal12AtomicityHoldRetainedOpen':True,'whole19CompletionClaim':False,'peerAV2OutputsRead':False,'targetedV2JudgmentsDiscussedBeforeSeal':False,'finalDandVStillPending':True,'activeWrites':0,'humanApproval':False})
for name,data in [('P4.targeted-current-text-independent-b.review.jsonl',targetrows),('P19.retained15-plus-four-targeted-current-text-independent-b.review.jsonl',combined)]:
 p=root/own/name;assert not p.exists();p.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in data))
config=read(Path(entry['operativeConfig']['path']));config['reviewId']=targetrows[0]['reviewId'];config['reviewPath']=str(own/'P4.targeted-current-text-independent-b.review.jsonl');config['scope']['goalIds']=[x['goalId'] for x in targetrows];config['scope']['label']='Targeted independent B science-only current P1/P2/P4/P7, whole42 bindings and unchanged15 retained; goal12 open, finalD/V pending'
write('P4.targeted-current-text-independent-b.config.json',config)
write('actual-primary-source-targeted-rereading.independent-b.json',{'readAt':now,'officialHEG9PDF':{'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf','sha256':'93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1','wholePhysicalPagesReread':[23,24,25],'fullTextRedistributed':False},'additionalInstitutionalFactPageOpened':'https://www.nidcd.nih.gov/health/how-do-we-hear','selectedReadTopic':'Sound mechanical transmission through ear canal/eardrum/ossicles/cochlea, hair-cell transduction and auditory nerve signals to brain; primary whole HE eye-or-ear scope independently reread','whole42ScientificContinuity':'36 exact unchanged cases scientifically retained from own whole38 first review, both modified fullDEEN materials/tasks/models and all4 newly added fullDEEN ear cases directly reviewed here; all4 whole profile bodies read here. No fresh science judgments for unchanged15.'})
print(json.dumps({'authorInputFiles25':25,'wholeCases42':42,'retainedExactCases36':36,'newEar4':4,'changedCases2':2,'wholeProfilesReviewed4':4,'targetedKEEP4':4,'rootGoal12AtomicityHoldOpen':True,'activeWrites':0}))
