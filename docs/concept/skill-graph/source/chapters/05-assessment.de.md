## Implizite Beherrschung durch gültige lokale Prüfungen {#sec:assessment}

:::principle {title="Verbindliche Konzeptkorrektur vom 4. November 2026"}
Ein ausdrücklicher Erfolg an einem Inhaltsziel belegt Verstehen. Eine gültige Abschlussprüfung kann selbstständige Anwendung der zugehörigen Kompetenzen belegen. Diese implizite Beherrschung ist global ebenso wirksam: Sie erfüllt künftige Voraussetzungen und zählt zum IST. Prüfungs- und Memorierziele selbst bleiben ausschließlich ausdrücklich zu bestehen.
:::

Ob ein Ziel anerkannt werden kann, hängt davon ab, welche Prüfungen und Memorierziele seiner eigenen Einheit noch offen sind. Die Regel vom 11. November 2026 gilt nur für fachlich geprüfte Verträge (Abschnitt~@ref{sec:why-graph-not-enough}). Ein ausdrücklich bestätigtes Ergebnis bleibt jederzeit möglich. Die [Konzeptspezifikation](repo:docs/concept/skill-graph/assessment-gated-completion.md) beschreibt die globale Ableitung. Der gespeicherte binäre Wert $m$ bleibt das einzige Ergebnis je Ziel. Den Stand der Durchsetzung nennt Abschnitt~@ref{sec:why-graph-not-enough}.

### Vertrag, Zielumfang und geschützte Zieltypen {#sec:local-contract}

#### Lokaler Vertrag.

Ein *lokaler Anerkennungsvertrag* oder *Erwerbsvertrag* gehört zu einer Einheit mit eigenen Prüfungen $U$ (Abschnitt~@ref{sec:learning-units}). Er bindet die kanonischen IDs ihrer eigenen Ziele $\Own(U)$, die Curriculumrevision und die fachlich geprüfte Bedeutung ihrer eigenen Prüfungen. Die Einheit benennt deren Abdeckung in gültigen, vollständigen `coverageReviews` (Abschnitt~@ref{sec:unit-representation}). Zusätzlich gelten R1 bis R5. Fehlende oder ungültige Reviews verletzen den Vertrag einer als geprüft erklärten Einheit. Stufen, Jahrgänge, Kurshalbjahre und andere Einheiten ohne eigenen Prüfungsvertrag ordnen Ziele. Auch mit freien Übungsaufgaben oder Abiturklausuren begründen sie keine Anerkennung.

Zum Gesamtumfang $T(U)$ gehören auch die Ziele der Kinder. Für deren Anerkennung gelten die eigenen Verträge der Kinder. Eine spätere Syntheseprüfung, ein Ansichts- oder Fokuswechsel und die Wahl anderer Planwurzeln ändern die Zuständigkeit nicht. Unterstützung außerhalb $T(U)$ zählt beim Gesamtabschluss der Einheit nicht mit.

#### Geschützte Ziele.

Seien $Q \subseteq A$ die autoritativ bestimmten Prüfungsziele und $A_{\mathrm{mem}} \subseteq A$ die Memorierziele; $K = G \setminus A$ bleibt die Menge der strukturellen Cluster. Im Zielmodell zeigt keine Voraussetzungskante auf ein Prüfungsziel aus $Q$: Prüfungen sind Endpunkte in Lernrichtung und niemals Voraussetzungen späterer Fachziele; in der umgekehrten Pfeilrichtung von $R$ gilt also $R \cap (G \times Q)=\varnothing$. Für die eigenen geschützten Ziele gelten

$$
Q_U = \Own(U) \cap Q, \qquad A_{\mathrm{mem},U} = \Own(U) \cap A_{\mathrm{mem}}, \qquad P_U = Q_U \cup A_{\mathrm{mem},U}.
$$

