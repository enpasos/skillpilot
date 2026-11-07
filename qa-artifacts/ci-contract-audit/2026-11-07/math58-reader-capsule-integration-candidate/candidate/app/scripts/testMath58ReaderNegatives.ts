import { readFileSync, writeFileSync } from 'node:fs'
import { createVisualizationContextVerifier, type VisualizationCurrentContext } from './goalVisualizationReviewedContext'
const W = process.env.MATH58_WORKSPACE!
const inputs = JSON.parse(readFileSync(W+'/native-negative-inputs.json','utf8')) as Array<{name:string;reference:{path:string;sha256:string};current:VisualizationCurrentContext}>
const verify=createVisualizationContextVerifier({repositoryRoot:process.cwd(),acceptedRepositoryCommit:'25a6f2164a81a7e6ae50db3557d20521fecf5124'})
const rows=inputs.map(input=>{const result=verify(input.reference,input.current);return {name:input.name,result:result.ok?{ok:true}:result}})
writeFileSync(W+'/reader-negative-results.json',JSON.stringify({rows,allRejected:rows.every(row=>!row.result.ok)},null,2)+'\n')
console.log(JSON.stringify({cases:rows.length,allRejected:rows.every(row=>!row.result.ok)}))
if(rows.some(row=>row.result.ok))process.exitCode=1
