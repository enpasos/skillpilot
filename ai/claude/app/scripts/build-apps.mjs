import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const root = join(moduleDir, "..");
const repositoryRoot = join(root, "../../..");
const outputRoot = process.env.SKILLPILOT_CLAUDE_APP_TEST_OUTPUT_ROOT
  ? resolve(process.env.SKILLPILOT_CLAUDE_APP_TEST_OUTPUT_ROOT)
  : join(root, "dist");
const classpathRoot = process.env.SKILLPILOT_CLAUDE_APP_TEST_CLASSPATH_ROOT
  ? resolve(process.env.SKILLPILOT_CLAUDE_APP_TEST_CLASSPATH_ROOT)
  : join(repositoryRoot, "backend/src/main/resources/claude-connector-v1/mcp-apps");
const retainedIndexPath = join(classpathRoot, "retained-resources.json");
const retainedClasspathRoot = join(classpathRoot, "retained");
const template = await readFile(join(root, "src/template.html"), "utf8");
const thirdPartyNoticeCatalog = await loadThirdPartyNoticeCatalog();
const usedThirdPartyNoticeKeys = new Set();

const tools = Object.freeze({
  renderGoalVisualization: "render_skillpilot_goal_visualization",
  startMemoryPractice: "start_skillpilot_memory_practice",
  reviewMemoryPracticeCard: "review_skillpilot_memory_practice_card"
});

const resourceBase = "ui://skillpilot/claude/connector/v1";
const mimeType = "text/html;profile=mcp-app";
const widgetDomain = "ee8f5203b9b3d186c660c802e340f19c.claudemcpcontent.com";
const maxResourceBytes = 1_048_576;
const maxRetainedResources = 128;

const resourceDescriptors = Object.freeze({
  "goal-visualization.html": Object.freeze({
    name: "skillpilot-claude-goal-visualization-v1",
    title: "SkillPilot learning-goal image",
    description: "Displays the approved image for the active atomic learning goal.",
    prefersBorder: false,
    resourceDomains: ["https://skillpilot.com"]
  }),
  "memory-card-practice.html": Object.freeze({
    name: "skillpilot-claude-memory-card-practice-v1",
    title: "SkillPilot flashcard learning",
    description: "Interactive private flashcard practice for the active memory goal.",
    prefersBorder: true,
    resourceDomains: []
  })
});

const retainedResources = await loadRetainedResources();

await rm(outputRoot, { recursive: true, force: true });

const goal = await bundleResource({
  entryPoint: "src/goal-visualization-main.js",
  fileName: "goal-visualization.html",
  title: "SkillPilot learning-goal image",
  define: {}
});

const memory = await bundleResource({
  entryPoint: "src/memory-card-practice-main.js",
  fileName: "memory-card-practice.html",
  title: "SkillPilot flashcard learning",
  define: {
    __TOOL_MEMORY_CARD_START__: JSON.stringify(tools.startMemoryPractice),
    __TOOL_MEMORY_CARD_REVIEW__: JSON.stringify(tools.reviewMemoryPracticeCard)
  }
});

verifyThirdPartyNoticeCatalogCoverage();

for (const active of [goal, memory]) {
  retainedResources.delete(retainedKey(active.sha256, active.fileName));
}
// The index is authoritative. Rebuild this generated tree from the validated
// in-memory bytes so unindexed draft artifacts cannot be packaged by accident.
await rm(retainedClasspathRoot, { recursive: true, force: true });
const retainedManifestResources = await materializeRetainedResources();
await writeRetainedIndex(retainedManifestResources);

const manifest = {
  schemaVersion: 1,
  provider: "claude",
  contractMajor: 1,
  identityBoundary: "temporary-learning-session",
  mimeType,
  widgetDomain,
  tools: {
    [tools.renderGoalVisualization]: {
      readOnly: true,
      resourceUri: goal.uri
    },
    [tools.startMemoryPractice]: {
      readOnly: true,
      resourceUri: memory.uri
    },
    [tools.reviewMemoryPracticeCard]: {
      readOnly: false,
      visibility: ["app"]
    }
  },
  resources: [
    {
      name: "skillpilot-claude-goal-visualization-v1",
      title: "SkillPilot learning-goal image",
      description: "Displays the approved image for the active atomic learning goal.",
      mimeType,
      uri: goal.uri,
      path: goal.path,
      sha256: goal.sha256,
      bytes: goal.bytes,
      classpathPath: goal.classpathPath,
      ui: {
        domain: widgetDomain,
        prefersBorder: false,
        csp: {
          connectDomains: [],
          resourceDomains: ["https://skillpilot.com"],
          frameDomains: [],
          baseUriDomains: []
        }
      }
    },
    {
      name: "skillpilot-claude-memory-card-practice-v1",
      title: "SkillPilot flashcard learning",
      description: "Interactive private flashcard practice for the active memory goal.",
      mimeType,
      uri: memory.uri,
      path: memory.path,
      sha256: memory.sha256,
      bytes: memory.bytes,
      classpathPath: memory.classpathPath,
      ui: {
        domain: widgetDomain,
        prefersBorder: true,
        csp: {
          connectDomains: [],
          resourceDomains: [],
          frameDomains: [],
          baseUriDomains: []
        }
      }
    }
  ],
  retainedResources: retainedManifestResources
};

