// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel.ts';
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts';
const own = dirname(fileURLToPath(import.meta.url));
const configPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-five-corrected-image-current-candidate-v3/batch.config.json';
const configured = JSON.parse(await readFile(join(own, '../chemie-b010-five-corrected-image-current-candidate-v3/batch.config.json'), 'utf8'));
const previous = JSON.parse(await readFile(join(own, 'native-finalbook/bundle/book-model.json'), 'utf8'));
const base = await loadGoalBookBuildInputs(configured.baseGoalBookConfigPath);
const current = buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:configured.goalIds,bookId:configured.bookId,title:configured.title});
if (JSON.stringify(previous.pages)!==JSON.stringify(current.pages)) throw new Error('Actual native current page payload drift; cannot inherit existing independent science approvals');
const sourceChanges = Object.keys(previous.source).filter(k => JSON.stringify(previous.source[k])!==JSON.stringify(current.source[k]));
if (JSON.stringify(sourceChanges)!==JSON.stringify(['goalVisualizationQaDigest'])) throw new Error('Unexpected source metadata drift: '+JSON.stringify(sourceChanges));
await writeFile(join(own,'native-current-nine-page-binding-check.book-model.json'),JSON.stringify(current,null,2)+'\n');
const receipt={configPath,oldModelDigest:previous.digest,currentModelDigest:current.digest,currentRawQADigest:current.source.goalVisualizationQaDigest,sourceChanges,allNineCompleteNativePagePayloadsExact:true,allNineGoalPageContextAndImageFingerprintsExact:true,nineGoalIds:current.pages.map(p=>p.goalId),actualScienceReReviews:0,actualNewScienceApprovals:0,humanApproval:false,humanTrial:false,activeWrites:0};
await writeFile(join(own,'native-current-nine-page-binding-check.actual.receipt.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
