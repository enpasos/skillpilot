import fs from 'node:fs';
const evidence = process.argv[2];
let writable = false, accessError;
try { fs.accessSync(evidence, fs.constants.W_OK); writable = true; }
catch(error) { accessError = error.code; }
const fdTargets = fs.readdirSync('/proc/self/fd').map(fd => {
  try { return {fd, target:fs.readlinkSync('/proc/self/fd/'+fd)}; }
  catch(error) { return {fd, closedDuringObservation:error.code}; }
});
console.log(JSON.stringify({
  evidenceEntries:fs.readdirSync(evidence),
  recorderFileExists:fs.existsSync(evidence+'/recorder.strace'),
  evidenceWritable:writable, accessError,
  namespacePids:fs.readdirSync('/proc').filter(name=>/^\d+$/.test(name)),
  pid:process.pid, ppid:process.ppid, fdTargets
}));
