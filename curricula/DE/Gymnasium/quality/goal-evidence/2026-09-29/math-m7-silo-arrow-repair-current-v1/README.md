# Aktueller P-v2-Kandidat nach Futtersilo-Bildkorrektur

Das J10-Profil für `6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9`
ist an den aktuellen Zieltext und das korrigierte PNG mit SHA-256
`3be700f23f35ccfbf9a46a43f65018e78537a5482c35c97f3faed639101c28c5`
gebunden. Ich habe die tatsächliche Bilddatei in Originalgröße und
als 360-px-Gesamtansicht geprüft: Die zuvor auf die Zylinderwand
zeigenden Kegel-Zeiger fehlen; die Rechnungen bleiben korrekt.
Das ältere Siebener-Paket bleibt unverändert und seine alte
JPG-Bindung wird nicht als aktuelle Prüfung ausgegeben.

Die drei DE/EN-Anwendungsfälle wurden mathematisch erneut kontrolliert:

- **Silo:** `s=√13 m`, Dachwinkel
  `arctan(2/3)≈33,7°`, Außenfläche
  `48π+3π√13≈184,8 m²`, Volumen
  `78π≈245,0 m³`.
- **Dreiecksprisma-Zelt:** Dachseite
  `√(1,5²+1,8²)≈2,34 m`, Winkel
  `arctan(1,8/1,5)≈50,2°`, Stofffläche
  `8√5,49+5,4≈24,1 m²`, Volumen
  `10,8 m³`.
- **Kapselbehälter:** Länge `14 cm`, Fläche
  `56π≈175,9 cm²`, Volumen
  `(152/3)π≈159,2 cm³`; die Maße
  `14×4×4 cm` passen in `15×5×5 cm`.

Die ersten beiden unabhängigen Fälle belegen ausdrücklich Längen-
**und** Winkelbestimmung samt begründeter Flächen- und
Volumenmodellierung. Der dritte Fall ergänzt einen anders
zusammengesetzten Körper und die Maßprüfung. Der Materializer
verifizierte einen aktuellen Record; der P-v2-Check meldete
1 konfiguriertes Ziel, 0 Blocker, 0 Freigaben und
1 `needs_human_review`-Kandidaten. Keine menschliche Freigabe.
