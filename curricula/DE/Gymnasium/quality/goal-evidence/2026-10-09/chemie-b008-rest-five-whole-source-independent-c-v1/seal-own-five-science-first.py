"""Freeze this reviewer's actual bounded scientific first verdict.

This records conclusions made after the original primary, whole goal and partner
readings. It neither changes source decisions nor creates positive profiles.
"""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
OWN = Path(__file__).resolve().parent
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-rest-five-content-source-author-a-v1"
def read(name):
    return json.loads((AUTHOR / name).read_text())
def binding(path):
    payload = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(payload).hexdigest(), "bytes": len(payload)}
def write(name, value):
    path = OWN / name
    assert not path.exists(), f"Refusing to rewrite first output: {path}"
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")

whole = read("five-whole-content-source-candidates.with-ten-original-clauses-and29-partners.author-input.json")
frame = read("selected-ten-whole-source-duty-and-original-partner-frame.author-neutral.json")
goals = [entry["wholeCurrentTarget"] for entry in whole["items"]]
created = datetime.datetime.now(datetime.timezone.utc).isoformat()
rows = [
    {
        "goalId": goals[0]["id"],
        "boundedConclusion": "accept_partial_source_mechanism_and_synthetic_reference_only",
        "primaryWitness": {"jurisdiction": "DE-HE", "physicalPages": [46, 47], "printedPages": [46, 47], "courseProfile": "LK", "topic": "Q3.3"},
        "independentReasonDe": "Der Originaltext nennt die Nernst-Rechnung und ausdrücklich Überspannung/Zersetzungsspannung im erhöhten Niveau. Die gegen eine reversible Zellspannung erzwungene Umkehrung ist ein sachgerechter Beitrag des ganzen Ziels Elektrolyse und Gleichgewicht zu B09, aber kein Nachweis sämtlicher Ionenentladungen oder der CuCl2-Praxis. Das vorgegebene Zn/Cu-Modell ergibt Erev=1,1621593497 V und mit den ausdrücklich angesetzten Verlusten 1,3321593497 V. Die zweite Zahl ist ein Modellwert bei gegebenen Verlusten, keine universelle Schwellenspannung oder gemessene Zersetzungsspannung. Unter Stromfluss liegt kein Gleichgewicht vor.",
        "independentReasonEn": "The original elevated-level column explicitly states Nernst calculations and overvoltage/decomposition voltage. Forced reversal against a reversible voltage is a valid contribution to B09, not the complete ion-discharge or CuCl2 practical duty. Independently calculated reversible voltage is 1.1621593497 V; 1.3321593497 V includes the stated modeled losses, not a universal threshold or measurement. Current flow is not equilibrium.",
        "acceptedProposedEdgeCount": 1,
        "unresolved": ["The actual decree-selected HE contents have not been established by this input.", "Do not import pH or temperature dependence: the actual HE Nernst bullet excludes both.", "No complete executable cases/profile/rubric or current native page has been supplied."]
    },
    {
        "goalId": goals[1]["id"],
        "boundedConclusion": "accept_conditional_two_partial_roles_and_open_model_only",
        "primaryWitness": {"jurisdiction": "DE-HE", "physicalPages": [46, 48], "printedPages": [46, 48], "courseProfile": "LK", "topic": "Q3.4", "universallyCompulsory": False},
        "independentReasonDe": "Q3.4 nennt im LK offene Kohlensäure/Hydrogencarbonat- und Ammoniumpuffer sowie quantitative Henderson-Hasselbalch-Rechnung. Die Kombination von Henry-Beziehung und Protolyse über dieselbe CO2*-Größe ist ein gültiger begrenzter gekoppelter Modellfall. Die extern festgehaltene Hydrogencarbonatkonzentration ist ausdrücklich eine Randbedingung; damit wird keine geschlossene Gesamtbilanz gelöst. Nachgerechnet: pH 7,818521083 bzw. 7,517491087, Änderung -log10(2). Das zweite verlangte Ammoniumbeispiel ist dadurch nicht erfüllt. Der Verbindlichkeitssatz auf Seite 46 nennt Themenfelder 1 bis 3 mit Erlassauswahl, nicht pauschal Q3.4.",
        "independentReasonEn": "The actual LK section explicitly names both open carbonate/bicarbonate and ammonium buffers and quantitative Henderson-Hasselbalch work. Henry partitioning and protolysis share CO2*, yielding a valid limited coupled model under the stated external bicarbonate clamp, not a closed balance. Independent pH values are 7.818521083 and 7.517491087, differing by -log10(2). This does not fulfil the ammonium example. The binding statement on p46 refers to fields1–3 and decree selection, not universal Q3.4.",
        "acceptedProposedEdgeCount": 2,
        "unresolved": ["Conditional Q3.4 placement must remain explicit; no universal mandatory route is established.", "Whole original carbonate AND ammonium duties and their quantitative partner bodies remain required in the claimed full union.", "The sketch is not a complete multiple-equilibrium P profile or two worked transfer cases."]
    },
    {
        "goalId": goals[2]["id"],
        "boundedConclusion": "accept_authored_chemical_extension_only_named_source_hold",
        "primaryWitness": {"jurisdiction": "DE-RP", "physicalPages": [39, 40], "printedPages": [39, 40], "courseColumn": "full-width optional deepening, separate from compulsory ester Additum"},
        "independentReasonDe": "Die Originaleinleitung behandelt Carbonylreaktionen mit Nukleophilen; die optionale Vertiefungsbox nennt Aldole, Imine, Oxime und Hydrazone. Grignard ist dort nicht benannt. CH3MgBr addiert formal den Methylrest an Aceton; das magnesiumassoziierte Alkoxid wird erst danach zu 2-Methylpropan-2-ol protoniert. Die Verbrauchsreaktion mit Wasser führt schematisch zu Methan; kein freies isoliertes Carbanion und keine reale Synthese werden behauptet. Diese fachlich tragfähige eigene Erweiterung erfüllt weder die benannte Aldolbildung noch die weiteren drei Bildungsarten. Es ist richtig, hierfür keine Deckungskante zu dieser konkreten Klausel vorzuschlagen.",
        "independentReasonEn": "The introduction covers carbonyl behavior with nucleophiles; the optional box names aldol, imine, oxime and hydrazone formation, not Grignard. Formal methyl addition to acetone, magnesium-associated alkoxide and separate protonation yield 2-methylpropan-2-ol; water consumes reagent to methane schematically. No isolated free carbanion or actual synthesis is asserted. This defensible authored extension fulfils none of those named formation instructions. No source-coverage edge to that specific clause should be created.",
        "acceptedProposedEdgeCount": 0,
        "unresolved": ["An officially required named Grignard route is not established by either primary source.", "RP is absent from the actual goal's BY/HE jurisdiction field; optional RP placement would need an authored reviewed route.", "The whole old partner union does not contain the four specifically named formation routines.", "No complete P/currentNative/V evidence is provided."]
    },
    {
        "goalId": goals[3]["id"],
        "boundedConclusion": "accept_optional_partial_Gibbs_K_role_and_authored_temperature_transfer_only",
        "primaryWitness": {"jurisdiction": "DE-RP", "physicalPages": [45, 46], "printedPages": [45, 46], "courseColumn": "p45 LK compulsory Gibbs; p46 optional full-width Gibbs/K connection"},
        "independentReasonDe": "Die beiden tatsächlichen Spalten müssen getrennt bleiben: Gibbs-Helmholtz ist LK-Pflichtadditum auf45; die Standard-Gibbsenergie/Gleichgewichtskonstante-Verbindung steht in der grauen optionalen Box auf46. Die integrierte van’t-Hoff-Beziehung ist eine fachlich korrekte eigene Erweiterung unter näherungsweise konstantem ΔrH°, gleicher Reaktion, dimensionslosem K° und Kelvin. Ich erhalte K2=0,83029788293; eine endotherme Reaktion hat hier bei höherer Temperatur die größere Konstante. Dies ersetzt weder kinetische RGT-/Arrhenius-Aussagen noch eine vollständige thermodynamische Hauptsatz-/Standardbildungsdatenpflicht.",
        "independentReasonEn": "Gibbs-Helmholtz on p45 is compulsory LK Additum; standard Gibbs energy versus equilibrium constant on p46 is optional full-width deepening. Integrated van’t Hoff is a scientifically valid authored extension with approximately constant reaction enthalpy, identical reaction, dimensionless standard K and Kelvin. Independently K2=0.83029788293, increasing for the endothermic reaction. It does not replace kinetic RGT/Arrhenius statements or the complete thermodynamic/source duty.",
        "acceptedProposedEdgeCount": 1,
        "unresolved": ["The actual goal's BY/HE field supplies no RP route; future RP optional placement remains to be authored/reviewed.", "A mandatory explicitly named integrated van’t-Hoff routine is not established.", "Original partner descriptions do not themselves express the complete ΔG°=-RT ln K° relation or quantitative standard Gibbs calculation.", "No complete current P/native proof is supplied; ΔCp and phase-change limits must remain in actual assessment."]
    },
    {
        "goalId": goals[4]["id"],
        "boundedConclusion": "accept_RP_LK_partial_pH_Nernst_role_and_single_boundary_transfer_only",
        "primaryWitness": {"jurisdiction": "DE-RP", "physicalPages": [20, 41, 43, 44], "printedPages": [20, 41, 43, 44], "courseColumn": "p41 compulsory LK Additum, p44 optional deepening of W module"},
        "independentReasonDe": "Auf41 ist Nernst einschließlich pH-Abhängigkeit bei Standardtemperatur ausdrücklich LK-Pflicht. Die breitere pH-/Temperaturbetrachtung auf44 gehört zur optionalen Vertiefungsbox eines Wahlbausteins. Der vorgegebene Ein-Elektron-/Ein-Proton-Fall hat bei298,15K die korrekte Steigung -0,05915935 V/pH; bei pH6 erhalte ich Eh=0,2450439019 V gegen SHE und pE=4,1420993163 in der angegebenen Konvention. Oberhalb liegt unter den festgehaltenen Aktivitäten die oxidierte, unterhalb die reduzierte Seite. Ein solcher Übergang ist ein sinnvoller partieller pH-Nernst-Beitrag, aber keine vollständige Mehrphasen-Pourbaix-Karte. pE ist kein direkt gemessener freier Elektronenbestand.",
        "independentReasonEn": "p41 explicitly mandates Nernst including pH dependence at standard temperature for LK. The pH/temperature item on p44 is optional deepening of an elective module. Independent one-proton/one-electron results are slope -0.05915935 V/pH, Eh(pH6)=0.2450439019 V versus SHE and pE=4.1420993163 in the stated convention. Oxidized species are favored above the boundary, reduced below under the specified activities. This is valid partial pH-Nernst evidence, not a full multiphase Pourbaix map; pE is not measured free-electron concentration.",
        "acceptedProposedEdgeCount": 1,
        "unresolved": ["Full Pourbaix interpretation/stability derivation needs actual species/phase data, acid-base and solubility boundaries, assumptions and cases.", "The original exact laboratory-method cluster does not cover either Nernst/pH or temperature-potential duty.", "Actual RP-LK placement is absent from this goal's BY/HE field; HE specifically excludes the claimed pH/temperature compulsory route.", "A complete current P/native proof and independent V remain open."]
    }
]

