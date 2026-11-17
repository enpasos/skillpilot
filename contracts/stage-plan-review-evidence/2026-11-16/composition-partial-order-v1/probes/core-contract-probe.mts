import assert from 'node:assert/strict'
import { readCompositionChildOrder, projectCompositionChildOrder } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
const names = ['alpha','beta','gamma','delta','epsilon']
const candidates: [number,number][] = []
for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++)candidates.push([i,j])
const reachability = (edges: [number,number][]) => {
 const r=Array.from({length:names.length},()=>Array(names.length).fill(false))
 for(const [from,to] of edges)r[from][to]=true
 for(let k=0;k<names.length;k++)for(let i=0;i<names.length;i++)for(let j=0;j<names.length;j++)r[i][j] ||= r[i][k]&&r[k][j]
 return r
}
let graphs=0, filteredCases=0
for(let mask=0;mask<(1<<candidates.length);mask++){
 const expected=reachability(candidates.filter((_,bit)=>mask&(1<<bit)))
 const edges=candidates.filter(([from,to])=>expected[from][to]&&!names.some((_,middle)=>expected[from][middle]&&expected[middle][to]))
 const order={after:edges.map(([from,to])=>({unit:names[to],after:names[from]}))}
 assert.deepEqual(readCompositionChildOrder(order,names),order)
 for(let visibleMask=0;visibleMask<(1<<names.length);visibleMask++){
  const visible=names.filter((_,i)=>visibleMask&(1<<i))
  const projected=projectCompositionChildOrder(order,visible)
  assert.deepEqual(readCompositionChildOrder(projected,visible),projected)
  const actual=reachability(projected.after.map(pair=>[names.indexOf(pair.after),names.indexOf(pair.unit)] as [number,number]))
  for(const a of visible)for(const b of visible)assert.equal(actual[names.indexOf(a)][names.indexOf(b)],expected[names.indexOf(a)][names.indexOf(b)],`mask=${mask}, visible=${visibleMask}, ${a}->${b}`)
  filteredCases++
 }
 graphs++
}
console.log(JSON.stringify({status:'PASS',graphs,filteredCases,checks:'Exhaustive five-child DAG reachability, source reduction guard, every visible subset, preserved reachability and no new adjacency'},null,2))
