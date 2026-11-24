# Fremdfach-Erwerbszeugen nach dem E.1-Zuschnitt – 24. November 2026

Der aktuelle Vollabgleich erneuert **59 von 63 Quellenpins**, ohne eine der
**1.036 Policy-Zeilen** zu ändern. Alle 47 Mathematikatome, 69 zugeordneten
Mathematikansichten, frühesten Physikverbraucher, Verbraucherorte, Kontextlisten
und sämtliche Kanten der hinterlegten Vorbereitungspfade bleiben erhalten.
Die 100 Mathematikansichten und die kanonische Mathematik sind byteidentisch
zum Belegstand vom 23. November. Die 15 regulären Mathematik-Zielplätze und
1.021 explizit markierten bedingten Erwerbsplätze sind erneut geprüft.

Grundlage ist `aa5ac41808a97c6f7ca1c2886382a4a98b61693b`; Vergleichsstand ist
`8df38a054a15a6c3fc4036c35324c277bf68f628`. Das Verfahren folgt dem
[lesenden Vollabgleich vom 23. November](../../2026-11-23/math-foreign-acquisition-current/verify-current-policy.py).
Dessen Dateien und Beobachtungshashes bleiben unverändert. Auch die
Pin-Erneuerungen in `c8d12f1cc79a9463c759b188347ae163e5b0b32b` und `8df38a054a…`
sind nachgerechnet: jeweils ausschließlich sechs hessische Quellenpins,
keine Änderung einer Policy-Zeile.

## Eingaben und unveränderte Policy

[recheck.actual.json](recheck.actual.json) enthält die vollständigen Vorher-/Nachher-Hashes
aller 263 gelesenen Eingaben und Prüfgrundlagen. 202 sind unverändert; verändert
sind ausschließlich die kanonische Physik, 59 gebundene Physikansichten und
die 59 erneuerten Werte in `currentPhysicsSourcePins`. Die übrigen 20
kanonischen Fachdateien, alle gelesenen Mathematik-Mappings und zugehörigen
Quellenextraktionen, die Autoritäts- und Platzierungskonfigurationen sowie
Generatoren und Tests sind unverändert. Die Dateiinventare für den
kanonischen Katalog, die Mathematikansichten und die eingelesenen
Mathematik-Quellenmappings sind ebenfalls gegen den Vergleichsstand geprüft.

Jede der 1.036 Zeilen wird einzeln an die aktuelle kanonische Kette, den
nativ bestimmten frühesten Verbraucher und den tatsächlichen
Mathematik-Ziel- beziehungsweise Erwerbsplatz gebunden. `policyRowChanges`
ist leer. Die historischen Felder `actualWitnessSha256` und
`actualNativeViewsSha256` bleiben erhalten. Dies ist eine aktuelle
Nachprüfung der behaltenen Zeugen; sie behauptet keine Wiederholung der
historischen Backend-Sitzung und keine vollständige neue Fachabnahme aller
veränderten Physiktexte.

## Zwei ausdrücklich begrenzte reale Änderungen

Die frühere globale Behauptung „alle Physik-Mathematik-Vorbereitungsmengen
unverändert, kein Physikziel entfernt“ wäre heute falsch. Der Nachfolger
benennt und prüft stattdessen genau diese beiden Änderungen:

1. **RP Sek I:** Bei exakt denselben 143 Physik-Ziel-IDs sinkt die
   Mathematik-Vorbereitungsmenge von 88 auf 85. Es entfallen ausschließlich
   `19f170e4-b88f-4c06-b72a-ce6923748bb4` (räumliche Vektortupel),
   `94b48b93-473f-4bc5-8c93-8c1a5e2cd1a6` (Orts-/Verschiebungsvektoren) und
   `c63bbffd-8d1c-5fe2-a428-db194e6fe592` (Vektoraddition/-subtraktion).
   Ihr einziger damaliger Verbraucher war `dfd2628f…` über
   `89a8cf15… → 68c90ba6… → c63bbffd…`. Im PO-Zuschnittcommit
   `42af44fbc3297e64ecd271df7c8e0dc1559f956d` wurde gerade die Kante
   `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2 → 68c90ba6-c438-463c-9a53-cf61062d416a`
   entfernt. Waagerechter Wurf als getrennte Orts-/Zeitbewegungen benötigt
   für die bestehende Datenaufgabe keine räumliche Vektoraddition oder
   Bezugssystemtransformation. Die eigene Geschwindigkeit-/Vektorleistung
   bleibt im separaten Atom `0fee53f2…` mit seinem Vektor-/Bezugssystemzweig.
   Die tatsächlich durchgeführten DFD-Vorbereitungsreviews erklären dies
   ausdrücklich; Runde B hält fest: „No additional vector or practical-video
   prerequisite is needed for the task as written.“ Siehe die
   [ursprüngliche Runde A](../../../../curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/round1/round-a/response.json)
   und [Runde B](../../../../curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/round1/round-b/response.json),
   jeweils `dfd2628f…/fullPreparationReview`. Diese Runden verlangten lokale
   Aufgaben-/Bewertungskorrekturen; sie werden hier ausschließlich als
   tatsächlich abgegebene Aussagen zur Vorbereitung zitiert, nicht als
   pauschale Annahme des damaligen Aufgabenstands.
   Keines der drei Mathematikatome besitzt vor oder nach der Erneuerung
   überhaupt eine Fremderwerbs-Policyzeile. In den vorhandenen beiden
   RP-Sek-I-Mathematikansichten bleiben alle drei reguläre `target`-Atome.
   Daher entsteht keine neue oder zu löschende Fremderwerbsroute, und keine
   bestehende Mathematik-Zielpflicht wird entfernt. Die unveränderte amtliche
   Zuordnung dieser Mathematikziele wird hier nicht neu fachlich zertifiziert.
2. **Historische freiwillige MP-Prüfung:** In genau 24 effektiven Zielplätzen
   innerhalb der 63 gebundenen Physikansichten wurde ausschließlich
   `2b9e565f-d9b4-5e23-b5b7-b7977cecff06` entfernt. Dies ist die ausdrücklich
   entschiedene Archivierung ohne Nachfolger aus
   `d7d1759bd0c29e102360d0add0faf712b4352dd9`. Alle 24 Ansichten werden
   einzeln aufgeführt. Ihre Mathematik-Vorbereitungsmengen ändern sich dadurch
   nicht. Die alte Aufgabe und der alte Vertrag bleiben erhalten; diese
   Pin-Erneuerung erzeugt weder einen Nachfolger noch eine Anrechnung.

Die übrigen **62 von 63** Mathematik-Vorbereitungsmengen sind identisch.
Die sechs zusätzlichen Ziel-IDs betreffen die vier getrennten E.1-Atome
sowie die bereits vorhandenen Angebote NVX und FFX. Alle 223 hinzugekommenen
effektiven Plätze und 139 Ortsänderungen gehaltener Ziele werden einzeln
angegeben. Daraus folgt keine neue Policy-Zeile: Die vorhandenen frühesten
Verbraucher und sämtliche hinterlegten Vorbereitungspfade bleiben gültig.

## Reproduktion und Grenzen

Aus dem Repository-Root mit den vorhandenen Abhängigkeiten:

```sh
node --import ./app/node_modules/tsx/dist/loader.mjs contracts/stage-plan-review-evidence/2026-11-24/math-foreign-acquisition-current-v2/native-rp-closure.mts
python3 contracts/stage-plan-review-evidence/2026-11-24/math-foreign-acquisition-current-v2/verify-current-policy.py
PYTHONPATH=scripts python3 -m unittest scripts.test_mathematics_foreign_acquisition_policy scripts.test_mathematics_stage_views.MathematicsStageViewsTest.test_foreign_acquisition_policy_has_current_atomic_witnesses
```

Die native Gegenprobe wurde von `/root` unabhängig geschrieben und verwendet
die tatsächlichen TypeScript-Normalisierer und den Rollenprojektor der App.
Die hier lesbar übertragene Fassung hat relative Repo-Imports und schreibt
[exakt dieselben Ergebnisse](native-rp-closure.actual.json). Sie prüft beide
vollständigen kanonischen Katalogstände und zählt für jedes weggefallene Atom
alle damaligen und heutigen Verbraucher. Die Python-Prüfung traversiert den
vollständigen atomaren `requires`-Graphen eigenständig und vergleicht dagegen.

[focused-checks.actual.json](focused-checks.actual.json) bindet die tatsächlich
ausgeführten Endläufe, Ausgaben und die verwendeten nativen Laufzeithelfer.
Die sechs fokussierten Tests bestehen. Der vollständige Math-duration-CI-Job
liegt beim koordinierenden Agenten und wird hier nicht vorweggenommen.
Keine Quellen, historischen Belege, Floors, Gates oder Tests wurden verändert.
