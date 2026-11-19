## Erklärte Einheiten: Gliederung, Reihenfolge und Nachweis {#sec:learning-units}

**Geltender Struktur- und Anerkennungsvertrag.** Die Abschlussregel @eqref{eq:unit-complete} und die Anerkennung vor dem Gesamtabschluss gelten weiter. Der abgegrenzte Vorschlag vom 19. November steht in Abschnitt~@ref{sec:proposal-unit-completion} und in Abschnitt~@ref{sec:proposal-unit-assessment}. „Zielmodell“ bezeichnet hier bestätigte Zielvorgaben; der Motivationsentwurf vom 17. November ist als Vorschlag gekennzeichnet.

Eine Lerneinheit verbindet ein Lernversprechen mit einem zusammenhängenden Lernweg. Hat sie eigene Prüfungen, führt ein eigener Auftakt in das Thema ein und die Prüfungen zeigen am Ende, was die Person selbstständig anwenden kann. Der Auftakt ist ein Vorschlag vom 17. November für den regulären Lernweg.

:::principle {title="Cluster, Einheit, Einheit mit Prüfungen"}
Ein **Cluster** gliedert Ziele. Eine ausdrücklich erklärte **Einheit** lässt sich im vorgesehenen Lernfluss an einem Stück bearbeiten. Eine **Einheit mit Prüfungen** belegt die selbstständige Anwendung ihrer eigenen Inhaltsziele durch eigene Prüfungen mit fachlich geprüfter Deckung. Eine prüfungsfreie Einheit kann Ziele und Untereinheiten ordnen. Fächer dienen in der Lernkarte als Filter.
:::

:::principle {title="Fachliche Einheiten und Planeinheiten"}
Fachliche Einheiten beschreiben einen Erkenntnisschritt, der länderübergreifend gilt. **Planeinheiten** gliedern den gemeinsamen Plan eines Landes und Dauermodells über die gewählten Fächer. Dazu gehören Stufen, Jahrgänge und Phasen. Dieselbe fachliche Einheit kann dadurch in verschiedenen Ländern zu unterschiedlichen Zeitpunkten vorgesehen sein.
:::

### Motivation und eigener fachlicher Anspruch {#sec:unit-claims}

Das **Lernversprechen** der Einheit sagt, was Lernende danach können und wozu es nützt. Der **Vorschlag vom 17. November** sieht für jede Einheit mit eigenen Prüfungen genau ein eigenes **Motivationsziel** vor. Es ist ein atomares Orientierungsziel. Der Coach erhält das Lernversprechen und die Angaben zur aktiven Einheit vom Backend und zeigt den Nutzen möglichst an einer konkreten Situation. Beim Skalarprodukt könnte der Coach so beginnen: „Dein Weg auf der Karte führt schräg nach Nordosten. Am Ende kannst du zeigen, welcher Teil des Weges dich nach Osten bringt, und damit das Skalarprodukt erklären.“

Der [Vorschlag für den kurzen Auftakt](repo:docs/concept/skill-graph/learning-unit-motivation-concept-2026-11-17.md) sieht einen von Hand verfassten Praxisbezug am Motivationsziel vor. Seine Herkunft weist ihn als didaktischen Beitrag von SkillPilot aus. Abschnitt~@ref{sec:orientation} beschreibt, wie der Coach diesen Einstieg begleitet und abschließt.

Wie der Graph einen Lernweg abbildet, zeigt ein vereinfachtes Beispiel mit zwei Inhaltszielen. In Abbildung~@ref{fig:unit-entry-paths} benötigt die Prüfung $\nd{q}$ das Inhaltsziel $\nd{b}$, dieses benötigt $\nd{a}$, und $\nd{a}$ benötigt den Auftakt $\nd{m}$. Die Pfeile zeigen vom Ziel zu seiner Voraussetzung. Wer die Einheit in der vorgesehenen Reihenfolge lernt, beginnt bei $\nd{m}$ und gelangt über $\nd{a}$ und $\nd{b}$ zur Prüfung. Ob deren Aufgaben und Bewertung tatsächlich die Anwendung von $\nd{a}$ und $\nd{b}$ belegen, klärt das fachliche Deckungsreview.

::figure{id="fig:unit-entry-paths"}

