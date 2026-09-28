# Mathematik Q4.2: Bildprüfung zu OC-/Gütefunktionsgraphen

Review date: 2026-09-26

Decision: **HOLD für Gate V** des Ziels `ae3483e3-4712-56a1-a881-2e1f8a1a8df9` und des unveränderten JPG-Assets `sha256:b9013afe10e856219dda6c340873f618565e9786a981b2a82c6f23da20b6189c`. Das frühere `accepted_pilot` und die Freigabe vom 16.08.2026 bleiben historische Entscheidungen, gelten aber für die aktuelle fachliche Prüfung dieses Hashes nicht mehr. Dies ist eine KI-Fachprüfung, keine menschliche Freigabe.

| Ziel | Entscheidung | SHA-256 des Originals | Archiv | Konkreter Befund |
| --- | --- | --- | --- | --- |
| `ae3483e3-4712-56a1-a881-2e1f8a1a8df9` | `deferred_quality_review` | `sha256:b9013afe10e856219dda6c340873f618565e9786a981b2a82c6f23da20b6189c` | `mathematik-ae3483e3-guetefunktion-v-hold-2026-09-26/assets/ae3483e3-4712-56a1-a881-2e1f8a1a8df9/ae3483e3-4712-56a1-a881-2e1f8a1a8df9.jpg` | Das Bild zeigt Güte gegen Stichprobenumfang n bei fester Alternative statt OC-/Gütekurven gegen den wahren Parameter p; es trägt die aktuelle Zielentscheidung nicht. |

Das kanonische JPG (2752 × 1536 Pixel) und eine Ansicht mit 360 Pixel Kartenbreite wurden tatsächlich angesehen. Die Punkte sind in ihrer Reihenfolge mit den Beschriftungen verträglich: `G(40)=0.72 < 0.80`, `G(60)=0.85 > 0.80`, `G(80)=0.93 > 0.80`. Damit ist `n=60` der kleinste **gezeigte** passende Kandidat. Die glatte Kurve schneidet die Schwelle aber vor 60; aus vier gezeigten Werten folgt kein exakter Mindestumfang `n=60` für alle ganzzahligen Umfänge. Ohne Testregel und Fehlergrenze unter der Nullhypothese trägt das Bild auch keine vollständige Auswahlentscheidung. Bei 360 Pixel Breite werden gerade die Fachlabels sehr klein.

Der entscheidende Darstellungsfehler ist die Achse: Das Bild bezeichnet eine Kurve gegen den Stichprobenumfang `n` bei fester Alternative als „Gütefunktion G(n)“. Das kann allenfalls eine abgeleitete Betrachtung der Güte verschiedener Tests bei einem festen Alternativwert sein. Die OC- und Gütefunktionsgraphen des [HMKB-Kerncurriculums 2024](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf) (Q3.3, S. 48) zeigen die Beibehaltungs- beziehungsweise Verwerfungswahrscheinlichkeit in Abhängigkeit vom **wahren Wert `p`**. Q4.2 (S. 52) verlangt die Wahl von Entscheidungsregel oder Stichprobenumfang *anhand eines solchen Graphen*. Die [aktuelle Zielbeschreibung](../../canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json) verlangt eindeutig gekennzeichnete OC-/Gütekurven für vorgegebene Kandidaten und den Vergleich der jeweiligen Wahrscheinlichkeiten mit Anforderungen. Das [P-v2-Profil](../goal-evidence/m7-p-gap-second16-20260923-v1/image-bound-10.review.jsonl) prüft explizit Null- und Alternativwerte für zwei Regeln beziehungsweise zwei Stichprobenumfänge. Diese Beziehung zeigt das JPG nicht.

Eine passende Korrektur kann zum Beispiel zwei Gütekurven `G_40(p)` und `G_80(p)` gegen `p` zeigen, bei `p_0=0.2` die Werte `0.04/0.05` und bei `p_1=0.4` die Werte `0.70/0.85`, mit Anforderungen `G_n(p_0) <= 0.05` und `G_n(p_1) >= 0.80`. Dann erfüllt nur `n=80` beide Bedingungen. Ein Ersatzbild benötigt eine neue Prüfung am exakten neuen Hash und den aktuellen abhängigen Inhaltsbindungen.

Diese Review-Datei ändert weder das Bild noch seinen kanonischen Link. Die getrennte Integration zieht den aktiven Link zurück und regeneriert danach das Bild-QA-Ledger und den zentralen Gate-Status. Für den beanstandeten Hash darf bis zu einer fachlich korrigierten und erneut geprüften Fassung keine V-Freigabe gelten.

Am 27.09.2026 wurden die drei nach dem Link-Rückzug verwaisten Live-Kopien
dieses JPGs aus kanonischem Bildverzeichnis, App-Public und Backend-Static
entfernt. Das bytegleiche Original mit dem oben genannten SHA-256 bleibt im
Review-Archiv erhalten. `node scripts/check_goal_visualization_assets.mjs`
besteht danach für 1.656 aktive Links in 21 Landschaften. Dies ist nur eine
Asset-Konsistenzbereinigung, keine neue V-Freigabe.
