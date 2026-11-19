## Entwurfskriterien und Beispiele für Lerneinheiten {#sec:sga-unit-design}

**Arbeitsfassung für die Fachrunde vom 19. November 2026.** Die Regeln für repräsentative Abschlüsse sind Vorschläge. Die bestehenden Fach- und Prüfverträge gelten bis zu einer Produktentscheidung weiter.

Eine [Lerneinheit](repo:docs/concept/skill-graph/learning-units.md) braucht ein verständliches Lernversprechen. Soll sie direkt nachweisbar sein, gehört eine zweite Frage zum Entwurf. Welche selbstständige Leistung würde uns überzeugen, dass jemand dieses Versprechen auf dem angegebenen Niveau einlöst?

Am Beispiel der hessischen Kinematik betrachten wir eine vorhandene Kindeinheit und einen möglichen Abschluss für ihre Elterneinheit E.1. Ein zweites Beispiel aus der Mathematik zeigt, wie sich dieselbe Frage beim Zahlverständnis stellt. Die [Unterlage für die Fachrunde](repo:docs/concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md) enthält die E.1-Aufgabenentwürfe, Bewertungsbeispiele und offenen Entscheidungen.

### Ein tragfähiges Fundament legen {#sec:sga-ud-foundation anchors="1-establish-a-secure-foundation"}

Eine Lerneinheit bündelt einen zusammenhängenden Erkenntnisschritt: Lernende verstehen ein Modell oder einen fachlichen Zusammenhang und können damit selbstständig handeln. Die Motivation erklärt, welche Frage dadurch beantwortbar wird und warum sich der Aufwand lohnt. Eine Einheit kann einem vertrauten Thema entsprechen; ebenso kann sie eine neue Denkweise erschließen, die mehrere Themen verbindet. Ihr Umfang folgt diesem Lernversprechen. Auch eine abschließende Anwendung oder Synthese kann eine Einheit bilden; sie braucht keine nachfolgende Einheit als Existenzberechtigung.

Der reguläre Weg führt von einer Leitfrage über Erklärung, Beispiel und Übung zur selbstständigen Anwendung. Wer die Einheit bereits kennt, kann direkt zeigen, was er kann. Vorher soll sichtbar sein, welche Teile erforderlich sind und welche bereits anerkannt vorliegen. Für beide Wege gilt derselbe fachliche Maßstab.

Ein Urteil über die Einheit darf auf repräsentativen Leistungen beruhen. Ein Rechenfehler kann mit dem Lernversprechen vereinbar sein. Wenn die Person ein für das Versprechen zentrales Modell grundlegend missversteht und dennoch besteht, tragen Aufgabe und Bewertungsregel das Urteil nicht. Fachleute prüfen beide Fälle mit konkreten Antworten.

### Eine sinnvolle Einheitsgrenze erkennen {#sec:sga-ud-boundary anchors="2-recognising-a-meaningful-boundary"}

Eine Grenze wird durch ein verständliches gemeinsames Lernversprechen und durch eine selbstständige Anwendung getragen, die den gesamten beanspruchten Erkenntnisschritt prüfen kann. Ein erkennbarer Übergang zu späteren Anforderungen ist ein weiterer wichtiger Grund; eine Abschlusseinheit benötigt keinen Nachfolger. Fachliche Nähe und dichte Voraussetzungsverbindungen sind Hinweise, kein automatischer Zuschnitt. Auch eine sparsame, transitiv minimale Kette kann eng zusammenhängen. Gemeinsame Grundlagen wie Gleichungen oder Zahlverständnis verbinden viele Themen, ohne sie zu einer einzigen Rieseneinheit zu verschmelzen.

Ungeeignet sind folgende Begründungen:

- „Es gibt schon eine Prüfung": Die Prüfung muss aus dem Lernversprechen hervorgehen; ihr vorhandener Zuschnitt bestimmt nicht die Einheit.
- „Die Gruppe braucht mindestens ein paar Ziele": Es gibt keine Mindestanzahl. Ein einzelnes Ziel kann umfassend genug sein; viele Ziele können nur lose zusammenhängen.
- „Die Überschrift wirkt aufgeräumt": Eine zusätzliche Oberüberschrift erzeugt weder fachlichen Zusammenhang noch ein neues Lernergebnis.
- „Dann passen alle Kanten": Voraussetzungen werden weder erfunden noch entfernt, um eine gewünschte Zerlegung nachträglich passend zu machen.

Eine fachlich fragwürdige Kante ist ein Befund für sich. Ihre Überprüfung darf nicht dadurch ersetzt werden, dass die Bedeutung der beteiligten Ziele stillschweigend verengt wird. Selbst eine atomar azyklische Folge kann durch ungünstige Gruppierung einen Widerspruch zwischen ganzen Blöcken erzeugen; Grenze oder Schachtelung müssen dann überdacht werden.

