# Q4-Kommunikationsprüfungen: enger Reparaturentwurf, nichtkanonisch

Stand: 27. September 2026. **Entwurf zur unabhängigen Quellen-, Aufgaben- und Projektionsprüfung, keine Prüfungsfreigabe.** Die eigenen Aufgaben- und Lösungstexte sind CC-BY-4.0; die amtliche Quelle bleibt Drittmaterial. Es wird weder eine tatsächliche Gruppenleistung noch eine menschliche Curriculum-QS behauptet.

## Warum die bestehende Prüfung nicht einfach ergänzt werden kann

`b9a501c4-9d74-5514-b77b-895980b89b1b` ist heute für GK **und** LK und 15 Länder sichtbar; `requires` und `examData.coveredGoalIds` enthalten dieselben fünf Kommunikationsziele. Ihr Einzeltext beobachtet keine Gruppenarbeit (`fc2cf102…`), keine eigenständige Selbstreflexion mit Verbesserungsableitung (`8b635349…`) und keine gesonderte LK-Leistung (`b35f8254…`, selbst nur LK-tagged). Das Konfidenzintervall aus Q3.4 ist in Hessen weder für GK noch für LK generell verbindlich; eine Zufallsstichprobenannahme fehlt. Eine zusätzliche Symbolfrage würde nur die Lücke bei `aeae526e…` adressieren und den Rest nicht reparieren.

Die [amtliche HE-Quelle](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf) weist auf gedruckter S. 24 K6.1 als **AB I** aus; der bisherige Graph hat `aeae…` auf AB2. Das verpflichtende Themenfeld **Q4.1 Funktionenscharen** umfasst auf gedruckter S. 51 das Untersuchen ganzrationaler Funktionenscharen und die Bedeutung des Parameters für den Graphen auf grundlegendem Niveau (GK und LK). Die folgenden kleinen Aufgaben verwenden deshalb die Schar `f_a(x)=x²+ax` statt eines nicht allgemein voraussetzbaren Konfidenzintervalls. Q4.1 begründet den **HE-Kontext**, nicht pauschal die übrigen 14 Länder oder alle Prozessziel-Zuordnungen.

## Exakte Kandidatenbindungen

Die IDs folgen dem bestehenden `DE-GYM-CANONICAL-MATH:`-Shortkey-Verfahren (SHA-1-basiert) und sind nur Reservierungen für einen späteren Integrationsentscheid. Für **jeden** unten genannten Kandidaten gilt `requires` **bytegleich** `examData.coveredGoalIds`. Die Quelle rechtfertigt zunächst höchstens `applicability.jurisdiction: ["DE-HE"]`; der fachliche Schnitt mit Kursprofil, Ziel- und Parent-Sicht muss vor Einbau neu berechnet werden. Alle neuen `examData.reviewStatus` wären bis zur unabhängigen QA `needs_review`, niemals automatisch `released`.

| Kürzel / reservierte Prüfungs-ID | Kurs | `requires` = `coveredGoalIds` | Punkte / Bestehen | Einbaustatus |
| --- | --- | --- | --- | --- |
| N / `0232b2b3-5a2e-55b7-80f5-002d2ebe65ae` | GK, LK | `["aeae526e-b3a4-5a17-b177-351df0307cb9"]` | 6 / 3 | Ziel AB1, Quellen-Mapping, D/P/A/M/V neu prüfen |
| R / `7fa5c39c-ed29-53b3-8bf1-f3ec240cd40b` | GK, LK | `["83a6ccb1-576e-59e1-8a97-8a332ec7dda8"]` | 6 / 3 | K6.2/AB2-Quellenkonflikt, neue Quellenentscheidung |
| S / `deb1df32-7d99-5f67-8cf7-3bc4ba75c6c2` | GK, LK | `["8b635349-abc3-59e7-af93-ec28940bf690"]` | 6 / 3 | K6.3/AB3-Quellenkonflikt, eigene Reflexion belegen |
| G / `3c92e589-6b2a-57db-8497-a877e9e7dfa9` | GK, LK | `["fc2cf102-dcde-5565-884f-7c9e3e3b54b6"]` | 8 / 4 | Fachquelle **und** beobachtbarer Gruppen-Workflow offen |
| L / `9b9b0e7a-f6be-5554-8979-9b421e4fd8a0` | nur LK | `["b35f8254-dfcc-5d4d-b77f-7b182999617f"]` | 8 / 4 | K6.3/AB3-Quellenkonflikt und LK-Projektion offen |

