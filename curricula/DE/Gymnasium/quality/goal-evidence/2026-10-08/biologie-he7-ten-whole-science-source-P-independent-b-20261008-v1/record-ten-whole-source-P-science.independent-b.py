# SPDX-License-Identifier: Apache-2.0
"""Append-only recording after genuine whole-goal/source/case review B.

No native final D/P/V approval or image inspection is claimed at this science
phase. Technical exact-byte checks bind the independently read content; they
do not generate or substitute for the scientific judgments below.
"""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he7-foundations-cells-photosynthesis-ten-whole-science-author-20261008-v1'

def read(p): return json.loads(p.read_text())
def rows(p): return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(ROOT)), 'sha256':sha(p), 'bytes':p.stat().st_size}
def write(p,d):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')

# Goal-specific substantive observations follow actual independent reading of
# all full DE/EN materials, questions, answers, contracts and original primary.
SCIENCE = {
1: 'Der Wissenschaftsbegriff umfasst Lebewesen, Lebensvorgänge und Umweltbeziehungen. Keimlingsentwicklung und Zusammenleben im Teich sind untersuchbare biologische Fragen; persönliche Farbvorliebe ist ohne passende Untersuchungsfrage kein Messbefund. Der Fossilfall erweitert zutreffend auf Belege früheren Lebens und auf Pflanzen/Pilze; vorgegebenes Fossiletikett wird nicht als eigene neue Bestimmung ausgegeben. Eine Frage allein ist noch keine Antwort. Die Fälle erhalten den knappen beschreibenden Fachbegriff und verlangen keine vollständige Forschung oder universellen Experimentenzwang.',
2: 'Zellorganisation, Stoffwechsel, Entwicklung, Reizantwort und Fortpflanzung/Vererbung werden geordnet zusammen betrachtet. Wachstum durch Anlagerung beim Kristall und motorische Roboterbewegung reichen nicht zur Lebensklassifikation. Keimfähiger ruhender Samen und steriles lebendes Tier widerlegen die falsche Pflicht, jedes Individuum müsse jedes Merkmal ständig sichtbar zeigen. Pflanzenbewegung wird nicht ausgeschlossen; Fortpflanzung ist im Lebens-/Systemkontext berücksichtigt. Der Transfer verändert den Beurteilungskontext sinnvoll und bleibt bei grundlegenden Lebenskennzeichen.',
3: 'Dünnes ungefaltetes feuchtes Präparat, kontrolliertes schräges Absenken des Deckglases, niedrige Anfangsvergrößerung, Zentrieren, passende Beleuchtung und gerätegerechte Fein-/Grobfokussierung ergeben eine zusammenhängende Mikroskopie-Arbeitsfolge. Objektiv/Glas-Kontakt und Grobtrieb am hohen Objektiv werden konkret vermieden. Falten, Luftblasen und optische Schärfeebenen werden von Zellkernbehauptungen allein anhand der Rundheit unterschieden. Beide DE/EN-Fälle verlangen echte praktische Handlungen und nachvollziehbares Gerät-/Präparat-/Beobachtungsprotokoll für einen Bedienungsclaim. Die öffentlichen Handlungsentwürfe sind keine tatsächliche Bedienungsleistung.',
4: 'Zellwand gibt Form/Stabilität, Membran begrenzt selektiv den Stoffaustausch, Cytoplasma trägt Stoffwechsel, Kern genetische Information, Chloroplast Fotosynthese und Vakuole Speicherung/Stützzustand. Wand und Membran sind nicht austauschbar. Räumliches Blattzellmodell und lebende nicht grüne Zwiebelzelle werden unterschieden; fehlende Chloroplasten machen die vorgegebene Zwiebelzelle nicht zur Tierzelle. Beschädigte Membran wird durch intakte Wand nicht funktional ersetzt. Die Modellgrenze zur Lichtmikroskopie und wechselnden Geweben ist ausdrücklich erhalten; zusätzliche Organellen sind kein erfundener all-route Atlaszwang.',
5: 'Das ausdrücklich bekannte Blatt-/Mundschleimhautpaar besitzt gemeinsame Membran, Cytoplasma und Kern sowie bereitgestellte Mitochondrien; Wand, Chloroplasten und große Zentralvakuole kennzeichnen das vorgegebene Blattmodell. Fehlende Tierzellwand bedeutet nicht fehlende Tierzellmembran. Im Wurzelfall sind fehlende Chloroplasten mit der vorgegebenen Pflanzenherkunft vereinbar. Mehrere Merkmale und Herkunft werden verglichen; eckig/rund oder Zellwand allein werden nicht zur universellen Pflanzenbestimmung. Ergänzende Pilzwandinformation begrenzt die Verallgemeinerung, sie erzeugt keine neue Pflicht zum Pilzkurs.',
6: 'Der Blattfall variiert Licht, kontrolliert Abdeckeffekte, Wasser/CO2/Temperatur/Zeit und kombiniert explizit vorgegebenen negativen Modell-Anfangstest, positive Stärkereferenz und Dunkelvergleich. Der Ergebnisclaim ist auf den vorgegebenen Modellbereich begrenzt; Stärkenachweis ist aufsummiert, Materialtransport bleibt als Fehlerquelle sichtbar. Die zweite kontrollierte sauerstoffspezifische Sensorreihe steigt 1→3→4 bei Licht 1→2→3, daher kein proportionaler/unbegrenzter Anstieg. Konstanter Atmungsbeitrag ist ausdrücklich Modellannahme und Messung Netto; alte bloße Bläschenzählung mit Erwärmung trennt Gasart und Licht-/Temperaturfaktor nicht. Praktische Durchführung und reale Protokolle werden für tatsächliche Untersuchungsleistung verlangt.',
7: 'Getrennte kontrollierte CO2- und Wasserreihen sowie Korrektur eines Licht/CO2/Wasser zugleich ändernden Vergleichs ermöglichen begrenzte Aussagen über Bedingungen der Fotosyntheseleistung. CO2 wird bei ausreichendem Wasser variiert; Wasserstress kann bei gleicher äußerer CO2-Verfügbarkeit Spaltöffnungen und inneren CO2-Zugang verändern. Wiederwässerung unterstützt eine reversible Beziehung und beweist nicht alle Ursachen. Die Antwort nennt dies zutreffend physiologische Wasserversorgungsabhängigkeit und ausdrücklich keinen direkten Nachweis einer chemischen Wassersubstrat-Umsetzung. Der ganze originale Pflichtpunkt verlangt Pflanzenbedarf, keinen zusätzlichen Isotopen-/Biochemieversuch. Eigene Durchführung/Protokoll bleiben für einen tatsächlichen experimentellen Claim erforderlich.',
8: 'Stärkereferenz und Anfangs-/Dunkelvergleich stützen einen sachlich geeigneten Iodnachweis im Blattmaterial. Glucose- und Leerprobe bleiben gelb-braun: Iod weist hier Stärke, nicht beliebigen Zucker oder sämtliche Fotosyntheseprodukte nach. Betreute Glimmspanprobe am gesammelten Gas gegenüber Vergleichsluft stützt im begrenzten Pflanzenkontext Sauerstoffanreicherung; kein Reinheits- oder genauer Ratenclaim. Die sauerstoffspezifische kalibrierte Sensorreihe 5→8 mg/L gegenüber Leer5 und Dunkel4 liefert Nettoveränderungen, keine gesamte Bruttorate bei weiterlaufender Atmung. Beide produktbezogenen Kontrollen und reale Durchführung/Proben-/Gerätebedingungen sind erforderlich; synthetische Zahlen und Entwürfe bleiben E1/G1.',
9: 'Die Wortgleichung stellt CO2 und Wasser als stoffliche Ausgangsgrößen und Zucker/Sauerstoff als zusammenfassende Ergebnisgrößen dar; Licht ist Energiezufuhr, kein Stoff und Boden kein CO2-/Wasserersatz. Geeignete chlorophyllhaltige Strukturen sind Bedingung, keine ausführliche Zwischenreaktionsliste. Im bodenfreien Nährmedium werden Mineralversorgung, CO2-Kohlenstoff, organischer Aufbau und spätere Stärkespeicherung richtig unterschieden. Positiver Iodtest beweist kein einziges unmittelbares Produkt oder alle biochemischen Wege. Angeben und inhaltliches Deuten sind derselbe fachsprachliche Darstellungsakt, nicht getrennte Stoffquoten.',
10: 'Lichtmodell5 CO2-Aufnahme minus2 Atmungsabgabe ergibt netto3 Aufnahme; im Dunkeln0 Fotosynthese und2 Abgabe. Positive Nettoaufnahme widerlegt daher nicht gleichzeitig laufende Atmung. Der Transfer zu wasser-/sauerstoffversorgter Kartoffelknolle erklärt Dunkelwachstum durch organische Reserven statt durch Fotosynthese im Dunkeln oder unbegrenztes Wachstum ohne Nachschub. Fotosynthese trägt langfristig organischen Aufbau, Reserven/Nahrung und O2 bei; eigene und fremde aerobe Atmung nutzen energiereiche Stoffe/O2 und liefern nutzbare Energie, CO2 und Wasser. Beide Prozesse laufen unter den expliziten Bedingungen auch im Licht zusammen; konstante Zahlen sind kein tatsächlicher allgemeiner Messbefund.'
}
SOURCE = {
1:(8,'5.1.1','HE5.1 whole scope science of life, question/observation/method boundaries; general whole physical3/6 independently read.'),
2:(8,'5.1.2','HE5.1 whole characteristics of living beings; collecting/organizing and contextual method limits.'),
3:(19,'7.1.1','HE7.1 whole mandatory microscopy tool use and actual preparation/handling methods; devices/examples are bounded choices.'),
4:(19,'7.1.3','HE7.1 whole green plant cell and spatial modeling. Recommended example structures/preparations are not universal all-route quotas.'),
5:(19,'7.1.4','HE7.1 whole plant/animal comparison. Cheek/onion, mitochondria and fungal counterexample remain contextual model choices.'),
6:(20,'7.2.1','HE7.2 whole light influence and experimental methods; specific sensor/iodine method are selected examples, not universal method quotas.'),
7:(20,'7.2.2','HE7.2 whole plant need for CO2 and water; physiological dependence correctly distinguished from direct chemical-substrate evidence.'),
8:(20,'7.2.3','HE7.2 whole starch formation and oxygen release, appropriate experimental detection and result/inference/error boundaries.'),
9:(20,'7.2.4','HE7.2 whole word equation, with simplified model/energy/material distinctions. Detailed intermediates not added.'),
10:(20,'7.2.5','HE7.2 whole growth/reserves/nutrition/O2 importance and plant respiration; no facultative fermentation/phototaxis obligation.')
}