#### Der Wissenskontext einer Einheit {#sec:sga-ud-frame anchors="the-knowledge-context-of-a-unit"}

Was die Ziele einer Einheit ausgestaltet, richtet sich an Lernende, die manches wissen und anderes noch nicht. Dieses Wissen ist der [Wissenskontext](repo:docs/concept/skill-graph/knowledge-context.md): eine Projektion des Skill-Graphen, die für jedes Ziel sagt, worauf es aufbaut, was gesichert ist, was auf ihm aufbaut und welcher benachbarte Stoff noch nicht gesichert ist (Anforderung des Product Owners vom 13. November 2026). Der Wissenskontext einer Einheit ist die Vereinigung der Kontexte ihrer eigenen Ziele und Prüfungen. Für eine Einheit wird nichts von Hand geschrieben.

In einer Einheit zum Ableiten ganzrationaler Funktionen sichert der Kontext Potenzfunktionen mit natürlichen Exponenten, ihre Vielfachen und Summen sowie die Regeln, die die Einheit erarbeitet. Trigonometrische Funktionen, Exponential- und Logarithmusfunktionen sowie Produkt- und Kettenregel sind nicht gesichert. Eine Anwendung in dieser Einheit und ebenso das Bild eines ihrer Ziele zeigt dann eine ganzrationale Funktion und nie $\sin x$ oder $e^x$, so naheliegend ein solches Beispiel für jemanden wirkt, der das ganze Fach kennt.

Für den Entwurf einer Einheit folgen daraus zwei Regeln:

1. **Jede Ausgestaltung bleibt im Kontext.** Aufgaben und Musterlösungen der eigenen Prüfungen, Lernkarten, Übungsaufgaben, Lernzielbilder und die Beispiele des Coachs zu den Zielen der Einheit benutzen nur, was der Kontext sichert und was die Einheit erarbeitet. Was ihn verlässt, ist der falschen Einheit zugeordnet oder wird geändert.
2. **Der Graph muss ausreichen.** Braucht die Einheit etwas, das ihr Kontext nicht sichert, fehlt dem Graphen eine Voraussetzung, greift ein Ziel in späteren Stoff, oder die Grenze stimmt nicht. Das ist ein Befund für die Fachprüfung. Keine Kante wird erfunden und kein Zieltext verengt, um ihn zu beseitigen.

Der Kontext wird abgeleitet, bevor Aufgaben, Karten und Bilder der Einheit geschrieben oder geprüft werden. Er ist in jedem Lehrplankontext derselbe, weil die Voraussetzungsrelation kanonisch ist: Weder „im selben Schuljahr vorgesehen" noch eine `after`-Reihenfolge zwischen Geschwistereinheiten schaltet Konzepte in $W(g)$ frei; beim E3-Fall zweier verschiedener Kindeinheiten ordnet `after` die benötigte Kindeinheit vor der abhängigen an (bei einem eigenen Atom ordnet der Bedarf selbst), während allein atomare `requires`-Pfade Begriffe für Aufgaben, Karten, Bilder und Erklärungen sichern.

### Lernen, nachweisen und weiterlernen {#sec:sga-ud-loop anchors="3-learn-demonstrate-and-continue-learning"}

„Ein Ball rollt vom Tisch. Wo landet er?“ Beim Erarbeiten macht die Frage ein Ziel sichtbar. Der Coach kann die horizontale Bewegung und den Fall zunächst an einem Beispiel erklären, eine Zeichnung vormachen und beim nächsten Beispiel schrittweise weniger helfen. Eine passende Übung am Ende des Lernpfads gibt Gelegenheit, den Landepunkt selbst vorherzusagen.

Beim Direktversuch sehen Lernende das Lernversprechen und die erforderlichen Leistungen. Eine Aufgabe zur Überlagerung lässt die Person selbst entscheiden, wie sie beide Bewegungen zeitlich verbindet. Ob ein solcher Wurf tatsächlich auszuführen ist, hängt vom versprochenen Können ab. Eine Auswertung vorgegebener Daten kann die eigenhändige Durchführung eines Versuchs offenlassen.

Zeigt sich eine Lücke, kann die Person genau diese Stelle erarbeiten. Nach Einsicht in die Lösung dient derselbe Fall der Übung. Für einen erneuten Nachweis der selbstständigen Modellwahl braucht es eine gleichwertige, hinreichend neue Situation. Tragfähigkeit und Aufwand solcher Varianten sind Gegenstand der Erprobung.

Ein bestandener Abschluss trägt weder den Vermerk „Einstieg erlebt“ noch ein Ereignis für übersprungene Übungen nach. Die spätere Empfehlung berücksichtigt nur den fachlich begründeten Umfang der bestandenen Fassung. Die Geschwisterrelation `after` ordnet die Einheiten und erzeugt keine fachliche Voraussetzung. [Einheitsfolge](repo:docs/concept/skill-graph/learning-unit-progression.md)

