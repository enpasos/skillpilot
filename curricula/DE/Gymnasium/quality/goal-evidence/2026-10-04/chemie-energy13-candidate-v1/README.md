# Chemie Energy13: inaktive M7-Kandidaten

Dieses Paket enthält **13 aktuelle Kandidaten**, noch keine integrierten
Fünf-Gate-Abschlüsse. Es verändert keine kanonischen Ziele, aktiven Nachweise,
Registry, Karten, Bilddateien oder menschlichen Freigaben. Die Bilder in
`inspection-previews/` sind verkleinerte Sichtprüfkopien, keine Ersatzassets.

## Inhalt und Nachweisgrenze

- `positive-evidence.candidates.json`: vollständige deutsche und englische
  INNER-Profile des `positive-understanding-evidence-v2`-Vertrags im bestehenden
  Kandidatenformat. Je zwei konkrete unabhängige Fälle, fachliche Erwartungen,
  beobachtbare Leistungen und relevante Variationen. Bei späterer
  Materialisierung bleiben sie `ai_candidate`, `needs_human_review`, E1/G1.
- `description-decisions.candidates.json`: elf KEEP-Vorschläge und zwei
  begründete DE/EN-Revisionen. Zwei unabhängige Beschreibungsreviews und die
  unabhängige fachliche Profilprüfung sind noch ausstehend.
- `source-bindings.snapshot.json`: gelesene HE/BY-Ursprungsfenster mit
  exakten/partiellen Mappings sowie Referenzen auf weitere aktuelle Mappings.
  Letztere sind nachvollzogen, nicht neu fachlich freigegeben. Keine
  bundesweite Scope-Aussage wird aus der kanonischen Anwendbarkeit abgeleitet.
- `existing-gates.snapshot.json`: erhaltene A/M/V-Nachweise, tatsächliche
  Asset-Hashes und offene Bildentscheidungen. Alle 13 bestehenden A- und
  M-Fingerprints passen zum unveränderten aktuellen Ziel. A=`atomic`,
  M=`no_memory_needed`; hier werden diese Entscheidungen nicht wiederholt.
- `image-findings.md`: konkrete native Sichtbefunde für die beiden möglichen
  Textänderungen und der bereits dokumentierte fehlende Blei-Akku-Nachweis.
- `author-candidates.py`: ausschließlich auf dieses inaktive Verzeichnis
  begrenzte Erstellung der Kandidaten und Snapshots. Nicht während laufender
  unabhängiger Reviews erneut ausführen; der gespeicherte Stand ist deren
  Reviewgegenstand.

## Quellen und Kompetenzgrenzen

HE: Die amtliche lokale PDF wurde im Originalfenster **Druckseite 36,
E.4/E.5** mit der persistierten Extraktion abgeglichen. E.4 verlangt die
begrenzte Ressource und geopolitische Aspekte ausdrücklich. E.5 bezeichnet
**Wasserstoff** als Energiespeicher, die Brennstoffzelle als Funktionsmodell.
Das HE-Bullet zur Wasserstoffherstellung ist partiell an `b759d50d` und
`93b914d4-747d-5b22-90ff-ac6320514b44` (Wasserstoff als Energieträger)
gebunden. Die separate Herstellungs-/Speicherbewertung wird nicht in das
Brennstoffzellenziel hineinverlagert; der zweite Profilfall erklärt nur die
Systemrollen.

BY: Die originalen strukturierten Kompetenzformulierungen und ihre
deduplizierten Source-Extraktionsfenster wurden gelesen. `b95cdf98` stammt
aus C9-NTG.5.5/C10.3.5 (Sek I), die thermodynamischen und quellenkritischen
Atome aus C12-GA/EA.5 (Sek II), `b759d50d` zusätzlich aus C10.5.7 (Sek I).
Die kanonische E-Sammelstruktur verschiebt diese Herkunft und Altersgrenzen
nicht. Die Erdölproduktfälle verlangen keine Oberstufen-Thermodynamik.

