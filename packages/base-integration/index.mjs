// @ts-check
/// <reference types="./virtual.d.ts" />

import { fileURLToPath } from 'node:url';
import { vitePluginVirtualModules } from './vite-plugin-virtual-modules.mjs';

const entrypoint = fileURLToPath(new URL('./middleware.mjs', import.meta.url));

/**
 * Astro integration which adds middleware to inject a base URL into links.
 * @param {{ base: string; noDuplicateLinkPrefixes: boolean }} options
 * @returns {import("astro").AstroIntegration}
 */
export function baseInject({ base = '/', noDuplicateLinkPrefixes = false }) {
	// Ensure base has leading and trailing slashes.
	if (base[0] !== '/') base = '/' + base;
	if (base.at(-1) !== '/') base += '/';
	return {
		name: 'preview.astro.new/base-inject',
		hooks: {
			'astro:config:setup'({ addMiddleware, updateConfig }) {
				addMiddleware({ entrypoint, order: 'post' });
				updateConfig({
					vite: {
						plugins: [
							vitePluginVirtualModules({
								'virtual:preview.astro.new/base':
									`export const base = ${JSON.stringify(base)};` +
									`export const noDuplicateLinkPrefixes = ${JSON.stringify(
										noDuplicateLinkPrefixes
									)};`,
							}),
						],
					},
				});
			},
		},
	};
}
