import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path('/mnt/e/skillpilot-chemie-L7-20261017/two-BW-and-coordinate-priors-independent-a-v1')
BASE=Path('/mnt/e/skillpilot-chemie-L7-20261017/two-BW-data-teachers-and-coordinate-model-priors-author-root-v1')
INPUT=BASE/'REVIEW-INPUT.clean-two-BW-data-targets-and-coordinate-prior-replacement.json'
D=json.loads(INPUT.read_text())
E=json.loads((OUT/'EXAMINATION.independent-a.json').read_text())

def pin(p):
    p=Path(p)
    if not p.is_absolute():p=ROOT/p
    with p.open('rb') as f:sha=hashlib.file_digest(f,'sha256').hexdigest()
    return {'path':str(p),'sha256':sha,'bytes':p.stat().st_size}

pins=[pin(BASE/'SELECTOR.clean-content-for-two-other-reviewers.json'),pin(INPUT)]
assert pins[0]['sha256']=='7ad785992bcb5d914e855b854d46dcd4443dc768ca293138142c00ba1457a481'
assert pins[1]['sha256']=='80aa31d251c4bb540cd27b27f1172543dedbf7df934f5c76eb94422421205bc5'
for x in [D['baseCanonical'],D['baseWhole39Views'],D['foreignInput'],D['materialSource']]+D['originalProfileBodySourcePins']:
    p=pin(x['path']);assert p['sha256']==x['sha256'];assert p['bytes']==x['bytes'];pins.append(p)
unique={x['path']:x for x in pins};pins=list(unique.values())

sources=[]
source_findings={
 'DE-BW':'BW physisch11/gedruckt9 fordert qualitative/quantitative Experimente samt Protokollierung und Auswertung, Vergleiche und Prüfung der Gültigkeit von Regeln; 12/10 fordert Darstellung von Informationen in Tabellen/Diagrammen und Dokumentation der Arbeit. Auf 10/8 werden Basis-/Leistungsfach unterschieden, 35/33 gehört zu Leistungsfach3.4.3 und fordert wirkliche Titration sowie konduktometrische Messung. 42/40 nennt Komplexverbindungen nur beispielhaft als weitere ausgewählte Stoffgruppe. Die ganzen R1/R2/D2-/Zucker-/Leitfähigkeitsfälle sind deshalb eigene konkretisierte Erwerbsangebote, keine exakte amtliche Vollabdeckung und keine behauptete Auswahl oder Ausführung.',
 'DE-RP':'RP57 kennzeichnet9.1 ausdrücklich als P und ausschließlich Leistungsfach: Zentralteilchen als Elektronenpaarakzeptor, Ligand als Paargeber und koordinative Bindung. Die amtliche Kernanforderung fordert hier keine vorherige gesamte EPA-Winkelprüfung oder ausgeführte Aldehyd-/Ketonvergleichsanalyse. RP58 kennzeichnet9.2 als W und bindet den dortigen Theorievergleich an behandelte8.7; das bereitgestellte qualitative Orbitalfragment belegt keine Wahl oder vollständige Absolvierung dieser Bausteine. 36 weist Komplexometrie als Vertiefung/Verzahnung,29 den Wahlpool aus. Die Fehling-/Tartrat-Operationalisierung bleibt eine erklärte eigene Ausgestaltung.'
}
for s in D['wholeRelevantPrimarySourcesAndPages']:
    pp=pin(s['originalPDF']['path']);assert pp['sha256']==s['originalPDF']['sha256'];pins.append(pp)
    sources.append({'jurisdiction':s['jurisdiction'],'officialURL':s['officialURL'],'actualPDF':pp,
                    'physicalPagesRead':[x['physicalPDFPage'] for x in s['wholeRelevantPrimaryPages']],
                    'allTenPagesOwnLayoutExtractionEqualsPinnedCleanText':True,
                    'sourceReadProvenance':'Own first-hand readings in this session reused only after exact source pins were verified; fresh visual readings noted separately.',
                    'freshVisualPages':[11,12] if s['jurisdiction']=='DE-BW' else [57,58],
                    'ownScientificSourceBoundaryDe':source_findings[s['jurisdiction']]})

