# AI review input: Physik: aktueller Modellkontext und eigenständiges Transistorexperiment

- Book ID: `de-gym-physik-semiconductor-current10-20261115-v3`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:e62f0b96da8e4bf0a9a7702416e79c771c0c573909eb90221969b28365be2cdb`
- Selected goals: 10

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Leiter, Nichtleiter und Halbleiter

- Full learning-goal ID: `7badac4d-2874-5b3a-87e8-bf8f4440b2a6`
- Goal fingerprint: `sha256:36cb77ba1f58fb28a0f3f01b1039cc9ee5a0ad18d82400ff95873f42670ff1b8`
- Page fingerprint: `sha256:cdec272b6fd639fcd2d18f4c398a280874d16cb3c3150ac0d0730e69acc85402`
- Topic path: Physik > Sekundarstufe I > Halbleiterbauelemente: Grundlagen

### Canonical description

Die lernende Person kann an typischen Materialbeispielen Leiter, Nichtleiter und Halbleiter unterscheiden, ihre elektrische Leitfähigkeit unter vergleichbaren Bedingungen qualitativ vergleichen und damit einfache Verwendungen in Technik und Alltag begründen.

### Visualization

/assets/goal-visualizations/physik/7badac4d-2874-5b3a-87e8-bf8f4440b2a6/7badac4d-2874-5b3a-87e8-bf8f4440b2a6-elementary-20261115.png

- original digest: `sha256:2a9dc2fb15e90877440ec9bf166419105d2ca96ebd13cd0368b5b666af5ac4b7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Dotierung mit einem einfachen Ladungsträgermodell erklären — `9f265f49-1342-5ba7-9c5d-54e97fdb2f19` (page 2)
- Bändermodell und Dotierung — `df010b2b-b182-5f7e-bbe4-49b72e48c27a` (page 4)

### Prerequisites outside this book

- Warum Physik? – Weltverständnis & Zukunft — `5c44b9ba-9b05-4774-95d5-073230d3fc4f` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Q4 — `266b6cf8-d49d-5197-862c-9998fcf179a5` (outside this book)

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
## Page 2: Dotierung mit einem einfachen Ladungsträgermodell erklären

- Full learning-goal ID: `9f265f49-1342-5ba7-9c5d-54e97fdb2f19`
- Goal fingerprint: `sha256:410b31ca80e7b62e6c838bd844e0b066002e25a54d261d0f090d8067aefc8ddd`
- Page fingerprint: `sha256:24a9f14bac05a4497a0872e7bf77e2cdb4937579f596259f8db2f338ec2cbb70`
- Topic path: Physik > Sekundarstufe I > Halbleiterbauelemente: Grundlagen

### Canonical description

Die lernende Person kann an einem vorgegebenen einfachen Bindungsmodell für Silizium erklären, wie n- und p-Dotierung die Zahl beweglicher Elektronen beziehungsweise Löcher erhöhen, und bewegliche Ladungsträger von ortsfesten Ionen im insgesamt neutralen Material unterscheiden.

### Visualization

/assets/goal-visualizations/physik/9f265f49-1342-5ba7-9c5d-54e97fdb2f19/9f265f49-1342-5ba7-9c5d-54e97fdb2f19.png

- original digest: `sha256:1f7e951155ef0deb0b6717b10860d894ef244b2c2f874d19ecbe00c87eef5d57`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Leiter, Nichtleiter und Halbleiter — `7badac4d-2874-5b3a-87e8-bf8f4440b2a6` (page 1)

### Direct reverse prerequisites

- Sperrschicht und Polung am p-n-Übergang erklären — `2084b7d4-300d-5fa0-8b8d-c480c40f853e` (page 3)

### Prerequisites outside this book

- Ladungsphänomene und Reibungselektrizität — `a6e48b88-51ed-5942-bdb8-8d2192652e0d` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Bewegliche Ladungsträger beim Dotieren erklären — `a8d99168-62cc-5771-bb5d-9ba833d84193` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f25df61b65be48e6d99015c7310acc61dfeee4ea58327bb8578e11f7cf6cbd25`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `doping-carriers`
  - Essential understanding (DE): Im bereitgestellten Silizium-Bindungsmodell liefert ein Donator ein bewegliches Elektron; ein Akzeptor nimmt ein Bindungselektron auf und hinterlässt ein bewegliches Loch.
  - Essential understanding (EN): In the supplied silicon bond model, a donor supplies a mobile electron; an acceptor takes up a bond electron and leaves a mobile hole.
  - Observable performance (DE): Leitet n- und p-Träger aus dem jeweils vorgegebenen Vier-/Fünf-/Drei-Außenelektronenmodell ab und erklärt Lochbewegung durch nachrückende Bindungselektronen.
  - Observable performance (EN): Derives n-type and p-type carriers from the supplied four-/five-/three-outer-electron model and explains hole motion through neighbouring bond electrons filling vacancies.
- `charge-neutrality`
  - Essential understanding (DE): Die Dotierionen bleiben ortsfest; mobiles Elektron und positives Donatorion beziehungsweise Loch und negatives Akzeptorion gleichen die Gesamtladung aus. n/p bezeichnet keine Nettoladung.
  - Essential understanding (EN): Dopant ions remain fixed; a mobile electron and positive donor ion, or a hole and negative acceptor ion, balance overall charge. n/p does not mean net charge.
  - Observable performance (DE): Kennzeichnet mobile und ortsfeste Anteile mit richtigem Vorzeichen und widerlegt eine Nettoaufladung oder wandernde Dotierionen.
  - Observable performance (EN): Marks mobile and fixed contributions with correct signs and refutes net charging or mobile dopant ions.

**Coverage expectations**

- required expectations: `doping-carriers`, `charge-neutrality`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `donor-acceptor`: Donator- und Akzeptorfall bei vollständig vorgegebenem Bindungsmodell wechseln. / Switch between donor and acceptor cases with a fully supplied bond model.
- `changed-diagram`: Neue Anordnung und wechselnde Lage der Fehlstelle; Trägerbewegung und feste Ionen getrennt verfolgen. / Fresh arrangement and vacancy location; trace carrier motion separately from fixed ions.

**Application cases**

- `donor-first`
  - Task demand (DE): Ein neues bereitgestelltes Modell zeigt vier Bindungen pro Si und ein neutrales Fremdatom mit fünf Außenelektronen. Vier sind in Bindungen beteiligt, das fünfte wird bei der genannten Temperatur beweglich. Erkläre den Träger, das verbleibende Ion und die Gesamtladung. Vergleiche anschließend mit einem vorgegebenen Drei-Elektronen-Akzeptor.
  - Task demand (EN): A fresh supplied model shows four bonds per Si and a neutral impurity with five outer electrons. Four participate in bonds; the fifth becomes mobile at the stated temperature. Explain the carrier, remaining ion and overall charge. Then compare with a supplied three-electron acceptor.
  - Expected performance (DE): Donator: bewegliches negatives Elektron und ortsfestes positives Ion; Akzeptor: aufgenommenes Bindungselektron, ortsfestes negatives Ion und positiv wirksame Fehlstelle. Beide Bilanzpaare bleiben insgesamt neutral. n/p kennzeichnet den Mehrheitsladungsträger; keine räumlichen Energiebänder oder chemischen Periodensystemkenntnisse werden zusätzlich verlangt.
  - Expected performance (EN): Donor: mobile negative electron and fixed positive ion; acceptor: an acquired bond electron, fixed negative ion and positively acting vacancy. Both charge accounts remain neutral overall. n/p identifies the majority mobile carrier; no additional energy-band or periodic-table knowledge is required.
  - Understanding focus (DE): Trägerentstehung kausal aus gegebenen Bindungen ableiten und Ladung bilanzieren.
  - Understanding focus (EN): Derive carrier formation causally from supplied bonds and balance charge.
- `hole-transfer`
  - Task demand (DE): In einem neu angeordneten p-Modell rückt ein benachbartes Bindungselektron in einen fehlenden Elektronenplatz nach. Zeichne danach den neuen fehlenden Platz ein. Prüfe: Ein Loch ist ein Proton; Borionen wandern als positiver Strom; p-Silizium ist insgesamt positiv geladen.
  - Task demand (EN): In a rearranged p-type model, a neighbouring bond electron fills a missing-electron site. Mark the new vacancy. Assess: a hole is a proton; boron ions travel as positive current; p-type silicon has a positive net charge.
  - Expected performance (DE): Die Fehlstelle verlagert sich entgegen der Elektronenbewegung und ist ein positiv wirksamer fehlender Elektronenplatz. Das Akzeptorion bleibt ortsfest und negativ; der Kristall bleibt insgesamt neutral. Keine Behauptung eines materiellen Hohlraums oder wandernder Protonen.
  - Expected performance (EN): The vacancy moves opposite to the electron and is a positively acting missing-electron site. The acceptor ion remains fixed and negative; the crystal is neutral overall. No material cavity or moving proton is inferred.
  - Understanding focus (DE): Echter Darstellungswechsel prüft Lochkonzept, Mobilität und Neutralität ohne Bildkopie.
  - Understanding focus (EN): A changed representation tests holes, mobility and neutrality without copying an illustration.
## Page 3: Sperrschicht und Polung am p-n-Übergang erklären

- Full learning-goal ID: `2084b7d4-300d-5fa0-8b8d-c480c40f853e`
- Goal fingerprint: `sha256:edd5475b51161db1b42bc550bc5d9f2c74c0a8f7c1d9d8ac2852266567faaba7`
- Page fingerprint: `sha256:078bcd7469eeb83042a275d2de6781534cd089d2701470bb45cb51180220158b`
- Topic path: Physik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Dioden: belegte Quellenanteile

### Canonical description

Die lernende Person kann mit einem einfachen Ladungsträgermodell die Entstehung der Sperrschicht am p-n-Übergang und ihre Veränderung bei Durchlass- und Sperrpolung erklären.

### Visualization

/assets/goal-visualizations/physik/2084b7d4-300d-5fa0-8b8d-c480c40f853e/2084b7d4-300d-5fa0-8b8d-c480c40f853e.png

- original digest: `sha256:7b1053f77261d29bc2d0c653646a875ede3ebf49f8b14e492ff82a709c609478`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Dotierung mit einem einfachen Ladungsträgermodell erklären — `9f265f49-1342-5ba7-9c5d-54e97fdb2f19` (page 2)

### Direct reverse prerequisites

- Einen bipolaren Transistor als Schalter funktional untersuchen — `7d4d6a39-0c78-5fb0-b7bf-182ed00972f7` (page 7)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Warum eine Diode beim Umpolen sperrt — `c61b2a69-b5cd-5785-bb04-5d6bca53b218` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c16e0dc7602fb99db106d7ad0e53dea9ac37ae716eb60667bd7b93d2b6d1816b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `space-charge`
  - Essential understanding (DE): Die Sperrschicht ist an beweglichen Ladungsträgern verarmt, aber wegen ortsfester Ionen nicht überall ungeladen; ihr inneres Feld entsteht aus der Raumladung.
  - Essential understanding (EN): The depletion region lacks mobile carriers but is not locally uncharged because fixed ions remain; its internal field arises from this space charge.
  - Observable performance (DE): Die lernende Person erklärt in einer frischen p/n-Anordnung Diffusion, Rekombination und Vorzeichen der zurückbleibenden Ionen und begründet die Richtung des inneren Feldes.
  - Observable performance (EN): In a fresh p/n arrangement, the learner explains diffusion, recombination and the signs of the remaining ions, and justifies the internal-field direction.
- `bias-transfer`
  - Essential understanding (DE): Äußere Polung verändert die Barriere und die Breite der Raumladungszone; räumliches Spiegeln ändert nicht, welche Anschlusskombination Durchlasspolung ist.
  - Essential understanding (EN): External bias changes the barrier and space-charge width; mirroring the drawing does not change which terminal combination is forward bias.
  - Observable performance (DE): Ohne übernommene Bildpfeile sagt die lernende Person für umgepolte oder gespiegelte Anordnungen die Barrierenänderung voraus und erklärt, warum Leitung keine vollständig verschwindende Zone voraussetzt.
  - Observable performance (EN): Without copying diagram arrows, the learner predicts barrier changes in reversed or mirrored arrangements and explains why conduction does not require complete disappearance of the zone.

**Coverage expectations**

- required expectations: `space-charge`, `bias-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `polarity-layout`: p/n-Anordnung spiegeln und Anschlussvorzeichen unabhängig davon ändern. / Mirror the p/n layout and independently change terminal signs.

