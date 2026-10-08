"""Freeze current inputs and stage six inert mapping-only replacements."""
import hashlib
import json
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
SEED = Path('/tmp/skillpilot-wirtschaft-BY-current311-native-QA-kcgmgwla')
REVIEW = ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-by-ten-thirty-five-source-tuples-independent-review-20261008-v1'
ECON = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text())
def wx(p,o):
    with p.open('x') as f:f.write(json.dumps(o,ensure_ascii=False,indent=2)+'\n')

maps = []
for p in (ROOT/'curricula/DE/Gymnasium/mapping').rglob('*.json'):
    if read(p).get('targetLandscapeId') == ECON: maps.append(p)
maps.sort()
assert len(maps) == 34
reviewed_maps = [p for p in maps if read(p).get('sourceExtractionPath')]
assert len(reviewed_maps) == 32
source_paths = sorted({read(p)['sourceExtractionPath'] for p in reviewed_maps})
registry = ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
econ_subject = next(s for s in read(registry)['subjects'] if s['landscapePath'].endswith('DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
bound_paths = [p.relative_to(ROOT).as_posix() for p in maps] + source_paths + ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',registry.relative_to(ROOT).as_posix()]
bound_paths += [v for k,v in econ_subject.items() if k.endswith('Path') and isinstance(v,str) and (ROOT/v).is_file()]
bound_paths += [p.relative_to(ROOT).as_posix() for p in (ROOT/'curricula/DE/Gymnasium/provenance').glob('*.json')]
bound_paths += [p.relative_to(ROOT).as_posix() for p in (ROOT/'curricula/DE/Gymnasium/composition-views/wirtschaft').rglob('*.json')]
bound_paths = sorted(set(bound_paths))
seed_observations = [{'path':rel,'presentInSeed':(SEED/rel).is_file(),'wholeEqualCurrentWhenPresent':(SEED/rel).is_file() and (ROOT/rel).read_bytes()==(SEED/rel).read_bytes()} for rel in bound_paths]
assert len(read(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')['goals']) == 386
official = (ROOT/'app/scripts/generateCurriculumQualityStatus.ts').read_text()
cli_marker='\nif (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {'
assert official.count(cli_marker)==1
native_body=official.split(cli_marker)[0]
seed_probe=(SEED/'app/scripts/economics-current311-post-BY-actual-native-layerA.ts').read_text()
assert seed_probe.startswith(native_body)
pair=Path(tempfile.mkdtemp(prefix='skillpilot-wirtschaft-source-six-current311-B-'))
phases={phase:pair/phase for phase in ['baseline','six-map-candidate']}
for phase, physical in phases.items():
    subprocess.run(['cp','-a','--reflink=auto',str(SEED),str(physical)],check=True)
    # The technical seed had only the two CrossStage authored views. Copy every
    # bound current input, including the real SekI view, identically into BOTH
    # phases. This is current-input materialization, not a rule/view edit.
    for rel in bound_paths:
        (physical/rel).parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(ROOT/rel,physical/rel)
    for rel in bound_paths: assert (ROOT/rel).read_bytes()==(physical/rel).read_bytes(),(phase,rel)
    footer='''
const landscape=loadJson<SkillLandscape>(resolve(repoRoot,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'));
const compilation=buildApplicabilityCompilation();
const econ=compilation.reports.find(r=>r.landscapeId===landscape.landscapeId)!;
const coverage=readJurisdictionCoverageByLandscapeId(compilation).get(landscape.landscapeId)!;
const pipeline=readMappingPipelineByLandscapeId().get(landscape.landscapeId)!;
const profile=routeProfiles.find(p=>p.profileId==='canonical-economics-crossstage')!;
const route=evaluateRouteProfile(landscape,profile,compilation);
const result={schemaVersion:1,role:'actual_mapping_only_native_technical_comparison_not_independent_source_approval',checkedAt:new Date().toISOString(),physicalIsolate:repoRoot,phase:PHASE,canonicalWholeGoals:landscape.goals.length,currentCurricularAtomicDenominator:311,allGoalTagsRequiresContainsAndViewsUnchangedByThisProbe:true,nativeImplementationBodyUnmodified:true,sourceCourseCQR004:evaluateCourseLevelMappingConsistency(landscape),jurisdictionCoverageCQR003:evaluateJurisdictionCoverage(coverage),sourceSnapshotCQR002:evaluateSourceSnapshotIngestion(coverage,pipeline),sourceCountCQR005:evaluateSourceGoalCountPlausibility(pipeline),wholeJurisdictionCoverage:coverage,wholeSourceMappingPipeline:pipeline,wholeEconomicsCompilerReport:econ,route,graph:evaluateGraphIntegrity(landscape,new Set(landscape.goals.map(g=>g.id))),types:evaluateTypeConsistency(landscape),humanApprovalClaimed:false,newStrictClosures:0,liveWrites:0};
const output=resolve(repoRoot,'actual-six-mapping-native-source-and-layerA.json');writeFileSync(output,JSON.stringify(result,null,2)+'\\n',{flag:'wx'});console.log(JSON.stringify({phase:result.phase,wholeGoals:result.canonicalWholeGoals,route:route.rules.map(r=>({id:r.id,status:r.status,metrics:r.metrics})),sourceCourse:result.sourceCourseCQR004,jurisdictionCoverage:result.jurisdictionCoverageCQR003,sourceSnapshot:result.sourceSnapshotCQR002,sourceCount:result.sourceCountCQR005,compiler:econ.summary,graph:result.graph.status,types:result.types.status},null,2));
'''.replace('PHASE',json.dumps(phase))
    probe=physical/'app/scripts/economics-six-mapping-native-source-and-layerA.ts'
    with probe.open('x') as f:f.write(native_body+footer)
    assert probe.read_text().startswith(native_body)
patches=read(REVIEW/'minimal-thirty-five-tuple-and-decision-patches.candidate.json')['patches']
replacement_records=[]
for original in reviewed_maps:
    rel=original.relative_to(ROOT).as_posix()
    if not any(p['mappingPath']==rel for p in patches): continue
    successor=REVIEW/'mapping-successors'/f'{original.name}.candidate.json'
    expected=read(original)
    candidate=read(successor)
    targeted={(p['wholeBeforeTuple']['legacyGoalId'],p['wholeBeforeTuple']['canonicalGoalId']) for p in patches if p['mappingPath']==rel}
    def untouched(d):return [m for m in d['mappings'] if (m['legacyGoalId'],m['canonicalGoalId']) not in targeted]
    assert untouched(expected)==untouched(candidate)
    assert expected['sourceExtractionPath']==candidate['sourceExtractionPath']
    replacement_records.append({'mappingPath':rel,'originalSha256':sha(original),'candidatePath':successor.relative_to(ROOT).as_posix(),'candidateSha256':sha(successor),'sourcePathUnchanged':True,'allNonTargetTuplesWholeEqual':True})
    shutil.copyfile(successor,phases['six-map-candidate']/rel)
assert len(replacement_records)==6
candidate_paths={r['mappingPath'] for r in replacement_records}
for rel in bound_paths:
    assert (phases['baseline']/rel).read_bytes()==(ROOT/rel).read_bytes(),rel
    if rel not in candidate_paths:assert (phases['six-map-candidate']/rel).read_bytes()==(ROOT/rel).read_bytes(),rel
snapshot={'role':'actual_current311_fresh_two_physical_isolates_mapping_only_inputs','createdAt':datetime.now(timezone.utc).isoformat(),'physicalPair':str(pair),'phases':{k:str(v) for k,v in phases.items()},'seedIsolate':str(SEED),'seedInputObservations':seed_observations,'allBoundInputsCopiedFreshFromCurrentRootIntoBothPhases':True,'wholeCurrentGoals':386,'sourceExtractionMappingFiles':32,'additionalLegacyMappingFiles':2,'wholeCurrentTargetMappingFiles':34,'uniqueSourceExtractionInputs':len(source_paths),'current311QAPath':econ_subject['visualizationQaPath'],'nativeOfficialFile':'app/scripts/generateCurriculumQualityStatus.ts','nativeOfficialSha256':sha(ROOT/'app/scripts/generateCurriculumQualityStatus.ts'),'nativeBodySha256':hashlib.sha256(native_body.encode()).hexdigest(),'officialNativeBodyByteExact':True,'boundInputs':[{'path':rel,'sha256':sha(ROOT/rel)} for rel in bound_paths],'sixReplacements':replacement_records,'canonicalTagsViewsAndGraphUnchanged':True,'sharedNodeModulesReadOnlyDependencyOnly':True,'sourceOrCodeIndependentApprovalClaimed':False,'humanApprovalClaimed':False,'liveWrites':0}
wx(OUT/'actual-current311-two-isolates-whole-inputs.prepared.json',snapshot)
print(json.dumps({'pair':str(pair),'phases':snapshot['phases'],'maps':34,'sourceMappingFiles':32,'sourceInputs':len(source_paths),'goalCount':386,'boundInputs':len(bound_paths),'replacements':6},ensure_ascii=False))
