# DigitalOcean MCP Server

A Model Context Protocol (MCP) server that provides comprehensive access to all DigitalOcean API endpoints, dynamically extracted from their OpenAPI specification. This server enables AI assistants to interact with your DigitalOcean resources programmatically.

## Features

- **Complete API Coverage**: Access to 471+ DigitalOcean API endpoints across all services
- **Dynamic Endpoint Discovery**: Automatically extracts and indexes endpoints from DigitalOcean's OpenAPI spec
- **Intelligent Search**: Find endpoints by operation ID, summary, description, or tags
- **Detailed Documentation**: Get parameter details, descriptions, and requirements for each endpoint
- **Authenticated API Calls**: Execute API calls through the MCP server with proper authentication
- **Tag-based Organization**: Browse endpoints by category (Droplets, Load Balancers, Databases, etc.)
- **Auto-configuration**: Automatically configures from `DIGITALOCEAN_API_TOKEN` environment variable

## Quick Start

### Installation

```bash
npm install
npm run build
```

### Environment Setup

Create a `.env` file or set the environment variable:

```bash
export DIGITALOCEAN_API_TOKEN="your-digitalocean-api-token"
```

### Running the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## MCP Tools

The server provides these MCP tools for AI assistants:

### 1. **configure_digitalocean_api**
Set up API credentials (optional if using environment variable)

### 2. **list_endpoints**
List all available endpoints with optional filtering by tag

### 3. **search_endpoints** 
Search endpoints by query string

### 4. **get_endpoint_details**
Get detailed information about a specific endpoint

### 5. **call_digitalocean_api**
Execute API calls with authentication

### 6. **list_tags**
Show all available endpoint categories

## Usage Examples

### Basic Droplet Management

```typescript
// List all droplets
{
  "tool": "call_digitalocean_api",
  "arguments": {
    "operationId": "droplets_list"
  }
}

// Create a new droplet
{
  "tool": "call_digitalocean_api",
  "arguments": {
    "operationId": "droplets_create",
    "parameters": {
      "name": "example-droplet",
      "region": "nyc3",
      "size": "s-1vcpu-1gb",
      "image": "ubuntu-20-04-x64"
    }
  }
}
```

### Discovery and Search

```typescript
// Find all droplet-related endpoints
{
  "tool": "search_endpoints",
  "arguments": {
    "query": "droplet",
    "limit": 10
  }
}

// List endpoints by category
{
  "tool": "list_endpoints",
  "arguments": {
    "tag": "Load Balancers",
    "limit": 5
  }
}

// Get detailed endpoint information
{
  "tool": "get_endpoint_details",
  "arguments": {
    "operationId": "droplets_list"
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

## Claude Configuration

### Claude Desktop

Add to your Claude Desktop MCP configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "digitalocean": {
      "command": "node",
      "args": ["/path/to/digitalocean-mcp/dist/index.js"],
      "env": {
        "DIGITALOCEAN_API_TOKEN": "your-digitalocean-api-token"
      }
    }
  }
}
```

### Claude Code (CLI)

For Claude Code users, the server auto-configures from environment variables:

```bash
export DIGITALOCEAN_API_TOKEN="your-digitalocean-api-token"
claude-code
```

## Real-World Examples

### Infrastructure Management

```typescript
// Check droplet status across your infrastructure
{
  "tool": "call_digitalocean_api",
  "arguments": {
    "operationId": "droplets_list"
  }
}

// Scale a droplet
{
  "tool": "call_digitalocean_api",
  "arguments": {
    "operationId": "dropletActions_post",
    "parameters": {
      "droplet_id": "123456789",
      "type": "resize",
      "size": "s-2vcpu-4gb"
    }
  }
}
```

### Database Operations

```typescript
// List database clusters
{
  "tool": "call_digitalocean_api",
  "arguments": {
    "operationId": "databases_list_clusters"
  }
}

// Create database backup
{
  "tool": "call_digitalocean_api",
  "arguments": {
    "operationId": "databases_add_backup",
    "parameters": {
      "database_cluster_uuid": "your-cluster-uuid"
    }
  }
}
```

### Load Balancer Management

```typescript
// List load balancers
{
  "tool": "call_digitalocean_api",
  "arguments": {
    "operationId": "load_balancers_list"
  }
}

// Update load balancer configuration
{
  "tool": "call_digitalocean_api",
  "arguments": {
    "operationId": "load_balancers_update",
    "parameters": {
      "lb_id": "your-lb-id",
      "name": "updated-lb-name",
      "algorithm": "round_robin"
    }
  }
}
```

## Security

- API tokens are handled securely and never logged
- All requests use HTTPS
- Rate limiting is handled automatically
- Environment variables are preferred for token storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/anthropics/digitalocean-mcp/issues)
- Documentation: See the examples above and endpoint details via the `get_endpoint_details` tool
- DigitalOcean API Docs: [Official API Documentation](https://docs.digitalocean.com/reference/api/)