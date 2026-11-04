from pathlib import Path
import json,gzip,hashlib,shutil,fitz
H=Path(__file__).resolve().parent;R=H.parents[2];G=R/'tmp/approach-review-20261101/statistics-pyramid-existing-route-native-20261104-v1/candidate-data';B=R/'tmp/approach-review-20261101/cone-complex-four-plus-b2-integration-20261104-v1/check-host';A=R/'tmp/approach-review-20261101/astra-three-existing-route-fundamental-20261104-v1';Geo=R/'tmp/approach-review-20261101/geometry-six-remaining-content-20261104-v1';ID='28cdee95-3c8e-5760-a68a-405b7f9c6cbf';DGL2='58fda9b4-4336-5594-99ce-722c4a453372'
assert not (H/'review-input-manifest.json').exists()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p,base=None):
 base=base or (G if p.is_relative_to(G)else B if p.is_relative_to(B)else R)
 return {'inputRoot':str(base.relative_to(R))if base!=R else'.','path':str(p.relative_to(base)),'sha256':sha(p)}
def put(n,v):
 p=H/n;p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
copies=[]
def cp(p,name):
 q=H/name;q.parent.mkdir(exist_ok=True,parents=True);shutil.copyfile(p,q);copies.append({'originalBinding':bind(p),'privateCopy':name})
# Byte audit of the entire previously frozen182-file geometry package; read-only.
gm=Geo/'review-input-manifest.json';assert sha(gm)=='b69f993176d114ae88f1811ed64e92ccf02e9a8d466285d8833dad6aff576473';geo=json.loads(gm.read_text());assert len(geo['files'])==182
for f in geo['files']:assert sha(Geo/f['path'])==f['sha256']
put('geometry-freeze-read-only-audit.json',{'status':'PASS_ALL182_GEOMETRY_INPUT_FILES_BYTE_EXACT_READ_ONLY','manifest':bind(gm),'auditedFiles':len(geo['files']),'geometryWriteOperations':0})
assert sha(A/'review-handoff.json')=='45cc65b76295c17bef55526c7550586751e6e85a6b7f7d84dd78b7beda5f84c8'
for name in ['HANDOFF.md','review-handoff.json','bounded-followup-contracts.json','finite-scope-decisions.json','reviewed-primary-passages.json','review-manifest.json']:
 cp(A/name,'original/astra-fundamental/'+name)
p=G/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';assert sha(p)=='30c95213b0a6b7debc6b9a470c924c31cc7b733612bc11cf3e559d394dcdc891';d=json.loads(p.read_text());by={g['id']:g for g in d['goals']};cp(p,'original/canonical.current.json')
def closure(start,mapping=None):
 seen=set();todo=list(start)
 while todo:
  x=todo.pop()
  if x in seen:continue
  seen.add(x);todo.extend((mapping or {}).get(x,by[x].get('requires',[])))
 return seen
prep=closure([ID]);put(ID+'/competency-contract.current.json',by[ID]);put('whole-contract-and-original-preparation.json',{'canonical':bind(p),'wholeOriginalGoal':by[ID],'originalDirectRequires':by[ID]['requires'],'wholeRawPreparationGoalIds':sorted(prep-{ID}),'wholeRawPreparationGoalObjects':[by[x]for x in sorted(prep-{ID})],'proposedRChanges':[],'preparationIsNotCoverage':True})
related=[DGL2,'97fb270f-9ede-5fe0-9a1f-600ffbd65610'];put('whole-existing-alternatives-and-preparation.json',{'wholeAlternatives':[by[x]for x in related],'perAlternative':[{'goalId':i,'originalRequires':by[i].get('requires',[]),'wholeRawPreparationGoalIds':sorted(closure([i])-{i})}for i in related],'wholePreparationGoalObjects':[by[x]for x in sorted(closure(related)-set(related))],'noTaskOrRChanged':True})
rows=[];memoryContext=[];cards=[]
for lane,key in [('semantic-atomicity','A'),('memory-card-review','M')]:
 cfgp=B/f'curricula/DE/Gymnasium/quality/{lane}/canonical-math-full.config.json';cfg=json.loads(cfgp.read_text());rp=B/cfg['reviewPath'];cp(cfgp,f'original/registered-before-{key}.config.json');cp(rp,f'original/registered-before-{key}.review.jsonl')
 for n,raw in enumerate(rp.read_text().splitlines(),1):
  row=json.loads(raw)
  if row['goalId']==ID:rows.append({'lane':lane,'registeredConfig':bind(cfgp),'registeredReview':bind(rp),'line':n,'wholeCurrentRow':row,'rawCurrentRegisteredLine':raw})
  if lane=='memory-card-review'and row['goalId']in prep:memoryContext.append({'line':n,'wholeCurrentRow':row,'rawCurrentRegisteredLine':raw})
 if cfg.get('cardReviewPath'):
  crp=B/cfg['cardReviewPath'];crp=crp if crp.exists()else R/cfg['cardReviewPath'];cp(crp,'original/registered-before-M.cards.review.jsonl')
  for n,raw in enumerate(crp.read_text().splitlines(),1):
   row=json.loads(raw)
   if row.get('goalId')in prep:cards.append({'line':n,'wholeCardReviewRow':row,'rawRegisteredCardLine':raw})
