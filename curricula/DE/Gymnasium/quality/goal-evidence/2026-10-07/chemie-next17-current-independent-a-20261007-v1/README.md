# Chemie: unabhängiger D-A/P-A-Kandidatenreview für 17 Ziele

Reviewer: `/root/chem17_current_independent_a`, GPT-6/Codex. Die genaue
Serving-Variante und Samplingparameter sind nicht verfügbar. Dies ist eine
eigene fachliche Prüfung in einem getrennten Agentenkontext; fremde D/P-Urteile
wurden nicht gelesen. Das vorhandene Autorendossier ist Eingabe, kein
unabhängiges Urteil.

**17 native D-Kandidaten: 14 `keep`, 3 `revise`. 34 vollständige bilinguale
P-Fälle eigenständig geprüft. Kein aktiver Nachweis integriert, kein strenger
M7-Zuwachs und keine menschliche Freigabe.**

Die D-Ergebnisse verwenden das native Recordschema und den tatsächlichen
historischen Bundle-, Buch-, Goal- und Seitenbezug. Alle sechs D-Evidenzfelder
wurden eigenständig formuliert. Die native D-Batchprüfung besteht für diese
17 Records. Das Ergebnis ist keine aktuelle duale Resolution.

## Fachliche Beschreibungsbefunde

| Ziel | Eigenes Urteil | Begründung |
| --- | --- | --- |
| `fd309753` Teilchenebene | `revise` | Beide Ionenarten kommen in Wasser vor. Ihr relatives Überwiegen charakterisiert sauer/basisch; die bloße Existenz genügt nicht. |
| `22133f29` Redoxgleichungen | `revise` | Die englische Beschreibung lässt die im deutschen Text und amtlichen BY10-Quellabschnitt vorhandene wässrige Umgebung aus. Der deutsche Text bleibt im Vorschlag wortgleich. |
| `9751b6d8` Beeinflussung | `revise` | Die bereits in amtlicher Quellkomponente, Voraussetzung und Aufgaben beanspruchte Umkehrbarkeit wird als erklärender Zusammenhang ausdrücklich genannt. |

Die 14 weiteren Beschreibungen sind für ihre jeweils abgegrenzte Kompetenz
beibehaltbar. Die konkreten Aussagen, Voraussetzungen, bilinguale Äquivalenz,
Quellenkomponenten und fachlichen Gründe stehen pro Ziel in
`results/description-review-records.jsonl`. Ein Texturteil beseitigt keine
Bild- oder Kontextbefunde.

## Tatsächliche Seiten und aktuelle Bindung

Das kopierte Autor-PDF hat 19 physische Seiten, darunter 17 Lernzielseiten.
Ich habe **alle 17 tatsächlichen Lernzielseiten**, physisch 3–19, als Raster
gesehen. Die vollen IDs, Beschreibungen, Beziehungen und Seitenenden sind
sichtbar; kein Abschneiden wurde beobachtet. Die Einzelbeobachtungen und
Rasterhashes stehen in
`results/actual-seventeen-historical-page-observations.json`.

Das PDF wurde vor dem Zurückziehen fehlerhafter Bilder gebaut. Der Vergleich
ganzer Ziele mit meinem aktuellen Kanonsnapshot bestätigt im 17er-Umfang
genau drei Änderungen, jeweils ausschließlich an `resourceLinks`:

| Ziel | Tatsächlich gesehener Bildbefund | Aktueller Zustand |
| --- | --- | --- |
| `0bf26276` pH | Zitronensaft ist mit pH 2 beschriftet; der Pfeil trifft die Skala bei 3. | Bildlink zurückgezogen; historische Seite bleibt veraltet. |
| `a44af1fa` Ionenanalyse | Na+/K+-Lösungsröhrchen erscheinen in den Flammenfarben gelb/violett. Die Darstellung der Salzpaarung enthält keine notwendigen Grenzen für unbekannte Gemische. | Bildlink zurückgezogen; historische Seite bleibt veraltet. |
| `9751b6d8` Beeinflussung | OH−-Zugabe wird mit mehr A− **und BH+** verknüpft, obwohl OH− auch BH+ zu B deprotoniert. | Bildlink zurückgezogen; historische Seite bleibt veraltet. |

Die vierte aktuelle Bildrücknahme liegt außerhalb der 17 Ziele. Diese Prüfung
enthält kein neues Urteil zum ausgeschlossenen Ziel.

Zusätzlich stehen die drei kanonisch mit `SekII` getaggten Prozessziele
`c0f1bf09`, `02dc29ae` und `7a05a1ce` auf historischen Seiten unter einer
`(Sek I)`-Kapitelbezeichnung. Die abgegrenzten BY12-Quellkomponenten und der
kanonische Kontext bestimmen hier den geprüften fachlichen Umfang. Die
abweichende Kapitelbezeichnung bleibt als Kontextbefund offen.

**Keine Seite wurde neu gebaut oder aktuell wiederangebunden.** Die native
P-Prüfung gegen ausschließlich meinen eingefrorenen aktuellen Kanonsnapshot
meldet erwartungsgemäß drei veraltete `reviewInputFingerprint`-Werte genau für
die drei zurückgezogenen Bilder. Sie meldet 17 `needs_human_review`, 0
Genehmigungen und 3 Blocker. Ihr tatsächliches Ergebnis steht in
`qa-artifacts/frozen-current17-native-positive-check.actual.json`.

## Eigenständige P-Prüfung

