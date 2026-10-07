"""Independent B whole-goal/whole-case source judgment, before actual V review."""
import hashlib
import json
from pathlib import Path

OUT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-current391-independent-b-20261007-v1')
AUTHOR = OUT.parent/'biologie-ecology20b-current391-author-v1'
OLD = OUT.parent/'biologie-ecology20-current391-author-v2'
CACHE = Path('/tmp/skillpilot-ecology20b-current-primary-readings')
def read(path): return json.loads(Path(path).read_text())
def write(name,value): (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def ref(path): return {'path':str(path),'sha256':sha(path),'bytes':Path(path).stat().st_size}
def semantic_sha(value): return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

goal_input=AUTHOR/'current20-whole-DEEN-goals.actual.json'
material_input=AUTHOR/'materials-revision-v2/twenty-whole-goals-forty-complete-DEEN-cases.author-v2.json'
whole=read(goal_input)['goals']; materials=read(material_input)['goals']
assert len(whole)==len(materials)==20
assert [r['id'] for r in whole]==[r['goalId'] for r in materials]
assert all(g==m['wholeGoal'] for g,m in zip(whole,materials))
assert all(len(r['cases'])==2 for r in materials)
selection=[1,2,3,4,5,6,7,8,11,13,14,16]
holds=[9,10,12,15,17,18,19,20]
assert read(AUTHOR/'native12.source-bounded.neutral.batch.config.json')['goalIds']==[whole[i-1]['id'] for i in selection]

# Use author receipt only to locate and hash the provided actual sources.
# Findings below come from independently reading the entire indicated sections.
source_locator=read(AUTHOR/'nine-actual-primary-bounded-reading-and-eight-source-HOLD.author.receipt.json')
locations={
 'HE-active-atlas-2025-10':(Path('curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'),CACHE/'HE-active-atlas.txt',[44,45,46,47,48]),
 'BY12-GA':(OLD/'primary-inputs/BY12-GA-official.html',OLD/'primary-inputs/BY12-GA-official.actual-text.txt',[]),
 'BY13-GA':(OLD/'primary-inputs/BY13-GA-official.html',OLD/'primary-inputs/BY13-GA-official.actual-text.txt',[]),
 'BY13-EA':(OLD/'primary-inputs/BY13-EA-official.html',OLD/'primary-inputs/BY13-EA-official.actual-text.txt',[]),
 'NI-SekII-2022':(CACHE/'NI.pdf',CACHE/'NI.txt',[19,23,24]),
 'NW-GO-2022':(CACHE/'NW.pdf',CACHE/'NW.txt',[39,40,49,50]),
 'BB-BE-GO-2022':(CACHE/'BB-BE.pdf',CACHE/'BB-BE.txt',[33,34,35,36]),
 'TH-AHR-2024':(Path('curricula/DE/Gymnasium/input/TH/LP_GY_Biologie_2024.pdf'),CACHE/'TH.txt',[53,54]),
 'SN-current-capture-labelled-2025':(Path('curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-biologie-sachsen-2025.pdf'),CACHE/'SN.txt',[51,59,60]),
}
own_source_findings={
 'HE-active-atlas-2025-10':'Aktuelle gedruckte Seiten 44–48: Q3.1/Q3.2 verbindlich, Q3.3 nicht universell verbindlich. GK/LK gemeinsam: Netz/Energie, qualitative Arealerhebung; LK zusätzlich exponentiell/logistisch, r/K und quantitative Arealerhebung. Torpor/Winterschlaf stehen im LK von Q3.3. Q4.1 ist verbindlich, enthält Klima/Biodiversität/Naturschutzmanagement; LK zusätzlich Fußabdruck. Q4.2 behandelt Sukzession, keinen ausdrücklich universellen LV-Auftrag.',
 'BY12-GA':'Ganzes Lernbereich-4-Verhaltensökologie-Passage gelesen: direkte/indirekte reproduktive Fitness, Kosten/Nutzen, Methoden, Kooperation/Aggression/Territorialität, Partnerwahl und Elternaufwand tragen den evolutionsbiologischen Deutungsanteil. Deutungsfälle ersetzen die vollständigen Methoden- und Fitnessaufträge der Passage nicht.',
 'BY13-GA':'Ganzes 4.1 sowie 4.2/4.3 gelesen: Messung abiotischer Faktoren, qualitative Biozönose, Nahrung/Trophie/Energie und dynamisches Wachstum mit Umweltkapazität; kein ausdrücklich verpflichtendes LV im GA. 4.2 nennt Leistungsbereiche, monetäre Kosten/Nutzen und ihre Grenzen sowie Werteabwägung. Tatsächliche Feld-/Laborleistung ist ausdrücklich Teil anderer bzw. ganzer Quellpflichten.',
 'BY13-EA':'Ganzes 4.1/4.2/4.3 gelesen: quantitative Arealerhebung, r/K, explizites LV-Räuber-Beute-Modell und Wiederfangmethodik im EA. 4.2 Ökosystemleistungen und monetäre/ökologische Abwägung, Fußabdruck; 4.3 Biome, Senken, globale Folgen und Biodiversität. LV-Erweiterung wird hier nur BY13-EA-4.1 zugeordnet. Diese Passagen belegen nicht automatisch alle acht weitergehenden SOURCEHOLD-Facetten.',
 'NI-SekII-2022':'Gedruckte/physische 19,23,24 tatsächlich gelesen: Blattstrukturen Meso-/Xerophyten und eigene Laborleistung; 3.1 echte qualitative/quantitative Feld-/Laborverfahren, 3.2 exponentiell/logistisch und r/K, 3.3 Netz/Biomasse/Energie sowie hormonaktive Stoffe, 3.4 Erhalt/Renaturierung und nachhaltige Abwägung. Die konkreten Kursdifferenzen und tatsächlichen Verfahren werden nicht durch ein allgemeines Modellantwortmaterial aufgehoben.',
 'NW-GO-2022':'39–40 GK sowie 49–50 LK jeweils ganz gelesen: Netz/Energie, klimatische Folgen, Ursache-Wirkungs-Management und qualitative Feldarbeit im GK; LK zusätzlich r/K, ideale Dynamik, quantitative Feldarbeit, hormonaktive Stoffe und Fußabdruck. Kein neuer obligatorischer LV-, stochastischer Metapopulations-, Fitnesskoeffizienten- oder formaler Kipppunktauftrag aus diesen allgemeinen Überschriften.',
 'BB-BE-GO-2022':'Ganzes 3.2.2 auf Seiten 33–36 mit getrennten GK-/zusätzlichen-LK-Spalten gelesen. GK enthält ausdrücklich LV-Regeln, Netz/Energie und qualitative Feldarbeit; LK zusätzlich r/K, exponentiell/logistisch, quantitative Feldarbeit und Fußabdruck. Diese tatsächliche weitere LV-Nennung wird dokumentiert, aber die hier separat verfasste bedingte LV-Erweiterung nicht ungeprüft über BY13EA hinaus als gemeinsamer Fall aktiviert.',
 'TH-AHR-2024':'Gedruckte 47–48/physische 53–54 ganz gelesen: Pflanzen-Wasseranpassung und Grundökologie gemeinsam; zusätzliche erhöhte Anforderungen an Temperaturregeln, Populationsdynamik/rK, Stabilität und Fußabdruck. Exkursion mit realer qualitativer/quantitativer Erhebung bleibt reale Leistung, keine erfundene Modellmessung.',
 'SN-current-capture-labelled-2025':'Physische 51/gedruckte39 ist GK11-Wahlbereich Fließgewässer, keine universelle GK-Pflicht. Physische59–60/gedruckte47–48 ist LK11-Ökologie mit Angepasstheit, Dynamik/rK/LV, Netz/Energie, Naturschutz/Klima/Fußabdruck. Der Capture-Dateiname 2025 macht die sichtbaren Seiten mit Aufdruck 2022 nicht zu neu formulierten 2025-Inhalten.',
}
source_rows=[]
for row in source_locator['sourceEntries']:
    primary,text,pages=locations[row['sourceKey']]
    assert sha(primary)==row['actualPrimarySha256']
    assert sha(text)==row['actualExtractedReadingSha256']
    source_rows.append({'sourceKey':row['sourceKey'],'officialUrl':row['officialUrl'],
                       'actualPrimarySha256':sha(primary),'actualExtractedTextSha256':sha(text),
                       'providedExistingCaptureUsed':True,'freshNetworkFetchClaimed':False,
                       'wholeRelevantSectionsActuallyRead':True,'actualPhysicalPagesRead':pages,
                       'ownIndependentSourceFinding':own_source_findings[row['sourceKey']],
                       'localCacheOnlyWhereApplicable':True,
                       'rawOfficialFullTextCopiedIntoThisDossier':False})
write('nine-primary-whole-passage-source-decisions.independent-b.json',{'sources':source_rows,
      'authorSummaryExposureDisclosure':'Source locator inspection displayed the first HE author summary and a few source-locator script lines. They were not used as independent authority; all relevant original sections were then read directly. No Root-A/peer verdict was read.',
      'wholeSourcePassagesOrNationalMapApproved':False,
      'currentOriginalGoalJurisdictionOrCourseScopeChanged':False,
      'humanApproval':False})

judgments={
 1:('Netz mit zwei Verbraucherwegen, Destruenten und bedingter Populationsrückkopplung; Energieentwertung ohne falschen Energiekreislauf. 12/10 und 15/10 Prozent korrekt, ausdrücklich keine universelle Zehnprozentregel.', ['HE Q3.1 S44–45','BY13 GA/EA 4.1','NI3.2/3.3 S23–24','NW GK39–40/LK49–50'], 'Nicht die gesamte Stoffkreislauf-/Feldpassage; Populationseffekt als begrenzte Modellhypothese.'),
 2:('Beide ganzen Fälle verbinden Blatt-/Wurzel-/Speicher-/Luftgewebebau mit Wasser, Licht bzw. Boden-Sauerstoff; Funktionen und Zielkonflikte artspezifisch, ohne Teleologie oder garantierte Überlebenswirkung.', ['HE Q3.2/Q3.3 S45–46','NI1.5 S19','TH gedruckt47','SN LK47'], 'Keine Behauptung tatsächlich mikroskopierter Blätter oder vollständig absolvierter Laborverfahren; Q3.3 nicht universelle HE-Pflicht.'),
 3:('Morphologische Körper-/Ohr-/Fell-/Bedeckungsmerkmale sind von Stoffwechsel, Durchblutung und Harnregulation getrennt; Klima-/Wasserfolgen beschrieben, Abstammungs-/Verhaltens- und Kontextgrenzen ausdrücklich.', ['HE Q3.3 S46','TH erhöht gedruckt47','SN LK47'], 'Keine universelle Klimaregel oder vermeintlicher Trockenbau aus dem nur physiologisch beschriebenen Süßwassertier.'),
 4:('Zwei ganze gemeinsame dynamische Fälle modellieren diskretes bzw. kontinuierliches logistisches Wachstum; Werte14.5/62.5/100, Raten6.4/6.4/−9.6 und −19.2 korrekt. Änderung/Kapazität/Annahmen getrennt von sicherer Zukunft. Separates LV korrekt P=a/b,N=d/c.', ['HE Q3.1 LK S45/Q4 Einleitung47','BY13 GA/EA4.1','NI3.2 S23','SN LK48'], 'Nur BY13EA4.1 erhält die separate LV-Erweiterung in dieser Kandidatenstruktur; nicht universeller gemeinsamer Fall, kein Verweis auf HEQ4.2 als LV-Pflicht.'),
 5:('Ufer- und Waldmanagement beurteilt konkrete Habitat-/Ressourcenmechanismen und Nutzungskonflikte; begründete Auswahl und vergleichbare Erfolgskontrolle statt behauptetem Erfolg.', ['HE Q4.1 S47','BY13 GA/EA4.2'], 'Modellvergleich erfüllt keinen Nachweis tatsächlich stabilisierter Gemeinschaften oder vollständiger Managementumsetzung.'),
 6:('Täglicher Torpor und saisonaler Winterschlaf mit Torporphasen/Aufwachphasen werden korrekt verglichen; regulierte Absenkung und energetisch kostspielige Erwärmung erklärt. Kein gewöhnlicher Dauerschlaf, keine Universaltemperaturen.', ['HE LK Q3.3 S46'], 'HEQ3.3 ist ein nicht universell verbindliches Themenfeld; keine neue universelle BY-/HE-GK-Torporpflicht.'),
 7:('Gha/Person und Gesamtmaßstab werden korrekt getrennt:4.4→3.8, Netto−0.6, Relationen2.44→2.11; Gesamt36000→39000 und1.8→1.95 trotz Pro-Kopf-Senkung. Biokapazität, Grenzen und zusätzliche soziale/ökologische Kriterien explizit.', ['HE LK Q4.1 S47','BY13EA4.2','NW LK50','TH erhöht48','SN LK48'], 'Fußabdruck nicht nur CO2, nicht vollständige Biodiversitäts-/Wasser-/Gerechtigkeitsbilanz; synthetische Werte.'),
 8:('Beide ganzen Aufgaben verlangen ausdrücklich tatsächliche Felduntersuchung, eigene Rohbefunde, passende Methoden, Einheiten/Aufwand, Auswertung und Aussagegrenzen. Keine erfundene Datenlösung: erwartete Nachweisform steht anstelle nicht vorhandener Ist-Werte.', ['HE Q3.1 S45','BY13 GA/EA4.1','NI3.1 S23','NW GK39/LK50','BBBE3.2.2 S34/36','TH47–48'], 'E1/G1 beurteilt geeignetes Aufgabendesign, keine vollbrachte Schülerleistung. Andere/weitergehende Labor- und quantitative Quellenaufträge bleiben getrennt.'),
 11:('Zwei ganze Fälle bewerten Fortpflanzungs-/Lebenszyklusmerkmale bei Störung bzw. Konkurrenz, Kosten von Nachkommenzahl/Einzelinvestition und Standortabhängigkeit. r/K als vereinfachte Heuristik, keine starre binäre Rangordnung oder Fitness aus Keimrate allein.', ['HE LKQ3.1 S45','BY13EA4.1','NI3.2 S23','NW LK49–50','TH erhöht47','SN LK48'], 'Keine neue GK-Pflicht aus ausdrücklich zusätzlichen LK/rK-Spalten; keine vollständige Lebensgeschichte aus zwei Modellmerkmalen.'),
 13:('Balz, Territorialität und Kooperation werden in beiden ganzen Fällen über Kosten/Nutzen und Fortpflanzungs-/Überlebenskontext evolutionsbiologisch gedeutet; weder Absicht noch Moral noch unbelegte Verwandtenselektion als Ursache.', ['BY12GA ganzer LB4 Verhaltensökologie'], 'Verhaltensdeutung ersetzt nicht tatsächliche Forschungsmethoden, gesamte direkte/indirekte Fitness und alle Quellenverfahren.'),
 14:('Höhenraum/Gipfelgrenze sowie phänologische Überlappung105–120→100–105 korrekt, Klima-/Wasser- und Netzfolgen bedingt. Maßnahmen und Unsicherheit bewertet ohne einheitliche Artenreaktion oder Kausalnachweis aus synthetischen Szenarien.', ['HE Q4.1 S47','BY13EA4.3','NW GK40/LK50','TH48','SN LK48'], 'Keine reale regionale Klimaprognose, kein unvermeidliches Aussterben und keine gesamte Biodiversitäts-/Managementpassage als absolviert.'),
 16:('Beide ganzen Fälle erfassen Leistungen und verbinden monetäre mit ökologischer Bewertung.18000−5000=13000 gegenüber9000 sowie3500−2000=1500 gegenüber3000 korrekt; Grenzen/Doppelzählung/fehlender Geldwert nichtnull und Werteabwägung ausdrücklich.', ['BY13 GA/EA4.2'], 'Geldwerte synthetische vergleichbare Jahresmodelle, keine vollständige Monetarisierung, kein Beweis gemessener realer Dienstleistungswirkung.'),
}
rows=[]
for ordinal in selection:
    material=materials[ordinal-1];goal=whole[ordinal-1]
    rationale,sources,boundary=judgments[ordinal]
    assert all(all(k in case and set(case[k])=={'de','en'} for k in ['material','task','modelAnswer','performanceBoundary']) for case in material['cases'])
    rows.append({'ordinal':ordinal,'goalId':goal['id'],'wholeGoalSemanticSha256':semantic_sha(goal),
                 'wholeDEENTitleDescriptionAndRequiresActuallyRead':True,
                 'wholeDEENCaseIdsActuallyRead':[c['id'] for c in material['cases']],
                 'wholeCasesSemanticSha256':semantic_sha(material['cases']),
                 'wholeGoalAndBothWholeCommonCasesScientificVerdict':'PASS',
                 'ownScientificRationale':rationale,'sourceComponentBindings':sources,
                 'wholeSourceAndActualPerformanceBoundary':boundary,
                 'DEENSemanticParity':'PASS','visualVerdict':'PENDING_ACTUAL_FINAL_RASTER_REVIEW',
                 'nativeDAndPCurrentFinalBindingVerdict':'PENDING',
                 'realLearnerEvidence':False,'humanApproval':False})
write('twelve-whole-DEEN-goal-and-case-science-first.independent-b.json',{
 'wholeGoalInput':ref(goal_input),'wholeMaterialInput':ref(material_input),
 'all20WholeGoalsAnd40WholeCommonCasesRead':True,
 'wholeConditionalBYEAExtensionRead':True,
 'approvedWholeGoalScienceCount':12,'approvedNativeFinalGateCount':0,
 'judgments':rows,
 'holdOrdinals':holds,'strictClosuresClaimed':0,'humanApproval':False})
write('eight-source-HOLDs-and-bounded-findings.independent-b.json',{
 'SOURCEHOLDs':[{'ordinal':i,'goalId':whole[i-1]['id'],'status':'SOURCEHOLD','wholeGoalApproved':False} for i in holds],
 'findings':[
   {'id':'B20b-HOLD10-DE-MATH-01','ordinal':10,'goalId':whole[9]['id'],'caseId':'ecology20b-10-case-1','field':'modelAnswer.de','status':'OPEN_OUTSIDE_APPROVED_TWELVE','finding':'„eine Erwartung darf nicht ganzzahlig sein“ ist mathematisch falsch; Erwartungswerte können ganzzahlig oder nicht ganzzahlig sein. Das EN „need not be an integer“ ist richtig.','requiredCorrection':'„Eine Erwartung muss nicht ganzzahlig sein.“','blocksAnyApprovedTwelveGoal':False},
   {'id':'B20b-LV-CONDITIONAL-ID-01','ordinal':4,'status':'BOUNDED_IDENTITY_NOTE','finding':'Die getrennte Erweiterung trägt außen ihre BY-EA-ID, innen wholeConditionalCase.id denselben String wie gemeinsamer Fall1. Gemeinsame zwei Fälle bleiben vollständig; der separate Körper darf nicht als Ersetzung von gemeinsamem Fall1 oder als dritter gemeinsamer Nachweis serialisiert werden.','commonScientificCaseVerdictAffected':False,'nativeIdentityMustPreserveOuterConditionalScope':True},
 ],
 'noPeerAArtifactsReadBeforeOwnFirstSeal':True,
 'actualImagesNotYetSeenOrApproved':True,
 'noActiveWrites':True,'noNationalOrWholePassageClosure':True,'strictGain':0,'humanApproval':False})
write('science-first.independent-b.seal.json',{
 'role':'First independent B scientific verdict, before Root-A findings and before final raster/native D/P review',
 'reviewer':'/root/chem_four_integration_resume','sameProviderNotProviderDiversity':True,
 'authorOfReviewedTextCasesOrImages':False,
 'wholeGoalInput':ref(goal_input),'wholeMaterialInput':ref(material_input),
 'files':[ref(p) for p in sorted(OUT.iterdir()) if p.is_file() and p.name!='science-first.independent-b.seal.json'],
 'whole12ScientificTextCaseVerdict':'PASS','eightSourceHOLDsRetained':True,
 'wholeGoalFinalD12P12V12Verdict':'PENDING','strictGain':0,'humanApproval':False,'humanTrial':False,'activeWrites':0})
print(json.dumps(ref(OUT/'science-first.independent-b.seal.json')))
