# Chemie: unabhängige maschinelle V-Prüfung A der sieben Korrekturbilder

Status: **3 KEEP, 4 REVISE**, ausschließlich für die hier gebundenen ausgewählten PNG-Hashes. Die aktiven Original-JPGs, Kanondateien und QA-Ledger wurden nicht verändert. Es gibt keine Integration, neue Quellen-/P-Freigabe, menschliche Freigabe oder strenge Zielschließung.

## Tatsächliche Eingangs- und Sichtprüfung

Der Authorfreeze `seven-proven-raster-corrections.author-v1.final.freeze.json` hat SHA256 `22bdccf0580f09524039f67aa95a635c74c8bd22efee5b12d76d3f9e92965284`; alle 70 darin enthaltenen eigenen Dateien wurden vor und nach dieser Prüfung bytegenau verifiziert. Der Rohinput hat SHA256 `f9d3ad3bb1c1a90384002df0fbd7c265fea8de16769693e3791826c8cde552e4`. Alle sieben ganzen DE/EN-Zielobjekte stimmen mit dem tatsächlich aktuellen Chemiekanon überein. Original, Frontend- und Backend-JPGs sowie die ausgewählten PNGs sind exakt an ihre tatsächlichen Bytes gebunden.

Alle sieben Original-JPGs und sieben ausgewählten PNGs wurden tatsächlich über `tools.view_image` angesehen. Drei Originale wurden zusätzlich in voller Rasterauflösung angesehen. Der voreingestellte Betrachter verkleinerte die Originale von 2752×1536 auf 2048×1143; diese Verkleinerung ist im Receipt festgehalten.

Ein isolierter Chromium-Bildbrowser wurde tatsächlich ausgeführt: Chromium **147.0.7727.15**, DPR 1, Viewports 360/680px. Der Harness reproduziert die aktuelle GoalCard-Bilddeklaration `block h-auto max-h-[28rem] w-full object-contain` und den 1px-Figurenrahmen. Die Bilder sind dadurch tatsächlich 358/678px breit und ungefähr 200–201/379–382px hoch. Alle 14 Browser-Screenshots wurden nach ihrer Erzeugung tatsächlich über `tools.view_image` angesehen. Keine Ladefehler, horizontalen Überläufe, abgeschnittenen Bildränder oder Verhältnisverzerrungen wurden festgestellt. Die Grenze 448px wurde nicht erreicht.

Das ist eine **isolierte Bildbrowser-QA**, keine vollständige SkillPilot-App-, native Lernzielbuchseiten- oder Provider-Host-Prüfung. Der aktuelle GoalCard-Ausschnitt bietet an diesem Bild selbst keinen Vergrößerungs-Handler; die mobile Entscheidung setzt deshalb kein verborgenes Zoomangebot voraus. Peer-B-Dateien wurden nicht gelesen. Autorverdicts sind keine Belege für die eigenen Entscheidungen.

## Entscheidungen und konkrete Grenzen

| Ganzes aktuelles Ziel | ID | Entscheidung | Konkreter Befund |
|---|---|---|---|
| Ionenbildung mit der Edelgasregel deuten | a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca | KEEP | Na 2/8/1 → Na+ 2/8 und Cl 2/8/7 → Cl− 2/8/8; ein Elektron, richtige Vorzeichen. Große Kernzahlen auch bei 360px lesbar. |
| Salzformeln aus Ionenladungen ableiten | 965ca297-5dbf-5e58-b5f0-6559a4433646 | REVISE | Tatsächlich 1:1, 1:2 und 2:3, alle drei Summen neutral. Bei 360px sind die notwendigen 3+/2−-Hochstellungen und Neutralitätssummen zu klein für sicheres Lesen. Ladungen und Hauptfall größer darstellen. |
| Salzbildung energetisch mit Gitterenergie erklären | c441d9e8-d9d9-5e55-a189-a37345541321 | KEEP | Gasniveau > Ausgangsniveau > Kristallniveau; ΔH<0, richtige Ionenbelegungen. Energiezufuhr/-freisetzung und Bilanz sind mobil klar. Kleine Belegungszahlen sind Zusatzdetails, kein vollständiger mobiler Energiestufenunterricht. |
| Bindungs- und Molekülpolarität ableiten | 747c5777-07d7-51a9-9be3-7d0d6f51d4e2 | REVISE | HCl δ+/δ− und CO2-Dipolaufhebung richtig. Die ausdrücklich zum Ziel gehörende kleine ladungscodierte Oberfläche mit δ-Zeichen und Bedeutung ist bei 360px nicht zuverlässig deutbar. Dieses Feld deutlich vergrößern. |
| Valenzstrichformeln und Mesomerie aufstellen | 23533087-89ea-5f29-8ec1-9f2e01197bb6 | KEEP | NO2−: je 3 Bindungspaare und 6 freie Paare = 18e, alle Oktette und Gesamtladung −1 stimmen. Zwei große Grenzstrukturen und Paarpunkte auch mobil unterscheidbar. |
| Unterenergiestufen aus Spektren und Ionisierungsenergien ableiten | 49235cbe-6658-5e7e-8bd4-398416bcebdc | REVISE | Neue O-Höhe richtig: C1086 < O1314 < N1402. Bei 360px fehlen zuverlässig lesbare Daten-/Element-/Einheitenzuordnung und n/l-Legende. Plot und Quantenzahllegende größer anordnen. |
| Partikelgröße und Oberflächen-Volumen-Verhältnis deuten | 5e2eb826-6e60-5273-91d6-c23f6dfa33b1 | REVISE | Acht kleine Würfel richtig; Rechnung 8(a/2)^3=a^3 richtig. Aber markierte Kanten erscheinen ungefähr 190–195:70–75px statt 2:1. Gleiche Perspektive und tatsächlich halbe gezeichnete Kantenlänge herstellen. |