Prüfungsziele erfordern eine eigene bestandene Prüfung, Memorierziele den verifizierten Abruf ihrer Karten. Zu den *nicht geschützten* eigenen Zielen gehören Inhalts- und Orientierungsziele. Auch experimentelle Inhaltsziele unterliegen R1 und R2. Die abgeleitete Erfüllung einer Orientierung bedeutet lediglich, dass der Einstieg erledigt ist (Abschnitt~@ref{sec:orientation}).

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

Abbildung~@ref{fig:waivers} zeigt die drei Ziele $S=\{\nd{Q},\nd{B},\nd{A}\}$. Der Einstieg ist bereits erledigt und liegt außerhalb des Bildausschnitts. Die Prüfung $\nd{Q}$ verlangt $\nd{B}$, dieses verlangt $\nd{A}$. Ist von den drei Zielen nur $\nd{B}$ ausdrücklich gemeistert, bleibt $N_U\cap S=S$. Beide Inhalte liegen weiter auf dem offenen Prüfungspfad. Ist von den drei Zielen nur $\nd{Q}$ bestanden, entfällt diese Nachfrage. Der gültige Vertrag erkennt $\nd{B}$ und $\nd{A}$ an.

::figure{id="fig:waivers"}

**Was gilt für die Motivation der Einheit?** In Abbildung~@ref{fig:orientation-outcome} brauchen die eigene Prüfung $\nd{q}$ und das eigene Lernkartenziel $\nd{k}$ das Inhaltsziel $\nd{a}$. Dieses braucht den Einstieg $\nd{m}$. Wer direkt die Prüfung besteht, hat ein Ergebnis für $\nd{q}$. Solange $\nd{k}$ offen ist, bleiben $\nd{a}$ und $\nd{m}$ in seiner Nachfrage. Besteht die Person auch den Kartenabruf, gilt $\nd{a}$ im gültigen Vertrag als selbstständig angewandt. Der Einstieg $\nd{m}$ gilt als erledigt, auch wenn kein Gespräch stattgefunden hat. Dafür wird kein Ergebnis an $\nd{m}$ geschrieben. Hat die Person den Einstieg selbst erlebt und mit „weiter“ beendet, liegt ein ausdrückliches Ergebnis für $\nd{m}$ vor, auch bei offenen Prüfungs- oder Kartenzielen.

::figure{id="fig:orientation-outcome"}

#### Aufwand.

Seien $V_U^{\mathrm{reach}} = \operatorname{Reach}_{\Rat}^{*}(P_U \setminus M)$ die erreichbaren atomaren Knoten und $E_U^{\mathrm{reach}} = \{(a, b) \in \Rat \mid a \in V_U^{\mathrm{reach}}\}$ deren ausgehende Voraussetzungskanten. Ein direkter Algorithmus besucht jeden solchen Knoten und jede solche Kante höchstens einmal. Einschließlich der Verarbeitung von $\Own(U)$ für die gesamte Menge $I_U$ benötigt er $O(|\Own(U)| + |V_U^{\mathrm{reach}}| + |E_U^{\mathrm{reach}}|)$ Schritte, global höchstens $O(|A| + |\Rat|)$. Eine explizite quadratische Speicherung der transitiven Hülle ist dafür nicht nötig.

### Warum der Skill-Graph allein noch keinen Anwendungsnachweis liefert {#sec:why-graph-not-enough}

Tabelle~@ref{tab:unit-validity} nennt die fünf Bedingungen für einen fachlich gültigen Vertrag und seine Anwendung.

