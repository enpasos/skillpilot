import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function loadMetadataNormalizer() {
  const result = await build({
    entryPoints: [join(root, "widget/src/host-metadata.ts")],
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

test("ChatGPT compatibility metadata is normalized from the canonical MCP result envelope", async () => {
  const { widgetMetadataFromHost } = await loadMetadataNormalizer();
  const expected = {
    skillpilotApp: {
      sessionRef: "spapp_11111111-1111-4111-8111-111111111111",
      choiceRefs: ["choice_11111111-1111-4111-8111-111111111111"]
    }
  };

  assert.deepEqual(
    widgetMetadataFromHost({
      status: "complete",
      mcp_tool_result: { structuredContent: {}, _meta: expected }
    }),
    expected
  );
  assert.deepEqual(widgetMetadataFromHost(expected), expected);
  assert.deepEqual(widgetMetadataFromHost({ status: "complete" }), {});
});
