#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Actual targeted primary reads and smallest proposals, never whole-source approval."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, subprocess

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[6]
PRIOR="curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-six-unreserved-current378-whole-P-source-author-v1"
RAW="62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2"
METAL="fcaf8c9b-bd81-552e-9d91-43649895471e"
MOLECULE="5a30273a-98d5-5163-bb16-c250b7ed4e7f"
REDOX="04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162"
OXIDE="bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a"
STRUCTURE="02dc29ae-4046-556a-b048-d64a0feb8f16"
LAB_PARENT="266a2b2a-9ee2-52f6-ae09-59343da9a60b"
INPUTS={}

def stable(v):return json.dumps(v,sort_keys=True,ensure_ascii=False,separators=(",",":"))
def sha(b):return hashlib.sha256(b).hexdigest()
def bind(path):
 b=(ROOT/path).read_bytes();INPUTS[path]=dict(path=path,sha256=sha(b),bytes=len(b));return INPUTS[path]
def load(path):bind(path);return json.loads((ROOT/path).read_bytes())
def write(name,v):(HERE/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+"\n")

freeze=load(PRIOR+"/author.final.freeze.json")
for item in freeze["files"]:
 assert sha((ROOT/item["path"]).read_bytes())==item["sha256"],item["path"]
entry=next(x for x in load(PRIOR+"/six-goal-original-source-duties-and-author-readiness.json")["entries"] if x["goalId"]==RAW)
landscapePath="curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json"
canon=load(landscapePath);by={x["id"]:x for x in canon["goals"]}
centralPath="curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-twelve-reviewed-active-integration-root-v1/active-after-twelve-central.actual.json"
central=next(x for x in load(centralPath)["subjects"] if x["subject"]=="chemie");strict=set(central["strictCompleteGoalIds"])
reg=load("curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json");chem=next(x for x in reg["subjects"] if x["subject"]=="chemie")

# Read the full relevant originals in place. Primary files stay unchanged.
pages={
 "BBlower":("curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Chemie_2015_11_10.pdf",37,37),
 "BElower":("curricula/DE/Gymnasium/input/BE/lower-secondary/Teil_C_Chemie_2015_11_10.pdf",37,37),
 "BBupper":("curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf",50,50),
 "BEupper":("curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf",50,50),
 "BW":("curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf",16,14),
 "HB":("curricula/DE/Gymnasium/input/HB/Naturwissenschaften_Gymnasium_5_10_2006.pdf",41,41),
 "HB2022":("curricula/DE/Gymnasium/input/HB/Naturwissenschaften_Gymnasium_5_9_Einschraenkungen_2022.pdf",3,None),
}
readings={}
for key,(path,physical,printed) in pages.items():
 text=subprocess.check_output(["pdftotext","-f",str(physical),"-l",str(physical),"-layout",str(ROOT/path),"-"],text=True)
 readings[key]=dict(primaryFileBinding=bind(path),physicalPage=physical,printedPage=printed,actualFullPageTextSha256=sha(text.encode()),
                    wholePageRead=True,thirdPartyPageCopyCommitted=False)
 if key.endswith("lower"):assert "Gewinnung von Metallen aus Oxiden" in text and "Metalle und deren Legierungen" in text
 if key.endswith("upper"):assert "Rohstoffgewinnung durch Redoxreak" in text and "Grundkurs" in text
 if key=="BW":assert "industriellen Gewinnung" in text and "bis zur Verwendung" in text
 if key=="HB":assert "Mineralien" in text and "unterschiedliche Verfahren" in text and "selbst durchgeführten Versuchen" in text and "gediegen" in text
 if key=="HB2022":assert "Jahrgangsstufe 9" in text and "Chemie" in text
write("actual-twelve-primary-locators-and-reading-boundaries.json",dict(
 schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),role="actual whole-page author reading, not independent source approval",
 readings=readings,licenseBoundary="Originals remain in existing repository locations; no new full third-party pages copied.",
 normativeInterpretations={
  "BB_BE_3.6":"The actual page is a topic table: contents, experiments, concepts and illustrative contexts. Several extraction rows add operative verbs that are not literal original bullets. Do not promote examples/differentiation to universal mandatory separate competences.",
  "BB_BE_3.2.8":"The extraction item is actual shared GK content; LK adds more. Preserve whole row and its existing REDOX partner rather than assigning all redox detail to the material-path goal.",
  "BW_3.2.1.1(5)":"Whole selected material extraction-to-use operator, not a demand for every illustrative material. Actual physical16/printed14 corrects only the candidate locator; old extraction S13 stays untouched.",
  "HB_2006_2022":"The 2006 page41 metal/raw-material requirements remain read with the2022 restriction to years5-9. Own-performed experiment inference and limited native occurrence are part of a whole process expectation. A theoretical diagram is not own experiment performance."}))

