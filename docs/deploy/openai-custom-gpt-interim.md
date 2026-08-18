# Neue SkillPilot Custom GPTs als befristeter Übergangskanal

**Stand:** 18. August 2026

**Status:** Clean-Slate-Builder-Paket vorbereitet; noch kein GPT erstellt und
keine Produktions-WebGUI geändert

**OpenAI-App:** `skillpilot-coach-v1` Version `1.0.0` bleibt unverändert im Review

## Entscheidung

Für den Übergang werden zwei neue, klar von der App unterscheidbare Custom GPTs
angelegt:

- `SkillPilot GPT Coach (de)`
- `SkillPilot GPT Coach (en)`

Es wird kein früherer GPT aktualisiert, geklont oder wiederhergestellt. Alte GPT-
IDs, URLs, Screenshots, Instructions, Knowledge-Dateien und Actions werden nicht
übernommen. Die neuen IDs und URLs entstehen erst bei der privaten Erstellung im
GPT Builder.

Das vollständige Builder-Paket liegt unter:

- `ai/openai custom gpt/de/`
- `ai/openai custom gpt/en/`

`ai/openai custom gpt/action-regression/` bleibt ausschließlich Testinfrastruktur
für Providerregressionen und wird nie in einen der beiden GPTs hochgeladen.

## Architektur ohne zusätzlichen Dienst

Der Übergang nutzt deployte Backendgrenzen im vorhandenen Spring-Boot-Prozess und
benötigt weder eine neue Route noch einen eigenen JVM-Prozess:

```text
separater Custom-GPT-Launcher in der WebGUI
  -> POST /api/ui/learners/{skillpilotId}/chat-start
  -> sichtbarer, 5 Minuten gültiger Einmalcode SP-....-....
  -> neuer locale-fester SkillPilot GPT Coach
  -> redeemStartCode
  -> internes 24-Stunden-chatSessionToken
  -> neun /visible/...-Coach-Actions
  -> CoachToolFacade / LearnerService / vorhandene Datenbank
```

Startcode-Einlösung und `/visible/...`-Adapter akzeptieren dasselbe vom
`ChatSessionService` erzeugte `sps_...`-Token. Die dauerhafte SkillPilot-ID bleibt
im Browser und Backend.

## Warum Retention ein Rollout-Gate bleibt

