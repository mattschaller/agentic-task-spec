# agentic-task-spec

## Setup
```bash
npm install
npm run build
```

## Testing
```bash
npm test          # vitest run
```

## Build
```bash
npm run build     # tsup — ESM+CJS lib + ESM CLI
```

## Architecture
- `src/schema.ts` — Zod v4 schemas for task spec definition
- `src/validator.ts` — `validateTaskSpec()` safe parse, `parseTaskSpec()` strict parse
- `src/loader.ts` — File loading (YAML/JSON)
- `src/cli.ts` — CLI entry point (`validate`, `init`, `inspect`)
- `src/index.ts` — Library entry point, re-exports + `defineTask()` + JSON Schema

## Conventions
- TypeScript strict, ES2022, bundler module resolution
- Zero runtime deps beyond `zod` and `yaml`
- Pinned GitHub Action SHAs (v6)
- `engines.node >= 20`
- Dependabot with auto-merge for patch/minor
- No Co-Authored-By or Claude attribution in commits
- MIT license
