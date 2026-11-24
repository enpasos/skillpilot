Beide exakten Kandidaten erhalten **APPROVE_CONDITIONAL_POLICY**. Die Änderungen sind innerhalb des vorgegebenen Scope schlüssig; ihre tatsächliche Aktivierung ist noch nicht belegt.

| Materialkandidat | Entscheidung | Begründung |
|---|---|---|
| `accepted-successor.parent.material.json` | **APPROVE_CONDITIONAL_POLICY** | Ersetzt ausschließlich oldMP durch die eigenständige new05-ID in genau drei vertraglichen LK-Views. |
| `no-successor.parent.material.json` | **APPROVE_CONDITIONAL_POLICY** | Entfernt ausschließlich die gesamte zusätzliche View-Policy. Es wird kein Nachfolger angeboten. |

Ich habe die sechs vorgegebenen Dateien vollständig gelesen, eigene Hash-, Struktur- und Gleichheitsprüfungen durchgeführt und ergänzend die beiden erlaubten nativen Quelldateien geprüft. Andere Reviewerantworten, Parent-Kommentare und referenzierte Reviewberichte wurden nicht gelesen. Dateien wurden nicht verändert.

**Die vollständigen Strukturänderungen** gegenüber `current-parent.material.json` sind:

- oldMP = `2b9e565f-d9b4-5e23-b5b7-b7977cecff06`
- new05 = `05cfd298-cb80-54c4-a898-b521ef270843`

Für `accepted-successor.parent.material.json` gibt es genau drei geänderte skalare Felder:

| JSON-Pfad | Vorher | Nachher |
|---|---|---|
| `unit.sectionAssessmentPolicy.additionalVoluntaryAssessmentGoalIdsByView["de-he-gym-physics-lk-g8"][0]` | oldMP | new05 |
| `unit.sectionAssessmentPolicy.additionalVoluntaryAssessmentGoalIdsByView["de-he-gym-physics-lk-g9"][0]` | oldMP | new05 |
| `unit.sectionAssessmentPolicy.additionalVoluntaryAssessmentGoalIdsByView["de-he-gym-sekii-physics-lk"][0]` | oldMP | new05 |

Für `no-successor.parent.material.json` gibt es genau eine Feldlöschung:

```text
unit.sectionAssessmentPolicy.additionalVoluntaryAssessmentGoalIdsByView
```

Ihr vollständiger bisheriger Inhalt besteht aus den drei oben genannten View-Schlüsseln, jeweils mit `[oldMP]`. Das Feld fehlt anschließend vollständig; es bleibt weder ein leeres Objekt noch eine leere View-Liste zurück.

Nach Entfernung dieses einen erlaubten Policy-Feldes sind beide Kandidaten jeweils strukturell vollständig identisch zum aktuellen Parent. Weitere Änderungen gibt es nicht.

**Die Vertrags- und Materialinvarianten bleiben in beiden Zweigen erhalten:**

| Prüfpunkt | Ergebnis |
|---|---|
| Vier Pflichtteile | Unverändert und vollständig gleich zu `scope.requiredParts`, einschließlich sämtlicher Task-, Rubric- und Materialrevisionen. |
| `contentGoalIds` | Dieselben zwölf eindeutigen IDs in derselben Reihenfolge wie im aktuellen Parent und Scope. |
| Vertragsrevision | Unverändert `2026-11-23-e1-v3`; Policy und Assessmentvertrag stimmen überein. |
| Gemeinsame freiwillige Assessments | ZB/FFX bleiben unverändert: `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` und `f41e4e30-794e-5ce4-ba5e-cc72712cd691`. |
| Planungsgutschrift | Genau ein BES-Credit über Teil D; kein MP-Credit und keine Ausweitung. |
| Owner | Weiterhin ausschließlich die bestehende Bindung an `physics-constant-acceleration`, Revision `2026-11-23-v4`. |
| Kindmaterial | Derselbe bereitgestellte Child-Snapshot; keine Änderungen durch einen der Kandidaten. |

Die vier Pflichtteil-IDs bleiben:

```text
A ee7d5f3d-858f-59d6-89b0-e5a7f437f458
B 39f52dcb-ff1d-5cad-9ccb-30da803cfa85
C c933b7d2-edcb-5747-9378-9762659f260a
D f13ca187-b680-5f47-b4ad-76bd474bd8a2
```

Den Pflichtteil-Fingerprint habe ich aus der kanonisierten `parts`-Struktur nachgerechnet:

```text
sha256:4e5d2f002c82ee42d6b76565b8f1231f3a52b128df0475327772c8008cd12250
```

