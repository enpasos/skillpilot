# SPDX-License-Identifier: Apache-2.0
"""Finite current358 packaging and read-only byte verification, without QA runs."""
from pathlib import Path, PureWindowsPath
import argparse, ast, collections, datetime, hashlib, importlib.util, json, os, subprocess, sys
sys.dont_write_bytecode=True
OWN=Path(__file__).resolve().parent
REPO=next(p for p in OWN.parents if (p/'AGENTS.md').is_file() and (p/'app').is_dir())
E15=OWN.parent
INTEGRATION=E15/'chemie-carbonyl15-equilibrium16-current422-bounded-inactive-integration-technical-20261015-v1'
REFERENCE=E15/'chemie-energy18-current422-stable-checkpoint-root-20261015-v1'
SELECTOR=OWN/'FINAL.finite-current358-checkpoint.json'
SEAL=OWN/'FILES.finite-current358-checkpoint.seal.json'

def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def load(p):return json.loads(p.read_text())
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
    return 'sha256:'+h.hexdigest()
def ref(p):return {'path':p.relative_to(REPO).as_posix(),'sha256':digest(p),'bytes':p.stat().st_size}
def repo_path(raw):
    p=Path(raw);assert not p.is_absolute() and not PureWindowsPath(raw).is_absolute() and '..' not in p.parts,raw
    return REPO/p
def verify_ref(row):
    p=repo_path(row['path']);assert p.is_file() and p.resolve(strict=True).is_relative_to(REPO),p
    assert digest(p)==row['sha256'],p
    if 'bytes' in row:assert p.stat().st_size==row['bytes'],p
    return p
def physical_entries(root):
    files=[];links=[]
    for parent,dirs,names in os.walk(root,followlinks=False):
        parent=Path(parent)
        for name in list(dirs):
            p=parent/name
            if p.is_symlink():links.append(p);dirs.remove(name)
        for name in names:
            p=parent/name
            if p.is_symlink():links.append(p)
            else:assert p.is_file(),p;files.append(p)
    return sorted(files),sorted(links)
def link_inventory(p):
    target=os.readlink(p);assert not os.path.isabs(target) and not PureWindowsPath(target).is_absolute(),p
    resolved=p.resolve(strict=True);assert resolved.is_relative_to(REPO),p
    row={'path':p.relative_to(REPO).as_posix(),'kind':'directory_symlink' if resolved.is_dir() else 'file_symlink',
         'relativeTarget':target,'linkTextSha256':'sha256:'+hashlib.sha256(os.fsencode(target)).hexdigest(),
         'resolvedRepositoryPath':resolved.relative_to(REPO).as_posix()}
    if resolved.is_dir():
        files,links=physical_entries(resolved);assert not links,(p,links)
        row['actualTargetFiles']=[ref(q) for q in files]
    else:row['actualTargetFile']=ref(resolved)
    return row
def parse_file(p,counts):
    if p.suffix=='.json':load(p);counts['JSONfiles']+=1
    elif p.suffix=='.jsonl':
        text=p.read_text();assert not text or text.endswith('\n'),p
        for line in text.splitlines():
            if line.strip():json.loads(line);counts['JSONLrows']+=1
        counts['JSONLfiles']+=1
    elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));counts['PythonAST']+=1
def chemistry(report):
    rows=[r for r in report['subjects'] if r['subject']=='chemie'];assert len(rows)==1;return rows[0]
def stock_symlink_check():
    p=REPO/'scripts/validate_schemas.py';spec=importlib.util.spec_from_file_location('stock_schema_symlink_only',p)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    errors=module.curriculum_symlink_errors(REPO);assert errors==[],errors
    return {'checkedAtUTC':utc(),'stockHelper':ref(p),'normalcurriculum_symlink_errors':errors,
            'onlyFunctionCalled':'curriculum_symlink_errors','fullSchemaRun':False,'newNormalOrCentralRuns':0}

