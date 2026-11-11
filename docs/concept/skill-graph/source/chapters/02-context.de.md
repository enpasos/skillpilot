## Stabile Ziele, kontextabhängige Struktur {#sec:context-model}

Die Abschnitte~@ref{sec:context-model} bis~@ref{sec:evidence-context} beschreiben die Verträge rund um den Skill-Graphen: curriculare Struktur, persönlichen Umfang, Zieltypen, Zeitplanung sowie Herkunft und Qualität.

Der Skill-Graph beantwortet, *was* eine lernende Person können soll und welche fachlichen Voraussetzungen dafür benötigt werden. Ein Bildungsgang beantwortet zusätzlich, *wo* diese Ziele verortet sind. Ein persönlicher Lernplan bestimmt, *wann* daran gearbeitet werden soll. Diese drei Fragen brauchen unterschiedliche Daten: Das Umordnen eines Lehrplans darf weder eine neue Kompetenz erzeugen noch bereits gespeicherte Ergebnisse löschen.

Das allgemeine Zielmodell unterscheidet vier semantische Ebenen und eine Darstellungsebene (Tabelle~@ref{tab:layers}). Es beschreibt die Richtung der schrittweisen Migration; nicht jede hier genannte Datenstruktur ist damit bereits in allen Skill-Landschaften vollständig umgesetzt.

