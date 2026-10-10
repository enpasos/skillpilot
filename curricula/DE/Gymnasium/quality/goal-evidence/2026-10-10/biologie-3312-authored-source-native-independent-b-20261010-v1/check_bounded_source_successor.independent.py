import json, pathlib, hashlib, datetime
ROOT=pathlib.Path.cwd()
OWN=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-3312-authored-source-native-independent-b-20261010-v1'
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-3312-authored-operationalization-primary-source-author-successor-v3'
PREVIOUS=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-eight-title-methyl-current-native-technical-author-successor-v2'
SID='8229f9d4-78f9-4968-8667-0c93aba0c0d6';GID='3312b2bb-bc90-5c0f-a859-4b4f9b8ff117'
def read(p):return json.loads((ROOT/p).read_text())
def binding(p):
 b=(ROOT/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
e=read(AUTHOR/'neutral-current3312-authored-source-and-native-one.independent-review.entry.json');x=e['neutralWholeFirstInputs'];b=e['operativeBasis'];s=e['separate150Role']
bx=read(b['wholeOperative144Extraction']['path']);ax=read(x['wholeCurrentOperative144SourceExtractionCandidate']['path']);bm=read(b['wholeOperative144Mapping']['path']);am=read(x['wholeCurrentOperative144MappingCandidate']['path'])
assert len(bx['sourceGoals'])==len(ax['sourceGoals'])==144
assert [a['id'] for a in bx['sourceGoals']]==[a['id'] for a in ax['sourceGoals']]
assert [a['id'] for a,b in zip(ax['sourceGoals'],bx['sourceGoals']) if a!=b]==[SID]
assert [k for k in bx if k!='sourceGoals' and bx[k]!=ax[k]]==[]
assert set(ax)-set(bx)=={'author8229BoundedOperationalizationSuccessor'}
source=next(g for g in ax['sourceGoals'] if g['id']==SID)
assert source['granularity']=='authoredOperationalization' and source['isOfficialBullet'] is False
assert source['sourceText']=='Steuerung der Genaktivität in verschiedenen Entwicklungsphasen und Lebewesen (Prinzip)'
assert source['sourcePage']==source['metadata']['sourcePhysicalPage']==source['metadata']['sourcePrintedPage']==40
assert source['description']==next(g for g in bx['sourceGoals'] if g['id']==SID)['description']
assert source['courseLevel']=='LK' and not source['metadata']['compulsoryThemeField'] and not source['metadata']['wholeQ15Coverage']
assert len(bm['mappings'])==len(am['mappings'])==157 and len(bm['decisions'])==len(am['decisions'])==144
changedEdges=[(i,b,a) for i,(b,a) in enumerate(zip(bm['mappings'],am['mappings'])) if b!=a]
assert len(changedEdges)==1 and changedEdges[0][0]==26
_,oldEdge,newEdge=changedEdges[0];assert oldEdge|{'matchType':'partial'}==newEdge
assert newEdge['legacyGoalId']==SID and newEdge['canonicalGoalId']==GID
changedDecisions=[a for a,b in zip(am['decisions'],bm['decisions']) if a!=b];assert len(changedDecisions)==1 and changedDecisions[0]['sourceGoalId']==SID
assert changedDecisions[0]['matchType']=='partial' and changedDecisions[0]['reviewAuthority']=='author_candidate'
assert set(am)-set(bm)=={'author8229BoundedOperationalizationSuccessor'}
assert [k for k in bm if bm[k]!=am[k]]==['sourceExtractionPath','mappings','decisions']
assert am['sourceExtractionPath']==x['wholeCurrentOperative144SourceExtractionCandidate']['path']
assert len(read(s['wholeSourceInput']['path'])['sourceGoals'])==150
assert len(read(s['wholeMappingInput']['path'])['mappings'])==152
before=read(x['wholeCurrentNormalNational394BeforeSourceModel']['path']);after=read(x['wholeCurrentNormalNational394AfterSourceModel']['path'])
assert before==after and len(before['pages'])==394
baseline=read(PREVIOUS/'inputs/protected-all-five-baseline-current-and-strict-ID-sets.exact.json')
protected=next(q['strictCompleteGoalIds'] for q in baseline['subjects'] if q['subject']=='biologie');assert len(protected)==315 and GID not in protected
active=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');candidate=read(x['whole479CurrentGoalBodies']['path']);ac={g['id']:g for g in active['goals']};ca={g['id']:g for g in candidate['goals']}
assert len(candidate['goals'])==479 and all(ac[g]==ca[g] for g in protected)
assert all(next(p for p in before['pages'] if p['goalId']==g)==next(p for p in after['pages'] if p['goalId']==g) for g in protected)
originalDuties=read(x['whole16OriginalDuties113OriginalPartnerEdges41OriginalPartnerBodies']['path']);assert len(originalDuties)==16
assert sum(len(q['allOriginalPartnerRows']) for q in originalDuties)==113
partnerBodies={g['id']:g for q in originalDuties for g in q['wholeCurrentCanonicalPartners']};assert len(partnerBodies)==41
assert (ROOT/x['whole16OriginalDuties113OriginalPartnerEdges41OriginalPartnerBodies']['path']).read_bytes()==(PREVIOUS/'sources/whole16-duties113-partners41-bodies.exact.json').read_bytes()
assert (ROOT/x['whole12Materials24CasesAndFreshTransfers']['path']).read_bytes()==(PREVIOUS/'science/whole12-current-V3-materials.exact.json').read_bytes()
assert (ROOT/x['wholeCurrentP8Unchanged']['path']).read_bytes()==(PREVIOUS/'positive/eight-current-P.author.review.jsonl').read_bytes()
rr=x['allCurrentNormalSourceAtlasBeforeAfterConfigsAndReceipts'];rb=read(rr[2]['path']);ra=read(rr[3]['path'])
normalize={b['wholeOperative144Mapping']['path']:x['wholeCurrentOperative144MappingCandidate']['path'],b['wholeOperative144Extraction']['path']:x['wholeCurrentOperative144SourceExtractionCandidate']['path']}
def normalizedWitnesses(receipt):
 out=[]
 for g in receipt['witnessGroups']:
  c=dict(g)
  for k in ('mappingInput','extractionInput'):
   path=receipt['inputBindings'][c[k]]['path'];c[k]=normalize.get(path,path)
  out.append(c)
 return out
assert normalizedWitnesses(rb)==normalizedWitnesses(ra)
assert rb['counts']==ra['counts'] and rb['omittedGoals']==ra['omittedGoals'] and rb['unresolvedSourceScopes']==ra['unresolvedSourceScopes']
for bg,ag in zip(rb['scopes'],ra['scopes']): assert bg==ag
w=[g for g in ra['witnessGroups'] if g['sourceGoalId']==SID];assert len(w)==1 and w[0]['goalIds']==[GID]
assert all(g not in w[0]['goalIds'] for g in protected)
result={'schemaVersion':1,'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':0,'operationalBaseline':{'sourceGoals':144,'mappingEdges':157,'decisionRows':144,'separateHistoricalSourceGoals':150,'separateHistoricalMappingEdges':152},'changedSourceGoalPointers':['/sourceGoals/61'],'changedMappingPointers':['/mappings/26','/decisions/61','/sourceExtractionPath'],'unchangedWholeSourceGoals':143,'unchangedWholeMappingEdges':156,'unchangedWholeDecisionRows':143,'beforeSourceGoal':bx['sourceGoals'][61],'afterSourceGoal':source,'beforeMappingEdge':oldEdge,'afterMappingEdge':newEdge,'newDocumentDeclarationAdded':False,'originalAllWholePassagesExact':True,'normalNationalWhole394ModelsExact':True,'normalNationalWhole394PagesExact':True,'normalNationalSourceScopeWitnessesExactAfterResolvingNumericInputIndicesAndSuccessorFilePaths':True,'singleScientificSourceWitnessChangeCanonicalIds':[GID],'sourceWitnessDirectMeansMappingPathNotExactWholeCompetencyCoverage':True,'protected315GoalBodiesAndPagesExact':True,'protected315ScientificSourceWitnessContextsUnaffected':True,'whole16Duties113Edges41PartnersExact':True,'whole12Materials24CasesAndP8RecordsExact':True,'wholeSourceCourseLegalHoldsClosed':False,'activeWrites':0,'strictGain':0,'bindings':[binding(x[k]['path']) for k in ['wholeCurrentOperative144SourceExtractionCandidate','wholeCurrentOperative144MappingCandidate','actualCurrentNative1WholeModel','wholeCurrentNormalNational394BeforeSourceModel','wholeCurrentNormalNational394AfterSourceModel']]}
(OWN/'bounded-operative144-source-and394-protection.independent.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if not isinstance(v,(dict,list))},ensure_ascii=False))
