/**
 * Role Director Tool
 * Proporciona guía sobre qué rol debe tomar el agente y cómo comportarse
 */

import { z } from 'zod';
import { createLogger } from '../utils/logger';

const logger = createLogger('role-director');

/**
 * Enum de roles disponibles
 */
export enum AgentRole {
  ARCHITECT = 'architect',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  DEBUGGER = 'debugger',
  DEVOPS = 'devops',
  ANALYST = 'analyst'
}

/**
 * Enum de fases BMAD
 */
export enum BMADPhase {
  BUILD = 'BUILD',
  MEASURE = 'MEASURE',
  ANALYZE = 'ANALYZE',
  DEPLOY = 'DEPLOY'
}

/**
 * Schema de entrada para obtener instrucciones del rol
 */
export const GetRoleInstructionsSchema = z.object({
  currentRole: z.nativeEnum(AgentRole),
  phase: z.nativeEnum(BMADPhase),
  taskState: z.object({
    objective: z.string(),
    completedSteps: z.array(z.string()).optional(),
    currentContext: z.record(z.unknown()).optional()
  })
});

/**
 * Schema de salida con instrucciones del rol
 */
export const RoleInstructionsSchema = z.object({
  roleInstructions: z.string(),
  methodology: z.array(z.string()),
  checklist: z.array(z.string()),
  nextSteps: z.array(z.string()),
  bestPractices: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional()
});

export type GetRoleInstructionsInput = z.infer<typeof GetRoleInstructionsSchema>;
export type RoleInstructionsOutput = z.infer<typeof RoleInstructionsSchema>;

/**
 * Definiciones de comportamiento por rol
 */
const ROLE_BEHAVIORS = {
  [AgentRole.ARCHITECT]: {
    description: 'Diseñador de sistemas y arquitectura técnica',
    responsibilities: [
      'Analizar requisitos del proyecto',
      'Diseñar la arquitectura del sistema',
      'Seleccionar tecnologías apropiadas',
      'Crear diagramas y documentación técnica',
      'Definir estándares y mejores prácticas'
    ],
    deliverables: ['PLAN.md', 'ARCH.md', 'TECH-SPEC.md', 'ADRs (Architecture Decision Records)'],
    methodologies: ['Domain-Driven Design', 'Clean Architecture', 'SOLID principles', 'Design Patterns']
  },
  [AgentRole.DEVELOPER]: {
    description: 'Implementador de código y funcionalidades',
    responsibilities: [
      'Implementar código siguiendo el diseño',
      'Escribir código limpio y mantenible',
      'Crear tests unitarios',
      'Documentar el código',
      'Refactorizar cuando sea necesario'
    ],
    deliverables: ['Código fuente', 'Tests unitarios', 'Documentación de código'],
    methodologies: ['TDD (Test-Driven Development)', 'Pair Programming', 'Code Review', 'Refactoring']
  },
  [AgentRole.TESTER]: {
    description: 'Validador de calidad y funcionalidad',
    responsibilities: [
      'Diseñar casos de prueba',
      'Ejecutar pruebas unitarias',
      'Realizar pruebas de integración',
      'Verificar cobertura de código',
      'Documentar resultados de pruebas'
    ],
    deliverables: ['Test Report', 'Coverage Report', 'Bug Reports'],
    methodologies: ['Unit Testing', 'Integration Testing', 'E2E Testing', 'Performance Testing']
  },
  [AgentRole.DEBUGGER]: {
    description: 'Solucionador de problemas y optimizador',
    responsibilities: [
      'Identificar causa raíz de errores',
      'Proponer soluciones efectivas',
      'Optimizar rendimiento',
      'Corregir vulnerabilidades',
      'Documentar fixes aplicados'
    ],
    deliverables: ['Bug Analysis', 'Fix Documentation', 'Performance Report'],
    methodologies: ['Root Cause Analysis', 'Debugging Strategies', 'Performance Profiling']
  },
  [AgentRole.DEVOPS]: {
    description: 'Especialista en despliegue y operaciones',
    responsibilities: [
      'Preparar entorno de despliegue',
      'Configurar CI/CD pipelines',
      'Gestionar infraestructura',
      'Monitorear aplicaciones',
      'Automatizar procesos'
    ],
    deliverables: ['Deployment Scripts', 'CI/CD Configuration', 'Infrastructure as Code'],
    methodologies: ['Continuous Integration', 'Continuous Deployment', 'Infrastructure as Code', 'GitOps']
  },
  [AgentRole.ANALYST]: {
    description: 'Analista de métricas y calidad',
    responsibilities: [
      'Medir métricas de calidad',
      'Analizar rendimiento',
      'Evaluar cobertura de tests',
      'Identificar áreas de mejora',
      'Generar reportes'
    ],
    deliverables: ['Metrics Report', 'Quality Analysis', 'Improvement Recommendations'],
    methodologies: ['Code Metrics Analysis', 'Quality Gates', 'Continuous Monitoring']
  }
};

