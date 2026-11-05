# Prismen: tatsächliches Lerneinheitspaket und Inhaltsnachnutzung

Stand: 5. November 2026. Dieses Dokument bindet den neu vorbereiteten
Prismenvertrag an die tatsächlichen Quelldaten. Die getrennte unabhängige
maschinelle Prüfung dieses tatsächlichen Einheitsvertrags ist im unten
angefügten Abschnitt mit begrenztem PASS dokumentiert. Der unten bezeichnete
historische Inhaltsreview bestätigt den unveränderten Aufgabenkern; er ist
keine vorweggenommene Abnahme der neuen Integration, menschliche Freigabe,
Lernererprobung, Wirksamkeitsstudie oder Hostabnahme.

## Eigene Zusage und Pflichten

Die Einheit „Volumen und Außenfläche eines geraden Prismas bestimmen“ hat
genau drei eigene Targets:

- `68fb0e78-34f2-5572-8db6-e7f5ebcff70f`: Volumen gerader Prismen berechnen,
  mit kongruenten Schichten begründen und im Kontext mit Volumeneinheit deuten.
- `f1348d40-3872-5e44-8892-3600c811796f`: alle Außenflächen gerader Prismen
  vollständig und ohne Doppelzählung bestimmen und mit Flächeneinheit deuten.
- `e5494c67-aed6-5710-8ae3-51ae147c10e9`: die neue eigene explizite Prüfung
  für genau diese beiden Leistungen.

Es gibt keine Pflichtkinder, keine eigene Karte und keinen künstlichen
Orientierungsmarker. Die bestehenden Memoryreviews der beiden gewöhnlichen
Ziele nennen `no_memory_needed`. Die sechs übrigen Kartenziele und ihre 64
bestehenden Karten werden weder verschoben noch erlassen.

Die normale unveränderte Aufgabe behandelt ein gerades Dreiecksprisma mit
Katheten 6 und 8 cm, dritter Dreiecksseite 10 cm und senkrechter Körperhöhe
20 cm. Sie verlangt die Schichtbegründung und Deutung von
\(V=24\cdot20=480\,\mathrm{cm}^3\) sowie die vollständige Außenfläche
\(O=24+24+120+160+200=528\,\mathrm{cm}^2\).
Die normale Bewertung bleibt 1+2+3 Punkte; bestanden wird mit 6/6.
Ein ausgelassener Volumenkern, eine unvollständige Flächenzerlegung oder eine
fehlende der beiden geforderten Deutungen kann deshalb nicht kompensiert werden.

## Exakte Nachnutzung aus PR #79

Aufgabe, Lösung, normale Rubrik und die unveröffentlichte neue Prüfungs-ID
stammen aus `802f333f80c58d3409ab5d9fb3e9913fecafbf54`.
Die kleinen ursprünglichen Inhalts- und Quellenbelege bleiben bytegenau unter
`math-right-prisms-2026-11-05/pr79-history/` erhalten. Insbesondere beurteilt
der unabhängige maschinelle Review vom 1. November den exakten Aufgabenkern und
die normale 6/6-Rubrik positiv. Seine damaligen Platzierungszahlen und sein
Ersatzplan werden nicht als neue Integrationsabnahme übernommen.

Der neue Q übernimmt ausschließlich die beiden präzisen Prismen-A als
`requires` und `coveredGoalIds`. Der spätere PR-79-Stand enthielt zusätzlich
`9f9c7ece-b81c-55fa-8073-dd816d7d4778`, „Oberflächeninhalte von Körpern
berechnen“, als Voraussetzung. Diese breitere Kompetenzfamilie mitsamt ihren
weiteren Volumen-, Winkel-, Parallelitäts- und Symmetrievoraussetzungen wird
für die konkrete Aufgabe nicht zusätzlich benötigt. Sie ist weder Own noch
eine anerkannte Kompetenz aus diesem Q. Ihre spätere Erwerbsprüfung bleibt
ein eigener offener Fall. Die echte Vorbereitung der beiden präzisen Ziele
wird vollständig transitiv beibehalten.

