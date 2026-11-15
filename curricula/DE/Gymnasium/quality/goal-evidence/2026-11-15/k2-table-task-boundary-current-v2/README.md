# Tabellenkompetenz und Vorbereitung der stärkeren Aufgabe

Der zweite vollständige CI-Lauf von [PR #157](https://github.com/enpasos/skillpilot/pull/157)
hat einen wirklichen Modellfehler aufgedeckt: Das Ziel „Tabellen erstellen und
beschriften“ in Jahrgang 5 verlangte das vollständige Ziel zu rationalen Zahlen
aus Jahrgang 6. Der Phasencheck `GVR-002` blieb unverändert und wies diesen Stand
zurück. Die früheren lokalen Nachweise ersetzen diesen fehlgeschlagenen Check
nicht.

## Fachliche Entscheidung

Die elementare Kompetenz organisiert vorgegebene Wertepaare oder Kategorien,
beschriftet Größen und ordnet Einheiten zu. Dafür verlangt das vollständige
aktuelle Evidenzprofil weder rationale Zahlengeraden noch Rechnen mit negativen
Zahlen. Das [tatsächliche Inhaltsreview](root-current-content-review.md) liest
beide Sprachfassungen, das vollständige Profil, beide Anwendungsfälle, das
Originalbild und die vollständige stärkere Aufgabe einschließlich ihres Rasters.

Nur zwei Voraussetzungsmengen ändern sich:

- `f39c49c7`: Der allgemeine Orientierungsanker ersetzt das vollständige
  Rationalzahlenziel als unmittelbare Voraussetzung.
- `54ce7136`: Die konkrete Aufgabe aus Jahrgang 6 verlangt Tabellenaufbau und
  rationale Zahlen ausdrücklich. Ihre halben Zeitwerte und vorzeichenbehafteten
  Temperaturen behalten damit ihre bisherige vollständige Vorbereitung.

Zieltexte, Phasen, Anwendbarkeit, Aufgabenmaterial, Musterlösungen, Raster,
Kompetenzabdeckung und das vollständige positive Evidenzprofil bleiben
unverändert. Die [gemessenen Voraussetzungsmengen](all-W-deltas.actual.json)
ändern sich nur für die elementare Tabellenkompetenz. Die transitive
Vorbereitung der stärkeren Aufgabe und aller übrigen 1.261 Mathematikziele ist
identisch. Der Orientierungsanker wird dabei nicht als mathematische Vorleistung
gezählt. Es werden keine Lernergebnisse geschrieben oder übertragen.

Der [Autorentscheid](author-decision.md) bindet die recherchierten Primärquellen:
Der Bildungsplan Baden-Württemberg behandelt Tabellen bereits in der
Grundschule; das amtliche Gymnasial-Beispielcurriculum liefert einen passenden
Unterrichtskontext. Ein Beispielcurriculum wird nicht als bundesweit bindende
Jahrgangsregel ausgegeben. Alle 50 versiegelten Autorartefakte und ihr Manifest
sind im [Archiv](sealed-author-candidate.tar.gz) bytegleich erhalten; der
[Locator](author-archive-locator.actual.json) beschreibt die Zuordnung.

## Aktuelle Inhaltsnachweise

Der aktuelle P-Eingang wurde nach tatsächlicher Inhaltsprüfung frisch gebunden;
sein vollständiges Profil bleibt bytegleich im semantischen Vergleich. Zwei
unabhängige Agenten haben danach das vollständige aktuelle Ziel, Profil,
Originalbild und die tatsächliche PDF-Zielseite gelesen. Beide entscheiden
`keep`, Profiländerung `none`. Die [native Auflösung](../../../goal-description-review/mathematik/rollout-v1/2026-11-15/k2-table-task-boundary-current-v2/resolution-index.json)
enthält genau ein vollständig aufgelöstes Ziel; beide Originalrunden und die
tatsächliche Root-Synthese stehen daneben. Dies sind KI-Inhaltsreviews, keine
menschliche Freigabe oder gemessene Lernwirkung.

Die [Aktivierung](current-evidence-activation.actual.json) ergänzt eine lineare
Supersession ausschließlich für `f39c49c7`. Historische Indizes und Bewertungen
bleiben erhalten. Ein zusätzlicher Versuch, auch die unveränderte
Rationalzahlenkompetenz frisch aufzunehmen, scheiterte an deren historischem
P-Eingang. Die fehlgeschlagenen Versuche sind erhalten; es gibt dafür keine
neue Freigabebehauptung. Der endgültige neue D-Umfang umfasst allein die
tatsächlich geänderte Tabellenkompetenz.

## Integration und Grenzen

Der aktuelle Graph besteht den unveränderten Phasencheck für 548 Landschaften.
Die vollständige Autorenprüfung umfasst alle 21 kanonischen Kataloge;
der native Fachbuch-Kontext verwendet die bestehende, davon getrennte
Fachbuchdefinition. Es gibt keine neue Inventarausnahme im Qualitätsgate.

Der Dauermodell-Generator wurde mit der aktuellen kanonischen Eingangsbindung
erneut ausgeführt. Sämtliche übrigen Layoutregeln bleiben unverändert; alle
[18 erzeugten Sichten sind bytegleich zum vorherigen PR-Kopf](duration-view-byte-comparison.actual.json).
Die gesonderten Prüfprotokolle unterscheiden erfolgreiche aktuelle Läufe von
erhaltenen Fehlversuchen. Diese begrenzte Reparatur schließt weder alle
K2-Länderplatzierungen noch den Gesamtauftrag ab. Remote-CI, Merge und eine
frische erfolgreiche Main-CI bleiben eigene Abschlussbedingungen.

Die [unabhängige technische Gegenprüfung](completion-audit/README.md) bestätigt
die begrenzten Änderungen und erklärt zwei korrigierte Diagnosezahlen im
Routentest. Der normale Lernrouten-Test besteht mit 25/25 Fällen. Für alle
128 bereits nativ geprüften Seedmengen wurde die kanonische Voraussetzungshülle
erneut verglichen: keine Änderung. Das ist ein aktueller Graphvergleich mit
unveränderten Sichten, kein wiederholter vollständiger Backendtest.

Die [frische vollständige Qualitätsberechnung](integrated-validation/full-quality-and-maturity-comparison.actual.json)
erreicht für Mathematik 807/807, Physik 481/481, Chemie 455/455, Biologie 397/397
und Wirtschaftswissenschaften 346/346 aktuelle Inhaltsnachweise, jeweils alle
sechs automatisierten Qualitätskomponenten und null Blocker. Alle 21 Reifegrade
bleiben gegenüber `a7c7e9ceb2` unverändert. Die
[Mindeststandards](integrated-validation/maturity-floors-current.actual.json)
für 21 Kataloge und zwölf Routen bestehen. Laufzeitassets wurden vor der
Qualitätsberechnung vollständig erzeugt; es gab dabei keinen parallelen
Asset-Writer. Schemacheck und ESLint bestehen ebenfalls. Die Originalausgaben
liegen verlustfrei mit Hash und tatsächlichem Exitcode im Verzeichnis
`integrated-validation/`; der fehlgeschlagene erste Syntheseaufruf ohne
Dual-Zusammenfassung bleibt ausdrücklich als Fehlversuch erhalten.

Der [Paketnachweis](package-contract/README.md) reproduziert außerdem die
veraltete Inhaltsbindung des bisherigen Paketledgers. Die native Erzeugung
aktualisiert genau zwei Bindungen; das Konformitätsskript erhält denselben
tatsächlich kompilierten Inhaltsdigest. Alle 836 Assetentscheidungen, vier
Klassenentscheidungen und 839 offenen menschlichen Prüfpunkte bleiben erhalten.
Der unabhängige Modellvalidator besteht mit 51 Negativfällen, die
Redistributionsprüfung mit 39 Mutationen; 1.025 aktuelle Dateibindungen sind
bytegleich geprüft. Dieser Nachweis erteilt keine neue Publikationsfreigabe.
Die Originale einschließlich Fehlversuch und früherem Ledger sind im dortigen
Archiv erhalten; das große, reproduzierbare generierte Modell wird nicht
zusätzlich eingecheckt.

Der [terminale zweite CI-Durchgang](integrated-validation/second-ci-terminal-jobs.actual.json)
am bisherigen Kopf `161acc0d` endet mit neun erfolgreichen und fünf
fehlgeschlagenen Jobs. Auch der letzte Backendjob ist erfolgreich beendet.
Die gebündelten Korrekturen werden erst danach gepusht; der fehlgeschlagene
Lauf wird weder abgebrochen noch als erfolgreiche Abnahme der Korrektur gezählt.
Dokumentationslinks, Indexabdeckung und Terminologie bestehen lokal; die
zunächst ungültigen relativen Links außerhalb des veröffentlichten `docs/`-Baums
sind durch konkrete GitHub-Commitlinks ersetzt, der Fehlversuch bleibt erhalten.
