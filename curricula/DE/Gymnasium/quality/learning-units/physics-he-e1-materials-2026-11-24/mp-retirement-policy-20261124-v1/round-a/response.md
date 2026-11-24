| Exakter Materialkandidat | Entscheidung |
|---|---|
| [accepted-successor.parent.material.json](/tmp/e1-t5/material-mp-exit-preflight/accepted-successor.parent.material.json) | **APPROVE_CONDITIONAL_POLICY** |
| [no-successor.parent.material.json](/tmp/e1-t5/material-mp-exit-preflight/no-successor.parent.material.json) | **APPROVE_CONDITIONAL_POLICY** |

Beide Entscheidungen gelten ausschließlich für die jeweilige enge Policyänderung unter den unten genannten Aktivierungsbedingungen. **Eine derzeit erfolgreiche Aktivierung ist nicht nachgewiesen.**

Ich habe die sechs vorgegebenen Dateien vollständig gelesen und unabhängig verglichen. Ergänzend habe ich die beiden erlaubten Implementierungsdateien zur Validierungssemantik herangezogen. Referenzierte Reviewdateien, andere Reviewerantworten und Integratorberichte wurden nicht geöffnet. Es wurden keine Dateien geändert.

Die vollständigen Strukturänderungen gegenüber `current-parent.material.json` sind:

Für **accepted-successor** wird ausschließlich an diesen drei JSON-Pointern jeweils das Arrayelement ersetzt:

```text
/unit/sectionAssessmentPolicy/additionalVoluntaryAssessmentGoalIdsByView/de-he-gym-physics-lk-g8/0
/unit/sectionAssessmentPolicy/additionalVoluntaryAssessmentGoalIdsByView/de-he-gym-physics-lk-g9/0
/unit/sectionAssessmentPolicy/additionalVoluntaryAssessmentGoalIdsByView/de-he-gym-sekii-physics-lk/0
```

An allen drei Stellen lautet die Änderung:

```text
2b9e565f-d9b4-5e23-b5b7-b7977cecff06
→ 05cfd298-cb80-54c4-a898-b521ef270843
```

Für **no-successor** wird ausschließlich dieses gesamte Feld entfernt:

```text
/unit/sectionAssessmentPolicy/additionalVoluntaryAssessmentGoalIdsByView
```

Damit entfallen dessen drei oben benannte View-Einträge einschließlich ihrer jeweiligen oldMP-Einzelelementarrays. Das Feld ist anschließend **abwesend**, nicht als leeres Objekt vorhanden.

Weitere Feldänderungen bestehen bei keinem Kandidaten. Nach Entfernung dieses einen erlaubten Felds sind beide Kandidaten vollständig strukturgleich mit dem aktuellen Elternmaterial.

Die gemeinsamen Vertrags- und Materialprüfungen ergeben:

