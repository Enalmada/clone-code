#!/usr/bin/env node
import { processFiles } from './index';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: bunx clone-code <HOOK_NAME> <NAME> [DIRECTORY]');
  process.exit(1);
}

const [hookName, name, directory] = args;
processFiles(hookName, name, directory).catch((error: Error) => {
  console.error('An error occurred:', error.message);
  process.exit(1);
});
