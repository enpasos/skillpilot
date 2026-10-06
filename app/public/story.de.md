# SkillPilot: Lernen in 5 Schritten starten

**Stand:** 6. Oktober 2026

Dein Lernen. Dein Tempo. Wähle dein Curriculum, lass dich beim Üben begleiten und entdecke deine Erfolge im Cockpit.

Wähle **Claude**, **ChatGPT Desktop (Beta)** oder für einen gesondert eingerichteten Testzugang **Gemini (Beta)** als Lerncoach. Der ChatGPT-Lernstart über den Git-Marketplace funktioniert unter Windows. Claude nutzt **Claude Pro** und kann nach der Einrichtung auch in der Claude-App verwendet werden. Gemini ist derzeit ein kontrollierter Web-Test mit einem privat eingerichteten Testkonto; ein allgemeiner Zugang für mehrere Konten ist noch zu prüfen. Die [Zugangsübersicht](https://skillpilot.com/faq/coach-setup) erklärt die Voraussetzungen und Altersgrenzen des gewählten Anbieters.

Der Quickstart erklärt den Einstieg in ungefähr fünf Minuten. Das Video vom 13. September und ältere Bildschirmaufnahmen zeigen den Claude-Weg; die damalige Aussage zur ChatGPT-Verfügbarkeit ist überholt. Den Gemini-Einstieg beschreibt diese aktuelle Anleitung. Für die erstmalige Einrichtung kannst du dir so viel Zeit nehmen, wie du brauchst.

## 1. Deinen Lerncoach einmalig einrichten

### Claude

Du brauchst zuerst ein **Claude-Pro-Konto**. Melde dich damit in **Claude Web** an. Ist das aktuelle SkillPilot-Plugin bereits aus dem Marketplace installiert und verbunden, geh direkt zu Schritt 2 weiter.

1. Öffne **Einstellungen → Plugins → Hinzufügen → Marketplace hinzufügen → Aus einem Repository hinzufügen**.
2. Trage `enpasos/skillpilot-claude-marketplace` ein. Das ist der [öffentliche SkillPilot-Marketplace](https://github.com/enpasos/skillpilot-claude-marketplace). Lass **Automatisch synchronisieren eingeschaltet** und wähle **Synchronisieren**.
3. Suche anschließend **SkillPilot Coach v1** aus diesem Marketplace und füge das Plugin hinzu. Unter **Deine Plugins** soll es genau einmal installiert und aktiviert sein. Vergleiche die Version mit der [aktuellen SkillPilot-Installationsanleitung](https://skillpilot.com/plugins).
4. Öffne im Plugin **Konnektoren → skillpilot**. Wähle bei Bedarf **Verbinden** und schließe die angezeigte Anmeldung und Freigabe ab. Prüfe anschließend den Status **Verbunden**.

Die Marketplace-Verbindung ist auch dein Weg für spätere Updates. Automatische Updates wurden im Betatest beobachtet; der Zeitpunkt kann variieren. Für eine bestehende Installation folge dem Abschnitt **Aktualisieren** der aktuellen Anleitung. Sind Plugin und Konnektor bereit, öffne SkillPilot für die nächsten Schritte.

### ChatGPT Desktop (Beta)

1. Öffne in ChatGPT Desktop **Plugins → Hinzufügen → Marketplace hinzufügen**.
2. Füge die Adresse des [SkillPilot-ChatGPT-Marketplace](https://github.com/enpasos/skillpilot-chatgpt-marketplace) hinzu.
3. Installiere **SkillPilot Coach v1** aus diesem Marketplace. Prüfe, dass mindestens **1.1.1** installiert und das Plugin aktiviert ist.
4. Öffne die SkillPilot-Verbindung im Plugin und schließe die Anmeldung ab.

Für spätere Korrekturen aktualisiere den Marketplace und prüfe die tatsächlich installierte Plugin-Version. Die [ChatGPT-Anleitung](https://skillpilot.com/plugins#chatgpt-desktop) erklärt auch den Wechsel von einer Archivinstallation. Der normale Lernstart ist für ChatGPT Desktop vorgesehen; Browser, mobile ChatGPT-App und Voice Mode sind noch nicht bestätigt.

### Gemini (Beta): kontrollierter Web-Test

Du brauchst ein **persönliches Google-Konto ab 18 Jahren**, **US-Zugang**, eine **englische Gemini-Oberfläche** und aktivierte **Keep Activity**. Custom Apps und Skills werden schrittweise freigeschaltet; prüfe, ob dein Konto beide Funktionen anbietet. Die englische Oberfläche bestimmt nicht die Coach-Sprache: SkillPilot legt für diese Integration Deutsch oder Englisch beim Lernstart fest. Siehe [Google: Custom Apps](https://support.google.com/gemini/answer/17209137?hl=en-12) und [Google: Skills](https://support.google.com/gemini/answer/17094296?hl=en).

1. Verbinde die Custom App **SkillPilot** mit der Serveradresse und den privaten Verbindungsdaten, die für dein eigenes Testkonto eingerichtet wurden. Ein gemeinsamer öffentlicher Zugang wird derzeit nicht angeboten; die Produktionsaktivierung muss gesondert eingerichtet und geprüft werden.
2. Lade den **Gemini Coach-Skill** aus der [Gemini-Anleitung](https://skillpilot.com/plugins#gemini) herunter. Importiere die ZIP-Datei unter **Gemini Settings → Skills → Upload skill** und speichere den Skill.
3. Prüfe, dass die App verbunden und der Skill **skillpilot-coach-v1** verfügbar ist. Nach einer Skill-Aktualisierung importiere die aktuelle ZIP erneut.

Im kontrollierten Test wurden der Lernkontext geladen, zwei Lernziele erfolgreich gespeichert und das Lernen in einem neuen Gemini-Webchat fortgesetzt. Ein funktionierender Direktlink öffnet das Lernzielbild; ein eingebettetes Bild wurde nicht beobachtet. Weitere Konten, mobile Apps, Voice Mode sowie Kartenübung, Verified Recall und Prüfungen sind noch im tatsächlichen Gemini-Chat zu prüfen. Das [Integrationsrunbook](https://enpasos.github.io/skillpilot/deploy/gemini-integration/) dokumentiert den geprüften Umfang und die Einrichtung des Testzugangs.

## 2. Öffnen und deine SkillPilot-ID sichern

Öffne [skillpilot.com](https://skillpilot.com) und wähle **Jetzt lernen**. Lies die Hinweise und Nutzungsbedingungen, bevor du sie bestätigst.

Wähle **Neue SkillPilot-ID erstellen**. Deine dauerhafte ID ist der Schlüssel zu deinem Lernstand: Wähle **SkillPilot-ID geschützt speichern** und bewahre die verschlüsselte Datei und ihr Passwort sicher auf. Für den späteren Zugang brauchst du deine ID oder diese Datei samt Passwort.

Schon eine ID vorhanden? Gib sie in SkillPilot ein oder wähle **Geschützte Datei auswählen**. Bewahre deine dauerhafte ID und ihr Passwort privat auf.

## 3. Dein Curriculum wählen

Wähle **Weiter zu Schritt 2: Curriculum wählen** und entscheide, womit du lernen möchtest. Lege anschließend dein persönliches Curriculum fest, zum Beispiel Schulform, Lernstufe und Fächer sowie die dafür angebotenen weiteren Angaben.

Die Auswahl bildet deinen dauerhaften Lernrahmen. Deinen aktuellen Schwerpunkt kannst du später im Cockpit verändern. Prüfe die Zusammenfassung, bevor du weitergehst.

## 4. Deine Lernsession starten

Wähle im Abschnitt **Los geht’s** deinen Lerncoach.

**Claude:** Wähle **Schritt 2: Mit Claude starten**. SkillPilot öffnet einen neuen Claude-Chat mit der vorbereiteten Startnachricht. Sende sie unverändert ab. Schließe bei Bedarf die angezeigte Anmeldung oder Freigabe ab.

**ChatGPT Desktop:** Wähle **Lernen mit ChatGPT vorbereiten**, dann **ChatGPT-Startnachricht kopieren**. Öffne einen neuen Chat in ChatGPT Desktop mit **SkillPilot Coach v1**, füge die Nachricht ein und sende sie ab.

**Gemini:** Wähle **Gemini (Beta)**, bestätige die eingerichtete Custom App und den importierten Skill, dann wähle **Lernen mit Gemini vorbereiten → Startnachricht kopieren → Gemini öffnen**. Aktiviere im neuen Gemini-Chat mit **/** den Skill **skillpilot-coach-v1** und mit **@** die Custom App **SkillPilot**. Füge die vollständige Startnachricht ein und sende sie ab. Wenn Gemini beim Speichern **Allow** anbietet, prüfe die angefragte Aktion, bevor du sie freigibst. Prüfe den gespeicherten Fortschritt anschließend im Cockpit.

Jede Startoption erzeugt eine eigene Lernsession für den gewählten Anbieter. Die vorbereitete Startnachricht enthält eine **24 Stunden gültige Lernsession**. Halte diese Nachricht und deinen Lernchat vertraulich. Gemini-Werkzeugaufrufe brauchen mindestens eine Stunde Restlaufzeit; bereite daher spätestens nach 23 Stunden eine neue Lernsession vor. Für einen neuen Gemini-Chat aktiviere Skill und App erneut und sende dieselbe Startnachricht, solange diese Grenze noch eingehalten wird.

## 5. Lernen und Erfolge im Cockpit ansehen

Der Coach lädt deinen Lernkontext und begleitet dich beim aktuellen Ziel. Arbeite selbst, frage nach und bitte bei Bedarf um kleinere Schritte oder einen Tipp. KI kann Fehler machen: Prüfe Erklärungen und Bewertungen und begründe deine Sicht, wenn du anderer Meinung bist.

Über **Cockpit öffnen** siehst du deinen aktuellen Lernstand und das aktive Lernziel. Prüfe dort nach einem Abschluss deinen **gespeicherten Fortschritt**.

Zum automatisch angezeigten Lernziel kannst du **Feedback zu diesem Lernziel** abgeben, auch zum Verhalten des Coaches. Beschreibe das Problem knapp in eigenen Worten und konzentriere dich auf das Lernziel und deine Beobachtung. Halte persönliche Angaben und deine Startnachricht vertraulich.

## Mit Claude: Handy, Fotos und Voice Mode

- Öffne mit demselben Claude-Konto denselben Chat in der App. Innerhalb der 24 Stunden kannst du dort weiterlernen.
- Lade Fotos deiner Rechnung oder Skizze hoch oder nutze die Kamera direkt in der Claude-App. Das geht besonders praktisch mit dem Handy. Verdecke persönliche Angaben vorher.
- **Voice Mode funktioniert im laufenden Betatest.** Stockt die Sprachausgabe, warte kurz; nach bisherigen Erfahrungen spricht Claude anschließend weiter. Bei Bedarf kannst du im Textchat fortfahren.

Chat, Fotos und Sprache verarbeitet Claude. SkillPilot erhält über die Coach-Schnittstelle ausschließlich die vorgesehenen strukturierten Lernstandsdaten.

## Wenn etwas hakt

**Probleme beim Öffnen von Claude?** Erlaube Pop-ups für SkillPilot und versuche den Start erneut.

**Lernsession abgelaufen?** Starte von SkillPilot aus eine neue Lernsession und sende die vorbereitete Nachricht im neuen Chat. Deine gespeicherten Erfolge bleiben mit derselben SkillPilot-ID erreichbar.

**Gemini meldet fehlenden Toolzugriff?** Wähle die App mit **@SkillPilot** und den Skill mit **/** erneut aus. Die aktuelle Testverbindung benötigt spätestens nach einer Stunde oder nach einem Neustart der Testumgebung eine neue Anmeldung. Das erneute Verbinden verlängert deine Lernsession nicht. Kopiere keine Backend-Daten als Ersatz in den Chat.

**Speichern fehlgeschlagen?** Lass den Coach den aktuellen Stand prüfen und den Abschluss bei Bedarf erneut speichern. Prüfe anschließend das Cockpit; bei abgelaufener Session starte zuerst eine neue.

Weitere Antworten findest du in den [FAQs](https://skillpilot.com/faq) und den [Einrichtungsanleitungen für Claude, ChatGPT und Gemini](https://skillpilot.com/plugins).

Entdecke, was du kannst – und freu dich über jeden Erfolg.
