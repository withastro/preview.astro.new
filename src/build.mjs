// @ts-check

import { createSpinner } from 'nanospinner';
import child_process from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { downloadTemplates } from './download.mjs';
import { cleanAndCreateDirectory } from './utils/cleanAndCreateDirectory.mjs';

/** Directory to download Astro starter templates to. */
const templateDir = '.templates';
/** Directory to collect build output in for serving later. */
const buildDir = 'dist';

/**
 * @typedef SiteOptions
 * @prop {boolean} [noDuplicateLinkPrefixes] Whether links that start with the base path should be skipped when prefixing with base.
 * When `true`, for a site with `base: 'blog'`, a link to `/blog/post` would not receive an additional `/blog/` segment.
 * @prop {boolean} [skip] Whether this example should be ignored entirely and not built.
 */

/**
 * Template-specific configuration options to change how the build behaves.
 * @type {Record<string, SiteOptions>}
 */
const config = {
	// These examples are not Astro projects so cannot be built/previewed.
	component: { skip: true },
	integration: { skip: true },
	'toolbar-app': { skip: true },
	// These examples require SSR which won’t work in this deployment model.
	ssr: { skip: true },
	hackernews: { skip: true },
	// These sites prefix links with base correctly. Prefixed links should not get an additional prefix.
	'starlight-basics': { noDuplicateLinkPrefixes: true },
	'starlight-markdoc': { noDuplicateLinkPrefixes: true },
	'starlight-tailwind': { noDuplicateLinkPrefixes: true },
	'with-nanostores': { noDuplicateLinkPrefixes: true },
};

// Create output directory
await cleanAndCreateDirectory(buildDir);

await downloadTemplates(templateDir, 'latest');

// Build templates.
const templates = (await fs.readdir(templateDir, { withFileTypes: true })).filter(
	(dir) => dir.isDirectory() && !config[dir.name]?.skip
);
for (const dir of templates) {
	const building = createSpinner(`Building ${dir.name}`).start();
	const root = path.join(dir.parentPath, dir.name);
	// Get configuration options for this template.
	const { noDuplicateLinkPrefixes = false } = config[dir.name] || {};
	// Copy build script into project directory.
	// This is a Node script that runs an Astro build with custom configuration for the preview site.
	await fs.copyFile('./src/build-example.mjs', path.join(root, 'build.mjs'));
	// Build example by executing the build script.
	const cliFlags = ['--base', dir.name];
	if (noDuplicateLinkPrefixes) cliFlags.push('--noDuplicateLinkPrefixes');
	const result = child_process.spawnSync('node', ['./build.mjs', ...cliFlags], { cwd: root });
	if (result.error) {
		building.error();
		throw result.error;
	}
	// Move the build output to shared `dist/` directory.
	await fs.rename(path.join(root, 'dist'), path.join(buildDir, dir.name));
	building.success();
}

// Add API route for astro.new to use
await fs.writeFile(
	path.join(buildDir, 'metadata.json'),
	JSON.stringify({
		previews: templates.map((dir) => dir.name),
	}),
	'utf-8'
);
