import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { contracts } from "../server/contracts/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const template = await readFile(join(root, "widget/template.html"), "utf8");

for (const contract of Object.values(contracts)) {
  const result = await build({
    entryPoints: [join(root, "widget/src/main.ts")],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    write: false,
    minify: true,
    loader: { ".css": "text" },
    define: {
      __SKILLPILOT_LOCALE__: JSON.stringify(contract.locale),
      __TOOL_CHOOSE__: JSON.stringify(contract.tools.choose.name),
      __TOOL_SUBMIT__: JSON.stringify(contract.tools.submit.name),
      __SELECTED_CONTEXT__: JSON.stringify(contract.copy.selectedContext),
      __SUBMITTED_CONTEXT__: JSON.stringify(contract.copy.submittedContext),
      __PENDING_MESSAGE__: JSON.stringify(contract.copy.pendingMessage),
      __EVALUATION_REQUEST_LABEL__: JSON.stringify(contract.copy.evaluationRequestLabel)
    }
  });
  const bundle = result.outputFiles.find((file) => file.path.endsWith(".js")) || result.outputFiles[0];
  if (!bundle) throw new Error(`No JavaScript bundle generated for ${contract.locale}`);
  const html = template
    .replace("__LANG__", contract.locale)
    .replace("__TITLE__", contract.appName)
    // Use a replacer function so `$&`, `$\`` and `$'` sequences in minified
    // dependency code remain literal JavaScript instead of being interpreted
    // as String.replace substitution tokens.
    .replace("__BUNDLE__", () => bundle.text.replaceAll("</script", "<\\/script"));
  const output = join(root, "dist", contract.locale, "widget.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
  console.log(`Built ${output}`);
}

const goalVisualizationResult = await build({
  entryPoints: [join(root, "widget/src/goal-visualization-main.ts")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  write: false,
  minify: true,
  loader: { ".css": "text" }
});
const goalVisualizationBundle =
  goalVisualizationResult.outputFiles.find((file) => file.path.endsWith(".js")) ||
  goalVisualizationResult.outputFiles[0];
if (!goalVisualizationBundle) {
  throw new Error("No JavaScript bundle generated for the goal visualization widget");
}
const goalVisualizationHtml = template
  .replace("__LANG__", "de")
  .replace("__TITLE__", "SkillPilot Lernziel")
  .replace("__BUNDLE__", () =>
    goalVisualizationBundle.text.replaceAll("</script", "<\\/script")
  );
const goalVisualizationOutput = join(root, "dist", "goal-visualization", "widget.html");
await mkdir(dirname(goalVisualizationOutput), { recursive: true });
await writeFile(goalVisualizationOutput, goalVisualizationHtml);
console.log(`Built ${goalVisualizationOutput}`);

const backendGoalVisualizationOutput = join(
  root,
  "../../backend/src/main/resources/openai/skillpilot-goal-visualization-v1.html"
);
await mkdir(dirname(backendGoalVisualizationOutput), { recursive: true });
await writeFile(backendGoalVisualizationOutput, goalVisualizationHtml);
console.log(`Built ${backendGoalVisualizationOutput}`);
