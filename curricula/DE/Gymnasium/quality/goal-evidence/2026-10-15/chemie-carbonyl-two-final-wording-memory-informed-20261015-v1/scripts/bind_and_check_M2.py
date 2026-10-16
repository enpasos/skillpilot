# SPDX-License-Identifier: Apache-2.0
"""Bind two sealed genuine M decisions, preserve420rawlines/cards, check once."""
import ast, hashlib, json, shutil, subprocess
from datetime import datetime, timezone
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=str(OWN.relative_to(REPO))
PREV=REPO/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-kinetic-mechanism-one-final-wording-memory-informed-root-20261015-v1'
HOST=REPO/'tmp/chemie-m7-resumed-20261015/carbonyl-two-final-wording-memory-minimal-host-v1'
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(REPO)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,o):(OWN/name).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
assert not HOST.exists()
context=read(OWN/'inputs/two-whole-final-competencies-prereqs-four-cases-and-old-M.exact.json')
seal=read(OWN/'FIRST.actual-two-final-wording-M-decisions.seal.json')
for row in seal['files']:assert bind(REPO/row['path'])==row
science={read(REPO/row['path'])['goalId']:read(REPO/row['path']) for row in seal['files']}
assert len(science)==2 and seal['normalNewMRecordsAtSeal']==seal['normalNewFingerprintsAtSeal']==0
source_map=read(PREV/'checks/REBUILD.final138-M1.minimal-host.json');old_host=REPO/source_map['executionHost']
old_files={str(p.relative_to(old_host)):hashlib.sha256(p.read_bytes()).hexdigest() for p in old_host.rglob('*') if p.is_file() and not p.is_symlink()}
assert sum((old_host/p).stat().st_size for p in old_files)<10*1024*1024
symlinks=[str(p.relative_to(old_host)) for p in old_host.rglob('*') if p.is_symlink()]
assert symlinks==['app/node_modules'],symlinks
shutil.copytree(old_host,HOST,symlinks=True)
config=read(REPO/context['oldWhole422Config']['path'])
assert len(config['visibilityScopes'])==10
assert bind(REPO/context['canonical']['path'])==context['canonical']
shutil.copy2(REPO/context['canonical']['path'],HOST/config['landscapePath'])
original=(REPO/context['oldM422Source']['path']).read_text().splitlines(keepends=True)
assert len(original)==422 and bind(REPO/context['oldM422Source']['path'])==context['oldM422Source']
cards=REPO/context['old75CardReviewSource']['path'];assert bind(cards)==context['old75CardReviewSource']
out=[];cas=[]
for line in original:
 old=json.loads(line);current=science.get(old['goalId'])
 if current is None:out.append(line);continue
 assert old==current['wholePriorMDecision']
 new={**old,'fingerprint':'pending-stock-binding-after-genuine-science','status':current['status'],'memoryUseful':current['memoryUseful'],'reviewedAt':current['completedAtUTC'],'reviewer':'Codex independent C / informed actual final wording Memory science / 2026-10-15','reason':current['reason'],'firstScienceSeal':bind(OWN/'FIRST.actual-two-final-wording-M-decisions.seal.json')}
 assert new['status']=='no_memory_needed' and new['memoryUseful'] is False
 out.append(json.dumps(new,ensure_ascii=False,separators=(',',':'))+'\n');cas.append({'goalId':old['goalId'],'wholeBefore':old,'wholeAfterBeforeStockFingerprint':new})
