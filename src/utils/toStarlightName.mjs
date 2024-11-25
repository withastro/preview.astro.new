// @ts-check

const STARLIGHT_NAME_PREFIX = 'starlight-';

/**
 * Prefix a Starlight template name like astro.new does.
 * @param {string} name
 */
export function toStarlightName(name) {
	return `${STARLIGHT_NAME_PREFIX}${name}`;
}
