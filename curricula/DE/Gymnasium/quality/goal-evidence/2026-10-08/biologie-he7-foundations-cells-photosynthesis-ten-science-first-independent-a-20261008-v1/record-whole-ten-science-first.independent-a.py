"""Record completed independent reading/judgments; this script does not perform scientific review."""
import datetime
import hashlib
import json
import pathlib
import subprocess

REPO = pathlib.Path.cwd()
OWN = pathlib.Path(__file__).parent
AUTHOR = OWN.parent / "biologie-he7-foundations-cells-photosynthesis-ten-whole-science-author-20261008-v1"
AUTHOR_SEAL = AUTHOR / "ten-whole-science-native-P10-author-input.first.freeze.json"
EXPECTED_AUTHOR_SEAL = "3feb83811528924fa622dc6d615df735b30b0b53bce65c23c5ee6b5341245479"
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def relative(p):
    return str(p.relative_to(REPO))


def load(p):
    return json.loads(p.read_text())


def put(name, body):
    with (OWN / name).open("x") as out:
        out.write(json.dumps(body, ensure_ascii=False, indent=2) + "\n")


assert digest(AUTHOR_SEAL) == EXPECTED_AUTHOR_SEAL
sealed = load(AUTHOR_SEAL)
verified = []
for item in sealed["files"]:
    p = REPO / item["path"]
    assert p.is_file() and digest(p) == item["sha256"] and p.stat().st_size == item["bytes"], p
    verified.append(item)
assert len(verified) == 85
goals = load(AUTHOR / "current-ten-whole-DEEN-goals.actual.json")["wholeGoals"]
cases = load(AUTHOR / "ten-whole-goals-twenty-complete-DEEN-cases.author.json")["wholeCases"]
profiles = [json.loads(line) for line in (AUTHOR / "P10.whole-current-author.review.jsonl").read_text().splitlines()]
canonical_path = REPO / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
live = {g["id"]: g for g in load(canonical_path)["goals"]}
assert len(goals) == len(profiles) == 10 and len(cases) == 20
assert all(live[g["id"]] == g for g in goals)
case_map = {c["id"]: c for c in cases}
for i, profile in enumerate(profiles):
    assert profile["goalId"] == goals[i]["id"]
    assert profile["status"] == "needs_human_review" and profile["reviewAuthority"] == "ai_candidate"
    assert profile["evidenceLevel"] == "E1" and profile["maximumClaimScope"] == "G1"
    for brief in profile["profile"]["applicationCaseBriefs"]:
        case = case_map[brief["id"]]
        for suffix, lang in [("De", "de"), ("En", "en")]:
            assert brief["taskDemand" + suffix] == case["material"][lang] + " " + case["task"][lang]
            assert brief["expectedPerformance" + suffix] == case["modelAnswer"][lang]
            assert brief["understandingFocus" + suffix] == " ".join(e["essentialUnderstanding" + suffix] for e in profile["profile"]["expectations"])

