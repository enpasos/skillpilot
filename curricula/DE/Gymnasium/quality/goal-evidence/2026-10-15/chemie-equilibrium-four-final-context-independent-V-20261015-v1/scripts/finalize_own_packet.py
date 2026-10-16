# SPDX-License-Identifier: Apache-2.0
"""Finite role-local byte/parse packaging only; no normal check or science vote."""
from pathlib import Path
import ast,collections,datetime,hashlib,json,os
REPO=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
OWN=Path(__file__).resolve().parents[1]
ROLE='M' if 'wording-memory' in OWN.name else 'V'
def read(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(p,d):
 t=p.with_name(p.name+'.partial');t.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');os.replace(t,p)
def verify(r):assert ref(REPO/r['path'])==r,r['path']
def main():
 selector=OWN/('SELECTION.final-four-wording-genuine-M4.normal422.json' if ROLE=='M' else 'SELECTION.final-four-context-independent-normal-V4.json')
 seal=OWN/('FILES.finite-four-final-wording-M4.seal.json' if ROLE=='M' else 'FILES.finite-four-context-independent-V4.seal.json')
 assert not selector.exists() and not seal.exists()
 cas=read(OWN/'checks/CAS.final-combined-six-to-own-actual-four-contexts.json');assert cas['changedOwnWholeContexts']==0
 for k in ['finalCanonical','finalSemanticSourceOnly','finalCombinedSelector','finalCombinedSeal','ownActuallyReadInput']:verify(cas[k])
 first_name='FIRST.actual-four-final-wording-M-decisions' if ROLE=='M' else 'FIRST.actual-four-context-V-decisions'
 first_seal_path=OWN/(first_name+'.seal.json');first_seal=read(first_seal_path)
 for r in first_seal['files']:verify(r)
 science=read(REPO/first_seal['files'][0]['path'])
 assert len(science['decisions'])==4
 map_path=OWN/'checks'/('REBUILD.four-M-final.minimal-host.json' if ROLE=='M' else 'REBUILD.four-V-final.minimal-host.json')
 mapping=read(map_path);host=REPO/mapping['executionHost']
 for r in mapping['sourceMap']:
  verify(r['physicalRepositorySource']);target=host/r['normalHostAlias'];assert not target.is_symlink()
  assert target.read_bytes()==(REPO/r['physicalRepositorySource']['path']).read_bytes()
 for r in mapping.get('imageAliases',[]):
  verify(r['physicalRepositorySource']);target=host/r['normalHostAlias'];assert target.is_symlink()
  assert target.resolve()==(REPO/r['physicalRepositorySource']['path']).resolve()
 regular=[p for p in host.rglob('*') if p.is_file() and not p.is_symlink()]
 assert len(regular)==len(mapping['sourceMap']) and sum(p.stat().st_size for p in regular)==mapping['physicalRegularBytes']
 if ROLE=='M':
  command=OWN/'checks/M422.whole422-ten-views-check.command.actual.json';assert read(command)['exitCode']==0
  assert read(OWN/'checks/M422.fingerprint-bind.command.actual.json')['exitCode']==0
  assert first_seal['normalNewRecordsAtSeal']==first_seal['normalNewFingerprintsAtSeal']==0
  assert datetime.datetime.fromisoformat(first_seal['sealedAtUTC'])<datetime.datetime.fromisoformat(read(OWN/'checks/M422.fingerprint-bind.command.actual.json')['startedAtUTC'])
  normal=OWN/'records/M422.original418-plus-four-final-wording.review.jsonl';rows=[json.loads(l) for l in normal.read_text().splitlines()]
  assert len(rows)==422
  byid={r['goalId']:r for r in rows}
  for d in science['decisions']:
   assert all(byid[d['goalId']][k]==d[k] for k in ['status','memoryUseful','reason'])
  preservation=OWN/'checks/FINAL.M422.actual418-raw-75cards-carbonyl2-138-preservation.json';p=read(preservation)
  assert p['successfulWholeCheckExecutions']==1 and p['failedWholeCheckAttempts']==0
  payload={'role':'Finite informed genuine M4 on final combined six context; no other review votes',
   'goalIds':[d['goalId'] for d in science['decisions']],'genuineMDecisions':4,'statuses':[d['status'] for d in science['decisions']],
   'normalM422':ref(normal),'whole422TenViewsCheck':ref(command),'normalCheckOutput':ref(OWN/'checks/M422.whole422-ten-views-check.stdout.actual.txt'),
   'whole422TenViewsCheckCount':1,'old418RawLinesExact':True,'cards75Exact':True,'bothCarbonylM2RowsExact':True,'genuineM138RowExact':True,
   'exactPreservation':ref(preservation),'newCards':0,'newDPAOrVVotes':0,'finalOwnAuthority':'AI candidate Memory judgments only'}
 else:
  command=OWN/'checks/V4.stock-targeted-helper.command.actual.json';assert read(command)['exitCode']==0
  assert first_seal['normalVBindingsAtSeal']==0
  binding=read(OWN/'BINDING.exact-four-final-DEEN-ALT-JPG.normal-V.actual.json')
  assert datetime.datetime.fromisoformat(first_seal['sealedAtUTC'])<datetime.datetime.fromisoformat(binding['boundAtUTC'])
  normal=OWN/'qa/V4.final-context.normal-alias.qa.json';rows=read(normal)['records'];assert len(rows)==4
  for d in science['decisions']:
   r=next(r for r in rows if r['goalId']==d['goalId'])
   assert r['aiApproved']==('yes' if d['decision']=='accepted' else 'no')
   assert r['aiApprovedAssetSha256']==r['assetSha256'] and r['aiReviewedAt']==d['completedAtUTC']
  browser=read(OWN/'browser/RECEIPT.actual-own-Chromium-responsive-rendering.json');assert len(browser['records'])==16
  for r in browser['records']:verify(r['screenshot']);verify(r['fixture'])
  payload={'role':'Finite independent informed V4 on final exact context; two accepted and two rejected needing revision',
   'goalIds':[d['goalId'] for d in science['decisions']],'acceptedGoalIds':[d['goalId'] for d in science['decisions'] if d['decision']=='accepted'],
   'rejectedNeedsRevisionGoalIds':[d['goalId'] for d in science['decisions'] if d['decision']=='revise'],
   'normalQA4':ref(normal),'physicalTransportQA4':ref(OWN/'qa/V4.final-context.physical-transport.qa.json'),
   'exactPhysicalTransport':ref(OWN/'TRANSPORT.normal-aliases-to-exact-physical-files.json'),
   'wholeQA438WithOther434Exact':ref(OWN/'qa/QA438.original434-plus-four-genuine-current-context-reviews.candidate.json'),
   'targetedStockHelper':ref(command),'targetedStockHelperOutput':ref(OWN/'checks/V4.stock-targeted-helper.stdout.actual.txt'),
   'nativeImagesActuallySeen':4,'responsiveScreenshotsActuallySeen':16,'accepted':2,'rejectedNeedsRevision':2,
   'uniqueVVotes':4,'physicalTransportAddsVotes':0,'sourceJPGsCopiedOrEdited':0,'wholeQAGeneratorOrFreshnessRuns':0,
   'newDPAOrMemoryVotes':0,'separateCarbonylV2NotAppliedToWhole438Here':True,
   'finalOwnAuthority':'Two AI accepts and two AI rejections, current hashes and dates; no Human/source/course/M7 grant'}
 counts=collections.Counter()
 for p in sorted(OWN.rglob('*')):
  assert not p.is_symlink(),p
  if not p.is_file():continue
  if p.suffix=='.json':read(p);counts['JSONfiles']+=1
  elif p.suffix=='.jsonl':
   for l in p.read_text().splitlines():
    if l.strip():json.loads(l);counts['JSONLrows']+=1
   counts['JSONLfiles']+=1
  elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));counts['PythonAST']+=1
 audit=OWN/'checks/FINITE.role-local-byte-json-jsonl-python-and-host-map.actual.json'
 dump(audit,{'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Only role-local final bytes/parse/physical aliases; no repeated normal check',
  'parseCountsBeforeFiniteMetadata':dict(counts),'allCurrentHostSourceBytesExact':True,'hostRegularBytes':mapping['physicalRegularBytes'],
  'hostPhysicalImageCopies':0,'sourceRootsOrOtherHostsModified':False,'newNormalOrCentralRunsDuringFinitization':0})
 payload.update(schemaVersion=1,selectedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),
  FIRSTSeal=ref(first_seal_path),finalCombinedContextCAS=ref(OWN/'checks/CAS.final-combined-six-to-own-actual-four-contexts.json'),
  finalCanonical=cas['finalCanonical'],finalSemanticSourceIdentityOnly=cas['finalSemanticSourceOnly'],
  finalCombinedSelector=cas['finalCombinedSelector'],rebuildMap=ref(map_path),rebuildOnlyHelper=ref(OWN/'scripts/rebuild_minimal_host.py'),
  roleLocalFiniteAudit=ref(audit),readme=ref(OWN/'README.md'),sourceCourseApproval=False,HumanApproval=False,humanOrLabTrial=False,
  activeWrites=0,centralRuns=0,strictClosures=0,machineM7Grant=False,state='finite; STOP')
 dump(selector,payload)
 files=[ref(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
 dump(seal,{'schemaVersion':1,'role':ROLE+'4 finite role-local original science and exact normal artifacts; self excluded',
  'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'selector':ref(selector),'fileCountExcludingSeal':len(files),
  'totalBytesExcludingSeal':sum(r['bytes'] for r in files),'files':files,'centralRuns':0,'HumanApproval':False,'machineM7Grant':False})
 for r in files:verify(r)
 assert len([p for p in OWN.rglob('*') if p.is_file()])==len(files)+1
 print(json.dumps({'selector':ref(selector),'seal':ref(seal),'fileCountExcludingSeal':len(files),'totalBytesExcludingSeal':sum(r['bytes'] for r in files),
   'role':ROLE,'genuineDecisions':4,'normalCommandsAllExit0':True,'stop':True},indent=2))
if __name__=='__main__':main()
