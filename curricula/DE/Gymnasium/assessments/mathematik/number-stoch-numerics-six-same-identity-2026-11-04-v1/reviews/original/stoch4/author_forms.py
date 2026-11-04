import copy,hashlib,json,pathlib,textwrap
H=pathlib.Path(__file__).resolve().parent
BASE='curricula/DE/Gymnasium/assessments/mathematik/stoch-numeric-four-same-identity-2026-11-04-v1'
forms=[]
COMMON_DE='''# Eine Gesamtbewertung

Es gibt genau eine Gesamtpunktzahl aus 20 BE und ein binäres Gesamtergebnis:
**bestanden ab 15 BE**, sonst nicht bestanden. Teilpunkte sind keine eigenen
Bestehensgrenzen.

Bewerte mathematisch gleichwertige Verfahren und nachvollziehbare Leistungen
unabhängig vom Ort in der Abgabe. Identische Leistungen zählen nur einmal.
Teilpunkte wie angegeben, sonst 0,5 BE für eine fachlich sinnvolle, aber
unvollständige Teilleistung. Bei Kriterien mit 2 oder mehr BE sind entsprechende
Teilpunkte für richtig gezeigte Schritte möglich. Ein lokaler Rechen- oder
Übertragungsfehler wird nicht mehrfach bestraft; richtige nachvollziehbare
Folgearbeit bleibt anrechenbar. Ein solcher lokaler Fehler allein löst keine
Gesamtpunktkappung aus. Knappe richtige Erklärungen und äquivalente Schreibweisen
genügen; bestimmte Schlüsselwörter oder eine feste Reihenfolge sind nicht nötig.
'''
COMMON_EN='''# One overall assessment

There is one total score out of 20 points and one binary overall result:
**pass at 15 points or more**, otherwise not passed. Part allocations are
not separate pass thresholds.

Credit mathematically equivalent methods and traceable work wherever they
appear in the submission. Count the same performance only once. Award partial
credit as specified, otherwise 0.5 points for meaningful incomplete work.
For criteria worth 2 or more points, proportionate credit for correct steps
is available. Do not repeatedly penalise one local arithmetic or copying error;
credit correct traceable follow-through. Such a local error alone does not
trigger a total-score cap. Concise correct explanations and equivalent notation
are sufficient; no prescribed keywords or fixed order are required.
'''
def clean(s):return textwrap.dedent(s).strip()+'\n'
def add(gid,taskde,tasken,solde,solen,steps,capde,capen,identity):
 ctx=json.loads((H/gid/'current-context.json').read_text());g=ctx['currentGoal'];out=H/gid
 steps=[{'id':s[0],'points':s[1],'description':s[2],'descriptionEn':s[3]} for s in steps]
 rd=COMMON_DE+'\n| Kriterium | BE |\n|---|---:|\n'+''.join('| '+s['description']+' | '+str(s['points'])+' |\n' for s in steps)+'\n'+capde+'\n\nMehrere zutreffende Kappungsgründe führen weiterhin nur zur selben Obergrenze von 14 BE. Es bleibt bei einer Gesamtbewertung ohne zusätzliche Teilbestehensbedingungen.\n'
 re=COMMON_EN+'\n| Criterion | Points |\n|---|---:|\n'+''.join('| '+s['descriptionEn']+' | '+str(s['points'])+' |\n' for s in steps)+'\n'+capen+'\n\nMultiple applicable cap reasons still give the same upper limit of 14 points. There is one overall assessment without additional part pass conditions.\n'
 contents={'task.de.md':clean(taskde),'task.en.md':clean(tasken),'solution.de.md':clean(solde),'solution.en.md':clean(solen),'rubric.de.md':rd,'rubric.en.md':re}
 for name,content in contents.items():(out/name).write_text(content)
 ex={'reviewStatus':'draft','taskContent':contents['task.de.md'],'taskContentEn':contents['task.en.md'],'solutionContent':contents['solution.de.md']+'\n'+rd,'solutionContentEn':contents['solution.en.md']+'\n'+re,'coveredGoalIds':[gid],'coveredStrands':g.get('dimensionTags',{}).get('guidingIdeas',[]),'demandLevels':[g['dimensionTags']['demandLevel']],'scoring':{'maxPoints':20,'passingPoints':15,'steps':steps},'sourceArtifactPath':BASE+'/'+gid+'/reviewed-execution-contract.json','reviewNote':'Private complete bilingual same-identity author proposal. Independent content review is pending; no approval, integration, M7 or host acceptance is claimed. One 20-point overall score, pass at 15, with the proposed core-competence overall cap. Only this stable goal ID is assessed; existing preparation and source/scope semantics remain unchanged.'}
 prop=copy.deepcopy(g);prop.update(nodeKind='exam',examData=ex)
 rec={'status':'PRIVATE_WHOLE_FORM_DRAFT_PENDING_GENUINE_INDEPENDENT_REVIEW','goalId':gid,'wholeCurrentGoal':g,'wholeProposedGoal':prop,'exactChangedTopLevelFields':['nodeKind','examData'],'wholeDescriptionsRequiresSourcesApplicabilityDimensionsAndOtherOriginalFieldsUnchanged':True,'assessedCoverage':[gid],'noPreparationCoverageClaim':True,'singleOverallScore':{'maxPoints':20,'passingPoints':15,'criticalOverallCap':14},'wholeIdentity':identity,'noSourceScopeOrCountryDecision':True,'noMasteryWrite':True}
 (out/'reviewed-execution-contract.json').write_text(json.dumps(ex,ensure_ascii=False,indent=2)+'\n');(out/'whole-contract.before-after.json').write_text(json.dumps(rec,ensure_ascii=False,indent=2)+'\n');forms.append(rec)

