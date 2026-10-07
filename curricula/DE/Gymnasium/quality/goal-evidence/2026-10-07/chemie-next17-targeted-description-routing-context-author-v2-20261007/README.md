# Chemie17 – gezielte Autorenversion v2

**Inert; AUTHOR; ai_candidate / needs_human_review; E1/G1; strict gain0.**
Dieses neue Dossier bereitet eine begrenzte Revision für eine anschließende
unabhängige Prüfung vor. Es ist keine eigene unabhängige Freigabe. Die vorherige
unabhängige A-Rolle ist beendet; ihre versiegelten Dateien wurden nicht geändert.
Es wurden keine aktiven kanonischen, QA-, Mapping- oder Registry-Dateien geschrieben.

## Einstieg für die unabhängige Prüfung

1. [Ganze17 Ziele, Vorher/Nachher, Profile und vollständige DE/EN-Fälle](candidate/whole17-reviewer-material.author.json).
2. [Exakte gezielte Änderungen](candidate/exact-targeted-differences.author.json).
3. [Native D-Seiten: aktuelles19-Seiten-PDF](native-d-seventeen/bundle/book.pdf)
   und [HTML](native-d-seventeen/bundle/book.html).
4. [Nativer D-Review-Input v3: komplette DE/EN-Titel und Beschreibungen samt aktuellem Kontext](native-d-seventeen/round-a/description-review-input.json).
5. [Zwei begrenzte direkte Quellenrouten mit tatsächlichen Originalzeugen und nativen Row/Decision-Vorschlägen](candidate/two-bounded-direct-source-routes.author.json).
6. [Alle17 begrenzten Primärzeugen](candidate/bounded-primary-witnesses17.author.json),
   [34 vollständige zweisprachige Material-/Aufgaben-/Antwort-/Negativfälle](candidate/complete34-bilingual-material-cases.author.json)
   und [neu gebundene17 P-Kandidaten](candidate/positive-evidence17.author-candidates.review.jsonl).
7. [Erhaltene HOLDs](candidate/preserved-holds.author.json)
   und [Freeze der eigenen Dateien](final-own-files.freeze.json).

## Exakter Änderungsumfang

| Ziel | Vorschlag |
| --- | --- |
| fd309753 | DE/EN: wässrige Lösungen unterscheiden durch das jeweilige **Überwiegen** von H3O+ oder OH−. Das Vorhandensein allein unterscheidet nicht. DE-Alttext übernimmt exakt den neuen Satz; Bildbytes unverändert. |
| 22133f29 | EN ergänzt die bereits in DE vorhandene Beschränkung der einfachen Redoxteilgleichungen auf **aqueous solutions**. |
| 9751b6d8 | DE/EN macht die **Umkehrbarkeit von Protonenübergängen** ausdrücklich. Die Quelle wird als Vorschlag auf BY7c68f201 / C10-NTG.2.8 korrigiert; ursprüngliche Split-Historie bleibt erhalten. |
| 597ac03c | Direkter Quellenrow-Vorschlag: BY7b5310e2 / C10-HG_SG_MUG_WWG_SWG.4.6, nur der erste Struktur-Eignungsteil; `partial`. Keine Zuweisung der gesamten reversibilitätsbezogenen zweiten Komponente. Zieltext unverändert. |
| c0f1bf09 / 02dc29ae / 7a05a1ce | Die Kandidaten-Kompositionssicht zeigt den tatsächlich gemischten Prozesszweig mit dem neutralen Label „Chemische Erkenntnisgewinnung und Kommunikation“. Die ganzen Ziele bleiben unverändert SekII. |

Die neutrale Kapitelanzeige betrifft auch die übrigen Kinder desselben gemischten
Zweigs, darunter das ausgewählte95dc0ee5. Mitgliedschaft, Stufe, Anwendbarkeit,
Voraussetzungen und Goal-IDs bleiben unverändert. Es gibt keine neue
Kompetenz, Themenausweitung, quantitative Gleichgewichtsforderung oder
pauschale Produktzunahme nach OH−-Zugabe.

Die vollständige Kandidatenlandschaft enthält dieselben479 Ziele. Nur drei
ganze Ziele unterscheiden sich durch die oben ausgewiesenen Felder. Die
native Vorbereitung lädt den bestehenden vollständigen378-Ziel-Kontext,
rendert aber nur17 Ziele. Der kopierte Semantic-Kind-Ledger wird mit der
vorhandenen Produktionsfunktion mechanisch auf Kandidatenfingerprints
gebunden; keine neue Kind-Klassifikation wird beschlossen.

