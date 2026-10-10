import json,pathlib,hashlib,shutil,copy,sys
R=pathlib.Path('/home/enpasos/projects/skillpilot');C=pathlib.Path('/tmp/skillpilot-economics-combined548-independent-xri79b2w');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current577-twentytwo-qualified470-independent-combined-scope-review-v1'
D0=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current577-twentytwo-qualified-and-nine-existing-access-fieldwise-root-candidate-v1'
H=D0/'three-actually-qualified-foreign-scope-seals-final-author-followup-v2/actual-final-twentytwo-qualified-nine-existing470-current577-fieldwise-author-handoff-with-three-real-foreign-scope-seals.json';h=json.loads(H.read_text())
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';BOOK='app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
def sh(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def info(p):return {'path':str(p.relative_to(R)),'sha256':sh(p),'bytes':p.stat().st_size}
def wr(n,x):p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def cp(src,rel):
 dst=C/rel;assert dst.resolve().is_relative_to(C),str(dst);assert not dst.is_symlink();assert not dst.exists() or not dst.samefile(src);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);assert dst.read_bytes()==src.read_bytes()
def snap(p):q=O/'whole-inputs'/p.relative_to(R);q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists();shutil.copyfile(p,q);return info(q)
if sys.argv[1]=='prepare':
 O.mkdir(exist_ok=False);assert sh(H)=='7d54997af6826b86654e8fc5542b15016cabdaf4df0ea334a2beaffd85bef6db';inputs={}
 def collect(v):
  if isinstance(v,dict):
   if 'path'in v and 'sha256'in v:
    p=R/v['path'];assert sh(p)==v['sha256'],str(p);inputs[v['path']]=info(p)
   for z in v.values():collect(z)
  elif isinstance(v,list):
   for z in v:collect(z)
 collect(h)
 b=json.loads((R/h['canonicalBefore']['path']).read_text());a=json.loads((R/h['canonicalCandidate']['path']).read_text());bg={g['id']:g for g in b['goals']};ag={g['id']:g for g in a['goals']};navids={n['wholeBefore']['id'] for n in h['actualFourWholeNavDeltas']};newids=set(h['newQualifiedPracticeGoalIds']);assert len(newids)==22;assert set(ag)==set(bg)|newids
 assert all(bg[g]==ag[g] for g in bg if g not in navids);assert len(bg)==555 and len(ag)==577
 navd=[]
 for n in h['actualFourWholeNavDeltas']:
  x=n['wholeBefore'];y=n['wholeAfter'];assert x==bg[x['id']] and y==ag[x['id']];assert y['contains'][:len(x['contains'])]==x['contains'];add=y['contains'][len(x['contains']):];assert len(add)==len(set(add)) and set(add)<=newids;fields=[k for k in set(x)|set(y) if x.get(k)!=y.get(k)];assert set(fields)<=set(['contains','description','descriptionEn']);assert not y['requires'];navd.append({'id':x['id'],'fields':fields,'wholeBefore':x,'wholeAfter':y,'exactOldChildPrefix':True,'newChildren':add,'scientificRole':'pure_navigation_no_extra_performance_or_source_claim'})
 vs=[]
 for r in h['views']:
  x=json.loads((R/r['before']['path']).read_text());y=json.loads((R/r['candidate']['path']).read_text());assert (R/r['activePath']).read_bytes()==(R/r['before']['path']).read_bytes();assert len(x['rootNodes'])==len(y['rootNodes'])==1;c0=x['rootNodes'][0]['children'];c1=y['rootNodes'][0]['children'];assert c1[:len(c0)]==c0;assert c1[len(c0):]==r['wholeAddedPracticeTargetRefs'];xx=copy.deepcopy(x);xx['viewId']=y['viewId'];xx['rootNodes'][0]['children']=c1;assert xx==y;assert all(z['kind']=='goalEntry'and z['projectionRole']=='target'and ag[z['goalId']].get('examData')for z in r['wholeAddedPracticeTargetRefs']);vs.append({'activePath':r['activePath'],'wholeBefore':r['before'],'wholeAfter':r['candidate'],'wholeAppendedRefs':r['wholeAddedPracticeTargetRefs'],'exactBeforePrefixAndOtherRoles':True})
 assert sum(len(r['wholeAppendedRefs'])for r in vs)==470
 # Whole released body union exactly is the new CAN object union; 22 new objects refer to foreign whole science.
 bodies=json.loads((R/h['wholeNew22Bodies']['path']).read_text());bodies=bodies if isinstance(bodies,list)else bodies.get('goals',bodies.get('materials'));assert {g['id']for g in bodies}==newids and all(g==ag[g['id']]for g in bodies)
 for p in [D0/'actual-v14-SEM577-P336685-book577-technical-only-freeze.json',D0/'whole577-original555-kinds-twentytwo-qualified-practice-four-native-sourceFPs.SEM-v14.json',D0/'whole-economics-book-config-current577-v14-SEM-P336.INERT.json',D0/'whole-central-registry-only-Economics-v14-SEM-P-config-pointers.INERT.json',D0/'actual-native43-configs-P336-SEM577-all-original-profiles-inputs-statuses.v14-root-PASS.json']:
  inputs[str(p.relative_to(R))]=info(p)
 # Freeze all previously proven required standard machine inputs at today's actual bytes.
 OLD=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-existing-qualified-accesses-independent-merge-audit-v1/actual-before-whole-input-guards-and-private-capsule-binding.json';old=json.loads(OLD.read_text())
 rels=[x['path']for x in old['inputs']if '/wirtschaft-M4-nine-existing-qualified-material-access555-root-author-v1/'not in x['path']]
 for rel in rels:
  p=R/rel;inputs[rel]=info(p)
  if rel not in ['app/scripts/generateCurriculumQualityStatus.ts'] and not '/quality/goal-evidence/'in rel:cp(p,rel)
 # Same native checker; only instrumental observer export/push additions.
 prod=(R/'app/scripts/generateCurriculumQualityStatus.ts').read_text();obs=(C/'app/scripts/generateCurriculumQualityStatus.ts').read_text();line=next(l for l in obs.splitlines(True)if 'ownProjectedScopeRows.push('in l);tail='\nexport const ownProjectedScopeRows:any[]=[];\nexport {routeProfiles,evaluateRouteProfile,collectWholeMaterialPrerequisiteClosure,readJurisdictionCoverageByLandscapeId,evaluateJurisdictionCoverage};\n';assert obs.replace(line,'').replace(tail,'')==prod;assert sh(R/'app/scripts/generateCurriculumQualityStatus.ts')=='656084b7cd9d6cb5324361b927b9f761596c572d7e4f616c7b13da061f4b1336'
 snapshots=[]
 for rel,i in sorted(inputs.items()):snapshots.append({'actualOriginal':i,'immutableOwnSnapshot':snap(R/rel)})
 shutil.copyfile(C/'native-combined-scope.ts',O/'actual-native-scope-observer-helper.raw.ts');shutil.copyfile(__file__,O/'actual-executed-safe-prepare-stage-helper.raw.py')
 wr('actual-before-input-guards-and-immutable-whole-snapshots.json',{'inputs':list(inputs.values()),'wholeSnapshots':snapshots,'privateCapsule':str(C),'allWritesResolveInsidePrivateCapsule':True,'productionCheckerExact':info(R/'app/scripts/generateCurriculumQualityStatus.ts'),'instrumentalObserverOnly':{'push':line,'tail':tail},'activeWrites':0})
 wr('actual-whole-555-577-twentytwo-body-four-nav-thirtyfive-view-independent-delta-review.json',{'oldGoalCount':555,'candidateGoalCount':577,'all551OtherOldWholeGoalObjectsExact':True,'all336OrdinaryContractsAndAllOldExamDataExact':True,'wholeNewBodiesExactForeignQualifiedReleaseUnion':True,'newIDs':sorted(newids),'wholeNavReview':navd,'wholeViewReview':vs,'actualAppendedTargetRefs':470,'newOrdinaryOrPOnlyOrSourceClaims':0,'foreignScopeReceipts':h['foreignScopeReceipts'],'foreignWholeScienceReceipts':h['foreignWholeScienceReceipts']})
 print(json.dumps({'inputs':len(inputs),'wholeNavs':len(navd),'views':len(vs),'refs':470,'goals':[555,577],'activeWrites':0}))