def existing_seal_audit(packages):
    checked=[];seal_files=[];run_bindings=[]
    all_rows={r['path']:r for p in packages for r in p['regularFiles']}
    sha_paths=collections.defaultdict(list)
    for r in all_rows.values():sha_paths[r['sha256']].append(r['path'])
    def reference_rows(value,location=''):
        if isinstance(value,dict):
            raw=value.get('path',value.get('file'))
            sha=value.get('sha256')
            if isinstance(raw,str) and isinstance(sha,str) and len(sha.removeprefix('sha256:'))==64:
                yield location,raw,sha if sha.startswith('sha256:') else 'sha256:'+sha,value.get('bytes')
            for k,v in value.items():yield from reference_rows(v,location+'/'+k)
        elif isinstance(value,list):
            for i,v in enumerate(value):yield from reference_rows(v,location+'/'+str(i))
    for package in packages:
        root=repo_path(package['root'])
        for row in package['regularFiles']:
            p=repo_path(row['path'])
            if p.suffix=='.json' and 'seal' in p.name.lower():
                value=load(p);seal_files.append(row)
                for location,raw,sha,size in reference_rows(value):
                    q=Path(raw)
                    assert not q.is_absolute() and not PureWindowsPath(raw).is_absolute(),(p,raw)
                    candidates=[REPO/q,root/q,p.parent/q]
                    found=[c for c in candidates if c.is_file() and c.resolve(strict=True).is_relative_to(REPO) and digest(c)==sha and (size is None or c.stat().st_size==size)]
                    assert found,(p,location,raw,sha,size)
                    chosen=found[0]
                    checked.append({'seal':p.relative_to(REPO).as_posix(),'jsonPointer':location,'boundFile':ref(chosen)})
            if p.suffix=='.json':
                v=load(p)
                if isinstance(v,dict) and all(k in v for k in ['runId','outputDigest','completedAt','campaignId']):
                    targets=sha_paths.get(v['outputDigest'],[])
                    assert targets,(p,v['outputDigest'])
                    run_bindings.append({'run':row,'runId':v['runId'],'completedAt':v['completedAt'],
                       'exactOutputDigest':v['outputDigest'],'matchingWholeOutputFiles':targets})
    return {'role':'Existing seals and genuine run outputs verified by exact bytes; no rerun or scientific assessment',
       'checkedAtUTC':utc(),'sealFiles':seal_files,'sealCount':len(seal_files),'declaredFileBindings':checked,
       'declaredFileBindingCount':len(checked),'originalAndCopiedRunOutputBindings':run_bindings,'runManifestCount':len(run_bindings),
       'newScientificVotes':0,'normalRunsExecuted':0,'centralRunsExecuted':0}

