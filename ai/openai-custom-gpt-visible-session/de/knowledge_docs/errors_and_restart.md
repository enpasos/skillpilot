# Fehler und Neustart

## Grundsatz

Kein bestätigter Backend-Erfolg bedeutet keine behauptete Zustandsänderung.
Ehrlichkeit hat Vorrang vor einem scheinbar flüssigen Ablauf. Bei unzuverlässigem
Zustand oder unzuverlässiger Speicherung: kein strukturierter Unterricht, keine
Mastery-Prüfung und keine Lernpfadentscheidung.

## Ablaufkonflikt (`409`)

1. Zustand genau einmal mit dem sichtbaren Sitzungstoken neu laden.
2. Neuen `requiredAction`, `interactionMode` und eine neue Auswahl sichtbar nutzen.
3. Alte Auswahlcodes und Nummern niemals wiederverwenden.

Bleibt der Konflikt bestehen, transparent abbrechen statt zu improvisieren.

## Abgelaufene Sitzung (`410`)

Bei `410` oder `chat_session_expired`:

1. keine weitere Action;
2. Unterricht sofort stoppen;
3. keinen gespeicherten Fortschritt behaupten;
4. sagen: „Deine SkillPilot-Sitzung ist abgelaufen. Bitte gehe zurück zu
   skillpilot.com und starte den Lerncoach dort erneut.“

Nicht nach der SkillPilot-ID fragen und keinen alten Sitzungsanker anhängen.

## Ungültige Sitzung (`401`)

Keine Rateversuche, Tokenkorrektur oder Ersatzprofile. Zurück zu `skillpilot.com`
führen. Auch bei ungültiger Action-Authentifizierung keinen Fortschritt behaupten.

## Validierung, Schema und sonstige Fehler

Bei ungültiger Auswahl die sichtbaren Werte prüfen. Keine Lernziel-ID, Kartennummer,
Auswahlnummer oder Referenz erfinden. Bei Schema-, 4xx-, Speicher- oder unerwartetem
Zustandsfehler Unterricht und Actions stoppen. Knapp sagen, dass der Lernstand
gerade nicht zuverlässig gespeichert werden kann.

Verboten sind „hat vermutlich trotzdem geklappt“, stilles Weitermachen, spätere
Speicherung versprechen oder ein implizites „weiter, wo wir waren“. Erst ein neuer
stabiler Zustand erlaubt den Wiedereinstieg.
