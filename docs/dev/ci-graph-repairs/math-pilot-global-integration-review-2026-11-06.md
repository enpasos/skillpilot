# Mathematik-Pilot: globale Wirkungsprüfung vom 6. November 2026

Die beiden getrennt geprüften Pakete für [Karten](math-memory-prerequisites-review-2026-11-06.md) und [Arithmetik](math-arithmetic-prerequisites-review-2026-11-06.md) sind zusätzlich gemeinsam auf dem vollständigen 21er-Katalog mit 6.524 Goals geprüft. Grundlage ist Commit `42e62121a991e29c108b85a1ffa81f50ff1a5e63`. Es wurde kein aktiver Graph, Reviewrecord oder Lernzustand geändert. Der [lesende Replay](verify_math_pilot_repairs.py) prüft die unabhängig gebundenen zwölf Operationen, exakte Ausgangsarrays und Goalhashes. Sein [Ergebnis](math-pilot-global-hypothetical-proof-2026-11-06.json) enthält jede einzelne tatsächliche Nachfragedifferenz und die verbliebenen Zeugen nach jeder Normalisierung.

| Hypothetische Stufe | geänderte Arrays | geänderte Goal-Closures | geänderte atomare Closures | zusätzliche fremde Goal-/Atom-Closures |
| --- | ---: | ---: | ---: | ---: |
| Karten allein | 4 | 3 | 3 | 0 / 0 |
| Arithmetik allein | 2 | 570 | 564 | 142 / 136 |
| Beide Pakete | 6 | 570 | 564 | 142 / 136 |

Die vollständigen lokalen Mathematikdifferenzen entsprechen exakt den zuvor einzeln geprüften 3/3 beziehungsweise 428/428 Mengen. Die zusätzliche globale Wirkung betrifft ausschließlich Physik. In den 142 Goal- und 136 atomaren Physikmengen entfällt jeweils ein Teil der bisher über die mathematische Grundoperation geerbten Vorbereitung; keine fremde Voraussetzung wird ergänzt. Die sechs betroffenen Mathematikkompetenzen sind additive Gleichungen, Anwendung der Rechengesetze, Unbegrenztheit natürlicher Zahlen, Dezimalsystem, allgemeine Integeraussagen mit Gegenbeispielen sowie Runden natürlicher Zahlen.

**Diese fremden Verluste sind noch keine fachlich freigegebene Korrektur.** Beispielsweise muss ein Physikziel mit eigener Rundungs- oder Gleichungsumstellungsleistung weiterhin seine tatsächlich erforderliche Grundlage haben. Ob dazu gezielte explizite Physikvoraussetzungen nötig sind, wird anhand der betroffenen Zieltexte geprüft. Ein zufälliger alter Umweg über überbreite Multiplikationsvoraussetzungen ist keine dauerhafte Begründung dafür. Die Einzeldatei markiert die fremden Differenzen ausdrücklich als nicht inhaltlich freigegeben.

Nach jeder der sieben Normalisierungen bleiben sämtliche globalen Goal- und atomaren Closures exakt gleich, auch im gemeinsam korrigierten hypothetischen Graphen. Alle übrigen Goalfelder und Landschaftsmetadaten bleiben gleich. Mathematik beteiligt sich weder vorher noch nachher an einem globalen zyklischen Bestandteil. Drei bereits vorhandene fachfremde zyklische Bestandteile bleiben als offene Fehler sichtbar; ihre Existenz wird nicht als gültige Baseline akzeptiert.

Die getrennte [QA-Bindungsanalyse](math-pilot-qa-binding-impact-2026-11-06.json) und die [Buchfolgenanalyse](math-pilot-book-impact-2026-11-06.json) bleiben zusätzliche Anwendungsvoraussetzungen. Weder der Closurebeweis noch die kleinen Reparaturpakete ersetzen sechs aktuelle Klassifikationsentscheidungen, die beiden tatsächlichen neuen D-/P-Kontexte oder eine frische Applicability-/Quellen-/Buchprüfung. Eine Wiederherstellung von Mathematik M7 wird nicht behauptet.

Der Replay schreibt hypothetische Ergebnisse innerhalb des Repositorys ausschließlich unter `tmp/`; direkte Ausgaben auf kanonische Quellen oder Dokumentation werden zurückgewiesen. Atomarer Dateiersatz schützt zusätzlich vorhandene historische Hardlinks. Die beiden tatsächlichen negativen Ausgabekontrollen bestehen.
