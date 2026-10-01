# d8: BY-Quellen- und Zweiggrenze für reversible Protonenübergänge

**Status: HOLD für strengen D/P-Abschluss.** Die früheren KI-Reviews des aktuellen Bilds sind historisch erhalten; ihre chemisch plausible Modellprüfung behebt diese Quellenfrage nicht. Die vorübergehende Provenienzänderung wurde zurückgenommen, damit sie keine ungeprüfte Fingerprint-Kette beim abhängigen Ziel `9751b6d8` auslöst.

| Bindung | Amtlicher extrahierter Inhalt | Folgerung |
| --- | --- | --- |
| BY Chemie 10 HG/SG/MuG/WWG/SWG, `C10-HG_SG_MUG_WWG_SWG.4.6`, Source-ID `7b5310e2-3b69-5a45-8966-f8523ea42fb9` | Strukturvoraussetzungen in Formeldarstellungen erkennen und **daraus** die Reversibilität ableiten. | Kein Nachweis, dass dieser Zweig die Ableitung **aus experimentellen Beobachtungen** verlangt. |
| BY Chemie 10 NTG, `C10-NTG.2.6`, Source-ID `fcb6ccbf-f62a-5731-b422-aeb15c95eb84` | Strukturvoraussetzungen in Formeldarstellungen erkennen und die Reversibilität **aus experimentellen Beobachtungen** ableiten. | Passt zum aktuellen d8-Wortlaut, belegt aber den NTG-Zweig. |

Die Primärtexte liegen in `curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json` und die beiden Source-Goals unverändert in `curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json`. Das ältere BY-Mapping bindet beide Gesamtquellen an den damaligen Cluster `08b44b8f`; es legt die spätere Teilzielzuordnung nicht für die Kinder fest. Das Geschwisterziel `597ac03c` prüft derzeit nur das **Erkennen** struktureller Voraussetzungen; es trägt die HG-Ableitung der Reversibilität aus Formeln nicht schon vollständig.

Der kanonische d8-Text lautet „aus experimentellen Beobachtungen“ und hat zugleich `applicability.jurisdiction` mit `DE-BY`; eine HG-/NTG-Achse gibt es dort nicht. Die aktuelle Sek-I-Kompositionssicht ist ebenfalls allgemein, und `courseProfile` ist für Sek I im Goal-Book-Checker nicht zulässig. Ein bloßer Wechsel von d8-`sourceGoalId` auf die NTG-ID würde deshalb die methodische HG-/NTG-Differenz nicht als Zielprojektion abbilden. Umgekehrt darf eine bloße Hash- oder Provenienzkorrektur nicht als neue fachliche Prüfung gelten.

**Erforderliche Entscheidung vor Integration:** Die kanonische Formelableitung und die NTG-Beobachtungsableitung müssen mit expliziter Geltung modelliert oder der gemeinsame kanonische Kompetenzkern fachlich neu begründet werden. Danach sind betroffene Ziel-, abhängige Kontext-, Quell-, Seiten-, D-A/B-, P- und Bildbindungen gezielt neu zu prüfen. Bis dahin zählen weder d8 noch ein eventuell durch d8-Änderung stale gewordenes abhängiges Ziel als neuer strenger Abschluss. Das aktive korrigierte PNG kann als maschinell geprüftes Bild verbleiben; es beweist die Quellengeltung nicht.
