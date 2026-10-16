# SPDX-License-Identifier: Apache-2.0
"""Own transparent virtual teaching-cell model; no measured hardware or validated solar-cell fit."""
from pathlib import Path
import sys,json,datetime
L=Path(__file__).resolve().parent;label=sys.argv[1];volts=[float(x)for x in sys.argv[2:]];records=[]
for irradiance in [800,400]:
 temperature=25;isc=100*irradiance/1000;voc=.6;rows=[]
 for u in volts:
  i=max(0,isc*(1-(u/voc)**6));rows.append({'U_V':u,'I_mA':i,'P_mW':u*i})
 records.append({'irradiance_Wm2':irradiance,'temperature_C':temperature,'voltmeter':'parallel cell','ammeter':'series current-limited load','ownControllableLoadVoltages':volts,'readings':rows})
f=L/('PV-virtual-acquisition-'+label+'.actual.json');assert not f.exists();f.write_text(json.dumps({'readUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'virtualModel':'I=max(0,Isc*(1-(U/Voc)^6));Isc=100mA*E/1000;Voc=.6V;temperature held25C','notRealMeasurements':True,'notOriginalExerciseData':True,'acquisitions':records},indent=2)+'\n');print(json.dumps(records))