DOC='9fc800d1-92d1-5ef6-81c1-33960ae034dd'
INTERP='7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6'
COORD='363c5740-8a3c-50b8-8c3a-5548c80c36ea'
BOND='448815cc-4127-54b7-96bf-e54b3d2a38c5'
REDOX='04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162'
ANGLE='9b56d01e-c2d7-51d8-b78e-237592c1ed20'
ASSAY='973c12d9-d863-5292-8c68-9c80cdacf9e2'
cases=[
 {'case':'BW-LK-ordinary-documentation','goalId':DOC,'viewId':'de-bw-gym-chemistry-lk','decision':'KEEP',
  'ownReasonDe':'Der ganze vorhandene Erwerb verlangt ein eigenes prüfbares Dokumentationsprodukt mit Rohwerten, Größen/Einheiten, Herkunft, Bedingungen und erkennbaren Fehlstellen. R1 und die neue separate R2-Notiz erfordern konkrete Proben-/Ereigniszuordnung statt eines abgeschriebenen Mustertexts. D2 verlangt die sichtbare Trennung gemessener Absorbanz, Kalibration, verdünnter Probe und berechneter Originalkonzentration sowie eine nachvollziehbare Korrekturhistorie. Diese Leistungen sind vor der Beurteilung von Messbedingungen und Tragweite fachlich tragend, weil sonst nicht feststeht, auf welche unveränderten Daten, Proben und Bedingungen sich ein Urteil bezieht.',
  'wholeTaskCoverageDe':'R1 bewahrt W1/W2/H1/H2 mit92/88/47/50s und20,0/20,5/40,0/39,5°C. R2 dokumentiert ausschließlich das neue W3-Ereignis vom07.10.2026,10:15 mitN/TH1/0,1°C-Anzeige/20,3°C; fehlende Auflösezeit, Masse und Rührbedingungen bleiben fehlend. Anzeigeauflösung ist keine belegte Messunsicherheit. D2 ergibt aus unveränderter Absorbanz0,290 und Steigung0,080 L/mg zunächst3,50mg/L verdünnt, bei Faktor2 ursprüngliche7,00mg/L und nach belegter Korrektur auf Faktor4 ursprüngliche14,00mg/L. Alte Rechnung bleibt nachvollziehbar, keine Rohabsorbanz wird geändert.',
  'sourceBoundaryDe':'Eigene BW-LK-Erwerbsgrundlage mit allgemeinem amtlichem Prozesskontext. Kein exakter Vollquellenkredit für diese vollständigen eigenen Fälle, keine individuelle EDTA-/Forschungsthemenwahl und keine echte neue Messung.'},
 {'case':'BW-LK-ordinary-interpretation','goalId':INTERP,'viewId':'de-bw-gym-chemistry-lk','decision':'KEEP',
  'ownReasonDe':'Der ganze vorhandene Erwerb verknüpft eine eigene geeignete Tabelle/Grafik mit einer begründeten Hypothesenaussage und deren Grenzen. Er unterscheidet Trendbeschreibung von Kausal-/Reichweitenbehauptung. Dies ist eine konkrete Voraussetzung der nachfolgenden Datenvaliditätsroutine: Ohne begründete Beziehung zwischen Daten und Hypothese kann deren Angemessenheit und Tragweite nicht beurteilt werden. Der Dokumentationsplatz bleibt eigener Vorgänger und wird nicht durch Interpretation ersetzt.',
  'wholeTaskCoverageDe':'Die Temperaturreihe ergibt Mittelwerte92/64/49s und stützt unter den gegebenen20–40°C-Bedingungen kürzere Auflösezeiten. Sie belegt weder eine lineare Fortsetzung noch eine größere Löslichkeitsgrenze. Die frische50°C-Variation80/45s ergibt62,5s mit35s Spannweite: beide Rohwerte behalten, Bedingungen prüfen, keine Ursache erfinden und keinen Wert zur gewünschten These auswählen. Die25°C-Leitfähigkeitsreihe3/1020/1990/2950µS/cm zu0/0,5/1/1,5g/L NaCl ist in diesem Bereich annähernd linear; NaCl stellt bewegliche Ionen bereit, Saccharose liegt nahe dem Blank. Eine wärmere Einzelprobe konfundiert Konzentrations- und Temperaturwirkung; eine Korrekturzahl muss begründet sein.',
  'sourceBoundaryDe':'Die Hypothese ist vorgegeben; eigene Hypothesenformulierung oder persönlich ausgeführte Messung werden dadurch nicht zertifiziert. Die ganzen jetzigen Aufgaben/P bleiben verbindlich, einschließlich der ursprünglichen BY-Quellengrenzen als unveränderten Kontext; diese BW-Ergänzung gewährt keine nationale Vollfreigabe.'},
 {'case':'coordinate-retained-bond-teacher','goalId':COORD,'teacherGoalId':BOND,'decision':'KEEP',
  'ownReasonDe':'Die aktuelle Aufgabe verlangt die Ausbildung einer gemeinsamen Cu–O-Bindung mit Paarherkunft am Liganden. Die vorhandene Bindungsroutine stellt Elektronenpaarbindung sowie die Trennung von elementarem Metall, ionischem Feststoff und neutralem Molekül bereit. Das ist ein fachlich tragender direkter Lehrer, weil der vom Liganden stammende Paarbeitrag danach als gemeinsame Bindung und nicht als freie vollständige Ladungsübertragung erklärt werden muss. 4488 bleibt mit seinem ganzen unveränderten P und seinen eigenen Vorgängern erhalten.'},
 {'case':'coordinate-direct-redox-teacher','goalId':COORD,'teacherGoalId':REDOX,'decision':'KEEP',
  'ownReasonDe':'Die zweite unveränderte Modellaufgabe setzt den Koordinationspfeil ausdrücklich mitCu2+→Cu+ gleich und verlangt die Korrektur; beide P-Erwartungen grenzen die Koordination von spätererCu(II)-Reduktion zuCu(I) inCu2O ab. Die ganze vorhandene Redoxroutine04fa behandelt gekoppelte Elektronenabgabe/-aufnahme und die Donator-/Akzeptorrollen an gegebenen neuen Teilchenbeispielen. Genau diese Unterscheidung verhindert, dass ein Elektronenpaarbeitrag zur gemeinsamen Bindung als vollständiger Redoxübergang gewertet wird. Der neue direkte Lehrer ist daher aus der aktuellen geforderten Erklärung begründet; der Anlass ist keine kleinere Lückenzahl.',
  'scopeCheckDe':'In allen16 vorhandenen Views mit363c-Referenz sind4488 und04fa bereits target. Dies ist eine begrenzte Prüfung expliziter Kompositionsrollen, kein neuer Lauf des Applicability-Compilers oder einer nativen Quellenvollprüfung.'},
 {'case':'coordinate-remove-universal-angle-prior','goalId':COORD,'removedTeacherGoalId':ANGLE,'decision':'KEEP',
  'ownReasonDe':'Beide ganzen363c-Aufgaben geben einen lokalen Bindungsausschnitt einschließlich besetztem O-Donororbital und geeignetem unbesetztem Zentralion-Akzeptororbital vor. Weder Elektronendomänenzahl, ein VSEPR-Koordinationspolyeder noch die Auswahl/Abweichung eines Bindungswinkels sind zu bestimmen; vollständige Geometrie wird ausdrücklich nicht behauptet. Die ganze entfallende EPA-Winkelkompetenz samt ihren Fallanforderungen fürCH4/H2O/NH3/BH3 ist daher keine universelle vorherige Leistung dieses qualitativen Fragmentmodells. Freie Paare im gegebenen Ausschnitt zu erkennen bleibt im363c-Auftrag erhalten und wird durch die Entfernung nicht erlassen.',
  'preservationDe':'Kein Winkelziel, keine Viewrolle, kein Profil und keine eigene Anforderung an Winkel-/Geometrieleistung werden entfernt oder herabgestuft. Nur diese allgemeine requires-Kante entfällt.'},
 {'case':'coordinate-remove-universal-assay-prior','goalId':COORD,'removedTeacherGoalId':ASSAY,'decision':'KEEP',
  'ownReasonDe':'Die ganzen363c-Aufgaben fordern keine Ethanal-/Propanonprobe, keine Probenidentifikation, keine Reaktionsausführung und keine Selektivitätsbewertung eines Lebensmittelgemischs. Sie erklären, warum TartratCu(II) in der alkalischen Lösung komplexiert und warum die Koordination nicht die spätere Reduktion ist. Die ganze973c-Kompetenz verlangt dagegen passende Kontrollen, eine wirkliche lokal freigegebene beaufsichtigte Durchführung mit eigenen Beobachtungen und die begrenzte Auswertung eines unbekannten Gemischs. Diese vollständige praktische analytische Leistung und die ganze Oxidationsprodukte-/Alkanol-Oxidierbarkeitskette sind nicht universell nötig, um den bereitgestellten lokalen Bindungsausschnitt fachlich zu erklären. Der benötigte allgemeine Redoxbegriff wird ausdrücklich04fa zugeordnet.',
  'preservationDe':'973c sowie5851/858d und sämtliche bisherigen Viewrollen/Whole-Ps bleiben als eigene Ziele mit allen bisherigen Pflichten unverändert. Eine spätere Bearbeitung von973c erhält aus363c weder praktische Punkte noch Mastery. Dass diese Ziele inRP weiterhin keinen neuen Erwerbsplatz erhalten, wird nicht als ihre Erledigung ausgegeben.'}
]

