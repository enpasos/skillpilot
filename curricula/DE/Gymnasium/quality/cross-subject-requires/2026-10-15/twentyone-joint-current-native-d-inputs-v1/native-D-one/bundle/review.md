# AI review input: Physik – aktuelle gemeinsame P-Kontexte (2/2)

- Book ID: `physik-joint-current-one-contexts-20261015-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:600f3c8b31ec6361f640c9652b357bc39a5a95f4f26c84cf055a1bbd06ee1a58`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Die Strom-Spannungs-Kennlinie einer Diode experimentell bestimmen

- Full learning-goal ID: `3857891b-d328-585b-9936-85c7aff122ee`
- Goal fingerprint: `sha256:a0fa57a28313a5a4d54aa21686d17f0147f8701f75081196f26081b1319960b0`
- Page fingerprint: `sha256:d40af9bda82c07fac38431d796546ad34ea2e1977af81cb2af5da251e517db11`
- Topic path: Physik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Dioden: belegte Quellenanteile

### Canonical description

Die lernende Person kann in einem beaufsichtigten, strombegrenzten Kleinspannungsversuch die Strom-Spannungs-Kennlinie einer Diode in Durchlass- und Sperrpolung aufnehmen und aus den Messwerten ihr richtungsabhängiges Leitverhalten begründen.

### Visualization

/assets/goal-visualizations/physik/3857891b-d328-585b-9936-85c7aff122ee/3857891b-d328-585b-9936-85c7aff122ee.png

- original digest: `sha256:bfac74412968fe6865a8f6b56bc23edd690e05a30a0ff38acbee9f37c3f3da7e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)
- Stromstärke in einfachen Stromkreisen messen — `f1a078ae-6262-4444-a4bc-a5ab275621cf` (outside this book)
- Spannung in einfachen Stromkreisen messen — `28237994-9c24-5a06-82fe-be1f494768ba` (outside this book)
- Sperrschicht und Polung am p-n-Übergang erklären — `2084b7d4-300d-5fa0-8b8d-c480c40f853e` (outside this book)

### Direct reverse prerequisites outside this book

- Eine echte Diodenkennlinie aufnehmen und prüfen — `4ac5a07c-fff0-5eae-890d-89e13eaf69c3` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:814e6486ceafa1bfb6daba546a7bf31626ba373deaf559f1e783edf6bd61e70c`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `own-measurement`
  - Essential understanding (DE): Die gesuchte Kennlinie verknüpft den Strom durch die Diode mit der Spannung direkt an ihr; Versorgungsspannung und Vorwiderstandsspannung sind andere Größen.
  - Essential understanding (EN): The characteristic relates current through the diode to voltage directly across it; supply and series-resistor voltages are different quantities.
  - Observable performance (DE): Die lernende Person formuliert die Polungsfrage, baut unter Aufsicht mit Strombegrenzung sicher auf und zeichnet nachvollziehbare eigene signierte Messpaare in beiden Polungen einschließlich Messbereichen und Unsicherheiten auf.
  - Observable performance (EN): The learner formulates the polarity question, safely assembles a supervised current-limited setup and records traceable original signed measurements in both bias directions, including ranges and uncertainties.
- `bounded-inference`
  - Essential understanding (DE): Eine nicht aufgelöste Sperrstromanzeige ist eine Unsicherheitsgrenze, kein Nachweis einer exakten Null; die Kennlinie ist nicht ohmsch.
  - Essential understanding (EN): An unresolved reverse-current reading is an uncertainty bound, not proof of an exact zero; the characteristic is non-ohmic.
  - Observable performance (DE): Aus der eigenen Kennlinie begründet die lernende Person Richtungsabhängigkeit und Nichtlinearität, sagt die Wirkung höherer Auflösung voraus und vergleicht eine tatsächlich durchgeführte freigegebene Wiederholungsmessung.
  - Observable performance (EN): From their own graph the learner justifies direction dependence and nonlinearity, predicts the effect of improved resolution and compares an actually performed approved repeat measurement.

**Coverage expectations**

- required expectations: `own-measurement`, `bounded-inference`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `measurement-quality`: Polung und Messauflösung ändern, Bauteil und thermische Randbedingungen für Vergleiche kontrollieren. / Change bias and instrument resolution while controlling device and thermal conditions for comparisons.

**Application cases**

- `actual-iv`
  - Task demand (DE): Bestimme im freigegebenen Kleinspannungsaufbau selbst die Kennlinie beider Polungen; dokumentiere Sicherheit, Messpunktwahl und Unsicherheit.
  - Task demand (EN): Independently determine both bias branches in an approved low-voltage setup; document safety, measurement-point selection and uncertainty.
  - Expected performance (DE): Liefere den real beobachteten eigenen Aufbau, Originalpaare, beschriftetes Diagramm und die datengetragene Leitungsdeutung.
  - Expected performance (EN): Provide the actually observed personal setup, original pairs, labelled graph and data-supported conduction interpretation.
  - Understanding focus (DE): Messung von I_D und U_D, kein Rückschluss auf Durchführung aus einer fertigen Tabelle.
  - Understanding focus (EN): Measurement of I_D and U_D, not inference of execution from a completed table.
- `unresolved-current`
  - Task demand (DE): Prüfe im sicheren Sperrbetrieb eine Nullanzeige mit einem zugelassenen empfindlicheren Gerät.
  - Task demand (EN): Test a zero reading at a safe reverse bias with an approved more sensitive instrument.
  - Expected performance (DE): Sage einen kleinen möglicherweise auflösbaren Strom voraus, führe wirklich nach Freigabe nachmessend aus und begrenze die Aussage mit Auflösung und Unsicherheit.
  - Expected performance (EN): Predict a small possibly resolvable current, actually repeat the measurement after approval and bound the conclusion using resolution and uncertainty.
  - Understanding focus (DE): Nicht beobachtet heißt nicht physikalisch ausgeschlossen.
  - Understanding focus (EN): Not observed does not mean physically excluded.
