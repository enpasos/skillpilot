# SPDX-License-Identifier: Apache-2.0
"""Fetch the named official PDF in memory and persist only its whole chemistry text."""
import datetime,hashlib,json,subprocess,urllib.request
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1]
URL='https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-07/abiturerlass_la_2027.pdf'
out=OWN/'inputs/PRIMARY.HE2027.whole-Chemie-physical121-127.actual.txt';assert not out.exists()
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
with urllib.request.urlopen(URL,timeout=45) as response:
 pdf=response.read();status=response.status;ctype=response.headers.get('Content-Type','');finalurl=response.url
assert pdf.startswith(b'%PDF-') and status==200
argv=['pdftotext','-f','121','-l','127','-layout','-','-']
p=subprocess.run(argv,input=pdf,capture_output=True,check=True)
text=p.stdout.decode();assert '25.1' in text and '25.4' in text and 'Komplex' in text and text.count('\f')==7
out.write_bytes(p.stdout)
def ref(path):
 b=path.read_bytes();return {'path':path.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
receipt={'schemaVersion':1,'role':'Actual fresh unshortened official primary text extraction, no authored conclusion','url':URL,'finalUrl':finalurl,'startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'httpStatus':status,'contentType':ctype,'downloadedPdfSHA256':'sha256:'+hashlib.sha256(pdf).hexdigest(),'downloadedPdfBytes':len(pdf),'wholePdfPages':188,'wholeSelectedPhysicalPdfPages':[121,122,123,124,125,126,127],'printedPageRange':[114,120],'wholeChemistrySection':'25.1 through25.4','argv':argv,'pdftotextExitCode':p.returncode,'text':ref(out),'storedPdfCopies':0,'nativePrepareRuns':0,'nativeRendererRuns':0,'scope':'Whole seven chemistry pages, not an assertion that the rest of the188-page decree was read','authorInterpretationsOrPriorFirstsIncluded':False}
(OWN/'checks/PRIMARY.HE2027.whole-chemistry-pages.actual-fetch-and-extract.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'http':status,'wholeChemistryPages':7,'textBytes':len(p.stdout),'storedPdfCopies':0,'nativePrepare':0}))