whole_profile_ids=[COORD,BOND,REDOX,DOC,INTERP,ANGLE,ASSAY,'4aa3a130-b517-5ac5-87b2-147fe432cadd']
profile_readings=[]
for x in D['wholeUnchangedPositiveProfiles']:
    if x['goalId'] in whole_profile_ids:
        profile_readings.append({'goalId':x['goalId'],'wholeProfileReadForConcreteProposedChange':True,
          'requiredExpectationIds':x['wholeProfile'].get('coverageExpectations',{}).get('requiredExpectationIds',[]),
          'profileBodyDigest':next(y['profileBodyDigest'] for y in E['profileBodyOriginalChecks'] if y['goalId']==x['goalId']),
          'newNativeDReviewOrIndependentWholeProfileApproval':False})

changes=[{'goalId':x['goalId'],'beforeDigest':x['beforeDigest'],'afterDigest':x['afterDigest'],'changedFields':x['changedFields']} for x in D['wholeGoalChanges']]
view_changes=[{'viewId':x['viewId'],'beforeDigest':x['beforeDigest'],'afterDigest':x['afterDigest'],'addedExistingOrdinaryTargetGoalIds':x['addedExistingOrdinaryTargetGoalIds'],'addedExistingMemoryTargetGoalIds':x['addedExistingMemoryTargetGoalIds']} for x in D['wholeViewChanges']]
prior_seal=pin('/mnt/e/skillpilot-chemie-L7-20261017/eighteen-foundations-independent-a-v1/FIRST.seal.json')
assert prior_seal['sha256']=='379134ba5c6db50941774929079a0e0c1ad00c836ea9198d285192d7e1be4a2d'
review={'artifactType':'independent-scientific-FIRST','reviewerRole':'independent reviewer A','createdAtUtc':datetime.now(timezone.utc).isoformat(),
 'status':'ai_candidate','humanReviewStatus':'needs_human_review','decision':'KEEP',
 'decisionScopeDe':'Die beiden ganzen BW-LK-Erwerbsplätze9fc/7d9 und die konkrete direkte Voraussetzungskorrektur des unveränderten363c-Modells beibehalten; ausschließlich bedingt auf die exakt gepinnte Post18-Vorschlagsbasis. Keine Annahme eines aktiven Zustands oder einer vollständigen EDTA-/M7-Freigabe.',
 'independence':{'proposalAuthor':False,'authorReadmesOrVerdictsReadBeforeFIRST':False,'peerVerdictsReadBeforeFIRST':False,
   'formalReviewRunIdAssigned':False,'exactModelNameAsserted':False,'reasoningGradeAsserted':False},
 'inputPins':pins,'conditionalBaseline':{'eighteenProposalNotActiveState':True,'foreignInputPin':D['foreignInput'],
    'condition':'Jede Änderung oder Ablehnung der gepinnten Vorgängerobjekte erfordert Neuaufbau und erneute exakte Prüfung dieses Nachfolgers. Ein früheres eigenes FIRST ist kein Apply-Befehl.',
    'allWholeBeforeObjectsExactlyMatchConditionalPost18Objects':True,'baseCanonicalGoalRecords':650,'baseWholeViews':39},
 'wholeGoalChanges':changes,'wholeViewChanges':view_changes,'cases':cases,'sourceReadings':sources,
 'wholeAffectedProfileReadings':profile_readings,
 'unchangedContextBoundary':{'wholeGoalContextRecords':34,'positiveProfileContextRecords':32,
    'all32ScientificBodiesComparedWithRealPinnedOriginals':True,'newScientificVotesOnUnchanged32Profiles':False,'newNativeDReviews':False,
    'scope':'Die32 unveränderten P-Körper dienen dem Vergleich der tatsächlich benötigten und entfallenden Voraussetzungen. Dieses FIRST stimmt nur über die konkrete vorgeschlagene Änderung ab.'},
 'rolesAndInvariants':{'allPreviousWholeViewReferencesAndProjectionRolesPreserved':True,'allPreviousTopicScopesPreserved':True,
    'allExistingMemoryGoalsCardsFiltersAndRolesUnchanged':True,'noExistingTargetDemotedToSupportOrDeleted':True,
    'noGoalTextPositiveProfileTagsApplicabilityImageOrCardChange':True,'changedRequiresGoalOnly':COORD,
    'all16ExistingCoordinateViewsNewDirectTeachersAlreadyTarget':True,'newOrdinaryGoals':0,'newCards':0,
    'BWWorkingMethodsCluster266RemainsPrerequisiteOnly':True,
    'BW266Meaning':'Der unveränderte Cluster266 erscheint in der begrenzten transitive-requires-Rollenmessung weiterhin als prerequisiteOnly. Das ist eine bestehende Supportrolle; hier wird daraus weder ein neuer atomarer Erwerbsplatz noch eine globale Pfadfreigabe abgeleitet.',
    'DAG':'Die konkrete neue04fa-Kante führt in den vorhandenen orientation-Vorgänger ohne neuen Zyklus. Unveränderte contains-Strukturen werden nicht neu genehmigt.'},
 'executionBoundary':{'ordinaryDocumentationInterpretationProductsRequired':True,
    'syntheticRecordsArePersonalMeasurements':False,'syntheticR2IsRetrospectiveR1Verification':False,
    'coordinateModelGivesActualAssayOrEDTAExecutionCredit':False,'allExistingAssayAndEDTAPracticalDutiesRemain':True,
    'actualLearnerWorkPresent':False,'actualLabExecutionPresent':False,'learnerMasteryWriteAuthorized':False},
 'ownArithmeticFromOriginalSyntheticMaterials':E['ownSyntheticArithmetic'],
 'remainingHolds':[{'topic':'final-binding-and-acceptance','decision':'HOLD','textDe':'Geänderte requires- und Kontext-/Quellen-/Applicability-Bindungen müssen in der finalen gemeinsam gebauten Kandidatenbasis regelgerecht neu geprüft werden. Dieses fachliche FIRST startet weder Compiler noch native Reviews und erklärt keine alten Fingerprints nach der Änderung für gültig.'},
   {'topic':'actual-learning-and-execution','decision':'HOLD','textDe':'Tatsächliche eigene Dokumentations-/Auswertungsprodukte, vor Ort freigegebene Ausführung, Beobachtungsprotokolle und individuelle Themenwahl sind nicht vorhanden. Kein solcher Erfolg wird aus den synthetischen Zahlen oder dem Modell erklärt.'},
   {'topic':'official-whole-coverage','decision':'HOLD','textDe':'Keine amtliche Vollabdeckung aller eigenen Aufgaben/Ps, keine angenommene Auswahl vonRP8.7/9.2 oderBW-Forschungsstoffgruppe. Die jeweilige Quellen-/Kursgrenze bleibt bestehen.'},
   {'topic':'global-completion','decision':'HOLD','textDe':'Keine vollständige EDTA-Route, kein Abschluss aller39 Ansichten, keine native M7-Annahme und keine Human-/Host-Freigabe. Die geschützte439-curricularAtomic-Basis wird nicht neu gezählt oder erweitert.'}],
 'protectedBaseline':{'curricularAtomic':439,'countMeaning':'Auftraglich festgehaltene geschützte Basis; kein neuer nativer Denominatorlauf.',
   'mathematicsPhysicsBiologyM7Modified':False,'normalDataCapsulesCandidatesL6L7Mutated':False,'prior18FIRSTSealUnchanged':prior_seal},
 'validationActuallyPerformed':['Exakte reale Selektor-/Vollinput-/Basis-/Originalprofil-/Material-/Primär-PDF-Pins','Bedingte ganze Beforeobjekte gegen den gepinnten18er-Vorschlag geprüft','Nur erlaubte Goal-Felddifferenzen und exakt zwei eingefügte BW-Targetreferenzen','Alle bisherigen expliziten View-/Target-/Support-/Memoryrollen erhalten','Begrenzter direkter Lehrerrollenvergleich in allen16 vorhandenen363c-Views','32 unveränderte wissenschaftliche Profilkörper ohne Status-/Dissent-/Reviewerurteile mit realen Originalkörpern verglichen','Sechs vollständige saubere DE/EN-Materialien gegen tatsächliche Originalinhaltsfelder geprüft','Eigene Nachrechnung der Kalibrations-/Trend-/Streuungsfälle','Eigene verifizierte Primärquellenlesungen mit frischer SichtprüfungBW11/12 undRP57/58'],
 'M7':False,'HumanApproval':False,'HumanTrial':False,'hostAcceptance':False,
 'supportingArtifacts':[pin(p) for p in sorted(OUT.iterdir()) if p.is_file() and not p.name.startswith('FIRST') and p.name!='SEAL.sha256']}

