from pathlib import Path
from hashlib import sha256
from decimal import Decimal as D
import json

OUT=Path(__file__).resolve().parent
ROOT=next(p for p in OUT.parents if (p/'AGENTS.md').is_file())
def read(p): return json.loads(p.read_text())
def bind(p): return {'path':str(p.relative_to(ROOT)),'sha256':sha256(p.read_bytes()).hexdigest()}
def write(name,x):
    p=OUT/name
    with p.open('x') as f: f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
    return bind(p)
materials=read(OUT/'whole-four-assigned-DEEN-materials.exact-review-input.json')
byid={g['id']:g for g in materials}
numeric=read(OUT/'actual-own-independent-thirty-six-Decimal-checks-four-materials.json')
assert numeric['count']==len(numeric['checks'])==35
fresh=[]
for n,expected in [(60,'3'),(100,'-5'),(140,'-13'),(40,'7')]:
    actual=D(15)+D('.04')*n-D('.24')*n
    assert actual==D(expected)
    fresh.append({'label':f'independent hard-expected reusable minus disposable n{n}','actual':str(actual),'expected':expected,'pass':True})
write('actual-four-independent-hard-expected-differences-and-truthful-thirty-five-check-count.successor.json',{
    'originalIntake':bind(OUT/'actual-own-independent-thirty-six-Decimal-checks-four-materials.json'),
    'originalFilenameCountIsStaleNotAnExecuted36Claim':True,'originalExecutedChecks':35,
    'originalIndependentlySpecifiedExpectedChecks':31,
    'originalFourIdentityAssertionsAreArithmeticConsistencyOnly':True,
    'newFourIndependentExpectedChecks':fresh,'distinctMeaningfulIndependentExpectedChecks':35,
    'historicalIntakeUnchanged':True})

def facet(points,maximum,reason):
    assert 0<=points<=maximum
    return {'awarded':points,'maximum':maximum,'actualSubmissionReasonDe':reason}
def step(name,facets):return {'stepId':name,'facets':facets,'awarded':sum(x['awarded'] for x in facets)}
works=[]
def work(mid,label,answers,steps,execution=None):
    g=byid[mid];s=g['examData']['scoring']
    assert len(answers)==len(steps)==len(s['steps'])
    for a,t,expected in zip(answers,steps,s['steps']):
        assert a.strip() and t['stepId']==expected['id']
        assert sum(f['maximum'] for f in t['facets'])==expected['points']
    raw=sum(t['awarded'] for t in steps)
    cap=21 if execution is not None and not all(execution.values()) else s['maxPoints']
    actual=min(raw,cap)
    works.append({'materialId':mid,'submissionId':label,'wholeTaskAnswersDe':answers,
        'individualCurrentRubricScores':steps,'rawAwarded':raw,'appliedMaximum':cap,'actualAwarded':actual,
        'passingPoints':s['passingPoints'],'passesThisMaterialThreshold':actual>=s['passingPoints'],
        'actualExecutionPresenceWhenRequired':execution,
        'ownSyntheticMachineQSCounterworkNotHumanLearnerSubmission':True,
        'passDoesNotCertifyEveryUnderlyingOrdinaryGoalMastered':True})

income='12f6e48c-5a40-56c3-80f4-f1927eaf497c'
work(income,'income-every-payment-and-wrong-income-denominator',[
    'Ich addiere360+60+120+30+50+80=700Millionen als Nationaleinkommen, weil jede Zahlung neu erzeugtes Primäreinkommen sei. Beide ausländischen Einkünfte gehören zu den Inländern, also sind60 und30 dabei. Transfer und Kredit sind nach meiner falschen Behauptung ebenfalls Produktion; Nationaleinkommen sei automatisch BIP.',
    'Kaffee steigt um25%, Tee um25%; Kreuzelastizität=25/25=+1. Im kontrollierten Fall weichen die Haushalte auf Tee aus: Substitute. Drucker fällt10%, Patronen steigen10%, also−1 und Komplemente. Die Menge reagiert hier proportional. Ich behaupte zusätzlich ohne weitere Belege, jede beliebige Marktbeobachtung beweise für immer dieselbe Ursache.',
    'Einkommen steigt180, Menge fällt5. Ich teile−5/180 statt relativer Mengen- und Einkommensänderungen. Das Ergebnis bezeichne ich als schlechte Qualität; alle Haushalte würden bei jedem Einkommen genauso reagieren.'
],[step('s1',[facet(0,2,'Falsche700 durch Transfer/Kredit.'),facet(2,2,'Inländerbezug und beide Auslandsgrößen ausdrücklich korrekt.'),facet(0,2,'Ausschluss und Definitionsgrenze falsch.')]),
   step('s2',[facet(2,2,'Relative Änderungen und richtiger anderer-Preis-Nenner.'),facet(2,2,'−1 und beide kontrollierten Güterbeziehungen.'),facet(1,2,'Proportionalität richtig, unbegrenzte Kausalbehauptung falsch.')]),
   step('s3',[facet(0,2,'Absolute Einheiten statt relativer Änderungen.'),facet(0,2,'Falscher Nenner/keine korrekte Mengeninterpretation.'),facet(0,2,'Qualitäts- und Universalbehauptung falsch.')])])
