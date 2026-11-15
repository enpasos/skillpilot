# Unabhängige Prüfung: K3/K6-v4-Platzierung

15.11.2026, 12:17:42 CET. **Platzierung und gemessene Ergebnisse: ACCEPT. Erklärung des Ergebnisrückgangs im ursprünglichen README: REVISE.** Die erforderliche Korrektur ist unten ausdrücklich abgegrenzt; sie widerlegt keinen der vier nachgewiesenen Reparaturfälle.

Geprüft wurden der versiegelte Kandidat, der ursprüngliche Integrationsentscheid, sämtliche 69 tatsächlichen Sichtendeltas, vollständige Rohresultate und die verwendeten Probenquellen. Die Prüfung entstand unabhängig vom Autor. Ausschließlich dieses eigene TMP-Verzeichnis wurde geschrieben; keine aktiven Daten, historischen Manifeste, Kommentare oder Commits.

## Bindung

- Kandidatenmanifest: `7cc10aa92411fd719faaa07bc1529e0b1ea7dd0995ebfda7f9eeaaf5262001ba`.
- Exakter Patch: `bdd272098cefaf284eb020de86e50d0c5d5aacdc97764dc7398e709e00f613bc`; unabhängig aus allen 69 Dateipaaren bytegleich rekonstruiert.
- Physik vor/nach und versiegeltes combined-v3: `b6522d461b15a284244dd57827564eecbb0b28f88b4c9bd21ef7d34b9edd3e48`.
- Sichtensatz vorher: `09b98741ffdad5a960e8f1d58812946fd597d82da534f28866faff2e107ba937`; nachher: `ef2345bef7d93f9051f6a2d915ceb786027fe8faafac7d0da264e0ee785b0393`. Berechnung: SHA-256 der sortierten Verkettung `Dateiname + NUL + Dateidigest + LF`; alle 69 Einzelpaare stehen in `independent-check.actual.json`.

Alle 1.345 Kandidatenbindungen und vier Parentbindungen wurden selbst nachgerechnet, zusätzlich 1.418 Nativecode-/Quellenbindungen, fünf Compilerquellen und sechs echte Deckressourcen. Gegen combined-v3 sind 20 kanonische Dokumente und alle 44 vorhandenen Mappings objektgleich; Mathematik unterscheidet sich ausschließlich in den beiden dokumentierten `requires`-Korrekturen f39 und 54. Vor/nach der Platzierung sind diese Katalog-/Mappingeingaben identisch.

## Inhaltlicher und struktureller Befund

Genau 34 reine SekII-Sichten ändern sich; die anderen 35 bleiben bytegleich. Alle Änderungen bestehen ausschließlich aus den 34 Verschiebungen des vorhandenen Vorbereitungsblocks unter den tatsächlichen SekII-Vorfahren sowie den zwei bayerischen Verschiebungen von e550 in eine Vorbereitungsuntergruppe bei Ph11.4. Nach Entfernen genau dieser Blöcke sind die gesamten Sichtobjekte gleich. Sämtliche vollständigen Referenzmultimengen einschließlich Metadaten, Zielmengen und Rollen bleiben erhalten.

In beiden BY-Profilen steht e550 genau einmal unter Ph11.4. Das Modellziel war dort schon vorher ein Ziel. „Notwendige Vorbereitung: Modellverständnis nachweisen“ bezeichnet einen SkillPilot-Vorbereitungsnachweis; weder der SekI-Inhalt noch seine Quellenzuweisung werden zu einem neu behaupteten amtlichen Ph11.4-Inhalt. Der bisherige Physikinhalt einschließlich Aufgaben, Rubriken, IDs, Voraussetzungen und Anwendbarkeit ist exakt unverändert.

Die Platzierung nimmt die offenen Nachweise in die tatsächlich ausgewählten Fach-/SekII-Scopes auf. Der unveränderte Evaluator hält dadurch deren vorausgesetzte Kompetenzen offen. Es wird weder eine fiktive Voraussetzung eingeführt noch ein Prädikat gelockert.

