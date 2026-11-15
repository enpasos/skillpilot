## Erklärte Einheiten: Gliederung, Reihenfolge und Nachweis {#sec:learning-units}

Dieses Kapitel beschreibt das verbindliche Zielmodell der Beschlüsse B1 bis B16 vom 14. November und der Stufenentscheidungen vom 15. November 2026. Die Umsetzungsgrenze ist ausdrücklich: Die drei bisherigen fachlichen Lerneinheiten verwenden weiter den Vertrag vom 12. November; die Stufenplan-Grundlage aktiviert noch keinen echten Landesplan. Zielmodell, vorhandener Strukturvalidator und produktive Laufzeit sind verschiedene Nachweise.

:::principle {title="Cluster, Einheit, Einheit mit Prüfungen"}
Ein **Cluster** gliedert Ziele. Eine ausdrücklich erklärte **Einheit** ist ein Cluster, dessen Ziele im vorgesehenen Lernfluss an einem Stück erworben werden können. Eine **Einheit mit Prüfungen** belegt zusätzlich die selbstständige Anwendung ihrer eigenen Inhaltsziele durch eigene Prüfungen mit geprüfter Deckung. Eine Einheit ohne Prüfungen ordnet nur und erkennt nichts an. Nicht jeder Cluster ist eine Einheit; Fächer sind Filter und keine Einheiten. Personalisierungsstufen, Reifegrade und Schwierigkeit behalten ihre Bedeutung.
:::

:::principle {title="Zielmodell und bestehender Vertrag"}
Fachliche Einheiten gelten in der kanonischen Landschaft in allen Ländern. **Planeinheiten** gliedern den gemeinsamen Plan eines Landes und Dauermodells über die gewählten Fächer, etwa Stufen, Jahrgänge und Phasen. Die Umstellung der fachlichen Einheiten, ihrer Prüfungscluster, Paketträger und produktiven Leser folgt erst nach F8 (Messung) in F9 bis F13. Das Entwicklungsverzeichnis `contracts/curriculum-package/v1.3/` ist kein veröffentlichtes Curriculum-Paket und beweist diese Umstellung nicht.
:::

Notwendige aktuelle Fachkorrekturen an Zielen, Voraussetzungen, Aufgaben, Rubriken und Deckung bleiben im delegierten K1–K13-Auftrag bereits jetzt zulässig. Die F8-Grenze betrifft die künftige Einheiteneinführung und ihre Cluster-, Prüfungs-, Paket- und Laufzeitmigration; sie konserviert keine fachlich falsche Kante oder fehlende Prüfung. Jede solche Reparatur braucht ihre eigenen aktuellen unabhängigen Nachweise.

### Motivation und eigener fachlicher Anspruch {#sec:unit-claims}

Ein Lernversprechen erklärt: Was kann ich danach, und wozu ist das nützlich? Ein Motivationsauftakt ist eine didaktische Funktion. Nur ein echtes Orientierungsziel hat einen eigenen Ergebnisvertrag; eine Überschrift erzeugt kein Ziel, und abgeleiteter Abschluss behauptet kein tatsächlich geführtes Gespräch.

Die Einheitsgrenze folgt einem fachlich bedeutsamen Erkenntnisübergang. Vorhandene Prüfungen, Zielquoten, Überschriften und Kantendichte definieren sie nicht. Sparsame Voraussetzungsketten können starke Einheiten bilden. Eine fragwürdige Kante wird fachlich geprüft und nicht zugunsten eines gewünschten Zuschnitts erhalten oder geändert. Ein fehlender späterer Verbraucher beweist keinen Abschluss. Die [Gestaltungskriterien](repo:docs/concept/skill-graph/learning-unit-design-and-examples.md) gelten weiter.

Ein Aggregat fasst Kinder ohne neue eigene Prüfung zusammen. Eine Syntheseprüfung kann zusätzliche Integration belegen, ohne künstliche Inhaltsziele oder erneutes Bestehen der Kinder zu verlangen. Eigene Inhaltsziele brauchen im Endausbau eine zuständige fachliche Einheit mit Prüfungen. Die Prüfungen einer solchen Einheit liegen in ihrem Cluster und decken alle eigenen Inhaltsziele nach R1 bis R5 ab. Das gilt auch für experimentelle Inhaltsziele. Bis zur vollständigen Einführung dürfen Einheiten ohne Prüfungen eigene Inhaltsziele ordnen; daraus entsteht keine Anerkennung.

