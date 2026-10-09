#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Seal actual generated originals and observed display captures, candidate only."""
import hashlib
import json
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors
def read(p): return json.loads(p.read_text())
def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    if p.suffix == '.json': assert read(p) == value
    return bind(p)
prepared = read(OUT / 'two-child-raster-author.pre-generation.entry.json')
first = read(ROOT / prepared['inputFirst']['path'])
children = first['proposedWholeGoalObjects']
captures = read(OUT / 'two-actual-v1-360680-browser-capture.receipt.json')
raw_names = ['exec-8abca209-7d2c-481e-be2d-71e277b8dc13.png', 'exec-953427a9-9859-4fa2-a43d-c51d0bf684c2.png']
raw_dir = Path('/home/enpasos/.codex/generated_images/01a0f2c0-2182-78f3-8b44-9fcdfd2c8634')
descriptions = [
    'Schematische Fossilbelege werden zeitlich angeordnet. Eine getrennte, punktierte Verwandtschaftshypothese bleibt unsicher; zeitliche Abfolge allein belegt keine direkte Abstammung.',
    'Menschen lernen, verändern und geben eine Gartenpraxis weiter. Mulchen, gesammeltes Regenwasser und ein geringer Wasserstand zeigen Nutzen und Grenzen; Lernen und biologische Vererbung sind getrennte Darstellungen.',
]
alts = [
    'Drei farbig markierte Karten A, B und C zeigen schematische Kiefer-, Becken- und Schädelfunde. Darunter steht ein Zeitpfeil von älter zu jünger. Abfolge ungleich Abstammung ist groß hervorgehoben. Ein abgesetzter punktierter Baum verbindet die farbigen Karten unter Fragezeichen als Hypothese. Es sind keine bestimmten Arten oder gemessenen Altersdaten angegeben.',
    'Links zeigt ein Erwachsener einem Jugendlichen Mulchen im Gemüsebeet. Rechts gießt der Jugendliche und gibt Wissen an eine Gleichaltrige weiter; Regentonne, gesundes Gemüse und ein kleines Trockenheitsbild mit niedrigem Wasserstand zeigen Folgen und Grenzen. Ein großer Pfeil Lernen verbindet die sozialen Szenen. Eine separate schematische DNA unten ist mit Vererbung beschriftet und sendet keinen Pfeil zu den gelernten Praktiken.',
]
reconstructions = [
    'Erzeuge eine freundliche Comic-Illustration im Querformat etwa 16:9 mit warmem Cremegrund, hellblauen Akzenten und kräftigen dunkelblauen Konturen. Oben stehen drei große Belegkarten: rote Karte A mit Kieferfragment, grüne Karte B mit Beckenfragment, blaue Karte C mit Schädel. Jede trägt einen farbigen Streifen, keine Zahlen oder benannten Fossilarten. Ein großer Zeitpfeil von rot über grün zu blau verläuft darunter von älter nach jünger. Unten steht sehr groß Abfolge ≠ Abstammung; links denkt eine jugendliche Figur nach. Rechts ist ein abgesetzter kleiner Baum aus punktierten Linien mit Fragezeichen, Hypothese und den drei farbigen Buchstabenkreisen. Keine solide A-B-C-Abstammungskette, keine Affe-Mensch-Parade. Schematische Belege und zeitliche Reihenfolge sind keine Messdaten oder belegte unmittelbare Vorfahrenfolge. Hauptschrift und Motive bei 360 Pixel Breite erkennbar halten.',
    'Erzeuge eine freundliche Comic-Illustration im Querformat etwa 16:9 mit dunkelblauen runden Konturen und warmem Creme-/Hellblaugrund. Zwei große gegenwärtige Gartenszenen: links demonstriert ein erwachsener Mann Mulchen einem Jugendlichen, rechts gießt der Jugendliche ein gesundes Gemüsebeet und erklärt es einer gleichaltrigen Person. Über jeder Szene steht eine Blatt-/Wassertropfen-Sprechblase. Ein großer gelber Pfeil mit Lernen verbindet die Szenen. Rechts stehen eine Regentonne und ein Schild Weitergeben / Verändern; ein kleines rundes Trockenheitsbild zeigt Sonne, trockene Pflanzen und einen niedrigen Wasserstand. Unten ist eine getrennte schematische Doppelhelix mit Vererbung. Keine Pfeile vom DNA-Zeichen zum erlernten Wissen, keine offenen Bücher oder lesepflichtige Kleinschrift. Gelerntes, verändertes Wissen, konkrete Folgen und begrenztes Wasser groß und freundlich zeigen; keinerlei tatsächlich gemessene Daten oder genetische Änderung durch Lernen behaupten.',
]
observations = [
    'Original, actual360 and actual680 individually viewed by root. Three separate fragments, correct large Abfolge≠Abstammung, chronology arrow and independently separated dotted uncertain tree remain legible. No named real species, quantitative dates or linear biological superiority claim is present. Generic schematic morphology is not a specimen measurement. Proposed goal source/native review remains separate.',
    'Original, actual360 and actual680 individually viewed by root. Social demonstration and transmission, adaptation, healthy vegetables, collected rainwater and bounded dry-day inset are visible. Main Lernen/Vererbung labels remain recognisable; smaller Weitergeben/Verändern duplicates the visually shown scene and is not required to read the image. DNA is a separate schematic motif, not the cause of learned change. There is no book or actor-facing written diagram. Native/source and genuine independent pixel judgments remain pending.',
]
images, pixel_only = [], []
for child, capture, raw_name, description, alt, reconstruction, observation in zip(children, captures['images'], raw_names, descriptions, alts, reconstructions, observations):
    gid = child['id']
    assert gid == capture['goalId']
    asset_path = ROOT / capture['original']['path']
    actual = bind(asset_path)
    assert actual == capture['original']
    assert asset_path.read_bytes() == (raw_dir / raw_name).read_bytes()
    dimensions = {'width': int.from_bytes(asset_path.read_bytes()[16:20], 'big'), 'height': int.from_bytes(asset_path.read_bytes()[20:24], 'big')}
    assert dimensions == {'width': 1672, 'height': 941}
    assert [v['renderedWidth'] for v in capture['screenshots']] == [360, 680]
    assert all(v['documentWidth'] == v['renderedWidth'] for v in capture['screenshots'])
    reconstruction_binding = write(gid + '/image-reconstruction-prompt.selected-v1.actual-seen.de.md', reconstruction + '\n')
    provenance = write(gid + '/generation-v1.actual-tool-provenance.json', {
        'schemaVersion': 1, 'provider': 'built-in ChatGPT/Codex image_gen', 'model': None,
        'actualSubmittedPrompt': bind(OUT / gid / 'actual-generator-prompt.en.md'),
        'actualOriginalPNG': actual, 'rawGeneratedOriginalPathDiagnosticOnly': str(raw_dir / raw_name),
        'rawAndCommittableOriginalByteExact': True, 'rasterEditing': False,
        'technicalIdsNotInProviderPrompt': True, 'license': 'CC-BY-4.0',
        'generationIsNotApproval': True, 'activeImport': False})
    link = {'type': 'goal-visualization', 'resourceType': 'image', 'role': 'primary', 'skillpilotId': gid,
            'title': 'Visualisierung: ' + child['title'], 'url': '/assets/goal-visualizations/biologie/' + gid + '/' + gid + '.png',
            'provider': 'built-in ChatGPT/Codex image_gen', 'description': description, 'altText': alt,
            'lang': 'de', 'license': 'CC-BY-4.0', 'reviewStatus': 'pilot'}
    images.append({'goalId': gid, 'wholeProposedGoal': child, 'asset': actual, 'dimensions': dimensions,
                   'format': 'png', 'provider': 'built-in ChatGPT/Codex image_gen', 'model': None,
                   'actualToolProvenance': provenance, 'actualProviderPrompt': bind(OUT / gid / 'actual-generator-prompt.en.md'),
                   'reconstructionPrompt': {**reconstruction_binding, 'derivedFromActualSeenImage': True, 'generationExecuted': False},
                   'descriptionDe': description, 'altTextDe': alt, 'resourceLinkCandidate': link,
                   'actualNativeAndPhoneDesktopRasterViews': capture, 'formatDecision': 'Near16:9 native1672x941 PNG; actual360/680 display inspected without crop or overflow',
                   'authorActualObservation': observation, 'independentVisualStatus': 'PENDING',
                   'wholeScienceAMSourceNativeApproval': False, 'humanApproval': False, 'activeImport': False})
    pixel_only.append({'goalId': gid, 'asset': actual, 'actualViews': capture, 'authorOrPeerVerdictsIncluded': False})
