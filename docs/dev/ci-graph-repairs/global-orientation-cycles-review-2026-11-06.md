# Drei globale Orientierungsselbstzyklen: Befund und enger Reparaturvorschlag

Die vollständige Prüfung der **21 kanonischen Kataloge auf `5cb5e567d08bc9f640942529d9099cbce03a4747`** findet genau drei zyklische Komponenten. Jede besteht aus einem einzelnen Orientierungsziel mit einer geerbten Selbstkante. Betroffen sind Griechisch, Chinesisch und Französisch sowie die Gesamtübersicht. **Keines der zehn geschützten M6/M7-Fächer enthält diese Komponenten in seinem tatsächlichen nativen Prüfumfang; deren G42-Prüfungen bestanden bereits vorher.** Diese echten Fehler dürfen daher nicht als Erklärung für die übrigen geschützten Fachblocker ausgegeben werden.

Der [vollständige lesende Beleg](global-orientation-cycles-review-2026-11-06.json) bindet alle 21 Quelldateien, die tatsächlichen Integritätskernel, vollständige Ziel-/Elternkontexte, alle Ursprünge, fünf geschützte Operationsvorschläge, sämtliche Goal-/Atomic-Deltas und die nativen Prüfumfänge. Er enthält beide vollständigen Reproducer. Keine Quelle wurde geändert. Spätere Katalogänderungen benötigen einen neu gebundenen Nachweis; dieser Beleg bleibt der ausdrücklich bezeichnete Beobachtungsstand.

## Beziehungen und genaue Ursachen

Geprüft wurden 6524 Goals und 5495 Atome. Sowohl `contains` als auch die unmittelbar geschriebenen `requires` sind azyklisch. Die Goal-Relation `R_effective` enthält nach vollständiger Contains-Vererbung genau drei Singleton-SCCs. Die getrennte atomare Expansion `R_at` enthält dieselben drei Singleton-SCCs; weitere atomare Zyklen entstehen in diesem Katalog nicht.

Das folgt den [Graph-Definitionen §§6.1, 6.4 und 7.1](../../concept/skill-graph/graph-definition.md): Anforderungen aller Contains-Vorfahren werden übernommen; erst für `R_at` wird ein vorausgesetztes Ziel in seine atomare Basis aufgelöst. Ein Masterywert unterbricht diese Analyse nicht. Die Goal-Relation für die G17-Minimalität wird dabei ausdrücklich nicht durch `R_at` ersetzt.

| Fach / Owner | Einziger zyklischer Knoten | Einziger verursachender authored Ursprung |
| --- | --- | --- |
| Griechisch / `70a2cb55-127b-5c6e-b518-4a1c9f4f77a0` | `c8acea81-7cc7-5471-ba3d-cedde0e28bc6` – Warum Griechisch? | E-Phase `fa373166-b85a-5cbb-ac34-1f9a97e39e49` enthält diese Orientierung und verlangt sie zugleich. |
| Chinesisch / `8fdb83f5-b42a-5b36-ab5d-64edd4b2ab80` | `d7a23bd7-81ee-5c3e-8e92-f5915ab588f2` – Warum Chinesisch? | E-Phase `78e54102-c215-50a5-b0c2-4f1deaa7a200` enthält diese Orientierung und verlangt sie zugleich. |
| Französisch / `96a915cc-4fd6-5dc2-8cee-aaf3ab8c2977` | `81f0501c-890a-5ebd-be54-4ae7698d4d52` – Warum Französisch? | E-Phase `fb4e7e31-be77-57ff-addb-d329633c049f` enthält diese Orientierung und verlangt sie zugleich. |

