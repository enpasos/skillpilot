# SkillPilot Claude Connector

[English guide](claude-connector-v1-user-guide.md)

Der SkillPilot Claude Connector verbindet Claude mit einem bestehenden
pseudonymen SkillPilot-Lernprofil. Claude kann damit das gewählte Curriculum,
den aktuellen Fokus, nächste Lernziele und den Lernfortschritt lesen. Auf
ausdrücklichen Wunsch der lernenden Person kann Claude Fokus und Fortschritt
auch aktualisieren.

Der Connector richtet sich an Erwachsene ab 18 Jahren und verwendet OAuth.
Neben der normalen Lernbegleitung im Chat kann er eine freigegebene
Lernzielvisualisierung zeigen und eine private Komponente für die normale
Karteikartenübung öffnen. Claude erhält weder die dauerhafte SkillPilot-ID noch
das Passwort der ID-Datei. SkillPilot erhält weder Claude Memory noch das
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
- „Zeige mir die freigegebene Visualisierung zu meinem aktiven Lernziel.“
- „Übe mit mir die heute fälligen Karteikarten.“
- „Starte Verified Recall für mein aktives Merkziel.“
- „Gib mir die aktive Prüfungsaufgabe und bewerte danach meine vollständige
  Antwort.“

SkillPilot unterstützt deutsch- und englischsprachiges Coaching. Claude sollte
in der Sprache der lernenden Person antworten.

Claude ist angewiesen, normale Coaching-Antworten an der lernenden Person
auszurichten: Lernziel, Rückmeldung und nächster Schritt sollen in verständlicher
Sprache erscheinen. Interne Felder, Sicherheitsmechanismen oder Prüftechnik soll
Claude nur bei einer ausdrücklichen Entwickler- oder Diagnosefrage erläutern;
geheime Werte darf es nie ausgeben.

## Karteikarten, Recall und Prüfungen

Die normale Karteikartenübung läuft in einer eigenen privaten Komponente.
Vorderseiten, Rückseiten und die Berechtigung zur Bewertung einer Karte bleiben
in dieser Komponente, statt in den Chat kopiert zu werden. Eine Kartenbewertung
ändert nur ihren Wiederholungsplan. Das Bearbeiten der heute fälligen Karten
schließt das Lernziel nicht ab und ersetzt nicht **Verified Recall**. Verified
Recall ist der getrennte Ablauf für belastbare Erinnerung ohne Hilfen.

Claude ist angewiesen, alle zurückgegebenen Recall-Fragen beziehungsweise die
vollständige Prüfungsaufgabe zu zeigen und die vollständige Antwort abzuwarten,
bevor geschützte Sollantworten, Lösungen oder Bewertungskriterien angefordert
werden. Der Connector übermittelt das vollständige Claude-Gespräch nicht an
SkillPilot. SkillPilot kann deshalb nicht technisch belegen, dass Claude
tatsächlich gewartet hat. Die weiteren Recall- und Prüfungsschritte bleiben
trotzdem durch kurzlebige Sicherheitsnachweise an den aktuellen autorisierten
Lernstand gebunden.

## Lese- und Schreibzugriff

Der Connector kann den aktuellen Lernkontext und die von SkillPilot
veröffentlichten Navigationsoptionen lesen. Mit Schreibfreigabe kann er auch
einen gewählten Fokus, das aktive Lernziel, belegten Fortschritt und
Recall-Ergebnisse speichern. Das Basiscurriculum und die Konfiguration des
persönlichen Curriculums kann er nicht ändern.

SkillPilot erhält jeden ausdrücklich ausgelösten Toolaufruf und die dafür
erforderlichen Argumente, darunter Feedback, das für eine gewünschte
Fortschrittsänderung übermittelt wird. Gespeichert werden die daraus
resultierenden kanonischen Lernstandsänderungen und die in der
Connector-Datenschutzerklärung beschriebenen kurzlebigen Sicherheitsdaten.
SkillPilot übernimmt nicht das vollständige Claude-Chatprotokoll.

Claude ist angewiesen, den Abschluss erst nach geeigneter sichtbarer Evidenz zu
speichern. Gespeichert wird dabei nur „abgeschlossen“ oder „nicht abgeschlossen“;
das ist keine Note. Den
Abschluss eines gewöhnlichen Lernziels korrigiert oder nimmt man im
[SkillPilot-Cockpit](https://skillpilot.com/) zurück, statt Claude einen
niedrigeren Wert erfinden zu lassen. Für Orientierungs- und Memory-Ziele gelten
eigene Abschlussregeln.

Hat eine andere SkillPilot-Anwendung den Lernstand zwischenzeitlich geändert,
muss Claude den aktuellen Kontext neu laden, statt den neueren Stand zu
überschreiben oder eine Änderung doppelt auszuführen.

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

Der Directory-Connector ist der einfachste und breiteste Installationsweg. Ein
optionales SkillPilot-Coach-Plugin kann denselben Connector zusätzlich mit
wiederverwendbaren Lernbegleitungs-Anweisungen für Claude Code und Cowork
bündeln. Werden beide installiert, entsteht weder ein zweiter SkillPilot-Dienst
noch ein zweites Lernprofil. Das Plugin hat eine eigene semantische Version:
kompatible Anweisungsverbesserungen können unabhängig erscheinen; eine
inkompatible MCP-, OAuth-, Identitäts- oder Lernstandsänderung benötigt weiterhin
einen getrennt geprüften Connector-Major und Endpoint.
