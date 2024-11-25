// @ts-check

import { build } from 'astro';
import { createSpinner } from 'nanospinner';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { baseInject } from './base-integration/integration.mjs';
import { downloadTemplates } from './download.mjs';
import { cleanAndCreateDirectory } from './utils/cleanAndCreateDirectory.mjs';

const initialCWD = process.cwd();
/** Directory to download Astro starter templates to. */
const templateDir = '.templates';
/** Directory to collect build output in for serving later. */
const buildDir = 'dist';
/**
 * Examples to skip when building.
 * These examples are not Astro projects so cannot be built/previewed or require SSR which won’t work in this deployment model.
 */
const blocklist = ['component', 'integration', 'toolbar-app', 'ssr'];

/**
 * @typedef SiteOptions
 * @prop {boolean} [skipPrefixed] Whether links that start with the base path should be skipped when prefixing with base.
 * When `true`, for a site with `base: 'blog'`, a link to `/blog/post` would not receive an additional `/blog/` segment.
 */

/**
 * Template-specific configuration options to change how the build behaves.
 * @type {Record<string, SiteOptions>}
 */
const templateConfig = {
	// Starlight prefixes global navigation links with base correctly. Those should not get an additional prefix.
	'starlight-basics': { skipPrefixed: true },
	'starlight-markdoc': { skipPrefixed: true },
	'starlight-tailwind': { skipPrefixed: true },
};

// Create output directory
await cleanAndCreateDirectory(buildDir);

await downloadTemplates(templateDir, 'latest');

// Build templates.
const templates = await fs.readdir(templateDir, { withFileTypes: true });
for (const dir of templates) {
	if (!dir.isDirectory()) continue;
	if (blocklist.includes(dir.name)) continue;
	const building = createSpinner(`Building ${dir.name}`).start();
	const root = path.join(dir.parentPath, dir.name);
	// Get configuration options for this template.
	const { skipPrefixed = false } = templateConfig[dir.name] || {};
	// Build example with Astro.
	// We change CWD instead of using Astro’s `root` option because examples using Tailwind failed
	// to find the Tailwind config file when using `root`.
	process.chdir(root);
	await build({
		outDir: './dist',
		logLevel: 'error',
		base: dir.name,
		trailingSlash: 'always',
		integrations: [baseInject({ base: dir.name, skipPrefixed })],
	});
	process.chdir(initialCWD);
	// Move the build output to shared `dist/` directory.
	await fs.rename(path.join(root, 'dist'), path.join(buildDir, dir.name));
	building.success();
}
