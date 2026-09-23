// Authored independent first pass. This file mechanically binds the decisions
// below to the immutable campaign input; it does not approve curriculum text.
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const batchRoot = resolve(here, '..');
const campaign = JSON.parse(readFileSync(join(here, 'description-review-campaign.json'), 'utf8'));
const batch = campaign.batches[0];
const bundle = JSON.parse(readFileSync(join(batchRoot, 'bundle/manifest.json'), 'utf8'));
const batchInputPath = join(here, 'batches', `${batch.batchId}.input.jsonl`);
const input = readFileSync(batchInputPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const digestFile = (path) => sha(readFileSync(path));
const runId = `${campaign.campaignId}.run-001`;

// Each authored entry: decision, essential DE/EN, performance DE/EN,
// transfer DE/EN, rationale, optional complete replacement DE/EN.
const decisions = [
  {
    decision: 'keep',
    essentialDe: 'Bei exponentieller Veränderung wird in gleichen Zeitschritten mit demselben Faktor multipliziert; Wachstums- und Zerfallsfaktoren führen zu unterschiedlichen Verläufen in Tabelle und Graph.',
    essentialEn: 'For exponential change, the quantity is multiplied by the same factor in equal time steps; growth and decay factors produce different patterns in tables and graphs.',
    performanceDe: 'Die lernende Person erkennt in einer Tabelle gleiche Quotienten statt gleicher Differenzen, beschreibt den passenden Graphenverlauf und ordnet eine Exponentialfunktion mit plausiblen Anfangswert und Faktor zu.',
    performanceEn: 'The learner identifies equal ratios rather than equal differences in a table, describes the matching graph shape, and assigns an exponential function with a plausible initial value and factor.',
    transferDe: 'Bei einer neuen Sachsituation mit Abnahme statt Zunahme entscheidet die lernende Person anhand geänderter Darstellung, ob das Modell exponentiell passt, und wählt einen Faktor zwischen null und eins.',
    transferEn: 'In a new real-world situation involving decrease rather than increase, the learner decides from a changed representation whether an exponential model fits and chooses a factor between zero and one.',
    rationale: 'KEEP: Erkennen, Merkmale benennen und eine passende Exponentialfunktion zuordnen sind eine zusammenhängende Deutung derselben Veränderung; die genaue Parameterrekonstruktion bleibt beim getrennten Ziel c74d0c7e.'
  },
  {
    decision: 'keep',
    essentialDe: 'In einem Exponentialterm bestimmt der Anfangswert den Wert bei der gewählten Nullstelle der Zeitachse; der Wachstumsfaktor beschreibt die multiplikative Änderung je Zeiteinheit und muss zum Kontext passen.',
    essentialEn: 'In an exponential expression, the initial value gives the value at the chosen time origin; the growth factor describes the multiplicative change per time unit and must fit the context.',
    performanceDe: 'Die lernende Person liest Anfangswert und Faktor aus einem Term oder bestimmt sie aus geeigneten Werten, prüft die Gleichung an weiteren gegebenen Punkten und erläutert beide Parameter in ihren Einheiten.',
    performanceEn: 'The learner reads the initial value and factor from an expression or determines them from suitable values, checks the equation against other given points, and explains both parameters with their units.',
    transferDe: 'Wenn eine unabhängige Aufgabe den Zeitnullpunkt oder die Zeiteinheit verändert, bestimmt die lernende Person die neue Parameterdarstellung und erklärt, was an der modellierten Entwicklung gleich bleibt.',
    transferEn: 'When an independent task changes the time origin or time unit, the learner determines the new parameter representation and explains what remains the same about the modeled development.',
    rationale: 'KEEP: Gleichung lesen, Parameter aus Werten erschließen und deren Kontextbedeutung bilden eine einheitliche Modellinterpretation. Die Formulierung behauptet weder eine spezielle Funktionsform noch ein bestimmtes Werkzeug.'
  },
  {
    decision: 'keep',
    essentialDe: 'Ein exponentieller Prozess verbindet Term, Tabelle und Graph durch einen konstanten multiplikativen Schritt; Anfangswert und Faktor erklären den zeitlichen Verlauf im Sachkontext.',
    essentialEn: 'An exponential process connects expression, table, and graph through a constant multiplicative step; initial value and factor explain its trajectory in context.',
    performanceDe: 'Die lernende Person beschreibt denselben Wachstums- oder Zerfallsprozess anhand eines Terms, geeigneter Tabellenwerte und des Graphen und erklärt, wie Anfangswert und Faktor den Verlauf prägen.',
    performanceEn: 'The learner describes the same growth or decay process using an expression, suitable table values, and the graph, and explains how initial value and factor shape the trajectory.',
    transferDe: 'Aus einer neuen Beschreibung mit anderer Anfangszeit und einem Zerfallsprozess statt Wachstum stellt die lernende Person konsistente Term-, Tabellen- und Graphinformationen her und deutet den Verlauf.',
    transferEn: 'From a new description with a different initial time and decay rather than growth, the learner produces consistent expression, table, and graph information and interprets the trajectory.',
    rationale: 'KEEP: Das Ziel fordert eine integrierte Darstellung und Erklärung eines Prozesses, nicht drei isolierte Routinen. Es überschneidet sich mit den Erkennungs- und Parameterzielen, fügt aber die koordinierte eigene Beschreibung über drei Darstellungen hinzu.'
  },
  {
    decision: 'keep',
    essentialDe: 'Der Logarithmus beantwortet bei zulässiger positiver Basis ungleich eins und positivem Argument die Frage nach dem Exponenten: log_b(a)=c genau dann, wenn b^c=a.',
    essentialEn: 'For an admissible positive base other than one and a positive argument, a logarithm answers the question of the exponent: log_b(a)=c exactly when b^c=a.',
    performanceDe: 'Die lernende Person übersetzt einfache Logarithmen in gleichwertige Potenzgleichungen, bestimmt daraus exakte Werte und erläutert bei nicht einfachen Werten die digitale Näherung.',
    performanceEn: 'The learner converts simple logarithms to equivalent power equations, obtains exact values from them, and explains the digital approximation for less simple values.',
    transferDe: 'Bei einer neuen Potenzgleichung mit gebrochenem oder negativem Exponenten wählt die lernende Person die logarithmische Darstellung und prüft Basis, Argument und Ergebnis.',
    transferEn: 'For a new exponential equation with a fractional or negative exponent, the learner chooses the logarithmic representation and checks the base, argument, and result.',
    rationale: 'KEEP: Umkehrbeziehung und Wertbestimmung sind ein zusammenhängender Einstieg; die Beschreibung unterscheidet ausdrücklich Definition in einfachen Fällen und digitale Werkzeuge sonst.'
  },
  {
    decision: 'keep',
    essentialDe: 'Exponentielle Zunahme und Abnahme haben bei gleichen Schritten einen konstanten Faktor, lineare Zunahme dagegen eine konstante Differenz; für Abnahme liegt ein positiver Faktor unter eins vor.',
    essentialEn: 'Exponential increase and decrease have a constant factor over equal steps, whereas linear increase has a constant difference; for decrease the positive factor is below one.',
    performanceDe: 'Die lernende Person veranschaulicht Wachstum und Zerfall in Tabelle oder Graph und begründet anhand von Quotienten und Differenzen, weshalb ein Verlauf exponentiell oder linear ist.',
    performanceEn: 'The learner illustrates growth and decay in a table or graph and uses ratios and differences to justify whether a pattern is exponential or linear.',
    transferDe: 'In einer neuen Darstellung mit ungleichen Zeitabständen berechnet die lernende Person erst vergleichbare Schrittweiten und beurteilt dann, ob konstante Faktoren oder Differenzen vorliegen.',
    transferEn: 'In a new representation with unequal time intervals, the learner first establishes comparable step lengths and then judges whether factors or differences are constant.',
    rationale: 'KEEP: Beschreibung und begründete Abgrenzung sind Teil derselben Strukturentscheidung; die Darstellung ist methodenneutral und fachlich korrekt.'
  },
  {
    decision: 'keep',
    essentialDe: 'Ein ganzrationaler Funktionsterm ist eine endliche Summe aus Koeffizienten mal Potenzen von x mit nicht negativen ganzen Exponenten; Ordnung und fehlende Potenzglieder ändern diese Struktur nicht.',
    essentialEn: 'A polynomial function expression is a finite sum of coefficients times powers of x with non-negative integer exponents; term order and missing powers do not change this structure.',
    performanceDe: 'Die lernende Person zerlegt einen gegebenen Term in Potenzsummanden, benennt Koeffizienten und Exponenten und entscheidet fachsprachlich begründet, ob der Term ganzrational ist.',
    performanceEn: 'The learner decomposes a given expression into power terms, identifies coefficients and exponents, and explains in mathematical language whether it is polynomial.',
    transferDe: 'Bei einem neu faktorisiert oder ungeordnet dargestellten Term bringt die lernende Person ihn in eine Summe und grenzt einen Term mit x im Nenner oder gebrochenem Exponenten ab.',
    transferEn: 'For a newly factored or unordered expression, the learner rewrites it as a sum and distinguishes it from an expression with x in the denominator or a fractional exponent.',
    rationale: 'KEEP: Beschreibung der Potenzsumme und fachsprachliche Einordnung sind dieselbe strukturelle Kompetenz. Keine zusätzliche Kurvendiskussion wird hineingelesen.'
  },
  {
    decision: 'keep',
    essentialDe: 'Für große Beträge von x dominiert bei einer ganzrationalen Funktion der Term höchsten Grades; Gradparität und Vorzeichen seines Koeffizienten bestimmen die beiden Enden des Graphen.',
    essentialEn: 'For large absolute values of x, the highest-degree term dominates a polynomial function; parity of the degree and the sign of its coefficient determine the graph at both ends.',
    performanceDe: 'Die lernende Person identifiziert Grad und führenden Koeffizienten, gibt das Verhalten für x gegen plus und minus unendlich getrennt an und begründet es über den dominierenden Term.',
    performanceEn: 'The learner identifies degree and leading coefficient, states behavior separately as x approaches positive and negative infinity, and justifies it using the dominant term.',
    transferDe: 'Nach einer Änderung von geradem zu ungeradem Grad oder einem Vorzeichenwechsel des Leitkoeffizienten sagt die lernende Person die neuen Endrichtungen voraus und begründet den Unterschied.',
    transferEn: 'After changing an even degree to an odd degree or reversing the leading coefficient sign, the learner predicts the new end directions and explains the difference.',
    rationale: 'KEEP: Die Beschreibung nennt genau die zwei entscheidenden Merkmale und verlangt eine Begründung, ohne aus der Skizze allein zu schließen.'
  },
  {
    decision: 'keep',
    essentialDe: 'Achsensymmetrie zur y-Achse entspricht f(-x)=f(x), Punktsymmetrie zum Ursprung f(-x)=-f(x); bei Potenzsummen lässt sich das an den vorkommenden Exponenten prüfen.',
    essentialEn: 'Symmetry about the y-axis corresponds to f(-x)=f(x), and point symmetry about the origin to f(-x)=-f(x); the exponents in a power sum reveal these properties.',
    performanceDe: 'Die lernende Person setzt -x in einen Funktionsterm ein, vergleicht die Ausdrücke und begründet anhand gerader, ungerader oder gemischter Potenzen die zutreffende Symmetrie oder ihr Fehlen.',
    performanceEn: 'The learner substitutes -x into an expression, compares the results, and uses even, odd, or mixed powers to justify the relevant symmetry or its absence.',
    transferDe: 'Bei einem neuen Term mit geraden und ungeraden Anteilen zeigt die lernende Person, warum keines der beiden Kriterien erfüllt ist, statt aus einem einzelnen Graphenpunkt zu schließen.',
    transferEn: 'For a new expression containing both even and odd parts, the learner shows why neither criterion holds rather than inferring symmetry from one graph point.',
    rationale: 'KEEP: Rechnerische Prüfung und Strukturblick sind zwei Zugänge zur selben Symmetrieeigenschaft und keine unabhängigen Lernziele.'
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann bei einfachen ganzrationalen Funktionen Funktionsterm und Graph einander zuordnen und charakteristische Graphverläufe anhand des Terms beschreiben.',
    proposedDescriptionEn: 'The learner can match expressions and graphs of simple polynomial functions and describe characteristic graph behavior from the expression.',
    essentialDe: 'Bei einer einfachen ganzrationalen Funktion hängen Termstruktur und Graphverlauf zusammen; geeignete Merkmale eines Graphen lassen sich im Term wiedererkennen und umgekehrt.',
    essentialEn: 'For a simple polynomial function, expression structure and graph behavior are related; suitable graph features can be recognized in the expression and vice versa.',
    performanceDe: 'Die lernende Person ordnet einem einfachen ganzrationalen Term einen passenden Graphen zu und erläutert mindestens zwei für den konkreten Fall aussagekräftige Merkmale des Verlaufs.',
    performanceEn: 'The learner matches a simple polynomial expression to a suitable graph and explains at least two features of its behavior that matter in that case.',
    transferDe: 'Bei einem unabhängigen Graphen mit verändertem Vorzeichen oder zusätzlichem Summanden prüft die lernende Person, welche der angebotenen Terme zu den sichtbaren Merkmalen passen.',
    transferEn: 'For an independent graph with a reversed sign or added term, the learner checks which proposed expressions fit the visible features.',
    rationale: 'REVISE: „über Funktionsterm, Graph und charakteristische Verläufe beschreiben“ benennt die Verbindung der Darstellungen nicht ausdrücklich. Das lokale Matching präzisiert die schon beanspruchte Term-Graph-Deutung ohne neue Kurvendiskussion. Die Seite zeigt vorwiegend Sek-II-GK/LK-Scope trotz J10-Tag; diese Projektionsbindung ist gesondert zu prüfen, nicht durch den Text zu kaschieren.'
  },
  {
    decision: 'keep',
    essentialDe: 'Faktor-, Summen- und Potenzregel erlauben, einen einfachen Funktionsterm gliedweise abzuleiten; Konstanten, Koeffizienten und Exponenten haben dabei unterschiedliche Rollen.',
    essentialEn: 'The constant-factor, sum, and power rules allow simple function expressions to be differentiated term by term; constants, coefficients, and exponents play different roles.',
    performanceDe: 'Die lernende Person zerlegt einen einfachen Term in geeignete Summanden, begründet die auf jeden Teil angewandte Regel und stellt die Ableitung mit nachvollziehbaren Zwischenschritten dar.',
    performanceEn: 'The learner decomposes a simple expression into suitable terms, justifies the rule applied to each part, and presents the derivative with traceable intermediate steps.',
    transferDe: 'Bei einem neu angeordneten Polynom mit negativem Koeffizienten und konstantem Summanden leitet die lernende Person korrekt ab und erklärt, weshalb die Konstante entfällt.',
    transferEn: 'For a newly reordered polynomial with a negative coefficient and a constant term, the learner differentiates correctly and explains why the constant disappears.',
    rationale: 'KEEP: Die genannten drei Regeln gehören zur einen Kompetenz, einfache Terme nachvollziehbar abzuleiten. Produkt- oder Kettenregel wird nicht implizit verlangt.'
  },
  {
    decision: 'split_review',
    essentialDe: 'Das Vorzeichen der ersten Ableitung hängt mit Steigen und Fallen der Funktion zusammen; stationäre Stellen und Randwerte sind für lokale bzw. globale Extrema unterschiedlich zu prüfen, während der Ableitungsgraph Änderungsraten sichtbar macht.',
    essentialEn: 'The sign of the first derivative is related to increasing and decreasing behavior; stationary points and endpoint values must be checked differently for local and global extrema, while the derivative graph displays rates of change.',
    performanceDe: 'Die lernende Person deutet einen einfachen Funktion-Ableitungs-Graphen, leitet Monotonieintervalle aus dem Vorzeichen von f’ ab und prüft bei einer gegebenen Definitionsmenge Kandidaten für lokale und globale Extrema.',
    performanceEn: 'The learner interprets a simple function-derivative graph, infers monotonicity intervals from the sign of f′, and checks candidates for local and global extrema on a given domain.',
    transferDe: 'Bei einer neuen Funktion mit gleicher stationärer Stelle, aber geändertem Vorzeichenwechsel oder begrenztem Definitionsintervall entscheidet die lernende Person neu über lokale und globale Extremstellen.',
    transferEn: 'For a new function with the same stationary point but a changed sign pattern or bounded domain, the learner reassesses local and global extrema.',
    rationale: 'SPLIT_REVIEW: Graphische Funktion-Ableitungs-Beziehung, Monotonieuntersuchung und insbesondere lokale gegenüber globalen Extrema sind getrennt beherrschbare Leistungen. Ein Wortlaut-Fix würde diese Atomicity-Frage verdecken; bestehende Zielidentität und Assessment-Bindungen müssen vor einer Aufspaltung geklärt werden.'
  },
  {
    decision: 'keep',
    essentialDe: 'Die Tangentensteigung am Punkt ist f’(x₀); die Normale steht dort senkrecht auf der Tangente und hat bei nicht waagerechter Tangente die negative Kehrwert-Steigung.',
    essentialEn: 'The tangent slope at a point is f′(x₀); the normal is perpendicular to the tangent there and, for a non-horizontal tangent, has the negative reciprocal slope.',
    performanceDe: 'Die lernende Person bestimmt Berührpunkt und Tangentensteigung, stellt beide Geradengleichungen auf und prüft am gemeinsamen Punkt die senkrechte Lage der Geraden.',
    performanceEn: 'The learner determines the point of contact and tangent slope, writes both line equations, and checks at their common point that the lines are perpendicular.',
    transferDe: 'Bei einer neuen Funktion mit waagerechter Tangente erkennt die lernende Person eine senkrechte Normale x=x₀ und vermeidet eine nicht definierte Kehrwert-Steigung.',
    transferEn: 'For a new function with a horizontal tangent, the learner recognizes the vertical normal x=x₀ and avoids an undefined reciprocal slope.',
    rationale: 'KEEP: Tangente und Normale sind hier eine zusammenhängende lokale Geradenkonstruktion am selben Punkt; die Normale wird aus der Tangente abgeleitet. Der Sonderfall der vertikalen Normalen gehört zur fachlich korrekten Deutung, nicht zu einer zusätzlichen Kompetenz.'
  },
  {
    decision: 'keep',
    essentialDe: 'Eine Tangente stimmt am Berührpunkt mit Funktionswert und erster Ableitung überein; deshalb nähert ihre Gerade Funktionswerte in der Nähe des Punktes an, nicht beliebig weit entfernt.',
    essentialEn: 'At the point of contact, a tangent agrees with the function in value and first derivative; its line therefore approximates function values near that point, not arbitrarily far away.',
    performanceDe: 'Die lernende Person bestimmt in einem einfachen Fall die Tangentengleichung, nutzt sie für einen nahe gelegenen Wert und erläutert, warum das Ergebnis eine lokale Näherung ist.',
    performanceEn: 'In a simple case, the learner determines the tangent equation, uses it for a nearby value, and explains why the result is a local approximation.',
    transferDe: 'Bei einem unabhängig gewählten weiter entfernten Eingabewert vergleicht die lernende Person Näherung und Funktion und beurteilt, warum die Tangente dort weniger zuverlässig sein kann.',
    transferEn: 'At an independently chosen input farther from the contact point, the learner compares approximation and function and judges why the tangent may be less reliable there.',
    rationale: 'KEEP: Tangente als lokale Näherung und Deutung der Näherung bilden eine Kompetenz; eine globale Fehlerabschätzung wird nicht behauptet.'
  },
  {
    decision: 'keep',
    essentialDe: 'Das Vorzeichen der zweiten Ableitung beschreibt in einfachen differenzierbaren Fällen die Krümmungsrichtung; eine Wendestelle erfordert einen Wechsel des Krümmungsverhaltens, nicht bloß f’’(x)=0.',
    essentialEn: 'In simple differentiable cases, the sign of the second derivative describes curvature direction; an inflection point requires a change in curvature behavior, not merely f″(x)=0.',
    performanceDe: 'Die lernende Person bestimmt in einem einfachen Term die zweite Ableitung, untersucht ihr Vorzeichen beiderseits einer Kandidatenstelle und beschreibt damit Krümmungsbereiche und eine tatsächliche Wendestelle.',
    performanceEn: 'For a simple expression, the learner finds the second derivative, checks its sign on both sides of a candidate point, and uses this to describe curvature regions and a genuine inflection point.',
    transferDe: 'Bei einer neuen Funktion mit f’’(x₀)=0 ohne Vorzeichenwechsel verwirft die lernende Person die Kandidatenstelle als Wendestelle und begründet dies anhand des Krümmungsverlaufs.',
    transferEn: 'For a new function with f″(x₀)=0 but no sign change, the learner rejects the candidate as an inflection point and explains this from curvature behavior.',
    rationale: 'KEEP: Wendestelle ist gerade ein Wechsel des Krümmungsverhaltens, sodass beide Begriffe eine zusammenhängende Untersuchung bilden. Die Beschreibung bleibt bewusst auf einfache Fälle begrenzt.'
  },
  {
    decision: 'keep',
    essentialDe: 'Einmaliges Quadrieren kann eine isolierte Quadratwurzel beseitigen, ist aber ohne Zusatzbedingungen nicht umkehrbar; nur Lösungen der ursprünglichen Gleichung sind gültig.',
    essentialEn: 'One squaring step can remove an isolated square root, but is not reversible without additional conditions; only solutions of the original equation are valid.',
    performanceDe: 'Die lernende Person isoliert den Wurzelausdruck, quadriert einmal, löst die entstehende Gleichung und setzt jeden Kandidaten in die Ausgangsgleichung ein.',
    performanceEn: 'The learner isolates the radical, squares once, solves the resulting equation, and substitutes each candidate into the original equation.',
    transferDe: 'Bei einer neuen Wurzelgleichung mit negativem Ausdruck auf der anderen Seite erkennt die lernende Person eine durch Quadrieren entstehende Scheinlösung und verwirft sie nach Probe.',
    transferEn: 'For a new radical equation with a negative expression on the other side, the learner recognizes an extraneous solution created by squaring and rejects it after checking.',
    rationale: 'KEEP: Einmaliges Quadrieren und Scheinlösungskontrolle bilden denselben korrekten Lösungsprozess. Mehrfaches Quadrieren bleibt außerhalb des Ziels.'
  },
  {
    decision: 'keep',
    essentialDe: 'Bei Potenzgleichungen hängen Anzahl und Zulässigkeit reeller Lösungen von Exponent, Vorzeichen der rechten Seite und Definitionsbereich ab; Umkehroperationen müssen diese Bedingungen erhalten.',
    essentialEn: 'For power equations, the number and admissibility of real solutions depend on the exponent, sign of the right-hand side, and domain; inverse operations must respect these conditions.',
    performanceDe: 'Die lernende Person löst einfache Gleichungen der Form x^n=a oder entsprechend umgestellte Varianten, unterscheidet gerade und ungerade Potenzen und prüft die erhaltenen Werte.',
    performanceEn: 'The learner solves simple equations of the form x^n=a or suitably rearranged variants, distinguishes even and odd powers, and checks the resulting values.',
    transferDe: 'Bei einer neuen Gleichung mit negativem a erklärt die lernende Person, warum eine gerade Potenz keine reelle Lösung, eine ungerade Potenz aber eine reelle Lösung haben kann.',
    transferEn: 'For a new equation with negative a, the learner explains why an even power has no real solution while an odd power can have a real solution.',
    rationale: 'KEEP: Umkehroperation, Wurzel- oder Potenzschreibweise und Probe sind methodische Bestandteile derselben einfachen Potenzgleichung.'
  },
  {
    decision: 'keep',
    essentialDe: 'Eine geeignete Substitution ersetzt wiederkehrende Teilausdrücke durch eine neue Variable und macht eine bekannte Gleichungsform sichtbar; nach dem Lösen sind Rücksubstitution und Probe nötig.',
    essentialEn: 'A suitable substitution replaces recurring subexpressions with a new variable and reveals a familiar equation form; solving must be followed by back-substitution and checking.',
    performanceDe: 'Die lernende Person wählt bei einer Gleichung mit Potenzen eine passende Ersatzvariable, löst die entstehende bekannte Gleichung, substituiert zurück und prüft alle Kandidaten im Original.',
    performanceEn: 'For an equation involving powers, the learner chooses an appropriate replacement variable, solves the resulting familiar equation, substitutes back, and checks every candidate in the original.',
    transferDe: 'Bei einer neuen Gleichung, in der der ersetzte Ausdruck nur nichtnegative Werte annehmen kann, verwirft die lernende Person unzulässige Lösungen der Hilfsgleichung vor der Rücksubstitution.',
    transferEn: 'For a new equation in which the substituted expression can only be nonnegative, the learner rejects inadmissible auxiliary-equation solutions before back-substitution.',
    rationale: 'KEEP: Substituieren, Rücksubstituieren und Prüfen sind untrennbare Phasen derselben Methode; der Text schreibt keine zusätzliche Gleichungsfamilie vor.'
  },
  {
    decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann für differenzierbare Funktionen den Monotoniesatz (f’ > 0 bzw. f’ < 0 auf einem Intervall) erklären und anwenden sowie mit einem Gegenbeispiel begründen, warum strenge Monotonie nicht überall ein strenges Ableitungsvorzeichen erzwingt.',
    proposedDescriptionEn: 'The learner can explain and apply the monotonicity theorem for differentiable functions (f′ > 0 or f′ < 0 on an interval) and use a counterexample to justify why strict monotonicity does not force a strictly signed derivative everywhere.',
    essentialDe: 'Ein auf einem Intervall strikt positives oder negatives Ableitungsvorzeichen genügt für strenges Steigen bzw. Fallen; die Umkehrung ist falsch, weil eine streng steigende Funktion an einzelnen Stellen Ableitung null haben kann.',
    essentialEn: 'A derivative that is strictly positive or negative throughout an interval suffices for strict increase or decrease; the converse is false because a strictly increasing function can have derivative zero at isolated points.',
    performanceDe: 'Die lernende Person begründet aus dem Ableitungsvorzeichen den Monotonieverlauf und zeigt an einer streng monotonen Funktion wie x³ mit f’(0)=0, weshalb die strenge Umkehrung scheitert.',
    performanceEn: 'The learner infers monotonic behavior from the derivative sign and uses a strictly monotone function such as x³ with f′(0)=0 to show why the strict converse fails.',
    transferDe: 'Bei einer neuen Funktion mit f’ an einzelnen Punkten gleich null, sonst positiv, trennt die lernende Person die hinreichende Vorzeichenregel von der unbegründeten Aussage, strenges Wachstum verlange f’ > 0 überall.',
    transferEn: 'For a new function whose derivative is zero at isolated points but otherwise positive, the learner separates the sufficient sign rule from the unjustified claim that strict increase requires f′ > 0 everywhere.',
    rationale: 'REVISE: Ohne Nennung der strengen Variante ist „die Umkehrung gilt im Allgemeinen nicht“ mathematisch mehrdeutig: Für nichtfallende differenzierbare Funktionen ist f’ ≥ 0 tatsächlich äquivalent. Die lokale Präzisierung erhält die beanspruchte Gegenbeispiel-Kompetenz und macht die Aussage korrekt.'
  },
];

if (decisions.length !== input.length || input.length !== campaign.goalCount) {
  throw new Error('Authored decision count does not match bound input');
}
const schema = 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json';
const records = input.map((item, index) => {
  const goal = item.goal;
  const decision = decisions[index];
  const { proposedDescriptionDe, proposedDescriptionEn } = decision;
  if (decision.decision === 'revise' !== Boolean(proposedDescriptionDe && proposedDescriptionEn)) {
    throw new Error(`Replacement mismatch at ordinal ${index + 1}`);
  }
  return {
    $schema: schema,
    schemaVersion: 1,
    recordId: `${runId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: item.bundleFingerprint,
    bookDigest: item.bookDigest,
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe,
    currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe,
    currentDescriptionEn: goal.currentDescriptionEn,
    decision: decision.decision,
    ...(proposedDescriptionDe ? { proposedDescriptionDe, proposedDescriptionEn } : {}),
    understandingEvidence: {
      essentialUnderstandingDe: decision.essentialDe,
      essentialUnderstandingEn: decision.essentialEn,
      observablePerformanceDe: decision.performanceDe,
      observablePerformanceEn: decision.performanceEn,
      transferExpectationDe: decision.transferDe,
      transferExpectationEn: decision.transferEn,
    },
    rationale: decision.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  };
});

const recordsBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
const artifacts = [
  ['book_pdf', join(batchRoot, 'bundle/book.pdf')],
  ['book_model', join(batchRoot, 'bundle/book-model.json')],
  ['review_input_json', join(batchRoot, 'bundle/review-input.json')],
  ['review_prompt', join(here, 'prompt.md')],
  ['review_criteria', join(here, 'criteria.md')],
  ['description_review_batch_input_jsonl', batchInputPath],
];
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  provider: 'openai',
  model: 'gpt-6',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(Buffer.from(JSON.stringify({ campaign: campaign.campaignId, round: 'a', mode: 'blind-first-pass', output: 'candidate' }))),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: artifacts.map(([role, path]) => ({ role, digest: digestFile(path) })),
  startedAt: '2026-09-23T01:56:19.000Z',
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha(recordsBytes),
  toolchainVersion: 'codex-api-review-v1',
};
if (bundle.bookModelDigest !== run.bookDigest) throw new Error('Book model changed');
const results = join(here, 'results');
mkdirSync(results, { recursive: true });
writeFileSync(join(results, `${batch.batchId}.records.jsonl`), recordsBytes);
writeFileSync(join(results, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`);
console.log(JSON.stringify({ runId, count: records.length, decisions: records.reduce((counts, item) => ({ ...counts, [item.decision]: (counts[item.decision] ?? 0) + 1 }), {}) }));
