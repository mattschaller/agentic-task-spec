import { describe, it, expect } from 'vitest';
import { TaskSpecSchema } from '../src/schema.js';

const minimalSpec = {
  id: 'test-task',
  title: 'Test Task',
  trigger: { type: 'manual' as const },
  steps: [{ id: 'step-1', name: 'Do something' }],
};

const fullSpec = {
  id: 'full-task',
  title: 'Full Task',
  description: 'A fully specified task',
  trigger: { type: 'webhook' as const, config: { url: 'https://example.com' } },
  steps: [
    {
      id: 'step-1',
      name: 'Analyze code',
      tool: 'code-review',
      input: { target: 'src/' },
      output_schema: { type: 'object' },
      requires_approval: true,
      timeout_ms: 30000,
      retry: { max_attempts: 3, delay_ms: 1000 },
    },
  ],
  constraints: {
    allowed_tools: ['code-review'],
    denied_tools: ['shell'],
    denied_paths: ['/etc'],
    max_tokens: 100000,
    max_cost_usd: 5.0,
    max_wall_time_ms: 120000,
  },
  on_exit: {
    success: { notify: 'team-channel' },
    failure: { notify: 'team-channel', escalate: true },
  },
  metadata: {
    author: 'test',
    version: '1.0.0',
    tags: ['test', 'ci'],
    schema_version: '0.1.0',
  },
};

describe('TaskSpecSchema', () => {
  it('accepts a valid minimal spec', () => {
    const result = TaskSpecSchema.safeParse(minimalSpec);
    expect(result.success).toBe(true);
  });

  it('accepts a valid full spec', () => {
    const result = TaskSpecSchema.safeParse(fullSpec);
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const { id: _, ...noId } = minimalSpec;
    const result = TaskSpecSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const { title: _, ...noTitle } = minimalSpec;
    const result = TaskSpecSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it('rejects empty steps', () => {
    const result = TaskSpecSchema.safeParse({ ...minimalSpec, steps: [] });
    expect(result.success).toBe(false);
  });

  it('rejects invalid trigger type', () => {
    const result = TaskSpecSchema.safeParse({
      ...minimalSpec,
      trigger: { type: 'invalid' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid constraint types', () => {
    const result = TaskSpecSchema.safeParse({
      ...minimalSpec,
      constraints: { max_tokens: -5 },
    });
    expect(result.success).toBe(false);
  });

  it('accepts requires_approval as boolean', () => {
    const result = TaskSpecSchema.safeParse({
      ...minimalSpec,
      steps: [{ id: 'step-1', name: 'Step', requires_approval: true }],
    });
    expect(result.success).toBe(true);
  });
});
