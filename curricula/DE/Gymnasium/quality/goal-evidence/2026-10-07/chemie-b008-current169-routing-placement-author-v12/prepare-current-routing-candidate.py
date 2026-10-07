# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from copy import deepcopy
from collections import defaultdict
from datetime import datetime,timezone
import hashlib,json,subprocess
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent; assert not (OWN/'author.final.freeze.json').exists()
V11=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b008-twenty-six-native-source-preparation-author-v11'
ORIGIN=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3'
CANON=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
REPORT=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-current3-and-portability-commit-checkpoint-root-20261007-v1/stable-current-five-gate-report-repaired.actual.report.json'
def read(p):return json.loads(p.read_text())
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
v11freeze=read(V11/'native-source-preparation-author-v11.final.freeze.json')
for row in v11freeze['files']:
 p=ROOT/row['path']; assert bind(p)==row,row['path']
lineage=read(V11/'actual-primary-reading-material-review-lineage-and-national-holds.json');verified=[]
for row in lineage['exactImmutableReviewAndAuthorLineage']:
 p=ROOT/row['freezeBinding']['path'];assert bind(p)==row['freezeBinding'];d=read(p); verified.append({'role':row['role'],'freeze':bind(p),'frozenFileCount':len(d.get('files',d.get('payloads',[])))})
original=read(CANON); oldBy={g['id']:g for g in original['goals']};candidate=deepcopy(original);by={g['id']:g for g in candidate['goals']}
binder=read(V11/'twenty-six-native-uuid-and-current-v10-material-profile-binders.author-candidate.json');ids=binder['routineGoalIds'];guard=read(V11/'current378-protected112-and-nine-family-structure-input-guard.actual.json');v11candidate=read(V11/'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json');v11by={g['id']:g for g in v11candidate['goals']}
protected=next(s for s in read(REPORT)['subjects']if s['subject']=='chemie')['strictCompleteGoalIds'];assert len(protected)==169
changes=[]
def change(gid,field,value,reason):
 g=by[gid];before=deepcopy(g[field]);assert before!=value,(gid,field)
 g[field]=deepcopy(value);changes.append({'goalId':gid,'field':field,'before':before,'after':deepcopy(value),'reasonDe':reason,'requiresFreshProtectedBindings':gid in protected,'authorProposalOnly':True})
for gid in guard['originalFamilyGoalIds']:
 old=oldBy[gid];new=v11by[gid]
 # Copy only exact previously reviewed split/text/route fields; metadata and current asset history stay from current canonical.
 for field in ['title','titleEn','description','descriptionEn','type','contains','requires','weight']:
  if old[field]!=new[field]:change(gid,field,new[field],'Unveränderte versiegelte v7/v11-Fachprodukte bzw. deklariertes Sammelatom-zu-Cluster-Splitting; keine erneute fachliche Prüfung.')
for gid in guard['new24AtomicUUIDs']:
 assert gid not in by;g=deepcopy(v11by[gid]);candidate['goals'].append(g);by[gid]=g
