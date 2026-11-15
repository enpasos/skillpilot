# Unabhängige aktuelle Fach- und Platzierungsprüfung K4/K8

Geprüft am **16.11.2026, 00:04–00:09 CET** am eingefrorenen Implementierungsstand **069fd6cf4fa5c9c8c8108bd367f986e94c29da12**. Prüfer: eigener Codex-Unteragent, nicht Autor der Änderungen; genau eine unabhängige Gegenprüfung. Nur eigene TMP-Dateien geschrieben. Keine Quelle, Komposition, QA-Bindung, Lernerdaten oder Git-Zustände verändert; keine volle QA erneut gestartet.

**Urteil: Die beiden ursprünglichen Stufenbefunde K4 und K8 sind in ihrem ausdrücklich beschriebenen Umfang fachlich behoben. Ihre Kennzeichnung als abgeschlossen ist nach Integration dieses unveränderten Inhalts und erfolgreicher frischer Main-CI vertretbar. Daraus folgt weder ein Abschluss von F2/F6 noch eine rückgriffsfreie verschachtelte Lernkarte.**

Die alte Gesamtentscheidung `tmp/math-stage-k4-k5-independent-review-20261115/review.md` bleibt historische REVISE-Evidenz. Sie wird hier weder geändert noch pauschal zur aktuellen Gesamtfreigabe erklärt.

## Prüfgrundlage

Selbst gelesen: vollständige aktuelle DE/EN-Titel und Beschreibungen der acht K4-Exponential-/Logarithmusziele und der acht hier benannten K4/K8-Atome; ihre direkten Voraussetzungen und die rekursiven fachlichen Vorläufer; alle einschlägigen tatsächlichen Kompositionspositionen. Die Stage-Entscheidung der echten Graphprüfungsaufgabe `632a3837-7381-5701-9cfa-4ae15ccae8ba` wurde gegen ihren vollständigen Aufgaben-/Lösungstext geprüft. Dies ist keine erneute vollständige Aufgaben- oder Medienabnahme sämtlicher Mathematikziele.

Eigener Lauf: `app/node_modules/.bin/tsx tmp/k4-k8-final-placement-independent-20261115/audit.mts`, Exit 0. Echter aktueller Kompositionscompiler, vollständiger atomarer Voraussetzungsschluss über **21 kanonische Wurzeln**, **32 einschlägige Sichten**: HE 10, SH 10, HB 4, NI 4, NW 4; **0 Kompositionsfehler**. Enthalten sind GK/LK, die vorhandenen G8/G9-Dauervarianten sowie Sek-I-/Sek-II-Einzelsichten. Autorrollen, wirklich kompilierte Targets und vollständige Lernbasis wurden getrennt geprüft. Die Rohdaten stehen in `current-input-and-placement.actual.json`; dessen `pins` binden alle 21 kanonischen Eingänge und alle 32 tatsächlich gelesenen Sichten mit Roh-SHA-256.

Mathematik-Rohhash: `306eeed52f6b0b1059264ccb1d4ea23227dd3ddff4d19f2a1ca096511d65a149`.

Repository-Anker am geprüften Commit: ursprüngliche Kriterien `docs/dev/stage-plan-units-handover-2026-11-15.md:474` und `:548`; acht aktuelle K4-Objekte `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json:14143`, `:14226`, `:15912`, `:15996`, `:16066`, `:16223`, `:17182`, `:17253`; HE-G9-Vorläufer `curricula/DE/Gymnasium/composition-views/mathematik/de-he-gk-g9.view.json:1107` und Transformationseintrag `:1341`; NW E `de-nw-gk.view.json:886`, NI E `de-ni-gk.view.json:1275` im selben Verzeichnis; vier SH-Sek-I-Einträge `de-sh-gk-g9.view.json:1500`, `:1505`, `:1510`, `:1515`, SH `5518`/`632a` dort `:2197`/`:2213`; HB entsprechend `de-hb-gk.view.json:1214`/`:1230`. Die eigenen 32-View-Rohdaten zeigen die übrigen Profile/Varianten einzeln.

