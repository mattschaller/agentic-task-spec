import { describe, it, expect } from 'vitest';
import { validateTaskSpec, parseTaskSpec } from '../src/validator.js';

const validSpec = {
  id: 'test-task',
  title: 'Test Task',
  trigger: { type: 'manual' },
  steps: [{ id: 'step-1', name: 'Do something' }],
};

const invalidSpec = {
  trigger: { type: 'manual' },
  steps: [],
};

describe('validateTaskSpec', () => {
  it('returns success for valid input', () => {
    const result = validateTaskSpec(validSpec);
    expect(result).toEqual({ success: true });
  });

  it('returns errors for invalid input', () => {
    const result = validateTaskSpec(invalidSpec);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});

describe('parseTaskSpec', () => {
  it('returns typed object for valid input', () => {
    const result = parseTaskSpec(validSpec);
    expect(result.id).toBe('test-task');
    expect(result.title).toBe('Test Task');
    expect(result.steps).toHaveLength(1);
  });

  it('throws for invalid input', () => {
    expect(() => parseTaskSpec(invalidSpec)).toThrow();
  });
});
