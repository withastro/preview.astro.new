// @ts-check

import fs from 'node:fs/promises';

/**
 * Create a directory, deleting it first if it already exists.
 * @param {string} dirName Name of the directory to create.
 */
export async function cleanAndCreateDirectory(dirName) {
	await fs.rm(dirName, { force: true, recursive: true });
	await fs.mkdir(dirName);
}
