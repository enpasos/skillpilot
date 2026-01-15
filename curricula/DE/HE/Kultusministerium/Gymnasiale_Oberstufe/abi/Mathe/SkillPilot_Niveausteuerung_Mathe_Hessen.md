# Niveausteuerung für Abitur‑ähnliche Mathematikaufgaben (Hessen, KC 2024)
**Leitfaden für SkillPilot‑Aufgabengenerierung (GK/LK, Teil 1/Teil 2)**

> Zweck dieses Dokuments: Aufgaben so zu entwerfen, dass sie **zielgenau** (GK vs. LK, Teil 1 vs. Teil 2, Niveau 1 vs. Niveau 2) sind – und insbesondere im LK **nicht** nur Arbeitsschritte abfragen, sondern **mehrschrittige Lösungswege** erfordern, die Lernende selbst entwickeln.

---

## 1. Begriffe und Mapping

### 1.1 Kursniveau
- **GK**: Schwerpunkt **AB1–AB2**, mehr Führung ist zulässig, weniger formale Argumentationstiefe.
- **LK**: Schwerpunkt **AB2–AB3**, **höhere Selbstständigkeit**: Planen, Begründen, Bewerten, Modellieren, Entscheidungen unter Nebenbedingungen.

### 1.2 Prüfungsteil
- **Teil 1 (hilfsmittelfrei)**  
  Kurzformate ohne WTR/CAS. Auch kurze Aufgaben dürfen **nicht** reine „Kochrezepte“ sein.
- **Teil 2 (mit Hilfsmitteln)**  
  WTR/CAS sinnvoll integrieren. Tool‑Einsatz immer mit **Set‑up + Ergebnis + Interpretation + Plausibilitätscheck/Dokumentation**.

> Hinweis aus der Kalibrierung (Originalaufgaben, Hessen): Aufgaben werden häufig in **Teilaufgaben** gegliedert. Das ist **nicht automatisch** „zu leicht“. Entscheidend ist, ob die Teilaufgaben das **Verfahren verraten** („Ableiten → Einsetzen“) oder ob sie echte **Zwischenprodukte** abfragen (z. B. Modellansatz, Deutung, Validierung).

### 1.3 „Niveau 1/2“ (Abitur‑Label) vs. „AB1–AB3“ (KC)
Pragmatische Steuerungsregel (für Generierung/Qualitätssicherung):

| Abitur-Label | Typische KC‑Niveaus | Charakter |
|---|---|---|
| **Niveau 1** | AB1–AB2 | Basismethoden, Standardverfahren, kurze Begründungen |
| **Niveau 2** | AB2–AB3 | Mehrschrittig, **Entscheidungspunkte**, Argumentation/Modellieren/Reflexion |

**Warnsignal:** Wenn eine Aufgabe als „Niveau 2“ markiert ist, aber vollständig durch „Ableiten → Einsetzen → Ergebnis“ abgearbeitet werden kann, ist sie faktisch Niveau 1.

---

## 2. Aufgaben‑Metadaten
Jede Aufgabe erhält ein einheitliches Metadaten‑Header (YAML), damit Niveau/Komplexität **steuerbar und prüfbar** wird.

