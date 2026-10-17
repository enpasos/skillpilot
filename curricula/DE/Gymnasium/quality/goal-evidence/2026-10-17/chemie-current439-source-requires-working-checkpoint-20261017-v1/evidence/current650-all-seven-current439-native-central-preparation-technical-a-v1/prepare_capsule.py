from pathlib import Path
import os, json, hashlib, shutil, datetime, collections, time

R = Path('/home/enpasos/projects/skillpilot')
L = R/'tmp/chemie-m7-resumed-20261016/chemie-shared640-recycling-native-author-capsule-L6-v1'
Eparent = Path('/mnt/e/skillpilot-chemie-L7-20261017/paired-all-seven-packages-and-HB7f-actual-current650-technical-v1')
E = Eparent/'capsule'
O = Path(__file__).parent
C = O/'capsule'
Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-all-seven-current439-native-central-preparation-technical-a-v1')
oldcentral = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-native36-contexts-four-images-open-private-L6-technical-20261017-v1/central.current439.native36-contexts-four-images-open.private.config.json')
nsrel = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-paired-all-seven-HB7f-current650-technical-v1/INDEX.current112-original-criteria-all439-whole-records-retained.json')
baserel = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-paired-generic-SekI-and-NI-private-L6-technical-20261016-v1/base.full439.current-native-inputs.config.json')
mainrel = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
memrel = Path('curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json')
semrel = Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
qarel = Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
H = lambda b: hashlib.sha256(b).hexdigest()
pins = {}; staged = {}; holds = []

def pin(p):
    p = Path(p); data = p.read_bytes()
    row = {'path': str(p), 'sha256': H(data), 'bytes': len(data)}
    pins[str(p)] = row
    return row

def read(p):
    pin(p)
    return json.loads(Path(p).read_text())

