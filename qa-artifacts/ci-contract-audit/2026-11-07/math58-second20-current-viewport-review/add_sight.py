import pathlib,json,datetime,sys
w=pathlib.Path(__file__).parent;p=w/'actual-sight-notes.json';rows=json.loads(p.read_text())if p.exists()else[]
data=json.loads(sys.argv[1]);now=datetime.datetime.now(datetime.timezone.utc).isoformat()
for row in data:
 assert row['order']not in {r['order']for r in rows};row['actualReviewedAtUTC']=now;row['actualViewImageWidthsCSS']=[360,680];row['humanApproved']=False;row['imageAuthorIsReviewer']=False;row['currentDEENContextReviewed']=True;row['scope']='Current isolated public GoalCard image CSS boxes in Chromium only; no FullApp/real-phone host acceptance';rows.append(row)
p.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