first=OUT/'FIRST.independent-a.json'
with first.open('x') as f:json.dump(review,f,ensure_ascii=False,indent=2);f.write('\n')
assert json.loads(first.read_text())==review

lines=['# Unabhängiges FIRST A – zwei BW-Erwerbsplätze und direkte Lehrer des Koordinationsmodells','',
 '**KEEP für die konkrete vorgeschlagene Änderung**, bedingt auf die exakt gepinnte Post18-Vorschlagsbasis. `ai_candidate` · `needs_human_review`. Keine native, M7-, Human-, Lernenden- oder Hostfreigabe.','',
 'Selektor-SHA `'+pins[0]['sha256']+'`; Vollinput-SHA `'+pins[1]['sha256']+'`. Die Beforeobjekte stimmen exakt mit den vollständigen Post18-Vorschlagsobjekten überein. Der Vorgänger wird dadurch nicht zum aktiven Stand. Änderungen oder Ablehnung des Vorgängers verlangen Neuaufbau dieses Nachfolgers. Das frühere 18er-FIRST und sein Siegel bleiben unverändert.','',
 'Vor diesem eigenen FIRST wurden keine Autoren-README/Urteile und keine Peerurteile gelesen. Modellname, Reasoninggrad und formale Review-ID werden nicht erfunden. 34 ganze Ziele und 32 unveränderte P-Körper sind Kontext. Über diese 32 Ziele werden weder neue allgemeine Fachvotes noch native D-Reviews abgegeben; geprüft wird die konkrete Änderung anhand der ganzen relevanten Anforderungen.','',
 '| Konkreter Fall | Entscheidung |','|---|---|']
