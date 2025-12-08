// Native fetch used in Node 18+

const BASE_URL = 'https://skillpilot.com/api/ai';

async function run() {
    try {
        // 1. Create Learner
        console.log('Creating learner...');
        const resCreate = await fetch(`${BASE_URL}/learners`, { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
        const dataCreate = await resCreate.json();
        const learnerId = dataCreate.state.skillpilotId;
        console.log(`Learner ID: ${learnerId}`);

        // 2. Set Curriculum
        console.log('Setting curriculum...');
        await fetch(`${BASE_URL}/learners/${learnerId}/curriculum`, {
            method: 'POST',
            body: JSON.stringify({ curriculumId: 'DE_HES_S_GYM_2_OVERVIEW' }),
            headers: { 'Content-Type': 'application/json' }
        });

        // 3. Set Scope (The problematic call)
        console.log("Setting scope 'Ableitungen und ihre Bedeutung'...");
        const start = Date.now();
        const resScope = await fetch(`${BASE_URL}/learners/${learnerId}/scope`, {
            method: 'POST',
            body: JSON.stringify({ instruction: 'Ableitungen und ihre Bedeutung' }),
            headers: { 'Content-Type': 'application/json' }
        });
        const duration = Date.now() - start;

        console.log(`Status: ${resScope.status}`);
        console.log(`Duration: ${duration}ms`);

        if (resScope.status === 200) {
            const text = await resScope.text();
            console.log(`Response Size: ${(text.length / 1024).toFixed(2)} KB`);
            const json = JSON.parse(text);
            console.log(`Planned Goals Count: ${json.goals.planned.length}`);
            if (json.goals.planned.length > 0) {
                console.log('Verification: First goal title: ' + json.goals.planned[0].title);
            }
        } else {
            console.log('Error Body:', await resScope.text());
        }

    } catch (e) {
        console.error(e);
    }
}

run();
