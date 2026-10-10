# SPDX-License-Identifier: Apache-2.0
# Technical selection of unchanged real independent evidence. No new science verdict.
import copy,datetime,hashlib,json,pathlib,shutil,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot'); B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'); P=B/'chemie-b008-current-P25-protected12-source24-inactive-integration-technical-20261010-v1'; CA=B/'chemie-b008-current-whole-P26-native-continuation-author-20261010-v1'; CD=B/'chemie-b008-current-P26-plus-protected12-dual-resolution-technical-20261010-v1'; DS=B/'chemie-b008-source24-dual-bounded-scope-technical-20261010-v1'; PA=B/'chemie-b008-protected-twelve-current-native-independent-a-20261010-v1'; AA=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-five-whole-atomicity-memory-independent-a-v1'); C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'; KIN='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'; QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'; REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'; HOLD='e5a5dcd8-053c-55fd-b5c7-bba93779da53'
def read(p):return json.loads((R/p).read_text())
def put(p,x):
 p=pathlib.Path(p);assert p.is_relative_to(P);f=R/p;f.parent.mkdir(parents=True,exist_ok=True);tmp=f.with_name(f.name+'.writing-tmp');tmp.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');tmp.replace(f)
def cp(src,dest):
 dest=pathlib.Path(dest);assert dest.is_relative_to(P);(R/dest).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/src,R/dest)
def ref(p):
 p=pathlib.Path(p);v=(R/p).read_bytes();return {'path':p.as_posix(),'sha256':'sha256:'+hashlib.sha256(v).hexdigest(),'bytes':len(v)}
def lines(p):return [(json.loads(l)['goalId'],l) for l in (R/p).read_bytes().splitlines(keepends=True) if l.strip()]
def rawput(p,rows):
 p=pathlib.Path(p);assert p.is_relative_to(P);(R/p).parent.mkdir(parents=True,exist_ok=True);(R/p).write_bytes(b''.join(x[1] for x in rows))
registry=read(REG); chem=next(x for x in registry['subjects'] if x['subject']=='chemie');original=copy.deepcopy(chem);canon=read(CA/'candidate/current-whole511-398-B008.inactive.json');kinds=read(CA/'candidate/current511.semantic-kinds.inactive.json');ids=read(CA/'materials/whole26-current-operative-materials-and-profiles.exact-assembly.json')['goalIds'];selected=set(ids)-{HOLD};new=set(ids)-{g['id'] for g in read(CAN)['goals']};assert len(new)==24;cur={d['goalId'] for d in kinds['decisions'] if d['semanticKind']=='curricularAtomic'};assert len(cur)==398
assert (R/CAN).read_bytes()==(R/CA/'inputs/current-whole-active-canonical.exact.json').read_bytes();cp(CAN,P/'inputs/active487-canonical.before.exact.json');cp(KIN,P/'inputs/active487-semantic-kinds.before.exact.json');cp(QA,P/'inputs/active-chemie-QA.before.exact.json');cp(REG,P/'inputs/active-five-subject-registry.before.exact.json');cp(CA/'candidate/current-whole511-398-B008.inactive.json',P/'candidate/whole511-398.inactive.json');kinds['sourceLandscapePath']=CAN;put(P/'candidate/current511-semantic-kinds.future-active.json',kinds)
# Current D indices are literal external origins, with twelve exact ordinary supersessions.
replacement=(CD/'protected-12/resolution-index.json').as_posix();protected=read(replacement)['batchGoalIds']; superseded={(e['goalId'],e['supersededIndexPath']) for e in chem.get('resolutionSupersessions',[])};withdrawn={(e['goalId'],e['indexPath']) for e in chem.get('resolutionWithdrawals',[])};owners={}
for p in chem['resolutionIndexPaths']:
 for x in read(p)['resolutions']:
  if (x['goalId'],p) not in superseded|withdrawn:
   assert x['goalId'] not in owners,x['goalId'];owners[x['goalId']]=p
newD=[(CD/f'{group}/resolution-index.json').as_posix() for group in ['current-20','current-6','protected-12']];chem['resolutionIndexPaths']+=newD;addedEdges=[]
for gid in protected:
 assert gid in owners,gid;addedEdges.append({'goalId':gid,'supersededIndexPath':owners[gid],'replacementIndexPath':replacement})