def actual_state_audit():
    selector=INTEGRATION/'INPUTS.final-current358-inactive-integration.selector.json'
    seal=INTEGRATION/'FILES.finite-current358-integration.seal.json'
    assert digest(selector)=='sha256:4efa5b82ca948749180821715e8435862b5c458f4ad6d23cce778857af726ca5'
    selected=load(selector);seald=load(seal)
    for r in seald['files']:verify_ref(r)
    assert seald['fileCount']==len(seald['files'])
    assert seald['selector']==ref(selector)
    report_path=verify_ref(selected['actualCentralReport']);report=load(report_path);current=chemistry(report)
    command=load(verify_ref(selected['actualCentralCommand']))
    net_path=verify_ref(selected['exactNetAndScienceContext']);net=load(net_path)
    old_path=verify_ref(net['baselineReport']);old=chemistry(load(old_path))
    before=set(old['strictCompleteGoalIds']);after=set(current['strictCompleteGoalIds']);added=sorted(after-before)
    assert len(before)==old['strictComplete']==338 and len(after)==current['strictComplete']==358
    assert before<=after and len(added)==20 and net['newScientificStrictGoalIds']==added
    assert net['old338RetainedGoalIds']==sorted(before) and net['lostGoalIds']==net['outsideAssigned31NewGoalIds']==[]
    assert set(old['currentGoalIds'])==set(current['currentGoalIds']) and len(current['currentGoalIds'])==current['denominator']==422
    assert current['remaining']==64 and report['blockingIssueCount']==0 and current['issues']==[]
    assert len(current['requiredChecks'])==6 and all(x['status']=='pass' for x in current['requiredChecks'])
    assert current['gates']==selected['gates']=={'currentDescriptionResolutions':362,'currentPositiveEvidenceProfiles':388,
      'currentSemanticAtomicityDecisions':393,'currentMemoryReviewDecisions':422,'currentVisualizationQaRecords':418}
    assert command['exitCode']==0 and command['actualFullCentralRunCountThisPacket']==1 and command['elapsedSeconds']==44.907
    assert command['stdoutSha256']==digest(report_path)
    reference=load(REFERENCE/'FINAL.finite-current422-checkpoint.json')
    protected_before=reference['protectedActiveInputs']['before'];protected=load(verify_ref(protected_before))
    assert len(protected['files'])==697
    for r in protected['files']:verify_ref(r)
    protected_after=load(verify_ref(selected['protected697After']))
    assert protected_after['protectedFileCount']==697 and protected_after['allExact'] and protected_after['changedPaths']==[] and protected_after['activeWrites']==0
    p_holds=net['scienceVersusBindings']['genuinePDesignGapGoalIdsNotSelected'];assert len(p_holds)==4 and not(set(p_holds)&after)
    d_indexes=[INTEGRATION.parent/'chemie-carbonyl15-native-paired12-with-three-open-technical-20261015-v1/native15/resolution-index.json',
      INTEGRATION.parent/'chemie-equilibrium16-final-native-original-pair-technical-20261015-v1/native16/resolution-index.json']
    d_holds=sorted({g for p in d_indexes for g in load(p)['deferredGoalIds']});assert len(d_holds)==9 and not(set(d_holds)&after)
    return {'schemaVersion':1,'role':'Read-only verification of the already completed actual inactive358 report and protections',
      'checkedAtUTC':utc(),'integrationSelector':ref(selector),'integrationSeal':ref(seal),'currentCentralReport':ref(report_path),
      'actualCentralCommand':selected['actualCentralCommand'],'baseline338Report':ref(old_path),'exactNetComparison':ref(net_path),
      'previousStrict':338,'currentStrict':358,'denominator':422,'remaining':64,'percentage':current['percentage'],
      'newStrictGoalIds':added,'all338RetainedGoalIds':sorted(before),'lostGoalIds':[],
      'gates':current['gates'],'requiredChecksPass':6,'issues':[],'blockingIssueCount':0,
      'alreadyCompletedCentralRuns':1,'alreadyCompletedCentralElapsedSeconds':44.907,'newCentralRunsByWrapper':0,
      'protectedBefore':protected_before,'protectedAfter':selected['protected697After'],'actual697ProtectedFilesRehashed':697,
      'protectedM7Baselines':protected_after['protectedM7Baselines'],'activeChemistry':protected_after['chemistryActive'],
      'originalPDesignGapGoalIdsUnselected':p_holds,'originalDDeferredGoalIds':d_holds,
      'sourceCourseAndPracticalHoldsRemain':net['holds'],'sourceScienceSelections':net['originalScienceSelections'],
      'activeIntegration':False,'HumanApproval':False,'humanOrLabTrials':False,'M7Grant':False,'newScientificVotes':0}

