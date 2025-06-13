export interface DOEndpoint {
    path: string;
    method: string;
    operationId: string;
    summary: string;
    description: string;
    tags: string[];
    parameters: DOParameter[];
}
export interface DOParameter {
    name: string;
    in: string;
    required: boolean;
    description: string;
    type: string;
}
export interface DOApiConfig {
    token: string;
    baseUrl: string;
}
//# sourceMappingURL=types.d.ts.map