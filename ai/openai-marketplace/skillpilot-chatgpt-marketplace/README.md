# SkillPilot Coach für ChatGPT Desktop

Diese Anleitung gilt für **SkillPilot Coach 1.2.0** in der ChatGPT-Desktop-App
unter Windows. Du installierst den Coach über den Git-Marketplace und lernst
im **lokalen Codex-Chat** der App. Zum Lernen brauchst du kein Terminal.
In einem verwalteten Workspace kann für die Installation eine Freigabe nötig sein.

## 1. Plugin installieren und verbinden

1. Öffne in ChatGPT Desktop **Plugins → Hinzufügen → Marketplace hinzufügen**.
   Du kannst die Plugin-Ansicht auch über **Work** öffnen. Je nach
   Spracheinstellung heißen die Einträge **Add** und **Add marketplace**.
2. Füge diese Repository-Adresse hinzu.

   `https://github.com/enpasos/skillpilot-chatgpt-marketplace`

3. Wähle den Marketplace **skillpilot-chatgpt-marketplace**. Installiere
   **SkillPilot Coach** und prüfe unter den installierten Plugins, dass
   **Version 1.2.0** angezeigt wird und das Plugin aktiviert ist.
4. Öffne beim installierten Plugin die SkillPilot-Verbindung. Wähle bei Bedarf
   **Verbinden** (**Connect**) und bestätige die Freigabe. Falls die App nach
   der Registrierungsmethode fragt, wähle **Auto** oder **CIMD**.
   Du brauchst dafür keinen Client-Schlüssel. Die Verbindung führt zu
   `https://mcp-openai.skillpilot.com/mcp`. Wenn der Anmeldeknopf fehlt,
   nutze den [Windows-Ausweichschritt](#wenn-der-anmeldeknopf-fehlt).

### Wenn der Anmeldeknopf fehlt

Wenn der Git-Import den MCP-Server `skillpilot-coach` eingetragen hat und
ChatGPT Desktop keinen Anmeldeknopf anbietet, öffne **Windows PowerShell**.
Wenn `codex` in PowerShell verfügbar ist, führe diesen Befehl aus.

```powershell
codex mcp login skillpilot-coach --oauth-client-registration auto
```

Wenn PowerShell `codex` nicht findet, verwende die CLI aus der installierten
Windows-App.

```powershell
$app = Get-AppxPackage -Name OpenAI.Codex
$codex = Join-Path $app.InstallLocation 'app\resources\codex.exe'
& $codex mcp login skillpilot-coach --oauth-client-registration auto
```

Bestätige im Browser die SkillPilot-Freigabe für Lese- und Schreibzugriff auf
die separate Lernsitzung und für das Aufrechterhalten der Verbindung. Sobald
die Anmeldung erfolgreich beendet ist, starte wie unten beschrieben einen
**neuen lokalen Codex-Chat**.

**Wechsel von 1.1.2 oder älter.** Das frühere Plugin **SkillPilot Coach v1**
hat eine eigene Kennung. Installiere und verbinde **SkillPilot Coach** aus
dem Marketplace wie oben. Deaktiviere die alte Ausgabe und eine eventuell
installierte Archivkopie für den Test. Deinen bisherigen Lernstand kannst
du mit deiner SkillPilot-ID in einer neu gestarteten Sitzung weiterverwenden.

## 2. Eine Lernsession im lokalen Codex-Chat starten

1. Öffne [SkillPilot mit ChatGPT](https://skillpilot.com/?coach=chatgpt-desktop)
   und wähle **Jetzt lernen**. Verwende für den Test eine **neue SkillPilot-ID**
   und wähle **Sicher**, besonders am gemeinsam genutzten Gerät. Wenn du das
   Fortsetzen testen möchtest, bewahre deine Test-ID lokal geschützt auf.
2. Lege dein **persönliches Curriculum** fest und schließe die Auswahl ab.
   Wähle als Lerncoach **ChatGPT Desktop** und dann
   **Lernen mit ChatGPT vorbereiten**.
3. Wähle **ChatGPT-Startnachricht kopieren**. Wähle in der Desktop-App
   **Modus wechseln → Codex**. Öffne dann in SkillPilot den Link **Lokalen
   Codex-Chat öffnen** neben der Startnachricht. Der Link öffnet einen
   Chatentwurf mit dem Chip **SkillPilot Coach** und einem Beispieltext.
4. Wähle ein lokales Projekt, etwa in einem eigenen leeren Ordner, und prüfe
   **Dieser Computer**. Ersetze den Beispieltext durch die vollständige
   Startnachricht, lass den Plugin-Chip stehen und sende die Nachricht ab.
   Verwende für jeden neuen Lernstart eine frisch in SkillPilot erzeugte Nachricht.
5. Beginne im Textmodus und prüfe, ob der Coach dein Lernziel anzeigt. Danach
   kannst du die angebotenen Lernschritte ausprobieren und Rückmeldung geben.

Ein Windows-Vorabtest bestätigte den sichtbaren Lernstart in diesem lokalen
Codex-Chat. Lernen in **Work** ist ein separater Testpfad und für diese
Plugin-Version noch nicht bestätigt.

Falls der App-Link in SkillPilot fehlt, wechsle in der Desktop-App zu
**Codex**. Öffne dann **Ausführen** mit **Windows-Taste + R**, füge diese
feste App-Adresse ein und bestätige. Sie enthält nur den Chip und den
Beispieltext. Kopiere danach die vorbereitete Startnachricht erneut aus
SkillPilot und füge sie in den geöffneten Chat ein.

```text
codex://threads/new?prompt=%5B%40SkillPilot%20Coach%5D(plugin%3A%2F%2Fskillpilot-coach%40skillpilot-chatgpt-marketplace)%20How%20do%20I%20start%20a%20learning%20session%20with%20SkillPilot%3F
```

Die vorbereitete Nachricht enthält den Zugang zur kurzen Lernsession.
Teile sie ausschließlich mit dem ausgewählten Coach-Chat. Halte auch
SkillPilot-ID, PIN, OAuth-Werte und Screenshots mit diesen Angaben privat.
Wenn du einen Fehler meldest, genügen die ChatGPT- und Plugin-Version,
der Zeitpunkt, Text oder Voice und der konkrete Schritt, an dem der Fehler
auftrat. Ein bereinigter Screenshot kann helfen.
[Datenschutz](https://skillpilot.com/privacy) ·
[Nutzungsbedingungen](https://skillpilot.com/legal) ·
[Kontakt](https://skillpilot.com/imprint)

## 3. Marketplace und Plugin manuell aktualisieren

Öffne unter **Plugins** den SkillPilot-Marketplace und verwende dort
**Aktualisieren** oder **Synchronisieren**, wenn eine neue Testversion
bereitsteht. Aktualisiere auch das installierte **SkillPilot Coach**,
falls ChatGPT das separat anbietet. Prüfe anschließend die Versionsnummer
im installierten Plugin. Erzeuge für den nächsten Test in SkillPilot eine
neue Startnachricht und öffne einen neuen lokalen **Codex**-Chat.

Falls weiterhin **SkillPilot Coach v1** oder **1.1.2** angezeigt wird, prüfe
die Marketplace-Adresse und wiederhole den manuellen Abruf. Sobald **SkillPilot
Coach 1.2.0** installiert und verbunden ist, kannst du dieser Anleitung folgen.

## Paket und Nachweise

Die dauerhafte Plugin-Kennung lautet `skillpilot-coach`. Die Git-Auslieferung
gehört zur Desktop-Beta. Die Host-Prüfungen für diese Version werden separat
dokumentiert. `release-manifest.json` enthält die SHA-256-Prüfsummen für den
vollständigen Export. Mit `node validate.mjs` kannst du das Paket prüfen.

[Quellrepository](https://github.com/enpasos/skillpilot) ·
[Deutsche Betriebsanleitung](https://enpasos.github.io/skillpilot/deploy/openai-personal-marketplace-release.de/) ·
[OpenAI-Anleitung zur Plugin-Installation](https://learn.chatgpt.com/docs/plugins) ·
[Vorherige Desktop-Ausgabe 1.1.2](https://github.com/enpasos/skillpilot-chatgpt-marketplace/tree/cf5e23a7908412f3f28a1a66485d0e106c346154)