Die [offizielle OpenAI-Dokumentation zu GPT Actions](https://developers.openai.com/api/docs/actions/introduction)
beschreibt REST-Actions und ihre Authentisierung, garantiert aber nicht, dass ein
geheimes Action-Ergebnis in jedem späteren User-Turn als Modellkontext erhalten
bleibt.

Der öffentliche
[reproduzierbare Fehlerbericht](https://community.openai.com/t/custom-gpt-does-not-reuse-an-action-response-on-the-next-user-turn-reproducible-after-gpt-5-6-rollout/1386723)
dokumentiert den früheren Ausfall. Neue positive Tests sind deshalb belastbare
aktuelle Laufzeitevidenz, aber keine dauerhafte Providerzusage.

Jeder neue Sprach-GPT muss privat in einem neuen Chat bestehen:

1. Einmalcode wird genau einmal durch `redeemStartCode` eingelöst.
2. Token, `relayFooter`, Auswahlreferenzen und interne IDs bleiben unsichtbar.
3. Ein neuer User-Turn löst erfolgreich `getVisibleState` mit dem intern
   behaltenen Token aus.
4. Eine spätere Nummernantwort verwendet die intern behaltene
   `selectionReference` erfolgreich.
5. Der Test wird nach mehreren normalen Turns wiederholt.

Scheitert einer dieser Punkte, wird die betreffende Sprache nicht freigeschaltet.
Der GPT darf technische Werte weder erfinden noch vom Benutzer erfragen.

## Funktionsumfang gegenüber der OpenAI App V1

| Bereich | neue Custom-GPT-Übergangslösung | OpenAI App V1 |
| --- | --- | --- |
| Providerprodukt | zwei getrennte GPTs `(de)` und `(en)` | ein mehrsprachiges Plugin `skillpilot-coach-v1` |
| Zugang | neuer geteilter GPT-Link; ChatGPT-Anmeldung und dortige Verfügbarkeit erforderlich | Plugin-Veröffentlichung und dortige Verfügbarkeit erforderlich |
| SkillPilot-Identität | 5-Minuten-Einmalcode, danach internes 24h-Sessiontoken | OAuth-Appbindung plus getrennte 24h-Lernsession |
| Fachzustand | kompakter zehnteiliger Action-Vertrag | eingefrorener V1-MCP-Vertrag |
| Personal Curriculum | ausschließlich WebGUI; im GPT nicht ändern | ausschließlich WebGUI; im Coach nicht ändern |
| Fokus, aktives Ziel, Coaching, Mastery, Progress | enthalten | enthalten |
| Orientierung | aktuelle nicht prüfende Semantik | Bestandteil des eingefrorenen V1-Vertrags |
| Lernzielbilder | Cockpit-Link; kein MCP-Apps-Widget | gebundene MCP-Apps-Bildressource |
| normales Karteikartenüben | Cockpit-Link | interaktive MCP-Apps-Kartenressource |
| Verified Recall | kompatibler Action-Ablauf mit geschützten Antwort-/Write-Schritten | serverseitig stärker gebündelter V1-Ablauf |
| Prüfung | Aufgabe im State, Lösung erst über geschützte Evaluation nach sichtbarer Abgabe | V1-Prüfungswerkzeuge und -Semantik |
| Cross-Turn-Abhängigkeit | Action-Retention muss als Provider-Canary bestehen | Lernsession wird explizit an V1-Tools übergeben |
| Abschaltung | eigener WebGUI-Einstieg wird deaktiviert | keine Änderung am Review-Kandidaten |

Der Übergangskanal ist fachlich nutzbar, aber kein Ersatzvertrag für die App.
Insbesondere werden MCP-Apps-UIs, OAuth-Clientbindung, V1-Capabilities und der
stärker gebündelte V1-Recall-Ablauf nicht nachgebaut.

## Review-sicherer WebGUI-Vorschlag

### Während des aktiven Reviews unverändert lassen

Der eingereichte Pfad

```text
WebGUI-Konfiguration -> Lernen starten -> OpenAI App / vorbereitete Nachricht
```

bleibt byte- und verhaltensgleich. Insbesondere keine Änderung an:

- `app/src/components/SessionSetup.tsx`
- `app/src/coachVariants/coachLaunch.ts`
- `app/src/coachVariants/versionSelector.ts`
- `app/src/coachVariants/openAiMcp/`
- Plugin-, MCP-, OAuth-, Edge-, Portal- oder Reviewartefakten
- `VITE_SKILLPILOT_COACH_VARIANT` im Produktionsbuild

### Separater Übergangs-Launcher

Nach einer ausdrücklichen, eng begrenzten Product-Owner-Freigabe wird eine eigene
WebGUI-Route vorgeschlagen, beispielsweise `/custom-gpt`. Sie ist kein
Providerumschalter und ersetzt keinen vorhandenen Button.

Die Route verwendet den im Browser geladenen Lernenden und prüft, dass das
Personal Curriculum vollständig konfiguriert ist. Andernfalls führt sie zur
normalen WebGUI-Konfiguration zurück. Sie zeigt deutlich:

- `SkillPilot GPT Coach (de)` beziehungsweise `(en)`;
- „befristete Custom-GPT-Übergangslösung“, nicht „SkillPilot App“;
- ChatGPT als externen Anbieter und dessen Zugangsvoraussetzungen;
- Start einer neuen, höchstens 24 Stunden gültigen Lernsitzung;
- Datenschutzlink und Cockpit-Fallback;
- keine Behauptung, die im Review befindliche App sei veröffentlicht.

Beim Klick:

1. Browserfenster synchron leer öffnen, damit Popup-Blocker den späteren Wechsel
   nicht verhindern.
2. `requestChatStart` aus `app/src/utils/chatStart.ts` mit Sprache und einem
   eigenen Clientkennzeichen wie `custom-gpt-interim` aufrufen. Keine
   Curriculum-Mutation senden.
3. Die vorbereitete Nachricht mit der **neuen, locale-festen URL** öffnen.
4. Bei blockiertem Prompt-Deep-Link nur die Einmalnachricht als Copy-Fallback
   anbieten; niemals SkillPilot-ID oder Sessiontoken kopieren.
5. Bei Fehler das leere Fenster schließen und keinen erfolgreichen Start
   behaupten.

Die neuen URLs werden erst nach Builder-Erstellung und Acceptance gesetzt, etwa
über dedizierte Buildwerte:

```text
VITE_CUSTOM_GPT_URL_DE
VITE_CUSTOM_GPT_URL_EN
VITE_CUSTOM_GPT_INTERIM_ENABLED
```

Die gelöschten GPT-URLs, die während des Review-Freezes noch in altem
Frontendcode stehen können, sind keine gültige Quelle. Der neue Launcher darf
weder `app/src/utils/skillpilotGpt.ts` noch die URL-Defaults der alten
`visibleSession`-Variante übernehmen. Eine spätere Implementierung braucht eine
neue kleine, sprachspezifische Konfiguration und Tests gegen fehlende Werte.

Backend, Datenbank und JVM bleiben unverändert.

### Sichtbarkeit und Aktivierung

Die risikoärmste Variante während des Reviews ist:

1. Builder-Paket und Konzept vorbereiten;
2. beide GPTs privat erstellen und testen;
3. Produktions-WebGUI bis zum Reviewende unverändert lassen;
4. danach den separaten Einstieg aktivieren.

Muss der Übergang schon während des Reviews öffentlich werden, braucht die
Aktivierung vorab eine explizite Freeze-Ausnahme. Ein anderer Dateipfad allein
beweist wegen des wirkungsbezogenen Freezes keine Unabhängigkeit.

## Erforderliche Freeze-Ausnahme vor einem Rollout im Review

Die Product-Owner-Entscheidung muss mindestens festhalten:

1. **Grund:** einziger öffentlich nutzbarer Interimskanal bis zur App-Freigabe;
2. **Umfang:** nur separat benannte Custom-GPT-Route, Copy, neue URL-Konfiguration,
   Featureflag und Tests; der App-Start bleibt unverändert;
3. **Ziel:** Produktions-Webfrontend, nicht `skillpilot-coach-v1` Version `1.0.0`;
4. **Portalentscheidung:** ausdrücklich bestätigen, ob kein Withdraw/Resubmit
   nötig ist; andernfalls nicht ausrollen;
5. **Hashanker:** jede unvermeidbar berührte geschützte Datei exakt benennen und
   als eng begrenzte Ausnahme in Freeze-Metadaten und Checker aufnehmen.

Ohne diese Entscheidung bleibt es bei Paket, privaten Builder-Tests und Konzept;
es gibt keine Produktions-WebGUI-Änderung.

## Erstellung, Rollout und Rückfall

1. `npm test --prefix "ai/openai custom gpt"`.
2. `SkillPilot GPT Coach (de)` neu und privat erstellen; Canary und vollständige
   deutsche Acceptance ausführen.
3. `SkillPilot GPT Coach (en)` getrennt neu und privat erstellen; denselben Test
   auf Englisch ausführen.
4. Erst danach die neu vergebenen URLs in die freigegebene Deployment-
   Konfiguration übernehmen.
5. Nur mit zulässiger Freeze-Entscheidung den separaten Launcher aktivieren.
6. Monitoring auf Redeem-Erfolg, anonymisierte Sessionfehler `401/409/410` und
   Abbruchrate begrenzen; keine Codes oder Token loggen.

Rückfall bedeutet ausschließlich: separaten Launcher deaktivieren. Das berührt
weder die OpenAI App V1 noch den Cockpitbetrieb. Der sichtbare Relay-Modus darf nur
nach bewusster Produkt-/Datenschutzentscheidung als Notfallstart angeboten werden,
weil er das temporäre Sessiongeheimnis absichtlich in den Chat schreibt.
