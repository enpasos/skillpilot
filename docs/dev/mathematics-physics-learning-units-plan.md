# Neuer Umsetzungsplan: Lerneinheiten für Mathematik und Physik

Stand: 6. November 2026. Arbeitsauftrag: den zweiten externen Vorschlag als
Grundlage verwenden, das Konzept mit Astra Ultra ausarbeiten und anschließend
mit Sol 6.1 Ultra umsetzen. Die frühere Zerlegung bleibt abgebrochen.
Der neue Auftrag beendet die im Neustartpapier beschriebene Wartephase für
die neue Planung; er reaktiviert keinen alten Umsetzungsauftrag.

> **Eingefroren am 6. November 2026.** Der Product Owner hat das Einheiten-Goal
> pausiert. Zuerst wird der eigenständige
> [CI-Vertragsaudit](ci-contract-audit-handoff-2026-11-06.md) erledigt.
> Die folgenden Meilensteine sind nicht freigegeben zur weiteren Ausführung.

**Ziel:** Mathematik und danach Physik in fachlich zusammenhängenden
Lerneinheiten anbieten. Einheiten erklären ihren Nutzen und sichern durch
geeignete Prüfungen selbstständige Anwendung. Bereits nachgewiesene gewöhnliche
Kompetenzen zählen global; Prüfungs- und Lernkartenziele behalten ihren eigenen
expliziten Abschluss. Das bestehende Cockpit bleibt vollständig benutzbar.

Dieser Plan beschreibt den neuen Sollzustand und seine Abnahme. Er meldet keine
bereits erfolgte Datenmigration, Implementierung oder Produktionsfreigabe.
Insbesondere wird die in Abschnitt 2 beschriebene Anerkennungsänderung vor ihrer
Implementierung in S0 in allen maßgeblichen Konzepten konsistent verankert.

## 1. Ausgangspunkt und verbindlicher Umfang

Neustartbasis ist `origin/main` bei
`0ce5a8d791eeb9783a919195fd8590bfb79f3595`. Der
[gesicherte Neustart](learning-units-restart-2026-11-06.md) beschreibt Archiv,
frühere PRs und Nachnutzung. Vor jedem späteren Implementierungs-PR wird die
dann aktuelle Main-Basis erneut abgerufen und geprüft.

Die Arbeit umfasst beide kanonischen Bestände sowie die daraus aktuell
angebotenen, aufgelösten Mathematik- und Physiklehrpläne. Ein vollständiger
kanonischer Pool ist kein einzelner Pflichtkurs. Bundesland, Sekundarstufe,
G8/G9, Kursprofil, Vertiefungen und erforderliche Prüfungsalternativen müssen
nach den vorhandenen Angebotsregeln aufgelöst werden. Eine bloße GK-Ansicht
oder ein hessisches Beispiel erfüllt den Fachabschluss nicht.

| Inventar an der Neustartbasis | Mathematik | Physik |
| --- | ---: | ---: |
| Alle kanonischen Knoten | 1.252 | 766 |
| Gewöhnliche fachliche Ziele | 807 | 478 |
| Prüfungsziele | 163 | 156 |
| Lernkartenziele | 6 | 5 |

Struktur und Orientierung erklären die übrigen Knoten. Diese Bestandszahlen
sind Kontrollsummen, keine Vorgabe für Einheitsgröße oder künftige Zielzahlen.
Neue eigenständige Prüfungen können zusätzliche stabile IDs benötigen.
Chemie und Biologie folgen später in getrennten Aufträgen.

### Eingaben nachvollziehbar auseinanderhalten

- Grundlage ist `tmp/aa_input/vorschlag2.md`, SHA-256
  `60b24c99a0f3129ead0101d98bca16c7d479ac59f88238640541b0cdd4c77104`.
  M01–M61 und P01–P51 sind Entwurfskennungen, keine schon freigegebenen
  Produktionsverträge. Die Zahl der Einheiten ist veränderbar.
- Die zuerst fixierte `tmp/aa_input/zuordnung.csv`, SHA-256
  `d86f4b5a5830db3ba8ff42a9a6e58de58ff4a78ce2c6c64646c6d7eb1485c1d5`,
  enthält vier Varianten mit `U_MATH_*`-/`U_PHYS_*`-Kennungen. Sie ist nicht
  als die im zweiten Vorschlag behauptete M-/P-Zuordnung identifiziert.
  Vollständige IDs allein belegen keine richtige Zuordnung oder Kursvariante.
- Während der Vorbereitung wurde die Datei erneut geändert: SHA-256
  `db9b1b969d1926c6a80ff21d4d10fb61cd4ec8822b9837301c855d200585f7e2`.
  Auch diese Fassung enthält vier vollständige ID-Inventare; ihre Zuordnungen
  werden deshalb nicht ungeprüft übernommen. Eingaberevisionen bleiben getrennt.
- Lokale Eingaben sind mit Prüfsummen unter
  `tmp/aa_input/source-versions/2026-11-06-input-snapshot-01/` und
  `2026-11-06-input-snapshot-02/` gesichert.
  Die im Vorschlag verlinkten privaten Bibliotheksdateien gelten nicht als
  gelesen. Fehlende Anhänge verhindern nicht die eigene fachliche Bearbeitung.