Für alle 34 Fälle wurden Material, vollständige Aufgabenforderung,
Musterantwort und konkreter Grenzfall in Deutsch und Englisch gelesen. Die
eingebetteten nativen Fallbriefe enthalten exakt das vorliegende Material plus
Aufgabe und die entsprechende Musterantwort. Die eigenen P-Urteile stehen in
`results/positive-evidence-bounded-independent-review.json`, einschließlich
der jeweiligen chemischen Bilanz, echten Variation und eines eigenen
konkreten unzureichenden Antwortbeispiels pro Ziel.

Die Fälle sind als schriftliche Referenzfälle fachlich tragfähig. Praktische
Durchführung durch Lernende, echte Messungen oder tatsächlich beobachtetes
Verständnis sind damit nicht nachgewiesen. Bei der Gasprobe ist die beiläufige
Aussage zum feuchten Glimmspan durch keine gesondert angegebene
Feuchtekontrolle belegt; aus der gegebenen Luftkontrolle darf kein zusätzlich
durchgeführter Versuch gemacht werden. Diese kleine Einschränkung ist im
eigenen P-Urteil erhalten.

Alle Profile und Urteile bleiben `ai_candidate`, `needs_human_review`, E1/G1.
Die Autorprofile haben leere `reviewRunIds`; die separaten eigenen P-Urteile
geben sich nicht als integrierter nativer P-Run aus. Zwei voneinander
unterscheidbare Evidenzdemonstrationen können innerhalb einer passenden
Aufgabe entstehen; es wird keine zusätzliche Aufgabenquote für echte Lernende
gesetzt. Die negativen Beispiele sind eigene Prüfansätze, keine angeblichen
Lernendenantworten.

## Abgegrenzte Quellenprüfung

Die amtlichen Originalkomponenten wurden über die erhaltenen Originaltexte
und die tatsächlich geöffneten offiziellen BY8-, BY9-, BY10- und BY12-Seiten
geprüft. Für Dalton habe ich zusätzlich die tatsächliche historische
HE-G9-Seite physisch 17/gedruckt 16 gesehen. Sie nennt die Atomhypothese und die
Abgrenzung von Gesetz, Hypothese und Modell ausdrücklich.

Bei `597ac03c` unterstützt nur die strukturelle Eignungskomponente der
BY10-Klausel den ausgewählten atomaren Teil; die Ableitung von Reversibilität
bleibt beim Geschwisterziel. Bei `9751b6d8` unterstützt die eigene
BY10-NTG-Klausel die Beeinflussung durch Umkehrbarkeit. Die beiden aktuellen
direkten Kind-Mappingzahlen sind weiterhin **0**. Die unabhängigen
Komponentenurteile schaffen keine aktive Routingbindung.

`results/bounded-primary-source-independent-judgments.json` dokumentiert für
alle 17 Ziele die eigene abgegrenzte Quellenentscheidung und die genauen
verwendeten Komponenten. Ganze Originalcurricula, bundesweite
Lernenden-Supersets und sämtliche breiten Teilmappingzeilen werden damit nicht
genehmigt. Fünf vorhandene SourceGoal-Texte stimmen erst nach Normalisierung
von Leerzeichen, NBSP oder Zeilenumbrüchen mit dem Originaltext überein. Diese
werden ausdrücklich nicht als rohe bytegleiche Texttreffer bezeichnet.

Die amtlichen Anker sind insbesondere
[BY10 Chemie](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch),
[BY10 NTG](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg)
und [BY12 grundlegendes Niveau](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend).
Die aktivitätsbezogene pH-Definition wurde am offiziellen Suchtreffer des
[IUPAC Gold Book](https://goldbook.iupac.org/terms/view/P04524) gegengeprüft;
der direkte Open-Aufruf lieferte einen internen Toolfehler.

## Tatsächliche lokale Prüfungen und Grenzen

- Native D-Records/Run/Batch: **PASS für 17 historische Kandidaten**.
- Native P gegen den eigenen aktuellen Snapshot: **FAIL mit genau drei
  erwarteten veralteten Bildbindungen**.
- Eigene begrenzte Konsistenzprüfung: **PASS**, 17 Ziele, 34 Fälle, 68
  Sprachkörper, exakte native Fallbriefgleichheit, ehrliche Autorität,
  Quellenkomponenten und zwei nicht integrierte Kindrouten.
- Tatsächliches PDF: **19 Seiten**, 17 Lernzielseiten eigenständig angesehen.

Die anfängliche D-Run-Prüfung beanstandete zwei falsch gewählte
Eingabeartefakt-Digests. Der Run bindet nach der Korrektur die echten
Bundle-Eingabedateien; die anfängliche Fehlermeldung bleibt erhalten. Die
anfängliche strikte Quellen-Byte-Suche und ihre fünf reinen
Whitespace-Unterschiede bleiben ebenfalls als tatsächlicher Prüfverlauf
erhalten. Keine Produktionsprüfung oder Grenze wurde geändert.

`final-own-files.freeze.json` bindet alle eigenen Eingaben, Resultate,
Rasterbelege, Scripte und tatsächlichen Prüfresultate. Originalquellen und
Mappings werden zusätzlich über exakte vorhandene Bytes referenziert.
Dieses Dossier ändert keinen Kanon, keine aktive QA/Registry, keine bestehenden
versiegelten Dateien und keine Bilder. Es beansprucht keine menschliche
Prüfung, Freigabe, Erprobung, Clientabnahme oder Veröffentlichung.

Eigene didaktische Aussagen und Prüfmaterialien folgen CC-BY-4.0; technische
Scripte und Entwicklerdokumentation folgen Apache-2.0. Amtliche Originale
behalten ihre bestehenden Rechte.