**Application cases**

- `unbiased-contact`
  - Task demand (DE): Erkläre an einem noch unbeschrifteten Kontakt zweier dotierter Bereiche die Entstehung der Grenzschicht.
  - Task demand (EN): Explain depletion-layer formation at an initially unlabelled contact between doped regions.
  - Expected performance (DE): Ordne bewegliche Träger und ortsfeste Ionen zu und konstruiere eine kausale Erklärung samt Feldrichtung.
  - Expected performance (EN): Identify mobile carriers and fixed ions and construct a causal explanation including field direction.
  - Understanding focus (DE): Trägerverarmung ist nicht Ladungsfreiheit.
  - Understanding focus (EN): Carrier depletion is not absence of charge.
- `mirrored-forward`
  - Task demand (DE): Ein n/p-Bauteil wird links negativ und rechts positiv gepolt; entscheide ohne Kopie des ersten Bilds und prüfe die Behauptung einer völlig verschwindenden Sperrschicht.
  - Task demand (EN): An n/p device is biased negative on the left and positive on the right; decide without copying the first diagram and test the claim that the depletion region disappears completely.
  - Expected performance (DE): Begründe Durchlasspolung durch Anschlussart und Barrierenverringerung und weise das starre Auf/Zu-Bild zurück.
  - Expected performance (EN): Justify forward bias through terminal type and barrier reduction and reject a rigid open/closed picture.
  - Understanding focus (DE): Qualitative kontinuierliche Barriere statt geometrisch auswendig gelernter Links-Rechts-Regel.
  - Understanding focus (EN): Qualitative continuous barrier rather than a memorised left/right rule.
## Page 4: Bändermodell und Dotierung

- Full learning-goal ID: `df010b2b-b182-5f7e-bbe4-49b72e48c27a`
- Goal fingerprint: `sha256:c6efec78796cfdcaf140097dab80920d856bd38f6b3d0c45ed70772e151a6feb`
- Page fingerprint: `sha256:4dc0a850ab540f80acfb78b1e78c9fa35022007f6a18ed1888b6daf750ccc10f`
- Topic path: Physik > Bundeslandspezifische Ergänzungen > Stufenübergreifend > Weitere fachliche Ziele

### Canonical description

Die lernende Person kann das qualitative Bändermodell für Leiter und Halbleiter beschreiben und erklären, wie Dotierung die Leitfähigkeit beeinflusst.

### Visualization

/assets/goal-visualizations/physik/df010b2b-b182-5f7e-bbe4-49b72e48c27a/df010b2b-b182-5f7e-bbe4-49b72e48c27a.jpg

- original digest: `sha256:4c77a7de6f56e0861747efedce8744ca0a45dcd5c1c1fcc7d3fced1792492e43`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Leiter, Nichtleiter und Halbleiter — `7badac4d-2874-5b3a-87e8-bf8f4440b2a6` (page 1)

### Direct reverse prerequisites

- Supraleitung qualitativ verstehen — `853dbe54-85b0-59ab-8f3a-000c2b7746ec` (page 6)
- Quantenphysikalische Bändermodelle — `658cf33d-a0c2-5d47-801a-3dbcd5cac074` (page 5)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Halbleiter im Bändermodell deuten — `1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:65feae0b8b2da5caf257f1e305e183d77e16f4504725e315bbe07a7125f3f344`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `band-occupancy-and-gap-explain-conduction`
  - Essential understanding (DE): Teilweise besetzte oder überlappende Bänder erlauben bei Leitern leicht verfügbare Zustandswechsel; beim Halbleiter trennt eine endliche Bandlücke Valenz- und Leitungsband, sodass Anregung Ladungsträger bereitstellt.
  - Essential understanding (EN): Partly filled or overlapping bands permit readily available state changes in conductors; in a semiconductor a finite band gap separates valence and conduction bands, so excitation supplies charge carriers.
  - Observable performance (DE): Die lernende Person deutet ein unbekanntes qualitatives Banddiagramm, ordnet es begründet Leiter oder Halbleiter zu und behandelt Energiebänder nicht als räumliche Bahnen.
  - Observable performance (EN): The learner interprets an unfamiliar qualitative band diagram, justifies its classification as conductor or semiconductor, and does not treat energy bands as spatial trajectories.
- `doping-changes-carrier-population-not-net-charge`
  - Essential understanding (DE): Donator- beziehungsweise Akzeptordotierung erhöht die Zahl verfügbarer Elektronen beziehungsweise Löcher und verändert so die Leitfähigkeit, ohne den Kristall als Ganzes dauerhaft elektrisch aufzuladen.
  - Essential understanding (EN): Donor or acceptor doping increases the number of available electrons or holes and thus changes conductivity without permanently giving the crystal a net electric charge.
  - Observable performance (DE): Die lernende Person erklärt für n- und p-Dotierung Ladungsträgerart und Leitfähigkeitsänderung, bilanziert die Neutralität und grenzt die Wirkung von thermischer Anregung ab.
  - Observable performance (EN): The learner explains carrier type and conductivity change for n- and p-type doping, accounts for neutrality, and distinguishes the effect from thermal excitation.

