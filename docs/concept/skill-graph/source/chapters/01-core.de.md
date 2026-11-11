## Ziele, Identität und Beziehungen {#sec:core}

Die Abschnitte~@ref{sec:core} bis~@ref{sec:filters} bilden den formalen Kern. Dieser Abschnitt führt Ziele und die beiden verfassten Kantenarten ein. Abschnitt~@ref{sec:relations} leitet daraus die Relationen ab, mit denen gerechnet wird, Abschnitt~@ref{sec:validity} nennt die Gültigkeitsbedingungen. Abschnitt~@ref{sec:state} beschreibt den Lernzustand einer Person und Abschnitt~@ref{sec:filters} die Auswertung in einem Ausschnitt des Graphen.

### Das Grundobjekt {#sec:core-object}

Der normative Kern ist ein endlicher gerichteter Graph

$$
\mathcal G=(G,C,R),\qquad C,R\subseteq G\times G.
$$

$G$ ist die Menge der Lernziele. $C$ steht für `contains`: Ein Ziel enthält ein anderes. $R$ steht für `requires`: Ein Ziel setzt ein anderes voraus. Es gibt genau diese beiden *ausdrücklich verfassten* Kantenarten im Skill-Graphen; nur sie werden von Autorinnen und Autoren gespeichert. Abgeleitete Relationen, curriculare Platzierungen, Quellenzuordnungen und Nachweise sind andere Modellschichten.

Ein Paar $(x,y)$ ist gerichtet. Für jede Relation $X$ auf $G$ bezeichnet

$$
X^{-1}=\{(y,x)\mid(x,y)\in X\}
$$

die Umkehrrelation und $X^+$ die transitive Hülle: $(x,y)\in X^+$ gilt genau dann, wenn ein gerichteter $X$-Pfad mit mindestens einer Kante von $x$ nach $y$ führt. Pfade der Länge null zählen nicht. Eine Relation $X$ heißt *azyklisch*, wenn kein Ziel über einen solchen Pfad zu sich selbst zurückführt, also $\forall g\in G:(g,g)\notin X^+$ gilt. Ein gerichteter azyklischer Graph heißt kurz DAG. Die Vereinigung $C\cup R$ ist *nicht* die Relation, an der pauschal alle DAG-Bedingungen geprüft werden: Beide Kantenarten haben verschiedene Bedeutungen. Abschnitt~@ref{sec:validity} nennt die Relationen, die azyklisch sein müssen.

Abbildung~@ref{fig:overview} zeigt beide Kantenarten an einem Beispiel.

:::principle {title="Die Pfeilrichtung ist Teil der Definition"}
$k\xrightarrow{\mathtt{contains}}c$: Der Cluster $k$ enthält das Ziel $c$. $g\xrightarrow{\mathtt{requires}}p$: Das Ziel $g$ setzt $p$ voraus; kurz: $g$ benötigt $p$. Eine Lernablaufdarstellung zeigt dagegen $R^{-1}$: von der Voraussetzung zur darauf aufbauenden Kompetenz. Diese Umkehrung muss beschriftet sein.
:::

::figure{id="fig:overview"}

### Attribute und stabile Identität {#sec:core-attributes}

Jedes Ziel trägt drei normative Basisattribute. Sie sind totale Abbildungen, also für jedes Ziel definiert:

$$
\Id:G\to\mathrm{UUID},\qquad \Title:G\to\Sigma^*,\qquad \Weight:G\to\R_{>0}.
$$

$\Id$ ist injektiv: Verschiedene Ziele haben verschiedene IDs. Die UUID bleibt über Platzierungen, Sprachfassungen und Ansichten hinweg die kanonische Identität. Kurze Buchstaben in diesem Dokument sind nur mathematische Bezeichner, keine Aussage zum serialisierten ID-Format.

Zwei weitere Attribute sind Teilabbildungen ($\rightharpoonup$), also nicht für jedes Ziel definiert. Ein optionaler $\ShortKey:G\rightharpoonup\Sigma^*$ ist innerhalb einer logischen Skill-Landschaft eindeutig, also innerhalb des zusammengehörigen Zielbestands eines Curriculums. Mehrere Sprachdateien desselben Ziels dürfen dasselbe Paar aus ID und ShortKey wiederholen. Die Teilabbildung $\PhaseCompat:G\rightharpoonup P_{\mathrm{compat}}$ beschreibt dagegen Kompatibilitäts- oder Anzeigemetadaten, häufig im Feld `phase`. Sie definiert weder kanonische Identität noch die fachliche Lernreihenfolge. Weitere gebräuchliche Felder ordnet Tabelle~@ref{tab:attributes} ein.

