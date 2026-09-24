# Vorgehen für Beta-Test und ChatGPT-Veröffentlichung

**Verbindliche Entwicklervorgabe des Product Owners vom 12. September 2026.**

**Arbeitsreihenfolge: Claude-Beta → stabiler Kandidat → begrenzte
ChatGPT-Integrationsabnahme → Einreichung.**

Diese Vorgabe ersetzt die frühere Planung einer parallelen externen
ChatGPT-Beta und die weitere Suche nach ChatGPT-Verteilungsworkarounds.
Sie dokumentiert die Arbeitsreihenfolge, keine bereits erfolgte Stabilisierung,
Abnahme, Einreichung oder Veröffentlichung.

**Explizite Ergänzung vom 24. September 2026:** Der Product Owner möchte den
inzwischen sichtbaren offiziellen Archivimport in ChatGPT ausprobieren und
hat die Anpassung an natives CIMD/PKCE autorisiert. Dafür bleibt es bei einem
OpenAI-Endpunkt; mTLS darf zunächst auf `observe` stehen. Dieser konkrete
Integrationstest ist von der früheren Pause ausgenommen. Er ändert weder die
öffentliche Anbieterfreigabe noch behauptet er eine abgeschlossene Abnahme.
Siehe [native CIMD-Integration](openai-native-cimd.md).

## 1. Jetzt: laufenden Beta-Test mit Claude fortführen

Claude bleibt die Plattform für den tatsächlichen Beta-Test. Die
Entwicklungsarbeit konzentriert sich auf die dabei auftretenden Fehler und auf
die Stabilisierung des vollständigen Lernbetriebs.

Maßgeblich sind funktionierende Lernabläufe einschließlich Session-Fortsetzung,
Lernstandsverarbeitung und zuverlässiger Tool-Nutzung. Die bestehenden
Sicherheitsanforderungen, Datenschutzgrenzen und fachlichen Prüfungen bleiben
unverändert. Insbesondere wird für keinen Host die Clientauthentisierung
abgeschwächt oder Chat-Freitext an den SkillPilot Core übertragen.

**In dieser Phase wird kein zusätzlicher ChatGPT-Beta-Verteilungsweg aufgebaut.**
Es gibt keine weitere Suche nach Verteilungsworkarounds und keine
ChatGPT-spezifischen Erweiterungen auf Vorrat.

## 2. Sobald der Claude-Betrieb stabil ist: gezielte ChatGPT-Abnahme

Den unter Claude bewährten Stand mit Quellrevision und Build als
Veröffentlichungskandidaten festhalten und anschließend mit einer echten
ChatGPT-Verbindung prüfen. Derselbe Stand meint die gemeinsame fachliche
Implementierung; die erforderlichen Provider-Adapter und Paketidentitäten
bleiben getrennt.

Dabei geht es **nicht um eine Wiederholung der gesamten Beta**, sondern um die
Unterschiede der Host-Integration:

- Verbindungsaufbau und Authentifizierung einschließlich Token-Erneuerung;
- Laden der Coach-Anweisungen und tatsächliche Tool-Aufrufe;
- ein repräsentativer Lernablauf mit Session-Fortsetzung;
- die zum angebotenen ChatGPT-Funktionsumfang gehörenden Host-/UI-Prüfungen
  und die bestehenden Einreichungsnachweise.

Dabei auftretende ChatGPT-spezifische Fehler werden behoben. Betroffene
Regressionsprüfungen bleiben erforderlich; Claude-Ergebnisse ersetzen keine
ChatGPT-Host-Evidenz. Für die Einreichung wird ein Demovideo des tatsächlich
geprüften Kandidaten erstellt.

## 3. Nach erfolgreicher ChatGPT-Abnahme: einreichen

Den geprüften Kandidaten über den vorgesehenen offiziellen Einreichungsweg
veröffentlichen lassen. **Ein zusätzlicher externer ChatGPT-Betaweg ist keine
Voraussetzung dafür.** Einreichung, Herstellerfreigabe und tatsächliche
Veröffentlichung sind weiterhin getrennte Schritte.

Offene Herstelleranfragen werden getrennt behandelt. Nur ein konkret
nachgewiesenes Hindernis für die Einreichung oder den Betrieb kann diesen
Schritt blockieren, nicht das bloße Ausbleiben einer allgemeinen Supportantwort.
Die früher vorbereiteten Support-/Forumstexte zur Beta-Verteilung sind keine
aktiven Arbeitsaufträge.

## Zugehörige Runbooks

- [Claude-Beta: Installation und Updates](claude-personal-plugin-update-options.md)
- [OAuth-Clientauthentifizierung und profilweise Abnahme](oauth-client-authentication.md)
- [ChatGPT-Release und Rollback](openai-plugin-v1-release.md)
- [ChatGPT-Submission-Dossier](openai-plugin-v1-submission.md)
- [Demovideo des aktuellen Kandidaten](openai-plugin-v1-demo-video.md)
- [Historische Bewertung der ChatGPT-Beta-Verteilung](openai-beta-distribution-assessment.md)
