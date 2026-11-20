#!/usr/bin/env python3
"""Start the local Hessen G8/G9 E.1 preview with disposable synthetic learners."""

import argparse
from contextlib import ExitStack
import json
import os
from pathlib import Path
import secrets
import shutil
import socket
import subprocess
import tempfile
import time
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import uuid

ROOT = Path(__file__).resolve().parents[1]
OVERVIEW = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
PHYSICS = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'


def request(base, path, method='GET', data=None):
    body = None if data is None else json.dumps(data).encode()
    with urlopen(Request(base + path, data=body, method=method,
                         headers={'Content-Type': 'application/json'}), timeout=120) as response:
        content = response.read()
    return json.loads(content) if content else None


def create_learner(api, duration):
    created = request(api, '/api/ui/learners', 'POST', {})
    learner_id = str(uuid.UUID(created['state']['skillpilotId']))
    learner = '/api/ui/learners/' + learner_id
    request(api, learner + '/curriculum', 'PUT', {'curriculumId': OVERVIEW})
    request(api, learner + '/personal-curriculum', 'PUT', {
        OVERVIEW: {'selected': True, 'filterId': 'DE-HE', 'durationModel': duration, 'stage': 'SekII'},
        PHYSICS: {'selected': True, 'filterId': 'GK'},
    })
    plan = request(api, learner + '/personalization-plan')
    for _ in range(15):
        if plan['stage'] == 'COMPLETE':
            break
        options = plan['options']
        choice = next((o for o in options if o['kind'] == 'COMPLETE_GROUP'), None)
        choice = choice or next((o for o in options if o.get('filterId') == 'GK'), None)
        if not choice:
            raise RuntimeError(f'Unexpected personalization stage {plan["stage"]}')
        plan = request(api, learner + '/personalization-options', 'POST', {'optionId': choice['optionId']})
    if plan['stage'] != 'COMPLETE':
        raise RuntimeError('Personalization is incomplete')
    query = urlencode({'landscapeId': PHYSICS, 'schoolForm': 'Gymnasium', 'jurisdiction': 'DE-HE',
                       'stage': 'SekII', 'courseProfile': 'GK', 'durationModel': duration})
    view = request(api, '/api/ui/composition-views/match?' + query)
    if not view or view['scope']['stage'] != 'SekII':
        raise RuntimeError(f'{duration}: upper-secondary Physics view is missing')
    focus = f'composition:{view["viewId"]}:structure:physics-e1-motion'
    request(api, learner + '/planned', 'PUT', {'goals': [focus]})
    current = request(api, learner + '/state')['levelCompletion']
    profile = 'automatic:' + focus
    if current.get('profileId') != profile:
        if not any(o['profileId'] == profile for o in current['profileOptions']):
            raise RuntimeError(f'{duration}: E.1 was not offered')
        current = request(api, learner + '/level-completion/actions', 'POST', {
            'action': 'selectProfile', 'profileId': profile, 'expectedRevision': current['learnerRevision'],
        })['levelCompletion']
    if current.get('profileId') != profile or current.get('requiredAssessmentCount') != 5:
        raise RuntimeError(f'{duration}: unexpected E.1 section')
    assessment = current.get('unitAssessment') or {}
    if len(assessment.get('parts', [])) != 4 or assessment.get('passed') is not False:
        raise RuntimeError(f'{duration}: expected four E.1 assessment parts in the upper-secondary view')
    if any(request(api, learner + '/mastery')['mastery'].values()):
        raise RuntimeError('The synthetic learner already has mastery')
    return learner_id, focus


def wait_ready(url, process):
    for _ in range(480):
        if process.poll() is not None:
            raise RuntimeError(f'{process.args[0]} exited with {process.returncode}')
        try:
            with urlopen(url, timeout=3) as response:
                if response.status == 200:
                    return
        except (OSError, URLError):
            time.sleep(1)
    raise RuntimeError('Service did not become ready at ' + url)


def stop(process):
    if process.poll() is None:
        process.terminate()
        try:
            process.wait(25)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()


