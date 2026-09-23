# Unabhängige KI-Bildprüfung: Plausibilität mit Beispielen testen

21.09.2026, 21:31 UTC. **Entscheidung: `accepted_pilot`**, ausschließlich `candidate` / `ai_candidate`; keine menschliche Freigabe.

Das tatsächliche zweite `candidate.png` wurde mit `view_image` angesehen, der vollständige Ausgangsprompt und der Hintergrund-Korrekturprompt gelesen und mit dem aktuellen zweisprachigen Canonical-Ziel sowie seiner Voraussetzung „Annahmen und Begriffe klären“ abgeglichen. Kein anderer Bildreview dieses Kandidaten wurde als Entscheidungsgrundlage gelesen. Eine frühere eigene Beschreibungsprüfung desselben Ziels wird nicht als Blindheit ausgegeben.

## Fachlicher Befund

- `n=−2`: `(−2)·(−1)=2`, korrekt und gerade; Vorzeichen und Klammern sind eindeutig.
- `n=0`: `0·1=0`, korrekt; auch null ist gerade (`0=2·0`).
- `n=1`: `1·2=2`, korrekt und gerade.
- `n=5`: `5·6=30`, korrekt und gerade.
- Die Vermutung gilt ausdrücklich für ganze Zahlen. Die Darstellung benennt negative, Null- und positive Fälle, ohne eine nicht vorhandene endliche Randstelle der ganzen Zahlen zu behaupten.
- „Die Beispiele passen — ein Beweis ist das noch nicht“ trennt Stichprobenprüfung und allgemeine Begründung richtig. Die Häkchen bestätigen nur die vier Einzelfälle. „Ein Gegenbeispiel würde die Vermutung widerlegen“ ist ein korrekter Bedingungssatz, keine Behauptung, dass die tatsächlich wahre Vermutung ein Gegenbeispiel hätte.

## Darstellung und Bindung

Freundlicher, klarer, abstrakter Comicstil mit Pastellkarten und einer kleinen untersuchenden Figur. Die helle und tatsächlich blickdichte Fläche hinter der schwarzen Überschrift ist gut lesbar. Auf der betrachteten Originalauflösung sind alle vier Rechnungen und die wichtige Schlussgrenze klar; keine abgeschnittenen Texte, widersprüchlichen Formeln oder störenden technischen Kennzeichnungen gesehen. Eine Prüfung der realen Handy-/Chatdarstellung wurde nicht vorgenommen.

- PNG: **1536 × 1024**, Truecolour ohne Alphakanal.
- SHA-256: `2438afe2cc49365310dde78cd39a3a13bbe1360b4dc9a994ff00e88792b8bb2e`.
- Die bereits unter dem aktuellen Canonical-Link liegende öffentliche PNG-Datei ist byteidentisch mit dem geprüften Kandidaten.
- Die erste Datei `rejected-dark-background-v1.png` wurde nur zur Herkunftskette gehasht, nicht erneut visuell beurteilt. Anbieter und Produktionswerkzeug werden im aktuellen Resource-Link angegeben; ein Produktionsreceipt wurde hier nicht unabhängig geprüft.

Die Grafik ist eine passende **Erklärungshilfe**, keine eigenständige Demonstration der Lernleistung. Der P-Nachweis muss andere Aussagen oder strukturell andere Fälle verwenden und die selbstständige Auswahl/Begründung der Beispiele verlangen. Abschreiben der vier vorgerechneten Fälle oder des Schlusskastens ist kein frischer Transfer.

Vollständige Bindungs-, Prompt- und Einzelprüfangaben stehen in [independent-review.json](independent-review.json). Keine Canonical-, Registry-, globale QA- oder Runtime-Änderung durch diesen Review.
