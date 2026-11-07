# Prüfung der geerbten Voraussetzungsduplikate

Stand: 6. November 2026. **Rein lesende AI-Prüfung; keine Datenänderung und
keine menschliche Freigabe.** Der feste Ausgangsstand ist
`212eebd39a28afba212551efd773633fd55d6338`, nach den getrennten 19
Gewichtskorrekturen. Das [Manifest](inherited-duplicate-review-2026-11-06.json)
enthält sämtliche 78 konkreten Autorenkanten, Beschreibungen, Eigentümer,
Quellhashes und bleibenden Vererbungsursprünge.

| Fach | G16-Kanten / betroffene Autoren | G17 nach hypothetischer Entfernung | Weitere Strukturfehler danach |
| --- | ---: | ---: | --- |
| Biologie | 16 / 16 | 343 | keine |
| Chemie | 13 / 10 | 328 | keine |
| Geschichte | 13 / 7 | 0 | keine |
| Informatik | 22 / 8 | 72 | keine |
| Physik | 14 / 10 | 596 | zwei UUID-Feststellungen aus Mathematik |

Für jeden Entzug bleibt die identisch aufgelöste Voraussetzung auf einem
echten `contains`-Vorfahren authored. Dieser konkrete deckende Ursprung wird
auch in der gesamten vorgeschlagenen Menge nicht gelöscht. Bei den
verschachtelten Chemieduplikaten genügt der zuerst gemeldete Zwischenvorfahr
dafür nicht immer; das Manifest belegt dann den weiter oben bleibenden Ursprung.
Alle Nachfahren erben somit dieselbe Voraussetzung weiter. Polyhierarchie
und weitere Ursprünge ändern diese Mengengleichheit nicht.

Der unabhängige Prüfer baut nach jedem der 78 Entzüge die vollständige
Vererbung neu auf. Über alle 6.524 Goals der 21 festen Katalogdateien bleiben
sogar die **effektiven Adjazenzmengen** exakt identisch, ebenso die getrennt
expandierte atomare Relation. Das ist stärker als gleiche transitive
Erreichbarkeit. Nicht mitgeprüft oder fachlich freigegeben ist die didaktische
Angemessenheit der beibehaltenen breiten Clustervoraussetzungen. Drei bereits
vorhandene zyklische Komponenten unbeteiligter Landschaften bleiben Fehler.

```bash
python docs/dev/ci-graph-repairs/verify_inherited_duplicate_review.py
```

Der Befehl liest nur das selbständige Manifest, den versionierten benachbarten
Graphhelfer und die gebundenen lokalen Gitobjekte. Er benötigt keine `tmp`-
Dateien und schreibt weder Curriculum noch Reviews oder Lernendenzustand.

Die Normalisierung ist dennoch kein wirkungsfreier Hashwechsel:

- Alle 51 Autoren erhalten andere rohe `requires`. Bei Biologie, Chemie und
  Physik würden nachweislich 36 derzeit passende aktive semantische
  Klassifikationsbelege veralten. Diese Records wurden tatsächlich mit der
  aktuellen Fingerprintfunktion verglichen; alte und hypothetische neue
  Fingerprints stehen im Manifest.
- Beschreibungsreview-Kontext, vollständiger P-Reviewinput, Buchseiten und
  deren direkte/reverse Voraussetzungsanzeigen haben weitere Bindungen an
  diese Rohdaten. Unveränderte schmale Textfingerprints ersetzen diese Prüfung
  nicht. Historische Reviewbytes werden nicht mit neuen Hashes etikettiert.
- Practice-Receipts binden rohe `requires`; vorhandene Receipts können
  folgerichtig veralten. Die Anzahl tatsächlich gespeicherter Receipts wurde
  nicht erhoben. Die direkten Beziehungen beeinflussen außerdem die
  Assessmentpriorisierung. Der konkrete Katalogscan fand keine betroffene
  authored Orientierungseinstiegsreferenz.
- CQR-102 und projektionslokale CQR-104 prüfen zusätzlich rohe atomare Wege.
  Diese Relation ist von der effektiven atomaren Nachfrage verschieden;
  tatsächliche verlorene Rohwege sind im Manifest inventarisiert. Für
  Geschichte und Informatik bleiben ihre rohen atomaren Kanten gleich, weil
  die dort entfernten Voraussetzungen Cluster sind. Die übrigen konfigurierten
  Routen müssen vor Anwendung real geprüft werden.

Geschichte wäre mit diesen 13 Entzügen strukturell vollständig fehlerfrei.
Eine neue M6-Abnahme setzt trotzdem die erforderlichen aktuellen Belege,
Berichtserzeugung, Frischeprüfung und den unveränderten Floorcheck voraus.
Vor jeder Anwendung bleiben Root-Bestätigung sowie die vollständigen Main-
Laufzeit- und Serviceprüfungen erforderlich.