```yaml
id: LK-A-AN-02
course_level: LK            # GK | LK
exam_part: A                # Teil 1: A | Teil 2: B/C/D (oder nach eurer internen Logik)
domain: analysis            # analysis | linalg_geo | stoch
niveau: 2                   # 1 | 2  (Abitur-Niveau)
kc_ab_target: AB3           # AB1 | AB2 | AB3 (Zielschwerpunkt)
allowed_tools: none         # none | WTR | CAS
time_hint_min: 8            # grober Richtwert pro 5-BE-Task (optional)

skills:
  content_nodes: [271, 273] # KC-Knoten-IDs (Inhalt)
  process_nodes: [44, 53]   # K-Knoten-IDs (Prozess)
  notes: "Grenzwertthema / Parameterbestimmung"

operators: ["bestimmen", "begründen", "interpretieren"]

expected_work_products:
  - "mathematisches Modell/Ansatz"
  - "Rechnung/Herleitung"
  - "kurze Begründung/Interpretation"

complexity_constraints:
  min_steps: 3
  min_decision_points: 1
  min_justification_steps: 1
  representations: ["term", "context"] # term | graph | table | context | vector | diagram

be_allocation:
  total_BE: 5
  rubric:
    - {part: "Ansatz/Modell", BE: 1}
    - {part: "Rechnung", BE: 3}
    - {part: "Begründung/Interpretation", BE: 1}

quality_gates:
  - "Keine explizite Kochrezept-Zerlegung in a) Ableiten b) Einsetzen, wenn niveau=2"
  - "Mind. ein Schritt verlangt Auswahl/Planung (z. B. Methode, Gleichung, Nebenbedingung)"
  - "Ergebnis wird im Kontext gedeutet oder begründet"
  - "Wenn Tool: Eingaben/Output dokumentierbar + Plausibilitätscheck"
```

**Warum das wirkt:** Sobald du `min_decision_points` und `min_justification_steps` erzwingst, verschieben sich LK‑Aufgaben automatisch weg von „Rechenroutine“.

---

## 3. Niveausteuerung als Quality Gates

### 3.1 Grundregeln (alle Aufgaben)
1. **Operatoren ≠ Niveau**, aber sie sind Indikatoren:  
   „berechnen“ → häufig AB1; „untersuchen/beurteilen/erläutern“ → AB2/AB3.  
   Nutze Operatoren bewusst, nicht zufällig.
2. **Begründung/Interpretation** einplanen, sobald Kontext oder Tool vorkommt (und auch oft ohne Tool).
3. **Vermeide Trivialfälle** (Zahlen so gewählt, dass alles sofort „schön“ aufgeht), außer ausdrücklich Niveau‑1‑Training.
4. **Teilaufgaben sind erlaubt**, aber:  
   - nicht als „Algorithmus‑Gerüst“ (Kochrezept),  
   - sondern als Abfrage sinnvoller **Zwischenprodukte** (Modell, Gleichung, Argument, Interpretation).
5. **„Zur Kontrolle“-Angaben** (Zwischenergebnis/Ansatzformel) sind als Abitur‑Scaffolding üblich: Sie senken Rechenfrust, ohne das Niveau zu senken – solange die **Entscheidungsarbeit** bleibt.

---

### 3.2 Teil 1 (hilfsmittelfrei)

#### GK – Niveau 1 (5 BE)
**Zielbild:** 1–2 Standardverfahren, ggf. kurze Begründung oder Deutung in einem Satz.  
**Komplexität:** `min_steps: 2`, `min_decision_points: 0–1`.  
**Struktur:** a/b ist ok, wenn nicht jeder Schritt vorgegeben ist.

**Typische Muster**
- Steigung/Tangente/Nullstelle, einfacher Vektor‑Check (Rechtwinkligkeit), Baumdiagramm/bedingte Wahrscheinlichkeit.

#### GK – Niveau 2 (5 BE)
**Zielbild:** kleine Modellierung/Argumentation, 1 Entscheidungspunkt.  
**Komplexität:** `min_steps: 3`, `min_decision_points: 1`, `min_justification_steps: 1`.

**Muster**
- Optimierung mit Nebenbedingung (einfach), Bayes mit Interpretation, Lagebeziehung + Winkel, Flächeninhalt mit Vorzeichenwechsel.

#### LK – Niveau 1 (5 BE)
**Zielbild:** Standardverfahren + kurze Begründung (aber weniger geführt als GK).  
**Komplexität:** `min_steps: 2–3`, `min_justification_steps: 1`.

**Upgrade‑Heuristik:**  
Statt „a) Leite ab b) bestimme Tangente“ lieber „Bestimme die Tangente …“ (ein Auftrag) → Lernende müssen den Plan selbst setzen.

