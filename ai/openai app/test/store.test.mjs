import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { CoachStore } from "../server/coach-store.mjs";
import { germanCatalog } from "../server/contracts/de.mjs";
import { privateWidgetMeta, publicCoachState } from "../server/presentation.mjs";

test("opaque widget references stay private while the learning state survives reload", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "skillpilot-mcp-store-"));
  const store = new CoachStore({ dataDir });
  const opened = await store.open(
    germanCatalog,
    "Ich möchte Mathematik in der Oberstufe in Hessen lernen."
  );

  const publicState = publicCoachState(opened, germanCatalog);
  const privateMeta = privateWidgetMeta(opened, germanCatalog);
  assert.equal(publicState.phase, "scope-choice");
  assert.deepEqual(publicState.choices.map((choice) => choice.label), ["Grundkurs", "Leistungskurs"]);
  assert.doesNotMatch(JSON.stringify(publicState), /spapp_|choice_/);
  assert.match(privateMeta.skillpilotApp.sessionRef, /^spapp_/);
  assert.equal(privateMeta.skillpilotApp.choiceRefs.length, 2);

  const selected = await store.choose(
    germanCatalog,
    privateMeta.skillpilotApp.sessionRef,
    privateMeta.skillpilotApp.choiceRefs[0]
  );
  assert.equal(selected.courseCode, "basic");
  assert.equal(selected.phase, "practice");

  const idempotencyKey = "widget_11111111-1111-4111-8111-111111111111";
  await store.submit(
    germanCatalog,
    privateMeta.skillpilotApp.sessionRef,
    "Ich erhalte x = 7, weil ich erst durch 3 teile und dann 2 addiere.",
    idempotencyKey
  );
  await assert.rejects(
    store.submit(
      germanCatalog,
      privateMeta.skillpilotApp.sessionRef,
      "Mit demselben Schlüssel wird jetzt eine andere Antwort versucht.",
      idempotencyKey
    ),
    /idempotency key was already used for a different answer/
  );
  const pending = await store.pending(germanCatalog);
  assert.match(pending.submission.answer, /x = 7/);

  await store.evaluate(germanCatalog, {
    score: 2,
    maxScore: 2,
    passed: true,
    feedback: "Fachlich richtig; der äquivalente Lösungsweg wird vollständig anerkannt."
  });

  const reloaded = new CoachStore({ dataDir });
  const persisted = await reloaded.current(germanCatalog);
  assert.equal(persisted.phase, "feedback");
  assert.equal(persisted.evaluation.score, 2);
  assert.equal(persisted.sessionRef, privateMeta.skillpilotApp.sessionRef);
});
