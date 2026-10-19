// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=process.cwd().endsWith('/app')?path.resolve(process.cwd(),'..'):process.cwd();
const {sourceAtlasDescendants}=await import(path.join(root,'app/scripts/goalBookSourceAtlasInputs.ts'));
const raw=JSON.parse(fs.readFileSync(path.join(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'),'utf8'));
const bindings=JSON.parse(fs.readFileSync(path.join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-recycling-three-atomic-partials-author-20261018-v4/AUTHOR.whole-source-cluster-atomic-P-bindings.pending.json'),'utf8')).bindings;
const goals=new Map(raw.goals.map((g:any)=>[g.id,g]));
const atoms=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId));
const rows=bindings.map((b:any)=>({inventoryIndex:b.inventoryIndex,sourceGoalId:b.sourceGoalId,formerClusterId:b.formerClusterId,formerWitnesses:sourceAtlasDescendants(b.formerClusterId,goals,atoms,raw.landscapeId),atomicTargetId:b.atomicTargetId,proposedWitnesses:sourceAtlasDescendants(b.atomicTargetId,goals,atoms,raw.landscapeId),atomicHasInheritanceBoundary:goals.get(b.atomicTargetId)?.extendedData?.applicabilityMappingInheritance==='boundary'}));
const passed=atoms.size===450&&rows.length===3&&rows.every((r:any)=>r.proposedWitnesses.length===1&&r.proposedWitnesses[0]===r.atomicTargetId)&&rows[0].formerWitnesses.length===0&&rows[0].atomicHasInheritanceBoundary&&rows.slice(1).every((r:any)=>r.formerWitnesses.length===29);
const report={role:'INDEPENDENT_C_ACTUAL_UNCHANGED_SOURCE_ATLAS_DESCENDANTS',passed,curricularAtomicSetFromActualLedger:atoms.size,rows,fullAtlasBuildOrGlobalCheckRun:false,normalOrFrameworkFilesWritten:false,scope:'IDs are bounded direct witnesses only. The function does not prove whole semantic coverage of an atomic goal or source.'};
fs.writeFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../checks/actual-source-atlas-descendants.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!passed)process.exitCode=1;
