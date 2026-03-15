import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadTaskSpecFile } from './loader.js';
import { validateTaskSpec, parseTaskSpec } from './validator.js';

const VERSION = '0.1.0';

const STARTER_TASK = `id: my-task
title: My Agentic Task
description: A starter task spec — customize to fit your workflow.
trigger:
  type: manual
steps:
  - id: step-1
    name: Run analysis
    tool: code-review
    input:
      target: src/
    requires_approval: false
    timeout_ms: 30000
constraints:
  allowed_tools:
    - code-review
    - file-read
  max_tokens: 100000
  max_cost_usd: 1.00
  max_wall_time_ms: 120000
on_exit:
  success:
    notify: team-channel
  failure:
    notify: team-channel
    escalate: true
metadata:
  author: team
  version: "0.1.0"
  tags:
    - starter
  schema_version: "0.1.0"
`;

function printHelp(): void {
  console.log(`agentic-task-spec v${VERSION}

Usage:
  agentic-task-spec validate <file|dir>   Validate task spec file(s)
  agentic-task-spec init                  Create a starter task.yaml
  agentic-task-spec inspect <file>        Inspect a task spec file

Options:
  --help      Show this help message
  --version   Show version`);
}

function findSpecFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files.push(...findSpecFiles(fullPath));
    } else if (entry.isFile() && /\.(yaml|yml|json)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function cmdValidate(target: string): number {
  const fullPath = resolve(target);
  let files: string[];

  try {
    const stat = statSync(fullPath);
    files = stat.isDirectory() ? findSpecFiles(fullPath) : [fullPath];
  } catch {
    console.error(`Error: ${target} not found`);
    return 1;
  }

  if (files.length === 0) {
    console.log('No spec files found.');
    return 0;
  }

  let hasErrors = false;

  for (const file of files) {
    try {
      const data = loadTaskSpecFile(file);
      const result = validateTaskSpec(data);
      if (result.success) {
        console.log(`\u2713 ${file}`);
      } else {
        console.error(`\u2717 ${file}`);
        for (const err of result.errors!) {
          console.error(`  - ${err}`);
        }
        hasErrors = true;
      }
    } catch (err) {
      console.error(`\u2717 ${file}: ${(err as Error).message}`);
      hasErrors = true;
    }
  }

  return hasErrors ? 1 : 0;
}

function cmdInit(): number {
  const target = resolve('task.yaml');
  if (existsSync(target)) {
    console.error('Error: task.yaml already exists');
    return 1;
  }
  writeFileSync(target, STARTER_TASK);
  console.log('Created task.yaml');
  return 0;
}

function cmdInspect(target: string): number {
  try {
    const data = loadTaskSpecFile(resolve(target));
    const spec = parseTaskSpec(data);

    console.log(`Task: ${spec.title} (${spec.id})`);
    if (spec.description) {
      console.log(`Description: ${spec.description}`);
    }
    console.log(`Trigger: ${spec.trigger.type}`);
    console.log(`Steps: ${spec.steps.length}`);

    const approvalGates = spec.steps.filter((s) => s.requires_approval);
    if (approvalGates.length > 0) {
      console.log(`Approval gates: ${approvalGates.map((s) => s.id).join(', ')}`);
    }

    if (spec.constraints) {
      const parts: string[] = [];
      if (spec.constraints.allowed_tools) parts.push(`allowed_tools: ${spec.constraints.allowed_tools.join(', ')}`);
      if (spec.constraints.denied_tools) parts.push(`denied_tools: ${spec.constraints.denied_tools.join(', ')}`);
      if (spec.constraints.max_tokens) parts.push(`max_tokens: ${spec.constraints.max_tokens}`);
      if (spec.constraints.max_cost_usd) parts.push(`max_cost_usd: $${spec.constraints.max_cost_usd}`);
      if (spec.constraints.max_wall_time_ms) parts.push(`max_wall_time_ms: ${spec.constraints.max_wall_time_ms}ms`);
      if (parts.length > 0) {
        console.log(`Constraints: ${parts.join(', ')}`);
      }
    }

    if (spec.metadata) {
      const meta: string[] = [];
      if (spec.metadata.author) meta.push(`author: ${spec.metadata.author}`);
      if (spec.metadata.version) meta.push(`version: ${spec.metadata.version}`);
      if (spec.metadata.tags) meta.push(`tags: ${spec.metadata.tags.join(', ')}`);
      if (meta.length > 0) {
        console.log(`Metadata: ${meta.join(', ')}`);
      }
    }

    return 0;
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    return 1;
  }
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--version')) {
    console.log(VERSION);
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case 'validate': {
      if (!args[1]) {
        console.error('Error: validate requires a file or directory argument');
        process.exit(1);
      }
      process.exit(cmdValidate(args[1]));
      break;
    }
    case 'init': {
      process.exit(cmdInit());
      break;
    }
    case 'inspect': {
      if (!args[1]) {
        console.error('Error: inspect requires a file argument');
        process.exit(1);
      }
      process.exit(cmdInspect(args[1]));
      break;
    }
    default: {
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
    }
  }
}

main();