/**
 * Obtener instrucciones según el rol y fase actual
 */
export async function getRoleInstructions(input: GetRoleInstructionsInput): Promise<RoleInstructionsOutput> {
  const { currentRole, phase, taskState } = input;
  
  logger.info(`Generando instrucciones para rol ${currentRole} en fase ${phase}`);
  
  const roleBehavior = ROLE_BEHAVIORS[currentRole];
  
  if (!roleBehavior) {
    throw new Error(`Rol no reconocido: ${currentRole}`);
  }
  
  // Generar instrucciones específicas según la fase BMAD
  const phaseInstructions = generatePhaseInstructions(currentRole, phase, taskState.objective);
  
  // Generar checklist según el rol y la fase
  const checklist = generateChecklist(currentRole, phase, taskState.completedSteps || []);
  
  // Determinar próximos pasos
  const nextSteps = generateNextSteps(currentRole, phase, taskState);
  
  return {
    roleInstructions: phaseInstructions,
    methodology: roleBehavior.methodologies,
    checklist,
    nextSteps,
    bestPractices: generateBestPractices(currentRole),
    deliverables: roleBehavior.deliverables
  };
}

/**
 * Generar instrucciones específicas de la fase
 */
function generatePhaseInstructions(role: AgentRole, phase: BMADPhase, objective: string): string {
  const instructions: Record<BMADPhase, Record<AgentRole, string>> = {
    [BMADPhase.BUILD]: {
      [AgentRole.ARCHITECT]: `Como Arquitecto en la fase BUILD, tu misión es diseñar la arquitectura completa para: "${objective}". 
        Debes analizar los requisitos, crear un diseño de sistema robusto, seleccionar las tecnologías apropiadas y documentar todas las decisiones arquitectónicas.`,
      
      [AgentRole.DEVELOPER]: `Como Desarrollador en la fase BUILD, tu misión es implementar el código para: "${objective}". 
        Sigue el diseño arquitectónico, escribe código limpio y mantenible, implementa tests unitarios y documenta tu código apropiadamente.`,
      
      [AgentRole.TESTER]: `Como Tester en la fase BUILD, tu misión es validar la implementación de: "${objective}". 
        Diseña casos de prueba completos, ejecuta tests unitarios e integración, verifica la cobertura y documenta los resultados.`,
      
      [AgentRole.DEBUGGER]: `Como Debugger en la fase BUILD, tu misión es identificar y corregir problemas en: "${objective}". 
        Analiza errores reportados, encuentra la causa raíz, implementa correcciones y documenta las soluciones.`,
      
      [AgentRole.DEVOPS]: `Como DevOps en la fase BUILD, tu misión es preparar el entorno para: "${objective}". 
        Configura el entorno de desarrollo, prepara scripts de automatización y establece el pipeline CI/CD inicial.`,
      
      [AgentRole.ANALYST]: `Como Analyst en la fase BUILD, tu misión es establecer métricas base para: "${objective}". 
        Define métricas de calidad, configura herramientas de análisis y establece los criterios de aceptación.`
    },
    [BMADPhase.MEASURE]: {
      [AgentRole.ARCHITECT]: `Como Arquitecto en la fase MEASURE, evalúa si la arquitectura implementada cumple con los requisitos de diseño para: "${objective}".`,
      [AgentRole.DEVELOPER]: `Como Desarrollador en la fase MEASURE, mide la calidad del código implementado para: "${objective}".`,
      [AgentRole.TESTER]: `Como Tester en la fase MEASURE, ejecuta suite completa de tests y mide la cobertura para: "${objective}".`,
      [AgentRole.DEBUGGER]: `Como Debugger en la fase MEASURE, identifica potenciales problemas de rendimiento en: "${objective}".`,
      [AgentRole.DEVOPS]: `Como DevOps en la fase MEASURE, recopila métricas de infraestructura y despliegue para: "${objective}".`,
      [AgentRole.ANALYST]: `Como Analyst en la fase MEASURE, recopila y analiza todas las métricas del proyecto: "${objective}".`
    },
    [BMADPhase.ANALYZE]: {
      [AgentRole.ARCHITECT]: `Como Arquitecto en la fase ANALYZE, evalúa si el diseño necesita ajustes basado en las métricas de: "${objective}".`,
      [AgentRole.DEVELOPER]: `Como Desarrollador en la fase ANALYZE, identifica áreas de mejora en el código de: "${objective}".`,
      [AgentRole.TESTER]: `Como Tester en la fase ANALYZE, analiza los resultados de las pruebas y sugiere mejoras para: "${objective}".`,
      [AgentRole.DEBUGGER]: `Como Debugger en la fase ANALYZE, prioriza los issues encontrados y planifica correcciones para: "${objective}".`,
      [AgentRole.DEVOPS]: `Como DevOps en la fase ANALYZE, optimiza el pipeline y la infraestructura para: "${objective}".`,
      [AgentRole.ANALYST]: `Como Analyst en la fase ANALYZE, genera insights y recomendaciones basadas en las métricas de: "${objective}".`
    },
    [BMADPhase.DEPLOY]: {
      [AgentRole.ARCHITECT]: `Como Arquitecto en la fase DEPLOY, valida que la arquitectura desplegada sea correcta para: "${objective}".`,
      [AgentRole.DEVELOPER]: `Como Desarrollador en la fase DEPLOY, prepara el código para producción de: "${objective}".`,
      [AgentRole.TESTER]: `Como Tester en la fase DEPLOY, ejecuta pruebas finales de aceptación para: "${objective}".`,
      [AgentRole.DEBUGGER]: `Como Debugger en la fase DEPLOY, asegura que no hay issues críticos en: "${objective}".`,
      [AgentRole.DEVOPS]: `Como DevOps en la fase DEPLOY, ejecuta el despliegue a producción de: "${objective}".`,
      [AgentRole.ANALYST]: `Como Analyst en la fase DEPLOY, prepara el reporte final del proyecto: "${objective}".`
    }
  };
  
  return instructions[phase][role] || `Como ${role} en fase ${phase}, trabaja en: "${objective}"`;
}

