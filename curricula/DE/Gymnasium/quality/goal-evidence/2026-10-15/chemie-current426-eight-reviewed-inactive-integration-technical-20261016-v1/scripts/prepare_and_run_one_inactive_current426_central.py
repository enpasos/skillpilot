# SPDX-License-Identifier: Apache-2.0
"""Einmalige freigegebene technische Auswahl und ein unveränderter Stockbericht."""
from pathlib import Path
import copy,datetime,hashlib,json,jsonschema,subprocess,time
R=Path.cwd(); O=Path(__file__).resolve().parents[1]
def load(p): return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(x):
 p=R/x['path'];a=ref(p);assert a['sha256']==x['sha256'],x['path'];assert 'bytes' not in x or a['bytes']==x['bytes'];return p
def put(p,j):
 if p.exists():
  assert load(p)==j,p;return
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
p=load(O/'preparation/PREPARED.current426-P402-A406-five-P-owners.await-two-D8-checks-and-final-root-release.json');H=R/p['newPrivateHost'];t=load(O/'description/TRANSPORT.exact-sixteen-own-records-and-individual-root-resolutions.json');release=load(verify(t['rootRelease']));pair=load(O/'checks/D8.actual-stock-pair-current-bindings-and-index.PASS.json');assert pair['currentStrictDescriptionResolutions']==8
for x in pair['actualStockPairChecks']: assert load(verify(x))['exitCode']==0
index=pair['descriptionResolutionIndices'][0];ix=load(verify(index));assert len(ix['resolutions'])==8 and all(z['strictDescriptionComplete'] and z['decision']=='keep_current' for z in ix['resolutions'])
for key in ['canonical','semantic','visualizationQA','memoryFullConfig','memoryFullRecords','A5SourceConfig','currentTechnicalSelector','currentTechnicalSeal']:verify(p[key])
for x in p['fiveExactFinalEightPOwnerConfigs']:verify(x)
preflight=load(verify(p['actualP402A406Preflight']))
# Ganze aktuelle Zielkörper, tatsächliche Native-Inputs, zwei unabhängige Records und aktuelle P-Auswahl byte-/objektgenau binden.
neutral=load(verify(t['actualFinalNeutral']));canonical=load(R/p['canonical']['path']);goals={g['id']:g for g in canonical['goals']};base=load(verify(p['baselineCentralConfig']));prepared=load(verify(p['preparedNotForRunConfig']));subject=prepared['subjects'][0]
P={}
for cp in subject['positiveEvidenceConfigPaths']:
 c=load(H/cp)
 for line in (H/c['reviewPath']).read_text().splitlines():
  if line.strip():
   z=json.loads(line);assert z['goalId'] not in P;P[z['goalId']]=z
assert len(P)==402
records=[]
for roundname in ['round-a','round-b']:
 paths=list((O/'description/native-eight'/roundname/'results').glob('*.records.jsonl'));assert len(paths)==1
 records += [json.loads(l) for l in paths[0].read_text().splitlines() if l.strip()]
