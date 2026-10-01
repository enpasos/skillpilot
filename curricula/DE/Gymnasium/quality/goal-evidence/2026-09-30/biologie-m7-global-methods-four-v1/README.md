# Biologie M7: P-v2-Kandidaten für vier globale Methodenziele

Stand: 2026-09-30. Die vier IDs sind `d97f6957`, `26aa47b7`, `0f1549f6`
und `0380f992`. Die vollständigen aktuellen IDs stehen in
`positive-evidence.config.json`. Die Zieltexte wurden gegen die kanonische
Biologie-Landschaft und die direkt gebundenen bayerischen
Source-Extraction-Ziele B8.1.1 bis B8.1.4 gelesen. Die Falltexte beanspruchen
keine pauschale Quellenfreigabe für alle Länderansichten.

Die vier `positive-understanding-evidence-v2`-Profile enthalten je zwei
fachspezifische Erwartungspaare und zwei inhaltlich veränderte, neue
Anwendungsfälle. Beim Durchführen/Protokollieren und Dokumentieren bleibt
die im Ziel beziehungsweise in B8.1.2/B8.1.3 ausdrücklich zugelassene
Hilfestellung erhalten. Der zweite Fall zu `0f1549f6` prüft beobachtetes
Schneckenverhalten statt das aktive Blattbild zu wiederholen; der
Bestimmungsfall zu `0380f992` nutzt Baum und Vogel statt Falter.

Alle vier Profile binden den aktuellen Ziel-Fingerprint, das
Review-Kriterium, die semantische Klasse und den SHA-256 der jeweiligen
aktiven PNG im `reviewInputFingerprint`. `reviewRunIds` ist leer, weil kein
separater Profilreview-Lauf behauptet wird. `status` bleibt
`needs_human_review`, `reviewAuthority` bleibt `ai_candidate`.

Der gezielte Check
`tsx scripts/positiveGoalEvidenceReview.ts --config=.../positive-evidence.config.json --mode=check`
bestand mit **4 konfigurierten Zielen, 4 KI-Kandidaten und 0 Blocking
Issues**. Dieser technische P-Gate-Beleg ist keine menschliche Prüfung,
Freigabe oder Erprobung. D bleibt bis zu zwei tatsächlich unabhängigen
Beschreibungsreviews und der Auflösung ihrer Befunde offen.
