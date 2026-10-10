# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from copy import deepcopy
import hashlib,json
R=Path('/home/enpasos/projects/skillpilot');B=Path('curricula/DE/Gymnasium/quality/goal-evidence')
OLD=B/'2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1'
P=B/'2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1';D=R/P
assert not (D/'author.final.freeze.json').exists()
def ref(p):
 b=(R/p).read_bytes();assert not (R/p).is_symlink()
 return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=D/p;f.parent.mkdir(parents=True,exist_ok=True)
 b=x if isinstance(x,bytes) else (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
 if f.exists():assert f.read_bytes()==b,p
 else:f.write_bytes(b)
 return ref(P/p)
def read(p):return json.loads((R/p).read_text())
def exact(p,dest):
 b=ref(p);o=put(dest,(R/p).read_bytes());assert b['sha256']==o['sha256'];return {'original':b,'ownExactCopy':o}
visual=read(P/'inputs/whole26-genuine-current-raster-pair.exact.json');rows=[]
for row in visual['rows']:
 s=row['actualSelectedRaster'];actual=ref(s['path']);assert actual['sha256']=='sha256:'+s['sha256'].removeprefix('sha256:');assert actual['bytes']==s['bytes']
 assert row['pairedCurrentRoleStatus']=='PAIRED_KEEP'
 copied=exact(s['path'],Path('assets/chemie')/row['goalId']/Path(s['path']).name)
 prompts=[]
 for p in row.get('actualPromptBindings',[]):
  a=ref(p['path']);assert a['sha256']=='sha256:'+p['sha256'].removeprefix('sha256:')
  prompts.append(exact(p['path'],Path('assets/chemie')/row['goalId']/Path(p['path']).name))
 indeps=[]
 for key in ['independentA','independentB']:
  rr=row[key];bound=rr['verdictFile'];a=ref(bound['path']);assert a['sha256']=='sha256:'+bound['sha256'].removeprefix('sha256:')
  indeps.append({'role':key,'actualExistingBoundedVerdict':rr})
 rows.append({'goalId':row['goalId'],'candidateKey':row['candidateKey'],'wholeExactSelectedRaster':copied,
              'selectedResourceLink':deepcopy(row['selectedResourceLink']),'actualFormat':row['actualFormat'],
              'actualDimensions':row['actualDimensions'],'actualProviderAsDocumented':row['actualProviderAsDocumented'],
              'wholeExactPrompts':prompts,'wholeExistingIndependentRasterRoleJudgments':indeps,
              'decision':'KEEP_UNCHANGED_EXISTING_PAIRED_RASTER','currentNativePageApproval':False,'newImageGeneration':False})
put(Path('assets/whole26-exact-current-raster-origin-and-binding-map.json'),{
 'schemaVersion':1,'role':'Exact technical binding of actual existing independently inspected current raster roles; no new image or native review',
 'rows':rows,'rasterCount':26,'newImagesGenerated':0,'imagePixelsChanged':0,'humanApproval':False,'activeWrites':[],'strictGain':0})
fpath=OLD/'source-view-remediation-author-v3/canonical504-one-faithful-redox-EN-existing-fields-kept.author-candidate.json'
f=read(fpath);by={g['id']:g for g in f['goals']}
original=read(P/'inputs/whole9-original-source-structure-a.exact.json');aa={x['goalId']:x for x in original['families']}
bb={x['goalId']:x for x in read(P/'inputs/whole9-original-source-structure-b.exact.json')['verdicts']}
trace=read(P/'inputs/whole9-original-mandatory-product-source-trace.exact.json')
raw=read(P/'inputs/whole-original26-raw-profiles-and52-cases.exact.json');rawbykey={x['candidateKey']:x for x in raw['routineBodies']}
am=read(P/'inputs/whole25-genuine-AM-a.exact.json');ab={x['goalId']:x for x in am['records']}
bm=read(P/'inputs/whole25-genuine-AM-b.exact.json');bmb={x['goalId']:x for x in bm['all25GoalResults']}
split=[]
for x in trace['families']:
 gid=x['originalFamilyGoalId'];g=by[gid]
 if g['type']!='cluster':continue
 kids=[rawbykey[k]['wholeGoal']['id'] for k in x['candidateKeys']]
 assert set(kids)==set(g['contains']),gid
 results=[]
 for k,cgid in zip(x['candidateKeys'],kids):
  assert cgid in ab and cgid in bmb
  ag=ab[cgid];bg=bmb[cgid]
  assert ag['semanticKindScientificConfirmation']=='curricularAtomic' or isinstance(ag['semanticKindScientificConfirmation'],dict)
  results.append({'candidateKey':k,'goalId':cgid,'wholeCurrentCandidateChild':by[cgid],
                  'actualExistingWholeAM_A':ag,'actualExistingWholeAM_B':bg,
                  'wholeHistoricalMandatoryProductTrace':next(z for z in x['mandatoryProductTrace'] if z['candidateKey']==k)})
 split.append({'retainedOriginalFamilyGoalId':gid,'wholeCurrentCandidateFamily':g,
               'wholeOriginalIndependentSourceStructureA':aa[gid],'wholeOriginalIndependentSourceStructureB':bb[gid],
               'wholeOriginalFamilySourceDutyTrace':x,'wholeCurrentChildrenAndExistingIndependentAM':results,
               'decision':'INACTIVE_PRESERVED_ID_AND_FAMILY_CANDIDATE_WITH_DISTINCT_REVIEWED_CHILD_PRODUCTS',
               'historicalV6RevisionsAreNotOverriddenByThisTechnicalTrace':True,
               'originalFullSourceDutiesRetained':True,'wholeSourceCoursePlacementApproval':False,
               'newIndependentAreaReviewClaimed':False,'strictGain':0,'humanApproval':False})
assert len(split)==7
put(Path('source/seven-original-IDs-retained-whole-child-products-and-independent-split-basis.technical.json'),{
 'schemaVersion':1,'role':'Transparent inactive original-ID AND-family technical classification trace, no new science verdict',
 'originalWholeSourceDutyInventory':ref(P/'inputs/whole-original1646-B008-source-duty-inventory.exact.json'),
 'wholeFutureInput':ref(fpath),'originalFamilyCount':7,'wholeRetainedOriginalFamilyIdsAndDistinctProducts':split,
 'historicalContradictoryOrHeldSourceOperatorFindingsPreservedWhole':True,
 'noOriginalGoalIdRemoved':True,'noSourceDutyReduction':True,'wholeSourceCourseScopeApproval':False,
 'currentNativeOrM7Approval':False,'activeWrites':[],'humanApproval':False,'strictGain':0})
print(json.dumps({'rasters':len(rows),'newImagesGenerated':0,'retainedANDfamilies':len(split),'wholeOriginalDuties':1646,'strictGain':0}))