assert not set(ids).intersection(owners);chem['resolutionSupersessions']+=addedEdges;put(P/'registry/exact-twelve-additive-description-supersessions.inactive.json',{'schemaVersion':1,'existingEdgesUnchanged':True,'addedEdges':addedEdges,'newCurrentD20D6UnchangedIncludingHeldE5a5':newD[:2],'oldWithdrawalsUnchanged':chem.get('resolutionWithdrawals',[])})
# Reuse original A ledgers as exact raw selections. Only changed family scope is repartitioned.
aout=[];adeltas=[]
for i,path in enumerate(chem['semanticAtomicityConfigPaths'],1):
 cfg=read(path);before=lines(cfg['reviewPath']);after=[x for x in before if x[0] in cur and x[0] not in ids]
 if after==before:aout.append(path);continue
 assert after;dest=P/f'atomicity/{i:02d}-residual.exact.records.jsonl';rawput(dest,after);out=copy.deepcopy(cfg);out['reviewPath']=dest.as_posix();out['scope']={'label':cfg['scope']['label']+'; current literal retained residual','leafGoalIds':[x[0] for x in after]};p=P/f'atomicity/{i:02d}-residual.future-active.config.json';put(p,out);aout.append(p.as_posix());adeltas.append({'oldConfig':ref(path),'oldReview':ref(cfg['reviewPath']),'selectedReview':ref(dest),'removedGoalIds':[x[0] for x in before if x not in after],'selectedRawLinesAllExact':True})
a=read(AA/'atomicity.twenty-five-plus-one-exact-reuse.normal.config.json');a['landscapePath']=CAN;ap=P/'atomicity/current26.future-active.config.json';put(ap,a);aout.append(ap.as_posix());chem['semanticAtomicityConfigPaths']=aout;put(P/'checks/actual-atomicity-original-residual-and-current26-selection.json',{'schemaVersion':1,'role':'Technical exact line selection, genuine A/B whole25 plus existing literal1f evidence remains unchanged','delta':adeltas,'current26NormalOriginal':ref(a['reviewPath']),'reFingerprintScience':False})
# Whole398 Memory retains every old current atom except seven areas and selected two existing reviewed goals.
m=read(chem['memoryReviewConfigPath']);oldm=lines(m['reviewPath']);newm=lines(AA/'memory.twenty-five-plus-one-exact-reuse.normal.records.jsonl');assert len(oldm)==381 and len(newm)==26
kept=[x for x in oldm if x[0] in cur and x[0] not in ids];merged=kept+newm;assert len(merged)==398 and {x[0] for x in merged}==cur;mp=P/'memory/current398.exact-selected.review.jsonl';rawput(mp,merged);m['reviewPath']=mp.as_posix();m['reportPath']=(P/'checks/current398-memory.normal.report.md').as_posix();mc=P/'memory/current398.future-active.config.json';put(mc,m);chem['memoryReviewConfigPath']=mc.as_posix();put(P/'checks/actual-Memory381-to398-exact-line-selection.json',{'schemaVersion':1,'old381':ref(original['memoryReviewConfigPath']),'old381Records':ref(read(original['memoryReviewConfigPath'])['reviewPath']),'retainedOldRawRows':len(kept),'selectedExistingWhole26RawRows':26,'newChildren':sorted(new),'removedSevenFamilyAreas':[x[0] for x in oldm if x[0] not in cur],'replacedTwoExistingReviewedAtoms':[x[0] for x in oldm if x[0] in ids],'allRetainedAndSelectedRawLinesExact':True,'cardsAndSevenVisibilityConfigs':[ref(m['cardReviewPath'])]+[ref(v['viewPath']) for v in m['visibilityScopes']],'memoryScientificVerdictsChanged':False,'humanApproval':False})
# Preserve historical P7 IDs; select actual P6 without e5a5, never relabel records.
pout=[];pdeltas=[]
for i,path in enumerate(chem['positiveEvidenceConfigPaths'],1):
 cfg=read(path);scope=set(cfg['scope']['goalIds']);hits=scope.intersection(protected)
 if not hits:pout.append(path);continue
 before=lines(cfg['reviewPath']);after=[x for x in before if x[0] not in hits];out=copy.deepcopy(cfg);out['scope']['goalIds']=[g for g in cfg['scope']['goalIds'] if g not in hits]
 if not after:pdeltas.append({'oldConfig':ref(path),'removedGoalIds':sorted(hits),'oldReviewIdRetainedAsHistory':cfg['reviewId'],'noResidual':True});continue
 rp=P/f'positive/{i:02d}-protected-residual.exact.jsonl';rawput(rp,after);out['reviewPath']=rp.as_posix();op=P/f'positive/{i:02d}-protected-residual.future-active.config.json';put(op,out);pout.append(op.as_posix());pdeltas.append({'oldConfig':ref(path),'removedGoalIds':sorted(hits),'selectedRawLinesAllExact':True,'currentResidual':ref(rp),'reviewIdUnchanged':cfg['reviewId']})
