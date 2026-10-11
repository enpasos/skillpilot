from pathlib import Path
import copy
import hashlib
import json
import os
import subprocess
import jsonschema

ROOT = Path(__file__).resolve().parents[7]
O = Path(__file__).parent.relative_to(ROOT)


def read(path):
    return json.loads((ROOT / path).read_text())


def bind(path):
    p = ROOT / path
    data = p.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def verify(binding):
    assert bind(binding['path']) == binding, binding['path']


def put(path, obj):
    p = ROOT / path
    if p.exists():
        assert json.loads(p.read_text()) == obj, str(path)
        return bind(path)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return bind(path)


def rows(path):
    return [json.loads(line) for line in (ROOT / path).read_text().splitlines() if line.strip()]


i = read(O / 'actual-v18-fifteen-qualified-graph-technical-author-inputs.json')
d = read(O / 'actual-official-fifteen-SEM-and-ten-P-whole-input-only-field-deltas.author.json')
cap = Path(i['privatePhysicalCapsule'])
before = {g['id']:g for g in read(i['wholeBeforeCAN']['path'])['goals']}
after = {g['id']:g for g in read(i['wholeAfterCAN']['path'])['goals']}
assert len(before) == len(after) == 678
actualChangedGoals = {g for g in before if before[g] != after[g]}
assert len(actualChangedGoals) == 15
for p in ['wholeBeforeCAN','wholeAfterCAN','wholeAuthorHandoff','foreignRootQualifiedGraphDeltaKEEP','oldRegistry','oldBookConfig','oldKindLedger','oldAtomicityConfig','oldMemoryConfig','oldWholeP336','oldAtomicityReview','oldMemoryReview','oldCards']:
    verify(i[p])
