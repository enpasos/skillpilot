# SPDX-License-Identifier: Apache-2.0
"""Initial inactive actual480/378 whole-context engineering. No science decisions."""
from pathlib import Path
import json,copy,hashlib,os,shutil
R=Path.cwd();D=Path(__file__).resolve().parent;SCI=D.parent/'chemie-q3-twenty-whole-science-source-author-20261008-v1';REQ={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQ[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,v):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=v if isinstance(v,bytes)else((v if isinstance(v,str)else json.dumps(v,ensure_ascii=False,indent=2))+'\n').encode()
 if p.exists():assert p.read_bytes()==b,p
 else:
  t=p.with_suffix(p.suffix+'.tmp');t.write_bytes(b);os.replace(t,p)
 return bind(p)
def copy_exact(src,name):bind(src);return put(name,Path(src).read_bytes())
entry=read(SCI/'independent-review-entry.json');ids=entry['scopeGoalIds'];assert len(ids)==20
seal=read(SCI/entry['bindingSeal'])
for f in seal['files']:
 p=SCI/f['relativePath'];assert sha(p)==f['sha256']and p.stat().st_size==f['bytes'];bind(p)
active={'canonical':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','kinds':'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','qa':'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','registry':'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','ledger':'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json','floors':'app/scripts/config/curriculum-maturity-floor-policy.json','bookConfig':'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json','atlasInputs':'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','atlasManifest':'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json'}
before={}
for key,path in active.items():before[key]=bind(R/path);copy_exact(R/path,'before/'+key+'.json')
canon=read(R/active['canonical']);assert len(canon['goals'])==480 and sha(R/active['canonical'])=='f86209b8f750c0b576b63f34d19fb91458f2a35d6e183a8429a023e1dec53a84'
kinds=read(R/active['kinds']);atoms={d['goalId']for d in kinds['decisions']if d['semanticKind']=='curricularAtomic'};assert len(atoms)==378 and set(ids)<=atoms
assert (SCI/'frozen-inputs/01.DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_bytes()==(R/active['canonical']).read_bytes()
registry=read(R/active['registry']);chem=next(s for s in registry['subjects']if s['subject']=='chemie');M=read(R/chem['memoryReviewConfigPath']);AMguards=[]
copy_exact(R/chem['memoryReviewConfigPath'],'before/Mconfig.json')
for key,name in [('reviewPath','memory/M378.current-exact.jsonl'),('cardReviewPath','memory/existing-cards.current-exact.jsonl')]:
 v=copy_exact(R/M[key],name);AMguards.append({'kind':key,'active':bind(R/M[key]),'exactCopy':v});M[key]=v['path']
M['landscapePath']=rel(D/'before/canonical.json');M['reportPath']=rel(D/'checks/M378.current-exact.native.report.md')
for i,v in enumerate(M['visibilityScopes']):v['viewPath']=copy_exact(R/v['viewPath'],f'memory/visibility-{i:02d}.view.json')['path']
put('memory/M378.current-exact.inactive.config.json',M)
copy_exact(SCI/'frozen-inputs/full378.existing-native-review.view.json','before/full378.existing-native-review.view.json')
initialKinds=copy.deepcopy(kinds);initialKinds['sourceLandscapePath']=rel(D/'before/canonical.json');put('before/kinds.native-own-path.json',initialKinds)
base=read(R/active['bookConfig']);base.pop('compositionViewManifestPath',None);base.update(landscapePath=rel(D/'before/canonical.json'),semanticKindLedgerPath=rel(D/'before/kinds.native-own-path.json'),goalVisualizationQaPath=rel(D/'before/qa.json'),compositionViewPath=rel(D/'before/full378.existing-native-review.view.json'),bookId='chemie-q3-current378-technical-remediation-before-v2',title='Chemie – aktuelle kanonische378-Ziel-Prüfsicht',outputPath=rel(D/'native/full378.current-before.real-loader.book-model.json'))
put('before/full378.current-before.real-loader.config.json',base)
copy_exact(SCI/'source/whole-all-current-source-goals-and-1n-partners.lossless.json','source/whole-current-all20-1602-929-5459.lossless-exact.json')
pool=read(D/'source/whole-current-all20-1602-929-5459.lossless-exact.json');assert pool['matchedEdges']==1602 and pool['uniqueSourceDuties']==929 and len(pool['sourceGoals'])==929 and len(pool['matchedEdgesData'])==1602
partners=sum(len(s['allPartnerRows'])for s in pool['sourceGoals']);assert partners==5459,partners
sourcePaths=set(s['mappingPath']for s in pool['sourceGoals'])|set(s['sourceExtractionPath']for s in pool['sourceGoals']);sourceGuards=[]
for path in sorted(sourcePaths):sourceGuards.append(bind(R/path))
for s in pool['sourceGoals']:
 m=read(R/s['mappingPath']);sourceID=s['wholeRetainedExtractionGoal']['id'];partnersNow=[r for r in m['mappings']if r.get('legacyGoalId')==sourceID]
 assert partnersNow==s['allPartnerRows'],(s['sourceKey'],'real current source partners changed')
 decision=next((d for d in m.get('decisions',[])if d.get('sourceGoalId')==sourceID),None);assert decision==s['wholeCurrentDecision'],(s['sourceKey'],'real current source decision changed')
copy_exact(SCI/'whole40.material-task-model-scoring-fresh-transfer.de-en.author-candidate.json','whole-science/whole40.original-author-exact.pending-concrete-P2-remedy.json')
copy_exact(SCI/'whole20.current-native-goals.requires.parents.snapshot.json','whole-science/whole20.original-current-goals-context.exact.json')
copy_exact(SCI/'native/p20.author-candidate.review.jsonl','positive/P20.original-author-exact.pending-concrete-P2-remedy.jsonl')
imagesPath=R/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q3-three-specific-image-corrections-author-root-20261008-v1/selected-three-specific-image-corrections.author.json';images=read(imagesPath);selected=[]
# Actual PNG targets are complete before contained relative aliases are created.
for row in images['selected']:
 for key in ['png','prompt','exactRequest','provenance']:
  v=row[key];p=R/v['path'];assert sha(p)==v['sha256']and p.stat().st_size==v['bytes'];bind(p)
 gid=row['goalId'];assert gid in ids;copy_exact(R/row['png']['path'],'selected-images/'+gid+'.png');selected.append({**row,'selectedOwnPNG':rel(D/'selected-images'/f'{gid}.png')})
for row in selected:
 gid=row['goalId'];q=D/'assets/goal-visualizations/chemie'/gid/f'{gid}.png';q.parent.mkdir(parents=True,exist_ok=True);target=os.path.relpath(D/'selected-images'/f'{gid}.png',q.parent)
 if q.is_symlink():assert os.readlink(q)==target
 else:assert not q.exists();q.symlink_to(target)
 assert q.resolve(strict=True).is_relative_to(D);bind(q)
put('selected-three-root-corrected-images.exact.author-input.json',{'images':selected,'generationIsNotApproval':True,'finalNativeEligibleSubsetPending':True,'activeWrites':0})
# Exact other image observations remain separate from corrective candidates.
qa=read(R/active['qa']);by={g['id']:g for g in canon['goals']};qr={r['goalId']:r for r in qa['records']};visual=[]
for gid in ids:
 goal=by[gid];links=[l for l in goal.get('resourceLinks',[])if l.get('type')=='goal-visualization'];assets=[]
 for l in links:assets.append({'link':l,'actualPublicAsset':bind(R/'app/public'/l['url'].lstrip('/'))})
 visual.append({'goalId':gid,'currentWholeGoal':goal,'currentWholeQARow':qr[gid],'actualAssets':assets,'candidateCorrection':next((r for r in selected if r['goalId']==gid),None),'newApproval':False})
put('current-twenty-actual-assets-KEEP-and-three-candidates.input.json',{'records':visual,'unchangedActualRaster17':True,'correctivePNGCandidates3':True,'newVisualReviewOrApproval':False})
put('initial-current480-378-full-context-source-M-guards.technical.json',{'role':'Inactive engineering only; final eligible native subset and concrete scientific remedies pending Root','current480Canonical':True,'curricularAtomic378':True,'rawProjectedAtomic410':'410 raw leaf atoms minus32classified practiceAssessment in separate existing current378 review view; national active SourceAtlas359 is unchanged','nationalAtlasExpectedCurrentCount':read(R/active['atlasInputs'])['expectedCurricularAtomicGoalCount'],'originalAuthor20WholeBodiesAnd40CasesImmutable':True,'authorFinalSeal':bind(SCI/entry['bindingSeal']),'scope20GoalIds':ids,'beforeBindings':before,'currentMemoryExactGuards':AMguards,'wholeSourceCounts':{'matchedEdges':1602,'sourceDuties':929,'allPartnerRows':5459},'currentMappingAndExtractionGuards':sourceGuards,'sourceHOLDsNotCleared':True,'PNG3CandidatesNoApproval':True,'finalNativeEligibleGoalIds':None,'actualFull378NativeModelPending':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
put('checks/initial-declared-inputs.technical.json',{'files':list(REQ.values())})
print(json.dumps({'actualCanonical480':True,'actualCurricularAtomic378':True,'currentSourceLossless1602_929_5459':True,'PNGCandidates3CopiedAndContained':True,'fullMemoryRecordsUnchanged':True,'nationalAtlas359Unchanged':True,'finalEligibleIDsAndConcreteRemedies':'pending Root','activeWrites':0}))