/**
 * Generar checklist según rol y fase
 */
function generateChecklist(role: AgentRole, phase: BMADPhase, completedSteps: string[]): string[] {
  const baseChecklist: Record<AgentRole, string[]> = {
    [AgentRole.ARCHITECT]: [
      '✓ Requisitos analizados',
      '✓ Arquitectura diseñada',
      '✓ Tecnologías seleccionadas',
      '✓ Documentación creada',
      '✓ ADRs documentados'
    ],
    [AgentRole.DEVELOPER]: [
      '✓ Código implementado',
      '✓ Tests unitarios escritos',
      '✓ Código documentado',
      '✓ Code review completado',
      '✓ Refactoring aplicado'
    ],
    [AgentRole.TESTER]: [
      '✓ Casos de prueba diseñados',
      '✓ Tests unitarios ejecutados',
      '✓ Tests de integración ejecutados',
      '✓ Cobertura verificada',
      '✓ Reporte generado'
    ],
    [AgentRole.DEBUGGER]: [
      '✓ Errores identificados',
      '✓ Causa raíz encontrada',
      '✓ Solución implementada',
      '✓ Tests verificados',
      '✓ Documentación actualizada'
    ],
    [AgentRole.DEVOPS]: [
      '✓ Entorno configurado',
      '✓ CI/CD configurado',
      '✓ Scripts preparados',
      '✓ Monitoreo configurado',
      '✓ Despliegue ejecutado'
    ],
    [AgentRole.ANALYST]: [
      '✓ Métricas recopiladas',
      '✓ Análisis completado',
      '✓ Insights generados',
      '✓ Recomendaciones documentadas',
      '✓ Reporte preparado'
    ]
  };
  
  const checklist = baseChecklist[role] || [];
  
  // Marcar items completados
  return checklist.map(item => {
    const itemKey = item.replace('✓ ', '').toLowerCase();
    const isCompleted = completedSteps.some(step => 
      step.toLowerCase().includes(itemKey.substring(0, 10))
    );
    return isCompleted ? item : item.replace('✓', '⬜');
  });
}

