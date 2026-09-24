# Mathematik M7: aktuelles P-v2 für zwei korrigierte Q4-PNGs

Dieses versionierte Paket bindet genau die beiden Ziele `fcb4cef1-b17a-5682-924c-41498fc6c9b2` und `fde351a8-98b1-5d75-b4df-813beb2bbe3c` an ihre **aktuellen** PNGs. Es ersetzt nach zentraler Registrierung den inzwischen veralteten Zweier-P-Owner `m7-four-interval-finance-ratio-png-current-20260923-v1/retained-q4-two.config.json`; dessen Auditdateien bleiben unverändert. Die alte Zweier-Review war fachlich textbasiert, aber noch an die zurückgezogenen JPGs gebunden. Die neuen PNGs wurden im [separaten Bildreview](../../goal-visualization-review/math-m7-q4-two-corrected-png-20260924-v1/README.md) tatsächlich geprüft. `reviewedResourceTypes: ["goal-visualization"]` lässt die beiden neuen Bildbytes in den aktuellen Review-Input-Fingerprint einfließen.

| Ziel | Aktuelles Bild | Zwei voneinander unabhängige positive Verstehensfälle |
| --- | --- | --- |
| `fcb4cef1…` „Aussagen strukturiert formulieren“ | PNG-SHA `2fced6226ce06bde28b37b391daeb0710dd1272ba6e25dd3aff28dbbfc45e67e` zeigt korrekt `n = 2k` mit `k ∈ ℤ` und den Quadrat-Schluss. | Statt diesen sichtbaren Beweis abzuschreiben, muss die lernende Person selbst die **Summe zweier gerader ganzer Zahlen** mit zwei ganzzahligen Hilfsvariablen, Geltungsbereich und Schlussrichtung allgemein formulieren: `a+b=2(k+l)` und `k+l∈ℤ`. Der zweite Fall wechselt zu `f(x)=x²−1` und begründet die Nullstellen-**Äquivalenz** `f(x)=0 ⇔ x∈{−1,1}`. Das ist ein struktureller Wechsel von Implikation zu Äquivalenz, nicht nur ein Zahlentausch. |
| `fde351a8…` „Beziehungen im Modell formulieren“ | PNG-SHA `a831dbbe7a5cc3b92da30376bf22cf63c6cbd02f18be8e51cea20510e2febd44` zeigt das korrigierte Kiosk-Kostenmodell `K(x)=15+2x` mit **Materialkosten** je Saft. | Ein unabhängiger Werkstattfall verwendet **18 € Fixkosten und 3 €/Teil**: `K(x)=(18+3x) €` für ganze `x≥0`, `K(10)=48 €`, mit sachlicher Term- und Einheitendeutung. Der zweite Fall modelliert höchstens 40 Becher durch `x+y≤40` bei ganzzahligen nichtnegativen `x,y` und erklärt, warum freie Kapazität eine strikte Ungleichung zulässt. Das wechselt von Funktion/Kosten zu Ungleichung/Kapazität. |

Die Fallpaare decken jeweils beide im Profil benannten Verständniserwartungen ab; beide Fälle verlangen eigenständige Aussage-/Modellformulierung und Begründung. Die Bildzahlen und Bildaussagen wurden gegen die Falltexte geprüft: Der erste fcb-Fall hat einen anderen Beweisgegenstand als das PNG, der erste fde-Fall einen anderen Ort und andere Parameter. Weder ein markiertes Bildelement noch ein abgelesener Endwert genügt als P-Nachweis. Die alten guten Erwartungsstrukturen und die jeweils zweiten Transferfälle wurden übernommen; geändert wurden nur die für Bildunabhängigkeit nötigen ersten Fälle und die aktuellen Bildbindungen. `source-pins.json` und `materialize-candidates.mjs` fixieren den alten Zweier-Ursprung und beide aktuellen PNG-SHAs.

Der Quellen-/Beschreibungs-Dissent zu `fde351a8…` bleibt **separat offen**: Ob die Breite des aktuellen kanonischen Ziels direkt durch HE-Q4.2 gedeckt ist, wird durch dieses P-Profil weder entschieden noch freigegeben. Er steht auch im `dissent` des fde-Records. Dieses Paket verändert keine Quelle, Beschreibung, Mapping oder D-Entscheidung. Beide Records sind wahrheitsgemäß `needs_human_review` / `ai_candidate`, `E1/G1`; das ist ein gültiger maschineller P-Nachweis, **keine** menschliche Freigabe, kein Nachweis tatsächlicher Lernendenleistung und kein automatischer strenger M7-Abschluss.

Fokussierte, bestandene Prüfungen aus dem Repository-Root:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-q4-two-corrected-png-current-p-20260924-v1/materialize-candidates.mjs --check
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/m7-q4-two-corrected-png-current-p-20260924-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-q4-two-corrected-png-current-p-20260924-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-q4-two-corrected-png-current-p-20260924-v1/positive-evidence.config.json
npm --prefix app run test:positive-goal-evidence-review
npm --prefix app run test:positive-goal-evidence-candidates
```

Ergebnis: 2 aktuelle AI-Kandidaten, 0 Approved, 0 Rejected, **0 P-Blocker**; Kandidaten und Review-JSONL wurden reproduzierbar materialisiert. Der zentrale Owner-Tausch und ein erneuter Fünf-Gate-Check liegen beim Integrationsschritt, nicht in diesem Paket.