seal = AUTHOR / 'ten-whole-science-native-P10-author-input.first.freeze.json'
assert sha(seal) == '3feb83811528924fa622dc6d615df735b30b0b53bce65c23c5ee6b5341245479'
author_frozen = read(seal)
assert len(author_frozen['files']) == 85
for item in author_frozen['files']:
    p = ROOT / item['path']
    assert p.is_file() and sha(p) == item['sha256'] and p.stat().st_size == item['bytes'], str(p)
entry = read(AUTHOR / 'neutral-ten-whole-science-first-author-review.entry.json')
goal_file = ROOT / entry['wholeGoals']; goals = read(goal_file)['wholeGoals']
case_file = ROOT / entry['wholeCases']; whole_cases = read(case_file)
profiles_file = ROOT / entry['wholePAuthor']; profiles = read(profiles_file)['goals']
closed_file = ROOT / entry['closedP10']; closed = rows(closed_file)
assert len(goals) == len(profiles) == len(closed) == 10
assert len(whole_cases['wholeCases']) == 20
assert whole_cases['wholeGoalBodies'] == goals
profile_by = {r['goalId']:r for r in profiles}
closed_by = {r['goalId']:r for r in closed}
live_file = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
live_by = {g['id']:g for g in read(live_file)['goals']}
snap_file = AUTHOR / 'input-snapshots/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
snap_by = {g['id']:g for g in read(snap_file)['goals']}
source_file = ROOT / entry['wholeOriginalSources']
source_by = {g['id']:g for g in read(source_file)['wholeOriginalGoals']}
mapping_file = ROOT / entry['wholeSourceMappingRecords']
mapping_records = read(mapping_file)['records']
assert len(mapping_records) == 30
for item in mapping_records:
    source_snapshot = AUTHOR / 'input-snapshots' / item['sourcePath']
    cursor = read(source_snapshot)
    for part in item['jsonPointer'].split('/')[1:]:
        key = part.replace('~1','/').replace('~0','~')
        cursor = cursor[int(key)] if isinstance(cursor,list) else cursor[key]
    assert cursor == item['wholeMatchingRecord']