assert not curriculum_symlink_errors(ROOT)
pixel = write('two-actual-child-rasters.pixel-FIRST-neutral-input.json', {
    'schemaVersion': 1, 'role': 'Actual original360680 only; inspect before author metadata or QC', 'images': pixel_only})
entry = write('neutral-two-actual-proposed-child-rasters.independent-V-review.entry.json', {
    'schemaVersion': 1, 'role': 'Inactive actual generated PNGs for two proposed child goals',
    'preGenerationInput': bind(OUT / 'two-child-raster-author.input.first.freeze.json'),
    'ordinaryPrepareBeforeGeneration': prepared['actualPrepareTerminals'],
    'pixelFIRSTNeutralInput': pixel, 'images': images, 'activeImport': False,
    'independentApproval': False, 'sourceCourseAndNativeApproval': False,
    'humanApproval': False, 'humanTrial': False, 'strictGain': 0, 'activeWrites': []})
seal = write('two-generated-child-rasters.author.final.freeze.json', {
    'schemaVersion': 1, 'entry': entry, 'outputs': [bind(p) for p in sorted(OUT.rglob('*')) if p.is_file()],
    'newIndependentReviews': 0, 'strictGain': 0})
print(json.dumps({'entry': entry, 'seal': seal, 'actualPNGs': 2, 'independentApproval': False, 'strictGain': 0}))
