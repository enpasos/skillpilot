# E.1-Passmarken: lesender Fachbefund vom 24. November 2026

**Die vier CI-Befunde sind echt.** Die aktuellen vollständigen Bewertungsverträge von DFD, NVX, ZB und D′ verlangen trotz mehrerer bepunkteter Kriterien volle Punktzahl. Alle vier sind gegenüber der tatsächlichen CI-Basis neu oder materiell geändert. Die bisherigen fachlichen Reviews schützen wesentliche Nachweise gegen kompensierendes Fehlbestehen, erfüllen damit aber noch nicht die zusätzliche Produktvorgabe, dass eine fachlich hinreichende Abgabe trotz eines kleinen Fehlers bestehen können muss. Kein Gatefehler, veralteter Strukturpin oder Metadatenrennen erklärt diese vier Meldungen.

Dies ist ein neuer lesender Befund von Codex `/root/sachsen`, keine Freigabe eines Nachfolgers. Keine Aufgabe, Schwelle, Punktzahl, Schranke, Abdeckung, Freigabe oder historische Evidenz wurde geändert. Die historischen A/B-Urteile bleiben erhalten. Die nachstehenden synthetischen Gegenfälle wurden hier an der **aktuellen** Rubrik bewertet. Sie ersetzen weder die zwei vollständig benoteten Abgaben unter einem erst noch festzulegenden Nachfolgevertrag noch dessen erforderliche unabhängige Fachreviews.

## Reproduktion und Produktvorgabe

Der Hauptlauf der Jobvorgabe verwendet **Python 3.10** und meldet die vier unten genannten Fälle. Zusätzlich wurde die Originalschrittfolge aus `.github/workflows/ci.yml:815` über das bereitgestellte `run-steps.py` ohne veränderte Prüferargumente und mit derselben Basis `2a70254ca457b0a13e17246fe065a22660c3cf03` ausgeführt. Diese Basis ist zugleich der tatsächliche Git-Mergebase von `4724a3908ef4b8e7fb64dee23b386e3b2a329276`. Dieser zusätzliche lokale Gegenlauf verwendete **Python 3.12.9**; er wird ausdrücklich nicht als Wiederholung unter Python 3.10 ausgegeben. Er bestätigt dieselben vier Meldungen und denselben Fehlerstatus. Der zusätzliche Lauf begann und endete am 24. November 2026 um 08:55:43 UTC, Exitcode 1:

```sh
python3 -B ../scripts/test_exam_pass_marks.py
python3 -B ../scripts/check_exam_pass_marks.py --base "$SEMANTIC_ROUTE_POLICY_BASE"
```

Die beiden Unit-Tests in `test_exam_pass_marks.py` **bestehen**. Erst der nachfolgende Katalogcheck scheitert mit exakt den vier unten genannten IDs: 1.055 bepunktete Prüfungen, davon 138 mehrteilige Vollpunktprüfungen insgesamt. Die 134 übrigen historischen Vollpunktfälle sind nicht diese vier neuen/geänderten Verstöße. Beide Skripte sind gegenüber der CI-Basis byteidentisch.

`requires_revision` vergleicht ausschließlich `taskContent`, `taskContentEn`, `solutionContent`, `solutionContentEn`, `scoring` und `coveredGoalIds`. Änderungen etwa nur an `reviewStatus` lösen keinen neuen Verstoß aus. Eine schon alte Vollpunktschwelle bleibt dagegen prüfpflichtig, sobald einer dieser materiellen Werte geändert wird. Genau das trifft auf D′ zu. NVX hat in der CI-Basis noch keinen Bewertungsvertrag.

Die bindende [Produktvorgabe](../../../../AGENTS.md) lautet bei den Bewertungsregeln, derzeit Zeilen 2299–2307:

> For new or revised SkillPilot assessments with multiple points or scoring steps, use a passing score below full marks. It must suffice on its own.

Sie verlangt außerdem, eine Abgabe mit nachgewiesenem Kern trotz eines kleinen Fehlers und eine Abgabe mit fehlender als nachgewiesen beanspruchter Fähigkeit tatsächlich zu benoten. Erstere muss bestehen können, letztere unter der Schwelle bleiben. Abhilfe kann eine fachlich geprüfte Änderung von Aufgabe, Gewichten oder Abdeckung erfordern. Eine zusätzliche nicht numerisch abgebildete Bestehensschranke ersetzt die allein genügende Schwelle nicht. Ein bloßes Herabsetzen der Zahl, eine Ausnahme im Checker oder eine andere Vergleichsbasis wäre keine sachliche Erledigung.

