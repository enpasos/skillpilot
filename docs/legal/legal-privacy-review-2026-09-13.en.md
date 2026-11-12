# Legal Texts: Alignment of 13 September 2026

## Scope and Status

Terms of Use **1.1.0** and the general Privacy Notice, each in DE/EN, were
aligned with the current code and the binding Claude-first strategy. This is an
editorial and technical best-effort review, not legal sign-off by counsel and
not proof of completed publication.

Canonical copy lives in `app/src/utils/legalViewCopy.ts` and
`app/src/utils/privacyViewCopy.ts`. The static, JavaScript-free readable page
`app/public/privacy/index.html` is generated from that same privacy copy:

```bash
npm --prefix app run build:privacy-notice
npm --prefix app run test:legal-terms
npm --prefix app run test:ai-transparency-ui
```

The version bump requires renewed acceptance on the next regular first-party
launch; it does not terminate ongoing chats and does not constitute retroactive
consent to optional processing. Tests for new and legacy consent states remain
version-bound.

Verified locally: Terms/Privacy tests including static DE/EN parity checks, AI
transparency UI and inventory, TypeScript, targeted ESLint, and seven affected
launch/trainer UI regressions. The `/privacy` and `/legal` pages were checked in
both languages at 390 and 1280 pixels without horizontal overflow; the static
privacy page was additionally checked with JavaScript disabled. OpenAI history
check and Claude 1.1.5 artifact verification passed.

## Facts and Boundaries

| Topic | Evidence and Impact on Copy |
| --- | --- |
| Hosting | On 13 September 2026, the operator confirmed: SkillPilot Core is hosted in Germany. Do not extend this statement to Anthropic, support services, or other third-party providers. |
| Beta | Claude is the live beta path; ChatGPT remains unavailable for regular use until focused integration acceptance and official release. See [work order](../deploy/claude-beta-chatgpt-release-strategy.md). |
| Identity | `Learner` and `LearnerLifecycleService`: permanent ID serves as access key; no ordinary real-name registration. Pseudonymous is not anonymous; data-subject requests must not ask users to send access keys by email. |
| Coach data | `ClaudeV1McpContractAdapter` and `OpenAiDeV1McpContractAdapter`: structured result fields only, no answer texts, `workFeedback`, `outcomeFeedback`, or renamed equivalents. The coach writes its success response itself. Context and confirmed learning results still go to the selected provider. |
| Feedback | `LearnerGoalFeedbackAction` opens the same public, explicitly consent-gated flow as the Goal Book ("Lernzielbuch"). `GoalFeedbackSubmissionService` stores voluntary text and publication/consent records, not an intended learner ID. Personal data can arise inadvertently in free text; do not claim automatic anonymization. |
| Feedback deletion | `GoalFeedbackRetentionService`: 30 days plus daily cleanup run for online feedback not yet adopted; published upper bound in normal operation is 31 days. Adopted data, local exports, and processing/Codex logs have a separate retention boundary; see [intake runbook](../qa-ci/goal-feedback-codex-intake.md). Profile deletion does not automatically delete these across the board. |
| Profile deletion | `LearnerLifecycleService`: 365 days without defined successful activity, followed by the next cleanup run; in addition, manual Cockpit deletion. Does not cover all learner-independent OAuth rows, logs, or backups. |
| Sessions/OAuth | The 24-hour learning session and default 1-hour access / 30-day refresh tokens are access lifetimes, not universal database deletion deadlines. |
| Local storage | Explain browser access, profiles, teacher classes, settings, Terms version, and application cache separately from server deletion and downloaded files. An encrypted export does not protect an unlocked browser. |
| Logs | `RequestLoggingFilter`: coach result, MCP, OAuth, and feedback routes are excluded from the general request logger. Other routes may log redacted fields at `DEBUG`; additional legacy-route AI traces have no proven automatic TTL. Do not make blanket claims that SkillPilot never processes free text or stores zero diagnostics. |
| Illustrative images | AI-generated landing-page visuals are neither documented user experiences nor real product screenshots. General AI transparency copy and `LEGAL.md` were synchronized. |

The release-bound connector notice
`backend/src/main/resources/claude-connector-v1/privacy.html` and its release
evidence were **not** retroactively modified or re-issued as approved. It links
supplementally to the general Privacy Notice. Any future change to this bound
notice requires its own candidate/evidence process. Likewise, no historical
OpenAI review state was overwritten.

## Open Operator Reviews

These items cannot be resolved through wording or green tests:

- Verify and internally document the hosting, email, and other data processors
  actually used along with the required data-processing agreements; ensure
  specific recipient disclosure. Only the Core hosting country is confirmed so
  far, not a complete processor list.
- Define and technically verify production retention periods for application,
  reverse-proxy, journal/debug, and AI trace logs as well as SQL dumps, WAL,
  snapshots, and external backups, and make the Privacy Notice specific. The
  operator has not specified periods for these. `max-history: 7` and
  `backup_db.sh` defaulting to 30 days are repository defaults only, not a
  guarantee covering all production copies. The public text explicitly states
  this lack of specificity; doing so does not replace compliance with statutory
  disclosure and storage-limitation obligations.
- Enforce the purpose-bound deletion process in practice for exported feedback,
  support emails, and working/AI-tool logs. Automatic local feedback deletion
  deadlines are not proven. Before using external review services, verify their
  specific legal roles and transfer bases.
- Verify active debug/legacy-route traces, data-minimized logging, and secure
  data-subject verification in production operations; this task modified neither
  production configuration nor stored data.
- Obtain specialist legal counsel review of age rules, required consents,
  contract-amendment notices, legal bases, and third-country transfers. Existing
  statutory consumer rights are not excluded across the board.

## Reviewed Primary Sources

- The [GDPR (DSGVO)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng), in
  particular Arts. 5, 6, 12–22, 28, and 44 et seq., forms the basis for
  disclosures on purposes, data minimization, recipients, retention, legal
  bases, and data-subject rights.
- [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html) distinguishes
  strictly necessary terminal-equipment access for requested services from
  access requiring consent. Accepting the Terms is not blanket tracking consent.
- [Anthropic Consumer Terms](https://www.anthropic.com/legal/consumer-terms),
  Section 2: personal accounts require being at least 18 years old or meeting a
  higher local age threshold, with no sharing for use by others. Parental
  consent does not override this provider threshold.
- [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy), as of
  10 September 2026: provider inputs, recipients, data controls, and
  international processing. German Core hosting is not a Germany residency
  commitment for Claude.
- [Hessian Data Protection Authority](https://datenschutz.hessen.de/service/beschwerde-uebermitteln)
  as an accessible complaint channel; the right to lodge a complaint with
  another competent supervisory authority remains unaffected.
- [§ 309 BGB](https://www.gesetze-im-internet.de/bgb/__309.html),
  [§ 327 BGB](https://www.gesetze-im-internet.de/bgb/__327.html), and
  [§ 327r BGB](https://www.gesetze-im-internet.de/bgb/__327r.html): do not
  exclude liability, digital-product remedies, or modification rules across the
  board.
- Existing AI legal references remain intact after source verification:
  [EU AI Act (Regulation (EU) 2024/1689)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=de),
  [Amending Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj?locale=de),
  and [European Commission Guidelines](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems).
