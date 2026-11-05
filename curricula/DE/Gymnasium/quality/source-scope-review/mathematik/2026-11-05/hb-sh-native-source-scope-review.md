# Unabhängiges gezieltes Review: HB3 und SH7

Stand: 2026-11-05T21:00:39.000440+00:00. Nur fachliches Review; keine Implementierung, kein M7-Abschluss.

Die zehn gemeldeten Lücken lassen sich nicht ehrlich durch drei neue Registryzeilen und sieben pauschale Sek-I-Inserts schließen. **Freigabefähig sind sechs bestehende SH-Targets, ein eigener kleiner SH-Sek-I-Träger für über-/unterbestimmte Systeme, die Korrektur eines falsch gestuften SH-Quellenfragments sowie eine stufengerechte Verschiebung des eng betroffenen Bremer Trigonometrie-Korridors.** Bestehende Ziele und ihre alten M7-Verträge werden dabei nicht stillschweigend erweitert.

Der V7-Hash wurde selbst nachgerechnet: `8b46ca50e2571af3e975e4e72b89020021d8760850c923eacddfa52ea2efcb35`. Die Datei enthält 182 echte Angebotskonfigurationen und 980 verschiedene Target-Atome. Der aktuelle QA-Befund nennt 807 ursprüngliche gewöhnliche Targets, 14/16 quellenvollständige Länder, 3 unbelegte HB-Targets sowie 7 unbelegte SH-Originalfragmente von 9978. Das ist ein Ausgangsbefund, kein pauschales inhaltliches Gütesiegel für alle übrigen Mappings.

## Schleswig-Holstein: sechs bestehende Ziele wieder sichtbar machen

Originalquelle: `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf`, S. 29, 32 und 38. Die fünf nachstehenden Quellfragmente brauchen insgesamt sechs bestehende gewöhnliche Ziele:

| Quellfragment (vollständiger Präfix: `de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-`) | Bestehende kanonische Träger |
| --- | --- |
| `l1-zahl-und-operation-K016-bf37137691` (S. 29) | `314854a0-4e97-462e-9486-9fd83652e91d` — Taschenrechner situationsgerecht nutzen |
| `l2-grossen-und-messen-K015-8f65a62558` (S. 32) | `ad26e4d9-b025-57ec-8f25-df4a2415cc62` — Größen mit geeigneten Messmitteln erfassen; `25a3cc39-976e-58a5-b882-73baee5c037c` — Maßangaben aus Quellenmaterial entnehmen |
| `l2-grossen-und-messen-T037-6ea8fdfa37` (S. 32) | `37bf2eb6-75a0-44c1-a988-ca0e203cb072` — Geschwindigkeit als abgeleitete Größe verwenden |
| `l2-grossen-und-messen-T038-700dde137c` (S. 32) | `2345ae25-5805-4c72-b830-32e63cc6262a` — Dichte als abgeleitete Größe verwenden |
| `l3-strukturen-und-funktionaler-zusammenhang-T084-0db85cafb4` (S. 38) | `e42c208d-9555-43cc-92f5-5bb4c0688726` — Lineare Gleichungssysteme mit zwei Variablen lösen und Lösungsvielfalt untersuchen |

**GO für diese sechs Targets.** Die Zieltexte passen. Beim Messfragment müssen beide Handlungen vertreten sein; ein einziges Teilziel genügt nicht. Für T084 zählen grafisches und algebraisches Lösen als zwei Verfahren, genau wie es der amtliche Text und der vorhandene e42-Vertrag vorsehen.

Betroffen sind genau die sechs tatsächlich ausgewählten physischen Sichten `de-sh-seki-g8`, `de-sh-seki-g9`, `de-sh-gk-g8`, `de-sh-gk-g9`, `de-sh-lk-g8`, `de-sh-lk-g9` unter `curricula/DE/Gymnasium/composition-views/mathematik/`. Das ergibt beide Sek-I-Angebote plus ihre sechs CrossStage-Konfigurationen. Die beiden Sek-II-only-Sichten erhalten deswegen keine zusätzlichen Targets. Explizite `goalEntry`-Referenzen in einer stufenweiten Struktur unter dem vorhandenen Sek-I-Knoten vermeiden eine erfundene amtliche Jahrgangszuteilung; S. 26 verzichtet ausdrücklich auf eine solche Zuordnung. Je Ziel genau einen sichtbaren Elternknoten und eine direkte Erwerbszuständigkeit sicherstellen.

