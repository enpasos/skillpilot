import json,pathlib,hashlib,shutil,copy,sys
R=pathlib.Path('/home/enpasos/projects/skillpilot');C=pathlib.Path('/tmp/skillpilot-economics-combined548-independent-xri79b2w');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current597-legal-social-independent-combined-scope-review-v1';D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current597-legal-social-qualified577-fieldwise-combined-author-a-v1';H=D/'actual-final-current577-to597-legal-social311-fieldwise-combined.AUTHOR-handoff.json';h=json.loads(H.read_text());I=R/h['wholeAuthorIndex']['path'];i=json.loads(I.read_text());CAN=i['activeCanonicalPath'];REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';BOOK='app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
def sh(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def info(p):return {'path':str(p.relative_to(R)),'sha256':sh(p),'bytes':p.stat().st_size}
def wr(n,x):p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def cp(src,rel):
 dst=C/rel;assert dst.resolve().is_relative_to(C),str(dst);assert not dst.is_symlink();assert not dst.exists()or not dst.samefile(src);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);assert dst.read_bytes()==src.read_bytes()
def writecap(rel,j):
 dst=C/rel;assert dst.resolve().is_relative_to(C)and not dst.is_symlink();dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def stage(after):
 cp(R/i['canonicalCandidate'if after else'canonicalBefore']['path'],CAN)
 for row in i['views']:cp(R/row['candidate'if after else'before']['path'],row['activePath'])
 cp(R/REG,REG);cp(R/BOOK,BOOK)
 if after:
  sem=h['wholeConditional597SEMLedger']['path'];cp(R/sem,sem)
  reg=json.loads((C/REG).read_text());eco=next(x for x in reg['subjects']if x['subject']=='wirtschaftswissenschaften');eco['semanticKindLedgerPath']=sem;writecap(REG,reg)
  book=json.loads((C/BOOK).read_text());book['semanticKindLedgerPath']=sem;writecap(BOOK,book)
 print('Safely staged',597 if after else 577,'private only')
