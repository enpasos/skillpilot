# Physik: Wiederaufnahme am 14. September 2026

## Auftrag und Ausgangsstand

Der Product Owner hat nach dem committeten
[Mathematik-/Physik-Meilenstein](math-physics-resumed-checkpoint-2026-09-13.md)
das aktive Ziel ausdrücklich auf **Physik** beschränkt und wieder aufgenommen.
Mathematik bleibt fachlich pausiert. Der aktuelle Auftrag verlangt weiter alle
fünf strengen Gates, aktuelle Nachweise, erhaltene gültige Reviews und M6.
Die bestehende Voraussetzung, zuerst die CI in Ordnung zu bringen, bleibt
verbindlich. Neue fachliche Pakete wurden in diesem Fortsetzungsschritt noch
nicht begonnen.

Ausgangscommit: `410db2501b34f513eadb305b26edf08f9227ddff` auf `main`,
`chore(curriculum): checkpoint math/physics QA progress and fix CI bindings`.
Die Arbeitskopie war beim Einstieg sauber.

Der erneut ausgeführte native Fünf-Gate-Check bestätigt:

| Fach | Streng vollständig | D | P | A | M | V |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Physik | 453/478 (94,8 %) | 453 | 477 | 478 | 478 | 478 |
| Mathematik, pausiert | 436/797 (54,7 %) | 436 | 436 | 797 | 797 | 797 |

`npm --prefix app run quality:deep-understanding-rollout:check` besteht mit
null blockierenden Problemen. Dieser Schritt erzeugt keine zusätzlichen
fachlichen Abschlüsse oder Freigaben; Nettozuwachs beider Fächer ist null.
Die Zahlen sind dieser geprüfte Stand, keine festgeschriebenen Zielnenner.

## CI-Voraussetzung: konkrete Berichtsdrift

