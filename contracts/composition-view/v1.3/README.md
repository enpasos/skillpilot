# Composition view 1.3 · elective extensions

A source view can mark the curriculum blocks a learner chooses when setting up a Personal Curriculum. The repository backend reads this format. Existing curriculum-package profiles, authoring tools and interchange formats require their own transport update before they can carry it.

## Declaring groups and blocks

Declare each group once in `electionGroups`, in display order. Give it a stable ID, German and English labels, its origin and `minSelections`. An official group includes the rule in both languages, its edition and the location in the official source. SkillPilot groups have a minimum of zero. A school’s official upper bound can be stated in the rule text. Learners may choose additional blocks.

Give each selectable structure an `extension` object containing its stable `id`, `groupId` and `previouslyRegular`. Its `label` and `labelEn` name the choice. The choice includes the subtree. A view must resolve every referenced group, place each extension once, and keep extension subtrees disjoint. A profile may offer different members of a group. A shared identity must keep its definition across combined profiles. Child order and the two existing projection roles retain their meaning after filtering. [Schema](composition-view.schema.json)

## Selecting extensions

The existing subject entry of the Personal Curriculum carries `extensionSelection`.

| Stored value | Effect when resolving a view |
|---|---|
| Field absent | Include the available blocks marked `previouslyRegular`. This preserves the learner’s old scope. |
| List of stable IDs | Include exactly the listed blocks available in the profile. An empty list is an explicit choice. Unavailable IDs survive profile changes and saving. |
| `"maximum"` | Include every available block, including later additions. |

The backend filters the view before closing the actual prerequisites. A prerequisite from an unselected block can still be needed for a selected goal. It is available to learn as a preparation. Results already earned remain with the learner.

A version 2 personalization flow can declare an `extensions` stage after `subjectProfile`. Its `groupSource` uses `electionGroupsForSelectedLandscapes` and takes its subjects from `subject`. The minimum action asks for topics only in groups whose minimum is still open. The learner chooses when several answers work. Without this stage the flow asks no extension question. [Neutral course and two profiles](examples/extensions)

This is the version of the source view. The materialized stage-plan view and the published package contracts have their own version identifiers. Packages retaining an earlier profile reject extension declarations and the new flow. A Hessian E.1 course can later replace individual task exceptions in its section assessment policy once its extensions are declared and supported by the other readers.
