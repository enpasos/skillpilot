# P580b – einzelner Kontrollsatz, Autorenversion v3

**AUTHOR; inert; ai_candidate / needs_human_review; E1/G1; strict gain0.**
Die neue Version ersetzt die unbelegte Feuchtigkeitskontrollbehauptung in
Gasnachweis-Fall1. Sie dient einer neuen gezielten unabhängigen P-Prüfung durch
A und B. Sie enthält keine eigene unabhängige Freigabe.

## Kompakter Einstieg für A und B

- [Ganzes unverändertes Ziel, vollständiges korrigiertes DE/EN-Profil und beide kompletten Material-/Aufgaben-/Antwort-/Negativfälle](candidate/whole580b-bilingual-profile-and-two-cases.author-v3.json).
- [Exakte alte/neue Kontrollsätze und sechs betroffene Antwortfelder](candidate/exact-control-sentence-diff.author-v3.json).
- [Neuer nativer P-Record für genau580b](candidate/positive1.p580b.author-candidates.review.jsonl)
  und [native Konfiguration, Scope1](configs/positive1.p580b.author-candidates.config.json).
- [Tatsächlich gelesener B-Befund580b mit Herkunft und Freeze](inputs/actual-independent-b-580b-finding.excerpt.json).
- [Alle17 Profile mit unveränderten übrigen16 ganzen Kandidaten-Specs](candidate/positive17.corrected-author-candidate-set.json)
  und [alle34 zweisprachigen Fälle](candidate/complete34-bilingual-material-cases.author-v3.json).

## Exakte Korrektur

**DE:** „Die Luftkontrolle zeigt unter den dokumentierten Bedingungen kein
Wiederaufflammen des Spans und die CO2-freie Kontrolle klares Kalkwasser; beide
dienen als Vergleich für die positiven Beobachtungen bei A und B.“

**EN:** “Under the documented conditions, the air control shows no splint
relighting and the CO2-free control leaves limewater clear; both provide a
comparison with the positive observations for A and B.”

Dieser Satz ersetzt ausschließlich die zuvor unbelegte Behauptung, die
Kontrollen beträfen einen feuchten Span. Das Material nennt keine Spanfeuchte
oder Feuchtigkeitskontrolle. Es werden keine neuen Beobachtungen erfunden.

Im vollständigen Fall1 ändern sich genau die beiden Referenzantwortfelder
DE/EN. Im P-Profil ändern sich ihre vier identischen Kopien: zweimal
`expectations[0].observablePerformance` und zweimal
`applicationCaseBriefs[0].expectedPerformance`. Material, Aufgaben,
Negativgrenzen, Fall2 und die übrigen16 Profile/Fälle bleiben unverändert.
Neu sind nur notwendige Autoren-/Kandidatenmetadaten für580b.

## Wiederverwendete D17-, Quellen- und Kontextbindung

Das versiegelte
`chemie-next17-targeted-description-routing-context-author-v2-20261007`
wird **unverändert** referenziert. Keine D-Seite, kein Buchmodell, PDF oder HTML
wurde neu gebaut. Die vollständige v2-Freeze wird nochmals per Hash geprüft.
Goal-Fingerprint, P-Review-Input-Fingerprint und580b-Bildbytes sind unverändert;
nur der P-Profile-Fingerprint ändert sich.

Die direkten begrenzten Quellenrouten, Kapitelkorrekturen, D17-Ganzzieltexte,
AM-/Quellen-Kontexte sowie die drei V-HOLDs und drei ausgeschlossenen
Quellen-HOLDs werden nicht bearbeitet. Vorherige unabhängige D17- und P16-
Urteile bleiben Urteile ihrer jeweiligen Reviewer auf den dort versiegelten
Eingaben. Dieses Autorendossier erzeugt keine eigenen Ersatzurteile.

## Prüfstatus

- Nativer P-Materialisierer und P-Checker: PASS für genau1 Kandidaten,
  `requireApproved:false`; approved0, needs_human_review1.
- Neue native Fingerprints: unveränderter Goal-/Review-Input-Fingerprint;
  aktualisierter Profile-Fingerprint für die vier Antwortfelder.
- [Begrenzte Gleichheits-/Bindingprüfung](qa-artifacts/single-fault-material-profile-d-reuse.check.json)
  und [finale Freeze](final-own-files-and-reused-inputs.freeze.json).
- Kein neuer unabhängiger Run, kein echter Lernendenversuch, keine menschliche
  Freigabe, kein aktiver Import und keine wissenschaftliche Selbstschließung
  des alten B-P-REVISE-Befunds. Die neue Antwort braucht die gezielten
  unabhängigen A+B-Urteile.

Die eigene Freeze gilt für diese neuen Dateien und die exakt gepinnten,
unverändert wiederverwendeten Eingaben. Reine formale PASS-Ergebnisse schließen
den fachlichen B-Befund nicht selbst.

## Begrenzte Wiederprüfung

```bash
app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007/configs/positive1.p580b.author-candidates.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007/candidate/positive1.p580b.author-candidate-set.json
app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --mode=check --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007/configs/positive1.p580b.author-candidates.config.json
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007/scripts/check_and_freeze_p580b.py --check
```

Eigene Lernziel-/Aufgabeninhalte: CC-BY-4.0 nach `LICENSING.md`; technische
Skripte und Verfahrensdokumentation: Apache-2.0. Keine Fremdquelle wird neu
lizenziert.
