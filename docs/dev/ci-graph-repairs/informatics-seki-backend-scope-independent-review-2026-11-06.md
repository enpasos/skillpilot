# Unabhängiger Backend-Zielsetreview: Informatik Sek I

Der fehlgeschlagene NI-Wert `22 statt 21` ist eine veraltete Testfixture nach der bereits genehmigten 39+166-Korrektur. Es geht um die Sichtbarkeit eines Kartenknotens; kein gewöhnliches Lernziel wurde entfernt. Die spätere 26er-Reparatur ändert keines der hier geprüften Zielsets.

Der tatsächliche Test enthält **56 Scopezeilen**, nicht die zuvor nur angenommene Zahl 58: Informatik14, Latein15, Politik und Wirtschaft13, Wirtschaft14. Je G8/G9 ergeben sich **112 Anfragen je Kontext**. Die nativen Adapterläufe von ci_static wurden getrennt auf Info5921 (vor39), Info93a (nach39+166) und Infof95 (nach26) ausgeführt. Die übrigen Eingaben sind in allen drei Prozessen derselbe aktuelle, schreibgeschützte Runtimebaum; dies sind kontrollierte Ein-Datei-Vergleiche und keine vollständigen historischen Repositorywiederherstellungen.

Ich habe unabhängig den echten Testhelper, die 112 Konfigurationen, den Java-Harness und die Produktionszählung gelesen und alle **336 archivierten Ergebniszeilen** mit eigenen Python-Mengenvergleichen geprüft. Wichtig: Das betroffene Responsefeld benutzt `computeAtomicStats(projection.visibleGoals(), targetGoalIds, mastery)`. Die native Messung ruft genau diesen Helfer auf; die sichtbaren gezählten IDs werden mit dem echten Typprädikat ermittelt und gegen dessen Zahl geprüft. Strukturelle Planungsatome sind zusätzlich separat dokumentiert. In diesen konkreten 336 Zeilen sind beide Mengen gleich; diese Gleichheit wird nicht allgemein unterstellt.

| Land | G8 und G9 vorher | G8 und G9 nachher | Tatsächlicher Zielunterschied |
| --- | ---: | ---: | --- |
| HH | 22 | 22 | Datenbankkarten ca246 entfallen; Sprachkarten dbad kommen hinzu |
| NI | 22 | 21 | ausschließlich Datenbankkarten ca246 entfallen |
| NW | 20 | 19 | ausschließlich Datenbankkarten ca246 entfallen |
| RP | 18 | 17 | ausschließlich Datenbankkarten ca246 entfallen |
| SH | 27 | 26 | ausschließlich Sprachkarten dbad entfallen |
| SN | 29 | 28 | ausschließlich Datenbankkarten ca246 entfallen |

`ca246` ist vollständig `ca2469f3-3712-5d92-ae7c-ee61d8607efa`, „Lernkarten – Datenbanken und Relationen“. `dbad` ist `dbad1333-5783-57b5-8715-92d725f5c303`, „Lernkarten – Formale Sprachen“. Beide sind ausdrücklich Memory-Knoten. Die fünf betroffenen Zahlenerwartungen sind veraltet; HH beweist, warum eine Zählung allein die fachliche Änderung nicht erfasst.

Die 5921-Basis erfüllt alle 112 ursprünglichen Totals. Zwischen5921 und93a ändern sich genau zwölf Mengen (sechs Länder × zwei Dauermodelle), davon zehn Zahlen. Die übrigen100 Mengen bleiben vollständig gleich. Kein gewöhnlicher Target geht verloren, keine `prerequisiteOnly`-Menge und keine Viewauswahl ändert sich. Latein, Politik/Wirtschaft und Wirtschaft bleiben vollständig gleich. Zwischen93a undf95 bleiben alle112 Target-/Support-/Zählmengen exakt gleich.

Die Herkunft wurde konkret geprüft: Die Datenbankkarten hängen über die bestehenden Memory-Reviewzeilen an `1eb09d02…` (komplexe ER-Kardinalitäten), `56e5edb6…` (weitere relationale Operatoren) und `fdfa87be…` (Grundoperatoren). Ihre alte NI-Mitgliedschaft beruht in den gebundenen nativen Compilerbelegen auf `requires-closure` über die inzwischen korrigierten Ganzprüfungsbrücken, nicht auf einer eigenständigen NI-Mappingevidenz. Nach deren Entfernung entfällt auch diese abgeleitete Memory-Sichtbarkeit. Die Sprachkarten beziehen ihre Sichtbarkeit aus `c6fcb2d9…` (Grammatiken/BNF) und `cdb24f8f…` (formale Sprache); der neue engere Sprach-/Grammatikpfad begründet HH, während die allein inzidentelle SH-Mitgliedschaft entfällt. Ein Mapping mit Kennzeichnung `partial` wird nicht nachträglich zur amtlichen Vollabdeckung erklärt. Memory-Origin und Requires-Evidenz sind hier Sichtbarkeit, keine neue Quellendeckung.

Die vollständigen aktuellen und alten Definitionen, fünf unveränderten Memory-Reviewzeilen, neun Datenbankkarten und sechs Sprachkarten wurden gelesen und sind im [JSON-Beleg](informatics-seki-backend-scope-independent-review-2026-11-06.json) mit den tatsächlich verwendeten Compilerbelegen gebunden. Deck- und Reviewbytes sind gegenüber der 5921-Basis unverändert. Es gibt keine neue Kartenleistung, Masteryübernahme, Ergebnisumdeutung oder Scopepolitik.

Die enge Fixturekorrektur darf die fünf konkreten Totals ändern und sollte beide Memory-Mitgliedschaften explizit prüfen, einschließlich des HH-Tauschs bei gleicher Zahl. G8/G9, aktive Filter und der echte HTTP-/State-Test bleiben erhalten. Der hier geprüfte reine Adapter liest keinen gespeicherten Learner-/Masteryzustand und beweist für sich noch keinen grünen Spring-/HTTP-Integrationstest; diesen führt ci_static getrennt aus. Keine Produktions-, Quellen-, View- oder QA-Änderung wurde durch diesen Review vorgenommen.

Die [archivierten nativen Resultate](backend-m6-scope-native-2026-11-06/storage-inventory.json) sind deterministisch komprimiert, mit komprimierten und rohen SHA256-Werten gebunden und von mir nochmals bytegenau gegen die Originalresultate verglichen. Lesender Replay ohne Java oder Quelldatenänderung:

```bash
python3 -B docs/dev/ci-graph-repairs/verify_informatics_seki_backend_scope_review.py
```

Das ist ein endlicher Herkunfts-/Zielmengenreview dieses Fehlers. Er behauptet keine Freigabe sämtlicher 518 Normpflichten, keine Inhaltsfreigabe der generischen Prüfungen und keine neue Reife-/P-/M6-Abnahme.
