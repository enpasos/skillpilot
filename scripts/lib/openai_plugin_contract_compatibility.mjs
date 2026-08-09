import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { relative, resolve } from "node:path";

const EFFECTFUL_ANNOTATIONS = [
  "readOnlyHint",
  "destructiveHint",
  "idempotentHint",
  "openWorldHint",
  "returnDirect",
];

const EXACT_SCHEMA_KEYWORDS = [
  "$ref",
  "$dynamicRef",
  "$schema",
  "$defs",
  "definitions",
  "additionalItems",
  "dependencies",
  "dependentRequired",
  "dependentSchemas",
  "discriminator",
  "multipleOf",
  "not",
  "if",
  "then",
  "else",
  "oneOf",
  "anyOf",
  "allOf",
  "prefixItems",
  "contains",
  "minContains",
  "maxContains",
  "propertyNames",
  "patternProperties",
  "unevaluatedProperties",
  "unevaluatedItems",
  "contentEncoding",
  "contentMediaType",
  "contentSchema",
  "default",
  "nullable",
  "readOnly",
  "writeOnly",
  "deprecated",
];

/**
 * Loads the compatibility-relevant portion of a release snapshot and verifies
 * that its redundant inventories agree with the canonical contract export.
 */
export function loadReleaseContract(releaseRoot) {
  const contract = readJson(resolve(releaseRoot, "contract/contract.json"));
  const toolsList = readJson(resolve(releaseRoot, "contract/tools-list.json"));
  const securitySchemes = readJson(
    resolve(releaseRoot, "contract/security-schemes.json"),
  );
  const resources = readJson(
    resolve(releaseRoot, "contract/resources-list.json"),
  );
  const errorCatalog = readJson(
    resolve(releaseRoot, "contract/error-catalog.json"),
  );
  const uiManifest = readJson(resolve(releaseRoot, "ui-manifest.json"));
  const skillsBundlePath = resolve(releaseRoot, "skills-bundle.json");

  assert.equal(
    Array.isArray(contract.tools),
    true,
    "contract/contract.json must contain a tools array.",
  );
  const toolNames = contract.tools.map((tool) => tool.name);
  assert.deepEqual(
    toolsList,
    toolNames,
    "contract/tools-list.json disagrees with contract/contract.json.",
  );
  assert.equal(
    new Set(toolNames).size,
    toolNames.length,
    "The exported contract contains duplicate tool names.",
  );

  const expectedSecurity = Object.fromEntries(
    contract.tools.map((tool) => [
      tool.name,
      tool.meta?.securitySchemes ?? [],
    ]),
  );
  assert.deepEqual(
    normalizeSecurityInventory(securitySchemes),
    normalizeSecurityInventory(expectedSecurity),
    "contract/security-schemes.json disagrees with tool metadata.",
  );
  assert.equal(
    Array.isArray(errorCatalog.errors),
    true,
    "contract/error-catalog.json must contain an errors array.",
  );
  keyedErrors(errorCatalog.errors, "error catalog");

  return {
    root: releaseRoot,
    contract,
    toolsList,
    securitySchemes,
    errorCatalog,
    resources: normalizeResources(resources, releaseRoot),
    skillsBundle: existsSync(skillsBundlePath)
      ? readJson(skillsBundlePath)
      : { files: [] },
    uiManifest: {
      ...uiManifest,
      resources: normalizeResources(uiManifest.resources ?? [], releaseRoot),
    },
  };
}

/**
 * Prevents a policy rollback from making an older direct-start capability
 * valid again. Revision zero represents the pre-contract-line draft only.
 */
export function assertLifecyclePolicyRevisionMonotone(
  previousLifecycle,
  candidateLifecycle,
  previousProviderNoticeVersion = null,
  candidateProviderNoticeVersion = null,
) {
  const previousLine = previousLifecycle.contractLine ?? (() => {
    assert.equal(
      previousLifecycle.schemaVersion,
      1,
      "Only lifecycle schemaVersion 1 may use the legacy revision-zero baseline.",
    );
    return {
      policyRevision: 0,
      newSessionPolicy: null,
      successor: null,
    };
  })();
  const candidateLine = candidateLifecycle.contractLine;
  assert.equal(
    isObject(candidateLine),
    true,
    "Candidate lifecycle must contain the canonical contractLine object.",
  );
  assert.equal(Number.isSafeInteger(candidateLine.policyRevision), true);
  assert.ok(
    candidateLine.policyRevision > 0,
    "Candidate lifecycle policyRevision must be a positive safe integer.",
  );
  assert.ok(
    candidateLine.policyRevision >= previousLine.policyRevision,
    `Lifecycle policyRevision must not decrease from ${previousLine.policyRevision} ` +
      `to ${candidateLine.policyRevision}.`,
  );

  const previousDecision = canonicalJson({
    newSessionPolicy: previousLine.newSessionPolicy ?? null,
    successor: previousLine.successor ?? null,
    providerNoticeVersion: previousProviderNoticeVersion,
  });
  const candidateDecision = canonicalJson({
    newSessionPolicy: candidateLine.newSessionPolicy,
    successor: candidateLine.successor,
    providerNoticeVersion: candidateProviderNoticeVersion,
  });
  if (previousLine.policyRevision > 0 && previousDecision !== candidateDecision) {
    assert.ok(
      candidateLine.policyRevision > previousLine.policyRevision,
      "Changing new-session policy, successor, or provider notice requires a strictly higher policyRevision.",
    );
  }
}