Die Maßpfeil-Längen sind eine eigene visuelle Schätzung im tatsächlich angesehenen nativen Raster, keine automatisierte Kantenmessung. Der Widerspruch bleibt bei 360 und 680px sichtbar. Nach AGENTS.md rettet korrekter Text eine irreführende Zeichnung nicht; der ausdrücklich offene a:a/2-Grenzfall erhält deshalb kein KEEP.

Der korrigierte Ionisierungsenergie-Plot wurde zusätzlich gegen acht tatsächlich abgerufene und gelesene NIST-Neutralatomseiten geprüft. Die Umrechnung von eV pro Atom in kJ/mol ist eigene Rechnung; die acht gerundeten Bildwerte stimmen. Insbesondere bestätigt sie N > O sowie Be > B. [NIST Stickstoff](https://physics.nist.gov/PhysRefData/Handbook/Tables/nitrogentable1.htm), [NIST Sauerstoff](https://physics.nist.gov/PhysRefData/Handbook/Tables/oxygentable1.htm), [NIST Beryllium](https://physics.nist.gov/PhysRefData/Handbook/Tables/berylliumtable1.htm), [NIST Bor](https://physics.nist.gov/PhysRefData/Handbook/Tables/borontable1.htm). Die lokalen HTML-Originale und alle acht Umrechnungen sind separat gebunden. Das ist ein unterstützender V-Fachbeleg, keine Curriculumquellenfreigabe.

## Prüfpaket

- `independent-v-a.inputs-and-sight.receipt.json`: ganze aktuelle DE/EN-Ziele, alle Ein-/Ausgangsbytes, Authorfreeze, Originalkopien und tatsächlich aktuelle geschützte Mengen.
- `independent-v-a.decisions.actual.json`: sieben per-Hash-Entscheidungen, eigene wissenschaftliche Zählungen, Darstellungsform und echte mobile/680px-Befunde.
- `independent-v-a.concrete-correction-requests.json`: vier exakt begrenzte Korrekturverlangen.
- `isolated-image-browser.actual.receipt.json` und `browser-screenshots/`: tatsächliche Browserdaten und 14 tatsächlich gesichtete Screenshots.
- `independent-v-a.nist-first-ionization-energy.actual-reference.json` und `nist-primary-reference-html/`: unterstützende fachliche Referenz für den Diagrammvergleich.
- `independent-v-a.final-input-guard.actual.json`: abschließende unveränderte Eingangsprüfung.
- `independent-v-a.final.freeze.json`: abschließende Bindung aller eigenen Dateien außer sich selbst.

Die aktuelle zentrale Berichtsmengenbindung schützt Chemie127, Biologie74, Mathematik807 und Physik478. Alle sieben Bilder liegen außerhalb Chemie127. Dieser Bericht startet keinen zentralen Lauf und behauptet keinen neuen M7- oder HumanTrial-Abschluss. Eigene Skripte sind Apache-2.0; eigener Reviewinhalt ist CC-BY-4.0. Die NIST-Originale behalten ihren ursprünglichen Status.
