import copy
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
ORIGINAL = OUT.parent
AUTHOR = ORIGINAL.parent / 'wirtschaft-M4-twelve-macro-contracts-coherent-local-material-author-v1'
AFTER = AUTHOR / 'three-real-core-bypasses-separated-scoring-and-truthful-primary-bindings-author-successor-v4'
BEFORE = AUTHOR / 'whole-nine-macro-twelve-current-contracts-two-case-materials.DRAFT-readable-author-v3.json'
BODY = AFTER / 'whole-nine-current-macro-materials.only-three-core-scoring-successors.DRAFT-author-v4.json'
AH = AFTER / 'actual-final-nine-macro-six-exact-KEEP-three-core-scoring-followups.author-handoff-v4.json'
OLD = ORIGINAL / 'actual-final-nine-macro-whole-material-six-KEEP-three-REVISE-independent-b.handoff.receipt.json'
CONTRACT = AUTHOR / 'whole-twelve-current504-macro-contracts-and-qualified-original-P24.exact-intake.json'
CAN = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
CFG = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def dump(name,x):
    p=OUT/name;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)

assert sha(BODY)=='42ce85e08416e3a3225937045ea23144ff9a12306559a2d203111e1e179fd266'
assert sha(BEFORE)=='56bce50a7838a737ca558700ed3a061bd14fc55d09c7ebc68e2676280983f028'
assert sha(AH)=='dbebc14aab57cd9c2cca5c65b80360c33b99cb5ea4ef8b9d51d07f80e5f8ba7d'
assert sha(OLD)=='4c37fabe92031b04365dc0b049cdcd7669503acf3a14b902510bb83b624f30e7'
before=json.loads(BEFORE.read_text());after=json.loads(BODY.read_text());contracts=json.loads(CONTRACT.read_text())
changed=[1,4,6];fields=['taskContent','solutionContent','taskContentEn','solutionContentEn']
deltas=[]
for i in range(9):
    if i not in changed: assert before[i]==after[i];continue
    a=copy.deepcopy(before[i]);b=copy.deepcopy(after[i])
    for key in fields:
        old=a['examData'].pop(key);new=b['examData'].pop(key)
        assert old!=new
        # Each reviewed change is exactly the final scoring paragraph. All
        # preceding actual dossiers, demands, numerical solutions and mark
        # divisions stay byte-for-byte identical.
        oldhead,oldpara=old.rsplit('\n\n',1);newhead,newpara=new.rsplit('\n\n',1)
        assert oldhead==newhead
        deltas.append({'materialId':a['id'],'field':key,'wholePrecedingTextExact':True,'beforeScoringParagraph':oldpara,'afterScoringParagraph':newpara})
    assert a==b
    assert after[i]['examData']['reviewStatus']=='draft'
    assert after[i]['examData']['scoring']['maxPoints']==24 and after[i]['examData']['scoring']['passingPoints']==15
assert len(deltas)==12
current={g['id']:g for g in json.loads(CAN.read_text())['goals']}
assert all(current[r['wholeGoal']['id']]==r['wholeGoal'] for r in contracts)
assert sha(CONTRACT)=='f2b376f55d8c7a1816f9e0ca0912d212b4f06b71f84bb9fd8cb513697bfc9f61'
assert (AFTER/'whole-twelve-current524-contracts-and-original-P24.exact-reused.json').read_bytes()==CONTRACT.read_bytes()
def find_econ(x):
    if isinstance(x,dict):
        if 'positiveEvidenceConfigPaths' in x and any('wirtschaft-current' in p for p in x['positiveEvidenceConfigPaths']):return x
        for v in x.values():
            y=find_econ(v)
            if y:return y
    if isinstance(x,list):
        for v in x:
            y=find_econ(v)
            if y:return y
e=find_econ(json.loads(CFG.read_text()));assert e
ps={};pbindings=[];ids={r['wholeGoal']['id'] for r in contracts}
for path in e['positiveEvidenceConfigPaths']:
    cp=ROOT/path;c=json.loads(cp.read_text());rp=ROOT/c['reviewPath'];rows=[json.loads(x) for x in rp.read_text().splitlines() if x.strip()]
    sel=[r for r in rows if r.get('goalId') in ids]
    if sel:
        pbindings.append({'config':bind(cp),'review':bind(rp)})
        for r in sel:ps[r['goalId']]=r
