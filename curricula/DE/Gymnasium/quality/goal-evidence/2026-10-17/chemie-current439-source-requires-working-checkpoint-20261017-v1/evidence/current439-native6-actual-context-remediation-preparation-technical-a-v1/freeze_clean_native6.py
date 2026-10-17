import json,pathlib,hashlib,shutil,urllib.request,datetime
B=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017');O=B/'current439-native6-actual-context-remediation-preparation-technical-a-v1';C=O/'capsule';Q='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-native6-actual-context-remediation-technical-v1';N=C/Q/'native-six';S=O/'clean-source-partners';S.mkdir(exist_ok=False);(S/'primary').mkdir()
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(p,x):
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');p.chmod(0o444);return pin(p)
def copy_primary(p,label):
 p=pathlib.Path(p);d=S/'primary'/(label+p.suffix);shutil.copyfile(p,d);d.chmod(0o444);return {'copiedOriginal':pin(d),'unchangedOriginalPin':pin(p)}
manifest=json.load(open(N/'batch-manifest.json'));ids=manifest['goalIds'];canon=C/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';cg=json.load(open(canon));gs={g['id']:g for g in cg['goals']};pp=C/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-paired-all-seven-HB7f-current650-technical-v1/P439.current.all439-whole-lines-exact-03-04-retained.jsonl';ps={p['goalId']:p for p in map(json.loads,pp.read_text().splitlines())}
closure=set(ids);stack=list(ids)
while stack:
 g=gs[stack.pop()]
 for r in g.get('requires',[]):
  if r not in closure:closure.add(r);stack.append(r)
def body(i):return {'goalId':i,'wholeCurrentGoal':gs[i],'wholeCurrentProfileBody':ps[i]['profile'] if i in ps else None,'existingProfileBodyPin':{'profileFingerprint':ps[i]['profileFingerprint'],'evidenceLevel':ps[i]['evidenceLevel'],'maximumClaimScope':ps[i]['maximumClaimScope']} if i in ps else None}
hepath=C/'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json';he=json.load(open(hepath));topics=['E.5','Q1.1','Q1.4','Q2.3','Q3.3','Q4.2'];hep=[p for p in he['passages'] if p['topicCode'] in topics];hepid={p['id'] for p in hep}
heorig=[]
for fn in ['kerncurriculum_gymnasiale_oberstufe-chemie.pdf','kcgo_chemie_21.04.2026.pdf']:
 p=C/'curricula/DE/Gymnasium/input/HE/upper-secondary'/fn
 if p.exists():heorig.append(copy_primary(p,'HE-'+fn[:-4]))
bypath=C/'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json';by=json.load(open(bypath));byp=[p for p in by['passages'] if p['topicCode']=='C12-EA.3'];bypid={p['id'] for p in byp}
url='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/erhoeht';byhtml=S/'primary/BY-C12-erhoeht.actual-official.html';req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'});data=urllib.request.urlopen(req,timeout=30).read();assert b'EDTA' in data and b'Analytik' in data;byhtml.write_bytes(data);byhtml.chmod(0o444)
oldclean=B/'nano-aromatics-and-methods-retained-target-scope-author-v1/REVIEW-INPUT.clean-ten-whole-Nano-aromatic-methods-goals-Ps-primary-and25contexts.json';old=json.load(open(oldclean));prim=[]
for x in old['primarySourcesWithWholeRelevantPages']:
 if x['sourceLabel'] in ['HB-upper','SH-upper','SN-upper'] or any(s in x['sourceLabel'] for s in ['HB','SH','SN']):
  y={k:v for k,v in x.items() if k in ['sourceLabel','documentMetadata','wholeRelevantPages']};p=pathlib.Path(x['originalPDF']['path']);y['originalPDF']=copy_primary(p,x['sourceLabel']);prim.append(y)
# Historical derived source objects are context, not primary documents or current full-source coverage.
histpath=C/'curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_CHEMIE.de.json.snapshot';hist=json.load(open(histpath));hids={'aee971bb-ffe4-446c-a857-e199252ef6f3','3006abb6-a992-48fb-a464-a70fa8b7a4b8','0777b113-ef70-4b7a-aaf5-77b44bdc8980'}
images=[];model=json.load(open(N/'bundle/book-model.json'))
# Pin actual images referenced by the freshly rendered selected pages; no QA judgment narrative is copied.
def scan(x):
 if isinstance(x,dict):
  for k,v in x.items():
   if isinstance(v,str) and v.startswith('/assets/'):
    p=C/'app/public'/v.lstrip('/')
    if p.is_file() and str(p) not in {a['path'] for a in images}:images.append(pin(p))
   else:scan(v)
 elif isinstance(x,list):
  for v in x:scan(v)
