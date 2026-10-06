#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Finalize the actual independent pair only in the existing physical isolate."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil, subprocess
ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
BASE = OWN.parent
PREP = BASE / 'chemie-b010-five-corrected-image-current-candidate-v3'
PREP_REL = PREP.relative_to(ROOT)
ISO = ROOT / 'tmp/chemie-b010-five-corrected-native-isolated-20261005-v3'
OUTPUT = ISO / PREP_REL / 'native-finalbook'
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def write(p, value):
    p = Path(p); p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.is_symlink(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
assert not (OWN / 'native-finalbook').exists()
frozen = [(PREP / 'prepared.freeze.manifest.json', '4f3c95a2b024371f420df088576ee84b2f4e187c8bf3dd21cbadb260a7732b42', 'ownFiles'),
    (BASE / 'chemie-b010-nine-current-independent-d-a-v3/reviewer-output.freeze.manifest.json', '890f8f2a331d7b5887c2f074292f112f60234d09bd6d4dea70bb48a839011b13', 'files'),
    (BASE / 'chemie-b010-nine-current-independent-d-b-v3/review-b.freeze.manifest.json', 'd926df3ec761f8179b950e8ecb9eed646395d273b923461ea2ab49d89852f062', 'ownArtifacts')]
for path, expected, key in frozen:
    assert sha(path) == expected
    for row in read(path)[key]: assert sha(ROOT / row['path']) == row['sha256'], row['path']
copied = []
for round_, directory in [('a', 'chemie-b010-nine-current-independent-d-a-v3'), ('b', 'chemie-b010-nine-current-independent-d-b-v3')]:
    dest = OUTPUT / f'round-{round_}/results'
    assert dest.resolve() == dest and not list(dest.iterdir())
    for source in sorted((BASE / directory / 'results').iterdir()):
        assert source.name.endswith(('.records.jsonl', '.run.json'))
        shutil.copy2(source, dest / source.name)
        copied.append({'sourcePath': str(source.relative_to(ROOT)), 'isolateTarget': str((dest / source.name).relative_to(ISO)), 'sha256': sha(source)})

# These are explicit substantive synthesis judgments after reading both actual
# current rounds. Distinct examples/wording are compatible, not a vote-based
# replacement for source or image validation.
reasons = {
 'fcc73fb5': ('Beide unabhängigen aktuellen Runden erhalten die unveränderte Stoffeigenschafts-Kompetenz und prüfen den passenden neuen Rückverweis zum Halogenziel. Unterschiedliche Beispiele wie Löslichkeit und Dichte sind kompatible Evidenzvarianten. Nur die aktuelle Seitenbindung wird ersetzt; kein neuer fachlicher Abschluss und keine neue P-Autorenschaft.', 'Both independent current rounds preserve the unchanged substance-property competence and check its appropriate new reverse link to the halogen goal. Solubility and density examples are compatible evidence variations. Replace only the current page binding, without a new scientific completion or P authorship.'),
 '42a84bca': ('Beide Runden stimmen in Stoffarten-, Element-/Verbindungs- und Teilchenabgrenzung überein, einschließlich des zweiatomigen Elements als Gegenbeispiel. Die unveränderte Grundlage wird zum aktuellen Halogen-Nachfolger rückverbunden. Die Text-/P-Nachweise bleiben erhalten; nur die belegte aktuelle Seiten-/Kontextbindung wird ersetzt.', 'Both rounds agree on substance types, elements, compounds and particle-based classification, including the diatomic-element counterexample. Bind the unchanged foundation to its current halogen successor. Preserve text and P evidence and replace only the actually reviewed current page/context binding.'),
 '950c73c6': ('Die unabhängigen Runden stimmen in räumlich wiederholtem Ionengitter, Koordinationszahl sowie Kraft-/Beweglichkeits-Erklärung überein. Unterschiedliche Transferbeispiele prüfen denselben Modellzusammenhang. HE10.1 trägt die Gesamtbreite; BY C8.4 bleibt nur der ausgewiesene Teilzeuge. Das tatsächlich geprüfte sechszählige PNG bleibt exakt. Keine diskreten NaCl-Moleküle, historische Quellenneustarts oder Bildleistung als Lernerfolg.', 'The independent rounds agree on spatially repeating ionic lattices, coordination number and explanations through forces and ion mobility. Different transfer cases assess the same model relation. HE10.1 supports the full scope while BY C8.4 remains the specified partial witness. Preserve the actually reviewed six-neighbour PNG. No discrete NaCl molecules, repeated historical source reviews or inferred learner performance.'),
 '16a80de2': ('Beide unabhängigen Fortsetzungen haben die tatsächliche neue PNG-Seite in PDF/HTML geprüft: Natrium an eindeutiger oberer Oberfläche ohne Flamme; richtige Metall-/Oxidprodukte und OH⁻ als alkalische Ursache. Lithium-/Kalium-Transferbeispiele sind kompatible einfache Datenfälle und keine universelle Peroxid-/Superoxidbehauptung. Der konkrete alte Bild-HOLD ist gelöst. Unveränderte Quellen-/Operator- und Zieltexte bleiben erhalten; e0 und H₂/Halogen/HCl bleiben ausgeschlossen.', 'Both independent continuations viewed the actual new PNG page in PDF/HTML: sodium on a clear upper surface without flame, correct metal/oxide products and OH⁻ as the cause of alkalinity. Lithium/potassium transfer examples are compatible simple supplied-data cases, not universal peroxide/superoxide claims. The specific historical image HOLD is resolved. Preserve unchanged source/operator and goal texts; exclude e0 and the hydrogen/halogen/HCl HOLD.'),
 '58486300': ('Beide Runden verlangen stoffgenaue Eigenschaften und Verwendungen und unterscheiden elementare Halogene von ihren Verbindungen, insbesondere Fluorid-Zahnpasta von F₂. HE9.2 belegt diesen begrenzten Alltags-/Eigenschaftsanteil; Metallreaktion und H₂/Halogen/HCl werden nicht mitfreigegeben. Das unveränderte JPG ist unabhängig tatsächlich KEEP-geprüft; semantisch kein offener Dissens.', 'Both rounds require substance-specific properties and uses and distinguish elemental halogens from compounds, especially fluoride toothpaste from F₂. HE9.2 supports this bounded everyday/property part; metal reactions and hydrogen/halogen/HCl are not released. The unchanged JPG has an actual independent KEEP review; no unresolved semantic dissent.'),
 'b5086548': ('Beide Runden erhalten die unveränderte anionenbasierte Salzklassen-Kompetenz und prüfen ihre tatsächlichen neuen Anwendungskontexte und Rückverweise. Ladungsneutralitäts- und neue-Kationen-Beispiele sind kompatible Evidenz. Die vollständige aktuelle Seite ist lesbar; der frühere unbestätigte Clippingverdacht wurde tatsächich widerlegt. Nur Seiten-/Kontextbindung, kein neuer fachlicher Abschluss.', 'Both rounds preserve the unchanged anion-based salt-class competence and check its actual new application contexts and reverse links. Charge-neutrality and changed-cation cases are compatible evidence. The complete current page is readable; the earlier unconfirmed clipping suspicion was actually disproved. Replace only page/context binding, not scientific completion.'),
 'd726e00e': ('Beide unabhängigen Runden haben die aktuelle PNG-Seite statt des alten behaltenen JPG gesehen und die drei Kalkumwandlungen samt Carbonat-, Wasser- und CO₂-Bezug bestätigt. Das heutige PNG und der Salz-Breadcrumb sind tatsächlich geprüft. Die Zielsemantik bleibt unverändert; die 11bea-Voraussetzungsfrage bleibt getrennt offen. Nur gezielte aktuelle Bild-/Seitenbindung.', 'Both independent rounds viewed the current PNG page rather than the retained historical JPG and confirmed the three lime transformations and carbonate, water and CO₂ relations. The current PNG and salt breadcrumb were actually checked. Goal semantics remain unchanged and the 11bea prerequisite issue stays separately open. Only a targeted current image/page binding.'),
 '414489cb': ('Beide Runden bestätigen die einheitliche vereinfachte Rauchgas-/Gips-Erklärung mit notwendiger Oxidation von Schwefel(IV) zu Sulfat und korrektem Dihydrat. Unterschiedliche Sauerstoff-/Stoffstrom-Transferfälle sind kompatibel. HE10.3 trägt diesen abgegrenzten Anwendungsfall, keine vollständige Anlagenplanung. Das vorhandene JPG bleibt nach tatsächlicher unabhängiger KEEP-Prüfung erhalten.', 'Both rounds confirm one coherent simplified flue-gas/gypsum explanation requiring oxidation from sulfur(IV) to sulfate and the correct dihydrate. Oxygen and material-flow transfer cases are compatible. HE10.3 supports this bounded application, not full plant engineering. Preserve the existing JPG after actual independent KEEP review.'),
 '1f5ee84f': ('Beide Runden prüfen die integrierte Salzionen-/Daten-/Transport-Kompetenz und haben die konkrete neue PDF-/HTML-/PNG-Seite mit richtiger Phosphat-Bodenbindung und Abschwemmung sowie getrenntem NH₄⁺→NO₃⁻ gesehen. Der alte Phosphat→Nitrat-Pfeilfehler ist fachlich behoben; zusätzliche entfernte Pflanzenaufnahme-Pfeile sind offen dokumentiert und im Alt nicht behauptet. PO₄³⁻ bleibt schematische Kategorie, keine dominante freie Bodenspezies. Bedarf, Dosis und vorgegebene Bedingungen begrenzen das Urteil; kein Agronomie- oder Feldversuchsabschluss.', 'Both rounds assess the integrated salt-ion, supplied-data and transport competence and viewed the actual new PDF/HTML/PNG page with correct phosphate soil binding/runoff and distinct NH₄⁺→NO₃⁻. The historical phosphate-to-nitrate arrow error is substantively resolved; removed plant-uptake arrows are disclosed and not claimed by the alt. PO₄³⁻ remains a schematic category, not the dominant free soil species. Demand, dose and supplied conditions bound the judgment; no agronomy or field-trial completion.')
}
ids = read(PREP / 'batch.config.json')['goalIds']
new_science = set(read(PREP / 'positive-evidence.config.json')['scope']['goalIds'])
authoring = {'schemaVersion': 1, 'manifestId': 'chemie-b010-nine-current-reviewed-synthesis-20261005-v4',
    'synthesizedBy': 'Codex B010 reviewed integration synthesis after actual independent A/B record comparison',
    'decisions': [{'goalId': gid, 'resolutionDecision': 'current_after_revision' if gid in new_science else 'keep_current',
                   'evidenceRound': 'first' if gid in new_science else 'second', 'rationaleDe': reasons[gid[:8]][0], 'rationaleEn': reasons[gid[:8]][1]} for gid in ids]}
write(OUTPUT / 'synthesis-authoring.json', authoring)
write(OWN / 'both-current-rounds-read-and-substantively-compared.actual.receipt.json', {'reviewedAtUTC': datetime.now(timezone.utc).isoformat(),
    'actualSourcePairFiles': copied, 'specificBilingualSynthesisAuthoring': authoring, 'bothCurrentRoundsRead': True,
    'sameCurrentGoalPageContextBindingsRequired': True, 'unresolvedSemanticDissent': [], 'humanApproval': False, 'activeWrites': 0})
terminal = []
def run(name, args):
    start = datetime.now(timezone.utc).isoformat(); r = subprocess.run(args, cwd=ISO, text=True, capture_output=True)
    (OWN / f'{name}.stdout.txt').write_text(r.stdout); (OWN / f'{name}.stderr.txt').write_text(r.stderr)
    terminal.append({'name': name, 'args': args, 'cwd': str(ISO), 'startedAtUTC': start, 'completedAtUTC': datetime.now(timezone.utc).isoformat(), 'actualExitCode': r.returncode,
        'stdoutPath': str(REL / f'{name}.stdout.txt'), 'stdoutSHA256': sha(OWN / f'{name}.stdout.txt'), 'stderrPath': str(REL / f'{name}.stderr.txt'), 'stderrSHA256': sha(OWN / f'{name}.stderr.txt')})
    write(OWN / 'native-nine-synthesis-finalization.terminal.receipt.json', {'commands': terminal, 'humanApproval': False, 'activeWrites': 0})
    print(json.dumps({'command': name, 'actualExitCode': r.returncode, 'stdout': r.stdout[:600], 'stderr': r.stderr[:600]}), flush=True)
    assert r.returncode == 0, r.stderr
cfg = str(PREP_REL / 'batch.config.json'); out = str(PREP_REL / 'native-finalbook')
run('dual-summarize', ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'summarize', '--config', cfg, '--write'])
run('synthesis-manifest-generate', ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts', '--config', cfg, '--authoring', out + '/synthesis-authoring.json', '--write'])
run('nine-resolutions-materialize', ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutResolutions.ts', '--config', cfg, '--synthesis-manifest', out + '/synthesis-decisions.json', '--write'])
run('nine-final-index-materialize', ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'finalize', '--config', cfg, '--write'])
run('nine-final-index-check', ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'finalize', '--config', cfg])
shutil.copytree(OUTPUT, OWN / 'native-finalbook')
index = read(OWN / 'native-finalbook/resolution-index.json')
assert len(index['resolutions']) == 9 and all(r['strictDescriptionComplete'] for r in index['resolutions'])
for path, expected, key in frozen:
    assert sha(path) == expected
    for row in read(path)[key]: assert sha(ROOT / row['path']) == row['sha256'], row['path']
write(OWN / 'finalized-native-tree-byte-exact-export.actual.receipt.json', {'status': 'PASS_actual_native_nine_finalizations_in_physical_v3_only',
    'sourcePhysicalDirectory': str(OUTPUT), 'newExportDirectory': str((OWN / 'native-finalbook').relative_to(ROOT)),
    'finalIndexSHA256': sha(OWN / 'native-finalbook/resolution-index.json'), 'resolvedGoalCount': 9,
    'everyExportedNativeFileByteExact': all(sha(p) == sha(OUTPUT / p.relative_to(OWN / 'native-finalbook')) for p in (OWN / 'native-finalbook').rglob('*') if p.is_file()),
    'historicalPreparationAndIndependentReviewFreezeBytesUnchanged': True,
    'rootV3ResultsDirectoriesRemainEmpty': not list((PREP / 'native-finalbook/round-a/results').iterdir()) and not list((PREP / 'native-finalbook/round-b/results').iterdir()),
    'newScientificClosuresProspective': 5, 'existingBindingRepairsProspective': 4, 'activeStrictNetIncrease': 0,
    'humanApproval': False, 'activeWrites': 0})
