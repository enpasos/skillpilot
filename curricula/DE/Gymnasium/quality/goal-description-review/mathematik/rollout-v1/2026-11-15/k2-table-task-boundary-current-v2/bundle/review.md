# AI review input: Tabellenkompetenz und rationale Vorbereitung: vollständige aktuelle Seitenkontexte

- Book ID: `de-gym-math-k2-f39-task-boundary-page-current-20261115-v2`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:eab79b0ec39cfbcc1f9a7d206b6a5084d40a115bffa863d4f36ee02edc872f49`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Tabellen erstellen und beschriften

- Full learning-goal ID: `f39c49c7-003b-471a-a33e-6cfea1d7b7b1`
- Goal fingerprint: `sha256:0afeeb0f58b616dcb851fea59313b6fed94505612e9902c2ea99740161090c34`
- Page fingerprint: `sha256:b0d47e99942dcac7fe0df36edbb5e69b64efc35c7bca1c75eba9ed4e57bc7861`
- Topic path: Mathematik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Analysis und Funktionen

### Canonical description

Die lernende Person kann in einfachen Zuordnungs- und Sachkontexten Tabellen erstellen, Zeilen und Spalten passend beschriften und Einheiten korrekt angeben.

### Visualization

/assets/goal-visualizations/mathematik/f39c49c7-003b-471a-a33e-6cfea1d7b7b1/f39c49c7-003b-471a-a33e-6cfea1d7b7b1.jpg

- original digest: `sha256:d211d7ff5e51e946a197b08753026d92f800420a83f5c1272a01de414b0ed92e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)

### Direct reverse prerequisites outside this book

- Tabellen aus Messnotizen und Kategorien erstellen — `54ce7136-5bdd-5d36-b0a5-f9a781bff82a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a64360c832898480f42bd224336ec9d56a0c943e8a3b173c5de90b2a0476d2cb`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `paired-data-structure`
  - Essential understanding (DE): Eine Tabelle ordnet zu jeder Eingabe oder Kategorie genau den dazugehörigen Sachwert; Überschrift sowie Zeilen- und Spaltenordnung machen diese Zuordnung lesbar.
  - Essential understanding (EN): A table pairs each input or category with its corresponding contextual value; its title and row-column arrangement make the pairing readable.
  - Observable performance (DE): Die lernende Person überführt neue unsortierte Sachangaben in eine geordnete Tabelle, hält jedes Wertepaar zusammen und ergänzt eine zum Inhalt passende Überschrift.
  - Observable performance (EN): The learner turns fresh unordered contextual statements into an ordered table, keeps each value pair intact, and gives the table a fitting title.
- `labels-and-units`
  - Essential understanding (DE): Spalten- oder Zeilenköpfe benennen die dargestellten Größen; eine Einheit gehört zur messbaren Größe und nicht wahllos an jede Zahl oder Kategorie.
  - Essential understanding (EN): Row or column headers name the represented quantities; a unit belongs to a measurable quantity, not indiscriminately to every number or category.
  - Observable performance (DE): Die lernende Person beschriftet beide Größen eindeutig, trägt Stunden und Kilometer beziehungsweise Personen nur an den passenden Stellen ein und erläutert, was eine Tabellenzeile aussagt.
  - Observable performance (EN): The learner labels both quantities unambiguously, attaches hours and kilometres or people only where appropriate, and explains what one table row states.

**Coverage expectations**

- required expectations: `paired-data-structure`, `labels-and-units`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `data-kind`: zeitlich geordnete Messpaare gegenüber Kategorien mit Häufigkeiten / time-ordered measurement pairs versus categories with counts
- `unit-placement`: zwei messbare Größen gegenüber Kategorie ohne Einheit und Anzahl mit Einheit Personen / two measurable quantities versus a unitless category and a count measured in people

**Application cases**

- `bike-trip-notes`
  - Task demand (DE): Für eine Radtour liegen ungeordnete Notizen vor: nach 2 h 29 km, zu Beginn 0 km, nach 1 h 14 km. Erstelle eine gut beschriftete Tabelle mit Überschrift und erkläre die Zeile zu 2 h.
  - Task demand (EN): Unordered cycling notes say: 29 km after 2 h, 0 km at the start, 14 km after 1 h. Create a clearly labelled table with a title and explain the 2 h row.
  - Expected performance (DE): Die Tabelle ordnet Zeit t in h den Strecken s in km als (0,0), (1,14), (2,29) zu; eine Überschrift benennt die Radtour. Die letzte Zeile bedeutet 29 km nach 2 h, nicht 29 km/h.
  - Expected performance (EN): The table pairs time t in h with distance s in km as (0,0), (1,14), (2,29), with a title identifying the ride. The final row means 29 km after 2 h, not 29 km/h.
  - Understanding focus (DE): Wertepaare aus Notizen erhalten, ordnen und mit zwei Einheiten beschriften.
  - Understanding focus (EN): Preserving and ordering pairs from notes with two distinct units.
- `school-club-survey`
  - Task demand (DE): In einer AG-Umfrage wählen 8 Personen Theater, 11 Musik und 6 Robotik. Stelle diese Angaben als Tabelle dar, beschrifte Kategorien und Anzahlen passend und erkläre, weshalb die AG-Namen keine physikalische Einheit bekommen.
  - Task demand (EN): In a school-club survey, 8 people choose drama, 11 music and 6 robotics. Present the data as a table, label categories and counts appropriately, and explain why club names have no physical unit.
  - Expected performance (DE): Eine Tabelle mit Überschrift enthält AG und Anzahl in Personen, die drei korrekten Zuordnungen Theater–8, Musik–11, Robotik–6. Nur die Anzahl erhält die Einheit Personen; AG-Namen sind Kategorien.
  - Expected performance (EN): A titled table contains club and count in people, correctly pairing drama–8, music–11 and robotics–6. Only the count is measured in people; club names are categories.
  - Understanding focus (DE): Transfer von Messpaaren auf Kategorien mit einer einzigen sinnvollen Einheit.
  - Understanding focus (EN): Transfer from measurement pairs to categories with only one meaningful unit.
