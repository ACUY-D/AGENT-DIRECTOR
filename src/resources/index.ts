/**
 * Resources MCP - Punto de entrada simplificado para MCP Role Director
 * Proporciona acceso a los recursos de roles (JSON) sin complejidades del orchestrator
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { createLogger } from '../utils/logger';

const logger = createLogger('mcp-resources-index');

/**
 * Inicializa los recursos básicos para MCP Role Director
 */
export async function initializeResources(server?: Server): Promise<void> {
  if (!server) {
    logger.info('Sin servidor MCP proporcionado, inicialización básica');
    return;
  }

  // Handler: resources/list - Lista los roles disponibles
  server.setRequestHandler('resources/list', async () => {
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
    } catch (error) {
      logger.error('Error listando recursos de roles:', error);
      return { resources: [] };
    }
  });

  // Handler: resources/read - Lee un archivo de rol específico
  server.setRequestHandler('resources/read', async (request) => {
    const { uri } = request.params as { uri: string };

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
    } catch (error) {
      logger.error(`Error leyendo rol ${roleName}:`, error);
      throw new Error(`Rol no encontrado: ${roleName}`);
    }
  });

  logger.info('Handlers MCP de resources registrados');
}
