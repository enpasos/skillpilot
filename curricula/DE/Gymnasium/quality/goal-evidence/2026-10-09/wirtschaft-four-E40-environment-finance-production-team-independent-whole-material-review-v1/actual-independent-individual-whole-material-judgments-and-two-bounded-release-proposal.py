"""Seal substantive bounded judgments after actual whole four-material reading."""
import copy
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
REPO = next(p for p in HERE.parents if (p / 'AGENTS.md').exists())
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-E-forty-nine-coherent-terminal-material-author-v1'
ids = ['fa7dc626-ab21-58a9-ab1e-eb23309a7ed2','64276b0c-cc52-5482-bbf8-2412a3f6cde3','75f67cb9-70bf-5035-adff-05b22889916b','b2003473-c85f-57e9-83be-9bbc0a922b32']
def save(n,o): (HERE/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def objsha(o): return 'sha256:'+hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
whole=json.loads((AUTHOR/'whole-nine-coherent-E40-materials.DRAFT-terminal-goals.candidate.json').read_text())
selected=[copy.deepcopy(g) for g in whole if g['id'] in ids]
mapping=json.loads((AUTHOR/'actual-nine-materials-forty-current-performance-contracts-minimal-requires-and-course.author-mapping.json').read_text())
wholeContexts=json.loads((HERE/'actual-sixteen-whole-current-covered-goal-and-unchanged-historical-native-P-contexts.exact-snapshot.json').read_text())['wholeCurrentContextRecords']
context={r['goalId']:r for r in wholeContexts}
performanceReasons={
 'b7633a54-6980-566b-bf8b-262e1841bd7d':'Four named perspectives, a stipulated measurement, unmeasured business forecast, normative priorities and concrete allocation of upgrading burdens provide an actual political environmental conflict to analyse.',
 'ee36cbaf-6a9d-5263-946f-7bb376aa0dfc':'Distinct efficiency/sufficiency/consistency changes plus worsened working conditions require classification of social/environmental/economic dimensions. Unit improvement is explicitly not total improvement.',
 '5262a0ba-0ede-5f47-a6a2-4778d24fc95a':'Different fictional GDP/HDI/emissions rankings, source-defined HDI and unobserved distribution require three measurement distinctions, specific interpretation and additional-information need.',
 '65d9f38e-d35d-5d84-8b66-3c05e388734f':'A clearly fictional binding minimum rule changes feasible production options. Initial/running funding effects, public aim and two required conditional checks operationalise judgment rather than recall of state functions.',
 'e7fbbb64-9f10-5d5d-8946-710aedc6794a':'Stated equity and credit rights, amounts and debt service require explanation of funding and separation of cash/profit/liability; material actor wording requires correction.',
 'c4f27b51-958c-5416-a2de-d96a6e59e8b5':'Provider duties/claims, bank default, equity loss and a separately stipulated valid personal guarantee test distinct liability risks; ordinary shareholder/company-asset wording currently conflates actors.',
 '4c7c7297-b4bb-56cd-bbfe-85d4cdb784e8':'The stress shortfall, two conditional funding responses and changed private guarantee while corporate debt service staysfixed require genuine critical discussion, not universal ranking.',
 '685624a0-6839-521c-8228-c5914342bc6e':'Actual linked audience-sensitive GuV and balance charts and both changed inputs match the whole procedural contract. They are demanded but currently insufficiently protected by the aggregate passing condition.',
 '2ccb9f7e-1512-5970-85a1-71ec42734eb9':'Two concrete workshop/line workflows, division of work, information handoffs, bottleneck and erroneous master data require actual production/IT analysis. No new historical source-facet approval inferred.',
 'f90e4741-368b-5524-8053-417d06197c80':'A local30% pilot change is separated from customer/worker/economy pathways and demand, training, capacity, distribution/environment conditions; no automatic net employment or environmental effect.',
 '9cb6bd3b-1ecf-57af-8127-853fc969d7f5':'Dated official2025/2024 survey association is clearly separated from fictional activities. Digital assistance and hybrid/on-site conditions require two activity-specific evaluations and one chosen career-exploration step.',
 '96ab60e8-7645-5c34-84be-62e1c2a3cb16':'Concrete employee and founder profiles, two voluntary personal links, additional acquisition/finance/responsibility, developmental area and an open next step satisfy reflection without grading personality or revealing intimate/private facts.',
 '596c02e3-6263-5084-8593-c5f51808326b':'Bounded question, source and own calculation, actual data/report products and actual methodological evaluation form the project cycle. Whole-artifact passing boundary remainsopen; purely planned execution is correctly capped.',
 '0d8cb18d-7fd9-56f5-8009-8045d44f4127':'Initial/revised role boards, feedback, dependencies, actual work packages and media evaluation operationalise coordination. Explicit transparent role simulation is within the unchanged valid historical P-case; toolnamesalone are insufficient.',
 '8328f308-ce55-54b4-8472-0340cb10ba5c':'Actual current2024 German register rows, clear relationship/person distinction, separate spreadsheet charts and limited career conclusions match the whole contract. Missing actual chart work can currently be compensated to pass.',
 '860ead33-2b4c-5513-8a38-b291dc387f3a':'All four supplied presentation blocks are analysed by audience, content, evidence, language and display; two concrete revisions and limited fictional feedback test real judgment, not decorative slide production.'}

findings=[
 {'findingId':'E40-642-company-and-shareholder-liability-actor','examGoalId':ids[1],'severity':'REVISE','boundFields':['examData.taskContent','examData.taskContentEn'],
  'actualMaterialDe':'Die Gesellschafterhaftung ist grundsätzlich auf Gesellschaftsvermögen begrenzt',
  'actualMaterialEn':'Shareholder liability is normally limited to company assets',
  'actualPrimaryURL':'https://www.gesetze-im-internet.de/gmbhg/__13.html',
  'actualSourceCopy':'fresh-primary/gmbhg13.actual-fresh-whole.raw.txt',
  'reason':'Section13 concerns liabilities of the company and the company assets available to its creditors. Ordinary shareholders are generally not personally liable for those company obligations. Their separate valid guarantee may create their own liability. Both task languages currently assign company-asset liability to the wrong actor.',
  'minimalReviewRecommendation':'Bounded bilingual material correction distinguishing company liabilities/company assets, ordinary absence of personal shareholder liability and the independently stipulated guarantee. Preserve valid comparative provider/cash analysis.'},
 {'findingId':'E40-642-absent-actual-spreadsheet-still-passes','examGoalId':ids[1],'severity':'REVISE','boundFields':['description','descriptionEn','examData.scoring','examData.solutionContent','examData.solutionContentEn'],
  'counteranswerFile':'actual-eight-complete-independent-counteranswers-and-individual-rubric-marks.json', 'counteranswerId':'finance-complete-concepts-but-no-spreadsheet',
  'actualStepScores':[6,6,6,2],'actualTotal':20,'actualPassingThreshold':15,
  'reason':'All financing reasoning plus prose interpretive limits reaches20 with no actual file, charts or input-change execution. The current step-only cap cannot enforce the explicit essential actual spreadsheet performance.',
  'minimalReviewRecommendation':'Add an explicit whole-assessment prerequisite/cap below15 when required actual spreadsheet/data products or specified input-change performance is absent. Keep normal point allocation and15/24 threshold for otherwise genuine work; no perfect-score/new task quota.'},
 {'findingId':'E40-b200-absent-actual-spreadsheet-still-passes','examGoalId':ids[3],'severity':'REVISE','boundFields':['description','descriptionEn','examData.scoring','examData.solutionContent','examData.solutionContentEn'],
  'counteranswerFile':'actual-eight-complete-independent-counteranswers-and-individual-rubric-marks.json','counteranswerId':'project-real-role-records-and-report-without-spreadsheet',
  'actualConservativeStepScores':[2,6,2,6],'actualConservativeTotal':16,'actualPassingThreshold':15,
  'reason':'The complete reviewer fixture supplies real textual role revisions, feedback, calculation/report work and full presentation critique, but explicitly no spreadsheet/charts. Even conservatively capping incomplete projectS1 at2 leaves16≥15. The all-prose case is correctly blocked12; that does not remove this more specific hole.',
  'minimalReviewRecommendation':'Explicit whole-assessment cap below15 for missing actual prescribed project/data/spreadsheet products or verifiable team/role execution. Genuine transparent role simulation remains allowed; no claimed external team, school or business test.'}
]
judgments=[]
for g in selected:
    mr=next(r for r in mapping['actualPerformanceAndMaterialMappings'] if r['examGoalId']==g['id'])
    direct=g['requires']; assessed=g['examData']['coveredGoalIds']
    assert set(direct)==set(assessed)=={x['goalId'] for x in mr['actualAssessedGoals']}
    covered=[]
    for a in mr['actualAssessedGoals']:
        r=context[a['goalId']]
        assert a['wholeCurrentGoal']==r['wholeCurrentCanonicalGoal']
        covered.append({'goalId':a['goalId'],'wholeGoalObjectSHA256':objsha(a['wholeCurrentGoal']),
                        'wholeCurrentDEENContractActuallyRead':True,'taskNumber':a['taskNumber'],
                        'actualTaskDemandDe':a['actualTaskDemandDe'],'actualExpectedPerformanceDe':a['actualExpectedPerformanceDe'],
                        'actualRubricDe':a['rubricDe'],'actualRubricEn':a['rubricEn'],
                        'minimalRequiresDecision':'KEEP','reason':performanceReasons[a['goalId']],
                        'historicalNativePSourcePath':r['nativePositiveSourcePath'],'historicalNativePRecordObjectSHA256':objsha(r['nativePositiveRecord']),
                        'historicalPRecordStatus':r['nativePositiveRecord']['status'],'historicalPAuthority':r['nativePositiveRecord']['reviewAuthority'],
                        'historicalPEvidenceLevel':r['nativePositiveRecord']['evidenceLevel'],'historicalPMaximumClaimScope':r['nativePositiveRecord']['maximumClaimScope'],
                        'notFreshPReview':True})
    verdict='REVISE' if g['id'] in (ids[1],ids[3]) else 'KEEP'
    focused=[f['findingId'] for f in findings if f['examGoalId']==g['id']]
    judgment={'examGoalId':g['id'],'title':g['title'],'wholeOriginalGoalObjectSHA256':objsha(g),
              'wholeDEENDescriptionTaskMaterialAllFourSolutionAndRubricStepsActuallyRead':True,
              'verdict':verdict,'currentOriginalMachineMaterialStatus':g['examData']['reviewStatus'],
              'minimalDirectRequiresDecision':'KEEP','allFourWholePrerequisiteContractsActuallyRead':True,
              'coverage':covered,'specificFindings':focused,
              'whole24PointRubricReadAnd29IndependentNumericChecksPASS':True,
              'currentGKAndLKTagsActuallyMatched':'GK+LK in frozencurrentGoal/CAN416; no inferred Berlin/other normative course approval',
              'languageParity':'WholeDEEN expectations and2+2+2 rubrics match; bilingual liability actor issue is expressly open for642, not silently corrected.',
              'ownContentLicense':'CC-BY-4.0','thirdPartySourceRightsBoundary':'Captured third-party definitions/data retain their own terms; no third-party page relicensing. Own fictitious cases and reviews are separate.',
              'humanReview':'pending','notSource125CourseDVOrMasteryApproval':True}
    judgments.append(judgment)
    if verdict=='KEEP':g['examData']['reviewStatus']='released'

for g in selected:
    old=next(x for x in whole if x['id']==g['id'])
    cp=copy.deepcopy(g)
    cp['examData']['reviewStatus']=old['examData']['reviewStatus']
    assert cp==old
save('four-individual-whole-material-judgments-sixteen-minimal-prerequisite-decisions.json',{'schemaVersion':1,'reviewer':'/root/economics_be20_independent_need_review','reviewedAt':datetime.now(timezone.utc).isoformat(),'materialJudgments':judgments,'summary':{'KEEP':2,'REVISE':2,'BLOCK':0,'minimalDirectRequiresKEEP':16},'liveWrites':False,'strictNetGrowth':0})
save('three-actual-bounded-findings-and-review-only-remedy-recommendations.json',{'schemaVersion':1,'findings':findings,'notAuthorRemedyOrSelfApproval':True})
save('whole-four-current-materials.only-two-independent-machine-material-statuses-released.inert.json',selected)

primary=json.loads((HERE/'actual-independent-five-fresh-primary-fetches.no-content-approval-yet.json').read_text())
save('actual-independent-five-primary-substantive-comparisons-and-fresh-fetch-boundaries.receipt.json',{
 'schemaVersion':1,'freshHTTPFetchesAndActualDecodedWholeReads':primary,
 'substantiveSourceComparisons':[
  {'id':'gmbhg13','wholeNormActuallyRead':True,'decision':'Source supports society/company actor; actual material642 requires correction.', 'sourceURL':'https://www.gesetze-im-internet.de/gmbhg/__13.html'},
  {'id':'bgb765','wholeNormActuallyRead':True,'decision':'Valid stipulated guarantee creates own obligation to creditor of a third party. No automatic all-debt scope/instant enforcement inferred. RawHTTP exacttoauthorcommittable765copy.', 'sourceURL':'https://www.gesetze-im-internet.de/bgb/__765.html'},
  {'id':'undpHDI','wholeCurrentDefinitionActuallyRead':True,'decision':'Health, education and standard of living use life expectancy, schooling andGNI percapita. HDI does not itself measure all inequality, poverty or environment. Material figures explicitlyfictional, no ranking/database reproduction.', 'sourceURL':'https://hdr.undp.org/data-center/human-development-index'},
  {'id':'bauaKI','actualFreshDirectHTTP403':True,'actualWebDirect403':True,'officialSearchCachedPublishedLandingTextActuallyRead':True,
   'cachedSearchCrawlAge':'5months; official2025 publication landing paragraph',
   'decision':'Own short supplied paraphrase agrees with published2025 official summary: survey2024 and association of more discretion with higher intensity. No new current prevalence, causal claim, fullPDF or new rawlanding200 read asserted.',
   'sourceURL':'https://www.baua.de/DE/Angebote/Publikationen/Bericht-kompakt/KI-unterstuetzte-Arbeit'},
  {'id':'destatis2024','actualFreshHTTP200WholeSourceAndSpecificRowsFootnotesActuallyRead':True,'directWeb403':True,
   'decision':'Actual fresh table2024/Stand3August2026 confirms198362/7801230 and538248/6017332. Main-activityWZ2008, Germanseat/VATandoremployment, onlymarketproducersB–N and noArbeitsgemeinschaften, annual-average relationships/personmultiplejob are accurately bounded.',
   'actualRawSHADiffersFromAuthor':'Measured fresh raw capture has changing request/page bytes; dated substantive two rows and footnotes match, not whole rawauthor equality claimed.',
   'sourceURL':'https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/Unternehmensregister/Tabellen/stat-unternehmen-beschaeftigten-groessenklassen-wz08.html'}],
 'notWholeSource125OrNormativeCourseApproval':True,'noWholePDFFromFailedFetch':True,'noThirdPartyRelicensing':True})
print(json.dumps({'wholeMaterialKEEP':2,'wholeMaterialREVISE':2,'minimalPrerequisiteKEEP':16,'onlyMachineMaterialStatusChanges':2,'findings':3,'strictNetGrowth':0},indent=2))
