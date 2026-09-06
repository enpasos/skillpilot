# Math B035 Runde A – Ausführungsbeleg

Run `math-b035-blind-a-20260906`, unabhängiger Codex-Agent, Provider OpenAI. Review gestartet 2026-09-06T08:13:48Z, Kandidaten fertig 2026-09-06T08:20:51Z; tatsächliche UTC-Uhrabfragen. Modellbezeichnung bewusst generisch: Die exakte Modell-/Snapshot-ID und die serverseitigen Samplingparameter sind diesem Agenten nicht verfügbar und werden nicht erfunden.

Exakter UTF-8-String der vom Agenten explizit gesetzten zusätzlichen Generationsparameter: `{}` (ohne Zeilenumbruch); SHA-256 `sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a`. Dies bedeutet keine durch den Agenten gesetzten Sampling-Overrides, nicht Kenntnis der Plattformdefaults.

Vollständig gelesen: eigene Kampagne und Bundlemanifest, eigener Prompt und Math-D-Kriterien v2, gebundenes Recordschema, generisches aktuelles Runschema sowie alle sieben vollständigen Datensätze des eigenen Batch-Inputs einschließlich DE/EN, canonicalContext und page-Kontext. Die drei in der Run-Datei gebundenen Inputrollen sind genau Batch-JSONL, Prompt und Kriterien. Das Recordschema ist durch Kampagne und Batch an `sha256:b1d5fe108f157ebcb3e6b5c5f0376b3f4d88da935fab9aab79fac8a49b50b7ff` gebunden; es wird nicht fälschlich als finding_schema geführt.

Voraus ging nur der ausdrücklich beauftragte Evidenzwährungsaudit der sieben IDs. Dort wurden frühere Bindungsmetadaten und aktuelle Seiten gelesen, keine früheren fachlichen Reviewurteile, Begründungen oder positiven Profile. In dieser neuen Runde wurden weder B-Ergebnisse noch neue positive Profile oder Synthesen gelesen. Keine Urteilsberatung mit parallelen Reviewern.

Sieben Records, zugewiesene Reihenfolge, sechs KEEP und ein REVISE (5b54f272: positive Versuchszahl und 0<p<1 als Bedingungen der vorhandenen Aussage zur relativen Streuung). Je sechs konkrete bilinguale Evidencefelder, durchgehend create/candidate/ai_candidate. Keine Quellen-, Human- oder Bildfreigabe; keine kanonische Änderung.

Zehn unabhängig ausgeführte numerische/Randfall-Assertions bestanden: CV(100,0.5)=0.1, CV(400,0.5)=0.05, CV(400,0.01)=√0.2475, letztere größer als CV(100,0.5); p=0 undefiniert; p=1 für n=100 und n=400 jeweils null; gleichmäßige Streckung mit Faktor 3 ergibt Volumenfaktor 27 und Flächenfaktor 9; ausschließliche Höhenstreckung ergibt Volumenfaktor 3. Symbolisch gilt für festes 0<p<1: CV(n₂)/CV(n₁)=√(n₁/n₂); bei n₂>n₁ ist dies kleiner als eins. Keine bloße Wertetabelle wird als allgemeiner Beweis verwendet.

Validierung abgeschlossen 2026-09-06T08:22:05Z: native validateGoalDescriptionReviewCampaignResults meldet sieben gültige Records; zusätzlicher Hash-/Text-/Reihenfolgecheck sowie Prüfung aller 42 Evidencefelder und des ausschließlich lokalen bilingualen Revisionsinserts PASS. Records-SHA-256: `sha256:5423db9dbaff5ee3eae5493af669344bb03cece51c1eb86369a3c00ff8a90c45`; Run-SHA-256: `sha256:ea3f0b9ee8250b82daf99d5521828aaaf68465625bfb5fe94cdac1bf4712abab`. Die Validierung erzeugt keine fachliche Freigabe.