:::table {#tab:attributes caption="Ergänzende Zielattribute und ihre begrenzte Bedeutung." cols="29mm,X"}
| Feld | Fachliche Bedeutung außerhalb des minimalen Kerns |
| --- | --- |
| `description` | Verständlicher, überprüfbarer Zieltext; typischerweise „Die lernende Person kann …“. Orientierungsziele haben eine eigene Semantik (Abschnitt~@ref{sec:goal-types}). |
| `area`, `tags` | Fachliche Einordnung und Metadaten; ein Tag ersetzt keine autoritative Entscheidung über Zieltyp oder Geltungsbereich. |
| `level` | Schwierigkeit beziehungsweise Anforderungsbereich; keine fachliche Lerneinheit und keine Personalisierungsstufe. |
| `core` | Kernziel versus Erweiterung im jeweiligen Vertrag; eine Erweiterung kann im gewählten Profil trotzdem verbindliches Ziel sein. |
| `weight` | Anteil bei Fortschrittsaggregation; keine Zeitdauer, keine fachliche Nachweisstärke und keine Bestehenswahrscheinlichkeit. |
| `examples` | Referenzen auf Beispiele oder Aufgaben; Vorhandensein beweist keine Aufgabenqualität oder Kompetenzbeherrschung. |
| `resourceLinks` | Bestehendes Referenzfeld unter anderem für eigene Visualisierungen, offizielle Quellen und Altlinks. Neue optionale externe Lernmaterialien gehören nach aktuellem Vertrag in getrennte Inhaltspakete. |
:::

### Atomare Ziele und Cluster {#sec:core-atoms-clusters}

Die *strukturelle* Klassifikation folgt allein aus $C$:

$$
A=\{g\in G\mid\nexists c\in G:(g,c)\in C\},\qquad K=G\setminus A.
$$

Ein Ziel ohne `contains`-Kinder ist *atomar* (ein Atom, ein Blatt); jedes andere Ziel ist ein *Cluster*. Ein Ziel kann mehrere Eltern haben: Der kanonische `contains`-Graph darf eine Polyhierarchie sein. Explizite Metadaten zur Klassifikation müssen dazu passen.

Strukturelle Atomarität bedeutet nicht automatisch *semantische* Atomarität. Ein Blatt mit fünf unabhängigen Teilkompetenzen bleibt formal ein Blatt, kann jedoch die Qualitätsprüfung verfehlen.

Neben dem Strukturtyp hat ein atomares Ziel einen pädagogischen *Zieltyp*. Der Normalfall ist das *Inhaltsziel*; Orientierung, Memorierung und Prüfungen sind besondere pädagogische Arten:

- Ein **Inhaltsziel**, das gewöhnliche fachliche Lernziel, beschreibt fachliches Verstehen oder Können.
- Ein **Orientierungsziel** beschreibt den motivierenden Einstieg.
- Ein **Memorierziel** beschreibt den kontrollierten Abruf erforderlicher Karten.
- Ein **Prüfungsziel** beschreibt eine bewertete Aufgabe mit eigenem Bestehenskriterium.

Abschnitt~@ref{sec:goal-types} erläutert, wann ein Ziel des jeweiligen Typs als geschafft gilt. Diese Arten sind keine zusätzlichen Strukturtypen und keine Programmabschnitte.

## Containment, Voraussetzungen und Vererbung {#sec:relations}

Aus den beiden verfassten Kantenarten entstehen die Relationen, mit denen Verfügbarkeit, Fortschritt und Abschluss berechnet werden. Tabelle~@ref{tab:relations} gibt die Übersicht; die folgenden Unterabschnitte definieren ihre Einträge der Reihe nach.

:::table {#tab:relations caption="Verfasste und abgeleitete Relationen. Im Zielzustand gilt $R=R_A=\Reff=\Rat$; abgeleitet wird dann nur noch die Hülle $\Rat^+$." cols="15mm,45mm,X"}
| Symbol | Name | Entstehung und Verwendung |
| --- | --- | --- |
| $C$ | Containment | Verfasste `contains`-Kanten. Sie gliedern die Ziele und bestimmen Atome, Cluster und atomare Basis. |
| $R$ | verfasste (direkte) Anforderungen | Gespeicherte `requires`-Kanten. Im Zielzustand verbinden sie nur Atome. |
| $\Reff$ | effektive Anforderungen | $R$ zusammen mit den Anforderungen, die ein Ziel von seinen `contains`-Vorfahren erbt. |
| $\Rat$ | atomar normalisierte Anforderungen | Jede effektive Voraussetzung ist durch ihre atomare Basis ersetzt; es bleiben nur Paare von Atomen. |
| $\Rat^+$ | transitive Hülle | Alle über Ketten erreichbaren Voraussetzungen. Grundlage von Bedarf, Frontier und impliziter Beherrschung. |
| $R_A$ | direkt atomar verfasste Anforderungen | $R\cap(A\times A)$; Grundlage der Routenprüfung in Abschnitt~@ref{sec:routes}. |
:::

### Hierarchie und atomare Basis {#sec:hierarchy}

Für den endlichen azyklischen Containment-Graphen gelten

$$
\begin{aligned}
\Anc(g)&=\{k\in G\mid(k,g)\in C^+\},\\
\Desc(g)&=\{d\in G\mid(g,d)\in C^+\},\\
\Atoms(g)&=\begin{cases}\{g\},&g\in A,\\\Desc(g)\cap A,&g\in K.\end{cases}
\end{aligned}
$$

$\Anc(g)$ enthält die Vorfahren von $g$, $\Desc(g)$ seine Nachfahren und $\Atoms(g)$ seine *atomare Basis*. Jeder Vorfahr hat Kinder und ist deshalb ein Cluster. Die Kurzformen $\Anc$ und $\Desc$ entsprechen den Bezeichnern `Ancestors` und `Descendants` der ursprünglichen Spezifikation und ihrer Abbildungen.

Jeder Cluster besitzt mindestens ein atomares Blatt: In einem endlichen azyklischen Graphen endet jeder absteigende Pfad nach endlich vielen Schritten bei einem Ziel ohne Kinder. Deshalb ist $\Atoms(g)$ für jedes Ziel nichtleer. Ein Knoten ohne Kinder ist atomar, kein leerer Cluster. Bei mehreren Pfaden zählt ein Atom in der Menge nur einmal. Abbildung~@ref{fig:contains} zeigt direkte und indirekte Zugehörigkeit.

::figure{id="fig:contains"}

### Direkte Anforderungen sind konjunktiv {#sec:direct-requires}

$(g,p)\in R$ bedeutet: $g$ setzt $p$ voraus. Die Kante heißt eine *Anforderung* von $g$, das Ziel $p$ eine *Voraussetzung* von $g$. Mehrere ausgehende Kanten bedeuten *alle* Voraussetzungen, keine Auswahl. Alternativen brauchen einen eigenen Auswahlvertrag außerhalb dieser Relation. Die Relation $R$ muss azyklisch sein. Abbildung~@ref{fig:requires} zeigt vier direkte Anforderungen.

Nach der verbindlichen Entscheidung vom 8. November 2026 gilt im kanonischen Zielzustand

:::equation {#eq:atomic-target}
R\subseteq A\times A.
:::

Diese Eigenschaft heißt *atomare Normalform*: *Alle* verfassten Anforderungen haben atomare Quell- und Voraussetzungsziele. Auch eine universelle Clusteranforderung, die für alle Nachfahren eines Clusters gelten soll, ist keine bleibende Ausnahme. Cluster dienen der Gliederung und abgeleiteten Übersicht.

Daten, die noch Anforderungen von oder an Cluster enthalten, heißen in diesem Dokument *Übergangsbestand*. Bestehende Clusteranforderungen behalten im Übergang ihre Lesesemantik: Eine am Cluster verfasste Anforderung gilt durch Vererbung für alle Nachfahren; ein Cluster als Voraussetzung wird in seine Atome expandiert (Abschnitt~@ref{sec:effective}). Diese Kompatibilität erfüllt noch nicht den kanonischen Zielzustand.

::figure{id="fig:requires"}

### Effektive Anforderungen {#sec:effective}

Damit auch der Übergangsbestand eindeutig gelesen wird, bereiten drei Schritte die verfassten Anforderungen auf: erst vererben, dann atomar expandieren, dann die transitive Hülle bilden. Diese Reihenfolge gilt überall, wo dieses Dokument mit Voraussetzungen rechnet.

#### Schritt 1: Vererben.

Die effektive Relation liest auch bestehende Clusteranforderungen. Sie entsteht aus eigenen und von Vorfahren geerbten direkten Anforderungen:

:::equation {#eq:effective}
(g,p)\in\Reff\iff (g,p)\in R\ \lor\ \exists k\in\Anc(g):(k,p)\in R.
:::

Dabei sind

$$
R_{\mathrm{inherited}}=\Reff\setminus R,\qquad \Reff=R\cup R_{\mathrm{inherited}},\qquad \Pre_{\mathrm{eff}}(g)=\{p\mid(g,p)\in\Reff\}.
$$

Mehrere Elternpfade addieren Anforderungen als Mengenvereinigung, ohne Mehrfachzählung. *Vererbung* in @eqref{eq:effective} und *transitive Hülle* $\Reff^+$ sind verschiedene Operationen: Vererbung überträgt die Anforderungen der Vorfahren entlang von `contains` auf die Nachfahren; die Hülle folgt Ketten von Anforderungen. Abbildung~@ref{fig:inheritance} zeigt eine geerbte Anforderung.

::figure{id="fig:inheritance"}

#### Schritt 2: Atomar expandieren.

Für die Laufzeit wird zuerst auf Atome normalisiert. Jede effektive Voraussetzung wird durch ihre atomare Basis ersetzt:

$$
\Rat=\{(a,b)\in A\times A\mid \exists p\in G:(a,p)\in\Reff\land b\in\Atoms(p)\}.
$$

#### Schritt 3: Hülle bilden.

Die transitive Hülle $\Rat^+$ enthält damit auch Pfade, die nach der Expansion einer Clusteranforderung weiterführen. Mastery eines Zwischenziels unterbricht diese Hülle nicht. Auch in Abschnitt~@ref{sec:assessment} bleibt $\Rat$ die Bezeichnung dieser normalisierten Relation; $R$ bezeichnet weiterhin die verfassten Kanten.

Abbildung~@ref{fig:atomic-expansion} zeigt die Schritte 2 und 3 an einer Clusteranforderung. Die externe Grundlage $\nd{c}$ bleibt nach der Expansion von $\nd{K}$ über $\nd{a}$ erreichbar.

::figure{id="fig:atomic-expansion"}

#### Der atomare Bedarf eines Ziels.

Mehrere spätere Formeln fragen dasselbe: Welche Atome setzt ein Ziel insgesamt voraus? Für ein beliebiges Ziel $g$ seien

:::equation {#eq:demand}
\begin{aligned}
B(g)&=\bigcup_{p\in\Pre_{\mathrm{eff}}(g)}\Atoms(p),\\
\ReqAtoms(g)&=B(g)\cup\{b\in A\mid\exists a\in B(g):(a,b)\in\Rat^+\}.
\end{aligned}
:::

$\ReqAtoms(g)$ heißt der *atomare Bedarf* von $g$ (in älteren Fassungen $D(g)$). Für ein Atom $g$ ist $\ReqAtoms(g)=\{b\in A\mid(g,b)\in\Rat^+\}$. Für einen Cluster beschreibt der Bedarf dessen eigene und geerbte Anforderungen, ohne die eigenen Kinder als zusätzliche Voraussetzungen zu behandeln. Der Bedarf hängt nur vom Graphen ab, nicht vom Lernzustand. In Abbildung~@ref{fig:atomic-expansion} ist $\ReqAtoms(\nd{g})=\{\nd{a},\nd{b},\nd{c}\}$.

Im vollständig atomar verfassten Zielzustand gilt $\Reff=R=\Rat$: Containment-Vorfahren sind Cluster und tragen dann keine ausgehenden Anforderungen. Transitive Ketten bleiben als Graphstruktur relevant.

## Gültigkeit, Minimalität und Lernbarkeit {#sec:validity}

### Verbindliche Bedingungen {#sec:mandatory-validity anchors="73-atomic-transitive-minimality-and-ordered-migration-g17,73-transitive-minimality"}

Ein vollständiger Graph erfüllt den kanonischen Zielzustand genau dann, wenn neben den Attribut- und Identitätsbedingungen aus Abschnitt~@ref{sec:core} auch die atomare Normalform @eqref{eq:atomic-target}, die Azyklizität und die atomare transitive Minimalität gelten:

:::equation {#eq:acyclic}
\forall g\in G:\ (g,g)\notin C^+,\quad (g,g)\notin R^+,\quad (g,g)\notin\Reff^+,\quad (g,g)\notin\Rat^+,
:::

:::equation {#eq:atomicmin}
\forall(a,b)\in R:\quad (a,b)\notin\bigl(R\setminus\{(a,b)\}\bigr)^+.
:::

Bedingung~@eqref{eq:acyclic} verlangt, dass keine der vier Relationen ein Ziel auf sich selbst zurückführt. Bedingung~@eqref{eq:atomicmin} verlangt, dass keine verfasste Anforderung über die übrigen bereits erreichbar ist. Identitäten und Referenzen müssen auflösbar sein; unbekannte Knoten sind keine erfüllten Voraussetzungen.

#### Zur Azyklizität.

Die DAG-Bedingung für $R$ folgt bereits aus derjenigen für $\Reff$, weil $R\subseteq\Reff$. Sie bleibt als verständliche eigenständige Autorenprüfung aufgeführt. Unabhängig davon bleibt die Azyklizität von $C$ erforderlich. Direkte Azyklizität allein genügt nicht, weil Vererbung einen Zyklus erzeugen kann (Abbildung~@ref{fig:cycles}). Ebenso bleibt ein durch atomare Expansion entstehender Selbstzyklus ein Modellfehler, auch wenn die unexpandierten Kanten azyklisch aussehen.

::figure{id="fig:cycles"}

#### Zur transitiven Minimalität.

In der atomaren Kette $\nd{Q}\to\nd{B}\to\nd{A}$ ist eine zusätzliche Kante $\nd{Q}\to\nd{A}$ redundant und zu entfernen. Die verbleibende Hülle fordert $\nd{A}$ weiterhin, auch wenn $\nd{B}$ bereits gemeistert ist. Transitive Paare werden nicht als zusätzliche Direktkanten gespeichert. Die verbindliche transitive Minimalität vom 4. November 2026 bleibt bestehen; die Entscheidung vom 8. November 2026 legt die atomare Normalform als Zielzustand und die Migrationsreihenfolge fest.

Die interne Prüfbezeichnung `G17` steht hier für die vollständige atomare Normalform und die vollständige transitive Minimalitätsprüfung des deklarierten kanonischen Fachbestands. Sie umfasst den nötigen fachfremden Voraussetzungsbestand und vererbende Vorfahren; ein Teilscan oder ein einzelnes Routenprofil genügt dafür nicht.

#### Verbindliche Migrationsreihenfolge.

Der Weg vom Übergangsbestand zum Zielzustand hat drei Schritte in fester Reihenfolge. Bei unverändertem $C$ und stabilen Zielidentitäten gilt:

1. **Atomare Anforderungen sichern.** Zuerst die vollständigen, im Review geprüften atomaren Anforderungen materialisieren oder erhalten. Die bestehende Bedeutung wird mit der Relation $\Rat$ aus Abschnitt~@ref{sec:effective} ermittelt: erst vererben, dann Clusterziele expandieren, dann die Hülle bilden. Die vollständige Hülle bedeutet nicht, sämtliche transitiven Paare als Direktkanten zu verfassen. Atomare Kanten dürfen nicht zugunsten ihrer geerbten Clusterentsprechung entfernt werden.
2. **Clusteranforderungen entfernen.** Danach jede Anforderung mit nichtatomarem Quell- oder Voraussetzungsziel erst nach dem Nachweis entfernen, dass die verfassten atomaren Beziehungen ihren vollständigen atomaren Bedarf abdecken. Im Zielzustand bleiben keine solchen Clusterkanten, auch keine universellen.
3. **Transitiv reduzieren.** Erst anschließend die atomare Relation transitiv reduzieren und dabei ihre vollständige Voraussetzungshülle erhalten.

Der Nachweis muss für den gesamten Übergang insbesondere ergeben:

$$
(\Rat^{\mathrm{vorher}})^+ = (\Rat^{\mathrm{nachher}})^+ = R_{\mathrm{nachher}}^+,\qquad R_{\mathrm{nachher}}\subseteq A\times A.
$$

Die atomare Voraussetzungshülle bleibt also gleich, und nach der Migration erzeugen die verfassten Kanten sie allein. Zusätzlich sind die relevanten Scope-, Anwendbarkeits-, Zielmengen-, Frontier-, Abschluss- und Mastery-Verträge zu erhalten. Hüllengleichheit allein beweist diese weiteren Verträge nicht; dazu gehören direkt atomare Routen und ausdrücklich verfasste Projektionsrollen. Rohe Erreichbarkeit zwischen nichtatomaren Zielknoten darf sich beim Entfernen der Clusterkanten ändern. Die Migration erfindet weder automatisch fachliche Abhängigkeiten noch Rollen und schreibt keine Lernergebnisse. Widersprüchliche Altansprüche brauchen eine gesonderte fachliche Klärung.

#### Diagnosen im Übergangsbestand sind keine Löschanweisung.

Zwei ältere Prüfungen bleiben als Diagnose nützlich. Keine von ihnen erlaubt, eine atomare Kante zu löschen, solange eine Clusteranforderung denselben Bedarf noch trägt.

Die frühere *lokale Minimalitätsbedingung* lautet

:::equation {#eq:localmin}
(g,p)\in R\Longrightarrow \nexists k\in\Anc(g):(k,p)\in R.
:::

Sie zeigt direkte Dubletten geerbter Anforderungen, darf aber keine atomare Kante zugunsten einer Clusterkante beseitigen. Tragen ein atomares $q$ und sein Cluster-Vorfahr $k$ beide die Anforderung an das atomare $p$, bleibt $q\to p$ bei der Atomarisierung erhalten. Nach vollständiger atomarer Abdeckung wird $k\to p$ entfernt. Im Zielzustand gilt @eqref{eq:localmin} automatisch, weil Cluster keine ausgehenden Anforderungen mehr tragen.

Der bisher unter `G17` verwendete *Entfernungstest* ist ebenfalls eine Diagnose des Übergangsbestands: Er bildet für jede verfasste Kante $e=(g,p)$ die Relation $R'=R\setminus\{e\}$ und berechnet $\Reff'$ mit unverändertem $C$ neu. Er diagnostiziert Redundanz durch $(g,p)\in(\Reff')^+$. Abbildung~@ref{fig:inherited-redundancy} zeigt diesen mathematisch korrekten Befund im Übergangsbestand und zugleich den Gegenfall zur falschen Löschpräferenz: Der alternative Pfad hängt noch von einer Clusteranforderung ab.

::figure{id="fig:inherited-redundancy"}

#### Was die heutigen Prüfungen belegen.

Der heutige Entfernungsauditor prüft noch das alte effektive Kriterium auf Zielknoten; sein Bestehen beweist die neue Migrationspriorität nicht. Erst im atomaren Zielzustand entspricht dieses Kriterium der Minimalität aus @eqref{eq:atomicmin}. Die Norm ist keine Behauptung bereits vollständiger Datenmigration oder CI-Durchsetzung.

Zwei Regelfamilien prüfen heute Teile des Zielzustands: das *Curriculum-Quality-Review* (CQR) und die *graph-validation rollout rules* (GVR). Die Prüfung direkt atomarer Fachrouten heißt `CQR-102`; die harte vollständige Routenprüfung der Mathematikprofile Sek I und Sek II heißt `GVR-012`. Beide verlangen bereits in ihrem jeweiligen Scope, also ihrem benannten Prüfumfang, direkt atomare Routen; geerbte Clusterpfade liefern dort keinen Ersatz. Die Codelegende steht in Anhang~@ref{sec:rule-code-legend}.

### Zusatzprofile und Gegenbeispiele {#sec:profiles}

Ein Baumprofil kann höchstens einen Elternknoten fordern:

$$
\forall c\in G:\quad \bigl|\{k\in G\mid(k,c)\in C\}\bigr|\leq1.
$$

Dies ist keine Grundbedingung der Polyhierarchie. Ebenso sind Anforderungen an eigene Vorfahren unerwünscht und in bestimmten Validatorprofilen verboten. Anforderungen an eigene Nachfahren erzeugen durch Vererbung sogar eine effektive Selbstabhängigkeit und scheitern bereits am DAG-Vertrag.

:::principle {title="Ein DAG ist noch kein Beweis der Lernbarkeit"}
Als Gegenbeispiel aus dem Übergangsbestand seien $G=\{k,a\}$, $C=\{(k,a)\}$ und $R=\{(a,k)\}$: Der Cluster $k$ enthält das Atom $a$, und $a$ setzt $k$ voraus. Die direkten und effektiven Relationen sind azyklisch und minimal. Aber $\Atoms(k)=\{a\}$: Um $a$ zu beginnen, müsste $a$ schon erfüllt sein. Die globale Frontier aus leerem Lernzustand ist leer. Die Clusteranforderung verfehlt bereits die atomare Normalform. Außerdem enthält die vollständig atomar normalisierte Relation die Selbstabhängigkeit $(a,a)$ und verletzt damit die Azyklizität. Ein Abschlusszeuge (Abschnitt~@ref{sec:witness}) würde denselben Fehler sichtbar machen.
:::

Deshalb müssen drei Aussagen getrennt bleiben:

1. Der Grundgraph ist gültig.
2. Die gewählte Projektion ist gültig.
3. Die Zielmenge ist aus einem deklarierten Eintrittszustand vollständig erlernbar.

Ein grüner einzelner Validator beweist nicht automatisch alle drei Aussagen.

### Didaktische Routen von Orientierung zu Autonomie {#sec:routes anchors="85-didactic-route-coverage-motivation-to-autonomy"}

Eine didaktische Route führt vom motivierenden Einstieg über das fachliche Lernen zur selbstständigen Leistung. Seien dazu $O\subseteq A$ die Orientierungsanker (Motivationsanker), $Z\subseteq A$ die terminalen Autonomieziele, also die Endziele selbstständiger Leistung, und $E_{\mathrm{route}}\subseteq A$ explizit ausgenommene Unterstützungsziele. Die direkte atomare Relation sei $R_A=R\cap(A\times A)$. Ohne Ausnahmeprofil gilt $E_{\mathrm{route}}=\varnothing$; Ausnahmen benötigen einen dokumentierten, maschinenlesbaren Auswahlvertrag. Ein Atom $a\in A\setminus E_{\mathrm{route}}$ ist *routenabgedeckt*, wenn

$$
\begin{aligned}
\exists o\in O,\ z\in Z:\quad &(a=o\ \lor\ (o,a)\in(R_A^{-1})^+)\\
{}\land\;&(a=z\ \lor\ (a,z)\in(R_A^{-1})^+).
\end{aligned}
$$

In Worten: Das Atom liegt auf mindestens einem Lernweg, der bei einem Orientierungsanker beginnt und bei einem terminalen Autonomieziel endet. Der Lernweg folgt $R_A^{-1}$, also der Lernablaufrichtung von der Voraussetzung zum darauf aufbauenden Ziel.

Die Buchstaben $O$ und $Z$ (in älteren Fassungen $M$ und $T$) vermeiden hier Verwechslungen mit der Mastery-Menge $M$ sowie den Zielmengen $T(U)$ und $T_\pi$. Die Beschränkung auf $R_A$ verhindert, dass ein Cluster als versteckter Zwischenknoten einen atomaren Routennachweis liefert. Diese Formel ist ein Strukturkriterium, kein Beweis didaktischer Angemessenheit.

Konkrete Routenprofile schränken zusätzlich die Schulstufe, erlaubte Zieltypen und die Reihenfolge ein: Orientierung am Einstieg, fachliches Lernen, bei Bedarf Unterstützung durch Memorierziele und eine selbstständige Leistung am Ende. Memorierziele werden dadurch nicht überall Pflicht. Die Profilregeln prüfen unterschiedliche Aussagen: vollständige Routen über effektive Voraussetzungen (`CQR-101`), direkt atomare Routen (`CQR-102`) und das Fehlen von `requires` an den selektierten Clustern (`CQR-103`). In den benannten Mathematikprofilen erzwingt `GVR-012` die vollständige direkt atomare Route; `GVR-013` prüft für die ausgewählten lokalen atomaren Ziele, die keine Memorierziele sind, dass ihre direkten lokalen Voraussetzungen atomare Ziele sind. Diese Profilprüfungen sind kein globaler Nachweis der atomaren Normalform für alle Fächer.

Eine Übersicht zwischen Clustern kann aus atomaren Routen abgeleitet werden. Beispielsweise bedeutet eine existenzielle Zusammenfassung $k_2\to k_1$:

$$
\exists a\in\Atoms(k_2),\ b\in\Atoms(k_1):(a,b)\in R_A^+.
$$

Eine prozentuale Abdeckung braucht darüber hinaus einen erklärten Nenner. Solche Übersichten erzeugen keine neuen direkten Clusteranforderungen.

## Lernzustand, Erfüllung und Fortschritt {#sec:state}

Die bisherigen Abschnitte beschreiben den Graphen ohne lernende Person. Dieser Abschnitt fügt ihren Lernzustand hinzu: was gespeichert wird, was daraus als effektiv beherrscht gilt, welche Ziele als Nächstes verfügbar sind und wie Fortschritt gezählt wird.

### Erfüllung statt Rückschluss auf Voraussetzungen {#sec:satisfaction}

#### Ausdrückliche Ergebnisse.

Es gibt genau einen gespeicherten binären Zustand $m:A\to\{0,1\}$, mit $M=\{a\in A\mid m(a)=1\}$. $M$ ist die Menge der ausdrücklichen Erfolge, kurz: die ausdrückliche Mastery. Ein ausdrücklicher Erfolg an einem Inhaltsziel belegt zielgerecht geprüftes Verstehen. Orientierung, Memorierung und Prüfungen verwenden ihren jeweils eigenen Abschlussvertrag (Abschnitt~@ref{sec:goal-types}). Keine Teilbewertung bildet einen dritten Mastery-Zustand.

#### Implizite Beherrschung im Vorgriff.

Die Abschnitte~@ref{sec:learning-units} und~@ref{sec:assessment} führen Lerneinheiten und die Ableitung impliziter Beherrschung ein. Hier genügt ihr Ergebnis: Für jede Lerneinheit $U$ mit einem für diese Person dauerhaft gültigen lokalen Vertrag wird die implizite Menge $I_U\subseteq A$ abgeleitet. Der Vertrag bindet die eigenen Erwerbsziele, ihre Revision und die fachlich geprüfte Bedeutung der zugehörigen Prüfungen. Bei Inhaltszielen belegt $I_U$ selbstständige Anwendung. Anschaulich kann eine bestandene Prüfung zu linearen Funktionen die Anwendung der eigenen Inhaltsziele von $U$ belegen, obwohl diese nicht einzeln abgehakt wurden. Eine unabhängige Kartenpflicht oder eine andere Kindeinheit kann noch offen sein; der vollständige Abschluss der Einheit ist keine Voraussetzung dieser Anerkennung. Ein abgeleiteter Orientierungsmarker behält ausschließlich die Bedeutung eines erledigten Einstiegs; er behauptet weder Fachkompetenz noch eine erfolgte Motivationsinteraktion.

#### Effektiv beherrschte Menge.

Die effektive globale Menge lautet

$$
\Meff=M\cup\bigcup_{U\in\mathcal U_{\mathrm{valid}}}I_U.
$$

Dabei enthält $\mathcal U_{\mathrm{valid}}$ die personen- und revisionsgebundenen, dauerhaft anwendbaren autoritativen lokalen Verträge, nicht nur die gerade sichtbaren Einheiten oder die neuesten Inhaltsfassungen. Die beiden Begründungsarten sind in ihrem effektiven Ergebnis gleichwertig: Sie erfüllen künftige Voraussetzungen, zählen zum IST und bleiben bei Fokus- oder Planwechsel wirksam. $I_U$ erzeugt keinen synthetischen Mastery-Datensatz. Abschnitt~@ref{sec:assessment} definiert die Ableitung und die fachlichen Voraussetzungen des Vertrags.

Alle folgenden Formeln verwenden $\Meff$. In den Originalabbildungen~@ref{fig:frontier} und~@ref{fig:filters} steht $M_A$ für die ausdrückliche Menge $M$. In diesen Beispielen gibt es keine implizite Beherrschung; dort ist $\Meff=M$.

#### Erfüllung.

Ein Ziel $g$, ob Atom oder Cluster, ist *erfüllt*, wenn seine gesamte atomare Basis effektiv beherrscht ist:

:::equation {#eq:sat}
\Sat(g,\Meff)\iff \Atoms(g)\ne\varnothing\ \land\ \Atoms(g)\subseteq\Meff.
:::

Die Erfüllung wirkt nur vorwärts. Ein bloß gemeistertes abhängiges Inhaltsziel beweist seine Voraussetzungen nicht. Nur ein gültiger lokaler Vertrag trägt die zusätzliche Ableitung. Clusterfortschritt schreibt niemals Ergebnisse seiner Kinder.

### Globale Frontier {#sec:frontier}

Die *Frontier* ist die Menge der nächsten verfügbaren atomaren Ziele:

:::equation {#eq:frontier}
\Frontier(\Meff)=\left\{g\in A\setminus\Meff\;\middle|\; \forall p\in A:\ (g,p)\in\Rat^+\Rightarrow p\in\Meff\right\}.
:::

Ein Atom gehört also zur Frontier, wenn es selbst noch offen ist und sein gesamter atomarer Bedarf effektiv beherrscht ist: $\ReqAtoms(g)\subseteq\Meff$. Die Frontier fordert die transitiven effektiven atomaren Voraussetzungen. Ein gemeistertes Zwischenziel unterbricht diese Prüfung nicht. Ein teilweise bearbeitetes Ziel ist nicht schon deshalb erfüllt. Ein Cluster als Voraussetzung wird über seine atomare Basis geprüft.

Für die Navigation lässt sich zusätzlich eine Clusterverfügbarkeit ableiten. Sie verwendet den atomaren Bedarf $\ReqAtoms(k)$ des Clusters aus @eqref{eq:demand}, also seine eigenen und geerbten Anforderungen, atomar expandiert und transitiv fortgesetzt:

$$
\Frontier_K(\Meff)=\{k\in K\mid\neg\Sat(k,\Meff),\ \ReqAtoms(k)\subseteq\Meff\}.
$$

Sie ersetzt die atomare Lernfrontier nicht. Eine Oberfläche kann darüber hinaus verbindliche Zugangs- und Auswahlregeln anwenden, etwa den Orientierungseinstieg. Die mathematische Frontier ist deshalb nicht automatisch identisch mit jedem angezeigten UI-Menü. Abbildung~@ref{fig:frontier} zeigt die Frontier des Beispiels.

::figure{id="fig:frontier"}

### Aggregation ohne Mehrfachzählung {#sec:aggregation}

Sei $S\subseteq A$ eine fest benannte Menge von Zielatomen und $w(a)>0$ das Fortschrittsgewicht des Atoms $a$. Der gewichtete Gesamtfortschritt ist der Gewichtsanteil der effektiv beherrschten Atome:

$$
P(S)=\frac{\sum_{a\in S\cap\Meff}w(a)}{\sum_{a\in S}w(a)}\qquad(S\ne\varnothing).
$$

Jedes Atom trägt mit seinem effektiven binären Ergebnis bei: ganz oder gar nicht. Für eine leere Zielmenge gibt es keinen solchen Quotienten; die Anzeige braucht „keine Ziele im gewählten Umfang“ statt erfundener 100 %. Für mehrere Cluster wird $S$ als Vereinigung ihrer Zielatome gebildet. Cluster und Kinder dürfen nicht zusätzlich gemeinsam gezählt werden. Ein Fortschritt von beispielsweise 50 % bezeichnet einen Anteil geschaffter Ziele im Umfang, keine halbe Beherrschung eines einzelnen Ziels.

Davon zu unterscheiden ist die segmentierte Erledigungsanzeige im Lernzielbaum: Sie kann ausdrücklich gespeicherte und implizit abgeleitete Beiträge getrennt ausweisen. Beide zählen in $P(S)$; ein vollständig gefüllter Gesamtbalken bedeutet $P(S)=1$. Eine gesonderte Zahl nur für ausdrückliche Ergebnisse muss ihren abweichenden Zähler benennen.

Bei der Konvention $w(a)=1$ entspricht das Clustergewicht der Zahl seiner eindeutigen atomaren Nachfahren. Das ist eine zulässige konkrete Autorenkonvention, keine Forderung gleicher Gewichte für jede Domäne. Kern- und Erweiterungsanteile können getrennt ausgewiesen werden; der verbindliche Zielumfang des Personal Curriculum entscheidet darüber, was zum Abschluss gehört. Eine aggregierte Zahl ist weder eine kalibrierte Wahrscheinlichkeit noch eine Schulnote. Ein Notenmodell bräuchte eine gesonderte, begründete Abbildung.

## Filter, Fokus und globale Diagnose {#sec:filters}

Bisher wurde der gesamte Graph ausgewertet. Eine Person arbeitet aber in einem Ausschnitt: längerfristig in ihrem Personal Curriculum (Personalisierungsstufe 2, kurz Level 2), vorübergehend in einem Fokus (Level 3). Dieser Abschnitt beschreibt jeden solchen Ausschnitt als Filter und legt die Reihenfolge fest: erst im ganzen Graphen ableiten, dann einschränken. Die Abschnitte~@ref{sec:context-model} und~@ref{sec:personal-scope} führen Personal Curriculum, Kompositionssicht und Projektionsrollen ausführlich ein.

### Filter als Prädikat und kompilierte Anwendbarkeit {#sec:filter-predicate anchors="112-filter-predicate-and-induced-subgraph"}

Ein Filter ist zunächst nur ein Prädikat $F:G\to\{0,1\}$ mit der Menge $G_F=\{g\mid F(g)=1\}$ der ausgewählten Ziele. Ein Filter kann aus dimensionaler *Anwendbarkeit* (`applicability`) berechnet werden, etwa nach Bundesland, Schulstufe oder Kursprofil. Dafür sei $D$ die Dimensionsmenge und $V_d$ das Vokabular von Dimension $d$. Eine formal typisierte Menge partieller Zuordnungen ist

$$
\mathcal V_D=\bigsqcup_{J\subseteq D}\prod_{d\in J}\Pow(V_d),\qquad \Applicability:G\rightharpoonup\mathcal V_D.
$$

Eine Anwendbarkeitsangabe nennt also für einige Dimensionen $J$ jeweils die zugelassenen Werte. Die disjunkte Vereinigung hält den jeweiligen Definitionsbereich $J$ fest. Eine fehlende Dimension ist im allgemeinen Metadatenfilter uneingeschränkt; eine vorhandene Dimension mit leerer Wertemenge lässt dagegen keinen konkreten Auswahlwert zu. Nur die Abfrage `ALL` ignoriert auch diese Einschränkung. Die Bedeutung fehlender Metadaten ist keine Erlaubnis, eine ungeklärte persönliche Schulstufenauswahl als vollständig aufgelöst zu behandeln.

Für eine aktive Auswahl $Q$ kann die Filterprüfung dimensionsweise erfolgen:

$$
F_Q(g)=1\iff\bigwedge_{d\in D_{\mathrm{aktiv}}}
\left\{
\begin{array}{l}
Q(d)=\mathrm{ALL},\ \text{oder}\ g\notin\operatorname{dom}(\Applicability),\ \text{oder}\\
d\notin\operatorname{dom}(\Applicability(g)),\ \text{oder}\\
Q(d)\in \Applicability(g)(d).
\end{array}\right.
$$

Ein Ziel passt also zur Auswahl, wenn für jede aktive Dimension einer der vier Fälle gilt: Die Abfrage lautet `ALL`; das Ziel trägt keine Anwendbarkeitsangabe; die Dimension fehlt in seiner Angabe; oder der abgefragte Wert ist ausdrücklich zugelassen. Die Fälle werden nur ausgewertet, wenn die jeweilige Abbildung definiert ist. `ALL` ist ausschließlich ein Abfragewert und wird nicht als Geltungsbereich gespeichert. Explizite `applicabilityOverrides` dokumentieren begründete Ausnahmen; die Laufzeit verwendet weiterhin die kompilierte Anwendbarkeit. Eine Sichtbarkeitsentscheidung beweist noch keine Quellenabdeckung.

### Erst global vererben, dann einschränken {#sec:global-then-restrict}

Die induzierten Relationen sind

$$
C_F=C\cap(G_F\times G_F),\quad R_F=R\cap(G_F\times G_F),\quad \Reff|_F=\Reff\cap(G_F\times G_F).
$$

Die effektiven Voraussetzungen werden *vor* der Filterung berechnet. Sonst könnte eine vom ausgeblendeten Vorfahren geerbte Anforderung verschwinden, obwohl Ziel und Voraussetzung beide im Fokus liegen. Die atomare Klassifikation wird ebenfalls nicht aus dem gefilterten Baum neu erfunden: $A_F=A\cap G_F$. Ein Cluster wird durch das Ausblenden seiner Kinder nicht zu einem neuen atomaren Ziel.

#### Vollständige Voraussetzungsketten in Projektionen. {#par:projection-closure}

Level 2 bezeichnet den längerfristigen Umfang des Personal Curriculum, etwa für ein Bundesland und Kursprofil (Abschnitt~@ref{sec:personal-scope}). Eine geprüfte Kompositionssicht legt dafür die kanonischen Zielreferenzen fest (Abschnitt~@ref{sec:composition-views}). Die Rollenprüfung unterscheidet Lernziele `target` von reinen Voraussetzungshilfen `prerequisiteOnly` (Abschnitt~@ref{sec:projection-roles}). Nach der Ownerentscheidung vom 9. November 2026 muss die Projektion einer ausgewählten atomaren Zielmenge $T\subseteq A$ im zugrunde liegenden Voraussetzungsgraphen mindestens die Menge

$$
\Closure(T)=T\cup\{p\in A\mid\exists t\in T:(t,p)\in\Rat^+\}
$$

und die für ihren vollständigen transitiven Bedarf nötigen kanonischen Voraussetzungsbeziehungen erhalten. $\Closure(T)$ besteht also aus den ausgewählten Zielen und ihrem gesamten atomaren Bedarf (in älteren Fassungen $U(T)$). Anwendbarkeit und geprüfte Level-2-Komposition bestimmen $T$. Sie dürfen unverzichtbare kanonische Zwischenziele nicht entfernen, bevor die Voraussetzungsketten berechnet werden. In Übergangsdaten muss auch die für Vererbung und atomare Expansion nötige kanonische Struktur verfügbar bleiben.

Setzt $a$ das Ziel $b$ und $b$ das Ziel $c$ voraus, muss eine Auswahl von $a$ und $c$ deshalb $b$ im zugrunde liegenden Graphen mitführen. Der Bedarf von $a$ an $c$ bleibt erhalten. Geht dieser Pfad verloren, ist die Projektion fehlerhaft; die fehlenden Knoten und Beziehungen müssen erhalten bleiben. Neue `requires`-Kanten in der Kompositionssicht oder abgeschwächte kanonische Voraussetzungen sind keine Korrektur.

Diese strukturelle Vollständigkeit verlangt nicht, jeden Knoten im sichtbaren Baum anzuzeigen. Strukturelles Mitladen allein reicht aber nicht: Verfasste Ausgangsreferenzen bleiben hart geprüft. Für notwendige Atome erfüllen eine kompilierte Zielrolle mit geprüftem kanonischem Voraussetzungspfad und dokumentierter Herkunft die Rollenpflicht; eine manuelle Sichtreferenz je Atom ist nicht nötig. Unbekannte Referenzen, Zyklen sowie fehlende oder nicht erreichbare benötigte Atome bleiben Fehler, auch bei vorhandener Mastery. Unbeteiligte `contains`-Nachfahren werden dadurch nicht eingeschrieben. Nach der ausdrücklichen Ownerentscheidung vom 10. November 2026 bildet $L=\Closure(S)$ den persönlichen Lernumfang, wobei $S$ die Vereinigung atomarer Ausgangsziele der gewählten geprüften Fächersichten ist. Zuerst wählen deren geprüfte Kurs-/Landesfilter die gültigen Ausgangsziele $S$; danach entsteht die Hülle im unbeschnittenen kanonischen Graphen. Zusätzliche notwendige Atome bleiben trotz dieser Ausgangsfilter enthalten, unbeteiligte Ziele anderer Kurse oder Länder nicht. Alle notwendigen Atome gehören zu Lernen, Fortschritt und Abschluss. $L$ ist für persönliche Konfiguration und Curriculum-/Projektionsrevision fest, unabhängig von Mastery. Gemeisterte Atome bleiben im Nenner erfüllt; ihre Wiederholung wird nicht verlangt. Ein gemeistertes Zwischenziel unterbricht die transitive Hülle nicht. Eine unbewiesene Eintrittsannahme ist keine erfüllte Lernpflicht.

Diese ausdrückliche persönliche Kompilationsregel ersetzt nur hier das frühere Verbot der Zielergänzung. Jedes offene notwendige Atom braucht ein tatsächlich erreichbares Erwerbsziel im Gesamtplan. Fachlokales `prerequisiteOnly` bleibt möglich, wenn dieselbe kanonische ID anderswo im Gesamtplan Ziel ist; sie zählt einmal. Die Regel nimmt keine Geschwister, ganzen Fremdeinheiten oder Fächer allein wegen eines benötigten Atoms hinzu. Alle einzeln notwendigen Atome bleiben in $L$, auch wenn das sämtliche Atome eines Faches sind. Die Regel ändert keine amtliche Zuordnung oder Quellenanwendbarkeit. Sie erweitert keinen Fokus und erzeugt, kopiert, überträgt oder löscht keine Mastery. Bestehende zieltypspezifische Abschlussregeln bleiben maßgeblich. Backend und WebGUI setzen diesen persönlichen Lernumfang um. Anwendbarkeitsprüfung, Migrationsbeweis und vollständige native, Curriculum- und Remote-Abnahme bleiben gesondert nachzuweisen.

### Normalmodus und strikter Modus {#sec:filter-modes}

Beide Modi wählen ihre Kandidaten im Ausschnitt. Sie unterscheiden sich darin, welche Voraussetzungen sie prüfen: der Normalmodus nur die innerhalb des Ausschnitts, der strikte Modus alle.

Im Normalmodus (*optimistic*) gilt die relative Basis

$$
\Atoms_F(g)=\Atoms(g)\cap G_F,\qquad \Sat_F(g,\Meff)\iff\Atoms_F(g)\subseteq\Meff.
$$

Die leere relative Basis blockiert hier nicht. Das bescheinigt keine globale Kompetenz und verändert keinen gespeicherten Lernzustand. Zuerst werden Vererbung, atomare Expansion und transitive Hülle global berechnet. Danach schränkt der Normalmodus die benötigten atomaren Endpunkte ein:

$$
\Frontier_{\mathrm{opt}}(\Meff,F)=\{g\in A_F\setminus\Meff\mid \forall p\in A_F:\ (g,p)\in\Rat^+\Rightarrow p\in\Meff\}.
$$

Im strikten Modus (*pessimistic / strict*) bleiben die Kandidaten im Fokus, die Anforderungen werden jedoch global geprüft:

$$
\Frontier_{\mathrm{strict}}(\Meff,F)=\{g\in A_F\setminus\Meff\mid \forall p\in A:\ (g,p)\in\Rat^+\Rightarrow p\in\Meff\}.
$$

Somit gilt für dieselben Eingaben

$$
\Frontier_{\mathrm{strict}}(\Meff,F)\subseteq \Frontier_{\mathrm{opt}}(\Meff,F).
$$

Bei $g\to x\to p$ und $G_F=\{g,p\}$ bleibt $p$ als transitive Voraussetzung im Normalmodus sichtbar erforderlich. Der strikte Modus prüft zusätzlich $x$. Auch eine Mastery von $x$ entfernt $p$ nicht aus der transitiven Prüfung. Die Umfangsregel ist eigenständig; sie verwandelt ausgeblendete Voraussetzungen nicht in Mastery. Abbildung~@ref{fig:filters} stellt beide Modi nebeneinander.

::figure{id="fig:filters"}

### Fehlende Voraussetzungen und fehlende Atome {#sec:missing}

Eine Diagnose beantwortet zwei verschiedene Fragen: Welche Voraussetzung ist nicht erfüllt, und welche Atome fehlen dafür noch? Beide Antworten verwenden die globalen Relationen:

$$
\begin{aligned}
\Missing(g,\Meff)&=\{p\in G\mid(g,p)\in\Reff\land\neg\Sat(p,\Meff)\},\\
\MissingAtoms(g,\Meff)&=\ReqAtoms(g)\setminus\Meff.
\end{aligned}
$$

$\Missing$ nennt die unerfüllten effektiven Voraussetzungsknoten selbst und dient der Erklärung. $\MissingAtoms$ ist die vollständige globale Diagnose: alle noch nicht effektiv beherrschten Atome des Bedarfs. Die Teilmengen $\MissingAtoms\cap G_F$ und $\MissingAtoms\setminus G_F$ unterscheiden interne und externe Lücken. Eine bloße Liste direkt benötigter Cluster kann dabei fehlende externe Atome oder hinter Zwischenknoten liegende Lücken verschweigen. Benötigt etwa $g$ einen Cluster $k$, der nur das noch offene Atom $b$ enthält, und ist $G_F=\{g,k\}$, dann liegt die unerfüllte Voraussetzung $k$ im Ausschnitt, das fehlende Atom $b$ aber außerhalb. Die Diagnose erzeugt weder neue Kanten noch neue Lernergebnisse und ist nicht mit der Blockerliste des Normalmodus gleichzusetzen.

:::sources
[Graph Definition](repo:docs/concept/skill-graph/graph-definition.md); [Graph Validation Rules](repo:docs/qa-ci/graph-validation-rules.md); [Projektkonventionen](repo:AGENTS.md).
:::
