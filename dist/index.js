#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { loadEndpoints, findEndpoint, searchEndpoints, getEndpointsByTag, getAllTags } from './endpoints.js';
import { DigitalOceanApiClient } from './api-client.js';
class DigitalOceanMCPServer {
    server;
    apiClient = null;
    constructor() {
        this.server = new Server({
            name: 'digitalocean-mcp',
            version: '1.0.0',
        });
        this.initializeApiClient();
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    initializeApiClient() {
        const token = process.env.DIGITALOCEAN_API_TOKEN;
        if (token) {
            const config = {
                token,
                baseUrl: process.env.DIGITALOCEAN_API_BASE_URL || 'https://api.digitalocean.com'
            };
            this.apiClient = new DigitalOceanApiClient(config);
        }
    }
    setupErrorHandling() {
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'configure_digitalocean_api',
                        description: 'Configure DigitalOcean API credentials. Can be auto-configured from DIGITALOCEAN_API_TOKEN environment variable.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                    description: 'DigitalOcean API token',
                                },
                                baseUrl: {
                                    type: 'string',
                                    description: 'API base URL (default: https://api.digitalocean.com)',
                                    default: 'https://api.digitalocean.com',
                                },
                            },
                            required: ['token'],
                        },
                    },
                    {
                        name: 'list_endpoints',
                        description: 'List all available DigitalOcean API endpoints',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                tag: {
                                    type: 'string',
                                    description: 'Filter by tag (optional)',
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Limit number of results',
                                    default: 50,
                                },
                            },
                            required: [],
                        },
                    },
                    {
                        name: 'search_endpoints',
                        description: 'Search for DigitalOcean API endpoints',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'Search query',
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Limit number of results',
                                    default: 20,
                                },
                            },
                            required: ['query'],
                        },
                    },
                    {
                        name: 'get_endpoint_details',
                        description: 'Get detailed information about a specific endpoint',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                operationId: {
                                    type: 'string',
                                    description: 'Operation ID of the endpoint',
                                },
                            },
                            required: ['operationId'],
                        },
                    },
                    {
                        name: 'call_digitalocean_api',
                        description: 'Call a DigitalOcean API endpoint',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                operationId: {
                                    type: 'string',
                                    description: 'Operation ID of the endpoint to call',
                                },
                                parameters: {
                                    type: 'object',
                                    description: 'Parameters for the API call',
                                    additionalProperties: true,
                                },
                            },
                            required: ['operationId'],
                        },
                    },
                    {
                        name: 'list_tags',
                        description: 'List all available endpoint tags',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: [],
                        },
                    },
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args = {} } = request.params;
            try {
                switch (name) {
                    case 'configure_digitalocean_api':
                        return await this.handleConfigureApi(args);
                    case 'list_endpoints':
                        return await this.handleListEndpoints(args);
                    case 'search_endpoints':
                        return await this.handleSearchEndpoints(args);
                    case 'get_endpoint_details':
                        return await this.handleGetEndpointDetails(args);
                    case 'call_digitalocean_api':
                        return await this.handleCallApi(args);
                    case 'list_tags':
                        return await this.handleListTags();
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${errorMessage}`,
                        },
                    ],
                };
            }
        });
    }
    async handleConfigureApi(args) {
        const { token, baseUrl = 'https://api.digitalocean.com' } = args;
        if (!token) {
            throw new Error('API token is required');
        }
        const config = { token, baseUrl };
        this.apiClient = new DigitalOceanApiClient(config);
        return {
            content: [
                {
                    type: 'text',
                    text: 'DigitalOcean API configured successfully',
                },
            ],
        };
    }
    async handleListEndpoints(args) {
        const { tag, limit = 50 } = args;
        let endpoints = tag ? getEndpointsByTag(tag) : loadEndpoints();
        endpoints = endpoints.slice(0, limit);
        const endpointList = endpoints.map(ep => `• ${ep.method} ${ep.path} - ${ep.summary} (${ep.operationId})`).join('\n');
        return {
            content: [
                {
                    type: 'text',
                    text: `Found ${endpoints.length} endpoints:\n\n${endpointList}`,
                },
            ],
        };
    }
    async handleSearchEndpoints(args) {
        const { query, limit = 20 } = args;
        const endpoints = searchEndpoints(query).slice(0, limit);
        const endpointList = endpoints.map(ep => `• ${ep.method} ${ep.path} - ${ep.summary} (${ep.operationId})`).join('\n');
        return {
            content: [
                {
                    type: 'text',
                    text: `Found ${endpoints.length} endpoints matching "${query}":\n\n${endpointList}`,
                },
            ],
        };
    }
    async handleGetEndpointDetails(args) {
        const { operationId } = args;
        const endpoint = findEndpoint(operationId);
        if (!endpoint) {
            throw new Error(`Endpoint not found: ${operationId}`);
        }
        const paramsList = endpoint.parameters.length > 0
            ? endpoint.parameters.map(p => `  • ${p.name} (${p.in}): ${p.type} ${p.required ? '(required)' : '(optional)'} - ${p.description}`).join('\n')
            : '  None';
        const details = `
**${endpoint.method} ${endpoint.path}**

**Operation ID:** ${endpoint.operationId}

**Summary:** ${endpoint.summary}

**Description:** ${endpoint.description}

**Tags:** ${endpoint.tags.join(', ')}

**Parameters:**
${paramsList}
    `.trim();
        return {
            content: [
                {
                    type: 'text',
                    text: details,
                },
            ],
        };
    }
    async handleCallApi(args) {
        if (!this.apiClient) {
            throw new Error('API client not configured. Use configure_digitalocean_api first.');
        }
        const { operationId, parameters = {} } = args;
        const endpoint = findEndpoint(operationId);
        if (!endpoint) {
            throw new Error(`Endpoint not found: ${operationId}`);
        }
        const result = await this.apiClient.callEndpoint(endpoint, parameters);
        return {
            content: [
                {
                    type: 'text',
                    text: `API call successful:\n\n${JSON.stringify(result, null, 2)}`,
                },
            ],
        };
    }
    async handleListTags() {
        const tags = getAllTags();
        return {
            content: [
                {
                    type: 'text',
                    text: `Available tags:\n\n${tags.map(tag => `• ${tag}`).join('\n')}`,
                },
            ],
        };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('DigitalOcean MCP server running on stdio');
    }
}
const server = new DigitalOceanMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map