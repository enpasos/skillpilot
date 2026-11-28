# Demoaufnahme für den ChatGPT-Eintrag von SkillPilot Coach

Die Aufnahmevorbereitung ist automatisierbar; eine echte Aufnahme in ChatGPT
und die abschließende menschliche Freigabe bleiben eigene Nachweise.
Das historische Video für 1.0.0 wird weder überschrieben noch wiederverwendet.

Stand am 28. November 2026 ist **1.2.1** im Git-Marketplace und im
offiziellen Portalentwurf. Für die Windows-Desktop-Beta ist ein Lernabschluss
im lokalen Codex-Textchat mit anschließendem Auslesen des gespeicherten
Lernstands dokumentiert. Für die geplante Webaufnahme braucht es einen neuen
Chat im Browser, in dem der vollständige Coach aktiv ist und mit einem
eigenen Testlernstand speichern darf. Der Werkzeugscan im Portal ist abgeschlossen.
Die Aufnahme für diese Version steht aus.

## Inhalt

Fünf Kapitel zeigen ausschließlich ChatGPT im Webbrowser:

| Kapitel | Sichtbarer Nachweis |
| --- | --- |
| P2 | Start aus SkillPilot, persönlicher Lernkontext, Orientierung und Lernzielvisualisierung |
| P3 | In Physik „Einzelimpulse und Gesamtimpuls auf einer Geraden bestimmen“ abschließen, die freigegebene Karte im Kartenfenster aufdecken und bewerten. Anschließend die Kartenprüfung anfordern und dem Speichern des Ergebnisses zustimmen. |
| P4 | Abgabe einer Prüfungsantwort und vollständige Bewertung |
| P5 | In der hessischen Mathematikansicht die „Einführungsphase“ als übergeordneten Fokus für „E.1 Funktionen und ihre Darstellung“ anzeigen lassen und erst nach Zustimmung dorthin wechseln. |
| D1 | Gemeinsamer Tagesplan für Mathematik und Physik, Weiterlernen und ausdrücklicher Fachwechsel |

Der reguläre SkillPilot-Knopf „Lernen mit ChatGPT starten“ öffnet die
Desktop-App. Für einen bereits eingerichteten Web-Testchat lässt sich die
frisch vorbereitete Startnachricht im manuellen Start von SkillPilot kopieren
und mit ausgewähltem Coach senden. Die Web-Aufnahmevorlage enthält noch
Selektoren des früheren Webstarts. Vor einer Aufnahme diesen Übergang im
Aufnahmeprofil erproben und die Selektoren auf den belegten Ablauf abstimmen.
Die Startnachricht während der Aufnahme ausblenden.

Bei der Probe für P3 den Titel des eingebetteten Kartenfensters am tatsächlichen
ChatGPT-Client prüfen. Der Aufnahmelauf muss „Antwort zeigen“ und „Gewusst“
in der sichtbaren Karte betätigen können.

Das letzte Kapitel zeigt die Abläufe D1/D3 aus der aktuellen Testsuite sowie
das Weiterlernen am aktiven Planziel. Es belegt nicht den separaten D2-Sonderfall
„kein aktives Ziel vorhanden“: Der normale WebGUI-Start kann bereits ein Ziel
setzen. Für diesen Sonderfall bleibt der eigene Testnachweis erforderlich.
Die Demo ersetzt weder die vollständige Testsuite noch die manuelle
Hostabnahme. Der Sprecher darf nur tatsächlich sichtbares Verhalten erklären.
Fehlende Widgets, falsche Ergebnisse oder ein nicht vollzogener Fachwechsel
werden nicht durch Sprechertext kaschiert. KI-Sprache wird als solche benannt.

## Einmalige Vorbereitung durch Matthias

1. Auf dem Aufnahme-Rechner ein **eigenes Chromium-Profil** für die Demo nutzen,
   nicht das alltägliche Browserprofil. Persönliche Daten und fremde Chats
   gehören nicht in dieses Profil.