- Maßgeblich werden unsere geprüften Zuordnungen zu Original-IDs, Aufgaben,
  Karten und Angebotsrevisionen. Externe Vorschläge bleiben als Herkunft
  erkennbar; ihre Aussagen werden nicht zu Testergebnissen umetikettiert.

## 2. Die entscheidende Konzeptkorrektur

### 2.1 Nachgewiesene Kompetenz sofort anerkennen

Eine Einheit wird nach ihrem Lernversprechen geschnitten. Die technische
Anerkennungsregel darf sie nicht in Ein-Prüfungs-Hüllen zerlegen.

**Empfohlene neue Regel aus Abschnitt 8 des zweiten Vorschlags:** Eine bestandene
Prüfung erkennt diejenigen vollständigen gewöhnlichen Ziele global an, deren
selbstständige Anwendung sie durch Aufgaben und reguläre Bestehensregel wirklich
belegt. Eine weitere offene Prüfung darf diesen gültigen Nachweis nicht
zurückhalten. Diese Regel ersetzt für die neue Umsetzung die bisher geplante
Ableitung allein aus dem verbleibenden lokalen Bedarf.

„Zwischenprüfung“ bedeutet hier lediglich eines von mehreren normalen
Prüfungslernzielen innerhalb einer größeren Einheit, keinen neuen Zieltyp.

Beispiel: Q1 und Q2 benötigen beide A. Q1 ist bestanden und belegt A vollständig.
Dann ist A erledigt, während Q2 offen bleibt. Wird später Q2 oder eine andere
Einheit begonnen, muss A nicht erneut erworben werden. Freiwilliges Wiederholen
bleibt möglich. Das Bestehen von Q1 besteht weder Q2 noch offene Lernkarten.

Sei A die Grundmenge atomarer Ziele. Gewöhnliche fachliche Ziele O, Prüfungen Q
und Lernkartenziele K sind paarweise disjunkte Teilmengen von A.
M ⊆ A ist die Menge explizit beherrschter Ziele. Für eine unveränderlich
bestimmte, fachlich freigegebene Prüfung q bezeichnet C(q) ausschließlich ihre
vollständig nachgewiesenen gewöhnlichen Kompetenzen:

$$
C(q)\subseteq O,\qquad
I(M)=\left(\bigcup_{q\in M\cap Q}C(q)\right)\setminus M,\qquad
M_{\mathrm{eff}}=M\cup I(M).
$$

Nur explizit bestandene Prüfungen erzeugen diesen Nachweis. Implizite Ergebnisse
werden nicht als neue Prüfungsbelege zurückgeführt. Ein gewöhnlicher direkt
erreichter Zwischenknoten beweist nicht automatisch seine Voraussetzungen.
Prüfungen, Lernkarten und Motivation erhalten durch C(q) keinen erfundenen
Abschluss. Die Behandlung vorhandener Orientierungsmarker bleibt ausdrücklich
Teil der Konzept- und Migrationsprüfung.

**Gespeichert bleibt pro atomarem Lernziel nur `mastery ∈ {0,1}`.** I und
Einheitsabschlüsse sind abgeleitet. Es entstehen weder qualifizierende
Lernendenbelege noch Teil-Mastery, zusätzliche Bestehenszustände oder manuell
gepflegte Freistellungsprofile.

### 2.2 Eine maßgebliche Nachweisdeklaration

Die vorhandenen `examData.coveredGoalIds` sind der Ausgangspunkt und sollen
nach Qualifizierung die einzige gepflegte Abdeckungsliste bleiben. C(q) ist
die mathematische Interpretation der freigegebenen Liste, keine zweite Datei
mit denselben Zuordnungen. Bisherige Deklarationen werden nicht allein durch
ihre Existenz zu gültigen Nachweisen.

Die Freigabe bezieht sich auf vollständige Zielbedeutung, Aufgaben,
Hilfsmittel, zulässige Varianten und normale Bewertung. Ein `requires`-Pfad
ist eine Voraussetzung, kein Prüfungsnachweis. Zieltexte werden nicht
nachträglich verkürzt, damit vorhandene Aufgaben ausreichend erscheinen.

Zusätzlich gilt nach vollständiger atomarer Normalisierung die gerichtete
Konsistenzbedingung C(q) ⊆ Reach_R⁺({q}): Jede behauptete geprüfte Kompetenz
muss als fachlicher Bedarf der Prüfung nachvollziehbar sein. Ein fehlender
Pfad ist ein Befund zur fachlichen Korrektur, keine automatisch erzeugte Kante.
Ein vorhandener transitiver Pfad genügt; zusätzliche redundante Direktkanten
sind nicht nötig. Umgekehrt ist nicht jede transitive Voraussetzung geprüft.