assert len(ps)==12
assert all(ps[r['wholeGoal']['id']]['profile']==r['wholePositiveRecord']['profile'] for r in contracts)
delta_ref=dump('actual-twelve-real-DEEN-scoring-paragraphs-six-whole-KEEP-exact-independent-guard.json',{'actualDeltaCount':12,'changedMaterialIds':[after[i]['id'] for i in changed],'sixOtherWholeMaterialsExact':True,'outerFieldsRequiresCoverageTagsDRAFT24_15AllExact':True,'allActual12WholeGoalAndP24ContentsExact':True,'currentCAN':bind(CAN),'actualPBindings':pbindings,'deltas':deltas})

original_works=ORIGINAL/'actual-thirty-own-whole-submissions120-manual-rubric-decisions-and-three-real-bypasses.json'
oldworks=json.loads(original_works.read_text())['works']
assert sha(original_works)=='835de26b32c1950c261fe5bd94eb2a7f79f83c70a3578b01e1f36f5de482d4bd'
replay=[]
for w in oldworks:
    if w['materialId'] not in {after[i]['id'] for i in changed}:continue
    is_bypass=w['workId'].startswith('real-')
    cap=w['actualExistingCapApplied'] or is_bypass
    final=min(w['rawPoints'],14) if cap else w['rawPoints']
    reason='Previously genuine broad wrong-core work still fails' if w['actualExistingCapApplied'] else 'Meaningful correct original full/partial work remains uncapped'
    if is_bypass:
        reason={after[1]['id']:'New independent creation-only clause: entirely false creation cannot be rescued by genuinely correct repayment',after[4]['id']:'New independent initial-cause diagnosis clause: complete own starting diagnosis absence in both cases cannot be rescued by correct evaluation',after[6]['id']:'Separate current fiscal/Public-Choice and interested-use clauses: historical work cannot rescue whole missing current analysis'}[w['materialId']]
    replay.append({'wholeOriginalWorkUnchanged':w,'actualV4CapApplied':cap,'actualV4CapReason':reason,'actualV4Final':final,'actualV4Result':'PASS' if final>=15 else 'FAIL','newManualRawGrading':False})
assert len(replay)==12
assert sorted(r['actualV4Final'] for r in replay if r['wholeOriginalWorkUnchanged']['workId'].startswith('real-'))==[14,14,14]
assert sorted(r['actualV4Final'] for r in replay if r['wholeOriginalWorkUnchanged']['workId'].startswith('fair-'))==[19,20,20]
assert [r['actualV4Final'] for r in replay if r['wholeOriginalWorkUnchanged']['workId'].startswith('complete-')]==[24,24,24]
replay_ref=dump('actual-twelve-original-own-whole-works-preserved-three-bypasses-now14-FAIL-independent-replay.json',{'originalWholeManuscripts':bind(original_works),'actualReplayedOriginalWorkCount':12,'newWholeWorkCount':0,'newRawManualGrades':0,'originalThreeRawPoints':[18,21,18],'currentThreeFinalPoints':[14,14,14],'replays':replay})

newworks=[]
def add(i,label,answers,marks,reasons,cap_reason=None,expected=None):
    assert len(answers)==len(marks)==len(reasons)==4
    assert all(isinstance(m,int) and 0<=m<=6 for m in marks)
    raw=sum(marks);final=min(raw,14) if cap_reason else raw
    if expected is not None:assert final==expected
    newworks.append({'materialId':after[i]['id'],'workId':label,'wholeFourTaskSubmission':answers,'manualRubricDecisions':[{'task':j+1,'maximum':6,'points':marks[j],'reason':reasons[j]} for j in range(4)],'rawPoints':raw,'actualV4CapApplied':bool(cap_reason),'capReason':cap_reason,'finalPoints':final,'result':'PASS' if final>=15 else 'FAIL','role':'Own new synthetic reviewer work, no actual learner evidence'})

