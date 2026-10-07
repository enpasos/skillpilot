#!/usr/bin/env python3
"""Seal this reviewer's actual targeted views and decisions; inert dossier writes only."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review'
OWN = Path(__file__).resolve().parent
AUTHOR = BASE / 'chemie-next25-four-targeted-raster-corrections-author-20261006-v2'
PRIOR = BASE / 'chemie-next25-seven-corrections-independent-v-a-20261006-v1'

def read(path):
    return json.loads(path.read_text())

def digest(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def check(binding):
    path = ROOT / binding['path']
    actual = digest(path)
    assert actual['sha256'].removeprefix('sha256:') == binding['sha256'].removeprefix('sha256:'), (path, 'SHA drift')
    assert actual['bytes'] == binding['bytes'], (path, 'size drift')
    return actual

now = datetime.now(timezone.utc).isoformat()
entry = read(OWN / 'targeted-v-a-v2.entry.receipt.json')
raw_path = AUTHOR / 'seven-exact-assets-four-targeted-current-corrections.raw-v2-review-input.json'
raw = read(raw_path)
browser = read(OWN / 'targeted-isolated-browser.actual.receipt.json')
assert len(browser['rows']) == 12
for row in browser['rows']:
    assert row['loaded'] and not row['errors']
    assert row['actualImageBounds']['width'] in [360, 680, 316]
    check(row['screenshot'])
    row['actualSight'] = 'ACTUALLY_VIEWED original-resolution captured browser PNG by independent V-A; not inferred from capture success'
browser['actualReviewCompletedAtUTC'] = now
browser['actualScreenshotViews'] = 12
browser['actualFullSelectedPNGViews'] = 4
write('targeted-isolated-browser.actual.receipt.json', browser)

observations = {
 '965ca297-5dbf-5e58-b5f0-6559a4433646': {
  'scientificObservations': [
   'Exactly two Al³⁺ ions and three O²⁻ ions; ratio 2:3; formula Al₂O₃.',
   'Neutrality explicitly reads 2 · (+3) + 3 · (−2) = 0. Ionic charges are distinct from stoichiometric counts.',
   'The single large example removes the previous three-column small-charge and small-sum defect.'
  ],
  'mobile360': 'Two and three ions, 3+/2− charges, 2:3, Al₂O₃ and the complete zero charge sum are readable in the actually viewed 360px image without zoom.',
  'desktop680': 'All counted ions, charge superscripts, formula subscripts and the neutrality sum are readable.',
  'additional316': 'The important charges, counts and sum remain readable at the additional actual image316px case.',
  'boundedAltDE': 'Zwei Al³⁺-Ionen und drei O²⁻-Ionen ergeben das Verhältnis 2:3 und die Formel Al₂O₃; ihre Ladungssumme ist 0.',
  'representationBoundary': 'One salt-ratio example. Molecular ions, reciprocal salt naming and explanations of salt properties in the whole goal are not pictured or assessed.'
 },
 '747c5777-07d7-51a9-9be3-7d0d6f51d4e2': {
  'scientificObservations': [
   'H—Cl has one black single bond, Hδ+ in blue and Clδ− in red; a separate red dipole arrow points from H towards Cl.',
   'Linear O=C=O has two black bond lines on each C–O side, red δ− oxygen ends and a blue δ+ carbon center. Two separate, equal, opposite outward dipole arrows cancel; net dipole 0 and CO₂ unpolar are coherent.',
   'Actual glyphs are δ partial charges. Blue means electron poor/δ+ and red means electron rich/δ−; the visible legend has the right meanings.',
   'Colored cloud/surface illustrations are qualitative charge codings. They are not quantitative electron-density or potential measurements, and the bond lines are not dipole arrows.',
   'The two larger panels solve the earlier small right-hand coded-surface/charge-label defect.'
  ],
  'mobile360': 'HCl/CO₂ structures, partial charges, red dipole arrows and their cancellation, and both color-legend meanings are readable at actual image360px.',
  'desktop680': 'Bonds, δ charges, net dipole and legend can be read clearly.',
  'additional316': 'Main bond/dipole distinction, partial charges and electron-poor/electron-rich color legend remain identifiable and readable; text has little spare size.',
  'boundedAltDE': 'HCl besitzt einen Bindungsdipol von Hδ⁺ zu Clδ⁻ und ist polar. Bei linearem CO₂ heben sich zwei entgegengesetzte Bindungsdipole auf. Blau kennzeichnet elektronenarme, Rot elektronenreiche Bereiche.',
  'representationBoundary': 'Qualitative examples and color interpretation only. No numeric electronegativity calculation, calibrated electron-density representation, complete Lewis-pair diagram or whole-goal assessment is claimed.'
 },
 '49235cbe-6658-5e7e-8bd4-398416bcebdc': {
  'scientificObservations': [
   'Read actual labels: Be 900, B 801, N 1402, O 1314, all first ionization energies in kJ/mol. They match the already retrieved and unchanged own NIST reference rounded to whole kJ/mol.',
   'Actual bars have the correct relative ordering B < Be < O < N and show the Be→B and N→O exceptions. Bar heights are a schematic visual approximation, not an exact quantitative replot.',
   'Model shows 1s in n=1, 2s below 2p, both 2s/2p inside n=2; ℓ=0 for 2s and ℓ=1 for 2p. The legend distinguishes n: Schale and ℓ: Unterschale.',
   'The generic line-spectrum inset has no element/wavelength assignment and is treated as schematic. No specific measured spectrum or flame color is attributed to it.',
   'Larger plot unit and n/ℓ annotations solve the previous unreadable small-axis/quantum-number legend finding.'
  ],
  'mobile360': '900/801/1402/1314, the unit kJ/mol, Be/B/N/O, n=1/2 and ℓ=0/1 are readable in the actually viewed 360px image. Axis ticks are small; numerical tops and qualitative height ordering are the principal route.',
  'desktop680': 'Numeric values, unit, axis ticks, n/ℓ assignments and model hierarchy are clearly readable.',
  'additional316': 'Core values, species, 1s/2s/2p and n=1/2 remain readable. Unit, axis ticks and small ℓ annotations are near the lower legibility limit; no unrestricted 316px all-text readability is asserted.',
  'boundedAltDE': 'Die erste Ionisierungsenergie liegt für Be/B bei 900/801 und für N/O bei 1402/1314 kJ/mol. Das Modell unterscheidet 1s sowie 2s mit ℓ=0 und höheres 2p mit ℓ=1; 2s und 2p gehören zu n=2.',
  'representationBoundary': 'Schematic experimental clues and energy-level orientation. Four first-ionization values alone do not determine all quantum numbers; flame colors, wavelength-resolved spectra and a full inferential task are outside this image review.'
 },
 '5e2eb826-6e60-5273-91d6-c23f6dfa33b1': {
  'scientificObservations': [
   'Exactly eight separated small cubes, in two rows of four, versus one larger cube. Labels a and a/2 correspond to their front-edge widths.',
   'Actual corresponding front widths and vertical edges in the same basic perspective are approximately one half (visual native-raster estimate about 0.47–0.51), replacing the previous approximately 0.36 scale. This is a comic schematic, not a CAD measurement.',
   'With edge a/2, 8(a/2)³ = a³; separated external area is 8·6(a/2)² = 12a² versus 6a². These equations are reviewer explanation, not text falsely claimed to be present in the PNG.',
   'Small molecule example H₂O <1nm, the explicit qualification that macromolecules can be larger, nanoparticles typically 1–100nm, and a macroscopic hand-held cube form compatible size examples. They are icons, not a common linear-scale drawing.',
   'The statement that a larger surface can accelerate reactions is conditional and scientifically bounded. No claim that every material property changes in the same way is made.'
  ],
  'mobile360': 'Eight cubes, a/a2 fraction labels, identical total volume/more external surface, the three size categories and 1–100nm are readable at actual image360px. The macromolecule qualification is small but discernible.',
  'desktop680': 'Cube half-edge relation, eight-piece count and all qualifiers are readable; common perspective is visible.',
  'additional316': 'Eight-piece count, approximately half-sized corresponding edges, a/2 and the same-volume/more-surface statement remain usable. The macromolecule qualification and other supplemental fine print are very small; no all-text guarantee is made.',
  'boundedAltDE': 'Ein Würfel mit Kantenlänge a wird in acht getrennte Würfel mit Kantenlänge a/2 geteilt. Das Gesamtvolumen bleibt gleich, die äußere Oberfläche wird größer. Kleine Moleküle, Nanopartikel und makroskopische Objekte haben verschiedene Größenordnungen; Makromoleküle können größer als 1 nm sein.',
  'representationBoundary': 'Qualitative size examples and an idealized cube partition. No universal particle-size/property law, true molecular shape measurement, common image scale or complete whole-goal coverage is asserted.'
 }
}

rows = []
for e in entry['rows']:
    goal = e['wholeCurrentGoal']
    row = {
      'goalId': goal['id'], 'title': goal['title'], 'titleEn': goal['titleEn'],
      'wholeGoalDE': goal['description'], 'wholeGoalEN': goal['descriptionEn'],
      'wholeCurrentGoal': goal, 'wholeCurrentGoalReadDEEN': True,
      'assetHash': e['selectedPNG']['sha256'], 'candidateAsset': e['selectedPNG'],
      'previousOwnV1AssetHash': e['ownV1Findings']['assetHash'],
      'previousOwnV1Decision': e['ownV1Findings']['decision'],
      'previousOwnV1CorrectionRequests': e['ownV1Findings']['correctionRequests'],
      'actualFullNativePNGSight': {'seen': True, 'nativeSize': [1672,941], 'tool': 'view_image original; actual image viewed by this reviewer'},
      'browserViewsActuallySighted': [v for v in browser['rows'] if v['goalId'] == goal['id']],
      'decision': 'KEEP', 'decisionLane': 'independent bounded machine V candidate followup; asset hash specific',
      'previousOwnRequestsResolved': True, 'correctionRequests': [],
      **observations[goal['id']],
      'activeQAChange': False, 'newSourcePApproval': False, 'wholeGoalDPOrSourceCoverage': False,
      'humanApproval': False, 'humanTrial': False
    }
    rows.append(row)

reference = read(ROOT / entry['priorNISTReference']['path'])
reference_bindings = [check(entry['priorNISTReference'])] + [check(r['actualRetrievedHTML']) for r in reference['rows']]
for r in reference['rows']:
    assert r['matchesRoundedReference']
decisions = {
 'schemaVersion': 1, 'documentType': 'independent targeted V-A-v2 actual four-raster followup',
 'createdAtUTC': now, 'reviewerRole': 'independent V-A; not image author',
 'status': 'FOUR_TARGETED_ASSET_HASHES_KEEP_WITH_EXPLICIT_BOUNDS',
 'summary': {'newKEEP': 4, 'newREVISE': 0, 'priorOwnKEEPsCarriedExactOnly': 3, 'wholeCurrentChemistryGoalsAtEntry': 479},
 'authorFreeze': entry['authorFreeze'], 'rawInput': entry['rawInput'],
 'ownPriorV1Decisions': entry['ownPriorV1Decisions'],
 'threeUnchangedPriorOwnKEEPBindingsOnly': entry['threeOwnV1KEEPCarriedOnly'],
 'scope': {
  'fullSelectedPNGsActuallyViewed': 4, 'browserCapturesActuallyViewed': 12,
  'actualMainImageWidths': [360,680], 'mainViewportWidths': [362,682],
  'additionalViewport360CardP5ActualImageWidth': 316,
  'currentGoalCard': entry['currentGoalCard'], 'imgCSS': 'block h-auto max-h-[28rem] w-full object-contain',
  'actualBrowser': browser['browserVersion'], 'browserHarness': 'isolated image QA reproducing image CSS and actual outer-padding case',
  'fullAppOrNativeBookPagesReviewed': False, 'threeUnchangedImagesNewlyReviewed': False,
  'priorOwnNISTReferenceBoundAndVerified': reference_bindings, 'newNISTDownload': False,
  'noAdditionalScientificSourceClaim': True, 'noFullGoalAssessmentOrCoverageClaim': True
 },
 'rows': rows, 'activeWrites': False, 'imageGeneration': False,
 'peerV_B_v2Read': False, 'peerV_B_v1VerdictsRead': False,
 'newSourcePApproval': False, 'humanApproval': False, 'humanTrial': False,
 'newStrictClosures': 0, 'strictNetGain': 0
}
write('targeted-v-a-v2.decisions.actual.json', decisions)

# Final input guard deliberately permits a whole-canonical metadata drift only
# when all seven complete goal objects remain exactly the supplied raw goals.
inputs = [entry['authorFreeze'], entry['rawInput'], entry['ownPriorV1Decisions'], entry['currentGoalCard']]
inputs.extend(entry['authorFrozenPayloadFiles'])
inputs.extend(reference_bindings)
prior_freeze_path = PRIOR / 'independent-v-a.final.freeze.json'
assert digest(prior_freeze_path)['sha256'] == 'sha256:abf354889a267923c3e612adeb388139f7e3bc74d5dc8fc74e77372b69c17c7c'
inputs.append(digest(prior_freeze_path))
for r in raw['rows']:
    inputs.append(r['selectedPNG'])
    inputs.extend(r['originalSourceFrontendBackendExactBefore'])
if isinstance(raw.get('strictReport'), dict) and 'path' in raw['strictReport']:
    inputs.append(raw['strictReport'])
unique = {}
for binding in inputs:
    actual = check(binding)
    unique[actual['path']] = actual
canonical_path = ROOT / entry['actualCurrentWholeCanonical']['path']
canonical = read(canonical_path)
assert len(canonical['goals']) == 479
by_id = {g['id']:g for g in canonical['goals']}
whole_goal_checks = []
for r in raw['rows']:
    exact = by_id[r['goalId']] == r['wholeCurrentGoal']
    assert exact, (r['goalId'], 'whole goal drift')
    whole_goal_checks.append({'goalId':r['goalId'], 'wholeGoalExactlyRawAtFinal':exact})
current_canonical = digest(canonical_path)
canonical_drift = current_canonical != entry['actualCurrentWholeCanonical']
guard = {
 'schemaVersion':1, 'createdAtUTC':now, 'status':'PASS',
 'uniqueStableInputFilesActuallyRehashed':len(unique), 'stableInputFiles':list(unique.values()),
 'authorPayloadFilesVerified':29, 'authorDirectoryFilesIncludingFreeze':30,
 'entryWholeCanonicalHistoricalBindingPreserved':entry['actualCurrentWholeCanonical'],
 'actualFinalWholeCanonical':current_canonical, 'wholeCanonicalByteDriftSinceEntry':canonical_drift,
 'wholeCanonicalCount':479, 'sevenWholeCurrentGoalsExactlyRaw':whole_goal_checks,
 'fourChangedPNGHashSpecificKEEP':4, 'threeOwnV1KEEPsExactBindingOnly':3,
 'actualOwnSourceFrontendBackendNoWrites':True,
 'ownBrowserScreenshotFilesVerified':12, 'peerV_B_v2Read':False,
 'newSourcePOrHumanApproval':False, 'strictNetGain':0,
 'wholeCanonicalDriftMeaning':'Whole-file byte drift is separately recorded; it does not re-label the preserved author/entry hash or imply a new review of unaffected goals.'
}
write('targeted-v-a-v2.final-inputs-guard.actual.json', guard)

readme = '''# Unabhängiges gezieltes V-A-v2-Followup

**Ergebnis: vier neue KEEP, keine REVISE.** Die Entscheidung gilt nur für die vier ausgewählten PNG-Hashes in `targeted-v-a-v2.decisions.actual.json`. Drei unveränderte eigene V1-KEEPs werden ausschließlich bytegenau weitergebunden; sie wurden nicht erneut bewertet. Der V1-Bericht bleibt unverändert.

| Ziel | Eigener gezielter Befund |
|---|---|
| 965ca297 – Salzformeln aus Ionenladungen ableiten | 2 Al³⁺, 3 O²⁻, Verhältnis 2:3, Al₂O₃ und Ladungssumme 0 stimmen und sind ausreichend groß. |
| 747c5777 – Bindungs- und Molekülpolarität ableiten | δ-Zeichen und Farblegende stimmen; schwarze Bindungen und rote Dipolpfeile sind getrennt. Lineare CO₂-Dipole heben sich auf. |
| 49235cbe – Unterenergiestufen aus Spektren und Ionisierungsenergien ableiten | Be/B 900/801 und N/O 1402/1314 kJ/mol, relative Höhen sowie n=1/2 und ℓ=0/1 stimmen. Das Spektrum bleibt schematisch. |
| 5e2eb826 – Partikelgröße und Oberflächen-Volumen-Verhältnis deuten | Acht getrennte kleine Würfel haben in derselben grundlegenden Perspektive ungefähr halbe entsprechende Kanten. Gleicher Gesamtinhalt und größere äußere Oberfläche passen. |

Alle vier vollständigen aktuellen DE/EN-Ziele und vier native PNGs (1672×941) wurden tatsächlich gelesen bzw. gesehen. Zusätzlich wurden zwölf tatsächliche Chromium-Abbildungen gesehen. Ein erfolgreicher Screenshotlauf allein wurde nicht als Sichtprüfung gewertet.

## Tatsächliche Breiten und Grenzen

Die isolierte Bildbrowser-QA reproduziert die aktuelle `GoalCard.tsx`-Bildklasse `block h-auto max-h-[28rem] w-full object-contain`. Die Hauptfälle haben **360 bzw. 680 px tatsächliche Bildbreite**, bei Viewports 362/682 px wegen des Figure-Rahmens. Zusätzlich wurde ein **360-px-Kartenfall mit p-5, Karten- und Figure-Rahmen** geprüft: dort ist das Bild **316 px breit**. Alle zwölf Bilder laden; `object-fit: contain` gilt, und die Maximalhöhe 448 px greift bei diesen Bildbreiten nicht.

Bei 360/680 px sind die entscheidenden Ladungen, Dipole, Werte, Einheiten und Quantenzahlen lesbar. Im engeren 316-px-Fall sind insbesondere die kleinen Achsenticks/ℓ-Angaben und der ergänzende Makromolekülhinweis knapp. Es gibt keine pauschale Garantie, dort jeden Kleinsttext sicher zu lesen. Die getrennten fallbezogenen Befunde stehen im Entscheidungs-JSON.

Die Farbfelder und Würfel sind qualitative Illustrationen. Der Energiebalkenplot bewahrt die richtige relative Höhenfolge und numerischen Werte, ist aber kein exakt skalierter Messplot. Die acht vorliegenden NIST-HTML-Nachweise und der eigene V1-Datenreceipt wurden erneut bytegenau geprüft; es gab keinen neuen Download und keine Änderung der gültigen Datentexte.

Die empfohlenen `boundedAltDE`-Texte beschreiben ausschließlich tatsächlich vorhandene Bildinhalte. Kein Bild beansprucht vollständige Deckung seines ganzen Lernziels. Diese Prüfung ist weder eine vollständige App-/Native-Buch-Seitenprüfung noch Quellen-/P-/D-Freigabe, aktiver QA-Eintrag, Human Approval, Human Trial oder M7-Abschluss. Keine Peer-V-B-v2-Befunde wurden gelesen; keine Bilder erzeugt und keine aktiven Dateien geändert. Netto strenge Abschlüsse: 0.

## Bindungen und Freeze

Der Author-Freeze `d98626c72ae462ba680483e5e3a1431353e950ddb8eb28a2ebf99df1b027c709` bindet 29 Nutzdateien; das Verzeichnis hat 30 Dateien einschließlich des Freeze. Eigener Eingang, zwölf Browser-Screenshots, Browserprobe, vier Entscheidungen und finale Eingangsprüfung stehen in diesem eigenen Ordner. Die finale Prüfung erhält den historischen Author-/Eingangshash und bindet den tatsächlich aktuellen ganzen Kanon getrennt, falls sich parallel autorisierte Metadaten ändern. Alle sieben vollständigen Zielobjekte müssen weiterhin exakt zum Raw-Eingang passen.

`targeted-v-a-v2.final.freeze.json` versiegelt ausschließlich diese eigenen Artefakte. Nach dem Freeze bleibt der Prüfer idle; weitere Aufträge sind getrennt.
'''
(OWN/'README.md').write_text(readme)
freeze_name = 'targeted-v-a-v2.final.freeze.json'
files = []
for p in sorted(OWN.rglob('*')):
    if p.is_file() and p.name != freeze_name:
        d = digest(p)
        d['path'] = str(p.relative_to(OWN))
        files.append(d)
freeze = {
 'schemaVersion':1, 'documentType':'independent targeted V-A-v2 final own freeze',
 'frozenAtUTC':now, 'files':files, 'payloadFiles':len(files),
 'decision':'FOUR_TARGETED_KEEP', 'newKEEP':4, 'newREVISE':0,
 'priorOwnKEEPsExactBindingOnly':3, 'authorFreeze':entry['authorFreeze'],
 'actualFullNativeViews':4, 'actualBrowserViews':12,
 'actualImageWidths':[360,680,316], 'activeWrites':False,
 'peerV_B_v2Read':False, 'imageGeneration':False,
 'newSourcePApproval':False, 'humanApproval':False, 'humanTrial':False,
 'newStrictClosures':0, 'strictNetGain':0
}
write(freeze_name,freeze)
for f in files:
    check({**f,'path':str((OWN/f['path']).relative_to(ROOT))})
print(json.dumps({'status':'PASS','newKEEP':4,'newREVISE':0,'payloadFiles':len(files),'filesIncludingFreeze':len(files)+1,'canonicalDrift':canonical_drift,'stableInputFiles':len(unique),'freeze':digest(OWN/freeze_name)},ensure_ascii=False))