# These judgments were formulated after actual whole bilingual reading, before any peer-B result.
judgments = [
    (
        "Describing biology as a science of life is an assessable subject concept, distinct from an unassessed motivation anchor. Both languages preserve the same scope. HE5.1 and its whole rationale support life processes, diversity and scientific observation without making every organism group a separate compulsory item.",
        "Core/transfer expectations require describing the subject and distinguishing investigable questions, traceable evidence and a personal value judgment. They do not certify a completed investigation or newly identified fossil.",
        [
            "Bean development and pond relationships are biological questions; choosing a preferred flower colour alone is a personal judgment. The answer correctly leaves human perception available to properly designed biological investigation.",
            "Plant, fungus and an explicitly labelled fossil refute an animals-only definition. The supplied fossil identity is correctly distinguished from an identification performed by the learner or reviewer.",
        ],
        [8],
    ),
    (
        "Collecting and organizing fundamental life characteristics matches HE5.1 and remains equal in DE/EN. Neither motion nor growth alone discriminates living systems, and reproduction is not a demand that each living individual currently reproduces.",
        "The profile checks meaningful organization of several related characteristics and their application to dormant or sterile living examples, rather than accepting an isolated list or single-feature exclusion rule. Existing compact-characteristic memory decisions remain retained, not newly reviewed here.",
        [
            "The bean has cellular organization, metabolism, development/response and a reproductive life context; crystal deposition and motor-driven movement show why a single feature does not prove life.",
            "The viable dry seed and sterile animal expose a false universal requirement for visibly moving or individually reproducing organisms. The supplied histories are used honestly as model material.",
        ],
        [8],
    ),
    (
        "HE7.1 requires actual microscope operation and simple preparation. Preparing and viewing one usable mount form a coherent working sequence; the original method notes expressly include illumination, depth, artefacts and specimen preparation. DE/EN both retain operation and preparation.",
        "Both procedure expectations require genuinely observable practical actions when that competence is claimed. Conditional supervised execution does not make reading or reciting this model answer evidence of actual handling. The public-model candidate is scientifically suitable, while all actual-operation attainment remains unproved.",
        [
            "Thin unfolded wet epidermis, controlled angled coverslip placement, low magnification, suitable illumination/centering and protected objective clearance correct the supplied faulty dry thick high-power start. Coarse/fine-focus use is appropriately tied to the stated instrument instructions.",
            "Returning to low power, choosing a thin region or remaking the mount, and safely fine-focusing address folds and lost field. Focal planes and bubbles are correctly distinguished from an automatically identified nucleus; the record must identify what was actually observed.",
        ],
        [19],
    ),
    (
        "Naming represented plant-cell components and explaining their functions matches HE7.1's green-plant-cell/model scope. Functions of wall, membrane, cytoplasm, nucleus, chloroplast and supplied vacuole are correct and equivalent in DE/EN; a typical green leaf model is not every plant cell or a proved micrograph.",
        "Core/transfer expectations join identification with functional explanation and test wall versus membrane and chloroplast-context limits. Supplied vacuole/reference detail does not newly establish a universal all-route content duty. Existing current A/M and card judgments are retained, not promoted to a new card review.",
        [
            "The wall supplies mechanical support; the membrane regulates the boundary and exchange; cytoplasm, nucleus, chloroplast and vacuole roles are appropriately bounded. The answer explicitly limits optical visibility and model scale.",
            "The known nongreen onion cell remains plant tissue. An intact wall does not restore a damaged selectively acting membrane; the typical model is not generalized to every cell.",
        ],
        [19],
    ),
    (
        "The supplied known plant/animal comparison matches HE7.1 and preserves the same DE/EN competence. Shared membrane, cytoplasm and nuclei are statements about these supplied living examples; supplementary mitochondria and fungi-wall facts do not widen the ordinary target to full classification of all cells.",
        "Both expectations require an organized comparison and functional/contextual interpretation, including correction of missing-animal-membrane and shape/chloroplast generalizations. This is concept comparison rather than an invented new specimen identification.",
        [
            "Known green leaf and cheek epithelial models correctly share membrane, cytoplasm, nucleus and supplied mitochondria; plant-wall/chloroplast/large-vacuole distinctions are bounded to the represented examples. Absence of a cell wall is not absence of a membrane.",
            "Known root and animal epithelial provenance is preserved. Lack of root-cell chloroplasts does not establish animal origin, and a wall alone is not a universal plant identifier outside the stated comparison because fungi can also have walls.",
        ],
        [19],
    ),
    (
        "The current experimentally-demonstrate-light operator remains present in both languages and is supported by HE7.2's experimental approach. Light is deliberately varied with suitable initial/reference/blank and comparison controls; model findings do not substitute for real execution or establish unlimited proportional response.",
        "Experiment expectations require actual supervised handling and traceable control/result records for a practical attainment claim. The profile treats the starch assay as accumulated product evidence and oxygen as a controlled net signal with expressly supplied respiratory assumptions; these boundaries are appropriate.",
        [
            "Initial low-starch and positive-reference checks plus otherwise comparable transparent versus opaque covers support new starch associated with illumination under the stated controls. The answer acknowledges transport and further errors, so the assay is not an immediate measure of every photosynthetic step.",
            "The calibrated oxygen-specific controlled series increases from 1 to 3 to 4 for light levels 1 to 2 to 3, disproving proportional/unlimited extrapolation. Equal respiration is a declared model premise, and the warming bubble-only series neither isolates light nor identifies oxygen.",
        ],
        [20],
    ),
    (
        "HE7.2's grade-level requirement is that plants need carbon dioxide and water, with simple experimental work and judgment of inference limits; it does not mandate isotope tracing or direct isolated photochemical proof. Both DE/EN descriptions retain the experimental operator. The separate CO2 and water comparisons support the bounded physiological availability/dependence claim under their stated conditions.",
        "Both experiment expectations require separate controls and real execution/records for practical attainment. The water profile explicitly separates physiological availability from direct chemical use of water. A reduced starch signal and recovery are not proof of a universal concentration threshold, every causal mechanism or water-molecule conversion; none is claimed. Full microscopic substrate demonstration is deliberately withheld without weakening the original school-level requirement.",
        [
            "C isolates external CO2 under sufficient water and given controls; W changes water supply with an explicitly altered stomatal condition and recovery. This supports adequate water supply as a physiological condition in the experiment, while correctly not holding internal CO2 access equal or asserting direct reaction-substrate proof.",
            "The first multi-factor comparison is invalid for separate causal assignment. Separate series, initial/test controls, repeats and rewatering correct that design; equal external CO2 does not guarantee equal internal availability during water stress. The answer does not make an isotope or biochemical laboratory investigation an additional mandatory task.",
        ],
        [20],
    ),
    (
        "The whole HE7.2 content requires starch formation and oxygen evolution. Both current descriptions and profiles retain the two product-evidence aspects, and neither is inferred from mere bubbles or arbitrary sugar detection. Appropriate positive/control and gas/oxygen-specific findings support the stated school-level product-detection competence.",
        "Core and transfer expectations require suitable procedures, control interpretation and actual execution/protocol for practical attainment. Each assay is accounted for, without a mandatory single assay technology for every source route. Net oxygen accumulation, oxygen enrichment, gas purity, gross photosynthetic rate and starch-versus-free-glucose remain correctly distinct.",
        [
            "Initially low-starch illuminated tissue with dark/reference comparisons supports new starch; a supervised positive glowing-splint comparison supports oxygen-enriched collected gas. It does not prove pure oxygen, a production rate, free glucose or all photosynthesis products.",
            "The starch/glucose/blank iodine card correctly bounds the starch reaction. The calibrated oxygen-specific rise 5 to 8 mg/L with no-plant blank and dark consumption supports net oxygen accumulation in the stated plant treatment, while ongoing respiratory oxygen use prevents equality with gross photosynthetic production.",
        ],
        [20],
    ),
    (
        "The school-level summary word equation and its conceptual interpretation match HE7.2 and DE/EN equally: carbon dioxide and water are material inputs, light energy supports formation of organic carbohydrate and oxygen release. Neither soil nor light is an interchangeable material reactant in that equation.",
        "The representation profile requires reading the relationship and using it in a hydroponic/storage transfer case. It clearly distinguishes a summary equation from all biochemical intermediates and a positive starch test from proof of one immediate product.",
        [
            "The equation-card correction distinguishes light-energy input, carbon dioxide/water material input and organic substance/oxygen outcome. Chlorophyll-containing structures are stated as appropriate conditions, and the equation is openly a simplified overall model.",
            "Growth without soil is consistent with carbon from CO2 and indispensable water/mineral supply; a positive iodine assay identifies starch, not the sole immediate photosynthetic product or every biochemical pathway. Sugar can be processed for storage as starch.",
        ],
        [20],
    ),
    (
        "HE7.2 explicitly includes photosynthetic importance for growth/reserves/food/life on Earth and respiration in plants. Current DE/EN descriptions preserve that integrated relationship. Both models are appropriately limited to living, adequately supplied plants and do not claim that plants respire only in darkness.",
        "The concept profile covers organic synthesis, feeding relations, oxygen provision and the relationship to aerobic cellular respiration. Transfer through stored reserves distinguishes immediate dark growth from long-term replenishment; equal model respiration rates are not promoted to a general physiological measurement.",
        [
            "The provided simultaneous rates yield net CO2 uptake 5 minus 2 equals 3 in light, not absence of respiration; in darkness the supplied photosynthetic term is zero while respiration persists. Matter and usable-energy relationships remain distinct.",
            "Tuber reserves explain limited early dark growth and fuel synthesis/respiration, without proving photosynthesis in darkness or infinite reserve-supported growth. Suitable green tissue replenishment, food relations and aerobic respiration in nongreen as well as green living cells are correctly linked.",
        ],
        [20],
    ),
]

