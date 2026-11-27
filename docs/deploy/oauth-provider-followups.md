# OAuth: getrennte Hersteller-Arbeitspakete

**Stand: 11. September 2026.** Diese Arbeitspakete blockieren ausschließlich
ihre Erweiterung, nicht die [unabhängigen OAuth-Profile](oauth-client-authentication.md).
Die Entwürfe wurden nicht versandt. Sie enthalten keine Zugangsdaten.

## ANTHROPIC-HELD: zentrale Credential-Hinterlegung

**Status:** extern nicht aktiviert. **Nachtrag vom 27. November 2026:** Die
Frage des Entwurfs vom 11. September ist durch Anthropics Dokumentation
beantwortet; der Entwurf wird nicht versandt. Einreichen kann inzwischen jeder
Bezahlplan, also auch das persönliche Pro-/Max-Konto des Betreibers, über das
Entwicklerportal `https://claude.ai/directory/manage`. Client-ID und Secret
eines von Anthropic verwahrten OAuth-Clients werden dort im Schritt
**Authentication** der Connector-Einreichung eingetragen
([Anthropic-Dokumentation](https://claude.com/docs/connectors/building/submission)).

**Abhängige Funktion:** Nur `claude-anthropic-held`. Öffentliche CIMD-Beta und
ein verfügbarer eigener vertraulicher Custom Connector benötigen die Antwort nicht.

**Eigener Stand:** Backend und synthetische Tests sind separat vorbereitet;
noch kein tatsächlicher Anthropic-held-Hosttest. Basic/Post, PKCE, Redirects
und Refresh werden mit dem dedizierten Custom-Client selbst geprüft, nicht
als allgemeine Herstellerfragen gestellt.

Anthropic ordnet zentral verwahrte Credentials einem Directory-Eintrag zu,
nicht einem beliebigen Custom Connector.
[Anthropic-Dokumentation](https://claude.com/docs/connectors/building/authentication#anthropic-held-client-credentials),
[Directory/Custom](https://claude.com/docs/connectors/building/directory-vs-custom)

**Entwurf vom 11. September 2026 (überholt, nicht versandt):** Er fragte das
MCP Review Team, welcher Weg zur Directory-Einreichung und zur Hinterlegung
der Credentials mit einem persönlichen Pro-/Max-Konto ohne Team-/Enterprise-
Organisation offensteht. Offen bleibt allein, ob die im Portal hinterlegten
Credentials auch gelten, wenn Nutzer denselben Endpunkt über das Plugin
verbinden; das klärt die Kopplung von Connector- und Plugin-Eintrag oder
andernfalls eine Rückfrage an `mcp-review@anthropic.com`.

**Abschlusskriterium:** Zugang/Hinterlegung tatsächlich erfolgt, sichere
Betriebsübergabe festgehalten und Installation, Code-Austausch, Refresh,
Widerruf sowie Lernbetrieb mit dem zentral hinterlegten Client nachgewiesen.
Eine Antwort allein erfüllt die Abnahme nicht.

## ANTHROPIC-ATTESTATION: optionale stärkere Integrationsbindung

**Status:** Separater optionaler Entwurf, nicht Teil der ersten Freigabe.

**Abhängige Funktion:** Zusätzlicher serverprüfbarer Plugin-Herkunftsnachweis
beziehungsweise eine andere stärkere Clientbindung. Nicht auf Basis einer
vermuteten Schnittstelle implementieren.

**Frage für ein späteres getrenntes Ticket:** Is there a documented,
self-service asymmetric OAuth client-authentication mechanism for hosted Claude
connectors, or a server-verifiable attestation binding an MCP request to a
specific publisher-controlled plugin/version? If so, please provide the
verification contract and registration route.

**Eigener Befund:** Die dokumentierten CIMD-/Secret-Verfahren liefern keinen
Nachweis unveränderter Skill-Dateien. Die erste Ausbaustufe verspricht das
nicht. Erst nach dokumentiertem Vertrag und eigenem Test als Funktion einplanen.

## OPENAI-IDENTITY: optionale Bindung an die konkrete Integration

**Status:** Entwurf zurückgestellt, bis reale JWT-/Installationsbelege vorliegen.
Keine allgemeine Genehmigungsanfrage für dokumentiertes `private_key_jwt`.

**Abhängige Funktion:** Nur stärkere Zuordnung zur konkreten SkillPilot-
Verteilung/Version, nicht das unabhängig abnehmbare `chatgpt-cimd-jwt`.
Noch kein realer Hosttest des neuen JWT-Profils dokumentiert.

OpenAI dokumentiert eine stabile CIMD-Clientidentität. Das beweist nicht die
Identität eines SkillPilot-Plugins. Die exakte ID, Callbacks, Audience,
JWKS-Rotation und der externe Beta-Installationsweg werden zunächst selbst geprüft.
[OpenAI: Client registration](https://developers.openai.com/plugins/build/auth#client-registration)

**Entwurf für den verfügbaren OpenAI-Entwicklersupportkanal**

Subject: SkillPilot — optional server-verifiable binding to a plugin integration

Hello,

We are integrating SkillPilot with ChatGPT using CIMD and mandatory
`private_key_jwt`. Our authorization server independently checks the allowed
client identity and published signing keys. We understand this authenticates
the OAuth client, not the contents of our plugin.

Is there a documented mechanism that binds a server-verifiable assertion to
our specific published integration or plugin version, rather than only to the
shared ChatGPT OAuth client identity? If available, please point us to its
verification contract and publisher registration requirements.

This is an optional strengthening request, separate from our implementation
and acceptance of the documented CIMD/JWT flow.

Thank you,  
SkillPilot — https://skillpilot.com

**Vor Versand:** Tatsächlichen Host-Teststatus ergänzen, ohne Tokens,
Assertions, Sitzungskennungen oder private Lerntranskripte. Zeigt der eigene
Test eine undokumentierte Verteilungsabweichung, diese mit bereinigtem
reproduzierbarem Befund als eigenes Problem beschreiben.