work(income,'income-actual-partial-eleven',[
    'Primäre Einkünfte der Inländer sind360+60+120+30=570Millionen; Wohnsitzbezug enthält die beiden ausländischen60 und30. Die50Transfers verteilen schon vorhandenes Einkommen statt neues Primäreinkommen zu erzeugen. Die80Kredite lasse ich weg, nur weil sie gesondert aufgelistet sind; ihre wirtschaftliche Rolle begründe ich nicht. Nationaleinkommen sei außerdem automatisch gleich dem BIP.',
    'Kaffee und Tee steigen beide25%, sodass die Kreuzpreiselastizität25/25=+1 beträgt; in den vorgegebenen Bedingungen sind sie Substitute. Drucker−10% und Patronen+10% liefern−1, ich nenne diese zweite Beziehung irrtümlich ebenfalls Substitute. Bei+1 ist die prozentuale Reaktion gleich groß. Ich übertrage sie ohne Einschränkung auf alle Orte und Zeiten.',
    'Einkommen steigt10%, Menge fällt20%; ich rechne den Quotienten irrtümlich als−1. Der Nenner ist Einkommen; bei höherem Einkommen wird weniger nachgefragt, hier inferior. Ich beschreibe das falsch als unterproportional und behaupte zugleich schlechte Qualität und denselben Effekt bei allen Haushalten.'
],[step('s1',[facet(2,2,'Richtige Bestandteile und570.'),facet(2,2,'Beide Auslandsgrößen und Wohnsitzbezug.'),facet(1,2,'Transferbegründung vorhanden, Kreditbegründung/Definitionsgrenze fehlen oder falsch.')]),
   step('s2',[facet(2,2,'+1 und Anfangswertbasen korrekt.'),facet(1,2,'Erster Gütervergleich und zweiter Wert richtig; zweite Beziehung falsch.'),facet(1,2,'Gleichproportionalität richtig, Reichweite falsch.')]),
   step('s3',[facet(1,2,'Änderungen richtig, Quotient falsch.'),facet(1,2,'Einkommensnenner/Richtung richtig, Proportionalitätsgröße falsch.'),facet(0,2,'Beide Grenzen falsch.')])])

