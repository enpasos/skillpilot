# SPDX-License-Identifier: Apache-2.0
"""Seal own original informed V science; zero normal records or QA appends."""
from pathlib import Path
from datetime import datetime, timezone
import ast
import hashlib
import json
import os

REPO = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]
CHEM = '4d16601e-fa57-5bcb-a5b6-f308d5b8036a'
BIO = 'cb7125b7-8734-51c6-8306-9163114dc0cc'


def read(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def verify(r):
    assert ref(REPO / r['path']) == r, r['path']


def write(p, d):
    assert not p.exists(), p
    temporary = p.with_name(p.name + '.partial')
    temporary.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, p)
    assert read(p) == d


input_path = OWN / 'inputs/two-whole-child-contexts-four-cases-and-image-references.actual.json'
receipt_path = OWN / 'browser/RECEIPT.actual-own-360-680-GoalCard-browser.json'
context, receipt = read(input_path), read(receipt_path)
assert len(context['wholeContexts']) == 2 and len(receipt['records']) == 4
for key in ['neutralAuthorSelector', 'wholeAuthorSeal', 'wholeTwoGoalSource', 'baseGoalContextReferenceOnly',
            'correctedCaseSelector', 'correctedCases', 'otherOriginalCases']:
    verify(context[key])
assert receipt['sourceImageCopies'] == receipt['normalVRecords'] == receipt['QA438Writes'] == 0
for row in receipt['records']:
    assert row['metrics']['imageWidth'] in [316, 636]
    assert row['metrics']['naturalWidth'] == 1672 and row['metrics']['naturalHeight'] == 941
    assert row['metrics']['complete'] and row['pageErrors'] == []
    for key in ['fixture', 'screenshot', 'sourceImage']:
        verify(row[key])
    fixture = REPO / row['fixture']['path']
    assert (fixture.parent / row['localImageReference']).resolve() == (REPO / row['sourceImage']['path']).resolve()
    assert row['metrics']['currentSrc'] == (REPO / row['sourceImage']['path']).as_uri()
    assert row['localImageReference'] in fixture.read_text()
