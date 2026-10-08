# SPDX-License-Identifier: Apache-2.0
"""Record actual independent A judgments; no author or current peer verdict copy."""
import copy
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path.cwd()
OWN=Path(__file__).resolve().parent
AUTHOR=OWN.parent/'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1'
SCIENCE=OWN.parent/'biologie-he-q4-evolution-eighteen-whole-science-independent-a-20261008-v1'
SOURCE=OWN.parent/'biologie-he-evolution-eighteen-decision-locators-independent-a-20261008-v3'
ORIGINAL=OWN.parent/'biologie-he-q4-evolution-eighteen-whole-science-author-20261008-v1'
NATIVE=AUTHOR/'native-eighteen-author/eighteen'

def read(p): return json.loads(p.read_text())
def lines(p): return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,v):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def verify(b,base=ROOT):
    p=base/b['path']; actual=bind(p)
    assert actual['sha256']==b['sha256'].removeprefix('sha256:') and actual['bytes']==b['bytes'],p
    return actual
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+','',s)

# Actual full PNG, 360px, 680px and full native physical page were personally
# viewed for EACH goal in this independent agent turn. These are those views'
# scientific reasons, not author image generation or technical rendering claims.
OBS={
'0f4f3635-c0e9-517c-9a9d-1635b0d5fab5':'Vier diploide Modellindividuen AA, AA, Aa und aa ergeben fünf A- und drei a-Kopien von acht. Genpoolpfeile verbinden ausdrücklich Allelkopien statt Phänotypen. Die großen A/a-Symbole, Individuen und Sammelrichtung bleiben bei360/680 sichtbar; keine Verwechslung von Allel-, Genotyp- und Phänotypfrequenz. Die native Seite erhält Genmutationsvorgänger und die zwei Populationsmodelle als getrennte Nachfolger.',
'3accc03b-3daf-5119-9f33-93af6f709919':'Der schematische Punnett-Vergleich bei p=q=0,5 zeigt AA, Aa, Aa, aa und die korrekte Genotypverteilung1:2:1. Beobachtungsbalken und Frage markieren einen zu prüfenden Vergleich, keine zwangsläufige Gleichgewichtsverteilung jeder realen Population. Die Hauptsymbole und Modellverteilung sind bei360/680 erkennbar; kleine Zusatzhinweise sind kein Ersatz für Bedingungen im ganzen Fall. Die native Seite bewahrt das Allelfrequenzziel als Voraussetzung.',
'05a4f839-6b10-581e-a942-ba4497e6a279':'Buntes großes Allelreservoir, zufällige Engpass-Stichprobe und veränderte Folgepopulation illustrieren den Flaschenhals; kleine Gründerstichprobe und Insel zeigen getrennt den Gründereffekt. Würfel und kann-Hinweis markieren Zufall statt zielgerichteter Verbesserung oder garantierter Fixierung. Für alle Allele gleich bezeichnet neutrale Auswahlchance je Kopie, nicht gleiche Häufigkeit jeder Allelart. Beide Motive und Pfeile bleiben360/680 erkennbar; die native Seite erhält Allelfrequenzen als Voraussetzung.',
'7008979d-7890-5f7b-ad07-27b8bb597cbe':'Fossiler Vordergliedmaßenbefund und Mensch/Hund/Delfin zeigen dasselbe farbcodierte Lagegerüst: ein proximaler Knochen, zwei distale, Handwurzel und Finger. Das stützt Lagehomologie trotz verschiedener Funktion, keine unmittelbare direkte Abstammung aus einem Einzelfossil. Endosymbiose bleibt ein anderer Teil des ganzen Zieles; das Bild darf diesen ausgewählten Beleg illustrieren. Fossil, drei Gliedmaßen und Farbmuster bleiben360/680 sichtbar; der ganze native Zieltext erhält sämtliche Belegformen.',
'002543f9-2d14-5c57-99b4-fb4bf7e53734':'Oben trennt eine geographische Barriere eine Ausgangspopulation, unten bleiben unterschiedliche Ressourcennischen im gleichen Raum. Zeitpfeile und Gruppenfarben sind schematische Hypothesen über verringerten Genfluss, keine sofortige individuelle Anpassung und kein Artbeweis allein durch Farbe. Die beiden räumlichen Kontraste bleiben360/680 erkennbar; ganze Fälle prüfen zusätzlich reproduktive Isolation. Die native Seite enthält beide Mechanismen mit dem unveränderten Evidenzvorgänger.',
'302c6d6d-bf10-5dbc-adda-65e4b5c63e49':'Ein verzweigter hypothetischer Stammbaum verbindet gemeinsame Vorfahren und verschiedene Fossil-/Menschenlinien; diverse heutige Menschen stehen auf einem gemeinsamen Endzweig. Keine lebenden Schimpansen als direkte menschliche Vorfahren, keine lineare Fortschrittsleiter und keine Hierarchie heutiger Bevölkerungen. Afrika und Verbreitungspfeile sind schematische Hypothesen, keine exakten datierten Routen. Das Fossilpapier hat keine falsch orientierte Pflichtschrift. Stammbaum, Fossilien und Karte bleiben360/680 sichtbar; native Seite zeigt ausdrücklich Fossilgeschichte und hypothetische Stammbäume.',
'0c999ebb-b4cb-5da3-90a1-69e3c6614db1':'Gemeinsamer Werkzeuggebrauch, Sprechen und weitergegebene Idee verbinden soziales Lernen, Koordination und Kulturwissen. Werkzeug und Gespräch sind keine genetische Übertragung erworbener Gegenstände oder ein genauer Sprachursprungsnachweis. Die Gruppenhandlung und Kommunikationssymbole bleiben360/680 deutlich, ohne lesepflichtige Kleinschrift. Die native Seite hält Werkzeuggebrauch und Sprachentwicklung als komplementäre Dimensionen eines Darstellungskompetenzziels zusammen.',
'a305bb18-69a3-5d92-9cfa-abf94b2eb051':'Fellpflege von Primaten wird beobachtet; Fruchtressourcen stehen als äußeres Einflussmodell, Gehirn/Herz als vereinfachtes inneres Zustandsmodell daneben. Das behauptet keine nachgewiesene einzelne Hormonursache oder automatische Übertragung auf menschliche Normen. Das Heft ist zum Beobachter ausgerichtet und trägt nur schematische Striche. Verhalten, Ressourcen und Zustandsmodelle sind360/680 sichtbar; native Seite bleibt beim Ursachenanteil der breiteren Primatenquelle.',
'c5ffd083-2596-5726-ac1c-a8e2c06c1139':'Pollenfluss zwischen verschiedenen Pflanzen, intermediäre Modellblüte und Fragezeichen zeigen Hybridisierung als möglichen Artbildungsmechanismus. Gestrichelte Verbindung ergänzt mögliche Genflusswege, ohne jedes Hybridindividuum als etablierte fertile neue Art oder eine universelle Blütenfarbvererbung auszugeben. Fragenzeichen und Eltern-/Hybridkontrast bleiben360/680 sichtbar. Ganze native Beschreibung verlangt einen gemeinsamen Vergleich von allopatrischer, sympatrischer und Hybridartbildung; das Bild illustriert deren besondere Hybridkomponente.',
'80b42b5f-4b20-5035-907f-974a4a88618b':'Verzweigung von einem gemeinsamen Ursprung, Veränderungen auf beiden Linien, Sequenzvergleich, Zeitachse und Fossilkalibrierung bilden eine bedingte molekulare Uhr. Fragezeichen markieren Schätzung statt universeller exakter Rate; die Sterne sind symbolische Veränderungen, keine vollständig gezählte Alignment-Tabelle. Kein heutiges Taxon wird unmittelbarer Vorfahr des anderen. Beide Zweige und Kalibrierungs-/Zeitmotiv bleiben360/680 erkennbar; die ganzen Fälle definieren Rate je Ast gegenüber paarweiser Rate ausdrücklich.',
'3718c6fe-0b58-5ff7-996c-25ca45b609d2':'Zwei konkurrierende Stammbäume für dieselben drei nummerierten Fossiltypen gruppieren1/2 beziehungsweise2/3 verschieden. Fragezeichen und wechselseitiger Vergleich entsprechen einer Hypothesendiskussion; kein fester Stammbaum aus äußerer Schädelähnlichkeit allein. Fossilien, Werkzeuge und Gespräch ergänzen kulturelle Befunde, ohne sichere Werkzeugzuordnung zu behaupten. Das Schreibheft ist der handelnden Person zugewandt; beide Topologien und Frage bleiben360/680 sichtbar. Ganze native Seite enthält das vertiefte Hypothesenziel und seinen Grundlagennachfolger-Kontext.',
'934d496d-eda4-5835-96d6-389885b93a51':'Historische Quellenprüfung, durchgestrichene Menschen-Rangtreppe und gleiche Waagschalen neben verschiedenen Menschen lehnen die biologische Rechtfertigung von Würdehierarchien ab. Die Jahresangabe1933–1945 und das historische Foto sind zur lesenden Person am Buch ausgerichtet, für den externen Betrachter daher um180Grad gedreht; kein Perspektivfehler. Menschenwürde wird nicht aus Fitness hergeleitet. Quellenprüfung, rotes Kreuz und Gleichwertigkeitsmotiv bleiben360/680 erkennbar; native Seite bewahrt Q2.2 als fakultativen, aber aktuellen kanonischen Zielbereich.',
'6bfcb8da-e337-5395-a50a-848f6a3abf4d':'Drei Panels zeigen dieselbe gestrichelte Ausgangsverteilung: stabilisierende Selektion verengt die Mitte, gerichtete verschiebt einen Gipfel, disruptive begünstigt beide Extreme. Häufigkeits-/Schnabelgrößenachsen und ursprüngliche/spätere Verteilung sind fachlich zugeordnet. Schematische Kurven sind keine gemessenen normalisierten Zahlen und keine Garantie einer neuen Art. Die Hauptkurven und drei Überschriften bleiben360/680 klar; kleinere Bildtexte sind ergänzend. Native Seite zeigt genau die drei verlangten Selektionsformen.',
'28b4ae51-e3f7-5abc-a363-022114f50f0f':'Das diskrete Nachbarschaftsnetz besitzt zwei Gipfel: der blaue adaptive Pfad erreicht einen lokalen Gipfel, zwischen diesem und dem höheren liegen zunächst niedrigere Fitnesszustände. Vertikalachse bedeutet Fitness, die Verbindungslinien sind mögliche Nachbarschaften statt phylogenetischer Abstammungszweige. Frage und andere Umwelten markieren die Grenzen reiner Aufwärtspfade; kein zwingendes evolutionäres Erreichen des globalen Maximums. Gipfel, Tal und Pfad bleiben360/680 deutlich; native Seite behält die Abhängigkeit von Selektionsmodi.',
'9fb0a26b-abb0-505f-b92a-320b2e6290e9':'Blütenröhre und Bestäuber-Rüssel werden zusammen mit Variation beider Partner und entgegengesetzten Selektionspfeilen gezeigt. Fragezeichen fordert weitere Evidenz; die passende Form allein wird nicht zur bewiesenen kausalen Koevolutionsgeschichte. Das Beispiel ist Bestäubung, ohne Räuber-Beute und Parasitismus zusätzlich als Pflichtillustrationen aufzuzwingen. Beide Partner, Variationen und Rückpfeile bleiben360/680 sichtbar; ganze native Zielbeschreibung erhält die Alternativbeispiele.',
'34b06272-e997-59af-b12b-0a5e05d7d45f':'Pfauenbalz und mögliche Partnerwahl stehen einer Waage mit Fortpflanzungsattraktivität, Energie, Bewegung und Überleben gegenüber. Das zeigt Fitnesskosten und mögliche Reproduktionserträge statt Schmuck gleich bessere Gesamtfitness; gleiche Waagschalen sind eine Abwägungsmetapher, keine gemessene Gleichheit. Kein menschliches Geschlechterrollenmodell oder eindeutiger Vaterschaftsnachweis aus dem Nest. Pfau, Wahl- und Kostenmotive bleiben360/680 sichtbar; Beobachtungsheft ist zum Leser ausgerichtet. Native Seite bleibt beim erklärenden Fitnessfolgenziel.',
'35b016d8-ed2c-570c-ab64-ac39f8f962b2':'Morphologische Merkmalsmatrix und farbcodierte Sequenzmatrix laufen auf dieselbe als Hypothese bezeichnete Topologie mit1/2 als Schwestergruppe zu. Geteiltes Merkmal und höhere molekulare Übereinstimmung entsprechen dieser Gruppierung; Fragezeichen trennt Modellhypothese von gesicherter direkter Abstammung. Ohne angegebenen Außengruppenzustand wird keine vollständige Polaritätsanalyse behauptet. Matrizen und Verzweigung bleiben360/680 unterscheidbar. Native Seite zeigt die korrigierte Kladistik/Stammbaumkonstruktion, nicht die alte Tippfehlerfassung.',
'4abd762a-3c24-5909-a5d4-c8dfbcfe6275':'Die sichtbaren fünf Positionen ergeben AB=1, BC=2, AC=3; die engere A/B-Gruppierung passt damit zur gezeigten Hypothese. Beide Bäume haben gemeinsame Vorfahren und heutige Endtaxa, ohne A als Vorfahren vonB oder eine exakte Uhr zu behaupten. Kurzsequenz und Frage markieren Modellgrenzen; einzelne Strichmarken sind keine vollständige Substitutionsrekonstruktion. Sequenzzeichen, Taxa und Verzweigung bleiben bei360/680 lesbar. Native Seite hält die Voraussetzung Kladistik und das interpretierende Ziel getrennt von bloßem Formelabruf.'}