Für ungeprüfte oder historisch unklare Prüfungen gilt C(q) = ∅. Das erhält ihr
explizites Ergebnis und vermeidet eine unbelegte zusätzliche Anerkennung.
Ein bisheriger Veröffentlichungsstatus allein ist keine solche fachliche
Freigabe. Clusterreferenzen in alten Abdeckungslisten werden nicht dynamisch
über ein später verändertes `contains` zu stärkeren Nachweisen: Für neue
Anerkennungsverträge wird der geprüfte atomare Umfang unveränderlich bestimmt.
Die elf bestehenden Lernkartenziele referenzieren lokal vorhandene Decks;
ihre Inhalte werden tatsächlich geprüft, statt die im externen Paket fehlenden
Anhänge als dauerhafte Blockade zu behandeln.

Ein Nachweis darf auch in einer Eltern- oder anderen Einheit erbracht werden,
wenn er das gewöhnliche Ziel tatsächlich vollständig prüft. **Erwerbsort und
Nachweisort sind verschiedene Dinge.** Eine solche Zuordnung lässt notwendige
Kinderprüfungen und Karten ausdrücklich offen. Sie ist keine pauschale
Anerkennung aller Nachkommen durch eine Elternprüfung.

Für zusammengesetzte Anforderungen wie Experiment **und** Auswertung ist der
erste Implementierungsweg eine passende mehrteilige Prüfung mit einem normalen
binären Gesamtergebnis. Ein reiner Datenauswertungstest belegt kein tatsächlich
gefordertes eigenes Experiment. Getrennte unvollständige Teilnachweise werden
nicht durch Vermutung zu einem vollständigen Nachweis kombiniert. Eine allgemeine
Regelsprache für beliebige Prüfungskombinationen gehört nicht zum ersten Ausbau.

### 2.3 Reguläres Bestehen muss die Behauptung tragen

Für jedes anerkannte Ziel werden wesentliche Fehlvorstellungen und zulässige
Bestehenswege geprüft. Insbesondere darf das Überspringen eines unverzichtbaren
Kernaspekts nicht durch sachfremde Punkte ausgeglichen werden. Ein einzelner
Rechenfehler bei richtigem Verständnis soll angemessen behandelt werden.

Zuerst werden Aufgaben, Gewichtung und veröffentlichte Rubrik verbessert.
Falls die bisherige reine Gesamtpunktgrenze den Anspruch nicht abbilden kann,
wird die **normale** Bewertungsdefinition einheitlich um klar veröffentlichte
Kernanforderungen erweitert. Diese gemeinsame Gradingänderung braucht eigene
Schnittstellen- und Adaptertests. Dieselbe Regel entscheidet im Coach und Backend
das eine binäre Ergebnis. Es gibt keine nachgelagerte verdeckte Qualifikation.
Bis der Mechanismus diesen Anspruch unterstützt, wird die weitergehende
Anerkennung nicht freigegeben. Ausführliche KI-Prüfungsbewertung mit Stärken,
Fehlern, Begründung und nächstem Lernschritt bleibt erhalten.

Die zu erfüllenden Kompetenzen sind vorab verständlich. Lösungen und
bewertungsinterne Detailhinweise bleiben wie bisher bis zur Auswertung
geschützt; die Coach-Anbahnung verrät keine Antworten.

### 2.4 Historie nicht nachträglich aufwerten

Ein binäres Ergebnis derselben Ziel-ID verrät keine damalige Aufgabenfassung.
Deshalb gilt: Eine Prüfungs-ID mit Anerkennungswirkung steht dauerhaft für
denselben gesicherten Nachweisumfang. Ein erweiterter oder stärkerer Anspruch
erhält eine neue Prüfungs-ID; alte Ergebnisse bestehen diese Prüfung nicht.
Aufgabenvarianten müssen denselben freigegebenen Anspruch sichern.

Ein Altbestand kann nur dann Anerkennungswirkung erhalten, wenn alle zulässigen
bisherigen Bestehenswege den behaupteten vollständigen Nachweis bereits trugen.
Bei unbekannter Historie bleibt das alte explizite Prüfungsergebnis erhalten,
begründet aber keine zusätzliche rückwirkende Kompetenz. Historische Verträge
bleiben für gültige globale Anerkennung auflösbar, auch nach Fokuswechsel.
Es gibt keine pauschale Migration „alte Prüfung bestanden ⇒ neue Einheit fertig“.

### 2.5 Einheit, Voraussetzungen und Fortschritt

Jedes Erwerbsziel hat pro aufgelöstem Lehrplan einen direkten Erwerbsort.
Eltern aggregieren Kinder; sie beanspruchen deren Ziele nicht nochmals.
Ein Abschluss wird rekursiv aus den effektiv erledigten eigenen Zielen und
allen erforderlichen Kinderabschlüssen berechnet. Eigene Prüfungen und Karten
brauchen immer ihr explizites Ergebnis. Eine reine Aggregation benötigt keine
zusätzliche redundante Prüfung; eine echte Synthese kann eine eigene haben.

Für jede freigegebene Erwerbseinheit U und jede aufgelöste zulässige
Prüfungsvariante müssen die tatsächlich erforderlichen eigenen Prüfungen
RequiredOwnQ(U) das gesamte eigene gewöhnliche Lernversprechen tragen:

