"""Actual author arithmetic/counterwork checks, not independent qualification."""
import json
from fractions import Fraction as F
from pathlib import Path

OUT = Path(__file__).resolve().parent
M = json.loads((OUT / 'whole-four-intrinsic-local-tax-materials.two-cases-DRAFT-author-candidates-v1.json').read_text())
checks = []
def check(label, actual, expected):
    actual, expected = F(actual), F(expected)
    assert actual == expected, (label, actual, expected)
    checks.append({'label': label, 'actualExactFraction': str(actual), 'expectedExactFraction': str(expected), 'PASS': True})

for income, tax_f, rate_f, tax_u in [(30000,4500,F(15,100),6000),(60000,12000,F(20,100),12000)]:
    check(f'effects-F-tax-{income}', (income-12000)*F(1,4), tax_f)
    check(f'effects-F-average-{income}', F(tax_f,income), rate_f)
    check(f'effects-U-tax-{income}', income*F(1,5), tax_u)
    check(f'effects-U-average-{income}', F(tax_u,income), F(1,5))
check('F-additional-tax',2000*F(1,4),500)
check('F-additional-net',2000-500,1500)
check('U-additional-tax',2000*F(1,5),400)
check('U-additional-net',2000-400,1600)
check('effects-buyer-incidence',11-10,1)
check('effects-seller-incidence',10-8,2)
check('effects-seller-after-remittance',11-3,8)
check('effects-actual-receipts',1600*3,4800)
check('effects-buyer-total-remaining',1600*1,1600)
check('effects-seller-total-remaining',1600*2,3200)
check('effects-quantity-fall',F(2000-1600,2000),F(1,5))
for name,share,initial,after,loss in [('Bund',F(1,2),50,40,10),('Laender',F(35,100),35,28,7),('Gemeinden',F(15,100),15,12,3)]:
    check(name+'-initial-million',100*share,initial)
    check(name+'-after-million',80*share,after)
    check(name+'-loss-million',initial-after,loss)
for opt,hhrefund,firmrefund,transport,net_hh,net_firm in [('P',30,0,70,0,70),('H',100,0,0,-70,70),('F',30,70,0,0,0)]:
    check(opt+'-allocation-total',hhrefund+firmrefund+transport,100)
    check(opt+'-net-household-payment',30-hhrefund,net_hh)
    check(opt+'-net-firm-payment',70-firmrefund,net_firm)
    check(opt+'-cash-finances-spending',net_hh+net_firm,transport)
check('instrument-income-low',20000*F(1,10),2000)
check('instrument-income-high',60000*F(1,10),6000)
check('instrument-consumption-each',10000*F(1,5),2000)
check('instrument-consumption-low-ratio',F(2000,20000),F(1,10))
check('instrument-consumption-high-ratio',F(2000,60000),F(1,30))
check('instrument-additional-net-earnings',1000-1000*F(1,10),900)
check('instrument-additional-gross-buy',100+100*F(1,5),120)
check('instrument-profit-tax',100000*F(1,4),25000)
check('instrument-profit-after-tax',100000-25000,75000)
check('instrument-unit-actual-receipts',9000*2,18000)
check('instrument-buyer-unit',F(208,10)-20,F(8,10))
check('instrument-seller-unit',20-F(188,10),F(12,10))
check('instrument-buyer-remaining-total',9000*F(8,10),7200)
check('instrument-seller-remaining-total',9000*F(12,10),10800)
check('instrument-after-remittance',F(208,10)-2,F(188,10))
check('instrument-quantity-fall',F(10000-9000,10000),F(1,10))
check('fair-G-each-tax',36000*F(1,10),3600)
check('fair-G-A-remaining',36000-12000-3600,20400)
check('fair-G-B-remaining',36000-3600,32400)
check('fair-G-A-adjusted-rate',F(3600,36000-12000),F(15,100))
check('fair-G-B-adjusted-rate',F(3600,36000),F(1,10))
check('fair-K-A-tax',(36000-12000)*F(1,10),2400)
check('fair-K-A-remaining',36000-12000-2400,21600)
check('fair-K-A-gross-rate',F(2400,36000),F(1,15))
check('fair-K-A-adjusted-rate',F(2400,24000),F(1,10))
check('fair-revenue-shortfall',2*3600-(2400+3600),1200)
for name,inc,km,u,p in [('L',12000,1000,200,0),('H',60000,5000,1000,960),('N',30000,0,0,240)]:
    check('fair-U-'+name,km*F(1,5),u)
    check('fair-P-'+name,max(0,inc-20000)*F(24,1000),p)
    check('fair-U-rate-'+name,F(u,inc),F(1,60) if name!='N' else 0)
    check('fair-P-rate-'+name,F(p,inc),{'L':F(0),'H':F(16,1000),'N':F(8,1000)}[name])
