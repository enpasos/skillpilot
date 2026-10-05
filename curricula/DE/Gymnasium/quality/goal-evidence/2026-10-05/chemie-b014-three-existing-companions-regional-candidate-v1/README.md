# Drei vorhandene Chemie-Companions: regionale Author-Kandidaten

**Gesamtergebnis: HOLD vor Übernahme.** Zwei vollständige Text-/Voraussetzungs-/Quellenkandidaten sind erstellt. Die SHE-Kursrelation und die Kontinuität bestehender E-Fokusreferenzen sind offen. Alles ist ein inaktiver, informierter AI-Author-Kandidat. Es gibt keine neue D-/P-Freigabe, keinen Strict-Zuwachs und keine menschliche Freigabe.

## Vorhandene Ziele vollständig wiederverwenden

| Ziel | Erarbeitet | Offene Grenze |
| --- | --- | --- |
| `8be14f15-2258-58e6-ae4e-38953f5d0570` Spannungsreihen | Vollständiges DE/EN-Ziel bleibt erhalten. Voraussetzung ist das qualitative galvanische Element `f093`; die schon darüber erforderliche Redoxreihe wird nicht nochmals direkt gefordert. | SHE-Aufbau ist kein universeller Voraussetzungstest für das Nutzen gegebener Standardpotenziale. Vollständige SHE-Quellenabdeckung bleibt gesondert HOLD. |
| `c224281a-f8a3-58cd-8ca3-2c2e134d61ff` starker pH | Vollständiges DE/EN-Ziel präzisiert verdünnte wässrige Lösungen, begründete Modellannahmen und Plausibilitätsprüfung. Voraussetzungen: Arrhenius, Brønsted, Stoffmenge/Mol. | Die konkrete Konzentration ist gegeben; Herstellung/Massenberechnung ist ein anderes Ziel. Die fortgeschrittene pK/MWG-Voraussetzung `48115` entfällt. |
| `b781745a-256e-52b2-8d86-c1072845ccdd` SHE | Vollständiges vorhandenes Ziel, DE/EN, Tags, Voraussetzungen und Bild unverändert dokumentiert. Zwei notwendige partielle HE-Quellenzuordnungen sind als **unapplied** festgehalten. | `LK` bleibt erhalten. Native Kursfilter können „HE GK/LK, sonst LK“ nicht als regionale Relation ausdrücken. |

Die fachliche Einheit bei 8be ist das Verwenden einer Standardpotenzialtabelle einschließlich Redoxrichtung und Standard-Zellspannung. Die ganze SHE-Konstruktion ist eine eigene experimentelle Referenzmethode. Es wäre weder nötig noch sinnvoll, diese Methode als universelle Vorbedingung jeder gegebenen Potenzialtabelle zu zertifizieren. Nernst-Berechnungen außerhalb der Standardbedingungen sind weiterhin ein gesonderter Bereich.

Beim starken pH werden die tatsächlich begründeten Näherungen benötigt: vollständige Protolyse/Dissoziation im betrachteten Modell, korrekte Zahl gebildeter Oxonium-/Hydroxidionen, hinreichend kleine Aktivitätskorrektur sowie begründeter Umgang mit Wasserautoprotolyse und Temperatur beziehungsweise vorgegebenem pKw. „Verdünnt“ ist kein Freibrief für beliebig extreme Verdünnung. Beispielsweise liefert die unzulässige Vernachlässigung von Wasser bei einer sehr kleinen Säurekonzentration einen scheinbar basischen pH. Der vorgeschlagene Beschreibungstext bindet die Rechnung deshalb ausdrücklich an begründete Modellannahmen. Schwache Säuren/Basen, pKS/pKB, Puffer und MWG sind kein universeller Zugangstest für diese starke-Lösung-Rechnung.

## Primärquelle und vollständige Quellensätze

