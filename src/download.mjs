// @ts-check

import { downloadTemplate } from '@bluwy/giget-core';
import { createSpinner } from 'nanospinner';
import child_process from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { toStarlightName } from './utils/toStarlightName.mjs';
import { makeTemporaryDirectory } from './utils/makeTemporaryDirectory.mjs';

/**
 * Download Astro’s official starter templates.
 * @param {string} outDir Path to the directory to download templates to
 * @param {string} [ref] Optional GitHub branch reference to use (e.g. `"next"`)
 */
export async function downloadTemplates(outDir, ref = 'latest') {
	const downloading = createSpinner('Downloading template files from GitHub').start();
	// Download Astro templates
	await downloadTemplate(`withastro/astro/examples#${ref}`, {
		dir: outDir,
		force: 'clean',
		offline: 'prefer',
	});

	// Download Starlight templates
	const temporaryDir = await makeTemporaryDirectory('starlight-templates');
	await downloadTemplate(`withastro/starlight/examples`, {
		dir: temporaryDir,
		force: 'clean',
		offline: 'prefer',
	});
	// And then move them into the output directory
	const starlightExamples = await fs.readdir(temporaryDir, { withFileTypes: true });
	for (const dir of starlightExamples) {
		if (!dir.isDirectory()) continue;
		fs.rename(path.join(temporaryDir, dir.name), path.join(outDir, toStarlightName(dir.name)));
	}
	downloading.success();

	// Install dependencies to add things needed by templates.
	const installing = createSpinner('Installing template dependencies with pnpm').start();
	const result = child_process.spawnSync('pnpm', ['install'], { encoding: 'utf-8' });
	if (result.error) {
		installing.error();
		throw result.error;
	}
	installing.success();
}
