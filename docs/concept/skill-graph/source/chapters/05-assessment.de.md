## Implizite Beherrschung durch gültige lokale Prüfungen {#sec:assessment}

:::principle {title="Verbindliche Konzeptkorrektur vom 4. November 2026"}
Ein ausdrücklicher Erfolg an einem Inhaltsziel belegt Verstehen. Eine gültige Abschlussprüfung kann selbstständige Anwendung der zugehörigen Kompetenzen belegen. Diese implizite Beherrschung ist global ebenso wirksam: Sie erfüllt künftige Voraussetzungen und zählt zum IST. Prüfungs- und Memorierziele selbst bleiben ausschließlich ausdrücklich zu bestehen.
:::

Die Grundidee zeigt eine Lerneinheit mit der Kette $\nd{Q} \to \nd{B} \to \nd{A}$: Das Prüfungsziel $\nd{Q}$ setzt das Inhaltsziel $\nd{B}$ voraus, und $\nd{B}$ setzt $\nd{A}$ voraus. Solange $\nd{Q}$ offen ist, fragt die Prüfung ihre Voraussetzungen $\nd{B}$ und $\nd{A}$ noch nach. Hat die Person $\nd{Q}$ bestanden und ist der lokale Vertrag der Einheit gültig, dann gelten $\nd{B}$ und $\nd{A}$ als selbstständig angewandt und damit als implizit beherrscht, auch ohne eigenes ausdrückliches Ergebnis. Die folgenden Unterabschnitte machen daraus eine Mengenformel und nennen die fachlichen Bedingungen, unter denen sie ausgewertet werden darf.

Der gespeicherte binäre Zustand $m$ bleibt unverändert das einzige Zielergebnis. Die neue Semantik leitet zusätzliche Erfüllung ab, ohne Rückwärtsschreiben von Mastery, zusätzliche Qualifikationsdatensätze, manuelle Freistellungsprofile oder zweite Teilprüfungen einzuführen. Auf der geprüften Hauptlinie ist dieses Konzept **noch nicht implementiert**. Maßgeblich ist die [aktuelle Konzeptspezifikation](repo:docs/concept/skill-graph/assessment-gated-completion.md).

### Vertrag, Zielumfang und geschützte Zieltypen {#sec:local-contract}

#### Lokaler Vertrag.

Ein *lokaler Vertrag* gehört zu einer autoritativen Lerneinheit $U$ aus Abschnitt~@ref{sec:learning-units}. Er bindet deren eigene Erwerbsziele $\Own(U)$, die kanonischen Identitäten, die Curriculumrevision und die fachlich geprüfte Bedeutung der eigenen Prüfungen. Andere Quellen nennen ihn auch Anerkennungs- oder Erwerbsvertrag. Der Gesamtumfang $T(U)$ enthält zusätzlich die Ziele der Kindeinheiten. Er ist *kein* vergrößerter Ersatzvertrag der Elterneinheit für die Anerkennung. Ein späterer Integrationsanspruch erweitert die Kindverträge nicht rückwirkend. Eine Anzeige, ein temporärer Fokus oder die aktuell ausgewählten Planwurzeln bestimmen diese Zuordnung nicht neu.

#### Geschützte Ziele.

Seien $Q \subseteq A$ die autoritativ bestimmten Prüfungsziele und $A_{\mathrm{mem}} \subseteq A$ die Memorierziele; $K = G \setminus A$ bleibt die Menge der strukturellen Cluster. Für die eigenen geschützten Ziele gelten

$$
Q_U = \Own(U) \cap Q, \qquad A_{\mathrm{mem},U} = \Own(U) \cap A_{\mathrm{mem}}, \qquad P_U = Q_U \cup A_{\mathrm{mem},U}.
$$

