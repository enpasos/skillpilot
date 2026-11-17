import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {preserveFinalDiodePlacementsFromCurrent} from '/home/enpasos/projects/skillpilot/app/scripts/lib/physicsFinalDiodeViewPlacements';
const dir='curricula/DE/Gymnasium/composition-views/physik';const rows=[];
for(const f of readdirSync(dir).filter(f=>f.endsWith('.json'))){const v=JSON.parse(readFileSync(dir+'/'+f,'utf8'));try{preserveFinalDiodePlacementsFromCurrent(structuredClone(v),v);rows.push({file:f,status:'PASS'});}catch(e){rows.push({file:f,status:'FAIL',error:String(e)});}}
writeFileSync('tmp/pipeline/laender-stufen/gesamt/review/physics-assessment-projection/diode-preservation-probe.actual.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows.filter(x=>x.status==='FAIL')));
