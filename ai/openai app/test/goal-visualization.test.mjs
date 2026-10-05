import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function loadGoalVisualizationParser() {
  const result = await build({
    entryPoints: [join(root, "widget/src/goal-visualization.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    write: false
  });
  const source = result.outputFiles[0]?.text;
  assert.ok(source);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("goal visualization parser accepts and normalizes the public structuredContent contract", async () => {
  const { goalVisualizationFromStructuredContent } = await loadGoalVisualizationParser();

  assert.deepEqual(
    goalVisualizationFromStructuredContent({
      goalVisualization: {
        goalId: "  MATH_ATOM_1  ",
        title: "  Lineare Funktionen verstehen  ",
        description: "  Eine Steigung im Koordinatensystem deuten.  ",
        imageUrl: "https://skillpilot.com/assets/goal-visualizations/math/MATH_ATOM_1.png",
        altText: "  Koordinatensystem mit einer steigenden Geraden.  ",
        cockpitUrl: "https://skillpilot.com/?l=math&goal=MATH_ATOM_1"
      }
    }),
    {
      goalId: "MATH_ATOM_1",
      title: "Lineare Funktionen verstehen",
      description: "Eine Steigung im Koordinatensystem deuten.",
      imageUrl: "https://skillpilot.com/assets/goal-visualizations/math/MATH_ATOM_1.png",
      altText: "Koordinatensystem mit einer steigenden Geraden.",
      cockpitUrl: "https://skillpilot.com/?l=math&goal=MATH_ATOM_1"
    }
  );
});

test("description is optional while all image and accessibility fields are required", async () => {
  const { goalVisualizationFromStructuredContent } = await loadGoalVisualizationParser();
  const required = {
    goalId: "PHYSICS_ATOM_1",
    title: "Kräfte darstellen",
    imageUrl: "https://skillpilot.com/assets/goal-visualizations/physics/PHYSICS_ATOM_1.webp",
    altText: "Kraftpfeile an einem Körper auf einer schiefen Ebene.",
    cockpitUrl: "https://skillpilot.com/?l=physics&goal=PHYSICS_ATOM_1"
  };

  assert.deepEqual(
    goalVisualizationFromStructuredContent({ goalVisualization: required }),
    required
  );
  assert.equal(goalVisualizationFromStructuredContent({}), undefined);
  assert.equal(
    goalVisualizationFromStructuredContent({
      goalVisualization: { ...required, imageUrl: "" }
    }),
    undefined
  );
  assert.equal(
    goalVisualizationFromStructuredContent({
      goalVisualization: { ...required, altText: " " }
    }),
    undefined
  );
});

test("goal visualization parser rejects non-HTTPS and credential-bearing URLs", async () => {
  const { goalVisualizationFromStructuredContent } = await loadGoalVisualizationParser();
  const required = {
    goalId: "ATOM_1",
    title: "Atomare Kompetenz",
    imageUrl: "https://skillpilot.com/assets/goal-visualizations/ATOM_1.png",
    altText: "Didaktische Darstellung der Kompetenz.",
    cockpitUrl: "https://skillpilot.com/?goal=ATOM_1"
  };

  for (const invalid of [
    { ...required, imageUrl: "javascript:alert(1)" },
    { ...required, imageUrl: "http://skillpilot.com/image.png" },
    { ...required, cockpitUrl: "https://user:secret@skillpilot.com/?goal=ATOM_1" },
    { ...required, cockpitUrl: "/?goal=ATOM_1" }
  ]) {
    assert.equal(
      goalVisualizationFromStructuredContent({ goalVisualization: invalid }),
      undefined
    );
  }
});

test("partial or empty host updates retain an already rendered visualization", async () => {
  const { retainGoalVisualization } = await loadGoalVisualizationParser();
  const current = {
    goalId: "ATOM_1",
    title: "Atomare Kompetenz",
    imageUrl: "https://skillpilot.com/assets/goal-visualizations/ATOM_1.png",
    altText: "Didaktische Darstellung der Kompetenz.",
    cockpitUrl: "https://skillpilot.com/?goal=ATOM_1"
  };

  for (const update of [undefined, null, {}, { unrelated: true }]) {
    assert.equal(
      retainGoalVisualization(current, update),
      current,
      "a partial openai:set_globals update must not clear the current image"
    );
  }
});

test("duplicate delivery is idempotent while a newer valid visualization replaces it", async () => {
  const { retainGoalVisualization } = await loadGoalVisualizationParser();
  const current = {
    goalId: "ATOM_1",
    title: "Atomare Kompetenz",
    imageUrl: "https://skillpilot.com/assets/goal-visualizations/ATOM_1.png",
    altText: "Didaktische Darstellung der Kompetenz.",
    cockpitUrl: "https://skillpilot.com/?goal=ATOM_1"
  };

  assert.equal(
    retainGoalVisualization(current, { goalVisualization: { ...current } }),
    current,
    "MCP Apps and window.openai may deliver the same result without reloading the image"
  );

  const replacement = retainGoalVisualization(current, {
    goalVisualization: {
      ...current,
      goalId: "ATOM_2",
      imageUrl: "https://skillpilot.com/assets/goal-visualizations/ATOM_2.png"
    }
  });
  assert.notEqual(replacement, current);
  assert.equal(replacement.goalId, "ATOM_2");
});

test("a stale window snapshot cannot mask the newer event visualization", async () => {
  const { firstGoalVisualization } = await loadGoalVisualizationParser();
  const current = {
    goalId: "ATOM_1",
    title: "Bisherige Kompetenz",
    imageUrl: "https://skillpilot.com/assets/goal-visualizations/ATOM_1.png",
    altText: "Bisherige didaktische Darstellung.",
    cockpitUrl: "https://skillpilot.com/?goal=ATOM_1"
  };
  const staleWindowSnapshot = { goalVisualization: { ...current } };
  const newerEventValue = {
    goalVisualization: {
      ...current,
      goalId: "ATOM_2",
      title: "Neue Kompetenz",
      imageUrl: "https://skillpilot.com/assets/goal-visualizations/ATOM_2.png",
      cockpitUrl: "https://skillpilot.com/?goal=ATOM_2"
    }
  };

  const selected = firstGoalVisualization(current, [
    newerEventValue,
    staleWindowSnapshot
  ]);

  assert.equal(selected.goalId, "ATOM_2");
  assert.equal(selected.title, "Neue Kompetenz");

  const currentEventVisualization = selected;
  const retained = firstGoalVisualization(currentEventVisualization, [
    newerEventValue,
    staleWindowSnapshot
  ]);
  assert.equal(
    retained,
    currentEventVisualization,
    "the current event value must stop an older window fallback from restoring ATOM_1"
  );
});

test("known full MCP result envelopes normalize to the public visualization", async () => {
  const { goalVisualizationFromToolResult } = await loadGoalVisualizationParser();
  const visualization = {
    goalId: "ATOM_1", title: "Learning goal", imageUrl: "https://skillpilot.com/ATOM_1.png",
    altText: "Approved image", cockpitUrl: "https://skillpilot.com/?goal=ATOM_1"
  };
  const structuredContent = { goalVisualization: visualization };
  const result = { isError: false, content: [], structuredContent };
  for (const envelope of [
    structuredContent, result,
    { status: "complete", mcp_tool_result: result },
    { status: "complete", call_tool_result: result },
    { status: "complete", call_tool_result: { result } },
    { toolResponseMetadata: { mcp_tool_result: result } }
  ]) {
    assert.deepEqual(goalVisualizationFromToolResult(envelope), visualization);
  }
});

test("envelopes preserve validation and never recover image data from errors or unrelated fields", async () => {
  const { goalVisualizationFromToolResult, retainGoalVisualization } = await loadGoalVisualizationParser();
  const visualization = {
    goalId: "ATOM_1", title: "Learning goal", imageUrl: "https://skillpilot.com/ATOM_1.png",
    altText: "Approved image", cockpitUrl: "https://skillpilot.com/?goal=ATOM_1"
  };
  const structuredContent = { goalVisualization: visualization };
  const invalid = [
    { isError: true, structuredContent },
    { mcp_tool_result: { isError: true, structuredContent } },
    { structuredContent: [{ goalVisualization: visualization }] },
    { unrelated: { structuredContent } },
    { _meta: structuredContent },
    { content: [{ type: "text", text: JSON.stringify(structuredContent) }] }
  ];
  for (const replacement of [
    { goalId: "x".repeat(201) }, { title: "x".repeat(501) }, { altText: "x".repeat(1001) },
    { imageUrl: "http://skillpilot.com/image.png" }, { imageUrl: "javascript:alert(1)" },
    { cockpitUrl: "https://user:secret@skillpilot.com/" }
  ]) {
    invalid.push({ call_tool_result: { result: { structuredContent: {
      goalVisualization: { ...visualization, ...replacement }
    } } } });
  }
  for (const envelope of invalid) {
    assert.equal(goalVisualizationFromToolResult(envelope), undefined);
    assert.equal(retainGoalVisualization(visualization, envelope), visualization);
  }
});

test("envelope traversal is bounded and safely ignores cyclic or excessively nested objects", async () => {
  const { goalVisualizationFromToolResult } = await loadGoalVisualizationParser();
  const cyclic = {};
  cyclic.result = cyclic;
  assert.equal(goalVisualizationFromToolResult(cyclic), undefined);
  assert.equal(goalVisualizationFromToolResult({ result: [cyclic] }), undefined);
  assert.equal(goalVisualizationFromToolResult({ result: { result: { result: { result: {
    structuredContent: { goalVisualization: {
      goalId: "ATOM_1", title: "Learning goal", imageUrl: "https://skillpilot.com/ATOM_1.png",
      altText: "Approved image", cockpitUrl: "https://skillpilot.com/?goal=ATOM_1"
    } }
  } } } } }), undefined);
});
