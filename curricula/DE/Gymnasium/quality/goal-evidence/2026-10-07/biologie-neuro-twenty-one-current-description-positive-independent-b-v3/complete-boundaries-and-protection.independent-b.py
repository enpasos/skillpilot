# Apache-2.0. Exact frozen inputs, bounded original reads, preserved strict floors.
import json,pathlib,hashlib,datetime,os,copy
R=pathlib.Path.cwd();A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-twenty-one-current-continuation-author-v3/stage-02-current-twenty-one-native';O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-twenty-one-current-description-positive-independent-b-v3';B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06';now=datetime.datetime.now(datetime.timezone.utc).isoformat();read=lambda p:json.loads(pathlib.Path(p).read_text());sha=lambda p:'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest();rows=lambda p:[json.loads(x) for x in pathlib.Path(p).read_text().splitlines() if x];bind=lambda p:{'path':str(pathlib.Path(p).relative_to(R)) if pathlib.Path(p).is_relative_to(R) else str(p),'sha256':sha(p),'bytes':pathlib.Path(p).stat().st_size};objsha=lambda x:'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(p,x):
 q=pathlib.Path(str(p)+'.tmp');q.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');os.replace(q,p)
def diff(a,b,path=''):
 if type(a)!=type(b):return [{'path':path,'before':a,'after':b}]
 if isinstance(a,dict):return sum((diff(a.get(k),b.get(k),path+'/'+k) for k in sorted(a.keys()|b.keys())),[])
 if isinstance(a,list):
  if len(a)!=len(b):return [{'path':path,'before':a,'after':b}]
  return sum((diff(x,y,path+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))),[])
 return [] if a==b else [{'path':path,'before':a,'after':b}]
raw=read(A/'final-current21-whole-native-source-context-material-review-inputs.author.raw.json');p=rows(A/'positive-evidence.current21.actual.author-candidate.jsonl');oldp={r['goalId']:r for r in rows(B/'biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2/positive-evidence.author-v2.actual.candidate.jsonl')};stage1={r['goalId']:r for r in rows(A.parent/'stage-01-three-model-materials/positive-evidence.three-models.actual.author-candidate.jsonl')};pr={r['goalId']:r for r in p};continuity=[]
for r in raw['wholeCurrent21CandidateNativeRows']:
 g=r['goalId']
 if r['priorThirteenContinuation']:assert pr[g]['profile']==oldp[g]['profile'];continuity.append({'goalId':g,'wholeProfileBodyExactPriorSourcePV2':True,'bothWholeCaseBriefsExact':True,'currentFingerprintsSeparatelyRecomputed':True})