/**
 * Generar próximos pasos
 */
function generateNextSteps(role: AgentRole, phase: BMADPhase, taskState: any): string[] {
  const steps: string[] = [];
  
  // Pasos específicos según la fase
  switch (phase) {
    case BMADPhase.BUILD:
      steps.push('Completar implementación actual');
      steps.push('Validar con tests');
      steps.push('Documentar trabajo realizado');
      break;
    case BMADPhase.MEASURE:
      steps.push('Ejecutar métricas de calidad');
      steps.push('Recopilar datos de rendimiento');
      steps.push('Generar reportes');
      break;
    case BMADPhase.ANALYZE:
      steps.push('Analizar resultados');
      steps.push('Identificar mejoras');
      steps.push('Planificar optimizaciones');
      break;
    case BMADPhase.DEPLOY:
      steps.push('Preparar release');
      steps.push('Ejecutar despliegue');
      steps.push('Validar en producción');
      break;
  }
  
  return steps;
}

/**
 * Generar mejores prácticas según el rol
 */
function generateBestPractices(role: AgentRole): string[] {
  const practices: Record<AgentRole, string[]> = {
    [AgentRole.ARCHITECT]: [
      'Mantén el diseño simple y escalable',
      'Documenta todas las decisiones importantes',
      'Considera requisitos no funcionales',
      'Aplica principios SOLID',
      'Piensa en la mantenibilidad a largo plazo'
    ],
    [AgentRole.DEVELOPER]: [
      'Escribe código limpio y legible',
      'Sigue las convenciones del proyecto',
      'Implementa tests desde el inicio',
      'Realiza commits frecuentes y descriptivos',
      'Refactoriza cuando sea necesario'
    ],
    [AgentRole.TESTER]: [
      'Diseña casos de prueba completos',
      'Prioriza tests críticos',
      'Automatiza cuando sea posible',
      'Documenta bugs claramente',
      'Mantén alta cobertura de código'
    ],
    [AgentRole.DEBUGGER]: [
      'Reproduce el error consistentemente',
      'Usa debugging sistemático',
      'Documenta la solución claramente',
      'Previene regresiones con tests',
      'Analiza el impacto de los cambios'
    ],
    [AgentRole.DEVOPS]: [
      'Automatiza todo lo posible',
      'Implementa CI/CD desde el inicio',
      'Monitorea proactivamente',
      'Documenta la infraestructura',
      'Planifica para escalabilidad'
    ],
    [AgentRole.ANALYST]: [
      'Define métricas relevantes',
      'Usa datos para decisiones',
      'Comunica insights claramente',
      'Identifica tendencias',
      'Sugiere mejoras accionables'
    ]
  };
  
  return practices[role] || [];
}

/**
 * Tool metadata para registro MCP
 */
export const roleDirectorTool = {
  name: 'role.getCurrentInstructions',
  description: 'Obtiene instrucciones detalladas sobre cómo comportarse según el rol actual y la fase BMAD',
  inputSchema: GetRoleInstructionsSchema,
  handler: getRoleInstructions
};