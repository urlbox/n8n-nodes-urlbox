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

	icon: Icon = 'file:../icons/urlbox.svg';

	documentationUrl = 'https://urlbox.com/docs/api#authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'Secret Key',
			name: 'secretKey',
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
				Authorization: '=Bearer {{$credentials.secretKey}}',
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