elif sys.argv[1]=='before':
 cp(R/h['canonicalBefore']['path'],CAN)
 for r in h['views']:cp(R/r['before']['path'],r['activePath'])
 cp(R/REG,REG);cp(R/BOOK,BOOK);print('Actual555 baseline safely staged.')
elif sys.argv[1]=='after':
 cp(R/h['canonicalCandidate']['path'],CAN)
 for r in h['views']:cp(R/r['candidate']['path'],r['activePath'])
 reg=json.loads((D0/'whole-central-registry-only-Economics-v14-SEM-P-config-pointers.INERT.json').read_text());eco=next(x for x in reg['subjects']if x['subject']=='wirtschaftswissenschaften');sem=eco['semanticKindLedgerPath'];cp(D0/'whole577-original555-kinds-twentytwo-qualified-practice-four-native-sourceFPs.SEM-v14.json',sem)
 base=R/pathlib.Path(sem).parent
 for p in base.rglob('*'):
  if p.is_file():cp(p,str(p.relative_to(R)))
 cp(D0/'whole-central-registry-only-Economics-v14-SEM-P-config-pointers.INERT.json',REG);cp(D0/'whole-economics-book-config-current577-v14-SEM-P336.INERT.json',BOOK);print('Actual577 candidate safely staged.')
