#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Complete the new whole material path case; retain the frozen salt case exactly."""
import json, copy, hashlib
from pathlib import Path
from datetime import datetime, timezone
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[6]
PRIOR="curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-six-unreserved-current378-whole-P-source-author-v1"
RAW="62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2"
old=json.load(open(ROOT/PRIOR/"twelve-whole-cases.de-en.author-candidate.json"))
old_raw=[x for x in old["cases"] if x["candidateGoalId"]==RAW]
new=copy.deepcopy(old_raw)
deltas=json.load(open(HERE/"bounded-raw-case-material-and-transfer-deltas.author-candidate.json"))["additions"]
first=new[0]
first["caseLocalKey"]="raw-iron-and-aluminium-mineral-to-use-v2"
first["title"]={"de":"Zwei Metalle vom Ausgangsmineral bis zum Bauteil", "en":"Two metals from starting mineral to component"}
for index,delta in enumerate(deltas):
 for language,suffix in [("de","De"),("en","En")]:
  first["material"][language].append(delta["material"+suffix])
  first["learnerTask"][language]+=" "+delta["task"+suffix]
  first["expectedResponseOrSolution"][language]+=" "+delta["expected"+suffix]
 first["assessmentCriteria"].append(dict(criterionLocalKey=f"raw-metal-v2-complete-route-{index+1}",required=True,
      text={"de":delta["expectedDe"],"en":delta["expectedEn"]},binding="same whole material-path goal; mineral/metal and genuinely different production methods"))
first["materialAndSourceLimitations"]={
 "de":"Zwei vorgelegte Industrie-Modellwege werden theoretisch beschrieben. Metall-/Mineral-Kontext und verschiedene Verfahren sind explizit. Der HB-Operator ‚aus selbst durchgeführten Versuchen‘ bleibt unerfüllt: weder Stoffweg-Modell noch synthetische Daten sind persönliche Versuchsausführung. BB/BE-Metall-/Legierungs-Partnerfehler bleibt eigenständiger Mapping-Hold.",
 "en":"Two supplied industrial-model pathways are described theoretically, with explicit mineral/metal context and different methods. The HB 'from own-performed experiments' operator remains unmet: neither a pathway model nor synthetic data are personally performed experiments. The BB/BE metal/alloy partner error remains a separate mapping hold."}
first["authorReadiness"]="new_whole_case_ready_for_independent_review_three_current_source_mapping_operator_holds_remain"
# The closed native P contract caps each whole task brief at2000 characters.
# Use a complete concise material body, not truncation or a schema exception.
first["material"]={
 "de":[
  "Vereinfachtes fiktives Industrie-Dossier, kein eigener Versuch: Eisen-Erz enthält Hämatit (Mineral Fe₂O₃) und Begleitstoffe. Hämatit enthält chemisch gebundenes Eisen, kein gediegenes Metall. Manche wenig reaktiven Metalle wie Gold können elementar vorkommen.",
  "Eisenroute-Karten: Erz fördern/aufbereiten; Eisenoxid mit CO reduzieren (Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂); kohlenstoffreiches Roheisen erhalten; Zusammensetzung/Kohlenstoffgehalt für Stahl passend einstellen; formen; tragenden zähen/formbaren Stahlträger nutzen. CO wird in dieser ausgewählten Route mithilfe von Kohlenstoff erzeugt.",
  "Aluminiumroute-Karten: Bauxit fördern; zu Aluminiumoxid aufbereiten; in einem Schmelz-Elektrolytsystem elektrisch zu Aluminium reduzieren; passende Zusammensetzung/Form einstellen; leichtes Aluminiumbauteil nutzen. Bloßes Schmelzen oder Sieben des Oxids ist keine Metallgewinnung. Keine Betriebsparameter oder Unterrichtsdurchführung."],
 "en":[
  "Simplified fictional industrial dossier, not an own experiment: iron ore contains hematite (mineral Fe₂O₃) and accompanying material. Hematite contains chemically bound iron, not native metal. Some less reactive metals such as gold can occur elementally.",
  "Iron-route cards: extract/prepare ore; reduce iron oxide with CO (Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂); obtain high-carbon pig iron; adjust composition/carbon content for steel; shape; use a tough/formable structural steel beam. Carbon is used to generate CO in this selected route.",
  "Aluminium-route cards: extract bauxite; refine to alumina; reduce electrically to aluminium in a molten electrolyte system; adjust composition/form; use a lightweight aluminium component. Merely melting or sieving the oxide does not extract metal. No plant parameters or classroom execution."]}
first["learnerTask"]={
 "de":"Stelle beide ganzen Rohstoff-bis-Verwendungs-Wege dar. Erkläre Mineral/gebundenes Eisen versus gewonnenes Metall und den Unterschied von CO-Reduktion und elektrolytischer Gewinnung. Begründe Aufbereitung, geeignete Zusammensetzung und Formgebung mit der jeweiligen Nutzung; bloß die Karten abzuschreiben genügt nicht.",
 "en":"Describe both whole raw-material-to-use pathways. Explain mineral/bound iron versus obtained metal and the difference between CO reduction and electrolytic extraction. Justify preparation, appropriate composition and shaping in relation to each use; merely copying the cards is insufficient."}
assert new[1]==old_raw[1]
payload={k:v for k,v in old.items() if k!="cases"}
payload.update(createdAtUTC=datetime.now(timezone.utc).isoformat(),goalCount=1,caseCount=2,
   author="chemistry_open_packets 62bd targeted source-role author v2, independent judgments pending",
   activeWrites=False,sourceWholeCoverageClaimed=False,cases=new,
   substantiveChangedCaseCount=1,exactRetainedCaseCount=1,
   originalFrozenCasePath=PRIOR+"/twelve-whole-cases.de-en.author-candidate.json")
(HERE/"two-whole-raw-cases.de-en.author-candidate.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n")
matrixPath=HERE/"twelve-whole-source-duty-author-assessment-and-smallest-proposals.json"
matrix=json.load(open(matrixPath))
for entry in matrix["entries"]:
 if "rohstoffe-011" in entry["sourceGoalId"]:
  entry.setdefault("frozenV1DeficitStatus",entry["authorStatus"])
  entry["authorStatus"]="bounded_whole_source_coverage_author_candidate_with_new_two_metal_case"
  entry["actualAuthorRemediation"]="New whole v2 case supplies both complete Fe/CO and Al/electrolytic routes from mineral/raw feed to final use, asks explicit method comparison and provides complete model response. Independent source/case QA pending. No active mapping or goal changed."
  entry["activeMappingAndAffectedDPChangeRequired"]="new_P_case_body_binding_and_independent_review_required; no goal/mapping mutation needed for this row"
matrix.setdefault("sourceRoleCandidateCountBeforeWholeCaseRemediation",matrix["proposedWholeSourceCoverageCandidateCount"])
matrix.setdefault("sourceHoldCountBeforeWholeCaseRemediation",matrix["retainedWholeDutyHoldCount"])
matrix["proposedWholeSourceCoverageCandidateCount"]=sum(e["authorStatus"].startswith("bounded_whole") for e in matrix["entries"])
matrix["retainedWholeDutyHoldCount"]=sum(e["authorStatus"].startswith("HOLD") for e in matrix["entries"])
matrixPath.write_text(json.dumps(matrix,ensure_ascii=False,indent=2)+"\n")
print(json.dumps(dict(wholeCases=2,substantiveChangedCaseCount=1,exactRetainedCaseCount=1,sourceRoleCandidates=matrix['proposedWholeSourceCoverageCandidateCount'],sourceWholeHolds=matrix['retainedWholeDutyHoldCount'],approved=0)))
