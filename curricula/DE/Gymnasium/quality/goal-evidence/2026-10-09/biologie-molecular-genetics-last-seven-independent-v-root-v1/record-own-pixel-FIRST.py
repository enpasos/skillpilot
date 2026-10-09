#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Record the root's seven actual pixel inspections before peer outcomes."""
import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent

def binding(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, data):
    path = OUT / name
    if path.exists():
        raise FileExistsError(path)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return binding(path)

input_path = OUT / 'seven-actual-rasters-current-whole-goals.neutral-root-input.json'
packet = json.loads(input_path.read_text())
observations = {
    17: {
        'fachlich': 'Die kleine Schale zeigt tatsächlich6 gelbe/2 grüne Samen. Die große Schale enthält4 Reihen mit je7 gelben/3 grünen Samen:28/12 von40, also70/30. Die Erwartung75/25 stimmt mit dem monohybriden Dominanzmodell und6/2 überein. Keine falschen Balkenhöhen; die Abweichung ist sichtbar, kein Widerlegungsbeweis.',
        'phone': 'Bei360 sind Erwartung/Stichprobe und die vier Prozentwerte lesbar; Schalen, Zufallsblase und Stichprobenvergleich bleiben sichtbar. Bei680 auch28:12 und beide Stichprobengrößen gut lesbar.',
        'perspective': 'Die Person schreibt in ein Heft mit abstrakten Notizen; keine fachliche Pflichtinformation im Heft. Samenschalen und Poster sind stimmig.',
        'bounds': 'Konstruierte Stichprobe; kein tatsächliches Experiment oder Signifikanztest belegt.',
    },
    18: {
        'fachlich': 'Aa×Aa liefert im sichtbaren2×2-Schema AA,Aa,Aa,aa. Beide AaBb-Eltern liefern AB,Ab,aB,ab. Die dargestellten vier gelb/rund,gelb/runzlig,grün/rund,grün/runzlig-Kategorien passen9:3:3:1 unter unabhängiger Verteilung und vollständiger Dominanz.',
        'phone': 'Bei360 bleiben Kreuzungsgenotypen,2×2-Felder, vier Gametentypen und9:3:3:1 erkennbar. Die kleinen ausgeschriebenen Phänotypnamen dienen als Ergänzung; Farben und glatte/runzlige Formen vermitteln sie auch bildlich. Bei680 alle Kernlabels lesbar.',
        'perspective': 'Schematische Pflanzen und Kreuzungstafel, keine benutzte Mess- oder Heftdarstellung.',
        'bounds': 'Das Unabhängig-Label begrenzt den dihybriden Fall; das Bild beweist keine universellen Mendelverhältnisse.',
    },
    19: {
        'fachlich': 'Umwelt zeigt auf Regulationsmarken; dieselbe dargestellte DNA-Sequenz bleibt unverändert, während Transkripte/Protein im Modell verringert sind. Der Transfer zur nächsten Generation ist ausdrücklich gestrichelt und mit Fragezeichen versehen. Keine sichere generelle Vererbung von Lebensstiländerungen behauptet.',
        'phone': 'Bei360 bleiben Umweltmotive, Elterntier/Nachkomme, beide DNA/Marken-Kreise, Regulationssymbole und das zentrale Fragezeichen erkennbar; feine Begleittexte sind keine alleinige Pflichtinformation. Bei680 sind die erklärenden Labels lesbar.',
        'perspective': 'Keine Heft- oder Instrumentendarstellung; DNA-Lupen sind schematische Vergrößerungen.',
        'bounds': 'Gleiche DNA bezeichnet hier das dargestellte Sequenzmotiv, nicht genetisch identische ganze Eltern-/Kindgenome. Fragezeichen verlangt Mechanismus- und Kontextprüfung.',
    },
    20: {
        'fachlich': 'Links steht die frühere Mischungs-Vorhersage, Mitte uniforme violette F1 und wiederauftauchende weiße F2 bei3 violetten/1 weißen Pflanzen. Rechts bleiben zwei diskrete homologe Beiträge nach Trennung und Befruchtung erhalten. Das Bild stellt Vorhersage→Befund→Erklärung dar, nicht Allelmischung als geltende Theorie.',
        'phone': 'Bei360 sind die drei großen Überschriften, Kreuzung, Blütenfarben/F1-F2-Bilder und Trennungs-/Vereinigungspfeile erkennbar. Kleinere Erläuterungen ergänzen diese visuelle Folge; bei680 sind sie lesbar.',
        'perspective': 'Notizheft mit abstrakten Strichen, keine lesepflichtige Fachnotation. Person, Stift und Schreibtisch sind plausibel.',
        'bounds': 'Schematische historische Modelländerung; keine falsche Zuschreibung einer einzelnen historischen Entdeckung aus dem Bild.',
    },
    21: {
        'fachlich': 'GenA-Pfeil endet anE1; der durchgehende GenB-Pfeil endet anE2 und nicht anS oderI. E1 zeigt aufS→I, E2 aufI→P, P istblau und führt zum sichtbaren Blütenmerkmal. Ergänzende Proteinrollen sind stabile Fasern und Stofftransport durch einen Membrankanal.',
        'phone': 'Bei360 sind Gene→Proteine→Merkmal, E1/E2, beide Enzympfeile undS/I/P samt farblosem/blauem Unterschied sichtbar. Bei680 sind sämtliche Kernlabels klar.',
        'perspective': 'Abstrakte fachliche Schemata ohne handelnde Person oder ablesepflichtiges Instrument.',
        'bounds': 'Ein vereinfachter Biosyntheseweg; Genabschnitte und Proteine sind nicht maßstabsgetreu. Keine unmittelbare chemische Umwandlung vonDNA inPigment gezeigt.',
    },
    22: {
        'fachlich': 'Natürliche Replikation zeigt Helicase, zwei Polymerasen, zwei Primerpositionen und entgegengesetzte Synthesepfeile an antiparallelen Vorlagen. PCR zeigt zwei gegeneinander gerichtete Primer auf gegenüberliegenden Strängen, thermische Schritte und mehrere Abschnittskopien. Kein falsches Paar gleichgerichteter Primer.',
        'phone': 'Bei360 sind die zwei großen Prozessüberschriften, Replikationsgabel/Enzyme und Thermocycler plus Kopien sichtbar; Polymerase/Primer-Pfeile bleiben verfolgbar. Die drei kleinen Zykluswörter sind bei680 lesbar und bei360 durch das Gerät/Zyklussymbol ergänzt.',
        'perspective': 'Thermocycleranzeige ist zum äußeren Bedienraum orientiert; keine dagegen arbeitende Person. Keine falsch ausgerichtete Heft- oder Messdarstellung.',
        'bounds': 'Eine Prozessübersicht, keine exakte Zykluszählung oder vollständige Okazaki-/Temperaturdarstellung; die aktuellen Fälle liefern diese Details.',
    },
    23: {
        'fachlich': 'Unvollständige Karyogramm-Modelle ausdrücklich markiert: normal2/2/2, einzelne Trisomie2/2/3, dreifacher Gesamtsatz3/3/3. WeitereBefunde und ein zentrales Fragezeichen trennen Genotypänderung, Phänotypänderung und Krankheit; es gibt keine festen Zuordnungspfeile normal→Genotyp/Trisomie→Phänotyp/Polyploidie→Krankheit.',
        'phone': 'Bei360 sind drei farbig getrennte Chromosomentypen, jeweilige2x/3x-Zahlen, die drei Befundgruppen und Fragezeichen erkennbar. Bei680 sind alle wesentlichen Labels lesbar; die lang ausgeschriebenen Kategorien bei360 werden durch unterschiedliche Symbole unterstützt.',
        'perspective': 'Person schaut auf die Darstellung; Heft enthält abstrakte Notizen ohne lesepflichtige Informationen. Keine krankheitsdiagnostische Messung abgebildet.',
        'bounds': 'Kein komplettes menschliches Karyogramm und keine Diagnose allein aus dem Chromosomenmodell; Polyploidie als Satzvervielfachung dargestellt.',
    },
}
results = []
for item in packet['entries']:
    ordinal = item['ordinal']
    results.append({
        'ordinal': ordinal, 'goalId': item['goalId'], 'wholeCurrentGoal': item['wholeCurrentGoal'],
        'actualAssetBinding': item['assetBinding'], 'actualViewedPreviewBindings': item['rootActualPreviewBindings'],
        'actualOriginalSeen': True, 'actualWidth360Seen': True, 'actualWidth680Seen': True,
        'dimensions': item['dimensions'], 'formatDecision': 'KEEP native PNG1672×941, approximately16:9',
        'pixelDecision': 'KEEP', 'observations': observations[ordinal],
        'style': 'Freundliche, abstrakte und klar gegliederte Comicdarstellung; passend zur vorhandenen Bildlandschaft.',
        'metadataAndPromptCheck': 'pending separate actual reading after this pixel-FIRST',
        'machineOnly': True, 'humanApproval': False,
    })