### Hauptbeispiel: Gleichmäßig beschleunigte Bewegung (Physik Sekundarstufe II) {#sec:sga-ud-physics anchors="4-main-example-motion-with-constant-acceleration-upper-secondary-physics"}

#### Lernversprechen und innerer Zusammenhang {#sec:sga-ud-phys-promise anchors="learning-promise-and-coherence"}

**Kandidat:** „Ich kann eine eindimensionale Bewegung mit konstanter Beschleunigung selbstständig modellieren, berechnen und erklären." Lernende wählen Koordinatenachse und Vorzeichen, berücksichtigen Anfangsort und Anfangsgeschwindigkeit und verknüpfen Ort, Geschwindigkeit und Beschleunigung in Formeln und Diagrammen.

Die Leitfrage kann lauten: „Wie beschreibe ich einen geworfenen Ball vom Abwurf bis zum Aufprall mit einem einzigen Modell?" Freier Fall aus der Ruhe und senkrechter Wurf sind hier Fälle desselben Modells. Sie werden nicht bloß wegen unterschiedlicher Bezeichnungen in zwei Ein-Ziel-Einheiten zerlegt. Unterschiedliche Anfangsbedingungen machen den gemeinsamen Zusammenhang sichtbar.

Für die Zeit ab dem gewählten Startzeitpunkt liefert konstante Beschleunigung:

$$
x(t)=x_0+v_0t+\tfrac12at^2,\qquad v(t)=v_0+at,\qquad a(t)=a.
$$

In einem Kurs, in dem Ableitungen bereits zur Verfügung stehen, können Lernende damit die Zusammenhänge von $x$ nach $v$ und von $v$ nach $a$ prüfen und physikalisch deuten. Das ist keine Pauschalannahme für jeden Einstiegskurs. Das quadratische Weg-Zeit-Gesetz lässt sich ohne Integralrechnung herleiten oder als Modellgleichung bereitstellen; der hier beschriebene Einstieg setzt keine formale Integralrechnung voraus.

Die folgenden vereinfachten Werte veranschaulichen den Zusammenhang für einen senkrechten Wurf ab Abwurfhöhe ($x_0=0$, $v_0=+20\,\mathrm{m/s}$, $a=-10\,\mathrm{m/s^2}$, ohne Luftwiderstand, bis zur Rückkehr auf Abwurfhöhe):

| $t$ in $\mathrm{s}$ | $x$ in $\mathrm{m}$ | $v$ in $\mathrm{m/s}$ | $a$ in $\mathrm{m/s^2}$ |
| --- | --- | --- | --- |
| $0$ | $0$ | $+20$ | $-10$ |
| $1$ | $15$ | $+10$ | $-10$ |
| $2$ | $20$ | $0$ | $-10$ |
| $3$ | $15$ | $-10$ | $-10$ |
| $4$ | $0$ | $-20$ | $-10$ |
{cols="25%,25%,25%,25%"}

Bei $t=2\,\mathrm{s}$ erreicht der Ort sein Maximum und die Geschwindigkeit ist null, während die Beschleunigung bei $-10\,\mathrm{m/s^2}$ bleibt. Die Tabelle dient ausschließlich der Konzeptprüfung; sie ist keine freigegebene Prüfungsaufgabe.

#### Einstieg und Anschluss {#sec:sga-ud-phys-entry anchors="entry-and-continuation"}

Benötigt werden die mathematischen Fertigkeiten, die diese Aufgaben tatsächlich verlangen: mit Termen und Einheiten umgehen sowie Gleichungen einschließlich auftretender quadratischer Gleichungen lösen. Verlangt die gewählte Aufgabe Ableitungen, müssen auch diese vorab verfügbar sein. Eine in der Physikaufgabe sichtbare Anwendung beweist nicht pauschal die vollständigen entsprechenden Mathematikziele; dafür zählen deren eigene Bedeutung und gültiger Nachweis.

Der Wissenskontext dieses Beispiels sichert die Beschreibung von Bewegungen in Diagrammen, die gleichförmige Bewegung sowie Durchschnitts- und Momentangeschwindigkeit, dazu lineare Funktionen und das Lesen von Graphen. Vektoren und Bewegungen in zwei Dimensionen, Kräfte als Ursachen sowie Ableitungen und Integrale sind nicht gesichert. Quadratische Gleichungen sind es ebenfalls nicht: Kein Voraussetzungspfad der beiden Ziele stellt sie bereit, obwohl die Aufgaben sie brauchen. Das ist ein Befund nach der zweiten Regel zum Wissenskontext einer Einheit.

