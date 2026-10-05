# Biologie Q1: aktueller Text, fachliche Voraussetzungen, Atomarität und Memory

Zielgenaue maschinelle Autoren-/QS-Entscheidungen vom 4. Oktober 2026. Der Kandidatenstand übernimmt die final vorgeschlagenen DE-/EN-Beschreibungen der bestehenden Pakete für `73b66ead-e44a-5486-98e3-1fb3f99620a6` und `3891b735-9d0d-5eef-b653-6ad58b9181f6`. Die vorherigen Kandidaten, unabhängigen Befunde und A-/M-Reviews bleiben unverändert erhalten. Aktuelle D-/P-/V-Nachweise und strenge zentrale Abschlusszählung sind anschließend separat erforderlich.

## Gentest: ein gemeinsames Interpretationsurteil

DE: Die lernende Person kann an einem vorgegebenen anonymen Gentestfall den Anlass, die Aussagekraft des Befunds für die geprüfte Frage und dessen Grenzen für eine sachliche Beratung beurteilen.

EN: Using a supplied anonymous genetic-test case, the learner can assess the reason for testing, what the finding can establish about the question tested, and the limits of that finding for factual counselling.

Die einzelne Kompetenz ist ein fachlich zusammenhängendes Urteil über **denselben** Testfall. Eine Befundaussage ohne Prüffrage und Aussagegrenze genügt dafür nicht. Das Ziel fordert keine getrennte Methodensammlung oder klinische Entscheidung. Der vorgegebene Fall und seine Kriterien halten den bestehenden AB2-Rahmen angemessen; ein offenes ethisches Urteil ohne Material wäre eine weitergehende Kompetenz.

Die beiden bisherigen Voraussetzungen bleiben nach gezielter Prüfung erhalten: `440854be-7f06-5678-91cb-ba8dcab56959` führt im selben Humangenetikabschnitt von vererbtem Merkmal und begrenzter Familienbefund-Deutung zur Aussagegrenze eines Gentests; `2d451684-6e53-565e-a987-f362da919d2c` ist der bestehende Orientierungsanker. Diese didaktische Folge verlangt innerhalb des neuen Testfalls keine zusätzliche, im Material nicht gestellte Stammbaumprüfung.

**A-Entscheidung:** `atomic`, `semanticAtomic: true`. **M-Entscheidung:** `no_memory_needed`, `memoryUseful: false`. Testumfang, Variantenbefund und relevante Fallbedingungen werden bereitgestellt. Eine auswendig gelernte Ergebnisformel oder Variante würde das Interpretationsurteil nicht zeigen; eine neue Karte ist nicht erforderlich.

## Gentherapie: eine kausale Prinziperklärung

DE: Die lernende Person kann an einem vorgegebenen Beispiel erklären, wie Gentherapie eine funktionsfähige Genkopie in geeignete Körperzellen einbringt oder dort Erbinformation verändert, welche Zellfunktion beeinflusst werden soll und warum die Wirkung begrenzt sein kann.

EN: The learner can use a supplied example to explain how gene therapy introduces a functional gene copy into suitable body cells or changes genetic information there, which cell function it aims to affect, and why its effect may be limited.

Zielzelle, veränderte/ergänzte Erbinformation, beabsichtigte Zellfunktion und Wirkungsgrenze bilden die kausale Erklärung **eines** bereitgestellten somatischen Beispiels. Gen-Ergänzung und Änderung vorhandener Erbinformation sind zulässige alternative Fälle; eine Liste technischer Verfahren ist nicht verlangt. Die Erklärung bleibt erst vollständig, wenn auch Zellfunktion und begründete Wirkungsgrenze verbunden sind.

Die bisherige universelle Voraussetzung **Gentests beurteilen** wurde entfernt. Das Grundprinzip einer Therapie kann aus einem bereitgestellten molekularen Funktionsfall erklärt werden, ohne zuvor einen diagnostischen Befund zu beurteilen. Die neue fachliche Voraussetzung ist `475eebb4-4eb0-524f-b1ec-4a672bf856d2` **Proteinbiosynthese erklären**: die Beziehung zwischen genetischer Information und gebildetem Protein trägt hier unmittelbar die beabsichtigte Zellfunktion. Der Orientierungsanker `2d451684-6e53-565e-a987-f362da919d2c` bleibt. Der bestehende Proteinbiosynthese-Knoten hat keine Rückkante zur Therapie; die neue Kante erzeugt keinen Zyklus.