**Coverage expectations**

- required expectations: `band-occupancy-and-gap-explain-conduction`, `doping-changes-carrier-population-not-net-charge`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `band-structure`: überlappende Bänder oder endliche Bandlücke / overlapping bands or a finite band gap
- `doping-type`: Donator- oder Akzeptordotierung / donor or acceptor doping
- `carrier-change`: Dotierung oder thermische Anregung / doping or thermal excitation

**Application cases**

- `unknown-band-diagrams-and-donor`
  - Task demand (DE): Deute zwei qualitative Diagramme: A zeigt ein teilweise besetztes Band, B ein gefülltes Valenzband, eine kleine Lücke und ein leeres Leitungsband. Ordne A und B zu und erkläre für B die Wirkung einer Donatordotierung.
  - Task demand (EN): Interpret two qualitative diagrams: A shows a partly filled band; B shows a filled valence band, a small gap, and an empty conduction band. Classify A and B and explain donor doping for B.
  - Expected performance (DE): A wird als Leiter, B als Halbleiter gedeutet. Donatoren stellen leicht anregbare Elektronen bereit, erhöhen die Elektronendichte im Leitungsband und typischerweise die Leitfähigkeit; zurückbleibende gebundene Ionen erhalten zusammen mit den Elektronen die Gesamtneutralität.
  - Expected performance (EN): A is interpreted as a conductor and B as a semiconductor. Donors supply easily excited electrons, increasing electron density in the conduction band and typically conductivity; the remaining bound ions preserve overall neutrality together with the electrons.
  - Understanding focus (DE): Bandstruktur, verfügbare Ladungsträger und Neutralität werden kausal verbunden.
  - Understanding focus (EN): Band structure, available carriers, and neutrality are connected causally.
- `acceptor-versus-heating-transfer`
  - Task demand (DE): Vergleiche für denselben Halbleiter Akzeptordotierung bei gleicher Temperatur mit einer Temperaturerhöhung ohne Dotierung. Sage jeweils die verfügbaren Ladungsträger voraus und erkläre, warum beide Leitfähigkeitsänderungen nicht derselbe Mechanismus sind.
  - Task demand (EN): For the same semiconductor, compare acceptor doping at constant temperature with raising temperature without doping. Predict the available carriers in each case and explain why the two conductivity changes are not the same mechanism.
  - Expected performance (DE): Akzeptoren erzeugen überwiegend Löcher als Mehrheitsladungsträger; Erwärmung regt Elektron-Loch-Paare über die Bandlücke an. Beide können die Trägerzahl erhöhen, doch nur Dotierung legt den Mehrheitsladungsträgertyp gezielt fest; Mobilitätsänderungen begrenzen eine reine Trägerzahldeutung.
  - Expected performance (EN): Acceptors produce holes as majority carriers; heating excites electron-hole pairs across the gap. Both may increase carrier population, but only doping deliberately establishes the majority-carrier type; mobility changes limit a carrier-count-only explanation.
  - Understanding focus (DE): Dotierung und thermische Anregung werden trotz ähnlicher Messwirkung modellseitig unterschieden.
  - Understanding focus (EN): Doping and thermal excitation are distinguished at the model level despite similar measurement effects.
## Page 5: Quantenphysikalische Bändermodelle

- Full learning-goal ID: `658cf33d-a0c2-5d47-801a-3dbcd5cac074`
- Goal fingerprint: `sha256:6d8a7ccb7de4314f36beeb1de5be33558faefe769a12772da76b97017b1ad929`
- Page fingerprint: `sha256:0402e6b0098d5ce64ee59f5137761e949f9f997e2cf7467d7841656e66b8f03e`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik

### Canonical description

Die lernende Person kann in einem vorgegebenen quantenphysikalischen Bändermodell die Lage der Fermienergie und die Besetzung erlaubter Elektronenzustände unter angegebenen Temperaturbedingungen zur Erklärung der elektrischen Leitfähigkeit nutzen.

### Visualization

/assets/goal-visualizations/physik/658cf33d-a0c2-5d47-801a-3dbcd5cac074/658cf33d-a0c2-5d47-801a-3dbcd5cac074.jpg

- original digest: `sha256:2fe6bae6f26cb1eca354dc7ffdaa9e5df40c551ab2beb1c3e65be9e2ea96e9f7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Bändermodell und Dotierung — `df010b2b-b182-5f7e-bbe4-49b72e48c27a` (page 4)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Besetzte Zustände und elektrische Leitfähigkeit — `71e8936b-fa8a-50dc-8c47-fca015b85ac5` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b5ae15a9b9e1aba7f95b0af2b8054bb10fe28950e9755abc1c1add30af4a6791`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `occupation`
  - Essential understanding (DE): Erlaubte Energiebänder legen mögliche Zustände fest; deren Besetzung wird im einfachen Modell relativ zur Fermienergie gedeutet. Eine Bandlücke enthält keine erlaubten Zustände und ist nicht dasselbe wie ein leeres erlaubtes Band.
  - Essential understanding (EN): Allowed energy bands specify possible states; their occupation is interpreted relative to Fermi energy in the simple model. A band gap contains no allowed states and differs from an empty allowed band.
  - Observable performance (DE): Die lernende Person interpretiert und ergänzt ein vorgegebenes Bänderschema, unterscheidet erlaubte/leere Zustände von einer Lücke und erläutert die Funktion der Fermienergie ohne sie zum Entstehungsmechanismus der Bänder zu machen.
  - Observable performance (EN): The learner interprets and completes a supplied band diagram, distinguishes allowed empty states from a gap, and explains the role of Fermi energy without treating it as the mechanism that creates bands.
- `temperature`
  - Essential understanding (DE): Bei T=0 sind im einfachen Fermimodell Zustände unterhalb der Fermienergie besetzt und oberhalb unbesetzt; bei endlicher Temperatur ist die Besetzungsgrenze nicht scharf und thermische Anregung kann Ladungsträger ermöglichen.
  - Essential understanding (EN): At T=0 in the simple Fermi model, states below Fermi energy are occupied and those above are empty; at finite temperature the occupation boundary is not sharp and thermal excitation may enable charge carriers.
  - Observable performance (DE): Die lernende Person erklärt den qualitativen Unterschied zweier ausdrücklich mit Temperaturbedingungen versehener Schemata und begründet, welche Leitfähigkeitsdeutung das vereinfachte Bild erlaubt.
  - Observable performance (EN): The learner explains the qualitative difference between two diagrams with explicit temperature conditions and justifies which conductivity interpretation the simplified picture supports.

**Coverage expectations**

- required expectations: `occupation`, `temperature`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `allowed-states`: Teilweise besetztes erlaubtes Band gegenüber vollständig besetztem Band und durch Lücke getrenntem leeren Band. / Partly occupied allowed band versus a full band and an empty band separated by a gap.
- `temperature-regime`: Idealisierter T=0-Grenzfall gegenüber erläutertem endlichem Temperaturzustand desselben intrinsischen Modellhalbleiters. / Idealised T=0 limit versus an explained finite-temperature state of the same intrinsic model semiconductor.

**Application cases**

- `complete-band-schema`
  - Task demand (DE): Bei T=0 sind für Modell M erlaubte Zustände von 0 bis 4 eV mit E_F=2 eV gegeben. Modell S hat ein Valenzband von 0 bis 1 eV, ein Leitungsband von 3 bis 5 eV und E_F=2 eV. Zeichne einfache Bänderschemata, markiere besetzte/unbesetzte Bereiche und erkläre den Unterschied einer leeren erlaubten Energie von einer Bandlücke.
  - Task demand (EN): At T=0, model M has allowed states from 0 to 4 eV with E_F=2 eV. Model S has a valence band from 0 to 1 eV, a conduction band from 3 to 5 eV and E_F=2 eV. Draw simple band diagrams, mark occupied/empty regions and explain the difference between an empty allowed energy and a band gap.
  - Expected performance (DE): Zeigt bei M Besetzung unter 2 eV und erlaubte leere Zustände darüber; bei S volles Valenzband, keine Zustände in 1–3 eV und leeres Leitungsband. Begründet qualitativ die unterschiedlichen Möglichkeiten naher freier Zustände; die künstlichen eV-Werte sind kein Materialdatenanspruch.
  - Expected performance (EN): Show M occupied below 2 eV with allowed empty states above; show S with a full valence band, no states in 1–3 eV and an empty conduction band. Qualitatively justify the different availability of nearby empty states; the artificial eV values are not claims about real material data.
  - Understanding focus (DE): Eigenes Energieschema übersetzt Zustandsangebot und Besetzung; Fermi-Energie als Besetzungsbezug statt Bandentstehung.
  - Understanding focus (EN): A self-constructed energy diagram translates available states and occupation; Fermi energy is an occupation reference, not a cause of band formation.
