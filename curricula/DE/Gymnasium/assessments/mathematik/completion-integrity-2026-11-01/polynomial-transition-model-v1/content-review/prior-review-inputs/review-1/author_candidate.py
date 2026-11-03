from pathlib import Path
from copy import deepcopy
import json, hashlib, uuid

ROOT = Path.cwd()
OUT = ROOT / 'tmp/approach-review-20261101/route-actions-batch2'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
EXPECTED = '3a3792d14057854c79a3d8c4d38cd98dd6e28e936865ebd3447107404b58474c'
assert hashlib.sha256(CANON.read_bytes()).hexdigest() == EXPECTED
raw = json.loads(CANON.read_text())
goals = {g['id']: g for g in raw['goals']}
reconstruction = '8e1b0d9c-fa32-5ccd-9c11-77e788ae0941'
join = '4b16fce6-84cc-52ae-98ca-f88cc518cc28'
inflection = 'b88cbf71-5e3e-55e3-ba94-6789408d38d6'
systems = '546bf0b3-6921-416b-a2ef-8fd37d429dc7'
existing = ['ec707244-9dde-510c-8c1e-955f23016231', '68a262fc-43f4-5d23-af30-853870bfd45b',
            '2f626446-4b32-5674-a687-9cd754bdfede', '450a77d6-2814-571a-af1e-78c9fa61ed2c',
            'e7013f6e-6051-5c88-8b4b-e054dc8db4cc', '3095e125-fbb7-51c6-bf12-ffbb1735b9b7']
new_id = str(uuid.uuid5(uuid.UUID(raw['landscapeId']), 'own-assessment:polynomial-transition-path-reconstruction-smooth-joins-inflection:v1'))
assert new_id not in goals
artifact = 'curricula/DE/Gymnasium/assessments/mathematik/completion-integrity-2026-11-01/polynomial-transition-model-v1/candidate.de.md'

task_de = r'''Ein Besucherweg soll zwei vorhandene Abschnitte verbinden. Die waagerechte Koordinate $t$ und alle Höhen werden in Metern gemessen. In der Nähe der ersten Anschlussstelle verläuft der linke Abschnitt nach
$$\ell(t)=5-\frac{t}{10}\quad(t\leq0).$$
Der rechte Abschnitt ist in der Nähe der zweiten Anschlussstelle waagerecht:
$$r(t)=\frac72\quad(t\geq20).$$
Dazwischen soll für $0\leq t\leq20$ ein geeignetes Polynom $q$ vom Grad höchstens vier den Höhenverlauf beschreiben. An beiden Anschlussstellen dürfen weder ein Höhensprung noch ein Knick auftreten. Außerdem soll bei $t=10$ eine Wendestelle des Übergangs liegen. Andere Wendestellen werden nicht ausgeschlossen.

1. Übersetzen Sie die beiden sprung- und knickfreien Anschlüsse in vier Gleichungen für $q$ und $q'$. Erläutern Sie die Bedeutung der Werte und der Steigungen. (2 BE)
2. Formulieren Sie die zunächst notwendige Gleichung aus der geplanten Wendestelle. Erklären Sie, weshalb diese Gleichung allein noch keinen tatsächlichen Krümmungswechsel beweist. (2 BE)
3. Verwenden Sie den Ansatz $q(t)=at^4+bt^3+ct^2+dt+e$. Stellen Sie aus Ihren fünf Bedingungen ein lineares Gleichungssystem für die Koeffizienten auf und lösen Sie es nachvollziehbar. Prüfen Sie die erhaltenen Koeffizienten an allen fünf Bedingungen. (4 BE)
4. Begründen Sie für die zusammengesetzte Wegfunktion mit $\ell$, $q$ und $r$, dass beide Anschlüsse tatsächlich ohne Höhensprung und ohne Knick sind. Eine bloße Liste von Koeffizienten genügt nicht. (2 BE)
5. Prüfen Sie am erhaltenen Modell den Krümmungswechsel bei $t=10$ und erläutern Sie ihn für den Höhenverlauf. Nennen Sie auch eine gegebenenfalls weitere Wendestelle im Übergangsintervall; bewerten Sie, ob sie den Vorgaben widerspricht. (2 BE)
6. Prüfen Sie, ob der Übergang zwischen den vorgegebenen Anschlusshöhen bleibt. Benennen Sie eine Grenze dieses geometrischen Modells; etwaige bautechnische Eignung ist durch die Rechnung allein nicht nachgewiesen. (1 BE)

Hilfsmittel dürfen zur Kontrolle verwendet werden. Ein bloß ausgegebener Funktionsterm ersetzt das selbst aufgestellte Gleichungssystem und die geforderten Begründungen nicht.'''

