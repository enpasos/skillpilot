"""Seal reviewer A's actually completed final page amendment before serialization."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = next(p for p in ROOT.parents if (p / 'AGENTS.md').is_file())
E = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
F = E / 'chemie-current426-eight-final-native-informed-followup-a-20261016-v1'
O = E / 'chemie-current426-eight-current-pages-fresh-independent-a-20261015-v1'
T = E / 'chemie-current426-b47-framework-P1-native8-successor-technical-20261015-v1'
SELECTOR = T / 'pages-final-eight/NEUTRAL.final-eight-actual-current-pages-profiles-nineteen-cases.selector.json'
PAGE_SEAL = T / 'pages-final-eight/FILES.final-eight-actual-current-neutral-pages-and-inputs.seal.json'
AUTHOR = E / 'chemie-b47-underlying-sidechain-framework-two-strings-author-successor-20261015-v1/AUTHOR.two-whole-raw-profiles.only-b47-framework-wording-successor.json'


def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def ref(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': digest(path), 'bytes': path.stat().st_size}


def load(path):
    return json.loads(path.read_text())


def write_new(path, value):
    with path.open('x') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')


assert digest(SELECTOR) == 'sha256:186a66f84e027d16a88b0e9cef7c045a5b1e331ff138309b40779d9c3016ceb6'
assert digest(PAGE_SEAL) == 'sha256:a6cb57ab73b74ef510a30a092bc72d36863e740bf276273f8612b2b6dc5bc281'
assert digest(AUTHOR) == 'sha256:1322324eee1424a6ebd52a9152b23c0e0c5938d36c9e064bb08d83854980a1d0'
lineage = [
    (O / 'FIRST.scientific-text-and-source-judgments.before-native.json', 'c7bff2cb227df9aa6b9631c58eba9c4361a6de27d31e13e1a13e68b19490f042'),
    (O / 'FIRST.scientific-eight-after-actual-native.final.json', 'f5695ca74b311cd9ac91efa543deb0571d38d105e58cd1df04469b21602925fc'),
    (F / 'FIRST.own-informed-final-eight.scientific-followup.before-stock.json', '80dc4af4afeedac7b358718733c1452de26ec4538bdf1a308a77c5589d23a689'),
    (F / 'FOLLOWUP.eight-essential-understanding-fields.before-final-pages.json', '38361bd1899ab3f359a6016bda0dd64fb1e20fc83bd26ed915c518cd4bdc42d1'),
    (F / 'FOLLOWUP.b47-two-framework-language-strings.before-final-pages.json', '174ff2e34855e376e069c833679f048ee3345431c514157057f4cddcd5863b61'),
]
for path, expected in lineage:
    assert digest(path) == 'sha256:' + expected, path
selector = load(SELECTOR)
checked_refs = []
keys = ['canonical', 'semantic', 'actualBaseBookConfig', 'actualNativeConfig', 'actualBookModel',
        'actualBookHtml', 'actualBookPdf', 'actualBundleManifest', 'actualBatchManifest',
        'roundAInput', 'roundACampaign', 'wholePdfText', 'actualOriginalToFinalDelta',
        'actualTwoEssentialFieldDelta', 'wholeNineteenCurrentCaseMaterialAndRubricBindings',
        'wholeSixTargetFourteenCases', 'wholeNeighborFiveCorrectedCasesAndRubrics']
for key in keys:
    r = selector[key]
    assert digest(REPO / r['path']) == r['sha256'], key
    checked_refs.append({'selectorKey': key, **r})
for row in selector['actualPagesAndHashes']:
    for key in ['actualWholeGoalAndPageInput', 'actualPagePng120dpi', 'actualWholePageText']:
        r = row[key]
        assert digest(REPO / r['path']) == r['sha256'], r['path']
        checked_refs.append({'selectorKey': key, **r})
science = load(lineage[2][0])
old_selector = load(REPO / science['finalNeutralSelector']['path'])
old_input = load(REPO / old_selector['roundAInput']['path'])
current = load(REPO / selector['roundAInput']['path'])
bundle = load(REPO / selector['actualBundleManifest']['path'])
own_by_id = {r['goalId']: r for r in science['rows']}
old_by_id = {r['goalId']: r for r in old_input['goals']}
authored = {r['goalId']: r['profile'] for r in load(AUTHOR)['records']}
assert selector['goalIds'] == [r['goalId'] for r in current['goals']] == [r['goalId'] for r in science['rows']]
assert current['bookDigest'] == bundle['bookModelDigest'] == 'sha256:5f228de39d98f42ae816c9fde16620a4e955d93cbef875392b1cd154cbed4d3b'
bindings = load(REPO / selector['wholeNineteenCurrentCaseMaterialAndRubricBindings']['path'])
assert bindings['uniqueGoalCasePairs'] == 19
observations = [
    'PDF3/S.1 tatsächlich mit view_image gesehen: freies anomeres Glucose-C1 und Saccharose-C1/C2-Verknüpfung; vollständige routegebundene Beschreibung; Nachfolger96 intern S.3. Neuer Buchhash/Feedbackfuß sichtbar.',
    'PDF4/S.2 tatsächlich mit view_image gesehen: Glycin-Hauptformen pH2/6/12, Ladungen+1/0/−1, intern geladene Zwitterionform; Nachfolger S.5/S.4. Neuer Buchhash/Feedbackfuß sichtbar.',
    'PDF5/S.3 tatsächlich mit view_image gesehen: Kupferbefund nicht glucosespezifisch, GOD glucosespezifisch; Caption Negativ: nicht nachgewiesen; ganze bereits bewertete Nachweisgrenzenbeschreibung; Vorgänger S.1. Neuer Buchhash/Feedbackfuß sichtbar.',
    'PDF6/S.4 tatsächlich mit view_image gesehen: Alanin/Serin bei pH7 mit NH3+/COO−-Gerüst und verschiedenen Resten, Wasser bei beiden Molekülen; keine absolute Unlöslichkeitsbehauptung; Vorgänger S.2. Neuer Buchhash/Feedbackfuß sichtbar.',
    'PDF7/S.5 tatsächlich mit view_image gesehen: Glycin/Alanin mit carboxylischem C1 und alpha-C2, vollständiger Nomenklaturtext ohne neue Stereochemiepflicht; Vorgänger S.2. Neuer Buchhash/Feedbackfuß sichtbar.',
    'PDF8/S.6 tatsächlich mit view_image gesehen: mit/ohne Lactase und getrenntes Darmsymbol; ganze Beschreibung erklärt Verdauung und Resorption, unveränderte Bedeutung der bereits geprüften EN-Absorptionsfassung. Neuer Buchhash/Feedbackfuß sichtbar.',
    'PDF9/S.7 tatsächlich mit view_image gesehen: Lichtquelle, Polarisator, Probe und Analysator mit Drehungsmodell; ganze Beschreibung unterscheidet spezifischen Drehwinkel als Kenneigenschaft; unveränderte drei externe Vorgänger. Neuer Buchhash/Feedbackfuß sichtbar.',
    'PDF10/S.8 tatsächlich mit view_image gesehen: Temperatur, Härte und Dosis, zwei symbolische Tensidformen sowie getrennte Kriterien Fettentfernung und Schaum; offene Strukturwahl und vollständige bedingungsgebundene Beschreibung. Neuer Buchhash/Feedbackfuß sichtbar.',
]
rows = []
for i, goal in enumerate(current['goals']):
    row = copy.deepcopy(own_by_id[goal['goalId']])
    for key in ['goalId', 'goalFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']:
        assert goal[key] == row[key], (goal['goalId'], key)
    assert goal['canonicalContext'] == old_by_id[goal['goalId']]['canonicalContext']
    profile = goal['reviewContext']['evidenceProfile']['profile']
    if goal['goalId'] in authored:
        assert profile == authored[goal['goalId']]
    else:
        assert profile == old_by_id[goal['goalId']]['reviewContext']['evidenceProfile']['profile']
    row['pageFingerprint'] = goal['pageFingerprint']
    page = selector['actualPagesAndHashes'][i]
    assert page['goalId'] == row['goalId']
    assert page['pageFingerprint'] == row['pageFingerprint']
    row['actualFinalPageInspection'] = {
        'viewedWith': 'view_image', 'observationDe': observations[i],
        'actualPagePng120dpi': page['actualPagePng120dpi'],
        'actualWholeGoalAndPageInput': page['actualWholeGoalAndPageInput'],
        'physicalPdfPage': page['actualPhysicalPDFPage'], 'goalPageNumber': page['goalPageNumber'],
    }
    if goal['goalId'].startswith('b47'):
        row['understandingEvidence']['transferExpectationDe'] = 'Bei einem unabhängig gegebenen Glutaminsäurevergleich bei pH 3 und 8 erklärt die lernende Person die veränderte überwiegende Protonierung und Nettoladung bei erhaltenem Grundgerüst der Restgruppe. Dabei können O–H- beziehungsweise N–H-Bindungen durch Protonenübertragung entstehen oder entfallen. Sie verwendet die vorgegebenen qualitativen Beobachtungen, ohne genaue Sättigungswerte oder eine isolierte Kausalwirkung der Seitenkettenpolarität zu erfinden.'
        row['understandingEvidence']['transferExpectationEn'] = 'For an independently supplied glutamic-acid comparison at pH 3 and 8, the learner explains changes in predominant protonation and net charge while the underlying side-chain framework is preserved. Proton transfer can form or break O–H or N–H bonds. The learner uses the supplied qualitative observations without inventing saturation values or an isolated causal effect of side-chain polarity.'
        row['rationaleDe'] += ' Die zwei bereits von mir gesondert bewerteten essentialUnderstanding-Sprachfelder sind im geschriebenen Endstand exakt vorhanden. Erhalten bleibt das Grundgerüst der Restgruppe; Protonenübertragung kann O–H-/N–H-Bindungen verändern. Diese Präzisierung macht die ganze Seitenkettenstruktur nicht absolut kovalent unveränderlich.'
    if goal['goalId'].startswith('1d2'):
        row['rationaleDe'] += ' Die vier bereits von mir eigenständig bewerteten essentialUnderstanding-Sprachfelder sind im geschriebenen Endprofil exakt vorhanden und formulieren nun chemische Beziehungen ausdrücklich.'
    if goal['goalId'].startswith('e9'):
        row['rationaleDe'] = row['rationaleDe'].replace('Protonierungswechsel versus kovalente Identität', 'Protonierungswechsel bei erhaltenem Aminosäuregrundgerüst')
    rows.append(row)
amendment = {
    'format': 'own-informed-scientific-and-technical-final-page-amendment-v1',
    'reviewRole': 'independent chemistry description reviewer A',
    'recordedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'originalOwnSciencePreserved': [ref(p) for p, _ in lineage],
    'finalNeutralSelector': ref(SELECTOR), 'pageSeal': ref(PAGE_SEAL),
    'finalRawTwoProfilesComparedExactly': ref(AUTHOR),
    'allEightActualFinalPngsViewedWithViewImage': True,
    'exactWrittenTwoProfilesEqualPreviouslyReviewedAuthorBodies': True,
    'otherSixProfileBodiesAndEightBilingualGoalsAndCanonicalContextsUnchanged': True,
    'nineteenWholeCasesAndRubricsPreviouslyActuallyReadAndPinsUnchanged': True,
    'verifiedReferences': checked_refs,
    'scopeDe': 'Begrenzte informierte Nachsicht meiner eigenen versiegelten Urteile, keine neue breite Wissenschaftsrunde. Aktuelle zwei Profilkörper exakt mit meinen geprüften Autorenfolgern verglichen; neue Seiten-/Footerbindungen tatsächlich gesichtet. Meine bisherige Formulierung kovalente Restidentität wird ausdrücklich auf erhaltenes Grundgerüst begrenzt. Keine vollständige kovalente Unveränderlichkeit behauptet.',
    'rows': rows, 'decisionCounts': {'keep': 8},
    'independence': {'otherReviewersDescriptionDecisionsRead': False, 'positivePAVJudgmentsRead': False, 'ownEarlierJudgmentsKnown': True, 'actualMode': 'informed continuation of own preserved first judgments'},
    'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate',
    'actualLearnerPerformanceOrMeasurementsObserved': False,
    'HumanApproval': False, 'HumanTrial': False,
    'canonicalRegistryRuntimeGitCentralMutation': False,
    'newRenderingOrPrepareOrRasterCopyPerformed': False,
    'stockRecordsSerializedYet': False,
}
path = ROOT / 'FOLLOWUP.actual-final-written-eight-page-bindings.before-stock.json'
write_new(path, amendment)
write_new(ROOT / 'FOLLOWUP.actual-final-written-eight-page-bindings.before-stock.seal.json', {
    'schemaVersion': 1, 'role': 'own final informed page amendment sealed before stock serialization',
    'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'files': [ref(path)],
    'originalOwnScienceStillExact': [ref(p) for p, _ in lineage],
})
print(json.dumps({'amendment': ref(path), 'eightPagesActuallyViewed': True, 'twoWrittenProfilesExact': True, 'unchangedWholeCases': 19, 'decisions': {'keep': 8}}, ensure_ascii=False, indent=2))