Die [aktuelle amtliche Hessen-PDF](https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/kcgo_chemie_21.04.2026.pdf), Ausgabe 2024, Stand 21.04.2026, wurde unabhängig erneut per HTTP 200 geladen, bytegleich mit der erhaltenen aktuellen PDF geprüft und auf den gedruckten Seiten 35 und 47 selbst gerastert und gelesen. SHA256: `628c84dbaadebccf93c6854c58e00a337fd855985aaadc8b998de3dcb1243c3e`.

Seite 35 setzt SHE/Spannungsreihe/Zellspannung in E.1 und starke pH-Rechnung in E.2. Seite 47 nimmt SHE und Standardspannungen im grundlegenden Q3.3-Niveau wieder auf; die Nernst-Gleichung steht im erhöhten Niveau. Die erhaltene lokale ältere PDF und die Source-Extraction bleiben unverändert. Ihre Version und Seitenzahlen werden nicht nachträglich als aktuelle HTTP-Version ausgegeben. Hier wird ausschließlich die bereits separat belegte gezielte Quellenbrücke verwendet, keine globale Lehrplanmigration.

Die drei geänderten Source-Zeilen stehen vollständig in `bounded-source-mapping-deltas.json`:

- E.1 B06: `8be` deckt den Spannungs-/Berechnungsteil partiell. Die qualitative Zellstruktur `f093` bleibt über E.1 B07 zugeordnet. Der separate SHE-Teil bleibt ausdrücklich HOLD.
- E.2 B03: `c224` übernimmt die starke pH-Rechnung und `d2ccd` die vorhandene Indikator-Detektion/Klassifikation. Die Herstellung von Lösungen wird nicht aus dieser Zeile abgeleitet. Alle Source-Wörter bleiben erhalten; beide Teilzuordnungen bilden die geplante Kompetenzabdeckung.
- Q3.3 B03: `8be` ist partiell, da der ganze Source-Satz auch SHE umfasst. Die fehlende SHE-Komponente wird nicht durch ein altes `exact`-Label verdeckt.

Das initial zusätzlich zugeordnete `fd309` wurde nach dem tatsächlichen Quellenansichtenvergleich aus diesem engen Kandidaten entfernt: Teilchencharakterisierung ist für andere ursprüngliche Split-Quellen separat zu prüfen; diese Indikator-/pH-Zeile benötigt keinen zweiten allgemeinen Teilchen-Target. Die tatsächliche erste Diagnose wird aufbewahrt.

## Native Kurse, Platzierung und tatsächlicher HOLD

Bytegleiche Kopien von `app/scripts`, `app/src` und den benötigten Contracts laufen in `/tmp/skillpilot-chem-b014-companions-regional-v1`. Operative Eingaben sind separat kopiert. Es wird kein aktiver Compiler, Kursfilter oder Checker verändert.

Der native Rollenversuch ist ausdrücklich durchgeführt: Ein direkter SHE-`target` überschreibt den breiten `prerequisiteOnly`-Teilbaum. `applyCompositionViewProjection` behält dennoch die vorhandenen `LK`-Tags; `goalMatchesFilters(..., ['DE-HE','GK'])` ist **false**. Ein zusätzlicher globaler GK-Tag öffnet denselben Filter ebenfalls in BB, BE, BW, BY und NI. Das ist keine zulässige regionale Reparatur. Unbekannte Schemafelder oder eine fingierte übersteuernde Wirkung eines `target` werden nicht verwendet.

Für 8be/c224 wurden nur die zwei bestehenden HE-GK/LK-Kompositionsansichten ausgeformt. Im tatsächlich projizierten E-Strukturknoten sind beide vorhanden; alle Zielmengen bleiben erhalten und jedes vorhandene kanonische Ziel wird genau einmal referenziert. Die nationalen und anderen regionalen Ansichten bleiben unverändert.

