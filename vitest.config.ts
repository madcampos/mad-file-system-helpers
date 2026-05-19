// oxlint-env node

import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// @ts-expect-error
// oxlint-disable-next-line import/no-default-export
export default defineConfig(() => ({
	test: {
		reporters: ['default'],
		coverage: {
			provider: 'v8',
			enabled: true
		},
		browser: {
			enabled: true,
			provider: playwright(),
			// https://vitest.dev/config/browser/playwright
			instances: [
				{ browser: 'chromium' }
			],
			ui: false,
			headless: true
		}
	}
}));