records = []
for i, (science, performance, case_reasons, pages) in enumerate(judgments):
    goal, profile = goals[i], profiles[i]
    own_cases = [c for c in cases if c["goalId"] == goal["id"]]
    assert len(own_cases) == 2
    records.append({
        "ordinal": i + 1,
        "goalId": goal["id"],
        "wholeGoalBody": goal,
        "scienceDescriptionAndBilingualVerdict": "PASS_CURRENT_HE_LINKED_WHOLE_GOAL",
        "scienceDescriptionAndBilingualReason": science,
        "wholePositiveProfileVerdict": "PASS_PUBLIC_MODEL_CANDIDATE",
        "wholePositiveProfileReason": performance,
        "wholePositiveProfileRecord": profile,
        "wholeDEENCases": [{"wholeCase": c, "verdict": "PASS_SCIENTIFIC_PUBLIC_MODEL", "reason": reason} for c, reason in zip(own_cases, case_reasons)],
        "wholePrimaryScope": {"jurisdiction": "DE-HE", "physicalPages": pages, "printedPages": [p - 1 for p in pages]},
        "actualPracticalAttainment": "UNPROVED_NOT_CLAIMED" if i + 1 in [3, 6, 7, 8] else "NOT_ASSESSED_NO_LEARNER_EVIDENCE",
        "semanticAtomicity": "EXISTING_VALID_CURRENT_ROW_RETAINED_NO_NEW_SCIENCE_RULING",
        "memoryDecision": "EXISTING_VALID_CURRENT_ROW_AND_REQUIRED_SHARED_CARD_CLOSURE_RETAINED_NO_NEW_CARD_REVIEW",
        "finalNativeDescriptionAndVisualization": "PENDING_ACTUAL_RASTER_NATIVE_INPUT",
        "blockingScientificFindings": [],
    })

