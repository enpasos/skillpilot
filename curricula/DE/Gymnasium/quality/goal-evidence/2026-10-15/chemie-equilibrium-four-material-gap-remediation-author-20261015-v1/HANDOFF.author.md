# Vier Materialkorrekturen – Autorenstand

Dieser kleine Nachfolger wurde als **informierter Autor** nach den abgeschlossenen unabhängigen A/B-Prüfungen erstellt. Er enthält keine neue D/P/A-Wertung. Die konkrete Planung wurde vor den Materialänderungen separat versiegelt; spätere fachliche Klarstellungen bleiben ebenfalls als additive, versiegelte Autorenprotokolle erhalten.

| Ziel/Fall | Konkrete Materialänderung |
| --- | --- |
| b7521ac7 /04-b | Der frische Transfer bestimmt eine unbekannte Cu2+-Konzentration aus einem fiktiven korrigierten Leerlaufmesswert. Beide Halbzellen bleiben Metall/Metallion;25°C und Idealnäherung sind ausdrücklich gegeben. Ergebnis:Q=10,c(Cu2+)=0,0100mol/L. |
| 1a51362e /09-b | Die Aktivitätskoeffizienten sämtlicher gelöster Spezies werden ausdrücklich1 gesetzt. Die Konzentrationsrechnung wird innerhalb dieses Idealmodells interpretiert und rubriziert. |
| 0c9fe376 /11-a | Frische chemische Variation: selektive Zn2+-Bindung mit festgehaltenen freien Aktivitäten. Ergebnis:Q=0,0100,E=1,15916V, reversible Rückumsatzarbeit223,68kJ/mol;Ligandenregeneration und Verluste sind nicht in dieser Zellgröße enthalten. |
| 13838147 /12-a | Daten und Nettoreaktion stehen ohne vorgegebene Mechanismusschritte bereit. Die Aufgabe verlangt eigene verschiedene mehrstufige Hypothesen, Bilanz- und Gesetzherleitung sowie die Grenzen der Folgerung. Der Transfer prüft die jeweils selbst gewählten Annahmen;äquivalente Modelle sind zulässig. |

**Minimaler Umfang:** Genau4 ganze Fälle sind geändert;alle28 übrigen ganzen Fallobjekte sind bytegleich, einschließlich12-b mit seiner anderen SSA-/Transientenprüfung. Genau4 Profilkörper wurden passend geändert;12 komplette originale Raw-Profilzeilen und ihre Körper sind bytegleich. Der vollständig lesbare Nachfolger enthält weiterhin32 ganze DE/EN-Fälle und16 ganze Raw-Profile.

**Exakte wissenschaftliche Nachfolger:** `materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json`, `sixteen-profile-bodies.scientific-successor.jsonl` und `sixteen-profiles.raw-E0G0.four-gap-successor.author.jsonl`. Der eindeutige Einstieg für neue unabhängige Reviewer ist `REVIEW-INPUTS.scientific-successor.selector.json`. Er enthält keinen alten Reviewvote. Die Rohdatensätze sind durchgehendE0/G0,needs_human_review,ai_candidate,reviewRunIds=[].

**Prüfung:** Zahlen, Einheitenbezug, Atom-/Ladungserhaltung, Modellannahmen, DE/EN-Entsprechung, Rubrik und Transfer wurden als Autor kontrolliert. Der unveränderte Stockmaterializer hat die4 neuen Raw-Kandidaten strukturell und auf ihre aktuellen Bindungen geprüft:Exit0. Ein erster Lauf zeigte die2000-Zeichen-Grenze eines Profil-Fallbriefs;dieser Brief wurde knapp gefasst, die ganze Falllösung blieb vollständig. Die eigenständige Rechnung korrigierte einen Entwurfs-Rundungswert von223,69 auf223,68kJ/mol. Die früheren Entwürfe/Befunde wurden nicht als Freigabe verwendet.

**Unveränderte Basis:** Canonical52e199c13f1f0e13ffc148d9babd975e04dbee9b2ac3706fbe3e4b0ab06087d3 undSemantic597c71f9a9444e7bf8ffd266c3c4de6f826c34a87f438f36a2ce3f358eba76ee. Kein kanonischer Wortlaut, keine Quelle/Mappingkante und kein Bild wurde geändert. Die nativen v2-Zieltexte/Bilder bleiben Darstellungsbasis;ihre4 alten Profilzusammenfassungen sind kein Nachfolger der geänderten Profilkörper. Technische neue Bindung und echte neue unabhängige Reviewrollen bleiben beim Rootagenten. Der Autor darf die eigene Korrektur nicht unabhängig freigeben.

Die vorhandene temporäre Stockkapsel untertmp wurde wiederverwendet;keine neuen Bilder/Hosts wurden dupliziert. Aktive Registry,Ledger,Runtime,Git und fremde Reviewerroots blieben unverändert. Originale und frühere A/B-Befunde bleiben an ihren bisherigen Pfaden. Es gibt keine Human Approval,Human Trial,beobachtete Schüler-/Laborausführung oder eigene Strict-/M7-Zahl.
