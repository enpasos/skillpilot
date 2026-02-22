# QA State: DE_HES_S_GYM_2_INFORMATIK

Diese Datei dokumentiert den Fortschritt der didaktischen Validierung des hessischen Informatik-Kerncurriculums (gymnasiale Oberstufe, KC 2024).

## 1. Status der Validierung
**Aktueller Fokus:** Struktur- und Konsistenzvalidierung abgeschlossen, Start der didaktischen Traversierung in Phase E.

### Abgehakte Knoten (bereits didaktisch unkritisch geprüft)
- **[155fb6f3-6fb2-440a-bf3f-267e478bf09d] Aufbau von Rechnernetzen erklären**  
  Einstieg ohne Vorbedingungen fachlich plausibel (E.1-Basiskonzept).
- **[6f71ad61-dd47-4d4b-8a65-5d3a37259e91] HTML-Grundgerüst anwenden**  
  Als Startkompetenz für E.2 sinnvoll.
- **[944546be-1a5b-4978-a1db-38a841d332ae] Grundlegende Datentypen und Variablen nutzen**  
  Richtiger Einstieg für E.3.
- **[80e9ab48-6b5f-4ccc-9a3a-d6255e597a15] Projekt strukturieren**  
  Als Planungs-Kickoff für E.4 sinnvoll.
- **[48d5278c-a076-4869-8ef6-56b318152ce3] Klassische Verfahren anwenden**  
  Einstieg in E.5 ist didaktisch schlüssig.

### In Evaluierung
**[global] Anforderungsbereichs-Kalibrierung (`demandLevel`)**
- **Status:** **REVIEW REQUIRED**
- **Findings:**
  - Die Zuordnung wurde granular pro Lernziel umgesetzt (nicht mehr starr nach Phase), was dem Zielbild entspricht.
  - Verteilung wirkt aktuell jedoch teilweise kontraintuitiv für eine Endversion (z. B. E-Phase ohne AB1-Ziele, Q3 mit mehreren AB1-Zielen).
  - Empfehlung: Didaktische Feinjustierung mit kuratierten Regeln pro Operatorfamilie und optionaler Mindest-/Sollverteilung je Phase.

**[global] Prozesskompetenz-Zuordnung (`processCompetencies`)**
- **Status:** **REVIEW REQUIRED**
- **Findings:**
  - `processCompetencies` ist jetzt vollständig befüllt (vorher leer), technisch valide und konsistent mit P1–P5.
  - Die Zuweisung ist derzeit heuristisch textbasiert und sollte für produktive Nutzung stichprobenartig fachlich gegengeprüft werden (v. a. in Q3/Q4-LK).

### Frontier (Effektive Voraussetzungen, Startzustand)
- [ ] [2e1fd034-14bd-478c-b32c-e0d9ca0c305b] Informatik (Cluster)
- [ ] [9037d005-eea9-45b3-b5ed-23cea87312e7] Einführungsphase Informatik (Cluster)
- [ ] [eaf23ba5-5147-4629-8d8d-7c516590c693] E.1 Internetprotokolle (Cluster)
- [ ] [bbf0e850-3ddf-4072-abd5-0f7cb917c028] E.2 HTML-Dokumente (Cluster)
- [ ] [2178fd3a-671d-407a-846f-1e89f712074e] E.3 Grundlagen der Programmierung (Cluster)
- [ ] [d5c13ca3-f39e-4b13-9fd8-61f5c6011454] E.4 Informatikprojekt (Cluster)
- [ ] [c507df58-edfd-45c1-b9fc-780b6e68fab5] E.5 Kryptologie (Cluster)
- [x] [155fb6f3-6fb2-440a-bf3f-267e478bf09d] Aufbau von Rechnernetzen erklären
- [x] [6f71ad61-dd47-4d4b-8a65-5d3a37259e91] HTML-Grundgerüst anwenden
- [x] [944546be-1a5b-4978-a1db-38a841d332ae] Grundlegende Datentypen und Variablen nutzen
- [x] [80e9ab48-6b5f-4ccc-9a3a-d6255e597a15] Projekt strukturieren
- [x] [48d5278c-a076-4869-8ef6-56b318152ce3] Klassische Verfahren anwenden

## 2. Akkumuliertes Wissen (State of the Learner)
- Grundlagen in Netzwerken, Web-Struktur, Basisprogrammierung, Projektplanung und einfacher Kryptologie aus der E-Phase sind als Einstieg konsistent modelliert.
- Phasenübergreifende `requires`-Ketten sind vorhanden und monoton (keine Zeitrichtungs-Verletzungen).

## 3. Lessons Learned / Design Rules
1. Für dieses Curriculum muss die Frontier auf **effektiven Voraussetzungen** (`requires` + vererbte Anforderungen via `contains`) basieren, nicht nur auf direkten `requires`.
2. Q1-Leitideen sind auf **I1/I3/I4** zu fixieren; I2 ist auf Q3 fokussiert.
3. Prozesskompetenzen P1–P5 sind semantisch vorgesehen und müssen im Validator explizit zugelassen sein.

## 4. Offene Findings & ToDos
- Fachliche Feinkalibrierung der `demandLevel`-Regeln (Operatorenmapping + Plausibilitätscheck je Phase).
- Stichprobenprüfung der textbasierten `processCompetencies`-Zuordnung mit didaktischem Review.
- Nächste Traversierungsschritte in E.1/E.2/E.3 fortsetzen (nach Klärung der beiden globalen Review-Punkte).
