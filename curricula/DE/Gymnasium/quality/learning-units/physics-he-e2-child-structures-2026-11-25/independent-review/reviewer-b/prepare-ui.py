from pathlib import Path
import os
from subprocess import check_output
d=Path(__file__).resolve().parent
repo=Path(check_output(['git','rev-parse','--show-toplevel']).decode().strip())
src=repo/'app/scripts/testHessePhysicsFlashcardActions.ts'
s=src.read_text().splitlines()
bundle=['import { execFileSync } from "node:child_process"', 'import { resolve } from "node:path"']
for line in s[1:25]:
 bundle.append(line.replace("'../src", "'"+os.path.relpath(repo/'app/src',d)).replace("'./lib","'"+os.path.relpath(repo/'app/scripts/lib',d)))
bundle += ['const repo = execFileSync("git",["rev-parse","--show-toplevel"],{encoding:"utf8"}).trim()', 'const materials = readUnitMapMaterials(resolve(repo,"curricula"))', 'const memoryId = materials.find(item=>item.unit.compositionNodeId==="physics-e1-motion")!.unit.flashcardGoalId!', 'const read=async <T,>(path:string):Promise<T> => JSON.parse(await readFile(resolve(repo,"curricula/DE/Gymnasium",path),"utf8"))']
bundle += s[74:77]+s[81:102]
bundle += ['''
const traffic="4a2bf015-052b-4af0-aed7-324259fa1a8a";
const deck=await read<any>("memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json");
const result:any={};
for(const rev of ["948f2a419d","a88f17523b"]) {
 const rv:any={};
 result[rev]=rv;
 for (const scope of ["","-g8","-g9","-sekii"]) for (const course of ["gk","lk"]) {
  const filename = scope === "-sekii" ? "de-he-sekii-"+course : "de-he-"+course+scope;
  const selected=JSON.parse(execFileSync("git", ["show",rev+":curricula/DE/Gymnasium/composition-views/physik/"+filename+".view.json"],{cwd:repo,encoding:"utf8",maxBuffer:4e6}));
  const value=input([selected]);
  const original=physicsFixture(value);
  const tree=buildSortedChildrenMap(value.visibleChildrenByParent, value.goalIndexAll, "learner", original, materials);
  const acts=buildUnitFlashcardActions(memoryId, original, value.goalIndexAll,value.visibleGoalIds,deck.cards,"de");
  const e2=mapEntryPath(original,traffic)!.find(id=>value.goalIndexAll.get(id)?.extendedData?.compositionNodeId==="physics-e2-newton-and-conservation")!;
  const title=(id:string)=>original.entries[id]?.title ?? value.goalIndexAll.get(id)?.title ?? id;
  const actions=(id:string)=>{const act=acts.get(id);return act?selectPracticeCards(deck.cards,getSrsFilterTagsForGoal(value.goalIndexAll.get(memoryId)!),act.goalIds).map(c=>c.id):[]};
  const children=original.entries[e2].children ?? [];
  rv[filename]={board:children.map(title),tree:(tree.get(e2)??[]).map(title),cards:actions(e2),children:children.filter(id=>original.entries[id].kind==="unit").map(id=>({section:title(id),board:(original.entries[id].children??[]).map(title),tree:(tree.get(id)??[]).map(title),cards:actions(id)}))};
 }
}
console.log(JSON.stringify(result,null,2));
''']
(d/'ui.mts').write_text('\n'.join(bundle))
