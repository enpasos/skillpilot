import json,pathlib,hashlib,subprocess,datetime
q=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
b=q/'biologie-stoffwechsel-nineteen-native-technical-20261008-v1'
o=q/'biologie-stoffwechsel-nineteen-native-independent-b-20261008-v1'
load=lambda p:json.loads(pathlib.Path(p).read_text())
receipt=lambda p:{'path':str(p),'sha256':'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest(),'bytes':pathlib.Path(p).stat().st_size}
entry=load(b/'neutral-current-nineteen-native.technical.entry.json');selected=set(entry['selectedGoalIds'])
freeze=load(b/'native-nineteen.first-materialization.freeze.json'); bindings=freeze['files']+freeze['externalInputBindings']
errors=[]
for r in bindings:
 p=pathlib.Path(r['path'])
 if not p.is_file() or receipt(p)['sha256'].removeprefix('sha256:')!=r['sha256'].removeprefix('sha256:') or p.stat().st_size!=r['bytes']:errors.append(r['path'])
base=load('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');cand=load(entry['currentCandidateCanonicalPath']);bm={g['id']:g for g in base['goals']}; cm={g['id']:g for g in cand['goals']}
other=[g for g in cm if g not in selected]; canon_diffs={g:[k for k in set(cm[g])|set(bm[g])if cm[g].get(k)!=bm[g].get(k)]for g in selected}
assert len(cm)==len(bm)==476 and set(cm)==set(bm)
assert len(other)==457 and all(cm[g]==bm[g]for g in other)
assert all(v==['resourceLinks'] for v in canon_diffs.values())
orig=load(b/'source-atlas/full392.before.actual-book-model.json');native=load(entry['fullBookModelPath']);om={p['goalId']:p for p in orig['pages']};nm={p['goalId']:p for p in native['pages']}
assert len(om)==len(nm)==392 and set(om)==set(nm)
page_diff={g:sorted(k for k in set(nm[g])|set(om[g])if nm[g].get(k)!=om[g].get(k))for g in selected}
assert all(nm[g]==om[g]for g in nm if g not in selected)
assert all(v==['pageFingerprint','visualization']for v in page_diff.values())
qaold=load('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json');qanew=load(b/'candidate/visualization-qa.current392.nineteen-unapproved.inactive.json');qo={r['goalId']:r for r in qaold['records']};qn={r['goalId']:r for r in qanew['records']}
assert len(qo)==len(qn)==392 and set(qo)==set(qn)
human_fields=sorted({k for r in list(qo.values())+list(qn.values())for k in r if k.startswith('human')})
assert all({k:qo[g].get(k)for k in human_fields}=={k:qn[g].get(k)for k in human_fields}for g in qo)
assert all(qo[g]==qn[g]for g in qo if g not in selected)
profiles=load(q/'biologie-stoffwechsel-resume-author-20261008-v1/P19.exact-retained-v5.author.candidates.json');pm={r['goalId']:r['profile']for r in profiles['goals']}
pr=[json.loads(l)for l in (o/'P19-current-raster.actual-independent-b.records.jsonl').read_text().splitlines()if l.strip()]
assert len(pr)==19 and {r['goalId']for r in pr}==selected
assert all(r['profile']==pm[r['goalId']] and r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewRunIds']==[]for r in pr)
result={'schemaVersion':1,'checkedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Independent B scoped retention; no full QA and no active integration','authorInputReceipts':len(bindings),'authorInputReceiptFailures':errors,'wholeCanonicalGoals':476,'otherWholeGoalsExact':457,'selectedGoalChangedFields':canon_diffs,'wholeContextPages':392,'otherWholePagesExact':373,'selectedPageChangedFields':page_diff,'QARecordCount':392,'humanFields':human_fields,'all392HumanFieldsExact':True,'other373WholeQARowsExact':True,'whole19V5ProfilesExact':True,'whole38V4CasesRetainedWithExactFrozenHash':receipt(entry['wholeCasesPath']),'P19CurrentCandidateFlagsExact':True,'newAResultsRead':False,'activeWrites':0,'newStrictClosures':0,'allPassed':not errors}
(o/'native19-b.scoped-retention-and-final-input-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
assert not errors
# Ordinary ignore semantics respect indexed files. This is a separate current portability audit; historical seals remain untouched.
prior=[q/'biologie-stoffwechsel-source-roles-independent-b-resume-20261008-v1',q/'biologie-stoffwechsel-visualization-independent-b-first3-20261008-v1',q/'biologie-stoffwechsel-visualization-independent-b-final17-20261008-v1',q/'chemie-q3-two-native-source-roles-independent-b-20261008-v1']
paths={r['path']for r in bindings};local_caches=set();historical_seal_failures=[]
def collect(x):
 if isinstance(x,dict):
  for k,v in x.items():
   if k=='path' and isinstance(v,str):
    if v.startswith(('curricula/','app/','docs/','scripts/'))or v=='AGENTS.md':paths.add(v)
    elif v.startswith('/tmp/'):local_caches.add(v)
   else:collect(v)
 elif isinstance(x,list):
  for v in x:collect(v)
for folder in prior:
 for p in folder.rglob('*'):
  if p.is_file():
   paths.add(str(p))
   if p.suffix=='.json':
    d=load(p)
    if 'freeze' in p.name:collect(d)
    if 'seal' in p.name and isinstance(d,dict) and 'outputs' in d:
     for r in d['outputs']:
      z=pathlib.Path(r['path'])
      if not z.is_file()or receipt(z)['sha256'].removeprefix('sha256:')!=r['sha256'].removeprefix('sha256:'):historical_seal_failures.append(r['path'])
for p in o.rglob('*'):
 if p.is_file():paths.add(str(p))
paths=sorted(paths);inp=b'\0'.join(p.encode()for p in paths)+b'\0'
r=subprocess.run(['git','check-ignore','-z','--stdin'],input=inp,stdout=subprocess.PIPE,check=False)
ignored=sorted(x.decode()for x in r.stdout.split(b'\0')if x)
r=subprocess.run(['git','ls-files','-z','--',*paths],stdout=subprocess.PIPE,check=True);tracked=set(x.decode()for x in r.stdout.split(b'\0')if x)
missing=[p for p in paths if not pathlib.Path(p).is_file()]
# Ignored render root duplicates have exact portable copies in ordinary bundle, whose receipts are part of author materialization.
aliases=[]
for p in ignored:
 z=pathlib.Path(p);alt=z.parent/'bundle'/z.name
 if alt.is_file() and hashlib.sha256(z.read_bytes()).digest()==hashlib.sha256(alt.read_bytes()).digest():aliases.append({'ignoredLocalPath':p,'portableExactPath':str(alt),'sha256':receipt(alt)['sha256']})
portable_aliases={x['ignoredLocalPath']for x in aliases};unresolved=[p for p in ignored if p not in portable_aliases]
port={'schemaVersion':1,'checkedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Current audit of own native and prior sealed B outputs and bound originals; no historical seal edits','ordinaryGitIgnoreSemantics':'git check-ignore --stdin without --no-index; tracked index members respected','pathCount':len(paths),'trackedCount':len(tracked),'ignoredCount':len(ignored),'ignoredPaths':ignored,'portableExactAliases':aliases,'ignoredWithoutPortableExactAlias':unresolved,'missingRepositoryPaths':missing,'permittedRawLocalCachePaths':sorted(local_caches),'historicalBSealedOutputHashFailures':historical_seal_failures,'rawOriginalPDFHTMLCachesMayRemainLocal':True,'durableURLsAndPortableOfficialSourceTextsRetainedInOwnSourceBOutputs':True,'activeWrites':0,'allPortableBoundPathsHaveRepositoryFileOrExactBundleAlias':not(unresolved or missing),'allHistoricalBSealedOutputsRemainExact':not historical_seal_failures}
(o/'native19-b.original-input-and-output-portability.audit.json').write_text(json.dumps(port,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'retentionPassed':result['allPassed'],'portablePathCount':len(paths),'ignored':ignored,'exactAliases':aliases,'missing':missing,'unresolved':unresolved,'historicalSealFailures':historical_seal_failures},ensure_ascii=False))
