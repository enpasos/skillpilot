import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path('/mnt/e/skillpilot-chemie-L7-20261017/eighteen-foundations-independent-a-v1')
BASE = ROOT / 'tmp/chemie-m7-resumed-20261016/eight-Mol-eight-Memory-and-two-EDTA-foundations-author-v1'
INPUT = BASE / 'REVIEW-INPUT.clean-eighteen-existing-targets-whole-content-and-primary-boundaries.json'
D = json.loads(INPUT.read_text())
E = json.loads((OUT / 'EXAMINATION.independent-a.json').read_text())
DEEP = json.loads((OUT / 'DEEPER-ROLES.independent-a.json').read_text())

def pin(path):
    path = Path(path)
    with path.open('rb') as f:
        sha = hashlib.file_digest(f, 'sha256').hexdigest()
    return {'path':str(path), 'sha256':sha, 'bytes':path.stat().st_size}

def objects(v):
    if isinstance(v, dict):
        yield v
        for x in v.values():
            yield from objects(x)
    elif isinstance(v, list):
        for x in v:
            yield from objects(x)

original_checks = []
for key, contentkey, idkey in [('originalEDTAMaterialSource','wholeOriginalEDTADEENCases','id'), ('dataValidityMaterialSource','wholeDataValidityDEENMaterials','caseKey')]:
    source = list(objects(json.loads((ROOT / D[key]['path']).read_text())))
    for x in D[contentkey]:
        original = next(y for y in source if y.get(idkey) == x[idkey])
        assert all(k in original and original[k] == value for k, value in x.items())
        original_checks.append({'case':x[idkey], 'everySelectedCleanFieldEqualsActualOriginal':True, 'unselectedOriginalKeys':sorted(set(original)-set(x)), 'unselectedJudgmentValuesNotUsed':True})
calc_path = OUT / 'ORIGINALS-AND-CALCULATIONS.independent-a.json'
calc = json.loads(calc_path.read_text())
calc['cleanFieldComparisonClarification'] = original_checks
calc['wholeObjectEqualityMeaning'] = 'False whole-object equality above means excluded keys only. Every selected clean field equals its actual original. Excluded judgment values were not inspected or used.'
calc_path.write_text(json.dumps(calc, ensure_ascii=False, indent=2)+'\n')