$P_U$ schützt *alle* eigenen Prüfungs- und Memorierziele vor implizitem Bestehen. Ein Erfolg an einer anderen Prüfung ersetzt weder deren eigene Prüfung noch den verifizierten Abruf ihrer Karten. Orientierung bleibt ein eigener motivationaler Zieltyp, keine dritte Schutzklasse. Ein Orientierungsmarker darf in $I_U$ liegen; er ist dann abgeleitet erledigter Einstieg, kein fachlicher Kompetenznachweis und keine Behauptung einer tatsächlich geführten Motivationsinteraktion. Unterstützung außerhalb $T(U)$ vergrößert den Gesamtabschlussnenner nicht. Eine Kompetenz außerhalb $\Own(U)$ wird in diesem eigenen Vertrag nicht implizit anerkannt; für Ziele der Kinder gelten deren eigene Verträge. Die übrigen eigenen Ziele, also Inhaltsziele und gegebenenfalls Orientierungsziele, heißen im Folgenden *nicht geschützt*.

#### Verwendete Relation.

Die folgenden Formeln verwenden die vollständig atomar expandierte und vererbte Voraussetzungsrelation $\Rat$ aus Abschnitt~@ref{sec:effective}. Sie umfasst auch versteckte und fachübergreifende Unterstützung. Alle Referenzen müssen auflösbar und die normalisierte Relation muss azyklisch sein. Die Prüfung der gesamten Voraussetzungshülle geschieht vor einer bloßen Anzeigeeinschränkung.

### Transitive offene Nachfrage und implizite Menge {#sec:transitive-demand}

Für eine Menge $X \subseteq A$ bezeichne $\operatorname{Reach}_{\Rat}^{*}(X)$ die Menge $X$ selbst zusammen mit allem, was ihre Elemente direkt oder transitiv voraussetzen:

$$
\operatorname{Reach}_{\Rat}^{*}(X) = X \cup \{b \in A \mid \exists a \in X : (a, b) \in \Rat^+\}.
$$

Mit der globalen ausdrücklichen Mastery-Menge $M = \{a \mid m(a) = 1\}$ sei

