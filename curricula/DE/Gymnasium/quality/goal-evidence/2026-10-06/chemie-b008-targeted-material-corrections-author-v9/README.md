# Chemie B008: gezielte Materialkorrekturen, Autor v9

Dieses Paket ist ein **Autorkandidat**. Es ergänzt keine aktiven fachlichen
Abschlüsse oder Bindungen: Chemie bleibt **112/378**, Biologie **67/383**;
Mathematik **807/807** und Physik **478/478** bleiben geschützt. Nettozuwachs,
neue fachliche Abschlüsse und wiederhergestellte aktive Bindungen jeweils **0**.
Die null Ziel-IDs, E1/G1, `ai_candidate`, `needs_human_review` und der tatsächliche
Status aller 1.646 ursprünglichen Quellenobligationen einschließlich der offenen
Holds bleiben unverändert. Native D/P/A/M/V,
menschliche Prüfung, Freigabe, Erprobung und Release sind weiterhin getrennt.

## Tatsächliche Änderungen

Die [52 DE/EN-Fälle](fifty-two-cases.de-en.author-candidate.json) sind eine
gezielte Fortsetzung des unveränderten Autor-v8. Genau **zwölf Fallkörper mit
60 Blattfeldern** ändern sich; **40 Fälle bleiben vollständig identisch**.
Die ursprünglichen 173 Kriterien und 14 Protokolle behalten ihre Anzahl und
Kennungen. Sechs bereits vorhandene echte praktische Fälle verlangen weiterhin
beobachtete Durchführung mit tatsächlichen Rohdaten; ein bereitgestelltes Kit,
eine Anleitung, Modellrechnung oder fiktive Notiz ist kein Ausführungsnachweis.

- **A-V8-01/B-v8-01:** NaCl-Leitfähigkeit bei 1 g/L und 25 °C wird mit dem
  tatsächlichen 1990-µS/cm-Herstellerstandard abgeglichen. Wasserblindwert 3 und
  Saccharosewert 4 bleiben unverändert. Im temperaturabhängigen Lehrmodell
  werden 1800/2300/2298 µS/cm verwendet: ungleiche Temperatur ergibt 500,
  gleiche Temperatur nur 2 µS/cm Differenz. Die ursprüngliche grobe
  Wiederholstreuung ±3 wird bewusst erhalten; sie wird nicht pauschal skaliert
  und ersetzt keine vollständige Messunsicherheit. Alle drei Fallverwendungen
  und die numerische Musterantwort sind aufeinander abgestimmt.
- **A-V8-02:** Der NaCl-Modelltransfer nennt ausdrücklich Wärmeaufnahme/kleine
  Abkühlung nahe 25 °C im verdünnten Bereich. Das Ladungsmodell allein erklärt
  keine Energiebilanz; keine allgemeine Aussage über jedes Salz wird verlangt.
- **B-v8-02:** Fehlende Standardetiketten, quantitative Messbereiche,
  Thermometer und kontrollierte Temperaturen, Waagenauflösung, Indikator-
  Identität/Umschlagsbereiche/Farben, echte pH-Pufferkalibration, sichere
  Bürettenhalterung und Aufnahmegefäße sowie tatsächliche Vollpipetten und
  Messkolben samt Fehlergrenzen werden bereitgestellt. Beobachtbare Protokoll-
  und betroffene Kriterienfelder verlangen passende echte spätere Einträge.
  Die zweifache Farbstoffverdünnung ist 10,00 auf 20,00 mL; synthetische
  Kalibration ersetzt weiterhin keine eigene tatsächliche Standardreihe.
- **B-v8-03:** R2 liefert einen gesonderten, datierten, eindeutig fiktiven
  Dokumentationsstimulus für einen **neuen Ansatz W3**. Der Transfer verlangt
  das korrekte Anfügen dieser Notiz. Die historische R1-Tabelle bleibt erhalten;
  eine rückwirkende reale Temperaturmessung an erfundenen Proben wird nicht
  mehr verlangt oder behauptet.
- **A-V8-03/04/05:** Die bereits erhaltenen Grenzen werden ausdrücklich
  gesichert: X-spezifische Folgeanalyse erst validieren, duplizierten
  Farbstofftext entfernen und die Wasser-Ionen-Hypothese auf das tatsächlich
  bereitgestellte Wechselwirkungsmodell begrenzen.

Alle vorgeschlagenen Korrekturen sind mit wörtlichem Vorher/Nachher und
Finding-ID im [Felddelta](literal-field-delta-and-finding-response.author.json)
verzeichnet. Es enthält **keine unabhängige Befundschließung**. Die tatsächliche
Primärquellenlektüre und fachlichen Grenzen stehen im
[Quellenbeleg](targeted-primary-facts-and-author-decisions.json).

## Unveränderte Profile und unabhängige Follow-ups

Die 26 v8-Profile mit den gültigen v7-Beschreibungen werden bytegenau
referenziert. [Review-Routing](actual-profile-to-v9-material-review-routing.json)
bindet diese unveränderten Texte an die neuen tatsächlichen Fallkörper. Es ist
kein natives P-Profil; historische relative v8-Materialpfade werden nicht
umgeschrieben. Unveränderte Zielbeschreibungen werden nicht erneut geprüft.
Die textuellen Modellkarten und das sechsseitige eigene Recherchedossier werden
ebenfalls mit exakt gebundenen unveränderten Dateien weiterverwendet.

Nächster Schritt: **zwei unabhängige gezielte A/B-Follow-ups** an den zwölf
betroffenen Fällen und den zugehörigen 60 tatsächlichen Feldern. Sie müssen
physikalische Plausibilität, DE/EN-Parität, numerische Querbindungen,
Ausführbarkeit der angegebenen Ausstattung sowie die Abgrenzung von Modell-
und echten Leistungsnachweisen prüfen. Die unberührten 40 Fälle und 26
Beschreibungen dürfen ihre gültigen historischen Reviews behalten.

Nach aufgelösten Befunden folgen konkrete native Ziel-IDs, korrekte Quellen- und
Kursplatzierungen, Quellen-Holds, D/P/A/M sowie Karten-/Sichtbarkeitsprüfungen
und tatsächliche aktuelle V-Freigaben. Ein grüner Autorencheck ist kein
fachlicher Abschluss. Keine Registry-, Ledger-, Canon-, Bild-, Runtime-,
Plugin-, Datenschutz-, Veröffentlichungs- oder Git-Änderung wird hier vorgenommen.

## Reproduzierbarkeit

`python materialize-targeted-corrections.py` schreibt ausschließlich die drei
eigenen neuen Autorartefakte. Der gezielte
`python check-targeted-inputs-and-materials.py` prüft historische Eingänge,
exakte Änderungen, Anzahl/Kennungen/Status, numerische Beziehungen und
unveränderte aktive Bindungen. Er ist Autorenkonsistenzprüfung, keine
unabhängige fachliche Freigabe. Die abschließende Freeze bindet alle eigenen
Dateien und alle tatsächlich verwendeten unveränderten externen Eingänge;
es werden keine neuen nativen Isolate oder Transportarchive kopiert.
