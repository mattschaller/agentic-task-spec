# agentic-task-spec

Framework-agnostic TypeScript schema for declaring agentic task definitions — tools, budgets, approval gates, and constraints.

## Problem

Teams building AI agent workflows hand-roll YAML/JSON task definitions with no validation or type safety. There's no standard schema for expressing what an agent can do, what it costs, and who needs to approve it.

## Solution

`agentic-task-spec` provides:
- **Zod v4 schemas** for task spec validation
- **TypeScript types** inferred from schemas
- **CLI** to validate, inspect, and scaffold task specs
- **JSON Schema** export for editor autocomplete and CI integration
- **Zero runtime overhead** — just schema + types

## Install

```bash
npm install agentic-task-spec
```

## Example Task Spec

```yaml
id: code-review
title: Automated Code Review
description: Run code review on pull requests
trigger:
  type: pr_event
  config:
    action: opened
steps:
  - id: analyze
    name: Analyze changes
    tool: code-review
    input:
      target: changed-files
    requires_approval: false
    timeout_ms: 60000
  - id: report
    name: Post review comment
    tool: github-comment
    input:
      body: "{{analyze.output}}"
    requires_approval: true
constraints:
  allowed_tools:
    - code-review
    - github-comment
  max_tokens: 200000
  max_cost_usd: 2.00
on_exit:
  failure:
    notify: "#engineering"
    escalate: true
metadata:
  author: platform-team
  version: "1.0.0"
  tags: [code-review, ci]
  schema_version: "0.1.0"
```

## CLI

```bash
# Validate a task spec file
agentic-task-spec validate task.yaml

# Validate all specs in a directory
agentic-task-spec validate specs/

# Create a starter task.yaml
agentic-task-spec init

# Inspect a task spec
agentic-task-spec inspect task.yaml
```

## API

```typescript
import {
  TaskSpecSchema,
  type TaskSpec,
  defineTask,
  validateTaskSpec,
  parseTaskSpec,
  loadTaskSpecFile,
  taskSpecJsonSchema,
} from 'agentic-task-spec';

// Type-safe task definition
const task = defineTask({
  id: 'my-task',
  title: 'My Task',
  trigger: { type: 'manual' },
  steps: [{ id: 'step-1', name: 'Run analysis' }],
});

// Validate unknown input
const result = validateTaskSpec(data);
if (!result.success) {
  console.error(result.errors);
}

// Parse or throw
const spec = parseTaskSpec(data);

// Load from file (YAML or JSON)
const loaded = loadTaskSpecFile('task.yaml');

// JSON Schema for editor integration
console.log(JSON.stringify(taskSpecJsonSchema, null, 2));
```

## Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique task identifier |
| `title` | string | yes | Human-readable task name |
| `description` | string | no | Task description |
| `trigger` | object | yes | How the task is triggered (`manual`, `schedule`, `webhook`, `pr_event`, `push_event`) |
| `steps` | array | yes | Ordered list of steps (min 1) |
| `steps[].id` | string | yes | Step identifier |
| `steps[].name` | string | yes | Step name |
| `steps[].tool` | string | no | Tool to invoke |
| `steps[].input` | object | no | Tool input parameters |
| `steps[].requires_approval` | boolean | no | Whether step needs human approval |
| `steps[].timeout_ms` | number | no | Step timeout in milliseconds |
| `steps[].retry` | object | no | Retry policy (`max_attempts`, `delay_ms`) |
| `constraints` | object | no | Execution constraints |
| `constraints.allowed_tools` | string[] | no | Allowlisted tools |
| `constraints.denied_tools` | string[] | no | Blocklisted tools |
| `constraints.denied_paths` | string[] | no | Blocklisted file paths |
| `constraints.max_tokens` | number | no | Token budget |
| `constraints.max_cost_usd` | number | no | Cost budget in USD |
| `constraints.max_wall_time_ms` | number | no | Wall time budget in ms |
| `on_exit` | object | no | Exit handlers for success/failure |
| `metadata` | object | no | Author, version, tags, schema_version |

## License

MIT