source_findings = {
 'DE-HH':('30', 'Konzentrationsbestimmung mit Umschlagspunkt starker Säuren/Basen und Konzentrationsberechnung stehen im gemeinsamen Inhaltsteil. Kurven, schwache/mehrprotonige Fälle und quantitative Puffer sind als zusätzliche erhöhte Anforderungen abgesetzt. Die ganze Mol-P-Ausgestaltung ist eine eigene Erwerbsgrundlage; diese Seite formuliert keine eigene Vollabdeckung aller Atom-/Ionentransfers.'),
 'DE-MV':('28/24; 29/25; 35/31', 'Die linken verbindlichen Inhalte auf physisch 28 verlangen Maßanalyse, Stoffmengen-/Konzentrations-/Massenrechnung und SE-Neutralisation. Physisch 29 ist ausdrücklich zusätzlich LK. Physisch 35 sind Stoffmenge, Stoffmengenkonzentration, Volumina und Massen oberhalb der LK-Grenze gemeinsam. Chromatographie/Komplexchemie liegen darunter; Wasserhärte steht rechts als zusätzlich mögliches Experiment. Kein solcher LK-Zusatz wird zum GK-Pflichtstoff gemacht.'),
 'DE-NW':('38–39; 46–48', 'GK beginnt auf 38; auf 39 sind Planung, tatsächliche Indikatortitration starker Säuren/Basen und Fehleranalyse getrennte Kompetenzen. Der LK beginnt erst auf 46 und fordert auf 47–48 zusätzliche Kurven-/Puffer-/pH-metrische Fähigkeiten. Beide Niveaus rechtfertigen den Molbezug als Erwerbsbasis; die Karte und eine Papierberechnung ersetzen die Durchführung nicht.'),
 'DE-ST':('40; 49–50', 'gAN auf 40 und eAN auf 49–50 verlangen Konzentrationsrechnung und verbindliche selbstständig geplante, durchgeführte und ausgewertete Schülerexperimente. Koordinative Bindung, schwache Säuren/Basen und Puffer gehören hier zum eAN. Die vorliegende gAN-Molergänzung überträgt diese eAN-Erweiterungen nicht.'),
 'DE-BW':('10/8; 11–13/9–11; 35/33; 42/40', 'Die allgemeinen Prozesskompetenzen stützen Experimente, Dokumentation, quantitative Modellierung und Aussagegrenzen, belegen aber nicht exakt die beiden ganzen Farb-/Leitfähigkeitsfälle. Seite 35 ist Leistungsfach und fordert echte Titration/Messung. Auf 42 ist Komplexchemie nur ein Beispiel einer weiteren ausgewählten Stoffgruppe. EDTA und sämtliche 4aa-P-Fälle sind deshalb keine universelle amtliche Einzelpflicht.'),
 'DE-RP':('29; 36; 57–58', '9.1 auf 57 ist P, ausschließlich Leistungsfach, und nennt Lewis-Paargeber/-akzeptor und koordinative Bindung. 9.2 auf 58 ist W; der Theorievergleich setzt behandelten Wahlbaustein 8.7 voraus. Seite 36 führt Komplexometrie als Vertiefung/Verzahnung, 29 weist den Wahlpool aus. Das ganze Fehling-/Tartrat-/qualitative Orbitalprofil bleibt die deklarierte eigene Operationalisierung; kein behandeltes 8.7/9.2 und keine individuelle Wahl werden angenommen.')
}
sources = []
for s in D['primarySourcesAndWholeRelevantPages']:
    j = s['jurisdiction']
    sources.append({'jurisdiction':j,'officialURL':s['officialURL'],'actualPDF':pin(ROOT/s['originalPDF']['path']),
      'physicalPagesActuallyRead':[p['physicalPDFPage'] for p in s['wholeRelevantPrimaryPages']],
      'physicalAndPrintedReferences':source_findings[j][0], 'ownContentFindingDe':source_findings[j][1],
      'ownFullPageLayoutExtractionComparedWithCleanText':True,
      'visualBoundaryPagesActuallyViewed':{'DE-HH':[30],'DE-MV':[35],'DE-NW':[46],'DE-ST':[49],'DE-BW':[42],'DE-RP':[57,58]}[j]})