for g in stage1:assert pr[g]['profile']==stage1[g]['profile']
assert len(continuity)==13 and len(stage1)==3
whole347=next(r for r in raw['wholeCurrent21CandidateNativeRows'] if r['goalId'].startswith('3471'));g347=whole347['goalId'];delta347=diff(whole347['wholeCurrentGoal'],whole347['wholeCandidateGoal']);assert delta347 and all(x['path'].startswith('/extendedData') for x in delta347);assert all(whole347['wholeCurrentGoal'][k]==whole347['wholeCandidateGoal'][k] for k in ['title','titleEn','description','descriptionEn']);assert pr[g347]['profile']==oldp[g347]['profile']
write(O/'independent-b.profile-material-continuity-and347.actual.json',{'schemaVersion':1,'createdAtUTC':now,'actual42MaterialsEqualWholeRawInputsAndNativeProfiles':True,'unchangedThirteenWholeProfilesAnd26CaseBriefs':continuity,'unchangedThreeStage01WholeProfilesAnd6CaseBriefs':list(stage1),'onlyFiveFurtherSourceOperatorFamiliesChanged':['1b38144f-cdbd-5dfe-a792-94669bdc31d8','e3fb5f1d-e277-5e28-8883-45821b972607','04d770b3-ba5e-5438-88ca-110cbaeba62c','080b10c7-f308-57ff-b067-3bd189e37fea','c05e217f-33fc-5a11-ba75-1397fad3ae0a'],'general347WholeObjectExact':False,'general347DEENAndPriorInnerPBodyExact':True,'general347ActualMetadataDeltas':delta347,'priorSourcePAuthorInput':bind(B/'biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2/positive-evidence.author-v2.actual.candidate.jsonl'),'stage01AuthorInput':bind(A.parent/'stage-01-three-model-materials/positive-evidence.three-models.actual.author-candidate.jsonl'),'notHistoricalScientificVerdictAdoption':True,'activeWrites':False,'strictNetGain':0,'humanApproval':False})
w=read(A/'all21-selected-actual-frozen-source-witness-effective-file-bindings.author.json');cache={};checked=[]
for rec in w['records']:
 effective={}
 for b in rec['exactEffectiveBindings']:
  f=R/b['actualFrozenEffectivePath'];assert bind(f)==b['binding'];effective[b['field']]=f
  if str(f) not in cache:cache[str(f)]=read(f)
 ex=cache[str(effective['sourceExtractionPath'])];actual=rec['actualWitness']; sg=next(x for x in ex['sourceGoals'] if x['id']==actual['sourceGoalId']);assert sg==rec['wholeActualBoundSourceGoal'];assert actual['mappedTargetGoalId']==rec['goalId'] and actual['coverage']=='direct'
 mp=cache[str(effective['mappingPath'])];edges=[x for x in mp['mappings'] if x.get('legacyGoalId',x.get('sourceGoalId'))==sg['id'] and x.get('canonicalGoalId',x.get('targetGoalId'))==rec['goalId']];assert edges
 checked.append({'goalId':rec['goalId'],'scopeKey':rec['scopeKey'],'actualDirectWitness':actual,'wholeEffectiveSourceGoal':sg,'effectiveBindings':rec['exactEffectiveBindings'],'matchingActualMappingEdges':edges,'wholeSourceApproval':False})
assert len(checked)==51
primary=B/'biologie-neuro-eight-missing-primary-scope-remediation-author-v1/primary';
from bs4 import BeautifulSoup
originalSections=[]
for file,anchor,level in [('BY13-EA.current-official.html','313324','erhöhtes Anforderungsniveau'),('BY13-GA.current-official.html','314384','grundlegendes Anforderungsniveau')]:
 soup=BeautifulSoup((primary/file).read_text(),'html.parser');section=soup.select_one('[id="'+anchor+'"] + .content');assert section
 for d in section.select('dialog'):d.decompose()
 groups=[]
 for group in section.select('.thema_absch'):
  ul=group.find('ul',recursive=False)
  if ul:groups.append([' '.join(x.stripped_strings) for x in ul.find_all('li',recursive=False)])
 originalSections.append({'file':bind(primary/file),'originalYear':'13','originalCourseLabel':level,'validNumericIDSelector':'[id="'+anchor+'"] + .content','urlFragmentUnchanged':anchor,'actuallyReadWholeSelectedOriginalSection':True,'originalCompetencyAndContentGroups':groups,'GK_LKIsRepositoryProjectionLabel':True})
import fitz
doc=fitz.open(primary/'HE.current-official.pdf');he=doc[42].get_text();assert 'Q2.3' in he and 'Neurobiologie' in he and 'zelluläre Prozesse des Lernens' in he
write(O/'independent-b.actual-primary-reads-and51-native-source-bindings.receipt.json',{'schemaVersion':1,'createdAtUTC':now,'scope':'D/P operator/scope reading; no new whole-source adjudication','HE':{'officialPDF':bind(primary/'HE.current-official.pdf'),'actualRaster':bind(primary/'HE43.actual-raster.png'),'physicalPage':43,'printedPage':43,'actualRasterViewed':True,'actualTextRead':he,'generalLevel':'grundlegendes Niveau(Grundkurs undLeistungskurs)','LKLevel':'erhöhtes Niveau(Leistungskurs)','Q24OptionalDoesNotSupplyMandatoryQ23Optics':True,'authoredLKIndexNotOfficialBulletNumber':True},'BY':originalSections,'actual51DirectWitnessesVerifiedAgainstFrozenEffectiveExtractionAndMapping':checked,'exact51WitnessCount':51,'sourceAtlasCountryPublicationApproval':False,'wholeSourceGateApproval':False,'ownOldTH19HH21OrNWReviewNotReopened':True,'noCandidateSourceTextPromotedToOfficialQuote':True,'threeModelsOnlyDeclaredDidacticSpecialisations':['a46cafde-7359-5249-8754-19aaa3174ba4','c9a06264-cce2-54dd-9604-46dd5949f02e','4f631f78-e13a-58e5-9092-f4db0b8d377a'],'newFormalAtomicityOrMemoryDecision':False,'activeWrites':False,'strictNetGain':0,'humanApproval':False})
protect=read(B/'chemie-next25-current-native-description-independent-b-v2/independent-b.current-entry.protected-whole-goal-hashes.actual.json');checks=[]
for s in protect['subjects']:
 f=R/s['landscapePath'];canon=read(f);goals={g['id']:g for g in canon['goals']};actual={g:objsha(goals[g]) for g in s['orderedStrictGoalIds']};assert actual==s['protectedWholeObjectSha256ById'];checks.append({'subject':s['subject'],'currentWholeFile':bind(f),'currentNodeCount':len(canon['goals']),'protectedStrictCount':s['protectedStrictCount'],'orderedStrictGoalIds':s['orderedStrictGoalIds'],'protectedWholeObjectSha256ById':actual,'allSavedStrictWholeObjectsExact':True,'wholeCurrentFileEqualOwnOldEntry':sha(f)==s['wholeFileSha256'],'ownHistoricalWholeFileSha256Preserved':s['wholeFileSha256']})
