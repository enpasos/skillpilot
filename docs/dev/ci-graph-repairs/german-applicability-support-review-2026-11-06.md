# Deutsch: abgeleitete Anwendbarkeit und explizite Vorbereitung

Nach Anwendung der fachlich geprüften 68 Korrekturen und 41 Normalisierungen meldet der unveränderte Applicability-Compiler **0 Fehler und 21 APV-203-Warnungen**. APV-203 bedeutet Drift zwischen gespeichertem und neu berechnetem Metadatum; es ist kein APV-102-Befund über unsichtbare Voraussetzungen. Die [Einzelprüfung mit geschützten Operationen](german-applicability-support-review-2026-11-06.json) bestätigt die 21 konkret abgeleiteten Werte und schlägt daneben zwei ausdrücklich verfasste `prerequisiteOnly`-Einträge vor. Es wurden durch diese Review keine Curriculum-, Mapping- oder Viewdateien verändert.

**Alle 27 bestehenden deutschen authored Views behalten nach den 21 Metadatenänderungen exakt dieselben nach Jurisdiktion gefilterten Targetmengen.** HE bleibt bei allen 21 Zielen unverändert anwendbar. Die neuen Werte machen weder bayerische Ziele zu offiziell hessischen Anforderungen noch erfinden sie Quellenbelege. Die vorhandenen `requires-closure`-Belege bedeuten ausschließlich Verfügbarkeit für eine konkret geprüfte Vorbereitung; `child-union` bedeutet ausschließlich die Vereinigung der Kinder. Es wird keine Rolle aus `requires` abgeleitet.

| Fall / Goal-ID | Tatsächliche Änderung | Konkreter Beleg |
| --- | --- | --- |
| `DE-APP-001` · `001b6ae3-207a-400d-852d-2c4068df8d2f` · Medienanalyse Grundlage | + DE-BB, DE-BE | Geprüfte aktuelle Vorbereitung für Filmsprache analysieren. |
| `DE-APP-002` · `11292633-50b0-59e8-aae6-d962926cdcbc` · Medien- und Netzsprache | − DE-BW | Alter BW-Pfad über Pragmatische Modelle bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |
| `DE-APP-003` · `139e4c3f-3702-41e7-bf10-71b89d8dd75f` · Literarische Texte grundlegend gattungsspezifisch erschließen | + DE-BB, DE-BE, DE-BW | Geprüfte aktuelle Vorbereitung für Dramen/Prosa der Aufklärung, Formen und Gattungen vergleichen. |
| `DE-APP-004` · `393a2edc-a2f7-54e1-b44f-f24c4325bce0` · Zentrale Motive (Natur, Subjekt) | − DE-BW | Alter BW-Pfad über Formen und Gattungen vergleichen bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |
| `DE-APP-005` · `39ec7849-289b-548c-96d7-99fd82a11ac9` · Q4 | + DE-MV, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | Nur Kindvereinigung aus Film und Literatur. |
| `DE-APP-006` · `68edb5b3-d3a7-5124-8a45-e2345138522b` · Figurenkonzeption analysieren | − DE-BW | Alter BW-Pfad über Sprachliche Konstruktion von Geschlecht bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |
| `DE-APP-007` · `70f5f3c6-f0e9-4bd7-8095-a20be459975c` · Argumentationsaufbau | + DE-BB, DE-BE, DE-BW | Geprüfte aktuelle Vorbereitung für Argumentationsanalyse, Argumentationsstrategien deuten, Diskursanalyse zu politischen Texten. |
| `DE-APP-008` · `716eefdf-b7e6-529c-a494-d34f19844631` · Diskurspraktiken vergleichen | − DE-BW | Alter BW-Pfad über Rhetorik digitale Öffentlichkeit bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |
| `DE-APP-009` · `7aa6334f-18d6-543e-9aff-794aa76f5f3a` · Migrationserzählungen analysieren | − DE-BW | Alter BW-Pfad über Mehrsprachigkeit/Hybridität bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |
| `DE-APP-010` · `7d020e64-c3ae-57e6-9b3e-2871bed44d25` · Emanzipationsdiskurse | − DE-BW | Alter BW-Pfad über Dramen/Prosa der Aufklärung bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |
| `DE-APP-011` · `97d958b1-93d3-58ad-b208-80af1cdfd4d4` · Interpretationsschritte | + DE-BB, DE-BE, DE-MV, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | Geprüfte aktuelle Vorbereitung für Erinnerungskultur, Intertextualität Neuanfang, Mediale Aufarbeitung, Milieuschilderung und Detail, Perspektivwechsel Ost/West, Wendeliteratur, Zentrale Motive (Natur, Subjekt). |
| `DE-APP-012` · `9b0e9186-7ff0-5271-5ad7-b72cc083af4f` · Deutsch Jahrgangsstufe 9 | + DE-HB, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SH, DE-SL, DE-SN, DE-ST, DE-TH | Nur Kindvereinigung aus 9.3 Reflexion über Sprache. |
| `DE-APP-013` · `ada7390c-bc64-5d53-d23f-b45f1465cd7b` · Kommunikationssituationen mit einem Kommunikationsmodell erklären | + DE-BB, DE-BE, DE-BW, DE-HB, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SH, DE-SL, DE-SN, DE-ST, DE-TH | Geprüfte aktuelle Vorbereitung für Sprachhandlungen einordnen. |
| `DE-APP-014` · `ae4d237b-77db-59b1-927f-829a58b65deb` · Film und Literatur | + DE-MV, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | Nur Kindvereinigung aus Filmsprache analysieren. |
| `DE-APP-015` · `c2f901ad-9469-5f84-aa19-e80d300842c5` · Erzähltheorie Grundbegriffe | + DE-BB, DE-BE, DE-MV, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | Geprüfte aktuelle Vorbereitung für Erzählformen/Innere Monologe, Perspektivische Wechsel. |
| `DE-APP-016` · `d4124fd5-e0fb-5044-b18d-699ce7203ebf` · Filmsprache analysieren | + DE-MV, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | Geprüfte aktuelle Vorbereitung für Mediale Aufarbeitung. |
| `DE-APP-017` · `d7e283e4-c510-52f0-8c8b-37ab5b2d34b3` · Rhetorik digitale Öffentlichkeit | − DE-BW | Alter BW-Pfad über Multimodale Texte analysieren bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |
| `DE-APP-018` · `e369f367-c2d8-5301-a5be-f2c15ced9c30` · Werkanalyse um 1800 | − DE-BW | Alter BW-Pfad über Zentrale Motive (Natur, Subjekt) bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |
| `DE-APP-019` · `e3cd968b-6b23-5bb7-a94e-f4e498568467` · Medienwandel und Öffentlichkeit | − DE-BW | Alter BW-Pfad über Diskursanalyse zu politischen Texten bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |
| `DE-APP-020` · `e889da25-4990-5939-5ae0-19ff6a460e4d` · 9.3 Reflexion über Sprache | + DE-HB, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SH, DE-SL, DE-SN, DE-ST, DE-TH | Nur Kindvereinigung aus Kommunikationssituationen mit einem Kommunikationsmodell erklären. |
| `DE-APP-021` · `fc46cb44-fe70-5ad5-8ef9-854010f446c5` · Dramen/Prosa der Aufklärung | − DE-BW | Alter BW-Pfad über Argumentationsstrategien deuten bewusst korrigiert; kein verbleibender BW-Beleg im aktuellen Compiler. |

