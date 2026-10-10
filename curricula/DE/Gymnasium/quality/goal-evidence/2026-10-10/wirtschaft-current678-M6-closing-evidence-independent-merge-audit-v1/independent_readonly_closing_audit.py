from pathlib import Path
import collections, hashlib, json, subprocess, datetime, re

R = Path('/home/enpasos/projects/skillpilot')
O = Path(__file__).resolve().parent
B = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
L = B / 'wirtschaft-current678-M6-stable-layerA-book-build-root-v1'
C = B / 'wirtschaft-current678-M6-final-central-after-qualified-views-inventory-root-v2'
K = B / 'wirtschaft-current678-M6-commit-ready-machine-checkpoint-root-v1/actual-current678-M6-local-commit-ready-machine-checkpoint.receipt.json'
checks, guards = [], {}

def read(p): return json.loads(Path(p).read_text())
def path(p): return Path(p) if Path(p).is_absolute() else R / p
def binding(p):
    p = path(p)
    data = p.read_bytes()
    return {'path': str(p.relative_to(R)) if p.is_relative_to(R) else str(p), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def check(name, truth, detail=None):
    checks.append({'check': name, 'pass': bool(truth), 'detail': detail})
def verify(b, lane):
    p = path(b['path'])
    a = binding(p)
    ok = a['sha256'] == b['sha256'].removeprefix('sha256:') and ('bytes' not in b or a['bytes'] == b['bytes'])
    check(lane + ': ' + b['path'], ok)
    guards[str(p)] = a
    return a
def put(name, obj):
    p = O / name
    if p.exists(): raise RuntimeError('Independent artifact already exists: ' + str(p))
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return binding(p)
def git(*args): return subprocess.check_output(['git', *args], cwd=R)

checkpoint = read(K)
check('Root checkpoint exact sealed SHA', binding(K)['sha256'] == '6775aba68d90242d196bd093a082d7425905b2f25b0119c69701b0be17810557')
start_head, start_origin = git('rev-parse', 'HEAD').decode().strip(), git('rev-parse', 'origin/main').decode().strip()
start_tracked_status = git('status', '--porcelain=v1', '-uno')
for b in checkpoint['currentActiveInputGuards']: verify(b, 'Current closing input')
for p, sha in checkpoint['finalCentralGuardedInputs'].items(): verify({'path': p, 'sha256': sha}, 'Final central input')

stage_dirs = {
 'v3': 'after-qualified-fifteen-graph-deltas-and-local-font-repair-run-v3',
 'v4': 'book-authentic-local-poppler-environment-successor-run-v4',
 'v5': 'unaffected-six-layerA-stages-additive-run-v5',
 'v6': 'remaining-eight-layerA-after-qualified-national-views-and-inventory-run-v6',
 'v7': 'deep-understanding-regression-after-independent-test-scope-review-run-v7',
}
selected = {
 'v3': ['graph', 'view-filters', 'source-landscape-registry'],
 'v5': ['runtime-landscape-schemas-and-portable-curriculum-links', 'goal-IDs-UUID', 'competency-wording', 'goal-visualization-assets'],
 'v6': ['composition-views', 'composition-projection-roles', 'course-level-mapping-consistency', 'source-coverage-regression-and-audit', 'economics-semantic-atomicity', 'economics-memory-cards-and34-views', 'ai-transparency-inventory'],
 'v7': ['deep-understanding-rollout-contract-regression'],
 'v4': ['goal-book-full-pipeline-including-cached-publications', 'application-build-local-only'],
}
stages = []
for version, labels in selected.items():
    directory = L / stage_dirs[version]
    bundle_path = directory / 'actual-current678-M6-stable-layerA-book-build.machine-bundle.receipt.json'
    bundle = read(bundle_path)
    for b in bundle.get('inputGuards', []):
        # v3/v4/v5 preceded the explicitly reviewed national-view and inventory successors.
        # Only their common CAN/registry/SEM/book inputs are claimed current here.
        if 'composition-views/wirtschaft/' not in b['path'] and b['path'] != 'docs/legal/ai-transparency-inventory.json': verify(b, version + ' common exact inputs')
    helper_path = directory / 'actual-executed-stable-native-bundle-helper.py'
    helper = helper_path.read_text()
    check(version + ' recorded helper uses actual subprocess execution', 'subprocess.run(argv' in helper and 'returncode' in helper)
    check(version + ' no force-render invocation', "'--force'" not in helper and '"--force"' not in helper)
    for label in labels:
        p = directory / (label + '.actual-command-exit.json')
        row = read(p)
        check(version + '/' + label + ' actual exit zero', row['actualExitCode'] == 0)
        check(version + '/' + label + ' positive measured duration and real cwd', row['seconds'] > 0 and Path(row['cwd']).resolve() in [R, R/'app'])
        verify(row['stdout'], version + '/' + label + ' full stdout')
        verify(row['stderr'], version + '/' + label + ' full stderr')
        fullout, fullerr = path(row['stdout']['path']).read_text(), path(row['stderr']['path']).read_text()
        stages.append({'stageGroup': 'Book/application' if version == 'v4' else 'Layer A', 'version': version, 'receipt': binding(p), 'bundle': binding(bundle_path), 'executedHelper': binding(helper_path), **row, 'actualStdoutLines': len(fullout.splitlines()), 'actualStderrLines': len(fullerr.splitlines()), 'fullLogsRead': True})
        if label == 'composition-views': check('Composition 335 views: zero errors, 2261 warnings retained', '0 error' in fullout and '2261 warning' in fullout and '335' in fullout)
        if label == 'deep-understanding-rollout-contract-regression': check('Deep regression explicitly protects all current denominators', all(x in fullout for x in ['strict 5-gate intersection', 'fail-closed ownership', 'Math=807/Physics=478/Economics=336']))
        if version == 'v4' and label.startswith('goal-book'): check('Normal pipeline built actual Economics 336 and verifies 5 cached publications', 'de-gym-wirtschaftswissenschaften-bundesweit' in fullout and '336' in fullout)

for label in ['source-inventory-regression', 'central', 'floors']:
    p = C / (label + '.actual-command-exit.json')
    row = read(p)
    check('Final central/' + label + ' actual exit zero', row['exitCode'] == 0)
    check('Final central/' + label + ' actual Node20 tsx command', row['command'][0].endswith('/node/bin/node') and row['command'][1].endswith('/tsx/dist/cli.mjs'))
    out, err = binding(row['stdout']), binding(row['stderr'])
    guards[str(path(row['stdout']))] = out; guards[str(path(row['stderr']))] = err
    textout, texterr = path(row['stdout']).read_text(), path(row['stderr']).read_text()
    stages.append({'stageGroup': 'Final source/central/floors', 'receipt': binding(p), **row, 'stdoutBinding': out, 'stderrBinding': err, 'fullLogsRead': True})
    if label == 'floors': check('Actual ten protected floors', '10 protected curricula' in textout)
check('Exactly 15 Layer A + 2 book/application + 3 closing stages', collections.Counter(x['stageGroup'] for x in stages) == {'Layer A': 15, 'Book/application': 2, 'Final source/central/floors': 3})

retained = []
for version, label, reason in [
 ('v3','composition-views','Before reviewed national single-parent view successors: actual duplicate placements.'),
 ('v3','goal-book-full-pipeline-including-cached-publications','Before authentic temporary Poppler PATH: actual pdfinfo ENOENT.'),
 ('v5','ai-transparency-inventory','Before five independently reviewed measured existing-asset fields.'),
 ('v6','deep-understanding-rollout-contract-regression','Before independently reviewed Economics integration-test scope extension; all 123 real M7 blockers remain.'),
]:
    p = L/stage_dirs[version]/(label+'.actual-command-exit.json'); row = read(p)
    check('Historical failed command retained: ' + version + '/' + label, row['actualExitCode'] == 1)
    verify(row['stdout'], 'Retained failed stdout'); verify(row['stderr'], 'Retained failed stderr')
    retained.append({'receipt': binding(p), 'actualExitCode': row['actualExitCode'], 'reason': reason, 'stdout': row['stdout'], 'stderr': row['stderr']})

REG = R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
reg = read(REG); econ = next(x for x in reg['subjects'] if x['subject'] == 'wirtschaftswissenschaften')
CAN = R/econ['landscapePath']; can = read(CAN); goals = {g['id']:g for g in can['goals']}
sem = read(R/econ['semanticKindLedgerPath']); ordinary = {d['goalId'] for d in sem['decisions'] if d['semanticKind'] == 'curricularAtomic'}
check('Actual CAN678 and authoritative ordinary336', len(goals) == 678 and len(ordinary) == 336 and len(sem['decisions']) == 678)
config_bindings = []
for key in ['semanticKindLedgerPath','semanticAtomicityConfigPath','memoryReviewConfigPath','visualizationQaPath']:
    config_bindings.append(binding(econ[key])); guards[str(path(econ[key]))] = binding(econ[key])
for p in econ['positiveEvidenceConfigPaths']:
    cfg = read(path(p)); config_bindings.append(binding(p)); guards[str(path(p))] = binding(p)
    for key in ['reviewPath','landscapePath','semanticKindLedgerPath']:
        if key in cfg and path(cfg[key]).is_file(): guards[str(path(cfg[key]))] = binding(cfg[key])
for p in [econ['semanticAtomicityConfigPath'], econ['memoryReviewConfigPath']]:
    cfg = read(path(p))
    for key in ['reviewPath','cardReviewPath']:
        if key in cfg: guards[str(path(cfg[key]))] = binding(cfg[key])
check('Actual 43 current positive-evidence config groups', len(econ['positiveEvidenceConfigPaths']) == 43)

report = read(C/'actual-current678-curriculum-quality-status.json')
check('Final central snapshot equals current actual status bytes', (C/'actual-current678-curriculum-quality-status.json').read_bytes() == (R/'docs/qa-ci/status/curriculum-quality-status.json').read_bytes())
erow = next(x for x in report['curricula'] if x['subject']=='Wirtschaftswissenschaften')
rule = lambda row, id: next(x for x in row['rules'] if x['id']==id)
d = rule(erow,'CQR-303')['metrics']; source = erow['jurisdictionCoverage']
check('Current Economics M6, 187 complete /149 open, six checks with five passed, 123 blockers', erow['maturity']=='M6' and all(d[k]==v for k,v in {'expectedGoals':336,'strictComplete':187,'remaining':149,'requiredChecksPassed':5,'requiredChecksTotal':6,'blockingIssues':123}.items()))
check('Actual source 16/2134 complete; unsupported/reverse gaps zero', source['sourceCompleteJurisdictions']==16 and source['sourceAtomicGoals']==2134 and source['sourceMappedToViewAtomicGoals']==2134 and source['unsupportedAssignedAtomicGoals']==0 and source['unmappedSourceAtomicGoals']==0)
scope = next(s for s in erow['scopes'] if s['scopeId']=='canonical-economics-crossstage'); route = next(x for x in scope['rules'] if x['id']=='CQR-104')
check('Current route all 64 projections pass', route['status']=='pass' and route['metrics']['evaluatedProjectionScopes']==64)
protected = []
for subj, n in [('Mathematik',807),('Physik',478)]:
    rr = next(x for x in report['curricula'] if x['subject']==subj); dd=rule(rr,'CQR-303')['metrics']
    check('Protected '+subj+' strict M7', rr['maturity']=='M7' and dd['strictComplete']==n and dd['expectedGoals']==n and dd['remaining']==0 and dd['blockingIssues']==0)
    protected.append({'subject':subj,'maturity':rr['maturity'],'metrics':dd})
F = R/'app/scripts/config/curriculum-maturity-floor-policy.json'; fp=read(F); oldfp=json.loads(git('show','HEAD:'+str(F.relative_to(R))))
check('Nine existing floor objects unchanged; exactly one Economics M6 floor', len(fp['floors'])==10 and fp['floors'][:9]==oldfp['floors'] and fp['floors'][9]['subject']=='Wirtschaftswissenschaften' and fp['floors'][9]['minimumMaturity']=='M6')
check('Floor exceptions/pre-baseline history exactly retained', fp['exceptions']==oldfp['exceptions'] and fp['knownPreBaselineRegressions']==oldfp['knownPreBaselineRegressions'])
guards[str(F)] = binding(F)

BR = B/'wirtschaft-current678-M6-actual-book336-physical339-and-protected-models-root-v1/actual-local-book336-PDF339-five-current-publications-and-cache-facts.receipt-v2.json'; br=read(BR)
verify(br['CAN'], 'Actual book current CAN'); verify(br['bookModel'],'Actual book model'); verify(br['index'],'Actual five-book index')
model=read(path(br['bookModel']['path'])); pages=model['pages']
check('Actual Book336 unique ordinary pages and exact current whole DE texts', len(pages)==336 and {p['goalId'] for p in pages}==ordinary and all(p['title']==goals[p['goalId']]['title'] and p['description']==goals[p['goalId']]['description'] for p in pages))
all_books=[]
for b in br['books']:
    for art in b['actualWholeArtifactHashes']: verify(art,'Actual published local artifact')
    bm=read(path(b['actualWholeArtifactHashes'][0]['path'])); pdf=path(next(a['path'] for a in b['actualWholeArtifactHashes'] if a['path'].endswith('.pdf'))); man=read(path(next(a['path'] for a in b['actualWholeArtifactHashes'] if a['path'].endswith('.render-manifest.json'))))
    check(b['bookId']+' actual model/manifest page counts', len(bm['pages'])==b['actualUniqueGoalPages'] and man['goalPageCount']==b['actualUniqueGoalPages'])
    check(b['bookId']+' actual PDF magic/render artifact hash', pdf.read_bytes()[:5]==b'%PDF-' and man['artifactSha256'].removeprefix('sha256:')==binding(pdf)['sha256'])
    all_books.append({'bookId':b['bookId'],'uniqueGoalPages':len(bm['pages']),'physicalPageCount':man['physicalPageCount'],'artifacts':b['actualWholeArtifactHashes']})
econman=read(R/'app/public/lernzielbuch/de-gym-wirtschaftswissenschaften-bundesweit.pdf.render-manifest.json')
check('Economics physical339 = frontmatter3 + actual336 goal pages', econman['physicalPageCount']==339 and econman['frontMatterPageCount']==3 and econman['goalPageCount']==336)
pc=br['pdfinfoActualCommand'];verify(pc['stdout'],'Actual native pdfinfo full stdout');verify(pc['stderr'],'Actual native pdfinfo full stderr')
check('Actual pdfinfo independently reports physical339', pc['exit']==0 and re.search(r'^Pages:\s+339\s*$', path(pc['stdout']['path']).read_text(),re.M) is not None)
verify(br['supersedesEarlyCauseWordingOnly'],'Earlier cache-cause receipt preserved')
cache=br['actualCacheBeforeAfter'];check('Exactly five actual ordinary cache mismatches, no force builds', len(cache)==5 and all(not x['wholeInputDigestEqual'] for x in cache) and br['actualNormalCacheMissRenderCount']==5 and br['bookBuildHadNoForce'])
phys=next(x for x in cache if x['bookId']=='de-gym-physik-bundesweit')
check('Physics model/source bytes unchanged across real cache miss', all(phys['wholeOldOutputSHA256'][k]==phys['wholeNewOutputSHA256'][k] for k in phys['wholeOldOutputSHA256'] if k.endswith('.book-model.json') or k.endswith('.original-sources.json')))

# Read-only digest comparison using the native stable JSON contract, no book rebuild.
node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
code=r'''const fs=require('fs'),crypto=require('crypto');const stable=v=>Array.isArray(v)?`[${v.map(stable).join(',')}]`:v&&typeof v==='object'?`{${Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,n])=>JSON.stringify(k)+':'+stable(n)).join(',')}}`:JSON.stringify(v)??'null';const digest=v=>'sha256:'+crypto.createHash('sha256').update(stable(v)).digest('hex');const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const b={};for(const [k,p] of [['landscapeDigest',m.source.landscapePath],['compositionViewDigest',m.source.compositionViewPath],['semanticKindLedgerDigest',m.source.semanticKindLedgerPath],['goalVisualizationQaDigest',m.source.goalVisualizationQaPath]])b[k]={expected:m.source[k],actual:digest(JSON.parse(fs.readFileSync(p,'utf8')))};b.evidence=m.source.evidenceReviewSources.map(s=>({path:s.path,expected:s.digest,actual:digest(fs.readFileSync(s.path,'utf8').trim().split(/\r?\n/).map(JSON.parse)))}));const {digest:md,...rest}=m;b.model={expected:md,actual:digest(rest)};console.log(JSON.stringify(b));'''
nrun=subprocess.run([node,'-e',code,str(path(br['bookModel']['path']))],cwd=R,text=True,capture_output=True)
check('Read-only actual native stable JSON digest comparison exit0',nrun.returncode==0,nrun.stderr)
native=json.loads(nrun.stdout) if nrun.returncode==0 else {}
for key,val in native.items():
    for row in val if isinstance(val,list) else [val]: check('Actual native Book source/model digest '+key,row['expected']==row['actual'])
check('Book final pointers still actual Economics v18 and one P336 source', model['source']['semanticKindLedgerPath']==econ['semanticKindLedgerPath'] and len(model['source']['evidenceReviewSources'])==1)
P=path(model['source']['evidenceReviewSources'][0]['path']); records=[json.loads(x) for x in P.read_text().splitlines() if x.strip()]
check('Actual whole P336/685 profiles all needs_human_review',len(records)==336 and {p['goalId'] for p in records}==ordinary and sum(len(p['profile']['applicationCaseBriefs']) for p in records)==685 and {p['status'] for p in records}=={'needs_human_review'})
guards[str(P)]=binding(P)

POP=B/'wirtschaft-current678-local-poppler-book-environment-author-b-v1/actual-final-real-poppler-six-tools-local-PATH-library-environment.receipt.json';pop=read(POP)
FONT=B/'wirtschaft-current678-local-book-environment-fonts-chromium-author-b-v1/actual-final-local-eight-Liberation-faces-and-real-Chromium-environment-repair.receipt.json';font=read(FONT)
for t in pop['actualSixVersionsAndBinaryHashes']:
    verify(t['binary'],'Authentic physical Poppler binary');check('Authentic ELF '+t['tool'],path(t['binary']['path']).read_bytes()[:4]==b'\x7fELF' and t['exit']==0 and 'version 24.02.0' in t['stderr'])
for dep in pop['actualFourFullDependencyResolutions']:check('Actual complete Poppler dependency resolution '+dep['binary'],dep['exit']==0 and 'not found' not in dep['stdout'])
for t in font['actualEightFonts']:verify(t['actualPhysicalFont'],'Actual native font face')
verify(font['fontconfigFile'],'Actual local fontconfig');verify(font['realChromiumExecutable'],'Actual Chromium ELF');verify(font['nativeUnchangedFontPreflightAndEightRenderedFaces'],'Eight rendered font preflight')
check('Authentic eight actual font match exit0',len(font['actualEightFCMatchCommands'])==8 and all(x['exit']==0 for x in font['actualEightFCMatchCommands']))
check('Authentic Chromium executable ELF',path(font['realChromiumExecutable']['path']).read_bytes()[:4]==b'\x7fELF')
helper=(L/stage_dirs['v4']/'actual-executed-stable-native-bundle-helper.py').read_text()
check('Actually executed v4 helper binds authentic process-local environments',all(x in helper for x in [pop['PATHPrefix'],pop['LD_LIBRARY_PATHPrefix'],font['fontconfigFile']['path'],font['realChromiumExecutable']['path']]))

incoming=[x for x in git('diff','--name-only','-z','HEAD..origin/main').decode().split('\0') if x]
dirty=[x for x in git('diff','HEAD','--name-only','-z').decode().split('\0') if x]
overlaps=sorted(set(incoming)&set(dirty))
untracked=set(x for x in git('ls-files','--others','--exclude-standard','-z').decode().split('\0') if x)
collisions=sorted(set(incoming)&untracked)
commits=git('log','--reverse','--format=%H%x09%s','HEAD..origin/main').decode().splitlines()
count=git('rev-list','--left-right','--count','HEAD...origin/main').decode().strip()
expected_overlap=['curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','docs/legal/ai-transparency-inventory.json','docs/qa-ci/status/README.md','docs/qa-ci/status/curriculum-quality-status.json','docs/qa-ci/status/curriculum-quality-status.md']
check('Local checkpoint behind exactly three observed origin commits, no claim merged',count=='0\t3' and len(commits)==3)
check('Exactly five actual tracked shared overlap paths',overlaps==sorted(expected_overlap))
check('Actual no incoming untracked path collision',not collisions)
overlap_bind=[]
for p in overlaps:
    rawhead=git('show','HEAD:'+p); raworigin=git('show','origin/main:'+p)
    overlap_bind.append({'path':p,'current':binding(p),'headSHA256':hashlib.sha256(rawhead).hexdigest(),'originSHA256':hashlib.sha256(raworigin).hexdigest()})
headreg=json.loads(git('show','HEAD:'+str(REG.relative_to(R)))); originreg=json.loads(git('show','origin/main:'+str(REG.relative_to(R))))
sharedsubjectrows=[]
for s in reg['subjects']:
    old=next((x for x in headreg['subjects'] if x['subject']==s['subject']),None);remote=next((x for x in originreg['subjects'] if x['subject']==s['subject']),None)
    sharedsubjectrows.append({'subject':s['subject'],'localDiffersFromHEAD':s!=old,'remoteDiffersFromHEAD':remote!=old,'localEqualsRemote':s==remote})
gitfacts={'localHEAD':start_head,'observedOriginMain':start_origin,'aheadBehind':count,'incomingCommits':commits,'incomingChangedFileCount':len(incoming),'incomingChangedFiles':incoming,'localTrackedDirtyPaths':dirty,'sharedTrackedOverlaps':overlap_bind,'untrackedEnumerated':len(untracked),'incomingUntrackedCollisions':collisions,'subjectRegistryThreeWayStructuralComparison':sharedsubjectrows,'incomingEconomicsNamedPaths':[p for p in incoming if 'wirtschaft' in p.lower() or 'economics' in p.lower()],'incomingMathPhysicsCanonicalPaths':[p for p in incoming if '/canonical/' in p and ('MATHEMATIK' in p or 'PHYSIK' in p)],'readOnlyOnly':True,'fetchRun':False,'mergeRun':False,'conflictRisk':'Shared registry requires subject-wise preservation; aggregate inventory must be natively derived from merged source inputs; generated central JSON/MD and status index require actual merged-source regeneration. A file overlap is a semantic preservation risk, not proof of a Git conflict. Local M6 PASS is bound to ee13896d plus the measured working tree; the three origin commits are not part of that checkpoint.'}
check('Incoming does not change named Economics or Math/Physics canonical data',not gitfacts['incomingEconomicsNamedPaths'] and not gitfacts['incomingMathPhysicsCanonicalPaths'])

check('Read-only audit leaves tracked status exact',git('status','--porcelain=v1','-uno')==start_tracked_status)
check('Read-only audit leaves HEAD and observed origin exact',git('rev-parse','HEAD').decode().strip()==start_head and git('rev-parse','origin/main').decode().strip()==start_origin)
endguards=[]
for p,b in list(guards.items()):
    check('Final independent exact input/log guard '+b['path'],binding(p)==b)
    endguards.append(b)

artifacts=[]
artifacts.append(put('actual-independent-selected20-native-command-receipts-and-retained-failures.json',{'selectedSuccessfulCommands':stages,'selectedSuccessCounts':dict(collections.Counter(x['stageGroup'] for x in stages)),'retainedFailedCommands':retained,'noNativeTestsOrBuildsRerunByReviewer':True}))
artifacts.append(put('actual-independent-current678-book336-physical339-authentic-environment-and-cache-facts.json',{'bookReceipt':binding(BR),'actualBooks':all_books,'nativeDigestComparison':native,'nativeDigestReadOnlyCommand':[node,'-e','native stable JSON read-only comparison',str(path(br['bookModel']['path']))],'nativeDigestReadOnlyExit':nrun.returncode,'whole336CurrentPageTextsExact':True,'authenticPopplerReceipt':binding(POP),'authenticFontsBrowserReceipt':binding(FONT),'fiveNormalCacheMisses':cache,'cacheCauseBoundary':br['cacheMissCauseClaim'],'retainedPriorCacheCauseReceipt':br['supersedesEarlyCauseWordingOnly']}))
artifacts.append(put('actual-independent-current-HEAD-origin-three-incoming-commits-and-five-shared-overlap-audit.READONLY.json',gitfacts))
artifacts.append(put('actual-independent-current678-full-input-and-retained-log-endguards.json',{'guardedFiles':endguards,'wholeEconomicsRegistry':econ,'currentCentralSnapshot':binding(C/'actual-current678-curriculum-quality-status.json'),'currentEconomics':{'maturity':erow['maturity'],'CQR303':rule(erow,'CQR-303'),'routeScope':scope,'jurisdictionCoverage':source},'protectedMathPhysics':protected,'floorPolicy':binding(F),'checks':checks}))
failed=[x for x in checks if not x['pass']]
seal={'schemaVersion':1,'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewRole':'Independent final read-only closing evidence/current-input audit; reviewer did not execute the closing commands or author their Root receipts. Only a native stable-JSON read-only input comparison and read-only git queries were executed. New files are confined to this isolated quality directory.','decision':'BOUNDED_M6_CLOSING_EVIDENCE_KEEP' if not failed else 'REVISE','rootCheckpoint':binding(K),'all20ActualSelectedStagesExit0':True,'selectedCounts':{'LayerA':15,'BookPipelineAndApplicationBuild':2,'FinalSourceCentralFloors':3},'checkedCurrentCAN':binding(CAN),'checkedCurrentRegistry':binding(REG),'checkedCurrentSEM':binding(econ['semanticKindLedgerPath']),'checkedCurrentBookConfig':binding('app/scripts/config/goal-books/de-gym-economics-current-canonical.json'),'currentEconomicsM6':erow['maturity']=='M6','strictComplete':d['strictComplete'],'currentOrdinaryDenominator':336,'currentOpenDescriptionGoals':d['remaining'],'CQR303RequiredPassedTotal':[d['requiredChecksPassed'],d['requiredChecksTotal']],'CQR303BlockingIssues':d['blockingIssues'],'actualBookGoalPages':336,'actualPDFPhysicalPages':339,'actualProtectedFloorCount':10,'protectedMathPhysics':protected,'guardedFileCount':len(endguards),'independentChecks':len(checks),'failedChecks':failed,'artifacts':artifacts,'localHEAD':start_head,'observedOriginMain':start_origin,'originAheadCommits':3,'incomingCommitsMerged':False,'meaningfulLimitations':['M6 machine maturity is established; CQR-303 remains failed, with 187/336 strictly complete, 149 open goals and 123 native issues. No new D verdict, owner or supersession resolution is claimed.','Composition validation passed with 2261 heuristic CPV102 warnings; Economics retains 1457 non-blocking partial-only applicability diagnostics. No claim of globally warning-free data.','This audit reuses actual scoped successful command receipts after their reviewed successors. It does not claim every stage was rerun after every edit; actual earlier failed receipts and corrected cache-cause receipt remain intact.','Books are local review publications, including the actual 339-page Economics PDF. Authentic extracted binaries/fonts/Chromium and temporary process-local environment are bound; no deployment, host acceptance, human release/trial or image approval is asserted.','No claim that every one of the five normal render cache misses was caused solely by environment drift. Physics whole model/source outputs remained exact; other current source/model outputs also differed.','The local checkpoint is bound to ee13896d and the guarded working tree. Observed origin/main has three new commits and five shared overlapping files; merging and post-merge regeneration are separate Root work.','Two bounded description changes and their v19 technical bindings remain inert, including visualization approval pending. They are excluded from this current M6 evidence.'],'activeWrites':0,'docsWrites':0,'newImages':0,'newStrictClosures':0,'fetchOrMergePerformed':False,'commitCreated':False}
final=put('actual-final-current678-M6-closing20-stages-current-book-and-three-incoming-commits-independent-KEEP.handoff.json',seal)
print(json.dumps({'final':final,'decision':seal['decision'],'checks':len(checks),'guardedFiles':len(endguards),'failedChecks':failed,'stageCounts':seal['selectedCounts'],'gitOverlaps':overlaps,'incomingChangedFiles':len(incoming)},ensure_ascii=False,indent=2))
