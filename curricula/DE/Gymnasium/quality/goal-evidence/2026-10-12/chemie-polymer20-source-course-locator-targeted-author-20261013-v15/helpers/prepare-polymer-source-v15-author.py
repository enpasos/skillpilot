# Apache-2.0. Only bounded source/course/locator successors; no active or old sealed writes.
from pathlib import Path
import copy,datetime,hashlib,json,os,shutil,uuid
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
OLD=E/'chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13';D=OLD/'source/converged-polymer20-source-author'
N=E/'chemie-polymer20-source-course-locator-targeted-author-20261013-v15';S=R/'tmp/chemie-f947-primary-case-author-private-20261013-v13';X=R/'tmp/chemie-polymer-source-course-locator-private-20261013-v15'
A=E/'chemie-polymer20-source-ne-early-independent-a-20261013-v14';F=json.loads((A/'BOUNDED_FIXES.actual-primary-source-and-course.independent.json').read_text())
rd=lambda p:json.loads(p.read_text());rel=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();bind=lambda p:{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
def own(p,d):
 assert p.is_relative_to(N);p.parent.mkdir(parents=True,exist_ok=True);content=json.dumps(d,ensure_ascii=False,indent=2)+'\n'
 if p.exists():assert p.read_text()==content,p;return
 p.write_text(content)
def private(p,b):
 assert p.is_relative_to(X);cur=X
 for part in p.parent.relative_to(X).parts:
  cur=cur/part
  if cur.is_symlink():
   src=cur.resolve(strict=True);assert src.is_dir();cur.unlink();cur.mkdir()
   for child in src.iterdir():(cur/child.name).symlink_to(child,target_is_directory=child.is_dir())
  elif not cur.exists():cur.mkdir()
  assert cur.is_dir() and not cur.is_symlink(),cur
 if p.is_symlink() or p.exists():p.unlink()
 p.write_bytes(b);assert p.resolve().is_relative_to(X) and not p.is_symlink(),p
N.mkdir(exist_ok=True);(N/'helpers').mkdir(exist_ok=True);shutil.copyfile(Path(__file__),N/'helpers/prepare-polymer-source-v15-author.py')
if not X.exists():
 X.mkdir()
 for directory,dirs,files in os.walk(S,followlinks=False):
  dest=X/Path(directory).relative_to(S);dest.mkdir(parents=True,exist_ok=True)
  for name in list(dirs):
   src=Path(directory)/name
   if src.is_symlink():(dest/name).symlink_to(src.resolve(strict=True),target_is_directory=True);dirs.remove(name)
  for name in files:
   src=Path(directory)/name
   if src.is_symlink():(dest/name).symlink_to(src.resolve(strict=True))
   else:shutil.copyfile(src,dest/name)
plan=rd(D/'CONVERGED.polymer20.source-author.proposal.pending-science.json');prior_maps={p['originalLiveBinding']['path']:p for p in plan['mappingSuccessors']}
fix_by_id={}
for f in F['fixes']:
 if f['findingId']=='SN_physical_locator':
  for cell in f['sourceCellLocators']:fix_by_id.setdefault(cell['sourceGoalId'],[]).append({**f,**cell})
 else:
  for id in f.get('sourceGoalIds',[]):fix_by_id.setdefault(id,[]).append(f)
maps={p:R/p for p in prior_maps}
for p in (R/'curricula/DE/Gymnasium/mapping').rglob('*.json'):
 if 'quality' in p.parts:continue
 data=rd(p)
 if any(m.get('legacyGoalId') in fix_by_id for m in data.get('mappings',[])):maps[rel(p)]=p
source_originals={p['originalLiveBinding']['path']:p for p in plan['sourceExtractionSuccessors']}
sourcepaths=set(source_originals)
for p in maps.values():
 path=rd(p).get('sourceExtractionPath')
 if path and any(g['id'] in fix_by_id for g in rd(R/path)['sourceGoals']):sourcepaths.add(path)
sn=rd(R/'tmp/sn-polymer-source-reader-v15/source-literals.author-input.json');snrows={r['currentSourceId']:r for r in sn['literalRows']};recycling=sn['separateRecyclingJudgment'] if 'separateRecyclingJudgment' in sn else next((r for r in sn['literalRows'] if not r.get('currentSourceId')),None)
recycle_literal='Sich zu den Möglichkeiten der Vermeidung und des Recyclings von Kunststoffabfällen positionieren'
new_recycle_id='sn-chem-seki-sn-ch-klassenstufe-10-lb4-primary-recycling-judgment-'+str(uuid.uuid5(uuid.NAMESPACE_URL,'SN-CH-2025|physical35|printed23|'+recycle_literal))
sn_fused='sn-chem-seki-sn-ch-klassenstufe-10-lb4-083-02-a49c4542';TH_EXP='th-chem-sekii-th-ch-sekii-4-1-8-synthesen-171-04-49e9ea0c';RECYCLE_GOAL='8721d943-8368-5304-bd3c-7d7944099662'
source_plans=[];sources={};cell_operations=[];new_sn_row=None
def course(goal,value):
 goal['courseLevel']=value
 for k in ['courseProfile']:
  if k in goal:goal[k]=value
 tags=[]
 for t in goal.get('tags',[]):
  if t.split(':',1)[0] in ['course','courseLevel','courseProfile']:t=t.split(':',1)[0]+':'+value
  tags.append(t)
 if not any(t.startswith('courseLevel:') for t in tags):tags.append('courseLevel:'+value)
 if not any(t.startswith('course:') for t in tags):tags.append('course:'+value)
 goal['tags']=tags
def separate_passage(data,g,physical,printed,course_value,column,source_path):
 old=next(p for p in data['passages'] if p['id']==g['passageId']);old['sourceGoalIds']=[id for id in old.get('sourceGoalIds',[]) if id!=g['id']]
 pid=g['passageId']+'-polymer-course-locator-v15-'+hashlib.sha256(g['id'].encode()).hexdigest()[:10]
 literal=g.get('sourceText',g.get('rawSourceText',''))
 p={'id':pid,'topicCode':g['topicCode'],'title':str(g.get('sourceSpan','')),'page':physical,'physicalPage':physical,'printedPage':printed,'text':literal,'rawText':literal,'sourcePath':source_path,'sourceGoalIds':[g['id']],'courseLevel':course_value,'sourceColumn':column}
 if g.get('sourceDocumentKey'):p['sourceDocumentKey']=g['sourceDocumentKey']
 elif old.get('sourceDocumentKey'):p['sourceDocumentKey']=old['sourceDocumentKey']
 data['passages'].append(p);g['passageId']=pid
 if isinstance(g.get('sourceSpan'),dict):g['sourceSpan']['passageId']=pid
for original in sorted(sourcepaths):
 prior=source_originals.get(original);base=R/prior['candidateBinding']['path'] if prior else R/original;before=rd(base);data=copy.deepcopy(before);fixed=[]
 for g in data['sourceGoals']:
  if g['id'] not in fix_by_id:continue
  prior_g=copy.deepcopy(g);fs=fix_by_id[g['id']];typ={f['findingId'] for f in fs};physical=printed=None;primary=None;cv=g.get('courseLevel','unspecified');column='existing'
  if 'TH_eAN_course' in typ:
   f=next(f for f in fs if f['findingId']=='TH_eAN_course');physical=f['physicalPage'];printed=f['printedPage'];primary=f['primaryBinding']['path'];cv='LK';column='zusätzlich erhöhtes Anforderungsniveau, rechte Spalte';course(g,cv)
  elif 'TH_practical_operator' in typ:
   f=next(f for f in fs if f['findingId']=='TH_practical_operator');physical=f['physicalPage'];printed=f['printedPage'];primary=f['primaryBinding']['path'];cv='GK_LK';column='gemeinsames grundlegendes und erhöhtes Niveau, linke Spalte';course(g,cv)
   literal='einen Kunststoff herstellen';parent='Im Schülerexperiment:';g.update(sourceText=literal,rawSourceText=literal,parentBulletText=parent,rawParentBulletText=parent,title='Im Schülerexperiment einen Kunststoff herstellen',description='Die lernende Person kann im Schülerexperiment einen Kunststoff herstellen.',category='Schülerexperiment',granularity='officialCompetencyRow')
  elif 'BB_BE_LK_columns' in typ:
   f=next(f for f in fs if f['findingId']=='BB_BE_LK_columns');physical=printed=31 if '-019-' in g['id'] else 30;primary=next(doc['path'] for doc in data['sourceDocuments']);cv='LK';column='Leistungskurs, zusätzlich zum Grundkurs, rechte Spalte';course(g,cv)
  elif 'SN_physical_locator' in typ:
   f=next(f for f in fs if f['findingId']=='SN_physical_locator');physical=f['physicalPage'];printed=f['printedPage'];primary=f['primaryBinding']['path'];row=snrows[g['id']];column='linke Spalte Lernziele und Lerninhalte; rechte Bemerkungen getrennt'
   # The consumed text is the actual binding left column. Recommended remarks are explicit separate context.
   literal=row['delimitedLeftColumnLiteral'];g.update(sourceText=literal,rawSourceText=literal,parentBulletText=row['leftColumnParentLiteral'],rawParentBulletText=row['leftColumnParentLiteral'])
   g.setdefault('metadata',{})['sourceColumnRemarks']={'parent':row['rightColumnParentRemarks'],'aspect':row['rightColumnAspectRemarks'],'binding':'Empfehlungscharakter, nicht Teil des verbindlichen linken Literals'}
   g['metadata']['sourceTextRole']='delimited-primary-left-column-excerpts';g['metadata']['primaryOperator']=row['operator']
   if g['id']==sn_fused:g.update(title='Polykondensat experimentell darstellen',description='Die lernende Person kann ein Polykondensat experimentell darstellen.',category='Schülerexperiment')
  elif 'HB_optional_profile_descriptor' in typ:
   f=next(f for f in fs if f['findingId']=='HB_optional_profile_descriptor');physical=f['physicalPage'];printed=f['printedPage'];primary=f['primaryBinding']['path'];cv='GK_LK';column='optionale Vertiefungen, keine ausdrücklich ausschließliche LK-Spalte';course(g,cv)
  assert physical and primary
  locator=f'physische PDF-S. {physical} / gedruckte S. {printed}; {column}'
  if isinstance(g.get('sourceSpan'),dict):g['sourceSpan'].update(label=str(g['sourceSpan'].get('label',''))+'; '+locator,physicalPage=physical,printedPage=printed,sourceColumn=column)
  else:g['sourceSpan']=str(g.get('sourceSpan','')).split(', PDF-S.')[0]+'; '+locator
  g['rawSourceSpan']=copy.deepcopy(g['sourceSpan']);g['sourceRef']=str(g.get('sourceRef','')).split(', PDF-S.')[0].split(', S.')[0]+'; '+locator
  g.setdefault('metadata',{}).update(primaryPhysicalPage=physical,primaryPrintedPage=printed,primaryColumn=column,sourceCourseFixAuthorOnly=True)
  separate_passage(data,g,physical,printed,cv,column,primary);fixed.append(g['id']);cell_operations.append({'originalExtractionPath':original,'priorAuthorOrOriginalBinding':bind(base),'sourceGoalId':g['id'],'before':prior_g,'after':copy.deepcopy(g),'findingIds':sorted(typ),'allOtherWholeSourceGoalRowsPreserved':True})
 if sn_fused in fixed:
  proto=copy.deepcopy(next(g for g in data['sourceGoals'] if g['id']==sn_fused));proto.update(id=new_recycle_id,title='Vermeidung und Recycling von Kunststoffabfällen beurteilen',description='Die lernende Person kann sich begründet zu Möglichkeiten der Vermeidung und des Recyclings von Kunststoffabfällen positionieren.',sourceText=recycle_literal,rawSourceText=recycle_literal,parentBulletText=recycle_literal,rawParentBulletText=recycle_literal,granularity='officialCompetencyRow',category='Bewertung',courseLevel='unspecified')
  proto.pop('bulletIndex',None);proto.pop('aspectIndex',None);proto['metadata']={'sourceTextRole':'independent-primary-left-column-judgment-row','primaryOperator':'Sich positionieren','primaryPhysicalPage':35,'primaryPrintedPage':23,'sourceColumnRemarks':{'parent':['Kunststoffabfälle als globale Herausforderung','Podiumsdiskussion'],'aspect':[],'binding':'Empfehlungscharakter'}}
  proto['tags']=[t for t in proto['tags'] if t.split(':',1)[0] not in ['course','courseLevel','courseProfile']];course(proto,'unspecified');proto['passageId']='sn-chemistry-seki-primary-recycling-judgment-physical35-printed23'
  data['sourceGoals'].append(proto);data['passages'].append({'id':proto['passageId'],'topicCode':proto['topicCode'],'title':'Eigene Recycling-Stellungnahme in Klassenstufe 10','page':35,'physicalPage':35,'printedPage':23,'text':recycle_literal,'rawText':recycle_literal,'sourcePath':'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf','sourceGoalIds':[new_recycle_id],'courseLevel':'unspecified','sourceColumn':'verbindliche linke Spalte, eigene Folgezeile'})
  new_sn_row=proto
 if fixed:
  data.setdefault('pipelineStatus',{})['currentStep']='MAPPING-3'
  for step in data['pipelineStatus'].get('steps',[]):
   if step['id']=='MAPPING-3':step['status']='in_progress';step['checks']=[{'id':'targeted-source-course-locator-fixes-await-same-independent-reader','label':'Gezielte Quellenmetadaten und getrennte Primäroperatoren sind Autorkandidaten; punktuelle unabhängige Nachprüfung ausstehend','passed':False,'details':', '.join(fixed)}]
  dst=N/'source/extraction-successors'/(Path(original).stem+'.'+hashlib.sha256(original.encode()).hexdigest()[:8]+'.polymer-course-locator-author-v15.json');own(dst,data);sources[original]=rel(dst)
 else:sources[original]=rel(base)
 source_plans.append({'originalLiveBinding':bind(R/original),'priorAuthorOrOriginalBinding':bind(base),'candidateBinding':bind(R/sources[original]),'changedSourceGoalIds':fixed,'newSourceGoalIds':[new_recycle_id] if sn_fused in fixed else [],'allOtherWholeSourceGoalRowsExactToPrior':True,'noPrimaryDocumentBytesChanged':True,'newScientificVotes':0})
mapping_plans=[];mapping_cell_operations=[]
for original,src in sorted(maps.items()):
 prior=prior_maps.get(original);base=R/prior['candidateBinding']['path'] if prior else src;before=rd(base);data=copy.deepcopy(before);effective_source=rd(src).get('sourceExtractionPath')
 if prior and effective_source is None and data.get('sourceExtractionPath'):
  effective_source=next((p['originalLiveBinding']['path'] for p in plan['sourceExtractionSuccessors'] if p['candidateBinding']['path']==data['sourceExtractionPath']),None)
 if effective_source in sources:data['sourceExtractionPath']=sources[effective_source]
 elif not effective_source:
  # Plain flat aliases don't read extraction course data; retain this original shape.
  pass
 source=rd(R/data['sourceExtractionPath']) if data.get('sourceExtractionPath') else None
 if source:
  sg={g['id']:g for g in source['sourceGoals']}
  for dec in data.get('decisions',[]):
   if dec['sourceGoalId'] not in fix_by_id:continue
   b=copy.deepcopy(dec);dec['sourceSpan']=copy.deepcopy(sg[dec['sourceGoalId']]['sourceSpan'])
   if dec['sourceGoalId']==sn_fused:dec['canonicalGoalIds']=[id for id in dec['canonicalGoalIds'] if id!=RECYCLE_GOAL]
   mapping_cell_operations.append({'originalMappingPath':original,'sourceGoalId':dec['sourceGoalId'],'before':b,'after':copy.deepcopy(dec),'role':'source locator/operator-author correction, not new vote'})
 if any(m.get('legacyGoalId')==sn_fused for m in data.get('mappings',[])):
  data['mappings']=[m for m in data['mappings'] if not(m.get('legacyGoalId')==sn_fused and m.get('canonicalGoalId')==RECYCLE_GOAL)]
  data['mappings'].append({'legacyGoalId':new_recycle_id,'canonicalGoalId':RECYCLE_GOAL,'matchType':'partial',**({'reviewDecisionId':new_recycle_id} if 'decisions' in data else {})})
  if 'decisions' in data:data['decisions'].append({'sourceGoalId':new_recycle_id,'topicCode':new_sn_row['topicCode'],'sourceSpan':new_sn_row['sourceSpan'],'decision':'mapped','canonicalGoalIds':[RECYCLE_GOAL],'matchType':'partial','reviewer':'Codex source author; exact split-operator judgment pending same independent reader','reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rationale':'AUTHOR ONLY: this separate actual left-column judgment row, not the manufacturing experiment, supplies the bounded recycling position operator. No hands-on execution or complete source/sibling-union approval.'})
 relative_path=Path(original).relative_to('curricula/DE/Gymnasium/mapping');future='curricula/DE/Gymnasium/mapping/'+str(relative_path.parent/(Path(original).stem+'.polymer-course-locator-author-20261013-v15.json'));archive='curricula/DE/Gymnasium/mapping/author-polymer20-course-locator-history/quality/20261013-v15/'+str(relative_path)
 dst=N/'source/mapping-successors'/relative_path.parent/Path(future).name;own(dst,data)
 old_private=X/(prior['proposedFutureLivePath'] if prior else original)
 assert old_private.exists() and sha(old_private)==sha(base),old_private
 old_private.unlink();private(X/archive,src.read_bytes());private(X/future,dst.read_bytes())
 mapping_plans.append({'originalLiveBinding':bind(src),'priorAuthorOrOriginalBinding':bind(base),'candidateBinding':bind(dst),'proposedFutureLivePath':future,'proposedFutureArchivePath':archive,'allEarlierComponentDecisionsRetainedExceptExplicitSNOperatorSplitAndLocators':True,'newScientificVotes':0})
sourcecfg=rd(D/'source-atlas.converged-final-author.config.json');replacement={p['proposedFutureLivePath']:next(m['proposedFutureLivePath'] for m in mapping_plans if m['originalLiveBinding']['path']==p['originalLiveBinding']['path']) for p in plan['mappingSuccessors']};replacement.update({m['originalLiveBinding']['path']:m['proposedFutureLivePath'] for m in mapping_plans});sourcecfg['mappingPaths']=[replacement.get(p,p) for p in sourcecfg['mappingPaths']];sourcecfg['expectedUnresolvedScopeDecisionCount']=482
# Exact no-new-source-country input; normal compiler/SourceAtlas will independently measure consequences.
can_path=rd(D/'configs/P1.author.inactive.config.json')['landscapePath'];can_dst=N/'candidate/canonical523.current402.polymer20.source-course-seed.exact.json';own(can_dst,rd(R/can_path));sourcecfg['landscapePath']=rel(can_dst);sourcecfg['semanticKindLedgerPath']=rel(N/'candidate/semantic523.raw-source.same-decisions.author.json');own(N/'configs/source-atlas.targeted-author.config.json',sourcecfg)
own(N/'SOURCE_COURSE_LOCATOR_AUTHOR.pending-exact-preflight-verification.json',{'schemaVersion':1,'currentCanonicalBase':bind(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'sealedPriorAuthorRoot':bind(OLD/'FINAL.converged-polymer-source-and-F947-ne-author-preflight.freeze.json'),'actualIndependentBoundedFixes':bind(A/'BOUNDED_FIXES.actual-primary-source-and-course.independent.json'),'sourceExtractionSuccessors':source_plans,'mappingSuccessors':mapping_plans,'sourceCellCASOperations':cell_operations,'mappingCellCASOperations':mapping_cell_operations,'newExactSeparateSNRecyclingSourceGoalId':new_recycle_id,'newSourceGoalDoesNotAddCanonicalGoals':True,'newSeparateSourceOperatorHasNoScienceVote':True,'currentCurricularAtomicDenominator':402,'priorSourceSnapshotPublished381NotQualityThreshold':True,'caseBodyAndScoreEdits':0,'newNativeRenders':0,'newScientificVotes':0,'activeOrGitWrites':False})
own(N/'checks/valid-NE-cases-original-P17-A17-M402-V-inputs-retained.exact.json',{'schemaVersion':1,'unchangedCaseBindings':[bind(OLD/'positive/whole-two-cases.nucleophile-electrophile.author-successor.json'),bind(D/'positive/P1.primary-and-NE.author.normal.jsonl')],'originalP17A17M402VStillImmutable':True,'independentEarlyF947ScientificPairPassIsNotFinalDOrPVote':True,'newScientificVotes':0,'humanApproval':False})
own(N/'coordination/disjoint-HB-TH-RP-component-merge-boundary.author.json',{'schemaVersion':1,'polymerSourceGoalIds':sorted(fix_by_id),'polymerNewRPComponentChanges':[],'aromaticsDisjointSourceIDs':['TH lower075-01-c5d70d8a','TH lower078-01-1f057d00','TH lower082-01-7f7e77c9','TH upper aromatics locators physical55/printed50','RP upper1-5-005-e1909ebc','RP upper12-2-005-929c5e9d','RP upper17-2-010-7a5dc35f','RP upper6-2-003-34dc2823','HB080–088'],'wholeSharedFileOverwriteForbiddenForRootIntegration':True,'sourceAndMappingCellBeforeAfterCASProvided':True})
for p in N.rglob('*'):
 if p.is_file():private(X/rel(p),p.read_bytes())
private(X/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',can_dst.read_bytes())
print(json.dumps({'root':rel(N),'privateRoot':rel(X),'sourceSuccessors':len(source_plans),'mappingSuccessors':len(mapping_plans),'fixedDistinctSourceIDs':len(fix_by_id),'sourceCellCarrierOperations':len(cell_operations),'newSeparateActualSNSourceGoalId':new_recycle_id,'caseEdits':0,'liveWrites':False,'newNative':False}))