def write(p, data):
    p = Path(p); p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.exists() and not p.is_symlink(), p
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def log(stage):
    print(stage, flush=True)
    with (O/'progress.jsonl').open('a') as f:
        f.write(json.dumps({'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'stage': stage})+'\n')

def own_dir(path):
    path = Path(path)
    if path == C:
        assert C.is_dir() and not C.is_symlink()
        return
    own_dir(path.parent)
    if path.is_symlink():
        target = path.resolve(strict=True)
        assert target.is_dir(), path
        children = list(target.iterdir())
        path.unlink(); path.mkdir()
        for child in children:
            (path/child.name).symlink_to(child, target_is_directory=child.is_dir())
    elif not path.exists():
        path.mkdir()
    assert path.is_dir() and not path.is_symlink(), path

def stage_file(source, rel, physical=True):
    source = Path(source); rel = Path(rel); target = C/rel
    assert source.is_file(), source
    own_dir(target.parent)
    sourcepin = pin(source)
    if target.is_file() and not target.is_symlink() and H(target.read_bytes()) == sourcepin['sha256']:
        staged[str(rel)] = {'source': sourcepin, 'relativePath': str(rel), 'physicalCopy': True, 'sha256': sourcepin['sha256'], 'bytes': sourcepin['bytes']}
        return target
    if target.exists() or target.is_symlink():
        assert not target.is_dir(), target
        target.unlink()
    if physical:
        shutil.copyfile(source, target)
        target.chmod(0o444)
    else:
        target.symlink_to(source.resolve(strict=True))
    assert H(target.read_bytes()) == sourcepin['sha256'], target
    staged[str(rel)] = {'source': sourcepin, 'relativePath': str(rel), 'physicalCopy': physical, 'sha256': sourcepin['sha256'], 'bytes': sourcepin['bytes']}
    return target

log('start private thin L6 tree; every changed ancestor and file owned under E')
if not C.exists():
    C.mkdir()
    for child in L.iterdir():
        (C/child.name).symlink_to(child, target_is_directory=child.is_dir())
else:
    assert C.is_dir() and not C.is_symlink() and C.parent == O
assert pin(L/oldcentral)['sha256'] == '333d21c6444a830651e1731dc69da66bc532b63871c7624ffde2fd3f3874faf0'
binding = read(Eparent/'BINDING.actual439-P-and-twenty-SEM-source-FPs.json')
assert binding['canonical']['sha256'] == 'e0af9e3dedc6db17b940ec7d4732a6c2bcced7d00f3a30df9db948b9936332a8'
assert binding['P439']['sha256'] == '8f8a2a870cca12e918838c8e4ee36f56421d0d024ab2c73f04bc07ad427e7437'
assert binding['SEM650']['sha256'] == 'ba6d1bd76424ab7ba552c3c7fa4831503f84ca1759e151d672fe399f5efc7d05'
assert binding['namespaceIndex']['sha256'] == 'c488b03a0d9fbc1a0fdc1b448839494db86b49da14cd1ca316d07bbc5cf1cc12'
for k in ['canonical','P439','SEM650','namespaceIndex']:
    expected = binding[k]; got = pin(expected['path'])
    assert got['sha256'] == expected['sha256'] and got['bytes'] == expected['bytes']
    stage_file(expected['path'], Path(expected['path']).relative_to(E))
stage_file(binding['SEM650']['path'], semrel)

log('copy byte-exact current R app/scripts app/src contracts; retain L6 public candidate assets')
for rel in ['app/scripts', 'app/src', 'contracts']:
    target = C/rel
    own_dir(target.parent)
    if target.is_symlink(): target.unlink()
    if not target.exists(): shutil.copytree(R/rel, target, symlinks=False)
    for dp, dirs, files in os.walk(target):
        for name in files:
            p = Path(dp)/name; source = R/p.relative_to(C)
            a = pin(source); assert H(p.read_bytes()) == a['sha256']
            p.chmod(0o444)
            staged[str(p.relative_to(C))] = {'source': a, 'relativePath': str(p.relative_to(C)), 'physicalCopy': True, 'sha256': a['sha256'], 'bytes': a['bytes']}
stage_file(R/'app/package.json', 'app/package.json')
stage_file(L/'package.json', 'package.json')
stage_file(R/'AGENTS.md', 'AGENTS.md')

log('stage current112 own-criteria config and disjoint whole-record fragments')
ns = read(E/nsrel)
assert len(ns['fragments']) == 112
merged = [json.loads(s) for s in Path(binding['P439']['path']).read_text().splitlines()]
mergedmap = {x['goalId']: x for x in merged}
assert len(merged) == len(mergedmap) == 439
allids = []
for fr in ns['fragments']:
    conf = read(E/fr['configRelative'])
    assert conf['reviewId'] == fr['reviewId'] and conf['reviewCriteriaPath'] == fr['criteriaPath']
    assert conf['reviewPath'] == fr['reviewPath']
    stage_file(E/fr['configRelative'], fr['configRelative'])
    stage_file(E/fr['reviewPath'], fr['reviewPath'])
    for key in ['reviewCriteriaPath']:
        rel = conf[key]
        src = next((root/rel for root in [E,L,R] if (root/rel).is_file()))
        stage_file(src, rel)
    for rel in conf.get('reviewRunManifestPaths', []):
        src = next((root/rel for root in [E,L,R] if (root/rel).is_file()))
        stage_file(src, rel)
    records = [json.loads(s) for s in (C/fr['reviewPath']).read_text().splitlines()]
    assert [x['goalId'] for x in records] == fr['goalIds']
    assert set(conf['scope']['goalIds']) == set(fr['goalIds'])
    assert all(x == mergedmap[x['goalId']] for x in records)
    allids += fr['goalIds']
assert len(allids) == len(set(allids)) == 439 and set(allids) == set(mergedmap)

log('stage exact39 chemistry views seven decks current M inputs and preserved VQA')
viewroot = Path('curricula/DE/Gymnasium/composition-views/chemie')
viewfiles = sorted((E/viewroot).glob('*.json'))
assert len(viewfiles) == 39
for p in viewfiles: stage_file(p, p.relative_to(E))
decks = sorted((E/'app/public/data').glob('*chemistry*.json'))
assert len(decks) == 7
for p in decks: stage_file(p, p.relative_to(E))
stage_file(L/qarel, qarel)
ml = read(L/memrel); me = read(E/memrel)
stage_file(E/memrel, memrel)
for key in ['reviewPath','cardReviewPath']:
    stage_file(E/me[key], me[key])
    pin(L/ml[key])
mlrecs = {x['goalId']:x for x in map(json.loads,(L/ml['reviewPath']).read_text().splitlines())}
merecs = {x['goalId']:x for x in map(json.loads,(E/me['reviewPath']).read_text().splitlines())}
assert len(mlrecs) == len(merecs) == 439
changedM = [k for k in sorted(set(mlrecs)|set(merecs)) if mlrecs.get(k) != merecs.get(k)]
changedMFields = {k: [f for f in sorted(set(mlrecs[k])|set(merecs[k])) if mlrecs[k].get(f)!=merecs[k].get(f)] for k in changedM}
if ml != me or changedM:
    holds.append({'id':'M-L6-VS-CURRENT-E-INPUT-DIFFERENCE','status':'HOLD_FOR_COORDINATED_CURRENT_M_VALIDATION','newVote':False,'differentConfigFields':[k for k in sorted(set(ml)|set(me)) if ml.get(k)!=me.get(k)],'L6Config':pin(L/memrel),'currentEConfig':pin(E/memrel),'L6M439':pin(L/ml['reviewPath']),'currentEM439':pin(E/me['reviewPath']),'L6Cards':pin(L/ml['cardReviewPath']),'currentECards':pin(E/me['cardReviewPath']),'changedMGoalIds':changedM,'changedMFields':changedMFields,'existingCurrentEInputsStagedUnchanged':True,'L6FullM439RetainedAtOriginalAddress':True,'resolution':'Existing latest E whole records/config are staged unchanged, without scientific acceptance or fresh fingerprints; root must coordinate current M gate/provenance rather than infer equality with L6.'})

qa = read(L/qarel)
canonical = read(binding['canonical']['path'])
sem = read(binding['SEM650']['path'])
atomic = {x['goalId'] for x in sem['decisions'] if x['semanticKind']=='curricularAtomic'}
assert len(atomic) == 439 == len(mergedmap) and atomic == set(mergedmap)
assert len(canonical['goals']) == 650 and len(sem['decisions']) == 650
qaMap = {x['goalId']: x for x in qa['records']}
assert atomic <= set(qaMap)
assetchecks=[]
for row in qa['records']:
    if row['visualizationState'] != 'available': continue
    for field in ['publicAssetPath','canonicalAssetPath']:
        rel = row[field]; p = L/rel
        if not p.is_file():
            holds.append({'id':'MISSING-DECLARED-V-ASSET','goalId':row['goalId'],'field':field,'path':str(p)})
            continue
        dest = stage_file(p, rel)
        actual = 'sha256:'+H(dest.read_bytes())
        entry={'goalId':row['goalId'],'currentCurricularAtomic':row['goalId'] in atomic,'field':field,'relativePath':rel,'actual':actual,'declared':row['assetSha256'],'matchesDeclared':actual==row['assetSha256'],'aiApprovedAssetSha256':row.get('aiApprovedAssetSha256')}
        assetchecks.append(entry)
        if actual != row['assetSha256']:
            holds.append({'id':'DECLARED-V-ASSET-BYTE-MISMATCH',**entry})

log('preserve current R protected subjects and floor input bytes; prepare new central registry')
old = read(L/oldcentral); chem = copy = json.loads(json.dumps(old['subjects'][0]))
assert len(chem['resolutionIndexPaths']) == 105 and len(chem['semanticAtomicityConfigPaths']) == 75
chem['semanticKindLedgerPath'] = str(Path(binding['SEM650']['path']).relative_to(E))
chem['positiveEvidenceConfigPaths'] = [f['configRelative'] for f in ns['fragments']]
central = json.loads(json.dumps(old))
central['reportId'] = 'chemie-current439-all-seven-HB7f-private-preparation-technical-20261017-v1'
central['subjects'] = [chem]
own_dir(C/Q)
write(C/Q/'central.current439.all-seven-HB7f.prepared.private.config.json',central)
main = read(R/mainrel)
protected=[]
for sub in main['subjects']:
    if sub['subject'] not in ['mathematik','physik','biologie']: continue
    for key in ['landscapePath','semanticKindLedgerPath','memoryReviewConfigPath','visualizationQaPath']:
        rel=sub[key]; stage_file(R/rel,rel); protected.append(pin(R/rel))
    m=read(R/sub['memoryReviewConfigPath'])
    for key in ['reviewPath','cardReviewPath']:
        if m.get(key) and (R/m[key]).is_file():stage_file(R/m[key],m[key]);protected.append(pin(R/m[key]))
for sub in main['subjects']:
    if sub['subject']=='chemie': sub.clear();sub.update(chem)
oldmain=read(R/mainrel)
assert [s for s in main['subjects'] if s['subject']!='chemie'] == [s for s in oldmain['subjects'] if s['subject']!='chemie']
target=C/mainrel; own_dir(target.parent)
if target.exists() or target.is_symlink():target.unlink()
write(target,main)
for rel in ['app/scripts/config/curriculum-maturity-floor-policy.json','docs/qa-ci/status/curriculum-quality-status.json','docs/qa-ci/status/curriculum-quality-status.md']:
    if (R/rel).is_file(): stage_file(R/rel,rel);protected.append(pin(R/rel))

log('inventory105 original D indices plus declared resolutions round artifacts and75 A ledgers; no checks executed')
deps={}; missing=[]
def dep(rel,base=L,kind='declared dependency'):
    p=base/rel
    if p.is_file():
        row=pin(p);assert (C/rel).is_file(),str(C/rel)
        assert H((C/rel).read_bytes())==row['sha256'],str(C/rel)
        deps[str(rel)]={'relativePath':str(rel),'kind':kind,'source':row}
        return p
    missing.append({'relativePath':str(rel),'kind':kind,'source':str(p)})
    return None
for rel in chem['semanticAtomicityConfigPaths']:
    p=dep(rel,kind='A config')
    if p:
        x=read(p);dep(x['reviewPath'],kind='A whole records')
for rel in chem['resolutionIndexPaths']:
    p=dep(rel,kind='D index')
    if not p:continue
    x=read(p); parent=Path(rel).parent
    for ent in x.get('resolutions',[]):
        for k in ['resolutionPath','humanAttestationPath']:
            if ent.get(k):dep(os.path.normpath(parent/ent[k]),kind='D '+k)
    for group in x.get('groups',[]):
        if group.get('dualSummaryPath'):dep(os.path.normpath(parent/group['dualSummaryPath']),kind='D dual summary')
        gd=Path(os.path.normpath(parent/group.get('artifactDirectory',group['groupId'])))
        for rnd in ['round-a','round-b']:
            root=L/gd/rnd
            if not root.is_dir():
                missing.append({'relativePath':str(gd/rnd),'kind':'D round directory'})
                continue
            for dp,dirs,files in os.walk(root,followlinks=True):
                # Round trees contain exact review bundle/campaign/batch/results inputs.
                for name in files:
                    p=Path(dp)/name
                    dep(p.relative_to(L),kind='D original round artifact')
if missing:holds.append({'id':'DECLARED-D-A-DEPENDENCY-PRESENCE','status':'HOLD','missing':missing})
write(O/'DEPENDENCIES.exact105D75A-source-byte-pins.no-validation.json',{'counts':{'DIndices':105,'AConfigs':75,'uniqueDeclaredFiles':len(deps)},'files':list(deps.values()),'missing':missing,'scientificOrNativeValidationPerformed':False})

base=read(L/baserel)
base['bookId']='chemie-current439-all-seven-HB7f-current-full-private-20261017-v1'
base['semanticKindLedgerPath']=str(Path(binding['SEM650']['path']).relative_to(E))
base['evidenceReviewPaths']=[str(Path(binding['P439']['path']).relative_to(E))]
base['outputPath']=str(Q/'book-model.full439.current-all-seven-HB7f.private.json')
write(C/Q/'base.full439.current-all-seven-HB7f.private.config.json',base)
stage_file(L/base['compositionViewPath'],base['compositionViewPath'])
write(O/'CHECK.prepared439-P112-V-assets-M-input-differences-and-protected.json',{'role':'Preparation and structural presence/byte checks only; zero new votes and no Central report','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonical650':pin(C/chem['landscapePath']),'SEM650':pin(C/chem['semanticKindLedgerPath']),'current439GoalIds':sorted(atomic),'current439GoalCount':len(atomic),'P112FragmentCount':len(ns['fragments']),'P439DisjointExactWholeRecords':True,'D105ExactSelectionUnchanged':chem['resolutionIndexPaths']==old['subjects'][0]['resolutionIndexPaths'],'A75ExactSelectionUnchanged':chem['semanticAtomicityConfigPaths']==old['subjects'][0]['semanticAtomicityConfigPaths'],'supersessions214Unchanged':chem['resolutionSupersessions']==old['subjects'][0]['resolutionSupersessions'],'withdrawals7Unchanged':chem['resolutionWithdrawals']==old['subjects'][0]['resolutionWithdrawals'],'semanticRetirements3Unchanged':chem['resolutionSemanticRetirements']==old['subjects'][0]['resolutionSemanticRetirements'],'VQARows':len(qa['records']),'VCurrent439Present':True,'assetChecks':assetchecks,'protectedCurrentRInputs':protected,'nonChemistryDefaultSubjectConfigBodiesExactCurrentR':True,'MInputsAreExistingCurrentEAndUnmodified':True,'holds':holds,'privateThinTreeNotPortableExport':True,'copyOnWriteRequiredForEveryFurtherMutation':True,'modelNotYetRun':True,'CentralReportRun':False,'NativeReviewRun':False,'M7':False,'HumanApproval':False})
write(O/'MANIFEST.prepared-capsule-staged-inputs.json',{'capsuleRoot':str(C),'L6ReadOnlyBase':str(L),'currentSourceCapsule':str(E),'stagedFiles':list(staged.values()),'allPinnedReadInputs':list(pins.values()),'topLevelUnchangedInputsUsePrivateReadOnlyL6Aliases':True,'stockRDirectoriesByteExact':['app/scripts','app/src','contracts'],'allOwnedMutationAncestorsPhysicallyInsideNewCapsule':True,'noOldInputMutation':True})
write(O/'PREPARATION.ready-for-exactly-one-model-run.json',{'capsuleRoot':str(C),'goalBookConfigRelative':str(Q/'base.full439.current-all-seven-HB7f.private.config.json'),'centralConfigRelative':str(Q/'central.current439.all-seven-HB7f.prepared.private.config.json'),'modelRelative':base['outputPath'],'stockEntry':'app/scripts/buildGoalBookModel.ts','newVotes':0,'CentralReportRun':False,'holds':holds,'copyOnWriteRequired':True})
log('preparation complete; model not invoked; see explicit HOLD input differences')