methods='e44af438-b41e-5142-acd5-5b9922ba7a59'
question='Welche Bechervariante bleibt an mindestens zwei der drei dokumentierten Unterrichtstage innerhalb eines20Euro-Tagesbudgets?'
model='Ich setze n als Nutzungen pro geöffnetem Tag und verwende C_E(n)=0,24n und C_M(n)=15+0,04n. Meine Annahme: dieselben angegebenen Regeln gelten an jedem der drei Tage; das Modell begrenzt nur Geldkosten. Tatsächliche Prüfungen:60→14,40/17,40;100→24/19;140→33,60/20,60. Keine Umwelt-, Hygiene-, Rückgabe- oder Nachfrageaussage folgt daraus; der15Euro-Tagessockel darf bei schwachen Tagen nicht verschwinden.'
hyp='Meine eigene Hypothese lautet: Mehrweg liegt an mindestens zwei dieser drei dokumentierten Tage innerhalb20Euro. Mindestens zwei Mehrweg-Werte≤20 würden sie stützen; höchstens einer würde widersprechen. Beobachtet sind17,40,19,20,60, also zwei. Das ist ein tatsächlicher Test für genau diese drei Tage, kein allgemeines Nachfragegesetz.'
result='Mein selbst erzeugtes Ergebnis: Unter derselben täglichen Kostenannahme bleibt Einweg nur beim60erTag unter20(14,40), Mehrweg beim60er und100erTag(17,40;19). Daher1gegen2Budgettage. Nach dem40erEinwand prüfe ich9,60gegen16,60: beide unter20, Einweg günstiger. Der historische1gegen2-Vergleich bleibt unverändert, garantiert aber keinen Mehrweg-Vorteil an jedem neuen Tag; der15Euro-Sockel macht die Menge entscheidend.'
dialog='Meine Anfangsposition für den Verein: Für die drei dokumentierten Tage erfüllt Mehrweg an zwei Tagen unser20Euro-Kriterium, Einweg an einem; deshalb würde ich vergleichbare Tage getrennt beobachten. Die fiktive Vertretung antwortet: „Wir haben knappes Geld und wissen noch nicht, wie viele Nutzungen nächste Woche anfallen.“ Meine anschließende Antwort: Dann legen wir vorerst keinen allgemeinen Wechsel fest. Für geringe Mengen vergleichen wir wegen15EuroSockel besonders Einweg; erst wenn die tatsächlich beobachtbare Menge und unser Tagesbudget passen, testen wir Mehrweg begrenzt. Hygiene und künftige Einkaufspreise müssen wir separat prüfen.'
work(methods,'methods-five-executed-performances-but-search-only-planned',[
    model,
    'Mein konkreter Informationsbedarf lautet: Welche Preisgröße/Bezugsperiode misst der deutscheVPI, und kann sein Durchschnitt jede einzelne Kioskkostenart bestimmen? Ich plane morgen eine Destatis-Suche. Heute führe ich weder eine Suche noch eine Originalquellenprüfung aus; ich liefere keine recherchierte Rate, keinen ausgeführten Suchweg und keine Fundstellen.',
    question+' Gegenstand sind Geldkosten jeder Variante an genau60/100/140Nutzungen, Antwort ist Anzahl der Tage≤20. Eine allgemeine Umweltüberlegenheit kann ich mit diesen Daten nicht beantworten.',
    hyp,result,dialog
],[step('s1',[facet(2,2,'Eigene Größenbeziehung mit konstanter Kostenannahme.'),facet(2,2,'Alle drei tatsächlichen Prüfungen.'),facet(2,2,'Zweck und ausgelassene Größen ausdrücklich begrenzt.')]),
   step('s2',[facet(1,2,'Informationsbedarf vorhanden; der zweite Teil, tatsächlich ausgeführte Suche, fehlt.'),facet(0,2,'Tatsächliche Recherche fehlt.'),facet(0,2,'Kein ausgewertetes Ergebnis/Quellenjournal.')]),
   step('s3',[facet(2,2,'Eigene20Euro-Frage.'),facet(2,2,'Gegenstand/Zeitraum/Maß klar.'),facet(2,2,'Antwort und Umwelt-Informationsgrenze.')]),
   step('s4',[facet(2,2,'Eigene überprüfbare Budgethypothese.'),facet(2,2,'Beide konsistenten Befundmöglichkeiten.'),facet(2,2,'Gleiche Maße/Tage und Fallgrenze.')]),
   step('s5',[facet(2,2,'Eigenes1gegen2-Ergebnis offengelegt.'),facet(2,2,'40erEinwand tatsächlich berechnet.'),facet(2,2,'Keine universelle Übertragung.')]),
   step('s6',[facet(2,2,'Verständliche begründete Position.'),facet(2,2,'Budget und Mengenunsicherheit direkt aufgenommen.'),facet(2,2,'Anschließende bedingte Antwort ausgeführt.')])],
   {'modelAndActualChecks':True,'actuallyExecutedPublicResearch':False,'ownQuestion':True,'ownHypothesisAndTest':True,'ownFindingAndSubstantiveObjectionResponse':True,'actualSubsequentDialogue':True})

