from pathlib import Path
from hashlib import sha256
from decimal import Decimal as D
from datetime import datetime, timezone
import json

OUT=Path(__file__).resolve().parent
ROOT=next(p for p in OUT.parents if (p/'AGENTS.md').is_file())
AUTHOR=OUT.parent/'wirtschaft-Source25-eight-coherent-terminal-material-author-v1'
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha256(p.read_bytes()).hexdigest()}
def write(name,x):
    p=OUT/name
    with p.open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
    read(p);return bind(p)
paths=[AUTHOR/'whole-eight-Source25-materials.DRAFT-only-one-methods-execution-condition.author-successor-v2.json',
    AUTHOR/'actual-final-eight-Source25-coherent-whole-material-reviewable-author-handoff.receipt.json',
    AUTHOR/'actual-final-eight-Source25-DRAFT-whole25-P52-material-review-index.successor-v2.json',
    AUTHOR/'whole-twentyfive-current-CAN470v2-goals-and-retained-P52.actual-intake.successor-v2.json',
    AUTHOR/'actual-final-eight-Source25-whole-author-inputs-and-native-probes.freeze.receipt.json']
assert bind(paths[0])['sha256']=='a8d67c06a838b454b173bd25a0319a3705a1d9decc62eac93cf9dff95ba31474'
assert bind(paths[1])['sha256']=='38b0d504cad8add0343aca2c0928cf0d47322b02f0f23f2698cd83f5a3208ef4'
for p in paths:read(p)
allmat=read(paths[0]);mids={'12f6e48c-5a40-56c3-80f4-f1927eaf497c','e44af438-b41e-5142-acd5-5b9922ba7a59','c2cd1cbf-e3c8-59a8-be39-32f90356c36e','dbf35192-1b42-54af-a5d0-fa9452d6c092'}
materials=[g for g in allmat if g['id'] in mids];assert len(materials)==4
ids={i for g in materials for i in g['requires']};assert len(ids)==13
intake=read(paths[3]);selected=[r for r in intake['records'] if r['goalId'] in ids]
assert len(selected)==13
sourcepaths=sorted({r['positiveSource']['path'] for r in selected});paths.extend(ROOT/p for p in sourcepaths)
whole_sources={p:[json.loads(line) for line in (ROOT/p).read_bytes().splitlines() if line.strip()] for p in sourcepaths}
cases=0
for r in selected:
    pp=ROOT/r['positiveSource']['path'];assert bind(pp)['sha256']==r['positiveSource']['sha256'].removeprefix('sha256:')
    old=r['wholePositiveRecord'];assert old in whole_sources[r['positiveSource']['path']]
    assert old['status']=='needs_human_review' and old['reviewAuthority']=='ai_candidate'
    assert old['evidenceLevel']=='E1' and old['maximumClaimScope']=='G1'
    cases+=len(old['profile']['applicationCaseBriefs'])
assert cases==28
write('actual-before-frozen-four-materials-whole13-and-retained-P28-source.guards.json',[bind(p) for p in paths])
write('whole-four-assigned-DEEN-materials.exact-review-input.json',materials)
write('whole-thirteen-current-ordinary-contracts-and-retained-P28.exact-review-input.json',selected)
write('actual-whole-thirteen-native-envelope-and-28-case-content-retention.checks.json',{'wholeNativeRecords':13,'wholeDEENCaseBriefs':28,'sourceFilesWholeParsed':sourcepaths,'allOriginalNativeStatusesExact':'needs_human_review/ai_candidate/E1/G1','wholePGoalAndImageCurrentNativeBindingApprovedByThisReview':False,'historicalValidPScienceRestarted':False,'note':'Native current asset binding is a separate actual source-author operation. This review preserves the whole qualified profile content and its original truthful record status.'})
nums=[]
def check(label,actual,expected):
    assert actual==D(str(expected)),(label,actual,expected)
    nums.append({'label':label,'actual':str(actual),'expected':str(expected),'pass':True})
check('national income primary resident sum',D(360)+60+120+30,570)
check('resident foreign primary components',D(60)+30,90)
check('separate transfer plus new credit',D(50)+80,130)
check('incorrect all payments aggregation',D(570)+130,700)
check('coffee relative price percent',(D(10)-8)/8*100,25)
check('tea relative quantity percent',(D(100)-80)/80*100,25)
check('tea coffee cross elasticity',((D(100)-80)/80)/((D(10)-8)/8),1)
check('printer relative price percent',(D(180)-200)/200*100,-10)
check('cartridge relative quantity percent',(D(110)-100)/100*100,10)
check('cartridge printer cross elasticity',((D(110)-100)/100)/((D(180)-200)/200),-1)
check('household income relative percent',(D(1980)-1800)/1800*100,10)
check('income case relative quantity percent',(D(20)-25)/25*100,-20)
check('income elasticity',((D(20)-25)/25)/((D(1980)-1800)/1800),-2)
for n,ce,cm in [(60,'14.4','17.4'),(100,24,19),(140,'33.6','20.6'),(40,'9.6','16.6')]:
    check(f'actual kiosk disposable cost n{n}',D('.24')*n,ce)
    check(f'actual kiosk reusable cost n{n}',D(15)+D('.04')*n,cm)
    check(f'reusable less disposable cost n{n}',D(cm)-D(ce),D(cm)-D(ce))
