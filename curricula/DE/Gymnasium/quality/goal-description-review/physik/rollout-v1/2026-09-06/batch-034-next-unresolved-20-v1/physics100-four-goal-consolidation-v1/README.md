# B034 + d367: fachliche Konsolidierung, authored candidate

Status: **lokal geprüft, nicht operativ angewandt**. Nur dieses Paket wurde geschrieben. Kein D/P-Register, kein historischer Blind-Review, kein Bild und keine Runtime wurde verändert. Modell-/Providermetadaten sind ehrlich `unknown`.

## Ergebnis

| Historische ID | Entscheidung |
|---|---|
| ea17b0af… | Vollständiger Cluster mit zwei neuen Leistungen: vorgegebener Audio-Licht-Versuch und quellengestütztes Multiplex-Modell. Modulation bleibt eigenständig am vorhandenen 122e. |
| 49872cc0… | Vollständiger Cluster mit vorhandenen 50877233 (Vergleich), 7d78da7f (qualitative Energiefreisetzung), bb5 (Strahlungsrisiken), 7e719 (Kernenergieurteil). Kein künstliches neues Energieatom neben cde9/5492. |
| 7df923a0… | Vollständiger Cluster mit zwei neuen Leistungen: Argumentationsbeurteilung zur Elemententstehung und bedingte Endstadienprognose aus Anfangsmasse/Massenverlust. Vorhandenes 6f bleibt die einfachere qualitative Lebenslaufbeschreibung; f675 bleibt quantitative HRD-Arbeit. |
| d36727cc… | Vollständiger Cluster mit neuem Bipolarschalterkern, neuem bistabilen Flipflop und wiederverwendetem, präzisiertem af50-Verstärkerziel. |

Genau sechs neue Atome, vier erhaltene IDs als fachliche Cluster: **724 → 730 Ziele, 470 → 472 Atome, 105 → 109 Areas**. Andere K-Kategorien unverändert. Keine neuen `splitFromCanonicalGoalId`-Felder und keine exakten Altkanon-ID→Kind-Mappings; historische Mastery wird nicht in neue Kinder kopiert.

Die sechs IDs stehen vollständig in `field-leased-plan.json` und `verification.json`. `authoring-spec.mjs` enthält bilinguale kanonische Texte, genaue Originalklauseln, einzelne Mappingentscheidungen, Kurs-/Stufeneinschränkungen und individuelle A/M-Begründungen. `evidence.mjs` liefert für sechs neue Atome und das präzisierte af50 jeweils drei positive Verständnisfelder in DE/EN. Diese sind **unregistrierte Autorenbausteine**, keine native P-Freigabe oder vorgetäuschte Profile-Review.

## Quellen und Scope

Der vorhandene B034-Sourceaudit wurde vollständig gelesen; zusätzlich wurden die angegebenen HE/BW/HH/RP-Original-PDF-Seiten und jede betroffene BY-Original-JSON-Klausel geprüft. Die fünf lokalen Originaldateien sind per SHA-256 gebunden.

Bayern EA5 verlangt fünf ausgewählte Schülerexperimente; die übrigen aufgeführten Experimente bleiben Demonstrationsversuche mit den Kompetenzaspekten. Es wird **keine individuelle Aufbaupflicht für alle sieben** eingeführt. Quelle: [amtlicher LehrplanPLUS, Physik 13 erhöht, Abschnitt EA5](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/physik/erhoeht).

- Neue Audio-/Multiplexziele: BY SekII LK/EA5.2; in GK und anderen ungeprüften Landesprofilen ausdrücklich `prerequisiteOnly`.
- Neue Sternleistungen: BY SekII GK im GA-ASTRO4.4-Zweig; keine neue EA/LK-Sternpflicht aus der vorhandenen breiten BY-View-Vererbung.
- HH S.33: vorhandenes 6f für qualitative Entwicklung/Endstadien, **nicht** die beiden neuen BY-Leistungen. Die zwei Extraktionszeilen sind keine zwei unabhängigen Originalbelege.
- HE Q4.5 GK/LK: pnp **oder** npn, Schalter und Flipflop. Verstärker nur LK; Demonstration und/oder Schülerexperiment, keine universelle individuelle Aufbaupflicht.
- RP Elektronik S.38/68: gewähltes Wahlthema, Transistor als Schaltelement; die unpassende RP→af50-Komponente entfällt.
- Nationale Views sind ein fachlicher Gesamtatlas und keine Behauptung bundesweit identischer Pflichtinhalte.

Explizite neue Zielplätze sind kleine fachliche/sourcebezogene View-Strukturen; bereits sichtbare wiederverwendete Atome bleiben an ihrem vorhandenen Platz. Die vier historischen Cluster sind in den scoped Views kanonische `prerequisiteOnly`-Referenzen. An der Kernreaktionsklammer wird der kanonische Teilbaum gezielt in explizite Geschwisterreferenzen aufgelöst: Dadurch entsteht trotz mehrfacher kanonischer Wiederverwendung weder eine Teilbaumüberlappung noch ein doppelter sichtbarer Parent.

