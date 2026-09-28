# Mathematik: zwei gemeldete Bildfehler (28.09.2026)

Dies ist ein neuer, bildhashgebundener QA-Beleg, keine rückwirkende Korrektur der früheren Reviews. `humanApproved` bleibt für beide neuen PNGs `no`.

| Lernziel-ID | Vorheriges JPG (SHA-256) | Aktuelles PNG (SHA-256) | Fachliche Korrektur |
| --- | --- | --- | --- |
| `eb070ed2-7ef4-5afe-b203-190ebb0116af` | `28f183a43d3a12ac251786d4fcab8550dc3566e18742c06558e01e17d7f0d479` | `f2466e2594b783ca21cd08c61b0e99bd8e1dc7603885946456ae0b7ca3af9a5d` | `EF` gehört zur blauen Doppelmarkierung, `AD` zur grünen Dreifachmarkierung. Im finalen Bild sind die rosa Seitenfläche `ADHE`, die blaue Grundfläche `ABCD` und der rechte Winkel `AB ⟂ AE` mit eindeutigen getrennten Zeigern dargestellt. |
| `5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d` | `f0afdea61e4021db8042a59f2f915993a59d3dacfe4f752c876dad0fd210cd96` | `94d1cc06ba4ac0492aa54dca1604a1b0254113ed665498fad7de317d8b204f7b` | Zwei isolierte Gleichheitszeichen suggerierten falsche Gleichsetzungen. Das finale Bild trennt Gesamtbruch und Zähler-/Nenner-Rechnung; alle verbleibenden Gleichungen sind mathematisch wahr. |

Die aktuellen Dateien liegen in `curricula/DE/Gymnasium/visualizations/mathematik/<id>/<id>.png` und bytegleich unter `app/public/assets/goal-visualizations/mathematik/<id>/<id>.png`. Die früheren JPGs bleiben unverändert als historische Assets erhalten. `prompt.de.md` bleibt als ursprüngliche Gemini-Provenienz erhalten; die neuen Bearbeitungen und Bildhashes stehen jeweils in `prompt.imagegen-correction.de.md`. Der aktive Kanon verweist ausschließlich auf die PNGs.

Unabhängige Sichtprüfung am finalen PNG in Originalgröße und bei 360 px:

- Quader: Die Eckpunkte beschreiben denselben Quader. `AB ∥ DC ∥ EF ∥ HG` tragen jeweils zwei blaue Zeichen; `AD ∥ BC ∥ EH ∥ FG` drei grüne; `AE ∥ BF ∥ CG ∥ DH` rote Einzelzeichen. `ADHE ⟂ ABCD`, `AB ⟂ AE` und `ABCD ∥ EFGH` stimmen. Die beiden linken Zeiger enden getrennt in rosa Seiten- und blauer Grundfläche; der Winkelzeiger endet bei A. Bei 360 px bleiben die kleinen Beschriftungen erkennbar, Detailprüfung erfolgt besser in voller Größe.
- Komplexe Division: `(3+2i)/(1−i) = ((3+2i)(1+i))/((1−i)(1+i))`, `(3+2i)(1+i)=1+5i`, `(1−i)(1+i)=2` und `(3+2i)/(1−i)=(1+5i)/2=1/2+(5/2)i` sind korrekt; `i²=−1`. Kein Gleichheitszeichen setzt den Gesamtbruch mit einem isolierten Zähler oder Nenner gleich. Bei 360 px bleiben die Hauptformeln erkennbar, Begleittexte sind klein.

Dieser Beleg ersetzt keine D- oder P-Entscheidung. Bildgebundene Lernzielbuchseiten und positive Evidenz müssen für die neuen Assets separat neu geprüft und gebunden werden. Ein grüner Asset- oder V-Check allein ist keine menschliche Erprobung oder Gesamtfreigabe.
