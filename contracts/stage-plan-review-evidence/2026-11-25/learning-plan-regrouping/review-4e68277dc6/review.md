# Bestätigung der Lernplankorrekturen auf `4e68277dc6`

**ACCEPT für beide Korrekturen.** Die automatische Übergabe und die reguläre Fortsetzung speichern in den Physik-Gegenbeispielen jetzt denselben Auftakt und dasselbe Rückkehrziel. Bei der Klausuraktivierung bleibt ein bereits begonnenes Diagramm über den vorgeschalteten E.1-Auftakt hinweg erhalten.

Vorher ist `a6a1ea5912`, nachher dessen direkter Nachfolger `4e68277dc6` auf `fix/alte-lernplaene-nach-umgruppierung`. Die Vorher-Werte stammen aus den gebundenen H2-Läufen der dritten Runde. Alle sechs damaligen Prüfmethoden liefen am neuen Stand mit identischem Quelltext erneut. Die Tabellen geben den gespeicherten Lernerzustand wieder. Jede gezeigte Variante hatte dasselbe Ergebnis mit ein- und ausgeschaltetem `unitAssessmentPilotEnabled`. [Nachweis der dritten Runde](../round-3/independent-review.actual.json) · [Nachweis dieses Laufs](independent-review.actual.json)

## 1. Gewöhnlicher Plan nach bestandenem Ziel

**ACCEPT.** Beim Fall-Messprotokoll war die Kindöffnung bestanden und der E.1-Auftakt offen. Der nächste Block nannte die Kindeinheit und das t-v-Diagramm als Foki. Bei der regulären Fortsetzung wurde nach derselben Leistung der vorherige Kindfokus wiederhergestellt, damit der Vergleich mit der automatischen Übergabe vom gleichen Zustand ausgeht.

| Nach dem Fall-Messprotokoll | Revision | Aktives Ziel | Gespeicherter Fokus | Rückkehrziel |
| --- | --- | --- | --- | --- |
| Automatische Übergabe | vorher | t-v-Diagramm | Diagramm | keines |
| Reguläre Fortsetzung | vorher | E.1-Auftakt | Diagramm | t-v-Diagramm |
| Automatische Übergabe | nachher | **E.1-Auftakt** | Diagramm | **t-v-Diagramm** |
| Reguläre Fortsetzung | nachher | E.1-Auftakt | Diagramm | t-v-Diagramm |

Auch der zweite Gegenversuch ist behoben. Der Block umfasste „Magnetfelder“ und „Freier Fall schwerer Kugeln“. Nach dem Magnetfeldziel war „Messabweichungen und Fehlerarten unterscheiden“ (`8aff7aac`) fällig. Beide Öffnungen waren offen.

| Zwei Fachabschnitte | Revision | Aktives Ziel | Gespeicherter Fokus | Rückkehrziel |
| --- | --- | --- | --- | --- |
| Automatische Übergabe | vorher | Kindauftakt | `8aff7aac` | `8aff7aac` |
| Reguläre Fortsetzung | vorher | E.1-Auftakt | `8aff7aac` | `8aff7aac` |
| Automatische Übergabe | nachher | **E.1-Auftakt** | `8aff7aac` | `8aff7aac` |
| Reguläre Fortsetzung | nachher | E.1-Auftakt | `8aff7aac` | `8aff7aac` |