now = datetime.now(timezone.utc).isoformat()
findings = {
    CHEM: {
        'decision': 'accepted',
        'nativeFindingsDe': 'Die tatsächlich native PNG trennt Planen, Aufarbeiten und Prüfen. Die Schülerin trägt Schutzbrille und Kittel und präsentiert ein vereinfachtes Heftschema zweier Ausgangslösungen zum Ansatz. Rechtsgerichtete Pfeile verbinden die Arbeitsphasen. Im mittleren Feld liegt weißer Feststoff im Filterpapier; die Waschflasche führt Flüssigkeit zu, die Spitze gibt partikelfreie Tropfen in einen offenen Auffangkolben. Ein Niederschlagsbecher steht davor. Im Prüffeld liegt Feststoff auf einem Uhrglas auf der Waage; die Anzeige ist ohne Messwert, die Lupe trägt ein Fragezeichen. Damit wird kein Produkt als rein zertifiziert und keine Ausbeute aus einer gezeichneten Zahl abgeleitet. Blaue Schattierung der Gefäße/Flüssigkeit ist ein illustrativer Farbstil, kein stoffzugeordneter Nachweis. Keine sichtbare Flamme, Verkostung oder Druckapparatur.',
        'responsiveFindingsDe': 'Die tatsächlichen360/680-Container ergeben316/636 Bildpixel und wurden beide persönlich bei Originalpixelgröße gesehen. Planen/Aufarbeiten/Prüfen sind lesbar, Person/Heft, Filter gegenüber Auffangkolben, Produkt auf Uhrglas, Waage und Reinheitsfrage bleiben bei316 erkennbar. Bei636 sind Filterpapier/Niederschlag und die vereinfachte Heftskizze klarer. Weder Zuschnitt noch Ladefehler verdeckt die zentrale Feststoff-/Flüssigkeitszuordnung. Das Bild benötigt keine mikroskopisch lesbaren Rezeptzahlen; es zeigt bewusst keine.',
        'wholeContextCompatibilityDe': 'Der ganze DE/EN-Zieltext verlangt Planung anhand Gleichung/Stoffmengen, sichere tatsächliche Herstellung, Aufarbeitung, Dokumentation und begründete Trennung von Masse, Ausbeute und Reinheitsgrenzen. Die gelesenen ganzen korrigierten Fälle enthalten die tatsächlich neu eindeutig bezeichnete Mengenvariation; deren5,00/3,00mmol und0,3003g im Transfer werden nicht aus dem Bild behauptet. Waschen, trockene Massen und unabhängige Reinheitsinformation bleiben Fallanforderungen. Die Darstellung unterstützt diesen Gegenstand, ohne als vollständiges Protokoll, Messung oder beobachtete Ausführung zu gelten. Alle sieben direkten Voraussetzungen und der ganze Parent wurden gelesen; kein V-Schluss auf D/P/A/M oder Quellen-/Kurspflicht.',
        'reasonEn': 'Accept this qualitative planning/work-up/checking illustration after native and actual316/636 inspection. Solid remains in paper, liquid drains separately, and blank mass display plus question mark does not certify yield or purity. The whole corrected cases carry the quantitative and practical evidence requirements; the cartoon supplies none of that evidence.',
    },
    BIO: {
        'decision': 'accepted',
        'nativeFindingsDe': 'Die native PNG zeigt Hefezugabe durch eine Schülerin mit Schutzbrille/Kittel. Im Vergleichsfeld stehen gleichartige offene Kolben mit aktiv/inaktiv im gleichen Wasserbad; der aktive Ansatz zeigt mehr Blasen. Offene Hälse verhindern die Fehlimplikation eines druckdicht geschlossenen Gärgefäßes. Wärmesymbole/ungestuftes Thermometer sind schematische Temperierung, keine gezeichneten30°C-Daten und kein Kochprotokoll. Bei der Aufarbeitung verbleiben braune feste Bestandteile im Papier; helle Tropfen erreichen den offenen Auffangkolben. Die Lupe zeigt verschiedenfarbige Modellpunkte und ein Fragezeichen im Filtrat: keine Identifikation einzelner Moleküle, keine reale optische Mikroskopie, kein Reinstoff-Ethanol. Es gibt keine Gasmengen-, Zeit- oder Reinheitszahl und keinen CO2-Nachweis.',
        'responsiveFindingsDe': 'Beide tatsächlich selbst gerenderten und persönlich gesehenen GoalCards enthalten bei316 beziehungsweise636 Bildpixeln die vollständige Abbildung und den aktuellen ganzen Text. Herstellen/Vergleichen/Aufarbeiten sowie aktiv/inaktiv sind bei316 lesbar; die beiden offenen Gefäße im gemeinsamen Bad, der qualitative Blasenunterschied, Filterfeststoff und gemischtes Filtrat/Fragezeichen bleiben unterscheidbar. Bei636 sind die Papier-/Tropfenroute und verschiedenen Modellpunkte klar. Keine unsichtbare Kleintextlegende trägt die entscheidende biologische Kontrolle oder Reinheitsgrenze, und es gibt keinen Zuschnitt/Ladefehler.',
        'wholeContextCompatibilityDe': 'Der ganze aktuelle DE/EN-Text, fünf direkte Voraussetzungen, Parent und beide ganzen biotechnologischen Fälle wurden gelesen. Die Fälle verlangen aktive/inaktivierte Hefe, druckfreien Gasabgang, getrennte Aufarbeitung und Nachweisgrenzen; Gasmenge allein identifiziert weder Gas noch Ethanol und Filtration trennt keine gelösten Zucker/Ethanol-Anteile. Das Bild zeigt nur qualitative offene Vergleichsansätze: damit können die mL-Lehrdaten der Gasspritzen nicht gemessen werden, was das Bild auch nicht behauptet. Geeignete Filterwahl, exakte Bedingungen, zusätzliche Identitätsprüfung und tatsächliche Originalprotokolle bleiben im späteren Versuch. Die Zeichnung einer handelnden Person ist keine Beobachtung einer durchgeführten Lernendenhandlung und macht den570/426-Kandidaten nicht angenommen.',
        'reasonEn': 'Accept the actual image as a bounded qualitative yeast-production/control/work-up example after native and316/636 inspection. Open matched-bath controls, retained solids and mixed filtrate with question mark support the competence. This is neither gas-volume measurement nor product identification/purity proof, and no completed laboratory performance is inferred.',
    },
}
decisions = []
for row in context['wholeContexts']:
    goal = row['goal']
    verify(row['actualNativeImage'])
    decisions.append({'goalId': goal['id'], 'completedAtUTC': now, 'wholeCurrentGoal': goal,
                      'actualNativePNG': row['actualNativeImage'],
                      'wholeDirectPrerequisitesActuallyRead': [p['id'] for p in row['wholeDirectPrerequisites']],
                      'wholeDirectParentsActuallyRead': [p['id'] for p in row['wholeDirectParents']],
                      'wholeDEENCasesActuallyRead': [c['caseId'] for c in row['wholeCases']],
                      'actualGoalCardViewsPersonallySeen': [r for r in receipt['records'] if r['goalId'] == goal['id']],
                      **findings[goal['id']]})
