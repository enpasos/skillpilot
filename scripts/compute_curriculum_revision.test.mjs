import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { computeRepositoryCurriculumRevision } from "./compute_curriculum_revision.mjs";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "skillpilot-curriculum-revision-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, contents) => {
    const destination = join(root, path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, contents);
  };
  return { root, write };
}

test("archived quality evidence and links do not affect the runtime revision", (t) => {
  const { root, write } = fixture(t);
  write("DE/Gymnasium/Biologie.json", '{"title":"Biologie"}');
  const revision = computeRepositoryCurriculumRevision(root);
  write("DE/Gymnasium/quality/review/evidence.json", '{"status":"candidate"}');
  symlinkSync("missing-archive", join(root, "DE/Gymnasium/quality/review/native-inputs"), "dir");
  symlinkSync("missing-evidence.json", join(root, "DE/Gymnasium/quality/review/source.json"));
  assert.equal(computeRepositoryCurriculumRevision(root), revision);
  write("DE/Gymnasium/quality/review/evidence.json", '{"status":"reviewed"}');
  assert.equal(computeRepositoryCurriculumRevision(root), revision);
});

test("runtime JSON and snapshot changes still affect the revision", (t) => {
  const { root, write } = fixture(t);
  write("DE/Gymnasium/Biologie.json", '{"title":"Biologie"}');
  const original = computeRepositoryCurriculumRevision(root);
  write("DE/Gymnasium/Biologie.json", '{"title":"Biologie aktuell"}');
  const updated = computeRepositoryCurriculumRevision(root);
  assert.notEqual(updated, original);
  write("DE/Gymnasium/landscape.json.snapshot", '{"title":"Snapshot"}');
  assert.notEqual(computeRepositoryCurriculumRevision(root), updated);
});

test("similarly named directories remain runtime inputs", (t) => {
  const { root, write } = fixture(t);
  write("DE/Gymnasium/Biologie.json", '{"title":"Biologie"}');
  const revision = computeRepositoryCurriculumRevision(root);
  write("DE/Gymnasium/quality-backup/landscape.json", '{"title":"Runtime"}');
  assert.notEqual(computeRepositoryCurriculumRevision(root), revision);
});

for (const [path, type] of [
  ["DE/Gymnasium/linked-landscape.json", "file"],
  ["DE/Gymnasium/quality-backup", "dir"],
  ["DE/Gymnasium/quality", "dir"],
]) {
  test(`symlink outside archived evidence remains forbidden: ${path}`, (t) => {
    const { root, write } = fixture(t);
    write("DE/Gymnasium/Biologie.json", '{"title":"Biologie"}');
    symlinkSync("missing-target", join(root, path), type);
    assert.throws(() => computeRepositoryCurriculumRevision(root), /Symlink is forbidden in curriculum runtime inputs/u);
  });
}

test("quality evidence alone cannot count as runtime input", (t) => {
  const { root, write } = fixture(t);
  write("DE/Gymnasium/quality/evidence.json", '{"status":"reviewed"}');
  assert.throws(() => computeRepositoryCurriculumRevision(root), /No curriculum runtime JSON inputs found/u);
});
