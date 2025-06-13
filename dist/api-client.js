import axios from 'axios';
export class DigitalOceanApiClient {
    client;
    config;
    constructor(config) {
        this.config = config;
        this.client = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async callEndpoint(endpoint, params = {}) {
        const url = this.buildUrl(endpoint.path, params);
        const requestConfig = {
            method: endpoint.method,
            url,
        };
        // Add query parameters
        const queryParams = {};
        const bodyParams = {};
        endpoint.parameters.forEach(param => {
            if (params[param.name] !== undefined) {
                if (param.in === 'query') {
                    queryParams[param.name] = params[param.name];
                }
                else if (param.in === 'body' || param.in === 'formData') {
                    bodyParams[param.name] = params[param.name];
                }
            }
        });
        if (Object.keys(queryParams).length > 0) {
            requestConfig.params = queryParams;
        }
        if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && Object.keys(bodyParams).length > 0) {
            requestConfig.data = bodyParams;
        }
        try {
            const response = await this.client.request(requestConfig);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
            }
            throw error;
        }
    }
    buildUrl(path, params) {
        let url = path;
        // Replace path parameters
        Object.keys(params).forEach(key => {
            const placeholder = `{${key}}`;
            if (url.includes(placeholder)) {
                url = url.replace(placeholder, encodeURIComponent(String(params[key])));
            }
        });
        return url;
    }
}
//# sourceMappingURL=api-client.js.map