# AI review input: Physik: aktueller Seitenkontext der funktionalen Diode

- Book ID: `de-gym-physik-diode-page-current1-20261115-v4`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:572346f34429d46379eeeb42d612f50decf327d85c257acf0263f3d8e32f9516`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Durchlass- und Sperrverhalten einer Diode an einer Kennlinie erklären

- Full learning-goal ID: `dc55adac-91a5-5cc3-ab47-be008480616f`
- Goal fingerprint: `sha256:7aed81db95b80531a3f77110669facc91ad106fda0b54e1146f84644d711f6c6`
- Page fingerprint: `sha256:b36920357f4ebcee01a318409425c4a695cab04b59763cf237c604d5a6b30b44`
- Topic path: Physik > Sekundarstufe I > Halbleiterbauelemente: Grundlagen

### Canonical description

Die lernende Person kann aus einer vorgegebenen qualitativen Strom-Spannungs-Kennlinie einer Diode ihr Durchlass- und Sperrverhalten ablesen und damit für beide Polungen bei angegebener Diodenspannung im dargestellten Kennlinienbereich vorhersagen, ob in einem einfachen Stromkreis ein nennenswerter Strom fließt.

### Visualization

/assets/goal-visualizations/physik/dc55adac-91a5-5cc3-ab47-be008480616f/dc55adac-91a5-5cc3-ab47-be008480616f.png

- original digest: `sha256:3faaff055424e4a6a40827d798caf3e176aa020a38942b59fc5381b97f5e7bc6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)
- Zwischen Stromkreis und Schaltplan übersetzen — `69f8f59c-b0c3-5b0b-82db-834a0e655736` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Diodenpolung aus einer Kennlinie beurteilen — `8670cff6-fe9c-5f7e-8cba-d170134965a6` (outside this book)
- Die Gleichrichterfunktion einer Diodenschaltung erklären — `3b586f2a-60e2-5019-aa08-6a47616a1f1f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e0ab44a99f075c8c9304487ed076080c53beccd72021104cd80118e6cfb7dd6d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `voltage-point-and-polarity`
  - Essential understanding (DE): Polung ordnet einen Bereich der vorgegebenen Kennlinie zu; erst die angegebene Diodenspannung und die zugehörige Stromangabe entscheiden über nennenswerten Strom. Positive Spannung allein genügt nicht.
  - Essential understanding (EN): Polarity selects a region of the supplied characteristic; the stated diode voltage and corresponding current determine whether current is appreciable. Positive voltage alone is insufficient.
  - Observable performance (DE): Verknüpft die markierten A/K-Bezüge des neuen Schaltplans mit konkreten Punkten der Kennlinie und unterscheidet kleinen sowie nennenswerten Durchlassstrom vom kleinen Sperrstrom.
  - Observable performance (EN): Connects marked A/K references in a new circuit diagram with specific characteristic points and distinguishes small and appreciable forward currents from small reverse current.
- `range-and-transfer`
  - Essential understanding (DE): Kennlinien sind an Bauteil, Temperatur und dargestellten Spannungsbereich gebunden. Ein kleiner Sperrstrom ist nicht exakt null; ein Diagramm begründet weder eine universelle 0,7 V-Schwelle noch Prognosen außerhalb seines Bereichs.
  - Essential understanding (EN): Characteristics are bound to component, temperature and plotted voltage range. Small reverse current is not exactly zero; one plot establishes neither a universal 0.7 V threshold nor predictions beyond its range.
  - Observable performance (DE): Überträgt die Punktdeutung auf gespiegelte Beschaltung und eine andere gegebene Kennlinie; benennt fehlende Grundlage außerhalb des Bereichs statt zu extrapolieren.
  - Observable performance (EN): Transfers point interpretation to a mirrored circuit and another supplied characteristic; identifies missing evidence outside the range instead of extrapolating.

**Coverage expectations**

- required expectations: `voltage-point-and-polarity`, `range-and-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `forward-position`: Zwei positive Diodenspannungen auf flachem und steilem Teil derselben Kennlinie. / Two positive diode voltages on shallow and steep parts of the same characteristic.
- `new-diode-layout`: Neue Kennlinie mit anderem Durchlassanstieg und gespiegelten A/K-Anschlüssen; alle Spannungen beziehen sich auf A gegen K. / Fresh characteristic with a different forward rise and mirrored A/K terminals; all voltages reference A relative to K.