for c in cases:lines.append('| '+c['case']+' | '+c['decision']+' |')
for c in cases:
    lines+=['',c['case']+': '+c['ownReasonDe']]
    for k in ['wholeTaskCoverageDe','sourceBoundaryDe','scopeCheckDe','preservationDe']:
        if k in c:lines+=['',c[k]]
lines+=['','Die Voraussetzungen sind aus der chemischen Leistung begründet. Dass die Änderung offene Rollenlücken verkleinern kann, ist kein eigener fachlicher Annahmegrund. Der Koordinationsauftrag bleibt vollständig: Donor-Paarquelle und Akzeptororbital zuordnen, gemeinsame Bindung erklären, Tartratkomplexierung im alkalischen Fehling-Kontext deuten, den neuen Donorangebotsvergleich bearbeiten, Koordination vonRedox trennen und die Grenzen des Fragmentmodells nennen. Keine dieser Anforderungen wird abgesenkt.','',
 'Tatsächliche Primärquellen:']
for s in sources:lines+=['',s['ownScientificSourceBoundaryDe']]
lines+=['','Alle zehn ausgewählten Seiten wurden eigenständig aus den realen gepinnten PDFs extrahiert und mit dem sauberen Volltext verglichen. Die eigenen bisherigen Lesungen derselben exakt unveränderten Seiten wurden genutzt; frisch visuell geprüft wurdenBW11/12 undRP57/58. Physische/gedruckte Seiten: BW10/8,11–13/9–11,35/33,42/40; RP29,36,57–58. Diese Unterlagen sind keine neue amtliche Versionsabfrage und keine globale Quellenfreigabe.','',
 'Die ganzen bisherigen Before-/After-Views zeigen ausschließlich die zwei gewöhnlichen Targeteinfügungen vor4aa im bestehenden BW-Ergänzungsordner. Alle alten Themen-, Target-, Support- und Memoryrollen bleiben. Beide gewöhnlichen Plätze behalten ihre ganze aktuelle Aufgabe/P und die eigene Vorgängerkante. Die beiden Datenziele erhalten nur erläuternde, ausdrücklich quellbegrenzt formulierte eigene Erwerbsannotation; sie erhalten keine geänderten Lernzieltexte, Applicability, Karten, Bilder oder fachlichen P-Körper.','',
 'Die direkte requires-Änderung von363c betrifft das kanonische Ziel und damit mehr alsRP. Deshalb wurden die vorhandenen16 Kompositionsansichten mit363c-Referenz begrenzt auf die neuen direkten Lehrer geprüft:4488 und04fa sind dort jeweils bereitstarget. Dies ist kein neuer Applicability-Compilerlauf. Die alte BW-Supportrolle des Arbeitsweisenclusters266 bleibtprerequisiteOnly; die Änderung befördert diesen Cluster nicht und behauptet daraus keine vollständige atomare Pfadschließung.','',
 'Alle ausgewählten Inhaltsfelder der sechs DE/EN-Materialien stimmen mit den tatsächlichen Originalen überein. Die wissenschaftlichen Körper sämtlicher32 Kontextprofile wurden in den realen gepinnten Ursprungskörpern gefunden. Urteils-/Dissent-/Reviewerwerte der Original-Ledger wurden nicht als Entscheidungsgrundlage gelesen. Die Originalmaterialien bleiben synthetische Lehrdaten. Eigene Nachrechnung bestätigt D2-Steigung0,080 L/mg, A-Mittel0,290,3,50mg/L verdünnt und7,00/14,00mg/L für Faktor2/4 sowie92/64/49s und62,5s mit35s Spannweite beim neuen50°C-Fall. Daraus wird keine Lernendenleistung oder wirkliche Messung gemacht.','',
 '**HOLD bleibt für spätere Annahmen:** finale geänderte Quellen-/Applicability-/Kontextbindungen und zulässige native Annahme; tatsächliche eigene Lernprodukte/örtlich freigegebene Ausführung; individuelle Themenwahl und amtliche Vollabdeckung; vollständige EDTA-/39-View-/M7-Annahme sowie Human-/Hostfreigabe. Dieses FIRST startet keinen Vollbuild/APV, keinen neuen Compilerlauf und keinen nativen Review.','',
 'Die geschützte Basis bleibt439 `curricularAtomic`;650 bestehende kanonische Datensätze und39 Basisansichten sind erhalten. Normaldaten, Kandidaten, Capsules sowieL6/L7 wurden nicht verändert; Mathematik-/Physik-/Biologie-M7 bleibt unangetastet. Neue Ausgaben liegen ausschließlich physisch unter `'+str(OUT)+'`.']