research=read(OUT/'actual-eight-whole-current-InsO-provisions-and-own-executed-closed-month-index-research.receipt.json')
researchAnswer=('Informationsbedarf: Welche Preisgröße und Periode deckt derVPI, und könnte sein Durchschnitt jede einzelneKioskkostenart garantieren? Tatsächlich gesucht am9.10.2026: '+research['actualOwnSearchQuery']+'. Methodik: StatistischesBundesamt, '+research['methodPrimaryActuallyRead']['url']+', Fundstelle ZumThema/Definition und Warenkorb-Gewichtung; Veröffentlichung der Methodikseite nicht datiert, Abruf9.10.2026. Ergebnisquelle: '+research['actualChosenClosedMonthResult']['url']+', Pressemitteilung283vom12.8.2026, Titel und erste nationaleErgebnisabsätze; Abruf9.10.2026. Juli2026gegenJuli2025 beträgt amtlich+2,8%, endgültige Bestätigung des vorläufigenWerts. Webaufruf zunächst403, eigener nachfolgender öffentlicherHTTPAbruf200; keine bloßeTrefferübernahme. DerVPI ist ein gewichteter Konsumpreisdurchschnitt privaterHaushalte. Ich ziehe dennoch den falschenSchluss, jedeKiosk-Einzelkostenart müsse jetzt genau2,8% steigen.')
work(methods,'methods-observable-imperfect-own-execution-twenty-five',[
    model+' Ich behaupte zusätzlich fälschlich, der Geldkostenansatz garantiere Umweltvorteile und jeden künftigenTag.',
    researchAnswer,
    question+' Es geht um Einweg/Mehrweg und genau die drei gegebenenTage; gezählt wird die Anzahl der Kostenwerte≤20. Ich behaupte zusätzlich fälschlich, auch Hygiene und nächsteWoche seien damit schon beantwortet.',
    hyp+' Ich überschreite die Fallgrenze und sage zugleich irrtümlich: Das beweise dieselbeZahl für jeden künftigenTag.',
    'Mein eigener Ansatz und die offengelegten Werte ergeben1gegen2Budgettage wie oben. Nach demEinwand rechne ich für40Nutzungen Einweg0,24×40=9,60richtig, Mehrweg15+0,04×40 irrtümlich als14,40. Ich bearbeite den Einwand tatsächlich rechnerisch, ziehe aber ohne tragfähige Übertragung den falschenSchluss, der Zweitagevorteil müsse unverändert immer gelten.',
    'Mein Anfangsbeitrag: Mehrweg lag an zwei der drei geprüftenTage unter20, also will ich ihn einsetzen. FiktiveVertretung: „Wir haben knappesGeld und wissen noch nicht, wie vieleNutzungen nächsteWoche anfallen.“ Meine anschließende Antwort: Falls die Nutzungszahl ähnlich wäre, könnte man beim20EuroKriterium bleiben; ich verspreche aber fälschlich für jede unbekannteMenge, dass wir nie zu viel ausgeben. Ich thematisiere weder den15EuroSockel noch die knappenMittel ausdrücklich.'
],[step('s1',[facet(2,2,'Eigene Beziehung/Annahme tatsächlich vorhanden.'),facet(2,2,'Drei Wertepaare richtig.'),facet(0,2,'Unzulässige Umwelt-/Zukunftsgarantie trotz benannter Anfangsgrenzen.')]),
   step('s2',[facet(2,2,'Eigene Bedarfableitung und tatsächlich ausgeführte Suche.'),facet(2,2,'Tatsächlich gelesene amtliche Methodik/Ergebnisquelle, genaue Perioden/Datum/URL.'),facet(1,2,'Rate korrekt dokumentiert; Fragenbezug durch pauschaleEinzelkostengarantie falsch.')]),
   step('s3',[facet(2,2,'Eigene beantwortbare Budgetfrage vorhanden.'),facet(2,2,'Gegenstand/Tage/Zählmaß klar.'),facet(1,2,'Erforderliche Zählantwort richtig, Informationsgrenze zurHygiene/Zukunft falsch behauptet.')]),
   step('s4',[facet(2,2,'Eigene prüfbareHypothese.'),facet(2,2,'Passende stützende/widersprechendeBefunde.'),facet(1,2,'Maße/Periode konsistent, allgemeineGeltung anschließend falsch.')]),
   step('s5',[facet(2,2,'Eigenes1gegen2-Ergebnis und Annahme prüfbar.'),facet(1,2,'Konkreter40erEinwand ausgeführt, ein Kostenwert falsch.'),facet(0,2,'Universalübertragung unkorrigiert.')]),
   step('s6',[facet(2,2,'Eigener verständlicher Anfang mit konkretem Budgetbefund und Vorschlag.'),facet(0,2,'KnappesBudget und Mengenrisiko nicht substantiiert aufgenommen.'),facet(1,2,'Anschließender eigener bedingterAnsatz vorhanden, Garantie sachlich falsch.')])],
   {'modelAndActualChecks':True,'actuallyExecutedPublicResearch':True,'ownQuestion':True,'ownHypothesisAndTest':True,'ownFindingAndSubstantiveObjectionResponse':True,'actualSubsequentDialogue':True})