MOLE = '1dc15fa2-fca4-56b0-b5c1-4d215613dde0'
MEM = 'd7e08305-25c2-5c2c-b87d-443358526a1b'
DATA = '4aa3a130-b517-5ac5-87b2-147fe432cadd'
COORD = '363c5740-8a3c-50b8-8c3a-5548c80c36ea'
cases=[]
for row in E['rows']:
    j=row['scope']['jurisdiction']
    for gid in row['addedTargetIds']:
        if gid == MOLE:
            nature='ordinary_acquisition'
            reasoning='KEEP als ganzer vorhandener Erwerbsplatz: Mol bezieht sich auf benannte Einheiten; Moleküle/Atome/Formeleinheiten/Ionen werden begründet unterschieden. 0,20 mol O2 enthalten 0,40 mol O-Atome; 0,30 mol NaCl-Formeleinheiten enthalten je 0,30 mol Na+- und Cl−-Ionen. Gleiche Stoffmenge bedeutet keine gleiche Masse. Das ist die notwendige Bedeutungsebene vor n/V und stöchiometrischer Titrationsrückrechnung. Der direkte Symbol-/Formelvorgänger ist bereits target; die untersuchte requires-Kette dieser Molgrundlage hat keine fehlende Targetrolle. Das beweist keinen vollständigen anderen Lernpfad.'
            limits=['Eigene Erwerbsergänzung, keine amtliche Vollzuordnung des ganzen P-Profils.','Praktische Kriterien des nachfolgenden Titrationsziels bleiben vollständig erforderlich.','Keine weitere allgemeine pH-Herstellungsroutine f1ed wird aus dem Molplatz oder EDTA-Puffer abgeleitet.']
        elif gid == MEM:
            nature='bounded_recall'
            reasoning='KEEP als Ergänzung nach dem ganzen Mol-Erwerb: Die reale Auswahl ist ausschließlich chem_basics_008 im bestehenden Basicsdeck. Benannte Teilchen, Einheit mol, exakter Molzählbezug, N=n·N_A und Einheit Eins für N sind fachlich korrekt. Der Filter zieht weder chem_basics_009 noch chem_basics_010 hinzu. Der zusätzliche Konstantenbezug auf der bestehenden Karte macht daraus keinen Erwerbsplatz für alle Teilchentransfers oder molare Masse. Die vorhandene requires-Kante auf 1dc bleibt erhalten.'
            limits=['Abrufleistung der einen Karte ersetzt weder ganzen Mol-Erwerb noch Konzentrations-/Stöchiometrieverständnis.','Keine neue Karte, kein umbenannter breiter Deckscope und keine geänderte alte Memoryrolle.','Numerischer Avogadroabruf ist aus diesen Oberstufenseiten keine behauptete universelle zusätzliche Pflicht.']
        elif gid == DATA:
            nature='ordinary_acquisition'
            reasoning='KEEP als ganzer eigener Erwerbsplatz vor dem bereits enthaltenen EDTA-Ziel: Der kreuzreaktive Farbtest trennt Indikation von Identifikation; eine Wasserblindprobe beseitigt fehlende Selektivität nicht. Beim Leitfähigkeitsfall ist 2300−1800=500 µS/cm mit Temperatur konfundiert, der temperaturgleiche Unterschied 2300−2298=2 µS/cm liegt innerhalb der vorgegebenen groben ±3-Streuung. Saccharose kann die Matrix/Ionenbeweglichkeit ändern, ohne zusätzliche dissoziierte Ionen zu liefern. Die unabhängige Folgemethode braucht erst nachgewiesene Selektivität. Das trägt das Verständnis von Blindwert, Kontrolle und Wiederfindung, ohne eine echte EDTA-Ausführung zu behaupten.'
            limits=['HOLD für vollständige Route: 9fc800d1 und 7d9fcc7f sind weiter absent als gewöhnliche Erwerbsplätze.','BW-Prozesskompetenzen stützen den Kontext, liefern keine exakte amtliche Vollabdeckung des gesamten 4aa/P.','BW42 verlangt keine universelle EDTA-Behandlung; gewählte Stoffgruppe und Lernendenwahl sind nicht bewiesen.']
        else:
            assert gid==COORD
            nature='ordinary_acquisition'
            reasoning='KEEP als ganzer eigener Erwerbsplatz vor EDTA: Ein besetztes Ligandendonororbital und ein geeignetes unbesetztes Zentralion-Akzeptororbital erklären im bereitgestellten qualitativen Modell die Bindungsbildung. Tartrat hält Cu(II) im alkalischen Fehling-Kontext löslich. Der Koordinationspfeil ist kein Cu(II)→Cu(I)-Redoxpfeil; das Fragment legt weder die ganze Komplexstöchiometrie noch alle leeren d-Orbitale fest. Ein gesättigter C-H-Ausschnitt ohne angebotenes Donorpaar ersetzt den O-Donor im gegebenen Modell nicht. RP9.1 trägt den koordinativen Kern, nicht automatisch das ganze Fehling-/Orbital-P-Profil.'
            limits=['HOLD für vollständige Route: 973c12d9 sowie dessen vorhandene Vorgänger 5851b53a und 858d56e0 bleiben absent.','Die gesamte bestehende Erwerbskette einschließlich echter Ausführung der Nachweise wird nicht durch ein Fragmentbild ersetzt.','Kein behaupteter Abschluss oder individuelle Wahl von RP9.2/8.7, kein allgemeiner Orbitaltheoriepflichtblock.']
        cases.append({'case':row['viewId']+'::'+gid,'viewId':row['viewId'],'scope':row['scope'],'goalId':gid,
                      'proposedProjectionRole':'target','caseKind':nature,'decision':'KEEP', 'decisionScope':'bounded existing placement only',
                      'ownScientificReasoningDe':reasoning,'sourceJurisdiction':j,'sourceReadPhysicalPages':next(x['physicalPagesActuallyRead'] for x in sources if x['jurisdiction']==j),
                      'sourceCredit':'authored-acquisition-or-recall; no official whole-profile credit',
                      'limitsDe':limits,'beforeViewDigest':row['beforeDigest'],'afterViewDigest':row['afterDigest'],
                      'oldRolesPreserved':True,'actualLearnerChoiceEstablished':False,'actualLearnerPerformanceEstablished':False})
