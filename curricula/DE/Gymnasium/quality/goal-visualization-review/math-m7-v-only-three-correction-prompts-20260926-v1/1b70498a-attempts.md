# Realsituationen modellieren: Bildkorrektur in sechs Versuchen

Der archivierte Altbild-HOLD hatte SHA-256
`1a67ba07d39e9730f2e100bd87d1761ef1d44daf70796529603238c779667b33`.
Seine Ballgeschichte, der Startwertpfeil und die gezeichnete Parabel waren
nicht miteinander vereinbar. Die neue Folge wurde mit dem eingebauten
OpenAI/Codex-Bildwerkzeug erstellt; die genaue Modellvariante wurde nicht
offengelegt. Alle Kandidaten sind in `candidates/` archiviert. Nur Versuch 6
wurde nach unabhängiger Bild-QS importiert.

| Versuch | SHA-256 | Eingabe | Befund |
|---|---|---|---|
| `1b70498a-landscape-attempt-1.png` | `c1c298acd2fb4918af5778727577fa3041de0270689d7fff99161db14ffc79eb` | archiviertes Altbild als Stil- und Inhaltsreferenz | HOLD: im Ballgraphen steht fälschlich `c=h(0)=9`; außerdem ist die Zweispaltenfassung bei 360 px zu klein. |
| `1b70498a-landscape-attempt-2.png` | `6627b75726ab23ed5b9a07653a0824d2b6099fe32e3124b9704daadcf5a122ff` | Versuch 1 | HOLD: die gezielte Ziffernkorrektur änderte den falschen Wert nicht. |
| `1b70498a-landscape-attempt-3.png` | `c22fde5b03de56adc1dbfbf6fa65317c536e2cdfc2fc3c2ba41f2d7c536344e0` | Versuch 2 | HOLD: `c=0` ist richtig, aber die zweispaltigen Formeln bleiben auf Handybreite zu klein. |
| `1b70498a-portrait-attempt-4.png` | `45f50cda596bf0eca4ee32cba842dedd57c553581839a1732e4966cd99b54276` | Versuch 3 | HOLD: Hochkantfassung ist lesbarer, doch die Ballbewegung beschreibt einen waagerechten Bogen statt eines senkrechten Wurfs. |
| `1b70498a-portrait-vertical-ball-attempt-5.png` | `893173a83955a8123a76c49d3533531b5c2ebcfd87d7f9b2dfbc99875bd1d7fd` | Versuch 4 | HOLD nach unabhängiger QA: Ballbewegung korrigiert, aber der Punkt `(2,14)` liegt oberhalb der 14-m-Achsenmarke und widerspricht der Geradensteigung. Der tatsächliche Edit-Prompt steht in `candidates/1b70498a-attempt-5.prompt.md`. |
| `1b70498a-portrait-corrected-line-attempt-6.png` | `01ca4678309b54567dbc84a29a7fd33deacd424a0e275cfbf79ef69cf45662c8` | Versuch 5 | Unabhängige Original- und 360-px-Prüfung: `accepted_pilot`. Der Punkt und die 14-m-Marke differieren um nur 2,65 Quellpixel, unter einem Pixel auf Kartenbreite. Keine wahrnehmbare fachliche Abweichung. Der tatsächliche Edit-Prompt steht in `candidates/1b70498a-attempt-6.prompt.md`. |

Die beiden letzten Edit-Eingabebilder und exakten Prompts sind damit im
Repository erhalten. Die früheren Kandidaten und der Ausgangs-HOLD bleiben
als Bild- und Entscheidungsnachweise erhalten; keiner wurde still als
freigegeben umgedeutet. Der aktuelle V-Entscheid steht im separaten Ledger
`../mathematik-z-modeling-correction-20260926-v1.md` und im exakten
QA-Hash-Eintrag. D- und P-Status werden getrennt geprüft.