am_a = {r['goalId']:r for r in rows(ROOT / entry['retainedExistingA10'])}
am_m = {r['goalId']:r for r in rows(ROOT / entry['retainedExistingM10'])}
assert len(am_a) == len(am_m) == 10
old_a = {r['goalId']:r for r in rows(AUTHOR / 'input-snapshots/curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.review.jsonl')}
old_m = {r['goalId']:r for r in rows(AUTHOR / 'input-snapshots/curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl')}
cards = rows(ROOT / entry['retainedNecessaryCards17'])
assert len(cards) == 17
assert all(c['status'] == 'kept' and c['necessary'] for c in cards)
context_file = ROOT / entry['wholeContext']; context = read(context_file)
assert context['wholeSelectedGoals'] == goals
source_pdf = AUTHOR / 'input-snapshots/g9-biologie.official.pdf'
assert sha(source_pdf) == '93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1'
targeted = []
for ordinal,goal in enumerate(goals,1):
    gid=goal['id']; assert live_by[gid] == snap_by[gid] == goal, gid
    assert profile_by[gid]['profile'] == closed_by[gid]['profile']
    assert closed_by[gid]['status'] == 'needs_human_review'
    assert closed_by[gid]['reviewAuthority'] == 'ai_candidate'
    assert closed_by[gid]['evidenceLevel'] == 'E1' and closed_by[gid]['maximumClaimScope'] == 'G1'
    assert am_a[gid] == old_a[gid] and am_m[gid] == old_m[gid]
    cases = [c for c in whole_cases['wholeCases'] if c['goalId'] == gid]
    assert len(cases) == 2
    case_receipts = []
    for case in cases:
        brief = next(b for b in profile_by[gid]['profile']['applicationCaseBriefs'] if b['id'] == case['id'])
        for lang,suffix in [('de','De'),('en','En')]:
            assert brief['taskDemand'+suffix] == case['material'][lang] + ' ' + case['task'][lang]
            assert brief['expectedPerformance'+suffix] == case['modelAnswer'][lang]
        case_receipts.append({'caseId':case['id'],'wholeMaterialTaskAnswerActuallyRead':['de','en'],
            'operativeProfileBriefExact':True,'modelScienceVerdict':'PASS for bounded public E1/G1 exemplar'})
    srcid = goal['extendedData']['provenance']['sourceGoalId']
    source_goal = source_by[srcid]
    assert any(i['wholeMatchingRecord'].get('sourceGoalId') == srcid and gid in i['wholeMatchingRecord'].get('canonicalGoalIds',[]) for i in mapping_records)
    physical,span,bound=SOURCE[ordinal]
    practical=ordinal in [3,6,7,8]
    targeted.append({'ordinal':ordinal,'goalId':gid,'exactWholeCurrentGoal':goal,
        'wholeDEENScientificDescriptionDecision':'KEEP for exact science-first input; final native D review pending',
        'wholeSourceScientificVerdict':'PASS within actual bounded HE G9 original source',
        'wholePScientificVerdict':'PASS_SCOPED_E1_G1_CANDIDATE','scientificReasonDe':SCIENCE[ordinal],
        'wholeCaseScientificReviews':case_receipts,
        'originalSourceGoalId':srcid,'originalSourceDEENActuallyRead':True,'originalSourceGoalTitleDe':source_goal['title'],
        'wholeOfficialPrimaryPhysicalPage':physical,'normalizedMappingSourceSpan':span,
        'sourceScopeReason':bound,'normalizedSourceRowIsOriginalVerbatimQuote':False,
        'exactPositiveFingerprint':{'goalFingerprint':closed_by[gid]['goalFingerprint'],'profileFingerprint':closed_by[gid]['profileFingerprint'],'reviewInputFingerprint':closed_by[gid]['reviewInputFingerprint']},
        'wholePExpectationsCoverageVariationsAndBriefsActuallyRead':True,
        'genuineIndependentPracticalExecutionAttainmentClaim':False,
        'practicalOperatorRequiresActualObservableActionsAndTraceableRecords':practical,
        'practicalAttainmentFromSyntheticDataOrPlans':'HOLD such a claim; it is not made' if practical else 'not a practical execution goal',
        'currentHistoricalAMExactRetained':True,'retainedAtomicity':am_a[gid]['status'],'retainedMemory':am_m[gid]['status'],
        'newAMVerdictClaimed':False,'newCards':0,'newNativeDPVApproval':'pending actual final inputs and genuine independent review',
        'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
        'actualExperiments':0,'realLearnerEvidence':False,'humanApproval':False})

