# Apache-2.0. Finite inactive integration; original science remains immutable.
from pathlib import Path
import json,hashlib,shutil,os,datetime
repo=Path.cwd();base=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
own=base/'chemie-current407-native5-paired-resolution-and-P1-existing270-integration-technical-20261014-v1'
old=base/'chemie-current407-central-existing262-plus-reviewed-eight-inactive-root-20261014-v1'
shared=base/'chemie-current407-Q3-four-plus2652-PE-shared-native5-first-pass-technical-20261014-v1'
q3=base/'chemie-q3-four-v3-reviewed-current407-integration-preparation-20261014-v1'
host=Path('tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host')
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
sem='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
qa='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,j):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def copy(src,dst):dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);assert src.read_bytes()==dst.read_bytes()
def detach_write(dst,data):
 dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists():dst.unlink()
 dst.write_bytes(data)
def selected_lines(p,ids):return [l for l in p.read_text().splitlines(keepends=True) if l.strip() and json.loads(l)['goalId'] in ids]
def link_if_missing(src,dst):
 if dst.exists():
  assert sha(src)==sha(dst),(src,dst)
 else:dst.parent.mkdir(parents=True,exist_ok=True);os.link(src,dst)
ids=read(own/'native-five/resolution-index.json')['batchGoalIds'];qids=ids[:4];pe=ids[4]
old270=read(old/'receipts/ACTUAL.current407-inactive-chemistry-central-stock-report.completed270.json')['subjects'][0]
assert old270['strictComplete']==270
before=read(host/canon);after=read(shared/'candidate/canonical533.current407.exact-reviewed-Q3-plus-new-P2652.inactive.json')
bi={g['id']:g for g in before['goals']};ai={g['id']:g for g in after['goals']}
changed=[g for g in bi if bi[g]!=ai[g]]
assert set(changed)==set(qids[:2]),changed
assert len(ai)==len(bi)==533 and bi[pe]==ai[pe]
for gid in bi:
 for key in ['requires','contains','examples','applicability','type','semanticKind','semanticAtomic']:
  assert bi[gid].get(key)==ai[gid].get(key),(gid,key)
copy(host/canon,own/'inputs/whole533-current270-canonical.before.byte-exact.json')
copy(host/sem,own/'inputs/whole533-current270-semantic.before.byte-exact.json')
copy(host/qa,own/'inputs/current270-QA.before.byte-exact.json')
copy(shared/'candidate/canonical533.current407.exact-reviewed-Q3-plus-new-P2652.inactive.json',own/'candidate/canonical533.current407.N5.inactive.json')
ledger=read(shared/'candidate/semantic533.current407.exact-reviewed-Q3-plus-new-P2652.inactive.json');ledger['sourceLandscapePath']=canon
write(own/'candidate/semantic533.current407.N5.normal-alias.inactive.json',ledger)
copy(shared/'candidate/QA.current407.exact-reviewed-Q3-plus-unchanged-2652.inactive.json',own/'candidate/QA.current407.N5.inactive.json')
sourcecfg=old/'config/chemie-current407-central.inactive.config.json';config=read(sourcecfg);subject=config['subjects'][0]
config['reportId']='chemie-current407-native5-actual-existing270-plus-four-inactive-20261014-v1'
index=str(own/'native-five/resolution-index.json');subject['resolutionIndexPaths'].append(index)
priorowners=[]
for path in subject['resolutionIndexPaths'][:-1]:
 p=host/path;p=p if p.exists() else Path(path)
 for r in read(p)['resolutions']:
  if r['goalId'] in ids:priorowners.append({'goalId':r['goalId'],'indexPath':path,'resolutionDigest':r['resolutionDigest']})
for r in priorowners:
 subject['resolutionSupersessions'].append({'goalId':r['goalId'],'supersededIndexPath':r['indexPath'],'replacementIndexPath':index})
# Copy existing science records exactly; change only source/config addresses.
transports=[]
for lane,rel in [('A','atomicity/two-v3.original-independent-a.config.json'),('A','atomicity/two-corrosion.original-independent-a.config.json'),('P','positive/P4.original-independent-a.config.json'),('P','positive/P4.original-independent-b.config.json')]:
 src=q3/rel;c=read(src);rp=Path(c['reviewPath']);dst=own/lane/rp.name;copy(rp,dst)
 c['landscapePath']=canon;c['reviewPath']=str(dst)
 if 'semanticKindLedgerPath' in c:c['semanticKindLedgerPath']=sem
 out=own/'config'/f'{lane}.{src.name}';write(out,c)
 transports.append({'sourceConfig':str(src),'targetConfig':str(out),'sourceRecord':str(rp),'targetRecord':str(dst),'recordBytesExact':True})
 if lane=='A':subject['semanticAtomicityConfigPaths'].append(str(out))
 elif 'independent-a' in src.name:subject['positiveEvidenceConfigPaths'].append(str(out))
