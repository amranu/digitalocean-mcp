import type { DOEndpoint } from './types.js';
export declare function loadEndpoints(): DOEndpoint[];
export declare function findEndpoint(operationId: string): DOEndpoint | undefined;
export declare function searchEndpoints(query: string): DOEndpoint[];
export declare function getEndpointsByTag(tag: string): DOEndpoint[];
export declare function getAllTags(): string[];
//# sourceMappingURL=endpoints.d.ts.map