for i in range(1,8):
 src=PA/f'positive/current-context-technical-candidates-{i}.normal.config.json';cfg=read(src);cfg['landscapePath']=CAN;cfg['semanticKindLedgerPath']=KIN;dest=P/f'positive/current-protected-context-{i}.future-active.config.json';put(dest,cfg);pout.append(dest.as_posix())
for n in [19,7]:
 src=CA/f'positive/current-P{n}-exact-body-normal-reuse.config.json';cfg=read(src);cfg['landscapePath']=CAN;cfg['semanticKindLedgerPath']=KIN
 if n==7:
  oldlines=lines(cfg['reviewPath']);assert len(oldlines)==7;rows=[x for x in oldlines if x[0]!=HOLD];assert len(rows)==6;rp=P/'positive/current-P6-from-original-P7.exact.jsonl';rawput(rp,rows);cfg['reviewPath']=rp.as_posix();cfg['scope']['goalIds']=[g for g in cfg['scope']['goalIds'] if g!=HOLD];name='current-P6-from-original-P7.future-active.config.json'
 else:name='current-P19-exact.future-active.config.json'
 dest=P/'positive'/name;put(dest,cfg);pout.append(dest.as_posix())
chem['positiveEvidenceConfigPaths']=pout;put(P/'checks/actual-P25-plus-protected12-no-overlap-exact-selection.json',{'schemaVersion':1,'role':'Normal technical exact selection of already independently reviewed whole materials, no additional P review','originalP7':ref(CA/'inputs/seven-normal-P-records.exact.jsonl'),'selectedP6':ref(P/'positive/current-P6-from-original-P7.exact.jsonl'),'heldGoalId':HOLD,'originalReviewIdUnchanged':read(CA/'positive/current-P7-exact-body-normal-reuse.config.json')['reviewId'],'currentD6KEEPStillUnchangedIncludingE5a5':ref(CD/'current-6/resolution-index.json'),'excludedPGoalReason':'Actual unresolved C11 course=unspecified and absence from supported SourceAtlas union; original science/P/D history retained','PStatuses':'E1/G1/needs_human_review/ai_candidate; approved0; no learner or human authority','protectedOldConfigDeltas':pdeltas})
# Literal current independent V role pairing: copy no raster regeneration/format replacement.
pair=read(CA/'inputs/whole26-genuine-current-raster-pair.exact.json');assert len(pair['rows'])==26
qa=read(QA);rows={x['goalId']:x for x in qa['records']};vc=[]
for row in pair['rows']:
 gid=row['goalId'];assert row['pairedCurrentRoleStatus']=='PAIRED_KEEP';g=next(g for g in canon['goals'] if g['id']==gid);r=rows.get(gid,copy.deepcopy(next(x for x in read(CA/'candidate/current-whole-QA.native-unapproved.inactive.json')['records'] if x['goalId']==gid)));r=copy.deepcopy(r);src=CA/'assets/chemie'/gid/pathlib.Path(row['actualSelectedRaster']['path']).name;assert hashlib.sha256((R/src).read_bytes()).hexdigest()==row['actualSelectedRaster']['sha256'].removeprefix('sha256:');link=next(l for l in g['resourceLinks'] if l['type']=='goal-visualization' and l.get('role')=='primary');digest='sha256:'+hashlib.sha256((R/src).read_bytes()).hexdigest();dates=[v for side in ['independentA','independentB'] for v in [row[side].get('actualRecordedAt') or next((read(row[side]['verdictFile']['path']).get(key) for key in ['reviewedAt','createdAtUtc','createdAtUTC','createdAt','reviewedAtUtc'] if isinstance(read(row[side]['verdictFile']['path']).get(key),str)),None)] if v];date=max(dates) if dates else None;notes='Technical transfer of genuine independent A+B current raster-role KEEP; not a third visual review. A: '+row['independentA']['verdictFile']['path']+'; B: '+row['independentB']['verdictFile']['path']+'. Whole native D/P and source evidence remain separately bound; human approval is not claimed.'
 r.update({'title':g['title'],'description':g['description'],'landscapePath':CAN,'visualizationState':'available','missingReason':'','imageUrl':link['url'],'publicAssetPath':'app/public'+link['url'],'canonicalAssetPath':'curricula/DE/Gymnasium/visualizations'+link['url'].removeprefix('/assets/goal-visualizations'),'assetSha256':digest,'aiApproved':'yes','aiApprovedAssetSha256':digest,'aiReviewedAt':date,'aiReviewer':'Genuine independent AI raster reviewers A and B; technical adoption only','aiNotes':notes});rows[gid]=r;vc.append({'goalId':gid,'unchangedActualSelectedRaster':ref(src),'genuineCurrentA':row['independentA'],'genuineCurrentB':row['independentB'],'scientificGoalTextExact':True,'noNewImageReviewClaimed':True})
 # Narrow regular exact copies only into ignored execution capsule, never active runtime.
 for dest in [r['publicAssetPath'],r['canonicalAssetPath']]:
  (C/dest).parent.mkdir(parents=True,exist_ok=True)
  if not (C/dest).exists() or (C/dest).read_bytes()!=(R/src).read_bytes():shutil.copyfile(R/src,C/dest)