task_en = r'''A visitor path is to connect two existing sections. The horizontal coordinate $t$ and all heights are measured in metres. Near the first join, the left section follows
$$\ell(t)=5-\frac{t}{10}\quad(t\leq0).$$
Near the second join, the right section is horizontal:
$$r(t)=\frac72\quad(t\geq20).$$
Between them, a suitable polynomial $q$ of degree at most four is to describe the height for $0\leq t\leq20$. Neither join may have a jump in height or a kink. The transition must also have an inflection point at $t=10$. Other inflection points are not excluded.

1. Translate the two joins without jumps or kinks into four equations involving $q$ and $q'$. Explain the meaning of the values and slopes. (2 points)
2. State the initially necessary equation from the proposed inflection point. Explain why this equation alone does not prove an actual change of concavity. (2 points)
3. Use $q(t)=at^4+bt^3+ct^2+dt+e$. Set up a linear system for its coefficients from your five conditions and solve it with a clear method. Check the resulting coefficients against all five conditions. (4 points)
4. Explain why the piecewise path formed by $\ell$, $q$ and $r$ actually has neither a jump nor a kink at either join. A list of coefficients alone is insufficient. (2 points)
5. Check the change of concavity at $t=10$ in your model and explain its meaning for the height profile. Identify any further inflection point in the transition interval and decide whether it contradicts the requirements. (2 points)
6. Check whether the transition stays between the prescribed endpoint heights. State one limitation of this geometric model; the calculations alone do not establish engineering suitability. (1 point)

Tools may be used to check your work. A function returned by a tool does not replace the independently formulated linear system and the required explanations.'''

