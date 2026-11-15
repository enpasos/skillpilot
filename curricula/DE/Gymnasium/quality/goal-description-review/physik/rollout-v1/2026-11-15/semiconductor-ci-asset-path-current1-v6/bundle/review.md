# AI review input: Physik: Materialklassifikation mit aktuellem Primärbild

- Book ID: `de-gym-physik-material-classification-asset-current-20261115-v6`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:8dd93ae5db64046f567305ec6ec88f7365ba8afe546081c5a9683a4989d87b7d`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Leiter, Nichtleiter und Halbleiter

- Full learning-goal ID: `7badac4d-2874-5b3a-87e8-bf8f4440b2a6`
- Goal fingerprint: `sha256:36cb77ba1f58fb28a0f3f01b1039cc9ee5a0ad18d82400ff95873f42670ff1b8`
- Page fingerprint: `sha256:6f7ae685516abdd381e4db9ba35558e59cd5e0324b76cd315721d8b7c27d633e`
- Topic path: Physik > Sekundarstufe I > Halbleiterbauelemente: Grundlagen

### Canonical description

Die lernende Person kann an typischen Materialbeispielen Leiter, Nichtleiter und Halbleiter unterscheiden, ihre elektrische Leitfähigkeit unter vergleichbaren Bedingungen qualitativ vergleichen und damit einfache Verwendungen in Technik und Alltag begründen.

### Visualization

/assets/goal-visualizations/physik/7badac4d-2874-5b3a-87e8-bf8f4440b2a6/7badac4d-2874-5b3a-87e8-bf8f4440b2a6.png

- original digest: `sha256:2a9dc2fb15e90877440ec9bf166419105d2ca96ebd13cd0368b5b666af5ac4b7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Physik? – Weltverständnis & Zukunft — `5c44b9ba-9b05-4774-95d5-073230d3fc4f` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Q4 — `266b6cf8-d49d-5197-862c-9998fcf179a5` (outside this book)
- Dotierung mit einem einfachen Ladungsträgermodell erklären — `9f265f49-1342-5ba7-9c5d-54e97fdb2f19` (outside this book)
- Bändermodell und Dotierung — `df010b2b-b182-5f7e-bbe4-49b72e48c27a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2497a99ab8ccb68ade26297c561d4b14cd48f328fb9444b5212a71ccd6644fb3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `comparable-classification`
  - Essential understanding (DE): Leiter, Nichtleiter und Halbleiter werden an typischen dokumentierten Materialbeispielen unterschieden. Ihre typische Leitfähigkeit lässt sich unter vergleichbaren Bedingungen qualitativ vergleichen und mit einfachen Verwendungen verbinden; eine mittlere Einzelangabe identifiziert keinen unbekannten Halbleiter.
  - Essential understanding (EN): Conductors, insulators and semiconductors are distinguished using representative documented material examples. Their typical conductivity can be compared qualitatively under comparable conditions and connected to simple uses; an isolated intermediate value does not identify an unknown semiconductor.
  - Observable performance (DE): Ordnet typische bekannte Materialien begründet zu, vergleicht ihre Leitfähigkeit unter gleichen Bedingungen, begründet eine passende Verwendung und trennt diese Evidenz von einer ungesicherten Diagnose einer unbekannten Probe.
  - Observable performance (EN): Justifies classifications of representative known materials, compares conductivity under common conditions, justifies an appropriate use and distinguishes this evidence from an unsupported diagnosis of an unknown sample.

**Coverage expectations**

- required expectations: `comparable-classification`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `new-materials`: Andere typische dokumentierte Materialien und Anwendungen; Materialklasse nicht allein aus einer unbekannten Leitfähigkeitsrangfolge folgern. / Different representative documented materials and applications; do not infer material class solely from an unknown conductivity ranking.
- `changed-condition`: Abweichende Temperatur und veränderte Form; gemeinsame Vergleichsbedingungen und Grenzen der Daten benennen. / Changed temperature and shape; identify common comparison conditions and the limits of the data.

**Application cases**

- `documented-typical-materials`
  - Task demand (DE): Für Kupfer, trockenes Glas und reines Silizium liegen typische Materialbeschreibungen bei derselben Raumtemperatur vor: Kupfer leitet sehr gut, Glas sehr schlecht; die Leitfähigkeit des dokumentierten Halbleitermaterials Silizium liegt im vorgegebenen Beispiel dazwischen. Unterscheide die drei Materialklassen und begründe Kupfer als Leitungs- und Glas als Isolationsmaterial. Welche Aussage über einen unbekannten Stoff mit nur einer mittleren Leitfähigkeitsangabe wäre nicht gesichert?
  - Task demand (EN): Representative material descriptions at the same room temperature are supplied for copper, dry glass and pure silicon: copper conducts very well, glass very poorly; conductivity of the documented semiconductor material silicon is intermediate in this example. Distinguish the three material classes and justify copper for conduction and glass for insulation. Which claim about an unknown substance with only one intermediate conductivity value would remain unsupported?
  - Expected performance (DE): Kupfer ist das typische Leiter-, Glas das Nichtleiter- und Silizium das Halbleiterbeispiel. Leitungs- und Isolationsverwendung werden aus der unter gleichen Bedingungen dokumentierten Leitfähigkeit begründet. Siliziums Einordnung nutzt das bekannte Materialbeispiel; eine bloß mittlere Leitfähigkeit beweist für einen unbekannten Stoff keine Halbleiterklasse und keine fertige Schaltfunktion.
  - Expected performance (EN): Copper is the representative conductor, glass the insulator and silicon the semiconductor. Conduction and insulation uses are justified from conductivity documented under common conditions. Silicon is classified using the known material example; an intermediate value alone proves neither semiconductor class nor a complete switching function for an unknown substance.
  - Understanding focus (DE): Begründeter Vergleich typischer Materialien und einfache Anwendungen ohne universelle Leitfähigkeitsschwellen.
  - Understanding focus (EN): Justified comparison of representative materials and simple uses without universal conductivity thresholds.
- `condition-limited-material-transfer`
  - Task demand (DE): Ein neuer Materialsatz enthält Aluminium, trockenes Porzellan und Germanium mit typischen Materialbeschreibungen als Leiter-, Isolations- und Halbleitermaterial. Aluminium und Porzellan sind bei 20 °C beschrieben, Germanium nur bei 80 °C. Begründe passende Materialklassen und eine Leitungs- beziehungsweise Isolationsanwendung. Darf man daraus eine gemeinsame Leitfähigkeitsrangfolge bei 20 °C ableiten? Welche Vergleichsdaten fehlen, und ändert allein eine andere Probenform die Materialklasse?
  - Task demand (EN): A fresh set supplies aluminium, dry porcelain and germanium with representative material descriptions as conducting, insulating and semiconductor materials. Aluminium and porcelain are described at 20 °C, germanium only at 80 °C. Justify the material classes and an appropriate conduction or insulation use. Can a common conductivity ranking at 20 °C be inferred? What comparison data are missing, and does changing sample shape alone change its material class?
  - Expected performance (DE): Die Person begründet Aluminium als Leiter und Porzellan als Nichtleiter mit passenden Verwendungen; Germanium ist das dokumentierte Halbleiterbeispiel. Für eine gemeinsame Rangfolge bei 20 °C braucht sie Germaniums Verhalten bei derselben Temperatur oder ein geeignetes dokumentiertes Temperaturmodell. Allein die Form ändert die Materialklasse nicht; aus einem anderen Strom durch einen anders geformten Körper folgt keine neue Stoffklasse. Die Person unterscheidet die bekannte Materialzuordnung vom nicht gesicherten bedingungsgleichen Datenvergleich.
  - Expected performance (EN): The learner justifies aluminium as a conductor and porcelain as an insulator with appropriate uses; germanium is the documented semiconductor example. A common ranking at 20 °C needs germanium data at that temperature or a suitable documented temperature model. Shape alone does not change material class; different current through a differently shaped object does not establish a new material class. The learner distinguishes known material classification from an unsupported like-for-like data comparison.
  - Understanding focus (DE): Tatsächlich neuer Materialsatz mit veränderter Temperatur und Form als Grenze der Vergleichsevidenz.
  - Understanding focus (EN): A genuinely fresh material set with changed temperature and shape as limits on comparison evidence.
