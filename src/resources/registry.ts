/**
 * Resources Registry for MCP Role Director
 */

import { OrchestratorError } from '../core/errors';
import { createLogger } from '../utils/logger';

const logger = createLogger('resources-registry');

export interface ResourceInfo {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text?: string;
  base64?: string;
}

class ResourceRegistry {
  private resources = new Map<string, ResourceInfo>();

  register(resource: ResourceInfo): void {
    logger.info(`Registering resource: ${resource.uri}`);
    this.resources.set(resource.uri, resource);
  }

  list(): ResourceInfo[] {
    return Array.from(this.resources.values());
  }

  async read(uri: string): Promise<ResourceContent> {
    const resource = this.resources.get(uri);
    
    if (!resource) {
      throw new OrchestratorError(`Resource not found: ${uri}`);
    }

    // Simular contenido de recursos para tests
    return this.generateResourceContent(uri, resource.mimeType);
  }

  private async generateResourceContent(uri: string, mimeType: string): Promise<ResourceContent> {
    switch (uri) {
      case 'mcp://orchestrator/ARCH.md':
        return {
          uri,
          mimeType,
          text: '# Architecture Document\n\nThis is a placeholder architecture document.'
        };
      
      case 'mcp://orchestrator/STATE.json':
        return {
          uri,
          mimeType,
          text: JSON.stringify({
            status: 'in-progress',
            phase: 'BUILD',
            role: 'architect',
            updatedAt: new Date().toISOString()
          }, null, 2)
        };
      
      case 'mcp://orchestrator/ARTIFACTS/':
        return {
          uri,
          mimeType,
          text: JSON.stringify({
            entries: [],
            basePath: '/artifacts'
          }, null, 2)
        };

      default:
        if (uri.startsWith('mcp://orchestrator/ARTIFACTS/') && !uri.endsWith('/')) {
          throw new OrchestratorError(`Artifact not found: ${uri}`);
        }
        
        return {
          uri,
          mimeType,
          text: 'Default resource content'
        };
    }
  }
}

const registry = new ResourceRegistry();

// Registrar recursos por defecto del orchestrator
registry.register({
  uri: 'mcp://orchestrator/PLAN.md',
  name: 'Project Plan',
  description: 'Documento de planificación del proyecto',
  mimeType: 'text/markdown'
});

registry.register({
  uri: 'mcp://orchestrator/TASKPLAN.md',
  name: 'Task Plan', 
  description: 'Plan detallado de tareas',
  mimeType: 'text/markdown'
});

registry.register({
  uri: 'mcp://orchestrator/ARCH.md',
  name: 'Architecture Document',
  description: 'Documentación de arquitectura del sistema',
  mimeType: 'text/markdown'
});

registry.register({
  uri: 'mcp://orchestrator/DECISIONS.md',
  name: 'Architecture Decisions',
  description: 'Registro de decisiones arquitectónicas',
  mimeType: 'text/markdown'
});

registry.register({
  uri: 'mcp://orchestrator/STATE.json',
  name: 'Project State',
  description: 'Estado actual del proyecto',
  mimeType: 'application/json'
});

registry.register({
  uri: 'mcp://orchestrator/TEST-REPORT.md',
  name: 'Test Report',
  description: 'Reporte de resultados de pruebas',
  mimeType: 'text/markdown'
});

registry.register({
  uri: 'mcp://orchestrator/ARTIFACTS/',
  name: 'Artifacts Directory',
  description: 'Directorio de artefactos del proyecto',
  mimeType: 'application/json'
});

export function listResources(): ResourceInfo[] {
  return registry.list();
}

export async function readResource(uri: string): Promise<ResourceContent> {
  return registry.read(uri);
}

export function getResourceRegistry(): ResourceRegistry {
  return registry;
}