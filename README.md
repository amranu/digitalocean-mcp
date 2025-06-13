# DigitalOcean MCP Server

A Model Context Protocol (MCP) server that provides access to all DigitalOcean API endpoints dynamically extracted from their OpenAPI specification.

## Features

- **Dynamic endpoint discovery**: Automatically extracts 471+ endpoints from DigitalOcean's OpenAPI spec
- **Search and filter**: Find endpoints by operation ID, summary, description, or tags
- **Detailed endpoint information**: Get parameter details, descriptions, and requirements
- **Direct API calls**: Execute API calls through the MCP server with proper authentication
- **Tag-based organization**: Browse endpoints by category (Droplets, Load Balancers, etc.)

## Installation

```bash
npm install
npm run build
```

## Usage

### Configure API Access

First, configure your DigitalOcean API token:

```typescript
// Use the configure_digitalocean_api tool
{
  "tool": "configure_digitalocean_api",
  "arguments": {
    "token": "your-digitalocean-api-token"
  }
}
```

### Available Tools

1. **configure_digitalocean_api** - Set up API credentials
2. **list_endpoints** - List all available endpoints (with optional tag filtering)
3. **search_endpoints** - Search endpoints by query
4. **get_endpoint_details** - Get detailed information about a specific endpoint
5. **call_digitalocean_api** - Execute API calls
6. **list_tags** - Show all available endpoint categories

### Examples

#### List Droplet-related endpoints:
```typescript
{
  "tool": "list_endpoints",
  "arguments": {
    "tag": "Droplets",
    "limit": 10
  }
}
```

#### Search for load balancer endpoints:
```typescript
{
  "tool": "search_endpoints",
  "arguments": {
    "query": "load balancer",
    "limit": 5
  }
}
```

#### Get details about a specific endpoint:
```typescript
{
  "tool": "get_endpoint_details",
  "arguments": {
    "operationId": "droplets_list"
  }
}
```

#### Call an API endpoint:
```typescript
{
  "tool": "call_digitalocean_api",
  "arguments": {
    "operationId": "droplets_list",
    "parameters": {
      "per_page": 5,
      "page": 1
    }
  }
}
```

## Architecture

- **extract_endpoints.py**: Python script that parses the OpenAPI spec and extracts endpoint definitions
- **src/endpoints.ts**: TypeScript module for loading and searching endpoint data
- **src/api-client.ts**: HTTP client for making authenticated API calls
- **src/index.ts**: Main MCP server implementation

## API Coverage

The server provides access to all DigitalOcean API endpoints across categories including:

- 1-Click Applications
- Account Management
- Billing
- Block Storage Volumes
- CDN Endpoints
- Certificates
- Container Registry
- Databases
- Domains and DNS
- Droplets
- Firewalls
- Floating IPs
- Images
- Kubernetes
- Load Balancers
- Monitoring
- Projects
- Reserved IPs
- Snapshots
- SSH Keys
- Tags
- VPCs
- And more...

## Development

To regenerate the endpoint data:

```bash
python extract_endpoints.py
```

To rebuild the server:

```bash
npm run build
```

## Configuration in Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "digitalocean": {
      "command": "node",
      "args": ["/path/to/digitalocean-mcp/dist/index.js"]
    }
  }
}
```