# Endliche Arbeitsliste für die gesamte Gymnasium-Mathematik

Die [maschinenlesbare Arbeitsliste](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/learning-units/authoring/mathematics-queue.json)
verfolgt alle **807 ursprünglichen curricularen Kompetenz-IDs** einzeln. Die
ursprünglichen **978 atomaren Targets** und zusätzliche neue Prüfungs-IDs bleiben
getrennt. Grundlage sind die [182 tatsächlichen Einstiegskonfigurationen](learning-units-mathematics-offering-inventory.md).
Eine gelistete Aufgabe oder ein vorhandener `requires`-Pfad ist noch keine
freigegebene Anerkennung.

Die begrenzten Arbeitspakete umfassen 210 fachliche Kandidatcluster, 74 Ziele mit
mehreren direkten kanonischen Eltern und sechs bestehende Kartenziele mit
insgesamt 64 Karten. 282 Kompetenzen haben noch keine explizite vorhandene
Prüfungsclaim-Metadatenzuordnung. 498 Kompetenzen besitzen in mindestens einem
angebotenen Scope keinen sichtbaren Prüfungsconsumer; diese beiden Fehlermengen
überschneiden sich. Sie werden nicht addiert und bedeuten nicht, dass pauschal
282 oder 498 neue Aufgaben erforderlich sind.

Alle 807 Kompetenzen besitzen eine endliche Autorenroute. 17 zunächst keinem
dieser fachlichen Cluster direkt zugeordnete Ziele wurden ausdrücklich auf
fünf bestehende Pakete und ein kleines Restpaket zur Kegelvolumenherleitung
verteilt. Damit gibt es 211 Routingpakete bei unverändert 210 ursprünglichen
Kandidatclustern. Diese Zuordnung verändert weder `contains`, Erwerbsownership
noch eine Inhaltsfreigabe. Die konkrete Zuordnung steht in
`app/scripts/config/learning-units/math-authoring-routing.json`.

Jeder Zieleintrag nennt Kandidatpakete, tatsächliche Erwerbsplatzierungen,
gebundene Verträge, native Angebotsscope-Indizes und Kandidatprüfungen mit
Aufgaben-/Rubrikdigest. Der Status trennt bereits gebundene Inhaltskandidaten
von der noch ausstehenden integrierten Abnahme. Die Liste enthält keine
Schätzung des Gesamtfortschritts und erklärt kein unbearbeitetes Ziel für fertig.

Die konkrete Reihenfolge beginnt mit dem engen Skalarproduktvertrag, danach
Prismenvolumen/-oberfläche und Monotonie/Extrema. Anschließend werden die übrigen
Kandidatpakete anhand ihrer tatsächlichen Aufgaben, normalen Bestehensmuster,
Recallpflichten und nativen Targetmasken bearbeitet. Cluster sind dabei keine
automatisch freigegebenen Lerneinheiten; Kalenderknoten bleiben Platzierungen.

Aus PR #79 sind genau 74 zusätzliche Aufgabenmaterial-Kandidaten inventarisiert:
39 neue Prüfungsidentitäten sowie Aufgaben aus 35 gewöhnlichen Zielen, deren
Kompetenz-IDs erhalten bleiben. Die letzteren Aufgaben benötigen eine eigene
Prüfungsidentität; vorhandene gewöhnliche Ergebnisse werden dadurch nicht zu
Prüfungsergebnissen. Die 163 vorhandenen tatsächlichen Prüfungen bleiben die
Ausgangsbasis. Übersetzte Varianten sind gesondert zu binden und zu prüfen.

Eine Einheit braucht eine verständliche Zusage, eindeutiges Own, passende eigene
Q/K, geprüfte Pflichtkinder und nachweisbare Abdeckung in jedem passenden Angebot.
Ein Elternexamen ersetzt keine Kinderprüfung oder Recallpflicht. Breite Decks
werden nicht als bloßer Support umetikettiert, um kleinere Einheiten abzuschließen.

