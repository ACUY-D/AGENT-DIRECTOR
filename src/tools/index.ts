/**
 * MCP Tools Registry
 * Exporta todas las herramientas disponibles para el director de roles
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { createLogger } from '../utils/logger';

import { bmadWorkflowTools } from './bmad.workflow';
// Importar herramientas
import { roleDirectorTool } from './role.director';
import { roleTransitionTool } from './role.transition';

const logger = createLogger('tools-registry');

/**
 * Registro de todas las herramientas disponibles
 */
export const AVAILABLE_TOOLS = [roleDirectorTool, roleTransitionTool, ...bmadWorkflowTools];

/**
 * Nombres de herramientas para referencia rápida
 */
export const TOOL_NAMES = {
  GET_ROLE_INSTRUCTIONS: 'role.getCurrentInstructions',
  ROLE_TRANSITION: 'role.transition',
  START_PROJECT: 'workflow.startProject',
  GET_PHASE_GUIDANCE: 'bmad.getPhaseGuidance',
} as const;

/**
 * Registrar todas las herramientas con el servidor MCP
 */
export async function registerTools(server: Server): Promise<void> {
  logger.info('Registrando herramientas del director de roles con el servidor MCP');

  try {
    // Configurar manejadores para las herramientas
    server.setRequestHandler('tools/list' as any, handleListTools);
    server.setRequestHandler('tools/call' as any, handleCallTool);

    logger.info(`${AVAILABLE_TOOLS.length} herramientas registradas exitosamente`);
  } catch (error) {
    logger.error('Error al registrar herramientas', error);
    throw error;
  }
}

/**
 * Manejar solicitud de lista de herramientas
 */
async function handleListTools(): Promise<{ tools: any[] }> {
  logger.debug('Listando herramientas disponibles');

  const tools = AVAILABLE_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: convertToJsonSchema(tool.inputSchema),
  }));

  return { tools };
}

/**
 * Manejar llamada a herramienta
 */
async function handleCallTool(request: any): Promise<any> {
  const { name, arguments: args } = request.params as {
    name: string;
    arguments?: unknown;
  };

  logger.info(`Ejecutando herramienta: ${name}`);

  try {
    // Buscar la herramienta
    const tool = AVAILABLE_TOOLS.find((t) => t.name === name);

    if (!tool) {
      throw new Error(`Herramienta no encontrada: ${name}`);
    }

    // Ejecutar el handler de la herramienta
    const result = await tool.handler(args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error(`Error ejecutando herramienta ${name}:`, error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: true,
              message: (error as Error).message,
              tool: name,
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Convertir schema Zod a JSON Schema para MCP
 */
function convertToJsonSchema(_zodSchema: any): any {
  // Conversión simplificada - en producción sería más compleja
  return {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  };
}

/**
 * Obtener herramienta por nombre
 */
export function getToolByName(name: string) {
  return AVAILABLE_TOOLS.find((tool) => tool.name === name);
}

/**
 * Verificar si una herramienta existe
 */
export function hasTool(name: string): boolean {
  return AVAILABLE_TOOLS.some((tool) => tool.name === name);
}

/**
 * Obtener descripción de todas las herramientas
 */
export function getToolsDescription(): string {
  return AVAILABLE_TOOLS.map((tool) => `- **${tool.name}**: ${tool.description}`).join('\n');
}

/**
 * Exportar herramientas individuales para uso directo
 */
export { roleDirectorTool, roleTransitionTool, bmadWorkflowTools };

/**
 * Exportar tipos
 */
export type {
  GetRoleInstructionsInput,
  RoleInstructionsOutput,
} from './role.director';

export type {
  RoleTransitionInput,
  RoleTransitionOutput,
} from './role.transition';

export type {
  StartProjectInput,
  StartProjectOutput,
  PhaseGuidanceInput,
  PhaseGuidanceOutput,
} from './bmad.workflow';

// Re-exportar enums útiles
export { AgentRole, BMADPhase } from './role.director';