## SH-T085: eigener Träger, alter 2×2-Vertrag bleibt bestehen

Quelle: `de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-l3-strukturen-und-funktionaler-zusammenhang-T085-220b07f62e`, S. 38. **T085 ist nicht bereits durch e42 gedeckt.** Dessen bestehende M7-Synthese verlangt ausdrücklich zwei Gleichungen und zwei Geraden mit einer, keiner oder unendlich vielen Lösungen. Das ist keine Aussage über mehr oder weniger Gleichungen als Variablen. Die scheinbar offene Formulierung „mit zwei Variablen“ hebt den präziseren bisherigen Vertrag nicht auf. Ein zweites unabhängiges Teilreview bestätigt diesen Befund.

Der existierende Träger `27cfa1b3-be6f-5f81-b9a2-ae3bad9c14b6` behandelt zwar über-/unterbestimmte Systeme, aber in der Analytischen Geometrie mit Vektor-/Ebenenvoraussetzungen und als Sek-II-Target. Ihn auf eine Sek-I-Pflicht zu mappen würde die Stufenlücke verdecken.

**GO für ein neues schmales gewöhnliches Ziel**, zusätzlich zu den ursprünglichen 807 IDs:

- Vorschlag-ID: `679a0aeb-9f1d-53dc-be90-a40d1aaad947` (UUIDv5-Vorschlag, noch nicht angelegt).
- Short key: `canonical_math_sek1_linear_systems_over_underdetermined_two_variables`.
- Titel: „Über- und unterbestimmte lineare Gleichungssysteme mit zwei Variablen untersuchen“.
- Beschreibung: „Die lernende Person kann lineare Gleichungssysteme mit zwei Variablen und einer oder drei Gleichungen als unter- beziehungsweise überbestimmt einordnen, ihre Lösungsmenge grafisch und rechnerisch bestimmen und an konsistenten sowie widersprüchlichen Beispielen begründen, dass die Gleichungsanzahl allein die Lösbarkeit nicht entscheidet.“
- Fachlich passende Vorbereitung: `e42c208d-9555-43cc-92f5-5bb4c0688726`; neue DAG-/Scopeprüfung erforderlich.
- Target nur in den genannten SH-Sek-I-/CrossStage-Sichten, keine automatische bundesweite Aufnahme. Eigener assessbarer Vertrag, frische explizite Q/Own-Prüflösung, lokale Erwerbszuständigkeit und aktuelle QA; alte e42-Mastery, ein alter Own-Pass oder e42-M7-Evidenz bestehen unverändert und erledigen das neue Ziel nicht automatisch. Keinen früheren Own-Vertrag stillschweigend verstärken.

Die ursprünglichen 807 IDs bleiben im globalen Angebot erhalten. Der Zusatz wird gesondert gezählt; ein größerer aktueller Nenner ist ehrlicher als die alte Kompetenz umzudefinieren.

## SH-P3: Quellenstufe und Mapping korrigieren

Das Fragment `de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-prozesskompetenzen-p3-muster-und-beziehungen-erkennen-a0790b057f` stammt laut eigenem `sourceRef` von S. 58. Der Originalkopf nennt dort **Sekundarstufe II**. Es liegt derzeit dennoch in der Sek-I-Extraction, mit Sek-I-Tags, Phase 5–10 und einer Passage, deren allgemeiner Kopf S. 22–25 angibt.

**GO:** Das konkrete Originalfragment in einer neuen aktuellen Revision in die Sek-II-Quellspur überführen und mit nachvollziehbarem `supersedes`-Bezug zur alten Fehlzuordnung erhalten; genau einmal zählen. Die vorhandene aggregierte Sek-II-K2-Quelle nicht als zweite Zählung desselben Fragments nutzen. Auf den schon tatsächlich angebotenen Träger `22fb19c1-9b26-5090-a8ae-6cea79ee581a` („Systematisch probieren und Muster erkennen“) mappen: Er beschreibt das Variieren von Beispielen/Parametern, Mustererkennung und Ableitung eines Lösungswegs oder einer Vermutung. Das passt zum Problemverständnis auf S. 58. Ein sorgfältig begründetes `partial` ist passend; keine Volläquivalenz zur gesamten Prozessdomäne behaupten.