original_observations = [
    (0, "Retain the actual GK/LK CuCl2 example and all ion/electrode/product-ratio operators in fd7977; the new LK comparison does not replace them."),
    (1, "Retain fixed-temperature Nernst and concentration-cell calculations in b7521; do not add HE pH/temperature requirements."),
    (2, "3eada's complete ion-discharge/expected-electrode-reaction/overvoltage duty remains; the new edge is a thermodynamic reference contribution only."),
    (3, "Both carbonate/bicarbonate AND ammonium open-buffer examples remain; a carbonate sketch does not close this union."),
    (4, "Henderson-Hasselbalch quantitative pH work remains in both original partner goals; generic coupled-equilibrium description is not a completed assessment."),
    (5, "Old hydrocarbon halogen radical/electrophilic mechanisms, haloalkane hydroxide/SN1/SN2 and dye synthesis do not express actual named aldol/imine/oxime/hydrazone formations. Keep the whole historical frame; do not certify its coverage."),
    (6, "The SekI laboratory/safety cluster and two children have no Nernst/pH calculation. A partial Pourbaix contribution cannot replace the full LK source instruction."),
    (7, "Entropy estimate, energy conservation and qualitative Gibbs partner are relevant parts but do not prove every quantitative/standard-state thermodynamic operator on45."),
    (8, "Energy examples, MWG, Le Chatelier, bond-energy explanations and dynamics do not literally express standard Gibbs energy versus K. The new bounded derivation contributes; no entire old union is approved."),
    (9, "The same laboratory-method cluster does not express potential dependence on pH AND temperature. The new fixed-temperature one-boundary example must not be used to waive temperature content if this optional clause is claimed.")
]
original_rows = []
for index, note in original_observations:
    entry = frame["rows"][index]
    original_rows.append({
        "rowIndex": index,
        "sourceGoalId": entry["wholeOriginalSourceGoal"]["id"],
        "wholeOriginalSourceGoal": entry["wholeOriginalSourceGoal"],
        "wholeOriginalDecision": entry["wholeOriginalDecision"],
        "originalMappingEdges": entry["allOriginalMappingEdges"],
        "completePartnerIdsRead": [p["wholeGoal"]["id"] for p in entry["wholeAllOriginalPartnersAndDescendants"]],
        "independentWholeOperatorObservationEn": note,
        "historicalWholeCoverageRecertified": False,
        "sourceClauseOrPartnerDropped": False,
    })

