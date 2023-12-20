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
  to?: string;
  replacements?: Replacement[];
  todo?: string;
  addType?: string;
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
  const ejsContext = {
    name,
    h: {
      inflection,
      changeCase,
      lower: (str: string) => changeCase.noCase(str, { delimiter: '' }), // Lowercase transformation
    },
  };

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const hookIndex = content.indexOf(hookName);

    if (hookIndex !== -1) {
      const hookStartIndex = content.indexOf('/*', hookIndex);
      const hookEndIndex = content.indexOf('*/', hookIndex) + 2;
      const hookContentJSON = content
        .substring(content.indexOf('{', hookIndex), hookEndIndex - 2)
        .trim();

      try {
        const hookData = JSON.parse(hookContentJSON) as HookData;

        if (hookData.addType) {
          const typeToAdd = ejs.render(hookData.addType, ejsContext);
          const typeDeclarationRegex = /export type [a-zA-Z]+ = /; // Adjust this regex to match your type declaration
          const typeMatch = content.match(typeDeclarationRegex);
          if (typeMatch) {
            const typeDeclarationIndex = typeMatch.index ?? 0;
            const updatedContent =
              content.substring(0, typeDeclarationIndex + typeMatch[0].length) +
              `'${typeToAdd}' | ` +
              content.substring(typeDeclarationIndex + typeMatch[0].length);
            await fs.writeFile(file, updatedContent);
          }
        }

        if (hookData.todo) {
          const todoMessage = ejs.render(hookData.todo, ejsContext);
          // eslint-disable-next-line no-console
          console.log(`TODO in ${file} - ${todoMessage}`);
          const todoComment = `// TODO - ${todoMessage}\n`;
          const updatedContent =
            content.substring(0, hookStartIndex) + todoComment + content.substring(hookStartIndex);
          await fs.writeFile(file, updatedContent);
        }

        // Process file copying and replacements only if "to" is defined
        if (hookData.to) {
          const newFilePath = path.resolve(scriptRunDir, ejs.render(hookData.to, ejsContext));

          await ensureDirectoryExistence(newFilePath);
          await fs.copyFile(file, newFilePath);

          let newFileContent = await fs.readFile(newFilePath, 'utf8');
          newFileContent = newFileContent
            .replace(content.substring(hookStartIndex, hookEndIndex), '')
            .trim();

          hookData.replacements?.forEach((replacement: Replacement) => {
            const replaceWith = ejs.render(replacement.replace, ejsContext);
            newFileContent = newFileContent.replace(new RegExp(replacement.find, 'g'), replaceWith);
          });

          await fs.writeFile(newFilePath, newFileContent);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  }
}
