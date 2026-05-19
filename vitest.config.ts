// oxlint-env node

import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import type { BrowserInstanceOption } from 'vitest/node';

// oxlint-disable-next-line import/no-default-export
export default defineConfig(() => ({
	test: {
		browser: {
			enabled: true,
			provider: playwright(),
			// https://vitest.dev/config/browser/playwright
			instances: [
				// oxlint-disable-next-line typescript/consistent-type-assertions
				{ browser: 'chromium' } as BrowserInstanceOption
			]
		}
	}
}));
