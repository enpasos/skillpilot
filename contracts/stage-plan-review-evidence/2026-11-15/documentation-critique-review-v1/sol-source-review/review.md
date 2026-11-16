# Unabhängiger bilingualer Source-Review

15. November 2026, GPT-6.1 Sol Ultra, Subagent `land_stage_excerpts`. Geprüft wurde der vom Nutzer autorisierte bewegliche Dokumentstand gegen die beigefügte Architekturkritik. Führend bleibt das verbindliche Zielmodell; ein noch fehlender Runtimepfad ist kein Grund, die Norm darauf zurückzustutzen.

43 bereits geänderte Autorenquellen im zugewiesenen Scope wurden gesichert: 21 DE/EN-Kapitelpaare aus GraphDefinition, Architektur, Glossar, Didaktik und Runtime sowie `skill-graph/source/glossary-and-symbols.json`. Gezielte Präzisierungen betreffen 29 dieser Dateien. Die ursprünglichen Nutzerbytes liegen unverändert unter `before/`; `source-review.patch` enthält ausschließlich dieses Reviews Delta. Root besitzt unverändert `implementation-status.json`, `rules-and-gates.json`, Gesamtstatus und Builds. Keine Gitmutationen, generierten Ausgaben oder aktiven Runtime-/Curriculumänderungen durch diesen Review.

## Konkrete korrigierte Befunde

| Befund im neuen Text | Präzisierung und Bedeutung |
| --- | --- |
| F13 zählt mit `Atoms(X) ∩ L ⊆ Meff` Prüfungsatome mit, behauptet aber Erledigung bei übersprungener Prüfung. Glossar behauptet zusätzlich einen anderen Nachweisstatus. | Formel bleibt vollständig. **Erledigt** meint den benötigten Anteil einschließlich dortiger Prüfungs-/Memorieratome; **vollständig abgeschlossen** prüft ganz T(U). Eine offene eigene Prüfung bleibt offen. Bewusste andere Zielwahl und unveränderte Frontier erlauben Weiterlernen ohne diese Prüfung als erledigt auszugeben. Begonnen zählt Fortschritt innerhalb L. Kein neuer Skipstatus oder zweites Ergebnis. |
| `coverageReviews nicht leer` erscheint als hinreichende Identifikation/Freigabe. „Ohne Reviews“ wird teilweise pauschal „prüfungsfrei“. | Eigene Prüfungserklärung und gültige vollständige aktuelle Deckung sind erforderlich. Fehlende/ungültige Deckung einer erklärten Prüfungseinheit bleibt ein Vertragsverstoß und darf nicht durch Umklassifikation verschwinden. Ein nichtleeres Array ersetzt R1–R5 nicht. |
| E2 wird in der Architektur auf Pfadkonvexität verkürzt. | Vollständige zusammenhängende Blockordnung einschließlich `after` und Kindblockgraph an jeder Ebene. Gegenbeispiel U={a,c}, V={b,d}, a→b, d→c: atomar DAG, beide Mengen pfadkonvex, trotzdem kein zusammenhängender Gesamtblockplan. Entwurfsfrage entsprechend präzisiert. |
| Prüfungen werden als „Senken von Voraussetzungspfaden“ bezeichnet. | Endpunkte **in Lernrichtung**; bei R vom abhängigen Ziel zur Voraussetzung haben Prüfungen keine eingehende Kante: R∩(G×Q)=∅. Prüfungen dürfen ihre Inhalte weiter voraussetzen. |
| Architektur lässt die Zielschicht pauschal Mastery tragen und legt Einheiteneinträge direkt auf Zielcluster. | Nur Atome tragen Mastery. Die Einheitenerklärung liegt gemäß führender GraphDefinition in der Platzierungsschicht und verweist auf den kanonischen Cluster. Ziele/C/R werden nicht zu einer zweiten Einheitendatenquelle. |
| Karten-Elternkanten und graphische `requires`-/`after`-Pfeile werden unter „genau ein Feld“ vermischt. | Strukturelle Ableitungspfade werden nachvollziehbar dokumentiert; gebündelte Kartenpfeile besitzen getrennte belegte atomare/`after`-Ursachen. Keine versteckten Rückpfeile. |
| Wissenskontext behauptet, jeder einheitsübergreifende Bedarf müsse in `after` vorgelagert sein. | E3-Zwei-Kindeinheiten-Fall präzisiert. Bei eigenem Atom ordnet der atomare Bedarf selbst. `after` erweitert W(g) in keinem Fall. |
| Landesplantext setzt überall J5–J9/J10 voraus; „vollständig aufgelöste“ Beispiele lassen Dauer aus. | Explizit belegter Beginn/Ende des konkreten Land-/Dauermodells, kein pauschaler J5-Start. Beispiele tragen explizit G9. Keine neue amtliche Quellenbehauptung. |
| Einzelne Istabschnitte behaupten globale Anerkennung bzw. gespeicherte F13-Strategie bereits als implementiert. | Vorhandene 1.2-/v1.3-/Runtimegrenzen bleiben gezielt an den Statusstellen erkennbar. Normative globale Anerkennung und dauerhafter Memorierabschluss bleiben verbindlicher Zielzustand. Keine Warnung an jedem Normsatz. |
| Offizielle Quellenbegründung wird sprachlich mit jeder Modellierungsbegründung gleichgesetzt. | Amtliche Quellenzuordnung und eigene fachliche Modellierungs-/Platzierungsentscheidung getrennt. Keine amtliche Aufwertung eines canonicalDefault oder eigener Vorbereitung. |
| DE fordert R4 genau einen Besitzer, EN sagt an der betreffenden Stelle nur höchstens einen. | Genau ein direkter Besitzer je geplantem Ziel im aufgelösten Kurs, ohne die unvollständige heutige Implementierung als abgeschlossen darzustellen. |

