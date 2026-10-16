#!/usr/bin/env python3
# Apache-2.0. Finite isolated QA materialization; no active R normal writes.
import pathlib,json,hashlib,datetime,os,argparse
R=pathlib.Path(__file__).resolve().parents[7];os.chdir(R)
E=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16');O=E/'chemie-current629-memory-part1-part2-isolated-normal-H-integration-technical-20261016-v1';I=E/'chemie-shared-narrow-memory36-Mrefs43-placement309-fresh-independent-a-20261016-v1';N=E/'chemie-current435-shared-narrow-memory-units-and-acquisition-placement-author-successor-20261016-v1';H=R/'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1';B=R/'tmp/chemie-m7-resumed-20261016/memory-final629-integration-private-backups-20261016-v1'
def read(p):return json.loads(pathlib.Path(p).read_text())
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def pin(p):
 p=pathlib.Path(p);return {'path':str(p.relative_to(R)) if p.is_absolute() and p.is_relative_to(R) else str(p),'sha256':'sha256:'+sha(p),'bytes':p.stat().st_size}
def selected(p):
 path=pathlib.Path(p['path']);assert sha(path)==p['sha256'].removeprefix('sha256:');assert path.stat().st_size==p['bytes'];return path
args=argparse.ArgumentParser();args.add_argument('--ready-h-native17-finished',action='store_true');opt=args.parse_args();assert opt.ready_h_native17_finished,'Requires actual parent READY-H-NATIVE17-FINISHED receipt, not time elapsed.'
assert not H.is_symlink() and H.resolve()==H
phasePath=E/'chemie-current435-source2-split6-supported-input-integration-technical-20261016-v1/MATERIALIZE.phase1.actual-core-inputs-and-exact-before-after-map.json';phase=read(phasePath);assert len(phase['records'])==75
phaseBy={x['normalPath']:x for x in phase['records']}
for p in phase['records']:
 hp=H/p['normalPath'];assert sha(hp)==p['selectedSha256'],f'Phase1 CAS changed {p["normalPath"]}'
s=read(N/'OUTPUTS.finite-shared-narrow-memory-author.selector.json');assert sha(N/'OUTPUTS.finite-shared-narrow-memory-author.selector.json')=='9df0799d71e9e209525c28801c44e70a9099c7c4ced136fdc04ed0e16e4ca0e5';i=read(I/'OUTPUTS.finite-PART2-independent36-unit43-reference309-placement-KEEP.selector.json');assert sha(I/'OUTPUTS.finite-PART2-independent36-unit43-reference309-placement-KEEP.selector.json')=='56ec5bad4b18807fa49b7db48e7e853c2872d7bc011b49efeaaae26de5e86d20'
vm=read(O/'NORMAL-H.all47-purpose-to-final-whole-view-alias-map.json')['purposes'];assert len(vm)==47;writes=[]
canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';kinds='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';config='curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';review='curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.review.jsonl';cards='curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.cards.review.jsonl'
writes.extend([(canonical,selected(s['selected']['wholeCanonical']),'whole629 canonical with ordinary435 exact'),(kinds,O/'SEMANTIC.current629.retained593-plus36-supported-memory.stock-schema-parser-valid.json','whole629 kinds retained593 plus supported36 memory'),(config,O/'NORMAL-H.current629-M435-cards77-acquisition39.config.json','normal-H M435 config39'),(review,selected(i['selected']['whole435MSupportedReferences']),'M435 supported43 additions exact392 historical lines'),(cards,selected(s['baselineWhole77CardReviews']),'same77 reviewed cards ledger')])
for p in vm:
 selected(p['selectedSource'])
 for alias in p['normalAliases']:
  if alias in phaseBy:assert sha(H/alias)==phaseBy[alias]['selectedSha256']
  else:assert not (H/alias).exists(),f'Unexpected pre-existing new H-only alias {alias}'
  writes.append((alias,pathlib.Path(p['selectedSource']['path']),'whole-final-view-purpose'+str(p['purposeIndex'])))
assert len([a for p in vm for a in p['normalAliases'] if a in phaseBy])==45
script='app/scripts/memoryCardReview.ts';assert sha(R/script)=='f7a7f2fdcb798fcd92a71fc7968232dea107b25f47214a9e8210eba7af53e0f9';assert sha(H/script)=='9e06425851e85d22b284530e81a459c120c200fd0a019446ff87953c538c2672';writes.append((script,R/script,'reviewed QA role-specificity correction; UNLINK then new regular write'))
# Capture active repository paths before any detachment/writes.
activePaths={r['normalPath'] for r in phase['records']}|{config,review,cards,script}|{a for a,_,_ in writes};activeBefore={a:pin(R/a) if (R/a).is_file() else None for a in sorted(activePaths)}
preflight=[]
for rel,src,role in writes:
 target=H/rel;assert not pathlib.Path(rel).is_absolute() and '..' not in pathlib.Path(rel).parts
 before=pin(target) if target.is_file() else None
 preflight.append({'normalPath':rel,'source':pin(src),'role':role,'before':before,'beforeResolvedPath':str(target.resolve(strict=False)),'beforeDirectSymlink':os.readlink(target) if target.is_symlink() else None,'beforeLinkCount':target.stat().st_nlink if target.exists() else None})
