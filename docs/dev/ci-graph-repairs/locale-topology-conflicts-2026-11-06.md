# Mehrfachserialisierungen: tatsächliche Topologiekonflikte

Die aktuelle lesende Erhebung bestätigt **19 widersprüchliche logische Goals**
in acht Mannheimer Landschaften. Der [vollständige Zensus](locale-topology-conflicts-2026-11-06.json)
bindet alle 593 tatsächlich gelesenen Runtime-Landschaftsdateien außerhalb von
`quality` an ihre Rohbyte-Hashes: 56.171 serialisierte Goals, 56.024 logische
Owner-/Goal-Schlüssel und 147 zusätzliche Serialisierungen.

Verglichen werden `requires` und `contains` als aufgelöste Mengen. Owner bleiben
exakte Namensräume, UUID-Endpunkte werden wertbezogen verglichen. Qualifikation
wird geprüft; unqualifiziert hat der lokale Owner Vorrang, sonst muss der
Fremdowner eindeutig sein. Reihenfolge und zulässige UUID-Hexschreibweise erzeugen
keinen Scheinkonflikt. Die vollständigen tatsächlichen Kanten und Unterschiede
aller betroffenen Versionen stehen im Zensus.

Alle 19 Konflikte liegen zwischen den gleich benannten deutschen JSON-Dateien
unter `Uni_Mannheim/Bachelor_Jura` und `Uni_Mannheim/Rechtswissenschaft`.
Das sind keine bloßen Übersetzungsunterschiede. Beispielsweise enthält die
Zivilrecht-1-Fassung einmal 22 Goals einschließlich Haftung, die andere 26 Goals
mit anderem Modulumfang. Die Felder der tatsächlich kollidierenden logischen
Goals müssen an der autoritativen Programm-/Quellenentscheidung geklärt werden.
Weder Verzeichnisreihenfolge noch jüngeres Änderungsdatum beweisen diese Entscheidung.

**Die Befunde sind offen.** Der allgemeine G05-CLI prüft inzwischen eindeutige
Ownerauflösung; seine Identitäts-Deduplizierung bestätigt keine konsistente
Topologie mehrerer Versionen. Der neue Zensus fügt keine Ausnahme hinzu,
ändert keine Curriculumsdatei und behauptet kein bestandenes G01b-Gate.
Eine spätere Reparatur muss die tatsächliche Quell-/Programmautorität,
Referenzclosure und vorhandene Zustandsbindungen getrennt berücksichtigen.