## Einordnung der externen Kritik

Die Kritik benennt sinnvolle Prüffelder: globale revisionsgebundene Anerkennung, Erhalt kanonischer Atome, Clustererfüllung ohne unbelegte GK-Reduktion, vollständige echte Routen, Quellen-/Dauerbindung und unabhängige Prüfung von Aufgaben und Rubriken. Diese Pflichten bleiben im Konzept erhalten. Offene technische Durchsetzung ist sichtbar zu machen, nicht durch schwächere Norm zu erledigen.

Ihre Bestandszahlen, konkrete Traversalbehauptung, Runtimefolgen und Null-Landesplan-Aussage sind dagegen datierte Befunde, die Root gegen aktuelle Implementierung und Integrationsstand prüft. Der Text darf sie nicht ungeprüft als neuen Iststand übernehmen. Insbesondere ist die pauschale Folgerung aus fehlenden automatischen Gates auf keinerlei fachliche Prüfung zu weit: D/P/A/M/V umfasst auch begrenzte Inhaltsreviews; weder diese noch mehrere KI-Stimmen sind Humanfreigabe, Feldversuch oder Wirksamkeitsnachweis. Umgekehrt erbringt ein mathematischer Modelltest keine produktive Integration. Unbelegte Monate- oder Wirkungsbehauptungen der Kritik wurden nicht normativ übernommen.

## Tatsächliche Prüfungen und Grenze

`python3 tmp/documentation-parallel-review-20261115/sol-source-review/verify_review.py`: **21/21 DE/EN-AST- und Repository-Zitationsmengen gleich**, Glossar-JSON parsebar, drei unabhängige kleine Modellprüfungen bestanden (E2-Gegenbeispiel; F13-Anteil/Ganzes/offene Prüfung; R-Pfeilrichtung). Das sind redaktionelle/formale Checks, keine Lernenden-Assessments. `git diff --check` für den zugewiesenen Source-Scope erfolgreich. Exakte Eingangs-/Ergebnispins: `edit-receipt.actual.json` und `verification.actual.json`.

Keine Builds oder generierten Ausgaben ausgeführt; deren Prüfung/Regeneration liegt bei Root. Keine behauptete main-/PR-/CI- oder pädagogische Gesamtfreigabe. Die zuvor gesicherten HE-/F6-/Biophysikbelege bleiben unberührt. **Signiert: GPT-6.1 Sol Ultra, unabhängiger bilingualer Normreview.**