assert len(candidate['goals'])==503
# Move the nine process families out of the SekI-labelled wrapper; retain the wrapper's inherited laboratory prerequisites for its five unchanged other goals.
wrapper='2da7abbb-7ade-5acc-b7b1-1d98d7334352';rootId='442c31c5-c561-5c7a-90bb-2335d779175c';families=guard['originalFamilyGoalIds']
change(wrapper,'contains',[gid for gid in by[wrapper]['contains']if gid not in families],'Die neun stufenübergreifenden Prozessfamilien werden unter der gemeinsamen Chemiewurzel platziert; die fünf unveränderten bisherigen SekI-Inhaltsziele behalten ihren ganzen alten Wrapper und seine tatsächlichen Laborvoraussetzungen.')
change(wrapper,'weight',len(by[wrapper]['contains']),'Wrappergewicht entspricht seinen fünf verbleibenden Inhaltszielen.')
rootChildren=by[rootId]['contains'];position=rootChildren.index(wrapper)+1
change(rootId,'contains',rootChildren[:position]+families+rootChildren[position:],'Eindeutiger kanonischer enthält-Pfad für die stufenübergreifenden Prozessfamilien; keine neuen Struktur-UUIDs, keine pauschalen Laborvoraussetzungen.')
# Only direct content consumers are narrowed. The actual capstone remains a declared semantic hold.
consumerChoices={
'e313c1ee-a617-54ed-adea-c183da1e03d8':{'49b13b33-34b7-5e4e-861c-b21082cb9922':['data-validity']},
'c0f1bf09-5a70-5006-b1e9-e91f786a63bf':{'b3c9c4b8-5575-5200-86cf-26c14ebcc3d8':[]},
'a0e8f0f2-24e2-5945-a511-597d32e73796':{'b6327e98-8ab9-5d7f-b826-4023bc1a56a7':['sek1-source-information']},
'8b98d8ba-65c6-58d7-92f0-45f4b2456573':{'b6327e98-8ab9-5d7f-b826-4023bc1a56a7':['upper-source-information','upper-source-criticism']},
'3c9bfa10-9a13-50cc-96c8-6213e28d6c54':{'b6327e98-8ab9-5d7f-b826-4023bc1a56a7':['upper-source-information','upper-source-criticism']},
'9fa7d857-451a-5c1b-b6f4-d4ff97d7f39f':{'b6327e98-8ab9-5d7f-b826-4023bc1a56a7':['sek1-source-information']},
'8fe39739-2938-5e2c-8db2-08572b44569a':{'91238ba1-5c63-50c7-a4fd-9bbe492c6b61':['lower-guided-hypothesis-investigation']},
'47582f06-d724-5da9-acc6-16c91ab94f67':{'b3c9c4b8-5575-5200-86cf-26c14ebcc3d8':[]},
'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528':{'b6327e98-8ab9-5d7f-b826-4023bc1a56a7':['sek1-source-information']},
'96d3f50b-62f7-5db4-8426-43b4a0c26543':{'91238ba1-5c63-50c7-a4fd-9bbe492c6b61':['lower-independently-planned-hypothesis-investigation']},
'e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f':{'49b13b33-34b7-5e4e-861c-b21082cb9922':['data-validity']},
'ba621c67-b750-5e45-ab37-a51ea45e3ccf':{'49b13b33-34b7-5e4e-861c-b21082cb9922':['data-validity']},
'e96771d3-fd72-59e6-8f4c-573ef8cbde0a':{'b3c9c4b8-5575-5200-86cf-26c14ebcc3d8':['criteria-decision']},
'188bd684-e894-5753-8a50-798220b04d97':{'b3c9c4b8-5575-5200-86cf-26c14ebcc3d8':['chemical-applications-society']},
'cf2631d9-da24-50e8-9e50-db625e6efaad':{'91238ba1-5c63-50c7-a4fd-9bbe492c6b61':['lower-guided-hypothesis-investigation']},
'fb41c82c-12c3-5f9a-9e8d-40f10c9fade9':{'49b13b33-34b7-5e4e-861c-b21082cb9922':['data-documentation','chemical-representation-transformation'],'91238ba1-5c63-50c7-a4fd-9bbe492c6b61':[]},
'cfa5c1e4-6714-5be7-9a57-a24b201b6231':{'49b13b33-34b7-5e4e-861c-b21082cb9922':['data-documentation','data-validity']},
'62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2':{'542822de-cb96-56cf-a487-0fc3b5820f57':[]},
}
reasons={
'cf2631d9-da24-50e8-9e50-db625e6efaad':'Fachgerechtes, sicheres Durchführen vorgegebener Untersuchungs- und Präparationsverfahren benötigt die angeleitete sichere Untersuchungsroutine neben den erhaltenen konkreten Labor- und Fachvoraussetzungen; selbstständige Hypothesen- und Planungsprodukte werden nicht universell vorausgesetzt.',
'fb41c82c-12c3-5f9a-9e8d-40f10c9fade9':'Vorliegende Untersuchungsergebnisse sach- und adressatengerecht darstellen benötigt nachvollziehbare Dokumentation und fachlich korrekten Darstellungswechsel; eigene theoriegeleitete Hypothesenbildung, Experimente und alle Datenauswertungsprodukte sind kein universeller Vorlauf.',
'cfa5c1e4-6714-5be7-9a57-a24b201b6231':'Analytische Verfahren und quantitative/qualitative Befunde benötigen zuverlässige, dokumentierte Daten; der ausdrückliche Theorie-Hypothesenbezug des Oberstufen-Datensplits gilt nicht pauschal für jede vorgegebene Analyse.',
'62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2':'Den Stoffweg von Rohstoffgewinnung bis Verwendung fachlich darstellen braucht die erhaltene Reaktions-/Stoffgrundlage; alle gesellschaftlichen Bewertungs- und Berufsentscheidungsprodukte sind kein universeller Vorlauf.',
'e313c1ee-a617-54ed-adea-c183da1e03d8':'Die Zuverlässigkeitsbeurteilung von Messdaten benötigt Daten-Aussagekraft; eigene theoriegeleitete Hypothesengenerierung oder alle quantitativen Oberstufenmethoden werden damit nicht universell verlangt.',
'c0f1bf09-5a70-5006-b1e9-e91f786a63bf':'Das fachliche Beschreiben von Stoffkreisläufen benötigt die unveränderten Reaktions-/Vorgangsziele; gesellschaftliche Einflüsse auf Wissensentwicklung sind kein universeller Bestandteil dieser Beschreibung.',
'a0e8f0f2-24e2-5945-a511-597d32e73796':'Die Recherche im Rohstoffziel verlangt grundlegendes quellenbezogenes Erschließen; Präsentation, Berufsorientierung und alle sechs Quellen-/Medienprodukte werden nicht gemeinsam vorausgesetzt.',
'8b98d8ba-65c6-58d7-92f0-45f4b2456573':'Urheberschaft, Vertrauenswürdigkeit sowie Quellen-/Zitatkennzeichnung bleiben konkret über kritisches Prüfen und selbstständiges quellenbelegtes Erschließen gebunden.',
'3c9bfa10-9a13-50cc-96c8-6213e28d6c54':'Recherche mit ausdrücklicher Quellenkritik und Quellen-/Zitatkennzeichnung verlangt die zwei passenden Quellenroutinen; andere kommunikative Produkte sind keine universelle Voraussetzung.',
}
for gid, replacements in consumerChoices.items():
 oldReq=by[gid]['requires'];assert all(r in oldReq for r in replacements)
 newReq=[]
 for r in oldReq:newReq.extend([ids[key]for key in replacements[r]]if r in replacements else [r])
 newReq=list(dict.fromkeys(newReq));change(gid,'requires',newReq,reasons.get(gid,'Direkte Voraussetzung auf die tatsächlich benötigte einzelne Daten-, Quellen-, Experimentier- oder Bewertungsroutine begrenzen; die anderen Produkte des bisherigen Sammelatoms sind keine universelle Mindestvoraussetzung.'))
