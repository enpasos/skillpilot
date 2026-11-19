## Stabile Ziele, kontextabhängige Struktur {#sec:context-model}

Die Abschnitte~@ref{sec:context-model} bis~@ref{sec:evidence-context} beschreiben die Verträge rund um den Skill-Graphen: curriculare Struktur, persönlichen Umfang, Zieltypen, Zeitplanung sowie Herkunft und Qualität.

Der Skill-Graph beantwortet, *was* eine lernende Person können soll und welche fachlichen Voraussetzungen dafür benötigt werden. Ein Bildungsgang beantwortet zusätzlich, *wo* diese Ziele verortet sind. Ein persönlicher Lernplan bestimmt, *wann* daran gearbeitet werden soll. Diese drei Fragen brauchen unterschiedliche Daten: Das Umordnen eines Lehrplans darf weder eine neue Kompetenz erzeugen noch bereits gespeicherte Ergebnisse löschen.

Das allgemeine Zielmodell unterscheidet vier semantische Ebenen und eine Darstellungsebene (Tabelle~@ref{tab:layers}). Es beschreibt die Richtung der schrittweisen Migration; nicht jede hier genannte Datenstruktur ist damit bereits in allen Skill-Landschaften vollständig umgesetzt.

:::table {#tab:layers caption="Fünf Modellierungsaufgaben, ein gemeinsamer Bestand stabiler Ziele." cols="27mm,X,X"}
| Ebene | Bedeutung | Beispiel und Grenze |
| --- | --- | --- |
| Ziele | Konkrete Kompetenzen und fachliche Bündel; hier liegen `requires` und `contains`. | Eine lineare Gleichung lösen; Grundlagen linearer Funktionen. |
| Einheiten und Programme | Kanonische fachliche Einheiten (erklärte Cluster mit Lernversprechen und `after`), gemeinsame Landesplaneinheiten (Stufen, Jahrgänge, Phasen) sowie organisatorische Programmeinheiten (im Vertrag 1.2 vorläufig auch `learningUnit`). | Jahrgang 8 und Kurshalbjahr Q1 sind Planeinheiten, keine Kompetenzen. |
| Platzierungen | Landesplan-Verortung (*geführt in* vs. *steht in*) sowie kontextuelle Zuordnung eines Ziels zu einer Programmeinheit. | Dasselbe Ziel wird in einem Bildungsgang in Jahrgang 8, in einem anderen in Jahrgang 9 erworben. |
| Kompetenzachsen | Fachliche Taxonomien und querschnittliche Kategorien. | K1 „Mathematisch argumentieren“ ist eine Kategorie; „Argumentationslücken erkennen“ kann ein konkretes Ziel sein. |
| Projektions- und Kartensicht | Geprüfter Aufbau des Lernzielbaums und der Lernkarte für einen aufgelösten Bildungsumfang. | Ein Landesplan verweist auf kanonische Teilbäume ohne Zielkopie; die Lernkarte kontrahiert gewöhnliche Cluster entlang `contains`. |
:::

### Identität trotz unterschiedlicher Einordnung {#sec:identity-across-contexts}

Die Identitäts-, Attribut- und Atomaritätsregeln aus Abschnitt~@ref{sec:core} gelten in allen Schichten unverändert. Eine neue Platzierung erzeugt deshalb keine neue Kompetenz. Ein Programmabschnitt vom Typ `exam` ist noch kein Prüfungsziel mit Aufgaben, Bewertungsraster und Lernergebnis. Und `phase: Q1` erzeugt weder eine Elternkante zu einem Q1-Knoten noch eine Voraussetzung zwischen Q1 und Q2.

Historische Bäume können Jahrgangs- und Phasenknoten als Kompatibilitätsgerüst enthalten. Im allgemeinen Zielmodell übernimmt explizite Programmstruktur diese Aufgabe; die fachlichen Ziele bleiben eigenständig. Der gleiche Inhalt kann so in mehreren Bildungsgängen anders eingeordnet werden, ohne seine Ziel-ID oder gespeicherte Ergebnisse zu kopieren.

### Platzierungen und Projektionen {#sec:placements-projections}

Eine *Projektion* leitet aus den Curriculumdaten einen sichtbaren Baum oder eine andere navigierbare Sicht ab. Sie gilt für einen *aufgelösten Kontext*, in dem Merkmale wie Bundesland, Schulform, Stufe, Dauer und Kursprofil festgelegt sind.

`programUnits` beschreiben im Zielmodell einen expliziten Baum oder Wald von Programmeinheiten. `goalPlacements` verbinden Ziele mit diesen Einheiten. Eine `primary`-Platzierung liefert den normalen Programmanker; `secondary` zeigt zusätzliche Relevanz, `assessed` einen Prüfungsbezug. Sekundäre und prüfungsbezogene Zuordnungen erzeugen keine weiteren sichtbaren Kopien desselben Ziels. Im bestehenden Kompatibilitätsvertrag 1.2 hält die Relation `own` kontextfrei fest, dass eine Lerneinheit ein atomares Ziel direkt besitzt (Abschnitt~@ref{sec:unit-representation}); sie ist kein Programmanker.

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



#### Lernzielbaum und Lernkarte.

Dieselbe aufgelöste Projektion speist zwei koordinierte Darstellungen ohne zweite Datenquelle. Der **Lernzielbaum** zeigt sämtliche Gliederungsknoten, Einheiten, gewöhnlichen Cluster und atomaren Ziele. Die **Lernkarte** zeigt ausschließlich **Einheiten und atomare Ziele**: Jeder Cluster, der nicht als Einheit erklärt ist, wird entlang `contains` kontrahiert, sodass indirekt enthaltene Kindeinheiten und atomare Ziele als direkte Kinder der nächstliegenden umfassenden Einheit (oder der Wurzel) nachrücken; Fächer wirken als Filter und sind selbst keine Einheiten. In einer geöffneten Einheit der Lernkarte verlaufen Pfeile ausschließlich zwischen ihren direkten Kindern aus aggregiertem Geschwister-`after` und kreuzenden atomaren `requires`-Pfaden; vorhandene Rückgriffe gegen die Einheitsfolge bleiben sichtbar und werden niemals ausgeblendet.

#### Landesautorität, Quellenzuordnung und Lernplatz.

Im verbindlichen Zielmodell gibt es je Land und Dauermodell einen maßgeblichen Plan über alle gewählten Fächer. Seine vollständige Wurzel hat genau zwei Kinder, Sekundarstufe I und Sekundarstufe II, mit genau einem erklärten `after` von II nach I (Z3); unter Sekundarstufe I liegen die für Land und Dauermodell gültigen Jahrgangseinheiten, unter Sekundarstufe II die Phaseneinheiten `E` und `Q1` bis `Q4` in Geschwisterfolge `after`. Orientierungsziele, Übungsaufgaben und Prüfungen haben einen begründeten Platz innerhalb dieser Stufen; daneben steht nichts. Kursprofile wählen fachliche Anteile, aber keine widersprechenden Stufen desselben kanonischen Ziels. Eine Einstufensicht ist ein abgeleiteter Ausschnitt und benötigt keine künstliche leere Gegenstufe. Die bundesweite Sicht bleibt kanonische Gliederung und ist kein Landesplan.

**Geführt in** bezeichnet die durch die Landesquelle belegte curriculare Zuordnung. **Steht in** bezeichnet den didaktischen Lernplatz. Eine ausdrücklich begründete frühere Vorbereitung darf den Lernplatz ändern, ohne die ursprüngliche Quellenzuordnung zu überschreiben; sie ist keine neue amtliche Pflicht. Notwendige Voraussetzungen aus dem geschlossenen Umfang $L$ außerhalb der im Landesplan geführten Ziele erhalten ihren abgeleiteten Lernplatz deterministisch am **frühesten tatsächlichen Bedarf** (in der frühesten Planeinheit eines abhängigen Ziels aus $L$), während geführte späte Ziele nicht stillschweigend nach vorn gezogen werden. Fehlt Landesbeleg, darf eine kanonische Marke wie `dimensionTags.phase` nur eine ausdrücklich vorläufige **Standardzuordnung** begründen. Sie ersetzt weder Landesbeleg noch Quellenabdeckung und überschreibt keine maßgebliche Sicht. Routen prüfen die ausgewertete Lernplatzierung; Quellenprüfungen prüfen weiterhin die Quellenbelege. Unterschiedliche bisherige Leser bleiben bis zur gemeinsamen Umstellung ein Umsetzungsbefund.

Die vorhandene [Stufenplan-Grundlage](repo:contracts/curriculum-package/v1.3/README.md) trennt gemeinsame Pläne, Fachautoritäten und Ausschnitte; die daraus erzeugten Kompatibilitätssichten sind keine zweite Autorquelle. Das Verzeichnis `v1.3` bezeichnet hier einen Entwicklungsvertrag für Stufenpläne, keine veröffentlichte Version des Curriculum-Pakets und keine fertige Umstellung der produktiven Leser. Noch ist kein echter Landesplan aktiviert.

#### Kanonische Identität bleibt erhalten.

Eine zusammengeklappte Darstellung behält die kanonische atomare Basis ihres Clusters. Diese lässt sich über `canonicalSubtree` oder ausdrückliche Referenzen auf die beabsichtigten Atome prüfen. Das Ausblenden von Kindern ändert weder den Knotentyp noch die Ergebnisse der Kinder. Auch für eine als Einheit erklärte Gruppe braucht ein eigener Einheitenabschluss das Lernversprechen und die Pflichten der zugehörigen Fassung.

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
4. **Lernergebnisse.** Der ausdrücklich erzielte Erfolg gehört zur stabilen atomaren Ziel-ID. Bei Änderungen der Sicht oder des Fokus bleibt er erhalten. Der Einheitenabschluss wird nach dem geltenden Vertrag aus den eigenen effektiv beherrschten Zielen und den abgeschlossenen Kindern abgeleitet (Abschnitt~@ref{sec:unit-completion}). Ein eigenes Urteil über eine bestandene Einheitenfassung mit gesonderter Planungswirkung ist der Vorschlag vom 19. November (Abschnitt~@ref{sec:proposal-unit-assessment}).

Grundkurs (`GK`) und Leistungskurs (`LK`) sind fachbezogene Kursprofile. Die Schulstufe wird eigens angegeben und bleibt bei fehlender Angabe offen. Zwei Beispiele zeigen, warum diese Unterscheidung wichtig ist.

- **Mathematik in Bayern.** `GK` bezeichnet im SkillPilot-Modell den vierstündigen Pflichtkurs auf erhöhtem Anforderungsniveau, `LK` diesen Kurs mit allen fünf Modulen des Vertiefungskurses. Diese technischen Bezeichnungen sind keine bayerischen Kursnamen. Wer sich auf die drei tatsächlich unterrichteten Module konzentriert, behält die beiden anderen im persönlichen Zielumfang, Gesamtfortschritt und Abschluss.
- **Chemie in Schleswig-Holstein.** Der vorläufige `GK`-/`LK`-Umfang enthält nach der Entscheidung vom 16. Oktober 2026 alle verfassten Themen, auch das amtlich optionale Arzneimittel-Thema. Die Themenwahl soll später hinzukommen. Aus dem bisherigen Umfang lässt sich daher keine individuelle Wahl oder allgemeine Lehrplanpflicht ableiten.

Eine Änderung des Personal Curriculum prüft Fokus und aktives Ziel erneut gegen die neue Zielmenge; sie darf globale Ergebnisse weder löschen noch neu vergeben. Die aktuelle Konfiguration des Personal Curriculum erfolgt über die dafür vorgesehenen Erstparteien-Oberflächen der SkillPilot-WebGUI. Der über den konkreten OpenAI-V1-Adapter angebundene Sprachmodell-Coach liest diesen Rahmen und präsentiert oder ändert diese Konfiguration nicht selbstständig.

Der persönliche Lernumfang ist nach der Entscheidung vom 10. November 2026 $L=\Closure(S)$ aus Abschnitt~@ref{par:projection-closure}. Er enthält die Ausgangsziele und alle auf dem kanonischen Graphen notwendigen atomaren Voraussetzungen unabhängig von bisherigen Ergebnissen. Ein enger Fokus begrenzt die aktuelle Arbeit. Innerhalb von $L$ bestimmen ausdrückliche Erfolge und die nach R1–R5 gültig abgeleitete Anerkennung, welche Arbeit noch ansteht. Die gesonderte Planungswirkung eines Einheitenabschlusses ist im Vorschlag vom 19. November beschrieben (Abschnitt~@ref{sec:proposal-planning-release}). Ein Abschluss im Fokus sagt nur etwas über dessen Umfang aus.

### Zielrolle und Voraussetzungshilfe {#sec:projection-roles}

Eine Referenz in einer Kompositionssicht kann ausdrücklich eine von zwei *Projektionsrollen* tragen:

:::description
- **`target`.** Das Ziel gehört zur auswählbaren Lernmenge, zur Frontier, zum Fortschritt und zum Abschluss dieser Sicht.
- **`prerequisiteOnly`.** Das Ziel bleibt für Voraussetzungsprüfungen mit seiner globalen Identität und seinem gespeicherten Zustand verfügbar; es ist in dieser Sicht kein auswählbares Ziel und zählt nicht zum lokalen Fortschrittsnenner.
:::

Fehlt eine Rollenangabe, gilt `target`. Teilbaumreferenzen vererben ihre Rolle an Nachfahren. Bei überlappenden Rollenfestlegungen entscheidet die Spezifität: Eine direkte `goalEntry`-Referenz geht einer Teilbaumvererbung vor; eine nähere Teilbaumwurzel geht einer breiteren vor; erst bei gleicher Spezifität gewinnt `target`. Diese Regel löst die Rolle, nicht eine ansonsten unzulässige doppelte Darstellung.

Eine Fachsicht legt ihre Rollen ausdrücklich fest. Das Personal Curriculum ergänzt die atomaren Erwerbsziele, die sich aus den bestehenden Voraussetzungen ergeben. So kann eine mathematische Kompetenz in Physik als Unterstützung geführt werden und im Gesamtplan einmal als Lernziel zählen. Maßgeblich bleibt ihre kanonische ID mit dem zugehörigen Lernergebnis. Alter und Phase bestimmen keine Fachrolle. Die persönliche Aufnahme als Vorbereitung ändert die amtliche Zuordnung nicht. Backend und WebGUI setzen diesen geschlossenen Lernumfang um. Für Anwendbarkeit und vollständige Abnahme sind eigene Nachweise erforderlich.

Die Ownerentscheidung vom 10. November 2026 ersetzt am persönlichen Kompilationsrand die frühere pauschale Pflicht vom 7. November, jede erreichbare Voraussetzung manuell mit einer Rolle zu referenzieren:

- Verfasste Ausgangsreferenzen und lokale Rollen bleiben geprüft.
- Die abgeleitete globale Zielrolle eines notwendigen Atoms genügt zusammen mit geprüftem kanonischem Voraussetzungspfad und dokumentierter Herkunft; eine manuelle Ziel- oder Hilfsreferenz je Atom ist nicht nötig.
- Unbekannte Referenzen, Zyklen sowie fehlende oder im Gesamtplan nicht erreichbare beziehungsweise nicht berücksichtigte notwendige Atome bleiben harte Fehler, unabhängig von Mastery und Fokus.

Die Entscheidung vom 11. November 2026 unterscheidet die Validierung vom Lesen eines Lernstands. Validierung, Curriculum-QA und native Abnahme weisen eine ungültige Hülle als Fehler aus. Kann die Laufzeit den kanonischen Graphen nicht strikt auflösen, zeigt sie den geprüften Ausgangsumfang, bietet keine Ziele mit gebrochenem Bedarf an und beansprucht keine abgeleitete Lernbasis. Sie protokolliert die Ursache einmal je Curriculum und Fehlercode. Lernstand, Ergebnisse und Export bleiben lesbar. Eine ungültige Ausgangsauswahl bleibt ein Fehler. Der Umgang mit einer ungültigen Hülle gilt auch für ältere Curricula, deren Wurzel ihr eigenes Orientierungsziel enthält und voraussetzt.

*Beispiel im Übergangsbestand.* Braucht ein Physikziel $g$ den Mathematik-Cluster $k$, werden vor jedem Anzeigefilter die atomaren Nachfahren von $k$ und deren Voraussetzungen aufgelöst. Physik kann $k$ weiter als `prerequisiteOnly` führen. In das Personal Curriculum kommen die tatsächlich benötigten Atome mit ihrer kanonischen Herkunft und vorhandenen Mastery. Zusätzliche Fächer oder ganze Einheiten werden dadurch nicht gewählt.

Der Ort des Eintrags `prerequisiteOnly` bestimmt weder die amtliche Stufe noch den Lernplatz. Im Zielmodell erhält jedes notwendige Atom ohne eigenen Platz im ausgewählten Plan genau einen Lernplatz bei seinem frühesten tatsächlichen Bedarf in $L$. Die Ableitung verfolgt die vollständigen kanonischen Pfade unabhängig von Mastery. Ist ein bereits geführtes Ziel zu spät eingeordnet, bleibt der Rückgriff sichtbar, bis eine belegte Fachkorrektur oder ausdrücklich begründete frühere Vorbereitung ihn auflöst. Z4/E2 gelten für beide Fälle. Die gemeinsame Platzierungsableitung ist noch nicht für alle Leser produktiv umgesetzt.

### Anwendbarkeit ist keine Platzierung {#sec:applicability-vs-placement}

`applicability` enthält kompilierte Metadaten für Sichten, etwa für einen Bundeslandfilter. Sie wird aus überprüfbaren Quellen, Mappings, Provenienz und begründeten Ausnahmen gewonnen. Sie beantwortet, in welchem Kontext ein Ziel sichtbar ist. Eine Platzierung beantwortet, wo es in einer Programmstruktur liegt. Keine der beiden Angaben ist ein Beweis für individuelle Beherrschung.

Bei landesspezifischen Ergänzungen kann eine ausdrücklich deklarierte Vererbungsgrenze verhindern, dass eine breite Quellenzuordnung eines Vorfahren als Quellenbeleg aller neuen Nachfahren ausgegeben wird. Direkte Quellen und Zuordnungen im Ergänzungszweig bleiben maßgeblich. Ebenso kann die Sichtbarkeit eines lokalen Übungs- oder Prüfungsendpunkts unter einem dafür vorgesehenen Vertrag aus seinen Voraussetzungen abgeleitet werden. Das belegt seine Anwendbarkeit, nicht automatisch seine Lehrplanabdeckung.

### Geführte Empfehlung und bewusster Einstieg {#sec:focus-switch}

Ein Fokus besteht aus der Vereinigung der gewählten Wurzeln und ihrer sichtbaren Nachfahren, eingeschränkt auf das Personal Curriculum. Im Normalmodus werden die transitiven effektiven Voraussetzungen innerhalb dieses Fokus geprüft; der ausdrücklich gewählte strikte Modus prüft global. Eine außerhalb liegende Voraussetzung wird im Normalmodus weder zum Hindernis noch dadurch gemeistert. Die formalen Unterschiede der Frontier-Berechnung stehen in Abschnitt~@ref{sec:filter-modes}.

Eine Fokusausweitung folgt dem eindeutigen sichtbaren Elternpfad. Die Backendoption muss eine echte Obermenge liefern und mindestens ein noch offenes Ziel hinzufügen. Bei mehreren Wurzeln ersetzt sie nur den abgedeckten Zweig und bewahrt die unabhängigen Wurzeln. Der Coach übernimmt die veröffentlichte Option vollständig und wartet vor der Änderung auf die Zustimmung der lernenden Person.

Das Backend schlägt eine Ausweitung erst bei abgeschlossenem Fokus vor. Auch offene Voraussetzungen können eine leere Frontier erklären. Die globale Anerkennung eigener gewöhnlicher Ziele nach dem geltenden Vertrag vom 4./11. November bleibt beim Fokuswechsel wirksam. Die Voraussetzungsprüfung verwendet die effektiv beherrschte Menge im gewählten Modus (Abschnitt~@ref{sec:state}).

**Vorschlag vom 19. November.** Die Person könnte im eigenen Lernumfang eine Einstiegseinheit wählen. Eine vorgeschriebene praktische Leistung und ungedeckte Voraussetzungen bleiben offen. Für die spätere Planung beschreibt Abschnitt~@ref{sec:proposal-planning-release} die Freigabe eigener Inhaltsziele durch ihre zuständige Einheit.

:::sources
[Personalisierungsstufen](repo:docs/concept/levels-of-personalization.md); [Projektionsrollen und Sichtvertrag](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md).
:::

## Zieltypen und die Bedeutung eines Ergebnisses {#sec:goal-types}

Der Zieltyp bestimmt die geforderte Leistung. In beiden Lernwegen gilt für den Einzelbeleg derselbe fachliche Anspruch. Die dritte Spalte der Tabelle~@ref{tab:goal-types} beschreibt ausschließlich den Vorschlag vom 19. November aus Abschnitt~@ref{sec:proposal-unit-assessment}.

:::table {#tab:goal-types caption="Einzelbelege und ihre Rolle beim direkten Nachweis einer Einheit." cols="26mm,X,X"}
| Zieltyp | Ausdrücklicher Einzelerfolg | Vorschlag für den direkten Einheitenabschluss |
| --- | --- | --- |
| Inhaltsziel | Die Person hat das geforderte Verstehen oder Können gezeigt (Abschnitt~@ref{sec:understanding}). | Übersprungene Übungen bleiben ohne Einzelergebnis. Für spätere Voraussetzungen zählt die geprüfte Freigabe des ganzen Atoms. |
| Orientierungsziel | Die Person hat am Auftakt teilgenommen und seinem Abschluss zugestimmt (Abschnitt~@ref{sec:orientation}). | Vor dem Versuch erfährt sie, was sie zeigen soll. Der übersprungene Auftakt bleibt unbesucht. |
| Memorierziel | Die Person hat die erforderlichen Karten im Abschlussabruf ohne Hilfe wiedergegeben (Abschnitt~@ref{sec:memory}). | Ein ausdrücklich verlangter Abruf bleibt Pflicht. Gewöhnliche Übungskarten dürfen entfallen. |
| Prüfungsziel | Die Einreichung erfüllt das geltende Bewertungsraster (Abschnitt~@ref{sec:exams}). | Für den Einheitenabschluss zählen alle verlangten Teile in der qualifizierenden Fassung. |
:::

### Verstehen und Anwenden {#sec:understanding}

Der Coach kann einen neuen Begriff erklären oder einen Schritt vormachen. Eigenständige Erklärungen und Anwendungen können Verstehen belegen. Verlangt das Einzelziel eine eigene Versuchsdurchführung, braucht auch der Einzelbeleg einen Beleg für diese Durchführung. Der Coach kann ihn im Gespräch mit der Person anhand ihrer eigenen Versuchsdaten und Beobachtungen prüfen. Die Deutung bereitgestellter Daten allein belegt die Auswertung. Welche selbstständigen Leistungen zur Feststellung des ganzen Ziels ausreichen, richtet sich nach Ziel- und Coachvertrag.

Sobald ausreichend Belege vorliegen, speichert der Coach das Ergebnis ohne gesonderte Zustimmung zum Speichern. Erst nach bestätigter Speicherung kann er den Erfolg als gesichert melden. Anschließend bietet er das vom Backend gewählte nächste Thema an und beginnt es, wenn die Person einverstanden ist.

### Orientierung als eigener Abschlussvertrag {#sec:orientation}

Ein atomares Orientierungsziel (`semanticKind: "orientation"`) zeigt, was sich mit dem folgenden Stoff verstehen oder tun lässt. Lernende können Interessen äußern oder fragen. Dabei werden weder Vorwissen noch Fachsprache oder persönliche Motivation bewertet. Der bestehende Vertrag verlangt voraussetzungsfreie Orientierungsziele ohne Prüfungs- und Memorierdaten.

**Facheinstieg.** Für eine ausführliche Orientierung wie „Warum Mathematik?“ gilt heute dieser Ablauf.

1. **Vertiefung.** Wählt die Person ein Interesse, beginnt damit die Vertiefung. Der Coach zeigt an einem konkreten Beispiel, was sich damit verstehen, erkunden oder gestalten lässt, und lädt zu einer Reaktion ein.
2. **Zusammenfassung.** Nach einer inhaltlichen Reaktion oder dem ausdrücklichen Wunsch, die Orientierung zu verlassen, fasst der Coach das Gespräch positiv zusammen und bietet den Abschluss an.
3. **Abschluss.** Erst die Zustimmung zu diesem Angebot schließt das Ziel ab.

**Vorgeschlagener Einheitsauftakt (17. November).** Beim Erarbeiten einer Einheit stellt der Coach eine konkrete Frage zum Lernversprechen aus dem Einheiteneintrag (Abschnitt~@ref{sec:unit-claims}). In der Kinematik kann eine Kugel von einer Tischkante rollen. Wo wird sie landen? Die Person kann nachfragen oder den Auftakt mit „weiter“ abschließen. Gespeichert wird dann der ausdrückliche Zielerfolg. Wer direkt zum Nachweis geht, erfährt vorab, was zu zeigen ist. Der bestandene Nachweis erzeugt keinen nachträglichen Besuch des Auftakts (Abschnitt~@ref{sec:proposal-unit-assessment}).

**Welche Ziele heute zur Wahl stehen.** Gibt es im relevanten projizierten Arbeitsbereich offene Orientierungsziele, bietet der normale Einstieg nur diese an, solange dort weder fachlicher Fortschritt noch ein aktives fachliches Ziel vorliegt. Wer dort bereits fachlich arbeitet, kann fortfahren. Eine bewusst gewählte verfügbare Prüfung ist weiterhin direkt zugänglich (Abschnitt~@ref{sec:exams}).

**Welchen Auftakt der Coach empfehlen soll.** Beim Start einer Einheit soll das Backend deren erreichbaren Auftakt passend zur Themenwahl, zum Lernplan oder zum Fokus anbieten. In der geplanten Lernweise „Einheit für Einheit“ richtet sich der Vorschlag nach der anstehenden Einheit. Für gleichrangige Einheiten und weitere Lernweisen ist die Auswahl offen. Ein ausdrücklicher Fokus auf ein einzelnes Inhaltsziel kann die Motivation ausklammern. Sie gehört als Voraussetzung weiterhin zum persönlichen Lernumfang, sperrt aber den normalen Fokus nicht. Im strikten Modus wird sie auch außerhalb des Fokus geprüft (Abschnitt~@ref{sec:filter-modes}).

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

Der reguläre Lernweg prüft die transitiven Voraussetzungen im gewählten Fokusmodus. Heute lässt der direkte Prüfungszugang einen bewusst gewählten verfügbaren Prüfungsversuch auch bei offener Vorbereitung zu. Persönlicher Geltungsbereich und autorisierte Sitzung bleiben erforderlich. Im Vorschlag vom 19. November zeigt die Option „Einheit direkt nachweisen“ vor dem Start das Lernversprechen und sämtliche für diese Fassung nötigen Pflichtteile. Ein angebotener Versuch allein belegt noch keinen Abschluss.

#### Ablauf im Prüfungsmodus.

Im Prüfungsmodus erhält die Person die vollständige, unveränderte Aufgabe und bearbeitet sie ohne inhaltliche Hilfen. Ihre vollständige Einreichung wird anhand des Rasters bewertet. Bei Erfolg wird Mastery unmittelbar gespeichert. Ein Fehlversuch speichert weder Ergebnis noch Punkte und lässt vorhandene Mastery bestehen. Erst die bestätigte Speicherung erlaubt die Aussage, der Erfolg sei gesichert.

#### Nach der Bewertung.

Nach der Bewertung erhält die Person Ergebnis, Punkte, Begründung und Lösung. Im bestehenden Ablauf kann sie dieselbe Aufgabe wiederholen. Ein bereits erreichter Einzelerfolg bleibt erhalten. Der Entwurf sieht für einen erneuten qualifizierenden Versuch eine gleichwertige, der Person unbekannte Aufgabe vor. Solange nur die bekannte Aufgabe verfügbar ist, kann sie damit üben. Ob eine ältere Prüfung diese Aussage trägt, ist an ihrer damaligen Fassung zu prüfen (Abschnitt~@ref{sec:proposal-unit-contract}).

:::sources
[Zieltypen und Prüfungsablauf](repo:docs/concept/skill-graph/node-types.md); [Projektregeln zu Orientierung, Evidenz und Fortsetzung](repo:AGENTS.md); [Backend-Ableitung von Memorier-Mastery](repo:backend/src/main/java/com/skillpilot/backend/service/LearnerService.java); [Frontend-Ableitung von Memorier-Mastery](repo:app/src/hooks/useSrsMastery.ts).
:::

## Zeitplanung als ergänzende Sicht {#sec:time-context}

Ein Zeitplan bindet einen erklärten Zielumfang, eine Curriculumfassung, Kalender, verfügbare Kapazität und Planungsversion. Absolute Termine gehören nicht auf kanonische Ziele, Cluster oder Platzierungen. Derselbe Inhalt kann in verschiedenen Kursen zu verschiedenen Zeiten bearbeitet werden, ohne seine fachliche Identität zu ändern.

Die Zeitplanung ist eine zusätzliche Ausführungsplanung und keine fünfte Personalisierungsstufe. Sie darf Ziele priorisieren, die im aktuellen Arbeitsbereich verfügbar sind. Sie erzeugt keine Voraussetzungskanten, keine neue Frontier und keine Lernergebnisse. Die Lerneinheit beschreibt den fachlichen Erwerbszusammenhang; ein datierter Ablaufplan muss zusätzlich gewährleisten, dass eine Voraussetzung rechtzeitig vor ihrer geplanten Verwendung erarbeitet wird.

Verfügbare Kapazität berücksichtigt tatsächliche Unterrichts- oder Lernminuten nach Ferien, Ausfällen und anderen Ausschlüssen. Aktivitäten, geschützte Reserve und verbindliche Fachbudgets müssen darin ohne Doppelzählung Platz finden. Die formale Budgetprüfung und ihre Anforderungen an kalibrierte Aufwandsschätzungen folgen in Abschnitt~@ref{sec:levels}.

Plan-Soll und tatsächliche Zielerreichung verwenden denselben benannten Umfang. Für den Gesamtfortschritt zählen im geltenden Vertrag ausdrückliche Erfolge und gültig abgeleitete Anerkennung. Im Wochenpensum zählt ein tatsächlicher Prüfungserfolg an seinem Datum einmal. Die Fachrunde diskutiert in Abschnitt~@ref{sec:proposal-period-accounting} einen anderen Planauftrag: Einheitenabschluss und tatsächlich erledigte Einzelarbeit würden getrennt ausgewiesen. Neue Planrevisionen erhalten die Bedeutung früherer Ergebnisse und Termine.

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
