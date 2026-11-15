# Unabhängige Nachprüfung der F1/F2-Rollenkorrektur

Datum: 15. November 2026. Gegenstand sind die effektiven Projektionsrollen,
atomaren Platzierungen, baumfreien Ausschnitte und ihre Provenienz. Diese
Prüfung ist keine Landesplan-, Quellen-, CQR-, F2/F4-Aktivierungs- oder
pädagogische Abnahme. Produktionssichten und Code wurden nicht verändert.

## Ergebnis

Die gezielt geprüfte Rollenkorrektur respektiert die vorhandene
Spezifizitätsregel. Der zusätzlich gefundene P2-Befund in der
Konvergenzprüfung wurde unmittelbar gemeldet und ist nach einer tatsächlichen
unabhängigen Nachprüfung der korrigierten Fassung behoben. In den vier unten
an ihren aktuellen SHA-256-Werten gebundenen Dateien verbleibt aus dieser
gezielten Prüfung kein konkreter offener Korrekturbefund. Die ursprüngliche
Reproduktion bleibt als Prüfhistorie dokumentiert; die aktuelle Bewertung und
die tatsächlich erneut ausgeführten Nachweise stehen im letzten Abschnitt.

## Ursprünglicher P2-Befund: Vergleich der Anzeigebeschriftungen

`app/src/utils/stagePlan.ts:389` bildet die Konvergenzsignatur mit
`displayLabel ?? goal.id`. Der native `compileCompositionView` benutzt
`displayLabel?.trim() || goal.title`. Die beiden Ausdrücke sind bei vollständigen
kanonischen Titeln nicht gleichbedeutend.

Konkrete, tatsächlich ausgeführte Reproduktion:

- Kanonisches Atom: `{ id: 'a', type: 'atomic', title: 'Actual competency' }`.
- Zwei vollständige, ansonsten gleiche GK-/LK-Autoritäten desselben Plans.
- Beide zeigen Atom `a` in der ersten Stufe und ein weiteres Atom `b` in der
  zweiten Stufe. Der profilunabhängige Ausschnitt referenziert beide
  Autoritäten und wählt nur die erste Stufe.
- GK besitzt keinen `displayLabel`.

| LK-displayLabel | Native GK-Beschriftung | Native LK-Beschriftung | Tatsächliches Validator-Ergebnis |
| --- | --- | --- | --- |
| `a` | `Actual competency` | `a` | `findings=[]`, Ausschnitt akzeptiert, obwohl die Darstellungen verschieden sind |
| `Actual competency` | `Actual competency` | `Actual competency` | `SP-CONVERGENCE`, obwohl die Darstellungen gleich sind |

Die Reproduktion gab jedem kanonischen Ziel einen expliziten Titel. Es handelt
sich nicht um unvollständige Testmetadaten. Erforderlich ist ein Vergleich der
tatsächlichen nativen Beschriftung einschließlich kanonischem Titel, mit
Negativ- und Positivtest für beide Zeilen. Die bestehenden geschlossenen
Quellverträge für leere oder mit Leerraum gerahmte Anzeigebeschriftungen sollten
deshalb nicht gelockert werden. Fehlende Titelmetadaten sind keine Grundlage
für eine bewiesene native Beschriftungsgleichheit.

## Verifizierte Eigenschaften der Rollenkorrektur

- Die effektiven Rollen werden über den vorhandenen
  `collectCompositionProjectionRoleGoalIds` ermittelt; gültige spezifischere
  `prerequisiteOnly`-Overrides eines breiten Zielteilbaums werden nicht mehr
  als pauschaler Rollenkonflikt verworfen.
- Sichtbarkeitsprüfung und atomare Platzierung halten an einem effektiv
  ausgeblendeten Vorfahren an. Ein darunter liegendes Ziel wird nicht allein
  wegen eines rohen Zielteilbaums zum sichtbaren Seed.
- Echte doppelte sichtbare Vorkommen und unterschiedliche Stufenplatzierungen
  bleiben Fehler. Mehrere rohe Pfade zu einem effektiv ausgeblendeten Ziel
  werden nicht zu falschen sichtbaren Duplikaten.
