# Zielgenaue Neubindung: ungeordnete Auswahlen

Stand: 2026-09-27. Ziel: `70efdec0-110c-5564-849b-bc05cfff0f6a`.
Dies ist maschinelle Curriculum-QS, weder menschliche Freigabe noch Erprobung.

## Fachliche Entscheidung

Die alte Wendung „Stichproben berechnen“ benannte das Rechenobjekt falsch.
Die neue DE/EN-Fassung fordert die **Anzahl** ungeordneter Auswahlen,
begründet die Nichtzählung vertauschter Reihenfolgen und prüft kleine Fälle.
Sie bleibt bei der Fakultätenmethode vor der Einführung des
Binomialkoeffizienten. Ein Split ist nicht nötig: Berechnung, Begründung und
Kontrolle sind Nachweise derselben kombinatorischen Zählidee. Isolierter
Formelabruf wäre unzureichend; eine eigene Memory-Karte ist nicht nötig.

Das unveränderte PNG mit SHA-256
`2d19a513c73095f3d3e849352cfb8a155354865b6d611ba3552b9d63d0ab659c`
wurde im Original und bei 360 px gegen die neue Formulierung und den
geklammerten deutschen Alttext geprüft: aus vier verschiedenen Plättchen
entstehen genau `AB, AC, AD, BC, BD, CD`; `AB` und `BA` sind dieselbe
Auswahl; `4!/(2!·2!) = 6`. Die Grafik ist freundlich und klein lesbar. Sie
zeigt ein richtiges Beispiel, **keinen allgemeinen Beweis** der Formel.
Der Asset-Hash und die drei PNG-Kopien wurden nicht verändert. Die
Visualisierungs-QA bleibt ausdrücklich AI-only; `humanApproved` bleibt `no`.

Das bestehende P-v2-Profil wurde gegen die neue Formulierung erneut gelesen:
seine zwei Erwartungen verlangen, die Mehrfachzählung zu erklären und den
Quotienten durch unabhängige Kontrollen zu prüfen. Die Transferfälle fünf
aus zwei (`10`) und sechs aus drei (`20`) bleiben fachlich stimmig. Das
neue Einzielprofil bleibt `needs_human_review`, `ai_candidate`, E1/G1;
die neun unveränderten Zehner-P-Records werden bytegleich separat geführt.
`materialize-target-bindings.mjs` prüft alte Quell-Hashes sowie neuen
Text, Alttext und PNG-Hash und erzeugt ausschließlich diese beiden
disjunkten aktuellen Bindungen. Die historische Zehnerkampagne bleibt
unverändert.

Die neue D-Seite wurde danach in zwei voneinander getrennten aktuellen
Runden als `keep` bewertet. Runde A leitet die Anzahl aus geordneten
Auswahlen durch Division durch `k!` her; Runde B verwendet
`n!/[k!(n-k)!]`. Die zwei Wege sind gleichwertig, kein fachlicher
Gegenbefund. Die explizite AI-Synthese wählt den anschaulicheren Transfer
zwischen ungeordnetem Team und Rollenvergabe aus Runde B und bindet den
aktuellen Seitenfingerprint. Die resultierende D-Resolution ist streng
`1/1`; sie ersetzt keine menschliche Freigabe und bestätigt keine
vollständige externe Quellen-/Projektionsprüfung.
