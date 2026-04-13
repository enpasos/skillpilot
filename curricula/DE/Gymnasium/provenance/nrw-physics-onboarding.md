# NRW Physics Onboarding Note

Status: `P4` (`reviewed_corridors_opened`)

This note records the first Nordrhein-Westfalen Physics source-landscape identifier for the DE-level canonical Physics rollout.

Activated on `2026-04-10`:

- upper-secondary Gymnasium Physics:
  - `sourceLandscapeId`: `8abb46ff-072b-41b7-9d70-0334cb5a1a6c`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/DE_NRW_S_GYM_2_PHYSIK.de.json.snapshot`

Activation result:

- the NRW upper-secondary Physics lane is now active in `source-landscape-registry.json`
- the first NRW upper-secondary Physics snapshot now contributes real `goalIds` to `source-goal-membership-registry.json`
- the same snapshot now contributes atomic closures to `source-goal-closure-registry.json`
- the repository-backed NRW Physics mapping file now carries `27` reviewed upper-secondary mappings across the current narrow reviewed corridors
- the first compiled NRW upper-secondary Physics applicability cut is now committed in the canonical Physics file on seven shared target goals:
  - `Harmonische Schwingung verstehen`
  - `Gravitation und Weltbilder in GK-Aufgaben verknüpfen`
  - `Radioaktive Strahlung und Wirkungen`
  - `Zerfallsgesetze anwenden`
  - `Strahlungsrisiken mit physikalischen Größen beurteilen`
  - `Kernenergieoptionen mit physikalischen Kriterien bewerten`
  - `Kern und Hülle des Atoms qualitativ beschreiben`
- the first committed NRW matter-structure follow-on is now also in place:
  - the NRW LK child `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` now targets the new narrow canonical atom with the same title instead of the broader cluster `Elementarteilchen und Standardmodell`
  - this new canonical atom now carries `DE-HE, DE-NW`
  - the parent cluster `Elementarteilchen und Standardmodell` now also carries `DE-HE, DE-NW` through child-union
- the first committed NRW field-particle follow-on is now also in place:
  - the imported GK field clause is now source-split into `Geladene Teilchen in homogenen elektrischen Feldern untersuchen` and `Geladene Teilchen in homogenen magnetischen Feldern untersuchen`
  - both new NRW GK children now reach new narrow canonical Q1 atoms with the same titles as `exact` bridges
  - the shared Q1 path `Bewegung geladener Teilchen im elektrischen Feld`, `Mikroskopische und makroskopische Wirkung magnetischer Felder`, `Magnetisches Feld`, and `Q1 Elektrisches und magnetisches Feld` now all carry `DE-HE, DE-NW` through child-union
- the first committed NRW quantum-object follow-on is now also in place:
  - the two imported NRW GK children `Photonen und Elektronen als Quantenobjekte beschreiben` and `Die Bedeutung von Modellen an Photon und Elektron reflektieren` now target new narrow canonical Q4 atoms with the same titles as `exact` bridges
  - the shared canonical Q4 cluster `Quantenobjekte` now also carries `DE-HE, DE-NW` through child-union
  - the earlier NRW GK parent bridge to the Q3 surface `Welle-Teilchen-Dualismus` remains in place, so the reviewed Q3 duality surface stays visible while the two narrower GK children now also widen the Q4 entry surface
- the first committed NRW atom-model follow-on is now also in place:
  - the imported GK child cluster `Qualifikationsphase GK: Quantenphysikalisches Atommodell` now reaches the shared canonical Q3 cluster `Atomvorstellungen` conservatively as `partial`
  - the imported NRW GK children `Energiewerte fuer das Wasserstoffatom mit einem quantenphysikalischen Atommodell beschreiben`, `Linienspektren und Fraunhofer-Linien mit Energieniveaus erklaeren`, and `Messergebnisse des Franck-Hertz-Versuchs interpretieren` now target the shared canonical Q3 atoms `Energieniveaus des Wasserstoffatoms`, `Emission, Absorption und Linienspektren`, and `Franck-Hertz-Versuch` as `exact` bridges
  - the imported NRW GK child `Orbitale des Wasserstoffatoms als Nachweiswahrscheinlichkeiten interpretieren` now targets the new narrow canonical Q3 atom with the same title as an `exact` bridge
  - the imported NRW GK children `Charakteristisches Roentgenspektrum mit Energieniveaus der Atomhuelle erklaeren` and `Historische Entwicklung der Atommodelle und Modellgrenzen fachlich einordnen` now target new narrow canonical Q3 atoms with the same titles as `exact` bridges
  - the shared canonical Q3 cluster `Atomvorstellungen` plus the shared Q3 atoms `De-Broglie-Wellen`, `Bohr’sche Postulate und Quantisierung`, `Energieniveaus des Wasserstoffatoms`, `Emission, Absorption und Linienspektren`, and `Franck-Hertz-Versuch` now all carry `DE-NW`; the De-Broglie and Bohr/quantization atoms are widened as reviewed prerequisite bridges rather than by one-to-one mapping rows, while the narrower Roentgenspektrum- and Modellgeschichte-surfaces are now resolved through dedicated exact NRW atoms
- the accepted-warning registry now records the eight NRW-specific `APV-202` findings explicitly as reviewed partial-bridge debt instead of leaving them as active Physics drift
- the accepted-warning registry now also records the reviewed NRW prerequisite bridges `APV-201` on `De-Broglie-Wellen` and `Bohr’sche Postulate und Quantisierung`
- the accepted-warning registry now also records the new NRW-specific `APV-202` on that narrow matter-structure atom and on the shared Q3 cluster `Atomvorstellungen` explicitly as reviewed partial-bridge debt
- the first source snapshot is intentionally narrow and source-led:
  - one shared orientation anchor
  - one Einfuehrungsphasen-Einstieg zu periodischen Vorgaengen, Kreisbewegung, Gravitation und physikalischen Weltbildern
  - three Grundkurs-Anker zu `Quantenobjekte`, `Quantenphysikalisches Atommodell` sowie `Klassische Wellen und Teilchen in Feldern`
- one Leistungskurs-Anker zu `Quantenphysik` sowie `Atom- und Kernphysik`, now source-split into `Elementare Bestandteile`, `Kernaufbau`, `Bindungen`, `Modellgrenzen`, `Strahlung/Wirkungen`, `Zerfaelle/Kernumwandlungen`, `Strahlungsrisiken`, and `Kernenergieoptionen`
- the reviewed NRW Physics corridors stay intentionally conservative:
  - exact bridge on the shared motivation anchor
  - partial bridge on the NRW E-phase entry cluster toward the shared canonical E-phase mechanics surface
  - partial bridges for the two imported E-phase atoms on periodische Vorgaenge and on the gravitation/worldview integration surface
  - partial bridge from the NRW GK `Quantenobjekte` cluster onto the canonical Q3 `Welle-Teilchen-Dualismus` surface
  - the two imported NRW `Quantenobjekte` atoms no longer stop on that same broad Q3 surface:
    - exact bridge from `Photonen und Elektronen als Quantenobjekte beschreiben` onto the new narrow canonical Q4 atom with the same title
    - exact bridge from `Die Bedeutung von Modellen an Photon und Elektron reflektieren` onto the new narrow canonical Q4 atom with the same title
  - the deeper canonical Q4 cluster `Quantenobjekte` is therefore now widened for `DE-NW` through those two narrow reviewed entry atoms instead of through a direct broad cluster bridge
  - partial bridge from the NRW GK cluster `Qualifikationsphase GK: Quantenphysikalisches Atommodell` onto the canonical Q3 cluster `Atomvorstellungen`
  - the imported NRW GK child `Energiewerte fuer das Wasserstoffatom mit einem quantenphysikalischen Atommodell beschreiben` now reaches the shared canonical Q3 atom `Energieniveaus des Wasserstoffatoms` as `exact`
  - the shared canonical prerequisite atoms `De-Broglie-Wellen` and `Bohr’sche Postulate und Quantisierung` are now also widened for `DE-NW` as reviewed prerequisite bridges because the NRW atom-model strip needs both the duality anchor and the quantization anchor didactically, even though the source does not isolate separate one-to-one leaves for them
  - the imported NRW GK child `Linienspektren und Fraunhofer-Linien mit Energieniveaus erklaeren` now reaches the shared canonical Q3 atom `Emission, Absorption und Linienspektren` as `exact`
  - the imported NRW GK child `Messergebnisse des Franck-Hertz-Versuchs interpretieren` now reaches the shared canonical Q3 atom `Franck-Hertz-Versuch` as `exact`
  - the imported NRW GK child `Orbitale des Wasserstoffatoms als Nachweiswahrscheinlichkeiten interpretieren` now reaches the new narrow canonical Q3 atom with the same title as `exact`
  - the imported NRW GK child `Charakteristisches Roentgenspektrum mit Energieniveaus der Atomhuelle erklaeren` now reaches the new narrow canonical Q3 atom with the same title as `exact`
  - the imported NRW GK child `Historische Entwicklung der Atommodelle und Modellgrenzen fachlich einordnen` now reaches the new narrow canonical Q3 atom with the same title as `exact`
  - the remaining narrower NRW atom-model residue around Spektralanalyse/Modellentwicklung intentionally remains outside the current reviewed strip
  - partial bridge from `Klassische Wellenphaenomene an Licht beschreiben` onto the canonical Q3 cluster `Elektromagnetische Wellen`
  - the imported NRW GK field clause `Geladene Teilchen in homogenen E- und B-Feldern untersuchen` is now source-split into narrower electric- and magnetic-field children instead of staying mapped as one broad parent
  - exact bridge from `Geladene Teilchen in homogenen elektrischen Feldern untersuchen` onto the new narrow canonical Q1 atom with the same title
  - exact bridge from `Geladene Teilchen in homogenen magnetischen Feldern untersuchen` onto the new narrow canonical Q1 atom with the same title
  - the imported NRW parent cluster `Klassische Wellen und Teilchen in Feldern` is intentionally left without its own canonical target because the shared DE-level Physics graph separates that source package into two reviewed surfaces rather than one mixed parent node
  - partial bridge from the NRW LK parent `Quantenphysik sowie Atom- und Kernphysik` onto the canonical Q4 root `Struktur von Materie, Raum und Zeit`
  - partial bridge from `Quantenphysik als Weiterentwicklung des physikalischen Weltbilds deuten` onto the canonical Q4 cluster `Quantenobjekte`
  - partial bridge from the retained NRW LK residue cluster `Aufbau der Materie sowie ionisierende Strahlung und Kernprozesse modellieren` onto the canonical Q4 cluster `Kernphysik`
  - partial bridge from the retained NRW LK radiation cluster `Ionisierende Strahlung und radioaktive Zerfaelle modellieren` is intentionally replaced by two narrower source-led children
  - partial bridge from the new NRW LK child `Ionisierende Strahlung nachweisen und Wirkungen beschreiben` onto the canonical Q4 leaf `Radioaktive Strahlung und Wirkungen`
  - partial bridge from the new NRW LK child `Radioaktive Zerfaelle und Kernumwandlungen qualitativ beschreiben` onto the canonical Q4 leaf `Zerfallsgesetze anwenden`
  - the earlier broad partial bridge from the new NRW LK child `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` onto the canonical Q4 cluster `Elementarteilchen und Standardmodell` is now retired
  - that NRW LK child now instead reaches the new narrow canonical Q4 atom `Elementare Bestandteile der Materie mit Strukturmodellen ordnen`, which keeps the shared matter-structure surface below the broader interactions/research package of the parent cluster
  - the retained NRW LK judgement child `Strahlungsrisiken und Kernprozesse fachlich beurteilen` is intentionally replaced by two narrower source-led children
  - partial bridge from the new NRW LK child `Strahlungsrisiken mit physikalischen Groessen beurteilen` onto the canonical Q4 context leaf `Strahlungsrisiken mit physikalischen Größen beurteilen`
  - partial bridge from the new NRW LK child `Kernenergieoptionen mit physikalischen Kriterien bewerten` onto the canonical Q4 context leaf `Kernenergieoptionen mit physikalischen Kriterien bewerten`
  - the retained NRW LK matter cluster `Aufbau der Materie im Kleinen modellieren` is now source-split into `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` and a narrower retained subcluster `Kernaufbau und Bindungen in einfachen Modellen beschreiben`
  - the first of those matter children now reaches the new narrow canonical Q4 atom `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` conservatively as `partial`; the broader parent cluster follows only through child-union
  - the retained NRW LK subcluster `Kernaufbau und Bindungen in einfachen Modellen beschreiben` is now source-split once more into `Kernaufbau in einfachen Modellen beschreiben` and the narrower retained child cluster `Einfache Bindungen in Materiemodellen beschreiben und Modellgrenzen einordnen`
  - the narrower NRW LK matter child `Kernaufbau in einfachen Modellen beschreiben` now reaches the already reviewed canonical Sek-I atom `Kern und Hülle des Atoms qualitativ beschreiben` conservatively as `partial`, because both surfaces share the qualitative Strukturperspektive auf den Atomkern without forcing a sharper Q4 energy- or reaction-claim
  - that retained NRW LK child cluster is now widened once more into `Einfache Bindungen in Materiemodellen beschreiben` and `Modellgrenzen einfacher Materiemodelle fachlich einordnen`
  - both narrower NRW LK matter children intentionally remain source-led and unmapped because the current canonical Q4 surface still does not expose reviewed one-to-one targets without overclaiming toward stronger kernphysikalische Energie-, Reaktions- oder Teilchenphysik-Aussagen
  - the narrower NRW LK matter child `Einfache Bindungen in Materiemodellen beschreiben` has now been reviewed explicitly against the current canonical candidates `Bindungsenergie und Massendefekt`, `Potenzialtopfmodell für Kerne`, and `Fundamentale Wechselwirkungen`; none of them is used because all three targets either sharpen the source too far into energy/reaction language or broaden it into a wider Teilchenphysik/interactions package than the NRW wording actually secures

Operational rule from here:

- keep the reserved `sourceLandscapeId` stable while broadening the NRW Physics source snapshot
- do not create NRW-specific Physics composition views before a wider reviewed `Wellen` / `Felder` or LK corridor proves they are needed
- the next clean NRW Physics move is now no longer another review pass on the committed GK field, quantum-object, or atom-model entry strip, but either the still-missing explicit atom-model residue around Spektralanalyse/Modellentwicklung or a move to the next state lane
