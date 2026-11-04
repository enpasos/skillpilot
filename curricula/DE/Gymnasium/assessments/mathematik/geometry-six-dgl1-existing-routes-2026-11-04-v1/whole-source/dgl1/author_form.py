from pathlib import Path
import json
H=Path(__file__).resolve().parent;ID='28cdee95-3c8e-5760-a68a-405b7f9c6cbf'
assert not (H/'review-input-manifest.json').exists()
task_de=r'''# DGL erster Ordnung selbst lösen

Gesucht sind reellwertige differenzierbare Funktionen auf geeigneten
Intervallen. Leite deine Lösungen aus den Gleichungen her. Das bloße
Nennen und Nachprüfen einer vermuteten Funktion ersetzt die geforderte
Lösungsherleitung nicht. Mathematisch gleichwertige begründete
Lösungswege sind erlaubt. Insgesamt sind **20 BE** erreichbar.

**1. Eine allgemeine Lösungsfamilie herleiten (6 BE)**

Löse
$$
y'(t)=y(t)^2
$$
für den nichtverschwindenden Fall durch Trennung der Variablen oder
einen mathematisch gleichwertigen elementaren Ansatz. Zeige deinen Lösungsweg und dabei verwendete Integrationsschritte;
stelle nach $y(t)$ um. Gib den frei wählbaren
Parameter an und erkläre, welche Einschränkung für ein Lösungsintervall
durch den Nenner entsteht. Bei einer Division muss erkennbar sein,
unter welcher Bedingung sie zulässig ist.

**2. Einen beim Umformen ausgeschlossenen Fall prüfen (2 BE)**

Bestimme die konstanten Lösungen derselben Differenzialgleichung
durch direktes Einsetzen. Erkläre, welche davon durch eine Division
im nichtverschwindenden Fall nicht erfasst wird.

**3. Eine Anfangsbedingung berücksichtigen (5 BE)**

Bestimme aus deiner Lösungsfamilie die Lösung mit $y(0)=1$.
Gib das größte offene Intervall an, das $0$ enthält und auf dem dieser
Lösungsterm ohne Nennernullstelle definiert ist. Begründe die Wahl
elementar am Nenner und am Anfangswert. Erkläre, warum ein bloßes
Fortsetzen desselben Terms auf die andere Seite einer Nennernullstelle
keine Lösung durch diese Stelle liefert. Allgemeine Existenz- oder
Eindeutigkeitssätze werden nicht verlangt.

**4. Die Anfangslösung tatsächlich kontrollieren (3 BE)**

Berechne die Ableitung deiner bestimmten Lösung. Prüfe die
Differenzialgleichung auf dem angegebenen Intervall und die
Anfangsbedingung. Für diese Kontrollrechnung darfst du die Regel
$$
\left(\frac1{u(t)}\right)'=-\frac{u'(t)}{u(t)^2}
$$
für differenzierbare $u$ an Stellen mit $u(t)\ne0$ verwenden.

**5. Eine weitere elementare Methode verwenden (4 BE)**

Löse zusätzlich
$$
z'(t)=2t
$$
durch direkte Integration. Gib die allgemeine Lösung und die spezielle
Lösung mit $z(0)=-2$ an. Nenne ein passendes größtes Lösungsintervall
und prüfe die spezielle Lösung einschließlich ihrer Anfangsbedingung.
'''
task_en=r'''# Solve first-order differential equations yourself

Find real-valued differentiable functions on suitable intervals.
Derive your solutions from the equations. Merely stating and checking
a guessed function does not replace a solution derivation.
Mathematically equivalent justified methods are accepted.
Total: **20 points**.

**1. Derive a general solution family (6 points)**

Solve
$$
y'(t)=y(t)^2
$$
for the nonzero case by separation of variables or an equivalent
elementary approach. Show your derivation, including any integration steps you use,
and rearrange for $y(t)$. State the arbitrary parameter and explain the restriction the
denominator places on a solution interval. If you divide, make clear
when that division is valid.

**2. Check a case excluded during rearrangement (2 points)**

Find the constant solutions of the same equation by direct substitution.
Explain which one is not captured by division in the nonzero case.

**3. Apply an initial condition (5 points)**

Use your solution family to determine the solution with $y(0)=1$.
Give the largest open interval containing $0$ on which that expression
has no zero denominator. Justify it directly from the denominator and
initial value. Explain why continuing the same expression on the other
side of a zero denominator does not produce a solution through that
point. No general existence or uniqueness theorem is required.

**4. Actually check the initial-value solution (3 points)**

Calculate the derivative of your particular solution. Check the
differential equation throughout the stated interval and the initial
condition. For this check, you may use
$$
\left(\frac1{u(t)}\right)'=-\frac{u'(t)}{u(t)^2}
$$
for differentiable $u$ wherever $u(t)\ne0$.

**5. Use another elementary method (4 points)**

Also solve
$$
z'(t)=2t
$$
by direct integration. Give its general solution and the particular
solution with $z(0)=-2$. State a suitable largest solution interval
and check the particular solution, including its initial condition.
'''
sol_de=r'''# Musterlösung: Separation und direkte Integration

**1.** Auf einem Intervall mit $y(t)\ne0$ darf durch $y^2$ geteilt
werden. Die getrennte Gleichung und ihre Integration lauten
$$
\frac{1}{y^2}\,dy=dt,
\qquad\int y^{-2}\,dy=\int1\,dt,
\qquad-\frac1y=t+K.
$$
Umstellen ergibt
$$
y(t)=-\frac1{t+K}=\frac1{C-t},\qquad C=-K\in\mathbb R.
$$
Die Integrationskonstante wählt eine Funktion aus der Familie. Ihr
Nenner darf nicht null sein. Der Ausdruck ist daher auf jedem
zusammenhängenden offenen Intervall ohne $t=C$ eine Lösung;
die beiden größten solchen Intervalle sind $(-\infty,C)$ und
$(C,\infty)$. Eine kleinere zulässige Intervallbeschränkung liefert
jeweils dieselbe Lösung auf weniger Stellen. Die Wahl $K$ statt $C$
oder jede andere gleichwertige Parameterdarstellung zählt ebenso.

Ein gleichwertiger elementarer Weg setzt auf einem Intervall ohne
Nullstellen $u=1/y$. Dann folgt aus der Kehrwertableitung
$u'=-y'/y^2=-1$. Integration liefert $u=-t+C$ und damit dieselbe
Familie. Auch hier ist die Division nur für $y\ne0$ zulässig.
Ein allgemeiner Satz über Existenz, Eindeutigkeit oder Vollständigkeit
von DGL-Lösungsfamilien wird für diese Aufgabe nicht benötigt.

**2.** Für eine konstante Funktion $y(t)=k$ ist $y'=0$.
Die Gleichung fordert $0=k^2$, also $k=0$. Somit ist $y(t)=0$
eine Lösung auf $\mathbb R$. Sie wurde beim Dividieren durch $y^2$
ausgeschlossen und muss gesondert ergänzt werden. Kein endlicher
Wert des Familienparameters $C$ ergibt die Nullfunktion.

**3.** Einsetzen der Anfangsbedingung in die Familie ergibt
$$
1=y(0)=\frac1C,\qquad C=1,
\qquad y(t)=\frac1{1-t}.
$$
Der Term hat die Nennernullstelle $t=1$. Das größte offene
nullstellenfreie Intervall mit $0$ ist daher $(-\infty,1)$.
Bei $t=1$ besitzt der Term keinen reellen Funktionswert und kann dort
keine differenzierbare Lösung darstellen. Auf $(1,\infty)$ definiert
derselbe Term zwar eine weitere Lösungsbranche, dieses Intervall
enthält aber den Anfangszeitpunkt $0$ nicht. Die beiden getrennten
Bereiche sind kein einzelnes Lösungsintervall durch $t=1$.
Diese Begründung verwendet nur Definitionsbedingungen, nicht einen
allgemeinen Maximalitäts- oder Eindeutigkeitssatz.

**4.** Für jedes $t<1$ gilt
$$
y'(t)=\frac1{(1-t)^2}
\quad\text{und}\quad y(t)^2=\frac1{(1-t)^2}.
$$
Somit ist $y'=y^2$ auf dem ganzen gewählten Intervall erfüllt.
Außerdem ist $y(0)=1/(1-0)=1$.
Eine bloße Probe wäre keine Herleitung der Familie aus Teil 1;
zusammen mit der Herleitung ist sie die verlangte Kontrolle.

**5.** Direkte Integration ergibt
$$
z(t)=\int2t\,dt=t^2+L,\qquad L\in\mathbb R.
$$
Mit $z(0)=-2$ folgt $L=-2$, also $z(t)=t^2-2$.
Das Polynom ist auf ganz $\mathbb R$ differenzierbar; es gibt keine
Nenner- oder sonstige Definitionsbeschränkung. Das größte Intervall
ist somit $\mathbb R$. Es gilt $z'(t)=2t$ für alle reellen $t$ und
$z(0)=-2$. Anders als in Teil 1 ist keine Trennung eines von $z$
abhängigen Faktors erforderlich: Die Ableitung ist bereits allein
als Funktion von $t$ gegeben.
'''
sol_en=r'''# Worked solution: separation and direct integration

**1.** On an interval where $y(t)\ne0$, division by $y^2$ is valid.
Separation and integration give
$$
\frac1{y^2}\,dy=dt,
\qquad\int y^{-2}\,dy=\int1\,dt,
\qquad-\frac1y=t+K.
$$
Rearranging yields
$$
y(t)=-\frac1{t+K}=\frac1{C-t},\qquad C=-K\in\mathbb R.
$$
The integration constant selects one function from the family. Its
denominator must be nonzero. Thus the expression is a solution on any
connected open interval not containing $t=C$; the two largest such
intervals are $(-\infty,C)$ and $(C,\infty)$. Restricting to a smaller
valid interval gives the same solution on fewer points. Parameterising
with $K$ or any equivalent constant is equally valid.

An equivalent elementary approach sets $u=1/y$ on an interval without
zeros. The reciprocal derivative gives $u'=-y'/y^2=-1$, so integration
yields $u=-t+C$ and the same family. Here too, division requires
$y\ne0$. No general existence, uniqueness or completeness theorem for
differential equations is needed for this task.

**2.** For a constant function $y(t)=k$, $y'=0$. The equation requires
$0=k^2$, hence $k=0$. Therefore $y(t)=0$ is a solution on $\mathbb R$.
Dividing by $y^2$ excluded it, so it must be added separately. No finite
value of $C$ in the family gives the zero function.

**3.** Applying the initial condition to the family gives
$$
1=y(0)=\frac1C,\qquad C=1,
\qquad y(t)=\frac1{1-t}.
$$
The denominator vanishes at $t=1$. The largest open interval without
that point and containing $0$ is $(-\infty,1)$. At $t=1$, the expression
has no real value and cannot be a differentiable solution there.
It also defines a solution branch on $(1,\infty)$, but that interval
does not contain the initial point $0$. The two separate pieces do
not give one solution interval through $t=1$. This uses elementary
domain restrictions, not a general maximality or uniqueness theorem.

**4.** For every $t<1$,
$$
y'(t)=\frac1{(1-t)^2}
\quad\text{and}\quad y(t)^2=\frac1{(1-t)^2}.
$$
Thus $y'=y^2$ holds throughout the chosen interval. Also,
$y(0)=1/(1-0)=1$. Checking alone would not derive the family in part1;
together with the derivation it supplies the required verification.

**5.** Direct integration gives
$$
z(t)=\int2t\,dt=t^2+L,\qquad L\in\mathbb R.
$$
The condition $z(0)=-2$ gives $L=-2$, hence $z(t)=t^2-2$.
This polynomial is differentiable on all of $\mathbb R$, with no
zero-denominator or other domain restriction, so the largest interval
is $\mathbb R$. We have $z'(t)=2t$ for every real $t$, and $z(0)=-2$.
Unlike part1, there is no factor depending on $z$ to separate: the
derivative is already given solely as a function of $t$.
'''
steps=[('derive',6,'Tragfähiger Separations-, Kehrwert- oder anderer elementarer Lösungsansatz mit nötigen Bedingungen (1); mathematisch tragfähige Herleitung der Familie über Integration oder gleichwertige Schlussfolgerungen samt freiem Parameter (3); nach y mit gültiger Parameterfamilie umgestellt (1); Nennerbedingung für das Lösungsintervall genannt (1).','Sound separation, reciprocal or other elementary setup with necessary conditions (1); mathematically sound derivation of the family by integration or equivalent reasoning, including a free parameter (3); rearranges for a valid parameter family (1); states the denominator restriction for a solution interval (1).'),('constant',2,'Konstanten Ansatz y=k in die ursprüngliche DGL eingesetzt und k=0 gewonnen (1); Nulllösung mit dem beim Dividieren ausgeschlossenen Fall verknüpft (1).','Substitutes y=k in the original equation and obtains k=0 (1); connects the zero solution to the case excluded by division (1).'),('initial',5,'Anfangsbedingung an der Familie angesetzt und die passende Konstante bestimmt (2); spezielle Lösung korrekt angegeben (1); größtes offenes Intervall mit0 ohne Nennernullstelle (1); fehlenden Funktionswert am Pol bzw. getrennte zweite Branche elementar erklärt (1).','Applies the initial condition to the family and determines its constant (2); correct particular solution (1); largest open interval containing0 without a zero denominator (1); elementary explanation of the missing pole value or separate second branch (1).'),('check',3,'Ableitung der speziellen Lösung nachvollziehbar berechnet (1); Gleichheit von y′ und y² auf dem Intervall geprüft (1); Anfangsbedingung ausdrücklich geprüft (1).','Calculates the particular solution’s derivative with traceable work (1); checks equality of y′ and y² on the interval (1); explicitly checks the initial condition (1).'),('direct',4,'Allgemeine z-Lösung durch direkte Integration mit freier Konstante (1); Konstante aus z(0)=−2 bestimmt und spezielle Lösung angegeben (1); ganz R als Lösungsintervall begründet (1); Ableitung und Anfangswert geprüft (1 zusammen, je0,5).','General z solution derived by direct integration with an arbitrary constant (1); determines constant from z(0)=−2 and states particular solution (1); justifies all of R as the interval (1); checks derivative and initial value (1 together, 0.5 each).')]
cap_de=r'''Begrenze vor dem Vergleich mit der Bestehensgrenze die normale
Gesamtpunktzahl auf **14 BE**, wenn über die ganze Abgabe keine tragfähige
eigene elementare Herleitung der nichtverschwindenden Lösungsfamilie von
$y'=y^2$ vorkommt oder wenn nirgends aus einer allgemeinen Lösung mithilfe
einer Anfangsbedingung eine spezielle Lösung gewonnen wird. Die bloße
Angabe oder Ableitungsprobe einer erratenen Familie ersetzt die erste
Kernleistung nicht. Der zweite Kern kann in einem der beiden Fälle erbracht
werden; es ist kein gesondertes Bestehen beider Anfangswertaufgaben nötig.
Eine gleichwertige elementare Herleitung, etwa über $u=1/y$, ist zugelassen.
Eine knappe korrekte Rechnung zählt; ein lokaler Rechen-, Vorzeichen- oder
Übertragungsfehler bei tragfähigem Lösungsansatz löst keine Kappung aus.
Ein einzelner ausgelassener Sonderfall oder Intervallschritt führt zu den
entsprechenden Punktabzügen, nicht automatisch zu einem weiteren
Bestehenshindernis. Mehrere Kappungsgründe ergeben dieselbe Obergrenze.
Es bleibt bei genau einer Gesamtbewertung.'''
cap_en=r'''Before comparison with the passing threshold, cap the ordinary total
at **14 points** if the whole submission contains no sound independent
elementary derivation of the nonzero solution family for $y'=y^2$, or if
nowhere is a particular solution obtained from a general solution using an
initial condition. Merely stating or differentiating a guessed family does
not replace the first core action. The second core action may be supplied
by either equation; the two initial-value parts have no separate pass rules.
Equivalent elementary derivations, such as using $u=1/y$, are accepted.
Concise correct work counts. A local arithmetic, sign or copying slip with
a sound method does not trigger the cap. An isolated omitted special case
or interval step loses its allocated points without automatically creating
another pass barrier. Multiple cap reasons give the same upper limit.
There remains exactly one overall assessment.'''
general_de=r'''## Eine Gesamtbewertung

Es gibt eine Gesamtpunktzahl aus **20 BE** und genau ein binäres Ergebnis:
**bestanden ab 15 BE**, sonst nicht bestanden. Die Teilpunkte sind keine
eigenen Bestehensgrenzen. Mathematisch gleichwertige begründete Lösungswege,
andere Bezeichnungen der Integrationskonstante und korrekte Umformungen
zählen gleichwertig. Das Wort „Separation“ allein ersetzt keine Rechnung;
eine richtige Rechnung braucht umgekehrt kein bestimmtes Schlagwort.

Bewerte richtige Leistungen dort, wo sie tatsächlich vorkommen; dieselbe
Leistung zählt einmal. Teilpunkte wie angegeben, sonst0,5 BE für eine
sinnvolle unvollständige Teilleistung. Lokale Fehler werden nicht mehrfach
bestraft; nachvollziehbare richtige Folgearbeit behält ihren Kredit.
Weder zusätzliche Methodenvarianten noch allgemeine DGL-Theoreme sind
verlangt. Die Hilfsregel vereinfacht ausschließlich die Kontrollrechnung;
die Lösungsherleitung und die Konstantenbestimmung bleiben eigene Leistungen.
'''
general_en=r'''## One overall assessment

There is one total score out of **20 points** and one binary result:
**pass at 15 points or more**, otherwise not passed. Part scores are not
separate pass thresholds. Equivalent justified methods, alternative names
for the integration constant and correct rearrangements receive equal
credit. Naming “separation” alone does not replace work, and valid work
does not require a particular keyword.

Credit correct performances wherever they occur; count each once. Award
partial credit as specified, otherwise0.5 points for meaningful incomplete
work. Do not repeatedly penalise one local error; credit correct traceable
follow-through. No additional method variants or general differential-equation
theorems are required. The supplied rule only simplifies verification;
deriving the solution and determining constants remain independent work.
'''
rub_de=general_de+'\n| Kriterium | BE |\n|---|---:|\n'+'\n'.join('| '+s[2]+' | '+str(s[1])+' |'for s in steps)+'\n\n'+cap_de+'\n'
rub_en=general_en+'\n| Criterion | Points |\n|---|---:|\n'+'\n'.join('| '+s[3]+' | '+str(s[1])+' |'for s in steps)+'\n\n'+cap_en+'\n'
# Correct spacing in prose; keep formula characters literal.
for old,new in [('sonst0,5','sonst 0,5'),('otherwise0.5','otherwise 0.5'),('mit0','mit 0'),('containing0','containing 0'),('part1','part 1'),('je0,5','je 0,5')]:
 rub_de=rub_de.replace(old,new);rub_en=rub_en.replace(old,new);sol_en=sol_en.replace(old,new)
