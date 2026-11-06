# Math-Daueransichten: technische Quellenbindung nach der Memoryreparatur

Der echte Hauptlauf 42278464832 besteht Backend und Frontend, scheitert aber im
Curriculumjob 128113206934 an `check:math-duration-composition-views`. Die rote
Stelle wurde zuerst mit dem unveränderten CLI im schreibgeschützten Dateisystem
reproduziert: Exit 1, `Invalid reviewed split-layout plan`, Generatorzeile 393.
Die Policy verlangt weiterhin Math `e0ff0caf…`; die freigegebene Memoryreparatur
hat den Canonical auf `da4724ae…` und den Kindledger auf `78a5f2d9…` geändert.

Der [technische Review](math-duration-input-binding-technical-review-2026-11-06.json)
belegt die konkrete Layoutbedeutung neu. Er ersetzt keine wissenschaftliche
Bewertung und stellt keine neue QA-Freigabe aus. Die bestehenden tatsächlichen
Memory-Anwendungs- und unabhängigen Kindreviews bleiben unverändert gebunden.

## Vergleich mit dem echten alten Stand

Ausgangscommit ist `5cb5e567d08bc9f640942529d9099cbce03a4747`, mit Canonical
`e0ff0caf…` und Kindledger `ee7f3ea9…`. Generator und Policy sind seit diesem
Commit bytegleich. Im Canonical unterscheiden sich exakt die vier bereits
genehmigten Memory-`requires`-Arrays; IDs, Texte, Contains, Placements, Reihenfolge
und sämtliche übrigen Felder sind gleich. Im Kindledger ändern sich nur die
vier bereits fachlich neu geprüften `sourceFingerprint`-Werte. Die vom Generator
verwendete Projektion aller autoritativen Kindentscheidungen ist exakt gleich.

Der unveränderte Generator wurde mit kleinen privaten Overlays ausgeführt.
Das übrige Repository ist schreibgeschützt; `--write` erhält ausschließlich
eine eigene Kopie des Math-Viewverzeichnisses als Schreibfläche.

| Tatsächlicher Lauf | Quellen und Policy | Ergebnis |
| --- | --- | --- |
| Alter Generatorlauf und anschließendes RO-`--check` | e0ff + ee7f + originale Policy | beide Exit 0 |
| Neuer Generatorlauf und anschließendes RO-`--check` | da47 + 78a + private Einfeld-Policykandidatur | beide Exit 0 |
| Vollständiger Ausgabevergleich | sechs Sek-I- und zwölf Crossstage-Dateien | alle 18 alt/neu/live bytegleich |
| Native Vergleichsprüfung | Compiler, UI-Projektion, Rollen und echte Scopefilter | alle 18 gleich hinsichtlich Layout/Scope |

Die [18 Ausgabepins](math-duration-input-binding-technical-review-2026-11-06/output-comparison.json)
und der [native Vergleich](math-duration-input-binding-technical-review-2026-11-06/native-layout-comparison.json)
sind vollständig gesichert. Compilerbäume, Reihenfolge, sämtliche Findings,
Target-/Supportmengen und gefilterte atomare Targets sind gleich. Die native
UI-Projektion behält ausdrücklich die vier genehmigten Änderungen an `requires`
und `effectiveRequires`; die Vorbereitung wird nicht pauschal als unverändert
ausgegeben. Alle anderen UI-Felder und Layoutentscheidungen sind gleich.

Alle 83 Platzierungen, sechs Sek-I-Templates, zwölf Crossstage-Deskriptoren und
24 tatsächlich verwendeten Basis-/Ausgabedateien bleiben unverändert. Die sieben
Additivadjudikationen bestehen sowohl rohe Datei- als auch eingebettete
Inhaltsdigests. Alle fünf Scopebindungen und das Parentreceipt sind geprüft;
die referenzierten aktuellen Belege sind seit 5cb bytegleich. Die ausdrücklich
als nicht laufzeitabhängig gekennzeichnete historische Extraktionsprovenienz
wird nicht als neu geprüfter Liveinput ausgegeben.

Der [beobachtete Generatorinput-Vergleich](math-duration-input-binding-technical-review-2026-11-06/observed-generator-data-inputs.json)
bindet 44 tatsächlich geöffnete Layoutdatenpfade. Alle 41 außerhalb der drei
bewusst belegten Canonical-/Kind-/Policy-Slots sind bytegleich zu den alten
Gitblobs. Das ist ein begrenzter Zensus absoluter Dateiöffnungen, keine Behauptung
vollständiger Systemaufrufabdeckung.

Die 18 alten Template-Hashmetadaten unterscheiden sich bereits am alten
5cb-Stand von den aktuellen generierten Dateien. Dieser bestehende historische
Sachverhalt ist einzeln dokumentiert. Ihre Werte und Bedeutung werden hier
weder still aktualisiert noch zu einer aktuellen Hashfreigabe umgedeutet.

## Gegenkontrollen und exakter Anwendungsvorschlag

Die [negativen Kontrollen](math-duration-input-binding-technical-review-2026-11-06/negative-controls.json)
verwenden weiterhin denselben unveränderten Generator. Ein zusätzlicher
unreviewter Canonicaltext scheitert an der Whole-Source-Bindung; ein verändertes
Adjudikationsbyte und ein verändertes Scopebelegbyte scheitern an ihren
bestehenden Guards. Eine einzige veraltete Ausgabedatei ergibt korrekt den
vorhandenen roten `--check`. Ein zusätzlicher Templateedit verletzt den engen
Einfeld-Anwendungsguard.

Der [guarded Einfeldplan](math-duration-input-binding-guarded-plan-2026-11-06.json)
sieht ausschließlich diese technische Änderung vor:

```text
/inputs/canonical/sha256
e0ff0cafccf0f638c4cb36d5a252480ccc7062750619ef0452a447775bf96fe1
→ da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6
```

Policy vorher: `ebc87e844ed7354b7a72d8d4419a62b516d05fa28819dd823e04d13eb273000b`.
Exakt erwartete Policy danach:
`4415411350eabee64077f9c4769603814a428b9d3f3421cfaa7ceda1339f3227`.
**Keine der 18 generierten Dateien muss geschrieben werden.** Der Plan bindet
vor Anwendung Source, Kindledger, unveränderten Generator, bestehende fachliche
Reviews und alle 18 aktuellen Ausgabepins. Jede weitere Policyänderung oder
abweichende Eingabe muss die Anwendung abbrechen. Nach Roots Safepoint ist nur
die eine geprüfte JSON-Feldänderung atomar zu schreiben und der vorhandene
normale CLI-Check erneut tatsächlich auszuführen.

Bei Abschluss dieses Reviews sind Livepolicy und Views noch unverändert.
Kein ganzer CQR-Producer wurde durch den Reviewer gestartet. Der historische
Source-A-5c9-Kontext enthält weiterhin die alte Policybindung; dieser technische
Review macht daraus keinen neuen QA-Pass oder Aktivierungsnachweis.
