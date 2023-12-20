import { promises as fs } from 'fs';
import * as path from 'path';

import { processFiles } from '../src'; // Adjust the import path as needed

describe('processFiles function', () => {
  const outputDir = 'test/outputs';

  beforeAll(async () => {
    // Setup: Run the processFiles function
    await processFiles('ENTITY_HOOK', 'TestEntity', 'test/fixtures');
  });

  it('should create the transformed file with correct content', async () => {
    const outputPath = path.resolve(outputDir, 'testEntity.ts');
    const exists = await fs
      .stat(outputPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    if (exists) {
      const content = await fs.readFile(outputPath, 'utf8');
      expect(content).toContain('export class TestEntity {}');
      expect(content).not.toContain('/* ENTITY_HOOK');
    }
  });

  afterAll(async () => {
    // Cleanup: Remove the generated file and directory
    try {
      const outputPath = path.resolve(outputDir, 'testEntity.ts');
      await fs.unlink(outputPath);
      await fs.rmdir(outputDir);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });
});
