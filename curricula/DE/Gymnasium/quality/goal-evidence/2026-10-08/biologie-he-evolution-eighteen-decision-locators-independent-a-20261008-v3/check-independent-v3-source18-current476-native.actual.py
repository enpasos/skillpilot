from pathlib import Path
import copy, hashlib, json, sys
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'scripts'))
from compile_curriculum_release_model import compile_mapping_source_lane,PublicationInputClassifier,CompilationError
def read(p):return json.loads(Path(p).read_text())
def write(n,x):
 with (OWN/n).open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def relative(p):return str(p.relative_to(ROOT))
v2=OWN/'input-snapshots/author-v2';v3=OWN/'input-snapshots/author-v3'
ex=read(v2/'DE_HE_BIOLOGIE_SEKII_KC2024.evolution18-operative-portable-final-20261008-v2.source-extraction.json')
review=read(v3/'hessen_biology_upper_secondary.evolution18-decision-locators.author-20261008-v3.review.json')
old=read(v2/'hessen_biology_upper_secondary.evolution18-operative-portable-final-20261008-v2.review.json')
scope=set(read(v3/'neutral-eighteen-source-v3-locator-review.entry.json')['scopeGoalIds'])
selected={d['sourceGoalId'] for d in review['decisions'] if scope.intersection(d.get('canonicalGoalIds',[]))}
assert len(selected)==18 and len(ex['sourceGoals'])==144 and len(review['decisions'])==144 and len(review['mappings'])==158
land=read(v3/'current476-plus-only-two-reviewed-wording-fixes.inactive.candidate.json')
live=read(OWN/'current-live-input-snapshots/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
assert len(land['goals'])==len(live['goals'])==476
differences=[]
for a,b in zip(live['goals'],land['goals']):
 assert a['id']==b['id']
 for k in set(a)|set(b):
  if a.get(k)!=b.get(k):differences.append({'goalId':a['id'],'field':k,'live':a.get(k),'scienceReviewedCandidate':b.get(k)})
assert len(differences)==3 and {d['goalId'] for d in differences}=={'302c6d6d-bf10-5dbc-adda-65e4b5c63e49','35b016d8-ed2c-570c-ab64-ac39f8f962b2'}
subex=copy.deepcopy(ex);subex['sourceGoals']=[g for g in ex['sourceGoals'] if g['id'] in selected];pids={g['passageId'] for g in subex['sourceGoals']};subex['passages']=[p for p in ex['passages'] if p['id'] in pids]
subreview=copy.deepcopy(review);subreview['decisions']=[d for d in review['decisions'] if d['sourceGoalId'] in selected];subreview['mappings']=[d for d in review['mappings'] if d['legacyGoalId'] in selected]
xp=OWN/'selected18.source.native.input.json';rp=OWN/'selected18.mapping.native.input.review.json';write(xp.name,subex);subreview['sourceExtractionPath']=relative(xp);write(rp.name,subreview)
classifier=PublicationInputClassifier({'fieldClassifications':read(ROOT/'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json')['fieldClassifications']})
b={'mappingCollectionId':review['reviewId'],'reviewPath':relative(rp),'sourceExtractionPath':relative(xp),'legacyMappingPath':relative(rp)}
mc,sc,sg,diag,inputs=compile_mapping_source_lane(b,land['landscapeId'],{g['id'] for g in land['goals']},{ex['sourceLandscapeId']:selected},classifier,{'binding-core':'curriculum'})
assert len(mc['edges'])==18 and all(e['matchType']=='partial' for e in mc['edges'])
outs=[('source-to-canonical-mappings',{'mappingFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'mappingCollectionCount':1,'decisionCount':18,'mappingEdgeCount':18,'collections':[mc]}),('official-source-index',{'sourceIndexFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'sourceCollectionCount':1,'sourceDocumentCount':len(sc['documents']),'collections':[sc]}),('source-goal-reference-index',{'sourceGoalReferenceFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'sourceCollectionCount':1,'sourceGoalCount':18,'collections':[sg]})]
for name,out in outs:
 schema=read(ROOT/f'contracts/curriculum-package/v1/{name}.schema.json');out['$schema']=schema['$id'];jsonschema.Draft202012Validator(schema).validate(out);write(name+'.native-closed.actual.json',out)
rows={g['id']:g for g in subex['sourceGoals']};locators=[]
authorPrefix='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-evolution-eighteen-operative-sources-author-20261008-v2/'
for d in subreview['decisions']:
 g=rows[d['sourceGoalId']];assert d['topicCode']==g['topicCode'] and d['sourceSpan']==g['sourceSpan']
 for c in g['actualPrimaryComponents']:
  assert c['wholeOriginalPagePath'].startswith(authorPrefix)
  page=v2/c['wholeOriginalPagePath'][len(authorPrefix):];body=page.read_bytes()
  assert hashlib.sha256(body).hexdigest()==c['wholeOriginalPageSha256'].removeprefix('sha256:') and c['originalText'] in body.decode()
  assert hashlib.sha256(c['originalText'].encode()).hexdigest()==c['originalTextSha256'].removeprefix('sha256:')
 assert not g['officialNumberingClaim'] and not g['isOfficialBullet'] and g['rawSourceText']==g['actualPrimaryComponents'][0]['originalText']
 locators.append({'sourceGoalId':g['id'],'goalIds':d['canonicalGoalIds'],'topicCode':d['topicCode'],'sourceSpan':d['sourceSpan'],'allLiteralPrimaryComponentsExact':True,'wholeSourceCoverageClaim':False})
fullReview=copy.deepcopy(review);fullReview['sourceExtractionPath']=relative(v2/'DE_HE_BIOLOGIE_SEKII_KC2024.evolution18-operative-portable-final-20261008-v2.source-extraction.json');fullrp=OWN/'full144.pointer-only-native-input.review.json';write(fullrp.name,fullReview)
fb={'mappingCollectionId':review['reviewId'],'reviewPath':relative(fullrp),'sourceExtractionPath':fullReview['sourceExtractionPath'],'legacyMappingPath':relative(fullrp)}
try:
 compile_mapping_source_lane(fb,land['landscapeId'],{g['id'] for g in land['goals']},{ex['sourceLandscapeId']:{g['id'] for g in ex['sourceGoals']}},classifier,{'binding-core':'curriculum'})
 raise AssertionError('Unexpected full144 pass must not hide NeuroGK2')
except CompilationError as exc:
 unresolved=[d for d in review['decisions'] if d['decision']!='mapped'];assert len(unresolved)==1 and unresolved[0]['sourceGoalId']=='ca155d02-5fae-5222-85a4-881c0a69b0de' and unresolved[0]['decision']=='needs_canonical_goal'
 assert unresolved[0]==next(d for d in old['decisions'] if d['sourceGoalId']==unresolved[0]['sourceGoalId'])
 full={'passed':False,'actualMessage':str(exc),'actualUnchangedUnsupportedDecision':unresolved[0],'verdict':'HOLD preserved unrelated NeuroGK2'}
write('independent-v3-current476-native18-closed-and-full144-hold.actual.json',{'schemaVersion':1,'actualExitCode':0,'native18ProjectionPassed':True,'closedSchemasPassed':3,'exactLocators':locators,'currentWholeGoalCount':476,'onlyThreeReviewedTextDifferences':differences,'full144':full,'diagnostics':dict(diag),'schemaPassIsIndependentScienceApproval':False,'newWholeScienceReview':False,'humanApproval':False,'D_P_V_Approvals':0,'activeWrites':False})
print(json.dumps({'actualExitCode':0,'native18':18,'closedSchemas':3,'locatorsExact':18,'currentWholeGoalCount':476,'full144':'HOLD NeuroGK2','humanApproval':False}))
