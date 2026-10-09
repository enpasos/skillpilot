#!/usr/bin/env python3
"""Prepare six actually missing images through the ordinary helper; no import."""
# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = OUT.parent / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
LANDSCAPE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
PROVIDER = 'built-in ChatGPT/Codex image_gen'
STYLE = (
    'Erzeuge ein einzelnes didaktisches PNG, quer etwa 16:9, nahe 1600 × 900 Pixel. '
    'Freundliche, klare, abstrakte Comicillustration: dunkelblaue weiche Konturen, '
    'helle Blau-, Mint-, Apricot- und Gelbtöne, heller Hintergrund, dezente plastische Schattierung. '
    'Wenige große Hauptobjekte, auch bei 360 Pixel Bildbreite erkennbar; kein überfülltes Lehrposter. '
    'Keine Fotorealistik, keine sterile technische Neugestaltung, keine Logos oder technischen IDs. '
    'Das Bild ist eine Orientierung, keine Aufgabe, keine Musterlösung und kein Beleg eines Experiments. '
    'Notwendige Beschriftungen sind groß und kurz; keine Kleinschrift. '
)
SCENES = {
    1: ('Tier- und Pflanzenarten bestimmen. Zwei große beobachtete Naturgegenstände: '
        'links ein gelappter Eichenblattzweig mit passender Eichel, rechts ein naturgetreu '
        'abstrahierter Marienkäfer mit sechs Beinen, zwei Fühlern und zwei Flügeldecken. '
        'Eine große Lupe hebt die charakteristischen Blatt- beziehungsweise Käfermerkmale hervor. '
        'Im Hintergrund eine einfache offene Bestimmungshilfe mit zwei deutlich erkennbaren '
        'Bildalternativen je Weg und verzweigten Entscheidungspfaden, ohne lesepflichtige Wörter. '
        'Kein aus einem Bild behauptetes sicheres Artnamen-Ergebnis.',
        'Merkmale an Pflanzen und Tieren beobachten und mit einer Bestimmungshilfe vergleichen.',
        'Comicillustration eines Eichenblattzweigs mit Eichel und eines sechsbeinigen Marienkäfers; '
        'eine Lupe und eine verzweigte bebilderte Bestimmungshilfe verdeutlichen den Merkmalsvergleich.'),
    2: ('Systematikansätze vergleichen. Zwei große nebeneinanderliegende Vergleichsflächen. '
        'Links stehen Fledermaus und Vogel gemeinsam in einer Gruppe mit dem großen Label "Flügel"; '
        'Katze und Frosch stehen außerhalb dieser reinen Merkmalsgruppe. Rechts ein klarer, wurzelgerichteter '
        'Abstammungsbaum mit denselben vier Tieren und dem großen Label "Verwandtschaft": '
        'zuerst spaltet der Frosch ab, danach der Vogel, zuletzt verzweigt der gemeinsame Säugetierast '
        'zu Katze und Fledermaus. Die vier Tiere sind jeweils gleich groß und an vier aktuellen '
        'Enden, kein Tier ist Vorfahr eines anderen. Keine Treppenfolge, keine DNA-Helix als Beweis.',
        'Ähnlichkeit einzelner Merkmale und gemeinsame Abstammung können zu unterschiedlichen Gruppen führen.',
        'Links sind Vogel und Fledermaus nach Flügeln gruppiert. Rechts verzweigt ein schematischer '
        'Abstammungsbaum zu Frosch, Vogel sowie dem gemeinsamen Säugetierast von Katze und Fledermaus.'),
    12: ('Der moderne Mensch ist erdgeschichtlich eine sehr junge Art. Eine einzige lange, breite '
         'horizontale Zeitspur, große Pfeilrichtung links nach rechts. Ganz links einfache mikrobielle '
         'Lebensformen, deutlich später ein Fisch und danach ein Dinosaurier; ganz am rechten Ende '
         'ein winziger markierter jüngster Abschnitt. Eine große Lupe vergrößert ausschließlich diesen '
         'Endabschnitt und zeigt darin zwei freundliche moderne Menschen. Ein gut lesbarer großer '
         'Bildhinweis lautet "Schematische Zeitspur". Keine Datierungszahlen und kein proportional '
         'behaupteter Abstand; kein Mensch neben einem lebenden Dinosaurier. Mikroben und Fische '
         'werden nicht als ausgestorben dargestellt, die Symbole markieren frühe Auftretenszeiten.',
         'Homo sapiens tritt erst sehr spät in der langen Geschichte des Lebens auf; die Zeitspur ist schematisch.',
         'Eine schematische Zeitspur zeigt frühe mikrobielle Lebensformen, später Fische und Dinosaurier. '
         'Eine Lupe vergrößert nur den jüngsten Endabschnitt mit modernen Menschen.'),
    15: ('Fossildaten und Datierung. Ein großer geologischer Anschnitt mit drei durchgehenden, '
         'ungekippten Sedimentschichten; die untere liegt unter den später abgelagerten oberen. '
         'Ein korrekt abstrahiertes Ammonitenfossil liegt in einer tieferen Sedimentschicht, '
         'ein Muschelfossil höher. Zwischen zwei Sedimentschichten liegt eine schmale deutlich '
         'andersfarbige Vulkanascheschicht. Rechts betrachtet eine Forscherin eine Probe dieser '
         'Asche im Labor; eine große Uhrikone bezeichnet nur das Datieren der Asche. '
         'Eine Lupe verbindet das Fossil mit dem Schichtkontext. Ein einzelner großer Satz '
         '"Alter und Kontext" ist erlaubt. Keine Zahlen, keine C14-Datierung von Millionen Jahre '
         'alten Fossilien, kein Isotopmessgerät misst direkt das Alter jeder Fossilart.',
         'Schichtlage und eine datierbare Vulkanascheschicht helfen, Fossilalter und Grenzen der Aussage zu beurteilen.',
         'Drei Sedimentschichten mit zwei Fossilien und einer Vulkanascheschicht. Eine Forscherin untersucht '
         'die Ascheprobe; Lupe und Uhr verknüpfen Fossil, Schichtkontext und Datierung, ohne Zahlen zu behaupten.'),
    16: ('Genfluss durch Migration mit Fortpflanzung. Zwei getrennte große Populationen derselben '
         'Käferart, links überwiegend blaue mit wenigen orangefarbenen, rechts überwiegend '
         'orangefarbene mit wenigen blauen Käfern. Alle Käfer anatomisch gleich, Farben '
         'stehen als Modell für vererbbare Varianten, nicht für verschiedene Arten. '
         'Ein einzelner blauer Käfer wandert über eine kleine Brücke von links nach rechts; '
         'rechts daneben ein gut erkennbares Elternpaar blauer und orangefarbener Käfer und '
         'eine kleine neue Nachkommengruppe mit beiden Modellfarben. Große Beschriftung '
         'nur "Migration + Fortpflanzung". Kein automatisches Umlackieren wandernder Käfer; '
         'keine Gleichsetzung von bloßer Wanderung und bewiesenem Genfluss. Eine kleine '
         'vorhandene Farbvariation in beiden Ausgangspopulationen muss sichtbar bleiben.',
         'Migration kann durch Fortpflanzung vererbbare Varianten zwischen Populationen verbreiten.',
         'Zwei Populationen derselben schematischen Käferart mit blauen und orangefarbenen Varianten. '
         'Ein blauer Käfer wandert nach rechts; ein dortiges Elternpaar und Nachkommen veranschaulichen '
         'die notwendige Weitergabe vererbbarer Varianten.'),
    18: ('Evolutionäre Erklärungen anhand von Mechanismen und Belegen vergleichen. Zwei große '
         'gleichberechtigte Hypothesentafeln, nicht vier kleine Panels. Links als ausdrücklich '
         'historische Behauptung ein einziges Giraffenindividuum, das seinen Hals zu hohen '
         'Blättern streckt; großes Label "Erworben vererbt?" mit sichtbarem Fragezeichen. '
         'Rechts eine Ausgangspopulation von drei Giraffen mit ererbter unterschiedlicher '
         'Halslänge und ein kleiner Nachkommenverband, große Labels "Variation" und "Selektion". '
         'In der Mitte eine große Lupe und ein einzelnes schlichtes Chromosomenpaar als '
         'Symbol für die Überprüfung der Erblichkeit. Keine direkte Streckung-zu-Vererbung '
         'als bestätigter Pfeil, kein langhalsiges Tier wird aus Bedürfnis zielgerichtet erzeugt. '
         'Die Illustration darf keine Allgemeinaussage machen, dass jedes erworbene Merkmal '
         'stets erblich oder stets unmöglich erblich ist; sie fordert einen evidenzgestützten Vergleich.',
         'Historische Erklärungsideen mit erblicher Variation, Selektion und tatsächlichen Belegen vergleichen.',
         'Zwei Hypothesentafeln vergleichen die historische Frage nach Vererbung erworbener Merkmale '
         'mit Variation und Selektion in einer Giraffenpopulation. Lupe und Chromosomenpaar symbolisieren '
         'die Prüfung der Erblichkeit; keine Behauptung ist als experimentell bestätigt markiert.'),
}