solution_de = r'''Aus der ersten Naht folgen $q(0)=\ell(0)=5$ und $q'(0)=\ell'(0)=-1/10$. An der zweiten Naht gelten $q(20)=r(20)=7/2$ und $q'(20)=r'(20)=0$. Gleiche Funktionswerte verhindern einen Höhensprung; gleiche erste Ableitungen verhindern einen Knick.

Die geplante Wendestelle liefert zunächst $q''(10)=0$. Diese notwendige Bedingung allein reicht nicht: Beispielsweise hat $t^4$ bei $0$ zwar eine Nullstelle der zweiten Ableitung, dort aber keinen Vorzeichenwechsel der zweiten Ableitung.

Beim Polynomansatz gilt $e=5$, $d=-1/10$. Die übrigen Bedingungen liefern
$$\begin{aligned}
160000a+8000b+400c&=\frac12,\\
32000a+1200b+40c&=\frac1{10},\\
1200a+60b+2c&=0.
\end{aligned}$$
Aus der dritten Gleichung folgt $c=-600a-30b$. Einsetzen in die zweite liefert $8000a=1/10$, also $a=1/80000$. Die erste wird zu $-80000a-4000b=1/2$ und ergibt $b=-3/8000$. Damit ist $c=3/800$. Insgesamt:
$$q(t)=\frac{t^4}{80000}-\frac{3t^3}{8000}+\frac{3t^2}{800}-\frac t{10}+5.$$
Die Kontrolle ergibt $q(0)=5$, $q'(0)=-1/10$, $q(20)=7/2$, $q'(20)=0$ und $q''(10)=0$. Die Koeffizienten sind durch die angegebenen Eliminationsschritte eindeutig bestimmt.

Für die zusammengesetzte Wegfunktion stimmen bei $t=0$ die einseitigen Höhenwerte und Steigungen von $\ell$ und $q$ überein. Dasselbe gilt bei $t=20$ für $q$ und $r$. Die Wegfunktion ist an beiden Stellen stetig und hat dort jeweils eine übereinstimmende erste Ableitung. Eine übereinstimmende zweite Ableitung ist nicht verlangt und liegt hier an den Nähten nicht vor.

Es gilt
$$q''(t)=\frac{3(t-5)(t-10)}{20000}.$$
Links von $10$ (zwischen $5$ und $10$) ist $q''<0$, rechts von $10$ ist $q''>0$. Damit liegt tatsächlich eine Wendestelle vor. Alternativ bestätigt $q^{(3)}(10)=3/4000\neq0$ den Wechsel. Die Steigung des abfallenden Wegs nimmt unmittelbar vor $t=10$ ab und danach wieder zu. Auch bei $t=5$ wechselt das Vorzeichen, von positiv zu negativ; das ist eine weitere Wendestelle. Sie widerspricht den Vorgaben nicht, da keine Einzigkeit der Wendestelle gefordert wurde.

Für die Plausibilitätsprüfung eignet sich
$$q'(t)=\frac{(t-20)(2t^2-5t+200)}{40000}.$$
Der zweite Faktor ist stets positiv, denn $2t^2-5t+200=2(t-5/4)^2+1575/8>0$. Daher ist $q'<0$ für $0\leq t<20$ und $q'(20)=0$. Der Übergang fällt von $5$ auf $7/2$ und bleibt dazwischen. Das Modell beschreibt nur einen geometrischen Höhenverlauf. Material, Tragfähigkeit, zulässige Steigungen oder kontinuierliche Krümmung an den Nähten sind damit nicht nachgewiesen.

13 BE insgesamt; bestanden mit 13 BE. Gleichwertige nachvollziehbare Lösungswege sind zulässig. Die fehlende Übersetzung einer Bedingung darf nicht durch eine passende, aber unbegründet ausgegebene Koeffizientenliste ersetzt werden. Dies ist eine normale Aufgabenrubrik mit einem binären Ergebnis, kein zusätzliches Qualifikationsprofil.'''

solution_en = r'''At the first join, $q(0)=\ell(0)=5$ and $q'(0)=\ell'(0)=-1/10$. At the second join, $q(20)=r(20)=7/2$ and $q'(20)=r'(20)=0$. Equal values prevent a height jump; equal first derivatives prevent a kink.

The proposed inflection point initially gives $q''(10)=0$. This necessary condition is insufficient by itself: $t^4$ has a zero of its second derivative at $0$ without a change of sign there.

The polynomial gives $e=5$ and $d=-1/10$. The other conditions become
$$\begin{aligned}
160000a+8000b+400c&=\frac12,\\
32000a+1200b+40c&=\frac1{10},\\
1200a+60b+2c&=0.
\end{aligned}$$
The third equation gives $c=-600a-30b$. Substitution into the second gives $8000a=1/10$, hence $a=1/80000$. The first becomes $-80000a-4000b=1/2$, giving $b=-3/8000$ and then $c=3/800$. Thus
$$q(t)=\frac{t^4}{80000}-\frac{3t^3}{8000}+\frac{3t^2}{800}-\frac t{10}+5.$$
Checking gives $q(0)=5$, $q'(0)=-1/10$, $q(20)=7/2$, $q'(20)=0$ and $q''(10)=0$. These elimination steps determine the coefficients uniquely.

At $t=0$, the one-sided heights and slopes of $\ell$ and $q$ agree. The same holds for $q$ and $r$ at $t=20$. The piecewise path is continuous and has matching first derivatives at both joins. Matching second derivatives was not required and does not hold at these joins.

The second derivative is
$$q''(t)=\frac{3(t-5)(t-10)}{20000}.$$
It is negative immediately to the left of $10$, between $5$ and $10$, and positive immediately to the right. Thus there is an actual inflection point. Alternatively, $q^{(3)}(10)=3/4000\neq0$ establishes the change. The descending path's slope decreases immediately before $t=10$ and increases afterwards. There is another inflection point at $t=5$, where the sign changes from positive to negative. It does not contradict the requirements, which did not require a unique inflection point.

For a plausibility check,
$$q'(t)=\frac{(t-20)(2t^2-5t+200)}{40000}.$$
The quadratic factor is always positive because $2t^2-5t+200=2(t-5/4)^2+1575/8>0$. Hence $q'<0$ for $0\leq t<20$ and $q'(20)=0$. The transition descends from $5$ to $7/2$ and stays between them. The model describes geometry only. It does not establish material strength, admissible slopes or continuous curvature at the joins.

13 points in total; pass with 13 points. Equivalent well-explained methods are accepted. An unexplained list of correct coefficients does not replace translating a required condition. This is an ordinary task rubric with one binary result, not an additional qualification profile.'''