#### LK – Niveau 2 (5 BE)
**Zielbild:** kompakte Mehrschrittigkeit + Selbststeuerung.  
**Komplexität:** `min_steps: 4`, `min_decision_points: 1–2`, `min_justification_steps: 1–2`.

**Pflichtmerkmale (mindestens 1)**
- Parameter rückwärts bestimmen (Reverse Engineering)
- Aussage prüfen / Gegenbeispiel / Geltungsbereich
- Grenzwert + Deutung **nicht trivial** (z. B. Umformung, Approximation)
- Kombination zweier Inhaltsideen (z. B. Integral + Nullstellen, Geometrie + Optimierung)

---

### 3.3 Teil 2 (mit WTR/CAS)

#### GK Teil 2
**Zielbild:** Mehrschrittig, aber eher geführt; Tool für numerische Schritte.  
**Komplexität:** `min_steps: 4`, `min_decision_points: 1`, `min_justification_steps: 1`.

**Tool‑Regel GK:**  
Tool darf „rechnen“, aber Lernende müssen **(i)** Problemgleichung/Integral korrekt aufstellen und **(ii)** Ergebnis deuten (Einheit/Größenordnung/Grenzfall).

#### LK Teil 2
**Zielbild:** Mehrschrittig + Tool + **Bewerten/Entscheiden**.  
**Komplexität:** `min_steps: 5–7`, `min_decision_points: 2`, `min_justification_steps: 2`.

**Pflichtmerkmale (mindestens 1 pro Aufgabenkomplex)**
- inverse Fragestellung (Parameter oder n aus Bedingung)
- Modellvergleich/Sensitivität (Parameter ändern → Auswirkung)
- Güte-/Fehlerargument (Teststärke, Intervallbreite, Tool‑Grenzen)
- Existenz/Eindeutigkeit argumentieren (z. B. „genau eine Lösung“)

---

## 4. Stellhebel, um Aufgaben „hochzuziehen“ (ohne neuen Stoff)

### 4.1 Hebel (generisch)
1. **Scaffolding entfernen**: statt „a) Ableiten b) Einsetzen“ → „Bestimme …“ (ein Auftrag).
2. **Reverse Engineering**: Parameter aus Eigenschaften bestimmen (Tangente durch Punkt, Maximum bei x=…, Fläche=…).
3. **Nebenbedingung erzwingen**: Definitionsbereich, Ganzzahligkeit, physikalische Sinnhaftigkeit.
4. **Stückeln/Zeichenwechsel**: Flächeninhalt (nicht orientiert), Beträge/Nullstellen.
5. **Repräsentationen koppeln**: Term + Graph/Tabellenhinweis; Vektor + geometrische Deutung.
6. **Aussage prüfen**: „Gilt das immer? Wenn nein: Gegenbeispiel.“
7. **Vergleich/Entscheidung**: zwei Vorgehensweisen/Modelle vergleichen, Wahl begründen.
8. **Plausibilitätscheck verpflichtend**: Ergebnis prüfen (Einsetzen, Grenzfall, Einheit).
9. **Fehleranalyse / Lückentext**: vorgelegter Lösungsweg enthält Lücke → ergänzen/korrektur.
10. **Kasten‑Erklärung (abiturtypisch)**: Gib 2–4 Rechenzeilen (oder eine Formel) vor und verlange „Erläutere Zeile (1)–(3) und deute das Ergebnis im Kontext“.
11. **Tool‑Schritt aufwerten**: Tool nicht nur „liefert Zahl“, sondern „liefert Entscheidung“ (Schwellwert, Quantil, Parameterfit).

### 4.2 Anti‑Patterns (führen zu „zu einfach“)
- Teilaufgaben bilden ein vollständiges Rezept („Leite ab“, „Setze ein“, „Löse“) ohne eigene Strukturleistung.
- Methode wird explizit vorgegeben („Nutze Skalarprodukt/partielle Integration“), obwohl Niveau 2 intendiert ist.
- Zahlen sind so gewählt, dass fast alles im Kopf geht → keine Differenzierung.
- Reines Auswerten ohne Kontext/Begründung (insb. als Kalibrieraufgabe).

