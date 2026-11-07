# GK24 und LK25: konkreter Integrationsplan, noch nicht angewandt

Der [aktuelle lesende Vergleich](informatics-gk24-current-35-scope-input-2026-11-06.json) bindet Quelle `f95c0a…`, alle 21 kanonischen Dateien und die tatsächlichen 35 Profile in 19 Views. Die bestehende 25er-Identität `49ba66cf-accd-5938-a63e-f031bc786767`, ihre Coverage und vorhandene Ergebnisse bleiben unverändert. Die folgenden Änderungen sind ausschließlich Vorschläge; keine View, Quelle, QA-Konfiguration oder Runtime wurde geändert.

Der [maschinenlesbare Plan](informatics-gk24-integration-plan-2026-11-06.json) enthält jede Scopeentscheidung, drei konkrete Referenzstellen und eine ausdrücklich noch zu implementierende geschlossene QA-Grenze. Der neue [GK24-Inhaltsentwurf](informatics-gk24-terminal-draft-2026-11-06.md) ist kein Teilpass unter `49ba…`.

## Sechs Angebote und 29 unverändert abgegrenzte Scopes

Nur Bayern, Hessen und die nationale technische Projektion enthalten im GK alle 24 Ziele; dieselben drei LK-Profile enthalten alle 25. Daher braucht es drei eigenständige GK24-Angebote und drei ehrliche LK25-Angebote. In den übrigen 28 Länder-/Kursprofilen und dem einen profilfreien Sek-I-Scope wird weder das Lernzieluniversum erweitert noch ein voller E-Abschluss ergänzt. Nationale Projektion und bestehende technische GK/LK-Labels begründen keine neue amtliche Länder- oder Kursbehauptung.

| Bestehender Scope / View | Profil | GK-Ziele von 24 | Alle Ziele von 25 | Geplanter E-Vertrag |
| --- | --- | ---: | ---: | --- |
| `de-bb-gym-informatics-crossstage` | GK | 11 | 11 | kein neuer voller E-Vertrag |
| `de-bb-gym-informatics-crossstage` | LK | 11 | 12 | kein neuer voller E-Vertrag |
| `de-be-gym-informatics-crossstage` | GK | 11 | 11 | kein neuer voller E-Vertrag |
| `de-be-gym-informatics-crossstage` | LK | 11 | 12 | kein neuer voller E-Vertrag |
| `de-bw-gym-informatics-crossstage` | GK | 16 | 16 | kein neuer voller E-Vertrag |
| `de-bw-gym-informatics-crossstage` | LK | 16 | 17 | kein neuer voller E-Vertrag |
| `de-by-gym-informatics-crossstage` | GK | 24 | 24 | neuer GK24-Draft |
| `de-by-gym-informatics-crossstage` | LK | 24 | 25 | bestehende ID als LK25 |
| `de-de-gym-informatics-gk` | GK | 24 | 24 | neuer GK24-Draft |
| `de-de-gym-informatics-lk` | LK | 24 | 25 | bestehende ID als LK25 |
| `de-de-gym-seki-informatics` | kein Profil | 0 | 0 | kein neuer voller E-Vertrag |
| `de-hb-gym-informatics-crossstage` | GK | 17 | 17 | kein neuer voller E-Vertrag |
| `de-hb-gym-informatics-crossstage` | LK | 17 | 18 | kein neuer voller E-Vertrag |
| `de-he-gym-informatics-crossstage` | GK | 24 | 24 | neuer GK24-Draft |
| `de-he-gym-informatics-crossstage` | LK | 24 | 25 | bestehende ID als LK25 |
| `de-hh-gym-informatics-crossstage` | GK | 21 | 21 | kein neuer voller E-Vertrag |
| `de-hh-gym-informatics-crossstage` | LK | 21 | 21 | kein neuer voller E-Vertrag |
| `de-mv-gym-informatics-crossstage` | GK | 22 | 22 | kein neuer voller E-Vertrag |
| `de-mv-gym-informatics-crossstage` | LK | 22 | 23 | kein neuer voller E-Vertrag |
| `de-ni-gym-informatics-crossstage` | GK | 16 | 16 | kein neuer voller E-Vertrag |
| `de-ni-gym-informatics-crossstage` | LK | 16 | 16 | kein neuer voller E-Vertrag |
| `de-nw-gym-informatics-crossstage` | GK | 16 | 16 | kein neuer voller E-Vertrag |
| `de-nw-gym-informatics-crossstage` | LK | 16 | 17 | kein neuer voller E-Vertrag |
| `de-rp-gym-informatics-crossstage` | GK | 17 | 17 | kein neuer voller E-Vertrag |
| `de-rp-gym-informatics-crossstage` | LK | 17 | 18 | kein neuer voller E-Vertrag |
| `de-sh-gym-informatics-crossstage` | GK | 21 | 21 | kein neuer voller E-Vertrag |
| `de-sh-gym-informatics-crossstage` | LK | 21 | 22 | kein neuer voller E-Vertrag |
| `de-sl-gym-informatics-crossstage` | GK | 13 | 13 | kein neuer voller E-Vertrag |
| `de-sl-gym-informatics-crossstage` | LK | 13 | 14 | kein neuer voller E-Vertrag |
| `de-sn-gym-informatics-crossstage` | GK | 20 | 20 | kein neuer voller E-Vertrag |
| `de-sn-gym-informatics-crossstage` | LK | 20 | 21 | kein neuer voller E-Vertrag |
| `de-st-gym-informatics-crossstage` | GK | 15 | 15 | kein neuer voller E-Vertrag |
| `de-st-gym-informatics-crossstage` | LK | 15 | 16 | kein neuer voller E-Vertrag |
| `de-th-gym-informatics-crossstage` | GK | 17 | 17 | kein neuer voller E-Vertrag |
| `de-th-gym-informatics-crossstage` | LK | 17 | 18 | kein neuer voller E-Vertrag |

