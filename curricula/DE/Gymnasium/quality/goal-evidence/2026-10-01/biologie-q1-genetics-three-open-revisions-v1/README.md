# Biologie Q1: drei offene D/P-Reparaturkandidaten (01.10.2026, v1)

**Status:** nichtblinde KI-Autorenvorbereitung; kein D-Beschluss, keine P-Freigabe,
keine Änderung an Kanon, Mapping, M7-Registry oder Lernendenstand. Die Vorschläge
stehen in `description-proposals.json` und `positive-evidence.candidates.json`.
Die drei IDs gehören zum fixierten Zwölfer-Batch
`m7-q1-genetics-twelve-current-20260930-v1` und bleiben darin offen. A und B
waren unabhängig; diese Vorbereitung kennt beide Befunde. Eine erneute D-Runde
muss auf **dem dann aktuellen Text** mit unabhängigem zweitem Review erfolgen.

## Quellen- und Bindungsstand

Das tatsächlich lokale amtliche [Hessische KCGO Biologie, Ausgabe 2024,
PDF-Stand 2025-10](https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf)
hat SHA-256 `52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558`.
Die gedruckte S. 38 nennt in Q1.1 Genmutationen mit den vier Typen; die
gedruckte S. 39 nennt in Q1.3 „Gentest und Beratung“ und „Gentherapie (Prinzip)“
für GK/LK. Erst auf LK-Niveau folgen „gentherapeutische Verfahren (an einem
Beispiel)“. Die lokalen HE-Source-Extraction-Zieltexte sind **Paraphrasen**
dieser PDF-Stichpunkte, nicht deren Wortlaut. Eine enger gefasste
Kanonbeschreibung darf nicht als wortgleiche amtliche Kompetenz ausgegeben
werden.

| Kanon-ID | HE-SourceGoal-ID; lokaler Span | Aktuelle HE-Bindung | Weitere Reichweite |
| --- | --- | --- | --- |
| `ffef97e3-12d6-5090-9816-46ab9e57fae2` | `ed4cdb55-2514-4483-9db6-eb4d74bd6663`; Q1.1.4 | 1:1, `exact`, GK/LK | BY direkt `exact`; MV, NI, RP, SH, SN, ST, TH weitere partielle/überprüfte Bindungen. |
| `73b66ead-e44a-5486-98e3-1fb3f99620a6` | `f78b155e-48db-403f-a138-ec22ac1b4671`; Q1.3.4 | 1:1, `exact`, GK/LK | Kanon nennt DE-BY und DE-HE; BY-Quellendeckung nach Textänderung separat prüfen. |
| `3891b735-9d0d-5eef-b653-6ad58b9181f6` | `b301e770-4900-468b-8179-ca80b2ff7214`; Q1.3.5 | 1:1, `exact`, GK/LK | Kanon nennt DE-BY und DE-HE; BY-Quellendeckung nach Textänderung separat prüfen. |

Die drei Ziele sind als `goalEntry` in den HE-SekII-GK- und LK-Source-Views
vorhanden. Die Ziel-IDs und Kanten könnten bei einer reinen Textrevision
bleiben, aber die Review-Fingerprints nicht. Die aktive Biologie-V-QA führt
alle drei als `missing` / `no_primary_link`; es gibt kein gebundenes Bild.
Die bisherigen A-Records lauten `atomic`, die M-Records `no_memory_needed`,
jeweils zum alten Text. Für diese drei Ziele findet sich im zentralen
Biologie-M7-Konfigurationssatz kein P-Profil. Der zuletzt gespeicherte zentrale
Bericht zählt Biologie mit 31/362 streng vollständig; dieser Kandidat ändert
diese Zahl nicht.

## Begründete Vorschläge

- **Mutation:** An gegebenen DNA-Sequenzen alle vier amtlichen Typen
  unterscheiden und eine **mögliche molekulare** Folge im bereitgestellten
  Genkontext begründen. Der Mutationstyp allein beweist weder Proteinwirkung
  noch Phänotyp. Die P-Fälle variieren ein Codon-Ereignis und
  Längenänderungen; eine Code-Tabelle wird gestellt.
- **Gentest:** Einen **anonymen vorgegebenen Testfall** mit Anlass, begrenzter
  Aussagekraft und mindestens einer Grenze für eine sachliche Beratung
  beurteilen. Ein positiver Befund ist keine sichere Erkrankungsprognose;
  ein negativer Test auf ausgewählte Varianten schließt andere Varianten
  nicht aus. Es werden keine persönlichen Familiendaten erfragt.
- **Gentherapie:** Die GK/LK-Grundidee an einem gegebenen Beispiel mit
  Körper-Zielzelle, ergänzter oder veränderter genetischer Information,
  beabsichtigter Funktion und Wirkungsgrenze erklären. Der Vorschlag lässt
  Einbringen eines funktionsfähigen Gens zu; „genetische Änderung“ allein
  wäre zu eng und könnte fälschlich nur Gen-Editierung meinen. Die LK-Ebene
  einzelner Verfahren wird nicht als Pflichtkern eingesetzt.

## Unabhängige nächste Prüfungen

1. Fachliche Prüfung der drei DE/EN-Kanonformulierungen gegen die **amtlichen**
   HE-Stichpunkte und alle tatsächlich betroffenen Länderbindungen; die
   alten HE-`exact`-Zuordnungen bewusst reklassifizieren oder mit begründetem
   Begriff von Deckung bestätigen. Source-Extraction-Paraphrase und PDF-Zitat
   getrennt halten. GK/LK-View-Projektionen und `requires`-Kanten prüfen.
2. Falls die Texte übernommen werden: eine neue aktuelle dreiseitige
   D-Kampagne vorbereiten, zwei unabhängige A/B-Reviews und Synthese gegen
   die neuen Fingerprints ausführen. Die alten Zwölfer-Records sind
   historische Befunde und kein D-Pass für die Neufassung.
3. A und M für den neuen Fingerprint gezielt neu entscheiden. Die alten
   `atomic`-/`no_memory_needed`-Entscheidungen sind fachliche Hinweise, keine
   automatische Neubindung.
4. Die bilingualen P-Profile aus diesem Paket an **den übernommenen**
   Kanontext und die spätere aktive V-Ressource binden, maschinell prüfen und
   unabhängig fachlich prüfen. Zwei neue Anwendungsfälle pro Ziel sind
   vorgesehen; ein bloß negatives Kontrollbeispiel zählt nicht als zweite
   positive Demonstration.
5. Für jedes Ziel ein fachlich korrektes Lernzielbild samt Quellen-/Asset-
   Bindung, tatsächlicher Sichtprüfung und V-QA erstellen. Erst danach den
   zentralen Fünf-Gate-Bericht erneut ausführen. Menschliche Freigabe und
   tatsächliche Lernendenleistung bleiben separate Schritte.
