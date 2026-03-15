import { z } from 'zod';
import { TaskSpecSchema } from './schema.js';
import type { TaskSpec } from './schema.js';

export {
  TaskSpecSchema,
  TriggerSchema,
  RetrySchema,
  StepSchema,
  ConstraintsSchema,
  ExitHandlerSchema,
  OnExitSchema,
  MetadataSchema,
} from './schema.js';
export type { TaskSpec } from './schema.js';
export { validateTaskSpec, parseTaskSpec } from './validator.js';
export { loadTaskSpecFile } from './loader.js';

export function defineTask(spec: TaskSpec): TaskSpec {
  return spec;
}

export const taskSpecJsonSchema = z.toJSONSchema(TaskSpecSchema);
