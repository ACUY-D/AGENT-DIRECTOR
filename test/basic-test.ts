/**
 * Test básico del MCP Role Director
 * Verifica que las herramientas funcionan correctamente
 */

import { bmadWorkflowTools } from '../src/tools/bmad.workflow';
import { roleDirectorTool } from '../src/tools/role.director';
import { AgentRole, BMADPhase } from '../src/tools/role.director';
import { roleTransitionTool } from '../src/tools/role.transition';
import { createLogger } from '../src/utils/logger';

const logger = createLogger('test');

/**
 * Test de la herramienta de director de roles
 */
async function testRoleDirector() {
  logger.info('=== Test: Role Director ===');

  try {
    // Probar obtener instrucciones para Developer en BUILD
    const result = await roleDirectorTool.handler({
      role: AgentRole.DEVELOPER,
      phase: BMADPhase.BUILD,
      context: 'Implementando API REST',
    });

    logger.info('Instrucciones para Developer en BUILD:', result);

    // Verificar que contiene los campos esperados
    if (result.role && result.phase && result.instructions) {
      logger.info('✅ Role Director funciona correctamente');
      return true;
    }
    logger.error('❌ Role Director respuesta incompleta');
    return false;
  } catch (error) {
    logger.error('❌ Error en Role Director:', error);
    return false;
  }
}

/**
 * Test de transiciones de rol
 */
async function testRoleTransition() {
  logger.info('=== Test: Role Transition ===');

  try {
    // Probar transición desde Developer
    const result = await roleTransitionTool.handler({
      currentRole: AgentRole.DEVELOPER,
      currentPhase: BMADPhase.BUILD,
      completedTasks: ['API implementada', 'Tests unitarios escritos'],
      issues: [],
    });

    logger.info('Sugerencia de transición:', result);

    // Verificar campos esperados
    if (result.suggestedRole && result.reason && result.confidence) {
      logger.info('✅ Role Transition funciona correctamente');
      return true;
    }
    logger.error('❌ Role Transition respuesta incompleta');
    return false;
  } catch (error) {
    logger.error('❌ Error en Role Transition:', error);
    return false;
  }
}

/**
 * Test del flujo BMAD
 */
async function testBMADWorkflow() {
  logger.info('=== Test: BMAD Workflow ===');

  try {
    // Probar inicio de proyecto
    const startProjectTool = bmadWorkflowTools[0];
    const projectResult = await startProjectTool.handler({
      projectName: 'Test Project',
      projectType: 'api',
      description: 'Proyecto de prueba',
      initialRequirements: ['CRUD usuarios', 'Autenticación'],
    });

    logger.info('Proyecto iniciado:', projectResult);

    // Probar obtener guía de fase
    const phaseGuidanceTool = bmadWorkflowTools[1];
    const phaseResult = await phaseGuidanceTool.handler({
      phase: BMADPhase.BUILD,
      projectContext: {
        projectName: 'Test Project',
        currentProgress: 'Iniciando desarrollo',
      },
    });

    logger.info('Guía de fase BUILD:', phaseResult);

    // Verificar respuestas
    if (projectResult.projectName && phaseResult.phase) {
      logger.info('✅ BMAD Workflow funciona correctamente');
      return true;
    }
    logger.error('❌ BMAD Workflow respuesta incompleta');
    return false;
  } catch (error) {
    logger.error('❌ Error en BMAD Workflow:', error);
    return false;
  }
}

/**
 * Test de integración completa
 */
async function testCompleteFlow() {
  logger.info('=== Test: Flujo Completo ===');

  try {
    // 1. Iniciar proyecto
    const startProjectTool = bmadWorkflowTools[0];
    const project = await startProjectTool.handler({
      projectName: 'E-commerce API',
      projectType: 'api',
      description: 'API para plataforma de e-commerce',
      initialRequirements: ['Gestión de productos', 'Carrito de compras', 'Pagos'],
    });

    logger.info('1. Proyecto iniciado:', project.projectName);

    // 2. Obtener instrucciones para Architect
    const _architectInstructions = await roleDirectorTool.handler({
      role: AgentRole.ARCHITECT,
      phase: BMADPhase.BUILD,
      context: project.description,
    });

    logger.info('2. Instrucciones para Architect recibidas');

    // 3. Transición a Developer
    const toDeveloper = await roleTransitionTool.handler({
      currentRole: AgentRole.ARCHITECT,
      currentPhase: BMADPhase.BUILD,
      completedTasks: ['Arquitectura diseñada', 'APIs definidas'],
      issues: [],
    });

    logger.info('3. Transición sugerida a:', toDeveloper.suggestedRole);

    // 4. Obtener instrucciones para Developer
    const _developerInstructions = await roleDirectorTool.handler({
      role: AgentRole.DEVELOPER,
      phase: BMADPhase.BUILD,
      context: 'Implementando endpoints de productos',
    });

    logger.info('4. Instrucciones para Developer recibidas');

    // 5. Transición a Tester
    const toTester = await roleTransitionTool.handler({
      currentRole: AgentRole.DEVELOPER,
      currentPhase: BMADPhase.BUILD,
      completedTasks: ['Endpoints implementados', 'Tests unitarios'],
      issues: [],
    });

    logger.info('5. Transición sugerida a:', toTester.suggestedRole);

    // 6. Cambiar a fase MEASURE
    const _measurePhase = await bmadWorkflowTools[1].handler({
      phase: BMADPhase.MEASURE,
      projectContext: {
        projectName: 'E-commerce API',
        currentProgress: 'Desarrollo completado, iniciando pruebas',
      },
    });

    logger.info('6. Guía para fase MEASURE recibida');

    logger.info('✅ Flujo completo ejecutado exitosamente');
    return true;
  } catch (error) {
    logger.error('❌ Error en flujo completo:', error);
    return false;
  }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  logger.info('');
  logger.info('=====================================');
  logger.info('    MCP Role Director - Test Suite   ');
  logger.info('=====================================');
  logger.info('');

  const results = {
    roleDirector: false,
    roleTransition: false,
    bmadWorkflow: false,
    completeFlow: false,
  };

  // Ejecutar tests individuales
  results.roleDirector = await testRoleDirector();
  logger.info('');

  results.roleTransition = await testRoleTransition();
  logger.info('');

  results.bmadWorkflow = await testBMADWorkflow();
  logger.info('');

  results.completeFlow = await testCompleteFlow();
  logger.info('');

  // Resumen de resultados
  logger.info('=====================================');
  logger.info('         RESUMEN DE RESULTADOS       ');
  logger.info('=====================================');

  let passed = 0;
  let failed = 0;

  for (const [testName, result] of Object.entries(results)) {
    if (result) {
      logger.info(`✅ ${testName}: PASSED`);
      passed++;
    } else {
      logger.error(`❌ ${testName}: FAILED`);
      failed++;
    }
  }

  logger.info('');
  logger.info(`Total: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    logger.info('🎉 ¡Todos los tests pasaron exitosamente!');
    process.exit(0);
  } else {
    logger.error('⚠️  Algunos tests fallaron');
    process.exit(1);
  }
}

// Ejecutar tests si es el módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch((error) => {
    logger.error('Error fatal en tests:', error);
    process.exit(1);
  });
}

export { runAllTests };
