# Niedersachsen Physics Onboarding Note

Status: `P4` (`reviewed_corridors_opened`)

This note records the first Niedersachsen Physics source-landscape identifier for the DE-level canonical Physics rollout.

Activated on `2026-04-13`, widened on `2026-04-14`:

- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `730a6dbb-7ddb-486b-8ac8-dd9e58e3d113`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/NI/upper-secondary/source-json/DE_NDS_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the Niedersachsen upper-secondary Physics lane is now active in `source-landscape-registry.json`
- the first Niedersachsen upper-secondary Physics snapshot now contributes real `goalIds` to `source-goal-membership-registry.json`
- the same snapshot now contributes atomic closures to `source-goal-closure-registry.json`
- the repository-backed Niedersachsen Physics mapping file now carries `44` reviewed upper-secondary mappings across the current narrow reviewed corridor
- the committed Niedersachsen upper-secondary Physics applicability cut is now active on the shared canonical motivation anchor, on the reviewed E-phase dynamics strip, on the adjacent E-phase energy strip, on the first shared Q1 potential/capacitor strip, on the first shared magnetic-field strip, on the first shared induction strip, on the shared LK follow-on leaves for Hall-Effekt, Differenzialform, Selbstinduktion, and coil-field energy, and now also on the first shared Q2 oscillation strip:
  - `Freier Fall experimentell untersuchen`
  - `Gleichmäßig beschleunigte Bewegung und Beschleunigung`
  - `Waagerechter Wurf analysieren`
  - `Die drei Newtonschen Axiome benennen und erklären`
  - `Newtons 1. Axiom (Trägheitsprinzip)`
  - `Newtons 2. Axiom (Grundgleichung der Mechanik)`
  - `Newtons 3. Axiom (Wechselwirkungsprinzip)`
  - `Kreisbewegungen und Zentripetalkraft`
  - `Bahn- und Winkelgeschwindigkeit`
  - `Kreisbewegung mit Zentripetalkraft anwenden`
  - `Stromstärke als Ladungstransport`
  - `Arbeit, Spannung und Potenzial im E-Feld`
  - `Potenzial und Kondensator`
  - `Kondensator und Feld im Plattenkondensator`
  - `Auf- und Entladen eines Kondensators`
  - `Energie des elektrischen Feldes`
  - `Magnetisches Feld`
  - `Magnetische Felder und Feldlinienbilder`
  - `Kraft auf stromdurchflossene Leiter`
  - `Lorentzkraft auf freie Ladungen`
  - `Geladene Teilchen in homogenen magnetischen Feldern untersuchen`
  - `Magnetfeld von geradem Leiter und Spule`
  - `Induktion durch Änderung des magnetischen Flusses`
  - `Induktionsgesetz und Lenz’sche Regel`
  - `Technische Anwendungen des Induktionsgesetzes qualitativ beschreiben`
  - `Induktion und elektromagnetische Schwingungen`
  - `Q2 Schwingungen, Induktion und mechanische Wellen`
  - `Hall-Effekt anwenden`
  - `Induktionsgesetz in Differenzialform`
  - `Selbstinduktion und Induktivität`
  - `Energie gespeicherter Magnetfelder`
  - `Harmonische Schwingung verstehen`
  - `Charakteristische Schwingungsgrößen`
  - `Lineare Rückstellkraft bei harmonischen Schwingungen beschreiben`
  - `Energie und Energieerhaltung in Schwingungen`
  - `Gedämpfte Schwingungen beschreiben`
  - `Erzwungene Schwingungen und Resonanz`
  - `Elektromagnetischen Schwingkreis analysieren`
  - `Thomson’sche Schwingungsgleichung nutzen`
