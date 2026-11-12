## Lerneinheiten: vom Lernversprechen zum rekursiven Abschluss {#sec:learning-units}

Der Skill-Graph sagt, welche Ziele es gibt und was sie voraussetzen. Er sagt nicht, welche Ziele zusammen ein fachliches Ganzes bilden, das eine Person als Thema beginnt und abschließt. Diese Aufgabe übernimmt die Lerneinheit. Dieser Abschnitt definiert ihren Umfang, ihren abgeleiteten Abschluss und die Grenzen von Voraussetzungen zwischen ganzen Einheiten. Abschnitt~@ref{sec:assessment} baut darauf die implizite Beherrschung auf.

:::principle {title="Fachliche Einheit statt Kalenderschublade"}
Eine **Lerneinheit** (englisch *learning unit*, künftiger technischer Begriff `LearningUnit`) verbindet ein verständliches Lernversprechen mit eigenen Lernzielen und gegebenenfalls kleineren Lerneinheiten, ihren *Kindeinheiten*. Die Struktur ist rekursiv: Mechanik kann Kinematik und Dynamik enthalten; Kinematik kann ihrerseits weitere Einheiten enthalten. Schuljahr, Semester und Lernwoche sind mögliche Planungsbezüge, keine Synonyme für eine Lerneinheit. Personalisierungsstufen 1--4, QA-Reifegrade und das Schwierigkeitsfeld `level` behalten ihre bisherige Bedeutung.
:::

:::principle {title="Zweck: tragfähige Grundlage, bevor darauf aufgebaut wird"}
Eine Lerneinheit sichert die selbstständige Anwendung ihres Lernversprechens, bevor der geplante Lernweg darauf aufbaut. Ihre Prüfungen sind so angelegt, dass wesentliche Fehlvorstellungen sichtbar werden: Eine erkannte Lücke führt zu gezieltem Weiterlernen und einer frischen, gleichwertigen Prüfung; ein scheinbarer Abschluss würde Lernende dagegen auf unsicherer Grundlage weiterschicken. Es gilt unverändert der reguläre Bewertungsvertrag -- ohne verdeckte Bestehensregel und ohne zweites gespeichertes Ergebnis; eine einzelne Ungenauigkeit bei tragfähiger Begründung wird anders beurteilt als fehlendes zentrales Verständnis. Das ist eine didaktische Anforderung an die Einheitendefinition, keine technische Zugangssperre (Abschnitt~@ref{sec:unit-progression}).
:::

### Motivation und eigener fachlicher Anspruch {#sec:unit-claims}

Die Einheit beantwortet zuerst: *Was kann ich danach, und wozu ist das nützlich?* Ein Motivationsauftakt macht dieses Versprechen verständlich, bevor einzelne Aufgaben oder Ziele angeboten werden. Der Auftakt ist eine didaktische Funktion. Wenn er als echtes Orientierungsziel modelliert ist, gilt dessen eigener Abschlussvertrag (Abschnitt~@ref{sec:orientation}); eine synthetische Überschrift ist dadurch kein zusätzliches Lernziel. Aus einem abgeleiteten Abschluss folgt keine Behauptung, dass ein Motivationsgespräch tatsächlich stattgefunden hat.

Eine Einheitsgrenze folgt einem fachlich bedeutsamen Erkenntnisübergang: Welches zusammenhängende Verständnis und welche Anwendung müssen sicher sein, bevor Neues darauf aufbaut? Eine vorhandene Prüfung, eine Zielquote, eine ordentliche Überschrift oder die Dichte der Voraussetzungskanten ist höchstens ein Hinweis, nie die Definition. Auch sparsame, transitiv minimale Ketten können starke Einheiten bilden, und gemeinsame elementare Grundlagen zwingen nicht jede spätere Anwendung in eine einzige riesige Einheit. Kanten werden weder ergänzt noch entfernt, damit ein gewünschter Zuschnitt passt; eine fragwürdige Kante ist ein eigener fachlicher Befund. Eine abschließende Einheit oder Synthese braucht keinen späteren Verbraucher als Rechtfertigung. Die [Gestaltungskriterien und Beispiele](repo:docs/concept/skill-graph/learning-unit-design-and-examples.md) wenden diese Kriterien auf zwei Kandidaten an.

