import pathlib, json, re
O = pathlib.Path(__file__).resolve().parent
def load(name): return json.loads((O/name).read_text())
def save(name, value): (O/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')

# Only our independently authored explanations change. Bound Author objects stay exact.
own_keys = {'ownCompleteAnswerDe','ownCompleteAnswerEn','requiredMaterialBoundary',
 'authorSuccessorNeeded','taskDe','taskEn','expectedDe','expectedEn','targetedWrongInference',
 'atomicityReasonDe','atomicityReasonEn','memoryReasonDe','memoryReasonEn','ownAnswerDe','ownAnswerEn'}
def tidy(value):
 if isinstance(value, dict):
  for key, item in value.items():
   if key in own_keys and isinstance(item,str):
    item = re.sub(r'(?<=[^\W\d_])(?=\d)', ' ', item)
    item = re.sub(r'(?<=\d)(?=[^\W\d_])', ' ', item)
    item = re.sub(r'(?<=[,;:])(?=\S)', ' ', item)
    value[key] = item
   elif key not in {'sourceCaseObject','wholeGoalCandidate'}: tidy(item)
 elif isinstance(value,list):
  for item in value: tidy(item)
for name in ['actual-eight-whole-DEEN-cases-own-complete-answers-and-one-direction-finding.READONLY.review.json',
 'four-fresh-targeted-negative-transfer-cases-own-answers.READONLY.json',
 'four-whole-goal-individual-independent-A-and-M-decisions.NO-NATIVE-FINGERPRINTS.json']:
 value=load(name); tidy(value); save(name,value)

name='whole48BE-six-tasks-own-DEEN-solutions-prerequisites-and-coverage.READONLY.review.json'
x=load(name)
de=[
 'Beide Märkte mit 40 unabhängigen Anbietern sind nach der Anbieterzahl Polypole. Bei Schrauben begründen identische Ware, Preiskenntnis, kostenloser Wechsel und offener Eintritt, dass oberhalb des gegebenen Preises 2 kein Absatz bleibt. Cafés behalten wegen Differenzierung und Wechselaufwand bei Preis 3 noch 45 und bei Preis 4 noch 30 Becher Absatz: begrenzter eigener Preisspielraum. Austauschbare Leistungen und kostenloser Wechsel ergeben unter den gegebenen Informationsannahmen die vorgegebene horizontale Einzelanbieterlinie bei 3, keinen neu berechneten Marktpreis.',
 'Individuelle Punkte (q,p): (60,2), (45,3), (30,4), (15,5). Gesonderte Gesamtpunkte (Q,p): (1000,2), (900,3), (800,4), (700,5). Mengen dieses Cafés und des Gesamtmarkts erhalten getrennte Skalen und Einheiten; Menge horizontal, Preis vertikal. Die Einzelanbieterlinie bei p=3 ist horizontal, die Gesamtnachfrage fallend. In B: Nachfrage (80,8), (60,11), (40,14); Angebot (80,8), (100,11), (120,14); Schnitt (80,8). Unterschiedliche Änderungssituationen erlauben keine Multiplikation der Einzelkurve mit 40; konkrete Formen bleiben materialgebunden.',
 'Die drei Monopoloptionen ergeben bei Stückkosten 8 Gewinne von 0, 180 und 240. Unter diesen Optionen wählt der Anbieter p=14 und q=40; Konkurrenz liefert p=8 und Q=80. Eintrittsschutz und fehlende Alternativen ermöglichen den Mengenrückgang. Das Material nennt zusätzliche Geschäfte zwischen 40 und 80 mit Zahlungsbereitschaft mindestens 8, einige strikt darüber. Unter den gegebenen Kosten- und Effekteannahmen bleiben daher zumindest einige wechselseitig vorteilhafte Geschäfte aus. Das begründet einen bedingten Allokationsverlust; ein exakter Wohlfahrtsbetrag oder kontinuierliches Optimum ist nicht bestimmt.',
 'Einheitspreis 12: (12−2)×35−50=300. Einheitspreis 6: (6−2)×60−50=190. A6/B12: (6−2)×25+(12−2)×30−50=350. Der Vorteil gegenüber dem besten gegebenen Einheitspreis beträgt 50. Weiterverkauf mit der ausdrücklich vorgegebenen gemeinsamen Nachfrage bei effektivem Preis 6 ergibt 190. Ausschließlich zusätzliche Trennungskosten von 60 ergeben 290, also weniger als 300. Unterschiedliche Nachfrage und wirksame Trennung ermöglichen einen Vorteil; Kosten und Arbitrage können ihn beseitigen.',
 'Informationsfunktion: Bekannte Schraubenpreise ermöglichen einen Vergleich; Cafépreise müssen wegen Qualitäts- und Lageunterschieden interpretiert werden. Anreiz-/Lenkungsfunktion: Erreichbare Erlöse können Kapazität und Eintritt fördern, Preise Käufer zum Ausweichen bewegen, sofern Alternativen und Eintritt tatsächlich möglich sind. Rationierung über Zahlungsbereitschaft ist eine begründbare zweite Funktion, verspricht aber keinen fairen Zugang. Der geschützte Monopolpreis 14 kann Macht statt zusätzliche gesellschaftliche Leistung ausdrücken. Zwei Materialfunktionen decken den ganzen bestehenden 3bcb-Vertrag mit dem zusätzlichen Vergleich zentral gelenkter Ordnungen nicht ab.',
 'Aus QD=QS folgt p=25, Q=50. Höchstpreis 20: QD=60, QS=40, Nachfrageüberhang 20, höchstens 40 Verkäufe; niedriger Preis für Versorgte, geringere Gesamtmenge, unbekannte Zuteilung. Mindestpreis 30: QD=40, QS=60, Überschuss 20; Regierungskauf von 20 kostet 600 und überschreitet Budget 500. Private Versorgung 40 verfehlt Ziel 45. Produzentenerlös 1800 übertrifft 1250, beweist aber ohne Kosten keinen Gewinnanstieg; Lager-/Verwaltungskosten können hinzukommen. Das Diagramm zeigt horizontale Linien bei 20 und 30, zugehörige Mengen und Schnittpunkt (50,25). Jedes Ziel ist unter den vorausgesetzten Vollzugs- und Ankaufbedingungen getrennt zu beurteilen.'
]
en=[
 'Both forty-independent-seller markets are many-supplier by count. Homogeneous bolts, known prices, free switching and open entry eliminate sales above the supplied price 2. Differentiated cafés with switching effort retain 45 cups at price 3 and 30 at price 4, giving bounded own pricing scope. Interchangeability and free switching under the information assumptions give the supplied horizontal individual line at 3, not a newly calculated market price.',
 'Individual (q,p) points: (60,2), (45,3), (30,4), (15,5). Separate aggregate (Q,p) points: (1000,2), (900,3), (800,4), (700,5). Label distinct individual and aggregate quantities, with quantity horizontal and price vertical. The individual p=3 line is horizontal; aggregate demand falls. In B, demand (80,8), (60,11), (40,14) and supply (80,8), (100,11), (120,14) intersect at (80,8). Different change scenarios prohibit multiplying individual demand by 40. Shapes remain material-specific.',
 'The three monopoly options with unit cost 8 yield profits 0, 180 and 240, so the highest supplied option is 14/40. Competition gives 8/80. Entry protection and absent alternatives permit output restriction. Some additional trades between 40 and 80 have willingness to pay above cost 8. Under the stipulated cost and externality assumptions, mutually beneficial transactions are forgone. This supports a conditional allocative-loss mechanism, not an exact welfare amount or continuous optimum.',
 'Uniform price 12 yields 300; uniform price 6 yields 190. Separate A6/B12 yields 350, a gain of 50 over the best supplied uniform option. Transferable access with stipulated common-effective-price-6 demand yields 190. Extra separation cost 60 alone yields 290, below 300. Demand differences and enforceable separation permit gains, but arbitrage and costs can remove them.',
 'Information: Visible bolt prices support comparison, whereas café prices require interpreting quality/location. Incentives/allocation: Attainable receipts may motivate entry/capacity, and prices may motivate switching when entry and alternatives are available. Rationing by willingness to pay is an acceptable second function, without promising fair access. The protected monopoly price 14 can reflect power rather than extra social benefit. Two material-based functions do not cover the entire existing 3bcb contract, which also requires comparison with centrally directed systems.',
 'QD=QS gives price 25 and quantity 50. Ceiling 20 gives demand 60, supply 40, shortage 20 and at most 40 sales: lower recipient prices, fewer units and unknown allocation. Floor 30 gives demand 40, supply 60 and excess 20; public buying costs 600, above budget 500, while private service 40 fails target 45. Revenue 1800 exceeds 1250 but unknown costs leave profit open; storage/administration may add costs. Plot horizontal rules 20/30 with their quantities and equilibrium (50,25). Assess each goal separately under stipulated enforcement and full purchases.'
]
for i,t in enumerate(x['ownTaskAnswers']): t['ownAnswerDe']=de[i];t['ownAnswerEn']=en[i]
x['prerequisiteAndCoverageReasonDe']='Die vier neuen Ziele werden in Aufgaben 1/2/4/6 jeweils vollständig einschließlich Transfer und Begrenzung geprüft. Aufgabe 3 prüft den ganzen verengten 1826-Marktmachtvertrag. 3bcb ist fachliche Voraussetzung und wird in Aufgabe 5 teilweise geübt; der zusätzliche Ordnungsvergleich ist nicht gegeben, daher wird keine ganze Abdeckung behauptet. Die Diagrammgrundlage 50 ist über das Wahlziel erreichbar; Elastizität und Gesamtwohlfahrt des ganzen 50-Vertrags sind nicht vollständig abgedeckt. ec→273→8ad und 8820/646→ec tragen die Modellableitung, 2dea→50→3bcb die Interventionsanalyse. Kein NAIRU-/Tarifwissen wird als Voraussetzung eingeführt.'
x['prerequisiteAndCoverageReasonEn']='Tasks 1/2/4/6 cover each new goal’s whole contract including transfer and limits. Task 3 covers the narrowed whole 1826 market-power contract. Existing 3bcb is a prerequisite and partly practised in Task 5; its central-systems comparison is absent, so whole coverage is correctly not claimed. Existing 50 diagram foundations are reached through the selected intervention goal; its whole elasticity/total-surplus contract is not covered. ec→273→8ad and 8820/646→ec support model inference; 2dea→50→3bcb supports intervention analysis. No NAIRU/tariff gate is introduced.'
x['freshNegativeRubricProbeDe']='Eine Antwort mit sonst 40 rechnerisch erzielten Punkten, aber ohne jede Einzel-/Gesamtdiagrammleistung, erhält wegen vollständig fehlender Kernleistung höchstens 28. Eine Summe über der Bestehensgrenze 29 darf den Cap nicht umgehen. Ein einzelner Zeichen-/Rechenfehler innerhalb einer sonst tragfähigen Darstellung erlaubt dagegen Teilpunkte und löst den Cap nicht automatisch aus.'
x['freshNegativeRubricProbeEn']='An answer otherwise earning 40 marks but showing no individual/aggregate representation must be capped at 28. A sum above pass mark 29 cannot bypass an absent core performance. An isolated plotting/calculation error within otherwise sound representation allows partial credit and does not automatically trigger the cap.'
save(name,x)

name='four-fresh-targeted-negative-transfer-cases-own-answers.READONLY.json';x=load(name)
for n in x.get('cases',x.get('negativeCases',[])):
 if n.get('goalId')=='8820a8d9-605a-565b-bc13-1961a4df60ed': n['expectedDe']='Nein: Einzelpunkt (7,8), Gesamtpunkt (500,8), auf getrennten Skalen. Die Tabelle bestimmt Materialpunkte und erlaubte Verbindungen, keine universelle Knickform, Rivalenstrategie oder Extrapolation.'
save(name,x)
print('Only own review explanations made readable; bound Author objects preserved.')
