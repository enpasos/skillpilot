# Independent review input; do not access any other review round

## Review instructions
# SkillPilot goal-description understanding-evidence review v2

You are one independent reviewer of a fingerprint-bound SkillPilot learning-goal
batch. Review every assigned goal exactly once. Work only from the supplied
batch context, the applicable subject-specific criteria, and the bound output
schema. Do not inspect or infer another reviewer's output, an earlier round, an
adjudication, or a canonical diff. This is a blind first pass.

The purpose is to keep each canonical description concise and learner-facing
while making the competence clear enough for a learning coach to teach toward
genuine understanding and to seek independent evidence of it. A description
alone does not guarantee Coach or Mastery behavior; detailed assessment
expectations remain in a separate `positive-understanding-evidence-v2` profile.

For every goal, formulate a content-specific chain of positive understanding
evidence:

- `essentialUnderstandingDe` and `essentialUnderstandingEn` name the central
  concepts, relationships, distinctions, structures, models, meanings, or
  conditions the learner is expected to understand;
- `observablePerformanceDe` and `observablePerformanceEn` state what the
  learner independently explains, predicts, constructs, compares, interprets,
  justifies, derives, investigates, analyzes, or applies so that this
  understanding becomes observable; and
- `transferExpectationDe` and `transferExpectationEn` state how the learner
  applies the same understanding to a structurally related but meaningfully
  changed case presented independently as a fresh task.

All six fields must be specific to the exact goal. Repeating generic phrases
about understanding, independence, transfer, or deep learning is insufficient.
A number swap or a surface rewording of the same exercise is not a meaningful
changed case.

Keep the two authoring layers separate:

- `description` is short, bilingual, learner-facing, and limited to the
  competence itself. It may name an essential distinction, reason, model
  condition, interpretation, or application already claimed by this goal.
- `understandingEvidence` records the three bilingual expectations for this
  review. Detailed coverage rules, variation axes, application cases, scoring,
  assistance history, and repeated demonstrations belong in the separate V2
  profile.

Use the supplied page context deliberately:

- when present, `canonicalContext` binds the current canonical core/weight,
  tags, competency dimensions, applicability, structural relations, atomicity,
  and selected applicability semantics; treat these fields as scope constraints,
  not as permission to invent a broader competence;
- direct prerequisites and containing context delimit assumed prior knowledge
  and the goal's curricular role;
- direct successors help detect accidental duplication or scope expansion;
- a visualization is teaching support, never evidence that the learner can
  perform independently; and
- any supplied current V2 profile is review context, not authority and not a
  reason to leave an ambiguous description unchanged.

Raw canonical applicability and a `sourceRef` are not proof of the effective
learner-facing projection or complete source mapping. Unless separate bound
mapping, composition-view, or source-manifest evidence is supplied, do not
claim that those external relationships were verified.

For each assigned goal:

1. Determine what the current title, bilingual descriptions, relations,
   applicability context, and supplied source evidence actually claim. Preserve
   the stable goal identity, curricular scope, demand level, method neutrality,
   and semantic atomicity.
2. Apply every subject-specific criterion independently. Do not import a useful
   but unclaimed competence or a sibling source clause.
3. Write the six bilingual understanding-evidence fields as one coherent chain
   from essential understanding through independently observable performance to
   meaningful transfer.
4. Decide exactly one of:
   - `keep`: the current description is already clear, accurate, bilingual, and
     sufficiently informative for this goal;
   - `revise`: one concise local wording change can remove a concrete ambiguity
     or make an already claimed aspect of understanding observable without
     widening the goal;
   - `split_review`: the goal appears to combine independently assessable
     competencies, so a wording-only change would conceal an atomicity issue;
   - `block`: factual correctness, source fidelity, identity, applicability,
     model convention, missing evidence, or another issue prevents a
     responsible wording proposal.
5. For `revise`, provide exactly one complete German and one semantically
   equivalent English replacement. Both must be usable verbatim. For every
   other decision, omit both replacement fields.
6. Set `evidenceProfileContract` to
   `positive-understanding-evidence-v2`. Use `none` only when a supplied current
   profile already expresses the complete goal-specific understanding,
   performance, and transfer contract; use `create` when none exists; and use
   `revise` when the supplied current profile needs alignment. This
   recommendation does not create or mutate a profile.
7. Copy every run, campaign, bundle, book, goal, page, and current-text binding
   exactly from the supplied batch. Never reconstruct a fingerprint.