out=H/ID;out.mkdir(exist_ok=True)
for n,v in [('task.de.md',task_de),('task.en.md',task_en),('solution.de.md',sol_de+'\n'+rub_de),('solution.en.md',sol_en+'\n'+rub_en),('rubric.de.md',rub_de),('rubric.en.md',rub_en)]: (out/n).write_text(v.rstrip()+'\n')
exam={'taskContent':task_de,'taskContentEn':task_en,'solutionContent':sol_de+'\n'+rub_de,'solutionContentEn':sol_en+'\n'+rub_en,'coveredGoalIds':[ID],'scoring':{'maxPoints':20,'passingPoints':15,'steps':[{'id':s[0],'points':s[1],'description':s[2],'descriptionEn':s[3]}for s in steps]}}
(out/'whole-form-content.draft.json').write_text(json.dumps({'status':'CONTENT_ONLY_WHOLE_DGL1_FORM_PENDING_GENUINE_INDEPENDENT_REVIEW','originalCompetencyId':ID,'newAssessmentIdAssigned':False,'canonicalRoleActivated':False,'scopeActivated':False,'originalRequiresChanged':False,'prerequisiteMasteryCertified':False,'binaryOverallResultOnly':True,'examDataContent':exam},ensure_ascii=False,indent=2)+'\n')
(H/'author-package.json').write_text(json.dumps({'status':'ONE_DGL1_CONTENT_OPTION_ONLY_PENDING_REVIEW','forms':[{'goalId':ID,'key':'elementary-first-order-solve','contentPath':ID+'/whole-form-content.draft.json','originalWholeContract':ID+'/competency-contract.current.json','newAssessmentIdAssigned':False,'canonicalRoleActivated':False,'conditionalScopeUse':'Only after separate identity/role/scope decision; no global exam conversion. Existing protected DGL2 consumers and memory obligations remain unchanged.'}],'oneWholeTargetContract':True,'all807CurricularAtomicObligationsRetained':True},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'WHOLE_DGL1_BILINGUAL_FORM_WRITTEN','score':20,'passingPoints':15}))
