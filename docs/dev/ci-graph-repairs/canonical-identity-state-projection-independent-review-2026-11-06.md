# Unabhängiger Zweitblick auf die reine Zustandsprojektion

Stand: 6. November 2026. **Für den begrenzten, unverdrahteten Helfer ist kein
zusätzlicher Implementierungsfehler nachgewiesen.** Die 15 neuen State-Tests
und, getrennt davon, die 23 bestehenden A-Tests wurden unabhängig frisch
kompiliert und erfolgreich ausgeführt. Das ist eine technische Agentenprüfung,
keine menschliche Fachabnahme, echte Zustandsmigration oder B-Freigabe.

`GoalStateProjection` ist paketprivat, ohne Spring-Bean und ohne Aufrufer aus
bestehenden Runtime-Diensten. `GoalIdentityProofLoader.load` verwirft weiterhin
jeden Aktivierungsversuch. Es existiert keine öffentliche A→State- oder
A→Runtime-Brücke. Der [Plan mit zehn offenen B-Verträgen](goal-identity-state-projection-plan-2026-11-06.md)
bleibt maßgeblich; die [A-Prüfung](canonical-identity-proof-independent-review-2026-11-06.md)
wird durch diesen Befund nicht erweitert.

## Geprüfter Stand und unabhängiger Replay

| Quelle | SHA-256 |
| --- | --- |
| `backend/src/main/java/com/skillpilot/backend/identity/GoalStateProjection.java` | `81b2bb5f6b3fa162a9f6f14079b59c1c35a8b9bd02e61f556e1cc964fa165dfa` |
| `backend/src/test/java/com/skillpilot/backend/identity/GoalStateProjectionTest.java` | `2e52ce2f916306b46db74ea7da7190b9dc2c3e8233540aa3dcaef110395633cb` |
| `backend/src/test/java/com/skillpilot/backend/identity/GoalIdentityServiceTest.java` | `e1b7f1a118f542484ea4330e6e269fc44b878deaae8bbefe264399654d3701ba` |

Eigener `javac`-Lauf mit Corretto 25.0.2.10.1: alle acht aktuellen
Identity-Produktionsquellen, beide Testklassen und ein separater Reflexionsrunner;
Abhängigkeiten aus den vorhandenen Backendklassen und 211 lokalen Gradle-JARs.
Jede `@Test`-Methode lief auf einer frischen Testinstanz. Ergebnis:
`GoalStateProjectionTest=15/15`, `GoalIdentityServiceTest=23/23`, ohne übersprungene
Methoden. Dies ist kein erneuter Gradle-, Spring-, Datenbank- oder Browsertest.
Die eingefrorenen State-Dateien hatten vor und nach der Prüfung dieselben Hashes.

Replaybeleg: `tmp/identity-state-independent-replay.log`, SHA-256
`16fd7119801b923ace846854cfb010e8a31a46374909da3f881c8044bac96540`.
Runner: `tmp/IdentityStateIndependentReview.java`, SHA-256
`5256998ec52f0fcd1d4e3493c67bec73c6a8c856ee8b28c3fff06f82a166ea23`.
Die Testquellen sind die dauerhafte Grundlage; temporäre Logs sind keine
Aktivierungsquittung.

## Bestätigte enge Eigenschaften

- Mastery und SRS vergleichen Aliaswerte einschließlich ihrer Zeitstempel.
  Andere Werte, Zeiten oder Kartenobjekte verursachen einen Konflikt; es gibt
  kein `max`, `latest` oder `passed-wins`. SRS vergleicht kanonische JSON-Werte,
  behält aber erfasste Payloadbytes. Karten-IDs werden nicht übersetzt.
- Ergebnislisten/-maps und erfasste Bytearrays sind gegen nachträgliche
  Eingabemutation geschützt. Nur typisierte Goalfelder werden übersetzt.
  Planreihenfolge, Duplikate, `null` gegenüber `[]`, Inaktivität, Revision,
  Fingerprint und ursprüngliche Capturebytes bleiben unterscheidbar.
- Navigation erhält Sessionbindung, Ablaufzeit und Generation. Originale
  Abschlussereignisse bleiben separat erhalten; die Arbeitsansicht fasst nur
  gleiche Goal-/Tagesereignisse mit gleichen Zeit-, Ergebnis- und Praxiswerten
  zusammen. Das entspricht der vorhandenen Goal-/Tag-Eindeutigkeit von
  `LearnerGoalCompletion`, ohne neue Abschlussereignisse zu schreiben.
- `prepareSignedImport` prüft zuerst HMAC-SHA256 über die unveränderte
  `ObjectMapper.writeValueAsString(originalLearnerDataDTO)`-Serialisierung,
  entsprechend `LearnerService.calculateSignature`. Erst die authentisierten
  erfassten DTO-Bytes werden wieder eingelesen und projiziert. Dies behauptet
  keine Signatur über beliebige ursprüngliche HTTP-/Archivrohbytes.
