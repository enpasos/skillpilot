from pathlib import Path
import json,gzip,copy,hashlib,re
from urllib.request import urlopen,Request
R=Path('/home/enpasos/projects/skillpilot');O=R/Path('/tmp/economics-ops14-independent-own-path.txt').read_text().strip();D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-fourteen-finance-business-and-representation-KEEP-first-current597-author-b-v1';orig=D/'whole-fourteen-finance-business-representation-human-source-labels-and-learner-solutions.DRAFT-author-v2.json';H=D/'two-real-customer-and-improvement-separate-essential-author-successor-v3/actual-final-fourteen-ops-two-real-separated-core-clauses.AUTHOR-handoff.json';hd=json.loads(H.read_text());final=R/hd['wholeAfter']['path'];v2=json.loads(orig.read_text());v3=json.loads(final.read_text());I=D/'actual-current597-fourteen-whole-contracts-original-P28-ten-existing-materials-and64-scope-KEEP-first.AUTHOR-intake.json.gz';intake=json.loads(gzip.decompress(I.read_bytes()));by={r['goalId']:r for r in intake['whole14CurrentDEENContractsAndOriginalP28']}
def bound(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
deltas=[]
def dif(a,b,p=''):
 if isinstance(a,dict) and isinstance(b,dict):
  assert a.keys()==b.keys(),p
  for k in a:dif(a[k],b[k],p+'/'+k)
 elif isinstance(a,list) and isinstance(b,list):
  assert len(a)==len(b),p
  for n,(x,y) in enumerate(zip(a,b)):dif(x,y,p+'/'+str(n))
 elif a!=b:deltas.append({'field':p,'before':a,'after':b})
dif(v2,v3);assert len(deltas)==4 and {d['field'] for d in deltas}=={'/8/examData/taskContent','/8/examData/taskContentEn','/13/examData/taskContent','/13/examData/taskContentEn'}
for i in range(14):
 if i not in [8,13]:assert v2[i]==v3[i]
assert 'Kundenperspektive' in v3[8]['examData']['taskContent'];assert 'customer perspective' in v3[8]['examData']['taskContentEn'];assert 'Wirkungsgrenze' in v3[13]['examData']['taskContent'];assert 'concrete audience-specific improvement' in v3[13]['examData']['taskContentEn'];assert 'justify checking its effect' in v3[13]['examData']['taskContentEn']
oldWorks=O/'actual-fortytwo-own-ops-complete-submissions252-individual-rubric-decisions.originalV2.json';ww=json.loads(oldWorks.read_text());rows=copy.deepcopy(ww['works'])
for w in rows:
 if w['kind']=='own-entire-core-absence-counterwork' and w['materialId']==v3[13]['id']:
  assert w['raw']==20 and not w['publishedBoundaryCapApplies'];w['publishedBoundaryCapApplies']=True;w['final']=14;w['result']='FAIL';w['followupReason']='V3 now separates actual improvement from checking effect with a genuine limit; the complete no-effect-limit counterwork is capped while meaningful partial limits remain valid.'
originalTwo=O/'actual-two-whole-counterworks-correct-e905-current-contract-and-P-binding-only-independent-successor-v2.json';originalDoc=json.loads(originalTwo.read_text());replayed=[]
for w in originalDoc['works']:
 assert w['raw'] in [21,20];replayed.append({'originalWholeWork':w,'unchangedManualRaw':w['raw'],'newCapApplies':True,'newFinal':14,'result':'FAIL','rationale':'Actual whole required customer performance / actual specific presentation improvement completely absent throughout both original cases; new separated task rule applies.'})
# Fair followups genuinely omit one whole subtask while showing the required individual performance elsewhere.
fair=[]
for i in [8,13]:
 w=copy.deepcopy(next(w for w in rows if w['materialId']==v3[i]['id'] and w['kind']=='own-fair-whole-work'));w['kind']='independent-new-fair-whole-work-with-one-subtask-omitted'
 if i==8:
  w['sixActualAnswersAndIndividualRubricMarks'][1]['answer']='Diesen einzelnen Auftrag A2 lasse ich aus; tatsächliche Verantwortung wird in A1/A3 und B2 weiterhin bearbeitet.'
  w['sixActualAnswersAndIndividualRubricMarks'][0]['answer']+=' Ein realer Kundenvorteil ist verlässliche bezahlbare Reparatur; ich würde die behauptete Preisweitergabe ausdrücklich prüfen, statt sie aus den zwölf Prozent herzuleiten.'
  w['sixActualAnswersAndIndividualRubricMarks'][2]['answer']+=' Zu sozialer Verantwortung gehört für mich ein belastbarer Übergang für die Betroffenen, nicht bloß ein Versprechen.'
  j=1
 else:
  w['sixActualAnswersAndIndividualRubricMarks'][4]['answer']='Den einzelnen Auftrag B2 lasse ich aus. Die vollständigen anderen Karten, konkreten Verbesserungen und wirklichen Wirkungsgrenzen bearbeite ich in A1/A2/A3 und B1/B3.';j=4
 w['sixActualAnswersAndIndividualRubricMarks'][j]['awarded']=0;w['sixActualAnswersAndIndividualRubricMarks'][j]['individualManualCriterionAwards']=[0,0];w['sixActualAnswersAndIndividualRubricMarks'][j]['rationale']='Actual entire individual task omitted; no credit awarded here. This is not an entirely omitted application or core across the whole work.'
 w['raw']=sum(x['awarded'] for x in w['sixActualAnswersAndIndividualRubricMarks']);w['final']=w['raw'];w['publishedBoundaryCapApplies']=False;w['result']='PASS';assert w['raw']>=15;fair.append(w)
follow={'role':'independent narrow actual four-task-string followup; twelve whole KEEP reused, no new whole historical review','authorFinalHandoff':bound(H),'reviewedWhole14Final':bound(final),'actualFourDEENTextDeltas':deltas,'twelveOtherWholeBodiesExact':True,'allSolutionsRubricsNumbersRequiresCoverageTagsDraftExact':True,'wholeOriginalTwoCounterworksRegraded':replayed,'additionalOriginalWholeNoEffectLimitCounterRegrade':next(w for w in rows if w['materialId']==v3[13]['id'] and w['kind']=='own-entire-core-absence-counterwork'),'independentTwoNewFairWholeSubtaskOmissionWorks':fair,'ownFinalFortyTwoWorks':rows,'counts':{'oldTwoBypassesNow14':2,'additionalWholeLimitBypassNow14':1,'allOwnFinalWholeWorks':46,'ownActualTaskAnswerDecisions':276,'ownActualCriterionAwards':552,'oldFairWholePASS':14,'newFairWholeScores':[w['raw'] for w in fair]},'noPerfectionOrTaskQuota':True,'scopeReleaseOrHumanClaims':0,'activeWrites':0}
(O/'actual-four-string-remedy-fortysix-whole-works-independent-targeted-KEEP.json').write_text(json.dumps(follow,ensure_ascii=False,indent=2)+'\n')
# Preserve the original historical frame independently, and add current645 bindings rather than relabelling597 as live.
baseP=R/intake['immutableWholeCurrent597']['path'];assert hashlib.sha256(baseP.read_bytes()).hexdigest()==intake['immutableWholeCurrent597']['sha256'];base=json.loads(baseP.read_text());assert len(base['goals'])==597
baseCopy=O/'whole-current597-original-historical-native-schema-base.exact.json';baseCopy.write_bytes(baseP.read_bytes())
regp=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';regRaw=regp.read_bytes();reg=json.loads(regRaw);sub=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften');canp=R/sub['landscapePath'];activeRaw=canp.read_bytes();can=json.loads(activeRaw);semp=R/sub['semanticKindLedgerPath'];sem=json.loads(semp.read_bytes());assert len(can['goals'])==645
bg={g['id']:g for g in base['goals']};ag={g['id']:g for g in can['goals']};atomIds=[d['goalId'] for d in sem['decisions'] if d['semanticKind']=='curricularAtomic'];assert len(atomIds)==336
assert all(bg[g]==ag[g] for g in atomIds)
oldUnion={};oldReviewGuards=[]
for g in intake['whole43OriginalConfigAndProfileBindings']:
 p=R/g['reviewWholeBytes']['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==g['reviewWholeBytes']['sha256'];oldReviewGuards.append(bound(p))
 for line in p.read_text().splitlines():
  if line.strip():
   rec=json.loads(line);gid=rec['goalId'];assert gid not in oldUnion or oldUnion[gid]==rec;oldUnion[gid]=rec
activeUnion={};currentConfigs=[]
for cp in sub['positiveEvidenceConfigPaths']:
 p=R/cp;c=json.loads(p.read_text());rp=R/c['reviewPath'];currentConfigs.append({'config':bound(p),'wholeReview':bound(rp),'semanticPointer':c['semanticKindLedgerPath']});assert c['semanticKindLedgerPath']==sub['semanticKindLedgerPath']
 for line in rp.read_text().splitlines():
  if line.strip():
   rec=json.loads(line);gid=rec['goalId'];assert gid not in activeUnion or activeUnion[gid]==rec;activeUnion[gid]=rec
assert len(oldUnion)==len(activeUnion)==336 and oldUnion==activeUnion
caseCount=sum(len(r['positiveEvidenceProfile']['applicationCaseBriefs']) for r in activeUnion.values());assert caseCount==685
for g,r in by.items():assert ag[g]==r['wholeCurrentDEENGoal'] and activeUnion[g]==r['wholeOriginalPositiveRecord']
currentCanCopy=O/'whole-current645-native-schema-base-and-endguard.exact.json';currentCanCopy.write_bytes(activeRaw)
currentSemCopy=O/'whole-current645-v16-semantic-ledger-endguard.exact.json';currentSemCopy.write_bytes(semp.read_bytes())
for name,c in [('611-historical597',copy.deepcopy(base)),('659-current645',copy.deepcopy(can))]:
 ids={g['id'] for g in c['goals']};assert all(m['id'] not in ids for m in v3);c['goals']+=v3;(O/f'whole-{name}-plus-final-fourteen-DRAFT-only-independent-runtime-schema.inert.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
end={'role':'independent original historical597 binding preserved AND separate real current645/v16 binding guard; not full597-current equality','historical597':bound(baseCopy),'actualCurrent645':bound(currentCanCopy),'actualCurrentV16SEM':bound(currentSemCopy),'actualActiveRegistryAtRead':{'path':str(regp.relative_to(R)),'sha256':hashlib.sha256(regRaw).hexdigest()},'whole336HistoricalToActualCurrentOrdinaryExact':True,'fourteenWholeGoalsOriginalP28Exact':True,'wholeOriginal336P685RecordsExact':True,'historicalWhole43ReviewInputGuards':oldReviewGuards,'actualCurrent43ConfigsAndWholePReviews':currentConfigs,'count':{'oldGoals':597,'actualCurrentGoals':645,'ordinary336':336,'profile336':336,'case685':caseCount,'currentConfigs43':len(currentConfigs)},'sourceKindAndScopeCompilerAcceptanceClaim':False,'activeWrites':0}
(O/'actual-original597-history-and-real-current645-v16-whole336-P685-endguards.independent.json').write_text(json.dumps(end,ensure_ascii=False,indent=2)+'\n')
assert canp.read_bytes()==activeRaw and regp.read_bytes()==regRaw
print('four deltas, original bypasses21/20→14, extra20→14, own fair scores',[w['raw'] for w in fair]);print('current645/v16 original336/P685/43 groups exact; historical597 remains explicitly historical')
