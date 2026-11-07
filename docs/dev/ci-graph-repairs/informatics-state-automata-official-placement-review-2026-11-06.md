# Informatik: tatsächliche Herkunft der Zustandsautomaten-Platzierung

**Die heutige Q2-Zuordnung der hierarchischen/parallelen Zustandsautomaten ist
nicht durch die überprüfte amtliche HE-Passage belegt.** Dies ist ein lesender
Quellenbefund, keine Curriculumänderung oder neue Mappingfreigabe.

HE-KC2024 behandelt in Q2.1 ER-/Relationenmodelle, erweiterte Beziehungen und
Normalformen. Einfache lebensweltliche Zustandsautomaten stehen in der
Q3-Einleitung und Q3.2. Die volle Hierarchie-/Parallelitätsvertiefung ist auch
dort nicht ausdrücklich vorgegeben. Deshalb ist weder die jetzige exakte
Q2-Zuordnung noch eine automatische neue exakte Q3-Zuordnung von `875cb53c`
gerechtfertigt. [Amtliches KC2024, S.37 und S.39–40](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-informatik.pdf)

Der [gehashte Vergleich](informatics-state-automata-official-placement-review-2026-11-06.json)
bindet den vorhandenen lokalen PDF-Stand 01.08.2025 (`af0234cb…`) und den am
6. November von der amtlichen URL gelesenen anderen PDF-Stand (`041053cd…`).
Die relevanten beiden Themenabschnitte stimmen nach bloßer Leerraum-/Trennzeichen-
Normalisierung exakt überein. Es wird keine Byteidentität der ganzen Dokumente
behauptet; der lokale Bestand wurde nicht ersetzt.

Das heutige HE-Mapping erklärt sich dagegen vollständig aus dem alten
authored JSON: Die Extraction nennt selbst die Umwandlung eines Source-Snapshots
als Methode, markiert die Ziele als `sourceSnapshotGoal` und führt den internen
Verweis `Q2.1.117`. Der alte Review begründet seine Entscheidung allein mit
der Übernahme des Seed-Mappings. Diese Angaben sind kein amtlicher PDF-Beleg
für den zusätzlichen Lerninhalt. Die historischen Bytes bleiben unverändert.

Der Fehler betrifft mehr als das `requires`-Array. Das HE-View platziert
`875cb53c` ausdrücklich in der Q2-Gruppe; kanonisch liegt es unter Q2.1.
Die bestehende Q2-Prüfung `0df1bedd` verlangt und deklariert es außerdem unter
ihren 41 Kompetenzen. Eine bloße Phasekorrektur oder Verschiebung in den Baum
würde diesen Prüfungsvertrag nicht reparieren.

Fachlich bleibt die bestehende einfache Automatenkompetenz `7ad8caf0` die
passende Vorbereitung für die Vertiefung. Eine Zuordnung der unveränderten
Vertiefung zu Q3 ist als eigene didaktische Ergänzung plausibel. Vor einer
Anwendung sind aber deren tatsächliche Angebotsrolle, alle Target-/Fokusfolgen
und die vorhandene Q2-Prüfungsbedeutung ausdrücklich aufzulösen. Die 41er-Coverage
darf nicht still verkleinert werden; alte Prüfungsergebnisse, Goal-ID und
Kompetenzbedeutung bleiben erhalten. Ein neuer Quellenreview braucht echte
Passagen und darf den alten Exact-Review nicht umetikettieren.

Kein `GLOBAL`-Ausweg, keine GVR-002-Ausnahme und keine Einheitenzerlegung.
Dieser offene Folgeblock gehört nicht zu den eingefrorenen 39 Änderungen.
Andere regionale Mappings werden durch diesen engen HE-Befund weder bestätigt
noch entzogen.
