import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {spawn, type ChildProcess} from 'node:child_process';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

// Runs the compiled server, so `npm test` builds it first.
const entry = resolve(__dirname, '../../../dist/server/server/server.js');
const port = 51499;
const base = `http://localhost:${port}`;
let server: ChildProcess;

beforeAll(async () => {
  const clientDir = mkdtempSync(join(tmpdir(), 'ek-client-'));
  writeFileSync(join(clientDir, 'index.html'), '<!doctype html><title>boom</title>');

  server = spawn(process.execPath, [entry], {
    env: {...process.env, SERVER_PORT: String(port), CLIENT_DIR: clientDir, NODE_ENV: 'production'},
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  await new Promise<void>((done, fail) => {
    server.stdout!.on('data', (chunk: Buffer) => chunk.toString().includes('running on port') && done());
    server.on('exit', code => fail(new Error(`server exited with ${code}`)));
  });
});

afterAll(() => {
  server?.kill();
});

describe('server', () => {
  it('serves the lobby API', async () => {
    const res = await fetch(`${base}/games/Exploding-Kittens`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({matches: []});
  });

  it('serves the client', async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<title>boom</title>');
  });

  it('creates a match', async () => {
    const res = await fetch(`${base}/games/Exploding-Kittens/create`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({numPlayers: 2}),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).matchID).toBeTruthy();
  });
});
