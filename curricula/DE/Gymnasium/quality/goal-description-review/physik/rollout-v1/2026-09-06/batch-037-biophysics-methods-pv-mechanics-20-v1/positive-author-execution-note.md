# Physik B037 P-Autorenschaft: Ausführungsnachweis

## Ergebnis und Grenzen

19 positive-understanding-evidence-v2-Profile mit je zwei unabhängigen DE/EN-Fällen sind unter dem Prefix `curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-037a-biophysics-methods-pv-mechanics-19-v1` als aktuelle AI-Kandidaten materialisiert. Die native Materialisierungs-Verifikation und der aktuelle Profilchecker melden 19 Records, 19 `needs_human_review`, 0 approved, 0 rejected und 0 Fehler. Alle Records sind `ai_candidate / E1 / G1`; `reviewRunIds` und `reviewedResourceTypes` sind leer. Das ist weder ein Nachweis realer Lernleistungen noch eine Quellen-, Bild-, Sicherheits- oder Humanfreigabe.

Der separate Entwurf `positive-author-unbound-2825b528-draft.json` enthält zwei Fälle für 2825b528-00ee-52d0-870e-686890cb1195. Er bleibt ungebunden, außerhalb des 19er-Configs und ohne zentrale Registrierung. Sein Dissent benennt die Kombination eigenständig prüfbarer Laufzeitmessung, E-/B-Abschätzung und Flussinduktion; er entscheidet weder eine Aufteilung noch einen biologischen Wirkzusammenhang.

Konkrete verbleibende Materialanforderung: Der erste Fall für 39ef1e8a-9203-5192-8c76-8e0c3322646f fordert eine tatsächlich bereitgestellte empirische Farbangleichungs- oder Zapfenempfindlichkeitsgrafik samt überprüfbarer Quelle, Achsen/Einheiten und Messbedingungen. Diese Vorlage liegt nicht bei. Ohne sie ist der empirische Datenteil nicht erbracht; die getrennten synthetischen Zapfentripel dürfen ihn nicht ersetzen. Der zweite Fall ist ein synthetischer unabhängiger Modelltransfer. Diese Grenze steht direkt im Profil-Dissent. Weitere synthetische Quellenkarten/Dossiers sind als solche gekennzeichnet und keine erfundenen realen Belege.

## Arbeits- und Lesedisziplin

Der aktuelle vollständige Authoring-v2-Prompt, die vollständigen Physik-Profilkriterien v1, das geschlossene V2-Recordschema, das V2-Configschema und die nativen Materialisierungs-/Profil-/Reviewimplementierungen wurden gelesen. Alle 20 vollständigen Originalseiten im B037-Bundle, die aktuellen vollständigen DE/EN-Zieltexte und die unmittelbaren externen Voraussetzungen wurden gelesen. Bei zunächst gekürzten Toolausgaben wurden die betroffenen Originalseiten 16–18 und kanonischen Ziele 9–11 gesondert vollständig nachgelesen. Die 7 reparierten englischen Zieltexte wurden vor aktueller Bindung nochmals vollständig gelesen.

Keine D-Round-Records, D-Rationales, Synthesen oder fremden positiven Profile wurden geöffnet. Die Originalbundle-Metadaten wurden nur zur Prüfung der Originalseiten-/Dateibindungen genutzt. Die Autorenschaft erfolgte vor Roots inhaltlicher Gegenprüfung; Root meldete anschließend seine vollständige DE/EN-Gegenlektüre und Fachprüfung aller 19 Profile. Zwei begrenzte Rückmeldungen wurden übernommen: maximale beobachtete Abweichung ±0,02 s bei ad62 statt der missverständlichen Bezeichnung Spannweite (volle Spannweite 0,04 s), und die verbindliche empirische Materialanforderung bei 39ef. Das sind AI-Gegenprüfungen, keine Humanfreigabe.

Die am 6. September 2026 tatsächlich gelesene erste Clock-Marke während der laufenden Quellenlektüre war 10:45:37 UTC; sie wird nicht als erfundener exakter Beginn der gesamten Sitzung ausgegeben. Die ungebundenen Entwürfe wurden mit `reviewedAt=2026-09-06T11:02:59Z` erfasst. Nach beiden fachlichen Präzisierungen und Roots Stabilitätssignal erfolgte die aktuelle P19-Bindung mit `reviewedAt=2026-09-06T11:08:34Z`. Der aktuelle native Bindungscheck lief am `2026-09-06T11:10:26.468Z`. Kein Modell-Snapshot, Providerlauf oder Runmanifest wurde erfunden.

## Reproduzierbare Prüfungen