assert len(cases)==18

pins=[pin(BASE/'SELECTOR.clean-content-for-two-other-reviewers.json'),pin(INPUT),pin(Path(D['baseCanonical']['path'])),pin(Path(D['baseWhole39Views']['path']))]
assert pins[0]['sha256']=='daae7a2ea94058b22e5096e64ecd090c6cd6677e3fbfd9a5048258c0a6aa7d69'
assert pins[1]['sha256']=='d389a6b76c8f63f939fa4dda167f48997fc273d9f2f335b60b7ea7b74f661b3f'
for k in ['scientificProfilesContentSource','dataValidityMaterialSource','originalEDTAMaterialSource']:
    q=Path(D[k]['path']);q=q if q.is_absolute() else ROOT/q
    r=pin(q); assert r['sha256']==D[k]['sha256'];pins.append(r)
stock=D['actualCurrentStockCompilerRelevantContent']['originalStockOutput'];r=pin(stock['path']);assert r['sha256']==stock['sha256'];pins.append(r)
pins.extend(E['actualDeckPins'])
for s in sources:pins.append(s['actualPDF'])

findings=[
 {'finding':'F01','severity':'boundary','decision':'KEEP','textDe':'18 zusätzliche bestehende Zielreferenzen in zehn ganzen Ansichten sind lokal fachlich sinnvoll. Acht Molziele, acht enge Memoryplätze und zwei EDTA-Grundlagen. Alle zuvor vorhandenen Wurzelobjekte und sämtliche alten Target-/PrerequisiteOnly-/Memoryrollen bleiben inhaltlich unverändert.'},
 {'finding':'F02','severity':'open_route','decision':'HOLD','textDe':'BW-LK erhält 4aa, aber die eigenen gewöhnlichen Vorgänger 9fc Dokumentation und 7d9 Datenauswertung fehlen weiterhin. Erwerb einer ganzen Datenvaliditätsroutine benötigt diese Leistungen. Das begrenzte KEEP schließt diese beiden Erwerbslücken nicht.'},
 {'finding':'F03','severity':'open_route','decision':'HOLD','textDe':'RP-LK erhält 363, aber 973c Carbonylnachweise sowie 5851 Oxidationsprodukte und 858d Oxidierbarkeit fehlen weiterhin. Das vorhandene ganze Nachweisziel umfasst tatsächliche Ausführung; keine solche Ausführung wird aus dem Koordinationsbild abgeleitet.'},
 {'finding':'F04','severity':'evidence_boundary','decision':'HOLD','textDe':'Die beiden Original-EDTA-Fälle T01-C1/C2 bleiben synthetische E0/G0-Unterrichts-/Prüfmaterialien. Leere Beobachtungen, actualPointsAwarded=null und executed=false bleiben leer. Eigene Nachrechnung bestätigt 3,950 mmol/L mit 100,133... % Referenzwiederfindung bzw. 7,520 mmol/L mit 100,4 % Aufstockwiederfindung; dies sind keine Lernendenleistungen.'},
 {'finding':'F05','severity':'evidence_boundary','decision':'KEEP','textDe':'Das ganze aktuelle EDTA-P verlangt e1–e4 und den eigenen Konzentrationserwerb. Aktuelle neue Papierfälle ergeben 4,000 mmol/L bzw. 8,400 mmol/L und 100,0 % Aufstockwiederfindung. Formaler EDTA-Bestand ist nicht ausschließlich Y4− bei pH10; bestimmbar ist nur Ca+Mg. Gute Wiederfindung identifiziert kein Einzelmetall und beweist keine universelle Matrixgültigkeit oder unabhängige Probenvorbereitungs-Wiederholbarkeit.'},
 {'finding':'F06','severity':'evidence_boundary','decision':'KEEP','textDe':'Das ganze Säure-Base-P behält Planung, echte Durchführung, Indikator-/Äquivalenztrennung und stöchiometrisch begründete Rechnung. Die neuen HCl-/H2SO4-Papierfälle ergeben 0,04000 mol/L bzw. 0,01000 verdünnt und 0,1000 mol/L ursprünglich. Die formale Säurekonzentration und aliquote Stoffmenge werden korrekt bezogen; sie ersetzen weder pH-Herstellung f1ed noch Laborbeobachtung.'},
 {'finding':'F07','severity':'scope_boundary','decision':'KEEP','textDe':'skillPilotAcquisitionExtensions ändert bei den drei ganzen Zielen ausschließlich diese erläuternden Metadaten. Applicability, fachlicher Text, requires, tags, P, Karten und Bildverweise bleiben gleich. Die Informationen begründen keine neue Kurs-/Stufenfilterung: alle zehn Views bleiben CrossStage; GK/LK-Grenzen folgen der jeweiligen unveränderten View.'},
 {'finding':'F08','severity':'scope_boundary','decision':'KEEP','textDe':'Der tatsächliche vorhandene Stock-Output und die vier ausgewählten ganzen Zielzeilen sind byte-/inhaltlich gepinnt und verglichen. jurisdiction-Sichtbarkeit, darunter requires-closure, ist keine amtliche Vollabdeckung und kein native- oder M7-Nachweis. Es wurde kein neuer Compilerlauf gestartet.'},
 {'finding':'F09','severity':'scope_boundary','decision':'KEEP','textDe':'Die historischen Originalfälle enthalten einen alten wholeGoalScope. Dieser wird als unveränderter Materialkontext erhalten und überschreibt weder aktuelle kanonische Applicability noch Views. Fehlende Status-/Urteilskeys des clean Exports wurden durch Inhaltsfeldvergleich erklärt; ihre Urteilswerte wurden vor diesem FIRST nicht gelesen.'}
]
review={
 'artifactType':'independent-scientific-FIRST','reviewerRole':'independent reviewer A','createdAtUtc':datetime.now(timezone.utc).isoformat(),
 'status':'ai_candidate','humanReviewStatus':'needs_human_review','decision':'KEEP',
 'decisionScopeDe':'Ausschließlich die 18 begrenzten existierenden Erwerbs-/Abrufplätze samt source-limited Annotationen beibehalten. Vollständige BW-/RP-EDTA-Erwerbspfade bleiben HOLD.',
 'independence':{'proposalAuthor':False,'authorReadmesOrVerdictsReadBeforeFIRST':False,'peerVerdictsReadBeforeFIRST':False,'cleanSelectorUsed':True,
   'formalReviewRunIdAssigned':False,'exactModelNameAsserted':False,'reasoningGradeAsserted':False,'separateDeeperOpenHandoffReadBeforeFIRST':False},
 'inputPins':pins,'sourceReadings':sources,'boundedCases':cases,'findings':findings,
 'wholeProfileReadings': [{'goalId':x['goalId'],'wholeProfileRead':True,'requiredExpectationIds':x['wholeProfile'].get('coverageExpectations',{}).get('requiredExpectationIds',[]),'wholeProfileContentDigest':'sha256:'+hashlib.sha256(json.dumps(x['wholeProfile'],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()} for x in D['wholeCurrentScientificProfilesContentOnly']],
 'memoryReview':{'deckCount':7,'existingSelectionsRecomputed':67,'existingSelectionChanges':0,'exactOneCardSelection':['chem_basics_008'],
   'newRecallOrdinaryPrerequisite':MOLE,'previous008SelectorsPreserved':[{ 'viewId':r['viewId'],'selectors':r['priorMemory008Selectors']} for r in DEEP],
   'ownConclusionDe':'Das eine bestehende kompakte Recallitem ist nach dem ganzen gewöhnlichen Molziel sinnvoll. Es zertifiziert keine Anwendung und erweitert keine amtliche Pflicht. Breite bestehende Auswahlen in BW/RP bleiben erhalten; den acht ergänzten Molansichten wird kein breites Grundlagen-/Molare-Masse-Deck untergeschoben.'},
 'actualOriginalContentComparisons':original_checks,'ownArithmetic':calc['ownSyntheticDataCalculations'],
 'deeperRoleExamination':DEEP,
 'protectedBaseline':{'curricularAtomic':439,'meaning':'Auftraglich festgehaltene bestehende fachliche Basis; kein neuer nativer Denominatorlauf durch diesen Reviewer. Keine neuen Ordinary Goals.',
   'canonicalGoalRecords':650,'wholeBaseViews':39,'normalDataOrCapsulesChanged':False,'mathematicsPhysicsBiologyM7Modified':False},
 'validationActuallyPerformed':['Selector-/Input-/Primär-PDF-/Deck-/Originalmaterialpins','Ganze Before-Views gegen reale 39-Viewbasis und komplette Afterobjekte verglichen','Alte vollständige Baumobjekte und Rollen unverändert; zusätzliche Referenzen genau18','Alle67 realen SRS-Filter mit sieben physischen Decks nachgerechnet','Eigene PDF-Layoutlesung aller22 ausgewählten Seiten und Sichtlesung sieben Kurs-/Wahlgrenzen','Eigene Rechnung synthetischer Mol-/Leitfähigkeits-/Titrationsfälle und Inhaltsabgleich tatsächlicher Originalmaterialien'],
 'notEstablished':['vollständige EDTA-Pfadschließung','amtliche Vollabdeckung der ganzen ergänzten Profile','tatsächliche individuelle Themenwahl','eigene Lernendenantworten oder praktische Durchführung','formale native Reviewannahme','neuer kompletter APV-/Build-/M7-Lauf','Human Approval oder Human Trial','Host-/Runtime-Akzeptanz'],
 'M7':False,'HumanApproval':False,'HumanTrial':False,'actualLearnerPerformance':False,'hostAcceptance':False,
 'supportingArtifacts':[pin(p) for p in sorted(OUT.iterdir()) if p.is_file() and not p.name.startswith('FIRST') and p.name!='SEAL.sha256']
}
assert len([x for x in cases if x['caseKind']=='ordinary_acquisition'])==10
assert len([x for x in cases if x['caseKind']=='bounded_recall'])==8
first=OUT/'FIRST.independent-a.json'
with first.open('x') as f:json.dump(review,f,ensure_ascii=False,indent=2);f.write('\n')
assert json.loads(first.read_text())==review

lines=['# Unabhängiges FIRST A – begrenzte Chemie-Erwerbsplätze', '',
 '**KEEP für die 18 begrenzten Plätze. Vollständige EDTA-Erwerbspfade in BW und RP bleiben HOLD.**', '',
 '`ai_candidate` · `needs_human_review`. Keine menschliche Freigabe, keine M7-, Lernenden- oder Hostannahme. Vor dem FIRST wurden weder Autoren-README/Urteile noch Peerurteile oder das getrennte tiefere Handoff gelesen. Exakter Modellname, Reasoninggrad und formale Review-ID werden nicht behauptet.', '',
 'Eingabe: `'+str(INPUT)+'` · SHA-256 `'+pins[1]['sha256']+'`. Selektor-SHA-256 `'+pins[0]['sha256']+'`.', '',
 'Die fachliche Prüfung umfasst ganze Ziele und acht ganze P-Profile, vollständige Before-/After-Viewobjekte, die tatsächlichen Basisdateien, reale Kartenfilter, die ausgewählten vollständigen DE/EN-Materialien und die Primär-PDFs. Eine unveränderte Teilbaum- oder Hashkontrolle alleine trägt die wissenschaftliche Entscheidung nicht. Die vollständigen Profile werden durch die Ergänzung weder verkürzt noch ersetzt.', '',
 '| Amtliche Quelle | Tatsächlich gelesene physische/gedruckte Seiten | Eigener Befund |', '|---|---|---|']
for s in sources:lines.append('| '+s['jurisdiction']+' | '+s['physicalAndPrintedReferences']+' | '+s['ownContentFindingDe']+' |')
lines+=['','Eigene vollständige Layout-Extraktionen aller 22 Seiten stimmen mit den sauberen Seitentexten überein. Visuell wurden HH30, MV35, NW46, ST49, BW42 sowie RP57/58 gelesen. Sämtliche realen PDF-Hashes stehen im JSON. Die Papierquellen wurden in ihrer gepinnten Fassung geprüft; eine neue amtliche Versionsabfrage gehört nicht zu diesem begrenzten Auftrag.','','| Begrenzter Fall / View | Bestehendes Ziel | Entscheidung |','|---|---|---|']
for c in cases:lines.append('| '+c['viewId']+' | '+c['goalId']+' | KEEP ('+c['caseKind']+') |')
lines+=['','Die acht Molplätze behalten den vollen begründeten Einheiten-/Teilchenwechsel bei. 0,20 mol O₂ entsprechen 0,40 mol O-Atomen; 0,30 mol NaCl-Formeleinheiten bedeuten je 0,30 mol Na⁺/Cl⁻, insgesamt 0,60 mol Ionen. Daraus folgt weder eine Verdopplung der Formeleinheiten noch Massengleichheit. Die direkte Symbolgrundlage und die untersuchte vorhandene requires-Kette dieser Molgrundlage besitzen bereits Targetplätze. Das rechtfertigt keine globale Pfadschließung.', '',
 'Die acht d7-Abrufplätze wählen tatsächlich allein `chem_basics_008`. Die Definition einschließlich exakt 6,02214076·10²³ benannter Einheiten je mol, N=n·N_A und Einheit Eins für N ist korrekt. `chem_basics_009/010` werden nicht mitausgewählt. Das knappe Recallitem folgt dem gewöhnlichen Erwerb und ersetzt weder dessen Transfers noch Konzentrations-/Stöchiometrieverständnis. Alle 67 bestehenden Auswahlen wurden mit sieben physischen Decks nachgerechnet; breite alte BW-/RP-Auswahlen bleiben erhalten.', '',
 'BW-LK: Der ganze Datenvaliditätserwerb ist fachlich sinnvoll. Die Farbe eines kreuzreaktiven Tests identifiziert X nicht eindeutig; ein Blank stellt Selektivität nicht her. Die temperaturungleiche Leitfähigkeitsdifferenz beträgt 500 µS/cm, die passende Kontrolldifferenz nur 2 µS/cm bei ausdrücklich grober ±3-Streuung. Der Saccharosetransfer verlangt Matrixkontrolle, weil Ionenbeweglichkeit verändert werden kann. HOLD bleibt für `9fc800d1-92d1-5ef6-81c1-33960ae034dd` und `7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6`: ihre gewöhnlichen Erwerbsplätze sind weiterhin abwesend.', '',
 'RP-LK: Das ganze qualitative Donor-/Akzeptor-/Fehlingprofil ist als eigene EDTA-Grundlage sinnvoll. Paarherkunft ist von Redox zu unterscheiden, der Tartratausschnitt beweist keine vollständige Komplexgeometrie oder ausschließlich leere Cu-d-Orbitale. HOLD bleibt für `973c12d9-d863-5292-8c68-9c80cdacf9e2` → `5851b53a-162b-5c17-9269-510ee54ad846` → `858d56e0-ab8f-51a4-b07e-7d9d94cab8e2`. Der ganze bestehende Nachweis verlangt echte Durchführung; das Fragmentbild ersetzt sie nicht. RP9.1 trägt den koordinativen Kern; Fehling-/Tartratfall und bereitgestelltes qualitatives Orbitalmodell erhalten dadurch keine amtliche Vollzuordnung.', '',
 'Die ganzen aktuellen Titrationsprofile bleiben verbindlich: beim Säure-Base-Ziel Planung, praktische Ausführung, dokumentierte Volumina, Indikatorbegründung und eigene Konzentrationsherleitung; beim EDTA-Ziel e1–e4 plus Konzentrationserwerb. Ein bereitgestellter pH-10-Puffer erzwingt keine zusätzliche starke-Säure-/Base-/Extremverdünnungsrechnung. Die separate Herstellungs-/pH-Routine f1ed, Sicherheitsanwendung und tatsächliche Lösungsherstellung werden nicht aus Papierdaten als erledigt abgeleitet.', '',
 'Eigene Rechnung der Original-EDTA-Daten: T01-C1 ergibt blindwertkorrigiert 19,75 mL, 3,950 mmol/L und 100,133… % Referenzwiederfindung. T01-C2 ergibt 7,520 mmol/L und 100,4 % Aufstockwiederfindung. Neue EDTA-Papierfälle ergeben 4,000 mmol/L beziehungsweise 8,400 mmol/L mit 100,0 % Wiederfindung. Die neuen HCl-/H₂SO₄-Papierfälle ergeben 0,04000 mol/L beziehungsweise 0,01000 mol/L verdünnt und 0,1000 mol/L ursprünglich. Aliquot, Blindwert, End-/Anfangsstand und Originalprobenvolumen bleiben getrennt. Gute Wiederfindung trennt Ca/Mg nicht und beweist keine universelle Matrixgültigkeit oder unabhängige Vorbereitungs-Wiederholbarkeit.', '',
 'Beide Originalfälle bleiben E0/G0: `executed=false`, leere Beobachtungen und `actualPointsAwarded=null`. Alle ausgewählten clean Inhaltsfelder stimmen mit den tatsächlichen Originalmaterialien überein. Lediglich nicht ausgewählte Zusatzkeys verhindern volle Objektgleichheit; deren Urteilswerte wurden nicht verwendet. Historischer `wholeGoalScope` der Originalfälle überschreibt keine aktuelle Applicability.', '',
 'Die drei Annotationen ändern ausschließlich `extendedData.skillPilotAcquisitionExtensions`. Es gibt keine fachlichen Text-/P-/requires-/tag-/Karten-/Bildänderungen oder neue Quelle-Mappings. Die ganzen alten Viewwurzeln und alle alten Target-/Support-/Memoryrollen bleiben erhalten; die Ansichten bleiben CrossStage. Der vorhandene echte Stock-Output unterstützt die benötigte jurisdiction-Sichtbarkeit; dies beweist weder amtliche Vollabdeckung noch Kurs-/Stufenannahme. Kein neuer Compiler-, vollständiger APV-/Build- oder nativer M7-Reviewlauf wurde gestartet.', '',
 'Geschützte Basis: 439 `curricularAtomic` laut Auftrag; unverändert 650 bestehende kanonische Datensätze und 39 Basisansichten. Dieser Review erzeugt keinen neuen nativen Denominator. Keine Normaldaten oder Capsules wurden geändert; Mathematik-/Physik-/Biologie-M7 bleibt unangetastet. Alle neuen Dateien liegen physisch unter `/mnt/e/skillpilot-chemie-L7-20261017/eighteen-foundations-independent-a-v1/`.', '',
 'Die Entscheidung gilt für diese gepinnten, begrenzten Ergänzungen als KI-Kandidat mit nötiger menschlicher Prüfung. Die fünf konkret genannten fehlenden Erwerbsrollen, amtliche Gesamtzuordnung, Themenwahl, Lernendenarbeit, reale Ausführung, native Annahme und M7 bleiben offen.']
md=OUT/'FIRST.independent-a.md'
with md.open('x') as f:f.write('\n'.join(lines)+'\n')

seal={'artifactType':'immutable-FIRST-seal','sealedAtUtc':datetime.now(timezone.utc).isoformat(),'firstArtifacts':[pin(first),pin(md)],
      'supportingArtifacts':review['supportingArtifacts'],'inputPins':pins,'decision':'KEEP','openFullRouteDecision':'HOLD',
      'status':'ai_candidate','humanReviewStatus':'needs_human_review','subsequentEditsRequireNewSuccessor':True,
      'authorAndPeerVerdictsNotConsumedBeforeSeal':True}
sealpath=OUT/'FIRST.seal.json'
with sealpath.open('x') as f:json.dump(seal,f,ensure_ascii=False,indent=2);f.write('\n')
sealpin=pin(sealpath)
with (OUT/'SEAL.sha256').open('x') as f:f.write(sealpin['sha256']+'  FIRST.seal.json\n')
for q in [first,md,sealpath,OUT/'SEAL.sha256']:q.chmod(0o444)
assert all(pin(x['path'])==x for x in seal['firstArtifacts'])
assert json.loads(sealpath.read_text())==seal
print(json.dumps({'firstArtifacts':seal['firstArtifacts'],'seal':sealpin,'decision':review['decision'],'openRoutes':'HOLD','cases':len(cases)},ensure_ascii=False,indent=2))
