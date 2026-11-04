import copy,hashlib,json,pathlib,textwrap
H=pathlib.Path(__file__).resolve().parent
BASE='curricula/DE/Gymnasium/assessments/mathematik/diagrams-algebra-notation-three-same-identity-2026-11-04-v1'
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

add('d668c22d-caeb-5e91-8980-721c931a2bcf',r'''
# Eine Diagrammaussage verständlich korrigieren

Die Schulbibliothek zählt alle Besuche in zwei gleich langen Schulwochen.
Ein Besuch ist ein gezählter Bibliotheksaufenthalt; dieselbe Person kann
mehrmals kommen. Der folgende Balkenausschnitt wird veröffentlicht.
Die Skala bezeichnet **Besuche**, die Zahlen rechts nennen die Endwerte.

```text
Besuche je Schulwoche
           90   100  110  120
           |----|----|----|
Woche A    |##### 100
Woche B    |############### 120
```

Eine Überschrift lautet: **„In Woche B dreimal so viele Besuche wie in A!“**
Insgesamt sind **20 BE** erreichbar. Begründe deine Antworten anhand der
Darstellung und formuliere so, dass eine andere Schülerin sie verstehen kann.

**1. Die Aussage überprüfen (6 BE)**

Lies die beiden Besuchszahlen ab. Berechne den absoluten Unterschied und
die prozentuale Zunahme gegenüber Woche A. Prüfe damit die Überschrift.

**2. Das Missverständnis erklären und korrigieren (6 BE)**

Erkläre, wie die gezeigten Balkenlängen den Eindruck „dreimal so viele“
erzeugen können. Beziehe dich auf den Anfang der Skala. Schreibe die
Überschrift und eine kurze Erläuterung verständlich und fachlich richtig um.
Erkläre auch, warum aus den Besuchszahlen nicht folgt, dass 120 verschiedene
Personen in Woche B die Bibliothek besucht haben.

**3. Eine klarere Darstellung vorschlagen (8 BE)**

Schlage eine konkrete alternative Darstellung derselben Daten vor.
Setze deinen Vorschlag als beschriftetes Diagramm oder als Wertetabelle
mit passender Erläuterung um. Zeige, welche Skala, Beschriftungen und Angaben
den ursprünglichen Irrtum verhindern. Die ursprünglichen Besuchszahlen
müssen erhalten bleiben. Begründe, weshalb deine Darstellung für den
Vergleich klarer ist.
''',r'''
# Correct a diagram claim clearly

A school library counts all visits during two school weeks of equal length.
A visit is a recorded stay in the library; the same person may visit more
than once. The following bar excerpt is published. Its scale denotes
**visits**, and the numbers on the right give the endpoint values.

```text
Visits per school week
           90   100  110  120
           |----|----|----|
Week A     |##### 100
Week B     |############### 120
```

A headline says: **“Week B had three times as many visits as A!”**
A total of **20 points** is available. Use the display to justify your
answers and write so another pupil can understand your explanation.

**1. Check the statement (6 points)**

Read both visit counts. Calculate their absolute difference and the
percentage increase relative to week A. Use these to assess the headline.

**2. Explain and correct the misconception (6 points)**

Explain how the displayed bar lengths can suggest “three times as many”.
Refer to where the scale starts. Rewrite the headline and add a short,
clear, mathematically correct explanation. Also explain why the visit counts
do not imply that 120 different people visited the library in week B.

**3. Propose a clearer representation (8 points)**

Propose a concrete alternative representation of the same data. Implement
it as a labelled diagram or a value table with an appropriate explanation.
Show which scale, labels and information prevent the original misconception.
Keep the original visit counts unchanged. Justify why your representation
makes the comparison clearer.
''',r'''
# Musterlösung: Besuchszahlen und Balkenlängen

**1. Zahlenvergleich**

Woche A hat 100, Woche B 120 Besuche. Die Zunahme ist $120-100=20$
Besuche, relativ zu A also $20/100=0{,}20=20\,\%$.
B hat $120/100=1{,}2$-mal so viele Besuche, nicht dreimal so viele.
Eine Verdreifachung von 100 würde 300 Besuche bedeuten.

**2. Ursache und Korrektur**

Die sichtbaren Balken beginnen bei 90 statt bei null. Sie stellen als
Längen nur die Zusätze $100-90=10$ und $120-90=30$ dar. Diese Zusätze
stehen im Verhältnis $1:3$, die gesamten Besuchszahlen aber nicht.
Die abgelesenen Zahlen können richtig sein, obwohl der Balkenvergleich
visuell irreführt. Eine mögliche Korrektur lautet:
„20 Besuche mehr: In Woche B gab es 120 statt 100 Besuche, also 20 % mehr.“
Die Erläuterung benennt den abgeschnittenen Skalenanfang und das richtige
Bezugs-Ganze 100. Da eine Person mehrmals kommen kann, zählen Besuche
keine verschiedenen Personen; 120 Besuche können von weniger als 120
Personen stammen. Eine passende andere klare Formulierung ist gleichwertig.

**3. Klarere Alternative**

Zum Beispiel ein Balkendiagramm ab null mit einheitlicher Skala,
übersichtlichen Beschriftungen und den exakten Zahlen:

```text
Besuche (jede # steht fuer 10)
           0    50   100  150
           |----|----|----|
Woche A    |########## 100
Woche B    |############ 120
```

Jetzt zeigen die Balken das Verhältnis $100:120=5:6$; B ist nur ein Fünftel
länger als A. Beide Wochen, die Einheit „Besuche“ und die Nullbasis sind
sichtbar. Alternativ reicht eine klare Tabelle:

| Schulwoche | Besuche |
|---|---:|
| A | 100 |
| B | 120 |

Dazu etwa: „Zunahme 20 Besuche beziehungsweise 20 %, keine Verdreifachung;
gezählt sind Besuche, nicht verschiedene Personen.“ Die Tabelle zeigt
exakte Werte und erzeugt keine künstlichen Längenverhältnisse. Andere
konkrete klarere Darstellungen mit passender Begründung sind anzuerkennen;
eine bestimmte Diagrammart ist nicht vorgeschrieben.
''',r'''
# Worked solution: visit counts and bar lengths

**1. Numerical comparison**

Week A has 100 visits and week B has 120. The increase is $120-100=20$
visits, relative to A $20/100=0.20=20\,\%$.
B has $120/100=1.2$ times as many visits, not three times as many.
Tripling 100 would give 300 visits.

**2. Cause and correction**

The visible bars start at 90 rather than zero. Their lengths show only
the additions $100-90=10$ and $120-90=30$. These additions are in ratio
$1:3$, but the whole counts are not. The displayed numbers can be correct
while the bar comparison is visually misleading. One possible correction is:
“20 more visits: week B had 120 instead of 100 visits, a 20% increase.”
The explanation identifies the truncated scale and the correct reference
whole of 100. Since a person can visit repeatedly, visits do not count
distinct people; fewer than 120 people may account for 120 visits.
Equivalent clear formulations are valid.

**3. Clearer alternative**

For example, use a zero-based bar chart with a uniform scale, clear labels
and exact values:

```text
Visits (each # represents 10)
           0    50   100  150
           |----|----|----|
Week A     |########## 100
Week B     |############ 120
```

The bar ratio now represents $100:120=5:6$; B is only one fifth longer
than A. Both weeks, the unit “visits” and the zero baseline are visible.
Alternatively, a clear table suffices:

| school week | visits |
|---|---:|
| A | 100 |
| B | 120 |

Add, for example: “An increase of 20 visits or 20%, not a tripling;
these are visits, not distinct people.” The table gives exact values
without creating artificial length ratios. Credit other concrete, clearer
representations with a suitable explanation; no particular chart type is
prescribed.
''',[
('read-and-check',6,'100 und 120 Besuche korrekt abgelesen (2); Unterschied 20 und Zunahme 20 % mit Bezugsgröße A berechnet (2); Verdreifachungsbehauptung anhand der tatsächlichen Zahlen richtig beurteilt (2).','Reads 100 and 120 visits (2); calculates difference20 and increase20% using A as reference (2); correctly assesses tripling using actual values (2).'),
('explain-correct',6,'Skalenanfang90 und dadurch gezeigte Zusätze10/30 als Ursache des falschen Dreifach-Eindrucks verständlich erklärt (3); fachlich richtige Überschrift/Erläuterung formuliert (2); Besuche von verschiedenen Personen unterschieden (1).','Clearly explains baseline90 and additions10/30 as the cause of the false threefold impression (3); supplies a correct headline/explanation (2); distinguishes visits from distinct people (1).'),
('clearer-alternative',8,'Konkrete passende Alternative vorgeschlagen (2); beschriftet mit korrekten unveränderten Werten, Einheit und geeigneter Skala oder klarer Tabellenstruktur umgesetzt (4); verständlich begründet, wie die Alternative den ursprünglichen Irrtum verhindert (2).','Proposes a concrete suitable alternative (2); implements it with labels, correct unchanged values, unit, and suitable scale or clear table structure (4); clearly justifies how it prevents the original misconception (2).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine verständliche fachlich tragfähige Erklärung und Korrektur einer Diagrammfehlinterpretation oder keine konkrete klarere alternative Darstellung mit nachvollziehbarer Begründung erkennbar ist. Eine passende Wertetabelle samt Erklärung genügt als Alternative; eine bestimmte Diagrammart, Software oder Formulierung ist keine Pflicht. Leistungen an beliebiger Stelle zählen. Ein lokaler Prozent-, Zeichen- oder Übertragungsfehler bei erkennbar richtiger Deutung löst keine Kappung aus.',
'Before comparison with the passing threshold, cap the total at14points if the whole submission contains no clear sound explanation and correction of a diagram misconception, or no concrete clearer alternative with a traceable justification. A suitable table with explanation suffices; no particular chart type, software or wording is required. Work anywhere counts. A local percentage, drawing or copying error in an otherwise sound interpretation does not trigger the cap.',
{'competence':'Explain and correct an actual diagram misconception and propose a concrete clearer representation.','diagram':'Actual labelled readable ASCIIbars are embedded in both delivered task strings using existing Markdown fenced code; no image dependency or new runtime feature.','reuse':'Existing7337049apart4covers a relevant kernel inside a broader quadratic/tool/intersection task; ownJ7formavoids unrelated higher preparation and protects the whole misconception/alternative competence.','coverage':'OwnstableIDonly;original2requires retained.'})

add('fa0b6b69-ce54-4711-90e6-26f27249cd71',r'''
# Lösungswege bei zwei Gleichungsstrukturen vergleichen

Arbeite über den reellen Zahlen. Gegeben sind
$$\text{A: }3(x-2)+4=2x+9,$$
$$\text{B: }\frac6{x-1}=\frac32.$$
Zeige deine Umformungen und begründe die entscheidenden Schritte.
Insgesamt sind **20 BE** erreichbar.

**1. Klammergleichung A lösen und prüfen (6 BE)**

Löse A. Erläutere, welche Rolle das Distributivgesetz spielt.
Prüfe deine Lösung durch Einsetzen in die ursprüngliche Gleichung A;
zeige dabei die Werte beider Seiten.

**2. Verhältnisgleichung B lösen und prüfen (6 BE)**

Notiere zuerst die zulässigen Werte von $x$. Löse B mit begründeten
Umformungen und erläutere die Verhältnisstruktur. Prüfe die Lösung durch
Einsetzen in die ursprüngliche Gleichung B, einschließlich der Nenner.

**3. Die Wege vergleichen (8 BE)**

Erkläre anhand deiner beiden Rechnungen eine Gemeinsamkeit und zwei
wesentliche Unterschiede der tragenden Strukturen und zulässigen
Umformungen. Gehe besonders darauf ein, welche Terme verteilt werden
und warum beim Beseitigen von Nennern Bedingungen nötig sind.
Eine Mitschülerin schreibt: „Ich kann bei B auch $x=1$ einsetzen und dann
die Nenner wegmultiplizieren; dadurch wird die Rechnung wieder zulässig.“
Korrigiere diese Aussage verständlich. Erkläre schließlich, warum die
Proben in den Ausgangsgleichungen die Ergebnisse kontrollieren.
''',r'''
# Compare methods for two equation structures

Work over the real numbers. Consider
$$\text{A: }3(x-2)+4=2x+9,$$
$$\text{B: }\frac6{x-1}=\frac32.$$
Show your transformations and justify the key steps.
A total of **20 points** is available.

**1. Solve and check bracketed equation A (6 points)**

Solve A. Explain the role of the distributive law. Check your solution
by substituting into the original equation A, showing both sides' values.

**2. Solve and check ratio equation B (6 points)**

First state the admissible values of $x$. Solve B using justified
transformations and explain the ratio structure. Check the solution
in the original equation B, including the denominators.

**3. Compare the methods (8 points)**

Use your two calculations to explain one similarity and two major
differences in their governing structures and admissible transformations.
In particular, discuss distributing terms and why clearing denominators
requires conditions. A classmate writes: “In B I can also substitute
$x=1$ and then multiply away the denominators; that makes the calculation
valid again.” Correct this statement clearly. Finally, explain why
checking in the original equations verifies the results.
''',r'''
# Musterlösung: Klammer- und Verhältnisstruktur

**1. Gleichung A**

Das Distributivgesetz liefert $3(x-2)=3x-6$:
$$3x-6+4=2x+9\quad\Longleftrightarrow\quad
3x-2=2x+9\quad\Longleftrightarrow\quad x=11.$$
Die Probe in A ergibt links $3(11-2)+4=31$ und rechts $2\cdot11+9=31$.
Damit ist die Lösungsmenge $\{11\}$.

**2. Gleichung B**

Der Nenner $x-1$ darf nicht null sein, also ist $D=\mathbb R\setminus\{1\}$.
Der Nenner2 ist ohnehin ungleich null. Für zulässige $x$ darf man beide
Seiten mit $2(x-1)$ multiplizieren:
$$12=3(x-1)\quad\Longleftrightarrow\quad
12=3x-3\quad\Longleftrightarrow\quad x=5.$$
Gleichwertig ist die proportionale Überlegung: Von Zähler3 zu6 wird mit2
multipliziert, also muss auch der Nenner von2 auf4 wachsen; $x-1=4$.
Die Probe ergibt $x-1=4\ne0$ und links $6/4=3/2$, gleich der rechten Seite.
Die Lösungsmenge ist $\{5\}$.

**3. Vergleich und Korrektur**

Beide Wege erhalten für zulässige Werte die Gleichheit durch äquivalente
Umformungen, etwa durch Addition/Subtraktion desselben Terms auf beiden
Seiten oder Multiplikation mit derselben von null verschiedenen Zahl.
Bei A ist die additive Termstruktur mit Klammer ausschlaggebend: Der Faktor3
wird auf beide Klammerglieder verteilt. Es gibt keine ausgeschlossenen
Nennerwerte. Bei B steht eine Gleichheit von Verhältnissen im Mittelpunkt.
Das Beseitigen des variablen Nenners setzt $x\ne1$ voraus; innerhalb dieser
Definitionsmenge führt die Nennerbeseitigung zu einer äquivalenten Gleichung.
Auch in der entstehenden Gleichung kann das Distributivgesetz vorkommen;
die beiden Verfahren sind nicht durch völlig verschiedene Rechenregeln getrennt.

Bei $x=1$ ist die Ausgangsgleichung B undefiniert. Nachträgliches Multiplizieren
kann eine Division durch null nicht gültig machen. Eine umgeformte Gleichung
ersetzt die ursprüngliche Definitionsbedingung nicht.
Die Proben überprüfen, dass die gefundenen Werte in der jeweiligen
Ausgangsgleichung tatsächlich gleiche Seitenwerte und zulässige Ausdrücke
ergeben. Nur Einsetzen in eine falsch umgeformte Zwischenzeile würde diese
Kontrolle nicht leisten. Gleichwertige konkrete Vergleichserklärungen sind richtig.
''',r'''
# Worked solution: bracket and ratio structures

**1. Equation A**

The distributive law gives $3(x-2)=3x-6$:
$$3x-6+4=2x+9\quad\Longleftrightarrow\quad
3x-2=2x+9\quad\Longleftrightarrow\quad x=11.$$
Checking in A gives $3(11-2)+4=31$ on the left and $2\cdot11+9=31$
on the right. The solution set is $\{11\}$.

**2. Equation B**

The denominator $x-1$ must be nonzero, so $D=\mathbb R\setminus\{1\}$.
The denominator2 is already nonzero. For admissible $x$, multiply both
sides by $2(x-1)$:
$$12=3(x-1)\quad\Longleftrightarrow\quad
12=3x-3\quad\Longleftrightarrow\quad x=5.$$
An equivalent proportional argument doubles numerator3 to6, so denominator2
must double to4: $x-1=4$. Checking gives $x-1=4\ne0$ and left side
$6/4=3/2$, equal to the right side. The solution set is $\{5\}$.

**3. Comparison and correction**

Both methods preserve equality for admissible values through equivalent
transformations, such as adding/subtracting the same expression on each
side or multiplying by the same nonzero number.
In A, the additive bracket structure is central: factor3 is distributed
to both bracket terms. No denominator values are excluded. B is an equality
of ratios. Clearing its variable denominator requires $x\ne1$; on this
domain, it produces an equivalent equation. The distributive law may also
occur in the resulting equation: the methods do not use wholly separate
arithmetic rules.

At $x=1$, the original equation B is undefined. Multiplication afterwards
cannot make division by zero valid. A transformed equation does not replace
the original domain restriction. The checks show that the obtained values
produce equal sides and admissible expressions in each original equation.
Substituting only into an incorrectly transformed intermediate line would
not provide that check. Equivalent concrete comparisons are valid.
''',[
('bracket-solve-check',6,'A nachvollziehbar zu x=11 gelöst (3); Distributivgesetz als Struktur erklärt (1); Probe in der ursprünglichen A mit gleichen Seitenwerten31 gezeigt (2).','Traceably solves A giving x=11 (3); explains the distributive structure (1); checks the original A with both sides31 (2).'),
('ratio-solve-check',6,'Zulässige Nenner bzw. x≠1 festgehalten (1); B mit begründeter Nennerbeseitigung oder Proportionalität zu x=5 gelöst (3); Probe in ursprünglicher B einschließlich Nennerzulässigkeit gezeigt (2).','States admissible denominators or x≠1 (1); solves B giving x=5 with justified denominator clearing or proportionality (3); checks original B including admissible denominator (2).'),
('compare-structures',8,'Eine Gemeinsamkeit zulässiger Äquivalenzumformungen konkret erläutert (2); Klammerstruktur gegenüber Verhältnisstruktur mit Bedingungen sinnvoll verglichen (3); Behauptung zu x=1 fachlich korrigiert (2); Zweck der Ausgangsgleichungsproben erklärt (1).','Explains a concrete similarity in admissible equivalent transformations (2); meaningfully compares bracket and ratio structures with conditions (3); corrects the x=1claim (2); explains the purpose of checks in the original equations (1).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe eine der beiden Gleichungsarten überhaupt nicht mit tragfähigem Lösungsweg bearbeitet wird, kein fachlich nachvollziehbarer Strukturvergleich vorliegt oder keine Beachtung zulässiger Nenner oder überhaupt keine Einsetzprobe in den Ausgangsgleichungen erkennbar ist. Eine korrekte Nenner-/Probenleistung an beliebiger Stelle zählt; das Fehlen einer einzelnen Probe oder eines einzelnen Vergleichsdetails ist zunächst eine lokale Teilpunktfrage. Ein lokaler Rechenfehler bei tragfähigem Weg löst keine Kappung aus; richtige Folgearbeit bleibt anrechenbar.',
'Before comparison with the passing threshold, cap the total at14points if the whole submission contains no sound attempt at one of the two equation types, no traceable structural comparison, or no admissible-denominator reasoning, or no substitution check at all in an original equation. Correct denominator/check work anywhere counts; a missing single check or comparison detail is initially a local partial-credit issue. A local arithmetic error in a sound method does not trigger the cap; correct follow-through remains creditable.',
{'competence':'Solve both equation types, explain distributivity/proportionality with admissible denominators, compare transformations and check original equations.','scope':'Both equations remain simple J8linear structures; no quadratic or general rational-equation solver requirement.','reuse':'No current explicit existing coverageform found.','coverage':'Own stableIDonly; original3requires retained.'})

add('647ec09d-68ae-57db-9ca4-aeb2da4218f1',r'''
# Mengen-, Intervall- und Funktionsnotation passend verwenden

Wähle jeweils eine Schreibweise, die zur beschriebenen mathematischen
Aussage passt, und erläutere ihre Bedeutung. Arbeite in Teil 1 mit den
natürlichen, in Teil 2 und 3 mit reellen Zahlen. Insgesamt sind **20 BE** erreichbar.

**1. Eine Menge natürlicher Zahlen angeben (6 BE)**

$M$ soll genau die natürlichen Zahlen enthalten, die mindestens2 und kleiner
als7 sind. Schreibe $M$ einmal aufzählend und einmal mit einer beschreibenden
Mengenbedingung. Entscheide, ob $6\in M$ und $7\in M$ gelten.
Erkläre den Unterschied zwischen der Zahl6 und der Menge $\{6\}$.

**2. Einen kontinuierlichen Bereich als Intervall schreiben (6 BE)**

$P$ enthält alle reellen Zahlen, die größer als $-2$ und höchstens3 sind.
Schreibe $P$ als Intervall und als Menge mit Bedingung.
Erläutere die Bedeutung beider Intervallgrenzen. Prüfe, ob $-2$, $3$
und $2{,}5$ dazugehören. Eine Person schlägt
$P=\{-1,0,1,2,3\}$ vor. Erkläre, warum diese Schreibweise die beschriebene
Menge nicht vollständig erfasst.

**3. Eine Zuordnung formal beschreiben (8 BE)**

Für Streckenlängen $x$ von0 bis einschließlich5 Kilometern kostet eine
modellhafte Fahrt $2x+1$ Euro. Beschreibe diese Zuordnung mit Funktionsname,
Definitionsmenge, einer geeigneten Zielmenge und Zuordnungsvorschrift.
Bestimme und deute $f(2)$ und notiere den zugehörigen Punkt des Graphen.
Erkläre, welche unterschiedlichen Objekte $f$, $f(2)$ und $(2,f(2))$
bezeichnen. Korrigiere die Aussage „Die Funktion ist $f=5$“, wenn damit
die Kosten einer Fahrt von2 Kilometern gemeint sind.
''',r'''
# Use set, interval and function notation appropriately

For each statement, choose suitable notation and explain its meaning.
Use natural numbers in part1 and real numbers in parts2and3.
A total of **20 points** is available.

**1. State a set of natural numbers (6 points)**

$M$ consists exactly of the natural numbers at least2 and less than7.
Write $M$ once by listing its elements and once in set-builder notation.
Decide whether $6\in M$ and $7\in M$. Explain the difference between
the number6 and the set $\{6\}$.

**2. Write a continuous range as an interval (6 points)**

$P$ contains all real numbers greater than $-2$ and at most3.
Write $P$ as an interval and in set-builder notation. Explain the meaning
of both interval endpoints. Check membership of $-2$, $3$ and $2.5$.
Someone proposes $P=\{-1,0,1,2,3\}$. Explain why this notation fails
to capture the whole set described.

**3. Describe a mapping formally (8 points)**

For distances $x$ from0 up to and including5 kilometres, a hypothetical
journey costs $2x+1$ euros. Describe this mapping using a function name,
domain, suitable codomain and assignment rule. Find and interpret $f(2)$,
and state the corresponding graph point. Explain the different objects
represented by $f$, $f(2)$ and $(2,f(2))$. Correct the statement
“The function is $f=5$” if the intended meaning is the cost of a2-kilometre
journey.
''',r'''
# Musterlösung: Objekte richtig bezeichnen

**1. Endliche Menge**

$$M=\{2,3,4,5,6\}=\{n\in\mathbb N\mid2\leq n<7\}.$$
Es gilt $6\in M$ und $7\notin M$. Die Zahl6 ist ein einzelnes Element;
$\{6\}$ ist eine Menge, deren einziges Element diese Zahl ist. Beides
bezeichnet unterschiedliche Objekte. Eine feste Konvention, ob0 zu den
natürlichen Zahlen gehört, ändert dieses Beispiel nicht.

**2. Reelles Intervall**

$$P=(-2,3]=\{x\in\mathbb R\mid-2<x\leq3\}.$$
Auch $]-2;3]$ ist eine passende Schulschreibweise. Links ist der Randwert
$-2$ ausgeschlossen, rechts ist3 eingeschlossen. Daher gehören $3$ und
$2{,}5$ dazu, $-2$ nicht. Die endliche Liste enthält nur fünf ganze Zahlen
und lässt zum Beispiel $2{,}5$ aus, obwohl diese reelle Zahl die Bedingung
erfüllt. Ein Intervall enthält alle passenden Zwischenwerte, keine bloße
Liste ausgewählter Zahlen.

**3. Funktion, Wert und Graphpunkt**

Zum Beispiel
$$f:[0,5]\longrightarrow\mathbb R,\qquad x\longmapsto2x+1.$$
Die Eingabe ist eine Streckenlänge in km, die Ausgabe sind Kosten in Euro.
Eine andere geeignete Zielmenge wie $[1,11]$ ist ebenfalls zulässig;
eine eindeutige Zielmenge ist hier nicht vorgeschrieben.
Die Definitionsmenge $[0,5]$ enthält genau die zugelassenen reellen
Streckenlängen einschließlich beider Grenzen. Die Zuordnung gibt jeder
dieser Eingaben genau einen Kostenwert.

$f(2)=2\cdot2+1=5$ bedeutet: Für2 Kilometer gibt das Modell5 Euro aus.
Der Graphpunkt ist $(2,5)$ mit den passenden Achseneinheiten km und Euro.
$f$ bezeichnet die ganze Funktion beziehungsweise Zuordnung, $f(2)$
einen einzelnen Zahlenwert und $(2,f(2))$ ein geordnetes Zahlenpaar,
also einen Punkt des Graphen. „$f=5$“ beschreibt hier nicht die ganze
angegebene Funktion. Richtig ist „$f(2)=5$“ für den betrachteten Eingabewert.
Gleichwertige gebräuchliche Funktions- und Punktschreibweisen sind richtig.
''',r'''
# Worked solution: naming the right objects

**1. Finite set**

$$M=\{2,3,4,5,6\}=\{n\in\mathbb N\mid2\leq n<7\}.$$
We have $6\in M$ and $7\notin M$. The number6 is one element;
$\{6\}$ is a set whose only element is that number. They denote different
objects. Whether a convention includes0 among the natural numbers does
not affect this example.

**2. Real interval**

$$P=(-2,3]=\{x\in\mathbb R\mid-2<x\leq3\}.$$
The school notation $]-2;3]$ is also valid. The left endpoint $-2$ is
excluded; the right endpoint3 is included. Thus $3$ and $2.5$ belong,
but $-2$ does not. The finite list contains only five integers, omitting
for example $2.5$, which satisfies the stated condition. An interval
includes all suitable intermediate real numbers, not just selected values.

**3. Function, value and graph point**

For example,
$$f:[0,5]\longrightarrow\mathbb R,\qquad x\longmapsto2x+1.$$
Input is distance in km; output is cost in euros. Another suitable codomain,
such as $[1,11]$, is equally valid; no unique codomain is prescribed.
The domain $[0,5]$ consists of the allowed real distances including both
endpoints. The mapping assigns exactly one cost to every allowed input.

$f(2)=2\cdot2+1=5$ means that the model gives a cost of5euros for2km.
The graph point is $(2,5)$, with axis units km and euros.
$f$ denotes the whole function or mapping, $f(2)$ one numerical value,
and $(2,f(2))$ an ordered pair, a point on the graph. Here “$f=5$” does
not describe the stated whole function. “$f(2)=5$” is correct for the
input considered. Equivalent conventional function and point notation is valid.
''',[
('set-notation',6,'M korrekt aufzählend und durch Mengenbedingung angegeben (je 2); Zugehörigkeit6/7 richtig geprüft (1); Zahl und einelementige Menge verständlich unterschieden (1).','Correctly writes M as a list and set-builder description (2 each); checks membership6/7 (1); clearly distinguishes a number and singleton set (1).'),
('interval-notation',6,'P in passender Intervall- und Mengenschreibweise angegeben (je 1); offene/geschlossene Grenze und Mitgliedschaft der drei Werte erläutert (2); endliche Liste mit passendem ausgelassenem reellen Zwischenwert als unvollständig erklärt (2).','Writes P in suitable interval and set-builder notation (1 each); explains open/closed endpoints and membership of all three values (2); uses an omitted intermediate real value to explain why the finite list is incomplete (2).'),
('function-notation',8,'Passende Funktionsnotation mit Definitionsmenge, geeigneter Zielmenge und Zuordnungsvorschrift angegeben (3); f(2)=5 mit Kontext und Graphpunkt korrekt (2); Funktion, Funktionswert und geordnetes Paar unterschieden und missverständliches f=5 korrigiert (3).','Gives appropriate function notation with domain, suitable codomain and assignment rule (3); correct f(2)=5 with context and graph point (2); distinguishes function, function value and ordered pair and corrects f=5 (3).')],
'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn in der ganzen Abgabe keine tragfähige Anwendung einer der drei ursprünglichen Notationsarten Mengen/Intervalle/Funktionen oder keine verständliche Erläuterung der dadurch bezeichneten Objekte beziehungsweise Zuordnungen erkennbar ist. Gemeint ist das vollständige Fehlen einer Notationsart oder der Objektdeutung, nicht ein einzelner Klammer-, Zeichen- oder Rechenfehler. Gebräuchliche gleichwertige Intervall-, Mengen- und Funktionsschreibweisen, zulässige Zielmengen und Leistungen an beliebiger Stelle zählen; keine bestimmte Zeichenfolge ist verpflichtend.',
'Before comparison with the passing threshold, cap the total at14points if the whole submission contains no sound use of one of the three original notation types—sets, intervals, functions—or no clear explanation of the objects or mappings denoted. This means complete absence of a notation type or object interpretation, not one bracket, symbol or arithmetic error. Conventional equivalent interval, set and function notation, suitable codomains and work anywhere count; no prescribed character sequence is required.',
{'competence':'Whole original selection, correct use and object explanation for sets, intervals and functions.','boundary':'No unique codomain, fixed typography, convention about0inN or higher logarithmic/Newton solving is required.','reuse':'Existing4c319dfd uses sets/intervals in a higher ln/Newton context but does not require independent whole function mapping notation; broader full exam not reused as thisJ8form.','coverage':'OwnstableIDonly; original2requires unchanged.'})

assert len(forms)==3
(H/'whole-current-and-proposed-contracts.json').write_text(json.dumps({'status':'PRIVATE_AUTHOR_PROPOSAL_PENDING_GENUINE_INDEPENDENT_REVIEW','canonicalPath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','bindingPolicy':'FinitewholeCurrentGoalobjects; unrelated canonical changes permitted.','proposedPublishedArtifactBase':BASE,'forms':forms},ensure_ascii=False,indent=2)+'\n')
print('Wrote3wholebilingualforms',H)
