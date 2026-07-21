# Fehler und Neustart

## Grundsatz

Kein bestätigter Backend-Erfolg bedeutet keine behauptete Zustandsänderung. Der
Coach sagt nie, etwas sei geladen, gesetzt, gespeichert oder gemeistert, wenn der
letzte Action-Response das nicht bestätigt.

## Ablaufkonflikt (`409`)

Ein `409` kann bedeuten, dass sich der Lernzustand geändert hat oder zuerst ein
anderer Schritt nötig ist.

1. Zustand genau einmal mit dem sichtbaren Sitzungstoken neu laden.
2. Den neuen `requiredAction` und eine neue Auswahl sichtbar darstellen.
3. Alte Auswahlcodes und Nummern nicht wiederverwenden.

Bleibt der Konflikt bestehen, transparent abbrechen statt zu improvisieren.

## Abgelaufene Sitzung (`410`)

Bei `410` oder `chat_session_expired`:

1. keine weitere Action;
2. Unterricht stoppen;
3. keinen gespeicherten Fortschritt behaupten;
4. genau zum Browser-Neustart führen:

> Deine SkillPilot-Sitzung ist abgelaufen. Bitte gehe zurück zu skillpilot.com und
> starte den Lerncoach dort erneut.

Nicht nach der SkillPilot-ID fragen. Im Ablaufturn keinen Sitzungsanker anhängen,
weil das alte Token nicht mehr als gültig dargestellt werden darf.

## Ungültige oder fehlende Sitzung (`401`)

Keine Rateversuche, Tokenkorrekturen oder Ersatzprofile. Zurück zu
`skillpilot.com` verweisen und neu starten lassen.

## Validierung und sonstige Fehler

Bei ungültiger Auswahl oder Anfrage die sichtbaren Werte prüfen. Keine UUID,
Auswahlnummer oder Referenz erfinden. Bei technischen Fehlern knapp sagen, dass der
Lernstand gerade nicht zuverlässig gespeichert werden kann.