Eine größere Einheit kann gegenüber ihren Kindeinheiten drei verschiedene Ansprüche erheben:

- **Zusammenfassen (Aggregat).** Die Einheit fasst vorhandene Kompetenzen ihrer Kinder nur zusammen. Dann braucht sie keine neue eigene Prüfung.
- **Integrieren (Synthese).** Verspricht die Einheit zusätzlich die selbstständige Integration dieser Kompetenzen, kann eine eigene Syntheseprüfung diesen Anspruch prüfen. Sie kann sich dabei auf bereits in Kindern erworbene Kompetenzen beschränken. Für reine Synthese müssen keine künstlichen neuen Inhaltsziele erfunden werden. Die Rolle der Syntheseprüfung ist der zusätzliche Integrationsnachweis, nicht das erneute Bestehen aller Kinder.
- **Eigene Fachkompetenzen.** Zusätzliche eigene Fachkompetenzen sind ebenfalls möglich; sie brauchen ihre eigene Erwerbszuordnung und gültige Prüfungsdeckung.

### Direkter Erwerb, Kinder und Gesamtumfang {#sec:unit-own-children}

Eine autoritative, versionierte Einheit $U$ wird durch drei Größen beschrieben:

- $\Own(U)$ bezeichnet die direkt zugeordneten atomaren *Erwerbsziele*, kurz: die eigenen Ziele. Echte Orientierungs-, Prüfungs- und Memorierziele können dazugehören; reine Strukturmarker nicht.
- $\Children(U)$ enthält die verpflichtenden Kindeinheiten, die *Pflichtkinder*. Wahlentscheidungen sind zuvor aufgelöst.
- $T(U)$ ist die eindeutige gesamte Zielmenge, der *Gesamtumfang*, gegeben durch:

