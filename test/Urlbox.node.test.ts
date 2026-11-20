import { describe, expect, it, vi } from 'vitest';
import { NodeOperationError, type IExecuteFunctions } from 'n8n-workflow';
import { Urlbox } from '../nodes/Urlbox/Urlbox.node';

// Builds a minimal IExecuteFunctions stub. The Urlbox API request is mocked,
// so no renders are made.
function createContext(parameters: Record<string, unknown>) {
	const httpRequestWithAuthentication = vi.fn().mockResolvedValue({
		renderUrl: 'https://renders.urlbox.com/example.png',
		size: 1,
	});

	const context = {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name: string, _itemIndex: number, fallback?: unknown) =>
			name in parameters ? parameters[name] : fallback,
		getNode: () => ({
			id: 'urlbox-node',
			name: 'Urlbox',
			type: '@urlbox/n8n-nodes-urlbox.urlbox',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication,
			prepareBinaryData: vi.fn(),
		},
	};

	return { context: context as unknown as IExecuteFunctions, httpRequestWithAuthentication };
}

async function run(additionalFields: Record<string, unknown>) {
	const { context, httpRequestWithAuthentication } = createContext({
		operation: 'screenshot_png',
		url: 'https://example.com',
		additionalFields: { downloadAsFile: false, ...additionalFields },
	});

	const output = await new Urlbox().execute.call(context);
	const body = httpRequestWithAuthentication.mock.calls[0]?.[1]?.body;

	return { output, body };
}

describe('Urlbox node custom options (JSON)', () => {
	it('sends custom options given as a JSON string', async () => {
		const { body } = await run({ customOptions: '{"show_timestamp": true}' });

		expect(body).toMatchObject({ url: 'https://example.com', show_timestamp: true });
	});

	it('sends custom options given as an object', async () => {
		const { body } = await run({ customOptions: { show_timestamp: true } });

		expect(body).toMatchObject({ show_timestamp: true });
	});

	it('lets custom options override the template defaults', async () => {
		const { body } = await run({ customOptions: '{"format": "jpg", "width": 1920}' });

		expect(body).toMatchObject({ format: 'jpg', width: 1920 });
	});

	it('sends only the template options when custom options are left empty', async () => {
		const { body } = await run({ customOptions: '{}' });

		expect(body).toEqual({
			url: 'https://example.com',
			format: 'png',
			block_ads: true,
			hide_cookie_banners: true,
			click_accept: true,
		});
	});

	it('throws a NodeOperationError for invalid JSON', async () => {
		const promise = run({ customOptions: '{"show_timestamp": true' });

		await expect(promise).rejects.toBeInstanceOf(NodeOperationError);
		await expect(promise).rejects.toThrow(/Custom Options \(JSON\)/);
	});

	it('throws a NodeOperationError when the JSON is not an object', async () => {
		const promise = run({ customOptions: '["show_timestamp"]' });

		await expect(promise).rejects.toBeInstanceOf(NodeOperationError);
	});
});
