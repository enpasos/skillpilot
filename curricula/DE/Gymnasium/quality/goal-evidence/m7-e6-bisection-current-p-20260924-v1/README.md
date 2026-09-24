# Mathematik M7: aktueller Bild-P-Nachweis für E.6 Intervallhalbierung

Dieses Paket trennt `3bfc2747-03e2-57db-b13f-01f78835eefd` („Konvergenz und Grenzen numerischer Verfahren reflektieren“) aus dem registrierten alten P-Owner `m7-two-local-png-bound-p-20260923-v1/tangent-source-retained16.retained-before-four-comic-png-20260923-v1.config.json`. Dessen Dateiname und Scope-Label sprechen von 16, sein tatsächlich registrierter Umfang sind **15** IDs und 15 Records. `retained14.config.json` und `retained14.review.jsonl` bewahren die anderen **14** Records zeilengetreu; das alte 15er-Audit bleibt unverändert. Ein zentraler Owner-Tausch ist hier bewusst **nicht** vorgenommen.

Der neue Ein-Ziel-Owner `positive-evidence.config.json` nutzt `reviewedResourceTypes: ["goal-visualization"]`. Sein P-v2-Fingerprint umfasst das [tatsächlich geprüfte quadratische PNG](../../goal-visualization-review/mathematik-m7-3bfc-numerical-method-png-20260924-v1.md) mit SHA-256 `c31b38c5596269a8a780fb98d63c8e71b4904c7e041cf45e271b2fc2ff8d8734`. Das Bild zeigt ausdrücklich **ein Beispiel** der Intervallhalbierung für `f(x)=x²−2`: aus `[1;2]` wird nach sieben Halbierungen ein Intervall der Breite `1/128<0,01`. Die Zeichnung ist als schematisch beschriftet. Die offizielle HE-E.6-Quelle nennt das Bisektionsverfahren sowie Konvergenzgeschwindigkeit und Verfahrensgrenzen. Das kanonische Ziel verlangt die Beurteilung **eines** numerischen Verfahrens einschließlich Abbruchkriterium und Fehlerquelle, nicht die Übertragung der Halbierungsbedingungen auf jedes numerische Verfahren.

Die beiden positiven Leistungsfälle prüfen anderes als die Bildantwort:

1. Eine Folge `zₙ` mit **für jedes n zertifizierter** Schranke `|zₙ−L|≤0,8·0,4^(n−1)` und Toleranz `0,06`. Die gegebenen Werte `5,05`, `5,04`, `5,03`, `5,02` wirken schon früh stabil; dennoch ist **n=4** der erste durch die Schranke sicher ausreichende Schritt (`B₄=0,0512≤0,06`). Aus `Bₙ→0` folgt Konvergenz gegen `L`; ein früher kleiner Abstand benachbarter Anzeigen ist kein Fehlerzertifikat. Weder Funktion, Algorithmus, Antwort noch Toleranz werden aus dem PNG übernommen.
2. Eine Fixpunktiteration für `x=2,4−x`, beginnend bei `x₀=1,16`, zeigt gerundet auf eine Nachkommastelle immer `1,2`. Ungerundet alterniert sie dauerhaft zwischen `1,16` und `1,24`. Der Fall fordert die eigenständige Prüfung des Iterationsverlaufs, identifiziert grobe Rundung als verdeckende Fehlerquelle und trennt Scheitern dieses Verfahrens von der Existenz der Lösung `1,2`.

Die Erwartungen des alten Profils zu Konvergenzbeleg, Abbruch und Fehlerquelle bleiben erhalten; die beiden Fallbriefings wurden konkretisiert und fachlich überprüft. Die erste Prüfung beruht auf einer ausdrücklich für **alle n** gegebenen Fehlerschranke, sodass aus nur vier Tabellenzeilen nicht unzulässig eine allgemeine Konvergenz behauptet wird. Der zweite Fall ist ein Transfer auf ein anderes, bewusst scheiterndes Verfahren und erweitert nicht die curriculare Zielbeschreibung. `source-pins.json` und `materialize-candidates.mjs` verifizieren alte Eingangsdateien und beide exakten aktiven PNG-Kopien. `--check` bestätigt zugleich, dass die 14 übernommenen Records unverändert geblieben sind.

Der neue Record ist wahrheitsgemäß `needs_human_review` / `ai_candidate`, `E1/G1`, **kein** menschlich freigegebener oder an Lernenden erprobter Nachweis. Er belegt allein die maschinelle P-Prüfung. D-, A-, M- und V-Gates werden dadurch nicht freigegeben. Das Paket ist zur zentralen Registrierung vorbereitet; alte Reviews und Registry sind hier nicht umgeschrieben.

Fokussiert bestanden (Repository-Root):

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-e6-bisection-current-p-20260924-v1/materialize-candidates.mjs --check
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/m7-e6-bisection-current-p-20260924-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-e6-bisection-current-p-20260924-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-e6-bisection-current-p-20260924-v1/positive-evidence.config.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-e6-bisection-current-p-20260924-v1/retained14.config.json
npm --prefix app run test:positive-goal-evidence-review
npm --prefix app run test:positive-goal-evidence-candidates
```

Ergebnis: 1 neuer aktueller Bild-P-Kandidat und 14 unveränderte gültige P-Records, jeweils **0 Blocker** in den fokussierten Prüfungen. Der zentrale Fünf-Gate-Check ist nach dem Owner-Tausch durch die Integrationsverantwortung erneut auszuführen.