assert bind('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')['sha256'] == i['wholeBeforeCAN']['sha256']
assert (cap / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json').read_bytes() == (ROOT / i['wholeAfterCAN']['path']).read_bytes()

semOld = read(i['oldKindLedger']['path'])
semNew = read(i['newSEMPath'])
assert semOld.keys() == semNew.keys()
assert {k:v for k,v in semOld.items() if k != 'decisions'} == {k:v for k,v in semNew.items() if k != 'decisions'}
oldKinds = {r['goalId']:r for r in semOld['decisions']}
newKinds = {r['goalId']:r for r in semNew['decisions']}
semChanges = []
for g,old in oldKinds.items():
    new = newKinds[g]
    assert {k:v for k,v in old.items() if k != 'sourceFingerprint'} == {k:v for k,v in new.items() if k != 'sourceFingerprint'}
    if old != new:
        assert g in actualChangedGoals
        semChanges.append({'goalId':g,'wholeBefore':old,'wholeAfter':new,'onlyField':'sourceFingerprint'})
assert {x['goalId'] for x in semChanges} == actualChangedGoals
schema = read('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json')
schemaErrors = [str(e) for e in jsonschema.Draft202012Validator(schema).iter_errors(semNew)]
assert not schemaErrors
assert semNew['counts'] == {'total':678,'curricularAtomic':336,'practiceAssessment':297,'curricularArea':32,'memory':10,'orientation':1,'programStructure':1,'runtimeSupport':1}

phaseIds = set(i['ordinaryPhaseGoalIds'])
assert len(phaseIds) == 9
amDeltas = {}
for label,oldKey,newPath in [('atomicity','oldAtomicityReview','newAtomicityReviewPath'),('memory','oldMemoryReview','newMemoryReviewPath')]:
    old = rows(i[oldKey]['path']); new = rows(i[newPath]); assert len(old) == len(new) == 336
    changes = []
    for a,b in zip(old,new):
        assert a['goalId'] == b['goalId']
        fields = sorted(k for k in a if a[k] != b[k])
        if fields:
            assert fields == ['fingerprint'] and a['goalId'] in phaseIds
            changes.append({'goalId':a['goalId'],'wholeBefore':a,'wholeAfter':b,'onlyField':'fingerprint'})
        else: assert a == b
    assert {r['goalId'] for r in changes} == phaseIds
    amDeltas[label] = changes
assert len(rows(i['oldCards']['path'])) == 66
assert (cap / i['oldCards']['path']).read_bytes() == (ROOT / i['oldCards']['path']).read_bytes()
mcOld = read(i['oldMemoryConfig']['path']); mcNew = read(i['newMemoryConfigPath'])
assert sorted(k for k in mcOld if mcOld[k] != mcNew[k]) == ['reportPath','reviewPath']
assert mcNew['cardReviewPath'] == mcOld['cardReviewPath'] == i['oldCards']['path']
assert mcNew['visibilityScopes'] == mcOld['visibilityScopes'] and len(mcNew['visibilityScopes']) == 34
assert mcNew['visibilityScopeCoverageRequired'] is True
for view in mcNew['visibilityScopes']:
    assert (cap / view['viewPath']).read_bytes() == (ROOT / view['viewPath']).read_bytes()
acOld = read(i['oldAtomicityConfig']['path']); acNew = read(i['newAtomicityConfigPath'])
assert [k for k in acOld if acOld[k] != acNew[k]] == ['reviewPath']

originalP = {r['goalId']:r for r in rows(i['oldWholeP336']['path'])}
newP = {r['goalId']:r for r in rows(i['newAggregatePPath'])}
assert len(originalP) == len(newP) == 336
assert sum(len(r['profile']['applicationCaseBriefs']) for r in newP.values()) == 685
pChanges = []
for g,a in originalP.items():
    b = newP[g];fields = sorted(k for k in a if a[k] != b[k])
    if fields:
        assert fields == (['goalFingerprint','reviewInputFingerprint'] if g in phaseIds else ['reviewInputFingerprint'])
        assert g in phaseIds or g == i['ordinaryIncomeRequiresGoalId']
        pChanges.append({'goalId':g,'changedFields':fields,'wholeBefore':a,'wholeAfter':b})
    else: assert a == b
    assert a['profile'] == b['profile'] and a['profileFingerprint'] == b['profileFingerprint']
    assert b['status'] == 'needs_human_review' and b['reviewAuthority'] == 'ai_candidate'
assert len(pChanges) == 10

all43 = []
for item,path in zip(i['all43OldConfigReviewCriteriaBindings'],i['newPConfigPaths']):
    verify(item['old']); verify(item['review']); verify(item['criteria'])
    oldcfg = item['config']; newcfg = read(path)
    changedIds = [x['goalId'] for x in pChanges if x['goalId'] in oldcfg['scope']['goalIds']]
    changedCfgFields = sorted(k for k in oldcfg if oldcfg[k] != newcfg[k])
    assert changedCfgFields == (['reviewPath','semanticKindLedgerPath'] if changedIds else ['semanticKindLedgerPath'])
    assert newcfg['semanticKindLedgerPath'] == i['newSEMPath']
    if not changedIds: assert newcfg['reviewPath'] == oldcfg['reviewPath']
    oldLines = (ROOT / oldcfg['reviewPath']).read_text().splitlines(); newLines = (ROOT / newcfg['reviewPath']).read_text().splitlines()
    assert len(oldLines) == len(newLines)
    for a,b in zip(oldLines,newLines):
        aa=json.loads(a);bb=json.loads(b)
        assert aa['goalId'] == bb['goalId']
        if aa['goalId'] not in changedIds: assert a == b
        assert bb == newP[aa['goalId']]
    for p in [path,newcfg['reviewPath'],newcfg['reviewCriteriaPath']]:
        assert (cap / p).is_file() and not os.path.samefile(cap / p,ROOT / p)
        assert (cap / p).read_bytes() == (ROOT / p).read_bytes()
    all43.append({'old':item['old'],'new':bind(path),'oldReview':item['review'],'newReview':bind(newcfg['reviewPath']),'changedGoalIds':changedIds,'onlyConfigFields':changedCfgFields})
assert sum(bool(x['changedGoalIds']) for x in all43) == 3

reg = read(i['oldRegistry']['path']); newreg = copy.deepcopy(reg)
econ = next(r for r in newreg['subjects'] if r['subject'] == 'wirtschaftswissenschaften')
econ['semanticKindLedgerPath'] = i['newSEMPath']
econ['positiveEvidenceConfigPaths'] = i['newPConfigPaths']
econ['semanticAtomicityConfigPath'] = i['newAtomicityConfigPath']
econ['memoryReviewConfigPath'] = i['newMemoryConfigPath']
oldE = next(r for r in reg['subjects'] if r['subject'] == 'wirtschaftswissenschaften')
assert sorted(k for k in oldE if oldE[k] != econ[k]) == ['memoryReviewConfigPath','positiveEvidenceConfigPaths','semanticAtomicityConfigPath','semanticKindLedgerPath']
assert [r for r in reg['subjects'] if r['subject'] != 'wirtschaftswissenschaften'] == [r for r in newreg['subjects'] if r['subject'] != 'wirtschaftswissenschaften']
registryBinding = put(O / 'whole-registry-only-Economics-qualified-v18-SEM-P43-AM-pointers.INERT.json',newreg)
book = read(i['oldBookConfig']['path']); newbook = copy.deepcopy(book)
newbook['semanticKindLedgerPath'] = i['newSEMPath'];newbook['evidenceReviewPaths'] = [i['newAggregatePPath']]
assert sorted(k for k in book if book[k] != newbook[k]) == ['evidenceReviewPaths','semanticKindLedgerPath']
bookBinding = put(O / 'whole-Economics-book-only-qualified-v18-SEM-P336-pointers.INERT.json',newbook)
nativeP = read(O / 'actual-native43-current-v18-P336685-and-all678-officialSEM-checks.PASS.json')
assert nativeP['actualErrors'] == 0 and nativeP['actualConfigs'] == 43 and nativeP['all678OfficialSourceFingerprintsCurrent'] is True
for filename in ['actual-native-v18-P43-check.command-exit.json','actual-native-v18-atomicity-check.command-exit.json','actual-native-v18-memory-byte-exact-card-followup.command-exit.json']:
    command = read(O / filename)
    assert command['exit'] == 0 and command['stderr'] == ''
atomicStd = (ROOT / O / 'actual-native-v18-atomicity-check.stdout.txt').read_text()
assert 'Current reviewed atomic: 336' in atomicStd and 'Stale review records: 0' in atomicStd
memoryStd = (ROOT / O / 'actual-native-v18-memory-byte-exact-card-followup.stdout.txt').read_text()
assert 'Stale review records: 0' in memoryStd and 'Stale card review records: 0' in memoryStd and 'Composition visibility scopes: 34' in memoryStd
assert 'Memory-required goals without visible memory node: 0' in memoryStd
memoryGoals = [g['id'] for g in before.values() if oldKinds[g['id']]['semanticKind'] == 'memory']
assert len(memoryGoals) == 10
changedMemory = [g for g in memoryGoals if before[g] != after[g]]
assert changedMemory == ['8dcc6254-214c-5d3c-9d74-821b3e8091bd']
memoryBefore = before[changedMemory[0]]
memoryAfter = copy.deepcopy(after[changedMemory[0]])
assert memoryBefore['dimensionTags']['phase'] == 'Q' and memoryAfter['dimensionTags']['phase'] == 'SekII'
memoryAfter['dimensionTags']['phase'] = memoryBefore['dimensionTags']['phase']
assert memoryAfter == memoryBefore
decks = []
for g in memoryGoals:
    for key in ['vocabularySource','vocabularySourceEn']:
        source = before[g].get('extendedData',{}).get(key)
        if source:
            path = Path('app/public') / source.lstrip('/') if source.startswith('/data/') else Path(source.lstrip('/'))
            assert (cap / path).read_bytes() == (ROOT / path).read_bytes() and not os.path.samefile(cap / path,ROOT / path)
            decks.append(bind(path))

rowEndguards = put(O / 'actual-whole-SEM15-P10-AM9-and-unchanged-profile-card-kind-endguards.author.json',{
    'role':'TECHNICAL_AUTHOR_FOREIGN_QUALIFIED_GRAPH_FIELD_FOLLOWER_NOT_NEW_SCIENCE',
    'qualifiedScienceRootH':i['foreignRootQualifiedGraphDeltaKEEP'],
    'whole15SEMSourceFPOnlyChanges':semChanges,'other663SEMRowsWholeExact':True,
    'whole10PRecordFingerprintOnlyChanges':pChanges,'all336Profiles685CasesProfileFPStatusAuthorityMetaExact':True,
    'other326PRecordsWholeExact':True,'wholeNineAtomicityPhaseFPOnlyChanges':amDeltas['atomicity'],
    'wholeNineMemoryPhaseFPOnlyChanges':amDeltas['memory'],'other327AtomicityAndMemoryRowsWholeExact':True,
    'allOriginalDecisionReasonReviewerDateStatusFieldsExact':True,
    'unchangedCardsBinding':i['oldCards'],'all66CardsByteExact':True,'nineMemoryGoalsWholeExact':True,
    'oneMemoryNodeOnlyPreviouslyForeignQualifiedPhaseDelta':{'goalId':changedMemory[0],'wholeBefore':memoryBefore,'wholeAfter':after[changedMemory[0]],'onlyField':'dimensionTags.phase'},
    'allTenMemoryGoalIDsKindsDeckBindingsExact':True,
    'all34ViewBytesAndVisibilityScopeConfigExact':True,'actualPhysicalMemoryDeckBindings':decks,
    'semanticOntologySchemaErrors':schemaErrors,'counts':semNew['counts'],
    'all43ConfigChanges':all43,'RegistryOnlyFourEconomicsSEM_P_A_MPointers':True,
    'BookOnlyTwoEconomicsSEM_PAggregatePointers':True,'allOtherSubjectsAndPublicationFieldsWholeExact':True,
    'privatePhysicalCAN6bfa':i['wholeAfterCAN'],'activeCAN237cAndOriginalInputsUnchanged':True,
    'newScientificClosures':0,'restoredStrictBindings':0,'strictNet':0,'humanApproval':False,'activeWrites':0,
})
files = sorted(p for base in [ROOT / O,ROOT / Path(i['newSEMPath']).parent] for p in base.rglob('*') if p.is_file())
assert not [p for p in files if p.is_symlink()]
for p in files:
    if p.suffix == '.json':json.loads(p.read_text())
    elif p.suffix == '.jsonl':rows(p.relative_to(ROOT))
ignore = subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(str(p.relative_to(ROOT)) for p in files)+'\n',text=True,capture_output=True,cwd=ROOT)
assert ignore.returncode == 1 and not ignore.stdout and not ignore.stderr
manifest = put(O / 'actual-final-v18-qualified-fifteen-technical-portable-artifacts.manifest.json',{'files':[bind(p.relative_to(ROOT)) for p in files],'artifactSymlinks':0,'ignoredArtifacts':0,'activeWrites':0})
handoff = {
    'role':'TECHNICAL_AUTHOR_INERT_READY_FOR_INDEPENDENT_ROOT_FIELD_REVIEW_NO_NEW_SCIENCE',
    'wholeBeforeCAN':i['wholeBeforeCAN'],'wholeAfterCAN':i['wholeAfterCAN'],
    'qualifiedScienceRootH':i['foreignRootQualifiedGraphDeltaKEEP'],'originalGraphAuthorH':i['wholeAuthorHandoff'],
    'oldRegistry':i['oldRegistry'],'newRegistry':registryBinding,'candidateRegistry':registryBinding,
    'oldBookConfig':i['oldBookConfig'],'newBookConfig':bookBinding,'candidateBookConfig':bookBinding,
    'oldSEM':i['oldKindLedger'],'newSEM':bind(i['newSEMPath']),
    'oldPaggregate':i['oldWholeP336'],'newPaggregate':bind(i['newAggregatePPath']),
    'all43ConfigChanges':all43,
    'oldAconfig':i['oldAtomicityConfig'],'newAconfig':bind(i['newAtomicityConfigPath']),
    'oldAreview':i['oldAtomicityReview'],'newAreview':bind(i['newAtomicityReviewPath']),
    'oldMconfig':i['oldMemoryConfig'],'newMconfig':bind(i['newMemoryConfigPath']),
    'oldMreview':i['oldMemoryReview'],'newMreview':bind(i['newMemoryReviewPath']),
    'unchangedCardsBinding':i['oldCards'],'newMemoryReport':bind(i['newMemoryReportPath']),
    'actual43Pproof':bind(O / 'actual-native43-current-v18-P336685-and-all678-officialSEM-checks.PASS.json'),
    'actual43Pcommand':bind(O / 'actual-native-v18-P43-check.command-exit.json'),
    'actualAcommand':bind(O / 'actual-native-v18-atomicity-check.command-exit.json'),
    'actualMcommand':bind(O / 'actual-native-v18-memory-byte-exact-card-followup.command-exit.json'),
    'actualNative15SEMAndTenPFPAuthorCommand':bind(O / 'actual-native15-SEM-ten-P-author.command-exit.json'),
    'actualNativePrivateAPhaseFPWriter':bind(O / 'actual-native-atomicity-nine-phase-FP-writer.command-exit.json'),
    'actualNativePrivateMPhaseFPWriter':bind(O / 'actual-native-memory-nine-phase-FP-writer.command-exit.json'),
    'allFieldwiseEndguards':rowEndguards,'portableManifest':manifest,
    'immutableBeforeCopies':{'Registry':i['immutableOldRegistry'],'BookConfig':i['immutableOldBookConfig'],'SEM':i['immutableOldSEM']},
    'privatePhysicalCapsule':str(cap),'actualCounts':{'SEM':678,'semanticSourceFPsOnly':15,'P':336,'cases':685,'PChangedRows':10,'PChangedGroups':3,'A':336,'AChangedFPsOnly':9,'M':336,'MChangedFPsOnly':9,'unchangedCards':66,'memoryNodes':10,'visibilityViews':34,'nativeErrors':0,'needsHumanReview':336,'aiCandidateAuthority':336,'approved':0},
    'newScientificClosures':0,'restoredStrictBindings':0,'strictNet':0,
    'M6OrHumanReleaseClaim':False,'ScopeGraphSourceNativeReplays':0,'activeWrites':0,
    'nextStep':'Root independently reviews these field-only technical followers, integrates the exact qualified graph fields, then runs the authorized stable central/floor/book/build closing checks.'
}
final=put(O / 'actual-final-v18-fifteen-qualified-graph-SEM-P43-AM-book-technical-author.handoff.json',handoff)
print(json.dumps(final,ensure_ascii=False))