assert len(cas)==2
write('CAS.two-genuine-M-decisions.before-normal-binding.json',cas)
record_rel=REL+'/records/M422.original420-plus-two-final-wording.review.jsonl'
record=REPO/record_rel;record.write_text(''.join(out))
(OWN/'records/M422.before-stock-fingerprint-binding.original.jsonl').write_bytes(record.read_bytes())
dest=HOST/record_rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(record,dest)
config['reviewPath']=record_rel;config['reportPath']=REL+'/checks/M422.report.not-written.md'
config_rel=REL+'/config/M422.whole-ten-scopes.two-final-wording.config.json'
write('config/M422.whole-ten-scopes.two-final-wording.config.json',config)
dest=HOST/config_rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(REPO/config_rel,dest)
assert bind(HOST/'app/scripts/memoryCardReview.ts')['sha256']==bind(REPO/'app/scripts/memoryCardReview.ts')['sha256']
base=['node',str(REPO/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/memoryCardReview.ts','--config='+config_rel,'--mode=check']
for phase,cmd in [('bind',base+['--write-fingerprints']),('check',base)]:
 started=datetime.now(timezone.utc).isoformat();run=subprocess.run(cmd,cwd=HOST,capture_output=True,text=True)
 (OWN/f'checks/M422.{phase}.actual.stdout.txt').write_text(run.stdout);(OWN/f'checks/M422.{phase}.actual.stderr.txt').write_text(run.stderr)
 write(f'checks/M422.{phase}.actual.command.json',{'startedAtUTC':started,'command':cmd,'cwd':str(HOST.relative_to(REPO)),'returncode':run.returncode,'attempt':1})
 assert run.returncode==0,run.stdout+run.stderr
 if phase=='bind':
  after=(HOST/record_rel).read_text().splitlines(keepends=True)
  assert len(after)==422 and sum(a==b for a,b in zip(original,after))==420
  assert (HOST/config['cardReviewPath']).read_bytes()==cards.read_bytes()
  record.write_bytes((HOST/record_rel).read_bytes())
  before_objects={json.loads(x)['goalId']:json.loads(x) for x in out}
  for line in after:
   new=json.loads(line)
   if new['goalId'] in science:
    expected=before_objects[new['goalId']].copy();expected['fingerprint']=new['fingerprint'];assert expected==new
    assert new['reason']==science[new['goalId']]['reason']
after_host={str(p.relative_to(old_host)):hashlib.sha256(p.read_bytes()).hexdigest() for p in old_host.rglob('*') if p.is_file() and not p.is_symlink()}
assert old_files==after_host
after=record.read_text().splitlines(keepends=True)
id138='13838147-c26d-54ca-b9be-5f2f0b8e9de5'
assert next(x for x in original if json.loads(x)['goalId']==id138)==next(x for x in after if json.loads(x)['goalId']==id138)
host_files=[]
for p in sorted(HOST.rglob('*')):
 if p.is_file() and not p.is_symlink():host_files.append({'normalHostPath':str(p.relative_to(HOST)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size})
write('checks/REBUILD.two-M-final.minimal-host.json',{'role':'Exact small sparse M host; dependency symlink only','executionHost':str(HOST.relative_to(REPO)),'sourceMinimalHostMap':bind(PREV/'checks/REBUILD.final138-M1.minimal-host.json'),'sourceMinimalHostRegularFilesUnchanged':True,'normalCanonicalAlias':config['landscapePath'],'physicalFinalCanonical':context['canonical'],'newConfig':bind(REPO/config_rel),'newRecords':bind(record),'unchanged75CardRows':bind(cards),'stockModule':bind(REPO/'app/scripts/memoryCardReview.ts'),'physicalRegularBytes':sum(x['bytes'] for x in host_files),'physicalRegularFiles':host_files,'onlySymlink':'app/node_modules','normalCheckSuccessfulExecutions':1,'newCards':0,'activeWrites':0})
write('checks/FINAL.M422.actual-420-rows-75-cards-and-138-preservation.json',{'checkedAtUTC':datetime.now(timezone.utc).isoformat(),'newGenuineMemoryDecisions':2,'originalRawMRowsExact':420,'all75CardRawRowsExact':True,'original138MRawLineExact':True,'normalStockFingerprintWriterUnchanged':True,'onlyTwoNewFingerprintFieldsChangedByWriter':True,'normalWhole422TenViewsCheckExitCode':0,'successfulWholeCheckExecutions':1,'failedAttempts':0,'sourceMinimalHostUnchanged':True,'newDPAOrVVotes':0,'sourceCourseApproval':False,'humanApproval':False,'humanTrial':False,'centralRuns':0,'activeWrites':0})
print(json.dumps({'pass':True,'normalScope':422,'visibilityScopes':10,'genuineMRechecks':2,'otherRawRowsExact':420,'cards75Exact':True,'138Exact':True,'hostBytes':sum(x['bytes'] for x in host_files)}))
