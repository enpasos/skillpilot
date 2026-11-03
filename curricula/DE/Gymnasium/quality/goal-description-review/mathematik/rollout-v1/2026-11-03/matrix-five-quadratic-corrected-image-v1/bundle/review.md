# AI review input: Mathematik: aktuelle korrigierte Quadratikvisualisierung

- Book ID: `de-gym-math-quadratic-current-image-20261103-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:e7d4d6aadb4776a8c547a31474a8db52800e656976c421153225cff3db6592e3`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Quadratische Funktionen aus Punkten oder Bedingungen bestimmen

- Full learning-goal ID: `5743b8f9-86cb-4e24-8859-351708d070ab`
- Goal fingerprint: `sha256:191e4c1dfe092ab1428c1eb9a21065fb6bade549fe09fc9dd246abaa6212339e`
- Page fingerprint: `sha256:6bb9f966d93ca248fcc49792d73a00b6dc59f4c05a9fb48b33abce61ba356264`
- Topic path: Mathematik > Sekundarstufe I > Jahrgangsstufe 9 > Quadratische Funktionen beschreiben und anwenden > Quadratische Funktionen in Anwendungen nutzen

### Canonical description

Die lernende Person kann lineare Gleichungssysteme mit drei Unbekannten nutzen, um Koeffizienten quadratischer Funktionen aus Punkten oder Bedingungen zu bestimmen, und das Verfahren algorithmisch erläutern.

### Visualization

/assets/goal-visualizations/mathematik/5743b8f9-86cb-4e24-8859-351708d070ab/5743b8f9-86cb-4e24-8859-351708d070ab-corrected-20261103.png

- original digest: `sha256:9e53898df86b782eef50fc8763ede02ac7519b5c51e66a8cabb2782b78b6fef5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Mathematik? – Entdecken, Muster & Alltag — `65365dce-f33f-49d8-9516-42f75883aa86` (outside this book)
- Potenzen mit natürlichen Exponenten deuten und berechnen — `d658e26a-e351-4bca-824e-f346deaa87c5` (outside this book)
- Lineare Gleichungssysteme lösen und deuten — `546bf0b3-6921-416b-a2ef-8fd37d429dc7` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f638acdf0ff3d3c32bc43b63c69864a65afdf32ec64ff7bb9d4ad118031aa851`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `conditions-to-system`
  - Essential understanding (DE): Eine Bedingung an f(x)=ax²+bx+c wird durch Einsetzen als lineare Gleichung in a, b und c ausgedrückt; passende unabhängige Bedingungen bestimmen dieselben drei Koeffizienten gemeinsam.
  - Essential understanding (EN): A condition on f(x)=ax²+bx+c becomes a linear equation in a, b and c by substitution; suitable independent conditions jointly determine those same three coefficients.
  - Observable performance (DE): Die lernende Person übersetzt die gegebenen Punkte oder linearen Bedingungen selbstständig in ein Gleichungssystem mit den Unbekannten a, b und c und erläutert jede Gleichung.
  - Observable performance (EN): The learner independently translates given points or linear conditions into a system with unknowns a, b and c and explains each equation.
- `solve-explain-check`
  - Essential understanding (DE): Die Lösung des Gleichungssystems muss alle Ausgangsbedingungen gleichzeitig erfüllen; a≠0 sichert, dass der ermittelte Term quadratisch ist.
  - Essential understanding (EN): The solution of the system must satisfy all original conditions simultaneously; a≠0 ensures that the resulting expression is quadratic.
  - Observable performance (DE): Die lernende Person löst das System mit einem nachvollziehbaren Verfahren, erläutert den Ablauf algorithmisch und überprüft den gefundenen Funktionsterm an den ursprünglichen Bedingungen.
  - Observable performance (EN): The learner solves the system with a transparent method, explains its algorithmic sequence and checks the resulting function expression against the original conditions.

**Coverage expectations**

- required expectations: `conditions-to-system`, `solve-explain-check`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `kind-of-condition`: Zwischen drei Punkten und einer Kombination aus Punkten und einer Gleichheit zweier Funktionswerte wechseln. / Change between three points and a combination of points and an equality of two function values.

**Application cases**

- `three-points`
  - Task demand (DE): Bestimme ohne Musterlösung f(x)=ax²+bx+c durch (0|1), (1|0) und (2|3) mit einem linearen Gleichungssystem. Erläutere den Ablauf und prüfe die Bedingungen.
  - Task demand (EN): Without a worked solution, determine f(x)=ax²+bx+c through (0,1), (1,0) and (2,3) using a system of linear equations. Explain the procedure and check the conditions.
  - Expected performance (DE): Aus c=1, a+b+c=0 und 4a+2b+c=3 folgt a=2, b=−3, c=1. Die lernende Person erläutert den Lösungsgang und bestätigt alle drei Punktwerte sowie a≠0.
  - Expected performance (EN): From c=1, a+b+c=0 and 4a+2b+c=3 it follows that a=2, b=−3, c=1. The learner explains the solution sequence and confirms all three point values and a≠0.
  - Understanding focus (DE): Punktbedingungen werden in ein gemeinsames Koeffizientensystem übersetzt und am Funktionsterm geprüft.
  - Understanding focus (EN): Point conditions are translated into one coefficient system and checked against the function expression.
- `equal-heights`
  - Task demand (DE): Für eine neue Parabel gilt f(0)=1, f(2)=−3 und f(1)=f(3). Bestimme den Term durch ein lineares Gleichungssystem und erläutere besonders die Gleichung aus der letzten Bedingung.
  - Task demand (EN): For a fresh parabola, f(0)=1, f(2)=−3 and f(1)=f(3). Determine the expression using a system of linear equations and explain in particular the equation arising from the final condition.
  - Expected performance (DE): c=1, 4a+2b+c=−3 und a+b+c=9a+3b+c liefern a=1, b=−4, c=1. f(1)=f(3)=−2 bestätigt die relative Bedingung. Die Erklärung nennt Aufbau, Lösung und Rückprüfung.
  - Expected performance (EN): c=1, 4a+2b+c=−3 and a+b+c=9a+3b+c yield a=1, b=−4, c=1. f(1)=f(3)=−2 confirms the relative condition. The explanation covers construction, solution and checking.
  - Understanding focus (DE): Die Bedingungsart wechselt von fest vorgegebenen Punktwerten zu einer Beziehung zweier Werte; Ableitungen sind nicht erforderlich.
  - Understanding focus (EN): The condition changes from specified point values to a relationship between two values; derivatives are not required.
