# Abi-2026 Mathe DeepLink MVP (BlueSky)

## Linkstruktur

DeepLink-Zielseite:

```text
/start/abi26-he-mathe-k1
```

Unterstuetzte Parameter:

- `source` oder `utm_source`
- `campaign` oder `utm_campaign`
- `medium` oder `utm_medium`
- `track` oder `courseLevel` oder `f` (`GK` oder `LK`, default `GK`)

Beispiel:

```text
/start/abi26-he-mathe-k1?source=bluesky&campaign=abi26-mathe-k1&medium=social&track=GK
```

## Cockpit-Vorkonfiguration

Nach Klick auf `Kostenlose SkillPilot-ID erstellen`:

1. Neue pseudonyme SkillPilot-ID wird erzeugt (`POST /api/ui/learners`).
2. Curriculum wird gesetzt auf Hessen Oberstufe Mathematik (`PUT /api/ui/learners/{id}/curriculum`).
3. Scope wird gesetzt auf:
   - GK: `Abiturprüfung Mathematik` (`9ad83149-3cb7-5b87-a617-3eae3715a50c`)
   - LK: `Abiturprüfung Mathematik (LK)` (`464a6024-a2f8-53b4-84e0-d7b9df22a0b1`)
4. Cockpit wird mit UTM-/Campaign-Parametern geoeffnet.
   - `l` zeigt auf `Gymnasium (DE)`.
   - `f` bleibt der Root-/Bundeslandfilter `DE-HE`.
   - `courseLevel`/`track` traegt das Kursniveau `GK` oder `LK`.

## Events (MVP)

Events werden clientseitig gespeichert (`localStorage: skillpilot_campaign_events`) und an `POST /api/ui/events` gesendet:

- `page_view`
- `id_created`
- `cockpit_opened`
- `gpt_prompt_copied`
- `gpt_start_clicked`

## QA-Check (3 Test-Links)

1. BlueSky GK:
   `/start/abi26-he-mathe-k1?utm_source=bluesky&utm_campaign=abi26-he-mathe-k1&utm_medium=social&track=GK`
2. BlueSky LK:
   `/start/abi26-he-mathe-k1?utm_source=bluesky&utm_campaign=abi26-he-mathe-k1&utm_medium=social&track=LK`
3. Parameter-Fallback (ungueltiger Track):
   `/start/abi26-he-mathe-k1?source=bluesky&campaign=abi26-he-mathe-k1&medium=social&track=foo`

Erwartung:

- Track `foo` faellt sichtbar auf `GK` zurueck.
- ID-Erstellung funktioniert ohne Registrierung.
- Cockpit oeffnet mit gesetztem Scope und sichtbarem GPT-Startblock.
- Feedback-Hinweis ist auf Startseite und Cockpit sichtbar.