Die gleichförmige Bewegung kann einen sinnvollen fachlichen Einstieg bilden, etwa um Geschwindigkeit und Beschleunigung voneinander abzugrenzen. Daraus entsteht keine Pflicht, zuvor jede kalendarisch früher liegende Physikeinheit abzuschließen.

Darauf aufbauende Kraft-und-Bewegungs-Aufgaben oder spätere Anwendungen mit Energie und Bahnkurven können anschließen. Kräfte und Energie sind dort neue Konzepte und durch diesen Kinematiknachweis noch nicht gemeistert. Der Kandidat beansprucht weder eine überall verbindliche amtliche Reihenfolge noch eine Sperre für alle übrigen Physikthemen.

#### Was eine selbstständige Prüfung sichtbar machen muss {#sec:sga-ud-phys-assessment anchors="what-an-independent-assessment-must-reveal"}

Eine mögliche Aufgabe beschreibt einen von einer erhöhten Plattform senkrecht nach oben geworfenen Ball. Ohne vorgegebenen Lösungsweg stellen Lernende das Modell auf, bestimmen den höchsten Punkt und einen späteren Aufprall und erläutern passende Orts-, Geschwindigkeits- und Beschleunigungsdiagramme. Der Luftwiderstand wird ausdrücklich vernachlässigt; das betrachtete Zeitintervall endet beim ersten Aufprall.

Eine ergänzende Variante verändert die Abwurfhöhe oder gibt die positive Koordinatenachse nach unten vor. Entscheidend ist, ob Anfangsbedingungen und Vorzeichen aus der Situation abgeleitet statt aus einer vertrauten Zahlenfolge übernommen werden. Nicht jede Einzelaufgabe muss jeden Aspekt wiederholen; die maßgebliche Aufgabenmenge muss das gesamte beanspruchte Lernversprechen abdecken.

| Beobachtung | Bedeutung für den beanspruchten Nachweis |
| --- | --- |
| „Am höchsten Punkt gilt $v=0$, also auch $a=0$." | Die zentrale Unterscheidung fehlt; das vollständige Bewegungsmodell ist noch nicht nachgewiesen. |
| Ein korrekt aufgestelltes Modell enthält einen einzelnen Rechenfehler bei konsistenter Folgerechnung. | Kein automatischer Gegenbeleg gegen das Modellverständnis; Beurteilung nach der geltenden regulären Bewertungsregel. |
| Nach einem Achsenwechsel drehen sich die Vorzeichen um, der vorhergesagte Aufprall bleibt aber physikalisch konsistent. | Hinweis auf tragfähiges, übertragbares Verständnis statt bloßem Formeleinsatz. |
{cols="42%,58%"}

Eine reguläre Bestehensregel, unter der die erste Fehlvorstellung vollständig durch andere Punkte ausgeglichen werden könnte, passt nicht zum beanspruchten Nachweis. Umgekehrt folgt daraus keine Pflicht zur Fehlerlosigkeit. Diese Anforderung muss in der regulären Aufgabe und Bewertungsskala umgesetzt sein, ohne versteckte Zusatzbedingung. Kann die bestehende Gesamtpunktbewertung den Anspruch nicht tragen, müssen Prüfung oder beanspruchte Abdeckung vor einer Freigabe überarbeitet werden. Die Aufgabenskizzen und Gegenbeispiele ersetzen noch keine ausgearbeitete, unabhängig geprüfte Produktionsrubrik.

Bei der Fehlvorstellung am höchsten Punkt setzt das Weiterlernen genau dort an: etwa über den Vergleich der Geschwindigkeit unmittelbar davor und danach, passende Diagramme und die Unterscheidung zwischen Momentanwert und Änderungsrate. Eine frische Situation prüft anschließend dieselbe Unterscheidung selbstständig.

#### Ein größerer Kandidat: Kinematik einschließlich Überlagerung {#sec:sga-ud-phys-larger anchors="a-larger-candidate-kinematics-including-superposition"}

Die hessische E.1-Lernkarte für G8 und G9 verbindet Messung und eindimensionale Bewegungsmodelle mit der Vorhersage eines waagerechten Wurfs. Der Wurf stammt curricular aus E.3 und hat hier seinen Lernort in E.1. Der Zuschnitt eignet sich, um das Zusammenspiel mehrerer Kompetenzen in einer größeren Einheit zu prüfen.

Ein möglicher Verlauf führt von Darstellungen für Ort, Geschwindigkeit und Beschleunigung über gleichförmige und gleichmäßig beschleunigte Bewegungen zu unabhängigen Komponenten und deren Überlagerung. Für einen idealisierten Wurf ohne Luftwiderstand werden horizontale und vertikale Bewegung in einem festen Bezugssystem getrennt beschrieben und zur **gleichen Zeit** wieder zusammengeführt. Die Unabhängigkeit folgt aus diesem Modell; sie gilt nicht für beliebige überlagerte Bewegungen.