## Exakte aktuelle Bewertungsverträge

Alle vier aktuellen vollständigen kanonischen Zielobjekte stimmen strukturell exakt mit den angegebenen unveränderten `current-goals/*.current.goal.json` überein. Die SHA-Werte in der folgenden Tabelle sind deren **Raw-Datei-SHA256**. Der aktuelle kanonische Physikkatalog hat Raw-SHA256 `c5e2d70a0fe45e470a3f3fd59ad82c220352561dba35f2ce3f968eb92a3def51`.

| Aufgabe / vollständige UUID | CI-Basis → aktuell | Aktuelle direkte Abdeckung | Raw-SHA256 des aktuellen ganzen Zielobjekts |
| --- | --- | --- | --- |
| DFD `dfd2628f-b44e-51b3-86e8-99158861be8c` | 10/16 → 16/16 | `4a2bf015-052b-4af0-aed7-324259fa1a8a`, Verkehr/Sicherheitsabstände | `3d698f7e9c16a0e7837be0b796e8e1cc8d92c99cd16960e4946f8968303a72ea` |
| NVX `4ea1b93f-2dba-59ac-87ab-29af6c55cc37` | kein Vertrag → 16/16 | `0fee53f2-1c02-5b12-9b6c-aa9fa462d921`, Geschwindigkeit beim Wurf als Vektor | `aa29afc76356544e72b2deafc87cbe175d907592c17a7e94cb40644e6ceddcb6` |
| ZB `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` | 22/36 → 36/36 | `d6dc0e02-831d-4894-a61a-852bcc74f147`, Idealisierungen/Modellgrenzen | `7403d384a8e1b459410f1f545d1b9cefb0469cceef70663743bbc797ec65b874` |
| D′ `a8dc0290-9f80-5763-8943-e16b8d2aa860` | 20/20 → 20/20, materiell geändert | `e4b38061-1f28-43ad-8371-a3e7c0e81856`, gleichmäßige Beschleunigung | `78fc60eb42b54c884c7a8499ab549b028455a41cffc505c820b01583639f80db` |

Die ganze Punktzahl ist Bestandteil jedes aktuellen Vertrags; sie wird hier weder stillschweigend verworfen noch als künftige Zielzahl empfohlen. Alle Änderungen des Bewertungsmaterials gegenüber der CI-Basis sind im temporären JSON mitsamt den ganzen aktuellen Aufgaben gebunden, siehe Nachweise unten.

## DFD: zwei zu grobe Acht-Punkte-Zeilen

**Historischer Entscheid.** Runde 1 A schlug 16/16 mit vollständigen Zeilen vor; B verlangte bei unverändert 10/16 die Entnahme der direkten Ansprüche. Die spätere tatsächlich ausgeführte Runde 3 A/B akzeptierte die genaue 16/16-Fassung mit nur noch dem Verkehrsziel. Die Präzisierung auf ein stehendes Hindernis, die gegebenen Bremswege und die qualitative Verdoppelungs-/Vervierfachungsbegründung ist fachlich sinnvoll. Damit ist die Vollpunktschwelle aber noch kein zulässiger Umgang mit kleinen Fehlern.

**Hier benotete Deltaabgabe DFD-K (Kern mit kleinem Fehler).** Teil A liefert vollständig Längen-/Zeitkalibrierung, beide Koordinaten, lineares `x(t)`, annähernd quadratische Fallstrecke und die Parabel bei derselben Zeit. Teil B liefert die richtigen Umrechnungen und Reaktionswege 13,9 m/27,8 m, die gegebenen 14 m/56 m, den ersten Gesamtweg 27,9 m, die richtige Erklärung „Reaktionsweg doppelt, Bremsweg vierfach, Summe daher etwa dreifach“ sowie Wetter als Grenze. Einziger Additionsfehler: `27,8+56=83,7 m` statt 83,8 m. Das richtige Verhältnis und der physikalische Urteilskern bleiben erkennbar. Bewertung nach den bestehenden Zeilen: `motion_models_1=8/8`; `motion_models_2<8/8`, weil die Zeile beide richtigen Gesamtwege ausdrücklich für volle Punkte verlangt. Damit **unter 16/16 und nicht bestanden**; bei ganzzahligen BE höchstens 15/16. Eine genaue Aufteilung der zweiten Zeile in einzelne Fehlerpunkte ist im Vertrag nicht festgelegt; hier wird keine neue 7/8-Unterrubrik erfunden.