Prüfungen müssen wesentliche Fehlvorstellungen sichtbar machen. Eine Lücke führt zu gezieltem Weiterlernen und einer frischen gleichwertigen Prüfung nach dem regulären Bewertungsvertrag. Es gibt keine verdeckte Bestehensregel und kein zweites Ergebnis. Fehlende Deckung ist eine **Prüfungslücke**: Sie bleibt ein nicht bestandener Befund und wird durch geeignete Aufgaben, Lösungen, Rubriken und unabhängiges Review repariert, niemals durch eine fachlich falsche Voraussetzung oder ein gelockertes Gate.

### Eigene Ziele, Untereinheiten und Gesamtumfang {#sec:unit-own-children}

Der Zielvertrag erklärt eine Einheit in der Platzierungsschicht und verweist auf ihren Cluster. Die atomaren Nachfahren dieses Clusters bilden $T(U)$. Direkte Untereinheiten sind die erklärten Einheiten darunter, zwischen denen und U keine weitere Einheit liegt. Ihre Menge heißt $\Children(U)$. Die übrigen Atome bilden $\Own(U)$; zusammen sind Untereinheiten und eigene Atome die **Kinder** der Einheit. Zwischenliegende Cluster ohne Einheitserklärung werden dabei übersprungen.

:::equation {#eq:unit-targets}
T(U) = \Own(U) \cup \bigcup_{V \in \Children(U)} T(V).
:::

Der Gesamtumfang ist nicht leer. Ein Aggregat darf leere eigene Ziele haben, wenn seine Kinder den Umfang tragen. E1 macht die kleinste Einheit jedes enthaltenen Atoms eindeutig. Überlappende Referenzen erzeugen weder zusätzliche Ziele noch doppelte Fortschrittspunkte. Ziele und Einheiten ohne übergeordnete Einheit sind Kinder einer gedachten Wurzel. In einem vollständigen Landesplan liegt jedes Ziel unter einer der beiden Stufen; die bundesweite kanonische Gliederung ist kein Landesplan und darf Ziele neben ihren obersten Einheiten führen.

#### Darstellung und Umsetzungsgrenze. {#sec:unit-representation}

Im Zielmodell nennt der Einheiteneintrag Cluster, Lernversprechen, Revision, `after` und gegebenenfalls Deckungsreviews eigener Prüfungen. Eigene Ziele und Untereinheiten ergeben sich aus `contains`; das bisherige `own` und `parentUnitId` werden erst mit F9/F10 ersetzt. Ein gewöhnlicher oder aufgeklappter Cluster erklärt sich dadurch nicht selbst zur Einheit. Ziele, Voraussetzungen und Prüfungsdaten werden nicht kopiert.

:::table {#tab:unit-representation caption="Bestehende Darstellung und verbindliches Zielmodell; keine Behauptung einer abgeschlossenen Migration." cols="30mm,46mm,X"}
| Gegenstand | Bestehender Vertrag vom 12. November | Verbindliches Zielmodell |
| --- | --- | --- |
| Fachliche Einheit | `programUnits`, Art `learningUnit`, `promise`, `promiseEn`, `revision` | Erklärter Cluster in derselben Platzierungsschicht; Lernversprechen und Revision bleiben. |
| Eigene Ziele und Kinder | `goalPlacements` mit `relation: own`, ohne `context`; `parentUnitId` | Aus Clusterumfang und geschachtelten Einheitserklärungen abgeleitet; F9/F10 stehen aus. |
| Deckungsreviews | `coverageReviews`, höchstens ein Eintrag je eigener Prüfung, gebunden an Aufgaben- und Raster-Hashes sowie Reviewprotokoll | Für Einheiten mit Prüfungen weiterhin zwingend; historische Nachweise werden nicht umgebunden. |
| Planeinheiten | Stufenplan-Grundlage unter `v1.3`, ohne aktivierten Landesplan | Ein gemeinsamer Plan pro Land und Dauermodell; Sichten sind daraus abgeleitete Ausschnitte. |
| Abschluss und Ergebnisse | Keine gespeicherte Einheits-Mastery | Weiter abgeleitet; kein Rückwärtsschreiben auf Ziele und keine Anerkennung aus `after`. |
:::

Der [Paketvertrag 1.2](repo:contracts/curriculum-package/v1.2/README.md) trägt die drei bestehenden Einheiten mit `learningUnitsV1`; die [Stufenplan-Grundlage](repo:contracts/curriculum-package/v1.3/README.md) ist davon getrennt. `validate:learning-units` prüft weiter den alten Vertrag, einschließlich R1, R3 und eindeutiger `own`-Zuordnung. Er ist noch kein allgemeiner E1-bis-E4-Validator des neuen Modells. Geänderte Ziele oder Prüfungen brauchen aktuelle Nachweise; unveränderte historische Nachweise und das eingefrorene V9-Reduktionsregister bleiben unverändert. Eine Normänderung, neue Platzierung oder neue Einheit schreibt kein Lernergebnis.

### Abschluss ohne zusätzlich gespeicherte Unit-Mastery {#sec:unit-completion}

Die vollständige Einheit ist abgeschlossen genau dann, wenn ihre eigenen Ziele erfüllt und alle verpflichtenden Untereinheiten abgeschlossen sind:

:::equation {#eq:unit-complete}
\Complete(U) \iff \bigl(\Own(U) \subseteq \Meff\bigr) \;\land\; \bigwedge_{V \in \Children(U)} \Complete(V).
:::

Es entsteht keine gespeicherte `UnitMastery`. Prüfungs- und Memorierziele bleiben explizit; eine Elternprüfung ersetzt weder Kindprüfung noch verifizierten Kartenabruf. Die Syntheseprüfung ist eine eigene zusätzliche Pflicht. Eine Kartensammlung allein belegt keine selbstständige Anwendung; eine Kind-Abrufpflicht wird nicht zum künstlichen Kindabschluss auf die Eltern verschoben.

Der Abschluss des im Personal Curriculum benötigten **Anteils** ist kein Vollabschluss der ganzen Einheit. Nur tatsächlich notwendige Atome kommen in $L$; eine Einheitsanzeige fügt keine weiteren Prüfungen oder Inhalte hinzu. Die vollständige Einheitsbehauptung wird weiterhin am ganzen $T(U)$ gemessen.

::figure{id="fig:recursive-unit"}

### Anerkennung vor dem Gesamtabschluss {#sec:unit-early-recognition}

Die Mengenrechnung in Abschnitt~@ref{sec:assessment} bleibt unverändert und ist noch kein produktiv eingeführter globaler Anerkennungsvertrag. Anerkennung betrifft nur eigene gewöhnliche Ziele eines gültigen, revisionsgebundenen lokalen Prüfungsvertrags. Solange eine offene eigene Prüfung oder ein offenes eigenes Memorierziel eine Kompetenz noch benötigt, bleibt sie in der offenen Nachfrage. Eine unabhängige Karte oder Kindeinheit darf offen bleiben, ohne eine bereits gültige Anerkennung zurückzunehmen. Eine Elternprüfung vergrößert den Anerkennungsumfang nicht auf alle Nachfahren; eine noch offene Synthese nimmt gültige Kindanerkennung nicht zurück. Ohne eigenen Prüfungsvertrag erkennt eine Einheit nichts an.

### `after`, atomarer Bedarf und Regeln E1 bis E4 {#sec:unit-progression}

`U after V` heißt: Im vorgesehenen Lernfluss ist V vollständig abgeschlossen, bevor U beginnt. Es steht nur zwischen Einheiten, die Kinder derselben Einheit sind, gegebenenfalls der gedachten Wurzel. Es ordnet alle Atome von U nach allen Atomen von V. Vererbt wird Reihenfolge, niemals Bedarf. `requires` steht dagegen ausschließlich zwischen atomaren Zielen und fordert die bezeichnete Kompetenz. Es fordert keinen ganzen Einheitsabschluss. Im Zielmodell zeigt keine Voraussetzung auf ein Prüfungsziel.

:::table {#tab:unit-ordering caption="Verbindliche Ordnungsregeln; jede Gliederung wird gesondert geprüft." cols="14mm,X"}
| Regel | Anforderung |
| --- | --- |
| E1 Baum | Einheiten sind ineinander geschachtelt oder ohne gemeinsame Atome; jedes enthaltene Ziel hat höchstens eine kleinste Einheit. Im vollständigen Landesplan hat jedes Ziel genau einen Lernplatz. R4 ist diese Eindeutigkeit in der Sprache des lokalen Prüfungsvertrags. |
| E2 An einem Stück lernbar | Es gibt eine Reihenfolge aller Atome, die jeden direkten und transitiven Bedarf und jedes `after` einhält und jede Einheit als zusammenhängenden Block enthält. |
| E3 Vollständig | Braucht a das Ziel b, entscheidet die kleinste Einheit, die beide enthält, beziehungsweise die gedachte Wurzel. Liegen a und b dort in zwei verschiedenen Kind-Einheiten, muss das Kind von a über die erklärte `after`-Hülle nach dem Kind von b liegen. Ist mindestens ein Kind ein eigenes Atom, ordnet der Bedarf selbst. |
| E4 Sparsam | Unter den Kindern derselben Einheit folgt kein erklärtes `after` schon aus den übrigen dort erklärten `after`. Die kanonische und die Landesgliederung werden getrennt geprüft. |
:::

E2 wird an den Kindern jeder Einheit einschließlich der gedachten Wurzel geprüft. Eine gerichtete Kante von Kind X nach Kind Y entsteht, wenn X `after` Y erklärt oder ein Atom in X ein Atom in Y braucht. Dieser Kindgraph muss azyklisch sein; die inneren Kindgraphen werden ebenso geprüft. Ein atomarer DAG allein genügt nicht: Bei $a\to b\to c$, $\Own(U)=\{a,c\}$ und $\Own(V)=\{b\}$ entsteht zwischen U und V ein Kreis. Umgruppierung oder fachlich begründete feinere Ziele reparieren ihn; die Diagnose erfindet keine Einheitssperre.

E3 misst die tatsächlichen atomaren Bedarfe an der erklärten Ordnung. Ein fachliches `after` wird nicht überflüssig, weil die Reihenfolge der Landesjahrgänge dieselbe Ordnung herstellt: E4 gilt je Deklarationsschicht. Die atomare Normalform $R\subseteq A\times A$ und ihre transitive Minimalität bleiben eigene Pflichten; die harte G17-Prüfung umfasst unverändert die vollständigen 21 kanonischen Gymnasialwurzeln. Ein neues E4-Gate wird daraus nicht behauptet.

:::principle {title="Keine Einheitssperre; GD-U14 ist abgelöst"}
Das früher offene Zugangsprofil `GD-U14` mit `Open` und `Cleared` entfällt im verbindlichen Zielmodell durch B9 vom 14. November 2026. `after` ändert weder Frontier noch Fokusregeln, direkten Prüfungszugang, gespeicherte Ergebnisse oder Anerkennung. Die geplante Lernweise „Einheit für Einheit“ reiht nur bereits erreichbare Angebote; ausdrückliche Lernendenwahl und Lernplanvorrang bleiben. Diese Laufzeitwahl F13 ist noch nicht umgesetzt. Die Ablösung behauptet keine erfolgte Entfernung historischer Codepfade.
:::

Für die vollständigen Landespläne sind Sekundarstufe I und II die einzigen Wurzelkinder, II `after` I. Kein Atom der früheren Stufe darf ein Atom der späteren benötigen, auch nicht transitiv und auch nicht als Vorbereitung. Ein Befund wird durch fachlich korrigierte Voraussetzungen, Teilung, belegtes Vorziehen oder gekennzeichnete Vorbereitung repariert. Keine Sicht schwächt Bedarf ab oder verdeckt Rückgriffe. Die Einführung folgt Bericht, Ursachenbehebung, Sperrklinke und hartem Gate bei null Verstößen; kein neuer vollständiger Landesplan ist damit bereits abgenommen.

:::sources
[Verbindliches Einheitenkonzept](repo:docs/concept/skill-graph/learning-unit-wiring-concept-2026-11-14.md); [Stufenentscheidungen und Übergabe](repo:docs/dev/stage-plan-units-handover-2026-11-15.md); [Stufenplan-Grundlage](repo:contracts/curriculum-package/v1.3/README.md); [Anerkennung und globaler Abschluss](repo:docs/concept/skill-graph/assessment-gated-completion.md).
:::
