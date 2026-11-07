import { readFileSync, writeFileSync } from 'node:fs'
import { createVisualizationContextVerifier, type VisualizationCurrentContext } from './goalVisualizationReviewedContext'
const W=process.env.MATH58_WORKSPACE!
const inputs=JSON.parse(readFileSync(W+'/native-inputs.json','utf8')) as Array<{goalId:string;receipt:{path:string;sha256:string};current:VisualizationCurrentContext}>
const input=inputs[1]
const result=createVisualizationContextVerifier({repositoryRoot:process.cwd(),acceptedRepositoryCommit:'25a6f2164a81a7e6ae50db3557d20521fecf5124'})(input.receipt,input.current)
writeFileSync(W+'/fault-'+process.env.MATH58_FAULT_NAME+'.json',JSON.stringify({name:process.env.MATH58_FAULT_NAME,result:result.ok?{ok:true}:result},null,2)+'\n')
if(result.ok)process.exitCode=1
