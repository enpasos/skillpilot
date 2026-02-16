# Work Notes Physik (E-Phase Hierarchie)

Datum: 2026-02-16  
Datei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json`

## Ziel
Contains-Hierarchie im E-Phasen-Knoten KC-nah strukturieren (E.1 bis E.7), ohne atomare Ziele zu verlieren, und Hauptknoten konsistent benennen.

## Ergebnisse (umgesetzt)
1. Hauptknoten umbenannt:
   - `25bd8476-0c87-4777-b9f5-0bba9ad1b06e`
   - Neu: **„Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen“**
   - Begründung: „Mechanik“ allein war zu eng, da E.6 (Thermodynamik) und E.7 (Drehbewegungen) mitgeführt werden.

2. KC-konforme E-Feld-Benennungen vereinheitlicht:
   - `af70212d-...` -> `E.1 Bewegungen und ihre Beschreibung`
   - `52c3d2e8-...` -> `E.2 Newton'sche Axiome und Erhaltungssätze`
   - `242f0487-...` -> `E.4 Weitere Bewegungen`
   - `44882cb3-...` -> `E.5 Gravitation`
   - `98c7a125-...` -> `E.6 Grundlagen der Thermodynamik`
   - `3f0058c3-...` -> `E.7 Drehbewegungen`

3. Expliziten E.3-Wrapper ergänzt:
   - Neu angelegt: `0f3f9df2-37ee-4fd9-95b6-8786367d3794`
   - Titel: `E.3 Waagerechter Wurf und Kreisbewegung`
   - Enthält:
     - `b552ca1c-...` (Waagerechter Wurf und Superposition)
     - `a109d4fe-...` (Kreisbewegungen und Zentripetalkraft)
   - Requires: E.1 und E.2.

4. E.4 curricular bereinigt:
   - `5b3261e8-...` (Schiefer Wurf) liegt jetzt unter E.4.
   - `3d235018-...` (Reibungskräfte qualitativ verstehen) liegt jetzt unter E.4.
   - Im E.3-Untercluster `b552ca1c-...` wurde der schiefe Wurf aus `contains` entfernt.

5. Reihenfolge `contains` im E-Phasen-Hauptknoten auf KC-nahe Struktur gebracht:
   1. Methoden in der E-Phase
   2. E.1
   3. E.2
   4. E.3
   5. E.4
   6. E.5
   7. E.6
   8. E.7
   9. Lernkarten - E-Phase
   10. Übungen E-Phase Mechanik (Abi-Niveau)

## Nachweise / Checks
1. Leaf-Integrität (vorher vs. nachher im E-Phasen-Teilbaum):
   - leaf_before: `104`
   - leaf_after: `104`
   - missing: `0`
   - added: `0`
   - Ergebnis: **Keine atomaren Ziele verloren**.

2. Graph-Validierung:
   - Befehl: `npm run validate:graph` in `app/`
   - Ergebnis: `✅ 587 landscape(s) passed validation.`

3. Hinweis:
   - `npm run validate:graph` im Repo-Root schlägt fehl (kein Root-`package.json`); korrekt ist Ausführung in `app/`.

## Plan (nächste Schritte)
1. KC-Bullet-Mapping E.1-E.7 systematisch gegen `contains` prüfen (Abdeckungsliste pro Themenfeld).
2. Prüfen, ob Methoden/Lernkarten/Übungen dauerhaft im selben E-Phasen-Root bleiben sollen oder als parallele Cluster modelliert werden (didaktisch vs. formal).
3. `requires` im E-Bereich auf Über-Spezifikation prüfen (insb. bei Querverbindungen zwischen E.3/E.4 und Übungsset).
4. Optional: Schreibweise vereinheitlichen (`Newton'sche` vs. `Newtonsche`) und sprachliche Konsistenz in Titeln.
5. Nach jeder weiteren Änderung erneut:
   - `npm run validate:graph` (in `app/`)
   - Leaf-Vergleich im E-Teilbaum (keine atomaren Knoten verlieren).
