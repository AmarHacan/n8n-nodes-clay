import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { IHttpRequestOptions, IHttpRequestMethods } from 'n8n-workflow';

export class GetWorkbookList implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Get Workbook List',
		name: 'getWorkbookList',
		group: ['transform'],
		version: 1,
		description: 'Interact with Clay API',
		defaults: {
			name: 'Get Workbook List',
		},
		inputs: ['main' as NodeConnectionType],
		outputs: ['main' as NodeConnectionType],
		properties: [
			{
				displayName: 'Workspace ID',
				name: 'workspaceId',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Cookie',
				name: 'cookie',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const workspaceId = this.getNodeParameter('workspaceId', i) as string;
			const cookie = this.getNodeParameter('cookie', i) as string;

			const options: IHttpRequestOptions = {
				method: 'POST' as IHttpRequestMethods,
				url: `https://api.clay.com/v3/workspaces/${workspaceId}/resources_v2/`,
				headers: {
					'Content-Type': 'application/json',
					Cookie: cookie,
				},
				body: {
					filters: {
						resourceTypes: ['WORKBOOK'],
					},
				},
				json: true,
			};

			try {
				const responseData = await this.helpers.request(options);
				returnData.push({ json: responseData });
			} catch (error) {
				throw new NodeApiError(this.getNode(), error, {
					message: error.message ?? 'Unknown error',
					description: error.description ?? 'Clay API request failed',
				});
			}
		}

		return [returnData];
	}
}