def build():
    assert not SELECTOR.exists() and not SEAL.exists()
    frozen_path=OWN/'checks/ROOTS.parent-start-frozen-exact25.actual.json';frozen=load(frozen_path)
    assert frozen['rootCount']==len(frozen['roots'])==25 and len(set(frozen['roots']))==25
    initial=load(OWN/'checks/ROOTS.start-frozen-current358-explicit-inputs.json')
    excluded=sorted(set(initial['selectedInputRootPaths'])-set(frozen['roots']))
    assert len(excluded)==1 and not(set(frozen['roots'])-set(initial['selectedInputRootPaths']))
    dump(OWN/'checks/ROOTS.exact25-vs-unselected26.delta.json',{
      'role':'Exact parent frozen root selection supersedes only preparatory root-list selection; old metadata preserved',
      'parentFrozenList':ref(frozen_path),'previousUnselectedPreparation':ref(OWN/'checks/ROOTS.start-frozen-current358-explicit-inputs.json'),
      'selectedRootCount':25,'excludedFromInitial26':excluded,'newRootsAdded':[],
      'exclusionReason':'Already-existing carbonyl-three approved-image technical package is outside parent exact25 untracked root set',
      'noGitMutation':True,'noScientificChange':True})
    packages=[];media=[];counts={'JSONfiles':0,'JSONLfiles':0,'JSONLrows':0,'PythonAST':0}
    for raw in frozen['roots']:
        root=repo_path(raw);files,links=physical_entries(root)
        rows=[]
        for p in files:
            before=p.stat();r=ref(p);after=p.stat();assert (before.st_size,before.st_mtime_ns)==(after.st_size,after.st_mtime_ns)
            rows.append(r);parse_file(p,counts)
            if p.suffix.lower() in ['.html','.pdf']:media.append(r)
        linked=[link_inventory(p) for p in links]
        assert physical_entries(root)==(files,links)
        packages.append({'root':raw,'regularFileCount':len(rows),'regularBytes':sum(x['bytes'] for x in rows),
          'regularFiles':rows,'relativeDirectoryOrFileSymlinks':linked,'symlinkCount':len(linked)})
    inventory={'schemaVersion':1,'role':'Complete finite physical file inventory of exact25 frozen new chemistry roots; candidate archive is not acceptance',
       'inventoriedAtUTC':utc(),'frozenRootList':ref(frozen_path),'rootCount':25,'packages':packages,
       'regularFileCount':sum(p['regularFileCount'] for p in packages),'regularBytes':sum(p['regularBytes'] for p in packages),
       'relativeSymlinkCount':sum(p['symlinkCount'] for p in packages),'parseCounts':counts,
       'fullRepositoryCopied':False,'sourceRootsModified':False}
    dump(OWN/'checks/INVENTORY.exact25-physical-files-and-relative-directory-links.json',inventory)
    dump(OWN/'checks/CHECK.existing-seals-and-original-run-bindings.actual.json',existing_seal_audit(packages))
    dump(OWN/'checks/CHECK.actual358-net20-697-protected.actual.json',actual_state_audit())
    dump(OWN/'checks/CHECK.stock-symlink-helper.actual.json',stock_symlink_check())
    # Metadata-only ignore lookup. It neither stages nor changes files or Git state.
    paths=[r['path'] for r in media]
    argv=['git','check-ignore','--no-index','-z','--stdin']
    start=utc();result=subprocess.run(argv,cwd=REPO,input=b''.join(os.fsencode(s)+b'\0' for s in paths),capture_output=True);end=utc()
    assert result.returncode in [0,1],result.stderr.decode()
    ignored={os.fsdecode(x) for x in result.stdout.split(b'\0') if x}
    dump(OWN/'checks/HTML-PDF.actual-physical-payloads-and-targeted-force-add-candidates.json',{
       'role':'All actual physical HTML/PDF preserved; currently ignored entries are candidates for parent targeted force-add only',
       'actualFileCount':len(media),'actualFiles':media,'currentlyIgnoredFileCount':len(ignored),
       'currentlyIgnoredFiles':[r for r in media if r['path'] in ignored],
       'readOnlyIgnoreLookup':{'argv':argv,'startedAtUTC':start,'completedAtUTC':end,'exitCode':result.returncode,'stderr':result.stderr.decode()},
       'stagingOrGitMutationsExecuted':0,'virtualDirectoryAliasPathsNotDuplicated':True})
    state=load(OWN/'checks/CHECK.actual358-net20-697-protected.actual.json')
    unselected_roots=[E15/x for x in ['chemie-equilibrium-four-description-bounds-author-20261015-v1',
      'chemie-equilibrium-four-material-gap-remediation-author-20261015-v1',
      'chemie-carbonyl-two-final-wording-and-visual-remediation-author-root-20261015-v1',
      'chemie-carbonyl-two-final-context-independent-V-20261015-v1',
      'chemie-carbonyl-two-final-wording-memory-informed-20261015-v1']]
    dump(SELECTOR,{'schemaVersion':1,'createdAtUTC':utc(),'role':'Finite stable inactive358 checkpoint wrapper; existing actual report only',
       'root':OWN.relative_to(REPO).as_posix(),'frozenExactInputRootList':ref(frozen_path),'packageCount':25,'capturedInputRootPaths':frozen['roots'],
       'fullInputInventory':ref(OWN/'checks/INVENTORY.exact25-physical-files-and-relative-directory-links.json'),
       'inputRegularFileCount':inventory['regularFileCount'],'inputRegularBytes':inventory['regularBytes'],
       'physicalRelativeDirectorySymlinkCount':inventory['relativeSymlinkCount'],
       'integrationSelector':state['integrationSelector'],'integrationSeal':state['integrationSeal'],
       'reference338Wrapper':ref(REFERENCE/'FINAL.finite-current422-checkpoint.json'),
       'reference338WrapperSeal':ref(REFERENCE/'FILES.finite-checkpoint.seal.json'),
       'currentCentralReport':state['currentCentralReport'],'alreadyExecutedCentralCommand':state['actualCentralCommand'],
       'exactNetComparison':state['exactNetComparison'],'previousStrict':338,'currentStrict':358,'currentDenominator':422,
       'remaining':64,'percentage':state['percentage'],'netNewScientificCompletionsFromBoundExistingEvidence':20,
       'all338Retained':True,'lost':0,'gates':state['gates'],'requiredChecksPass':6,'issues':[],
       'exactOriginalSealsAndRunBindings':ref(OWN/'checks/CHECK.existing-seals-and-original-run-bindings.actual.json'),
       'actualStateAndProtected697':ref(OWN/'checks/CHECK.actual358-net20-697-protected.actual.json'),
       'stockSymlinkCheck':ref(OWN/'checks/CHECK.stock-symlink-helper.actual.json'),
       'allPhysicalHTMLPDFAndIgnoredCandidates':ref(OWN/'checks/HTML-PDF.actual-physical-payloads-and-targeted-force-add-candidates.json'),
       'originalPDesignGapGoalIdsUnselected':state['originalPDesignGapGoalIdsUnselected'],'originalDDeferredGoalIds':state['originalDDeferredGoalIds'],
       'archivedSuccessorRootsUnselectedByCurrent358':[p.relative_to(REPO).as_posix() for p in unselected_roots],
       'candidateScope':'Author4 wording/material successors are unreviewed; CarbonylAuthor2 and its genuine V2/M2 candidate reviews are archived but unselected and not counted in current358',
       'activeChemistry':'231/402 M6 unchanged','protectedMachineM7Baseline':state['protectedM7Baselines'],
       'newScientificVotes':0,'newQAOrNormalRuns':0,'newCentralRunsByCheckpoint':0,'fullSchemaRunByCheckpoint':False,
       'gitMutationsByCheckpoint':0,'activeWrites':0,'originalRootsModified':False,'activeIntegration':False,
       'sourceCourseApproval':False,'HumanApproval':False,'humanOrLabTrials':False,'M7Grant':False,
       'parentOwnsDocsWholeSchemaGitAndIntegration':True,'finite':True})
    print(json.dumps({'rootCount':25,'inputRegularFileCount':inventory['regularFileCount'],'inputRegularBytes':inventory['regularBytes'],
      'relativeSymlinks':inventory['relativeSymlinkCount'],'mediaFiles':len(media),'ignoredMediaFiles':len(ignored),'actualStrict':358,'remaining':64},indent=2))