Die zehn BW-Abnahmen wurden gegen den tatsächlichen Graphen am Checkpoint `be07d93e9357a8405a892b354c1eefaa3442568e` verglichen. Jede alte BW-Verbraucherkante existierte dort und wurde im geprüften Fachpaket gezielt ersetzt. Im aktuellen Compiler verbleibt für das jeweils alte Ziel kein BW-Mapping-, Provenienz-, Override- oder `requires-closure`-Beleg. Das ist keine Aussage darüber, was ein amtlicher Lehrplan außerhalb des vorhandenen Mappingstands verlangen könnte; hier wird ausschließlich das bestehende, unveränderte Belegmodell korrekt materialisiert.

Ein eigenständiger Projektionsfall besteht in den Hessen-Sek-II-Views: Das Target `0c807f91-04b5-59dd-9c16-b366467e2557` („Sprachhandlungen einordnen“) verlangt die vorhandene HE-Sek-I-Grundlage `ada7390c-bc64-5d53-d23f-b45f1465cd7b` („Kommunikationssituationen mit einem Kommunikationsmodell erklären“). Diese gehört fachlich zur Vorbereitung, nicht als neues Erwerbsziel in den Sek-II-Kurs. Vorgeschlagen wird in **beiden** Dateien `de-he-sekii-gk.view.json` und `de-he-sekii-lk.view.json` genau ein zusätzlicher Eintrag unter `/rootNodes/0/children/-`:

```json
{
  "kind": "goalEntry",
  "goalId": "ada7390c-bc64-5d53-d23f-b45f1465cd7b",
  "projectionRole": "prerequisiteOnly"
}
```

Die produktive Rollensammlung und `compileCompositionView` wurden für beide hypothetischen Views ausgeführt: jeweils **175 → 175 Targets**, **0 → 1 Supportziel**, identischer sichtbarer kompilierter Baum und identische Compilerfindings ohne Fehler. Alle direkten Voraussetzungen sämtlicher Target- und Supportziele sind danach als vorhandene kanonische IDs in der Projektion enthalten. Die einzige Voraussetzung des hinzugefügten Supportziels ist die bereits enthaltene Orientierung. Die aktuelle globale Mastery dieses Ziels bleibt dieselbe; der Eintrag erzeugt keinen Masterywert und öffnet kein neues Sek-II-Lernziel.

Das Manifest bindet den aktuellen Deutsch-Quellhash, die frühere Vergleichsrevision, die Compilerfassung, die 21 Originaldeltas, die beiden Viewhashes und die Prüfwerte aller 27 Views. Jede Metadatenoperation schützt Goal-ID, bisherigen Wert und vollständigen kanonischen Goalhash; die beiden Viewoperationen schützen Dateihash, Eltern-ID, Kinderzahl und fehlenden bisherigen Eintrag. Root prüft vor Anwendung diese Guards und danach frische Applicability-, Composition-, Graph-, Quellen-, Memory- und CQR-Ergebnisse. Frühere Reviewbytes, Quellmappings, Karten, Goaltexte, IDs, Prüfungsabdeckungen und Meilensteinfloors bleiben unangetastet. Die bereits dokumentierte tautologische Beschreibung des Kommunikationsmodellziels bleibt der gesonderte Inhaltsbefund `DE-TEXT-066`; diese Integrationsreview behauptet hierfür keine neue Qualitätsabnahme.