Alle 807 ursprünglichen gewöhnlichen Kompetenz-IDs und ihre festen
Bedeutungsfelder bleiben erhalten. Kein gewöhnliches Ziel wird zur Prüfung
umtypisiert und kein früheres Verständnisresultat wird als neue Q bestanden
ausgegeben. Alle ursprünglichen Prüfungs- und Kartenpflichten bleiben erhalten.

## Autoritative Erwerbs- und native Angebotsbindung

Der neue `ProgramUnit` ist `de-gym-math-right-prisms-volume-surface`.
Drei explizite `acquisition=true`-Platzierungen begründen Own; kein Fokus und
kein Jahresname erzeugt diese Zuordnung. `requiredChildUnitIds=[]` macht den
fehlenden zusätzlichen Kinderauftrag ausdrücklich.

Der vorhandene fachlich präzise kanonische Cluster
`59d5a330-61be-4590-ab46-cf7cefecd144` enthält die beiden ursprünglichen A.
Er ist in der festgehaltenen nativen Inventur exakt in denselben 27 Angeboten
Target. Dort ergänzt die neue Q den bestehenden fachlichen Teilbaum.
Es werden keine Länder- oder Kurskopien der Einheit und keine manuell
gepflegten Berechtigungslisten eingeführt. Die physischen Kompositionsdateien
bleiben unverändert, ebenso alle historischen S2-Vertragsdateien.

Die alte PR-79-Regel „23 Ersatzangebote ohne Dichte“ wird nicht übernommen.
Der neue Auftrag ergänzt eine eigene Q in allen 27 passenden Angeboten und
entfernt dabei keine bestehende Originalprüfung. Die zusätzliche Zielidentität
und ihre Änderung des Umfangs werden getrennt von den ursprünglichen 978
Targets ausgewiesen. Die übrigen 155 Angebote dürfen kein zusätzliches Target
erhalten. Die frische Backend-/API-Auflösung aller 182 Angebote muss dies am
tatsächlichen Stand belegen.

Der erzeugte strukturelle Nachweis enthält die konkrete vollständige
Voraussetzungsrelation, ausschließlich reichweitenerhaltende
Minimalitätskorrekturen und eng gebundene Quellenfingerprints. Eine solche
Fingerprinterneuerung ändert keine semantische Klassifikation und ist kein
neuer M7-Pass. Die neue eigene Q, der normale Bestehensanspruch, Ownership,
Support und Kartenabgrenzung wurden am tatsächlichen Vertrag getrennt
unabhängig maschinell geprüft. Die erforderlichen nativen, technischen,
Release- und Hostnachweise behalten jeweils ihren eigenen Umfang.

## Unabhängige Prüfung des tatsächlich eingebauten Prismenvertrags

Prüfdatum: 5. November 2026. Reviewer: gesonderter KI-Agent
`/root/math_units_astra_foundation`, unabhängig vom Datenautor
`/root/math_units_sol_inventory`. **PASS für den beschriebenen Aufgaben-,
Bestehens- und lokalen Anerkennungsvertrag.** Dies ist eine unabhängige
maschinelle Inhalts- und Strukturprüfung, keine menschliche Freigabe,
Lernererprobung, Wirksamkeitsstudie, vollständige M7-Abnahme, HTTP-/Hostabnahme
oder Freigabe der gesamten Mathematikimplementierung.

Geprüft wurden die tatsächliche kanonische Q, ihre beiden ursprünglichen A,
der erzeugte Vertrag, Aufgaben- und Rubrikdateien, Erwerbsplacements,
Quellenmanifest und eingefrorener Quellensnapshot. Die historische Freigabe
wurde nicht als Freigabe der neuen Integration übernommen.

