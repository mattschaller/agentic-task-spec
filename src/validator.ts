import { TaskSpecSchema, type TaskSpec } from './schema.js';

export function validateTaskSpec(input: unknown): { success: boolean; errors?: string[] } {
  const result = TaskSpecSchema.safeParse(input);
  if (result.success) {
    return { success: true };
  }
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : '';
    return `${path}${issue.message}`;
  });
  return { success: false, errors };
}

export function parseTaskSpec(input: unknown): TaskSpec {
  return TaskSpecSchema.parse(input);
}