**Hier benotete Deltaabgabe DFD-F (wesentlicher Nachweis fehlt).** Teil A bleibt vollständig richtig. Teil B besteht ausschließlich aus „50 km/h=13,89 m/s; 100 km/h=27,78 m/s; Reaktionswege 13,89 m und 27,78 m; Anhaltewege 27,89 m und 83,78 m.“ Kein Urteil zur Aussage, keine Erklärung der unterschiedlichen Skalierung und keine Modellgrenze kommen an anderer Stelle vor. Die Rechnungen erhalten ihre nachgewiesenen Teilpunkte; die ganze zweite Zeile kann nicht voll sein. Gesamt ebenfalls **unter 16/16, nicht bestanden**. Die genaue Teilpunktzahl dieser Sammelzeile ist aktuell unterbestimmt. Bei der alten 10er-Schwelle konnten bereits A=8 plus zwei Rechenpunkte ohne Verkehrsbeurteilung bestehen; genau diesen realen Fehler adressierten die früheren Reviews.

**Offene Arbeit.** Die beiden großen Zeilen benötigen eine nachvollziehbare Teilpunktzuweisung, die die Verkehrsbeurteilung schützt und kleine Einzelrechenfehler verkraftet. Eine Zahl unter 16 ist dadurch noch nicht geprüft. Ein neuer finaler Vertrag muss beide Arten vollständiger Abgabe tatsächlich benoten; Gewichte, direkte Abdeckung und Schutz der wesentlichen Leistung sind gemeinsam zu prüfen. Eigene Wurfexperimente oder Bezugssystemkompetenz dürfen dabei nicht als zusätzliche Abdeckung eingeführt werden.

## NVX: fünf getrennte Zeilen, aber keine Fehlertoleranz

**Historischer Entscheid.** Beide tatsächlichen Runde-1-Reviewer unterstützten die 16/16-Verschärfung gegen den belegten Pass ohne Wagenbezug und verlangten die Entnahme des ganzen BZ-Ziels. Die aktuelle Fassung hat nur VEC als direkte Abdeckung. Der damalige geprüfte Kandidat enthielt noch den zu breiten zweiten Anspruch; dessen Entfernung ist eine ausdrücklich verlangte Nachkorrektur, keine behauptete neue blinde exakte Vollabnahme des ganzen aktuellen Objekts. Die aktuelle Datei `aa29…` ist deshalb vom ursprünglichen Kandidaten `d3b4…` zu unterscheiden.

**Hier benotete Deltaabgabe NVX-K.** Alle Komponenten mit Begründung, beide maßstäblichen Pfeilkonstruktionen, Winkel 56,3° mit Begründung sowie die vollständige Wagenbeschreibung und Pfeiladdition sind richtig. Beim ersten Betrag steht richtig `sqrt(2,0²+1,5²)=2,5 m/s`. Beim zweiten wird der richtige Pythagorasansatz benutzt, aber `|v|²=2,0²+3,0²=12 (m/s)²` und danach `|v|=sqrt(12) m/s≈3,46 m/s` geschrieben: ein einzelner Additionsfehler. Die Vektorbildung und Methode sind vorhanden; ein richtiges exaktes zweites Betragsresultat steht nirgends zusätzlich und wird deshalb auch nicht übergangen. Bewertung der nicht betroffenen Zeilen: `vv_1=4`, `vv_2=4`, `vv_4=2`, `vv_5=3`, zusammen 13. `vv_3` enthält die richtigen beiden Ansätze und ein richtiges Zahlenresultat, verdient also Teilpunkte, aber wegen des ausdrücklich verlangten etwa 3,6-m/s-Ergebnisses keine vollen 3. Somit **unter 16/16, nicht bestanden**; bei ganzzahligen BE höchstens 15/16. Die verbindliche Verteilung der drei Punkte innerhalb `vv_3` ist nicht weiter aufgeschlüsselt; der vorliegende Befund erfindet diese nicht.

