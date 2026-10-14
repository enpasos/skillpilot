# SPDX-License-Identifier: Apache-2.0
"""Bounded author metadata, arithmetic and unchanged-input bindings."""
import copy
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[6]
OLD = REPO / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-acids-buffers-analytics17-current231-scientific-author-20261013-v1/author"
BASE = REPO / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-NAT9-current419-isolated-integration-technical-20261014-v1"
NOW = datetime.now(timezone.utc).isoformat()


def sha(b):
    return "sha256:" + hashlib.sha256(b).hexdigest()


def objsha(x):
    return sha(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def load(p):
    return json.loads(p.read_text())


def dump(name, value):
    p = ROOT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def binding(p):
    return {"path": p.relative_to(REPO).as_posix(), "sha256": sha(p.read_bytes()), "bytes": p.stat().st_size}


def main():
    selected = load(ROOT / "inputs/whole-ten-current-goals.exact.json")
    ids = selected["goalIds"]
    canonical = load(ROOT / "inputs/canonical551.current419.exact.json")
    goals = {g["id"]: g for g in canonical["goals"]}
    scope = load(ROOT / "INPUTS.scope-provenance-and-role.actual.json")
    for name in ("HOLDS.source-EDTA-and-visual-pK.actual.json", "scientific-primary-context-links.json"):
        source = OLD / name
        target = ROOT / "inputs/history" / (name.removesuffix(".json") + ".exact.json")
        target.write_bytes(source.read_bytes())
        if not any(r["localPath"] == target.relative_to(ROOT).as_posix() for r in scope["exactInputs"]):
            scope["exactInputs"].append({"role": "exact historical author finding/context, not current approval", "sourcePath": source.relative_to(REPO).as_posix(), "localPath": target.relative_to(ROOT).as_posix(), "sha256": sha(target.read_bytes()), "bytes": target.stat().st_size})
    semantic_source = BASE / "candidate/semantic551.current419.preserve-prior538.exact13-delta.inactive.json"
    semantic_target = ROOT / "inputs/semantic551.current419.exact.json"
    semantic_target.write_bytes(semantic_source.read_bytes())
    if not any(r["localPath"] == "inputs/semantic551.current419.exact.json" for r in scope["exactInputs"]):
        scope["exactInputs"].append({"role": "unchanged current419 classification; no new semantic decision", "sourcePath": semantic_source.relative_to(REPO).as_posix(), "localPath": "inputs/semantic551.current419.exact.json", "sha256": sha(semantic_target.read_bytes()), "bytes": semantic_target.stat().st_size})
    dump("INPUTS.scope-provenance-and-role.actual.json", scope)

    # Reuse a bounded source inventory as history and compare its source bytes;
    # neither mapping aliases nor file identity are operator/source approval.
    inventory_path = OLD / "current17.literal-source-witness-inventory.json"
    inventory = load(inventory_path)
    rows = [r for r in inventory["wholeSelectedMappingDecisionsAndPartnerTargets"] if any(m.get("canonicalGoalId") in ids for m in r["mappings"])]
    source_ids = {r["sourceGoalId"] for r in rows}
    witnesses = [r for r in inventory["wholeSourceGoalRowsAndPassages"] if r["sourceGoal"]["id"] in source_ids]
    path_hashes = {r["extractionPath"]: r["extractionSha256"] for r in witnesses}
    path_hashes.update({r["mappingPath"]: r["mappingSha256"] for r in rows})
    live_identity = [{"path": p, "historicalSha256": old_sha, "actualCurrentSha256": sha((REPO / p).read_bytes()), "unchangedBytes": sha((REPO / p).read_bytes()) == old_sha} for p, old_sha in sorted(path_hashes.items())]
    dump("inputs/existing-ten-source-scope-witnesses.history-and-current-identity.json", {"schemaVersion": 1, "role": "author bounded source/operator inventory; not a new source review", "historicalWholeInventoryBinding": binding(inventory_path), "goalIds": ids, "selectedWholeMappingRows": rows, "selectedWholeSourceGoalRows": witnesses, "sourceAndMappingByteIdentity": live_identity, "sourceDocumentMetadataByExtractionPath": {p: inventory["sourceDocumentMetadataByExtractionPath"][p] for p in sorted({w["extractionPath"] for w in witnesses})}, "noFullOfficialDocumentCopied": True, "noNewJurisdictionOrCourseClaim": True, "emptyRawPassagesNotPretendedRead": True, "sourceOperatorHoldEDTA_BB_BE_Remains": True, "newSourceApprovals": 0})
    direct_by = [r for r in witnesses if r["sourceGoal"]["id"] in ("78ca79fd-ce73-5023-8b38-c6c4fed232f1", "63c9647b-facd-5f02-b5cf-b8caabc95768")]
    assert len(direct_by) == 2
    dump("AUTHOR.practical-operators-and-course-boundaries.json", {"schemaVersion": 1, "role": "author design, E0/G0", "exactBavarianExplicitOperators": direct_by, "interpretation": [
        {"goalId": ids[0], "source": "BY C12-EA.3.6, courseLevel LK in existing extraction", "operator": "führen ... EDTA ... durch", "design": "T01-C1/C2 provide supplied solution/equipment lists, preparation, method pH, endpoint, blank, repeat and independent control/spike, empty observation fields and separate data analysis.", "practicalEvidenceRequired": "Actual supervised dilution/pipetting/burette/endpoint observations; none present.", "openSourceHold": "BB/BE mapping of conductometry basics to performing EDTA is not cleared by the BY operator or unchanged source hashes."},
        {"goalId": ids[1], "source": "BY C12-EA.3.7, courseLevel LK in existing extraction", "operator": "bestimmen Absorptionsmaxima; erstellen fotometrisch eine Kalibriergerade", "design": "T02-C1/C2 provide model solutions, volumetric standard recipes, blank, cells, scan/calibration/replicate/reference protocol and empty observation fields.", "practicalEvidenceRequired": "Actual preparation, scan and instrument/calibration operation; synthetic data only evidence paper interpretation.", "implementationBoundary": "Real solutions must be labelled with actual identity and locally assessed handling/disposal before any later lab execution. Synthetic spectra and concentrations are assessment models, not measurements of a named real substance or a lab authorization."},
        {"goalId": ids[9], "operator": "konstruieren und Kapazität berechnen", "design": "Mathematical partner/volume/concentration design and finite-load checks; no real preparation asserted.", "openQuestion": "Independent D/source reviewers must judge if the whole curricular operator demands additional practical preparation. Author does not resolve that question by relabelling paper work."}], "allCurrentApplicabilityAndCourseTagsPreserved": True, "actualExecutions": [], "localLaboratoryAuthorizationGranted": False})

    # Small arithmetic checks test the model calculations, not a learner.
    checks = []
    def check(name, actual, target, tol):
        checks.append({"name": name, "calculated": actual, "displayedTarget": target, "absoluteTolerance": tol, "pass": abs(actual-target) <= tol})
    check("EDTA direct total mmol/L", .01000 * .01975 / .05000 * 1000, 3.950, 1e-9)
    check("EDTA reference recovery percent", (.01000*.01502/.05000*1000)/3.000*100, 100.13, .005)
    check("EDTA diluted original mmol/L", .01000*.00470/.02500*4*1000, 7.520, 1e-9)
    check("EDTA spike recovery percent", .01000*.00502/.00005000*100, 100.4, 1e-9)
    check("Photometry first original mg/L", (.275-.020)/.050*5, 25.5, 1e-9)
    check("Photometry first reference relative error percent", (((.322-.020)/.050)-6)/6*100, .67, .005)
    check("Photometry second provisional original mg/L", (.510-.010)/.400*4, 5, 1e-9)
    check("Photometry second reference relative error percent", (((.450-.010)/.400)-1)*100, 10, 1e-9)
    check("Phosphate initial pH", 7.20+math.log10(2), 7.501, .0005)
    ka=10**-2.35; cstar=.0025/.075
    h=(-(ka+cstar)+math.sqrt((ka+cstar)**2+4*ka*cstar))/2
    check("Glycine corrected first halfpoint pH", -math.log10(h), 2.444, .0005)
    check("Glycine nonnegligible h/cstar", h/cstar, .108, .0005)
    check("Strong acid halfpoint pH", -math.log10(.00125/.0375), 1.477, .0005)
    check("Strong base excess pH", 14+math.log10(.0005/.055), 11.959, .0005)
    ka=10**-4.76; kb=1e-14/ka
    check("Weak acid initial pH", -math.log10(math.sqrt(ka*.1)), 2.880, .0005)
    check("Weak acid equivalence pH", 14+math.log10(math.sqrt(kb*.05)), 8.729, .0005)
    check("HH acetate initial pH", 4.76+math.log10(4), 5.362, .0005)
    check("HH acetate after acid pH", 4.76+math.log10(35/15), 5.128, .0005)
    check("HH ammonium initial pH", 9.25+math.log10(25/50), 8.949, .0005)
    check("HH ammonium after base pH", 9.25+math.log10(35/40), 9.192, .0005)
    check("Neutral pH temperature comparison", 13.20/2, 6.60, 1e-12)
    check("Weak base initial pH", 14+math.log10(math.sqrt(10**-4.75*.1)), 11.13, .005000000001)
    check("Weak base equivalence pH", -math.log10(math.sqrt(10**-9.25*.05)), 5.28, .005)
    # Additional fictional source A is independently consistent with its model.
    r=10**(7-7.2); nb=.05*r/(1+r); na=.05/(1+r)
    check("Fictional phosphate source A after 1 mmol/L HCl", 7.2+math.log10((nb-.001)/(na+.001)), 6.96, .005)
    for prefix, pka, ph, volume, totalc, dose, limit, acid_load in (("phosphate",7.2,7.4,.5,.1,.005,7.3,True),("acetate",4.76,5,.25,.2,.004,5.2,False)):
        r=10**(ph-pka); amount=volume*totalc; na=amount/(1+r); nb=amount-na; beta=math.log(10)*totalc*r/(1+r)**2
        endph=pka+math.log10((nb-dose)/(na+dose)) if acid_load else pka+math.log10((nb+dose)/(na-dose))
        rb=10**(limit-pka)
        finite=nb-amount*rb/(1+rb) if acid_load else na-amount/(1+rb)
        check(prefix+" acid mmol", na*1000, 19.343 if acid_load else 18.263, .0006)
        check(prefix+" beta mol/L/pH", beta, .05462 if acid_load else .1068, .00004)
        check(prefix+" loaded pH", endph, 7.223 if acid_load else 5.159, .0005)
        check(prefix+" finite load mmol", finite*1000, 2.791 if acid_load else 4.945, .0006)
        if acid_load: check("Phosphate redesign minimum mol/L", totalc*dose/finite, .1791, .00005)
        else: check("Acetate whole betaV mol/pH", beta*volume, .02669, .000005)
    assert all(c["pass"] for c in checks), [c for c in checks if not c["pass"]]
    dump("CHECK.numeric-model-calculations.author.json", {"schemaVersion":1,"checkedAtUTC":NOW,"role":"author arithmetic sanity only; not independent science or learner evidence","checks":checks,"errors":[],"experimentalDataGeneratedOrObserved":False,"executions":0})

    # A normal bounded claim reserves only the remaining ten. It is not run.
    claim=load(ROOT/"inputs/original17.claim.exact.config.json")
    claim.update({"batchId":"chemie-acid-analytics-remaining-ten-current419-author-20261014-v1","bookId":"chemie-acid-analytics-remaining-ten-current419-author-20261014-v1","title":"Chemie – Autorenumfang: zehn bestehende Puffer-/Analytikziele, noch ungeprüft","goalIds":ids,"baseGoalBookConfigPath":(ROOT/"config/whole551.current419.author-review-book.config.json").relative_to(REPO).as_posix(),"outputDirectory":(ROOT/"future-native-review-not-executed").relative_to(REPO).as_posix()})
    dump("config/ten-whole-current419.author-scope.claim.config.json",claim)
    original_book=REPO/"curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json"
    original_view=REPO/load(original_book)["compositionViewPath"]
    (ROOT/"inputs/full-review-view.exact.json").write_bytes(original_view.read_bytes())
    book=load(original_book)
    book.update({"bookId":"chemie-acid-analytics-whole551-current419-author-context-v1","title":"Chemie – unveränderter Gesamtgraph als Autorenkontext","landscapePath":(ROOT/"inputs/canonical551.current419.exact.json").relative_to(REPO).as_posix(),"compositionViewPath":(ROOT/"inputs/full-review-view.exact.json").relative_to(REPO).as_posix(),"semanticKindLedgerPath":semantic_target.relative_to(REPO).as_posix(),"goalVisualizationQaPath":(BASE/"candidate/QA435.normal-stock-existing-science.nine-children.inactive.json").relative_to(REPO).as_posix(),"evidenceReviewPaths":[],"outputPath":"tmp/chemie-remaining-ten-author-only-not-executed/book-model.json"})
    dump("config/whole551.current419.author-review-book.config.json",book)
    gate=load(ROOT/"inputs/existing-ten-current-M-V-and-open-D-P-A.exact-joins.json")
    central=load(ROOT/"inputs/current419-final305.central-report.exact.json")
    subject=next(s for s in central["subjects"] if s["subject"]=="chemie")
    assert len(subject["currentGoalIds"])==419
    currentfields=[]
    for row in gate["rows"]:
        g=goals[row["goalId"]]
        currentfields.append({"goalId":g["id"],"wholeBefore":g,"wholeProposed":g,"beforeWholeObjectSha256":objsha(g),"proposedWholeObjectSha256":objsha(g),"allFieldsUnchanged":True,"unchangedRequiresWholeGoals":[goals[x] for x in g.get("requires",[])],"unchangedDirectParents":[x for x in canonical["goals"] if g["id"] in x.get("contains",[])],"currentCentralSelectedGates":row["currentExistingGates"],"reuseWithoutNewVote":row["reuseWithoutNewVote"],"authorCandidateD":None,"authorCandidateP":"author-profiles.ten.raw.json; no approval row","authorCandidateA":None,"newGateVotes":[],"sourceAndScopeUnchanged":{"tags":g.get("tags",[]),"applicability":g.get("applicability",{}),"provenance":g.get("extendedData",{}).get("provenance",{})}})
    dump("AUTHOR.whole-CAS-claim-predicate-state-currentfields.json",{"schemaVersion":1,"createdAtUTC":NOW,"role":"AUTHOR only","predicate":"exact original17 minus exact Seven; whole current551 bodies retained; fresh complete E0/G0 materials and raw P shapes only","state":"inactive-author-candidate-awaiting-other-independent-reviewers","currentBase":{"canonical":binding(ROOT/"inputs/canonical551.current419.exact.json"),"semanticLedger":binding(semantic_target),"currentCurricularAtomic":419,"acceptedStrictCompletionsInFrozenBase":305,"ownNewStrictCompletions":0,"ownNetGain":0,"proposedCanonicalCount":551,"proposedCurricularAtomic":419},"wholeCAS":{"writeOperation":"none; compare-only","canonicalCandidateEqualsBase":True,"wholeFieldsChanged":[],"requiresChanged":[],"containsChanged":[],"sourceMappingsChanged":[],"viewsChanged":[],"registryChanged":False},"claimConfig":"config/ten-whole-current419.author-scope.claim.config.json","claimMaterialized":False,"currentFields":currentfields,"requiredNextSteps":["Two other genuinely independent complete whole-goal D/P/A/source/material judgments with FIRST seals and disclosed history, using exact native pages prepared separately.","Resolve actual source/operator and overlap findings without author self-approval; change whole body only if a justified separate proposal is accepted.","Retain valid exact existing M/V, including HH required card, without manufactured votes or historical restarts.","Only root may later integrate reviewed exact bytes and count strict gain in a new central report."],"humanApproval":False,"humanTrial":False})

    dump("AUTHOR.open-findings-and-review-questions.json",{"schemaVersion":1,"role":"author findings, no A/D/source clearance","findings":[
        {"id":"edta-bb-be-operator","goalIds":[ids[0]],"status":"open-inherited-source-hold","findingDe":"Die historische BB/BE-Zuordnung nennt Grundlagen der Konduktometrie. Das belegt die eigene Durchführung einer EDTA-Komplexometrie nicht. Die explizite BY-LK-Kompetenz darf diese Jurisdiktionslücke nicht verdecken.","proposalDe":"Die zuständige Quellenprüfung muss die konkreten BB/BE-Kanten und den Pflichtumfang prüfen und bei Bedarf getrennt korrigieren. Hier bleiben alle Ziel- und Quellbytes erhalten."},
        {"id":"curve-goals-overlap","goalIds":[ids[4],ids[7]],"status":"open-author-minimality-question","findingDe":"28c90 verlangt allgemeine Datenauswertung, charakteristische Rechnungen sowie Stoff-/Indikatoraussagen. 29742 nennt starke/schwache Säuren/Basen; seine Kurveninterpretation kann weitgehend im ersten Ziel liegen. Die Fallentwürfe operationalisieren verschiedene Schwerpunkte, beweisen aber keine semantische Unabhängigkeit.","proposalDe":"Unabhängige A/D-Prüfung soll einen wirklichen Gegenbeispielfall und Pflichtumfang prüfen. Keine Autorenfreigabe, Zusammenlegung oder Umformulierung erfolgt."},
        {"id":"hh-versus-seven-quantitative-buffer","goalIds":[ids[5],"d7461c15-6992-5342-b899-6c490ee0cbb7"],"status":"open-inherited-atomicity-question","findingDe":"Ähnliche quantitative Pufferbeschreibungen und gemeinsamer HE-Quellenbezug können eine Doppelung sein. Verschiedene Zahlen oder geschlossene/offene Fallkontexte genügen nicht als Nachweis verschiedener Kompetenzen.","proposalDe":"Ganze aktuelle Körper, Voraussetzungen und Quellen mit dem getrennten Seven-Paket vergleichen; bestehende Memory-Entscheidung des HH-Ziels erhalten."},
        {"id":"practical-operator-boundary","goalIds":[ids[0],ids[1]],"status":"unexecuted-design-explicit","findingDe":"Papierauswertung kann die geforderte eigene Titration beziehungsweise eigene fotometrische Aufnahme nicht belegen. Vollständige vorgesehene Ablauf-/Beobachtungskriterien sind gegeben, aber es gibt keine tatsächlichen Handlungen oder Beobachtungen.","proposalDe":"Die P-Entwurfsprüfung darf die praktische Erwartung beurteilen. Spätere Lernendenbewertung benötigt echte Beobachtung und örtliche Laborfreigabe; E0/G0 wird hier nicht erhöht."},
        {"id":"buffer-design-operator","goalIds":[ids[9]],"status":"scope-question-open","findingDe":"Die Fälle prüfen die mathematische Konstruktion und Belastbarkeit eines Puffers. Reale Herstellung wird nicht behauptet.","proposalDe":"Andere D-/Quellenprüfer müssen klären, ob der konkrete ganze Operator weitere praktische Herstellung voraussetzt. Bei Bedarf wäre dies separat zu ergänzen."}],"sourceHoldsCleared":[],"newAtomicApprovals":[],"wholeGoalEditProposalsApplied":[]})

    # Human-readable full cases preserve the actual complete JSON fields.
    cases=load(ROOT/"materials/twenty-complete-DEEN-cases.author.json")["cases"]
    lines=["# Twenty complete author cases / Zwanzig vollständige Autorenfälle","","CC-BY-4.0 · E0/G0 · Unexecuted design · No learner work, points or approvals.",""]
    for c in cases:
        lines += [f"## {c['id']} — {c['titleDe']}","",f"Goal / Ziel: `{c['goalId']}`","","### Deutsch","","**Material.** "+c["materialDe"],"","**Auftrag.** "+c["taskDemandDe"],"","**Erwartete Lösung.** "+c["modelAnswerDe"],"","### English","","**Material.** "+c["materialEn"],"","**Task.** "+c["taskDemandEn"],"","**Expected solution.** "+c["modelAnswerEn"],"","### Four criteria / Vier Kriterien","", "Each criterion: maximum 3; 2 = correct core with limited gap, 1 = a correct part without required connection, 0 = absent/wrong. No score has been awarded.",""]
        for rub in c["rubric"]:lines += [f"- **{rub['expectationId']} (3):** {rub['fullCreditDe']} / {rub['fullCreditEn']} Basis: `{rub['creditBasis']}`."]
        lines += ["", "All four criteria are needed for full coverage. Actual observation fields and awarded points remain empty.", ""]
    (ROOT/"materials/twenty-complete-DEEN-cases.author.md").write_text("\n".join(lines)+"\n")
    dump("AUTHOR.actual-read-inventory-and-role.json",{"schemaVersion":1,"createdAtUTC":NOW,"role":"author only; previously independent on other groups, now disqualified for independent review of own remaining ten","relatedExposure":{"Seven":"Authored its technical raw profiles; excluded from this scope but relevant HH overlap remains disclosed.","SourceV3":"Authored a separate sealed source-duty packet; unchanged and not mutated here.","currentNAT9_D2_D5":"Previously independent context A for different existing goals; not a vote on these ten.","old17":"Read prior author materials/profile/rubric/source-hold inputs as historical design, never independent approval."},"semanticReads":["All ten exact whole current goal bodies and direct prerequisites/context copied in currentfields.","All twenty selected old author cases and their source profile/rubric design; fresh twenty complete successors and all forty expectations.","Prior explicit source/operator holds, bounded relevant source-goal/mapping rows and explicit BY LK practical operators."],"technicalLoads":["Whole canonical551 for exact object comparison, membership, requires/contains DAG only; not a new scientific rereview of all551.","Final305 selected gate config: 74 D indexes,71 P configs,45 A configs joined for ten membership; not new reviews of other goals.","Existing ten M rows, ten V records and current asset bytes; exact reuse audit only, no new visual judgment.","HH required kept card/deck/visibility bindings; no new memory necessity decision.","Production profile schema/fingerprint/semantic helpers; ephemeral metadata only, no accepted records."],"currentPeerOutcomesRead":[],"independentFirstScienceSealClaimed":False,"learnerOrHumanDataRead":False,"newSubagents":0,"limitations":["No official source-wide closure is claimed; historical missing raw passages remain unresolved.","No actual practical execution, learner observation, human approval or human trial occurred.","No new D/P/A/M/V gates or active integration occurred."]})
    print(json.dumps({"numericChecks":len(checks),"numericErrors":0,"wholeGoals":len(ids),"selectedHistoricalSourceRows":len(witnesses),"sourceIdentityChanged":sum(not r["unchangedBytes"] for r in live_identity),"ownStrictGain":0}))


if __name__=="__main__":main()
