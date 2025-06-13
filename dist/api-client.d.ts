import type { DOApiConfig, DOEndpoint } from './types.js';
export declare class DigitalOceanApiClient {
    private client;
    private config;
    constructor(config: DOApiConfig);
    callEndpoint(endpoint: DOEndpoint, params?: Record<string, any>): Promise<any>;
    private buildUrl;
}
//# sourceMappingURL=api-client.d.ts.map