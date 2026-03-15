import { z } from 'zod';

export const TriggerSchema = z.object({
  type: z.enum(['manual', 'schedule', 'webhook', 'pr_event', 'push_event']),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const RetrySchema = z.object({
  max_attempts: z.number().int().positive(),
  delay_ms: z.number().int().nonnegative().optional(),
});

export const StepSchema = z.object({
  id: z.string(),
  name: z.string(),
  tool: z.string().optional(),
  input: z.record(z.string(), z.unknown()).optional(),
  output_schema: z.record(z.string(), z.unknown()).optional(),
  requires_approval: z.boolean().optional(),
  timeout_ms: z.number().int().positive().optional(),
  retry: RetrySchema.optional(),
});

export const ConstraintsSchema = z.object({
  allowed_tools: z.array(z.string()).optional(),
  denied_tools: z.array(z.string()).optional(),
  denied_paths: z.array(z.string()).optional(),
  max_tokens: z.number().int().positive().optional(),
  max_cost_usd: z.number().positive().optional(),
  max_wall_time_ms: z.number().int().positive().optional(),
});

export const ExitHandlerSchema = z.object({
  notify: z.string().optional(),
  escalate: z.boolean().optional(),
});

export const OnExitSchema = z.object({
  success: ExitHandlerSchema.optional(),
  failure: ExitHandlerSchema.optional(),
});

export const MetadataSchema = z.object({
  author: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
  schema_version: z.string().optional(),
});

export const TaskSpecSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  trigger: TriggerSchema,
  steps: z.array(StepSchema).min(1),
  constraints: ConstraintsSchema.optional(),
  on_exit: OnExitSchema.optional(),
  metadata: MetadataSchema.optional(),
});

export type TaskSpec = z.infer<typeof TaskSpecSchema>;