Hierfür ist keine weitere View-Aufnahme nötig: Dieser Träger ist in allen SH-Sek-II-/CrossStage-Angeboten bereits Target. `8cb18560-3a2b-593e-b634-9d768566cba9` bleibt global erhalten. **Keine automatische Sek-I-Aufnahme** dieses engeren Muster-/Zahlenfolgenziels auf Grundlage der falsch gestuften S. 58. Eine andere echte Sek-I-Quelle wäre ein eigenständiger neuer Reviewfall, nicht Teil dieser Korrektur.

## Bremen: alte Ersatzbegründungen ablehnen und Stufe gezielt korrigieren

Alle drei problematischen IDs sind nur im HB-Targetscope `DE-HB/SekI/G8/` betroffen:

- `5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11`: Sinus/Kosinus als periodische Funktionen.
- `8d30d241-0247-48ac-83d3-4e0de61584d3`: Bogenmaß und Gradmaß.
- `c8818eae-0c4d-4fa1-9085-04a9c95a668b`: Einheitskreis im Bogenmaß und zugehörige Winkel.

Die gültige 2022-Einschränkung des Bremer Sek-I-Plans (`Gy_Mathe_2006_inhalt_Einschraenkungen.pdf`, S. 1–2) beschränkt das Angebot auf J5–9. Sie fordert trigonometrische Berechnungen geometrischer Größen, keine allgemeine Periodik, Bogenmaßrechnung oder trigonometrischen Ableitungen. Die aktuelle Sek-I-Sicht führt die drei Referenzen unter `math-root/j10/j10-trigonometric-functions`. Eine amtliche aktuelle Bremer Sek-I-J10-Pflicht lässt sich daraus nicht ableiten.

**NO-GO für die bestehenden Registrybegründungen:**

1. Der referenzierte Tangensconsumer `4cba85d3-2e25-5c4b-9c4c-37e5b201dce7` fehlt in jedem tatsächlichen HB-Kontext. Ihn zusätzlich aufzunehmen wäre keine Quellenprüfung.
2. Die alternative vollständige Native-Kette `7f11 → a6c8 → 302a → 53b4 → c881 → 8d30` existiert. Ihr Start verlangt jedoch Modellierung periodischer Realsituationen; die angebotenen HB-Sek-I-Sourceanker `...content-overview-5-9-031-4fc5ce0edf`, `...j9-content-restriction-overview-006-7ff209ceae`, `...j9-geometry-standards-004-07d46ae068` nennen geometrische Trigonometrie. Die inhaltliche Diskrepanz wird durch den vorhandenen Graphpfad nicht geheilt.
3. Die Ableitungsroute zu `f9fdb733-5838-4983-888a-05624eabbe17` ist keine tragfähige heutige Sek-I-Begründung. Der 29.09.-Review warnt bereits bei den alten J10-Analysisquellen vor genau dem Stufenproblem; die übrigen Sammelkanten sind dadurch nicht freigegeben.

**Bevorzugtes GO: stufengerechte Targetverschiebung.** Eine eigene Vorbereitung darf nicht erst erfunden werden, um `SameOfferedScope` grün zu bekommen. Für ein solches bestehendes Autorenmandat wurde hier kein Beleg gefunden. Deshalb erhalten die drei Ziele keine neue Sek-I-Pflichtbegründung.

Die direkt betroffenen schon untersuchten Consumer und Zwischenglieder gehören zur gleichen begrenzten Korrektur. Nur die drei Warnungsziele herauszunehmen und dieselben nachweislich falsch gestuften Consumer weiter als amtliche Sek-I-Begründung zu verwenden wäre inkonsistent. **Der vollständig abgegrenzte Änderungskorridor umfasst genau acht IDs:**

