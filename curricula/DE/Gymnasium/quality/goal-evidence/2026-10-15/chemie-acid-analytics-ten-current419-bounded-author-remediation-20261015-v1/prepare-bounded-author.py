# SPDX-License-Identifier: Apache-2.0
"""Bounded author successor. No native reviews, accepted records or active edits."""
import copy
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[6]
OLD = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid-analytics-remaining-ten-whole-material-and-profile-author-20261014-v1'
NATIVE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1'
A = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-acid-analytics-ten-current419-independent-a-20261015-v1'
NOW = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads(path.read_text())

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def objsha(data):
    return digest(json.dumps(data, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())

def bind(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(REPO)), 'sha256': digest(raw), 'bytes': len(raw)}

def dump(name, data):
    p = ROOT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def strong_ph(vml):
    va, vb, c, kw = .025, vml / 1000, .1, 1e-14
    excess = (c * va - c * vb) / (va + vb)
    h = (excess + math.sqrt(excess * excess + 4 * kw)) / 2 if excess >= 0 else 2 * kw / (math.sqrt(excess * excess + 4 * kw) - excess)
    return -math.log10(h)

def weak_ph(vml):
    va, vb, c, ka, kw = .025, vml / 1000, .1, 10 ** -4.76, 1e-14
    ct = c * va / (va + vb)
    na = c * vb / (va + vb)
    def residual(ph):
        h = 10 ** -ph
        return h + na - ct * ka / (ka + h) - kw / h
    lo, hi = 0., 14.
    for _ in range(120):
        mid = (lo + hi) / 2
        if residual(mid) > 0:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2

def table(points):
    return '| V(NaOH) / mL | pH |\n| --- | --- |\n' + '\n'.join(f'| {v:.2f} | {ph:.3f} |' for v, ph in points)

