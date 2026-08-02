# Contributing to SkillPilot

There are two very different ways to contribute, and they need different things from you.

- **Curriculum Champion** — you know a subject and a curriculum. You do not need to write code.
- **Developer or designer** — you work on the app, the backend, the pipelines, or the docs.

Pick the section that fits. Both are equally welcome.

---

## Contribute as a Curriculum Champion

This is the primary way to contribute. A Champion takes one curriculum and makes it work in practice.

1. **Pick a curriculum** at [skillpilot.com/curricula](https://skillpilot.com/curricula).
2. **Work through the goals as a learner.** This is the point: problems become visible when you actually walk the path, not when you read the graph.
3. **Report what you find** with the [Curriculum feedback form](https://github.com/enpasos/skillpilot/issues/new?template=curriculum-feedback.yml). It asks for the subject, the Bundesland, and the goal, so a finding can be traced back to the source evidence.

Read the [Champion Guide](https://enpasos.github.io/skillpilot/qa-ci/champion-guide/) before you start. The [four-level champion model](https://enpasos.github.io/skillpilot/qa-ci/four-level-champion-model/) explains what kind of review sits at which level, and the [maturity levels M0–M7](https://enpasos.github.io/skillpilot/qa-ci/curriculum-quality-maturity-and-routes/) explain what a subject's quality label actually claims.

You do not need Git for this. An issue is enough.

---

## Contribute as a Developer or Designer

### Clone without pulling gigabytes

The repository carries around 3 GB of generated learning-goal images plus a large history. A plain `git clone` transfers roughly 7 GB. Use a blobless, shallow clone instead:

```bash
git clone --filter=blob:none --depth 1 https://github.com/enpasos/skillpilot.git
cd skillpilot
```

Git then fetches file contents only when something actually needs them. If you later need full history for one path, `git fetch --unshallow` still works.

### Toolchain

Versions are pinned in the repository, so read them from there rather than guessing:

| Tool | Pinned in | Version |
| --- | --- | --- |
| Node.js | `.nvmrc` | 20.20.2 |
| Java | `.java-version`, `.corretto-version` | 25.0.2 |
| Python | used by the curriculum and validation scripts | 3.11 |

With `nvm` installed, `nvm use` picks up `.nvmrc` automatically.

### Frontend

```bash
cd app
npm ci
npm run dev
```

### Backend

The backend needs a PostgreSQL database. `backend/src/main/resources/application.yml` defaults to database `skillpilot` on `localhost:5432` with user and password `skillpilot`, each overridable via `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`.

```bash
docker run --name skillpilot-db -e POSTGRES_DB=skillpilot \
  -e POSTGRES_USER=skillpilot -e POSTGRES_PASSWORD=skillpilot \
  -p 5432:5432 -d postgres

cd backend
./gradlew bootRun
```

Liquibase applies the schema on startup; see [Working with Liquibase](https://enpasos.github.io/skillpilot/dev/liquibase/) for how migrations are authored. [Deployment](https://enpasos.github.io/skillpilot/deploy/deployment/) describes the production path, not local development.

### Before you open a pull request

Run the checks that CI runs. The full local suite is:

```bash
./run_ci.sh
```

If you only touched documentation, the five documentation checks are much faster:

```bash
cd app
npm run check:docs-links
npm run check:docs-indexes
npm run check:terminology
npm run check:generated-doc-notices
npm run check:generated-status-registry
```

### Conventions

- **Commits** follow Conventional Commits where a scope is meaningful, for example `fix(openai): keep goal images visible across host updates`.
- **Documentation** follows [the documentation guidelines](https://enpasos.github.io/skillpilot/dev/documentation-guidelines/). They cover document roles, generated artifacts, terminology, and how to link repository files that live outside `docs/`.
- **Generated files are never edited by hand.** They start with a "do not edit manually" notice naming the script that produces them. Change the source and regenerate.
- **Terminology is enforced.** One concept keeps one name; `npm run check:terminology` fails on retired wording and explains the replacement.
- **Curriculum data is evidence-bound.** Changes to `curricula/` need to stay traceable to the official source; the QA lanes under [QA & CI](https://enpasos.github.io/skillpilot/qa-ci/) describe the rules that apply.

Branch off `main` and open the pull request against `main`.

---

## Reporting problems

- **Something is wrong in a curriculum** → [Curriculum feedback](https://github.com/enpasos/skillpilot/issues/new?template=curriculum-feedback.yml)
- **Something is broken in the software** → [Bug report](https://github.com/enpasos/skillpilot/issues/new?template=bug-report.yml)
- **You want to propose something** → [Feature request](https://github.com/enpasos/skillpilot/issues/new?template=feature-request.yml)
- **You found a security vulnerability** → do not open an issue; follow [SECURITY.md](SECURITY.md)

## Code of conduct

Participation in this project is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Licensing

The source code is licensed under Apache 2.0. By contributing you agree that your contribution is licensed under the same terms. Curriculum content carries additional constraints described in [LEGAL.md](LEGAL.md) — in particular, SkillPilot models the structure of official curricula and does not reproduce teaching materials.
