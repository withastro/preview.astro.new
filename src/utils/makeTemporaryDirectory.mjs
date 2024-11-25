// @ts-check

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { cleanAndCreateDirectory } from './cleanAndCreateDirectory.mjs';

/**
 * Create a directory in the system `tmp` directory and get its path.
 * @param {string} dirName Name of the directory to create in the system `tmp` directory.
 * @returns Path to the created directory.
 */
export async function makeTemporaryDirectory(dirName) {
	const tmpRoot = await fs.realpath(os.tmpdir());
	const fullPath = path.join(tmpRoot, dirName);
	cleanAndCreateDirectory(fullPath);
	return fullPath;
}
