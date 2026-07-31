import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultRoot = resolve(repositoryRoot, "curricula");

export function computeRepositoryCurriculumRevision(root = defaultRoot) {
  const normalizedRoot = resolve(root);
  const files = listRuntimeJson(normalizedRoot);
  if (files.length === 0) {
    throw new Error(`No curriculum runtime JSON inputs found below ${normalizedRoot}.`);
  }
  const digest = createHash("sha256");
  updateFramed(digest, Buffer.from("skillpilot-curriculum-runtime-v1"));
  for (const path of files) {
    updateFramed(
      digest,
      Buffer.from(relative(normalizedRoot, path).replaceAll("\\", "/")),
    );
    digest.update(readFileSync(path));
    digest.update(Buffer.from([0]));
  }
  return `curricula-sha256@${digest.digest("hex")}`;
}

function listRuntimeJson(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Symlink is forbidden in curriculum runtime inputs: ${path}`);
      }
      if (entry.isDirectory()) {
        visit(path);
      } else if (
        entry.isFile() &&
        isRuntimeJson(relative(root, path).replaceAll("\\", "/"), entry.name)
      ) {
        if (!statSync(path).isFile()) {
          throw new Error(`Curriculum runtime input is not a regular file: ${path}`);
        }
        files.push(path);
      }
    }
  };
  visit(root);
  return files.sort((left, right) => {
    const leftPath = relative(root, left).replaceAll("\\", "/");
    const rightPath = relative(root, right).replaceAll("\\", "/");
    return leftPath < rightPath ? -1 : leftPath > rightPath ? 1 : 0;
  });
}

function isRuntimeJson(relativePath, name) {
  return (
    !relativePath.split("/").includes("quality") &&
    (name.endsWith(".json") || name.endsWith(".json.snapshot"))
  );
}

function updateFramed(digest, value) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(value.length);
  digest.update(length);
  digest.update(value);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(computeRepositoryCurriculumRevision(process.argv[2]));
}
