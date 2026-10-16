# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from collections import Counter,defaultdict
import hashlib,json,datetime
R=Path('/home/enpasos/projects/skillpilot')
O=Path.cwd();assert O==R/'tmp/cross-subject-requires/current92-first20-whole-integration-author-20261016-v1/binding-audit'
N=R/'tmp/cross-subject-requires/current92-whole-integration-neutral-reader-root-20261016-v1'
def sha(raw):return 'sha256:'+hashlib.sha256(raw).hexdigest()
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def load(p):return json.loads(Path(p).read_text())
def write(n,d):(O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def info(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p.relative_to(R)),'bytes':len(raw),'sha256':sha(raw)}
read=load(N/'READ-BINDINGS.actual.json');first=load(N/'NEUTRAL-FIRST20-WHOLE-PHYSICS-CONTEXTS.actual.json');lookup=load(N/'NEUTRAL-COMPLETE-MATH-PHYSICS-LOOKUP.actual.json')
failures=[];checks=[];bindings={};roles=defaultdict(set)
def bind(p,role):
 p=Path(p);p=p if p.is_absolute() else R/p
 f=info(p);bindings[f['path']]=f;roles[f['path']].add(role);return f
def check(name,passed,detail=None):
 checks.append({'check':name,'pass':bool(passed),**({'detail':detail} if detail is not None else {})})
 if not passed:failures.append(checks[-1])
expected={'NEUTRAL-FIRST20-WHOLE-PHYSICS-CONTEXTS.actual.json':'50e8c887ae6baf220535ca0f33e37130c4dc217ede67d8b6f477a036823c0e0a','NEUTRAL-COMPLETE-MATH-PHYSICS-LOOKUP.actual.json':'a3ae03c33694f9779ffa86e641935536f1ac5a1c41600c56643384e7514b0c64'}
for n in [*expected,'READ-BINDINGS.actual.json']:
 f=bind(N/n,'neutral-input');check(n+' pinned hash',f['sha256']=='sha256:'+expected[n]) if n in expected else None
boundRows=[]
for f in read['files']:
 try:
  a=bind(f['path'],'neutral-read-bound-source');ok=a['bytes']==f['bytes'] and a['sha256']==f['sha256'];boundRows.append({**a,'expectedBytes':f['bytes'],'expectedSha256':f['sha256'],'exact':ok})
  if not ok:failures.append({'check':'READ-BINDINGS source bytes','expected':f,'actual':a})
 except Exception as e:boundRows.append({'path':f['path'],'exact':False,'failureRaw':repr(e)});failures.append(boundRows[-1])
check('all neutral READ-BINDINGS sources current',len(boundRows)==606 and all(x['exact'] for x in boundRows),{'count':len(boundRows)})
for p,h in [('curricula/quality/cross-subject-requires/math-physics.inventory.json','f4ba04ba28493ecd4ebd9bee853ffe72b06c956853339ee5f73db71f05f99c02'),('.git/index','6590754da8fa7a96703a630fd004fcb28978e5e1e18af447dcf24a7b77c6d9e8')]:
 f=bind(p,'expected-technical-baseline');check('pinned '+p,f['sha256']=='sha256:'+h, f)
additions=[]
for p,h in [('curricula/DE/Gymnasium/composition-views/mathematik/de-bw-seki.view.json','143d376035ad9874f606d51146826c0f81e06b54a3f66984f13eb5eb275a9baf'),('curricula/quality/cross-subject-requires/2026-10-15/current72-scientific-reconciliation-v1/effective-goal-index.v23.selected.actual.json','c06f1561f75d772a2dfed21078f66e7a7ee965dcd84739ae8b67a2dd221b240d')]:
 f=bind(p,'parent-explicit-authorized-technical-addition');additions.append(f);check('authorized addition '+p,f['sha256']=='sha256:'+h,f)
cfgPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';bind(cfgPath,'current-registered-P-owner-authority');rollout=load(R/cfgPath)
subjects={};canonicalGoals={};kinds={};currentOwners=defaultdict(list);rawLines={};allOwnerErrors=[]
for s in rollout['subjects']:
 if s['subject'] not in ['mathematik','physik']:continue
 subject=s['subject'];bind(s['landscapePath'],'current-canonical-goals');bind(s['semanticKindLedgerPath'],'current-semantic-kind-authority')
 landscape=load(R/s['landscapePath']);kind=load(R/s['semanticKindLedgerPath']);goals={g['id']:g for g in landscape['goals']};decisions={k['goalId']:k for k in kind['decisions']}
 for gid,g in goals.items():canonicalGoals[gid]={'subject':subject,'goal':g,'landscapePath':s['landscapePath'],'landscapeId':landscape['landscapeId']};kinds[gid]=decisions.get(gid)
 scopes=[];records=[]
 for path in s['positiveEvidenceConfigPaths']:
  pcfg=load(R/path);bind(path,'current-registered-P-config');reviewPath=pcfg['reviewPath'];bind(reviewPath,'current-registered-P-raw-records')
  scope=pcfg['scope']['goalIds'];scopes+=scope;raw=(R/reviewPath).read_bytes().splitlines(keepends=True);byId=defaultdict(list)
  for lineNo,line in enumerate(raw,1):
   if not line.strip():continue
   record=json.loads(line);byId[record['goalId']].append((lineNo,line,record));records.append(record['goalId'])
  for gid in scope:
   matches=byId.get(gid,[])
   if len(matches)!=1:allOwnerErrors.append({'configPath':path,'goalId':gid,'rawMatchCount':len(matches)})
   for lineNo,line,record in matches:
    currentOwners[gid].append({'configPath':path,'rawRecordsPath':reviewPath,'rawRecordLine':lineNo,'wholeP':record,'rawLineBytes':len(line),'rawLineSha256':sha(line),'scopeSize':len(scope)})
  if set(byId)!=set(scope):allOwnerErrors.append({'configPath':path,'scopeVsRawRecordIdsMismatch':True,'onlyRaw':sorted(set(byId)-set(scope)),'onlyScope':sorted(set(scope)-set(byId))})
 subjects[subject]={'landscapeId':landscape['landscapeId'],'goalCount':len(goals),'PconfigCount':len(s['positiveEvidenceConfigPaths']),'PscopeRows':len(scopes),'PscopeUnique':len(set(scopes)),'PrawRecords':len(records),'PrawUnique':len(set(records)),'duplicateScopeGoalIds':[g for g,c in Counter(scopes).items() if c!=1],'duplicateRawGoalIds':[g for g,c in Counter(records).items() if c!=1]}
for subject,expectedCount in [('mathematik',807),('physik',478)]:
 sc=subjects[subject];check(subject+' unique registered current P count',all(sc[k]==expectedCount for k in ['PscopeRows','PscopeUnique','PrawRecords','PrawUnique']) and not sc['duplicateScopeGoalIds'] and not sc['duplicateRawGoalIds'],sc)
check('all registered config scopes resolve exactly one raw P',not allOwnerErrors,allOwnerErrors)
lookupFailures=[]
for gid,ctx in lookup.items():
 actual=canonicalGoals.get(gid)
 if not actual or ctx['subject']!=actual['subject'] or ctx['goal']!=actual['goal']:lookupFailures.append({'goalId':gid,'field':'wholeGoal'})
 if ctx['kind']!=kinds.get(gid):lookupFailures.append({'goalId':gid,'field':'wholeKind'})
 nown=ctx['positiveEvidenceOwner'];owners=currentOwners.get(gid,[])
 if nown is None:
  if owners:lookupFailures.append({'goalId':gid,'field':'P owner null but current exists'})
 else:
  matching=[o for o in owners if all(o.get(k)==nown.get(k) for k in ['configPath','rawRecordsPath','wholeP']) and o['rawRecordLine']-1==nown['rawRecordLine']]
  if len(owners)!=1 or len(matching)!=1:lookupFailures.append({'goalId':gid,'field':'wholeCurrentP-or-owner','ownerCount':len(owners),'matchingOwners':len(matching)})
