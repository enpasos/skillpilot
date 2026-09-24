# Neun offene D-Ziele: Bindungs- und Synthesevorprüfung

Stand: 24. September 2026. Diese Vorprüfung ist **keine** D-Freigabe und
ersetzt weder die zweite unabhängige Runde noch die formale Dual-Synthese.
Die kanonische Landschaft, Registry und zentralen QA-Ledger wurden hier
nicht geändert.

## Nachweise und Grenze

- Die vorbereiteten Runden binden dieselben neun Ziele und denselben
  `bookDigest` `sha256:64cdfb5f1c7a7c9588b365024cbfe8cb62dd64436a67b7370c270c528c3387db`.
- Runde A besitzt neun schemaförmige Records und einen `completed`-Run-Receipt
  unter `round-a/results/`. Der gezielte Validator
  `validateGoalDescriptionReviewCampaignResults.ts` meldet dafür
  `Goal-description review campaign results valid: 9`.
- `round-b/independent-candidate-content-b.json` enthält neun fachliche
  Kandidatenentscheidungen, **aber** keine vollständigen Records nach
  `goal-description-review-record.schema.json`, keinen Run-Receipt und keine
  belegte, importierbare unabhängige B-Runde. Insbesondere fehlen unter
  anderem die vollständigen `rationale`- und Run-Bindungen. Der Status
  `candidate_content_only` wird nicht in Reviewautorität umgedeutet.
  Derselbe gezielte Validator findet für B noch nicht einmal ein
  `round-b/results/`-Verzeichnis (`ENOENT`).
- Bei `7feaaebd-cc8d-522b-8b3a-ea22675c65dd` nennt der B-Kandidat
  `goalFingerprint` `sha256:2103376bd8300cf6d035829e1aeecbad9b06e94aaefaf606e00f9b90d335b4d7`
  und `pageFingerprint` `sha256:de3e61f405fd9e220b2001045076fc57fcf9994103c1ec0a1015c4fb1efec6f7`.
  Die beiden gebundenen Rundeneingaben und der A-Record verlangen dagegen
  `sha256:ce61015b6d8a5eba0de6d9b235aa2234bdaac7858098397a0be6782033289adc`
  bzw. `sha256:40c2f29979a60e251d7d1e515b87fe4f37b51fb3d426feaae45107e0ea97dc84`.
  Kein Fingerprint darf bloß nachgetragen werden; dieses Ziel braucht eine
  tatsächlich aktuelle B-Begutachtung.
- Der gezielte `quality:goal-description-rollout-batch check` endet derzeit
  vor der fachlichen Prüfung, weil das ignorierte Renderderivat
  `bundle/book.pdf` lokal fehlt (`ENOENT`). Das ist weder ein Beleg für eine
  erfolgreiche D-Validierung noch für einen fachlichen Fehler des Ziels.

## Fachliche Vorentscheidung (nicht autoritativ)