if sys.argv[1]=='prepare':
 O.mkdir(exist_ok=False);assert sh(H)=='20dc4d12265e1774a6ec526e888eef83c6c4ac270bcb87b676eb47715f2caa50';inputs={}
 def collect(v):
  if isinstance(v,dict):
   if isinstance(v.get('path'),str)and'sha256'in v:
    p=R/v['path'];assert sh(p)==v['sha256'],str(p);inputs[v['path']]=info(p)
   for z in v.values():collect(z)
  elif isinstance(v,list):
   for z in v:collect(z)
 collect(h);collect(i)
 b=json.loads((R/i['canonicalBefore']['path']).read_text());a=json.loads((R/i['canonicalCandidate']['path']).read_text());bg={g['id']:g for g in b['goals']};ag={g['id']:g for g in a['goals']};new=set(i['newMaterialIds']);assert len(bg)==577 and len(ag)==597 and len(new)==20 and set(ag)==set(bg)|new;assert(R/CAN).read_bytes()==(R/i['canonicalBefore']['path']).read_bytes()
 navids={r['navGoalId']for r in i['exactFourOldNavFieldChanges']};fa=i['existingFa2TagOnlyWholeDelta'];fid=fa['wholeBefore']['id'];assert all(bg[g]==ag[g]for g in bg if g not in navids|{fid});assert bg[fid]==fa['wholeBefore']and ag[fid]==fa['wholeAfter'];xx=copy.deepcopy(bg[fid]);xx['tags']=ag[fid]['tags'];assert xx==ag[fid]and ag[fid]['tags']==['GK','LK','Practice','Assessment'];assert bg[fid]['examData']==ag[fid]['examData']
 navs=[]
 for row in i['exactFourOldNavFieldChanges']:
  x=row['wholeBefore'];y=row['wholeFinalAfter'];assert x==bg[x['id']]and y==ag[x['id']];assert y['contains'][:len(x['contains'])]==x['contains'];add=y['contains'][len(x['contains']):];assert len(add)==len(set(add))and set(add)<=new;fields=[k for k in set(x)|set(y)if x.get(k)!=y.get(k)];assert set(fields)<= {'contains','description','descriptionEn','applicability'};assert not y['requires'];navs.append({'id':x['id'],'wholeBefore':x,'wholeAfter':y,'actualChangedFields':fields,'actualAppendedChildren':add,'role':'pure practice navigation; no extra performance or source claim'})
 vs=[]
 for row in i['views']:
  x=json.loads((R/row['before']['path']).read_text());y=json.loads((R/row['candidate']['path']).read_text());assert(R/row['activePath']).read_bytes()==(R/row['before']['path']).read_bytes();assert len(x['rootNodes'])==len(y['rootNodes'])==1;c0=x['rootNodes'][0]['children'];c1=y['rootNodes'][0]['children'];assert c1[:len(c0)]==c0;assert c1[len(c0):]==row['wholeActualAddedReferences'];xx=copy.deepcopy(x);xx['viewId']=y['viewId'];xx['rootNodes'][0]['children']=c1;assert xx==y;assert all(z['kind']=='goalEntry'and z['projectionRole']=='target'and ag[z['goalId']].get('examData')for z in row['wholeActualAddedReferences']);vs.append({'activePath':row['activePath'],'before':row['before'],'candidate':row['candidate'],'wholeAppendedRefs':row['wholeActualAddedReferences'],'ordinaryAndPOnlyRolesPreserved':True})
 assert sum(len(v['wholeAppendedRefs'])for v in vs)==311
 body=json.loads((R/i['newBodiesWhole']['path']).read_text());body=body if isinstance(body,list)else body.get('goals',body.get('materials'));assert {g['id']for g in body}==new and all(g==ag[g['id']]for g in body)
 # exact current native inputs from the independently accepted predecessor; current v14 config sources appended explicitly
 old=json.loads((R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current577-twentytwo-qualified470-independent-combined-scope-review-v1/actual-before-input-guards-and-immutable-whole-snapshots.json').read_text())
 for q in old['inputs']:
  p=R/q['path'];inputs[q['path']]=info(p)
  if '/quality/goal-evidence/'not in q['path']and q['path']!='app/scripts/generateCurriculumQualityStatus.ts':cp(p,q['path'])
 reg=json.loads((R/REG).read_text());eco=next(s for s in reg['subjects']if s['subject']=='wirtschaftswissenschaften');sem=eco['semanticKindLedgerPath'];base=R/pathlib.Path(sem).parent
 for p in base.rglob('*'):
  if p.is_file():inputs[str(p.relative_to(R))]=info(p);cp(p,str(p.relative_to(R)))
 for rel in [CAN,REG,BOOK,'docs/landscape-runtime.schema.json','contracts/curriculum-package/v1/composition-view.schema.json']:
  inputs[rel]=info(R/rel)
 prod=(R/'app/scripts/generateCurriculumQualityStatus.ts').read_text();obs=(C/'app/scripts/generateCurriculumQualityStatus.ts').read_text();line=next(l for l in obs.splitlines(True)if'ownProjectedScopeRows.push('in l);tail='\nexport const ownProjectedScopeRows:any[]=[];\nexport {routeProfiles,evaluateRouteProfile,collectWholeMaterialPrerequisiteClosure,readJurisdictionCoverageByLandscapeId,evaluateJurisdictionCoverage};\n';assert obs.replace(line,'').replace(tail,'')==prod;assert sh(R/'app/scripts/generateCurriculumQualityStatus.ts')=='656084b7cd9d6cb5324361b927b9f761596c572d7e4f616c7b13da061f4b1336'
 snaps=[]
 for rel,q in sorted(inputs.items()):
  p=R/rel;t=O/'whole-inputs'/rel;t.parent.mkdir(parents=True,exist_ok=True);assert not t.exists();shutil.copyfile(p,t);snaps.append({'actualOriginal':q,'immutableOwnSnapshot':info(t)})
 shutil.copyfile(C/'native-combined-scope.ts',O/'actual-native-scope-observer-helper.raw.ts');shutil.copyfile(__file__,O/'actual-executed-safe-prepare-stage-helper.raw.py')
 wr('actual-before-current597-review-input-guards-and-whole-snapshots.json',{'wholeSnapshots':snaps,'privateCapsule':str(C),'allWritesPrivateAndNoSymlink':True,'checker':info(R/'app/scripts/generateCurriculumQualityStatus.ts'),'instrumentationOnlyPush':line,'instrumentationOnlyTail':tail,'activeWrites':0})
 wr('actual-independent-577-597-whole-delta-five-fields-thirtyfive-views.json',{'beforeGoalCount':577,'afterGoalCount':597,'newPracticeIDs':sorted(new),'all572OtherOldGoalObjectsExact':True,'all336OrdinaryContractsExact':True,'oldWholeExamDataExact':True,'wholeNewBodiesExactForeignReleasedUnion':True,'wholeFa2TagDelta':fa,'wholeFourNavReviews':navs,'wholeViews':vs,'actualAppendedRefs':311,'newOrdinaryPOnlySourceClaims':0,'qualifiedPackages':i['qualifiedPackages']})
 stage(False);print('Prepared',len(inputs),'whole immutable inputs')
elif sys.argv[1]in['before','after']:stage(sys.argv[1]=='after')
elif sys.argv[1]in['dropref','dropsupport']:
 row=next(v for v in i['views']if v['activePath'].endswith('de-be-gym-economics-gk.view.json'));p=C/row['activePath'];v=json.loads(p.read_text());prefix='933e12c4'if sys.argv[1]=='dropref'else'79edbe3a';matches=[]
 def find(xs,path):
  for n,z in enumerate(xs):
   if z.get('goalId','').startswith(prefix):matches.append((xs,n,path+[n],z))
   if isinstance(z.get('children'),list):find(z['children'],path+[n,'children'])
 find(v['rootNodes'],['rootNodes'])
 if len(matches)!=1:
  print('MATCHES',[(x[2],x[3])for x in matches]);raise ValueError('Need exact actual prefix')
 xs,n,path,z=matches[0];assert z['projectionRole']==('target'if sys.argv[1]=='dropref'else'prerequisiteOnly');del xs[n];writecap(row['activePath'],v);wr('actual-'+sys.argv[1]+'-only-one-BE-GK-entry-independent-negative.json',{'viewPath':row['activePath'],'entryPath':path,'wholeRemovedEntry':z,'onlyDelta':'one explicitly scoped entry removed privately','ordinaryTargetsChanged':False});print('Own actual negative',path,z)