check('complete neutral lookup matches all current whole Goal Kind P definitions',len(lookup)==2018 and set(lookup)==set(canonicalGoals) and not lookupFailures,{'lookupEntries':len(lookup),'canonicalEntries':len(canonicalGoals),'mismatches':lookupFailures})
rows=[]
for x in first:
 gid=x['goalId'];ctx=x['current'];actual=canonicalGoals[gid];owner=currentOwners.get(gid,[]);nown=ctx['positiveEvidenceOwner'];p=owner[0] if len(owner)==1 else None
 row={'goalId':gid,'subject':ctx['subject'],'wholeCurrentExactAgainstLookup':ctx==lookup.get(gid),'wholeGoalExact':ctx['goal']==actual['goal'],'wholeKindExact':ctx['kind']==kinds.get(gid),'wholePExact':bool(p and p['wholeP']==nown['wholeP']),'uniqueCurrentPOwnerCount':len(owner),'neutralRawRecordIndex0Based':nown['rawRecordLine'],'actualRawRecordLine1Based':p['rawRecordLine'] if p else None,'rawLocatorMatches':bool(p and p['rawRecordLine']-1==nown['rawRecordLine'] and all(p[k]==nown[k] for k in ['configPath','rawRecordsPath'])),'uniqueCanonicalOwner':{'landscapeId':actual['landscapeId'],'path':actual['landscapePath']},'goalFileBinding':bindings[actual['landscapePath']],'kindFileBinding':bindings[next(s['semanticKindLedgerPath'] for s in rollout['subjects'] if s['subject']==ctx['subject'])],'goalObjectCanonicalSha256':sha(canonical(ctx['goal'])),'kindObjectCanonicalSha256':sha(canonical(ctx['kind'])),'PobjectCanonicalSha256':sha(canonical(nown['wholeP'])),'Powner':{k:v for k,v in p.items() if k!='wholeP'} if p else owner,'PconfigFileBinding':bindings[nown['configPath']],'PrawFileBinding':bindings[nown['rawRecordsPath']],'profileFingerprint':nown['wholeP']['profileFingerprint'],'goalFingerprint':nown['wholeP']['goalFingerprint'],'reviewInputFingerprint':nown['wholeP']['reviewInputFingerprint']}
 rows.append(row)
check('20 unique stable ordered neutral contexts',len(first)==20 and len({x['goalId'] for x in first})==20 and [x['goalId'] for x in first]==sorted(x['goalId'] for x in first))
check('20 exact whole Goal Kind P plus unique owners',all(all(r[k] for k in ['wholeCurrentExactAgainstLookup','wholeGoalExact','wholeKindExact','wholePExact','rawLocatorMatches']) and r['uniqueCurrentPOwnerCount']==1 for r in rows))
native=load(O/'native-binding-check.actual.json');closure=load(O/'effective-prerequisite-closure.actual.json');receipt=load(O/'native-command-receipt.actual.json')
check('native command completed',receipt['exitCode']==0,receipt)
check('native current inventory exact',native['inventoryExact'])
check('native 20 exact whole Goal and Kind',len(native['nativeRows'])==20 and all(r['selectedOccurrenceCount']==1 and r['wholeGoalFingerprintMatches'] and r['semanticKindMatches'] for r in native['nativeRows']))
pErrors=[{'configPath':p['configPath'],'errors':p['errors']} for p in native['nativeP'] if p['errors']]
check('native owning P API errors',not pErrors,pErrors)
check('native owning P API exact 20 whole records',sum(len(p.get('requestedRecords',[])) for p in native['nativeP'])==20 and all(r['matchedRecordCount']==1 and r['wholePExact'] for p in native['nativeP'] for r in p.get('requestedRecords',[])))
closureSummary=[{'goalId':r['goalId'],'closureCount':r['closureCount'],'inheritedImmediateOriginCount':sum(o['inherited'] for e in r['effectiveEdges'] if e['from']==r['key'] for o in e['origins']),'reachableNomineeIds':[n['goalId'] for n in r['nomineeReachability'] if n['reachable']],'relevantDiagnosticCount':len(r['relevantDiagnostics'])} for r in closure['rows']]
check('20 native prerequisite closures agree with inventory immediate edges',len(closure['rows'])==20 and all(r['inventoryEffectiveRequiresExact'] for r in closure['rows']))
check('closure inherited-origin contains paths present',all(o['containsPathFromDeclaringAncestor'] for r in closure['rows'] for e in r['effectiveEdges'] for o in e['origins']))
check('closure no relevant graph diagnostic',all(not r['relevantDiagnostics'] for r in closure['rows']))
for f in load(O/'native-read-dependencies.actual.json')['files']:
 if str((R/f['path']).resolve()).startswith(str(O)+'/'):continue
 a=bind(f['path'],'observed-native-read');check('native-read file remained current: '+f['path'],a==f) if a!=f else None
for p in ['AGENTS.md','app/scripts/lib/crossSubjectRequiresInventory.ts','app/scripts/lib/crossLandscapeGraph.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceTaskMaterials.ts','app/node_modules/tsx/dist/cli.mjs','tmp/cross-subject-requires/current92-first20-whole-integration-author-20261016-v1/run-root-readonly.py']:
 bind(p,'technical-audit-tool-or-instructions')