**Application cases**

- `three-stated-operating-points`
  - Task demand (DE): Ein geschlossener strombegrenzter Kleinspannungskreis und eine Kennlinie für eine Diode bei konstanter Temperatur sind vorgegeben. U_D ist A gegen K, I_D A nach K. Die dargestellte Kennlinie reicht von −1 V bis +0,8 V und gibt bei +0,2 V einen sehr kleinen positiven, bei +0,6 V einen nennenswerten positiven und bei −0,8 V einen sehr kleinen negativen Strom an. Deute alle drei Betriebspunkte im Schaltplan und prüfe: Positive Diodenspannung bedeutet immer nennenswerten Strom.
  - Task demand (EN): A closed current-limited low-voltage circuit and a characteristic for one diode at fixed temperature are supplied. U_D references A to K and I_D A to K. The plotted range is −1 V to +0.8 V, giving very small positive current at +0.2 V, appreciable positive current at +0.6 V and very small negative current at −0.8 V. Interpret all three operating points in the circuit and assess: Positive diode voltage always means appreciable current.
  - Expected performance (DE): Beide positiven Spannungen sind Durchlasspolung, aber nur der steile Betriebspunkt zeigt hier nennenswerten Strom. Der negative Punkt ist Sperrpolung mit kleinem Strom gegen die Bezugsrichtung. Die Person begründet jede Aussage am angegebenen Punkt, lehnt die pauschale Durchlassregel ab und behauptet keine exakte Null.
  - Expected performance (EN): Both positive voltages represent forward bias, but only the steep-branch point shows appreciable current here. The negative point is reverse bias with small current opposite the reference. The learner justifies every conclusion at the stated point, rejects the blanket forward-bias rule and claims no exact zero.
  - Understanding focus (DE): Gleiche Polung, unterschiedliche Stromaussage: tatsächliche Kennlinienanwendung statt Polungsetikett.
  - Understanding focus (EN): Same polarity, different current conclusion: actual characteristic use rather than a polarity label.
- `mirrored-second-characteristic`
  - Task demand (DE): Eine neue Diode ist räumlich gespiegelt; A/K bleiben bezeichnet. Ihre bereitgestellte Kennlinie bei festgehaltener Temperatur reicht von −1 V bis +2,4 V. Bei +0,6 V ist der Strom sehr klein, bei +2,1 V nennenswert; bei −0,7 V ist ein sehr kleiner negativer Strom angegeben. Bestimme die drei Fälle und beurteile Prognosen für −3 V sowie die allgemeine 0,7 V-Regel.
  - Task demand (EN): A new diode is mirrored spatially while A/K remain labelled. Its supplied fixed-temperature characteristic ranges from −1 V to +2.4 V. Current is very small at +0.6 V and appreciable at +2.1 V; a very small negative current is given at −0.7 V. Determine all three cases and assess predictions for −3 V and the universal 0.7 V rule.
  - Expected performance (DE): Die Person bestimmt Polung und Strom jeweils aus Anschlussdefinition und neuer Kennlinie. Die geänderte Durchlasslage widerlegt eine universelle Schwelle. Für −3 V liegt kein dargestellter Wert vor; ohne weitere Daten wird weder fortgesetzte Sperrung noch Durchbruch behauptet. Es werden keine eigenen Messungen ausgegeben.
  - Expected performance (EN): The learner determines polarity and current from terminal definitions and the new curve. The shifted forward rise refutes a universal threshold. No plotted value exists for −3 V; without more data neither continued blocking nor breakdown is claimed. No personal measurements are asserted.
  - Understanding focus (DE): Echter Bauteil-/Layoutwechsel und explizite Bereichsgrenze bei bereitgestellten Daten.
  - Understanding focus (EN): A genuine component/layout change and explicit range boundary with supplied data.