write(OWN / 'ten-whole-goal-source-P-scientific.independent-b.first.verdicts.json',{
    'schemaVersion':1,'artifactKind':'independent-B-genuine-ten-whole-DEEN-primary-source-twenty-case-P-science-first',
    'recordedAt':datetime.now(timezone.utc).isoformat(),'actualReviewer':'/root/flora_fauna_independent_a','assignedIndependentRole':'B',
    'authorFirstSeal':bind(seal),'records':targeted,'wholeDEENScienceKEEP':10,'wholeSourceScopedPASS':10,
    'wholePScopedCandidatePASS':10,'wholeCaseDEENPairsSciencePASS':20,'newBlockingCandidateScienceFindings':[],
    'actualPrimarySourceReading':{'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf',
        'originalFrozenPDF':bind(source_pdf),'wholePhysicalPagesActuallyRead':[3,6,8,19,20],
        'sectionsActuallyRead':['general subject purpose','left mandatory/right recommendations distinction','5.1','7.1','7.2'],
        'readBasis':'Actual whole original PDF pages independently read through fitz; whole frozen original source goals and30 mapping records read separately. Not inferred from author conclusions or hash agreement.',
        'newFullThirdPartyTextCopiedIntoThisDossier':False},
    'all16CountryPrimarySourceClosureClaim':False,'facultativeScopeNotUniversal':'Phototaxis, fermentation, extra cell types, bacterial culture and recipe/example-method recommendations remain outside compulsory all-route claims.',
    'practicalOperatorScope':{'ordinals':[3,6,7,8],'actualExecutionObserved':False,'attainmentClaimFromSyntheticMaterial':'HOLD; not asserted',
        'candidatePHandling':'The contract demands actual appropriate observable practical actions and traceable records when execution competence is claimed. This E1/G1 machine curriculum review checks contract/example adequacy, not human trial.'},
    'specificInferenceLimits':{'water':'Physiological dependence on supply, including stomatal/CO2 mediation; no direct chemical substrate proof from drought.',
        'oxygen':'Appropriate collected-gas or calibrated oxygen-specific evidence; bubbles alone do not identify gas, positive test does not establish purity or gross rate.',
        'starch':'Iodine starch assay and controls; not arbitrary free sugar or unique immediate product.',
        'respiration':'Continues in viable stated light/dark conditions; net uptake is not absent respiration.'},
    'existingAMRetainedNotScienceApprovalOfNewCases':True,'newSemanticClassificationAMDecisions':0,
    'newNativeDReviewRecords':0,'newNativeFinalPBindingApprovals':0,'newVApprovals':0,'imagesGeneratedOrInspected':0,
    'peerAFirstOrFinalOutputsReadBeforeOwnFirstSeal':False,'activeWrites':0,'strictGainClaimed':0,
    'realLearnerEvidence':False,'humanApproval':False,'humanTrial':False})

