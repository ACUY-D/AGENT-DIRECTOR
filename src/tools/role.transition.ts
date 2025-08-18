/**
 * Role Transition Tool
 * Gestiona las transiciones entre roles según el trabajo completado y la fase BMAD
 */

import { z } from 'zod';
import { createLogger } from '../utils/logger';
import { AgentRole, BMADPhase } from './role.director';

const logger = createLogger('role-transition');

/**
 * Schema de entrada para transición de rol
 */
export const RoleTransitionInputSchema = z.object({
  currentRole: z.nativeEnum(AgentRole),
  currentPhase: z.nativeEnum(BMADPhase),
  completedWork: z.object({
    description: z.string(),
    artifacts: z.array(z.string()).optional(),
    metrics: z.record(z.unknown()).optional(),
    issues: z.array(z.string()).optional()
  })
});

/**
 * Schema de salida con información de transición
 */
export const RoleTransitionOutputSchema = z.object({
  nextRole: z.nativeEnum(AgentRole),
  nextPhase: z.nativeEnum(BMADPhase),
  reason: z.string(),
  handoffInstructions: z.string(),
  requiredArtifacts: z.array(z.string()).optional(),
  transitionCriteria: z.array(z.string()).optional()
});

export type RoleTransitionInput = z.infer<typeof RoleTransitionInputSchema>;
export type RoleTransitionOutput = z.infer<typeof RoleTransitionOutputSchema>;

/**
 * Matriz de transiciones entre roles
 */
const ROLE_TRANSITIONS: Record<BMADPhase, Record<AgentRole, { next: AgentRole, condition?: (work: any) => boolean }>> = {
  [BMADPhase.BUILD]: {
    [AgentRole.ARCHITECT]: { 
      next: AgentRole.DEVELOPER,
      condition: (work) => work.artifacts?.includes('PLAN.md') || work.artifacts?.includes('ARCH.md')
    },
    [AgentRole.DEVELOPER]: { 
      next: AgentRole.TESTER,
      condition: (work) => work.description.includes('implementado') || work.description.includes('código')
    },
    [AgentRole.TESTER]: { 
      next: AgentRole.DEBUGGER,
      condition: (work) => work.issues && work.issues.length > 0
    },
    [AgentRole.DEBUGGER]: { 
      next: AgentRole.TESTER 
    },
    [AgentRole.DEVOPS]: { 
      next: AgentRole.DEVELOPER 
    },
    [AgentRole.ANALYST]: { 
      next: AgentRole.ARCHITECT 
    }
  },
  [BMADPhase.MEASURE]: {
    [AgentRole.ARCHITECT]: { next: AgentRole.ANALYST },
    [AgentRole.DEVELOPER]: { next: AgentRole.TESTER },
    [AgentRole.TESTER]: { next: AgentRole.ANALYST },
    [AgentRole.DEBUGGER]: { next: AgentRole.ANALYST },
    [AgentRole.DEVOPS]: { next: AgentRole.ANALYST },
    [AgentRole.ANALYST]: { next: AgentRole.ARCHITECT }
  },
  [BMADPhase.ANALYZE]: {
    [AgentRole.ARCHITECT]: { next: AgentRole.DEVELOPER },
    [AgentRole.DEVELOPER]: { next: AgentRole.ARCHITECT },
    [AgentRole.TESTER]: { next: AgentRole.DEBUGGER },
    [AgentRole.DEBUGGER]: { next: AgentRole.DEVELOPER },
    [AgentRole.DEVOPS]: { next: AgentRole.ARCHITECT },
    [AgentRole.ANALYST]: { next: AgentRole.ARCHITECT }
  },
  [BMADPhase.DEPLOY]: {
    [AgentRole.ARCHITECT]: { next: AgentRole.DEVOPS },
    [AgentRole.DEVELOPER]: { next: AgentRole.DEVOPS },
    [AgentRole.TESTER]: { next: AgentRole.DEVOPS },
    [AgentRole.DEBUGGER]: { next: AgentRole.DEVOPS },
    [AgentRole.DEVOPS]: { next: AgentRole.TESTER },
    [AgentRole.ANALYST]: { next: AgentRole.DEVOPS }
  }
};

/**
 * Determinar la siguiente fase BMAD basado en el progreso
 */