**Vorgeschlagene Kantenregel.** Jedes eigene atomare Ziel außer den Orientierungszielen erreicht die Motivation der Einheit über einen Voraussetzungspfad. Das gilt auch für Übungsaufgaben, die als eigene Ziele geführt werden. Die Motivation setzt keine Inhalte voraus. Direkte Verweise auf sie stammen aus der zugehörigen Einheit. Ausgangspunkt sind die übrigen Voraussetzungen. Ein Werkzeug ergänzt die gewünschten Verbindungen und schreibt nur die direkten Motivationskanten, für die kein anderer Pfad besteht. So kann das erste eigene Inhaltsziel sowohl die Motivation als auch Vorwissen aus einer Untereinheit oder einem anderen Fach benötigen. Der vollständige Graph muss azyklisch und transitiv minimal sein.

**Vorschlag vom 17. November.** Hat eine Untereinheit eigene Prüfungen, erhält sie auch ihren eigenen Auftakt. Die äußere Einheit erklärt den größeren Zusammenhang, die innere den konkreten nächsten Schritt. **Offen ist**, ob die innere Motivation die der nächsten umschließenden Einheit mit Prüfungen voraussetzen soll. Vorerst ist beim Start der ganzen Einheit die Empfehlung ihres eigenen Auftakts vorgeschlagen. Eine verpflichtende Kante würde auch für Lernende gelten, die nur ein einzelnes Ziel der inneren Einheit als Vorbereitung für ein anderes Fach benötigen. Eine solche Kante erfordert eine begrenzte Ausnahme von der voraussetzungsfreien Orientierung und verträgliche Platzierungen im jeweiligen Landesplan.

Die Einheitsgrenze folgt einem fachlich bedeutsamen Erkenntnisübergang. Auch wenige, gut begründete Voraussetzungen können einen solchen Übergang tragen. Wo eine Kante fachlich fragwürdig ist, wird ihre Begründung unabhängig vom gewünschten Zuschnitt geprüft. Die [Gestaltungskriterien](repo:docs/concept/skill-graph/learning-unit-design-and-examples.md) beschreiben Beispiele.

Im Endausbau gehört jedes Inhaltsziel, auch ein experimentelles, als eigenes Ziel zu einer Einheit mit Motivation und Prüfungen. Deren Prüfungen liegen in ihrem Cluster und decken die eigenen Inhaltsziele gemäß R1 bis R5 ab. Eine übergeordnete Syntheseprüfung kann zusätzlich verlangen, dass die Person Inhalte mehrerer Kinder zusammen anwendet. Ein Aggregat ohne eigene Prüfungen kann seine Kinder allein durch die Reihenfolge verbinden. Während der Einführung dürfen prüfungsfreie Einheiten auch eigene Inhaltsziele ordnen.

Aufgaben und Bewertungsraster sollen wesentliche Fehlvorstellungen sichtbar machen. Zeigt sich eine Lernlücke, übt die Person gezielt weiter. Eine gleichwertige Aufgabenvariante kann beim nächsten Versuch zeigen, ob sie das Gelernte in einer neuen Situation anwenden kann. Für Wiederholungen gilt Abschnitt~@ref{sec:exams}. Fehlt einem Inhaltsziel die fachlich belegte Deckung, besteht eine **Prüfungslücke**. Ihre Reparatur braucht geeignete Aufgaben, Lösungen und Bewertungsraster mit unabhängiger Prüfung.

### Eigene Ziele, Untereinheiten und Gesamtumfang {#sec:unit-own-children}

Zu einer Einheit $U$ gehören alle atomaren Ziele unter ihrem Cluster. Sie bilden den **Gesamtumfang** $T(U)$. Die direkt untergeordneten Einheiten bilden $\Children(U)$. Jedes Atom, das in keiner dieser Untereinheiten liegt, ist ein **eigenes Ziel** von $U$. Ihre Menge ist $\Own(U)$. Die direkten Untereinheiten und die eigenen Ziele zusammen heißen **Kinder** der Einheit. Ein dazwischenliegender Cluster, der lediglich gliedert, zählt bei dieser Zuordnung nicht als Einheit.