/**
 * Verifies the active, per-tool MCP App UI bindings. Immutable historical
 * resources may remain readable for provider metadata caches, but no tool may
 * bind one of those passive resources. Each active tool owns one distinct,
 * hash-bound resource.
 */
export function assertActiveUiBindings(activeBindings, resources, tools) {
  assert.equal(
    activeBindings !== null &&
      typeof activeBindings === "object" &&
      !Array.isArray(activeBindings),
    true,
    "UI activeBindings must be a non-empty object keyed by tool name.",
  );
  const expectedBindings = Object.entries(activeBindings ?? {});
  assert.ok(
    expectedBindings.length > 0,
    "UI activeBindings must be a non-empty object keyed by tool name.",
  );
  for (const [toolName, activeResourceUri] of expectedBindings) {
    assert.equal(
      typeof toolName,
      "string",
      "UI activeBindings tool names must be non-empty strings.",
    );
    assert.notEqual(
      toolName.length,
      0,
      "UI activeBindings tool names must be non-empty strings.",
    );
    assert.equal(
      typeof activeResourceUri,
      "string",
      `UI activeBindings.${toolName} must be a non-empty string.`,
    );
    assert.notEqual(
      activeResourceUri.length,
      0,
      `UI activeBindings.${toolName} must be a non-empty string.`,
    );
  }
  assert.equal(
    new Set(expectedBindings.map(([, uri]) => uri)).size,
    expectedBindings.length,
    "Every active MCP App tool must own a distinct UI resource.",
  );
  assert.ok(
    Array.isArray(resources) && resources.length > 0,
    "The V1 draft must inventory its active MCP App UI resources.",
  );
  assert.equal(
    new Set(resources.map(resourceUri)).size,
    resources.length,
    "MCP App UI resource URIs must be unique.",
  );
  for (const [toolName, activeResourceUri] of expectedBindings) {
    const matchingResources = (resources ?? []).filter(
      (resource) => resourceUri(resource) === activeResourceUri,
    );
    assert.equal(
      matchingResources.length,
      1,
      `UI activeBindings.${toolName} must identify exactly one inventoried resource.`,
    );
  }

  const actualBindings = new Map();
  for (const tool of tools ?? []) {
    const standardUri = tool?.meta?.ui?.resourceUri;
    const compatibilityUri = tool?.meta?.["openai/outputTemplate"];
    if (standardUri === undefined && compatibilityUri === undefined) {
      continue;
    }
    assert.equal(
      Object.hasOwn(activeBindings, tool.name),
      true,
      `Tool ${tool.name} links an MCP App UI resource without an active binding.`,
    );
    assert.equal(
      actualBindings.has(tool.name),
      false,
      `Tool ${tool.name} has more than one active UI binding descriptor.`,
    );
    const activeResourceUri = activeBindings[tool.name];
    assert.equal(
      standardUri,
      activeResourceUri,
      `Tool ${tool.name} must link ui.resourceUri to its active binding.`,
    );
    assert.equal(
      compatibilityUri,
      activeResourceUri,
      `Tool ${tool.name} must link openai/outputTemplate to its active binding.`,
    );
    actualBindings.set(tool.name, standardUri);
  }
  assert.deepEqual(
    Object.fromEntries(
      [...actualBindings].sort(([left], [right]) => left.localeCompare(right)),
    ),
    Object.fromEntries(expectedBindings.sort(([left], [right]) => left.localeCompare(right))),
    "Every declared active UI binding must be linked by exactly its dedicated tool.",
  );
}

/**
 * Returns all reasons why candidate cannot be released as a backwards
 * compatible minor/patch update of baseline within the same contract major.
 */
