# SkillPilot Claude Connector

[English guide](claude-connector-v1-user-guide.md)

Der SkillPilot Claude Connector verbindet Claude mit einem bestehenden
pseudonymen SkillPilot-Lernprofil. Claude kann damit das gewählte Curriculum,
den aktuellen Fokus, nächste Lernziele und den Lernfortschritt lesen. Auf
ausdrücklichen Wunsch der lernenden Person kann Claude Fokus und Fortschritt
auch aktualisieren.

Der Connector ist textbasiert, richtet sich an Erwachsene ab 18 Jahren und
verwendet OAuth. Claude erhält weder die dauerhafte SkillPilot-ID noch das
Passwort der ID-Datei. SkillPilot erhält weder Claude Memory noch das
vollständige Chatprotokoll, verarbeitet aber die ausdrücklich aufgerufenen
MCP-Werkzeuge und deren Argumente, soweit dies zum Lesen oder Aktualisieren des
Lernstands erforderlich ist.

## In fünf Schritten starten

1. [SkillPilot](https://skillpilot.com) öffnen, ein Lernprofil erstellen oder
   fortsetzen und das gewünschte Curriculum auswählen.
2. Die verschlüsselte `.skillpilot`-ID-Datei herunterladen und ihr Passwort
   sicher aufbewahren. Weder Dateiinhalt noch Passwort in einen Claude-Chat
   einfügen.
3. In Claude **Anpassen > Connectors** öffnen. Sobald der Directory-Eintrag
   verfügbar ist, dort **SkillPilot** auswählen. Während der Testphase
   **Benutzerdefinierten Connector hinzufügen** wählen und exakt diese URL
   eintragen:

   ```text
   https://mcp-claude-v1.skillpilot.com/mcp
   ```

4. Die Authentifizierung immer verlangen, die von Claude erkannten gehosteten
   Client-Metadaten verwenden und keine eigenen Request-Header ergänzen. Die
   Verbindung starten, die Berechtigungen `skillpilot.read` und
   `skillpilot.write` prüfen und auf der SkillPilot-Autorisierungsseite die
   verschlüsselte `.skillpilot`-Datei sowie deren Passwort eingeben. Die
   Entschlüsselung erfolgt lokal auf dieser Browserseite; das Passwort wird
   weder an SkillPilot noch an Claude gesendet.
5. Einen neuen Claude-Chat öffnen, SkillPilot bei Bedarf im Connector-Menü
   aktivieren und zum Beispiel so beginnen:

   ```text
   Lade mit SkillPilot meinen aktuellen Lernkontext und hilf mir, das nächste
   sinnvolle Lernziel auszuwählen.
   ```

Auf der Autorisierungsseite heißen die drei Bedienelemente
**SkillPilot-ID-Datei (.skillpilot)**, **Passwort der ID-Datei** und
**Lokal entschlüsseln & verbinden**.

## Mögliche Anfragen

- „Was sollte ich in meinem aktuellen SkillPilot-Fokus als Nächstes lernen?“
- „Zeige mir meine möglichen Fokusoptionen und hilf mir bei der Auswahl.“
- „Erkläre mein aktives Ziel und prüfe danach mein Verständnis, ohne die Lösung
  vorwegzunehmen.“
- „Starte Verified Recall für mein aktives Merkziel.“
- „Gib mir die aktive Prüfungsaufgabe und bewerte danach meine vollständige
  Antwort.“

SkillPilot unterstützt deutsch- und englischsprachiges Coaching. Claude sollte
in der Sprache der lernenden Person antworten.

## Lese- und Schreibzugriff

Der Connector kann den aktuellen Lernkontext und die von SkillPilot
veröffentlichten Navigationsoptionen lesen. Mit `skillpilot.write` kann er auch
einen gewählten Fokus, das aktive Lernziel, belegten Fortschritt und
Recall-Ergebnisse speichern. Das Basiscurriculum und die Konfiguration des
persönlichen Curriculums kann er nicht ändern.

SkillPilot erhält jeden ausdrücklich ausgelösten Toolaufruf und die dafür
erforderlichen Argumente, darunter Feedback, das für eine gewünschte
Fortschrittsänderung übermittelt wird. Gespeichert werden die daraus
resultierenden kanonischen Lernstandsänderungen und die in der
Connector-Datenschutzerklärung beschriebenen kurzlebigen Sicherheitsdaten.
SkillPilot übernimmt nicht das vollständige Claude-Chatprotokoll.

Jeder Schreibvorgang ist an die aktuelle Zustandsrevision und einen
Idempotenzschlüssel gebunden. Hat ein anderer SkillPilot-Client den Stand zuerst
geändert, muss Claude den aktuellen Kontext neu laden, statt den neueren Stand
zu überschreiben.

## Trennen oder erneut verbinden

Die SkillPilot-Verbindung in den Connector-Einstellungen von Claude trennen,
wenn Claude nicht mehr auf das Lernprofil zugreifen soll. Der OAuth-Widerruf des
Connectors macht diese Claude-Verbindung ungültig, löscht aber weder den
SkillPilot-Lernstand noch Verbindungen anderer Anbieter.

Für eine erneute Verbindung SkillPilot wieder hinzufügen oder aktivieren und
den OAuth-Ablauf mit der verschlüsselten `.skillpilot`-Datei wiederholen. Danach
einen neuen Chat verwenden, damit Claude den aktuellen Werkzeugkatalog und
Lernstand lädt.

## Fehlerbehebung

- **Claude findet keine SkillPilot-Werkzeuge:** Einen neuen Chat öffnen und
  SkillPilot im Connector-Menü des Chats aktivieren.
- **Die Autorisierung ist abgelaufen:** Die Verbindung neu starten; offene
  Bindungsvorgänge sind absichtlich nur kurz gültig.
- **Ein Schreibvorgang meldet einen veralteten Stand:** Claude bitten, zunächst
  den SkillPilot-Kontext neu zu laden.
- **Die ID-Datei lässt sich nicht öffnen:** Prüfen, ob die verschlüsselte
  `.skillpilot`-Datei und das richtige Passwort verwendet werden. Datei und
  Passwort niemals per E-Mail an den Support schicken.
- **Das Problem bleibt bestehen:**
  [support@skillpilot.com](mailto:support@skillpilot.com) kontaktieren, ohne
  Zugangsdaten, OAuth-Codes, Token, dauerhafte SkillPilot-ID oder Lernantworten
  mitzuschicken.

## Datenschutz und Dienstinformationen

Vor der Verbindung die Connector-spezifische
[Datenschutzerklärung](https://mcp-claude-v1.skillpilot.com/privacy) lesen. Sie
erläutert die pseudonyme Bindung, die an Claude übermittelten Daten,
Speicherfristen und den Widerruf. Für Prompts, Antworten und den Chatverlauf in
Claude gelten zusätzlich die Bedingungen und Datenschutzregeln von Anthropic.

SkillPilot wird von der enpasos - Enterprise Patterns & Solutions GmbH
betrieben. Der Connector verwendet die eigene SkillPilot-API, enthält keine
gesponserten Inhalte und überträgt keine finanziellen Vermögenswerte.

## Version und spätere Änderungen

Die oben genannte öffentliche Adresse ist der stabile SkillPilot-Claude-v1-
Endpoint. Kompatible Korrekturen können dort bereitgestellt werden. Eine
inkompatible Protokoll- oder Identitätsänderung wird zunächst an einem getrennten
versionierten Endpoint entwickelt, damit der bestehende Connector während der
Migration verfügbar bleiben kann.

