<!-- SPDX-License-Identifier: Apache-2.0 -->
# Native Physik: tatsächliche Projektionsdomänen der Schlussabdeckung

Stand: 10. November 2026. Der reguläre Producer über 21 Kataloge und alle zehn
unveränderten Meilenstein-Untergrenzen sind bestanden; die erzeugten Berichte
sind mit `c1e36d18c3` gepusht. Physik erreicht wieder M7. Das harte Standard-G17-
Gate ist damit noch nicht aktiviert und die Main-Lieferung noch nicht abgenommen.

Der vollständige lokale Physiktest scheiterte nach seinen Vergleichsschleifen
an einer Schlussassertion: Sie verlangte Target-Exposition für einen bereits
vorher ausdrücklich ausgeschlossenen Kompatibilitätsknoten. Ein erfolgreicher
Native-Gesamtpass oder finale Persistenzprüfung wird daraus nicht abgeleitet.
Alle 3.882 benannten Eingaben blieben unverändert.

Die anschließende enge Gegenprobe verwendet vorhandene native Fixtures,
Rollenprüfer, den unfiltrierten kanonischen Resolver und den Normalizer:

- 22 tatsächliche Target-Atome sind in 372 Paaren aus 114 Konfigurationen vor
  und nach der Reduktion rollenbedingt gesperrt, auch bei vollständig gesetzter
  lokaler Kontrollmastery. Tatsächliche Targets, Kontext und atomarer Bedarf
  bleiben erhalten; keine dieser Sperren wurde durch die Migration neu erzeugt.
- Das Mathematikziel `0a154cbd…` bleibt bei seinen 21 Verbraucher/Scope-Paaren
  ausdrücklich im Support, im Kontext und im atomaren Bedarf. Der Verbraucher
  ist jeweils bereits zuvor rollenbedingt gesperrt.
- `3631c8f7…` bleibt ausdrücklich `compatibilityOnly` und `excluded`, ohne
  tatsächliche Target-, Support- oder Kontextexposition. Sein voller nativer
  kanonischer Bedarf bleibt bei 163 Atomen; die direkten Anforderungen sinken
  von 73 auf 36. Alle 37 entfernten Direktziele bleiben erreicht. Beide nativen
  Kontextprüfungen und beide echten `MISSING_REFERENCE`-Negativkontrollen bestehen.

Die Diagnose besteht in 180,095 Sekunden bei 3.901 unveränderten Eingabebindungen.
[Das Receipt](native-coverage-domain-followup.json) bindet Ergebnisse und lokale
Rohbelege mit SHA-256; die lokalen Pfade sind keine öffentlichen Downloads.

Die korrigierten Testhelper sind unter Corretto 25 tatsächlich kompiliert
und an echten Fixtures geprüft: 139 kanonische Atomproben, 34 Frontier-Aufrufe
und zehn verworfene fehlerhafte Coverage-Datensätze bestehen in 76,710 Sekunden.
Alle 3.901 benannten Inputs bleiben unverändert. Vier historische Methoden und
sämtliche sieben Physik- plus vier Mathematikfälle bleiben erhalten. Der erste
fokussierte Lauf scheiterte an AssertJs Umgang mit leeren Mengen; der erhaltene
Gegenfall ist durch eine vollständige Schnittmengenprüfung behoben.
Dies ist keine erneute Ausführung oder Freigabe der gesamten Vergleichsmatrix.

Die Schlussabdeckung muss alle tatsächlichen Ziel-/Scope-Paare erhalten:
positive und offene-Prerequisite-Kontrollen für rollenvalide Fälle, vollständige
Fail-closed-Kontrollen für gesperrte Fälle sowie kanonische Bedarfsprüfung und
Nicht-Exposition für ausdrücklich ausgeschlossene Knoten. Die Beobachtungszahlen
sind keine Freigabe-Baseline und keine zusätzliche Rollen- oder Masteryzuweisung.
Die abschließende frische Remote-CI muss die vollständige Regression ausführen.