ignored = subprocess.run(["git", "check-ignore", "--no-index", "--stdin"], input="\n".join(x["path"] for x in verified) + "\n", capture_output=True, text=True)
assert ignored.returncode in [0, 1]
ignored_paths = ignored.stdout.splitlines()
assert ignored_paths == [relative(AUTHOR / "input-snapshots/g9-biologie.official.pdf")], ignored_paths
portable = [x for x in verified if x["path"] not in ignored_paths]
pdf = AUTHOR / "input-snapshots/g9-biologie.official.pdf"
assert digest(pdf) == "93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1"

put("actual-whole-ten-source-cases-profile-reading.independent-a.json", {
    "schemaVersion": 1,
    "recordedAt": NOW,
    "role": "Independent science-first A; not author of these goals/cases/profiles",
    "authorFreeze": {"path": relative(AUTHOR_SEAL), "sha256": EXPECTED_AUTHOR_SEAL, "allLocallyVerifiedExact": 85},
    "actualReading": {
        "wholeUnchangedDEENGoals": 10,
        "completeDEENMaterialsTasksModelAnswers": 20,
        "completePositiveUnderstandingProfiles": 10,
        "embeddedCaseBodiesExactToActuallyReadCases": 20,
        "wholeOriginalHEGoalBodies": 10,
        "wholeMappingRecords": 30,
        "fullContainsParentsRead": 2,
        "otherConsumerScope": "Selected direct edge relationships inspected; no new whole scientific review of unrelated consumer goals and no edits to them.",
        "primaryPages": [
            {"physical": 3, "printed": 2, "scope": "General subject purpose and scientific methods"},
            {"physical": 6, "printed": 5, "scope": "Mandatory left-column contents versus recommended right-column activities and optional additions"},
            {"physical": 8, "printed": 7, "scope": "Whole HE5.1 science of life and collecting/organizing life characteristics"},
            {"physical": 19, "printed": 18, "scope": "Whole HE7.1 microscopy, preparation, green plant-cell spatial model and comparison; optional additions separated"},
            {"physical": 20, "printed": 19, "scope": "Whole HE7.2 factors, starch/oxygen evidence, word equation, photosynthetic importance, plant respiration and practical-method/inference limits"},
        ],
        "primaryReadingMethod": "Actual complete pdftotext page outputs were read, including the two full HE7 pages again during judgment completion; no hash-only scientific review.",
    },
    "primaryOriginalObservation": {
        "officialUrl": "https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf",
        "sha256": digest(pdf),
        "localHistoricalPath": relative(pdf),
        "gitIgnored": True,
        "role": "Actually read local primary observation only; not a required operative build/review dependency in this handoff",
        "historyUnchanged": True,
    },
    "targetedExternalFactualReadings": [
        {
            "title": "SAPS Student Sheet20: Can plants make starch in the dark?",
            "url": "https://www.saps.org.uk/teaching-resources/resources/285/student-sheet-20-can-plants-make-starch-in-the-dark/",
            "scopeActuallyRead": "Entire resource page main body, sections on treatment comparison, starch-test interpretation and limits of generalized plant-cell/chloroplast models; linked downloadable pack not read.",
            "boundedParaphrase": "Iodine-based starch evidence must be interpreted through supplied treatment controls; starch can be made from externally supplied glucose in darkness. A generalized green cell does not describe every plant cell.",
            "curricularOperatorProof": False,
        },
        {
            "title": "Tezara et al.1999: Water stress inhibits plant photosynthesis by decreasing coupling factor and ATP",
            "url": "https://www.nature.com/articles/44842",
            "scopeActuallyRead": "Actual publisher abstract and accessible preview; subscription full paper and its underlying data not read.",
            "boundedParaphrase": "Water stress can affect both stomatal CO2 access and metabolic processes. The reported sunflower study finds additional non-diffusional limitations, so a drought comparison is not direct evidence of water molecules acting as a photochemical substrate.",
            "curricularOperatorProof": False,
        },
    ],
    "failedOrLimitedExternalAccess": [
        "Both requested Practical Biology full resource opens failed; search summaries were seen but no full resource reading or procedural approval is claimed from them.",
        "Nature Geoscience2018 full open redirected to inaccessible authorization; no full paper reading is claimed.",
    ],
    "currentSelectedWholeBodies": {"canonicalPath": relative(canonical_path), "canonicalSha256AtEqualityCheck": digest(canonical_path), "wholeSelectedBodiesExact": 10, "activeCanonicalWritten": False},
    "peerBFilesRead": 0,
    "actualPerformedExperiments": 0,
    "learnerData": False,
    "imageInspections": 0,
    "nativeFinalDescriptionReviews": 0,
    "scientificReadingCompletedBeforeReceiptGeneration": True,
    "portableAuthorBindings": portable,
    "historyOnlyNonOperativeAuthorObservations": [x for x in verified if x["path"] in ignored_paths],
    "portableDependencyCaution": "Preserve the original author seal including its local PDF observation. Final operative D/P/V/source/bundle dependencies must not require that ignored snapshot. This science handoff binds the 84 commit-capable author files and documents the actual original PDF observation separately.",
})

