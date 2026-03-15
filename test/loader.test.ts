import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { loadTaskSpecFile } from '../src/loader.js';

const tmpDir = join(import.meta.dirname, '.tmp-loader-test');

const specObj = {
  id: 'test-task',
  title: 'Test Task',
  trigger: { type: 'manual' },
  steps: [{ id: 'step-1', name: 'Do something' }],
};

const specYaml = `id: test-task
title: Test Task
trigger:
  type: manual
steps:
  - id: step-1
    name: Do something
`;

beforeEach(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('loadTaskSpecFile', () => {
  it('loads and parses a YAML file', () => {
    const file = join(tmpDir, 'spec.yaml');
    writeFileSync(file, specYaml);
    const result = loadTaskSpecFile(file);
    expect(result).toEqual(specObj);
  });

  it('loads and parses a JSON file', () => {
    const file = join(tmpDir, 'spec.json');
    writeFileSync(file, JSON.stringify(specObj));
    const result = loadTaskSpecFile(file);
    expect(result).toEqual(specObj);
  });

  it('throws on non-existent file', () => {
    expect(() => loadTaskSpecFile(join(tmpDir, 'nope.yaml'))).toThrow();
  });
});