first_path = OWN / 'science/FIRST.actual-two-preparation-child-images-V2.original.json'
write(first_path, {
    'schemaVersion': 1, 'role': 'Own independent informed actual image V2 science, not image/material author',
    'completedAtUTC': now, 'wholeActuallyReadInput': ref(input_path), 'actualBrowserReceipt': ref(receipt_path),
    'decisions': decisions, 'accepted': 2, 'revise': 0,
    'actualNativePNGsPersonallySeen': 2, 'actualOwnGoalCardViewsPersonallySeen': 4,
    'notImageOrMaterialAuthor': True, 'noAuthorObservationUsedAsApproval': True,
    'normalVRecordsAtFIRST': 0, 'newStockFingerprintsAtFIRST': 0, 'QA438WritesAtFIRST': 0,
    'noDPAMOrSourceCourseReview': True, 'notAdopted570_426': True,
    'unreviewedOtherEightChildImagesNotIncluded': True,
    'actualLearnerLabTrial': False, 'HumanApproval': False, 'M7Grant': False, 'activeWrites': 0,
})
first_seal_path = OWN / 'science/FIRST.actual-two-preparation-child-images-V2.seal.json'
write(first_seal_path, {
    'schemaVersion': 1, 'role': 'Seal original own two-image V science before any normal binding',
    'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'files': [ref(first_path)],
    'accepted': 2, 'revise': 0, 'normalVRecordsAtSeal': 0,
    'newStockFingerprintsAtSeal': 0, 'QA438WritesAtSeal': 0, 'activeWrites': 0,
})
json_files, python_files = [], []
for p in sorted(OWN.rglob('*')):
    assert not p.is_symlink(), p
    if not p.is_file():
        continue
    if p.suffix == '.json':
        read(p)
        json_files.append(str(p.relative_to(OWN)))
    elif p.suffix == '.py':
        ast.parse(p.read_text(), filename=str(p))
        python_files.append(str(p.relative_to(OWN)))
