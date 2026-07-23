# Phase 2 (nicht implementiert): sessiongebundener Server-Reload

> **Nicht mit der aktuellen Primaer-App ausfuehren.** Die Primaer-App stellt
> absichtlich genau zwei Tools bereit und speichert keinen Zustand:
> `create_mcp_retention_probe` und `verify_mcp_retention_probe`. Ein sichtbares
> `reload_mcp_retention_probe` in ihrem Toolkatalog wuerde die Primaermessung
> kontaminieren.

## 1. Zweck und Aussagegrenze

Diese spaetere Phase prueft nicht, ob das Modell ein altes MCP-Toolergebnis
behaelt. Sie prueft eine vom Modellgedaechtnis unabhaengige Zielarchitektur:

```text
erster Turn: create -> Server speichert Probe unter openai/session
zweiter Turn: argumentloser reload -> Server laedt dieselbe Probe neu
```

Ein Pass waere ein Nachweis fuer serverseitige Rehydration innerhalb der
getesteten ChatGPT-Session. Er darf nicht als Cross-Turn-Result-Retention
bezeichnet werden.

## 2. Gate vor der Implementierung

Phase 2 wird erst als eigene App-Version implementiert, nachdem die vier
Primaertests aus [TEST_PROTOCOL.md](TEST_PROTOCOL.md) ausgewertet sind. Sie braucht
einen getrennten Toolkatalog-Hash und eine neue Developer-Mode-App-Version. Die
Primaer-App und ihre Evidenz bleiben unveraendert reproduzierbar.

Der spaetere Katalog enthaelt zusaetzlich genau dieses dritte Tool:

- `reload_mcp_retention_probe`: leeres Eingabeschema, keine ID, kein Token und
  kein sonstiger Zustand als Argument.

Der geplante modelllesbare Reload-Vertrag ist:

```json
{
  "probe_id": "<serverseitig geladene UUID>",
  "token": "<serverseitig geladener synthetischer Wert>",
  "proof": "<serverseitig geladene Signatur>",
  "ok": true,
  "proof_valid": true
}
```

## 3. Erforderliche Servereigenschaften

- Request-`_meta["openai/session"]` muss ein String innerhalb einer eng
  definierten Laengengrenze sein; andere Typen, leere und uebergrosse Werte werden
  abgelehnt und niemals normalisiert oder in einen globalen Bucket gelegt.
- Der Rohwert wird weder geloggt noch ausgegeben. Der Store-Schluessel ist ein
  kryptografischer Hash beziehungsweise HMAC der Sessionkennung.
- Pro Session wird hoechstens die neueste synthetische Probe gespeichert.
- Store-Groesse und Lebensdauer sind hart begrenzt; Eintraege laufen automatisch
  ab und werden bei Kapazitaetsdruck deterministisch entfernt.
- Fehlt die Sessionkennung oder existiert kein Eintrag, liefert Reload eindeutig
  "nicht gefunden". Es gibt keinen Fallback auf die global letzte Probe, einen
  einzelnen Entwicklungszustand oder Daten einer anderen Session.
- Reload validiert das geladene Tupel erneut mit dem stateless Verifier. Nur
  `ok=true`, `proof_valid=true` und dieselbe `probe_id` duerfen als positiver
  Reload ausgegeben werden.
- Toolresultate haben keine Result-`_meta` und keine UI-Ressource. Der neue Pfad
  bleibt UI-los.
- Automatisierte Tests muessen mindestens fehlende/falsche/uebergrosse
  Sessionmetadaten, zwei getrennte Sessions, Ablauf, Kapazitaetsgrenze, fehlenden
  Eintrag, manipulierte Store-Daten und das Verbot des globalen Fallbacks abdecken.

## 4. Exakter spaeterer manueller Prompt

Erst nach implementiertem und verifiziertem Phase-2-Toolkatalog in einem frischen
normalen ChatGPT-Chat die folgenden zwei Nachrichten unmittelbar nacheinander
senden.

Erste Nachricht:

```text
Beginne einen transparenten, einmaligen Session-Reload-Test meiner SkillPilot MCP Regression App.

Rufe create_mcp_retention_probe genau einmal auf. Rufe in dieser Antwort weder verify_mcp_retention_probe noch reload_mcp_retention_probe auf. Wiederhole probe_id, token oder proof nicht in deiner gewoehnlichen Antwort. Antworte nach einem erfolgreichen Toolaufruf exakt mit MCP_RELOAD_READY und sonst exakt mit MCP_RELOAD_ERROR.
```

Zweite Nachricht:

```text
Lade jetzt die zuletzt fuer diesen Chat serverseitig gespeicherte synthetische Probe neu: Rufe reload_mcp_retention_probe genau einmal und ohne Argumente auf. Rufe weder create_mcp_retention_probe noch verify_mcp_retention_probe auf. Verwende fuer den Reload keine probe_id, keinen token und keinen proof als Argument oder in einer anderen Nutzereingabe.

Wenn das Reload-Ergebnis ok=true, proof_valid=true und eine probe_id sowie einen token enthaelt, antworte mit genau einer Zeile im Format MCP_RELOAD probe_id=<exakte probe_id> token=<exakter token>. Wenn diese Bedingungen nicht vollstaendig erfuellt sind oder der Toolaufruf scheitert, antworte exakt mit MCP_RELOAD_MISSING.
```

Werte nicht kopieren, Tooldetails erst nach dem zweiten Turn aufklappen und keine
Zwischenmeldung senden.

## 5. Spaetere Bestehenskriterien

- erster Turn: genau ein Create, kein Verify/Reload; gewoehnliche Antwort exakt
  `MCP_RELOAD_READY` und ohne Probe-Werte;
- Create-Audit: vorhandene gueltige Sessionmetadaten und eine frische `probe_id`;
- zweiter Turn: genau ein Reload mit leerem Argumentobjekt, kein Create/Verify;
- Reload-Audit: derselbe interne Session-Schluessel und dieselbe `probe_id` wie
  beim Create;
- geladenes Tupel wurde serverseitig erneut validiert, `ok=true` und
  `proof_valid=true`;
- finale Antwort exakt
  `MCP_RELOAD probe_id=<urspruengliche id> token=<urspruenglicher token>`;
- keine sichtbaren Probe-Werte vor dem Reload und keine Werte in
  Nutzernachrichten.

Ein positiver Finaltext ohne passendes serverseitiges Reload-Ereignis ist kein
Pass. Ein anderer oder fehlender Session-Schluessel, globaler Fallback,
abgelaufener Eintrag oder Backend-Neustart macht den Lauf negativ beziehungsweise
ungueltig entsprechend der protokollierten Ursache.

## 6. Bedeutung fuer eine spaetere Coach-Architektur

Auch ein stabiler Phase-2-Pass ersetzt keine Authentifizierung. In Produktion
braucht SkillPilot OAuth fuer Nutzerbindung und Berechtigung.
`openai/session` darf nur einen Chat mit bereits autorisiertem serverseitigem
Zustand korrelieren; sie ersetzt weder Login noch Mandantentrennung. Mehrere
parallele Coach-Sessions pro Nutzer, Ablauf, Loeschung, Replay-Schutz und ein
expliziter Sessionwechsel bleiben eigene Produktentscheidungen.