function determineNextPhase(currentPhase: BMADPhase, completedWork: any): BMADPhase {
  // Lógica para determinar si debemos cambiar de fase
  const phaseTransitions: Record<BMADPhase, () => BMADPhase> = {
    [BMADPhase.BUILD]: () => {
      // Transición a MEASURE cuando el build esté completo
      if (completedWork.description.includes('completo') || 
          completedWork.description.includes('finalizado') ||
          completedWork.description.includes('tests pasan')) {
        return BMADPhase.MEASURE;
      }
      return BMADPhase.BUILD;
    },
    [BMADPhase.MEASURE]: () => {
      // Transición a ANALYZE cuando las métricas estén recopiladas
      if (completedWork.metrics && Object.keys(completedWork.metrics).length > 0) {
        return BMADPhase.ANALYZE;
      }
      return BMADPhase.MEASURE;
    },
    [BMADPhase.ANALYZE]: () => {
      // Transición a DEPLOY cuando el análisis esté completo
      if (completedWork.description.includes('análisis completo') ||
          completedWork.description.includes('mejoras identificadas')) {
        return BMADPhase.DEPLOY;
      }
      return BMADPhase.ANALYZE;
    },
    [BMADPhase.DEPLOY]: () => {
      // El deploy es la fase final, pero puede volver a BUILD para iteraciones
      if (completedWork.description.includes('desplegado') ||
          completedWork.description.includes('producción')) {
        return BMADPhase.BUILD; // Nueva iteración
      }
      return BMADPhase.DEPLOY;
    }
  };
  
  return phaseTransitions[currentPhase]();
}

/**
 * Generar instrucciones de handoff entre roles
 */
function generateHandoffInstructions(
  currentRole: AgentRole,
  nextRole: AgentRole,
  currentPhase: BMADPhase,
  completedWork: any
): string {
  const handoffTemplates: Record<string, string> = {
    [`${AgentRole.ARCHITECT}-${AgentRole.DEVELOPER}`]: 
      `El Arquitecto ha completado el diseño. Como Desarrollador, toma el PLAN.md y ARCH.md para implementar la solución. 
       Asegúrate de seguir los patrones arquitectónicos definidos y las decisiones técnicas documentadas.`,
    
    [`${AgentRole.DEVELOPER}-${AgentRole.TESTER}`]: 
      `El Desarrollador ha completado la implementación. Como Tester, valida el código con pruebas exhaustivas. 
       Verifica la funcionalidad, rendimiento y cobertura de tests. Documenta cualquier issue encontrado.`,
    
    [`${AgentRole.TESTER}-${AgentRole.DEBUGGER}`]: 
      `El Tester ha encontrado issues. Como Debugger, analiza los problemas reportados: ${completedWork.issues?.join(', ')}. 
       Encuentra la causa raíz, implementa correcciones y asegura que no se introduzcan regresiones.`,
    
    [`${AgentRole.DEBUGGER}-${AgentRole.TESTER}`]: 
      `El Debugger ha aplicado correcciones. Como Tester, re-ejecuta las pruebas para validar los fixes. 
       Asegúrate de que los problemas anteriores están resueltos y no hay nuevas regresiones.`,
    
    [`${AgentRole.TESTER}-${AgentRole.ANALYST}`]: 
      `Las pruebas están completas. Como Analyst, recopila y analiza todas las métricas del proyecto. 
       Genera insights sobre calidad, rendimiento y áreas de mejora.`,
    
    [`${AgentRole.ANALYST}-${AgentRole.ARCHITECT}`]: 
      `El análisis está completo. Como Arquitecto, revisa las métricas y recomendaciones. 
       Determina si son necesarios ajustes arquitectónicos basados en los insights.`,
    
    [`${AgentRole.DEVELOPER}-${AgentRole.DEVOPS}`]: 
      `El código está listo para despliegue. Como DevOps, prepara el entorno de producción, 
       configura el pipeline de despliegue y ejecuta el release siguiendo las mejores prácticas.`,
    
    [`${AgentRole.DEVOPS}-${AgentRole.TESTER}`]: 
      `El despliegue está completo. Como Tester, ejecuta pruebas de aceptación en producción. 
       Valida que todo funciona correctamente en el entorno real.`
  };
  
  const key = `${currentRole}-${nextRole}`;
  return handoffTemplates[key] || 
    `Transición de ${currentRole} a ${nextRole} en fase ${currentPhase}. 
     El trabajo completado fue: ${completedWork.description}. 
     Continúa con las responsabilidades del rol ${nextRole}.`;
}

/**
 * Determinar artefactos requeridos para la transición
 */
function getRequiredArtifacts(nextRole: AgentRole, nextPhase: BMADPhase): string[] {
  const artifactRequirements: Record<AgentRole, string[]> = {
    [AgentRole.ARCHITECT]: ['requirements.md', 'constraints.md'],
    [AgentRole.DEVELOPER]: ['PLAN.md', 'ARCH.md', 'TECH-SPEC.md'],
    [AgentRole.TESTER]: ['source code', 'unit tests', 'test plan'],
    [AgentRole.DEBUGGER]: ['bug reports', 'error logs', 'stack traces'],
    [AgentRole.DEVOPS]: ['build artifacts', 'deployment scripts', 'configuration files'],
    [AgentRole.ANALYST]: ['metrics data', 'test results', 'performance logs']
  };
  
  return artifactRequirements[nextRole] || [];
}

