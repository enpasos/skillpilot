# Mathematik G8/G9: technische Bindung des Split-Layout-Plans

Datum: 2026-09-24. Dies ist ein Feldvergleich für eine aktive Generatorbindung, **keine erneute fachliche Layout-, Beschreibungs- oder Bildfreigabe**.

Der Generator `app/scripts/generateMathDurationCompositionViews.ts` prüft den SHA-256 der gesamten kanonischen Mathematikdatei gegen `app/scripts/config/math-duration-split-spanning-tree-policy.json`. Der bisherige Planwert `7e8be28c98430881f5271e669012e98ea09fd8d38368d7d903bf3fcc615f850b` entsprach dem Stand vor dem Astra-Bildpaket. Der aktuelle Dateiwert ist `846da12d328c66e45ca6cd66b7ae4a1fd8a88f5e1095a3896b156202954fae41`.

Verglichen wurden die kanonische Mathematikdatei aus `HEAD` und der aktuelle Integrationsstand als geparste JSON-Strukturen. Beide enthalten **1.192 Ziele mit identischen IDs und identischer Reihenfolge**. Alle Root-Felder außer `goals`, insbesondere `goalPlacements`, `programUnits` und `competencyCatalog`, sind identisch. Für jedes Ziel sind sämtliche Felder außer `resourceLinks` identisch; dies schließt Titel, Beschreibungen, `requires`, `contains`, `extendedData` und die übrigen Struktur- und Geltungsfelder ein. Genau **20 Zielobjekte** haben eine `resourceLinks`-Änderung: 16 erhalten eine aktive Visualisierungsbindung; bei vier zurückgestellten Zielen wurde ein zuvor fehlendes Feld als leere Liste materialisiert. Die fünf zurückgestellten Bilder bleiben ungebunden.

Damit wurde ausschließlich `inputs.canonical.sha256` im aktiven Split-Layout-Plan auf den aktuellen Dateiwert gesetzt. Seine Layoutregeln, Template-Zahlen, Platzierungen, geprüften Adjudikationen und deren historische Hashes bleiben unverändert. Die Bildentscheidungen und exakten Asset-Hashes stehen weiterhin im [Sichtprüfungsbeleg](../mathematik-z-astra-image-sight-20260924-v1.md); dieser technische Abgleich ersetzt keine dortige Prüfung.

Der gezielte Lauf `npm --prefix app run check:math-duration-composition-views` bestand danach für alle 18 G8/G9-Sichten in HE, RP und SH.