## K4: ursprünglicher Befund behoben

**Acht falsche Potenzgraph-/Geradenschnittpflichten entfernt, echte Vorbereitung erhalten.** Die acht Ziele sind `31207307-0cf9-4a56-bf14-90196dc2b3d4`, `c74d0c7e-44e2-46ab-8f95-b8dc45fcfae7`, `42e19186-6769-41ac-a7bf-ab39bdb50661`, `3c1d6ce7-099e-4267-9ff2-3d1526209a89`, `3010d965-b9b9-4dc5-9d04-d706725e9a30`, `78238608-aaaa-4d12-a9de-54f325e9cf6f`, `c088fd81-fe4f-4282-99af-ebc0d1a7d202` und `aed3ca99-815b-40b8-ae91-e11bf92f51da`. Keines verlangt aktuell, auch transitiv, `eb28b403-f9fc-57ea-a793-b4555596fdd7` oder den Geradenschnitt `2f598bc7-c117-47d7-bb81-0f08ad679b91`. Funktionswerte und rationale Potenzen bleiben vorbereitet; die zwei Logarithmusanwendungen verlangen ausdrücklich Logarithmusdefinition und Exponentialdarstellungen.

Eigene Gegenbeispiele: Aus f(0)=18, f(2)=8 erhält man den Abnahmefaktor 2/3 durch Quotient und Quadratwurzel, ohne eine Potenzfunktion zu transformieren oder zwei Geraden zu schneiden. Bei −3·(1/2)^x steigt der negative Graph gegen null; das ist durch Potenzauswertung und Parameterdeutung zugänglich. log₂(1/8)=−3 benötigt die Umkehroperation, keinen Wurzelfunktionsgraphen. Diese Proben stützen genau den entfernten Mehrbedarf; sie behaupten keine vollständige didaktische Neubewertung des gesamten Graphen.