Er entspricht in allen drei Parent-Dateien `requiredPartsFingerprint`.

Der einzige Credit bleibt:

```text
requiredPartIds: [D]
goalIds: [e4b38061-1f28-43ad-8371-a3e7c0e81856]
release.revision: 2026-11-24-e1-bes-v1
ownerRevision: 2026-11-23-v4
```

Auch seinen Release-Fingerprint habe ich anhand der im nativen Checker definierten Bestandteile nachgerechnet:

```text
sha256:efb05e6c680bd40abe5a947fcce45e638f41c35909762c7f429b0016b75bb94d
```

Reviewreferenz, Reviewhash, Zieldefinition und Profilbindung dieses Credits bleiben vollständig unverändert. Die referenzierte externe Reviewdatei und das Freigaberegister wurden hier nicht geprüft. Die Kandidaten erzeugen keine zusätzlichen Owner-Deklarationen für Kinder 1/3/4.

**Die View-Abgrenzung ist exakt:**

| View | Im Assessmentvertrag | new05 in Zweig A | new05 in Zweig B |
|---|---:|---:|---:|
| `de-he-gym-physics-gk-g8` | ja | nein | nein |
| `de-he-gym-physics-gk-g9` | ja | nein | nein |
| `de-he-gym-sekii-physics-gk` | ja | nein | nein |
| `de-he-gym-physics-lk-g8` | ja | freiwillig | nein |
| `de-he-gym-physics-lk-g9` | ja | freiwillig | nein |
| `de-he-gym-sekii-physics-lk` | ja | freiwillig | nein |
| `de-he-gym-physics-gk` | nein | nein | nein |
| `de-he-gym-physics-lk` | nein | nein | nein |

Die acht Material-Views erweitern somit nicht die sechs Vertrags-Views. Insbesondere erhält die generische LK-View keinen vierten new05-Eintrag.

Die [native Policy-Validierung](/home/enpasos/projects/skillpilot-e1-nachweise/app/scripts/checkUnitPlanningReleases.ts:366) verlangt passende Vertragsrevisionen, exakte Pflichtteile und freigegebene freiwillige Assessments innerhalb der jeweiligen projizierten Einheit. Nach Abzug der freiwilligen Assessments müssen genau die vier Pflichtteile verbleiben. Dabei zählt auch der vollständige Voraussetzungskontext.

Das hat eine konkrete Aktivierungsfolge: **oldMP muss aus den finalen aktiven Angeboten und ihrer relevanten Erreichbarkeit verschwinden.** Nur den Materialeintrag zu ersetzen oder zu löschen genügt nicht, falls oldMP weiterhin als zusätzliche Prüfung im finalen View-Kontext auftaucht. Für Zweig B darf dort auch kein unberücksichtigter new05-Nachfolger verbleiben.

Der [Backend-Service](/home/enpasos/projects/skillpilot-e1-nachweise/backend/src/main/java/com/skillpilot/backend/service/UnitLearningMaterialService.java:327) behandelt das fehlende Zusatzfeld als leere Zusatzmenge. Die Löschung in Zweig B ist damit kohärent. Bei zusammengeführten Views vereinigt er die Angebote der beteiligten Komponenten; eine reine GK-Auswahl erhält dadurch keinen new05-Eintrag.

**Die gewöhnlichen Materialkörper benötigen wegen dieses Deltas keine weitere Änderung.** Der gesamte Parent-Dateibereich ab `intro` bis Dateiende ist in beiden Kandidaten sogar rohbyte-identisch zum aktuellen Parent: 18.920 Bytes, SHA-256:

```text
b9290de8b1b2e09127b626fc2ab274a5aa043aabc23b0711aff51e8ecd3f1d3d
```

Damit bleiben beide Einführungen, Bildlinks und Alternativtexte sowie alle vier zweisprachigen Übungen einschließlich Hinweisen, Lösungen, Evidenzkriterien und Pflichtmarkierungen erhalten. Die Einführungszusage zu Prüfungsteil B bleibt passend. Im Child bleiben seine drei Übungen, die Lernreihenfolge bis D und das individuelle Angebot `e0004439… → c6e2942d…` erhalten. Die gemeinsame Freifallübung ist zwischen Parent und Child strukturell identisch.

Es entsteht kein nachweisbarer neuer Material-, Guidance-, Ownership- oder Credit-Leak. oldMP und new05 sind in keinem Kandidaten Pflichtteil oder neues Inhaltsziel. Der bereitgestellte oldMP-Zielstand bleibt bei 30/18 Punkten und leeren `coveredGoalIds`; die Policyänderung rechtfertigt keine neue Anerkennung alter Resultate. Ein Alias- oder Masterytransfer von oldMP oder der Legacyquelle `73cb` auf new05 ist ausgeschlossen.

