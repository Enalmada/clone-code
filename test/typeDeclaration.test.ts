import { promises as fs } from 'fs';
import * as path from 'path';

import { processFiles } from '../src'; // Adjust the import path as needed

describe('processFiles function', () => {
  describe('addType functionality', () => {
    const typeFixturePath = 'test/fixtures';
    const typeFileName = 'typeDeclarationFile.ts';

    let originalContent: string;

    beforeAll(async () => {
      originalContent = await fs.readFile(path.join(typeFixturePath, typeFileName), 'utf8');
      await processFiles('TYPE_HOOK', 'Club', typeFixturePath);
    });

    it('should add new type to the SubjectType declaration', async () => {
      const modifiedContent = await fs.readFile(path.join(typeFixturePath, typeFileName), 'utf8');
      expect(modifiedContent).toContain(
        `export type SubjectType = 'Club' | 'User' | 'Task' | 'all';`
      );
      expect(modifiedContent).not.toEqual(originalContent);
    });

    afterAll(async () => {
      // Restore the original content of the file
      await fs.writeFile(path.join(typeFixturePath, typeFileName), originalContent);
    });
  });
});
