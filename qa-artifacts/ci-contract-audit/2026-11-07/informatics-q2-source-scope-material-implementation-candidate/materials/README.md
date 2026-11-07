# Vollständige Informatik-Q2-Materialentwürfe – 7. November 2026

Status: vollständige Autorenentwürfe; unabhängiger Fachreview und Materialfreigabe offen. Keine aktiven Curricula, Views, QA-Regeln, Produktionsdienste oder Git-Zustände wurden von diesem Materialautor geändert.

`native-examData.json` enthält fünf selbstständige native Payloads mit allen Falldaten und Aufgaben im `taskContent`, vollständigen Lösungen und lokalen Referenzprogrammen im `solutionContent` sowie wesentlichen binären Kriterien. Alle fünf haben `reviewStatus: draft`.

| Prüfung | Ziele | wesentliche Kriterien |
|---|---:|---:|
| HE GK, Auswahl 2027/2028 (`f37f2d37…`) | 10 | 20 |
| SkillPilot Grundangebot (`6ebc2a67…`) | 20 | 40 |
| erhaltene vernetzte Prüfung (`0df1bedd…`) | 41 | 82 |
| Bibliotheksdatenbank (`269a561b…`) | 23 | 46 |
| Festivaldatenbank (`ca2ff162…`) | 23 | 46 |

Die Zahlen ergeben sich aus den konkreten wesentlichen Leistungen. Der Vollumfangspass verlangt jedes dieser Kriterien; zusätzliche HTML- oder andere Leistungen gleichen fehlendes SQL nicht aus. Das ist keine amtliche Notenskala oder empirische Schwellenkalibrierung. Harmloses Layout, gleichwertige Notation und Folgefehler sind ausdrücklich geregelt. Ergebnisausgabe erlaubt vollständig Filter **oder** Pagination. Hierarchie und Parallelität von Ziel `875cb53c…` sind im erhaltenen Material wirklich enthalten, ohne das Ziel für die neuen Pflichtscopes zu verlangen.

`casebank.json` enthält 91 eigenständige Kurs-/Bibliotheks-/Festivalfälle. `exam-assemblies.json` bindet jedes Ziel an Task, Falldaten, Lösung und wesentliche Kriterien. `full-meaning-and-material-completeness.json` dokumentiert den inhaltlichen Autorenabgleich mit allen 45 vollständigen Zielbeschreibungen und die Reparaturkandidaten MAT-01 bis MAT-09. Die Modellierungswelten unterscheiden sich jeweils vom mitgelieferten SQL-Schema.

`execution-evidence.json` dokumentiert 265 erfolgreiche eigene Referenzprüfungen. Drei vollständige Referenzprogramme wurden mit SQLite und tatsächlichen lokalen HTTP-Anfragen geprüft: SELECT/Join/Gruppierung, UPDATE mit Persistenz und unveränderten übrigen Zeilen, vollständige Algebraresultate, Filter-only und Pagination-only, HTML-Kodierung, positive und negative Validierung einschließlich 5000-stelliger Zahlen, neue ER-Leistungen sowie hierarchische und parallele Zustandsspuren. DCL wurde nur im expliziten Lehrrollenmodell geprüft, nicht auf einem Rollen-DBMS ausgeführt. Der lokale Webserver nutzt vorgegebene fiktive Sitzungskonventionen und ist keine Produktionsauthentifizierung.

Die Rechtskarte verweist auf am 07.11.2026 tatsächlich geöffnete amtliche aktuelle DSGVO-Texte. `official-law-retrieval.json` und `official-dsgvo-current-de.html.gz` binden den erfolgreichen Abruf. Der geprüfte Fall betrifft personenbezogene Verarbeitung; Versandzulässigkeit von E-Mail-Werbung/UWG §7 wird ausdrücklich nicht geprüft oder erlaubt. `official-owasp-retrieval.json` dokumentiert die gelesene offizielle OWASP-2025-Projektseite; ein zusätzlicher separater HTML-Abruf erhielt 403 und wird nicht als gespeichert ausgegeben.

`original22-preservation.json` bestätigt alle 27 eingefrorenen Originalpins gegen den unabhängigen ursprünglichen Review. Es gibt keine Resultatkopien, Aliase oder neue Recognition-/LearningUnit-Laufzeit. Die alte 41er-Identität und beide vor Wachstum eingefrorenen 23er-Expansionen bleiben exakt erhalten.

Reproduktion im privaten RAM-Verzeichnis:

```sh
python3 author.py
python3 run-reference-checks.py
python3 complete-review-dossier.py
```

`author.py` verlangt die genau gepinnte gemeinsame Inputdatei. Die nativen Produktprüfungen führt der Source-/View-Agent gegen seine private vollständige Fixture aus. Dieses Paket behauptet weder unabhängige Fachabnahme noch Menschen-/Host-/M6-/M7-Akzeptanz.

Eigene Aufgaben, Falldaten, Lösungen und Rubriken: CC-BY-4.0, SkillPilot. Referenzprogramme und Buildskripte: Apache-2.0. Amtliche Normen/OWASP-Quellen und deren Attribution bleiben eigenständig; die didaktischen Kurzfassungen sind keine pauschale Übernahme fremder Lizenzrechte.
