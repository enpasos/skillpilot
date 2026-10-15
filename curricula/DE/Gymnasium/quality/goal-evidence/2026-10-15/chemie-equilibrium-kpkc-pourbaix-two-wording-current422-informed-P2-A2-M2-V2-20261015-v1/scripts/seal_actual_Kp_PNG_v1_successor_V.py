# SPDX-License-Identifier: Apache-2.0
"""Seal the newly observed actual PNG successor V; no normal ledger binding."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os

REPO = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]


def read(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def write(p, value):
    assert not p.exists(), p
    temporary = p.with_name(p.name + '.partial')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, p)


original_seal_path = OWN / 'FILES.finite-prebinding-science-and-views.seal.json'
assert ref(original_seal_path)['sha256'] == 'sha256:534194d4ff0a773cdb3d2d82553476385cd1d4651b88afd469b8258a697aa169'
for r in read(original_seal_path)['files']:
    assert ref(REPO / r['path']) == r
context_path = OWN / 'inputs/Kp.image-only-v1.current-whole-input.json'
receipt_path = OWN / 'browser/RECEIPT.actual-Kp-PNG-v1-316-636.json'
ctx, receipt = read(context_path), read(receipt_path)
assert ref(REPO / ctx['canonical']['path']) == ctx['canonical']
assert ref(REPO / ctx['actualPNG']['path']) == ctx['actualPNG']
assert len(receipt['records']) == 2 and receipt['normalBindings'] == 0
for row in receipt['records']:
    assert row['metrics']['complete'] and row['pageErrors'] == []
    assert row['metrics']['imageWidth'] in [316, 636]
    assert row['metrics']['naturalWidth'] == 1672 and row['metrics']['naturalHeight'] == 941
    for key in ['screenshot', 'fixture']:
        assert ref(REPO / row[key]['path']) == row[key]
now = datetime.now(timezone.utc).isoformat()
first_path = OWN / 'science/FIRST.actual-Kp-PNG-v1-successor-V.original.json'
write(first_path, {
    'schemaVersion': 1, 'role': 'Own genuine independent informed V science for actual new Kp PNG-v1; no expected acceptance used',
    'completedAtUTC': now, 'goalId': ctx['wholeGoal']['id'], 'decision': 'accepted',
    'currentWholeInput': ref(context_path), 'actualNativePNG': ctx['actualPNG'],
    'currentWholeGoal': ctx['wholeGoal'], 'actualBrowserReceipt': ref(receipt_path),
    'nativePNGsActuallySeen': 1, 'newCurrentGoalCardViewsActuallySeen': 2,
    'nativeFindingsDe': 'Die tatsächlich native PNG zeigt p_i=c_iRT und Kp=Kc(RTc°/p°)^Δν mit korrektem Bruch, Standardmarkierungen und Exponenten. Kp und Kc sind ausdrücklich dimensionslos; c° und p° sind Standardgrößen. Δν wird als Gas-Koeffizienten, Produkte minus Edukte, bezeichnet und ist im ganzen Kontext die Differenz der Summen gasförmiger stöchiometrischer Koeffizienten. Nur ideale Gase und T in Kelvin begrenzen die Gleichung. Die zwei Gefäßskizzen illustrieren zwei Beschreibungen eines Gases, keine Messung oder genaue Spezieszählung. Die Auswahl einer dimensionslosen Konvention erklärt die neue Formel; die alte unnormierte Produktkonvention wird dadurch nicht falsch.',
    'responsiveFindingsDe': 'Beide neu selbst gerenderten aktuellen Ansichten wurden tatsächlich bei Originalpixelgröße gesehen. In der360-GoalCard mit316 Bildpixeln sind p_i=c_iRT, die Hauptgleichung einschließlich c°/p° und Δν, dimensionslos, Standardgrößen sowie der Ideal-/Kelvinhinweis lesbar. Die kürzere Gas-Koeffizienten-Zuordnung mit Produkte minus Edukte bleibt erkennbar; bei636 ist sie klar. Es gibt keinen Beschnitt oder Ladefehler. Kleine Teilchen-/Druckmesserdetails sind nur Illustration und tragen keine notwendigen Definitionen. Der zuvor benannte mobile Zugang zu den Modell-/Formelbedingungen ist damit tatsächlich hergestellt.',
    'wholeContextCompatibilityDe': 'Der ganze aktuelle DE/EN-Text, der gelesene Massenwirkungsgesetz-Prärequisit und Parent sowie die beiden ganzen07-a/b-Fälle stimmen mit dieser Konvention überein. 07-a verlangt die Herleitung über p_i/p°=(c_i/c°)(RTc°/p°), 07-b die Gasstöchiometrie-/Feststoff- und Nichtidealitätsgrenze. R muss weiterhin zu den deklarierten Einheiten passen; das wird im ganzen Resourcebeschreibungstext und in den Fällen ausdrücklich getragen. Das Bild muss nicht alle Rechenschritte oder Fallvarianten zeigen und liefert keine beobachtete Lernleistung. Die neue native PNG und ihre aktuelle ALT/Resourcebeschreibung wurden eigenständig tatsächlich geprüft; keine Generatoraussage wurde als V-Urteil übernommen.',
    'reasonEn': 'Accept after actual native and new316/636 current-GoalCard inspection. The dimensionless standard-state relation, ideal-gas link, gas-stoichiometric exponent and Kelvin/model conditions are correct and mobile-accessible in the complete current context. The original unnormalised JPG was not mathematically false; its preserved revision concerned mobile legibility.',
    'previousOriginalNegativeVScienceSeal': ctx['originalNegativeVFIRSTSeal'],
    'previousOriginalPrebindingFiniteSeal': ref(original_seal_path),
    'originalJPGRevisionAndAllOriginalPAMSciencePreservedExact': True,
    'other559WholeGoalsExact': ctx['other559WholeObjectsExact'],
    'all560TextAndGraphBodiesExact': ctx['all560TextAndGraphBodiesExact'],
    'PAMScienceOriginalsStillApplicableToUnchangedTextsAndBodies': True,
    'normalNewRecordsAtFIRST': 0, 'normalNewFingerprintsAtFIRST': 0,
    'sourceImageCopies': 0, 'wholeBookOrNativeRenderer': False,
    'newDOrSourceCourseHumanApproval': False, 'M7Grant': False,
    'fourSourceCourseHoldsRemainOpen': True,
})
first_seal_path = OWN / 'science/FIRST.actual-Kp-PNG-v1-successor-V.seal.json'
write(first_seal_path, {
    'schemaVersion': 1, 'role': 'Original own actual Kp PNG successor V FIRST before any normal binding',
    'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'files': [ref(first_path)],
    'accepted': 1, 'revise': 0, 'normalNewRecordsAtSeal': 0,
    'normalNewFingerprintsAtSeal': 0, 'activeWrites': 0,
})
selector_path = OWN / 'SELECTION.finite-Kp-PNG-v1-actual-successor-V-science.json'
write(selector_path, {
    'schemaVersion': 1, 'role': 'Finite actual Kp image successor science only; normal binding waits for parent final context readiness',
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'goalId': ctx['wholeGoal']['id'],
    'actualNewPNG': ctx['actualPNG'], 'currentImageOnlyCanonical': ctx['canonical'],
    'unchangedSemantic': ctx['unchangedSemantic'], 'actualWholeCurrentInput': ref(context_path),
    'actualNewNativePNGSeen': 1, 'actualNewGoalCardViewsSeen': 2,
    'imageWidths': [316, 636], 'browserReceipt': ref(receipt_path),
    'newOriginalVFIRST': ref(first_path), 'newVFIRSTSeal': ref(first_seal_path),
    'decision': 'accepted', 'oldJPGReviseOriginalExact': True,
    'originalPAMSealsExact': ctx['originalPAMScienceSeals'],
    'earlierFiniteScienceAndViews': ref(original_seal_path),
    'PourbaixOriginalAcceptedVUnchanged': True,
    'normalPAMVFinalizations': 0, 'newStockFingerprints': 0,
    'sourceImageCopies': 0, 'newSourceCourseDOrHumanApproval': False,
    'pending': 'Parent final frozen image context/selector and explicit normal-finalization continuation; no normal end runs yet.',
})
seal_path = OWN / 'FILES.finite-Kp-PNG-v1-actual-successor-V-FIRST-and-views.seal.json'
files = [ref(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p != seal_path]
write(seal_path, {'schemaVersion': 1, 'role': 'Finite append-only original plus actual Kp PNG successor V science',
                  'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'selector': ref(selector_path),
                  'files': files, 'regularPayloadFiles': len(files),
                  'regularPayloadBytes': sum(r['bytes'] for r in files),
                  'sealExcludedFromOwnInventory': True, 'normalBindings': 0, 'activeWrites': 0})
for r in files:
    assert ref(REPO / r['path']) == r
print(json.dumps({'selector': ref(selector_path), 'seal': ref(seal_path),
                  'FIRSTSeal': ref(first_seal_path), 'decision': 'accepted',
                  'payloadFiles': len(files), 'normalBindings': 0}, indent=2))