qa['records']=list(rows.values());put(P/'candidate/current-visualization-pair-transfer.before-normal-generation.inactive.json',qa);put(P/'checks/exact26-current-independent-raster-pair-technical-adoption.json',{'schemaVersion':1,'role':'Technical binding of existing actual pair; author not independent reviewer','rows':vc,'changedPNGBytes':0,'humanApproval':False,'strictGain':0})
# Candidate central source paths remain conventional inside ignored capsule. Future change is Chem subject only.
put(P/'registry/chemie-subject.future-active.inactive.json',chem);future=copy.deepcopy(registry);future['subjects']=[chem if x['subject']=='chemie' else x for x in registry['subjects']];put(P/'registry/five-subject-future-active.inactive.config.json',future);check=copy.deepcopy(future);check['reportId']='chemie-b008-current-P25-protected12-source24-inactive-normal-check-20261010-v1';check['subjects']=[chem];put(P/'registry/chemie-only-normal-check.config.json',check)
atlas=read(DS/'source-atlas/bounded378-reviewed-partial.book-local-successor-v2.inputs.json');atlas['landscapePath']=CAN;atlas['semanticKindLedgerPath']=KIN;atlas['outputDirectory']='app/scripts/config/goal-books/inactive-chemie-current-P25-source24-20261010-v1/source-views';atlas['manifestPath']='app/scripts/config/goal-books/inactive-chemie-current-P25-source24-20261010-v1/source-manifest.json';atlas['navigationViewPath']='app/scripts/config/goal-books/inactive-chemie-current-P25-source24-20261010-v1/navigation.view.json';put(P/'source-atlas/bounded378-normal-isolated.inputs.json',atlas)
# SourceAtlas replacements are literal origins; no temporary target in portable entries.
put(P/'checks/source24-exact-original-paired-successor-boundaries.json',{'schemaVersion':1,'pairedFinalEntry':ref(DS/'completed-source24-paired-bounded-technical.entry.json'),'pairedFinalFreeze':ref(DS/'FINAL.paired-bounded-source24.technical.freeze.json'),'normalExpectedPublishedSourceUnion':378,'wholeCurricularAtomic':398,'actualFormula':'362 previous supported atoms - 7 retained family areas + 23 actually scoped new children = 378','old19OmittedRemain':True,'oneAdditionalE5a5CourseUnspecifiedOmitted':HOLD,'unresolvedSourceScopeDecisions':496,'historicalFull398ProbeStillFailed':True,'whole24SourceDutiesAndPartial63ContributionPairsUnchanged':True,'wholeSourceCourseLegalOrHumanApproval':False})
# Copy existing references required by normal config resolution only, never whole repo / full raster forest.
(C/CAN).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/P/'candidate/whole511-398.inactive.json',C/CAN);shutil.copyfile(R/P/'candidate/current511-semantic-kinds.future-active.json',C/KIN);shutil.copyfile(R/P/'candidate/current-visualization-pair-transfer.before-normal-generation.inactive.json',C/QA)
for own in (R/P).rglob('*'):
 if own.is_file():dest=C/own.relative_to(R);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(own,dest)
