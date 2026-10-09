import pathlib,json,hashlib,copy,datetime,jsonschema
ROOT=pathlib.Path.cwd();B=pathlib.Path(__file__).resolve().parent.relative_to(ROOT);S=B.parent
STAMP=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(pathlib.Path(p).read_text())
def bind(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,v):
 p=B/n;p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return p
freeze=read(S/'whole23-science-author.first.freeze.json')
for x in freeze['inputs']+freeze['outputs']:assert bind(x['path'])==x,'Original science first seal changed'
materials=read(S/'twenty-three-whole46-bilingual-cases-and-P.author-candidate.json');old=copy.deepcopy(materials)
canon=read(S/'input/current-canonical479.original.snapshot.json');oldCanon=copy.deepcopy(canon)
gid='0eddd781-90aa-5120-a24f-c7e38327162c'
descDe='Die lernende Person kann den Beitrag alternativen Spleißens zur Proteinvielfalt bei Eukaryoten erklären und die Bedeutung dieser Vielfalt für Selektionsprozesse in der Evolution einordnen, wenn relevante Unterschiede erblich sind und den Fortpflanzungserfolg beeinflussen.'
descEn='The learner can explain the contribution of alternative splicing to protein diversity in eukaryotes and contextualize the significance of this diversity for evolutionary selection processes when relevant differences are heritable and affect reproductive success.'
for g in canon['goals']:
 if g['id']==gid:g['description']=descDe;g['descriptionEn']=descEn
materials['entries'][5]['wholeCurrentGoal']['description']=descDe;materials['entries'][5]['wholeCurrentGoal']['descriptionEn']=descEn
bad='Beide Gameten einer dihybriden Person haben AB/Ab/aB/ab mit je 1/4 Wahrscheinlichkeit.'
good='Jeder der beiden dihybriden Elternteile bildet die vier möglichen Gametentypen AB, Ab, aB und ab mit jeweils 1/4 Wahrscheinlichkeit.'
e=materials['entries'][17];assert bad in e['newAuthoredWholeCases'][0]['materialDe'];e['newAuthoredWholeCases'][0]['materialDe']=e['newAuthoredWholeCases'][0]['materialDe'].replace(bad,good)
assert bad in e['wholeProfile']['applicationCaseBriefs'][0]['taskDemandDe'];e['wholeProfile']['applicationCaseBriefs'][0]['taskDemandDe']=e['wholeProfile']['applicationCaseBriefs'][0]['taskDemandDe'].replace(bad,good)
# Reference each rubric honestly to the whole evidence pair. No assertion that all
# criteria appear in every individual task; no extra task/count requirement.
pairRows=[]
for i,e in enumerate(materials['entries']):
 if 'newAuthoredWholeCases' not in e:
  assert e['exactHistoricalWholeCases']==old['entries'][i]['exactHistoricalWholeCases'];continue
 pairPointer='/entries/'+str(i)+'/newAuthoredWholeCases'
 cases=e['newAuthoredWholeCases'];ids=[c['caseId'] for c in cases];assert len(cases)==2
 row={'goalId':e['goalId'],'caseIds':ids,'wholePairPointer':pairPointer,'coverageScope':'whole two-case pair with supplied fresh transfers; author proposal, not learner evidence','assessmentRuleDe':'Die Kriterien sind eine Referenz für das ganze Evidenzpaar. In einem einzelnen Fall wird nur die tatsächlich gestellte und gezeigte Teilperformanz bewertet. Die Verweise behaupten nicht, dass jedes Kriterium in jedem Fall oder jeder Antwort vorkommt. Kein zusätzlicher Aufgabenbedarf entsteht allein aus dieser Referenz.','assessmentRuleEn':'Criteria reference the complete evidence pair. Score only the subperformance actually requested and shown in an individual case. References do not assert that each criterion occurs in every case or answer. This reference creates no additional task requirement.','criteria':copy.deepcopy(cases[0]['rubric']),'actualLearnerEvidence':False}
 for r in row['criteria']:r['evidenceLocations']=[pairPointer];r['evidenceScope']='whole_evidence_pair_reference'
 pairRows.append(row)
 for c in cases:
  c['rubricScope']='whole_evidence_pair_reference_not_individual_case_score'
  c['rubricReference']={'path':str(B/'whole21-pair-level-rubric-references.author-candidate.json'),'goalId':e['goalId'],'wholePairPointer':pairPointer,'assessmentRuleDe':row['assessmentRuleDe'],'assessmentRuleEn':row['assessmentRuleEn']}
  for r in c['rubric']:r['evidenceLocations']=[pairPointer];r['evidenceScope']='whole_evidence_pair_reference'
