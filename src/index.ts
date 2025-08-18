/**
 * MCP Role Director
 * Servidor MCP que proporciona guía metodológica y dirección de roles
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createLogger } from './utils/logger';
import { registerTools, AVAILABLE_TOOLS, getToolsDescription } from './tools';

const logger = createLogger('mcp-role-director');

/**
 * Configuración del servidor
 */
interface ServerConfig {
  name: string;
  version: string;
  description: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: ServerConfig = {
  name: '@mcp/role-director',
  version: '1.0.0',
  description: 'MCP server que proporciona dirección de roles y metodología BMAD',
  logLevel: process.env.LOG_LEVEL as any || 'info'
};

/**
 * Inicializar y arrancar el servidor MCP
 */
async function startServer(): Promise<void> {
  logger.info('Iniciando MCP Role Director...');

  try {
    // Crear instancia del servidor
    const server = new Server(
      {
        name: DEFAULT_CONFIG.name,
        version: DEFAULT_CONFIG.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        },
      },
    );

    // Registrar herramientas de director de roles
    logger.info('Registrando herramientas de director de roles...');
    await registerTools(server);
    
    logger.info(`${AVAILABLE_TOOLS.length} herramientas registradas exitosamente:`);
    logger.info('\n' + getToolsDescription());

    // Manejador de solicitudes de información del servidor
    server.setRequestHandler('server/info' as any, async () => {
      return {
        name: DEFAULT_CONFIG.name,
        version: DEFAULT_CONFIG.version,
        description: DEFAULT_CONFIG.description,
        capabilities: {
          tools: true,
          resources: true
        }
      };
    });

    // Manejador de health check
    server.setRequestHandler('health/check' as any, async () => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        tools: AVAILABLE_TOOLS.length
      };
    });

    // Configurar manejo de errores
    setupErrorHandlers();

    // Configurar señales de terminación
    setupSignalHandlers();

    // Crear transporte stdio
    const transport = new StdioServerTransport();

    // Conectar servidor al transporte
    await server.connect(transport);

    logger.info('=====================================');
    logger.info('MCP Role Director iniciado exitosamente');
    logger.info('=====================================');
    logger.info('Modo: Guía de roles y metodología BMAD');
    logger.info('Esperando conexiones de clientes...');
    
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    throw error;
  }
}

/**
 * Configurar manejadores de errores
 */
function setupErrorHandlers(): void {
  process.on('uncaughtException', (error) => {
    logger.error('Excepción no capturada:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promesa rechazada no manejada:', { reason, promise });
    process.exit(1);
  });
}

/**
 * Configurar manejadores de señales
 */
function setupSignalHandlers(): void {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Recibida señal ${signal}, cerrando servidor...`);
    
    // Aquí podrías agregar lógica de limpieza si fuera necesaria
    
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  try {
    logger.info('=====================================');
    logger.info('MCP Role Director v1.0.0');
    logger.info('=====================================');
    logger.info('');
    logger.info('Este servidor proporciona:');
    logger.info('- Guía de roles para agentes AI');
    logger.info('- Metodología BMAD estructurada');
    logger.info('- Transiciones inteligentes entre roles');
    logger.info('');
    
    await startServer();
  } catch (error) {
    logger.error('Error fatal al iniciar:', error);
    console.error('Error fatal:', error);
    process.exit(1);
  }
}

// Arrancar el servidor si es el módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fallo al arrancar:', error);
    process.exit(1);
  });
}

// Exportar para testing y uso programático
export { 
  startServer,
  ServerConfig,
  DEFAULT_CONFIG
};

// Re-exportar herramientas disponibles
export { 
  AVAILABLE_TOOLS,
  getToolsDescription,
  getToolByName,
  hasTool
} from './tools';

// Re-exportar tipos de roles y fases
export { 
  AgentRole,
  BMADPhase
} from './tools/role.director';