# Minimal exact config-reference graph copied into capsule. Follow only concrete existing regular repo paths.
seen=set()
def sync(p):
 p=pathlib.Path(p)
 if p.as_posix() in seen:return
 seen.add(p.as_posix());src=R/p
 if not src.is_file():return
 if src.is_symlink():raise AssertionError('portable reference must be a regular file: '+str(p))
 if p.as_posix() in [CAN,KIN,QA]:return
 dest=C/p;dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists() or dest.read_bytes()!=src.read_bytes():shutil.copyfile(src,dest)
 if p.suffix in ['.json','.jsonl'] and p.as_posix()!=REG:
  try:objs=[json.loads(src.read_text())] if p.suffix=='.json' else [json.loads(l) for l in src.read_text().splitlines() if l.strip()]
  except json.JSONDecodeError:return
  def walk(v):
   if isinstance(v,dict):
    for key,x in v.items():
     if key in ['reviewPath','cardReviewPath','viewPath','sourceExtractionPath','landscapePath','semanticKindLedgerPath'] and isinstance(x,str) and x.startswith(('curricula/','docs/','app/scripts/','contracts/')) and (R/x).is_file():sync(x)
     elif isinstance(x,(dict,list)):walk(x)
   elif isinstance(v,list):
    for x in v:walk(x)
  for obj in objs:walk(obj)
for path in chem['semanticAtomicityConfigPaths']+chem['positiveEvidenceConfigPaths']+[chem['memoryReviewConfigPath']]+[m['cardReviewPath']]+[v['viewPath'] for v in m['visibilityScopes']]+[REG]+atlas['mappingPaths']:sync(path)
# D graph is already present selectively from original technical resolution; refresh exact candidate group trees.
for indexPath in chem['resolutionIndexPaths']:
 if not (C/indexPath).is_file():
  parent=(R/indexPath).parent
  for f in parent.rglob('*'):
   if f.is_file():dest=C/f.relative_to(R);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,dest)
for group in ['current-20','current-6','protected-12']:
 for f in (R/CD/group).rglob('*'):
  if f.is_file():dest=C/f.relative_to(R);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,dest)
put(P/'checks/initial-inactive-technical-assembly.actual.json',{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wholeCandidateNodes':len(canon['goals']),'wholeCandidateCurricular':len(cur),'newChildren':sorted(new),'PSelected25ExcludingHeldE5a5':sorted(selected),'D26KEEPUnchanged':True,'twelveCurrentTargetedSupersessions':addedEdges,'otherFourSubjectConfigSemanticExact':all(x==next(y for y in registry['subjects'] if y['subject']==x['subject']) for x in future['subjects'] if x['subject']!='chemie'),'ignoredCapsuleReferenceFilesSynchronized':len(seen),'activeWrites':[],'strictNew':0,'strictRestored':0,'strictNet':0})
print(json.dumps({'package':P.as_posix(),'whole':len(canon['goals']),'curricular':len(cur),'P25':len(selected),'protectedContextSupersessions':len(addedEdges),'normalCandidateChecksNext':True,'activeWrites':0}))