def main():
    assert not (ROOT / 'FILES.finite-bounded-author.seal.json').exists(), 'Sealed packet is immutable'
    neutral = read(NATIVE / 'NEUTRAL.exact-ten-current419-native-pages-whole-material-and-profile-review-inputs.json')
    canonical_path = REPO / neutral['currentWholeCanonical']['path']
    assert bind(canonical_path) == neutral['currentWholeCanonical']
    canonical = read(canonical_path)
    ids = neutral['goalIds']
    goals = [next(g for g in canonical['goals'] if g['id'] == gid) for gid in ids]
    current = read(NATIVE / 'inputs/ten-whole-current-bodies-and-direct-neighbors.exact.json')
    assert [r['wholeCurrentGoal'] for r in current['rows']] == goals
    oldmaterial = read(OLD / 'materials/twenty-complete-DEEN-cases.author.json')
    material = copy.deepcopy(oldmaterial)
    material.update(authoredAtUTC=NOW, role='bounded author remediation; no independent scientific vote', currentScientificCompletionsFromAuthoring=0)
    profiles = copy.deepcopy(read(OLD / 'author-profiles.ten.raw.json'))
    cases = {c['id']: c for c in material['cases']}
    points_volume = [0, 6.25, 12.50, 18.75, 24.50, 24.90, 24.98, 25., 25.02, 25.10, 25.50, 30.]
    datasets = []
    for caseid, label, fn in [('T05-C1', 'X', strong_ph), ('T05-C2', 'Y', weak_ph)]:
        c = cases[caseid]
        points = [(v, round(fn(v), 3)) for v in points_volume]
        datasets.append({'caseId': caseid, 'sampleLabel': label, 'dataKind': 'synthetic ideal-model teaching data, not measurements', 'volumeUnit': 'mL', 'pHDisplayDecimals': 3, 'points': [{'volumeNaOHmL': v, 'pH': ph} for v, ph in points], 'actualMeasurements': False})
        c['titleDe'] = 'Unbekannte Säurekurve ' + label + ': Daten zuerst deuten'
        shared_de = f'Vollständig synthetische Lehrdaten bei 25 °C, keine Labor- oder Lernendenmessung. Das Modell setzt γ=1, Kᵥ=10⁻¹⁴ und additive Volumina voraus. 25.00 mL einer formal einprotonigen Säure mit c=0.100 mol/L werden mit NaOH, c=0.100 mol/L, titriert. Probenkennung {label}; Säurestärke und Molekülidentität werden nicht mitgeteilt. Unter den erlaubten Modellalternativen stehen eine starke oder eine schwache einprotonige Säure zur Wahl; Gemische und weitere Protolyse-Stufen sind ausgeschlossen. Vorgelegte Kurvendaten (pH auf drei Nachkommastellen gerundet):\n\n' + table(points)
        shared_en = f'Entirely synthetic teaching data at 25 °C, not laboratory or learner measurements. The model assumes γ=1, Kᵥ=10⁻¹⁴ and additive volumes. Titrate 25.00 mL of a formally monoprotic acid, c=0.100 mol/L, with 0.100 mol/L NaOH. Sample label {label}; acid strength and molecular identity are not supplied. The allowed alternatives are a strong or a weak monoprotic acid; mixtures and further dissociation stages are excluded. Supplied curve data (pH rounded to three decimal places):\n\n' + table(points)
        if caseid == 'T05-C1':
            c['materialDe'] = shared_de + '\n\nIndikatorbereiche: Methylorange 3.1–4.4, BTB 6.0–7.6, Phenolphthalein 8.2–10.0. Kein Farbkriterium und keine zulässige Volumenabweichung sind festgelegt. Die Tabelle bestimmt daher keinen exakten Indikatorfehler. Berechne die Modellwerte für 0, 12.50, 25.00 und 30.00 mL. Separater hypothetischer Temperaturvergleich, unabhängig von der Identifizierung von X: Eine starke Säure wird mit einer starken Base neutralisiert, die Gegenionen hydrolysieren nicht und es gilt pKᵥ=13.20.'
            c['materialEn'] = shared_en + '\n\nIndicator ranges: methyl orange 3.1–4.4, BTB 6.0–7.6, phenolphthalein 8.2–10.0. No colour criterion or allowed volume deviation is specified, so the table supplies no exact indicator error. Calculate model values at 0, 12.50, 25.00 and 30.00 mL. Separate hypothetical temperature comparison, independent of identifying X: neutralise a strong acid with a strong base, with non-hydrolysing counterions and pKᵥ=13.20.'
            c['taskDemandDe'] = '1. Deute die vorgelegte Kurve X: Ordne stark oder schwach zu und belege dies an Anfangs-pH, Bereich um 12.50 mL und dem steilen Sprung zwischen 24.98 und 25.02 mL. Lies den Äquivalenzbereich ab, prüfe ihn stöchiometrisch und benenne die maßgeblichen Spezies vor, bei und nach Äquivalenz.\n2. Berechne die vier verlangten pH-Werte mit dem Gesamtvolumen und vergleiche sie mit der gerundeten Tabelle. Erkläre, ob der formale Halbpunkt einen pKₐ liefert.\n3. Leite die durch die Daten gestützte Stoffklasse ab und wähle einen passenden Indikatorkandidaten. Begründe mit dem tatsächlich vorgelegten Sprung, weshalb ein ungefähres Passungsurteil keinen exakten Endpunktfehler oder eine eindeutige Molekülidentität liefert.\n4. Bestimme den neutralen Äquivalenz-pH im separaten Temperaturvergleich und korrigiere die Regel, der Äquivalenzpunkt liege immer bei pH 7.'
            c['taskDemandEn'] = '1. Interpret supplied curve X: classify it as strong or weak using initial pH, the region around 12.50 mL, and the steep jump between 24.98 and 25.02 mL. Read the equivalence region, check it stoichiometrically, and identify the controlling species before, at and after equivalence.\n2. Calculate the four requested pH values with total volume and compare them with the rounded table. Explain whether the formal halfpoint yields a pKₐ.\n3. Infer the supported substance class and select an indicator candidate. Use the actually supplied jump to explain why approximate suitability supplies neither an exact endpoint error nor unique molecular identity.\n4. Find neutral equivalence pH in the separate temperature comparison and correct the claim that equivalence is always at pH 7.'
            c['modelAnswerDe'] = '1. X passt im vorgegebenen Modell zur starken einprotonigen Säure: pH 1.000 bei 0.100 mol/L, bei halber Titrantmenge nur pH 1.477 und kein schwacher HA/A⁻-Pufferbereich. Der Sprung von 4.398 auf 9.602 liegt um 25.00 mL; bei 25.00 mL ist pH 7.000. n=2.500 mmol bestätigt Vₑq=25.00 mL. Vorher bestimmt H₃O⁺-Überschuss den pH, bei Äquivalenz Wasser mit nicht hydrolysierenden Gegenionen, danach OH⁻-Überschuss. 2. Die berechneten pH-Werte sind 1.000, 1.477, 7.000 und 11.959. Bei 12.50 mL gilt [H₃O⁺]=1.250 mmol/37.50 mL=0.03333 mol/L; bei 30.00 mL [OH⁻]=0.500 mmol/55.00 mL=0.009091 mol/L. Die Werte stimmen auf die Tabellenrundung; der Halbpunkt liefert hier keinen pKₐ. 3. BTB liegt um den neutralen Äquivalenzbereich. Auch Methylorange oder Phenolphthalein können je nach Toleranz im steilen Bereich passen: die zusätzliche Tabelle stützt einen schmalen Volumenbereich, aber ohne festgelegtes Farbkriterium und feinere Auflösung keinen exakten Volumenfehler. Die Kurve belegt unter den Modellannahmen die Klasse, nicht eine eindeutige Säureidentität. 4. Gleiche Hydronium- und Hydroxidaktivitäten bedeuten pH=pKᵥ/2=6.60. Der ursprüngliche neutrale Wert 7 war an pKᵥ=14 gebunden; Äquivalenz ist stöchiometrisch definiert.'
            c['modelAnswerEn'] = '1. Within the supplied alternatives X is a strong monoprotic acid: pH 1.000 at 0.100 mol/L, only 1.477 at half titrant amount and no weak HA/A⁻ buffer region. The jump from 4.398 to 9.602 lies around 25.00 mL, where pH is 7.000. The 2.500 mmol amount confirms Vₑq=25.00 mL. Before equivalence H₃O⁺ excess controls pH; at equivalence water and non-hydrolysing counterions do; afterwards OH⁻ excess does. 2. Calculated values are 1.000, 1.477, 7.000 and 11.959. At 12.50 mL, [H₃O⁺]=1.250 mmol/37.50 mL=0.03333 mol/L; at 30.00 mL, [OH⁻]=0.500 mmol/55.00 mL=0.009091 mol/L. These agree with table rounding; this halfpoint does not yield pKₐ. 3. BTB lies around neutral equivalence. Methyl orange or phenolphthalein may also fit the steep region depending on tolerance. The additional table supports a narrow volume interval but supplies no exact volume error without a colour criterion and finer resolution. The curve supports the class under the model, not unique molecular identity. 4. Equal hydronium and hydroxide activities give pH=pKᵥ/2=6.60. Neutral pH 7 depended on pKᵥ=14; equivalence is defined stoichiometrically.'
            c['rubric'][0]['fullCreditDe'] = 'Ordnet X stark zu und nennt konkrete Daten: Anfang 1.000, Halbpunkt 1.477 ohne schwachen Pufferbereich und Sprung 4.398→9.602 um 25.00 mL. Verknüpft diesen mit 2.500 mmol und den wechselnden pH-bestimmenden Spezies.'
            c['rubric'][0]['fullCreditEn'] = 'Classifies X as strong using actual values: initial 1.000, halfpoint 1.477 without weak buffering and jump 4.398→9.602 around 25.00 mL. Relates it to 2.500 mmol and the changing pH-controlling species.'
            c['rubric'][2]['fullCreditDe'] = 'Begründet die Indikatorpassung am tatsächlichen schmalen Sprungbereich; BTB ist passend, andere sind toleranzabhängig. Nennt fehlendes Farbkriterium/Volumenfehler und die Grenze der Molekülidentifikation.'
            c['rubric'][2]['fullCreditEn'] = 'Uses the actual narrow jump to justify BTB and tolerance-dependent alternatives. States missing colour criterion/exact volume error and the limit on molecular identification.'
        else:
            c['materialDe'] = shared_de + '\n\nIndikatoren: BTB 6.0–7.6, Phenolphthalein 8.2–10.0; kein spezifisches Farbkriterium oder exakter Volumenfehler vorgegeben. Nach der Dateninterpretation darf der aus dem Halbpunkt selbst ermittelte pKₐ für die weitere Rechnung verwendet werden. Anfangsnäherung [H₃O⁺]≈√(Kₐc), am Äquivalenzpunkt [OH⁻]≈√(Kᵦc(Salz)), Kᵦ=Kᵥ/Kₐ. Berechne 0, 12.50, 25.00 und 30.00 mL. Diese Näherungen müssen nicht die dritte Dezimalstelle der vollständig gelösten Modelltabellen reproduzieren; begründe die Näherung und prüfe eine Abweichung bis 0.01 pH-Einheiten.'
            c['materialEn'] = shared_en + '\n\nIndicators: BTB 6.0–7.6, phenolphthalein 8.2–10.0; no specific colour criterion or exact volume error supplied. After interpreting the data, use the pKₐ independently inferred from the halfpoint for subsequent calculation. Initial approximation [H₃O⁺]≈√(Kₐc); at equivalence [OH⁻]≈√(Kᵦc(salt)), Kᵦ=Kᵥ/Kₐ. Calculate 0, 12.50, 25.00 and 30.00 mL. These approximations need not reproduce the third decimal of the fully solved model table; justify them and check a difference up to 0.01 pH units.'
            c['taskDemandDe'] = '1. Deute zuerst die vorgelegte Kurve Y: Ordne stark oder schwach zu, belege den Pufferbereich und den basischen Sprung mit mindestens drei konkreten Tabellenwerten. Lies den Äquivalenzbereich und den Halbpunkt ab und ermittle den näherungsweisen pKₐ; prüfe Vₑq mit der Stoffmenge.\n2. Berechne die vier verlangten pH-Werte und begründe Anfangs- und Salz-Näherung. Vergleiche Rechnungen und Tabelle mit der genannten Näherungstoleranz.\n3. Erkläre die Information des Halbpunktes und wähle einen geeigneten Indikatorkandidaten anhand des vorgelegten Sprungs. Begrenze Endpunkt- und Stoffidentitätsaussagen.\n4. Vergleiche mit einer gleich konzentrierten starken einprotonigen Säure: Welche Punkte bleiben gleich, welche ändern sich infolge des schwachen Säuregleichgewichts?'
            c['taskDemandEn'] = '1. First interpret supplied curve Y: classify strong or weak and support its buffer region and basic jump using at least three actual table values. Read equivalence and half-equivalence, infer approximate pKₐ, and check Vₑq using the amount.\n2. Calculate the four requested pH values and justify initial and salt approximations. Compare calculations with the table using the stated approximation tolerance.\n3. Explain the halfpoint information and select an indicator candidate using the supplied jump. Limit endpoint and substance-identity claims.\n4. Compare an equally concentrated strong monoprotic acid: which points remain equal and which change because of the weak-acid equilibrium?'
            c['modelAnswerDe'] = '1. Y ist im vorgegebenen Modell schwach: Anfang pH 2.883 statt etwa 1, vor Äquivalenz ein flacherer HA/A⁻-Bereich (6.25 mL: 4.284; 12.50 mL: 4.760; 18.75 mL: 5.237), bei 25.00 mL basisch etwa 8.729. Der starke Anstieg liegt bei 25.00 mL. 2.500 mmol Säure bestätigen dieses Äquivalenzvolumen; der Halbpunkt liegt bei 12.50 mL und liefert näherungsweise pKₐ=4.76. 2. Kₐ=1.738·10⁻⁵ ergibt näherungsweise Anfangs-pH 2.880 mit 1.32 % Umsetzung; vollständig gelöst ist es 2.883, eine Abweichung von etwa 0.003. Am Halbpunkt ist pH≈4.760. Bei Äquivalenz gilt c(Salz)=0.0500 mol/L, Kᵦ=5.754·10⁻¹⁰, [OH⁻]≈5.363·10⁻⁶ mol/L, pH≈8.729 und nur etwa 0.011 % Hydrolyse. Bei 30.00 mL bestimmt der starke Baseüberschuss pH 11.959. Die Abweichungen bleiben unter 0.01. 3. Phenolphthalein passt zum basischen Äquivalenzbereich. BTB verändert die Farbe früher; das belegt allein keinen exakt berechneten Volumenfehler. Farbumschlag und chemische Äquivalenz bleiben verschieden, und pKₐ 4.76 identifiziert keine bestimmte Molekülstruktur. 4. Äquivalenzvolumen und pH bei gleichem starkem Baseüberschuss bleiben gleich; Anfangs-pH, Voräquivalenz-Pufferung und Äquivalenz-pH ändern sich.'
            c['modelAnswerEn'] = '1. Y is weak within the supplied model: initial pH 2.883 rather than about 1, a flatter HA/A⁻ region before equivalence (6.25 mL: 4.284; 12.50 mL: 4.760; 18.75 mL: 5.237), and basic pH about 8.729 at 25.00 mL. The steep rise lies around 25.00 mL. The 2.500 mmol acid amount confirms this equivalence volume. Half-equivalence is 12.50 mL, yielding approximate pKₐ=4.76. 2. Kₐ=1.738·10⁻⁵ gives approximate initial pH 2.880 and 1.32% conversion; the complete solution gives 2.883, differing by about 0.003. At half-equivalence pH≈4.760. At equivalence c(salt)=0.0500 mol/L, Kᵦ=5.754·10⁻¹⁰, [OH⁻]≈5.363·10⁻⁶ mol/L, pH≈8.729 and about 0.011% hydrolysis. At 30.00 mL strong base excess gives pH 11.959. Differences are below 0.01. 3. Phenolphthalein fits basic equivalence. BTB changes earlier, which alone supplies no exact calculated volume error. Colour endpoint and chemical equivalence remain distinct; pKₐ 4.76 identifies no unique molecular structure. 4. Equivalence volume and pH at the same strong-base excess remain equal; initial pH, pre-equivalence buffering and equivalence pH change.'
            c['rubric'][0]['fullCreditDe'] = 'Ordnet Y aufgrund konkreter Kurvendaten schwach zu; erläutert HA/A⁻-Bereich, pH≈4.760 am Halbpunkt und basischen Äquivalenz-pH≈8.729, statt die nicht genannte Stärke zu wiederholen. Verknüpft 25.00 mL mit 2.500 mmol und den relevanten Spezies.'
            c['rubric'][0]['fullCreditEn'] = 'Classifies Y as weak from actual curve data; explains HA/A⁻ buffering, halfpoint pH≈4.760 and basic equivalence pH≈8.729 rather than repeating an assigned strength. Relates 25.00 mL to 2.500 mmol and relevant species.'
            c['rubric'][1]['fullCreditDe'] = 'Berechnet näherungsweise pH 2.880, 4.760, 8.729, 11.959, begründet kleine Umsetzungs-/Hydrolyseanteile und erklärt die Anfangsabweichung 0.003 gegenüber Tabelle 2.883 als Näherung, nicht Messfehler.'
            c['rubric'][1]['fullCreditEn'] = 'Calculates approximate pH 2.880, 4.760, 8.729, 11.959, justifies small conversion/hydrolysis fractions and explains the 0.003 initial difference from table 2.883 as approximation rather than measurement error.'
            c['rubric'][2]['fullCreditDe'] = 'Liest näherungsweise pKₐ=4.76 aus dem tatsächlichen Halbpunkt; begründet Phenolphthalein am basischen Sprung, trennt Farbe/Äquivalenz und behauptet weder exakten Endpunktfehler noch eindeutige Molekülidentität.'
            c['rubric'][2]['fullCreditEn'] = 'Reads approximate pKₐ=4.76 from the actual halfpoint; justifies phenolphthalein at the basic jump and distinguishes colour/equivalence without claiming exact endpoint error or unique identity.'
        c['authorRemediation'] = {'inputWholeCaseSha256': objsha(next(x for x in oldmaterial['cases'] if x['id'] == caseid)), 'findingId': 'A-P-T05-OBSERVABLE', 'independentRecheck': 'pending', 'dataAreActualMeasurements': False}
        if caseid == 'T05-C2':
            c['modelAnswerDe'] = c['modelAnswerDe'].replace('bei 25.00 mL basisch etwa 8.729', 'bei 25.00 mL laut Tabelle basisch 8.730')
            c['modelAnswerEn'] = c['modelAnswerEn'].replace('basic pH about 8.729 at 25.00 mL', 'table pH 8.730 at 25.00 mL')
            c['rubric'][0]['fullCreditDe'] = c['rubric'][0]['fullCreditDe'].replace('Äquivalenz-pH≈8.729', 'Tabellen-Äquivalenz-pH 8.730')
            c['rubric'][0]['fullCreditEn'] = c['rubric'][0]['fullCreditEn'].replace('equivalence pH≈8.729', 'table equivalence pH 8.730')
    dump('materials/twenty-complete-DEEN-cases.author.json', material)
    dump('materials/T05.synthetic-data.numeric-origin.author.json', {'schemaVersion': 1, 'license': 'CC-BY-4.0', 'role': 'author teaching model, not observations', 'model': '25°C gamma=1; fixed formal acid amount 2.500 mmol; additive volume; exact charge balance including water; weak-acid mass balance and Ka=10^-4.76', 'datasets': datasets})
    for p in profiles['profiles']:
        for j, ref in enumerate(p['fullCaseReferences']):
            c = cases[ref['caseId']]
            ref['wholeCaseObjectSha256'] = objsha(c)
            brief = p['profile']['applicationCaseBriefs'][j]
            brief['expectedPerformanceDe'] = c['modelAnswerDe']
            brief['expectedPerformanceEn'] = c['modelAnswerEn']
            if c['id'].startswith('T05-'):
                brief['taskDemandDe'] = f'Die tatsächlich vorgelegte unbekannte synthetische Kurve {"X" if j == 0 else "Y"} mit Tabellenbelegen deuten, charakteristische Punkte berechnen und Stoff-/Indikatoraussagen begrenzen. Vollständiges Material, Auftrag, Lösung und vier Kriterien: materials/twenty-complete-DEEN-cases.author.json, Fall {c["id"]}.'
                brief['taskDemandEn'] = f'Interpret the actually supplied unknown synthetic curve {"X" if j == 0 else "Y"} using table evidence, calculate characteristic points, and bound substance/indicator claims. Complete material, task, solution and four criteria: materials/twenty-complete-DEEN-cases.author.json, case {c["id"]}.'
    dump('author-profiles.ten.raw.json', profiles)
    dump('inputs/whole-ten-current-goals.exact.json', {'schemaVersion': 1, 'goalIds': ids, 'goals': goals})
    dump('AUTHOR.whole-object-delta-proposals.json', {'schemaVersion': 1, 'role': 'author proposal only; no approval', 'currentCanonical': neutral['currentWholeCanonical'], 'denominatorBefore': 419, 'denominatorAfterThisPacket': 419, 'canonicalWriteOperation': 'none', 'wholeGoalRows': [{'goalId': g['id'], 'wholeBefore': g, 'wholeProposedNow': g, 'changedFields': [], 'wholeObjectSha256': objsha(g)} for g in goals], 'caseChangedIds': ['T05-C1', 'T05-C2'], 'rawProfilePayloadChangedGoalIds': [ids[4]], 'semanticRewriteApplied': False, 'newIds': [], 'deletedIds': [], 'sourceDeltaProposals': 'SOURCE.factual-holds-and-whole-mapping-proposals.json', 'minimalityFollowup': 'AUTHOR.minimality-holds-and-explicit-merge-followup.json'})
    dump('CHECK.T05-calculations.author.actual.json', {'schemaVersion': 1, 'role': 'author arithmetic only', 'checks': [{'caseId': d['caseId'], 'rows': [{'volumeNaOHmL': r['volumeNaOHmL'], 'suppliedPH': r['pH'], 'unroundedModelPH': (strong_ph if d['caseId'].endswith('C1') else weak_ph)(r['volumeNaOHmL']), 'roundingError': abs(r['pH'] - (strong_ph if d['caseId'].endswith('C1') else weak_ph)(r['volumeNaOHmL'])), 'pass': abs(r['pH'] - (strong_ph if d['caseId'].endswith('C1') else weak_ph)(r['volumeNaOHmL'])) <= .0005} for r in d['points']]} for d in datasets], 'strongAtHalf': strong_ph(12.5), 'weakAtHalf': weak_ph(12.5), 'weakInitialApprox': (4.76 - math.log10(.1))/2, 'weakInitialExact': weak_ph(0), 'neutralAtPKw13_20': 6.60, 'actualMeasurements': 0, 'independentScientificReview': False})
    lines = ['# Twenty full bilingual author cases — bounded successor', '', 'Own content CC-BY-4.0. Synthetic data and prospective procedures are not learner or laboratory performance.', '']
    for c in material['cases']:
        lines += [f'## {c["id"]} — {c["titleDe"]}', '', f'Goal: `{c["goalId"]}`', '']
        for field in ['materialDe', 'materialEn', 'taskDemandDe', 'taskDemandEn', 'modelAnswerDe', 'modelAnswerEn']:
            lines += [f'### {field}', '', c[field], '']
        for r in c['rubric']:
            lines += [f'### {r["expectationId"]} — {r["maximumPoints"]} points; {r["creditBasis"]}', '', r['fullCreditDe'], '', r['fullCreditEn'], '', r['partialCreditDe'], '', r['partialCreditEn'], '']
    (ROOT / 'materials/twenty-complete-DEEN-cases.author.md').write_text('\n'.join(lines) + '\n')
    print(json.dumps({'goals': len(goals), 'cases': len(material['cases']), 'changedCases': ['T05-C1', 'T05-C2'], 'canonicalChanges': 0, 'strictGain': 0}))

if __name__ == '__main__':
    main()
