# Apache-2.0. Two source lanes only. No engine changes, host or registry writes.
import copy,datetime,hashlib,importlib.util,json,pathlib,sys
from jsonschema import Draft202012Validator,FormatChecker
sys.dont_write_bytecode=True
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent
A=O.parent/'chemie-M311-BB-BE-four-scope-whole-source-and-acquisition-remediation-author-20261014-v1'
rd=lambda p:json.loads(p.read_text());now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':sha(p)}
def wr(n,x):
 p=O/n;assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
science=rd(O/'SCIENTIFIC.first-four-original-assay-source-components.independent-b.actual.json')
assert not science['peerNewSource4OutcomesRead']
spec=importlib.util.spec_from_file_location('unchanged_source4_b_stock_compiler',R/'scripts/compile_curriculum_release_model.py')
stock=importlib.util.module_from_spec(spec);sys.modules[spec.name]=stock;spec.loader.exec_module(stock)
assert sha(R/'scripts/compile_curriculum_release_model.py')=='sha256:daf4dbcad32aa553960a4aea2f2e4a95cd36224bb0256aa345c9e506afef22cd'
profile=rd(R/'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json')
base=rd(A/'inputs/EXACT.base-current-P7-v2-and-source-course-primary-provenance.json')['currentCanonical'];can=rd(R/base['path']);assert sha(R/base['path'])==base['sha256']
ids={g['id']for g in can['goals']};gi={g['id']:g for g in can['goals']}
registry=R/'curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json'
membership={x['landscapeId']:set(x['goalIds'])for x in rd(registry)['landscapes']}
projection_path=A/'candidate/BB-BE205.exact-two-lane-membership.author-projection.nonoperative.json';projection=rd(projection_path)
assert len(projection['landscapes'])==2 and projection['existingRegistryUnchanged']
projected={x['landscapeId']:set(x['goalIds'])for x in projection['landscapes']};membership.update(projected)
plans=rd(A/'AUTHOR.two-jurisdictions-four-original-assay-cell-component-CAS.E0G0.json')['sourcePlans']
results=[];cas=[];positions=[]
for state in ['BB','BE']:
 original=rd(A/f'inputs/{state}.original-current-whole203-source-inventory.byte-exact.json')
 raw=rd(A/f'candidate/{state}.whole205-source-inventory-two-exact-primary-assay-cells.author.json')
 pagination=rd(A/f'candidate/{state}.whole205-source-inventory.XML-safe-pagination-only.author.json')
 safe_path=A/f'candidate/{state}.whole205-source-inventory.XML-safe-and-lossless-span-transport.author.json';safe=rd(safe_path)
 assert len(original['sourceGoals'])==203 and len(raw['sourceGoals'])==len(safe['sourceGoals'])==205
 assert raw['sourceGoals'][:203]==original['sourceGoals']
 assert raw['passages'][:-1]==original['passages']
 assert original['sourceLandscapeId']==raw['sourceLandscapeId']==safe['sourceLandscapeId']
 assert len(set(g['id']for g in raw['sourceGoals']))==205
 assert projected[raw['sourceLandscapeId']]=={g['id']for g in raw['sourceGoals']}
 new_ids={g['id']for g in raw['sourceGoals'][203:]};assert len(new_ids)==2
 # The projection preserves old source document fields and adds only the primary role.
 for key in ['sourceDocument']:
  old=copy.deepcopy(original[key]);new=copy.deepcopy(raw[key]);assert new.pop('role')=='binding-core';assert old==new
 assert len(original['sourceDocuments'])==len(raw['sourceDocuments'])
 for old,new in zip(original['sourceDocuments'],raw['sourceDocuments']):
  new=copy.deepcopy(new);assert new.pop('role')=='binding-core';assert old==new
 assert {k:v for k,v in original.items()if k not in('sourceGoals','passages','sourceDocument','sourceDocuments')}=={k:v for k,v in raw.items()if k not in('sourceGoals','passages','sourceDocument','sourceDocuments')}
 # Reconstruct the exact raw passages by a fully bound pagination-position sidecar.
 assert {k:v for k,v in raw.items()if k!='passages'}=={k:v for k,v in pagination.items()if k!='passages'}
 restored=copy.deepcopy(pagination);char_count=0;passage_fields=0
 for index,(a,b)in enumerate(zip(raw['passages'],pagination['passages'])):
  assert set(a)==set(b)
  for key in a:
   if a[key]!=b[key]:
    assert isinstance(a[key],str)and a[key].replace('\f','\n')==b[key]
    ix=[i for i,c in enumerate(a[key])if c=='\f'];chars=list(b[key])
    for i in ix:assert chars[i]=='\n';chars[i]='\f'
    restored['passages'][index][key]=''.join(chars);positions.append({'state':state,'passageIndex':index,'field':key,'formFeedPositions':ix});char_count+=len(ix);passage_fields+=1
 assert restored==raw
 # Every structured sourceSpan is JSON-string transported and exactly decodable.
 assert {k:v for k,v in pagination.items()if k!='sourceGoals'}=={k:v for k,v in safe.items()if k!='sourceGoals'}
 restored_safe=copy.deepcopy(safe);spans=0
 for i,(a,b)in enumerate(zip(pagination['sourceGoals'],safe['sourceGoals'])):
  if a!=b:
   aa=copy.deepcopy(a);bb=copy.deepcopy(b);before_span=aa.pop('sourceSpan');after_span=bb.pop('sourceSpan')
   assert aa==bb and isinstance(before_span,dict)and json.loads(after_span)==before_span
   restored_safe['sourceGoals'][i]['sourceSpan']=json.loads(after_span);spans+=1
 assert restored_safe==pagination
 oldmapping=rd(A/f'inputs/{state}.original-current-whole203-decisions-and314-edges.byte-exact.json')
 raw_mapping=rd(A/f'mapping/{state}.whole205-decisions316-edges.author-nonoperative.json')
 safe_mapping_path=A/f'mapping/{state}.whole205-decisions316-edges.XML-safe-span-source-address-only.author.json';safe_mapping=rd(safe_mapping_path)
 assert len(oldmapping['mappings'])==314 and len(oldmapping['decisions'])==203
 assert raw_mapping['mappings'][:314]==oldmapping['mappings']and raw_mapping['decisions'][:203]==oldmapping['decisions']
 assert len(raw_mapping['mappings'])==316 and len(raw_mapping['decisions'])==205
 assert {x['sourceGoalId']for x in raw_mapping['decisions'][203:]}==new_ids
 assert {x['legacyGoalId']for x in raw_mapping['mappings'][314:]}==new_ids
 assert all(x['canonicalGoalId']=='5c8f0bbb-103a-579f-87fc-c997afe4fd18'and x['matchType']=='partial'for x in raw_mapping['mappings'][314:])
 assert {k:v for k,v in raw_mapping.items()if k!='sourceExtractionPath'}=={k:v for k,v in safe_mapping.items()if k!='sourceExtractionPath'}
 assert safe_mapping['sourceExtractionPath']==str(safe_path.relative_to(R))
 binding={'reviewPath':str(safe_mapping_path.relative_to(R)),'sourceExtractionPath':str(safe_path.relative_to(R)),'legacyMappingPath':str((A/f'inputs/{state}.original-legacy-mapping.byte-exact.json').relative_to(R)),'mappingCollectionId':safe_mapping['reviewId']}
 mc,sc,gc,diagnostics,inputs=stock.compile_mapping_source_lane(binding,can['landscapeId'],ids,membership,stock.PublicationInputClassifier(profile),profile['sourceDocumentSemantics']['roles'])
 payloads={'source-to-canonical-mappings':{'$schema':stock.SCHEMA_IDS['source-to-canonical-mappings'],'mappingFormatVersion':'1.0','targetLandscapeId':can['landscapeId'],'mappingCollectionCount':1,'decisionCount':mc['inputDecisionCount'],'mappingEdgeCount':mc['mappingEdgeCount'],'collections':[mc]},'official-source-index':{'$schema':stock.SCHEMA_IDS['official-source-index'],'sourceIndexFormatVersion':'1.0','targetLandscapeId':can['landscapeId'],'sourceCollectionCount':1,'sourceDocumentCount':len(sc['documents']),'collections':[sc]},'source-goal-reference-index':{'$schema':stock.SCHEMA_IDS['source-goal-reference-index'],'sourceGoalReferenceFormatVersion':'1.0','targetLandscapeId':can['landscapeId'],'sourceCollectionCount':1,'sourceGoalCount':gc['sourceGoalCount'],'collections':[gc]}}
 for name,value in payloads.items():
  Draft202012Validator(rd(stock.SCHEMA_FILES[name]),format_checker=FormatChecker()).validate(value)
  wr(f'checks/STOCK.exact-{state}-205-source-components.{name}.actual.json',value)
 assert gc['sourceGoalCount']==205 and mc['inputDecisionCount']==205 and mc['mappingEdgeCount']==316
 results.append({'state':state,'sourceLandscapeId':raw['sourceLandscapeId'],'oldWhole203CellsExactInRawLane':True,'oldWhole203DecisionsAnd314EdgesExact':True,'sourceGoals':205,'decisions':205,'edges':316,'schemaPass':3,'structuredSpansReversible':spans,'paginationFieldsReversibleWithExactSidecar':passage_fields,'formFeedCharacters':char_count,'explicitMembershipExactly205':True,'diagnostics':dict(diagnostics),'transportChangesOldStructuredSpanJSONTypeNotOldHistoricalBytes':True,'legacyCompleteCarrierStatusNotWholeScienceApproval':safe_mapping.get('status'),'inputs':inputs})
 for row in next(p['newCells']for p in plans if p['jurisdiction']=='DE-'+state):
  source=row['wholeNewSourceCell'];before=copy.deepcopy(row['wholeNewAuthorDecision']);after=copy.deepcopy(before)
  after['reviewer']='Codex genuine independent source-component B; no whole5c/M311/prerequisite approval'
  after['reviewedAt']=science['completedAt']
  after['rationale']='Independent B accepted bounded PARTIAL source component. Original BB/BE2022 physical26 makes named experiments mandatory while allowing equipment-based variation if intentions remain; physical28 places '+source['sourceText']+' in GK, inherited by LK. This contributes only its amino-acid or peptide detection component of the complete current5c perform/evaluate goal. It grants neither the entire goal nor M311/GOD/21acquisition or the proposed5c prerequisite change. Original old203 source cells/decisions and314edges, denaturation neighbour and all source-course conditions remain. Actual source component science sealed before any new Source4 peer outcome.'
  cas.append({'jurisdiction':'DE-'+state,'sourceGoalId':source['id'],'wholeNewOriginalSourceCellExact':source,'wholeBeforeAuthorDecision':before,'wholeAfterIndependentBDecision':after,'wholePARTIALEdgeExact':row['wholeNewPartialEdge'],'targetWholeCurrentGoal':gi[row['wholeNewPartialEdge']['canonicalGoalId']],'sourceScienceSeal':bind(O/'FIRST-SCIENCE-SEAL.four-assay-source-components-independent-b.actual.json'),'applicationStatus':'not_applied; needs normal paired-review transport/integration','oldWhole203DecisionsAnd314EdgesOutsideThisCAS':True})
