import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class UrlboxApi implements ICredentialType {
	name = 'urlboxApi';

	displayName = 'Urlbox API';

	icon: Icon = 'file:urlbox.svg';

	documentationUrl = 'https://urlbox.com/docs/api#authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
                // TODO why is there an equals here? is that an n8n convention?
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.urlbox.com/v1',
			url: '/render/sync',
			method: 'POST',
			body: {
				url: 'https://example.com',
				format: 'png',
			},
		},
	};
}