## Getrennte Identitäten und sichtbare Praxisstruktur

Der neue Endpunkt `604c84fc-7fa3-5aa0-a6c6-33136a71a4a7` und der neue Praxiscontainer `b9d05b6a-be59-5b89-aa9b-fb00cb6f1b84` sind zwei getrennte **unreservierte UUID-v5-Vorschläge**. Die Herleitung steht im Reviewinput; bisher wurde nur Abwesenheit in den 21 kanonischen ID-Mengen geprüft. Vor einer Annahme sind vollständige Repository-/Paket-/Review-Namensräume und eine ausdrückliche Identitätsentscheidung erforderlich. Es gibt kein Alias und keine automatische Ergebnisübertragung.

Der GK-Endpunkt soll direktes Kind des neuen GK-Praxiscontainers werden; dieser ist ein Geschwister des bisherigen E-Praxisclusters unter der kanonischen Informatikwurzel. Das ist die vorhandene Cluster-/Assessmentstruktur, kein Lerneinheitenmodell. Der atomare Endpunkt wird nicht unsichtbar direkt an die Wurzel gehängt. Die künftige Routekonfiguration muss den neuen Container ausdrücklich mitprüfen.

Die bestehende E-Praxis `91c5be09…` vererbt ihre drei breiten Voraussetzungen: Netzwerkcluster `c70a6558…`, Webcluster `0fac05b7…` und Imperativcluster `d0a3b319…`. Das Netzwerkcluster enthält das zusätzliche LK-Ziel `e3e5c851…`. Ein neuer GK-Endpunkt unter diesem alten Parent hätte daher weiterhin die versteckte Paketpflicht. Kursfilter oder Fokus würden diesen falschen globalen Vorpfad nicht reparieren. Der Entwurf verändert diesen alten Parent oder dessen Web-Prüfungsziel nicht.