## Nachweise und Grenzen

- Nativer D-Batch `prepare` und `check`: PASS17.
- Nativer P-Materialisierer und P-Checker: PASS17 bei `requireApproved:false`.
- [Begrenzte Integritätsprüfung](qa-artifacts/candidate-scope-and-native-integrity.check.json):
  17 ganze DE-Sätze im PDF, 17 vollständige DE/EN-Titel und Sätze im nativen
  D-Input, unveränderte `requires`/Anwendbarkeit,34 Fälle/68 Sprachfassungen
  exakt mit P-Material, Aufgaben, Referenzantworten und Negativgrenzen verbunden.
- Physisch19 PDF-Seiten:2 Vorspannseiten und17 Lernzielseiten.
- Native de-DE-PDF-Seiten zeigen **DE**. Die vollständigen EN-Sätze stehen im
  nativen D-Input und im vollständigen zweisprachigen Material. Kein EN-PDF-Nachweis
  wird behauptet.
- Die Rasterseiten6,7,9,11,13 und16 wurden tatsächlich angesehen:
  korrigierter DE-Satz, neutrale drei SekII-Breadcrumbs, unveränderte DE-Redoxgrenze
  sowie fehlende9751b6d8-Visualisierung sind sichtbar. Dies ist eine
  Layout-/Binding-Beobachtung des Autors, keine unabhängige D- oder V-Freigabe.
-14 bestehende Bildlinks bleiben exakt gebunden; keine Bildbytes wurden geändert.
  Der aktuelle Bildbestand wurde ebenfalls eingefroren. Ein nach Textänderung
  verbleibender nativer `review_candidate`-Status ist keine Publikationsfreigabe.
-0bf26276, a44af1fa und9751b6d8 behalten leere Bildlinks und V-HOLD.
-466bd2e9,6d3a2bad und8edee6b6 bleiben außerhalb17 mit ihren Quellen-HOLDs.
- Alle P-Records sind `ai_candidate`, `needs_human_review`, E1/G1,
  `reviewRunIds:[]`. Aufgaben und Referenzantworten sind Autorenmaterial;
  kein fiktiver Fall wird als echte Lernendenleistung dargestellt.
- Die unverändert übernommenen übrigen Fallantworten, einschließlich des
  Gas-Kontrollbeispiels, sind keine neue fachliche Zulassung. Die anschließende
  unabhängige Prüfung bewertet ihre konkreten Material-/Antwortgrenzen.
- Direkte Quellenroutes sind **Vorschläge** im Kandidaten, keine aktive
  Mapping-Integration. Die bisherige breite Mapping-Datei und ihre alten
  `complete`-Angaben sind eingefrorene Eingangsdaten und keine neue
  Quellenfreigabe. Keine ursprüngliche breite Quellenzeile oder
  Lernenden-Quellenobergruppe wird vollständig abgeschlossen.

Die Prüfaussagen gelten nur für die exakt eingefrorenen Eingaben dieses
Pakets. Ein späterer aktiver Import braucht eine eigene Bindung und die
jeweiligen unabhängigen Gates. Die bisherigen historischen Buchseiten sind
kein aktueller Ersatz für dieses neu vorbereitete Buch.

## Reproduzierbare begrenzte Befehle

Die Befehle laufen aus dem Repository-Root. `prepare_author_candidate.py` schreibt
nur dieses Dossier und ist nach der finalen Freeze **kein** Reproduktionsweg über
den bereits versiegelten Ordner; für eine neue Version ist ein neuer Ordner nötig.

```bash
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts check --config curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007/configs/native-d-seventeen.batch.config.json
app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007/configs/positive-evidence17.author-candidates.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007/candidate/positive-evidence17.author-candidate-set.json
app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --mode=check --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007/configs/positive-evidence17.author-candidates.config.json
```

Keine Checker-Ausnahme, Human-Approval, Human Trial, globale Builds oder
Bildgenerierung wurde verwendet. D-RundeA/B sind echte native vorbereitete,
unbeurteilte Kampagnen; sie enthalten hier keine fingierten Reviewergebnisse.

## Rechte

Eigene Lernziel-, Aufgaben- und didaktische Inhalte: CC-BY-4.0 nach
`LICENSING.md`; technische Skripte und Verfahrensdokumentation: Apache-2.0.
Die eingefrorenen offiziellen Quellen bleiben Fremdmaterial mit ihrer
ursprünglichen Provenienz und werden durch dieses Dossier nicht neu lizenziert.
