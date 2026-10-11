from pathlib import Path
from fractions import Fraction as F
import json,hashlib
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-international-trade-finance-whole-science-independent-a-v1';A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-international-trade-finance-one-contract-local-author-v1/distinct-four-actor-and-fair-partial-author-successor-v3'
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(name,obj):
 p=O/name;assert not p.exists();p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return bind(p)
M=json.loads((A/'whole-nine-one-contract-two-case-DEEN24-15.DRAFT-author-candidates.json').read_text())['materials'];I=json.loads((A/'whole-nine-current-contracts-P18-existing-KEEP-and-actual-case-binding.author-index.json').read_text())
checks=[]
def check(k,label,expr,actual,expect):
 actual=F(actual);expect=F(str(expect));checks.append({'materialId':M[k]['id'],'ownIndependentCheck':label,'explicitOwnExpression':expr,'actualRationalResult':str(actual),'independentlyExpectedRationalResult':str(expect),'pass':actual==expect})
# All expressions independently entered from the actual fictional case data.
for label,expr,v,e in [
 ('A Standarderlös','80*400',80*400,32000),('A Vertragsverkauf','30*520+50*400',30*520+50*400,35600),('A nach Zertifizierung','35600-1500',35600-1500,34100),('A zweckgebundenes Wasser','30*25',30*25,750),('A Differenz privater Verkaufserlöse','34100-32000',34100-32000,2100),('A Importeurabgabeersparnis','80*(8-3)',80*(8-3),400),('B Teilnehmerverkauf','20*380',20*380,7600),('B Teilnehmer netto','7600-600',7600-600,7000),('B Teilnehmer pro Betrieb','7000/20',F(7000,20),350),('B Training','20*15',20*15,300),('B Standardteilnehmer','20*300',20*300,6000),('B übrige Betriebe','40*300',40*300,12000),('B fehlende Dokumentation','30-5',30-5,25)]:check(1,label,expr,v,e)
check(2,'Wasserstelle','90000/3',F(90000,3),30000);check(2,'jährliche Wartungslücke','6000-4000',6000-4000,2000)
for label,expr,v,e in [('A Wasserrest','70-50',70-50,20),('A Zahlungsbedarf','30+15',30+15,45),('B verfügbare angenommene Mittel','25+20',25+20,45),('B fällig ohne Friständerung','100-25-20',100-25-20,55),('B getrennte Projektlücke','40-35',40-35,5)]:check(3,label,expr,v,e)
for label,expr,v,e in [('A Verlustaktiva','150-12',150-12,138),('A Eigenkapital','138-141',138-141,-3),('A kreditfinanzierte Aktiva','138+15',138+15,153),('A kreditfinanzierte Schulden','141+15',141+15,156),('A Eigenkapital nach Kredit','153-156',153-156,-3),('B Anfangseigenkapital','120-114',120-114,6),('B Verkaufsverlust','20-16',20-16,4),('B verbleibende Langfristkredite','110-20',110-20,90),('B Cash nach Verkauf','10+16',10+16,26),('B Cash nach Auszahlung','26-25',26-25,1),('B Aktiva nach Auszahlung','90+1',90+1,91),('B Schulden nach Auszahlung','114-25',114-25,89),('B End-Eigenkapital','91-89',91-89,2)]:check(4,label,expr,v,e)
for label,expr,v,e in [('A Auszahlung','160-16',160-16,144),('A mit Backup','144-4',144-4,140),('A Preis unverändert','160',160,160),('B Auszahlung','90-9',90-9,81),('B direkte Seitenersparnis','9-3',9-3,6),('B bei gleicher Menge vor weiteren Kosten','90-3',90-3,87)]:check(5,label,expr,v,e)
for q,rows in [('A',[(64,12,6,1800,100),(82,7,3,900,100),(100,2,1,400,100)]),('B',[(76,8,4,600,200),(91,4,2,300,200),(99,2,1,0,200)])]:
 for n,(prod,transport,stock,transition,qty) in enumerate(rows):
  run=prod+transport+stock;total=qty*run+transition
  exp_run={'A':[82,92,103],'B':[88,97,102]}[q][n];exp_total={'A':[10000,10100,10700],'B':[18200,19700,20400]}[q][n];exp_unit={'A':['100','101','107'],'B':['91','98.5','102']}[q][n]
  check(6,f'{q} {"RNH"[n]} laufend',f'{prod}+{transport}+{stock}',run,exp_run);check(6,f'{q} {"RNH"[n]} gesamt',f'{qty}*{run}+{transition}',total,exp_total);check(6,f'{q} {"RNH"[n]} je Einheit',f'{total}/{qty}',F(total,qty),exp_unit)