Der Vertrag `math-right-prisms-volume-surface@2026-11-05-v1` hat SHA-256
`92808b7f4a3f71e7bb840afbff7ca945454e966df419df85c2f157adc5607936`.
Sein Aufgaben-/Lösungspaar hat den normalisierten Digest
`6e14ddcde1cd7dd0f1b9aa76c19e8255ba87030efdba9629c794298d9abb21d0`,
die normale Rubrik
`f4960abe16d268d24e6f762d492ed3ed9b98ed4c91e1d50b943659f4df20097b`.
Diese drei Bindungen beziehen sich auf den hier tatsächlich geprüften Stand.

### Fachlicher Anspruch und Gegenbeispiele

Das rechtwinklige Grunddreieck mit Seiten 6, 8 und 10 cm ist konsistent.
Sein Flächeninhalt beträgt 24 cm². Die Körperhöhe von 20 cm steht senkrecht
auf den Grundflächen. Kongruente Schichten begründen für diesen Körper
24 · 20 = 480 cm³ Rauminhalt. Die fünf Außenflächen haben die Inhalte
24, 24, 120, 160 und 200 cm², zusammen 528 cm². Die Musterlösung trennt
Rauminhalt und Beschichtungsfläche mit passenden Einheiten und Deutungen.

Die normale Rubrik verlangt 6 von 6 Punkten. Konkrete Gegenproben:

- Nur `V = 480 cm³` ohne Schichtbegründung reicht für den Volumenkern nicht;
  höchstens 4 Punkte sind erreichbar.
- Eine richtige Volumenrechnung und vollständige Oberfläche ohne die
  Rauminhaltdeutung ergeben höchstens 5 Punkte.
- Nur drei Mantelflächen, nur eine Grundfläche oder eine doppelt gezählte
  Außenfläche erfüllen den Oberflächenkern nicht; höchstens 3 Punkte bleiben.
- Die vollständige Summe ohne Beschichtungsdeutung erreicht höchstens 5 Punkte.
- Ein bloßes korrektes Zahlenpaar 480/528 ohne verlangte Begründung,
  Flächenzerlegung und Deutungen kann nicht bestehen.

Damit kann keine der zwei ausgewiesenen Kompetenzen vollständig fehlen und
mit einer anderen Teilaufgabe kompensiert werden. Die Prüfung trägt die
bestehenden eng gefassten A: begründete Volumenberechnung und vollständige
Außenflächenberechnung an geraden Prismen mit Kontextdeutung. Sie behauptet
keine allgemeine Körpergeometrie, Dichteberechnung, schiefe Prismen oder
unbeobachtete Transferleistung. Sie verlangt unabhängige Anwendung nach der
normalen Coaching- und Bewertungsregel; dieser Review belegt nicht, dass ein
realer Coach diese Regel bereits fehlerfrei ausgeführt hat.

### Identitäten, Ownership, Karten und Unterstützung

Die ursprünglichen A `68fb0e78-34f2-5572-8db6-e7f5ebcff70f` und
`f1348d40-3872-5e44-8892-3600c811796f` behalten ihre vollständigen
Bedeutungsfelder. Die neue Q `e5494c67-aed6-5710-8ae3-51ae147c10e9` war am
Ausgangsstand `8481434d48` nicht vorhanden. Sie stammt aus dem
unveröffentlichten PR-79-Kandidaten; dessen Aufgaben-, Lösungs- und Rubrikdaten
wurden mit dem tatsächlichen Stand byteinhaltlich verglichen und stimmen
überein. Keine ursprüngliche gewöhnliche ID wird zur Q umgedeutet und kein
vorhandenes A-Verständnisresultat ersetzt das eigene Q-Ergebnis.