| Ziel | A / B-Kandidateninhalt | Vorläufige Behandlung |
| --- | --- | --- |
| `8064088b-dc0a-4a67-ad63-360fdcc9869d` Kreis/Kreisteile | `split_review` / `keep` | **HOLD.** Titel beansprucht auch Flächen von Kreisteilen, Beschreibung nur Flächen ganzer Kreise; zusätzlich Umfang und Flächeninhalt getrennt prüfbar. Geltung und Identität vor einem bloßen `keep` klären. |
| `59d5a330-61be-4590-ab46-cf7cefecd144` Prismen | `split_review` / `revise` | **HOLD.** Die B-Formulierung macht Grund-/Mantelflächen genauer, entscheidet aber nicht, ob Oberfläche und Volumen ein oder zwei atomare Kompetenzen sind. |
| `74d29d0c-80b3-4d46-a5f5-3c2f609e8483` Pyramide/Kegel | `split_review` / `keep` | **HOLD.** Zwei Körper und zwei Darstellungen können getrennte Leistungen verlangen. Die bestehende `semanticAtomic: true`-Angabe ist Kontext, aber kein Verbot einer erneuten fachlichen Atomaritätsprüfung. |
| `1ea06c0c-5c60-45cd-8f31-638de98820b4` Kugel | `split_review` / `split_review` | **Fachlicher Split-HOLD.** Oberfläche und Volumen einschließlich ihrer Skalierung, Einheiten und Anwendung sind getrennt prüfbar; `semanticAtomic: true` und Reviewbefunde müssen sachlich aufgelöst werden, nicht durch Umbenennen. |
| `4cba85d3-2e25-5c4b-9c4c-37e5b201dce7` Tangensquotient | `keep` / `keep` | **Keep-Synthese möglich nach gültigem B-Lauf.** Beide Kandidaten bewahren `cos(α) ≠ 0`; Herleitung aus Koordinaten/ähnlichem Dreieck und Transfer in einen anderen Quadranten sind zielgenau. Keine neue kanonische Formulierung nötig. |
| `7feaaebd-cc8d-522b-8b3a-ea22675c65dd` Extremstellen | `keep` / `keep` | **Bindungs-HOLD.** Inhaltlich passt das Prüfen tatsächlicher Extrema zu Parameterfällen; der B-Kandidat trägt aber falsche Ziel-/Seitenfingerprints. Nur eine frisch gebundene B-Runde kann ihn tragen. |
| `ccfd4e60-5728-568f-adb7-0b932d8e5aac` Exponential-/Polynom-Schar | `split_review` / `keep` | **HOLD.** Addition, Multiplikation und Verkettung sind unterschiedliche Operationen; die vorliegende `semanticAtomic: true`-Einordnung und normative Q4.1-Quelle müssen gegen diesen Breitenbefund geprüft werden. |
| `0e8417d7-effb-5314-93ba-a571b01726ce` Integrale verknüpfter Funktionen | `split_review` / `keep` | **HOLD.** Die B-Evidenz konkretisiert Summe, Produkt und Verkettung aus dem Vorgänger, während die aktuelle Beschreibung nur „verknüpft“ sagt. Methodische Reichweite und eigenständige Beherrschbarkeit vor `keep` klären. |
| `e33e75e3-eae5-5a09-862f-d1a11176373f` Transformationsschar | `keep` / `keep` | **Keep-Synthese möglich nach gültigem B-Lauf.** Ein einzelner Parameter für Streckung, Stauchung oder Verschiebung ist in der aktuellen Beschreibung eng genug gefasst; A-Evidenz verbindet Term, Graph und geänderten Funktionsfall. |

## Nächster enger Integrationsschritt

1. Das ignorierte PDF-/HTML-Renderderivat aus dem gebundenen BookModel
   **deterministisch** herstellen und den bestehenden Paket-Check ausführen;
   keine vorbereiteten historischen Artefakte überschreiben.
2. Einen tatsächlich zweiten, unabhängigen, blinden B-Run über die bestehende
   `round-b/batches/*.input.jsonl` mit echten Run-Metadaten ausführen.
   Vorliegende A-Records und B-Kandidaten dürfen dem Reviewer nicht vorgelegt
   werden. Für `7feaaebd…` die aktuellen Eingabefingerprints verwenden,
   nicht einen inhaltlich plausiblen Fremdrecord reparieren.
3. Erst danach `summarize`, die drei übereinstimmenden `keep`-Fälle
   (`4cba85d3…`, `7feaaebd…`, `e33e75e3…`) und sämtliche Dissent-/Splitfälle
   einzeln mit begründeter Entscheidung synthetisieren. Falls der neue B-Run
   abweicht, gilt natürlich dessen tatsächlicher Befund.
4. Gezielte D-/Profil-/Autorings-Checks und zentrale Fünf-Gate-Zählung erst
   nach gültiger Bindung und Synthese. Bis dahin: **0 neue strenge Abschlüsse**
   aus diesem Paket, keine behauptete menschliche Freigabe.
