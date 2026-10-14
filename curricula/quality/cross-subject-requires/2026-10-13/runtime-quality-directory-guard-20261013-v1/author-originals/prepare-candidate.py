# Apache-2.0. Capture exact active source inputs; write isolated candidates only.
from pathlib import Path
from datetime import datetime, timezone
import difflib, hashlib, json, shutil
BASE=Path('tmp/cross-subject-requires/runtime-quality-directory-guard-20261013')
MAIN='backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java'
TEST='backend/src/test/java/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.java'
PRUNED='backend/src/test/java/com/skillpilot/backend/landscape/PrunedFileTreeTest.java'
def binding(p):
    data=Path(p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(data).hexdigest(),'byteLength':len(data)}
def write(name,obj):
    with (BASE/name).open('x') as f:f.write(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
inputs=[MAIN,TEST,PRUNED,'backend/src/main/java/com/skillpilot/backend/landscape/PrunedFileTree.java',
    'backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingService.java',
    'backend/build.gradle.kts','backend/settings.gradle.kts','backend/gradlew','backend/gradle/wrapper/gradle-wrapper.properties',
    'AGENTS.md','.java-version','.corretto-version','.nvmrc',
    'curricula/quality/cross-subject-requires/2026-10-13/by-identity-runtime-probe-20261013/findings-and-plan.json']
originals=[binding(p) for p in inputs]
write('original-inputs.sha256.json',{'schemaVersion':1,'capturedAt':datetime.now(timezone.utc).isoformat(),'files':originals})
for p in inputs:
    dest=BASE/'original'/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
# Copy Java sources only. No multi-gigabyte resources, live classes or active tests.
shutil.copytree('backend/src/main/java',BASE/'isolated-src/main/java')
(BASE/'isolated-src/test/java/com/skillpilot/backend/landscape').mkdir(parents=True)
for p in [TEST,PRUNED]:shutil.copyfile(p,BASE/'isolated-src/test/java/com/skillpilot/backend/landscape'/Path(p).name)
full_source_bindings=[binding(p) for p in sorted(Path('backend/src/main/java').rglob('*.java'))]
write('isolated-source-baseline.sha256.json',{'schemaVersion':1,'status':'exact_444_current_production_Java_sources_before_candidate_overlay','files':full_source_bindings,'testInputs':[binding(TEST),binding(PRUNED)]})

source=Path(MAIN).read_text()
old_constant='    private static final Path QUALITY_REVIEW_ARTIFACTS_PATH = Path.of("DE", "Gymnasium", "quality");\n'
assert source.count(old_constant)==1;source=source.replace(old_constant,'')
old_prune='path -> path.startsWith(dir.resolve(QUALITY_REVIEW_ARTIFACTS_PATH))'
assert source.count(old_prune)==2;source=source.replace(old_prune,'path -> isQualityReviewDirectory(dir, path)')
old_file='&& !file.startsWith(dir.resolve(QUALITY_REVIEW_ARTIFACTS_PATH));'
assert source.count(old_file)==1;source=source.replace(old_file,'&& !isQualityReviewDirectory(dir, file.getParent());')
anchor='    private long loadArchivedSourceLandscapes(Path dir, List<SkillLandscape> loaded) {'
helper='''    private boolean isQualityReviewDirectory(Path dir, Path directory) {
        // Only relative directory components count; the configured root may itself be named quality.
        for (Path segment : dir.relativize(directory)) {
            if ("quality".equals(segment.toString())) {
                return true;
            }
        }
        return false;
    }

'''
assert source.count(anchor)==1;source=source.replace(anchor,helper+anchor)
candidate=BASE/'candidate'/MAIN;candidate.parent.mkdir(parents=True);candidate.write_text(source)
shutil.copyfile(candidate,BASE/'isolated-src/main/java/com/skillpilot/backend/landscape/LandscapeService.java')

test=Path(TEST).read_text()
test=test.replace('"other-quality", "Accepted"','"other-quality", "Excluded review"')
test=test.replace('List.of(first, duplicate, link, neighbor, otherQuality)','List.of(first, duplicate, link, neighbor)')
test=test.replace('Files.setLastModifiedTime(ignored, FileTime.fromMillis(30_000));','Files.setLastModifiedTime(ignored, FileTime.fromMillis(30_000));\n        Files.setLastModifiedTime(otherQuality, FileTime.fromMillis(30_000));',1)
test=test.replace('.containsExactly("current", "linked", "neighbor", "other-quality");','.containsExactly("current", "linked", "neighbor");')
anchor='    private Path writeMapping(Path file, String legacyGoalId, String canonicalGoalId) throws Exception {'
extra='''    @Test
    void excludesQualityLandscapesAtEveryRelativeDepthWithoutReloadingForReviewChanges() throws Exception {
        Path root = Files.createDirectory(tempDir.resolve("curricula"));
        Path active = writeLandscape(root.resolve("canonical/current.json"), "current", "Before");
        List<Path> ignored = List.of(
                writeLandscape(root.resolve("quality/global.json"), "global-review", "Excluded"),
                writeLandscape(root.resolve("other/quality/source.json"), "other-review", "Excluded"),
                writeLandscape(root.resolve("DE/Gymnasium/quality/nested/source.json"), "gymnasium-review", "Excluded"),
                writeLandscape(root.resolve("DE/BY/FOS/nested/quality/source.json"), "fos-review", "Excluded"));
        Path metadata = root.resolve("quality/nested/review-metadata.json");
        Files.createDirectories(metadata.getParent());
        Files.writeString(metadata, "{\\"status\\":\\"review-only\\"}");
        Files.setLastModifiedTime(active, FileTime.fromMillis(10_000));
        for (Path file : ignored) {
            Files.setLastModifiedTime(file, FileTime.fromMillis(30_000));
        }
        Files.setLastModifiedTime(metadata, FileTime.fromMillis(30_000));

        LandscapeService service = new LandscapeService(properties(root), objectMapper);
        SkillLandscape cached = service.getById("current");
        assertThat(service.getAll()).extracting(SkillLandscape::getLandscapeId).containsExactly("current");
        assertThat(service.getLandscapeIdForGoal("current-goal")).isEqualTo("current");
        for (String id : List.of("global-review", "other-review", "gymnasium-review", "fos-review")) {
            assertThat(service.getById(id)).isNull();
            assertThat(service.getLandscapeIdForGoal(id + "-goal")).isNull();
        }
        assertThat(readLong(service, "lastLoadedFingerprint")).isEqualTo(10_000);
        assertThat(invokeLong(service, "getLatestTimestamp", root)).isEqualTo(10_000);

        for (int i = 0; i < ignored.size(); i++) {
            writeLandscape(ignored.get(i), "changed-review-" + i, "Changed excluded source");
            Files.setLastModifiedTime(ignored.get(i), FileTime.fromMillis(40_000));
        }
        // Even metadata becoming a genuine landscape candidate must stay excluded.
        writeLandscape(metadata, "metadata-candidate", "Changed excluded metadata");
        Files.setLastModifiedTime(metadata, FileTime.fromMillis(50_000));
        resetReloadCheck(service);
        assertThat(service.getById("current")).isSameAs(cached);
        assertThat(service.getById("metadata-candidate")).isNull();
        assertThat(readLong(service, "lastLoadedFingerprint")).isEqualTo(10_000);
        assertThat(invokeLong(service, "getLatestTimestamp", root)).isEqualTo(10_000);

        // A real edit older than the excluded candidates must still trigger a reload.
        writeLandscape(active, "current", "After");
        Files.setLastModifiedTime(active, FileTime.fromMillis(20_000));
        resetReloadCheck(service);
        assertThat(service.getById("current")).isNotSameAs(cached);
        assertThat(service.getById("current").getTitle()).isEqualTo("After");
        assertThat(service.getAll()).extracting(SkillLandscape::getLandscapeId).containsExactly("current");
        assertThat(readLong(service, "lastLoadedFingerprint")).isEqualTo(20_000);
    }

    @Test
    void acceptsQualityNamedRootNeighborDirectoriesAndJsonFilenameWithoutChangingOtherSourceScopes() throws Exception {
        // Both the configured root and its ancestor are named quality; neither is relative scope.
        Path root = Files.createDirectories(tempDir.resolve("quality/quality"));
        Path namedFile = writeLandscape(root.resolve("quality.json"), "named-file", "Before");
        List<Path> accepted = List.of(
                namedFile,
                writeLandscape(root.resolve("quality-neighbor/source.json"), "neighbor", "Neighbor"),
                writeLandscape(root.resolve("nested/quality-neighbor/source.json"), "nested-neighbor", "Neighbor"),
                writeLandscape(root.resolve("Quality/source.json"), "uppercase", "Uppercase"),
                writeLandscape(root.resolve("input/source.json"), "input-source", "Input"),
                writeLandscape(root.resolve("archive/source.json"), "archive-source", "Archive"));
        Path ignored = writeLandscape(root.resolve("quality/nested/source.json"), "nested-review", "Excluded");
        for (Path file : accepted) {
            Files.setLastModifiedTime(file, FileTime.fromMillis(10_000));
        }
        Files.setLastModifiedTime(ignored, FileTime.fromMillis(30_000));

        LandscapeService service = new LandscapeService(properties(root), objectMapper);
        assertThat(service.getAll()).extracting(SkillLandscape::getLandscapeId).containsExactlyInAnyOrder(
                "named-file", "neighbor", "nested-neighbor", "uppercase", "input-source", "archive-source");
        assertThat(service.getById("nested-review")).isNull();
        assertThat(service.getLandscapeIdForGoal("nested-review-goal")).isNull();
        assertThat(readLong(service, "lastLoadedFingerprint")).isEqualTo(10_000);
        assertThat(invokeLong(service, "getLatestTimestamp", root)).isEqualTo(10_000);

        writeLandscape(namedFile, "named-file", "After");
        Files.setLastModifiedTime(namedFile, FileTime.fromMillis(20_000));
        resetReloadCheck(service);
        assertThat(service.getById("named-file").getTitle()).isEqualTo("After");
        assertThat(readLong(service, "lastLoadedFingerprint")).isEqualTo(20_000);
    }

'''
assert test.count(anchor)==1;test=test.replace(anchor,extra+anchor)
candidate=BASE/'candidate'/TEST;candidate.parent.mkdir(parents=True);candidate.write_text(test)
shutil.copyfile(candidate,BASE/'isolated-src/test/java/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.java')
patch=''
for p in [MAIN,TEST]:
    patch+=''.join(difflib.unified_diff(Path(p).read_text().splitlines(keepends=True),(BASE/'candidate'/p).read_text().splitlines(keepends=True),fromfile='a/'+p,tofile='b/'+p))
with (BASE/'quality-directory-guard.patch').open('x') as f:f.write(patch)
# A separate original-code control compiles the exact same new tests.
shutil.copytree(BASE/'isolated-src',BASE/'original-control-src')
shutil.copyfile(BASE/'original'/MAIN,BASE/'original-control-src/main/java/com/skillpilot/backend/landscape/LandscapeService.java')
for row in originals:assert binding(row['path'])==row,row['path']
write('candidate-inputs.sha256.json',{'schemaVersion':1,'status':'isolated_candidate_not_applied','files':[binding(BASE/'candidate'/MAIN),binding(BASE/'candidate'/TEST),binding(BASE/'quality-directory-guard.patch')],
    'originalInputsUnchanged':True,'productionJavaSourceCount':len(full_source_bindings),'candidateChangesOnly':[MAIN,TEST]})
print(json.dumps({'status':'isolated candidate prepared; active inputs untouched','productionJavaSourceCount':len(full_source_bindings),'candidateFiles':2,'patch':binding(BASE/'quality-directory-guard.patch')}))
