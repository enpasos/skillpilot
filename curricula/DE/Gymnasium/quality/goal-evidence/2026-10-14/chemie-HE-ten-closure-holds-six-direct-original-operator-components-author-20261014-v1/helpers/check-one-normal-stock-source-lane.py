# Apache-2.0. Exactly one HE source lane, normal compiler and closed stock schemas.
from pathlib import Path
import importlib.util,sys,json,datetime,hashlib
from jsonschema import Draft202012Validator,FormatChecker
R=Path.cwd();O=Path(__file__).resolve().parents[1];REL=O.relative_to(R)
def rd(p):return json.loads(p.read_text())
def wr(p,j):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
spec=importlib.util.spec_from_file_location('stock_compiler',R/'scripts/compile_curriculum_release_model.py');m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
profile=rd(R/'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json')
classifier=m.PublicationInputClassifier(profile)
can=rd(O/'candidate/canonical533.current407.exact-N5.inactive.json');goals={g['id']:g for g in can['goals']};mapping=rd(O/'candidate/HE.whole202-six-PARTIAL-components.XML-safe-source-binding.author-nonoperative.json')
membership=rd(R/'curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json');memberships={x['landscapeId']:set(x['goalIds']) for x in membership['landscapes']}
binding={'reviewPath':str(REL/'candidate/HE.whole202-six-PARTIAL-components.XML-safe-source-binding.author-nonoperative.json'),'sourceExtractionPath':str(REL/'candidate/HE.current2026.whole202-source-cells.XML-safe-pagination-only.author.json'),'legacyMappingPath':'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_to_canonical_chemistry.chemie-source-cell-merge-poly18-aro19-final-20261013-v1.json','mappingCollectionId':mapping['reviewId']}
mc,sc,gc,diagnostics,inputs=m.compile_mapping_source_lane(binding,can['landscapeId'],set(goals),memberships,classifier,profile['sourceDocumentSemantics']['roles'])
documents=sc['documents'];payloads={
'source-to-canonical-mappings':{'$schema':m.SCHEMA_IDS['source-to-canonical-mappings'],'mappingFormatVersion':'1.0','targetLandscapeId':can['landscapeId'],'mappingCollectionCount':1,'decisionCount':mc['inputDecisionCount'],'mappingEdgeCount':mc['mappingEdgeCount'],'collections':[mc]},
'official-source-index':{'$schema':m.SCHEMA_IDS['official-source-index'],'sourceIndexFormatVersion':'1.0','targetLandscapeId':can['landscapeId'],'sourceCollectionCount':1,'sourceDocumentCount':len(documents),'collections':[sc]},
'source-goal-reference-index':{'$schema':m.SCHEMA_IDS['source-goal-reference-index'],'sourceGoalReferenceFormatVersion':'1.0','targetLandscapeId':can['landscapeId'],'sourceCollectionCount':1,'sourceGoalCount':gc['sourceGoalCount'],'collections':[gc]}}
for name,value in payloads.items():
 Draft202012Validator(rd(m.SCHEMA_FILES[name]),format_checker=FormatChecker()).validate(value)
 wr(O/f'checks/structural-only-compiled-HE-author-shadow.{name}.json',value)
plans=rd(O/'AUTHOR.ten-whole-HE-tuple-plans-six-direct-primary-components-and-residual-HOLDs.json');compiled={(e['sourceGoalId'],e['canonicalGoalId']):e for e in mc['edges']}
for row in plans['sixConcreteDirectPartialEdges']:assert compiled[(row['sourceGoalId'],row['canonicalGoalId'])]['matchType']=='partial'
assert gc['sourceGoalCount']==202 and mc['inputDecisionCount']==202
wr(O/'checks/stock-one-HE-source-lane-and-three-closed-schemas.actual.json',{'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stockFunction':'compile_mapping_source_lane','unmodifiedCompilerSha256':'sha256:'+hashlib.sha256((R/'scripts/compile_curriculum_release_model.py').read_bytes()).hexdigest(),'oneHELaneOnly':True,'stockClosedSchemasPassed':list(payloads),'all202SourceGoalsAndDecisionsJoin':True,'newSixPartialEdgesStructurallyPresent':True,'diagnostics':dict(diagnostics),'inputBindings':inputs,'newScientificSourceApproval':False,'shadowCompileIsNotPublicationOrReviewAcceptance':True,'pass':True})
print(json.dumps({'sourceGoals':gc['sourceGoalCount'],'decisions':mc['inputDecisionCount'],'edges':mc['mappingEdgeCount'],'closedSchemasPASS':3,'newAuthorPartialEdges':6,'scienceApproved':False}))