put("first-ten-whole-science-source-performance.independent-a.verdict.json", {
    "schemaVersion": 1,
    "recordedAt": NOW,
    "phase": "Science-first independent A, before any peer-B judgment reading",
    "authorFreezeSha256": EXPECTED_AUTHOR_SEAL,
    "decisionScope": "The ten unchanged current HE-linked whole goal descriptions and twenty complete bilingual public-model cases/profiles; this is neither final raster/native D/V nor all-country operator closure nor actual learner practical attainment.",
    "records": records,
    "counts": {"wholeGoalsScientificallyPassed": 10, "completeDEENCasesPassed": 20, "wholeProfilesScientificallyPassedAsPublicModels": 10, "scientificBlockingFindings": 0, "strictCompletedGoalsAdded": 0, "positiveApproved": 0, "positiveNeedsHumanReview": 10},
    "explicitUnprovedClaims": [
        {"ordinals": [3, 6, 7, 8], "claim": "Actual practical handling/experimental learner attainment", "status": "UNPROVED_NOT_CLAIMED", "reason": "The machine-QA candidate supplies appropriate practical criteria; no pupil actions, original practical protocols or achieved learner competence were supplied."},
        {"ordinals": [7], "claim": "Direct chemical water-substrate proof from drought/stomatal closure", "status": "WITHHELD_INVALID_FROM_THIS_EVIDENCE", "reason": "The actual cases support bounded adequate-water dependence and identify mediated CO2 access; they do not infer chemical substrate conversion."},
        {"ordinals": [6, 8], "claim": "Bubble count alone proves oxygen identity, purity or gross rate", "status": "WITHHELD_INVALID_FROM_THIS_EVIDENCE", "reason": "Specific assay/calibrated oxygen evidence and net/gross limitations are explicitly required; the public models cannot prove these stronger claims."},
        {"ordinals": list(range(1, 11)), "claim": "All16-country original operator closure from unchanged raw applicability", "status": "NOT_NEWLY_ASSERTED", "reason": "The actual original source reading and decisions here concern HEG9. Retained metadata and existing valid evidence are not recast as freshly reviewed regional obligations."},
    ],
    "coverageInterpretation": "Two available cases and minIndependentDemonstrations2 express independent aspects/fresh transfer, not a rule to make every learner complete two separately named tasks. Stop assessing when genuine sufficient evidence covers the goal; the author dissent explicitly preserves that rule.",
    "sourceAlternativeAndOptionalLimits": "Right-column example methods, vacuole/mitochondria/fungal references and facultative phototaxis/fermentation/extra cell types do not become additional universal compulsory content or assay quotas.",
    "retainedAtomicityAndMemory": "Existing valid current A/M rows are preserved; this first science review neither writes new A/M verdicts nor scientifically rechecks historical unchanged cards. No new case science approval was inferred from retained rows or green technical checks.",
    "nextRequiredWork": "Pair with genuine independently sealed B science/source/performance judgment; author must then provide actual full PNG/360/680/native-current pages for final D/P/V and portable dependency checks. Rebase only affected bindings, preserving all newer other goals.",
    "peerBFilesRead": 0,
    "humanApproval": False,
    "humanTrial": False,
    "learnerAttainment": False,
    "activeWrites": 0,
})

