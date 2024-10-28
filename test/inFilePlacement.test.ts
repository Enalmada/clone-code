import { promises as fs } from "node:fs";
import * as path from "node:path";

import { processFiles } from "../src";

describe("In-file placement functionality", () => {
	const inFilePlacementPath = "test/fixtures";
	const inFilePlacementFileName = "inFilePlacement.ts";
	let originalContent: string;

	beforeAll(async () => {
		originalContent = await fs.readFile(
			path.join(inFilePlacementPath, inFilePlacementFileName),
			"utf8",
		);
		await processFiles("INFILE_HOOK", "Club", inFilePlacementPath);
	});

	it("should copy the code block to the bottom of the file", async () => {
		const content = await fs.readFile(
			path.join(inFilePlacementPath, inFilePlacementFileName),
			"utf8",
		);
		expect(content).toContain('export const clubExample = "Club example";');
	});

	afterAll(async () => {
		// Restore the original content of the file
		await fs.writeFile(
			path.join(inFilePlacementPath, inFilePlacementFileName),
			originalContent,
		);
	});
});
