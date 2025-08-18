/**
 * Resources MCP - Punto de entrada simplificado para MCP Role Director
 * Proporciona acceso a los recursos de roles (JSON) sin complejidades del orchestrator
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { createLogger } from '../utils/logger';
import { listResources, readResource } from './registry';

const logger = createLogger('mcp-resources-index');

/**
 * Inicializa los recursos básicos para MCP Role Director
 */
export async function initializeResources(server?: Server): Promise<void> {
  if (!server) {
    logger.info('Sin servidor MCP proporcionado, inicialización básica con registry');
    // Inicialización básica sin servidor MCP
    return;
  }

  // Handler: resources/list - Lista los recursos disponibles
  server.setRequestHandler('resources/list', async () => {
    try {
      // Primero intentar con el registry
      const registryResources = listResources();
      
      if (registryResources.length > 0) {
        return { resources: registryResources };
      }

      // Fallback: leer desde filesystem para roles
      const rolesDir = path.join(process.cwd(), 'src/resources/roles');
      
      try {
        const files = await fs.readdir(rolesDir);
        const jsonFiles = files.filter((file) => file.endsWith('.json'));

        const resources = jsonFiles.map((file) => ({
          uri: `mcp://roles/${path.basename(file, '.json')}`,
          name: path.basename(file, '.json').toUpperCase(),
          description: `Definición del rol ${path.basename(file, '.json')}`,
          mimeType: 'application/json',
        }));

        return { resources };
      } catch (fsError) {
        logger.warn('Error leyendo desde filesystem, devolviendo recursos vacíos:', fsError);
        return { resources: [] };
      }
    } catch (error) {
      logger.error('Error listando recursos:', error);
      return { resources: [] };
    }
  });

  // Handler: resources/read - Lee un recurso específico
  server.setRequestHandler('resources/read', async (request) => {
    const { uri } = request.params as { uri: string };

    try {
      // Primero intentar con el registry
      if (uri.startsWith('mcp://orchestrator/')) {
        const resource = await readResource(uri);
        return {
          contents: [resource],
        };
      }

      // Fallback para roles desde filesystem
      if (!uri.startsWith('mcp://roles/')) {
        throw new Error(`URI no soportada: ${uri}`);
      }

      const roleName = uri.replace('mcp://roles/', '');
      const roleFile = path.join(process.cwd(), 'src/resources/roles', `${roleName}.json`);

      try {
        const content = await fs.readFile(roleFile, 'utf8');
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: content,
            },
          ],
        };
      } catch (fsError) {
        logger.error(`Error leyendo rol ${roleName} desde filesystem:`, fsError);
        throw new Error(`Rol no encontrado: ${roleName}`);
      }
    } catch (error) {
      logger.error(`Error leyendo recurso ${uri}:`, error);
      throw error;
    }
  });

  logger.info('Handlers MCP de resources registrados');
}