:::equation {#eq:unit-targets}
T(U) = \Own(U) \cup \bigcup_{V \in \Children(U)} T(V).
:::

In Abbildung~@ref{fig:recursive-unit} hat Kinematik die eigenen Ziele $\{\nd{a}, \nd{b}, \nd{q_K}, \nd{k_K}\}$, Dynamik $\{\nd{d}, \nd{q_D}\}$ und Mechanik nur die Syntheseprüfung $\{\nd{q_S}\}$. Der Gesamtumfang von Mechanik umfasst alle sieben Ziele.

Für Umfang und Zuordnung gelten diese Regeln:

- Der aufgelöste Gesamtumfang ist nicht leer. Ein leerer Navigationsmarker ist keine abgeschlossene Lerneinheit. Ein Aggregat darf dagegen leere eigene Ziele haben, wenn seine Pflichtkinder den Gesamtumfang tragen.
- Jedes Erwerbsziel hat genau eine direkt zuständige Einheit: die kleinste fachlich zuständige autoritative Einheit (Regel R4 in Abschnitt~@ref{sec:why-graph-not-enough}). Eine Elternansicht darf dieselben stabilen Ziele zeigen, ohne sie erneut als eigene Erwerbsziele zu beanspruchen.
- Überlappende Referenzen werden als Mengen vereint; sie erzeugen weder zusätzliche Ziele noch doppelte Fortschrittspunkte.
- Die Zuordnung der eigenen Ziele und die fachlich geprüfte Bedeutung der eigenen Prüfungen bilden den *lokalen Vertrag* der Einheit (Abschnitt~@ref{sec:assessment}). Ein bloßer Fokuswechsel verändert diese Zuordnung und den lokalen Vertrag nicht.
- Jedes Inhaltsziel in $\Own(U)$ braucht einen eigenen lokalen Prüfungsverbraucher, also eine eigene Prüfung der Einheit, die es direkt oder transitiv voraussetzt (R1), und mindestens eine solche Prüfung braucht einen geprüften Nachweis, dass ihre Aufgaben und ihr reguläres Bewertungsraster das Ziel wirklich prüfen (R2). Abschnitt~@ref{sec:why-graph-not-enough} nennt alle Gültigkeitsbedingungen R1--R5 und wo jede durchgesetzt wird. Ohne sie ist der lokale Vertrag ungültig; eine zusätzliche frei gewählte Anerkennungsmaske ist kein Ersatz.

Die Einbettung benutzt die vorhandene Programm- und Platzierungsstruktur beziehungsweise die geprüfte Kompositionssicht (Abschnitt~@ref{sec:context-model}). Eine fachliche Einheit ist nicht allein deshalb definiert, weil ein Cluster gerade aufgeklappt ist. Ebenso wenig wird jeder beliebige `contains`-Cluster automatisch zur Lerneinheit. Insbesondere bleibt die allgemeine Clustererfüllung aus Abschnitt~@ref{sec:state} von der hier erklärten, ausdrücklich autorisierten Einheitsstruktur unterschieden.

### Abschluss ohne zusätzlich gespeicherte Unit-Mastery {#sec:unit-completion}

Die vollständige Einheit ist abgeschlossen genau dann, wenn ihre eigenen Ziele erfüllt und alle verpflichtenden Kinder abgeschlossen sind:

:::equation {#eq:unit-complete}
\Complete(U) \iff \bigl(\Own(U) \subseteq \Meff\bigr) \;\land\; \bigwedge_{V \in \Children(U)} \Complete(V).
:::

Der Abschluss wird aus den atomaren Ergebnissen abgeleitet. Es entsteht keine gespeicherte `UnitMastery`, die Ergebnisse auf Kinder zurückschreibt. Prüfungs- und Memorierziele bleiben ausschließlich explizit. Daher kann eine bestandene Elternprüfung keine offene Kindprüfung und keinen fehlenden verifizierten Kartenabruf ersetzen.

Für die Formen aus Abschnitt~@ref{sec:unit-claims} bedeutet das Folgendes. Ein reines Aggregat darf ohne eigene Prüfung bestehen: Sein Abschluss folgt aus den Kindern und eventuell anderen eigenen Pflichten. Eine Syntheseeinheit kann dagegen eine eigene Prüfung, aber keine neuen Inhaltsziele haben; ihre Prüfung ist dann zusätzlich erforderlich. Eine reine Kartensammlung begründet keinen Anspruch unabhängiger fachlicher Anwendung; ihre tatsächlichen Abrufpflichten bleiben ausdrücklich zu erfüllen. Eine fachlich zum Kind gehörige Abrufpflicht darf nicht allein zur Erzeugung eines Kindabschlusses auf die Elterneinheit verschoben werden.

::figure{id="fig:recursive-unit"}

### Anerkennung vor dem Gesamtabschluss {#sec:unit-early-recognition}

Eine passende bestandene Prüfung kann im verbindlichen Zielkonzept -- das auf der Hauptlinie **noch nicht implementiert** ist -- die eigenen Inhaltsziele einer Einheit anerkennen, bevor eine davon unabhängige Karte oder eine andere Kindeinheit abgeschlossen ist, sofern keine andere offene eigene Prüfung und kein offenes eigenes Memorierziel der Einheit sie noch benötigt (Abschnitt~@ref{sec:transitive-demand}). Diese Anerkennung ist global wirksam. Eine noch offene Syntheseprüfung der Elterneinheit nimmt sie nicht zurück.

Für jede Einheit wird deshalb nur die Anerkennung ihrer *eigenen* Ziele berechnet, soweit sie keine Prüfungs- oder Memorierziele sind. Die Elterneinheit bildet aus allen Nachfahren keinen neuen vergrößerten Anerkennungsumfang. Sonst könnte ihre Prüfung untergeordnete Prüfungs- oder Kartenpflichten unzulässig umgehen. Eine Elternprüfung kann zusätzliche Integration belegen, ohne die ursprüngliche Nachweisbedeutung der Kindverträge rückwirkend zu erweitern. Die genaue Formel und ihre Inhaltsbedingungen stehen in Abschnitt~@ref{sec:assessment}.

### Voraussetzungen und die Grenze einer Einheitsfolge {#sec:unit-progression}

Zwei Arten von Voraussetzungen sind zu unterscheiden:

- Ein atomarer `requires`-Bezug auf eine Kompetenz fordert diese Kompetenz. Er fordert nicht automatisch den Abschluss ihrer gesamten Einheit.
- Eine *Einheitsvoraussetzung* ist eine ausdrücklich autorisierte Voraussetzung zwischen ganzen Lerneinheiten. Sie bedeutet *Vollabschluss* der vorausgesetzten Einheit und gehört zum Kompositionsvertrag außerhalb der bisherigen Grundrelationen $C$ und $R$.

Diese Aussagen dürfen weder im Compiler noch im Coach verwechselt werden.

Die Einheitshierarchie muss azyklisch sein. Wer darüber hinaus eine ungeteilte Abschlussfolge von Einheiten behauptet, in der jede Einheit vollständig abgeschlossen wird, bevor die nächste beginnt, muss auch deren Voraussetzungsgraphen prüfen. Ein atomarer DAG genügt nicht: Bei $a \to b \to c$, $\Own(U) = \{a, c\}$ und $\Own(V) = \{b\}$ braucht $U$ die Einheit $V$ wegen $a \to b$ und $V$ die Einheit $U$ wegen $b \to c$. Nach Zusammenfassung entsteht also eine Abhängigkeit in beide Richtungen; $U$ und $V$ sind so keine gültige ungeteilte Vollabschlussfolge. Die Diagnose erfordert eine andere Gruppierung oder einen ausdrücklich feineren Erwerbsablauf; sie erzeugt keine stillschweigenden Einheitssperren aus atomaren Kanten.

Die atomare Normalform $R \subseteq A \times A$ und ihre vollständige transitive Minimalität aus Abschnitt~@ref{sec:validity} gelten weiterhin. Der aktuelle Bestand muss die vollständige deterministische Zielzustandsprüfung vor jedem Meilensteinpass bestehen. Daraus folgt noch keine neue Minimalitätsregel für eine erst zu beschließende Relation von Einheitsvoraussetzungen.

:::principle {title="Zugangsprofil noch offen"}
Eine fachliche Erwerbsordnung ist noch keine technische Zugangssperre. Ob und wann eine Einheitsvoraussetzung einen harten Zugangsschutz, eine *Einheitssperre*, erzwingt, und wie dann direkte Prüfungsversuche behandelt werden, ist **noch nicht entschieden**. Ein solches Profil wäre gesondert zu beschließen und zu prüfen. Die Einheitendefinition führt es nicht ein.
:::

Nur *falls* später ein ausdrückliches Sperrprofil gewählt wird, könnte man für autorisierte Vorgängereinheiten $\operatorname{Pred}(U)$ definieren:

$$
\operatorname{Open}(U) = \bigwedge_{V \in \operatorname{Pred}(U)} \operatorname{Cleared}(V), \qquad \operatorname{Cleared}(U) = \operatorname{Open}(U) \land \Complete(U).
$$

$\Complete$ beschreibt die vorhandenen Nachweise, $\operatorname{Cleared}$ nur die bedingte Kurspolitik. Weder das Öffnen noch diese abgeleitete Freigabe vergibt Mastery. Ob direkte Prüfungen bei geschlossenem Zugang zulässig bleiben, entscheidet diese bloße Beispielgleichung nicht.

:::sources
[Lerneinheiten](repo:docs/concept/skill-graph/learning-units.md); [Einheitsfolge und Zugangsprofile](repo:docs/concept/skill-graph/learning-unit-progression.md); [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md); [Anerkennung und globaler Abschluss](repo:docs/concept/skill-graph/assessment-gated-completion.md).
:::
