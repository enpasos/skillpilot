# Lokaler Mathematik-Cockpitprototyp

**Aktuelle Integrationsvorschau:** [Vollständiges Cockpit mit optionaler Lernkarte](full-cockpit-README.md), lokal unter <http://localhost:5173/prototypes/full-cockpit.html>. Sie behält das gesamte bisherige Cockpit und ergänzt nur die Kartennavigation neben dem Baum. Die nachfolgend dokumentierte Drei-Sichten-Demo bleibt ein früherer isolierter Entwurf und ist nicht die aktuelle Integrationsrichtung.

Die Daten unter `cockpitMathData.ts` zeigen einen **exemplarischen Mathematik-Ausschnitt der Sekundarstufe II**, keine als vollständig freigegebene curriculare Lerneinheit. Die neuen `prototype:cockpit-math:*`-IDs sind ausschließlich Navigationsgruppen. Titel, Beschreibungen, echte Ziel-IDs, Voraussetzungen, Motivationsanker, Aufgaben, Lösung und normale Rubrik stammen aus den gebundenen Repositoryquellen.

Attribution der übernommenen eigenen Fachinhalte: SkillPilot / enpasos – Enterprise Patterns & Solutions GmbH, CC-BY-4.0 gemäß `LICENSING.md`. Die Extraktion erhält diese Texte; Quellpfade, Hashbindungen und Lizenzverweis stehen im Snapshot. Technischer Prototypcode und diese Entwicklerdokumentation folgen Apache-2.0.

## Lokal ansehen

Aus `app/` starten:

```bash
./node_modules/.bin/vite --config prototypes/vite.config.ts
```

Dann <http://localhost:5173/prototypes/cockpit.html> öffnen. Die drei Sichten
**Lernen**, **Lernkarte** und **Mein Plan** trennen Lernauftrag, Betrachtung und
Planfortschritt. Die Oberfläche startet beim aktiven Lernziel. Die Lernkarte
behält beim Wechsel ihren Bereich, die Auswahl und den Ausschnitt. Nur die
aktive Sicht ist sichtbar und bedienbar; unsichtbare Sichten fangen keine
Tastaturaktionen ab. Shift + Doppelklick taucht innerhalb der Lernkarte auf.

Oben lassen sich weiterhin drei fiktive Testprofile wählen. Ansicht, Auswahl,
Suchfokus und Vorschauen verändern weder Ergebnisse noch das aktive Lernziel.
Die vollständige Zuordnung des bisherigen Produktbestands und die noch offenen
Produktionsanschlüsse stehen in [Cockpit-Sichten](cockpit-context-design.md).

## Fester Zielumfang

Das vorhandene Lernzielbild erscheint genau einmal beim aktiven Fachziel und
öffnet per Klick eine Großansicht. Weitere Bildaktionen sind Icons ohne zweite
Vorschau. Die Prüfung hat kein eigenes Bild und erhält kein Ersatzbild des
Fachziels. Die originalen Bildmetadaten sowie Canonical-/Public-Hashes sind im
Snapshot gebunden. Tachos zeigen nur Zeitraum bzw. Gesamtfortschritt; ergänzende
Angaben stehen in Tooltips. Die bekannten Ziel-, Lernpfeil-, Haken- und
Schildicons behalten ihre Bedeutung.

Der Zielnenner beträgt genau **2**, einschließlich der Prüfung:

- `3016ec37-1c2e-47db-83f5-e767923bc97e`: Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen.
- `e98672c6-871a-5d0b-889c-5afc51040f0d`: Skalarprodukt über eine orthogonale Projektion erklären; bestehende Aufgabe mit 4 + 6 BE und normaler Bestehensgrenze 10/10.

Die bestehenden kanonischen Eltern werden als Herkunft angezeigt; sie sind nicht automatisch gültige Lerneinheiten. Die geprüfte hessische GK-Ansichtsdatei liefert für diese beiden Ziele **keine aufgelöste Placementreferenz** (`compositionReferences=[]`). Deshalb behauptet der Prototyp keine vollständige hessische GK-Angebotszuordnung. Ausgangspunkt ist der vorhandene kanonische Mathematikgraph und der historische Zwei-Ziel-Ausschnitt `math-dot-product-projection`.