:::table {#tab:layers caption="Fünf Modellierungsaufgaben, ein gemeinsamer Bestand stabiler Ziele." cols="27mm,X,X"}
| Ebene | Bedeutung | Beispiel und Grenze |
| --- | --- | --- |
| Ziele | Konkrete Kompetenzen und fachliche Bündel; hier liegen `requires` und `contains`. | Eine lineare Gleichung lösen; Grundlagen linearer Funktionen. |
| Programme | Jahre, Semester, Module, Phasen und andere strukturelle Einheiten. | Jahrgang 8 ist ein organisatorischer Abschnitt, keine Kompetenz. |
| Platzierungen | Kontextuelle Zuordnung eines Ziels zu einer Programmeinheit. | Dasselbe Ziel wird in einem Bildungsgang in Jahrgang 8, in einem anderen in Jahrgang 9 erworben. |
| Kompetenzachsen | Fachliche Taxonomien und querschnittliche Kategorien. | K1 „Mathematisch argumentieren“ ist eine Kategorie; „Argumentationslücken erkennen“ kann ein konkretes Ziel sein. |
| Kompositionssicht | Geprüfter Aufbau des sichtbaren Baums für einen aufgelösten Bildungsumfang. | Eine Landesansicht verweist auf kanonische Teilbäume, ohne deren Ziele zu kopieren. |
:::

### Identität trotz unterschiedlicher Einordnung {#sec:identity-across-contexts}

Die Identitäts-, Attribut- und Atomaritätsregeln aus Abschnitt~@ref{sec:core} gelten in allen Schichten unverändert. Eine neue Platzierung erzeugt deshalb keine neue Kompetenz. Ein Programmabschnitt vom Typ `exam` ist noch kein Prüfungsziel mit Aufgaben, Bewertungsraster und Lernergebnis. Und `phase: Q1` erzeugt weder eine Elternkante zu einem Q1-Knoten noch eine Voraussetzung zwischen Q1 und Q2.

Historische Bäume können Jahrgangs- und Phasenknoten als Kompatibilitätsgerüst enthalten. Im allgemeinen Zielmodell übernimmt explizite Programmstruktur diese Aufgabe; die fachlichen Ziele bleiben eigenständig. Der gleiche Inhalt kann so in mehreren Bildungsgängen anders eingeordnet werden, ohne seine Ziel-ID oder gespeicherte Ergebnisse zu kopieren.

### Platzierungen und Projektionen {#sec:placements-projections}

Eine *Projektion* leitet aus den Curriculumdaten einen sichtbaren Baum oder eine andere navigierbare Sicht ab. Sie gilt für einen *aufgelösten Kontext*, in dem Merkmale wie Bundesland, Schulform, Stufe, Dauer und Kursprofil festgelegt sind.

`programUnits` beschreiben im Zielmodell einen expliziten Baum oder Wald von Programmeinheiten. `goalPlacements` verbinden Ziele mit diesen Einheiten. Eine `primary`-Platzierung liefert den normalen Programmanker; `secondary` zeigt zusätzliche Relevanz, `assessed` einen Prüfungsbezug. Sekundäre und prüfungsbezogene Zuordnungen erzeugen keine weiteren sichtbaren Kopien desselben Ziels.

Für einen aufgelösten Kontext gilt: Genau eine passende primäre Platzierung ergibt einen eindeutigen Anker. Ohne passende Platzierung darf die Darstellung keinen Elternknoten erfinden. Mehrere passende primäre Platzierungen benötigen eine ausdrücklich geprüfte Auflösung; sonst ist die Projektion uneindeutig. Die Kontextmerkmale ändern dabei nicht die Ziel-ID.

Die normale Inhaltssicht folgt ausschließlich den expliziten `contains`-Kanten. Die Programmsicht folgt Programmeinheiten und Platzierungen. Die Kompetenzsicht folgt Katalogeinträgen und Kompetenzreferenzen. Die Reihenfolge der Kinder kommt aus der dafür deklarierten Datenreihenfolge; eine topologische Sortierung nach Voraussetzungen ist eine gesondert benannte didaktische Ansicht.

### Geprüfte Kompositionssichten {#sec:composition-views}

Eine *Kompositionssicht* beschreibt den sichtbaren oberen Aufbau eines Curriculums durch Strukturknoten, Beschriftungen, Reihenfolge und Referenzen auf kanonische Teilbäume. Sie enthält keine neu verfassten Atomziele und keine neuen `requires`-Kanten. Wo eine solche Sicht für den Kontext maßgeblich ist, darf ein Renderer sie nicht durch Vermutungen aus Titeln, `phase` oder alternativen Platzierungen überschreiben.

Zum Beispiel kann ein Gliederungsknoten „Mechanik“ eine `canonicalSubtree`-Referenz auf den kanonischen Kinematik-Cluster enthalten: Diese bindet dessen geprüfte `contains`-Unterstruktur ein. Eine `goalEntry`-Referenz kann daneben das einzelne kanonische Atom „Kräfte vektoriell addieren“ einbinden. Das sind Referenzen auf bestehende Ziele, keine neu verfassten Ziele. Ein Gliederungsknoten ist damit nicht automatisch ein fachlicher Cluster vom Typ `curricularArea`; diese Klassifikation braucht ihre eigene autoritative Festlegung.

Der aufgelöste Standardbaum muss jedes sichtbare Ziel höchstens einmal und unter höchstens einem sichtbaren Elternknoten zeigen. Ein globaler DAG kann mehrere fachliche Elternbezüge besitzen; die sichtbare Baumprojektion benötigt dafür eine deterministische, geprüfte Auflösungsregel. Überlappende Teilbaumreferenzen sind ohne einen solchen Vertrag ungültig. Eine Rollenregel für überlappende Referenzen ist noch keine Erlaubnis, Ziele im sichtbaren Baum zu duplizieren.

Die Kompilation soll früh erfolgen, in dieser Reihenfolge:

1. Kontext auflösen und die passende Sicht auswählen.
2. Kanonische Referenzen und ihre atomare Zielbasis auflösen.
3. Vollständige Voraussetzungsketten erhalten.
4. Rollen und sichtbare Eltern prüfen.
5. Das Ergebnis für die Laufzeit bereitstellen.

Die Hüllenbedingung aus Abschnitt~@ref{par:projection-closure} gilt auch dann, wenn die Sicht nur einen Teil der kanonischen Atome auswählt. Damit wird Strukturvalidierung möglich, bevor eine Benutzeroberfläche daraus einen Baum zeichnet.

#### Kanonische Identität bleibt erhalten.

Ein kanonischer Cluster darf durch eine direkte Referenz oder ausgeblendete Kinder kein eigenständig prüfbares oder beherrschbares Atom werden. Diese Regel gilt unabhängig davon, ob ein gesondertes `semanticKind`-Review vorliegt. Eine zusammengeklappte Darstellung repräsentiert ihre geprüfte kanonische atomare Zielbasis; Voraussetzungsprüfung, Fortschritt und Abschluss behalten diese Basis. `canonicalSubtree` oder ausdrückliche Referenzen auf die beabsichtigten kanonischen Atome legen sie fest. Eine Projektionsänderung darf einen vorhandenen Ergebniswert unter der Cluster-ID nicht auf Kindziele übertragen.

Ein autoritativ als `curricularArea` klassifizierter Cluster darf nicht über eine direkte `goalEntry`-Referenz als undurchsichtiges, atomar wirkendes Laufzeitziel erscheinen. Eine `canonicalSubtree`-Referenz erhält seine geprüften Nachfahren; alternativ benennt eine explizite Sichtstruktur die beabsichtigten Atomziele. Diese Darstellungsregel verändert keine Projektionsrolle.

#### Umsetzungsgrenze vom 9. und 10. November 2026.

Der bestehende kanonische Resolver verfolgt Voraussetzungsketten bereits rekursiv. Im Befund vom 9. November 2026 konnte ein älterer `goalEntry`-Pfad noch die Kinder eines kanonischen Clusters entfernen und ihn als atomaren Laufzeitknoten behandeln. Seit dem 10. November 2026 lösen die persönliche Lernlaufzeit und die WebGUI kanonische atomare Saatziele auf und bewahren die echten Zielnachfahren älterer direkter Clustereinträge; weitere Verbraucher sowie die vollständige native und curriculare Abnahme benötigen eigene Nachweise. Kompatibilität ist keine Erlaubnis, undurchsichtige Ersatzatome zu verfassen; Normalmodus und strikter Modus behalten ihre Fokusregeln.

:::sources
[Allgemeines Zielsystem und Migration](repo:docs/concept/skill-graph/general-goal-system-and-migration.md); [Sichten und Zielplatzierung](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md).
:::

## Persönlicher Umfang, Fokus und sichtbare Ziele {#sec:personal-scope}

### Vier Personalisierungsstufen {#sec:four-levels}

Die Auswahl „Schule“, „Hochschule“ oder „Sprachen“ ist zunächst Katalognavigation. Erst danach beginnen die vier Personalisierungsstufen, kurz Level~1 bis Level~4. Sie sind von den fachlichen Lerneinheiten (Abschnitt~@ref{sec:learning-units}) und von den Planungsstufen eines optionalen Zeitplans (Abschnitt~@ref{sec:levels}) zu unterscheiden.

1. **Basiscurriculum:** Ein ausdrücklich auswählbares Wurzelcurriculum stellt den Zielbestand bereit.
2. **Personal Curriculum:** Der längerfristig festgelegte, backendseitig verantwortete Bildungsumfang. Dazu gehören beim Schulcurriculum der Landes- beziehungsweise kanonische Kontext, gegebenenfalls das acht- oder neunjährige gymnasiale Dauermodell (`G8`/`G9`), eine ausdrücklich bestimmte Stufe, die Fächer und deren Kursprofile.
3. **Lernfokus und aktives Ziel:** Ein oder mehrere Wurzeln begrenzen vorübergehend den Arbeitsbereich; genau ein atomarer Lerngegenstand ist das aktuelle Ziel. Fokus und aktives Ziel sind veränderlich.
4. **Mastery:** Das binäre Ergebnis „geschafft“ oder „noch nicht geschafft“ gehört zur stabilen atomaren Ziel-ID. Die Ergebnisse bleiben bei Änderungen der Sicht oder des Fokus erhalten. Clusterfortschritt wird daraus abgeleitet.

`GK` und `LK` stehen für Grundkurs und Leistungskurs. In SkillPilot werden sie auch als technische Projektionslabels verwendet; wo die amtliche Kursstruktur abweicht, gilt die ausdrücklich deklarierte Zuordnung, ohne eine gleichnamige amtliche Kursart zu behaupten. Im bayerischen Mathematik-Rollout etwa bezeichnet `GK` das vollständige vierstündige Pflichtcurriculum auf erhöhtem Anforderungsniveau und `LK` diese Ziele zuzüglich aller fünf Module des gesonderten Mathematik-Vertiefungskurses: Ein Level-3-Fokus auf drei tatsächlich unterrichtete Module entfernt die übrigen zwei nicht aus dem Level-2-Zielumfang, dem Gesamtfortschritt oder dem Abschluss und behauptet kein wählbares bayerisches Leistungsfach Mathematik. Analog nimmt der Chemie-Rollout nach der Ownerentscheidung vom 16. Oktober 2026 zunächst alle verfassten Themen des geltenden Umfangs in die Zielprojektion auf, bevor ein vorgelagerter Themenwahlfluss folgt -- einschließlich des amtlich optionalen Arzneimittel-Themas in Schleswig-Holstein im vorläufigen `GK`/`LK`-Zielumfang, dessen amtlicher Wahlstatus erhalten bleibt, ohne eine allgemeine Lehrplanpflicht oder eine getroffene Lernendenauswahl zu behaupten. Ein Kursprofil ist ein Fachattribut und bestimmt nicht implizit die Schulstufe. Fehlende Angaben zur Stufe bleiben ungeklärt.

Eine Änderung des Personal Curriculum prüft Fokus und aktives Ziel erneut gegen die neue Zielmenge; sie darf globale Ergebnisse weder löschen noch neu vergeben. Die aktuelle Konfiguration des Personal Curriculum erfolgt über die dafür vorgesehenen Erstparteien-Oberflächen der SkillPilot-WebGUI. Der über den konkreten OpenAI-V1-Adapter angebundene Sprachmodell-Coach liest diesen Rahmen und präsentiert oder ändert diese Konfiguration nicht selbstständig.

Der vollständige persönliche Lernumfang ist nach der Ownerentscheidung vom 10. November 2026 $L = \Closure(S)$ aus Abschnitt~@ref{par:projection-closure}: Ausgangsziele und sämtliche auf dem ungekürzten kanonischen Skill-Graphen notwendigen atomaren Voraussetzungen. Er bleibt unabhängig von Mastery fest; vorhandene gültige Beherrschung zählt als erfüllt, nicht als Anlass zur Streichung oder Wiederholung. Ein enger Fokus reduziert nur den vorübergehenden Arbeitsbereich. Notwendige Ziele außerhalb des Fokus bleiben für Gesamtfortschritt und Abschluss maßgeblich; Fokusabschluss ist kein Abschluss des gesamten Personal Curriculum.

### Zielrolle und Voraussetzungshilfe {#sec:projection-roles}

Eine Referenz in einer Kompositionssicht kann ausdrücklich eine von zwei *Projektionsrollen* tragen:

:::description
- **`target`.** Das Ziel gehört zur auswählbaren Lernmenge, zur Frontier, zum Fortschritt und zum Abschluss dieser Sicht.
- **`prerequisiteOnly`.** Das Ziel bleibt für Voraussetzungsprüfungen mit seiner globalen Identität und seinem gespeicherten Zustand verfügbar; es ist in dieser Sicht kein auswählbares Ziel und zählt nicht zum lokalen Fortschrittsnenner.
:::

Fehlt eine Rollenangabe, gilt `target`. Teilbaumreferenzen vererben ihre Rolle an Nachfahren. Bei überlappenden Rollenfestlegungen entscheidet die Spezifität: Eine direkte `goalEntry`-Referenz geht einer Teilbaumvererbung vor; eine nähere Teilbaumwurzel geht einer breiteren vor; erst bei gleicher Spezifität gewinnt `target`. Diese Regel löst die Rolle, nicht eine ansonsten unzulässige doppelte Darstellung.

Verfasste Fachrollen werden nicht aus Alter oder Phase erraten. Die ausdrücklich autorisierte persönliche Hüllenbildung ergänzt dagegen notwendige atomare Erwerbsziele im Gesamtplan $L$. Sie ändert keine verfasste Fachrolle und erzeugt keine neuen Abhängigkeiten. Ein mathematisches Ziel kann in Mathematik ein Lernziel und in Physik eine unterstützende Voraussetzung sein. Eine gemeinsame Planung identifiziert es dennoch nur einmal. Seine Physikrolle löscht keine Mathematikergebnisse und erzeugt auch keinen zweiten Kompetenzerwerb. Ein notwendiges Atom darf jedoch nicht im gesamten Personal Curriculum bloße Voraussetzungshilfe ohne Erwerbsziel bleiben. Amtliche Lehrplanzuordnung und die Aufnahme als notwendige Vorbereitung sind getrennte Aussagen. Backend und WebGUI setzen den persönlichen Lernumfang um; Anwendbarkeitsprüfung und Migrationsabnahme bleiben gesondert offen.

Die Ownerentscheidung vom 10. November 2026 ersetzt am persönlichen Kompilationsrand die frühere pauschale Pflicht vom 7. November, jede erreichbare Voraussetzung manuell mit einer Rolle zu referenzieren:

- Verfasste Ausgangsreferenzen und lokale Rollen bleiben geprüft.
- Die abgeleitete globale Zielrolle eines notwendigen Atoms genügt zusammen mit geprüftem kanonischem Voraussetzungspfad und dokumentierter Herkunft; eine manuelle Ziel- oder Hilfsreferenz je Atom ist nicht nötig.
- Unbekannte Referenzen, Zyklen sowie fehlende oder im Gesamtplan nicht erreichbare beziehungsweise nicht berücksichtigte notwendige Atome bleiben harte Fehler, unabhängig von Mastery und Fokus.

Diese Gültigkeitsprüfung ist von der späteren Level-3-Fokuswahl getrennt: Eine gültig aufgelöste Voraussetzung außerhalb des Fokus blockiert den Normalmodus weiterhin nicht.

Nach der Ownerentscheidung vom 11. November 2026 gehören diese harten Fehler in Validierung, Curriculum-QA und native Abnahme, nicht in Lesezugriffe von Lernenden. Ist der kanonische Graph eines Lernkontexts nicht strikt kompilierbar, behält die Laufzeit den geprüften Ausgangsumfang ohne abgeleitete Hülle, beansprucht keine Lernbasis, bietet kein Ziel mit gebrochenem Voraussetzungsbedarf an und protokolliert den Fehler einmal je Curriculum und Fehlercode; Lernstand, Ergebnisse und Export bleiben lesbar. Fehler in der Ausgangsauswahl selbst bleiben harte Fehler. Die Regel erfasst die vielen nichtkanonischen Curricula, deren Wurzelcluster sein eigenes Orientierungsziel enthält und voraussetzt, und ändert deren Daten nicht.

*Beispiel im Übergangsbestand:* Ein Physikziel $g$ benötigt einen Mathematik-Cluster $k$. Seine kanonische atomare Basis und deren transitive Anforderungen werden vor Anzeigefiltern aufgelöst. Eine fachlokale `prerequisiteOnly`-Referenz auf $k$ kann erhalten bleiben. Jedes wirklich notwendige Atom braucht dennoch ein Erwerbsziel im gesamten Personal Curriculum, etwa in Mathematik oder als abgeleitete Vorbereitung. Keine manuelle Referenz je Atom und kein ganzes zusätzliches Fach ist dafür nötig. Kanonische Identität, Quellenzuordnung und Mastery bleiben erhalten.

### Anwendbarkeit ist keine Platzierung {#sec:applicability-vs-placement}

`applicability` enthält kompilierte Metadaten für Sichten, etwa für einen Bundeslandfilter. Sie wird aus überprüfbaren Quellen, Mappings, Provenienz und begründeten Ausnahmen gewonnen. Sie beantwortet, in welchem Kontext ein Ziel sichtbar ist. Eine Platzierung beantwortet, wo es in einer Programmstruktur liegt. Keine der beiden Angaben ist ein Beweis für individuelle Beherrschung.

Bei landesspezifischen Ergänzungen kann eine ausdrücklich deklarierte Vererbungsgrenze verhindern, dass eine breite Quellenzuordnung eines Vorfahren als Quellenbeleg aller neuen Nachfahren ausgegeben wird. Direkte Quellen und Zuordnungen im Ergänzungszweig bleiben maßgeblich. Ebenso kann die Sichtbarkeit eines lokalen Übungs- oder Prüfungsendpunkts unter einem dafür vorgesehenen Vertrag aus seinen Voraussetzungen abgeleitet werden. Das belegt seine Anwendbarkeit, nicht automatisch seine Lehrplanabdeckung.

### Fokuswechsel ohne impliziten Kompetenzerwerb {#sec:focus-switch}

Ein Fokus besteht aus der Vereinigung der gewählten Wurzeln und ihrer sichtbaren Nachfahren, eingeschränkt auf das Personal Curriculum. Im Normalmodus werden die transitiven effektiven Voraussetzungen innerhalb dieses Fokus geprüft; der ausdrücklich gewählte strikte Modus prüft global. Eine außerhalb liegende Voraussetzung wird im Normalmodus weder zum Hindernis noch dadurch gemeistert. Die formalen Unterschiede der Frontier-Berechnung stehen in Abschnitt~@ref{sec:filter-modes}.

Eine Fokusausweitung folgt dem eindeutigen sichtbaren Elternpfad. Die Backendoption muss eine echte Obermenge liefern und mindestens ein noch offenes Ziel hinzufügen. Bei mehreren Wurzeln ersetzt sie nur den abgedeckten Zweig und bewahrt die unabhängigen Wurzeln. Der Coach übernimmt die veröffentlichte Option vollständig und wartet vor der Änderung auf die Zustimmung der lernenden Person.

Eine automatische Ausweitung wird erst nach tatsächlichem Abschluss des aktuellen Fokus vorgeschlagen. Eine leere Frontier kann auch einen blockierten, unvollständigen Fokus bedeuten. Sie beweist keinen Abschluss. Nach der Ausweitung werden neu enthaltene, unbeherrschte Voraussetzungen regulär geprüft: Die Beherrschung eines abhängigen Ziels überträgt keine Mastery rückwärts. Eine aus einem gültigen lokalen Vertrag bereits abgeleitete Anwendung bleibt dagegen global effektiv beherrscht. Spätere Verbraucher, also Ziele, die diese Kompetenz voraussetzen, und neue Plan- oder Fokusauswahlen öffnen sie nicht erneut.

:::sources
[Personalisierungsstufen](repo:docs/concept/levels-of-personalization.md); [Projektionsrollen und Sichtvertrag](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md).
:::

## Zieltypen und die Bedeutung eines Ergebnisses {#sec:goal-types}

Der Skill-Graph erhält je Ziel nur das fertige, zieltypgerecht ermittelte Ergebnis. Er entscheidet nicht selbst, ob eine Antwort fachlich überzeugend war, ein Orientierungsgespräch angemessen abgeschlossen wurde oder alle Karten eines Decks sicher abgerufen wurden. Diese Entscheidungen gehören zum Abschlussvertrag des jeweiligen Zieltyps.

Das Ergebnis jedes Lernziels bleibt binär: geschafft oder noch nicht geschafft. Der Zieltyp bestimmt, wann es als geschafft gilt. Bei einem Inhaltsziel ist dies ausdrücklich festgestelltes Verstehen; eine gültige Prüfungsableitung belegt darüber hinaus selbstständige Anwendung. Bei Orientierung ist es der abgeschlossene motivierende Einstieg, kein fachliches Zertifikat. Bei Memorierung ist es der eigene bestandene Abschlussnachweis durch kontrollierten Abruf der erforderlichen Karten. Bei einem Prüfungsziel ist es die bestandene Prüfung. Unterschiede der Abschlussbedingungen erzeugen keine zusätzlichen Mastery-Stufen oder parallelen Zielergebnisse. Tabelle~@ref{tab:goal-types} fasst die vier Zieltypen zusammen.

:::table {#tab:goal-types caption="Die vier Zieltypen und die Bedeutung ihres binären Ergebnisses." cols="27mm,X,X,21mm"}
| Zieltyp | „Geschafft“ bedeutet | Das Ergebnis entsteht durch | Implizit ableitbar |
| --- | --- | --- | --- |
| Inhaltsziel | Verstehen ist festgestellt; bei impliziter Beherrschung ist selbstständige Anwendung belegt. | Ausreichend belegte Beherrschung im coachgeführten Ablauf (Abschnitt~@ref{sec:understanding}) oder einen gültigen lokalen Vertrag (Abschnitt~@ref{sec:assessment}). | ja |
| Orientierungsziel | Der motivierende Einstieg ist erledigt; kein Fachnachweis. | Vertiefung, Zusammenfassung und Zustimmung zum Abschluss (Abschnitt~@ref{sec:orientation}). | nur als Marker |
| Memorierziel | Der Abschlussabruf der erforderlichen Karten ist bestanden. | Verifizierten Abruf der erforderlichen Karten ohne Kartenhilfe (Abschnitt~@ref{sec:memory}). | nein |
| Prüfungsziel | Die Prüfung ist bestanden. | Bewertung der vollständigen Einreichung nach Raster (Abschnitt~@ref{sec:exams}). | nein |
:::

### Verstehen und Anwenden {#sec:understanding}

Ein Inhaltsziel beschreibt konzeptuelles oder prozedurales Verstehen. Die Beurteilung muss die in der Beschreibung verlangten Aspekte abdecken. Eine gelöste Aufgabe ist ein möglicher Beleg, aber nicht schon per Definition die Beherrschung des ganzen Ziels. Mehrschrittiger Transfer in einer Aufgabe kann ausreichend sein; eine pauschale Mindestzahl von Aufgaben wäre ebenso unbegründet wie das automatische Anerkennen jeder richtigen Einzelantwort.

Im coachgeführten Ablauf wird eine ausreichend belegte Beherrschung unmittelbar gespeichert. Erst eine bestätigte Speicherung erlaubt die Aussage, das Ergebnis sei gesichert. Eine zusätzliche Zustimmung zum Speichern ist kein fachlicher Nachweis und wird für den regulären Erfolgsfall nicht als weitere Abschlussbedingung eingeführt. Der anschließende Themenwechsel bleibt eine andere Entscheidung: Der Coach bietet das backendseitig gewählte nächste Thema an und wartet auf erkennbares Einverständnis, bevor neues Material beginnt.

### Orientierung als eigener Abschlussvertrag {#sec:orientation}

Ein autoritativ als `orientation` klassifiziertes Ziel zeigt konkrete Möglichkeiten und ehrliche positive Perspektiven des folgenden Lernstoffs. Es prüft weder Vorwissen noch Fachbegriffe, Rechenfertigkeiten, Abruf, Transfer oder Prüfungsleistung. Wie bei allen Lernzielen ist das Ergebnis binär; eine Prozentbewertung der persönlichen Motivation wäre zudem inhaltlich irreführend.

Der Ablauf hat drei Schritte:

1. **Vertiefung.** Wählt die lernende Person eines der angebotenen Interessen, beginnt dadurch zunächst eine passende motivierende Vertiefung. Der Coach verknüpft das Interesse mit etwas Konkretem, das die Person verstehen, erkunden, gestalten oder tun kann, und lädt zu einer einfachen persönlichen Reaktion, Wahl oder Frage ein. Das bloße Wiederholen eines Angebotslabels schließt die Orientierung nicht ab.
2. **Zusammenfassung.** Nach einer sinnvollen Antwort auf diese Vertiefung oder dem ausdrücklichen Wunsch, die Orientierung zu verlassen, folgt eine positive Zusammenfassung mit einem gesonderten Abschlussangebot.
3. **Abschluss.** Erst die weitere Zustimmung dazu begründet den Abschlussmarker.

Dieser Ablauf darf weder als Fachprüfung umgedeutet noch auf normale Inhaltsziele übertragen werden. Orientierungsknoten sind reine voraussetzungsfreie atomare Einstiege; Prüfungs- und Memorier-Metadaten gehören nicht auf denselben Knoten.

Bei einem echten Neueinstieg ohne bisherigen Fortschritt im projizierten Umfang sind offene Orientierungsziele die einzigen auswählbaren Frontier-Ziele. Lernende mit bereits bestehendem Fachfortschritt werden nicht auf diese Einstiegsregel zurückgesetzt.

### Memorierung: Übung und verifizierter Abruf {#sec:memory}

Ein Memorierziel bündelt die erforderlichen Karten eines Decks. Drei Dinge sind dabei zu unterscheiden:

- **Kartenübung.** Ein Spaced-Repetition-System (SRS), also ein System für zeitlich verteilte Wiederholung, steuert die Übungsintervalle der Karten.
- **Verifizierter Abruf einer Karte.** Der kontrollierte Abruf hält fest, ob eine Karte ohne Kartenhilfe richtig beantwortet wurde. Umdrehen oder Selbsteinschätzung während der Übung sind kein solcher Nachweis.
- **Abschluss des Ziels.** Den Nachweis der Beherrschung des Lernziels gibt seine eigene bestandene Abschlussprüfung über die erforderlichen Karten, der *Abschlussabruf*.

Kartenprozess und Zielabschluss sind zu unterscheiden; sie erzeugen keine zweite Mastery-Stufe oder ein zusätzliches gespeichertes Zielergebnis.

#### Abschlussbedingung.

Sei $\operatorname{Cards}(g)$ die vollständig aufgelöste, gültige Menge erforderlicher Karten des Memorierziels $g \in A_{\mathrm{mem}}$. Mit $\operatorname{RecallPassed}(g)$ wird hier nur der ausdrücklich festgestellte erfolgreiche Abschlussabruf über diese erforderliche Kartenmenge bezeichnet. Dieser eigene Zielabschluss ist kein bloßes Zusammenzählen aktueller Einzelkartenflags und kein neues Datenfeld oder zusätzliches Prüfungsziel. Dann gilt

$$
\Complete_{\mathrm{memory}}(g) \iff \operatorname{RecallPassed}(g).
$$

Fehlende oder unaufgelöste Kartendaten sind kein leeres, automatisch abgeschlossenes Deck. Das bloße Abarbeiten einer fälligen Übungswarteschlange ersetzt den Abschlussnachweis nicht.

#### Fälligkeit nimmt den Abschluss nicht zurück.

Gewöhnliche abgeschlossene Lernziele erhalten keine Wiederholungsfälligkeit. Bei Memorierzielen betrifft eine spätere Fälligkeit die Kartenübung und zieht einen festgestellten Zielabschluss nicht automatisch zurück. Auch ein späterer freiwilliger Kartenabruf betrifft zunächst dessen Prozesszustand; daraus wird kein automatischer Entzug abgeschlossener Ziel-Mastery abgeleitet. Die frühere Sollformel „alle Karten verifiziert und keine Karte fällig“ ist durch die bindende Ownerklarstellung überholt.

#### Kartenübung nach SM-2.

Der gegenwärtig dokumentierte SRS-Vertrag verwendet Zustand nach dem Verfahren SM-2 (SuperMemo 2) mit Intervall, Wiederholungszähler, Leichtigkeitsfaktor und nächstem Wiederholungsdatum. Eine Karte ohne gespeicherten Zustand ist fällig. Erfolgreiche Übung verlängert nach den festgelegten Regeln das Intervall; unzureichende Übung setzt die Wiederholungsfolge zurück. Diese Zeitplanung ersetzt den verifizierten Abruf nicht.

#### Ablauf des verifizierten Abrufs.

Einen verifizierten Abruf, die *harte Abfrage*, kann die lernende Person beim aktiven Memorierziel auch beginnen, wenn die SRS-Warteschlange noch nicht leer ist. Zuerst wird nur die Frage abgerufen, dann antwortet die Person ohne Kartenhilfe. Erst anschließend wird die erwartete Antwort geladen und der Abruf als bestanden oder fehlgeschlagen gespeichert. Ein bestandener Abruf aktualisiert auch die SRS-Spur als starke erfolgreiche Wiederholung. Ein Fehlschlag hebt den verifizierten Status dieser Karte auf und führt sie in die Übung zurück.

#### Implementierungsgrenze.

Die historische Codeprüfung beschrieb die Ableitung aus den aktuellen Abrufflags in `LearnerService` und `useSrsMastery`. Dieser Befund ist keine neue Sollregel für einen Mastery-Entzug und kein vollständiger Nachweis des Abschlussvertrags. Die vorliegende Dokumentkorrektur ändert weder Laufzeit noch Lernerdaten. Die allgemeine Abschlussberechnung verwendet dasselbe binäre Zielergebnis und führt keine eigene Anerkennung von Memorier-Mastery ein.

### Prüfungsziele im geltenden Ablauf {#sec:exams}

Prüfungsziele verwenden `examData` mit Aufgabeninhalt, Lösungsinhalt und Bewertungsraster. Das Raster enthält maximale Punkte, Bestehensgrenze und bewertbare Schritte. Für gültig vergebene Schrittpunkte $p_j$ gilt im aktuellen Vertrag:

$$
\Score = \min\!\left\{\sum_j p_j,\;\MaxPoints\right\}, \qquad \Passed \iff \Score \ge \PassingPoints.
$$

Die Punktevergabe folgt den einzelnen Rastervorgaben. Die Gesamtsummenformel allein legitimiert keine frei erfundenen Punkte, negativen Bewertungen oder Änderungen des Aufgabeninhalts.

#### Zugang.

Der normale Lernzugang prüft transitive effektive Voraussetzungen einschließlich der atomaren Erfüllung erforderlicher Cluster. Für Prüfungen gilt zusätzlich der allgemeine *direkte Prüfungszugang*: Fehlende Vorbereitungs-Mastery sperrt einen bewusst gewählten Prüfungsversuch nicht. Aufgabenverfügbarkeit, persönlicher Geltungsbereich und autorisierte Sitzung bleiben erforderlich. Der bestehende direkte Prüfungszugang ist von der neuen, auf der Hauptlinie **noch nicht implementierten** Ableitung globaler impliziter Beherrschung zu trennen.

#### Ablauf im Prüfungsmodus.

Im Prüfungsmodus erhält die Person die vollständige, unveränderte Aufgabe und bearbeitet sie ohne inhaltliche Hilfen. Ihre vollständige Einreichung wird anhand des Rasters bewertet. Bei Erfolg wird Mastery unmittelbar gespeichert. Ein Fehlversuch speichert weder Ergebnis noch Punkte und lässt vorhandene Mastery bestehen. Erst die bestätigte Speicherung erlaubt die Aussage, der Erfolg sei gesichert.

#### Nach der Bewertung.

Nach der Bewertung erhält die Person Ergebnis, Punkte, Begründung und Lösung; neues Material beginnt nach ihrer weiteren Entscheidung. Die unbegrenzte Wiederholung derselben Aufgabe bleibt möglich. Bekannte Lösungen können die Aussagekraft eines Versuchs verringern, erzeugen aber keine zweite Anerkennungsstufe: Vorhandene Prüfungs-Mastery bleibt ein ausdrücklicher Erfolg dieses Prüfungsziels. Weitergehende Anwendungsbeherrschung setzt den gültigen fachlich geprüften lokalen Vertrag voraus; ein alter ungeprüfter Punkteschlüssel genügt dafür nicht automatisch. Es gibt keine zusätzliche pro Lernendem zu speichernde Qualifikationsart oder zweite Teilprüfung.

:::sources
[Zieltypen und Prüfungsablauf](repo:docs/concept/skill-graph/node-types.md); [Projektregeln zu Orientierung, Evidenz und Fortsetzung](repo:AGENTS.md); [Backend-Ableitung von Memorier-Mastery](repo:backend/src/main/java/com/skillpilot/backend/service/LearnerService.java); [Frontend-Ableitung von Memorier-Mastery](repo:app/src/hooks/useSrsMastery.ts).
:::

## Zeitplanung als ergänzende Sicht {#sec:time-context}

Ein Zeitplan bindet einen erklärten Zielumfang, eine Curriculumfassung, Kalender, verfügbare Kapazität und Planungsversion. Absolute Termine gehören nicht auf kanonische Ziele, Cluster oder Platzierungen. Derselbe Inhalt kann in verschiedenen Kursen zu verschiedenen Zeiten bearbeitet werden, ohne seine fachliche Identität zu ändern.

Die Zeitplanung ist eine zusätzliche Ausführungsplanung und keine fünfte Personalisierungsstufe. Sie darf Ziele priorisieren, die im aktuellen Arbeitsbereich verfügbar sind. Sie erzeugt keine Voraussetzungskanten, keine neue Frontier und keine Lernergebnisse. Die Lerneinheit beschreibt den fachlichen Erwerbszusammenhang; ein datierter Ablaufplan muss zusätzlich gewährleisten, dass eine Voraussetzung rechtzeitig vor ihrer geplanten Verwendung erarbeitet wird.

Verfügbare Kapazität berücksichtigt tatsächliche Unterrichts- oder Lernminuten nach Ferien, Ausfällen und anderen Ausschlüssen. Aktivitäten, geschützte Reserve und verbindliche Fachbudgets müssen darin ohne Doppelzählung Platz finden. Die formale Budgetprüfung und ihre Anforderungen an kalibrierte Aufwandsschätzungen folgen in Abschnitt~@ref{sec:levels}.

Plan-Soll und tatsächliche Zielerreichung verwenden denselben benannten Umfang. Ausdrückliche Ergebnisse und gültig abgeleitete Anwendungsbeherrschung bilden gemeinsam den globalen IST; eine zusätzliche manuelle Unterrichtsabdeckung begründet oder verbirgt keinen Abschluss. Fehlende Ergebnisse bleiben als nicht verfügbar erkennbar. Neue Planrevisionen dürfen historische Ziele, Ergebnisse und frühere Aussagen nicht stillschweigend umdeuten.

Der dokumentierte lokale Planungspilot und die angestrebte backendseitig maßgebliche Architektur sind getrennt zu betrachten. Insbesondere behauptet die Einheitendefinition noch keine implementierte fachübergreifende Budgetprüfung.

:::sources
[Zeitachse, Kapazität und Planungsgrenzen](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md).
:::

## Herkunft, Materialien und belastbare Qualitätsaussagen {#sec:evidence-context}

### Drei Arten von Verweisen {#sec:three-links}

Curriculare Herkunft, eigene Veranschaulichung und optionales Lernmaterial haben verschiedene Funktionen. Ein offizieller Quellenverweis begründet die Aufnahme oder Formulierung eines Lernziels. Ein eigenes Lernzielbild veranschaulicht dessen Kernidee. Ein Buch, Video oder eine Simulation kann bei der Erarbeitung helfen. Keiner dieser Verweise ist für sich ein individueller Kompetenznachweis.

Die verbindliche Inhaltsarchitektur lautet: Materialien referenzieren das Curriculum; das Curriculum wählt keine Materialanbieter. Neue optionale externe Lernmaterialien gehören in getrennte Inhaltspakete, die auf stabile Ziel-IDs verweisen. Die Auswahl eines Pakets verändert weder Personal Curriculum noch Voraussetzungen, Mastery oder Abschlussregeln. Unvollständige Materialabdeckung darf normale Lernarbeit nicht sperren.

Offizielle Quellen, Mappings und strukturierte Provenienz bleiben am Curriculum nachvollziehbar. Eigene Zielvisualisierungen behalten ihren gesonderten kanonischen Referenz- und Qualitätsvertrag. Bestehende externe Links auf kanonischen Zielen sind gegebenenfalls Migrationsbestand; daraus folgt keine dauerhafte zweite Autorenarchitektur. Eine reine Linklieferung belegt außerdem nicht, dass ein Coach den verknüpften Inhalt gelesen hat.

### Quellenbegründung für Ziele und Beziehungen {#sec:source-rationales}

Eine überprüfbare Herkunftskette verbindet das kanonische Ziel mit einer Quelle, einem konkreten Quellabschnitt, einer nachvollziehbaren Extraktion und einer geprüften Mappingentscheidung. Diese kann eins zu eins, teilweise, aggregierend oder auf mehrere Ziele aufteilend sein. Eine verständliche Begründung erklärt diese Form, anstatt jede Zuordnung als wortgleiche Lehrplanübernahme darzustellen.

Für `requires` und `contains` ist ebenfalls zu unterscheiden, ob eine Beziehung ausdrücklich in der Quelle steht oder eine fachlich begründete Modellierungsentscheidung ist. Ein plausibler Zieltext erlaubt keine nachträglich erfundene Provenienz. Ungeklärte Quellen, veraltete Fassungen und widersprüchliche Zuordnungen bleiben sichtbare Befunde.

Die menschenlesbare Begründung ist eine Darstellung vorhandener Evidenz, kein zweites führendes Register. Strukturierte Referenzen und Fingerprints ermöglichen, dieselbe Begründung in Dokumenten, Exporten und Laufzeitwerkzeugen konsistent auszugeben. MEM (*Metadata for Educational Media*) verknüpft digitale Bildungsmedien mit Lehrplaninhalten und Kompetenzzielen; FWU steht für das Institut für Film und Bild in Wissenschaft und Unterricht gGmbH, dessen Lehrplanontologie hier gemeint ist (siehe den [MEM/FWU-Roundtripplan](repo:docs/concept/skill-graph/mem-fwu-roundtrip-plan.md)). Ein zusätzlicher Abgleich mit diesen Lehrplandaten kann die klassische Quellenroute stützen oder infrage stellen; er ersetzt sie nur unter einem ausdrücklich geprüften Vertrag für den konkreten Umfang.

### Algorithmische Gültigkeit und fachliche Qualität {#sec:quality-levels}

Die Ebenen der Qualität bauen aufeinander auf, sagen aber nicht dasselbe aus. Ein Parser erkennt fehlerhaftes JSON; eine Referenzprüfung unbekannte IDs; ein Zyklustest unerlaubte Kantenfolgen. Keiner dieser Tests beurteilt allein, ob die Kompetenz sinnvoll geschnitten, eine Erklärung verständlich oder eine Aufgabe didaktisch geeignet ist.

Die in Abschnitt~@ref{sec:validity} erläuterten Gültigkeits- und Routenprofile brauchen jeweils einen benannten Prüfumfang. Ein lokales Migrationsgate oder ein einzelner grüner Strukturcheck bestätigt nicht automatisch sämtliche Anforderungen an Skill-Graph, Projektion und Lernbarkeit.

Für vertiefte Curriculum-QA unterscheidet SkillPilot fünf gleichzeitig aktuelle Nachweisbereiche. Ihre Kürzel D, P, A, M und V sind Namen dieser Bereiche, keine Formelzeichen:

- **D -- Beschreibung:** Ist der Zieltext fachlich korrekt und klar?
- **P -- positive Verständnisnachweise:** Welche beobachtbare Leistung zeigt das geforderte Verständnis?
- **A -- Atomarität:** Ist die Kompetenz sinnvoll zugeschnitten?
- **M -- Memory:** Ist die Entscheidung über notwendige Memorieranteile begründet und aktuell?
- **V -- Visualisierung:** Ist die Darstellung fachlich geeignet und an die geprüften Bild- und Zielstände gebunden?

Die Reifegrade M0 bis M7 ordnen die maschinelle Curriculum-QA; sie haben nichts mit der Mastery-Menge $M$ zu tun (Anhang~@ref{sec:rule-milestones}). Der Reifegrad M7 bezeichnet den vollständigen geltenden maschinellen Abschluss dieser Anforderungen und der vorausgesetzten unteren Reifegrade für den erklärten Umfang. Er ist keine menschliche Freigabe, keine menschliche Erprobung und kein Nachweis von Lernwirksamkeit. Solche Aussagen benötigen eigene Prüfungen und eigene Evidenz. Auch mehrere übereinstimmende KI-Reviews ersetzen keine gesondert vorgeschriebene menschliche Entscheidung.

Eine Prüfung bindet die genaue Fassung ihrer Gegenstände. Ein gültiges Bildreview für einen alten Asset-Hash bestätigt nicht das neue Bild. Eine Änderung von Zieltext oder Voraussetzungen kann bisherige inhaltliche Evidenz berühren; ein rein technischer Umzug kann unter einem eng begründeten Kompatibilitätsnachweis anders zu behandeln sein. Beides darf nicht durch pauschales Erneuern von Hashes verborgen werden.

### Veröffentlichung und Austausch {#sec:publication-interchange}

Fachliche Änderungen erfolgen in kanonischen Autorenquellen. Pakete, Bücher, Bilder und Validierungsberichte werden daraus neu gebaut; historische veröffentlichte Archive bleiben unverändert.

JSON- und Ontologiepakete sollen aus demselben fachlichen Stand entstehen. Das JSON-Laufzeitmodell ist die normative Referenz. Der Ontologie-Roundtrip muss Zielidentitäten, Relationen, Rollen, Texte und weitere fachliche Felder gemäß ihrem Gleichheitsvertrag erhalten. Unterschiedliche JSON-/RDF-Texte benötigen semantische Gleichheit, binäre Ressourcen identische Bytes. Das Austauschformat darf keine abweichende Laufzeitsemantik einführen.

Externe Zielreferenzen müssen vollständig aufgelöst sein. Ein Physikpaket mit mathematischen Voraussetzungen benötigt deren Definitionen; leere Platzhalter genügen nicht. Diese vollständige fachliche Hülle (*Closure*) bestimmt noch nicht, welche Ziele für die Person als `target` auswählbar sind.

Veröffentlichungs- und Prüfaussagen nennen Artefakt, Umfang, Version und gebundene Quellen. Ein lokaler Build beweist weder Hostanzeige noch pädagogische Wirksamkeit. Dieses Kompendium erteilt keine Release- oder Produktionsfreigabe.

### Lizenzen und private Lernergebnisse {#sec:licensing-privacy}

Apache-2.0 gilt für Software, technische Schemas, Entwicklerdokumentation und funktionale Coachanweisungen; CC-BY-4.0 für eigene Skill-Landschaften, Zieltexte, didaktische Aufgaben, Karten, Bilder und Bildungsdokumentation. Maßgeblich ist die Funktion, nicht die Dateiendung. Gemischte Sammlungen sind nicht pauschal doppelt lizenziert.

Fremde Quellen, Abhängigkeiten, Medien und Marken behalten ihre Bedingungen. Quellenangabe und KI-Herkunft belegen weder Rechte noch Qualität. Exporte führen anwendbare Lizenzen, Herkunft und Änderungen mit. Private Ergebnisse, Sitzungsdaten und Gespräche gehören weder unter die öffentliche Inhaltslizenz noch in öffentliche Quellen- oder Reviewpakete.

:::sources
[Materialien](repo:docs/concept/skill-graph/source-and-resource-links.md); [Quellenbegründungen](repo:docs/concept/skill-graph/human-readable-source-rationales.md); [Graphvalidierung](repo:docs/qa-ci/graph-validation-rules.md); [Curriculum-QA](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md); [Lernzielbuch](repo:docs/concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md); [Pakete](repo:docs/concept/skill-graph/dual-curriculum-package-releases.md); [Lizenzen](repo:LICENSING.md).
:::