check('fair-U-total',200+1000+0,1200)
check('fair-P-total',0+960+240,1200)

# Full baseline responses are the actual complete author solutions. These are
# author's checks of the material, never a foreign review or learner submission.
works = []
for m in M:
    works.append({'materialId':m['id'],'kind':'complete author answer', 'wholeAnswer':m['examData']['solutionContent'],
                  'stepAwards':[4]*6,'rawPoints':24,'capApplied':False,'finalPoints':24,'PASS':True,
                  'manualEvidence':'All six concrete demands addressed across both independent cases.'})
negative_answers = [
 ('effects', [3,2,0,4,4,4], '''1. F 4.500/12.000, 15/20 %. U 6.000/12.000, 20/20 %.
2. Mehrverdienst: F Steuer 500, Netto 1.500; U 400, Netto 1.600.
3. Keine Wirkungsdeutung oder Gegenprüfung für Fall A.
4. B: Käufer 1, Verkäufer 2 je verbleibendem Stück; der Verkäufer führt trotzdem 3 ab, also ist „Käufer unbelastet“ falsch.
5. Aufkommen 4.800, Käufer 1.600, Verkäufer 3.200, Menge minus 20 %. Höherer Käuferpreis mindert Kaufanreiz, niedrigerer Nettoerlös Bereitstellungsanreiz im gegebenen Fall.
6. Andere Ausweichmöglichkeiten können die Teilung ändern. Die verbliebenen Stücke messen weder verlorene Gewinne noch ganze Wohlfahrt; Kosten und verlorene Käufe fehlen.''',
 'A contains only correct figures, no independent distribution/incentive interpretation in any A answer. B is complete; numeric answers alone leave the essential A interpretation absent.'),
 ('conflicts',[4,4,4,4,0,0],'''1. Bund 50→40, Länder 35→28, Gemeinden 15→12; Ausfälle 10/7/3. Hohe Einkommen profitieren unmittelbar, niedrige nicht; Anreize sind behauptet, unveränderte Aufgaben noch nicht finanziert.
2. Bundesregierung vertritt Reform im Bundestag, Länder wirken im Bundesrat mit, Gemeinden weisen auf Dienstleistungen hin ohne eigenes Bundesratsveto. Einkommensverband verfolgt Entlastung, Beschäftigtenverband Betreuung/Bildung; Stellungnahmen beeinflussen, beschließen aber nicht.
3. Für mich hat gesicherte Betreuung Vorrang vor ungesicherter Entlastung; Gegenargument Leistungsanreiz. Nachgewiesene Kompensation oder zusätzliche Basis könnte mich umstimmen.
4. P Haushalte/Firmen 0/70 und Nahverkehr 70; H −70/70; F 0/0. Geldfluss ist kein gemessener Verkehrsnutzen.
5. Keine Interessen-, Anreiz- oder Konfliktanalyse für B.
6. Keine B-Empfehlung, Gegenposition oder Prüfinformation.''',
 'B supplies complete cash arithmetic but no independent group/objective conflict analysis. Complete A does not supply the missing second variation.'),
 ('instruments',[4,4,4,4,0,0],'''1. E direkte Einkommensteuer: Haushalt schuldet auf Einkommen; V indirekte Verbrauchsteuer: Verkäufer führt auf Nettokäufe ab, Käufer trägt laut Annahme. 20 % von Nettokäufen ist nicht 20 % Einkommen.
2. E 2.000/6.000 beide 10 % Einkommen; V 2.000/2.000 und 10/3⅓ %. Unter gleichen Käufen relativ höhere Last für niedrigen Haushalt, keine allgemeine Konsumregel.
3. 1.000 Einkommen lassen 900 netto; 100 Nettokäufe kosten 120. Finanzieller Kauf-/Arbeitsanreiz ändert sich, tatsächliche Wahl hängt auch von Präferenzen und Optionen ab.
4. G direkte Gewinnsteuer auf 100.000: 25.000; S indirekte Stücksteuer auf tatsächliche 9.000 Stück: 18.000. Gewinn ist nicht Umsatz/Stückzahl.
5. Keine wirtschaftliche Last-/Behauptungsprüfung für B.
6. Keine Anreiz- oder Verteilungsdeutung in B.''',
 'B only classifies bases and computes legal receipts, with no comparison of incidence/incentives. A is full; the two models are not substitutes for each other.'),
 ('fairness',[4,0,0,4,4,4],'''1. G A/B Steuer 3.600, nach Kosten 20.400/32.400; Bruttoquoten 10/10 %, angepasst 15/10 %. K 2.400/3.600, verbleibend 21.600/32.400; brutto 6⅔/10 %, angepasst 10/10 %. Aufkommen G 7.200, K 6.000.
2. Kein Kriterium in A angewandt.
3. Kein A-Urteil oder Gegenposition.
4. U L/H/N 200/1.000/0, Quoten 1⅔/1⅔/0 %, Summe1.200. P0/960/240, Quoten0/1,6/0,8 %, Summe1.200.
5. U knüpft an Nutzung an, aber N hat indirekten Nutzen und L fährt notwendig bei geringem Einkommen. P bevorzugt leistungsfähigere Einkommen, doch notwendige Kosten sind unbekannt; Nutzung und Fähigkeit konfligieren.
6. Ich bevorzuge P wegen L und indirektem Nutzen, Gegenposition U wegen sichtbarer Nutzung. Prüfen: reale unvermeidbare Kosten und Nutzen/Alternativen. Kilometer messen weder vollständigen Nutzen noch Zahlungsfähigkeit.''',
 'A has correct arithmetic but no justice application or counterweighing. Full B does not repair the entirely absent A performance.')]