Die vorhandene Kindeinheit „Gleichmäßig beschleunigte Bewegung modellieren“ hat zwei eigene Prüfungen. Beim Senkrechtwurf lassen sich die Modellwahl und ihre Grenzen zeigen. Das Beschleunigungsprotokoll verlangt zusätzlich Bewegungsdiagramme und die Unterscheidung von Ortsänderung und zurückgelegter Strecke nach einer Umkehr. Das Review entzog dem Senkrechtwurf gerade wegen dieser Lücke die Deckung für das ganze Beschleunigungsziel. [Geltender Vertrag der Kindeinheit](repo:curricula/DE/Gymnasium/quality/learning-units/physics-constant-acceleration-2026-11-15-v2.md)

Für einen ersten **E.1-Entwurf** gelten vier eigenständige Bestehensentscheidungen. Bereits bestandene, zur geforderten Fassung passende Teile zählen mit.

| Pflichtteil | Fachliche Leistung | Stand und Bestehensgrenze |
| --- | --- | --- |
| Kindprüfung Senkrechtwurf | Achse wählen, Bewegung modellieren und Idealisierung begründen | Vorhanden, 24/24 Punkte |
| Kindprüfung Beschleunigungsprotokoll | Drei Diagramme konstruieren sowie Ortsänderung und Strecke unterscheiden | Vorhanden, 20/20 Punkte |
| E.1-Prüfung A, Wagen | Vorhersage aus Messdaten begründen und Messabweichungen beurteilen | Entwurf, 4/4 Punkte |
| E.1-Prüfung B, waagerechter Wurf | Bewegungen in zwei Richtungen mit gemeinsamer Zeit für eine Vorhersage verbinden | Entwurf, 3/3 Punkte |
{cols="29%,46%,25%"}

Vier bestandene Teile würden E.1 in diesem Entwurf nachweisen. Wer A und B löst und die Unterscheidung von Strecke und Ortsänderung noch verfehlt, hat einen offenen Kindnachweis. Für E.1 begründen Lernende ihre Vorhersage anhand vorliegender Daten. Im Lernweg können sie die Bewegung auch selbst messen. Die Fachrunde beurteilt, ob die vier Leistungen das vereinbarte Versprechen tragen und ob ein anders gefasstes Lernversprechen mit weniger Pflichtteilen auskäme.

#### Was der E.1-Nachweis für weitere Lernschritte bedeutet {#sec:sga-ud-phys-recognition anchors="recognition-inside-a-larger-unit"}

Zum Lernort E.1 gehören elf Inhaltsziele, zwei in der Kindeinheit und neun unmittelbar in E.1. Der Entwurf gibt nach den vier Prüfungen **vier ganze Atome für die Planung** frei. Das Kind belegt die beschleunigte Bewegung sowie Modellierung und Idealisierung. In A muss die Person Messabweichungen unterscheiden und Messunsicherheiten angeben. Sind die beiden Kindprüfungen bestanden, gelten bereits die zwei Freigaben der Kindeinheit. Wer zusätzlich A löst, hat den Prüfungsbeleg für den Wagen. Die beiden Freigaben zu Messabweichungen und Messunsicherheiten aus dem E.1-Vertrag werden erst wirksam, wenn auch B bestanden und E.1 vollständig nachgewiesen ist.

Bei den übrigen sieben Atomen reicht die beobachtete Leistung nur für einen Ausschnitt oder fehlt ganz. Wer vorgegebene Falldaten richtig deutet, hat beispielsweise noch keinen eigenen Fallversuch durchgeführt. Die E.1-Route kann abgeschlossen sein. Ein gesondert eingeplanter Versuchsauftrag bleibt offen. Die vollständige [Prüfung jedes Atoms](repo:docs/concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md) macht diese Planungsvorschläge für die Fachrunde überprüfbar.

#### Was Schulbuchstrukturen zeigen {#sec:sga-ud-phys-textbooks anchors="what-textbook-structures-show"}

Schulbücher werden daraufhin untersucht, wie sie Zusammenhang, Vorwissen, innere Reihenfolge und Abschlüsse begründen. Daraus entstehen eigene Entwürfe; Aufgaben, Texte oder Kapitelstrukturen werden nicht als Vorlage übernommen. Die folgenden ersten Beobachtungen wurden am 6. November 2026 festgehalten und für dieses Kapitel nicht erneut nachgeprüft:

