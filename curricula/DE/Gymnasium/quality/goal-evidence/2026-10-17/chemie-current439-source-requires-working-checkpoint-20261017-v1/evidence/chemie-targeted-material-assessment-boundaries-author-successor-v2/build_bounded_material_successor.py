from pathlib import Path
import copy
import datetime
import hashlib
import json
import re
import shutil
import jsonschema

O = Path(__file__).parent
B = O.parent
AT = datetime.datetime.now(datetime.timezone.utc).isoformat()
G28 = '28c90c6a-3020-5c51-ac40-d802f3f12d2d'
GOALS = ['f85b4651-50ea-5b42-b193-3465c05257a7', 'b8d3b453-d638-5518-aab0-d84ec2e8567c', '188bd684-e894-5753-8a50-798220b04d97', G28]
V1 = B / 'chemie-mixed18-four-targeted-P-gaps-author-successor-v1'
ROOT14 = B / 'current439-remediation14-author-assembly-technical-v1'

def load(p):
    return json.loads(Path(p).read_text())

def pin(p):
    p = Path(p)
    return {'path': str(p), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}

def write(rel, d):
    p = O / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    return pin(p)

def fieldpin(d):
    return hashlib.sha256(json.dumps(d, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def pointer(d, p):
    for k in p.strip('/').split('/') if p else []:
        k = k.replace('~1', '/').replace('~0', '~')
        d = d[int(k)] if isinstance(d, list) else d[k]
    return d

def without_nonoperative_author_metadata(d):
    # The neutral locator deliberately omits these wrapper contacts. Never print
    # or interpret their values; compare the complete operative bodies only.
    if isinstance(d, dict):
        return {k:without_nonoperative_author_metadata(v) for k,v in d.items() if k not in ['authorRemediation','newIndependentReviewStatus']}
    if isinstance(d, list):
        return [without_nonoperative_author_metadata(v) for v in d]
    return d

selector_path = ROOT14 / 'SELECTOR.clean-remediation14-reviewer-inputs.sealed.json'
assert pin(selector_path)['sha256'] == '0ee1e9432d7e2e82435a9e83ce9a19e6acf1da35d98f00e4ac54403c9d43e38b'
selector = load(selector_path)
view_path = Path(selector['view']['path'])
assert pin(view_path) == selector['view']
view = load(view_path)
locator_path = B / 'current439-remediation14-neutral-whole-material-locators-root-v1/LOCATOR.28c-whole-current-cases-no-review-metadata.json'
assert pin(locator_path)['sha256'] == 'fdde9b53d2aa076693ce31d4a9d6cc9489b987f60247b504e26fdcb3cc218e89'
locator = load(locator_path)
whole_path = ROOT14 / 'MATERIAL.28c-five-whole-operative-cases.no-review-metadata.json'
assert pin(whole_path)['sha256'] == '6546f33f54c7c77ee20cf897cb68d688f69fdf7084591e97c7450c974220f83e'
old28 = load(whole_path)
before_pins = [pin(selector_path), pin(view_path), pin(locator_path), pin(whole_path)]
for r in old28['cases']:
    assert pin(r['sourceFile']['path']) == r['sourceFile']
    assert without_nonoperative_author_metadata(pointer(load(r['sourceFile']['path']), r['sourceJsonPointer'])) == r['wholeOperativeCase']
for f in locator['materialFiles']:
    assert pin(f['originalFile']['path']) == f['originalFile']
before_pins.extend([f['originalFile'] for f in locator['materialFiles']])

v1_selector_path = V1 / 'SELECTOR.four-targeted-P-author-successors.pending-independent-review.sealed.json'
assert pin(v1_selector_path)['sha256'] == '20b489a720be0d9a8ceb7a1d115b7484c39336f4e683d3475266fe62fec8c383'
v1_selector = load(v1_selector_path)
for r in v1_selector['artifacts']:
    assert pin(r['path']) == r
before_pins += [pin(v1_selector_path)] + v1_selector['artifacts']

# Retain the whole existing five-case container byte for byte. This retained file
# is not assigned as operative learner material for the interpretation goal.
retained_path = O / 'retained-original-cases/MATERIAL.28c-five-whole-original-cases.exact.json'
shutil.copyfile(whole_path, retained_path)
assert pin(retained_path)['sha256'] == pin(whole_path)['sha256']
write('retained-original-cases/ROLE.original-calculation-cases-retained.json', {
    'role': 'Exact old whole cases remain available for separately assigned computation goals; no new computation-goal assignment or curriculum credit is made here.',
    'originalContainer': pin(whole_path), 'exactRetainedCopy': pin(retained_path),
    'originalSourcePins': [f['originalFile'] for f in locator['materialFiles']],
    'operativeFor28cInterpretationV2': False,
    'instruction': 'Use only materials/28c.FIVE.complete-interpretation-projections.DE-EN.author-v2.json and its explicit bindings for the interpretation goal. The retained old calculation tasks/rubrics, including the nested monoproticWholeCase, are not inherited into that assignment.',
})

profiles = []
profile_sources = []
for gid in GOALS:
    vi = next(i for i,g in enumerate(view['goals']) if g['goalId'] == gid)
    e = view['goals'][vi]['reviewContext']['evidenceProfile']
    profiles.append({'goalId': gid, 'inputCurrentStatus': {k: e[k] for k in ['status', 'evidenceLevel', 'maximumClaimScope']},
                     'authorStatus': 'pending_two_genuine_targeted_independent_reviews', 'profile': copy.deepcopy(e['profile'])})
    profile_sources.append({'goalId': gid, 'sourceView': pin(view_path), 'jsonPointer': f'/goals/{vi}/reviewContext/evidenceProfile/profile'})
before_profiles = copy.deepcopy(profiles)
write('before/FOUR.current-full-profile-bodies.exact.json', {'role': 'Exact current whole profile bodies from safe frozen14 view; no raw review wrappers', 'sourcePointers': profile_sources, 'profiles': before_profiles})

old_p4_path = V1 / 'materials/FIVE.whole-bilingual-targeted-cases.author.json'
old_p4 = load(old_p4_path)
four = copy.deepcopy(old_p4['cases'][:4])
write('before/FOUR.current-complete-material-objects.exact.json', {'role': 'Exact own v1 whole material objects before bounded boundary correction', 'source': pin(old_p4_path), 'cases': copy.deepcopy(four)})
boundaries = {
    'nitrogen-mo-count': (
        'Bewertet werden das selbstständige Lesen und Zählen im bereitgestellten MO-Schema, die begründete Bindungsordnung und der gezeigte frische Transfer. Die Leistung wird am Diagramm und in der eigenen Erklärung erbracht. Für dieses Ziel ist kein chemischer Versuch erforderlich. Das Material begründet keine zusätzliche starre Fall- oder Aufgabenquote und behauptet keine bereits gezeigte Lernendenleistung.',
        'Assess independent reading and counting in the supplied MO scheme, justified bond order and demonstrated fresh transfer. Performance is shown through the diagram and the learner’s own explanation. This goal requires no chemical experiment. The material adds no fixed case or task quota and claims no learner performance already demonstrated.'),
    'fresh-oxygen-cation': (
        'Bewertet werden die selbstständig aus dem O2-Schema gewonnenen Besetzungsdaten, ihre Erklärung und die begründete Übertragung auf das Molekülion. Es handelt sich um Diagramm- und Modellarbeit; ein chemischer Versuch ist für dieses Ziel nicht erforderlich. Keine zusätzliche starre Fall- oder Aufgabenquote und kein Nachweis bereits erfolgter Lernendenarbeit werden behauptet.',
        'Assess occupations independently extracted from the O2 scheme, their explanation and justified transfer to the molecular ion. This is diagram and model work; this goal requires no chemical experiment. No additional fixed case or task quota or evidence of learner work already performed is asserted.'),
    'aromatic-nitronium-new-path': (
        'Bewertet werden die eigenständige Deutung des vorgegebenen Papiermodells, der Aromatizitätsschluss sowie begründeter frischer Transfer und Modellgrenzen. Eine experimentelle Nitrierung oder Hydrierung ist für dieses Ziel nicht erforderlich. Das Material führt keine zusätzliche starre Fall- oder Aufgabenquote ein und belegt keine bereits gezeigte Lernendenleistung.',
        'Assess independent interpretation of the supplied paper model, the aromaticity conclusion, justified fresh transfer and model limits. Experimental nitration or hydrogenation is not required for this goal. This material adds no fixed case or task quota and establishes no learner performance already demonstrated.'),
    'basf-indigo-1897-actual-sources': (
        'Bewertet werden die eigenständige quellenkritische wirtschaftliche Beurteilung am tatsächlich dokumentierten historischen Fall und begründeter Transfer. Dafür ist kein chemischer Versuch erforderlich. Firmeninteresse, begrenzte Quellenlage und die Trennung von Investition, Umsatz und Gewinn bleiben Bestandteil der Leistung. Keine zusätzliche starre Fallquote, erfolgte Recherche der lernenden Person oder Freigabe wird behauptet.',
        'Assess independent source-critical economic evaluation of the actually documented historical case and justified transfer. This requires no chemical experiment. Company interest, source limits and the distinction between investment, revenue and profit remain part of the performance. No additional fixed case quota, learner research already performed or approval is claimed.'),
}
boundary_deltas = []
for i,c in enumerate(four):
    before = copy.deepcopy(c)
    c['assessmentBoundaryDe'], c['assessmentBoundaryEn'] = boundaries[c['id']]
    assert {k:v for k,v in c.items() if k not in ['assessmentBoundaryDe','assessmentBoundaryEn']} == {k:v for k,v in before.items() if k not in ['assessmentBoundaryDe','assessmentBoundaryEn']}
    boundary_deltas.append({'goalId': c['goalId'], 'caseId': c['id'], 'changedFields': ['assessmentBoundaryDe', 'assessmentBoundaryEn'],
                            'before': {k: before[k] for k in ['assessmentBoundaryDe','assessmentBoundaryEn']},
                            'after': {k: c[k] for k in ['assessmentBoundaryDe','assessmentBoundaryEn']},
                            'allOtherWholeMaterialFieldsVerbatimUnchanged': True})
four_path = O / 'materials/FOUR.complete-material-objects.boundaries-only.author-v2.json'
write(str(four_path.relative_to(O)), {'schemaVersion': 2, 'role': 'Bounded author successor: four complete objects, only assessmentBoundaryDe/En changed', 'cases': four})

rows = old28['cases']
def oldcase(cid):
    return next(r['wholeOperativeCase'] for r in rows if r['caseId'] == cid)

def source(cid, relative=None):
    i,r = next((i,r) for i,r in enumerate(rows) if r['caseId'] == cid)
    out = {'originalFile': r['sourceFile'], 'jsonPointer': r['sourceJsonPointer'],
           'retainedWholeContainer': pin(retained_path), 'retainedJsonPointer': f'/cases/{i}/wholeOperativeCase'}
    if relative:
        out['selectedFieldPointer'] = r['sourceJsonPointer'] + relative
    return out

def acid_rows(cid):
    return [{'V_mL': a, 'pH': b} for a,b in re.findall(r'\|\s*([0-9.]+)\s*\|\s*([0-9.]+)\s*\|', oldcase(cid)['materialDe'])]

X, Y = acid_rows('T05-C1'), acid_rows('T05-C2')
assert len(X) == len(Y) == 12
T08 = [{'V_mL': '0.00', 'S_pH':'13.00','W_pH':'11.13'}, {'V_mL':'12.50','S_pH':'12.52','W_pH':'9.25'},
       {'V_mL':'25.00','S_pH':'7.00','W_pH':'5.28'}, {'V_mL':'30.00','S_pH':'2.04','W_pH':'2.04'}]
for r in T08:
    # The given source material has all eight pH values, not new measurements.
    assert r['S_pH'] in oldcase('T08-C2')['materialEn'] and r['W_pH'] in oldcase('T08-C2')['materialEn']
BASE = copy.deepcopy(T08)
BASE[0]['W_pH'] = '11.12'
POLY = copy.deepcopy(oldcase('POLY-QUALITATIVE-C1')['idealModelTable'])

def table(data, cols, headers):
    return '| ' + ' | '.join(headers) + ' |\n| ' + ' | '.join(['---']*len(cols)) + ' |\n' + '\n'.join('| '+' | '.join(str(r[k]) for k in cols)+' |' for r in data)

TABX = table(X, ['V_mL','pH'], ['V(NaOH) / mL','pH'])
TABY = table(Y, ['V_mL','pH'], ['V(NaOH) / mL','pH'])
TAB08 = table(T08,['V_mL','S_pH','W_pH'],['V(HCl) / mL','S: pH','W: pH'])
TABBASE = table(BASE,['V_mL','S_pH','W_pH'],['V(HCl) / mL','NaOH: pH','NH3: pH'])
TABPOLY = table(POLY,['addedNaOH_mL','idealModelPH'],['V(NaOH) / mL','Glycin / glycine: pH'])

COMMON_DE = 'Vorgegebene synthetische ideale Lehrdaten, keine Messung und keine bereits erbrachte Lernendenleistung. 25 °C, Aktivitäten durch Konzentrationen angenähert (γ=1), Kᵥ=10⁻¹⁴ und additive Volumina. Alle für diese Auswertung benötigten pH-Werte, charakteristischen Volumina und Konstantenwerte werden angegeben. Sie sollen gelesen, verglichen und erklärt werden; eine pH-, pK-, Konzentrations- oder Zwischenpunktrechnung wird weder verlangt noch bepunktet. Zahlenvergleich und das Kennzeichnen vorgegebener Punkte bleiben Teil der Dateninterpretation.'
COMMON_EN = 'Supplied synthetic ideal teaching data, not measurements or learner performance already demonstrated. 25 °C, concentrations approximate activities (γ=1), Kw=10⁻¹⁴ and additive volumes. All pH values, characteristic volumes and constant values needed for this interpretation are given. Read, compare and explain them; no pH, pK, concentration or intermediate-point calculation is required or scored. Comparing numbers and marking supplied points remain part of data interpretation.'
LIMIT_DE = 'Indikatorendpunkt, chemische Äquivalenz und Neutralität sind verschiedene Begriffe. Ohne festgelegtes Farbkriterium und ausreichende Kurvenauflösung liefert ein Übergangsintervall keinen exakten Volumenfehler. Aus einer Kurve allein folgt keine eindeutige Molekülidentität.'
LIMIT_EN = 'Indicator endpoint, chemical equivalence and neutrality are distinct. Without a specified colour criterion and sufficient curve resolution, a transition interval supplies no exact volume error. A curve alone does not establish unique molecular identity.'
BOUND_DE = 'Bewertet werden die tatsächlich gezeigte eigenständige Datendeutung, die Erklärung durch Spezies und der erforderliche Transfer im vorhandenen Fallpool. Das ist eine Auswertungsleistung ohne Laborpflicht. Keine neue starre Fall- oder Aufgabenquote; die unveränderten globalen Profilanforderungen bleiben maßgeblich. Keine erfolgte Messung, Lernendenleistung oder unabhängige Freigabe wird behauptet.'
BOUND_EN = 'Assess actually demonstrated independent data interpretation, explanation through species and required transfer within the existing case pool. This is interpretation work with no laboratory obligation. There is no new fixed case or task quota; the unchanged global profile requirements remain applicable. No measurement, learner performance or independent approval already obtained is claimed.'

def criterion(cid, q, de, en):
    return {'id': cid+'-'+q, 'profileExpectationIds': [q], 'points':3,
            'fullCreditDe':de, 'fullCreditEn':en,
            'partialCreditDe':'2: fachlich richtiger Zusammenhang mit begrenzter Lücke; 1: richtiger Einzelaspekt ohne erforderliche Verknüpfung; 0: fehlend oder fachlich falsch. Keine Rechnung als Zusatzbedingung.',
            'partialCreditEn':'2: correct connection with a limited gap; 1: an isolated correct aspect without the required connection; 0: absent or scientifically wrong. No calculation as an additional condition.'}

def make(cid, titlede, titleen, mde, men, qde, qen, ede, een, criteria, data, sourceids, fresh):
    c = {'caseId':cid, 'authorVersion':2, 'assignedGoalId':G28, 'role':'operative interpretation-only projection of retained original case',
         'titleDe':titlede, 'titleEn':titleen, 'materialDe':COMMON_DE+'\n\n'+mde+'\n\n'+LIMIT_DE,
         'materialEn':COMMON_EN+'\n\n'+men+'\n\n'+LIMIT_EN,
         'providedData':data, 'questionsDe':qde, 'questionsEn':qen,
         'taskDemandDe':'\n'.join(f'{i+1}. {s}' for i,s in enumerate(qde)), 'taskDemandEn':'\n'.join(f'{i+1}. {s}' for i,s in enumerate(qen)),
         'expectedPerformanceDe':ede,'expectedPerformanceEn':een,'rubric':criteria,'maximumDesignPoints':sum(x['points'] for x in criteria),
         'freshTransfer':fresh,'assessmentBoundaryDe':BOUND_DE,'assessmentBoundaryEn':BOUND_EN,
         'originalMaterialBindings':[source(x) for x in sourceids],
         'notInheritedIntoThisProjection':['old numerical calculation demands and numerical derivation scoring','nested old whole-case calculation tasks'],
         'scientificReasoningRequired':True,'practicalExecutionRequired':False,'actualObservationRecords':[], 'actualLearnerWork':None,'actualPointsAwarded':None,
         'authorStatus':'pending_two_genuine_targeted_independent_reviews','independentApproval':False,
         'license':'CC-BY-4.0; own teaching projection, original source rights and prior licenses preserved'}
    return c

projections = []
cid='T05-C1'
projections.append(make(cid,'Säurekurve X aus vorgegebenen Daten deuten','Interpret acid curve X from supplied data',
    'Je 25,00 mL einer formal einprotonigen Säure mit c=0,100 mol/L; Titrant NaOH 0,100 mol/L. Unter den Modellalternativen stehen eine starke oder schwache einprotonige Säure, keine Gemische oder weiteren Protolyse-Stufen. X bezeichnet nur die Probe.\n\n'+TABX+'\n\nGegeben: formale Ausgangsmenge 2,500 mmol, Äquivalenzvolumen 25,00 mL, halbes Äquivalenzvolumen 12,50 mL. Indikatorintervalle: Methylorange 3,1–4,4; BTB 6,0–7,6; Phenolphthalein 8,2–10,0. Separater Temperaturvergleich aus dem Originalfall: starke Säure/starke Base, nicht hydrolysierende Gegenionen, pKᵥ=13,20 und vorgegebener neutraler pH=6,60; bei 25 °C im Tabellenmodell neutraler pH=7,00.',
    '25.00 mL of a formally monoprotic acid, c=0.100 mol/L; titrant 0.100 mol/L NaOH. Allowed alternatives are a strong or weak monoprotic acid, excluding mixtures and further dissociation stages. X is only a sample label.\n\n'+TABX+'\n\nGiven: formal initial amount 2.500 mmol, equivalence volume 25.00 mL and half-equivalence volume 12.50 mL. Indicator intervals: methyl orange 3.1–4.4; BTB 6.0–7.6; phenolphthalein 8.2–10.0. Separate temperature comparison from the original case: strong acid/strong base, non-hydrolysing counterions, pKw=13.20 and given neutral pH=6.60; the 25 °C table model has neutral pH=7.00.',
    ['Beschreibe Kurvenrichtung und Sprungregion mit konkreten gegebenen Werten. Welche der erlaubten Säureklassen wird dadurch gestützt?',
     'Erkläre die pH-bestimmenden Spezies vor, bei und nach dem gegebenen Äquivalenzvolumen. Ist der Halbpunkt bei 12,50 mL ein Beleg für einen schwachen HA/A⁻-Puffer oder pKₐ?',
     'Beurteile BTB und die Alternativen anhand der tatsächlichen Tabelle und ihrer Intervalle. Begrenze Aussagen zum exakten Endpunktfehler und zur Identität von X.',
     'Erkläre am bereits vorgegebenen Temperaturvergleich, warum neutral nicht immer pH 7 bedeutet und Äquivalenz nicht durch eine universelle pH-Zahl definiert wird.'],
    ['Describe curve direction and the jump region using actual supplied values. Which allowed acid class is supported?',
     'Explain the pH-controlling species before, at and after the given equivalence volume. Does the half-volume at 12.50 mL establish a weak HA/A⁻ buffer or pKa?',
     'Assess BTB and alternatives using the actual table and their intervals. Limit claims about exact endpoint error and X’s identity.',
     'Use the already given temperature comparison to explain why neutral does not always mean pH 7 and equivalence is not defined by a universal pH value.'],
    'X passt im Modell zur starken einprotonigen Säure: Anfang 1,000, am formalen Halbpunkt 1,477, steiler Anstieg 4,398→9,602 zwischen 24,98 und 25,02 mL. Vor Äquivalenz ist H₃O⁺ im Überschuss, bei Äquivalenz bestimmen Wasser und nicht hydrolysierende Gegenionen den neutralen Modell-pH, danach OH⁻-Überschuss. Am Halbvolumen liegt kein HA/A⁻-Puffer vor; der Zahlenwert ist kein pKₐ-Beweis. BTB ist ein durch die enge Sprungregion begründeter Kandidat; Methylorange oder Phenolphthalein sind toleranzabhängig zu beurteilen, kein exakter Endpunkt ist festgelegt. Die vorgegebenen neutralen Werte 7,00 bzw. 6,60 gehören zu unterschiedlichen pKᵥ-Bedingungen, während Äquivalenz stöchiometrisch definiert bleibt.',
    'X fits a strong monoprotic acid in this model: initial 1.000, formal half-volume 1.477 and steep increase 4.398→9.602 between 24.98 and 25.02 mL. H₃O⁺ excess controls before equivalence; water and non-hydrolysing counterions give the neutral model pH at equivalence; OH⁻ excess controls afterwards. Half-volume is not an HA/A⁻ buffer or evidence for pKa. BTB is supported by the narrow jump; methyl orange or phenolphthalein depend on tolerance, and no exact endpoint is set. Given neutral values 7.00 and 6.60 belong to different pKw conditions; equivalence remains stoichiometrically defined.',
    [criterion(cid,'q1','Ordnet X mit Anfangs-, Halb- und Sprungdaten stark zu; benennt Modellalternativen und Identifikationsgrenze.','Classifies X as strong from initial, half-volume and jump data; states model alternatives and identity limit.'),
     criterion(cid,'q2','Erklärt H₃O⁺/Wasser/OH⁻ und warum halbes Volumen hier keinen schwachen Puffer und pKₐ belegt.','Explains H₃O⁺/water/OH⁻ and why half-volume establishes no weak buffer or pKa here.'),
     criterion(cid,'q3','Begründet Indikatorkandidaten am tatsächlichen Intervall und trennt Farbe, Äquivalenz und fehlenden exakten Volumenfehler.','Justifies indicator candidates from actual intervals; distinguishes colour, equivalence and absent exact volume error.'),
     criterion(cid,'q4','Erklärt die bereits gegebenen neutralen Werte unter den zwei Bedingungen ohne erneute pH-Rechnung.','Explains the already given neutral values under the two conditions without recalculating pH.')],
    {'acidTable':X,'formalAmount_mmol':'2.500','equivalenceVolume_mL':'25.00','halfVolume_mL':'12.50','temperatureComparison':{'pKw':'13.20','givenNeutralPH':'6.60','source':source(cid,'/modelAnswerDe')}}, [cid],
    {'taskDe':'Frischer Vergleich nach eigener Deutung, soweit für Transfer erforderlich: Im separaten starken Säure/Base-System sind pKᵥ=13,20 und neutraler pH=6,60 bereits gegeben. Widerlege die Behauptung, der Wert 6,60 beweise dort eine schwache Säure.',
     'taskEn':'Fresh comparison after independent interpretation, as needed for transfer: the separate strong-acid/base system already gives pKw=13.20 and neutral pH=6.60. Refute the claim that 6.60 proves a weak acid there.',
     'expectedDe':'Der Wert beschreibt die geänderte Neutralitätsbedingung und beweist keine schwache Säure; die nicht hydrolysierenden Gegenionen bleiben Teil des gegebenen Systems.',
     'expectedEn':'It describes changed neutrality and does not establish a weak acid; non-hydrolysing counterions remain part of the supplied system.'}))

cid='T05-C2'
projections.append(make(cid,'Säurekurve Y und Vergleich zu X auswerten','Interpret acid curve Y and compare it with X',
    'Die gleichen Volumina, Konzentrationen und erlaubten Klassen wie bei X; Y ist eine andere unbekannte Probe.\n\n'+TABY+'\n\nGegeben: formale Ausgangsmenge 2,500 mmol, Äquivalenzvolumen 25,00 mL, Halbäquivalenzvolumen 12,50 mL und als Modellinformation näherungsweise pKₐ(HA)=4,76. HA ist die Säure, A⁻ ihre korrespondierende Base. Indikatorintervalle: BTB 6,0–7,6; Phenolphthalein 8,2–10,0. Zum Vergleich sind die vollständige X-Tabelle und deren unveränderte Anfangsmenge beigefügt:\n\n'+TABX,
    'The same volumes, concentrations and allowed classes as X; Y is a different unknown sample.\n\n'+TABY+'\n\nGiven: formal amount 2.500 mmol, equivalence volume 25.00 mL, half-equivalence volume 12.50 mL and approximate model pKa(HA)=4.76. HA is the acid and A⁻ its conjugate base. Indicator intervals: BTB 6.0–7.6; phenolphthalein 8.2–10.0. The complete X table with unchanged initial amount is provided for comparison:\n\n'+TABX,
    ['Begründe aus dem Verlauf von Y die Säureklasse und erläutere den Unterschied zu X bei gleicher formaler Menge.',
     'Kennzeichne den vorhandenen Pufferbereich, Halbäquivalenz und Äquivalenz anhand der gegebenen Volumina und Werte. Erkläre die Rollen von HA/A⁻, A⁻-Protolyse und späterem OH⁻-Überschuss.',
     'Begründe Phenolphthalein oder beurteile BTB anhand der Tabelle. Welche Aussagen über Farbumschlag, Volumenfehler und Molekülidentität sind nicht gesichert?',
     'Vergleiche mit X: Welche gegebenen Äquivalenzvolumina und Überschusswerte sind gleich, welche Anfangs-, Puffer- und Äquivalenzbereiche verschieden? Begründe die Ursache, ohne Zahlen neu herzuleiten.'],
    ['Use Y’s curve to justify the acid class and explain its difference from X at equal formal amount.',
     'Mark the existing buffer region, half-equivalence and equivalence using given volumes and values. Explain HA/A⁻, A⁻ protolysis and later OH⁻ excess.',
     'Justify phenolphthalein or assess BTB against the table. Which claims about colour change, volume error and molecular identity are unsupported?',
     'Compare X: which given equivalence volumes and excess values agree, and which initial, buffer and equivalence regions differ? Explain the cause without deriving numbers again.'],
    'Y ist schwach: 2,883 zu Beginn statt X=1,000; flacherer HA/A⁻-Bereich mit 4,284/4,760/5,237; basischer Äquivalenzwert 8,730. Bei passendem schwachem Paar und näherungsweise gleichen Mengen erklärt der Halbpunkt das gegebene pH≈pKₐ; dies ist keine Regel für jede Kurve. A⁻ erzeugt mit Wasser HA und OH⁻ am Äquivalenzpunkt. Bei 30,00 mL stimmen X/Y bei 11,959 überein, weil der gleiche starke Baseüberschuss dominiert. Phenolphthalein liegt im basischen Sprung; BTB wechselt früher. Exakter Farb-Endpunkt/Volumenfehler und eindeutige Stoffidentität folgen nicht. Gleiche formale Menge erklärt gleiches Äquivalenzvolumen, Stärke und Gleichgewicht erklären die übrigen Unterschiede.',
    'Y is weak: initial 2.883 rather than X=1.000; flatter HA/A⁻ region at 4.284/4.760/5.237; basic equivalence pH 8.730. With the appropriate weak conjugate pair and approximately equal amounts, half-equivalence explains given pH≈pKa; this is not a rule for every curve. At equivalence A⁻ reacts with water to give HA and OH⁻. At 30.00 mL X/Y both have 11.959 because the same strong-base excess dominates. Phenolphthalein lies in the basic jump; BTB changes earlier. Exact colour endpoint/volume error and unique identity are not established. Equal formal amount explains equal equivalence volume; strength and equilibrium explain other differences.',
    [criterion(cid,'q1','Begründet schwache Säure anhand der tatsächlich gegebenen Y/X-Werte statt bloß die Konstantenangabe zu wiederholen.','Justifies weak acid from actual Y/X data rather than merely repeating the given constant.'),
     criterion(cid,'q2','Erklärt HA/A⁻-Puffer, bedingten Halbpunkt, A⁻-Protolyse und OH⁻-Überschuss ohne Pflichtrechnung.','Explains HA/A⁻ buffering, conditional halfpoint, A⁻ protolysis and OH⁻ excess without compulsory calculation.'),
     criterion(cid,'q3','Begründet Indikatorpassung und begrenzt exakten Farb-/Volumenfehler sowie Identität.','Justifies indicator suitability and bounds exact colour/volume error and identity.'),
     criterion(cid,'q4','Trennt gleiche formale Menge/Äquivalenzverbrauch von den durch Stärke verursachten Unterschieden.','Separates equal formal amount/equivalence consumption from strength-driven differences.')],
    {'acidYTable':Y,'acidXTableForComparison':X,'given_pKa_HA':'4.76','formalAmount_mmol':'2.500','equivalenceVolume_mL':'25.00','halfVolume_mL':'12.50'},[cid,'T05-C1'],
    {'taskDe':'Frischer Vergleich im bestehenden Pool: X und Y haben bei 30,00 mL beide pH 11,959 und bei 25,00 mL die Werte 7,000 bzw. 8,730. Erkläre, weshalb gleiche Überschusswerte keine gleiche Säurestärke beweisen.',
     'taskEn':'Fresh comparison within the existing pool: X and Y both have pH 11.959 at 30.00 mL but 7.000 and 8.730 at 25.00 mL. Explain why equal excess values do not prove equal acid strength.',
     'expectedDe':'Im Überschuss dominiert der gleiche starke Titrant; bei Äquivalenz unterscheiden sich nicht hydrolysierende Gegenionen und die basische Protolyse von A⁻.',
     'expectedEn':'The same strong titrant dominates in excess; at equivalence non-hydrolysing counterions differ from basic A⁻ protolysis.'}))

cid='T08-C2'
projections.append(make(cid,'Fallende Basenkurven S und W deuten','Interpret falling base curves S and W',
    'Je 25,00 mL einer formal einprotonigen Base, c=0,100 mol/L; Titrant HCl 0,100 mol/L. Die Probennamen legen keine Molekülidentität fest. Vorgegebene Original-Modellpunkte:\n\n'+TAB08+'\n\nGegeben: Äquivalenzvolumen beider Proben 25,00 mL, halbes Äquivalenzvolumen 12,50 mL, formale Anfangsmenge je 2,500 mmol. Für die schwache Route werden B/BH⁺ und die bereits angegebenen Modellkonstanten pKₐ(BH⁺)=9,25 sowie pKᵦ(B)=4,75 bereitgestellt. Indikatorbereiche: Methylrot 4,4–6,2; Phenolphthalein 8,2–10,0. Der Anfangswert 11,13 ist der im Original verwendete Näherungswert, keine Messung. Vier Punkte legen den exakten Verlauf zwischen ihnen nicht fest.',
    '25.00 mL of each formally monoprotic base, c=0.100 mol/L; titrant 0.100 mol/L HCl. Sample labels do not supply molecular identity. Original supplied model points:\n\n'+TAB08+'\n\nGiven: equivalence volume 25.00 mL for both, half-equivalence volume 12.50 mL and initial formal amount 2.500 mmol each. For the weak route B/BH⁺ is supplied together with already stated model pKa(BH⁺)=9.25 and pKb(B)=4.75. Indicator ranges: methyl red 4.4–6.2; phenolphthalein 8.2–10.0. Initial 11.13 is the approximation used in the original, not a measurement. Four points do not fix the exact curve between them.',
    ['Erkläre die fallende Richtung und ordne S/W anhand der gegebenen Anfangs-, Halb- und Äquivalenzwerte stark oder schwach zu.',
     'Erkläre bei W das vorhandene B/BH⁺-Paar und die saure Protolyse von BH⁺ am gegebenen Äquivalenzpunkt. Warum ist der S-Halbpunkt kein schwacher Puffer?',
     'Vergleiche Methylrot und Phenolphthalein für W anhand der Werte und Intervalle. Unterscheide einen begründeten Kandidaten von einer exakt gesicherten Endpunktabweichung.',
     'Nutze den bereitgestellten Vergleichswert der schwachen Säure Y (Äquivalenz-pH 8,730, Spezies A⁻): Begründe die entgegengesetzte pH-Abweichung zu W=5,28. Welche Grenzen hat eine Stoffidentifikation aus diesen Modellkurven?'],
    ['Explain the falling direction and classify S/W as strong or weak using given initial, half-volume and equivalence values.',
     'Explain W’s existing B/BH⁺ pair and acidic BH⁺ protolysis at the given equivalence point. Why is S’s half-volume not a weak buffer?',
     'Compare methyl red and phenolphthalein for W using values and intervals. Distinguish a justified candidate from an exactly established endpoint deviation.',
     'Use the supplied weak-acid Y comparison (equivalence pH 8.730, species A⁻) to explain its opposite pH deviation from W=5.28. What are the identity limits of these model curves?'],
    'S ist im Modell stark, W schwach; HCl verbraucht OH⁻ bzw. protoniert B, daher sinkt der pH. Bei W vor Äquivalenz B/BH⁺, bei halber formaler Menge näherungsweise gleiches Paar und pH≈9,25. Am Äquivalenzpunkt gibt BH⁺ Protonen an Wasser ab und bildet H₃O⁺, daher 5,28. S hat am Halbvolumen noch starken OH⁻-Rest (12,52), keinen B/BH⁺-Puffer; bei Äquivalenz unter den 25-°C-Annahmen 7,00. Methylrot umfasst W=5,28 als begründeter Kandidat; Phenolphthalein erfasst schon W=9,25 am Halbpunkt. Vier Punkte und fehlendes Farbkriterium erlauben keinen exakten Volumenfehler. Y hinterlässt basisches A⁻, W saures BH⁺; Titrantstärke allein macht Äquivalenz nicht neutral. Gleiche formale Mengen erklären den gleichen Verbrauch; Klasse und Konstanten bestimmen keine eindeutige Molekülidentität.',
    'S is strong and W weak in this model. HCl consumes OH⁻ or protonates B, lowering pH. W contains B/BH⁺ before equivalence; near equal formal amounts give pH≈9.25 at half-equivalence. At equivalence BH⁺ donates protons to water, producing H₃O⁺ and pH 5.28. S retains strong OH⁻ at half-volume (12.52), not a B/BH⁺ buffer; equivalence is 7.00 under the 25 °C assumptions. Methyl red covers 5.28 as a justified candidate, whereas phenolphthalein already covers W=9.25 at half-volume. Four points and no colour criterion supply no exact volume error. Y leaves basic A⁻ and W acidic BH⁺; titrant strength alone does not make equivalence neutral. Equal formal amounts explain equal consumption; class and constants do not establish a unique molecule.',
    [criterion(cid,'q1','Ordnet S/W mit tatsächlichen Daten zu und erklärt fallende Richtung und gleiche formale Menge.','Classifies S/W from actual data and explains falling direction and equal formal amount.'),
     criterion(cid,'q2','Erklärt B/BH⁺, BH⁺-Protolyse und fehlenden schwachen Puffer bei S; leitet keinen pK-Wert rechnerisch her.','Explains B/BH⁺, BH⁺ protolysis and absence of a weak buffer for S; no numerical derivation of pK is required.'),
     criterion(cid,'q3','Beurteilt Indikatorintervalle, frühen Phenolphthaleinbereich und Auflösungs-/Farbgrenze.','Assesses indicator intervals, early phenolphthalein region and resolution/colour limits.'),
     criterion(cid,'q4','Vergleicht saures BH⁺ mit basischem A⁻ und begrenzt Stoffidentität statt einer allgemeinen Neutralitätsregel.','Compares acidic BH⁺ with basic A⁻ and limits identity instead of applying universal neutral-equivalence rules.')],
    {'originalModelPoints':T08,'given_pKa_BHplus':'9.25','given_pKb_B':'4.75','givenEquivalenceVolume_mL':'25.00','givenHalfVolume_mL':'12.50','weakAcidComparison':{'pH':'8.730','species':'A−','source':source('T05-C2')}},[cid,'T05-C2'],
    {'taskDe':'Frischer Speziesvergleich mit vorgegebenen Zahlen: schwache Base W am Äquivalenzpunkt 5,28, schwache Säure Y 8,730. Ein Mitschüler erklärt beide als neutral, weil jeweils ein starker Titrant verwendet wurde. Korrigiere die Begründung.',
     'taskEn':'Fresh species comparison with given numbers: weak-base W equivalence 5.28 and weak-acid Y equivalence 8.730. A learner calls both neutral because each uses a strong titrant. Correct the reasoning.',
     'expectedDe':'Die verbleibenden korrespondierenden Spezies BH⁺ bzw. A⁻ protolysieren verschieden; die formale Äquivalenz ist keine Garantie für neutrale Lösung.',
     'expectedEn':'Remaining conjugate species BH⁺ and A⁻ undergo different protolysis; formal equivalence does not guarantee a neutral solution.'}))

cid='POLY-QUALITATIVE-C1'
projections.append(make(cid,'Ein- und zweistufige vorgegebene Modellkurven vergleichen','Compare supplied one-stage and two-stage model curves',
    '25,00 mL enthalten formal 2,500 mmol Glycin und 2,500 mmol Cl⁻. Startform H₂G⁺; eine Gleichgewichtsverteilung ist zugelassen. Vorgegebene Strukturen: H₂G⁺=H₃N⁺–CH₂–COOH; HG±=H₃N⁺–CH₂–COO⁻ (Zwitterion); G⁻=H₂N–CH₂–COO⁻. Gegeben: pKₐ₁=2,34, pKₐ₂=9,60, NaOH 0,1000 mol/L. Formale Stufenmarken liegen bei 25,00 und 50,00 mL; zugehörige halbe Stufenvolumina 12,50 und 37,50 mL. Die folgende vollständige originale Tabelle stammt aus Stoff-/Ladungsbilanz:\n\n'+TABPOLY+'\n\nVergleichskurve Y: formal gleiche Glycin/HA-Molekülmenge, aber nur ein abspaltbares Proton im HA-Modell; dieselbe Y-Tabelle wie oben vollständig beigefügt:\n\n'+TABY+'\n\nDie formale Hälfte eines Zugabevolumens bedeutet bei zugelassener Anfangsprotolyse nicht zwingend ein exakt gleiches tatsächliches Speziesverhältnis. Alle gezeigten pH-Werte sind bereits vorgegeben; keine neue Gleichgewichtsrechnung.',
    '25.00 mL contains 2.500 mmol formal glycine and 2.500 mmol Cl⁻. Initial form H₂G⁺ permits equilibrium redistribution. Given structures: H₂G⁺=H₃N⁺–CH₂–COOH; HG±=H₃N⁺–CH₂–COO⁻ (zwitterion); G⁻=H₂N–CH₂–COO⁻. Given pKa1=2.34, pKa2=9.60 and 0.1000 mol/L NaOH. Formal stage markers are 25.00 and 50.00 mL; half-stage volumes are 12.50 and 37.50 mL. Complete original mass/charge-balance table:\n\n'+TABPOLY+'\n\nY comparison: equal formal glycine/HA molecular amount but only one removable proton in the HA model; the same complete Y table is provided:\n\n'+TABY+'\n\nHalf the formal added volume does not necessarily mean an exactly equal actual species ratio when initial protolysis is allowed. All pH values are already supplied; no new equilibrium calculation.',
    ['Lies oder skizziere die Tabellen mit beschrifteten Achsen. Ordne die gegebenen formalen Stufen und die wechselnden Paare H₂G⁺/HG± und HG±/G⁻ zu; beschreibe, wie deutlich die Stufen in der Grobtabelle ausgeprägt sind.',
     'Erkläre die flacheren Bereiche anhand beider pK-Werte und Speziespaare. Warum ist pH um 6 zwischen diesen Bereichen kein ausgeprägter Glycin-Puffer? Vergleiche die bereits gegebenen Halbpunktwerte 2,435896 und 9,598278 mit 2,34 bzw. 9,60, ohne sie nachzurechnen.',
     'Vergleiche gleiche formale Molekülmenge mit einer bzw. zwei vorgegebenen Neutralisationsstufen. Was darf aus Kurvenform und Menge geschlossen werden, was nicht?',
     'Korrigiere die Behauptungen, jedes mehrprotonige System zeige zwei gleich scharfe Sprünge und ein einziger pH-Wert oder ein formaler Halbpunkt identifiziere die Substanz eindeutig.'],
    ['Read or sketch the tables with labelled axes. Assign the given formal stages and changing H₂G⁺/HG± and HG±/G⁻ pairs; describe how clearly the stages appear in the coarse table.',
     'Explain flatter regions using both pKa values and species pairs. Why is pH near 6 between them not a prominent glycine buffer? Compare the already given halfpoint values 2.435896 and 9.598278 with 2.34 and 9.60 without recalculating them.',
     'Compare equal formal molecular amount with one versus two given neutralisation stages. What can and cannot be inferred from shape and amount?',
     'Correct claims that every polyprotic system gives two equally sharp jumps and that one pH value or a formal halfpoint uniquely identifies a substance.'],
    'Die Glycinkurve besitzt im gegebenen Modell zwei formale Neutralisationsstufen, die HA-Kurve eine. Der erste Glycinanstieg ist in 24/25/26 mL mit 3,760349/5,988831/8,219423 deutlich; die zweite Stufe um 50 mL ist in der Tabelle wesentlich weniger scharf ausgeprägt und wird nicht als gleich großer Sprung erfunden. Vor der ersten Stufe wirken H₂G⁺/HG±, vor der zweiten HG±/G⁻; an der ersten dominiert der Ampholyt HG±, später G⁻ und schließlich OH⁻-Überschuss. Pufferung liegt vor allem nahe 2,34 und 9,60, nicht im mittleren pH-6-Bereich. Der erste formale Halbpunkt 2,435896 ist nicht exakt pKₐ₁; Gleichgewichtsverteilung und tatsächliche gegenüber formalen Mengen begrenzen die einfache Halbpunktregel. Der zweite liegt hier näherungsweise bei 9,60. Die gleichen Molekülmengen führen bei zwei Protonenschritten zu anderem Gesamtverbrauch; sie garantieren weder gleiche Äquivalenz-pH-Werte noch eindeutige Stoffidentität. Keine allgemeine Zwei-Sprung-Regel für alle mehrprotonigen Stoffe.',
    'The glycine model has two formal neutralisation stages, while HA has one. The first glycine rise is clear at 24/25/26 mL with 3.760349/5.988831/8.219423; the second near 50 mL is much less sharp in the table and is not invented as an equally large jump. H₂G⁺/HG± acts before the first stage and HG±/G⁻ before the second; ampholyte HG± dominates at the first, followed by G⁻ and eventually OH⁻ excess. Main buffering lies near 2.34 and 9.60, not in the middle pH-6 region. First formal halfpoint 2.435896 is not exactly pKa1; equilibrium redistribution and actual versus formal amounts limit the simple halfpoint rule. The second is approximately 9.60 here. Equal molecular amounts have different overall consumption with two proton steps; they guarantee neither equal equivalence pH nor unique identity. There is no universal two-sharp-jump rule for all polyprotic substances.',
    [criterion(cid,'q1','Vergleicht die vollständigen real vorgegebenen Modelltabellen, Achsen und unterschiedlich ausgeprägten Stufen ohne zusätzliche Daten zu erfinden.','Compares complete actually supplied model tables, axes and differently pronounced stages without inventing data.'),
     criterion(cid,'q2','Ordnet beide Speziespaare, Ampholyt und Pufferregionen zu; begrenzt die exakte formale Halbpunktregel.','Assigns both species pairs, ampholyte and buffer regions; bounds the exact formal-halfpoint rule.'),
     criterion(cid,'q3','Begründet die begrenzte Übertragbarkeit aus Stoffklasse/Kurve ohne eindeutige Identifikation oder allgemeine Sprungzahl.','Justifies limits on class/curve inference without unique identification or universal jump count.'),
     criterion(cid,'q4','Erklärt gleiche Molekülmenge gegenüber unterschiedlicher Protonenschrittzahl und die Ursache verschiedener Äquivalenzbereiche.','Explains equal molecular amount versus different proton-step count and different equivalence regions.')],
    {'glycineIdealModelTable':POLY,'monoproticYTable':Y,'given_pKa1':'2.34','given_pKa2':'9.60','givenFormalStageVolumes_mL':['25.00','50.00'],'givenHalfStageVolumes_mL':['12.50','37.50']},[cid,'T05-C2'],
    {'taskDe':'Frischer Vergleich aus den gegebenen Tabellen: Bei 25,00 mL hat Glycin pH 5,988831, Y dagegen 8,730. Widerlege, gleiche formale Molekülmenge und Titrantmenge müssten denselben Äquivalenz-pH erzeugen.',
     'taskEn':'Fresh comparison from supplied tables: at 25.00 mL glycine has pH 5.988831, while Y has 8.730. Refute the claim that equal formal molecular and titrant amounts must yield equal equivalence pH.',
     'expectedDe':'Die formalen Mengen legen die Stufenmenge fest, nicht die Protolyseeigenschaften: Ampholyt HG± und A⁻ haben verschiedene Gleichgewichte; Glycin besitzt zudem eine zweite Protonenstufe.',
     'expectedEn':'Formal amounts set stage consumption, not protolysis properties: ampholyte HG± and A⁻ have different equilibria; glycine also has a second proton step.'}))

cid='strong-and-weak-bases-four-characteristic-points'
projections.append(make(cid,'Vorgegebene Basen-Modellpunkte und Indikatoren auswerten','Interpret supplied base model points and indicators',
    'Auswertung der im erhaltenen BASE-Ganzfall bereits angegebenen Modellantworten, keine neu erzeugten Messwerte: je 25,00 mL NaOH oder NH3(aq), formal 0,100 mol/L, titriert mit HCl 0,100 mol/L. Na⁺/Cl⁻ sind Zuschauerionen, kein CO₂-Eintrag oder NH3-Verlust; NH3/NH4⁺-Protolyse bleibt Teil des Modells. Gegeben: Ausgangsmenge je 2,500 mmol, Äquivalenzvolumen 25,00 mL, Halbvolumen 12,50 mL, pKᵦ(NH3)=4,75, pKₐ(NH4⁺)=9,25. Die folgenden Werte werden als Material bereitgestellt und müssen nicht berechnet werden:\n\n'+TABBASE+'\n\nDer ursprüngliche genauer gelöste NH3-Anfangswert ist gerundet 11,12; die dort ebenfalls angegebene Wurzelnäherung gibt 11,13. Die Differenz ist eine Modell-/Näherungsfrage, kein Messbefund. Weitere im Original bereits gegebene NH3-Modellpunkte: 24,90 mL → pH≈6,85; 25,10 mL → pH≈3,70; bei etwa 22,95 mL pH≈8,20. Indikatorintervalle: Methylrot 4,4–6,2; BTB 6,0–7,6; Phenolphthalein 8,2–10,0. Für NaOH sind nur die vier Tabellenpunkte gegeben; ihr genauer Zwischenverlauf wird nicht als gemessen behauptet.',
    'Interpret model answers already present in the retained BASE whole case, not newly generated measurements: 25.00 mL each of NaOH or NH3(aq), formal 0.100 mol/L, titrated with 0.100 mol/L HCl. Na⁺/Cl⁻ are spectators, with no CO₂ ingress or NH3 loss; NH3/NH4⁺ protolysis remains part of the model. Given: initial amount 2.500 mmol each, equivalence volume 25.00 mL, half-volume 12.50 mL, pKb(NH3)=4.75 and pKa(NH4⁺)=9.25. The following values are supplied material and need not be calculated:\n\n'+TABBASE+'\n\nThe original more completely solved NH3 initial value rounds to 11.12; its also supplied square-root approximation gives 11.13. This is a model/approximation difference, not an observed measurement. Further NH3 model points already provided in the original: 24.90 mL → pH≈6.85; 25.10 mL → pH≈3.70; about 22.95 mL gives pH≈8.20. Indicator intervals: methyl red 4.4–6.2; BTB 6.0–7.6; phenolphthalein 8.2–10.0. NaOH has only the four table points; no exact intermediate trace is claimed as measured.',
    ['Vergleiche Anfangs-, Halb-, Äquivalenz- und Überschussabschnitt anhand der vorgegebenen Werte und markiere sie in einer ausdrücklich schematischen Kurve. Erkläre gleiche formale Menge bei unterschiedlicher Stärke.',
     'Erkläre OH⁻-Rest bei NaOH, NH3/NH4⁺-Puffer bei NH3, NH4⁺-Protolyse am Äquivalenzpunkt und den gemeinsamen späteren H₃O⁺-Überschuss. Alle Konstanten und pH-Werte sind bereits gegeben.',
     'Beurteile Methylrot für NH3 anhand der vorgegebenen Punkte um 25,00 mL. Erkläre mit dem gegebenen 22,95-mL-Punkt die mögliche frühe Phenolphthalein-Anzeige und die Richtung einer Stoffmengenverzerrung; berechne keinen Endpunkt oder Zahlenfehler.',
     'Begründe BTB als Kandidaten für den neutralen NaOH-Bereich, benenne aber die Grenze der nur vier Punkte und des fehlenden Farbkriteriums. Erläutere, warum Modellwerte keine Messkurve und gleicher Verbrauch kein Beweis gleicher Basenstärke sind.'],
    ['Compare initial, half-volume, equivalence and excess regions using supplied values and mark them on an explicitly schematic curve. Explain equal formal amount despite different strength.',
     'Explain NaOH’s residual OH⁻, NH3/NH4⁺ buffering, NH4⁺ protolysis at equivalence and later common H₃O⁺ excess. All constants and pH values are already given.',
     'Assess methyl red for NH3 from supplied points around 25.00 mL. Use the given 22.95-mL point to explain possible early phenolphthalein indication and the direction of amount bias; calculate no endpoint or numerical error.',
     'Justify BTB as a candidate for NaOH’s neutral region, while stating the four-point and missing-colour-criterion limits. Explain why model points are not an acquired curve and equal consumption does not prove equal base strength.'],
    'Die gleiche formale 1:1-Menge ergibt den gegebenen Verbrauch 25,00 mL, Stärke ändert die Gleichgewichte. NaOH bleibt bis zur Äquivalenz durch starken OH⁻-Rest bestimmt; NH3 besitzt zuvor das schwache Paar NH3/NH4⁺. Bei 25,00 mL ist NH4⁺ eine Säure und erzeugt H₃O⁺: 5,28 statt des neutralen NaOH-Werts 7,00. Bei 30,00 mL dominiert derselbe HCl-Überschuss bei 2,04. Methylrot liegt innerhalb des durch 6,85 bei 24,90 mL und 3,70 bei 25,10 mL gestützten sauren Bereichs. Phenolphthalein erreicht schon vor Äquivalenz sein Intervall; der gegebene Punkt 22,95 mL bei pH≈8,20 macht die frühe Anzeige und eine mögliche Unterschätzung anschaulich, liefert ohne Farbdefinition aber keinen exakten Endpunktfehler. BTB ist ein plausibler Kandidat am NaOH-Wert 7,00; vier Punkte allein sichern keine genaue Breite seiner Volumenregion. Werte und Zwischenpunkte sind vorgegebene Modelle, keine Messung; es werden keine Zahlen erneut hergeleitet.',
    'Equal formal 1:1 amounts yield the given 25.00 mL consumption; strength changes equilibria. NaOH is controlled by strong OH⁻ remaining before equivalence; NH3 has the weak NH3/NH4⁺ pair. At 25.00 mL NH4⁺ acts as an acid producing H₃O⁺: 5.28 rather than neutral NaOH’s 7.00. The same HCl excess controls both at 30.00 mL and pH 2.04. Methyl red lies in the acidic region supported by 6.85 at 24.90 mL and 3.70 at 25.10 mL. Phenolphthalein reaches its interval before equivalence; the given 22.95-mL point at about pH 8.20 illustrates early indication and possible underestimation, but no exact endpoint error follows without a colour definition. BTB is a plausible candidate near NaOH’s 7.00; four points alone do not establish the exact volume width. Values and intermediate points are supplied models, not measurements; no numerical derivations are required.',
    [criterion(cid,'q1','Deutet sämtliche vier gegebenen Abschnitte, Kurvenrichtung und Grenzen der schematischen Verbindung.','Interprets the four given regions, curve direction and limits of schematic interpolation.'),
     criterion(cid,'q2','Erklärt die zutreffenden pH-bestimmenden Spezies und den Unterschied zwischen schwachem Puffer und starkem Rest.','Explains relevant pH-controlling species and distinguishes weak buffering from strong residual base.'),
     criterion(cid,'q3','Begründet Indikatorkandidaten und die mögliche frühe NH3-Anzeige mit den bereits gegebenen Zwischenpunkten, ohne exakten Volumenfehler zu erfinden.','Justifies candidates and possible early NH3 indication from already supplied intermediate points without inventing exact volume error.'),
     criterion(cid,'q4','Trennt formale Menge, Stärke und gegebenes Modell; behauptet weder gleiche Stärke noch gemessenen Zwischenverlauf.','Separates formal amount, strength and supplied model; claims neither equal strength nor an acquired intermediate trace.')],
    {'modelAnswerValuesGivenAsTable':BASE,'given_pKb_NH3':'4.75','given_pKa_NH4plus':'9.25',
     'givenOriginalIntermediatePoints':[{'V_mL':'24.90','pH_approx':'6.85'},{'V_mL':'25.10','pH_approx':'3.70'},{'V_mL_approx':'22.95','pH_approx':'8.20'}],
     'numberOrigin':{'fourPointValues':source(cid,'/workedModelDe'),'intermediateValues':source(cid,'/workedModelDe/indicator'),'originalModelParameters':source(cid,'/materialAndData')}},[cid],
    {'taskDe':'Frischer Indikatortransfer, nur soweit zur Evidenz erforderlich: Eine Person setzt den gegebenen NH3-Punkt pH≈8,20 bei etwa 22,95 mL als angeblichen Äquivalenzpunkt ein. Vergleiche mit dem gegebenen Äquivalenzvolumen 25,00 mL und erkläre die Fehlerrichtung sowie die fehlende exakte Farbdefinition ohne Fehlerrechnung.',
     'taskEn':'Fresh indicator transfer, only as needed for evidence: someone uses the given NH3 point pH≈8.20 at about 22.95 mL as supposed equivalence. Compare it with given equivalence 25.00 mL and explain bias direction and the missing exact colour definition without calculating error.',
     'expectedDe':'Ein früheres Anzeigevolumen kann die NH3-Menge unterschätzen. Der gegebene Kurvenpunkt ist nicht automatisch ein definierter Farb-Endpunkt; ein exakter Indikatorfehler wird nicht daraus behauptet.',
     'expectedEn':'An earlier indicated volume can underestimate NH3 amount. The given curve point is not automatically a defined colour endpoint; it does not establish exact indicator error.'}))

projection_path = O / 'materials/28c.FIVE.complete-interpretation-projections.DE-EN.author-v2.json'
write(str(projection_path.relative_to(O)), {'schemaVersion':2,'role':'Complete operative learner-facing interpretation-only projections for current28c; original quantitative whole cases retained separately',
    'goalId':G28, 'cases':projections, 'noNewMeasurements':True,'noNewSourceValidationClaim':True,'calculationTasksOrCalculationScoringInherited':False,
    'noAdditionalFixedCaseQuota':True,'independentReview':'pending_two_genuine_targeted_independent_reviews'})
for c in projections:
    write(f"materials/28c-{c['caseId']}.complete-DE-EN.interpretation-only.author-v2.json",c)

# Minimal operative profile assignment: preserve every other field verbatim.
p28 = profiles[3]['profile']
p28['applicationCaseBriefs'][0]['taskDemandDe'] = 'Deute ausschließlich die beigefügten Auswertungsfassungen v2 T05-C1/C2 mit vollständig vorgegebenen Tabellen. Ordne Stärke und Spezies zu, unterscheide Halbpunkt, Äquivalenz und Neutralität und begründe Indikatorkandidaten. Benötigte pH-/pK-Werte und der Temperaturvergleich sind gegeben; keine pH-Rechnung und keine Rechenrubrik der separat erhaltenen Originalfälle werden übernommen.'
p28['applicationCaseBriefs'][0]['taskDemandEn'] = 'Use only the attached interpretation-only v2 projections T05-C1/C2 with fully supplied tables. Classify strength/species, distinguish halfpoint, equivalence and neutrality, and justify indicator candidates. Required pH/pK values and the temperature comparison are given; inherit no pH calculation or calculation rubric from the separately retained originals.'
p28['applicationCaseBriefs'][1]['taskDemandDe'] = 'Deute die fallende Basenkurve in der Auswertungsfassung v2 T08-C2; die beigefügte BASE-Auswertung ist eine alternative Vertiefung desselben Vergleichs, keine zusätzliche Fallquote. Vergleiche im v2 POLY-QUALITATIVE-C1 die vorgegebenen ein- und zweistufigen Modelle und erkläre Spezies, Pufferregionen und Identifikationsgrenzen. Alle benötigten Zahlenwerte sind gegeben; alte eingebettete Rechenaufträge werden nicht übernommen.'
p28['applicationCaseBriefs'][1]['taskDemandEn'] = 'Interpret the falling base curve in interpretation-only v2 T08-C2; the attached BASE projection is an alternative extension of that comparison, not an additional case quota. Compare supplied single-stage and two-stage models in v2 POLY-QUALITATIVE-C1 and explain species, buffers and identity limits. All required numerical values are given; old embedded calculation tasks are not inherited.'
profile_path = O / 'candidate/FOUR.complete-profile-bodies.material-assignment.author-v2.json'
write(str(profile_path.relative_to(O)),{'schemaVersion':2,'role':'Whole current author profile bodies; first three unchanged, only four taskDemand strings in28c bind operative interpretation projections',
    'profiles':profiles,'independentReview':'pending_two_genuine_targeted_independent_reviews','selfApproval':False})
write('candidate/BEFORE-AFTER.bounded-author-deltas.v2.json',{'assessmentBoundaryChanges':boundary_deltas,
    'profileChanges':[{'goalId':G28,'caseId':c['id'],'fields':{k:{'before':before_profiles[3]['profile']['applicationCaseBriefs'][i][k],'after':c[k]} for k in ['taskDemandDe','taskDemandEn']}} for i,c in enumerate(p28['applicationCaseBriefs'])],
    'allOtherProfileFieldsVerbatimUnchanged':True,'interpretationProjectionsReplaceOnly28cOperativeTaskAndScoringAssignment':True})

sources_out = {'role':'Original source and field pins retained from supplied frozen author materials; this author followup makes no new original-source validation claim',
              'cleanFrozen14Selector':pin(selector_path),'scientificView':pin(view_path),'neutral28cLocator':pin(locator_path),
              'retained28cOriginalContainer':pin(retained_path),'original28cSourceFiles':[f['originalFile'] for f in locator['materialFiles']],
              'perCaseOriginalBindings':[{'caseId':r['caseId'],'sourceFile':r['sourceFile'],'sourceJsonPointer':r['sourceJsonPointer']} for r in rows],
              'originalP4SourceLedger':pin(V1/'materials/SOURCE.primary-original-pins-and-attribution.author.json'),
              'sourceValidationBoundary':'Reused previously supplied current author facts/data with technical pointer/hash checks only. No new claim about official coverage, real experiment, or independently validated source facts.'}
write('materials/SOURCE.retained-original-and-field-pins.no-new-source-validation.json',sources_out)

bindings=[]
for i,c in enumerate(four):
    pi=GOALS.index(c['goalId'])
    ci=next(j for j,x in enumerate(profiles[pi]['profile']['applicationCaseBriefs']) if x['id']==c['id'])
    bindings.append({'goalId':c['goalId'],'caseId':c['id'],'profile':{**pin(profile_path),'jsonPointer':f'/profiles/{pi}/profile'},
                     'profileCasePointer':f'/profiles/{pi}/profile/applicationCaseBriefs/{ci}',
                     'wholeMaterial':{**pin(four_path),'jsonPointer':f'/cases/{i}'},'sourceMaterialBefore':{**pin(old_p4_path),'jsonPointer':f'/cases/{i}'},
                     'changedFieldsOnly':['assessmentBoundaryDe','assessmentBoundaryEn']})
for i,c in enumerate(projections):
    pci=0 if c['caseId'] in ['T05-C1','T05-C2'] else 1
    bindings.append({'goalId':G28,'caseId':c['caseId'],'authorVersion':2,
                     'profile':{**pin(profile_path),'jsonPointer':'/profiles/3/profile'},'profileCasePointer':f'/profiles/3/profile/applicationCaseBriefs/{pci}',
                     'wholeMaterial':{**pin(projection_path),'jsonPointer':f'/cases/{i}'},
                     'bindingRole':'alternative base comparison; not additional quota' if c['caseId'].startswith('strong-and') else 'operative interpretation projection',
                     'oldCalculationMaterialOperativeForThisAssignment':False})
binding_path = O / 'materials/CASE-MATERIAL-BINDINGS.exact-author-v2.json'
write(str(binding_path.relative_to(O)),{'schemaVersion':2,'role':'Explicit operative material assignment for exactly four goals; no fallback to old mathematical tasks for28c',
    'bindings':bindings,'historicalCaseAlias':{'taskRoleLabel':'dyes-primary-real-history','actualUnchangedCaseId':'basf-indigo-1897-actual-sources'},
    'unaffectedPracticalGoals':['5c8f0bbb-103a-579f-87fc-c997afe4fd18','cf270aaf-235a-55a7-94a2-c4d9d7570a6b']})

contract_path = Path('/home/enpasos/projects/skillpilot/contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
contract=load(contract_path)
validator=jsonschema.Draft202012Validator({'$schema':contract['$schema'],'$defs':contract['$defs'],'$ref':'#/$defs/profile'})
technical=[]
for i,r in enumerate(profiles):
    old=before_profiles[i]['profile'];new=r['profile']
    errors=[e.message for e in validator.iter_errors(new)]
    assert not errors,errors
    assert old['coverageExpectations']==new['coverageExpectations']
    assert old['expectations']==new['expectations']
    assert new['coverageExpectations']['minimumIndependentDemonstrations']==2
    if i<3: assert old==new
    else:
        restored=copy.deepcopy(new)
        for j,c in enumerate(restored['applicationCaseBriefs']):
            for k in ['taskDemandDe','taskDemandEn']:c[k]=old['applicationCaseBriefs'][j][k]
        assert restored==old
    technical.append({'goalId':r['goalId'],'schemaErrors':errors,'statusUnchanged':r['inputCurrentStatus'],
                      'minimumIndependentDemonstrationsUnchanged':2,'expectationsAndCoverageVerbatimUnchanged':True,
                      'wholeProfileVerbatimUnchanged':i<3,'only28cTaskDemandAssignmentChanges':i==3})
for c in projections:
    assert sum(r['points'] for r in c['rubric'])==c['maximumDesignPoints']
    for k in ['materialDe','materialEn','questionsDe','questionsEn','expectedPerformanceDe','expectedPerformanceEn','rubric','freshTransfer']:
        assert c[k]
    assert 'monoproticWholeCase' not in c
assert projections[0]['providedData']['acidTable']==X
assert projections[1]['providedData']['acidYTable']==Y
assert projections[2]['providedData']['originalModelPoints']==T08
assert projections[3]['providedData']['glycineIdealModelTable']==oldcase('POLY-QUALITATIVE-C1')['idealModelTable']
for r in before_pins:
    assert pin(r['path'])==r
for bound in bindings:
    pp=bound['wholeMaterial'];assert pin(pp['path'])=={k:v for k,v in pp.items() if k!='jsonPointer'}
    material=pointer(load(pp['path']),pp['jsonPointer']);assert material.get('id',material.get('caseId'))==bound['caseId']
lab_unchanged=[]
for gid in ['5c8f0bbb-103a-579f-87fc-c997afe4fd18','cf270aaf-235a-55a7-94a2-c4d9d7570a6b']:
    g=next(g for g in view['goals'] if g['goalId']==gid)
    lab_unchanged.append({'goalId':gid,'inputProfileFieldSha256CanonicalSortedJSON':fieldpin(g['reviewContext']['evidenceProfile']['profile']),
                          'includedInSuccessorProfiles':False,'laboratoryObligationRemovedOrReplaced':False})
write('checks/CHECK.technical-exact-retention-and-material-assignment.v2.json',{
    'atUTC':AT,'role':'Technical schema, exact-field-delta, supplied-data presence and hash checks only; no author scientific self-review/approval',
    'schema':pin(contract_path),'profileRows':technical,'correctedBoundaryObjectCount':4,'interpretationProjectionCount':5,
    'completeBilingualFieldsPresent':True,'rubricPointSumsMatch':True,'originalAcidAndPolyTableDataRetainedExactly':True,
    'baseValuesOrigin':'Given original worked-model answers now supplied as learner data; not new measurements or learner calculations',
    'oldNestedCalculationCaseNotInherited':True,'unaffectedPracticalProfiles':lab_unchanged,
    'immutableInputPinsRechecked':before_pins,'errors':[],'independentReview':'pending_two_genuine_targeted_independent_reviews'})

readme='''# Bounded material author successor v2

Candidate pending two genuine targeted independent reviews. This is an author correction, with no self-approval, integration or human acceptance claim.

Exactly four goals are in scope: f85b4651, b8d3b453, 188bd684 and 28c90c6a. Four complete existing material objects have only assessmentBoundaryDe/En corrected. Their tasks, diagrams, facts and scoring remain exact. The historical case keeps its actual ID basf-indigo-1897-actual-sources; dyes-primary-real-history is only the task's role label.

28c has five complete bilingual interpretation-only task/scoring projections. Existing acid and glycine table entries are unchanged. Existing BASE worked-model numbers, constants and relevant intermediate values are supplied as data rather than requested calculations. All questions and scoring require actual data interpretation, species explanations, buffer/equivalence distinctions and bounded indicator/identity conclusions. No old calculation rubric or nested monoprotic calculation task is operative through the new binding.

The exact five old whole cases remain in retained-original-cases, including their full mathematical tasks and rubrics, available for a separately assigned computation goal. This package makes no new computation-goal assignment and edits none of them.

The four whole profile bodies are supplied. The first three are unchanged. In28c, only the two taskDemandDe/En pairs bind the operative v2 material; every other profile field, minimumIndependentDemonstrations2, expectations, E1/G1/status and coverage remain unchanged. BASE is an alternative explanation opportunity, not a new case quota. 5c8f and cf270 actual laboratory obligations are unaffected.

Source and before/after pins are supplied. There was no new source-validation campaign, measurement, experiment or learner work. Original authors' calculations remain models. Frozen P4v1/native14 safe inputs are unchanged; no peer-review result files were read. Technical checks concern schema and exact retention only.

Own teaching materials: CC-BY-4.0. Technical script: Apache-2.0. Prior source rights and licenses remain intact; private third-party originals are referenced without copying them here.
'''
(O/'README.md').write_text(readme)

artifact_paths=[p for p in sorted(O.rglob('*')) if p.is_file() and p.name!='SELECTOR.four-goal-bounded-material-author-successor-v2.sealed.json']
final=write('SELECTOR.four-goal-bounded-material-author-successor-v2.sealed.json',{
    'schemaVersion':2,'sealedAtUTC':AT,'role':'Bounded AUTHOR successor, pending two genuine targeted independent reviews',
    'actualModel':'Codex based on GPT-6; exact deployment identifier not exposed in this session',
    'goalIds':GOALS,'goalCount':4,'correctedExistingWholeMaterialObjects':4,'complete28cInterpretationProjections':5,
    'frozenInputSelector':pin(selector_path),'sourceScientificView':pin(view_path),'neutral28cLocator':pin(locator_path),
    'profileBodies':{**pin(profile_path),'pointers':[{'goalId':gid,'jsonPointer':f'/profiles/{i}/profile'} for i,gid in enumerate(GOALS)]},
    'operativeMaterialBindings':pin(binding_path),'artifacts':[pin(p) for p in artifact_paths],
    'assessmentBoundaryChangesOnlyForExistingFourMaterials':True,'newSourceValidationClaim':False,
    'noNewPracticalOrCaseQuota':True,'minimumIndependentDemonstrationsUnchanged':2,
    'statusE1G1Unchanged':True,'unaffectedPracticalGoals':['5c8f0bbb','cf270aaf'],
    'oldP4v1AndFrozenNative14Modified':False,'peerNative14ResultsRead':False,
    'independentReview':'pending_two_genuine_targeted_independent_reviews','selfApproval':False,
    'humanApproval':False,'C_P_Main_N_Integration':False})
print(json.dumps({'selector':final,'profiles':pin(profile_path),'materialBindings':pin(binding_path),
                  'correctedWholeMaterials':pin(four_path),'interpretationProjections':pin(projection_path)},ensure_ascii=False,indent=2))
