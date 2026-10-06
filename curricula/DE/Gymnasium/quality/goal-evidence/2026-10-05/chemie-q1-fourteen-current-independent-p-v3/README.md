# Q1: unabhängige fachliche P-v2-Prüfung von 14 Kandidaten

**Ergebnis:** 14 fachlich geeignete KI-Kandidaten, 28 einzeln geprüfte Fälle,
keine ungelösten fachlichen Befunde. Die 28 DE/EN-Erwartungen und alle sechs
DE/EN-Felder jedes Falls wurden tatsächlich gelesen. Dieses Dossier integriert
keine Ziele und zählt keinen strengen Abschluss.

Die unveränderte Author-Datei
`chemie-q1-fourteen-positive-current-author-v2/positive-evidence.candidates.json`
hat SHA256 `4db204ea9d9d15482b1bcf9f14f11bb974a8469f4debb3e5ed546134a58fd52d`.
Alle sechs Dateien der endgültigen Author-Freeze wurden einzeln nach Bytezahl
und SHA überprüft. Die Profile wurden von diesem Reviewer nicht geschrieben.
Beschreibungsreview A wurde nicht gelesen.

## Fachliche Einzelentscheidungen

| Zielpräfix | Geprüfter Schwerpunkt | Urteil |
| --- | --- | --- |
| a3788e40 | Carboxygruppe, saurer Charakter, homologe Reihe, Strukturisomerie | PASS als KI-Kandidat |
| ca216bc6 | Acetat-Mesomerie, induktiver Effekt, pKa-Vergleich | PASS als KI-Kandidat |
| 70b34ae7 | Esterbilanz, Beobachtung, zwischenmolekulare Kräfte | PASS als KI-Kandidat |
| 667bc303 | Saure Reversibilität, alkalische Carboxylatsalzbildung | PASS als KI-Kandidat |
| 4da0839d | LK-Acylsubstitution, Pfeile, Zwischenstufe, Protonenübertragung | PASS als KI-Kandidat |
| 9d97f628 | LK-Umesterung: x = 0,5 bzw. 0,8, Produktentzug | PASS als KI-Kandidat |
| 6765f741 | Praktische Seifenherstellung, Triolein/Tristearin, Aussalzen | PASS als KI-Kandidat |
| 6966df95 | Grenzfläche, Micelle und Emulsion unterscheiden | PASS als KI-Kandidat |
| e874ee60 | Direkter BY-NTG-Operator: Seife/modernes Tensid bewerten | PASS als KI-Kandidat |
| 1837690e | Temperatur/Härte/Dosis, Kalkseifenbilanz, kontrollierter Vergleich | PASS als KI-Kandidat |
| 8a491e3b | LK-Härtearten, Ca-Kochmodell, Ionentausch ≠ Entsalzung | PASS als KI-Kandidat |
| e9ea1606 | Ausgangsstoffverlust ≠ Mineralisierung, Endpunkte/Kontrollen | PASS als KI-Kandidat |
| 33e845cc | Konservierung, Organismen, Hemmung ≠ Sterilität | PASS als KI-Kandidat |
| db66635f | Praktischer qualitativer Nachweis, DCPIP-pH, Iod/Ascorbat-Redox | PASS als KI-Kandidat |

Die vollständigen individuellen Gründe, genauen Erwartungs-/Fall-Digests,
DE/EN-Entscheidungen, aktuellen Quellenoperatoren und Kursgrenzen stehen in
[independent-p14-scientific-decisions.json](independent-p14-scientific-decisions.json).
Umesterung behält ihre aktuelle HE-Q2.1-LK-Bindung. Das Kriterienziel zur
Bioabbaubarkeit entspricht dem HE-Q4.3-Grundprinzip; die weiteren LK-Abbauwege
bleiben getrennt. BY-Tensidvergleich ist Sek I NTG; Navigation erzeugt keine
GK-/LK- oder HE-Q1-Pflicht. Seifenherstellung und Ascorbatnachweis behalten die
tatsächliche beaufsichtigte Durchführung als prüfbaren Operator.

## Tatsächliche ergänzende Quellenprüfung

Die aktuellen HE-PDF-Seiten 42, 50 und 51 wurden als Bilder gesehen. Die Seiten
39/40 waren bereits Teil der eigenen tatsächlichen Q1-V-Prüfung. Das erhaltene
BY-HTML wurde für den konkreten Operator gelesen. SHA-/Methodenreceipt:
[independent-primary-scientific-witnesses.actual.json](independent-primary-scientific-witnesses.actual.json).