$$
Own(U)\cap O\ \subseteq\ \bigcup_{q\in RequiredOwnQ(U)}C(q).
$$

Direktes Verständnis aller einzelnen Ziele ersetzt diese verpflichtenden
Anwendungsprüfungen nicht. Andernfalls könnte eine Einheit fertig erscheinen,
ohne ihr Lernversprechen selbstständig nachgewiesen zu haben. Eltern- oder
Fremdprüfungen können gewöhnliche Kompetenzen schon vorher anerkennen;
sie bestehen dennoch keine obligatorische eigene Prüfung dieser Einheit.

`requires` bleibt fachlich bedeutsam, azyklisch und transitiv minimal. Alle
geerbten, clusterbezogenen, transitiven, versteckten und fachübergreifenden
Voraussetzungen werden vor der bestehenden Fokusauswertung aufgelöst.
Ein beherrschter Zwischenknoten schneidet den Restpfad nicht ab. Erst ein
gültiger direkter oder Prüfungsnachweis erfüllt eine betreffende Kompetenz.
Für als ganze Blöcke geplante Einheiten wird zusätzlich ihre mögliche
Reihenfolge geprüft. Ein atomarer DAG garantiert keinen azyklischen Blockgraphen.

Direkte Prüfungsversuche bleiben ansteuerbar. Eine fachliche Voraussetzung
führt nicht automatisch zu einer technischen Sperre ganzer fremder Einheiten.
Neue harte Zugangssperren oder Prüfungsverbote werden nicht eingeführt.
Veröffentlichte, fachlich geprüfte Angebote sind regulär verfügbar und brauchen
keine manuelle Profilaktivierung. Die vorhandene Cockpit-Abschaltung von
Prüfungsabkürzungen steuert das Angebot; sie löscht keine bereits gültig
nachgewiesene Kompetenz.

Gesamtfortschritt und standardmäßiger Gesamtsaldo verwenden M_eff über
deduplizierte aktuelle Ziele. Die vorhandene Option für explizite Planzählung
bleibt berücksichtigt. Tages- und Wochenkontingente zählen ausschließlich
verlässlich datierte explizite Abschlüsse; implizite Anerkennung erzeugt keine
ausgeführten Arbeitsereignisse.

## 3. Zwei konkrete Kontrollbeispiele

### Mathematik: M01 „Natürliche Zahlen darstellen, ordnen und begründen“

Die Einheit verbindet Zahlvorstellung, Stellenwert, Vergleich, Runden und
Begründung. Die fünf vorhandenen Ziele bleiben vollständig erhalten:

| Bestehendes Ziel | Stabile ID |
| --- | --- |
| Natürliche Zahlen darstellen und am Zahlenstrahl verorten | `cf474eab-1379-4877-907e-58b0892ce734` |
| Dezimalsystem erklären und mit einem vorgegebenen anderen Zahlensystem vergleichen | `624764d6-becd-5f9b-ada3-0d4f9d143073` |
| Natürliche Zahlen vergleichen und ordnen | `9ef6c4fa-b97a-5d7a-86c1-96690f02d916` |
| Kontextbezogen runden und die Näherung deuten | `fe07241a-b779-5f35-a82d-7aa51ae74f42` |
| Mit dem Nachfolgerargument „keine größte natürliche Zahl“ begründen | `1a25ef44-f310-4c23-9ba8-44baec60d3b0` |

Die vorhandene Sechs-Punkte-Aufgabe
`311ab2f2-3364-5166-ac22-3ef01419fee4` ist kein bereits geeigneter
Vollnachweis: Der Rechenteil allein erreicht ihre Bestehensgrenze von drei
Punkten. Eine neue Prüfung muss das wirkliche Lernversprechen absichern.
M02 „Mit ganzen Zahlen rechnen und Zahlstrukturen nutzen“ folgt als zu
prüfender Nachbar. Ihre Grenze wird anhand der vollständigen Zielbedeutungen
begründet und bei Bedarf verändert.

### Physik: P13 „Eindimensionale Bewegungen modellieren“

**Hier liegt der senkrechte Wurf in der Oberstufe/E-Phase.** Er gehört mit
gleichförmiger Bewegung, konstanter Beschleunigung und freiem Fall zu einem
gemeinsamen Modellverständnis. Vorzeichen und Anfangsbedingungen sind Teil
dieses Versprechens, ebenso die Deutung von x-/v-/a-Diagrammen und passende
experimentelle Arbeit. Für konstante Beschleunigung gilt:

$$
x(t)=x_0+v_0t+\tfrac12at^2,\qquad v(t)=v_0+at.
$$

Die vorhandene Prüfung
`4ab1cf6d-b808-5b86-9291-85df0b9f2496`, „Senkrechter Wurf: Vorzeichen,
Scheitelpunkt und Rückkehr“, wird diesem Bereich zugeordnet und fachlich
überarbeitet. Mit ihrer jetzigen Bewertung sind ohne die gesamte
Scheitelaufgabe und die Diagrammaufgabe noch 24 von 36 Punkten erreichbar;
22 genügen zum Bestehen. Das ist kein verlässlicher Vollnachweis dieser
Kernaspekte. Ein neuer stärkerer Anspruch darf alte Ergebnisse nicht aufwerten.

