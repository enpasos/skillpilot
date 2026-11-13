# Physik: gezielte fachliche Neuprüfung nach Umlautkorrektur

Datum: 13. November 2026. Reviewer: `codex-feedback-2026-11-13-physics-spelling-semantic-review`. Dies ist eine fachliche AI-Prüfung, keine menschliche Einzelabnahme.

Geprüft wurde ausschließlich das aktuelle DE/EN-Ziel `727d0946-7019-50ed-8fc6-85db12508733` (Realitätsbegriff in der Quantenphysik diskutieren), einschließlich seiner direkten Voraussetzungen `5c57dbc7-d258-4aad-a84c-e773f3c493ae` (Wahrscheinlichkeitsaussagen) und `b05da028-65e4-5cd1-a13c-6c1a95b6dfdf` (Messproblem). Die aktuelle Änderung ersetzt die Umschreibungen in Realitätsbegriff und Präparation durch Umlaute; sie ändert keine fachliche Anforderung, ID, Voraussetzung oder Geltungszuordnung.

## Entscheidungen auf dem aktuellen Ziel

- **Semantic kind: curricularAtomic.** Das Blatt verlangt eine eigene fachlich überprüfbare Diskussionsleistung. Messung, Präparation und Wahrscheinlichkeitsaussagen liefern die Gesichtspunkte dieser einen Leistung. Es ist weder Strukturknoten noch Aufgabe, Merkkarte oder Orientierung. Die gegenwärtige Klassifikation wurde anhand des aktuellen Texts erneut getroffen und ausschließlich diese Entscheidung an den aktuellen Source-Fingerprint gebunden. Der geschlossene Ledger erlaubt keine zusätzlichen Reviewerfelder; Reviewer, Datum und Begründung sind daher hier dokumentiert.
- **Atomicity: atomic.** Gemäß `semantic-atomicity-v1` bleibt eine zusammenhängende Kompetenz: einen Realitätsanspruch anhand einer konkreten Mess- und Präparationssituation fachlich diskutieren. Die vorausgesetzte probabilistische Deutung und das Messproblem sind bereits eigene Ziele. Eine begründete Analyse und ein Transfer auf eine veränderte Situation erlauben eine Prüfung in 1–3 Aufgaben; ein Split würde die gemeinsame Argumentationsleistung zerschneiden. Der genau eine betroffene Ledgerdatensatz wurde mit aktueller Begründung, Reviewer und Zeitpunkt erneuert.
- **Memory: no_memory_needed.** Gefordert ist fallbezogenes Verknüpfen und Abwägen bereits eingeführter Aussagen. Es entsteht kein eigenständiger notwendiger Formel-, Definitions- oder Gesetzesabruf. Eine zusätzliche Deutungsformel als Merkkarte würde die Diskussion nicht ersetzen. Es werden weder Memoryziele noch Decks neu zugeordnet. Der genau eine betroffene Ledgerdatensatz wurde nach erneuter Prüfung aktualisiert.

Die aktiven Konfigurationen bleiben `semantic-atomicity/canonical-physics-full.config.json` und `memory-card-review/canonical-physics-full.config.json`; ihre Auswahl erfolgt durch `deep-understanding-rollout/de-gymnasium-math-physics.config.json`. Es wurde kein pauschaler Fingerprint-Refresh ausgeführt.

## Abgrenzung der Mathematikbilder und Applicability

Die zwei Mathematikimporte `dde9ae98-d97d-598b-92f4-f1616f4d75c8` und `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` ändern ausschließlich `resourceLinks` und Bildartefakte. Atomicity und Memory binden diese Bildmetadaten nicht. Auch `semantic-kind-source-fingerprint-v1` bindet das Top-Level-Feld `resourceLinks` ausdrücklich nicht; die tatsächlichen Zieltexte und semantischen Felder bleiben unverändert. Deshalb werden die Mathematik-Ledger in diesen drei Lanes nicht verändert. Bild-QA und D/P-Kontextbindung bleiben gesonderte aktuelle Prüfungen.

Die regelbasierte Applicability-Auswertung verwendet unter anderem Quellenprovenienz, Mappings, Overrides und Graphbeziehungen. Diese Eingaben und die geschriebenen Jurisdiction-Werte sind für alle drei Ziele unverändert. Eine Schreibweisen- oder Bildkorrektur erzeugt daher keine neue fachliche Applicability-Entscheidung. Die abschließende aktuelle Compilation/CQR-Prüfung bleibt erforderlich; sie wird durch diesen Review nicht ersetzt.

## Gezielte Verifikation

- `quality:semantic-atomicity:check` mit `canonical-physics-full.config.json`: Exit 0; 478 aktuelle Atomicity-Reviews, keine fehlenden, veralteten oder obsoleten Datensätze.
- `quality:memory-card-review:check` mit `canonical-physics-full.config.json`: Exit 0; 478 aktuelle Zielreviews, keine fehlenden/veralteten Ziel- oder Kartenreviews und keine fehlende Memory-Sichtbarkeit.
- Das Physik-Semantic-Kind-Ledger besteht das geschlossene Ontologie-/Ledger-Schema; der Source-Fingerprint des betroffenen Ziels stimmt mit `fingerprintSemanticKindSourceGoal` überein.
- Dieselbe produktive Fingerprintfunktion liefert für beide Mathematikziele vor und nach den Bildimporten identische Semantic-Kind-Fingerprints. Das Mathematik-Semantic-Kind-Ledger bleibt unverändert.

Kein allgemeiner CQR-Lauf wurde durch diesen Teilreview gestartet.