for m,(slug,awards,answer,reason) in zip(M,negative_answers):
    raw=sum(awards);assert raw>=15
    works.append({'materialId':m['id'],'kind':'whole substantive omission counteranswer', 'wholeAnswer':answer,
                  'stepAwards':awards,'rawPoints':raw,'capApplied':True,'capReason':reason,'finalPoints':min(raw,14),'PASS':False})
partial_answers = [
 '''A: F4.500/12.000, Quoten15/20; U6.000/12.000. F entlastet hier niedrigere Einkommen. Mehrverdienst unter F500 Steuer/1.500 Netto versus U400/1.600; marginal liegt F höher trotz kleinerer Durchschnittsquote unten. Das beweist keine Mehrarbeit, Stundenwahl ist unbekannt.
B: Käufer1/Verkäufer2 pro verbleibendem Stück, Verkäufer remittiert3. Aufkommen4.800, Käuferlast1.600/Verkäufer3.200; höhere Käuferpreise und geringere Erlöse können Menge verringern, gegeben minus20 %. Andere Ausweichoptionen verändern Lasten; verlorene Käufe/Kosten fehlen. Ich ergänze keine ausführliche zweite Wohlfahrtsgrenze.''',
 '''A: Aufkommen40/28/12 nach50/35/15, Ausfälle10/7/3. Hohe Einkommen profitieren, Anreiz nicht nachgewiesen. Bundesregierung wirbt, Länder sichern Finanzierung im Bundesrat, Gemeinden können kein eigenes Bundesveto ausüben; Beschäftigtenverband schützt Betreuung, Einkommensverband fordert Entlastung, beide über Kontakte statt Gesetzgebung. Wegen Aufgaben zunächst Finanzierung verlangen, Entlastungsargument ernst nehmen; Kompensation könnte Entscheidung ändern.
B: P0/70 mitNahverkehr70, H−70/70, F0/0. Pauschale Rückzahlung erhält Grenzpreis; einheitenbezogene Firmenrückzahlung hebt ihr Signal auf. Haushalte/Industrie vertreten verschiedene Lasten über Stellungnahmen an Parteien/Abgeordnete. Ich bevorzuge P nur bei erreichbarem Verkehr; Gegenposition ist akute HaushaltshilfeH. Fehlende Qualität und mögliche sinkende Menge erfordern Prüfung. Konkurrenzargument nicht detailliert behandelt.''',
 '''A: Direkte EinkommensteuerE 2.000/6.000,10 % Einkommen; indirekteV aufNettokäufe2.000beide, Quoten10/3⅓ %. Verkäufer führt ab, Käufer trägt nur laut Annahme. 900nettoZusatzverdienst,120für100Nettokauf; Anreiz anders, Verhalten unbekannt.
B: G direkteGewinnsteuer25.000; S indirekteStücksteuer18.000 auf9.000. Käufer0,80=7.200, Verkäufer1,20=10.800 pro verbleibenderMenge, Firmaführt2ab. Indirekt heißt hiernichtvolleKäuferlast, direkteG kannvorgegebeneWeiterwirkungenhaben, ohneDatenunbekannt. S erhöhtPreis/senktErlös,Mengefällt10 %. GewinnänderungbrauchtnachSteuerauchKosten/Absatzverlust. KeineausführlichezweiteWohlfahrtsdeutung.''',
 '''A: G3.600je, verbleibend20.400/32.400; angepasst15/10 %. K2.400/3.600, verbleibend21.600/32.400; angepasstbeide10 %. K lässt1.200Einnahmenfehlen. GrossgleicheLageunterG, nachnotwendigerPflege hatAgeringereLeistungsfähigkeit. IchgewichteK, GegenpositioneinfachgleicheGrossbasisundFinanzierung; KostennachweiseundErsatzfinanzierungfehlen.
B: U200/1.000/0; P0/960/240, beide1.200. U nutzungsnah, N profitiertindirekt,Lfährtnotwendig. PberücksichtigtEinkommen/Allowance, misstFähigkeitohnenotwendigeKostenaberunvollkommen. IchbevorzugePbedingt, nehmeUAnreizernst; FahrtalternativenundN'sNutzenprüfen. QuotenundzweitegenaueGegenabwägungnichtvollständigausgeführt.''']
for m,answer in zip(M,partial_answers):
    awards=[3,3,2,3,3,3] if m!=M[-1] else [3,3,2,3,3,2]
    raw=sum(awards);assert raw>=15
    works.append({'materialId':m['id'],'kind':'imperfect genuine two-case partial work','wholeAnswer':answer,
                  'stepAwards':awards,'rawPoints':raw,'capApplied':False,'finalPoints':raw,'PASS':True,
                  'manualEvidence':'Both cases show concrete essential performance; incompleteness earns fair partial points, no perfection prerequisite.'})
assert len(works)==12
for m in M:
    assert sum(s['points'] for s in m['examData']['scoring']['steps'])==24
    assert m['examData']['reviewStatus']=='draft'
result={'role':'Actual author preparation only, not independent review or learner results','exactFractionArithmeticChecks':checks,
        'executedArithmeticCheckCount':len(checks),'wholeManualCounterworks':works,'wholeWorkCount':len(works),
        'manualRubricStepDecisionCount':sum(len(w['stepAwards']) for w in works),'foreignApproval':False,'humanApproval':False}
(OUT/'actual-author-tax-exact-fractions-and-twelve-whole-counterworks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'arithmeticChecksPASS':len(checks),'wholeWorksActuallyScored':len(works),'manualStepDecisions':72,
                  'negatives':[{ 'raw':w['rawPoints'],'final':w['finalPoints']} for w in works if not w['PASS']],
                  'partialPASS':[w['finalPoints'] for w in works if w['kind'].startswith('imperfect')], 'independentApproval':False}))
