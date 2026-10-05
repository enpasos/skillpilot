# Fünf bestehende NI-Ziele: Quellen- und Voraussetzungsfolgepaket

**Status: eingefrorener Autorenkandidat, keine unabhängige D2, keine fachliche oder menschliche Freigabe.**

Dieses Paket bearbeitet ausschließlich die fünf tatsächlich source-supported NI-Endpunkte der nativen DNA-Pfadanalyse und ihre relevanten Voraussetzungen. Basis ist `../biologie-ni-five-current-adoption-candidate-v3/`; dessen fünf neue NI-Atome bleiben unverändert. Die aktive kanonische Landschaft hat 441 Records; die gelesene inaktive NI5-Basis 446. Die fünf bestehenden Endpunkte haben in beiden exakt denselben Body. Die zwei bereits vorgeschlagenen NI5-Platzierungsdeltas bleiben Eingangsstand.

Es wurde ausschließlich in diesem Verzeichnis geschrieben. Aktive Landschaft, Mapping, Quellenextraktion, Views, Registries, P, Images und QA-Ledger wurden nicht verändert. Das Paket enthält keine unabhängige Quellenfreigabe, keinen P-Review, kein Views-QA-Ergebnis und keinen M7-/Maturity-Abschluss.

## Fachlicher Befund und engste vorgeschlagene Änderung