Der vollständige gespeicherte Rückkehrvermerk stimmt nach der Korrektur in allen zehn Vergleichspaaren überein. Ist der Elternauftakt bereits bestanden, wählen beide Wege weiterhin den offenen Kindauftakt. Das gilt auch für ein Ziel, das früher im Magnetfeldabschnitt lag. Bei gewöhnlichen Plänen prüft die Übergabe jetzt das angeforderte Ziel unter dem Fokus, den sie speichert. Der Klausurzweig der Übergabe verwendet weiter die bisherige Auswahl. [Messwerte je Fall und Pilotstellung](checks/physics-handoff-confirmation.actual.json) · [Übergabeentscheidung](https://github.com/enpasos/skillpilot/blob/4e68277dc632f3a5de62c78c34d5bfbbf9135754/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L10630) · [Regulärer Schreibpfad](https://github.com/enpasos/skillpilot/blob/4e68277dc632f3a5de62c78c34d5bfbbf9135754/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L11628)

## 2. Klausuraktivierung bei bereits begonnenem Ziel

**ACCEPT.** Vor der Aktivierung war das t-v-Diagramm (`1e459a1b`) unter der Kindeinheit tatsächlich aktiv. Messprotokoll und Kindauftakt waren bestanden. Die Klausur umfasste den heute fälligen E.1-Auftakt und das für die Folgewoche geplante Diagramm. Für beide bestand keine Anrechnung. Nach der Aktivierung wurde der Auftakt über `setMastery` bestanden und das anschließend gespeicherte aktive Ziel ausgelesen.

| Aufruf im selben Klausurumfang | Revision | Direkt nach Aktivierung | Rückkehrziel | Aktiv nach bestandenem Auftakt |
| --- | --- | --- | --- | --- |
| `activatePlans` | vorher | E.1-Auftakt | keines | keines |
| `activatePlans` | nachher | E.1-Auftakt | **t-v-Diagramm** | **t-v-Diagramm** |
| Direkter Schreibpfad mit angefordertem Diagramm | vorher und nachher | E.1-Auftakt | t-v-Diagramm | t-v-Diagramm |

Ist ein laufendes Ziel im Klausurumfang sofort zulässig, bleibt es weiterhin aktiv, auch wenn ein anderes Ziel früher fällig ist. Ohne ein aktives Ziel startet die frühere Alternative. Das gilt in allen acht Mathematik-Kontrollen. Im ursprünglichen Mathematikfall mit einem tatsächlich gesperrten Ziel wählt die Aktivierung das zulässige nächste Ziel. Die Ersatzwahl bleibt damit wirksam. [Erhaltungsentscheidung](https://github.com/enpasos/skillpilot/blob/4e68277dc632f3a5de62c78c34d5bfbbf9135754/backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java#L1573) · [Einstiegsprüfung im Klausurumfang](https://github.com/enpasos/skillpilot/blob/4e68277dc632f3a5de62c78c34d5bfbbf9135754/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L11732) · [Mathematikkontrollen](checks/math-controls.actual.json)

## Prüfumfang und Folge-Issue

| Gezielte native Ausführungen auf `4e68277dc6` | Anzahl |
| --- | ---: |
| Unveränderte Versuche der dritten Runde zu Abschnittsmenge, Öffnungen, Übergabe und Klausuraktivierung | 37 |
| Bestehende Regressionstests aus dem letzten Lauf | 17 |
| Neue Autorenregressionen für Übergabe und Klausuraktivierung, jeweils beide Pilotstellungen | 4 |
| **Gesamt** | **58** |

Alle 58 Ausführungen bestanden, ohne übersprungene Fälle. Für die Bestätigung wurden zusätzlich die beobachteten Zustände aus den Testausgaben verglichen. Die vollständige Backend-Suite war nicht Teil dieses gezielten Laufs. [Native Läufe und gespeicherte Zustände](checks/runtime.actual.json)

Beide unabhängigen Gutachter erhielten ausschließlich `git diff a6a1ea5912 4e68277dc6 -- backend/src/main AGENTS.md`. Beide bewerten jede Korrektur mit **ACCEPT**. [Unverändertes Gutachten A](reviewer-a.original.md) · [Unverändertes Gutachten B](reviewer-b.original.md)

Für das Folge-Issue bleiben zwei bereits bekannte Beobachtungen. Die Ansicht und die Rückgabe der regulären Fortsetzung können den Kindauftakt oder das Diagramm nennen, obwohl der E.1-Auftakt gespeichert wurde. Im Kontrollfall des Zwei-Abschnitt-Plans mit bestandenem Kindauftakt und offenem Elternauftakt kündigt die Ansicht den Elternauftakt an. Beide Wege behalten dort auf beiden Revisionen den Magnetfeldfokus und enden ohne aktives Ziel oder Vormerkung. [Vorher-Nachher-Kontrollen](checks/physics-handoff-confirmation.actual.json)