| ID | Kompetenz | Korrekte Originalstufe und positiver Beleg |
| --- | --- | --- |
| `5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11` | Sinus- und Kosinusfunktionen als periodische Funktionen beschreiben | Sek II; GyO 2022 BM3.9 unter Rückbezug auf BM3.1–3.7, S. 19–21 |
| `8d30d241-0247-48ac-83d3-4e0de61584d3` | Bogenmass am Einheitskreis veranschaulichen und sicher zwischen Grad- und Bogenmass wechseln | Sek II; GyO 2022 BM3.9 unter Rückbezug auf BM3.1–3.7, S. 19–21 |
| `c8818eae-0c4d-4fa1-9085-04a9c95a668b` | Sinus- und Kosinuswerte am Einheitskreis im Bogenmass deuten und Winkel bestimmen | Sek II; GyO 2022 BM3.9 unter Rückbezug auf BM3.1–3.7, S. 19–21 |
| `7f11ffe0-7c43-4507-9101-50374a60b0e8` | Periodische Realsituationen mit Sinus- und Kosinusfunktionen modellieren und Modelle variieren | Sek II; GyO 2022 BM3.9 unter Rückbezug auf BM3.1–3.7, S. 19–21 |
| `a6c8db0a-a8a2-46bf-af04-d73d69d6c8b1` | Trigonometrische Graphen aus Funktionstermen zeichnen | Sek II; GyO 2022 BM3.9 unter Rückbezug auf BM3.1–3.7, S. 19–21 |
| `302a857d-ad71-4bdf-81f3-851c95aeefe1` | Graphen von Sinus und Kosinus aus dem Einheitskreis ableiten und Periodizität sowie ihren Zusammenhang begründen | Sek II; GyO 2022 BM3.9 unter Rückbezug auf BM3.1–3.7, S. 19–21 |
| `53b47494-ec60-4128-840d-2a4c4bab6d32` | Sinus- und Kosinuswerte für Winkel größer als 2π und für negative Winkel auf den Grundbereich zurückführen | Sek II; GyO 2022 BM3.9 unter Rückbezug auf BM3.1–3.7, S. 19–21 |
| `f9fdb733-5838-4983-888a-05624eabbe17` | Ableitungen von Sinus- und Kosinusfunktionen in einfachen Fällen nutzen | Sek II; GyO 2022 A3.3, S. 26 |

Alle acht sind im V7 in `DE-HB/SekI/G8/` Target. `7f11…` und `f9fdb…` sind zusätzlich bereits in den drei CrossStage-Angeboten Target; die anderen sechs sind dort teils nur im Demand-Kontext. Die JSON-Datei enthält die genauen aktuellen Mitgliedschaften.

Positive amtliche SourceIDs sind:

- `de-hb-mathematik-sekii-bildungsplan-2022-hb-sekii-bm3-9-001-2be33a4c12`
- `de-hb-mathematik-sekii-bildungsplan-2022-hb-sekii-bm3-9-002-16e4cae5c8`
- Für `f9fdb…`: `de-hb-mathematik-sekii-bildungsplan-2022-hb-sekii-a3-3-004-85729b2bac`.

BM3.9 verlangt die Anwendung der allgemeinen Funktionenkompetenzen auf Sinus/Kosinus, Grad-/Bogenmaß, Amplitude/Periode und die Beziehung zwischen Sinus und Kosinus; der zugehörige didaktische Hinweis nennt die Modellierung periodischer Prozesse. Die sieben kanonischen Teilkompetenzen sind dafür passende Operationalisierungen, jeweils als Teilbezug. Der Einheitskreis ist dabei eine didaktische Darstellung, nicht die Behauptung einer amtlich exklusiv vorgeschriebenen Methode. A3.3 nennt ausdrücklich die Ableitungen von Sinus und Kosinus.

