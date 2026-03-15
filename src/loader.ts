import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { parse as parseYaml } from 'yaml';

export function loadTaskSpecFile(filePath: string): unknown {
  const content = readFileSync(filePath, 'utf-8');
  const ext = extname(filePath).toLowerCase();

  if (ext === '.yaml' || ext === '.yml') {
    return parseYaml(content);
  }

  if (ext === '.json') {
    return JSON.parse(content);
  }

  throw new Error(`Unsupported file extension: ${ext}. Expected .yaml, .yml, or .json`);
}
