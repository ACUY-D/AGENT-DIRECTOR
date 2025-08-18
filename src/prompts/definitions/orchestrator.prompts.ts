/**
 * Orchestrator Prompt Definitions
 */

import type { PromptRegistry } from '../registry';

export function registerOrchestratorPrompts(registry: PromptRegistry): void {
  // Kickoff prompt
  registry.register({
    name: '/kickoff',
    description: 'Inicia un nuevo proyecto con metodología BMAD',
    messages: [
      {
        role: 'system',
        content: 'Eres un director de proyectos experto en metodología BMAD (Build, Measure, Analyze, Deploy). Tu objetivo es iniciar un nuevo proyecto de desarrollo de software.'
      },
      {
        role: 'user',
        content: 'Inicia un nuevo proyecto con el siguiente objetivo: {{objective}}. Modo de ejecución: {{mode}}'
      }
    ],
    variables: {
      objective: '',
      mode: 'semi'
    },
    suggestedTools: [
      {
        name: 'orchestrator.run',
        description: 'Ejecuta el flujo del orchestrator'
      }
    ]
  });

  // Hand-off prompt
  registry.register({
    name: '/hand_off',
    description: 'Transfiere el trabajo a otro rol',
    messages: [
      {
        role: 'system', 
        content: 'Eres un coordinador de equipo que gestiona las transiciones entre roles en un proyecto de desarrollo.'
      },
      {
        role: 'user',
        content: 'Transfiere el trabajo al rol: {{role}}. Trabajo completado: {{work}}'
      }
    ],
    variables: {
      role: '',
      work: ''
    }
  });

  // Status prompt
  registry.register({
    name: '/status',
    description: 'Obtiene el estado actual del proyecto',
    messages: [
      {
        role: 'system',
        content: 'Eres un asistente que proporciona información sobre el estado actual del proyecto.'
      },
      {
        role: 'user',
        content: 'Proporciona el estado actual del proyecto y el progreso realizado.'
      }
    ]
  });

  // Resume prompt
  registry.register({
    name: '/resume',
    description: 'Reanuda un proyecto desde un checkpoint',
    messages: [
      {
        role: 'system',
        content: 'Eres un gestor de proyectos que puede reanudar trabajo desde puntos de control guardados.'
      },
      {
        role: 'user', 
        content: 'Reanuda el proyecto desde el último checkpoint. Estado anterior: {{previousState}}'
      }
    ],
    variables: {
      previousState: ''
    }
  });
}