## Optionale Erwerbs- und Zeitplanung: Reihenfolge und Budget {#sec:levels anchors="12-learning-units-and-optional-planning-profiles,12-optional-curriculum-level-assignments"}

Dieser Abschnitt beantwortet zwei Planungsfragen: Lassen sich die Ziele eines Plans in der vorgesehenen zeitlichen Reihenfolge überhaupt erwerben, und reicht die verfügbare Zeit dafür? Beide Prüfungen rechnen mit einem Plan, nicht mit dem Lernzustand einer Person.

:::principle {title="Status: zusätzliches Zeit- und Budgetprofil"}
Kanonische fachliche Lerneinheiten und gemeinsame Landesplaneinheiten (Stufen, Jahrgänge, Phasen) regeln den strukturellen Aufbau und die `after`-Ordnung in Abschnitt~@ref{sec:learning-units}. Davon getrennt ordnet ein optionaler **datierter Zeit- und Budgetplan** Erwerbsziele auf kalendarische Planungsstufen $S_i$ (etwa Halbjahre oder Unterrichtswochen) und prüft die verfügbare Lernzeit. Dieses Zeitprofil verändert weder Grundgraphgültigkeit noch gespeicherte Mastery, führt keine technischen Einheitssperren ein und behauptet keinen produktiven fächerübergreifenden Budgetvalidator.
:::

Zwei Bildungsgänge können dieselbe Einheit zu verschiedenen Zeiten vorsehen. Ein datierter Plan sieht Zeit für den vorgesehenen Einstieg und die benötigten Inhalte vor. Was eine Person bereits erledigt hat und was sie im aktuellen Fokus wählen kann, folgt aus ihrem Lernzustand (Abschnitte~@ref{sec:state} und~@ref{sec:filters}).

### Plan, Eintrittsbasis und eindeutiger Ersterwerb {#sec:plan-entry anchors="121-plan-scope-and-entry-basis"}

Für einen aufgelösten Plan $\pi$ seien

$$
\begin{aligned}
T_\pi &\subseteq A && \text{geplante Erwerbsziele},\\
B_\pi &\subseteq A \setminus T_\pi && \text{ausdrücklich angenommene Eintrittsbasis},\\
n_\pi &\in \N_{>0}, \qquad \ell_\pi : T_\pi \to \{1, \ldots, n_\pi\} && \text{Planungsstufe}.
\end{aligned}
$$

Der Plan nennt also, was erworben werden soll ($T_\pi$), was beim Eintritt als vorhanden angenommen wird ($B_\pi$) und in welcher der $n_\pi$ Planungsstufen jedes Ziel erstmals erworben wird ($\ell_\pi$). Die Planungsstufen und ihre Präfixe sind

$$
S_i = \{g \in T_\pi \mid \ell_\pi(g) = i\}, \quad S_{<i} = \bigcup_{j < i} S_j, \quad S_{\le i} = \bigcup_{j \le i} S_j.
$$

Diese zeitliche Zuordnung (Abbildung~@ref{fig:levels}) referenziert die fachliche Ersterwerbszuordnung der Lerneinheiten, ersetzt sie aber nicht. Jedes Ziel wird im Plan einer ersten Planungsstufe zugeordnet. Ein anderer Bildungsgang darf es anders platzieren. Spätere Wiederholung, Vertiefung oder Anwendung sind zusätzliche Aktivitäten, keine neue Zielidentität. $B_\pi$ ist eine Planungsannahme; sie schreibt keine Lernergebnisse. Persönliche Lücken in dieser Basis brauchen eine eigene Diagnose und zusätzliche Lernzeit.

::figure{id="fig:levels"}

### Strukturelle Machbarkeit durch einen Abschlusszeugen {#sec:witness anchors="122-structural-feasibility"}

Die angenommene Eintrittsbasis setzt eine Planungsgrenze: Ihre frühere Erwerbsgeschichte wird nicht rekonstruiert. Nur für den hypothetischen Planungstest sei deshalb

$$
\Rat^{\pi} = \{(a, b) \in \Rat \mid a \notin B_\pi\}.
$$

$\Frontier_\pi$ ist die Frontier aus @eqref{eq:frontier} mit dieser Relation und ihrer vollständigen transitiven Hülle. Alle Ziele und früheren Planungsstufen behalten ihre transitiven Anforderungen; nur an deklarierten Eintrittskompetenzen endet die Planungsrekonstruktion. Diese Ausnahme erlaubt keinen Stopp an Mastery-Zwischenzielen im wirklichen Lernzustand.

Ein *Abschlusszeuge* einer Planungsstufe ist eine Reihenfolge ihrer Ziele, in der jedes Ziel verfügbar ist, sobald es an der Reihe ist. Eine Planungsstufe $S_i$ mit $s_i$ Zielen ist strukturell machbar, wenn sich ihre Ziele als $a_1, \ldots, a_{s_i}$ aufzählen lassen, sodass