started=datetime.now(timezone.utc).isoformat()
entry=read(AUTHOR/'neutral-eighteen-current-raster-native-author-review.entry.json')
author_seal=AUTHOR/'eighteen-current204-raster-native-author.first-input.freeze.json'
assert sha(author_seal)=='9cc7c31975a3ede287fb4ec0350c7f2f4a75bf44b9445df31a264b5195d59680'
af=read(author_seal); author_inputs=af['ownFiles']+af['authorizedInactiveAtlasFiles']
assert len(author_inputs)==307
for b in author_inputs: verify(b)
prior_seals=[]
for base,name,expected in [(SCIENCE,'independent-a.final-source-science.freeze.json','2db378057d882436d594beff245d6ce3f716ad2b4fcafdcc27c15109a9e11812'),(SOURCE,'independent-a.decision-locators-v3.final.freeze.json','d2da6ffcf26a9f3faefeb09590e59748cce12fb1554b2ae5da655a952368de3d')]:
    seal=base/name; assert sha(seal)==expected
    files=read(seal)['files']
    for b in files: verify(b,base)
    prior_seals.append({'seal':bind(seal),'actualExactFiles':len(files)})
science={r['goalId']:r for r in read(SCIENCE/'eighteen-whole-source-science-independent-a.final-judgment.json')['judgments']}
source=read(SOURCE/'independent-a.decision-locators-v3.final-receipt.json')
sources={r['goalId']:r for r in source['scientificDecisionByGoal']}
cases_path=ROOT/entry['whole36OriginalExactCaseJSON']; cases=read(cases_path)
assert sha(cases_path)==sha(ORIGINAL/cases_path.name)
assert len(cases['wholeCases'])==36
whole={g['id']:g for g in read(ROOT/entry['wholeGoals'])['goals']}
config=read(AUTHOR/'positive/P18.current-whole.actual-raster-author.inactive.config.json')
future={g['id']:g for g in read(ROOT/config['landscapePath'])['goals']}
profiles={r['goalId']:r for r in lines(ROOT/entry['wholeP18CurrentRasterAIProfiles'])}
old_profiles={r['goalId']:r for r in lines(SCIENCE/'P18.retained-sixteen-plus-two-targeted.review.jsonl')}
images={r['goalId']:r for r in read(AUTHOR/'selected-eighteen-images.current-whole-exact.json')['images']}
pages={r['goalId']:r for r in read(NATIVE/'book-model.json')['pages']}
actual=read(ROOT/entry['actualPhysicalPagesAnd36Widths'])
physical={r['goalId']:r for r in actual['actualPhysicalPages']}
captures={r['goalId']:r for r in actual['captures']}
assert len(whole)==len(profiles)==len(images)==len(pages)==len(OBS)==18
assert len(future)==476
pdf=subprocess.run(['pdftotext','-layout',str(ROOT/entry['nativeWholePDF']),'-'],capture_output=True,text=True)
assert pdf.returncode==0,pdf.stderr
with (OWN/'actual-eighteen-whole-native-text.independent-a.txt').open('x') as f:f.write(pdf.stdout)
pdf_pages=pdf.stdout.split('\f');assert len([p for p in pdf_pages if p.strip()])==20
records=[]
for gid in pages:
    g=whole[gid];p=pages[gid];profile=profiles[gid];im=images[gid];phys=physical[gid]
    assert g==future[gid]
    retained=copy.deepcopy(g);retained.pop('resourceLinks',None)
    assert retained==science[gid]['exactAcceptedWholeGoal']
    assert profile['profile']==old_profiles[gid]['profile'] and profile['profileFingerprint']==old_profiles[gid]['profileFingerprint']==science[gid]['profileFingerprintReviewed']
    assert profile['status']=='needs_human_review' and profile['reviewAuthority']=='ai_candidate'
    assert profile['evidenceLevel']=='E1' and profile['maximumClaimScope']=='G1'
    assert sha(ROOT/im['selectedPath'])==im['sha256']==sha(ROOT/im['actualOriginalPNG']['path'])
    assert p['title']==g['title'] and p['description']==g['description']
    assert p['visualization']['originalDigest']=='sha256:'+im['sha256']
    assert set(r['goalId'] for r in p['requires']+p['externalPrerequisites'])==set(g['requires'])
    assert phys['physicalPage']==p['pageNumber']+2
    txt=pdf_pages[phys['physicalPage']-1]
    assert norm(g['title']) in norm(txt) and norm(g['description']) in norm(txt)
    assert re.search(r'Lernziel-ID\s+'+re.escape(gid),txt)
    assert len(re.findall(r'Lernziel-ID\s+[a-f0-9-]{36}',txt))==1
    verify(phys['actualPhysicalPNG'])
    cap=captures[gid];assert cap['sourceSha256']==im['sha256']
    assert [c['width'] for c in cap['captures']]==[360,680]
    for c in cap['captures']:
        assert c['measured']['renderedWidth']==c['width'] and c['measured']['objectFit']=='contain'
        assert sha(ROOT/c['path'])==c['sha256']
    whole_cases=[c for c in cases['wholeCases'] if c['goalId']==gid];assert len(whole_cases)==2
    records.append({'goalId':gid,'wholeGoalBody':g,'descriptionDecision':'KEEP','wholeScienceDecision':'KEEP genuine unchanged previous whole review',
        'wholeScienceReason':science[gid]['rationale'],'genuineRetainedBoundedSourceDecision':sources[gid],
        'wholePDecision':'PASS scoped E1/G1 synthetic public cases; needs_human_review, no learner performance',
        'wholePositiveProfileRecord':profile,'wholeDEENCases':whole_cases,'profileBodyAnd36CasesExactToOwnGenuineScience':True,
        'actualVisualizationDecision':'KEEP','actualFullPNG':bind(ROOT/im['selectedPath']),
        'actualWidthCaptures':[bind(ROOT/c['path']) for c in cap['captures']],
        'actualCompleteNativePage':{'physicalPage':phys['physicalPage'],**phys['actualPhysicalPNG']},
        'actualNativePageFingerprint':p['pageFingerprint'],'substantiveActualVisualObservationsDe':OBS[gid],
        'altCorrespondence':p['visualization']['altText'],'findings':[],
        'sourceScope':'Own genuinely reviewed source-v3 bounded operationalization; applicability is not universal original-operator approval.',
        'humanApproval':False,'realLearnerEvidence':False})
