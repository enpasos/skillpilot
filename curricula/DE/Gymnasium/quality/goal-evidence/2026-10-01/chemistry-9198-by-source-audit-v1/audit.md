# Chemie 9198: gezielter BY-Quellen- und Layer-A-Audit

Stand: 01.10.2026. Gegenstand ist nur das aktuelle kanonische Ziel `9198b4cf-e454-562f-83f0-b1b74e68765d` („Energieträger kriteriengeleitet bewerten“). Dies ist maschinelle Quellenprüfung, keine menschliche Freigabe und kein neuer strenger M7-Abschluss.

## Fachlicher Befund

Der aktuelle Zieltext verlangt eine begründete Bewertung von Energieträgern anhand chemischer, ökologischer und nutzungsbezogener Kriterien. Der [amtliche bayerische Fachlehrplan Chemie 8 (NTG), Lernbereich C8.3](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie) nennt beim hier extrahierten Punkt `C8.3.8` den Vergleich der Kohlenstoffdioxidbilanz und Reaktionswärme verschiedener Brennstoffe als Grundlage für die Bewertung der Verwendung verschiedener Energieträger; Umweltbelastung, Nachhaltigkeit und Energieeffizienz werden als Beispiele genannt. Damit ist die Urteilsleistung des abgespaltenen Ziels inhaltlich gedeckt. Die lokale, unveränderte Extraktion führt diesen Punkt als Source-ID `495cea26-06df-5a54-aa76-a80d47629e62`.

Das Ziel selbst hat unter `extendedData.provenance` eine **eigene** Bindung an genau diese BY-Source-ID und trägt `DE-BY` in seiner Applicability. Die registrierte Source-Landschaft `ff1ca997-b6cc-5ece-8e13-5498b4bbf808` ist `DE-BY` zugeordnet. Für `CQR-003` zählt die Applicability-Prüfung einen solchen `provenance`-Eintrag auf dem atomaren Ziel als direkten Bundeslandbeleg; sie verlangt hier keinen zusätzlichen direkten Mapping-Edge. Diese Aussage betrifft die Layer-A-Quellenabdeckung, nicht D/P/A/M/V- oder menschliche Freigaben.

## Atlas-Bindung und Entscheidung

Die **aktive** BY-Mappingentscheidung für `495cea26…` zeigt ausschließlich auf den Elterncluster `871eabde-6e19-59d3-bc7c-60977a9837db`. Der nationale Chemie-Atlas expandiert diesen Cluster auf seine drei Atome. Daher erscheint `9198b4cf…` in der BY-Sek-I-Source-View, aber der Source-Projection-Receipt bezeichnet den zugehörigen Witness ausdrücklich als `coverage: inherited`, mit `mappedTargetGoalId: 871eabde…`; `inheritedCoverageIsDirectSourceEvidence` steht auf `false`. Diese Atlas-Sichtbarkeit darf **nicht** als direkt reviewter Mapping-Edge für `9198b4cf…` ausgegeben werden. Die vom Ziel selbst getragene direkte Provenienz und der geerbte Atlas-Witness sind zwei verschiedene Belegarten.

**Entscheidung:** Für den gegenwärtigen Layer-A-Abschluss ist keine neue versionierte BY-Mappingentscheidung erforderlich: Die direkte Ziel-Provenienz zeigt auf einen vorhandenen, fachlich passenden amtlichen Quellenpunkt, und der bestehende Atlas-Witness ist korrekt als geerbt ausgewiesen. Eine spätere Anforderung, `9198b4cf…` auch im Originalquellen-Sidecar ausdrücklich als *direkt gemappt* auszuweisen, wäre eigene Reviewarbeit: fachlich begründete neue Mappingentscheidung mit passendem redundanten Edge, danach Atlas-/Sidecar-Neuerzeugung und Bindungsprüfung. Hier wird weder ein Hash noch das aktive Mapping geändert.

## Gezielte Prüfung

Ein isolierter `node`-/`assert/strict`-Check las den aktuellen kanonischen Text, die Ziel-Provenienz, die registrierte BY-Jurisdiktion, den extrahierten `C8.3.8`-Punkt, die allein auf den Elterncluster zeigende Mappingentscheidung, den `inherited`-Witness samt `false`-Claim und die BY-Sek-I-Source-View. Alle sieben Bindungen waren konsistent: **PASS für diesen begrenzten Quellen-Audit**. Die amtliche LehrplanPLUS-Seite wurde zusätzlich direkt gelesen. Es erfolgten keine Änderungen an kanonischen Zielen, Mapping, Atlas, D-Seiten oder zentraler M7-Registry; ein vollständiger Layer-A- oder M7-Lauf wurde aus diesem Audit nicht abgeleitet.
