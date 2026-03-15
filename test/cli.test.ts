import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const tmpDir = join(import.meta.dirname, '.tmp-cli-test');
const cli = join(import.meta.dirname, '..', 'dist', 'cli.js');

function run(args: string[], cwd?: string): { stdout: string; status: number } {
  try {
    const stdout = execFileSync('node', [cli, ...args], {
      encoding: 'utf-8',
      cwd: cwd ?? tmpDir,
    });
    return { stdout, status: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return { stdout: (e.stdout ?? '') + (e.stderr ?? ''), status: e.status ?? 1 };
  }
}

const validYaml = `id: test-task
title: Test Task
trigger:
  type: manual
steps:
  - id: step-1
    name: Do something
`;

const invalidYaml = `title: Missing ID
trigger:
  type: manual
steps: []
`;

beforeEach(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('CLI', () => {
  it('validate exits 0 on valid file', () => {
    const file = join(tmpDir, 'valid.yaml');
    writeFileSync(file, validYaml);
    const result = run(['validate', file]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('\u2713');
  });

  it('validate exits 1 on invalid file', () => {
    const file = join(tmpDir, 'invalid.yaml');
    writeFileSync(file, invalidYaml);
    const result = run(['validate', file]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('\u2717');
  });

  it('validate on directory validates all specs', () => {
    const sub = join(tmpDir, 'specs');
    mkdirSync(sub, { recursive: true });
    writeFileSync(join(sub, 'a.yaml'), validYaml);
    writeFileSync(join(sub, 'b.yml'), validYaml);
    const result = run(['validate', sub]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('\u2713');
  });

  it('init creates task.yaml', () => {
    const result = run(['init']);
    expect(result.status).toBe(0);
    expect(existsSync(join(tmpDir, 'task.yaml'))).toBe(true);
    const content = readFileSync(join(tmpDir, 'task.yaml'), 'utf-8');
    expect(content).toContain('id:');
    expect(content).toContain('steps:');
  });

  it('inspect prints summary', () => {
    const file = join(tmpDir, 'spec.yaml');
    writeFileSync(file, validYaml);
    const result = run(['inspect', file]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Test Task');
    expect(result.stdout).toContain('Steps: 1');
  });
});
