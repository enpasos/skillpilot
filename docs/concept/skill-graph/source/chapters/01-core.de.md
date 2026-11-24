## Ziele, Identität und Beziehungen {#sec:core}

Ein Lernziel kann zu einem Thema gehören und zugleich Wissen aus einem anderen Thema voraussetzen. Der Graph hält beides getrennt fest. Aus diesen Angaben lässt sich bestimmen, welche Ziele für eine Person als Nächstes erreichbar sind.

### Das Grundobjekt {#sec:core-object}

Die Lernziele und ihre Beziehungen bilden einen endlichen gerichteten Graphen

$$
\mathcal G=(G,C,R),\qquad C,R\subseteq G\times G.
$$

$G$ ist die Menge der Lernziele. Der Zielgraph speichert genau zwei Arten von Kanten. Mit $C$ (`contains`) verfasst man die Gliederung der Ziele, mit $R$ (`requires`) ihre Voraussetzungen. Platzierungen im Curriculum, Quellenzuordnungen und Nachweise gehören zu den dafür vorgesehenen Modellschichten.

Ein Paar $(x,y)$ ist gerichtet. Für jede Relation $X$ auf $G$ bezeichnet

$$
X^{-1}=\{(y,x)\mid(x,y)\in X\}
$$

die Umkehrrelation. Die transitive Hülle $X^+$ enthält ein Paar $(x,y)$ genau dann, wenn ein gerichteter Pfad aus mindestens einer $X$-Kante von $x$ nach $y$ führt. Die Relation ist *azyklisch*, wenn kein solcher Pfad zu seinem Ausgangsziel zurückkehrt, also $\forall g\in G:(g,g)\notin X^+$. Ein gerichteter azyklischer Graph heißt kurz DAG. Abschnitt~@ref{sec:validity} prüft Gliederung und Voraussetzungen jeweils in ihrer eigenen Bedeutung.

In Abbildung~@ref{fig:overview} liegt das Ziel *Velocity* im Cluster *Kinematics*. Seine Voraussetzung *Vectors* erkennt man an einem eigenen Pfeil.

:::principle {title="Die Pfeilrichtung ist Teil der Definition"}
$k\xrightarrow{\mathtt{contains}}c$: Der Cluster $k$ enthält das Ziel $c$. $g\xrightarrow{\mathtt{requires}}p$: Das Ziel $g$ setzt $p$ voraus; kurz: $g$ benötigt $p$. Eine Lernablaufdarstellung zeigt dagegen $R^{-1}$: von der Voraussetzung zur darauf aufbauenden Kompetenz. Diese Umkehrung muss beschriftet sein.
:::

::figure{id="fig:overview"}

Für die Reihenfolge ganzer Einheiten gibt es eine eigene Angabe. `U after V` ordnet alle Ziele von U hinter denen von V im vorgesehenen Lernweg. Ein solcher Planeintrag ändert weder den Bedarf eines Ziels noch den Lernstand der Person (Abschnitt~@ref{sec:unit-progression}). Eine Prüfung kann selbst Voraussetzungen haben. Im Zielmodell dient sie keinem anderen Ziel als Voraussetzung. Bestehende Gegenbeispiele erfordern eine fachliche Korrektur.

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

Für die Lernfrontier genügt es nicht, nur die direkt eingetragenen Voraussetzungen eines Ziels abzulesen. Der Graph muss auch die Vorbereitung seiner Voraussetzungen erfassen. Bei älteren Daten kommen Anforderungen an oder von Clustern hinzu. Tabelle~@ref{tab:relations} führt die dafür verwendeten Relationen zusammen.