:::equation {#eq:needed}
N_U = \operatorname{Reach}_{\Rat}^{*}(P_U \setminus M),
:::

:::equation {#eq:implicit}
I_U = \Own(U) \setminus (M \cup P_U \cup N_U).
:::

$N_U$ ist die *offene Nachfrage*: die noch offenen geschützten Ziele von $U$ samt ihrem atomaren Bedarf. $I_U$ ist die *implizite Menge*. Ein eigenes Ziel gehört genau dann zu $I_U$, wenn es

1. nicht schon ausdrücklich gemeistert ist,
2. nicht geschützt ist und
3. von keinem offenen geschützten Ziel der Einheit mehr benötigt wird.

Die reflexive Erreichbarkeit enthält die offenen Wurzeln selbst und *alle* ihre transitiven Voraussetzungen. Die Traversierung stoppt **nicht** an einem gemeisterten Zwischenziel oder an der Grenze von $\Own(U)$. Dadurch bleibt $I_U$ unverändert, wenn eine redundante Kante hinzugefügt oder für die vorgeschriebene transitive Minimalität wieder entfernt wird. Es gilt stets $I_U \cap M = \varnothing$ und $I_U \cap P_U = \varnothing$.

Abbildung~@ref{fig:waivers} rechnet beide Fälle der Kette $\nd{Q} \to \nd{B} \to \nd{A}$ mit $\Own(U) = \{\nd{Q}, \nd{B}, \nd{A}\}$ und $P_U = \{\nd{Q}\}$ durch. In Fall~A ist nur $\nd{B}$ ausdrücklich gemeistert. Die offene Prüfung $\nd{Q}$ fragt weiterhin $\nd{B}$ und $\nd{A}$ nach: $N_U = \{\nd{Q}, \nd{B}, \nd{A}\}$ und $I_U = \varnothing$. In Fall~B ist $\nd{Q}$ bestanden. Es gibt kein offenes geschütztes Ziel mehr: $N_U = \varnothing$ und $I_U = \{\nd{A}, \nd{B}\}$.

::figure{id="fig:waivers"}

#### Aufwand.

Seien $V_U^{\mathrm{reach}} = \operatorname{Reach}_{\Rat}^{*}(P_U \setminus M)$ die erreichbaren atomaren Knoten und $E_U^{\mathrm{reach}} = \{(a, b) \in \Rat \mid a \in V_U^{\mathrm{reach}}\}$ deren ausgehende Voraussetzungskanten. Ein direkter Algorithmus besucht jeden solchen Knoten und jede solche Kante höchstens einmal. Einschließlich der Verarbeitung von $\Own(U)$ für die gesamte Menge $I_U$ benötigt er $O(|\Own(U)| + |V_U^{\mathrm{reach}}| + |E_U^{\mathrm{reach}}|)$ Schritte, global höchstens $O(|A| + |\Rat|)$. Eine explizite quadratische Speicherung der transitiven Hülle ist dafür nicht nötig.

### Warum der Skill-Graph allein noch keinen Anwendungsnachweis liefert {#sec:why-graph-not-enough}

Die Mengenformel darf nur für einen gültigen fachlichen Vertrag ausgewertet werden. Gültig ist er nur, wenn eine Strukturbedingung und eine Inhaltsbedingung erfüllt sind.

#### Strukturbedingung.

Jedes Inhaltsziel in $\Own(U)$ braucht einen lokalen Pfad zu mindestens einer lokalen Abschlussprüfung aus $Q_U$: Eine eigene Prüfung der Einheit muss es direkt oder transitiv voraussetzen. Ein Pfad allein zu einem Memorierziel genügt nicht: Verifizierter Abruf beweist noch keine selbstständige Anwendung. Ein bloß isoliertes Endziel ohne lokalen Prüfungspfad ist ein Vertragsfehler, kein automatisch beherrschtes Ziel. Das Fehlen eines späteren Verbrauchers ist allein kein Nachweis einer Kompetenz. Eine zusätzliche, frei wählbare Maske für „anerkennungsfähige“ Teilziele existiert nicht: Die Formel gilt für den vollständigen gültigen eigenen Vertrag.

#### Inhaltsbedingung.

Für Inhaltsziele müssen die realen Aufgaben und Bewertungsraster jede beanspruchte höhere Anwendung tatsächlich tragen. Diese Anforderung macht einen Orientierungsmarker nicht nachträglich zu einer prüfbaren Fachkompetenz. Wesentliche Kompetenzen dürfen nicht vollständig fehlen und durch Punkte aus anderen Aufgabenteilen kompensiert werden. Der lokale `requires`-Pfad, Titel, `coveredGoalIds`, eine Bestehenspunktzahl oder die formale DAG-Gültigkeit beweisen das nicht. Ein unabhängiges fachliches Review prüft Aufgaben, Lösungen, Bewertungsraster und die behauptete Anwendungsabdeckung zusammen. Zu prüfen ist jede Bestehenskombination, die ein Ziel nach der Mengenformel freigibt; die vereinigten Inhalte aller Prüfungen allein genügen dafür nicht.

#### Kein zweiter Status.

Der reguläre Prüfungserfolg bleibt derselbe binäre Erfolg der gesamten Prüfung. Die strengere Anwendungsbedeutung liegt im vorab geprüften Inhalt des lokalen Vertrags, nicht in einem zusätzlichen pro Person zu speichernden Qualifikationsstatus oder einer zweiten Folgeprüfung. Eine historische Prüfung ohne dieses Review erhält die stärkere Bedeutung nicht nachträglich allein durch ein neues Diagramm oder eine Softwareänderung.

### Globale Wirkung und dauerhafte Vertragsbindung {#sec:global-effect}

Die Menge $\mathcal U_{\mathrm{valid}}$ umfasst die für diese Person an ihre jeweilige Revision gebundenen, dauerhaft anwendbaren autoritativen lokalen Verträge, nicht beliebige besuchte Ansichten oder sämtliche neuesten Inhaltsfassungen. Es gilt

$$
\Meff = M \cup \bigcup_{U \in \mathcal U_{\mathrm{valid}}} I_U.
$$

Die Vereinigung umfasst nicht nur die gerade angezeigten Lerneinheiten oder den aktuellen Plan im Personal Curriculum. Vertrag, Revision und Nachweisbedeutung müssen nach einem Auswahlwechsel weiter verfügbar sein. Die Ableitung wird immer aus den ausdrücklichen Ergebnissen und ihren gültigen Verträgen berechnet; frühere implizite Mengen werden nicht als neue Mastery-Eingaben zurückgespeist.

Eine spätere Lerneinheit $\nd{U2}$ mit einer weiteren Prüfung $\nd{q_2}$ darf eine bereits aus $\nd{U1}$ belegte Anwendung $\nd{a}$ nicht wieder öffnen (Abbildung~@ref{fig:local-recognition}). Vielmehr erfüllt $\nd{a}$ die Voraussetzung von $\nd{q_2}$. Bei festem Vertragsbestand kann zusätzliche ausdrückliche Mastery $\Meff$ nur vergrößern: Die Menge offener geschützter Wurzeln wird kleiner, ihre transitive Nachfrage nimmt ab. Ein aus $I_U$ herausfallendes neu ausdrücklich bestandenes Ziel bleibt über $M$ enthalten.

::figure{id="fig:local-recognition"}

Eine stabile Prüfungsziel-ID braucht eine stabile Anerkennungsbedeutung. Wechselnde Aufgabenvarianten müssen denselben qualifizierten Vertrag erfüllen. Neue fachliche Anerkennungsansprüche dürfen alte Prüfungs-Mastery nicht stillschweigend aufwerten. Sie brauchen eine neue Prüfungsidentität oder eine ausdrücklich geprüfte Migration der vorhandenen Bedeutung. Dafür wird kein zusätzlicher Qualifikationsdatensatz pro Lernendem eingeführt. Ist die historische Nachweisbedeutung ungeklärt, bleibt der ausdrückliche Erfolg erhalten; die zusätzliche höhere Anwendung wird nicht erfunden. Berechtigte Ergebnis- oder Inhaltskorrekturen sind von einem bloßen späteren Verbraucher- oder Planwechsel zu unterscheiden.

### Geschützte Ziele und vollständiger Abschluss {#sec:protected-completion}

#### Anerkennung ist noch kein Abschluss.

Der ganze Abschluss folgt rekursiv aus Gleichung~@eqref{eq:unit-complete}: Alle eigenen Ziele müssen erfüllt und alle Pflichtkinder abgeschlossen sein. Bei festem globalem $\Meff$ ist dies gleichbedeutend mit $T(U) \subseteq \Meff$, sofern sämtliche Kinderpflichten als Zielpflichten in diesem Umfang enthalten sind. Bei vollständigem Abschluss gilt für die eigenen geschützten Ziele $P_U \subseteq M$.

Sind alle eigenen Prüfungen und Karten bestanden, ist $N_U = \varnothing$; ein gültiger eigener lokaler Vertrag kann damit seine nicht geschützten Ziele vervollständigen. Der Abschluss der Kinder folgt daraus **nicht**. Eine eigene Syntheseprüfung der Elterneinheit kann offen bleiben, während Inhaltsziele der Kinder bereits global anerkannt sind. Umgekehrt ersetzt ihr Bestehen keine offene Prüfungs- oder Memorierpflicht eines Kindes.

#### Offene geschützte Ziele im selben Vertrag.

Ein offenes eigenes Memorierziel verhindert den ganzen Einheitsabschluss, blockiert aber nicht die Ableitung eines anderen Inhaltsziels, solange es dieses nicht transitiv benötigt (Abbildung~@ref{fig:protected}). Benötigt ein offenes Memorierziel dagegen ein Inhaltsziel direkt oder transitiv, bleibt dieses Ziel in der offenen Nachfrage. Auch mehrere Prüfungen mit gemeinsamer Grundlage müssen in diesem lokalen Vertrag sämtlich bestanden sein, bevor die Grundlage aus der offenen Nachfrage herausfällt.

::figure{id="fig:protected"}

Dies unterscheidet Prüfungen im *selben* Vertrag von einer späteren Prüfung in einer anderen Lerneinheit (Abbildung~@ref{fig:local-recognition}). Abbildung~@ref{fig:shared-assessments} zeigt zwei aufeinanderfolgende Ergebnisse bei unverändertem lokalem Umfang und ohne weitere Abschlusspflichten.

::figure{id="fig:shared-assessments"}

Der Vergleich mit Abbildung~@ref{fig:local-recognition} setzt bereits fachlich begründete und unabhängig gültige lokale Verträge voraus: Eine später offene Prüfung eines anderen Vertrags nimmt eine dort schon belegte Anerkennung nicht zurück. Im selben Vertrag zählt dagegen die gesamte noch offene Nachfrage. Daraus folgt keine Anweisung, Prüfungen oder Lerneinheiten für einen gewünschten Recheneffekt aufzuteilen oder neu anzuordnen.

#### Zugang zu Prüfungen.

Der bisherige direkte Prüfungszugang bleibt der Ausgangspunkt des aktuellen Lernablaufs. Aufgabenverfügbarkeit, Authentifizierung, Sitzungszuordnung und ausdrückliche Auswahl bleiben erforderlich. Die Entscheidung über harte Einheitssperren und direkte Prüfungsversuche unter einem solchen optionalen Profil steht noch aus (Abschnitt~@ref{sec:learning-units}). Die rekursive Einheitendefinition führt weder einen neuen Ausschluss noch einen verdeckten Umgehungsweg ein. Der normale Lernzugang verwendet $\Meff$ und die transitive effektive Relation; die eigenständige Fokusregel mit Normalmodus und striktem Modus bleibt erhalten.

### Gesamt-IST und datierte Periodenereignisse {#sec:period-accounting}

Für eine fest benannte Plan-Zielmenge $T_{\mathrm{Plan}}$ zählt der Gesamt-IST die effektiv beherrschten Ziele des Plans:

$$
H_{\mathrm{gesamt}} = |T_{\mathrm{Plan}} \cap \Meff|.
$$

Die Vereinigung vor dem Schnitt verhindert Doppelzählung von expliziten und impliziten Beiträgen sowie überlappenden Verträgen. Eine gesonderte Ansicht nur ausdrücklicher Ergebnisse muss ihren abweichenden Zähler ausweisen.

Eine laufende Periode zählt dagegen ausschließlich tatsächlich datierte explizite Abschlussereignisse nach ihrem Ereignisvertrag. Eine neu abgeleitete Anwendung, mitgebrachte Vorarbeit oder nachträglich erweiterte Plananzeige ist kein zusätzlicher tatsächlicher Abschluss in dieser Periode (Abbildung~@ref{fig:period}).

::figure{id="fig:period"}

Der [gemeinsame Lernplanstatusvertrag](repo:docs/concept/didactic/unified-learning-plan-status.md) beschreibt die Oberflächen. Statische Vertragsdaten können nach Revision zwischengespeichert werden; abgeleitete Ergebnisse sind keine zweite gespeicherte Wahrheit. Ungültige oder ungeklärte Verträge bleiben als Einschränkung erkennbar. Maschinenprüfungen der Formeln ersetzen weder unabhängiges Inhaltsreview noch menschliche Erprobung oder Lernwirksamkeit.

:::sources
[Anerkennung und globaler Abschluss](repo:docs/concept/skill-graph/assessment-gated-completion.md); [Produktentscheidung vom 4. November 2026](repo:docs/concept/skill-graph/completion-semantics-clarification-2026-11-04.md); [Lernplanstatus](repo:docs/concept/didactic/unified-learning-plan-status.md).
:::