assert len(records)==16
current=[]
for row in neutral['actualPagesAndHashes']:
 g=load(verify(row['actualWholeGoalAndPageInput']));gid=row['goalId'];inp=g['actualStockDescriptionReviewInputGoal'];assert g['wholeCurrentCanonicalGoal']==goals[gid];assert inp['goalFingerprint']==row['goalFingerprint'] and inp['pageFingerprint']==row['pageFingerprint'];assert inp['reviewContext']['evidenceProfile']==P[gid]
 for rec in [z for z in records if z['goalId']==gid]:
  for key in ['goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:assert rec[key]==inp[key],(gid,key)
 current.append({'goalId':gid,'goalFingerprint':row['goalFingerprint'],'pageFingerprint':row['pageFingerprint'],'wholeCanonicalGoalAndActualInput':row['actualWholeGoalAndPageInput'],'currentPProfileExactlyActualNativeInput':True})
assert len(current)==8
mapping=load(verify(p['newPrivateHostMap']))
for alias,key in [('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','canonical'),('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','semantic'),('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','visualizationQA')]:assert 'sha256:'+hashlib.sha256((H/alias).read_bytes()).hexdigest()==p[key]['sha256']
put(O/'checks/D8.current-whole-canonical-page-profile-and-own-record-bindings.PASS.json',{'schemaVersion':1,'role':'Endlicher mechanischer CurrentBinding-Nachweis zusätzlich zum bestandenen unveränderten Stockfinalize; keine neue Wissenschaft oder Modelle','actualStockFinalize':pair['actualStockPairChecks'][-1],'currentCanonical':p['canonical'],'currentSemantic':p['semantic'],'currentQA':p['visualizationQA'],'actualFinalNeutral':t['actualFinalNeutral'],'currentBindings':current,'exactSourceOwnRecords':16,'wholeCurrentGoalBodiesExact':8,'currentSelectedPProfilesExact':8,'newScienceVotes':0,'newModelRuns':0,'newRenders':0})
recipe=load(verify(p['D8IndexAndFourSupersessionsPendingRecipe']));bs=base['subjects'][0];s=copy.deepcopy(subject)
assert s['resolutionIndexPaths']==bs['resolutionIndexPaths']==recipe['old90IndexPaths'];assert s['resolutionSupersessions']==bs['resolutionSupersessions']==recipe['old184Supersessions'];assert s['resolutionWithdrawals']==bs['resolutionWithdrawals']==recipe['old5Withdrawals']
s['resolutionIndexPaths'].append(index['path'])
for edge in recipe['conditionalFourNewEdges']:
 e=copy.deepcopy(edge);e['replacementIndexPath']=index['path'];assert e['goalId'] not in {w['goalId'] for w in s['resolutionWithdrawals']};s['resolutionSupersessions'].append(e)
assert len(s['resolutionIndexPaths'])==91 and len(s['resolutionSupersessions'])==188 and len(s['resolutionWithdrawals'])==5
assert s['resolutionIndexPaths'][:-1]==bs['resolutionIndexPaths'] and s['resolutionSupersessions'][:-4]==bs['resolutionSupersessions'] and s['resolutionWithdrawals']==bs['resolutionWithdrawals']
assert len(s['positiveEvidenceConfigPaths'])==92 and len(s['semanticAtomicityConfigPaths'])==61
for key in ['resolutionIndexPaths','positiveEvidenceConfigPaths','semanticAtomicityConfigPaths']:
 for path in s[key]:assert (H/path).is_file(),path
registered=set(s['resolutionIndexPaths'])
for e in s['resolutionSupersessions']:assert e['supersededIndexPath'] in registered and e['replacementIndexPath'] in registered and e['supersededIndexPath']!=e['replacementIndexPath']
config=copy.deepcopy(prepared);config['reportId']='chemie-current426-eight-genuine-reviewed-inactive-final-20261016-v1';config['subjects']=[s]
schema=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json';jsonschema.Draft202012Validator(load(schema)).validate(config)
cp=O/'central/config/central.current426.eight-genuine-current-D8-P402-A406.inactive.config.json';put(cp,config)
put(O/'checks/READY.one-authorized-inactive-Central426.actual-config-preflight.json',{'schemaVersion':1,'role':'Ausführbare endliche Freigabe nach tatsächlichem D8-Paarabschluss und individueller Rootauflösung; keine aktive Übernahme','rootRelease':t['rootRelease'],'rootIndividualScience':t['rootOriginalIndividualScience'],'actualStockD8Pair':ref(O/'checks/D8.actual-stock-pair-current-bindings-and-index.PASS.json'),'currentBindingAudit':ref(O/'checks/D8.current-whole-canonical-page-profile-and-own-record-bindings.PASS.json'),'P402A406OwnerPreflight':p['actualP402A406Preflight'],'exactFinalCentralConfig':ref(cp),'actualConfigSchema':ref(schema),'old90IndicesExact':True,'old184SupersessionsExact':True,'old5WithdrawalsExact':True,'newIndex':index,'actualNewSupersessions':s['resolutionSupersessions'][-4:],'currentPConfigs':92,'currentUniqueP402':402,'currentAConfigs':61,'currentWholeAOwners':409,'currentAtomicA406':406,'unchangedOriginalOpenA3':p['AUnchangedOpenOriginalRecords'],'oneCentralRunAuthorized':True,'activeRegistryRuntimeGitWrites':0,'newScienceVotes':0,'newRenders':0})
started=O/'central/CENTRAL.one-authorized-run.started.json';assert not started.exists();put(started,{'startedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootRelease':t['rootRelease'],'ready':ref(O/'checks/READY.one-authorized-inactive-Central426.actual-config-preflight.json'),'allowedInvocations':1})
argv=['node',str(H/'app/node_modules/tsx/dist/cli.mjs'),str(H/'app/scripts/reportDeepUnderstandingRollout.ts'),'--config='+cp.relative_to(R).as_posix(),'--format=json'];out=O/'central/CENTRAL.current426.eight-genuine-reviewed.stock-report.actual.json';err=O/'central/CENTRAL.current426.eight-genuine-reviewed.stock-report.stderr.txt';receipt=O/'central/CENTRAL.current426.eight-genuine-reviewed.stock-report.receipt.json';assert not out.exists() and not err.exists() and not receipt.exists();clock=time.monotonic()
with out.open('wb') as stdout,err.open('wb') as stderr:result=subprocess.run(argv,cwd=H,stdout=stdout,stderr=stderr)
put(receipt,{'argv':argv,'cwd':H.relative_to(R).as_posix(),'started':ref(started),'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-clock,3),'exitCode':result.returncode,'actualInvocation':1,'stdout':ref(out),'stderr':ref(err),'newScienceVotes':0,'newRenders':0,'activeRegistryRuntimeGitWrites':0})
print(json.dumps({'exitCode':result.returncode,'receipt':ref(receipt),'stdout':ref(out),'stderr':err.read_text()},ensure_ascii=False),flush=True)
if result.returncode:raise SystemExit('Stockfehler bleibt erhalten; kein automatischer zweiter Centralversuch.')
report=load(out);sub=report['subjects'][0];print(json.dumps({'blockingIssueCount':report['blockingIssueCount'],'denominator':sub['denominator'],'strictComplete':sub['strictComplete'],'remaining':sub['remaining'],'gates':sub['gates'],'requiredChecks':sub['requiredChecks'],'issues':sub['issues']},ensure_ascii=False),flush=True)