wr('checks/CHECK.two-source205-memberships-lossless-transport-and-six-stock-schemas.actual.json',{'schemaVersion':1,'checkedAt':now(),'stockCompiler':bind(R/'scripts/compile_curriculum_release_model.py'),'stockFunction':'compile_mapping_source_lane','actualWholeCurrent533CanonicalUnchanged':base,'twoLanes':results,'registryUnchanged':bind(registry),'explicitNonoperativeTwoLaneMembershipProjection':bind(projection_path),'noEngineFallbackOrCodePatch':True,'noGlobalM407OrBuildRun':True,'noSourceScienceGainInferredFromSchemas':True})
wr('checks/CAS.reversible-pagination-formfeed-position-sidecar.original-raw-bound.json',{'schemaVersion':1,'purpose':'Exact reverse witness for separate XML-safe projection, not a rewrite of original source history','positions':positions,'beforeRawCarriers':[bind(A/f'candidate/{st}.whole205-source-inventory-two-exact-primary-assay-cells.author.json')for st in['BB','BE']],'afterSafeCarriers':[bind(A/f'candidate/{st}.whole205-source-inventory.XML-safe-and-lossless-span-transport.author.json')for st in['BB','BE']],'structuredSpansReverseByJSONParse':True,'allRecoveredWhole205RawObjectsExact':True})
wr('CAS.four-actual-independent-B-PARTIAL-source-component-decisions.not-applied.json',{'schemaVersion':1,'role':'Actual independent four source-component decisions only; no carrier-wide approval','components':cas,'perStateNewCells':2,'perStatePARTIALEdges':2,'mappingCarrierChangesNotApplied':True,'source205MembershipStillNonoperative':True,'allOtherOldScienceAndWholeM311CardsRolesUnchanged':True,'wholeGoalPrerequisiteProposalNotApproved':True,'newStrictGain':0,'HAccess':False,'activeGitEngineRegistryWrites':False})
wr('SUPPLEMENT.actual-original5c-both-current-direct-prerequisites-and-no-P-review.json',{'schemaVersion':1,'wholeCurrent5c':gi['5c8f0bbb-103a-579f-87fc-c997afe4fd18'],'wholeBothDirectPrerequisites':[gi[x]for x in gi['5c8f0bbb-103a-579f-87fc-c997afe4fd18']['requires']],'fullExistingCurrent5cCasesReadAsContentContextOnly':bind(A/'inputs/WHOLE.current5c-three-Biuret-Ninhydrin-material-cases.unchanged.json'),'noNewPReviewOrRecipeApproval':True,'noJudgmentOfRemovingOriginal8fePrerequisite':True,'sourceComponentsRemainBoundToCurrentWholeUnchangedGoal':True})
print(json.dumps({'lanes':[{k:v for k,v in x.items()if k not in('inputs','diagnostics')}for x in results],'actualIndependentBComponentDecisions':4,'HAccess':False,'newBroaderGateGrants':0},ensure_ascii=False))