**Für die Aktivierung bleiben folgende echte Voraussetzungen offen:**

1. **Beide Zweige:** Das nächste tatsächliche Assessment-Reviewergebnis und das Parent-Signal müssen vorliegen. Bis dahin bleibt das aktuelle oldMP-Material aktiv.
2. **Zweig A:** Zwei tatsächliche finale wissenschaftliche Reviews müssen dieselbe exakte finale new05-Payload akzeptieren. new05 muss freigegeben sein und in den finalen drei Vertrags-LK-Views freiwillig am E.1-Parent nach den vier Kindern angeboten werden. GK erhält kein Angebot. oldMP wird archiviert.
3. **Zweig B:** Die endgültige Disposition muss oldMP ohne aktivierten Nachfolger archivieren. Die finalen Views müssen dazu passen; erhalten bleiben vier Pflichtteile sowie ZB/FFX.
4. **Bestehende Evidenzgates:** Material-, Meaning-, Profil- und Altbeleggates müssen weiterhin zur endgültigen Fassung passen. Unveränderte Lerntexte ersetzen keine Prüfung einer geänderten Policybindung.

Der Scope nennt hierfür unterschiedliche Parent-`unitIntroFingerprint`-Bindungen:

```text
Zweig A: sha256:1bd4a65850514240223094cdfae75ecdbda187812447805fdff0f4d706c334da
Zweig B: sha256:975f8ca9da549e21c7ee19d1b6ceffd8a332de3356a5abcaf3101b4e82f5d22a
```

Diese beiden Werte sind Scopeangaben; ihre externen Reviewbindungen wurden hier nicht als vorhanden bestätigt. Es besteht kein Anlass, dafür identische gewöhnliche Lerntexte neu zu verfassen oder ihnen ein erfundenes neues Inhaltsurteil zuzuschreiben.

**Die unabhängig berechneten rawSHA256 der gelesenen Dateien** beziehen sich auf die unveränderten Dateibytes, ohne JSON-Normalisierung. Basis der ersten sechs Dateien ist `/tmp/e1-t5/material-mp-exit-preflight/`.

| Datei | rawSHA256 |
|---|---|
| `criteria.md` | `ac939c7e73d36bf0bf780c7c4c1a671ea1905d25fefe2f8d3db7e5396b944a4b` |
| `current-parent.material.json` | `902489158fe7d2be89f3ed2e6db4d9447c71bc1be39f5cf47a97e23ea00c7ce0` |
| `current-child.material.json` | `15668151caa403d3fe648302180310ef00792bd5a9f8628c160db1ef80e1cc5f` |
| `accepted-successor.parent.material.json` | `a01fcc653a4424ccc6e5fb38b945ce2ec3de85d56379e88776f50e882822d69e` |
| `no-successor.parent.material.json` | `8e496bd920afa825987cfd87077411d12f7e66315f130a933ac3d73ffc95b1ae` |
| `scope-and-goals.json` | `7a81cc0b5857c38282211879b286fca8770d6bf9101662d44257a79b8e2cf2e6` |
| [Repo-Anweisungen, auszugsweise gelesen](/home/enpasos/projects/skillpilot-e1-nachweise/AGENTS.md) | `e9df46b0122cb763922e32a2b82fbb8a9b9e5a9f18658095e7ffa213bddb30ff` |
| [checkUnitPlanningReleases.ts](/home/enpasos/projects/skillpilot-e1-nachweise/app/scripts/checkUnitPlanningReleases.ts) | `f2275063a081ee0af00cf092be8c2487a39abfe7b86821f3ea47ef76eb4a502e` |
| [UnitLearningMaterialService.java](/home/enpasos/projects/skillpilot-e1-nachweise/backend/src/main/java/com/skillpilot/backend/service/UnitLearningMaterialService.java) | `496a8d68be77a5cb037d41497cf5a473d5f404a4149c7235ed829b4bba6e5957` |

Die vier im Scope hinterlegten Rawhashes für aktuellen Parent, Child und beide Kandidaten stimmen mit meinen Berechnungen überein.

Diese Entscheidungen bestätigen ausschließlich die bedingten Materialpolicies. Sie bestätigen weder Aufgabenwissenschaft oder wholeMOD-Abnahme noch erfolgreiche Aktivierung, neue Mastery, menschliche Annahme, Host-/Lernertests oder Gesamt-CI.