- the widened source snapshot is still intentionally narrow and source-led:
  - one shared orientation anchor
  - one Einfuehrungsphasen-Korridor `Dynamik`
  - six imported leaf goals on freier Fall, waagerechter Wurf, Grundgleichung der Mechanik, Newtonsche Axiome, gleichfoermige Kreisbewegung, and Zentripetalkraft
  - one adjacent E-phase energy/experiment strip with four imported leaves on kinetic energy, mechanical energy conservation, experimental verification, and sustainability-related value judgment
  - one first qualification-phase `Elektrizitaet` strip with seven imported leaves on charge/current, voltage, field strength in the plate capacitor, energy balance in the field, charging/discharging, capacitance, and field energy
  - one adjacent qualification-phase magnet-field/electron strip with six imported leaves on compass-based field description, conductor force, magnetic flux density, Lorentz-force trajectories, crossed-field/Wien-filter residue, and one eA-specific Fadenstrahlrohr residue
  - one adjacent qualification-phase induction strip with six imported leaves on Hall-probe coil measurements, qualitative coil-field dependencies, conductor/coil field-line images, first flux-based induction, induction-law diagram reading, and one simple technical induction application
  - one adjacent qualification-phase LK follow-on on the same page-36 source with four imported leaves on Hallspannung derivation, differential-form induction for linear/sinusoidal flux changes, self-induction/inductance, and coil field energy
  - one first qualification-phase oscillation strip with nine imported leaves on harmonic oscillation description, Feder-Masse period law, linear restoring force, energy transformations, damping, resonance, electromagnetic oscillating circuits, and Thomson reference