**A-Entscheidung:** `atomic`, `semanticAtomic: true`. **M-Entscheidung:** `no_memory_needed`, `memoryUseful: false`. Die kausale Modellerklärung und Wirkungsgrenze werden an gegebenen Fällen geprüft; Therapie-/Vektornamen oder ein festes Heilungsversprechen ersetzen diesen Nachweis nicht. Es entsteht kein neues Deck.

## Aktuelle Sidecars und Erhaltung gültiger Nachweise

Die autoritative semantische Klassifikation wurde für beide aktuellen Beschreibungen als gewöhnliches, prüfbares Inhaltsziel geprüft und bleibt `curricularAtomic`. Genau ihre beiden Source-Fingerprints wurden mit dem Produktionshelper `fingerprintSemanticKindSourceGoal` aktualisiert. Die aktuelle ID-Menge und die Zählung **363 curricularAtomic / 441 Gesamtziele** bleiben erhalten; alle anderen Klassifikationszeilen sind gleich.

Die neuen vollständigen A-/M-Sidecars liegen unter:

- `curricula/DE/Gymnasium/quality/semantic-atomicity/biologie-q1-tests-therapy-current-20261004-v1/canonical-biology-full.config.json`
- `curricula/DE/Gymnasium/quality/memory-card-review/biologie-q1-tests-therapy-current-20261004-v1/canonical-biology-full.config.json`

Sie übernehmen die bisherigen vollständigen Ledgers mit exakt zwei gezielt neu entschiedenen Datensätzen. Alle übrigen Zeilen sind bytegleich. Die neue Memory-Kartenreview ist vollständig bytegleich zur bisherigen Datei, SHA-256 `5fee1fd9fb1a2f85f202dbf8174611824a9715fe6c90cd3e3b84124f840c21f0`. Der aktuelle M-Check prüfte auch alle bestehenden Deck-/Karten-/Sichtbarkeitsbindungen.

**Gezielte Checks bestanden:** A 363/363 aktuell atomic, 0 fehlend/stale/offen; M 363/363 aktuelle Entscheidungen, 8 memory_required, 355 no_memory_needed, 17/17 primäre Karten geprüft, 0 fehlende/stale Ziele oder Karten, 0 fehlende sichtbare Memory-Knoten. Der Quellenatlascheck bestand separat für 363/363 Ziele und 20 Quellenansichten. Die vollständige zentrale Fünf-Gate-QS oder ein App-/Book-Build wurde in diesem Autorenpaket nicht ausgeführt.

Die neue Gentest-/Gentherapie-D-Kampagne muss die finalen aktuellen Texte und die geänderte Therapie-Voraussetzung binden. Die bereits positiv geprüften P-/PNG-Kandidaten werden anhand ihrer vorhandenen unabhängigen Kandidatenreviews übernommen und auf den tatsächlichen aktuellen Kontext geprüft; ihre alten Kandidatenurteile sind keine aktiven D-/P-/V-Freigaben. Nachweisgültige unbetroffene Ziele werden nicht fachlich neu geprüft. Die neue globale Quellenatlas-Receipt ist eine aktuelle Inputbindung; sie gewährt keine fachliche Freigabe durch bloßes Hash-Nachführen.

Der gezielte Bindungsdelta-Abgleich gegen `693872e8ea8663384281d06f61858b0f8fef332f` ergab für die 35 bereits registrierten strengen Biologie-D-Ziele keine veränderten Zielobjekte und keine veränderten individuellen kanonischen Kontexte. Beide neuen Ziele waren dort noch nicht registriert. Der Abgleich und die zyklusfreie neue Therapiekante sind in `binding-impact.json.snapshot` festgehalten; das ist keine vollständige D-/P-/V-Frischeprüfung und kein neuer zentraler Abschlussbericht.

**Strenger Autorenfortschritt:** 0 neue fachliche Fünf-Gate-Abschlüsse, 0 wiederhergestellte strenge Bindungen. Beide Ziele bleiben bis zur abschließenden unabhängigen D-/P-/V-Integration offen. Menschliche Prüfung, Freigabe und Erprobung bleiben eigenständig.
