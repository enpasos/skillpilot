# Mathematik M7 – P-v2-Delta für drei neue PNG-Bindungen

Die kanonischen Lernzieltexte für `8823e26e`, `7c978529` und `e01869db` sind unverändert. Ich habe die vorhandenen vollständigen DE-/EN-P-v2-Profile gegen den heutigen Zielkern und die neuen Bilder nochmals fachlich gelesen. Ihre Profilkörper bleiben unverändert; ihre drei `profileFingerprint`-Werte sind mit den jeweiligen älteren Nachweisen identisch. Die neue Config setzt `reviewedResourceTypes: ["goal-visualization"]`: Der native P-Nachweis bindet nun die aktuellen kanonischen ResourceLinks und die **tatsächlich ausgelieferten PNG-Bytes**. Die alte Bild-ungebundene Config wird hier nicht geändert.

- `8823e26e`: Das Profil verlangt absolute/relative Häufigkeit, Schätzung und strukturellen Transfer beim Zusammenfassen ungleich großer Versuchserien. Sein Drehrad-Fall kann nicht aus dem neuen Zehn-Karten-Bild abgeschrieben werden. Das PNG zeigt korrekt 6 rote von 10 Ergebnissen und `P(rot) ≈ 0,6`.
- `7c978529`: Das Profil verlangt Volumenbegründung über Einheitswürfel, Kantenprodukt, Einheitenumrechnung und Vergleich. Das neue Bild zeigt einen getrennten 12er-Quader und 8er-Würfel, liefert aber keine Antwort auf die drei frischen Profilfälle.
- `e01869db`: Das Profil verlangt disjunkte vollständige Zerlegung, Ergänzen/Subtrahieren und Plausibilitätsprüfung an Stufen-, Kerben- und Fehlerfällen. Das Bild zeigt nur einen korrekten Stufenkörper mit `8 + 4 = 12` Einheitswürfeln, nicht die Transferlösung.

`page-image-bindings.json` fixiert die drei Seiten des aktuellen GoalBook-D-Kandidaten, die gleichen unveränderten Zieltexte, kanonische Bild-URL/Alttexte und SHA-256 der ausgelieferten PNGs. `check-page-image-bindings.mjs` prüft diese Bindungen reproduzierbar. Die Seiten stehen noch auf `review_candidate`, nicht auf Publikationsfreigabe; ein späterer D-Neubau muss die Seitenbindung erneut bestätigen. Weder P noch dieses Receipt ersetzen unabhängige D-Runden oder die V-Freigabe.

Alle neuen P-Records sind weiterhin `needs_human_review`, `ai_candidate`, `E1/G1`, mit 0 approved und 0 Review-Runs. Das ist der wahrheitsgemäße Kandidatenstatus, keine menschliche Freigabe, keine Lernleistungsbehauptung und noch kein M7-Abschluss. Nach zwei unabhängigen aktuellen D-Runden, strenger 3/3-Auflösung und eindeutiger Abspaltung der überlappenden historischen Pakete ist dieses P-Delta in der zentralen Registry erfasst.

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-three-new-png-post-import-20260923-v1/author-candidates.mjs
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/m7-three-new-png-post-import-20260923-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-three-new-png-post-import-20260923-v1/positive-evidence.candidates.json --write
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-three-new-png-post-import-20260923-v1/positive-evidence.config.json
node curricula/DE/Gymnasium/quality/goal-evidence/m7-three-new-png-post-import-20260923-v1/check-page-image-bindings.mjs
```

Lokales Ergebnis: 3/3 aktuelle P-Kandidaten, 0 approved, 0 blockierende P-Probleme. Das Seiten-/Bild-Receipt muss nach jeder Änderung an GoalBook-Bundle, kanonischem Link, Alttext oder Asset neu geprüft werden.
