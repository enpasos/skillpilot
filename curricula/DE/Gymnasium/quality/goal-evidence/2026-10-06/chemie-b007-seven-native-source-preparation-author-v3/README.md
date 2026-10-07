# Chemie B007: konkrete native und Quellenvorbereitung v3

Dieses **inerte Autorenpaket** setzt die sieben fachlich geprüften Routinen,
14 vollständigen DE/EN-Fälle und zwei engen Karten aus Autoren-v2 fort.
Es schreibt keine aktiven Curricula, Quellen, Karten, Bilder, Registry oder
Reviewentscheidungen. Neue strenge Abschlüsse: **0**. Wiederhergestellte
aktive Bindungen: **0**. Menschliche Freigabe und Erprobung: **nicht erfolgt**.

## Konkreter Kandidat und exakte Wiederverwendung

Der kanonische Kandidat hat 485 Knoten und **382 curricularAtomic-Ziele**:
sechs neue stabile UUIDv5, ein bestehendes Kennzeichnungsziel und zwei bisherige
Sammelatome als fachliche Cluster. Damit ergibt sich 378 + 6 − 2 = 382.
Die sieben DE/EN-Titel und Beschreibungen sind exakt die geprüften v2-Texte.
Die 14 Fallkörper und zwei Kartenkörper bleiben unverändert in v2; der neue
Binder ordnet ihnen nachvollziehbar UUIDs und künftige Kartenursprünge zu.
Die ursprünglichen `candidateGoalId: null` in den historischen Fallkörpern
werden nicht überschrieben.

| Routine | UUID | Enger Quellenkandidat |
| --- | --- | --- |
| Kennzeichnungen | `9e656697-fc05-5aa9-9aca-871af2e89eb7` | HE G9, 8.1, Jahrgang 8, verbindlicher Teilaspekt |
| Schutzmaßnahmen | `4b6d1824-20e4-597e-b639-fae401f740f0` | HE G9, 8.1, Jahrgang 8, verbindlicher Teilaspekt |
| Entsorgung | `805a2f58-29ce-55d0-8a85-42ee486239b3` | HE G9, 8.1, Jahrgang 8, verbindlicher Teilaspekt |
| Lösungen herstellen | `1351706f-4ea6-56e9-951b-87b24cbcdee8` | HE G9, 8.1, Jahrgang 8, verbindlicher Teilaspekt |
| Quantitative Löslichkeit/Sättigung | `413040cd-ba74-5227-948c-a778b0bd0f56` | HE G9, 8.1, Jahrgang 8, **fakultativ** |
| Massenanteil | `4aeced1e-15cd-58df-83f7-68e2531c2d32` | HE G9, 8.1, Jahrgang 8, verbindlicher Teilaspekt |
| Volumenanteil | `49d42c38-419c-5048-b7e9-860645dd122d` | HE G9, 8.1, Jahrgang 8, verbindlicher Teilaspekt |

UUIDv5-Namensraum ist die bestehende breite Ziel-UUID; der Name lautet
`skillpilot:de-gymnasium:chemie:b007:routine:<localKey>`.
Die zwei Cluster behalten ihre bestehenden UUIDs, Texte, Ressourcen und
historischen Quellenmetadaten. Ihre früheren universellen `requires` werden
im Kandidaten entfernt: ihre fachlich unterschiedlichen Kinder tragen die
jeweils geprüften direkten Routinevoraussetzungen. Sonstige bestehende
Voraussetzungen und Kontexte bleiben erhalten und werden tatsächlich geprüft.

## Tatsächlich ausgeführte native Vorbereitung

Unveränderte Produktionshelfer erzeugen das reine Buchmodell mit 382 Seiten,
prüfen den kanonischen Graphen und kompilieren die prospektive HE-Sicht.
Die Semantic-Kind-Ledger verwenden den geschlossenen Produktionsvertrag.
Seine Klassifikationswerte sind hier ausschließlich **prospektive Eingänge**
für die native Modellbildung; sie sind keine unabhängige A-, D-, P-, M- oder
V-Freigabe und werden nicht aktiv integriert.

Im Basiskandidaten sind sämtliche 112 geschützten Zielobjekte und
Zielfingerprints exakt erhalten. Alle 112 Seitenfingerprints ändern sich
wegen Seitennummern beziehungsweise Verweisen; 106 Seiten behalten ihren
Inhalt nach Ausschluss ausschließlich der Pagination exakt. Sechs Seiten
haben tatsächlich geänderte Verweiskontexte. Historische Reviews werden
dadurch nicht erneut als Fachreviews ausgeführt oder durch neue Hashes ersetzt.

Die direkte Bindung an einen früheren Atom, der jetzt ein Cluster ist, würde
neue Voraussetzungen erzeugen. Besonders die fakultative quantitative
Sättigung darf keine allgemeine Voraussetzung werden. Der tatsächliche
Produktionshelfer und der gelesene Backend-Quellcode belegen dieses Risiko;
ein Backend-Frontier-Akzeptanztest wurde nicht ausgeführt. `core: false` allein
behebt das Risiko nicht, da der Backend-Pfad die GK-Tags auswertet.

