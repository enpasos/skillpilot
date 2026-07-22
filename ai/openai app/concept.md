# SkillPilot als zwei ChatGPT MCP Apps

Status: implementierter Mechanik-Prototyp; noch kein produktiver Lerncoach.

Die strategische Entscheidung und ihre Grenzen stehen in der
[Lerncoach-Zielarchitektur](../../docs/concept/runtime-workflows/skillpilot-owned-coach-architecture.md).
Die ausführbare Beschreibung steht in [README.md](README.md).

## Entscheidung

SkillPilot verwendet für Deutsch und Englisch **zwei getrennte Apps**:

- SkillPilot Coach Deutsch: `/mcp/de`
- SkillPilot Coach English: `/mcp/en`

Beide Apps besitzen eigene Toolnamen, Beschreibungen, UI-Ressourcen und Tests.
Nur die interne, providerunabhängige Zustands- und Fachlogik wird geteilt. Es gibt
keinen `language`-Parameter an der öffentlichen Schnittstelle.

Das ist bewusst mehr Konfiguration als eine automatisch lokalisierte App. Die
Trennung verhindert jedoch Spracherkennung als zusätzliche Fehlerquelle und
macht reale DE-/EN-Abnahmetests unabhängig voneinander möglich.

## Architekturidee

```text
ChatGPT-Nutzerkonto und gewählter OpenAI-Tarif
                       |
          ChatGPT-Modell und Chatoberfläche
                       |
        +--------------+--------------+
        |                             |
 SkillPilot App DE              SkillPilot App EN
 /mcp/de                         /mcp/en
        |                             |
        +--------------+--------------+
                       |
       SkillPilot-Fassade und persistenter Lernzustand
                       |
        Curriculum, Scope, Frontier, Mastery,
             Recall und Prüfungs-Receipts
```

Das Modell läuft beim Provider. Damit bezahlt die lernende Person die
Modellnutzung direkt über den dort verfügbaren kostenlosen Zugang oder ihr
festes Verbraucherabo. SkillPilot ruft für diesen Kanal keine nutzungsabhängig
abgerechnete Modell-API auf.

SkillPilot bleibt alleinige fachliche Zustandsquelle. Das Modell interpretiert
Sprache und bewertet Antworten, darf aber weder technische Auswahlwerte erfinden
noch den gespeicherten Lernzustand aus dem Chat rekonstruieren.

## Ersatz für die verlorene Action-Retention

Der Render-Tool-Response trennt drei Ebenen:

- `content`: kurze, sichtbare Zusammenfassung;
- `structuredContent`: modelllesbare, semantische Labels und Lerninhalte;
- Result-`_meta`: nur für das Widget bestimmte, opake Session- und
  Auswahlreferenzen.

Das Widget ruft Auswahl und Einreichung direkt über app-only MCP-Tools auf. Bei
einem späteren Chat-Turn lädt das Modell den aktuellen Zustand über ein
argumentloses Lesetool frisch aus SkillPilot. Damit muss kein verstecktes
Action-Ergebnis über den Gesprächskontext hinweg erhalten bleiben.

## Abgrenzung des Prototyps

Der Prototyp implementiert das MCP-Protokoll, die MCP-App-Ressource, die
Standard-Bridge, zwei getrennte Sprachverträge, persistente Demo-Zustände und den
vollständigen UI-Ablauf. Die lokale Host-Simulation verwendet bewusst keine
Modell-API.

Noch nicht produktiv implementiert sind:

- OAuth-Account-Linking von der jeweiligen OpenAI-App zum SkillPilot-Konto;
- die Anbindung der Demo-Zustandsablage an `CoachToolFacade` und die Datenbank;
- die vollständige Workflow-Parität für Curriculumwahl, Frontier, Mastery,
  Verified Recall und Prüfungen;
- öffentliche HTTPS-Hosts, reale ChatGPT-Abnahme und Plugin-Review.

No-Auth und der einzelne lokale Demo-Zustand sind ausschließlich für den
Mechaniktest zulässig. Sie dürfen nicht als öffentlicher Produktivdienst mit
echten Lerndaten betrieben werden.