Read-only-Helfer: `positive-author-check.ts`. Er schreibt selbst keine Dateien. Die persistierten Dateien wurden ausschließlich mit `apply_patch` geschrieben; die Reviewrecords wurden von `buildPositiveGoalEvidenceCandidateRecords` erzeugt und anschließend bytegleich mit dem nativen Materialisierer verifiziert.

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-037-biophysics-methods-pv-mechanics-20-v1/positive-author-check.ts
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-037-biophysics-methods-pv-mechanics-20-v1/positive-author-check.ts --bind-ready
app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-037a-biophysics-methods-pv-mechanics-19-v1.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-037a-biophysics-methods-pv-mechanics-19-v1.candidates.json
app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-037a-biophysics-methods-pv-mechanics-19-v1.config.json --mode=check
```

Der endgültige Helferlauf enthält 375 Assertions, darunter 147 numerische/Domain-Assertions (einschließlich Hilfsgrößen-/Vektordimensionschecks), neben Schema-, Scope-, Originalinput- und aktueller Bindingprüfung. Er berechnet aus den angegebenen Aufgabendaten unter anderem Laufzeiten/E-/B-/Flusswerte des gehaltenen Entwurfs, Perioden und Streuungsangaben, Leistungs-/Energiebilanzen, Empfängerantworten, bedingte Auflösungsschwellen, PV-Leistungen und Unsicherheitsintervalle, Federkräfte, Impuls-/Energiebilanzen verschiedener Stöße, Schwerpunkt-/Laborwechsel und Schwingungsenergien. Diese rechnerischen Assertions ersetzen nicht die manuelle fachliche Beurteilung der qualitativen Aufgaben oder tatsächlich zu beobachtende Bau-/Messleistungen.

Der erste Schemalauf fand einen nicht-ASCII-konformen lokalen Erwartungs-ID-Slug (`abwägungsgrenze`), korrigiert zu `abwaegungsgrenze` inklusive Coverage-Referenz. Keine inhaltliche Änderung dadurch. Eine zu große Toolausgabe bei der ersten In-memory-Materialisierung wurde in drei reine Ausgabeabschnitte zerlegt; daraus wurden genau 19 Records zusammengesetzt und danach nativ bytegleich verifiziert.

## Artefakte und Hashdomänen

- `positive-author-unbound-check.json`: historischer ungebundener Check nach den zwei Präzisierungen; 335 Assertions. Sein Kandidatenhash bezieht sich auf den damaligen ungebundenen Reviewer-/Reason-/Zeit-Metadatenstand.
- `positive-author-current-binding-check.json`: aktuelle P19-Bindungen pro Ziel, 375 Assertions und nativer PASS; enthält die aktuellen DE/EN-Texte sowie alle Checks.
- Originaler nativer B037-Modell-Digest: `sha256:ebed6e9c4a5455b794fbf0dd0e7fb908fd116da7504f24de86e4a263abdc69f7`.
- Originaler Bundlefingerprint: `sha256:91fe19a22e3cbde43a8abd95ca8e5c78358b4b2e51fd40ab11e731c43e4e7450`.
- Originale book-model.json-Rohdatei: `sha256:26448617a34957b4a6fe14f32b83196000188d35081ae68b61322ae92c069500`.
- Originale review-input.jsonl-Rohdatei: `sha256:81073150db34ab0ac22a4ee0cd8f0d7f7596c67c09d07bc12bee3719a3bbbaba`.
- Stabile aktuelle kanonische Rohdatei: `sha256:5e44ab039917bf583601c47320cb47e1ffcbe05d46103a510108cd0ad211160a`.
- Durch `loadGoalBookBuildInputs` frisch bestätigter aktueller Source-Modell-Digest: `sha256:8b1922572c7ad54e550fc41f9b093a74a5de801af31093e89f1312af85ca2380`.
- Frisch gebauter aktueller Gesamtatlas-Modell-Digest: `sha256:73845433296905230b39c21cab61070c441d2da3b1cd4e1c355fcf13303c774f`.
- P19-Config: `sha256:92f9aca7e9d528c4d9bd42e99d77f617dc9f6d8a86fcf1a976c1fa7734a52ab2`.
- P19-Kandidaten: `sha256:c607a587e2f01a829e306fe2c71f8e70c8b6ff7edbe17a285c11b2edd21cb6f3`.
- P19-Review: `sha256:0ff93d796686ae5e6ed7f5c5bd4529d5bfdd30fdb882976e1c9bee7124a4559e`.
- Gehaltener ungebundener 2825-Entwurf, unverändert seit erster Persistierung: `sha256:8d64036177117657b1713b7d80c6b6298e2b51af141d26f6b83fae1c97f3ec0b`.
- Vollständiger Authoring-v2-Prompt: `sha256:f164aaa2f0c5af439aa62ec9dc333ac01282c6c66c3cffdf37d7d994861e3f29`.
- Physik-Profilkriterien v1: `sha256:8d64a50ede312df08795f6fddec82c1c3bcc8b77e50dad62220c201c819fd460`.

Unterschiede zwischen Rohdatei-, Source-Modell-, Bundle- und Gesamtatlasdigests sind unterschiedliche Hashdomänen, nicht ungeprüfte Drift. Die unveränderten deutschen Texte aller 20 Originalseiten sind im Helfer exakt gegen die aktuelle Kanonik geprüft. Die P19-Records binden die aktuellen semantischen Felder nach den 7 EN-Reparaturen; der historische Originalbundle bleibt unverändert.

Keine Kanonik, zentrale Registry, In-flight-Liste, QA-Datei, Bilder, D-Reviews oder Runtime-Datei wurde durch diese Autorenschaft geändert. Die beiden Bildimporte und die sieben EN-Reparaturen gehörten zu Roots getrenntem Arbeitsumfang. Visualisierung wird in dieser P-Config nicht als geprüfte Bildbyte-Evidenz beansprucht.