**Hier benotete Deltaabgabe NVX-F.** Teile 1, 2, 4 und 5 werden vollständig korrekt gelöst, einschließlich der Komponentenpfeile, des Auftreffwinkels und der Wagen-Pfeiladdition. Teil 3 bleibt leer; nirgends sonst werden die beiden Gesamtgeschwindigkeitsbeträge bestimmt oder berechnet. Die Wagenantwort enthält nur die verlangte Relativkomponente und graphische Addition, keinen zusätzlich richtigen Gesamtbetrag. Exakt `4+4+0+2+3=13/16`, **nicht bestanden**. Damit fehlt die im heutigen allein beanspruchten VEC-Ziel ausdrücklich verlangte Betragsbestimmung. Runde 1 B nennt bereits genau diesen 13-Punkte-Gegenfall. Der andere historische Gegenfall „Wagenteil 5 leer“ ergibt ebenfalls 13/16, ist nach Entfernung der BZ-Vollabdeckung aber kein geeigneter alleiniger Beleg einer fehlenden VEC-Facette; er wird nicht als solcher umgedeutet. Ein vorgegebenes Bezugssystem liefert weiterhin keinen Nachweis eigenständiger Bezugssystemwahl.

**Offene Arbeit.** Die Verteilung innerhalb mehrteiliger Kriterien und die mindestens erforderlichen VEC-Facetten müssen an einer allein genügenden niedrigeren Schwelle gemeinsam geprüft werden. Eine konkrete neue Schwelle wird hier nicht vorgeschlagen oder als qualifiziert erklärt. Folgefehler müssen wie bisher nur an der Entstehungsstelle belastet werden. Keine neue BZ-Abdeckung und keine Planungsgutschrift folgen aus diesem Befund.

## ZB: 36 Einzelpunkte schützen MOD durch absolute Fehlerfreiheit

**Historischer Entscheid.** Bei 22/36 konnte die ganze Modellfrage 6 fehlen und 30/36 erzielt werden. Runde 1 A wollte die Modellkriterien zusätzlich sperren; B verlangte bei unverändertem Schnitt die Entnahme von MOD. Der daraufhin tatsächlich blind geprüfte Runde-3-Nachfolger mit 36/36 und der Rundungspräzisierung wurde von A und B exakt akzeptiert. Diese Annahmen sind echte historische Urteile, beweisen aber keine Prüfung des AGENTS-Kriteriums „kleiner Fehler darf bestehen“. Die von Runde 1 A vorgeschlagene zusätzliche Bedingung wäre ihrerseits kein Ersatz für eine numerische Schwelle, die allein genügt.

**Hier benotete Deltaabgabe ZB-K.** Alle 36 Leistungen werden wie im Referenzweg erbracht, einschließlich sämtlicher Modellbegründungen in 6.1–6.6. Einziger Fehler ist in 3.4 die letzte Multiplikation `x_F=2,00·0,500=1,01 m`; Ansatz, Auftreffzeit, Bahn, Diagramme, übrige unabhängige Rechnungen und alle physikalischen Aussagen sind richtig. Das ist ein fehlerhaftes Produkt, keine bloß zulässige Rundung. Kriterium `…-3-4=0/1`; alle übrigen 35 Kriterien `1/1`. **35/36, nicht bestanden**, obwohl MOD vollständig gezeigt ist. Kein Folgefehler wird mehrfach belastet.

**Hier benotete Deltaabgabe ZB-F.** Alle Leistungen sind richtig, außer dass die Abgabe nirgends begründet, unter welchen räumlichen und körperbezogenen Bedingungen der Massepunktansatz für die Bahnvorhersage passt: 6.2 bleibt aus. Unter 6.1 steht lediglich die richtige Definition „Die Schwerpunktposition wird als Punkt dargestellt“; das nennt die Darstellung, ersetzt aber die fehlenden Bedingungen kleiner Ausdehnung und unwesentlicher Orientierung/Rotation/Verformung nicht. Es gibt auch sonst keine gleichwertige Anwendbarkeitsbegründung. Kriterium `…-6-2=0/1`, übrige 35 Kriterien `1/1`: ebenfalls **35/36, nicht bestanden**. Das ist ausdrücklich der von Runde 3 B benannte Auslassungsfall. Der breitere frühere Gegenfall „ganze Frage 6 leer, Fragen 1–5 vollständig“ erzielt exakt **30/36**; er bestand beim alten 22er-Schnitt ohne jedes MOD-Kriterium.

**Offene Arbeit.** Diese beiden 35-Punkte-Abgaben zeigen das konkrete Problem einer bloßen Schwellenabsenkung unter unveränderten Gewichten: Die Punktsumme unterscheidet kleinen Rechenfehler und fehlende beanspruchte Modellbegründung nicht. Erforderlich ist ein neuer gemeinsam geprüfter Bewertungs-/Abdeckungsvertrag; die bestehende Aufgabe muss dafür nicht erweitert werden. Hier wird weder eine neue Zahl noch eine Zusatzschranke aktiviert. Das Material bleibt eine Modellaufgabe mit konstruierten Daten; es belegt keine eigene Durchführung eines Wurf- oder Fallversuchs.