assert not list(OWN.rglob('*.jsonl'))
audit_path = OWN / 'checks/FINITE.actual-source-views-json-and-python.json'
write(audit_path, {
    'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'Finite own mechanical byte/parse inventory, no stock V or curriculum check',
    'selectedSourceReferencesExact': True, 'wholeGoalsActuallyRead': 2,
    'wholeDEENCasesActuallyRead': 4, 'wholeDistinctDirectPrerequisitesActuallyRead': 7,
    'wholeParentActuallyRead': 1, 'actualNativePNGsSeen': 2,
    'actualOwnChromiumViewsSeenAndByteVerified': 4, 'imageWidths': [316, 636],
    'HTMLImageReferencesResolveToExactOriginalRepositoryPNGs': True,
    'parsedJSONBeforeFinalMetadata': json_files, 'parsedPythonAST': python_files,
    'finalMetadataAtomicallySerializedAndParsed': True,
    'normalVRecords': 0, 'QA438Writes': 0, 'stockVChecks': 0,
    'fullCanonicalCopies': 0, 'sourceImageCopies': 0, 'ownSymlinks': 0,
    'wholeBookOrNativeRenderer': False, 'newHumanApproval': False, 'activeWrites': 0,
})
selector_path = OWN / 'SELECTION.finite-two-preparation-child-images-informed-V2-science.json'
write(selector_path, {
    'schemaVersion': 1, 'role': 'Finite two actual child-image informed independent V2 science only; unadopted candidate',
    'completedAtUTC': datetime.now(timezone.utc).isoformat(), 'goalIds': [CHEM, BIO],
    'neutralAuthorSelector': context['neutralAuthorSelector'], 'wholeAuthorSeal': context['wholeAuthorSeal'],
    'wholeCurrentTwoGoalBodies': context['wholeTwoGoalSource'], 'actualSourcePNGs': [d['actualNativePNG'] for d in decisions],
    'ownWholeActuallyReadInput': ref(input_path),
    'ownOriginalFIRST': ref(first_path), 'ownFIRSTSeal': ref(first_seal_path),
    'decisions': [{'goalId': d['goalId'], 'decision': d['decision']} for d in decisions],
    'accepted': 2, 'revise': 0, 'actualNativePNGsPersonallySeen': 2,
    'actualOwnGoalCardViewsPersonallySeen': 4, 'containerWidths': [360, 680], 'imageWidths': [316, 636],
    'browserReceipt': ref(receipt_path), 'relativeOriginalRepositoryImageURLs': True,
    'normalVRecords': 0, 'QA438Appends': 0, 'newStockFingerprints': 0, 'stockVChecks': 0,
    'notAdopted570_426': True, 'remainingEightChildImagesOutsideScope': True,
    'DPAMReviews': 0, 'sourceOrCourseApproval': False,
    'HumanApproval': False, 'HumanTrial': False, 'M7Grant': False,
    'sourceImageCopies': 0, 'fullCanonicalCopies': 0,
    'wholeBookOrNativeRenderer': False, 'centralRuns': 0, 'activeWrites': 0,
    'finiteMechanicalAudit': ref(audit_path), 'readme': ref(OWN / 'README.md'),
    'finalSealPath': str((OWN / 'FILES.finite-two-preparation-child-images-informed-V2.seal.json').relative_to(REPO)),
    'STOPAfterSeal': True,
})
seal_path = OWN / 'FILES.finite-two-preparation-child-images-informed-V2.seal.json'
files = [ref(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p != seal_path]
write(seal_path, {
    'schemaVersion': 1, 'role': 'Finite original V2-only science and actual four browser views; no normal ledger writes',
    'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'selector': ref(selector_path), 'files': files,
    'regularPayloadFiles': len(files), 'regularPayloadBytes': sum(r['bytes'] for r in files),
    'sealExcludedFromOwnInventory': True, 'finite': True, 'normalVRecords': 0, 'QA438Writes': 0, 'activeWrites': 0,
})
for r in files:
    verify(r)
assert len([p for p in OWN.rglob('*') if p.is_file()]) == len(files) + 1
print(json.dumps({'selector': ref(selector_path), 'seal': ref(seal_path), 'FIRSTSeal': ref(first_seal_path),
                  'payloadFiles': len(files), 'payloadBytes': sum(r['bytes'] for r in files),
                  'allRegularFilesIncludingSeal': len(files) + 1,
                  'accepted': 2, 'normalVRecords': 0, 'QA438Writes': 0, 'STOP': True}, indent=2))