Return newline-delimited JSON with exactly one record per assigned goal, in the
assigned order. Every line must validate against the bound
`goal-description-review-record.schema.json`. Set `recordStatus` to `candidate`
and `reviewAuthority` to `ai_candidate`. Return no prose, Markdown, code fence,
summary, or unrecognized key.

Do not include learner data, conversation data, personal learner identifiers,
credentials, private provider traces, invented source evidence, or an inferred
claim about an actual learner. A canonical `goalId` identifies public curriculum
content, not a person.


## Subject-specific criteria
# Mathematik: Kriterien für den Lernzielbeschreibungs-Review v2

Apply every criterion independently to every assigned mathematics goal.

- **Exact curricular scope:** Preserve the competence claimed by the current
  title, bilingual descriptions, relations, applicability context, and supplied
  source evidence. Do not import a sibling operation or raise the demand level.
- **Mathematical essential understanding:** Name the content-specific
  relationships, distinctions, structures, meanings, invariants, conditions,
  or reasons that organize the competence. A topic label, formula name, or
  procedural instruction alone is insufficient.
- **Independently observable performance:** State what the learner independently
  explains, derives, constructs, compares, represents, interprets, justifies,
  checks, models, or solves. Name the mathematical objects and relationships;
  do not use a generic phrase such as “shows understanding”.
- **Structure before substitution:** A calculation goal must keep quantities,
  operations, representations, signs, units where relevant, and result meaning
  connected. Copying a worked template or substituting values into a supplied
  formula is not by itself evidence of understanding.
- **Representation coordination:** Where relevant, require construction,
  interpretation, or translation among verbal descriptions, tables, graphs,
  terms, equations, diagrams, geometric figures, symbolic statements, or data.
  Copying the supplied visualization is insufficient.
- **Reasoned choice:** When alternatives, representations, models, solution
  paths, approximations, or strategies are part of the competence, make the
  decisive mathematical criteria, trade-offs, assumptions, or limits explicit.
- **Justification and proof discipline:** Distinguish an example from a general
  argument, an implication from an equivalence, plausibility from proof, and a
  numerical check from a derivation. Accept valid age- and stage-appropriate
  forms of reasoning within the claimed scope.
- **Modeling discipline:** Connect assumptions, mathematical model, solution,
  interpretation, and model limits. Preserve the difference between a
  mathematical result and a claim about the original situation.
- **Data and uncertainty:** For statistics or numerical procedures, preserve
  the relationship between data, chosen measure or method, variability,
  approximation, error, convergence, and the strength of the conclusion.
- **Meaningful changed-case transfer:** Change a structurally relevant feature,
  such as representation, parameter regime, constraint, direction of
  inference, data shape, geometric configuration, or modeling assumption. A
  number swap in an otherwise identical template is not enough.
- **Method neutrality:** Accept mathematically equivalent approaches. Require a
  particular method only when that method is itself the stated competence or is
  normatively source-bound.
- **Semantic atomicity remains reviewable:** An existing atomicity decision does
  not prohibit `split_review`. Use it when separate performances could be
  mastered independently. Keep coherent calculate-and-interpret or
  construct-and-justify chains together when they are genuinely one competence.
- **Age and stage fit:** Keep the description understandable at its effective
  Gymnasium stage while retaining the current mathematical precision and demand.
- **DE/EN parity:** German and English express the same objects, operations,
  conditions, reasoning, independence, and transfer demand. Neither language
  may add or omit a facet.
- **Description/profile boundary:** Keep a replacement short and
  learner-facing. Detailed cases, variation sequences, coverage, repeated
  demonstrations, and assessment conditions belong in the separate
  `positive-understanding-evidence-v2` profile.
- **Conservative revision:** Use `keep` when the current text is already
  adequate. Use `revise` only for a concrete local improvement that preserves
  identity and scope. Use `block` for unresolved source, identity, factual, or
  applicability ambiguity.
- **No automatic authority:** Every AI record remains
  `candidate`/`ai_candidate`. Agreement between models is not an approval and
  cannot mutate curriculum or runtime behavior.

At the start of a new current-state campaign, recommend `create` when no current
V2 profile is supplied. A visualization remains teaching support; evidence must
be learner-generated in an independently presented task.