def serve(args, work, stack):
    backend, app = ROOT / 'backend', ROOT / 'app'
    java_home = os.environ.get('JAVA_HOME')
    java = str(Path(java_home) / 'bin/java') if java_home else shutil.which('java')
    node = shutil.which('node')
    if not java or not node or not (app / 'node_modules/vite/bin/vite.js').is_file():
        raise RuntimeError('Install the repository JDK and Node version and run npm ci --prefix app.')
    if args.api_port == args.ui_port:
        raise ValueError('API and UI need distinct ports.')
    for port in (args.api_port, args.ui_port):
        with socket.socket() as probe:
            probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            probe.bind(('127.0.0.1', port))
            probe.listen()
    api, ui = f'http://127.0.0.1:{args.api_port}', f'http://127.0.0.1:{args.ui_port}'
    jars = work / 'runtime-jars'
    build = work / 'backend-build'
    subprocess.run([str(backend / 'gradlew'), '--no-daemon', '--console=plain', '-I',
                    str(ROOT / 'scripts/package_consumer_runtime.init.gradle'),
                    'writePackageConsumerRuntimeClasspath', '-PpackageConsumerClasspathOutput=' + str(jars)],
                   cwd=backend, env={**os.environ, 'SKILLPILOT_BACKEND_BUILD_DIR': str(build)}, check=True)
    classpath = [str(build / 'classes/java/main'), str(backend / 'src/main/resources'), *jars.read_text().splitlines()]
    settings = {
        'server.address': '127.0.0.1', 'server.port': args.api_port,
        'skillpilot.curriculum.source': 'repository', 'skillpilot.landscapes.directory': str(ROOT / 'curricula'),
        'skillpilot.public-base-url': ui, 'cors.allowed-origins': ui,
        'spring.datasource.url': 'jdbc:h2:mem:hesse-e1;DB_CLOSE_DELAY=-1;NON_KEYWORDS=VALUE',
        'spring.datasource.driver-class-name': 'org.h2.Driver', 'spring.datasource.username': 'sa',
        'spring.datasource.password': secrets.token_urlsafe(48),
        'spring.jpa.database-platform': 'org.hibernate.dialect.H2Dialect',
        'spring.jpa.hibernate.ddl-auto': 'update', 'spring.jpa.show-sql': False,
        'spring.liquibase.enabled': True, 'spring.liquibase.change-log': 'classpath:db/changelog/db.changelog-master.yaml',
        'spring.security.oauth2.client.registration.github.client-id': 'local-preview',
        'spring.security.oauth2.client.registration.github.client-secret': 'local-preview',
        'skillpilot.security.signing-secret': secrets.token_urlsafe(48),
        'skillpilot.claude.connector.v1.signing-secret': secrets.token_urlsafe(48),
        'skillpilot.claude.connector.v1.capability-secret': secrets.token_urlsafe(48),
        'skillpilot.claude.connector.v1.enabled': True, 'skillpilot.claude.enabled': False,
        'skillpilot.openai.coach-v1.enabled': False, 'skillpilot.teacher-supervision.enabled': False,
    }
    runtime_env = {'PATH': os.environ['PATH'], 'LANG': 'C.UTF-8', 'SPRING_APPLICATION_JSON': json.dumps(settings)}
    log = stack.enter_context((work / 'backend.log').open('w'))
    spring = subprocess.Popen([java, '-Xmx2304m', '-XX:TieredStopAtLevel=1', '-cp', os.pathsep.join(classpath),
                               'com.skillpilot.backend.SkillpilotApplication'],
                              cwd=work, env=runtime_env, stdout=log, stderr=subprocess.STDOUT)
    stack.callback(stop, spring)
    wait_ready(api + '/actuator/health', spring)
    profiles = {}
    for duration in ('G8', 'G9'):
        viewer, section = create_learner(api, duration)
        profiles[duration] = {'viewer': viewer, 'E1': section,
                              **{part: create_learner(api, duration)[0] for part in ('A', 'B')}}
    (work / 'profiles.json').write_text(json.dumps(profiles))
    ui_env = {**os.environ, 'SKILLPILOT_E1_PREVIEW_DIR': str(work), 'VITE_API_BASE': api}
    vite = subprocess.Popen([node, str(app / 'node_modules/vite/bin/vite.js'), '--config',
                             str(app / 'scripts/hesseE1Preview.config.ts'), '--host', '127.0.0.1',
                             '--port', str(args.ui_port), '--strictPort'], cwd=app, env=ui_env)
    stack.callback(stop, vite)
    wait_ready(ui + '/nativ/G8/A', vite)
    for d in ('G8', 'G9'):
        print(f'{d}: {ui}/nativ/{d}/E1   {ui}/nativ/{d}/A   {ui}/nativ/{d}/B', flush=True)
    if args.check:
        subprocess.run([node, str(app / 'scripts/checkHesseE1Preview.mjs'), ui, api, str(work / 'profiles.json')],
                       cwd=app, check=True)
    else:
        print('Ctrl+C beendet die Vorschau und löscht die sechs synthetischen Profile.', flush=True)
        while spring.poll() is None and vite.poll() is None:
            time.sleep(1)
        raise RuntimeError('A preview service exited; start a fresh preview to continue.')


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--ui-port', type=int, default=5177)
    cli.add_argument('--api-port', type=int, default=8084)
    cli.add_argument('--check', action='store_true', help='run the Chromium acceptance check, then stop')
    args = cli.parse_args()
    with tempfile.TemporaryDirectory(prefix='skillpilot-e1-') as tmp, ExitStack() as stack:
        try:
            serve(args, Path(tmp), stack)
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