pref=O/'PREFLIGHT.actual-phase1-selected-CAS-and-contained-H-write-set.json';assert not pref.exists();pref.write_text(json.dumps({'createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualParentReadyMessage':'READY-H-NATIVE17-FINISHED: native17 prepare/check complete; root no further canonical writes. Received before this execution.','phase1':pin(phasePath),'all75Phase1SelectedHashesExact':True,'H':str(H.relative_to(R)),'writes':preflight,'activeRPathsBefore':activeBefore,'normalRSchemasAndProtectedSubjectsNotInWriteSet':True},ensure_ascii=False,indent=2)+'\n')
assert not B.exists();B.mkdir(parents=True);detachments=[];receipts=[]
def contained_parent(relative):
 parent=H
 for component in pathlib.Path(relative).parts[:-1]:
  parent=parent/component
  if parent.is_symlink():
   original=parent.resolve(strict=True);assert original.is_dir();children=list(original.iterdir());parent.unlink();parent.mkdir()
   for child in children:(parent/child.name).symlink_to(child,target_is_directory=child.is_dir())
   detachments.append({'detachedHostDirectory':str(parent.relative_to(R)),'previousTarget':str(original),'mode':'H-only shallow directory detach; unrelated children retained read-only links'})
  elif not parent.exists():parent.mkdir()
  assert parent.is_dir() and parent.resolve().is_relative_to(H),f'Parent containment failed {parent}'
 return parent
for index,(rel,src,role) in enumerate(writes):
 # Read complete selected bytes before changing an alias; writes always replace inode.
 payload=src.read_bytes();parent=contained_parent(rel);target=H/rel;assert target.parent.resolve().is_relative_to(H);prior=preflight[index]['before']
 if prior:
  assert sha(target)==prior['sha256'].removeprefix('sha256:');bp=B/(f'{index:03d}.'+target.name);bp.write_bytes(target.read_bytes());backup=pin(bp)
 else:assert not target.exists() and not target.is_symlink();backup=None
 if target.exists() or target.is_symlink():target.unlink()
 with target.open('xb') as stream:stream.write(payload)
 assert not target.is_symlink() and target.resolve().is_relative_to(H) and target.stat().st_nlink==1
 assert sha(target)==hashlib.sha256(payload).hexdigest()
 receipts.append({'index':index,'normalPath':rel,'role':role,'selectedSource':pin(src),'before':prior,'privateBackup':backup,'afterHostPhysical':pin(target),'resolvedAfter':str(target.resolve()),'containedOwnRegularNewInode':True})
# Ensure own report path is physically contained before --write-report can mkdir.
reportRelative=read(H/config)['reportPath'];reportParent=contained_parent(reportRelative);assert reportParent.resolve().is_relative_to(H)
# Exact protected inputs, ordinary body universe and retained kind decisions.
for r in phase['records']:
 if r['normalPath'] not in {w[0] for w in writes}:assert sha(H/r['normalPath'])==r['selectedSha256']
after=read(H/canonical);before=read(phaseBy[canonical]['selectedSource']);kind=read(H/kinds);oldkind=read(phaseBy[kinds]['selectedSource']);assert len(after['goals'])==629 and len(kind['decisions'])==629;assert kind['decisions'][:593]==oldkind['decisions'];oldgoals={g['id']:g for g in before['goals']};aftergoals={g['id']:g for g in after['goals']}
ordinary=[d['goalId'] for d in oldkind['decisions'] if d['semanticKind']=='curricularAtomic'];assert len(ordinary)==435
for gid in ordinary:assert oldgoals[gid]==aftergoals[gid]
assert sha(H/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')=='97da44c6935e0769217e8e91432bd04ba3abdddbb247392c2d7917a67449324e'
for a,b in activeBefore.items():
 if b is None:assert not (R/a).exists()
 else:assert pin(R/a)==b, f'Active R changed {a}'
out={'createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'actual finite isolated-H memory629 materialization; not active R adoption','H':str(H.relative_to(R)),'preflight':pin(pref),'writes':receipts,'shallowContainedParentDetachments':detachments,'actualWhole629':pin(H/canonical),'actualWhole629Kinds':pin(H/kinds),'actualNormalMConfig':pin(H/config),'actualNormalM435':pin(H/review),'actualNormalCards77':pin(H/cards),'actualQAScript':pin(H/script),'old593KindsWholeExact':True,'ordinary435WholeBodiesExact':True,'allOtherPhase1InputHashesExactIncludingQA458Decks14AndSourceInputs':True,'allRNormalSnapshotPathsExactUnchanged':True,'privateBackups':str(B.relative_to(R)),'reportParentContainedH':str(reportParent.relative_to(R)),'normalMemoryCheckExecutedYet':False,'noHumanOrM7Claim':True}
p=O/'MATERIALIZE.actual-contained-H-canonical629-kinds629-views47-M435-QApatch.json';assert not p.exists();p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'receipt':pin(p),'writeCount':len(receipts),'parentDetaches':len(detachments),'actualHCanonical':out['actualWhole629'],'actualHKinds':out['actualWhole629Kinds'],'RNormalUnchanged':True},indent=2))
