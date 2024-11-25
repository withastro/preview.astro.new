// @ts-check

import { build } from 'astro';
import { createSpinner } from 'nanospinner';
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
const blocklist = ['component', 'integration', 'toolbar-app', 'ssr'];

// Create output directory
cleanAndCreateDirectory(buildDir);

await downloadTemplates(templateDir, 'latest');

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
