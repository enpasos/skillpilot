import pathlib,json,hashlib,shutil,datetime,os,gzip,tarfile
R=pathlib.Path('/home/enpasos/projects/skillpilot');W=pathlib.Path(__file__).parent;F=W/'frozen';C=W/'candidate';D=R/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review';h=lambda b:hashlib.sha256(b).hexdigest();J=lambda o:(json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode();paths=set()
for root in ['app/scripts','app/src','contracts/curriculum-package']:
 for d,ds,fs in os.walk(R/root):
  ds[:]=[x for x in ds if x not in ['node_modules','__pycache__']]
  paths.update(pathlib.Path(d)/n for n in fs)
for r in json.loads((D/'file-change-review.json').read_text())['files']:paths.add(R/r['path'])
paths.update((R/'curricula/DE/Gymnasium/canonical').glob('*.de.json'))
for p in ['AGENTS.md','app/package.json','app/tsconfig.json','app/tsconfig.node.json','backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java','backend/src/main/java/com/skillpilot/backend/service/LearnerService.java','curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-informatik.pdf','curricula/DE/Gymnasium/input/SH/Fachanforderungen_Informatik_Sekundarstufe_2021_barrierearm.pdf']:paths.add(R/p)
size=sum(p.stat().st_size for p in paths);free=shutil.disk_usage(W).free;assert free-size-600_000_000>1_000_000_000
rows=[]
for p in sorted(paths):
 rel=p.relative_to(R);raw=p.read_bytes();out=F/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(raw);rows.append({'path':str(rel),'sha256':h(raw),'bytes':len(raw)})
for p in F.rglob('*'):
 out=C/p.relative_to(F)
 if p.is_dir():out.mkdir(parents=True,exist_ok=True)
 else:out.parent.mkdir(parents=True,exist_ok=True);os.link(p,out)
canonical=[x for x in rows if str(pathlib.Path(x['path']).parent)=='curricula/DE/Gymnasium/canonical'];assert len(canonical)==21
expect={'MATHEMATIK':'e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06','POLITIKWIRTSCHAFT':'29d02016b7e31b5683b1d51196e21c68ab4a310b8a88aa1a09bd5f30d1ee2eef','INFORMATIK':'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e'}
for key,value in expect.items():assert next(x for x in canonical if '_'+key+'.'in x['path'])['sha256']==value
for row in rows:assert h((R/row['path']).read_bytes())==row['sha256']
(W/'frozen-manifest.json').write_bytes(J({'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':rows,'canonical21':canonical,'space':{'freeBefore':free,'sourceCopyBytes':size,'hardlinkCandidateCopiesNoBytes':True,'reserve':600000000},'currentCodeFrame':'actual current bytes; no Git command or V57 relabel; parent reports V74ae031 and separate UI work','hostQA':'complete existing Host QA/assets mounted RO at actual paths, not copied or stubbed','sourceA84Unchanged':True}))
# Exact V2 overlay is historical input; reconstruct only in own private candidate via atomic replacement.
P=R/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-material-implementation-candidate'
with tarfile.open(P/'candidate-overlay.tar.gz','r:gz')as archive:
 for entry in archive.getmembers():
  assert entry.isfile()or entry.isdir();assert not pathlib.PurePosixPath(entry.name).is_absolute()and'..'not in pathlib.PurePosixPath(entry.name).parts
  if entry.isfile():
   rel=entry.name
   if rel=='app/scripts/generateCurriculumQualityStatus.ts':continue
   raw=archive.extractfile(entry).read();out=C/rel;out.parent.mkdir(parents=True,exist_ok=True);tmp=out.with_name(out.name+'.v3-new');tmp.write_bytes(raw);os.replace(tmp,out)
info=C/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';assert h(info.read_bytes())=='7586e38b7c96688bc8c5f02b2e2b1327284d271c73404693c9f872d29422d661'
(W/'initial-review-bindings.json').write_bytes(J({'reviewSealSha256':h((D/'review-seal.json').read_bytes()),'v2SourceSha256':h(info.read_bytes()),'materialSuccessorSha256':h((R/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-material-review-corrections/native-examData.json').read_bytes()),'candidateOverlayAppliedExceptStaleWholeCQRCode':True}));print(json.dumps({'files':len(rows),'bytes':size,'canonical21':len(canonical),'remainingRam':shutil.disk_usage(W).free}))
