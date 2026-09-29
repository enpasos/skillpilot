# Bildbindung `bf17cada`: GK/LK und Quellenstand — gezielte AI-Sichtung

Stand: 29. September 2026. Dies ist eine read-only Fach- und Bildprüfung; kein Bild wurde ersetzt und weder Canon, Mapping noch QA-Status wurden geändert. Keine menschliche Freigabe.

## Aktuelles Bild und Lernziel

- Ziel `bf17cada-3ccd-5d9a-b9e3-42065cfdbb01`: „Sachsituationen mit einer erweiterten Funktionsklasse modellieren“, Q2, Tags `GK` und `LK`. Die aktuelle DE/EN-Beschreibung verlangt für **eine** Sachsituation die Auswahl **einer** geeigneten erweiterten Funktionsklasse und die Deutung ihrer Parameter; sie nennt keine bestimmte Klasse.
- Tatsächliches aktives JPEG mit `view_image` in Originalauflösung geprüft: [`bf17cada-...jpg`](../../../visualizations/mathematik/bf17cada-3ccd-5d9a-b9e3-42065cfdbb01/bf17cada-3ccd-5d9a-b9e3-42065cfdbb01.jpg), SHA-256 `27a36363a0414cdde9a95c00ec57f0258f213509ec8cae7d685651d328253f37`. Es zeigt **ausschließlich logistisches Wachstum** mit $N(t)=1000/(1+9e^{-0{,}4t})$, $N(0)=100$, Sättigungsgrenze $1000$ und einer S-Kurve. Diese Rechnung und die Parameterdeutung sind für sich mathematisch stimmig. Die alte QA-Notiz hatte genau diese rechnerische Konsistenz, aber keine zielgruppenspezifische Quellenprojektion belegt.

## Effektive HE-Projektion und Quelle

- Der amtliche HE-Kernlehrplan [`kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`](../../../input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf), SHA-256 `d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953`, führt in Q2.1 auf gedruckter S. 40 für GK **und** LK einfache gebrochen rationale Funktionen und Wurzelfunktionen sowie Transformationen und Umkehrfunktionen an. Logistisches Wachstum steht separat in Q1.3 auf gedruckter S. 37 ausdrücklich beim **erhöhten Niveau (LK)**. Ein logistisches Modell belegt deshalb nicht automatisch ein HE-GK-Ziel zu Q2.1.
- Die aktuellen HE-GK-Views (`de-he-gk`, Varianten G8/G9, `de-he-sekii-gk`) referenzieren weder `bf17cada` noch seinen einzigen kanonischen Parent `5ebfc509-...`. Sie stellen dieses Bild für **HE GK derzeit nicht als Zielbild** bereit. Die HE-LK-Views referenzieren den Parent als Ziel-Unterbaum; dort kann das Bild auf bereits in Q1.3 behandeltes logistisches Wachstum zurückgreifen. Die abstrakte GK/LK-Tagliste oder globale `applicability` im Canon ist daher kein Beleg für effektive HE-GK-Sichtbarkeit.
- In anderen Länder-Views wird der Parent in zahlreichen GK-Projektionen als Target-Unterbaum referenziert (34 GK-Dateien beim aktuellen Stand). Das Bild zeigt für diese Zielgruppen nur eine logistische LK-nahe Modellklasse. Ob deren jeweils **aktuelle direkte Quellen** das Beispiel tragen, wurde hier nicht flächendeckend geprüft. Aus der Bilddatei allein folgt deshalb keine globale V-Freigabe für alle GK-Sichten.

## Fachliches Urteil und nächster Eingriff

**Für HE GK aktuell kein akuter sichtbarer Bildfehler**, weil `bf17cada` in den HE-GK-Views nicht Ziel ist. **Für HE LK KEEP als fachlich korrektes Beispiel** möglich; die Verbindung von Q2-Ziel und Q1.3-LK-Beispiel soll in der D-/Quellenprüfung aber ausdrücklich erklärt werden. **Für andere GK-Zielprojektionen Kontext-Hold**, bis Quelle und effektive Sichtbarkeit pro Land geprüft sind; wo Logistik nicht zum GK-Stoff gehört, kann dieses alleinige Bild fälschlich den Inhalt des Lernziels definieren. Ein korrektes logistisches Rechenbeispiel ersetzt keine passende GK-Bildbindung.

Reparaturmöglichkeiten nach Quellenprüfung: bestehendes Bild für fachlich belegte LK-Sichten behalten und betroffene GK-Bindungen auf ein in deren Quelle gestütztes Beispiel (etwa einfache Wurzel- oder gebrochen rationale Modellfunktion) verweisen, oder Ziel/Views passend aufteilen bzw. eingrenzen. Kein rein technischer Hash-Wechsel und kein genereller Austausch eines guten LK-Bildes ohne belegten Fehler.