partnerIds=sorted({p for duty in entry["currentDirectWholeDuties"] for p in duty["originalCompletePartnerGoalIds"]})
retained=[]
for cp in chem["positiveEvidenceConfigPaths"]:
 cfg=load(cp);rp=cfg["reviewPath"]
 for n,line in enumerate((ROOT/rp).read_text().splitlines(),1):
  record=json.loads(line)
  if record.get("goalId") in partnerIds and record["goalId"] in strict:
   bind(rp);retained.append(dict(goalId=record["goalId"],configPath=cp,reviewPath=rp,line=n,
                    wholeExistingRecordJsonSha256=sha(stable(record).encode()),existingWholeRecord=record))
write("retained-current-strict-partner-goals-and-P-lineage.json",dict(
 schemaVersion=1,role="existing valid strict evidence reuse; not new partner science review",
 currentCentralBinding=INPUTS[centralPath],partnerWholeGoals=[dict(goal=by[p],currentStrict=p in strict) for p in partnerIds],
 retainedPositiveRecords=retained,rawCurrentWholeGoal=by[RAW],activeGoalBytesChanged=False,
 mandatoryRestriction="A partner's valid M7 says its own goal is reviewed; it does not prove that an unrelated source operator belongs to that partner."))

matrix=[]
for duty in entry["currentDirectWholeDuties"]:
 mapping=load(duty["mappingPath"]);extract=load(duty["sourceExtractionPath"])
 source=next(x for x in extract["sourceGoals"] if x["id"]==duty["sourceGoalId"])
 original=mapping["decisions"][duty["decisionIndex"]]
 assert sha(stable(original).encode())==duty["decisionJsonSha256"]
 assert sha(stable(source).encode())==duty["wholeSourceGoalJsonSha256"]
 sid=source["id"]
 short=dict(sourceGoalId=sid,mappingPath=duty["mappingPath"],decisionIndex=duty["decisionIndex"],
            wholeOriginalDecisionSha256=duty["decisionJsonSha256"],sourceExtractionPath=duty["sourceExtractionPath"],
            wholeOriginalSourceGoalSha256=duty["wholeSourceGoalJsonSha256"],sourceSpan=source.get("sourceSpan"),
            originalCompletePartnerGoalIds=duty["originalCompletePartnerGoalIds"],allOriginalPartnerDutiesPreserved=True,
            currentStrictPartnerGoalIds=[p for p in duty["originalCompletePartnerGoalIds"] if p in strict],
            originalNormativeSourceTextMustBeReadInPlace=True,wholeSourceApproval="not_approved_independent_review_pending")
 if "3-6-027" in sid:
  short.update(authorStatus="HOLD_molecular_partner_does_not_cover_metal_alloy_scope",
    wholeOperatorInterpretation="Topic content: properties and uses of metals and alloys; not merely molecular boiling points/solubility.",
    existingRoleAssessment={METAL:"Actual metal-property/model facet; strict own evidence retained.",MOLECULE:"Explicitly molecular substance/intermolecular-interaction goal; metal/alloy claim is scientifically out of scope, despite valid own M7.",RAW:"Industrial pathway/selected use facet; old iron-to-steel case names processing and toughness but is not a complete comparative metal/alloy properties routine."},
    smallestCandidateCorrection="Retain the complete original row and historical complete partner tuple. Propose removing the operative source-coverage claim for MOLECULE and explicitly assign metal/model properties to METAL, selected production/use to RAW. Add a bounded material-use comparison (metal vs alloy) to the RAW case; do not reword/review the valid molecular goal or erase alloy duty.",
    activeStructureChangeRequired=False,activeMappingAndAffectedDPChangeRequired=True,
    concreteUnclosedFacet="Metals/alloys: meaningful selected property-use comparison and the incorrect molecular source role.")
 elif "3-6-028" in sid:
  short.update(authorStatus="bounded_whole_source_coverage_author_candidate",
    wholeOperatorInterpretation="Describe obtaining metal from raw material as chemical conversion, within the original topic table.",
    existingRoleAssessment={RAW:"Current case full ore-to-metal-to-use chain; material extraction is chemical oxide reduction, not sieving.",OXIDE:"Retained strict interpretation of simple metal/nonmetal oxidation and reduction.",REDOX:"Retained strict electron-transfer/donor-acceptor concepts, not a new review."},
    smallestCandidateCorrection="No canonical/mapping edit required for this row. Independently check whole source union against new raw-path case and exact retained OXIDE/REDOX records.",
    activeStructureChangeRequired=False,activeMappingAndAffectedDPChangeRequired=False)
 elif "3-6-032" in sid:
  short.update(authorStatus="bounded_whole_source_coverage_author_candidate",
    wholeOperatorInterpretation="Reduction/redox at metal extraction and oxidation; original row remains a full metal/topic duty, not merely the named iron equation.",
    existingRoleAssessment={RAW:"Selected industrial iron-oxide reduction context in its material pathway.",OXIDE:"Strict simple oxidation/reduction interpretation for metal and nonmetal reactions.",REDOX:"Strict redox donor/acceptor roles and electron transfer. Original source concept has differentiated levels; no automatic extra full oxidation-number syllabus."},
    smallestCandidateCorrection="Retain all original partners. Check the supplied iron equation/context against their unchanged reviewed routines. No hash-only science claim and no source-row deletion.",
    activeStructureChangeRequired=False,activeMappingAndAffectedDPChangeRequired=False)
 elif "3-2-8-inhalte-003" in sid:
  short.update(authorStatus="bounded_whole_source_coverage_author_candidate",
    wholeOperatorInterpretation="Shared GK content: metal raw-material extraction by redox, read in the full GK/LK table.",
    existingRoleAssessment={RAW:"Complete selected ore/production/use context.",REDOX:"Retained strict electron-transfer principles for redox interpretation; no claim that raw path alone certifies all section3.2.8 content."},
    smallestCandidateCorrection="No structural rewrite. Preserve REDOX partner and full GK/LK original course column; independently check whole assigned item with the new material pathway and retained evidence.",
    activeStructureChangeRequired=False,activeMappingAndAffectedDPChangeRequired=False)
 elif "bw-chem-seki-3-2-1-1-b05" in sid:
  short.update(authorStatus="bounded_whole_source_coverage_author_candidate",
    wholeOperatorInterpretation="Describe one selected substance from industrial raw-material extraction to use; examples do not require four separate substances.",
    existingRoleAssessment={RAW:"Both original whole iron/steel and salt-route cases test exactly this same whole pathway competence."},
    smallestCandidateCorrection="Use actual physical16/printed14 candidate locator rather than extraction S13. No goal-text/graph/source-operator rewrite. Preserve historic source row and review lineage.",
    activeStructureChangeRequired=False,activeMappingAndAffectedDPChangeRequired=False)
 elif "rohstoffe-010" in sid:
  short.update(authorStatus="bounded_whole_source_coverage_author_candidate_with_explicit_mineral_material",
    wholeOperatorInterpretation="Know minerals as metal-extraction starting substances, not confuse metallic element and oxide ore.",
    existingRoleAssessment={RAW:"Selected oxide-ore-to-metal chain; targeted supplemental material explicitly names hematite Fe2O3 as a mineral.",METAL:"Retained strict metallic material/model properties; no fabricated mineral classification from its M7 status.",STRUCTURE:"Retained strict substance/particle ordering; classifies starting oxide and resulting metal."},
    smallestCandidateCorrection="Add the bounded hematite/mineral wording to new RAW material only; keep original tuple and valid other goal texts/evidence. Independent source review required.",
    activeStructureChangeRequired=False,activeMappingAndAffectedDPChangeRequired=False)
 elif "rohstoffe-011" in sid:
  short.update(authorStatus="HOLD_one_metal_route_plus_salt_is_not_two_metal_extraction_methods",
    wholeOperatorInterpretation="Know different methods of obtaining metals, not merely one metal route and salt separation.",
    existingRoleAssessment={RAW:"Old cases include CO/iron and physical salt separation; salt is not a second metal-extraction method.",OXIDE:"Strict interpretation of simple oxidation/reduction does not by itself name two extraction methods.",REDOX:"Strict redox principles do not by themselves provide complete compared industrial pathways."},
    smallestCandidateCorrection="Supplement whole first RAW case with a concise bauxite/alumina/electrolytic-reduction-to-aluminium/use route, contrasting it with CO/iron reduction. Both complete material pathways and changed method must be explained; no need to mutate canonical goal or images.",
    activeStructureChangeRequired=False,activeMappingAndAffectedDPChangeRequired=True,
    concreteUnclosedFacet="A genuinely different metal-extraction process and its full raw-material-to-use context.")
 elif "rohstoffe-020" in sid:
  short.update(authorStatus="HOLD_real_self_experiment_inference_missing_in_existing_partner_union",
    wholeOperatorInterpretation="From own-performed experiments infer chemical reactions and recognise limited native metal occurrence; the experiment operator belongs to the whole statement.",
    existingRoleAssessment={LAB_PARENT:"Current cluster contains generic basic lab methods and safety; neither explicitly covers chemical inference from a self-performed metal-oxide experiment. LAB child has existing split_review/block.",OXIDE:"Retained strict chemical interpretation contributes but does not turn supplied data into self-performed observations.",REDOX:"Retained strict donor/acceptor framework contributes but does not evidence actual experiment execution.",RAW:"Can contextualise oxide ore/native metal occurrence, but its unchanged operator is describe an industrial path, not personally perform a reduction experiment."},
    smallestCandidateCorrection="Keep whole HB process duty and all original partners as history. Resolve in the already-started B008/inquiry source lane: a bounded reviewed atomic self-experiment-to-chemical-inference responsibility with appropriate supervised positive cases, or a source-facet mapping to a genuinely matching reviewed existing atom if established. Do not falsely assign self-experiment to RAW, delete the clause, or broaden a valid metal/redox goal by rebinding hashes.",
    activeStructureChangeRequired="likely_bounded_inquiry_atom_or_existing_genuine_match_needed",
    activeMappingAndAffectedDPChangeRequired=True,
    concreteUnclosedFacet="Own experiment -> justified reaction inference; some metals native vs many as compound minerals. Theory/model data are not personally performed observations.")
 else:raise AssertionError(sid)
 matrix.append(short)