:::equation {#eq:unit-targets}
T(U) = \Own(U) \cup \bigcup_{V \in \Children(U)} T(V).
:::

Der Gesamtumfang ist nicht leer. Bei einem Aggregat können sämtliche Ziele zu seinen Untereinheiten gehören. E1 macht die kleinste Einheit jedes enthaltenen Atoms eindeutig. Überlappende Referenzen erzeugen weder zusätzliche Ziele noch doppelte Fortschrittspunkte. Ziele und Einheiten ohne übergeordnete Einheit sind Kinder einer gedachten Wurzel. In einem vollständigen Landesplan liegt jedes Ziel unter einer der beiden Stufen; die bundesweite kanonische Gliederung ist kein Landesplan und darf Ziele neben ihren obersten Einheiten führen.

#### Darstellung im Einheiteneintrag {#sec:unit-representation}

Der Eintrag in der Platzierungsschicht verweist auf den Cluster und führt Lernversprechen, Revision und gegebenenfalls `after`. Bei einer Einheit mit Prüfungen benennt er die Deckungsreviews der eigenen Prüfungen. Der Vorschlag vom 17. November würde eine Referenz auf das eigene Motivationsziel ergänzen. Die Referenzen lassen die Ziel- und Prüfungsdaten an ihrer kanonischen Stelle.

:::table {#tab:unit-representation caption="Einheiteneintrag im bestehenden Vertrag und im Zielmodell." cols="30mm,46mm,X"}
| Gegenstand | Bestehender Vertrag | Zielmodell |
| --- | --- | --- |
| Fachliche Einheit | `programUnits`, Art `learningUnit`, `promise`, `promiseEn`, `revision` | Erklärter Cluster in derselben Platzierungsschicht; Lernversprechen und Revision bleiben. |
| Eigene Ziele und Kinder | `goalPlacements` mit `relation: own`, ohne `context`, sowie `parentUnitId` | Aus `contains` und den geschachtelten Einheitenerklärungen abgeleitet. |
| Auftakt (Vorschlag vom 17. November) | Die drei bestehenden fachlichen Einheiten haben bereits ein Lernversprechen. | Eine Referenz auf genau ein eigenes Motivationsziel je Einheit mit eigenen Prüfungen. |
| Deckungsreviews | `coverageReviews`, höchstens ein Eintrag je eigener Prüfung, gebunden an Aufgaben- und Raster-Hashes sowie Reviewprotokoll | Für Einheiten mit Prüfungen erforderlich. |
| Planeinheiten | Stufenplan-Grundlage unter `v1.3`, ohne aktivierten Landesplan | Ein gemeinsamer Plan pro Land und Dauermodell; Sichten sind daraus abgeleitete Ausschnitte. |
| Abschluss und Ergebnisse | Keine gespeicherte Einheits-Mastery | Weiter abgeleitet; kein Rückwärtsschreiben auf Ziele und keine Anerkennung aus `after`. |
:::

**Stand der Umsetzung.** Die drei fachlichen Einheiten im [Paketvertrag 1.2](repo:contracts/curriculum-package/v1.2/README.md) verwenden `learningUnitsV1`. Sie haben noch kein eigenes Motivationsziel. Der Validator prüft unter anderem R1, R3 und die eindeutige Zuordnung über `own`. Die [Grundlage für Stufenpläne](repo:contracts/curriculum-package/v1.3/README.md) ist separat. Für die Referenz auf den Auftakt ist eine neue Vertragsversion vorgesehen. Vor einem Wechsel von Fachankern zu Einheitsmotivationen müssen die Routenprüfungen diese Einstiege im jeweiligen Geltungsbereich erkennen.

Die Einführung der neuen Einheitenstruktur folgt auf die Messung F8. F9 bis F13 betreffen unter anderem Paketdarstellung, Validierung und Lernlaufzeit. Die fachlichen Korrekturen an Zielen, Voraussetzungen und Prüfungen aus K1 bis K13 können parallel mit aktuellen unabhängigen Nachweisen erfolgen. Ändert sich ein Ziel aus dem eingefrorenen V9-Register, entfällt für dieses Ziel die frühere Reviewübertragung.

### Abschluss ohne zusätzlich gespeicherte Unit-Mastery {#sec:unit-completion}

Die vollständige Einheit ist abgeschlossen genau dann, wenn ihre eigenen Ziele erfüllt und alle verpflichtenden Untereinheiten abgeschlossen sind:

:::equation {#eq:unit-complete}
\Complete(U) \iff \bigl(\Own(U) \subseteq \Meff\bigr) \;\land\; \bigwedge_{V \in \Children(U)} \Complete(V).
:::

Die Unterscheidung zwischen einem **benötigten Anteil** und der **ganzen Einheit** zeigt Abbildung~@ref{fig:unit-entry-paths}. Angenommen, ein Physikziel braucht aus dieser Mathematikeinheit nur $\nd{a}$. Dann gehören auch $\nd{m}$ und das externe Vorwissen $\nd{p}$ zum persönlichen Lernumfang. Sind beide und $\nd{a}$ erfüllt, ist dieser Teil der mathematischen Vorbereitung erledigt. Zur vollständigen Mathematikeinheit gehören zusätzlich $\nd{b}$ und die Prüfung $\nd{q}$.

Abbildung~@ref{fig:recursive-unit} zeigt zwei Lernstände in der Mechanik. Im ersten sind Kinematik und Dynamik abgeschlossen, die gemeinsame Syntheseprüfung ist noch offen. Im zweiten ist die Syntheseprüfung bestanden, in den Untereinheiten fehlen noch Prüfungen und Kartenabrufe. In beiden Fällen ist die Mechanikeinheit insgesamt offen. Das ergibt sich aus den Zielergebnissen.

::figure{id="fig:recursive-unit"}

#### Vorschlag vom 19. November: repräsentativer Einheitenabschluss {#sec:proposal-unit-completion}

**Nicht übernommener Vorschlag.** Eine erklärte fachliche Einheit kann ein begrenztes Lernversprechen auf einem benannten Niveau durch repräsentative Abschlussleistungen nachweisen. Das ist eine andere Aussage als die vollständige atomare Erfüllung nach der geltenden Gleichung~@eqref{eq:unit-complete}. Pflichtarbeit an dieser Route würde enden, ohne übersprungene Einzelaktivitäten nachträglich als durchgeführt zu verbuchen. Bestehende atomare Lernaufträge behalten ihren Umfang.

Der vorgeschlagene Vertrag bindet Identität, Lernversprechen, Niveau, Fassung $\rho$, eigene Pflichtbelege $\operatorname{OwnEvidence}(U,\rho)$ und Pflichtkinder $\Children_{\mathrm{req}}(U,\rho)$. **Nur für diesen Vorschlag** gilt:

:::equation {#eq:unit-complete-proposal}
\begin{aligned}
\Complete(U,\rho) \iff {}& \operatorname{Valid}(U,\rho)\land\operatorname{OwnEvidence}(U,\rho)\\
&\land\!\bigwedge_{V\in\Children_{\mathrm{req}}(U,\rho)}\Complete(V,\rho_V).
\end{aligned}
:::

$\operatorname{Valid}$ verlangt im Vorschlag einen ausdrücklich erklärten und fachlich freigegebenen Vertrag mit tatsächlichen Pflichten; eine leere Pflichtliste genügt nicht. $\rho_V$ bindet die Fassung des Kindes. Reine Aggregate können reale Pflichtkinder bündeln. Ohne freigegebenen Direktnachweis bleiben die vorgesehenen Einzelpflichten erforderlich. Jede eigenständige Pflichtprüfung braucht ihren eigenen gültigen Erfolg; ausdrücklich ausgewiesene Praxis- oder Abrufpflichten bleiben auf beiden Wegen bestehen. Eine eigene Durchführung ist keine pauschale Zusatzpflicht jeder Einheit. Wo aber der Anspruch eines einzelnen Atoms eine Durchführung verlangt, kann weder ein Gespräch noch die Prüfung dieses ganze Atom allein durch Auswertung bereitgestellter Daten belegen.

Die E.1-Probe verbindet zwei bestehende Kindprüfungen mit den neuen eigenen Teilen A und B. Alle vier sind nötig. Ein Kind kann seine eigenen gewöhnlichen Atome erst über seinen eigenen bestandenen und fassungsgebundenen Vertrag freigeben; der Elternabschluss erhält keine Zuständigkeit für Kind- oder fachfremde Atome. Die Einzelheiten, die bewusste Verzögerung der Freigabe und die offenen Entscheidungen stehen in Abschnitt~@ref{sec:proposal-unit-assessment}.


### Anerkennung vor dem Gesamtabschluss {#sec:unit-early-recognition}

Ein eigenes Inhaltsziel kann schon vor dem Gesamtabschluss als selbstständig angewandt gelten, ein Motivationsziel als erledigter Einstieg. Maßgeblich ist der gültige Vertrag der zuständigen Einheit (Abschnitt~@ref{sec:assessment}). Deshalb behält ein Kind seine bereits anerkannten Ziele, wenn die Syntheseprüfung der Elterneinheit noch offen ist.

Wie eine offene Prüfung oder ein offenes Lernkartenziel die Ableitung beeinflusst, zeigt Abbildung~@ref{fig:orientation-outcome}. Die Bindung an die Vertragsrevision regelt Abschnitt~@ref{sec:global-effect}.

### `after`, atomarer Bedarf und Regeln E1 bis E4 {#sec:unit-progression}

`U after V` ordnet im vorgesehenen Lernfluss alle Atome von U nach allen Atomen von V. Diese Reihenfolge gilt zwischen Geschwistereinheiten, auch unter der gedachten Wurzel. Aus ihr lässt sich ablesen, was im Plan folgt. Eine fachliche Aussage darüber, wo Lernende etwas wieder anwenden, braucht eine konkrete Anwendung. `requires` verbindet atomare Ziele und bezeichnet deren Vorbereitungsbedarf. Prüfungen sind Endpunkte des Lernwegs. Eine Syntheseprüfung kann Inhalte ihrer Untereinheiten voraussetzen, während deren Prüfungsergebnisse als eigenständige Pflichten in den Gesamtabschluss eingehen.

:::table {#tab:unit-ordering caption="Verbindliche Ordnungsregeln; jede Gliederung wird gesondert geprüft." cols="14mm,X"}
| Regel | Anforderung |
| --- | --- |
| E1 Baum | Einheiten sind ineinander geschachtelt oder ohne gemeinsame Atome; jedes enthaltene Ziel hat höchstens eine kleinste Einheit. Im vollständigen Landesplan hat jedes Ziel genau einen Lernplatz. R4 ist diese Eindeutigkeit in der Sprache des lokalen Prüfungsvertrags. |
| E2 An einem Stück lernbar | Es gibt eine Reihenfolge aller Atome, die jeden direkten und transitiven Bedarf und jedes `after` einhält und jede Einheit als zusammenhängenden Block enthält. |
| E3 Vollständig | Braucht a das Ziel b, entscheidet die kleinste Einheit, die beide enthält, beziehungsweise die gedachte Wurzel. Liegen a und b dort in zwei verschiedenen Kind-Einheiten, muss das Kind von a über die erklärte `after`-Hülle nach dem Kind von b liegen. Ist mindestens ein Kind ein eigenes Atom, ordnet der Bedarf selbst. |
| E4 Sparsam | Unter den Kindern derselben Einheit folgt kein erklärtes `after` schon aus den übrigen dort erklärten `after`. Die kanonische und die Landesgliederung werden getrennt geprüft. |
:::

Für E2 genügt es, die Kinder jeder Einheit zu betrachten, auch die Kinder der gedachten Wurzel. Kind $X$ hängt von Kind $Y$ ab, wenn $X$ ein `after` auf $Y$ trägt oder ein Atom in $X$ eines in $Y$ braucht. Dieser Graph muss auf jeder Ebene azyklisch sein. Ein Beispiel zeigt, warum das eine eigene Prüfung ist. Bei $a\to b\to c$ lautet die Lernreihenfolge $c,b,a$. Gehören $a$ und $c$ zu einer Einheit und $b$ zu einer anderen, muss die Person die erste Einheit verlassen und später zu ihr zurückkehren. Dann ist der fachliche Zuschnitt zu prüfen.

Für E3 zählt der tatsächliche Bedarf der Ziele. E4 prüft die Sparsamkeit der Reihenfolge in jeder Gliederung für sich. Eine fachliche Reihenfolge kann also nötig sein, auch wenn zwei Jahrgänge im Landesplan in derselben Reihenfolge liegen. Die atomaren Voraussetzungen werden gesondert auf Minimalität geprüft (G17).

:::principle {title="Auswahl erreichbarer Ziele"}
`after` ordnet Vorschläge unter den bereits erreichbaren Zielen. Die ausdrückliche Wahl der Person und der datierte Lernplan behalten Vorrang. Fokusregeln und direkter Prüfungszugang gelten weiterhin. Damit löst B9 das frühere Zugangsprofil `GD-U14` mit `Open` und `Cleared` ab.
:::

#### Lernweise „Einheit für Einheit“. {#sec:unit-by-unit}

Für den nächsten Vorschlag betrachtet die Lernweise „Einheit für Einheit“ nur erreichbare Ziele. Drei Begriffe beschreiben, welche davon zuerst angeboten werden.

- **Erledigt** ist ein Kind, sobald alle seine atomaren Ziele im persönlichen Lernumfang $L$ effektiv beherrscht sind. Für eine Untereinheit $V$ heißt das $T(V)\cap L\subseteq\Meff$. Auch offene Prüfungen und Kartenabrufe in diesem Anteil zählen mit.
- **Begonnen** ist eine Einheit, wenn in diesem Anteil bereits mindestens ein Ziel erfüllt und mindestens eines offen ist.
- **An der Reihe** ist ein offenes Kind, sobald seine Vorgänger unter den Geschwistern erledigt sind. Welche Kinder vorausgehen, ergibt sich aus `after` und den atomaren Voraussetzungen zwischen den Kindern.

Die Auswahl startet an der gedachten Wurzel. Auf jeder Ebene betrachtet sie die Kinder, die mindestens ein erreichbares Ziel enthalten, in dieser Reihenfolge:

1. eine offene Kindeinheit, die sowohl **an der Reihe** als auch bereits **begonnen** ist (angefangene Einheit geschlossen zu Ende führen);
2. sonst ein offenes Kind (Kindeinheit oder eigenes Atom), das **an der Reihe** ist;
3. sonst eine offene **begonnene** Kindeinheit (falls früheres Überspringen einen Vorgänger offengelassen hat);
4. sonst ein beliebiges Kind mit erreichbarem Frontier-Ziel.

Liegt das Ziel in einer Untereinheit, wird dort nach derselben Regel weitergewählt, bis ein atomares Ziel erreicht ist.

Für diese Lernweise ist vorgeschlagen, beim Start der anstehenden Einheit deren eigenen Auftakt zu empfehlen. Wie der Einstieg bei engerem Fokus, bewusster Prüfungswahl oder noch fehlendem Fortschritt erfolgt, erklärt Abschnitt~@ref{sec:orientation}. Die Umsetzung der Lernweise „Einheit für Einheit“ steht aus.

Im vollständigen Landesplan folgen die beiden obersten Einheiten in der Reihenfolge Sekundarstufe I, dann Sekundarstufe II. Wird ein Atom der späteren Stufe schon in der früheren benötigt, muss der Bedarf fachlich geklärt und die Vorbereitung richtig platziert werden. Zunächst werden die übergeordneten Einheiten geordnet. Für die fachlichen Blatteinheiten ist dann in allen 16 Ländern nachzuweisen, dass jede vollständig in eine Planeinheit passt. Die Kinder einer größeren Einheit können auf mehrere Planeinheiten verteilt sein. Als Ganzes erscheint diese größere Einheit dann nur in der bundesweiten Fachansicht. Den Stand der schrittweisen Durchsetzung dokumentiert Anhang~@ref{sec:implementation}.

:::sources
[Einheiten und ihre Verdrahtung](repo:docs/concept/skill-graph/learning-unit-wiring-concept-2026-11-14.md), [Entwurf zum Motivationsziel](repo:docs/concept/skill-graph/learning-unit-motivation-concept-2026-11-17.md), [Stufenentscheidungen und Übergabe](repo:docs/dev/stage-plan-units-handover-2026-11-15.md), [Stufenplan-Grundlage](repo:contracts/curriculum-package/v1.3/README.md), [Anerkennung und globaler Abschluss](repo:docs/concept/skill-graph/assessment-gated-completion.md).
:::