## Bound result schema
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json",
  "title": "SkillPilot learning-goal description review record v1",
  "description": "Exactly one fingerprint-bound decision for one learning goal in one description-review run. AI output remains a non-authoritative candidate.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "$schema",
    "schemaVersion",
    "recordId",
    "runId",
    "campaignId",
    "roundId",
    "bundleFingerprint",
    "bookDigest",
    "goalId",
    "goalFingerprint",
    "pageFingerprint",
    "currentTitleDe",
    "currentTitleEn",
    "currentDescriptionDe",
    "currentDescriptionEn",
    "decision",
    "understandingEvidence",
    "rationale",
    "evidenceProfileContract",
    "evidenceProfileRecommendation",
    "recordStatus",
    "reviewAuthority"
  ],
  "properties": {
    "$schema": {
      "const": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json"
    },
    "schemaVersion": { "const": 1 },
    "recordId": { "$ref": "#/$defs/stableId" },
    "runId": { "$ref": "#/$defs/stableId" },
    "campaignId": { "$ref": "#/$defs/stableId" },
    "roundId": { "$ref": "#/$defs/stableId" },
    "bundleFingerprint": { "$ref": "#/$defs/digest" },
    "bookDigest": { "$ref": "#/$defs/digest" },
    "goalId": { "$ref": "#/$defs/stableId" },
    "goalFingerprint": { "$ref": "#/$defs/digest" },
    "pageFingerprint": { "$ref": "#/$defs/digest" },
    "currentTitleDe": { "$ref": "#/$defs/nonBlank" },
    "currentTitleEn": { "$ref": "#/$defs/nonBlank" },
    "currentDescriptionDe": { "$ref": "#/$defs/longText" },
    "currentDescriptionEn": { "$ref": "#/$defs/longText" },
    "decision": { "enum": ["keep", "revise", "split_review", "block"] },
    "proposedDescriptionDe": { "$ref": "#/$defs/longText" },
    "proposedDescriptionEn": { "$ref": "#/$defs/longText" },
    "understandingEvidence": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "essentialUnderstandingDe",
        "essentialUnderstandingEn",
        "observablePerformanceDe",
        "observablePerformanceEn",
        "transferExpectationDe",
        "transferExpectationEn"
      ],
      "properties": {
        "essentialUnderstandingDe": {
          "description": "Positive, goal-specific statement in German of the subject-specific ideas, relationships, distinctions, structures, models, meanings, or conditions the learner understands.",
          "$ref": "#/$defs/longText"
        },
        "essentialUnderstandingEn": {
          "description": "Positive, goal-specific statement in English of the subject-specific ideas, relationships, distinctions, structures, models, meanings, or conditions the learner understands.",
          "$ref": "#/$defs/longText"
        },
        "observablePerformanceDe": {
          "description": "Concrete statement in German of what the learner can explain, justify, construct, compare, or solve as evidence of that understanding.",
          "$ref": "#/$defs/longText"
        },
        "observablePerformanceEn": {
          "description": "Concrete statement in English of what the learner can explain, justify, construct, compare, or solve as evidence of that understanding.",
          "$ref": "#/$defs/longText"
        },
        "transferExpectationDe": {
          "description": "Positive statement in German of how the learner applies the understanding to a changed example, representation, or context.",
          "$ref": "#/$defs/longText"
        },
        "transferExpectationEn": {
          "description": "Positive statement in English of how the learner applies the understanding to a changed example, representation, or context.",
          "$ref": "#/$defs/longText"
        }
      }
    },
    "rationale": { "$ref": "#/$defs/longText" },
    "evidenceProfileContract": { "const": "positive-understanding-evidence-v2" },
    "evidenceProfileRecommendation": { "enum": ["none", "create", "revise"] },
    "recordStatus": { "enum": ["candidate", "accepted", "rejected"] },
    "reviewAuthority": { "enum": ["ai_candidate", "human"] }
  },
  "allOf": [
    {
      "if": {
        "properties": { "decision": { "const": "revise" } },
        "required": ["decision"]
      },
      "then": {
        "properties": {
          "proposedDescriptionDe": { "$ref": "#/$defs/longText" },
          "proposedDescriptionEn": { "$ref": "#/$defs/longText" }
        },
        "required": ["proposedDescriptionDe", "proposedDescriptionEn"]
      },
      "else": {
        "not": {
          "anyOf": [
            { "required": ["proposedDescriptionDe"] },
            { "required": ["proposedDescriptionEn"] }
          ]
        }
      }
    },
    {
      "if": {
        "properties": { "reviewAuthority": { "const": "ai_candidate" } },
        "required": ["reviewAuthority"]
      },
      "then": {
        "properties": { "recordStatus": { "const": "candidate" } }
      }
    },
    {
      "if": {
        "properties": { "recordStatus": { "const": "accepted" } },
        "required": ["recordStatus"]
      },
      "then": {
        "properties": { "reviewAuthority": { "const": "human" } }
      }
    }
  ],
  "$defs": {
    "stableId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "pattern": "^[A-Za-z0-9][A-Za-z0-9._:+-]*$"
    },
    "digest": {
      "type": "string",
      "pattern": "^sha256:[a-f0-9]{64}$"
    },
    "nonBlank": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "pattern": "^\\S(?:[\\s\\S]*\\S)?$"
    },
    "longText": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4000,
      "pattern": "^\\S(?:[\\s\\S]*\\S)?$"
    }
  }
}


