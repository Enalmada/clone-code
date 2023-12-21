// bun types conflicts with dom types so just putting it where it is needed
/// <reference types="bun-types" />

import getExternalsFromCurrentWorkingDirPackageJson, { bunBuild } from '@enalmada/bun-externals';

async function buildWithExternals(): Promise<void> {
  // bundling everything but declared deps
  const externalDeps = await getExternalsFromCurrentWorkingDirPackageJson();

  // bunBuild handles build failure
  await bunBuild({
    entrypoints: ['./src/cli.ts'],
    outdir: './dist',
    target: 'node',
    external: [...externalDeps],
    root: './src',
  });
}

void buildWithExternals();