**Diese Ausformung bleibt vor Übernahme HOLD:** Betroffene kanonische Cluster erscheinen als opaque Überblickseinträge; ihre präsentierten Kinder hängen an nativen `structure`-IDs. Der alte kanonische E-Fokus `323a222e-5db8-53c5-b2dc-6f9c1d0d277c` erreicht die Companions deshalb nicht. Die positiven E-Strukturtests beweisen diese alte Fokusreferenz ausdrücklich nicht. Eine echte Reparatur muss die vorhandenen Fokusreferenzen/Consumer erhalten oder nachvollziehbar migrieren und die gemeinsame nationale Buchnavigation abstimmen. Globale `contains`-/Phasenverschiebungen würden andere Regionen betreffen; solche Änderungen wurden hier nicht vorgenommen. Ein Runtime-Umbau ist in diesem Auftrag nicht autorisiert.

## Tatsächliche Ergebnisse

- Finaler nativer Prozess: **exit 0**; `native-final-terminal.receipt.json` und tatsächlicher Log.
- **48/48** zuvor aufgelöste Quellenansichten: vollständige Target- und gefilterte Sichtmengen unverändert; keine Region heimlich um GK erweitert.
- **37** bestehende authored Views: fehlerfrei kompiliert. **35** nicht betroffene Views: bytegleich und vollständige kompilierte Pfade gleich. Zwei HE-Views: Companions jeweils einmal unter E, gefilterte Zielmengen unverändert.
- Tatsächliche effektive/transitive prerequisites: kein `48115`-pK/MWG für c224, kein SHE-Zwang für 8be; DAG und stabile IDs erhalten.
- Source-Union **358 → 358**, neue gewöhnliche Atome **0**, Strict-Zuwachs **0**.
- **1192** erfasste operative Eingabe-/Native-Code-Dateien und alle **38** eingefrorenen Dateien der früheren unabhängigen Source-Remediation unverändert. Die vorhandenen Companion-Bilder bleiben erhalten.

Der semantische Fingerprint-Binder im isolierten Baum hält ausschließlich die vorhandene Kind-Klassifikation konsistent mit den Candidate-Texten. Er ist kein neuer D-/P-Review und keine aktive autoritative Übernahme.

## Exakte spätere D2-Grenze

Der tatsächliche native Review-Buchmodellvergleich hat ebenfalls **exit 0**, **358 Seiten** und **acht** veränderte Page-Records gegenüber dem eingefrorenen Eight-Author-Candidate. `native-book-page-deltas.receipt.json` enthält komplette Before/After-Datensätze und Fingerprints; `complete-author-handoff-and-future-d2-scope.json` enthält die kurze genaue Grenzliste.

| Seite | Ziel | Tatsächlich geänderter Kontext |
| --- | --- | --- |
| 51 | `1dc15fa2` | reverseRequires |
| 96 | `16da6a4d` | reverseRequires |
| 97 | `f0939f88` | reverseRequires |
| 100 | `28bb9d15` | reverseRequires |
| 103 | `1c1420c2` | reverseRequires |
| 272 | `48115ff7` | reverseRequires |
| 273 | `c224281a` | Beschreibung und requires |
| 282 | `8be14f15` | requires und externe prerequisites |

Candidate-Modell-Digest: `sha256:78cd31e440d186d8cab7ddeeed74c5df09960a7b440d60d8ee53131d2397a80b`. Die gemeinsame kanonische Buchnavigation bleibt tatsächlich Q3; die gesonderte HE-E-Ausformung ist nicht heimlich in dieses nationale Modell übernommen. Es gibt keine vorbereitete Final-PDF, keine Final-HTML-Sichtung und keine D2-Freigabe. Spätere frische Reviewer benötigen die tatsächlich endgültigen acht Seitenkontexte, die drei ganzen Quellenzeilen und die aufgelösten SHE-/Fokusgrenzen.

Eigene fachliche Texte und Evidenzbeschreibungen: CC-BY-4.0. Technische Helper: Apache-2.0. Amtliche Quellendokumente und erhaltene Extraktionen bleiben eigenständige Drittquellen; ihre Rechte werden nicht umetikettiert.
