# Bestätigung zum wiederholten Fachwunsch

**PASS auf `8cf0b20bd7700a67793380619dd1e898f6908a76`.** Die eigene öffentliche MCP-/H2-Probe besteht in beiden AutoPilot-Einstellungen. Beim ersten ausdrücklichen Physikwunsch ist Physik mit `canContinue=true` veröffentlicht. Der Schreibaufruf startet die Mathematikgrundlage `71cec9fb`. Nach diesem Start meldet der Status Physik weiterhin als Fach, jetzt mit `canContinue=false` und `current=false`.

| AutoPilot | Erster veröffentlichter Wechsel | Nächste Physikfrontier in Reihenfolge | Zweiter Physikwechsel veröffentlicht | Erzwungener zweiter Schreibaufruf |
|---|---|---|---|---|
| Aus | erfolgreich, `71cec9fb` aktiv | `71cec9fb`, dann `a4d4efe1` | nein | `CONFLICT`, laufendes Ziel bleibt erhalten |
| Ein | erfolgreich, `71cec9fb` aktiv | `71cec9fb`, dann `a4d4efe1` | nein | `CONFLICT`, laufendes Ziel bleibt erhalten |

Die E.1-Öffnung steht in beiden Läufen als zweiter erreichbarer Schritt tatsächlich hinter der laufenden Grundlage. Der benannte Fachwechsel wählt aus dieser Frontier immer den ersten zulässigen Schritt. Ein zweiter Fachwechsel könnte daher über diesen Schreibweg die Öffnung nicht starten. Das Unterdrücken dieses erneuten Angebots entspricht dem tatsächlich ausführbaren Fachwechsel. Bei beiden Pilotwerten führte jeder in diesem Ablauf veröffentlichte Physikwechsel zum Erfolg. Der erzwungene zweite Aufruf verwendet einen neuen Schreibschlüssel und prüft die unveränderte Ablehnung des nicht angebotenen Wechsels.

[Beobachtungen der drei Schritte je Pilotwert](raw/confirmation-8cf0b20bd7/observations.actual.json) · [Eigene Probe](raw/confirmation-8cf0b20bd7/TaskZProbe.methods.java) · [JUnit-Protokoll](raw/confirmation-8cf0b20bd7/result.xml.gz)
