# Demoaufnahme für SkillPilot Coach v1 1.1.0

Die Aufnahmevorbereitung ist automatisierbar; eine echte Aufnahme in ChatGPT
und die abschließende menschliche Freigabe bleiben eigene Nachweise.
Das historische Video für 1.0.0 wird weder überschrieben noch wiederverwendet.

Stand der Vorbereitung: Die folgenden Inhalte sind das Aufnahmeziel, noch
kein bestandener Video-Nachweis. Vor `review-build` ist P3 noch um die echte
Kartenkomponente (Aufdecken und acht „Gewusst“-Bewertungen) zu ergänzen; das
bisherige Skript springt dort direkt zu Verified Recall. Die Videoarbeit wurde
für die Korrektur des Cockpit-Starts unterbrochen.

## Inhalt

Fünf Kapitel zeigen ausschließlich ChatGPT im Webbrowser:

| Kapitel | Sichtbarer Nachweis |
| --- | --- |
| P2 | Start aus SkillPilot, persönlicher Lernkontext, Orientierung und Lernzielvisualisierung |
| P3 | Kartenübung und davon getrennt vollständiger Verified Recall |
| P4 | Abgabe einer Prüfungsantwort und vollständige Bewertung |
| P5 | Fokusvorschlag und Änderung erst nach ausdrücklicher Zustimmung |
| D1 | Gemeinsamer Tagesplan für Mathematik und Physik, Weiterlernen und ausdrücklicher Fachwechsel |

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
2. Darin selbst bei ChatGPT anmelden, gegebenenfalls MFA abschließen und den
   aktuellen SkillPilot-Entwurf **1.1.0** in Developer Mode verfügbar machen.
   Login, Sicherheitsabfragen und Berechtigungsentscheidungen bleiben manuell.
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