# Keep all 26 four bilingual semantic text fields exactly to v7/v11, even when metadata/routing changes elsewhere.
for key,gid in ids.items():
 for field in ['title','titleEn','description','descriptionEn']:assert by[gid][field]==v11by[gid][field]
assert all(by[gid]==oldBy[gid]for gid in oldBy if gid not in {r['goalId']for r in changes})
write(OWN/'candidate/canonical.current503-source-routing.author-candidate.json',candidate)
write(OWN/'current169-protected-guard-and-field-intents.author.json',{'role':'Current field-scoped inactive author routing candidate; protected changes remain pending genuine affected revalidation','createdAtUTC':datetime.now(timezone.utc).isoformat(),'currentActiveCanonical':bind(CANON),'currentStrictReport':bind(REPORT),'protectedCurrentGoalIds':protected,'strictCurrentCount':169,'currentCurricularAtomic':378,'candidateWholeGoals':503,'candidateCurricularAtomic':395,'new24AtomicIds':guard['new24AtomicUUIDs'],'convertedSevenClusterIds':guard['convertedClusterGoalIds'],'originalNineFamilies':families,'routineGoalIds':ids,'changes':changes,'changedProtectedWholeGoalIds':[gid for gid in protected if by[gid]!=oldBy[gid]],'allOtherExistingWholeObjectsExact':True,'all26SemanticTextsExactPrior':True,'all52MaterialBodiesUnchanged':True,'oldSourceStatusesUnchanged':True,'currentFiveProtectedDirectConsumers':[gid for gid in consumerChoices if gid in protected],'unchangedSafetyGoalId':'13d4f336-ab16-54a7-9479-c920b458f385','oldFiveOtherWrapperGoalsPreserveWholeObjectsAndWrapperLabPrerequisites':True,'wrapperLaborPrerequisitesNotInheritedByNew26':True,'historicalV11Freeze':bind(V11/'native-source-preparation-author-v11.final.freeze.json'),'verifiedHistoricalLineage':verified,'strictGain':0,'activeWrites':0,'humanApproval':False,'independentApproval':False})
# Durable exact current model inputs; older materials are referenced rather than copied.
for source,name in [(CANON,'active-current479.json.bin'),(ROOT/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','active-kind-current479.json.bin'),(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','active-qa-current.json.bin'),(REPORT,'active-strict169.report.json.bin')]:
 p=OWN/'inputs'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(source.read_bytes())
write(OWN/'unchanged-material-and-review-lineage.entry.json',{'role':'Exact historical scientific work referenced, never represented as own current independent review','v11Binder':bind(V11/'twenty-six-native-uuid-and-current-v10-material-profile-binders.author-candidate.json'),'v11SourceComponents':bind(V11/'twenty-six-partial-source-components-and-original-national-holds.author-candidate.json'),'lineage':verified,'historicalMaterialBodiesCopiedOrRewritten':False,'historicalTextBodiesCopiedOrRewritten':False,'nativeCurrentDAndPStillPending':True,'noImagesGenerated':True,'strictGain':0})
print(json.dumps({'candidateWholeGoals':503,'candidateCurricularAtomic':395,'new24':24,'guardedExistingGoalChanges':len({r['goalId']for r in changes}),'protectedWholeGoalChanges':[gid for gid in protected if by[gid]!=oldBy[gid]],'currentProtected':169,'lineageFreezesVerified':len(verified),'strictGain':0}))
