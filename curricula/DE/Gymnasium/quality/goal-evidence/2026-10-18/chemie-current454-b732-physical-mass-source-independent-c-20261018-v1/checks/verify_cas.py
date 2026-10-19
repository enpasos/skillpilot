# SPDX-License-Identifier: Apache-2.0
import copy, hashlib, json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent.parent
AUTHOR = OWN.parent / 'chemie-current454-b732-physical-mass-source-author-20261018-v1'
read = lambda p: json.loads((ROOT / p).read_text())
def pin(p):
    p = ROOT / p
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def verify(p):
    actual = pin(p['path'])
    assert actual['sha256'] == p['sha256'] and actual['bytes'] == p['bytes'], p['path']
def emit(name, value):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

seal = read(AUTHOR/'SEAL.author-b732-physical-mass-source-candidate.json')
assert pin(AUTHOR/'SEAL.author-b732-physical-mass-source-candidate.json')['sha256'] == 'e1a0a8f504587f61a20f4781bb61d4b0b85bb4edf57e888824c559043b2ec1fc'
for p in seal['outputs']: verify(p)
manifest = read(AUTHOR/'INPUTS.actual-current-raw-pins.json')
pins = manifest if isinstance(manifest,list) else manifest.get('pins', manifest.get('inputs', manifest.get('files', [])))
assert len(pins)==114
resolutions=[]
for p in pins:
    if pin(p['path'])['sha256'] != p['sha256']:
        assert p['path']=='curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'
        archived=pin(OWN.parent/'chemie-current454-existing-requires-surrogate-author-20261018-v1/before/registry.EXACT.json')
        assert archived['sha256']==p['sha256'] and archived['bytes']==p['bytes']
        resolutions.append({'originalPin':p,'exactArchivedBefore':archived,'currentDisjointAppendRegistry':pin(p['path']),'scope':'Root independently accepted23 earlier entries; no B732 entry or candidate target CAS changed. Append new accepted BY/SH rows disjointly; never overwrite this current registry.'})
    else: verify(p)
goal_cas = read(AUTHOR/'operations/two-whole-goals-and-one-BY-view.CAS.pending.json')
verify(goal_cas['landscapeInput']); verify(goal_cas['view']['input'])
before = read(AUTHOR/'before/landscape.current741.whole-before.json')
after = read(AUTHOR/'candidate/landscape.current741.after.INACTIVE.json')
expected = copy.deepcopy(before)
for op in goal_cas['wholeGoals']:
    index = int(op['currentPointer'].split('/')[-1])
    assert expected['goals'][index] == op['before']
    expected['goals'][index] = op['after']
    assert op['after']['description'] == op['before']['description']
    assert op['after']['descriptionEn'] == op['before']['descriptionEn']
    assert op['after']['contains'] == op['before']['contains']
assert expected==after and len(after['goals'])==741
e7=next(g for g in after['goals']if g['id'].startswith('e7c3d20e'))
b=next(g for g in after['goals']if g['id'].startswith('b732'))
old_e7=next(g for g in before['goals']if g['id']==e7['id'])
assert e7['requires']==old_e7['requires']+[b['id']]
check=copy.deepcopy(e7);check['requires']=old_e7['requires'];assert check==old_e7
source_cas=read(AUTHOR/'operations/nine-current-whole-source-union-CAS.pending.json')
source_results=[]
for op in source_cas['operations']:
    verify(op['currentRawBefore'])
    old=read(op['beforeArchivePath']);new=read(op['afterPath']);assert read(op['mappingPath'])==old
    src=op['identitySelector']['sourceGoalId']
    di=next(i for i,d in enumerate(old['decisions'])if d['sourceGoalId']==src)
    assert old['decisions'][di]==op['beforeWholeDecision']
    union=[m for m in old['mappings']if m['legacyGoalId']==src]
    assert union==op['beforeWholeSourceUnion']
    assert op['afterWholeSourceUnion']==union+[op['addMappingRow']]
    assert op['addMappingRow']['canonicalGoalId']==b['id'] and op['addMappingRow']['matchType']=='partial'
    expected=copy.deepcopy(old);expected['decisions'][di]=op['afterWholeDecision'];expected['mappings'].append(op['addMappingRow'])
    assert expected==new
    old_d,new_d=op['beforeWholeDecision'],op['afterWholeDecision']
    for key in old_d:
        if key not in ['canonicalGoalIds','rationale','reviewedAt','reviewer','currentUnionRef']:
            assert old_d[key]==new_d[key], f'Old scientific field changed: {src}/{key}'
    assert new_d['canonicalGoalIds']==old_d['canonicalGoalIds']+[b['id']]
    assert new_d['rationale'].startswith(old_d['rationale'])
    source_results.append({'sourceGoalId':src,'mappingPath':op['mappingPath'],'wholeExpectedAfterExact':True,'oldMembersAndScientificFieldsExact':True,'singleNewPartialOnly':True})
profiles=read(AUTHOR/'inputs/two-actual-selected-whole-P-records.json')
for p in profiles:
    actual=next(json.loads(line)for line in Path(p['recordPath']).open()if json.loads(line).get('goalId')==p['goalId'])
    assert actual==p['wholeRecord']
    coverage=actual['profile']['coverageExpectations']
    assert coverage['minimumIndependentDemonstrations']==2 and coverage['freshVariationRequired'] and coverage['independentTransferRequired']
emit('CHECK.exact-independent-CAS-and-current-bindings.json',{'role':'ACTUAL_INDEPENDENT_BOUNDED_TECHNICAL_REPLAY','authorSeal':pin(AUTHOR/'SEAL.author-b732-physical-mass-source-candidate.json'),'authorOutputPinsExact':len(seal['outputs']),'authorInputPinsExactOrArchived':len(pins),'historicalRegistryResolution':resolutions,'wholeGoalCASExact':True,'e7OnlyOneRequiresAppend':True,'all741IdsAndDescriptionsAndContainsPreserved':True,'twoCurrentWholePRecordsExact':True,'min2FreshTransferPreserved':True,'sourceRows':source_results,'sourceUniverseChanged':False,'normalWrites':0,'fullCheckRun':False})
emit('INPUTS.exact-independent-read-pins.json',{'authorSeal':pin(AUTHOR/'SEAL.author-b732-physical-mass-source-candidate.json'),'authorOutputPins':seal['outputs'],'authorOriginalInputPins':pins,'historicalRegistryResolution':resolutions,'ownProductionCodePins':[pin(p)for p in ['app/scripts/sourceCoverageEvidence.ts','app/scripts/applicabilityCompiler.ts','app/src/utils/authoring/compositionViewAuthoring.ts']]})
print(json.dumps({'sealOutputsExact':len(seal['outputs']),'currentInputsExact':len(pins),'goalCAS':2,'sourceCAS':len(source_results),'P':2,'normalWrites':0}))