Das echte [NI-Kerncurriculum 2015](https://cuvo.nibis.de/index.php?p=download&upload=18) begrenzt die Sek-I-Genetik ausdrücklich auf cytologische/chromosomale sowie stark vereinfachte Gen–Genprodukt–Merkmal-Modelle. S.87 ordnet DNA-Aufbau, identische DNA-Replikation, Proteinbiosynthese und Punktmutation der Sek II zu. Die echte Variabilitätsklausel S.89 enthält ausdrücklich die Einschränkung **ohne molekulargenetische Betrachtung**. Der frisch geladene offizielle PDF-Stand stimmt bytegenau mit dem Repository-PDF überein. Die Tabellen und ihre Jahrgangsspalten wurden auf S.75,77,87,89,90,91 visuell gelesen.

`prerequisiteOnly` verändert Sichtbarkeit, nicht die verlangte vorherige Kompetenz. Ein verstecktes Pflichtziel zu Nukleotiden, Doppelhelix und Replikation würde den Stufenfehler daher erhalten. Es ist kein Fix dieses Pakets.

| Bestehender Endpunkt | Autorenentscheidung | Erhaltener Inhalt und Grenze |
| --- | --- | --- |
| `0db20819-ee94-54c6-8ecb-aff8c9b7419e` Tier-/Pflanzenbestimmung | Den Oberstufenbody und seine direkten Kanten global erhalten. Die echte NI-Schlüsselkompetenz kann auf vorhandenes `0380f992-723a-513d-8c3f-8ca7f8e0394f` retargeten. | Artbestimmung mit geeignetem Schlüssel bleibt eine eigene Leistung. Artenkenntnis, Wirbeltiergruppen und hierarchische Klassifikation sind getrennt gebundene Anforderungen und werden dadurch nicht pauschal abgedeckt. |
| `440854be-7f06-5678-91cb-ba8dcab56959` Familienstammbaum | Ein einziges Kanten-Delta: DNA `0daa79f6…` durch vorhandenen einfachen Erbgang `b8fc739d…` ersetzen; Orientierung erhalten. | Vollständiger vorhandener DE/EN-Text und autosomale/gonosomale, dominante/rezessive sowie Grenzdeutungssemantik bleiben erhalten. Der NI-Operator verlangt zusätzlich tatsächlich gezeigte Folgen von Diploidie/Rekombination im Stammbaum. Ein bloßes Label genügt nicht. |
| `9dff0360-c2e9-5e43-af8b-87e264281cf7` historische/aktuelle Systematik | Globaler Sek-II-Body und seine direkten Kanten bleiben erhalten. NI-Bindungen an hierarchische morphologische Klassifikation und einfachen Artbegriff auf engere Vorlagen retargeten. | Die normative Einordnung anhand Morphologie/Anatomie wird erhalten. Ein Ansatzvergleich, Familienerbgänge oder Molekularphylogenie sind keine zusätzliche Sek-I-Pflicht aus diesen Klauseln. |
| `9f73b963-5fac-5a90-a993-d7b7c0cc8526` Evolution | Globaler Body bleibt erhalten; NI-Zusammenspiel und kausale Variabilität erhalten eigene enge Vorlagen. | Im vorhandenen Text steht der Wissenschaftsfehler „Selektion als Ursache genetischer Variation“. Das Paket genehmigt diesen Text nicht und repariert ihn nicht still unter derselben ID. Selektion verändert Häufigkeiten vorhandener erblicher Varianten; Mutation/Rekombination stellen Variabilität bereit. |
| `ffef97e3-12d6-5090-9816-46ab9e57fae2` molekulare Mutationsanalyse | Molekulare Kompetenz mit Substitution/Deletion/Insertion/Duplikation samt Proteinbiosynthese-Voraussetzung bleibt global intakt. Die NI-Variabilitätsbindung retargetet auf eine nichtmolekulare Vorlage. | Entfernen der Voraussetzung würde den ausdrücklich molekularen Zielbody nicht zu einem Sek-I-Ziel machen. Kein Umbennen, kein stilles Herabstufen. |

Die Zwischenziele `475eebb4-4eb0-524f-b1ec-4a672bf856d2` Proteinbiosynthese und `0daa79f6-8f61-5506-98f9-65db83062ba8` DNA bleiben als vollständige Oberstufenkompetenzen erhalten.

## Vier nachgewiesen fehlende Sek-I-Kompetenzen

Die ganze aktuelle und inaktive kanonische Landschaft wurde vor der Neuerstellung auf passende Wiederverwendung gelesen. `all-canonical-reuse-inspection.candidate.json` enthält die gelesenen DE/EN-Texte und Kanten sowie die konkrete fachliche Ablehnung zu breiter oder anderer Ersatzkompetenzen.

`four-missing-seki.goal-templates.candidate.json` enthält vier **`id: null`**-Vorlagen:

1. Hierarchische Einordnung aus Morphologie/Anatomie, Jg.7/8, FW8 S.91.
2. Einfacher Artbegriff als Fortpflanzungsgemeinschaft, Jg.9/10, FW7 S.89.
3. Kausale Variabilität durch phänomenologische Mutation und chromosomale Rekombination, Jg.9/10, FW7 S.89.
4. Evolutionszusammenspiel aus erblicher Variabilität und Selektion in Populationen, Jg.9/10, FW7 S.90.

Es sind Vorlagen für konkret belegte fehlende prüfbare Kompetenzen. Sie tragen keine bundesweiten Projektionsermächtigungen und keine stabilen neuen IDs. Die vorhandenen NI5-Ziele zu Variation, Genprodukt, Mitose und den beiden Rekombinationsmechanismen werden nicht verbreitert. Die neue kausale Integration verweist auf diese vorhandenen NI5-Kompetenzen; die beiden Rekombinationsmodelle bleiben unverändert.

Die Vorlagen enthalten positive Leistungsanforderungen, Jahrgangsstufe, echte Quelloperatoren und Grenzen vorgegebener Modelle. Ein Gonosomenmodell/Legende ist beim Stammbaum Kontext; die selbstständige Erbgangsdeutung ist Leistungsnachweis. Ein geliefertes Chromosomenmodell ist kein nachträglicher Nachweis molekularer Genetik. Die Einstufung als semantisch atomar ist eine begründete Autorenposition und kein A-Review. Es gibt keine Memory-Entscheidungen oder Memory-Deck-Neuerstellung.

## Alle sechzehn betroffenen Quellbindungen bleiben nachvollziehbar

`sixteen-source-bindings.before-after-and-holds.candidate.json` zeigt für jede tatsächliche Bindung der fünf Endpunkte den kompletten bisherigen Quellrecord und Mapping-Entscheid, den wirklichen Originaloperator, die Jahrgangsspalte, vorgeschlagene Entfernung/Retargets und verbleibende HOLDs. Andere aktuelle Bindungen derselben Quellzeile werden als unangetasteter Kontext aufgeführt und dadurch **nicht** erneut bestätigt.

`primary-source.extraction-corrections.candidate.json` begrenzt Text-/Locator-Korrekturen auf genau diese Quellrecords. Insbesondere muss der operative Mutationstext die Sek-I-Einschränkung wieder enthalten. Selektions-/Evolutionsklauseln liegen tatsächlich auf S.90, FW8 auf S.91. Die aktuelle pauschale Quellenmetadatenstufe `5/6–9/10` muss hier an die tatsächliche Spalte gebunden werden. Frühere Review-Entscheidungen bleiben historische Records; die Korrektur erzeugt keine rückwirkende Freigabe.

**Zehn Quellzeilen haben weiterhin explizite HOLD-Anteile.** Dazu gehören Ordnen nach vorgegebenen Kriterien, organismische/Populationsebene unterscheiden, tatsächlich erklärtes Diploidie/Rekombinations-Familienstammmaterial, der Variabilitätsvorteil geschlechtlicher Fortpflanzung, Gruppen-Artenkenntnis, Jg.5/6-Züchtung, nicht-erbliche Anpassung gegenüber erblicher Angepasstheit, einfache Familienähnlichkeitsdeutung, Haustier-/Wildtierverwandtschaft aus gemeinsamen Vorfahren und Merkmale aller fünf Wirbeltiergruppen. Die Originaloperatoren und Fachinhalte stehen vollständig im Bedarf; sie werden weder gestrichen noch durch Aufgaben-Givens als erfüllt behandelt. Weitere Neuerstellungen für diese HOLDs werden nicht auf Vorrat vorgenommen.

Die echte EG2-Klausel auf S.77 ist vorhanden. PDF-Worttrennung in „Popula-tions…“ macht eine rohe Zeichenfolgensuche unzuverlässig; die visuelle Tabellenprüfung bestätigt Zeile8/Jg.10. Es gibt hierfür keinen angeblich fehlerhaften Primärwortlaut.

Kein `full`-Verdikt wird aus einer vollständigen Anzahl von Mapping-Zeilen, Zielen oder Kandidaten hergeleitet. Das Paket löst gezielte Voraussetzung-/Retarget-Vorschläge und bewahrt alle weiteren normativen Anforderungen offen.

## Native Prüfung und konkreter Folgescope

`check_native_candidate.mts` verwendet die echten Funktionen `prepareLandscapeEntries`, `normalizeCanonicalLandscape` und `validateCanonicalLandscape`. Die letzte Funktion prüft den `contains`-Graph; deshalb wird zusätzlich der tatsächlich vorbereitete native `effectiveRequires`-Graph einschließlich vererbter Cluster-Voraussetzungen auf fehlende Referenzen und Zyklen geprüft.

- Inaktive Kantenfassung: 446 bestehende Records, keine `contains`- oder native `effectiveRequires`-Fehler; nur `/requires` an `440…` verändert.
- Vier Vorlagen ausschließlich im Speicher mit ausdrücklich temporären Prüfrefenzen: ebenfalls azyklisch und ohne DNA-/Proteinbiosynthese-Pflichtpfad. Diese Prüfrefenzen werden nicht als kanonische IDs gespeichert.
- Einzelnes Stammbaumdelta entfernt drei der fünf alten DNA-Pfade. Die zwei molekularen Pfade von `9f73…`/`ffef…` bleiben im globalen Graphen erhalten; die vorgeschlagenen NI-Quellenwechsel wurden nicht in eine View/Registry materialisiert.
- Tatsächlicher Scope des einzelnen Kanten-Deltas: **15 bestehende Kontexte**. In den gelesenen strict37-Metadaten sind `440…` und `73b66ead-e44a-5486-98e3-1fb3f99620a6` Gentests betroffen.
- Falls zusätzlich die vier Vorlagen eingeführt würden: **20 bestehende Kontexte**, darunter zusätzlich `0380…` aus strict37 durch neue Reverse-`requires`-Beziehungen. Diese hypothetische Zusammenführung enthält keine Quellen-/Placement-/View-Prüfung.

Die Belege stehen in `native-dag-and-effective-prerequisite-check.receipt.json`, `reverse-requires-and-strict37.context-impact.candidate.json` und `four-template-prospective-context-impact.candidate.json`. `440…` verändert den nativen Semantic-Kind-Fingerprint. Sein Goal-Evidence-Fingerprint bleibt unverändert, weil diese Funktion `requires` nicht bindet. Das macht die neue operative Voraussetzung nicht fachlich geprüft: aktueller D-Kontext/A/M sowie tatsächlich veränderte Buch-/Reverse-Links brauchen ihren begrenzten Follow-up. P und bestehende strict37-Inhalte wurden dafür nicht gelesen oder neu freigegeben.

Reproduktion ausschließlich im Kandidatenverzeichnis:

```bash
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-five-existing-source-prerequisite-fixes-candidate-v1/author_candidate.py
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-five-existing-source-prerequisite-fixes-candidate-v1/check_native_candidate.mts
```

`author-freeze.manifest.json` bindet die konkreten Autorenartefakte. Jede spätere DE/EN-/Kanten-/Modell-/Quellenänderung erzeugt eine neue Autorenfassung vor einer unabhängigen Prüfung. Ein technischer DAG-Pass ist keine D2, keine Quellenabdeckung und keine menschliche Freigabe.

## Rechte und Herkunft

Eigene didaktische Texte/Vorlagen: CC-BY-4.0, Attribution SkillPilot. Eigene technische Prüfskripte und technische Dokumentation: Apache-2.0. Der eingebundene amtliche NI-PDF-Text und seine originalgetreuen Seitenabbilder behalten ihre fremde Herkunft und Rechte; die eigenen Lizenzen werden darauf nicht pauschal übertragen.