:::table {#tab:unit-validity caption="Bedingungen des lokalen Anerkennungsvertrags und ihre Zielvorgaben (Entscheidung vom 11. November 2026)." cols="12mm,X,52mm"}
| Regel | Anforderung | Verortung |
| --- | --- | --- |
| R1 | Jedes eigene gewöhnliche Inhaltsziel liegt auf einem Voraussetzungspfad von mindestens einer eigenen Prüfung der Einheit, direkt oder transitiv; ein Pfad, der nur zu einem Memorierziel führt, zählt nicht. | Gültigkeitsbedingung der Einheitendefinition, in derselben Klasse wie Azyklizität: hart ab der ersten verfassten Einheit; eine verletzende Einheit wird nicht in die Hauptlinie übernommen. |
| R2 | Für jedes eigene Inhaltsziel belegt ein Review, dass die Aufgaben und das Bewertungsraster mindestens einer eigenen Prüfung seine selbstständige Anwendung verlangen. Diese Prüfung setzt das Ziel voraus. | Prüfungsfreigabe und Deckungsmetadaten bei `M5`, aktuelle zielgenaue Bindung bei `M7`. |
| R3 | Eine Prüfung beansprucht Deckung nur für Ziele, die sie direkt oder transitiv voraussetzt: $\operatorname{Cov}(q)\subseteq\{b\in A\mid(q,b)\in\Rat^+\}$. | Wie R1. |
| R4 / E1 | In der aufgelösten Gliederung ist die kleinste Einheit eines Ziels eindeutig; eigene Ziele und Kindeinheiten werden aus den erklärten Clustern abgeleitet. Für Inhaltsanerkennung ist die kleinste zuständige fachliche Einheit mit Prüfungen maßgeblich. | E1 ist der Strukturvertrag; die vollständige Endausbaustufe weist jedes Inhaltsziel einer Einheit mit Prüfungen zu. |
| R5 | Ein späterer Neuzuschnitt von Einheiten oder spätere Kanten verleihen vorhandenen Ergebnissen nie zusätzliche Anerkennung; der Vertrag ist versioniert. | Laufzeitvertrag; Vorbedingung, bevor implizite Anerkennung produktiv eingeschaltet wird. |
:::

R4 wird im Zielmodell zur Baumregel E1 (Abschnitt~@ref{sec:unit-progression}). Für die drei bestehenden Einheiten beschreibt der bisherige Vertrag 1.2 noch ausdrückliche `own`-Platzierungen. Ihre Umstellung ist in F8 bis F11 vorgesehen.

#### Strukturbedingungen (R1, R3, R4).

Die Formel wirkt auf alle eigenen Ziele des gültigen Vertrags, ohne zusätzliche Auswahlmaske. Jedes eigene Inhaltsziel braucht einen geprüften Anwendungsnachweis. Ein Ziel ohne nachfolgende Prüfung und ein Ziel, das allein eine Kartenabfrage vorbereitet, verletzen R1. Solche Ziele können weiterhin ausdrücklich gemeistert werden.

$\operatorname{Cov}(q)$ umfasst die Inhaltsziele, deren selbstständige Anwendung die Prüfung $q$ nachweislich verlangt. Wegen R3 bleibt jedes eigene Ziel daraus bei offener Prüfung in $N_U$. Ein fehlender Pfad verlangt eine fachliche Klärung. Ein vorhandener indirekter Pfad genügt.

#### Inhaltsbedingung (R2).

Das unabhängige fachliche Review prüft Aufgabe, Lösung, Bewertungsraster und beanspruchte Deckung zusammen. Lässt sich eine Prüfung allein mit Punkten für andere Leistungen bestehen, belegt sie die ausgelassene Kompetenz nicht. Das Review muss jede Kombination bestandener Prüfungen betrachten, die ein Ziel nach der Mengenformel freigibt. Ein Titel, der Eintrag in `coveredGoalIds`, ein `requires`-Pfad oder eine formal gültige Punkteverteilung allein liefern diesen Nachweis nicht.

Das Motivationsziel kann auf demselben Voraussetzungspfad liegen. Es beschreibt einen Einstieg in das Thema. Die Prüfung erhält dafür keinen fachlichen Deckungseintrag. Bei einem Inhaltsziel dagegen verletzt fehlende Prüfungsdeckung den Vertrag. Erst mit gültigen R1 bis R4 hat der reguläre binäre Prüfungserfolg die festgelegte Aussagekraft. Ein späterer Softwarestand oder eine andere Grafik erweitern den Wert historischer Prüfungen nicht. Den Umgang mit späteren Änderungen regelt R5 (Abschnitt~@ref{sec:global-effect}).

#### Aktueller Stand der Durchsetzung.

Für die kanonischen Gymnasialfächer prüft die Pflicht-Curriculum-CI die deklarierten Einheiten mit [validateLearningUnits.ts](repo:app/scripts/validateLearningUnits.ts) (`validate:learning-units`). Der Validator liest Zieltypen, Voraussetzungen und `coveredGoalIds`. Fehler bei R1, R3, eindeutiger Zuständigkeit (R4), Deklaration, eigenen Zielen, Gesamtumfang oder Hierarchie lassen die Prüfung fehlschlagen. Die vollständige Zuordnung aller Erwerbsziele wird nur bei `learningUnitCoverage: "complete"` verlangt. Diesen Stand erklärt bislang keine Landschaft.

Für R2 prüft der Validator die angegebenen `coverageReviews` gegen Aufgaben und Bewertungsraster und meldet Ziele ohne Review. Das Fehlen eines Reviews wirkt bisher weder als Strukturfehler noch als R2-Sperre bei `M5` oder `M7`. Die [Referenzrechnung](repo:app/scripts/lib/learningUnitRecognition.ts) prüft die Mengengleichungen in der Pflicht-CI an gemeinsamen Konformitätsfällen. Die globale revisionsgebundene Ableitung einschließlich R5 ist auf der Hauptlinie noch nicht implementiert.

### Globale Wirkung und dauerhafte Vertragsbindung {#sec:global-effect}

Die Menge $\mathcal U_{\mathrm{valid}}$ umfasst die für diese Person an ihre jeweilige Revision gebundenen, dauerhaft anwendbaren autoritativen lokalen Verträge, nicht beliebige besuchte Ansichten oder sämtliche neuesten Inhaltsfassungen. Es gilt

$$
\Meff = M \cup \bigcup_{U \in \mathcal U_{\mathrm{valid}}} I_U.
$$

Die Vereinigung umfasst nicht nur die gerade angezeigten Lerneinheiten oder den aktuellen Plan im Personal Curriculum. Vertrag, Revision und Nachweisbedeutung müssen nach einem Auswahlwechsel weiter verfügbar sein. Die Ableitung wird immer aus den ausdrücklichen Ergebnissen und ihren gültigen Verträgen berechnet; frühere implizite Mengen werden nicht als neue Mastery-Eingaben zurückgespeist.

Eine spätere Lerneinheit $\nd{U2}$ mit einer weiteren Prüfung $\nd{q_2}$ darf eine bereits aus $\nd{U1}$ belegte Anwendung $\nd{a}$ nicht wieder öffnen (Abbildung~@ref{fig:local-recognition}). Vielmehr erfüllt $\nd{a}$ die Voraussetzung von $\nd{q_2}$. Bei festem Vertragsbestand kann zusätzliche ausdrückliche Mastery $\Meff$ nur vergrößern: Die Menge offener geschützter Wurzeln wird kleiner, ihre transitive Nachfrage nimmt ab. Ein aus $I_U$ herausfallendes neu ausdrücklich bestandenes Ziel bleibt über $M$ enthalten.

::figure{id="fig:local-recognition"}

Eine stabile Prüfungsziel-ID braucht eine stabile Anerkennungsbedeutung. Wechselnde Aufgabenvarianten müssen denselben qualifizierten Vertrag erfüllen. Neue fachliche Anerkennungsansprüche dürfen alte Prüfungs-Mastery nicht stillschweigend aufwerten. Sie brauchen eine neue Prüfungsidentität oder eine ausdrücklich geprüfte Migration der vorhandenen Bedeutung. Dafür wird kein zusätzlicher Qualifikationsdatensatz pro Lernendem eingeführt. Ist die historische Nachweisbedeutung ungeklärt, bleibt der ausdrückliche Erfolg erhalten; die zusätzliche höhere Anwendung wird nicht erfunden. Berechtigte Ergebnis- oder Inhaltskorrekturen sind von einem bloßen späteren Verbraucher- oder Planwechsel zu unterscheiden.

Für die Einführung von Motivationszielen ist R5 unmittelbar relevant. Wird einer bestehenden Einheit später ein Einstieg hinzugefügt, darf ein früherer Prüfungserfolg diesen neuen Einstieg nicht nachträglich erledigen. Vor der produktiven Nutzung der globalen Ableitung muss die passende Vertragsrevision dauerhaft gebunden sein.

### Geschützte Ziele und vollständiger Abschluss {#sec:protected-completion}

#### Anerkennung ist noch kein Abschluss.

Der ganze Abschluss folgt rekursiv aus Gleichung~@eqref{eq:unit-complete}: Alle eigenen Ziele müssen erfüllt und alle Pflichtkinder abgeschlossen sein. Bei festem globalem $\Meff$ ist dies gleichbedeutend mit $T(U) \subseteq \Meff$, sofern sämtliche Kinderpflichten als Zielpflichten in diesem Umfang enthalten sind. Bei vollständigem Abschluss gilt für die eigenen geschützten Ziele $P_U \subseteq M$.

Sind alle eigenen Prüfungen und Karten bestanden, ist $N_U = \varnothing$; ein gültiger eigener lokaler Vertrag kann damit seine nicht geschützten Ziele vervollständigen. Der Abschluss der Kinder folgt daraus **nicht**. Eine eigene Syntheseprüfung der Elterneinheit kann offen bleiben, während Inhaltsziele der Kinder bereits global anerkannt sind. Umgekehrt ersetzt ihr Bestehen keine offene Prüfungs- oder Memorierpflicht eines Kindes.

#### Offene geschützte Ziele im selben Vertrag.

Ein offenes eigenes Memorierziel verhindert den ganzen Einheitsabschluss, blockiert aber nicht die Ableitung eines anderen Inhaltsziels, solange es dieses nicht transitiv benötigt (Abbildung~@ref{fig:protected}). Benötigt ein offenes Memorierziel dagegen ein Inhaltsziel direkt oder transitiv, bleibt dieses Ziel in der offenen Nachfrage. Auch mehrere Prüfungen mit gemeinsamer Grundlage müssen in diesem lokalen Vertrag sämtlich bestanden sein, bevor die Grundlage aus der offenen Nachfrage herausfällt.

::figure{id="fig:protected"}

Abbildung~@ref{fig:shared-assessments} zeigt zwei eigene Prüfungen mit gemeinsamer Grundlage. Nach der ersten bestandenen Prüfung braucht die zweite diese Grundlage weiterhin. Erst nach der zweiten fällt die Nachfrage in diesem Beispiel weg.

::figure{id="fig:shared-assessments"}

Für eine spätere Prüfung einer anderen Einheit gilt deren eigener Vertrag (Abbildung~@ref{fig:local-recognition}). Der Zuschnitt der beiden Verträge muss jeweils fachlich begründet und geprüft sein.

#### Zugang zu Prüfungen.

Auch bei offenem Einstieg kann eine Person eine verfügbare Prüfung in ihrem Umfang bewusst direkt wählen (Abschnitt~@ref{sec:exams}). Dafür gelten Authentifizierung und Sitzungszuordnung. B9 vom 14. November 2026 ersetzt das frühere offene Zugangsprofil (Abschnitt~@ref{sec:unit-progression}). Der normale Lernzugang verwendet im Zielmodell $\Meff$, die transitive Voraussetzungsrelation und die Regeln für normalen und strikten Fokus.

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
