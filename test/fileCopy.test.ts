import { promises as fs } from "node:fs";
import * as path from "node:path";

import { processFiles } from "../src";

describe("toFile", () => {
	const outputDir = "test/outputs";

	beforeAll(async () => {
		const outputPath = path.normalize(path.resolve(outputDir));
		try {
			await fs.mkdir(outputPath, { recursive: true });
		} catch (error) {
			console.error("Error creating output directory:", error);
		}

		await processFiles("ENTITY_HOOK", "TestEntity", "test/fixtures");
	});

	it("should create the transformed file with correct content", async () => {
		const outputPath = path.resolve(process.cwd(), outputDir, "testEntity.ts");

		const exists = await fs
			.stat(outputPath)
			.then(() => true)
			.catch(() => false);
		expect(exists).toBe(true);

		if (exists) {
			const content = await fs.readFile(outputPath, "utf8");
			expect(content).toContain("export class TestEntity {}");
			expect(content).not.toContain("/* clone-code ENTITY_HOOK");
		}
	});

	afterAll(async () => {
		// Cleanup: Remove the generated file and directory
		try {
			const outputPath = path.resolve(outputDir, "testEntity.ts");
			await fs.unlink(outputPath);
			await fs.rmdir(outputDir);
		} catch (error) {
			console.error("Cleanup failed:", error);
		}
	});
});