add(1,'new-fair-imperfect-money-core16',[
    'Ein neuer Kredit schafft zugleich eine Bankforderung und neue Kundeneinlage; das ist kein notwendiger Transfer vorheriger Spareinlagen. Kunde hat zugleich Guthaben und Schuld, Reserven sind nicht dieses Guthaben. Ich notiere für den Kredit100 irrtümlich ein Guthaben101 und lasse die genaue Nettozahl aus; der echte Paar-/Reserveunterschied ist trotzdem erklärt.',
    'Höhere Finanzierungskosten können zinsabhängige Investitionen und später Preisdruck dämpfen, wenn Auftrag/Kapazität passen. Mittelfristig symmetrische2% HVPI: darunter und darüber unerwünscht, nicht jeden Tag exakt; Niveau und Rate sind verschieden. Die konkreten Engpassdetails lasse ich weg.',
    'Tilgung30 senkt Forderung/Schuld80→50 und Guthaben90→60, beide Bankseiten sinken30. Keine Gewinnbuchung. Den Kundennettovergleich erläutere ich nicht vollständig.',
    'Niedrigerer Zins unterstützt Anträge nur bei tatsächlichem Bedarf, keine Garantie.0,5unter2% ist eine Unterschreitung auch unerwünscht.120×1,02=122,4 und nicht Rückkehr zu120. Mittlere Frist/Ursachen lasse ich zu knapp.'
],[4,5,4,3],['Meaningful true new creation/paired claim/deposit/reserve distinction; isolated figure/net detail wrong, no entire-absence cap','Real conditional chain/symmetry/time/rate-level; missing detailed capacity boundary','Real paired repayment/profit distinction, missing customer-net account','Real limited chain, target/index understanding with incomplete horizon explanation'],expected=16)
add(4,'new-fair-imperfect-original-cause-and-evaluation16',[
    'Plausibel ist die Fahrtverringerung wegen Homeoffice; ich würde Arbeitswege/Zeiten getrennt prüfen und belege keine Alleinursache. Der Auftrag20 liegt in freier Kapazität30 und braucht bei einer halben Arbeitsjahreinheit je Ausgabe10Arbeitsjahre, nicht10Dauerpersonen. Preisursache und Abfluss-/Beschäftigungsgrenzen bleiben unvollständig.',
    'Kurzfristige freie-Kapazitätsnachfrage könnte Beschäftigung fördern, langfristiger Angebotseffekt setzt wirkliche Umsetzung voraus.2%-Zins auf20 ergibt0,4 und mit Wartung1 zusammen1,4proJahr, ohne Kapitaltilgung. Bildung verdrängen kann zukünftige Produktivität kosten; die vollständige zweite Interessenargumentkette bleibt aus.',
    'Als eigene plausible Ursache wähle ich fehlende Eigenmittel alter Haushalte und würde Zugang/Inanspruchnahme prüfen. Training braucht12Monate und passende Kenntnisse. Potenzial20×2=40, bei30Aufträgen15Arbeitsjahre; Potenzial ist keine reale Jobgarantie. Eine weitere genaue Arbeitsplatz-/Verdrängungsgrenze fehlt.',
    '80×100=8000 gegenüber60×140=8400, mehr Gesamt trotz besserer Einheit. Herstellerabsatz kann gegen Zugang armer Haushalte und entgangene Bildung abgewogen werden; reine Mengenrechnung beweist keine kausale Rebounddiagnose. Langfristige Bildungswirkung und neue Gesamtverbrauchsdaten entscheiden, meine zwei Ketten sind noch knapp.'
],[4,4,4,4],['Real independently selected cause with evidence and employment model, incomplete secondary boundaries','Real own time/finance/opportunity evaluation, incomplete second chain','Real independent cause and delayed supply/potential/employment distinction, one limit incomplete','Real multiple-criteria reasoning/energy boundary, some timing/argument detail incomplete'],expected=16)
add(6,'new-fair-imperfect-source-bounded-perspective-and-interest16',[
    'Im historischen Nachfragefall würden flexible relative Preise, keynesianischer Nachfrageimpuls und ordoliberale verlässliche Zugangsregeln unterschiedlich wirken. Freie Kapazitäten und langsame Preise begrenzen schnelle private Anpassung; ich erläutere nicht jede Staatsrolle vollständig.',
    'Chicago-orientiert ist monetäre Stabilität statt Kontraktion wichtig; Keynes betont Ausgabenrückwirkung. Goldbindung/damalige Institutionen begrenzen eine heutige Übertragung. Der spätere Vortrag ist keine damalige Beobachterstimme,100→80sind Lehrdaten. Einige genaue Fristannahmen bleiben aus.',
    'Heute liberal Kosten/Opportunität, Keynes freie Auslastung/Nachfrage, Ordo offene durchsetzbare Regeln. Offene Vergabe kann mehrere Ziele verbinden, bei knappen Ressourcen nicht automatisch Mehrproduktion. Ich lasse detaillierte Politikgewichte offen.',
    'Neoklassisch spätere entgangene Verwendung, Keynes kurzfristige Nachfrage, PublicChoicepolitische Anreize/Regeln: drei verschiedene Fragen. Der Verband nennt seine regionale20und lässt unsichere gemeinsame30weg: dokumentierte interessengeleitete Auswahl, kein Korruptionsbeweis oder Widerlegung jeder Nachfragewirkung. Vollständigen Kostenprüfungs-/Nachkontrollvorschlag und historische Transfergrenze lasse ich aus.'
],[4,4,4,4],['Applied actual three-view core, some state/assumption detail missing','Actual monetary/history/material limits, some precise theory details missing','Meaningful three transferred mechanisms and conditional limit, detail incomplete','Actual fiscal/demand/Public-Choice distinction plus documented interested selection; rule/evidence detail missing'],expected=16)
money_full=next(w for w in oldworks if w['workId']=='complete-independent-2')['wholeFourTaskSubmission']
absent_repayment=copy.deepcopy(money_full)
absent_repayment[2]='Tilgung ist bloß Einnahme/Gewinn30 der Bank. Forderung80und Guthaben90bleiben unverändert, Kundennetto verliert30. Ich erkläre keine wirkliche Paarbuchung oder Geldvernichtung.'
add(1,'new-persistently-wrong-repayment-separate18-to14',absent_repayment,[6,6,0,6],['Unchanged genuine complete creation work','Unchanged complete target/rate work','Repayment/paired balance/profit/net relationships entirely wrong','Unchanged complete lower-rate/target/index work'],'New independent repayment-only clause applies despite correct creation',expected=14)
theory_full=next(w for w in oldworks if w['workId']=='complete-independent-7')['wholeFourTaskSubmission']
no_interested=copy.deepcopy(theory_full)
no_interested[3]='Neoklassische spätere Ressourcen-/Opportunitätskosten unterscheiden sich von keynesianischen freien Kapazitäten; PublicChoiceuntersucht politische Anreize und Regeln, kein notwendiger Korruptionsvorwurf. Transparente Gesamtkosten-/Alternativenprüfung mit späterer Kontrolle wäre sinnvoll;20/30sind unsichere nichtaddierbare Wohlfahrtsindizes. Ich analysiere ausdrücklich weder die dokumentierte Auswahl des Verbands noch dessen ausgelassene Bedingungen oder konkrete Interessenverwendung.'
add(6,'new-current-interest-facet-wholly-absent22-to14',no_interested,[6,6,6,4],['Unchanged full applied historical views','Unchanged full historical/Chicago/context account','Unchanged full current three-view account','Actual three argument types, cost/rule and limits; documented interested selection completely absent'],'New separate documented interested-use clause applies despite real historical and current perspective work',expected=14)
assert len(newworks)==5
new_ref=dump('actual-five-new-own-whole-scoring-works20-manual-grades-three-fair16-two-independent-core-FAIL.json',{'actualNewWholeWorkCount':5,'actualNewManualCriterionCount':20,'works':newworks,'newArithmeticCampaign':False,'unchangedActualFiguresUseBound56FractionChecks':bind(ORIGINAL/'actual-independent-56-Fraction-model-calculations.json')})