## Exact current bound GoalBook review input
{
  "$schema": "https://skillpilot.com/schemas/goal-description-review/v3/goal-description-review-input.schema.json",
  "schemaVersion": 3,
  "bundleFingerprint": "sha256:b5090c98fb789382e94de3e5a8e082a846c332fb4368f61f8ffd9335ce445579",
  "bookDigest": "sha256:eb65ef808bd1fb2ab9f65e9863dbdf10aefedcd83ab0e52d3852341a7b17ae62",
  "goalCount": 3,
  "goals": [
    {
      "goalId": "3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6",
      "goalFingerprint": "sha256:f8c6d77b0b2e16c87ef25d26a6a554aa7a940bf4a3123c815a02e1fa85058254",
      "pageFingerprint": "sha256:10eb3094f05cb2122c9549d75b5792310cb7f1f4cf74f5086f0b9a1caa69a11b",
      "currentTitleDe": "Zählverfahren und kombinatorische Überlegungen für Wahrscheinlichkeiten nutzen",
      "currentTitleEn": "Use counting procedures and combinatorial reasoning for probabilities",
      "currentDescriptionDe": "Die lernende Person kann Zählverfahren strukturieren, kombinatorische Überlegungen in Sachsituationen einsetzen und sie zur effizienten Bestimmung von Wahrscheinlichkeiten in endlichen Modellen nutzen.",
      "currentDescriptionEn": "The learner can structure counting procedures, use combinatorial reasoning in contextual situations, and apply it to determine probabilities efficiently in finite models.",
      "canonicalContext": {
        "shortKey": "canonical_math_sek1_counting_combinatorial_reasoning_probability",
        "phase": null,
        "core": true,
        "weight": 1,
        "tags": [
          "canonical"
        ],
        "competencyRefs": [],
        "sourceRef": null,
        "dimensionTags": {
          "framework": "canonical-gymnasium-math",
          "demandLevel": "AB2",
          "processCompetencies": [
            "K1.1",
            "K2.1",
            "K4.1"
          ],
          "guidingIdeas": [
            "L1",
            "L5"
          ],
          "phase": "J10",
          "area": "Probability",
          "topicCode": "CANONICAL.MATH.SEK1.DATA.PROBABILITY.D5A"
        },
        "applicability": {
          "jurisdiction": [
            "DE-BB",
            "DE-BE",
            "DE-BW",
            "DE-HB",
            "DE-HE",
            "DE-HH",
            "DE-MV",
            "DE-NI",
            "DE-NW",
            "DE-RP",
            "DE-SH",
            "DE-SL",
            "DE-SN",
            "DE-ST",
            "DE-TH"
          ]
        },
        "type": "atomic",
        "nodeKind": null,
        "semanticAtomic": true,
        "semanticKind": null,
        "applicabilitySemantics": {
          "fromRequires": null,
          "mappingInheritance": null,
          "projection": null
        },
        "requires": [
          "2ae76eae-799c-463e-9ec9-82327f8209a8",
          "5ab17678-bba7-4e6b-9aff-5a909e24d40e",
          "65365dce-f33f-49d8-9516-42f75883aa86"
        ],
        "contains": [],
        "examples": []
      },
      "reviewContext": {
        "page": {
          "pageNumber": 1,
          "navigationOrder": 2,
          "treeOrder": 13,
          "goalId": "3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6",
          "shortKey": "canonical_math_sek1_counting_combinatorial_reasoning_probability",
          "anchor": "goal-3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6",
          "title": "Zählverfahren und kombinatorische Überlegungen für Wahrscheinlichkeiten nutzen",
          "description": "Die lernende Person kann Zählverfahren strukturieren, kombinatorische Überlegungen in Sachsituationen einsetzen und sie zur effizienten Bestimmung von Wahrscheinlichkeiten in endlichen Modellen nutzen.",
          "breadcrumbs": [
            "Mathematik",
            "Bundeslandspezifische Ergänzungen",
            "Sekundarstufe I",
            "Wahrscheinlichkeit"
          ],
          "chapterIds": [
            "structure:goal-book-math-root",
            "structure:goal-book-bundesland-supplements",
            "structure:goal-book-supplement-seki",
            "structure:goal-book-supplement-SekI-Probability"
          ],
          "applicability": [
            {
              "jurisdiction": "DE-BW",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                },
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-HB",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-HH",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-MV",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-NW",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-RP",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                },
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-SL",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-SN",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            }
          ],
          "requires": [],
          "reverseRequires": [],
          "externalPrerequisites": [
            {
              "goalId": "65365dce-f33f-49d8-9516-42f75883aa86",
              "title": "Warum Mathematik? – Entdecken, Muster & Alltag",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-65365dce-f33f-49d8-9516-42f75883aa86"
            },
            {
              "goalId": "2ae76eae-799c-463e-9ec9-82327f8209a8",
              "title": "Einfache Zählprinzipien in Sachsituationen anwenden",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-2ae76eae-799c-463e-9ec9-82327f8209a8"
            },
            {
              "goalId": "5ab17678-bba7-4e6b-9aff-5a909e24d40e",
              "title": "Laplace-Experimente auswerten",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-5ab17678-bba7-4e6b-9aff-5a909e24d40e"
            }
          ],
          "externalReverseRequires": [
            {
              "goalId": "e5055665-89ae-5be6-8fc7-42a9e991d63d",
              "title": "Aufgabe 6 (Jahrgangsstufe 10, 10 BE)",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-e5055665-89ae-5be6-8fc7-42a9e991d63d"
            }
          ],
          "visualization": null,
          "evidenceReview": null,
          "goalFingerprint": "sha256:f8c6d77b0b2e16c87ef25d26a6a554aa7a940bf4a3123c815a02e1fa85058254",
          "pageFingerprint": "sha256:10eb3094f05cb2122c9549d75b5792310cb7f1f4cf74f5086f0b9a1caa69a11b"
        },
        "evidenceProfile": null
      }
    },
    {
      "goalId": "3e4032bd-4d8c-4e72-bfdd-64a34df053c9",
      "goalFingerprint": "sha256:501c93c5ca77d58a6d4160cc89846cfccd169994c8ea4a11773573afc6d0ed43",
      "pageFingerprint": "sha256:b114a9d2dda881a76929f461654e74812a98f2463b0a194bab9f0b94e47d0757",
      "currentTitleDe": "Scheitelpunkte quadratischer Funktionen bestimmen",
      "currentTitleEn": "Determine vertices of quadratic functions",
      "currentDescriptionDe": "Die lernende Person kann aus quadratischen Termen den Scheitelpunkt ermitteln, zwischen Normal- und Scheitelpunktform wechseln und den zugehörigen Graphen skizzieren.",
      "currentDescriptionEn": "The learner can determine the vertex from quadratic expressions, switch between general and vertex form, and sketch the corresponding graph.",
      "canonicalContext": {
        "shortKey": "canonical_math_quadratic_vertices_and_graphs",
        "phase": null,
        "core": true,
        "weight": 1,
        "tags": [
          "canonical",
          "modality:visual",
          "representation:graph",
          "tool:geogebra"
        ],
        "competencyRefs": [],
        "sourceRef": null,
        "dimensionTags": {
          "framework": "canonical-gymnasium-math",
          "demandLevel": "AB2",
          "processCompetencies": [
            "K1.1",
            "K2.1",
            "K3.1"
          ],
          "guidingIdeas": [
            "L1",
            "L4"
          ],
          "phase": "GLOBAL",
          "area": "Analysis",
          "topicCode": "CANONICAL.MATH.SEK1.3A1"
        },
        "applicability": {
          "jurisdiction": [
            "DE-BB",
            "DE-BE",
            "DE-BW",
            "DE-BY",
            "DE-HB",
            "DE-HE",
            "DE-HH",
            "DE-MV",
            "DE-NI",
            "DE-NW",
            "DE-RP",
            "DE-SH",
            "DE-SL",
            "DE-SN",
            "DE-ST",
            "DE-TH"
          ]
        },
        "type": "atomic",
        "nodeKind": null,
        "semanticAtomic": null,
        "semanticKind": null,
        "applicabilitySemantics": {
          "fromRequires": null,
          "mappingInheritance": null,
          "projection": null
        },
        "requires": [
          "af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186",
          "9023226b-fc17-412b-807c-2bb45cd551d5",
          "65365dce-f33f-49d8-9516-42f75883aa86",
          "fd860da9-73ba-47cd-a1a8-452424915a80",
          "2c4830e6-a8d5-48d0-9202-3b7d18a419c2"
        ],
        "contains": [],
        "examples": []
      },
      "reviewContext": {
        "page": {
          "pageNumber": 2,
          "navigationOrder": 0,
          "treeOrder": 5,
          "goalId": "3e4032bd-4d8c-4e72-bfdd-64a34df053c9",
          "shortKey": "canonical_math_quadratic_vertices_and_graphs",
          "anchor": "goal-3e4032bd-4d8c-4e72-bfdd-64a34df053c9",
          "title": "Scheitelpunkte quadratischer Funktionen bestimmen",
          "description": "Die lernende Person kann aus quadratischen Termen den Scheitelpunkt ermitteln, zwischen Normal- und Scheitelpunktform wechseln und den zugehörigen Graphen skizzieren.",
          "breadcrumbs": [
            "Mathematik",
            "Sekundarstufe I",
            "Jahrgangsstufe 9",
            "Quadratische Funktionen beschreiben und anwenden",
            "Quadratische Funktionen und Gleichungen grundlegend untersuchen"
          ],
          "chapterIds": [
            "structure:goal-book-math-root",
            "structure:canonical-structure:sek1",
            "structure:canonical-structure:j9",
            "structure:canonical-structure:j9-quadratics",
            "structure:canonical-structure:j9-quadratics-basics"
          ],
          "applicability": [
            {
              "jurisdiction": "DE-BB",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                },
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-BE",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                },
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-BW",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                },
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-BY",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-HB",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-HE",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                },
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-HH",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-MV",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-NI",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-NW",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-RP",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                },
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-SH",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                },
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-SL",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G9",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-SN",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-ST",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            },
            {
              "jurisdiction": "DE-TH",
              "scopes": [
                {
                  "stage": "SekI",
                  "durationModel": "G8",
                  "courseProfile": null
                }
              ]
            }
          ],
          "requires": [],
          "reverseRequires": [],
          "externalPrerequisites": [
            {
              "goalId": "65365dce-f33f-49d8-9516-42f75883aa86",
              "title": "Warum Mathematik? – Entdecken, Muster & Alltag",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-65365dce-f33f-49d8-9516-42f75883aa86"
            },
            {
              "goalId": "2c4830e6-a8d5-48d0-9202-3b7d18a419c2",
              "title": "Terme im Bereich rationaler Zahlen äquivalent umformen",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-2c4830e6-a8d5-48d0-9202-3b7d18a419c2"
            },
            {
              "goalId": "fd860da9-73ba-47cd-a1a8-452424915a80",
              "title": "Sachsituationen in Terme mit Variablen übersetzen",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-fd860da9-73ba-47cd-a1a8-452424915a80"
            },
            {
              "goalId": "af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186",
              "title": "Lineare Funktionen beschreiben",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186"
            },
            {
              "goalId": "9023226b-fc17-412b-807c-2bb45cd551d5",
              "title": "Quadratische Gleichungen lösen",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-9023226b-fc17-412b-807c-2bb45cd551d5"
            }
          ],
          "externalReverseRequires": [
            {
              "goalId": "ec707244-9dde-510c-8c1e-955f23016231",
              "title": "Aufgabe 2 (Jahrgangsstufe 9, 10 BE)",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-ec707244-9dde-510c-8c1e-955f23016231"
            },
            {
              "goalId": "7bff61c1-1a69-4991-97de-0cff764f507e",
              "title": "Darstellungsformen quadratischer Funktionen situationsgerecht nutzen",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-7bff61c1-1a69-4991-97de-0cff764f507e"
            },
            {
              "goalId": "15ce2a7e-a5dc-44f7-8a5e-6d04dd81db12",
              "title": "Ganzrationale Funktionen als Summen von Potenzfunktionen beschreiben",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-15ce2a7e-a5dc-44f7-8a5e-6d04dd81db12"
            },
            {
              "goalId": "1ce8af38-082a-477b-af48-b924c92761bf",
              "title": "Ganzrationale Funktionen über Term und Graph beschreiben",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-1ce8af38-082a-477b-af48-b924c92761bf"
            }
          ],
          "visualization": {
            "resourceType": "image",
            "title": "Visualisierung: Scheitelpunkte quadratischer Funktionen bestimmen",
            "url": "/assets/goal-visualizations/mathematik/3e4032bd-4d8c-4e72-bfdd-64a34df053c9/3e4032bd-4d8c-4e72-bfdd-64a34df053c9.jpg",
            "altText": "Didaktische Visualisierung zum Lernziel \"Scheitelpunkte quadratischer Funktionen bestimmen\". Die lernende Person kann aus quadratischen Termen den Scheitelpunkt ermitteln, zwischen Normal- und Scheitelpunktform wechseln und den zugehörigen Graphen skizzieren.",
            "originalDigest": "sha256:a5a948a36cec5b38bb598c4d25959ce2cbe54ed5910d76baa2a8bb9f7223eb6d",
            "qaStatus": "review_candidate",
            "approvedForPublication": false
          },
          "evidenceReview": null,
          "goalFingerprint": "sha256:501c93c5ca77d58a6d4160cc89846cfccd169994c8ea4a11773573afc6d0ed43",
          "pageFingerprint": "sha256:b114a9d2dda881a76929f461654e74812a98f2463b0a194bab9f0b94e47d0757"
        },
        "evidenceProfile": null
      }
    },
    {
      "goalId": "ed5d869b-af4e-4b80-b34d-a2338e16ce34",
      "goalFingerprint": "sha256:49287589dc34cb492ee43fefbb305e281f19bb3a13ccbc4b722cdd78608c26ab",
      "pageFingerprint": "sha256:35a72e101ad07cbb87bff7ad53abacc9dfda3650b18341f2d9726ba9e1bb893c",
      "currentTitleDe": "Orthogonale Projektionen als erste lineare Abbildungsintuition deuten",
      "currentTitleEn": "Interpret orthogonal projections as a first intuition for linear mappings",
      "currentDescriptionDe": "Die lernende Person kann an orthogonalen Projektionen auf einen festen linearen Unterraum erläutern, dass jedem Vektor ein Anteil in diesem Unterraum und ein dazu senkrechter Rest zugeordnet wird, und dies als erstes Beispiel einer linearen Abbildung deuten.",
      "currentDescriptionEn": "The learner can use orthogonal projections onto a fixed linear subspace to explain how each vector is assigned a component in that subspace and a perpendicular remainder, and interpret this as an initial example of a linear mapping.",
      "canonicalContext": {
        "shortKey": "canonical_math_sek2_linear_mappings_projection_intuition",
        "phase": null,
        "core": true,
        "weight": 1,
        "tags": [
          "canonical"
        ],
        "competencyRefs": [],
        "sourceRef": null,
        "dimensionTags": {
          "framework": "canonical-gymnasium-math",
          "demandLevel": "AB2",
          "processCompetencies": [
            "K2.2",
            "K3.3"
          ],
          "guidingIdeas": [
            "L3"
          ],
          "phase": "GLOBAL",
          "area": "LinearAlgebra",
          "topicCode": "CANONICAL.MATH.SEK2.LINEAR_MAPPINGS.PROJECTION_INTUITION"
        },
        "applicability": {
          "jurisdiction": [
            "DE-BB",
            "DE-BE",
            "DE-BW",
            "DE-HB",
            "DE-HE",
            "DE-HH",
            "DE-MV",
            "DE-NI",
            "DE-NW",
            "DE-RP",
            "DE-SH",
            "DE-SL",
            "DE-SN",
            "DE-ST",
            "DE-TH"
          ]
        },
        "type": "atomic",
        "nodeKind": null,
        "semanticAtomic": null,
        "semanticKind": null,
        "applicabilitySemantics": {
          "fromRequires": null,
          "mappingInheritance": null,
          "projection": null
        },
        "requires": [
          "3016ec37-1c2e-47db-83f5-e767923bc97e"
        ],
        "contains": [],
        "examples": []
      },
      "reviewContext": {
        "page": {
          "pageNumber": 3,
          "navigationOrder": 1,
          "treeOrder": 9,
          "goalId": "ed5d869b-af4e-4b80-b34d-a2338e16ce34",
          "shortKey": "canonical_math_sek2_linear_mappings_projection_intuition",
          "anchor": "goal-ed5d869b-af4e-4b80-b34d-a2338e16ce34",
          "title": "Orthogonale Projektionen als erste lineare Abbildungsintuition deuten",
          "description": "Die lernende Person kann an orthogonalen Projektionen auf einen festen linearen Unterraum erläutern, dass jedem Vektor ein Anteil in diesem Unterraum und ein dazu senkrechter Rest zugeordnet wird, und dies als erstes Beispiel einer linearen Abbildung deuten.",
          "breadcrumbs": [
            "Mathematik",
            "Sekundarstufe II (GK und LK)",
            "Analytische Geometrie, lineare Algebra und vertiefte Analysis",
            "Lineare geometrische Abbildungen und Abbildungsmatrizen"
          ],
          "chapterIds": [
            "structure:goal-book-math-root",
            "structure:goal-book-math-sekii-gk-lk",
            "structure:canonical-structure:geometry-and-advanced-analysis",
            "structure:canonical-goal-b3d2284c-21e0-5af8-942a-a4c11390c84a"
          ],
          "applicability": [
            {
              "jurisdiction": "DE-BB",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-BE",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-BW",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-HB",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-HE",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-HH",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-MV",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-NI",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-NW",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-RP",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-SH",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-SL",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-SN",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-ST",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            },
            {
              "jurisdiction": "DE-TH",
              "scopes": [
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "GK"
                },
                {
                  "stage": "SekII",
                  "durationModel": null,
                  "courseProfile": "LK"
                }
              ]
            }
          ],
          "requires": [],
          "reverseRequires": [],
          "externalPrerequisites": [
            {
              "goalId": "3016ec37-1c2e-47db-83f5-e767923bc97e",
              "title": "Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-3016ec37-1c2e-47db-83f5-e767923bc97e"
            }
          ],
          "externalReverseRequires": [
            {
              "goalId": "1878f680-095c-511d-aaed-e98393f7fde9",
              "title": "Raumorientierung und Volumenprobleme lösen",
              "canonicalUrl": "https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-1878f680-095c-511d-aaed-e98393f7fde9"
            }
          ],
          "visualization": {
            "resourceType": "image",
            "title": "Visualisierung: Orthogonale Projektionen als erste lineare Abbildungsintuition deuten",
            "url": "/assets/goal-visualizations/mathematik/ed5d869b-af4e-4b80-b34d-a2338e16ce34/ed5d869b-af4e-4b80-b34d-a2338e16ce34.jpg",
            "altText": "Ein Vektor (3,2) wird orthogonal auf die x-Achse zum Vektor (3,0) projiziert; der Restvektor (0,2) steht senkrecht auf der x-Achse.",
            "originalDigest": "sha256:5b22a3496ce993ca96771331e287acfa647e13d7878b673dccdd9d33daeaa747",
            "qaStatus": "review_candidate",
            "approvedForPublication": false
          },
          "evidenceReview": null,
          "goalFingerprint": "sha256:49287589dc34cb492ee43fefbb305e281f19bb3a13ccbc4b722cdd78608c26ab",
          "pageFingerprint": "sha256:35a72e101ad07cbb87bff7ad53abacc9dfda3650b18341f2d9726ba9e1bb893c"
        },
        "evidenceProfile": null
      }
    }
  ],
  "reviewInputFingerprint": "sha256:ef79453e64dd8eb7fac4681cd6d2ff17baf2cabfe552e2191661fad2b022570b"
}

