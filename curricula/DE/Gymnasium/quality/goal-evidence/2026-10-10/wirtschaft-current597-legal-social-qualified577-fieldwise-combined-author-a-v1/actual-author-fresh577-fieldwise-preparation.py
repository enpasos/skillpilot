from pathlib import Path
import json,hashlib,copy,os,shutil,tempfile
from jsonschema import Draft202012Validator
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-current597-legal-social-qualified577-fieldwise-combined-author-a-v1';O.mkdir(exist_ok=True);CANP='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';cp=R/CANP
sources=[(Q/'wirtschaft-M4-seven-foreign-qualified-law-and-one-valid-sales-current555-status-nav-scope-author-b-v1','actual-final-seven-foreign-law-and-valid-sales-current555-threeNav102-accesses.author-handoff.json','actual-final-seven-status-threeNav-one-legacy-metadata102-view-fields.portable-author-index.json'),(Q/'wirtschaft-M4-thirteen-foreign-qualified-social-Europe-current555-status-nav-scope-author-b-v1','actual-final-thirteen-foreign-social-KEEP-current555-threeNav209-accesses.author-handoff.json','actual-final-thirteen-status-threeNav-one-Q1-derived-field209-view-fields.portable-author-index.json')]
scopeReceipts=[Q/'wirtschaft-M4-seven-law-sales102-current555-scope-nav-independent-a-v1/actual-final-seven-law-sales102-current555-course-nav-scope-independent-a-KEEP.handoff.receipt.json',Q/'wirtschaft-M4-thirteen-social209-current555-scope-nav-independent-a-v1/actual-final-thirteen-social209-current555-Q1-nav-scope-independent-a-KEEP.handoff.receipt.json'];assert all(p.exists()for p in scopeReceipts)
def rec(p):b=p.read_bytes();return{'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return rec(p)
before=json.load(open(cp));assert len(before['goals'])==577 and rec(cp)['sha256']=='9c451039786812f3a77b4f9eaa26481e8129e0c0ab9468dacd5c30b1fc81da03';after=copy.deepcopy(before);bm={g['id']:g for g in before['goals']};am={g['id']:g for g in after['goals']};packageData=[];ids=[];navAdds={};newGoals=[]
for A,hn,iname in sources:
 h=json.load(open(A/hn));ix=json.load(open(A/iname));candidate=json.load(open(R/ix.get('wholeCAN562',ix.get('wholeCAN568'))['path']));cg={g['id']:g for g in candidate['goals']};gids=ix.get('newSevenIDs',ix.get('newThirteenIDs'));ids.extend(gids)
 for gid in gids:assert gid not in am;goal=copy.deepcopy(cg[gid]);after['goals'].append(goal);am[gid]=goal;newGoals.append(goal)
 for n in ix['whole3NavFieldDeltas']:
  gid=n['goalId'];adds=[id for id in n['wholeAfter']['contains']if id not in n['wholeBefore']['contains']];assert all(id in gids for id in adds);navAdds.setdefault(gid,[]).extend(adds)
  assert all(id in am[gid]['contains']for id in n['wholeBefore']['contains'])
 packageData.append({'authorHandoff':rec(A/hn),'authorIndex':rec(A/iname),'wholeScientificKEEP':h.get('wholeSevenForeignScience',h.get('wholeThirteenForeignScience')),'scopeKEEP':rec(scopeReceipts[len(packageData)]),'newMaterialIDs':gids})
assert len(ids)==20 and len(set(ids))==20 and len(after['goals'])==597
# Sole previously foreign-qualified existing scientific contract course field.
fa='fa2d07bc-684d-5ee4-8878-20416fdb72d7';faDelta=json.load(open(sources[0][0]/sources[0][2]))['whole1ExistingFa2MetadataDelta'];assert bm[fa]==faDelta['wholeBefore'];am[fa]['tags']=copy.deepcopy(faDelta['wholeAfter']['tags']);assert am[fa]==faDelta['wholeAfter']
# Append useful actual new topics to the true already integrated577 descriptions; preserve every old sentence.
texts={
'14c05eec-87af-5fd6-832a-4f5d9d280e66':(' Weitere eigenständige E-Abschlüsse behandeln Verbraucherrechte sowie die Anwendung bereitgestellter Rechtsnormen auf konkrete Sachverhalte. Die einzelnen Materialien behalten ihre vollständigen Voraussetzungen und Kursgrenzen.',' Further standalone E-phase practice endpoints cover consumer rights and applying supplied legal rules to concrete facts. Each material retains its complete prerequisites and course limits.'),
'1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc':(' Weitere eigenständige Q1-Abschlüsse behandeln die Soziale Marktwirtschaft, institutionenökonomische Probleme und europäische Kompetenzen, Institutionen, Beteiligung und Politikfelder. Die einzelnen Materialien behalten ihre vollständigen Voraussetzungen und Kursgrenzen.',' Further standalone Q1 practice endpoints cover the social market economy, institutional-economic problems, and European competences, institutions, participation and policy fields. Each material retains its complete prerequisites and course limits.'),
'a1c0e891-cb5b-56ef-9aa7-ac782e2099c3':(' Weitere eigenständige Q2-Abschlüsse behandeln Kaufrechtstechniken, gesetzliche Forderungen und gerechten Interessenausgleich sowie Gerechtigkeit, Sozialstaatsdesign, Reformen, Rentenfinanzierung, Teilhabe und Transferwirkungen.',' Further standalone Q2 practice endpoints cover sales-law methods, statutory claims and fair balancing of interests, as well as justice, welfare-state design, reforms, pension financing, participation and transfer effects.'),
'0fb8833c-4017-5052-819a-ecb5f6ebb36f':(' Weitere eigenständige Q3-Abschlüsse behandeln Vertragsarten und Leistungsstörungen sowie die vier europäischen Grundfreiheiten und tatsächliche Binnenmarktgrenzen.',' Further standalone Q3 practice endpoints cover types of contracts and failures of contractual performance, as well as the European four freedoms and actual internal-market limits.')}
for gid,adds in navAdds.items():
 for id in adds:assert id not in am[gid]['contains'];am[gid]['contains'].append(id)
 am[gid]['description']=bm[gid]['description']+texts[gid][0];am[gid]['descriptionEn']=bm[gid]['descriptionEn']+texts[gid][1]
# Q1 has a real native child union follower already foreign-qualified by Socialscope; no independent source override.
q1='1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc';si=json.load(open(sources[1][0]/sources[1][2]));q1delta=next(n for n in si['whole3NavFieldDeltas']if n['goalId']==q1);am[q1]['applicability']=copy.deepcopy(q1delta['wholeAfter']['applicability']);assert len(am[q1]['applicability']['jurisdiction'])==16
changedOld=[]
for gid,g in bm.items():
 if g!=am[gid]:
  diffs={k:{'wholeBefore':g.get(k),'wholeAfter':am[gid].get(k)}for k in set(g)|set(am[gid])if g.get(k)!=am[gid].get(k)};assert gid in set(navAdds)|{fa};assert set(diffs)<=({'tags'}if gid==fa else{'contains','description','descriptionEn','applicability'});changedOld.append({'goalId':gid,'wholeBefore':g,'wholeAfter':am[gid],'actualChangedFields':diffs,'actualAppendedNavChildren':navAdds.get(gid,[])})
assert len(changedOld)==5;assert am['96183c48-b499-54d7-8530-578f6ff40207']==bm['96183c48-b499-54d7-8530-578f6ff40207'];assert all(g==am[gid]for gid,g in bm.items()if gid not in set(navAdds)|{fa})
cb=O/'whole-current577-actual-active-before.frozen.json';cb.write_bytes(cp.read_bytes());ca=O/'whole-current597-legal7-social13-five-old-field-successors.INERT-author-candidate.json';ca.write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n');newbody=put('whole-twenty-existing-foreign-qualified-released-materials.exact-reuse.json',{'materials':newGoals});assert not list(Draft202012Validator(json.load(open(R/'docs/landscape-runtime.schema.json'))).iter_errors(after))
# Merge exact reference appends into actual577 views, keeping current577 whole ordered prefixes.
VB=O/'whole-before35views';VA=O/'whole-after35views';VB.mkdir();VA.mkdir();vs=Draft202012Validator(json.load(open(R/'contracts/curriculum-package/v1/composition-view.schema.json')));vrows=[];country=national=changedViews=duplicates=0
baseviews={p.name:p for p in(R/'curricula/DE/Gymnasium/composition-views/wirtschaft').glob('*.json')};assert len(baseviews)==35
for name,p in sorted(baseviews.items()):
 b=json.load(open(p));a=copy.deepcopy(b);append=[]
 for A,hn,iname in sources:
  ix=json.load(open(A/iname));v=next(v for v in ix['views']if Path(v['activePath']).name==name);av=json.load(open(R/v['wholeAfter']['path']));bv=json.load(open(R/v['wholeBefore']['path']));refs=av['rootNodes'][0]['children'][len(bv['rootNodes'][0]['children']):]if v['actualNewReferences']else[]
  for ref in refs:
   assert ref['kind']=='goalEntry'and ref['projectionRole']=='target';assert ref['goalId']in ids+[fa]
   existing=[x for x in a['rootNodes'][0]['children']if x.get('kind')=='goalEntry'and x.get('goalId')==ref['goalId']]
   if existing:assert len(existing)==1 and existing[0]==ref;duplicates+=1;continue
   a['rootNodes'][0]['children'].append(copy.deepcopy(ref));append.append(ref)
 if append:
  changedViews+=1;a['viewId']='economics-'+name.removesuffix('.view.json')+'-current597-legal-social-20261010-v1';assert not list(vs.iter_errors(a));assert len(a['viewId'])<=255;aa=copy.deepcopy(a);aa['rootNodes'][0]['children']=aa['rootNodes'][0]['children'][:len(b['rootNodes'][0]['children'])];aa['viewId']=b['viewId'];assert aa==b
  if a['scope'].get('jurisdiction'):country+=len(append)
  else:national+=len(append)
 bp=VB/name;bp.write_bytes(p.read_bytes());ap=VA/name;ap.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');vrows.append({'activePath':str(p.relative_to(R)),'before':rec(bp),'candidate':rec(ap),'wholeActualAddedReferences':append,'actualAddedPracticeTargetIds':[ref['goalId']for ref in append],'actualOriginal577PrefixAndRoleFieldsExact':True,'wholeSchemaErrors':0 if append else None})
assert country+national==311-duplicates
# Fresh physically separate capsule, all current577 source/currentSEM/P inputs refreshed from actual workspace.
oldcap=Path('/tmp/economics-social209-independent-a-path.txt').read_text().strip();CAP=Path(tempfile.mkdtemp(prefix='economics-combined597-author-a-'))/'capsule';shutil.copytree(Path(oldcap),CAP,symlinks=True);physical=[]
def cpphysical(p):
 src=R/p;dest=CAP/p;dest.parent.mkdir(parents=True,exist_ok=True);assert dest.parent.resolve().is_relative_to(CAP);assert not dest.is_symlink();dest.write_bytes(src.read_bytes());assert not os.path.samefile(dest,src);physical.append({'repoPath':p,'sourceWhole':rec(src),'privateWholeSHA256':rec(dest)['sha256'],'actualNotSameFile':True})
# Refresh exactly required current source/input universe with whole guards, preserving source strengths.
oldfreeze=json.load(open(Q/'wirtschaft-M4-nine-international162-current555-scope-nav-independent-a-v1/actual-own-current555-inert564-science-reuse-schema-exact162-appends-and-physical-input-freeze.independent.json'))
for row in oldfreeze['actualPhysicalBoundInputs']:cpphysical(row['repoPath'])
for v in vrows:cpphysical(v['activePath'])
cpphysical(CANP);rp='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';cpphysical(rp);reg=json.load(open(R/rp));sub=next(s for s in reg['subjects']if s['subject']=='wirtschaftswissenschaften')
for s in reg['subjects']:
 cpphysical(s['landscapePath']);cpphysical(s['semanticKindLedgerPath'])
for p in sub['positiveEvidenceConfigPaths']:
 cpphysical(p);cfg=json.load(open(R/p));cpphysical(cfg['reviewPath'])
cpphysical('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json');(O/'whole-current577-active-registry.readonly.json').write_bytes((R/rp).read_bytes());(O/'whole-current577-semantic-kinds.readonly.json').write_bytes((R/sub['semanticKindLedgerPath']).read_bytes());prod=R/'app/scripts/generateCurriculumQualityStatus.ts';(CAP/'app/scripts/generateCurriculumQualityStatus.ts').write_bytes(prod.read_bytes()+b'\nexport { routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure };\n')
index={'role':'AUTHOR_INERT_FIELDWISE_MERGE_NOT_NEW_SCIENCE_OR_FOREIGN_SCOPE','activeCanonicalPath':CANP,'canonicalBefore':rec(cb),'canonicalCandidate':rec(ca),'newMaterialIds':ids,'allReviewedPracticeMaterialIds':ids+[fa],'newBodiesWhole':newbody,'existingFa2TagOnlyWholeDelta':faDelta,'exactFourOldNavFieldChanges':[{'navGoalId':n['goalId'],'wholeBefore':n['wholeBefore'],'wholeFinalAfter':n['wholeAfter']}for n in changedOld if n['goalId']in navAdds],'exactFiveChangedOldWholeGoalObjects':changedOld,'views':vrows,'actualTargetReferenceDeltas':{'country':country,'national':national,'total':country+national,'alreadyIdenticalExistingReferencesSkipped':duplicates},'qualifiedPackages':packageData,'privateCapsule':str(CAP)};ir=put('actual-fieldwise597-20foreign-qualified-materials-five-oldGoal-fields35views-author-index.json',index);freeze=put('actual-current577-to597-author-inputs-physical-prefix-schema-and-fieldwise-reuse.freeze.json',{'role':'AUTHOR_INPUT_FREEZE_NOT_SCIENCE_OR_SCOPE_KEEP','wholeIndex':ir,'wholePhysicalCurrentInputs':physical,'wholeProductionChecker':rec(prod),'wholePrivateProductionReadonlyAdapter':rec(CAP/'app/scripts/generateCurriculumQualityStatus.ts'),'actual577CurrentCanonical':rec(cp),'actualNewTwentyWholeBodiesExactToForeignMachineReleasedInputs':True,'actual572OtherWholeOldGoalObjectsExact':True,'actualRootWholeGoalAndAllOldMaterialScientificBodiesExact':True,'actualWhole577ViewPrefixesRolesRetained':True,'actualSchema597Errors':0,'actualChangedCrossStageViewSchemaErrors':0,'actualChangedViewCount':changedViews,'actualReferenceDelta':index['actualTargetReferenceDeltas'],'activeWrites':0,'humanApproval':False});Path('/tmp/economics-combined597-author-a-path.txt').write_text(str(CAP)+'\n');print(json.dumps({'capsule':str(CAP),'index':ir,'freeze':freeze,'newReferences':index['actualTargetReferenceDeltas'],'changedViews':changedViews},indent=2))
