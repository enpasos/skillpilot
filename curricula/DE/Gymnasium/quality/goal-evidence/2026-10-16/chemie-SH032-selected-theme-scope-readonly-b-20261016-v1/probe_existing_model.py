# SPDX-License-Identifier: Apache-2.0
"""Read existing model code; write bounded evidence only beside this script."""
import copy
import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

sys.dont_write_bytecode = True
OUT = Path(__file__).resolve().parent
REPO = next(parent for parent in OUT.parents if (parent / "AGENTS.md").exists())
H = REPO / "tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1"
REL = "curricula/DE/Gymnasium/"
SCHEMA = REPO / "contracts/curriculum-package/v1/composition-view.schema.json"
H_CHEMISTRY = H / (REL + "canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json")
EXPECTED_H = "d17b3219212d5157a3731cc54b8424cc07816835781984bcbeb3a98f4064268f"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(name, value):
    path = OUT / name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    json.loads(path.read_text())


assert sha(H_CHEMISTRY) == EXPECTED_H
chemistry = json.loads(H_CHEMISTRY.read_text())
view_paths = [H / (REL + f"composition-views/chemie/de-sh-{profile}.view.json") for profile in ("gk", "lk")]
views = [json.loads(path.read_text()) for path in view_paths]
write_json("H.scoped-facts.json", {
    "context": "Isolated integration H, not normal active R. Factual extraction only; no peer votes.",
    "chemistrySha256": sha(H_CHEMISTRY),
    "goalObjectCount": len(chemistry["goals"]),
    "source032CandidatePresent": any(goal["id"] == "3eb2a06c-d283-57aa-9eb4-088940c4801a" for goal in chemistry["goals"]),
    "programUnits": chemistry.get("programUnits"),
    "goalPlacements": chemistry.get("goalPlacements"),
    "personalizationFlow": chemistry.get("personalizationFlow"),
    "views": [{"sha256": sha(path), **{key: view.get(key) for key in ("viewId", "landscapeId", "scope")}} for path, view in zip(view_paths, views)],
})

validator = Draft202012Validator(json.loads(SCHEMA.read_text()))
schema_results = []
for key in (None, "selectedTheme", "canonicalView", "viewId", "programUnitId"):
    candidate = copy.deepcopy(views[0])
    if key:
        candidate["scope"][key] = "chemie-und-medikamente"
    findings = [{"path": list(error.absolute_path), "validator": error.validator, "message": error.message} for error in validator.iter_errors(candidate)]
    schema_results.append({"addedScopeKey": key, "valid": not findings, "errors": findings})

node_probe = r"""
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('./app/node_modules/typescript');
const source=fs.readFileSync('app/src/utils/learnerCompositionScopeMatching.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const api={}; vm.runInNewContext(js,{exports:api});
const scope={schoolForm:'Gymnasium',jurisdiction:'DE-SH',stage:'CrossStage',courseProfile:'GK'};
const probes=[null,'selectedTheme','canonicalView','viewId','programUnitId'].map(key=>{
 const requested=key?{...scope,[key]:'chemie-und-medikamente'}:scope;
 return {addedScopeKey:key,constrained:api.isConstrainedLearnerCompositionScope(requested),score:api.scoreLearnerCompositionScope(scope,requested)};
});
process.stdout.write(JSON.stringify(probes));
"""
node = subprocess.run(["node", "-e", node_probe], cwd=REPO, check=True, capture_output=True, text=True)
matcher_results = json.loads(node.stdout)