steps = [
 ('joins-model',2,'Vier Werte-/Steigungsbedingungen aus beiden Nähten selbstständig formulieren und im Kontext begründen; je Naht 1 BE.','Independently formulate and explain the four value/slope conditions; 1 point per join.'),
 ('inflection-model',2,'q\'\'(10)=0 aus der Wendestellenvorgabe formulieren (1); notwendige und hinreichende Bedingung an einem Gegenbeispiel unterscheiden (1).','Formulate q\'\'(10)=0 from the design requirement (1); distinguish necessity from sufficiency with a counterexample (1).'),
 ('reconstruction-system',4,'Koeffizientenansatz und vollständiges LGS (1); e,d und verbleibendes 3x3-LGS richtig reduzieren (1); a,b,c nachvollziehbar lösen (1); alle fünf Bedingungen kontrollieren (1).','Set up the coefficient model and full linear system (1); reduce e,d and the remaining 3x3 system (1); solve a,b,c clearly (1); check all five conditions (1).'),
 ('joins-verify',2,'Beide Nähte mit Funktionswert und erster Ableitung prüfen und Sprung-/Knickfreiheit erklären; je Naht 1 BE.','Check value and first derivative at both joins and explain continuity and absence of a kink; 1 point per join.'),
 ('inflection-verify',2,'Tatsächlichen Vorzeichenwechsel bei t=10 nachweisen und im Höhenverlauf deuten (1); zusätzliche Wendestelle t=5 erkennen und die nicht geforderte Einzigkeit korrekt beurteilen (1).','Prove and interpret the sign change at t=10 (1); identify the further inflection at t=5 and correctly assess the absence of a uniqueness requirement (1).'),
 ('model-validation',1,'Keine Über-/Unterschreitung der Anschlusshöhen fachlich prüfen und mindestens eine Grenze des geometrischen Modells benennen; beides für 1 BE erforderlich.','Check that the height stays between the endpoint heights and state at least one geometric-model limitation; both are required for the point.')]