- Ausschnittquellen bleiben ohne `rootNodes`. Die abgeleitete Sicht behält
  erforderliche originale Supportdeklarationen in einer unsichtbaren Struktur;
  Zielteilbäume werden nicht in atomare Einträge umgeschrieben. Eine nicht
  erhaltbare Rollenprojektion scheitert mit `SP-EXCERPT-ROLES`.
- Die tatsächlichen BB- und HE-Mathematikfragmente in den Vertragstests stimmen
  in ihren atomaren Zielmengen mit der nativen Kompilierung überein. Diese
  Testeinordnung ist keine neue fachliche Stufenentscheidung.
- Der Materialisierer prüft zusätzlich die native Kompilierung und vergleicht
  deren atomare Zielmenge mit der validierten Platzierungsmenge. Quellenclaims
  werden nur aus effektiv sichtbaren Zielen gewonnen. Supportreferenzen erhalten
  keine atomaren Seedplatzierungen und keine `placementBasis`-Quellenbehauptung.
- Qualifizierte Verweise werden weiterhin ausschließlich als exakt vorhandene
  Eigentümer-Aliase aufgelöst; v1-Ausgaben verwenden die kanonische ID, während
  die Provenienz den ursprünglich verfassten Verweis behält.

## Tatsächlich ausgeführte Nachweise

1. `npx tsx scripts/testStagePlanContracts.ts`, cwd `app`: Exit 0,
   52 Negativfälle; umfasst die echten BB-/HE-Fragmente und die neuen
   Rollen-/Ausschnittsgegenbeispiele.
2. `npx tsx scripts/testStagePlanMaterialization.ts`, cwd `app`: Exit 0,
   50 Negativfälle; einschließlich nativer Kompilierung, Aliasnormalisierung,
   Support-Provenienz und Ausschluss versteckter Seeds.
3. Separater, deterministisch erzeugter Gegenbeispielvergleich mit 240
   kleinen Deklarationsvarianten auf einem kanonischen DAG: 89 Varianten waren
   nach dem vorhandenen nativen Compiler fehlerfrei; alle 89 wurden akzeptiert.
   Für jeden akzeptierten vollständigen Plan und Ausschnitt wurden atomare
   Platzierungsmengen gegen native atomare Vorkommen verglichen. Zusätzlich
   stimmten die vollständigen nativ gerenderten Ausschnittsbäume nach Entfernung
   der laufzeitlokalen IDs mit der ausgewählten Stufe des nativen Vollbaums
   überein. Die übrigen 151 Varianten hatten native Kompositionsfehler und
   wurden nicht als positive Rollenbelege gewertet.
4. Die beiden Beschriftungsfälle der P2-Reproduktion oben wurden separat
   ausgeführt; beide beschriebenen Fehlentscheidungen wurden beobachtet.

Keine breite historische Testsuite und keine vollständige CI wurden in dieser
Nachprüfung ausgeführt. Die dokumentierte CQR-M3-Übergangsgrenze bleibt offen
für die spätere reale F2/F4-Aktivierung.

## Geprüfter Quellstand

Die folgenden SHA-256-Werte gehören zum tatsächlich geprüften Stand vor der
anschließend angekündigten Beschriftungskorrektur:

```text
5cf90c37b4ff86be3b9e79abc1b83b336d1adcd526166e33e94ad247877f1813  app/src/utils/stagePlan.ts
644e48a5bf3b21cbb5fb3564d272f3c49b3c265362aad02655318ac6208b7608  app/scripts/lib/stagePlanCatalog.ts
7e5983a0f8413f46e4471d841038cdc9d652dfeff392390922751de439e08505  app/scripts/testStagePlanContracts.ts
b7873e37e5827fd5bb7de71151eccf252e9d14a61aa54dcfb150d8f4351e2e46  app/scripts/testStagePlanMaterialization.ts
```

## Unabhängige Nachprüfung der Beschriftungskorrektur

Der Implementierungsagent hat nach der Meldung die Titelmetadaten und die
Konvergenzprüfung berichtigt. Die Korrektur wurde anschließend durch eigenes
Lesen der aktuellen Bytes und durch erneut ausgeführte Gegenbeispiele geprüft:

- `StagePlanGoal` trägt nun den kanonischen Titel. Der Materialisierer gewinnt
  diesen mit derselben `normalizeCanonicalLandscape`-Normalisierung, die sein
  nativer Kompilierungscheck verwendet; auch deren Fixture-Ersatztitel bleiben
  dadurch konsistent.
- Die Konvergenzprüfung verwendet genau
  `displayLabel?.trim() || goal.title`. Für einen Mehrquellenvergleich mit
  unaufgelöstem erforderlichem Standardtitel wird `SP-LABEL` gemeldet und kein
  akzeptierter Ausschnitt zurückgegeben. Es gibt keinen Ziel-ID-Ersatztitel,
  der eine unbewiesene Gleichheit behauptet.
- Beide ursprünglichen Reproduktionen wurden unabhängig jeweils für
  `goalEntry` und `canonicalSubtree` erneut ausgeführt. Abweichende native
  Beschriftungen (`Actual competency` gegenüber `a`) ergeben jetzt
  `SP-CONVERGENCE`; identische native Beschriftungen (`Actual competency` in
  beiden Quellen) werden jetzt ohne Befund akzeptiert.
- Zusätzlich wurden für beide Knotentypen die Werte `''`, `'   '`, Tabulator
  plus Zeilenumbruch sowie `' Actual competency '` tatsächlich geprüft. Der
  native Compiler rendert jeweils `Actual competency`; der Quellvertrag
  lehnt jeden dieser Werte im JSON-Schema und im Kernvalidator weiterhin ab.
  Der Korrektur wegen wurde die strengere Quellgrenze also nicht gelockert.
- Nach Entfernen des erforderlichen kanonischen Titels scheiterte der
  unabhängige Mehrquellenfall für beide Knotentypen mit `SP-LABEL`; akzeptierte
  Sichten blieben leer.
- Strukturknoten wurden gesondert auf dieselbe Pflicht geprüft. Ihre
  Konvergenzsignatur benutzt unmittelbar `node.label`; der native Compiler
  benutzt ebenfalls unmittelbar `node.label`, ohne Trim-Operation oder
  Titel-Fallback. Ein zusätzlicher tatsächlicher Check mit `Heading`,
  `' Heading '`, `'   '` und `''` bestätigte das unveränderte native Label
  sowohl bei direkter Kompilierung als auch nach `normalizeCompositionView`.
  Leere beziehungsweise ausschließlich aus Leerraum bestehende Labels melden
  nativ `CPV-001`; der Stage-Plan-Quellvertrag ist weiterhin strenger und lehnt
  außerdem gerahmten Leerraum bereits bei der Formprüfung ab. Für akzeptierte
  Strukturquellen gibt es somit keine unterschiedliche Beschriftungssemantik
  zwischen Signatur und nativem Compiler.

Tatsächlich erneut ausgeführte gezielte Suiten auf diesem korrigierten Stand:

1. `npx tsx scripts/testStagePlanContracts.ts`, cwd `app`: Exit 0,
   **58 Negativfälle**, einschließlich der tatsächlichen BB-/HE-Projektionen.
2. `npx tsx scripts/testStagePlanMaterialization.ts`, cwd `app`: Exit 0,
   **51 Negativfälle**, einschließlich beider Beschriftungsfälle und
   konsistenter normalisierter Fixture-Titel.

Die frühere 240-Varianten-Runde wurde ohne neuen Anlass nicht wiederholt.
Vollständige CI, reale CQR-Stufenauswertung sowie tatsächliche Landesplan- und
F2/F4-Aktivierungsabnahme sind durch diese Nachprüfung nicht belegt.

Aktuelle, unabhängig verifizierte Bindungen aller vier geprüften Dateien:

```text
38b606240d3e603a88d12f53577a1de22fe3191ca58960c728ec2a9a3c523775  app/src/utils/stagePlan.ts
31941caff78fa93c52eb1c66e782f8881f48087919c90a7d5ae24b16e6a58036  app/scripts/lib/stagePlanCatalog.ts
e1583a61eb468a3d3aac508d72d4f44f86822687cc1a86afc0b5b081852910c9  app/scripts/testStagePlanContracts.ts
2eab3c08eac2f5cfad737f93178f570a61859a501d65444f2d965b2b7f5ec786  app/scripts/testStagePlanMaterialization.ts
```
