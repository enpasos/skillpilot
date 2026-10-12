// SPDX-License-Identifier: Apache-2.0
import {writeFile} from 'node:fs/promises';import {resolve} from 'node:path';
import {loadGoalBookBuildInputs} from '../../../../../../../../app/scripts/goalBookModel';
import {goalBookOriginalSourceMappingPaths} from '../../../../../../../../app/scripts/goalBookOriginalSources';
const cfg='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json',loaded=await loadGoalBookBuildInputs(cfg);const paths=goalBookOriginalSourceMappingPaths(loaded.model,resolve('.'),cfg);await writeFile('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2/sources/current.raw-mapping-path-inputs.json',JSON.stringify({configPath:cfg,actualSourceUnionPages:loaded.model.pages.length,mappingPaths:paths},null,2)+'\n');console.log(JSON.stringify({mappingPaths:paths.length,actualSourceUnionPages:loaded.model.pages.length}));
