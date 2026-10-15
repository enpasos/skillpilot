# SPDX-License-Identifier: Apache-2.0
"""Retain successful stock FP output, restore unchanged raw bytes, check once."""
import hashlib,json,shutil,subprocess
from pathlib import Path
from datetime import datetime,timezone
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=str(OWN.relative_to(REPO))
HOST=REPO/'tmp/chemie-m7-resumed-20261015/carbonyl-two-final-wording-memory-minimal-host-v1'
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(REPO)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,o):(OWN/name).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'checks/M422.check.actual.command.json').exists(),'Whole check already executed; do not repeat.'
context=read(OWN/'inputs/two-whole-final-competencies-prereqs-four-cases-and-old-M.exact.json')
config_path=OWN/'config/M422.whole-ten-scopes.two-final-wording.config.json';config=read(config_path)
record=REPO/config['reviewPath'];private=HOST/config['reviewPath']
writer_lines=private.read_text().splitlines(keepends=True)
history=OWN/'checks/M422.successful-stock-writer-output.unselected-original.jsonl';assert not history.exists();history.write_bytes(private.read_bytes())
writer={json.loads(x)['goalId']:(x,json.loads(x)) for x in writer_lines}
original=(REPO/context['oldM422Source']['path']).read_text().splitlines(keepends=True)
first_seal=read(OWN/'FIRST.actual-two-final-wording-M-decisions.seal.json')
science={read(REPO/r['path'])['goalId']:read(REPO/r['path']) for r in first_seal['files']}
before={json.loads(x)['goalId']:json.loads(x) for x in (OWN/'records/M422.before-stock-fingerprint-binding.original.jsonl').read_text().splitlines()}
out=[];formatting=[]
for line in original:
 old=json.loads(line);gid=old['goalId'];new_line,new=writer[gid]
 if gid in science:
  expected=before[gid].copy();expected['fingerprint']=new['fingerprint'];assert expected==new
  assert new['reason']==science[gid]['reason'];out.append(new_line)
 else:
  assert old==new,('unexpected scientific/fingerprint delta outside2',gid)
  if line!=new_line:formatting.append(gid)
  out.append(line)
assert len(out)==422 and len(formatting)==13 and sum(x==y for x,y in zip(out,original))==420
cards=REPO/config['cardReviewPath'];private_cards=HOST/config['cardReviewPath']
assert [json.loads(x) for x in cards.read_text().splitlines()]==[json.loads(x) for x in private_cards.read_text().splitlines()]
card_writer_history=OWN/'checks/cards75.successful-stock-writer-output.unselected-original.jsonl';card_writer_history.write_bytes(private_cards.read_bytes())
cards_reformatted=cards.read_bytes()!=private_cards.read_bytes()
shutil.copy2(cards,private_cards)
record.write_text(''.join(out));private.write_bytes(record.read_bytes())
assert private_cards.read_bytes()==cards.read_bytes()
id138='13838147-c26d-54ca-b9be-5f2f0b8e9de5'
assert next(x for x in original if json.loads(x)['goalId']==id138)==next(x for x in out if json.loads(x)['goalId']==id138)
write('checks/CAS.successful-stock-writer-serialization-only-preservation.json',{
 'writtenAtUTC':datetime.now(timezone.utc).isoformat(),'initialStockFingerprintCommandExit':0,
 'initialLocalRawlineCASStoppedBeforeWholeCheck':True,'wholeCheckExecutionsAtThatStop':0,
 'initialCASFailure':'Stock writer compacts13unaffected historical rows; all13whole objects including fingerprints remain exact.',
 'nonTargetFormattingOnlyGoalIds':formatting,'all420NonTargetWholeObjectsAndFingerprintsExact':True,
 'all420OriginalRawLinesRestoredExact':True,'all75CardObjectsAndFingerprintsExact':True,
 'cardWriterSerializationDiffered':cards_reformatted,'all75OriginalRawLinesRetainedExact':True,
 'onlyTwoGenuineNewRecordsUseStockComputedFingerprints':True,'original138RawLineExact':True,
 'originalWriterMOutput':bind(history),'originalWriterCardOutput':bind(card_writer_history),
 'scienceOrHashValuesChangedToFixSerialization':False})
