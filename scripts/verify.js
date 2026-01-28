const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function verify() {
    console.log(`Verifying against ${BASE_URL}...`);

    // 1. Health Check
    console.log('1. Testing Health Check...');
    const healthRes = await fetch(`${BASE_URL}/api/healthz`);
    if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.status}`);
    const healthJson = await healthRes.json();
    assert.ok(healthJson.ok, 'Healthz OK check');
    console.log('   OK');

    // 2. Create Paste
    console.log('2. Testing Create Paste...');
    const createRes = await fetch(`${BASE_URL}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Hello World', max_views: 2 })
    });
    if (!createRes.ok) throw new Error(`Create failed: ${createRes.status}`);
    const createJson = await createRes.json();
    assert.ok(createJson.id, 'ID returned');
    assert.ok(createJson.url, 'URL returned');
    const pasteId = createJson.id;
    console.log('   OK (ID: ' + pasteId + ')');

    // 3. Fetch Paste (API) - 1st View
    console.log('3. Testing Fetch API (1st View)...');
    const fetch1 = await fetch(`${BASE_URL}/api/pastes/${pasteId}`);
    assert.strictEqual(fetch1.status, 200);
    const json1 = await fetch1.json();
    assert.strictEqual(json1.content, 'Hello World');
    assert.strictEqual(json1.remaining_views, 1); // Started with 2, consumed 1
    console.log('   OK');

    // 4. View Paste (HTML) - 2nd View
    console.log('4. Testing View HTML (2nd View)...');
    const view2 = await fetch(`${BASE_URL}/p/${pasteId}`);
    assert.strictEqual(view2.status, 200, 'HTML view should be 200');
    const text2 = await view2.text();
    assert.ok(text2.includes('Hello World'), 'HTML should contain content');
    console.log('   OK');

    // 5. Fetch Paste (API) - 3rd View (Should be exhausted)
    console.log('5. Testing Exhausted Limit (3rd Access)...');
    const fetch3 = await fetch(`${BASE_URL}/api/pastes/${pasteId}`);
    assert.strictEqual(fetch3.status, 404, 'Should be 404 after limit reached');
    console.log('   OK');

    // 6. Test Expiry (Deterministic)
    console.log('6. Testing TTL (Deterministic)...');
    // Create paste with 10s TTL
    const ttlRes = await fetch(`${BASE_URL}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Timed Paste', ttl_seconds: 10 })
    });
    const ttlJson = await ttlRes.json();
    const ttlId = ttlJson.id;

    // Fetch immediately (no header, assumes NOW) -> 200
    const immed = await fetch(`${BASE_URL}/api/pastes/${ttlId}`);
    assert.strictEqual(immed.status, 200);

    // Fetch with header X-Test-Now-Ms = NOW + 20s -> 404
    const futureTime = Date.now() + 20000;
    const futureRes = await fetch(`${BASE_URL}/api/pastes/${ttlId}`, {
        headers: { 'x-test-now-ms': futureTime.toString() }
    });
    assert.strictEqual(futureRes.status, 404, 'Should be expired in future');
    console.log('   OK');

    console.log('ALL TESTS PASSED');
}

verify().catch(err => {
    console.error(err);
    process.exit(1);
});
