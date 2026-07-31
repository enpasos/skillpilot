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