Der [Push-CI-Lauf 34799729328](https://github.com/enpasos/skillpilot/actions/runs/34799729328)
für exakt diesen Commit hat den Vier-Bücher-Build bestanden. Die nachgelagerte
[Curriculum CI](https://github.com/enpasos/skillpilot/actions/runs/34799729328/job/103841361000)
scheiterte im Schritt `Check Goal Source Rationale Gap Issues`:
`goal-source-rationale-gap-issues.json` und die Markdown-Ableitung waren veraltet.
Der Fehler wurde lokal mit demselben Check reproduziert. Die unabhängig davon
laufenden Frontend- und Backend-Prüfungen sind inzwischen erfolgreich beendet.

Ursache: Der Quellenbegründungsreport wurde im Meilenstein bereits regeneriert,
seine nachgelagerten Berichte enthielten aber noch den früheren
`sourceReport.generatedAt`-Wert. Native Regenerierung erfolgt in dieser
Abhängigkeitsreihenfolge:

```bash
npm --prefix app run quality:goal-source-rationale-gap-issues
npm --prefix app run quality:goal-source-rationale-mapping-batch-01
npm --prefix app run check:goal-source-rationale-gap-issues
npm --prefix app run check:goal-source-rationale-mapping-batch-01
```

Die vier generierten Dateien unter `docs/qa-ci/status/` ändern ausschließlich
ihren Erzeugungszeitpunkt und den übernommenen Erzeugungszeitpunkt der Quelle.
Ein struktureller Vergleich beider JSON-Dateien gegen `HEAD` nach Entfernung
genau dieser beiden Felder bestätigt vollständige Inhaltsgleichheit:
56 Quellenlücken (25 mit belegten Geschwisterzielen, 31 isoliert) und
20 Mapping-Kandidaten bleiben erhalten. Die Markdown-Differenzen bestehen
ebenfalls nur aus diesen Zeitangaben. Keine Ziele, Quellenzuordnungen,
Reviewentscheidungen oder Prüflogik wurden geändert. Das ist eine mechanische
CI-Reparatur, keine Wiederaufnahme der Mathematik-QS.

Der lokale Check-Lauf ab der reparierten Stelle bis einschließlich M6 endete
mit Exitcode 0: beide Berichtschecks, Generated Notices und Status Registry,
Dokumentationslinks und Indexabdeckung, Terminologie, alle 297 Kompositions-
ansichten, Projection Roles, sechs Physik-Quellenmethoden-Routentests,
zehn Memory-Review-Konfigurationen, aktueller Curriculum-Status und alle neun
geschützten Reifegraduntergrenzen bestehen. Nach Aufnahme dieses Checkpoints
wurden die Dokumentationslinks (223 Dateien) und acht Indizes erneut geprüft;
`git diff --check` besteht ebenfalls.

Der Fix ist lokal; ein Commit, Push oder neuer erfolgreicher GitHub-Lauf für
diese Korrektur wird damit nicht behauptet. Am 14. September um 05:07 MESZ
waren alle vier Push-Workflows des ursprünglichen Commits beendet: 13 von
14 Push-Checks erfolgreich, ausschließlich der oben belegte Curriculum-Check
fehlgeschlagen. Frontend einschließlich Demo-Video-Prüfung und Backend sind
grün. Zeitgesteuerte Synthetic-Checks sind in dieser Push-Zählung nicht enthalten.
Remote `main` steht weiterhin auf dem genannten Ausgangscommit; es läuft keine
Push-Prüfung mehr, auf deren Ergebnis noch gewartet werden könnte.
Der lokale Folgecheck bis M6 ist kein vollständiger neuer Curriculum-CI-Lauf
einschließlich aller nachfolgenden Paket-Builds. Der Product Owner hat am
14. September den Commit und Push der sieben vorbereiteten Dateien freigegeben.
Die CI des daraus entstehenden Commits muss vor der fachlichen Fortsetzung
erfolgreich durchlaufen; die Freigabe ersetzt diesen Nachweis nicht.

## Vorbereitete Fortsetzungsroute, noch keine neuen Reviews

Die zentrale Registry und das In-flight-Ledger enthalten weiterhin genau
25 offene Physik-Claims in drei disjunkten Restconfigs (13 + 8 + 4).
Die Zuordnung aus den vorhandenen Reviews und Receipts ergibt:

| Vorhandene offene Arbeit | Ziele | Nächste Art der Prüfung |
| --- | ---: | --- |
| Geänderte Applicability-Kontexte | 9 | Tatsächliche Kontextänderung gegen bestehende Reviews prüfen; reine Länderreihenfolge nicht als neuen Quellenfehler ausgeben |
| Bereits präzisierte eigene Beschreibung | 4 | Zwei aktuelle unabhängige Reviews des endgültigen Texts und Kontexts |
| Geänderter Voraussetzungskontext | 4 | Betroffene Nachbar-, Seiten- und Evidenzbindungen gezielt prüfen |
| HRD mit geänderten Nachfolgern | 1 | Kontext der bereits aufgeteilten Nachfolger prüfen |
| Neue Dioden-/Exoplaneten-Split-Kinder | 5 | Eigene aktuelle D-Reviews; dokumentierte Bild-/Profilfragen getrennt beachten |
| Substantieller Atomizitäts-/Bilddissens | 2 | Konkrete Einwände klären; keine Schließung durch Mehrheitsentscheid oder Hashanpassung |

Diese Gruppierung stammt aus vorhandenen Unterlagen und ist kein neuer
Fachreview. Insbesondere belegt ein historisches Bildproblem nicht ungeprüft
den Zustand eines inzwischen geänderten aktiven Assets.

Der erste bereits konkret vorbereitete nächste Fall ist
`761a0879-fc15-5d0c-a2b7-2b439efecd5b` (Numerische Simulation von Bewegungen).
Sein bestehender
[informierter Audit](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-13/numerical-motion-informed-audit-20260914-v1.md)
weist eine echte Änderung des Voraussetzungstitels auf der gebundenen Seite
nach. Nach erfüllter CI-Voraussetzung ist ein aktuelles Einziel-D-Paket mit
zwei unabhängigen Runden vorgesehen. Zieltext, ID, gutes Bild und gültiges
P-Profil bleiben ohne belegten Änderungsbedarf erhalten. Die übrigen Ziele des
historischen D049-Pakets werden dadurch nicht erneut geprüft.

Beim Strömungsziel `333ca92b-a92c-46a9-86be-dea8ddbd43e0` ist der alte
RP-Seiten-/Auswahlsemantikfehler laut bestehendem Fluid-Implementation-Receipt
bereits repariert. Offen bleibt der davon getrennte D049-Dissens
`split_review`/`keep`; die Quellenreparatur ersetzt dessen Klärung nicht.

Historische Reviewartefakte bleiben unverändert. KI-Evidenz wird nicht als
menschliche Freigabe dargestellt. Runtime-, Datenschutz-, Sicherheits- und
Plugin-Verträge sowie private Klassen- und Lernendendaten bleiben unberührt.