Der fachliche Pfad umfasst A und Q sowie **acht externe Voraussetzungsatome**, darunter zwei vorhandene allgemeine Motivationsanker: zusammen zehn Ziele. Nur die acht externen Voraussetzungen bleiben außerhalb des Zweier-Zielnenners. Motivationstexte werden unverändert als allgemeiner Kontext verwendet; neue Motivationstexte oder Motivationsatome werden nicht erfunden. Weiteres Quellenmaterial des zusätzlichen Kartendecks bleibt als externer Kontext auflösbar. Insgesamt enthält der Snapshot 55 kanonische Ziele, nicht 55 persönliche Lernziele.

Die Gruppenkanten der Übersicht sind reine Anzeigeaggregation. `edgeProvenance` nennt für jede dargestellte Geschwisterkante die tatsächlichen ursprünglichen Goal-IDs und deren vorhandene `requires`-Beziehung. Eine zusammengefasste Vorbereitungskante ist **keine** Forderung nach Vollabschluss der ganzen Gruppe und erzeugt keine Zugangssperre. `goalById` bewahrt die originalen Voraussetzungen unabhängig von dieser Kartenprojektion.

## Testzustände und Karten

Alle Lernstände und Ereignisse sind ausdrücklich fiktive lokale Testprofile. Sie bilden keine zeitliche Folge und werden nicht mit einem Lernendenkonto verbunden:

| Testprofil | Explizites M | Demo-I | Gesamt | Heute / Woche explizit |
| --- | --- | --- | --- | --- |
| Noch keine Ergebnisse | leer | leer | 0/2 | 0 / 0 |
| Vor der Prüfung | A | leer | 1/2 | 0 / 1 |
| Prüfung bestanden – Demo | Q | A | 2/2 | 1 / 1 |

`deriveCockpitState` demonstriert die Own={A,Q}, P={Q}-Mengenformel. Die volle transitive Nachfrage wird auch durch explizit gemeisterte Zwischenziele verfolgt. I wird ausschließlich abgeleitet und weder gespeichert noch in M zurückgeschrieben. Prüfung, Karten und außerhalb liegende Voraussetzungen werden niemals implizit vergeben. Suche, Fokus und angezeigte Ebene ändern den Zweiernenner nicht. Periodenzähler deduplizieren tatsächliche explizite Testereignisse; eine implizite Anerkennung ist kein Tagesereignis.

Die vorhandene mathematische Aufgabe und ihre Rubrik sind als unveränderte Vorschau nutzbar. Der historische Review belegt einen damaligen begrenzten maschinellen Notations-/Inhalts-/Rechenstand, **keine neue Vertragsfreigabe nach dem korrigierten Anerkennungskonzept**, keine menschliche Erprobung und keine Lernwirksamkeit. Ein ausgewähltes Demo-Prüfungsprofil ist kein durch diese Oberfläche tatsächlich bewerteter Prüfungspass.

Der Memoryreview des gewöhnlichen Ziels sagt `no_memory_needed`. Das vorhandene breite Deck „Lineare Algebra & Analytische Geometrie“ wird daher nur als zusätzlicher Kontext mit **allen acht echten Karten** angeboten. Weder das breite Memoryziel noch eine erfundene Kartenuntermenge gehört zu Own oder zum Zweiernenner. Kartenansehen beziehungsweise Umdrehen bestätigt keinen verifizierten Abruf.

Die Coach-Startvorschau setzt ausschließlich den echten aktiven Zieltext in eine lokale Nachricht. Sie enthält keinen Startcode, Token, Lernenden- oder Sitzungsbezeichner und ersetzt keine gemeinsamen Coach-Instruktionen. Dieser Prototyp führt keine Produktionsaufrufe, OAuth-Verbindung oder Lernendenschreibvorgänge aus.

## Reproduzierbare Datenprüfung

Aus `app/`:

```bash
node prototypes/extractCockpitMathData.mjs --check
node --import tsx prototypes/cockpitMathData.test.ts
./node_modules/.bin/tsx scripts/testLearningCockpitPrototype.ts
./node_modules/.bin/tsc --project prototypes/tsconfig.json
```

Der Extraktor bindet acht begrenzte Quelldateien per SHA-256. Ohne `--check` regeneriert er ausschließlich `cockpit-math.snapshot.json`; er verändert keine Curriculum-, Backend- oder Produktdatei. Die Datenprüfung kontrolliert Zielnenner, binäre Fälle, geschützte Ziele, externe Vorbereitung, Kantenherkunft und explizite Tages-/Wochenereignisse. Browser- und Bedienprüfung der Cockpitoberfläche bleiben getrennte Nachweise.
