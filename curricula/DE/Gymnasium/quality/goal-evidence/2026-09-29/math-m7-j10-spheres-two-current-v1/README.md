# Zwei aktuelle J10-Kugel-P-v2-Kandidaten

Stand 29. September 2026: Kandidaten für `7b01d3d8` (Kugeloberfläche) und `bb227e31` (Kugelvolumen), unabhängig durch GPT-6 Astra gegen aktuellen Canon DE/EN, Voraussetzungen, Nachfolger, tatsächliche Bilder und curriculare Bezüge geprüft. Keine menschliche Freigabe, keine Lernendenevidenz und kein M7-Abschluss. Die Materialisierung wurde nach Abschluss des Canon-Imports ausdrücklich freigegeben.

| Ziel | Tatsächlich betrachteter aktueller PNG-SHA-256 | Urteil zum P-Inhalt |
| --- | --- | --- |
| `7b01d3d8-1fff-5924-b133-5a4825dc742e` | `071346fa7486250244bfae122614403c81cc6c0364b29f5d01eb75e15eed4ee8` | KEEP nach Präzisierung von Flächenvergleich und Materialzuschlag |
| `bb227e31-0b0b-544a-b5e0-548256a70dec` | `631917ff46438f2deab8a00403455c8ba2654342a2657ee55a843587f71e5bb3` | KEEP nach stärkerem Transfer und eindeutiger Tank-Innenabmessung |

Original- und Runtime-Dateien sind bytegleich. Das Oberflächenbild zeigt korrekt Außenbeschichtung, Radius, O=4πr², Quadrateinheit und vierfache Fläche bei doppeltem Radius; die Bemalung erklärt den Flächenkontext und ist keine Formelherleitung. Das Volumenbild zeigt ausdrücklich einen Schnitt durch die Mitte und die Abmessungen des eng umschließenden Zylinders. Das Volumenverhältnis 2/3 ist korrekt; es wird weder aus dem ebenen Kreis-/Rechteckflächenverhältnis abgelesen noch durch die Zeichnung bewiesen. Kein neuer fachlicher Bildblocker wurde festgestellt; dies ist keine formale V- oder menschliche Freigabe.

## Korrekturen und unabhängige Fälle

Die Schalenanordnung muss vier Kreisscheiben annähernd vollständig und annähernd flächenerhaltend bedecken. Eine bloße Ablage auf vier Scheiben würde den Faktor vier nicht begründen. Der Text nennt deshalb geringe Lücken/Überlappungen, keine merkliche Dehnung und die Grenze durch die nicht exakt eben abwickelbare Kugelfläche. Ein zweiter Fall vergleicht schmale Kugelgürtel mit Zylindermantelstreifen gleicher Höhe. Endlich viele Näherungsstreifen sind kein allgemeiner Beweis. Gleichwertige gültige geometrische Argumente bleiben zugelassen; ein allgemeiner Beweis wird nicht zur Pflicht gemacht.

Die erste Oberfläche ist 100π cm²≈314,2 cm²; bei doppeltem Radius 400π cm². Im zweiten Fall ergeben Durchmesser 1 m und Radius 0,5 m die Fläche π m². Die 5 % sind eindeutig als **Zuschlag auf diese Kugelfläche** definiert: 1,05π m²≈3,30 m². Ein Anteil von 5 % Abfall an der eingekauften Gesamtfläche wäre eine andere Rechnung.

Beim Volumen erschließt der erste Fall den Anteil aus 905 cm³ Verdrängung und 432π cm³ Zylindervolumen: ungefähr 0,667, passend zu 2/3; damit 288π cm³≈904,8 cm³. Der zweite Fall verändert die Zylinderhöhe auf **3r** und gibt einen unabhängigen angenäherten Modellbefund **4/9** vor. Daraus ergibt sich erneut 4πr³/3. Die lernende Person muss erklären, warum 2/3 zum Vergleichszylinder gleicher Grundkreisgröße und Höhe 2r gehört. Diese Änderung der geometrischen Vergleichsbedingung geht über einen Zahlentausch hinaus.