:::table {#tab:relations caption="Verfasste und abgeleitete Relationen. Im Zielzustand gilt $R=R_A=\Reff=\Rat$; abgeleitet wird dann nur noch die Hülle $\Rat^+$." cols="15mm,45mm,X"}
| Symbol | Name | Entstehung und Verwendung |
| --- | --- | --- |
| $C$ | Containment | Verfasste `contains`-Kanten. Sie gliedern die Ziele und bestimmen Atome, Cluster und atomare Basis. |
| $R$ | verfasste (direkte) Anforderungen | Gespeicherte `requires`-Kanten. Im Zielzustand verbinden sie nur Atome. |
| $\Reff$ | effektive Anforderungen | $R$ zusammen mit den Anforderungen, die ein Ziel von seinen `contains`-Vorfahren erbt. |
| $\Rat$ | atomar normalisierte Anforderungen | Jede effektive Voraussetzung ist durch ihre atomare Basis ersetzt; es bleiben nur Paare von Atomen. |
| $\Rat^+$ | transitive Hülle | Alle über Ketten erreichbaren Voraussetzungen. Grundlage für die Berechnung des Bedarfs und der Frontier. |
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

In $(g,p)\in R$ steht $g$ für das Ziel und $p$ für seine Voraussetzung. Der Pfeil zeigt von $g$ auf das, was vorher erworben oder erledigt sein muss. So kann ein Inhaltsziel auch den motivierenden Einstieg voraussetzen. Mehrere Pfeile von $g$ bedeuten, dass alle genannten Voraussetzungen gelten. Alternativen brauchen eine eigene Auswahlregel. $R$ ist azyklisch. Abbildung~@ref{fig:requires} zeigt ein Ziel mit vier Voraussetzungen.

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

Für jedes Atom $a$ werden nun die effektiven Voraussetzungen $p$ in ihre atomare Basis aufgelöst. Ist $p$ selbst atomar, bleibt genau dieses Ziel erhalten:

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

Im kanonischen Graphen müssen Zielidentitäten und Referenzen auflösbar sein und die Attribute aus Abschnitt~@ref{sec:core} vorliegen. Alle verfassten Voraussetzungen erfüllen die atomare Normalform @eqref{eq:atomic-target}. Für die Gültigkeit gelten außerdem zwei Bedingungen:

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

In der atomaren Kette $\nd{Q}\to\nd{B}\to\nd{A}$ muss eine zusätzliche direkte Kante $\nd{Q}\to\nd{A}$ entfallen. Über $\nd{B}$ bleibt $\nd{A}$ weiterhin erreichbar und als Voraussetzung wirksam, auch wenn $\nd{B}$ schon gemeistert ist. Der Beschluss vom 4. November 2026 verlangt diese transitive Minimalität, der vom 8. November die atomare Normalform.

#### G17 als Voraussetzung für die Fachmeilensteine.

Nach dem Beschluss vom 12. November 2026 prüft `G17` vor jedem Fach-Meilenstein `M1`--`M7` den vollständigen aktuellen kanonischen Bestand des Fachs. Dazu gehören die benötigten fachfremden Voraussetzungen und alle Vorfahren, von denen Anforderungen geerbt werden.

Erforderlich sind gültige Identitäten und Referenzen, Azyklizität, atomare Endpunkte aller `requires`, konsistente explizite Typen und vollständige transitive Minimalität. Ein Verstoß oder eine unvollständige Prüfung begrenzt das Fach und seine Teilbereiche auf `M0`. Bei unvollständigem Katalog bricht der Statuslauf ab ([GD-C17](@rule{GD-C17})).

Entscheidend ist der geprüfte Zustand, unabhängig von der Migrationsreihenfolge oder der Übereinstimmung mit einer historischen Hülle, Projektion oder Frontier. Die gesonderten Prüfungen für Geltung, Anwendbarkeit, Zielmengen, Frontier, Abschluss, Quellenbezug und Reviewfrische behalten ihre eigenen Maßstäbe. Eine Graphänderung schreibt kein Lernergebnis.

#### Diagnosen im Übergangsbestand sind keine Löschanweisung.

Zwei ältere Prüfungen bleiben als Diagnose nützlich. Ihr Bestehen ersetzt weder die atomare Normalform noch die vollständige Zielzustandsprüfung.

Die frühere *lokale Minimalitätsbedingung* lautet

:::equation {#eq:localmin}
(g,p)\in R\Longrightarrow \nexists k\in\Anc(g):(k,p)\in R.
:::

Sie zeigt direkte Dubletten geerbter Anforderungen. Das Entfernen einer Atomkante bei verbleibender Clusteranforderung stellt jedoch noch keinen gültigen Zielzustand her: Dort tragen Cluster keine ausgehenden Anforderungen mehr, und @eqref{eq:localmin} gilt automatisch.

Der bisher unter `G17` verwendete *Entfernungstest* ist ebenfalls eine Diagnose des Übergangsbestands: Er bildet für jede verfasste Kante $e=(g,p)$ die Relation $R'=R\setminus\{e\}$ und berechnet $\Reff'$ mit unverändertem $C$ neu. Er diagnostiziert Redundanz durch $(g,p)\in(\Reff')^+$. Abbildung~@ref{fig:inherited-redundancy} zeigt diesen mathematisch korrekten Befund im Übergangsbestand und zugleich den Gegenfall zur falschen Löschpräferenz: Der alternative Pfad hängt noch von einer Clusteranforderung ab.

::figure{id="fig:inherited-redundancy"}

#### Was die heutigen Prüfungen belegen.

Seit dem 11. November 2026 führt der [Statusgenerator](repo:app/scripts/generateCurriculumQualityStatus.ts) für `CQR-001` den [Entfernungsauditor](repo:app/scripts/auditTransitiveMinimality.ts) an jeder deklarierten kanonischen Gymnasialwurzel aus. Er meldet fehlerhafte Referenzen, Zyklen im effektiven Graphen, nichtatomare Endpunkte, redundante Anforderungen und widersprüchliche explizite Typen. Bei atomarer Normalform entspricht sein Entfernungskriterium genau @eqref{eq:atomicmin}.

Das [Kataloginventar](repo:app/scripts/currentCurriculumCatalog.ts) gleicht Curriculum-Manifest und Fachdeklarationen mit dem kanonischen Verzeichnis ab. `check:transitive-minimality` prüft alle 21 Wurzeln unabhängig vom vorgeschriebenen Mindestmeilenstein. `check:curriculum-maturity-floors` prüft zusätzlich die fest gebundenen Verpflichtungen einzelner Fächer und Teilbereiche gegen die mit `--base-ref` gewählte Git-Basis. Das am 12. November eingefrorene Reduktionsregister regelt ausschließlich die Wiederverwendung früherer Reviews je Ziel. Bei geändertem Ziel gelten die strikten Prüfungen der aktuellen Revieweingaben (Anhang~@ref{sec:rule-milestones}).

Die erste Durchsetzung auf `main` ist für [PR #131](https://github.com/enpasos/skillpilot/pull/131) am 13. November 2026 belegt. Nach Folgeänderungen an Reviewnachweis und Mathematikprüfung bestand `2129b207f4` alle 14 Jobs von [CI #2315](https://github.com/enpasos/skillpilot/actions/runs/43398052180). Der [Liefernachweis](repo:docs/dev/cqr-gvr-hard-gate-plan-2026-11-12.md) ordnet die PR- und Main-Läufe ihren Ständen zu. Er belegt die technischen Prüfungen in ihren jeweiligen Bereichen. Vier Sichtbarkeitsbereiche von `CQR-104` und die Ausweitung von `GVR-012` waren noch offen. Menschliche Erprobung und weitergehende Laufzeitverträge benötigen eigene Nachweise.

Die Ownerentscheidung vom 13. November 2026 legt für die Einstufung aller `GD-*`-Regeln den kanonischen Gymnasialkatalog mit 21 Wurzeln fest. Pflichten ab M5, M6 oder M7 werden gegen ihre jeweilige Schwelle geprüft; aktuell sind zehn Fächer auf M6/M7 gebunden, davon fünf auf M7. Nichtkanonische Landschaften sind außerhalb dieses Arbeitsprogramms. Eine harte Einstufung verlangt weiterhin die vollständige Durchsetzung aller Teilpflichten der Zeile: offene Laufzeitverträge, semantische Routenlücken und allgemeine Prüfungsdeckung werden durch die Bereichsentscheidung nicht geschlossen.

Zwei Regelfamilien prüfen heute Teile des Zielzustands: das *Curriculum-Quality-Review* (CQR) und die *graph-validation rollout rules* (GVR). Neben `CQR-001` heißt die Prüfung direkt atomarer Fachrouten `CQR-102`; die harte semantische Routenprüfung der Mathematikprofile Sek I/Sek II sowie von Biologie und Physik Sek II heißt `GVR-012`. Beide verlangen bereits in ihrem jeweiligen Scope, also ihrem benannten Prüfumfang, direkt atomare Routen; geerbte Clusterpfade liefern dort keinen Ersatz. Die Codelegende steht in Anhang~@ref{sec:rule-code-legend}.

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

Ob ein Ziel als Einstieg zählt, legt das Routenprofil fest. Für die Einführung der Einheitsmotivation soll ein Profil auch das im Einheiteneintrag benannte Orientierungsziel im passenden Umfang als Anker zulassen. Der Pfad zum Endziel muss weiterhin über atomare Ziele führen. Ob die Aufgaben das versprochene Können belegen, wird am Inhalt geprüft (Abschnitt~@ref{sec:why-graph-not-enough}).

Welche Ziele zur Route gehören dürfen, hängt vom Fach und von der Stufe ab. Die Profile prüfen die Erreichbarkeit über effektive Voraussetzungen (`CQR-101`), direkt atomare Pfade (`CQR-102`), die Voraussetzungen an Clustern (`CQR-103`) und die Sichtbarkeit der Endpunkte (`CQR-104`). Die stärkere Prüfung `GVR-012` berücksichtigt zusätzlich Zieltypen, Nebenbedingungen und die Reihenfolge der Vorbereitung. Sie soll künftig für alle registrierten Bereiche der M7-pflichtigen Fächer gelten.

Anhang~@ref{sec:implementation} nennt die abgedeckten Bereiche und die offenen Befunde, darunter die Reichweite des Physikprofils in den Stufensichten. Der [Routenbestand](repo:app/scripts/lib/semanticRouteInventory.ts) und die [Erzeugung der QA-Profile](repo:app/scripts/generateCurriculumQualityStatus.ts) dokumentieren, welche Ziele ausgewertet werden.

Eine Übersicht zwischen Clustern kann aus atomaren Routen abgeleitet werden. Beispielsweise bedeutet eine existenzielle Zusammenfassung $k_2\to k_1$:

$$
\exists a\in\Atoms(k_2),\ b\in\Atoms(k_1):(a,b)\in R_A^+.
$$

Eine prozentuale Abdeckung braucht darüber hinaus einen erklärten Nenner. Solche Übersichten erzeugen keine neuen direkten Clusteranforderungen.

## Lernzustand, Erfüllung und Fortschritt {#sec:state}

**Geltender bestätigter Vertrag (4./11. November 2026).** Die folgenden Formeln mit $\Meff$ beschreiben das verbindliche Anerkennungsmodell. Seine vollständige Umsetzung, insbesondere die revisionsgebundene globale Ableitung, ist gesondert nachzuweisen. Der Vorschlag vom 19. November wird erst in Abschnitt~@ref{sec:proposal-unit-assessment} behandelt.

Die bisherigen Abschnitte beschreiben den Graphen ohne lernende Person. Dieser Abschnitt fügt ihren Lernzustand hinzu: was gespeichert wird, was daraus als effektiv beherrscht gilt, welche Ziele als Nächstes verfügbar sind und wie Fortschritt gezählt wird.

### Erfüllung statt Rückschluss auf Voraussetzungen {#sec:satisfaction}

#### Ausdrückliche Ergebnisse.

Es gibt genau einen gespeicherten binären Zustand $m:A\to\{0,1\}$, mit $M=\{a\in A\mid m(a)=1\}$. $M$ ist die Menge der ausdrücklichen Erfolge, kurz: die ausdrückliche Mastery. Ein ausdrücklicher Erfolg an einem Inhaltsziel belegt das zielgerecht geprüfte Verstehen oder Können. Auch im Gespräch gilt der volle beschriebene Anspruch; verlangt das Atom eine eigene Durchführung, genügt eine Erklärung über fremde Daten nicht. Orientierung, Memorierung und Prüfungen verwenden ihren jeweils eigenen Abschlussvertrag (Abschnitt~@ref{sec:goal-types}). Keine Teilbewertung bildet einen dritten Mastery-Zustand.

#### Anerkennung durch eine Prüfung.

Ein gültiger lokaler Prüfungsvertrag kann für eine Person weitere eigene Ziele einer Einheit $U$ als erfüllt ausweisen. Diese Menge heißt $I_U\subseteq A$. Beispielsweise kann eine Prüfung zu linearen Funktionen belegen, dass die Person erfasste Inhaltsziele selbstständig angewandt hat, auch wenn diese einzeln noch offen waren. Eine unabhängige Kartenpflicht oder eine andere Kindeinheit darf dabei offen sein. Bei einer Orientierung bedeutet die Ableitung allein, dass der Einstieg als erledigt gilt. Die fachlichen und formalen Bedingungen stehen in den Abschnitten~@ref{sec:learning-units} und~@ref{sec:assessment}.

#### Effektiv beherrschte Menge.

Die effektive globale Menge lautet

$$
\Meff=M\cup\bigcup_{U\in\mathcal U_{\mathrm{valid}}}I_U.
$$

$\mathcal U_{\mathrm{valid}}$ umfasst alle für die Person dauerhaft gültigen lokalen Verträge mit ihrer jeweiligen Revision. Ein Wechsel der sichtbaren Einheiten, des Fokus oder des Plans hebt sie nicht auf. Ausdrückliche und gültig abgeleitete Erfolge erfüllen spätere Voraussetzungen und zählen zum Fortschritt. Gespeichert werden die ausdrücklichen Erfolge. Die Ableitung nach Abschnitt~@ref{sec:assessment} lässt diese Daten unverändert.

Alle folgenden Formeln verwenden $\Meff$. In den Originalabbildungen~@ref{fig:frontier} und~@ref{fig:filters} steht $M_A$ für die ausdrückliche Menge $M$. In diesen Beispielen gibt es keine implizite Beherrschung; dort ist $\Meff=M$.

#### Erfüllung.

Ein Ziel $g$, ob Atom oder Cluster, ist *erfüllt*, wenn seine gesamte atomare Basis effektiv beherrscht ist:

:::equation {#eq:sat}
\Sat(g,\Meff)\iff \Atoms(g)\ne\varnothing\ \land\ \Atoms(g)\subseteq\Meff.
:::

Die Erfüllung eines Clusters wird aus den Ergebnissen seiner Atome berechnet. Dadurch entsteht kein neues Ergebnis an einem Kind. Ebenso führt das Bestehen eines einzelnen Inhaltsziels allein zu keinem Eintrag für seine Voraussetzungen. Eine darüber hinausgehende Anerkennung braucht den gültigen lokalen Vertrag.

### Globale Frontier {#sec:frontier}

Die *Frontier* ist die Menge der nächsten verfügbaren atomaren Ziele:

:::equation {#eq:frontier}
\Frontier(\Meff)=\left\{g\in A\setminus\Meff\;\middle|\; \forall p\in A:\ (g,p)\in\Rat^+\Rightarrow p\in\Meff\right\}.
:::

Ein offenes Atom $g$ ist verfügbar, wenn $\ReqAtoms(g)\subseteq\Meff$. Auch die Grundlage hinter einem bereits gemeisterten Zwischenziel zählt mit. Bei einer Clusteranforderung im Übergangsbestand zählen die Atome ihrer Basis.

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

Jedes Atom trägt mit seinem effektiven binären Ergebnis bei: ganz oder gar nicht. Für eine leere Zielmenge gibt es keinen solchen Quotienten; die Anzeige braucht „keine Ziele im gewählten Umfang“ statt erfundener 100 %. Für mehrere Cluster wird $S$ als Vereinigung ihrer Zielatome gebildet. Cluster und Kinder dürfen nicht zusätzlich gemeinsam gezählt werden. Ein Fortschritt von 50 % bedeutet, dass auf die geschafften Ziele die Hälfte des Gesamtgewichts entfällt.

Die Erledigungsanzeige im Lernzielbaum kann ausdrückliche und abgeleitete Beiträge getrennt ausweisen. Zusammen ergeben sie $P(S)$. Ein vollständig gefüllter Gesamtbalken entspricht $P(S)=1$. Zählt eine Anzeige nur ausdrückliche Ergebnisse, muss sie dies kenntlich machen.

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

Für den längerfristigen Umfang des Personal Curriculum (Level 2, Abschnitt~@ref{sec:personal-scope}) wählen die geprüften Fächersichten kanonische Ziele aus (Abschnitt~@ref{sec:composition-views}). Innerhalb einer Fächersicht kann ein Ziel die Rolle `target` oder die unterstützende Rolle `prerequisiteOnly` tragen (Abschnitt~@ref{sec:projection-roles}). Die Entscheidung vom 9. November 2026 verlangt, dass der zugrunde liegende Graph für eine Auswahl $T\subseteq A$ mindestens die folgende Menge erhält:

$$
\Closure(T)=T\cup\{p\in A\mid\exists t\in T:(t,p)\in\Rat^+\}
$$

Zu $\Closure(T)$ (früher $U(T)$) gehören die ausgewählten Atome und ihr gesamter transitiver Bedarf. Auch die kanonischen Verbindungen zwischen ihnen müssen erhalten bleiben. Bei Übergangsdaten gehört dazu die Struktur für Vererbung und atomare Expansion.

Im Pfad $a\to b\to c$ muss der Graph bei einer Auswahl von $a$ und $c$ das Zwischenziel $b$ mitführen. So bleibt die Voraussetzungskette intakt, auch wenn eine Ansicht $b$ ausblendet. Fehlt $b$ im zugrunde liegenden Graphen, ist die Projektion zu korrigieren. Die Kompositionssicht verfasst dafür keine Ersatzkante.

Für den persönlichen Umfang bestimmen zuerst die geprüften Landes- und Kursfilter die atomaren Ausgangsziele $S$ aller gewählten Fächer. Nach der Entscheidung vom 10. November 2026 wird dann $L=\Closure(S)$ auf dem ungekürzten kanonischen Graphen berechnet. Jedes notwendige Atom bleibt im Lernumfang, auch aus anderen Kursen und Fächern. Weitere Geschwister derselben Einheit kommen nur bei eigenem Bedarf hinzu. Welche Arbeit noch ansteht und welche Einheit nachgewiesen ist, wird innerhalb dieses festen Umfangs bestimmt.

Die persönliche Konfiguration und die Curriculum- und Projektionsrevision bestimmen $L$. Ein bereits gemeistertes Ziel bleibt als erfüllt im Nenner und braucht keine Wiederholung. Die Hülle umfasst auch seine Voraussetzungen. Eine angenommene Eingangskenntnis ist noch kein Lernergebnis.

Die Kompilierung prüft die verfassten Ausgangsreferenzen. Für jedes benötigte Atom weist sie die Zielrolle, einen gültigen kanonischen Voraussetzungspfad und die Herkunft aus. Ein offenes Atom braucht einen tatsächlich erreichbaren Erwerbsweg. Ein fachlokal als `prerequisiteOnly` geführtes Ziel kann im Gesamtplan zum Ziel werden und zählt dort mit seiner kanonischen ID genau einmal. Unbekannte Referenzen, Zyklen und fehlende oder unerreichbare notwendige Atome sind Validierungsfehler, unabhängig von bisherigen Ergebnissen.

Nur beim Kompilieren des persönlichen Lernumfangs werden Ziele auf diese Weise ergänzt. Amtliche Lehrplanzuordnung, Quellenanwendbarkeit, Fokus und zieltypspezifische Abschlussregeln behalten ihre Bedeutung. Die Ergänzung erzeugt, überträgt oder löscht keine Mastery. Backend und WebGUI setzen diesen Umfang um. Anwendbarkeitsprüfung und vollständige native, Curriculum- und Remote-Abnahme benötigen eigene aktuelle Nachweise.

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
