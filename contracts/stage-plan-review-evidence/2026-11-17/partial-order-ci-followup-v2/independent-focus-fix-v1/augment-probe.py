from pathlib import Path
base=Path(__file__).resolve().parent
src=(base.parent/'focus-followup-independent-review'/'probe-v2.ts').read_text()
src=src.replace("import{buildGoalContainsClosure}","import{buildGoalContainsClosure,buildCanonicalFocusScope,buildRenderedScopeMarkerGoalIds}")
src=src.replace("/focus-followup-independent-review'","/independent-focus-fix-v1'")
src=src.replace('actual=buildGoalContainsClosure([J8],map)','actual=buildCanonicalFocusScope([J8],map,source)')
src=src.replace("out+'/probe-v2.actual.json'","out+'/runtime-probe.actual.json'")
insert='''
const allBefore=JSON.stringify(runtime),sourceBefore=JSON.stringify(source)
const children=new Map([...map].map(([id,g])=>[id,g.contains??[]])),rootGoal=runtime.find(e=>e.meta.landscapeId===math.landscapeId)!.goals.find(g=>g.tags?.includes('root'))!
const below=(id:string)=>{const seen=new Set<string>(),q=[id];while(q.length){const n=q.pop()!;if(seen.has(n))continue;seen.add(n);q.push(...children.get(n)??[])}return seen}
const visible=below(rootGoal.id),visibleAtoms=[...visible].filter(i=>map.get(i)?.type==='atomic').sort();assert.deepEqual(visibleAtoms,[...paths.keys()].sort(),'complete L remains visible')
let syntheticChecks=0;for(const [id,g]of map){if(!id.startsWith('composition:'))continue;assert.deepEqual(buildCanonicalFocusScope([id],map,source),buildGoalContainsClosure([id],map),'synthetic descendant trap');syntheticChecks++}
const synthetic=[...map.keys()].find(id=>id.startsWith('composition:')&&visible.has(id)&&[...below(id)].some(i=>map.get(i)?.type==='atomic'&&!actual.has(i)))!
assert(synthetic,'genuine independent synthetic branch needed');const direct=visibleAtoms.find(i=>!actual.has(i))!;assert(direct)
const scopeCases=[{name:'canonical-hidden-J8',roots:[J8],expected:new Set(canonicalScope)},{name:'synthetic',roots:[synthetic],expected:buildGoalContainsClosure([synthetic],map)},{name:'mixed-canonical-synthetic',roots:[J8,synthetic],expected:new Set([...canonicalScope,...buildGoalContainsClosure([synthetic],map)])},{name:'mixed-hidden-visible-leaf',roots:[J8,direct],expected:new Set([...canonicalScope,direct])},{name:'visible-leaf',roots:[direct],expected:new Set([direct])}]
const markerCases=[];for(const c of scopeCases){const f=buildCanonicalFocusScope(c.roots,map,source);assert.deepEqual(f,c.expected,c.name+' scope');const markers=buildRenderedScopeMarkerGoalIds(map,children,f,c.roots),represented=new Set<string>();for(const id of [...markers,...c.roots.filter(i=>visible.has(i))])for(const leaf of below(id))if(visibleAtoms.includes(leaf))represented.add(leaf);const expectedVisible=visibleAtoms.filter(i=>f.has(i));assert.deepEqual([...represented].sort(),expectedVisible,c.name+' exact marker coverage');if(c.name==='visible-leaf')assert.equal(markers.size,0,'direct visible selection gets no duplicate proxy');markerCases.push({name:c.name,roots:c.roots,visibleFocusAtoms:expectedVisible.length,markers:[...markers].sort(),exactCoverage:true})}
assert.equal(JSON.stringify(runtime),allBefore);assert.equal(JSON.stringify(source),sourceBefore)
'''
src=src.replace('variants.push({route:',insert+'variants.push({syntheticChecks,markerCases,noMutation:true,completeLVisible:true,route:')
src=src.replace("status:records.some(r=>r.variants.some(v=>v.lost.length||v.extra.length))?'NEEDS_REVISION':'PASS'","status:records.some(r=>r.variants.some(v=>v.lost.length||v.extra.length))?'NEEDS_REVISION':'PASS'")
(base/'runtime-probe.ts').write_text(src)