Das OECD-Abstract beschreibt unterschiedliche Abbauendpunkte und Kontrollen;
die didaktischen Zahlen dieses Profils liefern keine regulatorische
Zulassung. [OECD Test 301](https://www.oecd.org/en/publications/test-no-301-ready-biodegradability_9789264070349-en.html)

Die pH-abhängige DCPIP-Farbe und ihre Reduktion sind mit tatsächlich gelesenen
Lehr-/Laborquellen vereinbar; Eigenfarbe und weitere Reduktionsmittel begrenzen
den qualitativen Nachweis.
[Truman ChemLab](https://chemlab.truman.edu/chemical-principles/determination-of-vitamin-c/),
[SAPS](https://www.saps.org.uk/teaching-resources/resources/191/measuring-changes-in-ascorbic-acid-vitamin-c-concentration-in-ripening-fruit-and-vegetables/)

Die Iod/Ascorbat-Bilanz verwendet einen 1:1-Iod-Stoffmengenbezug und zwei
Elektronen. Real vorhandenes Triiodid widerspricht dem ausdrücklich gegebenen
I2-Redoxmodell nicht.
[Buffalo State](https://staff.buffalostate.edu/nazareay/che112/iodine.htm)

## Native technische Prüfung

Vier unveränderte native P-Module und die tatsächlichen 14 Bildbindungen wurden
in einem eigenen isolierten Baum benutzt. Die eingefrorenen aktuellen
Q1-Future-Zieltexte, Alts und Originalbildbytes wurden vor Ausführung mit dem
nativen Author-Buchmodell abgeglichen. Die beiden tatsächlichen Befehle liefen
mit Exit 0:

1. Nativer P-Kandidaten-Materializer: 14 Profile geschrieben.
2. Nativer P-Check: Approved 0, Needs human review 14, Rejected 0, Blocking issues 0.

Die genaue Ausführung, Eingänge und Outputs sind in
[native-p14-validation.actual.receipt.json](native-p14-validation.actual.receipt.json)
und [independent-input-and-isolation.actual.receipt.json](independent-input-and-isolation.actual.receipt.json)
erhalten. Der temporäre isolierte Baum wurde nach Export der Nachweise entfernt.
Die nativen Zeilen in
[positive-evidence.native-frozen-future.review.jsonl](positive-evidence.native-frozen-future.review.jsonl)
gehören zum alten eingefrorenen Q1-Future. Ihre operative Neubindung erfolgt
erst gegen den ausdrücklich neu vorbereiteten Q1-v3-Baum nach B010.
Hilfsskripte sind Replay-Dokumentation; eine Wiederholung verwendet eine neue
Dossierkopie, damit dieser Freeze unverändert bleibt.

**Status aller 14 Profile:** `needs_human_review`, `ai_candidate`, E1/G1.
Keine praktische Ausführung, tatsächliche Lernendenleistung, menschliche
Freigabe, Human Trial oder rechtliche/sicherheitliche Freigabe wird behauptet.
Die zwei Demonstrationen sind Evidenz, keine starre Zwei-Aufgaben-Quote; echter
mehrschrittiger Transfer innerhalb einer Aufgabe kann ausreichende getrennte
Evidenz liefern.

## Nächste Integration

[q1-future-v3-scoped-rebase.plan.json](q1-future-v3-scoped-rebase.plan.json)
legt 14 explizite Ziel-Felddeltas und sieben Quellengruppendeltas auf dem neuesten
operativen B010-Stand fest. V8 und die unveränderten P14 werden gezielt neu
gebunden. Ein neues natives D15-Buch umfasst 14 neue Kandidaten und die
bd36-Seiten-/Kontext-Wiederbindung. Beide Beschreibungsreviews bleiben
unabhängig. Die sechs SOURCE HOLDs und alle anderen gültigen Nachweise bleiben
unverändert. Frühere Title-Clip-Beobachtung bleibt erhalten; die tatsächliche
frische Seite entscheidet über den aktuellen Befund.

**Strenger Nettozuwachs dieses Dossiers:** 0. **Neue operative fachliche
Abschlüsse:** 0. **Wiederhergestellte operative Bindungen:** 0. Potenzial nach
unabhängigen D2-Reviews und erfolgreicher Integration: 14 neue Abschlüsse;
bd36 ist getrennt als bestehende Bindung zu prüfen. Mathematik/Physik werden
dabei erhalten. Keine vollständige globale QS oder Builds in diesem Dossier.

## Lizenzen

Eigene fachliche Nachweise sind CC-BY-4.0; Hilfsskripte Apache-2.0. Rechte an
offiziellen Quellen und Drittinhalten bleiben getrennt und werden hier nicht
neu vergeben. Herkunft ist kein Qualitäts- oder Rechtefreigabenachweis.
