# SPDX-License-Identifier: Apache-2.0
"""Reuse the sealed actual check; adjust evidence output and add exact base/delta assertions."""
import hashlib
import json
from pathlib import Path

base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-final737-AP-and-all41-closure-checkpoint-technical-20261018-v1')
out = Path(__file__).resolve().parent.relative_to(Path.cwd())
seal_path = base / 'SEAL.readonly-final737-checkpoint.json'
assert hashlib.sha256(seal_path.read_bytes()).hexdigest() == '35979b3900c269b741b30fc814274bc019315cf9fa9d58e3754506cb56304bd8'
source_path = base / 'check-current737-applicability-and-all41.mts'
seal = json.loads(seal_path.read_text())
source_pin = next(p for p in seal['members'] if p['path'] == source_path.as_posix())
assert hashlib.sha256(source_path.read_bytes()).hexdigest() == source_pin['sha256']
source = source_path.read_text()
old_name = 'chemie-current450-final737-AP-and-all41-closure-checkpoint-technical-20261018-v1/'
new_name = out.name + '/'
assert source.count(old_name) == 1
source = source.replace(old_name, new_name)
old_receipt = "dump('INPUTS.actual-normal-production-and-read-pins.json',{normalAndProductionPins:guardPins,actualCompilerReadPins:[...observed.values()].sort((a,b)=>a.path.localeCompare(b.path)),allPinsRehashedExactAfterCheck:true,normalWrites:0,rawCopies:0});"
replacement = r"""// Additional follow-up assertions and sparse receipt; original AP/41-view checks above are unchanged.
const BASE=B+'chemie-current450-final737-AP-and-all41-closure-checkpoint-technical-20261018-v1/',baseSealPin=pin(BASE+'SEAL.readonly-final737-checkpoint.json');
assert.equal(baseSealPin.sha256,'35979b3900c269b741b30fc814274bc019315cf9fa9d58e3754506cb56304bd8');
const baseSeal=read(baseSealPin.path);for(const member of baseSeal.members)assert.deepEqual(pin(member.path),member,'Historical base member drift');
const baseInputPin=pin(BASE+'INPUTS.actual-normal-production-and-read-pins.json'),baseCheckPin=pin(BASE+'CHECK.actual737-stored-derived-applicability-and-all41-effective-closure.json'),baseInputs=read(baseInputPin.path),baseCheck=read(baseCheckPin.path),expectedPin=pin(O+'INPUT.actual-six-bounded-header-diffs.json'),expected=read(expectedPin.path);
const beforePins=new Map<string,any>([...baseInputs.normalAndProductionPins,...baseInputs.actualCompilerReadPins].map((p:any)=>[p.path,p])),currentPins=new Map<string,any>([...guardPins,...observed.values()].map((p:any)=>[p.path,p]));
assert.deepEqual([...currentPins.keys()].sort(),[...beforePins.keys()].sort(),'Actual check input path set changed');
const deltas:any[]=[];for(const [path,before] of beforePins){const after=currentPins.get(path);if(JSON.stringify(before)!==JSON.stringify(after))deltas.push({path,before,after})}
deltas.sort((a,b)=>a.path.localeCompare(b.path));assert.equal(deltas.length,6,'Exactly six header-file raw changes expected');
assert.deepEqual(deltas,expected.records.map((r:any)=>({path:r.path,before:r.beforeNormalPin,after:r.afterNormalPin})).sort((a:any,b:any)=>a.path.localeCompare(b.path)),'Actual input deltas differ from the six bounded source diffs');
assert.deepEqual(report.summary,baseCheck.compiler.summary,'Compiler finding counts changed');assert.deepEqual(warnings,baseCheck.compiler.warnings,'Actual warnings changed');assert.deepEqual(report.projections,baseCheck.compiler.projections,'Compiled jurisdiction projections changed');
assert.equal(hash(apChecks.map(r=>({goalId:r.goalId,applicability:r.storedApplicability}))),baseCheck.compiler.storedAPVectorSHA256);assert.equal(hash(apChecks.map(r=>({goalId:r.goalId,applicability:r.derivedApplicability}))),baseCheck.compiler.derivedAPVectorSHA256);
assert.deepEqual(views,baseCheck.closure.views,'Actual 41 scopes/targets/parents/full closures changed');
dump('INPUTS.actual-normal-production-and-read-pins.json',{role:'SPARSE_SIX_HEADER_DELTA_OVER_SEALED_8255_INPUT_BASE',baseSeal:baseSealPin,baseInputs:baseInputPin,baseActualCheck:baseCheckPin,boundedDiffEvidence:expectedPin,actualCompilerReadFileCount:observed.size,uniqueActualCheckInputCount:currentPins.size,actualInputPathSetExact:true,sixRawInputDeltas:deltas,unchangedOtherInputPins:currentPins.size-deltas.length,allCurrentPinsRehashedExactAfterCheck:true,exactOriginalWarningObjectsPreserved:88,all737StoredDerivedScopesAndAll41ViewVectorsExact:true,normalWrites:0,rawCopies:0});"""
assert source.count(old_receipt) == 1
source = source.replace(old_receipt, replacement)
target = out / 'check-current737-applicability-and-all41.followup.mts'
assert not target.exists()
target.write_text(source)
receipt = {
    'role': 'EXACT_BASE_CHECK_REUSE_WITH_EVIDENCE_OUTPUT_AND_SPARSE_DELTA_ASSERTIONS',
    'baseScript': source_pin,
    'baseSealSHA256': hashlib.sha256(seal_path.read_bytes()).hexdigest(),
    'generatedFollowupScript': {'path': target.as_posix(), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'bytes': target.stat().st_size},
    'changes': ['Evidence directory constant only.', 'Replace full input hash-list output with linked sealed base, exact six raw deltas and added preservation assertions.'],
    'originalApplicabilityAndAll41ClosureChecksPreserved': True,
    'productionModulesChanged': 0,
}
(out / 'METHOD.exact-base-script-reuse.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
