# Energy13: inaktiver Blei-Akkumulator-Bildkandidat

Stand: 2026-10-05. Ziel-ID: `27e4fe9b-4796-579b-8f7d-06c65fb600c0`.

**Inaktiver AI-Kandidat, keine unabhängige V-Freigabe, keine menschliche Freigabe und kein M7-Abschluss.** Dieses Paket verändert keine aktiven kanonischen Texte, Mappings, QA-Einträge, Registry, In-flight-Claims oder Bildkopien.

## Bedarf und fachlicher Rahmen

Das aktuelle kanonische Ziel besitzt kein Primärbild. Der dokumentierte [Energy13-Bildbefund](../../goal-evidence/2026-10-04/chemie-energy13-candidate-v1/image-findings.md) hält `visualizationState=missing` und `missingReason=deferred_provider_limitation` fest; diese technische Zurückstellung erfüllt Gate V nicht. Die aktuelle Beschreibung und beide unabhängigen Leistungsfälle im [inaktiven P-Profil](../../goal-evidence/2026-10-04/chemie-energy13-candidate-v1/positive-evidence.candidates.json) bilden den Erzeugungsrahmen.

Der Kandidat ist eine qualitative Orientierung zu Entladen/Laden: Pb und PbO₂ werden beim Entladen in Schwefelsäure zu PbSO₄ umgesetzt; äußere Elektronenrichtung von der negativen Pb-Seite durch den Verbraucher zur positiven PbO₂-Seite. Laden führt elektrische Energie zu, kehrt die Stoffumwandlung und äußeren Elektronenrichtungen um. Die physischen Klemmen bleiben in beiden Betriebsarten links negativ und rechts positiv; die Reaktionsrollen Anode/Kathode würden wechseln und werden deshalb nicht als unveränderliche Plattennamen verwendet.

Der eigene Bildentwurf zeigt getrennte Stoffpfade, Schwefelsäure, den äußeren Verbraucher bzw. das Ladegerät, den Unterschied zwischen ionischem Innenweg und elektronischem Außenweg, einen geschlossenen Starterakku als Kontext und Masse als Grenze. Die Stoffpfeile sind ausdrücklich **qualitative Umwandlungen, keine ausgeglichenen Teilgleichungen**; das Bild behauptet keine vollständige Stoff-/Ladungsbilanz. Keine reale Batterieöffnung, Säurehandhabung, Messgröße oder Ladeanleitung.