Das bestehende Ziel `09029573-864f-40ca-bf8a-cee7bf6dcb73` verlangt eine
experimentelle Freifalluntersuchung. Das Ziel
`ce431132-dfc4-42c2-aff6-bd72035190f8` verlangt ebenfalls experimentelles
Erfassen, nicht allein das Lesen vorgegebener Graphen. Diese Anforderungen
werden bei Aufgaben und Durchführbarkeit ausdrücklich mitgeprüft.

P14 „Bewegungen überlagern und Würfe erklären“ ergänzt gemeinsame Zeit,
Komponenten und waagerechte beziehungsweise schiefe Würfe. P17 behandelt
Kreisbewegung im Zusammenhang mit Kräften. Eine übergeordnete Kinematik kann
P13 und P14 zusammenfassen. Ob diese Hierarchie besser trägt, entscheidet
die konkrete fachliche Prüfung; Entwurfskennungen erzwingen keine Grenze.

Für P13 wird keine formale Integralrechnung vorausgesetzt. Benötigte Mathematik
wird konkret benannt und rechtzeitig verfügbar gemacht; gleiche Jahrgangsstufe
genügt als Nachweis nicht. Geometrische vorzeichenbehaftete Flächen können
Ortsänderungen erschließen. Ortsänderung und zurückgelegter Weg bleiben
unterschieden. Experimentelle Tätigkeit wird nicht durch ein fiktives
KI-Experiment ersetzt.

## 4. Meilensteine und sichtbare Ergebnisse

Ein Meilenstein gilt erst mit den jeweiligen Abnahmen als erreicht. Teilstände
erhalten konkrete Bezeichnungen, keine aus Zielzahlen geschätzten Prozente.
Mathematik und Physik bleiben getrennt akzeptierbar und veröffentlichbar.

| Schritt | Konkretes Ergebnis | Abnahme vor dem nächsten Ausbau |
| --- | --- | --- |
| **S0 – eindeutiger Vertrag und Bestandsverzeichnis** | Anerkennungsregel aus Abschnitt 2 konsistent in Konzepten, AGENTS, mathematischer Referenz und LaTeX/PDF; reproduzierbares Inventar aller angebotenen Varianten, Karten und bisherigen Prüfungsverträge; Regel-zu-CI-Audit aller verbindlichen deterministischen Graphregeln. | Astra prüft Gegenbeispiele und Historie; alle Widersprüche zur lokalen Restbedarfsregel sind ausdrücklich abgelöst. Durchgesetzte Regeln, Teilabdeckung und CI-Lücken sind mit echten Aufrufen belegt. Noch keine geänderte Runtime. |
| **S1 – erste vollständige Mathematikeinheit** | M01 mit echter Zielzuordnung, Motivation, Kartenentscheidung, Aufgaben/Rubrik, sicherer Ergebnisidentität und minimaler gemeinsamer Compiler-/Runtimeanbindung. | Im bestehenden Cockpit und Coach kann man regulär lernen oder die Prüfung direkt versuchen; vor/nach Bestehen sind Anerkennung, offene Prüfungen/Karten, Fortschritt und Periodenzählung nachvollziehbar. |
| **S2 – Grenzen und Nachnutzung prüfen** | M02 sowie ein vollständiger P13-Ablauf und anschließend P14; unabhängige und spätere Verbraucher, experimentelle Anforderungen und fachübergreifende Mathematik geprüft. | Zweiter Fachkontext nutzt denselben Kern; keine spezielle Wurf- oder M01-Logik, keine Profilpflege. Erst dann wird die breite Datenmigration skaliert. |
| **M – Mathematik vollständig** | Alle angebotenen Mathematikziele, Prüfungen, Karten und Varianten fachlich bearbeitet; vollständiger Einheitenkatalog mit begründeten Grenzen und geprüften Nachweisen. | Keine unklassifizierten Erwerbsziele, ungelösten notwendigen Karten oder offenen nachweisrelevanten Befunde. Fachtests, Quellen-/Qualitätsgates, Gesamt-CI und veröffentlichbarer Smoke-Test bestanden. Physikrest blockiert diesen Abschluss nicht. |
| **P – Physik vollständig** | Entsprechende Vollständigkeit für Physik einschließlich Experimenten, mathematischer Voraussetzungen und fachübergreifender Anforderungen. | Eigene vollständige Fachabnahme; Mathematik bleibt stabil. Gleiche Produkt- und Qualitätskriterien wie bei M. |

Ein fachlicher Entwurf kann zunächst rein lesend als Vorschau sichtbar werden.
Er erhält dadurch weder Abschlusswirkung noch den Status einer freigegebenen
Einheit. S1 braucht dagegen einen ganzen echten Ablauf, keine isolierte Grafik.
Der frühe Physikfall in S2 dient der gemeinsamen Architektur und erfüllt den
Physikabschluss noch nicht. Der breite Fächerausbau erfolgt zuerst Mathematik,
danach Physik.