export function collectCompatibilityProblems(baseline, candidate) {
  const problems = [];
  const baselineTools = keyedByName(baseline.contract.tools, "baseline");
  const candidateTools = keyedByName(candidate.contract.tools, "candidate");

  for (const [name, baselineTool] of baselineTools) {
    const candidateTool = candidateTools.get(name);
    if (!candidateTool) {
      problems.push(
        `tools.${name}: published tool was removed or renamed`,
      );
      continue;
    }

    compareSchemas(
      baselineTool.inputSchema,
      candidateTool.inputSchema,
      "input",
      `tools.${name}.inputSchema`,
      problems,
    );
    compareSchemas(
      baselineTool.outputSchema,
      candidateTool.outputSchema,
      "output",
      `tools.${name}.outputSchema`,
      problems,
    );

    for (const annotation of EFFECTFUL_ANNOTATIONS) {
      if (isBreakingAnnotationChange(
        annotation,
        baselineTool.annotations?.[annotation],
        candidateTool.annotations?.[annotation],
      )) {
        problems.push(
          `tools.${name}.annotations.${annotation}: effectful annotation changed`,
        );
      }
    }

    if (
      !deepEqual(
        normalizeSecuritySchemes(baseline.securitySchemes[name] ?? []),
        normalizeSecuritySchemes(candidate.securitySchemes[name] ?? []),
      )
    ) {
      problems.push(
        `securitySchemes.${name}: authorization scheme or scope changed`,
      );
    }
    comparePublishedMetadata(
      baselineTool.meta ?? {},
      candidateTool.meta ?? {},
      `tools.${name}.meta`,
      problems,
    );
  }

  compareImmutableResourceSet(
    baseline.resources,
    candidate.resources,
    "contract.resources",
    problems,
  );
  compareUiManifest(baseline.uiManifest, candidate.uiManifest, problems);
  compareErrorCatalog(baseline.errorCatalog, candidate.errorCatalog, problems);
  const candidateSkillPaths = new Set(
    (candidate.skillsBundle?.files ?? []).map((file) => file.path),
  );
  for (const file of baseline.skillsBundle?.files ?? []) {
    if (!candidateSkillPaths.has(file.path)) {
      problems.push(`skills.${file.path}: published skill bundle file was removed`);
    }
  }
  return [...new Set(problems)].sort();
}

/**
 * Classifies compatible additive surface changes that require at least MINOR
 * and behavioural text changes that must stay visible in the CI/release log.
 */
export function collectPublicSurfaceChanges(baseline, candidate) {
  const minorRequired = [];
  const reviewRequired = [];
  const baselineTools = keyedByName(baseline.contract.tools, "baseline");
  const candidateTools = keyedByName(candidate.contract.tools, "candidate");

  for (const [name, candidateTool] of candidateTools) {
    const baselineTool = baselineTools.get(name);
    if (!baselineTool) {
      minorRequired.push(`new tool ${name}`);
      continue;
    }
    collectAddedSchemaFields(
      baselineTool.inputSchema,
      candidateTool.inputSchema,
      `tools.${name}.inputSchema`,
      minorRequired,
    );
    collectAddedSchemaFields(
      baselineTool.outputSchema,
      candidateTool.outputSchema,
      `tools.${name}.outputSchema`,
      minorRequired,
    );
    if (
      !deepEqual(
        stripSchemaDocumentation(baselineTool.inputSchema),
        stripSchemaDocumentation(candidateTool.inputSchema),
      )
    ) {
      minorRequired.push(`compatible input schema extension in tool ${name}`);
    }
    if (
      !deepEqual(
        stripSchemaDocumentation(baselineTool.outputSchema),
        stripSchemaDocumentation(candidateTool.outputSchema),
      )
    ) {
      minorRequired.push(`compatible output schema extension in tool ${name}`);
    }
    const baselineMeta = withoutSecuritySchemes(baselineTool.meta ?? {});
    const candidateMeta = withoutSecuritySchemes(candidateTool.meta ?? {});
    for (const key of Object.keys(candidateMeta)) {
      if (!Object.hasOwn(baselineMeta, key)) {
        minorRequired.push(`new tool metadata ${name}.${key}`);
      }
    }
    for (const annotation of EFFECTFUL_ANNOTATIONS) {
      if (
        !deepEqual(
          baselineTool.annotations?.[annotation],
          candidateTool.annotations?.[annotation],
        )
      ) {
        reviewRequired.push(
          `tool annotation changed: ${name}.${annotation}`,
        );
      }
    }
  }

  collectAddedResources(
    baseline.resources,
    candidate.resources,
    "new MCP resource",
    minorRequired,
  );
  collectAddedResources(
    baseline.uiManifest.resources ?? [],
    candidate.uiManifest.resources ?? [],
    "new UI resource",
    minorRequired,
  );
  if (
    baseline.uiManifest.enabled !== true &&
    candidate.uiManifest.enabled === true
  ) {
    minorRequired.push("UI support enabled");
  }

  const baselineSkills = new Map(
    (baseline.skillsBundle?.files ?? []).map((file) => [file.path, file]),
  );
  for (const file of candidate.skillsBundle?.files ?? []) {
    const previous = baselineSkills.get(file.path);
    if (!previous) {
      minorRequired.push(`new skill bundle file ${file.path}`);
    } else if (!deepEqual(previous, file)) {
      reviewRequired.push(`skill bundle content changed: ${file.path}`);
    }
  }
  if (
    baseline.contract.serverInstructions !==
    candidate.contract.serverInstructions
  ) {
    reviewRequired.push("server instructions changed");
  }
  const baselineErrors = keyedErrors(
    baseline.errorCatalog?.errors ?? [],
    "baseline error catalog",
  );
  for (const error of candidate.errorCatalog?.errors ?? []) {
    if (!baselineErrors.has(error.code)) {
      minorRequired.push(`new public error code ${error.code}`);
    }
  }

  return {
    minorRequired: [...new Set(minorRequired)].sort(),
    reviewRequired: [...new Set(reviewRequired)].sort(),
  };
}