**Konkrete Viewkorrektur:** Die acht Targetreferenzen aus der HB-Sek-I-only-Sicht entfernen, auch über etwaige geerbte Targetpfade. Fachlich echte Kontext-/Supportrollen für unveränderte Targets bleiben erhalten. In `de-hb-sekii-gk.view.json` und `de-hb-sekii-lk.view.json` die sieben Trigonometrieziele in den passenden oberen Grundlagen-/Trigonometrieabschnitt und `f9fdb…` zu den Ableitungsanwendungen stellen; entsprechend die oberen Abschnitte von `de-hb-gk.view.json` und `de-hb-lk.view.json` aktualisieren. Damit bleiben sie in den drei Sek-II- und drei CrossStage-Konfigurationen enthalten. Keine zusätzlichen alten Sek-I-J10-Inhalte mitziehen; kein Tangensconsumer `4cba…` einfügen. Die ursprünglichen 807 stabilen IDs bleiben global erhalten.

**Gezielte Mappingkorrektur/HOLD:** Die drei direkten geometrischen Sek-I-Sourcepaare zu `7f11…` dürfen nicht mehr als aktuelle Periodikdeckung gelten. Für `f9fdb…` dürfen die alten J10-Overview-Fragmente 041/042/043 und die 2022er Approximation irrationaler Zahlen keine aktuelle Sek-I-Ableitungspflicht erzeugen. Das betrifft nur die entsprechenden Paare des genannten Acht-Ziele-Korridors. Alte Passagen und alte V7-/Reviewbelege als Geschichte erhalten; ihre aktuelle Stufen-/Gültigkeitsinterpretation gezielt korrigieren. **Wo das vorhandene Schema die betroffenen Paare unter breiten Clustermappings nicht sauber begrenzen kann, bleibt ein expliziter Quellen-/Stage-HOLD. Ein grüner Länder-Union-Zähler allein hebt diesen HOLD nicht auf.** Keine pauschale Generalreparatur aller HB-Mappings beginnen.

**Zulässige, hier nicht bevorzugte Alternative:** Ein später separat begründeter Autorenentscheid könnte die drei ursprünglichen Ziele als „Vorbereitung auf die Oberstufe (SkillPilot-Ergänzung)“ im Sek-I-Lernplan belassen. Dazu braucht es einen getrennten aktuellen Vorbereitungsbeleg, tatsächliche spätere Consumer und eine sichtbare Abgrenzung von amtlicher Pflicht. Reale spätere Consumer sind `ea8e3dfb-7fd7-5d49-ae07-01864e6aa464` für Periodik, `cdf49335-cebf-54b4-9f52-50d5badabe2f` für Bogenmaß und `ecd13e54-ab0e-550f-9400-66e13306635d` für trigonometrische Gleichungen; alle sind in den drei HB-Sek-II-Profilen Target. Das ist ein denkbares didaktisches Design, **kein nachträglicher Freibrief für die bisherigen Registryzeilen** und kein Grund, neue `requires`-Kanten zur QA-Reparatur zu erfinden.

## SameOfferedScope: sinnvoll, aber nur für die behauptete lokale Demand-Brücke

Die neue Regel ist für die Aussage „dieses Target wird von diesem aktuellen Consumer gebraucht“ fachlich richtig. Die bloße Landesgleichheit oder ein alter ungewählter View darf keine Ersatzdeckung liefern; die Tangensroute wird zu Recht abgewiesen.

Sie ist **keine allgemeine Regel**, die jede Vorbereitung auf eine spätere, tatsächlich angebotene Stufe verbieten dürfte. Ein bewusstes Vorbereitungstarget und ein späterer Consumer können legitimerweise in verschiedenen Entry-Scopes liegen. Dafür braucht es den separaten reviewten Vorbereitungsbeleg, keine Lockerung der lokalen `requires-closure`-Regel.

Außerdem ist ein gleicher Scope nicht hinreichend: Die oben genannte 7f11-Kette zeigt, dass fachlich und stufengerecht passende Originaldeckung zusätzlich geprüft werden muss. Technisch sollte die rekursive Registryprüfung den gemeinsamen Scope über die gesamte Kette mitführen; der derzeitige Wrapper garantiert ihn pro Brücke. Eine Kette, deren erste Brücke nur Scope 1 und deren zweite nur Scope 2 hat, ist kein einheitlicher lokaler Demand-Nachweis.

## Bindende Negativtests und Abschlussgrenzen

