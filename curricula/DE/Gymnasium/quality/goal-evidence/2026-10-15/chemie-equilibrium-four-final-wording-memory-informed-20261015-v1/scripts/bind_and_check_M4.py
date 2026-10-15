# SPDX-License-Identifier: Apache-2.0
"""Four sealed genuine M decisions, exact418 raw rows and75 cards, one check."""
from pathlib import Path
import argparse,datetime,hashlib,json,os,shutil,subprocess
REPO=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(REPO).as_posix();E15=OWN.parent
PREV=E15/'chemie-carbonyl-two-final-wording-memory-informed-20261015-v1'
HOST=REPO/'tmp/chemie-m7-resumed-20261015/equilibrium-four-final-M4-minimal-host-v1'
CONFIG='config/M422.whole-ten-scopes.four-final-wording.config.json'
RECORD='records/M422.original418-plus-four-final-wording.review.jsonl'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(p,d):
 t=p.with_name(p.name+'.partial');t.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');os.replace(t,p)
def install(source,alias):
 target=HOST/alias;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
def run(name,argv):
 start=now();r=subprocess.run(argv,cwd=HOST,capture_output=True)
 (OWN/f'checks/{name}.stdout.actual.txt').write_bytes(r.stdout);(OWN/f'checks/{name}.stderr.actual.txt').write_bytes(r.stderr)
 dump(OWN/f'checks/{name}.command.actual.json',{'argv':argv,'cwd':HOST.relative_to(REPO).as_posix(),'startedAtUTC':start,'completedAtUTC':now(),'exitCode':r.returncode})
 assert r.returncode==0,r.stderr.decode()+r.stdout.decode()