deps={'technicalOnly':True,'files':[dict(bindings[k],roles=sorted(roles[k])) for k in sorted(bindings)],'neutralReadBindings':boundRows,'noOriginalSuggestionsOrNewAuthorOrIndependentPeerBodiesRead':True,'authorizedAdditions':additions}
write('dependency-bindings.v2.actual.json',deps)
failedAttempts=[]
for p in sorted(O.glob('attempt*-native-command-receipt.actual.json')):
 d=load(p)
 if d['exitCode']:
  prefix=p.name.split('native-command-')[0];failedAttempts.append({'receipt':info(p),'exitCode':d['exitCode'],'stdout':info(O/(prefix+'native-command.stdout.txt')),'stderr':info(O/(prefix+'native-command.stderr.txt')),'failureRaw':(O/(prefix+'native-command.stderr.txt')).read_text(),'resolution':'Private audit package marked ESM in local package.json; native source files unchanged; subsequent native command successful.'})
report={'supersedesAuditIndexingErrorOnly':{'path':'binding-audit.actual.json','initialRawFailurePreserved':True,'cause':'neutral rawRecordLine uses zero-based indexing; audit initially compared one-based physical line numbers','wholePObjectsUnchanged':True},'schemaVersion':1,'technicalOnly':True,'scientificOpinion':None,'createdUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'result':'pass' if not failures else 'fail','checks':checks,'failureCount':len(failures),'failuresRaw':failures,'counts':{'neutralFirstContexts':len(first),'neutralLookupEntries':len(lookup),'neutralBoundSourceFiles':len(boundRows),'neutralSourceByteHashMatches':sum(r['exact'] for r in boundRows),'currentPsubjects':subjects,'uniqueFirst20PconfigOwners':len({r['Powner']['configPath'] for r in rows}),'nativePconfigApiCalls':len(native['nativeP']),'dependencyFiles':len(bindings),'prerequisiteClosures':len(closure['rows']),'nomineesPerClosure':len(closure['nominees'])},'first20Bindings':rows,'closureSummary':closureSummary,'dependencyBindings':info(O/'dependency-bindings.v2.actual.json'),'nativeBindingCheck':info(O/'native-binding-check.actual.json'),'effectivePrerequisiteClosure':info(O/'effective-prerequisite-closure.actual.json'),'failedExecutionAttemptsPreserved':failedAttempts,'limitations':['This records exact current bytes, registered ownership and native technical API results only; it grants no scientific, source, human or release approval.','The neutral rawRecordLine field is a zero-based raw line index; this corrected audit also records the physical one-based line explicitly. The initial one-based-comparison failure remains unchanged in binding-audit.actual.json.', '807 Mathematics and 478 Physics counts are current registered unique raw-P ownership counts. Native P semantic/freshness validation was executed for the 18 owning configs of the requested 20 Physics contexts, not as an independent scientific review.','Current BW composition view and v23 selected index are explicitly authorized technical additions; their presence is not classified as scientific drift.','All audit writes were confined to binding-audit and executed through the parent root-readonly runner; no Git status, index mutation, staging, source edits or edge edits were performed.']}
write('binding-audit.v2.actual.json',report)
# Final source/current index recheck immediately before sealing; preserve any late failure.
late=[]
for f in deps['files']:
 try:
  a=info(R/f['path'])
  if any(a[k]!=f[k] for k in ['bytes','sha256']):late.append({'expected':f,'actual':a})
 except Exception as e:late.append({'expected':f,'failureRaw':repr(e)})
write('source-unchanged-at-seal.v2.actual.json',{'technicalOnly':True,'checkedFiles':len(deps['files']),'failureCount':len(late),'failuresRaw':late})
if late:
 report['result']='fail';report['failureCount']+=len(late);report['failuresRaw']+=late;write('binding-audit.v2.actual.json',report)
outputFiles=[info(p) for p in sorted(O.iterdir()) if p.is_file() and p.name not in ['SHA256SUMS.v2','own-outputs.v2.actual.json']]
write('own-outputs.v2.actual.json',{'schemaVersion':1,'technicalOnly':True,'files':outputFiles,'dependencyBindings':info(O/'dependency-bindings.v2.actual.json')})
allFiles=[*outputFiles,info(O/'own-outputs.v2.actual.json')]
(O/'SHA256SUMS.v2').write_text(''.join(f"{f['sha256'].split(':',1)[1]}  {Path(f['path']).name}\n" for f in allFiles))
for n in ['binding-audit.v2.actual.json','effective-prerequisite-closure.actual.json','dependency-bindings.v2.actual.json','own-outputs.v2.actual.json','SHA256SUMS.v2']:
 print(json.dumps(info(O/n)))
print(json.dumps({'result':report['result'],'failureCount':report['failureCount'],'contexts':20,'readBindings':len(boundRows),'lookupEntries':len(lookup),'Powners':len(native['nativeP']),'closures':len(closure['rows']),'nomineePathPairs':20*len(closure['nominees']),'sourceUnchangedAtSealFailures':len(late)}))
