# SPDX-License-Identifier: Apache-2.0
"""Finite identity/CAS checks for B's14-goal/86-pair source review. No normal writes."""
import hashlib, importlib.util, json
from pathlib import Path

R = Path.cwd().resolve()
O = Path(__file__).resolve().parent.parent.relative_to(R)
A = O.parent / 'chemie-current450-fourteen-method-multistate-source-author-20261018-v1'
read = lambda p: json.loads(Path(p).read_text())
digest = lambda x: hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def pin(p):
    p = Path(p); b = p.read_bytes()
    return {'path': p.as_posix(), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
def ptr(x, p):
    for k in p.split('/')[1:]:
        x = x[int(k)] if isinstance(x, list) else x[k]
    return x

W = read(A / 'INPUT.fourteen-whole-current-C-and-P.exact.json')
S = read(A / 'INPUT.selected-whole-source-cells-and-primary-operators.json')
M = read(A / 'MATRIX.eighty-six-current-goal-country-source-author.json')
Cpath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
G = {g['id']: g for g in read(Cpath)['goals']}
central = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
subject = next(x for x in read(central)['subjects'] if x['subject'] == 'chemie')
configs = [(p, read(p)) for p in subject['positiveEvidenceConfigPaths']]
selected = []
for w in W:
    gid = w['goalId']; assert G[gid] == w['wholeGoal'], ('C changed', gid)
    owners = [(p,c) for p,c in configs if gid in c['scope']['goalIds']]
    assert len(owners) == 1, (gid, len(owners))
    cp,c = owners[0]
    records = [json.loads(line) for line in Path(c['reviewPath']).read_text().splitlines() if line.strip()]
    actual = [r for r in records if r['goalId'] == gid]; assert len(actual) == 1
    current = actual[0]['profile']; old = w['wholeNativeRecord']['profile']
    delta = {}
    if gid.startswith('e81a4aed'):
        def unchanged_prefix(previous, successor, loc=''):
            if isinstance(previous,dict):
                assert set(previous)==set(successor), ('e81 keys changed',loc)
                for k,v in previous.items(): unchanged_prefix(v,successor[k],loc+'/'+k)
            elif isinstance(previous,list):
                assert successor[:len(previous)]==previous, ('e81 old prefix changed',loc)
                if len(successor)!=len(previous): delta[loc]=successor[len(previous):]
            else: assert previous==successor, ('e81 old field changed',loc)
        unchanged_prefix(old,current)
        assert digest(current) == '8d6ba741e47ea48a04f57de70c685953ffd3cc3d251a3423670f56bedb180af0'
        assert len(delta['/applicationCaseBriefs']) == 2
    else: assert current == old, ('P changed',gid)
    selected.append({'goalId':gid,'wholeCExact':True,'oldWholeProfileExact':current == old,
      'allOldFieldsAndListPrefixesExact':True,'currentWholeGoalSHA256':digest(G[gid]),
      'currentWholeProfileSHA256':digest(current),'ownerConfig':pin(cp),'nativeReview':pin(c['reviewPath']),
      'additiveDeltaKeys':{k:len(v) for k,v in delta.items()}})
E = read(A / 'INPUT.one-existing-source-backed-endpoint-whole-C-P.exact.json')
gid = E['wholeGoal']['id']; assert G[gid] == E['wholeGoal']
ep = json.loads(Path(E['reviewPath']).read_text().splitlines()[E['line']-1])['profile']
assert ep == E['wholeProfile']; assert '9e656697-fc05-5aa9-9aca-871af2e89eb7' in G[gid]['requires']

sources = []; byid = {s['wholeSourceGoal']['id']: s for s in S}
assert len(byid) == 85
for s in S:
    assert pin(s['primary']['path']) == s['primary']
    checks = []
    for a in s['currentOperativeAliases']:
        path = a['extraction']['path']; actual = ptr(read(path), a['wholeSourceObjectPointer'])
        assert actual == s['wholeSourceGoal'], ('selected source changed',s['cellKey'],path)
        checks.append({'extractionCurrentPin':pin(path),'wholeSourceObjectPointer':a['wholeSourceObjectPointer'],
                       'wholeSelectedCellExact':True,'wholeSelectedCellSHA256':digest(actual)})
    sources.append({'cellKey':s['cellKey'],'sourceGoalId':s['wholeSourceGoal']['id'],
                    'primary':s['primary'],'origin':s['origin'],'selectedCurrentObjects':checks})
newcells = []
for f in sorted((A/'candidate/extraction-additions').glob('*.json')):
    d = read(f); p = d['operativeBaseExtractionPath']; live = read(p)
    current = {g['id']:g for g in live['sourceGoals']}; pending = d['sourceGoalsToAppend']
    assert d['existingSource60CellsAppendCount'] == 0
    for g in pending:
        assert g == byid[g['id']]['wholeSourceGoal']
        assert g['id'] not in current, ('new source already exists',g['id'])
    newcells.append({'candidate':pin(f),'currentBase':pin(p),'currentCount':len(current),
                     'newCellIds':[g['id'] for g in pending],
                     'proposedCurrentCount':len(current)+len(pending),
                     'wholeFilePinDrift':pin(p)!=d['baseExtraction']})
newids=[gid for f in newcells for gid in f['newCellIds']]
assert len(newids)==len(set(newids))==43
direct=read(A/'CANDIDATE.one-hundred-four-direct-partial-contributions.inactive.json')['mappings']
assert len(direct)==104
matrixedges={(r['jurisdiction'],r['goalId'],s['sourceGoalId']) for r in M if r['authorDisposition']=='PROPOSE_DIRECT_PARTIAL' for s in r['sourceContributions']}
assert matrixedges=={(m['jurisdiction'],m['canonicalGoalId'],m['legacyGoalId']) for m in direct}
for m in direct:
    assert m['matchType']=='partial' and m['wholeSourceCredit'] is False
    s=byid[m['legacyGoalId']]; r=next(r for r in M if r['goalId']==m['canonicalGoalId'] and r['jurisdiction']==m['jurisdiction'])
    for a,b in [('operatorSpecificAuthorRationaleDe','concreteEvidenceModelDe'),('operatorSpecificAuthorRationaleEn','concreteEvidenceModelEn'),('boundariesDe','boundaryDe'),('boundariesEn','boundaryEn')]:assert m[a]==r[b]
    assert m['sourceStageCourseAndContext']==s['verifiedStageCourseAndContext']
aliases=[]
for f in sorted((A/'candidate/mapping-cell-appends').glob('*.json')):
    d=read(f); live=read(d['mappingPath']); assert live['sourceExtractionPath']==d['sourceExtractionPathAtAuthoring']
    changes=[]
    for row in d['cellAppends']:
        expected=row['pairAbsentExpectedBefore']
        assert not any(m.get('legacyGoalId')==expected['legacyGoalId'] and m.get('canonicalGoalId')==expected['canonicalGoalId'] for m in live.get('mappings',[])), ('already mapped',expected)
        assert ptr(read(row['boundedAuthorWitness']['path']),row['boundedAuthorWitness']['jsonPointer']) in direct
        for old in row['existingAuthoritativeSourceDecisionsCAS']:
            actual=ptr(live,old['jsonPointer'])
            if actual != old['wholeDecision']:
                changes.append({'pointer':old['jsonPointer'],'sourceGoalId':actual.get('sourceGoalId'),
                   'oldSHA256':old['sha256'],'currentSHA256':digest(actual),'currentWholeDecision':actual})
    aliases.append({'candidate':pin(f),'normalPath':d['mappingPath'],'currentNormalPin':pin(d['mappingPath']),
       'wholeFilePinDrift':pin(d['mappingPath'])!=d['beforeWholeFilePinForAuditNotGlobalCAS'],
       'selectedDecisionCASChanges':changes,'proposedPartialOccurrences':len(d['cellAppends'])})
assert sum(a['proposedPartialOccurrences'] for a in aliases)==143 and len(aliases)==31
literal=[]
registry=read('curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json')
for e in read(A/'CANDIDATE.two-literal-requires-acquisition-entries.inactive.json')['entries']:
    p=e['proposedStockEntry']; assert not any(r['goalId']==p['goalId'] and r['jurisdiction']==p['jurisdiction'] for r in registry['entries'])
    for anchor in e['sourceAnchors']:
        actual=ptr(read(anchor['mappingFile']['path']),anchor['jsonPointer'])
        assert actual==anchor['wholeCurrentMapping']
        literal.append({'jurisdiction':p['jurisdiction'],'literalRequiresPresent':True,
           'actualSourceMappingExact':True,'actualSourceMappingSHA256':digest(actual),
           'currentMappingPin':pin(anchor['mappingFile']['path'])})
spec=importlib.util.spec_from_file_location('stock_validate_schemas',R/'scripts/validate_schemas.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errs=mod.curriculum_symlink_errors(R);own=[e for e in errs if str(O) in e];assert not own
print(json.dumps({'status':'PASS','scope':'Finite14 C/P,85 selected source objects,43 additive cells,104 edges/31 aliases/143 occurrences,2literal paths only',
 'centralCurrentPin':pin(central),'canonicalCurrentPin':pin(Cpath),'wholeCurrentCAndP':selected,
 'wholeAdditionalEndpointExact':True,'selectedSources':sources,'newCellAbsenceAndCurrentBases':newcells,
 'mappingAliasCAS':aliases,'literalPathAndAnchorCAS':literal,
 'actualStockSymlinkCheck':{'function':'scripts/validate_schemas.py::curriculum_symlink_errors','globalErrorCount':len(errs),'ownErrors':own},
 'normalWrites':0,'APCompilerBuildRuns':0,'fullSchemaRun':False},ensure_ascii=False,indent=2))