assert len(rows)==2;put('current-two-registered-am-rows.json',{'status':'ORIGINAL_REAL_CURRENT_ROWS_ONLY','rows':rows})
# Keep memory-bearing ancestors, their exact goal/row/deck fields and registered per-card bindings.
memgoals=[by[x]for x in sorted(prep)if by[x].get('memoryData')or any('memory'in k.lower()or'deck'in k.lower()for k in by[x])]
memoryids=sorted({x for r in memoryContext for x in r['wholeCurrentRow'].get('memoryGoalIds',[])})
deckids=sorted({x for r in memoryContext for x in r['wholeCurrentRow'].get('deckIds',[])})
allcardrows=[];crp=H/'original/registered-before-M.cards.review.jsonl'
for lineno,raw in enumerate(crp.read_text().splitlines(),1):
 row=json.loads(raw)
 if row.get('deckId')in deckids:allcardrows.append({'line':lineno,'wholeCardReviewRow':row,'rawRegisteredCardLine':raw})
decks=[]
for lang in ['de','en']:
 rel='curricula/DE/Gymnasium/memory-decks/de_gymnasium_math_flashcards_analysis_core.'+lang+'.json';source=B/rel
 if not source.exists():source=R/rel
 cp(source,'original/memory-deck.'+lang+'.json');decks.append({'language':lang,'originalBinding':bind(source),'privateCopy':'original/memory-deck.'+lang+'.json','wholeDeck':json.loads(source.read_text())})
put('whole-memory-obligation-and-deck-context.json',{'status':'UNCHANGED_ORIGINAL_MEMORY_CONTRACTS_AND_REGISTERED_CARD_BINDINGS','originalDgl1MStatus':next(r['wholeCurrentRow']['status']for r in rows if r['lane']=='memory-card-review'),'wholeRegisteredMemoryRowsForDgl1AndAll54Ancestors':memoryContext,'wholeCanonicalMemoryBearingGoals':memgoals,'wholeReferencedMemoryGoals':[by[x]for x in memoryids],'memoryGoalIds':memoryids,'deckIds':deckids,'wholeActualDecks':decks,'registeredCardReviewRowsForWholeReferencedDecks':allcardrows,'newMemoryExemptionOrDeck':False,'goalDeckAndReviewRowsRewritten':False})

lp=G/'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json';ld=json.loads(lp.read_text());assert ld['counts']['curricularAtomic']==807;cp(lp,'original/semantic-kinds.current.json');put('current-semantic-kind-context.json',{'ledger':bind(lp),'counts':ld['counts'],'wholeRows':[r for r in ld['decisions']if r['goalId']==ID]})
N=G.parent/'candidate.json.gz';assert sha(N)=='e0b466350b58395c0440a8b1af837044ee143c6bbb36d5f8c5a3a6a2f65708ab';n=json.load(gzip.open(N,'rt'));scopes=[];actualprep=set()
for r in n['scopes']:
 E=r['effectiveDirectPrerequisitesByContextGoalId'];facts=[]
 for i in [ID,DGL2,'ca708087-71f8-5fae-91c5-b80721a4208f']:
  pr=closure([i],E)-{i}if i in r['contextGoalIds']else set();actualprep|=pr
  facts.append({'goalId':i,'target':i in r['targetGoalIds'],'prerequisiteOnly':i in r['prerequisiteOnlyGoalIds'],'context':i in r['contextGoalIds'],'neededAtM0':i in r['neededContextGoalIdsAtM0'],'selectedProtectedTarget':i in r['selectedProtectedTargetGoalIds'],'visiblePaths':r['visibleGoalPaths'].get(i,[]),'actualEffectiveDirectRequires':E.get(i,[]),'wholeActualEffectivePreparationGoalIds':sorted(pr)})
 scopes.append({'scope':r['scope'],'scopeDecision':r['scopeDecision'],'personalCurriculumConfig':r['personalCurriculumConfig'],'compositionViewIds':r['compositionViewIds'],'facts':facts,'actualEffectivePrerequisitesForWholeRelevantPreparation':{x:E[x]for x in sorted(set([ID,DGL2,'ca708087-71f8-5fae-91c5-b80721a4208f'])|set().union(*(set(v['wholeActualEffectivePreparationGoalIds'])for v in facts)))if x in E}})
