# Exakte Befehle fuer den UI-losen ChatGPT-MCP-Test

Dieses Dokument ist ein Befehlsblatt fuer Menschen, keine dauerhafte
ChatGPT-Instruktion. Die Regression-App liefert die zugehoerigen engen
Server-Instructions. Nicht dieses ganze Dokument in einen Chat kopieren.

Fuer jeden Test einen frischen normalen ChatGPT-Chat oeffnen, nur die dedizierte
Regression-App aktivieren und ausschliesslich die unten angegebenen Befehle
senden. Ein Befehl ist nur gueltig, wenn die gesamte getrimmte Nutzernachricht
exakt diesem Text entspricht.

Die Primaer-App stellt genau zwei synthetische Testtools bereit:

- `create_mcp_retention_probe` erzeugt ein frisches signiertes Tupel aus
  `probe_id`, `token` und `proof`;
- `verify_mcp_retention_probe` prueft serverseitig, ob das vollstaendige Tupel
  unveraendert zurueckgegeben wurde.

Alle drei Werte sind zufaellige synthetische Testdaten. Sie sind weder
Zugangsdaten noch Lernzustand und verleihen keinerlei Berechtigung. Die normalen
Toolaufrufe und Toolergebnisse bleiben fuer den Tester sichtbar. Werte niemals
manuell aus einem Tooldetail in eine Nutzernachricht kopieren. Bei den
Zwei-Turn-Tests Tooldetails erst nach der zweiten Nachricht aufklappen.

## Test A: unmittelbares Lesen

In einem frischen Chat exakt senden:

```text
MCP_RUN_SINGLE
```

Erwartete finale Antwort:

```text
MCP_SINGLE probe_id=<exakte probe_id> token=<exakter token>
```

## Test B: Same-turn-Positivkontrolle

In einem weiteren frischen Chat exakt senden:

```text
MCP_RUN_CHAIN
```

Erwartete finale Antwort:

```text
MCP_CHAIN_PASS
```

## Test C: rohe Cross-Turn-Erinnerung ohne zweiten Toolaufruf

In einem weiteren frischen Chat nacheinander exakt senden:

```text
MCP_RUN_RETAIN
```

Erwartete erste Antwort: `MCP_RETAIN_READY`.

Unmittelbar danach exakt senden:

```text
MCP_RECALL_RETAIN
```

Erwartete finale Antwort:

```text
MCP_RETAIN token=<exakter token aus dem ersten Toolergebnis>
```

Das beobachtete Fehlersignal ist `MCP_RETAIN_MISSING`. Im zweiten Turn darf kein
Tool aufgerufen werden.

## Test D: backend-bestaetigte Cross-Turn-Weitergabe

In einem weiteren frischen Chat nacheinander exakt senden:

```text
MCP_RUN_RETAIN
```

Erwartete erste Antwort: `MCP_RETAIN_READY`.

Unmittelbar danach exakt senden:

```text
MCP_VERIFY_RETAIN
```

Erwartete finale Antwort:

```text
MCP_VERIFY_PASS
```

Im zweiten Turn darf nur `verify_mcp_retention_probe` und insbesondere kein
zweites Create aufgerufen werden.
`MCP_VERIFY_MISSING`, `MCP_VERIFY_FAIL` und `MCP_VERIFY_ERROR` sind getrennte
negative beziehungsweise nicht durchgefuehrte Ergebnisse und duerfen nicht als
Pass gezaehlt werden.

## Hilfe-Control

Der optionale befehlsfreie Control lautet:

```text
MCP_HELP
```

Erwartet wird exakt:

```text
MCP_RUN_SINGLE MCP_RUN_CHAIN MCP_RUN_RETAIN MCP_RECALL_RETAIN MCP_VERIFY_RETAIN MCP_HELP
```

Ein argumentloser sessiongebundener Reload ist in der Primaer-App absichtlich
nicht implementiert. Er darf erst mit der separat dokumentierten Phase 2 getestet
werden; siehe [PHASE2_SESSION_RELOAD.md](PHASE2_SESSION_RELOAD.md).