Die [DoITPoMS-Lehrquelle zur Blei-Säure-Zelle, an der University of Cambridge verfasst und auf Engineering LibreTexts zugänglich](https://eng.libretexts.org/Bookshelves/Materials_Science/TLP_Library_I/06:_Batteries/6.10:_Lead/6.10.01:_Lead/acid_batteries) wurde zur Reaktionsumkehr gelesen. Die ursprüngliche Cambridge-URL war beim direkten Abruf mit 403 nicht lesbar; der lesbare DoITPoMS-Text nennt Pb/PbO₂, die Bildung von PbSO₄ und die Umkehr beim Laden. Keine Drittanbieterabbildung oder fremder Langtext wurde für die Generierung übernommen. Die Gestaltung orientiert sich am tatsächlich betrachteten, vorhandenen freundlichen Kalkkreislauf-PNG; dieses wurde nicht als Provider-Bildreferenz versandt.

## Tatsächliche Erzeugung und Erstellertriage

Provider: **OpenAI / ChatGPT Codex imagegen**, eingebautes Tool `image_gen.imagegen`; zugrundeliegendes Modell nicht vom Tool offengelegt. Freundliche abstrakte Comic-Sprache, PNG nahe 16:9. Die Providerprompts enthalten keine technischen Ziel-IDs.

| Versuch | Datei | Größe | SHA-256 | Erstellerstatus |
| --- | --- | --- | --- | --- |
| 1 | `candidate-v1.png` | 1672 × 941 | `4ed05eeb47bddd246fef22596cb02527d7e127492714728a633631569ccffa90` | HOLD: Generator fügte nicht verlangte, abzählbare H⁺-/SO₄²⁻-Kreise sowie Bläschen ein; kein belastbares Teilchenbilanz- oder Gasmodell. |
| 2 | `candidate-v2.png` | 1672 × 941 | `fdbfe4bfb250f09ad73c829be506629a7f0a2ffb73059c84bbf150b35a296f11` | Zur unabhängigen Prüfung bereit; weiterhin inaktiv, keine Freigabe. |

Versuch 1 war eine neue Generierung **ohne Referenzbitmap**, mit dem tatsächlichen [prompt-provider.txt](prompt-provider.txt). Erzeugungsquelle: `/home/enpasos/.codex/generated_images/01a108d7-2ac7-77a1-8a32-d38f235133f8/exec-0c114ab5-32ed-4ff3-ba93-e2bf983949f9.png`.

Versuch 2 nutzte ausschließlich `candidate-v1.png` als Edit-Referenz und den tatsächlichen [prompt-provider-v2.txt](prompt-provider-v2.txt). Die fachlich brauchbaren Elektroden, Formeln, Richtungen, Klemmen und Energiepfeile blieben erhalten; nur die nicht beauftragten freien Teilchenkreise und Bläschen wurden entfernt. Erzeugungsquelle: `/home/enpasos/.codex/generated_images/01a108d7-2ac7-77a1-8a32-d38f235133f8/exec-6cc5cdfc-8395-4116-b4ed-4f6194c7824c.png`. Versuch 1 bleibt unverändert erhalten.

Beide Kandidaten wurden als unveränderte Bytekopien gespeichert. Keine programmatische Bildzeichnung, Pixelkorrektur oder SVG-Ersetzung. Die tatsächlichen nativen Ergebnisse wurden zur Erstellertriage betrachtet. Dies ist keine unabhängige Freigabe.

## Vorbereitungshelper und offene Prüfung

```bash
npm --prefix app run visualization:prepare -- 27e4fe9b-4796-579b-8f7d-06c65fb600c0 --landscape=curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json --subject=chemie --provider='OpenAI / ChatGPT Codex imagegen' --review-status=ai_candidate
```

Der Helper schreibt nur ignorierte `tmp/goal-visualizations/<goal-id>/`-Ausgaben. Da er keinen Providerprompt-Override besitzt, ist der tatsächliche Providerprompt zusätzlich dort gespeichert und im lokalen Metadata mit Pfad/Hash gebunden; der historische Dateiname `nano-banana-prompt.de.md` ist kein Herkunftsnachweis. **Kein Import wurde ausgeführt.**

Native 1672 × 941 entsprechen ungefähr 360 × 203 und 680 × 383 bei den vorgesehenen Bildbreiten. Die unabhängige Prüfung in nativer und tatsächlicher kleiner Darstellung steht aus. Besonders prüfen: externe Elektronenpfeile in beiden Betriebsrichtungen, unvertauschte Minus-/Plusklemmen, klar getrennte Pb-/PbO₂-/PbSO₄-Bezeichnungen, Zuordnung der qualitativen Stoffpfeile, Lesbarkeit der Indizes und die eindeutige Trennung von äußerem Leiter und innerem Elektrolyt. Die gezeichnete Gehäuseumrandung ist eine schematische nichtleitende Zellenhülle, keine elektrische Verbindung der Platten; prüfen, ob die tatsächliche Darstellung das eindeutig vermittelt.

Aktuelle Ziel-, Seiten-, Kontext-, Quellen-, D/P/A/M- und V-Bindungen werden erst im separat geprüften Integrationspaket erhoben. Eigene didaktische Medien folgen der CC-BY-4.0-Inhaltszuordnung aus `LICENSING.md`; Herkunft und Zuordnung sind keine Qualitätsfreigabe.

Strenger Nettozuwachs: **0**, neue fachliche Abschlüsse: **0**, wiederhergestellte aktive Bindungen: **0**.
