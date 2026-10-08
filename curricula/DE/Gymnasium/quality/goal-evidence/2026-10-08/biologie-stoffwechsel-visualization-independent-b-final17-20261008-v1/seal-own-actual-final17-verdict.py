#!/usr/bin/env python3
"""Own B judgment assembly; never import peer verdicts or change active assets."""
import datetime, hashlib, json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[7]
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
OUT = Path(__file__).resolve().parent
SEAL = OUT / 'visualization-b.final17.first-verdict.seal.json'
assert not SEAL.exists(), 'Immutable first verdict already sealed'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p): return json.loads(p.read_text())
def receipt(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def write(name, obj):
    p = OUT / name
    assert not p.exists(), name
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return receipt(p)

entry = read(BASE / 'biologie-stoffwechsel-nineteen-images-author-20261008-v1/nineteen-images.current-author.entry.json')
whole = read(BASE / 'biologie-stoffwechsel-resume-author-20261008-v1/whole19.current-goals-and-context.author.json')
goals = {g['id']: g for g in whole['wholeGoals']}
profiles = read(BASE / 'biologie-stoffwechsel-resume-author-20261008-v1/P19.exact-retained-v5.author.candidates.json')
cases = read(BASE / 'biologie-stoffwechsel-resume-author-20261008-v1/whole38.exact-retained-v4.DEEN.author.json')
assert len(goals) == 19 and len(profiles['goals']) == 19 and len(cases['cases']) == 38
assert all(c['wholeCurrentGoal'] == goals[c['goalId']] for c in cases['cases'])
assert all(sum(k['points'] for k in c['scoring']['criteria']) == c['scoring']['maximumPoints'] == 10 for c in cases['cases'])

reasons = {
4: ('Zwei getrennte Lichtanregungen heben Elektronen am PSII und PSI an; der blaue Zwischenweg fällt ab und endet im NADPH-Weg. Der violette Weg kehrt vom angeregten PSI über Träger zum PSI zurück und ist mit ATP gekoppelt, ohne eigenen PSII-/Wasserast. Zwei H2O-Piktogramme und ein O2-Paar haben korrekte Atomzahlen.', 'Qualitatives Energie-/Flussmodell: grüne Photosystemkörper und die gebogene Rückführung sind keine numerischen Energieniveaus. H2O→O2 ist eine Stoffherkunftsbeschriftung, keine ausgeglichene Halbreaktion. Protonengradient/ATP-Synthase und NADP+ werden durch die ganzen Fälle erklärt; keine quantitative Stöchiometrie wird aus dem Bild bewertet.'),
5: ('Mesophyll und Bündelscheide sind räumlich getrennt; C4-Transport gibt CO2 am Calvin-Zyklus frei, C3-Rücktransport und ATP-abhängige PEP-Regeneration schließen den Weg. CO2-Piktogramme haben je ein C und zwei O.', 'Drei/vier gleichfarbige Kugeln markieren die Kohlenstoffzahl C3/C4, keine vollständigen PEP-/Organiksäure-Strukturen. Räumliche Kopplung, nicht CAM-Nacht/Tag-Modell; kein universeller C4-Leistungsvorteil behauptet.'),
6: ('13CO2-Puls, Algen und zwei zeitlich getrennte Analysen zeigen frühes 3-PGA-Label und spätere Weitergabe. Orange=13C ist ausdrücklich als Kohlenstoffmarkierung erklärt. Die drei Kugeln des 3-PGA-Schemas bilden sein C3-Kohlenstoffgerüst ab.', 'Keine vollständige 3-PGA-Struktur und kein O2-Tracer. Das spätere geringe frühe Label passt zum ausdrücklich vorhandenen Pulse-Chase-Fall; das Bild allein beweist keine direkte Enzymreihenfolge. Vier/fünf C-Schemata der namenlosen Folgeprodukte sind Stoffklassenmodelle.'),
7: ('I, III und IV fördern H+ von der Matrix in den Intermembranraum. NADH-Elektronen erreichen über diese Route O2; H2O ist Endprodukt. H+ läuft durch ATP-Synthase in die Matrix zurück, räumlich getrennt vom Elektronenfluss.', 'NADH-Einstiegsweg, keine Behauptung eines protonenpumpenden Komplexes II. ADP→ATP ist die Funktionsabkürzung; Phosphat und energetische Kopplung stehen ausdrücklich in den unveränderten ganzen Fällen.'),
9: ('Drei gleichartige Hefeansätze unterscheiden 20/30/40°C; mehr CO2-Blasen im mittleren Modellansatz. Uhr, O2-Kontrolle und separater Ethanolnachweis verhindern die bloße Gleichsetzung von CO2 mit Gärung.', 'Synthetischer Vergleich/Versuchsplan. Keine tatsächliche Durchführung, kein aus drei Temperaturen bewiesenes universelles 30°C-Optimum; Wiederholungen/Nullkontrollen bleiben im ganzen Fall zu begründen.'),
10: ('Hormon und Umweltstoff werden als Schlüssel-Piktogramme an gleichartigen Rezeptoren gezeigt und können getrennt ein Signal aktivieren. Membran und Signalrichtung sind klar.', 'Ein Agonisten-Beispiel, kein Molekülstrukturmodell und keine Behauptung, dass jeder Umweltstoff agonistisch wirkt. Antagonismus, Exposition, Dosis/Zeit und Entwicklung sowie Populationsebene bleiben ganze Aufgabenbestandteile.'),
11: ('Links nimmt die Belastung im gleichartigen Fisch über die Zeit zu; rechts folgen Alge→Kleinkrebs→Fisch. Gleich große Gewebesymbole machen die steigende Konzentration statt bloßer Körpergröße sichtbar.', 'Schadstoffpunkte sind Konzentrationspiktogramme, keine quantitativen realen Gewebedaten. Bioakkumulation und Biomagnifikation sind deutlich getrennt; Schäden oder reales Risikoniveau nicht automatisch belegt.'),
12: ('Drei identisch vernetzte Habitatkarten zeigen unterschiedliche ganzzahlige Besetzung in unabhängigen Läufen; Würfel und verschieden hohe Punkte vermitteln Zufall und Streuung.', 'Die unbezifferten Punkte illustrieren Streuung, keine empirische Verteilung oder unbeschriftete Regressionsbehauptung. Nicht als drei aufeinander folgende Zeitpunkte oder identischer Seed zu lesen; dazu passen Alttext und ganze Fälle.'),
13: ('Die biologische Lupe zeigt trotz äußerlich ähnlicher Tiere reproduktive Trennung; die morphologische diagnostische Unterschiede; die phylogenetische getrennte Linien im gemeinsamen Stammbaum.', 'Drei begründbare Kriterien, keine Behauptung identischer Einteilung oder vollständigen Artnachweises aus einem Genbaum. Fossil-/Asexualitäts-/Hybridgrenzen bleiben in den ganzen Fällen erhalten.'),
14: ('Merkmalsklassen tragen w=0,25/0,5/1; der relative Nachwuchsbeitrag ist 1/2/4. s=1−w sowie s=0,75 und s=0 stimmen rechnerisch. Das Bild ist als Modell bezeichnet.', 'Kein Überlebens-/Stärke- oder universelles Größenvorteilsmodell. Piktogramm-Nachkommen und Kurve zeigen ein vereinfachtes reproduktives Modell; ohne konkrete Umweltbedingung kein reales Selektionsurteil.'),
17: ('Quelle mit positivem und Senke mit negativem lokalem Reproduktionsbeitrag sind verbunden; eine getrennte Kolonisationsroute führt von der Quelle zur freien geeigneten Fläche.', 'Quelle/Senke werden nicht nur aus Größe/Besetzung abgeleitet. Plus/minus bezeichnet lokale Bilanz; Zuwanderung hält eine Senke, ohne ihre lokale Reproduktion positiv zu machen. Nicht jede freie Fläche muss ungeeignet sein.'),
18: ('Klarer und trüber See, zunehmende Nährstofflast und stärkere Reduktion sind verschieden gerichtete Übergänge. Der Modellkasten setzt Vorwärtsschwelle6 und Rückkehr unter3 auseinander.', 'Explizite dimensionslose Modellwerte, keine allgemeingültigen realen Nährstoff-Grenzwerte. Unterschiedliche Hin-/Rückschwelle zeigt Hysterese; weder bloße glatte lineare Verschlechterung noch automatische Rückkehr beim ersten kleinen Rückgang.'),
19: ('Beobachtungspunkte, fallende Modelllinie und vertikale Restabweichung sind auseinandergehalten. Vergleichbare Probeflächen und15/25°C zeigen den ökologischen Datenkontext. Korrelation≠Ursache ist ausdrücklich sichtbar.', 'Laptop ist Modellierungswerkzeug, keine echte ausgeführte Bioinformatikmessung. Residuum vergleicht Beobachtung mit Vorhersage; es ersetzt keine Ursachenprüfung. Das Bild ist ein Kontextbeispiel, keine Vollabdeckung aller Bioinformatikverfahren.'),
21: ('RuBP erreicht Rubisco; CO2-Fixierung und O2-Oxygenierung sind getrennte Abzweige. Der Rückgewinnungsweg zeigt ATP-Verbrauch und CO2-Freisetzung statt produktiver Kohlenstofffixierung.', 'Abstrakte Stoff-/Enzymknoten, kein atomarer Rubisco-Reaktionsmechanismus. Ein winziger zusätzlicher Strich am oberen CO2-Schriftzug ist ein typografischer Rasterartefakt; Token bleibt am Original/680/360 eindeutig CO2, links und unten stehen weitere klare CO2-Token. Kein zusätzlicher chemischer Stoff/keine Ladung wird plausibel codiert; nicht blockierend.'),
22: ('Getrennte CO2-Zufuhr, ATP/NADPH aus Lichtreaktionen sowie Enzymaktivität beeinflussen den Calvin-Zyklus. Der Zyklus liegt im Stroma, nicht innerhalb eines Thylakoidstapels.', 'Enzymschalter und Thermometer sind Regelungs-Piktogramme. Kein universell monotones Temperaturgesetz und keine unbegrenzte ATP-Beschleunigung behauptet; Limitierung, Enzymzustände und Energieversorgung werden in ganzen Fällen geprüft.'),
23: ('Der tatsächlich neue v2-Raster ersetzt die falschen strukturähnlichen Motive durch benannte einfarbige Stoffknoten. Glucose→Pyruvat→Acetyl-CoA verzweigt zu Citratzyklus/Lipidaufbau; ATP-Signallinie endet als Hemmbalken an einem frühen Enzymschritt. Sichtbarer Titel Schematische Stoffknoten.', 'Keine vermeintlichen C2/O2-Pyruvat- oder falschen Glucoseringsysteme mehr. Nicht vollständige Molekülstrukturen, kein genauer organellärer Transportplan; Hintergrundmitochondrium ist thematisches Ornament. V1-Hold ist nur für diesen neuen tatsächlichen v2-Hash aufgelöst.'),
24: ('Gleiche Ausgangsfunktion und gleicher Störungszeitpunkt: A fällt wenig und bleibt darunter, B fällt deutlich und kehrt zum Ausgangsniveau zurück. Funktion/Zeit und beide Kurven sind klar.', 'Widerstand und Rückkehrfähigkeit sind getrennt. B hat die steilere Erholung und erreicht sein Ausgangsniveau; A wird nicht wegen seines kleinen Abfalls automatisch als vollständig resilient gewertet. Schematische Funktionskurven, keine universellen Zeitkonstanten.'),
}
items=[]; carried=[]; failures=[]; checked=0
for row in entry['images']:
    p=ROOT/row['assetPath']; actual=receipt(p)
    assert actual['sha256']==row['sha256'].removeprefix('sha256:') and actual['bytes']==row['bytes']
    inp=read(ROOT/row['wholeCurrentGoalInputPath'])
    assert inp['wholeCurrentGoal']==goals[row['goalId']]
    if row['ordinal'] in (15,20):
        assert actual['sha256'] == {15:'4dcb2ad8dfd948d099a254ab4be9feb5d72e088ebb69531430ee9cc0cd0e7916',20:'842e672cd440c42bb4d503124a8e634533a5d45e4ef4c1fd2345d5c92ee5963d'}[row['ordinal']]
        old=read(BASE/'biologie-stoffwechsel-visualization-independent-b-first3-20261008-v1/visualization3.actual-first-verdict.independent-b.json')
        carried.append({'ordinal':row['ordinal'],'goalId':row['goalId'],'actualRaster':actual,'decision':'KEEP_RETAINED_EXACT_PRIOR_B','priorVerdict':receipt(BASE/'biologie-stoffwechsel-visualization-independent-b-first3-20261008-v1/visualization3.actual-first-verdict.independent-b.json'),'newReviewClaim':False})
        continue
    ord=row['ordinal']; reason,boundary=reasons[ord]
    views=[receipt(OUT/f'actual-size-views/{ord}.{w}.png') for w in (360,680)]
    with Image.open(p) as im: size=list(im.size); mode=im.mode
    items.append({'ordinal':ord,'goalId':row['goalId'],'title':row['title'],'decision':'KEEP','actualRaster':actual,'dimensions':size,'mode':mode,'actuallyInspectedOriginal':True,'actuallyInspected360And680':True,'inspectionViews':views,'actualScientificAndRepresentationEvidence':reason,'modelAndClaimBoundary':boundary,'legibility360':'Main relationship, arrowheads, named anchors and main labels remain visible. Small supporting labels are read at680/original; this is a learner anchor, not a hidden formula-only assessment.','legibility680':'All semantic labels and comparative flows are legible without cropping or overlap.','perspective':'Spatial locations are schematic; ecological photographs/real laboratory results are not claimed.','descriptionDe':row['descriptionDe'],'altTextDe':row['altTextDe'],'metadataVerdict':'MATCHES_ACTUAL_RASTER; exact provider recorded and unavailable model not invented; PNG native bytes, dimensions and hash verified.','provider':row['provider'],'model':row['model'],'generationIsApproval':False,'wholeGoalExact':True,'wholeProfileRetained':True,'wholeCasesRetained':True,'newScienceReviewClaim':False,'newAImageVerdictsRead':False,'humanApproval':False,'humanTrial':False})

def walk(x):
    global checked
    if isinstance(x,dict):
        if isinstance(x.get('path'),str) and isinstance(x.get('sha256'),str):
            p=ROOT/x['path']; expected=x['sha256'].removeprefix('sha256:')
            if p.is_file():
                checked+=1
                if hashlib.sha256(p.read_bytes()).hexdigest()!=expected: failures.append(str(p.relative_to(ROOT)))
        for v in x.values(): walk(v)
    elif isinstance(x,list):
        for v in x: walk(v)
for p in sorted(OUT.glob('*.freeze.json')): walk(read(p))
assert not failures, failures
record=write('actual-final17-and-retained2.visualization.independent-b.first-verdict.json',{'schemaVersion':1,'createdAt':now,'role':'GENUINE_INDEPENDENT_B_ACTUAL_PNG_FIRST_VERDICT','reviewerIdentity':'/root/curricula_live_diagnosis/zip64_loader_source','authorEntry':receipt(BASE/'biologie-stoffwechsel-nineteen-images-author-20261008-v1/nineteen-images.current-author.entry.json'),'wholeGoalCount':19,'profilesRetained':19,'wholeDEENCasesRetained':38,'individuallyActuallyReviewedNow':items,'priorExactKEEPCarryForward':carried,'summary':{'newActualKEEP':17,'newActualHOLD':0,'priorExactKEEP':2,'current19ActualKEEP':19,'v1FindingResolvedForNewV2Only':'BIO-V-B-23-STRUCTURE-LIKE-PICTOGRAMS-V1','nonblockingTypographyOrdinals':[21]},'remainingHolds':['Excluded ordinals1/2/3/8/16','Legacy NeuroGK2','Actual practical execution beyond synthetic planning/evaluation','Whole regional/BY/NI obligation coverage','Native D/P and exact new page/context binding pending separate review'],'inputReceiptChecks':checked,'inputReceiptFailures':failures,'newAOutputsReadBeforeOwnSeal':False,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})
write('neutral-final17-visualization-independent-b-handoff.entry.json',{'schemaVersion':1,'createdAt':now,'role':'NEUTRAL_INDEPENDENT_B_CURRENT19_IMAGE_HANDOFF','firstVerdict':record,'firstVerdictSealPath':str(SEAL.relative_to(ROOT)),'summary':{'newActualKEEP':17,'priorExactKEEP':2,'current19KEEP':19,'HOLD':0,'corrected23V2Accepted':True},'newAOutputsReadBeforeOwnSeal':False,'nativeDP':'PENDING_SEPARATE_ACTUAL_PAGE_REVIEW','activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})
(OUT/'README.md').write_text('# Independent B actual visualization verdict\n\n17 actual new rasters (16 previously unseen plus corrected23v2) independently inspected at original,360 and680 px. Ordinals15/20 retain the earlier exact-byte B KEEP. All current19 have V KEEP. The old23v1 finding is resolved only for the new23v2 raster. No peer A judgments were read.\n\nWhole19 goals,19 valid profiles and38 whole v4 DE/EN cases are bound unchanged. Image models remain bounded: no actual experiments, regional whole-coverage or strict closures are asserted. Tiny upper CO2 typography in21 is recorded as a nonblocking artifact, with all CO2 meanings still unambiguous. Native D/P requires separate actual-page review.\n')
outputs=[receipt(p) for p in sorted(OUT.rglob('*')) if p.is_file() and p!=SEAL]
SEAL.write_text(json.dumps({'schemaVersion':1,'sealedAt':now,'role':'IMMUTABLE_INDEPENDENT_B_FINAL17_FIRST_VISUAL_VERDICT_SEAL','newAImageVerdictsRead':False,'ownFirstVerdictBeforePeerComparison':True,'outputCount':len(outputs),'outputs':outputs,'current19KEEP':19,'newActualKEEP':17,'priorExactKEEP':2,'HOLD':0,'strictGain':0,'humanApproval':False,'humanTrial':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'seal':receipt(SEAL),'outputs':len(outputs),'inputChecks':checked,'failures':failures,'newActualKEEP':17,'priorKEEP':2,'current19KEEP':19}))
