import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { DOEndpoint } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cachedEndpoints: DOEndpoint[] | null = null;

export function loadEndpoints(): DOEndpoint[] {
  if (cachedEndpoints) {
    return cachedEndpoints;
  }

  try {
    const endpointsPath = join(__dirname, '..', 'digitalocean_endpoints.json');
    const data = readFileSync(endpointsPath, 'utf-8');
    cachedEndpoints = JSON.parse(data) as DOEndpoint[];
    return cachedEndpoints;
  } catch (error) {
    console.error('Failed to load endpoints:', error);
    return [];
  }
}

export function findEndpoint(operationId: string): DOEndpoint | undefined {
  const endpoints = loadEndpoints();
  return endpoints.find(ep => ep.operationId === operationId);
}

export function searchEndpoints(query: string): DOEndpoint[] {
  const endpoints = loadEndpoints();
  const lowercaseQuery = query.toLowerCase();
  
  return endpoints.filter(ep => 
    ep.operationId.toLowerCase().includes(lowercaseQuery) ||
    ep.summary.toLowerCase().includes(lowercaseQuery) ||
    ep.description.toLowerCase().includes(lowercaseQuery) ||
    ep.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getEndpointsByTag(tag: string): DOEndpoint[] {
  const endpoints = loadEndpoints();
  return endpoints.filter(ep => ep.tags.includes(tag));
}

export function getAllTags(): string[] {
  const endpoints = loadEndpoints();
  const tags = new Set<string>();
  endpoints.forEach(ep => ep.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}