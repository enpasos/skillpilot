## Import- und Export-Workflow {#sec:import-export-workflow}

Dieses Kapitel spezifiziert die Portabilitätsabläufe für den Umzug pseudonymer Lernstände zwischen SkillPilot-Konten bzw. -Instanzen sowie für die clientseitige Verschlüsselung lokaler Lehrkraft-Klassendateien.

### Export, Signaturprüfung und Import des Lernstands {#sec:import-export-learner}

Der Lernstands-Import/Export gewährleistet **manipulationsgeschützte Datenportabilität**:

- **Enthalten:** gewähltes Curriculum, aktivierte Module/Personalisierung, Mastery-Zustand, geplante Ziele, Provenienz (`copySources`) und clientseitiger SRS-Zustand.
- **Ausgeschlossen & garantiert:** keinerlei Klarnamen/PII; ein Export verändert das Quellprofil nie, und beim Import behält das Zielprofil seine eigene `skillpilotId`.

1. **Export:** Das Backend erstellt ein per **HMAC-SHA256** signiertes `serverExport`-Paket (berechnet über geparste Werte, sodass Whitespace/Schlüsselreihenfolge unkritisch sind, jede Wertänderung jedoch die Signatur bricht), und das Frontend bündelt es zusammen mit `clientData.srsState` in einem versionierten `"2.0"`-JSON-Umschlag.
2. **Import:** Das Backend prüft die HMAC-SHA256-Signatur, übernimmt die Curriculum-Einstellungen, aktualisiert die binären Beherrschungsergebnisse importierter Ziele (unberührte Ziele bleiben erhalten; historische Zwischenwerte sind reine Speicherkompatibilität, siehe @ref{sec:workflow-step5}), ersetzt geplante Ziele, hängt Quell-`skillpilotId` und Zeitstempel an die `copySources`-Provenienz an und lässt den Browser `srsState` auf die Ziel-ID umschlüsseln. Nach der Produktkorrektur vom 4. November 2026 wird effektive Beherrschung aus expliziten Ergebnissen und ihren festen Autorenverträgen abgeleitet, ohne gültige Anerkennung durch Planwechsel zu entziehen oder alte Ergebnisse durch spätere Graphkanten auszuweiten.

```json
{
  "version": "2.0",
  "exportedAt": "2024-05-20T10:00:00.000Z",
  "serverExport": {
    "data": { "learner": {}, "mastery": {}, "plannedGoals": [], "copySources": [] },
    "signature": "<hmac-sha256>"
  },
  "clientData": {
    "srsState": { "srs_state_USERID_GOALID": {} }
  }
}
```

### Lokale Klassendateien von Lehrkräften {#sec:import-export-teacher-files}

Lokale Trainer-Klassen bilden einen **getrennten, vollständig im Browser verschlüsselten Pfad**, da sie Klarnamen/Aliase auf permanente SkillPilot-IDs abbilden; sie sind keine Lernstandsexporte und werden vom Backend weder gesehen noch signiert:

1. Die Lehrkraft vergibt und bestätigt eine Passphrase von mindestens **15 Zeichen** (mit konsistenter Unicode-Normalisierung vor der Schlüsselableitung).
2. Eine validierte lokale `ClassSession` wird als versioniertes `skillpilot-trainer-class`-Payload serialisiert.
3. **PBKDF2-SHA-256** (`600.000` Iterationen, frischer 16-Byte-Salt) leitet einen **AES-256-GCM**-Schlüssel ab (frischer 12-Byte-IV, 128-Bit-Tag, feste Klassendatei-AAD).
4. Ausschließlich der verschlüsselte Umschlag wird unter dem neutralen Dateinamen `skillpilot-class-YYYY-MM-DD.skillpilot` heruntergeladen (ohne Klassennamen im Dateinamen).

Algorithmus, Iterationszahl, Version, Zweck, Base64-Felder, Ciphertext und entschlüsseltes Payload werden vor der Übernahme strikt geprüft: Erkannte verschlüsselte Umschläge fallen niemals auf Klartext-Parsing zurück, und falsche Passphrasen sowie manipulierte Daten erzeugen dieselbe nicht-technische Fehlermeldung. Ältere Klartextdateien (`skillpilot-class-*.json`) bleiben mit explizitem Hinweis auf erneuten verschlüsselten Export importierbar. Da entschlüsselte Klassendateien permanente SkillPilot-IDs mit vollem Lernendenzugriff wiederherstellen (siehe [Lehrkraftansicht per SkillPilot-ID](repo:docs/concept/runtime-workflows/existing-learner-teacher-view.md)), sind sie wie Bearer-Secret-Container zu schützen; die Dateiverschlüsselung schützt Downloads *at rest*, nicht ein entsperrtes lokales Browserprofil.
