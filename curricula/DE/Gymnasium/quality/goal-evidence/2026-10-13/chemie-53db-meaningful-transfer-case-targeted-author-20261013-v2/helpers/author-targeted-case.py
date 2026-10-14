import copy,hashlib,json,pathlib
from datetime import datetime,timezone
E=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13')
T=E/'chemie-53db-meaningful-transfer-case-targeted-author-20261013-v2'
F=E/'chemie-current406-final-resource-P7-native8-technical-author-20261013-v1'
P=E/'chemie-current403-four-profile-current-input-author-successor-20261013-v1'
M=E/'chemie-current403-four-P-normal-input-materialization-author-20261013-v1'
B=E/'chemie-current406-native8-fresh-independent-b-20261013-v1'
ID='53db04a0-ea76-5810-9526-c8639100e497';CASE='53db04a0-case-2'
for d in ['candidate','checks','inputs']:(T/d).mkdir(parents=True,exist_ok=True)
def read(p):return json.loads(pathlib.Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def bind(p):p=pathlib.Path(p);return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def cellsha(x):return 'sha256:'+hashlib.sha256((json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()).hexdigest()
def write(p,x):pathlib.Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
neutral=read(F/'NEUTRAL.current406-P7-native8.exact-input-selector.json')
for k in ['candidateLandscape','P4ExactRetained','P3','P4FullEightCases','assetSourceBindings']:
    x=neutral[k];assert sha(x['path'])==x['sha256']
casesPath=pathlib.Path(neutral['P4FullEightCases']['path'])
profilesPath=P/'positive/four-full-profiles.DEEN.author.json'
candidatesPath=M/'positive/stock-candidate-set.current-reviewed-content.author.json'
cases=read(casesPath);profiles=read(profilesPath);candidates=read(candidatesPath)
records=[json.loads(l) for l in pathlib.Path(neutral['P4ExactRetained']['path']).read_text().splitlines() if l.strip()]
record=next(x for x in records if x['goalId']==ID)
beforeCase=next(x for x in cases['cases'] if x['caseId']==CASE)
beforeProfile=next(x for x in profiles['profiles'] if x['goalId']==ID)
beforeSpec=next(x for x in candidates['goals'] if x['goalId']==ID)
assert beforeProfile['profile']==record['profile']==beforeSpec['profile']
finding=read(B/'NATIVE8.actual-inspection-and-scientific-findings.json')['scientificFinding']
assert finding['goalId']==ID and finding['caseId']==CASE and finding['resolved'] is False
afterCase=copy.deepcopy(beforeCase)
extraDe='Die Papierroute ist bei X = R–CH(OH)–Ar nach dem ersten Ringangriff und seiner Rearomatisierung unterbrochen. Ein fehlerhafter Routenentwurf nennt X die fertige Leukoverbindung und will danach nur die Oxidationsstufe der Leukoverbindung R–CH(Ar)₂ verwenden, um [R–C(Ar)₂]⁺ zu erhalten. Zu prüfen ist nur diese angegebene Route; andere mögliche Oxidationsprodukte von X sind nicht gefragt.'
extraEn='The paper route is interrupted at X = R–CH(OH)–Ar after the first arene attack and its rearomatization. An incorrect route draft calls X the completed leuco compound and then proposes only the oxidation step of the leuco compound R–CH(Ar)₂ to obtain [R–C(Ar)₂]⁺. Assess only this stated route; other possible oxidation products of X are not requested.'
clauseDe='Prüfe den Routenentwurf für X: Begründe anhand der gebundenen Arylreste und der OH-Gruppe, ob X bereits die Leukoverbindung ist. Erkläre, ob die Oxidationshalbreaktion dieser Leukoverbindung allein die noch fehlende Aryl-C–C-Bindung erzeugen kann. Benenne und begründe die noch nötigen Stufen bis zum vorgesehenen Farbstoffkation und korrigiere ihre Reihenfolge.'
clauseEn='Assess the route draft for X: use the attached aryl groups and the OH group to justify whether X is already the leuco compound. Explain whether that leuco compound oxidation half-equation alone can create the still missing aryl C–C bond. Identify and justify the remaining stages up to the intended dye cation and correct their order.'
answerDe='X trägt am zentralen C nur R und einen Ar-Rest sowie H und OH; die neutrale Leukoverbindung R–CH(Ar)₂ trägt dagegen drei Arylreste und keine OH-Gruppe. X ist daher die Zwischenstufe nach der ersten Addition und noch nicht die fertige Leukoverbindung. Die angegebene Leuko-Oxidationshalbreaktion verändert die zentrale H-Besetzung und die Ladungs-/Elektronenbilanz; sie fügt keinen Ar-Rest hinzu und kann die fehlende Aryl-C–C-Bindung nicht erzeugen. Im vorgegebenen Routenmodell fehlen zunächst OH-Protonierung und H₂O-Abgabe zu R–CH(Ar)⁺, dann der zweite Ar–H-Ringangriff und die Rearomatisierung durch Ring-H⁺-Abgabe zu R–CH(Ar)₂. Erst danach passt die Oxidation zu [R–C(Ar)₂]⁺ mit H⁺ + 2e⁻ (Ladung 0 = +1 +1 −2). Eine unbekannte alternative Oxidation von X wird damit nicht vorhergesagt.'
answerEn='At its central C, X has only R and one Ar residue together with H and OH; the neutral leuco compound R–CH(Ar)₂ instead has three aryl residues and no OH group. X is therefore the intermediate after the first addition, not the completed leuco compound. The stated leuco oxidation half-equation changes the central H occupancy and the charge/electron balance; it adds no Ar residue and cannot create the missing aryl C–C bond. In the supplied route model, OH protonation and loss of H₂O to give R–CH(Ar)⁺ are still needed, followed by the second Ar–H arene attack and rearomatization by ring-H⁺ loss to R–CH(Ar)₂. Only then does oxidation to [R–C(Ar)₂]⁺ with H⁺ + 2e⁻ apply (charge 0 = +1 +1 −2). This makes no prediction about an unknown alternative oxidation of X.'
afterCase['dataDe'] += ' '+extraDe
afterCase['dataEn'] += ' '+extraEn
afterCase['taskDe'] += '\n2. '+clauseDe
afterCase['taskEn'] += '\n2. '+clauseEn
afterCase['modelAnswerDe'] += '\n2. '+answerDe
afterCase['modelAnswerEn'] += '\n2. '+answerEn
spanDe={'start':afterCase['taskDe'].index(clauseDe),'end':afterCase['taskDe'].index(clauseDe)+len(clauseDe)}
spanEn={'start':afterCase['taskEn'].index(clauseEn),'end':afterCase['taskEn'].index(clauseEn)+len(clauseEn)}
criterion={
    'criterionId':'53db04a0-case-2-r2','expectationIds':['e2'],
    'taskClauseDe':clauseDe,'taskClauseEn':clauseEn,'criterionDe':answerDe,'criterionEn':answerEn,
    'maximumPoints':2,
    'partialCreditDe':'2 Punkte: begründet mit zwei statt drei Arylresten und verbleibender OH-Gruppe die falsche Leuko-Zuordnung, erklärt die fehlende Bindungsbildung der angegebenen Oxidation und ordnet die noch nötigen Kondensationsschritte vor die Leuko-Oxidation. 1 Punkt: mindestens eine dieser struktur- oder routenbezogenen Folgerungen ist richtig begründet, der übrige Nachweis bleibt unvollständig. 0 Punkte: nur Behauptung, Restnamenwechsel oder keine richtige Begründung. Keine Ausführungspunkte.',
    'partialCreditEn':'2 points: uses two rather than three aryl residues and the remaining OH group to justify the incorrect leuco assignment, explains that the stated oxidation cannot form the missing bond, and places the remaining condensation stages before leuco oxidation. 1 point: at least one of these structure- or route-based inferences is correctly justified but the remaining evidence is incomplete. 0 points: unsupported assertion, residue-name change or no correct reasoning. No execution credit.',
    'creditBasis':'written-explicit-task','taskSpanDe':spanDe,'taskSpanEn':spanEn
}
afterCase['rubric'].append(criterion)
afterCase['maximumPoints']=sum(x['maximumPoints'] for x in afterCase['rubric'])
afterProfile=copy.deepcopy(beforeProfile)
brief=next(x for x in afterProfile['profile']['applicationCaseBriefs'] if x['id']==CASE)
for lang in ['De','En']:
    brief['taskDemand'+lang]=afterCase['data'+lang]+'\n'+afterCase['task'+lang]
    brief['expectedPerformance'+lang]=afterCase['modelAnswer'+lang]
afterSpec=copy.deepcopy(beforeSpec)
afterSpec['profile']=copy.deepcopy(afterProfile['profile'])
afterSpec['reason']='Bounded unreviewed author correction for the fresh native53db Case2 transfer finding: the supplied first-addition intermediate and an incorrect proposed route now require justified bond/structure and remaining-stage inference. The full original synthesis goal, both equations, expectation definitions and Case1 remain unchanged. Targeted independent followups are required; this carrier gives no current P/D acceptance. Different evidence pieces may be integrated in one rich task; there is no extra-task quota.'
ops=[
    ('whole-case2',casesPath,{'array':'cases','field':'caseId','value':CASE},beforeCase,afterCase),
    ('whole-53db-profile',profilesPath,{'array':'profiles','field':'goalId','value':ID},beforeProfile,afterProfile),
    ('whole-53db-candidate-spec',candidatesPath,{'array':'goals','field':'goalId','value':ID},beforeSpec,afterSpec)
]
cas={'schemaVersion':1,'kind':'Exact bounded author whole-cell CAS; no acceptance','goalId':ID,'caseId':CASE,'findingBinding':bind(B/'NATIVE8.actual-inspection-and-scientific-findings.json'),'scientificFinding':finding,'operations':[],'currentPApproval':False,'currentDApproval':False,'humanApproval':False,'activeWrites':False}
for name,path,selector,before,after in ops:
    cas['operations'].append({'operationId':name,'baseBinding':bind(path),'selector':selector,'CAS':{'serialization':'UTF-8 JSON sorted keys compact plus one LF','wholeBeforeCellSHA256':cellsha(before),'wholeAfterCellSHA256':cellsha(after)},'beforeWholeCell':before,'afterWholeCell':after})
write(T/'CAS.one-whole-case-profile-and-candidate-spec.author.json',cas)
write(T/'candidate/CASE2.complete-targeted-after.DEEN.author.json',afterCase)
write(T/'candidate/PROFILE.complete53db-targeted-after.DEEN.author.json',afterProfile)
afterCases=copy.deepcopy(cases)
afterCases['cases'][next(i for i,c in enumerate(afterCases['cases']) if c['caseId']==CASE)]=afterCase
afterCases['allFullOriginalCaseObjectsUnchanged']=False
afterCases['onlyChangedCaseId']=CASE
afterCases['authorCorrectionOnly']=True
afterCases['newAcceptance']=False
write(T/'candidate/eight-full-P4-cases.only53dbCase2-after.author.json',afterCases)
afterProfiles=copy.deepcopy(profiles)
afterProfiles['profiles'][next(i for i,p in enumerate(afterProfiles['profiles']) if p['goalId']==ID)]=afterProfile
afterProfiles['scientificRevalidationPending']=True
write(T/'candidate/four-full-P4-profiles.only53dbCase2-after.author.json',afterProfiles)
afterSet=copy.deepcopy(candidates)
afterSet['goals'][next(i for i,p in enumerate(afterSet['goals']) if p['goalId']==ID)]=afterSpec
afterSet['reviewId']='chemie-53db-meaningful-transfer-case-targeted-author-20261013-v2'
afterSet['reviewedAt']=datetime.now(timezone.utc).isoformat()
afterSet['reviewer']='Codex bounded author design only; no current P or D acceptance'
write(T/'candidate/CANDIDATESET.P4-only53db-case2.unmaterialized.author.json',afterSet)
goal=next(g for g in read(neutral['candidateLandscape']['path'])['goals'] if g['id']==ID)
write(T/'inputs/exact-current406-whole53db-goal.json',goal)
write(T/'inputs/exact-current406-original53db-P4-record.json',record)
asset=next(x for x in read(neutral['assetSourceBindings']['path'])['assets'] if '/'+ID+'/' in x['url'])
refs=[F/'NEUTRAL.current406-P7-native8.exact-input-selector.json',B/'NATIVE8.actual-inspection-and-scientific-findings.json',B/'results/chemie-current406-final-resource-P7-native8-20261013-v1-first-pass-b.batch-001.records.jsonl',casesPath,profilesPath,candidatesPath,neutral['P4ExactRetained']['path'],neutral['P3']['path'],neutral['candidateLandscape']['path'],neutral['candidateSemanticLedger']['path'],neutral['candidateQA']['path'],asset['source']['path'],asset['copy']['path'],'contracts/goal-evidence/v2/goal-evidence-profile.schema.json','app/scripts/positiveGoalEvidenceProfileModel.ts']
write(T/'INPUTS.exact-existing-finding-case-profile-goal-image.bindings.json',{'bindings':[bind(p) for p in refs],'original53dbImageBinding':asset,'newScientificApproval':False})
write(T/'RATIONALE.changed-condition-and-required-inference.author.json',{
    'goalId':ID,'caseId':CASE,'previousProblem':'Renaming Ph as para-methylphenyl did not require a changed chemical inference.',
    'changedCondition':'An independently given paper route is stopped at its first-addition/rearomatized intermediate X=R–CH(OH)–Ar; the draft incorrectly assigns X to the finished leuco stage and proposes only leuco oxidation afterward.',
    'requiredInference':'Two versus three aryl attachments and an OH group determine the stage. The supplied leuco oxidation equation cannot add an aryl residue or create the missing C–C bond. The learner must justify and order the remaining already-known condensation stages before oxidation.',
    'newChemistryRequired':False,'unfamiliarOxidationProductPredicted':False,
    'primaryVerificationRequiredForThisRepresentationChange':False,
    'scientificUncertainty':'The change uses only the explicit existing mechanism and atom/bond accounting. It makes no claim about stability/isolation of X, another oxidation product, substituent effects, rates or a real experiment. Its assessment fitness remains pending targeted independent review.',
    'fullRouteStillExplicitlyRequestedInTask1':True,'originalModelAnswerAndRubric1RetainedExactly':True,
    'expectationDefinitionsUnchanged':True,'coverageContractUnchanged':True,
    'oneRichCaseCanSupplyDifferentReasoningEvidence':True,'newTaskQuotaImposed':False,
    'currentPApproval':False,'currentDApproval':False,'humanApproval':False,'activeWrites':False
})
print('Bounded after-case plus exact3 whole-cell CAS written; original sources/goal/image untouched.')
