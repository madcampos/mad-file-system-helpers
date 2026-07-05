#!/usr/bin/env node
// oxlint-disable no-await-in-loop

/// <reference types="@types/node" />

import { mkdir, readdir, truncate, writeFile } from 'node:fs/promises';
import { basename, dirname, join, normalize } from 'node:path/posix';
import { generateDocumentation } from 'tsdoc-markdown';

const files = (await readdir('src', { recursive: true }))
	.filter((file) => !file.endsWith('.test.ts') && file.endsWith('.ts'));

const docFiles: { title: string, doc: string }[] = [];

for (const file of files) {
	const srcPath = normalize(join('src', file));

	const docName = `${basename(file, '.ts')}.md`;
	const docDir = join('docs', dirname(file));
	const docPath = normalize(join(docDir, docName));

	await mkdir(docDir, { recursive: true });

	const docTemplate = /* md */ `# \`${docName}\`
<!-- TSDOC_START --><!-- TSDOC_END -->
`;

	await truncate(docPath);
	await writeFile(docPath, docTemplate, { flush: true, flag: 'a' });

	generateDocumentation({
		inputFiles: [srcPath],
		outputFile: docPath,
		buildOptions: { types: true },
		markdownOptions: { emoji: null }
	});

	docFiles.push({
		title: basename(file),
		doc: normalize(join(dirname(file), docName))
	});
}

const apiIndex = /* md */ `# API Docs

${docFiles.map(({ title, doc }) => `- [${title}](${doc})`).join('\n')}
`;

await truncate('docs/api.md');
await writeFile('docs/api.md', apiIndex, { flush: true, flag: 'w' });