Die fünf Ein-Ziel-Bindungen sind bewusst eng: Weder ein allgemein gehaltenes Kommunikationsprodukt noch eine rechnerisch richtige Musterlösung erbringt automatisch alle fünf Kompetenzen. Die K6-Prozessquelle ist phasenübergreifend; die Einordnung unter Q4 ist eine SkillPilot-Platzierungsentscheidung. Keine der fünf ID-Reservierungen wird durch dieses Dokument im Graphen angelegt.

## N — Notation einfach und adressatengerecht erklären

**Aufgabe (6 BE):** Für jede reelle Zahl `a` ist `f_a(x)=x²+ax` gegeben. Für `a=2` und `x=1` gilt `f_2(1)=3`. Erläutere einer Person, die die Schreibweise noch nicht kennt, was `a`, `x`, `f_2` und die Aussage `f_2(1)=3` bedeuten. Wähle anschließend selbst **andere** Werte für `a` und `x`, berechne einen passenden Funktionswert und erkläre deine zweite Schreibweise ebenso kurz. Eine bloße Rechnung ohne Bedeutungserklärung genügt nicht.

**Muster:** `a` wählt eine Funktion aus der Schar; `x` ist die Eingabe. Für `a=2` ist `f_2(x)=x²+2x`; beim Eingabewert `1` ergibt das `1+2=3`. Also bedeutet `f_2(1)=3`: Die Funktion mit Parameter 2 ordnet der Eingabe 1 den Wert 3 zu. Eigenes Beispiel: Für `a=-1`, `x=2` ist `f_{-1}(2)=2²-2=2`; die gewählte Funktion liefert bei 2 den Wert 2. Die Indizes sind weder Multiplikationszeichen noch Eingabewerte.

**Raster:** Parameter als Auswahl einer Scharfunktion (1), Eingabe und Output korrekt unterschieden (1), erste Aussage `f_2(1)=3` in verständlichen Worten erläutert (1), andere Werte sinnvoll gewählt und richtig berechnet (1), eigene Schreibweise korrekt und adressatengerecht erklärt (2). Summe 6. Damit ist nur `aeae…` beobachtbar; eine mehrschrittige AB2-Kommunikation wird nicht behauptet.

## R — Auf eine konkrete Rückfrage reagieren

**Aufgabe (6 BE):** Ausgangspunkt ist `f_a(x)=x²+ax` und `f_2(1)=3`. Eine Mitschülerin fragt: „Heißt das, dass bei **jedem** `a` die Eingabe `1` den Wert `3` ergibt? Ich dachte, die kleine 2 wäre der Eingabewert.“ Antworte in höchstens vier Sätzen so, dass die beiden Missverständnisse geklärt sind. Passe die Erklärung an diese Rückfrage an und belege die Änderung durch ein Gegenbeispiel.

**Muster:** Nein. Die kleine 2 wählt die Funktion mit Parameter `a=2`; die Eingabe ist die Zahl in der Klammer, hier `1`. Bei `a=1` ist `f_1(1)=1²+1=2`, also nicht 3. Die Funktionswerte hängen vom gewählten Parameter **und** der Eingabe ab.

**Raster:** Beide konkreten Missverständnisse erkannt (2), Rollen von Index und Klammer argumentativ geklärt (1), korrektes Gegenbeispiel (2), erkennbar angepasste, verständliche Antwort (1). Summe 6. Eine bloße Wiederholung der ersten Erklärung ohne Reaktion auf die Rückfrage genügt nicht.

## S — Eigene Erklärung vor und nach Selbstprüfung

**Aufgabe (6 BE, zwei getrennte Abgaben vor Musterfeedback):** 1. Erkläre einer lernenden Person in zwei bis drei Sätzen, wie `f_a(x)=x²+ax` und `f_2(1)=3` zusammenhängen. 2. Prüfe **deinen eigenen ersten Text** anhand von Klarheit, Struktur und Verwendung der Fachsprache; benenne zwei konkrete Stellen, die du verbesserst, und warum. 3. Schreibe eine überarbeitete Fassung. Der erste Text bleibt sichtbar, damit echte Selbstreflexion und nicht nur ein nachträglich geschönter Endtext beurteilt werden kann.