Die Orientierungsatome selbst haben bereits leere direkte `requires`. Ihre vollständigen deutschen Texte verlangen nur eine Interessenwahl beziehungsweise die Entscheidung weiterzulernen und schließen vorausgesetztes oder geprüftes Detailwissen ausdrücklich aus. Unter dem [Orientierungsvertrag](../../concept/skill-graph/node-types.md#orientation) ist eine Voraussetzung des Einstiegs durch sich selbst falsch. Der Fehler liegt jeweils in der universellen Behauptung des konkreten Elternclusters; eine Vererbungs- oder Orientierungs-Ausnahme würde die Ursache verdecken.

## Der vollständige Fünf-Operationen-Kandidat

Bei Griechisch und Chinesisch genügt jeweils das Entfernen des einen `requires`-Eintrags auf der E-Phase. **Alle 42 beziehungsweise 43 anderen Nachfahren behalten dieselbe Orientierung über vorhandene direkte oder transitive Wege.** Die Quelle wurde dafür vollständig berechnet; es handelt sich nicht um eine Stichprobe.

Bei Französisch wäre dieselbe isolierte Löschung unvollständig: Sie entzöge sieben gewöhnlichen E-Einstiegszielen zu *Le cercle familial et amical* ihre bestehende Orientierung. Der tatsächliche Gegenfall steht mit allen Deltas im Beleg. Der enge vollständige Vorschlag erhält deshalb die Orientierung zusätzlich explizit an genau zwei unabhängigen Einstiegen:

| Operation | Ziel und heutige Leistung | Neues `requires` |
| --- | --- | --- |
| `GLOBAL-ORI-CYCLE-04` | `5f0b8adf-e7af-5cdd-a50c-0a721662b54c`: Texte über Familie/Freundeskreis lesen und Kernaussagen entnehmen; heute direkt keine Voraussetzung | `["81f0501c-890a-5ebd-be54-4ae7698d4d52"]` |
| `GLOBAL-ORI-CYCLE-05` | `b57e7524-210c-5426-b67c-cc81a9e32edb`: Hörimpulse über Familie/Freundeskreis verstehen und Schlüsselinformationen sichern; heute direkt keine Voraussetzung | `["81f0501c-890a-5ebd-be54-4ae7698d4d52"]` |

Beide Bindungen bestehen heute bereits effektiv durch die E-Phase. Der Vorschlag erhält sie nach Entfernung des falschen Elternursprungs. Er erfindet keine fachliche Vorleistung. Der vorhandene Hörpfad trägt auch die fünf übrigen betroffenen Ziele zu Gespräch, zusammenhängendem Sprechen, Schreiben, Kulturvergleich und Sprachmittlung. Damit behalten **alle 50 anderen französischen Nachfahren** ihre Orientierung. Die unveränderte didaktische Breite dieser bestehenden Sprech-/Schreibketten wird hier nicht zusätzlich freigegeben.

Die drei Clusteroperationen `GLOBAL-ORI-CYCLE-01` bis `-03` setzen jeweils `/goals/2/requires` von der genannten einzelnen Orientierungs-ID auf `[]`; die beiden französischen Operationen ändern `/goals/7/requires` und `/goals/8/requires`. Der JSON-Beleg enthält vollständige Dateihashes, Goal-IDs, vorherige Arrays und Whole-Goal-Guards. Die drei Löschungen allein sind ausdrücklich kein freigegebener Kandidat. Keine `contains`-, Text-, ID-, Phasen-, Karten-, Coverage- oder Viewänderung gehört zum Vorschlag.

## Vollständige Wirkung und echte Gegenkontrollen

Über den gesamten Katalog ändern die fünf Operationen fünf authored Paare, 30 effektive und 25 atomare Adjazenzpaare. In der vollständigen transitive Closure verbleiben nur diese Unterschiede:

- **Goal-Closure:** sechs entfernte Paare – drei Orientierungs-Selbstpaare und die drei E-Cluster-Anforderungen auf die jeweilige Orientierung. Keine Addition.
- **Atomic-Closure:** genau die drei entfernten Selbstpaare. **Jede andere atomare Closure ist vollständig gleich.**
- Alle vier Relationen `contains`, authored `requires`, `R_effective` und `R_at` sind im Kandidaten azyklisch. Die beibehaltenen E-Cluster aggregieren weiter dieselben Kinder; ihre Erfüllung wird nicht durch das Entfernen der fehlerhaften Eintrittsvoraussetzung vorweggenommen.

Es wurden **42 echte Aufrufe der aktuellen `evaluateGraphIntegrity`-Funktion** ausgeführt: alle 21 Root-Landschaften vor und nach der Hypothese. Die geprüften Goal-Mengen sind in jedem Paar identisch. Die drei Sprachscopes und die Gesamtübersicht wechseln bei G15/G42 von `fail` zu `pass`; alle anderen Scopes bleiben dort `pass`. Je ein separat wieder eingesetzter Clusterursprung lässt G15 und G42 seines Sprachscopes erneut scheitern: drei zusätzliche tatsächliche Negativkontrollen.

Das ist keine vollständige CQR- oder Reifestufenfreigabe. CQR-001 bleibt in allen vier betroffenen Scopes wegen anderer Befunde `fail`. Nach dem Zyklusentzug läuft das zuvor blockierte G17 erstmals und meldet für Griechisch/Chinesisch/Französisch 172/201/141 Befunde; G16 verbleibt bei 130/140/96. Die Gesamtübersicht enthält weiterhin 491 G01a-Diagnosen, 503 G16- und 2881 G17-Befunde. Diese werden nicht als akzeptierte Baseline behandelt.

Die gelesenen englischen Orientierungstexte verlangen außerdem noch ein Erklären der Relevanz und des Kompetenzzuwachses. Das passt nicht zur expliziten deutschen Interessenwahl und bleibt als separater bestehender Textbefund festgehalten. Der Graphvorschlag korrigiert oder qualifiziert diese Texte nicht stillschweigend.

Vor einer tatsächlichen Anwendung braucht der konkrete Fünferkandidat einen getrennten Gegenblick und die üblichen Integrationsprüfungen. Die Gleichheit aller anderen atomaren Nachfragen berechtigt nicht zu einem Hashrefresh bestehender D/P-, Typ-, Quellen- oder sonstiger Reviews. Es gibt keine neue Ausnahme, kein automatisches Kantenreduktionsverfahren und keine Änderung von Mastery oder gespeicherten Ergebnissen.
