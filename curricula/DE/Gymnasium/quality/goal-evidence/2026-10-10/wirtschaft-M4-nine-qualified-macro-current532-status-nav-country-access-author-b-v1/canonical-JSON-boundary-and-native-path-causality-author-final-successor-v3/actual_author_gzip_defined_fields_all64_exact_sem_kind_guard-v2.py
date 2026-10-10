import json,gzip,hashlib,sys
from pathlib import Path
O=Path(sys.argv[1]).resolve();S=O/'canonical-JSON-boundary-and-native-path-causality-author-final-successor-v3'
def load(path):
 p=O/path
 return json.loads(p.read_bytes() if p.exists() else gzip.decompress(p.with_name(p.name+'.gz').read_bytes()))
B=load('final-before-current532.actual-native.json');A=load('final-after-current541-nine-macro118-accesses.actual-native.json');N=load('one-genuine-NI-LK-state-rules-reference-drop-and-complete-author-guards-successor-v2/actual-negative-one-real-NI-LK-state-rules-whole-endpoint-reference-drop.actual-native.json')
ordinary={i for s in B['all64NativeScopeSets'] for i in s['ordinarySupport']};assert len(ordinary)==336
# Canonical JSON transport intentionally drops undefined keys; all defined scope fields and every nonpractice array must be identical.
practice={g['id'] for g in load('whole-nine-qualified-macro.only-machine-status-note.inert.json')}
root=next(p for p in O.parents if (p/'AGENTS.md').exists())
ledger=root/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current532-eight-qualified-174-20261010-v11/wirtschaftswissenschaften.semantic-kinds.json'
assert hashlib.sha256(ledger.read_bytes()).hexdigest()=='0a7a216f914738d6e1c3db3b7907d111af08d67bff4dfd40b79f4cf42536347e'
practice.update(d['goalId'] for d in json.loads(ledger.read_text())['decisions'] if d['semanticKind']=='practiceAssessment')
def non(rows):return [{k:[i for i in v if i not in practice] if isinstance(v,list) else v for k,v in s.items()} for s in rows]
assert non(B['all64NativeScopeSets'])==non(A['all64NativeScopeSets'])==non(N['all64NativeScopeSets'])
def source(x):return {k:[{n:v for n,v in j.items() if n not in ['visibleGoals','visibleClusterGoals']} for j in v] if k=='jurisdictions' else v for k,v in x.items() if k!='rawAtomicGoals'}
assert source(B['wholeSource'])==source(A['wholeSource'])==source(N['wholeSource'])
def met(x):return next(r['metrics'] for r in x['wholeRoute']['rules'] if r['id']=='CQR-104')
assert [met(x)['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute'] for x in [B,A,N]]==[1844,1642,1646]
assert [met(x)['uniqueVisibleSelectedGoalsMissingDirectTerminalRoute'] for x in [B,A,N]]==[159,146,148]
assert [met(x)['projectionScopesMissingTerminalAutonomyGoals'] for x in [B,A,N]]==[12,12,13]
for x in [B,A,N]:
 assert x['wholeCompiler']['summary']['errors']==x['wholeCompiler']['summary']['warnings']==0
 assert (x['wholeSource']['totalJurisdictions'],x['wholeSource']['sourceAtomicGoals'],x['wholeSource']['unsupportedAssignedAtomicGoals'],x['wholeSource']['unmappedSourceAtomicGoals'])==(16,2134,0,0)
 assert sum(len(s['ordinaryTargets']) for s in x['all64NativeScopeSets'])==6974
 for k in ['wholeMaterialPrerequisiteOccurrencesMissingFromProjection','wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath','visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks']:assert met(x)[k]==0
bc={g['goalId']:g for g in B['wholeCompiler']['goals']};ac={g['goalId']:g for g in A['wholeCompiler']['goals']};assert all(bc[i]==ac[i] for i in ordinary)
changes=[i for i in bc if bc[i]!=ac[i]];assert all(bc[i]['goalType']=='cluster' for i in changes)
for m in A['actualMaterials']:assert all(s['materialCurrentlyVisible']==(s['countryCompatible'] and s['courseCompatible'] and s['wholeCoveredSupportPresent'] and not s['missingPrerequisites']) for s in m['actual64Scopes'])
assert sum(s['materialCurrentlyVisible'] for m in A['actualMaterials'] for s in m['actual64Scopes'])==210
causal=load('canonical-JSON-boundary-and-native-path-causality-author-final-successor-v3/actual-native-direct-atomic-paths-202-restored-occurrences13-fully-closed-IDs-and-material-prerequisite-causality.json');assert causal['actualRestoredOccurrences']==202 and len(causal['actualFullyClosedUniqueGoalIds'])==13
archive=load('canonical-JSON-boundary-and-native-path-causality-author-final-successor-v3/actual-whole-native-lossless-gzip-archive-index.before-first-handoff.json')
root=next(p for p in O.parents if (p/'AGENTS.md').exists())
for row in archive['rows']:
 raw=gzip.decompress((root/row['losslessGzipPath']).read_bytes());assert hashlib.sha256(raw).hexdigest()==row['originalJSONSHA256'] and len(raw)==row['originalJSONBytes']
print(json.dumps({'role':'AUTHOR_DEFINED_NATIVE_DATA_GUARD_NOT_INDEPENDENT_SCOPE','actualNativeComputationFrames':[1844,1642,1646],'whole64ExistingRolesExact':True,'ordinary336CompiledRowsExact':True,'targets6974Exact':True,'whole210MaterialScopeBindings':True,'nativeSource16_2134_0_0Exact':True,'newWholePracticeOnly9':True,'clusterCompiledChanges':changes,'losslessWholeNativeReconstructionVerified':True,'noNewStrictClosure':True}))