assert len(matrix)==12
write("twelve-whole-source-duty-author-assessment-and-smallest-proposals.json",dict(
 schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),role="targeted new scientific source-role author assessment, independent decisions pending",
 selectedCurrentGoalId=RAW,currentWholeGoalUnchanged=True,originalDutyCount=12,
 proposedWholeSourceCoverageCandidateCount=sum(x["authorStatus"].startswith("bounded_whole") for x in matrix),
 retainedWholeDutyHoldCount=sum(x["authorStatus"].startswith("HOLD") for x in matrix),
 originalSourceRowsDeleted=0,originalSourcePartnerDutiesErased=0,activeWrites=False,
 wholeGoalWithAllCurrentSourceBindingsReady=False,strictGain=0,newScientificGateApprovals=0,entries=matrix))

# Bounded own material additions. These do not silently replace the frozen v1 cases.
write("bounded-raw-case-material-and-transfer-deltas.author-candidate.json",dict(
 schemaVersion=1,recordStatus="ai_candidate",validationStatus="needs_human_review",humanApproval=False,humanTrial=False,activeWrites=False,
 sourceClearance="author proposals, not independent approval",licenseExpression="CC-BY-4.0",
 baseFrozenCasePath=PRIOR+"/twelve-whole-cases.de-en.author-candidate.json",goalId=RAW,
 additions=[
  dict(caseLocalKey="raw-iron-ore-to-steel-beam",purpose="HB mineral wording and native/compound distinction, no new general mineral taxonomy goal",
       materialDe="Ergänzung für den neuen Kandidaten: Hämatit ist ein Mineral mit der idealisierten Formel Fe₂O₃. Das beschriebene Erz kann dieses Mineral zusammen mit Begleitstoffen enthalten; Hämatit ist nicht gediegenes metallisches Eisen. Manche wenig reaktiven Metalle, etwa Gold, können auch elementar vorkommen. Aus dem Beispiel folgt keine vollständige Lagerstättenklassifikation.",
       materialEn="Addition for the new candidate: hematite is a mineral with idealised formula Fe₂O₃. The described ore can contain this mineral and accompanying substances; hematite is not native metallic iron. Some less reactive metals, such as gold, can also occur elementally. This example does not provide a complete deposit classification.",
       taskDe="Ordne im Stoffweg das Ausgangsmineral, das darin chemisch gebundene Eisen und das gewonnene metallische Eisen zu. Erkläre, warum Erz nicht einfach mit einem reinen Metallstück gleichgesetzt werden darf.",
       taskEn="Identify starting mineral, chemically bound iron and obtained metallic iron in the pathway. Explain why ore must not simply be equated with a pure piece of metal.",
       expectedDe="Fe₂O₃ ist das Ausgangsmineral mit chemisch gebundenem Eisen; erst Reduktion liefert in diesem Weg metallisches Eisen. Erz kann Begleitstoffe enthalten. Elementare Vorkommen einzelner wenig reaktiver Metalle machen nicht jedes Erz zu einem Metallstück.",
       expectedEn="Fe₂O₃ is the starting mineral containing chemically bound iron; reduction produces metallic iron in this route. Ore may contain accompanying substances. Elemental occurrences of some less reactive metals do not make every ore a piece of metal."),
  dict(caseLocalKey="raw-iron-ore-to-steel-beam",purpose="HB genuinely different second metal extraction pathway, not salt separation",
       materialDe="Eigenes ergänzendes Industriemodell: Bauxit wird zu Aluminiumoxid (Al₂O₃) aufbereitet. In einer konventionellen Route wird dieses im Schmelz-Elektrolytsystem elektrisch zu Aluminium reduziert; es wird nicht nur geschmolzen oder ausgesiebt. Nach geeigneter Zusammensetzungs-/Formgebung kann ein leichtes Aluminiumbauteil entstehen. Das ist ein anderes Gewinnungsverfahren als die vorgegebene CO-Reduktion von Eisenoxid. Keine Betriebsparameter oder Unterrichtsdurchführung werden verlangt.",
       materialEn="Own additional industrial model: bauxite is refined to alumina (Al₂O₃). In a conventional route, alumina is reduced electrically to aluminium in a molten electrolyte system; it is not merely melted or sieved. Appropriate composition/formation can then produce a lightweight aluminium component. This extraction method differs from the supplied CO reduction of iron oxide. No plant parameters or classroom performance are requested.",
       taskDe="Stelle beide vollständigen Wege vom Erz bis zum jeweiligen Bauteil dar und erkläre, an welchem Schritt und warum die Metallgewinnung verschieden ist. Die Salzroute zählt nicht als zweite Metallgewinnung.",
       taskEn="Describe both full pathways from ore to the relevant component and explain where and why metal extraction differs. The salt route is not a second metal-extraction method.",
       expectedDe="Eisenroute: eisenoxidhaltiges Erz -> Aufbereitung -> CO-Reduktion -> Roheisen -> passende Stahlzusammensetzung/Form -> Bauteil. Aluminiumroute: Bauxit -> Aluminiumoxid -> elektrolytische Reduktion -> Aluminium -> passende Verarbeitung -> leichtes Bauteil. Beide gewinnen Metall chemisch aus gebundener Form; CO-Reduktion und elektrisch erzwungene Elektrolyse sind unterschiedliche Prozesse. Das Schmelzen des Ausgangsoxids allein erzeugt kein Metall.",
       expectedEn="Iron route: iron-oxide ore -> preparation -> CO reduction -> pig iron -> appropriate steel composition/form -> component. Aluminium route: bauxite -> alumina -> electrolytic reduction -> aluminium -> appropriate processing -> lightweight component. Both chemically obtain metal from bound form; CO reduction and electrically driven electrolysis are different processes. Melting the starting oxide alone does not produce metal.",
       scientificPrimaryReferences=["https://alustory.international-aluminium.org/mining-refining/","https://alustory.international-aluminium.org/primary-production/reduction/"])
 ],
 remainingExplicitHolds=["BB/BE wrong molecular metallic/alloy partner role and full property-use scope","HB own-experiment inference does not fit current RAW/lab-cluster union"] ))
write("declared-current-input-bindings.actual.json",dict(schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),inputBindings=list(INPUTS.values()),activeWrites=False,selectedGoalId=RAW,strictGain=0,scienceApprovalCount=0))
print(json.dumps(dict(originalWholeDuties=12,sourceRoleCandidates=sum(x["authorStatus"].startswith("bounded_whole") for x in matrix),holds=sum(x["authorStatus"].startswith("HOLD") for x in matrix),retainedStrictPartnerPositiveRecords=len(retained),inputs=len(INPUTS),activeWrites=False)))
