# NI Math Onboarding Note

This note records the Niedersachsen source-landscape identifiers for the mathematics-first DE expansion track and their current activation state.

Status: P5 (broad_reviewed_coverage)

Reserved source landscapes on 2026-03-20:

- lower-secondary Gymnasium mathematics (classes 5-10):
  - sourceLandscapeId: 2b995085-dc5e-47c6-a563-9dcfc01fb74d
  - mapping fixture:
    curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_math_lower_secondary_to_canonical_math.json
- upper-secondary Gymnasium mathematics:
  - sourceLandscapeId: fcb04661-6ea2-4030-a9b2-97e6cc03daf8
  - mapping fixture:
    curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_math_upper_secondary_to_canonical_math.json

Activation state:

- both Niedersachsen sourceLandscapeId values are active in source-landscape-registry.json
- both lanes contribute archived source goal memberships to source-goal-membership-registry.json
- both lanes contribute archived atomic closures to source-goal-closure-registry.json
- the active lower-secondary source snapshot lives at:
  - curricula/DE/Gymnasium/input/NI/lower-secondary/source-json/DE_NDS_S_GYM_1_MATHEMATIK.de.json.snapshot
- the active upper-secondary source snapshot lives at:
  - curricula/DE/Gymnasium/input/NI/upper-secondary/source-json/DE_NDS_S_GYM_2_MATHEMATIK.de.json.snapshot
- the lower-secondary pilot snapshot is fully mapped on source-goal level:
  - 53 goals
  - 53 mappings
  - explicit lower-secondary data/chance corridor from the five real Lernbereiche is now included and closed on source-goal level
- the upper-secondary pilot snapshot is now also fully mapped on source-goal level:
  - 165 goals
  - 165 mappings
  - broad parents, retained analysis / e-function residues, retained geometry residues, and retained stochastics residues are all closed

Operational rule from here:

- keep these reserved sourceLandscapeId values stable as the Niedersachsen broad reviewed comparison lane
- treat the lower-secondary NI snapshot as closed across functions, algebra, measurement, data/chance, geometry/trigonometry, and quadratics
- do not reopen the closed NI pilot snapshots unless a genuinely new Niedersachsen retained slice is imported intentionally or `P6/F6` cutover work reveals a real source-side correction need