---

## 5. Skill‑Graph‑Integration (KC 2024)

### 5.1 Auswahl nach AB‑Label der Content‑Nodes
**Daumenregel:**
- Wenn `niveau=1`: überwiegend Content‑Nodes mit `AB1–AB2`.
- Wenn `niveau=2`: mindestens eine Content‑Node oder Prozess‑Node mit `AB3` **oder** eine AB2‑Node in Kombination mit AB3‑Prozess (Bewerten/Reflektieren).

### 5.2 Prozesskompetenzen als Levelhebel (entscheidend für LK)
Für **LK‑Niveau‑2** sollen Aufgaben mindestens einen dieser Prozess‑Knoten erzwingen (implizit oder explizit):

**Planen/Entscheiden**
- 44 (Lösungsplan skizzieren)
- 74 (Verfahren auswählen)
- 59 (Entscheidungen begründet treffen, LK)

**Reflektieren/Validieren**
- 53–56 (Deuten/Plausibilität/Modellgrenzen/Alternative)
- 126 (Grenzen der Werkzeugnutzung benennen)
- 131–133 (Aufwand/Genauigkeit vergleichen; Entscheidung dokumentieren, LK)

**Argumentieren**
- 17 (begründen oder widerlegen)
- 25–31 (Beweise strukturieren/präsentieren)
- 32–34 (Beweisstrategien wählen, Lücken schließen, LK)

**Modellvergleich (LK)**
- 82–84 (Alternative Modelle entwickeln/vergleichen/entscheiden)

### 5.3 Pattern‑Bibliothek pro Sachgebiet (Kurzfassung)

#### Analysis – Pattern (LK‑N2‑tauglich)
- Tangenten-/Normalenbedingung rückwärts
- Fläche als Betrag / Integrationsgrenzen bestimmen
- Parameter so bestimmen, dass „Maximum bei …“
- Modellvergleich exponentiell vs. logistisches Wachstum
- Numerik kritisch (Tool + Abbruchkriterium)

#### LA/AG – Pattern (LK‑N2‑tauglich)
- Gerade/Ebene aus geometrischer Bedingung konstruieren
- Abstand minimieren (Optimierung mit Parameter)
- Schnittfigur/Projektion
- Markov langfristig (Fixvektor, Konvergenz, Vergleich)

#### Stochastik – Pattern (LK‑N2‑tauglich)
- Test entwerfen und vergleichen (α, n, Teststärke/Fehler 2. Art)
- n planen für gewünschte Intervallbreite
- Modellwahl: Binomial vs. Hypergeometrisch
- Normalapproximation begründen + Fehler diskutieren

---

## 6. Schnelltest‑Rubrik: „Ist die Aufgabe wirklich LK‑Niveau 2?“
Bewerte jede Aufgabe auf 0–2 Punkte je Kriterium (max 10):

1. **Mehrschrittigkeit** (0: 1 Schritt · 1: 2–3 · 2: ≥4 verknüpfte Schritte)  
2. **Entscheidungspunkt(e)** (0: keiner · 1: 1 · 2: ≥2)  
3. **Begründung/Interpretation** (0: fehlt · 1: kurz · 2: wesentlich für Lösung)  
4. **Vernetzung** (0: nur ein Verfahren · 1: zwei Bausteine · 2: echte Kopplung)  
5. **Robustheit/Plausibilität** (0: keine · 1: leichte · 2: explizit erforderlich)

**Daumenregel:**  
- LK‑Niveau‑2 sollte meist **≥7/10** erreichen.  
- GK‑Niveau‑2 eher **5–7/10**.

---

## 7. Checkliste für eine komplette Klausur (Generierungs‑Validation)

### 7.1 Struktur‑Checks
- Teil 1: Anzahl/Verteilung gemäß Vorgaben (Pflicht/Wahl) erfüllt.
- Teil 2: Analysis‑Wahl + Pflichtbereiche.
- Alle drei Sachgebiete insgesamt abgedeckt.