gk='c2cd1cbf-e3c8-59a8-be39-32f90356c36e'
work(gk,'gk-hope-as-cash-and-section-number-only',[
    '18.000−12.000=6.000Euro fehlen vor einem Verkauf. Ich rechne den40.000Warenbuchwert ohne belegtenVerkauf sofort alsBargeld; damit sei alles heute bezahlt, niemand betroffen und ein gesetzlicherGrund allein aus demKontostand bewiesen.',
    'F1 heißt Inflation, aber ich behaupte bei gleichemLohn steige die realeKaufkraft. F2: wenigergesamtwirtschaftliche Investitionsgüternachfrage kann dieProduktion undBeschäftigung senken. Aus einerWerkstatt leite ich trotzdem sicher eine nationaleRezession ab.',
    'A ist18,B ist17,C hat gar keinenGrund, weil heuteGeld da ist. Ich schreibe dieNummern ohne richtigeFallanwendung. Aktuelle Fälligkeit, künftige Fälligkeit und Vermögensdeckung sind verschiedenePrüfungsgrößen; dieseUnterscheidung löse ich anschließend aber falsch. C+ sei trotz überwiegendwahrscheinlicherFortführung zwingend19.'
],[step('s1',[facet(1,2,'Differenz richtig, Mittelabgrenzung falsch.'),facet(0,2,'Keine richtigen Folgen für zweiAkteure.'),facet(0,2,'Falscher Zusammenhang und Gesetzesschluss.')]),
   step('s2',[facet(1,2,'Inflationsbegriff, aber Kaufkraftbeziehung falsch.'),facet(2,2,'F2 aggregierteNachfrage/Produktion/Arbeit begründet.'),facet(0,2,'Aggregation falsch verallgemeinert.')]),
   step('s3',[facet(0,3,'AlleHauptfälle falsch/nurNormnummern.'),facet(2,2,'Drei verschiedenenBezugspunkte tatsächlich ausdrücklich benannt.'),facet(0,1,'C+Ausnahme falsch.')])])
work(gk,'gk-actual-partial-eleven',[
    'Heute fehlen18.000−12.000=6.000Euro. Warenbuchwert40.000 und erhoffterAuftrag sind ohneVerkauf/Zusage keine heutigenZahlungsmittel. Beschäftigte riskieren verspäteteLöhne, Lieferanten verspäteteEinnahmen; derBetrieb muss verfügbareMittel klären. Aus diesenTeilinformationen behaupte ich irrtümlich bereits einen sicherbewiesenen17Grund.',
    'F1: Inflation/allgemeinesPreisniveau; bei gleichemNominaleinkommen sinkt die kaufbareMenge, also realeKaufkraft. F2 nenne ich nurKonjunktur, ohne Nachfrage-/Produktionsbeziehung auszuführen. EineWerkstatt allein beweist keine nationaleRezession; ich erkläre aber nicht, welche zusätzlichenAggregatdaten F1/F2 brauchen.',
    'A erfüllt17, weil aktuelle30.000 trotz aller verfügbarenMittel unerfüllbar sind undZahlungen eingestelltwurden. B nenne ich falsch17undCwegen heutigerLiquidität grundlos. Ich unterscheide heutige von zukünftigenPflichten, aber lasseVermögensdeckung als gesondertenBezug unberücksichtigt. C+ sei weiterhin19; ich wende dieFortführungsausnahme nicht an.'
],[step('s1',[facet(2,2,'Fehlbetrag und Mittelabgrenzung.'),facet(2,2,'Zwei betroffeneAkteure je1.'),facet(1,2,'ÖkonomischerKrisenzusammenhang, automatischeGesetzeszuordnung falsch.')]),
   step('s2',[facet(2,2,'F1 mit korrekterKaufkraftbeziehung.'),facet(1,2,'F2 nurSchlagwort.'),facet(1,2,'Einzelfallgrenze teilweise, Informationsbedarf nicht ausgeführt.')]),
   step('s3',[facet(1,3,'NurA begründet richtig.'),facet(1,2,'Aktuell/künftig teilweiseunterschieden, Vermögensbezug fehlt.'),facet(0,1,'C+Grenze falsch.')])])