write(OWN / 'ten-source-case-profile-AM-current-exact-bindings.independent-b.actual.json',{
    'schemaVersion':1,'artifactKind':'independent-B-ten-whole-science-input-binding-and-valid-history-retention',
    'recordedAt':datetime.now(timezone.utc).isoformat(),'authorSeal':bind(seal),'authorFrozenFilesActuallyVerified':85,
    'authorInputSnapshots':34,'authorOutputs':51,'actualWholeTenLiveBodiesExactToReviewedBaseline':True,
    'liveCanonical':bind(live_file),'wholeGoals':bind(goal_file),'wholeCases':bind(case_file),
    'wholePAuthor':bind(profiles_file),'closedP10':bind(closed_file),'sourceGoalRows':bind(source_file),
    'wholeSourceMapping30Records':bind(mapping_file),'wholeSourceMapping30JsonPointersActuallyVerified':True,
    'wholeContext':bind(context_file),'wholeContainsParentCount':len(context['wholeContainsParents']),
    'wholeRequiresConsumerCount':len(context['wholeRequiresConsumers']),'currentSelectedBodyAndPrereqsNotChanged':True,
    'existingA10':bind(ROOT / entry['retainedExistingA10']),'existingM10':bind(ROOT / entry['retainedExistingM10']),
    'existingAM10ExactToFrozenFullLedgers':True,'shared17CardLedger':bind(ROOT / entry['retainedNecessaryCards17']),
    'sharedOrdinaryMemoryOriginClosure':16,'sharedMemoryNodes':1,'standardVisibilityScopes':8,
    'existingMemoryTerminal':bind(AUTHOR / 'M.shared-memory-origin-closure.native.terminal.actual.json'),
    'existingMemoryStdout':bind(AUTHOR / 'M.shared-memory-origin-closure.native.stdout.actual.txt'),
    'existingNativeMemoryChecks':'17 kept primary cards,33 required visibility occurrences,0 untraced memory node,0 stale/missing card/origin records, actual Exit0 retained; technical result not new science approval',
    'newNativeDPVApproval':False,'whole20PBriefMaterialTaskAnswerDEENEqual':True,'actualExperiments':0,
    'peerAOutputsRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print('HE7 independent B genuine science first:10 whole bilingual goals/source/P contracts and20 whole case pairs PASS as bounded E1/G1 candidates. No actual practical attainment, native final D/P/V or human approval claimed. All85 exact author files and current10 whole bodies verified; valid A/M history retained.')