**NW/NI:** `30c013ac-5164-4c3c-8bc1-9a10b2f49533` bleibt ein Sek-II-Ziel, in den CrossStage-Sichten ausdrücklich E. In den Sek-II-Einzelsichten steht es innerhalb Sek II ohne feinere E-Untergliederung. Die frühere Exponentialnachfrage zieht die Potenz-/Wurzelgraphfamilie nicht mehr in Sek I. Die erhaltene Kante `eb28b403 → 30c013ac` ist fachlich richtig und wurde nicht zur optischen Bereinigung gelöscht. [NW Sek I, S.32–34](https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_m_klp_3401_2019_06_23_0.pdf), [NW Sek II, §2.3/S.22](https://lehrplannavigator.nrw.de/system/files/media/document/file/gost_klp_m_2023_06_07.pdf), [NI Sek I, S.56](https://cuvo.nibis.de/index.php?p=download&upload=63), [NI Sek II, S.21/39](https://cuvo.nibis.de/index.php?p=download&upload=208).

**HE G9:** In beiden CrossStage-Profilen und der Sek-I-Einzelsicht steht `30c013ac` tatsächlich als Target in J10. `eb28b403` steht ausschließlich als `prerequisiteOnly` unter J10 und hat in diesen Sichten aktuell keine notwendige Nachfrage, also keine aktive Aufnahme in die volle Lernbasis. Es wäre falsch, dies als dort bereits aktiviertes Lernziel zu zählen. Ein früheres J9-Target mit notwendigem J10-Vorgänger besteht nicht mehr. Die Originalquelle §10.1/S.37 belegt J10 für Potenz-/Wurzelfamilien und Transformationen in y-Richtung; sie belegt nicht die volle horizontale Operationalisierung des breiteren SkillPilot-Atoms. Der aktuelle Stand erzeugt daraus keine solche neue amtliche Vollbehauptung. [HE G9, §10.1/S.37](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf).

## K8: ursprüngliche Stufenentscheidung behoben

| Aktuelles vollständiges Ziel | Fachliche Stufe und wirkliche Position |
| --- | --- |
| `9023226b-fc17-412b-807c-2bb45cd551d5` Quadratische Gleichungen lösen | SH Sek I; echtes Target in allen acht einschlägigen CrossStage-/Sek-I-Sichten. |
| `39fa30f2-e1ae-5c36-be56-793b77906abb` Gleichungen mit dem Satz vom Nullprodukt lösen | SH Sek I; ebenso. Fachliche Operationalisierung des Faktorisierens/Ausklammerns, keine behauptete wörtliche amtliche Nullprodukt-Zeile. |
| `efc3506a-5f35-4d77-9498-d70a091a470b` Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen | SH Sek I; ebenso. |
| `17c9e061-fe52-5553-be81-fec7a525fcbd` Algebraische Lösungswege auf Gültigkeit prüfen | SH Sek I; ebenso. Eigene konkrete Operationalisierung der Konsistenzprüfung. |
| `5518ceb3-f668-5b52-a9b1-57653b16ca98` Funktions- und Ableitungsgraphen in Beziehung setzen | SH/HB Sek II; dort echtes Target, in SH-Sek-I-Einzelsichten weder Target noch notwendige Vorbereitung. |
| `632a3837-7381-5701-9cfa-4ae15ccae8ba` Funktions- und Ableitungsgraphen wechselseitig deuten | SH/HB ausdrücklich E; die echte beidseitige Graphanforderung und die notwendige `5518`-Kante bleiben erhalten. |

Die SH-Primärquelle trägt die Trennung: S.22 Konsistenzprüfung; S.38 quadratische Verfahren/Faktorisieren; S.43 mehrstufige Pfadregeln; S.45 Verteilung auf Jahrgangsbänder; S.67 beide Ableitungsgraph-Richtungen, S.74 Differentialrechnung im Einführungsjahr. Die tatsächlichen Tabellen S.45 und S.74 wurden zusätzlich als gerenderte PDF-Seiten angesehen. Für G8 wird kein einzelnes amtliches Jahr erfunden. Die vier Atome stehen derzeit unter einem stufenweiten Abschnitt, nicht schon unter den endgültigen Jahres-/Band-Einheiten. [SH Fachanforderungen 2024](https://fachportal.lernnetz.de/sh/faecher/mathematik/fachanforderungen.html?cid=17776&file=files%2FFachanforderungen+und+Leitf%C3%A4den%2FSekundarstufe%2FFachanforderungen%2FFachanforderungen+Mathematik+Sekundarstufe+%282024%29%2C+barrierearm.pdf).

Eigene Gegenbeispiele: (x−2)(x+3)=0 liefert 2 **oder** −3; bei rechter Seite 6 ist dieser Schluss unzulässig. −2x>6 ergibt x<−3. Zwei Ziehungen aus 2 roten/1 blauen Kugel ohne Zurücklegen liefern P(genau eine blaue)=2/3 mit wechselnden Ästen. Keiner dieser vollständigen Aufträge benötigt Differentialrechnung. Dagegen fordert die echte `632a`-Aufgabe ausdrücklich zwei gezeichnete Ableitungsrichtungen; eine bloße Sek-I-Graphlesefertigkeit reicht dafür nicht. Ihre Verlegung nach E ist deshalb inhaltlich erforderlich.

HB wurde anhand retained GyO 2022, A1.1–A1.6/S.21–23, mitgeprüft. Die amtliche [Inkraftsetzung 111/2022](https://www.bildung.bremen.de/sixcms/media.php/13/9885-Mitteilung%20111-2022.pdf) begrenzt den alten 5–10-Plan auf 5–9. Alte J10-Analysis ist deshalb keine tragfähige aktuelle Sek-I-Begründung.

## Nicht mitabgeschlossen: verschachtelte Rückgriffe und reale Pläne

Der vorhandene, hier **nur gelesene** native 72-Kontext-Bericht `contracts/stage-plan-review-evidence/2026-11-15/real-view-measurements-v1/actual-api-ui-72-before-applicability-cache.actual.json.gz`, Epoche `final841`, enthält weiterhin innere rote Paare mit K8-Atomen: SH unter anderem `14d0e697-3fb0-5074-a08c-7e01ca9bbda8 → 39fa30f2-e1ae-5c36-be56-793b77906abb`, `2bd88d66-5daf-53bb-aa02-4c010963679d → 9023226b-fc17-412b-807c-2bb45cd551d5`, `e55edcb9-2184-4a24-890e-70cc91028990 → efc3506a-5f35-4d77-9498-d70a091a470b` sowie SH/HB `5518ceb3-f668-5b52-a9b1-57653b16ca98 → 7156558c-57f1-4372-9ba7-0640c3f7cb3a`. Dies sind nun feinere Platzierungs-/Ordnungsprobleme innerhalb der richtig bestimmten Stufe. Die vier Sek-I-Atome stehen stufenweit; `5518` hat noch keine explizite E-Unterstruktur. Diese Beobachtung darf weder verschwiegen noch als alter Sek-I→Sek-II-Befund ausgegeben werden.

F2/F6 und die Owner-Anforderung einer tatsächlich rückgriffsfreien verschachtelten Karte sind damit offen. Die Begriffe „K4/K8 ursprünglich fachlich behoben“ und „alle K4/K8-bezogenen roten Kanten verschwunden“ sind nicht austauschbar. Es wurden **0 reale Pläne aktiviert**, keine neuen Rückgriffsmessungen ausgeführt, keine Main-CI-Abnahme oder Lernwirkung behauptet.

Abgrenzung des vorhandenen 72-Kontext-Berichts: Mathematik und alle 32 hier gelesenen Sichten stimmen roh mit dessen Quellsiegel überein; die aktuelle Physik ist gegenüber diesem Siegel geändert (`b391f6a72d6fee14cc5836cd42ad9a46f30ff9dbc07b23a5dd7e0f47c7467173` statt `ee9829cba17fe1cb8414a7c003fa9ed538278ab49ca1fce911a0ed710541923e`). Deshalb wird der Bericht hier nicht zu einem neuen vollständigen aktuellen 72-Kontext-Lauf umetikettiert. Die eigene aktuelle 32-View-Prüfung benutzt dagegen den vollständigen jetzigen Katalog. Das eigene Receipt hält diese Grenze fest.

## Unveränderliche Eingangsbindung

`source-hashes.json` enthält die selbst neu berechneten Rohhashes der sieben tatsächlich gelesenen Original-PDFs; alle stimmen mit dem vorherigen retained Bestand überein. Die Dateien bleiben unverändert. Relevante Roh-SHA-256:

- NW Sek I: `e58c85336c2aa4112923ae3b0c9fb3bdf38adadc1947110d62d9266c7e14f477`.
- NW Sek II: `211bad803486637f541447546073d0c7678f527b366da1ba63c5b9edc5d28533`.
- NI Sek I: `1d4e97a9f0f64bfac1526ab108ddba8bfc7859f4f79db80d1ef6cf5ef96f92f3`.
- NI Sek II: `f550398fe6871e9ea8a52087fce19286b8d43997d82242e3fb87741233729481`.
- HE G9: `9325e34d90626faa5c42e800b74ef78c61a315da56e7fe20b368807448ad5749`.
- SH: `17d35f8bb5129819c7de5040c5edfbe355e58cfcd01f43f694029b3b841e0d28`.
- HB GyO: `758fe3dff58f8b99e51b0806b17ee2eea2a0a2882d20df5fff6fff1bbad17cee`.

Alle einzelnen aktuellen Zielobjekthashes und View-Rohhashes stehen im eigenen JSON. Beispielbindungen: HE-G9-GK `55be2355cc98c84c811a68145fd776fbbeda210b3778836133fa78546c70c18b`, SH-G9-GK `373be0987a7cf6c2aae7a6c40d6de7bc14f9a4a317c4758e416c7723063dd644`. Nach späteren Inhaltsänderungen ist diese Prüfung nur noch für die identischen gebundenen Eingänge verwendbar.
