#!/usr/bin/env node

// src/index.ts
import {promises as fs} from "fs";
import * as path from "path";
import * as changeCase from "change-case";
import ejs from "ejs";
import * as glob from "glob";
import inflection from "inflection";
async function ensureDirectoryExistence(filePath) {
  const dirname2 = path.dirname(filePath);
  try {
    await fs.access(dirname2);
  } catch (e) {
    await fs.mkdir(dirname2, { recursive: true });
  }
}
async function processFiles(hookName, name, directory = ".") {
  const pattern = path.join(directory, "**/*.{ts,tsx}");
  const files = glob.sync(pattern, { nodir: true });
  const scriptRunDir = process.cwd();
  const ejsContext = {
    name,
    h: {
      inflection,
      changeCase,
      lower: (str) => changeCase.noCase(str, { delimiter: "" })
    }
  };
  for (const file of files) {
    let content = await fs.readFile(file, "utf8");
    let hookIndex = content.indexOf(hookName);
    while (hookIndex !== -1) {
      const hookStartIndex = content.lastIndexOf("/*", hookIndex);
      const hookEndIndex = content.indexOf("*/", hookIndex) + 2;
      if (hookStartIndex !== -1 && hookEndIndex > hookStartIndex) {
        const hookBlock = content.substring(hookStartIndex, hookEndIndex);
        if (hookBlock.includes("{") && hookBlock.includes("}")) {
          const jsonStartIndex = hookBlock.indexOf("{");
          const jsonEndIndex = hookBlock.lastIndexOf("}");
          if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            const hookContentJSON = hookBlock.substring(jsonStartIndex, jsonEndIndex + 1).trim();
            try {
              const hookData = JSON.parse(hookContentJSON);
              if (hookData.todo) {
                const todoMessage = ejs.render(hookData.todo, ejsContext);
                const todoComment = `\n// TODO - ${todoMessage}\n`;
                if (!content.includes(todoComment)) {
                  console.log(`TODO in ${file} - ${todoMessage}`);
                  content = content.substring(0, hookEndIndex) + todoComment + content.substring(hookEndIndex);
                  await fs.writeFile(file, content);
                }
              }
              if (hookData.toFile) {
                const newFilePath = path.resolve(scriptRunDir, ejs.render(hookData.toFile, ejsContext));
                await ensureDirectoryExistence(newFilePath);
                let newFileContent = content.substring(0, hookStartIndex).trim() + content.substring(hookEndIndex).trim();
                hookData.replacements?.forEach((replacement) => {
                  const replaceWith = ejs.render(replacement.replace, ejsContext);
                  newFileContent = newFileContent.replace(new RegExp(replacement.find, "g"), replaceWith);
                });
                await fs.writeFile(newFilePath, newFileContent);
              }
              if (hookData.addType) {
                const typeToAdd = ejs.render(hookData.addType, ejsContext);
                const typeDeclarationRegex = /export type [a-zA-Z]+ = /;
                const typeDeclarationStart = content.indexOf("export type", hookEndIndex);
                const typeMatch = content.substring(typeDeclarationStart).match(typeDeclarationRegex);
                if (typeMatch && typeDeclarationStart > -1) {
                  const typeDeclarationIndex = typeDeclarationStart + typeMatch.index;
                  const updatedContent = content.substring(0, typeDeclarationIndex + typeMatch[0].length) + `'${typeToAdd}' | ` + content.substring(typeDeclarationIndex + typeMatch[0].length);
                  content = updatedContent;
                  await fs.writeFile(file, updatedContent);
                }
              }
              if (hookData.toPlacement) {
                const hookEndMarker = `/* ${hookName} end */`;
                const blockStartIndex = hookEndIndex;
                let blockEndIndex = content.indexOf(hookEndMarker, blockStartIndex);
                if (blockEndIndex !== -1) {
                  blockEndIndex = content.lastIndexOf("/*", blockEndIndex);
                } else {
                  blockEndIndex = content.length;
                }
                let blockContent = content.substring(blockStartIndex, blockEndIndex).trim();
                hookData.replacements?.forEach((replacement) => {
                  const replaceWith = ejs.render(replacement.replace, ejsContext);
                  blockContent = blockContent.replace(new RegExp(replacement.find, "g"), replaceWith);
                });
                if (!content.includes(blockContent)) {
                  blockContent = (hookData.toPlacement === "above" ? "\n" : "\n\n") + blockContent + "\n";
                  let updatedContent = content;
                  switch (hookData.toPlacement) {
                    case "above":
                      updatedContent = content.substring(0, hookStartIndex) + blockContent + content.substring(hookStartIndex);
                      break;
                    case "below":
                      const endCommentIndex = content.indexOf(hookEndMarker, hookEndIndex) + hookEndMarker.length;
                      updatedContent = content.substring(0, endCommentIndex) + blockContent + content.substring(endCommentIndex);
                      break;
                    case "bottom":
                      updatedContent = content + blockContent;
                      break;
                    default:
                      break;
                  }
                  await fs.writeFile(file, updatedContent);
                }
              }
              content = await fs.readFile(file, "utf8");
            } catch (error) {
              console.error(`Error processing file ${file}:`, error);
            }
          } else {
            console.log(`No valid JSON found in hook block in file ${file}`);
          }
        } else {
        }
      } else {
        console.error(`Invalid hook block format in ${hookName} in file ${file}`);
      }
      hookIndex = content.indexOf(hookName, hookEndIndex);
    }
  }
}

// src/index.
var args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: bunx clone-code <HOOK_NAME> <NAME> [DIRECTORY]");
  process.exit(1);
}
var [hookName, name, directory] = args;
processFiles(hookName, name, directory).catch((error) => {
  console.error("An error occurred:", error.message);
  process.exit(1);
});
