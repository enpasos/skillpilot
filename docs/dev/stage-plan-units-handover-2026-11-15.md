# Stufen als Planeinheiten: Übergabe an die Fachprüfung, 15. November 2026

**Stand: 15. November 2026.** Dieses Dokument übergibt den ersten Schritt der
Einführung von Einheiten, die Stufen als Planeinheiten, an die Fachprüfung für
Mathematik und Physik. Es beschreibt den Iststand, den Zielzustand des Modells,
die Lücken der Dokumente und die curricularen Befunde, die fachlich aufzulösen
sind. Die ursprüngliche Übergabe ändert kein Ziel, keine Kante und keine
Sicht. Die anschließenden Umsetzungsentscheidungen stehen in Abschnitt 2.4;
Abschnitt 7 unterscheidet laufende Arbeit von integrierten Ergebnissen.

**Arbeitsauftrag vom 15. November 2026:** Der Product Owner hat Recherche,
fachliche Entscheidungen und Umsetzung an die ausführenden Agenten delegiert.
Er kontrolliert die konkreten Ergebnisse und greift bei Bedarf ein. Die
früheren Freigabevorbehalte dieses Dokuments sind für diesen Auftrag aufgehoben.
Ziel ist die Integration der Ergebnisse auf `main` mit einem frischen,
vollständig erfolgreichen CI-Lauf; PRs sind Zwischenschritte. Quellenbelege,
unabhängige Reviews, unveränderliche Nachweise, Lernergebnisse und geschützte
Qualitätsuntergrenzen bleiben verbindlich.

Grundlage ist das Einheitenkonzept
[Lerneinheiten: Cluster, `after` und Lernfluss](../concept/skill-graph/learning-unit-wiring-concept-2026-11-14.md)
mit den Beschlüssen B1 bis B16 und den Regeln E1 bis E4. Wer dieses Dokument
bearbeitet, liest dort zuerst die Abschnitte 3 bis 8.