:::equation {#eq:level-witness}
a_j \in \Frontier_\pi\!\left(B_\pi \cup S_{<i} \cup \{a_1, \ldots, a_{j-1}\}\right) \qquad (1 \le j \le s_i).
:::

Ein Beispiel in derselben Unterrichtswoche genügt. Das Ziel $g$ braucht $p$, alle weiteren Voraussetzungen gelten für die Planung als erfüllt. Dann zeigt die Reihenfolge $p, g$, wie beide Ziele erreichbar sind. Für diesen Nachweis zählen auch fachübergreifende und atomar aufgelöste Voraussetzungen. Eine enge persönliche Fokuswahl, ein direkter Prüfungsversuch oder eine erwartete Anerkennung würden die Aussage über den für alle vorgesehenen Erwerbsweg verändern.

Zur Diagnose dienen die benötigten Atome, also der atomare Bedarf aus @eqref{eq:demand} bezüglich der Planrelation:

:::equation {#eq:reqatoms}
\ReqAtoms_\pi(g) = \{b \in A \mid (g, b) \in (\Rat^{\pi})^+\}.
:::

Aus einem Abschlusszeugen folgt notwendig

:::equation {#eq:level-closure}
\forall g \in T_\pi : \quad \ReqAtoms_\pi(g) \subseteq B_\pi \cup S_{\le \ell_\pi(g)}.
:::

Jedes benötigte Atom liegt also in der Eintrittsbasis oder wird spätestens in derselben Planungsstufe erworben. Eine benötigte Kompetenz außerhalb $B_\pi \cup T_\pi$ ist ungeplant; ein benötigtes Ziel mit höherer Planungsstufe ist ein Reihenfolgefehler. Voraussetzungen innerhalb derselben Planungsstufe sind erlaubt. Die Grundgraphgültigkeit einschließlich atomar expandierter Zyklen muss vor dieser Mengenprüfung bereits festgestellt sein. Der explizite Zeuge verbindet die Zuordnung mit einem tatsächlich möglichen Erwerbsweg.

Ein endlicher Prüfalgorithmus startet für jede Planungsstufe mit dem hypothetischen Stand $W^{(0)} = B_\pi \cup S_{<i}$ und wiederholt

$$
W^{(r+1)} = W^{(r)} \cup \bigl(S_i \cap \Frontier_\pi(W^{(r)})\bigr).
$$

Er ist erfolgreich genau dann, wenn sein Fixpunkt ganz $S_i$ enthält. Die Verfügbarkeit eines noch offenen Ziels kann durch zusätzliche Erfüllungen nicht verschlechtert werden. Deshalb kann jede gleichzeitig hinzugefügte Menge auch nacheinander erworben werden. Ein vorhandener Abschlusszeuge kann umgekehrt nicht vorzeitig an diesem Verfahren scheitern. Das Verfahren ist ein *hypothetischer* Lerndurchlauf; es ändert keine persönlichen Daten. Im rein atomaren DAG liefert eine voraussetzungsgetreue topologische Ordnung den bekannten Spezialfall.

Während ein datierter Referenzplan diese Machbarkeit relativ zu einer deklarierten Eintrittsbasis $B_\pi$ prüft, gehören ausdrücklich erklärte **Planeinheiten** eines Landesplans bereits zum verbindlichen Ordnungsmodell aus Abschnitt~@ref{sec:unit-progression}: Auf dem geschlossenen persönlichen Lernumfang $L=\Closure(S)$ ist jeder Voraussetzungsrückgriff in eine spätere Planeinheit ein unmittelbarer Verstoß gegen E2/E3 (`GD-P05`), den keine angenommene Eintrittsbasis $B_\pi$ verdecken darf. Die Durchsetzung folgt dem Vierschritt aus Diagnosebericht, fachlicher Ursachenbehebung, Sperrklinke und hartem Null-Rückgriff-Gate; der bestehende Stufenplanbericht aktiviert noch keinen echten Landesplan und ersetzt weder Quellen- noch Inhaltsprüfung.

### Aufwand, Reserve und Budget {#sec:workload-budget anchors="123-workload-feasibility"}

Auch eine fachlich mögliche Reihenfolge kann mehr Unterrichtszeit beanspruchen, als im Schuljahr verfügbar ist. Jede Zeitbehauptung nennt Referenzlernende, Eintrittsbedingungen, Ziel- und Wahlauswahl, Kalender, Schätzmethode und Unsicherheit. Diese deklarierten Schätzannahmen des Plans $\pi$ fassen wir als $\Theta_\pi$ zusammen. Für eine tatsächliche Aktivität $h$ bezeichnet $\widehat t_h(\Theta_\pi) \ge 0$ ihre unter diesen Annahmen geschätzte Dauer. Alle Größen müssen in derselben kalibrierten Zeiteinheit vorliegen:

:::equation {#eq:budget}
\Work_\pi(i; \Theta_\pi) + \Reserve_\pi(i) \le \Budget_\pi(i), \qquad i = 1, \ldots, n_\pi.
:::

Dabei sind $\Work \ge 0$, $\Reserve \ge 0$ und $\Budget > 0$. Reserve ist geschützt und wird nicht gleichzeitig als verplanbare Zeit ausgegeben. Ein Nullpuffer ist möglich, aber offenzulegen. Bereits im Arbeitsaufwand enthaltene Prüfungsvorbereitung oder Wiederholung darf nicht ein zweites Mal als Reservebedarf gezählt werden.

Ein erklärtes Aktivitätenmodell kann $\Work_\pi(i; \Theta_\pi) = \sum_{h \in \mathcal H_i} \widehat t_h(\Theta_\pi)$ verwenden. $\mathcal H_i$ enthält jeden tatsächlichen Aufwand genau einmal: Ersterwerb, gezielte Übung, Abruf, Prüfung und weitere geplante Arbeit. Dasselbe kanonische Atom wird nicht in Mathematik und Physik zweimal als Ersterwerb gezählt; eine zusätzliche Anwendung in Physik kann dennoch eigenständige Zeit kosten. Unkalibrierte „Zielpunkte“ oder `weight`-Werte sind keine Minutenschätzung. Tabelle~@ref{tab:workload} veranschaulicht die getrennte Verbuchung von Arbeit und Reserve.

:::table {#tab:workload caption="Rechenbeispiel: $\Work = 60$ und $\Reserve = 10$ passen in $\Budget = 75$. Die erfundenen Zahlen demonstrieren nur die Rechnung, keine empirisch abgesicherte Dauer eines SkillPilot-Curriculums." cols="42mm,22mm,X"}
| Illustrative Planung | Stunden | Bedeutung |
| --- | --- | --- |
| Ersterwerb | 42 | Bereits um gemeinsame Ziele bereinigt |
| Übung und Anwendung | 12 | Zusätzliche Tätigkeiten |
| Prüfung und Wiederholung | 6 | Im Arbeitsaufwand enthalten |
| Geschützte Reserve | 10 | Nicht für obige Arbeit verplant |
| Verfügbare Zeit | 75 | Nach Kalenderausschlüssen |
:::

Ein Gesamtbudget genügt nicht, wenn Fächer, Räume oder Termine eigene bindende Grenzen haben. Für eine zusätzlich deklarierte Fächerzuordnung müssen auch die jeweiligen $\Work_{i,s} + \Reserve_{i,s} \le \Budget_{i,s}$ gelten, ohne Doppelzählung gemeinsam zugeordneter Zeit. Ein Kalenderplan muss außerdem Voraussetzungen vor der konkreten Anwendung bereitstellen.

### Gültigkeitsanspruch und Abschlussgrenzen {#sec:plan-boundaries anchors="124-validity-and-progression-boundaries"}

Ein Zeit- und Erwerbsplan ist unter diesem optionalen Profil gültig, wenn er sowohl strukturell als auch unter seinen erklärten Annahmen zeitlich machbar ist. Ohne belastbare Aufwandsschätzung ist allein die strukturelle Aussage zulässig. Der Anspruch bindet Plan, Curriculumfassung, aufgelösten Umfang und Schätzannahmen. Er garantiert keine identische Lerngeschwindigkeit für jede Person.

Ein hypothetischer Abschlusszeuge zeigt die strukturelle Machbarkeit des Plans. Der Abschluss der Einheit richtet sich nach dem geltenden Vertrag in Abschnitt~@ref{sec:unit-completion}. Die gesonderte Prüfung der Pflichtbelege einer Einheitenfassung ist ein Vorschlag in Abschnitt~@ref{sec:proposal-unit-completion}.

Ein kalendarischer Abschnitt $S_i$ kann mehrere fachliche Einheiten umfassen oder eine Einheit zeitlich schneiden. Für erklärte Planeinheiten eines Landesplans gelten E1 bis E4. Beim Zuschnitt fachlicher Blatteinheiten nach `F8` ist zu prüfen, dass sie in jedem der 16 Landespläne jeweils ungeteilt Platz finden. Für die drei bestehenden 1.2-Einheiten steht dieser Nachweis noch aus. Eine Jahresgrenze begründet keine pauschale Voraussetzung an den Stoff des Vorjahres.

:::sources
[Lerneinheiten](repo:docs/concept/skill-graph/learning-units.md); [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md); [Zeitachse und Kapazität](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md).
:::
