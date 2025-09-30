import {
    IExecuteFunctions,
    type INodeExecutionData,
    type INodeType,
    type INodeTypeDescription,
} from 'n8n-workflow';

export class Urlbox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Urlbox',
		name: 'urlbox',
		icon: 'file:urlbox.svg',
		group: ['transform'],
		version: 1,
		description: 'Generate screenshots, PDFs, and recordings of websites',
		defaults: {
			name: 'Urlbox',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'urlboxApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.urlbox.com/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Template',
				name: 'template',
				type: 'options',
				options: [
                    {
                        name: 'Convert to MP4 (Screen Recording)',
                        value: 'mp4',
                        description: 'Record the website as MP4 video',
                    },
                    {
                        name: 'Convert to PDF',
                        value: 'pdf',
                        description: 'Convert the website to PDF',
                    },
					{
						name: 'Full Page Screenshot (PNG)',
						value: 'fullpage_png',
						description: 'Capture the entire page as PNG',
					},
                    {
                        name: 'Mobile Screenshot (PNG)',
                        value: 'mobile_png',
                        description: 'Capture a mobile view screenshot',
                    },
                    {
                        name: 'Smooth Scrolling Video',
                        value: 'scrolling_video',
                        description: 'Records the website as a full page video, scrolling smoothly down the page',
                    },
                    {
						name: 'Take Screenshot (PNG)',
						value: 'screenshot_png',
						description: 'Capture a standard PNG screenshot',
					},
					{
						name: 'Thumbnail Screenshot (JPG)',
						value: 'thumbnail_jpg',
						description: 'Capture a thumbnail JPG screenshot',
					},
				],
				default: 'screenshot_png',
				description: 'The type of render to perform',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				description: 'The website URL to render',
				placeholder: 'https://example.com',
			},
			{
				displayName: 'Proxy URL',
				name: 'proxy',
				type: 'string',
				default: '',
				description: 'Optional proxy URL to bypass regional blocking (e.g., socks5://user:pass@proxy.example.com:1080)',
				placeholder: 'socks5://proxy.example.com:1080',
			},
			{
				displayName: 'Clean Shot',
				name: 'cleanShot',
				type: 'boolean',
				default: true,
				description: 'Whether to hide any ads, cookie banners, and auto-accept cookie consent prompts',
			},
			{
				displayName: 'Download As File',
				name: 'downloadAsFile',
				type: 'boolean',
				default: true,
				description: 'Whether to download the rendered output as a binary file instead of returning a URL',
			},
			{
				displayName: 'Additional Options (JSON)',
				name: 'additionalOptions',
				type: 'json',
				default: '{}',
				description: 'Additional Urlbox API options as JSON (will be merged with template options)',
				placeholder: '{ "width": 1920, "height": 1080, "delay": 2000 }',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
                // TODO remove typecasting where possible :)
				const template = this.getNodeParameter('template', i) as string;
				const url = this.getNodeParameter('url', i) as string;
				const proxy = this.getNodeParameter('proxy', i) as string;
				const cleanShot = this.getNodeParameter('cleanShot', i) as boolean;
				const downloadAsFile = this.getNodeParameter('downloadAsFile', i) as boolean;

				// Parse additional options JSON
				const additionalOptionsParam = this.getNodeParameter('additionalOptions', i, '{}');
				let additionalOptions = {};
				if (typeof additionalOptionsParam !== 'object') {
					additionalOptions = JSON.parse(additionalOptionsParam as string);
				} else {
					additionalOptions = additionalOptionsParam || additionalOptions;
				}

                type UrlboxOptions = {
                    url: string;
                    format?: 'png' | 'jpg' | 'pdf' | 'mp4';
                    full_page?: boolean;
                    device?: string;
                    block_ads?: boolean;
                    hide_cookie_banners?: boolean;
                    click_accept?: boolean;
                    response_type?: string;
                    user_agent?: string;
                    width?: number;
                    video_scroll?: boolean;
                    proxy?: string;
                };

				// Build options based on the template
				const options: UrlboxOptions = { url };

				// Extract format for later use
				let format = 'png';

				switch (template) {
					case 'screenshot_png':
						options.format = 'png';
						format = 'png';
						break;
					case 'thumbnail_jpg':
						options.format = 'jpg';
						format = 'jpg';
						break;
					case 'fullpage_png':
						options.format = 'png';
						options.full_page = true;
						format = 'png';
						break;
					case 'mobile_png':
						options.format = 'png';
						options.user_agent = 'mobile';
                        options.width = 375;
                        format = 'png';
						break;
					case 'pdf':
						options.format = 'pdf';
						format = 'pdf';
						break;
					case 'mp4':
						options.format = 'mp4';
						format = 'mp4';
						break;
                    case 'scrolling_video':
                        options.format = 'mp4';
                        options.full_page = true;
                        options.video_scroll = true;
                        format = 'mp4';
                        break;
				}

				// Apply proxy if provided
				if (proxy) {
					options.proxy = proxy;
				}

				// Apply clean shot options if enabled
				if (cleanShot) {
					options.block_ads = true;
					options.hide_cookie_banners = true;
					options.click_accept = true;
				}

				// Merge additional options (user-provided JSON overrides template defaults)
				Object.assign(options, additionalOptions);

				// If user wants to download as file, set response_type to binary
				if (downloadAsFile) {
					options.response_type = 'binary';
				}

				// Debug logging
				console.log('=== Urlbox Node Debug ===');
				console.log('Template:', template);
				console.log('URL:', url);
				console.log('Options:', JSON.stringify(options, null, 2));
				console.log('Download as file:', downloadAsFile);

				// Make API request
				// const response = await this.helpers.requestWithAuthentication.call(
                const response = await this.helpers.httpRequestWithAuthentication.call(
                    this,
                    'urlboxApi',
                    {
                        method: 'POST',
                        url: 'https://api.urlbox.com/v1/render/sync',
                        body: options,
                        json: !downloadAsFile, // Don't parse as JSON if we expect binary
                        // encoding: downloadAsFile ? null : undefined, // Get buffer for binary
                        encoding: downloadAsFile ? 'arraybuffer' : 'json', // Get buffer for binary
                    },
                )

				// Handle binary vs JSON response
				if (downloadAsFile) {
					// Response is binary data - prepare it as a file
					const mimeTypes: Record<string, string> = {
						png: 'image/png',
						jpg: 'image/jpeg',
						pdf: 'application/pdf',
						mp4: 'video/mp4',
					};

					const binaryData = await this.helpers.prepareBinaryData(
						response as Buffer,
						`urlbox-${template}.${format}`,
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
						json: response as any,
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
                console.log("error")
                console.error(error.message)
                // throw new NodeOperationError()
				// throw new NodeOperationError(this, error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