**Muster/Beurteilung:** Eine individuelle Musterantwort ist nicht wörtlich vorgegeben. Beispiel einer ersten, schwachen Fassung: „Man setzt ein und es kommt 3 heraus.“ Zulässige Selbstkritik: „Ich habe nicht gesagt, dass 2 den Parameter `a` festlegt und 1 die Eingabe ist; außerdem ist ‚es‘ mehrdeutig.“ Verbesserte Fassung: „`f_2` ist die Funktion `x²+2x`. Gibt man `x=1` ein, erhält man `f_2(1)=1²+2·1=3`. Die 3 ist der zugehörige Funktionswert.“

**Raster:** Originaltext fachlich auswertbar (1), zwei **eigene** konkrete Verbesserungsstellen mit begründeter Wirkung (2+1), revidierter Text behebt die benannten Mängel (2). Summe 6. Kritik nur an einem fremden Mustertext deckt `8b…` nicht ab.

## G — Kooperatives Zusammenführen, nur mit echter Gruppenevidenz

**Aufgabe (8 BE):** Mindestens zwei Lernende bearbeiten gemeinsam `f_a(x)=x²+ax`. Teilt die Arbeit vorab sichtbar auf: Eine Person untersucht die Nullstellen für `a=2`, eine zweite für `a=-2`, eine dritte Funktion (oder eine der beiden Personen) kontrolliert die allgemeine Vermutung und den Sonderfall `a=0`. Jede Person dokumentiert ihren eigenen Zwischenschritt. Vergleicht die Teilresultate im Gespräch, korrigiert Unterschiede und gebt **ein** gemeinsames Ergebnis mit Begründung ab. Fügt ein kurzes, nachvollziehbares Rollen- und Abstimmungsprotokoll hinzu. Ohne beobachtbare Beiträge anderer Personen ist dies nur eine Gruppenplanung, **kein** Nachweis kooperativen Arbeitens.

**Muster:** Für `a=2` gilt `f_2(x)=x(x+2)`, Nullstellen `0` und `-2`. Für `a=-2` gilt `f_{-2}(x)=x(x-2)`, Nullstellen `0` und `2`. Allgemein gilt `f_a(x)=x(x+a)` mit Nullstellen `0` und `-a`; bei `a=0` fallen sie als doppelte Nullstelle zusammen. Das Protokoll muss sichtbar machen, wer welche Teilaufgabe bearbeitete, wo Ergebnisse abgeglichen wurden und wie daraus die gemeinsame Aussage entstand.

**Raster:** beobachtbare sinnvolle Aufteilung (2), nachvollziehbare **verschiedene Personenbeiträge** (2), mathematisch korrekte, abgestimmte Synthese einschließlich `a=0` (2), gemeinsames überprüftes Ergebnis statt bloßer Nebeneinanderstellung (2). Summe 8. Ein Chat mit nur einem Lernenden, der Rollen simuliert, darf hier nicht als bestanden gelten; vor `released` ist ein realer Gruppen- bzw. Einreichungsweg zu definieren und gezielt zu testen.

## L — LK-Ausarbeitung formal und sprachlich präzisieren

**Aufgabe (8 BE):** Überarbeite diesen Entwurf zur Schar `f_a(x)=x²+ax` für beliebiges reelles `a`: „Aus `f'_a(x)=0` folgt, dass `f_a` bei `x=-a/2` ein Maximum hat. Der Extrempunkt ist irgendwie `(-a/2|-a²/4)`.“ Kennzeichne die sachliche Fehlbehauptung und zwei sprachlich/formal unpräzise Stellen. Formuliere anschließend einen kurzen, vollständigen Ersatzabsatz mit begründeter Art und Lage des Extremums.

**Muster:** `f'_a(x)=2x+a`, also liegt die stationäre Stelle bei `x=-a/2`. Da `f''_a(x)=2>0`, handelt es sich für **jedes** reelle `a` um ein Minimum, nicht ein Maximum. Sein Funktionswert ist `f_a(-a/2)=a²/4-a²/2=-a²/4`, also liegt der Tiefpunkt bei `(-a/2|-a²/4)`. „Irgendwie“ wird gestrichen; der Geltungsbereich `a∈ℝ` und die Begründung durch die zweite Ableitung werden ausdrücklich genannt.