- Die veröffentlichte Zuordnung von **Impulse Physik Oberstufe** zu Hessen (Klett, 2022, PDF-Seiten 2--3) führt innerhalb des ersten Buchkapitels von der geradlinigen Bewegung über den freien Fall und zweidimensionale Bewegungen zu Wurf- und Kreisbewegungen. Kräfte folgen im zweiten Kapitel. Das zeigt eine größere thematische Klammer mit inneren Lernschritten. [Verlagsdokument](https://asset.klett.de/assets/1fe831bc/Stoffverteilungsplan_Impulse_Physik_Oberstufe_HE.pdf)
- **OpenStax Physics**, Kapitel 5, begründet seine Reihenfolge ausdrücklich: Vektoroperationen bereiten mehrere zweidimensionale Anwendungen vor. Den Zusammenhang stiftet hier also eine gemeinsame Methode. Das Kapitel umfasst auch weitere Anwendungen; seine Grenze deckt sich nicht einfach mit unserer vorgeschlagenen Kinematikgrenze. [Kapiteleinleitung](https://openstax.org/books/physics/pages/5-introduction)
- Im Abschnitt zum schiefen Wurf stehen Komponentenzerlegung und gemeinsame Zeit im Mittelpunkt. Unterrichtshinweise verbinden Verständnisfragen mit einer gezielten Rückkehr zu Schwierigkeiten. Das verweist auf innere Verständnissicherungen. [Abschnitt 5.3](https://openstax.org/books/physics/pages/5-3-projectile-motion)

**Unser Fazit:** Ein Thema kann eine größere Einheit bilden und zugleich wichtige innere Sicherungspunkte benötigen. Ein Buchkapitel liefert einen begründbaren Kandidaten, aber noch keinen Beleg für eine vollständige SkillPilot-Anwendungsprüfung. Die lineare Lesereihenfolge eines Schulbuchs ist kein Voraussetzungsgraph, und weder eine Kapitelnummer noch ein großer Kapitelabschlusstest legt die einzig sinnvolle Grenze unserer Einheiten und Zwischenprüfungen fest. Die genannten Quellen belegen weder die Wirksamkeit unseres Zuschnitts noch einen aktuell verbindlichen Lehrplan.

#### Mathematische Methoden müssen rechtzeitig verfügbar sein {#sec:sga-ud-phys-math anchors="mathematical-methods-must-be-available-in-time"}

Tangenten-, Ableitungs- oder Flächenverfahren dürfen nur genutzt werden, wenn die dafür benötigten Kompetenzen zuvor erworben wurden oder in der Einheit ausdrücklich aufgebaut werden. „Für dasselbe Schuljahr vorgesehen" genügt nicht. Für jede abhängige Aktivität muss geklärt sein, ob die Methode an dieser Stelle tatsächlich zur Verfügung steht. Mögliche Lösungen sind eine rechtzeitige fachübergreifende Abstimmung, der explizite Aufbau der fehlenden Methode oder ein tragfähiger anderer Zugang bei unverändertem Kompetenzanspruch.

Für den hier beschriebenen Einstieg genügt ein fachlich korrekter Weg ohne formale Integration: Bei linearer Geschwindigkeit liefern Rechtecke und Dreiecke die vorzeichenbehaftete Ortsänderung. Flächen unterhalb der Zeitachse zählen negativ; bei einem Vorzeichenwechsel wird die Fläche aufgeteilt. Davon ist der zurückgelegte Gesamtweg zu unterscheiden. Dieser Zugang beansprucht kein entsprechendes vollständiges Verfahren für beliebige Geschwindigkeitsverläufe. Nichts davon schreibt stillschweigend Mathematik-Mastery gut oder verändert bestehende Voraussetzungen oder Zielumfänge.

### Zweites Beispiel: Zahlverständnis in Mathematik Jahrgangsstufe 5 {#sec:sga-ud-math5 anchors="5-preliminary-comparison-number-sense-in-grade-5-mathematics"}

Der [kanonische Mathematik-Graph](repo:curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json) enthält die folgenden fünf Ziele; sie werden auch in den hessischen G9-Kompositionssichten referenziert. Diese Auswahl ist keine Zerlegung der gesamten Jahrgangsstufe. Maßgeblich sind die verfassten deutschen Zieltitel und ihre stabilen IDs.

| Vorhandenes Ziel (verfasster Titel) | Vollständig zu wahrende Bedeutung |
| --- | --- |
| Dezimalsystem als Stellenwertsystem erklären und vergleichen | Das dezimale Stellenwertsystem erklären, Zahlen in Stellenwerte zerlegen und es mit einem gegebenen anderen Zahlensystem vergleichen. |
| Natürliche Zahlen darstellen und am Zahlenstrahl verorten | Natürliche Zahlen in Ziffern und Worten darstellen und begründet auf einem skalierten Zahlenstrahl verorten. |
| Natürliche Zahlen ordnen und vergleichen | Natürliche Zahlen begründet vergleichen und ordnen sowie Relationszeichen verwenden. |
| Natürliche Zahlen runden | Auf eine vorgegebene oder sachgerecht gewählte Stelle runden und die entstehende Näherung erläutern. |
| Unbegrenztheit der natürlichen Zahlen mit dem Nachfolgerprinzip begründen | Mit dem verallgemeinerten Nachfolgerprinzip begründen, dass es keine größte natürliche Zahl gibt. |
{cols="38%,62%"}

Für den Abgleich mit dem Graphen lauten die stabilen IDs in dieser Reihenfolge `624764d6-becd-5f9b-ada3-0d4f9d143073`, `cf474eab-1379-4877-907e-58b0892ce734`, `9ef6c4fa-b97a-5d7a-86c1-96690f02d916`, `fe07241a-b779-5f35-a82d-7aa51ae74f42` und `1a25ef44-f310-4c23-9ba8-44baec60d3b0`.

Das Lernversprechen lautet: „Ich verstehe den Aufbau der natürlichen Zahlen, kann zwischen Darstellungen wechseln und Größenordnungen begründet abschätzen." Die fünf Ziele sind damit thematisch verbunden. Die vorhandenen fachlichen Pfade sind jedoch sparsam: Darstellung führt zum Ordnen; das Stellenwertsystem führt zum Runden und zur Unbegrenztheit. Darstellung und Stellenwertsystem verlangen zusätzlich den vorhandenen gemeinsamen Orientierungseinstieg, der kein fachlicher Leistungsnachweis ist. Weitere vererbte Fachvoraussetzungen erhalten die fünf Ziele dadurch nicht.

Im Kompatibilitätsvertrag 1.2 bilden diese fünf Ziele zusammen mit zwei zugehörigen Prüfungen bereits eine erste Blatteinheit. Beim Top-down-Ausbau der Facheinheiten (`F9`–`F11`) ist dennoch fachlich gegenzuprüfen, ob die Trennung zwischen „Zahlverständnis" und dem Rechnen mit natürlichen Zahlen als Kindeinheiten unter einer gemeinsamen Obereinheit trägt und in allen 16 Bundesländern ungeteilt in einer Planeinheit bleibt. Selbstständige Anwendungen, der tatsächliche spätere Bedarf und die Begründbarkeit der Grenze sind gegeneinander abzuwägen; die Anzahl fünf entscheidet diese Frage ebenso wenig wie das Vorliegen zweier Teilzweige.

Eine Einkaufssituation verlangt Größen zu schätzen. Ein Kind kann darin erfolgreich sein, ohne die Unbeschränktheit der natürlichen Zahlen mit dem Nachfolgerprinzip begründen zu können. Soll eine neue Abschlussfassung auch diese Begründung tragen, braucht sie eine passende Aufgabe mit einem wirksamen Bestehenskriterium. Ist die Begründung für das engere Gesamturteil entbehrlich, bleibt das Ziel für eine spätere Planung offen. Die beiden vorhandenen Prüfungen behalten ihren vereinbarten Umfang.

Die bestehende Kante vom Ziel „Multiplikation und ganzzahlige Division als Umkehroperationen nutzen" (`cafd6520-c4af-4109-9863-cc49ba6fad4d`) zum Unbegrenztheitsziel gibt Anlass zu einer fachlichen Prüfung ihrer Notwendigkeit, ist aber keine bereits beschlossene Korrektur. Das Rechenziel umfasst ausdrücklich natürliche **und ganze** Zahlen, Vorzeichen sowie die Bedingungen zulässiger Division. Sein Umfang darf für den Vergleich mit einer Einheit zu natürlichen Zahlen nicht verengt werden.

### Wie Einheitsfolge, Lernstand und Empfehlung zusammenwirken {#sec:sga-ud-validity anchors="6-consistency-with-the-recognition-model-and-the-unit-validity-rules"}

Eine brauchbare Gliederung beantwortet zunächst, in welcher Reihenfolge man das Gebiet erarbeiten kann. Für den Nachweis braucht sie zusätzlich eine Antwort darauf, was ein bestandener Abschluss belegt.

Jede Einheit -- ob prüfungsfreie Planeinheit, übergeordnete Facheinheit oder Blatteinheit mit Prüfungen -- muss zuerst die vier **Ordnungsregeln E1–E4** ([Einheitsfolge](repo:docs/concept/skill-graph/learning-unit-progression.md)) erfüllen:

- **E1 (Teilbaum- und Projektionsform):** Eine fachliche Einheit ist ein erklärter kanonischer Cluster (eigene Ziele und Kindeinheiten leiten sich aus `contains` ab), eine Planeinheit ein projizierter Plancontainer; Blatteinheiten liegen in allen 16 Bundesländern ungeteilt in einer Planeinheit.
- **E2 (Zusammenhängende Blockordnung):** Es gibt eine Reihenfolge aller Atome, die atomaren Bedarf und `after` einhält und jede Einheit als zusammenhängenden Block enthält. Dazu muss der Kindblockgraph aus kreuzendem Bedarf und `after` an jeder Einheit einschließlich der gedachten Wurzel azyklisch sein. Pfadkonvexität allein genügt nicht: Bei $\operatorname{Own}(U)=\{a,c\}$, $\operatorname{Own}(V)=\{b,d\}$, $a\to b$ und $d\to c$ ist der atomare Graph azyklisch und beide Mengen sind pfadkonvex, aber die Blöcke benötigen einander.
- **E3 (Geschwisterlokale Vollständigkeit von `after`):** Benötigt ein Atom unter Geschwistereinheit $B$ ein Atom unter Geschwistereinheit $A$ derselben Elterneinheit, so folgt $B$ in der erklärten `after`-Ordnung auf $A$ (keine Rückflüsse gegen die Einheitsfolge; auf Prüfungen selbst zeigt keine `requires`-Kante).
- **E4 (Redundanzfreiheit):** Keine erklärte `after`-Beziehung wiederholt, was bereits über andere Geschwister in `after` folgt.

**Vorschlag vom 19. November.** Neben den Einzelbelegen zählt für die Planung nur die geprüfte Freigabe eigener gewöhnlicher Inhaltsziele durch ihre vollständig bestandene Einheitenfassung. Für jedes dieser Ziele gilt auf beiden Wegen derselbe fachliche Maßstab. Ein Kind kann seine eigenen Ziele bereits freigeben, während die Elternroute noch offen ist. [Einheitennachweis und Planung](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-proposal-planning-release)

Das Review dokumentiert Lernversprechen, Niveau, Pflichtteile, Aufgaben und Bewertung, offengelassene Aspekte und die Planungswirkung je Atom. Eine spätere Fassung kann eine zusätzliche Fähigkeit verlangen. Alte Ergebnisse behalten die Bedeutung ihrer damaligen Fassung. Aus einem gescheiterten Direktversuch folgt eine Lernempfehlung zur beobachteten Lücke. Frühere Erfolge bleiben gültig.

Fachliche Erprobung ist insbesondere an drei Stellen nötig. Verlangen Aufgaben und Bewertungsregeln tatsächlich die beabsichtigte selbstständige Entscheidung? Rechtfertigt das beobachtete Können die Freigabe jedes beanspruchten *ganzen* Atoms? Wenn eine spätere Aufgabe einen noch offenen Schritt benötigt, ist vorab ein kurzer Einzelcheck oder die begleitete erste Anwendung sinnvoller? Ein vorgeschriebener Praxisnachweis bleibt in beiden Fällen eine eigene Pflicht.

**Geltender Vertrag vom 4./11. November.** Die drei deklarierten Facheinheiten behalten ihre Prüfungen und Deckungsreviews. Unter R1–R5 kann ein eigenes gewöhnliches Ziel schon vor dem Abschluss der ganzen Einheit anerkannt werden, sobald die dafür maßgeblichen lokalen Pflichten erfüllt sind. Diese Anerkennung gilt global. Die heutige Laufzeit kann ein Ziel schon aus dem Fehlen offener Pflichten im betrachteten Umfang anrechnen. Der Vorschlag vom 19. November würde eine zusätzliche Planungsfreigabe bis zum vollständigen Abschluss der zuständigen Einheitenfassung zurückstellen. [Bestätigte Entscheidung](repo:docs/concept/skill-graph/completion-semantics-clarification-2026-11-04.md)

### Kurzes Entwurfsblatt {#sec:sga-ud-sheet anchors="7-short-design-sheet"}

1. Welche Frage weckt Interesse? Was soll die Person am Ende auf welchem Niveau selbstständig meistern?
2. Welche Ziele und Pflichtkinder gehören zur Einheit? An welcher Stelle kann sie fachlich sinnvoll beginnen und enden? Stimmen Einheitsfolge, kanonische Voraussetzungen, Wissenskontext und Lernort in den betreffenden Sichten?
3. Wie erklärt der Coach einen neuen Gedanken, was kann er vormachen und woran können Lernende ihn mit abnehmender Hilfe erproben?
4. Welche erforderlichen Leistungen und gültigen Vorleistungen sieht eine Person vor dem Direktversuch? Welche konkrete Aufgabe verlangt die versprochene Entscheidung im Zusammenspiel?
5. Welche Beispielantwort muss bestehen, welche trotz richtiger Nebenrechnungen scheitern? Rechtfertigt die Fassung jede vorgeschlagene atomare Planungswirkung? Was darf für das Gesamturteil offenbleiben?
6. Welche Rückmeldung hilft bei einem Fehlversuch? Gibt es nach Lösungseinsicht eine gleichwertige neue Aufgabe für einen selbstständigen Nachweis? Welche offenen Fragen müssen Fachleute und Lernende in der Erprobung klären?