- `thermal-excitation`
  - Task demand (DE): Ein neuer intrinsischer Modellhalbleiter wird einmal idealisiert bei T=0 und einmal bei endlicher Temperatur dargestellt. Im zweiten Bild sind wenige Elektronen im Leitungsband und passende unbesetzte Zustände im Valenzband eingezeichnet; die erlaubten Bänder bleiben im Modell gleich. Erkläre und ergänze beide Schemata, ohne eine quantitative Anregungswahrscheinlichkeit zu berechnen.
  - Task demand (EN): A new intrinsic model semiconductor is shown once ideally at T=0 and once at finite temperature. The second diagram contains a few conduction-band electrons and corresponding empty valence-band states; allowed bands remain unchanged in the model. Explain and complete both diagrams without calculating quantitative excitation probabilities.
  - Expected performance (DE): Erklärt die thermische Umverteilung der Besetzung, ordnet Elektronen und verbleibende Löcher zusammen und begründet ihre mögliche Beteiligung an Leitung. Zeigt, dass erlaubte Bänder nicht erst durch die gezeichneten Elektronen entstehen und keine scharfe T=0-Besetzungsregel unverändert übertragen werden darf.
  - Expected performance (EN): Explain thermal redistribution of occupation, pair electrons with the holes left behind, and justify their possible role in conduction. Show that allowed bands are not created by the drawn electrons and that the sharp T=0 occupation rule cannot be transferred unchanged.
  - Understanding focus (DE): Echter Wechsel der Modellbedingung Temperatur mit unverändertem Zustandsangebot; qualitative Quanten-/Leitfähigkeitsdeutung ohne Fermi-Dirac-Rechenpflicht.
  - Understanding focus (EN): A genuine temperature-regime change with unchanged available states; qualitative quantum/conductivity interpretation without mandatory Fermi-Dirac calculations.
## Page 6: Supraleitung qualitativ verstehen

- Full learning-goal ID: `853dbe54-85b0-59ab-8f3a-000c2b7746ec`
- Goal fingerprint: `sha256:0bbac67d7a60096e3f2e04910f76dfdfcf50bb9b3e160cf279a15c7ed3620dcf`
- Page fingerprint: `sha256:55b284bb82d48d99160b807cb4e765f6815c50ef71e8e92844c00f6814a08cc2`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik

### Canonical description

Die lernende Person kann qualitativ beschreiben, dass ein Supraleiter unterhalb seiner kritischen Temperatur bei hinreichend kleinem Strom und Magnetfeld keinen elektrischen Gleichstromwiderstand zeigt und im Meißner-Zustand magnetischen Fluss aus seinem Inneren verdrängt, und damit einfache Anwendungen und Beobachtungen erläutern.

### Visualization

/assets/goal-visualizations/physik/853dbe54-85b0-59ab-8f3a-000c2b7746ec/853dbe54-85b0-59ab-8f3a-000c2b7746ec.jpg

- original digest: `sha256:9da94522e0bd0164aede4797bf15b03624cb1d47f3ef05fe80c0092960201776`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Bändermodell und Dotierung — `df010b2b-b182-5f7e-bbe4-49b72e48c27a` (page 4)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Magnetische Felder und Feldlinienbilder — `0f6b798b-594e-5480-8c5f-95e2486a4d85` (outside this book)

### Direct reverse prerequisites outside this book

- Festkoerperphysik und Halbleiterelektronik — `0f5346d6-de1b-5e38-aaba-68db205e594b` (outside this book)
- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7ff508bcf6297f6a8b2bde91225d867efe56a37e57307fc2d1254da297c3e9b7`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `transition`
  - Essential understanding (DE): Im vereinfachten supraleitenden Gleichstromzustand verschwindet der Widerstand unterhalb einer materialabhängigen kritischen Temperatur, solange die übrigen kritischen Bedingungen erfüllt sind.
  - Essential understanding (EN): In the simplified superconducting DC state, resistance vanishes below a material-dependent critical temperature provided the other critical conditions are met.
  - Observable performance (DE): Die lernende Person erklärt einen vorgegebenen R-T-Verlauf und sagt bei Überschreiten der kritischen Temperatur eine qualitative Zustandsänderung samt Anwendungsgrenze voraus.
  - Observable performance (EN): The learner explains a supplied R-T trace and predicts a qualitative state change and application limit when the critical temperature is exceeded.
- `magnetism`
  - Essential understanding (DE): Supraleitung umfasst besonderes magnetisches Verhalten wie den Meissner-Effekt; Levitation allein ist ohne Kenntnis des Aufbaus kein eindeutiger Nachweis und nicht bloß eine Folge kleinen Widerstands.
  - Essential understanding (EN): Superconductivity includes distinctive magnetic behaviour such as the Meissner effect; levitation alone is not conclusive without knowing the setup and is not merely a consequence of low resistance.
  - Observable performance (DE): Die lernende Person deutet eine passend dokumentierte Magnetbeobachtung zusammen mit Temperatur-/Widerstandsdaten und erklärt eine einfache Anwendung unter den angegebenen Modellbedingungen.
  - Observable performance (EN): The learner interprets an appropriately documented magnetic observation together with temperature/resistance data and explains a simple application under the stated model conditions.

**Coverage expectations**

- required expectations: `transition`, `magnetism`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `temperature-crossing`: Abkühlen beziehungsweise Erwärmen über T_c bei festgehaltenen, geeigneten Strom- und Feldbedingungen. / Cooling or warming across T_c with fixed suitable current and field conditions.
- `observation-specificity`: Dokumentierter supraleitender Aufbau gegenüber einer Schwebe-Beobachtung mit unbekanntem Mechanismus. / Documented superconducting setup versus a levitation observation with an unknown mechanism.

**Application cases**

- `resistance-transition`
  - Task demand (DE): Ein bereitgestelltes idealisiertes Gleichstromdiagramm eines Modellmaterials zeigt R=0 unter 90 K und R>0 darüber; Strom und Magnetfeld liegen im geeigneten Bereich. Ein dokumentierter Aufbau verwendet das Material bei 80 K als supraleitenden Leiter. Erkläre die Beobachtung und sage die Auswirkung einer Erwärmung auf 95 K auf diese Anwendung voraus.
  - Task demand (EN): A supplied idealised DC diagram of a model material shows R=0 below 90 K and R>0 above; current and magnetic field are in the suitable range. A documented setup uses the material at 80 K as a superconducting conductor. Explain the observation and predict the effect on this application of warming to 95 K.
  - Expected performance (DE): Ordnet 80 K dem supraleitenden und 95 K dem normalleitenden Zustand zu, erläutert den Verlust des widerstandsfreien Betriebs und trennt den idealisierten Nullwert von einer experimentellen Aussage 'unter Messgrenze'. Keine tatsächliche Kühlanlage bedienen.
  - Expected performance (EN): Classify 80 K as superconducting and 95 K as normal-conducting, explain the loss of resistance-free operation, and distinguish the idealised zero from an experimental statement 'below detection limit'. Do not operate real cooling equipment.
  - Understanding focus (DE): Kritische Zustandsbedingung, Mess-/Modellunterscheidung und eine konkrete Anwendungsgrenze.
  - Understanding focus (EN): Critical state condition, measurement/model distinction and a concrete application limit.
- `levitation-comparison`
  - Task demand (DE): Zwei neue Lehrvideos zeigen je einen schwebenden Magneten. Zu A sind ein supraleitendes Material, geeignete kleine Feldstärke, Temperatur unter T_c und magnetische Flussverdrängung dokumentiert; bei Erwärmung über T_c endet dieses Verhalten. Zu B ist nur das Schweben sichtbar, der Aufbau unbekannt. Erkläre A qualitativ und beurteile, was sich über B ableiten lässt.
  - Task demand (EN): Two fresh teaching videos each show a levitating magnet. A documents a superconducting material, a suitably small field, temperature below T_c and magnetic-flux expulsion; warming above T_c ends this behaviour. B shows levitation only, with the setup unknown. Qualitatively explain A and assess what can be inferred about B.
  - Expected performance (DE): Verknüpft As dokumentiertes Verhalten mit dem Meissner-Effekt im angegebenen Zustandsbereich und erklärt seine Temperaturabhängigkeit. Erkennt für B mehrere mögliche Mechanismen und fordert zusätzliche Material-/Temperatur-/Widerstands- oder Magnetbelege statt eines automatischen Supraleitungsbeweises.
  - Expected performance (EN): Connect A's documented behaviour with the Meissner effect in the stated regime and explain its temperature dependence. Recognise multiple possible mechanisms for B and request additional material, temperature, resistance or magnetic evidence instead of treating levitation as automatic proof of superconductivity.
  - Understanding focus (DE): Frischer Wechsel der Evidenzqualität; Phänomen, Modellzuordnung und bloß sichtbare Schwebe-Beobachtung bleiben getrennt.
  - Understanding focus (EN): Fresh change in evidence quality; phenomenon, model attribution and visible levitation alone remain distinct.
## Page 7: Einen bipolaren Transistor als Schalter funktional untersuchen

- Full learning-goal ID: `7d4d6a39-0c78-5fb0-b7bf-182ed00972f7`
- Goal fingerprint: `sha256:d6d6359cce2835298a4f32db588a5d978bd0311fa7e6aa8659294debed635651`
- Page fingerprint: `sha256:47ccccb19f0cc0a8cfa8cddf38f1e231b943e912f8dcca0be0b213a000fdf2a2`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik > Transistorschaltungen

### Canonical description

Die lernende Person kann an einem vorgegebenen npn- oder pnp-Transistoraufbau die Funktion von Basis, Kollektor und Emitter mithilfe eines einfachen Halbleitermodells erklären und daraus das Ein- und Ausschalten des Laststromkreises begründen.

### Visualization

/assets/goal-visualizations/physik/7d4d6a39-0c78-5fb0-b7bf-182ed00972f7/7d4d6a39-0c78-5fb0-b7bf-182ed00972f7.jpg

- original digest: `sha256:81a177a4e4ee2ecf2befe16093416576c8b5dbe05b9b9e31dba2c42f39304db7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Sperrschicht und Polung am p-n-Übergang erklären — `2084b7d4-300d-5fa0-8b8d-c480c40f853e` (page 3)

