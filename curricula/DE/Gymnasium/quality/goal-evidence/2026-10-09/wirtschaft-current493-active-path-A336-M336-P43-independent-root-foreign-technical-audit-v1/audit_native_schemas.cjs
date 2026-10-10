// Uses the same native Ajv2020 strict/allErrors/formats configuration as positiveGoalEvidenceReview.ts.
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const req = createRequire(path.resolve('app/package.json'));
const Ajv2020 = req('ajv/dist/2020.js').default;
const addFormats = req('ajv-formats').default;
const ajv = new Ajv2020({allErrors:true, strict:true});
addFormats(ajv);
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/current493-active-path-A336-M336-P43-technical-adapter-author-v1';
const rows = JSON.parse(fs.readFileSync(path.join(author,'actual45-active-path-only-configurations-individual-exact-field-and-raw-line-deltas.json'))).configurations;
const configSchemaPath = 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json';
const recordSchemaPath = 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json';
const configSchema = JSON.parse(fs.readFileSync(configSchemaPath));
if (configSchema.additionalProperties !== false || configSchema.properties.scope.additionalProperties !== false) throw new Error('Native config schema is not closed');
const validateConfig = ajv.compile(configSchema);
const validateRecord = ajv.compile(JSON.parse(fs.readFileSync(recordSchemaPath)));
const results = [];
const errors = [];
let count = 0;
for (const row of rows.filter(x=>x.lane==='P')) {
  const c = JSON.parse(fs.readFileSync(row.candidateConfigPath));
  const valid = validateConfig(c);
  const e = valid ? [] : JSON.parse(JSON.stringify(validateConfig.errors));
  const original = JSON.parse(fs.readFileSync(row.originalConfigPath));
  const originalValid = validateConfig(original);
  const oe = originalValid ? [] : JSON.parse(JSON.stringify(validateConfig.errors));
  const records = fs.readFileSync(c.reviewPath,'utf8').split(/\r?\n/u).filter(x=>x.trim()).map(x=>JSON.parse(x));
  const recordResults = records.map(r=>{
    count++;
    const validRecord = validateRecord(r);
    const recordErrors = validRecord ? [] : JSON.parse(JSON.stringify(validateRecord.errors));
    if (!validRecord) errors.push({path:c.reviewPath,goalId:r.goalId,errors:recordErrors});
    return {goalId:r.goalId,valid:validRecord,errors:recordErrors};
  });
  if (!valid || !originalValid) errors.push({path:row.candidateConfigPath,errors:e,originalErrors:oe});
  results.push({candidateConfigPath:row.candidateConfigPath,originalConfigPath:row.originalConfigPath,candidateNativeClosedSchemaValid:valid,originalNativeClosedSchemaValid:originalValid,errors:e,originalErrors:oe,recordResults});
}
const result={documentType:'independent-root-foreign-native-schema-actual-results',writtenAtUtc:new Date().toISOString(),nativeAjvOptions:{allErrors:true,strict:true,formats:true},configSchemaPath,recordSchemaPath,closedConfigAndScope:true,configCount:results.length,wholeRecordCount:count,passed:errors.length===0,errors,results,claimLimits:{activeIntegration:false,scientificApproval:false,humanRelease:false,productionPositiveValidatorRun:false}};
fs.writeFileSync(path.join(__dirname,'actual-native-closed-P-schemas.audit.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({PconfigCount:results.length,PwholeRecordCount:count,errors,passed:result.passed}));
process.exitCode=errors.length?1:0;