before={g['id']:g for g in read(AUTHOR/'before/canonical.json')['goals']}
assert len(before)==476 and set(before)==set(future)
assert all(g==future[gid] for gid,g in before.items() if gid not in whole)
before_pages={r['goalId']:r for r in read(AUTHOR/'native-eighteen-author/full392.current-before.real-loader.book-model.json')['pages']}
after_pages={r['goalId']:r for r in read(AUTHOR/'native-eighteen-author/full392.current-after.actual-raster.book-model.json')['pages']}
assert len(before_pages)==len(after_pages)==392
assert all(p==after_pages[gid] for gid,p in before_pages.items() if gid not in whole)
guards=read(AUTHOR/'current204-whole-eighteen-author-guards.technical.json')
assert len(guards['baselineStrictGoalIds204'])==204
assert all(before_pages[gid]==after_pages[gid] for gid in guards['baselineStrictGoalIds204'])
retained_am=[]
patched={'302c6d6d-bf10-5dbc-adda-65e4b5c63e49','35b016d8-ed2c-570c-ab64-ac39f8f962b2'}
for am in guards['currentAM']:
    old=lines(ROOT/am['actualCurrentReview']['path']);new=lines(ROOT/am['futureImmutableReview']['path'])
    by={r['goalId']:r for r in new};assert len(old)==len(new)==392
    assert all(r==by[r['goalId']] for r in old if r['goalId'] not in patched)
    retained_am.append({'kind':am['kind'],'390RowsExact':True,'16SelectedUnchangedRowsExact':True,
       '2TargetedPreviouslyGenuinelyReviewedWordCorrectionRows':sorted(patched),'newScienceAMReviewClaimed':False})