put('actual-g3-membership-and-effective-preparation.json',{'nativeBinding':bind(N,R),'scopeCount':n['actualScopeCount'],'actualUnionCount':n['actualUnionCount'],'rows':scopes,'wholeActualEffectivePreparationGoalObjects':[by[x]for x in sorted(actualprep)],'newNativeExecution':False,'noNewProtectedRoleSelection':True})
fs=json.loads((A/'finite-scope-decisions.json').read_text());rejected=[r for r in fs['exactPairs']if r.get('goalId')==DGL2];assert len(rejected)==44;put('original44-rejected-dgl2-pairs.NOT-new-dgl1-role-approval.json',{'originalAstraHandoff':bind(A/'review-handoff.json'),'originalExact44PairRows':rejected,'meaning':'Original DGL2 rejection and DGL1 content order only. No DGL1 role, identity conversion or placement is approved here; existing protected DGL2 consumers in other scopes remain unchanged.'})
mp=B/'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json';m=json.loads(mp.read_text());ep=B/m['sourceExtractionPath'];ex=json.loads(ep.read_text());sg={g['id']:g for g in ex['sourceGoals']};pg={g['id']:g for g in ex['passages']};records=[];cp(mp,'original/HE.source-mapping.json');cp(ep,'original/HE.source-extraction.json');doc=ex['sourceDocuments'][0];pdf=B/doc['path'];cp(pdf,'original/HE.KC2024.pdf');pages=[];pdfdoc=fitz.open(pdf)
for j in [35,37]:
 page=pdfdoc[j];stem=f'HE-KC2024-page{j+1}';q=H/'source-pages';q.mkdir(exist_ok=True);(q/(stem+'.txt')).write_text(page.get_text());page.get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(q/(stem+'.png'));pages.append({'physicalAndPrintedPage':j+1,'text':'source-pages/'+stem+'.txt','image':'source-pages/'+stem+'.png','fullPrimaryPageRead':True})
for row in m['mappings']:
 if row['canonicalGoalId']!=ID:continue
 s=sg[row['legacyGoalId']];records.append({'wholeMappingRow':row,'wholeSourceGoal':s,'wholeSourcePassage':pg[s['passageId']],'wholeMappingDecisions':[v for v in m.get('decisions',[])if v.get('sourceGoalId')==s['id']]})
put('document-specific-primary-source-context.json',{'sourceDocument':doc,'physicalPdf':bind(pdf),'sourceGoalRecords':records,'completePages':pages,'sourceStatus':'Official pinned HE KC2024. Page36 declares Q1 fields1–3 binding; Q1.5 is outside that binding list and must be presented as additional/optional theme content, not an official universal GK obligation. Inside Q1.5, page38 lists first-order methods at basic GK/LK level and second-order investigations at LK.','newTaskStatus':'Original SkillPilot-authored concrete mathematical exercise, not an official examination task. No new official scope or source mapping is claimed.','actualCurrentnessResearch':False})
put('frozen-input.json',{'canonical':bind(p),'wholeGoals':[by[ID]],'actualG3Native':bind(N,R),'originalAstraHandoff':bind(A/'review-handoff.json'),'preservedGeometryManifest':bind(gm),'scope':'One DGL1 whole content option only, original stable curricularAtomic identity retained; no R, role, applicability, source or stage changes.'})
put('private-original-copies.json',{'copies':copies})
print(json.dumps({'status':'DGL1_WHOLE_ORIGINAL_CONTEXT_PREPARED','rawAncestors':len(prep)-1,'AMrows':len(rows),'memoryContextRows':len(memoryContext),'memoryBearingGoals':len(memgoals),'cardReviewRows':len(allcardrows),'scopes':len(scopes),'rejectedPairs':len(rejected),'dgl1T':sum(v['facts'][0]['target']for v in scopes),'dgl2Protected':sum(v['facts'][1]['selectedProtectedTarget']for v in scopes)}))