md=OUT/'FIRST.independent-a.md'
with md.open('x') as f:f.write('\n'.join(lines)+'\n')
seal={'artifactType':'immutable-FIRST-seal','sealedAtUtc':datetime.now(timezone.utc).isoformat(),
 'firstArtifacts':[pin(first),pin(md)],'inputPins':pins,'supportingArtifacts':review['supportingArtifacts'],
 'decision':'KEEP','decisionScope':'two BW acquisition placements and concrete coordinate-prior correction, conditional post18 basis',
 'status':'ai_candidate','humanReviewStatus':'needs_human_review','authorAndPeerVerdictsNotConsumedBeforeSeal':True,
 'prior18FIRSTSealUnchanged':prior_seal,'subsequentEditsRequireNewSuccessor':True}
sp=OUT/'FIRST.seal.json'
with sp.open('x') as f:json.dump(seal,f,ensure_ascii=False,indent=2);f.write('\n')
sealpin=pin(sp)
with (OUT/'SEAL.sha256').open('x') as f:f.write(sealpin['sha256']+'  FIRST.seal.json\n')
for p in [first,md,sp,OUT/'SEAL.sha256']:p.chmod(0o444)
for group in ['firstArtifacts','inputPins','supportingArtifacts']:
    assert all(pin(x['path'])==x for x in seal[group])
assert pin(prior_seal['path'])==prior_seal
assert json.loads(sp.read_text())==seal
print(json.dumps({'firstArtifacts':seal['firstArtifacts'],'seal':sealpin,'decision':'KEEP','laterAcceptanceClaims':'HOLD','prior18SealUnchanged':True},ensure_ascii=False,indent=2))
