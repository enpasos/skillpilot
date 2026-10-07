# Chemie17: unabhängiges gezieltes D-B-/P-Binding-Review

**Inert; ai_candidate; needs_human_review; E1/G1; strenger Nettozuwachs 0.**

Reviewer: `Codex /root/chem17_targeted_independent_b`. Die aktuellen anderen
Reviewergebnisse wurden weder vor noch nach der eigenen ersten Entscheidung
gelesen. Das Autorendossier v2 und seine 117 eigenen Dateien sind gegen die
Freeze `3f458ad7fac9b63e29c11e41cd117b474e37542039d5b88dc6cf8c747723838a`
verifiziert. Aktive Landschaften, Mappingdateien, QA-Dateien und die zentrale
Registry wurden durch dieses Review nicht verändert.

## Tatsächlich geprüft

- Alle 17 nativen DE-Lernzielseiten, physische PDF-Seiten 3–19, wurden als
  eigene Raster gerendert und tatsächlich angesehen. Die vollständigen
  bilingualen Ziele, ihre nativen Kontextfelder und 34 vollständige DE/EN-Fälle
  wurden gelesen. EN-PDF-Seiten werden nicht behauptet.
- Die drei korrigierten Ziele fd309753, 22133f29 und 9751b6d8 sind fachlich
  korrekt, begrenzt und DE/EN gleichbedeutend. Alle 17 Beschreibungen: **KEEP**.
- Die direkten Quellenrouten: 597ac03c **KEEP nur für den ersten
  Struktur-Eignungsteil als partial**; 9751b6d8 **KEEP für die ausgewählte
  Beeinflussungskompetenz mit Reversibilität BY C10-NTG.2.8**. Beide tatsächlichen
  Primärtextzeugen sind wörtlich überprüft. Breite alte Parent-Routen und deren
  alte Vollständigkeitsrationale sind historische Daten und erhalten hier keine
  fachliche Freigabe.
- Der neutrale Kapitelpfad „Chemische Erkenntnisgewinnung und Kommunikation“
  ist auf den vier ausgewählten betroffenen Seiten sichtbar. Die drei
  SekII-Ziele bleiben unverändert. Dies prüft die Kandidaten-Prüfsicht, nicht
  sämtliche operativen Bundesland-Kompositionssichten.
- Alle 34 Fälle mit 68 Sprachfassungen sind wörtlich mit den jeweiligen
  P-Aufgaben, Referenzantworten und Negativgrenzen verbunden. Alle 17
  P-Profilkörper sind exakt aus den eingefrorenen Autoreneingaben erhalten.
  Die 14 vorhandenen Seitenbilder sind gegen die tatsächlichen aktuellen
  Rasterbytes gebunden; eine neue Visualisierungsfreigabe wird nicht erteilt.

## Ergebnis und offener Befund

| Prüfung | Eigenes Ergebnis |
| --- | --- |
| Beschreibungen | 17 KEEP |
| Positive Materialfälle | 16 KEEP, 1 REVISE |
| Nativer D-B-Ergebnischecker | PASS, 17 valide Kandidaten |
| Nativer P-Checker | PASS, 0 formale Blocker, 0 approved, 17 needs_human_review |
| Strenge fachliche Gesamtabschlüsse | 0; keine operative Integration |

**580b3616 / Gasnachweis Fall 1 bleibt P-REVISE:** Das Material gibt eine
Luftkontrolle ohne Wiederaufflammen sowie eine CO2-freie Kalkwasserkontrolle
vor. Die übernommene DE/EN-Referenzantwort behauptet dagegen eine Aussage über
einen **feuchten Span**. Ein solcher Span oder Feuchtigkeitskontrollversuch
ist im Material nicht dokumentiert. Der Korrekturauftrag ist im eigenen
[ersten Urteil](independent-first-pass.judgments.json) mit den vier betroffenen
P-Pfaden und dem vollständigen Materialfall festgehalten. Nur dieser Satz ist
passend zu den tatsächlich vorgegebenen Kontrollen in beiden Sprachen zu
korrigieren; danach benötigen die geänderten Material-/Profilbindungen eine
neue gezielte Prüfung.

Der native P-Checker bestätigt die Struktur und aktuellen Bindungen. Er löst
diesen fachlichen Dissens nicht auf. Deshalb sind seine 17 formal validen
Kandidaten **keine 17 fachlich positiven Materialabschlüsse**. Der vollständige
P-Record behält den Befund in `dissent`; kein übernommenes Material wird allein
wegen seiner unveränderten Bytes als fachlich richtig erklärt.

Die Bild-Holds 0bf26276, a44af1fa und 9751b6d8 sowie die ausgeschlossenen
Quellen-Holds 466bd2e9, 6d3a2bad und 8edee6b6 bleiben offen. Auf den drei
nativen Bild-Hold-Seiten ist das fehlende Bild tatsächlich sichtbar. Es wurden
keine Bilder erzeugt, keine historischen Artefakte verändert und keine
menschliche Prüfung, Freigabe, Erprobung oder Lernendenleistung behauptet.

## Nachweise

- [Eigenes blindes Urteil](independent-first-pass.judgments.json) und
  [erste Entscheidung vor Peerzugriff](independent-first-pass.actual-seal.json).
- [Tatsächliche ganze Ziel-/Seiten-/Kontextbindungen](actual-whole-goal-page-context-material-binding.receipt.json).
- [Wörtliche Material-/Profil-/Quellenprüfung](checks/literal-material-profile-source-bindings.actual-check.json).
- [Native D-B-Kampagne](native-d/campaign.json) mit eigenen Records und Run im
  Ordner `native-d/results/`; [echter Exit](checks/native-d-b17.actual.exit.json).
- [Native P-Konfiguration](native-p/positive17.current-independent-b.config.json),
  [eigene Records mit offenem Dissens](native-p/positive17.current-independent-b.review.jsonl)
  und [Run](native-p/current-independent-b.run.json);
  [echter Exit](checks/native-p-b17.actual.exit.json).
- [Finale Freeze](final-own-files-and-reviewed-inputs.freeze.json).

## Begrenzte reproduzierbare Checks

Aus dem Repository-Root; die eigene Materialisierung ist bereits abgeschlossen
und darf den versiegelten Ordner nicht überschreiben. Die folgenden nativen
Checker lesen die vorhandenen Artefakte:

```bash
app/node_modules/.bin/tsx app/scripts/validateGoalDescriptionReviewCampaignResults.ts --bundle curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-independent-d-b-p-binding-20261007-v1/native-d/bundle-manifest.json --input curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-independent-d-b-p-binding-20261007-v1/native-d/input.json --campaign curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-independent-d-b-p-binding-20261007-v1/native-d/campaign.json --batches-dir curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007/native-d-seventeen/round-b/batches --results-dir curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-independent-d-b-p-binding-20261007-v1/native-d/results
app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --mode=check --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-independent-d-b-p-binding-20261007-v1/native-p/positive17.current-independent-b.config.json
```

Keine vollständigen Builds oder globalen QS-Läufe und keine Checker-Ausnahmen
wurden für dieses begrenzte Kandidatenreview verwendet. Eigene didaktische
Inhalte sind CC-BY-4.0, technische Verfahrensdateien Apache-2.0 gemäß
`LICENSING.md`; offizielle Fremdquellen behalten ihre eigene Provenienz.
