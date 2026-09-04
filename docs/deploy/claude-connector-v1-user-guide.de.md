# SkillPilot mit Claude

SkillPilot verbindet deinen persönlichen Lernpfad mit Claude. Deine dauerhafte
SkillPilot-ID bleibt dabei vollständig in SkillPilot. Claude erhält weder eine
ID-Datei noch ihr Passwort.

> **Stand:** Claude v1 wird noch für die öffentliche Veröffentlichung
> vorbereitet. Nach der Freigabe ist das öffentliche SkillPilot-Plugin das
> bevorzugte vollständige Paket für berechtigte Nutzerinnen und Nutzer der
> bezahlten Claude-Angebote im Web-Chat.

## Einmal installieren

1. Öffne mit einem berechtigten bezahlten Claude-Konto **Plugins** und
   installiere oder aktiviere **SkillPilot Coach v1**.
2. Öffne im Plugin den Bereich **Konnektoren** und verbinde den enthaltenen
   Konnektor **SkillPilot**.
3. Bestätige den OAuth-Zugriff. Eine veröffentlichte Directory-Verbindung darf
   aktiv bleiben, wenn sie dieselbe SkillPilot-MCP-URL verwendet. Lege für diese
   URL keinen weiteren manuellen benutzerdefinierten Konnektor an.

Das Plugin stellt den wiederverwendbaren SkillPilot-Coaching-Skill bereit und
deklariert denselben entfernten Konnektor für bezahlten Claude Web-Chat. Der
entfernte Konnektor liefert alle vierzehn
SkillPilot-Werkzeuge und beide interaktiven Oberflächen für Lernzielbilder und
Karteikarten. SkillPilot Coach v1 enthält keine Hooks oder Subagents und sagt
keine Plugin-Unterstützung für Desktop-Chat oder Cowork zu. Zusätzliche
Oberflächen benötigen eigene Abnahmebelege und eine später geprüfte Version.

Bei jedem normalen Start oder Fortsetzen nennt Claude zuerst für jeden gültigen
Fachplan die heute fälligen, aktuell beherrschten, noch offenen und überfälligen
Lernziele. Ist kein Ziel aktiv und meldet das Backend einen verfügbaren
Kandidaten, setzt Claude automatisch mit dem vom Backend gewählten Ziel fort;
ein **Weiterlernen**-Knopf in der Webanwendung ist dafür nicht nötig. Plan- und
Landschaftskennungen werden nicht an Claude übermittelt.
Du kannst Claude auffordern, zu einem anderen Fach aus dem heutigen Plan zu
wechseln, zum Beispiel „Wechsle zu Physik“. Alle gültigen Fachpläne gelten
weiter; der Konnektor wechselt nur das aktuelle Lernfach und setzt dort mit dem
vom Backend gewählten fälligen Ziel fort.

Das Connectors Directory bleibt ein unabhängiger Weg nur für den Konnektor mit
eigenem Team-/Enterprise-Gate auf Herausgeberseite. Es ist keine Voraussetzung
für die Plugin-Einreichung und enthält nicht den Coaching-Skill. Plugin und
Directory-Eintrag dürfen gleichzeitig bestehen, wenn beide
`https://mcp-claude-v1.skillpilot.com/mcp` verwenden; Claude zeigt für diesen
gemeinsamen Server einen SkillPilot-Werkzeugsatz. Lege keinen zusätzlichen
manuellen benutzerdefinierten Konnektor mit derselben URL an, wenn bereits eine
der beiden Verbindungen besteht.

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
- direkt zwischen Fächern deiner heute gültigen Lernpläne wechseln;
- Verified Recall oder eine Prüfungsaufgabe durchführen;
- einen belegten Abschluss speichern.

Normale Karteikarten verändern den Lernzielabschluss nicht. Nur die dafür
vorgesehene überprüfte Abfrage kann einen Merkziel-Abschluss belegen.

## Beispielstart

> Ich möchte mit SkillPilot an meinem aktuellen Lernziel weiterlernen.

Claude soll dich verständlich ansprechen und technische Felder, interne IDs,
Toolnamen oder Zustandsversionen nicht in normale Lernantworten mischen.

## Wenn etwas nicht funktioniert

- **SkillPilot wird nicht gefunden:** Prüfe, ob SkillPilot Coach v1 aktiviert
  und der darin enthaltene Konnektor verbunden ist. Prüfe, ob ein veröffentlichter
  Directory-Eintrag exakt dieselbe SkillPilot-MCP-URL verwendet, und entferne
  nur einen zusätzlich manuell angelegten benutzerdefinierten Konnektor für
  dieselbe URL.
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
bleibt in SkillPilot. Für Claude gelten zusätzlich die Konto-, Bezahlplan-,
Regions- und Workspace-Regeln von Anthropic. Das Plugin ist in Claude Free
nicht verfügbar. Die Claude-Integration von SkillPilot richtet sich an
Erwachsene ab 18 Jahren. Eine native Nutzung des Plugins auf Mobilgeräten wird
nicht zugesagt.

- [SkillPilot](https://skillpilot.com)
- [Datenschutzerklärung des Konnektors](https://mcp-claude-v1.skillpilot.com/privacy)
- Hilfe: `support@skillpilot.com`

## Version

Plugin und Konnektor haben getrennte Veröffentlichungszyklen. Kompatible
Plugin-Verbesserungen erhöhen die SemVer-Version des Plugins; der
Directory-Slug `skillpilot` bleibt versionsneutral. Ein späterer echter Bruch
des Konnektorvertrags würde nur nach eigener Produktentscheidung in einer neuen
Hauptversion entwickelt. Claude v2 ist derzeit nicht vergeben.
