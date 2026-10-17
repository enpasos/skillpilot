# Isolierte L7-Kandidatenkapsel – technische Bindungsentwürfe

Physischer Scriptroot: `/mnt/e/skillpilot-chemie-L7-20261017/accepted-components-current-bindings-independent-b-v1/capsule`. Inaktiv; kein neues wissenschaftliches Votum und keine Vollgates.

Canonical C650/7: `23edefb276456e1f9c0c35c590ee713805d61c2fc5a4b20ebdef60de06fe92a3`. 39 Sichten, 67 Memory-Einheiten, 80 Karten, M-Scope506.

## Vorbereitet

- SEM650: alle641 bisherigen Klassen erhalten, neun akzeptierte Memory-Klassen ergänzt;17 veränderte Quellen-Fingerprints mit tatsächlicher Stockfunktion neu gebunden. 9b bleibt curricularAtomic.
- M439:427 vollständige Originalzeilen bytegleich; elf akzeptierte Referenz-/9b-Nachfolger, eine rein technische F03-reviewId-Anpassung mit unverändertem Wissenschaftsdatum/-Reviewer und archiviertem Original.
- Karten80:75 vollständige Originalzeilen bytegleich; vier Bestandsnachfolger (eine Front, drei Backs) und eine neue NI-Karte. Ganze Vorher-/Nachherkarten und alle sieben dreifachen Deckkopien dokumentiert.
- P9: ganze akzeptierte Profile unverändert, aktuelle Stock-Goal-/ReviewInput-/Profil-Fingerprints und physische Bildbytes; ai_candidate/needs_human_review, E1/G1, reviewRunIds leer.
- Andere430P:415 vollständige Originalzeilen unter ihren eigenen Originalkriterien/reviewIds aktuell FP-passend;108 Konfigurationsfragmente erhalten diese Identitäten.15 reine ReviewInput-Abweichungen bleiben offen. Vollständige439 Originalzeilen bleiben archiviert.
- Gezielte Prüfungen: SEM-Schema gültig; P9-Schema/Stock-Semantik und bounded Stock-P9-Config ohne Fehler; M-/Karten-Stockformen ohne Fehler;67 Auswahlen identisch mit akzeptierter endlicher Messung,809 rohe Pfade ohne Lücke, Owner-Sichtbarkeit ohne Fehler.

## Korrigierte Diagnose

Die erste generische Kriterienanwendung ergab381 Abweichungen. Sie wurde unverändert versiegelt. Der additive Per-owner-Nachfolger benutzt jede tatsächliche Originalkonfiguration: keine Kriterienabweichung. Von15 echten offenen ReviewInput-Bindungen beruhen elf auf geänderten requires; vier stimmen bereits nicht mit dem archivierten L6-Kontext überein. Keine dieser15 Zeilen wurde blind aktualisiert.

## Offene15 P-Bindungen

| Ziel | Tatsächlicher Befund |
| --- | --- |
| `f85b4651-50ea-5b42-b193-3465c05257a7` | Keine aktuelle L6-zu-C650-Feld-/Bildänderung; Original-ReviewInput schon gegenüber L6 nicht passend, genauer Ursprung offen |
| `67cd332f-9db7-50e1-87f6-172ef3714300` | requires geändert |
| `92c99237-1c74-54fc-bf08-9191656afaa6` | requires geändert |
| `6966df95-f125-5ecc-af8e-0442545d9f17` | requires geändert |
| `9decc36b-a69a-5599-a9f0-fcebdf0203d8` | Keine aktuelle L6-zu-C650-Feld-/Bildänderung; Original-ReviewInput schon gegenüber L6 nicht passend, genauer Ursprung offen |
| `bbe038e9-86ed-5ec6-ab33-316758ddb16d` | requires geändert |
| `96fd8608-8d98-53f0-9b86-1311c3220fd3` | requires geändert |
| `5c8f0bbb-103a-579f-87fc-c997afe4fd18` | requires geändert |
| `64a5bb87-358d-5a22-958a-f66ba5521cd5` | requires geändert |
| `d465d82b-4bf2-5527-bb7c-dad5a92605fe` | Keine aktuelle L6-zu-C650-Feld-/Bildänderung; Original-ReviewInput schon gegenüber L6 nicht passend, genauer Ursprung offen |
| `a78aacf9-92ea-5627-8776-a595111f754c` | Keine aktuelle L6-zu-C650-Feld-/Bildänderung; Original-ReviewInput schon gegenüber L6 nicht passend, genauer Ursprung offen |
| `96d33fb6-ed14-50ab-b5c7-5ce0559d518a` | requires geändert |
| `e9d34f34-2a43-5cc7-bcca-1d08e057531d` | requires geändert |
| `1d2e7b80-653d-57b8-a284-8ede5a353b73` | requires geändert |
| `8ceb1749-fce0-584f-a2b8-0a309282329a` | requires geändert |

Vollständige Gründe, alte/neue Stock-Fingerprints, ursprünglicher Reviewpfad/-Reviewer/-Grund und Kriterienkonfiguration stehen in `OPEN.P-outside-nine-current-bindings.json`.

## Verbleibende Grenzen

NI4955/d3-Jurisdiktion und160 kompilierte Frontend-Ausschlüsse bleiben separat offen. Keine APV27-Overrides. Scoped Source-Case-Verbindlichkeit, Quellenstatus und formale aktuelle D-/A-/V-Kontextbindungen bleiben eigene Integrationsschritte. Keine Ausführung von fullM/APV/central/native/build; null neue Five-Gate-Schließungen; Human Approval=false, Human Trial=false, M7=false. Normal/L6 sind unverändert.

## Reproduktion

Nur in einer neuen Arbeitskopie der versiegelten Kapsel erneut materialisieren; Zeitstempel ändern den CAS. Die tatsächlichen Stockmodule und Lernressourcen liegen physisch in der Kapsel. Nur `app/node_modules` verweist auf geteilte unveränderte Abhängigkeiten.

```bash
TSX_DISABLE_CACHE=1 node --import /home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs /mnt/e/skillpilot-chemie-L7-20261017/accepted-components-current-bindings-independent-b-v1/capsule/app/scripts/L7AcceptedComponentsCandidateBinder.ts
```

Die gezielte P9-Prüfung ist im Binder über `reviewPositiveGoalEvidenceConfig` enthalten. Es werden keine Vollgates gestartet. Relevante Artefakte und Byte-Guards sind im äußeren CAS/Selector gepinnt.
