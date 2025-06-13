#!/usr/bin/env python3
"""
Script to extract endpoints from DigitalOcean OpenAPI specification.
"""

import yaml
import json
import sys
from pathlib import Path

def extract_endpoints(spec_path):
    """Extract endpoints from OpenAPI spec file."""
    try:
        with open(spec_path, 'r') as f:
            spec = yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading spec file: {e}")
        return None
    
    endpoints = []
    
    if 'paths' not in spec:
        print("No paths found in spec")
        return endpoints
    
    for path, path_obj in spec['paths'].items():
        for method, method_obj in path_obj.items():
            if method in ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']:
                endpoint = {
                    'path': path,
                    'method': method.upper(),
                    'operationId': method_obj.get('operationId', ''),
                    'summary': method_obj.get('summary', ''),
                    'description': method_obj.get('description', '').strip(),
                    'tags': method_obj.get('tags', []),
                    'parameters': []
                }
                
                # Extract parameters
                if 'parameters' in method_obj:
                    for param in method_obj['parameters']:
                        if '$ref' in param:
                            # Skip $ref parameters for now
                            continue
                        param_info = {
                            'name': param.get('name', ''),
                            'in': param.get('in', ''),
                            'required': param.get('required', False),
                            'description': param.get('description', ''),
                            'type': param.get('schema', {}).get('type', '') if 'schema' in param else param.get('type', '')
                        }
                        endpoint['parameters'].append(param_info)
                
                endpoints.append(endpoint)
    
    return endpoints

def main():
    spec_path = Path.home() / "Downloads" / "DigitalOcean-public.v2.yaml"
    
    if not spec_path.exists():
        print(f"Spec file not found at {spec_path}")
        sys.exit(1)
    
    print(f"Extracting endpoints from {spec_path}...")
    endpoints = extract_endpoints(spec_path)
    
    if endpoints is None:
        sys.exit(1)
    
    print(f"Found {len(endpoints)} endpoints")
    
    # Save to JSON file
    output_path = Path("digitalocean_endpoints.json")
    with open(output_path, 'w') as f:
        json.dump(endpoints, f, indent=2)
    
    print(f"Endpoints saved to {output_path}")
    
    # Print some sample endpoints
    print("\nSample endpoints:")
    for i, endpoint in enumerate(endpoints[:5]):
        print(f"{i+1}. {endpoint['method']} {endpoint['path']} - {endpoint['summary']}")

if __name__ == "__main__":
    main()