verdict = {
    "schemaVersion": 1,
    "role": "independent C scientific first: whole5/tenOriginalDuties/29wholePartners, bounded source and transfer only",
    "reviewer": "/root/biology_resume_candidate",
    "reviewedAt": created,
    "firstBeforeFreshPeerOutcomes": True,
    "disclosure": {
        "freshIndependentBChem5OutcomesRead": False,
        "authorNeutralRoleLimitsAndCandidateRoleTextsRead": True,
        "authorFlagsReasonsNotUsedAsScientificAuthority": True,
        "sourceAndWorkedConclusionsIndependentlyDerived": True,
        "wholePartnerSemanticsRead": 29,
        "allFullObjectBytesIndependentlyCompared": True,
        "initialInputEntryHadNoExecutableWholeCasesOrNormalPProfiles": True,
        "KpRasterAuthorExcludedFromOwnIndependentV": True
    },
    "inputEntry": binding(AUTHOR / "neutral-five-remaining-whole-content-source-and-honest-transfer.author-review.entry.json"),
    "initialInputFreeze": binding(OWN / "five-exact-initial-inputs.independent-c.first.freeze.json"),
    "readActualPrimaryPages": {"HE": [40, 46, 47, 48], "RP": [20, 21, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47]},
    "visuallyReadActualOriginalCourseOptionPages": {"HE": [46, 47, 48], "RP": [20, 40, 41, 44, 45, 46]},
    "wholeFiveGoals": goals,
    "entries": rows,
    "wholeTenOriginalDutyAssessments": original_rows,
    "allTwentyNineWholePartnerObjects": frame["uniqueWholePartners"],
    "summary": {
        "boundedScientificallyAcceptableMechanismOrExtensionConcepts": 5,
        "boundedProposedPartialEdgesAcceptableAsSuch": 5,
        "proposedGrignardCoverageEdges": 0,
        "fullSourceCoverageAcceptedGoals": 0,
        "currentNormalPositiveEvidenceAcceptedGoals": 0,
        "wholeSource395Approved": False,
        "sourceProgram9Approved": False,
        "currentNativeApproved": False,
        "humanApproval": False,
        "humanTrial": False,
        "realLearnerWorkOrExperiment": False,
        "newStrictClosures": 0,
        "activeWrites": False
    },
    "requiredNextEvidence": [
        "Concrete regular source/decision/placement successors that preserve all original whole operators and distinguish optional versus compulsory course roles.",
        "Full normal closed P profiles, worked responses, actual heterogeneous transfer and rubrics for all whole target competences; five short sketches are not that contract.",
        "Actual native pages and their current D/P bindings, independent images and remaining normal A/M/source/program gates before any strict integration.",
        "Named Grignard duty remains unproven; an authored optional extension cannot be promoted to a mandatory named curriculum atom by generic mechanism context."
    ]
}
write("five-whole-source-and-mechanism.independent-c.scientific-FIRST.verdict.json", verdict)
outputs = [binding(p) for p in sorted(OWN.rglob("*")) if p.is_file()]
freeze = {"schemaVersion": 1, "role": "immutable own scientific FIRST before peer outcomes", "reviewer": "/root/biology_resume_candidate", "createdAt": created, "outputs": outputs, "freshPeerOutcomesRead": False, "activeWrites": False}
write("five-whole-source-and-mechanism.independent-c.scientific-FIRST.freeze.json", freeze)
print(json.dumps({"verdict": binding(OWN / "five-whole-source-and-mechanism.independent-c.scientific-FIRST.verdict.json"), "freeze": binding(OWN / "five-whole-source-and-mechanism.independent-c.scientific-FIRST.freeze.json")}, indent=2))