2. Darin bei ChatGPT anmelden und die für den Webtest eingerichtete Verbindung
   auswählen. Vor der Aufnahme am Wegwerf-Lernstand prüfen, ob die
   Coach-Anweisungen geladen sind, der Abschluss gespeichert wird und er in
   einer frisch gestarteten Lernsitzung wieder sichtbar ist. Der persönliche
   Pro-Tarif erlaubt bei selbst hinzugefügten MCP-Servern nur Lesezugriffe.
   OpenAI beschreibt den lokalen Marketplace als Testweg für das vollständige
   Desktop-Plugin. [Web-Berechtigungen](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)
   · [Plugin-Test](https://developers.openai.com/plugins/deploy/connect-chatgpt#test-the-complete-plugin)
3. Alle Fenster dieses Profils schließen. Profil und API-Key ausschließlich
   lokal in der privaten `skillpilot-review.json` hinterlegen; nichts davon in
   Chat, Git, Shell-Befehle oder Video kopieren. Datei mit Modus `0600`,
   Profilverzeichnis mit `0700`; genaue Form und Befehle stehen in der
   [Aufnahmeanleitung](https://github.com/enpasos/skillpilot/blob/main/tools/demo-video/README.md#skillpilot-openai-review-demo).
4. Den vollständigen **deployed `serverBuild`-Commit** bereithalten.
   Der lokale HEAD allein beweist keinen Deploymentstand.

Danach genügt die Rückmeldung: „Browserprofil und private Datei sind bereit“
sowie deren lokale Pfade und der nicht geheime deployed Commit. Den Schlüssel
oder Zugangsdaten selbst bitte nicht mitteilen.

## Automatischer Ablauf nach dieser Übergabe

- `review-preflight` prüft Werkzeuge, Profilkopie und den erreichbaren
  ChatGPT-Editor. Er sendet keine Nachricht und nutzt keine kostenpflichtige
  OpenAI-API. Er beweist noch nicht, dass das richtige Plugin aktiv ist.
  Offene Testlernstände eines früher abgebrochenen Laufs werden zuvor gelöscht.
- `review-build` erstellt frische, wegwerfbare Testlernstände über die normalen
  Web-APIs. Die aufgezeichnete Weboberfläche erzeugt jeweils die Lernsession.
  Erst deren unveränderte Startnachricht wird an ChatGPT gesendet.
- Die Pipeline zeichnet den echten Browser auf, maskiert geschützte Angaben,
  prüft sichtbare Ergebnisse und erstellt englischen Sprechertext, Untertitel
  und MP4. Sprechertext und Sprachausgabe verbrauchen API-Guthaben.
- Testlernstände und die private Profilkopie werden bereinigt. Ein fertiges
  Manifest wird erst nach erfolgreichem Abschluss und Cleanup freigegeben.

Eine abgelaufene Anmeldung, geänderte ChatGPT-Oberfläche oder Sicherheitsabfrage
führt zu einem Stopp und gegebenenfalls einer manuellen Anpassung, nicht zu
einem Umgehungsversuch. API-Testdialoge und nachgebaute Oberflächen dürfen
nicht als echte ChatGPT-Aufnahme ausgegeben werden.

## Freigabe vor Veröffentlichung

- Aktueller deployed Commit, aktueller Plugin-Entwurf und alle fünf Abläufe
  sind nachvollziehbar zugeordnet.
- Video vollständig ansehen: lesbare Widgets, richtige Zahlen, tatsächliche
  Fortsetzung/Fachwechsel, passende Untertitel und wahrheitsgemäßer Sprechertext.
- Keine Kontodaten, dauerhaften Lernenden-IDs, OAuth-Daten oder Tool-Capabilities
  sichtbar. Aufgezeichnete kurzlebige Sitzungen sind nach Cleanup unbrauchbar.
- Nur das freigegebene MP4 erhält eine **neue öffentliche, content-addressierte
  HTTPS-URL**. Anonymen Download und SHA-256 prüfen. Rohaufnahmen, Screenshots,
  Traces und Manifest bleiben privat. Eine schwer zu erratende URL ist kein
  Zugriffsschutz.
- Veröffentlichung und Eintragung im Portal erfolgen erst mit ausdrücklicher
  Freigabe. Ein erfolgreicher lokaler Build ist keine Einreichung oder Annahme.

OpenAI verlangt für eine Remote-MCP-Einreichung eine Demo-URL, die die
Hauptanwendungsfälle und Tools auf den zugesagten Plattformen zeigt:
[offizielle Hinweise zur finalen Einreichung](https://developers.openai.com/plugins/deploy/submission-errors#final-directory-submission).
