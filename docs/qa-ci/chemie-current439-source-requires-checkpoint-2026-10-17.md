# Chemie: Quellen- und Vorbedingungsarbeit vom 17. Oktober

## Aktiver Stand und Arbeitsstand

Aktiv bleibt **Chemie M6 mit 231/402 streng abgeschlossenen fachlichen
Lernzielen**. Mathematik 807, Physik 478, Biologie 397 und
Wirtschaftswissenschaften 346 behalten ihre M7-Untergrenzen.

Der aktuelle inaktive Chemie-Kandidat enthält **650 Knoten, 439
curricularAtomic-Ziele und 439 P-Datensätze**. Er setzt den
[vorherigen 439er-Checkpoint](chemie-current439-reviewed-working-checkpoint-2026-10-16.md)
fort. Seine Dateien liegen jetzt unmittelbar im Repository unter:

```text
curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/
  chemie-current439-source-requires-working-checkpoint-20261017-v1/
```

Die Kandidaten, abgeschlossenen Teilprüfungen und offenen Autorenbefunde
werden gemeinsam gesichert. Die aktive zentrale Registry wird dadurch noch
nicht auf diesen Kandidaten umgestellt. **Aktiver Nettozuwachs: 0.**

Die Sicherung umfasst **2.227 Dateien** mit rund 418 MB. 272 Aliasbindungen
vermeiden doppelte Kopien; 53 davon verwenden bereits eingecheckte Dateien.
Das [Manifest](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-source-requires-working-checkpoint-20261017-v1/MANIFEST.inactive-current439-source-requires.json)
und der dortige `verify_checkpoint.py` prüfen die Sicherung vollständig aus
dem Repository heraus. Dieser Check ist bestanden. Große technische
Diagnosecaches und amtliche Volltext-Arbeitskopien bleiben lokal.

## Tatsächlich geleistete Arbeit

| Paket | Ergebnis | Noch offen |
| --- | --- | --- |
| Bremer Oberstufenquelle | 232 strukturierte Quellaussagen gegen das Original geprüft; sechs konkrete Text-/Bindungsfehler im Nachfolger korrigiert und von beiden unabhängigen Prüfern gezielt nachgeprüft. Optionalität, Kursunterschiede, Beispiele und überlappende Aussagen bleiben unterschieden. | Vollständige Zuordnung dieser Aussagen zu den aktuellen kanonischen Kompetenzen. 232 Quellaussagen sind keine Behauptung von 232 zusätzlichen Pflichtzielen. |
| Sächsischer Indikatorversuch | Der Quellen-Nachfolger trennt linke Anforderungsspalte und rechte Hinweise. Ein vollständiger Aufgaben-/Materialnachfolger verlangt die tatsächliche betreute eigene Untersuchung; zwei gezielte unabhängige Prüfungen liegen vor. | Aktuelle Beschreibungs- und Kontextbindung nach Abschluss der Vorbedingungskorrektur. |
| Konzentrationsverhältnis | Das mehrdeutige Verhältnis wurde ausdrücklich als `cB/cA` formuliert. Fachliche Folgeprüfungen und zwei neue unabhängige Beschreibungsprüfungen liegen vor. | Übernahme in den abschließenden gemeinsamen Integrationsstand. |
| Vorbedingungen | 83 konkrete Verbindungen und 315 Bundesland-/Vorzielpaare unabhängig geprüft. 51 zunächst übereinstimmend negative Verbindungen und ein weiterer nach begründeter Dissensklärung negativer Link sind identifiziert. | Der reine Löschkandidat mit 51 entfernten Verbindungen ist ausdrücklich ungeprüft als Gesamtlösung: engere notwendige Grundlagen, Sicherheitskompetenzen und veränderte Kontexte müssen erhalten bzw. geprüft werden. Die ergänzende Autorenprüfung ist noch nicht abgeschlossen. |
| Quellenbelegte Erwerbsunterstützung | Für 21 Paare stimmen beide positiven Prüfungen in einem konkreten fachlichen Quellenanker überein. Der technische Registry-Entwurf erhält alle 340 bestehenden Einträge. | Aktueller vollständiger Vorbedingungspfad, normale Geltungskompilierung und Quellen-Gates. Ein weiteres positives Paar verwendet unterschiedliche benachbarte Quellzellen und bleibt zur gezielten Klärung offen. |
| FCKW-/HFKW-Aufgaben | Ein konkreter Materialmangel ist dokumentiert: Die Profile nennen Dossier und Werbetext, deren vollständige aktuelle Objekte nicht gefunden wurden. | Vollständige Materialien erstellen und gezielt unabhängig prüfen. Das Vorhandensein eines Aufgabenbriefs schließt diese Lücke nicht. |

Die abgeschlossenen Teilprüfungen sind wissenschaftliche Maschinen-QS.
Sie bescheinigen keine menschliche Freigabe, Erprobung oder tatsächliche
Lernendenleistung. Historische FIRST-Urteile bleiben erhalten; informierte
Folgeprüfungen sind als solche gekennzeichnet.

## Konkrete Korrektur am QS-Werkzeug

Die Memory-Sichtbarkeitsprüfung im normalen Qualitätsbericht berücksichtigt
nun dieselbe spezifische `target`-/`prerequisiteOnly`-Zuordnung und denselben
GK-/LK-Filter wie die eigenständige Memory-Prüfung. Dadurch wird ein nur im
LK sichtbares Thema nicht als fehlende GK-Memory-Pflicht gemeldet.

Der neue Regressionstest prüft drei Fälle: kein falscher GK-Befund, ein
weiterhin erkannter fehlender LK-Memory-Knoten und eine spezifische
`prerequisiteOnly`-Ausnahme. Er ist in die bestehende
`test:deep-understanding-rollout`-Prüfung eingebunden. Der gezielte Test ist
auf dem tatsächlichen Arbeitsverzeichnis bestanden; ein weiterer unabhängiger
Code-Review hat keinen Blocker gefunden.

Auch der vollständige `test:deep-understanding-rollout`, die
Projektionstests, die Terminologie-/Dokumentindex-Prüfungen und die zehn
geschützten Reifegrad-Untergrenzen bestehen. Der normale Qualitätsbericht
ist mit dem korrigierten Prüfer regulär neu berechnet; Chemie bleibt M6,
die vier abgeschlossenen Fächer bleiben M7.

Die vollständige Schema-Prüfung besteht mit **110.844 geprüften Dateien**.
Dokumentlinks werden gegen die veröffentlichbare Dokumentstruktur geprüft;
das Manifest ist deshalb über seinen Repository-Link erreichbar.

## Nächste Integration

1. Quellenzuordnungen und den endlichen Vorbedingungskandidaten fertigstellen.
2. Die konkret betroffenen Aufgaben-, Seiten- und Kontextnachweise prüfen.
3. Den geprüften Gesamtstand integrieren und die normalen Quellen-,
   CQR-303-, Layer-A-, Memory-, Bild- und Reifegradprüfungen bündeln.
4. Schema-Prüfung, Lernzielbücher und erforderliche CI für den neuen Commit
   bestehen lassen.

Ein früherer technischer Lauf mit 439/439 im zentralen Bericht beweist die
noch offene Quellen- und Geltungsintegration nicht. Für den hier gesicherten
neuesten Kandidaten wird **kein M7-Abschluss** behauptet.

Künftige fachliche Arbeit wird paketweise im geöffneten Repository sichtbar
gesichert. Isolierte Ausführungsumgebungen dienen den Prüfungen; ein nur dort
vorhandener Arbeitsstand gilt nicht als an GitHub übergebener Fortschritt.
