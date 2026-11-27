# Composition view 1.3 · elective extensions

A source view can declare curriculum blocks that learners choose when setting up a Personal Curriculum. The repository backend reads this format. Curriculum-package profiles, authoring tools and interchange formats require their own transport update before they can carry it.

## Declaring groups and blocks

Declare each group once in `electionGroups`, in display order. Give it a stable ID, default-language and English labels, its origin and `minSelections`. An official group includes the rule in both languages, its edition and the location in the official source. SkillPilot groups have a minimum of zero.

Give each selectable structure an `extension` object containing its stable `id`, `groupId` and `previouslyRegular`. Its `label` and `labelEn` name the choice. A view must resolve every referenced group, place each extension once and keep extension subtrees disjoint. For a positive minimum the previously regular members must meet the minimum.

Group and extension definitions with the same ID must agree across the Land's views for a subject, including duration models and course profiles. Profiles can place the same block under different parents and can offer different members of a group. A profile merge preserves both placements and counts their shared extension once. Child order and the two existing projection roles retain their meaning after filtering. [Schema](composition-view.schema.json)

## Selecting extensions

The existing subject entry of the Personal Curriculum carries `extensionSelection`.

| Stored value | Effect when resolving a view |
|---|---|
| Field absent | Include the available blocks marked `previouslyRegular`. This preserves the learner’s old scope. |
| `[]` (Basis) | Keep the previously regular blocks in groups whose minimum exceeds zero. |
| `"maximum"` (Alles) | Include every available block, including later additions. |

A learner's choice applies to the whole subtree. The backend filters the view before closing the actual prerequisites. A prerequisite from an unselected block remains available as a preparation where needed. Results already earned remain with the learner. [Neutral example with two profiles](examples/extensions)

The materialized stage-plan view and the published package contracts have their own version identifiers. Packages retaining an earlier profile reject extension declarations.

## Hessian Physics E.1 compatibility migration

The named `historicalAssessmentPlacements` record is reserved for the three existing Hessian Physics E.1 assessment placements whose exact historical parent IDs are part of the schema. The free-fall series and the fall protocol share one choice and keep their existing places. Both tasks remain in scope when the selection field is absent or set to `"maximum"`, and `[]` removes both from the regular scope. The second horizontal-throw assessment remains at its historical place only when the field is absent. The published assessment and its stored results remain in the catalog and learner records.
