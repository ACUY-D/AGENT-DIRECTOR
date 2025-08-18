/**
 * BMAD Workflow Tool
 * Gestiona el flujo de trabajo completo siguiendo la metodología BMAD
 */

import { z } from 'zod';
import { createLogger } from '../utils/logger';
import { AgentRole, BMADPhase } from './role.director';

const logger = createLogger('bmad-workflow');

/**
 * Schema para iniciar un proyecto
 */
export const StartProjectInputSchema = z.object({
  objective: z.string().min(10),
  context: z
    .object({
      projectType: z.enum(['api', 'webapp', 'library', 'microservice', 'fullstack']).optional(),
      technologies: z.array(z.string()).optional(),
      constraints: z.array(z.string()).optional(),
      team: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * Schema de salida para inicio de proyecto
 */
export const StartProjectOutputSchema = z.object({
  projectId: z.string(),
  initialRole: z.nativeEnum(AgentRole),
  phase: z.nativeEnum(BMADPhase),
  instructions: z.string(),
  workflowSteps: z.array(z.string()),
  estimatedDuration: z.string().optional(),
  methodology: z.object({
    framework: z.string(),
    phases: z.array(z.string()),
    principles: z.array(z.string()),
  }),
});

/**
 * Schema para guía de fase BMAD
 */
export const PhaseGuidanceInputSchema = z.object({
  currentPhase: z.nativeEnum(BMADPhase),
  metrics: z.record(z.unknown()).optional(),
  completedTasks: z.array(z.string()).optional(),
});

/**
 * Schema de salida para guía de fase
 */
export const PhaseGuidanceOutputSchema = z.object({
  phaseObjectives: z.array(z.string()),
  methodologySteps: z.array(z.string()),
  successCriteria: z.array(z.string()),
  rolesInvolved: z.array(z.nativeEnum(AgentRole)),
  expectedDeliverables: z.array(z.string()),
  nextPhaseConditions: z.array(z.string()),
});

export type StartProjectInput = z.infer<typeof StartProjectInputSchema>;
export type StartProjectOutput = z.infer<typeof StartProjectOutputSchema>;
export type PhaseGuidanceInput = z.infer<typeof PhaseGuidanceInputSchema>;
export type PhaseGuidanceOutput = z.infer<typeof PhaseGuidanceOutputSchema>;

/**
 * Definición de las fases BMAD
 */
const BMAD_PHASES = {
  [BMADPhase.BUILD]: {
    name: 'BUILD - Construcción',
    description: 'Fase de diseño e implementación de la solución',
    objectives: [
      'Diseñar la arquitectura del sistema',
      'Implementar la funcionalidad core',
      'Escribir tests unitarios',
      'Documentar el código',
    ],
    roles: [AgentRole.ARCHITECT, AgentRole.DEVELOPER, AgentRole.TESTER],
    deliverables: ['Código fuente', 'Tests unitarios', 'Documentación técnica', 'Arquitectura del sistema'],
    successCriteria: [
      'Código implementado según especificaciones',
      'Tests pasando con >80% cobertura',
      'Documentación completa',
      'Sin errores críticos',
    ],
  },
  [BMADPhase.MEASURE]: {
    name: 'MEASURE - Medición',
    description: 'Fase de recopilación de métricas y evaluación de calidad',
    objectives: [
      'Medir cobertura de tests',
      'Evaluar rendimiento',
      'Analizar complejidad del código',
      'Recopilar métricas de calidad',
    ],
    roles: [AgentRole.TESTER, AgentRole.ANALYST],
    deliverables: [
      'Reporte de cobertura',
      'Métricas de rendimiento',
      'Análisis de complejidad',
      'Dashboard de métricas',
    ],
    successCriteria: [
      'Métricas recopiladas completamente',
      'Benchmarks ejecutados',
      'Reportes generados',
      'KPIs definidos y medidos',
    ],
  },
  [BMADPhase.ANALYZE]: {
    name: 'ANALYZE - Análisis',
    description: 'Fase de análisis de resultados e identificación de mejoras',
    objectives: [
      'Analizar métricas recopiladas',
      'Identificar áreas de mejora',
      'Priorizar optimizaciones',
      'Generar recomendaciones',
    ],
    roles: [AgentRole.ANALYST, AgentRole.ARCHITECT, AgentRole.DEBUGGER],
    deliverables: [
      'Reporte de análisis',
      'Lista de mejoras priorizadas',
      'Recomendaciones técnicas',
      'Plan de optimización',
    ],
    successCriteria: [
      'Análisis completo de métricas',
      'Mejoras identificadas y priorizadas',
      'Plan de acción definido',
      'Riesgos evaluados',
    ],
  },
  [BMADPhase.DEPLOY]: {
    name: 'DEPLOY - Despliegue',
    description: 'Fase de preparación y ejecución del despliegue a producción',
    objectives: [
      'Preparar artefactos de despliegue',
      'Configurar entorno de producción',
      'Ejecutar despliegue',
      'Validar en producción',
    ],
    roles: [AgentRole.DEVOPS, AgentRole.TESTER],
    deliverables: [
      'Artefactos de despliegue',
      'Scripts de configuración',
      'Documentación de despliegue',
      'Reporte de validación',
    ],
    successCriteria: [
      'Despliegue exitoso',
      'Tests de aceptación pasando',
      'Sin errores en producción',
      'Monitoreo configurado',
    ],
  },
};

/**
 * Flujos de trabajo predefinidos por tipo de proyecto
 */
const PROJECT_WORKFLOWS = {
  api: [
    'Analizar requisitos de la API',
    'Diseñar arquitectura RESTful/GraphQL',
    'Definir esquemas y endpoints',
    'Implementar lógica de negocio',
    'Crear tests de integración',
    'Documentar API (OpenAPI/Swagger)',
    'Configurar autenticación y autorización',
    'Optimizar rendimiento',
    'Preparar para despliegue',
    'Validar en producción',
  ],
  webapp: [
    'Analizar requisitos de UI/UX',
    'Diseñar arquitectura frontend',
    'Implementar componentes',
    'Integrar con backend',
    'Crear tests E2E',
    'Optimizar bundle y rendimiento',
    'Configurar PWA si aplica',
    'Preparar build de producción',
    'Desplegar y validar',
  ],
  library: [
    'Definir API pública',
    'Diseñar arquitectura modular',
    'Implementar funcionalidad core',
    'Crear suite de tests completa',
    'Documentar API y ejemplos',
    'Configurar build y bundling',
    'Preparar para publicación',
    'Publicar en registry (npm)',
    'Validar instalación y uso',
  ],
  microservice: [
    'Definir bounded context',
    'Diseñar API y eventos',
    'Implementar lógica de dominio',
    'Configurar comunicación inter-servicios',
    'Implementar tests de contrato',
    'Configurar health checks',
    'Preparar containerización',
    'Configurar orquestación',
    'Desplegar y monitorear',
  ],
  fullstack: [
    'Analizar requisitos completos',
    'Diseñar arquitectura end-to-end',
    'Implementar backend API',
    'Desarrollar frontend',
    'Integrar frontend y backend',
    'Crear tests de todos los niveles',
    'Optimizar rendimiento global',
    'Configurar CI/CD completo',
    'Desplegar stack completo',
    'Validar flujo completo',
  ],
};

/**
 * Iniciar un nuevo proyecto con metodología BMAD
 */
export async function startProject(input: StartProjectInput): Promise<StartProjectOutput> {
  const { objective, context } = input;

  logger.info(`Iniciando proyecto con objetivo: ${objective}`);

  // Generar ID único para el proyecto
  const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Determinar tipo de proyecto si no se especifica
  const projectType = context?.projectType || detectProjectType(objective);

  // Obtener flujo de trabajo según el tipo de proyecto
  const workflowSteps = PROJECT_WORKFLOWS[projectType] || generateGenericWorkflow(objective);

  // El rol inicial siempre es Arquitecto en fase BUILD
  const initialRole = AgentRole.ARCHITECT;
  const phase = BMADPhase.BUILD;

  // Generar instrucciones iniciales
  const instructions = generateInitialInstructions(objective, projectType, context);

  // Estimar duración basada en complejidad
  const estimatedDuration = estimateProjectDuration(projectType, workflowSteps.length);

  // Definir metodología BMAD
  const methodology = {
    framework: 'BMAD (Build, Measure, Analyze, Deploy)',
    phases: ['BUILD - Construcción', 'MEASURE - Medición', 'ANALYZE - Análisis', 'DEPLOY - Despliegue'],
    principles: [
      'Iteración continua',
      'Medición basada en datos',
      'Análisis para mejora',
      'Despliegue automatizado',
      'Calidad desde el inicio',
    ],
  };

  logger.info(`Proyecto ${projectId} iniciado como ${projectType} con rol inicial ${initialRole}`);

  return {
    projectId,
    initialRole,
    phase,
    instructions,
    workflowSteps,
    estimatedDuration,
    methodology,
  };
}

/**
 * Obtener guía para la fase BMAD actual
 */
export async function getPhaseGuidance(input: PhaseGuidanceInput): Promise<PhaseGuidanceOutput> {
  const { currentPhase, metrics, completedTasks } = input;

  logger.info(`Generando guía para fase ${currentPhase}`);

  const phaseInfo = BMAD_PHASES[currentPhase];

  if (!phaseInfo) {
    throw new Error(`Fase BMAD no reconocida: ${currentPhase}`);
  }

  // Ajustar objetivos según tareas completadas
  const phaseObjectives = adjustObjectivesByProgress(phaseInfo.objectives, completedTasks || []);

  // Generar pasos metodológicos específicos
  const methodologySteps = generateMethodologySteps(currentPhase, metrics);

  // Criterios de éxito ajustados
  const successCriteria = phaseInfo.successCriteria;

  // Condiciones para siguiente fase
  const nextPhaseConditions = generateNextPhaseConditions(currentPhase);

  return {
    phaseObjectives,
    methodologySteps,
    successCriteria,
    rolesInvolved: phaseInfo.roles,
    expectedDeliverables: phaseInfo.deliverables,
    nextPhaseConditions,
  };
}

/**
 * Detectar tipo de proyecto basado en el objetivo
 */
function detectProjectType(objective: string): 'api' | 'webapp' | 'library' | 'microservice' | 'fullstack' {
  const lowerObjective = objective.toLowerCase();

  if (lowerObjective.includes('api') || lowerObjective.includes('rest') || lowerObjective.includes('graphql')) {
    return 'api';
  }
  if (lowerObjective.includes('web') || lowerObjective.includes('frontend') || lowerObjective.includes('ui')) {
    return 'webapp';
  }
  if (lowerObjective.includes('library') || lowerObjective.includes('package') || lowerObjective.includes('sdk')) {
    return 'library';
  }
  if (lowerObjective.includes('microservice') || lowerObjective.includes('servicio')) {
    return 'microservice';
  }

  return 'fullstack';
}

/**
 * Generar flujo de trabajo genérico
 */
function generateGenericWorkflow(objective: string): string[] {
  return [
    `Analizar requisitos para: ${objective}`,
    'Diseñar arquitectura de la solución',
    'Implementar funcionalidad core',
    'Escribir tests automatizados',
    'Documentar la implementación',
    'Optimizar rendimiento y calidad',
    'Preparar para despliegue',
    'Ejecutar despliegue',
    'Validar en entorno de producción',
    'Documentar lecciones aprendidas',
  ];
}

/**
 * Generar instrucciones iniciales
 */
function generateInitialInstructions(objective: string, projectType: string, context?: any): string {
  let instructions = `🚀 **Iniciando proyecto tipo ${projectType}**\n\n`;
  instructions += `**Objetivo:** ${objective}\n\n`;
  instructions += '**Fase actual:** BUILD - Construcción\n';
  instructions += '**Rol inicial:** ARQUITECTO\n\n';
  instructions += '**Como Arquitecto, tu primera tarea es:**\n';
  instructions += '1. Analizar los requisitos del proyecto\n';
  instructions += '2. Diseñar la arquitectura de la solución\n';
  instructions += '3. Seleccionar las tecnologías apropiadas\n';
  instructions += '4. Crear el plan de trabajo (PLAN.md)\n';
  instructions += '5. Documentar decisiones arquitectónicas (ARCH.md)\n\n';

  if (context?.technologies?.length) {
    instructions += `**Tecnologías sugeridas:** ${context.technologies.join(', ')}\n`;
  }

  if (context?.constraints?.length) {
    instructions += `**Restricciones a considerar:** ${context.constraints.join(', ')}\n`;
  }

  instructions += '\n**Metodología:** Seguiremos el framework BMAD con iteraciones continuas.\n';
  instructions += 'Cada fase debe completarse con métricas y validación antes de avanzar.';

  return instructions;
}

/**
 * Estimar duración del proyecto
 */
function estimateProjectDuration(projectType: string, stepsCount: number): string {
  const baseHours: Record<string, number> = {
    api: 40,
    webapp: 60,
    library: 30,
    microservice: 50,
    fullstack: 100,
  };

  const hours = (baseHours[projectType] || 50) + stepsCount * 2;

  if (hours < 40) {
    return '1 semana';
  }
  if (hours < 80) {
    return '2 semanas';
  }
  if (hours < 160) {
    return '1 mes';
  }
  return '2-3 meses';
}

/**
 * Ajustar objetivos según progreso
 */
function adjustObjectivesByProgress(objectives: string[], completedTasks: string[]): string[] {
  return objectives.map((obj) => {
    const isCompleted = completedTasks.some((task) => task.toLowerCase().includes(obj.toLowerCase().substring(0, 20)));
    return isCompleted ? `✅ ${obj}` : `⬜ ${obj}`;
  });
}

/**
 * Generar pasos metodológicos
 */
function generateMethodologySteps(phase: BMADPhase, _metrics?: Record<string, unknown>): string[] {
  const steps: Record<BMADPhase, string[]> = {
    [BMADPhase.BUILD]: [
      'Aplicar principios SOLID en el diseño',
      'Implementar con TDD (Test-Driven Development)',
      'Realizar code reviews frecuentes',
      'Mantener documentación actualizada',
      'Validar con stakeholders',
    ],
    [BMADPhase.MEASURE]: [
      'Ejecutar suite completa de tests',
      'Medir cobertura de código',
      'Realizar benchmarks de rendimiento',
      'Analizar complejidad ciclomática',
      'Generar reportes de calidad',
    ],
    [BMADPhase.ANALYZE]: [
      'Identificar patrones en las métricas',
      'Priorizar mejoras por impacto',
      'Evaluar deuda técnica',
      'Proponer optimizaciones',
      'Crear plan de acción',
    ],
    [BMADPhase.DEPLOY]: [
      'Preparar scripts de despliegue',
      'Configurar variables de entorno',
      'Ejecutar despliegue blue-green',
      'Validar health checks',
      'Configurar monitoreo y alertas',
    ],
  };

  return steps[phase] || [];
}

/**
 * Generar condiciones para siguiente fase
 */
function generateNextPhaseConditions(currentPhase: BMADPhase): string[] {
  const conditions: Record<BMADPhase, string[]> = {
    [BMADPhase.BUILD]: [
      'Código implementado y funcionando',
      'Tests unitarios pasando',
      'Documentación básica completa',
      'Sin errores bloqueantes',
    ],
    [BMADPhase.MEASURE]: [
      'Métricas recopiladas completamente',
      'Reportes generados',
      'Benchmarks ejecutados',
      'Datos listos para análisis',
    ],
    [BMADPhase.ANALYZE]: [
      'Análisis completo',
      'Mejoras identificadas',
      'Plan de acción definido',
      'Prioridades establecidas',
    ],
    [BMADPhase.DEPLOY]: ['Despliegue exitoso', 'Validación completa', 'Sin errores en producción', 'Monitoreo activo'],
  };

  return conditions[currentPhase] || [];
}

/**
 * Tools metadata para registro MCP
 */
export const bmadWorkflowTools = [
  {
    name: 'workflow.startProject',
    description: 'Inicia un nuevo proyecto con metodología BMAD y define el flujo de trabajo',
    inputSchema: StartProjectInputSchema,
    handler: startProject,
  },
  {
    name: 'bmad.getPhaseGuidance',
    description: 'Obtiene guía detallada para la fase BMAD actual',
    inputSchema: PhaseGuidanceInputSchema,
    handler: getPhaseGuidance,
  },
];
