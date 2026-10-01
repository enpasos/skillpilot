# 0503: aktuelle Gesamtfluss-Korrektur nach unabhängigem D-Befund

Status: KI-Kandidat vom 1. Oktober 2026; noch keine strenge D- oder P-Freigabe. Das vorbereitete v1-Paket und sein unabhängiger Runde-A-Befund `REVISE` bleiben als historische Nachweise unverändert.

## Befund und Änderung

Die unabhängige v1-Runde A fand einen echten fachlichen Grenzfall: „Aufnahme den zusätzlichen Zufluss nicht ausgleicht“ kann den natürlichen biologischen Rückfluss aus der Gesamtbilanz ausblenden. Der neue DE/EN-Zieltext nennt deshalb ausdrücklich **gesamten Zufluss** und **gesamte Aufnahme**. Der Alttext des aktiven Bildes wurde in genau demselben Sinn präzisiert. Das PNG selbst und sein geprüfter Digest `sha256:e3f03ecac344cbd713f8102cc58b6f98456bb71cc2b245174c54d566f1d65625` blieben unverändert. Die aktuelle 4:3-Grafik zeigt die biologischen und fossilen Pfeile; ihr Schlussfeld „Mehr CO₂, wenn Zufluss > Aufnahme“ entspricht der korrigierten Bedingung.

Die [amtliche BY-LehrplanPLUS-Stelle Chemie 8, C8.3](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie) fordert die Erklärung des fossilen atmosphärischen CO₂-Anstiegs anhand des Kohlenstoffatomkreislaufs. Der BY-Source-ID `495cea26-06df-5a54-aa76-a80d47629e62` und dem dokumentierten kanonischen Split wird kein weiterer Stoff hinzugefügt. Die neue Zielseite in `bundle/book-model.json` enthält genau diese DE-Beschreibung und das aktive PNG. Sie bindet 4dab als vorausgesetzten Brennstoffvergleich und 9198 als nachgeordnetes Bewertungsziel; 0503 bleibt bei einer einzigen Erklärleistung für Speicherweg und bedingte Bestandsänderung.

## A/M/P und Checks

- **Semantische Atomarität:** weiterhin eine assessierbare Kausalerklärung. Die Gesamtflusspräzisierung korrigiert eine Randbedingung, ohne einen zweiten Zielkern einzuführen. Die ältere A-Entscheidung ist inhaltlich passend, aber ihre Textbindung muss gezielt aktuell materialisiert werden.
- **Memory:** weiterhin `no_memory_needed`: Eine Karte zu Fachwörtern prüft keine eigenständige Deutung von fossilem Speicher, biologischen Rückflüssen und Nettoänderung. Für 0503 entsteht keine neue Karte, folglich kein neuer Karten- oder Sichtbarkeitspfad; die aktuelle Textbindung ist separat zu erneuern.
- **P-v2:** `goal-evidence/2026-10-01/chemie-b009-fossil-carbon-current-v2/positive-evidence.*` enthält zwei unterschiedliche neue Modellfälle: Kohle mit nur teilweisem Ausgleich (+2 Einheiten), Erdgas mit einem vollständig ausgeglichenen und einem nicht ausgeglichenen Zeitraum. Beide zählen **biologischen Rückfluss plus fossile Zufuhr** gegen die gesamte Aufnahme und verfolgen Kohlenstoffatome. Das Bild liefert diese Zahlen und Schlussrichtungen nicht. Der maschinelle Konfigurationscheck meldet 1 `needs_human_review`, 0 Blocker; unabhängige fachliche P-QA steht aus.
- **Bildbindung:** `check:goal-visualization-qa -- --subjects=chemie` und `check:goal-visualization-assets` bestanden nach der Alttext-/Beschreibungskorrektur; 1731 Assets in 21 Landschaften wurden beim Assetlauf geprüft. Keine menschliche Bildfreigabe.

Die Semantic-Kind-Entscheidung `curricularAtomic` wurde erst nach der inhaltlichen Prüfung der einheitlichen Erklärleistung auf die korrigierte DE/EN-Fassung gebunden (`sha256:b1f6bf50f93ae5b5898255fba311f68b61c561851b444be16b1155d4f00e14c1`). Diese Bindung allein ist keine fachliche Freigabe und kein Fünf-Gate-Abschluss. Zwei voneinander unabhängige **neue** v2-D-Runden müssen die korrigierte Seite blind prüfen; die v1-Runde darf dafür nicht umetikettiert werden.
