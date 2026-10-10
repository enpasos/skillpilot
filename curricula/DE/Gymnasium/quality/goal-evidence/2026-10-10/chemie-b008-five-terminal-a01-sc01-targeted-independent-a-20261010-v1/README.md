<!-- SPDX-License-Identifier: Apache-2.0 -->
# Chemie B008: gezielte unabhängige Prüfung A zu A01 und SC01

Dieser zusätzliche Prüfstand erhält die früheren Autorenpakete, A-Erstgutachten und deren Seals unverändert. Er prüft nur die korrigierte Hypothesenanforderung und die tatsächlichen Änderungen an den fünf vollständigen Aufgaben, Lösungen und operativen Bewertungsbeschreibungen des versiegelten SC01-Entwurfs. Unveränderte fachliche Materialien, neun Prozessziele, 21 historische Quellenoperatoren und ursprüngliche Klassifikationsbegründungen wurden nicht neu aufgerollt.

## Fachliche Entscheidungen

**A01 aufgelöst:** Werkstatt 4 verlangt jetzt für Rezeptorfall A und Enzymfall B jeweils eine eigene Hypothese mit Modellprüfung. Damit ist die Aufgabenanforderung zur unveränderten Zwei-Fälle-Rubrik passend.

**SC01 im Rubrik-/Summengate-Design aufgelöst:** Jeder vorhandene Bewertungsschritt nennt seine Pflichtdimensionen. Ist mindestens eine vollständig ausgelassen, erhält der gesamte Schritt null Punkte. Die jeweilige Bestehensgrenze liegt einen Punkt über der dann noch höchstmöglichen Summe. 86 unabhängig aus den aktuellen Beschreibungen abgeleitete Einzelauslassungen und 23 Ganzschritt-Auslassungen können bei korrekter Bewertung nicht bestehen. Fünf rein konstruierte vollständige, fachlich unvollkommene Beispiele zeigen weiterhin mögliches Bestehen mit ursprünglichen qualitätsbezogenen Teilpunkten; gleichwertige Alternativen bleiben erlaubt.

Die erste gezielte A01-Entscheidung und die erste aktuelle SC01-Entscheidung wurden jeweils versiegelt, bevor aktuelle B-Scoringbefunde bekannt waren. Die ältere Root-Diagnose der Summengate-Lücke war bekannt und ist ausdrücklich genannt. Die eigenen aktuellen Fälle wurden aus den tatsächlichen Aufgabenbeschreibungen, Punkten und dem selbst gelesenen aktuellen Java-Adapter abgeleitet.

## Beweisgrenzen und nächste Gates

Der Server prüft weiterhin einen gültigen Bewertungscapability-Nachweis und die übermittelte Gesamtsumme. Er erkennt fehlende tatsächliche Leistungen nicht selbst. Diese Prüfung belegt, dass rubriktreu berechnete Punkte bei einer ausgelassenen Pflichtdimension die bestehende Summengrenze verfehlen. Sie belegt keine automatische Leistungsbeobachtung, keine falschsichere Punkteübermittlung und keinen realen Hostablauf. Runtime, Adapter und Schema wurden nicht geändert.

Runtime-Schema, normale Curriculum-Symlinkprüfung und exakte Bindungen bestehen. Alle 512 übrigen Zielkörper bleiben identisch; die fachlichen Aufgaben-/Lösungskerne unterscheiden sich ausschließlich durch die geprüfte Bestehensformulierung. Alle 23 Beschreibungen erfüllen die bestehende Backend-Grenze von 2000 UTF-16-Einheiten; die längste hat 1171. Die 14 Rollenbegründungen bleiben erhalten, davon neun Fingerprints identisch; die fünf betroffenen Prüfungsfingerprints sind aktuell gebunden und weiterhin `practiceAssessment` empfohlen.

Ein tatsächlicher nativer 517-Ziele-Kontext mit aktuellen Anwendbarkeits-, Kompositions-, Quellen- und betroffenen Seitennachweisen steht noch aus. Die C11-Kurszuordnung bleibt HOLD, ohne GK/LK-Erfindung und mit `PSelected=false`; ein fachlich stimmiger Prüfungsentwurf klärt sie nicht. Aktuell bleiben alle fünf Prüfungen `needs_review`, CQR-202-Readiness ist nicht als bestanden behauptet, und es wurde keine Freigabe oder Aktivierung geschrieben. Eine spätere maschinelle Inhaltsfreigabe muss die bestätigten unabhängigen Nachweise und diese Kontext-/Scope-Gates enthalten und ihre Statusformulierungen wahrheitsgemäß aktualisieren. Menschliche Prüfung, Erprobung und Hostakzeptanz bleiben davon unabhängig.

Keine Bilder geändert, keine Lernendenleistung beobachtet, kein menschlicher Abschluss und kein aktiver M7-Zuwachs.

## Reproduktion

Aus der Repository-Wurzel:

```sh
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-five-terminal-a01-sc01-targeted-independent-a-20261010-v1/technical/verify_targeted_current_scoring.py
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-five-terminal-a01-sc01-targeted-independent-a-20261010-v1/technical/verify_current_semantic_recommendation_bindings.mts
```

Die Befehle prüfen gebundene Kandidaten und geben Prüfdaten auf stdout aus. Sie verändern keinen operativen Ziel-, Veröffentlichungs- oder Freigabestatus.
