# Biologie Q1: sieben neue PNG-Bildkandidaten

**Autorstand, keine unabhängige V-Freigabe und keine aktive Integration.** Der
strenge Bericht bleibt Chemie **112/378**, Biologie **67/383**. Dieses Paket
erzeugt **0 neue fachliche Abschlüsse** und **0 wiederhergestellte aktive
Bindungen**. Alle guten vorhandenen Bilder bleiben erhalten.

Die sieben neuen, bereits im separaten v6-Quellenkandidaten benannten Ziel-IDs
erhalten sieben ausgewählte Rasterkandidaten. Der tatsächliche Provider ist
**ChatGPT/Codex `image_gen`**, built-in; der Toolaufruf nennt keine Modellversion,
deshalb wird keine erfunden. Alle Ausgaben sind PNG, ungefähr **1672 × 941**
(Reparaturbild 1672 × 940), nahe dem vereinbarten 16:9-Format. Die Darstellung
bleibt freundlich, abstrakt, klar und comicartig. Eigene didaktische Kandidaten
führen CC-BY-4.0; Qualität und Lizenz bleiben getrennte Entscheidungen.

## Tatsächlich betrachtete Ausgaben

Die [Auswahl mit Alttexten und Hashes](seven-selected-images-and-alt-text.author-candidate.json)
verweist auf die unveränderten tatsächlichen PNGs und den jeweils zuletzt
verwendeten [Prompt](prompts). Elf erzeugte Ausgaben bleiben erhalten: sieben
Erstausgaben, die Reparaturkorrektur, die UV-Korrektur und zwei gezielte
Zelllinienkorrekturen. Erzeugung und technische Übernahme sind keine Freigabe.

| Inhalt | Ausgewählter Versuch | Tatsächlicher fachlicher Autorenbefund |
| --- | ---: | --- |
| DNA, Gen und Chromosom | 1 | DNA-Material, Abschnitt und organisierter Träger werden im ausdrücklich vereinfachten Modell verknüpft. Große Kernbeschriftungen bleiben erkennbar. |
| Punkt- und Genommutation | 1 | G-C→A-T betrifft genau eine Paarposition; im als Modell benannten Vier-Chromosomen-Fall steigt ein Typ von zwei auf drei. Keine menschliche Normalzahl behauptet. |
| Drei Mutationsebenen | 1 | Genänderung, Abschnittsverlust und Zahländerung bleiben getrennt. Die kleine zusätzliche Botschaft ist für das fachliche Verständnis nicht erforderlich. |
| Mutagene und Schutz | 2 | Der UV-Ausschnitt zeigt ein intaktes Rückgrat und eine schematische Verbindung benachbarter Basen desselben Strangs. Kleidung, Hut und Schatten vermindern Exposition; Reststrahlen bleiben sichtbar. |
| Körperzellen und Keimbahn | 3 | Frühe Embryonalzelle, getrennte spätere Linien, gleiche generische Keimzellart und gestrichelte mögliche Weitergabe an Nachkommen. Keine sichere Vererbung oder Häufigkeit behauptet. |
| Mutation und Modifikation | 1 | DNA-Gleichheit beziehungsweise Änderung, Umweltvergleich und offener Merkmalsbefund sind getrennt dargestellt. |
| Fehlerkontrolle und Reparatur | 2 | Drei gleich lange Sechs-Paar-Ausschnitte; A-C-Fehlpaarung, Reparatur zu A-T und mögliche spätere G-C-Kopie. Kein unbeabsichtigter Abschnittsverlust. |

Alle sieben ausgewählten Bilder wurden als echte Browserdarstellungen bei
**360 und 680 Pixeln**, `object-fit: contain`, maximal `28rem` Höhe und DPR1
geöffnet und fachlich betrachtet. Der [Rendernachweis](actual-360-and-680-browser-rendering.json)
bindet die tatsächlich angesehenen [Screenshots](actual-display). Kernobjekte,
Markierungen und notwendige kurze Beschriftungen sind in diesen Darstellungen
erkennbar; kleine Zusatztexte sind kein Lesepflichtmaterial. Das Zelllinienbild
wurde gerade wegen eines zu kleinen notwendigen Vererbungshinweises nochmals
gezielt korrigiert. In den Bildern gibt es keine Heft-/Messdarstellung mit einer
falsch zur handelnden Person ausgerichteten Beschriftung.

## Erhaltene fachliche Korrekturgeschichte

- [Reparatur v1](repair-v1.actual-author-findings.json): falsche Pfeilfolge,
  unbeabsichtigte Verkürzung und falsche spätere Paarung; v2 korrigiert nur diese
  Darstellung und entfernt lesepflichtige Kleinschrift.
- [Zelllinien/UV v1](somatic-and-uv-v1.actual-author-findings.json): gemeinsame
  frühe Körperzelle statt Embryonalzelle, ein Elternmodell mit Spermium und
  Eizelle sowie dichte Texte; UV zeigt eine irreführend zerbrochene Helix.
- [Zelllinien v2 am Handy](somatic-v2.actual-phone-findings.json): der
  Vererbungshinweis blieb zu klein und die Folgezelle unklar; v3 nennt groß
  „möglich“ und „Nachkommen“.

Die UV-Repräsentation orientiert sich an einem tatsächlich recherchierten
[primären Experiment zu UV-induzierten Pyrimidindimeren](https://pubmed.ncbi.nlm.nih.gov/19186150/).
Gelesen wurde der verfügbare indexierte PubMed-Abstract; der direkte PMC-Aufruf
lieferte eine Browserprüfung. Es wird kein gelesener Volltext behauptet. Die
orange Verbindung ist ein vereinfachtes Lesionssymbol, keine maßstäbliche
chemische Struktur, und macht weder jeden UV-Schaden noch jeden Schaden zu
einer bleibenden Mutation.

## Native technische Übernahme, getrennte nächste Prüfung

Die unveränderten Produktionshelfer führten **14 tatsächliche prepare/import
Aufrufe, alle Exit0**, mit ausdrücklichem Provider, Biologie-Landschaft, letztem
Prompt, Alttext, Lizenz und `review-status=ai_candidate` aus. Der
[Befehlsnachweis](actual-native-prepare-and-import.receipt.json) weist den eigenen
isolierten Wurzelpfad aus. Der erste relative Landschaftsaufruf las wegen der
auflösungsseitigen cwd-Priorität die aktive Landschaft und scheiterte bereits
beim Ziel-Lookup; danach wurde ausschließlich der absolute Isolatpfad verwendet.
Es erfolgte keine aktive Mutation. Die Helferskripte wurden nicht geändert.

Die Quelle, Frontend- und Backendkopie jedes Kandidaten sind im eigenen
[Helferausgabepaket](native-helper-output) bytegleich mit dem ausgewählten PNG.
Der [inaktive kanonische Kandidat](canonical-390-with-seven-images.author-candidate.inert-envelope.json)
enthält zusätzlich genau sieben `resourceLinks`; gegenüber dem v6-Komponenten-
kandidaten bleiben alle anderen Zielfelder exakt. Eine unabhängige aktuelle
fachlich-visuelle Prüfung mit exakt diesen Assethashes, aktuelle native
D/P/A/M/V-Bindungen und vollständige Quellen-/GUI-Platzierung bleiben erforderlich.
Die elf falsch übernommenen Quellabschnittscodes im separaten v6-Paket bleiben
als unabhängiger REVISE-Befund offen. Menschliche Freigaben und Erprobung werden
nicht behauptet.