write(O/'independent-b.current74-127-andMathPhys-protected-whole-objects.actual.json',{'schemaVersion':1,'createdAtUTC':now,'scope':'Current four whole Canon files hashed; all previously strict74Bio/127Chem/807Math/478Phys whole goal objects compared exactly. Root current Chem152 status separately reported; no central run by this reviewer.','subjects':checks,'ownPriorProtection':bind(B/'chemie-next25-current-native-description-independent-b-v2/independent-b.current-entry.protected-whole-goal-hashes.actual.json'),'savedStrictReport':protect['savedCentralReport'],'savedReportNotReexecuted':True,'currentChemWholeGlobalHashChangedBySeparateAuthorizedChemIntegration':next(x for x in checks if x['subject']=='chemie')['wholeCurrentFileEqualOwnOldEntry']==False,'activeWrites':False,'strictNetGain':0,'humanApproval':False})
holds=read(R/raw['allRetainedWholeHOLDs']['path']);assert holds['NWWholeOriginalUF1BacterialViralAndIF7Hold'] and holds['oldTH19HH21AndHH22HH29Preserved'] and holds['noNewStrictClosures']
resolved=[]
for h in holds['records']:
 g=h['goalId'];r=next(x for x in read(O/'independent-b.whole21-first-pass-scientific-observations.actual.json')['observations'] if x['goalId']==g);resolved.append({'goalId':g,'oldBoundedCandidateOperatorObligation':h['nextRequiredOperatorAndBoundary'],'newIndependentDDecision':r['DDecision'],'newIndependentPDecision':r['PDecision'],'actuallySuppliedLimitedMaterial':r['independentCaseScienceAndScope'],'oldWholeOriginalHOLDRemains':True,'formalIntegrationApproval':False,'A_M_VAndHumanStillSeparate':True})
write(O/'independent-b.bounded-operator-findings-and-residual-whole-HOLDs.actual.json',{'schemaVersion':1,'createdAtUTC':now,'input':bind(R/raw['allRetainedWholeHOLDs']['path']),'allOriginalWholeHOLDRecordsExactlyRetained':holds,'oldEightBoundedMaterialOperatorDebtAddressedByThisFirstPassOnly':resolved,'current080bPositiveTiergroupPerformanceStillMissing':True,'fullBYDepressionSymptomSocialTherapyStillOpen':True,'fullBYOpticsRhodopsinRetinalPhenomenaStillOpen':True,'threeDidacticModelsNotOfficialIndividualBulletsOrAtomicApproval':True,'NWWholeOriginalUF1BacterialViralAndIF7Hold':True,'oldTH19HH21AndHH22HH29Preserved':True,'all21ActualImagesMissing_VOpen':True,'A_MNoFormalApproval':True,'activeWrites':False,'strictNetGain':0,'humanApproval':False})
print('PASS51 effective witness rows/edges, exact13+3 profile continuity, whole347 metadata explicit, protected74/127/807/478 exact, residualHOLDs retained.')
