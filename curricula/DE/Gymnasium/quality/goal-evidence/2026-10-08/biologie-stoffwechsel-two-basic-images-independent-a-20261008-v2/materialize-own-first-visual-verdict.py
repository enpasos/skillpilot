# SPDX-License-Identifier: Apache-2.0
"""Seal this reviewer's first actual V judgments; no candidate/active edits."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
A = Q / 'biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2'
O = Q / 'biologie-stoffwechsel-two-basic-images-independent-a-20261008-v2'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(p):
    return json.loads(Path(p).read_text())


def bind(p):
    p = Path(p)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def exact(row):
    assert bind(row['path']) == row, row['path']


def write(name, body):
    p = O / name
    assert not p.exists(), str(p)
    p.write_text(json.dumps(body, ensure_ascii=False, indent=2) + '\n')
    return bind(p)


first_input_path = O / 'first-actual-images-and-whole-templates.input.freeze.json'
first_input = read(first_input_path)
for r in first_input['requiredFiles']:
    exact(r)
image_entry_path = A / 'neutral-two-basic.actual-images.author.entry.json'
image_entry = read(image_entry_path)
author_image_seal_path = A / 'two-basic-images.author.first-binding.freeze.json'
for r in read(author_image_seal_path)['files']:
    exact(r)
goals = read(O / 'whole-two-current-DEEN-templates.visual-input-snapshot.json')['wholeCurrentGoals']
goals_by_id = {g['id']: g for g in goals}
actual_receipt_path = O / 'actual-two-raster-six-view-binding.receipt.json'
actual_receipt = read(actual_receipt_path)
records = []
for row in image_entry['images']:
    goal_id = row['goalId']
    goal = goals_by_id[goal_id]
    inspection = next(r for r in actual_receipt['inspection'] if r['goalId'] == goal_id)
    assert bind(row['path'])['sha256'] == row['sha256']
    assert Path(inspection['actualProviderOutputExact']).read_bytes() == Path(row['path']).read_bytes()
    resource = next(r for r in goal['resourceLinks'] if r['type'] == 'goal-visualization')
    assert resource['description'] == row['descriptionDe'] and resource['altText'] == row['altTextDe']
    base = {
        'goalId': goal_id, 'asset': bind(row['path']), 'format': 'PNG',
        'dimensions': {'width': 1672, 'height': 941},
        'verdict': 'APPROVE_AI_VISUAL_GATE_EXACT_CURRENT_RASTER',
        'actualIndependentlySeenViews': inspection['actualViews'],
        'wholeCurrentBilingualGoal': copy.deepcopy(goal),
        'wholeCurrentPProfileAndTwoCompleteDEENCasesReadForScope': True,
        'nativeDPReviewPerformed': False, 'sourceRefinedFinalReviewPerformed': False,
        'providerOriginalBytesExact': True,
        'captionAndAltTextMatchActuallySeenPixels': True,
        'originalPromptAndStandaloneReconstructionReadAgainstActualPixels': True,
        'blockingFindings': [], 'humanApproved': False,
        'humanTrial': False, 'status': 'ai_candidate', 'qaStatus': 'needs_human_review',
        'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    }
    if goal_id == '0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38':
        base.update({
            'ownScientificPixelObservationsDe': [
                'Glucose und Sauerstoff zeigen jeweils mit einem blauen Pfeil in die beschriftete Zelle. CO₂ und Wasser haben eigene ausgehende blaue Stoffpfeile. Keine Ein-/Ausgangsrichtung ist umgekehrt.',
                'Zwei goldene Pfeile aus der Zelle führen zu Arbeit und Wärme. Damit ist die Energieumwandlung für Lebensprozesse und Wärmeabgabe vom Stoffumsatz unterschieden; Sauerstoff ist als Reaktionsstoff dargestellt, nicht als neu erschaffende Energiequelle.',
                'Das freundliche tierische Zellbild ist ein schematisches Gesamtmodell. Keine Lunge, keine Sonnen-/Nachtbedingung, keine ATP-Zahl und keine drei molekularen Stufen werden fälschlich eingezeichnet. Die aktuelle Caption sagt ausdrücklich, dass der Zelltyp Zellatmung nicht auf Tiere begrenzt.',
                'Die Stoffovale sind abstrakte Knoten und kein Molekül- oder Mengenmodell. Die vereinfachte Bilanz ist für das Wortgleichungsziel angemessen; sie ersetzt keine chemische Bruttogleichung oder tatsächlich durchgeführte CO₂-/Wärmeversuche.',
            ],
            'ownLegibilityObservationsDe': 'Alle sieben Beschriftungen einschließlich CO₂, Sauerstoff und Wärme sind im Original und in beiden tatsächlich gesehenen 360-/680-Pixelbildern lesbar. Pfeilspitzen und Farbe bleiben unterscheidbar; kein wesentlicher Text oder Stoffpfeil ist abgeschnitten.',
            'ownDidacticJudgmentDe': 'Das Bild trägt die ganze gemeinte vereinfachte Stoff-/Energievorstellung, ohne Pflanzenatmung, tatsächliche Leistung oder molekulare Details auszuschließen bzw. zu behaupten. Die Muskel-/Samenfälle können damit erklärt werden; Pflanzenbezug und Energieerhaltung bleiben ausdrücklich auch im begleitenden Profil/Falltext. Kein konkreter neuer V-Blocker.',
            'acceptedSchematicLimits': ['No molecular structure or quantitative stoichiometry', 'No complete mechanistic respiration chain', 'No independently performed experiment or learner performance proved'],
        })
    else:
        assert goal_id == '32483d30-2162-50a5-a6cc-05b7f2467ab1'
        base.update({
            'ownScientificPixelObservationsDe': [
                'Ein goldener Sonnenpfeil endet am linken Thylakoidstapel mit lichtabhängig. Ein zweiter, breiter und ausdrücklich mit chemische Energie beschrifteter Pfeil führt von links zum rechten Bereich lichtunabhängig.',
                'Der separate blaue CO₂-Stoffpfeil führt in den rechten Bereich zu beschrifteten organischen Stoffen. Stoffeintrag und Energieversorgung sind voneinander getrennt; die Sonne liefert keine direkte Ersatz-Kohlenstoffquelle.',
                'Der Bildzusammenhang zeigt beide Reaktionsfunktionen im selben beleuchteten Chloroplasten. Keine Mond-/Nacht-Dichotomie behauptet eine ausschließlich nächtliche Dunkelreaktion. Der Vorrats-/Kohlenstoff-Transfer in den vollständig gelesenen DE/EN-Fällen ist mit der gezeichneten Kopplung vereinbar.',
                'Die drei grünen rechten Ovale sind durch ihre Beschriftung und die aktuelle Caption/Rekonstruktion abstrakte organische Stoffknoten, keine atomare Struktur oder quantitative Produktzahl. Das Bild erhebt keinen Anspruch auf ATP/NADPH-Aufschlüsselung, Calvin-Phasenzyklus oder vollständige Wasser-/Sauerstoffbilanz.',
            ],
            'ownLegibilityObservationsDe': 'Original, 360- und 680-Pixelbild sind tatsächlich angesehen. Die fünf Beschriftungen sind richtig geschrieben und lesbar; die kleinste chemische-Energie-Beschriftung bleibt auch bei 360 Pixel erkennbar. Die große Versorgungspfeilspitze und die getrennte CO₂-Pfeilspitze bleiben deutlich.',
            'ownDidacticJudgmentDe': 'Die funktionale Kopplung wird fachlich angemessen vereinfacht: Licht wird links aufgenommen, nutzbare chemische Mittel versorgen rechts den Stoffaufbau aus CO₂. Die abstrakte Energieversorgung ist für dieses Basisziel zulässig und wird im Profil als Energie-/Reduktionsmittel erklärt; sie ist kein unmittelbarer Photonenstrom in den lichtunabhängigen Teil. Kein konkreter neuer V-Blocker.',
            'acceptedSchematicLimits': ['Abstract organic-substance ovals, not molecular structures', 'No ATP/NADPH or quantitative photosynthesis balance claimed', 'Not a complete kinetic/regulatory account of darkening', 'No whole source-union or performed experiment claim'],
        })
    records.append(base)

verdict_binding = write('two-basic-images.independent-a.first.verdicts.json', {
    'schemaVersion': 1, 'role': 'Own independent actual V-A first judgments for exact two current PNGs',
    'reviewer': '/root/curricula_live_diagnosis', 'createdAtUtc': now,
    'neutralImageAuthorEntry': bind(image_entry_path), 'imageAuthorFirstSeal': bind(author_image_seal_path),
    'ownFirstInputFreeze': bind(first_input_path), 'actualOwnRasterViewReceipt': bind(actual_receipt_path),
    'records': records,
    'summary': {'actualOriginalsSeen': 2, 'actualPreview360Seen': 2, 'actualPreview680Seen': 2,
                'approvedExactCurrentAIVisualCandidates': 2, 'concreteVBlockers': 0,
                'wholeDEENCurrentTemplatesRead': 2, 'wholePProfilesReadForVisualScope': 2,
                'completeDEENCasesIncludingMaterialTaskModelScoringFreshTransferReadForVisualScope': 4},
    'generationAndAuthorViewingAreNotIndependentApproval': True,
    'newPeerVisualBReadBeforeFirstSeal': False,
    'sourceRefinedFinalAuthorSealNotReviewedAsPartOfThisVFirstRound': True,
    'sourceDPAMContextReviewsAreSeparateAndNotApprovedHere': True,
    'fourOriginalOperatorHoldsAndHumanFieldsUntouched': True,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
entry_binding = write('two-basic-images.independent-a.first.entry.json', {
    'schemaVersion': 1, 'role': 'Independent actual first V-A handoff, not source/native approval',
    'createdAtUtc': now, 'neutralImageAuthorEntry': bind(image_entry_path),
    'imageAuthorFirstSeal': bind(author_image_seal_path),
    'visualVerdicts': verdict_binding, 'actualOwnRasterViewReceipt': bind(actual_receipt_path),
    'ownFirstInputFreeze': bind(first_input_path),
    'firstSealPath': str(O / 'two-basic-images.independent-a.first-verdict.freeze.json'),
    'approvedExactCurrentPNGs': [bind(r['path']) for r in image_entry['images']],
    'independentlyViewedAllSixActualImages': True, 'newConcreteVBlockers': 0,
    'newPeerVisualBReadBeforeFirstSeal': False,
    'sourceNativeDPAMAndExisting576ContextReviewPending': True,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
readme_path = O / 'README.md'
assert not readme_path.exists()
readme_path.write_text('''# Basis2: tatsächliche unabhängige V-A-Erstprüfung

Beide Original-PNGs sowie sämtliche tatsächlichen 360-/680-Pixelbilder wurden
selbst angesehen. Beide vollständigen aktuellen bilingualen Templates, zwei
ganze P-Profilkörper und vier komplette DE/EN-Fälle einschließlich Material,
Aufgabe, Modellantwort, Scoring und frischem Transfer wurden für den Bildscope
gelesen. Eigene Urteile wurden vor neuen Peer-V-Urteilen versiegelt.

Beide exakten aktuellen PNG-Kandidaten bestehen das maschinelle V-Gate ohne
konkreten neuen Blocker. Stoff- und Energiepfeile, Beschriftungen, Modellgrenzen
und Lesbarkeit wurden tatsächlich geprüft. Caption/Alttext/Rekonstruktion und
die echte Tool-Herkunft stimmen mit den Bildern überein.

Dies ist weder ein Quellen-/D/P-/A/M-Review noch Human Approval/Trial. Der neue
source-refined Autoren-Erstseal wird erst danach gesondert beurteilt. Die vier
Originaloperator-HOLDs, menschlichen Felder und aktive Daten bleiben unverändert.
''')
inputs = {b['path']: b for b in first_input['requiredFiles']}
for r in actual_receipt['inspection']:
    inputs[r['actualProviderOutputExact']] = bind(r['actualProviderOutputExact'])
for b in inputs.values():
    exact(b)
owned = [bind(p) for p in sorted(O.iterdir()) if p.is_file()]
first_seal = write('two-basic-images.independent-a.first-verdict.freeze.json', {
    'schemaVersion': 1, 'role': 'Immutable own independent actual V-A first judgment seal',
    'sealedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'neutralImageAuthorEntry': bind(image_entry_path), 'imageAuthorFirstSeal': bind(author_image_seal_path),
    'firstVisualVerdicts': verdict_binding, 'resultEntry': entry_binding,
    'ownedArtifacts': owned, 'inputs': list(inputs.values()),
    'actualOwnedArtifacts': len(owned), 'actualFrozenInputs': len(inputs),
    'hashMismatches': [], 'newPeerVisualBReadBeforeFirstSeal': False,
    'approvedExactCurrentRasterCandidates': 2, 'newConcreteVisualBlockers': 0,
    'sourceNativeDPAMContextApproval': False,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'entry': entry_binding, 'firstSeal': first_seal,
                  'ownedArtifacts': len(owned), 'inputs': len(inputs),
                  'exactCurrentVisualCandidateApprovals': 2, 'concreteVisualBlockers': 0,
                  'newPeerVisualBRead': False}, ensure_ascii=False, indent=2))
