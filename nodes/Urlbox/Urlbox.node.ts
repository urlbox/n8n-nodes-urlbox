import {
    ApplicationError,
    IExecuteFunctions,
    type INodeExecutionData,
    type INodeType,
    type INodeTypeDescription, NodeParameterValueType, NodeConnectionTypes
} from 'n8n-workflow';

export class Urlbox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Screenshots by Urlbox',
		name: 'urlbox',
		icon: 'file:../../icons/urlbox.svg',
		group: ['transform'],
		version: 1,
		description: 'Generate full page screenshots, video recordings, scrape HTML or Markdown, convert to PDF, and more.',
		defaults: {
			name: 'Urlbox',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
        usableAsTool: true,
		credentials: [
			{
				name: 'urlboxApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Render',
						value: 'render',
					},
				],
				default: 'render',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['render'],
					},
				},
				options: [
					{
						name: 'Convert to PDF',
						value: 'pdf',
						description: 'Convert the website to PDF',
						action: 'Convert website to PDF',
					},
					{
						name: 'Full Page Screenshot',
						value: 'fullpage_png',
						description: 'Capture the entire page as PNG',
						action: 'Take full page screenshot',
					},
					{
						name: 'Mobile Full Page Screenshot',
						value: 'mobile_png',
						description: 'Capture the entire page in mobile view as a PNG',
						action: 'Take mobile full page screenshot',
					},
					{
						name: 'Scrape HTML',
						value: 'scrape_html',
						description: 'Capture the HTML of a page',
						action: 'Scrape HTML from page',
					},
					{
						name: 'Scrape Markdown',
						value: 'scrape_markdown',
						description: 'Capture the Markdown of a page',
						action: 'Scrape markdown from page',
					},
					{
						name: 'Smooth Scrolling Video',
						value: 'scrolling_video',
						description: 'Records the website as a full page MP4, scrolling smoothly down the page',
						action: 'Record smooth scrolling video',
					},
					{
						name: 'Take Screenshot (PNG)',
						value: 'screenshot_png',
						description: 'Capture a standard PNG screenshot',
						action: 'Take screenshot',
					},
				],
				default: 'screenshot_png',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The website URL to render',
				placeholder: 'https://example.com',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Option',
				default: {
					cleanShot: true,
					downloadAsFile: true
				},
				options: [
					{
						displayName: 'Clean Shot',
						name: 'cleanShot',
						type: 'boolean',
						default: true,
						description: 'Whether to hide any ads, cookie banners, and auto-accept cookie consent prompts',
					},
					{
						displayName: 'Custom Options (JSON)',
						name: 'customOptions',
						type: 'json',
						default: '{}',
						description: 'Additional Urlbox API options as JSON (will overwrite any template options)',
						placeholder: '{ "width": 1920, "height": 1080, "delay": 2000 }',
					},
					{
						displayName: 'Download As File',
						name: 'downloadAsFile',
						type: 'boolean',
						default: true,
						description: 'Whether to download the rendered output as a binary file instead of returning a URL',
					},
					{
						displayName: 'Render HTML Content',
						name: 'html',
						type: 'string',
						typeOptions: {
							editor: 'htmlEditor',
						},
						default: '',
						description: 'The HTML to render if not a URL. Passing HTML here will overwrite any URL above.',
						placeholder: '<h1> Hello, World! </h1>',
					},
					{
						displayName: 'Use a Proxy Server',
						name: 'proxy',
						type: 'string',
						default: '',
						description: 'Optional proxy URL to bypass regional blocking (e.g., socks5://user:pass@proxy.example.com:1080)',
						placeholder: 'brd-customer...:username@brd.superproxy.io:12345',
					},
				],
			},
            {
                displayName: 'For full API documentation and advanced options you can pass as JSON, take a look at our <a href="https://urlbox.com/docs" target="_blank">Docs</a>.',
                name: 'notice',
                type: 'notice',
                default: '',
            },
            {
                displayName: 'Need to take many screenshots at once? Try our new product <a href="https://capturedeck.com/" target="_blank">Capture Deck</a>.',
                name: 'captureDeckNotice',
                type: 'notice',
                default: '',
            },
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i);
				const url = this.getNodeParameter('url', i);
				const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
					html?: string;
					proxy?: string;
					cleanShot?: boolean;
					downloadAsFile?: boolean;
					additionalOptions?: string | object;
				};

				const html = additionalFields.html;
				const proxy = additionalFields.proxy;
				const cleanShot = additionalFields.cleanShot !== undefined ? additionalFields.cleanShot : true;
				const downloadAsFile = additionalFields.downloadAsFile !== undefined ? additionalFields.downloadAsFile : true;

				// Parse additional options JSON
				const additionalOptionsParam = additionalFields.additionalOptions || '{}';
				let additionalOptions = {};
				if (typeof additionalOptionsParam !== 'object') {
					additionalOptions = JSON.parse(additionalOptionsParam);
				} else {
					additionalOptions = additionalOptionsParam || additionalOptions;
				}

                type UrlboxOptions = {
                    url?: object | NodeParameterValueType;
                    html?: object | NodeParameterValueType;
                    format?: 'png' | 'md' | 'pdf' | 'mp4' | 'html';
                    full_page?: boolean;
                    device?: string;
                    block_ads?: boolean;
                    hide_cookie_banners?: boolean;
                    click_accept?: boolean;
                    response_type?: string;
                    user_agent?: string;
                    width?: number;
                    video_scroll?: boolean;
                    proxy?: object | NodeParameterValueType;
                };

				// Build options based on the template
                if (!url && !html) {
                    throw new ApplicationError('URL or HTML must be provided.')
                }
				const options: UrlboxOptions = { url };

				// Extract format for later use
				let format = 'png';

				switch (operation) {
					case 'screenshot_png':
						options.format = 'png';
						format = 'png';
						break;
                    case 'scrape_markdown':
                        options.format = 'md';
                        format = 'md';
                        break;
                    case 'scrape_html':
                        options.format = 'html';
                        format = 'html';
                        break;
					case 'fullpage_png':
						options.format = 'png';
						options.full_page = true;
						format = 'png';
						break;
					case 'mobile_png':
						options.format = 'png';
						options.user_agent = 'mobile';
                        options.full_page = true;
                        options.width = 375;
                        format = 'png';
						break;
					case 'pdf':
						options.format = 'pdf';
						format = 'pdf';
						break;
                    case 'scrolling_video':
                        options.format = 'mp4';
                        options.full_page = true;
                        options.video_scroll = true;
                        format = 'mp4';
                        break;
				}

				if (proxy) {
					options.proxy = proxy;
				}

				if (cleanShot) {
					options.block_ads = true;
					options.hide_cookie_banners = true;
					options.click_accept = true;
				}

				if (downloadAsFile) {
					options.response_type = 'binary';
				}

                if (html) {
                    options.html = html;
                    options.url = undefined;
                }

                // LAST - Merge additional options (user-provided JSON overrides template defaults)
                Object.assign(options, additionalOptions);

                const response = await this.helpers.httpRequestWithAuthentication.call(
                    this,
                    'urlboxApi',
                    {
                        method: 'POST',
                        url: 'https://api.urlbox.com/v1/render/sync',
                        body: options,
                        json: !downloadAsFile, // Don't parse as JSON if we expect binary
                        encoding: downloadAsFile ? 'arraybuffer' : 'json', // Get buffer for binary
                    },
                )

				// Handle binary vs JSON response
				if (downloadAsFile) {
					// Response is binary data - prepare it as a file
					const mimeTypes: Record<string, string> = {
						png: 'image/png',
                        html: 'text/html',
                        md: 'text/markdown',
						jpg: 'image/jpeg',
						pdf: 'application/pdf',
						mp4: 'video/mp4',
					};

					const binaryData = await this.helpers.prepareBinaryData(
						response,
						`urlbox-${operation}.${format}`,
						mimeTypes[format] || 'application/octet-stream',
					);

					returnData.push({
						json: {},
						binary: { data: binaryData },
						pairedItem: { item: i },
					});
				} else {
					// Response is JSON with renderUrl
					returnData.push({
						json: response,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.response?.body || error.message },
						pairedItem: { item: i },
					});
					continue;
				}
                throw error;
			}
		}

		return [returnData];
	}
}