Alle Zahlen gelten für `main` bei `96035c60b1`, also nach den Pull Requests
[#154](https://github.com/enpasos/skillpilot/pull/154) und
[#155](https://github.com/enpasos/skillpilot/pull/155). Sie stammen aus
Erkundungsrechnungen mit der Projektion der Lernkarte aus
[#153](https://github.com/enpasos/skillpilot/pull/153) und sind kein
Gate-Ergebnis (Abschnitt 1.4).

## 1. Iststand

### 1.1 Modell

Das Einheitenkonzept ist beschlossen und nicht umgesetzt. `AGENTS.md` §2.4
spiegelt es. Die Graph-Definition §11 bis §13 und der Einheitenvertrag vom
12. November 2026 beschreiben weiter den umgesetzten Stand mit drei Einheiten.

Von den Arbeiten F1 bis F13 des Konzepts (Abschnitt 10.3) ist keine
abgeschlossen:

| Arbeit | Stand |
| --- | --- |
| F1, F2 Planeinheiten erklären | offen. Keine Sicht erklärt eine Planeinheit; das Schema der Sichten hat dafür kein Feld. |
| F3 Lernkarte | als Vorschau in #153, offen. Die Vorschau nimmt die Abschnitte der Sichten als Einheiten und erkennt die beiden Stufen an 18 festen Abschnittskennungen. |
| F4 Vorbereitungsziele einordnen | offen. Im Lernzielbaum hängen sie unter „Notwendige Grundlagen“ der ersten Fachwurzel. |
| F5 Fachprüfung der Rückgriffe | begonnen: zwei unabhängige Fachprüfungen der neun häufigsten Paare zwischen den Stufen und des Reflexionsclusters der Physik. Dieses Dokument übergibt den Rest. |
| F6 Bericht der Regelverstöße | offen. Es gibt nur nicht eingecheckte Erkundungsrechnungen. |
| F7 Norm anpassen | offen. |

### 1.2 Daten

Der Plan eines Landes steckt in seinen Ländersichten. Für Mathematik gibt es
88 Sichten, für Physik 69. Beide Stufen in einer Sicht führen 46 Sichten der
Mathematik und 34 der Physik; die übrigen sind Sichten einer Stufe. Jedes Land
hat damit je Fach vier bis zehn Sichten, die dieselben Ziele einordnen: je
Stufe, je Kursprofil und je Dauermodell.

In den Sichten mit beiden Stufen steht auf der Ebene der Stufen, gezählt über
alle diese Sichten:

| Was dort steht | Mathematik | Physik |
| --- | --- | --- |
| Abschnitte der beiden Stufen | 92 | 68 |
| Weitere Abschnitte neben den Stufen | 22 in 11 Ländern | 12 in 6 Ländern |
| Einzelne Ziele neben den Stufen | 18 in BB, BE und BY | 3 in BW |
| Einträge mit der Rolle `prerequisiteOnly` außerhalb der Stufen | 1.599 | 492 |
| Einträge mit der Rolle `prerequisiteOnly` in der Sekundarstufe I | 414 | 312 |
| Einträge mit der Rolle `prerequisiteOnly` in der Sekundarstufe II | 23 | 1.023 |

Ein Eintrag ist eine Referenz der Sicht auf ein Ziel oder einen Teilbaum.

Die Stufe eines Ziels wird heute an drei Stellen unabhängig voneinander
bestimmt:

| Stelle | Woran die Stufe hängt | Wer sie liest |
| --- | --- | --- |
| Abschnitt der Sicht | an der Stellung des Eintrags unter einem Abschnitt wie `sek1` oder `physics-sekii-gk` | Lernzielbaum, Lernkarte, Lernumfang |
| Kanonische Marke | an `dimensionTags.phase` (J5 bis J10, E, Q1 bis Q4), Tags und `topicCode` des Ziels | die Routenprofile der Qualitätsregeln, die bayerischen Sichten, der Generator der Dauer-Sichten von HE, RP und SH |
| Quellenzuordnung | an den Mappings und der Provenienz des Landes | Abdeckungsprüfung der Länderquellen |

Die Marken der Physik stammen überwiegend aus dem hessischen Kerncurriculum
(`framework: hessen-kc-2024-physics`).

### 1.3 Was #154 und #155 geändert haben

Beide haben nur Ländersichten mit beiden Stufen und deren Folgebindungen
geändert. Die kanonischen Fachdateien, die Sichten einer Stufe und alle
Reifegrade sind unverändert.

| PR | Ziel | Änderung | Entscheidung |
| --- | --- | --- | --- |
| #154 | „Warum Physik?“ | von der Fachwurzel an den Anfang der Sekundarstufe I, 34 Sichten | Product Owner |
| #154 | Cluster „Physik, Gesellschaft und Technik reflektieren“ | von der Fachwurzel in die Sekundarstufe II, 24 Sichten | Product Owner |
| #154 | vier Ziele der Arbeitsweisen (Beobachtung, SI-Einheiten, Modelle, Quellen) | kein sichtbarer Zweig mehr unter Q4 Astrophysik; je eine Voraussetzungshilfe im Abschnitt der Sekundarstufe II, 28 Sichten | im delegierten Durchgang; Beurteilung offen |
| #155 | „Monotoniesatz erläutern und Nichtumkehrbarkeit begründen“ (`f76d00dc`) | Voraussetzungshilfe außer in BW | Regel des Product Owners; Anwendung im delegierten Durchgang |
| #155 | „Ganzrationale Funktionen über Term und Graph beschreiben“ (`1ce8af38`) | Voraussetzungshilfe außer in BY, NW und NI | wie oben |
| #155 | Cluster „Diagramme und Visualisierungen interpretieren“ (`5da9f264`, vier Ziele) | aus der Einführungsphase in die Jahrgangsstufe 7 | im delegierten Durchgang; Beurteilung offen |
| #155 | „Potenzfunktionen mit ganzzahligen Exponenten beschreiben“ (`30c013ac`) | aus der Einführungsphase in die Jahrgangsstufe 9, außer in NW und NI | im delegierten Durchgang; Beurteilung offen |

Die Regel des Product Owners vom 14. November 2026 lautet: Ein Ziel ist Ziel
einer Stufe nur, wo die Quelle des Landes es dort trägt; sonst ist es reine
Vorbereitung. Für die Diagrammziele und `30c013ac` ließ sie sich nicht
anwenden, weil der Generator der Dauer-Sichten ein Ziel der Sekundarstufe I
ablehnt, dessen direkte Voraussetzung kein Ziel ist. Sie stehen deshalb nach
ihrer kanonischen Marke in der Sekundarstufe I. Das ist keine Quellenaussage
(Abschnitt 2.3, M5).

### 1.4 Oberste Tafel der Lernkarte

**Messung.** Für ein Land und ein Kursprofil werden die Mathematik- und die
Physiksicht mit beiden Stufen zusammen gelesen. Der Lernumfang ist der
Voraussetzungsabschluss ihrer Ziele. Ein Ziel, das keine der beiden Sichten
führt, steht als Vorbereitung in der Stufe, in der es zuerst gebraucht wird.
Ein Rückgriff ist eine direkte Voraussetzung von einem Ziel der
Sekundarstufe I auf ein Ziel der Sekundarstufe II.

| Land | Ziele neben den Stufen | Abschnitte neben den Stufen | Rückgriffe |
| --- | --- | --- | --- |
| Hessen (G8, G9) | 0 | 0 | 0 |
| Hessen (ohne Dauermodell) | 0 | 1 | 0 |
| Brandenburg, Berlin | 0 (LK: 1) | 0 | 1 |
| Hamburg | 0 | 1 | 1 |
| Mecklenburg-Vorpommern | 0 | 2 | 1 |
| Bremen | 0 | 0 | 2 |
| Niedersachsen | 0 | 2 | 2 |
| Nordrhein-Westfalen | 0 | 1 | 2 |
| Saarland, Sachsen, Sachsen-Anhalt | 0 | 2 | 2 |
| Baden-Württemberg | 3 (LK: 4) | 1 | 2 |
| Thüringen | 0 | 2 | 3 |
| Bayern | 5 (LK: 11) | 0 | 9 |
| Schleswig-Holstein (G8 / G9 / ohne Dauermodell) | 0 | 0 | 8 / 9 / 12 |
| Rheinland-Pfalz (G8 / G9 / ohne Dauermodell) | 0 | 0 / 0 / 1 | 55 / 55 / 32 |
| Bundesweite Sicht | 0 | 0 | 39 |

Vor den beiden Pull Requests lagen die Rückgriffe in den Ländern außer
Rheinland-Pfalz, Schleswig-Holstein und der bundesweiten Sicht zwischen 7
und 12. Über alle Sichtenpaare bleiben 81 verschiedene Paare. Anhang A nennt
sie je Land.

Nicht neu gemessen sind die Verstöße zwischen Jahrgängen und Phasen; dafür
gelten die Zahlen aus Abschnitt 9.1 des Einheitenkonzepts.

## 2. Zielzustand des Modells

Der Zielzustand sagt, welche Form der Plan eines Landes hat. Er sagt nicht,
welches Ziel fachlich in welche Stufe gehört; das entscheidet die Fachprüfung
am Beleg (Abschnitt 4).

### 2.1 Der Plan eines Landes

| Nr. | Aussage | Status |
| --- | --- | --- |
| Z1 | Stufen sind Planeinheiten eines Landes über alle gewählten Fächer. Sie werden je Land einmal erklärt: eine Sekundarstufe I, nicht eine je Fach und nicht eine je Sicht. | beschlossen (B5, Konzept 3.3) |
| Z2 | Der Plan ist ein Baum. Jedes Ziel des Lernumfangs hat darin genau einen Platz. | beschlossen (E1) |
| Z3 | Die Wurzel des Plans hat genau zwei Kinder: Sekundarstufe I und Sekundarstufe II. Zwischen ihnen steht genau ein erklärtes `after`. Daneben steht nichts. | Vorgabe des Product Owners für die Lernkarte; als Regel offen (M1) |
| Z4 | Kein Ziel, das in der Sekundarstufe I steht, braucht ein Ziel, das in der Sekundarstufe II steht, weder direkt noch über Zwischenschritte. | beschlossen (E2, E3; Konzept 5.1 „Kein Rückgriff“) |
| Z5 | Der Lernumfang ist der Voraussetzungsabschluss der geführten Ziele. Ein Ziel, das der Plan nicht führt und das ein geführtes Ziel braucht, steht als Vorbereitung in der Planeinheit, in der es zuerst gebraucht wird. Z4 gilt für Vorbereitungsziele wie für geführte. | beschlossen (Entscheidung vom 10. November 2026; Konzept 3.4 und 7.3) |
| Z6 | Dass ein Land ein Ziel in einer Stufe führt, ist eine Aussage über seine Quelle. Dass ein Ziel als Vorbereitung gelernt wird, ist keine. Beide Aussagen bleiben getrennt. | beschlossen (Graph-Definition §7.2); Form offen (M2, M3) |
| Z7 | Ein Verstoß gegen Z4 wird am Fall mit einer der vier Auflösungen aus Abschnitt 8 des Konzepts behoben: Voraussetzung korrigieren, Ziel teilen, im Plan vorziehen, als Vorbereitung einbinden. Eine fünfte gibt es nicht; keine Sicht schwächt eine Voraussetzung ab, und keine Darstellung blendet einen Verstoß aus. | beschlossen (B15) |
| Z8 | Dieselben Aussagen gelten danach für Jahrgänge und Phasen, dann für feinere Abschnitte und für fachliche Einheiten. | beschlossen (B16) |
| Z9 | Keine Voraussetzung zeigt auf eine Prüfung. | beschlossen (B9) |
| Z10 | Die Regeln werden schrittweise zum Gate: Bericht, Behebung der Ursachen, Sperrklinke, hartes Gate bei null Verstößen. | beschlossen (Konzept 10.1) |

### 2.2 Wann die Stufen fertig sind

Der erste Schritt ist für ein Land abgeschlossen, wenn alle vier Bedingungen
gelten:

1. An der Wurzel seines Plans stehen nur die beiden Stufen (Z3).
2. Zwischen den Stufen gibt es keinen Rückgriff (Z4, Z5), für jedes
   Kursprofil und jedes Dauermodell.
3. Alle Sichten des Landes ordnen jedes Ziel derselben Stufe zu (Z1).
4. Ein eingechecktes Werkzeug stellt die Bedingungen 1 bis 3 fest (Z10).

Heute erfüllt kein Land alle vier. Hessen erfüllt die Bedingungen 1 und 2 in
den Sichten mit Dauermodell.

### 2.3 Wo das beschlossene Modell schweigt oder sich widerspricht

Diese Tabelle hält die offenen Fragen und Empfehlungen der ursprünglichen
Übergabe fest. Ihre Auflösung unter dem delegierten Arbeitsauftrag steht in
Abschnitt 2.4; sie sind keine an den Product Owner zurückgegebenen Aufgaben.

| Nr. | Frage | Befund | Empfehlung |
| --- | --- | --- | --- |
| M1 | Darf ein Ziel neben den Stufen stehen? | Das Konzept erlaubt es in 3.1 und 3.4 für Orientierungsziele, Übungsaufgaben und Abiturklausuren. Z3 schließt es aus. | Z3 beschließen: Jedes Ziel eines Plans ist eigenes Ziel einer Stufe oder liegt tiefer. Das Konzept in 3.1 und 3.4 anpassen. |
| M2 | Wie verhalten sich Quellenzuordnung und Platz im Plan? | Auflösung 4 des Konzepts bindet ein Ziel früher als Vorbereitung ein, „gekennzeichnet“. Führt die Quelle dasselbe Ziel in der Sekundarstufe II, hat es zwei Aussagen: geführt in der Sekundarstufe II, gelernt in der Sekundarstufe I. Das Konzept sagt nicht, wo es im Plan steht. | Zwei getrennte Angaben je Ziel und Land: „geführt in“ (Quelle) und „steht in“ (Plan). „Steht in“ ist gleich „geführt in“, außer die Fachprüfung zieht das Ziel als gekennzeichnete Vorbereitung vor. Z4 prüft „steht in“. |
| M3 | Was bedeutet die Stelle einer Voraussetzungshilfe in der Sicht? | Die Einträge stehen an vier Stellen (Abschnitt 1.2). Die Qualitätsregel zur Sichtbarkeit der Endpunkte wertet einen Eintrag außerhalb der Stufen als Hilfe in jeder Stufe, einen Eintrag in einer Stufe nur dort. Die Lernkarte ignoriert die Stelle und leitet die Stufe aus dem ersten Bedarf ab. Mathematik und Physik folgen verschiedenen Mustern. | Die Stelle trägt keine Bedeutung. Wo eine Vorbereitung steht, folgt aus dem Bedarf (Z5); eine verfasste Voraussetzungshilfe sagt nur, dass der Plan das Ziel nicht führt. Die Qualitätsregeln lesen die abgeleitete Stufe. |
| M4 | Trifft jede Sicht eine eigene Stufenaussage? | Heute ja. Nach #154 und #155 unterscheiden sich die Sichten einer Stufe von den Sichten mit beiden Stufen desselben Landes: 28 Physiksichten der Sekundarstufe II führen die Arbeitsweisen weiter als sichtbaren Zweig unter Q4 Astrophysik, und die Mathematiksichten der Sekundarstufe II führen den Cluster der Einführungsphase unverändert. | Z1 anwenden: Eine Sicht einer Stufe ist der Ausschnitt des Plans für diese Stufe; was sie aus der anderen Stufe braucht, ist Vorbereitung nach Z5. Die Sichten einer Stufe nach der Fachprüfung angleichen. |
| M5 | Was sagt die kanonische Marke über den Plan eines Landes? | Sie ist eine Setzung des Kanonautors, in Physik überwiegend aus Hessen. Trotzdem ordnen die bayerischen Sichten, der Generator der Dauer-Sichten und #155 Ziele nach ihr ein, und die Routenprofile der Qualitätsregeln wählen ihre Ziele nach ihr aus. Die Graph-Definition verbietet, Rollen aus Alter oder Phase abzuleiten (`GD-X13`), und sagt zur Einordnung nichts. | Die Marke ist die kanonische Standardzuordnung: Sie gilt in einem Land, solange dessen Quelle nichts anderes belegt, und wird als Standard gekennzeichnet, nie als Quellenaussage. Die Routenprofile lesen die Stufe aus dem Plan des Landes. |
| M6 | Was geschieht mit einem Ziel, das in seiner Stufe keine Prüfung erreicht? | Die Routenregeln `CQR-101`, `CQR-102`, `CQR-104` und `GVR-012` verlangen für jedes Ziel einer Stufe einen Weg zu einer Prüfungsaufgabe dieser Stufe. Deshalb bleibt eine fachlich falsche Kante bestehen (Abschnitt 4, K2), und die Arbeitsweisen der Physik können nicht Ziel der Sekundarstufe I sein (K3). | Eine fehlende Prüfung ist ein benannter Befund mit Frist und kein Grund für eine Kante. Regel aufnehmen: Kein Gate wird durch eine Voraussetzung erfüllt, die fachlich nicht besteht. Die Routenregeln zählen solche Ziele ausdrücklich als offene Prüfungslücke. |
| M7 | Wer ordnet, was eine Stufe braucht, aber nicht führt? | In den Dauer-Sichten von HE, RP und SH trägt der Generator solche Ziele nach ihrer Marke als Ziele eines Jahrgangs ein und lehnt ein Ziel ab, dessen direkte Voraussetzung kein Ziel ist. In den verfassten Sichten der übrigen Länder überlässt man sie dem Abschluss. | Eine Behandlung für alle Länder: Vorbereitung nach Z5. Der Generator erzeugt keine Ziele aus dem Bedarf. |
| M8 | Ist die bundesweite Sicht ein Plan? | Sie hat Abschnitte für beide Stufen und 39 Rückgriffe, gehört aber zu keinem Land. | Die bundesweite Sicht ist die kanonische Gliederung und kein Plan. Z3 und Z4 gelten für sie nicht; ihre Rückgriffe bleiben ein Hinweis auf Marken, die zum Bedarf nicht passen. |

Weiter offen ist B13 (jedes Land führt eine fachliche Einheit ohne
Untereinheiten als Ganzes). Der Beschluss betrifft erst den zweiten Schritt.

### 2.4 Umsetzungsentscheidungen unter delegierter Verantwortung

Die folgenden Entscheidungen konkretisieren den Arbeitsauftrag vom
15. November. Sie sind Entscheidungen der ausführenden Agenten mit
nachträglicher Kontrolle durch den Product Owner, keine Behauptung, dass er
jede technische Einzelheit selbst vorgegeben hat.

| Bezug | Entscheidung und Abnahme |
| --- | --- |
| M1 | Der vollständige Landesplan hat ausschließlich Sekundarstufe I und II an seiner Wurzel, mit Sekundarstufe II nach I. Orientierungsziele und Prüfungen erhalten einen begründeten Platz darin. Eine Sicht einer einzelnen Stufe ist ein Ausschnitt; sie benötigt keine künstliche leere zweite Stufe. |
| M2 | Quellenzuordnung und Lernplatz sind getrennt. Eine früh benötigte Kompetenz kann als begründete Vorbereitung früher gelernt werden, während ihre amtlich belegte Zuordnung erhalten bleibt. Eine neue Platzierung schreibt weder eine Quellenbehauptung noch ein Lernergebnis. |
| M3 | Der Platz einer verfassten Voraussetzungshilfe ist keine Stufenaussage. Ihre Lernplatzierung folgt aus dem frühesten tatsächlichen Bedarf im geschlossenen persönlichen Lernumfang. Die Umstellung umfasst die Leser, Sichtbarkeitsprüfungen und Generatoren gemeinsam; bis dahin weist der Bericht ihre unterschiedlichen bisherigen Bedeutungen aus. |
| M4 | Pro Land und Dauermodell gibt es einen maßgeblichen Plan über die Fächer. Kursprofile wählen die fachlichen Anteile; sie autorieren keine widersprechenden Stufen für dasselbe Ziel. Sichten einer Stufe werden daraus abgeleitet. |
| M5 | Die kanonische Marke darf eine ausdrücklich vorläufige didaktische Einordnung begründen. Sie ersetzt niemals den fehlenden Landesbeleg und erzeugt weder ein amtliches Lernziel noch bestandene Quellenabdeckung. Routen prüfen die ausgewertete Platzierung; Quellenprüfungen prüfen weiterhin ihre eigenen Belege. |
| M6 | Eine fachlich falsche Voraussetzung oder Abdeckung wird nicht zum Erhalt eines Reifegrads konserviert. Die vollständige Reparatur liefert geeignete Aufgaben und Rubriken und entfernt die falsche Verbindung. Eine noch offene Prüfungslücke bleibt ein nicht bestandener Befund; weder Frist noch Umbenennung lassen das bestehende Gate bestehen. |
| M7 | Voraussetzungsabschluss erzeugt notwendige Lernziele des persönlichen Lernumfangs, keine neuen amtlichen Zielzuordnungen. Generator und handverfasste Sichten unterscheiden die belegten Ausgangsziele von dieser abgeleiteten Vorbereitung. |
| M8 | Die bundesweite Sicht ist die kanonische Gliederung und kein Landesplan. Die Regeln über zwei Landesstufen gelten dort nicht; Graphintegrität, fachliche Richtigkeit und die übrigen Qualitätsregeln gelten unverändert. |

Ein belegter Rückgriff ist eine fachliche Diagnose, keine Ausnahme von Z4.
Bleibt er ungelöst, ist der betroffene Plan nicht abgenommen. Die Reihenfolge
der strukturellen Einführung verbietet keine notwendige kanonische
Fachkorrektur: Ein neuer Platz allein behebt keinen ungeeigneten Zielumfang.

Die didaktische Recherche unterscheidet drei Belegarten: amtliche Quellen
belegen curricularen Umfang und Zuordnung; veröffentlichte Unterrichtsgänge
belegen einen praktisch beschriebenen Zugang; empirische Untersuchungen
belegen nur die tatsächlich untersuchten Lernergebnisse und Bedingungen.
Keine dieser Belegarten ersetzt die anderen oder eine Erprobung in SkillPilot.

## 3. Was fehlt, damit der Zielzustand vollständig in den Dokumenten steht

### 3.1 Entscheidungen

Abschnitt 2.4 ist die Arbeitsgrundlage für M1 bis M8. Die ausführenden Agenten
führen Quellenrecherche, Fachkorrekturen und Vertrag aus; offene fachliche
Fragen werden untersucht und begründet entschieden. Ein Zwischenbefund darf
als solcher dokumentiert werden, ohne dass dafür andere Arbeiten warten.

### 3.2 Dokumente

| Dokument | Was aufzunehmen ist | Bezug |
| --- | --- | --- |
| Einheitenkonzept, Abschnitte 3.1 und 3.4 | An der Wurzel eines Plans stehen nur die Stufen; Orientierungsziele, Übungsaufgaben und Abiturklausuren sind eigene Ziele einer Stufe. | Z3, M1 |
| Einheitenkonzept, Abschnitt 7.1 | Ein Plan je Land und Dauermodell. Jede Sicht ist ein Ausschnitt dieses Plans; keine Sicht trifft eine eigene Stufenaussage. | Z1, M4 |
| Einheitenkonzept, neuer Abschnitt nach 7.1 | „Geführt in“ und „steht in“; Vorbereitung als abgeleiteter Platz; die gekennzeichnete Vorbereitung als einzige verfasste Abweichung; Bedeutung der kanonischen Marke. | Z5, Z6, M2, M3, M5 |
| Einheitenkonzept, Abschnitt 8 | Kein Gate wird durch eine fachlich nicht bestehende Voraussetzung erfüllt; die Prüfungslücke als Befund. | M6 |
| Einheitenkonzept, Abschnitt 9 | Die Erkundungszahlen durch die Zahlen des eingecheckten Berichts ersetzen. | Z10, F6 |
| `AGENTS.md` §2.4 | Spiegel der geänderten Beschlüsse. | alle |
| Graph-Definition, Quelle unter `docs/concept/skill-graph/source/` | Die Anpassung F7 aus Abschnitt 10.2 des Konzepts ist nicht begonnen: `after` neben `requires` (§2), Einheiten als erklärte Cluster und Planeinheiten (§11), E2 bis E4 und der Wegfall des Zugangsprofils `GD-U14` (§11.5), der Reihenfolgefehler `GD-P05` als Verstoß gegen E2 (§12), R4 als E1 (§13). Zusätzlich: Z3 als Regel, die Trennung „geführt in“ und „steht in“ in §7.2, die Bedeutung der Stelle einer Voraussetzungshilfe (`GD-X13`), die kanonische Marke als Standardzuordnung (`GD-X06`). Zweisprachig, mit Regelregister, Glossar und Umsetzungsstand; danach neu erzeugen. | F7, Z1 bis Z10 |
| Glossar unter `docs/concept/glossary/` | Planeinheit, fachliche Einheit, `after`, Rückgriff, Vorbereitung, Zusatzbedarf, „geführt in“, „steht in“, Standardzuordnung, Prüfungslücke. | alle |
| [Sichtprojektion und Zielplatzierung](../concept/skill-graph/view-projection-and-goal-placement.de.md) und ihr Quellkapitel | Sichten als Ausschnitte des Plans eines Landes; Rollen ohne Bedeutung der Stelle. | Z1, M3, M4 |
| `curricula/DE/Gymnasium/composition-views/README.md` | Regeln für Autoren: Was an der Wurzel stehen darf, wohin Ergänzungsabschnitte gehören, wie eine gekennzeichnete Vorbereitung eingetragen wird. | Z3, M2, M3 |
| [Reifegrade und Routen](../qa-ci/curriculum-quality-maturity-and-routes.md) | Woher die Routenprofile die Stufe eines Ziels nehmen; die Prüfungslücke als ausgewiesener Zustand der Routenregeln. | M5, M6 |
| [JSON-Feldreferenz](landscape-json-field-reference.de.md) | Bedeutung von `dimensionTags.phase` als Standardzuordnung; `projectionRole`. | M3, M5 |
| Entscheidungsprotokoll unter `curricula/DE/Gymnasium/mapping/` | Die Einordnungen aus #154 und #155 stehen nur in Commit-Nachrichten und PR-Texten. Sie gehören in ein Protokoll nach dem Muster von `mathematik-j10-analysis-source-stage-decisions-20260929.md`, je Ziel mit Beleg und Entscheider. | Abschnitt 1.3 |
| [Umsetzungsplan Lerneinheiten](mathematics-physics-learning-units-plan.md) | Stand des ersten Schritts und Verweis auf dieses Dokument. | F1 bis F7 |

### 3.3 Vertrag und Werkzeug

Zwei Arbeiten sind keine Dokumente, ohne sie bleibt der Zielzustand aber
unprüfbar:

- **F1, Form der Planeinheit.** Das Schema der Sichten
  (`contracts/curriculum-package/v1/composition-view.schema.json`) hat
  geschlossene Felder. Die Erklärung einer Planeinheit, der Verweis einer Sicht
  auf den Plan ihres Landes und die Kennzeichnung einer Vorbereitung brauchen
  eine neue Vertragsversion. Solange sie fehlt, erkennt die Lernkarte die
  Stufen an festen Abschnittskennungen.
- **F6, Bericht.** Die Messung aus Abschnitt 1.4 wird ein eingechecktes
  Werkzeug mit erzeugtem Statusbericht: je Land, Kursprofil und Dauermodell
  die Kinder der Planwurzel und die Rückgriffe mit beiden Zielen. Das Konzept
  setzt den formalen F6-Bericht nach F2 und vor die Fachprüfung F5. Für die
  bereits begonnenen Fachkorrekturen wird vorher ein reproduzierbarer
  Diagnosebericht auf den bestehenden Sichten erstellt. Er kennzeichnet die
  vorläufige Zuordnung ausdrücklich und ist noch kein E2-Gate. Nach F1/F2
  verwendet die Abnahme die erklärten Planeinheiten. So kann die Fachprüfung
  ihre Wirkung messen, ohne die Vorschau als fertigen Vertrag auszugeben.

Für F2 ist eine gemeinsame Autorenschaft mit erzeugten Kompatibilitätssichten
festgelegt. Pläne, vollständige Fachbäume und reine Ausschnittsverweise liegen
unter `stage-plans/`; die aktivierten Landessichten unter `composition-views/`
werden daraus deterministisch erzeugt. Die bundesweiten kanonischen Sichten
bleiben außerhalb dieser Landesautorität. Die erzeugten Landessichten sind
danach keine zweite bearbeitbare
Platzierungsquelle. Ein ebenfalls erzeugter, an Dateidigest und Planrevision
gebundener Index liefert die ausdrücklich erklärten Planeinheiten an Lernkarte,
Backend, Paketverbraucher und F6. Die vorhandenen Prüfungen der materialisierten
Sichten bleiben wirksam; ein eigener Vergleich findet veraltete, fehlende,
zusätzliche oder unabhängig bearbeitete Ausgaben. Der Editor muss die
Autoritätsgrenze ebenfalls beachten. Diese Architektur ist eine
Implementierungsentscheidung, noch kein Nachweis ihrer vollständigen Umsetzung.

Die alten Angebotsumfänge bleiben erhalten: Eine dauerneutrale Physiksicht kann
ausdrücklich mehrere Dauermodelle bedienen. Eine kursneutrale Mathematiksicht
der Sekundarstufe I wird nur dann aus mehreren Fachautoritäten abgeleitet,
wenn deren ausgewählte Stufe übereinstimmt. Ein fehlendes Dauermodell oder
Kursprofil wird dabei nicht stillschweigend ergänzt.

### 3.4 Reihenfolge

1. Den Auftrag und die Entscheidungen aus Abschnitt 2.4 in Einheitenkonzept
   und `AGENTS.md` festhalten.
2. Den bestehenden Zustand reproduzierbar diagnostizieren; parallel die
   fachlichen Fälle recherchieren und konkrete Aufgaben entwerfen.
3. F1 und danach F2: gemeinsamer Planvertrag und erklärte Stufen; parallel
   F7 für den jeweils festgelegten Modellteil.
4. F6 auf die erklärten Planeinheiten anwenden und die Ursachen F5 in
   vollständigen fachlichen Paketen beheben. K1 und der falsche
   Prüfungsnachweis K2 gehören in die erste Welle.
5. Die Ergebnisse auf `main` integrieren und den vollständigen CI-Erfolg am
   integrierten Stand nachweisen.

## 4. Curriculare Befunde für die Fachprüfung

Jeder Befund nennt, was feststeht, was belegt ist und was zu entscheiden ist.
Die Belege stammen aus den zwei Fachprüfungen vom 14. November 2026 und sind
vor einer Änderung an der Quelle nachzuprüfen. Ziel-IDs sind auf acht Zeichen
gekürzt. Pfade, die mit `input/`, `mapping/` oder `provenance/` beginnen,
liegen unter `curricula/DE/Gymnasium/`.

### K1 „Bändermodell und Dotierung“ mischt zwei Fassungen

Betrifft 12 Länder; häufigster verbleibender Rückgriff.

- **Befund.** „Sperrschicht und Polung am p-n-Übergang erklären“ (`2084b7d4`)
  arbeitet „mit einem einfachen Ladungsträgermodell“ und braucht
  „Bändermodell und Dotierung“ (`df010b2b`, Q4). Gebraucht wird die Dotierung,
  nicht das Bändermodell. Ein Ziel nur zur Dotierung gibt es nicht.
- **Belege.** Dotierung oder p-n-Übergang mit einfachem Modell in der
  Sekundarstufe I: SL Klasse 9 (`input/SL/LP_PH_gym9_9_nw_Zweig_2024.pdf`,
  S. 27), SN Klasse 9 (`input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf`,
  S. 35), ST Schuljahrgang 9 (`input/ST/FLP_Physik_Gym_01082022_swd.pdf`,
  S. 43), BW 3.3.2 (9), BY Ph10.5.2, TH nur über das Mapping. Bändermodell nur
  in der Sekundarstufe II: HE Q4.5, SN Leistungskurs 11, RP
  Qualifikationsphase. Sachsen trennt beides wörtlich. SH schließt die
  Erklärung der Vorgänge in der Diode für die Sekundarstufe I aus
  (`input/SH/Fachanforderungen_Physik_Sekundarstufe_2022_barrierearm.pdf`,
  S. 27).
- **Vorschlag beider Fachprüfungen.** `df010b2b` teilen, mit dem vorhandenen
  Wortlaut: „das qualitative Bändermodell für Leiter und Halbleiter
  beschreiben“ behält die ID; „erklären, wie Dotierung die Leitfähigkeit
  beeinflusst“ wird ein neues Ziel. `2084b7d4` braucht nur das neue Ziel,
  „Quantenphysikalische Bändermodelle“ (`658cf33d`) und „Supraleitung
  qualitativ verstehen“ (`853dbe54`) das alte.
- **Zu entscheiden.**
  1. Teilung und Elternknoten des neuen Ziels; unter „Q4 › Festkörperphysik“
     würde es wieder Ziel der Sekundarstufe II.
  2. Stufe von „Leiter, Nichtleiter und Halbleiter“ (`7badac4d`, Marke Q4;
     belegt in SL Klasse 9, SN Klasse 8/9, BY Ph10.5). Das neue Ziel braucht
     es.
  3. Die Prüfungsaufgabe „Halbleiter im Bändermodell deuten“ (`1abfd5ef`)
     trägt eine Marke der Sekundarstufe I und prüft das Bändermodell. Sie
     greift in SL, SN, ST und TH zurück.
  4. In BB, BE, HB, HH, MV, NI, NW und SH steht der Diodenteil in der
     Sekundarstufe I, weil eine Rollentabelle im Code ihn dort einträgt
     (`app/scripts/lib/physicsFinalDiodeViewPlacements.ts`,
     `app/scripts/testPhysicsAssessmentProjection.ts`), nicht wegen einer
     Quelle. Gebraucht wird er dort nur von Aufgaben in Q4.
- **Randbedingungen.** Ein neues Ziel braucht alle Prüfspuren der
  Tiefenprüfung einschließlich eines erzeugten Bildes; der Aufruf des
  Bildanbieters braucht die Freigabe des Product Owners. `df010b2b` steht in
  der Abdeckung von `1abfd5ef`, `0f5346d6` und `4a58df57`; die beiden letzten
  sind an das eingefrorene Reduktionsregister gebunden.

**Umsetzung der Fachprüfung, 15. November.** Die obige Teilungsempfehlung wird
durch zwei getrennte Einstiege konkretisiert: Ein einfaches Bindungsmodell
erklärt bewegliche Elektronen und Löcher, ortsfeste Dotierionen und die neutrale
Ladungsbilanz (`9f265f49`). Ein zweites Ziel behandelt die Funktion einer Diode
an vorgegebenem Stromkreis und vorgegebener Kennlinie (`dc55adac`). Die
experimentelle Aufnahme einer Kennlinie bleibt ein eigenes Ziel mit tatsächlicher
Durchführung. Der p-n-Übergang braucht das einfache Dotierungsmodell; das
fortgeschrittene Ziel `df010b2b` behält seine Identität und seinen vollständigen
Lernanspruch einschließlich der Dotierung im Bändermodell.

Diese Reihenfolge stützt sich auf den
[bayerischen Lehrplan für Physik 10](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/physik)
und den [Unterrichtsgang zur Diode der Lehrerfortbildung Baden-Württemberg](https://lehrerfortbildung-bw.de/u_matnatech/imp/gym/bp2016/fb2/p01_eui/1_hintergrund/2_gang/4_diode/).
Die [fachdidaktische Untersuchung von García-Carmona und Criado](https://ensciencias.uab.cat/article/view/v29-n1-garcia-criado)
begründet die gezielte Prüfung von Ladungsträgern, Löchern und Ladungsbilanz.
Das sind Belege für die Modellierungsentscheidung, keine Wirksamkeitsmessung
von SkillPilot und keine zusätzliche amtliche Zuordnung für andere Länder.

Die Aufgabenprüfung erfasst auch mögliche falsche Antworten, die nach dem
veröffentlichten Raster dennoch bestehen würden. Die ersten Raster ließen
zentrale Erklärungen innerhalb einer Punktgruppe ausfallen. Die Korrektur
bewertet deshalb einzeln die wesentlichen Kompetenzen, die zur behaupteten
Zielabdeckung gehören. Teilpunkte bleiben als Rückmeldung erhalten; ein
belangloser Schreib- oder Rechenfehler ist kein zusätzlicher Pflichtnachweis.
Die konkrete Bestehensgrenze gehört offen zum jeweiligen Raster. Es entsteht
weder eine verdeckte Zusatzbedingung im Coach noch ein zweites Lernergebnis.

Beim Transistorschalter trennt die Umsetzung zusätzlich die materialgestützte
Deutung vom tatsächlichen eigenen Aufbau. Bisher erlaubten dieselben globalen
Ziel- und Prüfungskennungen sowohl eine Papierauswertung als auch ein
Schülerexperiment. Ein späterer Wechsel des Landes oder Aufgabenkontexts kann
aus dem gespeicherten binären Ergebnis keine Durchführungsevidenz erzeugen.
Das Experiment erhält daher eine neue Kompetenz- und Prüfungskennung; die
bestehenden Kennungen behalten den Deutungsanspruch. Der neue praktische
Einstieg benötigt das Lesen eines Stromkreisplans, keine vorgezogene
mikroskopische Transistortheorie. Die eigene Versuchsdurchführung wird nur dort
als Quellenforderung zugeordnet, wo sie tatsächlich belegt ist, insbesondere
im bayerischen NTG-Lehrplan.

**Verbleibender praktischer Teil:** Derselbe amtliche Inhaltskatalog verlangt
auch die eigene Untersuchung eines Transistors als Verstärker. Die neue
Schalterprüfung und die materialgestützte Verstärkeraufgabe belegen diesen
Versuch nicht. Er bleibt ein konkret benannter Bestandteil der anschließenden
praktischen Fachlieferung mit K3. Die partielle Quellenzuordnung und ein
bestandener maschineller Check werden nicht als vollständige Abdeckung des
NTG-Profilbereichs ausgegeben.

### K2 Diagrammziele der Jahrgangsstufe 7

- **Befund.** Der Cluster „Diagramme und Visualisierungen interpretieren“
  (`5da9f264`) hat vier Ziele mit der Marke J7: `80c232f1` „Achsen, Skalen und
  Einheiten lesen“, `496f16a0`, `fcfbff12`, `d668c22d` „Missverständnisse
  erklären und korrigieren“. Sie stammen aus der hessischen Oberstufe
  (Prozesskompetenz K4) und hingen in 44 Sichten unter der Einführungsphase.
  #155 stellt sie nach ihrer Marke in die Jahrgangsstufe 7.
- **Belege.** Einen Beleg auf Zielebene für die Sekundarstufe I gibt es nur
  in NI (Doppeljahrgang 5/6, partiell). Belegt in der Sekundarstufe I ist das
  einfachere „Diagramme lesen“ (`5e7d5ff2`, J6): HE Klasse 5/6, BW 3.1.5, SH.
  Nur 6 von 23 Grundkurs-Sichten führen es.
- **Zu entscheiden.**
  1. Stufe der vier Ziele je Land am Beleg, oder Bestätigung der
     Standardzuordnung (M5).
  2. Doppelungen: `80c232f1` deckt sich weitgehend mit `5e7d5ff2`;
     `fcfbff12` und `d668c22d` überschneiden sich mit `acbb7e26` (J6). Die
     Kette der Jahrgangsstufe 7 baut nicht auf der Jahrgangsstufe 6 auf.
  3. Die Kante von „Aufgabe 5 (Jahrgangsstufe 7, 7 BE)“ (`af96c2fc`) auf
     `d668c22d` ist fachlich falsch: Die Aufgabe prüft ein Missverständnis zum
     Distributivgesetz und enthält kein Diagramm. Sie ist der einzige Weg der
     vier Ziele zu einer Prüfungsaufgabe der Sekundarstufe I; ohne sie fällt
     Mathematik von M7 auf M2. Gebraucht wird eine Prüfungsaufgabe der
     Jahrgangsstufe 7, die Diagramme wirklich prüft. Danach entfällt die
     Kante samt Abdeckungseintrag.
  4. „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“ (`ae67bcf1`) und
     „Tonhöhe, Lautstärke und Geräusche unterscheiden“ (`10aad90e`) brauchen
     `80c232f1` (AB2). Nötig ist nur das Ablesen von Achsen und Einheiten
     (AB1), also `5e7d5ff2`. Das Umhängen zieht aber 30 Ziele der
     Jahrgangsstufen 5 und 6 in den Lernumfang und macht fünf Kanten in vier
     Physikzielen überflüssig. Ursache ist die Kette unter `5e7d5ff2` über
     „Informationen aus Tabellen entnehmen“ und „Tabellen erstellen und
     beschriften“ bis „Zuordnungen analysieren“ (J7); die Kante von „Tabellen
     erstellen und beschriften“ ist vermutlich zu stark. Erst die Kette
     prüfen, dann die beiden Kanten.
  5. Dieselbe Frage für „Die Strom-Spannungs-Kennlinie einer Diode
     experimentell bestimmen“ (`3857891b`) und „Die Gleichrichterfunktion
     einer Diodenschaltung erklären“ (`3b586f2a`); dort ist der Bedarf auf AB2
     berechtigt.

### K3 Arbeitsweisen der Physik

- **Befund.** Der Cluster der Arbeitsweisen (`f08d171d`, neun Ziele, Marke
  Sekundarstufe I) steht in keiner Sicht als Ganzes. Vier seiner Ziele sind
  nach #154 Voraussetzungshilfen der Sekundarstufe II: „Beobachtung und
  Erklärung unterscheiden“ (`5355fee0`), „SI-Einheiten in physikalischen
  Beispielen nutzen“ (`3ed3279e`), „Funktion physikalischer Modelle
  erläutern“ (`e5bc2227`), „Physikalische Informationen aus Quellen auswerten“
  (`d2e6f87d`).
- **Belege.** Sekundarstufe I: BW 3.2.1 und 3.3.1 (exakt), BY Ph8.1, Ph8.2
  und Ph8.4. Für die übrigen 14 Länder gibt es keinen Beleg auf Zielebene.
- **Zu entscheiden.**
  1. Quellenbelegte Einordnung der Arbeitsweisen in die Sekundarstufe I je
     Land. In Brandenburg brauchen 6 von 116 Zielen der Sekundarstufe I die
     vier Ziele über nicht eingebundene Ziele („Experimente planen und
     Messdaten auswerten“, „Physikalische Bewertungen begründet formulieren“).
  2. Eine Prüfungsaufgabe der Sekundarstufe I für diese Ziele. Als Ziele der
     Sekundarstufe I haben sie in 13 Ländern keinen Weg zu einer; Physik
     fiele von M7 auf M3 (M6).
  3. In 26 Sichten fehlt die Prüfungsaufgabe „Brechung und Linsen mit dem
     Strahlenmodell untersuchen“ (`44985d9f`) in der Sekundarstufe I. Die
     Sichtenprüfung verlangt sie, sobald `e5bc2227` dort verfügbar ist.

### K4 Potenzfunktionen in Nordrhein-Westfalen und Niedersachsen

- **Befund.** „Transformationen von Potenz- und Wurzelfunktionsgraphen
  beschreiben“ (`eb28b403`, J9) braucht „Potenzfunktionen mit ganzzahligen
  Exponenten beschreiben“ (`30c013ac`, J9). NW (KLP 2023, Einführungsphase)
  und NI (KC 2019, Einführungsphase) führen `30c013ac` in der
  Sekundarstufe II. `eb28b403` steht dort als Vorbereitung in der
  Sekundarstufe I.
- **Belege.** `30c013ac` in der Sekundarstufe I: HE (G8 Klasse 9, G9
  Klasse 10), BW 3.3.4, BY M9.5, BB und BE nur auf Clusterebene. Für die
  übrigen Länder beruht die Einordnung in #155 auf der Marke.
- **Zu entscheiden.**
  1. Was `eb28b403` in NW und NI in die Sekundarstufe I zieht. Acht Ziele
     der Jahrgangsstufe 10 zu Exponential- und Logarithmusfunktionen haben
     gleichförmige Voraussetzungsblöcke (lineare Funktionswerte,
     Geradenschnitt, `eb28b403`, rationale Exponenten); vermutlich ist das
     eine ausgeschriebene Clustervoraussetzung. Alle acht sind an das
     eingefrorene Reduktionsregister gebunden.
  2. In Hessen G9 ist `eb28b403` Ziel der Jahrgangsstufe 9, `30c013ac` steht
     nach der hessischen Zuordnung in Jahrgangsstufe 10. Das ist ein
     Rückgriff zwischen Jahrgängen.

### K5 Ableitungsziele der Jahrgangsstufe 10

- **Befund.** „Monotoniesatz erläutern und Nichtumkehrbarkeit begründen“
  (`f76d00dc`) und „Ganzrationale Funktionen über Term und Graph beschreiben“
  (`1ce8af38`) sind nach #155 Voraussetzungshilfen. Der Cluster `0fd96c54`
  ist damit nur zum Teil bereinigt: `7156558c`, `9f2fc0d1` und `f9fdb733`
  bleiben Ziele der Jahrgangsstufe 10.
- **Belege.** `f76d00dc`: nur BW 3.3.4 (21). `1ce8af38`: NW und NI in der
  Einführungsphase, BY M10.4. Für die drei übrigen Ziele gibt es außer in BW
  keinen Beleg auf Zielebene (HH und HB nur über den Cluster).
- **Zu entscheiden.** Ob die Regel vom 29. September 2026 auch für die drei
  übrigen Ziele gilt, und ob die bayerische Einordnung von `f76d00dc` in
  Jahrgangsstufe 10 gegen M11 zu korrigieren ist.

### K6 Physik der Sekundarstufe I braucht die mittlere Änderungsrate

- **Befund.** „Bewegungen mit Diagrammen untersuchen“ (`ce431132`; BW, BY),
  „Bewegungen mit Videoanalyse untersuchen“ (`d67502e3`) und „Elektrische
  Stromstärke als Ladungsrate deuten“ (`bbee4c52`) brauchen „Mittlere
  Änderungsrate berechnen und deuten“ (`ae20183e`) aus der Einführungsphase.
- **Einschätzung des Konzepts.** Phänomenologisch zuerst: Die
  Sekundarstufe I liest Steigungen und bildet Quotienten; der Begriff der
  Änderungsrate kommt später. Teilen oder Kante korrigieren. Die
  [Fachprüfung zum Wissenskontext](knowledge-context-subject-review-2026-11-14.md)
  empfiehlt für `ce431132` bereits einen engeren Text.

### K7 Prüfungsaufgaben der Sekundarstufe I, die Ziele der Sekundarstufe II verlangen

Betrifft Rheinland-Pfalz und die bundesweite Sicht; der größte Block.

- **Befund Physik.** 17 Prüfungsaufgaben mit einer Marke der Sekundarstufe I
  stehen dort in der Sekundarstufe I und brauchen Ziele mit einer Marke der
  Einführungs- oder Qualifikationsphase, etwa „Kraftstoß“, „Inelastische
  Stöße“, „Kreisbewegung mit Zentripetalkraft anwenden“, „Zerfallsgesetze
  anwenden“ oder „Photonen und Elektronen als Quantenobjekte beschreiben“.
  Diese Ziele kommen als Vorbereitung in die Sekundarstufe I und brauchen
  ihrerseits Ziele, die in der Sekundarstufe II stehen. Anhang A nennt die
  24 Kanten.
- **Befund Mathematik.** In den Dauer-Sichten von Rheinland-Pfalz stehen vier
  Prüfungen der Prozesskompetenzen in der Sekundarstufe I. Sie tragen eine
  Marke der Sekundarstufe II und brauchen 23 Ziele, die in der
  Sekundarstufe II stehen: „Aussagen präzise begründen und prüfen“
  (`e45a39e5`), „Mathematische Ergebnisse adressatengerecht kommunizieren“
  (`b9a501c4`), „Darstellungen sicher wechseln und bewerten“ (`7337049a`),
  „Problemlösestrategien reflektiert wählen“ (`99b3435a`). In den Sichten ohne
  Dauermodell stehen sie im Ergänzungsabschnitt neben den Stufen (K11), ebenso
  in sieben weiteren Ländern.
- **Zu entscheiden.** Je Aufgabe: Prüft sie Stoff der Sekundarstufe I des
  Landes? Dann stehen die gebrauchten Ziele zu spät, oder ihre Marke folgt
  Hessen und passt für Rheinland-Pfalz nicht. Sonst gehört die Aufgabe nicht
  in die Sekundarstufe I, oder ihre Voraussetzungen sind zu stark.

### K8 Schleswig-Holstein, Mathematik

Ziele der Sekundarstufe I brauchen fünf Ziele, die die Sicht in der
Sekundarstufe II führt: „Quadratische Gleichungen lösen“ (`9023226b`),
„Gleichungen mit dem Satz vom Nullprodukt lösen“ (`39fa30f2`), „Baumdiagramme
und Pfadregeln für zusammengesetzte Experimente nutzen“ (`efc3506a`),
„Algebraische Lösungswege auf Gültigkeit prüfen“ (`17c9e061`) und „Funktions-
und Ableitungsgraphen in Beziehung setzen“ (`5518ceb3`; auch Bremen). Zu
entscheiden ist die Stufe dieser fünf Ziele nach den Fachanforderungen.

### K9 Bayern

- Neun Rückgriffe, sieben davon über „Digitale Messdaten mit Sensoren
  erfassen“ (`691c11d0`), „Mittelwert und Streuung aus Messreihen bestimmen“
  (`f23fdfa9`) und die mittlere Änderungsrate (K6); dazu „Elektrische
  Stromstärke als Ladungsrate deuten“ auf „Ladungsphänomene und
  Reibungselektrizität“ und „Harmonische Wellen über ihre Kenngrößen
  beschreiben“ auf „Charakteristische Schwingungsgrößen“.
- 5 Prüfungen der Mathematik im Grundkurs und 11 im Leistungskurs stehen
  neben den Stufen (Anhang B).
- Die bayerischen Sichten ordnen nach der Marke. Eine eigene Aussage Bayerns
  ist das nur, wo ein bayerisches Mapping vorliegt.

### K10 Einzelne Länder

| Land | Befund |
| --- | --- |
| BW | „Induktion durch Änderung des magnetischen Flusses“ (`1a037489`) braucht „Bewegungsinduktion und Ladungstrennung“ (`a522c8c0`). Das Ziel wirkt mit Φ = B · A · cos(α) wie auf dem Niveau der Sekundarstufe II beschrieben. |
| BW | Die Prüfungsaufgabe „Solarmodule experimentell verschalten und nutzen“ (`def74475`) steht neben den Stufen und zieht zwei Vorbereitungsziele dorthin; im Leistungskurs außerdem „Mehrelektronenatome mit Pauli-Prinzip und Energieniveaus deuten“ (`badb0ef3`). |
| TH | „Zählverfahren und kombinatorische Überlegungen für Wahrscheinlichkeiten nutzen“ (`3d8f5e4c`) braucht „Laplace-Experimente auswerten“ (`5ab17678`). |
| HB | „Funktions- und Ableitungsgraphen wechselseitig deuten“ (`632a3837`) braucht `5518ceb3` (K8). |
| BB, BE | Im Leistungskurs steht „Gerade-Gerade-Abstände im Raum bestimmen“ (`509ae03b`) neben den Stufen. |
| SN | Für den Reflexionscluster der Physik gibt es eine exakte Zuordnung der Sekundarstufe I auf Clusterebene („Sich positionieren zur Radioaktivität …“). Er steht nach #154 in der Sekundarstufe II. |

### K11 Ergänzungsabschnitte neben den Stufen

18 Abschnitte in 11 Ländern stehen neben den Stufen (Anhang B). Sie enthalten
Ziele, die aus der Quellenauswertung des Landes stammen und in der Quelle eine
Stufe tragen. Sechs tragen die Sekundarstufe I schon im Namen ihrer Kennung.
Zu entscheiden ist je Abschnitt die Stufe und, wo der Plan Jahrgänge hat, der
Jahrgang. Abschnitte mit Zielen beider Stufen werden geteilt. In Mathematik
betrifft das die Prüfungen der Prozesskompetenzen (Anhang B).

### K12 Voraussetzungen auf Prüfungen

170 Kanten zeigen von gewöhnlichen Zielen auf Prüfungen und widersprechen Z9:
80 in Physik (die zehn Ziele des Clusters „Biophysik: Auge, Ohr und neuronale
Signalleitung“ setzen jeweils dieselben acht Prüfungen der „Übungen Q1“
voraus), 90 in Chinesisch, Informatik, Französisch und Griechisch. Je Kante
ist zu entscheiden, ob sie entfällt oder durch eine Voraussetzung auf ein
Inhaltsziel ersetzt wird (Konzept 9.5).

### K13 Sichten einer Stufe

Nach den Entscheidungen zu K1 bis K11 werden die Sichten einer Stufe
angeglichen (M4). Bis dahin weichen sie von den Sichten mit beiden Stufen ab.

## 5. Regeln für die Fachprüfung

- **Vier Auflösungen.** Jeder Befund endet mit genau einer der vier
  Auflösungen aus Abschnitt 8 des Konzepts. Ergibt die Quellenprüfung, dass
  ein Rückgriff zunächst bestehen bleibt, ist er ein offener Befund und keine
  bestandene Ausnahme von Z4. Fachliche
  Richtigkeit geht vor: Eine Voraussetzung ist nicht falsch, weil sie die
  Lernkarte stört.
- **Belege.** Curriculumdaten sind an Belege gebunden. Gewicht der Belege in
  dieser Reihenfolge: die amtlichen Quellen unter `input/<Land>/` und
  `input/KMK/`; die Mappings unter `mapping/<Land>/lower-secondary/` und
  `upper-secondary/`; die Provenienz unter `provenance/`; zuletzt die Marken
  des Ziels. Schlüsselwort- und Clustermappings sind nur Hinweise. Fehlt der
  Beleg, lautet der Befund „kein Beleg im Repository“.
- **Begründete Zielautorenarbeit.** Neue Formulierungen, Teilungen und
  atomare Brückenziele sind zulässig, wenn ihr fachlicher Bedarf und ihr
  Prüfungsmaßstab belegt sind. Didaktische Modellierungsentscheidungen werden
  als solche gekennzeichnet; sie dürfen keine amtlichen Quellenaussagen
  erfinden. Eine empfohlene Unterrichtsreihenfolge ist nicht automatisch eine
  harte Voraussetzung.
- **Nebenwirkungen vor der Empfehlung messen.** Vor jedem Vorschlag sind zu
  prüfen:
  - die transitive Minimalität und der Zuwachs des Lernumfangs, wenn eine
    Kante umgehängt wird;
  - der Weg jedes betroffenen Ziels zu einer Prüfungsaufgabe seiner Stufe
    (`CQR-101`, `CQR-102`, `CQR-104`, `GVR-012`);
  - die Integritätsprüfung des Generators der Dauer-Sichten von HE, RP und
    SH;
  - die Bindung des Ziels an das eingefrorene Reduktionsregister (Vertrag V9,
    `AGENTS.md` §2.2): Wer ein gebundenes Ziel ändert, braucht dafür ein neues
    Review;
  - die Reifegrad-Untergrenzen. Kein Vorschlag senkt eine Untergrenze oder
    einen Pin.
- **Keine Sammelentscheidungen.** Jede Kante und jedes Ziel wird einzeln
  entschieden und belegt.
- **Lieferform je Befund.** Entscheidung mit Beleg (Pfad und Fundstelle), die
  konkrete Datenänderung (welche Kante, welches Ziel, welcher Abschnitt in
  welchen Sichten), die betroffenen Prüfungen und die gemessene Wirkung auf
  die Bedingungen aus Abschnitt 2.2. Entscheidungen gehen in ein Protokoll
  unter `mapping/`; zusammenhängende Datenänderungen werden als wenige
  prüfbare Lieferungen integriert. Ein offener PR ist kein Abschluss.
- **Verantwortung.** Die ausführenden Agenten entscheiden und implementieren
  innerhalb des Auftrags; der Product Owner kontrolliert die Ergebnisse.
  Gebundene Ziele erhalten echte aktuelle Reviews. Notwendige Bildarbeit und
  fachlich begründete Änderungen an Tests gehören zur Umsetzung, ohne die
  geschützten Qualitätsanforderungen zu senken.

## 6. Reihenfolge der Befunde

| Rang | Befund | Wirkung |
| --- | --- | --- |
| 1 | K1, K2 | Halbleiterpfad ohne vorgezogene Bandtheorie; fachlich falschen Diagramm-Prüfungsnachweis durch echte Aufgaben ersetzen. |
| 2 | K11 | Bedingung 1 in 11 Ländern |
| 3 | K3, K4, K6, K10 | Echte Prüfungswege für Arbeitsweisen und restliche Rückgriffe in NI, NW, BW, HB und TH. |
| 4 | K13 | Stufenausschnitte aus den korrigierten Vollsichten ableiten und durchgehend validieren. |
| 5 | K8, K9 | Schleswig-Holstein und Bayern |
| 6 | K7 | Rheinland-Pfalz |
| 7 | K5, K12 | Fachliche Bereinigung auch dort, wo die oberste Tafel unverändert bleibt. |

## 7. Lieferstand des delegierten Auftrags

Der kurze Verlauf für den Product Owner steht im fortlaufenden
[Management Summary](stage-plan-management-summary.md), mit einem Eintrag
nach jedem Umsetzungspaket mit Datum, Uhrzeit und Zeitzone, Fortschritt gegenüber K1–K13
und F1–F7, Entscheidungen, Kontrollstellen und verlinkten Nachweisen. Ein
kleiner Doku-Abschluss nach erfolgreicher Main-CI ist ausdrücklich erlaubt;
er muss nicht auf die nächste fachliche Lieferung warten.

Die Befunde K1 bis K13 und die erste strukturelle Einführung F1 bis F7 bilden
den Arbeitsumfang dieser Übergabe. Die späteren fachlichen Einheiten und ihre
Laufzeitfunktionen F8 bis F13 bleiben im Einheitenkonzept eigene Folgeschritte;
sie werden hier nicht durch einen bestandenen Stufenbericht als geliefert
ausgewiesen.

| Lieferung | Aktueller Nachweis | Noch erforderlich |
| --- | --- | --- |
| #156 Übergabe | Alle drei PR-Prüfungen erfolgreich; am 15. November als `c19f1d3f3e` auf `main` integriert. | Die Umsetzung der beschriebenen Arbeiten; die Übergabe selbst löst keinen Fachbefund. |
| #153 Lernkartenvorschau | Vollständige [PR-CI](https://github.com/enpasos/skillpilot/actions/runs/43669866522) am Kopf `07b30fb2fd` erfolgreich; als `a7c7e9ceb2` auf `main` integriert. Auch die frische [Main-CI](https://github.com/enpasos/skillpilot/actions/runs/43674399591) ist erfolgreich: 14/14 Jobs bestanden, abgeschlossen am 15. November um 04:54 UTC. Die zuvor genannten 25 erfolgreichen und zwei übersprungenen Checks bezeichneten die damalige Summe mehrerer Workflows am Commit um 04:56 UTC, nicht diesen einzelnen Lauf. | Die Vorschau ersetzt noch nicht die erklärten Planeinheiten; die folgenden neuen Lieferungen benötigen jeweils ihre eigene Integration und CI. |
| K1 Halbleiter-/Diodenpfad | Lokal drei neue Kompetenzen und drei neue Lernendenaufgaben: einfaches Dotierungsmodell, funktionales Diodenverhalten und eigener Transistorversuch. 33 Quellenzuordnungen korrigiert; vier Eingangsquellen bytegleich. Die ursprünglichen zwei Reviews und die zweite Runde sind erhalten. Sechs aktuelle Aufgaben wurden mit vollständigem Material und analytischen Kernrastern tatsächlich geprüft; der eigene Versuch hat eine unabhängige Inhalts- und Bildprüfung. Am aktuellen gemeinsamen Stand bestehen G17 über 21 kanonische Kataloge, CQR-104 mit 80 Routen, alle 70 nativen Physikprojektionen und die Quellenprüfung. Die hessische Vorbereitung steht innerhalb von Q4. | Alle 14 Ziele sind zweifach aktuell bestätigt, nativ finalisiert und aktiviert; 14/14 geprüfte Buchseiten stimmen mit dem aktuellen Katalog überein. Die vollständige lokale Qualitätsprüfung besteht für alle fünf tief geprüften Fächer; Physik erreicht M7 mit 481 aktuellen Inhaltszielen. Die unveränderten Mindeststandards für 21 Kataloge und zwölf Routen bestehen gegen `a7c7e9ceb2`. Integration und frische Remote-CI bleiben erforderlich. Der eigene Verstärkerversuch bleibt für die anschließende praktische Lieferung offen; Stufenplatzierungen folgen F2/F5. |
| K2 Diagramm-Prüfungsweg | Vier Diagrammaufgaben mit acht eigenen Diagrammen ersetzen die sachfremde Abdeckung durch Task 5. Zusätzlich sind vier elementare Voraussetzungsketten korrigiert und drei vollständige zweisprachige Aufgaben für Tabellenaufbau, Tabellenlesen und Diagrammlesen lokal integriert. Die Zahl gewöhnlicher Mathematikkompetenzen bleibt 807; vier davon haben jetzt fachlich passende Voraussetzungen. Die vollständigen Zieltexte und P-Profile bleiben erhalten. Zwei unabhängige D-Runden bestätigten zunächst alle vier Ziele. Der spätere CI-Befund zur J5-/J6-Kante ist durch die Trennung von Tabellenkompetenz und Zahlenvorbereitung der stärkeren Aufgabe behoben; für das Tabellenziel sind zwei weitere aktuelle D-Runden nativ aufgelöst und aktiviert. Alle 354 Composition-Sichten einschließlich 88 Mathematiksichten bestehen mit null Fehlern und 2.388 dokumentierten Warnungen. | Der gemeinsame sequentielle Qualitätslauf und die unveränderten Mindeststandards für 21 Kataloge und zwölf Routen bestehen; Mathematik bleibt M7. Die erste Lieferung änderte 18 erzeugte Dauermodellsichten, die elementare Ergänzung davon neun. Die vollständigen ID-Deltas zu beiden früheren Datenständen sind geprüft. Die jüngste Aufgabengrenze lässt alle 18 Dauermodellsichten bytegleich und die Voraussetzungshüllen aller 128 aufgezeichneten Seedmengen unverändert. Integration und frische Remote-CI bleiben erforderlich. Physikrückgriffe und Länderplatzierungen bleiben innerhalb K2 offen. |
| F1 Planvertrag | Lokaler Kandidat mit gemeinsamer Stufenautorität, expliziten G8/G9-Bindungen und abgeleiteten Ausschnitten; dauer- und kursneutrale Angebote bleiben erhalten. 58 Vertrags-Negativfälle, die ergänzten Materialisierungsprüfungen, ESLint und der App-Typecheck bestehen; die bisherigen 50 Vertragsfälle bleiben erhalten. Reale Sichten aus BB und HE werden gegen den vorhandenen Compiler geprüft; versteckte Voraussetzungshinweise werden keine Lernziele. Der unabhängige Rollen- und Namensvergleich bestätigt die korrigierte Fassung; echte doppelte Ziele und nicht auflösbare Namen scheitern weiterhin. | Reale Sichten, Leser und Paketverträge umstellen; F2 bis F7 sowie vollständige Abnahme der betroffenen Pläne. |
| F2 Erzeugung der Sichten | Lokale Grundlage erzeugt v1-Kompatibilitätssichten und einen an Quelldigests gebundenen Index aus getrennten Plan- und Sichtquellen. Die unabhängig gefundenen Lücken bei qualifizierten Referenzen, semantischer Kompilierung und der Bindung der Aktivierungsdatei sind behoben und nachgeprüft. 51 Negativfälle einschließlich der Berichtsanbindung und nativer Rollen-/Namensgegenproben bestanden. | Reale Quellen autorieren, vorhandene Generatoren und Editor umstellen, Leser und Paketverbraucher anbinden und den vollständigen Datenbestand abnehmen. |
| F6 Stufenbericht | Lokaler Diagnosekern prüft unabhängig gewählte Fachprofile, direkte und transitive Rückgriffe mit Zeugenpfad sowie notwendige Vorbereitung. Die Kommandozeile verlangt einen frisch materialisierten vollständigen Katalog und bindet den Bericht an den Indexdigest. Gegenbeispiele für gemischte Fachprofile, ungültige globale Graphen, veraltete Artefakte und geänderte Kantenreihenfolge sind geprüft. | Reale Pläne vollständig aktivieren, Bericht erzeugen und seine Befunde lösen. Die geprüfte Grundlage und ihre isolierten Testdaten sind kein bestandener realer Stufenplan. |
| F7 Zweisprachige Zielnorm | Lokal angenommene zweite Fassung nach unabhängigem Normreview: 26 Quellen, 26 U/P-Registerzeilen und sieben konkrete Gegenbeispiele. Graph-Definition, Architektur und Glossar sind aus ihren Quellen neu erzeugt; 44 Markdownseiten und sechs PDF-Builds bestehen. Die Zielnorm trennt Quellenzuordnung von Lernplatz, erklärt E1–E4 und hält bestehende Laufzeit und spätere F8–F13-Arbeiten ausdrücklich auseinander. Die unveränderten Originalreviews und der verworfene erste Entwurf bleiben als Nachweis erhalten. | Integration und frische Main-CI fehlen. Keine realen Landespläne aktiviert; keine Laufzeitwirkung oder gemessene Verringerung von Rückgriffen durch diese Normlieferung. |
| CI-Nachlauf der ersten Lieferung | Die aktuelle vollständige lokale Qualitätsberechnung und alle 21/12 Mindeststandards bestehen. Die fünf M7-Fächer sind vollständig; 25 Lernroutenfälle und 51 negative Paketfälle bestehen. Der [aktuelle Nachweis](https://github.com/enpasos/skillpilot/blob/e6eb2add29a325204dae9a24f37d89dc0e2a9425/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-table-task-boundary-current-v2/README.md) erhält die tatsächlichen Fehler, frischen Inhaltsreviews und technische Gegenprüfung. | Der bisherige PR-Durchgang endete mit neun erfolgreichen und fünf fehlgeschlagenen Jobs. Die gebündelte Korrektur erneut vollständig durch CI führen, integrieren und frische Main-CI abwarten. |
| Weitere K-Befunde | Entscheidungen in Abschnitt 2.4; Priorität gemäß Abschnitt 6. | Zusammenhängende fachliche Lieferungen mit tatsächlichen Aufgaben und frischen Nachweisen. |

## Anhang A: Verbleibende Rückgriffe

Grundkurs, Sichten mit beiden Stufen. „(V)“ heißt: Das Ziel steht als
Vorbereitung in der Sekundarstufe I.

| Land | Ziel der Sekundarstufe I | braucht Ziel der Sekundarstufe II |
| --- | --- | --- |
| BB, BE, HH, MV, HB, NI, NW | Sperrschicht und Polung am p-n-Übergang erklären (`2084b7d4`, V) | Bändermodell und Dotierung (`df010b2b`) |
| SL, SN, ST, TH | Sperrschicht und Polung am p-n-Übergang erklären (`2084b7d4`) | Bändermodell und Dotierung (`df010b2b`) |
| SL, SN, ST, TH | Prüfungsaufgabe: Halbleiter im Bändermodell deuten (`1abfd5ef`) | Bändermodell und Dotierung (`df010b2b`) |
| NI, NW | Transformationen von Potenz- und Wurzelfunktionsgraphen beschreiben (`eb28b403`, V) | Potenzfunktionen mit ganzzahligen Exponenten beschreiben (`30c013ac`) |
| HB, SH | Funktions- und Ableitungsgraphen wechselseitig deuten (`632a3837`) | Funktions- und Ableitungsgraphen in Beziehung setzen (`5518ceb3`) |
| TH | Zählverfahren und kombinatorische Überlegungen für Wahrscheinlichkeiten nutzen (`3d8f5e4c`, V) | Laplace-Experimente auswerten (`5ab17678`) |
| BW, BY | Bewegungen mit Diagrammen untersuchen (`ce431132`) | Mittlere Änderungsrate berechnen und deuten (`ae20183e`) |
| BW | Induktion durch Änderung des magnetischen Flusses (`1a037489`) | Bewegungsinduktion und Ladungstrennung (`a522c8c0`) |
| BY | Digitale Messdaten auswerten und Unsicherheiten berücksichtigen (`72effc66`) | Digitale Messdaten mit Sensoren erfassen (`691c11d0`); Mittelwert und Streuung aus Messreihen bestimmen (`f23fdfa9`) |
| BY | Bewegungen mit Videoanalyse untersuchen (`d67502e3`) | `691c11d0`; `f23fdfa9`; `ae20183e` |
| BY | Elektrische Stromstärke als Ladungsrate deuten (`bbee4c52`) | Ladungsphänomene und Reibungselektrizität (`a6e48b88`); `ae20183e` |
| BY | Harmonische Wellen über ihre Kenngrößen beschreiben (`cb0ced6d`, V) | Charakteristische Schwingungsgrößen (`fcf8580c`) |
| SH | Scheitelpunkte quadratischer Funktionen bestimmen (`3e4032bd`); Quadratische Gleichungen: Lösungsverfahren und Lösungsvielfalt (`6224d04c`); Substitution zum Lösen von Gleichungen anwenden (`2bd88d66`, V) | Quadratische Gleichungen lösen (`9023226b`) |
| SH | Aufgabe 7 (Jahrgangsstufe 9, 5 BE) (`567e352a`); Quadratische Funktionen in Anwendungen modellieren und lösen (`a7ccb7a9`); Wurzelgleichungen durch einmaliges Quadrieren lösen (`14d0e697`, V); Ganzrationale Funktionen als Summen von Potenzfunktionen beschreiben (`15ce2a7e`, V); Potenzgleichungen lösen (`d0db87c4`, V) | Gleichungen mit dem Satz vom Nullprodukt lösen (`39fa30f2`) |
| SH | Formale Schreibweisen situationsgerecht nutzen (`647ec09d`, V) | Algebraische Lösungswege auf Gültigkeit prüfen (`17c9e061`) |
| SH | Stochastische Simulationen und Monte-Carlo-Verfahren deuten (`e55edcb9`, V) | Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen (`efc3506a`) |
| SH | Sperrschicht und Polung am p-n-Übergang erklären (`2084b7d4`, V) | Bändermodell und Dotierung (`df010b2b`) |

Rheinland-Pfalz und die bundesweite Sicht: Über diese Kanten kommen Ziele mit
einer Marke der Sekundarstufe II als Vorbereitung in die Sekundarstufe I
(K7).

| Prüfungsaufgabe der Sekundarstufe I | braucht (Marke) |
| --- | --- |
| Trägheit, Kraftstoß und Stoßvorgang untersuchen | Einfache Stossvorgaenge mit Impuls- und Energieerhaltung analysieren (E); Kraftstoß (E) |
| Wurf- und Bremsbewegungen modellieren | Waagerechter Wurf analysieren (E) |
| Materiestruktur und radioaktiven Zerfall ordnen | Elementare Bestandteile der Materie mit Strukturmodellen ordnen (Q4); Zerfallsgesetze anwenden (Q4) |
| Kernreaktionen und Energieoptionen bewerten | Kernenergieoptionen mit physikalischen Kriterien bewerten (Q4) |
| Temperatur mit dem Teilchenmodell erklären | Kinetische Gastheorie & Temperatur (E) |
| Einen inelastischen Stoß bilanzieren | Inelastische Stöße (E) |
| Einen Fall mit Luftwiderstand modellieren | Fallbewegung mit Luftwiderstand und Grenzgeschwindigkeit (E) |
| Eine Kurvenfahrt mit Zentripetalkraft analysieren | Kreisbewegung mit Zentripetalkraft anwenden (E) |
| Gravitations- und Rückstellkräfte modellieren | Gravitationsgesetz und Gewichtskraft anwenden (E); Lineare Rückstellkraft bei harmonischen Schwingungen beschreiben (Q2) |
| Energieumwandlungen und Klimawirkungen beurteilen | Reversible und irreversible Vorgänge unterscheiden (E); Klimawirkungen von Energieentscheidungen fachlich diskutieren (E) |
| Halbleiter im Bändermodell deuten | Bändermodell und Dotierung (Q4) |
| Magnetfelder berechnen und Induktion anwenden | Technische Anwendungen des Induktionsgesetzes qualitativ erklären (Q2); Magnetfeldmodelle für geraden Leiter und lange Spule auswählen und anwenden (Q1) |
| Spektrallinien und Photonen deuten | Emission, Absorption und Linienspektren (Q3); Photonen und Elektronen als Quantenobjekte beschreiben (Q4) |
| Stromstärke und Spannung als Ladungsgrößen deuten | Arbeit, Spannung und Potenzial im E-Feld (Q1) |
| Eine Bewegung digital auswerten | Bewegungen mit Videoanalyse untersuchen (E); Digitale Messdaten auswerten und Unsicherheiten berücksichtigen (E) |
| Lichtleitung in einer Glasfaser erklären | Totalreflexion und Glasfasern (Q3) |
| Einen Rettungs- und Materialwagen energetisch bewegen und heben | Potenzielle Energie (Lageenergie) (E) |

Dazu kommt in beiden die Kante von „Idealen Transformator quantitativ deuten“
(Vorbereitung) auf „Technische Anwendungen des Induktionsgesetzes qualitativ
erklären“ (Q2). In der bundesweiten Sicht bestehen außerdem die Rückgriffe
weiter, die #154 und #155 in den Ländersichten behoben haben.

## Anhang B: Was neben den Stufen steht

| Land | Fach | Abschnitt (Kennung) | Ziele mit Marke Sek I / Sek II / ohne |
| --- | --- | --- | --- |
| BW | Mathematik | Weitere lehrplanbelegte BW-Ziele (`bw-source-alignment-gk`, `-lk`) | 92 / 16 / 1 (LK: 92 / 30 / 1) |
| HE | Mathematik | Geometrie, Funktionen und Daten (`he-source-extraction-supplements`), nur in den Sichten ohne Dauermodell | 12 / 0 / 0 |
| HH | Mathematik | Funktionen, Zinsrechnung, Stochastik und Geometrie (`hh-source-extraction-supplements-seki`) | 5 / 0 / 0 |
| MV | Mathematik | Problemlösen, Algebra, Geometrie und Stochastik (`mv-source-extraction-supplements`) | 20 / 6 / 0 |
| MV | Physik | Optik, Felder und Quantenphysik (`physics-mv-source-extraction-supplements`) | 1 / 0 / 1 |
| NI | Mathematik | Prozesskompetenzen, Funktionen, Algebra und Geometrie (`ni-source-extraction-supplements`) | 9 / 6 / 0 |
| NI | Physik | Niedersachsen-spezifische KC-Module (`physics-ni-kc-specific`) | 0 / 0 / 2 |
| NW | Mathematik | Prozesskompetenzen, Funktionen, Potenzen und Stochastik (`nw-source-extraction-supplements-seki`) | 4 / 6 / 0 |
| RP | Mathematik | Prozesskompetenzen, Funktionen, Potenzen und Logarithmen (`rp-source-extraction-supplements-seki`), nur in den Sichten ohne Dauermodell | 6 / 5 / 0 |
| SL | Mathematik | Prozesskompetenzen, Funktionen, Stochastik und Geometrie (`sl-source-extraction-supplements`) | 5 / 6 / 0 |
| SL | Physik | Optik, Felder, Quanten- und Teilchenphysik (`physics-sl-source-extraction-supplements`) | 2 / 0 / 1 |
| SN | Mathematik | Prozesskompetenzen, Funktionen, Logarithmen und Stochastik (`sn-source-extraction-supplements-seki`) | 6 / 6 / 0 |
| SN | Physik | Experimentieren, Optik, Energie und moderne Physik (`physics-sn-source-extraction-supplements`) | 2 / 0 / 2 |
| ST | Mathematik | Prozesskompetenzen und Funktionen (`st-source-extraction-supplements-seki`) | 2 / 6 / 0 |
| ST | Physik | Experimentieren, Mechanik und Thermodynamik (`physics-st-source-extraction-supplements`) | 5 / 0 / 0 |
| TH | Mathematik | Prozesskompetenzen, Algebra, Geometrie und Stochastik (`th-source-extraction-supplements-seki`) | 10 / 6 / 0 |
| TH | Physik | Experimentieren, Mechanik und Thermodynamik (`physics-th-source-extraction-supplements`) | 2 / 0 / 0 |

Die Ziele mit Marke Sek II in den Abschnitten der Mathematik außer in BW sind
die sechs Prüfungen der Prozesskompetenzen, in RP fünf davon (K7): „Aussagen
präzise begründen und prüfen“, „Darstellungen sicher wechseln und bewerten“,
„Formale Verfahren und Werkzeuge reflektiert einsetzen“, „Mathematische
Ergebnisse adressatengerecht kommunizieren“, „Problemlösestrategien
reflektiert wählen“ und „Sachkontexte modellieren und Entscheidungen
begründen“.

Einzelne Ziele neben den Stufen:

| Land | Ziele |
| --- | --- |
| BY, Grundkurs | Prüfungen der Mathematik: Spatprodukt, Orientierung und Tetraedervolumen prüfen (`b321e32c`); Zylinder-, Kegel- und Kugelvolumen vergleichen (`d110ab96`); Vektorabhängigkeit und Kollinearität begründen (`4f85d29a`); Quader mit Geometriesoftware aus zwei Ansichten prüfen (`6cff2b2e`); Figureneigenschaften mit Winkeln und Ähnlichkeit begründen (`9809780d`) |
| BY, Leistungskurs | zusätzlich: Pyramidenvolumen aus Querschnitten herleiten (`938d47a2`); Skalarprodukt über eine orthogonale Projektion erklären (`e98672c6`); Skalarprodukt über die orthogonale Projektion begründen (`be48054d`); Eine Koordinatenebene räumlich beschreiben (`03b00864`); Abstand windschiefer Geraden bestimmen (`60dbe2ed`); Gerade–Ebene- und Ebene–Ebene-Abstände bestimmen (`240f7716`) |
| BW | Prüfungsaufgabe: Solarmodule experimentell verschalten und nutzen (`def74475`) mit den Vorbereitungszielen Solarmodule in Schaltungen experimentell untersuchen (`0dd1e39c`) und Elektrische Leistung und Wirkungsgrad bilanzieren (`46e42b07`); im Leistungskurs Mehrelektronenatome mit Pauli-Prinzip und Energieniveaus deuten (`badb0ef3`) |
| BB, BE, Leistungskurs | Gerade-Gerade-Abstände im Raum bestimmen (`509ae03b`) |
