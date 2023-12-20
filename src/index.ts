import { promises as fs } from 'fs';
import * as path from 'path';
import * as changeCase from 'change-case';
import ejs from 'ejs';
import * as glob from 'glob';
import inflection from 'inflection';

interface Replacement {
  find: string;
  replace: string;
}

interface HookData {
  to: string;
  replacements: Replacement[];
}

async function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  try {
    await fs.access(dirname);
  } catch (e) {
    await fs.mkdir(dirname, { recursive: true });
  }
}

export async function processFiles(hookName: string, name: string, directory: string = '.') {
  const pattern = path.join(directory, '**/*.{ts,tsx}');
  const files = glob.sync(pattern, { nodir: true });
  const scriptRunDir = process.cwd(); // Directory where the script is run

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const hookIndex = content.indexOf(hookName);

    if (hookIndex !== -1) {
      const hookStartIndex = content.indexOf('/*', hookIndex);
      const hookEndIndex = content.indexOf('*/', hookIndex) + 2; // +2 to include the closing */
      const hookContentJSON = content
        .substring(content.indexOf('{', hookIndex), hookEndIndex - 2)
        .trim();

      try {
        const hookData = JSON.parse(hookContentJSON) as HookData;
        const newFilePath = path.resolve(
          scriptRunDir,
          ejs.render(hookData.to, {
            name,
            h: {
              inflection,
              changeCase: {
                ...changeCase,
                lower: (str: string) => changeCase.noCase(str, { delimiter: '' }), // Lowercase transformation
              },
            },
          })
        );

        await ensureDirectoryExistence(newFilePath);
        await fs.copyFile(file, newFilePath);

        let newFileContent = await fs.readFile(newFilePath, 'utf8');
        // Remove the HOOK comment and trim the content
        newFileContent = newFileContent
          .replace(content.substring(hookStartIndex, hookEndIndex), '')
          .trim();

        // Perform replacements
        hookData.replacements.forEach((replacement: Replacement) => {
          const replaceWith = ejs.render(replacement.replace, {
            name,
            h: {
              inflection,
              changeCase: {
                ...changeCase, // Include all change-case functions
                lower: (str: string) => changeCase.noCase(str, { delimiter: '' }), // Lowercase transformation
              },
            },
          });
          newFileContent = newFileContent.replace(new RegExp(replacement.find, 'g'), replaceWith);
        });

        await fs.writeFile(newFilePath, newFileContent);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  }
}