- the reviewed Niedersachsen Physics corridor stays intentionally conservative:
  - exact bridge on the shared motivation anchor
  - partial bridge on the Niedersachsen E-phase `Dynamik` cluster toward the shared canonical E-phase mechanics surface
  - partial bridges from the imported dynamics leaves onto the existing shared canonical free-fall, horizontal-throw, Newton, and circle-motion targets
  - new partial bridge from `Kinetische Energie nennen und in einfachen Situationen berechnen` onto the shared canonical leaf `Kinetische Energie`
  - new partial bridge from `Energieerhaltungssatz der Mechanik formulieren und in einfachen Situationen nutzen` onto the shared canonical leaf `Energieerhaltung`
  - new partial bridge from `Einfache Experimente zum Energieerhaltungssatz planen, durchfuehren und dokumentieren` onto the shared canonical leaf `Energieerhaltung`
  - new partial bridge from the qualification-phase source cluster `Elektrizitaet - Potenzial und Kondensator` onto the shared canonical Q1 cluster `Potenzial und Kondensator`
  - new partial bridge from `Zusammenhang zwischen Ladung und elektrischer Stromstaerke beschreiben` onto `Stromstärke als Ladungstransport`
  - new partial bridge from `Elektrische Spannung als Energie pro Ladung deuten` onto `Arbeit, Spannung und Potenzial im E-Feld`
  - new partial bridge from `Feldstaerke im Plattenkondensator mit der anliegenden Spannung verknuepfen` onto `Kondensator und Feld im Plattenkondensator`
  - new partial bridge from `Energiebilanz fuer geladene Koerper im elektrischen Feld eines Plattenkondensators angeben` onto `Arbeit, Spannung und Potenzial im E-Feld`
  - new partial bridge from `Auf- und Entladevorgaenge eines Kondensators ueber t-I-Zusammenhaenge beschreiben` onto `Auf- und Entladen eines Kondensators`
  - new partial bridge from `Kapazitaet eines Kondensators grundlegend angeben und in einfachen Bestimmungen nutzen` onto `Kondensator und Feld im Plattenkondensator`
  - new partial bridge from `Gleichung fuer die Energie des elektrischen Feldes eines Plattenkondensators nennen` onto `Energie des elektrischen Feldes`
  - new partial bridge from the qualification-phase source cluster `Elektrizitaet - Magnetfeld und freie Elektronen` onto the shared canonical Q1 cluster `Magnetisches Feld`
  - new partial bridge from `Magnetische Felder mit Kompassnadeln beschreiben und Feldrichtungen bestimmen` onto `Magnetische Felder und Feldlinienbilder`
  - new partial bridge from `Leiterkraft im homogenen Magnetfeld bestimmen und magnetische Flussdichte deuten` onto `Kraft auf stromdurchflossene Leiter`
  - new partial bridge from `Lorentzkraft auf freie Elektronen beschreiben und Bahnformen begruenden` onto `Lorentzkraft auf freie Ladungen`
  - new partial bridge from `Elektronenbahnen im homogenen Magnetfeld auf andere geladene Teilchen uebertragen` onto `Geladene Teilchen in homogenen magnetischen Feldern untersuchen`
  - new partial bridge from `Magnetische Flussdichte bei Spulen mit einer Hallsonde experimentell messen` onto `Magnetfeld von geradem Leiter und Spule`
  - new partial bridge from `Magnetische Flussdichte bei einer Spule qualitativ von I, n, l und mu_r abhaengig beschreiben` onto `Magnetfeld von geradem Leiter und Spule`
  - new partial bridge from `Magnetfeldlinienbilder fuer geraden Leiter und Spule skizzieren` onto `Magnetische Felder und Feldlinienbilder`
  - new partial bridge from `Induktionsspannung qualitativ mithilfe des magnetischen Flusses beschreiben` onto `Induktion durch Änderung des magnetischen Flusses`
  - new partial bridge from `Versuche und Diagramme zum Induktionsgesetz bei linearen A- oder B-Aenderungen auswerten` onto `Induktionsgesetz und Lenz’sche Regel`
  - new partial bridge from `Eine technische Anwendung der Induktion qualitativ beschreiben` onto `Technische Anwendungen des Induktionsgesetzes qualitativ beschreiben`
  - new partial bridge from `Hallspannung aus der Driftgeschwindigkeit anhand einer Skizze herleiten` onto `Hall-Effekt anwenden`
  - new partial bridge from `Induktionsgesetz in differenzieller Form fuer lineare und sinusfoermige Flussaenderungen anwenden` onto `Induktionsgesetz in Differenzialform`
  - new partial bridge from `Selbstinduktion beim Ein- und Ausschalten von Spulen erklaeren und Induktivitaet definieren` onto `Selbstinduktion und Induktivität`
  - new partial bridge from `Energie des magnetischen Feldes einer Spule angeben und Spulen als Energiespeicher beschreiben` onto `Energie gespeicherter Magnetfelder`
  - new partial bridge from `Harmonische Schwingungen grafisch darstellen und mit Auslenkung, Amplitude, Periodendauer und Frequenz beschreiben` onto `Charakteristische Schwingungsgrößen`
  - new partial bridge from `Periodendauer eines Feder-Masse-Pendels angeben und experimentelle Abhaengigkeiten ueberpruefen` onto `Harmonische Schwingung verstehen`
  - new partial bridge from `Lineares Kraftgesetz als Bedingung einer mechanischen harmonischen Schwingung nennen` onto `Lineare Rückstellkraft bei harmonischen Schwingungen beschreiben`
  - new partial bridge from `Energieumwandlungen beim Feder-Masse-Pendel beschreiben` onto `Energie und Energieerhaltung in Schwingungen`
  - new partial bridge from `Gedaempfte Schwingungen in t-s- und t-v-Diagrammen deuten` onto `Gedämpfte Schwingungen beschreiben`
  - new partial bridge from `Resonanz bei erzwungenen Schwingungen anhand eines Experiments erlaeutern` onto `Erzwungene Schwingungen und Resonanz`
  - new partial bridge from `Elektromagnetischen Schwingkreis beschreiben und Schwingungsgroessen aus Messdaten bestimmen` onto `Elektromagnetischen Schwingkreis analysieren`
  - new partial bridge from `Energieumwandlungen und Resonanzkurve im elektromagnetischen Schwingkreis beschreiben` onto `Elektromagnetischen Schwingkreis analysieren`
  - new partial bridge from `Kapazitaetsabhaengigkeit der Eigenschwingung experimentell bestimmen und die Thomsonsche Schwingungsgleichung nennen` onto `Thomson’sche Schwingungsgleichung nutzen`
  - the new source leaf on sustainability-related value judgment stays intentionally source-led, because the currently available shared thermodynamics evaluation surface would overclaim the Niedersachsen wording
  - the new source leaf on homogenous electric transverse fields and `Wien-Filter` stays intentionally source-led, because the current shared canonical magnetic-field surface does not yet isolate a reviewed crossed-field target
  - the new eA-only source leaf on the `Fadenstrahlrohr` stays intentionally source-led, because the current shared canonical graph does not yet isolate the narrower specific-charge surface as a reviewed shared Q1 target
  - no Niedersachsen-specific Physics composition views are introduced in this widened step
  - no new canonical Physics atoms are introduced just for Niedersachsen wording

Operational rule from here:

- keep the reserved `sourceLandscapeId` stable while broadening the Niedersachsen Physics source snapshot
- keep the Niedersachsen Physics lane narrow and reviewed; after the first reviewed `Schwingungen` strip, the next clean widening should now open `Wellen`, while the still source-led `Querfeld`/`Wien-Filter` and `Fadenstrahlrohr` residues remain optional only if broader reviewed shared targets become justified