### Direct reverse prerequisites

- Transistorverstärker analysieren — `af50bb9a-fd7b-50f5-9698-48c4efe99032` (page 8)
- Eine bistabile Transistor-Flipflop-Schaltung deuten — `c2af45aa-e3fc-5119-9159-c5a260b4135a` (page 9)

### Prerequisites outside this book

- Zwischen Stromkreis und Schaltplan übersetzen — `69f8f59c-b0c3-5b0b-82db-834a0e655736` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Einen Transistor als Schalter deuten — `88f27aab-8724-5a4d-8543-e49ebcb54b8e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a73317d31e1f7c794933041e9a0e98902a9f9538786ae5026622038bc8fc33d9`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `functional-understanding`
  - Essential understanding (DE): Eine geeignete Basis-Emitter-Ansteuerung beeinflusst im gelieferten bipolaren Modell den Ladungsträgertransport durch die dünne Basis und damit den Kollektor-Emitter-Laststrom. Die Lastenergie stammt aus der Versorgung; der Basiszweig ist kein mechanischer Kontakt und erzeugt diese Energie nicht.
  - Essential understanding (EN): In the supplied bipolar model, suitable base-emitter drive affects carrier transport through the thin base and therefore collector-emitter load current. Load energy comes from the supply; the base branch is neither a mechanical contact nor the source of that energy.
  - Observable performance (DE): Identifiziert B, C, E sowie Steuer- und Lastpfad und begründet beide gelieferten Schaltzustände konkret mit dem bereitgestellten dünnen-Basis-Modell. Unterscheidet Lastenergie aus der Versorgung von der Steuerwirkung des Basiszweigs. Die Leistung ist Materialdeutung; sie bescheinigt keinen eigenen Aufbau und keine eigenen Messungen.
  - Observable performance (EN): Identifies B, C, E and control and load paths and explains both supplied switching states specifically through the supplied thin-base model. Distinguishes load energy from the supply and control by the base branch. This is material interpretation; it certifies neither personal construction nor personal measurements.
- `independent-transfer`
  - Essential understanding (DE): Geeignete Basisansteuerung, veränderte Sensorwirkung und angegebene npn-/pnp-Polung bestimmen die Schaltprognose im gelieferten Modell; eine feste Hell-Dunkel-Regel ersetzt die konkrete Beschaltung nicht.
  - Essential understanding (EN): Appropriate base drive, changed sensor behaviour and specified npn/pnp polarity determine switching predictions in the supplied model; a fixed light/dark rule cannot replace the actual circuit.
  - Observable performance (DE): Für einen unterbrochenen Basiszweig oder eine umgekehrte Sensorwirkung sagt die lernende Person die geänderte Schaltfunktion voraus. Sie überträgt Spannungsrichtungen nicht ungeprüft von npn auf pnp und behauptet keine universelle konstante Stromverstärkung im Schaltbetrieb.
  - Observable performance (EN): For a broken base branch or reversed sensor response, the learner predicts the altered switching behaviour. They do not transfer voltage directions uncritically from npn to pnp or claim a universally constant current gain during switching.

**Coverage expectations**

- required expectations: `functional-understanding`, `independent-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-drive-and-polarity`: Umgekehrte Sensorwirkung, unterbrochener Steuerzweig und gegebenenfalls bereitgestellte pnp-Variante mit angegebenen Spannungsrichtungen. / Reversed sensor response, interrupted control branch and, where supplied, a pnp variant with specified voltage directions.

**Application cases**

- `supplied-thin-base-function`
  - Task demand (DE): Ein neuer vollständig beschrifteter npn-Lehrmodulplan und eine einfache Halbleiterdarstellung mit dünner Basis sowie dokumentierte Ein-/Aus-Zustände sind vorgegeben. Begründe Steuer-/Lastpfad, Energiequelle und beide Schaltzustände mit dem Ladungsträgertransport im gelieferten Modell.
  - Task demand (EN): A fresh fully labelled npn teaching-module plan, a simple thin-base semiconductor representation and documented on/off states are supplied. Use carrier transport in the supplied model to explain control/load paths, energy source and both switching states.
  - Expected performance (DE): Die Person verknüpft die Anschlussrollen und geeignete Basis-Emitter-Ansteuerung mit Ladungsträgertransport durch die dünne Basis zum Kollektor. Sie trennt Steuerung und Versorgungsenergie und begründet die gegebenen Zustände; bloßes Benennen eines Steuerpfeils genügt nicht. Sie gibt die fremden Materialdaten nicht als eigenen Aufbau oder eigene Messung aus.
  - Expected performance (EN): The learner connects terminal roles and appropriate base-emitter drive to carrier transport through the thin base to the collector. They distinguish control from supply energy and justify the given states; merely naming a control arrow is insufficient. Supplied material is not presented as personal construction or measurement.
  - Understanding focus (DE): Schaltung und einfaches Trägermodell werden kausal zur funktionalen Deutung verbunden.
  - Understanding focus (EN): Circuit and simple carrier model are causally connected for functional interpretation.
- `changed-sensor-model-transfer`
  - Task demand (DE): Ein neuer vollständiger Sensorplan kehrt bei gleichem Lastkreis seine Hell-Dunkel-Ausgangspegel um. Sage beide Lastzustände und die Wirkung eines im Material definierten offenen Basiszweigs voraus und begründe sie aus Beschaltung und dünnem-Basis-Modell. Für eine bereitgestellte pnp-Variante prüfe die angegebenen Spannungsrichtungen neu.
  - Task demand (EN): A fresh complete sensor diagram reverses light/dark output levels with the same load circuit. Predict both load states and the effect of an open base branch defined by the supplied material, using the circuit and thin-base model. For a supplied pnp variant, check the specified voltage directions afresh.
  - Expected performance (DE): Die Person folgt der tatsächlichen Basisansteuerung und erklärt die Trägerwirkung statt einer festen Hell-Dunkel-Regel. Den offenen Steuerzweig deutet sie anhand der gegebenen Bedingungen; eine pnp-Polung wird nicht ungeprüft von npn übernommen. Sie unterscheidet elektronische Steuerung und mechanischen Kontakt und leitet aus zwei Schaltzuständen keinen universellen konstanten Verstärkungsfaktor ab.
  - Expected performance (EN): The learner follows actual base drive and explains the carrier mechanism instead of applying a fixed light/dark rule. They interpret an open control branch from the supplied conditions, and do not transfer npn polarity rules to pnp uncritically. They distinguish electronic control from a mechanical contact and infer no universal constant gain from two switching states.
  - Understanding focus (DE): Tatsächlich geänderter Ansteuerungsfall verlangt eigenständige Modellprognose, ohne eine eigene Durchführung zu behaupten.
  - Understanding focus (EN): A genuinely changed drive condition requires an independent model prediction without claiming personal experimental execution.