psrc=shared/'configs/P1.2652-PE-author-only.E0-G0.current-five-candidate.config.json';c=read(psrc)
rp=Path(c['reviewPath']);dst=own/'P/P1.2652.new-PE.E0-G0.original.byte-exact.jsonl';copy(rp,dst)
c.update({'landscapePath':canon,'semanticKindLedgerPath':sem,'reviewPath':str(dst)})
pconfig=own/'config/P1.2652.new-PE.E0-G0.normal-alias.config.json';write(pconfig,c)
transports.append({'sourceConfig':str(psrc),'targetConfig':str(pconfig),'sourceRecord':str(rp),'targetRecord':str(dst),'recordBytesExact':True,'newHumanApproval':False})
# Remove only selected2652 from its previous P34 owner; all other15 original lines stay exact.
pruned=[]
for i,path in enumerate(subject['positiveEvidenceConfigPaths']):
 p=host/path;p=p if p.exists() else Path(path);c=read(p)
 if pe not in c['scope']['goalIds']:continue
 assert path!=str(pconfig)
 source=Path(c['reviewPath']);p=host/source;p=p if p.exists() else source
 oldlines=p.read_text().splitlines(keepends=True);removed=[l for l in oldlines if json.loads(l)['goalId']==pe];remaining=[l for l in oldlines if json.loads(l)['goalId']!=pe]
 assert len(removed)==1
 copy(p,own/'inputs/P34.previous16.whole-original.byte-exact.jsonl')
 (own/'inputs/P2652.previous-valid-E1-G1.selected-original.byte-exact.jsonl').write_text(''.join(removed))
 dst=own/'P/P34.retained15.exact-except-selected2652.jsonl';dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(''.join(remaining))
 c['scope']['goalIds']=[g for g in c['scope']['goalIds'] if g!=pe];c['reviewPath']=str(dst)
 out=own/'config/P34.retained15.exact-except-selected2652.normal-alias.config.json';write(out,c);subject['positiveEvidenceConfigPaths'][i]=str(out)
 pruned.append({'previousOwnerConfig':path,'previousOwnerRecord':str(source),'remaining15RecordBytesExact':True,'newOwner':str(pconfig)})
assert len(pruned)==1
subject['positiveEvidenceConfigPaths'].append(str(pconfig))
# The central stock contract accepts one whole memory review group. Group membership is technical only.
msrc=Path(subject['memoryReviewConfigPath']);mc=read(msrc);mr=Path(mc['reviewPath']);mbytes=mr.read_text().splitlines(keepends=True)
assert len(mbytes)==407
copy(mr,own/'inputs/M407.previous-whole-science.byte-exact.jsonl')
replacements={};mtrans=[]
for rel in ['memory/two-v3.original-independent-a.review.jsonl','memory/two-corrosion.existing-unchanged.review.jsonl']:
 src=q3/rel;copy(src,own/'M/originals'/src.name)
 for l in src.read_text().splitlines():
  r=json.loads(l);oldr=json.loads(next(x for x in mbytes if json.loads(x)['goalId']==r['goalId']))
  science=json.loads(json.dumps(r));r['reviewId']=mc['reviewId'];replacements[r['goalId']]=json.dumps(r,ensure_ascii=False)+'\n'
  mtrans.append({'goalId':r['goalId'],'original':science,'grouped':r,'previousCentralRecord':oldr,'onlyTransportField':'reviewId','fingerprintReasonDateReviewerStatusExact':True})
assert set(replacements)==set(qids)
mnew=[replacements.get(json.loads(l)['goalId'],l) for l in mbytes]
dst=own/'M/M407.actual-original-science-plus-exact-reviewed-Q3-four.technical-grouping.jsonl';dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(''.join(mnew))
mc['reviewPath']=str(dst);mc['reportPath']=str(own/'checks/M407.stock.md');mout=own/'config/M407.original-science.normal-alias.technical-grouping.config.json';write(mout,mc);subject['memoryReviewConfigPath']=str(mout)
configpath=own/'config/chemie-current407-native5-existing270.inactive.config.json';write(configpath,config)
write(own/'CAS.actual-whole-goal-and-record-selection-existing270-to-native5.actual.json',{'schemaVersion':1,'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseStrict270Ids':old270['strictCompleteGoalIds'],'changedWholeGoalIds':changed,'allOther531WholeNodesExact':True,'2652WholeBodyAndVExact':True,'allGlobalRequiresContainsAndApplicabilityExact':True,'originalCandidate407Preserved':True,'previousDOwnersWithNewNative5Supersession':priorowners,'originalScienceExactConfigTransports':transports,'selectedPreviousPEProfile':pruned,'M4OriginalScienceTechnicalGrouping':mtrans,'newScientificVotes':0,'newHumanApproval':False,'wholeHB021SourceApproval':False,'excludedNineSourceHoldsPreserved':True,'activeWrites':False})
# Copy only own finite package and direct selected dependencies. Hardlinks are never modified.
for root in [own]:
 for src in root.rglob('*'):
  if src.is_file():link_if_missing(src,host/src)
dependencies=[Path(read(own/'config/P.P4.original-independent-a.config.json')['reviewCriteriaPath'])]
for cpath in transports:
 c=read(Path(cpath['targetConfig']))
 if 'reviewCriteriaPath' in c:dependencies.append(Path(c['reviewCriteriaPath']))
for src in dependencies:link_if_missing(src,host/src)
for src,dst in [(own/'candidate/canonical533.current407.N5.inactive.json',host/canon),(own/'candidate/semantic533.current407.N5.normal-alias.inactive.json',host/sem),(own/'candidate/QA.current407.N5.inactive.json',host/qa)]:detach_write(dst,src.read_bytes())
assets=[]
for gid in qids[:2]:
 logical=Path(f'app/public/assets/goal-visualizations/chemie/{gid}/{gid}.png')
 src=shared/'public-root'/str(logical).removeprefix('app/public/')
 assert src.exists()
 detach_write(host/logical,src.read_bytes());assets.append({'path':str(logical),'sha256':sha(src),'bytes':src.stat().st_size,'exactPreviouslyIndependentlyReviewedPixels':True})
write(own/'CHECK.private-host-detached-aliases-and-exact-two-PNG-imports.actual.json',{'host':str(host),'normalAliasesOnly':[canon,sem,qa],'detachedBeforeWrite':True,'assets':assets,'newPixelVotes':0,'mainRepositoryActiveAliasesMutated':False})
print(json.dumps({'goalDelta':changed,'originalDsupersessions':len(priorowners),'newStrictExpected':274,'config':str(configpath),'assets':assets}))