### Für jeden deploybaren Zwischenstand

- Vorher funktionierende Lern-, Prüfungs-, Karten-, Plan-, Wiederholungs- und
  Coach-Abläufe bleiben benutzbar. Explizite Ergebnisse und Identitäten bleiben
  erhalten. Korrigierte abgeleitete Zahlen werden als solche benannt.
- Neue Anerkennungswirkung wird nur für fachlich freigegebene, versionierte
  Verträge veröffentlicht. Noch ungeprüfte Ziele bleiben im vollständigen
  Lehrplan sichtbar und regulär lernbar; sie verschwinden nicht aus dem Nenner.
- Die alte Restbedarfsanzeige ist kein gültiger globaler Prüfungsnachweis.
  Ihre Ablösung wird pro betroffener Oberfläche und Fach protokolliert;
  ein Mathematik-/Physikteilstand verändert nicht nebenbei Anerkennung und
  Abschlussbehauptungen anderer Fächer. Vor einem solchen gemeinsamen Eingriff
  braucht es dafür eigene vollständige Regressions- und Migrationsbefunde.
  Diese Prüfung gehört in S1 vor der Aktivierung des ersten neuen Vertrags.
- Der gewohnte Baum, Icons, Lernzielbild, Konfiguration und Plandarstellung
  bleiben erhalten. Die Lernkarte wird im bestehenden Cockpit kontextbezogen
  ergänzt. Keine parallele zweite Gesamtoberfläche und keine redundanten
  Erklärungstexte. Erläuterungen der impliziten Anerkennung liegen am Icon.
- Automatische Empfehlungen nutzen effektive Kompetenz. Der Coach erhält
  passende Prüfungsangebote und kann nach Zustimmung gezielt hinsteuern.
  Fachinhalt gehört in den Coach-Skill und Kontextvertrag, nicht in die
  Startup-Nachricht. Provider nutzen denselben Kern; Anpassungen sind keine
  unterschiedlich starken Produktregeln.
- Lokale Tests, grüne GitHub-CI, bereitgestellter PR, Merge, Deployment und
  echter Host-Smoke-Test werden einzeln dokumentiert. Betreiberaktionen führt
  weiterhin der Product Owner aus. Lokale Browserchecks beweisen keine
  Claude-, ChatGPT- oder Gemini-Host-Abnahme.

## 5. Vorgehen für die vollständigen Fächer

1. **Inventar fixieren:** alle Original-IDs und aktuelle Angebotsdefinitionen
   erfassen; jeden Knoten als Erwerbsziel, Prüfung, Karte, Orientierung oder
   Struktur klassifizieren. Neue oder entfernte Ziele werden gegen diese
   Ausgangsmenge mit begründetem Identitätsentscheid abgeglichen.
2. **Kandidaten fachlich bearbeiten:** Lernversprechen, Grenze, direkte
   Erwerbsziele, Motivation, Eingangsanforderungen und tatsächliche Nachweise
   pro Einheit festhalten. Werkstätten sind nicht automatisch Erwerbseinheiten;
   fachlich integrierter Erwerb bleibt konkret verortet.
3. **Prüfungen und Karten schließen:** tatsächliche Decks laden, Aufgaben und
   reguläre Bestehenswege prüfen. Breite Karten nicht bloß zum Elternknoten
   verschieben, damit Kinder fertig erscheinen. Umfangreiche Prüfungsangebote
   und alternative Formen nicht als gemeinsame Pflicht importieren.
4. **Graph korrigieren:** fachlich falsche Voraussetzungen begründet berichtigen;
   gemeinsame atomare und projizierte Einheitsgraphen reproduzieren. Bei
   Verflechtungen zwischen falscher Kante, falscher Grenze und erlaubter
   Verzahnung unterscheiden. Keine bequeme Kantenlöschung für einen schönen Plan.
5. **Varianten auflösen:** die bestehenden Angebotsregeln anwenden und für jede
   angebotene Konfiguration Erwerbszuständigkeit, vollständige Pflichten und
   Referenzen prüfen. `target` und `prerequisiteOnly` bleiben getrennt: Ein
   gültiger globaler Nachweis für verborgenes Stützwissen zählt in dieser
   Ansicht nicht zum Zielnenner und erst bei einer späteren Zielplatzierung
   zu ihrem Fortschritt. Äquivalente aufgelöste Varianten dürfen gebündelt getestet
   werden, wenn die Äquivalenz selbst reproduzierbar belegt ist.
6. **Fachweise freigeben:** jeden überschaubaren Themenblock reviewen, validieren,
   committen und als sichtbaren PR-Stand bereitstellen. Die vorhandenen
   Quellen-, Aufgaben-, Bild- und M7-Qualitätsgates gelten für betroffene
   Artefakte weiter; ein Einheitenkatalog setzt sie nicht zurück oder außer Kraft.

