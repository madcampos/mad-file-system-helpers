/**
 * Split a path string into segments and normalize it.
 *
 * The normalization does the following:
 * - Removes empty path segments.
 * - Decode from URI parts to handle paths coming from URLs.
 *
 * @param path The path to split into segments
 */
export function pathToSegments(path: string) {
	const decodedPath = decodeURIComponent(path.replaceAll(/%(?![0-9a-fA-F]{2})/giu, '%25'));
	const segments = decodedPath.split('/').filter(Boolean).map((part) => part.trim());

	return segments;
}

/**
 * Returns the directory name, given a path string.
 * It is similar to node's `dirname` fucntion.
 *
 * @param path The path to get the directory name
 */
export function dirname(path: string) {
	const segments = pathToSegments(path);
	const pathBase = path.startsWith('/') ? '/' : '';

	if (segments.length <= 1) {
		return pathBase;
	}

	const dirSegments = segments.slice(0, -1);

	return `${pathBase}${dirSegments.join('/')}`;
}

/**
 * Returns the name for the last part of a given path string.
 * It is similar to node's `basename` function.
 *
 * @param path The path to get the last part.
 * @param suffix An optional extension to remove from the item, like an extension.
 */
export function basename(path: string, suffix?: string) {
	const segments = pathToSegments(path);
	const lastSegment = segments.at(-1) ?? '';

	if (suffix && lastSegment.endsWith(suffix)) {
		return lastSegment.slice(0, -suffix.length);
	}

	return lastSegment;
}

/**
 * Returns the extension of the path, from the last occurrence of the `.` (dot) to the end of the string.
 * Returns an empty string if there is no dot or if the only dot is in the start of the string.
 * It is similar to node's `extname` function.
 *
 * @param path The path to get the extension
 */
export function extname(path: string) {
	const base = basename(path);
	const index = base.lastIndexOf('.');

	if (index <= 0) {
		return '';
	}

	return base.slice(index);
}

/**
 * Resolves a sequence of paths or path segments into an absolute path.
 * It is similar to node's `resolve` function.
 *
 * **Note**: If no absolute path is provided, the function prepends a `/`. It assumes the starting point is _always_ the file system root.
 *
 * @param paths A sequence of paths or path segments
 */
export function resolve(...paths: string[]) {
	// INfO: start by concatenating all paths
	let fullPath = '';
	for (const path of paths) {
		if (path.startsWith('/')) {
			fullPath = path;
		} else {
			fullPath = fullPath ? `${fullPath}/${path}` : path;
		}
	}

	// INFO: prepend initial dash
	if (!fullPath.startsWith('/')) {
		fullPath = `/${fullPath}`;
	}

	// INFO: resolve `..`, `.`, and empty segments
	const stack: string[] = [];
	const segments = pathToSegments(fullPath);

	for (const segment of segments) {
		if (segment === '..') {
			stack.pop();
		} else if (segment !== '.' && segment !== '') {
			stack.push(segment);
		}
	}

	return `/${stack.join('/')}`;
}

const RESTRICTED_NAMES = [
	'CON',
	'PRN',
	'AUX',
	'NUL',
	'COM1',
	'COM2',
	'COM3',
	'COM4',
	'COM5',
	'COM6',
	'COM7',
	'COM8',
	'COM9',
	'LPT1',
	'LPT2',
	'LPT3',
	'LPT4',
	'LPT5',
	'LPT6',
	'LPT7',
	'LPT8',
	'LPT9'
];

const RESTRICTED_CHARACTERS = [
	// INFO: C0 control characters
	// oxlint-disable-next-line no-magic-numbers
	...new Array(32).fill('').map((_, i) => String.fromCharCode(i)),
	// INFO: "del" character
	'\x7f',
	// INFO: C1 control characters
	// oxlint-disable-next-line no-magic-numbers
	...new Array(32).fill('').map((_, i) => String.fromCharCode(128 + i)),
	// INFO: characters not allowed on Windows/Linux/Mac
	...['*', '"', '/', '\\', '>', '<', ':', '|', '?'],
	// INFO: also add "%" to make it easier to decode lone "%" symbols
	'%'
];

function defaultReplacer(segment: string) {
	if (segment === '.') {
		return '%2e';
	}

	if (segment === '..') {
		return '%2e%2e';
	}

	if (RESTRICTED_NAMES.includes(segment)) {
		// oxlint-disable-next-line typescript/no-misused-spread
		return [...segment].map((char) => `%${char.charCodeAt(0).toString(16)}`).join('');
	}

	// oxlint-disable-next-line typescript/no-misused-spread
	const codePoints = [...segment];
	let normalizedSegment = '';

	for (const codePoint of codePoints) {
		if (RESTRICTED_CHARACTERS.includes(codePoint)) {
			normalizedSegment += `%${codePoint.charCodeAt(0).toString(16)}`;
		} else {
			normalizedSegment += codePoint;
		}
	}

	return normalizedSegment.trim();
}

/**
 * Encodes a path string, taking care of restricted characters and names.
 *
 * @param path The path to normalize.
 * @param replacer A custom replacer function that will be invoked for each segment of the path.
 */
export function encodePath(path: string, replacer?: (segment: string) => string) {
	const segments = pathToSegments(path);

	return segments.map((segment) => (replacer ?? defaultReplacer)(segment)).join('/');
}

// TODO: add decode path function
