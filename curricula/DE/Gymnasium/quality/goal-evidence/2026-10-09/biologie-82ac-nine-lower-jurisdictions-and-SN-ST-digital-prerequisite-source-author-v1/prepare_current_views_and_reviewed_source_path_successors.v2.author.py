# SPDX-License-Identifier: Apache-2.0
"""Additive current route/path correction; prior hypotheses and failed checks retained."""
from pathlib import Path
import copy, datetime, hashlib, json
import fitz
R=Path.cwd();D=Path(__file__).resolve().parent;P=D.relative_to(R).as_posix()
H='82acfbde-9ce8-5658-892e-4dcfb1c3a1f1';L='2ae2da43-73d5-578f-84f4-be0585a7d8f9'
def read(f):return json.loads(f.read_text())
def bind(f):
 b=f.read_bytes();return {'path':f.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(n,x):
 f=D/n;assert not f.exists(),f;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(x if isinstance(x,bytes) else (x if isinstance(x,str) else json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode());return f
def diff(a,b,p=''):
 if a==b:return []
 if isinstance(a,dict) and isinstance(b,dict):return [r for k in sorted(a.keys()|b.keys()) for r in (diff(a[k],b[k],p+'/'+k) if k in a and k in b else [{'pointer':p+'/'+k,'before':a.get(k),'after':b.get(k)}])]
 return [{'pointer':p,'before':a,'after':b}]
rows=[]
for s in ['SN','ST']:
 raw=R/f'curricula/DE/Gymnasium/composition-views/biologie/de-{s.lower()}-gym-seki-biology.view.json';v=read(raw);vn=copy.deepcopy(v)
 before=put(f'inputs/current-operative-{s}-whole-learner-view.exact.json',raw.read_bytes())
 entries=vn['rootNodes'][0]['children'];removed=[(i,n) for i,n in enumerate(entries) if n.get('kind')=='goalEntry' and n.get('goalId')==H];assert len(removed)==1
 vn['rootNodes'][0]['children']=[n for n in entries if n.get('goalId')!=H]
 assert any(n.get('goalId')==L and n.get('projectionRole','target')=='target' for n in vn['rootNodes'][0]['children'])
 after=put(f'candidate/views/{s}-proposed-current.whole-only82ac-target-removed.inactive.json',vn)
 assert {k:x for k,x in v.items() if k!='rootNodes'}=={k:x for k,x in vn.items() if k!='rootNodes'}
 assert v['rootNodes'][0]['children'][:removed[0][0]]+v['rootNodes'][0]['children'][removed[0][0]+1:]==vn['rootNodes'][0]['children']
 mp=R/f'curricula/DE/Gymnasium/mapping/DE-{s}/lower-secondary/{s.lower()}_biology_lower_secondary_source_extraction_to_canonical_biology.review.json'
 mb=put(f'inputs/current-operative-{s}-whole-mapping.exact.json',mp.read_bytes())
 reviewed=read(D/f'inputs/{s}-whole-narrow-proposed.mapping.exact.json');new=copy.deepcopy(reviewed)
 extraction=read(D/f'inputs/{s}-whole-narrow-proposed.extraction.exact.json');ex=copy.deepcopy(extraction);oldPath=ex['sourceDocument']['path'];portable=P+f'/primary/{s}-whole-current.original.pdf';ex['sourceDocument']['path']=portable
 for d in ex.get('sourceDocuments',[]):
  if d.get('path')==oldPath:d['path']=portable
 for g in ex.get('sourceGoals',[]):
  if g.get('sourcePath')==oldPath:g['sourcePath']=portable
 ef=put(f'candidate/source-extractions/{s}-whole-reviewed-Source7-transport-only.inactive.json',ex)
 new['sourceExtractionPath']=ef.relative_to(R).as_posix()
 mf=put(f'candidate/mappings/{s}-whole-reviewed-Source7-operative-path.inactive.review.json',new)
 assert new['mappings']==reviewed['mappings'] and new['decisions']==reviewed['decisions']
 edge=[e for e in new['mappings'] if e.get('canonicalGoalId')==L];assert len(edge)==1 and edge[0]['matchType']=='partial'
 sgid=edge[0]['legacyGoalId'];sg=next(g for g in ex['sourceGoals'] if g['id']==sgid);decision=next(d for d in new['decisions'] if d['sourceGoalId']==sgid)
 rows.append({'state':s,'actualOperativeMappingPath':mp.relative_to(R).as_posix(),'wholeActualMapping':bind(mb),'wholeReviewedSource7Before':bind(D/f'inputs/{s}-whole-narrow-proposed.mapping.exact.json'),'wholeCandidateMapping':bind(mf),'candidateMappingSameWholeReviewedDecisionsAndEdges':True,'exactPathOnlyMappingDiff':diff(reviewed,new),'wholeCandidateExtraction':bind(ef),'wholeSourceExtractionSemanticAndTransportDiff':diff(extraction,ex),'wholeActualLearnerView':bind(before),'actualLearnerViewPath':raw.relative_to(R).as_posix(),'wholeProposedCurrentLearnerView':bind(after),'onlyDeletedEntry':removed[0][1],'deletedEntryPointer':'/rootNodes/0/children/'+str(removed[0][0]),'allOtherCurrentEntriesExact':True,'whole2ae2SourceGoal':sg,'whole2ae2SourceDecision':decision,'whole2ae2MappingEdge':edge[0],'whole2ae2NotDeletedFromSourceOrLearnerRoute':True,'partialSourceContributionIsNotWholeJurisdictionProgramApproval':True,'unrelatedUpperGoalsAdded':0,'activeWrites':0})
whole=read(D/'inputs/whole479-before.exact.json');two=next(g for g in whole['goals'] if g['id']==L)
nativeBefore=read(D/'native/full394-before.normal-model.actual.json');nativeAfter=read(D/'native/full394-after-source-locator-and-requires.normal-model.actual.json');pb=next(p for p in nativeBefore['pages'] if p['goalId']==L);pa=next(p for p in nativeAfter['pages'] if p['goalId']==L);assert pb==pa
put('checks/current-source2ae2-and-two-actual-learner-route-value-diffs.v2.actual.json',{'schemaVersion':1,'actualRoutes':rows,'wholeCurrent2ae2Goal':two,'whole3942ae2BeforePage':pb,'whole3942ae2AfterPage':pa,'whole2ae2GoalPageContextExact':True,'independentCurrentProtected1DReuseRequired':True,'allSource7OriginalPartnersAndDutiesRetained':True,'wholeProgramScienceApproval':False,'strictGain':0,'activeWrites':0})
put('checks/actual-final-BB-BE-NI-locator-and-transport-whole-value-diffs.json',{'schemaVersion':1,'actualChanges':[{'state':s,'wholeBeforeExtraction':bind(D/f'inputs/{s}-whole-operative.extraction.exact.json'),'wholeCandidateExtraction':bind(D/f'candidate/source-extractions/{s}-whole-primary-locator.inactive.json'),'extractionValueDiff':diff(read(D/f'inputs/{s}-whole-operative.extraction.exact.json'),read(D/f'candidate/source-extractions/{s}-whole-primary-locator.inactive.json')),'wholeBeforeMapping':bind(D/f'inputs/{s}-whole-operative.mapping.exact.json'),'wholeCandidateMapping':bind(D/f'candidate/mappings/{s}-whole-primary-locator.inactive.review.json'),'mappingValueDiff':diff(read(D/f'inputs/{s}-whole-operative.mapping.exact.json'),read(D/f'candidate/mappings/{s}-whole-primary-locator.inactive.review.json'))} for s in ['BB','BE','NI']],'includesActualNIKeyedSourceDocumentTransportFix':True,'removedPartners':0,'removedOriginalDuties':0})
for s,pages in [('SN',[25,41,42,43,44]),('ST',[41,42,43])]:
 d=fitz.open(D/f'primary/{s}-whole-current.original.pdf')
 for n in pages:
  name=f'primary/{s}-physical-{n:03d}.whole.txt'
  if not (D/name).exists():put(name,d[n-1].get_text())
put('author.additive-CQR-cause-hypothesis-correction.v2.json',{'schemaVersion':1,'role':'author correction from completed ordinary evidence','priorHypothesis':'The two unsupported CQR assignments were82ac.','actualCompletedCounterevidence':'Ordinary current whole biology applicability compilation exactly reproduced by the minimal capsule shows unsupported2ae2 in both current SN/ST routes. Old operative mappings still provide partial82ac source evidence; only the separate Source7 book mapping successors bind2ae2.','correctedCandidate':'Retain2ae2 and every other current learner entry; remove only82ac target. Bind unchanged independently reviewed Source7 whole mappings by explicit operative path successors, retaining actual partial2ae2 contributions. Remove the substantively unjustified universal328fd→82ac prerequisite separately.','priorFailedTerminalRetained':True,'priorSource7ViewsRemainSeparateHistoricalCandidates':True,'noGlobalSourceProgramApproval':True,'noActiveWrites':True,'strictGain':0})
print(json.dumps({'currentWholeLearnerViews':2,'only82acEntryRemovedEach':True,'source7WholeMappingPathSuccessors':2,'twoSource2ae2ContributionsRetainedPartial':True,'whole2ae2PageExact':True,'upperGoalsAdded':0,'strictGain':0,'activeWrites':0}))
