import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function loadRenderer() {
  const result = await build({
    entryPoints: [join(root, "widget/src/memory-card-content.ts")],
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

test("card tokenizer preserves line breaks and recognizes inline and display TeX", async () => {
  const { tokenizeMemoryCardContent } = await loadRenderer();
  assert.deepEqual(
    tokenizeMemoryCardContent("Ableitung:\n$f'(x)=2x$\n$$F(x)=x^2$$"),
    [
      { type: "text", value: "Ableitung:\n" },
      { type: "math", value: "f'(x)=2x", display: false },
      { type: "text", value: "\n" },
      { type: "math", value: "F(x)=x^2", display: true }
    ]
  );
});

test("KaTeX produces self-contained MathML for real deck notation", async () => {
  const { renderMemoryCardMath } = await loadRenderer();
  const markup = renderMemoryCardMath("f'(x)=2x", false);
  assert.match(markup, /<math/);
  assert.match(markup, /f/);
  assert.doesNotMatch(markup, /@font-face|url\(/i);
});

test("untrusted TeX cannot inject scripts or event handlers", async () => {
  const { renderMemoryCardMath } = await loadRenderer();
  const markup = renderMemoryCardMath(
    String.raw`\text{</script><script>alert(1)</script><img src=x onerror=alert(2)>}`,
    false
  );
  assert.doesNotMatch(markup, /<script\b|<img\b/i);
  assert.match(markup, /&lt;/, "untrusted markup must remain escaped text");
});
