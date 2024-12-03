// @ts-check
// This script is designed to be copied into a template and run in its context (dependencies etc.)

import { build } from 'astro';
import { parseArgs } from 'node:util';
import { baseInject } from '@preview.astro.new/base-integration';

// Get options from CLI flags.
const { base, noDuplicateLinkPrefixes } = parseArgs({
	options: {
		base: { type: 'string' },
		noDuplicateLinkPrefixes: { type: 'boolean', default: false },
	},
}).values;
if (!base) throw new Error('Missing template --base argument');

// Build example with Astro.
await build({
	outDir: './dist',
	logLevel: 'error',
	base: base,
	trailingSlash: 'always',
	integrations: [baseInject({ base: base, noDuplicateLinkPrefixes })],
});