add('455ef29a-7194-5c5a-b832-1c27fcbf2516',r'''
# Eine Exponentialverteilung als Wartezeitmodell nutzen

An einer automatischen Ausgabestelle wird die Wartezeit $T$ bis zur nächsten
Ausgabe in Minuten durch eine Exponentialverteilung mit $\lambda=0{,}25$
pro Minute modelliert. Für dieses Modell gilt
$$P(T>t)=e^{-0{,}25t}\quad(t\geq0).$$
Die Formel darf verwendet werden; sie muss nicht auswendig gewusst werden.
Zeige Ansätze und deute Ergebnisse im Kontext. Runde Wahrscheinlichkeiten auf
vier Dezimalstellen. Insgesamt sind **20 BE** erreichbar.

**1. Das stetige Modell einordnen (4 BE)**

Erkläre, welche Werte $T$ annehmen kann und was $P(T>3)$ beschreibt.
Vergleiche $P(T=3)$ mit $P(2<T\leq3)$ und erläutere den Unterschied
zwischen einem einzelnen Wert und einem Zeitintervall im stetigen Modell.

**2. Mit dem Modell rechnen (6 BE)**

Bestimme die Wahrscheinlichkeit einer Wartezeit von höchstens zwei Minuten
und die Wahrscheinlichkeit einer Wartezeit von mehr als zwei bis höchstens
sechs Minuten. Bestimme außerdem die Zeit $t_{90}$, bis zu der mit
Wahrscheinlichkeit $0{,}90$ eine Ausgabe erfolgt ist.

**3. Eine Modelleigenschaft untersuchen (6 BE)**

Eine Person wartet bereits seit fünf Minuten. Bestimme unter dieser Bedingung
die Wahrscheinlichkeit, noch mehr als drei weitere Minuten zu warten.
Vergleiche sie mit der Wahrscheinlichkeit, zu Beginn mehr als drei Minuten
warten zu müssen. Erkläre die Modelleigenschaft in Worten.
Beurteile außerdem die Behauptung: „Nach vier Minuten muss die Ausgabe
spätestens erfolgt sein.“ Begründe mit einer Wahrscheinlichkeit.

**4. Die Modellwahl prüfen (4 BE)**

Nenne eine zur Ausgabestelle passende Annahme, unter der ein solches
Wartezeitmodell plausibel ist. Nach einer technischen Änderung werden
Ausgaben spätestens alle vier Minuten erzwungen. Beurteile, ob dasselbe
Exponentialmodell diese neue Situation genau beschreiben kann. Begründe
anhand einer Modelleigenschaft und benenne eine Grenze der Modellierung.
''',r'''
# Use an exponential distribution as a waiting-time model

At an automated collection point, the waiting time $T$ until the next release,
in minutes, is modelled by an exponential distribution with $\lambda=0.25$
per minute. The model satisfies
$$P(T>t)=e^{-0.25t}\quad(t\geq0).$$
You may use this formula; it need not be recalled from memory.
Show your setups and interpret results in context. Round probabilities to four
decimal places. A total of **20 points** is available.

**1. Interpret the continuous model (4 points)**

Explain the possible values of $T$ and what $P(T>3)$ describes.
Compare $P(T=3)$ with $P(2<T\leq3)$ and explain the distinction between
one value and a time interval in a continuous model.

**2. Calculate with the model (6 points)**

Find the probability of waiting at most two minutes and the probability of
waiting more than two but at most six minutes. Also find the time $t_{90}$
by which a release has occurred with probability $0.90$.

**3. Investigate a model property (6 points)**

Someone has already waited five minutes. Under this condition, find the
probability of waiting more than three additional minutes. Compare it with
the probability, at the start, of waiting more than three minutes. Explain
the model property in words.
Also assess the claim: “The release must have occurred after four minutes
at the latest.” Justify your answer with a probability.

**4. Evaluate the model choice (4 points)**

State an assumption appropriate to the collection point under which this
waiting-time model is plausible. After a technical change, releases are
forced at least once every four minutes. Assess whether the same exponential
model can describe the new situation exactly. Justify your answer using a
model property and state a limitation of the modelling.
''',r'''
# Musterlösung: Exponentielle Wartezeiten

**1. Stetige Wartezeit**

Es gilt $T\geq0$; das Modell erlaubt jede nichtnegative reelle Wartezeit und
hat keine endliche obere Grenze. $P(T>3)$ ist die Wahrscheinlichkeit,
dass nach drei Minuten noch keine Ausgabe erfolgt ist.
Ein einzelner Wert hat Wahrscheinlichkeit $P(T=3)=0$. Dagegen ist
$$P(2<T\leq3)=e^{-0{,}5}-e^{-0{,}75}\approx0{,}1342>0.$$
Ein stetiges Modell verteilt Wahrscheinlichkeit auf Intervalle, nicht auf
einzelne Zeitpunkte. Messwerte mit endlicher Genauigkeit stehen praktisch
für kleine Intervalle; Wahrscheinlichkeit null heißt hier nicht, dass eine
beobachtete Wartezeit nie als „3 Minuten“ angegeben werden darf.

**2. Wahrscheinlichkeiten und Quantil**

$$P(T\leq2)=1-e^{-0{,}5}\approx0{,}3935,$$
$$P(2<T\leq6)=e^{-0{,}5}-e^{-1{,}5}\approx0{,}3834.$$
Aus $1-e^{-0{,}25t_{90}}=0{,}90$ folgt
$$t_{90}=\frac{\ln(10)}{0{,}25}\approx9{,}21\text{ Minuten}.$$
Das ist eine 90-Prozent-Grenze, keine sichere maximale Wartezeit.

**3. Bereits verstrichene Zeit**

$$P(T>8\mid T>5)=\frac{P(T>8)}{P(T>5)}
=\frac{e^{-2}}{e^{-1{,}25}}=e^{-0{,}75}\approx0{,}4724.$$
Dies ist gleich $P(T>3)$. Im Modell beeinflusst die bisherige Wartezeit die
Verteilung der weiteren Wartezeit nicht (Gedächtnislosigkeit). Das ist eine
Aussage über das Modell, keine Garantie für jede reale Ausgabestelle.
Die Vier-Minuten-Behauptung ist falsch: $P(T>4)=e^{-1}\approx0{,}3679$.
Das Modell lässt also mit positiver Wahrscheinlichkeit längere Wartezeiten zu.

**4. Modellannahme und Grenze**

Plausibel ist beispielsweise ein zeitlich gleichbleibender zufälliger
Ausgabemechanismus, bei dem das Ausbleiben bisheriger Ausgaben die Chance
im nächsten kurzen Zeitabschnitt nicht verändert. Die erzwungene Ausgabe
spätestens nach vier Minuten widerspricht $P(T>4)>0$ und der unbegrenzt
möglichen Wartezeit. Dasselbe Modell beschreibt diese neue Situation daher
nicht genau. Es müsste angepasst werden; auch zuvor war die konstante
Ausgabechance nur eine zu prüfende Annahme. Gleichwertige konkrete Annahmen
und fachlich passende Modellgrenzen sind anzuerkennen.
''',r'''
# Worked solution: exponential waiting times

**1. Continuous waiting time**

We have $T\geq0$: the model allows every nonnegative real waiting time and
has no finite upper bound. $P(T>3)$ is the probability that no release
has occurred after three minutes.
One value has probability $P(T=3)=0$, whereas
$$P(2<T\leq3)=e^{-0.5}-e^{-0.75}\approx0.1342>0.$$
A continuous model assigns probability to intervals, rather than individual
times. Measurements of finite precision represent small intervals in
practice; zero probability here does not forbid reporting an observed
waiting time as “3 minutes”.

**2. Probabilities and quantile**

$$P(T\leq2)=1-e^{-0.5}\approx0.3935,$$
$$P(2<T\leq6)=e^{-0.5}-e^{-1.5}\approx0.3834.$$
Solving $1-e^{-0.25t_{90}}=0.90$ gives
$$t_{90}=\frac{\ln(10)}{0.25}\approx9.21\text{ minutes}.$$
This is a 90-percent bound, not a certain maximum waiting time.

**3. Time already elapsed**

$$P(T>8\mid T>5)=\frac{P(T>8)}{P(T>5)}
=\frac{e^{-2}}{e^{-1.25}}=e^{-0.75}\approx0.4724.$$
This equals $P(T>3)$. In this model, the time already spent waiting does
not affect the distribution of the remaining waiting time (memorylessness).
This is a property of the model, not a guarantee for every real collection
point. The four-minute claim is false: $P(T>4)=e^{-1}\approx0.3679$.
Thus the model assigns positive probability to longer waits.

**4. Assumption and limitation**

One plausible assumption is a time-homogeneous random release mechanism,
where the absence of earlier releases does not alter the chance during the
next short time interval. A forced release within four minutes contradicts
$P(T>4)>0$ and the unbounded waiting time. The same model therefore cannot
describe the new situation exactly and needs adjustment. Even before the
change, the constant release chance was an assumption requiring scrutiny.
Credit equivalent concrete assumptions and suitable model limitations.
''',[
('continuous-model',4,'Nichtnegativen, nach oben unbeschränkten Wertebereich beschrieben (1); P(T>3) kontextuell gedeutet (1); Einzelwertwahrscheinlichkeit null von positiver Intervallwahrscheinlichkeit unterschieden und stetig erklärt (2).','Describes the nonnegative unbounded range (1); interprets P(T>3) in context (1); distinguishes zero probability for one value from positive interval probability and explains continuity (2).'),
('probabilities',6,'P(T≤2) mit Ansatz und Ergebnis (2); P(2<T≤6) mit Differenzansatz und Ergebnis (2); 90-Prozent-Zeit durch Gleichung und Lösung mit Einheit (2).','Sets up and finds P(T≤2) (2); sets up the difference and finds P(2<T≤6) (2); uses an equation to find the 90-percent time with unit (2).'),
('memoryless-property',6,'Bedingte Wahrscheinlichkeit mit richtiger Bezugsbedingung berechnet (3); Gleichheit mit P(T>3) erkannt und verbleibende Wartezeit kontextuell erklärt (2); sichere Vier-Minuten-Grenze durch positive Restwahrscheinlichkeit widerlegt (1).','Calculates the conditional probability using the correct condition (3); identifies equality with P(T>3) and explains the remaining waiting time in context (2); refutes a certain four-minute bound using positive tail probability (1).'),
('model-critique',4,'Konkrete passende Modellannahme erläutert (2); erzwungene Vier-Minuten-Grenze anhand einer Modelleigenschaft als Widerspruch erkannt und nötige Anpassung bzw. Modellgrenze benannt (2).','Explains a concrete appropriate model assumption (2); uses a model property to identify the contradiction with the forced four-minute bound and states the need for adjustment or a model limitation (2).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine fachlich tragfähige Bestimmung einer Wahrscheinlichkeit mit dem gegebenen stetigen Modell oder keine kontextbezogene Erläuterung einer zentralen Modelleigenschaft erkennbar ist. Ein korrekter Wahrscheinlichkeitsansatz mit lokalem Rechenfehler genügt als Bestimmungsleistung; eine Erläuterung kann etwa die stetige Intervallwahrscheinlichkeit, die verbleibende Wartezeit oder die fehlende feste Obergrenze betreffen. Keine bestimmte Eigenschaft muss als isolierte Teilprüfung bestanden werden.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no sound determination of a probability using the given continuous model, or no contextual explanation of a key model property. A correct probability setup with a local arithmetic error demonstrates determination; an explanation may concern continuous interval probability, remaining waiting time, or the absence of a fixed upper bound. No particular property is a separate part pass requirement.',
{'competence':'Exemplarische vollständige Verwendung einer weiteren stetigen Verteilung: Wartezeitmodell, zugehörige Wahrscheinlichkeiten und zentrale Modelleigenschaften im Kontext.','memory':'Formula supplied. No mandatory new recall/deck.','scope':'Original further-distribution example; no obligation to master every continuous distribution.','coverage':'Own stable curricular ID only; normal-approximation prerequisite is preparation, not assessed coverage.'})

add('5b54f272-f588-5009-8b42-eb15f846d3e2',r'''
# Relative Streuung einer Binomialverteilung

Für $X\sim B(n;p)$ mit $n\geq1$ und $0<p<1$ ist die relative Streuung
(der Variationskoeffizient) $v=\sigma/\mu$. Du darfst
$\mu=np$ und $\sigma=\sqrt{np(1-p)}$ verwenden.
Zeige deine Rechenschritte und Begründungen. Insgesamt sind **20 BE** erreichbar.

**1. Zwei Umfänge vergleichen (6 BE)**

Unabhängige Versuche haben jeweils Trefferwahrscheinlichkeit $p=0{,}20$.
Berechne Erwartungswert, Standardabweichung und relative Streuung der
Trefferzahl für $n=100$ und für $n=400$. Deute, warum die absolute
Standardabweichung dabei größer, die relative Streuung aber kleiner sein kann.

**2. Den Zusammenhang begründen (6 BE)**

Leite aus den gegebenen Kenngrößen
$$v=\sqrt{\frac{1-p}{np}}$$
her. Begründe damit, warum $v$ bei festem $p$ mit wachsendem $n$
abnimmt. Beschreibe, welchen Einfluss eine Vervierfachung von $n$ hat.

**3. Einen Umfang bestimmen (4 BE)**

Bestimme bei unverändertem $p=0{,}20$ den kleinsten ganzzahligen
Versuchsumfang, für den $v\leq0{,}05$ gilt. Prüfe deine Grenze mit
dem gefundenen Umfang und mit dem unmittelbar kleineren.

**4. Die Bedingung „festes p“ prüfen (4 BE)**

Eine Person behauptet: „Eine größere Versuchszahl bedeutet immer eine
kleinere relative Streuung, auch wenn sich die Trefferwahrscheinlichkeit
ändert.“ Prüfe die Aussage anhand von $B(100;0{,}50)$ und
$B(400;0{,}01)$. Formuliere die richtige Reichweite des Abnahmezusammenhangs.
''',r'''
# Relative dispersion of a binomial distribution

For $X\sim B(n;p)$ with $n\geq1$ and $0<p<1$, relative dispersion
(the coefficient of variation) is $v=\sigma/\mu$. You may use
$\mu=np$ and $\sigma=\sqrt{np(1-p)}$.
Show your calculations and reasoning. A total of **20 points** is available.

**1. Compare two numbers of trials (6 points)**

Independent trials each have success probability $p=0.20$.
Calculate the expected number of successes, its standard deviation and its
relative dispersion for $n=100$ and $n=400$. Interpret how the absolute
standard deviation can increase while relative dispersion decreases.

**2. Justify the relationship (6 points)**

Use the given parameters to derive
$$v=\sqrt{\frac{1-p}{np}}.$$
Use it to justify why $v$ decreases as $n$ grows when $p$ is fixed.
Describe the effect of multiplying $n$ by four.

**3. Find a number of trials (4 points)**

Keeping $p=0.20$, find the smallest integer number of trials such that
$v\leq0.05$. Check the boundary using this value and the preceding integer.

**4. Examine the condition “fixed p” (4 points)**

Someone claims: “A larger number of trials always means smaller relative
dispersion, even if the success probability changes.” Test this claim using
$B(100;0.50)$ and $B(400;0.01)$. State the correct scope of the decreasing
relationship.
''',r'''
# Musterlösung: Relative Binomialstreuung

**1. Vergleich**

Bei $n=100$ gilt $\mu=20$, $\sigma=\sqrt{16}=4$ und $v=4/20=0{,}20$.
Bei $n=400$ gilt $\mu=80$, $\sigma=\sqrt{64}=8$ und $v=8/80=0{,}10$.
Die absolute Standardabweichung verdoppelt sich, der Erwartungswert
vervierfacht sich. Gemessen am Erwartungswert ist die Streuung daher nur
noch halb so groß. Die Trefferzahl streut absolut stärker, relativ schwächer.

**2. Allgemeine Begründung**

Da $np>0$, darf man durch $np$ teilen und schreiben:
$$v=\frac{\sqrt{np(1-p)}}{np}
=\sqrt{\frac{np(1-p)}{n^2p^2}}
=\sqrt{\frac{1-p}{np}}
=\sqrt{\frac{1-p}{p}}\,\frac1{\sqrt n}.$$
Bei festem $0<p<1$ ist der erste Faktor positiv und konstant.
$1/\sqrt n$ nimmt mit wachsendem $n$ streng ab, also auch $v$.
Für denselben Wert von $p$ gilt $v(4n)=v(n)/2$.

**3. Mindestumfang**

$$\sqrt{\frac{0{,}8}{0{,}2n}}\leq0{,}05
\quad\Longleftrightarrow\quad\frac4n\leq0{,}0025
\quad\Longleftrightarrow\quad n\geq1600.$$
Der kleinste ganzzahlige Umfang ist $1600$.
Die Probe liefert $v(1600)=0{,}05$ und
$v(1599)=2/\sqrt{1599}\approx0{,}050016>0{,}05$.
Zusammen mit der strengen Abnahme ist die Minimalität gezeigt.

**4. Veränderliches p**

Für $B(100;0{,}50)$ ist $v=\sqrt{0{,}5/(100\cdot0{,}5)}=0{,}10$.
Für $B(400;0{,}01)$ ist
$v=\sqrt{0{,}99/(400\cdot0{,}01)}\approx0{,}4975$.
Trotz größerem $n$ ist die relative Streuung hier größer. Die pauschale
Behauptung ist falsch; die bewiesene Abnahme gilt für festgehaltenes $p$
im angegebenen Bereich $0<p<1$. Es werden keine zusätzlichen Randfälle
außerhalb dieses Bereichs verlangt.
''',r'''
# Worked solution: relative binomial dispersion

**1. Comparison**

For $n=100$, $\mu=20$, $\sigma=\sqrt{16}=4$, and $v=4/20=0.20$.
For $n=400$, $\mu=80$, $\sigma=\sqrt{64}=8$, and $v=8/80=0.10$.
The absolute standard deviation doubles while the expected value quadruples.
Thus dispersion measured relative to the expected value halves. The number
of successes varies more in absolute terms but less in relative terms.

**2. General justification**

Since $np>0$, division by $np$ is valid and gives
$$v=\frac{\sqrt{np(1-p)}}{np}
=\sqrt{\frac{np(1-p)}{n^2p^2}}
=\sqrt{\frac{1-p}{np}}
=\sqrt{\frac{1-p}{p}}\,\frac1{\sqrt n}.$$
When $0<p<1$ is fixed, the first factor is positive and constant.
$1/\sqrt n$ strictly decreases as $n$ increases, so $v$ does too.
For the same $p$, $v(4n)=v(n)/2$.

**3. Minimum number of trials**

$$\sqrt{\frac{0.8}{0.2n}}\leq0.05
\quad\Longleftrightarrow\quad\frac4n\leq0.0025
\quad\Longleftrightarrow\quad n\geq1600.$$
The smallest integer number of trials is $1600$.
Checking gives $v(1600)=0.05$ and
$v(1599)=2/\sqrt{1599}\approx0.050016>0.05$.
Together with strict decrease, this establishes minimality.

**4. Changing p**

For $B(100;0.50)$, $v=\sqrt{0.5/(100\cdot0.5)}=0.10$.
For $B(400;0.01)$,
$v=\sqrt{0.99/(400\cdot0.01)}\approx0.4975$.
Relative dispersion is larger despite larger $n$. The unrestricted claim
is false; the proved decrease requires a fixed $p$ in the specified range
$0<p<1$. No additional boundary cases outside that range are required.
''',[
('binomial-values',6,'Für n=100 und n=400 jeweils μ und σ korrekt (je 1, insgesamt 2); zugehörige relative Streuungen 0,20 und 0,10 mit Quotient berechnet (je 1, insgesamt 2); absoluten Anstieg gegenüber relativem Rückgang kontextuell erklärt (2).','Correct μ and σ for n=100 and n=400 (1 per pair, 2 total); calculates the corresponding ratios 0.20 and 0.10 (1 each, 2 total); explains the absolute increase versus relative decrease in context (2).'),
('fixed-p-derivation',6,'Quotient aus μ und σ angesetzt und zur Wurzelform hergeleitet (3); Abnahme mit wachsendem n bei festem p nachvollziehbar begründet (2); Halbierung bei Vervierfachung erkannt (1).','Sets up the ratio from μ and σ and derives the square-root form (3); justifies decrease with growing n at fixed p (2); identifies halving when n quadruples (1).'),
('minimum-n',4,'Ungleichung fachlich richtig angesetzt und umgeformt (2); kleinstes ganzzahliges n=1600 ermittelt (1); Grenze und unmittelbaren Vorgänger passend geprüft (1).','Sets up and transforms the inequality correctly (2); finds the smallest integer n=1600 (1); checks the boundary and preceding integer (1).'),
('fixed-p-condition',4,'Relative Streuung beider vorgegebenen Verteilungen korrekt berechnet (je 1); größere relative Streuung trotz größerem n als Gegenbeispiel ausgewertet (1); festes p als Bedingung der Abnahme präzisiert (1).','Calculates relative dispersion for both given distributions (1 each); uses larger dispersion despite larger n as a counterexample (1); states fixed p as the condition for the decrease (1).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine fachlich tragfähige Berechnung der relativen Streuung als σ/μ oder keine nachvollziehbare Begründung ihrer Abnahme mit n bei festem p erkennbar ist. Rechnerische oder allgemeine Ansätze an beliebiger Stelle zählen; ein lokaler Rechenfehler bei richtigem Quotienten löst die Kappung nicht aus. Ein fehlender Randfall außerhalb 0<p<1 und ein Fehler allein im Gegenbeispielteil sind keine Kappungsgründe.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no sound calculation of relative dispersion as σ/μ, or no justified decrease with n at fixed p. Numerical or general reasoning anywhere in the submission counts; a local arithmetic error in a correct ratio does not trigger the cap. Missing boundary cases outside 0<p<1, and an error confined to the counterexample part, are not cap reasons.',
{'competence':'Vollständige Originalroutine: relative Binomialstreuung berechnen und Abnahme bei festem p zeigen.','domain':'n>=1 and 0<p<1 unchanged. No new boundary competence.','memory':'mu and sigma supplied; ratio is derived and applied, no new deck.','coverage':'Own stable curricular ID only; prerequisite parameter calculations are used without separate coverage claim.'})

add('58fda9b4-4336-5594-99ce-722c4a453372',r'''
# Eine Differenzialgleichung zweiter Ordnung qualitativ untersuchen

Die Auslenkung $y(t)$ eines idealisierten Schwingers wird für $t\geq0$
durch $y''(t)=-4y(t)$ beschrieben. Die Zeit $t$ wird in Sekunden, die
Auslenkung in Zentimetern angegeben; der Faktor $4$ hat die Einheit
$\mathrm{s}^{-2}$. Es gelten $y(0)=2$ und $y'(0)=0$.
Es wird **kein allgemeines Lösungsverfahren** verlangt. Nutze die gegebenen
Funktionen, ihre Ableitungen und qualitative Überlegungen. Insgesamt sind
**20 BE** erreichbar.

**1. Die Gleichung deuten (4 BE)**

Erkläre, warum dies eine Differenzialgleichung zweiter Ordnung ist.
Deute $y'$ und $y''$ im Modell. Beschreibe für positive, negative und
verschwindende Auslenkung die Richtung beziehungsweise den Wert der
Beschleunigung. Warum wirkt die Beschleunigung rückstellend?

**2. Typische Lösungskandidaten prüfen (6 BE)**

Gegeben sind $u(t)=2\cos(2t)$, $v(t)=2\cos(4t)$ und $w(t)=2e^{-2t}$.
Prüfe durch Ableiten und Einsetzen, welche dieser Funktionen die
Differenzialgleichung und beide Anfangsbedingungen erfüllt. Erkläre
auch bei den anderen Kandidaten konkret, welche Bedingung scheitert.

**3. Den Verlauf beschreiben (6 BE)**

Nutze den passenden Kandidaten aus Teil 2. Beschreibe oder skizziere
seinen Verlauf von $t=0$ bis $t=\pi$ mit den Auslenkungen bei
$0$, $\pi/4$, $\pi/2$, $3\pi/4$ und $\pi$.
Gib Amplitude und Periodendauer an. Erläutere an einer Umkehrstelle und
an einem Durchgang durch die Ruhelage den Unterschied zwischen
Auslenkung, Geschwindigkeit und Beschleunigung. Ist die Geschwindigkeit
bei Auslenkung null ebenfalls zwingend null?

**4. Einen zweiten periodischen Prozess vergleichen (4 BE)**

Für einen anderen Schwinger ist $z''=-9z$ und als Lösungskandidat
$z(t)=\cos(3t)$ gegeben. Prüfe die Gleichung und beschreibe den typischen
Verlauf. Bestimme die Periodendauer und vergleiche sie mit der aus Teil 3.
''',r'''
# Investigate a second-order differential equation qualitatively

For $t\geq0$, the displacement $y(t)$ of an idealised oscillator satisfies
$y''(t)=-4y(t)$. Time $t$ is measured in seconds and displacement in
centimetres; the factor $4$ has unit $\mathrm{s}^{-2}$.
The initial conditions are $y(0)=2$ and $y'(0)=0$.
**No general solution method** is required. Use the supplied functions,
their derivatives, and qualitative reasoning. A total of **20 points**
is available.

**1. Interpret the equation (4 points)**

Explain why this is a second-order differential equation. Interpret $y'$
and $y''$ in the model. Describe the direction or value of the acceleration
for positive, negative and zero displacement. Why is the acceleration
restoring?

**2. Check typical candidate solutions (6 points)**

Consider $u(t)=2\cos(2t)$, $v(t)=2\cos(4t)$ and $w(t)=2e^{-2t}$.
Differentiate and substitute to check which function satisfies the equation
and both initial conditions. For each other candidate, identify specifically
which condition fails.

**3. Describe the behaviour (6 points)**

Use the appropriate candidate from part 2. Describe or sketch its behaviour
from $t=0$ to $t=\pi$, including the displacements at
$0$, $\pi/4$, $\pi/2$, $3\pi/4$ and $\pi$.
State amplitude and period. At a turning point and at a crossing of the
equilibrium position, explain the distinction between displacement,
velocity and acceleration. Must velocity also be zero when displacement
is zero?

**4. Compare a second periodic process (4 points)**

Another oscillator satisfies $z''=-9z$, with candidate solution
$z(t)=\cos(3t)$. Check the equation and describe the typical behaviour.
Find the period and compare it with the period in part 3.
''',r'''
# Musterlösung: Qualitative Untersuchung zweiter Ordnung

**1. Bedeutung**

Die höchste vorkommende Ableitung ist $y''$, also ist die Gleichung von
zweiter Ordnung. $y'$ ist die Geschwindigkeit, $y''$ die Beschleunigung.
Für $y>0$ ist $y''<0$, für $y<0$ ist $y''>0$, für $y=0$ ist $y''=0$.
Bei nichtverschwindender Auslenkung zeigt die Beschleunigung zur Ruhelage:
Sie ist rückstellend. Sie hat nicht stets dieselbe Richtung wie die
Geschwindigkeit.

**2. Kandidaten**

Für $u$ gilt $u'=-4\sin(2t)$ und $u''=-8\cos(2t)=-4u$.
Außerdem $u(0)=2$ und $u'(0)=0$: Alle Bedingungen sind erfüllt.
Für $v$ ist $v'=-8\sin(4t)$ und $v''=-32\cos(4t)=-16v$,
also nicht $-4v$. Die beiden Anfangsbedingungen erfüllt $v$ zwar,
aber bereits bei $t=0$ sind $v''(0)=-32$ und $-4v(0)=-8$ verschieden.
Für $w$ gilt $w'=-4e^{-2t}$ und $w''=8e^{-2t}=4w$.
Damit scheitert die Gleichung; außerdem ist $w'(0)=-4$ statt $0$.
$w(0)=2$ allein genügt nicht.

**3. Periodischer Verlauf**

Die Auslenkungen an den genannten Stellen sind $2,0,-2,0,2$ cm.
Der Verlauf beginnt am positiven Maximum, fällt durch die Ruhelage zum
negativen Minimum und steigt über die Ruhelage zum positiven Maximum zurück.
Die Amplitude beträgt $2$ cm, die Periodendauer $\pi$ s.
Bei $t=0$ gilt $y=2$, $y'=0$, $y''=-8$ (mit den jeweils passenden
Einheiten cm, cm/s, cm/s²). Dies ist eine Umkehrstelle mit Beschleunigung
zur Ruhelage. Bei $t=\pi/4$ gilt $y=0$, $y'=-4$, $y''=0$.
Die Geschwindigkeit ist dort nicht null: Der Schwinger durchquert die
Ruhelage und wird dort in diesem Augenblick nicht beschleunigt.
Bei $t=\pi/2$ folgt entsprechend $y=-2$, $y'=0$, $y''=8$.
Eine korrekte Skizze mit Erläuterung oder ein anderer passender Umkehrpunkt
und Ruhelagedurchgang zeigt dieselbe Leistung.

**4. Zweiter Verlauf**

$z'=-3\sin(3t)$ und $z''=-9\cos(3t)=-9z$.
Der Verlauf ist ebenfalls sinusförmig und periodisch, mit Amplitude $1$ cm
und Start am positiven Maximum. Die Periode ist $2\pi/3$ s und damit
kürzer als $\pi$ s. Der zweite Schwinger durchläuft eine volle Schwingung
in zwei Dritteln der Zeit des ersten. Eine allgemeine Lösungsfamilie ist
für keine der beiden Gleichungen erforderlich.
''',r'''
# Worked solution: qualitative second-order investigation

**1. Meaning**

The highest derivative present is $y''$, so the equation is second order.
$y'$ is velocity and $y''$ is acceleration. If $y>0$, then $y''<0$;
if $y<0$, then $y''>0$; if $y=0$, then $y''=0$.
At nonzero displacement, acceleration points towards equilibrium and is
therefore restoring. It need not point in the direction of the velocity.

**2. Candidates**

For $u$, $u'=-4\sin(2t)$ and $u''=-8\cos(2t)=-4u$.
Also $u(0)=2$ and $u'(0)=0$, so all conditions hold.
For $v$, $v'=-8\sin(4t)$ and $v''=-32\cos(4t)=-16v$,
which is not $-4v$. Both initial conditions hold, but already at $t=0$,
$v''(0)=-32$ differs from $-4v(0)=-8$.
For $w$, $w'=-4e^{-2t}$ and $w''=8e^{-2t}=4w$.
The equation fails, and $w'(0)=-4$ instead of $0$ as well.
The fact that $w(0)=2$ is not sufficient.

**3. Periodic behaviour**

The displacements at the listed times are $2,0,-2,0,2$ cm.
The graph starts at the positive maximum, falls through equilibrium to the
negative minimum, then rises through equilibrium to the positive maximum.
Amplitude is $2$ cm and period is $\pi$ s.
At $t=0$, $y=2$, $y'=0$, $y''=-8$ (in cm, cm/s, and cm/s² respectively).
This is a turning point with acceleration towards equilibrium.
At $t=\pi/4$, $y=0$, $y'=-4$, $y''=0$.
Velocity is not zero: the oscillator crosses equilibrium with zero
instantaneous acceleration. At $t=\pi/2$, correspondingly,
$y=-2$, $y'=0$, $y''=8$.
A correct sketch with explanation, or another suitable turning point and
equilibrium crossing, demonstrates the same performance.

**4. Second behaviour**

$z'=-3\sin(3t)$ and $z''=-9\cos(3t)=-9z$.
This solution is also sinusoidal and periodic, with amplitude $1$ cm and
a start at the positive maximum. Its period is $2\pi/3$ s, shorter than
$\pi$ s. The second oscillator completes a cycle in two thirds of the
time of the first. No general solution family is required for either
equation.
''',[
('qualitative-equation',4,'Zweite Ordnung über höchste Ableitung erkannt (1); Geschwindigkeit und Beschleunigung richtig zugeordnet (1); Vorzeichen bzw. Nullwert und Rückstellrichtung fachlich erklärt (2).','Identifies second order from the highest derivative (1); correctly interprets velocity and acceleration (1); explains the signs or zero value and restoring direction (2).'),
('candidate-checks',6,'u durch passende Ableitungen, Gleichung und beide Anfangsbedingungen bestätigt (2); v mit konkretem Gleichungswiderspruch trotz passender Anfangswerte verworfen (2); w mit konkretem Gleichungswiderspruch bzw. unpassender Anfangsgeschwindigkeit verworfen (2).','Confirms u with appropriate derivatives, equation and both initial conditions (2); rejects v with a specific equation mismatch despite matching initial values (2); rejects w with a specific equation mismatch or incorrect initial velocity (2).'),
('periodic-behaviour',6,'Wertefolge und typischen Verlauf richtig beschrieben oder skizziert (2); Amplitude und Periodendauer korrekt (je 1); Umkehrstelle und Ruhelagedurchgang hinsichtlich Auslenkung, Geschwindigkeit und Beschleunigung unterschieden, einschließlich nichtverschwindender Geschwindigkeit bei y=0 (2).','Correctly describes or sketches the values and typical behaviour (2); correct amplitude and period (1 each); distinguishes a turning point and equilibrium crossing in displacement, velocity and acceleration, including nonzero velocity at y=0 (2).'),
('second-process',4,'z durch zweite Ableitung als Lösung bestätigt (2); periodischen typischen Verlauf mit Periode 2π/3 und kürzerer Periodendauer beschrieben (2).','Confirms z as a solution using its second derivative (2); describes its typical periodic behaviour with period 2π/3 and shorter cycle time (2).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine fachlich tragfähige qualitative Verknüpfung von Differenzialgleichung und Beschleunigungsrichtung beziehungsweise Krümmung oder kein zutreffend beschriebener typischer periodischer Lösungsverlauf erkennbar ist. Qualitative Aussagen und passende Skizzen an beliebiger Stelle zählen. Ein lokaler Ableitungs-, Vorzeichen- oder Zahlenfehler bei ansonsten tragfähiger qualitativer Untersuchung löst die Kappung nicht aus. Eine allgemeine Lösungsmethode, eine vollständige Lösungsfamilie und eine zusätzliche nichtperiodische Gleichung sind keine Bestehensanforderungen.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no sound qualitative connection between the equation and acceleration direction or curvature, or no correctly described typical periodic solution behaviour. Qualitative reasoning and suitable sketches anywhere in the submission count. A local derivative, sign or numerical error in an otherwise sound qualitative investigation does not trigger the cap. A general solution method, complete solution family, and additional nonperiodic equation are not pass requirements.',
{'competence':'Einfache DG zweiter Ordnung qualitativ untersuchen und typische Lösungsverläufe exemplarisch periodischer Prozesse beschreiben.','boundary':'No general second-order solver, characteristic equation or complete solution-family requirement.','prereparation':'Original first-order-solving prerequisite retained unchanged; derivative candidates supplied for this qualitative task.','coverage':'Own stable curricular ID only; supplied derivative routines do not assert prerequisite coverage.'})

add('619f29f5-7f44-5654-9692-01b250997d52',r'''
# Ein numerisches Vorgehen dokumentieren und rückblickend bewerten

Gesucht ist eine Näherung der Lösung von $x+e^x=4$ in $[1,2]$.
Für $f(x)=x+e^x-4$ darfst du voraussetzen: $f$ ist stetig und streng
wachsend. Die Näherung soll zunächst höchstens $0{,}0005$ vom tatsächlichen
Lösungswert abweichen.

Zur Wahl stehen Intervallhalbierung oder ein numerischer Gleichungslöser.
Bei der **Intervallhalbierung** wertet man den Mittelpunkt eines Intervalls
mit verschiedenen Funktionsvorzeichen aus und behält die Hälfte mit
Vorzeichenwechsel. Bei einem beliebigen gefundenen Intervall $[a,b]$ mit
Vorzeichenwechsel hat der Mittelpunkt einen Fehler von höchstens $(b-a)/2$.
Diese Angaben dürfen verwendet werden. Ein spezieller Lösealgorithmus muss
nicht auswendig gewusst werden. Folgende Funktionswerte stehen als geprüfte
Rechenhilfe zur Verfügung (Rundungsfehler jeweils kleiner als $10^{-7}$):

| $x$ | $f(x)$ näherungsweise |
|---:|---:|
| 1 | -0,2817182 |
| 2 | 5,3890561 |
| 1,5 | 1,9816891 |
| 1,25 | 0,7403430 |
| 1,073 | -0,0028612 |
| 1,074 | 0,0010644 |
| 1,0737 | -0,0001136 |
| 1,0738 | 0,0002790 |

Insgesamt sind **20 BE** erreichbar. Schreibe ein knappes, für eine andere
Person nachvollziehbares Prüfprotokoll. Du darfst die Tabelle, einen
Taschenrechner oder ein digitales Werkzeug nutzen.

**1. Gewählte Vorgehensweise dokumentieren (6 BE)**

Wähle eine der beiden Vorgehensweisen und notiere Zielgleichung, Suchbereich,
Genauigkeitsziel, Methode und einen konkreten Grund für deine Wahl.
Dokumentiere die Durchführung: Bei Intervallhalbierung zeige die ersten
zwei Halbierungsschritte ab $[1,2]$; bei einem Gleichungslöser notiere
reproduzierbar die Eingabe mit Suchbereich beziehungsweise Startwert
und den erhaltenen Näherungswert. Falls du kein Werkzeug verwendest,
kannst du die Intervallhalbierung vollständig mit der Tabelle beginnen.

**2. Ergebnis und Genauigkeit belegen (6 BE)**

Nutze geeignete Werte aus der Tabelle für eine unabhängige Eingrenzung.
Gib eine Näherung mit begründeter absoluter Fehlergrenze an, die das
Genauigkeitsziel erfüllt. Erkläre, warum genau eine Lösung im betrachteten
Intervall liegt. Eine beliebig lange Dezimalausgabe allein ist kein Fehlerbeleg.

**3. Grenzen benennen (4 BE)**

Eine Person schreibt ohne weitere Kontrolle den Löserwert
$1{,}073728937556$ ab und behauptet, alle gezeigten Stellen seien damit
belegt. Bewerte diesen Nachweis. Benenne zwei konkrete Grenzen deiner
gewählten Vorgehensweise oder ihrer Dokumentation und erkläre jeweils,
wie sie sich auf die Verlässlichkeit beziehungsweise den Aufwand auswirken.

**4. Die Entscheidung im Nachhinein bewerten (4 BE)**

Bewerte anhand deines tatsächlichen Protokolls, ob deine Wahl für das
ursprüngliche Genauigkeitsziel zweckmäßig war. Die geforderte absolute
Fehlergrenze wird nun auf $0{,}00005$ verschärft. Zeige mit der Tabelle
eine passende neue Eingrenzung und Näherung. Erkläre, welche Ergänzung
oder Änderung deines ursprünglichen Vorgehens dafür nötig ist.
''',r'''
# Document a numerical method and evaluate the decision afterwards

Find an approximation to the solution of $x+e^x=4$ in $[1,2]$.
For $f(x)=x+e^x-4$, you may assume that $f$ is continuous and strictly
increasing. Initially, the approximation must differ from the actual
solution by at most $0.0005$.

Choose between bisection and a numerical equation solver.
In **bisection**, evaluate the midpoint of an interval whose endpoint values
have different signs and keep the half with a sign change. For any bracket
$[a,b]$ with a sign change, its midpoint has error at most $(b-a)/2$.
You may use this information. No particular solution algorithm needs to be
recalled from memory. The following checked values are available as a
calculation aid (rounding error less than $10^{-7}$ in each case):

| $x$ | approximate $f(x)$ |
|---:|---:|
| 1 | -0.2817182 |
| 2 | 5.3890561 |
| 1.5 | 1.9816891 |
| 1.25 | 0.7403430 |
| 1.073 | -0.0028612 |
| 1.074 | 0.0010644 |
| 1.0737 | -0.0001136 |
| 1.0738 | 0.0002790 |

A total of **20 points** is available. Write a brief verification record
that another person can follow. You may use the table, a calculator or a
digital tool.

**1. Document the chosen method (6 points)**

Choose one method and record the equation, search interval, accuracy target,
method, and a concrete reason for your choice. Document its execution:
for bisection, show the first two bisection steps from $[1,2]$; for a solver,
record reproducible input with a search interval or initial value and the
returned approximation. Without a tool, you can start bisection entirely
using the table.

**2. Support the result and accuracy (6 points)**

Use suitable table values for an independent bracket. Give an approximation
with a justified absolute error bound meeting the accuracy target. Explain
why there is exactly one solution in the interval considered. An arbitrarily
long decimal output alone is not an error certificate.

**3. State limitations (4 points)**

Someone copies the solver output $1.073728937556$ without further checking
and claims that all displayed digits are thereby justified. Evaluate this
evidence. State two concrete limitations of your chosen method or its
documentation, explaining how each affects reliability or effort.

**4. Evaluate the decision afterwards (4 points)**

Use your actual record to evaluate whether your choice was appropriate for
the original accuracy target. The required absolute error bound is then
tightened to $0.00005$. Use the table to show a suitable new bracket and
approximation. Explain what addition or change to your original procedure
is needed.
''',r'''
# Musterlösung: Nachvollziehbare numerische Entscheidung

Es sind verschiedene dokumentierte Vorgehensweisen gleichwertig. Ein
mögliches Protokoll mit Intervallhalbierung lautet wie folgt.

**1. Durchführung festhalten**

Ziel ist die Nullstelle von $f(x)=x+e^x-4$ auf $[1,2]$ mit absolutem
Fehler höchstens $0{,}0005$. Ich wähle Intervallhalbierung, weil ich damit
bei stetigem $f$ aus einer Vorzeichenklammer eine nachvollziehbare
Fehlergrenze erhalte; das ist ohne besondere Löserfunktionen reproduzierbar.
Anfangs gilt $f(1)<0<f(2)$.
Der erste Mittelpunkt ist $1{,}5$. Weil $f(1{,}5)>0$, bleibt $[1,1{,}5]$.
Der zweite Mittelpunkt ist $1{,}25$. Weil $f(1{,}25)>0$, bleibt $[1,1{,}25]$.
Das dokumentiert den Beginn der Durchführung, aber noch nicht die Zielgenauigkeit.
Die weitere Eingrenzung kann hier mit den geprüften Tabellenwerten erfolgen;
es werden nicht zehn undokumentierte Halbierungsschritte behauptet.

Alternativ ist etwa die konkrete Löseranweisung „Löse $x+e^x-4=0$
mit Suchintervall $[1,2]$“ samt Werkzeugfunktion und Ausgabe
$x\approx1{,}07372894$ ein nachvollziehbarer Start. Eine entsprechende
konkrete reale Eingabe eines verwendeten Werkzeugs ist ebenso richtig.
Die nachfolgende Intervallkontrolle bleibt für beide Wege nötig.

**2. Ergebnis kontrollieren**

Die Tabelle liefert $f(1{,}073)<0<f(1{,}074)$. Daher liegt die Lösung
im Intervall $[1{,}073,1{,}074]$. Stetigkeit sichert die Existenz,
strenges Wachstum die Eindeutigkeit. Der Mittelpunkt ist
$$m=1{,}0735,\qquad |m-x_*|\leq\frac{1{,}074-1{,}073}{2}=0{,}0005.$$
Damit ist die ursprüngliche Anforderung erfüllt. Die Rundungsfehler der
Tabellenwerte sind viel kleiner als ihre Beträge und ändern kein Vorzeichen.
Auch eine feinere, passend belegte Näherung ist zulässig; bloße gedruckte
Stellen belegen noch keine entsprechende Genauigkeit.

**3. Grenzen**

Die lange Löserausgabe allein ist kein Beleg für alle angezeigten Stellen.
Man braucht eine geeignete Kontrolle beziehungsweise Fehlerabschätzung.
Konkrete Grenzen bei Intervallhalbierung sind zum Beispiel:

- Eine Vorzeichenklammer und Stetigkeit sind für diesen Existenznachweis
  nötig. Bei falscher Klammer liefert das Halbierungsprotokoll keine
  gesicherte Eingrenzung der gesuchten Nullstelle.
- Jede Halbierung halbiert nur die Intervallbreite; für deutlich engere
  Toleranzen können viele Funktionsauswertungen nötig werden.
- Gerundete Funktionswerte unmittelbar nahe null können ohne ausreichende
  Genauigkeit ein falsches Vorzeichen vortäuschen. Hier schließen die
  angegebenen Fehlergrenzen diesen konkreten Vorzeichenfehler aus.

Zwei passend erklärte Grenzen genügen. Bei einem Löser sind etwa
Startwert-/Suchbereichsabhängigkeit und die fehlende Fehlergarantie einer
bloßen Dezimalausgabe passende Grenzen, sofern ihre Folgen erläutert werden.

**4. Rückbewertung und geänderte Anforderung**

Die Wahl war für das ursprüngliche Ziel zweckmäßig: Das Protokoll und die
zusätzlichen Tabellenwerte liefern eine reproduzierbare Eingrenzung und
den verlangten Fehlerbeleg. Ein Löser könnte den Näherungswert schneller
liefern, benötigt für die behauptete Genauigkeit aber ebenfalls Kontrolle.
Die Tabelle zeigt $f(1{,}0737)<0<f(1{,}0738)$. Daher gilt für den neuen
Mittelpunkt
$$m_2=1{,}07375,\qquad |m_2-x_*|\leq0{,}00005.$$
Die alte Klammer genügt für das verschärfte Ziel nicht; man muss eine engere
Klammer nachweisen, durch weitere Halbierungen, präzisere Werte oder die hier
bereitgestellten Tabellenwerte. Ein Beibehalten der Methode mit ergänzter
Kontrolle ist ebenso begründbar wie ein Methodenwechsel. Die Bewertung
muss sich auf das eigene Protokoll und die Anforderung beziehen.
''',r'''
# Worked solution: a traceable numerical decision

Different documented methods are equivalent. One possible bisection record
is given below.

**1. Record the execution**

The target is the zero of $f(x)=x+e^x-4$ on $[1,2]$ with absolute error
at most $0.0005$. I choose bisection because a sign bracket for continuous
$f$ provides a traceable error bound, reproducibly and without special solver
functions. Initially $f(1)<0<f(2)$.
The first midpoint is $1.5$. Since $f(1.5)>0$, keep $[1,1.5]$.
The second midpoint is $1.25$. Since $f(1.25)>0$, keep $[1,1.25]$.
This documents the start but does not yet meet the accuracy target.
Here the checked table values can provide the further bracket; we do not
claim ten undocumented bisection steps.

Alternatively, a concrete instruction such as “solve $x+e^x-4=0$ with
search interval $[1,2]$”, together with the tool function and output
$x\approx1.07372894$, is a traceable start. Equivalent actual reproducible
input for the tool used is valid. The subsequent interval check is still
needed for either route.

**2. Check the result**

The table gives $f(1.073)<0<f(1.074)$, so the solution lies in
$[1.073,1.074]$. Continuity ensures existence; strict increase ensures
uniqueness. Its midpoint is
$$m=1.0735,\qquad |m-x_*|\leq\frac{1.074-1.073}{2}=0.0005.$$
Thus the original requirement is met. The table's rounding errors are far
smaller than the magnitudes and do not affect the signs. A finer appropriately
supported approximation is also valid; printed digits alone do not establish
their accuracy.

**3. Limitations**

The long solver output alone does not establish all displayed digits.
A suitable check or error estimate is needed. Concrete bisection limitations
include:

- This existence argument requires continuity and a sign bracket. With an
  incorrect bracket, the bisection record does not ensure that the desired
  zero is enclosed.
- Each bisection only halves the width; much tighter tolerances may require
  many function evaluations.
- Rounded values very close to zero can suggest the wrong sign if precision
  is insufficient. The supplied error bounds exclude that particular sign
  problem here.

Two appropriately explained limitations suffice. For a solver, dependence
on the initial value or search interval, and lack of an error guarantee from
decimal output alone, are examples if their effects are explained.

**4. Retrospective evaluation and changed requirement**

The choice was suitable for the original target: the record and additional
table values give a reproducible bracket and the required error bound.
A solver could supply an approximation faster, but still needs checking to
support the claimed accuracy. The table gives $f(1.0737)<0<f(1.0738)$,
so the new midpoint satisfies
$$m_2=1.07375,\qquad |m_2-x_*|\leq0.00005.$$
The earlier bracket does not meet the tighter requirement. A smaller bracket
must be established, using further bisections, more precise evaluations, or
the supplied table. Keeping the method with additional checking is as
legitimate as a justified switch of method. The evaluation must refer to
the actual record and requirement.
''',[
('document-method',6,'Zielgleichung, Suchbereich und Genauigkeitsziel vollständig notiert (2); konkrete Methode mit aufgabenbezogenem Wahlgrund festgehalten (1); Durchführung anhand beider korrekter Anfangshalbierungen oder reproduzierbarer Löser-Eingabe mit Näherungswert dokumentiert (3).','Records equation, search interval and accuracy target (2); states a concrete method with a task-related reason (1); documents execution through both correct initial bisections or reproducible solver input and approximation (3).'),
('certify-result',6,'Passende Vorzeichenklammer aus der Tabelle mit nachvollziehbarer Kontrolle verwendet (2); Existenz und Eindeutigkeit mit Stetigkeit und strengem Wachstum erklärt (1); passende Näherung angegeben (1); absolute Fehlergrenze korrekt hergeleitet und am Ziel gemessen (2).','Uses an appropriate table-based sign bracket with a traceable check (2); explains existence and uniqueness using continuity and strict increase (1); gives an appropriate approximation (1); derives an absolute error bound and compares it with the target (2).'),
('limits',4,'Lange Dezimalausgabe als allein unzureichenden Genauigkeitsnachweis bewertet (1); zwei konkrete Grenzen der eigenen Methode bzw. Dokumentation benannt und Folgen für Verlässlichkeit oder Aufwand erklärt (je 1,5, insgesamt 3).','Recognises that long decimal output alone is insufficient accuracy evidence (1); states two concrete limitations of the chosen method or documentation and explains their effects on reliability or effort (1.5 each, 3 total).'),
('retrospective',4,'Ursprüngliche Entscheidung anhand eigener Durchführung und Anforderung rückblickend bewertet (2); engere Vorzeichenklammer und passende neue Näherung mit Fehlergrenze belegt (1); nötige Ergänzung oder Änderung konkret begründet (1).','Evaluates the initial decision against the actual execution and requirement (2); establishes a tighter bracket and suitable new approximation with error bound (1); specifically justifies the required addition or change (1).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine anhand konkreter mathematischer Schritte oder Eingaben nachvollziehbar dokumentierte gewählte Vorgehensweise oder keine auf das Ergebnis beziehungsweise Vorgehen bezogene konkrete Grenze oder keine begründete rückblickende Bewertung der Entscheidung erkennbar ist. Numerische Prüfungen, Fehlergrenzen und passende Folgerungen an beliebiger Stelle zählen als Dokumentation beziehungsweise Bewertung; die Wörter „Grenze“ oder „rückblickend“ müssen nicht vorkommen. Eine fachlich begründete Beibehaltung der Methode genügt. Ein lokaler Rechenfehler oder eine unvollständige zweite Grenze allein löst keine Kappung aus.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no chosen method traceably documented through concrete mathematical steps or inputs, or no concrete limitation related to the result or method, or no justified retrospective evaluation of the decision. Numerical checks, error bounds and appropriate conclusions anywhere in the submission count as documentation or evaluation; the words “limitation” or “retrospective” are not required. A justified decision to keep the method is sufficient. A local arithmetic error or an incomplete second limitation alone does not trigger the cap.',
{'competence':'Gewählte mathematische Vorgehensweise konkret dokumentieren, Grenzen erläutern und anhand Ergebnis/Anforderung rückblickend bewerten.','context':'Original cluster Effizienz von Verfahren beurteilen and original method-choice prerequisite supply the context. Numerical example gives actual evidence rather than an opinion-only prompt.','support':'Continuity/monotonicity and algorithm explanation supplied. No new required numerical-solver competence or new R.','coverage':'Own stable curricular ID only; no claim that this form independently assesses prerequisite method selection or every numerical method.'})

assert len(forms)==4
(H/'whole-current-and-proposed-contracts.json').write_text(json.dumps({'status':'PRIVATE_AUTHOR_PROPOSAL_PENDING_GENUINE_INDEPENDENT_REVIEW','canonicalPath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','bindingPolicy':'Bind the finite wholeCurrentGoal objects exactly; unrelated root-canonical changes are permitted.','proposedPublishedArtifactBase':BASE,'forms':forms},ensure_ascii=False,indent=2)+'\n')
print('Wrote four complete bilingual author proposals and finite before/after objects to',H)