export function assertReleaseCompatible(baselineRoot, candidateRoot) {
  const baseline = loadReleaseContract(baselineRoot);
  const candidate = loadReleaseContract(candidateRoot);
  const problems = collectCompatibilityProblems(baseline, candidate);
  assert.equal(
    problems.length,
    0,
    `OpenAI plugin release is not backwards compatible:\n- ${problems.join("\n- ")}`,
  );
}

export function assertSuccessorVersionClassification(
  baselineVersion,
  candidateVersion,
  baselineRoot,
  candidateRoot,
) {
  const baselineSemver = parseStableSemver(baselineVersion);
  const candidateSemver = parseStableSemver(candidateVersion);
  const baseline = loadReleaseContract(baselineRoot);
  const candidate = loadReleaseContract(candidateRoot);
  const changes = collectPublicSurfaceChanges(baseline, candidate);
  if (
    candidateSemver.minor === baselineSemver.minor &&
    changes.minorRequired.length > 0
  ) {
    throw new assert.AssertionError({
      message:
        `OpenAI plugin changes require a MINOR version bump:\n- ` +
        changes.minorRequired.join("\n- "),
    });
  }
  return changes;
}

/**
 * Behavioural text changes cannot be proven compatible from JSON Schema. They
 * therefore require an exact, machine-readable approval block in the release
 * notes. The reviewedChanges list is matched byte-for-byte against the diff so
 * a generic or stale approval cannot silently cover a later change.
 */
export function assertBehavioralReviewApproved(
  changes,
  releaseNotes,
  baselineVersion,
  candidateVersion,
) {
  if (changes.reviewRequired.length === 0) {
    return null;
  }
  const marker =
    /<!-- skillpilot-release-classification\s*\n([\s\S]*?)\n-->/u.exec(
      releaseNotes,
    );
  assert.notEqual(
    marker,
    null,
    "Behavioural changes require a skillpilot-release-classification JSON block in release notes.",
  );
  let classification;
  try {
    classification = JSON.parse(marker[1]);
  } catch (error) {
    throw new assert.AssertionError({
      message: `Invalid skillpilot-release-classification JSON: ${error.message}`,
    });
  }
  assert.equal(
    classification.schemaVersion,
    1,
    "Unsupported release classification schema.",
  );
  assert.equal(
    classification.fromVersion,
    baselineVersion,
    "Release classification fromVersion is stale.",
  );
  assert.equal(
    classification.toVersion,
    candidateVersion,
    "Release classification toVersion disagrees with candidate.",
  );
  assert.equal(
    classification.decision,
    "BACKWARDS_COMPATIBLE",
    "Behavioural review did not approve backwards compatibility.",
  );
  assert.equal(
    typeof classification.reviewedBy === "string" &&
      classification.reviewedBy.trim().length > 0,
    true,
    "Release classification reviewedBy is required.",
  );
  assert.equal(
    typeof classification.rationale === "string" &&
      classification.rationale.trim().length > 0,
    true,
    "Release classification rationale is required.",
  );
  assert.deepEqual(
    [...(classification.reviewedChanges ?? [])].sort(),
    [...changes.reviewRequired].sort(),
    "Release classification must enumerate the exact behavioural diff.",
  );
  return classification;
}

export function assertExactReleaseTree(actualRoot, expectedRoot) {
  const actualFiles = listFiles(actualRoot);
  const expectedFiles = listFiles(expectedRoot);
  assert.deepEqual(actualFiles, expectedFiles, "Release file set changed.");
  for (const path of actualFiles) {
    assert.equal(
      sha256(readFileSync(resolve(actualRoot, path))),
      sha256(readFileSync(resolve(expectedRoot, path))),
      `Release artifact changed: ${path}`,
    );
  }
}

export function validatePublishedIndex(index, expectedIdentity, contractMajor) {
  assert.equal(index.schemaVersion, 2, "Unsupported published index schema.");
  assert.equal(
    index.pluginIdentity,
    expectedIdentity,
    "Published index plugin identity disagrees with the release line.",
  );
  assert.equal(
    index.contractMajor,
    contractMajor,
    "Published index contract major disagrees with the release line.",
  );
  assert.equal(
    Array.isArray(index.publishedVersions),
    true,
    "Published index publishedVersions must be an array.",
  );
  assert.equal(
    new Set(index.publishedVersions).size,
    index.publishedVersions.length,
    "Published index contains duplicate versions.",
  );
  let previous = null;
  for (const version of index.publishedVersions) {
    parseStableSemver(version);
    assert.equal(
      version.split(".")[0],
      String(contractMajor),
      `Published version ${version} is outside the contract major.`,
    );
    if (previous !== null) {
      assert.equal(
        compareSemver(
          parseStableSemver(version),
          parseStableSemver(previous),
        ) > 0,
        true,
        "Published versions must be strictly increasing.",
      );
    }
    previous = version;
  }
  if (index.latestPublishedVersion === null) {
    assert.deepEqual(
      index.publishedVersions,
      [],
      "An unpublished line must not list published versions.",
    );
    assert.equal(
      index.baselinePath,
      null,
      "An unpublished line must not declare a published baseline.",
    );
    return;
  }
  parseStableSemver(index.latestPublishedVersion);
  assert.equal(
    index.latestPublishedVersion.split(".")[0],
    String(contractMajor),
    "Latest published version is outside the contract major.",
  );
  assert.equal(
    index.publishedVersions.at(-1),
    index.latestPublishedVersion,
    "Latest published version must be the final publishedVersions entry.",
  );
  assert.equal(
    typeof index.baselinePath,
    "string",
    "Published index baselinePath must be a string after publication.",
  );
  assert.equal(
    index.baselinePath.endsWith(`/${index.latestPublishedVersion}`),
    true,
    "Published index baselinePath must point at latestPublishedVersion.",
  );
}