## Page 8: Transistorverstärker analysieren

- Full learning-goal ID: `af50bb9a-fd7b-50f5-9698-48c4efe99032`
- Goal fingerprint: `sha256:34a98303b95d812011ac3ab7c9e976aab7ea43b82358e6d411d98756051650a4`
- Page fingerprint: `sha256:09557adbc593a652bd6df312a6a08dcdf1927a30f30b4f788cbc6e33c9b8fc05`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik

### Canonical description

Die lernende Person kann an einer vorgegebenen oder selbst aufgebauten bipolaren Verstärkerschaltung anhand vorgegebener Kennlinien, des Arbeitspunkts und der angegebenen Spannungsbeziehungen erklären, wie das Eingangssignal den Ausgang steuert, welche Strom- oder Spannungsverstärkung die vorgegebenen Daten belegen und welche Grenzen für eine unverzerrte Verstärkung gelten. Bei einer einfachen Emitterschaltung deutet sie dabei die vorgegebene Spannungsabfallbeziehung im Kollektorzweig; ein vorgesehener eigener Aufbau erfolgt unter Aufsicht mit strombegrenzter Kleinspannung.

### Visualization

/assets/goal-visualizations/physik/af50bb9a-fd7b-50f5-9698-48c4efe99032/af50bb9a-fd7b-50f5-9698-48c4efe99032.jpg

- original digest: `sha256:438402ac93ebe6d746bfc077c75cff3c5908a561493786fc09bfdcac619900df`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Einen bipolaren Transistor als Schalter funktional untersuchen — `7d4d6a39-0c78-5fb0-b7bf-182ed00972f7` (page 7)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)

### Direct reverse prerequisites outside this book

- Festkoerperphysik und Halbleiterelektronik — `0f5346d6-de1b-5e38-aaba-68db205e594b` (outside this book)
- Prüfungsaufgabe: Arbeitspunkt und Verzerrung einer Emitterschaltung — `144007cb-e2bc-5c82-bf9d-dda705b15257` (outside this book)
- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c44327777e743449413065ec627bf7aa83fcfdfea86682f439670eb23f61ec23`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `quantity-specific-gain`
  - Essential understanding (DE): Eine Verstärkungsangabe vergleicht benannte gleichartige Größen: Das angegebene Verhältnis von Kollektor- zu Basisstromänderung belegt Stromverstärkung im aktiven Bereich. Die Umrechnung eines Basisstromsignals in eine Ausgangsspannung ist davon zu unterscheiden; ohne Eingangsspannungsdaten ist keine Spannungsverstärkung bestimmt.
  - Essential understanding (EN): A gain claim compares named quantities of the same kind: the stated ratio of collector-current to base-current changes establishes current gain in the active region. Conversion of a base-current signal into output voltage is distinct; without input-voltage data, voltage gain is not determined.
  - Observable performance (DE): Vergleicht Basis- und Kollektorstromänderungen in gemeinsamen Einheiten, begründet die belegte Stromverstärkung und trennt sie von der gelieferten Strom-Spannungs-Übertragung und einer nicht belegten Spannungsverstärkung.
  - Observable performance (EN): Compares base- and collector-current changes in common units, justifies the current gain established by the data and distinguishes it from supplied current-to-voltage transfer and unsupported voltage gain.
- `supplied-load-model`
  - Essential understanding (DE): Im vorgegebenen Emitterschaltungsmodell stammt die Lastenergie aus der festen Versorgung. Das hier zu lernende Lastmodell besagt: Größerer Kollektorstrom vergrößert den Spannungsabfall am gegebenen Lastwiderstand und verkleinert den verbleibenden Ausgangsanteil. Dies wird aus bereitgestelltem Modell und Daten entwickelt, nicht als bereits gemeisterte allgemeine Kirchhoff-/Ohm-Kompetenz vorausgesetzt.
  - Essential understanding (EN): In the supplied common-emitter model, load energy comes from the fixed supply. The load model learned here states that greater collector current increases the drop across the given load resistor and reduces the remaining output share. This is developed from supplied model/data, not assumed as prior general Kirchhoff/Ohm mastery.
  - Observable performance (DE): Verknüpft Basisansteuerung, vorgegebene Kollektorstromänderung, Widerstandsabfall und Ausgang; begründet die schaltungsspezifische Umkehr und die Energiequelle aus dem Material.
  - Observable performance (EN): Connects base drive, supplied collector-current change, resistor drop and output; uses the material to justify this circuit-specific inversion and energy source.
- `operating-point-and-limits`
  - Essential understanding (DE): Eine kleine Signaländerung lässt sich nur innerhalb des angegebenen aktiven Bereichs durch das vorgegebene Verstärkermodell fortsetzen. Sperren und Sättigung begrenzen den Ausgang; eine größere formale Modelländerung ist nicht automatisch physikalisch erreichbar.
  - Essential understanding (EN): A small signal variation can be propagated by the supplied amplifier model only within the stated active region. Cutoff and saturation bound the output; a larger formal model variation is not automatically physically attainable.
  - Observable performance (DE): Prüft beide Ausgangsgrenzen, unterscheidet unverzerrte kleine Änderungen von Begrenzung und wählt bei gegebenen Alternativen einen geeigneteren Arbeitspunkt.
  - Observable performance (EN): Checks both output limits, distinguishes undistorted small changes from clipping and selects a more suitable bias point among supplied alternatives.

**Coverage expectations**

- required expectations: `quantity-specific-gain`, `supplied-load-model`, `operating-point-and-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `bias-position`: Symmetrischer kleiner Ausschlag und größerer begrenzter Ausschlag; neuer sättigungsnaher Arbeitspunkt mit Korrektur bei gleicher geforderter Eingangsamplitude. / A small symmetric swing and a larger clipped swing; a fresh bias near saturation corrected while retaining the requested input amplitude.
- `supplied-representation`: Vorgegebene Lastbeziehung mit Spannungstabelle oder qualitativer Lastkennlinie übersetzen; keine zusätzliche Messdurchführung. / Translate a supplied load relation using a voltage table or qualitative load characteristic; no extra experimental execution.

**Application cases**

- `provided-current-gain-and-load`
  - Task demand (DE): Ein neuer vollständig beschrifteter npn-Emitterschaltungsplan liefert 10 V Versorgung, R_C=1 kΩ, I_C=100I_B nur im aktiven Bereich, U_R=R_C I_C und U_C=10 V−U_R sowie Ausgangsgrenzen 0,2 V/10 V. Für I_B=50±10 µA vergleiche die Basis- und Kollektorstromänderungen in gemeinsamen Einheiten und erkläre, welche Verstärkung belegt ist. Eine Eingangsspannung ist nicht angegeben. Erkläre getrennt Ausgangsänderung, Phasenumkehr und Energiequelle aus dem bereitgestellten Lastmodell. Prüfe anschließend das gleiche Modell bei 50±60 µA gegen beide Grenzen.
  - Task demand (EN): A fresh fully labelled npn common-emitter diagram supplies a 10 V source, R_C=1 kΩ, I_C=100I_B only in the active region, U_R=R_C I_C and U_C=10 V−U_R, and output limits 0.2 V/10 V. For I_B=50±10 µA compare base- and collector-current changes in common units and explain which gain is established. No input voltage is supplied. Separately explain output change, inversion and energy source from the supplied load model. Then test the same model at 50±60 µA against both limits.
  - Expected performance (DE): ±10 µA Basisstrom steuern aktiv±1 mA=±1000 µA Kollektorstrom: Stromverstärkung 100. Der Ausgang liegt bei 5 V und schwankt 6/4 V; I_C↑ bewirkt U_R↑ und U_C↓. Das ist eine invertierende Strom-Spannungs-Übertragung dieser Schaltung; ein Spannungsverstärkungsfaktor ist ohne Eingangsspannung nicht bestimmbar. Die Versorgung liefert Lastenergie, der Eingang steuert deren Übertragung. Bei±60 µA würde die aktive Fortsetzung 11/−1 V verlangen; Sperren 10 V und Sättigung 0,2 V begrenzen beide Seiten. Das Modell wird nicht über seine Gültigkeit hinaus als konstante Verstärkung behauptet.
  - Expected performance (EN): A±10 µA base change controls±1 mA=±1000 µA collector change in the active region: current gain 100. Output is biased at 5 V and varies 6/4 V; I_C↑ produces U_R↑ and U_C↓. This is the circuit's inverting current-to-voltage transfer; voltage gain cannot be determined without input voltage. The supply provides load energy while the input controls its transfer. At±60 µA the active extrapolation demands 11/−1 V; cutoff 10 V and saturation 0.2 V clip both sides. Constant gain is not claimed beyond the model's range.
  - Understanding focus (DE): Benannte Stromverstärkung, neu entwickeltes Lastmodell, Energie/Steuerung und begründete beidseitige Modellgrenzen bilden zusammen den Nachweis.
  - Understanding focus (EN): Named current gain, the newly developed load model, energy/control and justified two-sided limits together supply the evidence.