cmd=['node',str(REPO/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/memoryCardReview.ts','--config='+str(config_path.relative_to(REPO)),'--mode=check']
started=datetime.now(timezone.utc).isoformat();run=subprocess.run(cmd,cwd=HOST,capture_output=True,text=True)
(OWN/'checks/M422.check.actual.stdout.txt').write_text(run.stdout);(OWN/'checks/M422.check.actual.stderr.txt').write_text(run.stderr)
write('checks/M422.check.actual.command.json',{'startedAtUTC':started,'command':cmd,'cwd':str(HOST.relative_to(REPO)),'returncode':run.returncode,'attempt':1,'successfulWholeCheckExecutions':int(run.returncode==0)})
assert run.returncode==0,run.stdout+run.stderr
assert sum(a==b for a,b in zip(record.read_text().splitlines(keepends=True),original))==420
assert bind(cards)==context['old75CardReviewSource'] and private_cards.read_bytes()==cards.read_bytes()
base=read(REPO/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy18-current422-bounded-inactive-integration-technical-20261015-v1/checks/REBUILD.energy18-final.physical-exact-map.v3.json')
base_aliases={r['normalHostAlias']:r['physicalRepositorySource'] for r in base['aliases']}
source_rows=[]
for p in sorted(HOST.rglob('*')):
 if not p.is_file() or p.is_symlink():continue
 rel=str(p.relative_to(HOST));digest='sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
 if rel==config['landscapePath']:source=REPO/context['canonical']['path']
 elif (REPO/rel).is_file() and bind(REPO/rel)['sha256']==digest:source=REPO/rel
 elif rel in base_aliases and base_aliases[rel]['sha256']==digest:source=REPO/base_aliases[rel]['path']
 elif rel=='package.json':
  source=OWN/'config/private-host.package.json';source.write_bytes(p.read_bytes())
 else:raise AssertionError(('unbound physical host file',rel))
 assert bind(source)['sha256']==digest
 source_rows.append({'normalHostAlias':rel,'physicalRepositorySource':bind(source)})
physical_bytes=sum(r['physicalRepositorySource']['bytes'] for r in source_rows)
write('checks/REBUILD.two-M-final.minimal-host.json',{'role':'Exact physical sparse host map after preservation; no image tree or repository copy','executionHost':str(HOST.relative_to(REPO)),'sourceMap':source_rows,'physicalRegularFiles':len(source_rows),'physicalRegularBytes':physical_bytes,'onlySymlink':'app/node_modules -> repository app/node_modules','normalStockModule':bind(REPO/'app/scripts/memoryCardReview.ts'),'newConfig':bind(config_path),'newRecords':bind(record),'unchanged75Cards':bind(cards),'wholeCheckSuccessCount':1,'newCards':0,'activeWrites':0})
write('checks/FINAL.M422.actual-420-rows-75-cards-and-138-preservation.json',{'checkedAtUTC':datetime.now(timezone.utc).isoformat(),'normalScopeGoals':422,'visibilityScopes':10,'newGenuineMemoryDecisions':2,'originalRawMRowsExact':420,'all75CardRawRowsExact':True,'original138MRawLineExact':True,'normalStockFingerprintWriterUnchanged':True,'onlyTwoGenuineNewFingerprintFieldsSelected':True,'normalWhole422TenViewsCheckExitCode':0,'successfulWholeCheckExecutions':1,'failedWholeCheckAttempts':0,'initialLocalSerializationCASStopPreserved':True,'stockFingerprintWriterFailures':0,'newDPAOrVVotes':0,'sourceCourseApproval':False,'humanApproval':False,'humanTrial':False,'centralRuns':0,'activeWrites':0})
print(json.dumps({'pass':True,'wholeCheckSuccessCount':1,'ordinaryGoals':422,'visibilityScopes':10,'genuineM':2,'other420RawLinesExact':True,'cards75Exact':True,'138Exact':True,'hostBytes':physical_bytes}))
