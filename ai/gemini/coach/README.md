# SkillPilot Coach for Gemini

This Apache-2.0 package supplies functional coaching instructions for the
Gemini **SkillPilot** custom MCP app. It is separate from the synthetic PoC and
from published Claude and ChatGPT packages. Version **0.1.0** is a local
candidate; building or importing it does not prove actual Gemini learning
acceptance.

Build the importable archive from the repository root:

```bash
python3 ai/gemini/coach/scripts/package_skill.py --frontend
```

The reproducible ZIP is `dist/skillpilot-coach-v1-0.1.0.zip`. Its only entries
are root-level `SKILL.md` and `LICENSE.txt`, carrying the repository's exact
Apache-2.0 `LICENSE` bytes. No scripts,
credentials, learner state, protected exam answers or synthetic probe are
included. `dist/manifest.json` records exact hashes and the local candidate
status. `--frontend` also prepares the first-party download; the normal app
build runs that command automatically. Generated archives are ignored by Git.

Import the ZIP under **Gemini Settings → Skills**. In a chat select the Skill
with **/**, select the connected **@SkillPilot** custom app and send the fresh
start message from SkillPilot's ordinary **Lernen starten → Gemini (Beta)**
entry. Re-import the complete ZIP when the coaching instructions change.

The model must use the native tools and its own `spg_` learning session. OAuth
transport authorization does not select the learner. The Skill covers the real
canonical learning context, evidence-based mastery, plans, native goal images,
answer-gated card practice, Verified Recall and exams. It does not depend on
another provider's HTML widgets.

On 6 October 2026, the actual Gemini ZIP importer rejected the initial local
candidate with an unsupported file-type error. That ZIP carried the extensionless
entry `LICENSE`. The candidate now names the identical license bytes
`LICENSE.txt`, a text-file extension supported by the importer. This is a
correction based on the observed rejection.

The corrected ZIP passed the **actual Gemini Skill import** on 6 October 2026
at **01:17:28 UTC**, through **Upload skill → files → ZIP → Save skill**.
The saved `skillpilot-coach-v1` entry was visible in the Skill library at
**01:19:30 UTC**. The imported editor content contained 13,690 instruction
characters and the memory-practice/mastery tool contract. Its content hash
matches the canonical Skill body after frontmatter removal and whitespace trim.
The tested ZIP SHA256 was
`2a5f5de47cd04345196cd21f0ab4dc4e0b3247b509a9deaaa0e2f8cd74d30a40`.
This confirms import and saved instructions; actual coaching, mastery
persistence and continuation in another chat remain separate host checks.

See [the integration runbook](../../../docs/deploy/gemini-integration.md)
for server setup, required host checks and current limitations.
