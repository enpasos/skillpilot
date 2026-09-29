# Sechs unabhängig geprüfte P-v2-Kandidaten: Volumen und Spatprodukt

**Historischer Paketstand:** Diese README beschreibt die Eingangsbytes und Entscheidungen bei der Materialisierung des Sechserpakets am 29. September 2026. Die damalige Sperre für `6c122f0e` bezog sich auf das inzwischen ersetzte Silo-JPG. Die spätere PNG-Korrektur und ihre neue Bild-/P-Bindung stehen im [separaten Silo-Paket](../math-m7-silo-arrow-repair-current-v1/README.md); sie ändern weder diesen historischen Reviewumfang noch seine Fingerprints.

Dieses separate Paket vom 29. September 2026 enthält die sechs aktuellen Profile `1e77bb2f`, `288633c1`, `2f2c9f1a`, `c71ae268`, `e8237315` und `944dd479` aus dem [vollständig erhaltenen Siebener-Paket](../math-m7-volume-body-seven-current-v1/README.md). Eigene Review-ID und eigener Review-Pfad verhindern eine Vermischung der Scopes. Die Profile werden aus denselben unabhängig fachlich geprüften Kandidaten gegen den aktuellen Canon, Kriterien und die aktuellen Bildbytes materialisiert.

Alle sechs Profile: **KEEP nach unabhängiger Astra-Prüfung**, Status `needs_human_review`, `ai_candidate`, `E1`, `G1`. Der Prismavertrag wurde vor Übernahme methodenneutral formuliert; gültige Zerlegungs- oder Cavalieri-Begründungen werden ebenso wie Schichten akzeptiert. Die Fälle liefern Prisma 30/36 cm³, Pyramide 96/10 cm³, Kugel (256/3)π und 288π sowie (500/3)π und 4500π cm³, Zylinder 112π/72π cm³, Kegel 48π/75π cm³, Spatprodukt +30/−30 bzw. −3 cm³ bei Volumina 30 bzw. 3 cm³. Die Koordinatenfälle ändern die Darstellung und teilweise die geometrische Lage; sie sind nicht nur Zahlentausch. Das Pyramidenbild illustriert das Verhältnis 1:3, ohne eine allgemeine Zerlegung zu beweisen. Beim Spatprodukt sind Vorzeichen und nichtnegatives Betragsvolumen getrennt.

`6c122f0e` war in diesem Paket ausdrücklich ausgeschlossen: Das zum Materialisierungszeitpunkt aktive Silo-JPG ordnete durch zwei Pfeile Kegelvolumen und Kegelmantel der Zylinderwand zu. Sein P-Pflichtvertrag wurde im Siebener-Paket auf Längen **und** Winkel berichtigt; die damals ausstehende Bildkorrektur und neue Fingerprint-Bindung wurden anschließend im separaten Silo-Paket behandelt. Der damalige Ausschluss veränderte keinen Canon und keine Registry; er war keine Qualitätsfreigabe des ausgeschlossenen Bildes.

Quellen-/Projektionsbefunde und alle sieben Bilddigests sind im Siebener-Paket dokumentiert. Die Original-PDFs BW BP2016, BY M10.5, HE KC Sek I und SL GOS sowie aktuelle Source-Extraction-Mappings wurden punktuell unabhängig geprüft; die tatsächlichen Composition Views kompilierten ohne Fehler. Das ersetzt keine vollständige Quellenprüfung aller projizierten Länder. P-Kandidaten und technische Checks sind keine menschliche Freigabe, keine Lernendenevidenz und kein M7-Abschluss.

Prüfung ohne Schreibzugriff:

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-volume-six-current-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-volume-six-current-v1/positive-evidence.candidates.json
```