- **Vier Pflichtteile bleiben exakt erhalten:** A `ee7d5f3d-858f-59d6-89b0-e5a7f437f458`, B `39f52dcb-ff1d-5cad-9ccb-30da803cfa85`, C `c933b7d2-edcb-5747-9378-9762659f260a`, D `f13ca187-b680-5f47-b4ad-76bd474bd8a2`. Sämtliche `taskRevision`, `rubricRevision` und Materialfingerprints stimmen unverändert mit aktuellem Material und Scope überein. Auch die Materialbindungen unter Einbeziehung der englischen Aufgaben- und Lösungstexte ergeben die hinterlegten Fingerprints.
- **Vertragsbindung bleibt korrekt:** Revision `2026-11-23-e1-v3`; der unabhängig berechnete kanonische Hash von `parts` entspricht `requiredPartsFingerprint`: `sha256:4e5d2f002c82ee42d6b76565b8f1231f3a52b128df0475327772c8008cd12250`.
- **Alle zwölf `contentGoalIds` bleiben einschließlich Reihenfolge exakt gleich** und entsprechen dem Scope. Ihr kanonischer SHA-256 ist `f346e542b6d40f4d73fb22749aad53c32c223cedc41329faa3fc588f55b34d50`.
- **Genau ein Planning Credit bleibt bestehen:** ausschließlich BES `e4b38061-1f28-43ad-8371-a3e7c0e81856` über Pflichtteil D. Release `2026-11-24-e1-bes-v1`, Owner `physics-constant-acceleration`, Ownerrevision `2026-11-23-v4`, sechs Release-Views sowie Review-, Definitions- und Profilbindungen bleiben unverändert. Der unabhängig rekonstruierte Releasefingerprint stimmt mit `sha256:efb05e6c680bd40abe5a947fcce45e638f41c35909762c7f429b0016b75bb94d` überein. Die referenzierte Reviewdatei und das externe Freigaberegister wurden dabei nicht erneut geprüft.
- **MP erhält weder Pflichtteilrolle noch Planning Credit oder Ownership.** Kein Kandidat ändert Scoring, Schwellen, `coveredGoalIds` oder Anerkennungsregeln. Insbesondere entsteht kein zusätzlicher MOD-Planning-Credit.
- **Die gewöhnlichen Lehrmaterialkörper sind unverändert:** Der vollständige Dateibereich ab `intro` einschließlich aller Übungen ist bei beiden Kandidaten sogar roh bytegleich zum aktuellen Elternmaterial. DE/EN-Einführungen, Aufgaben, Hinweise, Lösungen, Evidenzkriterien, Bildlinks und Alternativtexte bleiben erhalten. Die Landestellen-Zusage verweist weiterhin auf Pflichtteil B und hängt nicht vom freiwilligen MP-Angebot ab.
- **Das vorgelegte Kindmaterial bleibt unverändert:** Sein Rohhash stimmt mit dem Scope überein. Einführung, drei zweisprachige Übungen, reguläre Lernpflichten, achtgliedrige Lernreihenfolge bis D und das Einzelangebot für das Messprotokoll bleiben erhalten. Es enthält weder oldMP noch 05 und keinen eigenen `assessmentContract` oder `sectionAssessmentPolicy`. Dieses Delta fügt auch für Kinder 1/3/4 keine Deklarationen hinzu.

Die beiden gemeinsamen freiwilligen Prüfungen bleiben exakt erhalten: ZB `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` und FFX `f41e4e30-794e-5ce4-ba5e-cc72712cd691`. Daraus ergibt sich folgende **Policy-Zuordnung**, deren tatsächliches Angebot erst mit den endgültigen Views geprüft werden kann:

| Exakter Vertragsview | accepted-successor | no-successor |
|---|---|---|
| `de-he-gym-physics-gk-g8` | ZB + FFX | ZB + FFX |
| `de-he-gym-physics-gk-g9` | ZB + FFX | ZB + FFX |
| `de-he-gym-sekii-physics-gk` | ZB + FFX | ZB + FFX |
| `de-he-gym-physics-lk-g8` | ZB + FFX + 05 | ZB + FFX |
| `de-he-gym-physics-lk-g9` | ZB + FFX + 05 | ZB + FFX |
| `de-he-gym-sekii-physics-lk` | ZB + FFX + 05 | ZB + FFX |

Damit erfüllt Kandidat A die **exact3LK-Regel**; GK erhält keinen zusätzlichen 05-Policyeintrag. Die generischen Material-View-IDs `de-he-gym-physics-gk` und `de-he-gym-physics-lk` erweitern den sechs Views umfassenden Vertrag nicht. Es gibt keine Duplikate oder Überschneidungen freiwilliger Prüfungen mit Pflichtteilen.

Die echten Aktivierungsvoraussetzungen bleiben offen:

1. **Für beide Zweige:** Erst das nächste tatsächliche finale Assessment-Reviewergebnis und anschließend das Parent-Signal erlauben den Wechsel. Bis dahin bleibt das aktuelle oldMP-Material aktiv. Beim Wechsel muss oldMP aus den relevanten aktiven Angeboten und dem Prüfungskontext der endgültigen Views verschwinden. Das Entfernen aus der Freiwilligenliste allein archiviert das Ziel nicht.
2. **Zusätzlich für accepted-successor:** Zwei tatsächliche finale wissenschaftliche Reviews müssen den exakt eingesetzten finalen 05-Payload akzeptieren. 05 muss freigegeben sein und in den endgültigen drei Vertrags-LK-Views freiwillig am E.1-Elternknoten nach den vier Kindern enthalten sein. Finalpayload und finale Views liegen hier nicht vor. Spätere fachlich relevante Payloadänderungen wären von einer früheren Annahme nicht automatisch gedeckt.
3. **Für no-successor:** Der endgültig gewählte Zweig muss oldMP ohne Nachfolger archivieren; 05 darf nicht aktiviert oder angeboten werden. ZB und FFX bleiben die einzigen freiwilligen Zusätze.
4. **Anerkennung und bestehende Gates:** Kein altes MP30/18-Ergebnis und keine Evidenz der Legacy-Quelle `73cb` darf durch Alias, ID-Zuordnung oder Masterytransfer neue Anerkennung unter 05 erhalten. Material-, Bedeutungs-, Profil-, Ownership-, Revisions- und Altevidenz-Gates bleiben bindend; die Parent-Bindung muss zur tatsächlich gewählten finalen Policy passen.

Diese Bedingungen sind materiell relevant: Die native `validateSectionAssessmentPolicy` verlangt freigegebene freiwillige Prüfungen innerhalb des ausgewählten Abschnitts und vergleicht anschließend den gesamten Prüfungskontext mit den vier Pflichtteilen. Bleibt oldMP dort bestehen, kann es nach seiner Entfernung aus der Freiwilligenliste als unerwartete zusätzliche Pflichtprüfung zählen. Fehlt 05 im finalen LK-Zielbestand, ist Kandidat A ebenfalls nicht aktivierbar.

**Unter diesen Bedingungen erfordert keiner der beiden engen Policywechsel weitere Änderungen an den gewöhnlichen Materialkörpern.** Im geprüften Delta besteht kein zusätzlicher Material-, Guidance-, Scope-, Ownership- oder Scoring/Credit-Leak. Das ist keine fachwissenschaftliche Aufgabenabnahme, keine wholeMOD-Abnahme und keine Bestätigung menschlicher Annahme, neuer Mastery, erfolgreicher Host-/Lernertests oder breiter CI. Die native Gesamtvalidierung wurde nicht ausgeführt.

Die unabhängig aus den tatsächlich gelesenen Dateibytes berechneten **rawSHA256** lauten:

| Datei | rawSHA256 |
|---|---|
| [criteria.md](/tmp/e1-t5/material-mp-exit-preflight/criteria.md) | `ac939c7e73d36bf0bf780c7c4c1a671ea1905d25fefe2f8d3db7e5396b944a4b` |
| [current-parent.material.json](/tmp/e1-t5/material-mp-exit-preflight/current-parent.material.json) | `902489158fe7d2be89f3ed2e6db4d9447c71bc1be39f5cf47a97e23ea00c7ce0` |
| [current-child.material.json](/tmp/e1-t5/material-mp-exit-preflight/current-child.material.json) | `15668151caa403d3fe648302180310ef00792bd5a9f8628c160db1ef80e1cc5f` |
| [accepted-successor.parent.material.json](/tmp/e1-t5/material-mp-exit-preflight/accepted-successor.parent.material.json) | `a01fcc653a4424ccc6e5fb38b945ce2ec3de85d56379e88776f50e882822d69e` |
| [no-successor.parent.material.json](/tmp/e1-t5/material-mp-exit-preflight/no-successor.parent.material.json) | `8e496bd920afa825987cfd87077411d12f7e66315f130a933ac3d73ffc95b1ae` |
| [scope-and-goals.json](/tmp/e1-t5/material-mp-exit-preflight/scope-and-goals.json) | `7a81cc0b5857c38282211879b286fca8770d6bf9101662d44257a79b8e2cf2e6` |
| [checkUnitPlanningReleases.ts](/home/enpasos/projects/skillpilot-e1-nachweise/app/scripts/checkUnitPlanningReleases.ts:367) | `f2275063a081ee0af00cf092be8c2487a39abfe7b86821f3ea47ef76eb4a502e` |
| [UnitLearningMaterialService.java](/home/enpasos/projects/skillpilot-e1-nachweise/backend/src/main/java/com/skillpilot/backend/service/UnitLearningMaterialService.java:326) | `496a8d68be77a5cb037d41497cf5a473d5f404a4149c7235ed829b4bba6e5957` |