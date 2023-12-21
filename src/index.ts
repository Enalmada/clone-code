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
    let content = await fs.readFile(file, 'utf8');
    let hookIndex = content.indexOf(hookName);

    while (hookIndex !== -1) {
      const hookStartIndex = content.lastIndexOf('/*', hookIndex); // Find the start of the hook block
      const hookEndIndex = content.indexOf('*/', hookIndex) + 2; // Find the end of the hook block

      // Ensure that the hook block is correctly isolated
      if (hookStartIndex !== -1 && hookEndIndex > hookStartIndex) {
        const hookBlock = content.substring(hookStartIndex, hookEndIndex); // Extract the hook block
        if (hookBlock.includes('{') && hookBlock.includes('}')) {
          const jsonStartIndex = hookBlock.indexOf('{');
          const jsonEndIndex = hookBlock.lastIndexOf('}');

          if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            const hookContentJSON = hookBlock.substring(jsonStartIndex, jsonEndIndex + 1).trim();

            try {
              const hookData = JSON.parse(hookContentJSON) as HookData;

              if (hookData.todo) {
                const todoMessage = ejs.render(hookData.todo, ejsContext);
                const todoComment = `\n// TODO - ${todoMessage}\n`; // Added newline at the start
                if (!content.includes(todoComment)) {
                  console.log(`TODO in ${file} - ${todoMessage}`);
                  content =
                    content.substring(0, hookEndIndex) + // Insert after hook end
                    todoComment +
                    content.substring(hookEndIndex);
                  await fs.writeFile(file, content);
                }
              }

              // ToFile functionality
              // Process toFile hooks
              if (hookData.toFile) {
                const newFilePath = path.resolve(
                  scriptRunDir,
                  ejs.render(hookData.toFile, ejsContext)
                );
                await ensureDirectoryExistence(newFilePath);
                let newFileContent =
                  content.substring(0, hookStartIndex).trim() + // Trim to remove leading newline
                  content.substring(hookEndIndex).trim(); // Exclude the hook block and trim trailing newline

                // Perform replacements
                hookData.replacements?.forEach((replacement) => {
                  const replaceWith = ejs.render(replacement.replace, ejsContext);
                  newFileContent = newFileContent.replace(
                    new RegExp(replacement.find, 'g'),
                    replaceWith
                  );
                });

                await fs.writeFile(newFilePath, newFileContent);
              }

              // AddType functionality
              if (hookData.addType) {
                const typeToAdd = ejs.render(hookData.addType, ejsContext);
                // Find the type declaration immediately after the current hook
                const typeDeclarationRegex = /export type [a-zA-Z]+ = /;
                const typeDeclarationStart = content.indexOf('export type', hookEndIndex);
                const typeMatch = content
                  .substring(typeDeclarationStart)
                  .match(typeDeclarationRegex);

                if (typeMatch && typeDeclarationStart > -1) {
                  const typeDeclarationIndex = typeDeclarationStart + typeMatch.index! ?? 0;
                  const updatedContent =
                    content.substring(0, typeDeclarationIndex + typeMatch[0].length) +
                    `'${typeToAdd}' | ` +
                    content.substring(typeDeclarationIndex + typeMatch[0].length);
                  content = updatedContent;
                  await fs.writeFile(file, updatedContent);
                }
              }

              if (hookData.toPlacement) {
                const hookEndMarker = `/* ${hookName} end */`;
                const blockStartIndex = hookEndIndex; // Start immediately after the hook block
                let blockEndIndex = content.indexOf(hookEndMarker, blockStartIndex); // Find the start of the end hook

                if (blockEndIndex !== -1) {
                  blockEndIndex = content.lastIndexOf('/*', blockEndIndex); // End right before the start of the end hook
                } else {
                  blockEndIndex = content.length; // If no end hook, use the end of the file
                }

                let blockContent = content.substring(blockStartIndex, blockEndIndex).trim();

                hookData.replacements?.forEach((replacement: Replacement) => {
                  const replaceWith = ejs.render(replacement.replace, ejsContext);
                  blockContent = blockContent.replace(
                    new RegExp(replacement.find, 'g'),
                    replaceWith
                  );
                });

                // Check if the block content already exists in the file
                if (!content.includes(blockContent)) {
                  blockContent =
                    (hookData.toPlacement === 'above' ? '\n' : '\n\n') + blockContent + '\n';

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
              content = await fs.readFile(file, 'utf8'); // Re-read the file content for the next iteration
            } catch (error) {
              console.error(`Error processing file ${file}:`, error);
            }
          } else {
            // Log or handle the case where the hook content does not contain valid JSON
            console.log(`No valid JSON found in hook block in file ${file}`);
          }
        } else {
          // This is likely the end hook tag or a non-JSON hook
          // console.log(`Skipping non-JSON hook block in file ${file}`);
        }
      } else {
        console.error(`Invalid hook block format in ${hookName} in file ${file}`);
      }

      // Find the next occurrence of the hook
      hookIndex = content.indexOf(hookName, hookEndIndex);
    }
  }
}