def prepare_bind():
 assert not HOST.exists() and not (OWN/'checks/M422.fingerprint-bind.command.actual.json').exists()
 for d in ['records','config']:(OWN/d).mkdir(exist_ok=True)
 first_seal=read(OWN/'FIRST.actual-four-final-wording-M-decisions.seal.json')
 assert first_seal['normalNewRecordsAtSeal']==first_seal['normalNewFingerprintsAtSeal']==0
 for r in first_seal['files']:assert ref(REPO/r['path'])==r
 science=read(REPO/first_seal['files'][0]['path']);decisions={d['goalId']:d for d in science['decisions']};assert len(decisions)==4
 cas=read(OWN/'checks/CAS.final-combined-six-to-own-actual-four-contexts.json');assert cas['changedOwnWholeContexts']==0
 previous=read(PREV/'SELECTION.final-two-wording-genuine-M2.normal422.json')
 original=REPO/previous['normalRecords']['path'];assert ref(original)==previous['normalRecords']
 cards=REPO/previous['all75CardsExact']['path'];assert ref(cards)==previous['all75CardsExact']
 config=read(REPO/previous['normalConfig']['path']);assert len(config['visibilityScopes'])==10
 original_lines=original.read_text().splitlines(keepends=True);assert len(original_lines)==422
 out=[];deltas=[]
 for line in original_lines:
  old=json.loads(line);science=decisions.get(old['goalId'])
  if science is None:out.append(line);continue
  assert old==science['wholePriorMDecision']
  new={**old,'fingerprint':'pending-stock-binding-after-sealed-genuine-M-science','status':science['status'],
    'memoryUseful':science['memoryUseful'],'reviewedAt':science['completedAtUTC'],
    'reviewer':'Codex independent C / informed actual four-final-wording Memory science / 2026-10-15',
    'reason':science['reason'],'firstScienceSeal':ref(OWN/'FIRST.actual-four-final-wording-M-decisions.seal.json')}
  out.append(json.dumps(new,ensure_ascii=False,separators=(',',':'))+'\n');deltas.append({'goalId':old['goalId'],'wholePriorRecord':old,'wholeNewRecordBeforeStockFingerprint':new})
 assert len(deltas)==4
 record=OWN/RECORD;record.write_text(''.join(out));(OWN/'records/M422.before-stock-fingerprint-binding.original.jsonl').write_bytes(record.read_bytes())
 config['reviewPath']=REL+'/'+RECORD;config['reportPath']=REL+'/checks/M422.report.not-written.md';dump(OWN/CONFIG,config)
 dump(OWN/'CAS.four-genuine-M-decisions.before-normal-binding.json',{'createdAtUTC':now(),'originalWhole422':ref(original),'unchanged75Cards':ref(cards),'finalCombinedContextCAS':ref(OWN/'checks/CAS.final-combined-six-to-own-actual-four-contexts.json'),'FIRSTSeal':ref(OWN/'FIRST.actual-four-final-wording-M-decisions.seal.json'),'fourWholeChanges':deltas})
 source_map=read(PREV/'checks/REBUILD.two-M-final.minimal-host.json')
 explicit={config['landscapePath'],config['cardReviewPath'],'app/scripts/memoryCardReview.ts','package.json',*[x['viewPath'] for x in config['visibilityScopes']]}
 selected=[]
 for r in source_map['sourceMap']:
  alias=r['normalHostAlias']
  if alias not in explicit and not alias.startswith('app/public/data/') and '/memory-decks/' not in alias and 'chemie-b014-arrhenius-memory-remediation' not in alias:continue
  physical=cas['finalCanonical'] if alias==config['landscapePath'] else r['physicalRepositorySource']
  source=REPO/physical['path'];assert ref(source)==physical
  install(source,alias);selected.append({'normalHostAlias':alias,'physicalRepositorySource':physical})
 assert explicit<={r['normalHostAlias'] for r in selected}
 install(OWN/CONFIG,REL+'/'+CONFIG);install(record,config['reviewPath'])
 (HOST/'app/node_modules').symlink_to(REPO/'app/node_modules',target_is_directory=True)
 dump(OWN/'checks/REBUILD.M4.prebind.minimal-host.json',{'sourceMap':selected,'executionHost':HOST.relative_to(REPO).as_posix(),'sourceM2Map':ref(PREV/'checks/REBUILD.two-M-final.minimal-host.json'),'physicalImagesCopied':0})
 argv=['node',str(REPO/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/memoryCardReview.ts','--config='+REL+'/'+CONFIG,'--mode=check','--write-fingerprints']
 run('M422.fingerprint-bind',argv)
 private=HOST/config['reviewPath'];writer_lines=private.read_text().splitlines(keepends=True)
 (OWN/'checks/M422.successful-stock-writer-output.unselected-original.jsonl').write_bytes(private.read_bytes())
 writer={json.loads(l)['goalId']:(l,json.loads(l)) for l in writer_lines};before={json.loads(l)['goalId']:json.loads(l) for l in out}
 selected_lines=[];format_only=[]
 for line in original_lines:
  old=json.loads(line);gid=old['goalId'];new_line,new=writer[gid]
  if gid in decisions:
   expected=before[gid].copy();expected['fingerprint']=new['fingerprint'];assert expected==new and new['reason']==decisions[gid]['reason'];selected_lines.append(new_line)
  else:
   assert old==new,('unexpected nonTarget scientific/fingerprint delta',gid)
   if line!=new_line:format_only.append(gid)
   selected_lines.append(line)
 assert len(selected_lines)==422 and sum(a==b for a,b in zip(selected_lines,original_lines))==418
 private_cards=HOST/config['cardReviewPath'];card_writer=private_cards.read_bytes()
 (OWN/'checks/cards75.successful-stock-writer-output.unselected-original.jsonl').write_bytes(card_writer)
 assert [json.loads(l) for l in cards.read_text().splitlines()]==[json.loads(l) for l in card_writer.decode().splitlines()]
 shutil.copyfile(cards,private_cards);record.write_text(''.join(selected_lines));private.write_bytes(record.read_bytes())
 dump(OWN/'checks/CAS.successful-stock-writer-exact418-and75-preservation.json',{'checkedAtUTC':now(),'stockFingerprintWriterExitCode':0,
  'onlyFourSealedGenuineMDecisionsUseNewStockFingerprints':True,'all418OtherWholeObjectsAndFingerprintsExact':True,'all418OriginalRawLinesExact':True,
  'writerFormattingOnlyNonTargetGoalIds':format_only,'all75CardObjectsAndFingerprintsExact':True,'all75OriginalRawLinesExact':private_cards.read_bytes()==cards.read_bytes(),
  'cardWriterSerializationDiffered':card_writer!=cards.read_bytes(),'whole422TenViewsChecksExecuted':0,'scienceChangedToFitWriter':False})
 print(json.dumps({'stockBinding':0,'genuineMDecisions':4,'otherRawLinesExact':418,'wholeChecksSoFar':0,'hostBytes':sum(p.stat().st_size for p in HOST.rglob('*') if p.is_file() and not p.is_symlink())}))
def check_once():
 assert not (OWN/'checks/M422.whole422-ten-views-check.command.actual.json').exists()
 v=E15/'chemie-equilibrium-four-final-context-independent-V-20261015-v1'
 assert (v/'checks/V4.stock-targeted-helper.command.actual.json').exists()
 assert read(v/'checks/V4.stock-targeted-helper.command.actual.json')['exitCode']==0
 config=read(OWN/CONFIG);record=OWN/RECORD
 argv=['node',str(REPO/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/memoryCardReview.ts','--config='+REL+'/'+CONFIG,'--mode=check']
 run('M422.whole422-ten-views-check',argv)
 previous=read(PREV/'SELECTION.final-two-wording-genuine-M2.normal422.json');old=(REPO/previous['normalRecords']['path']).read_text().splitlines(keepends=True)
 new=record.read_text().splitlines(keepends=True);assert len(new)==422 and sum(a==b for a,b in zip(old,new))==418
 preserve=['13838147-c26d-54ca-b9be-5f2f0b8e9de5','f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528','6d3a2bad-8c67-5964-a720-375f138adaba']
 for gid in preserve:assert next(x for x in old if json.loads(x)['goalId']==gid)==next(x for x in new if json.loads(x)['goalId']==gid)
 cards=REPO/previous['all75CardsExact']['path'];assert ref(cards)==previous['all75CardsExact'] and (HOST/config['cardReviewPath']).read_bytes()==cards.read_bytes()
 original_map=read(OWN/'checks/REBUILD.M4.prebind.minimal-host.json');mapping={r['normalHostAlias']:r for r in original_map['sourceMap']}
 mapping[REL+'/'+CONFIG]={'normalHostAlias':REL+'/'+CONFIG,'physicalRepositorySource':ref(OWN/CONFIG)}
 mapping[config['reviewPath']]={'normalHostAlias':config['reviewPath'],'physicalRepositorySource':ref(record)}
 for alias,row in mapping.items():assert (HOST/alias).read_bytes()==(REPO/row['physicalRepositorySource']['path']).read_bytes()
 regular=[p for p in HOST.rglob('*') if p.is_file() and not p.is_symlink()];assert len(regular)==len(mapping)
 dump(OWN/'checks/REBUILD.four-M-final.minimal-host.json',{'role':'Exact minimal final M422 host; no images or whole repo','executionHost':HOST.relative_to(REPO).as_posix(),
   'sourceMap':[mapping[k] for k in sorted(mapping)],'physicalRegularFiles':len(regular),'physicalRegularBytes':sum(p.stat().st_size for p in regular),
   'onlySymlink':'app/node_modules -> repository dependency tree','finalCanonical':read(OWN/'checks/CAS.final-combined-six-to-own-actual-four-contexts.json')['finalCanonical'],
   'normalConfig':ref(OWN/CONFIG),'normalRecords':ref(record),'unchanged75Cards':ref(cards),'normalWholeCheckExecutions':1,'newScientificDecisions':4,'activeWrites':0})
 dump(OWN/'checks/FINAL.M422.actual418-raw-75cards-carbonyl2-138-preservation.json',{'checkedAtUTC':now(),'ordinaryGoals':422,'visibilityScopes':10,'genuineMDecisions':4,
   'original418RawLinesExact':True,'cards75Exact':True,'bothGenuineCarbonylM2RowsExact':True,'genuine138MRowExact':True,'stockWholeCheckExitCode':0,
   'successfulWholeCheckExecutions':1,'failedWholeCheckAttempts':0,'newCards':0,'newDPAOrVVotes':0,'sourceCourseApproval':False,'humanApproval':False,'humanTrial':False,'centralRuns':0,'activeWrites':0})
 print(json.dumps({'whole422TenViewsExit':0,'successfulWholeChecks':1,'418Exact':True,'75CardsExact':True,'carbonyl2And138Exact':True}))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('mode',choices=['prepare-bind','check-once']);a=p.parse_args()
 if a.mode=='prepare-bind':prepare_bind()
 else:check_once()