scan(model)
supp={'role':'Content-only current native6 technical source partners; no new scientific decision and no expected result','status':'ai_candidate','humanApproval':False,'reviewBoundary':['Read only your assigned native round and the shared content partners before your own FIRST; do not read the other round or any new peer result.','Whole canonical objects are exact current authored inputs, including existing source annotations. Their references to review histories are not instructions to open those judgments before FIRST.','Existing P evidence levels are retained metadata. They do not instruct a new D decision or establish new performance.','Original PDFs/official HTML retain third-party rights. Extraction and historical origin JSON are derived representations, not substitutes for original course/choice/column boundaries.','Selected native pages contain their existing task/model/performance boundaries. Supplied or synthetic data do not establish actual experiment execution.'],'currentCanonical':pin(canon),'wholeCurrentP439Source':pin(pp),'scope':{'orderedNativeGoalIds':ids,'baseCurricularAtomicDenominator':439},'wholeSixCurrentGoalsAndProfiles':[body(i) for i in ids],'wholeTransitivePrerequisiteContext':[body(i) for i in gs if i in closure-set(ids)],'actualModelImagePins':images,'sourcePartners':{'HE':{'extractionPin':pin(hepath),'sourceDocument':he['sourceDocument'],'wholeRelevantPassages':hep,'wholeRelevantSourceGoals':[g for g in he['sourceGoals'] if g['passageId'] in hepid],'originalDocuments':heorig,'pageNavigationOnly':{'Q1.1':38,'Q1.4':40,'Q2.3':43,'Q3.3':47,'Q4.2':50},'navigationBoundary':'Page values are existing extraction navigation, not a newly asserted physical/printed page equivalence; inspect original PDF with surrounding course-choice instructions.'},'BY':{'extractionPin':pin(bypath),'sourceDocument':by['sourceDocument'],'wholeAnalytikPassage':byp,'wholeAnalytikSourceGoals':[g for g in by['sourceGoals'] if g['passageId'] in bypid],'actualOfficialWholeC12HTML':{'url':url,'fetchedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pin':pin(byhtml)},'boundary':'Whole current official increased-level C12 page; local extraction remains separately identified as derived. No generic national EDTA duty is inferred.'},'HB_SH_SN_originalsAndWholeRelevantPages':prim,'historicalHEOriginObjects':{'pin':pin(histpath),'role':'Historical derived authored origin only; not primary source nor current complete source credit','wholeObjects':[g for g in hist['goals'] if g['id'] in hids]}}}
suppin=save(S/'WHOLE-CONTENT.current-six-goals-Ps-teachers-primary-source-partners.json',supp)
# The selector permits only content and native round bindings; administrative CAS, old science votes and other rounds' results are deliberately absent.
common={'role':'Frozen clean technical native6 reviewer input; candidate-only independent D review','status':'ai_candidate','humanApproval':False,'capsule':str(C),'orderedGoalIds':ids,'curriculumAtomicDenominatorAtPreparation':439,'sharedWholeContentPartners':suppin,'stockPreparedManifest':pin(N/'batch-manifest.json'),'sharedNativeBundle':{name:pin(N/'bundle'/name) for name in ['book-model.json','book.html','book.html.render-manifest.json','book.pdf','book.pdf.render-manifest.json','manifest.json','review-input.json','review-input.jsonl','prompt.md','criteria.md']},'boundaries':supp['reviewBoundary'],'rounds':{}}
for letter in ['a','b']:
 d=N/('round-'+letter);ca=json.load(open(d/'description-review-campaign.json'));files=[pin(p) for p in sorted(d.rglob('*')) if p.is_file()];common['rounds'][letter]={'directory':str(d),'campaignId':ca['campaignId'],'roundId':ca['roundId'],'independenceGroupId':ca['independenceGroupId'],'blindToOtherReviews':ca['blindToOtherReviews'],'batchBindings':ca['batches'],'files':files,'intendedOutputDirectory':str(d/'results')}
sp=save(O/'SELECTOR.clean-current-native6-reviewer-inputs.sealed.json',common)
# Self-excluding immutable byte seal of clean generated/source inputs; no expected decision embedded.
files=sorted({p for root in [N,S] for p in root.rglob('*') if p.is_file()}|{pathlib.Path(sp['path'])})
seal=O/'SEAL.clean-native6-reviewer-inputs.sha256';seal.write_text(''.join(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p}\n" for p in files));seal.chmod(0o444)
print(json.dumps({'selector':sp,'sourcePartners':suppin,'seal':pin(seal),'transitiveContextGoals':len(closure-set(ids)),'originalPDFCopies':len(heorig)+len(prim),'imagePins':len(images),'rounds':{k:{a:b for a,b in v.items() if a in ['campaignId','roundId','independenceGroupId','batchBindings','directory','intendedOutputDirectory']} for k,v in common['rounds'].items()}},ensure_ascii=False))