Die beiden bereits belegten fragwürdigen Voraussetzungen
„Spiegelungen von Funktionsgraphen → Hauptsatz/Ableitungen“ und
„Polynomdivision → Optimierungsaufgaben“ werden im zuständigen Mathematikblock
fachlich entschieden. Die Zahl 354 fehlender direkter Abdeckungsdeklarationen
ist eine Suchliste, keine automatische Liste neuer Prüfungen und kein
Nachweis, dass die Inhalte bisher nie geprüft wurden.

## 6. Architektur, Performance und Wartbarkeit

- **Autorendaten einmal definieren:** stabile kanonische Ziele, vorhandene
  Placements/Kompositionssichten, qualifizierte Prüfungsabdeckung und bestehende
  Kartendaten. Einen separaten Einheitenvertrag nur für tatsächlich fehlende
  Semantik ergänzen; keine Kopie des vollständigen Curriculums.
- **Vor Veröffentlichung kompilieren:** Referenzen, Zieltypen, eindeutige
  Erwerbszuständigkeit, Varianten, vollständige Pflichten, historisch stabile
  Nachweisbedeutung, DAGs und transitive Minimalität deterministisch prüfen.
  Ungeklärte oder leere Mitgliedschaft ist kein erfolgreicher Abschluss.
- **Kleine Runtime:** vorberechnete atomare Voraussetzungen und Indizes
  Prüfung→anerkannte Ziele sowie Ziel→betroffene Einheiten verwenden. Pro
  Lernzustandsrevision ein gemeinsames Ergebnis für Cockpit, Coach, Frontier
  und Planung erzeugen; keine unterschiedliche Ableitung je Oberfläche.
- **Gezielt zwischenspeichern:** Schlüssel enthalten Daten-/Vertragsrevision,
  aufgelöste Angebotskonfiguration und Lernzustandsrevision. Fokus ändert die
  sichtbare Auswahl, nicht historische globale Kompetenz. Zustandsänderungen
  invalidieren abhängige Ergebnisse; kein globaler Neuaufbau aller Länder
  für jeden Request und keine langlebige ungeprüfte Cache-Gültigkeit.
- **Messen:** Compilerzeit und Artefaktgröße, Context-/Cockpit-Latenz sowie
  Mastery-Update mit einem und vielen bestandenen Prüfungen an derselben
  Basis vergleichen. Auch Kaltstart, Fokuswechsel und Cache-Invalidierung
  prüfen. Grenzwerte nach gemessener Ausgangslage festlegen, nicht erfinden.

### Transitive Minimalität als frühes maschinelles Gate

Der vorhandene `validate:graph`-Pfad prüft bisher keine vollständige transitive
Minimalität der Curricula. Auch die bestehende Mx-Berechnung garantiert diese
Eigenschaft nicht. Der mathematische Referenztest prüft Beispielgraphen, nicht
die tatsächlichen Curriculumdateien. Das ist eine ausdrücklich zu schließende
Testlücke, kein bereits erfülltes Kriterium.

Ein deterministischer Audit wird früh ergänzt: Eine verfasste Kante wird
probeweise entfernt, die effektive Relation mit Vererbung neu bestimmt und
geprüft, ob ihre Anforderung weiterhin erreichbar ist. Die Prüfung verwendet
die normative Graphsemantik einschließlich Cluster- und fachübergreifender
Referenzen; sie betrachtet keine lernendenabhängige Mastery.

Der vollständige Istbericht weist Fehler als Fehler aus. Für jeden neu
freizugebenden Mathematik-/Physik-Einheitenvertrag wird sein gesamter fachlicher
Wirkbereich zum harten Release-Gate: eigene und Kinderziele sowie die komplette
transitive, geerbte, versteckte und fachübergreifende Voraussetzungskette.
Ein Altfehler darin blockiert die Freigabe, bis er fachlich korrigiert wurde.
Nur geänderte Zeilen zu prüfen genügt nicht.

Beim vollständigen Fachmeilenstein muss der gesamte betreffende kanonische
und angebotene Umfang einschließlich seiner Stützanforderungen dieses Gate
bestehen. Andere Altbestände bleiben als noch nicht freigegeben sichtbar;
eine Baseline oder Warnungsfreigabe macht sie nicht minimal. Frühere M7-Nachweise
behalten ihren damaligen Regelstand und werden nicht rückwirkend als geprüfte
Minimalität bezeichnet. Fachfremde Befunde führen nicht zu automatischen
fachfremden Kantenkorrekturen.

Der erste [Istbericht und seine Reproduktion](learning-units-inventory/2026-11-06/transitive-minimality.md)
liegen vor: 923 unerfüllte Bedingungen in Mathematik und 396 in Physik.
Der Auditor prüft §7.3 nach Kantenentfernung und erneuter Vererbung; seine
Algorithmustests bestehen, die echte Bestandsvalidierung scheitert korrekt.
Das ist noch keine Einbindung als hartes Freigabegate in CI.

## 7. Die notwendigen Gegenbeispiele als Abnahmetests