write(OWN/'actual-eighteen-current-D-P-V.independent-a.first.verdict.json',{
    'schemaVersion':1,'recordedAt':datetime.now(timezone.utc).isoformat(),'role':'Genuine independent A whole18 current final raster/native review',
    'records':records,'DKEEP':18,'PScopedSciencePASS':18,'VActualKEEP':18,'blockingFindings':[],
    'actualViews':{'fullPNGs':18,'width360':18,'width680':18,'wholeNativePDFPages':18},
    'genuinePriorOwnScienceAndSourceSeals':prior_seals,'actualAuthor307FilesExact':True,
    'newScienceVersusBindings':'No historical science restart:16 unchanged and2 already independently corrected goal bodies,36 whole cases and18 profile bodies exact. Actual18 images/native page/context/source bindings personally checked now.',
    'sourceBoundary':'15 bounded curricular components and3 nonmandatory named specializations retained. OptionalQ2.2 stays in current denominator. Full144 source approval and NeuroGK2 remain HOLD; none inferred from raw applicability or generic process operators.',
    'whole476BodiesOther458Exact':True,'whole392PagesOther374Exact':True,'current204StrictWholeNativePagesExact':True,'retainedAM':retained_am,
    'profileStatus':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
    'twoCasesBoundary':'Meaningful independent variation may occur within one genuine multi-step response; no extra-task quota after sufficient evidence.',
    'actualPNGFormats':'Friendly comic PNG1672x941, wide. Actual360/680 inspected; main motif and important details clear without requiring decorative tiny text.',
    'imageGenerationIsApproval':False,'realDeviceAcceptance':False,'peerCurrentFinalBFilesRead':0,'peerCurrentFinalBReadBeforeFirstSeal':False,
    'ordinaryRasterPCLI':'pending_installation; native exact-raster semantic API is the valid current scoped check',
    'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False,'realLearnerEvidence':False,'performedExperiments':0})
campaign=read(NATIVE/'round-a/description-review-campaign.json');inp=read(NATIVE/'round-a/description-review-input.json');bundle=read(NATIVE/'round-a/review-bundle-manifest.json')
assert campaign['goalCount']==campaign['batchSize']==18 and len(campaign['batches'])==1
batch=campaign['batches'][0];run_id=OWN.name;d_records=[]
for g in inp['goals']:
    gid=g['goalId'];assert all(g['current'+f]==whole[gid][k] for f,k in [('TitleDe','title'),('TitleEn','titleEn'),('DescriptionDe','description'),('DescriptionEn','descriptionEn')])
    ex=profiles[gid]['profile']['expectations'];evidence={}
    for suffix in ['De','En']:
        evidence['essentialUnderstanding'+suffix]=' '.join(r['essentialUnderstanding'+suffix] for r in ex)
        evidence['observablePerformance'+suffix]=ex[0]['observablePerformance'+suffix]
        evidence['transferExpectation'+suffix]=ex[-1]['observablePerformance'+suffix]
    d_records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
        'recordId':run_id+'.'+gid,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
        'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest'],
        **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision':'keep','understandingEvidence':evidence,
        'rationale':science[gid]['rationale']+' '+OBS[gid]+' Eigene gültige ganze Wissenschaft und36Fallkörper unverändert übernommen, aktuelle ganze Bild-/Buch-/Kontextbindungen tatsächlich geprüft. DieSource-v3-Rolle ist '+sources[gid]['sourceKind']+'; keineuniverselle Länderoperator- oder volle144Quellenfreigabe. BeideSprachen gleichwertig; konkrete Verständnis-/Leistungs-/Transferprofile bleiben scopedE1/G1-Kandidaten, keine reale Lerner- oder Humanfreigabe.',
        'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
results=OWN/'round-a/results';results.mkdir(parents=True,exist_ok=True);rp=results/(batch['batchId']+'.records.jsonl')
with rp.open('x') as f:
    for r in d_records:f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
    'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest'],
    'provider':'OpenAI','model':'Codex actual independent A; serving revision not exposed','role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Actual independent A eighteen current full raster native views; genuine prior science retained; sampling unavailable').hexdigest(),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],
    'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']],
    'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'outputDigest':'sha256:'+sha(rp),'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
write(results/(batch['batchId']+'.run.json'),run)
write(OWN/'eighteen-genuine-current-D-P-V.independent-a.first.freeze.json',{
    'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'role':'Genuine blind independent A first whole18 current judgment',
    'authorFirstInput':bind(author_seal),'genuineOwnPriorScienceAndSource':prior_seals,'ownFiles':[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()],
    'actualAuthor307InputsExact':True,'DKEEP':18,'PScopedSciencePASS':18,'VActualKEEP':18,'blockingFindings':[],
    'peerCurrentFinalBFilesRead':0,'technicalChecks':'Pending real native true18 Round-A campaign CLI and current closedP18 actual PNG semantic API; no fictional validator run.',
    'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0})
print(json.dumps({'firstSeal':bind(OWN/'eighteen-genuine-current-D-P-V.independent-a.first.freeze.json'),'DKEEP':18,'PScopedSciencePASS':18,'VKEEP':18,'blockingFindings':0,'peerCurrentFinalBFilesRead':0}))