- Alle Identitätsgruppen werden vor Rückgabe vorbereitet. Auch ein später
  Plan- oder SRS-Fehler liefert keine Teilprojektion. Fachliche Scope-, Typ-,
  Berechtigungs-, Restore- und Transaktionschecks bleiben zusätzlich erforderlich.

## Zwei zwingende Integrationsgrenzen

Diese Gegenbeispiele sind **offene B-Abnahmekriterien**, keine behaupteten
produktiven Datenverluste: Der Helfer ist nicht verdrahtet. Sie verhindern aber,
ihn unverändert pauschal vor vollständige State-Reads und Upserts zu setzen.

**1. Historische, im aktuellen Graph unbekannte Schlüssel.** Ein einzelner
`retired_legacy_goal` in einer Mastery-Map scheitert aktuell mit
`Unknown original goal identity`; damit scheitert die gesamte Projektion.
Ein syntaktisch gültiger, ebenfalls unbekannter UUID-Key
`deadbeef-dead-4bee-8fed-0123456789ab` passiert dagegen den Identitätshelfer.
Das ist keine Prüfung der Existenz oder Lernberechtigung. Bestehende
Mastery-Reads lesen alle DB-Zeilen (`LearnerService.getMastery*`, ab Zeile 2690);
der heutige signierte Mastery-Import persistiert `entry.getKey()` unverändert
(ab Zeile 12683). SRS-Export und -Restore behandeln ebenfalls die tatsächlich
gespeicherten Keys (ab Zeile 12513).

Vor B muss ein echter Adapter erkannte Identitäten und unverändert aufbewahrte,
noch nicht aufgelöste Originalzeilen getrennt erfassen. Unbekannte historische
Zeilen dürfen weder gelöscht noch zu einer globalen Mastery-Rücknahme führen;
sie dürfen andererseits keine freien API-Ziele oder neuen Lernberechtigungen
werden. Erforderlich sind echte Read-/Export-/Import-Gegenfälle mit bekanntem
und unbekanntem State in demselben Bestand, einschließlich Karten und
Originalzeitstempeln. Ein allgemeiner `catch`-und-Passthrough im API-Resolver
wäre keine Lösung.

**2. Tatsächlicher Persistkey gegenüber authored Original-ID.** Der aktuelle
Helfer bildet den gespeicherten Beispielkey
`ab000000-0000-4000-8000-000000000001:original_memory_goal` auf den dauerhaften
Arbeitskey `original_memory_goal` ab. Ein bereits unter
`ABCDEFAB-CDEF-4ABC-8DEF-ABCDEFABCDEF` gespeicherter UUID-Key wird bei entsprechend
kleingeschriebener authored ID auf `abcdefab-cdef-4abc-8def-abcdefabcdef`
abgebildet. Das ist richtige Wertauflösung für Referenzen, aber noch kein Beweis,
dass ein späterer Upsert dieselbe vorhandene DB-Zeile trifft. Die heutigen
Mastery-/SRS-Repositories adressieren diese Zeilen über Stringkeys.

Vor B muss die State-Erfassung den tatsächlichen Original-Persistkey samt Owner,
Payload und Zeit an die aufgelöste Identität binden. Tests müssen qualifizierte,
unqualifizierte und UUID-casevariante Einzelzeilen sowie gleichwertige und
widersprüchliche Mehrfachzeilen durch echten Read, Write, Import und Export
führen. Kein Read darf umbenennen, kein Write eine zweite Durable Row erzeugen,
kein Konflikt eine Mastery-/Kartenentscheidung nach Reihenfolge treffen. Die
A-Referenznormalisierung allein ist keine State-Migrationspolicy.

Alle vier beschriebenen Verhaltensweisen wurden separat ausgeführt:
`tmp/IdentityStateBoundaryReview.java`, SHA-256
`b2499a3434a0fa20f9b7c44479f901bc22cae6de4e5db2775c8c265f4bef0e85`;
Ausgabe `tmp/identity-state-independent-boundaries.log`, SHA-256
`18306ba1caed88b8acbda427a0eda7726bf8842466265b3e5a68ebb5af50e6c2`.

Zusätzlich muss die spätere Fabrik nachweisen, dass Identitätsmap, erfasste
Statezeilen und aktive Graphgeneration zusammengehören. Snapshotmarkierung
und expliziter `requireSnapshot`-Check ersetzen diesen Adapterbeweis nicht.
Alle zehn B-Verträge einschließlich Repository-/Paket- und Browserisolation
bleiben offen. Diese Prüfung aktiviert nichts und verändert keine ursprünglichen
QA-, Curriculum- oder Lernerzustandsdaten.