for n,r,e in [('R',82,8200),('N nur hypothetisch',92,9200),('H',103,10300)]:check(6,f'A Wiederholung {n}',f'100*{r}',100*r,e)
for label,expr,v,e in [('A Zollpreis','50+12',50+12,62),('A Staatseinnahmen','12*15',12*15,180),('A kostenlose Quotenrente','(62-50)*15',(62-50)*15,180),('A heimische Stückmarge','62-58',62-58,4),('B Zollpreis','80+10',80+10,90),('B Zolleinnahme','10*8',10*8,80),('B Import mit R','80+5',80+5,85),('B Heimat mit R','88+5',88+5,93),('B Import mit R+S','80+5+7',80+5+7,92),('B verbleibender relativer Importvorteil','93-92',93-92,1)]:check(7,label,expr,v,e)
for label,expr,v,e in [('A vorher Partnerpreis','85+60',85+60,145),('A vorher Outsiderpreis','75+60',75+60,135),('A Käufer-/Ressourcensparnis','130-85',130-85,45),('A multilaterale zusätzliche Ersparnis','85-75',85-75,10),('B vorher D-Preis','80+30',80+30,110),('B vorher P-Preis','95+30',95+30,125),('B bilateraler Endpreis','95+3',95+3,98),('B Käuferersparnis','110-98',110-98,12),('B reale Herstellungserhöhung','95-80',95-80,15),('B reale Gesamtmehrkosten','95-80+3',95-80+3,18),('B verlorener öffentlicher Transfer','30',30,30),('B multilateraler Vorteil gegenüber98','98-80',98-80,18)]:check(8,label,expr,v,e)
assert all(c['pass'] for c in checks)
num=write('actual-own-independent-rational-case-calculations-and-economic-boundaries.json',{'role':'Independent reviewer A executed own Fraction expressions, not author60 checks','actualExecutedRationalChecks':len(checks),'actualFailures':0,'checks':checks,'noQuantifiedClaimsWhereDataMissing':['A NGO maintenance outside2000','bankB creditor-loss size','LCR or capital legally prescribed ratio','transaction-tax elasticity/revenue','new platform customer counts','offshoring disruption probability or actual historic jobs moved','auction revenue','whole-market welfare/demand/jobs'],'activeWrites':0})
sources=[
 {'url':'https://www.imf.org/annual-report/2026/what-we-do/lending/','actualReadScope':'Browser-returned131 lines, whole returned page read.','boundedOwnParaphrase':'IMF lending responds to external payment and macroeconomic stabilisation problems through finite programmes and conditions. It is not unrestricted grant funding or parliamentary replacement.','supportsMaterials':[M[3]['id']], 'actualInstitutionalNumericFiguresUsed':False},
 {'url':'https://www.imf.org/en/About/Factsheets/Where-the-IMF-Gets-Its-Money','actualReadScope':'Browser-returned62 lines, whole returned fact sheet read. Published December2023; last-updated May2025.','boundedOwnParaphrase':'Member quotas are the primary financing source, supplemented by borrowing arrangements. These structural categories support the reading aid; historical resource totals or activation dates are not assumed current.','supportsMaterials':[M[3]['id']], 'actualInstitutionalNumericFiguresUsed':False},
 {'url':'https://www.worldbank.org/en/who-we-are/ibrd','actualReadScope':'Browser-returned45 lines, whole returned overview read.','boundedOwnParaphrase':'IBRD and IDA have different clients and instruments. IBRD offers development financing, guarantees and advice and raises most funds on world capital markets. This does not establish identical terms across the Group.','supportsMaterials':[M[3]['id']]},
 {'url':'https://www.bis.org/publications/paper-164-liquidity-coverage-ratio-decade-on-stocktake-literature','actualReadScope':'Actual publication abstract lines532–537 read after opening lower page;13January2026 publication. The23-page paper was not downloaded or read.','boundedOwnParaphrase':'The scoped research overview discusses short-term cash, fire sales, welfare effects and possible lending costs. It supports a conceptual liquidity mechanism with tradeoffs; authors’ research views are not themselves binding regulation.','supportsMaterials':[M[4]['id']],'fullPaperRead':False},
 {'url':'https://www.oecd.org/en/topics/digital-trade.html','actualReadScope':'Actual scoped definition lines3728–3733 of long page read; not a whole-page reading claim.','boundedOwnParaphrase':'Digital ordering and digital delivery differ. Data links both physical and digital service activity and may also be a separate asset. These distinctions support the fictional service/data/platform cases.','supportsMaterials':[M[5]['id']],'actualOECDStatisticsUsed':False},
 {'url':'https://www.consilium.europa.eu/en/policies/trade-agreements/','actualReadScope':'Actual browser-returned168 lines read; bounded agreement-classification use especially lines40–49.','boundedOwnParaphrase':'Agreements differ by parties, purpose and institutional rules. The materials use this classification only; fictional tariff changes are not claimed to be actual CETA, EPA or any current agreement.','supportsMaterials':[M[1]['id'],M[8]['id']],'ActualTreatyFullTextsRead':False},
 {'url':'https://www.wto.org/english/tratop_e/tbt_e/tbt_e.htm','actualReadScope':'Direct browser open returned InternalError. Subsequently actual primary-domain indexed overview and official Article2.1/2.2 excerpts read via search. No successful direct HTTP200 or whole agreement reading claimed.','officialLegalExcerptUrls':['https://www.wto.org/english/tratop_e/tbt_e/tbtagr.htm','https://www-server1.wto.org/english/docs_e/legal_e/tbt_e.htm'],'boundedOwnParaphrase':'Official excerpts distinguish legitimate protection and equal treatment from unnecessary trade obstacles, considering risks of non-fulfilment. Fictional repeated import-only testing is evaluated with these criteria; no definitive legal ruling is made.','supportsMaterials':[M[7]['id']],'fullWTOAgreementRead':False}
]
src=write('actual-seven-independent-primary-web-reading-bounded-paraphrases-and-access-limits.receipt.json',{'readDate':'2026-10-10','reviewer':'independent-A','actualPrimarySourceFamiliesRead':7,'sources':sources,'thirdPartyFullTextsCopiedToRepository':False,'rawBrowserResponseHashClaim':False,'notAuthorSourceReceiptAsIndependentReading':True,'noCurrentLegalOrTariffAdviceClaim':True})
# Current target guards use actual registry/configs after the legitimate555 integration.
reg=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';registry=json.loads(reg.read_text());subject=next(s for s in registry['subjects'] if s['subject']=='wirtschaftswissenschaften');canpath=R/subject['landscapePath'];can=json.loads(canpath.read_text());goals={g['id']:g for g in can['goals']}
configs=[];found={};reviewcache={}
ids={r['goalId'] for r in I['rows']}
for cp in subject['positiveEvidenceConfigPaths']:
 cpath=R/cp;c=json.loads(cpath.read_text())
 relevant=sorted(ids & set(c.get('scope',{}).get('goalIds',[])))
 if not relevant:continue
 rp=R/c['reviewPath']
 if rp not in reviewcache:reviewcache[rp]={x['goalId']:x for x in (json.loads(line) for line in rp.read_text().splitlines() if line.strip())}
 configs.append({'config':bind(cpath),'wholeReviewFile':bind(rp),'relevantGoalIds':relevant})
 for gid in relevant:
  assert gid not in found;found[gid]=reviewcache[rp][gid]