1. Die alte Tangens-Registryroute 4cba85d3 darf ohne tatsächlichen HB-Kontext weiterhin keine Deckung liefern; keine automatische Targetaufnahme dieses Consumers.
2. Die formal vorhandene Route 7f11 -> a6c8 -> 302a -> 53b4 -> c881 -> 8d30 darf geometrische SekI-SourceIDs nicht in amtliche Periodik- oder Bogenmaßpflicht umdeuten.
3. Der alte J10-Ableitungsanker/HOLD darf nicht als heutiger HB-SekI-Pflichtbeleg für f9fdb oder 5d17 gelten.
4. HB-Vorbereitung darf bei unverändertem Landesnamen, aber falscher Stage, fehlendem aktuellem Consumer, fehlender Reviewentscheidung oder geänderter Quellen-/Zielrevision nicht akzeptiert werden.
5. Vorbereitung erzeugt keine sourceOriginal-Kompetenz und keine Mastery; sie darf den offiziellen Pflichtnenner nicht vergrößern. Ihre Targets bleiben aber regulär im angebotenen Lernplan und Progress sichtbar.
6. Eine Quelle zu Messungen und Quellenmaterial ist erst vollständig abgedeckt, wenn beide passenden ordinary Targets vorhanden sind; bloßes Existieren in einer ungewählten RawView oder nur support genügt nicht.
7. SH-T084 wird nicht allein durch eine algebraische Methode erfüllt; grafisches plus algebraisches Verfahren reicht.
8. SH-T085 darf weder e42-2x2-Mastery noch dem späteren SekII-Ziel 27cfa1b3 gleichgesetzt werden; neue Kompetenz braucht eigenes explizites Ergebnis/assessmentgerechten Vertrag.
9. Neuer T085-Träger: eine Gleichung/zwei Variablen sowie drei Gleichungen/zwei Variablen; überbestimmt konsistent und inkonsistent. Überbestimmt bedeutet nicht automatisch unlösbar.
10. SH-S.58 darf keine amtliche SekI-Pflicht begründen. Source-Stage und ausgewählte Target-Stage müssen zusammenpassen oder eine ausdrücklich reviewte Vorbereitung ausweisen.
11. SH-P3-Korrektur darf den Originalinhalt nicht aus dem Nenner löschen oder doppelt zählen; stabile Nachfolgeverknüpfung und einmalige Source-Zählung prüfen.
12. Alle ursprünglichen 807 gewöhnlichen IDs bleiben global vorhanden und angeboten. Ein neuer T085-Träger wird zusätzlich und separat gezählt, ohne denominator surgery.
13. V7 SHA bleibt 8b46ca50e2571af3e975e4e72b89020021d8760850c923eacddfa52ea2efcb35. Jede Datenkorrektur benötigt neuen nativen V8-Nachweis; alte Fingerprints und M7-Resolutions bleiben historisch unverändert.
14. Neue oder fachlich geänderte Inhalte erhalten eigene aktuelle M7-Belege; keine historische e42-Aufgaben-/Bild-/Beschreibungsevidenz als Freigabe des neuen T085-Ziels wiederverwenden.

Alle Vorschläge sind bewusst auf HB3/SH7 und den exakt benannten Acht-Ziele-Korridor ihrer direkt betroffenen Bremer Quellen-/Consumerbeziehungen begrenzt. Ein grüner technischer Quellenzähler nach Umsetzung würde die hier benannten inhaltlichen HOLDs nicht automatisch beseitigen. Neue V8-Native-Evidenz, echte Ziel-/Quellenrevisionen und gegebenenfalls frische M7-Evidenz müssen den finalen Bytes entsprechen. Kein historischer V7- oder M7-Nachweis darf überschrieben oder auf stärkere neue Aussagen umgedeutet werden.

Die maschinenlesbare Begleitdatei `astra-gap-review.json` enthält vollständige IDs, vorgeschlagene Scopeänderungen, Alternativen, Negativtests und SHA256-Pins der benutzten aktuellen Original-/Daten-/Nachweisdateien. In diesem Review wurden nur diese zwei privaten Ergebnisdateien geschrieben.
