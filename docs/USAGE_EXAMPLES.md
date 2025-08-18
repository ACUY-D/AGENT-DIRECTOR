# Ejemplos de Uso - MCP Role Director

Este documento proporciona ejemplos prácticos de cómo usar el MCP Role Director con agentes de IA como Cursor, Copilot o Claude.

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Ejemplo 1: Desarrollo de API REST](#ejemplo-1-desarrollo-de-api-rest)
3. [Ejemplo 2: Aplicación Web](#ejemplo-2-aplicación-web)
4. [Ejemplo 3: Debugging de Problemas](#ejemplo-3-debugging-de-problemas)
5. [Ejemplo 4: Pipeline DevOps](#ejemplo-4-pipeline-devops)

## Configuración Inicial

### En Cursor
```json
// .cursor/mcp_config.json
{
  "servers": {
    "role-director": {
      "command": "node",
      "args": ["./mcp-role-director/dist/index.js"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### En Claude Desktop
```json
// claude_desktop_config.json
{
  "mcpServers": {
    "role-director": {
      "command": "node",
      "args": ["./mcp-role-director/dist/index.js"]
    }
  }
}
```

## Ejemplo 1: Desarrollo de API REST

### Escenario
Necesitas desarrollar una API REST para gestión de usuarios con autenticación JWT.

### Flujo de Trabajo

#### 1. Iniciar el Proyecto
```typescript
// Prompt al agente:
"Quiero crear una API REST para gestión de usuarios. Usa el MCP Role Director para guiarme."

// El agente llama:
await mcp.call('workflow.startProject', {
  projectName: 'User Management API',
  projectType: 'api',
  description: 'API REST con autenticación JWT para gestión de usuarios',
  initialRequirements: [
    'CRUD de usuarios',
    'Autenticación JWT',
    'Autorización por roles',
    'Reset de contraseña'
  ]
});
```

#### 2. Fase de Arquitectura
```typescript
// El agente solicita instrucciones para el rol Architect
await mcp.call('role.getCurrentInstructions', {
  role: 'architect',
  phase: 'BUILD',
  context: 'Diseñando arquitectura para API de usuarios con JWT'
});

// Respuesta del MCP:
{
  "role": "architect",
  "phase": "BUILD",
  "instructions": {
    "checklist": [
      "✓ Definir estructura de capas (Controller, Service, Repository)",
      "✓ Diseñar esquema de base de datos",
      "✓ Establecer flujo de autenticación JWT",
      "✓ Definir endpoints REST"
    ],
    "guidelines": [
      "Usar patrón Repository para acceso a datos",
      "Implementar middleware de autenticación",
      "Separar lógica de negocio en servicios"
    ],
    "bestPractices": [
      "Validación de entrada con schemas",
      "Manejo centralizado de errores",
      "Logging estructurado"
    ]
  }
}
```

#### 3. Transición a Developer
```typescript
// Después de completar el diseño
await mcp.call('role.transition', {
  currentRole: 'architect',
  currentPhase: 'BUILD',
  completedTasks: [
    'Diseño de arquitectura completado',
    'Esquema de BD definido',
    'Endpoints documentados'
  ],
  issues: []
});

// Respuesta:
{
  "suggestedRole": "developer",
  "reason": "Arquitectura definida, listo para implementación",
  "confidence": 0.95,
  "nextSteps": [
    "Configurar proyecto Node.js/Express",
    "Implementar modelos de datos",
    "Crear endpoints CRUD"
  ]
}
```

#### 4. Fase de Desarrollo
```typescript
// El agente ahora trabaja como Developer
await mcp.call('role.getCurrentInstructions', {
  role: 'developer',
  phase: 'BUILD',
  context: 'Implementando endpoints de usuarios con Express y JWT'
});

// El agente implementa el código siguiendo las instrucciones...
```

## Ejemplo 2: Aplicación Web

### Escenario
Desarrollo de una aplicación web de e-commerce con React y Node.js.

### Flujo Completo

```typescript
// 1. INICIO - Rol: Architect, Fase: BUILD
const project = await mcp.call('workflow.startProject', {
  projectName: 'E-Commerce Platform',
  projectType: 'web',
  description: 'Plataforma de e-commerce con carrito y pagos',
  initialRequirements: [
    'Catálogo de productos',
    'Carrito de compras',
    'Procesamiento de pagos',
    'Panel de administración'
  ]
});

// 2. ARQUITECTURA
const archInstructions = await mcp.call('role.getCurrentInstructions', {
  role: 'architect',
  phase: 'BUILD',
  context: 'Frontend React + Backend Node.js'
});

// 3. DESARROLLO FRONTEND
await mcp.call('role.transition', {
  currentRole: 'architect',
  currentPhase: 'BUILD',
  completedTasks: ['Arquitectura definida'],
  issues: []
});

// 4. TESTING - Cambio a fase MEASURE
await mcp.call('bmad.getPhaseGuidance', {
  phase: 'MEASURE',
  projectContext: {
    projectName: 'E-Commerce Platform',
    currentProgress: 'Componentes React implementados'
  }
});

// 5. ROL TESTER
const testerInstructions = await mcp.call('role.getCurrentInstructions', {
  role: 'tester',
  phase: 'MEASURE',
  context: 'Testing de componentes React y API endpoints'
});

// 6. ANÁLISIS - Fase ANALYZE
await mcp.call('role.getCurrentInstructions', {
  role: 'analyst',
  phase: 'ANALYZE',
  context: 'Analizando métricas de rendimiento y UX'
});

// 7. DEPLOYMENT - Fase DEPLOY
await mcp.call('role.getCurrentInstructions', {
  role: 'devops',
  phase: 'DEPLOY',
  context: 'Configurando CI/CD con GitHub Actions'
});
```

## Ejemplo 3: Debugging de Problemas

### Escenario
La aplicación tiene problemas de rendimiento en producción.

### Flujo de Debugging

```typescript
// 1. Identificar el problema
await mcp.call('role.getCurrentInstructions', {
  role: 'debugger',
  phase: 'ANALYZE',
  context: 'API responde lentamente, timeouts frecuentes'
});

// Respuesta con checklist de debugging:
{
  "instructions": {
    "debuggingProcess": [
      "1. Reproducir el error en ambiente controlado",
      "2. Recolectar logs y métricas",
      "3. Analizar queries lentas en BD",
      "4. Revisar memory leaks",
      "5. Profiling de código"
    ],
    "tools": [
      "Chrome DevTools para frontend",
      "Node.js profiler para backend",
      "Query analyzer para BD"
    ]
  }
}

// 2. Transición basada en hallazgos
await mcp.call('role.transition', {
  currentRole: 'debugger',
  currentPhase: 'ANALYZE',
  completedTasks: ['Problema identificado: N+1 queries'],
  issues: ['Queries ineficientes en ORM']
});

// Respuesta:
{
  "suggestedRole": "developer",
  "reason": "Causa raíz identificada, necesita optimización de código",
  "nextSteps": [
    "Implementar eager loading",
    "Agregar índices a BD",
    "Cachear resultados frecuentes"
  ]
}
```

## Ejemplo 4: Pipeline DevOps

### Escenario
Configurar pipeline CI/CD completo para el proyecto.

### Implementación

```typescript
// 1. Iniciar en rol DevOps
await mcp.call('role.getCurrentInstructions', {
  role: 'devops',
  phase: 'DEPLOY',
  context: 'Configurando pipeline CI/CD con Docker y Kubernetes'
});

// 2. Obtener guía específica de la fase DEPLOY
await mcp.call('bmad.getPhaseGuidance', {
  phase: 'DEPLOY',
  projectContext: {
    projectName: 'User Management API',
    currentProgress: 'Tests pasando, listo para deployment'
  }
});

// Respuesta estructurada:
{
  "phase": "DEPLOY",
  "activities": [
    "Crear Dockerfile multi-stage",
    "Configurar GitHub Actions workflow",
    "Definir Kubernetes manifests",
    "Configurar secrets y ConfigMaps",
    "Implementar health checks",
    "Configurar monitoring con Prometheus"
  ],
  "deliverables": [
    "Pipeline CI/CD funcional",
    "Documentación de deployment",
    "Runbooks operacionales"
  ]
}

// 3. Después del deployment, analizar métricas
await mcp.call('role.transition', {
  currentRole: 'devops',
  currentPhase: 'DEPLOY',
  completedTasks: [
    'Pipeline configurado',
    'Deployment exitoso',
    'Monitoring activo'
  ],
  issues: []
});

// Sugerencia: Transición a Analyst para análisis post-deployment
{
  "suggestedRole": "analyst",
  "reason": "Deployment completado, analizar métricas iniciales",
  "nextSteps": [
    "Monitorear métricas de rendimiento",
    "Analizar logs de errores",
    "Evaluar uso de recursos"
  ]
}
```

## 🔄 Ciclo Completo BMAD

### Ejemplo de un ciclo completo por todas las fases:

```typescript
// BUILD → MEASURE → ANALYZE → DEPLOY

// 1. BUILD (Architect + Developer)
const buildPhase = {
  architect: await mcp.call('role.getCurrentInstructions', {
    role: 'architect',
    phase: 'BUILD'
  }),
  developer: await mcp.call('role.getCurrentInstructions', {
    role: 'developer',
    phase: 'BUILD'
  })
};

// 2. MEASURE (Tester)
const measurePhase = await mcp.call('role.getCurrentInstructions', {
  role: 'tester',
  phase: 'MEASURE',
  context: 'Ejecutando suite completa de tests'
});

// 3. ANALYZE (Analyst + Debugger)
const analyzePhase = {
  analyst: await mcp.call('role.getCurrentInstructions', {
    role: 'analyst',
    phase: 'ANALYZE'
  }),
  debugger: await mcp.call('role.getCurrentInstructions', {
    role: 'debugger',
    phase: 'ANALYZE'
  })
};

// 4. DEPLOY (DevOps)
const deployPhase = await mcp.call('role.getCurrentInstructions', {
  role: 'devops',
  phase: 'DEPLOY',
  context: 'Preparando release v1.0.0'
});

// El ciclo se repite para nuevas features o mejoras
```

## 💡 Tips y Mejores Prácticas

### 1. Usa el contexto apropiado
Siempre proporciona contexto relevante al solicitar instrucciones:
```typescript
// ✅ Bueno
await mcp.call('role.getCurrentInstructions', {
  role: 'developer',
  phase: 'BUILD',
  context: 'Implementando autenticación OAuth2 con Google'
});

// ❌ Muy genérico
await mcp.call('role.getCurrentInstructions', {
  role: 'developer',
  phase: 'BUILD',
  context: 'Programando'
});
```

### 2. Sigue las transiciones sugeridas
El sistema sugiere transiciones basadas en el progreso:
```typescript
// Siempre proporciona tareas completadas para mejores sugerencias
await mcp.call('role.transition', {
  currentRole: 'developer',
  currentPhase: 'BUILD',
  completedTasks: [
    'API endpoints implementados',
    'Validación agregada',
    'Tests unitarios escritos'
  ],
  issues: []
});
```

### 3. Documenta problemas encontrados
Incluye issues para obtener mejores recomendaciones:
```typescript
await mcp.call('role.transition', {
  currentRole: 'tester',
  currentPhase: 'MEASURE',
  completedTasks: ['Tests ejecutados'],
  issues: [
    'Tests de integración fallando',
    'Cobertura menor al 70%'
  ]
});
// Sugerirá transición a Debugger o Developer según el caso
```

### 4. Aprovecha los checklists
Cada rol proporciona checklists específicos:
```typescript
const instructions = await mcp.call('role.getCurrentInstructions', {
  role: 'architect',
  phase: 'BUILD'
});

// Usa el checklist como guía:
instructions.checklist.entry   // Verificaciones antes de empezar
instructions.checklist.execution // Pasos durante la ejecución
instructions.checklist.exit    // Validaciones antes de terminar
```

## 📚 Recursos Adicionales

- [README Principal](../README.md)
- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [Guía de Contribución](./CONTRIBUTING.md)
- [API Reference](./API.md)

---

**Nota**: Estos ejemplos muestran cómo el MCP Role Director guía al agente de IA. El agente mantiene sus propias capacidades de ejecución mientras el MCP proporciona estructura metodológica y mejores prácticas.