aid=AFTER/'actual-seven-primary-aids.with-TodayOJ-rejection-and-real-Buchanan-cache-only-followup.json';a=json.loads(aid.read_text());assert sha(aid)=='25d53f997ed3b483abd4e3915f05a5e13ff7942ce2dace9b92656ea2905f834f'
t=next(x for x in a['sources'] if x['key']=='tfeu107');b=next(x for x in a['sources'] if x['key']=='buchanan1986')
assert 'TodayOJ' in t['withdrawnIncorrectOriginalTextBinding']['actualContent']
assert not t['actualFreshSuccessfulReading']['originalHTMLSHAClaimed']
assert b['actualAvailableParsedPrimarySnapshot']['sha256']=='40df74ffe5f3a6e2b74832ac36e123d73f53db3569f9c02f1b5670b6f3534d67'
assert sha(Path(b['actualAvailableParsedPrimarySnapshot']['path']))==b['actualAvailableParsedPrimarySnapshot']['sha256']
assert sha(Path(t['actualFreshSuccessfulReading']['toolReturnCachePath']))==t['actualFreshSuccessfulReading']['toolReturnCacheSHA256']
primary_ref=dump('actual-bounded-two-source-misattribution-withdrawals-and-valid-prior-independent-reading-reuse.json',{'authorAid':bind(aid),'actualTodayOJSuccessfulHTTPIsNotArticle107':True,'actualFreshArticle107ToolReturnBindingChecked':True,'unreconciled5c1DigestWithdrawnNotRebound':True,'actualBuchanan40dfParsedCacheExact':True,'independentValidPrimaryReadingReused':bind(ORIGINAL/'actual-independent-seven-primary-reading-boundaries-and-limited-own-aids.json'),'newSourceApprovalFromAuthorCache':False,'wholeBodiesUnchangedExceptScoring':True,'actualReadWholeAuthorCorrection':True})
dec_ref=dump('actual-three-scoring-delta-independent-KEEP-six-prior-whole-KEEP-reused.json',{
    'status':'KEEP','authority':'Independent machine scientific scoring followup, human release separate',
    'decisions':[
        {'materialId':after[1]['id'],'decision':'KEEP','reason':'Creation and destruction are actual different essential676performances. Separately limiting total absence/persistent misconception closes18bypass without rejecting isolated numerical errors or meaningful partial pairing. Own preserved full24/partial19 and new genuine partial16 remain PASS; new wrong repayment18→14.'},
        {'materialId':after[4]['id'],'decision':'KEEP','reason':'Own starting diagnosis, model employment and own multiperspective policy evaluation are different actual950/764performances. Separating total diagnosis absence closes21bypass; selection of plausible causes and partial correct chains are accepted, no prescribed causal or policy outcome. Own full24/partial20 and independently new real cause/evaluation16 remain PASS.'},
        {'materialId':after[6]['id'],'decision':'KEEP','reason':'Historical theory comparison, current source-bound fiscal/Public-Choice analysis and documented interested use are distinct required120facets. Separating wholly missing current analysis closes18bypass; separate missing documented interest22→14. Real incomplete source-bound work16 and preserved whole24/partial20 remain PASS, not perfect history or fixed policy.'}
    ],
    'sixUnchangedWholeKEEPReused':[{'materialId':after[i]['id'],'wholeObjectExact':True,'validWholeScience':bind(OLD)} for i in range(9) if i not in changed],
    'reviewScope':'Exactly12final DEEN scoring paragraphs. Actual prior whole9/P24/numeric/primary scientific evidence reused only after exact whole binding guards; no historical restart.',
    'newQualifiedScoringSuccessors':3,'wholeFinalScientificMaterialsQualified':9,
    'newStrictGoalClosures':0,'restoredBindings':0,'sourceClaims':0,'noActiveWrites':True,
    'pending':'All9 remain DRAFT in this input. Root release/status/SEM/P/Books and independent final current country/course/full-closure/Nav/views/central-floor qualification remain separate.'
})
refs=[delta_ref,replay_ref,new_ref,primary_ref,dec_ref]
manifest=dump('actual-three-core-scoring-independent-followup.portable-freeze.manifest.json',{'inputs':[bind(OLD),bind(BEFORE),bind(BODY),bind(AH),bind(CONTRACT),bind(original_works),bind(CAN),bind(CFG)],'evidence':refs,'originalHistoryPreserved':True,'activeWrites':0})
receipt=dump('actual-final-nine-macro-six-KEEP-reused-three-bounded-scoring-KEEP.independent-b.handoff.receipt.json',{'status':'KEEP','authority':'Independent machine scientific followup only','authorHandoff':bind(AH),'wholeFinalReviewedCandidate':bind(BODY),'validOriginalSixKEEPThreeREVISE':bind(OLD),'evidence':refs,'manifest':manifest,'actual12ScoringParagraphFieldsRead':True,'actual12CurrentWholeGoalAndP24ContentsExact':True,'original56NumericalChecksReusedNotReperformed':True,'original12CompleteOwnWorksReplayedNotNew':True,'actualOriginalThreeBypassPoints':[18,21,18],'actualFinalThreeBypassPoints':[14,14,14],'newOwnWholeCounterworks':5,'newManualRubricDecisions':20,'newWholeScienceCampaignOnSixKEEP':False,'qualifiedFinalWholeMaterialCount':9,'newStrictGoalClosures':0,'restoredBindings':0,'noSourceScopeHumanOrMaturityClaim':True})
print(json.dumps({'receipt':receipt,'actualOriginalWorksReplayed':12,'newWholeWorks':5,'newManualMarks':20,'status':'KEEP'}))