/**
 * Obtener criterios de transición
 */
function getTransitionCriteria(currentRole: AgentRole, nextRole: AgentRole): string[] {
  const criteria: Record<string, string[]> = {
    [`${AgentRole.ARCHITECT}-${AgentRole.DEVELOPER}`]: [
      'Diseño arquitectónico completo',
      'Decisiones técnicas documentadas',
      'Plan de trabajo definido'
    ],
    [`${AgentRole.DEVELOPER}-${AgentRole.TESTER}`]: [
      'Código implementado',
      'Tests unitarios escritos',
      'Documentación actualizada'
    ],
    [`${AgentRole.TESTER}-${AgentRole.DEBUGGER}`]: [
      'Issues identificados',
      'Bugs documentados',
      'Prioridades establecidas'
    ],
    [`${AgentRole.DEBUGGER}-${AgentRole.TESTER}`]: [
      'Fixes aplicados',
      'Código actualizado',
      'Documentación de cambios'
    ]
  };
  
  const key = `${currentRole}-${nextRole}`;
  return criteria[key] || ['Trabajo actual completado', 'Artefactos generados', 'Listo para siguiente fase'];
}

/**
 * Procesar transición de rol
 */
export async function processRoleTransition(input: RoleTransitionInput): Promise<RoleTransitionOutput> {
  const { currentRole, currentPhase, completedWork } = input;
  
  logger.info(`Procesando transición desde ${currentRole} en fase ${currentPhase}`);
  
  // Determinar siguiente fase
  const nextPhase = determineNextPhase(currentPhase, completedWork);
  
  // Obtener siguiente rol según la matriz de transiciones
  const transitionConfig = ROLE_TRANSITIONS[nextPhase][currentRole];
  
  if (!transitionConfig) {
    throw new Error(`No hay transición definida desde ${currentRole} en fase ${nextPhase}`);
  }
  
  // Verificar condición de transición si existe
  let nextRole = transitionConfig.next;
  if (transitionConfig.condition && !transitionConfig.condition(completedWork)) {
    // Si la condición no se cumple, mantener el rol actual
    nextRole = currentRole;
  }
  
  // Si hay issues reportados y no estamos en rol de debugger, transicionar a debugger
  if (completedWork.issues && completedWork.issues.length > 0 && currentRole !== AgentRole.DEBUGGER) {
    nextRole = AgentRole.DEBUGGER;
  }
  
  // Generar razón de la transición
  const reason = generateTransitionReason(currentRole, nextRole, currentPhase, nextPhase, completedWork);
  
  // Generar instrucciones de handoff
  const handoffInstructions = generateHandoffInstructions(currentRole, nextRole, nextPhase, completedWork);
  
  // Obtener artefactos requeridos
  const requiredArtifacts = getRequiredArtifacts(nextRole, nextPhase);
  
  // Obtener criterios de transición
  const transitionCriteria = getTransitionCriteria(currentRole, nextRole);
  
  logger.info(`Transición determinada: ${currentRole} -> ${nextRole}, Fase: ${currentPhase} -> ${nextPhase}`);
  
  return {
    nextRole,
    nextPhase,
    reason,
    handoffInstructions,
    requiredArtifacts,
    transitionCriteria
  };
}

/**
 * Generar razón de la transición
 */
function generateTransitionReason(
  currentRole: AgentRole,
  nextRole: AgentRole,
  currentPhase: BMADPhase,
  nextPhase: BMADPhase,
  completedWork: any
): string {
  let reason = '';
  
  // Cambio de fase
  if (currentPhase !== nextPhase) {
    reason = `Fase ${currentPhase} completada, avanzando a fase ${nextPhase}. `;
  }
  
  // Cambio de rol
  if (currentRole !== nextRole) {
    if (completedWork.issues && completedWork.issues.length > 0) {
      reason += `Se encontraron issues que requieren atención del ${nextRole}. `;
    } else {
      reason += `${currentRole} ha completado su trabajo, es turno del ${nextRole}. `;
    }
  } else {
    reason += `Continuando como ${currentRole} en la nueva fase. `;
  }
  
  // Agregar contexto del trabajo completado
  reason += `Trabajo completado: "${completedWork.description}".`;
  
  return reason;
}

/**
 * Tool metadata para registro MCP
 */
export const roleTransitionTool = {
  name: 'role.transition',
  description: 'Determina el siguiente rol y fase basado en el trabajo completado',
  inputSchema: RoleTransitionInputSchema,
  handler: processRoleTransition
};