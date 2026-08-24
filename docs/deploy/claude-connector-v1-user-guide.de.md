# SkillPilot mit Claude

SkillPilot verbindet deinen persönlichen Lernpfad mit Claude. Deine dauerhafte
SkillPilot-ID bleibt dabei vollständig in SkillPilot. Claude erhält weder eine
ID-Datei noch ihr Passwort.

> **Stand:** Claude v1 wird noch für die öffentliche Veröffentlichung
> vorbereitet. Nach der Freigabe ist der Eintrag im Connectors Directory der
> normale Installationsweg für Claude Web.

## Einmal installieren

1. Öffne in Claude Web **Konnektoren** und suche im Connectors Directory nach
   **SkillPilot**.
2. Wähle bei SkillPilot **Verbinden**.
3. Bestätige den OAuth-Zugriff.

Der Directory-Konnektor stellt die SkillPilot-Werkzeuge und beide interaktiven
Oberflächen für Lernzielbilder und Karteikarten in Claude Web bereit. Ein
separat veröffentlichtes Plugin kann den wiederverwendbaren Coaching-Skill mit
demselben entfernten Konnektor für Cowork und Claude Code bündeln. Dieses Plugin
ist optional und für Claude Web nicht erforderlich.

OAuth hält lediglich die technische Verbindung bereit. Der optionale Zugriff
`offline_access` enthält keine Lernenden-ID und startet oder verlängert keine
Lernsitzung.

## Jedes Mal Lernen starten

1. Öffne [Lernen starten](https://skillpilot.com/) bei SkillPilot.
   Der Link führt in den gemeinsamen SkillPilot-Webstart.
2. Wähle oder lade dort sichtbar deine SkillPilot-ID und bestätige Curriculum
   und persönliches Curriculum.
3. Wähle im letzten Schritt ausdrücklich **Mit Claude starten**. Du kannst dich
   bei jedem Start neu zwischen ChatGPT und Claude entscheiden.
4. SkillPilot öffnet Claude Web. Die vorbereitete Startnachricht ist bereits im
   Eingabefeld eingetragen. Prüfe sie und sende sie bewusst ab; du musst nichts
   kopieren oder einfügen. Claude kann dabei vor extern übergebenen Inhalten
   warnen. Das ist bei diesem Startweg erwartbar.

Dabei entsteht eine neue, undurchsichtige Kennung mit dem Anfang `spc_`. Sie ist
exakt 24 Stunden gültig. Claude verwendet sie nur für SkillPilot-Aufrufe; sie
soll nicht im Chat wiederholt oder weitergegeben werden. Nach Ablauf startest
du auf derselben Seite eine neue Sitzung. Der Konnektor muss dafür nicht erneut
verbunden werden.

Für die Übergabe an das Claude-Eingabefeld steht diese kurze Kennung vorübergehend
im `q`-Parameter der Claude-Webadresse. Teile weder diese Adresse noch einen
Screenshot davon. Die permanente SkillPilot-ID wird dabei nicht übertragen.

## Was du machen kannst

- deinen aktuellen Lernkontext laden;
- ein sinnvolles nächstes Lernziel wählen;
- ein Lernzielbild anzeigen;
- normale Karteikarten in der interaktiven Oberfläche üben;
- dich beim aktiven Lernziel coachen lassen;
- Verified Recall oder eine Prüfungsaufgabe durchführen;
- einen belegten Abschluss speichern.

Normale Karteikarten verändern den Lernzielabschluss nicht. Nur die dafür
vorgesehene überprüfte Abfrage kann einen Merkziel-Abschluss belegen.

## Beispielstart

> Ich möchte mit SkillPilot an meinem aktuellen Lernziel weiterlernen.

Claude soll dich verständlich ansprechen und technische Felder, interne IDs,
Toolnamen oder Zustandsversionen nicht in normale Lernantworten mischen.

## Wenn etwas nicht funktioniert

- **SkillPilot wird nicht gefunden:** Prüfe, ob der SkillPilot-Konnektor in
  Claude Web verbunden ist.
- **Die Sitzung ist abgelaufen:** Öffne
  [Lernen starten](https://skillpilot.com/) erneut. Eine
  24-Stunden-Sitzung wird nie durch OAuth verlängert.
- **Die falsche Person oder der falsche Lernstand erscheint:** Verwende den Chat
  nicht weiter. Starte in SkillPilot eine neue Sitzung mit dem richtigen
  Lernstand.
- **Claude zeigt eine interne Kennung:** Teile sie nicht weiter und melde den
  Vorgang an `support@skillpilot.com`.
- **Eine Lernstandskorrektur ist nötig:** Nutze das SkillPilot-Cockpit.

## Datenschutz und Zugang

SkillPilot erhält nur die ausdrücklich ausgeführten Konnektor-Anfragen, nicht
deinen gesamten Claude-Chat oder Claude Memory. Die dauerhafte SkillPilot-ID
bleibt in SkillPilot. Für Claude gelten zusätzlich die Konto-, Tarif-, Regions-
und Altersregeln von Anthropic; der geplante Directory-Eintrag richtet sich an
Erwachsene ab 18 Jahren.

- [SkillPilot](https://skillpilot.com)
- [Datenschutzerklärung des Konnektors](https://mcp-claude-v1.skillpilot.com/privacy)
- Hilfe: `support@skillpilot.com`

## Version

Der Directory-Slug `skillpilot` bleibt versionsneutral. Nach der endgültigen
Einreichung bleibt die v1-Linie kompatibel; ein späterer echter Vertragsbruch
würde nur nach eigener Produktentscheidung in einer neuen Hauptversion
entwickelt. Claude v2 ist derzeit nicht vergeben.
