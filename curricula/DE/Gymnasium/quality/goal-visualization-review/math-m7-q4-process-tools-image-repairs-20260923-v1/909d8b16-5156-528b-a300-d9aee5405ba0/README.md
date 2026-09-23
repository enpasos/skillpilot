# Bildkorrektur-Kandidat: Modell gezielt anpassen

Ziel `909d8b16-5156-528b-a300-d9aee5405ba0`.

Der aktive Bestands-JPG mit SHA-256 `55ef88a9a5c5f36693e344038cd20ea7d685978f62991f98ce2bdc2e3bdd7d33` ist hier bytegleich als `original-before-correction.jpg` gesichert. Die Formel verzweigt bei `x > 20`, während Bildtext und Begründung den günstigeren Preis „ab dem 20. Getränk“ nennen. Hinzu kommt „geringrn Steigung“. Das ist ein belegter fachlicher und sprachlicher Defekt trotz älterer AI-Hashfreigabe.

`candidate-v1.png` wurde am 23.09.2026 mit der eingebauten ChatGPT/Codex-Bildbearbeitung aus genau diesem JPG erzeugt. Der tatsächlich verwendete Bearbeitungsprompt steht in `prompt-v1.md`. PNG-SHA-256: `3fc9ee7f80a9445bea72c29a6fbd214f0e567480263b70c234dba94ded06d5ff`.

Erste Eigenprüfung: Der Kandidat korrigiert die Off-by-one-Formulierung und den Tippfehler; die Formel selbst bleibt korrekt. Die unabhängige Prüfung am Originalpixelbild hat jedoch zwei weitere belegte Fehler gefunden: Der Graph stellt die neue Steigung nur ungefähr als ein Viertel der alten dar, obwohl `1,80/2,00 = 0,9` gilt; die verbliebene Knick-Beschriftung ist sprachlich fehlerhaft. **Status: HOLD. Dieser Kandidat ist nicht freigegeben und darf nicht in die aktive Bildbindung gelangen.**