## Selbst wiederholte Ausführung

Alle vier eigenen Ausführungen enden mit Exitcode 0 (`independent-replay-executions.actual.json`):

- Echter Composition-Compiler: 69/69 vorher und nachher ohne Fehler, gleiche kompilierte Ziel-IDs und Rollen, jedes sichtbare Ziel genau einmal. Alle 21 Graphgates bestehen (`native-recheck.actual.json`).
- Beide vollständigen nativen LearnerService-Replays reproduzieren die jeweiligen Autoren-JSONs vollständig objektgleich (`service-before.actual.json`, `service-after.actual.json`).
- Sechs parametrische JUnit-Fälle bestehen, jeweils mit leerem Ergebnisstand und ausschließlich altem Optikpass. Offene neue Assessmenttargets, lesbarer alter Pass und null Masterywrites werden geprüft.

| Öffentliche Auswahl | Untersuchte Erlasse vorher | Nachher |
|---|---|---|
| HE SekII / physics-root | Modell | keine |
| HE CrossStage / physics-sekii-gk | keine | keine |
| BY SekII / physics-root | Modell, Linsen | keine |
| BY SekII / physics-sekii-gk | Modell, Linsen | keine |
| BY SekII / physics-by-ph11-4 | Modell | keine |

Alle fünf Auswahlen werden tatsächlich akzeptiert und bleiben `valid` und offen. Die vollständigen globalen automatischen Waivermengen, Frontier `[d675]`, offener Fokus, Level2-Ziele und Ergebnisabbildungen bleiben gleich. Die Auswahl ändert erwartungsgemäß die Navigationsroute. Zwölf volle PC-Rohzeilen sind vor/nach vollständig gleich, einschließlich aller Ziel-, Waiver- und Pending-IDs; ebenso die sechs gültigen öffentlichen State-Rohzeilen und vier Frontier-Rohzeilen. Keine gespeicherte Mastery wird erzeugt oder übertragen. Für diese fünf ausgewählten Fälle besteht kein weiterer Platzierungsbefund.

## Erforderliche Textkorrektur, getrennt vom ACCEPT

Das ursprüngliche versiegelte `README.md`, **Zeilen 78–81**, erklärt 73 → 69 fälschlich damit, die alleinige Vorbereitungsgruppe enthalte das verschobene Modellziel nicht mehr als untersuchten Claim. Die gleiche falsche Kausalerklärung steht im `interpretation`-Feld von `evidence/bounded-service-placement-result.actual.json`.

**Korrekt:** Vier protokollierte Auswertungen entfallen: HE SekII und BY SekII, jeweils leerer Ergebnisstand/alter Optikpass, für `physics-methods-k3-upper-preparation-assessments`. Ihr vorheriges `relevantTargets` ist ausschließlich **6a4c (Brechung)**, nicht e5 (Modell). Nach der Verschiebung ist dieser Block in den gemessenen Konfigurationen keine Wurzel mehr und bei Video-Fokus kein Fokusvorfahr; `LearnerService.automaticCompletionOptions` nimmt ihn deshalb nicht in diese Angebotsliste auf. Das bedeutet weder generelle Unverfügbarkeit noch einen Reparaturnachweis. Der positive Befund folgt aus den fünf tatsächlich akzeptierten öffentlichen Auswahlen und den exakten Vergleichsdaten oben. Die Originale bleiben versiegelt; eine explizite ergänzende Integrationsnotiz soll die historische Erklärung korrigieren.

Dies ist die begrenzte unabhängige Platzierungs-/Serviceevidenzprüfung. Sie ist keine neue blinde Physik-D-Inhaltsfreigabe, kein Runtimebeweis für alle Länder, keine F8–F13-/Einheitsanerkennung und keine Main-CI- oder Produktionsabnahme.
