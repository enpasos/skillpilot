<!-- SPDX-License-Identifier: Apache-2.0 -->
# Thüringen: unabhängige B-Prüfung der 19 partiellen Quellenkomponenten

## Ergebnis

**19 KEEP**, jeweils ausschließlich für die deklarierten direkten **partiellen**
Quellenaspekte. Kein REVISE/BLOCK in diesem engen Paket. Diese Entscheidung
gibt weder den ganzen aktuellen Zieltext noch den ursprünglichen umfassenden
Quellensammelanspruch frei. Die einzelnen fachlichen Grenzen stehen in
`nineteen-components.independent-b.review.json`.

Die tatsächliche primäre Thüringer PDF wurde zuerst gelesen. Physische Seiten
15, 16, 19, 20 und 22–24 wurden zusätzlich als eigene PDF-Raster betrachtet.
Ein frischer Download vom [offiziellen Schulportal](https://www.schulportal-thueringen.de/tip/resources/medien/63705?dateiname=Biologie_Lehrplan_AHR_2024-11-13.pdf)
ist bytegleich mit dem lokalen Original: `d77b5661a184aa01d5ce4475f9a040fbb793f2bf34b9a2fb54d7d3edf5875138`.
Alle 21 unterschiedlichen Elternauszüge und die Jahrgangsbindung stimmen mit
eigener frischer PDF-Textextraktion überein. Primärseiten und Volltexte werden
hier nicht nochmals kopiert. Neue Befunde einer parallelen A-Prüfung wurden
nicht gelesen.

## Quellenumfang

Die tatsächliche Klassenbindung ist **7/8, Sek I**. Auge oder Ohr bleiben
Alternativen. Es gibt keinen GK-/LK- oder Oberstufenanspruch. Die Tabellen auf
Seiten 15/16 enthalten benachbarte Jahrgangsspalten: Organismus und
Dünndarmfalten/-zotten werden aus der Spalte 7/8 übernommen; Ökosystem und
Laubblatt aus 9/10 werden nicht mitfreigegeben. Der Impfentscheidungsbezug ist
eine deklarierte Verbindung konkreter Impfinhalte mit der allgemeinen B2-
Entscheidungskompetenz, kein erfundenes wörtliches Impfentscheidungszitat.

Der gemeinsame `topicCode` 2.1.1.3 bezeichnet die Autorenkollektion zur
Menschenbiologie. Die zusätzlichen Basiskonzept-/B2-Zeilen behalten ihre
gesondert gebundenen tatsächlichen Ursprünge im Kapitel 2. Partielle Bezüge
zur Ernährung, Blut-/Verdauungsfunktion oder Gesundheit werden nicht als
vollständige Quellenabdeckung aller weitergehenden kanonischen Anforderungen
ausgegeben.

## Tatsächliche native Gegenprüfung

Das unveränderte Produktionsverfahren `buildGoalBookSourceAtlasInputs`
wurde unabhängig zweimal rein berechnend aufgerufen: aktueller Atlas und
derselbe Atlas mit dem isolierten Komponentenmapping. Ergebnis:

- 390 aktuelle `curricularAtomic`-Ziele und 22 Länderansichten.
- Vollständige geordnete Zielmengen aller Länderansichten exakt verglichen und unverändert.
- 19 zusätzliche **direkte** Zeugen ausschließlich für `DE-TH/SekI/`; keine Vererbung von einem breiten Cluster.
- Vollständiger aktueller Canonical-Payload und Kind-Ledger exakt unverändert; die eingefrorenen Autoren-Zielmengen reproduziert.
- 24 TH-Grenzfälle und 144 andere historische Paare bleiben offen. Der ursprüngliche TH-Sammelanspruch bleibt `needs_canonical_goal`.

Diese Addition zur **aktuellen** 390er-Atlasbasis beweist nicht die noch offene
gesamte Neuro21-HOLD-Overlay-Wiederherstellung oder deren Zielbuchplatzierungen.
Der Compiler kann Kandidaten für eine isolierte Berechnung verarbeiten; seine
Zeugen sind keine automatische fachliche Freigabe der Kandidatenstatusfelder.

## Eingänge und Abschluss

Ausgangsfreeze:
`../biologie-neuro-outside-fifty-two-source-restoration-author-v2/th-largest-partial-author-v2.final.freeze.json`,
SHA-256 `2572275ce5bc759e0e8b7691533f4b3caf2d63f55591a444cb065508b975c848`.
Alle 24 eingefrorenen Autorenartefakte wurden exakt geprüft, unverändert
erhalten und nicht neu historisch bewertet.

Prüfpfade in diesem Paket:

- `verify-primary-and-binding-inputs.independent-b.py`: gezielte tatsächliche Eingangs-/Primärprüfung; erzeugt den entsprechenden Receipt.
- `probe-current-atlas.independent-b.mts`: unveränderte native Compileraufrufe mit isolierter Addition; erzeugt den nativen Receipt.
- `nineteen-components.independent-b.review.json`: eigene 19 konkrete fachliche Entscheidungen.
- `independent-b-th19.final.freeze.json`: Abschlussbindung nur dieses B-Pakets.

**Neue fachliche M7-Abschlüsse: 0. Wiederhergestellte aktive Bindungen: 0.
Strenger Nettozuwachs: 0.** Keine aktiven Inhalte, Registry, Ledger oder Assets
integriert; kein Git verändert. D/P/A/M/V-Abschlussentscheidungen und die noch
offenen Bindungen bleiben separate Arbeit. Reviewerstatus ist ausschließlich
maschinell. Menschliche Prüfung, Freigaben und Erprobung sind nicht behauptet.
