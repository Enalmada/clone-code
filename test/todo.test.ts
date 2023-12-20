import { promises as fs } from 'fs';
import * as path from 'path';

import { processFiles } from '../src'; // Adjust the import path as needed

describe('processFiles function', () => {
  describe('todo functionality', () => {
    const typeFixturePath = 'test/fixtures';
    const typeFileName = 'todoFile.ts';

    let originalContent: string;

    beforeAll(async () => {
      originalContent = await fs.readFile(path.join(typeFixturePath, typeFileName), 'utf8');
      await processFiles('TODO_HOOK', 'Club', typeFixturePath);
    });

    it('should add todo to the top of the file', async () => {
      const modifiedContent = await fs.readFile(path.join(typeFixturePath, typeFileName), 'utf8');
      expect(modifiedContent).toContain(`Add todo for Club`);
      expect(modifiedContent).not.toEqual(originalContent);
    });

    afterAll(async () => {
      // Restore the original content of the file
      await fs.writeFile(path.join(typeFixturePath, typeFileName), originalContent);
    });
  });
});