Deshalb liegt ein **separater Kandidat mit genau vier weiteren
`requires`-Änderungen** vor: Indikatorversuche und Leitfähigkeitsvergleich
verweisen eng auf die Herstellungsroutine, Teilchendeutung auf die vorhandene
Aggregatzustandsroutine, Gefahrminderung auf die Schutzmaßnahmenroutine.
Ihre Zieltexte, Fälle und Bilder sind unverändert. 108 geschützte Zielobjekte
bleiben exakt, vier werden erst nach unabhängiger didaktischer Prüfung und
aktueller D/P/A/M/V-Bindung integriert. Hinzu kommen zwei reine Seitenkontexte
der vorhandenen Labor- und Aggregatzustandsziele. Die gezielten Bindungsdaten
stehen in `four-minimal-requires-proposals-and-exact-binding-recheck-plan.author-candidate.json`.

## Quellen und bisherige nationale Sichtreferenzen

Die tatsächlich gelesenen HE-Seiten sind physisch 8/12/13, gedruckt 7/11/12.
Quantitative Sättigung wird ausschließlich als Operationalisierung des
fakultativen HE-Abschnitts angesetzt; hierfür existiert ein neuer prospektiver
Quellenkomponenten-Kandidat, kein angeblich schon vorhandener Extraktionssatz.
NI Jahrgang 5/6, physisch und gedruckt 51, belegt die **qualitative**
Stoffeigenschaft Löslichkeit. Daraus wird keine quantitative Pflicht abgeleitet.
Die Kursstufe ist hier unspezifiziert; GK/LK-Kompatibilitätstags sind keine
Quellenbeweise für einen Oberstufenkurs.

Alle **403 ursprünglichen Quellenobliegenheiten**, 413 zugehörigen Mappingzeilen
und 62 Eingangdateien bleiben unverändert und separat offen. Keine nationale
Quellenfreigabe wird behauptet. Die tatsächliche gezielte Kompilierung findet
40 bestehende betroffene Quellensichten mit 72 `CPV-009`-Befunden: bisherige
`goalEntry`-Verweise können einen neuen `curricularArea`-Cluster nicht als
opakes Ziel darstellen. Die Auswahl seiner Kinder muss aus den jeweiligen
Quellen, Operatoren, Stufen und Pflicht-/Wahlbindungen abgeleitet werden;
pauschales Aufklappen wäre kein fachlicher Nachweis. Es gibt keine aktiven
Sichtänderungen. Das reine Vergleichsbuch ist kein vollständiger nationaler
Quellenatlas.

## Memory, Visualisierung und offene Gates

Kennzeichnungen verwenden die vorhandenen Karten als Wiederverwendungskandidat.
Massen- und Volumenanteil bekommen jeweils genau eine Definition als
Kartenkandidat. Für die übrigen vier Routinen ist keine Memory-Karte vorgeschlagen.
Eine tatsächliche Produktionskompilierung der prospektiven HE-Sicht zeigt die
drei Memory-Ursprünge und den unveränderten vorhandenen Memory-Knoten gemeinsam
als Ziel. Das ist ein enger Kandidaten-Sichtnachweis; aktive Kartendecks,
Kartenreviews und nationale Sichtfreigaben bleiben ausstehend.

Vorhandene Bildbytes und Links bleiben erhalten. Für die sechs neuen Ziele
wird kein Bild ohne vorher belegten Bedarf erzeugt. Dieses Paket führt keine
tatsächliche V-Sichtprüfung und keine Bildfreigabe aus. Der Kennzeichnungstext
und die zu Clustern gewordenen Eltern benötigen eine aktuelle Text-/Bildbindung;
die Existenz ihrer alten Bilder ersetzt diesen Nachweis nicht.

Vor Integration sind erforderlich: unabhängige native Beschreibungsreviews
mit Befundauflösung, aktuelle tatsächliche P-v2-Profile mit ehrlichem
`ai_candidate`/`needs_human_review`-Status, native A-/M-Entscheidungen,
Kartenursprung und Sichtbarkeit, tatsächliche V-Prüfung, gezielte Quellen- und
Sichtentscheidungen sowie Wiederbindung der vier geschützten geänderten
Voraussetzungen und der betroffenen Seitenkontexte. Layer-A- und zentrale
Fünf-Gate-Prüfungen folgen am stabilen Integrationsstand. Kein PDF, kein
vollständiger Build und kein Produktcode-Sonderpfad wurden erstellt.

## Dateien und Abschluss

- `qa-artifacts/`: vollständige native kanonische Kandidaten, Kind-Ledger,
  Vergleichs-/HE-Sichten, drei tatsächliche reine Buchmodelle und Konfigurationen.
- `seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json`:
  die unveränderten Materialkörper, UUIDs und Kartenursprünge.
- `primary-source-reading-and-exact-material-review-lineage.actual.json`:
  tatsächliche eng gelesene Primärseiten und exakte unabhängige v2-Reviewlinie.
- `actual-targeted-schema-material-and-preservation-checks.json`:
  gezielte Schemaprüfungen, Material- und Quellenhashes, Bildbytes, geschützte
  Eingänge und separate parallele Biologie-Integrationsänderungen.
- `native-source-preparation-author-v3.final.freeze.json`: abschließende
  Dateibindungen dieses Pakets. Nach Versiegelung unverändert aufbewahren.

Der aktive Chemie-Ausgangspunkt bleibt **112/378**. Dieses Paket zählt
**0 neue fachliche Abschlüsse, 0 wiederhergestellte Bindungen und 0 Nettozuwachs**.
Software/technische QA-Dokumentation: Apache-2.0; eigene Ziel-, Aufgaben- und
Karteninhalte: CC-BY-4.0 gemäß `LICENSING.md`. Primärquellen bleiben Drittmaterial;
ihre tatsächliche Lektüre ist keine Lizenz- oder Qualitätsfreigabe.
