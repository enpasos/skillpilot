# Aktuelle A5-Bindung mit tatsächlich freigegebenem K4 V3

Die aktive semantische Physikdatei verweist jetzt auf diese neue Belegedition:
873 einzelne Entscheidungen, davon 26 `required`, 132 `children` und
715 `notRequired`. Die 24 L-Verbraucher bleiben dieselben; hinzu kommen das
Pfeilziel und das tatsächlich angenommene K4. Der alte Intermediate-Beleg und
alle darin gebundenen Nachweise bleiben byteidentisch erhalten.

K4 ist `practiceAssessment`. Der vorhandene erlaubte Basiswert
`reviewed-current-pilot-practice-assessment` wird wie bei K3 verwendet; das
geschlossene Schema wird dafür nicht erweitert. Die neue Einzelentscheidung
bindet die wirkliche V3-Freigabe `7a16c98d…`, beide vollständigen unabhängigen
Markierungen, die Autorenvergleichswerte und das freigegebene Zielobjekt.
Materialisierungsprüfungen vergleichen beide aktuellen Fingerprints des
kanonischen K4 mit diesem tatsächlich freigegebenen Objekt.

Für `4ca83b3f` und `d61ea362` sind die exakt aktuellen deutschen und englischen
Beschreibungen einzeln gebunden. Die Grundlage ist die ausdrückliche
Ownerentscheidung von 06:41 CET zusammen mit den tatsächlich vorhandenen
Erstrundenbefunden und dem aktuellen Wortlaut. Ihr Marker bleibt `required`,
ebenso ihr bestehender Pfeilpfad. Das behauptet weder eine noch ausstehende
Bestätigung der endgültigen Beschreibungen noch eine D-Nachfolgeraktivierung.
Diese Inhaltsnachweise werden im eigenen Qualitätsstrang abgeschlossen.

Die aktive Zielbild-QA verwendet die getrennte Edition
`rule/quantity-label-v2/`. Sie enthält 526 Bilder: 7 angenommen, 418 nicht
betroffen und 101 ausdrücklich offen, darunter unverändert die 88 alten
Größenpfeilbilder. Die beiden alten Bilder zu Feld-/Videopfeilen bleiben
`undecided`; diese Lieferung nimmt keine A3-Reparatur oder -Freigabe vor.
K4s SVG-Aufgabenreize gehören zur eigenen Aufgaben-/Materialprüfung und
vergrößern den Zielbild-QA-Scope nicht.

Die Vor-/Nach-Dateien sind exakte komprimierte Abbilder der aktiven Register.
`current-fingerprint-bindings.actual.json` nennt die endgültigen nativen und
A5-Contract-Fingerprints. `historical-rule-integrity.actual.json` vergleicht
alle früheren Rule-Artefakte direkt mit dem Commit `fd273a9cab`.

```bash
cd app
./node_modules/.bin/tsx ../curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/rule/final-k4-v3/prepare-inputs.mts
./node_modules/.bin/tsx scripts/materializePhysicsDirectedQuantityArrowSemantics.ts --configuration=curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/rule/final-k4-v3/projection-inputs.actual.json --check
./node_modules/.bin/tsx scripts/materializePhysicsDirectedQuantityArrowQa.ts --configuration=curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/rule/quantity-label-v2/projection-inputs.actual.json --check
```

Die Materialisierer verweigern eine abweichende Ausgabe auf bereits vorhandene
Belegpfade. Weitere sachliche Änderungen brauchen neue Eingaben und eine neue
Belegedition. Diese lokale Bindung ist keine abgeschlossene Integration auf
`main` und kein Nachweis einer erfolgreichen CI.