## Exact review run and record bindings
{
  "provider": "openai",
  "model": "gpt-6-sol",
  "runId": "codex-cli-m7-vready-remainder-six-open-three-20260923-v1-a-gpt-6-sol",
  "campaignId": "mathematik-m7-vready-remainder-six-open-three-20260923-v1-a",
  "roundId": "mathematik-m7-vready-remainder-six-open-three-20260923-v1-first-pass-a",
  "bundleFingerprint": "sha256:b5090c98fb789382e94de3e5a8e082a846c332fb4368f61f8ffd9335ce445579",
  "bookDigest": "sha256:eb65ef808bd1fb2ab9f65e9863dbdf10aefedcd83ab0e52d3852341a7b17ae62",
  "recordIdsByGoalId": {
    "3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6": "codex-cli-m7-vready-remainder-six-open-three-20260923-v1-a-gpt-6-sol-3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6",
    "3e4032bd-4d8c-4e72-bfdd-64a34df053c9": "codex-cli-m7-vready-remainder-six-open-three-20260923-v1-a-gpt-6-sol-3e4032bd-4d8c-4e72-bfdd-64a34df053c9",
    "ed5d869b-af4e-4b80-b34d-a2338e16ce34": "codex-cli-m7-vready-remainder-six-open-three-20260923-v1-a-gpt-6-sol-ed5d869b-af4e-4b80-b34d-a2338e16ce34"
  },
  "recordStatus": "candidate",
  "reviewAuthority": "ai_candidate",
  "instruction": "Use only this round’s current input and these exact IDs. Do not invent bindings. Do not inspect any other round or output."
}
