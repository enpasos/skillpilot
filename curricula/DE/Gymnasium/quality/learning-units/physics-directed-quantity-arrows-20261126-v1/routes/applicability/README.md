# K4: eine einzeln und aktuell gebundene Applicability-Warnung

Die echte produktive Diagnose ist ausschließlich `APV-201` für K4, Dimension `jurisdiction`, ohne `value`. Die vierzehn genannten Länder sind genau die amtlich begründeten unteren Zielkontexte. Hessen und Baden-Württemberg bleiben eigene Vorbereitung ohne K4; alle reinen Oberstufenansichten ebenfalls. Drei eigene nationale Angebote werden getrennt gezählt und behaupten keine bundesweite amtliche Aufgabenpflicht.

Die zwei kontrollierten Gegenmodelle ändern keine Dateien: Ohne expliziten Override kompiliert K4 keine Landeszuständigkeit, 42 genehmigte Angebote gehen verloren und APV-203 entsteht. Ohne Vererbungsgrenze wird K4 sachlich falsch auf alle 16 Länder einschließlich HE/BW erweitert. Das Verschweigen der bewussten Länderentscheidung wäre keine korrekte warnungsfreie Modellierung. Die einzelne Warnungsannahme verwendet daher den vorhandenen Mechanismus wie N.

`warning-review.actual.json` bindet den vollständigen aktuellen V3-Zielhash, die genaue Diagnose, die vierzehn Jurisdiktionen, alle neunzig realen Ansichten und die 45 tatsächlichen Angebote. Es ist eine technische Einzelentscheidung des Implementierungsautors, keine neue unabhängige Inhalts- oder Aufgabenfreigabe. Die amtlichen Quellen begründen die Kompetenz; K4 bleibt eigenes Material. Alle 128 bisherigen Annahmezeilen bleiben unverändert und in derselben Reihenfolge.

`current-offer.after.actual.json` bestätigt 19 aktuell angenommene Physikwarnungen, null aktive und null veraltete. Der vorhandene Quellen-/Routentest prüft die aktuellen Review-/Offerbytes, den V3-Zielhash, die Diagnosenmeldung, alle Ansichtshashes und die vierzehn Scopes. Er verwirft eine HE-Erweiterung des Zielklons und eine geänderte Meldung trotz identischem Warnungsschlüssel. So ist die Annahme keine pauschale Schlüssel-Ausnahme.

`verification.actual.json` trennt den vollständigen älteren Zwölfertest vom aktuellen Fünfertest und dessen acht übersprungenen unveränderten Alttests. Die vollständige neue Dreizehnersuite läuft als gesonderter Wiederlauf; lokale Nachweise sind keine erfolgreiche main-CI oder integrierte Auslieferung.