Die drei vollständigen GK-Views brauchen eine explizite neue `canonicalSubtree`-Referenz als Geschwister der alten E-Praxis im vorhandenen Bereich „Übungen und Abschlussrouten“. Die genauen alten Referenzpfade und Appendstellen stehen im JSON. BY/HE benutzen gemeinsame GK/LK-Viewdateien: Die neue GK-Metadaten-/Filterwirkung muss daher auch für deren LK-Projektion ausdrücklich unverändert geprüft werden. Drei alte GK-Anzeigen des 25er-Endpunkts würden erst nach freigegebener Kursmetadatenänderung entfallen; seine drei LK-Anzeigen behalten den vollen 25er-Vertrag. Alte Ergebnisse werden weder gelöscht noch als neue GK24-Leistung ausgegeben. Die spätere Einführung in bestehende Lernkonfigurationen braucht eine eigene geprüfte Rolloutentscheidung.

## Coverage und minimaler Vorpfad sind getrennt

Alle 24 `coveredGoalIds` bleiben fest. **Ein anwendungsfähiges `requires`-Array ist noch nicht zugewiesen.** Weder 24 direkte Kanten noch ein durch ungeprüfte Zwischenlinks künstlich verkleinerter Satz werden erzeugt. Vor Anwendung muss der fachlich legitime minimale Vorpfad die tatsächlich notwendige Vorbereitung erhalten, G16/G17 bestehen und auch nach vollständiger Contains-Vererbung ohne das LK-Paketziel bleiben.

Die umstrittene Kante `6c4fd4a4…` (Authentisierung/Logs/Risiken) → `ace0c141…` (vollständige SMTP-/POP3-Protokollanalyse) ist dafür kein automatisch zulässiger Minimalitätszeuge. Eine vollständig vorgegebene Login-/Logszene braucht nicht universell den ganzen Protokollanalyseabschluss. Im Prüfungsentwurf bleiben beide Leistungen eigenständig geprüft; ihre gemeinsame Verwendung von SMTP-Material wird nicht in eine allgemeine Vorbereitungskante umgedeutet.

## Erforderliche neue geschlossene QA-Konfiguration

Die aktuelle native Route entdeckt nur direkte atomare, nicht-Memory-Kinder ihrer sechs konfigurierten Praxiscluster. Sie erfasst 14 Route-Endpunkte. Der neue Container muss ausdrücklich in diese Discoverykonfiguration; danach wären es 15. Eine neue Blatt-ID oder ein zusätzlicher verschachtelter Container ohne diese Konfiguration bliebe sonst ungesehen.

Zugleich braucht die Inhalts-QA eine ausdrücklich geschlossene Auflistung der insgesamt 25 künftigen `examData`-Identitäten: 24 vorhandene plus den neuen GK24-Endpunkt. Dieser Bereich ist vom Routebereich zu unterscheiden. Die zehn bestehenden zusätzlichen Abitur-`examData` werden nicht durch den neuen E-Vertrag freigegeben oder still ausgenommen. Ihre Inhaltsprüfung und Konfiguration bleiben Pflicht.

Der Konfigurationsentwurf bindet die zwei festen E-Abschlussverträge, Eigentümer, Elterncontainer, exakte Coverage, drei GK- und drei LK-Scopekombinationen. Fehlende, unbekannte oder doppelte Endpunkte, falsche Profile, eine flexible 24er-Coverage unter der alten 25er-ID, ein versteckter K23-Vorpfad sowie fehlende/draft QA-Belege müssen scheitern. **Ein solches Schema, ein Loader und die harte CI-/CQR-Verdrahtung sind hier noch nicht implementiert.** Der Plan ist keine vorhandene Gatekonfiguration.

Vor einer Anwendung bleiben außerdem echte Referenz-/Negativprüfungen, unabhängiger GK-Inhaltsreview, neue authentische QA-/Quellenbindungen, alle 35 Scopevergleiche und die globale/atomare Nachfrageprüfung mit tatsächlichen Kandidatenbytes erforderlich. Nicht geprüft ist kein Pass. Kein neuer ganzer CQR-Producer wurde ausgeführt.
