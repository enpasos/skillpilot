# G17 Biologie — WIP, nicht zugelassen

Stand: 10. November 2026. Der sichtbare IDE-Branch
`fix/g17-biology-atomic-prerequisites-v7-data` baut auf dem getrennten
Chemie-Checkpoint `597c2f6b17fbd0a738614590a0afeda0d45403dc` auf, Tree
`454a3a8460180850d48020fabef2660dbc39fb4e`. Dieser Stand sichert laufende
Arbeit. **Der mechanische Graphnachweis besteht; öffentliche Proof-Zulassung
und native Laufzeitabnahme bestehen nicht.** Eine Ownerentscheidung zum
Scopevertrag steht aus. Dieser Nachweis behauptet weder einen Bio-Main-Merge
noch eine abgeschlossene CI- oder M7-Abnahme.

[receipt.json](receipt.json) bindet die exakt neun angewendeten Kandidatendateien
mit Pfad, Bytezahl und SHA-256: Biologiekanon, fünf Views, neue benannte
V6-Biologie-Registry, aktiver V7-Wrapper und expliziter TS-Testadapter. Die
vorhandenen Chemieartefakte und früheren Batches bleiben erhalten. Die
QA-Dateien und der aktuelle Lieferplan sind zusätzliche Checkpointdokumentation.

## Mechanischer Graphnachweis

484 Ziele und 427 kanonische Blätter behalten sämtliche Felder außer
`requires`; 89 Arrays ändern sich netto. Der produktive Auditor umfasst auch
jenen Overview-Vorfahren, der tatsächlich Vererbung beiträgt: 485 Knoten.

Zuerst werden 1.018 bereits wirksame atomare Beziehungen materialisiert.
Danach verschwinden 39 Clusterziel- und 15 Clusterquellkanten; anschließend
werden 861 atomare Kanten entfernt. Nach jeder Entfernung werden Vererbung,
Zeugen und Closure neu geprüft. Die 1.933 geordneten Operationen enden bei
884 atomaren Anforderungen, null nichtatomaren Kanten und null
Minimalitätsbefunden. Alle **3.951 atomaren Erreichbarkeitspaare** bleiben exakt
gleich; ihr SHA-256 ist
`2ce317e7c1358e02af3ba57ee70411894abf1f448b42ba977eb30688ad84e7c2`.

Batch 4 erhält die drei vollständigen historischen Batches und ihren Präfix.
Er bindet 172 Quellsnapshots, 79 explizite Fortsetzungen und 7.838 vorhandene
Zeugenpflichten; die deduplizierte Gesamtunion umfasst 1.230 Quellen. Dieses
unabhängig überprüfte Graph-GO ist keine Zulassung der übrigen Verträge.

Der ursprüngliche Inventarlauf endete mit Exit 1, `input-changed`: Während
des Laufs wechselte der Root-Agent ausdrücklich autorisiert allein den
Branchnamen von Chemie zu Biologie. Head, Tree und sämtliche gebundenen
Eingaben blieben gleich. Der gesonderte begrenzte Abgleich endete mit Exit 0
und prüfte die vollständigen Eingabe- und Artefaktbindungen sowie unabhängig
Closure und finalen Auditor. Er bestätigte außerdem den zuvor vollständig
ausgeführten Replay mit unveränderten produktiven Primitiven. Der ursprüngliche
Fehlerstatus wurde nicht überschrieben; eine öffentliche Proof-Capability
wurde durch diese Abstimmung nicht erlangt.

## Tatsächliche Prüfungen und ihre Grenzen

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| Normaler Projekt-Typecheck | Exit 0 nach 16,760 s: `npx --no-install tsc -b --pretty false` in `app`. Kein Ausführen oder eigenständiges Typechecking der Proofskripte. |
| TS-Testadapter, begrenzte Vorprüfung | Neun Helferregressionen und vollständiges Rohdaten-Replay über vier Batches und 21 Dokumente bestanden. Keine vollständige Proofsuite oder tatsächliche Ausführung der neuen Live-Negativfälle. |
| Öffentliche Python→Node-Zulassung | Genau ein tatsächlicher Node-20-Aufruf, **gescheitert nach 421,365 s** innerhalb des unveränderten 600-s-Limits: `compiled applicability changed after batches`. Alle 8.301 Quell-, vier Laufzeit- und 23 Kandidatendateibindungen unverändert. Kein Retry, Mock, Fallback oder zurückgelieferte verifizierte Node-Bindings. |
| Native Projektions-/Rollenvorprüfung | **Exit 1 nach 93,737 s**, 2.008 Eingabebindungen unverändert. 101 Konfigurationen: 43 vollständig, 58 unverändert unvollständig; 5.587 Rollenpaare. 15 gültig→ungültig-Paare und 23 nicht exponierte Quelle/Probe-Paare, entsprechend 19 Atomen. Projizierte Ziel-/Support-/Kontextmengen und vollständiger atomarer Bedarf bleiben im Vergleich gleich. Keine Frontier-/Completion-Abnahme. |
| Tatsächlicher Compilervergleich | Elf andere von 6.524 Ausgabezeilen: sieben `applicabilityFromRequires`-Assessments und vier Elterncluster. Beide vollständigen Kataloge erhielten dieselben 27 alten Cache-Snapshots; 8.324 Eingabebindungen blieben unverändert. |
| Siebter nativer Java-Methodenkandidat | Nur Scratch: kompiliert und statisch geprüft; historische Framegrenzen 720→737→881→1062→1230 gesondert nativ geprüft. Der Kandidat ist **nicht angewendet**, seine siebte Methode und die vollständige Sieben-Methoden-Klasse sind nicht gelaufen. |