### 7.2 Niveaudoing‑Checks
- Jede „Niveau 2“-Aufgabe erfüllt `min_decision_points ≥ 1` und `min_justification_steps ≥ 1`.
- LK insgesamt enthält ausreichend AB3‑Prozesskompetenzen (z. B. 53–56 / 59 / 82–84 / 126 / 131–133).

### 7.3 Tool‑Checks (Teil 2)
- Mindestens 1 Stelle mit **inverser** Tool‑Nutzung (Quantil/Parameter/n).
- Tool‑Ergebnisse werden **interpretiert** und **geprüft** (nicht nur hingeschrieben).
- Eingaben/Outputs sind dokumentierbar (keine „Blackbox“).

---

## 8. Minimal‑Transformationen: „Von zu leicht → passend“
Wenn eine LK‑Aufgabe als zu leicht bewertet wird, wende in dieser Reihenfolge an:

1. **Teilfragen zusammenziehen** (Scaffolding entfernen).  
2. **Reverse‑Engineering ergänzen** (Parameter aus Bedingung).  
3. **Begründung erzwingen** (Einzigkeit, Geltungsbereich, Plausibilität).  
4. **Zweiten Inhaltsbaustein koppeln** (z. B. Integral + Nullstellen).  
5. **Vergleich/Entscheidung** hinzufügen (Modelle, Strategien, Tool vs. Hand).

---

## 9. Kalibrierung anhand Originalaufgaben (Hessen 2007–2014; Stichprobe)

### 9.1 Beobachtungen aus Originalformaten
Aus den öffentlich zugänglichen Original‑Abituraufgaben (Hessen, GK/LK) lassen sich wiederkehrende **Niveau‑Signale** ablesen:

- **Kontext & Material ist Standard**, auch im GK: Diagramme/„Material 1/2“ oder Sachkontexte (z. B. Ornament, Weg, Zeitungsartikel) sind häufig Ausgangspunkt.  
- **„Erläutern“ ist ein echter Level‑Marker**: Selbst wenn gerechnet wird, wird oft ein **Ansatz** oder eine **Rechenzeile** erklärt („Erläutern Sie Ihren Ansatz“ / „Erläutern Sie Zeile (1)–(3)“).  
- **Scaffolding kommt vor, aber anders**: Statt „Ableiten → Einsetzen“ eher „Zwischenergebnis zur Kontrolle“ oder „gegebene Formel im Kasten“ → Lernende müssen **Bedeutung/Herleitung** plausibel machen.  
- **LK hebt sich durch Generalisierung/Parameter/Verknüpfung ab**: Funktionsscharen, Ortskurven, Zusammenhänge zwischen Ableitungen, Improper‑Integrale, Modellvergleich.  
- **Stochastik im LK**: nicht nur „Test durchführen“, sondern zusätzlich **Fehler 2. Art/Teststärke/Operationscharakteristik** und Interpretation im Kontext.  
- **Analytische Geometrie**: häufig Kombination aus Lagebeziehungen + Winkeln/Abständen + begründeter Modellannahme (z. B. „Warum ist Abstand paralleler Geraden sinnvoll?“).

### 9.2 Beispielhafte Rubrik‑Bewertung (0–2 je Kriterium)
*Hinweis:* Originalaufgaben sind oft **größer** als 5‑BE‑Mikroaufgaben. Bewertet ist hier der „typische Anspruch“ über Teilaufgaben hinweg.