```bash
cd app
npx tsx scripts/learningUnitsMathAuthoringQueue.ts
npx tsx scripts/learningUnitsMathAuthoringQueue.ts --check
```

Neue Inhalte werden gemeinsam mit dem generischen Batchmaterializer vorbereitet:

```bash
npx tsx scripts/learningUnitsMathBatchAuthoring.ts --batch <batch.json> --plan
npx tsx scripts/learningUnitsMathBatchAuthoring.ts --batch <batch.json> --apply
npx tsx scripts/learningUnitsMathBatchAuthoring.ts --batch <batch.json> --check
```

`--plan` schreibt ausschließlich Kandidaten und vollständige Reviewinputs unter
`tmp/math-learning-units/batches/`. `--input-root` kann vorbereitete, noch nicht
live geschriebene Curriculuminputs beisteuern. Der Materializer erzeugt keine
Reviewfreigabe. `--apply` verlangt pro Paket einen tatsächlichen unabhängigen
Receipt mit `semantics=learning-unit-content-review-v1`,
`decision=approved`, benanntem Reviewer, `reviewedInputSha256` und passendem
`reviewPath`. Der Inputdigest bindet Own, feste Zielbedeutungen, Arten, das
vollständige lokale R, Claims, unveränderte normale Aufgaben und Rubriken,
lokale D-Klassen und Provenanceinputs. Änderungen verlangen erneutes Review.

Ein Batch teilt einen eingefrorenen vollständigen Quellensnapshot, eine
Artenledgerkopie und physische Viewquellen. Bestehende Vertrags-/Task-/Quellenbytes
werden geprüft und nicht neu erzeugt. Korrekturen an `requires` müssen nach
jeder einzelnen entfernten Kante die gesamte atomare Erreichbarkeit erhalten.
Neue Prüfungen bekommen neue Identitäten; alte gewöhnliche Zielbedeutungen und
normale Bewertungstoleranzen bleiben erhalten. Recall und übersetzte Aufgaben
benötigen ihre eigenen tatsächlich geprüften Bindungen; der erste Emitter
weist diese Fälle bis zur Aufnahme des entsprechenden Adapters ausdrücklich ab.

Die aktuelle Angebotsauswahl ist ein separater Generatorlauf:

```bash
npx tsx scripts/learningUnitsMathOfferBindings.ts --prepare
npx tsx scripts/learningUnitsMathOfferBindings.ts --stage
npx tsx scripts/learningUnitsMathOfferBindings.ts --apply
npx tsx scripts/learningUnitsMathOfferBindings.ts --check
```

`--prepare` schreibt nur private Kandidaten. `--stage` prüft den tatsächlichen
unabhängigen Offerreceipt und schreibt den Binder samt kleinem Nachweis, ohne
den Katalogzeiger zu aktivieren. `--apply` aktiviert den geprüften Zeiger erst
im ausdrücklich koordinierten Runtime-/Producercheckpoint. Der Binder enthält
alle 182 nativen Scopekeys und ausschließlich statisch genannte Roots; leere
partielle Zeilen sind gültig. Seine benötigten aktuellen Runtimeinputs sind
von den umfangreichen proof-only Nativeinputs getrennt. Alte Inhaltsverträge
und globale Anerkennung werden durch eine neue Angebotsgeneration nicht
umgeschrieben.

Die Erzeugung liest den festgehaltenen Basiscommit und PR-79-Materialstand nur
über Git-Blobs. Sie ändert weder Aufgaben noch Learnerdaten oder Curriculumziele.
S4 bleibt offen, bis sämtliche ursprünglichen Targets, eigene Prüfungen und
Kartenpflichten samt gerechtfertigten neuen Prüfungen in den tatsächlichen
Angebotswegen abgenommen sind und die erforderlichen nativen, QA- und
Releaseprüfungen bestanden haben.
