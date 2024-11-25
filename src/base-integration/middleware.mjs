// @ts-check

import { base, skipPrefixed } from 'virtual:preview.astro.new/base';
import { parseHTML, HTMLAnchorElement, HTMLImageElement } from 'linkedom';

/**
 * Check if a URL is relative.
 * @param {string} url
 */
const isRelative = (url) => Boolean(url?.[0] === '/' && url?.[1] !== '/');

/**
 * Check if a URL is most likely an Astro-processed asset, which will already be prefixed with base.
 * @param {string} url
 */
const isAstroAssetUrl = (url) => Boolean(url?.includes('/_astro/'));

/**
 * Check if a URL has already been prefixed with the required base.
 * @param {string} url
 */
const isPrefixed = (url) => Boolean(url?.startsWith(base));

/**
 * Check if a URL should be prefixed with base.
 * @param {string} url
 */
const shouldPrefix = (url) =>
	isRelative(url) && !isAstroAssetUrl(url) && (!skipPrefixed || !isPrefixed(url));

/** @type {import("astro").MiddlewareHandler} */
export async function onRequest(request, next) {
	const response = await next();
	const html = await response.text();
	const { document } = parseHTML(html);

	// Add base to links.
	document.querySelectorAll('[href]').forEach((element) => {
		if (!(element instanceof HTMLAnchorElement)) return;
		if (shouldPrefix(element.href)) {
			element.href = base + element.href.slice(1);
		}
	});

	// Add base to image sources.
	document.querySelectorAll('[src]').forEach((element) => {
		if (!(element instanceof HTMLImageElement)) return;
		if (shouldPrefix(element.src)) {
			element.src = base + element.src.slice(1);
		}
	});

	return new Response(document.toString(), response);
}