materials['role']='Whole23 author successor: exactly1 DE/EN goal-fidelity remedy, exactly1 DE case/brief remedy, explicit pair-level rubric references; historical4 wholecases exact'
materials['createdAt']=STAMP
mp=write('twenty-three-whole46-bilingual-cases-and-P.v2.author-candidate.json',materials)
cp=write('candidate/current-canonical479-one-DEEN-splicing-fidelity.candidate.json',canon)
write('whole21-pair-level-rubric-references.author-candidate.json',{'schemaVersion':1,'role':'Honest author pair-level references; no individual-task all-facet claim','entries':pairRows,'additionalTaskQuota':False,'actualLearnerEvidence':False,'humanApproval':False})
# Exact ordinary candidate set. Only one P-body's German case-brief sentence changes.
cand=read(S/'twenty-three-whole-positive-profile-candidate-set.author.json');cand['reviewId']='biologie-molecular-genetics-twenty-three-whole-author-remediation-v2';cand['reviewedAt']=STAMP
for i,r in enumerate(cand['goals']):r['profile']=copy.deepcopy(materials['entries'][i]['wholeProfile'])
sp=write('twenty-three-whole-positive-profile-candidate-set.v2.author.json',cand)
kinds=read(S/'input/current-kinds394-landscape-path-only.candidate.json');kinds['sourceLandscapePath']=str(cp);kp=write('candidate/kinds394-source-path-only.candidate.json',kinds)
conf=read(S/'twenty-three-whole-positive.author-candidate.config.json');conf.update({'reviewId':cand['reviewId'],'landscapePath':str(cp),'semanticKindLedgerPath':str(kp),'reviewPath':str(B/'twenty-three-whole-positive.v2.author-candidate.review.jsonl')});conf['scope']['label']='Whole23 author successor with exact one DEEN fidelity correction; independent current native/source/AM pending'
write('twenty-three-whole-positive.v2.author-candidate.config.json',conf)
schema=read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json');v=jsonschema.Draft202012Validator({'$ref':'#/$defs/profile','$defs':schema['$defs']})
for r in cand['goals']:assert not list(v.iter_errors(r['profile']))
# Whole source rows/partners are historical immutable inputs, with one explicitly
# declared future target-body delta. No source/mapping/extraction writes.
originalFrame=read(S/'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json');sourceRow=originalFrame['wholeOriginalSourceDutyRows'][12]
assert sourceRow['rowId']=='source-duty-0110'
sourcePrimary=read(S/'input/actual-primary-whole-context-reading.bindings.json')['officialBavariaWholeContexts']['records'][0]
assert sourcePrimary['key']=='BY12-EA';assert 'Proteinvielfalt' in pathlib.Path(sourcePrimary['fullTextPath']).read_text()
write('splicing-one-goal-source-primary-and-required-evidence-delta.author.json',{'schemaVersion':1,'goalId':gid,'originalSourceDuty':sourceRow,'actualWholePrimaryBinding':bind(sourcePrimary['htmlPath']),'actualWholePrimaryTextBinding':bind(sourcePrimary['fullTextPath']),'originalSourceTextUnchanged':True,'authorMechanism':'Alternative splicing can contribute to protein diversity. Relevant heritable variation and differential reproduction enable selection; somatic isoform choice alone proves neither inheritance nor selection. It is not a universal necessity for selection.','targetGoalBefore':old['entries'][5]['wholeCurrentGoal'],'targetGoalCandidate':materials['entries'][5]['wholeCurrentGoal'],'sourceDuties38AndWholePartners44PreservedAsOriginalInputs':True,'requiredNewIndependentGates':['targeted DE/EN/source fidelity','targeted A atomicity after one true semantic-fidelity delta','targeted M memory classification after one true semantic-fidelity delta','current native D/P and exact unchanged PNG6 target-context V binding'],'allOther393A_MDecisionBodiesUnchanged':True,'wholeSourceApproval':False,'humanApproval':False})
changedGoals=[]
for i,(before,after) in enumerate(zip(oldCanon['goals'],canon['goals'])):
 if before!=after:
  diffs=[k for k in before if before[k]!=after[k]];assert before['id']==gid and diffs==['description','descriptionEn'];changedGoals.append({'goalId':gid,'jsonPointer':'/goals/'+str(i),'changedFields':diffs})
assert len(changedGoals)==1 and len(canon['goals'])==479
changedProfiles=[i+1 for i in range(23) if old['entries'][i]['wholeProfile']!=materials['entries'][i]['wholeProfile']];assert changedProfiles==[18]
for i,e in enumerate(materials['entries']):
 for j,c in enumerate(e.get('newAuthoredWholeCases',[])):
  o=old['entries'][i]['newAuthoredWholeCases'][j]
  diff=[k for k in o if o[k]!=c[k]]
  assert set(diff)<=({'rubric','materialDe'} if (i,j)==(17,0) else {'rubric'})
  if i not in (5,):assert old['entries'][i]['wholeCurrentGoal']==e['wholeCurrentGoal']
write('exact-author-v2-deltas-and-unmodified-whole-history.actual.json',{'schemaVersion':1,'canonicalGoals':479,'curricularAtomic':394,'goalBodyDeltas':changedGoals,'allOther478GoalObjectsExact':True,'other393AtomicDEENExact':True,'changedWholeProfileOrdinals':changedProfiles,'other22WholeProfilesExact':True,'changedCaseNarrativeFields':[{'goalId':materials['entries'][17]['goalId'],'caseIndex':0,'field':'materialDe'}],'allOtherCaseNarrativeDEENWorkCalculationsExact':True,'rubricOnlyAdministrativeHonestyDeltas':42,'historicalWholeCases4Exact':True,'all38OriginalSourceDutiesAnd44WholePartnersRemainOriginalInputs':True,'allRequiresAndContainsAndProvenanceAndSemanticKindsExact':True,'originalScienceFirstSealInputsExact':len(freeze['inputs']),'originalScienceFirstSealOutputsExact':len(freeze['outputs']),'authorClaimsOnly':True,'strictGain':0,'activeWrites':False})
print(json.dumps({'normalProfiles':23,'goalDEENDelta':1,'caseNarrativeDelta':1,'profileBriefDelta':1,'explicitHonestPairRubricReferences':42,'historicalWholeCasesExact':4,'schemaErrors':0,'strictGain':0}))