verdict = write('seven-actual-rasters.pixel-FIRST.independent-root.verdict.json', {
    'schemaVersion': 1, 'role': 'Independent root actual pixel review FIRST, not author inspection',
    'createdAt': datetime.now(timezone.utc).isoformat(), 'inputBinding': binding(input_path),
    'ownInputFIRST': binding(OUT / 'seven-actual-rasters.own-input-FIRST.freeze.json'),
    'independence': {
        'rootIsImageAuthor': False, 'freshPeerVerdictsReadBeforeOwnPixelFIRST': False,
        'priorExposure': 'Author17 caption/alt/provenance was read before input FIRST while locating final paths; no original/edit/reconstruction prompt bodies or fresh independent last-seven verdicts were read. Author selection versions and earlier defect summaries are known.',
    },
    'actualOriginalInspections': 7, 'actualWidth360Inspections': 7, 'actualWidth680Inspections': 7,
    'results': results, 'pixelKEEP': 7, 'pixelHOLD': 0,
    'currentNativePageOrBoundVApproval': False, 'strictGain': 0, 'activeWrites': 0,
    'humanApproval': False, 'humanTrial': False,
})
seal = write('seven-actual-rasters.pixel-FIRST.independent-root.freeze.json', {
    'schemaVersion': 1, 'role': 'Independent root actual pixel-FIRST immutable output',
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'inputs': [binding(input_path), binding(OUT / 'seven-actual-rasters.own-input-FIRST.freeze.json')],
    'outputs': [verdict], 'freshPeerVerdictsRead': False,
})
print(json.dumps({'verdict': verdict, 'first': seal, 'KEEP': 7, 'HOLD': 0}, ensure_ascii=False))