def bind(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def main():
    missing_path = AUTHOR / 'eighteen-images-documented-missing-primary-links.separate-open-list.json'
    rows = json.loads(missing_path.read_text())['rows']
    canonical = json.loads((ROOT / LANDSCAPE).read_text())
    current = {g['id']: g for g in canonical['goals']}
    plans = []
    for ordinal, (scene, caption, alt) in SCENES.items():
        row = rows[ordinal - 1]; goal = row['wholeCurrentGoal']
        assert current[goal['id']] == goal
        assert row['currentPrimaryResourceLinks'] == []
        directory = OUT / goal['id']
        directory.mkdir(parents=True, exist_ok=False)
        command = ['npm', '--prefix', 'app', 'run', 'visualization:prepare', '--', goal['id'],
                   '--landscape', LANDSCAPE, '--subject', 'biologie', '--provider', PROVIDER]
        run = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
        (directory / 'ordinary-prepare.stdout.actual.txt').write_text(run.stdout)
        (directory / 'ordinary-prepare.stderr.actual.txt').write_text(run.stderr)
        assert run.returncode == 0, run.stderr
        prepared = ROOT / 'tmp/goal-visualizations' / goal['id']
        for original in ['metadata.json', 'nano-banana-prompt.de.md']:
            shutil.copyfile(prepared / original, directory / ('ordinary-prepare.' + original))
        prompt_path = directory / 'actual-generator-prompt.de.txt'
        prompt_path.write_text(STYLE + scene + '\n')
        plans.append({'ordinal': ordinal, 'goalId': goal['id'], 'wholeGoal': goal,
                      'prompt': bind(prompt_path), 'generatorPrompt': prompt_path.read_text(),
                      'captionCandidate': caption, 'altTextCandidate': alt,
                      'provider': PROVIDER, 'model': None, 'license': 'CC-BY-4.0',
                      'ordinaryPrepareCommand': command, 'ordinaryPrepareExit': 0,
                      'ordinaryPreparedMetadata': bind(directory / 'ordinary-prepare.metadata.json'),
                      'ordinaryPreparedPrompt': bind(directory / 'ordinary-prepare.nano-banana-prompt.de.md'),
                      'imageGenerated': False, 'imageApproved': False, 'activeImport': False})
    result = {'schemaVersion': 1, 'role': 'six missing raster author inputs; generation and independent V pending',
              'author': '/root', 'currentCanonical': bind(ROOT / LANDSCAPE),
              'actualMissingInputs': bind(missing_path), 'plans': plans,
              'format': 'PNG, native near16:9/~1600x900; actual original/360/680 review required',
              'styleReferencesActuallyViewed': [bind(ROOT / 'curricula/DE/Gymnasium/visualizations/biologie' / g / (g + '.png'))
                    for g in ['797a233c-56ed-58a0-b451-5ae5d4bd21bf', '22711af8-1184-584c-9707-1192799bfa22']],
              'keepExistingGoodAssets': True, 'activeWrites': False, 'strictGain': 0,
              'humanApproval': False, 'humanTrial': False}
    path = OUT / 'six-missing-rasters.actual-neutral-input-and-provider-prompts.json'
    assert not path.exists()
    path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    assert json.loads(path.read_text()) == result
    first = OUT / 'six-raster-author.actual-input.first.freeze.json'
    first.write_text(json.dumps({'schemaVersion': 1, 'inputs': [bind(path), bind(Path(__file__))],
                                'newPixelApproval': False}, indent=2) + '\n')
    assert json.loads(first.read_text())
    print(json.dumps({'plans': len(plans), 'input': bind(path), 'first': bind(first), 'activeWrites': 0}))


if __name__ == '__main__':
    main()
