# Begrenzte BY-Kursunion: gemeinsame Elternzuordnung

1. November 2026; Read-only-Review durch `/root/astra_fundamental_approach_recheck`. Keine Produktdatenänderung, keine neue Quellenextraktion und kein zusätzlicher Testlauf.

**PASS für den folgenden engen Autorenfix; die integrierte Java-Kursunion bleibt anschließend nachzuweisen.**

Die Ursache ist in beiden gelieferten Java-Uniondateien und den vier aktuellen BY-Ansichten sichtbar: GK referenziert drei Atome direkt unter „Q4 → Weitere Kompetenzen“, LK referenziert deren kanonischen Parent `ead1f5ce-fdf4-5591-8982-395001017848`. Die Union enthält deshalb sowohl die drei direkten Einträge als auch denselben Inhalt unter dem Parent. Der Fehler ist bereits in `tmp/math-bbb-baseline-union/by-union.json` und `by-sekii-union.json` vorhanden; BBB ist hierfür nicht erforderlich.

Der kanonische Parent „Differential- und Integralrechnung in Sachzusammenhängen reflektiert anwenden“ hat `requires=[]` und **genau** diese drei atomaren Kinder:

- `dc12f281-f161-572b-a973-8405ae9b2498` – Differentialrechnung in Sachzusammenhängen auswählen und anwenden
- `0b162cb0-8507-5ac2-b9d6-57f40f4d3f35` – Integralrechnung in Sachzusammenhängen auswählen und anwenden
- `71fe4a39-38e8-5c6a-8eef-ff4783fe70c2` – Analysis-Modelle in Sachzusammenhängen validieren

Alle drei sind schon in GK und LK Target. Parent und Kinder sind im bestehenden Kanon für beide technischen Kursprofile anwendbar und auf Bayern M13.4 bezogen. Der vorhandene Quellenreview `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json` enthält entsprechende Parent-/Kindzuordnungen. Für diesen Fix wird daraus keine neue Quellenfreigabe oder größere Kompetenzmenge abgeleitet: Es wird ausschließlich bereits ausgewählter identischer Inhalt gleich angeordnet.

**Exakte vorgeschlagene Änderungen:**

| Datei | Autoritativer Strukturpfad | Mutation |
| --- | --- | --- |
| `curricula/DE/Gymnasium/composition-views/mathematik/de-by-gk.view.json` | `math-root → sek-ii → gk-sek-ii-q4 → gk-sek-ii-q4-weitere-kompetenzen` | Die drei oben genannten direkten `goalEntry` mit `projectionRole: target` durch einen gemeinsamen `canonicalSubtree` ersetzen. |
| `curricula/DE/Gymnasium/composition-views/mathematik/de-by-sekii-gk.view.json` | `gk-sek-ii-only-q4 → gk-sek-ii-only-q4-weitere-kompetenzen` | Derselbe Ersatz. |

Der gemeinsame Ersatz lautet:

```json
{
  "kind": "canonicalSubtree",
  "goalId": "ead1f5ce-fdf4-5591-8982-395001017848",
  "projectionRole": "target"
}
```

Im gelesenen Rootstand liegen die betroffenen drei Einträge jeweils an `children[1..3]` des genannten „Weitere Kompetenzen“-Containers. `children[0]`, Ziel `49f9059a-876c-5051-8146-d008b5cc691c`, bleibt unverändert an erster Stelle. Der gemeinsame Parent folgt danach. Die stabilen Struktur-IDs und exakten Referenzen sind die Mutationsanker; Arrayindizes sind nur eine Diagnose dieses gelesenen Stands.

Für diese Korrektur sind **keine Änderungen** an `de-by-lk.view.json`, `de-by-sekii-lk.view.json`, Kanonkanten, Prüfungen, Quellenmappings, globalen Rollenmasken oder Runtime-Merger erforderlich. Das bestehende LK-Q4-Subtree hat bereits den gewünschten Parent. Der übereinstimmende Kursstrukturpfad wird im vorhandenen Java-Merger zu `gk-lk-…` zusammengeführt; die gemeinsame kanonische Referenz kann damit einmal erhalten bleiben.

Das erwartete Delta beträgt **null atomare Targetänderungen, null atomare Rollenänderungen und null Änderungen fachlicher Anforderungen**. In GK kommt lediglich der fachliche Navigationscluster hinzu. Sein leeres `requires` erzeugt keine neue geerbte Vorbereitung. Die atomaren Verbindungen zu `1511b39a-4094-5450-a755-4a3ad3339733` und `b9bbd2a8-1379-5ffb-817f-41467d48abef` bleiben ebenso bestehen wie sämtliche übrigen unabhängigen Wurzeln und Aufgaben.

Die drei Ziele gehören damit auch in der Union zur gemeinsamen fachlichen Basis. Die eigenständigen zusätzlichen Vertiefungskursinhalte von LK werden nicht entfernt, nach GK verschoben oder neu geordnet. Die bindende technische BY-Bedeutung – GK vollständiger vierstündiger Pflichtunterricht, LK zusätzlich alle fünf Vertiefungsmodule – bleibt erhalten. Diese begrenzte Elternangleichung überprüft nicht nochmals die gesamte weitere LK-Zusatzmenge.

**Integration und Prüfgrenze:** Die beiden Autorenänderungen müssen in den einen gemeinsamen Kandidaten und dessen vorhandene Source-/Output-Bindungen übernommen werden, damit die vorhandenen Erzeuger sie reproduzieren. Keine historischen Receipts überschreiben und keine zweite Layoutquelle einführen. Nach Integration sind die tatsächlichen Java-GK+LK-Unionen für CrossStage und SekII mit dem nativen Compiler zu prüfen: jedes der drei Atome genau einmal mit Parent `ead1f5ce-…`, dieselben atomaren Targets/Rollen wie zuvor, alle übrigen Wurzeln erhalten. Grüne GK-/LK-Einzelviews allein reichen nicht. Dieses Review genehmigt den beschriebenen Elternfix, nicht andere BY-Scopeänderungen, BBB-Platzierungen, den vollständigen 154er-Corpus oder eine Fachfreigabe.