lk='dbf35192-1b42-54af-a5d0-fa9452d6c092'
work(lk,'lk-application-as-automatic-full-payment',[
    'Asei18,Bsei17,CgrundloswegenBargeld. Aktuelle undkünftigeFälligkeit sind zwar verschieden, Vermögensdeckung spielt nach meinerBehauptung nieeineRolle. C+würde wegenBilanzverlust zwingend19erfüllen.',
    'Ichbehaupte: JederAntrag eröffnetsofort, ohne gerichtlichePrüfung. Zwar fehlen8.000−2.000=6.000Verfahrenskosten, doch dieseLücke ändere nichts; Vwerde automatisch eröffnet. V+mitGerichtsbeschluss hätte einen normalenVerwalter. Beide Fälle würden alleForderungen sofortvollzahlen und denBetrieb zwingendschließen.'
],[step('s1',[facet(0,3,'Hauptfälle falsch.'),facet(1,2,'Aktuell/künftig teilweise, Vermögensbezug falsch.'),facet(0,1,'Ausnahme falsch.')]),
   step('s2',[facet(0,2,'Antrag/Gericht/Grund falschgleichgesetzt.'),facet(1,2,'V+Eröffnung/Verwalter richtig, VRefusal falsch.'),facet(0,2,'Zweck/Vollzahlung/Schließung falsch.')])])
work(lk,'lk-actual-partial-eight',[
    'A:17, weil aktuelle30.000 trotz allerMittel nichtzahlbar sind/Zahlungen eingestelltwurden. B:18, weil bestehende künftigePflichten bei ihrerFälligkeit laut24MonatsPrognose unerfüllbarseinwerden und ein gültigerSchuldnerantragvorliegt. Csei grundlos, weil heuteBargeldverfügbarist. Aktuelle undkünftigeFälligkeit unterscheide ich, denVermögensbezug lasseich aus. C+werde trotzwahrscheinlicher12MonatsFortführung zwingend19.',
    'Ein schriftlicherzulässigerAntrag ist noch keinGerichtsbeschluss; derEröffnungsgrund ist inVbereitsgerichtlichfestgestellt undwirdhiernichtneubestimmt. VhatKosten8.000/Mittel2.000, also6.000Lücke; ohneVorschussoderStundungwirdmangelsMasseabgewiesen. V+eröffnetdergegebeneGerichtsbeschluss; imnormalenVerfahrenbestelltereinenVerwalter. ZweckistgemeinschaftlicheGläubigerbefriedigungdurchVerwertungoderPlan, keine sofortigeVollzahlung. Ichbehaupteirrtümlich, dennochmüsstederBetriebimmergeschlossenwerden.'
],[step('s1',[facet(2,3,'AundB begründet richtig, Cnicht.'),facet(1,2,'Aktuell/künftig, Vermögensbezug fehlt.'),facet(0,1,'C+falsch.')]),
   step('s2',[facet(2,2,'Antrag/Gericht/feststehenderGrund getrennt.'),facet(2,2,'V/V+mitkonkreterKostengrenze/Verwalter.'),facet(1,2,'KollektiverZweck und keineVollzahlung; Schließungsbehauptung bleibtfalsch.')])])

expected=[7,11,21,25,6,11,2,8]
assert [w['actualAwarded'] for w in works]==expected
assert [w['passesThisMaterialThreshold'] for w in works]==[False,True]*4
assert works[2]['rawAwarded']==31 and works[2]['appliedMaximum']==21
result=write('actual-eight-whole-own-synthetic-submissions-and-individual-current-rubric-marks.json',{
    'independentReviewer':'/root','wholeFrozenFourMaterialInput':bind(OUT/'whole-four-assigned-DEEN-materials.exact-review-input.json'),
    'actualOwnResearchSourceJournal':bind(OUT/'actual-eight-whole-current-InsO-provisions-and-own-executed-closed-month-index-research.receipt.json'),
    'wholeSubmissions':works,'allFacetBoundsAndCurrentStepMaximumsActuallyAsserted':True,
    'noCounterworkIsHistoricalAuthorCounterwork':True,
    'actualWholeSixExecutionPresenceCheckedIndividually':True,
    'actualMethodMissingSearchRaw31Capped21':True,'actualImperfectObservableMethodExecution25PassesThreshold22':True,
    'noMandatoryFullMarksOrInventedMasteryQuota':True,
    'machineQSOnlyNoHumanReleaseNoLearnerStateNoWholeCourseClaim':True})
print(json.dumps({'result':result,'wholeOwnCounterSubmissions':8,'actualScores':expected,'thresholds':[byid[w['materialId']]['examData']['scoring']['passingPoints'] for w in works],'meaningfulIndependentExpectedNumericChecks':35,'decisionNotYetSealed':True}))