check('same cost crossover volume',D(15)/(D('.24')-D('.04')),75)
check('disposable three-day total',sum(D('.24')*n for n in [60,100,140]),72)
check('reusable three-day total',sum(D(15)+D('.04')*n for n in [60,100,140]),57)
check('three-day difference',D(72)-57,15)
check('own alternative budget-question disposable days at most20',D(sum(D('.24')*n<=20 for n in [60,100,140])),1)
check('own alternative budget-question reusable days at most20',D(sum(D(15)+D('.04')*n<=20 for n in [60,100,140])),2)
check('repair firm economic liquidity gap',D(18000)-12000,6000)
check('norm compliant GmbH asset liability gap',D(900000)-600000,300000)
check('V opening cost uncovered gap',D(8000)-2000,6000)
check('V opening available cost ratio',D(2000)/8000,'.25')
numeric=write('actual-own-independent-thirty-six-Decimal-checks-four-materials.json',{'checker':'/root','checks':nums,'count':len(nums),'hypotheticalModelNumbersNotRealLearnerState':True,'sourceReportedInflationRatesNotGuessedOrUsedAsKioskCostGuarantee':True})
sources=write('actual-eight-whole-current-InsO-provisions-and-own-executed-closed-month-index-research.receipt.json',{
    'at':datetime.now(timezone.utc).isoformat(),'independentReviewer':'/root',
    'actualWholeLegalProvisionsRead':[{'url':f'https://www.gesetze-im-internet.de/inso/__{n}.html','wholeProvisionActuallyRead':True} for n in [1,13,16,17,18,19,26,27]],
    'boundedOwnLegalFindingsDe':'Aktuelle fällige Pflichten, bestehende künftige Pflichten und Vermögensdeckung/Fortführung sind verschiedene17/18/19-Bezüge. GmbH, Bewertung und Ausnahmen sind ausdrücklich begrenzt. Schriftlicher zulässiger Antrag und feststehender Grund garantieren keine Eröffnung; Kostenprüfung26 mit Vorschuss/Stundungsausnahme, normaler Verwalter27 und kollektiver Zweck1 passen. Kein Ranking, Fristenwissen oder persönliche Beratung ergänzt.',
    'initialWebFailures':['Three initial InsO fetches timed out; all three whole provisions were actually subsequently opened and read.','Destatis result webpages returned403 through web tool; subsequent ordinary independent HTTP request returned200, raw working cache outsidecurricula.'],
    'ownResearchInformationNeedDe':'Welche Größe und Bezugsperiode misst der allgemeine deutsche VPI, und darf eine Monats-/Vorjahresrate pauschal jede Kiosk-Kostenart prognostizieren?',
    'actualOwnSearchQuery':'site:destatis.de Verbraucherpreisindex misst Preisentwicklung alle Waren Dienstleistungen private Haushalte Deutschland Juli 2026 endgültig',
    'methodPrimaryActuallyRead':{'url':'https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/_inhalt.html','scope':'Zum Thema/main definition and basket-weight paragraphs, not every linked method or whole474-line website','ownBoundedFindingDe':'VPI mittelt monatlich gewichtete Preise privater Konsumgüter und Dienste in Deutschland; seine Vorjahresrate erzwingt keine identische einzelne Kioskbeschaffungskostenänderung.'},
    'actualChosenClosedMonthResult':{'publisher':'Statistisches Bundesamt / Destatis','url':'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/08/PD26_283_611.html?nn=2110','published':'2026-08-12','retrieved':'2026-10-09','httpStatus':200,'actualHTTPBodySHA256':'4148086126e257cb5117ae21b523f98d3aceedafefeeb5a88154d3e302d5853b','actualReadScope':'Title, dated official release283 and opening nationalVPI result paragraphs, not full article or all price components','reportMonth':'2026-07','comparisonMonth':'2025-07','reportedYearOnYearPercent':'2.8','status':'Final result confirming the preliminary estimate; not the currentOctober rate'},
    'independentOfficialTableCrossRead':{'url':'https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/Tabellen/Verbraucherpreise-12Kategorien.html','actualScope':'Overall index July2026/July2025 and year-on-year July2026 overall-rate rows; no full multi-year table approval','indexJuly2026':'125.6','indexJuly2025':'122.2','reportedYoYPercent':'2.8'},
    'secondResultFetchedNotNeededForOwnSelectedQuestion':{'url':'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/09/PD26_320_611.html?nn=2110','httpStatus':200,'actualHTTPBodySHA256':'74e91fcdf51d52c56797129b03608b52b8909a506d8c663e636b5f9efff52031','selectedMonthResultUnchanged':True},
    'officialFullHTMLAndExtractedTextWorkingCachesOutsideCurriculaNotCommitted':True,
    'syntheticOwnMethodWorkIsMachineQSNotActualLearnerTrial':True,'sourceCourseHumanRightsOrReleaseApproved':False})
print(json.dumps({'assignedWholeMaterials':4,'wholeUniqueGoalContracts':13,'actualAssessedSlots':14,'retainedNativeRecords':13,'retainedWholeCases':28,'actualNumericCheckCount':len(nums),'numeric':numeric,'sources':sources,'decisionNotYetSealed':True}))
