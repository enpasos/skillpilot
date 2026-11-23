# AI review input: Fallhöhe und Fallzeit in einem Messprotokoll festhalten

- Book ID: `he-fall-measurement-20261123-book`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:16d47d3351966261a5841f7d1e6877c2c1d756d3ceaaf66892ff17a32104c78b`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Fallhöhe und Fallzeit in einem Messprotokoll festhalten

- Full learning-goal ID: `e0004439-ed34-5caf-858a-6107918224eb`
- Goal fingerprint: `sha256:491c6a9f176b4b6b075decc79d48c3a6aa0027d535b026f60993009b7f5af0ee`
- Page fingerprint: `sha256:bd86d7fc6120e7b3664ec6a821c7e0b6dcfbccedc494181e60cd4646638f35f5`
- Topic path: Physik > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.1 Bewegungen und ihre Beschreibung

### Canonical description

Die lernende Person kann für mehrere Abwürfe Fallhöhe und Fallzeit als zusammengehörige Messpaare mit Einheiten protokollieren. Sie benennt die Datenquelle, die Bezugspunkte der Höhenmessung sowie Beginn und Ende der Zeitmessung.

### Visualization

/assets/goal-visualizations/physik/e0004439-ed34-5caf-858a-6107918224eb/e0004439-ed34-5caf-858a-6107918224eb.png

- original digest: `sha256:25386c33f3ac9202ed5f5035ce00a25a16fcb7e3304ed571f63581fa650d7c6c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ee1a1410604933972c072890555da52846f0fffd6817c22b8d96f407890dc434`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `messpaar`
  - Essential understanding (DE): Eine Messzeile hält die zusammengehörige Fallhöhe und Fallzeit eines bestimmten Abwurfs fest. Einheit und Messbezug machen die Zahlen vergleichbar.
  - Essential understanding (EN): A measurement row pairs the height and time of one particular drop. Units and reference events make the numbers comparable.
  - Observable performance (DE): Die Person erstellt aus Rohnotizen eine nachvollziehbare Tabelle, erhält alle Messpaare, nennt die Datenquelle und beschreibt Fallhöhe, Freigabe und ersten Bodenberührungspunkt.
  - Observable performance (EN): The learner creates an intelligible table from raw notes, keeps each pair together, identifies its source, and explains the height reference, release and first contact with the floor.

**Coverage expectations**

- required expectations: `messpaar`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `quelle-und-zeitbasis`: Getrennte Abwürfe als Höhen-/Zeitnotizen oder als Bildfolgen mit bekannter Zeitbasis. / Separate drops recorded as height and time notes or as video frames with a known time base.

**Application cases**

- `prager-messprotokoll`
  - Task demand (DE): Überführe die Prager Laborablesungen für Stahlkugel 1 (40 cm und 0,285 s, 20 cm und 201 ms, 60 cm und 0,349 s) in ein Protokoll. Benenne den Höhenbezug, die Zeitereignisse und die Datenherkunft.
  - Task demand (EN): Record the Prague lab readings for steel ball 1 (40 cm and 0.285 s, 20 cm and 201 ms, 60 cm and 0.349 s) in a log. Identify the height reference, timing events and source.
  - Expected performance (DE): Zeilenpaare in cm und ms sind (40,285), (20,201), (60,349). Als Höhen stehen die berichteten Skalenwerte im Protokoll. Ein möglicher eigener Bezug ist der Abstand zwischen Kugelunterseite und Boden bei der Freigabe. Die Zeit beginnt mit der Freigabe und endet beim ersten Auftreffen. Die Messwerte stammen aus dem Prager Laborprotokoll.
  - Expected performance (EN): For cm and ms the pairs are (40,285), (20,201) and (60,349). Enter the reported scale readings as heights. One possible reference for a repeat experiment is the gap between the bottom of the ball and the floor at release. Time runs from release to first impact. The readings come from the Prague lab record.
  - Understanding focus (DE): Unabhängige Abwürfe als Paare behandeln und die Zeitspalte einheitlich führen.
  - Understanding focus (EN): Preserve each separate drop as a pair and keep the time column in one unit.
- `bildnummern`
  - Task demand (DE): Für eine neue Übung liegen konstruierte Videonotizen bei 100 Bildern pro Sekunde vor. Die Unterseite startet bei 45 cm, 20 cm und 80 cm über dem Boden. Die Bildnummern bei Freigabe und erstem Bodenkontakt sind (12,42), (50,70) und (7,47). Erstelle eine Tabelle der Höhen und Zeiten. Benenne Zeitbasis, Herkunft und Höhenbezug.
  - Task demand (EN): For a fresh exercise, constructed video notes use 100 frames per second. The bottom of the ball starts at 45 cm, 20 cm and 80 cm above the floor. The release and first-contact frame numbers are (12,42), (50,70) and (7,47). Tabulate the heights and times. Identify the time base, source and height reference.
  - Expected performance (DE): Ein Bildintervall dauert 10 ms. Die Differenzen 30, 20 und 40 liefern die Paare (45 cm,0,30 s), (20 cm,0,20 s), (80 cm,0,40 s). Die Person erklärt die korrespondierenden Ereignisse und bezeichnet die Daten als bereitgestellte Videonotizen.
  - Expected performance (EN): A frame interval lasts 10 ms. Differences of 30, 20 and 40 give (45 cm,0.30 s), (20 cm,0.20 s) and (80 cm,0.40 s). The learner explains the corresponding events and identifies the supplied video notes as the source.
  - Understanding focus (DE): Endbildnummer und verstrichene Intervalle unterscheiden und fremde Beobachtungen eindeutig kennzeichnen.
  - Understanding focus (EN): Distinguish the ending frame number from the elapsed intervals and identify whose observations are being used.
