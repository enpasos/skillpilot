# Endliche Arbeitsliste für die gesamte Gymnasium-Mathematik

Die [maschinenlesbare Arbeitsliste](../../curricula/DE/Gymnasium/learning-units/authoring/mathematics-queue.json)
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

Die Erzeugung liest den festgehaltenen Basiscommit und PR-79-Materialstand nur
über Git-Blobs. Sie ändert weder Aufgaben noch Learnerdaten oder Curriculumziele.
S4 bleibt offen, bis sämtliche ursprünglichen Targets, eigene Prüfungen und
Kartenpflichten samt gerechtfertigten neuen Prüfungen in den tatsächlichen
Angebotswegen abgenommen sind und die erforderlichen nativen, QA- und
Releaseprüfungen bestanden haben.