## D′: alte Vollpunktschwelle, neue Aufgaben- und Rubrikbytes

**Historischer Entscheid.** 20/20 bestand schon in der CI-Basis. Die aktuelle Aufgabenfassung verlangt jedoch die Programmwerte bei 5 s ausdrücklich, und die Rubrik akzeptiert ursprüngliche wie verschobene Zeit sowie das tatsächlich gegebene Kontrollintervall. Diese materiellen Korrekturen sind richtig und wurden in Runde 3 von A und B angenommen. Damit ist der bisher historische 20/20-Vertrag erneut prüfpflichtig; die gleiche UUID und gleiche Zahl schaffen keinen Metadaten-Bestandsschutz.

**Hier benotete Deltaabgabe D′-K.** Die vollständigen beiden Fälle, alle sechs Graphen, Anfangswerte, Umkehr, vorzeichenbehafteten Flächen, Ortsänderung 2 m, Strecke 2,50 m, Intervallprüfung sowie Stoppzeit 3 s und Stoppweg 9 m sind richtig. Die Fortsetzung wird als rückwärts gerichtete Fahrt erkannt und ihre Ungeeignetheit für ein stehenbleibendes Fahrzeug begründet. Einziger Fehler: Nach dem richtigen Ansatz `s(5)=6·5−5²` steht `4 m` statt `5 m`; `v(5)=−4 m/s` ist richtig. Zeilen 1–4 ergeben 16/16. Zeile 5 kann wegen der verlangten richtigen numerischen Prüfung nicht voll sein, obwohl deren Methode und Geltungsbereich begründet sind: **unter 20/20, nicht bestanden**; bei ganzzahligen BE höchstens 19/20. Die vier Punkte dieser Sammelzeile sind nicht in eindeutige Unterpunkte zerlegt.

**Hier benotete Deltaabgabe D′-F.** Eine ansonsten richtige Abgabe enthält weder in A noch in B ein Beschleunigungsdiagramm oder eine gleichwertige graphische Darstellung; nur die t-s-/t-v-Graphen und Zahlen sind vorhanden. Zeile 1 und Zeile 4 verlangen jeweils drei Diagramme. Beide sind damit unvollständig; die übrigen Zeilen 2, 3 und 5 erhalten bei ihren vollständigen Leistungen 12/12. Unter ganzzahligen BE ergibt sich **höchstens 18/20, nicht bestanden**. Eine noch genauere Aufteilung der beiden Sammelzeilen ist im aktuellen Vertrag nicht festgelegt. Eine bereits anderswo gegebene gleichwertige Darstellung wäre selbstverständlich anzurechnen; der Gegenfall schließt sie ausdrücklich aus.

**Offene Arbeit.** Ein Nachfolger muss die vollständige Koordination der drei Diagrammarten und ihre physikalische Deutung absichern und trotzdem den kleinen Endrechenfehler verkraften. Das erfordert transparente Teilpunkte und die beiden tatsächlich benoteten vollständigen Grenzabgaben unter dem finalen Vertrag. Die normale hessische Pflichtaufgabe D `f13ca187…` ist davon zu unterscheiden: D hat unverändert 17/20 und wird von diesem Viererbefund nicht beanstandet.

## Bindungen, Freiwilligkeit und notwendige Folgeschritte

DFD und NVX sind vorhandene Übungsangebote; ZB ist in Hessen freiwillig; D′ besitzt die separat geprüften unteren Angebote und wird im hessischen E.1-Vertrag durch D ersetzt. Ein freiwilliges Angebot unterliegt derselben Bewertungsregel. Keine der vier Aufgaben erzeugt in der aktuellen E.1-Planungsfreigabe einen zusätzlichen Kredit. Der einzige bestätigte Planungskredit bleibt BES aus D; die vier Pflichtteile A–D und ihre Grenzen werden durch diese lesende Feststellung nicht geändert. Ebenso bleiben die vollständigen Quellen-/Stufenbefunde erhalten.