export function determineReleaseVerificationMode(
  candidateVersion,
  publishedIndex,
) {
  const candidate = parseStableSemver(candidateVersion);
  assert.equal(
    candidate.major,
    publishedIndex.contractMajor,
    `Candidate ${candidateVersion} is outside contract major ${publishedIndex.contractMajor}.`,
  );
  if (publishedIndex.latestPublishedVersion === null) {
    return "initial-draft";
  }
  const current = parseStableSemver(publishedIndex.latestPublishedVersion);
  const ordering = compareSemver(candidate, current);
  if (ordering === 0) {
    return "exact-published";
  }
  assert.equal(
    ordering > 0,
    true,
    `Candidate ${candidateVersion} is older than latestPublishedVersion ${publishedIndex.latestPublishedVersion}.`,
  );
  return "compatible-successor";
}

export function internalDraftLabel(candidateVersion) {
  parseStableSemver(candidateVersion);
  return `${candidateVersion}-SNAPSHOT`;
}

export function advancePublishedIndex(index, candidateVersion, baselinePath) {
  const verificationMode = determineReleaseVerificationMode(
    candidateVersion,
    index,
  );
  assert.ok(
    verificationMode === "initial-draft" ||
      verificationMode === "compatible-successor",
    "An already published version cannot advance the published index.",
  );
  assert.equal(
    index.publishedVersions.includes(candidateVersion),
    false,
    `Candidate ${candidateVersion} is already listed as published.`,
  );
  return {
    ...index,
    latestPublishedVersion: candidateVersion,
    publishedVersions: [...index.publishedVersions, candidateVersion],
    baselinePath,
  };
}