| Zielpräfix | Kandidat | Zwei unabhängige Leistungsfälle |
|---|---|---|
| `2be9e61a` | REVISE: Endlichkeit/Geopolitik ergänzen | Offshore/Importweg; gering durchlässiges Gasgestein/lokale Förderung |
| `8ceb1749` | KEEP | Destillation/Nachfragegrenze; neue Crackproduktanalyse mit Atombilanz |
| `8ece9beb` | KEEP | Methan/Propan pro Mol/Masse; gleiche Nutzwärme mit Wirkungsgraden und CO2 |
| `b95cdf98` | KEEP | Kraftstoff/Kunststoff; Schmieröl/Bitumen mit verschiedenen Wirkungspfaden |
| `a0e8f0f2` | KEEP | Recherche zur Nutzwärme; unabhängige Recherche zur Werkstofffunktion |
| `8b98d8ba` | KEEP | Verkehrsmaßnahmen mit recherchierten Quellen; Werkstoffdossier und neue Quelle |
| `4928d5d1` | KEEP | Geschlossener Kolben/Wärme-Arbeit; starres/offenes/isoliertes System |
| `3e433dae` | KEEP | HCl-/HBr-Bindungsbilanzen; Wasserphasen als Grenze des Bindungsmodells |
| `4663fd80` | KEEP | Ammoniak/Stöchiometrie/Umkehr; Methan/Wasserphasen aus Bildungstabellen |
| `3c9bfa10` | KEEP | Quellenkritik zu FCKW-Nutzung/Freisetzung; HFKW ohne Ozon-Klima-Gleichsetzung |
| `27e4fe9b` | KEEP; V offen | Blei-Akku-Entladen/Säuredaten; Ladeumkehr und neuer tragbarer Einsatz |
| `b759d50d` | REVISE: Umwandler statt Speicher; EN-Reaktionen | PEM-Ladungs-/Reaktionsbilanz; unabhängige H2-Energiesystemkette |
| `6b82f80e` | KEEP | Li-Ionen-Wirtsmodell beim Entladen; Laden und Separatorfehler |

## Offene Schritte vor Integration

1. Zwei unabhängige D-Reviews sowie unabhängiges fachliches P-Review am
   unveränderten Kandidatenstand durchführen und Befunde auflösen.
2. Bei angenommenen Textrevisionen nur tatsächlich betroffene A/M-, Ziel-,
   Seiten-, Kontext-, Quellen- und Bildbindungen fachlich erneut prüfen.
   Ein Hash-Update allein ist keine fachliche Entscheidung.
3. `b759d50d` benötigt eine gezielte Bildkorrektur mit nachfolgender echter
   Sicht-/Fachprüfung. `27e4fe9b` hat noch kein Bild; die vorhandene technische
   Provider-Zurückstellung ist kein Gate-V-Abschluss. `2be9e61a` benötigt bei
   Textrevision eine gezielte unabhängige Bindungs-/Darstellungsprüfung; das
   unveränderte vorhandene Bild wird nicht automatisch verworfen.
4. Erst geprüfte Unterpakete registrieren/materialisieren. Die zehn Ziele
   mit KEEP-Text und vorhandenen V-Nachweisen können nach D/P-QS ohne
   historische A/M/V-Neuprüfung integriert werden, sofern ihre Kontextbindung
   durch integrierte Nachbaränderungen nicht betroffen ist.

Gezielte strukturelle Prüfung: **13/13 INNER-Profile erfüllen das geschlossene
V2-JSON-Schema**; Coverage-IDs existieren, je zwei Fälle vorhanden, E1/G1.
Die Zahlen-/Stoffbilanzen sind im Profil konkret angegeben. Dies ersetzt
weder unabhängige fachliche Reviews noch aktive M7-Abschlüsse.

**Strenger Nettozuwachs dieses inaktiven Kandidatenpakets: 0.** Neue
fachliche Abschlüsse: 0; wiederhergestellte aktive Bindungen: 0.
