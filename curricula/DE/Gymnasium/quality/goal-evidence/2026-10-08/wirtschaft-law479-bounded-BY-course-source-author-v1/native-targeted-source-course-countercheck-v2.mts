import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { evaluateCourseLevelMappingConsistency } from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../../..');
const own = path.relative(root, path.dirname(fileURLToPath(import.meta.url)));
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const hash = (p: string) => 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex');
const output = path.join(root, own, 'actual-native-source-course-countercheck.before-candidate.json');
if (fs.existsSync(output)) throw new Error('Refuse to overwrite actual receipt');
const canPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';
const oldMap = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_wirtschaft_und_recht_source_extraction_to_canonical_wirtschaft.review.json';
const newMap = own + '/mapping/bavaria_wirtschaft_und_recht_source_extraction_to_canonical_wirtschaft.review.candidate.json';
const landscape = read(canPath);
const files: any[] = [];
const visit = (folder: string) => {
  for (const entry of fs.readdirSync(path.join(root, folder), {withFileTypes: true})) {
    const p = path.posix.join(folder, entry.name);
    if (entry.isDirectory()) visit(p);
    else if (entry.name.endsWith('.json')) {
      const object = read(p);
      if (object.targetLandscapeId === landscape.landscapeId && Array.isArray(object.mappings)) files.push({...object, file: p});
    }
  }
};
visit('curricula/DE/Gymnasium/mapping');
if (files.filter(file => file.file === oldMap).length !== 1) throw new Error('Missing unique current mapping');
const sourcePaths = new Set(files.map(file => file.sourceExtractionPath).filter(Boolean));
const beforeHashes = [...sourcePaths].map(p => [p, hash(p)]);
const mappingsBefore = files.map(file => [file.file, hash(file.file)]);
const canBefore = hash(canPath);
const before = evaluateCourseLevelMappingConsistency(landscape, files);
const candidateMap = {...read(newMap), file: oldMap};
const candidateFiles = files.map(file => file.file === oldMap ? candidateMap : file);
const candidateSources = new Map([[candidateMap.sourceExtractionPath, read(candidateMap.sourceExtractionPath)]]);
const candidate = evaluateCourseLevelMappingConsistency(landscape, candidateFiles, candidateSources);
if (before.status !== 'pass' || candidate.status !== 'pass') throw new Error(JSON.stringify({before, candidate}));
if (hash(canPath) !== canBefore || beforeHashes.some(([p, h]) => hash(p) !== h) || mappingsBefore.some(([p, h]) => hash(p) !== h)) throw new Error('Active source/canonical/mapping mutated');
const receipt = {
  schemaVersion: 1, role: 'actual_native_bounded_source_course_countercheck_not_independent_fachreview', checkedAt: new Date().toISOString(),
  evaluatorSource: 'app/scripts/generateCurriculumQualityStatus.ts', evaluatorSourceSha256: hash('app/scripts/generateCurriculumQualityStatus.ts'),
  actualBeforeRule: before, actualCandidateRule: candidate,
  actualEconomicsMappingFiles: files.map(file => file.file),
  actualUnchangedActiveCanonicalSha256: canBefore,
  allActiveMappingAndSourceFilesUnchanged: true,
  actualSourceHashesGuarded: beforeHashes, actualMappingHashesGuarded: mappingsBefore,
  regionalScopeFaultResolved: false,
  regionalScopeLimit: 'CQR004 checks whether source course levels are a subset of canonical tags. LK source to GK/LK canonical is therefore compatible. This genuine source metadata correction leaves the BY-GK authored target fault open; no whole regional scope approval is claimed.',
  activeWrites: 0, humanApprovalClaimed: false, newStrictCompletions: 0,
};
fs.writeFileSync(output, JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({output, before, candidate}, null, 2));
