# Zwei fehlende direkte Physiknachweise – Autorentwurf

Erstellt am 15. November 2026; genaue Ausführungszeiten stehen in den JSON-Belegen.
Eigene SkillPilot-Aufgaben, CC-BY-4.0. Keine Änderung an den zwei gewöhnlichen
Lernzielen, ihren Voraussetzungen oder den vollständigen positiven Evidenzprofilen.
Die neue Aufgabe hat jeweils nur ihr zugehöriges gewöhnliches Ziel als Voraussetzung
und Abdeckungsbehauptung. Beide sind `needs_review` und noch nicht aktiv integriert.

## Gelesene Primärquellen und konkrete Übertragung

- [OpenStax University Physics 2, Coulomb's Law](https://openstax.org/books/university-physics-volume-2/pages/5-3-coulombs-law):
  Vorzeichen und Kraftbetrag werden getrennt, beide Wechselwirkungskräfte bestimmt
  und eine Änderung vor der Rechnung vorhergesagt. Wir schreiben eine eigene
  Zahlenkombination und einen zweiten unabhängigen Fall; keine Übernahme von Aufgaben.
- [OpenStax University Physics 2, Electric Field](https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field):
  Die Quellenkonfiguration wird von der kleinen Testladung unterschieden. Zwei
  entgegengesetzt geladene Proben müssen dasselbe Quellenfeld ergeben. Eine absichtlich
  inkonsistente dritte Angabe prüft die begründete Entscheidung statt bloßer Substitution.
- [OpenStax College Physics 2e, Rayleigh Criterion](https://openstax.org/books/college-physics-2e/pages/27-6-limits-of-resolution-the-rayleigh-criterion):
  Der dortige Versuchsvorschlag mit zwei Papierlinien und Betrachtungsabstand liefert
  die niedrigschwellige Grundidee. SkillPilot ergänzt zwei eigene Kontrastbedingungen,
  vorher festgelegte Antwortregeln, gemischte Kontrollkarten, Wiederholungen und
  Unsicherheitsbereiche. Die Kreisblendenrechnung ist ein begrenzter Modellvergleich;
  sie ist kein persönlicher Messwert und beweist keine Sehdiagnose.
- [RWTH Aachen, Auflösungsvermögen des Auges, Op-72](https://sammlung.physik.rwth-aachen.de/index.php?id=Op-72&sec=Optik&subsec=Das+Auge):
  Das schulische Demonstrationsprinzip verbindet definierte Mustergeometrie und
  Beobachtungsentfernung mit einem erkennbaren Kriterium. Wir verwenden eigene
  Linienpaare, keine übernommenen Landoltring-Abbildungen oder klinischen Normwerte.

Die vier Quellen wurden tatsächlich im Web gelesen; die Göttinger Fundstelle wurde
wegen eines Ladefehlers nicht als gelesene Inhaltsgrundlage verwendet. Unsere genaue
4/5-Regel, Kontrastvariation und Bewertungsraster sind didaktische Autorenentscheidungen,
keine durch diese Quellen nachgewiesene Wirksamkeitsstudie. Keine Quelle wird als
offizielle Länderplan-Zuordnung dieser neuen Aufgaben ausgegeben.

## Unabhängig zu prüfender vollständiger Inhalt

`exact-inputs.json` enthält beide vollständigen gewöhnlichen Ziele und P-Profile.
`candidate.json` und die zwei `*.goal.json` enthalten die vollständigen neuen Aufgaben
mit deutscher und englischer Aufgabenstellung, Lösung und tatsächlich vom Backend
gelesenen zweisprachigen `scoring.steps[].description`. Die Markdown-Fassungen bilden
denselben Inhalt ab. `author.py` dokumentiert die erstmalige Erstellung.

Die unabhängige Prüfung muss beide P-Profile vollständig gegen beide Sprachen lesen,
alle Zahlen und Richtungen neu rechnen, die echte Eigenleistung und zweite Durchführung
des Augenversuchs kontrollieren, schwache/uneindeutige Ergebnisse fair behandeln und
Lücken in einzelnen Pflichtleistungen am verbindlichen Raster prüfen. Die mitgelieferte
Autorenmatrix ist eine überprüfbare Behauptung, kein unabhängiges Review.

Bei der Augenaufgabe ist insbesondere zu prüfen, ob das vorab festgelegte Verfahren
eine praktisch durchführbare begrenzte Schwellenbestimmung gestattet, ob alle Daten
tatsächlich selbst erhoben werden müssen und ob Streuung, systematische Einflüsse,
ein unaufgelöster Kontrastunterschied sowie das fremde Kreisblendenmodell korrekt
getrennt bleiben. Es sind keine echten Lernenden oder Messungen verwendet worden.

## Einbindung nach erfolgreicher Inhaltsprüfung

Die zwei neuen Aufgaben und eigenen Markdown-Artefakte benötigen native Typ-/Schema-,
Graph-, Anwendbarkeits- und Projektionsprüfung, eine konkrete erreichbare Platzierung,
aktuelle transparente Aufgabenreview-Belege und passende freigegebene Statusbindung.
Die bestehenden gewöhnlichen Ziele/P dürfen dabei nicht still geändert oder ihre
historischen Reviews neu behauptet werden. Sichtbare Rückverweise im Lernzielbuch
können sich durch neue Aufgaben verändern und sind ausdrücklich zu kontrollieren.
Dieser Entwurf behauptet keine native QA, Freigabe, menschliche Prüfung oder Main-CI.
