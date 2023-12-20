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
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const hookIndex = content.indexOf(hookName);
    if (hookIndex !== -1) {
      const hookStartIndex = content.indexOf("/*", hookIndex);
      const hookEndIndex = content.indexOf("*/", hookIndex) + 2;
      const hookContentJSON = content.substring(content.indexOf("{", hookIndex), hookEndIndex - 2).trim();
      try {
        const hookData = JSON.parse(hookContentJSON);
        const newFilePath = path.resolve(scriptRunDir, ejs.render(hookData.to, {
          name,
          h: {
            inflection,
            changeCase: {
              ...changeCase,
              lower: (str) => changeCase.noCase(str, { delimiter: "" })
            }
          }
        }));
        await ensureDirectoryExistence(newFilePath);
        await fs.copyFile(file, newFilePath);
        let newFileContent = await fs.readFile(newFilePath, "utf8");
        newFileContent = newFileContent.replace(content.substring(hookStartIndex, hookEndIndex), "").trim();
        hookData.replacements.forEach((replacement) => {
          const replaceWith = ejs.render(replacement.replace, {
            name,
            h: {
              inflection,
              changeCase: {
                ...changeCase,
                lower: (str) => changeCase.noCase(str, { delimiter: "" })
              }
            }
          });
          newFileContent = newFileContent.replace(new RegExp(replacement.find, "g"), replaceWith);
        });
        await fs.writeFile(newFilePath, newFileContent);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
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
