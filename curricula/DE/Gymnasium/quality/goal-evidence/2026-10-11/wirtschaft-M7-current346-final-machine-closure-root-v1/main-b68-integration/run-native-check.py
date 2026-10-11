import datetime, hashlib, json, pathlib, subprocess, sys, time
root = pathlib.Path('/home/enpasos/projects/skillpilot')
out = pathlib.Path('/tmp/skillpilot-economics-M7-main-b68-integration-root-20261011')
name, cwd, *argv = sys.argv[1:]
if not name or any(c not in 'abcdefghijklmnopqrstuvwxyz0123456789-_' for c in name):
    raise ValueError('Invalid log name')
start = datetime.datetime.now(datetime.timezone.utc).isoformat()
t = time.monotonic()
stdout = out / (name + '.stdout.txt')
stderr = out / (name + '.stderr.txt')
with stdout.open('wb') as so, stderr.open('wb') as se:
    p = subprocess.run(argv, cwd=root / cwd, stdout=so, stderr=se)
receipt = dict(name=name, cwd=str(root/cwd), argv=argv, startedAt=start,
               completedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
               seconds=round(time.monotonic()-t,3), exitCode=p.returncode,
               stdoutSha256=hashlib.sha256(stdout.read_bytes()).hexdigest(),
               stderrSha256=hashlib.sha256(stderr.read_bytes()).hexdigest())
(out / (name + '.actual-execution.receipt.json')).write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
sys.exit(p.returncode)