def verify(preseal=False):
    data=load(SELECTOR);frozen=load(verify_ref(data['frozenExactInputRootList']))
    inventory=load(verify_ref(data['fullInputInventory']))
    assert data['packageCount']==inventory['rootCount']==frozen['rootCount']==25
    assert [p['root'] for p in inventory['packages']]==data['capturedInputRootPaths']==frozen['roots']
    counts={'JSONfiles':0,'JSONLfiles':0,'JSONLrows':0,'PythonAST':0}
    for package in inventory['packages']:
        root=repo_path(package['root']);files,links=physical_entries(root)
        assert {p.relative_to(REPO).as_posix() for p in files}=={r['path'] for r in package['regularFiles']},root
        assert {p.relative_to(REPO).as_posix() for p in links}=={r['path'] for r in package['relativeDirectoryOrFileSymlinks']},root
        for r in package['regularFiles']:parse_file(verify_ref(r),counts)
        for r in package['relativeDirectoryOrFileSymlinks']:assert link_inventory(repo_path(r['path']))==r
    assert counts==inventory['parseCounts']
    for k,v in data.items():
        if isinstance(v,dict) and all(x in v for x in ['path','sha256','bytes']):verify_ref(v)
    state=load(verify_ref(data['actualStateAndProtected697']));assert state['currentStrict']==358 and state['requiredChecksPass']==6
    for row in load(verify_ref(state['protectedBefore']))['files']:verify_ref(row)
    seals=load(verify_ref(data['exactOriginalSealsAndRunBindings']))
    for r in seals['sealFiles']:verify_ref(r)
    for r in seals['declaredFileBindings']:verify_ref(r['boundFile'])
    for r in seals['originalAndCopiedRunOutputBindings']:
        verify_ref(r['run'])
        for p in r['matchingWholeOutputFiles']:assert digest(repo_path(p))==r['exactOutputDigest']
    symlink=stock_symlink_check()
    own_files,own_links=physical_entries(OWN);assert own_links==[]
    for p in own_files:parse_file(p,collections.defaultdict(int))
    if not preseal:
        seal=load(SEAL);assert len(seal['files'])==seal['fileCount']
        assert {r['path'] for r in seal['files']}=={p.relative_to(REPO).as_posix() for p in own_files if p!=SEAL}
        for r in seal['files']:verify_ref(r)
    print(json.dumps({'role':'Actual read-only finite358 wrapper verification; no QA or full schema',
       'checkedAtUTC':utc(),'inputRoots':25,'inputRegularFiles':inventory['regularFileCount'],'inputRegularBytes':inventory['regularBytes'],
       'relativeDirectorySymlinks':inventory['relativeSymlinkCount'],'inputParseCounts':counts,
       'existingSealFilesVerified':seals['sealCount'],'existingSealFileBindingsVerified':seals['declaredFileBindingCount'],
       'existingOriginalAndCopiedRunOutputBindings':seals['runManifestCount'],'strict':358,'denominator':422,'old338Retained':True,'newIds':20,'remaining':64,
       'protectedActiveFilesExact':697,'actualRepositorySymlinkErrors':symlink['normalcurriculum_symlink_errors'],
       'ownSealVerified':not preseal,'newScientificVotes':0,'newQAOrNormalRuns':0,'newCentralRuns':0,'fullSchemaRun':False,
       'gitMutations':0,'activeIntegration':False,'HumanApproval':False,'M7Grant':False},indent=2))

def seal():
    assert SELECTOR.exists() and not SEAL.exists()
    files,links=physical_entries(OWN);assert not links
    rows=[ref(p) for p in files]
    dump(SEAL,{'schemaVersion':1,'sealedAtUTC':utc(),'role':'Finite stable inactive358 technical checkpoint; self excluded',
      'selector':ref(SELECTOR),'pathBase':'repository root','fileCount':len(rows),'totalBytes':sum(r['bytes'] for r in rows),'files':rows,
      'newScientificVotes':0,'newQAOrNormalRuns':0,'newCentralRuns':0,'gitMutations':0,'activeIntegration':False,'HumanApproval':False,'M7Grant':False})
    for r in rows:verify_ref(r)
    assert physical_entries(OWN)==(files+[SEAL] if False else sorted(files+[SEAL]),[])
    print(json.dumps({'selector':ref(SELECTOR),'seal':ref(SEAL),'wrapperFilesExcludingSeal':len(rows),'wrapperBytesExcludingSeal':sum(r['bytes'] for r in rows)},indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['build','verify','seal']);parser.add_argument('--preseal',action='store_true');args=parser.parse_args()
    if args.mode=='build':build()
    elif args.mode=='verify':verify(args.preseal)
    else:seal()