Der angewendete View-Zwischenschritt korrigiert genau zwei Abiturreferenzen
von `goalEntry` zu `canonicalSubtree` und ergänzt neun explizite
`prerequisiteOnly`-Referenzen in fünf Views. Dadurch erscheinen in der
ungefilterten breiten GK-Komposition acht bereits verfasste Prüfungskinder
(451→459 Targets). Dies ist eine gesonderte Referenzkorrektur; die native
Vorprüfung vergleicht gegen diesen korrigierten Ausgangsstand. Die sechs
Übungsreferenzen bleiben in den angewendeten Dateien unverändert. Weitere
View-/Offeringkorrekturen sind nicht angewendet oder abgenommen.

## Nachgewiesener Scopekonflikt

[applicability-countercase.json](applicability-countercase.json) enthält die
elf exakten alten/neuen Compilermaps und den kleinen neurobiologischen
Gegenfall. Der unveränderte Compiler schneidet für markierte Assessments die
Applicability ihrer direkten Voraussetzungen. Zuvor lieferten direkt
referenzierte Cluster die Vereinigung ihrer Kinder-Scopes; nach der
Atomnormalisierung werden die einzelnen Blatt-Scopes geschnitten.

Die nun direkt verlangten Blätter `11675f1a-5de2-5926-be78-1e8275f19f5b`
(ENG/EKG) und `afde0001-d7d7-5ed3-8a60-383e8da5620e`
(Neurophysiologische Verfahren) haben die kompilierten Jurisdiktionen
`DE-BY` beziehungsweise `DE-HE`. Beide stehen tatsächlich direkt in allen
drei betroffenen Neuro-Assessments. Die drei neuen Compilerausgaben sind
`{}`. **Das ist keine explizit leere erlaubte Jurisdiktionsmenge:** Eine fehlende
Applicabilitydimension bedeutet nach Graph Definition §11.1 keine Einschränkung.
Damit besteht ein Risiko einer Interpretation als unbeschränkt; weder
Unsichtbarkeit noch eine sichere Scopeverengung ist daraus nachgewiesen.
Der bestehende Lieferplan weist bereits auf diese Unterscheidung hin.

Ein unverändert festgehaltener alter Assessment-Scope würde seinerseits mit
dem bestehenden `APV-102` kollidieren: Für die sieben Assessmentatome ergeben
sich 593 Assessment/Voraussetzung/Jurisdiktion-Gegenfälle. Das ist ein
Gegenvergleich unter bewahrtem altem Scope, kein behaupteter eigenständiger
APV-Pass. Expliziter Support und ein Cache-Refresh lösen den derzeitigen
Compiler-/Proofvertrag nicht automatisch.

Die relevanten bestehenden Anker sind:

- `docs/concept/skill-graph/graph-definition.md`, §§5.2, 6.4 und 7.3: atomare
  Normalform, erhaltene vollständige atomare Closure **und** getrennt erhaltene
  Scope-, Applicability-, Target-, Frontier-, Completion- und Masteryverträge.
- Dieselbe Graph Definition §11.1, insbesondere Zeile 920: fehlende Dimension
  bedeutet unbeschränkt; vorhandene Warnung im Lieferplan ab Zeile 744.
- `app/scripts/prerequisiteReductionProof.ts:1511`: tatsächliches gescheitertes
  V6-Equality-Gate `compiled applicability changed after batches`.
- `app/scripts/applicabilityCompiler.ts:1336` und `:1481`: bestehende
  direkte All-of-Ableitung beziehungsweise `APV-102`;
  `app/scripts/sourceCoverageAndApplicabilityRegression.test.ts:187` bindet
  die vorhandene Schnittsemantik ausdrücklich.

## Offene Einlieferung

Die Ownerentscheidung zum ausdrücklich abgegrenzten Scope-/Proofvertrag ist
noch offen. Hier wird kein neuer Normvorschlag beschlossen oder implementiert.
Die Reihenfolge bleibt: erst eine autorisierte, getrennte Vertragslieferung
mit eigener Abnahme; danach dieser mechanische Biologiestand mit tatsächlicher
Laufzeitprüfung, regulärem CQR-Producer, unveränderten Floors und frischer CI;
anschließend die übrigen geschützten Fächer und die gesonderte vollständige
Standard-G17-/Main-Abnahme.

Quellenentscheidungen, Lernzieltexte, Aufgaben, Medien, historische
Reviewbindungen, Mastery und Maturity-Floors wurden nicht verändert. Die
übrigen 20 Kanondokumente bleiben gleich. Es gibt keine umgebundenen
Source-Fingerprints, neue Live-Compilersemantik oder abgeschwächte Gates.
Atlasregeneration, regulärer CQR-/Floorlauf, frische Biologie-Remote-CI und
Biologie-Main-Abnahme stehen aus. Die ausführlichen lokalen Rohbelege liegen
weiterhin unter `tmp/g17-biology-next-delivery-20261110/` und den im Receipt
als Codepfade genannten Laufverzeichnissen; deren Hashes sind dokumentiert,
aber diese ignorierten lokalen Pfade sind keine vorgetäuschten Remote-Links.