export function listFiles(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = resolve(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Symlinks are forbidden in release bundles: ${absolute}`);
      }
      if (entry.isDirectory()) {
        visit(absolute);
      } else if (entry.isFile()) {
        files.push(relative(root, absolute).replaceAll("\\", "/"));
      }
    }
  };
  visit(root);
  return files.sort();
}

function compareSchemas(baseline, candidate, direction, path, problems) {
  if (typeof baseline === "boolean" || typeof candidate === "boolean") {
    if (!deepEqual(baseline, candidate)) {
      problems.push(`${path}: boolean schema changed`);
    }
    return;
  }
  if (!isObject(baseline) || !isObject(candidate)) {
    if (!deepEqual(baseline, candidate)) {
      problems.push(`${path}: schema shape changed`);
    }
    return;
  }

  compareTypeDomain(baseline.type, candidate.type, direction, path, problems);
  compareEnumDomain(baseline, candidate, direction, path, problems);

  const baselineRequired = new Set(baseline.required ?? []);
  const candidateRequired = new Set(candidate.required ?? []);
  if (direction === "input") {
    for (const name of candidateRequired) {
      if (!baselineRequired.has(name)) {
        problems.push(`${path}.required: new required field ${name}`);
      }
    }
  } else {
    for (const name of baselineRequired) {
      if (!candidateRequired.has(name)) {
        problems.push(
          `${path}.required: published required field ${name} changed`,
        );
      }
    }
  }

  const baselineProperties = baseline.properties ?? {};
  const candidateProperties = candidate.properties ?? {};
  for (const [name, baselineProperty] of Object.entries(baselineProperties)) {
    if (!Object.hasOwn(candidateProperties, name)) {
      problems.push(`${path}.properties.${name}: published field was removed`);
      continue;
    }
    compareSchemas(
      baselineProperty,
      candidateProperties[name],
      direction,
      `${path}.properties.${name}`,
      problems,
    );
  }
  if (direction === "output" && baseline.additionalProperties === false) {
    for (const name of Object.keys(candidateProperties)) {
      if (!Object.hasOwn(baselineProperties, name)) {
        problems.push(
          `${path}.properties.${name}: new output field is forbidden by the published schema`,
        );
      }
    }
  }

  compareAdditionalProperties(
    baseline.additionalProperties,
    candidate.additionalProperties,
    direction,
    `${path}.additionalProperties`,
    problems,
  );

  if (baseline.items !== undefined || candidate.items !== undefined) {
    if (baseline.items === undefined || candidate.items === undefined) {
      compareDomainPresence(
        baseline.items,
        candidate.items,
        direction,
        `${path}.items`,
        problems,
      );
    } else {
      compareSchemas(
        baseline.items,
        candidate.items,
        direction,
        `${path}.items`,
        problems,
      );
    }
  }

  compareLowerBound(baseline, candidate, "minimum", direction, path, problems);
  compareLowerBound(
    baseline,
    candidate,
    "exclusiveMinimum",
    direction,
    path,
    problems,
  );
  compareLowerBound(baseline, candidate, "minLength", direction, path, problems);
  compareLowerBound(baseline, candidate, "minItems", direction, path, problems);
  compareLowerBound(
    baseline,
    candidate,
    "minProperties",
    direction,
    path,
    problems,
  );
  compareUpperBound(baseline, candidate, "maximum", direction, path, problems);
  compareUpperBound(
    baseline,
    candidate,
    "exclusiveMaximum",
    direction,
    path,
    problems,
  );
  compareUpperBound(baseline, candidate, "maxLength", direction, path, problems);
  compareUpperBound(baseline, candidate, "maxItems", direction, path, problems);
  compareUpperBound(
    baseline,
    candidate,
    "maxProperties",
    direction,
    path,
    problems,
  );
  comparePatternLike(baseline, candidate, "pattern", direction, path, problems);
  comparePatternLike(baseline, candidate, "format", direction, path, problems);
  compareUniqueItems(baseline, candidate, direction, path, problems);

  for (const keyword of EXACT_SCHEMA_KEYWORDS) {
    if (!deepEqual(baseline[keyword], candidate[keyword])) {
      problems.push(`${path}.${keyword}: compatibility-sensitive constraint changed`);
    }
  }
}

function compareTypeDomain(baselineType, candidateType, direction, path, problems) {
  const baseline = toDomainSet(baselineType);
  const candidate = toDomainSet(candidateType);
  if (baseline === null && candidate === null) {
    return;
  }
  const compatible =
    direction === "input"
      ? candidate === null ||
        (baseline !== null && isSubset(baseline, candidate))
      : baseline === null ||
        (candidate !== null && isSubset(candidate, baseline));
  if (!compatible) {
    problems.push(`${path}.type: incompatible ${direction} type domain`);
  }
}

function compareEnumDomain(baselineSchema, candidateSchema, direction, path, problems) {
  const baseline = enumDomain(baselineSchema);
  const candidate = enumDomain(candidateSchema);
  if (baseline === null && candidate === null) {
    return;
  }
  const compatible =
    direction === "input"
      ? candidate === null ||
        (baseline !== null && isCanonicalSubset(baseline, candidate))
      : baseline === null
        ? true
        : candidate !== null &&
          isCanonicalSubset(candidate, baseline) &&
          isCanonicalSubset(baseline, candidate);
  if (!compatible) {
    problems.push(`${path}.enum: incompatible ${direction} enum/const domain`);
  }
  if (
    baseline !== null &&
    candidate !== null &&
    !deepEqual(baselineSchema.description, candidateSchema.description)
  ) {
    problems.push(`${path}.description: published enum meaning changed`);
  }
}

function compareAdditionalProperties(
  baselineValue,
  candidateValue,
  direction,
  path,
  problems,
) {
  const baseline = baselineValue ?? true;
  const candidate = candidateValue ?? true;
  if (isObject(baseline) && isObject(candidate)) {
    compareSchemas(baseline, candidate, direction, path, problems);
    return;
  }
  if (deepEqual(baseline, candidate)) {
    return;
  }
  const compatible =
    direction === "input"
      ? candidate === true
      : baseline === true || candidate === false;
  if (!compatible) {
    problems.push(`${path}: incompatible additional-property policy`);
  }
}

function compareDomainPresence(baseline, candidate, direction, path, problems) {
  const compatible =
    direction === "input"
      ? candidate === undefined
      : baseline === undefined;
  if (!compatible) {
    problems.push(`${path}: compatibility-sensitive schema was added or removed`);
  }
}

function compareLowerBound(
  baseline,
  candidate,
  keyword,
  direction,
  path,
  problems,
) {
  const before = baseline[keyword];
  const after = candidate[keyword];
  if (before === undefined && after === undefined) {
    return;
  }
  const compatible =
    direction === "input"
      ? after === undefined ||
        (before !== undefined && Number(after) <= Number(before))
      : before === undefined ||
        (after !== undefined && Number(after) >= Number(before));
  if (!compatible) {
    problems.push(`${path}.${keyword}: incompatible ${direction} lower bound`);
  }
}

function compareUpperBound(
  baseline,
  candidate,
  keyword,
  direction,
  path,
  problems,
) {
  const before = baseline[keyword];
  const after = candidate[keyword];
  if (before === undefined && after === undefined) {
    return;
  }
  const compatible =
    direction === "input"
      ? after === undefined ||
        (before !== undefined && Number(after) >= Number(before))
      : before === undefined ||
        (after !== undefined && Number(after) <= Number(before));
  if (!compatible) {
    problems.push(`${path}.${keyword}: incompatible ${direction} upper bound`);
  }
}

function comparePatternLike(
  baseline,
  candidate,
  keyword,
  direction,
  path,
  problems,
) {
  const before = baseline[keyword];
  const after = candidate[keyword];
  if (before === undefined && after === undefined) {
    return;
  }
  const compatible =
    deepEqual(before, after) ||
    (direction === "input" && after === undefined) ||
    (direction === "output" && before === undefined);
  if (!compatible) {
    problems.push(`${path}.${keyword}: incompatible ${direction} constraint`);
  }
}

function compareUniqueItems(baseline, candidate, direction, path, problems) {
  const before = baseline.uniqueItems ?? false;
  const after = candidate.uniqueItems ?? false;
  const compatible =
    before === after ||
    (direction === "input" && before === true && after === false) ||
    (direction === "output" && before === false && after === true);
  if (!compatible) {
    problems.push(`${path}.uniqueItems: incompatible ${direction} constraint`);
  }
}

function compareUiManifest(baseline, candidate, problems) {
  if (baseline.origin !== candidate.origin) {
    problems.push("ui.origin: immutable V1 UI origin changed");
  }
  if (baseline.schemaVersion !== candidate.schemaVersion) {
    problems.push("ui.schemaVersion: UI state schema changed within V1");
  }
  if (baseline.enabled === true && candidate.enabled !== true) {
    problems.push("ui.enabled: published UI support was disabled");
  }
  compareImmutableResourceSet(
    baseline.resources ?? [],
    candidate.resources ?? [],
    "ui.resources",
    problems,
  );
}

function compareErrorCatalog(baseline, candidate, problems) {
  if (baseline.schemaVersion !== candidate.schemaVersion) {
    problems.push("errors.schemaVersion: public error catalog schema changed");
  }
  if (baseline.contractMajor !== candidate.contractMajor) {
    problems.push("errors.contractMajor: public error catalog major changed");
  }
  const baselineErrors = keyedErrors(
    baseline.errors ?? [],
    "baseline error catalog",
  );
  const candidateErrors = keyedErrors(
    candidate.errors ?? [],
    "candidate error catalog",
  );
  for (const [code, error] of baselineErrors) {
    const replacement = candidateErrors.get(code);
    if (!replacement) {
      problems.push(`errors.${code}: published error code was removed`);
    } else if (!deepEqual(error, replacement)) {
      problems.push(
        `errors.${code}: published error semantics or recovery contract changed`,
      );
    }
  }
}

function isBreakingAnnotationChange(annotation, baseline, candidate) {
  if (deepEqual(baseline, candidate)) {
    return false;
  }
  if (annotation === "readOnlyHint" || annotation === "idempotentHint") {
    return baseline === true && candidate !== true;
  }
  if (annotation === "destructiveHint" || annotation === "openWorldHint") {
    return baseline === false && candidate !== false;
  }
  return true;
}

function comparePublishedMetadata(baseline, candidate, path, problems) {
  const baselineMetadata = withoutSecuritySchemes(baseline);
  const candidateMetadata = withoutSecuritySchemes(candidate);
  for (const [key, value] of Object.entries(baselineMetadata)) {
    if (!Object.hasOwn(candidateMetadata, key)) {
      problems.push(`${path}.${key}: published effectful metadata was removed`);
    } else if (!deepEqual(value, candidateMetadata[key])) {
      problems.push(`${path}.${key}: published effectful metadata changed`);
    }
  }
}

function collectAddedSchemaFields(baseline, candidate, path, result) {
  if (!isObject(baseline) || !isObject(candidate)) {
    return;
  }
  const baselineProperties = baseline.properties ?? {};
  const candidateProperties = candidate.properties ?? {};
  for (const [name, candidateProperty] of Object.entries(candidateProperties)) {
    const baselineProperty = baselineProperties[name];
    if (baselineProperty === undefined) {
      result.push(`new public field ${path}.properties.${name}`);
    } else {
      collectAddedSchemaFields(
        baselineProperty,
        candidateProperty,
        `${path}.properties.${name}`,
        result,
      );
    }
  }
  if (baseline.items !== undefined && candidate.items !== undefined) {
    collectAddedSchemaFields(
      baseline.items,
      candidate.items,
      `${path}.items`,
      result,
    );
  }
}

function collectAddedResources(baseline, candidate, label, result) {
  const baselineUris = new Set(
    (baseline ?? []).map(resourceUri).filter((uri) => uri !== null),
  );
  for (const resource of candidate ?? []) {
    const uri = resourceUri(resource);
    if (uri !== null && !baselineUris.has(uri)) {
      result.push(`${label} ${uri}`);
    }
  }
}

function withoutSecuritySchemes(meta) {
  return Object.fromEntries(
    Object.entries(meta).filter(([key]) => key !== "securitySchemes"),
  );
}

function normalizeSecurityInventory(inventory) {
  return Object.fromEntries(
    Object.entries(inventory)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([tool, schemes]) => [tool, normalizeSecuritySchemes(schemes)]),
  );
}

function normalizeSecuritySchemes(schemes) {
  return schemes
    .map((scheme) => ({
      ...scheme,
      ...(Array.isArray(scheme.scopes)
        ? { scopes: [...scheme.scopes].sort() }
        : {}),
    }))
    .sort((left, right) =>
      canonicalJson(left).localeCompare(canonicalJson(right)),
    );
}

function stripSchemaDocumentation(value) {
  if (Array.isArray(value)) {
    return value.map(stripSchemaDocumentation);
  }
  if (!isObject(value)) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) =>
          !new Set(["title", "description", "examples", "$comment"]).has(key),
      )
      .map(([key, child]) => [key, stripSchemaDocumentation(child)]),
  );
}

function compareImmutableResourceSet(baseline, candidate, path, problems) {
  const baselineResources = keyedResources(baseline, `${path}.baseline`, problems);
  const candidateResources = keyedResources(candidate, `${path}.candidate`, problems);
  for (const [uri, resource] of baselineResources) {
    const replacement = candidateResources.get(uri);
    if (!replacement) {
      problems.push(`${path}.${uri}: published resource was removed`);
      continue;
    }
    if (!hasContentFingerprint(resource)) {
      problems.push(
        `${path}.${uri}: published resource has no immutable content fingerprint`,
      );
    }
    if (!deepEqual(resource, replacement)) {
      problems.push(
        `${path}.${uri}: resource metadata or content changed under immutable URI`,
      );
    }
  }
}

function keyedResources(resources, path, problems) {
  if (!Array.isArray(resources)) {
    problems.push(`${path}: resource inventory is not an array`);
    return new Map();
  }
  const result = new Map();
  for (let index = 0; index < resources.length; index += 1) {
    const resource = resources[index];
    const uri =
      typeof resource === "string"
        ? resource
        : resource?.uri ?? resource?.resourceUri;
    if (typeof uri !== "string" || uri.length === 0) {
      problems.push(`${path}[${index}]: resource has no stable URI`);
      continue;
    }
    if (result.has(uri)) {
      problems.push(`${path}.${uri}: duplicate resource URI`);
    } else {
      result.set(uri, resource);
    }
  }
  return result;
}

function resourceUri(resource) {
  if (typeof resource === "string") {
    return resource;
  }
  const uri = resource?.uri ?? resource?.resourceUri;
  return typeof uri === "string" && uri.length > 0 ? uri : null;
}

function hasContentFingerprint(resource) {
  if (!isObject(resource)) {
    return false;
  }
  return [
    "sha256",
    "contentSha256",
    "integrity",
    "content",
    "text",
    "blob",
    "__artifactSha256",
  ].some((key) => resource[key] !== undefined);
}

function normalizeResources(resources, releaseRoot) {
  if (!Array.isArray(resources)) {
    return resources;
  }
  return resources.map((resource) => {
    if (!isObject(resource) || typeof resource.path !== "string") {
      return resource;
    }
    const absolute = resolve(releaseRoot, resource.path);
    assert.equal(
      absolute.startsWith(`${resolve(releaseRoot)}/`),
      true,
      `Resource path escapes release snapshot: ${resource.path}`,
    );
    assert.equal(
      existsSync(absolute),
      true,
      `Resource file is missing: ${resource.path}`,
    );
    return {
      ...resource,
      __artifactSha256: sha256(readFileSync(absolute)),
    };
  });
}

function keyedByName(tools, source) {
  const result = new Map();
  for (const tool of tools) {
    assert.equal(
      typeof tool.name,
      "string",
      `${source} contract contains a tool without a name.`,
    );
    assert.equal(
      result.has(tool.name),
      false,
      `${source} contract contains duplicate tool ${tool.name}.`,
    );
    result.set(tool.name, tool);
  }
  return result;
}

function keyedErrors(errors, source) {
  const result = new Map();
  for (const error of errors) {
    assert.equal(
      typeof error.code,
      "string",
      `${source} contains an error without a code.`,
    );
    assert.equal(
      result.has(error.code),
      false,
      `${source} contains duplicate error code ${error.code}.`,
    );
    result.set(error.code, error);
  }
  return result;
}

function enumDomain(schema) {
  if (Object.hasOwn(schema, "const")) {
    return [schema.const];
  }
  return Array.isArray(schema.enum) ? schema.enum : null;
}

function toDomainSet(value) {
  if (value === undefined) {
    return null;
  }
  return new Set(Array.isArray(value) ? value : [value]);
}

function isSubset(left, right) {
  return [...left].every((value) => right.has(value));
}

function isCanonicalSubset(left, right) {
  const rightValues = new Set(right.map(canonicalJson));
  return left.every((value) => rightValues.has(canonicalJson(value)));
}

function parseStableSemver(value) {
  assert.match(
    value,
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
    `Expected a stable semantic version, got ${value}.`,
  );
  const [major, minor, patch] = value.split(".").map(Number);
  return { major, minor, patch };
}

function compareSemver(left, right) {
  return (
    left.major - right.major ||
    left.minor - right.minor ||
    left.patch - right.patch
  );
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function deepEqual(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortValue(child)]),
    );
  }
  return value;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