- `changed-bias-independent-transfer`
  - Task demand (DE): Im bereitgestellten Modell liegt der neue Arbeitspunkt bei I_B=80 µA mit±30 µA Eingangssignal. Erkläre mit Kollektorstrom, Spannungsaufteilung und Energiequelle, wie sich der Ausgang verändert; prüfe beide Grenzen und wähle einen gelieferten Arbeitspunkt, der dieselben±30 µA unverzerrt überträgt. Begründe für den korrigierten aktiven Fall erneut den gleichartigen Strom-Amplitudenvergleich und die Grenze einer Spannungsverstärkungsbehauptung.
  - Task demand (EN): In the supplied model, the fresh bias is I_B=80 µA with a±30 µA input signal. Use collector current, voltage sharing and energy source to explain output changes; check both limits and select a supplied bias transmitting the same±30 µA without distortion. For the corrected active case, independently justify the same-quantity current-amplitude comparison and the limit on claims of voltage gain.
  - Expected performance (DE): Bei 80 µA ist U_C=2 V:1,8 V Spielraum nach unten und 8 V nach oben.50..110 µA würden aktiv 5..−1 V verlangen; die untere Seite sättigt. Beispielsweise 50±30 µA ergeben 20..80 µA, I_C=2..8 mA und U_C=8..2 V, also beide Grenzen eingehalten. Im korrigierten aktiven Fall sind±3 mA/±30 µA nach Einheitenangleichung 100; für den ursprünglich begrenzten gesamten Ausschlag wird dieser Faktor nicht behauptet. Mehr Kollektorstrom erhöht den Widerstandsabfall und senkt bei fester Versorgung den Ausgang. Die 10 V-Versorgung liefert die Energie; eine passende kurze Rückbeziehung auf dasselbe Prinzip genügt. Ohne Eingangsspannung bleibt ein Spannungsverstärkungsfaktor unbestimmt. Eine kleinere Amplitude löst nicht den gestellten unveränderten±30 µA-Auftrag.
  - Expected performance (EN): At 80 µA, U_C=2 V gives 1.8 V downward and 8 V upward headroom.50..110 µA would demand 5..−1 V in the active model, so the lower side saturates. For example,50±30 µA gives 20..80 µA, I_C=2..8 mA and U_C=8..2 V, within both limits. In this corrected active case,±3 mA/±30 µA is 100 after unit conversion; this factor is not claimed across the originally clipped full excursion. Greater collector current increases resistor drop and lowers output at fixed supply. The 10 V source provides energy; a concise correctly applied reference to the same principle suffices. Without input voltage, voltage gain remains undetermined. Reducing amplitude does not solve the stated unchanged±30 µA requirement.
  - Understanding focus (DE): Echter veränderter Arbeitspunkt verlangt eigene begründete Übertragung aller Pflichtaspekte und eine wirksame Korrektur bei gleichem Signal.
  - Understanding focus (EN): A genuinely changed bias requires an independently justified application of all essential aspects and an effective correction retaining the signal.
## Page 9: Eine bistabile Transistor-Flipflop-Schaltung deuten

- Full learning-goal ID: `c2af45aa-e3fc-5119-9159-c5a260b4135a`
- Goal fingerprint: `sha256:a1ba25bc24cf19769180614f94f5003804b1b721d4979d8580fbb9c5fb2aed2a`
- Page fingerprint: `sha256:22c0bcbcd0927ac88ad57adc280af918dbfe5960b4f9ed35e74a549767083cf1`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik > Transistorschaltungen

### Canonical description

Die lernende Person kann an einer vorgegebenen bistabilen Transistorschaltung erklären, wie gegenseitige Rückkopplung zwei stabile Zustände ermöglicht, und anhand der Schaltung vorhersagen, wie ein geeigneter Schaltimpuls den gespeicherten Zustand ändert.

### Visualization

/assets/goal-visualizations/physik/c2af45aa-e3fc-5119-9159-c5a260b4135a/c2af45aa-e3fc-5119-9159-c5a260b4135a.jpg

- original digest: `sha256:7488e7eeb6d9ec6ca1b7d6606abec0901c2cb19ac239fbaa205a5c3a96ed602e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Einen bipolaren Transistor als Schalter funktional untersuchen — `7d4d6a39-0c78-5fb0-b7bf-182ed00972f7` (page 7)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Festkoerperphysik und Halbleiterelektronik — `0f5346d6-de1b-5e38-aaba-68db205e594b` (outside this book)
- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)
- Prüfungsaufgabe: Einen gespeicherten Schaltzustand ändern — `5902ebe8-2025-5a7c-b95d-13057398d6e6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:87f66f2c8bc4a6bf4a47dd93f5406c96848fbc783ad5919ca4bbe9ea3401056a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `functional-understanding`
  - Essential understanding (DE): Gegenseitige Rückkopplung kann in einer passenden Transistorschaltung zwei stabile Zustände erzeugen. Ein Zustand bleibt nach dem auslösenden Impuls erhalten; diese Speicherwirkung unterscheidet Bistabilität vom einfachen Sensor-Schalter.
  - Essential understanding (EN): Mutual feedback in a suitable transistor circuit can produce two stable states. A state persists after its triggering pulse; this memory effect distinguishes bistability from a simple sensor-controlled switch.
  - Observable performance (DE): Die lernende Person verfolgt in einer vorgegebenen gekreuzt rückgekoppelten Schaltung die beiden stabilen Fälle, begründet jeweils das leitende beziehungsweise sperrende Bauteil und erklärt, warum der jeweilige Zustand erhalten bleibt.
  - Observable performance (EN): The learner traces both stable cases in a supplied cross-coupled circuit, justifies which transistor conducts or is cut off in each case, and explains why that state persists.
- `independent-transfer`
  - Essential understanding (DE): Anderen Impulseingang oder Rückkopplungsunterbrechung bei vollständig vorgegebenem Schaltungsmodell untersuchen.
  - Essential understanding (EN): Investigate another pulse input or a disconnected feedback path with a fully supplied circuit model.
  - Observable performance (DE): Für einen passend eingezeichneten Setz- oder Rücksetzimpuls prognostiziert die lernende Person den neuen Zustand und dessen Fortbestehen. Bei geöffneter Rückkopplung erklärt sie, weshalb aus dem vorherigen Speichermodell keine unveränderte Aussage mehr folgt.
  - Observable performance (EN): For an appropriately indicated set or reset pulse, the learner predicts the new state and its persistence. With feedback disconnected, they explain why the previous memory model no longer yields the same conclusion.

**Coverage expectations**