Die offene Arbeit besteht in vier fachlich und maschinell konsistenten Nachfolgeverträgen oder einer anderweitig ausdrücklich autorisierten Auflösung des Angebotsstatus. **Eng begrenzte, von beiden tatsächlichen Reviewrunden getragene Bewertungsreparaturen sind erlaubt. Bislang liegt jedoch für keinen der vier veränderten Verträge eine doppelte Freigabe einer Teilpunktfassung vor. Änderungen am Zuschnitt oder Anerkennungsumfang erfordern eine getrennte Entscheidung.** Dieser lesende Befund aktiviert deshalb selbst keine neue Fassung. **Vor jeder künftigen Freigabe sind zwingend zwei vollständige, tatsächlich benotete Abgaben am endgültigen Vertrag zu dokumentieren:** Kern trotz kleinem Fehler besteht; fehlende beanspruchte Kernleistung fällt durch. Danach sind die erforderlichen unabhängigen Urteile, falsche-Pass- und falsche-Fail-Prüfungen sowie die nativen Vertragsprüfungen zu erneuern. Die vorliegenden Deltafälle und Obergrenzen sind keine bereits akzeptierte neue Schwelle und keine zwei neuen unabhängigen Rezensionen.

Eine materielle Korrektur darf historische Nachweise nicht überschreiben. Sie benötigt begrenzte Nachfolger für die tatsächlichen Aufgaben-/Rubrik- und Quellenangebotsbindungen sowie alle hiervon abhängigen strikten Payloadtests. Für Änderungen des Anerkennungsumfangs oder des Bewertungsvertrags gilt zusätzlich der bestehende Schutz historischer Lernergebnisse: keine neue Gutschrift aus einem alten Pass. R2-/Planungs-, Material- oder Unit-Release-Bindungen sind anhand ihrer tatsächlichen Inputs erneut zu vergleichen; keine automatische pauschale Neufreigabe. Die aktuelle vierteilige Pflichtstruktur und der eine D→BES-Planungskredit dürfen aus diesem Viererbefund nicht nebenbei erweitert oder geändert werden.

## Nachweise und SHA256

Unveränderte Repo-Belege unter `curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/`:

| Beleg | Raw-SHA256 |
| --- | --- |
| `round1/round-a/response.json` | `ac412b433261ad5615f3f071fe9cfb8391b8637cf7aef362c134621eef87b4e3` |
| `round1/round-b/response.json` | `6c7ea77c79ef185bfc48bc59f5c5a7376afaf439366703ea010539744190a5d8` |
| `round3/round-a/response.json` | `6b953fdc22fdc266c2d908b47186dbc04f0b909fef5caf0f5bb5b9dd286fb69b` |
| `round3/round-b/response.json` | `ec49c0e12eab66e10a8eea9a2e90598942b6f7519f4fee77e12d600de2c47c14` |
| `round3-activation.actual.json` | `70ae2513e177fe7d01a088f8cd9911e3ba61f340eefa7ba6bb538f873e04a76e` |

Prüfgrundlagen:

- `AGENTS.md`: `53518f8f88df46ecab4dc03b539363a89c7f124d6789c3724ece1eacef6daf37`.
- `.github/workflows/ci.yml`: `b285144be947a4a1afc43cc5a48da46736c3ace121b26dcb60ef40960cfd8092`.
- `scripts/test_exam_pass_marks.py`: `4521387fa5198bcdd709e45d2ffd6fb63b89ff1a07d7785d9f082bc646e145c3`.
- `scripts/check_exam_pass_marks.py`: `4532bb5a98bca2423154b6aa4577004b9dc560305cd6fb76a2378a313f8a720f`.

Zusätzlicher tatsächlich ausgeführter **Python-3.12.9-Gegenlauf** mit den Originalprüferargumenten und der echten CI-Basis, bewusst ausschließlich temporär:

- `/tmp/e1-pr186-ci-20261124/curriculum-assessment-proofs/16-check-pass-marks-of-new-and-revised-canonical-assessments.independent-e1-pass-marks.json`.
- Rohlog daneben `.log`, SHA256 `738ed5e40e4f3daff869c7c5328379e963d49fb5b54e6adaecf6fbcad92200f5`.
- `/tmp/e1-pr186-ci-20261124/graph-validation/physics-e1-pass-mark-inputs.actual.json`: vollständige tatsächliche Basis-/Jetzt-Verträge und die jeweils geänderten bewertungsrelevanten Felder; kein synthetischer Eingabeersatz.

Die Markdown-Datei ist die einzige für diesen Auftrag neu geschriebene Repo-Datei. Historische Belege bleiben unberührt; technische Einzeltest-Pässe ändern den dargestellten offenen Produktvertrag nicht.