Gemeinsame kleine Fixtures tragen backendseitige Berechnung und frontendseitige
Darstellung. Sie werden aus dem Vertrag abgeleitet, nicht aus momentanen
Produktionszählungen abgeschrieben:

1. Q1 belegt A vollständig, Q2 benötigt A und bleibt offen: A erledigt, Q2 offen.
2. `Q → B → A`, nur B direkt erreicht: kein aus dieser Tatsache abgeleitetes A;
   vollständige Voraussetzungspfade bleiben prüfbar. Mit freigegebenem bestandenem
   Q werden genau dessen vollständige Nachweise anerkannt.
3. Eine offene Karte, Kinderprüfung oder Elternsynthese wird nicht durch
   gewöhnliche Anerkennung bestanden. Vollständige Kinder bleiben vollständig.
4. Ein eigenes Experiment fehlt: eine reine Auswertungsprüfung erkennt das
   vollständige experimentelle Ziel nicht an. Eine passende mehrteilige Prüfung
   kann es nach ihrem einen regulären Bestehen nachweisen.
5. Größere Abdeckung, stärkere oder unbekannte Nachweisbedeutung unter derselben
   Prüfungs-ID: Veröffentlichung abweisen; alte Ergebnisse nicht aufwerten.
   Eine neue, nachweislich gleichwertige Aufgabenvariante darf dieselbe ID
   behalten und wird als positiver Gegenfall geprüft.
6. Fokus- oder Kurswechsel sowie Eltern-/Fremdprüfung: gültige globale Kompetenz
   bleibt erhalten; keine neue Pflicht wird durch eine ausgeblendete Sicht erfüllt.
7. Zwei Placements desselben Ziels: einmal im Gesamtfortschritt zählen.
   Implizite Anerkennung erhöht kein Tages-/Wochenarbeitsereignis.
8. Leere/fehlerhafte Einheit, falsche Zieltypen, fehlende Karten, falsche
   Variantenwahl, atomarer Zyklus oder widersprüchlicher Blockgraph: konkrete
   Validierungsfehler statt automatischer Fertigmeldung.
9. Direkter Prüfungsstart, Abbruch, erneuter Versuch, Mastery-Rücknahme und
   geladene Sitzung: konsistentes Ergebnis ohne veralteten Cache oder
   Zustandsübernahme zwischen Lernenden. Abgeleitete Anerkennung ist bei
   Rücknahme der einzigen gültigen Grundlage entsprechend neu zu berechnen.
10. Je neuer Prüfungsart zwei echte Bewertungsfälle: Ein wesentlicher
    Verständnisfehler fällt trotz maximaler übriger Punkte durch; ein sicherer
    Ansatz mit einem beiläufigen Rechenfehler kann gemäß normaler Rubrik bestehen.

Maschinelle Tests prüfen Vertrag und Konsistenz. Unabhängige fachliche
Aufgaben-/Rubrikprüfung bleibt zusätzlich nötig; beides beweist noch keine
pädagogische Wirksamkeit im Unterricht.

## 8. Nachnutzung und Arbeitsorganisation

Aus [PR #79](https://github.com/enpasos/skillpilot/pull/79),
[PR #82](https://github.com/enpasos/skillpilot/pull/82) und dem Archiv werden
brauchbare Werkzeuge, Quellenbefunde, einzelne Aufgaben und Tests gezielt
übernommen. Der alte Zuschnitt und auf ihn zugeschnittene Sollzählungen
bleiben verworfen. Für jede Übernahme werden Herkunft, notwendige Änderungen
und neue Abnahme festgehalten. Kein blindes Cherry-Pick der alten Gesamtlinie.

**Astra Ultra** verantwortet grundlegende Analysen, strittige Grenzen und das
unabhängige Review jeder neuen fachlichen Art von Nachweis.
**Sol 6.1 Ultra** übernimmt Inventare, Compiler/Runtime, Datenbearbeitung,
Aufgabenüberarbeitung, Tests und Dokumentationsabgleich nach diesem Vertrag.
Die fachliche Freigabe wird nicht durch eine bestandene Codeprüfung ersetzt.

Jeder Auftrag nennt begrenzte Dateien/Themen, konkrete Ausgabe und Abnahme.
Ein fachlich zusammenhängender, prüfbarer Stand wird früh committed und auf
einem passenden Main-basierten Branch gesichert. Ein PR enthält Problem,
sichtbares Ergebnis, Tests und noch offene Punkte. Bei geänderter Main-Basis
werden betroffene Befunde neu validiert. Keine mehrtägige ungesicherte
Sammeländerung und keine Neuaufteilung des Gesamtfachs während eines Reviews.

Das neue Goal wurde nach Abschluss des Planreviews angelegt und ist inzwischen
auf ausdrücklichen Wunsch pausiert. Es ist nicht erfüllt; bei späterer Fortsetzung bleibt es bis
zur vollständigen Mathematik- und Physikabnahme aktiv; ein fertiger Plan oder
erster Beispielablauf allein erfüllt es nicht. Sein Status wird über die
Meilensteine und tatsächlich abgenommenen Themen geführt.
