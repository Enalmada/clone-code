/* eslint-disable no-console */
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
  toFile?: string;
  toPlacement?: 'above' | 'below' | 'bottom';
  replacements?: Replacement[];
  todo?: string;
  addType?: string;
  copyBlock?: string;
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

        if (hookData.todo) {
          const todoMessage = ejs.render(hookData.todo, ejsContext);
          const todoComment = `// TODO - ${todoMessage}\n`;
          if (!content.includes(todoComment)) {
            console.log(`TODO in ${file} - ${todoMessage}`);
            const updatedContent =
              content.substring(0, hookStartIndex) +
              todoComment +
              content.substring(hookStartIndex);
            await fs.writeFile(file, updatedContent);
          }
        }

        if (hookData.addType) {
          const typeToAdd = ejs.render(hookData.addType, ejsContext);
          const typeDeclarationStartIndex = content.indexOf('=', hookEndIndex) + 1;
          if (typeDeclarationStartIndex > -1) {
            const existingType = content
              .substring(typeDeclarationStartIndex, content.indexOf('|', typeDeclarationStartIndex))
              .trim();
            if (!existingType.startsWith(`'${typeToAdd}'`)) {
              const updatedContent =
                content.substring(0, typeDeclarationStartIndex) +
                ` '${typeToAdd}' |` +
                content.substring(typeDeclarationStartIndex);
              await fs.writeFile(file, updatedContent);
            }
          }
        }

        if (hookData.toFile) {
          const newFilePath = path.resolve(scriptRunDir, ejs.render(hookData.toFile, ejsContext));
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

        if (hookData.toPlacement) {
          const hookEndMarker = `/* ${hookName} end */`;
          const blockStartIndex = content.lastIndexOf('*/', hookEndIndex) + 2;
          const blockEndIndex = content.indexOf(hookEndMarker, blockStartIndex);
          let blockContent = content.substring(blockStartIndex, blockEndIndex).trim();

          hookData.replacements?.forEach((replacement: Replacement) => {
            const replaceWith = ejs.render(replacement.replace, ejsContext);
            blockContent = blockContent.replace(new RegExp(replacement.find, 'g'), replaceWith);
          });

          // Check if the block content already exists in the file
          if (!content.includes(blockContent)) {
            blockContent = (hookData.toPlacement === 'above' ? '\n' : '\n\n') + blockContent + '\n';

            let updatedContent = content;
            switch (hookData.toPlacement) {
              case 'above':
                updatedContent =
                  content.substring(0, hookStartIndex) +
                  blockContent +
                  content.substring(hookStartIndex);
                break;
              case 'below':
                const endCommentIndex =
                  content.indexOf(hookEndMarker, hookEndIndex) + hookEndMarker.length;
                updatedContent =
                  content.substring(0, endCommentIndex) +
                  blockContent +
                  content.substring(endCommentIndex);
                break;
              case 'bottom':
                updatedContent = content + blockContent;
                break;
              default:
                break;
            }
            await fs.writeFile(file, updatedContent);
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  }
}