elif sys.argv[1]=='dropref':
 row=next(r for r in h['views']if r['activePath'].endswith('de-be-gym-economics-gk.view.json'));p=C/row['activePath'];v=json.loads(p.read_text());gid='ceec91b6-1ef7-5145-ade5-47f8db65cc86';kids=v['rootNodes'][0]['children'];assert sum(x.get('goalId')==gid for x in kids)==1;v['rootNodes'][0]['children']=[x for x in kids if x.get('goalId')!=gid];assert p.resolve().is_relative_to(C)and not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');wr('actual-refdrop-negative-only-one-BE-GK-fair-trade-target-ref.json',{'viewPath':row['activePath'],'goalId':gid,'onlyDelta':'remove_one_new_practice_target_ref','ordinaryTargetChanged':False});print('BE-GK fair-trade new ref removed only privately.')
elif sys.argv[1]=='dropsupport':
 row=next(r for r in h['views']if r['activePath'].endswith('de-be-gym-economics-gk.view.json'));p=C/row['activePath'];v=json.loads(p.read_text());gid='87ee2b5a-50ea-5b07-a813-7ff8042e2524';kids=v['rootNodes'][0]['children'];matches=[x for x in kids if x.get('goalId','').startswith('87ee2b5a')];assert len(matches)==1 and matches[0]['projectionRole']=='prerequisiteOnly';gid=matches[0]['goalId'];v['rootNodes'][0]['children']=[x for x in kids if x.get('goalId')!=gid];assert p.resolve().is_relative_to(C)and not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');wr('actual-supportdrop-negative-only-one-BE-GK-trade-distribution-prerequisiteOnly.json',{'viewPath':row['activePath'],'goalId':gid,'wholeRemovedEntry':matches[0],'onlyDelta':'remove_existing_required_support_entry','ordinaryTargetChanged':False});print('BE-GK required 87ee support removed only privately.')
