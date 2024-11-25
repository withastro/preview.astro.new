// @ts-check

import { build } from 'astro';
import { createSpinner } from 'nanospinner';
import child_process from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { downloadTemplates } from './download.mjs';
import { cleanAndCreateDirectory } from './utils/cleanAndCreateDirectory.mjs';

/** Directory to download Astro starter templates to. */
const templateDir = '.templates';
/** Directory to collect build output in for serving later. */
const buildDir = 'dist';
/**
 * Examples to skip when building.
 * These examples are not Astro projects so cannot be built/previewed or require SSR which won’t work in this deployment model.
 */
const blocklist = ['component', 'toolbar-app', 'ssr'];

// Create output directory
cleanAndCreateDirectory(buildDir);

const downloading = createSpinner('Downloading template files from GitHub').start();
await downloadTemplates(templateDir, 'latest');
downloading.success();

const installing = createSpinner('Installing template dependencies with pnpm').start();
const result = child_process.spawnSync('pnpm', ['install'], { encoding: 'utf-8' });
if (result.error) {
	installing.error();
	throw result.error;
} else {
	installing.success();
}

// Build templates.
const templates = await fs.readdir(templateDir, { withFileTypes: true });
for (const dir of templates) {
	if (!dir.isDirectory()) continue;
	if (blocklist.includes(dir.name)) continue;
	const building = createSpinner(`Building ${dir.name}`).start();
	const root = path.join(dir.parentPath, dir.name);
	// Build example with Astro.
	await build({
		root,
		outDir: './dist',
		logLevel: 'error',
		base: dir.name,
		trailingSlash: 'always',
	});
	// Move the build output to shared `dist/` directory.
	fs.rename(path.join(root, 'dist'), path.join(buildDir, dir.name));
	building.success();
}