await writeFile(join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Built ${relative(root, join(outputRoot, "manifest.json"))}`);

async function bundleResource({ entryPoint, fileName, title, define }) {
  const result = await build({
    entryPoints: [join(root, entryPoint)],
    bundle: true,
    minify: true,
    write: false,
    format: "iife",
    platform: "browser",
    target: ["es2022"],
    loader: { ".css": "text" },
    define,
    drop: ["console"],
    legalComments: "inline",
    metafile: true
  });
  const bundle = result.outputFiles.find((file) => file.path.endsWith(".js"))
    ?? result.outputFiles[0];
  if (!bundle) throw new Error(`No JavaScript bundle generated for ${fileName}`);

  const thirdPartyNotices = await buildThirdPartyNotices(result.metafile, fileName);
  const html = template
    .replace("{{TITLE}}", () => escapeHtml(title))
    .replace("{{THIRD_PARTY_NOTICES}}", () => thirdPartyNotices)
    .replace("{{SCRIPT}}", () => bundle.text.replaceAll("</script", "<\\/script"));
  if (
    html.includes("{{TITLE}}")
    || html.includes("{{THIRD_PARTY_NOTICES}}")
    || html.includes("{{SCRIPT}}")
  ) {
    throw new Error(`Incomplete HTML template expansion for ${fileName}`);
  }
  const bytes = Buffer.from(html, "utf8");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const directoryName = `sha256-${sha256}`;
  const outputPath = join(outputRoot, directoryName, fileName);
  const classpathPath = join(classpathRoot, fileName);
  await retainPreviousClasspathResource(classpathPath, fileName, bytes);
  await Promise.all([
    mkdir(dirname(outputPath), { recursive: true }),
    mkdir(dirname(classpathPath), { recursive: true })
  ]);
  await Promise.all([writeFile(outputPath, bytes), writeFile(classpathPath, bytes)]);
  console.log(`Built ${relative(root, outputPath)}`);
  console.log(`Built ${relative(repositoryRoot, classpathPath)}`);
  return {
    uri: `${resourceBase}/${directoryName}/${fileName}`,
    path: relative(outputRoot, outputPath).replaceAll("\\", "/"),
    classpathPath: relative(repositoryRoot, classpathPath).replaceAll("\\", "/"),
    fileName,
    sha256,
    bytes: bytes.length
  };
}

async function loadThirdPartyNoticeCatalog() {
  const catalogPath = join(root, "third-party-notices.json");
  let catalog;
  try {
    catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  } catch (error) {
    throw new Error("Claude third-party notice catalog is not valid JSON.", { cause: error });
  }
  if (
    catalog?.schemaVersion !== 1
    || !Array.isArray(catalog.packages)
    || Object.keys(catalog).sort().join(",") !== "packages,schemaVersion"
  ) {
    throw new Error("Claude third-party notice catalog has an invalid shape.");
  }

  const result = new Map();
  for (const entry of catalog.packages) {
    if (
      !entry
      || Object.keys(entry).sort().join(",")
        !== "declaredLicense,licenseFile,licenseSha256,name,version"
      || typeof entry.name !== "string"
      || !/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(entry.name)
      || typeof entry.version !== "string"
      || entry.version.length === 0
      || typeof entry.declaredLicense !== "string"
      || entry.declaredLicense.length === 0
      || typeof entry.licenseFile !== "string"
      || !/^[A-Za-z0-9._-]+$/.test(entry.licenseFile)
      || !/^[0-9a-f]{64}$/.test(entry.licenseSha256)
    ) {
      throw new Error("Claude third-party notice catalog contains an invalid entry.");
    }
    const key = packageNoticeKey(entry.name, entry.version);
    if (result.has(key)) {
      throw new Error(`Duplicate Claude third-party notice catalog entry: ${key}.`);
    }
    result.set(key, Object.freeze({ ...entry }));
  }
  if (result.size === 0) {
    throw new Error("Claude third-party notice catalog must not be empty.");
  }
  return result;
}

async function buildThirdPartyNotices(metafile, fileName) {
  if (!metafile || typeof metafile.inputs !== "object" || metafile.inputs === null) {
    throw new Error(`Missing esbuild dependency metadata for ${fileName}.`);
  }

  const bundledPackages = new Map();
  for (const inputPath of Object.keys(metafile.inputs)) {
    const packageRoot = bundledPackageRoot(inputPath);
    if (!packageRoot) continue;

    const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
    const key = packageNoticeKey(packageJson.name, packageJson.version);
    const catalogEntry = thirdPartyNoticeCatalog.get(key);
    if (!catalogEntry) {
      throw new Error(`Bundled dependency lacks an approved license notice: ${key}.`);
    }
    if (packageJson.license !== catalogEntry.declaredLicense) {
      throw new Error(`Bundled dependency changed its declared license: ${key}.`);
    }

    const licenseBytes = await readFile(join(packageRoot, catalogEntry.licenseFile));
    const licenseSha256 = createHash("sha256").update(licenseBytes).digest("hex");
    if (licenseSha256 !== catalogEntry.licenseSha256) {
      throw new Error(`Bundled dependency license text changed: ${key}.`);
    }
    const licenseText = licenseBytes.toString("utf8").trimEnd();
    if (/<\/script/i.test(licenseText)) {
      throw new Error(`Bundled dependency license cannot be embedded safely: ${key}.`);
    }

    const existing = bundledPackages.get(key);
    if (existing && existing.licenseText !== licenseText) {
      throw new Error(`Bundled dependency has conflicting license texts: ${key}.`);
    }
    bundledPackages.set(key, { ...catalogEntry, licenseText });
    usedThirdPartyNoticeKeys.add(key);
  }

  if (bundledPackages.size === 0) {
    throw new Error(`No bundled production dependencies found for ${fileName}.`);
  }

  const sections = [...bundledPackages.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => [
      `===== ${key} =====`,
      `Declared license: ${entry.declaredLicense}`,
      `Source license file: ${entry.licenseFile}`,
      "",
      entry.licenseText
    ].join("\n"));
  return [
    "SkillPilot Claude MCP App - Third-party software notices",
    "This self-contained resource includes the following bundled production dependencies.",
    "",
    ...sections,
    ""
  ].join("\n");
}

function verifyThirdPartyNoticeCatalogCoverage() {
  const unused = [...thirdPartyNoticeCatalog.keys()]
    .filter((key) => !usedThirdPartyNoticeKeys.has(key))
    .sort();
  if (unused.length > 0) {
    throw new Error(`Unused Claude third-party notice catalog entries: ${unused.join(", ")}.`);
  }
}

function bundledPackageRoot(inputPath) {
  const normalized = inputPath.replaceAll("\\", "/");
  const marker = "/node_modules/";
  const markerIndex = normalized.lastIndexOf(marker);
  const packageNameStart = markerIndex >= 0
    ? markerIndex + marker.length
    : normalized.startsWith("node_modules/")
      ? "node_modules/".length
      : -1;
  if (packageNameStart < 0) return undefined;

  const segments = normalized.slice(packageNameStart).split("/");
  const packageSegmentCount = segments[0]?.startsWith("@") ? 2 : 1;
  if (segments.length < packageSegmentCount) return undefined;
  const packageRootPath = normalized.slice(
    0,
    packageNameStart + segments.slice(0, packageSegmentCount).join("/").length
  );
  return resolve(packageRootPath);
}

function packageNoticeKey(name, version) {
  if (typeof name !== "string" || typeof version !== "string") {
    throw new Error("Bundled dependency package metadata is incomplete.");
  }
  return `${name}@${version}`;
}

async function loadRetainedResources() {
  let indexBytes;
  try {
    indexBytes = await readFile(retainedIndexPath);
  } catch (error) {
    if (error?.code === "ENOENT") return new Map();
    throw error;
  }
  let index;
  try {
    index = JSON.parse(indexBytes.toString("utf8"));
  } catch (error) {
    throw new Error("Claude retained-resource index is not valid JSON.", { cause: error });
  }
  if (
    index?.schemaVersion !== 1
    || !Array.isArray(index.resources)
    || index.resources.length > maxRetainedResources
    || Object.keys(index).some((key) => !["schemaVersion", "resources"].includes(key))
  ) {
    throw new Error("Claude retained-resource index has an invalid shape.");
  }

  const result = new Map();
  for (const entry of index.resources) {
    if (
      !entry
      || Object.keys(entry).sort().join(",") !== "filename,sha256"
      || !resourceDescriptors[entry.filename]
      || !/^[0-9a-f]{64}$/.test(entry.sha256)
    ) {
      throw new Error("Claude retained-resource entry has an invalid shape.");
    }
    const bytes = await readFile(retainedClasspathPath(entry.sha256, entry.filename));
    verifyRetainedBytes(bytes, entry.sha256, entry.filename);
    const key = retainedKey(entry.sha256, entry.filename);
    if (result.has(key)) throw new Error(`Duplicate Claude retained resource ${key}.`);
    result.set(key, { ...entry, bytes });
  }
  return result;
}

async function retainPreviousClasspathResource(classpathPath, fileName, nextBytes) {
  let previousBytes;
  try {
    previousBytes = await readFile(classpathPath);
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  if (previousBytes.equals(nextBytes)) return;

  const sha256 = createHash("sha256").update(previousBytes).digest("hex");
  verifyRetainedBytes(previousBytes, sha256, fileName);
  const key = retainedKey(sha256, fileName);
  const existing = retainedResources.get(key);
  if (existing && !existing.bytes.equals(previousBytes)) {
    throw new Error(`Claude retained-resource collision for ${key}.`);
  }
  const retainedPath = retainedClasspathPath(sha256, fileName);
  await mkdir(dirname(retainedPath), { recursive: true });
  await writeFile(retainedPath, previousBytes);
  retainedResources.set(key, { filename: fileName, sha256, bytes: previousBytes });
}

async function materializeRetainedResources() {
  const entries = [...retainedResources.values()]
    .sort((left, right) => retainedKey(left.sha256, left.filename)
      .localeCompare(retainedKey(right.sha256, right.filename)));
  const manifestEntries = [];
  for (const entry of entries) {
    verifyRetainedBytes(entry.bytes, entry.sha256, entry.filename);
    const descriptor = resourceDescriptors[entry.filename];
    const directoryName = `sha256-${entry.sha256}`;
    const outputPath = join(outputRoot, directoryName, entry.filename);
    const classpathPath = retainedClasspathPath(entry.sha256, entry.filename);
    await Promise.all([
      mkdir(dirname(outputPath), { recursive: true }),
      mkdir(dirname(classpathPath), { recursive: true })
    ]);
    await Promise.all([
      writeFile(outputPath, entry.bytes),
      writeFile(classpathPath, entry.bytes)
    ]);
    manifestEntries.push({
      name: `${descriptor.name}-retained-${entry.sha256.slice(0, 12)}`,
      title: descriptor.title,
      description: descriptor.description,
      mimeType,
      uri: `${resourceBase}/${directoryName}/${entry.filename}`,
      path: relative(outputRoot, outputPath).replaceAll("\\", "/"),
      sha256: entry.sha256,
      bytes: entry.bytes.length,
      classpathPath: relative(
        repositoryRoot,
        classpathPath
      ).replaceAll("\\", "/"),
      ui: resourceUi(descriptor)
    });
  }
  return manifestEntries;
}

async function writeRetainedIndex(manifestEntries) {
  const resources = manifestEntries.map((entry) => ({
    filename: entry.path.split("/").at(-1),
    sha256: entry.sha256
  }));
  await mkdir(classpathRoot, { recursive: true });
  await writeFile(
    retainedIndexPath,
    `${JSON.stringify({ schemaVersion: 1, resources }, null, 2)}\n`
  );
}

function retainedClasspathPath(sha256, fileName) {
  return join(classpathRoot, "retained", `sha256-${sha256}`, fileName);
}

function retainedKey(sha256, fileName) {
  return `${sha256}/${fileName}`;
}

function verifyRetainedBytes(bytes, expectedSha256, fileName) {
  if (
    !resourceDescriptors[fileName]
    || !Buffer.isBuffer(bytes)
    || bytes.length === 0
    || bytes.length > maxResourceBytes
    || createHash("sha256").update(bytes).digest("hex") !== expectedSha256
  ) {
    throw new Error(`Claude retained resource is invalid: ${fileName}.`);
  }
}

function resourceUi(descriptor) {
  return {
    domain: widgetDomain,
    prefersBorder: descriptor.prefersBorder,
    csp: {
      connectDomains: [],
      resourceDomains: descriptor.resourceDomains,
      frameDomains: [],
      baseUriDomains: []
    }
  };
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