**Offen ausgewiesene Source-Altlast:** Die BY-Klauseln zum Reaktoraufbau/-betrieb sind durch Vergleich, Energiedeutung und begründetes Urteil nicht vollständig repräsentiert. Das Paket entfernt überbreite Mischbindungen und behauptet keine Vollabdeckung dieser Reaktorleistung. Es eröffnet dafür nicht ungefragt ein siebtes Atom.

## Assessments, Bilder und Karten

- 88f27aab…: die tatsächlichen drei Aufgaben prüfen Transistorschalten. Nur neues Schalterziel wird `requires`/`coveredGoalIds`; kein Flipflop-/Verstärker-Fanout.
- a77e53d5…: Aufgabe1 trägt Reaktionsvergleich und Energieursprung, Aufgaben2/3 das vorhandene Kernenergieurteil. Die Lösung benennt jetzt korrekt die Ruhemassensumme aller Produkte und mögliche freie Fusionsprodukte; keine allgemeine Behauptung, jede beliebige Spaltung/Fusion setze Energie frei.
- Generische Kern-/Festkörper-Templates und Q4-Capstone werden nicht mechanisch zu kindgenauen Assessments erklärt; ihre historischen Referenzen bleiben.
- Für Audio-/Multiplexprodukt, Flipflop, Elementargument und Massenverlustprognose wurde kein vorhandenes konkret passendes Assessment nachgewiesen. Das ist keine erfundene terminale Routenfreigabe.
- Keine gehaltene Karte hat einen Ursprung an den vier umgewandelten IDs oder af50. **0 Karten-/Deckänderungen**; sieben einzeln begründete `no_memory_needed`-Entscheidungen, kein pauschaler Review-Refresh anderer Ziele.
- Die tatsächlich inspizierten Übersichten an ea17/498 bleiben am historischen Cluster. Die bestehende af50-Abbildung bleibt; d367/7df hatten keine gebundene Primärabbildung. Sechs enge Prompts stehen in `nano-image-prompts.md`; keine Generierung, kein Import und keine Bildfreigabe.

## Geprüfte technische Übergabe

`verification.json`: **PASS**, 1.345 Einzel-Leases in 87 Ausgabedateien; 70/70 native Views ohne Fehler. Der aktuelle Stand 724/470 ist gebunden, nicht ein älterer kanonischer Gesamtstand.

Geprüft: aktuelle JSON-Felder/Text-Seams; Originalhashes; Requires-/Contains-DAG einschließlich externer Mathematikreferenzen; keine Selbstvoraussetzung über einen neuen Elterncluster; sieben individuelle A/M-Record-Shapes samt nativen semantischen Fingerprints; vollständiges natives K-JSON-Schema und betroffene K-Fingerprints; alle neuen Targets genau einmal oder ausdrücklich prerequisiteOnly; keine betroffenen Doppelparents; Mapping-/Decision-Konsistenz; keine Kartenursprungs- oder Kinderbildkopie.

Zusätzlich PASS: Der kleine reine Generator-Helper reproduziert die sechs Kandidaten-Mappingdateien semantisch exakt (2.347 verglichene Mappingzeilen). Die fünf minimal angepassten Generatoren wurden syntaktisch transpiliert. Das ist **kein** vollständiger Generatorlauf: Ausführung der Generatoren und globale M6-/Maturity-Floor-Checks folgen nach serieller Root-Integration.

Nur ein vorhandenes operatives P-Record der direkt geänderten historischen Atome wurde gefunden: d367 in `canonical-physics-positive-understanding-evidence-rollout-v1-batch-042-adjudicated-nine-v1.review.jsonl`. Es bleibt historisch, wird nicht auf Kinder kopiert und ist im anschließenden aktuellen P-Scope auszuschließen. Benachbarte D/P-Kontextfingerprints müssen nach Anwendung neu bestimmt werden; dieses Paket erteilt keine Anerkennung.

Vorhandenen Test-Count-Drift nicht umgeschrieben. Obige Deltas sind neue fachliche Daten, keine Erlaubnis zum Umgehen eingefrorener Tests oder Maturity-Floors.

## Root-Anwendung

Aus dem Repository-Root mit Node20:

```bash
/home/enpasos/.nvm/versions/node/v20.20.2/bin/node app/node_modules/tsx/dist/cli.mjs curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-034-next-unresolved-20-v1/physics100-four-goal-consolidation-v1/emitter.mjs --check
/home/enpasos/.nvm/versions/node/v20.20.2/bin/node app/node_modules/tsx/dist/cli.mjs curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-034-next-unresolved-20-v1/physics100-four-goal-consolidation-v1/emitter.mjs --outputs-json
```

Alternativ `--emit-patch`. Diese Befehle schreiben **nichts**. `--outputs-json` liefert je Datei aktuelle `beforeSha256` und den aus genau den Leases berechneten Inhalt; eine neue Helperdatei hat `beforeSha256: null`. Root prüft diese Bytes unmittelbar vor seiner eigenen seriellen Anwendung mit `apply_patch`. Keine alte kanonische Gesamtdatei zurückschreiben.

Bei Lease-Drift stoppen und die konkrete Kollision fachlich auflösen. `--capture-initial` ist durch die existierende Plan-Datei gesperrt; keine automatische Neufassung von Vorbedingungen. Die zusätzlichen 340 View-Leases entstanden nach dem ersten Compilerbefund, ohne bestehende Vorbedingungen zu erneuern.