| Beispiel (Jahr, Kurs, Bereich) | Mehrschrittigkeit | Entscheidung | Begr./Interpret. | Vernetzung | Plausibilität | Summe (0–10) | Was ist daran „abiturtypisch“? |
|---|---:|---:|---:|---:|---:|---:|---|
| GK, Analysis (2014) | 2 | 1 | 2 | 2 | 1 | 8 | Modellfunktion + Anwendung + Deutung; Erklären vorgegebener Rechenzeilen |
| GK, Geometrie (2008) | 2 | 1 | 1 | 1 | 1 | 6 | Standardverfahren, aber mit „Lösungsweg beschreiben“ |
| GK, Stochastik (2014) | 2 | 1 | 1 | 1 | 1 | 6 | Tabelle/bedingte Wkt. + Binomial + Interpretationsanteil |
| LK, Analysis (2014) | 2 | 2 | 2 | 2 | 1 | 9 | Schar/Ortskurve/Integral‑Argument + Kontextdeutung |
| LK, Geometrie (2013) | 2 | 2 | 1 | 2 | 1 | 8 | Ebenenschar + Orthogonalität + (zus.) Linear‑Algebra‑Modell |
| LK, Stochastik (2012) | 2 | 2 | 2 | 2 | 2 | 10 | Hypothesentest + Fehler 2. Art/Operationscharakteristik + Kontext |

### 9.3 Konsequenzen für SkillPilot‑Generierung
Wenn ihr Aufgaben **abiturähnlicher** machen wollt (ohne sie länger zu machen):

1. **Baue 1 Mini‑„Erläutern“-Moment ein** (Ansatz, Rechenzeile, oder Bedeutung einer Wahrscheinlichkeit).  
2. **Nutze „Kasten/Zur‑Kontrolle“ als Scaffolding‑Typ**, nicht „Rezept‑Teilfragen“.  
3. **Kontext ohne Overhead**: Ein Satz Kontext + Einheit + klare Frage → reicht, wenn Deutung/Plausibilität gefordert wird.  
4. **LK‑N2 braucht mindestens 1 Generalisierungs‑ oder Rückwärts‑Aspekt** (Parameter, „zeige dass …“, „gilt immer?“).  
5. **Stochastik LK**: Wenn Test vorkommt, dann mindestens ein Zusatz‑Kriterium (Fehler 2. Art, Teststärke, Operationscharakteristik, n‑Planung).  
6. **Geometrie**: Ein kurzer „Warum ist das Modell/der Abstand hier sinnvoll?“‑Satz hebt sofort Prozessniveau.

---


---

## 10. Erweiterung für „Realitätsnah & Komplex“ (Scenario-Focus)

Für Klausurvarianten, die explizit **„Realitätsnah & Komplex“** simulieren sollen (z. B. Klausurbeispiel 1), gelten zusätzliche Design-Prinzipien:

### 10.1 Komplexe Funktionsklassen
- **Nicht-Standard-Funktionen**: Statt einfacher Polynome oder $e^{kx}$ Nutzung von **Summen/Produkten** ($f(x) \cdot g(x)$ oder $e^{x} + e^{-x}$).
- **Konsequenz**: Ableitungen erfordern Produkt-/Kettenregel; Integrale erfordern Substitution oder Näherungsverfahren.
- **Zweck**: Testet „strukturierte Zerlegung“ komplexer Terme statt bloßem Auswendiglernen.

### 10.2 Explizite Bildbeschreibungen (Accessibility & Kontext)
- Jede Aufgabe mit **Kontextbild** benötigt eine **explizite Bildbeschreibung** im Markdown (als `![Alt-Text](...)` oder Textblock).
- **Zweck**: Stellt sicher, dass alle relevanten visuellen Informationen (Symmetrie, Schnittpunkte, qualitative Verläufe) auch textuell verfügbar sind (Simuliert „gründliches Lesen“).

### 10.3 Strukturierung LK Teil 2
- **Aufteilung statt Mischung**: Im LK Teil 2 kann eine große **Mischaufgabe** (z. B. Matrizen + Stochastik) oft besser in **zwei getrennte, tiefere Aufgaben** (z. B. C1 LinAlg + D1 Stochastik) zerlegt werden.
- **Vorteil**: Erlaubt pro Domäne mehr Tiefe (AB3-Prozesskompetenz) und klarere Trennung der Bewertungskriterien.

_Ende des Leitfadens._