Die drei tatsächlichen `acquisition=true`-Placements begründen genau Own =
{Volumen-A, Oberflächen-A, Q}. `requiredChildUnitIds=[]` und die leere
Kindreferenzliste stimmen überein. Die Einheit hat keine Orientierungspflicht.
Die bestehenden Einzelreviews in
`quality/memory-card-review/canonical-math-full.review.jsonl` beurteilen beide
A mit `no_memory_needed`: geometrisches Verständnis, Rechnung und Prüfung am
Körper begründen keinen eigenen zusätzlichen SRS-Auftrag. Dieser enge
Kartenverzicht ist fachlich nachvollziehbar. Die sechs vorhandenen Kartenziele
und 64 Karten bleiben eigenständige Pflichten; die neue Q besteht sie nicht.

Der eingefrorene atomare Kontext enthält 31 Ziele: drei Own und 28 externe
Unterstützungsziele. Q benötigt genau beide A; deren vollständige transitive
Vorbereitung bleibt enthalten. Die spätere breite PR-79-Voraussetzung
`9f9c7ece-b81c-55fa-8073-dd816d7d4778` wird für diese konkrete Aufgabe nicht
benötigt und ist weder Own noch Teil ihres geprüften Anspruchs. Sie zusätzlich
zu fordern würde eine sachfremde Voraussetzung schaffen. Ihr Weglassen aus
neuer Q nimmt keinem ursprünglichen Ziel eine Voraussetzung weg.

Bei M = leer darf die Einheit nichts anerkennen. Bei M = {Q} sind genau die
zwei eigenen A anerkannt und die Einheit vollständig; die 28 externen
Unterstützungsziele, alle anderen Q/K und das breite Körperoberflächenziel
bleiben ohne eigenes Ergebnis offen. Bei lediglich beiden expliziten A und
Q = 0 bleibt die Prüfung und damit die Einheit offen. Die normale
Bestehensregel braucht keine zusätzliche Lernereignung oder Ergebnisstufe.

### Tatsächliche Struktur- und Quellenprüfung

Eine getrennte Python-Berechnung mit geerbten Voraussetzungen und atomarer
Clusterauflösung bestätigt für alle 978 ursprünglichen Atome dieselbe volle
Erreichbarkeitsrelation vor und nach den 43 Kantenentfernungen. Keine neue
Kante wurde an einem ursprünglichen Ziel ergänzt. Die 26 veränderten
bestehenden Ledger-Einträge ändern ausschließlich `sourceFingerprint`, nicht
Klassifikation oder Reviewstatus. Daraus wird kein erneuter M7-Pass abgeleitet.
Alle 25 bereits vorhandenen S2-Vertrags-/Quellen-/Inputdateien wurden gegen
`8481434d48` bytegenau unverändert vorgefunden.

Die bereits erzeugten nativen Vorher-/Nachher-Daten wurden unabhängig auf
182 Angebote und ihre Ziel-/Prüfungs-/Karten-/Orientierungs-/Supportmengen
verglichen: genau 27 Angebote erhalten die neue Q, 155 erhalten sie nicht;
keine ursprüngliche Rollenmenge verändert sich. Der Anwendungsauszug zeigt
bei leerem M keine Anerkennung und nach dem Q-Pass genau beide A. Dieser
separate Datenvergleich ist keine neu ausgeführte HTTP- oder Hostprüfung.
Der finale native Nachweis muss nach der abschließenden Quellen- und
Reviewbindung erneut gegen die fertigen Kandidatenbytes erzeugt werden.

Im Review wurde der übernommene, lokal nicht vorhandene alte `sourceRef`
entdeckt. Der Datenautor hat ihn auf die tatsächliche neue `tasks.md`
korrigiert; der korrigierte lokale Pfad existiert. Die alte Git-Herkunft bleibt
im unveränderten PR-79-Historienbeleg erhalten. Nach dieser Korrektur wurden
alle Vertrags- und Inputhashes des Katalogs unabhängig ohne Abweichung geprüft.
Der Aufgaben-/Rubrik-/Own-Anspruch und die oben genannte Vertragsdatei bleiben
unverändert. Es bleibt kein fachlicher oder lokaler Vertragsblocker aus dieser
Prüfung; finale Integrations-, Paket-, CI- und Betriebsnachweise sind getrennt.
