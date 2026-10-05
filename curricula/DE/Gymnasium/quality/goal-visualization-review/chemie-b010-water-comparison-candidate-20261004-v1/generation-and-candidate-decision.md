# Chemie B010: inaktiver Wasservergleich-Bildkandidat

Stand: 2026-10-04. Ziel-ID: `16a80de2-b5e0-5467-a9b3-5860730d7d8b`.

**AI-Kandidat; keine unabhängige V-Freigabe, keine D/P/A/M/V-Integration und keine menschliche Freigabe.** Die aktiven Zieltexte, Quellenmappings, Registry, In-flight-Claims, Originalbilder und veröffentlichten Kopien wurden aus diesem Kandidatenpaket nicht verändert.

## Ausgangspunkt und belegter Reparaturbedarf

Das tatsächlich angesehene aktive JPG unter `curricula/DE/Gymnasium/visualizations/chemie/16a80de2-b5e0-5467-a9b3-5860730d7d8b/16a80de2-b5e0-5467-a9b3-5860730d7d8b.jpg` hat SHA-256 `8fe44fbc296f89f894b842e88495a8d33e43e8e73580e23b529c0fcf7062ddc0` (2752 × 1536 Pixel). Die unabhängige [B010-Kandidatenprüfung](../../goal-description-review/chemie/rollout-v1/2026-10-01/b010-element-groups-repair-independent-qa-v1.md) dokumentiert den sichtbar untergetauchten, dort brennenden Natriumwürfel. Dieser Befund rechtfertigt eine gezielte Korrektur; ein Provider- oder Formatwechsel allein wäre kein Grund.

Erhaltene nützliche Inhalte: Vergleich eines elementaren Alkalimetalls mit seinem einfachen Oxid am Natriumbeispiel; beide korrekt ausgeglichenen Reaktionsgleichungen; H₂ nur beim Metallweg; Na⁺/OH⁻ in beiden Lösungen und OH⁻ als Grund der alkalischen Lösung; freundliche blaue Cartoon-Bildsprache.

Korrektur: Natrium liegt jetzt an der sichtbaren Wasseroberfläche, eine Flamme nur oberhalb davon. Die dichte Fußzeile wurde auf zwei große kurze Aussagen beschränkt und die Gleichungen zweizeilig angeordnet.

## Tatsächliche Erzeugung und Dateien

Provider: **OpenAI / ChatGPT Codex imagegen**, eingebautes Tool `image_gen.imagegen`; das zugrundeliegende Modell wurde vom Tool nicht offengelegt. Keine CLI/API-Modellbehauptung. Die Originalbilder dienten als lokale Bildreferenzen; die Providerprompts enthalten keine technischen Ziel-IDs. Kein programmatisch gezeichnetes Ersatzbild und keine Bearbeitung der erzeugten Bildpixel.

| Versuch | Datei | SHA-256 | Erzeugungsquelle | Erstellerstatus |
| --- | --- | --- | --- | --- |
| 1 | `candidate-v1.png` | `9a2bc09100567bf2b0cb1eb7f452d0af87bc3e770e779415c31122432782a3fd` | `/home/enpasos/.codex/generated_images/01a108d7-2ac7-77a1-8a32-d38f235133f8/exec-3d785095-6a29-4b71-9443-447bd3ac2510.png` | HOLD: neu entstandener weißer Na₂O-Haufen wirkt auf der Wasseroberfläche schwimmend. |
| 2 | `candidate-v2.png` | `4d9f5072930bb31e56188b21353f677f6cd6971e5602375a1b53de1925c1555c` | `/home/enpasos/.codex/generated_images/01a108d7-2ac7-77a1-8a32-d38f235133f8/exec-b5a756b2-634e-44a1-a09a-61cb404b7766.png` | Zur unabhängigen Prüfung bereit; weiterhin inaktiv, keine Freigabe. |

Der erste echte Prompt steht in [prompt-provider.txt](prompt-provider.txt). Für Versuch 1 war das aktive JPG das einzige Referenzbild. Der zweite echte Prompt steht in [prompt-provider-v2.txt](prompt-provider-v2.txt); für Versuch 2 war `candidate-v1.png` das einzige Referenzbild. Versuch 2 korrigiert gezielt den neuen Na₂O-Darstellungsbefund: eine beschriftete Probenschale außerhalb des Bechers statt eines schwimmenden Oxidhaufens. Versuch 1 bleibt unverändert erhalten.

Beide PNGs haben die native Generatorgröße **1672 × 941 Pixel**, nahe 16:9. Bei 360 Pixel Bildbreite beträgt die Bildhöhe etwa 203 Pixel, bei 680 Pixeln etwa 383 Pixel. Diese Formatentscheidung folgt dem gültigen Goaltext. Die Erstellerin hat die tatsächlichen erzeugten Bilder angesehen; **die unabhängige Prüfung in nativer Größe und tatsächlichen 360-/680-Pixel-Ansichten steht noch aus**.

## Fachlicher Rahmen für die unabhängige Prüfung

Die [Royal Society of Chemistry](https://edu.rsc.org/experiments/reactivity-trends-of-the-alkali-metals/731.article) behandelt die Oberflächenreaktion und Wasserstoffbildung; ihre [begleitende Ressource](https://edu.rsc.org/download?ac=512063) beschreibt das Schwimmen der Alkalimetalle auf Wasser. Die Gleichungen im Kandidaten sind auf Na und dessen einfaches Oxid Na₂O begrenzt. Die Flamme illustriert einen möglichen Reaktionsverlauf; sie darf nicht als bei jedem Versuch zwingend auftretende Beobachtung oder als Flamme unter Wasser verstanden werden. Keine Durchführung, Mengenangabe oder eigene Versuchsanweisung wird aus dem Bild abgeleitet.

Offen bleiben die aktuelle Ziel-/Quellen-/Seiten-/Kontextbindung, die zwei unabhängigen D-Runden, A/M, P-v2 und eine tatsächliche unabhängige V-Entscheidung. Der rechte Becher ist eine schematische Ergebnisdarstellung neben der Oxidprobe, kein zeitgleiches Protokoll zweier Versuchsschritte. Prüfen, ob diese Abstraktion eindeutig bleibt. Vor einer späteren Integration alle wichtigen Zeichen, Gleichungen, Wasserkontakt und die mobile Lesbarkeit am tatsächlichen PNG prüfen.

Die Kandidaten sind eigene didaktische Medien gemäß der in `LICENSING.md` festgelegten Inhaltszuordnung (CC-BY-4.0). Providerherkunft und diese Zuordnung sind keine fachliche oder menschliche Freigabe. Kein strenger Abschluss oder wiederhergestellte Bindung wird aus diesem Paket gezählt.
