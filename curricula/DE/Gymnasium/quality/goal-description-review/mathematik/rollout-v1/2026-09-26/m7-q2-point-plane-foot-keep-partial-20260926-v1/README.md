# Punkt–Ebene-Lotfuß: gezielte D-Synthese

Dieses isolierte Paket bindet **nur** `79c4cd21-af64-5925-968e-9bc1f74cd0ad`
an die zwei gültigen, unabhängig erstellten KEEP-Reviews der unveränderten
Elferrunde vom 24.09.2026. Die aktuelle kanonische Seite samt Bildbytes stimmt
mit beiden Reviewkontexten überein. Die übrigen zehn Ziele sind im
`compatibility-receipt.json` als **von diesem Paket nicht abgeschlossen**
ausgewiesen; ein abweichender aktueller Seitenstand von `18be713b…` wird
dort nicht als geprüft behandelt. Das ist kein globaler Offenstand: Für
`8eb14d81…` besteht bereits eine gesondert zentral registrierte
KEEP-Resolution aus derselben historischen Elferrunde.

Die spätere v2-Runde empfahl teilweise, die kürzeste Lotstrecke ausdrücklich
in den Zieltext aufzunehmen. Die Synthese begründet, weshalb die schon
geforderte *geometrische Begründung des Punkt–Ebene-Abstands* diese
Minimalität einschließt: Das Lot ist zu jeder Strecke in der Ebene durch
den Fußpunkt orthogonal; Pythagoras macht jede schräge Verbindung mindestens
so lang. Der v2-B-Wortlaut ließe zudem das in der amtlichen Quelle auf
gedruckter Seite 42 ausdrücklich genannte **Erarbeiten** des Verfahrens weg.
Die v2-Kritik wird inhaltlich berücksichtigt, aber ihre wegen verlorener
PDF-Bytebindung unbrauchbaren Records werden hier nicht umgebunden.

Der gezielte Befehl
`npx --prefix app tsx app/scripts/materializeMathM7PartialKeep.ts --config curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-26/m7-q2-point-plane-foot-keep-partial-20260926-v1.config.json --check`
bestätigt `strict D=1/11, open=10` **für dieses einzelne Partial-Paket**.
Sein Resolution-Index ist im zentralen Deep-Understanding-Register
eingetragen. Die aktive In-flight-Zuständigkeit der Elferrunde wurde auf
die **neun tatsächlich noch offenen** Ziele verengt: 8eb ist separat
registriert, 79c4 über dieses Paket. Die originale Elferrunde mit ihren
A/B-Reviews bleibt als Belegquelle unverändert.

Dies bleibt eine `ai_synthesis`-Entscheidung, keine menschliche oder
Bildfreigabe. Der `status` des Kompatibilitätsbelegs ist ein statisches
Materializer-Kennzeichen und kein dynamischer Registerstatus.
Die exakte, normalerweise ignorierte v1-`bundle/book.pdf` mit SHA-256
`ae4d7565a3e8766e9c8831dbf583763ee14cc31f69373b843de865f0518b4abe`
wurde nach Abgleich mit Bundle- und Render-Manifest gezielt zum Commit
vorgemerkt; ohne diese Datei ist die Review-Belegkette in CI nicht vollständig.
