#!/usr/bin/env python3
"""Seal own raw author candidates and actual technical run, without active writes."""
from pathlib import Path
from datetime import datetime, timezone
import json,hashlib

OWN=Path(__file__).resolve().parent;ROOT=OWN.parents[6];NOW=datetime.now(timezone.utc).isoformat()
def read(p):return json.loads(Path(p).read_text())
def binding(p):
    p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,d):(OWN/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def check(b):
    p=ROOT/b['path'];a=binding(p);assert a['sha256']==b['sha256'] and a['bytes']==b['bytes'],p;return a
entry=read(OWN/'entry.actual-inputs-and-prior-freezes.receipt.json')
native=read(OWN/'native-run.actual-current-inputs-and-protected-subjects.guard.json')
result=read(OWN/'native-current390-restoration.actual-result.author-v2.json')
records=read(OWN/'eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v2.json')
routing=read(OWN/'native-input-candidate-routing.author-v2.json')
selectors=read(OWN/'numeric-CSS-selector-correction.actual-resolution.receipt.json')
assert result['conditionalCounts']['publishedCurricularAtomicGoals']==390
assert result['protectedSourceAtlasChangedContexts']==[]
assert len(result['actualModels'])==4 and all(x['pages']==390 for x in result['actualModels'])
assert result['residualLostCountryGoalPairs']==189
assert not (OWN/'.native-shadow-inputs').exists()
bindings={}
for b in entry['inputBindings']+native['inputBindings']:bindings[b['path']]=check(b)
floor=binding(ROOT/'app/scripts/config/curriculum-maturity-floor-policy.json');bindings[floor['path']]=floor
floor_content=read(ROOT/floor['path'])
current=read(ROOT/entry['currentWholeCanonical']['path']);assert len(current['goals'])==472
byid={g['id']:g for g in current['goals']};ids={r['goalId'] for r in records['records']}
assert len(ids)==8 and all(byid[r['goalId']]==r['wholeCurrentGoalDEEN'] for r in records['records'])
eight_candidate=read(OWN/'current472-eight-only.author-v2.canonical.candidate.json')
assert all(g==byid[g['id']] for g in eight_candidate['goals'] if g['id'] not in ids)
assert all(g['requires']==byid[g['id']]['requires'] and g['contains']==byid[g['id']]['contains'] for g in eight_candidate['goals'])

obligations={
 '4f631f78-e13a-58e5-9092-f4db0b8d377a':'Hebb-Regel bleibt deklarierte Modellspezialisierung. Eine vorgegebene Regel muss an einem konkreten einfachen Netz angewendet und mit gegebenen Grenzfällen erklärt werden. Unterschied zu 347110a1, a46 und c9 benötigt Material und unabhängige Rollen-/D/P-/Atomaritätsentscheidung; kein amtliches einzelnes Hebb-Pflichtbullet.',
 '8b23f8fb-555d-5720-b5f2-dd6f28a0e786':'Ein gekoppelter gegebener Sinneszellfall trägt die Teilchenebene und die Anwendung auf ein sinnesphysiologisches Phänomen. 787 beschreibt Rezeptorpotenziale/Sinneszelltypen; 04d erklärt das axonale Aktionspotenzial und allgemeine Codierung. Beide ganzen Ziele bleiben erhalten. Das gegebene Modell liefert die benötigten Rezeptor-/Spike-Informationen; keine verdeckte Wiederprüfung sämtlicher 04d-Unterleistungen und keine neue 04d-requires-Kante. Vollständige BY-Augen-/Rhodopsin-/Retinal-/Hyperpolarisations-/Regenerations- und optische Phänomenpflichten bleiben offen; HE Q2.4 ist nur Kontext und keine Pflichtplatzierung dieses Kandidaten.',
 '97b24279-def0-5ce6-8726-a1cac9cd38ad':'Material muss tatsächliche postsynaptische Potenzialänderungen mehrerer gegebener Verschaltungen vergleichbar machen und eine begründete Ableitung der Notwendigkeit erregender/hemmender Synapsen ermöglichen. Deskriptives EPSP/IPSP-Ziel e1117126 bleibt eigenständig; allgemeine Topologie ersetzt diese Operatoren nicht.',
 '9b966664-906b-5a5d-8008-cae18de043aa':'Der Serotonin-Wiederaufnahmehemmer ist ein begrenztes mechanistisches Beispiel im multifaktoriellen Depressionsmodell. Symptome, Umgang mit Betroffenen, psychische/soziale Folgen und Therapieableitung der ganzen BY-Kompetenz bleiben offen. Kein Alzheimer-Ersatz und keine allgemeine neuropharmakologische Gesamtfreigabe.',
 'a46cafde-7359-5249-8754-19aaa3174ba4':'Gegebene Netzmodelle müssen bei gleichen Eingangssignalen unterschiedliche wirksame Verbindungen und dadurch veränderte Verarbeitung zeigen. Diese Autoroperationalisierung ist keine amtliche Einzelpflicht. Abgrenzung zum allgemeinen zellulären Lernen, zum Hebb-Regelanwenden und zur Befundinterpretation c9 sowie curriculare Rolle bleiben unabhängig zu entscheiden.',
 'c9a06264-cce2-54dd-9604-46dd5949f02e':'Gegebene Beschreibungen/Versuchsbefunde müssen langfristige Verstärkung oder Abschwächung synaptischer Wirksamkeit und Grenzen der Folgerung tragen. LTP/LTD sind deklarierte Modelle zellulärer Plastizität, keine wörtlich genannten eigenen Pflichtbullets. Experimentelle Inferenz und Rolle benötigen Material und unabhängige D/P-/Atomaritätsentscheidung.',
 'f6280154-d57c-599c-94bf-73313005a6df':'Der gegebene Stofffall ist jetzt explizit eine erregende Acetylcholin-führende Synapse in DE/EN und erhält die neuromuskuläre Anwendung. Der tatsächliche Einfluss muss aus dem Übertragungsmechanismus abgeleitet werden. Das unveränderte ff1-Prerequisite allein würde beliebige Stoffmodelle nicht ACh-spezifisch machen. Die ganzen HE-Kanal-/Synapsen-/Stoff-/neuromuskulären Pflichten bleiben offen.',
 'ff1bf88f-2413-5668-a071-ce9fc499cba3':'Chemische erregende ACh-Übertragung und ligand-/spannungsabhängige Kanäle sind HE-Komponenten; BY liefert den allgemeinen elektrochemischen Übertragungs-/Rezeptormechanismus. Elektrische Synapsen werden daraus nicht hergeleitet. Ganze HE-GK2-Stoff- und neuromuskuläre Pflichten bleiben separat erhalten.'
}
openrows=[]
for r in records['records']:
    openrows.append({'goalId':r['goalId'],'wholeCurrentTitle':r['fullCurrentTitle'],'candidateTitle':r['wholeCanonicalCandidateDEEN']['title'],'nextRequiredOperatorAndBoundary':obligations[r['goalId']],'wholeCurrentAndOriginalHOLD':True,'D_PAndSemanticReview':'candidate pending','formalIntegrationApproval':False})
write('remaining-whole-source-operator-and-model-role-obligations.author-v2.json',{'records':openrows,'sourceScopeReviewsA_BDoNotApproveNativeD_P':True,'NWWholeOriginalUF1BacterialViralAndIF7Hold':True,'oldTH19HH21AndHH22HH29Preserved':True,'noNewStrictClosures':True})

raw={
 'schemaVersion':1,'documentType':'inert author-v2 raw corrected eight whole current goals and conditional390 native routing input',
 'createdAtUTC':NOW,'currentCanonical':binding(ROOT/entry['currentWholeCanonical']['path']),
 'currentCanonicalNodes':472,'currentCurricularAtomicCount':390,
 'wholeCurrentAndCandidateDEENRecords':records['records'],
 'actualTwoTextCorrections':[{'goalId':r['goalId'],'currentDE':r['wholeCurrentGoalDEEN']['description'],'candidateDE':r['wholeCanonicalCandidateDEEN']['description'],'currentEN':r['wholeCurrentGoalDEEN']['descriptionEn'],'candidateEN':r['wholeCanonicalCandidateDEEN']['descriptionEn']} for r in records['records'] if r['goalId'].startswith(('8b23','f628'))],
 'priorSealedAuthorAndIndependentSourceA_BAndNativeRouting':entry['seals'],
 'newValidSelectorFiles':[binding(OWN/'BY13-EA-GA.all45.valid-selector.records.author-v2.json'),binding(OWN/'BY13-EA-GA.all21.valid-selector-identity-addendum.author-v2.json')],
 'actualSelectorResolutionReceipt':binding(OWN/'numeric-CSS-selector-correction.actual-resolution.receipt.json'),
 'sourceKindAwareRouting':routing,'newNWDurationPolicyCandidate':binding(ROOT/routing['NWDurationPolicyCandidatePath']),
 'nativeActualResult':result,
 'actualNativeModels':[binding(OWN/(r['name']+'.actual.book-model.json')) for r in result['actualModels']],
 'all390ActualPageDeltas':binding(OWN/'all-current390.actual-source-atlas-page-deltas.json'),
 'all22FullOrderedTargetsResidualHOLDs':binding(OWN/'all22-actual-ordered-targets-and-residual-whole-HOLDs.json'),
 'all74ActualProtectedWholePagesAndContexts':binding(OWN/'protected-current74.actual-full-page-and-source-context-checks.json'),
 'actualDirectWitnesses':binding(OWN/'new-direct-component-witnesses-and-NW-G9.actual.json'),
 'remainingObligations':openrows,
 'native390Meaning':'exact complete current target union and page/context reachability under a reversible conditional candidate. Official document/projection checks do not validate sourceKind, model-specialisation curricular role, whole-source coverage, D/P or semantic atomicity.',
 'NWPartialComponentsMeaning':'two already A/B-reviewed bacterial UF1 contributions; current protected whole targets unchanged; plasmid and DNA-copy tracing are canonical operationalisation, not literal NW required wording',
 'historicalSourceIdsMeaning':'old self-authored Q2.3.* are preserved historical goal labels, not official numbered bullets. HE original record IDs are prospective original-source migration IDs; no active extraction identities are rewritten.',
 'newFreshOfficialDownloads':0,'newRasterScienceViews':0,'newIndependentScienceApproval':False,
 'oldEightWholeCurrentOriginalHOLDsRetained':True,'threeModelSpecialisationsNotIndividuallyApprovedOfficialDuties':True,
 'candidateD_PReviewPending':True,'activeBindingsRestored':0,'newStrictCompletions':0,'strictNetGain':0,
 'activeWrites':False,'centralRuns':0,'globalPDFBuilds':0,'integrationApproved':False,'humanApproval':False,'humanTrial':False
}
write('eight-current-whole-goals-two-text-corrections-and-NW-G9-native-routing.raw-author-v2-review-input.json',raw)
write('native-final-command.actual.terminal.receipt.json',{'command':'app/node_modules/.bin/tsx '+str((OWN/'probe-current390-native-restoration.author-v2.mts').relative_to(ROOT)),'observedTerminalExitCode':0,'observedFinalRunElapsedSeconds':4.043134692,'actualResult':binding(OWN/'native-current390-restoration.actual-result.author-v2.json'),'twoEarlierOwnProbeFailuresRetained':True,'actualNativeModelsBuilt':4,'PDFRendererInvoked':False,'centralInvoked':False,'activeWrites':False})
write('final-current-and-historical-inputs.actual.guard.json',{'createdAtUTC':NOW,'status':'PASS','uniqueRehashedInputCount':len(bindings),'inputBindings':list(bindings.values()),'allHistoricalFrozenPayloadsExact':True,'allCurrentInputsExactToEntryAndActualNativeRun':True,'currentCanonicalNodes':472,'currentCurricularAtomicCount':390,'currentProtectedStrictCounts':{s['subject']:len(s['strictGoalIds']) for s in native['protectedSubjects']},'floorPolicyActualBinding':floor,'floorPolicyContentPreservedWithoutNewCentralRun':True,'all74ProtectedSourceAtlasAndFullCatalogueWholePagesExact':True,'allEightCurrentWholeGoalsExactToRaw':True,'all464OutsideEightCandidateWholeGoalsExact':True,'noActiveWrites':True,'noGitMutation':True})

readme='''# Neuro8 Author-v2: gezielte Korrektur und bedingte native Vorbereitung

## Erledigt

- **Textkandidat:** Sensorik 8b23 nennt Teilchenebene, den gekoppelten Reiz–Rezeptorpotenzial–Aktionspotenzialmuster-Fall und echte Anwendung auf einen gegebenen sinnesphysiologischen Fall. Die Schnittstellen zu den erhaltenen ganzen Zielen 787/04d sind ausdrücklich beschrieben. Neuropharm f628 ist in DE und EN explizit auf eine erregende Acetylcholin-führende Synapse qualifiziert.
- **Locators:** Alle 45 BY-Originalrecords und 21 Identitätsanker wurden mit `[id="313324"]` / `[id="314384"]` gegen die bytegenauen amtlichen HTMLs tatsächlich auf exakten Text aufgelöst. URL-Fragmente sind unverändert; eingebettete Kopien verwenden ebenfalls die korrigierten Selektoren.
- **NW-Teilquellen:** Zwei abgeschlossene unabhängige A/B-KEEPs werden exakt gebunden. Eigene getrennte Extraktions-/Mappingkandidaten und eine path-spezifische, zum bisherigen NW-G9-Beschluss identische Dauerpolicy-Zeile sind vorbereitet. Die tatsächlichen nativen Zeugen sind direkt und liegen unter DE-NW/SekI/G9 ohne Kursprofil. Die geschützten Bakterienziele bleiben ganz unverändert; Plasmid-/DNA-Modellteile werden nicht zu wörtlichen NW-Pflichten erklärt.
- **Native technische Ableitung:** Die aktuelle 472-Knoten-/390-Ziele-Basis wird verwendet. Produktions-SourceAtlas und BookModel wurden tatsächlich isoliert ausgeführt (letzter Lauf Exit 0), ohne PDF-Build. Baseline und bedingter Gesamtkandidat haben dieselben vollständigen 390 Ziel-IDs, 22 tatsächlich verglichene geordnete Landes-/Stufen-/Kursmengen und jeweils 390 Atlas-Seiten. Dazu wurden zwei vollständige 390-Seiten-Katalogmodelle erzeugt.

## Grenzen

Die NW-Ergänzung allein lässt die acht Neuro-Lücken bestehen: ihr originaler 390-Vertrag scheitert tatsächlich bei 382; dieser Lauf bleibt ausdrücklich eine Diagnose. Erst die **bedingten** acht neuen Routen stellen die aktuelle vollständige 390er-Zielmenge technisch dar. Sie umfassen fünf begrenzte Primärkompetenzen und drei deklarierte Modellspezialisierungen. Die Produktionsfunktion prüft amtlichen Dokumentbezug, Stufe und Kursmetadaten, aber **keine fachliche `sourceKind`-Freigabe**. Die 390er-Menge ist daher keine ganze Quellenfreigabe.

Hebb, gegebene Netzänderungen sowie LTP/LTD bleiben eigene Modellspezialisierungen; weder amtliche Einzelpflicht noch atomare curriculare Genehmigung ist behauptet. Ihre unterscheidbaren Materialleistungen und Rolle gegenüber dem allgemeinen zellulären Lernziel 347110a1 sind offen. Ebenso bleiben die ganzen BY-Sensorik-/Augen-/optischen Phänomen-, Depressions-/Umgang-/Therapie-, HE-GK2- und NW-IF7-/Viruspflichten erhalten. Alle acht aktuellen Ganzziele und ganzen Ursprungsquellen bleiben HOLD. Präzise nächste Operator-/Materialpflichten stehen im eigenen `remaining-whole-source-operator-and-model-role-obligations.author-v2.json`.

189 zuvor vorhandene Landes-/Zielpaare bleiben im normativen HOLD-Overlay verloren. Der neue Kandidat erhält die TH-19-/HH-21-Teilentscheidungen und die konkreten HH22-/HH29-Grenzen: keine direkte Drogen-Sinnesorgan-Wirkung und keine spezielle Kreislaufprävention daraus ableiten. Es gibt keine erfundenen Tier-/Atmungs-/Kreislauf-/Sinnesorgan-Teilansprüche.

Alle **74** aktuell strengen Bio-Ziele behalten ihre ganzen Kanonobjekte, vollständigen Katalogseiten und Atlas-Seitenkontexte exakt. Die 33 im früheren 382-Paket geänderten geschützten Kontexte wurden dort historisch nicht freigegeben; jetzt wurde ihre tatsächliche Gleichheit am vollständigen 390-Kandidaten erneut gemessen. Insgesamt 61 aktuelle Atlas-Seiten ändern sich; diese konkreten Seiten sind im Deltapaket enthalten. Chem127, Math807 und Phys478 werden mit den tatsächlichen aktuellen ganzen Zielobjekten und vorhandenen QS-Inputs geschützt. Die vorhandene Floorpolicy ist bytegenau gebunden; kein neuer Status-/Central-Lauf wird behauptet.

Der Achtziel-Textkandidat hält alle 464 übrigen ganzen Ziele, alle 472 IDs und alle Kanten exakt. Der zusätzliche native Neuro21-HOLD-Kontext verwendet darüber hinaus die 13 unverändert eingefrorenen alten Textkandidaten; dort sind alle 451 ganzen Ziele außerhalb Neuro21 exakt. Fingerprints werden ausschließlich im eigenen technischen Kandidaten nach der Produktionsfunktion aktualisiert; Klassifikationsentscheidungen werden nicht geändert. **D/P, Rollen, Atomarität und gezieltes Quellen-Followup bleiben Kandidatenprüfungen offen.** Keine aktive Kanon-/Config-/Reviewhistorie wurde geändert. Netto strenge Abschlüsse und aktive Bindungsrestaurationen: 0. Keine Human Approval oder Human Trial.

## Rohpaket und historische Erhaltung

Startpunkt für die nächste unabhängige Prüfung ist `eight-current-whole-goals-two-text-corrections-and-NW-G9-native-routing.raw-author-v2-review-input.json`. Es enthält ganze aktuelle und vorgeschlagene DE/EN-Ziele, die exakten beiden Vorentscheidungen, Quellenarten-/Scope-Routing, konkrete Modell-/Zeugen-/Seitenbefunde und offene Pflichten.

Author-v1, beide unabhängigen Quellenfreezes und der tatsächliche alte 382-Bericht bleiben bytegenau erhalten. Die V2-Quellenbasis übernimmt ihre tatsächlich amtlichen Originalbytes und ihre abgeschlossenen begrenzten Entscheidungen; V2 beansprucht keine neuen Downloads oder erneute unabhängige Science-Sichtprüfung. Zwei frühe eigene Probe-Annahmen (HTML als PDF-Snapshot; ein falscher eigener Pagefeldname) sind mit tatsächlich beobachteten Fehlerreceipts erhalten. Die Produktion wurde dafür nicht geändert.

`eight-missing-primary-scope-remediation-author-v2.final.freeze.json` versiegelt nur dieses neue Dossier. Es enthält keine Integration oder formale Quellen-/D/P-/Human-Freigabe.
'''
(OWN/'README.md').write_text(readme)
freeze_name='eight-missing-primary-scope-remediation-author-v2.final.freeze.json'
files=[]
for p in sorted(OWN.rglob('*')):
    if p.is_file() and p.name!=freeze_name:
        b=binding(p);b['path']=str(p.relative_to(OWN));files.append(b)
freeze={'schemaVersion':1,'freezeKind':'new inert Neuro8 author-v2 two-text/locator correction plus conditional390 native restoration','frozenAtUTC':NOW,'status':'RAW_CANDIDATES_AND_ACTUAL_CONDITIONAL_NATIVE_390_PREPARED_ALL_WHOLE_HOLDS_RETAINED','files':files,'payloadFiles':len(files),'currentCanonicalNodes':472,'currentCurricularAtomicCount':390,'correctedDEENGoals':2,'validBYOriginalSelectors':45,'validBYIdentityAddendumSelectors':21,'boundPriorIndependentSourceFreezes':entry['seals'][1:3],'NWBoundedComponents':2,'conditionalNativeDirectNeuroWitnesses':22,'conditionalNativeDirectNWG9Witnesses':2,'currentNativeFullGoalSetExact':True,'nativeModelsWith390Pages':4,'protectedStrictBio74WholeObjectsFullCatalogueAndAtlasContextsExact':True,'currentProtectedStrictCounts':{s['subject']:len(s['strictGoalIds']) for s in native['protectedSubjects']},'residualLostCountryGoalPairs':189,'allEightWholeHOLDsRetained':True,'threeModelSpecialisationCurricularRolesUnapproved':True,'compilerDoesNotValidateSourceKind':True,'D_PReview':'candidate pending','oldTH19HH21AndHH22HH29LimitsRetained':True,'historicalInputFreezesExact':True,'uniqueFinalInputBindings':len(bindings),'lastNativeCommandExitCode':0,'globalPDFBuilds':0,'centralRuns':0,'activeWrites':False,'gitMutation':False,'activeBindingsRestored':0,'newStrictCompletions':0,'strictNetGain':0,'wholeSourceGatePassed':False,'integrationApproved':False,'humanApproval':False,'humanTrial':False}
write(freeze_name,freeze)
for b in files:check({**b,'path':str((OWN/b['path']).relative_to(ROOT))})
print(json.dumps({'status':freeze['status'],'payloadFiles':len(files),'filesIncludingFreeze':len(files)+1,'uniqueRehashedInputs':len(bindings),'freeze':binding(OWN/freeze_name)},ensure_ascii=False))
