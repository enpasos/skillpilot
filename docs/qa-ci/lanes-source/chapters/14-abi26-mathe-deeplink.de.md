## Abi-2026 Mathe DeepLink MVP (BlueSky) {#sec:qal-abi26-deeplink}

Dieses Kapitel dokumentiert die Linkstruktur, automatische Cockpit-Vorkonfiguration, Kampagnen-Telemetrie und QA-Prüflinks des DeepLink-MVPs für das hessische Mathematik-Abitur 2026.

### Linkstruktur und Cockpit-Vorkonfiguration {#sec:qal-abi26-flow}

Die Zielroute `/start/abi26-he-mathe-k1` akzeptiert `source` / `utm_source`, `campaign` / `utm_campaign`, `medium` / `utm_medium` sowie `track` / `courseLevel` / `f` (`GK` oder `LK`, Standardwert `GK`):

```text
/start/abi26-he-mathe-k1?source=bluesky&campaign=abi26-mathe-k1&medium=social&track=GK
```

Beim Klick auf `Kostenlose SkillPilot-ID erstellen` läuft vierstufig ab:

1. Erzeugung einer neuen pseudonymen SkillPilot-ID (`POST /api/ui/learners`).
2. Setzen des Curriculums auf Hessen Sekundarstufe II Mathematik (`PUT /api/ui/learners/{id}/curriculum`).
3. Setzen des Einstiegs-Scopes auf `Abiturprüfung Mathematik` (`9ad83149-3cb7-5b87-a617-3eae3715a50c`) für `GK` bzw. `Abiturprüfung Mathematik (LK)` (`464a6024-a2f8-53b4-84e0-d7b9df22a0b1`) für `LK`.
4. Öffnen des Cockpits mit Kampagnenparametern (`l` auf `Gymnasium (DE)`, Bundeslandfilter `f = DE-HE`, Kursniveau `GK` oder `LK`).

### Kampagnen-Events und QA-Prüfung (3 Test-Links) {#sec:qal-abi26-qa}

Kampagnen-Events werden lokal in `localStorage` (`skillpilot_campaign_events`) gepuffert und an `POST /api/ui/events` übermittelt: `page_view`, `id_created`, `cockpit_opened`, `gpt_prompt_copied` und `gpt_start_clicked`.

Für den manuellen QA-Durchlauf sind drei Links zu prüfen:

```text
1. GK:       /start/abi26-he-mathe-k1
               ?utm_source=bluesky&utm_campaign=abi26-he-mathe-k1
               &utm_medium=social&track=GK
2. LK:       /start/abi26-he-mathe-k1
               ?utm_source=bluesky&utm_campaign=abi26-he-mathe-k1
               &utm_medium=social&track=LK
3. Fallback: /start/abi26-he-mathe-k1
               ?source=bluesky&campaign=abi26-he-mathe-k1
               &medium=social&track=foo
```

Erwartetes Verhalten: Ungültiges `track=foo` fällt sichtbar auf `GK` zurück, die pseudonyme ID-Erstellung gelingt ohne Registrierung, das Cockpit öffnet mit gesetztem Scope sowie sichtbarem Coach-/GPT-Startblock, und der Feedback-Hinweis erscheint sowohl auf der Startseite als auch im Cockpit.