Der Tank hat ausdrücklich **Innendurchmesser** 2 m: Fassungsvermögen 4π/3 m³≈4,19 m³≈4190 L. Halber Innenradius liefert π/6 m³≈0,524 m³, also ein Achtel. Einheiten, Skalierungsgründe, Vergleichsbedingungen und die Reichweite experimenteller Beobachtungen sind positiv beobachtbare Leistungen. DE und EN verlangen dieselben Leistungen; jede Variante wird unabhängig als frische Aufgabe vorgelegt.

## Quellen und Projektion

Original-PDFs und zugehörige Source-Extraction-Mappings wurden punktuell geprüft: BY LehrplanPLUS M10.5 fordert ausdrücklich Plausibilisierung beider Formelstrukturen; BW BP2016 3.3.2(5) nennt Plausibilitätsbetrachtungen für Volumina, (7) das Berechnen der Körpergrößen. HE G9 10.3 nennt experimentelles/heuristisches Arbeiten und eine angemessene Auswahl an Herleitungen. RP Sek I sieht experimentelle Methoden vor; SH 2024 bindet Kugelgrößen im Kontext der Körperberechnung. Die aktuellen Canon-Ziele verlangen Plausibilisierung und einfache Anwendungen, keinen universellen Beweis und keine Integralrechnung.

**Gesonderte Quellen-Grenze:** SL Gymnasium Klasse 10 (2026), Pyramide/Kegel/Kugel B23, verlangt die **Herleitung von Kugelvolumen oder Kugeloberfläche**. Das Original schlägt Restkörper/Cavalieri beziehungsweise Pyramidenabschätzung vor. Die Source-Review-Zeile verknüpft die beiden hiesigen Ziele und die Cluster `6248bbd7`/`dd14916c` jeweils `partial`. Diese P-Profile allein weisen die stärkere Herleitungsanforderung nicht vollständig nach; diese Frage bleibt für die SL-Quellenabdeckung gesondert offen und steht ausdrücklich in `dissent`. Eine experimentelle Beobachtung wird nicht durch Mapping oder Profile-Akzeptanz zu einem allgemeinen Beweis. Die Pflicht der aktuellen Canon-Ziele wird hier nicht stillschweigend erweitert.

Beide Ziele werden von 52 aktuellen Composition Views als `target` erfasst (einschließlich allgemeiner CrossStage-Views); die betreffenden Views kompilierten ohne Fehler. Keine explizite `prerequisiteOnly`-Rolle wurde gefunden. Diese technische Rollenermittlung und die rohe Länderanwendbarkeit beweisen keine vollständige Quellenabdeckung jedes Landes; die SL-Herleitungsfrage bleibt offen.

## Technische Prüfung

Authoring: `positive-evidence.candidates.json`; Ausgabe: `positive-evidence.review.jsonl`. Der bestehende Materialisierer bindet aktuelle Zieltexte, Kriterien, Profile und Asset-Bytes. Kontrollaufruf:

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j10-spheres-two-current-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j10-spheres-two-current-v1/positive-evidence.candidates.json
```

Canon, Registry, Quellenmappings und Bilder wurden durch diesen Audit nicht verändert. Status bleibt `needs_human_review`, `ai_candidate`, `E1`, `G1`.

Ergebnis: Materialisierung und anschließender Kontrollaufruf **PASS (2 aktuelle KI-Profile)**. Ein zusätzlicher gezielter Abgleich bestätigte zwei Fälle je Ziel, aktuelle Bindungen, unveränderte KI-Statuswerte, erhaltenen Quellen-Dissens und die numerischen Werte einschließlich 4/9·3πr³=4πr³/3. Die technische Prüfung beseitigt die separat dokumentierte SL-Quellenfrage nicht.