own_outputs = [p for p in OWN.iterdir() if p.is_file()]
put("first-ten-whole-science-source-performance.independent-a.exact.freeze.json", {
    "schemaVersion": 1,
    "sealedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "kind": "Genuine independent A science-first first judgment; no peer-B reading; final native D/V pending",
    "authorHistoricalSeal": {"path": relative(AUTHOR_SEAL), "sha256": EXPECTED_AUTHOR_SEAL},
    "ownFiles": [{"path": relative(p), "sha256": digest(p), "bytes": p.stat().st_size} for p in sorted(own_outputs)],
    "requiredPortableAuthorFiles": portable,
    "localOnlyPrimaryObservationNotRequiredLive": {"officialUrl": "https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf", "sha256": digest(pdf), "physicalPagesActuallyRead": [3, 6, 8, 19, 20]},
    "sciencePassedWholeGoals": 10,
    "wholeCases": 20,
    "wholeProfiles": 10,
    "blockingScientificFindings": 0,
    "strictGain": 0,
    "finalRasterNativeDV": "pending",
    "peerBFilesRead": 0,
    "actualExperiments": 0,
    "humanApproval": False,
    "activeWrites": 0,
})
seal = OWN / "first-ten-whole-science-source-performance.independent-a.exact.freeze.json"
print(json.dumps({"firstScienceSeal": relative(seal), "sha256": digest(seal), "scienceGoals": 10, "wholeCases": 20, "profileCandidates": 10, "strictGain": 0, "peerBFilesRead": 0, "nativeFinalDV": "pending"}))
