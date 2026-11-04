import copy,hashlib,json,pathlib,textwrap
H=pathlib.Path(__file__).resolve().parent
BASE='curricula/DE/Gymnasium/assessments/mathematik/functions-finance-six-same-identity-2026-11-04-v1'
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

add('d144a855-9139-55c7-a801-e8b85dab5f01',r'''
# Integrale einer ganzrationalen Funktionenschar

Für $a\in\mathbb R$ ist $f_a(x)=x^2-2ax+2a$ gegeben.
Lasse den Parameter bei deinen Rechnungen stehen. Zeige die Rechenschritte.
Insgesamt sind **20 BE** erreichbar.

**1. Parameterabhängig integrieren (6 BE)**

Bestimme zu jedem $a$ eine Stammfunktion $F_a$ und prüfe sie durch Ableiten
nach $x$. Erläutere, wie du den Parameter beim Integrieren behandelst.

**2. Das bestimmte Integral untersuchen (6 BE)**

Berechne $I(a)=\int_0^1 f_a(x)\,dx$ in Abhängigkeit von $a$.
Bestimme den Parameter mit $I(a)=0$ und die Parameterbereiche für
positive und negative Integralwerte.

**3. Den Integralwert deuten (4 BE)**

Deute $I(a)$ als orientierte Flächenbilanz. Erkläre am Parameter mit
$I(a)=0$, warum weder die Nullfunktion noch ein geometrischer Flächeninhalt
von null folgen. Belege dies durch geeignete Funktionswerte oder eine Skizze.

**4. Das Intervall variieren (4 BE)**

Berechne $J(a)=\int_0^2 f_a(x)\,dx$. Vergleiche die Parameterabhängigkeit
von $I$ und $J$. Erkläre anhand deiner Rechnung, warum ein veränderter
Scharparameter nicht auf jedem Intervall einen veränderten Integralwert
bewirken muss.
''',r'''
# Integrals of a polynomial function family

For $a\in\mathbb R$, let $f_a(x)=x^2-2ax+2a$.
Keep the parameter symbolic in your calculations. Show your working.
A total of **20 points** is available.

**1. Integrate with the parameter (6 points)**

For each $a$, find an antiderivative $F_a$ and check it by differentiation
with respect to $x$. Explain how you treat the parameter when integrating.

**2. Investigate the definite integral (6 points)**

Calculate $I(a)=\int_0^1 f_a(x)\,dx$ as a function of $a$.
Find the parameter for which $I(a)=0$ and the parameter ranges giving
positive and negative integral values.

**3. Interpret the integral (4 points)**

Interpret $I(a)$ as a signed area balance. At the parameter for which
$I(a)=0$, explain why neither the zero function nor zero geometric area
follows. Support your explanation with suitable function values or a sketch.

**4. Vary the interval (4 points)**

Calculate $J(a)=\int_0^2 f_a(x)\,dx$. Compare the parameter dependence
of $I$ and $J$. Use your calculation to explain why changing the family
parameter need not change the integral over every interval.
''',r'''
# Musterlösung: Integrale der Schar

**1. Stammfunktion**

Beim Integrieren nach $x$ wird $a$ als Konstante behandelt. Beispielsweise
$$F_a(x)=\frac{x^3}{3}-ax^2+2ax.$$
Die Ableitung ist $F_a'(x)=x^2-2ax+2a=f_a(x)$.
Eine zusätzliche, bezüglich $x$ konstante Größe $C_a$ ist ebenfalls zulässig;
sie muss bei der Wahl einer Stammfunktion nicht angegeben werden.

**2. Parameterabhängiges Integral**

$$I(a)=F_a(1)-F_a(0)=\frac13-a+2a=a+\frac13.$$
$I(a)=0$ gilt genau für $a=-1/3$. Für $a>-1/3$ ist $I(a)>0$,
für $a<-1/3$ ist $I(a)<0$.

**3. Flächenbilanz**

Das Integral ist der vorzeichenbehaftete Beitrag oberhalb der $x$-Achse
abzüglich des Betrags der Beiträge unterhalb der Achse. Beim Nullparameter
$a=-1/3$ gleichen sich die Beiträge aus. Es gilt aber
$f_{-1/3}(0)=-2/3$ und $f_{-1/3}(1)=1$. Die stetige Funktion besitzt
also negative und positive Abschnitte; sie ist nicht die Nullfunktion.
Der geometrische Gesamtflächeninhalt ist positiv und erhält sich durch
Addition der nichtnegativen Teilflächen, nicht durch deren Ausgleich.
Eine passende Skizze oder gleichwertige Wertebegründung genügt.

**4. Anderes Intervall**

$$J(a)=F_a(2)-F_a(0)=\frac83-4a+4a=\frac83.$$
$I$ hängt linear von $a$ ab, $J$ ist unabhängig von $a$.
Auf $[0,2]$ ist der Integralbeitrag des parameterabhängigen Terms
$2a(1-x)$ null: Die Beiträge auf beiden Seiten von $x=1$ heben sich auf.
Die einzelnen Graphen ändern sich trotzdem, zum Beispiel ist $f_a(0)=2a$.
''',r'''
# Worked solution: integrals of the family

**1. Antiderivative**

When integrating with respect to $x$, treat $a$ as constant. For example,
$$F_a(x)=\frac{x^3}{3}-ax^2+2ax.$$
Differentiation gives $F_a'(x)=x^2-2ax+2a=f_a(x)$.
An additional term $C_a$ constant with respect to $x$ is also valid; it
need not be included when choosing one antiderivative.

**2. Parameter-dependent integral**

$$I(a)=F_a(1)-F_a(0)=\frac13-a+2a=a+\frac13.$$
$I(a)=0$ exactly when $a=-1/3$. If $a>-1/3$, $I(a)>0$;
if $a<-1/3$, $I(a)<0$.

**3. Signed area balance**

The integral is the contribution above the $x$-axis minus the magnitude
of the contributions below it. At $a=-1/3$, these contributions cancel.
However, $f_{-1/3}(0)=-2/3$ and $f_{-1/3}(1)=1$. The continuous function
therefore has negative and positive portions and is not the zero function.
Its total geometric area is positive and is found by adding nonnegative
subareas rather than allowing them to cancel. A suitable sketch or equivalent
argument using values suffices.

**4. Another interval**

$$J(a)=F_a(2)-F_a(0)=\frac83-4a+4a=\frac83.$$
$I$ depends linearly on $a$, whereas $J$ is independent of $a$.
On $[0,2]$, the integral of the parameter-dependent term $2a(1-x)$ is zero:
the contributions on either side of $x=1$ cancel. The individual graphs still
change; for example, $f_a(0)=2a$.
''',[
('antiderivative',6,'Parameter beim Integrieren nach x als konstant behandelt (1); parameterabhängige Stammfunktion mit nachvollziehbaren Termintegrationen bestimmt (3); Ableitungsprobe korrekt (2).','Treats the parameter as constant when integrating in x (1); finds a parameter-dependent antiderivative through traceable termwise integration (3); checks by differentiation (2).'),
('definite-integral',6,'Grenzen an parameterabhängiger Stammfunktion ausgewertet und I(a)=a+1/3 hergeleitet (4); Nullparameter und Vorzeichenbereiche korrekt (je 1).','Evaluates endpoints of the parameter-dependent antiderivative and derives I(a)=a+1/3 (4); correct zero parameter and sign ranges (1 each).'),
('signed-meaning',4,'Orientierte Flächenbilanz erklärt (2); am Nullparameter mittels Werten oder Skizze positive und negative Beiträge sowie Abgrenzung von Nullfunktion und geometrischem Flächeninhalt gezeigt (2).','Explains signed area balance (2); uses values or a sketch at the zero parameter to show positive and negative contributions, distinguishing the zero function and geometric area (2).'),
('interval-variation',4,'J(a)=8/3 durch parameterabhängige Rechnung bestimmt (2); unterschiedliche Parameterabhängigkeit mit Ausgleich der Parameterbeiträge trotz veränderter Graphen erklärt (2).','Finds J(a)=8/3 by a calculation keeping the parameter (2); explains the different dependence through cancellation of parameter contributions despite changing graphs (2).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine nachvollziehbare parameterabhängige Stammfunktion, kein daraus nachvollziehbar berechnetes parameterabhängiges bestimmtes Integral oder keine fachlich tragfähige Deutung eines Integralwerts im Zusammenhang der Schar erkennbar ist. Gleichwertige Leistungen an beliebiger Stelle zählen. Ein lokaler Rechenfehler bei erkennbar tragfähigem Kernverfahren löst keine Kappung aus; weder eine besondere Schreibweise der Integrationskonstante noch eine Ortskurvenuntersuchung ist erforderlich.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no traceable parameter-dependent antiderivative, no parameter-dependent definite integral traceably derived from it, or no sound interpretation of an integral in the family context. Equivalent work anywhere counts. A local arithmetic error in a sound core method does not trigger the cap; no particular notation for the integration constant or locus investigation is required.',
{'competence':'Parameterabhängige Stammfunktion und bestimmte Integrale berechnen und in der Schar deuten.','reuse':'The mathematical core of current released exam1969d4dc part4a is reused explicitly; interval [0,2] provides another instance of the same competence. Existing exam is unchanged.','whySeparate':'Existing whole25-point exam additionally mandates genuine LK locus/existence work. It is absent from all34 affected FullPCs;26GK targets lack those LK goals. See finite existing-exam and34-scope bindings. No scope expansion is proposed.','memory':'Procedural integration and interpretation; no new recall/deck.','coverage':'Own stable ID only; original2requires unchanged.'})

add('7f11ffe0-7c43-4507-9101-50374a60b0e8',r'''
# Einen periodischen Temperaturverlauf modellieren und variieren

An einem modellhaften Tag werden die folgenden Außentemperaturen beobachtet.
$t$ zählt Stunden seit 6 Uhr morgens. Für das erste Modell wird eine glatte,
annähernd sinusförmige Wiederholung alle 24 Stunden angenommen.

| $t$ in h | 0 | 6 | 12 | 18 | 24 |
|---|---:|---:|---:|---:|---:|
| Temperatur in °C | 10 | 18 | 10 | 2 | 10 |

Nutze eine Sinus- oder Kosinusfunktion; gleichwertige Terme sind zulässig.
Zeige Rechnung und Graph. Insgesamt sind **20 BE** erreichbar.

**1. Ein Modell aufstellen (6 BE)**

Bestimme eine passende Funktion $T(t)$ und erläutere Mittellage, Amplitude,
Periode sowie die zeitliche Lage des Verlaufs anhand der Daten. Prüfe den
Term an zwei geeigneten Messpunkten.

**2. Graphisch und im Kontext arbeiten (6 BE)**

Zeichne einen beschrifteten Graphen für $0\leq t\leq48$ mit sinnvoll
skalierten Achsen. Markiere die Messpunkte des ersten Tages sowie Hoch-
und Tiefpunkte. Nenne die Uhrzeiten eines Temperaturmaximums und -minimums.
Erkläre, welche Annahme die Fortsetzung auf den zweiten Tag erlaubt.

**3. Modellannahmen variieren (4 BE)**

Für einen anderen modellhaften Tag soll die Mittellage um 2 °C höher sein,
die Amplitude aber nur 6 °C betragen. Periode und Lage der Maxima bleiben
gleich. Stelle das veränderte Modell auf und ergänze seinen Graphen für
den ersten Tag. Vergleiche Höchst- und Tiefsttemperatur mit dem ersten Modell.

**4. Ergebnisse kritisch deuten (4 BE)**

Berechne die Temperaturen beider Modelle um Mitternacht. Bewerte die Aussage:
„Der erste Graph beweist, dass es am nächsten Tag um Mitternacht wieder genau
2 °C hat.“ Erläutere eine konkrete Grenze der Übertragung des periodischen
Modells auf reale Außentemperaturen.
''',r'''
# Model a periodic temperature pattern and vary the model

The following outdoor temperatures are observed on a hypothetical day.
$t$ counts hours since 6 a.m. For the first model, assume a smooth,
approximately sinusoidal repetition every 24 hours.

| $t$ in h | 0 | 6 | 12 | 18 | 24 |
|---|---:|---:|---:|---:|---:|
| temperature in °C | 10 | 18 | 10 | 2 | 10 |

Use a sine or cosine function; equivalent expressions are valid.
Show calculations and a graph. A total of **20 points** is available.

**1. Construct a model (6 points)**

Find a suitable function $T(t)$ and explain its midline, amplitude, period
and timing using the data. Check the expression at two suitable observations.

**2. Work graphically and in context (6 points)**

Draw a labelled graph for $0\leq t\leq48$ with suitably scaled axes.
Mark the first day's observations and the maxima and minima. State the
clock times of a maximum and a minimum. Explain the assumption allowing
the extension to the second day.

**3. Vary modelling assumptions (4 points)**

For another hypothetical day, the midline is 2 °C higher but the amplitude
is only 6 °C. The period and timing of the maxima remain unchanged.
Construct the changed model and add its graph for the first day. Compare
maximum and minimum temperatures with the initial model.

**4. Interpret results critically (4 points)**

Calculate the midnight temperature in each model. Evaluate this statement:
“The first graph proves that the temperature will again be exactly 2 °C
at midnight on the next day.” Explain a concrete limitation of transferring
the periodic model to real outdoor temperatures.
''',r'''
# Musterlösung: Periodisches Temperaturmodell

**1. Term aus den Daten**

Die Mittellage ist $(18+2)/2=10$ °C, die Amplitude $(18-2)/2=8$ °C.
Die Periode ist 24 h. Bei $t=0$ startet der Verlauf auf der Mittellage
und steigt. Daher passt
$$T(t)=10+8\sin\left(\frac{\pi}{12}t\right).$$
Zum Beispiel sind $T(0)=10$ und $T(6)=18$. Ebenso passen die übrigen Daten.
Ein phasenverschobener Kosinusterm ist gleichwertig.

**2. Graph und Uhrzeiten**

Der Graph enthält die Punkte $(0,10),(6,18),(12,10),(18,2),(24,10)$
und wiederholt sich im Modell nach 24 h. Maxima liegen bei $t=6,30$,
Minima bei $t=18,42$. Ein Maximum liegt somit um 12 Uhr mittags,
ein Minimum um Mitternacht. Die zweite Periode setzt gleichbleibende
Modellbedingungen und dieselbe Tageskurve voraus.

Die Graphen werden als glatte Sinuskurven durch die angegebenen Punkte gezeichnet. Für die Variation sind die Punkte bei t=0,6,12,18,24 entsprechend (0,12),(6,18),(12,12),(18,6),(24,12).

**3. Variation**

$$T_v(t)=12+6\sin\left(\frac{\pi}{12}t\right).$$
Der neue Höchstwert ist $18$ °C und bleibt gleich; der neue Tiefstwert
ist $6$ °C statt $2$ °C. Der neue Graph schwankt weniger stark um eine
höhere Mittellage; Maximum und Minimum treten zu denselben Zeiten auf.

**4. Kritische Deutung**

Mitternacht entspricht $t=18$; es gilt $T(18)=2$ °C und $T_v(18)=6$ °C.
Der erste Term liefert auch $T(42)=2$ °C, also dieselbe Modellprognose für
den nächsten Tag. Dies ist kein Beweis über die reale Temperatur. Etwa
ein Wetterwechsel, andere Bewölkung oder Wind kann die Mittellage, Amplitude
und den Zeitpunkt der Extremwerte ändern. Die angenommene exakte Wiederholung
ist eine Vereinfachung, die durch weitere Messungen geprüft werden muss.
''',r'''
# Worked solution: periodic temperature model

**1. Constructing the expression**

The midline is $(18+2)/2=10$ °C and amplitude is $(18-2)/2=8$ °C.
The period is 24 h. At $t=0$ the pattern starts at the midline and rises,
so one suitable model is
$$T(t)=10+8\sin\left(\frac{\pi}{12}t\right).$$
For example, $T(0)=10$ and $T(6)=18$. The other observations also match.
An appropriately phase-shifted cosine expression is equivalent.

**2. Graph and clock times**

The graph includes $(0,10),(6,18),(12,10),(18,2),(24,10)$ and repeats
in the model after 24 h. Maxima occur at $t=6,30$, minima at $t=18,42$.
A maximum therefore occurs at noon, a minimum at midnight. The second
period assumes unchanged modelling conditions and the same daily curve.

Draw smooth sinusoidal curves through the stated points. For the variation, the points at t=0,6,12,18,24 are (0,12),(6,18),(12,12),(18,6),(24,12).

**3. Variation**

$$T_v(t)=12+6\sin\left(\frac{\pi}{12}t\right).$$
The new maximum remains $18$ °C; the new minimum is $6$ °C instead of
$2$ °C. The new graph varies less around a higher midline, with maximum
and minimum at the same times.

**4. Critical interpretation**

Midnight corresponds to $t=18$: $T(18)=2$ °C and $T_v(18)=6$ °C.
The first expression also gives $T(42)=2$ °C, the same model prediction
for the following day. This is not proof about actual temperature.
A weather change, different cloud cover or wind may change the midline,
amplitude and timing of the extrema. Exact repetition is a simplifying
assumption requiring comparison with further observations.
''',[
('model-term',6,'Mittellage, Amplitude und Periode aus Daten bestimmt (je 1); passender Sinus-/Kosinusterm mit zeitlicher Lage (2); Probe an zwei passenden Datenpunkten (1).','Finds midline, amplitude and period from the data (1 each); suitable sine/cosine expression with correct timing (2); checks two appropriate observations (1).'),
('graph-context',6,'Sinnvoll beschriftete und skalierte Achsen mit Datenpunkten (2); korrekter sinusförmiger Verlauf über zwei Perioden und passende Extrempunkte (2); Uhrzeiten und Wiederholungsannahme kontextuell erklärt (2).','Suitably labelled and scaled axes with observations (2); correct sinusoidal behaviour over two periods with appropriate extrema (2); explains clock times and repetition assumption in context (2).'),
('vary-model',4,'Veränderten Term mit Mittellage 12 und Amplitude 6 bei gleicher Periode/Phase aufgestellt (2); passenden Graphen ergänzt und neue gegenüber alten Extremwerten gedeutet (2).','Constructs the changed expression with midline 12 and amplitude 6, preserving period and phase (2); adds an appropriate graph and interprets new versus old extrema (2).'),
('evaluate-context',4,'Mitternacht richtig zugeordnet und beide Temperaturwerte berechnet (2); Modellprognose von realer Gewissheit unterschieden und konkrete Modellgrenze mit Auswirkung erläutert (2).','Correctly identifies midnight and calculates both temperatures (2); distinguishes a model prediction from real certainty and explains a concrete limitation with its effect (2).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe kein aus dem Sachverhalt aufgestelltes geeignetes Sinus-/Kosinusmodell, keine fachlich tragfähige graphische Darstellung oder keine erkennbare Variation von Modellannahmen mit kontextbezogener Deutung vorliegt. Eine passende Handskizze oder Werkzeuggraphik genügt; bestimmte Software, Farben oder Zeichengenauigkeit sind keine Pflicht. Leistungen an beliebiger Stelle zählen. Ein lokaler Rechen-, Zeichen- oder Übertragungsfehler bei ansonsten tragfähiger Modellierung löst keine Kappung aus.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no suitable sine/cosine model constructed from the context, no sound graphical representation, or no identifiable variation of modelling assumptions with contextual interpretation. A suitable hand sketch or tool graph suffices; no particular software, colours or drawing precision is required. Work anywhere counts. A local arithmetic, drawing or copying error within otherwise sound modelling does not trigger the cap.',
{'competence':'Whole original graphical and numerical real-world periodic modelling, variation of assumptions and contextual interpretation.','existingCoverage':'Current examc9d7546d supplies formula reading and isolated values but does not require own graphical modelling or variation; not a complete form for this original goal.','graphics':'Actual bilingual solution PNGs are portable review sidecars only. Task and solution are self-contained; learner draws own graph, so no input graphic is missing.','coverage':'Own stable ID only, original graphical/parameter prerequisites retained.'})

add('27b63e2e-6a34-483e-8e5a-fe0f49670d1d',r'''
# Wachstum und Abklingen mit exponentiellen Modellen beschreiben

Unter zunächst gleichbleibenden Bedingungen wurden folgende Werte gemessen.
$t$ ist in beiden Situationen die Zeit in Stunden.

| $t$ in h | 0 | 2 | 4 |
|---|---:|---:|---:|
| Anzahl $N$ einer Zellkultur | 100 | 200 | 400 |

| $t$ in h | 0 | 3 | 6 |
|---|---:|---:|---:|
| Stoffmenge $M$ in mg | 80 | 40 | 20 |

Es sollen zunächst exponentielle Modelle verwendet werden. Zeige Ansätze,
Rechnungen und Graphen. Insgesamt sind **20 BE** erreichbar.

**1. Passende Modelle entwickeln (6 BE)**

Stelle für jede Situation einen Funktionsterm auf und erkläre Anfangswert
sowie Änderungsfaktor mit der zugehörigen Zeitspanne. Begründe anhand der
Daten und einer Modellannahme, warum ein exponentieller Ansatz passt.

**2. Graphisch und rechnerisch beschreiben (6 BE)**

Zeichne die beiden Modellgraphen für $0\leq t\leq9$ in getrennten,
sinnvoll beschrifteten Koordinatensystemen. Markiere die Messwerte.
Berechne die modellierte Zellzahl nach 6 Stunden und die Stoffmenge nach
9 Stunden und deute die Ergebnisse mit Einheiten.

**3. Eine Annahme verändern (4 BE)**

Nach vier Stunden begrenzt die Nährstoffversorgung das Wachstum. Ab diesem
Zeitpunkt soll die Zellzahl nur noch um 10 % pro Stunde zunehmen.
Stelle einen passenden Term für $t\geq4$ auf, der bei $t=4$ an den
bisherigen Bestand anschließt. Vergleiche die beiden Modellprognosen
für die Zellzahl nach 8 Stunden und deute den Unterschied.

**4. Grenzen kritisch bewerten (4 BE)**

Beurteile die Aussagen „Die Zellzahl kann für beliebig lange Zeit so weiter
wachsen“ und „Nach drei Halbierungen ist der Stoff vollständig verschwunden“.
Begründe mit Modellwerten beziehungsweise einer konkreten Realbedingung.
Erläutere dabei, was das Abklingmodell über das Erreichen der Menge null aussagt.
''',r'''
# Describe growth and decay using exponential models

The following observations were recorded under initially unchanged conditions.
In both situations $t$ is time in hours.

| $t$ in h | 0 | 2 | 4 |
|---|---:|---:|---:|
| cell-culture count $N$ | 100 | 200 | 400 |

| $t$ in h | 0 | 3 | 6 |
|---|---:|---:|---:|
| amount of substance $M$ in mg | 80 | 40 | 20 |

Initially use exponential models. Show setups, calculations and graphs.
A total of **20 points** is available.

**1. Develop suitable models (6 points)**

Construct an expression for each situation and explain its initial value
and change factor with the corresponding time interval. Use the data and
a modelling assumption to justify the exponential approach.

**2. Describe graphically and numerically (6 points)**

Draw both model graphs for $0\leq t\leq9$ in separate coordinate systems
with suitable labels. Mark the observations. Calculate the modelled cell
count after 6 hours and amount of substance after 9 hours, interpreting
the results with units.

**3. Change an assumption (4 points)**

After four hours, nutrient availability limits growth. From then on, the
cell count is modelled as increasing by only 10% per hour. Construct an
expression for $t\geq4$ that joins the previous count at $t=4$.
Compare the two cell-count predictions after 8 hours and interpret
the difference.

**4. Evaluate limitations critically (4 points)**

Assess the claims “The cell count can keep growing this way indefinitely”
and “After three halvings, the substance has disappeared completely”.
Use model values or a concrete real condition to justify your answers.
Explain what the decay model says about reaching an amount of zero.
''',r'''
# Musterlösung: Exponentielle Kontextmodelle

**1. Terme und Annahmen**

Die Zellzahl verdoppelt sich alle zwei Stunden:
$$N(t)=100\cdot2^{t/2}.$$
Die Stoffmenge halbiert sich alle drei Stunden:
$$M(t)=80\cdot\left(\frac12\right)^{t/3}.$$
Gleichwertige Terme mit Stundenfaktor $\sqrt2$ beziehungsweise
$2^{-1/3}$ sind richtig. Die Daten zeigen jeweils gleiche Faktoren in
gleichen Zeitabständen. Die Fortsetzung setzt voraus, dass diese relativen
Änderungen unter gleichbleibenden Bedingungen weiter gelten; drei Messwerte
allein beweisen den zeitlich unbegrenzten Modellansatz nicht.

**2. Graphen und Prognosen**

Der Wachstumsgraph beginnt bei 100, steigt und wird zunehmend steiler.
Der Abklinggraph beginnt bei 80 mg, fällt und nähert sich der Zeitachse.
Die Diagramme haben verschiedene Größen und daher getrennte y-Achsen.

Zum Zeichnen passen für N die Punkte (0,100),(2,200),(4,400),(6,800),(8,1600), für M die Punkte (0,80),(3,40),(6,20),(9,10). Die Kurven verlaufen glatt durch diese Punkte; beide Zeitachsen sind in Stunden beschriftet.

$$N(6)=100\cdot2^3=800\text{ Zellen},\qquad
M(9)=80\cdot(1/2)^3=10\text{ mg}.$$

**3. Verändertes Wachstum**

Nach vier Stunden liegen 400 Zellen vor. Ein anschließendes Modell ist
$$N_v(t)=400\cdot1{,}1^{t-4}\quad(t\geq4).$$
Es beginnt korrekt bei $N_v(4)=400$. Für acht Stunden liefern die Modelle
$N(8)=1600$ und $N_v(8)=400\cdot1{,}1^4=585{,}64$, also etwa
586 Zellen. Die verringerte relative Zunahme ergibt einen deutlich kleineren
Bestand. Die gebrochene Modellzahl ist eine Näherungsprognose, keine
Behauptung über einen Bruchteil einer tatsächlich gezählten Zelle.

**4. Modellgrenzen**

Unbegrenztes reales Wachstum ist etwa wegen begrenzter Nährstoffe oder
begrenzten Platzes nicht plausibel. Das ursprüngliche Modell würde trotzdem
weiter exponentiell steigen; es muss außerhalb geeigneter Bedingungen angepasst
werden. Drei Halbierungen ergeben noch $10$ mg, nicht null. Im Modell gilt
$M(t)>0$ für jede endliche Zeit; die Menge nähert sich nur der null.
Eine reale Mess- oder Nachweisgrenze ist von tatsächlicher Menge null zu
unterscheiden. Gleichwertige konkrete Grenzen sind zulässig.
''',r'''
# Worked solution: exponential models in context

**1. Expressions and assumptions**

The cell count doubles every two hours:
$$N(t)=100\cdot2^{t/2}.$$
The amount of substance halves every three hours:
$$M(t)=80\cdot\left(\frac12\right)^{t/3}.$$
Equivalent expressions using hourly factors $\sqrt2$ and $2^{-1/3}$
are valid. Each dataset shows equal factors over equal time intervals.
Extrapolation assumes these relative changes continue under unchanged
conditions; three observations alone do not prove validity for unlimited time.

**2. Graphs and predictions**

The growth graph starts at 100, increases and becomes progressively steeper.
The decay graph starts at 80 mg, decreases and approaches the time axis.
The quantities differ, so the diagrams have separate vertical axes.

Suitable plotting points for N are (0,100),(2,200),(4,400),(6,800),(8,1600); for M they are (0,80),(3,40),(6,20),(9,10). Draw smooth curves through these points, with both time axes labelled in hours.

$$N(6)=100\cdot2^3=800\text{ cells},\qquad
M(9)=80\cdot(1/2)^3=10\text{ mg}.$$

**3. Changed growth**

After four hours there are 400 cells. One model from that point is
$$N_v(t)=400\cdot1.1^{t-4}\quad(t\geq4).$$
It joins correctly at $N_v(4)=400$. At eight hours, the predictions are
$N(8)=1600$ and $N_v(8)=400\cdot1.1^4=585.64$, or about 586 cells.
The reduced relative growth yields a much smaller count. The fractional
model output is an approximate prediction, not a claim about a fraction
of an actually counted cell.

**4. Model limitations**

Indefinite real growth is implausible because nutrients or space are limited,
for example. The initial model would nevertheless keep increasing
exponentially; it must be adjusted outside suitable conditions.
Three halvings leave $10$ mg rather than zero. The model has $M(t)>0$
for every finite time: the amount only approaches zero. An actual measurement
or detection threshold must be distinguished from an amount of zero.
Equivalent concrete limitations are valid.
''',[
('derive-models',6,'Passende Wachstums- und Abklingterme aus den Daten aufgestellt (je 2); Anfangswerte, Faktoren mit Zeitspanne sowie Fortsetzungsannahme verständlich erläutert (2).','Constructs suitable growth and decay expressions from the observations (2 each); explains initial values, factors with time interval, and extrapolation assumption (2).'),
('graphs-values',6,'Beide fachlich passende Graphen mit Achsen/Einheiten und Messwerten erstellt (je 2); N(6)=800 und M(9)=10 mit Kontext und Einheit berechnet (je 1).','Draws both appropriate graphs with axes, units and observations (2 each); calculates N(6)=800 and M(9)=10 with context and units (1 each).'),
('changed-assumption',4,'Veränderten Wachstumsterm mit richtigem Anschlussbestand und Zeitbezug aufgestellt (2); Prognosen für t=8 berechnet und Unterschied kontextuell gedeutet (2).','Constructs the changed growth model with correct joining count and time reference (2); calculates predictions at t=8 and interprets the difference in context (2).'),
('critical-context',4,'Unbegrenztes reales Wachstum anhand einer konkreten Grenze kritisch beurteilt (2); Restmenge nach drei Halbierungen und Annäherung an null gegenüber tatsächlichem Verschwinden fachlich erklärt (2).','Critically evaluates indefinite real growth using a concrete limitation (2); explains the remainder after three halvings and approach to zero versus actual disappearance (2).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe kein aus den Daten hergeleitetes geeignetes exponentielles Modell, keine fachlich tragfähige graphische Modellbeschreibung oder keine fachlich nachvollziehbare Variation einer Modellannahme oder keine kritische Kontextbewertung erkennbar ist. Leistungen an beliebiger Stelle und mathematisch gleichwertige Modellterme zählen. Eine passende Handskizze genügt; keine bestimmte Software oder logarithmische Lösemethode ist erforderlich. Lokale Rechen- oder Zeichenfehler bei erkennbarer Kernleistung lösen keine Kappung aus.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no suitable exponential model derived from the data, no sound graphical model description, no traceable variation of a modelling assumption, or no critical contextual evaluation. Work anywhere and mathematically equivalent model expressions count. A suitable hand sketch suffices; no particular software or logarithmic solution method is required. Local arithmetic or drawing errors in otherwise demonstrated core work do not trigger the cap.',
{'competence':'Whole original numerical and graphical growth/decay modelling, variation, limits and critical contextual evaluation.','graphics':'Actual bilingual two-panel solution PNGs are portable review sidecars only; task requires own graphs and solution supplies all values and shape descriptions without external dependencies.','memory':'Understanding and contextual model work, no new deck.','coverage':'Own stable ID only; original4requires unchanged. No new logarithmic solve requirement.'})

add('1842da92-ca2c-5fed-a946-e6413a6285bb',r'''
# Einen Zinssatz mit einer Tabellenkalkulation näherungsweise bestimmen

Ein Guthaben von 2000 € wird zu einem festen jährlichen Zinssatz angelegt.
Zinsen werden einmal am Ende jedes Jahres gutgeschrieben und im nächsten Jahr
mitverzinst. Es gibt keine weiteren Ein- oder Auszahlungen, Gebühren oder
Steuern. Nach genau drei vollständigen Jahren beträgt das Guthaben 2320 €.
Gesucht ist der jährliche Zinssatz. Insgesamt sind **20 BE** erreichbar.

Nutze eine Tabellenkalkulation. Gib einen lesbaren Tabellenausschnitt und
nachvollziehbare Zellformeln ab; eine bestimmte Software oder Dateiart ist
nicht vorgeschrieben. Rechne intern ungerundet und zeige Geldbeträge auf Cent.
Eine Wurzel-, Logarithmus- oder Zielwertsuche ist nicht erforderlich.

**1. Eine Rechentabelle aufbauen (6 BE)**

Erstelle die Spalten „Zinssatz“, „Ende Jahr 1“, „Ende Jahr 2“,
„Ende Jahr 3“ und „Abweichung von 2320 €“. Erkläre anhand einer
Zeile die Zellformeln und die jährliche Verzinsung des Vorjahresguthabens.

**2. Den Zinssatz eingrenzen (6 BE)**

Untersuche zunächst 4 %, 5 % und 6 %. Verfeinere anschließend die Suche
in einem passenden Bereich. Dokumentiere mindestens zwei benachbarte
Zinssätze im Abstand von 0,01 Prozentpunkten, zwischen deren Endguthaben
das Ziel liegt.

**3. Näherung im Kontext prüfen (4 BE)**

Nenne einen Zinssatz mit zwei Nachkommastellen in Prozent, dessen berechnetes
Endguthaben höchstens 1 € von 2320 € abweicht. Belege die Abweichung und
gib an, was dein Zinssatz pro Jahr bedeutet. Prüfe die Größenordnung auch
an den Ergebnissen aus Teil 2.

**4. Eine plausible Fehlerquelle erkennen (4 BE)**

Eine Person schreibt für den Dreijahres-Endwert bei Zinssatz $p$ die Formel
$2000\cdot(1+3p)$ und bekommt ein anderes Ergebnis. Hier steht $p$ als
Dezimalzahl, etwa $0{,}05$ für 5 %. Erkläre mit deiner Tabelle den Unterschied
zum vereinbarten Modell. Benenne eine reale Änderung der Vertragsbedingungen,
wegen der dein ermittelter Modellzinssatz das neue Guthaben nicht mehr erklären
würde.
''',r'''
# Estimate an interest rate using a spreadsheet

A balance of €2000 is invested at a fixed annual interest rate.
Interest is credited once at the end of each year and earns interest in the
following year. There are no further deposits, withdrawals, fees or taxes.
After exactly three complete years, the balance is €2320. Find the annual
interest rate. A total of **20 points** is available.

Use a spreadsheet. Submit a readable table excerpt and traceable cell formulas;
no particular software or file type is prescribed. Keep full internal precision
and display money to cents. Roots, logarithms and goal-seek functions are not
required.

**1. Build a calculation table (6 points)**

Create columns “interest rate”, “end of year 1”, “end of year 2”,
“end of year 3” and “difference from €2320”. Use one row to explain
your cell formulas and annual interest on the preceding balance.

**2. Bracket the rate (6 points)**

First test 4%, 5% and 6%. Then refine the search within an appropriate range.
Document at least two neighbouring rates 0.01 percentage points apart whose
final balances bracket the target.

**3. Check the estimate in context (4 points)**

Give a rate with two decimal places in percent whose calculated final balance
differs from €2320 by at most €1. Show the difference and explain what the
rate means per year. Also check its magnitude against your part 2 results.

**4. Identify a plausible source of error (4 points)**

Someone uses $2000\cdot(1+3p)$ for the three-year final balance at rate
$p$ and obtains a different result. Here $p$ is a decimal, such as $0.05$
for 5%. Use your table to explain the difference from the agreed model.
State a real change to the contract terms that would prevent your estimated
model rate from explaining the new balance.
''',r'''
# Musterlösung: Zinssatzsuche in der Tabelle

**1. Tabellenformeln**

In Zeile 1 stehen die Überschriften. Die Versuchszinssätze stehen als
Prozentwerte in Spalte A. Eine mögliche erste Datenzeile ist
`B2=2000*(1+A2)`, `C2=B2*(1+A2)`, `D2=C2*(1+A2)`, `E2=D2-2320`.
Die Formeln werden für weitere Versuchszinssätze nach unten kopiert.
So wird jedes Jahr das gesamte Vorjahresguthaben einschließlich der bereits
gutgeschriebenen Zinsen verzinst. Andere passende Tabellenlayouts sind gleichwertig.

**2. Suche und Eingrenzung**

| Zinssatz | Jahr 1 € | Jahr 2 € | Jahr 3 € | Differenz € |
|---:|---:|---:|---:|---:|
| 4,00 % | 2080,00 | 2163,20 | 2249,73 | -70,27 |
| 5,00 % | 2100,00 | 2205,00 | 2315,25 | -4,75 |
| 6,00 % | 2120,00 | 2247,20 | 2382,03 | 62,03 |
| 5,06 % | 2101,20 | 2207,52 | 2319,22 | -0,78 |
| 5,07 % | 2101,40 | 2207,94 | 2319,88 | -0,12 |
| 5,08 % | 2101,60 | 2208,36 | 2320,55 | 0,55 |

Die Zielsumme liegt zwischen den Werten zu 5,07 % und 5,08 %. Ein größerer
positiver Zinssatz erzeugt hier in jedem Jahr ein größeres Guthaben.

**3. Näherung**

Zum Beispiel sind 5,07 % pro Jahr geeignet: Die intern berechnete
Abweichung beträgt etwa $-0{,}1164$ €, also betragsmäßig weniger als 1 €.
Auch 5,08 % ist nach der ausdrücklich vorgegebenen Ein-Euro-Toleranz geeignet.
5,06 % erfüllt ebenfalls diese Endwerttoleranz; die engere Suchklammer aus
Teil 2 bleibt jedoch zu dokumentieren. Der Wert ist ein jährlicher Satz,
kein insgesamt für drei Jahre anfallender Prozentsatz. Er liegt plausibel
zwischen 5 % und 6 %. Eine kleine Endwerttoleranz ist keine Behauptung,
der reale Vertragssatz sei exakt auf die angegebenen Stellen bekannt.

**4. Modellprüfung**

$2000(1+3p)$ verzinst dreimal nur den Anfangsbetrag. Die Tabelle verzinst
auch frühere Zinsen. Zum Beispiel ergeben sich bei 5 % ohne Zinseszins
2300 €, mit jährlichem Zinseszins aber 2315,25 €. Etwa jährliche Gebühren,
Zwischenentnahmen oder ein wechselnder Zinssatz würden das Modell ändern.
Dann darf die Abweichung nicht ohne Weiteres einem anderen festen Zinssatz
zugeschrieben werden. Eine passende konkrete Änderung mit Erklärung genügt.
''',r'''
# Worked solution: searching for a rate in a spreadsheet

**1. Cell formulas**

Row 1 contains headings; column A contains trial rates formatted as percentages.
One possible first data row is
`B2=2000*(1+A2)`, `C2=B2*(1+A2)`, `D2=C2*(1+A2)`, `E2=D2-2320`.
Copy the formulas down for further trial rates. Each year's interest is based
on the entire preceding balance, including interest already credited.
Other suitable layouts are equivalent.

**2. Search and bracket**

| rate | year 1 € | year 2 € | year 3 € | difference € |
|---:|---:|---:|---:|---:|
| 4.00% | 2080.00 | 2163.20 | 2249.73 | -70.27 |
| 5.00% | 2100.00 | 2205.00 | 2315.25 | -4.75 |
| 6.00% | 2120.00 | 2247.20 | 2382.03 | 62.03 |
| 5.06% | 2101.20 | 2207.52 | 2319.22 | -0.78 |
| 5.07% | 2101.40 | 2207.94 | 2319.88 | -0.12 |
| 5.08% | 2101.60 | 2208.36 | 2320.55 | 0.55 |

The target lies between the final balances at 5.07% and 5.08%. In this
model, a larger positive rate produces a larger balance in each year.

**3. Estimate**

For example, 5.07% per year is suitable: its internally computed difference
is about $-0.1164$ euros, less than €1 in magnitude. Under the explicitly
specified one-euro tolerance, 5.08% is also suitable. 5.06% also meets that
final-balance tolerance, although the finer search bracket from part 2 must
still be documented. This is an annual rate, not the total percentage over
three years. It plausibly lies between 5% and 6%. A small final-value tolerance
does not establish the real contract rate exactly to the stated digits.

**4. Model check**

$2000(1+3p)$ applies interest to the initial balance three times only.
The table also earns interest on earlier interest. At 5%, for example, the
simple-interest balance is €2300, while annual compounding gives €2315.25.
Annual fees, intermediate withdrawals or a changing rate would alter the
model. The difference then cannot automatically be attributed to a different
fixed rate. One suitable concrete change with an explanation suffices.
''',[
('spreadsheet-model',6,'Reproduzierbare Tabellenkalkulation mit Versuchszinssatz und drei Jahresguthaben eingerichtet (2); Zellformeln einschließlich jährlicher Vorjahresverzinsung und Differenz nachvollziehbar angegeben (3); Prozent-/Dezimaldarstellung und interne Rundung sachgerecht (1).','Sets up a reproducible spreadsheet with a trial rate and three annual balances (2); supplies traceable cell formulas including annual interest on the preceding balance and final difference (3); appropriate percent/decimal representation and internal rounding (1).'),
('rate-search',6,'Grobe Versuchstabelle 4 %, 5 %, 6 % mit passenden Endwerten und Suchbereich erstellt (3); durch tabellarische Verfeinerung Zielklammer mit benachbarten Sätzen im Abstand 0,01 Prozentpunkte belegt (3).','Builds a coarse trial table for 4%, 5%, 6% with appropriate final values and search range (3); documents a refined table bracket using neighbouring rates 0.01 percentage points apart (3).'),
('check-estimate',4,'Geeigneten Satz mit zwei Nachkommastellen in Prozent gewählt und Endwertabweichung ≤1 € belegt (2); jährliche Bedeutung und Größenordnung im Kontext geprüft (2).','Chooses a suitable rate with two decimal places in percent and supports a final-value error ≤€1 (2); checks annual meaning and magnitude in context (2).'),
('interest-context',4,'Einfache Verzinsung von vereinbartem Zinseszins anhand der Tabelle unterschieden (2); konkrete Änderung der Vertragsbedingungen mit Folge für die Modellgültigkeit erläutert (2).','Uses the table to distinguish simple interest from agreed compounding (2); explains a concrete change to contract terms and its effect on model validity (2).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine nachvollziehbare tabellenkalkulatorische Zinssatzsuche mit Zellformeln und Ergebniswerten oder keine Prüfung des gefundenen Zinssatzes am vorgegebenen Finanzziel erkennbar ist. Ein Tabellenexport mit nachvollziehbaren Formeln genügt; Screenshot, bestimmte Software oder Dateiendung sind keine Pflicht. Eine bloß mit einer Wurzel- oder Solverformel bestimmte Zahl ersetzt die tabellarische Methode nicht. Lokale Formelübertragungs-, Rundungs- oder Rechenfehler mit tragfähiger Methode und richtiger Folgearbeit lösen keine Kappung aus.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no traceable spreadsheet rate search with cell formulas and values, or no check of the chosen rate against the financial target. A table export with traceable formulas suffices; screenshots, particular software and file extensions are not required. A number found solely with a root or solver formula does not replace the tabular method. Local copying, rounding or arithmetic errors within a sound method and correct follow-through do not trigger the cap.',
{'competence':'Interest rate estimated with an actual reproducible spreadsheet search and checked in a simple financial context.','timing':'Annual crediting and compounding, three full years, no transactions/fees/taxes explicitly fixed.','tolerance':'Task intentionally permits any two-decimal-percent rate meeting end-balance tolerance, not a hidden unique rounding answer.','coverage':'Own stable ID only; no new numerical solver or logarithm requirement, original R retained.'})

add('f6574cdc-e29c-5a8f-a009-9f28b3bcf9be',r'''
# Eine regelmäßige Sparrate tabellarisch bestimmen

Ein neues Sparkonto startet mit 0 €. Es wird jährlich mit 3 % verzinst.
Am Ende jedes Jahres werden zuerst die Zinsen auf das Guthaben zu Jahresbeginn
gutgeschrieben, danach wird die feste jährliche Sparrate eingezahlt.
Nach vier vollständigen Jahren soll das Guthaben mindestens 2000 € betragen.
Gebühren und Steuern bleiben im Modell unberücksichtigt. Gesucht ist die
kleinste passende jährliche Sparrate in **ganzen Euro**.
Insgesamt sind **20 BE** erreichbar.

Nutze eine Tabellenkalkulation. Gib lesbare Tabellen und nachvollziehbare
Zellformeln ab. Eine bestimmte Software oder Dateiart ist nicht vorgeschrieben.
Rechne intern ungerundet; zeige Guthaben auf Cent. Eine geschlossene
Rentenformel oder ein Solver ist nicht erforderlich.

**1. Die Entwicklung modellieren (6 BE)**

Baue eine Tabelle auf, mit der du für eine versuchsweise gewählte feste
Jahresrate das Guthaben nach den vier Jahren berechnen kannst. Erkläre
die Formeln und warum die neue Einzahlung erst ab dem Folgejahr Zinsen erhält.

**2. Die Rate eingrenzen (6 BE)**

Vergleiche tabellarisch zunächst 450 €, 475 € und 500 € pro Jahr.
Verfeinere anschließend die Suche bis auf ganze Euro. Dokumentiere zwei
benachbarte ganze Jahresraten, von denen die kleinere das Ziel verfehlt
und die größere es erreicht.

**3. Die Wahl anhand der Entwicklung prüfen (4 BE)**

Nenne die kleinste passende ganze Jahresrate. Zeige für sie das Guthaben
nach jeder der vier Einzahlungen. Prüfe mit der benachbarten kleineren Rate,
warum deine Wahl das Ziel gerade erreicht, ohne eine unnötig hohe Rate zu wählen.

**4. Zeitpunkte im Kontext bewerten (4 BE)**

Eine Person verzinst auch die gerade erst am Jahresende eingezahlte Rate
bereits für dasselbe volle Jahr. Erkläre den Fehler anhand des ersten Jahres.
Beschreibe, wie sich Einzahlungen jeweils am Jahresanfang statt am Jahresende
auf die benötigte Rate auswirken würden, und begründe deine Einschätzung.
''',r'''
# Estimate a regular savings contribution using a spreadsheet

A new savings account starts with €0 and earns 3% annually.
At each year-end, interest on the opening balance is credited first, then
the fixed annual contribution is deposited. After four complete years,
the balance must be at least €2000. Ignore fees and taxes in this model.
Find the smallest suitable annual contribution in **whole euros**.
A total of **20 points** is available.

Use a spreadsheet. Submit readable tables and traceable cell formulas.
No particular software or file type is prescribed. Keep full internal precision;
display balances to cents. A closed-form annuity formula or solver is not required.

**1. Model the balance development (6 points)**

Build a table to calculate the balance after four years for a trial fixed
annual contribution. Explain the formulas and why each new contribution
only earns interest from the following year.

**2. Bracket the contribution (6 points)**

First compare annual contributions of €450, €475 and €500 in your table.
Then refine the search to whole euros. Document two neighbouring whole-euro
contributions such that the smaller misses the target and the larger reaches it.

**3. Check the choice using the balance development (4 points)**

State the smallest suitable whole-euro annual contribution. Show the balance
after each of its four deposits. Use the neighbouring smaller contribution
to check why your choice reaches the target without an unnecessarily high payment.

**4. Evaluate timing in context (4 points)**

Someone also credits a full year's interest to the contribution just paid
at year-end. Explain the error using the first year. Describe how depositing
at the start rather than the end of each year would affect the required
contribution, and justify your assessment.
''',r'''
# Musterlösung: Jährliche Sparrate

**1. Tabellenmodell**

Bei fester Jahresrate $r$ und Guthaben $G_k$ nach der $k$-ten Einzahlung gilt
$G_0=0$ und $G_k=1{,}03G_{k-1}+r$.
Eine mögliche Versuchstabelle enthält in A die Rate, in B bis E die Guthaben
nach Jahr 1 bis 4. In der ersten Datenzeile:
`B2=A2`, `C2=B2*1.03+A2`, `D2=C2*1.03+A2`, `E2=D2*1.03+A2`.
Die Formeln werden für weitere Versuchsraten nach unten kopiert.
Die letzte Einzahlung eines Jahres erhält in diesem Jahr keine Zinsen;
im ersten Jahr werden daher nur $r$ Euro angespart.

**2. Versuchsraten**

| Jahresrate € | Jahr 1 € | Jahr 2 € | Jahr 3 € | Jahr 4 € |
|---:|---:|---:|---:|---:|
| 450 | 450,00 | 913,50 | 1390,91 | 1882,63 |
| 475 | 475,00 | 964,25 | 1468,18 | 1987,22 |
| 500 | 500,00 | 1015,00 | 1545,45 | 2091,81 |
| 478 | 478,00 | 970,34 | 1477,45 | 1999,77 |
| 479 | 479,00 | 972,37 | 1480,54 | 2003,96 |

**3. Gewählte Rate prüfen**

Die kleinste passende ganze Rate ist 479 € pro Jahr. Ihre vier Guthaben
stehen in der letzten Zeile. Die Rate 478 € verfehlt das Ziel um etwa
0,23 €, während 479 € es um etwa 3,96 € übertrifft. Mit wachsender fester
Rate wächst in jeder Tabellenperiode auch das Guthaben; deshalb reichen
noch kleinere ganze Raten ebenfalls nicht aus. Insgesamt werden viermal
479 €, also 1916 €, eingezahlt; die Differenz zum Endguthaben stammt aus Zinsen.

**4. Einzahlungstermine**

Die erste Rate liegt erst am Ende des ersten Jahres auf dem Konto.
$1{,}03r$ als erstes Jahresguthaben würde ihr zu Unrecht ein volles Jahr
Zinsen zuschreiben. Bei Einzahlung jeweils am Jahresanfang bekäme jede
Rate ein zusätzliches Zinsjahr. Bei derselben Rate wäre das Endguthaben
also höher und eine kleinere benötigte Rate wäre plausibel. Das ist ein
anderer Zahlungsplan; die bisherige Tabelle dürfte nicht unverändert gelten.
Eine neue genaue Rate für diesen Plan wird nicht verlangt.
''',r'''
# Worked solution: annual savings contribution

**1. Spreadsheet model**

For fixed annual contribution $r$, let $G_k$ be the balance after deposit
$k$. Then $G_0=0$ and $G_k=1.03G_{k-1}+r$.
One possible trial table has contributions in A and end-of-year balances
for years 1 to 4 in B through E. Its first data row is
`B2=A2`, `C2=B2*1.03+A2`, `D2=C2*1.03+A2`, `E2=D2*1.03+A2`.
Copy the formulas down for further trial contributions. A year-end deposit
earns no interest that year, so the first year's balance is just $r$ euros.

**2. Trial contributions**

| annual contribution € | year 1 € | year 2 € | year 3 € | year 4 € |
|---:|---:|---:|---:|---:|
| 450 | 450.00 | 913.50 | 1390.91 | 1882.63 |
| 475 | 475.00 | 964.25 | 1468.18 | 1987.22 |
| 500 | 500.00 | 1015.00 | 1545.45 | 2091.81 |
| 478 | 478.00 | 970.34 | 1477.45 | 1999.77 |
| 479 | 479.00 | 972.37 | 1480.54 | 2003.96 |

**3. Check the choice**

The smallest suitable whole-euro contribution is €479 per year. Its four
balances are in the final row. €478 misses the target by about €0.23,
whereas €479 exceeds it by about €3.96. A larger fixed contribution gives
a larger balance in every period; hence all still smaller whole-euro
contributions also fail. Four deposits of €479 total €1916; the difference
between that and the final balance is interest.

**4. Deposit timing**

The first contribution reaches the account only at the end of year 1.
Using $1.03r$ for the first year's balance incorrectly credits it with a full
year's interest. Beginning-of-year deposits would give every contribution
an extra year of interest. The same contribution would produce a larger
final balance, so a smaller required contribution is plausible. That is a
different payment schedule and needs a changed table. An exact new
contribution for that schedule is not required.
''',[
('spreadsheet-balance',6,'Reproduzierbare Tabellenkalkulation für feste Rate und vier Jahre mit Startguthaben null erstellt (2); Zellformeln mit richtiger Reihenfolge Vorjahreszins dann Einzahlung nachvollziehbar (3); Zeitpunkte erklärt (1).','Creates a reproducible spreadsheet for a fixed contribution and four years starting at zero (2); traceable cell formulas with interest on the prior balance followed by the deposit (3); explains timing (1).'),
('payment-search',6,'Grobe Versuchsraten mit passenden Endguthaben tabellarisch verglichen (3); Suche nachvollziehbar bis zu benachbarten ganzen Raten 478/479 mit Zielunterschreitung bzw. -erreichung verfeinert (3).','Compares coarse trial contributions and appropriate final balances in a table (3); traceably refines to neighbouring whole-euro contributions 478/479 below/above the target (3).'),
('check-payment',4,'Kleinste passende ganze Jahresrate 479 € genannt (1); vier Guthaben der gewählten Rate nachvollziehbar gezeigt (2); Minimalität anhand kleinerem Nachbarn und wachsendem Guthaben begründet (1).','States the smallest suitable whole-euro annual contribution €479 (1); traceably shows its four balances (2); justifies minimality using the smaller neighbour and increasing balances (1).'),
('payment-timing',4,'Fälschliche Sofortverzinsung am ersten Jahr konkret erklärt (2); Wirkung von Jahresanfangseinzahlungen auf Guthaben und benötigte Rate begründet (2).','Explains the erroneous immediate interest using the first year (2); justifies how beginning-of-year deposits affect the balance and required contribution (2).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine nachvollziehbare tabellenkalkulatorische Bestimmung einer regelmäßigen Rate mit Zellformeln und Ergebniswerten oder keine Prüfung anhand der Guthabenentwicklung am Finanzziel erkennbar ist. Ein passendes anderes Tabellenlayout genügt. Das Originalziel erlaubt Tilgung oder Sparrate; für diese Sparaufgabe ist kein zusätzlicher Tilgungsfall erforderlich. Eine zweite genaue Rate bei geändertem Einzahlungstermin, besondere Software oder ein Screenshot sind keine Pflicht. Lokale Übertragungs- oder Rechenfehler mit tragfähiger Methode und anrechenbarer Folgearbeit lösen keine Kappung aus.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no traceable spreadsheet determination of a regular contribution using cell formulas and values, or no check of balance development against the financial target. Another suitable table layout suffices. The original goal permits repayment or saving; no additional repayment case is required for this savings task. A second exact contribution for changed timing, particular software and a screenshot are not required. Local copying or arithmetic errors in a sound method with creditable follow-through do not trigger the cap.',
{'competence':'Estimate a regular savings contribution with spreadsheet balance evolution and contextual target check, satisfying the original repayment OR savings formulation.','timing':'Four annual deposits, after interest at each year end; rate3% annual; no first-year interest on first deposit.','boundary':'No mandatory additional loan example, no annuity/logarithmic solver.','coverage':'Own stable ID only; original4requires retained.'})

add('fc34449a-fbf4-574c-884f-ecdf48b42d2e',r'''
# Eine Laufzeit mit einer Tabellenkalkulation bestimmen

Zu Beginn liegen 1000 € auf einem Sparkonto. Jährlich werden 2 % Zinsen
auf das Guthaben zu Jahresbeginn gutgeschrieben. Danach werden jeweils am
Jahresende 200 € eingezahlt. Gesucht ist, nach wie vielen vollständigen
Jahren das Guthaben **erstmals mindestens 2500 €** beträgt. Zwischen den
Jahresenden gibt es keine Zinsgutschriften oder Einzahlungen. Gebühren
und Steuern werden im Modell nicht berücksichtigt.
Insgesamt sind **20 BE** erreichbar.

Nutze eine Tabellenkalkulation. Gib einen lesbaren Tabellenausschnitt und
nachvollziehbare Zellformeln ab. Bestimmte Software, Screenshots oder
Dateiendungen sind nicht vorgeschrieben. Rechne intern ungerundet und
zeige Guthaben auf Cent. Ein Logarithmus oder Laufzeitsolver ist nicht nötig.

**1. Eine Periodentabelle aufstellen (6 BE)**

Erfasse Periode 0 mit dem Anfangsguthaben. Führe die Tabelle danach mit
Jahr, Anfangsguthaben, Zinsen, Einzahlung und Endguthaben fort.
Erkläre deine Zellformeln und den Zeitpunkt der jährlichen Einzahlung.

**2. Bis zum Ziel weiterrechnen (6 BE)**

Lasse die Tabelle bis zur ersten Zielerreichung fortlaufen. Dokumentiere
die Guthaben einschließlich der letzten Periode unter dem Ziel und
der ersten Periode mit erreichtem Ziel. Markiere das Ergebnis.

**3. Die Laufzeit im Kontext prüfen (4 BE)**

Nenne die Laufzeit in Jahren sowie die Anzahl der Einzahlungen. Begründe,
warum sie die kürzeste passende Laufzeit ist. Eine Person möchte aus den
beiden benachbarten Tabellenwerten eine Bruchzahl von Jahren als tatsächlichen
Auszahlungszeitpunkt interpolieren. Beurteile dies anhand der vereinbarten
Zahlungs- und Zinszeitpunkte.

**4. Ein geändertes Modell prüfen (4 BE)**

Führe in einer zweiten Tabelle dieselbe Suche mit 0 % statt 2 % Jahreszins
durch. Bestimme die neue erste Zielperiode und vergleiche beide Laufzeiten.
Erkläre den Unterschied anhand der Guthabenentwicklung. Die jährliche
Einzahlung bleibt unverändert.
''',r'''
# Find a duration using a spreadsheet

Initially, a savings account holds €1000. Each year, 2% interest is credited
on the opening balance. Then €200 is deposited at year-end.
Find the number of complete years after which the balance **first reaches
at least €2500**. There are no interest credits or deposits between year-ends.
Ignore fees and taxes in this model. A total of **20 points** is available.

Use a spreadsheet. Submit a readable table excerpt and traceable cell formulas.
No particular software, screenshot or file extension is prescribed.
Keep full internal precision and display balances to cents. Logarithms
or duration solvers are not needed.

**1. Set up a period table (6 points)**

Record period 0 with its initial balance. Continue with columns for year,
opening balance, interest, deposit and closing balance. Explain your
cell formulas and the timing of the annual deposit.

**2. Continue to the target (6 points)**

Extend the table until the target is first reached. Document balances,
including the last period below target and the first period meeting it.
Mark the result.

**3. Check the duration in context (4 points)**

State the duration in years and number of deposits. Justify why it is the
shortest suitable duration. Someone wants to interpolate a fraction of a
year from the neighbouring table values as an actual withdrawal time.
Assess this using the agreed payment and interest-crediting times.

**4. Check a changed model (4 points)**

In a second table, repeat the search with 0% instead of 2% annual interest.
Find the new first target period and compare the durations. Explain the
difference using the balance development. The annual contribution stays
the same.
''',r'''
# Musterlösung: Ganze Zahlungsperioden

**1. Tabellenformeln**

Bei $G_k$ als Guthaben nach dem $k$-ten Jahresende gilt
$G_0=1000$ und $G_k=1{,}02G_{k-1}+200$.
Stehen in Zeile 2 das Jahr 0 in A und 1000 in E, kann die nächste Zeile
lauten: `A3=A2+1`, `B3=E2`, `C3=B3*2%`, `D3=200`,
`E3=B3+C3+D3`. Die Formeln werden nach unten kopiert.
Zuerst wird das bereits vorhandene Guthaben verzinst, danach wird eingezahlt.
Die 200 € erhalten für das gerade abgeschlossene Jahr noch keine Zinsen.

**2. Tabelle mit 2 % Zins**

| Jahr | Anfang € | Zinsen € | Einzahlung € | Ende € |
|---:|---:|---:|---:|---:|
| 0 | – | – | – | 1000,00 |
| 1 | 1000,00 | 20,00 | 200,00 | 1220,00 |
| 2 | 1220,00 | 24,40 | 200,00 | 1444,40 |
| 3 | 1444,40 | 28,89 | 200,00 | 1673,29 |
| 4 | 1673,29 | 33,47 | 200,00 | 1906,75 |
| 5 | 1906,75 | 38,14 | 200,00 | 2144,89 |
| 6 | 2144,89 | 42,90 | 200,00 | 2387,79 |
| 7 | 2387,79 | 47,76 | 200,00 | 2635,54 |

Die Anzeige ist auf Cent gerundet, die folgenden Zellen verwenden die intern
ungerundeten Werte. Dadurch können Summen der angezeigten gerundeten Spalten
im Einzelfall um einen Cent abweichen.

**3. Kontextprüfung**

Erstmals nach sieben Jahren ist das Ziel erreicht; bis dahin erfolgen
sieben Einzahlungen. Nach sechs Jahren fehlen noch etwa 112,21 €,
nach sieben Jahren liegt das Guthaben etwa 135,54 € über dem Ziel.
Das Guthaben steigt in jeder Periode; alle früheren Jahresenden reichen
also ebenfalls nicht. Im vereinbarten Modell ändert sich das Guthaben nur
an den Jahresenden. Ein interpolierter Bruchteil zwischen sechs und sieben
Jahren ist daher kein tatsächlich erreichter Zielzeitpunkt in diesem Modell.

**4. Ohne Zinsen**

Die zweite Tabelle verwendet dieselben Formeln mit Zinssatz 0 %.
Ihre Endguthaben für Jahr 0 bis 8 sind
$1000,1200,1400,1600,1800,2000,2200,2400,2600$ Euro.
Nach sieben Jahren sind es erst 2400 €, nach acht Jahren 2600 €.
Die neue Laufzeit beträgt acht Jahre mit acht Einzahlungen, also ein Jahr
mehr. Ohne Zinsen fehlt der zusätzliche Guthabenzuwachs; die Einzahlungen
allein überschreiten 2500 € erst in der nächsten vollständigen Periode.
''',r'''
# Worked solution: complete payment periods

**1. Cell formulas**

For balance $G_k$ after year-end $k$,
$G_0=1000$ and $G_k=1.02G_{k-1}+200$.
If row 2 has year 0 in A and 1000 in E, the next row can be
`A3=A2+1`, `B3=E2`, `C3=B3*2%`, `D3=200`,
`E3=B3+C3+D3`. Copy the formulas down.
Interest is credited on the existing balance first, then the deposit is made.
The €200 earns no interest for the year just completed.

**2. Table at 2%**

| year | opening € | interest € | deposit € | closing € |
|---:|---:|---:|---:|---:|
| 0 | – | – | – | 1000.00 |
| 1 | 1000.00 | 20.00 | 200.00 | 1220.00 |
| 2 | 1220.00 | 24.40 | 200.00 | 1444.40 |
| 3 | 1444.40 | 28.89 | 200.00 | 1673.29 |
| 4 | 1673.29 | 33.47 | 200.00 | 1906.75 |
| 5 | 1906.75 | 38.14 | 200.00 | 2144.89 |
| 6 | 2144.89 | 42.90 | 200.00 | 2387.79 |
| 7 | 2387.79 | 47.76 | 200.00 | 2635.54 |

Displayed values are rounded to cents; subsequent cells use the unrounded
internal values. Consequently, adding displayed rounded columns can sometimes
differ by one cent.

**3. Context check**

The target is first reached after seven years, by which time seven deposits
have been made. After six years the balance is about €112.21 short;
after seven years it exceeds the target by about €135.54. The balance
increases every period, so all earlier year-ends also fail. In the agreed
model, the balance changes only at year-ends. An interpolated fraction
between six and seven years is therefore not an actual target-reaching
time in this model.

**4. Without interest**

The second table uses the same formulas with 0% interest.
Its closing balances for years 0 through 8 are
$1000,1200,1400,1600,1800,2000,2200,2400,2600$ euros.
After seven years there is only €2400; after eight years there is €2600.
The new duration is eight years with eight deposits, one year longer.
Without interest there is no additional balance growth; deposits alone
exceed €2500 only in the next complete period.
''',[
('period-table',6,'Anfangsperiode mit 1000 € korrekt erfasst (1); reproduzierbare Tabellenkalkulation mit Periodenfortschreibung, Zellbezügen und 2%-Verzinsung eingerichtet (3); Reihenfolge Zins dann Einzahlung und zugehörige Zeitpunkte erklärt (2).','Correctly records initial period and €1000 (1); sets up a reproducible spreadsheet with period progression, cell references and 2% interest (3); explains interest-then-deposit ordering and timing (2).'),
('duration-search',6,'Guthabenentwicklung bis Jahr 7 nachvollziehbar tabellarisch berechnet (4); Zielvergleich mit Jahr 6 und 7 belegt und erste Zielperiode markiert (2).','Traceably calculates balance development through year 7 in a table (4); supports target comparison for years 6 and 7 and marks the first target period (2).'),
('check-duration',4,'Sieben Jahre und sieben Einzahlungen mit Minimalität anhand der Entwicklung erklärt (2); unpassende Bruchjahres-Interpolation anhand diskreter Zahlungs-/Zinszeitpunkte begründet zurückgewiesen (2).','Explains seven years and seven deposits with minimality from the balance development (2); justifiably rejects fractional-year interpolation using discrete payment/interest times (2).'),
('zero-interest',4,'Zweite tabellarische Entwicklung mit 0 % bis zur ersten Zielperiode 8 belegt (2); Laufzeitvergleich und Wirkung fehlender Zinsen kontextuell erläutert (2).','Supports a second table at 0% through first target period 8 (2); explains the duration comparison and effect of missing interest in context (2).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine nachvollziehbare tabellenkalkulatorische Laufzeitsuche mit Zellformeln und Periodenwerten oder keine Prüfung der ersten passenden vollständigen Zins-/Zahlungsperiode am Finanzziel erkennbar ist. Die tabellarische Gegenüberstellung der letzten Zielunterschreitung und der ersten Zielerreichung kann die Kontextprüfung bereits zeigen; eine bestimmte Wortwahl oder besondere Software ist nicht nötig. Eine bloße Logarithmus-/Solverzahl ersetzt die Methode nicht. Lokale Rechen-, Rundungs- oder Übertragungsfehler bei tragfähiger Methode und korrekter Folgearbeit lösen keine Kappung aus.',
'Before comparison with the passing threshold, cap the total at 14 points if the whole submission contains no traceable spreadsheet duration search with cell formulas and period values, or no check of the first suitable complete interest/payment period against the financial target. A table comparing the last below-target period and first target-reaching period can itself demonstrate this contextual check; no prescribed wording or particular software is needed. A bare logarithm/solver number does not replace the method. Local arithmetic, rounding or copying errors within a sound method and correct follow-through do not trigger the cap.',
{'competence':'Duration estimated as count of full interest/payment periods using spreadsheet and contextual first-target check.','timing':'Annual interest then annual end-of-year contribution; no credits or deposits between year ends; seven years equals seven contributions.','boundary':'No continuous-time or logarithmic-solver requirement; fractional interpolation is explicitly outside this contract.','coverage':'Own stable ID only; original4requires retained.'})

assert len(forms)==6
(H/'whole-current-and-proposed-contracts.json').write_text(json.dumps({'status':'PRIVATE_AUTHOR_PROPOSAL_PENDING_GENUINE_INDEPENDENT_REVIEW','canonicalPath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','bindingPolicy':'Bind the finite wholeCurrentGoal objects exactly; unrelated root-canonical changes are permitted.','proposedPublishedArtifactBase':BASE,'forms':forms},ensure_ascii=False,indent=2)+'\n')
print('Wrote six complete bilingual author proposals:',H)