new_goal = {
 'id':new_id, 'shortKey':'canonical_math_own_transition_path_reconstruction_joins_inflection_v1',
 'title':'Übergangsweg rekonstruieren, glatt anschließen und Wendestelle begründen',
 'titleEn':'Reconstruct a transition path, join it smoothly and justify its inflection point',
 'description':'Die lernende Person kann für einen zusammenhängenden Übergangsweg Werte-, Steigungs- und Wendebedingungen in ein ganzrationales Modell übersetzen, das Koeffizienten-LGS lösen sowie beide glatten Nähte und den tatsächlichen Krümmungswechsel fachlich prüfen und deuten.',
 'descriptionEn':'The learner can translate value, slope and inflection conditions for one transition path into a polynomial model, solve its coefficient system, and mathematically check and interpret both smooth joins and the actual change of concavity.',
 'type':'atomic','nodeKind':'exam','contains':[], 'weight':1,
 'requires':[reconstruction,inflection,join,systems],
 'tags':['GK','LK','Practice','Assessment','ExamTask','canonical'],
 'phase':'E', 'dimensionTags':{'framework':'canonical-gymnasium-math','phase':'E','area':'Analysis','demandLevel':'AB3','processCompetencies':['K1','K2','K3','K5','K6'],'guidingIdeas':['L1','L4']},
 'sourceRef':artifact+'#aufgabe',
 'extendedData':{'applicabilityFromRequires':True},
 'examData':{'reviewStatus':'draft','reviewNote':'Eigenständig verfasster, nicht integrierter Kandidat vom 01.11.2026. Eine zusammenhängende Modellierungsprüfung für drei in Kohorte30 nachgewiesene fehlende Handlungen. Historische Hängebrücke, J9-Ballparabel und J10-Führungsschiene bleiben vollständig unverändert. Unabhängiges Inhaltsreview, passende Source-/Scopeauswahl und M7-Nachweise stehen aus. Keine menschliche Freigabe, Erprobung oder Wirksamkeitsbehauptung.',
 'coveredGoalIds':[reconstruction,inflection,join], 'coveredStrands':['L1','L4'],'demandLevels':['AB2','AB3'],
 'taskContent':task_de,'taskContentEn':task_en,'solutionContent':solution_de,'solutionContentEn':solution_en,
 'sourceArtifactPath':artifact,
 'scoring':{'maxPoints':13,'passingPoints':13,'steps':[{'id':'transition-v1-'+id,'points':p,'description':de} for id,p,de,en in steps]}}
}
def normalized(v): return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def sha(v): return hashlib.sha256(normalized(v)).hexdigest()
def write(name,value): (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
write('before.contracts.json',{'canonicalSha256':EXPECTED,'goals':[goals[id] for id in [reconstruction,inflection,join,systems]+existing]})
write('candidate.new-goal.json',new_goal)
write('candidate.delta.json',{
 'schemaVersion':1,'status':'DRAFT_SEPARATE_OWN_TASK_NOT_INTEGRATED_OR_SCOPE_ACCEPTED',
 'baseCanonical':{'path':str(CANON.relative_to(ROOT)),'sha256':EXPECTED},
 'operations':[{'operation':'addGoal','goalId':new_id,'before':None,'after':new_goal}],
 'newAssessmentCount':1,'newOrdinaryGoalCount':0,'changedExistingGoalCount':0,
 'preservedExistingGoalSha256':{id:sha(goals[id]) for id in existing},
 'coveredGoalIds':[reconstruction,inflection,join],
 'requiresRationale':{reconstruction:'Explicit polynomial coefficient system, solution and verification; actually scored.',inflection:'An inflection requirement is translated into a model condition, then the actual change is checked and interpreted; actually scored.',join:'Two required C1 joins are modelled and checked; actually scored.',systems:'Solving the coefficient linear system is genuine preparation; no full graphical/multiplicity competence coverage is claimed.'},
 'coveredGoalToScoringSteps':{reconstruction:['transition-v1-reconstruction-system'],inflection:['transition-v1-inflection-model','transition-v1-inflection-verify'],join:['transition-v1-joins-model','transition-v1-joins-verify']},
 'rejectedHistoricalRebindings':[{'goalId':reconstruction,'suggestedExistingTaskId':existing[0],'decision':'PRESERVE_EXISTING_TASK_NO_REQUIRES_OR_COVERAGE_LINK','reason':'Respect independent cohort30: given-vertex J9 task does not establish general coefficient reconstruction; do not restore the removed LGS obligation.'}, {'goalId':inflection,'suggestedExistingTaskId':existing[2],'decision':'PRESERVE_EXISTING_TASK_NO_REQUIRES_OR_COVERAGE_LINK','reason':'The stated J10 contract investigates a supplied polynomial; constructing a new model would add a separate required competence.'}, {'goalId':join,'suggestedExistingTaskId':existing[1],'decision':'PRESERVE_HISTORICAL_ABITUR_ORIGINAL','reason':'Historical B1 suspension-bridge task is explicitly 30 points and fully specified; no appended actions or retitling under its ID.'}],
 'placementProposal':{'kind':'ONE_ADDITIONAL_COHERENT_OWN_ASSESSMENT_FOR_THREE_MISSING_ACTIONS','contentLevel':'E-phase derivative applications, both technical course profiles; not an official examination task','eligibleScopePrinciple':'Review only scopes already intending these three canonical target skills. No phase/title heuristic or automatic source-view enrollment. PrerequisiteOnly is not target membership.','historicalTargets':'No historical target is replaced, deleted or silently extended.','fairWorkloadBoundary':'One integrated 13-point proof, not three independent compulsory exams; authoring/scope owner must explicitly approve its additional obligation. An existing own assessment-slot variant would need a separate equivalent-contract decision; none is activated here.'},
 'masteryPolicy':'All existing IDs and mastery remain valid. This candidate adds no profile-specific result, waiver, requalification or mastery write.',
 'pending':['Independent task/solution/rubric and stable-contract review','Source/stage/course placement and fair additional obligation','Actual offered-scope comparison','All applicable current M7 gates; this draft is not a protected release claim']})
for lang,task,solution in [('de',task_de,solution_de),('en',task_en,solution_en)]:
 title=new_goal['title' if lang=='de' else 'titleEn']
 text='# '+title+'\n\nDRAFT — not integrated. Own SkillPilot task; knowledge content CC-BY-4.0.\n\n## '+('Aufgabe' if lang=='de' else 'Task')+'\n\n'+task+'\n\n## '+('Lösung' if lang=='de' else 'Solution')+'\n\n'+solution+'\n\n## '+('Bewertung' if lang=='de' else 'Scoring')+'\n\n'
 for id,p,de,en in steps:text+='- '+str(p)+' '+('BE: '+de if lang=='de' else 'points: '+en)+'\n'
 (OUT/('candidate.'+lang+'.md')).write_text(text)

registry=json.loads((ROOT/'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json').read_text())
provenance=next(x for x in registry['landscapes'] if x['landscapeId']==raw['landscapeId'])['goalProvenance'][existing[1]]
archive=ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot'
source=json.loads(archive.read_text());original=next(x for x in source['goals'] if x['id']==provenance['sourceGoalId'])
write('historical-origin.json',{'canonicalGoalId':existing[1],'canonicalGoalSha256':sha(goals[existing[1]]),'registryProvenance':provenance,'archivePath':str(archive.relative_to(ROOT)),'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'archivedGoalTitle':original['title'],'archivedPoints':original['examData']['scoring']['maxPoints'],'archivedImageReferences':['/assets/abi/2026_1/image4.png'],'interpretation':'Historical source-archive binding is established. No claim that the archive proves an official examination publisher or permission to modify it. This candidate copies no historical image or task wording.'})
write('own-assessment-fit-review.json',{'status':'BOUNDED_OWN_SLOT_REVIEW_NOT_A_REVIEW_OF_ALL_165_TASKS','reviewedOwnAssessmentIds':existing[3:],'decisions':[{'goalId':existing[3],'decision':'NO_REBINDING','reason':'Specifically simple extremum modelling; existing reviewed note expressly excludes inflection, reconstruction and joins.'},{'goalId':existing[4],'decision':'NO_REBINDING','reason':'Specifically linear, quadratic and symmetric representations; no smooth join/inflection-model demand.'},{'goalId':existing[5],'decision':'NO_SILENT_REPLACEMENT','reason':'Broad process-goal wording can describe a modelling slot, but its current own 20-point catering task and process-only preparation contain no polynomial reconstruction/inflection/join action. Replacing it changes its workload and mathematical preparation, so an equivalence/variant choice would require explicit approval; no retrofit is claimed.'}]})
print(json.dumps({'newGoalId':new_id,'points':13,'passingPoints':13,'newAssessments':1,'changedExistingGoals':0,'baseCanonicalSha256':EXPECTED},indent=2))