assert set(found)==ids
guardrows=[]
for row in I['rows']:
 gid=row['goalId'];g=goals[gid];pr=found[gid]
 assert g==row['wholeGoal'];assert pr==row['wholePositiveProfileRecord']
 assert pr['status']=='needs_human_review' and pr['reviewAuthority']=='ai_candidate'
 guardrows.append({'goalId':gid,'wholeCurrent555Goal':g,'wholeCurrentOriginalPositiveProfileRecord':pr,'wholeDEENContractExactToScientificIntake':True,'wholeOriginalProfileCasesStatusesExactToScientificIntake':True,'materialId':row['materialId']})
end=write('actual-current555-nine-whole-contracts-P18-original-statuses-and-frozen-input-endguards.independent.json',{'role':'Targeted current binding verification after legitimate unrelated532→555 integration; no global532 hash constraint','actualCurrentCanonical':bind(canpath),'actualCanonicalGoalCount':len(can['goals']),'actualRegistry':bind(reg),'relevantCurrentPositiveConfigsAndWholeReviewFiles':configs,'actualNineWholeCurrentGoalAndProws':guardrows,'actualCurrentPcaseCount':18,'allFourInitiallyFrozenInputsStillExact':True,'historicalExistingMaterialsNotReReviewed':True,'nativeOverallCQRClaim':False,'activeWrites':0})
freeze=json.loads((O/'actual-nine-body-and-current-contracts-P18-independent-input-freeze.json').read_text())
for name in ['wholeAuthorHandoff','wholeNineBody','wholeNineContractsP18AndHistoricalKEEPIndex','wholeAuthorPrimarySourceReceiptReadAsProvenanceOnly']:
 b=freeze[name];p=R/b['path'];assert bind(p)==b
print(json.dumps({'numeric':num,'sourceReading':src,'currentEndguards':end,'actualNumericCount':len(checks)},indent=2))