module_path = REPO / "scripts/validate_curriculum_runtime_catalog_contract.py"
spec = importlib.util.spec_from_file_location("scope_catalog_validator", module_path)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)
catalog_validator = Draft202012Validator(json.loads((REPO / "contracts/curriculum-package/v1/runtime-catalog.schema.json").read_text()))
fixture = json.loads((REPO / "contracts/curriculum-package/v1/fixtures/runtime-catalog/valid/minimal-mathematik.catalog.json").read_text())
assert not module.validate_catalog(fixture, catalog_validator)
duplicate = copy.deepcopy(fixture)
second_view = copy.deepcopy(duplicate["views"][0])
second_view["viewId"] += "-different-document-same-scope"
second_view["artifactPath"] = "data/views/different-document-same-scope.view.json"
duplicate["views"].append(second_view)
second_offering = copy.deepcopy(duplicate["offeredScopes"][0])
second_offering["offeringId"] += "-different-identity-same-scope"
second_offering["viewResolution"] = {"mode": "single", "viewIds": [second_view["viewId"]]}
duplicate["offeredScopes"].append(second_offering)
duplicate_diagnostics = [{"code": diag.code, "location": diag.location, "message": diag.message} for diag in module.validate_catalog(duplicate, catalog_validator)]
assert any(row["code"] == "DUPLICATE_VIEW_SCOPE" for row in duplicate_diagnostics)
assert any(row["code"] == "DUPLICATE_OFFERED_SCOPE" for row in duplicate_diagnostics)
assert schema_results[0]["valid"] and all(not row["valid"] for row in schema_results[1:])
assert matcher_results[0]["constrained"] and all(not row["constrained"] for row in matcher_results[1:])
write_json("PROBES.existing-schema-matcher-catalog.json", {
    "scope": "In-memory bounded model probes, not an implementation or curriculum review.",
    "compositionViewSchema": schema_results,
    "originalFrontendLearnerScopeMatcher": matcher_results,
    "duplicateCatalogScopeDiagnostics": duplicate_diagnostics,
    "fixtureUse": "Existing minimal catalog is used solely as structural validator input; no Mathematics goal or QA evidence is edited/reviewed.",
})

excerpts = {
    "contracts/curriculum-package/v1/composition-view.schema.json": [(20, 39), (75, 127)],
    "backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java": [(41, 46), (503, 517), (563, 612), (614, 642)],
    "backend/src/main/java/com/skillpilot/backend/service/LearnerService.java": [(5158, 5194), (5734, 5781), (9737, 9762), (10015, 10046)],
    "backend/src/main/java/com/skillpilot/backend/landscape/PersonalizationSourceKind.java": [(7, 22)],
    "backend/src/main/java/com/skillpilot/backend/landscape/ProgramUnit.java": [(1, 15)],
    "backend/src/main/java/com/skillpilot/backend/landscape/GoalPlacement.java": [(1, 14)],
    "backend/src/main/java/com/skillpilot/backend/api/CreateLearnerRequest.java": [(1, 4)],
    "backend/src/main/java/com/skillpilot/backend/ui/LearnerUiController.java": [(150, 174), (282, 289), (330, 338)],
    "backend/src/main/java/com/skillpilot/backend/curriculumpackage/PackageCompositionViewState.java": [(113, 124)],
    "scripts/validate_curriculum_runtime_catalog_contract.py": [(267, 275), (318, 326)],
    "app/src/hooks/useAppCore.ts": [(137, 156), (512, 515), (540, 578)],
    "app/src/utils/runtimeCurriculumCatalog.ts": [(323, 324), (540, 551)],
    "app/src/utils/compositionViewRuntime.ts": [(287, 295), (398, 420)],
    "app/src/utils/learnerCompositionScopeMatching.ts": [(1, 7), (37, 47), (65, 81)],
    "app/src/utils/goalPlacementProjection.ts": [(233, 243), (325, 338)],
    "app/src/components/PersonalCurriculumSetup.tsx": [(42, 49)],
    "app/src/views/LearnerView.tsx": [(135, 140)],
}
records = []
for relative, ranges in excerpts.items():
    path = REPO / relative
    lines = path.read_text().splitlines()
    records.append({"path": relative, "sha256": sha(path), "excerpts": [{"lineStart": start, "lineEnd": end, "text": "\n".join(lines[start-1:end])} for start, end in ranges]})
write_json("INPUT.actual-code-excerpts.json", {"role": "Actual R code and validators, no other review outputs", "files": records})
print(json.dumps({"schemaCases": len(schema_results), "unknownScopeKeysRejected": len(schema_results)-1, "matcherUnknownKeysRejected": sum(not row["constrained"] for row in matcher_results), "duplicateScopeDiagnosticCodes": sorted(set(row["code"] for row in duplicate_diagnostics)), "normalWrites": False, "HChanged": False}, ensure_ascii=False))