- required expectations: `functional-understanding`, `independent-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `physical-condition`: Anderen Impulseingang oder Rückkopplungsunterbrechung bei vollständig vorgegebenem Schaltungsmodell untersuchen. / Investigate another pulse input or a disconnected feedback path with a fully supplied circuit model.

**Application cases**

- `fresh-function-case`
  - Task demand (DE): In einer neu beschrifteten bistabilen npn-Schaltung leitet zunächst der rechte Transistor. Verfolge einen Impuls, der dessen Basis kurz auf Masse zieht, und bestimme beide Kollektorpegel nach dem Loslassen.
  - Task demand (EN): In a freshly labelled bistable npn circuit, the right transistor initially conducts. Trace a pulse briefly grounding its base and determine both collector levels after release.
  - Expected performance (DE): Die lernende Person begründet beide Rückkopplungsschritte, den Zustandswechsel und das Fortbestehen; sie braucht keine auswendig gelernte Setz/Rücksetz-Tabelle.
  - Expected performance (EN): The learner explains both feedback steps, the state change and persistence; no memorized set/reset table is needed.
  - Understanding focus (DE): Gegenseitige Rückkopplung kann in einer passenden Transistorschaltung zwei stabile Zustände erzeugen. Ein Zustand bleibt nach dem auslösenden Impuls erhalten; diese Speicherwirkung unterscheidet Bistabilität vom einfachen Sensor-Schalter.
  - Understanding focus (EN): Mutual feedback in a suitable transistor circuit can produce two stable states. A state persists after its triggering pulse; this memory effect distinguishes bistability from a simple sensor-controlled switch.
- `changed-condition-case`
  - Task demand (DE): Öffne im vorgegebenen Funktionsmodell genau einen Rückkopplungspfad. Prüfe, welche bisherige Begründung der zwei stabilen Zustände dadurch ausfällt und welche Angaben für eine neue Prognose fehlen.
  - Task demand (EN): Open exactly one feedback path in the supplied functional model. Identify which prior argument for two stable states fails and which information a new prediction would require.
  - Expected performance (DE): Die lernende Person lokalisiert die fehlende gegenseitige Stabilisierung und behauptet weder unveränderte Speicherung noch automatische Dauerschwingung.
  - Expected performance (EN): The learner locates the missing mutual stabilization and claims neither unchanged memory nor automatic oscillation.
  - Understanding focus (DE): Anderen Impulseingang oder Rückkopplungsunterbrechung bei vollständig vorgegebenem Schaltungsmodell untersuchen.
  - Understanding focus (EN): Investigate another pulse input or a disconnected feedback path with a fully supplied circuit model.
## Page 10: Transistorschaltung selbst aufbauen und untersuchen

- Full learning-goal ID: `77ab31a9-8961-511c-8637-06e98023d869`
- Goal fingerprint: `sha256:2b3142ed4628d0360456b5f05ed98f4c513c31e03ba50946aaace1e170ed6fc9`
- Page fingerprint: `sha256:b8b6c187464ef8cd85c8720969c4f85e809f656068fc913791c2af98c82b7953`
- Topic path: Physik > Sekundarstufe I > Halbleiterbauelemente: Grundlagen

### Canonical description

Die lernende Person kann eine vollständig vorgegebene einfache Transistorschaltung unter Aufsicht mit strombegrenzter Kleinspannung selbst aufbauen, ihre Schaltwirkung durch gezieltes Verändern der Ansteuerung und einen Kontrollversuch anhand eigener Beobachtungen untersuchen und funktional begründen sowie die Ergebnisse auf eine geänderte Eingangszuordnung übertragen.

### Visualization

/assets/goal-visualizations/physik/77ab31a9-8961-511c-8637-06e98023d869/77ab31a9-8961-511c-8637-06e98023d869.png

- original digest: `sha256:29631652dceecf06bddf9ded1c7dbb0627d5a8af2d086cf013ae8504b9603fff`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Zwischen Stromkreis und Schaltplan übersetzen — `69f8f59c-b0c3-5b0b-82db-834a0e655736` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Transistorschaltung selbst untersuchen — `2cfd5c6a-a16a-5f90-aab7-b27b29271f72` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6bed8872f34c032063870d4ebef5479c054877064e4fa275b36279d061469b93`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `personal-safe-construction`
  - Essential understanding (DE): Ein tatsächlich hergestellter sicherer Aufbau muss zum vollständigen Plan passen; Pinbezug, gemeinsamer Rückleiter, Strombegrenzung und definierter Basisbezug sind konkrete Bedingungen eines aussagefähigen Versuchs.
  - Essential understanding (EN): An actually assembled safe setup must match the complete plan; pin references, common return, current limitation and a defined base reference are concrete conditions for an informative experiment.
  - Observable performance (DE): Stellt unter Aufsicht mit ausgeschalteter Versorgung selbst den vollständigen Aufbau her und lässt ihn vor Inbetriebnahme kontrollieren; ein fremder Bericht zählt nicht als Eigenaufbau.
  - Observable performance (EN): Personally assembles the complete circuit under supervision with power off and obtains inspection before switching on; another person's report does not count as personal construction.
- `controlled-own-observation`
  - Essential understanding (DE): Gezielte Änderung des angeschlossenen Steuersignals und ein geeigneter Kontrollversuch trennen beobachtete Schaltwirkung von bloßer Vermutung; die Versorgung liefert die Lastenergie.
  - Essential understanding (EN): Deliberate changes to the connected control signal and an appropriate control trial distinguish observed switching from conjecture; the supply provides load energy.
  - Observable performance (DE): Variiert selbst 0/5 V, dokumentiert eigene Lastzustände, untersucht tatsächlich den offenen und wiederhergestellten Steuerzweig und begründet den Zusammenhang funktional aus dem Plan und eigenen Beobachtungen.
  - Observable performance (EN): Personally varies 0/5 V, documents their own load states, actually tests the open and restored control branch and justifies the functional relationship using the plan and observations.
- `fresh-experimental-transfer`
  - Essential understanding (DE): Eine veränderte Sensor-Ausgangszuordnung ändert die passende Schaltprognose; ein abgeschalteter oder getrennter Steuerpfad ist nicht durch einen bloß angezeigten Quellenwert ersetzt.
  - Essential understanding (EN): Changing the sensor-output mapping changes the appropriate switching prediction; a disconnected control path is not replaced by a source value merely shown on its setting.
  - Observable performance (DE): Prognostiziert und prüft eine neue umgekehrte Zuordnung mit der gelieferten Steuerung selbst, vergleicht sie mit dem Kontrollversuch und begrenzt Schlüsse auf die tatsächlich untersuchte Schaltwirkung statt universeller quantitativer Verstärkung.
  - Observable performance (EN): Personally predicts and checks a fresh reversed mapping using the supplied control, compares it with the control trial and limits conclusions to the switching actually investigated rather than universal quantitative gain.

**Coverage expectations**

- required expectations: `personal-safe-construction`, `controlled-own-observation`, `fresh-experimental-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `connected-versus-open-control`: Angeschlossener und tatsächlich geöffneter Steuerzweig bei definierter Basis-Pull-down-Verbindung. / Connected and actually opened control branch with a defined base pull-down.
- `reversed-input-mapping`: Neue umgekehrte Hell-Dunkel-Ausgangszuordnung mit tatsächlichen eigenen Kontrollstellungen. / Fresh reversed light/dark output mapping with actual personal control settings.

**Application cases**

- `own-setup-and-two-inputs`
  - Task demand (DE): Baue einen neuen vollständig vorgegebenen strombegrenzten Kleinspannungs-Transistorschalter unter Aufsicht selbst nach Plan auf. Prüfe nach Freigabe selbst beide gelieferten Steuerwerte und dokumentiere die tatsächlich beobachteten Lastzustände; begründe Steuer-/Lastpfad funktional.
  - Task demand (EN): Personally assemble a fresh fully supplied current-limited low-voltage transistor switch from the plan under supervision. After inspection, personally test both supplied input values and document actual load observations; explain control/load paths functionally.
  - Expected performance (DE): Echter sicherer Eigenaufbau und eigene gezielte Variation sind beobachtet. Die Person verbindet dokumentierte Zustände mit dem tatsächlich angeschlossenen Eingang und der Versorgungsenergie; fremde Daten oder bloße Selbstaussage ersetzen die Durchführung nicht.
  - Expected performance (EN): Safe personal assembly and deliberate personal variation are actually observed. The learner connects documented states to the actually connected input and supply energy; supplied data or a mere self-claim do not replace execution.
  - Understanding focus (DE): Tatsächliche Aufbau- und Durchführungsevidenz, nicht zusätzliches mikroskopisches Modellwissen.
  - Understanding focus (EN): Actual assembly and execution evidence, not additional microscopic model knowledge.
- `own-open-control-and-fresh-mapping`
  - Task demand (DE): Öffne nach Ausschalten den bezeichneten Steuerzweig, lasse den definierten Basisbezug bestehen und prognostiziere und prüfe den Zustand nach Freigabe tatsächlich. Stelle die Verbindung sicher wieder her und prüfe anschließend selbst eine neue umgekehrte Sensor-Ausgangszuordnung mit derselben gelieferten Steuerung.
  - Task demand (EN): With power off, open the specified control branch while retaining the defined base reference, then predict and actually check the state after inspection. Safely restore the connection and personally test a fresh reversed sensor-output mapping using the same supplied control.
  - Expected performance (DE): Die Person führt den Kontrollversuch und die neue Variation selbst aus, dokumentiert eigene Ergebnisse, verbindet die Befunde mit vollständigem beziehungsweise unterbrochenem Steuerpfad und erklärt die geänderte Zuordnung. Unerwartete Befunde werden ehrlich untersucht; keine fiktiven Messwerte oder universellen Verstärkungsfaktoren werden behauptet.
  - Expected performance (EN): The learner personally performs the control trial and fresh variation, records their results, connects outcomes with complete or interrupted control paths and explains the changed mapping. Unexpected findings are investigated honestly; no invented measurements or universal gain factors are claimed.
  - Understanding focus (DE): Physikalisch veränderter Steuerpfad und neuer Eingangszusammenhang verlangen eigene experimentelle Übertragung.
  - Understanding focus (EN): A physically changed control path and fresh input relationship require personal experimental transfer.