**Raster:** Maximalbehauptung fachlich korrigiert (2), Ableitungen und Schluss auf Minimum sauber begründet (2), Koordinaten für beliebiges `a` richtig und eindeutig notiert (2), zwei Sprach-/Formalmängel erkennbar beseitigt (2). Summe 8. Der LK-only-Scope ist nicht aus dem Label „erhöhtes Niveau“ allein ableitbar; er braucht Ziel- und Kursprojektion.

## Quellen-, Identitäts- und Integrations-HOLDs

1. **Zielquellen vor Prüfungsfreigabe:** In der offiziellen HE-K6-Tabelle ist K6.1/AB I korrekt für N. `83…` trägt heute K6.2/AB2, obwohl K6.2 ein AB-I-Lese-/Auswahlstandard ist; `fc2…` nennt K6.2/K6.3, die eine tatsächlich beobachtete Teamkoordination nicht als solche belegen; `8b…` und `b35…` tragen K6.3/AB3, obwohl K6.3 zu AB II gehört. K6.4, K6.6 oder K6.8 dürfen nicht automatisch als Ersatz eingetragen werden: ihre jeweiligen Wortlaute und die Zielansprüche unterscheiden sich. Die R/S/G/L-Instrumente sind beobachtbare **Aufgabenentwürfe**, noch keine curricularen Quellenbelege. Sollte eine Zielidentität oder Geltung geändert werden, sind D/P/A/M/V betroffener Ziele neu zu prüfen.
2. **HE-Prozessquelle/Mapping:** Der getrennte K6-Kandidat extrahiert acht Standards. Das aktuelle Freigabeprofil verlangt aber für **jeden** registrierten Source-Goal ein bestehendes kanonisches Ziel und eine `exact`/`partial`-Kante. Acht Standards lediglich wegen N zu importieren oder die alten Snapshot-Formulierungen zu „amtlichen“ Texten zu erklären wäre unzulässig. Entweder alle acht K6-Mappings fachlich entscheiden oder den Mapping-Vertrag kontrolliert für nachweislich ungemappte Prozessstandards öffnen. Bis dahin bleibt die K6-Collection unregistriert, MAPPING-3 offen.
3. **Kurs/Land:** HE Q4.1 gilt auf grundlegendem Niveau für GK/LK. HE belegt nicht die jetzigen 15 Länder. Im derzeitigen generierten Quellrationale-Index ist die **primäre** Route für `aeae…` nur eine `partial`-BB-**Sek-I**-K6-Kante; die dortigen Alternativrouten sind ebenfalls `partial` und betreffen BB/BE Sek I und Sek II, nicht 15 Oberstufen-Länder. Das ist kein Ersatz für eine geprüfte HE-K6.1-Kante oder eine nationale Geltungsprüfung. Nach Quellenentscheidung jeden neuen Prüfungsendpunkt gegen Zieljurisdiktion, Kursprofil, konkrete Composition-View und Parent prüfen; für L ausschließlich LK. Keine `applicabilityFromRequires`-Ableitung als Ersatz für Quellendeckung ausgeben.
4. **Alte Prüfung:** Die heutige `b9…` darf mit `released` und fünf `coveredGoalIds` nicht einfach weiter als bestanden gelten. Ein späterer Integrationsschritt muss sie entweder fachlich neu schreiben und eng belegen oder als historische, nicht mehr sichtbare Prüfung mit ihrem alten Text erhalten und durch geprüfte Endpunkte ersetzen. `requires`/Coverage, Kursprojektion, Clustergewichte, stabile IDs und etwaige Lernfortschrittsfolgen sind zusammen zu prüfen; eine stille Löschung oder reine Punktkorrektur ist keine Lösung.
5. **QS-Reihenfolge:** Aufgabenrechnungen und Raster unabhängig nachrechnen; technische Schema-/Projektionschecks; danach neue Quellen- und Zielseitenbindung, zwei unabhängige Beschreibungsreviews, P-v2, A/M, Bildprüfung des **tatsächlichen** aeae-Bildes und nur betroffene V-/Seitenfingerprints. Erst nach central strict D/P/A/M/V-Cut und geschützten Floors von M7 sprechen. Menschliche Erprobung bleibt davon getrennt.
