// @ts-check

/**
 * @param {string} id
 */
const resolveVirtualModuleId = (id) => `\0${id}`;

/**
 * Vite plugin that adds the passed modules as virtual modules.
 *
 * @param {Record<string, string>} modules Map of virtual module names to their code contents as strings.
 * @returns {NonNullable<import("astro").ViteUserConfig['plugins']>[number]}
 *
 * @example
 * vitePluginVirtualModules({
 *   'virtual:example': 'export const example = () => console.log("Hello, world");',
 * });
 *
 * // Then later importing that module would log:
 * import { example } from 'virtual:example';
 * example(); // => Hello, world
 */
export function vitePluginVirtualModules(modules) {
	/** Mapping names prefixed with `\0` to their original form. */
	const resolutionMap = Object.fromEntries(
		Object.keys(modules).map((key) => [resolveVirtualModuleId(key), key])
	);
	return {
		name: 'preview.astro.new/base-inject/vite',
		resolveId(id) {
			if (id in modules) return resolveVirtualModuleId(id);
		},
		load(id) {
			const resolution = resolutionMap[id];
			if (resolution) return modules[resolution];
		},
	};
}
